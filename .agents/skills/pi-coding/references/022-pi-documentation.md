---
title: Pi Documentation
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/index.md
source: git
fetched_at: 2026-04-29T12:02:56.682203093-03:00
rendered_js: false
word_count: 326
summary: Central hub for Pi terminal coding harness—setup, configuration, guides, and reference documentation.
tags:
    - coding-agent
    - terminal-tool
    - cli-utility
    - typescript-extensions
    - ai-development
    - developer-productivity
category: reference
optimized: true
optimized_at: 2026-04-29T12:00:00Z
---
# Pi Documentation

Pi is a minimal terminal coding harness designed to stay small at the core while being extended through TypeScript extensions, skills, prompt templates, themes, and pi packages.

## Quick Start

Install with npm:

```bash
npm install -g @mariozechner/pi-coding-agent
```

Run in a project directory:

```bash
pi
```

Authenticate with `/login` for subscription providers, or set an API key (e.g., `ANTHROPIC_API_KEY`) before starting pi. For the full first-run flow, see [[001-quickstart|Quickstart]].

## Start Here

| Guide | Description |
|-------|-------------|
| [[001-quickstart\|Quickstart]] | Install, authenticate, and run a first session |
| [[010-usage\|Using Pi]] | Interactive mode, slash commands, context files, CLI reference |
| [[015-providers\|Providers]] | Subscription and API-key setup for built-in providers |
| [[016-settings\|Settings]] | Global and project settings |
| [[021-keybindings\|Keybindings]] | Default shortcuts and custom keybindings |
| [[007-sessions\|Sessions]] | Session management, branching, and tree navigation |
| [[011-compaction\|Compaction]] | Context compaction and branch summarization |

## Customization

| Topic | Description |
|-------|-------------|
| [[004-extensions\|Extensions]] | TypeScript modules for tools, commands, events, and custom UI |
| [[012-skills\|Skills]] | Agent Skills for reusable on-demand capabilities |
| [[006-prompt-templates\|Prompt Templates]] | Reusable prompts that expand from slash commands |
| [[009-themes\|Themes]] | Built-in and custom terminal themes |
| [[005-packages\|Pi Packages]] | Bundle and share extensions, skills, prompts, and themes |
| [[014-models\|Custom Models]] | Add model entries for supported provider APIs |
| [[002-custom-provider\|Custom Providers]] | Implement custom APIs and OAuth flows |

## Programmatic Usage

| Topic | Description |
|-------|-------------|
| [[024-sdk\|SDK]] | Embed pi in Node.js applications |
| [[023-rpc\|RPC Mode]] | Integrate over stdin/stdout JSONL |
| [[020-json\|JSON Event Stream Mode]] | Print mode with structured events |
| [[026-tui\|TUI Components]] | Build custom terminal UI for extensions |

## Platform Setup

- [[019-windows|Windows]]
- [[008-termux|Termux on Android]]
- [[018-tmux|tmux]]
- [[013-terminal-setup|Terminal Setup]]
- [[017-shell-aliases|Shell Aliases]]

## Reference

- [[025-session-format|Session File Format]] — JSONL session file format, entry types, and SessionManager API

## Development

- [[003-development|Development]] — Local setup, project structure, and debugging