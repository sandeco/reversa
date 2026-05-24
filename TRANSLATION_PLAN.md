# Translation Plan: Reversa Repository → English

> **Goal**: Translate all non-English content in the repository to English.
> **Source languages**: Portuguese (primary), Spanish (already translations, to be reviewed).
> **Target language**: English.
> **Strategy**: The `.pt.md` and `.es.md` files are existing translations of the base `.md` files. After translation, these language-specific copies should be removed or repurposed. The SKILL.md files, templates, scripts, and engine configs contain inline Portuguese that needs translation.

---

## Progress

> **Last updated**: 2026-05-24
> **Last session**: Ralph loop completed — Phase 1.1 (Core agents) mostly done (24/27 files).

| Phase | Status | Progress |
|---|---|---|
| 1.1 Core agents | 🔄 In progress | 24/27 |
| 1.2 Forward cycle agents | ⏸️ Pending | 0/11 |
| 1.3 Migration team agents | ⏸️ Pending | 0/14 |
| 1.4 New project agents | ⏸️ Pending | 0/9 |
| 1.5 Visualization & specialist agents | ⏸️ Pending | 0/19 |
| 1.6 Pricing agents | ⏸️ Pending | 0/6 |
| 1.7 Docs team agents | ⏸️ Pending | 0/10 |
| 2.1 Forward templates | ⏸️ Pending | 0/8 |
| 2.2 Migration templates | ⏸️ Pending | 0/21 |
| 2.3 Engine config files | ⏸️ Pending | 0/5 |
| 2.4 Documentation templates | ⏸️ Pending | 0/9 |
| 3. Configuration & Metadata | ⏸️ Pending | 0/5 |
| 4. Cleanup & Renaming | ⏸️ Pending | 0/5 |
| **Total** | 🔄 In progress | **24/134** |

---

## Scope Summary

| Category | Files to Translate | Notes |
|---|---:|---|
| Agents SKILL.md files | 49 | Frontmatter + body content in Portuguese |
| Agents reference files | 89 | Mixed: some Portuguese, some English |
| Templates (.md) | 27 | Portuguese comments, instructions, headers |
| Templates (engine configs) | 5 | Portuguese comments/instructions |
| Templates (shell scripts) | 3 | Portuguese comments |
| Other (README, LICENSE, mkdocs.yml, etc.) | ~10 | Check for Portuguese content |
| **Total** | **~130+** | |

---

---

## Phase 1: Agent SKILL.md Files

> Each SKILL.md has a YAML frontmatter (name, description, compatibility) and a markdown body. Both typically contain Portuguese. Translate to English, preserving YAML structure.

### 1.1. Core agents

- [x] `agents/reversa/SKILL.md` — main entry point
- [x] `agents/reversa/references/checkpoint-guide.md`
- [x] `agents/reversa/references/state-schema.md`
- [x] `agents/reversa/references/step-01-first-run.md`
- [x] `agents/reversa/references/step-02-resume.md`
- [x] `agents/reversa/references/step-03-specs-organization.md`
- [x] `agents/reversa/references/step-04-regression-check.md`
- [x] `agents/reversa-scout/SKILL.md`
- [x] `agents/reversa-archaeologist/SKILL.md`
- [x] `agents/reversa-archaeologist/references/modules-schema.md`
- [x] `agents/reversa-detective/SKILL.md`
- [x] `agents/reversa-architect/SKILL.md`
- [x] `agents/reversa-writer/SKILL.md`
- [x] `agents/reversa-writer/references/design-template.md`
- [x] `agents/reversa-writer/references/requirements-template.md`
- [x] `agents/reversa-writer/references/tasks-template.md`
- [x] `agents/reversa-reviewer/SKILL.md`
- [x] `agents/reversa-reviewer/references/confidence-report-template.md`
- [x] `agents/reversa-reviewer/references/confidence-rules.md`
- [x] `agents/reversa-reviewer/references/questions-template.md`
- [x] `agents/reversa-visor/SKILL.md`
- [x] `agents/reversa-data-master/SKILL.md`
- [x] `agents/reversa-design-system/SKILL.md`
- [x] `agents/reversa-agents-help/SKILL.md`
- [ ] `agents/reversa-reconstructor/SKILL.md`
- [ ] `agents/reversa-reconstructor/references/reconstruction-plan-template.md`
- [ ] `agents/reversa-reconstructor/references/reconstruction-plan-migration-template.md`

### 1.2. Forward cycle agents

