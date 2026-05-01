// Codex hook generator.
//
// Writes to .codex/hooks.toml (project-level). Codex hooks (GA late 2025)
// support pre/post tool events around apply_patch operations.
//
// Marker-bracketed section so remove() is precise without touching
// user-managed entries elsewhere in the file.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SECTION_START = '# >>> reversa-chronicler hooks (do not edit between markers) >>>';
const SECTION_END = '# <<< reversa-chronicler hooks <<<';
const HOOKS_REL = '.codex/hooks.toml';

function buildSection(runnerPath) {
  const cmdPre = `node "${runnerPath}" --phase pre --engine codex --tool apply_patch`;
  const cmdPost = `node "${runnerPath}" --phase post --engine codex --tool apply_patch`;
  return [
    SECTION_START,
    '[[hook]]',
    'event = "PreToolUse"',
    'matcher = "apply_patch"',
    `command = """${cmdPre}"""`,
    '',
    '[[hook]]',
    'event = "PostToolUse"',
    'matcher = "apply_patch"',
    `command = """${cmdPost}"""`,
    SECTION_END,
    '',
  ].join('\n');
}

function stripExistingSection(content) {
  const startIdx = content.indexOf(SECTION_START);
  if (startIdx === -1) return content;
  const endIdx = content.indexOf(SECTION_END, startIdx);
  if (endIdx === -1) return content;
  const tail = content.slice(endIdx + SECTION_END.length);
  return content.slice(0, startIdx).replace(/\n+$/, '\n') + tail.replace(/^\n+/, '\n');
}

export default {
  id: 'codex',
  name: 'Codex',

  describe() {
    return 'Adds [[hook]] PreToolUse + PostToolUse to .codex/hooks.toml';
  },

  generate({ projectRoot, runnerPath }) {
    const target = join(projectRoot, HOOKS_REL);
    const existing = existsSync(target) ? readFileSync(target, 'utf8') : '';
    const stripped = stripExistingSection(existing);
    const merged = stripped + (stripped.length > 0 && !stripped.endsWith('\n') ? '\n' : '')
      + (stripped.length > 0 ? '\n' : '')
      + buildSection(runnerPath);

    return {
      files: [{ path: target, content: merged }],
      summary: [
        `Will write to: ${HOOKS_REL}`,
        `  Adds [[hook]] PreToolUse + PostToolUse (matcher apply_patch)`,
        `  Existing entries preserved; Reversa section bracketed by markers.`,
      ].join('\n'),
    };
  },

  remove({ projectRoot }) {
    const target = join(projectRoot, HOOKS_REL);
    const result = { removed: [], cleaned: [] };
    if (!existsSync(target)) return result;
    const existing = readFileSync(target, 'utf8');
    if (!existing.includes(SECTION_START)) return result;
    const stripped = stripExistingSection(existing).replace(/\n{3,}/g, '\n\n');
    writeFileSync(target, stripped, 'utf8');
    result.cleaned.push(target);
    return result;
  },
};
