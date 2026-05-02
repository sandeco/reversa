import inquirer from 'inquirer';
import { applyOrangeTheme, ORANGE_PREFIX } from './orange-prompts.js';

applyOrangeTheme();

export const REQUIRED_AGENTS = [
  { name: 'Reversa: main orchestrator', value: 'reversa', disabled: true },
  { name: 'Scout: reconnaissance', value: 'reversa-scout', disabled: true },
  { name: 'Archaeologist: excavation', value: 'reversa-archaeologist', disabled: true },
  { name: 'Detective: interpretation', value: 'reversa-detective', disabled: true },
  { name: 'Architect: architectural synthesis', value: 'reversa-architect', disabled: true },
  { name: 'Writer: spec generation', value: 'reversa-writer', disabled: true },
];

export const OPTIONAL_AGENTS = [
  { name: 'Reviewer: spec review and validation', value: 'reversa-reviewer', checked: true },
  { name: 'Visor: UI analysis via screenshots', value: 'reversa-visor', checked: true },
  { name: 'Data Master: database analysis', value: 'reversa-data-master', checked: true },
  { name: 'Design System: design tokens and themes', value: 'reversa-design-system', checked: true },
  { name: 'Security Auditor: vulnerability scan, secrets detection, auth audit, OWASP review', value: 'reversa-security-auditor', checked: true },
  { name: 'Agents Help: explains agents with analogies', value: 'reversa-agents-help', checked: true },
  { name: 'Reconstructor: rebuilds the software from generated specs', value: 'reversa-reconstructor', checked: true },
];

const P = { prefix: ORANGE_PREFIX };

function parseArgValue(args, prefix) {
  const arg = args.find(a => a.startsWith(prefix));
  if (!arg) return undefined;
  const eqIdx = arg.indexOf('=');
  if (eqIdx !== -1) return arg.slice(eqIdx + 1);
  return undefined;
}

export function runInstallDefaults(detectedEngines, args) {
  const flagEngines = parseArgValue(args, '--engines');
  const flagProject = parseArgValue(args, '--project');
  const flagUser = parseArgValue(args, '--user');
  const flagChat = parseArgValue(args, '--chat-language');
  const flagDoc = parseArgValue(args, '--doc-language');
  const flagOutput = parseArgValue(args, '--output');
  const flagGit = parseArgValue(args, '--git-strategy');
  const flagAnswer = parseArgValue(args, '--answer-mode');
  const flagAgents = parseArgValue(args, '--agents');
  const flagReinstall = parseArgValue(args, '--reinstall');

  const selectedEngines = flagEngines
    ? detectedEngines.filter(e => flagEngines.split(',').map(s => s.trim()).includes(e.id))
    : detectedEngines.filter(e => e.detected);

  const allEngineIds = selectedEngines.length > 0
    ? selectedEngines.map(e => e.id)
    : detectedEngines.slice(0, 1).map(e => e.id);

  const enabledOptionalAgents = flagAgents
    ? OPTIONAL_AGENTS.filter(a => flagAgents.split(',').map(s => s.trim()).includes(a.value))
    : OPTIONAL_AGENTS.filter(a => a.checked);

  return {
    engines: allEngineIds,
    optional_agents: enabledOptionalAgents.map(a => a.value),
    project_name: flagProject || process.cwd().split(/[\\/]/).pop(),
    user_name: flagUser || 'Developer',
    chat_language: flagChat || 'en',
    doc_language: flagDoc || 'English',
    output_folder: flagOutput || '_reversa_sdd',
    git_strategy: flagGit || 'commit',
    answer_mode: flagAnswer || 'chat',
    agents: [...REQUIRED_AGENTS.map(a => a.value), ...enabledOptionalAgents.map(a => a.value)],
    _non_interactive: true,
    _reinstall: flagReinstall === 'yes',
  };
}

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
