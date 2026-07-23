# Reversa 
<small>by sandeco</small>

**Turn legacy systems into executable specifications for AI agents.**

> 📄 **Paper:** [Reversa: A Reverse Documentation Engineering Framework for Converting Legacy Software into Operational Specifications for AI Agents](https://arxiv.org/abs/2605.18684) — Macedo & da Costa, May 2026.

[![Reversa paper](https://raw.githubusercontent.com/sandeco/reversa/main/docs/img/reversa-paper.png)](https://arxiv.org/abs/2605.18684)

[![English Docs](https://img.shields.io/badge/DOCS-English-009c3b?style=for-the-badge&logo=material-for-mkdocs&logoColor=white&labelColor=2d2d2d)](https://sandeco.github.io/reversa/)<br>
[![Português Docs](https://img.shields.io/badge/DOCS-Portugu%C3%AAs-ffcc00?style=for-the-badge&logo=material-for-mkdocs&logoColor=black&labelColor=2d2d2d)](https://sandeco.github.io/reversa/pt/)<br>
[![Español Docs](https://img.shields.io/badge/DOCS-Espa%C3%B1ol-c60b1e?style=for-the-badge&logo=material-for-mkdocs&logoColor=white&labelColor=2d2d2d)](https://sandeco.github.io/reversa/es/)

Reversa is a specification reverse-engineering framework. Install it inside a legacy project and it coordinates a team of specialized AI agents to analyze the existing code and generate complete, traceable specifications ready for use by any coding agent.

---

![Reversa installer](https://raw.githubusercontent.com/sandeco/reversa/main/docs/img/reversa-installer.png)

---

## Why Reversa exists

Most production systems carry years of accumulated knowledge: implicit business rules, undocumented architectural decisions, critical logic buried in code nobody wants to touch. That knowledge exists, but it's trapped.

AI agents are transformative for creating and evolving software, but they depend on specifications to operate safely. For new systems, you write the spec and the agent executes. For legacy systems — or those built with pure vibe coding — there is no spec: the agent has no way of knowing what it cannot break.

**Reversa is the bridge between the legacy system and AI agents.**

It analyzes the existing code, extracts accumulated knowledge (business rules, flows, module contracts, retroactive architectural decisions) and transforms everything into executable, traceable specifications ready for any coding agent.

The result is not documentation for humans to read. These are **operational contracts** that allow an agent to evolve the system with fidelity to what already exists.

---

## Installation

In the root of the legacy project:

```bash
npx reversa install
```

The installer will:
1. Detect the AI engines present in the environment (Claude Code, Codex, Cursor, etc.)
2. Ask which agents to install — all selected by default
3. Collect project name, language, and preferences
4. Copy agents to `.agents/skills/` (and `.claude/skills/` for Claude Code)
5. Create the engine entry file (`CLAUDE.md`, `AGENTS.md`, etc.)
6. Create the `.reversa/` structure with state, configuration, and plan
7. Generate SHA-256 manifest for safe updates

> Reversa **never deletes or modifies** existing files in your project.
> Agents write only to `.reversa/` and the output folder (`_reversa_sdd/` by default).

**Requirements:** Node.js 18+

---

> [!IMPORTANT]
> ### 🔒 Guaranteed immutability of the legacy project
>
> The installer only creates new files (`CLAUDE.md`, `AGENTS.md`, `.agents/skills/`, etc.) and **never modifies or deletes any existing file** in your project. During analysis, agents operate under a strict and inviolable directive: **all writes are restricted to `.reversa/` and `_reversa_sdd/`** — no other file in your project is touched.

> [!CAUTION]
> ### 💾 Back up your project before starting
>
> Although Reversa never modifies your files, AI agents can make mistakes. **We strongly recommend:**
>
> 1. **Version the project in Git** — make sure all files are committed before starting the analysis
> 2. **Have the repository on GitHub** (or GitLab, Bitbucket) — so you have a safe remote copy
> 3. **Make a local copy of the folder** — a simple `cp -r my-project my-project-backup` protects against any unexpected event
>
> If something unexpected happens during analysis, you can restore the original state with `git restore .` or from the backup copy.

> [!WARNING]
> 🔑 **Reversa does not request, store, or transmit API keys from any LLM service.** All intelligence is delegated to the AI agent already present in your environment (Claude Code, Codex, Cursor, etc.) — no external authentication dependencies.

---

## How to use

After installation, open the project in the AI agent and activate Reversa:

```
/reversa
```

For engines without slash command support (like Codex):

```
reversa
```

Reversa will introduce itself, create a personalized exploration plan, and coordinate the entire analysis. Progress is saved in `.reversa/state.json` at each checkpoint — if the session is interrupted, just type `reversa` to resume where you left off.

For other workflows, use the matching entry command:

| Goal | Command |
|------|---------|
| Analyze an existing legacy and produce specs | `/reversa` |
| Run the same analysis end to end, without intermediate stops | `/reversa-autonomous` |
| Start a brand new project from a one-line idea | `/reversa-new` (add `expresso` to go all the way to code) |
| Evolve the system one feature at a time, from spec to code | `/reversa-forward` |
| Converge a delivered feature back into the extraction | `/reversa-sync` |
| Rebuild the legacy on a modern stack | `/reversa-migrate` |
| Render the extracted knowledge as an HTML mini-site | `/reversa-docs` |
| Track and fix defects with causal traceability | `/reversa-debugger`, `/reversa-debugger-fix` |
| Estimate effort and pricing on top of the specs | `/reversa-pricing-profile`, `/reversa-pricing-size`, `/reversa-pricing-estimate` |

Each orchestrator pauses between agents and asks for `CONTINUAR` before advancing, so you stay in control of every step.

### Unattended runs

Two commands concentrate every question in a **single interview at the start** and then run without stopping, for sessions where nobody is watching the terminal (Claude Code YOLO mode or equivalent):

- `/reversa-autonomous` — the full Discovery pipeline, same agents and same checkpoints as `/reversa`.
- `/reversa-new expresso "<your idea>"` — greenfield from the idea all the way to implemented code, chaining into the forward cycle after the specs.

Both keep the non-destructive rule intact: writes stay inside `.reversa/` and the output folders, and no destructive or outward-facing command (delete, `git push`, publish, install) is ever run on its own. Doubts that come up along the way are recorded with the 🟡 seal instead of interrupting the flow.

---

## How it works

The Discovery pipeline (`/reversa`) is the heart of the framework: a 5-phase sequence orchestrated by the **Reversa** agent.

```
Reconnaissance  Excavation  Interpretation  Generation  Review
    Scout       Archaeologist  Detective      Writer    Reviewer
                                Architect
```

Independent agents (run at any phase): **Visor**, **Data Master**, **Design System**, **Soul Extractor**, **Reconstructor**.

Once the specs exist, you can move forward in three directions, depending on the goal:

```
Discovery (/reversa)
        │
        ├── /reversa-forward    Evolve the system from specs to code
        ├── /reversa-migrate    Rebuild the legacy on a modern stack
        └── /reversa-docs       Render specs as an HTML mini-site
```

For a **greenfield** project (no legacy to extract), start with `/reversa-new` instead. It walks from a one-line idea to SDD specs and then hands off to `/reversa-forward`.

---

## Agents

Reversa organizes its agents in **nine specialized Teams**. The Discovery Team (Reversa Agents Core) and the Bug Agents are always installed; six Teams are pre-checked in the installer and Translators are opt-in.

| Team | Purpose | Entry command |
|------|---------|---------------|
| **Reversa Agents Core** (Discovery) | Analyze the existing legacy and produce specs | `/reversa` |
| **Code New Project Agents** | Start a new project (greenfield) from a one-line idea and produce specs | `/reversa-new` |
| **Code Forward Agents** | Evolve the system from specs to running code, one feature at a time | `/reversa-forward` |
| **Migration Agents** | Turn legacy specs into a rebuild plan for a modern stack | `/reversa-migrate` |
| **Pricing and Size Agents** | Estimate effort, size and pricing on top of the specs | `/reversa-pricing-*` |
| **Documentation Team** | Render the extracted knowledge as a self-contained HTML mini-site | `/reversa-docs` |
| **Bug Agents** | Track, debate and fix defects with causal traceability to the specs | `/reversa-debugger` |
| **Code Quality Agents** | Improve existing code without changing behavior: refactor, optimize, standardize, prune dead code | `/reversa-refactor` |

### Discovery Team, required

These run the main `/reversa` pipeline.

| Agent | Role |
|-------|------|
| **Reversa** | Central orchestrator. Coordinates all agents, saves checkpoints, guides the user |
| **Scout** | Maps the surface: folder structure, languages, frameworks, dependencies, entry points |
| **Archaeologist** | Deep module-by-module analysis: algorithms, control flows, data structures |
| **Detective** | Extracts implicit business knowledge: rules, retroactive ADRs, state machines, permissions |
| **Architect** | Synthesizes everything into C4 diagrams, full ERD, integration map, and technical debt |
| **Writer** | Generates specifications as operational contracts with code traceability |

### Discovery Team, optional (installed by default)

| Agent | Role |
|-------|------|
| **Reviewer** | Reviews specs, finds inconsistencies, and validates gaps with the user |
| **Visor** | Documents the interface from screenshots, without needing the system to be running |
| **Data Master** | Complete database analysis: DDL, migrations, ORM, ERD, triggers, procedures |
| **Design System** | Extracts design tokens: colors, typography, spacing, themes, and components |
| **Soul Extractor** | Produces a single executive Spec (`soul.md`) with purpose, core entities and founding decisions, useful right after Scout |
| **Agents Help** | Explains every Reversa agent with analogies, useful for newcomers |
| **Reconstructor** | Generates a bottom-up reconstruction plan from the specs and implements one task at a time, preserving tokens. Activation: `/reversa-reconstructor` |
| **Autonomous** | Runs the same sequence as `/reversa` end to end, with a single interview at the start and no intermediate stops. Activation: `/reversa-autonomous` |

### Code New Project Agents (greenfield)

For projects that do not exist yet. Activate with `/reversa-new` and the orchestrator drives the pipeline `Ideator → Researcher → Drafter → Spec SDD`, with a `CONTINUAR` checkpoint between agents. Final handoff suggests `/reversa-forward` to take the specs to code.

The orchestrator has **two modes**. In *guided* mode (default) it stops at every agent and ends at the specs. In *express* mode (`/reversa-new expresso "<your idea>"`) every question is concentrated in one interview at the start and, after `INICIAR`, the pipeline runs straight through the specs and into the forward cycle (`requirements → plan → to-do → coding`) until the code is on disk.

| Agent | Role |
|-------|------|
| **Reversa New** | Orchestrator. Reads the initial brief, walks the pipeline, saves `newproject_progress` in `state.json` |
| **Ideator** | Structured brainstorm with 6 divergent questions (root problem, value, alternatives, audience, success metrics, dangerous assumptions). Produces `_reversa_sdd/ideation.md` |
| **Researcher** | Turns the raw audience into 1 to 3 structured personas with journeys. Produces `_reversa_sdd/personas.md` |
| **Drafter** | Synthesizes ideation and personas into a complete PRD (problem, metrics, scope, non-goals, constraints, risks). Produces `_reversa_sdd/prd.md` |
| **Spec SDD** | Decomposes the PRD into logical components and writes one SDD spec per component, with an automatic quality score. Vendored from the global `sdd-spec` skill. Produces `_reversa_sdd/sdd/*.md` |

### Code Forward Agents (evolution)

The bridge from specs to running code. Pipeline: `requirements → clarify → quality → plan → to-do → audit → coding → sync`. Use `/reversa-forward` as the entry point: it detects the **physical stage** of the active feature (by inspecting the artifacts on disk, not metadata) and suggests the next agent.

| Agent | Role |
|-------|------|
| **Reversa Forward** | Orchestrator. Detects the physical stage and suggests the next skill. Never executes code itself |
| **Requirements** | Turns a free-form idea into `requirements.md` anchored to the legacy, with `[DOUBT]` markers, gaps and glossary |
| **Clarify** | Up to 5 targeted questions to resolve `[DOUBT]` markers in place |
| **Quality** | Read-only auditor of writing clarity. Produces `requirements-audit.md` |
| **Plan** | Translates requirements into a technical proposal expressed as a **delta over the legacy**. Produces `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md`, `interfaces/` |
| **To-Do** | Decomposes the roadmap into atomic actions across five phases with stable IDs, dependencies and parallelism markers. Produces `actions.md` |
| **Audit** | Read-only cross-check between requirements, roadmap and actions. Produces `audit/cross-check.md` |
| **Coding** | Executes `actions.md`, flips checkboxes, writes `progress.jsonl`, `legacy-impact.md` and `regression-watch.md` |
| **Sync** | Optional convergence step after coding. Distills the delivered feature into an addendum in `_reversa_sdd/addenda/`, so the extraction keeps describing the system as it is today until the next full re-extraction. Never edits the original artifacts. Activation: `/reversa-sync` |
| **Principles** | Manages durable project rules (`principles.md`) and emits impact reports when they change |
| **Resume** | Swaps the active feature with one from the `paused-features` queue |

### Migration Team

Use after `/reversa` when the goal is to rebuild the legacy on a modern stack. Activate with `/reversa-migrate`. Pipeline: `Paradigm Advisor → Curator → Strategist → Designer → Screen Translator → Inspector`, with a human review pause between agents. Every artifact lands in `_reversa_sdd/migration/`.

| Agent | Role |
|-------|------|
| **Paradigm Advisor** | Detects the legacy paradigm, infers the target paradigm, forces a conscious user decision |
| **Curator** | Decides rule by rule: MIGRATE, DISCARD or HUMAN DECISION |
| **Strategist** | Evaluates Strangler Fig, Big Bang, Parallel Run, Branch by Abstraction and recommends one |
| **Designer** | Drafts target architecture, domain model, data model and data migration plan |
| **Screen Translator** | Translates legacy screens into executable specs in 2 phases (mode decision + spec generation), emitting golden files for the Inspector when an oracle is available |
| **Inspector** | Defines how to prove the new system is behaviorally equivalent to the legacy, with Gherkin parity specs |

### Pricing and Size Team

Three agents on top of the specs to estimate effort, size and price. Activate with `/reversa-pricing-profile`, `/reversa-pricing-size` and `/reversa-pricing-estimate`.

### Translators (input adapters)

Use when the legacy "code" is not source code but a structured artifact like a visual workflow. Generates the SDD spec and prepares the state for the main pipeline to take over.

| Agent | Role |
|-------|------|
| **N8N Translator** | Reads N8N workflows exported as JSON and produces SDD specs ready for Python reimplementation. Activated via `/reversa-n8n` |

### Documentation Team (HTML mini-site)

After discovery completes, this team turns the extracted knowledge into a self-contained HTML mini-site under `_reversa_docs/`. Run `/reversa-docs` to orchestrate the full team, or activate any agent in isolation to regenerate only its pages.

| Agent | Role |
|-------|------|
| **Reversa Docs** | Orchestrates the team, runs the 3-question interview, computes deterministic seed. Activated via `/reversa-docs` |
| **Mapper** | Spatial structure: `arquitetura.html` (Code City 3D, Three.js), `modulos.html` (force-directed D3), `topologia.html` (legacy vs modern side-by-side) |
| **Analyst** | Quantitative data: `metricas.html` (Highcharts treemap, sankey, histogram, columns), `timeline.html` (events from `.reversa/chronicle.md`) |
| **Storyteller** | Narrative: `glossario.html` (client-side search), `deck.html` (6 to 10 navigable slides), `features/<spec>.html` (one per SDD spec) |
| **Publisher** | Final integration: `index.html` with hero + unique generative seal, auto-discovery of auxiliary HTMLs from other agents, link validation, local telemetry |

The team brings 5 shared skills (`reversa-arquitetura-3d`, `reversa-selo-generativo`, `reversa-highcharts-visualizer`, `reversa-especialista-d3`, `reversa-image-prompt-json`) which are installed automatically alongside the team. The output is a static mini-site that opens via `file://` with no server required.

### Bug Agents

A repository-native causal defect memory, organized by **context** (the feature/module/use case the user is talking about): each context folder under `_reversa_bugs/<context>/` aggregates everything of that area (annotated reports in `intake/`, self-contained bug folders, inspections and generated views incl. a clickable `graph.html`). Every bug carries a YAML front matter record traceable to the specs (`SPEC ↔ CODE ↔ TEST ↔ BUG`), a visual fix plan approved before any change, and a `DONE.md` lock once closed. Registering and fixing are strictly separate acts.

| Agent | Role |
|-------|------|
| **Bug** | Intake, triage, dedupe, classification and initial traceability. Never fixes. Activated via `/reversa-debugger` |
| **Bug Fix** | Lifecycle orchestrator: mitigation, reproduction capsule, evidence-based root cause, two approval gates (failing tests, then the change set), spec verdict with versioned addenda, closure policy. Activated via `/reversa-debugger-fix` |
| **Bug Debate** | Fixed-epoch multi-agent debate with an isolated judge, in three modes (`diagnosis`, `repair`, `spec`). Always opt-in, with cost shown upfront; external harnesses (Codex, Gemini CLI, ...) may join only with explicit consent. Activated via `/reversa-debugger-debate` |
| **Depth Inspection** | Deep sweep of a problematic feature through specialized lenses (spec conformance, data flow, contracts, error states, test coverage, concurrency). Diagnosis only; confirmed findings become registered bugs. Activated via `/reversa-depth-inspection` |
| **Bug Graph** | Regenerates the derived views: index, compact catalog, sparse relation matrix, mermaid graph with clusters and impact score, and the BUG ↔ SPEC traceability matrix on both ends (`_reversa_bugs/generated/` and `_reversa_sdd/traceability/bugs.md`). Activated via `/reversa-debugger-graph` |

### Code Quality Agents

Perfective and preventive maintenance on code that already works: improve the internal structure **without changing observable behavior**, and prove that preservation before touching the code. Organized by **context** under `_reversa_refactor/<context>/`, with each transformation anchored to the soul (`soul.md`) and confirmed specs. The founding rule: proposing a transformation and applying it are separate acts, and nothing touches the legacy without proof of behavior preservation (a **safety net** of characterization tests, plus soul and regression checks). Project code changes only through an approved, reversible diff gate.

| Agent | Role |
|-------|------|
| **Refactor** | Orchestrator: inventories improvement opportunities, prioritizes by real ROI (hotpath, not aesthetics), routes to the right specialist and runs the gates. Never applies a transformation. Activated via `/reversa-refactor` |
| **Restructure** | Internal structure at method/class level via the Fowler catalog, in small reversible steps. Activated via `/reversa-restructure` |
| **Modularize** | Splits a large piece into cohesive modules with well-defined responsibility, respecting the soul's boundaries. Activated via `/reversa-modularize` |
| **Decouple** | Reduces direct dependencies (dependency inversion, Feathers seams, cycle breaking), coupling measured before and after. Activated via `/reversa-decouple` |
| **Optimize** | Reduces time, memory and resource use, with a before/after measurement and preserved output. Activated via `/reversa-optimize` |
| **Simplify** | Replaces complex logic with a simpler one, with a proof of output equivalence. Activated via `/reversa-simplify` |
| **Standardize** | Applies naming, formatting and organization conventions from the project's dominant pattern, never changing semantics. Activated via `/reversa-standardize` |
| **Prune** | Removes dead code, and only what it can prove is dead, telling dead code from a suspected orphan. Activated via `/reversa-prune` |

---

## What is generated

```
_reversa_sdd/
├── inventory.md              # Project inventory
├── dependencies.md           # Dependencies with versions
├── code-analysis.md          # Technical analysis per module
├── data-dictionary.md        # Data dictionary
├── domain.md                 # Glossary and business rules
├── state-machines.md         # State machines in Mermaid
├── permissions.md            # Permission matrix
├── architecture.md           # Architectural overview
├── c4-context.md             # C4 Diagram: Context
├── c4-containers.md          # C4 Diagram: Containers
├── c4-components.md          # C4 Diagram: Components
├── erd-complete.md           # Full ERD in Mermaid
├── confidence-report.md      # Confidence report 🟢🟡🔴
├── gaps.md                   # Identified gaps
├── questions.md              # Questions for human validation
├── sdd/                      # Specs per component
│   └── [component].md
├── openapi/                  # API specs (if applicable)
├── user-stories/             # User stories (if applicable)
├── adrs/                     # Retroactive architectural decisions
├── flowcharts/               # Flowcharts in Mermaid
├── sequences/                # Sequence diagrams
├── ui/                       # Interface specs (Visor)
├── database/                 # Database specs (Data Master)
├── design-system/            # Design tokens (Design System)
├── addenda/                  # Post-delivery addenda, one per feature (Sync)
└── traceability/
    ├── spec-impact-matrix.md # Which spec impacts which
    └── code-spec-matrix.md   # Code file to corresponding spec
```

In a greenfield run, `/reversa-new` adds the following on top of `_reversa_sdd/`:

```
_reversa_sdd/
├── newproject-brief.md      # Initial brief (Reversa New)
├── ideation.md              # Structured brainstorm (Ideator)
├── personas.md              # Personas with journeys (Researcher)
├── prd.md                   # Product Requirements Document (Drafter)
└── sdd/
    └── [component].md       # SDD specs with quality score (Spec SDD)
```

Forward features land in a separate folder, `_reversa_forward/` by default:

```
_reversa_forward/
└── <NNN>-<short-name>/      # One folder per feature
    ├── requirements.md
    ├── roadmap.md
    ├── investigation.md
    ├── data-delta.md
    ├── onboarding.md
    ├── interfaces/
    ├── actions.md
    ├── progress.jsonl
    ├── legacy-impact.md
    ├── regression-watch.md
    └── audit/
        ├── requirements-audit.md
        └── cross-check.md
```

After `/reversa-coding`, the optional `/reversa-sync` distills the delivered feature into `_reversa_sdd/addenda/<feature-id>-<short-name>.md`. The addendum is a bridge: it keeps the extraction representative of the system as it is today, points at the sections of `architecture.md` and `domain.md` that drifted, and is marked as superseded by the next full re-extraction. Original extraction artifacts are never edited.

The Documentation Team writes only inside `_reversa_docs/` (HTML mini-site, fully offline).

Bug Agents write only inside `_reversa_bugs/` (one folder per bug, plus generated views), spec addenda in `_reversa_sdd/addenda/` and the generated mirror `_reversa_sdd/traceability/bugs.md`. Original specs are never edited; project code changes only through approval gates with explicit diffs.

Code Quality Agents write only inside `_reversa_refactor/` (opportunities, plans and transformation records per context). Project code changes exclusively through an approved, reversible diff gate, and only after the safety net proves behavior is preserved.

### Confidence scale

Every statement in the specs is marked with:

| Mark | Meaning |
|------|---------|
| 🟢 CONFIRMED | Extracted directly from code — can be cited with file and line |
| 🟡 INFERRED | Deduced from patterns — may be wrong |
| 🔴 GAP | Not determinable from code — requires human validation |

---

## Supported engines

| Engine | File created | Skills path | Activation |
|--------|-------------|-------------|------------|
| Claude Code ⭐ | `CLAUDE.md` | `.claude/skills/reversa-*/` and `.agents/skills/reversa-*/` | `/reversa` |
| Codex ⭐ | `AGENTS.md` | `.agents/skills/reversa-*/` | `reversa` |
| Cursor ⭐ | `.cursorrules` | `.agents/skills/reversa-*/` | `/reversa` |
| Gemini CLI | `GEMINI.md` | `.agents/skills/reversa-*/` | `/reversa` |
| Windsurf | `.windsurfrules` | `.agents/skills/reversa-*/` | `/reversa` |
| Antigravity | `AGENTS.md` | `.agents/skills/reversa-*/` | `/reversa` |
| Kiro | (none) | `.kiro/skills/reversa-*/` and `.agents/skills/reversa-*/` | `/reversa` |
| Opencode | `AGENTS.md` | `.agents/skills/reversa-*/` | `reversa` |
| Cline | `.clinerules` | `.agents/skills/reversa-*/` | `/reversa` |
| Roo Code | `.roorules` | `.agents/skills/reversa-*/` | `/reversa` |
| GitHub Copilot | `.github/copilot-instructions.md` | `.agents/skills/reversa-*/` | `/reversa` |
| Aider | `CONVENTIONS.md` | `.agents/skills/reversa-*/` | `reversa` |
| Amazon Q Developer | `.amazonq/rules/reversa.md` | `.agents/skills/reversa-*/` | `/reversa` |

---

## CLI commands

```bash
npx reversa install      # Install Reversa in the project
npx reversa status       # Show current analysis state
npx reversa update       # Update agents to the latest version
npx reversa add-agent    # Add an agent to the project
npx reversa add-engine   # Add support for a new engine
npx reversa uninstall    # Remove Reversa from the project
```

The `update` command detects files you modified via SHA-256 and never overwrites customizations.
The `uninstall` command removes only files created by Reversa — nothing from the legacy project is touched.

---

## Internal structure

```
.reversa/
├── state.json          # Analysis state between sessions
├── config.toml         # Project configuration
├── config.user.toml    # Personal preferences (don't commit)
├── plan.md             # Exploration plan (user-editable)
├── version             # Installed version
├── context/
│   ├── surface.json    # Generated by Scout
│   └── modules.json    # Generated by Archaeologist
└── _config/
    ├── manifest.yaml       # Installation metadata
    └── files-manifest.json # SHA-256 hashes for safe updates

.agents/skills/         # Universal skills (all compatible agents)
.claude/skills/         # Mirror for Claude Code
```

---

## Contributing

Contributions are welcome. Open an issue to discuss before submitting a PR.

```bash
git clone https://github.com/sandeco/reversa.git
cd reversa
npm install
```

---

## License

MIT — see [LICENSE](LICENSE) for details.
