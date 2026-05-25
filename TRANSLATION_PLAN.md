# Translation Plan: Reversa Repository → English

> **Goal**: Translate all non-English content in the repository to English.
> **Source languages**: Portuguese (primary), Spanish (already translations, to be reviewed).
> **Target language**: English.
> **Strategy**: The `.pt.md` and `.es.md` files are existing translations of the base `.md` files. After translation, these language-specific copies should be removed or repurposed. The SKILL.md files, templates, scripts, and engine configs contain inline Portuguese that needs translation.

---

## Progress

> **Last updated**: 2026-05-25
> **Last session**: All tracked document files were translated to English. Phase 4 decision items remain intentionally pending because they are cleanup/renaming decisions, not document translations.

| Phase | Status | Progress |
|---|---|---|
| 1.1 Core agents | ✅ Complete | 27/27 |
| 1.2 Forward cycle agents | ✅ Complete | 11/11 |
| 1.3 Migration team agents | ✅ Complete | 16/16 |
| 1.4 New project agents | ✅ Complete | 9/9 |
| 1.5 Visualization & specialist agents | ✅ Complete | 22/22 |
| 1.6 Pricing agents | ✅ Complete | 6/6 |
| 1.7 Docs team agents | ✅ Complete | 8/8 |
| 2.1 Forward templates | ✅ Complete | 8/8 |
| 2.2 Migration templates | ✅ Complete | 18/18 |
| 2.3 Engine config files | ✅ Complete | 5/5 |
| 2.4 Documentation templates | ✅ Complete | 9/9 |
| 3. Configuration & Metadata | ✅ Complete | 5/5 |
| **Total tracked document files** | ✅ Complete | **144/144** |

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
- [x] `agents/reversa-reconstructor/SKILL.md`
- [x] `agents/reversa-reconstructor/references/reconstruction-plan-template.md`
- [x] `agents/reversa-reconstructor/references/reconstruction-plan-migration-template.md`

### 1.2. Forward cycle agents

- [x] `agents/reversa-extract-soul/SKILL.md`
- [x] `agents/reversa-requirements/SKILL.md`
- [x] `agents/reversa-clarify/SKILL.md`
- [x] `agents/reversa-plan/SKILL.md`
- [x] `agents/reversa-to-do/SKILL.md`
- [x] `agents/reversa-coding/SKILL.md`
- [x] `agents/reversa-audit/SKILL.md`
- [x] `agents/reversa-quality/SKILL.md`
- [x] `agents/reversa-forward/SKILL.md`
- [x] `agents/reversa-resume/SKILL.md`
- [x] `agents/reversa-principles/SKILL.md`

### 1.3. Migration team agents

- [x] `agents/reversa-migrate/SKILL.md`
- [x] `agents/reversa-migrate/references/auto-defaults.md`
- [x] `agents/reversa-migrate/references/handoff-checklist.md`
- [x] `agents/reversa-paradigm-advisor/SKILL.md`
- [x] `agents/reversa-paradigm-advisor/references/paradigm-catalog.md`
- [x] `agents/reversa-curator/SKILL.md`
- [x] `agents/reversa-curator/references/decision-rubric.md`
- [x] `agents/reversa-strategist/SKILL.md`
- [x] `agents/reversa-strategist/references/migration-strategies.md`
- [x] `agents/reversa-designer/SKILL.md`
- [x] `agents/reversa-designer/references/paradigm-checklist.md`
- [x] `agents/reversa-screen-translator/SKILL.md`
- [x] `agents/reversa-screen-translator/references/adapter-pairs.md`
- [x] `agents/reversa-screen-translator/references/platform-detection.md`
- [x] `agents/reversa-inspector/SKILL.md`
- [x] `agents/reversa-inspector/references/parity-coverage-matrix.md`

### 1.4. New project agents

- [x] `agents/reversa-new/SKILL.md`
- [x] `agents/reversa-ideator/SKILL.md`
- [x] `agents/reversa-researcher/SKILL.md`
- [x] `agents/reversa-drafter/SKILL.md`
- [x] `agents/reversa-spec-sdd/SKILL.md`
- [x] `agents/reversa-spec-sdd/references/sdd_guide.md`
- [x] `agents/reversa-spec-sdd/references/evaluation_rubric.md`
- [x] `agents/reversa-spec-sdd/references/spec_template.md`
- [x] `agents/reversa-spec-sdd/assets/spec_examples.md`

### 1.5. Visualization & specialist agents

