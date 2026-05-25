---
name: reversa-quality
description: Textual clarity audit for requirements. Checks whether the prose is good enough to generate an unambiguous plan. Does NOT mix with implementation test audits. Use when the user types "/reversa-quality", "reversa-quality", or asks to review requirements quality before planning. Optional step in the forward cycle.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI, and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: quality
---

You are the textual reviewer. Your mission is to check whether the active feature's `requirements.md` is well-written, complete, and coherent enough to become a plan and code without rework. This skill is purely a reader of `requirements.md`. The only allowed writing is the audit report.

This skill evaluates WRITING QUALITY, not IMPLEMENTATION TEST COVERAGE. If you feel the urge to include an item like "check if the button works," stop—this item does NOT belong here.

## Before You Begin

1. Read `.reversa/state.json` to resolve `output_folder` and `forward_folder`
2. Use the actual values wherever the text mentions `_reversa_sdd/` or `_reversa_forward/`

## Initial Checks

1. Read `.reversa/active-requirements.json`
   1.1. If absent, abort
2. Verify the existence of `feature-dir/requirements.md`
3. Apply `before-quality` in the standard way

## Audit Categories

Each item in the report falls into one of these categories:

| Category | Guiding Question |
|----------|------------------|
| Clarity | Does each sentence have a subject, a verb, and a single meaning? |
| Completeness | Are all mandatory template sections filled in? |
| Consistency | Are glossary terms from the project always used the same way? |
| Scenario Coverage | Do happy paths, sad paths, and edge cases appear in Gherkin? |
| Edge Cases | Were numeric limits, empty states, nulls, and concurrency considered? |
| Absence of Jargon | Would the writing be understood by a new human on the team? |
| Absence of Implicit Solution | Does the text describe what, not how (no library names, no framework names)? |
| Alignment with Principles | Does every rule in the requirements respect `.reversa/principles.md`? |

## How to Generate Items

1. Load the template `.reversa/templates/quality-template.md`
2. For each category, generate one to five evaluative questions based on the actual content of `requirements.md`
3. Total between ten and thirty items
4. Each item follows the format `- [ ] Q-NNN | <category> | <question>`
5. After evaluating, mark `[X]` the approved ones, `[ ]` the rejected ones
6. For rejected items, add an extra line `> reason: <objective reason>`
7. For rejected items that could be self-corrected by the author, add an extra line `> suggestion: <short text>`

## Final Verdict

At the end of the report, issue one of three classifications:

- **Approved**, all items passed
- **Approved with reservations**, up to three rejected items, none CRITICAL
- **Rejected**, more than three rejected items, or at least one CRITICAL (missing scenario coverage, violated principle, internal contradiction)

## Persistence

- Create `feature-dir/audit/` if it does not exist
- Write `requirements-audit.md` with atomic writing
- Always do a full rewrite

## Post-execution Hooks

Apply `after-quality` in the standard way.

## Final Report to the User

1. Absolute path to `requirements-audit.md`
2. Verdict (Approved, Approved with reservations, Rejected)
3. Top three rejected items, with reason, if any
4. Explicit warning: `requirements.md` was NOT modified
5. Suggested next step:
   5.1. Approved, suggest `/reversa-plan`
   5.2. Approved with reservations, suggest `/reversa-clarify`
   5.3. Rejected, suggest manual rewrite or re-execution of `/reversa-requirements`

End with:

> Type **CONTINUAR** to proceed as suggested above.
