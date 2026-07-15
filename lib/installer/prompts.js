import inquirer from 'inquirer';
import chalk from 'chalk';
import { applyOrangeTheme, ORANGE_PREFIX } from './orange-prompts.js';

applyOrangeTheme();

const DISCOVERY_CORE = [
  'reversa',
  'reversa-autonomous',
  'reversa-scout',
  'reversa-archaeologist',
  'reversa-detective',
  'reversa-architect',
  'reversa-writer',
  'reversa-reviewer',
  'reversa-visor',
  'reversa-data-master',
  'reversa-design-system',
  'reversa-agents-help',
  'reversa-reconstructor',
];

const MIGRATION_TEAM = [
  'reversa-migrate',
  'reversa-paradigm-advisor',
  'reversa-curator',
  'reversa-strategist',
  'reversa-designer',
  'reversa-screen-translator',
  'reversa-inspector',
];

const TRANSLATORS = [
  'reversa-n8n',
];

const PRICING_TEAM = [
  'reversa-pricing-profile',
  'reversa-pricing-size',
  'reversa-pricing-estimate',
];

const FORWARD_TEAM = [
  'reversa-forward',
  'reversa-requirements',
  'reversa-clarify',
  'reversa-plan',
  'reversa-to-do',
  'reversa-audit',
  'reversa-quality',
  'reversa-coding',
  'reversa-sync',
  'reversa-principles',
  'reversa-resume',
];

const DOCS_TEAM = [
  // Orquestrador e 4 agentes especialistas
  'reversa-docs',
  'reversa-docs-mapper',
  'reversa-docs-analyst',
  'reversa-docs-storyteller',
  'reversa-docs-publisher',
  // Skills compartilhadas consumidas pelo time
  'reversa-arquitetura-3d',
  'reversa-selo-generativo',
  'reversa-highcharts-visualizer',
  'reversa-especialista-d3',
  'reversa-image-prompt-json',
];

const NEW_PROJECT_TEAM = [
  'reversa-new',
  'reversa-ideator',
  'reversa-researcher',
  'reversa-drafter',
  'reversa-spec-sdd',
];

const BUGS_TEAM = [
  'reversa-bug',
  'reversa-bug-fix',
  'reversa-bug-debate',
  'reversa-depth-inspection',
  'reversa-bug-graph',
];

export const DISCOVERY_AGENT_IDS = DISCOVERY_CORE;
export const MIGRATION_AGENT_IDS = MIGRATION_TEAM;
export const TRANSLATOR_AGENT_IDS = TRANSLATORS;
export const FORWARD_AGENT_IDS = FORWARD_TEAM;
export const PRICING_AGENT_IDS = PRICING_TEAM;
export const DOCS_AGENT_IDS = DOCS_TEAM;
export const NEW_PROJECT_AGENT_IDS = NEW_PROJECT_TEAM;
export const BUGS_AGENT_IDS = BUGS_TEAM;

const TEAM_TO_AGENTS = {
  migration: MIGRATION_TEAM,
  forward: FORWARD_TEAM,
  newproject: NEW_PROJECT_TEAM,
  translators: TRANSLATORS,
  pricing: PRICING_TEAM,
  docs: DOCS_TEAM,
};

const TEAM_LABELS = {
  migration: 'Migration Agents',
  forward: 'Code Forward Agents',
  newproject: 'Code New Project Agents',
  docs: 'Documentation Agents',
  pricing: 'Pricing and Size Agents',
  translators: 'Translators',
};

const TEAM_DEPENDENCIES = {
  newproject: ['forward'],
};

export function resolveTeamDependencies(selectedTeams) {
  const resolved = new Set(selectedTeams);
  for (const team of selectedTeams) {
    const deps = TEAM_DEPENDENCIES[team] || [];
    deps.forEach(d => resolved.add(d));
  }
  return [...resolved];
}

const P = { prefix: ORANGE_PREFIX };
const promptTitle = (number, message, suffix = 'none') => {
  const tail = suffix === 'checkbox' ? '\n\n' : suffix === 'list' ? '\n' : '';
  return `\n${number}. ${message}${tail}`;
};

class PlainSeparator extends inquirer.Separator {
  constructor(line) {
    super();
    this.line = line;
  }
}

