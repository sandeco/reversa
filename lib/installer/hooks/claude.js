// Claude Code hook generator.
//
// Writes hook configuration to .claude/settings.json (project-level, committed).
// Adds PreToolUse + PostToolUse matchers for Edit / Write / MultiEdit
// that invoke the Reversa hook runner.
//
// Existing settings.json contents are preserved — only hooks created by Reversa
// are touched, identified by the marker in the command string.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const RUNNER_MARKER = 'reversa/_hooks/runner.js';
const SETTINGS_REL = '.claude/settings.json';

function buildHookEntries(runnerPath) {
  const cmd = (phase) =>
    `node "${runnerPath}" --phase ${phase} --engine claude-code --tool "$CLAUDE_TOOL_NAME"`;

  return {
    PreToolUse: {
      matcher: 'Edit|Write|MultiEdit',
      hooks: [{ type: 'command', command: cmd('pre') }],
    },
    PostToolUse: {
      matcher: 'Edit|Write|MultiEdit',
      hooks: [{ type: 'command', command: cmd('post') }],
    },
  };
}

function isReversaHook(entry) {
  if (!entry || !Array.isArray(entry.hooks)) return false;
  return entry.hooks.some((h) => typeof h.command === 'string' && h.command.includes(RUNNER_MARKER));
}

export default {
  id: 'claude-code',
  name: 'Claude Code',

  describe() {
    return 'Adds PreToolUse/PostToolUse hooks (Edit|Write|MultiEdit) to .claude/settings.json';
  },

  generate({ projectRoot, runnerPath }) {
    const settingsPath = join(projectRoot, SETTINGS_REL);
    const existing = existsSync(settingsPath)
      ? JSON.parse(readFileSync(settingsPath, 'utf8'))
      : {};

    const newEntries = buildHookEntries(runnerPath);
    const merged = { ...existing };
    merged.hooks = { ...(existing.hooks ?? {}) };

    for (const evt of ['PreToolUse', 'PostToolUse']) {
      const current = Array.isArray(merged.hooks[evt]) ? merged.hooks[evt] : [];
      const filtered = current.filter((e) => !isReversaHook(e));
      merged.hooks[evt] = [...filtered, newEntries[evt]];
    }

    return {
      files: [{ path: settingsPath, content: JSON.stringify(merged, null, 2) + '\n' }],
      summary: [
        `Will write to: ${SETTINGS_REL}`,
        `  hooks.PreToolUse[]  ← matcher Edit|Write|MultiEdit, command: node ${runnerPath} --phase pre …`,
        `  hooks.PostToolUse[] ← matcher Edit|Write|MultiEdit, command: node ${runnerPath} --phase post …`,
      ].join('\n'),
    };
  },

  remove({ projectRoot }) {
    const settingsPath = join(projectRoot, SETTINGS_REL);
    const result = { removed: [], cleaned: [] };
    if (!existsSync(settingsPath)) return result;

    const data = JSON.parse(readFileSync(settingsPath, 'utf8'));
    if (!data.hooks) return result;

    let changed = false;
    for (const evt of ['PreToolUse', 'PostToolUse']) {
      if (!Array.isArray(data.hooks[evt])) continue;
      const filtered = data.hooks[evt].filter((e) => !isReversaHook(e));
      if (filtered.length !== data.hooks[evt].length) {
        if (filtered.length === 0) delete data.hooks[evt];
        else data.hooks[evt] = filtered;
        changed = true;
      }
    }

    if (changed) {
      const stillHasHooks = Object.keys(data.hooks).length > 0;
      if (!stillHasHooks) delete data.hooks;
      writeFileSync(settingsPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
      result.cleaned.push(settingsPath);
    }

    return result;
  },
};
