---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: screen_deviation_log
producedBy: screen-translator
mode: append-only
hash: "sha256:<hash of the body below the front matter>"
---

# Screen Deviation Log

> Record of every divergence between the legacy system and the spec generated in `target_screens.md`. Append-only. Pending deviations block handoff to Inspector.
> Approved deviations are propagated to `parity_specs.md § Exceptions` when Inspector runs.

## Conventions

- **ID**: `DEV-NNN` (sequential, three digits).
- **Type**:
  - `technical`: technical limitation of the target (e.g. Windows terminal without UTF-8 without `chcp 65201`).
  - `modernization`: intentional divergence caused by modernized mode.
  - `platform`: divergence forced by platform incompatibility (e.g. Win16 → web).
  - `correction`: visual bug in the legacy system that the target fixes (e.g. typo in a label).
- **Approval**: `pending` | `approved` | `rejected`.
- Deviation `approved` → also listed in `parity_specs.md § Exceptions`.
- Deviation `pending` → blocks handoff to Inspector.
- Deviation `rejected` → archived with an explicit note; the agent regenerates the screen in a conforming mode.

## Summary

- **Total**: <N>
- **Pending**: <N>
- **Approved**: <N>
- **Rejected**: <N>

## Entries

### DEV-001

| Field | Value |
|---|---|
| Affected screen | <canonical-name> |
| Type | `technical` \| `modernization` \| `platform` \| `correction` |
| Description | <what differs between legacy and new> |
| Reason | <why the divergence is necessary or acceptable> |
| Legacy origin | <file:line> |
| Implication for parity tests | <e.g. false byte-for-byte comparison, use semantic comparison> |
| Approval | `pending` \| `approved` \| `rejected` |
| Approved by | <name or identifier, when approved> |
| Approved on | <ISO-8601, when approved> |
| Propagates to `parity_specs.md § Exceptions` | yes \| no |

### DEV-002

(repeat the block above for each deviation)

## Screens with more than one deviation

| Screen | IDs |
|---|---|
| <screen X> | DEV-001, DEV-007 |

## Notes

<General observations about the set of deviations: patterns, lessons that apply to future migrations for the same source→target pair, suggestions for an improved adapter in v2.>
