# Checkpoint Guide — .reversa/state.json

Reversa is the only agent that **writes** to state.json. Other agents only read it.

## Absolute Rules

1. **Never remove existing fields.** Only add or update.
2. **Always read the file before writing** — another agent may have updated `checkpoints`.
3. **Save after each completed phase**, not just at the end.
4. **In case of context overflow**, save immediately before pausing.

## What to save per phase

### When starting a phase
```json
{
  "phase": "recognition"
}
```

### When completing an agent
```json
{
  "checkpoints": {
    "scout": {
      "completed_at": "2026-04-26T10:30:00Z",
      "files": [
        "_reversa_sdd/inventory.md",
        "_reversa_sdd/dependencies.md",
        ".reversa/context/surface.json"
      ]
    }
  }
}
```

### When completing an entire phase
```json
{
  "phase": "excavation",
  "completed": ["recognition"],
  "pending": ["excavation", "interpretation", "generation", "review"]
}
```

### When marking a partial Archaeologist task
```json
{
  "checkpoints": {
    "archaeologist": {
      "modules_analyzed": ["auth", "orders"],
      "modules_pending": ["payments", "users"]
    }
  }
}
```

## Phase Sequence

```
null → recognition → excavation → interpretation → generation → review
```

When moving to the next phase:
- Remove the completed phase from `pending` and add it to `completed`
- Update `phase` to the next phase

## Example state.json with analysis in progress

```json
{
  "version": "1.0.0",
  "project": "my-system",
  "user_name": "Ana",
  "chat_language": "en",
  "doc_language": "English",
  "answer_mode": "chat",
  "output_folder": "_reversa_sdd",
  "phase": "excavation",
  "completed": ["recognition"],
  "pending": ["excavation", "interpretation", "generation", "review"],
  "checkpoints": {
    "scout": {
      "completed_at": "2026-04-26T10:30:00Z",
      "files": [
        "_reversa_sdd/inventory.md",
        "_reversa_sdd/dependencies.md",
        ".reversa/context/surface.json"
      ]
    },
    "archaeologist": {
      "modules_analyzed": ["auth", "orders"],
      "modules_pending": ["payments", "users"]
    }
  },
  "engines": ["claude-code"],
  "agents": ["reversa", "reversa-scout", "reversa-archaeologist"],
  "created_files": []
}
```

## Context Overflow Pause Message

If context is running out, save the current checkpoint and say:

> "[Name], I'll pause here to preserve context. Everything is saved in `.reversa/state.json`. Type `reversa` in a new session to continue from where we left off."
