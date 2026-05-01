# `drift-check` — CI gate

Standalone CLI to fail your CI build when specs are out of sync with the code.

```bash
npx reversa drift-check
```

Exit codes:

| Code | Meaning |
|---|---|
| 0 | Clean — no drift at the chosen severity |
| 1 | Drift detected — blocks the build |
| 2 | `_reversa_sdd/drift.md` not found — project not initialized |

---

## Options

```
npx reversa drift-check [--format text|json] [--severity high|medium|low] [--folder <path>]
```

### `--severity`

| Level | What blocks |
|---|---|
| **high** (default) | Only `🔴 pending` specs |
| medium | `🔴 pending` + `🟡 stale` |
| low | Nothing — always exit 0, only reports counts |

### `--format`

| Format | Output |
|---|---|
| **text** (default) | Human-readable summary + list + fix hint |
| json | Structured payload for CI tooling |

### `--folder`

Override the output folder. By default, reads `output_folder` from `.reversa/state.json` and falls back to `_reversa_sdd`.

---

## Why it matters

Without this gate, the drift loop is purely human discipline. Hooks queue events, the Chronicler updates specs — but nothing prevents a PR from merging while specs still show `pending`.

`drift-check` closes the loop: a build that ships unresolved drift fails. Developers either run `/reversa-chronicler after` to resolve, or explicitly drop the severity (with reasoning) for that PR.

---

## CI examples

### GitHub Actions

```yaml
# .github/workflows/ci.yml
jobs:
  drift-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx reversa drift-check --severity high --format json
```

### GitLab CI

```yaml
drift-check:
  image: node:20
  script:
    - npx reversa drift-check --severity high
```

### Generic shell pre-push hook

```bash
#!/bin/sh
# .git/hooks/pre-push
if ! npx reversa drift-check --severity high; then
  echo "Push blocked. Run /reversa-chronicler after to resolve drift."
  exit 1
fi
```

---

## Engine-agnostic

This command does NOT load any agent code, chalk, inquirer, or hook generator. It only:

1. Reads `.reversa/state.json` to find the output folder (best-effort)
2. Parses the markdown table in `_reversa_sdd/drift.md`
3. Counts statuses
4. Exits

Cold start is fast (no heavy imports), suitable for any CI runner.

---

## JSON output schema

```json
{
  "severity": "high",
  "source": "/abs/path/to/_reversa_sdd/drift.md",
  "counts": { "pending": 1, "stale": 2, "resolved": 12 },
  "blocking": [
    { "spec": "sdd/notifications.md", "status": "pending", "action": "Run /reversa-chronicler after" }
  ],
  "clean": false
}
```

When `_reversa_sdd/drift.md` is missing, JSON output is:

```json
{
  "error": "drift.md not found",
  "path": "/abs/path/to/_reversa_sdd/drift.md",
  "hint": "Run /reversa to initialize, then /reversa-chronicler after to populate drift.md"
}
```

---

## See also

- [Chronicler agent](agentes/cronista.md) — what populates `drift.md`
- [Hooks](hooks.md) — auto-trigger the Chronicler per file edit
