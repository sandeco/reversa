---
name: product-design-lego-blocks
description: Orchestrates a progressive product design workflow from an initial seed idea (goal, target audience, starting point) to a consolidated project, adding and connecting features as Lego blocks. Use when the user wants to evolve a product concept into a structured, traceable project before coding.
---

# Purpose

This skill helps you:
- Start from a **seed idea** (objective, target audience, starting point).
- Grow the project **progressively**, adding one feature block at a time.
- Keep every decision **explicitly recorded, connected, and debatable**.
- Output a **final project blueprint** (components, modules, rules, dependencies) that can be passed to implementation agents.

# When to use

Use this skill when:
- The user gives a **seed idea** and wants to “grow” the product organically.
- The user says “add another feature”, “add a module”, “change this part”, or “refactor this block”.
- The user wants a **retro‑active log** of how the design evolved (what was added, why, and what was removed).

# Inputs you expect

Ask the user for:
1. **Objective**:  
   - What problem are we solving?  
   - What is the main outcome the user wants?
2. **Target audience**:  
   - Who is the user of this product?  
   - Where they are coming from (profile, context, constraints)?
3. **Starting point**:  
   - What already exists? (existing code, API, UI, docs, etc.)
   - Or: “blank slate” if nothing exists yet.

If any of these is missing, ask the user to clarify before proceeding.

# Workflow: “Lego‑Blocks” progressive design

Do this **step by step**, saving each step in a central log (e.g., `design-log.md` or `project-knowledge/`).

1. **Step 1 – Seed framing**
   - Convert the seed idea into:
     - A **mission statement** (1–2 sentences).
     - A **core job‑to‑be‑done** (what the user *really* wants to accomplish).
   - Output:
     - A short “Project Seed” document with:
       - Objective
       - Target audience
       - Starting point
       - Initial constraints (time, tech stack, budget, etc.)

2. **Step 2 – Block inventory**
   - Propose a **first set of minimal blocks** (features, modules, components) that together cover:
     - Core user flow.
     - Minimum viable product (MVP) boundaries.
   - For each block:
     - Name
     - Purpose
     - Inputs / outputs
     - Dependencies (if any)
   - Ask the user:
     - “Do you want to:
       - add, remove, or refactor a block?”
       - “Connect this block to another (create a dependency)?”
       - “Debate this block’s design (pros/cons, alternatives)?”

3. **Step 3 – Retro‑active logging**
   - After every interaction:
     - Append a **log entry** to a central file, e.g.:
       - Date + version
       - What changed (which block added/removed/refactored)
       - Why (user’s reason, constraints, or trade‑off)
       - What was kept / what was removed
   - Suggest a **graph‑like structure**:
     - “Block A → Block B” (dependency)
     - “Block X was deprecated in favor of Block Y”

4. **Step 4 – Progressive debates**
   - For each block the user wants to “lock” or “ship”:
     - Run a mini‑debate:
       - Pros
       - Cons
       - Risks
       - Alternatives
     - Record the decision:
       - “Approved as is”, “Approved with constraints”, or “Rejected / postponed”.
   - Keep a **decision matrix** (even if simple) to show:
     - Which blocks are “committed”, “exploratory”, or “blocked”.

5. **Step 5 – Final project blueprint**
   - When the user says “I’m done designing”, compile:
     - A **map of all blocks** (like a bubble graph of modules):
       - Nodes: blocks / modules
       - Edges: dependencies
       - Color/status: “implemented”, “design”, “deprecated”
     - A **health‑style diagnosis**:
       - Cohesion (how well each block has a single concern)
       - Coupling (how many other blocks it depends on)
       - Completeness (what is missing to reach the mission)
     - A **timeline**:
       - What can be built now (MVP)
       - What can be added later (progressive features)

# Output format

Always structure the final output as:

- **1. Project Seed**
  - Objective
  - Target audience
  - Starting point
- **2. Block map**
  - List of blocks (name, purpose, status)
  - Dependency graph (text or structured data)
- **3. Evolution log**
  - Chronological list of changes
  - Key decisions and trade‑offs
- **4. Health‑style diagnosis**
  - Cohesion score per block (high/medium/low)
  - Coupling score per block (high/medium/low)
  - Overall project “design health” (green/yellow/red)

If the user subsequently wants to **implement**, hand this blueprint to:
- A **code_architect** skill
- A **db_designer** skill
- Or a **feature_to_code** skill (your own encapsulation/análise skills).

# Constraints and guardrails

- Do not invent implementation details too early; keep blocks **abstract** until the user says “lock this design”.
- If the user wants to change a block that is already “locked”:
  - Ask: “Is this a refactor or a new variation?”
  - Track the **old block** explicitly as “deprecated” with a reason.
- If the user wants to simulate a **retro‑analysis** of the project growth:
  - Walk through the log and:
    - Show the “before” vs “after” block set.
    - Show how cohesion and coupling changed over time (like your bubble‑graph).
