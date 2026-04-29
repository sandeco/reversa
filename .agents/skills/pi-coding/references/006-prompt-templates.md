---
title: Prompt Templates
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/prompt-templates.md
source: git
fetched_at: 2026-04-29T12:02:58.733284829-03:00
rendered_js: false
word_count: 198
summary: Create and use Markdown-based prompt templates that expand into full prompts via slash commands.
tags:
    - prompt-templates
    - markdown-snippets
    - cli-tools
    - automation-workflows
    - template-configuration
category: guide
optimized: true
optimized_at: 2026-04-29T12:00:00Z
---
> Ask pi to build a prompt template for your workflow.

# Prompt Templates

Markdown snippets that expand into full prompts. Type `/name` in the editor to invoke, where `name` is the filename without `.md`.

## Locations

| Source | Path |
|--------|------|
| Global | `~/.pi/agent/prompts/*.md` |
| Project | `.pi/prompts/*.md` |
| Packages | `prompts/` directories or `pi.prompts` in `package.json` |
| Settings | `prompts` array with files or directories |
| CLI | `--prompt-template <path>` (repeatable) |

Disable discovery with `--no-prompt-templates`. Discovery in `prompts/` is non-recursive—add subdirectories explicitly via settings or package manifest.

## Format

```markdown
---
description: Review staged git changes
---
Review the staged changes (`git diff --cached`). Focus on:
- Bugs and logic errors
- Security issues
- Error handling gaps
```

- Filename becomes the command name (`review.md` → `/review`)
- `description` is optional; first non-empty line is used if missing
- `argument-hint` is optional—displays in autocomplete before description

## Argument Hints

Use `<angle brackets>` for required arguments, `[square brackets]` for optional:

```markdown
---
description: Review PRs from URLs
argument-hint: "<PR-URL>"
---
```

Autocomplete renders as:

```
→ pr   <PR-URL>  — Review PRs from URLs
  is   <issue>   — Analyze GitHub issues
  wr   [instructions] — Finish current task end-to-end
```

## Arguments

| Token | Expansion |
|-------|-----------|
| `$1`, `$2`, ... | Positional args |
| `$@` or `$ARGUMENTS` | All args joined |
| `${@:N}` | Args from Nth position (1-indexed) |
| `${@:N:L}` | `L` args starting at N |

## Usage

```
/review                           # Expands review.md
/component Button                 # Expands with argument
/component Button "click handler" # Multiple arguments
```

Type `/` followed by the template name for autocomplete with descriptions.