---
name: reversa-to-do
description: Decomposes the roadmap into atomic actions with sequential IDs, dependencies, and parallelism markers. Use when the user types "/reversa-to-do", "reversa-to-do", "decompose into tasks", or asks to turn the roadmap into an executable list. Fourth skill in the forward cycle, after `/reversa-plan`.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI, and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: to-do
---

You are the decomposer. Your mission is to transform `roadmap.md` into an executable `actions.md`, with atomic tasks, stable IDs, and clear marking of what can run in parallel.

## Before You Start

1. Read `.reversa/state.json` to resolve `output_folder` and `forward_folder`
2. Use the actual values wherever the text references `_reversa_sdd/` or `_reversa_forward/`

## Initial Checks

1. Read `.reversa/active-requirements.json`
   1.1. If absent, abort by pointing to `/reversa-requirements`
2. Verify the existence of `feature-dir/roadmap.md`
   2.1. If absent, abort with a clear message pointing to `/reversa-plan`. Do not attempt to fill in the roadmap here
3. Also load `feature-dir/data-delta.md` and `feature-dir/interfaces/*` if they exist
4. Apply `before-to-do` in the standard way

## Decomposition Strategy

1. Use the five standard phases in order:
   1.1. Preparation (setup, scaffolding, initial migrations, configuration)
   1.2. Tests (tests that must exist before or right after the core, if the team practices TDD)
   1.3. Core (central logic of the feature)
   1.4. Integration (glue with other parts of the system, external contracts, hooks)
   1.5. Polish (logs, telemetry, messages, short documentation)
2. For each item in `roadmap.md`, derive one or more actions
3. Break each action down until it can be executed in a single coherent block, without needing to switch context
4. Assign IDs `T001`, `T002`, ..., zero-padded with three digits
5. Mark with `[//]` at the beginning of the line tasks that touch different files AND do not depend on each other
6. In an explicit column, record dependencies by ID (e.g., `T005 depends on T001, T003`)
7. In an explicit column, record the main target file (e.g., `src/payments/pdf.js`)
8. In the `confidence` column, inherit 🟢 / 🟡 / 🔴 from the corresponding decision in the roadmap

## "Atomic" Criteria

- An action is atomic when it can be completed by an agent in a single turn, without needing human feedback in the middle
- If an action has more than five logical sub-points, break it
- If an action touches more than three unrelated files, break it
- If an action includes "and also", "then", "next", break it

## Building actions.md

1. Load the template `.reversa/templates/actions-template.md`
2. For each phase, create a table with columns `ID | Description | Dependencies | Parallelism | Target File | Confidence | Status`
3. Status always starts as `[ ]`
4. Before the first table, include a summary:
   4.1. Total number of actions
   4.2. Total number of parallelizable actions
   4.3. Longest dependency chain

## Maintenance Rules

- IDs are never recycled, even if an action is removed in a later review
- Renumbering only happens when generating the document for the first time
- Never insert actions like "configure IDE", "run lint", "open PR" — this is not Reversa's responsibility

## Persistence

- Write `feature-dir/actions.md` with atomic write

## Post-execution Hooks

Apply `after-to-do` in the standard way.

## Final Report

1. Absolute path of `actions.md`
2. Total actions per phase
3. Total marked as `[//]`
4. Suggestion for next step, in order:
   4.1. `/reversa-audit` if you noticed inconsistencies during decomposition
   4.2. `/reversa-coding` otherwise

End with:

> Type **CONTINUAR** to proceed as suggested above.
