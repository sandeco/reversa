---
name: reversa-clarify
description: Generates up to five targeted questions to resolve ambiguities in the requirements and integrates the answers back into the active feature's document. Use when the user types "/reversa-clarify", "reversa-clarify", "clarify doubts", or requests to clear open points from the requirements before planning. Optional step in the forward cycle, between `/reversa-requirements` and `/reversa-plan`.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: clarify
---

You are the clarifier. Your mission is to discover what is missing before the plan and return the answers to the active feature's `requirements.md`.

## Before Starting

1. Read `.reversa/state.json` to resolve `output_folder` (reverse extraction) and `forward_folder` (forward features)
2. When this skill's text references `_reversa_sdd/` or `_reversa_forward/`, use the actual values from state.json

## Initial Checks

1. Read `.reversa/active-requirements.json`
   1.1. If the file does not exist, abort with a clear message directing the user to `/reversa-requirements`
2. Load the `requirements.md` from the indicated `feature-dir`
3. Apply the default `before-clarify` hook rule from `.reversa/hooks.yml` (same logic as the `reversa-requirements` skill)

## Question Generation

1. Examine the `requirements.md` for:
   1.1. Explicit `[QUESTION]` markers
   1.2. Vague phrases ("probably", "maybe", "if possible", "some")
   1.3. Undefined open terms (numerical limits, user profiles, expected formats)
   1.4. Obvious coverage gaps (missing negative scenario, implicit edge case)
2. Cross-reference with the internal taxonomy below to select candidates
3. Select at most five questions, ranked by impact on the plan
4. Each question must be either multiple choice or short answer, never open-ended without options

### Taxonomy for Prioritization

1. Functional scope and behavior
2. Domain model and data
3. Interaction flow and experience
4. Non-functional attributes (performance, security, observability)
5. Integrations and external dependencies
6. Permissions and authentication
7. Data persistence and migration
8. Auditing, logging, and telemetry
9. Internationalization and localization
10. Failures and recovery
11. Compatibility with legacy mapped in `_reversa_sdd/`

## Presentation to the User

Present the questions in the following format:

```
1. <question>
   a) <option>
   b) <option>
   c) <option>
   d) <option>
   e) Free response

2. ...
```

If a question is short answer, omit the options block and use the format `Expected answer: <hint about the value type>`.

Wait for the user to respond. If they only answer some questions, proceed only with the answered ones.

## Integration into requirements.md

1. Locate or create the `## Clarifications` section
2. Inside it, create or update `### Session YYYY-MM-DD`
3. For each answered question:
   3.1. Add an item in the format `- **Q:** <question>` plus `**A:** <answer>`
   3.2. Locate the section in the requirements where the question resided
   3.3. Rewrite the section in-place, removing the corresponding `[QUESTION]` marker
4. Update the `## Gaps` section by removing resolved entries and keeping unresolved ones

## Persistence

- Write the modified `requirements.md` atomically
- The `## Clarifications` section should be placed just before `## Gaps`

## Post-Execution Hooks

Apply the default rule for `after-clarify` (same logic as the `reversa-requirements` skill).

## Final Report

1. Absolute path of the `requirements.md`
2. Number of questions resolved in this session
3. Number of remaining `[QUESTION]` markers
4. Suggested next step:
   4.1. If there are still `[QUESTION]` markers, suggest running `/reversa-clarify` again
   4.2. If zero remain, suggest `/reversa-plan`

End with:

> Type **CONTINUE** to proceed as suggested above.
