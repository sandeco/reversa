---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: handoff
producedBy: orchestrator
hash: "sha256:<hash of the body below the front matter>"
---

# Handoff for the Coding Agent

> This document is the entry point for the coding agent (Claude Code, Codex, Cursor, Antigravity, etc.) that will write the new system from the specs.

## ⚠️ Mandatory reading first

1. **`paradigm_decision.md`** — non-negotiable reading. The target paradigm shapes how all coding must happen.
2. **`topology_decision.md`** — non-negotiable reading. The chosen topology (preserve / modernize / hybrid) defines the folder tree and the boundary between modules.
3. **`screen_modernization_decision.md`** — non-negotiable reading when the legacy system has a UI. The chosen mode (literal / modernized / hybrid) defines how the coder will materialize the screens.

## Recommended reading order

1. `paradigm_decision.md` (mandatory, first)
2. `topology_decision.md` (mandatory, second)
3. `screen_modernization_decision.md` (mandatory when there is a UI; skip if Screen Translator ran in skipped mode)
4. `migration_brief.md`
5. `target_business_rules.md`
6. `migration_strategy.md`
7. `target_architecture.md`
8. `target_domain_model.md`
9. `target_data_model.md`
10. `data_migration_plan.md`
11. `target_screens.md` (when there is a UI)
12. `parity_specs.md` + `parity_tests/`
13. `screen_deviation_log.md` (advisory, when there is a UI)
14. `risk_register.md` + `cutover_plan.md`
15. `discard_log.md` (advisory)
16. `ambiguity_log.md` (advisory)

## List of produced artifacts

| Artifact | Produced by | Status |
|---|---|---|
| migration_brief.md | orchestrator | created |
| paradigm_decision.md | paradigm_advisor | created |
| target_business_rules.md | curator | created |
| discard_log.md | curator | created |
| migration_strategy.md | strategist | created |
| risk_register.md | strategist | created |
| cutover_plan.md | strategist | created |
| topology_decision.md | designer (Phase 1) | created |
| target_architecture.md | designer | created |
| target_domain_model.md | designer | created |
| target_data_model.md | designer | created |
| data_migration_plan.md | designer | created |
| screen_modernization_decision.md | screen_translator (Phase 1) | created / skipped |
| target_screens.md | screen_translator | created / skipped |
| screen_deviation_log.md | screen_translator | created / empty |
| _reversa_sdd/screens/inventory.json | screen_translator | created / empty |
| _reversa_sdd/screens/golden/manifest.yaml | screen_translator | created / optional |
| parity_specs.md | inspector | created |
| parity_tests/*.feature | inspector | <N> files |
| ambiguity_log.md | orchestrator | consolidated |

## Blockers before implementation starts
> Items that require a human decision before the coding agent begins.

- <AMB-XXX: short description + where to decide>
- <or: no blockers, proceed>

## Next steps for the coding agent

1. **Read `paradigm_decision.md` and internalize it**: the target paradigm is <from paradigm_decision>. Every code choice must honor that paradigm.
2. **Read `topology_decision.md` and internalize it**: the chosen topology is <preserve | modernize | hybrid>. Use the tree sketch recorded in that artifact as the basis for creating the new repository folder structure.
3. **Read `screen_modernization_decision.md` and internalize it** (when there is a UI): the screen-translation mode is <literal | modernized | hybrid>. In literal mode, materialize byte-for-byte (or pixel-equivalent) what is in `target_screens.md`; in modernized mode, honor the component hierarchy, tokens, and the 4 states (idle, loading, error, success).
4. **Set up the new repository** with the stack declared in `migration_brief.md` and the chosen topology.
5. **Implement bottom-up** following `target_architecture.md` and `target_domain_model.md`:
   - infrastructure → data → domain → application → edges.
6. **Implement the screens** using `target_screens.md` as the literal contract. In literal mode, with golden files present in `_reversa_sdd/screens/golden/`, the implementation result must match the golden file within the `normalizationRules` declared in `manifest.yaml`.
7. **Write the tests** from `parity_specs.md` and `parity_tests/*.feature` from the start. Honor the § Exceptions section, which reflects approved deviations in `screen_deviation_log.md`.
8. **For each component**, validate that it respects the chosen paradigm (explicit signals in `target_architecture.md § Honor to the chosen paradigm`) and the chosen topology (explicit signals in `target_architecture.md § Honor to the chosen topology`).
9. **For data migration**, follow `data_migration_plan.md`.
10. **For cutover**, follow `cutover_plan.md` and the go/no-go criteria.

## Auto-decided items (only if run with `--auto`)
> List here the items whose default was applied without human confirmation. Reviewing them before cutover is recommended.

- <or: pipeline executed in interactive mode, no auto-decided items>

## Final notes
<Observations from the orchestrator for the coding agent.>
