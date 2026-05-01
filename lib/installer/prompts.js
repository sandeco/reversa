import inquirer from 'inquirer';
import { applyOrangeTheme, ORANGE_PREFIX } from './orange-prompts.js';

applyOrangeTheme();

const REQUIRED_AGENTS = [
  { name: 'Reversa: main orchestrator', value: 'reversa', disabled: true },
  { name: 'Scout: reconnaissance', value: 'reversa-scout', disabled: true },
  { name: 'Archaeologist: excavation', value: 'reversa-archaeologist', disabled: true },
  { name: 'Detective: interpretation', value: 'reversa-detective', disabled: true },
  { name: 'Architect: architectural synthesis', value: 'reversa-architect', disabled: true },
  { name: 'Writer: spec generation', value: 'reversa-writer', disabled: true },
];

const OPTIONAL_AGENTS = [
  { name: 'Reviewer: spec review and validation', value: 'reversa-reviewer', checked: true },
  { name: 'Visor: UI analysis via screenshots', value: 'reversa-visor', checked: true },
  { name: 'Data Master: database analysis', value: 'reversa-data-master', checked: true },
  { name: 'Design System: design tokens and themes', value: 'reversa-design-system', checked: true },
  { name: 'Agents Help: explains agents with analogies', value: 'reversa-agents-help', checked: true },
  { name: 'Reconstructor: rebuilds the software from generated specs', value: 'reversa-reconstructor', checked: true },
  { name: 'Chronicler: keeps specs in sync with code changes', value: 'reversa-chronicler', checked: true },
];

const P = { prefix: ORANGE_PREFIX };

export async function runInstallPrompts(detectedEngines) {
  const engineChoices = detectedEngines.map(e => ({
    name: `${e.name}${e.star ? ' ⭐' : ''}`,
    value: e.id,
    checked: e.detected,
  }));

  const answers = await inquirer.prompt([
    {
      ...P,
      type: 'checkbox',
      name: 'engines',
      message: 'Which engines do you want to support?',
      choices: engineChoices,
      loop: false,
      validate: (selected) => selected.length > 0 || 'Select at least one engine.',
    },
    {
      ...P,
      type: 'checkbox',
      name: 'optional_agents',
      message: 'Agents to install:',
      choices: [
        new inquirer.Separator('── Required (always installed) ──'),
        ...REQUIRED_AGENTS,
        new inquirer.Separator('── Optional ──'),
        ...OPTIONAL_AGENTS,
      ],
      loop: false,
    },
    {
      ...P,
      type: 'input',
      name: 'project_name',
      message: 'Project name:',
      default: process.cwd().split(/[\\/]/).pop(),
      validate: (v) => v.trim().length > 0 || 'Name cannot be empty.',
    },
    {
      ...P,
      type: 'input',
      name: 'user_name',
      message: 'What should the agents call you?',
      validate: (v) => v.trim().length > 0 || 'Name cannot be empty.',
    },
    {
      ...P,
      type: 'input',
      name: 'chat_language',
      message: 'Language for agent interactions:',
      default: 'pt-br',
    },
    {
      ...P,
      type: 'input',
      name: 'doc_language',
      message: 'Language for generated documents and specs:',
      default: 'Português',
    },
    {
      ...P,
      type: 'input',
      name: 'output_folder',
      message: 'Output folder for specs:',
      default: '_reversa_sdd',
    },
    {
      ...P,
      type: 'list',
      name: 'git_strategy',
      message: 'How to handle artifacts in git?',
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
      message: 'How do you prefer to answer agent questions?',
      loop: false,
      choices: [
        { name: 'In the chat (faster)', value: 'chat' },
        { name: 'In the questions.md file (more organized)', value: 'file' },
      ],
    },
  ]);

  const requiredAgentValues = REQUIRED_AGENTS.map(a => a.value);
  return {
    ...answers,
    agents: [...requiredAgentValues, ...answers.optional_agents],
  };
}

export async function askMergeStrategy(filePath) {
  const { strategy } = await inquirer.prompt([
    {
      ...P,
      type: 'list',
      name: 'strategy',
      message: `The file "${filePath}" already exists. What to do?`,
      loop: false,
      choices: [
        { name: 'Merge: add Reversa content at the end', value: 'merge' },
        { name: 'Skip: keep the file as is', value: 'skip' },
      ],
    },
  ]);
  return strategy;
}
