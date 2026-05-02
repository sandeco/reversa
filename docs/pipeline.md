# Analysis pipeline

Reversa transforms a legacy system into executable specifications in 5 phases. Each phase has specific agents, and the central orchestrator coordinates everything to happen in the right order.

For quick queries during development, Reversa also exposes an MCP server (`npx reversa mcp`) that lets agents check analysis status and read reports without leaving the coding session. The 5-phase pipeline and MCP server are complementary: MCP reads results, the pipeline creates them.

---

## Overview

```
Phase 1         Phase 2       Phase 3              Phase 4       Phase 5
Reconnaissance  Excavation    Interpretation       Generation    Review
   Scout        Archaeologist  Detective            Writer        Reviewer
                               Architect
```

**Independent agents** that run in any phase: **Visor**, **Data Master**, **Design System**

---

## Phase 1: Reconnaissance

**Agent:** Scout

The Scout does the first tour of the project. Like a real estate agent visiting a property for the first time: doesn't open drawers, doesn't read all the documents, just maps the territory.

What it produces:

- Complete project inventory (`inventory.md`)
- Dependency list with versions (`dependencies.md`)
- Structured JSON data for the next agents (`.reversa/context/surface.json`)

After the Scout finishes, Reversa uses the `surface.json` to personalize Phase 2: instead of a generic "analyze the code" task, the plan becomes one task per identified module.

This is also when Reversa presents the Scout summary and asks for the **documentation level** (`doc_level`): essential, complete, or detailed. The choice defines which artifacts each agent will generate in the following phases — see [How to use](uso.md#documentation-level) for the full table.

---

## Phase 2: Excavation

**Agent:** Archaeologist

The Archaeologist digs through the code module by module. With patience and precision, it catalogs every artifact: functions, algorithms, data structures, control flows. No interpretation or judgment. Just a precise description of what's there.

**Important:** the Archaeologist runs one module per session, intentionally. Large projects have many modules, and trying to analyze everything at once burns context and reduces analysis quality.

What it produces:

- Consolidated technical analysis (`code-analysis.md`)
- Data dictionary (`data-dictionary.md`)
- Mermaid flowcharts per module (`flowcharts/[module].md`)
- Structured data per module (`.reversa/context/modules.json`)

---

## Phase 3: Interpretation

**Agents:** Detective + Architect

Here the analysis stops being descriptive and becomes interpretive. Two agents work in this phase.

**The Detective** is the team's Sherlock Holmes. Looks at what the Archaeologist cataloged and asks: *"But why is this here? Who made this decision? What does the git history reveal?"* Extracts implicit business rules, retroactive ADRs, state machines, and permission matrices.

**The Architect** is the cartographer. Synthesizes everything into formal architectural documentation: C4 diagrams at all three levels (Context, Containers, Components), full ERD, integration map, and technical debt.

What they produce:

- Domain and business rules (`domain.md`)
- State machines in Mermaid (`state-machines.md`)
- Permission matrix (`permissions.md`)
- Retroactive ADRs (`adrs/`)
- C4 diagrams (`c4-context.md`, `c4-containers.md`, `c4-components.md`)
- Full ERD (`erd-complete.md`)
- Architectural overview (`architecture.md`)

---

## Phase 4: Generation

**Agent:** Writer

The Writer is the team's notary. Transforms everything discovered in the previous phases into formal contracts: SDD specs per component, OpenAPI specs for APIs, user stories for user flows.

Every statement in the specs is marked with the [confidence scale](escala-confianca.md): 🟢 CONFIRMED, 🟡 INFERRED, or 🔴 GAP.

The Writer doesn't generate everything at once. It builds a plan, presents it for your approval, then generates one file at a time, waiting for confirmation before continuing. This allows incremental review and prevents context waste.

What it produces:

- Specs per component (`sdd/[component].md`)
- API specs (`openapi/[api].yaml`)
- User stories (`user-stories/[flow].md`)
- Code-to-spec traceability matrix (`traceability/code-spec-matrix.md`)

---

## Phase 5: Review

**Agent:** Reviewer

The Reviewer tries to break the specs. Finds internal contradictions, conflicts between different specs, statements marked as 🟢 that are actually inferences, obvious behaviors left unspecified.

It also collects the 🔴 gaps that only you can resolve and presents them as validation questions. After you answer, it updates the specs and generates the final confidence report.

Bonus: if the Codex plugin is active in the session, the Reviewer can request an independent cross-review before doing its own analysis.

What it produces:

- Validation questions (`questions.md`)
- Final confidence report (`confidence-report.md`)
- Unresolved gaps (`gaps.md`)
- Specs updated in-place with reclassifications

---

## Independent agents

These agents don't belong to a specific phase and can be triggered at any time:

| Agent | When to use |
|-------|-------------|
| **Visor** | When you have screenshots of the system available |
| **Data Master** | When DDL, migrations, or ORM models are available |
| **Design System** | When CSS files, themes, or interface screenshots are available |
