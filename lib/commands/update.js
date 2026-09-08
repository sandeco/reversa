import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import { join, resolve } from 'path';
import { checkExistingInstallation } from '../installer/validator.js';
import { loadManifest, fileStatus } from '../installer/manifest.js';
import { renderLegacyEditPolicyParagraph } from '../installer/policy.js';
import { Writer } from '../installer/writer.js';
import { ENGINES } from '../installer/detector.js';
import { listAllAgents } from '../installer/prompts.js';
import { applyOrangeTheme, ORANGE_PREFIX } from '../installer/orange-prompts.js';
import { readJsonSafe } from '../utils/json-safe.js';
import { installModelRoutingProfiles, validateModelRouting } from '../routing/lifecycle.js';

async function fetchLatestVersion(packageName) {
  try {
    const res = await fetch(`https://registry.npmjs.org/${packageName}/latest`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.version ?? null;
  } catch {
    return null;
  }
}

export async function updateProject(args, dependencies = {}) {
  const { default: chalk } = await import('chalk');
  const { default: ora } = await import('ora');
  const { default: semver } = await import('semver');

  const projectRoot = resolve(process.cwd());

  console.log(chalk.bold('\n  Reversa: Update\n'));

  const existing = checkExistingInstallation(projectRoot);
  if (!existing.installed) {
    console.log(chalk.yellow('  Reversa is not installed in this directory.'));
    console.log('  Run ' + chalk.bold('npx reversa install') + ' to install.\n');
    return;
  }

  const installedVersion = existing.version;

  // Validate installed version before comparing
  if (!semver.valid(installedVersion)) {
    console.log(chalk.yellow(`  Invalid installed version: "${installedVersion}". Run npx reversa install to fix it.\n`));
    return;
  }

  // Check version on npm
  const spinner = ora({ text: 'Checking for latest version...', color: 'cyan' }).start();
  const latestVersion = await (dependencies.fetchLatestVersion ?? fetchLatestVersion)('reversa');
  spinner.stop();

  if (latestVersion && semver.valid(latestVersion)) {
    if (!semver.lt(installedVersion, latestVersion)) {
      console.log(chalk.hex('#ffa203')(`  You are already on the latest version (v${installedVersion}).\n`));
      return;
    }
    console.log(`  Installed version:  ${chalk.yellow('v' + installedVersion)}`);
    console.log(`  Available version:  ${chalk.hex('#ffa203')('v' + latestVersion)}\n`);
  } else {
    console.log(chalk.gray(`  Installed version: v${installedVersion}`));
    console.log(chalk.gray('  Could not check version on npm. Continuing offline.\n'));
  }

  // Carregar manifest e classificar arquivos
  const manifest = loadManifest(projectRoot);
  const state = existing.state;
  // Update instala todos os agentes do pacote, incluindo os novos
  const allAgents = listAllAgents();
  const installedEngineIds = state.engines ?? [];
  const installedEngines = ENGINES.filter(e => installedEngineIds.includes(e.id));
  validateModelRouting(projectRoot, installedEngineIds, allAgents);

  const modified = [];
  const intact = [];
  const missing = [];

  for (const [relPath, hash] of Object.entries(manifest)) {
    const status = fileStatus(projectRoot, relPath, hash);
    if (status === 'modified') modified.push(relPath);
    else if (status === 'missing') missing.push(relPath);
    else intact.push(relPath);
  }

  if (modified.length > 0) {
    console.log(chalk.yellow(`  ${modified.length} file(s) modified by you, will be kept:`));
    modified.forEach(f => console.log(chalk.gray(`    ✎  ${f}`)));
    console.log('');
  }
  if (missing.length > 0) {
    console.log(chalk.cyan(`  ${missing.length} missing file(s), will be restored:`));
    missing.forEach(f => console.log(chalk.gray(`    +  ${f}`)));
    console.log('');
  }

  const toUpdate = intact.length + missing.length;
  console.log(`  ${toUpdate} file(s) will be updated.`);
  if (toUpdate === 0 && !latestVersion) {
    console.log(chalk.gray('  No files to update.\n'));
    return;
  }

  const { default: inquirer } = await import('inquirer');
  applyOrangeTheme();
  const { confirm } = await (dependencies.prompt ?? inquirer.prompt)([{
    prefix: ORANGE_PREFIX,
    type: 'confirm',
    name: 'confirm',
    message: '\nConfirm update?',
    default: true,
  }]);
  if (!confirm) {
    console.log(chalk.gray('\n  Update cancelled.\n'));
    return;
  }

  const WriterClass = dependencies.Writer ?? Writer;
  const writer = new WriterClass(projectRoot);
  let configCreated = false;
  const appendedTo = [];
  const updateSpinner = ora({ text: 'Updating agents...', color: 'cyan' }).start();

  try {
    // Reinstalar skills (intactos + ausentes; pular modificados)
    for (const agent of allAgents) {
      for (const engine of installedEngines) {
        const relDir = join(engine.skillsDir, agent).replace(/\\/g, '/');
        const isModified = modified.some(f => f.replace(/\\/g, '/').startsWith(relDir));
        if (!isModified) {
          const { rmSync } = await import('fs');
          const dest = join(projectRoot, engine.skillsDir, agent);
          if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
          await writer.installSkill(agent, engine.skillsDir);
        }

        if (engine.universalSkillsDir && engine.universalSkillsDir !== engine.skillsDir) {
          const uRelDir = join(engine.universalSkillsDir, agent).replace(/\\/g, '/');
          const uIsModified = modified.some(f => f.replace(/\\/g, '/').startsWith(uRelDir));
          if (!uIsModified) {
            const { rmSync } = await import('fs');
            const uDest = join(projectRoot, engine.universalSkillsDir, agent);
            if (existsSync(uDest)) rmSync(uDest, { recursive: true, force: true });
            await writer.installSkill(agent, engine.universalSkillsDir);
          }
        }
      }
    }

    updateSpinner.text = 'Refreshing forward assets...';

    // Refrescar body templates, scripts e hooks.yml respeitando modificações do usuário
    const modifiedSet = new Set(modified.map(f => f.replace(/\\/g, '/')));
    writer.refreshForwardAssets(modifiedSet);

    installModelRoutingProfiles(writer, installedEngineIds, allAgents, manifest);

    updateSpinner.text = 'Updating entry files...';

    // Atualizar entry files intactos ou ausentes
    for (const engine of installedEngines) {
      const relEntry = engine.entryFile;
      const hash = manifest[relEntry];
      if (!hash) continue; // não foi instalado pelo Reversa — não tocar
      const status = fileStatus(projectRoot, relEntry, hash);
      if (status === 'intact' || status === 'missing') {
        await writer.installEntryFile(engine, {
          force: true,
          outputFolder: existing.state.output_folder,
          forwardFolder: existing.state.forward_folder,
        });
      }
    }

    updateSpinner.text = 'Configuring legacy-edit policy...';

    // Política de edição do legado: config com default seguro quando ausente + hook opcional
    configCreated = writer.ensureReversaConfig();
    writer.installPolicyHooks();

    // Entry files modificados pelo usuário recebem o parágrafo padrão por append,
    // sem apagar conteúdo (os intactos já foram reescritos com o template novo acima)
    for (const engine of installedEngines) {
      if (!engine.entryFile) continue;
      const entryPath = join(projectRoot, engine.entryFile);
      if (!existsSync(entryPath)) continue;
      const content = readFileSync(entryPath, 'utf8');
      if (content.includes('reversa-config.json')) continue;
      appendFileSync(
        entryPath,
        '\n\n## Política de edição do legado (Reversa)\n\n' + renderLegacyEditPolicyParagraph() + '\n',
        'utf8'
      );
      appendedTo.push(engine.entryFile);
    }

    updateSpinner.text = 'Updating version...';

    {
      const statePath = join(projectRoot, '.reversa', 'state.json');
      const s = readJsonSafe(statePath);
      s.agents = allAgents;
      if (latestVersion && semver.valid(latestVersion)) {
        writeFileSync(join(projectRoot, '.reversa', 'version'), latestVersion, 'utf8');
        s.version = latestVersion;
      }
      writeFileSync(statePath, JSON.stringify(s, null, 2), 'utf8');
    }

    updateSpinner.text = 'Updating manifest...';

    writer.saveCreatedFiles();
    writer.saveManifest(manifest);

    updateSpinner.succeed(chalk.hex('#ffa203')('Update complete!'));
  } catch (err) {
    updateSpinner.fail(chalk.red('Error during update.'));
    throw err;
  }

  if (modified.length > 0) {
    console.log(chalk.yellow(`\n  ${modified.length} file(s) kept (modified by you).`));
  }

  console.log(chalk.bold('\n  Legacy-edit policy:'));
  if (configCreated) {
    console.log(`  ${chalk.hex('#ffa203')('+')} .reversa/reversa-config.json created with the safe default (allowLegacyEdits: false).`);
  } else {
    console.log(chalk.gray('  .reversa/reversa-config.json already exists and was kept as is.'));
  }
  if (appendedTo.length > 0) {
    console.log(`  ${chalk.hex('#ffa203')('+')} Policy paragraph appended to: ${appendedTo.join(', ')} (your content was preserved).`);
  }
  console.log('  To let Reversa write in the legacy code, edit the file: allowLegacyEdits: true + allowedPaths with the desired globs.');
  console.log('  If your entry files carry manual exceptions, consider migrating them to allowedPaths.');
  console.log('  Optional hard enforcement for Claude Code: see .reversa/hooks/README.md');
  console.log('');
}

export default function update(args) {
  return updateProject(args);
}
