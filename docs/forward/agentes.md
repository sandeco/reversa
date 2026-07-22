# The Forward agents

Eleven agents make up the Code Forward Agents Team. The orchestrator (`/reversa-forward`) detects the physical stage of the active feature and suggests the next skill. The other ten cover the lifecycle from a free-form idea to running code, and then back into the extraction.

The orchestrator runs in **two scenarios**: evolution of a legacy with `_reversa_sdd/` populated, or greenfield, where there is no extraction yet. In both cases it prepares the folders and never blocks the pipeline.

---

## Pipeline

```
Reversa Forward (orchestrator, optional entry point)
        │
        ▼
Requirements → Clarify → Quality → Plan → To-Do → Audit → Coding → Sync
                (optional)  (optional)             (optional)          (optional)

Principles and Resume run outside this linear flow.
```

There is a `CONTINUAR` checkpoint between agents. Each skill verifies its own preconditions and refuses to run if a required predecessor is missing. `reversa-coding` is the strictest: it aborts unless `_reversa_sdd/` holds a context anchor, either the legacy pair `architecture.md` + `domain.md` (from `/reversa`) or the greenfield pair `prd.md` + at least one spec in `sdd/` (from `/reversa-new`), to keep the specs-to-code bridge solid.

---

## 1. Reversa Forward (orchestrator)

**Command:** `/reversa-forward`

Looks at `.reversa/state.json` and `_reversa_forward/<feature>/` to detect the physical stage by inspecting the artifacts on disk (not metadata). Suggests the next skill, never executes it automatically: every transition ends with a `CONTINUAR` request.

Detects greenfield (no `_reversa_sdd/`), creates the folders that would have been created by `/reversa`, and lets the pipeline run without blocking.

**Produces:** nothing on its own. Pure routing.

---

## 2. Requirements

**Command:** `/reversa-requirements`

Turns a free-form idea ("I want users to export their invoices as PDF") into a complete `requirements.md`, anchored to `_reversa_sdd/architecture.md`, `domain.md`, `state-machines.md` and the glossary. Marks open points with `[DOUBT]`, lists gaps and registers the feature in `.reversa/active-requirements.json`.

Detects in-progress features: if another one is active, asks the user to continue, run in parallel (pausing the previous one) or abandon. Never decides on its own.

**Produces:** `requirements.md` and an entry in `active-requirements.json`.

---

## 3. Clarify

**Command:** `/reversa-clarify`

Generates up to five targeted questions to clear `[DOUBT]` markers, vague phrases ("probably", "maybe") and obvious gaps. Questions are multiple choice or short answer, never open. Answers are integrated back into `requirements.md` under a dated `## Clarifications` section.

**Produces:** in-place edits to `requirements.md`.

---

## 4. Quality

**Command:** `/reversa-quality`

Read-only auditor of writing clarity. Asks: *is this prose good enough to plan against without rework?*. Categories: clarity, completeness, terminology, scenario coverage, edge cases, jargon, implicit solutions, alignment with `principles.md`. Verdict: Approved, Approved with reservations or Rejected. Does not check implementation tests.

**Produces:** `audit/requirements-audit.md`.

---

## 5. Plan

**Command:** `/reversa-plan`

The evolution architect. Translates requirements into a concrete technical proposal expressed as a **delta over the legacy**, never a full re-architecture. Each decision carries a confidence marker (🟢 strong evidence, 🟡 partial or based on accepted assumptions, 🔴 weak). Conflicts with `principles.md` are flagged but never silently overridden.

**Produces:** `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md`, `interfaces/*` (one file per affected external contract).

---

## 6. To-Do

**Command:** `/reversa-to-do`

Decomposes the roadmap into atomic actions across five fixed phases: Preparation, Tests, Core, Integration, Polish. Each action gets a stable ID (`T001`, `T002`, ..., never recycled), explicit dependencies, a target file, an inherited confidence marker and a `[//]` flag when it can run in parallel with siblings.

**Produces:** `actions.md`.

---

## 7. Audit

