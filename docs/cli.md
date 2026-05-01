# CLI

Reversa has a simple CLI to manage the installation and lifecycle of agents in your project. All commands run with `npx reversa` in the project root.

---

## Available commands

### `install`

```bash
npx reversa install
```

Installs Reversa in the current legacy project. Detects present engines, asks for your preferences, and creates the entire required structure.

Use once, in the root of the project you want to analyze.

---

### `status`

```bash
npx reversa status
```

Shows the current analysis state: which phase is in progress, which agents have already run, what's left to complete.

Useful for a quick overview before resuming a session.

---

### `update`

```bash
npx reversa update
```

Updates agents to the latest version of Reversa.

The command is smart: it checks the SHA-256 manifest of each file and never overwrites files you've customized. If you made adjustments to any agent, they stay intact.

---

### `add-agent`

```bash
npx reversa add-agent
```

Adds a specific agent to the project. Useful if you didn't install all agents during the initial installation and now want to include, for example, Data Master or Design System.

---

### `add-engine`

```bash
npx reversa add-engine
```

Adds support for an AI engine that wasn't present when you installed. For example: you installed only for Claude Code and now want to add Codex.

---

### `uninstall`

```bash
npx reversa uninstall
```

Removes Reversa from the project: deletes the files created by the installation (`.reversa/`, `.agents/skills/reversa-*/`, engine entry files). Hooks installed by `add-hooks` are also stripped.

!!! info "Your files stay intact"
    `uninstall` removes **only** what Reversa created. No original project file is touched. Specifications generated in `_reversa_sdd/` are also preserved by default.

---

### `add-hooks`

```bash
npx reversa add-hooks --engine claude-code
```

Installs Chronicler hooks in your engine's config so the agent runs automatically after every file edit. Shows a preview, asks confirmation, then writes.

Supported engines: `claude-code`, `cursor`, `kimi-cli`, `codex`, `opencode`. See [Hooks](hooks.md) for the full reference.

---

### `remove-hooks`

```bash
npx reversa remove-hooks --engine claude-code
npx reversa remove-hooks --all
```

Strips Chronicler hooks from the engine config. Other hooks you added manually are preserved.

---

### `drift-check`

```bash
npx reversa drift-check
npx reversa drift-check --severity medium --format json
```

CI gate. Reads `_reversa_sdd/drift.md` and exits 1 if there are pending specs at the chosen severity. Engine-agnostic — no agent code is loaded. See [drift-check](drift-check.md) for the full reference.
