# Exploration Plan — {{PROJECT}}

> Created by Reversa on {{DATE}}
> Mark each task with ✅ when completed.
> You can edit this plan before starting: add, remove, or reorder tasks as needed.

---

## Phase 1: Recognition 🔍

- [ ] **Scout** — Mapping folder structure and technologies
- [ ] **Scout** — Dependency and package manager analysis
- [ ] **Scout** — Identification of entry points, CI/CD, and configuration

## Spec organization decision 🗂️

> Between Scout and Archaeologist, Reversa asks how you want to organize the specs (by module, use case, endpoint, hybrid, by features, or customized). The choice is persisted in `.reversa/config.toml` under the `[specs]` section and will not be asked again in future runs. To show the menu again, manually remove the section.

## Phase 2: Excavation 🏗️

> Reversa fills this section with the real modules after Scout completes recognition.

- [ ] **Archaeologist** — Analysis of modules identified by Scout

## Phase 3: Interpretation 🧠

- [ ] **Detective** — Git archaeology and retroactive ADRs
- [ ] **Detective** — Implicit business rules and state machines
- [ ] **Detective** — Permissions matrix (RBAC/ACL)
- [ ] **Architect** — C4 diagrams (Context, Containers, Components)
- [ ] **Architect** — Complete ERD and external integrations
- [ ] **Architect** — Spec Impact Matrix

## Phase 4: Generation 📝

- [ ] **Writer** — SDD specs per component
- [ ] **Writer** — OpenAPI (if applicable)
- [ ] **Writer** — User Stories (if applicable)
- [ ] **Writer** — Code/Spec Matrix

## Phase 5: Review ✅

- [ ] **Reviewer** — Cross-review of specs
- [ ] **Reviewer** — Resolve gaps with the user
- [ ] **Reviewer** — Final confidence report

---

## Independent Agents

> Run these agents when the resources are available, they can run in any phase.

- [ ] **Visor** — Interface analysis via screenshots
- [ ] **Data Master** — Complete database analysis
- [ ] **Design System** — Extraction of design tokens
- [ ] **Tracer** — Dynamic analysis (requires accessible system)

---

## Next step

After the Discovery Team completes and `_reversa_sdd/` is populated, you can trigger one of the following flows:

- `/reversa-migrate`: orchestrator of the **Migration Team** (Paradigm Advisor → Curator → Strategist → Designer → Screen Translator → Inspector). Generates specs for the new system. Output in `_reversa_sdd/migration/` and `_reversa_sdd/screens/`.
- `/reversa-reconstructor`: generates a bottom-up plan to reimplement the software from the legacy specs (one task per session).
