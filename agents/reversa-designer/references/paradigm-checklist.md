# Checklist for Adhering to the Target Paradigm

Quick checklist that the Designer applies before finalizing `target_architecture.md` and `target_domain_model.md`.

## Event-driven

- [ ] Events are named in the past tense (`OrderCreated`, not `CreateOrder`).
- [ ] Each event has an explicit schema with versioning.
- [ ] Commands and events are distinct.
- [ ] Idempotency is guaranteed by design (event ID, deduplication key).
- [ ] Message ordering is handled by partition key.
- [ ] Saga / orchestrator for distributed transactions, with compensation.
- [ ] Outbox table for at-least-once guarantee between DB and queue.
- [ ] DLQ defined for terminal failures.

## OO with DI

- [ ] Explicit interfaces for external dependencies.
- [ ] Dependency injection container configured per bounded context.
- [ ] Aggregates do not depend on infrastructure (no persistence logic inside aggregates).
- [ ] Concrete repositories live in the infrastructure layer.
- [ ] Active Record explicitly prohibited.

## Functional

- [ ] Immutable types in the domain.
- [ ] Pure functions in the core; side effects at the edges.
- [ ] State is a sequence of transformations, not mutation.
- [ ] Composition used to build flows.
- [ ] Algebraic types (sum types) for disjoint states.

## Actor model

- [ ] Each actor has an isolated mailbox and state.
- [ ] Hierarchical supervision defined.
- [ ] Messages between actors are immutable.
- [ ] Persistence via event sourcing or snapshots.

## Procedural / dataflow

- [ ] Flow expressed as a pipeline of transformations.
- [ ] No shared mutation.
- [ ] Independent and independently testable stages.

## General (any paradigm)

- [ ] Each element traces back to a source in the legacy system or to `discard_log.md`.
- [ ] Bounded contexts justified by cohesion, not by legacy structure.
- [ ] Mermaid diagram renders without errors.
- [ ] Architectural decisions documented in abbreviated ADR format.
