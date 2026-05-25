---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: target_domain_model
producedBy: designer
hash: "sha256:<hash of the body below the front matter>"
---

# Target Domain Model

> Domain model of the new system. Explicit traceability back to the legacy system (in `_reversa_sdd/domain.md` or equivalent).

## Aggregates

### AGG-Order
- **Aggregate root**: Order
- **Invariants**:
  - <invariant 1>
  - <invariant 2>
- **Accepted commands**: <list>
- **Published events** (if the paradigm is event-driven): <list>
- **Legacy origin**: <reference to `domain.md` or equivalent>

<repeat for each aggregate>

## Entities

| Entity | Owning aggregate | Main attributes | Legacy origin |
|---|---|---|---|
| <name> | <agg> | <summary list> | <ref> |

## Value objects

| Value object | Attributes | Validations | Origin |
|---|---|---|---|
| <name> | <list> | <rules> | <ref> |

## Domain events
> Mandatory section if the paradigm is event-driven or hybrid.

| Event | Published by | Consumed by | Schema (summary) |
|---|---|---|---|
| <OrderCreated> | AGG-Order | Payments, Inventory | <fields> |

## Domain rules
> Mapping of rules from `target_business_rules.md` (MIGRATE rules only) to the aggregates / services where they now live.

| Rule (ID) | Location in the new domain | Source (target_business_rules.md) |
|---|---|---|
| BR-MIGRAR-001 | AGG-Order.invariant <name> | BR-MIGRAR-001 |

## Traceability back to the legacy system

| New element | Legacy origin | Mapping type |
|---|---|---|
| AGG-Order | `domain.md § Order` + `sdd/orders.md` | merged |
| <new> | <ref> | 1-to-1 / merged / split / new |

## Notes
<Additional modeling observations.>
