# Reconstruction Plan — {{PROJECT_NAME}}

**Stack:** {{STACK}}
**Generated on:** {{DATE}}
**Status:** {{TOTAL}} tasks | {{DONE}} completed | {{PENDING}} pending

---

## Pre-flight Alerts

> Review these points before starting. Gaps marked with ⚠️ block the associated task.

{{#each PREFLIGHT_ALERTS}}
- ⚠️ **{{this.gap}}** — blocks Task {{this.task_number}} ({{this.task_name}})
{{/each}}

{{#if NO_ALERTS}}
No critical gaps identified. You can start safely.
{{/if}}

---

## Tasks

### Task 01 — Database Schema
**Status:** pending
**Reads:** `_reversa_sdd/erd-complete.md`, `_reversa_sdd/data-dictionary.md`
**Builds:** migrations, schema, ORM models (according to detected stack)
**Done when:** All ERD tables exist with correct types, constraints, and foreign keys

---

### Task 02 — Domain Entities
**Status:** pending
**Reads:** `_reversa_sdd/domain.md`, `_reversa_sdd/data-dictionary.md`
**Builds:** entities, value objects, domain validations
**Done when:** All entities implemented with described business rules

---

### Task 03 — State Machines
**Status:** pending
**Reads:** `_reversa_sdd/state-machines.md`
**Builds:** implementation of state flows for each entity
**Done when:** All documented states and transitions are implemented
**Note:** Skip this task if `_reversa_sdd/state-machines.md` does not exist

---

<!-- COMPONENT_TASKS_START -->
<!-- The Reconstructor inserts one task per unit here, in bottom-up order determined by dependencies.md -->
<!-- Example unit task: -->

### Task 04 — [Unit Name]
**Status:** pending
**Reads:** `_reversa_sdd/[unit]/requirements.md`, `_reversa_sdd/[unit]/design.md`, `_reversa_sdd/[unit]/tasks.md`, `_reversa_sdd/dependencies.md`
**Builds:** [module path according to stack]
**Done when:** [acceptance criterion extracted from requirements.md, "Given/When/Then" field]
**Alert:** [if a gap exists, describe it here]

<!-- COMPONENT_TASKS_END -->

---

### Task {{API_N}} — API Layer
**Status:** pending
**Reads:** `_reversa_sdd/openapi/[file list]`
**Builds:** endpoints, controllers, middlewares, authentication
**Done when:** All endpoints respond according to OpenAPI contracts

---

### Task {{STORIES_N}} — User Flows
**Status:** pending
**Reads:** `_reversa_sdd/user-stories/[file list]`
**Builds:** end-to-end integration, complete user flows
**Done when:** All user story acceptance criteria are met
