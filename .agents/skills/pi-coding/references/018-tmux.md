---
title: tmux Setup
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/tmux.md
source: git
fetched_at: 2026-04-29T12:03:11.539825023-03:00
rendered_js: false
word_count: 190
summary: Configure tmux for extended key support so Shift+Enter and Ctrl+Enter are correctly interpreted.
tags:
    - tmux
    - terminal-configuration
    - extended-keys
    - keyboard-mapping
    - csi-u
category: configuration
optimized: true
optimized_at: 2026-04-29T12:00:00Z
---
# tmux Setup

Pi works inside tmux, but tmux strips modifier information from certain keys by default. Without configuration, `Shift+Enter` and `Ctrl+Enter` become indistinguishable from plain `Enter`.

## Recommended Configuration

Add to `~/.tmux.conf`:

```tmux
set -g extended-keys on
set -g extended-keys-format csi-u
```

Then restart tmux:

```bash
tmux kill-server
tmux
```

## Why `csi-u` Is Recommended

With only `extended-keys on`, tmux defaults to `xterm` format:

| Key | Escape Sequence |
|-----|-----------------|
| Ctrl+C | `\x1b[27;5;99~` |
| Ctrl+D | `\x1b[27;5;100~` |
| Ctrl+Enter | `\x1b[27;5;13~` |

With `extended-keys-format csi-u`:

| Key | Escape Sequence |
|-----|-----------------|
| Ctrl+C | `\x1b[99;5u` |
| Ctrl+D | `\x1b[100;5u` |
| Ctrl+Enter | `\x1b[13;5u` |

Pi supports both formats, but `csi-u` is recommended.

## What This Fixes

| Key | Without extkeys | With `csi-u` |
|-----|-----------------|--------------|
| Enter | `\r` | `\r` |
| Shift+Enter | `\r` | `\x1b[13;2u` |
| Ctrl+Enter | `\r` | `\x1b[13;5u` |
| Alt/Option+Enter | `\x1b\r` | `\x1b[13;3u` |

This affects the default keybindings (`Enter` to submit, `Shift+Enter` for newline) and any custom keybindings using modified Enter.

## Requirements

- tmux 3.2 or later (`tmux -V` to check)
- A terminal emulator that supports extended keys (Ghostty, Kitty, iTerm2, WezTerm, Windows Terminal)