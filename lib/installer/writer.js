import {
  existsSync, mkdirSync, writeFileSync,
  readFileSync, cpSync, appendFileSync,
  readdirSync, statSync,
} from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { askMergeStrategy } from './prompts.js';
import { readJsonSafe } from '../utils/json-safe.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const AGENTS_DIR = join(REPO_ROOT, 'agents');
const TEMPLATES_DIR = join(REPO_ROOT, 'templates');

export class Writer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.createdFiles = [];   // dirs + files — used by uninstall via state.json
    this.manifestPaths = [];  // files only — used to build SHA-256 manifest
  }

  // Normalises an absolute path to project-relative
  _rel(absPath) {
    return absPath
      .replace(this.projectRoot + '\\', '')
      .replace(this.projectRoot + '/', '');
  }

  // Registers a path for uninstall tracking (dirs or files)
  _register(absPath) {
    const rel = this._rel(absPath);
    if (!this.createdFiles.includes(rel)) this.createdFiles.push(rel);
    // If it is a regular file, also track for manifest
    try {
      if (!statSync(absPath).isDirectory()) {
        if (!this.manifestPaths.includes(rel)) this.manifestPaths.push(rel);
      }
    } catch { /* ignore */ }
  }

  // Recursively registers individual files inside a directory for manifest
  _registerFilesInDir(dirPath) {
    try {
      const entries = readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const full = join(dirPath, entry.name);
        if (entry.isDirectory()) {
          this._registerFilesInDir(full);
        } else {
          const rel = this._rel(full);
          if (!this.manifestPaths.includes(rel)) this.manifestPaths.push(rel);
        }
      }
    } catch { /* ignore */ }
  }

  // Create directory safely
  _mkdir(dir) {
    mkdirSync(dir, { recursive: true });
  }

  // Write file only if it does not exist
  _writeNew(filePath, content) {
    if (existsSync(filePath)) return false;
    this._mkdir(dirname(filePath));
    writeFileSync(filePath, content, 'utf8');
    this._register(filePath);
    return true;
  }

  // Instala os skills de um agente para uma engine
  async installSkill(agentId, skillsDir) {
    const src = join(AGENTS_DIR, agentId);
    const dest = join(this.projectRoot, skillsDir, agentId);

    if (!existsSync(src)) {
      console.warn(`  Agent not found: ${agentId}`);
      return;
    }

    if (existsSync(dest)) return; // already installed

    this._mkdir(dirname(dest));
    cpSync(src, dest, { recursive: true });
    this._register(dest);              // directory → uninstall tracking
    this._registerFilesInDir(dest);    // individual files → manifest tracking
  }

  // Instala o arquivo de entrada de uma engine (CLAUDE.md, AGENTS.md, etc.)
  // force=true: overwrite silently (used by update for intact files)
  async installEntryFile(engine, { force = false } = {}) {
    if (!engine.entryFile || !engine.entryTemplate) return;

    const templatePath = join(TEMPLATES_DIR, 'engines', engine.entryTemplate);
    const destPath = join(this.projectRoot, engine.entryFile);

    if (!existsSync(templatePath)) return;

    const content = readFileSync(templatePath, 'utf8');

    if (!existsSync(destPath)) {
      this._mkdir(dirname(destPath));
      writeFileSync(destPath, content, 'utf8');
      this._register(destPath);
      return;
    }

    if (force) {
      this._mkdir(dirname(destPath));
      writeFileSync(destPath, content, 'utf8');
      this._register(destPath);
      return;
    }

    // File already exists — ask the user (merge or skip only)
    const strategy = await askMergeStrategy(engine.entryFile);

    if (strategy === 'merge') {
      appendFileSync(destPath, '\n\n---\n\n' + content, 'utf8');
      // Do not register in createdFiles — pre-existing file
    }
    // 'skip' → do nothing
  }

  // Cria a estrutura interna .reversa/
  createReversaDir(answers, version) {
    const reversaDir = join(this.projectRoot, '.reversa');
    const configDir = join(reversaDir, '_config');

    this._mkdir(reversaDir);
    this._mkdir(configDir);
    this._mkdir(join(reversaDir, 'context'));

    // Estrutura forward (templates de corpo, scripts, hooks, setup)
    this._installForwardAssets(reversaDir, answers, version);

    // state.json
    const stateTemplate = readFileSync(join(TEMPLATES_DIR, 'state.json'), 'utf8');
    const state = JSON.parse(stateTemplate.replace('{{VERSION}}', version));
    state.project = answers.project_name;
    state.user_name = answers.user_name;
    state.chat_language = answers.chat_language;
    state.doc_language = answers.doc_language;
    state.answer_mode = answers.answer_mode;
    state.output_folder = answers.output_folder;
    state.engines = answers.engines;
    state.agents = answers.agents;

    const statePath = join(reversaDir, 'state.json');
    this._writeNew(statePath, JSON.stringify(state, null, 2));

    // config.toml — rendered with actual selections
    const configTemplate = readFileSync(join(TEMPLATES_DIR, 'config.toml'), 'utf8');
    const agentsList = answers.agents.map(a => `  "${a}"`).join(',\n');
    const enginesList = answers.engines.map(e => `  "${e}"`).join(',\n');
    const config = configTemplate
      .replace('name = ""', `name = "${answers.project_name}"`)
      .replace('name = ""', `name = "${answers.user_name}"`)
      .replace(/chat_language = ".*"/, `chat_language = "${answers.chat_language}"`)
      .replace(/doc_language = ".*"/, `doc_language = "${answers.doc_language}"`)
      .replace('folder = "_reversa_sdd"', `folder = "${answers.output_folder}"`)
      .replace(
        /\[agents\]\r?\ninstalled = \[[\s\S]*?\]/,
        `[agents]\ninstalled = [\n${agentsList}\n]`
      )
      .replace('installed = []', `installed = [\n${enginesList}\n]`)
      .replace('answer_mode = "chat"', `answer_mode = "${answers.answer_mode}"`);

    this._writeNew(join(reversaDir, 'config.toml'), config);
    this._writeNew(join(reversaDir, 'config.user.toml'),
      readFileSync(join(TEMPLATES_DIR, 'config.user.toml'), 'utf8'));

    // plan.md
    const planTemplate = readFileSync(join(TEMPLATES_DIR, 'plan.md'), 'utf8');
    const plan = planTemplate
      .replace('{{PROJECT}}', answers.project_name)
      .replace('{{DATE}}', new Date().toISOString().split('T')[0]);

    this._writeNew(join(reversaDir, 'plan.md'), plan);

    // version
    this._writeNew(join(reversaDir, 'version'), version);

    // manifest.yaml
    this._writeNew(join(configDir, 'manifest.yaml'),
      `installation:\n  version: ${version}\n  installDate: ${new Date().toISOString()}\n  lastUpdated: ${new Date().toISOString()}\n\nengines:\n${answers.engines.map(e => `  - ${e}`).join('\n')}\n\nagents:\n${answers.agents.map(a => `  - ${a}`).join('\n')}\n`
    );
  }

  // Copia body templates, scripts, hooks.yml e setup.json forward para .reversa/
  // Do not overwrite pre-existing files (preserve user edits on refresh)
  _installForwardAssets(reversaDir, answers, version) {
    const forwardSrc = join(TEMPLATES_DIR, 'forward');
    if (!existsSync(forwardSrc)) return;

    // Body templates → .reversa/templates/
    const bodySrc = join(forwardSrc, 'body');
    const bodyDest = join(reversaDir, 'templates');
    if (existsSync(bodySrc)) {
      this._mkdir(bodyDest);
      for (const file of readdirSync(bodySrc)) {
        const srcFile = join(bodySrc, file);
        const destFile = join(bodyDest, file);
        if (statSync(srcFile).isFile() && !existsSync(destFile)) {
          writeFileSync(destFile, readFileSync(srcFile, 'utf8'), 'utf8');
          this._register(destFile);
        }
      }
    }

    // Scripts sh + ps → .reversa/scripts/{sh,ps}/
    for (const flavor of ['sh', 'ps']) {
      const scriptSrc = join(forwardSrc, 'scripts', flavor);
      const scriptDest = join(reversaDir, 'scripts', flavor);
      if (!existsSync(scriptSrc)) continue;
      this._mkdir(scriptDest);
      for (const file of readdirSync(scriptSrc)) {
        const srcFile = join(scriptSrc, file);
        const destFile = join(scriptDest, file);
        if (statSync(srcFile).isFile() && !existsSync(destFile)) {
          writeFileSync(destFile, readFileSync(srcFile, 'utf8'), 'utf8');
          this._register(destFile);
        }
      }
    }

    // hooks.yml → .reversa/hooks.yml
    const hooksSrc = join(forwardSrc, 'hooks.yml');
    const hooksDest = join(reversaDir, 'hooks.yml');
    if (existsSync(hooksSrc) && !existsSync(hooksDest)) {
      writeFileSync(hooksDest, readFileSync(hooksSrc, 'utf8'), 'utf8');
      this._register(hooksDest);
    }

    // setup.json → .reversa/setup.json (com placeholders)
    const setupSrc = join(forwardSrc, 'setup.json');
    const setupDest = join(reversaDir, 'setup.json');
    if (existsSync(setupSrc) && !existsSync(setupDest)) {
      const rendered = readFileSync(setupSrc, 'utf8')
        .replace('{{VERSION}}', version)
        .replace('{{INSTALLED_AT}}', new Date().toISOString())
        .replace('{{PROJECT_NAME}}', answers.project_name ?? '');
      writeFileSync(setupDest, rendered, 'utf8');
      this._register(setupDest);
    }
  }

  // Refresca body templates, scripts e hooks.yml em .reversa/ a partir do pacote npm,
  // skipping files the user modified. setup.json is always preserved because it carries
  // project-specific data (project-name, installed-at, user prefix-format).
  //
  // modifiedSet: Set<string> with paths relative to projectRoot that must NOT be overwritten.
  refreshForwardAssets(modifiedSet) {
    const forwardSrc = join(TEMPLATES_DIR, 'forward');
    if (!existsSync(forwardSrc)) return;

    const reversaDir = join(this.projectRoot, '.reversa');

    // Body templates → .reversa/templates/
    const bodySrc = join(forwardSrc, 'body');
    const bodyDest = join(reversaDir, 'templates');
    if (existsSync(bodySrc)) {
      this._mkdir(bodyDest);
      for (const file of readdirSync(bodySrc)) {
        const srcFile = join(bodySrc, file);
        if (!statSync(srcFile).isFile()) continue;
        const destFile = join(bodyDest, file);
        const rel = this._rel(destFile).replace(/\\/g, '/');
        if (modifiedSet.has(rel)) continue;
        writeFileSync(destFile, readFileSync(srcFile, 'utf8'), 'utf8');
        this._register(destFile);
      }
    }

    // Scripts sh + ps → .reversa/scripts/{sh,ps}/
    for (const flavor of ['sh', 'ps']) {
      const scriptSrc = join(forwardSrc, 'scripts', flavor);
      const scriptDest = join(reversaDir, 'scripts', flavor);
      if (!existsSync(scriptSrc)) continue;
      this._mkdir(scriptDest);
      for (const file of readdirSync(scriptSrc)) {
        const srcFile = join(scriptSrc, file);
        if (!statSync(srcFile).isFile()) continue;
        const destFile = join(scriptDest, file);
        const rel = this._rel(destFile).replace(/\\/g, '/');
        if (modifiedSet.has(rel)) continue;
        writeFileSync(destFile, readFileSync(srcFile, 'utf8'), 'utf8');
        this._register(destFile);
      }
    }

    // hooks.yml → .reversa/hooks.yml
    const hooksSrc = join(forwardSrc, 'hooks.yml');
    const hooksDest = join(reversaDir, 'hooks.yml');
    const hooksRel = this._rel(hooksDest).replace(/\\/g, '/');
    if (existsSync(hooksSrc) && !modifiedSet.has(hooksRel)) {
      writeFileSync(hooksDest, readFileSync(hooksSrc, 'utf8'), 'utf8');
      this._register(hooksDest);
    }
    // setup.json intentionally skips refresh: it carries project data.
  }

  // Adiciona _reversa_sdd/ e .reversa/config.user.toml ao .gitignore
  updateGitignore(outputFolder) {
    const gitignorePath = join(this.projectRoot, '.gitignore');
    const lines = [
      '',
      '# Reversa',
      '.reversa/config.user.toml',
      `${outputFolder}/`,
    ].join('\n');

    if (existsSync(gitignorePath)) {
      const existing = readFileSync(gitignorePath, 'utf8');
      if (!existing.includes('# Reversa')) {
        appendFileSync(gitignorePath, lines, 'utf8');
      }
    } else {
      writeFileSync(gitignorePath, lines.trimStart(), 'utf8');
      this._register(gitignorePath);
    }
  }

  // Save the list of created files in state.json
  saveCreatedFiles() {
    const statePath = join(this.projectRoot, '.reversa', 'state.json');
    if (!existsSync(statePath)) return;
    const state = readJsonSafe(statePath);
    state.created_files = [...new Set([...(state.created_files ?? []), ...this.createdFiles])];
    writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
  }
}
