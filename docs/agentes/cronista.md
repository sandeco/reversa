# Chronicler

The agent that prevents new code from becoming legacy.

## What it does

The Chronicler closes the feedback loop between Reversa-generated specs and the day-to-day code changes a developer makes. It runs in two modes — one before a change (read-only briefing) and one after (updates specs, changelog, and the drift dashboard).

## Why it exists

Reversa generates specs from existing legacy code. But once those specs exist, code keeps changing. Without a guardian, specs drift out of sync within weeks and become as useless as the absent documentation Reversa was meant to replace.

The Chronicler is that guardian. It treats specs as **active sources of truth**, not snapshots.

---

## Two modes

### `before <description-or-files>`

Read-only briefing. Use this **before** you start a change.

```
/reversa-chronicler before lib/auth/login.js
/reversa-chronicler before "vou adicionar rate limiting no login"
```

The agent:
1. Reads `_reversa_sdd/traceability/code-spec-matrix.md` to find which specs cover the affected files
2. Reads only those specs (token-aware — does not scan everything)
3. Surfaces the contracts, invariants, and business rules the change must respect
4. Asks if your planned change still respects them
5. Writes nothing — purely informative

### `after`

Default mode if there are uncommitted changes or queued hook events. Use this **after** you finish a change.

```
/reversa-chronicler after
/reversa-chronicler            # also defaults to after when there's a queue
```

The agent:
1. Collects modified files from `git diff HEAD` and (if hooks installed) `.reversa/chronicler-queue.json`
2. Maps files to impacted specs via `code-spec-matrix.md`
3. Asks 3 short questions: **Why** the change, any **breaking impact**, **extra context**
4. Updates each impacted spec in-place, reclassifies confidence (🟢/🟡/🔴) per the rules in `references/drift-rules.md`
5. Appends an entry to `<output_folder>/changelog/YYYY-MM-DD.md`
6. Updates `<output_folder>/drift.md` (the dashboard)
7. Cleans the processed entries from the queue

---

## Outputs

| File | When |
|---|---|
| `_reversa_sdd/changelog/YYYY-MM-DD.md` | Mode `after`, always |
| `_reversa_sdd/sdd/[component].md` | Mode `after`, updated in-place if impacted |
| `_reversa_sdd/traceability/code-spec-matrix.md` | Mode `after`, when files added/deleted |
| `_reversa_sdd/drift.md` | Mode `after`, always (the dashboard) |
| `.reversa/state.json` | Mode `after`, checkpoint |

Mode `before` writes nothing.

---

## Drift detection rules (summary)

The Chronicler classifies code changes into 5 categories — each with a different update strategy. Full rules in `references/drift-rules.md`.

| Category | What it is | Action |
|---|---|---|
| **Trivial** | Refactor, rename, optimization without contract change | Update spec, keep confidence |
| **Incremental** | New function / branch / validation | Add new section to spec |
| **Structural** | Signature, return type, status code changed | Update spec + breaking change note |
| **Semantic** | Code violates a business rule from `domain.md` | **Pause and ask** — bug or intentional? |
| **Deletion** | Code removed | Mark spec section as `~~deprecated~~`, do not delete history |

---

## Confidence reclassification

After processing a change, the Chronicler may upgrade or downgrade confidence on existing spec statements:

- 🟢 → 🟢: change confirms what the spec said
- 🟢 → 🟡: change made the previously-confirmed claim only partially true
- 🟡 → 🟢: change provides direct evidence for what was inferred
- ✕ → 🔴: change introduces a gap (e.g. references env var or feature flag not visible)

---

## Manual vs automated trigger

You can run the Chronicler **manually** via `/reversa-chronicler` at any time — works on every supported engine without any setup.

For **automatic** invocation when files are edited, install hooks via [`npx reversa add-hooks`](../hooks.md). Hooks queue change events to `.reversa/chronicler-queue.json` and pre-fill stub entries in the changelog. The next time you run `/reversa-chronicler after`, the agent enriches them with the 3 questions and updates specs.

---

## When NOT to run

- Without `_reversa_sdd/`: run `/reversa` first to bootstrap
- Without `code-spec-matrix.md`: run `/reversa-architect` or `/reversa-writer` first
- Without code changes (queue empty + git diff clean): nothing to do

---

## Integration with the rest of the team

The Chronicler **complements** but does not replace the other agents:

- **Reviewer** validates specs initially and finds internal contradictions — the Chronicler keeps them up to date afterwards
- **Archaeologist** does deep one-shot analysis — the Chronicler does small, frequent, incremental updates
- **Architect** synthesizes diagrams — the Chronicler flags when an architectural change should trigger a re-run

If the Chronicler detects a change that affects more than 5 specs at once, or touches entry points / DI containers / database schemas, it suggests escalating to Reviewer / Architect / Data Master.
