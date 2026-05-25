---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: discard_log
producedBy: curator
hash: "sha256:<hash of the body below the front matter>"
---

# Discard Log

> Full record of what was discarded from the migration and why. Each item is traceable back to its legacy origin.

## Discarded items

### BR-DESCARTAR-001
- **Source**: `_reversa_sdd/<unit>/{requirements,design}.md` § <section>
- **Description**: <discarded rule or behavior>
- **Rationale**: <text>
- **Linked to paradigm**: yes | no
  - If yes: <which paradigm and how the target paradigm absorbs the case>
- **Replacement in the new system**: <none | replaced by X>
- **Risk of discarding**: low | medium | high, with explanatory note

<repeat for each item>

## Items discarded because of paradigm change (dedicated subsection)

> Lists only items whose `Linked to paradigm = yes`. Explicit audit trail for the coding agent.

| ID | Source | Legacy paradigm | Replacement in the target paradigm |
|---|---|---|---|
| BR-DESCARTAR-XXX | <ref> | <e.g. synchronous pessimistic lock> | <e.g. idempotency via event ID> |

## Notes
<Final observations from the Curator about the discarded set.>
