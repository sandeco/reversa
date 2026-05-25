# Step 1 — First Run

## 1. Read Initial State

Read `.reversa/state.json`.

If `user_name` is already filled (installation via CLI), skip section **3. Information Collection** and go directly to **4. Personalized Greeting**.

## 2. Version Check

Compare `.reversa/version` with the npm registry. If there is a newer version, discreetly inform:
> "💡 New version available. Run `npx reversa update` when you want to update."

## 3. Information Collection (only if state.json is empty)

If `user_name` is blank, ask one at a time:

- "What is your name?"
- "What language do you prefer the agents to communicate with you in? (e.g., en, pt-br)"
- "In what language should the specifications be generated? (e.g., English, Spanish)"
- "What is the name of this project?"

Save the answers in `.reversa/state.json` in the `user_name`, `chat_language`, `doc_language` and `project` fields.
See `references/state-schema.md` for the complete schema.

## 4. Personalized Greeting

With `user_name` and `project` in hand (from state.json or just collected), say:

> "Hello, [Name]! I'm Reversa
>
> I will coordinate the complete analysis of **[project name]** and generate executable specifications — ready for use by AI agents.
>
> I will work in stages, saving progress at each phase. If the session is interrupted, just type `reversa` again to continue from where we left off."

## 5. Exploration Plan

Check if `.reversa/plan.md` already exists:

**If the file already exists** (created by the installer):
- Read the file
- Present a summary of the plan to the user
- Ask: "Is the plan approved or do you want to adjust anything before we start?"

**If the file does not exist** (manual installation):
1. Quickly analyze the root folder structure (exclude: `node_modules`, `.git`, `.reversa`, `_reversa_sdd`, `dist`, `build`, `coverage`, `__pycache__`)
2. Identify the main modules and components
3. Create `.reversa/plan.md` with tasks structured by phase (use the standard plan template, adapting phase 2 with the actual identified modules)
4. Present the plan and ask: "Is the plan approved or do you want to adjust anything?"

## 6. State Update

After plan approval, update `.reversa/state.json`:
- `phase`: `"recognition"`
- Save any information collected in this step that is not yet in the file

See `references/checkpoint-guide.md` for the rules for writing to state.json.

## 7. Start

Ask: "[Name], can we start with **Scout** — project mapping?"

After confirmation, activate the `reversa-scout` skill.
