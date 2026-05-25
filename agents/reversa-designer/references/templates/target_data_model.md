---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: target_data_model
producedBy: designer
hash: "sha256:<hash of the body below the front matter>"
---

# Target Data Model

> Data model of the new system. Schema, relationships, and constraints.

## Overview
<Short text: main database type, split by bounded context, roles (OLTP / OLAP / event store).>

## Data entities

| Entity | Table / collection | Owning aggregate | PK | Bounded context |
|---|---|---|---|---|
| <name> | <ref> | <AGG> | <field> | <BC> |

## Schema (DDL or equivalent)

```sql
-- Replace with the real DDL of the target system.
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Relationships

| Source | Target | Cardinality | Integrity | Notes |
|---|---|---|---|---|
| orders.customer_id | customers.id | N:1 | FK ON DELETE RESTRICT | |

## Constraints

- **Uniqueness**: <list>
- **Referential integrity**: <enabled / disabled and why>
- **Partitioning / sharding** (if applicable): <description>
- **Critical indexes**: <list>

## Target-paradigm-specific considerations

> Dedicated section when the target paradigm is event-driven, functional, or another paradigm with direct implications for the data model.

- <e.g. event-driven → outbox table for at-least-once guarantees>
- <e.g. event sourcing → event store as the source of truth, derived projections>
- <e.g. immutability → immutable events / snapshots, no updates>

## Legacy origin

| New table / collection | Legacy origin | Transformation |
|---|---|---|
| orders | `<legacy schema>.tb_orders` | rename + normalized types |

## Notes
<Additional observations about the data model.>
