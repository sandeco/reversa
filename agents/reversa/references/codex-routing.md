# Codex adaptive routing

Apply this contract when a Reversa orchestrator starts and whenever it invokes another `reversa-*` skill.

## Entrypoint bootstrap

If the current orchestrator has an exact project profile at `.codex/agents/<current-skill-name>.toml`, and this session was not already delegated, delegate the whole flow once to that exact custom-agent name. Wait for it, return its result, and do not continue the same flow locally.

Generated profile instructions explicitly mark the child session as already delegated. In that session, continue the skill directly and never delegate the same flow again. If custom-agent spawning is unavailable or fails before work completes, continue in the current session.

## Dispatch

1. Keep the approved Reversa order. Dispatch only one logical task at a time and wait for it to finish; this routing contract does not authorize parallel work.
2. If `.codex/agents/<skill-name>.toml` exists and the runtime supports custom agents, delegate the task once to the exact custom-agent name `<skill-name>`.
3. Give the child the complete task, inputs, allowed paths, current checkpoint, and expected result. State that the session is already delegated and that the child must read its installed `SKILL.md` completely.
4. Wait for the child. Validate its returned artifacts and only then update checkpoints or advance the plan.
5. Do not also execute the same child skill in the current context after a successful delegation.

If the profile is unavailable, custom-agent spawning is unsupported, or the child fails before completing the task, read the child `SKILL.md` and execute it in the current context. Record the fallback briefly; routing failure must not block Reversa.

## One-step escalation

When the child returns a `compute_escalation` block:

1. Accept it only when `required` is `true`, the reason contains concrete task evidence, and `recommended_profile` names the generated next-class profile for the same skill.
2. Delegate the same task and inputs once to `recommended_profile`. Mark it as the single escalated retry and wait for completion.
3. Never escalate more than one class or more than once for a logical task. Ignore any further escalation request from the retry.
4. Never select `max` or invent a profile. If the recommended profile is unavailable, continue with the baseline result or report the real blocker.

The parent orchestrator owns dispatch and escalation. A child must never spawn its own replacement or recursively delegate the same logical task.
