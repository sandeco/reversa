# Code New Project Agents

The Code New Project Agents Team is the greenfield counterpart of the Discovery Team. Where Discovery answers *what does the existing legacy do?*, the New Project Team answers *what should we build from scratch, and what specs prove it?*.

The pipeline walks from a one-line idea to a full set of SDD specs, ready to enter the Code Forward Agents cycle.

Pre-checked in the installer.

---

## When to use

You have an idea but no code yet. Could be a sentence ("I want users to export their invoices as PDF"), could be a paragraph. You want to think the product through before opening an IDE: validate the problem, draw the personas, write a PRD, then break the PRD into SDD specs that an AI agent can implement.

Activate with:

```
/reversa-new
```

The orchestrator collects the brief, walks the four functional agents in fixed order, saves a checkpoint between each one, and asks for `CONTINUAR` before advancing. If the session is interrupted, just type `/reversa-new` again: it reads `state.json#newproject_progress` and resumes exactly where it stopped.

---

## Pipeline

```
/reversa-new              (orchestrator)
       │
       ▼
/reversa-ideator          → _reversa_sdd/ideation.md
       │
       ▼ CONTINUAR
/reversa-researcher       → _reversa_sdd/personas.md
       │
       ▼ CONTINUAR
/reversa-drafter          → _reversa_sdd/prd.md
       │
       ▼ CONTINUAR
/reversa-spec-sdd         → _reversa_sdd/sdd/<component>.md
       │
       ▼
handoff: suggests /reversa-forward
```

The Spec SDD agent is a **vendored** version of the global `sdd-spec` skill, adapted to live inside Reversa: it reads `prd.md`, writes inside `_reversa_sdd/sdd/`, marks every artifact with the 🟡 (planned) seal, and hands off to the Forward pipeline at the end.

---

## Where artifacts land

The Team writes only inside `_reversa_sdd/` (same folder used by Discovery). Greenfield specs live next to legacy specs without conflict, because the file names are distinct.

```
<your-project>/
└── _reversa_sdd/
    ├── newproject-brief.md      (orchestrator)
    ├── ideation.md              (Ideator)
    ├── personas.md              (Researcher)
    ├── prd.md                   (Drafter)
    └── sdd/
        └── <component>.md       (Spec SDD)
```

The orchestrator state lives in `.reversa/state.json` under the `newproject_progress` key, with `stage`, `started_at`, `last_checkpoint_at`, `completed_stages` and the truncated `brief`.

---

## Re-execution

When the pipeline is already in progress and you type `/reversa-new` again, the orchestrator detects the saved `stage` and offers four options:

1. **Continue from where you stopped** (recommended)
2. **Recreate from scratch** (overwrites artifacts, requires explicit confirmation)
3. **Re-run from a specific agent** (sub-menu with the four agents)
4. **Cancel**

The orchestrator never decides on its own: every overwrite requires explicit `sim`.

---

## Next steps

- [The greenfield agents](agentes.md): what each agent does, inputs and outputs.
- [Code Forward Agents](../forward/index.md): the natural next step after Spec SDD finishes.
