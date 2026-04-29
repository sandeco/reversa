---
title: Termux (Android) Setup
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/termux.md
source: git
fetched_at: 2026-04-29T12:03:09.516222789-03:00
rendered_js: false
word_count: 160
summary: Install and configure Pi within the Termux Linux environment on Android.
tags:
    - termux
    - android
    - linux-environment
    - setup-guide
    - cli-tools
    - environment-configuration
category: guide
optimized: true
optimized_at: 2026-04-29T12:00:00Z
---
# Termux (Android) Setup

Pi runs on Android via [Termux](https://termux.dev/), a terminal emulator and Linux environment.

## Prerequisites

1. Install [Termux](https://github.com/termux/termux-app#installation) from GitHub or F-Droid (not Google Play—the Play version is deprecated)
2. Install [Termux:API](https://github.com/termux/termux-api#installation) for clipboard and device integrations

## Installation

```bash
# Update packages
pkg update && pkg upgrade

# Install dependencies
pkg install nodejs termux-api git

# Install pi
npm install -g @mariozechner/pi-coding-agent

# Create config directory
mkdir -p ~/.pi/agent

# Run pi
pi
```

## Clipboard Support

Clipboard operations use `termux-clipboard-set` and `termux-clipboard-get` when running in Termux. The Termux:API app must be installed.

> [!warning]
> Image clipboard (Ctrl+V paste) is not supported on Termux.

## Example AGENTS.md

Create `~/.pi/agent/AGENTS.md` to help the agent understand the Termux environment:

```markdown
# Agent Environment: Termux on Android

## Location
- **OS**: Android (Termux terminal emulator)
- **Home**: `/data/data/com.termux/files/home`
- **Prefix**: `/data/data/com.termux/files/usr`
- **Shared storage**: `/storage/emulated/0` (Downloads, Documents, etc.)

## Opening URLs
termux-open-url "https://example.com"

## Opening Files
termux-open file.pdf          # Opens with default app
termux-open -c image.jpg      # Choose app

## Clipboard
termux-clipboard-set "text"   # Copy
termux-clipboard-get          # Paste

## Notifications
termux-notification -t "Title" -c "Content"

## Device Info
termux-battery-status         # Battery info
termux-wifi-connectioninfo    # WiFi info
termux-telephony-deviceinfo   # Device info

## Sharing
termux-share -a send file.txt # Share file

## Other Useful Commands
termux-toast "message"        # Quick toast popup
termux-vibrate                # Vibrate device
termux-tts-speak "hello"      # Text to speech
termux-camera-photo out.jpg   # Take photo

## Notes
- Termux:API app must be installed for `termux-*` commands
- Use `pkg install termux-api` for the command-line tools
- Storage permission needed for `/storage/emulated/0` access
```

## Limitations

| Limitation | Details |
|------------|---------|
| No image clipboard | Termux clipboard API only supports text |
| No native binaries | Some optional dependencies (clipboard module) unavailable on Android ARM64 |
| Storage access | Run `termux-setup-storage` once to grant permissions for `/storage/emulated/0` |

## Troubleshooting

### Clipboard not working

Ensure both apps are installed (from GitHub or F-Droid), then:

```bash
pkg install termux-api
```

### Permission denied for shared storage

```bash
termux-setup-storage
```

### Node.js installation issues

```bash
npm cache clean --force
```