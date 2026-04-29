---
title: Quickstart
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/quickstart.md
source: git
fetched_at: 2026-04-29T12:03:00.673986581-03:00
rendered_js: false
word_count: 344
summary: This guide provides an introduction to the Pi coding agent, covering installation, authentication methods, project configuration, and essential commands for interactive and non-interactive usage.
tags:
    - pi-agent
    - coding-assistant
    - cli-tool
    - getting-started
    - project-setup
category: tutorial
optimized: true
optimized_at: 2026-04-29T00:00:00Z
---
# Quickstart

Get from install to a useful first pi session in minutes.

## Install

```bash
npm install -g @mariozechner/pi-coding-agent
cd /path/to/project
pi
```

## Authenticate

### Subscription login

Start pi and run `/login`, then select a provider (Claude Pro/Max, ChatGPT Plus/Pro/Codex, GitHub Copilot, Google Gemini CLI, Google Antigravity).

### API key

```bash
export ANTHROPIC_API_KEY=sk-ant-...
pi
```

Or run `/login` and select an API-key provider to store the key in `~/.pi/agent/auth.json`.

See [[015-providers.md|Providers]] for all supported providers, environment variables, and cloud-provider setup.

## First session

Type a request and press Enter. Pi gives the model four tools by default:

- `read` — read files
- `write` — create or overwrite files
- `edit` — patch files
- `bash` — run shell commands

Additional built-in read-only tools (`grep`, `find`, `ls`) are available through tool options. Pi runs in your current working directory and can modify files there. Use git or another checkpointing workflow for easy rollback.

## Give pi project instructions

Pi loads `AGENTS.md` or `CLAUDE.md` at startup from:

- `~/.pi/agent/AGENTS.md` for global instructions
- parent directories and the current directory

Create an `AGENTS.md` file to define project conventions:

```markdown
# Project Instructions

- Run `npm run check` after code changes.
- Do not run production migrations locally.
- Keep responses concise.
```

Restart pi or run `/reload` after changing context files.

## Common things to try

### Reference files

Type `@` in the editor to fuzzy-search files, or pass files on the command line:

```bash
pi @README.md "Summarize this"
pi @src/app.ts @src/app.test.ts "Review these together"
```

Paste images with Ctrl+V (Alt+V on Windows) or drag into supported terminals.

### Run shell commands

```text
!npm run lint
```

Use `!!command` to run without adding output to model context.

### Switch models

- `/model` or Ctrl+L — choose a model
- Shift+Tab — cycle thinking level
- Ctrl+P / Shift+Ctrl+P — cycle through scoped models

### Continue later

Sessions auto-save:

```bash
pi -c                  # Continue most recent session
pi -r                  # Browse previous sessions
pi --session <path|id> # Open a specific session
```

Inside pi: `/resume`, `/new`, `/tree`, `/fork`, `/clone`.

### Non-interactive mode

```bash
pi -p "Summarize this codebase"
cat README.md | pi -p "Summarize this text"
pi -p @screenshot.png "What's in this image?"
```

Use `--mode json` for JSON event output or `--mode rpc` for process integration.

## Next steps

- [[010-usage.md|Using Pi]] — interactive mode, slash commands, sessions, context files, CLI reference
- [[015-providers.md|Providers]] — authentication and model setup
- [[016-settings.md|Settings]] — global and project configuration
- [[021-keybindings.md|Keybindings]] — shortcuts and customization
- [[005-packages.md|Pi Packages]] — install shared extensions, skills, prompts, themes

Platform notes: [[019-windows.md|Windows]], [[008-termux.md|Termux]], [[018-tmux.md|tmux]], [[013-terminal-setup.md|Terminal Setup]], [[017-shell-aliases.md|Shell Aliases]]

#quickstart #pi-agent #getting-started
