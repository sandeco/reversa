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

> Complete record of what was discarded from the migration and why. Each item has traceability back to its legacy origin.

## Discarded items

### BR-DISCARD-001
- **Origin**: `_reversa_sdd/<unit>/{requirements,design}.md` § <section>
- **Description**: <discarded rule or behavior>
- **Justification**: <text>
- **Linked to paradigm**: yes | no
  - If yes: <which paradigm and how the target paradigm absorbs the case>
- **Replacement in the new system**: <none | replaced by X>
- **Risk of discarding**: low | medium | high, with explanatory note

<repeat per item>

## Items discarded due to paradigm change (dedicated subsection)

> List only items whose `Linked to paradigm = yes`. Explicit audit for the coding agent.

| ID | Origin | Legacy paradigm | Replacement in target paradigm |
|---|---|---|---|
| BR-DISCARD-XXX | <ref> | <e.g. synchronous pessimistic lock> | <e.g. idempotency via event ID> |

## Notes
<Final observations from the Curator about the discarded set.>
