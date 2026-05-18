# Documentation Team

The Documentation Team turns the knowledge extracted by the rest of Reversa into a self-contained HTML mini-site, served directly from disk. No build server, no internet connection required to view it: every library, every dataset, every visual asset is vendored locally.

Activate with:

```
/reversa-docs
```

The orchestrator detects which sources are available (`_reversa_sdd/`, `.reversa/soul.md`, `.reversa/chronicle.md`, source code), runs a short three-question interview to choose reader profile, depth and visual style, then drives four specialist agents in fixed order.

---

## When to use

You already ran `/reversa` and want to give someone, a new dev, a non-technical stakeholder, an auditing team, a way to navigate what was extracted without reading raw Markdown. The mini-site is opinionated about onboarding: 3D Code City for spatial intuition, dashboards for quantitative bite, glossary plus deck for narrative.

In a pure greenfield project (no sources detected), the orchestrator asks whether to abort or generate a minimal index only.

---

## Pipeline

```
/reversa-docs                   (orchestrator)
       │
       ▼ Phase 0: vendor bundle
       │   downloads Three.js, D3, Highcharts, OrbitControls
       │   to assets/vendor/ so file:// works offline
       │
       ▼ Phase 1
Mapper        → arquitetura.html (Code City 3D)
              → modulos.html (force-directed D3)
              → topologia.html (legacy vs modern side-by-side)
       │
       ▼ Phase 2
Analyst       → metricas.html (Highcharts treemap, sankey, histogram, columns)
              → timeline.html (events from .reversa/chronicle.md)
       │
       ▼ Phase 3
Storyteller   → glossario.html (client-side search)
              → deck.html (6 to 10 navigable slides)
              → features/<spec>.html (one per SDD spec)
       │
       ▼ Phase 4
Publisher     → index.html with hero and unique generative seal
              → auto-discovery of auxiliary HTMLs
              → link validation and local telemetry
```

There is a `CONTINUAR` checkpoint between agents. Add `--auto` to skip the interview and the pauses.

---

## Where artifacts land

Everything lands under `.reversa/documentation/`. The Team **never** modifies core artifacts (`_reversa_sdd/`, `.reversa/soul.md`, `.reversa/chronicle.md`), it only reads them.

```
.reversa/documentation/
├── index.html              (Publisher: hero, seal, nav)
├── arquitetura.html        (Mapper)
├── modulos.html            (Mapper)
├── topologia.html          (Mapper, if topology detected)
├── metricas.html           (Analyst)
├── timeline.html           (Analyst, if chronicle exists)
├── glossario.html          (Storyteller)
├── deck.html               (Storyteller)
├── features/
│   └── <spec>.html         (Storyteller, one per SDD spec)
├── viewer.html             (shared shell)
├── assets/
│   ├── vendor/             (Three.js, D3, Highcharts, ...)
│   ├── js/data.js          (Publisher: injects window.RV_DATA)
│   └── data/*.json         (intermediate caches between agents)
├── .config.json            (interview, seed, visual style)
└── .state.json             (pipeline telemetry, hashes per page)
```

If `.reversa/documentation/` already exists, the orchestrator offers six regeneration options (keep, regenerate all, regenerate a single agent or page, redo the interview, ...) and always creates a `.backup-<timestamp>/` before overwriting.

---

## Invariants

Every page the Team produces respects four invariants. The Publisher is the final guardian, but any agent that breaks them breaks the mini-site:

1. **Works via `file://`**: a double-click on `index.html` is enough. No page issues `fetch()` to local files (CORS blocks origin `null`); data comes from `window.RV_DATA.<key>`, injected by `assets/js/data.js`.
2. **Works offline**: no `<script src="https://...">` to a CDN. Every external library is vendored in `assets/vendor/`.
3. **Nav reflects `pagesGenerated`**: the `<!-- NAV_LINKS -->` marker in `viewer.html` is filled by the Publisher reading `.state.json.pagesGenerated`. Omitted pages do not appear.
4. **Smoke test before declaring success**: the Publisher boots a local `http.server`, fetches each page and greps for error patterns. Failures are surfaced in the final summary.

---

## Next steps

- [The 4 visual agents](agentes.md): what each one renders, inputs and outputs.
- [Code Forward Agents](../forward/index.md): the cycle the Team is built on top of.
