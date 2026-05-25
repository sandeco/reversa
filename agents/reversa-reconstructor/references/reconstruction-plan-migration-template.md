# Reconstruction Plan — {{PROJECT_NAME}}

**Source:** migration
**Target paradigm:** {{PARADIGM}}
**Topology:** {{TOPOLOGY}}
**Stack:** {{STACK}}
**Strategy:** {{STRATEGY}}
**Generated on:** {{DATE}}
**Status:** {{TOTAL}} tasks | {{DONE}} completed | {{PENDING}} pending

---

## Preflight Alerts

> Review before starting. Items REFERRED TO CODING in `ambiguity_log.md` that affect specific tasks are marked.

{{#each PREFLIGHT_ALERTS}}
- ⚠️ **{{this.item}}** — affects Task {{this.task_number}} ({{this.task_name}}). Source: `_reversa_sdd/migration/ambiguity_log.md`
{{/each}}

{{#if NO_ALERTS}}
No blocking items. May begin.
{{/if}}

---

## Tasks

### Task 01 — New Project Setup
**Status:** pending
**Reads:** `_reversa_sdd/migration/topology_decision.md`, `_reversa_sdd/migration/paradigm_decision.md`
**Builds:** initial folder/module structure, base configuration, minimal dependencies
**Done when:** New repository skeleton matches approved topology and chosen paradigm

---

### Task 02 — Target Database Schema
**Status:** pending
**Reads:** `_reversa_sdd/migration/target_data_model.md`
**Builds:** migrations, schema, ORM models (as per stack)
**Done when:** All tables/collections of the target data model exist with correct types, constraints, and relationships

---

### Task 03 — Data Migration Plan
**Status:** pending
**Reads:** `_reversa_sdd/migration/data_migration_plan.md`, `_reversa_sdd/migration/target_data_model.md`
**Builds:** ETL scripts/jobs, integrity validations, rollback
**Done when:** Migration scripts tested on representative volume, validations match the plan
**Note:** Skip if the strategy in `migration_strategy.md` does not involve data migration (e.g., new system from scratch without legacy data)

---

### Task 04 — Target Domain Entities
**Status:** pending
**Reads:** `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Builds:** entities, value objects, aggregates, business rules
**Done when:** Domain implemented per target model, business rules covered by tests

---

<!-- MODULE_TASKS_START -->
<!-- The Reconstructor inserts one task per module identified in target_architecture.md, in dependency order. -->
<!-- Example: -->

### Task 05 — [Module Name]
**Status:** pending
**Reads:** `_reversa_sdd/migration/target_architecture.md` (`[module]` section), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Builds:** [module path per approved topology]
**Done when:** [parity criterion extracted from parity_specs.md, if applicable; otherwise, criterion in target_architecture.md]
**Alert:** [if there is an associated item REFERRED TO CODING]

<!-- MODULE_TASKS_END -->

---

### Task {{CUTOVER_N}} — Cutover
**Status:** pending
**Reads:** `_reversa_sdd/migration/cutover_plan.md`
**Builds:** cutover scripts/checklists, traffic switch, executable rollback plan
**Done when:** New system receives traffic per plan and legacy can be shut down/frozen as decided

---

### Task {{PARITY_N}} — Parity Validation
**Status:** pending
**Reads:** `_reversa_sdd/migration/parity_specs.md`, `_reversa_sdd/migration/parity_tests/[list of .feature files]`
**Builds:** parity test suite running against legacy and new, divergence report
**Done when:** All critical flows defined in parity_specs.md pass on both systems with equivalent results
