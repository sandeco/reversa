---
title: Windows Setup
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/windows.md
source: git
fetched_at: 2026-04-29T12:03:15.59277295-03:00
rendered_js: false
word_count: 43
summary: Configure bash shell and custom shell paths for Pi on Windows.
tags:
    - windows-setup
    - bash-shell
    - configuration-settings
    - environment-path
category: configuration
optimized: true
optimized_at: 2026-04-29T12:00:00Z
---
# Windows Setup

Pi requires a bash shell on Windows. Checked locations (in order):

1. Custom path from `~/.pi/agent/settings.json`
2. Git Bash (`C:\Program Files\Git\bin\bash.exe`)
3. `bash.exe` on PATH (Cygwin, MSYS2, WSL)

For most users, [Git for Windows](https://git-scm.com/download/win) is sufficient.

## Custom Shell Path

```json
{
  "shellPath": "C:\\cygwin64\\bin\\bash.exe"
}
```