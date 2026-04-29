---
title: Development
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/development.md
source: git
fetched_at: 2026-04-29T12:02:55.407178462-03:00
rendered_js: false
word_count: 137
summary: Developer guidelines for setting up, configuring, and testing the pi-mono project.
tags:
    - development-setup
    - configuration-guide
    - path-resolution
    - testing-procedures
    - project-architecture
category: guide
optimized: true
optimized_at: 2026-04-29T12:00:00Z
---
# Development

See [AGENTS.md](../../../AGENTS.md) for additional guidelines.

## Setup

```bash
git clone https://github.com/badlogic/pi-mono
cd pi-mono
npm install
npm run build
```

Run from source with `/path/to/pi-mono/pi-test.sh`. The script runs from any directory; Pi preserves the caller's working directory.

## Forking / Rebranding

Configure via `package.json`:

```json
{
  "piConfig": {
    "name": "pi",
    "configDir": ".pi"
  }
}
```

Change `name`, `configDir`, and `bin` for your fork. These affect CLI banner, config paths, and environment variable names.

## Path Resolution

Three execution modes: npm install, standalone binary, tsx from source.

**Always use `src/config.ts`** for package assets:

```typescript
import { getPackageDir, getThemeDir } from "./config.js";
```

Never use `__dirname` directly for package assets.

## Debug Command

`/debug` (hidden) writes to `~/.pi/agent/pi-debug.log`:
- Rendered TUI lines with ANSI codes
- Last messages sent to the LLM

## Testing

| Command | Description |
|---------|-------------|
| `./test.sh` | Non-LLM tests (no API keys needed) |
| `npm test` | All tests |
| `npm test -- test/specific.test.ts` | Specific test file |

## Project Structure

```
packages/
  ai/           # LLM provider abstraction
  agent/        # Agent loop and message types  
  tui/          # Terminal UI components
  coding-agent/ # CLI and interactive mode
```