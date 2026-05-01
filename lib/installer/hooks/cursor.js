// Cursor hook generator.
//
// Writes to .cursor/hooks.json (project-level, committed).
// Adds afterFileEdit hook calling the Reversa runner.
//
// Reference: Cursor 1.7+ hooks via .cursor/hooks.json, event afterFileEdit
// receives { file_path, old_content, new_content } among other fields.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RUNNER_MARKER = 'reversa/_hooks/runner.js';
const HOOKS_REL = '.cursor/hooks.json';

function isReversaHook(entry) {
  return !!(entry && typeof entry.command === 'string' && entry.command.includes(RUNNER_MARKER));
}

export default {
  id: 'cursor',
  name: 'Cursor',

  describe() {
    return 'Adds afterFileEdit hook to .cursor/hooks.json';
  },

  generate({ projectRoot, runnerPath }) {
    const hooksPath = join(projectRoot, HOOKS_REL);
    const existing = existsSync(hooksPath)
      ? JSON.parse(readFileSync(hooksPath, 'utf8'))
      : {};

    const merged = { ...existing };
    const currentAfter = Array.isArray(merged.afterFileEdit) ? merged.afterFileEdit : [];
    const filtered = currentAfter.filter((e) => !isReversaHook(e));
    merged.afterFileEdit = [
      ...filtered,
      {
        command: `node "${runnerPath}" --phase post --engine cursor --tool afterFileEdit`,
        matchers: ['**/*'],
      },
    ];

    return {
      files: [{ path: hooksPath, content: JSON.stringify(merged, null, 2) + '\n' }],
      summary: [
        `Will write to: ${HOOKS_REL}`,
        `  afterFileEdit[]  ← matcher **/*, command: node ${runnerPath} --phase post …`,
      ].join('\n'),
    };
  },

  remove({ projectRoot }) {
    const hooksPath = join(projectRoot, HOOKS_REL);
    const result = { removed: [], cleaned: [] };
    if (!existsSync(hooksPath)) return result;

    const data = JSON.parse(readFileSync(hooksPath, 'utf8'));
    let changed = false;
    for (const evt of ['afterFileEdit', 'beforeFileEdit', 'beforeShellExecution', 'afterShellExecution']) {
      if (!Array.isArray(data[evt])) continue;
      const filtered = data[evt].filter((e) => !isReversaHook(e));
      if (filtered.length !== data[evt].length) {
        if (filtered.length === 0) delete data[evt];
        else data[evt] = filtered;
        changed = true;
      }
    }

    if (changed) {
      writeFileSync(hooksPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
      result.cleaned.push(hooksPath);
    }
    return result;
  },
};
