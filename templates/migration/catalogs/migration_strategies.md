---
schemaVersion: 1
kind: migration_strategies
description: Advisory catalog of migration strategies with applicability criteria. Used by the Strategist.
---

# Migration Strategies

> Catalog of canonical migration strategies with applicability criteria, cost, risk, time, example, and references.
> Updating this catalog is a maintenance task independent of the Strategist agent.

## Strategies

### Strangler Fig
- **Description**: The new system grows around the legacy system, incrementally capturing functionality until the legacy system can be turned off.
- **When it applies**:
  - System in production that cannot stop.
  - Need for incremental delivery.
  - Ability to route between old and new (proxy / API gateway).
- **Cost**: medium.
- **Risk**: low (partial rollback is viable).
- **Time**: long (months to years in large systems).
- **Favored appetite**: conservative, balanced.
- **Example**: API gateway redirects `/v2/orders/*` endpoints to the new system while `/orders/*` stays in the legacy system.
- **References**: Martin Fowler, "StranglerFigApplication"; Sam Newman, "Monolith to Microservices".

### Big Bang
- **Description**: Complete replacement in a single cutover window.
- **When it applies**:
  - Small system.
  - Tolerated maintenance window.
  - High transformational appetite.
  - Low amount of live external integrations.
- **Cost**: low (no maintenance of two versions).
- **Risk**: high (full rollback is expensive, failure brings the service down).
- **Time**: short.
- **Favored appetite**: transformational (in small systems).
- **Example**: internal tool used by 50 people migrated in one night with documented rollback.
- **References**: described in several migration frameworks, strongly correlated with historical failures in large systems.

### Parallel Run
- **Description**: Legacy and new systems run in parallel receiving the same input, output is compared to detect divergence.
- **When it applies**:
  - Critical logic (financial, tax, regulatory).
  - Need for proof of equivalence over a long period.
  - Large paradigm change + transformational appetite (high operational risk).
- **Cost**: high (two stacks running simultaneously, output comparison).
- **Risk**: medium (risks come from dual operation, not cutover).
- **Time**: medium.
- **Favored appetite**: balanced.
- **Example**: tax calculation running in legacy and new for 60 days, cutover only after divergence < 0.01%.
- **References**: Michael Nygard, "Release It!"; common in banking and tax systems.

### Branch by Abstraction
- **Description**: Internal refactoring of the legacy system to introduce an abstraction that allows swapping the implementation underneath, then replacing it.
- **When it applies**:
  - Internal migration (language or framework changes, but the domain stays).
  - Conservative appetite.
  - Team already inside the legacy system with code mastery.
- **Cost**: low.
- **Risk**: low.
- **Time**: medium.
- **Favored appetite**: conservative.
- **Example**: extract `OrderRepository` interface in the legacy system, keep old and new implementations selected by flag, then remove the old one.
- **References**: Paul Hammant, "Branch By Abstraction".

## Quick comparison

| Strategy | When it applies | Cost | Risk | Time |
|---|---|---|---|---|
| Strangler Fig | production system, cannot stop | medium | low | long |
| Big Bang | small system, controlled window, transformational appetite | low | high | short |
| Parallel Run | critical logic (financial / tax) | high | medium | medium |
| Branch by Abstraction | internal refactoring before migration | low | low | medium |

## Influence of paradigm on choice

- **`conservative` appetite** → favors Branch by Abstraction and Strangler Fig.
- **`balanced` appetite** → favors Strangler Fig and Parallel Run.
- **`transformational` appetite** → allows Big Bang in small systems, Strangler Fig with deep boundaries in larger systems.
- **Large paradigm change + transformational appetite** → flag `high operational divergence risk` and recommend Parallel Run for validation.

## Utility function (used by the Strategist)

Pseudo-procedure the agent follows when consulting the catalog:

1. Receive `migration_brief` (scope, deadline, constraints) + `derived_appetite` + `paradigm gap`.
2. Filter strategies by applicability (drop those that clearly do not fit).
3. Score each remaining strategy by fit to appetite and gap.
4. Select the best 2 to 3 candidates.
5. Mark one as `recommended` with explicit justification.
6. For each remaining strategy, list cons as reasons for not recommending it.

## Catalog test scenarios

1. brief = banking system in production, conservative appetite → recommend Strangler Fig + Branch by Abstraction.
2. brief = internal tool, 50 users, transformational appetite → recommend Big Bang.
3. brief = tax system, balanced appetite, high paradigm change → recommend Parallel Run + Strangler Fig.
4. brief = Rails monolith to Go microservices, transformational appetite, major paradigm change → recommend Strangler Fig with deep boundaries, flag operational risk, suggest Parallel Run for critical domains.
5. brief = .NET WebForms to Blazor, balanced appetite, no major paradigm change → recommend Strangler Fig.
6. brief = legacy system with few integrations, tolerated maintenance window, balanced appetite → recommend Big Bang with robust rollback plan, alternative Strangler Fig.
