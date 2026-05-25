import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { checkExistingInstallation } from '../installer/validator.js';
import { loadManifest, saveManifest, buildManifest, fileStatus } from '../installer/manifest.js';
import { Writer } from '../installer/writer.js';
import { ENGINES } from '../installer/detector.js';
import { applyOrangeTheme, ORANGE_PREFIX } from '../installer/orange-prompts.js';
import { readJsonSafe } from '../utils/json-safe.js';

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

export default async function update(args) {
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
  const latestVersion = await fetchLatestVersion('reversa');
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

  // Load manifest and classify files
  const manifest = loadManifest(projectRoot);
  const state = existing.state;
  const installedAgents = state.agents ?? [];
  const installedEngineIds = state.engines ?? [];
  const installedEngines = ENGINES.filter(e => installedEngineIds.includes(e.id));

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
  const { confirm } = await inquirer.prompt([{
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

  const writer = new Writer(projectRoot);
  const updateSpinner = ora({ text: 'Updating agents...', color: 'cyan' }).start();

  try {
    // Reinstall skills (intact + missing; skip modified ones)
    for (const agent of installedAgents) {
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

    // Refresh body templates, scripts, and hooks.yml while respecting user modifications
    const modifiedSet = new Set(modified.map(f => f.replace(/\\/g, '/')));
    writer.refreshForwardAssets(modifiedSet);

    updateSpinner.text = 'Updating entry files...';

    // Update intact or missing entry files
    for (const engine of installedEngines) {
      const relEntry = engine.entryFile;
      const hash = manifest[relEntry];
      if (!hash) continue; // not installed by Reversa — do not touch
      const status = fileStatus(projectRoot, relEntry, hash);
      if (status === 'intact' || status === 'missing') {
        await writer.installEntryFile(engine, { force: true });
      }
    }

    updateSpinner.text = 'Updating version...';

    if (latestVersion && semver.valid(latestVersion)) {
      writeFileSync(join(projectRoot, '.reversa', 'version'), latestVersion, 'utf8');
      const statePath = join(projectRoot, '.reversa', 'state.json');
      const s = readJsonSafe(statePath);
      s.version = latestVersion;
      writeFileSync(statePath, JSON.stringify(s, null, 2), 'utf8');
    }

    updateSpinner.text = 'Updating manifest...';

    writer.saveCreatedFiles();
    const newManifest = buildManifest(projectRoot, writer.manifestPaths);
    // Merge with existing manifest (preserve entries for untouched files)
    const intactEntries = Object.fromEntries(
      intact.map(r => [r, manifest[r]])
    );
    saveManifest(projectRoot, { ...intactEntries, ...newManifest });

    updateSpinner.succeed(chalk.hex('#ffa203')('Update complete!'));
  } catch (err) {
    updateSpinner.fail(chalk.red('Error during update.'));
    throw err;
  }

  if (modified.length > 0) {
    console.log(chalk.yellow(`\n  ${modified.length} file(s) kept (modified by you).`));
  }
  console.log('');
}
