# Reversa (Orchestrator)

**Command:** `/reversa`
**Phase:** Orchestration

---

## 🎼 The orchestra conductor

A conductor doesn't play any instrument. They know the full score and tell who enters when, in what order, at what pace. Without them, each musician would play their part without connecting to the others. With them, everything becomes music.

---

## What it does

The central orchestrator is the first and last to take the stage. It doesn't write code, analyze modules, or generate specs. It knows the full score and knows who needs to enter when, in what order, and at what pace.

Without it, each agent would play its part without connecting to the others. With it, everything becomes music.

---

## Responsibilities

- Checks whether an analysis is in progress (reads `.reversa/state.json`)
- First session: creates a personalized exploration plan and presents it to the user
- Subsequent sessions: resumes exactly where it left off
- Runs plan agents **sequentially**, one at a time
- Saves checkpoints after each agent completes
- Presents a brief summary of what was generated at each step
- Warns when context is running out and saves state before stopping
- Checks whether a new version is available and notifies discreetly

---

## Special behavior after Scout

After Scout finishes, Reversa reads the generated `surface.json` and personalizes Phase 2 of the plan. Instead of a generic "analyze the code" task, the plan becomes one task per identified module:

```
- [ ] Archaeologist: analysis of module `auth`
- [ ] Archaeologist: analysis of module `orders`
- [ ] Archaeologist: analysis of module `payments`
```

---

## Rules it never breaks

- Never runs multiple agents simultaneously without explicit user request
- Never deviates from the approved plan sequence without notice
- Never deletes, modifies, or overwrites pre-existing project files

---

## How to activate

=== "Claude Code / Cursor / Gemini CLI"
    ```
    /reversa
    ```

=== "Codex and engines without slash commands"
    ```
    reversa
    ```

To resume an interrupted analysis, just activate again. The saved state is read automatically.

---

## MCP integration

Reversa can also be queried via MCP (`npx reversa mcp`). The MCP server provides:
- **Tools:** `reversa_status`, `reversa_analyze`, `reversa_confidence`
- **Resources:** `reversa://state`, `reversa://inventory`
- **Prompt:** `reversa-new-analysis`

Use these to check state and reports without leaving the agent chat. The pipeline itself still runs via this skill — MCP is only for reading results.
