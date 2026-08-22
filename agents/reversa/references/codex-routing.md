# Codex adaptive routing

Apply this contract when a Reversa orchestrator starts and whenever it invokes another `reversa-*` skill.

The generated file `.codex/agents/<profile-id>.toml` is the routing source of truth for the profile name, model, reasoning effort, delegated-session guard, and escalation contract. The installed `SKILL.md` remains the semantic source of truth for the work itself.

## Choose the dispatch transport

Use the first transport that the current runtime actually exposes:

1. **Native project custom agent.** Use this only when the available tool has an explicit custom-agent/profile selector that accepts the exact `<profile-id>` and loads `.codex/agents/<profile-id>.toml`.
2. **Portable profile dispatch.** When collaboration tools expose `spawn_agent` with model and reasoning overrides but no custom-profile selector, reproduce the generated profile through that tool:
   - Read `.codex/agents/<profile-id>.toml` completely and validate `name`, `model`, `model_reasoning_effort`, and `developer_instructions`.
   - Convert the profile id to a legal collaboration task name by replacing every non-alphanumeric character with `_` (for example, `reversa-scout-t1` becomes `reversa_scout_t1`).
   - If no agent with that task name exists, call `spawn_agent` with `fork_turns: "none"`, the profile's `model`, and the profile's `model_reasoning_effort` as `reasoning_effort`.
   - If the same-profile agent already exists and is idle or finished, use `followup_task` instead of creating a duplicate. Never reuse an agent created for a different profile.
   - The task message must say that the session is already delegated, require the child to read both the profile TOML and installed `SKILL.md` completely, and include the full logical task, inputs, allowed paths, current checkpoint, expected result, and whether this is the single escalated retry.
   - Wait for completion and validate the returned result and artifacts before advancing.
3. **Local fallback.** If neither dispatch transport is available, or dispatch fails before completing work, read the target `SKILL.md` and execute it in the current context.

Do not start a nested standalone `codex exec` process to emulate project custom-agent dispatch. Its thread may not be registered with the active Desktop app server, causing `collab spawn failed: no thread with id` even when the profiles are valid.

## Entrypoint bootstrap

If the current orchestrator has a profile at `.codex/agents/<current-skill-name>.toml` and this session was not already delegated, dispatch the whole flow once using the transport selection above. Wait for it, return its result, and do not continue the same flow locally after a successful delegation.

Both generated profile instructions and the portable task message mark the child session as already delegated. In that session, continue the skill directly and never delegate the same flow again.

## Child dispatch

1. Keep the approved Reversa order. Dispatch only one logical task at a time and wait for it to finish; this routing contract does not authorize parallel work.
2. Select the baseline profile whose id exactly matches the target skill name.
3. Dispatch it using the selected transport and provide complete task context.
4. Validate its result and artifacts before updating checkpoints or advancing the plan.
5. Do not also execute the same child skill locally after a successful delegation.

If dispatch fails, record the transport failure briefly and use the local fallback. Before replaying locally, inspect any returned result or artifacts so a partially completed side effect is not repeated.

## One-step escalation

When the child returns a `compute_escalation` block:

1. Accept it only when `required` is `true`, the reason contains concrete task evidence, and `recommended_profile` names an existing generated next-class profile for the same skill.
2. Dispatch the same task and inputs once with `recommended_profile`. In portable mode, use that profile's model and reasoning effort and its distinct normalized task name.
3. Mark the task message as the single escalated retry and wait for completion.
4. Never escalate more than one class or more than once for a logical task. Ignore any further escalation request from the retry.
5. Never select `max`, invent a profile, or silently substitute a different model. If the recommended profile is unavailable, continue with the baseline result or report the real blocker.

The parent orchestrator owns dispatch and escalation. A child must never spawn its own replacement or recursively delegate the same logical task.
