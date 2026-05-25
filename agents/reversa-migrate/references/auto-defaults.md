# Defaults for `--auto`

When the user invokes `/reversa-migrate --auto`, the orchestrator skips human pauses and applies these defaults. Before starting, the user warning lists each one. Each auto-applied item is logged in `ambiguity_log.md` with the tag `auto-decided` for later review.

## Paradigm Advisor
- Choose **option 1: adopt the natural paradigm of the target stack**.
- `derived_appetite` = `transformational`.

## Curator
- HUMAN DECISION items are marked as pending in `ambiguity_log.md` and do not block the pipeline.
- 🟡 INFERRED items → MIGRATE (with note "validate in coding agent").
- 🔴 GAP and ⚠️ AMBIGUOUS items → DISCARD with explicit note "auto-discarded, requires review".

## Strategist
- Adopt the strategy marked as **recommended**.
- `critical` risks that would require a human owner are set to `owner = "to be defined"` in `risk_register.md`.

## Designer
- **Topology (Phase 1)**: accept the proposed modern topology (option 2). The justification recorded in `topology_decision.md` is the Designer's own; in `ambiguity_log.md` the tag `auto-decided` is placed for later review. Rationale: `--auto` is for users who want the recommended path; refusing-to-decide would stall the pipeline and violate the `--auto` contract.
- **Architecture (Phase 2)**: approve the first proposal without iteration.
- Bounded contexts, events, and ADRs are accepted as proposed.

## Screen Translator
- **Mode (Phase 1)**: adopt the mode recommended by the agent for the detected source→target pair (literal for textual pairs; modernized for platform changes; hybrid only with an explicit list, therefore never in `--auto`).
- **Generation (Phase 2)**: accept the generated `target_screens.md` and propagate deviations as `pending`. `--auto` does not approve deviations on its own; they remain in `ambiguity_log.md` as `auto-decided` for later review, without blocking the handoff (exception to `--auto`: if a deviation is `tipo=correcao` in literal mode, the agent refuses and requests human approval even in `--auto`, because changing text without approval breaks expectations).
- **Golden file capture**: does not automate in `--auto` (oracle driver is OQ-02). Only emits `manifest.yaml` with suggested commands.
- **Legacy without UI**: automatically marks status as `skipped`, without asking.
- **Missing prerequisites Discovery** (`_reversa_sdd/design-system/` or `_reversa_sdd/ui/inventory.md`): creates a minimal `tokens-derived.md` and builds the inventory solely from the source code; alerts in `ambiguity_log.md`.

## Inspector
- Uses parity criteria derived directly from the chosen paradigm (see `parity-coverage-matrix.md` in the agent).
- Does not negotiate the "parity accepted" criterion with the user.

## Detected manual modifications
- Adopt **option (a)**: preserve the manually modified version and abort regeneration of that artifact. Never destroys human work.

## Mandatory warning

Always before starting `--auto`, present:

> "⚠️ `--auto` mode activated. The following defaults will be applied without pausing for confirmation:
> - Paradigm Advisor: adopt the natural stack paradigm (transformational).
> - Curator: ⚠️/🔴 items will be DISCARDED with notes; 🟡 items will be MIGRATED with notes.
> - Strategist: recommended strategy will be adopted.
> - Designer (topology): proposed modern topology will be adopted (option 2).
> - Designer (architecture): first architecture proposal will be accepted.
> - Screen Translator (mode): adopt the recommended mode for the source→target pair. Hybrid mode never in `--auto`. For legacy without UI, status `skipped`.
> - Screen Translator (generation): deviations remain pending in `ambiguity_log.md` (not approved). Golden file capture not automated (manifest only).
> - Inspector: parity criteria derived from paradigm without interactive adjustment.
>
> The final `handoff.md` will highlight all auto-decided items for later review.
> Confirm? (y/N)"
