import { join, resolve } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { detectEngines, ENGINES } from '../installer/detector.js';
import { checkExistingInstallation } from '../installer/validator.js';
import { runInstallPrompts, MIGRATION_AGENT_IDS, TRANSLATOR_AGENT_IDS, FORWARD_AGENT_IDS, PRICING_AGENT_IDS, DOCS_AGENT_IDS, NEW_PROJECT_AGENT_IDS, BUGS_AGENT_IDS, REFACTOR_AGENT_IDS } from '../installer/prompts.js';
import { Writer } from '../installer/writer.js';
import { buildManifest, saveManifest, loadManifest } from '../installer/manifest.js';
import { readJsonSafe } from '../utils/json-safe.js';
import { clearTerminalForLogo, renderReversaLogo } from '../utils/banner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

function getVersion() {
  try {
    const pkg = readJsonSafe(join(REPO_ROOT, 'package.json'));
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export default async function install(args) {
  const { default: chalk } = await import('chalk');
  const { default: ora } = await import('ora');

  const projectRoot = resolve(process.cwd());
  const version = getVersion();

  clearTerminalForLogo();
  console.log(renderReversaLogo(chalk));
  console.log('');
  console.log(chalk.gray('AI-Powered Reverse Engineering Framework'));
  console.log('');
  console.log(chalk.bold('Installation'));
  console.log('');

  // Check existing installation
  const existing = checkExistingInstallation(projectRoot);
  if (existing.installed) {
    console.log(chalk.yellow(`  Reversa is already installed (v${existing.version}) in this project.\n`));
    const { default: inquirer } = await import('inquirer');
    const { proceed } = await inquirer.prompt([{
      prefix: '',
      type: 'confirm',
      name: 'proceed',
      message: '\nDo you want to reinstall / update the configuration?',
      default: false,
    }]);
    if (!proceed) {
      console.log(chalk.gray('\n  Installation cancelled.\n'));
      return;
    }
  }

  // Detect engines
  const detectedEngines = detectEngines(projectRoot);
  const detected = detectedEngines.filter(e => e.detected).map(e => e.name).join(', ');
  if (detected) {
    console.log(chalk.gray(`Detected: ${detected}`));
    console.log('');
  }

  // Collect answers
  let answers;
  try {
    answers = await runInstallPrompts(detectedEngines);
  } catch (err) {
    if (err.isTtyError || err.message?.includes('cancel')) {
      console.log(chalk.gray('\n  Installation cancelled.\n'));
      return;
    }
    throw err;
  }

  const selectedEngines = ENGINES.filter(e => answers.engines.includes(e.id));
  const writer = new Writer(projectRoot);

  const spinner = ora({ text: 'Installing agents...', color: 'cyan' }).start();

  try {
    // Install skills for each agent x engine
    for (const agent of answers.agents) {
      for (const engine of selectedEngines) {
        await writer.installSkill(agent, engine.skillsDir);
        if (engine.universalSkillsDir && engine.universalSkillsDir !== engine.skillsDir) {
          await writer.installSkill(agent, engine.universalSkillsDir);
        }
      }
    }

    // Stop spinner before possible interactive conflict prompts
    spinner.stop();

    // Instalar entry file de cada engine (deduplica arquivos compartilhados)
    const seenEntryFiles = new Set();
    for (const engine of selectedEngines) {
      if (!engine.entryFile) continue;
      if (seenEntryFiles.has(engine.entryFile)) continue;
      seenEntryFiles.add(engine.entryFile);
      await writer.installEntryFile(engine, {
        outputFolder: answers.output_folder,
        forwardFolder: answers.forward_folder,
      });
    }

    spinner.start('Creating .reversa/ structure...');

    // Criar estrutura .reversa/
    writer.createReversaDir(answers, version);

    // Se reinstall: atualizar engines/agents/config no state.json existente
    if (existing.installed) {
      const statePath = join(projectRoot, '.reversa', 'state.json');
      if (existsSync(statePath)) {
        const s = readJsonSafe(statePath);
        s.engines = answers.engines;
        s.agents = answers.agents;
        s.answer_mode = answers.answer_mode;
        s.output_folder = answers.output_folder;
        writeFileSync(statePath, JSON.stringify(s, null, 2), 'utf8');
      }
    }

    // .gitignore
    if (answers.git_strategy === 'gitignore') {
      writer.updateGitignore(answers.output_folder);
    }

    writer.saveCreatedFiles();

    spinner.text = 'Generating manifest...';

    // Manifest com caminhos relativos, apenas arquivos (não diretórios)
    const existingManifest = existing.installed ? loadManifest(projectRoot) : {};
    const newManifest = buildManifest(projectRoot, writer.manifestPaths);
    saveManifest(projectRoot, { ...existingManifest, ...newManifest });

    spinner.succeed(chalk.hex('#ffa203')('Installation complete!'));
  } catch (err) {
    spinner.fail(chalk.red('Error during installation.'));
    throw err;
  }

  // Resumo
  const engineNames = selectedEngines.map(e => e.name).join(', ');
  const migrationInstalled = answers.agents.filter(a => MIGRATION_AGENT_IDS.includes(a));
  const translatorsInstalled = answers.agents.filter(a => TRANSLATOR_AGENT_IDS.includes(a));
  const forwardInstalled = answers.agents.filter(a => FORWARD_AGENT_IDS.includes(a));
  const pricingInstalled = answers.agents.filter(a => PRICING_AGENT_IDS.includes(a));
  const docsInstalled = answers.agents.filter(a => DOCS_AGENT_IDS.includes(a));
  const newProjectInstalled = answers.agents.filter(a => NEW_PROJECT_AGENT_IDS.includes(a));
  const bugsInstalled = answers.agents.filter(a => BUGS_AGENT_IDS.includes(a));
  const refactorInstalled = answers.agents.filter(a => REFACTOR_AGENT_IDS.includes(a));
  const discoveryInstalled = answers.agents.filter(a =>
    !MIGRATION_AGENT_IDS.includes(a) &&
    !TRANSLATOR_AGENT_IDS.includes(a) &&
    !FORWARD_AGENT_IDS.includes(a) &&
    !PRICING_AGENT_IDS.includes(a) &&
    !DOCS_AGENT_IDS.includes(a) &&
    !NEW_PROJECT_AGENT_IDS.includes(a) &&
    !BUGS_AGENT_IDS.includes(a) &&
    !REFACTOR_AGENT_IDS.includes(a)
  );

  console.log('');
  console.log(chalk.bold('  Summary:'));
  console.log(`  ${chalk.cyan('Project:')}   ${answers.project_name}`);
  console.log(`  ${chalk.cyan('Engines:')}   ${engineNames}`);
  console.log(`  ${chalk.cyan('Version:')}   ${version}`);
  console.log('');
  console.log(chalk.bold('  Agents installed:'));
  console.log(`  ${chalk.cyan('Discovery Team:')}      ${discoveryInstalled.length} agent(s)`);
  if (migrationInstalled.length > 0) {
    console.log(`  ${chalk.cyan('Migration Team:')}      ${migrationInstalled.length} agent(s)`);
  } else {
    console.log(`  ${chalk.gray('Migration Team:       not installed (run')} ${chalk.cyan('npx reversa add-agent')}${chalk.gray(' to add later)')}`);
  }
  if (forwardInstalled.length > 0) {
    console.log(`  ${chalk.cyan('Code Forward Cycle:')}  ${forwardInstalled.length} agent(s)`);
  }
  if (newProjectInstalled.length > 0) {
    console.log(`  ${chalk.cyan('New Project Team:')}    ${newProjectInstalled.length} agent(s)`);
  }
  if (docsInstalled.length > 0) {
    console.log(`  ${chalk.cyan('Documentation Team:')}  ${docsInstalled.length} agent(s)`);
  }
  if (bugsInstalled.length > 0) {
    console.log(`  ${chalk.cyan('Bug Team:')}            ${bugsInstalled.length} agent(s)`);
  }
  if (refactorInstalled.length > 0) {
    console.log(`  ${chalk.cyan('Code Quality Team:')}   ${refactorInstalled.length} agent(s)`);
  }
  if (translatorsInstalled.length > 0) {
    console.log(`  ${chalk.cyan('Translators:')}         ${translatorsInstalled.length} agent(s)`);
  }
  if (pricingInstalled.length > 0) {
    console.log(`  ${chalk.cyan('Pricing:')}             ${pricingInstalled.length} agent(s)`);
  }
  console.log('');

  if (selectedEngines.length > 0) {
    const names = selectedEngines.map(e => e.name);
    const namesStr = names.length > 1
      ? names.slice(0, -1).join(', ') + ' or ' + names.slice(-1)[0]
      : names[0];
    const noSlashEngines = new Set(['codex', 'mistral-vibe']);
    const hasSlashEngine = selectedEngines.some(e => !noSlashEngines.has(e.id));
    const startCommand = hasSlashEngine ? '/reversa' : 'reversa';
    console.log(chalk.cyan(`  → Open ${namesStr} and type: ${startCommand} in the chat to start the discovery`));
    if (migrationInstalled.length > 0) {
      const migrateCommand = hasSlashEngine ? '/reversa-migrate' : 'reversa-migrate';
      console.log(chalk.cyan(`  → After discovery completes, run ${migrateCommand} to plan the rebuild`));
    }
    if (docsInstalled.length > 0) {
      const docsCommand = hasSlashEngine ? '/reversa-docs' : 'reversa-docs';
      console.log(chalk.cyan(`  → For a visual HTML mini-site of the project, run ${docsCommand} after discovery`));
    }
    if (newProjectInstalled.length > 0) {
      const newCommand = hasSlashEngine ? '/reversa-new' : 'reversa-new';
      console.log(chalk.cyan(`  → For a brand-new project from idea to specs, run ${newCommand}`));
    }
    if (bugsInstalled.length > 0) {
      const bugCommand = hasSlashEngine ? '/reversa-debugger' : 'reversa-debugger';
      const bugFixCommand = hasSlashEngine ? '/reversa-debugger-fix' : 'reversa-debugger-fix';
      console.log(chalk.cyan(`  → To track a defect, run ${bugCommand}; to fix a registered one, run ${bugFixCommand}`));
    }
    if (refactorInstalled.length > 0) {
      const refactorCommand = hasSlashEngine ? '/reversa-refactor' : 'reversa-refactor';
      console.log(chalk.cyan(`  → To improve existing code (refactor, optimize, prune dead code), run ${refactorCommand} after discovery`));
    }
    if (translatorsInstalled.includes('reversa-n8n')) {
      const n8nCommand = hasSlashEngine ? '/reversa-n8n' : 'reversa-n8n';
      console.log(chalk.cyan(`  → To analyze N8N workflows, drop the JSONs in n8n_json_workflows/ and run ${n8nCommand}`));
    }
    if (pricingInstalled.length > 0) {
      const profileCommand = hasSlashEngine ? '/reversa-pricing-profile' : 'reversa-pricing-profile';
      const sizeCommand = hasSlashEngine ? '/reversa-pricing-size' : 'reversa-pricing-size';
      const estimateCommand = hasSlashEngine ? '/reversa-pricing-estimate' : 'reversa-pricing-estimate';
      console.log(chalk.cyan(`  → To set up pricing, run ${profileCommand} once per project, then ${sizeCommand} after each /reversa-to-do, then ${estimateCommand} to get the 3 price scenarios`));
    }
  }
  console.log('');
}
