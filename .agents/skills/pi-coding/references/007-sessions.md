---
title: Sessions
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/sessions.md
source: git
fetched_at: 2026-04-29T12:03:04.652788582-03:00
rendered_js: false
word_count: 731
summary: This document explains how to manage, navigate, and branch conversation sessions in the Pi tool, including command-line flags and interactive tree management features.
tags:
    - session-management
    - conversation-history
    - command-line-interface
    - data-persistence
    - branching-logic
    - file-storage
category: guide
optimized: true
optimized_at: 2026-04-29T00:00:00Z
---
# Sessions

Pi saves conversations as sessions so you can continue work, branch from earlier turns, and revisit previous paths. Sessions auto-save to `~/.pi/agent/sessions/`, organized by working directory.

## Session Storage

```bash
pi -c                  # Continue most recent session
pi -r                  # Browse and select from past sessions
pi --no-session        # Ephemeral mode; do not save
pi --session <path|id> # Use a specific session file or partial session ID
pi --fork <path|id>    # Fork a session file or partial session ID into a new session
```

Use `/session` in interactive mode to see the current session file, ID, message count, tokens, and cost.

For the JSONL file format, see [[025-session-format.md|Session Format]].

## Session Commands

| Command | Description |
|---------|-------------|
| `/resume` | Browse and select previous sessions |
| `/new` | Start a new session |
| `/name <name>` | Set the current session display name |
| `/session` | Show session info |
| `/tree` | Navigate the current session tree |
| `/fork` | Create a new session from a previous user message |
| `/clone` | Duplicate the current active branch into a new session |
| `/compact [prompt]` | Summarize older context |
| `/export [file]` | Export session to HTML |
| `/share` | Upload as private GitHub gist with shareable HTML link |

## Resuming and Deleting Sessions

`/resume` opens an interactive session picker for the current project. `pi -r` opens the same picker at startup.

In the picker:

| Key | Action |
|-----|--------|
| typing | search |
| Ctrl+P | toggle path display |
| Ctrl+S | toggle sort mode |
| Ctrl+N | filter to named sessions |
| Ctrl+R | rename |
| Ctrl+D | delete (then confirm) |

When available, pi uses the `trash` CLI for deletion instead of permanently removing files.

## Naming Sessions

```text
/name Refactor auth module
```

Named sessions are easier to find in `/resume` and `pi -r`.

## Branching with `/tree`

Sessions are stored as trees. Every entry has an `id` and `parentId`, and the current position is the active leaf. `/tree` lets you jump to any previous point and continue from there without creating a new file.

> [!example]
> Example tree shape:
> ```
> ├─ user: "Hello, can you help..."
> │  └─ assistant: "Of course! I can..."
> │     ├─ user: "Let's try approach A..."
> │     │  └─ assistant: "For approach A..."
> │     │     └─ user: "That worked..."  ← active
> │     └─ user: "Actually, approach B..."
> │        └─ assistant: "For approach B..."
> ```

### Tree Controls

| Key | Action |
|-----|--------|
| ↑/↓ | Navigate visible entries |
| ←/→ | Page up/down |
| Ctrl+←/Ctrl+→ or Alt+←/Alt+→ | Fold/unfold or jump between branch segments |
| Shift+L | Set or clear a label on the selected entry |
| Shift+T | Toggle label timestamps |
| Enter | Select entry |
| Escape/Ctrl+C | Cancel |
| Ctrl+O | Cycle filter mode |

Filter modes: default, no-tools, user-only, labeled-only, all. Configure default with `treeFilterMode` in [[016-settings.md|Settings]].

### Selection Behavior

- **Selecting a user or custom message:**
  1. Moves the leaf to the selected message's parent.
  2. Places the selected message text in the editor.
  3. Lets you edit and resubmit, creating a new branch.

- **Selecting an assistant, tool, compaction, or other non-user entry:**
  1. Moves the leaf to that entry.
  2. Leaves the editor empty.
  3. Lets you continue from that point.

- **Selecting the root user message:** Resets the leaf to an empty conversation and places the original prompt in the editor.

## `/tree`, `/fork`, and `/clone`

| Feature | `/tree` | `/fork` | `/clone` |
|---------|---------|---------|----------|
| Output | Same session file | New session file | New session file |
| View | Full tree | User-message selector | Current active branch |
| Typical use | Explore alternatives in place | Start a new session from an earlier prompt | Duplicate current work before continuing |
| Summary | Optional branch summary | None | None |

Use `/tree` when you want to keep alternatives together. Use `/fork` or `/clone` when you want a separate session file.

## Branch Summaries

When `/tree` switches away from one branch to another, pi can summarize the abandoned branch and attach that summary at the new position.

Choose one of:

1. no summary
2. summarize with the default prompt
3. summarize with custom focus instructions

See [[011-compaction.md|Compaction]] for branch summarization internals and extension hooks.

## Session Format

Session files are JSONL and contain message entries, model changes, thinking-level changes, labels, compactions, branch summaries, and extension entries.

For parsers, extensions, SDK usage, and the full SessionManager API, see [[025-session-format.md|Session Format]].

#sessions #session-management #branching-logic
