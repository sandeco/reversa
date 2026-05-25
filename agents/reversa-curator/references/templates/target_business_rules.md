---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: target_business_rules
producedBy: curator
hash: "sha256:<hash of the body below the front matter>"
---

# Target Business Rules

> Catalog of legacy business rules with a migration decision: MIGRATE, DISCARD, or HUMAN DECISION.
> Each item traces back to its origin in `_reversa_sdd/` and respects `paradigm_decision.md`.

## Summary
- Total rules analyzed: <N>
- MIGRATE: <n>
- DISCARD: <n> (details in `discard_log.md`)
- HUMAN DECISION: <n>

## MIGRATE rules

### BR-MIGRAR-001
- **Source**: `_reversa_sdd/<unit>/{requirements,design}.md` § <section>
- **Original confidence**: 🟢 | 🟡 | 🔴 | ⚠️
- **Description**: <rule>
- **Migration rationale**: <why it migrates>
- **Compatibility with the target paradigm**: <note; e.g. it will need to be expressed as an event>

<repeat for each rule>

## DISCARD rules (summary)

| ID | Source | Short reason | Linked to paradigm? |
|---|---|---|---|
| BR-DESCARTAR-001 | <ref> | <reason> | yes/no |

> Full details in `discard_log.md`.

## HUMAN DECISION rules

### BR-HUMANA-001
- **Source**: <ref>
- **Ambiguity type**: ⚠️ AMBIGUOUS | 🔴 GAP | stakeholder dependency
- **Description**: <rule>
- **Options**: <clear options>
- **Curator recommendation**: <suggested option and why>
- **Status**: PENDING | RESOLVED (choice + decision maker + date)

<repeat for each item>

## Notes
<General observations from the Curator. Items that will be consolidated in `ambiguity_log.md`.>
