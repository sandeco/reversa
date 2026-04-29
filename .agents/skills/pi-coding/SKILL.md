---
name: pi-coding
description: |
  pi-coding-agent — terminal-based coding agent CLI by @mariozechner with TypeScript extensions, skills, custom providers, sessions, RPC, and SDK.
    Use when: installing, configuring, or scripting the `pi` CLI; authoring pi extensions/skills/themes/prompts; embedding pi via SDK/RPC; configuring providers, models, settings, terminal, or session storage.
    Triggers: install or use the pi coding agent CLI; configure pi providers, models, or settings; write pi extensions, skills, or prompt templates; integrate pi via SDK, RPC, or JSON event stream; troubleshoot pi terminal/tmux/keybinding setup.
    Do NOT use when: the task is unrelated to the pi-coding-agent or covered by a more specific Claude/Codex/Aider skill.
    Commands: `pi`, `pi @file`, `/login`, `/help`, `pi --list-models`, `pi --print`, `pi --rpc`.
    Keywords: configuration, session, shell, tui, termux, models, tmux, rpc, explains, configure, json, providers.
compatibility: |
  Requires Node.js 18+. CLI binary `pi` installed globally via npm. Extensions written in TypeScript.
allowed-tools:
  - Bash(pi:*)
  - Read
  - Write
  - Edit
metadata:
  source: https://github.com/badlogic/pi-mono
  total_docs: 26
  generated: 2026-04-29
  generator: create-skill-docs@v2
  author: diogo
---

# pi-coding-agent

> Terminal-based coding agent CLI with TypeScript extensions, custom providers, sessions, and SDK/RPC integration.

## When to use

- Installing or first-time setup of the `pi` CLI on macOS/Linux/Termux/Windows
- Configuring providers (Anthropic, OpenAI, Google, GitHub Copilot) and API keys
- Authoring extensions, skills, prompt templates, themes, or packages
- Embedding or driving pi via SDK, RPC, or JSON event stream
- Tuning terminal/tmux/keybindings/Kitty protocol for pi
- Configuring custom models via `~/.pi/agent/models.json`
- Managing sessions, branches, and compaction

## When NOT to use

- The task targets a different coding-agent (Claude Code, Codex, Aider, Cursor, Continue)
- Generic LLM API usage with no `pi` involvement
- Editing the pi-mono codebase itself for upstream contribution (use the upstream repo guidelines)

## Quick Start

```bash
npm install -g @mariozechner/pi-coding-agent
cd /path/to/project
export ANTHROPIC_API_KEY=sk-ant-...
pi
```

## Installation

```bash
npm install -g @mariozechner/pi-coding-agent
```

After install, run `pi` then `/login` to set up a provider, or export an API key (e.g. `ANTHROPIC_API_KEY`) before launching.

## Commands

| Command | Purpose |
|---|---|
| `pi` | Start interactive coding session in current dir |
| `pi @file [prompt]` | Run with file refs in non-interactive mode |
| `pi --print "prompt"` | One-shot non-interactive output |
| `pi --list-models` | Print all available models |
| `pi --rpc` | RPC mode: JSON over stdin/stdout |
| `/login` | Authenticate provider (subscription or API key) |
| `/help` | Show slash commands |
| `/debug` | Hidden: write debug log to `~/.pi/agent/pi-debug.log` |

## Common Tasks

### Custom provider
→ `references/002-custom-provider.md`
```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerProvider("anthropic", {
    baseUrl: "https://proxy.example.com"
  });

  pi.registerProvider("my-provider", {
    baseUrl: "https://api.example.com",
    apiKey: "MY_API_KEY",
    api: "openai-completions",
    models: [
      {
        id: "my-model",
        name: "My Model",
        reasoning: false,
        input: ["text", "image"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 128000,
        maxTokens: 4096
      }
    ]
  });
}
```

### Development setup
→ `references/003-development.md`
```bash
git clone https://github.com/badlogic/pi-mono
cd pi-mono
npm install
npm run build
```

