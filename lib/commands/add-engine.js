import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { checkExistingInstallation } from '../installer/validator.js';
import { detectEngines, ENGINES } from '../installer/detector.js';
import { Writer } from '../installer/writer.js';
import { loadManifest } from '../installer/manifest.js';
import { applyOrangeTheme, ORANGE_PREFIX } from '../installer/orange-prompts.js';
import { readJsonSafe } from '../utils/json-safe.js';
import { installModelRoutingProfiles, validateModelRouting } from '../routing/lifecycle.js';

export default async function addEngine(args) {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');
  applyOrangeTheme();

  const projectRoot = resolve(process.cwd());

  console.log(chalk.bold('\n  Reversa: Add Engine\n'));

  const existing = checkExistingInstallation(projectRoot);
  if (!existing.installed) {
    console.log(chalk.yellow('  Reversa is not installed in this directory.'));
    console.log('  Run ' + chalk.bold('npx reversa install') + ' to install.\n');
    return;
  }

  const state = existing.state;

  // Validate required fields
  if (!Array.isArray(state.agents) || state.agents.length === 0) {
    console.log(chalk.red('  state.json has no registered agents.'));
    console.log('  Run ' + chalk.bold('npx reversa install') + ' first.\n');
    return;
  }

  const installedEngineIds = new Set(state.engines ?? []);
  const installedAgents = state.agents;

  const allEngines = detectEngines(projectRoot);
  const notInstalled = allEngines.filter(e => !installedEngineIds.has(e.id));

  if (notInstalled.length === 0) {
    console.log(chalk.hex('#ffa203')('  All detected engines are already configured.\n'));
    return;
  }

  const choices = notInstalled.map(e => ({
    name: `${e.name}${e.star ? ' ⭐' : ''}${e.detected ? chalk.gray(' (detected)') : ''}`,
    value: e.id,
    checked: e.detected,
  }));

  const { selected } = await inquirer.prompt([{
    prefix: ORANGE_PREFIX,
    type: 'checkbox',
    name: 'selected',
    message: '\nSelect engines to add:\n\n',
    choices,
    validate: (v) => v.length > 0 || 'Select at least one engine.',
  }]);

  const selectedEngines = ENGINES.filter(e => selected.includes(e.id));
  validateModelRouting(projectRoot, selected, installedAgents);
  const existingManifest = loadManifest(projectRoot);
  const writer = new Writer(projectRoot);

  const seenEntryFiles = new Set();
  for (const engine of selectedEngines) {
    if (engine.entryFile && !seenEntryFiles.has(engine.entryFile)) {
      seenEntryFiles.add(engine.entryFile);
      await writer.installEntryFile(engine, {
        outputFolder: state.output_folder,
        forwardFolder: state.forward_folder,
      });
    }
    for (const agent of installedAgents) {
      await writer.installSkill(agent, engine.skillsDir);
      if (engine.universalSkillsDir && engine.universalSkillsDir !== engine.skillsDir) {
        await writer.installSkill(agent, engine.universalSkillsDir);
      }
    }
    console.log(chalk.hex('#ffa203')(`  ✓  ${engine.name}`));
  }

  installModelRoutingProfiles(writer, selected, installedAgents, existingManifest);
  // Atualizar state.json
  const statePath = join(projectRoot, '.reversa', 'state.json');
  const s = readJsonSafe(statePath);
  s.engines = [...new Set([...(s.engines ?? []), ...selected])];
  writeFileSync(statePath, JSON.stringify(s, null, 2), 'utf8');

  writer.saveCreatedFiles();

  // Atualizar manifest com caminhos relativos
  writer.saveManifest(existingManifest);

  console.log(chalk.bold(`\n  ${selected.length} engine(s) added successfully.\n`));
}
