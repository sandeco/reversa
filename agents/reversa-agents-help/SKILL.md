---
name: reversa-agents-help
description: Explains with analogies what each Reversa agent does and when to use it. Activate with /reversa-agents-help.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  role: help
---

Present exactly the text below, without changes, without summarizing.

---

# Reversa Agents — guide with analogies

Reversa is a team of specialists. Each agent does one thing — and does it well.

---

## 🎼 Reversa — central orchestrator
**Command:** `/reversa`

An orchestra conductor does not play any instrument. They know the entire score and say who enters when, in what order, at what tempo. Without them, each musician would play their part without connecting with the others.

> Use Reversa to start or resume the complete analysis. It manages the sequence for you.

---

## 🗺️ Scout — the real estate agent
**Command:** `/reversa-scout`

The real estate agent does the first tour of the property. They don't open drawers, don't read documents, don't touch anything. They just map: how many rooms, what neighborhood, what facilities exist, what general state.

> Use Scout at the beginning. It generates the project inventory — languages, frameworks, modules, dependencies — without diving into the code.

---

## 🧬 Soul Extractor: the express biographer
**Command:** `/reversa-extract-soul`

The express biographer visits the character, reads the real estate agent's notes (Scout), quickly flips through some family albums and the letter history (git log), and produces a one-page biography: who they are, what they do, and the founding decisions that shaped their entire life. It's not the complete history, it's the distilled soul.

> Use the Soul Extractor right after Scout, when you want an executive summary of the system (purpose, central entities and founding decisions) in a single Spec, without waiting for the entire pipeline. Does not replace Archaeologist or Detective.

---

## ⛏️ Archaeologist — the excavator
**Command:** `/reversa-archaeologist`

The archaeologist excavates the ground patiently, layer by layer. They catalog each artifact found: size, material, location, shape. They do not interpret the civilization, only describe with precision what is there.

> Use Archaeologist to analyze the code module by module. It extracts functions, algorithms, data structures and control flows. **Runs one module per session** to save tokens.

---

## 🔍 Detective — the Sherlock Holmes
**Command:** `/reversa-detective`

Sherlock Holmes arrives after the archaeologist. Looks at the cataloged artifacts and asks: *"But why is this here? Who put it there? What does this reveal about who lived here?"* They do not excavate. They interpret.

> Use Detective after Archaeologist. It extracts implicit business rules, reads the git history as a diary and reconstructs decisions that nobody documented.

---

## 📐 Architect — the cartographer
**Command:** `/reversa-architect`

The cartographer visits a territory and produces formal maps: floor plan, elevation map, structural plan. Someone who has never stepped there can understand everything by looking at the maps.

> Use Architect after Detective. It synthesizes everything into C4 diagrams, complete ERD and integration map.

---

## 📝 Writer — the notary
**Command:** `/reversa-writer`

The notary transforms what was discovered into formal, precise and traceable contracts. Each clause has a declared degree of certainty. The document is worth as a contract: an AI agent can reimplement the system from it.

> Use Writer after Architect. It generates SDD specs, OpenAPI and user stories with code traceability.

---

## ⚖️ Reviewer — the spec reviewer
**Command:** `/reversa-reviewer`

The Reviewer takes the Writer's contracts and tries to puncture them: *"This is a contradiction. This point has no proof. This rule disappears if the user does X."* They do not want to destroy, they want to ensure that what stands is solid.

> Use Reviewer after Writer. It critically reviews specs, reclassifies confidence and raises questions for human validation.

---

## 🖼️ Visor — the forensic illustrator
**Command:** `/reversa-visor`

The forensic illustrator works only with images. Receives screenshots of the system and faithfully reconstructs the interface: screens, forms, navigation flows. The system does not need to be running — just the photos.

> Use Visor when screenshots are available. It documents the UI without needing system access.

---

## 🗄️ Data Master — the geologist
**Command:** `/reversa-data-master`

The geologist maps the underground — the layer nobody sees but that supports everything. Tables, relationships, constraints, triggers, procedures. The invisible foundation upon which the application is built.

> Use Data Master when DDL, migrations or ORM models are available. It documents the database completely.

---

## 🎨 Design System — the stylist
**Command:** `/reversa-design-system`

The stylist catalogs the wardrobe: color palette, typography, spacing, design tokens. The "fashion rules" that govern the system's appearance — what can and cannot be combined.

> Use Design System when there are CSS files, themes or interface screenshots. It extracts the visual tokens from the project.

---

## Recommended Sequence

```
/reversa → orchestrates everything automatically

Or manually:
Scout → Archaeologist (N sessions) → Detective → Architect → Writer → Reviewer

Optional at any phase:
Soul Extractor · Visor · Data Master · Design System
```
