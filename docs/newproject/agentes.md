# The greenfield agents

Five agents make up the Code New Project Agents Team. The orchestrator (`/reversa-new`) drives the other four in a fixed sequence. Each agent reads what the previous one produced and adds its own artifact.

---

## Pipeline

```
Reversa New (orchestrator)
        │
        ▼
Ideator → Researcher → Drafter → Spec SDD
```

There is a `CONTINUAR` checkpoint between agents. The orchestrator never advances on its own.

---

## 1. Reversa New (orchestrator)

**Command:** `/reversa-new`

Reads the initial brief (passed inline or asked interactively), saves `_reversa_sdd/newproject-brief.md`, walks the four functional agents in fixed order, and writes a checkpoint in `state.json#newproject_progress` after each stage.

Detects re-execution: if a pipeline is already in progress, asks whether to continue, recreate or re-run from a specific agent.

**Produces:** `_reversa_sdd/newproject-brief.md` and the orchestrator state under `state.json#newproject_progress`.

---

## 2. Ideator

**Command:** `/reversa-ideator`

Structured brainstorm with six divergent questions: root problem, value delivered, alternatives, raw audience, success metrics, dangerous assumptions. Asks one question at a time (when the engine does not support batching), waits for the answer before moving on, and never collapses the questions into a single multi-shot prompt.

**Produces:** `_reversa_sdd/ideation.md`.

---

## 3. Researcher

**Command:** `/reversa-researcher`

Turns the raw audience from `ideation.md` into one to three structured personas with journeys (entry, friction, outcome). The user chooses the number of personas; the agent only suggests based on the breadth of the audience description.

**Produces:** `_reversa_sdd/personas.md`.

---

## 4. Drafter

**Command:** `/reversa-drafter`

Synthesizes ideation and personas into a complete PRD: problem, success metrics, scope, non-goals, constraints, risks, open questions. Works as a synthesizer, not an interviewer: extracts everything it can from the two sources and asks at most two coverage questions to fill the most critical gaps. Anything that remains undefined is marked `🟡 [INDEFINIDO, validar com usuário]`.

**Produces:** `_reversa_sdd/prd.md`.

---

## 5. Spec SDD

**Command:** `/reversa-spec-sdd`

Decomposes the PRD into logical components and writes one SDD spec per component, with an automatic quality score (0 to 100) and gap analysis. The methodology is **Pragmatic RFC plus LLM-First**: structured like an RFC (Problem / Goals / Design / Edge Cases) but optimized to be consumed by humans and AI agents alike.

This agent is a **vendored** version of the global `sdd-spec` skill: it lives natively inside Reversa, reads `prd.md` as the primary source, writes into `_reversa_sdd/sdd/`, marks every spec with the 🟡 (planned) seal, and on completion hands off to `/reversa-forward`.

Can also be used standalone: evaluating an existing spec, or generating a single spec from any input the user provides.

**Produces:** `_reversa_sdd/sdd/<component>.md` (one per component).

---

## Running manually

You rarely need to call an isolated agent. `/reversa-new` orchestrates everything. But if an agent failed or you want to redo a stage:

```
/reversa-new                    # detects in-progress pipeline, offers Continue / Recreate / Re-run from
/reversa-ideator                # standalone, reads newproject-brief.md
/reversa-researcher             # standalone, reads ideation.md
/reversa-drafter                # standalone, reads ideation.md + personas.md
/reversa-spec-sdd               # standalone, reads prd.md or any source the user passes
```

Each standalone agent verifies its own preconditions and aborts with a clear message pointing at the missing artifact.
