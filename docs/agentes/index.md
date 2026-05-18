# Agents

Reversa coordinates **6 specialized Teams** of agents. Each agent does one thing and does it well; each Team groups agents around a phase of the work.

The central orchestrator (Reversa itself) coordinates who enters when, in what order, and at what pace. But you can also trigger any agent directly when you need to.

---

## The 6 Teams

| Team | Role | In the installer |
|------|------|------------------|
| **Reversa Agents Core** | Discovery and orchestration of the legacy: maps, excavates, interprets and documents. Detailed in the tables below. | Always installed |
| **Code New Project Agents** | Greenfield pipeline from a one-line idea to SDD specs. See [Code New Project Agents](../newproject/index.md). | Pre-checked |
| **Code Forward Agents** | Drive forward delivery from the specs: requirements, plan, to-do, audit, quality, coding. See [Code Forward Agents](../forward/index.md). | Pre-checked |
| **Migration Agents** | Turn legacy specs into a rebuild plan for a modern stack. See [Migration](../migracao/index.md). | Pre-checked |
| **Pricing and Size Agents** | Estimate effort, size and pricing on top of the specs. See [Pricing](../pricing/index.md). | Pre-checked |
| **Documentation Team** | Render the extracted knowledge as a self-contained HTML mini-site. See [Documentation Team](../documentation/index.md). | Pre-checked |
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

---

## Translators (input adapters)

Use when the legacy "code" is not source code, but a structured artifact like a visual workflow. Generates an SDD spec and prepares the state for the main pipeline to take over.

| Agent | Analogy | When to use |
|-------|---------|-------------|
| [N8N Translator](n8n.md) | The certified translator | When you have an N8N workflow exported as JSON and want to document it as a spec or port to Python |

---

## Recommended sequence

```
/reversa → orchestrates everything automatically

Or manually, if you prefer to control each step:

Scout → Archaeologist (N sessions) → Detective → Architect → Writer → Reviewer

Optional at any phase:
Visor · Data Master · Design System
```
