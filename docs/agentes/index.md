# Agents

Reversa coordinates a team of specialists. Each agent does one thing and does it well. None of them try to do everything.

The central orchestrator (Reversa itself) coordinates who enters when, in what order, and at what pace. But you can also trigger any agent directly when you need to.

---

## Required agents

These are part of the main pipeline. The orchestrator runs them in the right sequence.

| Agent | Phase | Analogy | Role |
|-------|-------|---------|------|
| [Reversa](reversa.md) | Orchestration | The orchestra conductor | Coordinates all agents, saves checkpoints, guides the user |
| [Scout](scout.md) | Reconnaissance | The real estate agent | Maps the surface: folders, languages, frameworks, dependencies, entry points |
| [Archaeologist](arqueologo.md) | Excavation | The excavator | Deep module-by-module analysis: algorithms, flows, data structures |
| [Detective](detetive.md) | Interpretation | Sherlock Holmes | Extracts implicit business rules, ADRs, state machines, permissions |
| [Architect](arquiteto.md) | Interpretation | The cartographer | Synthesizes everything into C4 diagrams, ERD, and integration map |
| [Writer](redator.md) | Generation | The notary | Generates SDD specs, OpenAPI, and user stories with code traceability |

---

## Optional agents

Installed by default, but can be triggered independently at any time.

| Agent | Analogy | When to use |
|-------|---------|-------------|
| [Reviewer](revisor.md) | The spec reviewer | After the Writer: critically reviews specs and validates gaps |
| [Visor](visor.md) | The forensic illustrator | When screenshots of the system are available |
| [Data Master](data-master.md) | The geologist | When DDL, migrations, or ORM models are available |
| [Design System](design-system.md) | The stylist | When CSS files, themes, or interface screenshots are available |
| [Chronicler](cronista.md) | The notary at your shoulder | After every code change — keeps specs synchronized with the code |

---

## Recommended sequence

```
/reversa → orchestrates everything automatically

Or manually, if you prefer to control each step:

Scout → Archaeologist (N sessions) → Detective → Architect → Writer → Reviewer

Optional at any phase:
Visor · Data Master · Design System
```
