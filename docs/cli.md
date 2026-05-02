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

**Non-interactive mode (CI/headless):**

```bash
npx reversa install --yes \
  --project my-app \
  --engines opencode,claude-code \
  --user Developer
```

Available flags: `--project`, `--engines`, `--user`, `--chat-language`, `--doc-language`, `--output`, `--git-strategy`, `--answer-mode`, `--agents`, `--reinstall=yes`.

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

Removes Reversa from the project: deletes the files created by the installation (`.reversa/`, `.agents/skills/reversa-*/`, engine entry files).

!!! info "Your files stay intact"
    `uninstall` removes **only** what Reversa created. No original project file is touched. Specifications generated in `_reversa_sdd/` are also preserved by default.

---

### `mcp`

```bash
npx reversa mcp
```

Starts the Reversa MCP server over stdio transport. Provides 3 tools, 2 resources, and 1 prompt for AI agent integration:

- **Tools:** `reversa_status(path)`, `reversa_analyze(path, level?)`, `reversa_confidence(path)`
- **Resources:** `reversa://state`, `reversa://inventory`
- **Prompt:** `reversa-new-analysis`

Configure in any MCP client:

```json
{
  "mcpServers": {
    "reversa": {
      "command": "npx",
      "args": ["reversa", "mcp"]
    }
  }
}
```

Use these to query state and reports without leaving the agent chat. The pipeline itself runs when the agent types `reversa` or `/reversa`.
