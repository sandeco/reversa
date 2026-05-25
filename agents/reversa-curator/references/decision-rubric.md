# Decision Rubric for the Curator

Quick reference table for applying the decision policy.

## Decision Table

| Signal observed in the rule | Default decision | Notes |
|---|---|---|
| 🟢 CONFIRMED, compatible with target paradigm, no pain point | MIGRATE | no caveats |
| 🟡 INFERRed, compatible with target paradigm | MIGRATE | add note "validate with coding agent" |
| 🔴 GAP | HUMAN DECISION | optional recommendation |
| ⚠️ AMBIGUOUS | HUMAN DECISION | must list interpretations |
| Rule cited as pain point | HUMAN DECISION | default recommendation: replace with X in the new |
| Rule incompatible with brief (out of scope) | DISCARD | justification: "out of declared scope in migration_brief.md" |
| Rule incompatible with brief (technical) | DISCARD | justification: "brief technical constraint prevents" |
| Rule is legacy paradigm mechanism, paradigm changed | DISCARD (tied to paradigm) | indicate substitute in target paradigm |
| Rule is legacy paradigm mechanism, paradigm is the same | MIGRATE | no caveats |

## List of typical paradigm mechanisms (discardable when paradigm changes)

### Procedural → event-driven
- Pessimistic locking (`SELECT ... FOR UPDATE`)
- Full ACID transaction around the flow
- Synchronous response to user with inline side effect
- Retry implemented as `for` loop in controller

### Classic OO → OO with DI
- Active Record mixing persistence and domain
- Inheritance used for behavior reuse (prefer composition)
- Manual singleton (prefer scoped DI)

### Classic OO → functional
- Mutable encapsulation (prefer immutable types)
- Void methods with side effect (prefer return + pure function)

### OO with DI → event-driven
- Synchronous commands with immediate return (prefer event + ack)
- Centralized orchestration (prefer choreography)
- 2PC / distributed transaction (prefer saga)

### Synchronous → asynchronous in general
- Timeout configured in controller (moves to consumer's retry policy)
- Error handling as propagated exception (becomes DLQ)

## What to NEVER discard based on paradigm

- Pure business rules (calculations, conditions, derivations).
- Regulatory rules.
- Domain invariants.
- Rights / permissions.

These rules change **location** in the new paradigm, but they don't disappear.
