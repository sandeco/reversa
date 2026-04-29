---
title: Packages
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/packages.md
source: git
fetched_at: 2026-04-29T12:02:58.688986182-03:00
rendered_js: false
word_count: 574
summary: This document explains how to create, install, and manage Pi packages, which are bundles of extensions, skills, prompts, and themes used to extend Pi functionality.
tags:
    - pi-packages
    - package-management
    - extension-development
    - npm
    - git-integration
    - configuration
category: guide
optimized: true
optimized_at: 2026-04-29T00:00:00Z
---
# Pi Packages

> pi can help you create pi packages. Ask it to bundle your extensions, skills, prompt templates, or themes.

Pi packages bundle extensions, skills, prompt templates, and themes for sharing via npm or git.

## Install and Manage

> [!warning]
> Pi packages run with full system access. Extensions execute arbitrary code, and skills can instruct the model to perform any action. Review source code before installing third-party packages.

```bash
pi install npm:@foo/bar@1.0.0
pi install git:github.com/user/repo@v1
pi install https://github.com/user/repo
pi install /absolute/path/to/package
pi install ./relative/path/to/package

pi remove npm:@foo/bar
pi list                     # show installed packages
pi update                   # update pi and all non-pinned packages
pi update --extensions      # update packages only
pi update --self            # update pi only
pi update --self --force    # reinstall pi even if current
pi update npm:@foo/bar       # update one package
```

By default, `install` and `remove` write to global settings (`~/.pi/agent/settings.json`). Use `-l` to write to project settings (`.pi/settings.json`). Project settings can be shared with your team, and pi installs missing packages automatically on startup.

Try a package without installing:

```bash
pi -e npm:@foo/bar
pi -e git:github.com/user/repo
```

## Package Sources

### npm

```
npm:@scope/pkg@1.2.3
npm:pkg
```

- Versioned specs are pinned and skipped by `pi update`.
- Global installs use `npm install -g`.
- Project installs go under `.pi/npm/`.
- Set `npmCommand` in `settings.json` to pin npm operations to a wrapper like `mise` or `asdf`:

```json
{ "npmCommand": ["mise", "exec", "node@20", "--", "npm"] }
```

### git

```
git:github.com/user/repo@v1
git:git@github.com:user/repo@v1
https://github.com/user/repo@v1
ssh://git@github.com/user/repo@v1
```

- Without `git:` prefix, only full protocol URLs are accepted.
- With `git:` prefix, shorthand formats work (`github.com/user/repo`, `git@github.com:user/repo`).
- SSH URLs use configured SSH keys (respects `~/.ssh/config`).
- For CI, set `GIT_TERMINAL_PROMPT=0` and `GIT_SSH_COMMAND` to fail fast.
- Refs pin the package and skip `pi update`.
- Cloned to `~/.pi/agent/git/<host>/<path>` (global) or `.pi/git/<host>/<path>` (project).
- Runs `npm install` after clone or pull if `package.json` exists.

### Local Paths

```
/absolute/path/to/package
./relative/path/to/package
```

Relative paths are resolved against the settings file. If the path is a file, it loads as a single extension. If directory, pi uses package rules.

## Creating a Pi Package

Add a `pi` manifest to `package.json` with the `pi-package` keyword:

```json
{
  "name": "my-package",
  "keywords": ["pi-package"],
  "pi": {
    "extensions": ["./extensions"],
    "skills": ["./skills"],
    "prompts": ["./prompts"],
    "themes": ["./themes"]
  }
}
```

Paths are relative to package root. Arrays support glob patterns and `!exclusions`.

### Gallery Metadata

Add `video` or `image` fields to show previews in the [package gallery](https://pi.dev/packages):

```json
{
  "pi": {
    "video": "https://example.com/demo.mp4",
    "image": "https://example.com/screenshot.png"
  }
}
```

- **video**: MP4 only. Autoplays on hover on desktop. Clicking opens a fullscreen player.
- **image**: PNG, JPEG, GIF, or WebP. Static preview.

If both are set, video takes precedence.

## Package Structure

### Convention Directories

If no `pi` manifest exists, pi auto-discovers from:

- `extensions/` — `.ts` and `.js` files
- `skills/` — recursively finds `SKILL.md` folders; top-level `.md` files as skills
- `prompts/` — `.md` files
- `themes/` — `.json` files

## Dependencies

Third-party runtime dependencies go in `dependencies` in `package.json`. When pi installs from npm or git, it runs `npm install`.

Pi bundles core packages for extensions and skills. If you import any of these, list them in `peerDependencies` with `"*"` range and do not bundle them: `@mariozechner/pi-ai`, `@mariozechner/pi-agent-core`, `@mariozechner/pi-coding-agent`, `@mariozechner/pi-tui`, `typebox`.

Other pi packages must be bundled. Add them to `dependencies` and `bundledDependencies`, then reference through `node_modules/` paths:

```json
{
  "dependencies": { "shitty-extensions": "^1.0.1" },
  "bundledDependencies": ["shitty-extensions"],
  "pi": {
    "extensions": ["extensions", "node_modules/shitty-extensions/extensions"],
    "skills": ["skills", "node_modules/shitty-extensions/skills"]
  }
}
```

## Package Filtering

Filter what a package loads using the object form in settings:

```json
{
  "packages": [
    "npm:simple-pkg",
    {
      "source": "npm:my-package",
      "extensions": ["extensions/*.ts", "!extensions/legacy.ts"],
      "skills": [],
      "prompts": ["prompts/review.md"],
      "themes": ["+themes/legacy.json"]
    }
  ]
}
```

| Syntax | Effect |
|--------|--------|
| omit a key | load all of that type |
| `[]` | load none of that type |
| `!pattern` | exclude matches |
| `+path` | force-include an exact path |
| `-path` | force-exclude an exact path |

Filters narrow down what the manifest already allows.

## Enable and Disable Resources

Use `pi config` to enable or disable extensions, skills, prompts, and themes from installed packages and local directories. Works for both global and project scopes.

## Scope and Deduplication

Packages can appear in both global and project settings. Project entry wins. Identity is determined by:

- npm: package name
- git: repository URL without ref
- local: resolved absolute path

#pi-packages #package-management #extension-development
