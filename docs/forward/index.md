# Code Forward Agents

The **Code Forward Agents** Team is the bridge from specs to running code. Discovery answers *what does the legacy do?*; Forward answers *what comes next, and how do we build it without erasing what we just learned?*.

Every artifact this Team produces is anchored to the Discovery output (`_reversa_sdd/`). When code finally lands, two trails are left behind for future Reversa runs: `legacy-impact.md` (what was changed in the legacy) and `regression-watch.md` (what must remain true on the next extraction).

Pre-checked in the installer.

---

## When to use

You already ran `/reversa` and have specs in `_reversa_sdd/`. Now you want to evolve the system: a new feature, an extension, a fix that needs a delta description before it becomes code. Forward takes a free-form sentence ("I want users to export their invoices as PDF") and walks it down the funnel until the file changes are on disk.

`/reversa-coding` requires a context anchor in `_reversa_sdd/`: either the legacy extraction (`architecture.md` + `domain.md`, from `/reversa`) or the greenfield artifacts (`prd.md` + at least one spec in `sdd/`, from `/reversa-new`). Without any anchor, it refuses to run: the code bridge would be hollow and Forward would degrade into a generic scaffolding tool.

---

## Pipeline

```
/reversa-forward         (orchestrator, detects current stage and suggests the next skill)
        │
        ▼
/reversa-requirements
        │     idea  →  requirements.md (with [DOUBT] markers, gaps, glossary)
        ▼
/reversa-clarify           (optional)
        │     up to 5 targeted questions  →  resolves [DOUBT] in place
        ▼
/reversa-quality         (optional, read-only)
        │     audits writing clarity  →  requirements-audit.md
        ▼
/reversa-plan
        │     requirements  →  roadmap.md, investigation.md,
        │                       data-delta.md, onboarding.md, interfaces/
        ▼
/reversa-to-do
        │     roadmap  →  actions.md (atomic tasks with stable IDs)
        ▼
/reversa-audit           (optional, read-only)
        │     cross-checks the three docs  →  audit/cross-check.md
        ▼
/reversa-coding
        │     actions.md  →  code, plus legacy-impact.md
        │                             and regression-watch.md
        ▼
/reversa-sync            (optional)
              delivery  →  _reversa_sdd/addenda/<feature>.md
```

`/reversa-forward` is the optional entry point for the cycle: it looks at the current state and tells you which skill to run next. Handy when you do not remember where you stopped.
`/reversa-principles` and `/reversa-resume` run outside this linear flow. The first manages durable project rules; the second swaps the active feature with one paused on the side.

---

## Feature lifecycle

A feature is identified by `<NNN>-<short-name>` (e.g. `012-pdf-export`). The active one is tracked in `.reversa/active-requirements.json`; previously active ones can sit in a `paused-features` queue and be resumed at any time.

```
.reversa/active-requirements.json
{
  "feature-dir": "_reversa_forward/012-pdf-export",
  "feature-id": "012",
  "short-name": "pdf-export",
  "started-at": "2026-05-08T14:22:00Z",
  "paused-features": [
    { "feature-dir": "_reversa_forward/011-multi-tenant", "paused-from-stage": "plan", ... }
  ]
}
```

The **physical stage** of a feature is detected by looking at the artifacts on disk, not at metadata fields:

| Observed in `feature-dir`                          | Physical stage         |
|----------------------------------------------------|------------------------|
| `requirements.md` missing                          | `empty`                |
| `requirements.md` present, `roadmap.md` missing    | `requirements`         |
| `roadmap.md` present, `actions.md` missing         | `plan`                 |
| `actions.md` with at least one `[ ]` checkbox open | `coding-in-progress`   |
| `actions.md` with all `[X]`                        | `done`                 |

This means an interrupted session can be resumed safely even if a skill forgot to update its metadata.

---

## Agents

| Agent | Stage | Writes | Reads-only |
|-------|-------|--------|------------|
| `reversa-forward` | orchestrator | (none, routing only) | `state.json`, `active-requirements.json`, feature artifacts in `_reversa_forward/` |
| `reversa-requirements` | requirements | `requirements.md`, `active-requirements.json` |  |
| `reversa-clarify` | clarify | `requirements.md` (in-place edits) |  |
| `reversa-quality` | quality | `audit/requirements-audit.md` | `requirements.md` |
| `reversa-plan` | plan | `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md`, `interfaces/*` |  |
| `reversa-to-do` | to-do | `actions.md` |  |
| `reversa-audit` | audit | `audit/cross-check.md` | requirements + roadmap + actions |
| `reversa-coding` | coding | source code, `actions.md` checkboxes, `progress.jsonl`, `legacy-impact.md`, `regression-watch.md` |  |
| `reversa-sync` | sync | `_reversa_sdd/addenda/<feature>.md` | `legacy-impact.md`, `regression-watch.md`, `requirements.md`, `progress.jsonl`, extraction artifacts |
| `reversa-principles` | principles | `.reversa/principles.md`, `principles-impact-YYYYMMDD.md` |  |
| `reversa-resume` | resume | `active-requirements.json` (swap), no feature artifacts |  |