### Extensions (events + custom tools)
→ `references/004-extensions.md`
```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.notify("Extension loaded!", "info");
  });

  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName === "bash" && event.input.command?.includes("rm -rf")) {
      const ok = await ctx.ui.confirm("Dangerous!", "Allow rm -rf?");
      if (!ok) return { block: true, reason: "Blocked by user" };
    }
  });

  pi.registerTool({
    name: "greet",
    label: "Greet",
    description: "Greet someone by name",
    parameters: Type.Object({ name: Type.String() }),
    async execute(_id, params) { return { ok: true, output: `Hi ${params.name}` }; },
  });
}
```

### Packages (install/remove/update)
→ `references/005-packages.md`
```bash
pi install npm:@foo/bar@1.0.0
pi install git:github.com/user/repo@v1
pi install https://github.com/user/repo
pi install /absolute/path/to/package

pi remove npm:@foo/bar
pi list                     # show installed packages
pi update                   # update pi and all non-pinned packages
pi update --extensions      # update packages only
pi update --self            # update pi only
```

### Prompt templates (slash commands)
→ `references/006-prompt-templates.md`
```markdown
---
description: Review staged git changes
---
Review the staged changes (`git diff --cached`). Focus on:
- Bugs and logic errors
- Security issues
- Error handling gaps
```

### Sessions (continue / fork / ephemeral)
→ `references/007-sessions.md`
```bash
pi -c                  # Continue most recent session
pi -r                  # Browse and select from past sessions
pi --no-session        # Ephemeral mode; do not save
pi --session <path|id> # Use a specific session file or partial session ID
pi --fork <path|id>    # Fork a session into a new branch
```

### Termux setup (Android)
→ `references/008-termux.md`
```bash
pkg update && pkg upgrade
pkg install nodejs termux-api git
npm install -g @mariozechner/pi-coding-agent
mkdir -p ~/.pi/agent
pi
```

## Documentation

Full reference in `references/`. Start with `references/000-index.md`.

### By Topic

| Topic | Files | Description |
|---|---|---|
| Tutorial | 001 | Quickstart and onboarding |
| Concept | 011-012 | Compaction and skill model |
| Configuration | 013-019 | Terminal, models, providers, settings, shell, tmux, windows |
| Guide | 002-010 | Extensions, packages, prompts, sessions, themes, usage |
| Reference | 020-025 | JSON stream, keybindings, RPC, session format |
| API | 024, 026 | SDK and TUI component framework |

### By Keyword

| Keyword | File |
|---|---|
| configuration | `references/016-settings.md` |
| session | `references/007-sessions.md` |
| shell | `references/017-shell-aliases.md` |
| tui | `references/026-tui.md` |
| termux | `references/008-termux.md` |
| models | `references/014-models.md` |
| tmux | `references/018-tmux.md` |
| rpc | `references/023-rpc.md` |
| providers | `references/015-providers.md` |
| custom-provider | `references/002-custom-provider.md` |
| extensions | `references/004-extensions.md` |
| packages | `references/005-packages.md` |
| prompt-templates | `references/006-prompt-templates.md` |
| skills | `references/012-skills.md` |
| themes | `references/009-themes.md` |
| compaction | `references/011-compaction.md` |
| keybindings | `references/021-keybindings.md` |
| json-stream | `references/020-json.md` |
| sdk | `references/024-sdk.md` |
| session-format | `references/025-session-format.md` |

### Learning Path

1. 001-quickstart.md — install and first session
2. 015-providers.md — set up auth and providers
3. 010-usage.md — interactive mode, slash commands, contexts
4. 014-models.md — configure custom models
5. 016-settings.md — global and project settings
6. 012-skills.md — author skills
7. 004-extensions.md — develop TypeScript extensions
8. 024-sdk.md — embed pi via SDK
9. 023-rpc.md — drive pi headlessly via RPC

## Notes

- Generated by create-skill-docs from `/home/diogo/dev/library-docs/pi-coding` on 2026-04-29.
- Regenerate with `./regenerate.sh`.
- See `.skill-meta.json` for checksums and drift detection.
