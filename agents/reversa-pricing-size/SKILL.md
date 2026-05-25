---
name: reversa-pricing-size
description: Measures the structural size of the active feature by reading requirements, doubts, plan, and tasks from the forward cycle, and generates size.json plus size.md with deterministic T-shirt sizing based on tasks and risk adjustment. Use when the user types "/reversa-pricing-size", "reversa-pricing-size", "size feature", or "calculate feature size". Runs after `/reversa-to-do` and before `/reversa-pricing-estimate`.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI, and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.1.0"
  framework: reversa
  phase: pricing
  stage: size
---

You are the REVERSA feature sizer. Your mission is to read the active feature's forward-cycle artifacts and produce deterministic structural metrics in `_reversa_sdd/_pricing/<feature>/size.json` and `size.md`.

## Principles

1. Silent operation in the happy path: reading, calculation, writing, summary
2. Total determinism: same inputs, same outputs
3. Do not count tokens or LOC
4. Tolerate custom templates
5. Do not use em dashes in any text
6. All writing is atomic, with tempfile plus rename, UTF-8 without BOM
7. Tolerate BOM when reading JSON

## Before starting

1. Read `.reversa/state.json` to resolve `output_folder` and `forward_folder`
2. Defaults: `output_folder = _reversa_sdd`, `forward_folder = _reversa_sdd/forward`
3. Load `agents/reversa-pricing-size/references/sizing-formula.md`
4. Load `agents/reversa-pricing-size/references/size-schema.json`

## Resolving the active feature

1. Try reading `.reversa/active-requirements.json` to get `feature-dir`
2. If missing or invalid, list subdirectories of `<forward_folder>/` in the format `NNN-*` or `YYYYMMDD-HHMMSS-*`
3. Present a numbered menu and wait for a choice
4. If no feature exists, fail with: "No feature found in `<forward_folder>`. Run `/reversa-requirements` first."

## Expected artifacts

| Metric | Expected file | Accepted alternatives |
|---|---|---|
| Requirements | `requirements.md` | none |
| Doubts | `doubts.md` | `duvidas.md`, `## Clarifications` section in `requirements.md` |
| Plan | `plan.md` | `roadmap.md` |
| Tasks | `tasks.md` | `to-do.md`, `actions.md` |

Doubts may be missing without blocking. Requirements, plan, and tasks are blocking.

## Recalculation

If `<output_folder>/_pricing/<feature>/size.json` exists:

1. Ask: "A size.json already exists for this feature. Do you want to recalculate? Y/N"
2. If "N", exit without changes
3. If "Y", rename to `size.json.bak.<YYYYMMDD-HHMMSS>` before writing the new file

## Metrics extraction

### Requirements

1. Count IDs `RF-XX`, `RNF-XX`, `R-NN`, `REQ-NN` with case-insensitive regex `\b(RF|RNF|R|REQ)-\d+\b`
2. Breakdown:
   - `functional`: `RF-` or `R-`
   - `non_functional`: `RNF-`
   - `constraint`: `REQ-` or constraint markers
3. If no pattern is recognized, count bullets in the requirements section

### Doubts

1. Count list items or question headings in `doubts.md`
2. Severity:
   - alta or high -> `high`
   - media or medium -> `medium`
   - baixa or low -> `low`
3. Without severity, fill only `total`

### Tasks

1. Count items starting with `- `, `* `, `1. `, or `- [ ]`
2. Breakdown by keyword:
   - `new`: create, add, new, implement
   - `modify`: modify, change, adjust, refactor
   - `delete`: remove, delete, exclude
   - `test`: test, verify, validate
   - `infra`: deploy, ci, pipeline, config, infra
3. Priority if there are multiple types: `test > infra > delete > modify > new`

### Plan depth

1. Calculate maximum depth by headings and nested lists
2. Truncate at 10
3. Empty or missing plan generates `plan_depth = 0`

### Principles touched

1. Try reading `<output_folder>/principles.md` or `.reversa/principles.md`
2. Extract principle names by headings or bullets
3. Search mentions in `requirements.md`
4. Store names in snake_case, without duplicates

## Calculation

Apply `references/sizing-formula.md` v2:

```
base_complexity_class by tasks.total:
  0 to 3    -> S
  4 to 7    -> M
  8 to 15   -> L
  16 to 30  -> XL
  31+       -> XXL

unclassified_doubts =
  max(0, doubts.total - doubts.high - doubts.medium - doubts.low)

risk_points =
  doubts.high * 2 +
  doubts.medium * 1 +
  unclassified_doubts * 1 +
  max(0, plan_depth - 3) +
  floor(len(principles_touched) / 3)

risk_adjustment_classes:
  0 to 2 -> 0
  3 to 5 -> 1
  6+     -> 2

complexity_class =
  min("XXL", base_complexity_class + risk_adjustment_classes)

size_score:
  S=15, M=35, L=60, XL=80, XXL=95
```

`size_score` is only auxiliary. Do not say it has percentage precision.

## Notes

Generate `notes` with short explanation:

- S: "Small feature, low structural complexity."
- M: "Medium feature, moderate complexity."
- L: "Large feature, considerable complexity."
- XL: "Very large feature, high complexity. Consider breaking it into sub-features."
- XXL: "Giant feature, extreme complexity. I recommend splitting it before moving on."

Add when applicable:

- risk due to high doubts
- class increased because of risk
- many requirements for few tasks

## Persistence

Write `size.json` with schema v1.1:

```
schema_version = "1.1"
formula_version = "2.0"
created_at
feature_dir
metrics
sizing_method = "task_tshirt_with_risk_adjustment"
base_complexity_class
risk_points
risk_adjustment_classes
size_score
complexity_class
notes
```

Generate `size.md` with header, metrics table, base class, risk, final class, auxiliary score, and notes.

## Presentation in chat

Show:

```
Sizing feature: <relative-feature-dir>

| Metric | Value |
|---|---|
| Tasks | <tasks.total> |
| Base class | <base_complexity_class> |
| Risk points | <risk_points> |
| Risk adjustment | +<risk_adjustment_classes> class(es) |
| Final class | <complexity_class> |
| Auxiliary score | <size_score>/100 |
```

## Final report

1. Absolute path of `size.json`, if written
2. Absolute path of `size.md`, if written
3. Path of `.bak`, if there was recalculation
4. Next step:
   - if profile exists, suggest `/reversa-pricing-estimate`
   - if profile does not exist, suggest `/reversa-pricing-profile`

End with:

> Type **CONTINUE** to proceed according to the suggestion above.