### `reversa-requirements`
Turns a free-form idea into a complete `requirements.md`, anchored to the legacy via `_reversa_sdd/` (architecture, domain, state machines, glossary). It detects when a previous feature is already in progress and asks the user whether to continue, run in parallel (pausing the previous one), or abandon, never decides on its own.

### `reversa-clarify`
Generates up to five targeted questions to clear `[DOUBT]` markers, vague phrases ("probably", "maybe", "if possible"), and obvious gaps. Questions are multiple choice or short answer, never open. Answers are integrated back into `requirements.md` under a dated `## Clarifications` section.

### `reversa-quality`
Read-only auditor of writing clarity. Asks: *is this prose good enough to plan against without rework?* Categories cover clarity, completeness, terminology, scenario coverage, edge cases, jargon, implicit solutions, and alignment with `principles.md`. Verdict: Approved, Approved with reservations, or Rejected. Does not check implementation tests.

### `reversa-plan`
The evolution architect. Translates requirements into a concrete technical proposal expressed as a **delta over the legacy**, never a full re-architecture. Each decision carries a confidence marker (🟢 strong evidence, 🟡 partial or based on accepted assumptions, 🔴 weak). Conflicts with `principles.md` are flagged but never silently overridden.

### `reversa-to-do`
Decomposes the roadmap into atomic actions across five fixed phases: Preparation, Tests, Core, Integration, Polish. Each action gets a stable ID (`T001`, `T002`, ...; never recycled), explicit dependencies, a target file, an inherited confidence marker, and a `[//]` flag when it can run in parallel with siblings.

### `reversa-audit`
Read-only cross-check between requirements, roadmap and actions. Findings are reported with severity (CRITICAL, HIGH, MEDIUM, LOW), grouped along four axes: coverage, consistency, coherence with the legacy (`_reversa_sdd/domain.md`, `architecture.md`), and sanity of the actions graph (no cycles, parallel tasks don't share files). The skill never edits the analyzed documents, even if the user asks.

### `reversa-coding`
The executor. Walks `actions.md` phase by phase, respects `[//]` parallelism and dependencies, flips checkboxes from `[ ]` to `[X]` only on success, and appends one line per action to `progress.jsonl`. On completion (full or partial) it writes `legacy-impact.md` (which legacy files were touched) and `regression-watch.md` (invariants that must hold on the next Reversa extraction).

### `reversa-sync`
The convergence step, optional and run after coding. Between a delivery and the next full `/reversa` re-extraction, `_reversa_sdd/` drifts: the code moved, but `architecture.md` and `domain.md` still describe the previous system. Sync distills the delivered feature into an addendum under `_reversa_sdd/addenda/`, so the extraction keeps representing the system as it is today. It detects the scenario on its own (legacy or greenfield), offers a menu instead of deciding when `actions.md` still has open actions, and never edits the original artifacts, it only points at the sections that drifted. The next full re-extraction marks the addendum as superseded.

### `reversa-principles`
Manages durable project rules in `.reversa/principles.md`, separated from feature requirements. Principles are rare (typically less than once a month), use roman numerals (I, II, III, ...) that are never recycled, and changes are tracked in a history section. When a principle changes, the skill emits an impact report (`principles-impact-YYYYMMDD.md`) suggesting template adjustments. The human applies them, the skill never auto-rewrites templates.

### `reversa-resume`
Swaps the active feature with one from `paused-features`. Detects the physical stage of each paused feature, surfaces any orphaned entries (folder deleted manually), and never creates new features.

---

## Where artifacts land

```
<your-legacy-project>/
├── .reversa/
│   ├── active-requirements.json     (active feature + paused queue)
│   ├── principles.md                (durable project rules)
│   ├── principles-impact-*.md       (impact reports per principles change)
│   └── hooks.yml                    (optional before/after hooks)
│
└── _reversa_forward/                (forward_folder from .reversa/state.json)
    └── <NNN>-<short-name>/          (one per feature)
        ├── requirements.md
        ├── roadmap.md
        ├── investigation.md
        ├── data-delta.md
        ├── onboarding.md
        ├── interfaces/              (one file per affected external contract)
        ├── actions.md
        ├── progress.jsonl           (one line per executed action)
        ├── legacy-impact.md
        ├── regression-watch.md
        └── audit/
            ├── requirements-audit.md   (reversa-quality)
            └── cross-check.md          (reversa-audit)
```

The Code Forward Agents never touch the legacy code unsupervised; that only happens inside `/reversa-coding`, and even then the skill leaves the two trails above so the next Discovery run can detect any drift.

`/reversa-sync` is the only skill in this Team that writes outside `_reversa_forward/`, and it writes to exactly one place:

```
_reversa_sdd/
└── addenda/
    └── <NNN>-<short-name>.md    (one addendum per delivered feature)
```

The original extraction artifacts are never edited. The addendum carries a validity section and points at the sections of `architecture.md`, `domain.md` and the specs that drifted, until the next full re-extraction supersedes it.

---

## Hooks

Each skill applies the matching hook entries from `.reversa/hooks.yml`, in two slots: `before-<stage>` and `after-<stage>` (e.g. `before-plan`, `after-coding`). Hooks marked `optional: true` show up as suggested commands; `optional: false` blocks the skill until executed. The `condition` field is recorded but never auto-evaluated, the user owns that decision.
