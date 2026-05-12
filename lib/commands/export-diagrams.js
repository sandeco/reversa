import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, resolve, isAbsolute, relative } from 'path';
import { execFileSync } from 'child_process';
import { tmpdir } from 'os';
import { readJsonSafe } from '../utils/json-safe.js';

const MMDC_TIMEOUT_MS = 60_000;

export default async function exportDiagrams(args) {
  const { default: chalk } = await import('chalk');
  const { default: ora } = await import('ora');

  const format = args.find(a => a.startsWith('--format='))?.split('=')[1] || 'svg';
  const customOutput = args.find(a => a.startsWith('--output='))?.split('=')[1];

  if (!['svg', 'png'].includes(format)) {
    console.error(chalk.red(`\n  Invalid format: "${format}". Use --format=svg or --format=png\n`));
    process.exit(1);
  }

  const mmdc = findMmdc();
  if (!mmdc) {
    console.log(chalk.yellow('\n  @mermaid-js/mermaid-cli not found.'));
    console.log('  Install with: ' + chalk.bold('npm install -g @mermaid-js/mermaid-cli'));
    console.log('  Then run: ' + chalk.bold('npx reversa export-diagrams\n'));
    process.exit(1);
  }

  const statePath = join(process.cwd(), '.reversa', 'state.json');
  if (!existsSync(statePath)) {
    console.log(chalk.yellow('\n  Reversa is not installed in this directory.'));
    console.log('  Run ' + chalk.bold('npx reversa install') + ' to install.\n');
    return;
  }

  const state = readJsonSafe(statePath);
  const outputFolder = state.output_folder || '_reversa_sdd';
  const sddPath = join(process.cwd(), outputFolder);

  if (!existsSync(sddPath)) {
    console.log(chalk.yellow(`\n  Output folder not found: ${outputFolder}`));
    console.log('  Run the agents first to generate the artifacts.\n');
    return;
  }

  let diagramsDir;
  try {
    diagramsDir = customOutput
      ? resolveOutputDir(customOutput)
      : join(sddPath, 'diagrams');
  } catch (err) {
    console.error(chalk.red(`\n  ${err.message}\n`));
    process.exit(1);
  }

  mkdirSync(diagramsDir, { recursive: true });

  const spinner = ora(`Looking for diagrams in ${outputFolder}...`).start();
  const mdFiles = findMdFiles(sddPath);
  const blocks = [];

  for (const file of mdFiles) {
    const content = readFileSync(file, 'utf8');
    const found = extractMermaidBlocks(content);
    if (found.length > 0) {
      const rel = file.replace(sddPath, '').replace(/\\/g, '/').replace(/^\//, '');
      found.forEach((diagram, i) => blocks.push({ diagram, source: rel, index: i }));
    }
  }

  if (blocks.length === 0) {
    spinner.warn('No Mermaid diagrams found. Run the agents first.');
    console.log();
    return;
  }

  spinner.succeed(`${blocks.length} diagram(s) found.`);
  console.log();

  let success = 0;
  let failed = 0;

  for (const { diagram, source, index } of blocks) {
    const baseName = source
      .replace(/\.md$/, '')
      .replace(/\//g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '_');
    const countForSource = blocks.filter(b => b.source === source).length;
    const suffix = countForSource > 1 ? `-${index + 1}` : '';
    const outName = `${baseName}${suffix}.${format}`;
    const outPath = join(diagramsDir, outName);
    const tmpFile = join(tmpdir(), `reversa-${Date.now()}-${index}.mmd`);
    const spin = ora(`  Exporting ${outName}...`).start();

    try {
      writeFileSync(tmpFile, diagram, 'utf8');
      runMmdc(mmdc, ['-i', tmpFile, '-o', outPath]);
      spin.succeed(chalk.hex('#ffa203')(`  ✓ ${outName}`));
      success++;
    } catch (err) {
      const detail = err.stderr?.toString().split('\n')[0] || err.message;
      spin.fail(chalk.red(`  ✗ ${outName}: ${detail}`));
      failed++;
    } finally {
      try { unlinkSync(tmpFile); } catch {}
    }
  }

  console.log();
  console.log(chalk.bold('  Export complete:'));
  console.log(`  ${chalk.hex('#ffa203')(success + ' exported')}${failed > 0 ? '  ' + chalk.red(failed + ' error(s)') : ''}`);
  console.log(`  Folder: ${chalk.cyan(diagramsDir)}\n`);
}

function resolveOutputDir(customOutput) {
  if (/[\n\r\0]/.test(customOutput)) {
    throw new Error('Invalid --output: contains control characters');
  }

  const target = isAbsolute(customOutput)
    ? resolve(customOutput)
    : resolve(process.cwd(), customOutput);

  const rel = relative(process.cwd(), target);
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error(`Invalid --output: path must stay inside the project (${target})`);
  }

  return target;
}

function runMmdc(mmdc, extraArgs) {
  execFileSync(mmdc.command, [...mmdc.prefixArgs, ...extraArgs], {
    stdio: 'pipe',
    shell: mmdc.shell,
    timeout: MMDC_TIMEOUT_MS,
    cwd: process.cwd(),
    windowsHide: true,
  });
}

function findMmdc() {
  const localJs = join(process.cwd(), 'node_modules', '@mermaid-js', 'mermaid-cli', 'src', 'cli.js');
  if (existsSync(localJs)) {
    return { command: process.execPath, prefixArgs: [localJs], shell: false };
  }

  const localBin = join(process.cwd(), 'node_modules', '.bin', 'mmdc');
  if (process.platform === 'win32') {
    const localCmd = localBin + '.cmd';
    if (existsSync(localCmd)) {
      return { command: localCmd, prefixArgs: [], shell: true };
    }
  }
  if (existsSync(localBin)) {
    return { command: localBin, prefixArgs: [], shell: false };
  }

  try {
    const finder = process.platform === 'win32' ? 'where' : 'which';
    const out = execFileSync(finder, ['mmdc'], { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim().split(/\r?\n/)[0];
    if (out && existsSync(out)) {
      const isWinScript = process.platform === 'win32' && /\.(cmd|bat)$/i.test(out);
      return { command: out, prefixArgs: [], shell: isWinScript };
    }
  } catch {}

  return null;
}

function findMdFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findMdFiles(full));
    } else if (entry.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function extractMermaidBlocks(content) {
  const regex = /```mermaid\n([\s\S]*?)```/g;
  const blocks = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}
