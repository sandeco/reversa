---
title: Shell Aliases
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/shell-aliases.md
source: git
fetched_at: 2026-04-29T12:03:06.786357934-03:00
rendered_js: false
word_count: 31
summary: Enable shell aliases in Pi's non-interactive bash environment.
tags:
    - shell-aliases
    - bash-configuration
    - pi-agent
    - environment-variables
    - terminal-settings
category: configuration
optimized: true
optimized_at: 2026-04-29T12:00:00Z
---
# Shell Aliases

Pi runs bash in non-interactive mode (`bash -c`), which doesn't expand aliases by default.

Add to `~/.pi/agent/settings.json`:

```json
{
  "shellCommandPrefix": "shopt -s expand_aliases\neval \"$(grep '^alias ' ~/.zshrc)\""
}
```

Adjust the path (`~/.zshrc`, `~/.bashrc`, etc.) to match your shell config.