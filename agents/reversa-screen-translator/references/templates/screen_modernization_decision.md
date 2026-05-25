---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: screen_modernization_decision
producedBy: screen-translator
decidedBy: <human-id or null when mode=skipped>
decidedAt: <ISO-8601 or null when mode=skipped>
mode: literal | modernized | hybrid | skipped
sourcePlatform: <slug or null when mode=skipped>
targetPlatform: <slug or null when mode=skipped>
hash: "sha256:<hash of the body below the front matter>"
---

> When `mode: skipped`, this decision **did not go through a human**: it was emitted automatically by Screen Translator because the legacy system has no UI. Only the "Context" and "Decision" sections are filled, with the reason for the omission; the others stay as N/A. Inspector reads `mode: skipped` from the front matter and skips visual parity without asking.

# Screen Modernization Decision

> Conscious decision about how to translate the legacy system screens: observable byte-for-byte parity, idiomatic redesign for the target platform, or a screen-by-screen combination.
> This artifact is mandatory reading for Screen Translator itself (to generate `target_screens.md`), for Inspector (to build parity tests appropriate for the mode), and for the coding agent.

## Context

- **Detected source platform**: <slug> (e.g. `cobol-ansi-tui`, `delphi-vcl`, `asp-classic`, `android-xml`)
- **Confidence**: 🟢 CONFIRMED | 🟡 INFERRED | 🔴 GAP | ⚠️ AMBIGUOUS
- **Target platform**: <slug> (e.g. `go-cli`, `web-spa`, `flutter`, `tauri`)
- **Inventoried screens**: <N>
- **Inventory source**: `_reversa_sdd/screens/inventory.json` + `_reversa_sdd/ui/inventory.md`
- **Applied adapter**: `<adapters/source__target>` (see `references/adapter-pairs.md`)

## Evaluated modes

### Mode: literal
- **Definition**: observable byte-for-byte or pixel-equivalent parity between legacy and new.
- **Trade-offs**:
  - Implementation cost: <high | medium | low>
  - Visual fidelity: <high | medium | low>
  - Feasibility of constructive parity tests: <yes | partial | no>
  - Expected end-user acceptance: <high | medium | low>
  - Future technical debt: <high | medium | low>
- **Recommended**: <yes | no>
- **Rationale**: <short text>

### Mode: modernized
- **Definition**: idiomatic redesign for the target platform, preserving information and flow while re-expressing hierarchy and interaction.
- **Trade-offs**:
  - Implementation cost: <high | medium | low>
  - Visual fidelity: <high | medium | low>
  - Feasibility of constructive parity tests: <yes | partial | no>
  - Expected end-user acceptance: <high | medium | low>
  - Future technical debt: <high | medium | low>
- **Recommended**: <yes | no>
- **Rationale**: <short text>

### Mode: hybrid
- **Definition**: some screens in literal mode, some modernized, with explicit lists.
- **Trade-offs**:
  - Implementation cost: <high | medium | low>
  - Mixed visual fidelity: <description>
  - Feasibility of parity tests: <description by subset>
  - Cost of maintaining the split: <high | medium | low>
- **Recommended**: <yes | no>
- **Rationale**: <short text>

## Decision

- **Chosen mode**: <literal | modernized | hybrid>
- **Human rationale**: <text>
- **Discarded alternatives**: <short list with reason>
- **Decided on**: <ISO-8601>
- **Decided by**: <name or identifier>

### In hybrid mode, explicit lists (mandatory)

**Screens in literal mode**:
- <screen 1>
- <screen 2>

**Screens in modernized mode**:
- <screen 3>
- <screen 4>

> Empty lists block Phase 2. The agent refuses to proceed.

## Pending implications for Phase 2

| Step | Implication | How to honor it |
|---|---|---|
| Generation of `target_screens.md` | <implication> | <expected action> |
| Capture of golden files | <implication> | <expected action> |
| Design-system tokens | <implication> | <expected action> |
| Textual content | Preserve it literally unless there is explicit approval for linguistic review | <expected action> |

## Implications for Inspector

- **Parity strategy**:
  - Literal mode → observable byte-for-byte / pixel-equivalent parity, validated by golden files when the oracle runs.
  - Modernized mode → semantic contract (events, transitions, textual content, states), without visual byte-for-byte comparison.
  - Hybrid mode → mixed strategy, declared per screen in `parity_specs.md`.
- **Known deviations to propagate**: see `screen_deviation_log.md`.

## Notes

<Additional points the coder, Inspector, and the agent need to know to honor the decision. This includes, for example, explicit approval for linguistic review, tolerance for approximate rendering, or marking screens that cannot be modernized because of regulatory requirements.>
