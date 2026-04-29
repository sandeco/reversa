---
title: Terminal Setup
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/terminal-setup.md
source: git
fetched_at: 2026-04-29T12:03:08.773205822-03:00
rendered_js: false
word_count: 242
summary: Configure terminal emulators for Kitty keyboard protocol compatibility and proper modifier key handling.
tags:
    - terminal-setup
    - kitty-keyboard-protocol
    - keyboard-shortcuts
    - configuration-guide
    - cli-tools
category: configuration
optimized: true
optimized_at: 2026-04-29T12:00:00Z
---
# Terminal Setup

Pi uses the [Kitty keyboard protocol](https://sw.kovidgoyal.net/kitty/keyboard-protocol/) for reliable modifier key detection. Most modern terminals support this natively.

## Out of the Box

- Kitty
- iTerm2
- Ghostty (with caveats, see below)

## Ghostty

Add to your config (`~/Library/Application Support/com.mitchellh.ghostty/config` on macOS, `~/.config/ghostty/config` on Linux):

```
keybind = alt+backspace=text:\x1b\x7f
```

> [!warning]
> Older Claude Code versions may have added this mapping:
> ```
> keybind = shift+enter=text:\n
> ```
> This sends a raw linefeed indistinguishable from `Ctrl+J`, breaking tmux and pi's Shift+Enter detection.
>
> If Claude Code 2.x+ is the only reason for this mapping, remove it. To keep Shift+Enter working in tmux, add to `~/.pi/agent/keybindings.json`:
> ```json
> { "newLine": ["shift+enter", "ctrl+j"] }
> ```

## WezTerm

Create `~/.wezterm.lua`:

```lua
local wezterm = require 'wezterm'
local config = wezterm.config_builder()
config.enable_kitty_keyboard = true
return config
```

## VS Code (Integrated Terminal)

Add to `keybindings.json` (location varies by OS) to enable `Shift+Enter` for multi-line input:

```json
{
  "key": "shift+enter",
  "command": "workbench.action.terminal.sendSequence",
  "args": { "text": "\u001b[13;2u" },
  "when": "terminalFocus"
}
```

## Windows Terminal

Add to `settings.json` (Ctrl+Shift+, or Settings → Open JSON file):

```json
{
  "actions": [
    {
      "command": { "action": "sendInput", "input": "\u001b[13;2u" },
      "keys": "shift+enter"
    },
    {
      "command": { "action": "sendInput", "input": "\u001b[13;3u" },
      "keys": "alt+enter"
    }
  ]
}
```

> [!warning]
> Windows Terminal binds `Alt+Enter` to fullscreen by default, preventing pi from receiving it for follow-up queueing. The mapping above forwards the real key chord.

If the old fullscreen behavior persists, fully close and reopen Windows Terminal.

## Unsupported Terminals

These terminals have limited escape sequence support—modified Enter keys cannot be distinguished:

- xfce4-terminal
- terminator
- IntelliJ IDEA (built-in terminal)

For best experience, use a terminal with Kitty keyboard protocol support:

- [Kitty](https://sw.kovidgoyal.net/kitty/)
- [Ghostty](https://ghostty.org/)
- [WezTerm](https://wezfurlong.org/wezterm/)
- [iTerm2](https://iterm2.com/)
- [Alacritty](https://github.com/alacritty/alacritty) (requires compilation with Kitty protocol support)