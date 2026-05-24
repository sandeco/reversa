---
name: reversa-principles
description: Creates or updates the project's enduring principles and propagates adjustment suggestions to dependent templates. Principles are rare, change infrequently, and influence all artifacts. Use when the user types "/reversa-principles", "reversa-principles", "set principles", or asks to create/change/retire a project principle. Can run even before the first feature.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agent-compatible Agent Skills frameworks.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: principles
---

You are the guardian of principles. This skill handles the project's enduring rules, separate from the specific requirements of each feature. Principles change infrequently and influence all other artifacts.

This skill is rare, with a typical frequency of less than once per month. It is NOT part of the `requirements`, `plan`, `to-do`, `coding` pipeline. It can run independently, even before the first feature.

## Before You Begin

1. Read `.reversa/state.json` to resolve `output_folder` and `forward_folder`
2. Use the actual values wherever the text mentions `_reversa_sdd/` or `_reversa_forward/`

## Initial Checks

1. Try to read `.reversa/principles.md`
   1.1. If absent, mode is `create`
   1.2. If present, mode is `update`
2. Apply `before-principles` in the standard way

## Create Mode

1. Load `.reversa/templates/principles-template.md`
2. Ask the user for candidate principles, in batch or one at a time
3. For each principle:
   3.1. Assign sequential Roman numerals (I, II, III, ...)
   3.2. Ask for a short title, description, and a concrete example of application
   3.3. Record the creation date
4. In the "Impact" section, list which templates will be affected when the principle changes (always `requirements-template.md`, `roadmap-template.md`, and potentially `actions-template.md`)
5. Initialize the "Change History" section with the first entry

## Update Mode

1. Present the user with the current numbered list of principles
2. Ask which operation they want:
   2.1. Add new (continues with the next Roman numeral, never reuses)
   2.2. Modify text of an existing one (keeps the numeral, records the change in the history)
   2.3. Retire one (DO NOT delete, mark as `retired on YYYY-MM-DD` and move to the end of the document)
3. After the operation:
   3.1. Update the "Impact" section if necessary
   3.2. Add an entry to the "Change History"

## Impact Propagation

1. For each template listed in the "Impact" section:
   1.1. Read the template from `.reversa/templates/<name>`
   1.2. Check if the template needs a new placeholder or section to reflect the principle
   1.3. NEVER rewrite the entire template automatically; instead, generate an impact report at `.reversa/principles-impact-YYYYMMDD.md`
2. The report lists, per template, textual suggestions for adjustment
3. Applying these suggestions is the human's decision; this skill only suggests

## Persistence

- Write `.reversa/principles.md` with atomic write
- Write the impact report to `.reversa/principles-impact-YYYYMMDD.md`
- NEVER overwrite old impact reports; each execution creates a dated file

## Post-execution Hooks

Apply `after-principles` in the standard way.

## Final Report to User

1. Absolute path of `principles.md`
2. List of active principles, with numbering and short title
3. List of retired principles, if any
4. Path of the generated impact report
5. Notice: new or modified principles only take effect in features started after this date

End with:

> Type **CONTINUAR** to proceed with the next action you wish.
