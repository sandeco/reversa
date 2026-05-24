# [Unit Name], Technical Design

> Template for the `design.md` file. Focuses on HOW the unit is built, based on the legacy code read.

## Interface
[Inputs, outputs, parameters, data types]

For HTTP endpoints:

| Method | Path | Input | Output | Status codes |
|--------|------|-------|--------|--------------|
| GET | `/resource/:id` | `id: string` | `Resource` | 200, 404 |
| POST | `/resource` | `ResourceCreate` | `Resource` | 201, 400, 409 |

For classes/functions:

| Symbol | Signature | Return | Note |
|--------|-----------|--------|------|
| `ClassName.method` | `(arg1: T, arg2: U)` | `V` | [Relevant detail] |

## Main Flow
1. [Step 1, with reference to the legacy file when applicable]
2. [Step 2]
3. [Step N]

## Alternative Flows
- **[Special condition]:** [behavior]
- **[Error case]:** [behavior]

## Dependencies
- [Component X], [reason, how it is used]
- [Service Y], [reason, how it is used]

## Identified Design Decisions

| Decision | Code Evidence | Confidence |
|----------|---------------|------------|
| [e.g., persistence via Prisma with soft-delete] | `prisma/schema.prisma:42` | 🟢 |
| [e.g., in-memory cache with 5min TTL] | `cache/store.ts:18` | 🟡 |

## Internal State
[If the unit maintains state, describe which fields, where they are stored, how they evolve]

## Observability
[Logs, metrics, traces emitted by the unit, with reference to code]

## Risks and Gaps
- 🔴 [Behavior that could not be inferred from code, requires human validation]
- 🟡 [Assumption that may be wrong]