- [x] `agents/reversa-arquitetura-3d/SKILL.md`
- [x] `agents/reversa-arquitetura-3d/references/ARCH_TOUR.md`
- [x] `agents/reversa-arquitetura-3d/references/CALL_GRAPH_3D.md`
- [x] `agents/reversa-arquitetura-3d/references/CODE_CITY.md`
- [x] `agents/reversa-arquitetura-3d/references/DEPENDENCY_GRAPH_3D.md`
- [x] `agents/reversa-arquitetura-3d/references/ERRORS.md`
- [x] `agents/reversa-arquitetura-3d/references/LAYER_STACK.md`
- [x] `agents/reversa-arquitetura-3d/references/THREE_PATTERNS.md`
- [x] `agents/reversa-especialista-d3/SKILL.md`
- [x] `agents/reversa-especialista-d3/references/api-core.md`
- [x] `agents/reversa-especialista-d3/references/interatividade.md`
- [x] `agents/reversa-especialista-d3/references/layouts-complexos.md`
- [x] `agents/reversa-highcharts-visualizer/SKILL.md`
- [x] `agents/reversa-highcharts-visualizer/references/CHART_CATALOG.md`
- [x] `agents/reversa-highcharts-visualizer/references/ERRORS.md`
- [x] `agents/reversa-highcharts-visualizer/references/HIGHCHARTS_PATTERNS.md`
- [x] `agents/reversa-selo-generativo/SKILL.md`
- [x] `agents/reversa-selo-generativo/references/ERRORS.md`
- [x] `agents/reversa-selo-generativo/references/GENERATIVE_PATTERNS.md`
- [x] `agents/reversa-selo-generativo/references/PALETTE_BY_STYLE.md`
- [x] `agents/reversa-image-prompt-json/SKILL.md`
- [x] `agents/reversa-image-prompt-json/references/Examples.md`

### 1.6. Pricing agents

- [x] `agents/reversa-pricing-profile/SKILL.md`
- [x] `agents/reversa-pricing-size/SKILL.md`
- [x] `agents/reversa-pricing-estimate/SKILL.md`
- [x] `agents/reversa-pricing-estimate/references/effort-formula.md`
- [x] `agents/reversa-pricing-estimate/references/market-benchmarks.md`
- [x] `agents/reversa-pricing-estimate/references/value-formula.md`

### 1.7. Docs team agents

- [x] `agents/reversa-docs/SKILL.md`
- [x] `agents/reversa-docs-analyst/SKILL.md`
- [x] `agents/reversa-docs-mapper/SKILL.md`
- [x] `agents/reversa-docs-mapper/references/extraction-policy.md`
- [x] `agents/reversa-docs-publisher/SKILL.md`
- [x] `agents/reversa-docs-storyteller/SKILL.md`
- [x] `agents/reversa-n8n/SKILL.md`
- [x] `agents/reversa-n8n/references/node-catalog.md`

---

## Phase 2: Templates

### 2.1. Forward templates

- [x] `templates/forward/body/requirements-template.md`
- [x] `templates/forward/body/actions-template.md`
- [x] `templates/forward/body/roadmap-template.md`
- [x] `templates/forward/body/principles-template.md`
- [x] `templates/forward/body/quality-template.md`
- [x] `templates/forward/scripts/sh/bind-to-extraction.sh`
- [x] `templates/forward/scripts/sh/prepare-roadmap.sh`
- [x] `templates/forward/scripts/sh/verify-prerequisites.sh`

### 2.2. Migration templates

- [x] `templates/migration/artifacts/ambiguity_log.md`
- [x] `templates/migration/artifacts/cutover_plan.md`
- [x] `templates/migration/artifacts/data_migration_plan.md`
- [x] `templates/migration/artifacts/discard_log.md`
- [x] `templates/migration/artifacts/handoff.md`
- [x] `templates/migration/artifacts/migration_brief.md`
- [x] `templates/migration/artifacts/migration_strategy.md`
- [x] `templates/migration/artifacts/paradigm_decision.md`
- [x] `templates/migration/artifacts/parity_specs.md`
- [x] `templates/migration/artifacts/pending_decisions.md`
- [x] `templates/migration/artifacts/risk_register.md`
- [x] `templates/migration/artifacts/target_architecture.md`
- [x] `templates/migration/artifacts/target_business_rules.md`
- [x] `templates/migration/artifacts/target_data_model.md`
- [x] `templates/migration/artifacts/target_domain_model.md`
- [x] `templates/migration/catalogs/migration_strategies.md`
- [x] `templates/migration/catalogs/paradigm_catalog.md`
- [x] `templates/plan.md`

### 2.3. Engine config files

- [x] `templates/engines/amazonq`
- [x] `templates/engines/clinerules`
- [x] `templates/engines/cursorrules`
- [x] `templates/engines/roorules`
- [x] `templates/engines/windsurf`

### 2.4. Documentation templates (HTML/TPL)

- [x] `templates/documentation/pages/index.html.tpl`
- [x] `templates/documentation/pages/arquitetura.html.tpl`
- [x] `templates/documentation/pages/modulos.html.tpl`
- [x] `templates/documentation/pages/glossario.html.tpl`
- [x] `templates/documentation/pages/metricas.html.tpl`
- [x] `templates/documentation/pages/timeline.html.tpl`
- [x] `templates/documentation/pages/topologia.html.tpl`
- [x] `templates/documentation/pages/deck.html.tpl`
- [x] `templates/documentation/pages/features/feature.html.tpl`

---

## Phase 3: Configuration & Metadata

- [x] `mkdocs.yml` — check for Portuguese config values
- [x] `README.md` — translate Portuguese content
- [x] `package.json` — check descriptions
- [x] `templates/config.toml` — check for Portuguese comments
- [x] `templates/config.user.toml` — check for Portuguese comments

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
