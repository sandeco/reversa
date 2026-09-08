import inquirer from 'inquirer';
import { readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { applyOrangeTheme, ORANGE_PREFIX } from './orange-prompts.js';

applyOrangeTheme();

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = resolve(__dirname, '..', '..', 'agents');

// Todos os agentes disponíveis no pacote: tudo que existe em agents/
export function listAllAgents() {
  return readdirSync(AGENTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
}

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
  'reversa-code-express',
  'reversa-add',
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

const IDEATION_TEAM = [
  'reversa-brainstorm',
  'reversa-framer',
  'reversa-explorer',
  'reversa-challenger',
  'reversa-arbiter',
  'reversa-pre-spec',
];

const NEW_PROJECT_TEAM = [
  'reversa-new',
  'reversa-ideator',
  'reversa-researcher',
  'reversa-drafter',
  'reversa-spec-sdd',
];

const BUGS_TEAM = [
  'reversa-debugger',
  'reversa-debugger-fix',
  'reversa-debugger-review',
  'reversa-debugger-debate',
  'reversa-depth-inspection',
  'reversa-debugger-graph',
];

const REFACTOR_TEAM = [
  'reversa-refactor',
  'reversa-restructure',
  'reversa-modularize',
  'reversa-decouple',
  'reversa-optimize',
  'reversa-simplify',
  'reversa-standardize',
  'reversa-prune',
];

export const DISCOVERY_AGENT_IDS = DISCOVERY_CORE;
export const MIGRATION_AGENT_IDS = MIGRATION_TEAM;
export const TRANSLATOR_AGENT_IDS = TRANSLATORS;
export const FORWARD_AGENT_IDS = FORWARD_TEAM;
export const PRICING_AGENT_IDS = PRICING_TEAM;
export const DOCS_AGENT_IDS = DOCS_TEAM;
export const IDEATION_AGENT_IDS = IDEATION_TEAM;
export const NEW_PROJECT_AGENT_IDS = NEW_PROJECT_TEAM;
export const BUGS_AGENT_IDS = BUGS_TEAM;
export const REFACTOR_AGENT_IDS = REFACTOR_TEAM;

const P = { prefix: ORANGE_PREFIX };
const promptTitle = (number, message, suffix = 'none') => {
  const tail = suffix === 'checkbox' ? '\n\n' : suffix === 'list' ? '\n' : '';
  return `\n${number}. ${message}${tail}`;
};

export async function runInstallPrompts(detectedEngines) {
  const engineChoices = detectedEngines.map(e => ({
    name: `${e.name}${e.star ? ' (recommended)' : ''}`,
    value: e.id,
    checked: e.detected,
  }));

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
      type: 'input',
      name: 'project_name',
      message: promptTitle(2, 'Project name:'),
      default: process.cwd().split(/[\\/]/).pop(),
      validate: (v) => v.trim().length > 0 || 'Name cannot be empty.',
    },
    {
      ...P,
      type: 'input',
      name: 'user_name',
      message: promptTitle(3, 'What should the agents call you?'),
      validate: (v) => v.trim().length > 0 || 'Name cannot be empty.',
    },
    {
      ...P,
      type: 'input',
      name: 'chat_language',
      message: promptTitle(4, 'Language for agent interactions:'),
      default: 'pt-br',
    },
    {
      ...P,
      type: 'input',
      name: 'doc_language',
      message: promptTitle(5, 'Language for generated documents and specs:'),
      default: 'Português',
    },
    {
      ...P,
      type: 'input',
      name: 'output_folder',
      message: promptTitle(6, 'Output folder for specs:'),
      default: '_reversa_sdd',
    },
    {
      ...P,
      type: 'list',
      name: 'git_strategy',
      message: promptTitle(7, 'How to handle artifacts in git?', 'list'),
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
      message: promptTitle(8, 'How do you prefer to answer agent questions?', 'list'),
      loop: false,
      choices: [
        { name: 'In the chat (faster)', value: 'chat' },
        { name: 'In the questions.md file (more organized)', value: 'file' },
      ],
    },
  ]);

  // Todos os agentes são sempre instalados, sem seleção
  return {
    ...answers,
    agents: listAllAgents(),
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