**Command:** `/reversa-audit`

Read-only cross-check between requirements, roadmap and actions. Findings are reported with severity (CRITICAL, HIGH, MEDIUM, LOW), grouped along four axes: coverage, consistency, coherence with the legacy (`_reversa_sdd/domain.md`, `architecture.md`) and sanity of the actions graph (no cycles, parallel tasks do not share files). The skill never edits the analyzed documents, even if the user asks.

**Produces:** `audit/cross-check.md`.

---

## 8. Coding

**Command:** `/reversa-coding`

The executor. Walks `actions.md` phase by phase, respects `[//]` parallelism and dependencies, flips checkboxes from `[ ]` to `[X]` only on success and appends one line per action to `progress.jsonl`. On completion (full or partial) writes two trails for the next Discovery run:

- `legacy-impact.md`: which legacy files were touched.
- `regression-watch.md`: invariants that must remain true on the next Reversa extraction.

**Produces:** source code, updated checkboxes in `actions.md`, `progress.jsonl`, `legacy-impact.md`, `regression-watch.md`.

---

## 9. Sync

**Command:** `/reversa-sync`

The convergence step. Between a forward delivery and the next full `/reversa` re-extraction, `_reversa_sdd/` goes stale: the code already moved, but `architecture.md` and `domain.md` still describe the previous system. Sync closes that gap by distilling the delivered feature into an **addendum**, so whoever reads the extraction next — human or agent — sees the system as it is today.

It reads `legacy-impact.md` (required, the main source of the delta), `regression-watch.md`, `requirements.md` and `progress.jsonl`, and detects the scenario automatically: legacy (`architecture.md` + `domain.md` present) or greenfield (`prd.md` + specs in `sdd/`). If `actions.md` still has open `[ ]` actions, it does not decide alone: it offers a menu (partial sync now, or wait for `/reversa-coding` to finish).

The addendum carries a `## Vigência` (validity) section and points at the extraction sections that drifted, without ever editing them. The next full re-extraction marks it as superseded.

**Produces:** `_reversa_sdd/addenda/<feature-id>-<short-name>.md`. Original extraction artifacts untouched.

**Requires:** an active feature in `.reversa/active-requirements.json` and a `legacy-impact.md` from `/reversa-coding`.

---

## 10. Principles

**Command:** `/reversa-principles`

Manages durable project rules in `.reversa/principles.md`, separated from feature requirements. Principles are rare (typically less than once a month), use roman numerals (I, II, III, ...) that are never recycled and changes are tracked in a history section. When a principle changes, the skill emits an impact report (`principles-impact-YYYYMMDD.md`) suggesting template adjustments. The human applies them, the skill never auto-rewrites templates.

**Produces:** `.reversa/principles.md` and `principles-impact-YYYYMMDD.md` on each change.

---

## 11. Resume

**Command:** `/reversa-resume`

Swaps the active feature with one from `paused-features`. Detects the physical stage of each paused feature, surfaces any orphaned entries (folder deleted manually) and never creates new features.

**Produces:** in-place swap of `active-requirements.json`. No feature artifacts touched.

---

## Running manually

`/reversa-forward` is the recommended entry point when you do not remember where the active feature stopped. But each skill can be activated standalone:

```
/reversa-forward                 # detect stage and suggest next skill
/reversa-requirements <idea>     # new feature from a free-form idea
/reversa-clarify                 # resolve [DOUBT] markers in requirements.md
/reversa-quality                 # audit writing clarity (read-only)
/reversa-plan                    # delta over legacy from requirements.md
/reversa-to-do                   # atomic actions from roadmap.md
/reversa-audit                   # cross-check between the three docs (read-only)
/reversa-coding                  # execute actions.md
/reversa-sync                    # converge the delivered feature into _reversa_sdd/addenda/
/reversa-principles              # manage durable rules
/reversa-resume                  # swap with a paused feature
```

Hooks declared in `.reversa/hooks.yml` (`before-<stage>` and `after-<stage>` slots) apply on every transition.
