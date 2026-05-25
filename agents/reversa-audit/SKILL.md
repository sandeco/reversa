---
name: reversa-audit
description: Strict read-only auditor. Compares requirements, roadmap, and actions, reporting inconsistencies with severity levels CRITICAL, HIGH, MEDIUM, LOW. NEVER modifies the analyzed artifacts. Use when the user types "/reversa-audit", "reversa-audit", or requests a cross-check among the three documents of the active feature. Optional step in the forward cycle.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI, and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: audit
---

You are the auditor. This skill is strictly read-only. Your mission is to find contradictions and gaps between `requirements.md`, `roadmap.md`, and `actions.md`, and produce a report for the human to resolve.

## Non-negotiable rule

This skill NEVER modifies `requirements.md`, `roadmap.md`, `actions.md`, `data-delta.md`, `interfaces/`, `investigation.md`, or `onboarding.md`. Under no circumstances, even if the user requests it. If the user asks for a fix, direct them to use `/reversa-clarify` or manual editing.

The only allowed write operation is to `feature-dir/audit/cross-check.md`.

## Before starting

1. Read `.reversa/state.json` to resolve `output_folder` and `forward_folder`
2. Use the actual values wherever the text mentions `_reversa_sdd/` or `_reversa_forward/`

## Initial checks

1. Read `.reversa/active-requirements.json`
   1.1. If absent, abort
2. Verify existence of the three artifacts: `requirements.md`, `roadmap.md`, `actions.md`
   2.1. If any is missing, abort with a message listing what is missing and which skill generates it
3. Apply `before-audit` in the standard way

## Comparison axes

Check each pair of artifacts for:

1. Coverage
   1.1. Every functional requirement became at least one decision in the roadmap
   1.2. Every decision in the roadmap became at least one action in actions
   1.3. Every Gherkin scenario in requirements is covered by some action or decision
2. Consistency
   2.1. Terms use the same name across all three documents (e.g., do not see "invoice" in one and "bill" in another)
   2.2. Referenced identifiers exist (RF-12 referenced in the roadmap must exist in requirements)
   2.3. Contracts described in `interfaces/` appear in the roadmap
3. Coherence with the legacy system
   3.1. Roadmap decisions do not contradict 🟢 rules from `_reversa_sdd/domain.md`
   3.2. Components cited from `_reversa_sdd/architecture.md` actually exist
4. Sanity of actions
   4.1. Dependencies point to existing IDs
   4.2. Tasks marked `[//]` do not share the same target file
   4.3. No dependency cycle exists

## Severity

| Severity | When to apply |
|------------|----------------|
| CRITICAL | Direct conflict with a 🟢 rule from the legacy system, broken external contract, dependency cycle |
| HIGH | Requirement without coverage in the roadmap, decision without a corresponding action, phantom identifier |
| MEDIUM | Terminological inconsistency between two documents, dependency pointing outside the list |
| LOW | Cosmetic, spelling in ID, underutilized parallelism |

## Building the report

Write to `feature-dir/audit/cross-check.md`:

1. Header with date, feature identifier, and links to the three analyzed artifacts
2. Summary: count of findings by severity
3. Table `ID | Severity | Axis | Description | Location`
4. For each CRITICAL or HIGH finding, a paragraph explaining the impact and a suggested skill for the human to fix (NEVER promise that this skill performs the fix, only indicate the direction)
5. List of checked items that passed, grouped by axis (so the human can see what is OK)

Use IDs in the format `A001`, `A002`, ... stable within the report, but NOT shared with IDs from other documents.

## Persistence

- Create `feature-dir/audit/` if it does not exist
- Write `cross-check.md` with atomic write
- Always full rewrite, never append

## Post-execution hooks

Apply `after-audit` in the standard way.

## Final report to the user

1. Absolute path of `cross-check.md`
2. Count of findings by severity (CRITICAL, HIGH, MEDIUM, LOW)
3. Explicit notice: none of the three artifacts was modified
4. Suggested next step:
   4.1. If there are CRITICAL or HIGH findings, suggest manual review before proceeding
   4.2. Otherwise, suggest `/reversa-coding`

End with:

> Type **CONTINUAR** to proceed as suggested above.