export async function runInstallPrompts(detectedEngines) {
  const engineChoices = detectedEngines.map(e => ({
    name: `${e.name}${e.star ? ' (recommended)' : ''}`,
    value: e.id,
    checked: e.detected,
  }));

  const teamChoices = [
    new PlainSeparator(`${chalk.gray('(*)')} Reversa Agents Core`),
    new PlainSeparator(`${chalk.gray('(*)')} Bug Agents`),
    { name: 'Migration Agents', value: 'migration', checked: true },
    { name: 'Code Forward Agents', value: 'forward', checked: true },
    { name: `Code New Project Agents ${chalk.gray('(requer Code Forward Agents)')}`, value: 'newproject', checked: true },
    { name: 'Documentation Agents (HTML mini-site)', value: 'docs', checked: true },
    { name: 'Pricing and Size Agents', value: 'pricing', checked: true },
    { name: 'Translators N8N->Specs->Python', value: 'translators', checked: false },
  ];

  const answers = await inquirer.prompt([
    {
      ...P,
      type: 'checkbox',
      name: 'engines',
      message: promptTitle(1, 'Engines Harness to support', 'checkbox'),
      choices: engineChoices,
      loop: false,
      pageSize: 12,
      validate: (selected) => selected.length > 0 || 'Select at least one engine.',
    },
    {
      ...P,
      type: 'checkbox',
      name: 'teams',
      message: promptTitle(2, 'Agents teams to install', 'checkbox'),
      choices: teamChoices,
      loop: false,
      pageSize: 8,
    },
    {
      ...P,
      type: 'input',
      name: 'project_name',
      message: promptTitle(3, 'Project name:'),
      default: process.cwd().split(/[\\/]/).pop(),
      validate: (v) => v.trim().length > 0 || 'Name cannot be empty.',
    },
    {
      ...P,
      type: 'input',
      name: 'user_name',
      message: promptTitle(4, 'What should the agents call you?'),
      validate: (v) => v.trim().length > 0 || 'Name cannot be empty.',
    },
    {
      ...P,
      type: 'input',
      name: 'chat_language',
      message: promptTitle(5, 'Language for agent interactions:'),
      default: 'pt-br',
    },
    {
      ...P,
      type: 'input',
      name: 'doc_language',
      message: promptTitle(6, 'Language for generated documents and specs:'),
      default: 'Português',
    },
    {
      ...P,
      type: 'input',
      name: 'output_folder',
      message: promptTitle(7, 'Output folder for specs:'),
      default: '_reversa_sdd',
    },
    {
      ...P,
      type: 'list',
      name: 'git_strategy',
      message: promptTitle(8, 'How to handle artifacts in git?', 'list'),
      loop: false,
      choices: [
        { name: 'Commit with the project (recommended for teams)', value: 'commit' },
        { name: 'Add to .gitignore (personal use)', value: 'gitignore' },
      ],
    },
    {
      ...P,
      type: 'list',
      name: 'answer_mode',
      message: promptTitle(9, 'How do you prefer to answer agent questions?', 'list'),
      loop: false,
      choices: [
        { name: 'In the chat (faster)', value: 'chat' },
        { name: 'In the questions.md file (more organized)', value: 'file' },
      ],
    },
  ]);

  const originalSelected = answers.teams ?? [];
  const resolvedSelected = resolveTeamDependencies(originalSelected);
  const autoAdded = resolvedSelected.filter(t => !originalSelected.includes(t));

  if (autoAdded.length > 0) {
    for (const team of autoAdded) {
      const dependents = Object.entries(TEAM_DEPENDENCIES)
        .filter(([, deps]) => deps.includes(team))
        .map(([owner]) => TEAM_LABELS[owner] || owner);
      const label = TEAM_LABELS[team] || team;
      const owners = dependents.join(', ');
      console.log(chalk.cyan(`\nℹ  ${label} foi adicionado automaticamente porque é dependência de ${owners}.`));
    }
  }

  const selectedTeams = new Set(resolvedSelected);
  // Discovery e Bugs são grupos fixos: sempre instalados, como o core
  const expandedAgents = [...DISCOVERY_CORE, ...BUGS_TEAM];
  for (const [team, ids] of Object.entries(TEAM_TO_AGENTS)) {
    if (selectedTeams.has(team)) expandedAgents.push(...ids);
  }
  const agents = [...new Set(expandedAgents)];

  return {
    ...answers,
    teams: ['discovery', 'bugs', ...resolvedSelected],
    agents,
  };
}

export async function askMergeStrategy(filePath) {
  const { strategy } = await inquirer.prompt([
    {
      ...P,
      type: 'list',
      name: 'strategy',
      message: `\nThe file "${filePath}" already exists. What to do?\n\n`,
      loop: false,
      choices: [
        { name: 'Merge: add Reversa content at the end', value: 'merge' },
        { name: 'Skip: keep the file as is', value: 'skip' },
      ],
    },
  ]);
  return strategy;
}
