# Code Quality Agents

The **Code Quality Agents** Team improves the internal structure of a legacy system **without changing its observable behavior**, and proves that preservation before touching the code. This is perfective and preventive maintenance on code that already works: refactoring, modularization, decoupling, optimization, algorithmic simplification, standardization and dead code removal.

It is a different axis from the other Teams: Code Forward creates new code, Bug Agents fixes defects, Migration changes platform. This Team makes what already works better, keeping what works working.

The founding rule: **proposing a transformation and applying it are separate acts, and nothing touches the legacy without proof of behavior preservation.**

Optional Team, pre-checked in the installer.

---

## When to use

The system runs, but a piece of it is hard to read, slow, over-coupled, inconsistent or full of code nobody calls, and you want to improve it safely rather than rewrite it. Every change is anchored to the soul (`soul.md`) and the confirmed rules the Discovery Team extracted, and the legacy code changes only through an approved diff with a proven safety net.

The Team works best on top of an extraction (`_reversa_sdd/`): the soul and confirmed specs are the guardrail that tells a real behavior from an accidental one.

---

## The 8 commands

```
/reversa-refactor ──inventories──► _reversa_refactor/<context>/opportunities/
      │ prioritizes by real ROI (hotpath, not aesthetics), routes
      ▼
  structure    /reversa-restructure   /reversa-modularize   /reversa-decouple
  performance  /reversa-optimize      /reversa-simplify
  hygiene      /reversa-standardize   /reversa-prune
      │ each: safety net ──► gate (approved diff) ──► proof of preservation
      ▼
transformations/OPP-.../  (plan.html, diffs, evidence)  ── always reversible
```

| Agent | Role |
|-------|------|
| **Refactor** | Orchestrator: reads the soul and the legacy map, inventories improvement opportunities, prioritizes by real ROI (hotpath, not aesthetics), routes to the right specialist and runs the gates. Never applies a transformation itself. `/reversa-refactor` |
| **Restructure** | Internal structure at method and class level via the Fowler catalog (extract method, rename, decompose conditionals, remove duplication), in small reversible steps. `/reversa-restructure` |
| **Modularize** | Splits a large piece into smaller, cohesive modules with well-defined responsibility, respecting the domain boundaries of the soul. `/reversa-modularize` |
| **Decouple** | Reduces direct dependencies (dependency inversion, Feathers seams, cycle breaking), measuring coupling before and after. `/reversa-decouple` |
| **Optimize** | Reduces execution time, memory and resource use, always with a before/after measurement and preserved output. `/reversa-optimize` |
| **Simplify** | Replaces complex logic with a simpler, clearer solution, with a proof of output equivalence. The goal is lower cognitive complexity, not resource cost. `/reversa-simplify` |
| **Standardize** | Applies consistent naming, formatting and organization conventions from the project's dominant pattern. Purely cosmetic and structural, never changes semantics. `/reversa-standardize` |
| **Prune** | Removes dead code, and only what it can prove is dead (no static reference and no known dynamic entry), telling dead code from a suspected orphan. `/reversa-prune` |

---

## The invariant: behavior preservation

Refactoring changes the structure, never the observable behavior. This Team turns that into a proven invariant, with three mechanisms:

- **Safety net first**: before any structural or logical change, the specialist checks for tests that pin the current behavior. Without coverage, it offers to generate **characterization tests** (Feathers) that fix the behavior as it is, proven green before the transformation starts. If the user declines the net, the transformation drops to red and the report records that it was applied without mechanical proof.
- **Anchored to the soul**: every change is checked against `soul.md` and the confirmed specs. No confirmed business rule may become a broken rule, and code that implements a confirmed rule is never treated as dead.
- **Proven, then reversible**: after applying, the specialist proves the safety net stays green (behavior unchanged), and the change is always reversible through the recorded diff. `optimize`, `decouple` and `simplify` also carry a before/after measurement or an equivalence proof, not just a claim.

---

## Anatomy of the outputs

Everything lives in `_reversa_refactor/`, separate from extraction (`_reversa_sdd/`), evolution (`_reversa_forward/`) and bugs (`_reversa_bugs/`). Work is grouped by **context**: the feature, module or use case being improved.

```
_reversa_refactor/
├── README.md                     the registry contract (control mode, safety-net policy)
└── <context>/                    e.g. shipping-calculation/
    ├── opportunities/            detected opportunities, one file each (verb, target, ROI, confidence)
    ├── transformations/
    │   └── OPP-20260723-K4T9-extract-shipping-rules/
    │       ├── plan.html         visual plan, approved BEFORE any file is touched
    │       ├── safety-net/       characterization tests + green/red result
    │       ├── before-after/     measurement, equivalence proof or death proof
    │       ├── CHG-NNN.diff       applied diffs, the source of reversal
    │       └── transformation.md  record (safety net, preservation method, approval)
    └── generated/                index of opportunities and their state (never hand-edited)
```

Each opportunity carries the Reversa confidence scale (🟢 covered and understood, 🟡 partial, 🔴 no behavior proof) and a ROI estimate. The orchestrator prioritizes a hot path of high frequency over a large but rarely executed module. When a target needs more than one verb, the orchestrator chains the specialists one at a time, each with its own gate.

---

## Non-destructive

Code Quality Agents write only inside `_reversa_refactor/`. Project code changes exclusively through an approved diff gate, always reversible. Refactoring is not an exception to the directive, it is the case that depends on it the most. Any specialist that cannot prove preservation stops at the gate and never applies in silence. Removing code, altering the effective spec and destructive operations have a mandatory gate in every control mode.
