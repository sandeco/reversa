# Reversa

> Reverse Engineering Framework installed in this project.

## How to use

Type `/reversa` to activate Reversa and start or resume the project analysis.

## Activation behavior

When the user types `/reversa` or the word `reversa` by itself in a message:

1. Activate the `reversa` skill available at `.claude/skills/reversa/SKILL.md`
2. If it is not found in `.claude/skills/`, try `.agents/skills/reversa/SKILL.md`
3. Read SKILL.md in full and follow Reversa's instructions exactly

## Non-negotiable rule

Never delete, modify, or overwrite pre-existing files from the legacy project.
Reversa writes **only** to `.reversa/` and `_reversa_sdd/`.
