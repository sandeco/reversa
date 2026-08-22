import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { checkExistingInstallation } from '../installer/validator.js';
import { Writer } from '../installer/writer.js';
import { loadManifest } from '../installer/manifest.js';
import { ENGINES } from '../installer/detector.js';
import { applyOrangeTheme, ORANGE_PREFIX } from '../installer/orange-prompts.js';
import { readJsonSafe } from '../utils/json-safe.js';
import { installModelRoutingProfiles, validateModelRouting } from '../routing/lifecycle.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const AGENTS_DIR = join(REPO_ROOT, 'agents');

const AGENT_LABELS = {
  'reversa-autonomous':       'Autonomous: runs the full /reversa pipeline without intermediate stops (/reversa-autonomous)',
  'reversa-scout':            'Scout: reconnaissance',
  'reversa-archaeologist':    'Archaeologist: excavation',
  'reversa-detective':        'Detective: interpretation',
  'reversa-architect':        'Architect: architectural synthesis',
  'reversa-writer':           'Writer: spec generation',
  'reversa-reviewer':         'Reviewer: spec review and validation',
  'reversa-visor':            'Visor: UI analysis via screenshots',
  'reversa-data-master':      'Data Master: database analysis',
  'reversa-design-system':    'Design System: design tokens and themes',
  'reversa-agents-help':      'Agents Help: explains agents with analogies',
  'reversa-reconstructor':    'Reconstructor: rebuilds the software from generated specs',
  'reversa-migrate':          'Migrate: orchestrator of the migration team (/reversa-migrate)',
  'reversa-paradigm-advisor': 'Paradigm Advisor: detects paradigm gap between legacy and target stack',
  'reversa-curator':          'Curator: decides what migrates, what gets discarded, what needs human decision',
  'reversa-strategist':       'Strategist: proposes migration strategies (Strangler, Big Bang, Parallel Run, Branch by Abstraction)',
  'reversa-designer':         'Designer: drafts target architecture, domain model, data model and migration plan',
  'reversa-screen-translator': 'Screen Translator: translates legacy screens into executable specs (literal/modernized/hybrid) and emits golden files',
  'reversa-inspector':        'Inspector: defines parity specs and Gherkin scenarios for behavioral equivalence',
  'reversa-brainstorm':       'Brainstorm: orchestrator of the ideation team, clarifies an idea before any development (/reversa-brainstorm)',
  'reversa-framer':           'Framer: separates problem from solution and writes the job to be done (/reversa-framer)',
  'reversa-explorer':         'Explorer: opens 3 to 5 distinct paths, including do-nothing and buy-it, without recommending (/reversa-explorer)',
  'reversa-challenger':       'Challenger: premortem, assumptions that kill the project and hidden cost in the legacy (/reversa-challenger)',
  'reversa-arbiter':          'Arbiter: scores the options against the risks and recommends one, the human decides (/reversa-arbiter)',
  'reversa-pre-spec':         'Pre-Spec: turns the decision into the minimum package the next pipeline needs (/reversa-pre-spec)',
  'reversa-n8n':              'N8N Translator: converts N8N workflows (JSON) to SDD specs (/reversa-n8n)',
  'reversa-pricing-profile':  'Pricing Profile: configures the user pricing profile (/reversa-pricing-profile)',
  'reversa-pricing-size':     'Pricing Size: measures structural size of the active feature (/reversa-pricing-size)',
  'reversa-pricing-estimate': 'Pricing Estimate: generates 3 price scenarios (Effort, Value, Market) (/reversa-pricing-estimate)',
  'reversa-debugger':              'Bug: registers and traces a defect, never fixes (/reversa-debugger)',
  'reversa-debugger-fix':          'Bug Fix: lifecycle orchestrator with root cause, change set and spec verdict (/reversa-debugger-fix)',
  'reversa-debugger-debate':       'Bug Debate: multi-agent debate (diagnosis/repair/spec) with isolated judge (/reversa-debugger-debate)',
  'reversa-depth-inspection': 'Depth Inspection: deep sweep of a problematic feature, diagnosis only (/reversa-depth-inspection)',
  'reversa-debugger-graph':        'Bug Graph: regenerates index, sparse matrix, graph and BUG-SPEC traceability views (/reversa-debugger-graph)',
};

export default async function addAgent(args) {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');
  applyOrangeTheme();

  const projectRoot = resolve(process.cwd());

  console.log(chalk.bold('\n  Reversa: Add Agent\n'));

  const existing = checkExistingInstallation(projectRoot);
  if (!existing.installed) {
    console.log(chalk.yellow('  Reversa is not installed in this directory.'));
    console.log('  Run ' + chalk.bold('npx reversa install') + ' to install.\n');
    return;
  }

  const state = existing.state;

  // Validate required fields
  if (!Array.isArray(state.engines) || state.engines.length === 0) {
    console.log(chalk.red('  state.json has no configured engines.'));
    console.log('  Run ' + chalk.bold('npx reversa install') + ' or ' + chalk.bold('npx reversa add-engine') + ' first.\n');
    return;
  }

  const installedAgents = new Set(state.agents ?? []);
  const installedEngines = ENGINES.filter(e => state.engines.includes(e.id));

  let availableAgents = [];
  try {
    availableAgents = readdirSync(AGENTS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .filter(name => !installedAgents.has(name));
  } catch {
    console.log(chalk.red('  Could not read the agents folder.\n'));
    return;
  }

  if (availableAgents.length === 0) {
    console.log(chalk.hex('#ffa203')('  All available agents are already installed.\n'));
    return;
  }

  const choices = availableAgents.map(id => ({
    name: AGENT_LABELS[id] ?? id,
    value: id,
    checked: true,
  }));

  const { selected } = await inquirer.prompt([{
    prefix: ORANGE_PREFIX,
    type: 'checkbox',
    name: 'selected',
    message: '\nSelect agents to add:\n\n',
    choices,
    validate: (v) => v.length > 0 || 'Select at least one agent.',
  }]);

  const allAgentIds = [...new Set([...(state.agents ?? []), ...selected])];
  validateModelRouting(projectRoot, state.engines, allAgentIds);
  const existingManifest = loadManifest(projectRoot);
  const writer = new Writer(projectRoot);

  for (const agent of selected) {
    for (const engine of installedEngines) {
      await writer.installSkill(agent, engine.skillsDir);
      if (engine.universalSkillsDir && engine.universalSkillsDir !== engine.skillsDir) {
        await writer.installSkill(agent, engine.universalSkillsDir);
      }
    }
    console.log(chalk.hex('#ffa203')(`  ✓  ${AGENT_LABELS[agent] ?? agent}`));
  }

  // Atualizar state.json
  const statePath = join(projectRoot, '.reversa', 'state.json');
  const s = readJsonSafe(statePath);
  s.agents = allAgentIds;
  installModelRoutingProfiles(writer, state.engines, allAgentIds, existingManifest);
  writeFileSync(statePath, JSON.stringify(s, null, 2), 'utf8');

  writer.saveCreatedFiles();

  // Atualizar manifest com caminhos relativos
  writer.saveManifest(existingManifest);

  console.log(chalk.bold(`\n  ${selected.length} agent(s) added successfully.\n`));
}
