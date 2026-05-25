# Confidence Classification Rules

Use this scale in **every** claim in specs. No exceptions.

## Definitions

| Symbol | Name | Meaning |
|--------|------|---------|
| 🟢 | CONFIRMED | Extracted directly from code — can be cited with file and line |
| 🟡 | INFERRED | Deduced from patterns, names, conventions or context — may be wrong |
| 🔴 | GAP | Could not be determined from code — requires human validation |

## When to Use Each Level

### 🟢 CONFIRMED
- The behavior is explicit in code (if/else, return, throw)
- The value is a constant or enum defined in code
- The rule is in a descriptive comment next to relevant code
- There is an automated test covering exactly this behavior
- The DDL/migration defines the constraint directly

### 🟡 INFERRED
- The function/variable name suggests the behavior, but there is no explicit logic
- The behavior is consistent with framework conventions (e.g., soft delete in Eloquent)
- There are hints in the code but the complete logic is not visible in the analyzed scope
- The rule was inferred from multiple similar examples, not from a single definition
- Old comment or TODO that may not reflect the current state

### 🔴 GAP
- The functionality is referenced but not implemented in visible code
- The logic depends on external configuration not accessible (environment variable, database, API)
- The expected behavior contradicts what is in the code (possible bug or hidden logic)
- Generated or compiled code without access to the original source
- Business rule that only exists in stakeholders' minds

---

## Reclassification During Review

### Upgrade: 🟡 → 🟢
Conditions: find direct evidence in code that confirms the claim.
Action: note the evidence (file + line) in the spec.

### Upgrade: 🔴 → 🟡
Conditions: find enough hints for a reasonable inference.
Action: rephrase the claim as inference, not certainty.

### Upgrade: 🔴 → 🟢
Conditions: user confirms with concrete evidence (e.g., "yes, that is the rule").
Action: update the spec and record the confirmation.

### Downgrade: 🟢 → 🟡
Conditions: find a contradiction between the spec and the actual code.
Action: flag the contradiction and reclassify.

### Downgrade: 🟡 → 🔴
Conditions: find evidence that the inference was wrong.
Action: reclassify and create a question for the user if needed.

---

## Golden Rule

**When in doubt, use the lower level.**
An honest 🔴 is more useful than a misleading 🟡.
