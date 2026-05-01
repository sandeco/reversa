# Hooks (auto Chronicler)

Install hook configuration in your AI engine so the Chronicler runs automatically every time you edit a file.

Manual `/reversa-chronicler after` always works as a fallback. Hooks just remove the friction.

---

## Quick start

```bash
npx reversa add-hooks --engine claude-code   # or cursor, kimi-cli, codex, opencode
```

You will see a preview of exactly what will be written. Confirm to install.

To uninstall:

```bash
npx reversa remove-hooks --engine claude-code
npx reversa remove-hooks --all                # all engines at once
```

---

## What the hook does

When the engine triggers a tool that edits a file (`Edit`, `Write`, `MultiEdit`, `apply_patch`, `afterFileEdit`, etc.), the hook invokes the **Reversa hook runner** — a small Node script installed at `.reversa/_hooks/runner.js`.

The runner:

1. Appends an entry to `.reversa/chronicler-queue.json` (with a lock to handle concurrent edits)
2. Writes a stub to `_reversa_sdd/changelog/YYYY-MM-DD.md` so the change is at least mentioned even if you never run the Chronicler
3. Marks affected specs as `🔴 pending` in `_reversa_sdd/drift.md`
4. Prints a warning to your terminal if a high-confidence spec was touched

The runner **never blocks** the engine and **never modifies your code**. Errors are silently logged to `.reversa/chronicler-errors.log`.

Later, when you run `/reversa-chronicler after`, the agent reads the queue, asks the 3 questions, enriches the changelog, updates the specs, and clears the queue.

---

## Supported engines

| Engine | File | Events |
|---|---|---|
| Claude Code | `.claude/settings.json` | PreToolUse + PostToolUse (matcher `Edit\|Write\|MultiEdit`) |
| Cursor | `.cursor/hooks.json` | afterFileEdit (matcher `**/*`) |
| Kimi CLI | `.kimi/config.toml` (project) or `~/.kimi/config.toml` (global, with backup) | PreToolUse + PostToolUse (matcher `Edit\|Write`) |
| Codex | `.codex/hooks.toml` | PreToolUse + PostToolUse (matcher `apply_patch`) |
| Opencode | `.opencode/plugins/reversa-chronicler.js` | tool.execute.before/after |

For engines not listed (Gemini CLI, Aider, Roo, Cline, Copilot, Windsurf, Antigravity, Kiro, Amazon Q): use the manual `/reversa-chronicler` workflow.

---

## Safety guarantees

- **Preview before write.** `add-hooks` shows the exact JSON or TOML it will write and asks for confirmation.
- **No blind overwrites.** When merging into a config file that already exists (e.g. `.claude/settings.json`), Reversa preserves all existing keys and hook entries. Only entries identified by the marker `reversa/_hooks/runner.js` in the command string are touched.
- **Backup for global configs.** When editing `~/.kimi/config.toml`, a timestamped backup is saved as `~/.kimi/config.toml.bak.reversa-<ISO>`.
- **Idempotent install.** Running `add-hooks` twice for the same engine replaces the previous Reversa hooks; it does not duplicate.
- **Clean uninstall.** `remove-hooks` strips only Reversa-managed entries. Other hooks you added manually are preserved. `npx reversa uninstall` does the same automatically.

---

## Custom CI integration

Hooks fire only inside the engine. To enforce drift resolution on pull requests, pair hooks with [`npx reversa drift-check`](drift-check.md) in CI.

```yaml
# .github/workflows/ci.yml
- name: Reversa drift gate
  run: npx reversa drift-check --severity high
```

This way: hooks keep the queue and dashboard fresh as developers code locally, and CI blocks merges if anything was left unresolved.

---

## Architecture diagram

```
[Edit/Write in engine]
        │
        ▼
[Engine hook → spawns runner]
        │
        ▼
[.reversa/_hooks/runner.js]
        ├─→ append .reversa/chronicler-queue.json
        ├─→ stub _reversa_sdd/changelog/YYYY-MM-DD.md
        ├─→ mark _reversa_sdd/drift.md as pending
        └─→ stderr warning (high-confidence specs only)
        │
        ▼ (later, when developer runs the agent)
[/reversa-chronicler after]
        ├─→ asks 3 questions (why / breaking / context)
        ├─→ enriches changelog
        ├─→ updates specs in-place + reclassifies confidence
        ├─→ marks drift.md as resolved
        └─→ clears queue
        │
        ▼ (in CI)
[npx reversa drift-check]
        └─→ exit 1 if drift.md still has pending → blocks merge
```
