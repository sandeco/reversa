import { existsSync, readdirSync, rmdirSync, rmSync, unlinkSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { checkExistingInstallation } from '../installer/validator.js';
import { loadManifest, fileStatus } from '../installer/manifest.js';

export function buildUninstallPlan(projectRoot, state, manifest) {
  const managedDirs = [];
  const managedFiles = new Set(Object.keys(manifest));
  for (const relPath of state.created_files ?? []) {
    const absPath = join(projectRoot, relPath);
    if (existsSync(absPath) && statSync(absPath).isDirectory()) managedDirs.push(relPath);
    else managedFiles.add(relPath);
  }
  managedFiles.add('.reversa/_config/files-manifest.json');
  const toRemove = [];
  const modifiedFiles = [];
  for (const relPath of managedFiles) {
    const hash = manifest[relPath];
    if (hash && fileStatus(projectRoot, relPath, hash) === 'modified') {
      modifiedFiles.push(relPath);
      continue;
    }
    const absPath = join(projectRoot, relPath);
    if (existsSync(absPath) && !statSync(absPath).isDirectory()) toRemove.push(relPath);
  }
  return { toRemove, modifiedFiles, managedDirs };
}

function pruneEmpty(dirPath) {
  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) return;
  for (const name of readdirSync(dirPath)) {
    const child = join(dirPath, name);
    if (statSync(child).isDirectory()) pruneEmpty(child);
  }
  if (readdirSync(dirPath).length === 0) rmdirSync(dirPath);
}

export function removeManagedArtifacts(projectRoot, plan, onError = () => {}) {
  let removed = 0;
  let errors = 0;
  for (const relPath of plan.toRemove) {
    try {
      const absPath = join(projectRoot, relPath);
      if (existsSync(absPath) && !statSync(absPath).isDirectory()) {
        unlinkSync(absPath);
        removed++;
      }
    } catch {
      errors++;
      onError(relPath);
    }
  }
  for (const relPath of plan.managedDirs.sort((a, b) => b.length - a.length)) {
    try { pruneEmpty(join(projectRoot, relPath)); } catch { /* preserve on uncertainty */ }
  }
  try { pruneEmpty(join(projectRoot, '.reversa')); } catch { /* preserve on uncertainty */ }
  return { removed, errors };
}

export default async function uninstall(args) {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');

  const projectRoot = resolve(process.cwd());

  console.log(chalk.bold('\n  Reversa: Uninstall\n'));

  const existing = checkExistingInstallation(projectRoot);
  if (!existing.installed) {
    console.log(chalk.yellow('  Reversa is not installed in this directory.\n'));
    return;
  }

  const state = existing.state;
  const outputFolder = state.output_folder ?? '_reversa_sdd';

  // Classificar arquivos via manifest
  const manifest = loadManifest(projectRoot);
  const plan = buildUninstallPlan(projectRoot, state, manifest);
  const { toRemove, modifiedFiles } = plan;

  // Separar em categorias para exibição
  const skillEntries = toRemove.filter(f => f.replace(/\\/g, '/').includes('skills'));
  const entryFiles   = toRemove.filter(f =>
    ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md', '.cursorrules', '.windsurfrules', '.gitignore']
      .some(name => f.endsWith(name))
  );
  const otherFiles   = toRemove.filter(f => !skillEntries.includes(f) && !entryFiles.includes(f));

  console.log('  Files to be removed:\n');

  if (entryFiles.length > 0) {
    console.log(chalk.bold('  Entry files:'));
    entryFiles.forEach(f => console.log(chalk.red(`    ✗  ${f}`)));
  }
  if (skillEntries.length > 0) {
    const skillDirs = [...new Set(skillEntries.map(f =>
      f.replace(/\\/g, '/').split('/').slice(0, 3).join('/')
    ))];
    console.log(chalk.bold(`\n  Skills:`));
    skillDirs.forEach(d => console.log(chalk.red(`    ✗  ${d}/`)));
  }
  if (otherFiles.length > 0) {
    console.log(chalk.bold('\n  Other:'));
    otherFiles.forEach(f => console.log(chalk.red(`    ✗  ${f}`)));
  }

  console.log(chalk.bold('\n  Folders:'));
  console.log(chalk.red('    ✗  .reversa/ (only if empty; user files are preserved)'));

  const outputDir = join(projectRoot, outputFolder);
  const hasOutputDir = existsSync(outputDir);
  if (hasOutputDir) {
    console.log(chalk.yellow(`    ?  ${outputFolder}/  (asked separately)`));
  }

  // Warn about modified files
  if (modifiedFiles.length > 0) {
    console.log(chalk.yellow(`\n  ${modifiedFiles.length} file(s) modified by you will be kept:`));
    modifiedFiles.forEach(f => console.log(chalk.gray(`    ✎  ${f}`)));
  }

  console.log('');

  // Confirmação explícita
  const { confirmed } = await inquirer.prompt([{
    prefix: '',
    type: 'input',
    name: 'confirmed',
    message: `\nType ${chalk.red('"remove"')} to confirm uninstallation:`,
    validate: (v) => v === 'remove' || 'Type exactly "remove" to confirm.',
  }]);

  if (confirmed !== 'remove') {
    console.log(chalk.gray('\n  Uninstallation cancelled.\n'));
    return;
  }

  const { errors } = removeManagedArtifacts(projectRoot, plan, (relPath) => {
    console.error(chalk.red(`    Error removing: ${relPath}`));
  });

  // Pasta de saída — perguntar separadamente
  if (hasOutputDir) {
    console.log('');
    const { removeOutput } = await inquirer.prompt([{
      prefix: '',
      type: 'confirm',
      name: 'removeOutput',
      message: `\nAlso remove the specifications folder ${chalk.cyan(outputFolder + '/')}?`,
      default: false,
    }]);
    if (removeOutput) {
      try {
        rmSync(outputDir, { recursive: true, force: true });
        console.log(chalk.red(`  ✗  ${outputFolder}/ removed.`));
      } catch {
        console.error(chalk.red(`  Error removing ${outputFolder}/`));
      }
    } else {
      console.log(chalk.gray(`  → ${outputFolder}/ kept.`));
    }
  }

  console.log('');
  if (errors === 0) {
    console.log(chalk.hex('#ffa203')('  Reversa removed successfully.\n'));
  } else {
    console.log(chalk.yellow(`  Completed with ${errors} error(s). Check the files above.\n`));
  }
}
