// `npx reversa remove-hooks [--engine <id>] [--yes]`
//
// Strips Reversa-installed hooks from engine config files.
// Preserves any other hooks the user added manually (filters by command marker).
// Optionally removes the runner script from .reversa/_hooks/.

import { existsSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { checkExistingInstallation } from '../installer/validator.js';
import { findGenerator, listSupportedEngines, HOOK_GENERATORS } from '../installer/hooks/index.js';
import { applyOrangeTheme, ORANGE_PREFIX } from '../installer/orange-prompts.js';

const RUNNER_DEST_REL = join('.reversa', '_hooks', 'runner.js');

function parseArgs(args) {
  const out = { engine: null, yes: false, all: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--engine' || a === '-e') out.engine = args[++i];
    else if (a.startsWith('--engine=')) out.engine = a.slice('--engine='.length);
    else if (a === '--yes' || a === '-y') out.yes = true;
    else if (a === '--all') out.all = true;
  }
  return out;
}

function pruneCreatedFiles(projectRoot, removedPaths) {
  const statePath = join(projectRoot, '.reversa', 'state.json');
  if (!existsSync(statePath)) return;
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  const removedRels = new Set(removedPaths.map((p) => relative(projectRoot, p)));
  state.created_files = (state.created_files ?? []).filter((p) => !removedRels.has(p));
  writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
}

export default async function removeHooks(args) {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');
  applyOrangeTheme();

  const opts = parseArgs(args);
  const projectRoot = resolve(process.cwd());
  const orange = chalk.hex('#ffa203');

  console.log(chalk.bold('\n  Reversa: Remove Hooks\n'));

  const existing = checkExistingInstallation(projectRoot);
  if (!existing.installed) {
    console.log(chalk.yellow('  Reversa is not installed in this directory.\n'));
    return;
  }

  let targets = [];
  if (opts.all) {
    targets = HOOK_GENERATORS;
  } else {
    let engineId = opts.engine;
    if (!engineId) {
      const supported = listSupportedEngines();
      const { selected } = await inquirer.prompt([{
        prefix: ORANGE_PREFIX,
        type: 'list',
        name: 'selected',
        message: 'Engine to remove hooks from:',
        loop: false,
        choices: [
          ...supported.map((s) => ({ name: s.name, value: s.id })),
          { name: 'All engines', value: '__all__' },
        ],
      }]);
      if (selected === '__all__') targets = HOOK_GENERATORS;
      else engineId = selected;
    }
    if (targets.length === 0) {
      const gen = findGenerator(engineId);
      if (!gen) {
        console.log(chalk.red(`  Engine "${engineId}" not supported.\n`));
        return;
      }
      targets = [gen];
    }
  }

  if (!opts.yes) {
    const { confirmed } = await inquirer.prompt([{
      prefix: ORANGE_PREFIX,
      type: 'confirm',
      name: 'confirmed',
      message: `Remove Reversa hooks for ${targets.map((t) => t.name).join(', ')}?`,
      default: true,
    }]);
    if (!confirmed) {
      console.log(chalk.gray('\n  Cancelled.\n'));
      return;
    }
  }

  const allRemoved = [];
  const allCleaned = [];
  for (const gen of targets) {
    const result = gen.remove({ projectRoot });
    result.removed.forEach((p) => {
      console.log(orange(`  ✗  ${relative(projectRoot, p)} (deleted)`));
      allRemoved.push(p);
    });
    result.cleaned.forEach((p) => {
      console.log(orange(`  ↻  ${relative(projectRoot, p)} (Reversa hooks stripped)`));
      allCleaned.push(p);
    });
    if (result.removed.length === 0 && result.cleaned.length === 0) {
      console.log(chalk.gray(`  ·  No Reversa hooks found for ${gen.name}.`));
    }
  }

  // If no engines have Reversa hooks anymore, drop the runner too.
  // Detect by re-running each generator's remove (idempotent) — if all return empty, runner is unused.
  const stillUsed = HOOK_GENERATORS.some((gen) => {
    const r = gen.remove({ projectRoot });
    return r.removed.length > 0 || r.cleaned.length > 0;
  });
  if (!stillUsed) {
    const runnerAbs = join(projectRoot, RUNNER_DEST_REL);
    if (existsSync(runnerAbs)) {
      try {
        rmSync(dirname(runnerAbs), { recursive: true, force: true });
        console.log(orange(`  ✗  ${dirname(RUNNER_DEST_REL)}/ (runner removed)`));
        allRemoved.push(runnerAbs);
      } catch { /* swallow */ }
    }
  }

  pruneCreatedFiles(projectRoot, [...allRemoved, ...allCleaned]);

  console.log(chalk.bold(`\n  Done.\n`));
}