- [ ] `agents/reversa-extract-soul/SKILL.md`
- [ ] `agents/reversa-requirements/SKILL.md`
- [ ] `agents/reversa-clarify/SKILL.md`
- [ ] `agents/reversa-plan/SKILL.md`
- [ ] `agents/reversa-to-do/SKILL.md`
- [ ] `agents/reversa-coding/SKILL.md`
- [ ] `agents/reversa-audit/SKILL.md`
- [ ] `agents/reversa-quality/SKILL.md`
- [ ] `agents/reversa-forward/SKILL.md`
- [ ] `agents/reversa-resume/SKILL.md`
- [ ] `agents/reversa-principles/SKILL.md`

### 1.3. Migration team agents

- [ ] `agents/reversa-migrate/SKILL.md`
- [ ] `agents/reversa-migrate/references/auto-defaults.md`
- [ ] `agents/reversa-migrate/references/handoff-checklist.md`
- [ ] `agents/reversa-paradigm-advisor/SKILL.md`
- [ ] `agents/reversa-paradigm-advisor/references/paradigm-catalog.md`
- [ ] `agents/reversa-curator/SKILL.md`
- [ ] `agents/reversa-curator/references/decision-rubric.md`
- [ ] `agents/reversa-strategist/SKILL.md`
- [ ] `agents/reversa-strategist/references/migration-strategies.md`
- [ ] `agents/reversa-designer/SKILL.md`
- [ ] `agents/reversa-designer/references/paradigm-checklist.md`
- [ ] `agents/reversa-screen-translator/SKILL.md`
- [ ] `agents/reversa-screen-translator/references/adapter-pairs.md`
- [ ] `agents/reversa-screen-translator/references/platform-detection.md`
- [ ] `agents/reversa-inspector/SKILL.md`
- [ ] `agents/reversa-inspector/references/parity-coverage-matrix.md`

### 1.4. New project agents

- [ ] `agents/reversa-new/SKILL.md`
- [ ] `agents/reversa-ideator/SKILL.md`
- [ ] `agents/reversa-researcher/SKILL.md`
- [ ] `agents/reversa-drafter/SKILL.md`
- [ ] `agents/reversa-spec-sdd/SKILL.md`
- [ ] `agents/reversa-spec-sdd/references/sdd_guide.md`
- [ ] `agents/reversa-spec-sdd/references/evaluation_rubric.md`
- [ ] `agents/reversa-spec-sdd/references/spec_template.md`
- [ ] `agents/reversa-spec-sdd/assets/spec_examples.md`

### 1.5. Visualization & specialist agents

- [ ] `agents/reversa-arquitetura-3d/SKILL.md`
- [ ] `agents/reversa-arquitetura-3d/references/ARCH_TOUR.md`
- [ ] `agents/reversa-arquitetura-3d/references/CALL_GRAPH_3D.md`
- [ ] `agents/reversa-arquitetura-3d/references/CODE_CITY.md`
- [ ] `agents/reversa-arquitetura-3d/references/DEPENDENCY_GRAPH_3D.md`
- [ ] `agents/reversa-arquitetura-3d/references/ERRORS.md`
- [ ] `agents/reversa-arquitetura-3d/references/LAYER_STACK.md`
- [ ] `agents/reversa-arquitetura-3d/references/THREE_PATTERNS.md`
- [ ] `agents/reversa-especialista-d3/SKILL.md`
- [ ] `agents/reversa-especialista-d3/references/api-core.md`
- [ ] `agents/reversa-especialista-d3/references/interatividade.md`
- [ ] `agents/reversa-especialista-d3/references/layouts-complexos.md`
- [ ] `agents/reversa-highcharts-visualizer/SKILL.md`
- [ ] `agents/reversa-highcharts-visualizer/references/CHART_CATALOG.md`
- [ ] `agents/reversa-highcharts-visualizer/references/ERRORS.md`
- [ ] `agents/reversa-highcharts-visualizer/references/HIGHCHARTS_PATTERNS.md`
- [ ] `agents/reversa-selo-generativo/SKILL.md`
- [ ] `agents/reversa-selo-generativo/references/ERRORS.md`
- [ ] `agents/reversa-selo-generativo/references/GENERATIVE_PATTERNS.md`
- [ ] `agents/reversa-selo-generativo/references/PALETTE_BY_STYLE.md`
- [ ] `agents/reversa-image-prompt-json/SKILL.md`
- [ ] `agents/reversa-image-prompt-json/references/Examples.md`

### 1.6. Pricing agents

- [ ] `agents/reversa-pricing-profile/SKILL.md`
- [ ] `agents/reversa-pricing-size/SKILL.md`
- [ ] `agents/reversa-pricing-estimate/SKILL.md`
- [ ] `agents/reversa-pricing-estimate/references/effort-formula.md`
- [ ] `agents/reversa-pricing-estimate/references/market-benchmarks.md`
- [ ] `agents/reversa-pricing-estimate/references/value-formula.md`

### 1.7. Docs team agents

