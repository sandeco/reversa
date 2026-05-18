# The 4 visual agents

Four agents make up the Documentation Team, plus the orchestrator. Each one runs in fixed order, can be invoked standalone with `/reversa-docs-<role>`, and writes only inside `.reversa/documentation/`.

---

## Pipeline

```
Reversa Docs (orchestrator)
        │
        ▼  vendor bundle (Phase 0)
        │
        ▼
Mapper → Analyst → Storyteller → Publisher
```

There is a human review pause between agents. Default mode is interactive. Add `--auto` to skip pauses.

---

## 1. Reversa Docs (orchestrator)

**Command:** `/reversa-docs`

Detects which sources are available, runs the three-question interview (reader profile, depth, visual style), computes a deterministic seed from `soul.md` (or project name), persists everything in `.config.json` and walks the four specialists. Saves telemetry in `.state.json` and offers six regeneration options on subsequent runs.

**Produces:** `.config.json`, `.state.json` and the choreography of the other agents.

---

## 2. Mapper

**Command:** `/reversa-docs-mapper`

Spatial structure of the project. Renders Code City in 3D (Three.js, with the `reversa-arquitetura-3d` skill) where each building is a module, height encodes LOC and color encodes complexity. Also generates a 2D force-directed module map (D3) and, when topology is detected, a side-by-side legacy vs modern view.

**Produces:** `arquitetura.html`, `modulos.html`, `topologia.html` (when applicable). Intermediate JSONs are left in `assets/data/` for reuse by the Analyst.

---

## 3. Analyst

**Command:** `/reversa-docs-analyst`

Quantitative dashboard. Highcharts treemap (LOC per module), columns (complexity per module), sankey (dependencies between modules), histogram (LOC distribution). When `.reversa/chronicle.md` exists, also renders an interactive timeline of project events.

Reuses the Mapper's JSONs. In standalone invocation, runs minimal extraction when those JSONs are absent.

**Produces:** `metricas.html`, `timeline.html` (when chronicle exists).

---

## 4. Storyteller

**Command:** `/reversa-docs-storyteller`

Narrative and onboarding. Three artifacts: an interactive glossary (Concept Explainer with client-side search), a navigable slide deck (6 to 10 slides) and one detailed page per feature in the *How a Feature Works* layout.

Does not require Analyst or Mapper as a hard prerequisite: the deck adapts to whatever pages exist. In a greenfield project with only `soul.md`, still produces glossary plus a minimal 4-slide deck.

**Produces:** `glossario.html`, `deck.html`, `features/<spec>.html` (one per SDD spec).

---

## 5. Publisher

**Command:** `/reversa-docs-publisher`

Last piece of the pipeline. Integrates the work of the three specialists in a coherent mini-site with a unique generative seal (via the `reversa-selo-generativo` skill), retroactively injects a mini-seal into every page, auto-discovers auxiliary HTMLs left by other Reversa core agents (via the `reversa-category` meta tag), validates links and runs a real smoke test (boots `http.server`, fetches each page, greps for error patterns) before declaring success.

Owns the **vendor bundle**: downloads Three.js, D3, Highcharts and modules into `assets/vendor/` based on `references/vendor-pins.yaml`, with CDN retry. This is what makes the mini-site work via `file://` and offline.

**Produces:** `index.html` (hero + seal + nav), `assets/js/data.js` (injects `window.RV_DATA`), `assets/vendor/*`, and final telemetry in `.state.json`.

---

## Shared skills

The Team brings five shared skills that ship alongside it. They are not standalone agents but capability building blocks consumed by the four specialists.

| Skill | Used by | Purpose |
|-------|---------|---------|
| `reversa-arquitetura-3d` | Mapper | Code City 3D rendering on top of Three.js |
| `reversa-especialista-d3` | Mapper | Force-directed module map in D3 |
| `reversa-highcharts-visualizer` | Analyst | Highcharts treemap, sankey, histogram and columns |
| `reversa-image-prompt-json` | Storyteller | Optional premium covers for the deck slides |
| `reversa-selo-generativo` | Publisher | Unique generative seal per project, derived from the deterministic seed |

---

## Running manually

You rarely need to call an isolated agent. `/reversa-docs` orchestrates everything. But if a specific page broke or you want to regenerate one section:

```
/reversa-docs                    # full pipeline (with interview and CONTINUAR)
/reversa-docs --auto             # full pipeline, no pauses, default profile
/reversa-docs-mapper             # regenerate arquitetura / modulos / topologia
/reversa-docs-analyst            # regenerate metricas / timeline
/reversa-docs-storyteller        # regenerate glossario / deck / features
/reversa-docs-publisher          # regenerate index + seal + nav, re-run smoke test
```

Each standalone agent runs the Publisher's Phase 0 (vendor bundle) as a preamble when `assets/vendor/` is empty, so a single-agent call still produces a working page.
