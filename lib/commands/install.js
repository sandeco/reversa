import { join, resolve } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { detectEngines, ENGINES } from '../installer/detector.js';
import { checkExistingInstallation } from '../installer/validator.js';
import { runInstallPrompts, runInstallDefaults } from '../installer/prompts.js';
import { Writer } from '../installer/writer.js';
import { buildManifest, saveManifest, loadManifest } from '../installer/manifest.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

function getVersion() {
  try {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
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

  console.log(chalk.hex('#ffa203')(`
______
| ___ \\
| |_/ /_____   _____ _ __ ___  __ _
|    // _ \\ \\ / / _ \\ '__/ __|/ _\` |
| |\\ \\  __/\\ V /  __/ |  \\__ \\ (_| |
\\_| \\_\\___| \\_/ \\___|_|  |___/\\__,_|
`));
  console.log(chalk.gray('  AI-Powered Reverse Engineering Framework\n'));
  console.log(chalk.bold('  Installation\n'));

  const isNonInteractive = args.includes('--yes') || args.includes('--non-interactive');

  // Check existing installation
  const existing = checkExistingInstallation(projectRoot);
  if (existing.installed) {
    if (isNonInteractive) {
      const defaults = runInstallDefaults([], args);
      if (!defaults._reinstall) {
        console.log(chalk.yellow(`  Reversa is already installed (v${existing.version}). Use --reinstall=yes to force.\n`));
        return;
      }
    } else {
      console.log(chalk.yellow(`  Reversa is already installed (v${existing.version}) in this project.\n`));
      const { default: inquirer } = await import('inquirer');
      const { proceed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: 'Do you want to reinstall / update the configuration?',
        default: false,
      }]);
      if (!proceed) {
        console.log(chalk.gray('\n  Installation cancelled.\n'));
        return;
      }
    }
  }

  // Detect engines
  const detectedEngines = detectEngines(projectRoot);
  const detected = detectedEngines.filter(e => e.detected).map(e => e.name).join(', ');
  if (detected) {
    console.log(chalk.gray(`  Detected: ${detected}\n`));
  }

  // Collect answers
  let answers;
  if (isNonInteractive) {
    answers = runInstallDefaults(detectedEngines, args);
  } else {
    try {
      answers = await runInstallPrompts(detectedEngines);
    } catch (err) {
      if (err.isTtyError || err.message?.includes('cancel')) {
        console.log(chalk.gray('\n  Installation cancelled.\n'));
        return;
      }
      throw err;
    }
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
    const entryFileOpts = isNonInteractive ? { mergeStrategy: 'skip' } : {};
    const seenEntryFiles = new Set();
    for (const engine of selectedEngines) {
      if (seenEntryFiles.has(engine.entryFile)) continue;
      seenEntryFiles.add(engine.entryFile);
      await writer.installEntryFile(engine, entryFileOpts);
    }

    spinner.start('Creating .reversa/ structure...');

    // Criar estrutura .reversa/
    writer.createReversaDir(answers, version);

    // Se reinstall: atualizar engines/agents/config no state.json existente
    if (existing.installed) {
      const statePath = join(projectRoot, '.reversa', 'state.json');
      if (existsSync(statePath)) {
        const s = JSON.parse(readFileSync(statePath, 'utf8'));
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
  console.log('');
  console.log(chalk.bold('  Summary:'));
  console.log(`  ${chalk.cyan('Project:')}   ${answers.project_name}`);
  console.log(`  ${chalk.cyan('Engines:')}   ${engineNames}`);
  console.log(`  ${chalk.cyan('Agents:')}    ${answers.agents.length} installed`);
  console.log(`  ${chalk.cyan('Version:')}   ${version}`);
  console.log('');

  if (selectedEngines.length > 0) {
    const names = selectedEngines.map(e => e.name);
    const namesStr = names.length > 1
      ? names.slice(0, -1).join(', ') + ' or ' + names.slice(-1)[0]
      : names[0];
    const hasSlashEngine = selectedEngines.some(e => e.id !== 'codex');
    const command = hasSlashEngine ? '/reversa' : 'reversa';
    console.log(chalk.cyan(`  → Open ${namesStr} and type: ${command} in the chat`));
  }
  console.log('');
}
