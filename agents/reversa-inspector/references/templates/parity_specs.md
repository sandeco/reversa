---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: parity_specs
producedBy: inspector
hash: "sha256:<hash of the body below the front matter>"
---

# Parity Specs

> Strategy for validating behavioral equivalence between the legacy system and the new system, adapted to the paradigm chosen in `paradigm_decision.md`.

## General strategy
- **Applicable validation modes** (check the ones in use):
  - [ ] Shadow mode (traffic mirroring with asynchronous comparison)
  - [ ] Characterization tests (suite derived from the current legacy behavior)
  - [ ] Contract tests (external interfaces)
  - [ ] Data parity (snapshots and checksums)
  - [ ] Other: <specify>

## "Accepted parity" criteria
- **Primary metric**: <e.g. functional divergence rate < 0.01% over N consecutive days>
- **Observation window**: <evaluation period>
- **Blocking criterion**: <when insufficient parity blocks cutover>

## Paradigm-adapted coverage

> This section changes according to the target paradigm confirmed in `paradigm_decision.md`.

### No paradigm change
- Standard functional equivalence: same input → same output → same observable side effect.

### Synchronous → event-driven transition
- **Message ordering**: <acceptance criterion per channel / partition>
- **Idempotency**: <proof that reprocessing does not duplicate the effect>
- **Eventual consistency**: <maximum accepted propagation window>
- **Behavior under queue failure**: <retry, DLQ, replay>

### Procedural → OO transition
- **Aggregate invariants**: <set to validate>
- **Validation in factories / constructors**: <critical cases>

### OO → functional transition
- **Immutability**: <critical points to observe>
- **Absence of expected side effects**: <where the legacy system had implicit side effects>
- **Equivalence under composition**: <composed functions match the legacy flow>

## Test types to apply
- **Functional**: <description, tool>
- **Contract**: <description, tool>
- **Load / performance**: <description, targets>
- **Resilience** (if applicable): <queue failure, external dependency unavailable>

## Reuse of discovery-team characterization_specs
- **Source**: `_reversa_sdd/characterization_specs/` or another available equivalent.
- **Adaptations required for the new system**: <text>

## Outputs
- `parity_tests/*.feature`: Gherkin scenarios for the critical flows.

## Notes
<Additional observations.>
