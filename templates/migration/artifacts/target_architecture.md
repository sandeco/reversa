---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: target_architecture
producedBy: designer
hash: "sha256:<hash of the body below the front matter>"
---

# Target Architecture

> Target architecture of the new system, respecting the paradigm chosen in `paradigm_decision.md` and the strategy confirmed in `migration_strategy.md`.

## Overview
<3 to 6 line summary: what the new system is, which paradigm it follows, what edges it has with the legacy system during migration.>

## Diagram (Mermaid)

```mermaid
flowchart LR
    %% Replace with the real diagram
    Client -->|HTTP| API
    API --> Service
    Service --> Database[(DB)]
    Service -.events.-> Queue[[Messaging]]
```

## Components

| Component | Type | Responsibility | Origin (legacy / new / merged) |
|---|---|---|---|
| <name> | API / Service / Worker / DB / Queue | <text> | <reference to legacy or "new"> |

## Bounded contexts

### BC-01: <name>
- **Responsibility**: <text>
- **Justification for grouping / separation**: <why this context was not decomposed 1-to-1 from the legacy system>
- **Internal components**: <list>
- **Published events** (if event-driven paradigm): <list>
- **Consumed events**: <list>

<repeat per context>

## Architectural decisions (ADR-style summary)

### AD-01: <title>
- **Decision**: <text>
- **Discarded alternatives**: <list>
- **Justification**: <text, tying to paradigm, strategy, and appetite>
- **Traceability**: <reference to the legacy system or discard_log>

## Honoring the chosen paradigm

> Mandatory section when there is a paradigm change. Demonstrates that the architecture honors the decision in `paradigm_decision.md`.

- **Target paradigm**: <from `paradigm_decision.md`>
- **How the architecture honors this paradigm**:
  - <e.g. event-driven → explicit events, message schemas, eventual consistency strategy>
  - <e.g. OO with DI → interfaces, injection container, clear boundaries between layers>
  - <e.g. functional → immutable types, composition, absence of side effects in the domain>

## Edges with the legacy system during migration
- <e.g. during Strangler Fig, the new API reroutes calls from legacy X until phase Y>

## Notes
<Additional design observations.>
