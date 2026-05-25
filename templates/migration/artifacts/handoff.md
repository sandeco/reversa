---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: handoff
producedBy: orchestrator
hash: "sha256:<hash of the body below the front matter>"
---

# Handoff to the Coding Agent

> This document is the entry point for the coding agent (Claude Code, Codex, Cursor, Antigravity, etc.) that will write the new system from the specs.

## ⚠️ Mandatory reading first

1. **`paradigm_decision.md`**, non-negotiable reading. The target paradigm shapes how all coding must happen.

## Recommended reading order

1. `paradigm_decision.md` (mandatory, first)
2. `migration_brief.md`
3. `target_business_rules.md`
4. `migration_strategy.md`
5. `target_architecture.md`
6. `target_domain_model.md`
7. `target_data_model.md`
8. `data_migration_plan.md`
9. `parity_specs.md` + `parity_tests/`
10. `risk_register.md` + `cutover_plan.md`
11. `discard_log.md` (advisory)
12. `ambiguity_log.md` (advisory)

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
| target_architecture.md | designer | created |
| target_domain_model.md | designer | created |
| target_data_model.md | designer | created |
| data_migration_plan.md | designer | created |
| parity_specs.md | inspector | created |
| parity_tests/*.feature | inspector | <N> files |
| ambiguity_log.md | orchestrator | consolidated |

## Blockers before starting implementation
> Items that need human decision before the coding agent starts.

- <AMB-XXX: short description + where to decide>
- <or: no blockers, proceed>

## Next steps for the coding agent

1. **Read and internalize `paradigm_decision.md`**: the target paradigm is <from paradigm_decision>. Every code choice must honor this paradigm.
2. **Set up the new repository** with the stack declared in `migration_brief.md`.
3. **Implement bottom-up** following `target_architecture.md` and `target_domain_model.md`:
   - infrastructure → data → domain → application → edges.
4. **Write tests** from `parity_specs.md` and `parity_tests/*.feature` from the beginning.
5. **For each component**, validate that it respects the chosen paradigm (explicit signals in `target_architecture.md § Honoring the chosen paradigm`).
6. **For data migration**, follow `data_migration_plan.md`.
7. **For cutover**, follow `cutover_plan.md` and the go/no-go criteria.

## Self-decided items (only if executed in --auto)
> List here items whose default was applied without human confirmation. Review is recommended before cutover.

- <or: pipeline executed in interactive mode, no self-decided items>

## Final notes
<Orchestrator observations for the coding agent.>
