# Agents

Reversa coordinates **8 specialized Teams** of agents. Each agent does one thing and does it well; each Team groups agents around a phase of the work.

The central orchestrator (Reversa itself) coordinates who enters when, in what order, and at what pace. But you can also trigger any agent directly when you need to.

---

## The 8 Teams

| Team | Role | In the installer |
|------|------|------------------|
| **Reversa Agents Core** | Discovery and orchestration of the legacy: maps, excavates, interprets and documents. Detailed in the tables below. | Always installed |
| **Code New Project Agents** | Greenfield pipeline from a one-line idea to SDD specs. See [Code New Project Agents](../newproject/index.md). | Pre-checked |
| **Code Forward Agents** | Drive forward delivery from the specs: requirements, plan, to-do, audit, quality, coding. See [Code Forward Agents](../forward/index.md). | Pre-checked |
| **Migration Agents** | Turn legacy specs into a rebuild plan for a modern stack. See [Migration](../migracao/index.md). | Pre-checked |
| **Pricing and Size Agents** | Estimate effort, size and pricing on top of the specs. See [Pricing](../pricing/index.md). | Pre-checked |
| **Documentation Team** | Render the extracted knowledge as a self-contained HTML mini-site. See [Documentation Team](../documentation/index.md). | Pre-checked |
| **Bug Agents** | Track, debate and fix defects with causal traceability to the specs. See [Bug Agents](../bugs/index.md). | Always installed |
| **Translators N8N->Specs->Python** | Adapters that turn structured artifacts (e.g. an N8N workflow) into specs. See [N8N Translator](n8n.md). | Unchecked |

The tables below detail the agents that make up the **Reversa Agents Core** Team.

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
| [Soul Extractor](extract-soul.md) | The essayist | Right after the Scout, for one executive Spec (`soul.md`) with purpose, core entities and founding decisions |
| [Agents Help](agents-help.md) | The tour guide | When you want every Reversa agent explained with analogies |
| [Reconstructor](reconstructor.md) | The bricklayer | When you want to rebuild the software bottom-up from the generated specs, one task at a time |
| **Autonomous** | The night shift | When nobody will be watching: runs the whole `/reversa` sequence end to end, with a single interview at the start |

---

## Autonomous mode

`/reversa-autonomous` inherits the `reversa` orchestrator: same plan, same agent sequence, same checkpoints and the same confidence scale. The one difference is *when* it asks. Every decision the normal flow spreads along the way (installation data, documentation level, spec organization) is concentrated in a **single interview at the start**; questions already answered in `state.json` or `config.toml` are never asked again.

It was designed for sessions with automatic tool approval (Claude Code YOLO mode or equivalent). Because there is no human approving each action, the guardrails are stricter: writes stay inside `.reversa/` and the output folder, no destructive or outward-facing command (delete, `git push`, publish, install) is ever run on its own, and anything ambiguous outside the Reversa folders is left untouched and reported at the end.

After the interview it only stops for a **legitimate stop**: a closed list of situations that genuinely require a human. Everything else runs to the end.

---

## Translators (input adapters)

Use when the legacy "code" is not source code, but a structured artifact like a visual workflow. Generates an SDD spec and prepares the state for the main pipeline to take over.

| Agent | Analogy | When to use |
|-------|---------|-------------|
| [N8N Translator](n8n.md) | The certified translator | When you have an N8N workflow exported as JSON and want to document it as a spec or port to Python |

---

## Recommended sequence

```
/reversa             → orchestrates everything automatically, pausing between agents
/reversa-autonomous  → same sequence, one interview at the start, no intermediate stops

Or manually, if you prefer to control each step:

Scout → Archaeologist (N sessions) → Detective → Architect → Writer → Reviewer

Optional at any phase:
Visor · Data Master · Design System
```
