---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: paradigm_decision
producedBy: paradigm_advisor
hash: "sha256:<hash of the body below the front matter>"
---

# Paradigm Decision

> Conscious decision about how to treat the change (or absence of change) in paradigm between the legacy system and the target stack.
> This artifact is mandatory first reading for any later agent and for the coding agent.

## Detected legacy paradigm
- **Main paradigm**: <procedural | classic OO | OO with DI | functional | event-driven | actor model | dataflow | hybrid: ...>
- **Confidence**: 🟢 CONFIRMED | 🟡 INFERRED | 🔴 GAP | ⚠️ AMBIGUOUS
- **Evidence**:
  - <evidence 1, with reference to `_reversa_sdd/` artifact>
  - <evidence 2>
- **Observed variations** (if hybrid):
  - <component A: paradigm X, evidence>
  - <component B: paradigm Y, evidence>

## Declared target stack
- Language: <from migration_brief.md>
- Framework: <from migration_brief.md>
- Infra: <from migration_brief.md>

## Inferred natural paradigm
- **Paradigm**: <inferred via paradigm_catalog>
- **Justification**: <why this stack has this natural paradigm>
- **Viable alternatives**: <e.g. OO with DI is also viable in Node, with cost X>

## Identified gap
- **Severity**: high | medium | low | none
- **Concrete implications** (not abstract, use example from the legacy system itself):
  - <implication 1, citing affected legacy rule/flow>
  - <implication 2>
  - <implication 3>
  - <implication 4>

## Options presented to the user
1. **Adopt the natural paradigm of the stack** (transformational)
   - Consequences: <list>
2. **Force a legacy-like paradigm** (conservative)
   - Consequences: <list>
3. **Hybrid** (balanced)
   - Consequences: <list>

## User decision
- **Choice**: <1 | 2 | 3>
- **User justification**: <free text>
- **Decided on**: <ISO-8601>

## Derived appetite
- `derived_appetite`: conservative | balanced | transformational

## Pending implications for next agents
| Agent | Implication | How to honor it |
|---|---|---|
| Curator | <implication> | <expected action> |
| Strategist | <implication> | <expected action> |
| Designer | <implication> | <expected action> |
| Inspector | <implication> | <expected action> |

## Notes
<Any additional point the coding agent needs to know about the target paradigm.>
