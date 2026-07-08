# Supported engines

Reversa works with the leading AI engines on the market. The installer automatically detects which ones are present in the environment, but you can add more at any time with `npx reversa add-engine`.

---

## Compatibility

| Engine | File created | Skills path | How to activate |
|--------|-------------|-------------|-----------------|
| **Claude Code** ⭐ | `CLAUDE.md` | `.claude/skills/reversa-*/` and `.agents/skills/reversa-*/` | `/reversa` |
| **Codex** ⭐ | `AGENTS.md` | `.agents/skills/reversa-*/` | `reversa` |
| **Cursor** ⭐ | `.cursorrules` | `.agents/skills/reversa-*/` | `/reversa` |
| **Gemini CLI** | `GEMINI.md` | `.agents/skills/reversa-*/` | `/reversa` |
| **Windsurf** | `.windsurfrules` | `.agents/skills/reversa-*/` | `/reversa` |
| **Antigravity** | `AGENTS.md` | `.agents/skills/reversa-*/` | `/reversa` |
| **Kiro** | (none) | `.kiro/skills/reversa-*/` and `.agents/skills/reversa-*/` | `/reversa` |
| **Opencode** | `AGENTS.md` | `.agents/skills/reversa-*/` | `reversa` |
| **Cline** | `.clinerules` | `.agents/skills/reversa-*/` | `/reversa` |
| **Roo Code** | `.roorules` | `.agents/skills/reversa-*/` | `/reversa` |
| **GitHub Copilot** | `.github/copilot-instructions.md` | `.agents/skills/reversa-*/` | `/reversa` |
| **Aider** | `CONVENTIONS.md` | `.agents/skills/reversa-*/` | `reversa` |
| **Amazon Q Developer** | `.amazonq/rules/reversa.md` | `.agents/skills/reversa-*/` | `/reversa` |
| **Mistral Vibe** | `AGENTS.md` | `.agents/skills/reversa-*/` | `reversa` |

---

## Claude Code

The most tested engine with the best support. Uses native slash commands, making activation intuitive. Reversa creates files in both `.claude/skills/` and `.agents/skills/` (for compatibility with other engines that may be added later).

---

## Codex

Fully compatible. Since Codex doesn't use slash commands, activation is by the agent name directly: `reversa`, `reversa-scout`, etc. The `AGENTS.md` file at the project root serves as the entry point.

---

## Cursor

Compatible via `.cursorrules`. Cursor reads the rules from this file and the agents are available as skills.

---

## Gemini CLI and Windsurf

Full support. Agents live in `.agents/skills/` and are accessed via each engine's native mechanisms.

---

## Antigravity

Google's agentic development platform, released in November 2025. Reads `AGENTS.md` natively (same file as Codex). If Codex is already installed in the project, the existing `AGENTS.md` is reused without duplication. CLI command: `agy`.

---

## Kiro

Amazon's agentic IDE. Kiro natively discovers skills in `.kiro/skills/`, no steering document required. The installer places agents in `.kiro/skills/` (and also in `.agents/skills/` for compatibility with other engines). Activation is via `/reversa` or auto-discovery from the skill description.

---

## Opencode

Open source coding agent for the terminal (SST). Reads `AGENTS.md` natively, same convention as Codex. CLI command: `opencode`. Like Codex, activation is by agent name: `reversa`.

---

## Cline and Roo Code

VS Code extensions with custom rules support via `.clinerules` and `.roorules` respectively. The pattern is identical to Cursor and Windsurf: a rules file at the project root that instructs the agent when activating `/reversa`.

---

## GitHub Copilot

Uses `.github/copilot-instructions.md` as a custom instructions file, automatically read by Copilot in every session. The installer creates the file inside `.github/` (which may already exist in the project).

---

## Aider

Coding agent for the terminal. The entry file `CONVENTIONS.md` at the root is passed via `--read CONVENTIONS.md` or configured in `.aider.conf.yml`. Like Codex and Opencode, activation is by name: `reversa`.

---

## Amazon Q Developer

AWS AI CLI. Uses rules in `.amazonq/rules/` to instruct the agent per project. The installer creates `.amazonq/rules/reversa.md` without interfering with other rules you may already have in that folder.

---

## Mistral Vibe

Mistral AI's coding agent for the terminal. Reads `AGENTS.md` natively (first one found walking up from the current directory), same convention as Codex and Opencode — if one of them is already installed, the existing `AGENTS.md` is reused without duplication. CLI command: `vibe`. Activation is by agent name: `reversa`.

---

## Multiple engines in the same project

You can have all engines installed at the same time. Agents in `.agents/skills/` are shared by all of them. The installer creates the specific entry files for each engine without conflict.

If you work in a team where each person uses a different engine, this works normally: everyone uses their engine's entry file, but all agents are in the same place.
