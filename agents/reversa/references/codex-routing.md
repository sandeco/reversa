# Codex adaptive routing

Apply this contract when a Reversa orchestrator starts and whenever it invokes another `reversa-*` skill.

The generated file `.codex/agents/<profile-id>.toml` is the routing source of truth for the profile name, model, reasoning effort, delegated-session guard, and escalation contract. The installed `SKILL.md` remains the semantic source of truth for the work itself.

## Choose the dispatch transport

Use the first transport that the current runtime actually exposes:

1. **Native project custom agent.** Use this only when the available tool has an explicit custom-agent/profile selector that accepts the exact `<profile-id>` and loads `.codex/agents/<profile-id>.toml`.
2. **Portable profile dispatch.** When collaboration tools expose `spawn_agent` with model and reasoning overrides but no custom-profile selector, reproduce the generated profile through that tool:
   - Read `.codex/agents/<profile-id>.toml` completely and validate `name`, `model`, `model_reasoning_effort`, and `developer_instructions`.
   - Convert the profile id to a legal collaboration task name by replacing every non-alphanumeric character with `_` (for example, `reversa-scout-t1` becomes `reversa_scout_t1`).
   - If no agent with that task name exists, call `spawn_agent` with `fork_turns: "none"`, the profile's `model`, and the profile's `model_reasoning_effort` as `reasoning_effort`. This value is mandatory: never use `"all"` or a numeric turn count for a Reversa child.
   - If the same-profile agent already exists and is idle or finished, use `followup_task` instead of creating a duplicate. Never reuse an agent created for a different profile.
   - The task message must say that the session is already delegated, require the child to read both the profile TOML and installed `SKILL.md` completely, and include the logical task, allowed paths, current checkpoint, expected result, and whether this is the single escalated retry.
   - Use a bounded handoff instead of copying the parent transcript, previous-agent prose, or source excerpts. The dispatch brief must stay at or below 4,000 tokens and point to durable artifacts by path. If that is not enough, write one focused handoff artifact of at most 2,000 tokens, then pass its path; do not embed both the handoff and its source material.
   - Wait for completion and validate the returned result and artifacts before advancing.
3. **Local fallback.** If neither dispatch transport is available, or dispatch fails before completing work, read the target `SKILL.md` and execute it in the current context.

Do not start a nested standalone `codex exec` process to emulate project custom-agent dispatch. Its thread may not be registered with the active Desktop app server, causing `collab spawn failed: no thread with id` even when the profiles are valid.

## Entrypoint bootstrap

If the current orchestrator has a profile at `.codex/agents/<current-skill-name>.toml` and this session was not already delegated, dispatch the whole flow once using the transport selection above. Wait for it, return its result, and do not continue the same flow locally after a successful delegation.

Both generated profile instructions and the portable task message mark the child session as already delegated. In that session, continue the skill directly and never delegate the same flow again.

## Session budget and compaction avoidance

1. Treat every approved Gate as a natural context boundary. Before starting the next logical step, write a durable checkpoint with the decision, validated evidence, remaining scope, and paths to artifacts; the successor reads that checkpoint rather than the prior conversation.
2. Keep a soft budget of ten model iterations after the last durable checkpoint. At that point, write or refresh the checkpoint, but do not split a narrow, healthy session solely because of its call count; continuing preserves a healthy cache.
3. Start the next focused logical task through the normal routing rules only at an approved Gate boundary or when the runtime reports compaction, context pressure, or a context-window warning. Do not reconstruct the parent transcript or paste the previous agent's prose into the successor.
4. When the local token audit reports a session with at least three model calls and a cache-hit ratio below 90%, treat the next broad source sweep, test run, or review as a cache-miss investigation: checkpoint first, reuse durable artifacts by path, and keep stable instructions ahead of dynamic findings. Do not claim the exact cache-miss cause without evidence.
5. Treat two or more individual calls below 20% cache hit in one audited session as a critical cache-miss burst. Before the next broad step, checkpoint and verify that profile selection, stable instructions, and the artifact-path handoff did not change. At the next approved Gate, start a focused successor from only that profile, the stable instructions, and artifact paths; do not copy parent prose or interrupt an unfinished required Gate.
6. Batch independent reads, searches, log aggregations, and static counts into one focused tool call when they need no intervening model judgement. Ask for one bounded aggregate rather than raw per-item output. Keep dependent actions, safety checks, and required Gate validation separate.
7. A budget checkpoint does not authorize skipping a required Gate, weakening validation, or replaying a completed side effect. It only changes how the next logical step receives its context.

## Child dispatch

1. Keep the approved Reversa order. Dispatch only one logical task at a time and wait for it to finish; this routing contract does not authorize parallel work.
2. Select the baseline profile whose id exactly matches the target skill name.
3. Dispatch it using the selected transport and the bounded handoff context from the portable-dispatch rules above.
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
