# CLI

Reversa has a simple CLI to manage the installation and lifecycle of agents in your project. All commands run with `npx reversa` in the project root.

---

## Initial behavior

When the CLI starts and before it shows the Reversa ASCII logo, it must clear the terminal screen. The logo should appear at the top of the terminal, with no previous content above it.

The `by sandeco` signature must appear in white on the last line of the artwork, after a right-side margin from the end of the large `Reversa` word. It must not float in the middle of the logo height.

Expected format:

```text
  ______
  | ___ \
  | |_/ /_____   _____ _ __ ___  __ _
  |    // _ \ \ / / _ \ '__/ __|/ _` |
  | |\ \  __/\ V /  __/ |  \__ \ (_| |
  \_| \_\___| \_/ \___|_|  |___/\__,_|  by sandeco

  AI-Powered Reverse Engineering Framework
```

---

## Available commands

### `install`

```bash
npx reversa install
```

Installs Reversa in the current legacy project. Detects present engines, asks for your preferences, and creates the entire required structure.

Use once, in the root of the project you want to analyze.

#### Installation Menu Layout

The installer must treat the menu as the main interface, not as a text dump. Questions must be numbered, have a blank line before the question, and, when options are shown, a blank line between the question and the list.

After the user confirms a multi-select question, the CLI must not print every selected item in one continuous line. This is forbidden because it creates a long, unreadable paragraph. Use one of these alternatives:

- Do not render the full selection and continue to the next question.
- Render a short summary, one line per team.

There is no agent selection: the installer always installs **all** agents shipped with the package. The final installation summary breaks the count down by team (Discovery, Migration, Code Forward, New Project, Documentation, Translators and Pricing).

---

### `status`

```bash
npx reversa status
```

Shows the current analysis state: which phase is in progress, which agents have already run, what's left to complete.

Useful for a quick overview before resuming a session.

---

### `update`

```bash
npx reversa update
```

Updates everything to the latest version of Reversa: all agents shipped with the package are reinstalled, including agents that didn't exist when you first installed.

The command is smart: it checks the SHA-256 manifest of each file and never overwrites files you've customized. If you made adjustments to any agent, they stay intact.

---

### `add-engine`

```bash
npx reversa add-engine
```

Adds support for an AI engine that wasn't present when you installed. For example: you installed only for Claude Code and now want to add Codex.

---

### `uninstall`

```bash
npx reversa uninstall
```

Removes Reversa from the project: deletes the files created by the installation (`.reversa/`, `.agents/skills/reversa-*/`, engine entry files).

!!! info "Your files stay intact"
    `uninstall` removes **only** what Reversa created. No original project file is touched. Specifications generated in `_reversa_sdd/` are also preserved by default.
