# Step 4, Semantic Regression Check

> This step only runs on **re-extractions**, meaning when a reverse pipeline is executed on a project that has already gone through at least one `/reversa-coding` cycle. In projects without `_reversa_forward/` or without `regression-watch.md`, this step is silently skipped.

## Why it exists

Reversa is not just a one-shot extraction. Each `/reversa-coding` leaves in `_reversa_forward/<feature>/regression-watch.md` a list of rules that need to remain true on the next extraction. The reverse pipeline, when re-run, has the duty to check these rules against the current code and report regressions. This is Reversa's competitive differentiator against pure forward frameworks.

## When to run

After the **last agent in the plan** completes, before the final "extraction complete" message. The trigger is position (last item in `.reversa/plan.md`), not agent name, because the last agent varies depending on optional ones selected during install (Reviewer may be absent, for example). Run the checks in this order:

1. Check if `_reversa_forward/` exists in the project root. If it does not exist, end this step silently.
2. List all subfolders of `_reversa_forward/` that contain `regression-watch.md`.
3. If the list is empty, end.
4. Otherwise, proceed with the procedure below, one feature at a time.

## Procedure per feature

For each `_reversa_forward/<feature>/regression-watch.md`:

1. Load the file. Identify the main watch items table (columns `ID | Source | Expected Rule After Change | Verification Type | Violation Signal`).
2. For each watch item in the main table (not the archived ones):
   2.1. Identify the `Verification Type`, possible values: `presence`, `absence`, `wording`, `confidence`.
   2.2. Apply the corresponding verification against the newly generated artifacts in `_reversa_sdd/`:
        - `presence`: the rule must be present in `_reversa_sdd/domain.md` (or the file pointed to by the Source column) with the same semantic essence.
        - `absence`: the original rule MUST NOT appear in the SDD anymore.
        - `wording`: the text was deliberately changed, check if the new version matches the expectation.
        - `confidence`: the rule remains present, but the confidence (🟢, 🟡, 🔴) must be equal to or greater than expected.
   2.3. Assign a verdict:
        - 🟢 **green**, the expectation matched fully.
        - 🟡 **yellow**, there is semantic equivalence but the text differs, or the evidence is partial. Default verdict when there is ambiguity. Awaits human judgment.
        - 🔴 **red**, the expectation did NOT match. The previously confirmed rule became a violated rule.
3. After evaluating all watch items, update the `## Re-extraction History` section of the same `regression-watch.md` by adding a dated block:

```
### Re-extraction YYYY-MM-DD HH:MM

| ID | Verdict | Observation |
|----|---------|-------------|
| W001 | 🟢 green | rule preserved in _reversa_sdd/domain.md#rule-X |
| W005 | 🔴 red | rule removed from current code; unintended change |
| W010 | 🟡 yellow | equivalent text but differs literally; awaits judgment |
```

4. DO NOT modify the main watch items table. DO NOT recycle IDs. DO NOT move watch items to "Archived" automatically.

5. For each watch item with three consecutive green verdicts in the history, and provided `setup.json#watch.archive-after` allows it, move the item from the main table to the `## Archived` section at the end of the file. Keep the original ID.

## Write Policy

- Atomic write (tempfile plus rename) to `regression-watch.md`.
- Never rewrite or delete re-extraction history entries.
- The new re-extraction block always goes at the top of the `## Re-extraction History` section (descending order).

## User Report

After going through all features, present:

1. Total features verified
2. Total watch items verified
3. Breakdown by verdict: greens, yellows, reds
4. Detailed list of red items (ID, feature, rule, reason for discrepancy)
5. Detailed list of yellow items that required human judgment

If there is at least one red item, present a highlighted warning:

> 🔴 **Attention**, **N semantic regressions** were detected in previously coded features. Review before proceeding.

If `setup.json#watch.block-on-red` is `true`, suggest to the user **not** to proceed with new `/reversa-requirements` until each red item is triaged. Reversa only alerts, never automatically blocks the user's flow.

## Special case, no `_reversa_sdd/`

If during the procedure `_reversa_sdd/` does not have the expected files (because the re-extraction was partial or the documentation level was reduced), record verdict 🟡 yellow with observation `evidence missing, _reversa_sdd/<file> was not generated in this extraction` and move on.

## Known gap

Semantic equivalence between expected rule and extracted rule is a subjective assessment. When in doubt, prefer yellow verdict. Red verdict should be reserved for cases where the rule simply disappeared or was explicitly contradicted.