- [ ] `agents/reversa-docs/SKILL.md`
- [ ] `agents/reversa-docs-analyst/SKILL.md`
- [ ] `agents/reversa-docs-mapper/SKILL.md`
- [ ] `agents/reversa-docs-mapper/references/extraction-policy.md`
- [ ] `agents/reversa-docs-publisher/SKILL.md`
- [ ] `agents/reversa-docs-storyteller/SKILL.md`
- [ ] `agents/reversa-n8n/SKILL.md`
- [ ] `agents/reversa-n8n/references/node-catalog.md`

---

## Phase 2: Templates

### 2.1. Forward templates

- [ ] `templates/forward/body/requirements-template.md`
- [ ] `templates/forward/body/actions-template.md`
- [ ] `templates/forward/body/roadmap-template.md`
- [ ] `templates/forward/body/principles-template.md`
- [ ] `templates/forward/body/quality-template.md`
- [ ] `templates/forward/scripts/sh/bind-to-extraction.sh`
- [ ] `templates/forward/scripts/sh/prepare-roadmap.sh`
- [ ] `templates/forward/scripts/sh/verify-prerequisites.sh`

### 2.2. Migration templates

- [ ] `templates/migration/artifacts/ambiguity_log.md`
- [ ] `templates/migration/artifacts/cutover_plan.md`
- [ ] `templates/migration/artifacts/data_migration_plan.md`
- [ ] `templates/migration/artifacts/discard_log.md`
- [ ] `templates/migration/artifacts/handoff.md`
- [ ] `templates/migration/artifacts/migration_brief.md`
- [ ] `templates/migration/artifacts/migration_strategy.md`
- [ ] `templates/migration/artifacts/paradigm_decision.md`
- [ ] `templates/migration/artifacts/parity_specs.md`
- [ ] `templates/migration/artifacts/pending_decisions.md`
- [ ] `templates/migration/artifacts/risk_register.md`
- [ ] `templates/migration/artifacts/target_architecture.md`
- [ ] `templates/migration/artifacts/target_business_rules.md`
- [ ] `templates/migration/artifacts/target_data_model.md`
- [ ] `templates/migration/artifacts/target_domain_model.md`
- [ ] `templates/migration/catalogs/migration_strategies.md`
- [ ] `templates/migration/catalogs/paradigm_catalog.md`
- [ ] `templates/plan.md`

### 2.3. Engine config files

- [ ] `templates/engines/amazonq`
- [ ] `templates/engines/clinerules`
- [ ] `templates/engines/cursorrules`
- [ ] `templates/engines/roorules`
- [ ] `templates/engines/windsurf`

### 2.4. Documentation templates (HTML/TPL)

- [ ] `templates/documentation/pages/index.html.tpl`
- [ ] `templates/documentation/pages/arquitetura.html.tpl`
- [ ] `templates/documentation/pages/modulos.html.tpl`
- [ ] `templates/documentation/pages/glossario.html.tpl`
- [ ] `templates/documentation/pages/metricas.html.tpl`
- [ ] `templates/documentation/pages/timeline.html.tpl`
- [ ] `templates/documentation/pages/topologia.html.tpl`
- [ ] `templates/documentation/pages/deck.html.tpl`
- [ ] `templates/documentation/pages/features/feature.html.tpl`

---

## Phase 3: Configuration & Metadata

- [ ] `mkdocs.yml` — check for Portuguese config values
- [ ] `README.md` — translate Portuguese content
- [ ] `package.json` — check descriptions
- [ ] `templates/config.toml` — check for Portuguese comments
- [ ] `templates/config.user.toml` — check for Portuguese comments

---

## Phase 4: Cleanup & Renaming

> After all translations are complete, decide on the naming strategy:

- [ ] **Option A**: Rename `.pt.md` files to `.md` (overwrite) and remove original `.md` files
- [ ] **Option B**: Keep all language versions, rename `.pt.md` → `en.md`, `.es.md` → `es.md` (keep Spanish)
- [ ] **Option C**: Remove all `.pt.md` and `.es.md` files (English is the new default)
- [ ] Update `mkdocs.yml` site configuration for new file names
- [ ] Update any internal links that reference language-specific paths

---

## Notes

- **Agent SKILL.md files**: The `name` field in YAML frontmatter should stay as-is (e.g., `reversa-arquitetura-3d`). Only translate `description` and body text.
- **Technical terms**: Keep framework names, tool names, and proper nouns (Three.js, D3.js, Highcharts, N8N, Claude Code, etc.) in their original form.
- **Portuguese-specific terms**: Terms like "pipeline forward", "Time de Migração", "Spec" should be translated to "forward pipeline", "Migration Team", "Spec" (or "specification" where appropriate).
- **Spanish files**: These are already translations — they may need review for accuracy if the base `.md` files are also being updated.
