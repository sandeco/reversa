# Step 2 — Session Resume

## 0. Check for In-Progress Migration

Before anything, read `.reversa/state.json` only to resolve `output_folder` (default `_reversa_sdd`).

Check if `<output_folder>/migration/.state.json` exists. If it does not exist, skip this section and proceed to section 1.

If it exists, read the file and classify the migration state:

| Condition | State |
|-----------|-------|
| `pendingAgents.length > 0` or `currentAgent.agent` is not `null` | in progress |
| `currentAgent.status == "awaiting_user_approval"` | pending intra-agent pause |
| `pendingAgents.length == 0`, `currentAgent.agent == null` and `<output_folder>/migration/handoff.md` exists | completed |

If the state is **completed**, skip this section (the migration is already finished, nothing to ask) and proceed to section 1.

If the state is **in progress** or **pending intra-agent pause**, present the question to the user before anything else:

> "[Name], I found a **migration in progress** in `<output_folder>/migration/`.
>
> - Completed: <N> of 6 agents (<list of completedAgents>)
> - Pending: <list of pendingAgents>
> - Current state: <currentAgent.agent or "awaiting human approval">
>
> How would you like to continue:
>
> 1. **Resume the migration**: returns to the Migration Team where it stopped
> 2. **Resume the Reversa flow**: continues discovery/forward, ignores migration for now
> 3. **Cancel**: ends this session without changing anything
> 4. **Other**: describe what you prefer to do
>
> Use the engine's interactive menu mechanism (in Claude Code, `AskUserQuestion`); in engines without menu support, ask the user to type 1-4 or free text."

Wait for the response. DO NOT choose on your own.

- If **1**: end `/reversa` here with the final instruction:
  > "To resume the migration, type `/reversa-migrate`. It detects the saved state and offers resume options."
  
  Do NOT activate `reversa-migrate` automatically, let the user type it (Reversa's explicit handoff default).
- If **2**: proceed with section 1 of this step normally.
- If **3**: end without doing anything.
- If **4** (free text): interpret the user's intent and offer the best possible route, without inventing new flows. If the intent is ambiguous, re-ask the question once before deciding.

## 1. Read State

Read `.reversa/state.json` and `.reversa/plan.md`.

## 2. Version Check

Compare `.reversa/version` with the npm registry. If there is a newer version, discreetly inform:
> "💡 New version available. Run `npx reversa update` when you want to update."

## 3. Greeting

Say: "[Name], welcome back to Reversa! 🎼"

## 4. Progress Summary

Show:
- ✅ Completed phases (`completed` field in state.json)
- 🔄 Current phase (`phase` field) with the last task recorded in `checkpoints`
- ⏳ Next phases (`pending` field)

Example:
> "Current progress:
> ✅ Recognition completed
> 🔄 Excavation in progress — modules `auth` and `orders` analyzed, `payments` and `users` pending
> ⏳ Interpretation, Generation, Review"

## 5. Gap Answer Mode

If `answer_mode` is `"file"`:
> "Reminder: your answers to questions should be filled in `_reversa_sdd/questions.md`. Let me know when you're done."

If `answer_mode` is `"chat"` (default):
> Continue normally — I'll ask the questions here in chat.

## 6. Confirmation

Ask only: "Shall we continue from where we left off? (CONTINUE to proceed)"

After confirmation, resume the next pending task in the plan (`.reversa/plan.md`).

**🚫 Do not offer `/clear` + `/reversa` at this point.** The user just resumed the session; asking to clear and reopen now is redundant. The pause prompt between steps (described in `SKILL.md`, section "Preventive Checkpoint Between Steps") only applies **after** an agent completes work within this session, never in the resume greeting itself.

See `references/checkpoint-guide.md` for the rules for writing to state.json.
