// Kimi CLI hook generator.
//
// Writes to .kimi/config.toml (project-level) if it exists, otherwise
// to ~/.kimi/config.toml (global). Always backs up the file before
// modifying with timestamped suffix.
//
// Adds [[hooks]] entries with event PostToolUse + matcher Edit|Write.
//
// Marker-based isolation: entries are bracketed by Reversa-managed
// header/footer lines so remove() can strip them precisely without
// touching unrelated user-defined hooks.

import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const RUNNER_MARKER = 'reversa/_hooks/runner.js';
const SECTION_START = '# >>> reversa-chronicler hooks (do not edit between markers) >>>';
const SECTION_END = '# <<< reversa-chronicler hooks <<<';

function buildSection(runnerPath) {
  const cmdPre = `node "${runnerPath}" --phase pre --engine kimi-cli --tool $KIMI_TOOL_NAME`;
  const cmdPost = `node "${runnerPath}" --phase post --engine kimi-cli --tool $KIMI_TOOL_NAME`;
  return [
    SECTION_START,
    '[[hooks]]',
    'event = "PreToolUse"',
    'matcher = "Edit|Write"',
    `command = """${cmdPre}"""`,
    '',
    '[[hooks]]',
    'event = "PostToolUse"',
    'matcher = "Edit|Write"',
    `command = """${cmdPost}"""`,
    SECTION_END,
    '',
  ].join('\n');
}

function configPath(projectRoot) {
  const projectLevel = join(projectRoot, '.kimi', 'config.toml');
  if (existsSync(projectLevel)) return projectLevel;
  return join(homedir(), '.kimi', 'config.toml');
}

function stripExistingSection(content) {
  const startIdx = content.indexOf(SECTION_START);
  if (startIdx === -1) return content;
  const endIdx = content.indexOf(SECTION_END, startIdx);
  if (endIdx === -1) return content;
  const tail = content.slice(endIdx + SECTION_END.length);
  return content.slice(0, startIdx).replace(/\n+$/, '\n') + tail.replace(/^\n+/, '\n');
}

function backup(path) {
  if (!existsSync(path)) return null;
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const bak = `${path}.bak.reversa-${ts}`;
  copyFileSync(path, bak);
  return bak;
}

export default {
  id: 'kimi-cli',
  name: 'Kimi CLI',

  describe() {
    return 'Adds [[hooks]] entries to .kimi/config.toml or ~/.kimi/config.toml (with backup)';
  },

  generate({ projectRoot, runnerPath }) {
    const target = configPath(projectRoot);
    const existing = existsSync(target) ? readFileSync(target, 'utf8') : '';
    const stripped = stripExistingSection(existing);
    const merged = stripped + (stripped.endsWith('\n') || stripped.length === 0 ? '' : '\n')
      + (stripped.length > 0 ? '\n' : '')
      + buildSection(runnerPath);

    return {
      files: [{ path: target, content: merged }],
      summary: [
        `Will write to: ${target}`,
        `  Adds [[hooks]] PreToolUse + PostToolUse (matcher Edit|Write)`,
        `  Existing config preserved; Reversa section bracketed by markers.`,
        `  Backup will be saved as: ${target}.bak.reversa-<timestamp>`,
      ].join('\n'),
    };
  },

  remove({ projectRoot }) {
    const target = configPath(projectRoot);
    const result = { removed: [], cleaned: [] };
    if (!existsSync(target)) return result;
    const existing = readFileSync(target, 'utf8');
    if (!existing.includes(SECTION_START)) return result;
    backup(target);
    const stripped = stripExistingSection(existing).replace(/\n{3,}/g, '\n\n');
    writeFileSync(target, stripped, 'utf8');
    result.cleaned.push(target);
    return result;
  },

  // Shared with the writer if needed
  __runnerMarker: RUNNER_MARKER,
};
