// `npx reversa add-hooks [--engine <id>] [--yes]`
//
// Installs Chronicler hooks for the chosen engine.
// - Copies the runner to .reversa/_hooks/runner.js (project-local, no global state)
// - Calls the engine generator to produce config files
// - Shows a preview, asks confirmation (unless --yes), then writes
// - Tracks created/modified files in state.created_files for clean uninstall

import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkExistingInstallation } from '../installer/validator.js';
import { findGenerator, listSupportedEngines } from '../installer/hooks/index.js';
import { applyOrangeTheme, ORANGE_PREFIX } from '../installer/orange-prompts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const RUNNER_SRC = join(REPO_ROOT, 'lib', 'installer', 'hooks', 'runner.js');
const RUNNER_DEST_REL = join('.reversa', '_hooks', 'runner.js');

function parseArgs(args) {
  const out = { engine: null, yes: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--engine' || a === '-e') out.engine = args[++i];
    else if (a.startsWith('--engine=')) out.engine = a.slice('--engine='.length);
    else if (a === '--yes' || a === '-y') out.yes = true;
  }
  return out;
}

function copyRunner(projectRoot) {
  const dest = join(projectRoot, RUNNER_DEST_REL);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(RUNNER_SRC, dest);
  return dest;
}

function appendCreatedFiles(projectRoot, paths) {
  const statePath = join(projectRoot, '.reversa', 'state.json');
  if (!existsSync(statePath)) return;
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  const rels = paths.map((p) => relative(projectRoot, p));
  state.created_files = [...new Set([...(state.created_files ?? []), ...rels])];
  writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
}

export default async function addHooks(args) {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');
  applyOrangeTheme();

  const opts = parseArgs(args);
  const projectRoot = resolve(process.cwd());
  const orange = chalk.hex('#ffa203');

  console.log(chalk.bold('\n  Reversa: Add Hooks\n'));

  const existing = checkExistingInstallation(projectRoot);
  if (!existing.installed) {
    console.log(chalk.yellow('  Reversa is not installed in this directory.'));
    console.log('  Run ' + chalk.bold('npx reversa install') + ' first.\n');
    return;
  }

  let engineId = opts.engine;
  if (!engineId) {
    const supported = listSupportedEngines();
    if (supported.length === 0) {
      console.log(chalk.red('  No hook generators available.\n'));
      return;
    }
    const { selected } = await inquirer.prompt([{
      prefix: ORANGE_PREFIX,
      type: 'list',
      name: 'selected',
      message: 'Engine to install hooks for:',
      loop: false,
      choices: supported.map((s) => ({ name: `${s.name} — ${s.describe}`, value: s.id })),
    }]);
    engineId = selected;
  }

  const generator = findGenerator(engineId);
  if (!generator) {
    console.log(chalk.red(`  Engine "${engineId}" is not supported by add-hooks yet.`));
    console.log(`  Supported: ${listSupportedEngines().map((s) => s.id).join(', ')}\n`);
    return;
  }

  const runnerPath = join(projectRoot, RUNNER_DEST_REL);
  const plan = generator.generate({ projectRoot, runnerPath });

  console.log(orange('  Preview:\n'));
  console.log('  ' + plan.summary.split('\n').join('\n  '));
  console.log('');

  if (!opts.yes) {
    const { confirmed } = await inquirer.prompt([{
      prefix: ORANGE_PREFIX,
      type: 'confirm',
      name: 'confirmed',
      message: 'Install these hooks?',
      default: true,
    }]);
    if (!confirmed) {
      console.log(chalk.gray('\n  Cancelled.\n'));
      return;
    }
  }

  copyRunner(projectRoot);
  const trackedPaths = [join(projectRoot, RUNNER_DEST_REL)];

  for (const file of plan.files) {
    mkdirSync(dirname(file.path), { recursive: true });
    writeFileSync(file.path, file.content, 'utf8');
    trackedPaths.push(file.path);
    console.log(orange(`  ✓  ${relative(projectRoot, file.path)}`));
  }
  console.log(orange(`  ✓  ${RUNNER_DEST_REL} (runner)`));

  appendCreatedFiles(projectRoot, trackedPaths);

  console.log(chalk.bold(`\n  Hooks installed for ${generator.name}.`));
  console.log(chalk.gray(`  Remove with: npx reversa remove-hooks --engine ${engineId}\n`));
}
