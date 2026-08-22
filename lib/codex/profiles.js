import { loadRoutingPolicy } from '../routing/policy.js';
import {
  ensureProjectPolicy,
  inspectProfileStatus,
  readAgentDescription,
  relativePath,
  removeManagedFile,
  removeManagedProfiles,
  writeManagedFile,
  writeRoutingLock,
} from '../routing/managed-profiles.js';

const LOCK_REL_PATH = '.reversa/_config/codex-routing.lock.json';
const PROFILE_PREFIX = '.codex/agents/reversa-';
const ROOT_PROFILE_PATH = '.codex/agents/reversa.toml';
const ESCALATION_CLASSES = Object.freeze(['T0', 'T1', 'T2', 'T3']);

function isCodexProfile(path) {
  return path === ROOT_PROFILE_PATH || (path.startsWith(PROFILE_PREFIX) && path.endsWith('.toml'));
}

function nextComputeClass(computeClass) {
  const index = ESCALATION_CLASSES.indexOf(computeClass);
  return index >= 0 && index < ESCALATION_CLASSES.length - 1
    ? ESCALATION_CLASSES[index + 1]
    : null;
}

function expandProfiles(routing) {
  const baselineIds = new Set(routing.agents.map(({ id }) => id));
  return routing.agents.flatMap((agent) => {
    const nextClass = nextComputeClass(agent.computeClass);
    const escalationId = nextClass ? `${agent.id}-${nextClass.toLowerCase()}` : null;
    const baseline = {
      ...agent,
      skillId: agent.id,
      escalationId,
      escalatedFrom: null,
    };
    if (!nextClass) return [baseline];
    if (baselineIds.has(escalationId)) {
      throw new Error(`Generated Codex escalation profile conflicts with Reversa agent ${escalationId}`);
    }
    const nextRoute = routing.computeRoutes[nextClass];
    return [baseline, {
      ...agent,
      id: escalationId,
      skillId: agent.id,
      computeClass: nextClass,
      model: nextRoute.model,
      effort: nextRoute.effort,
      escalationId: null,
      escalatedFrom: agent.computeClass,
      explicitlyOverridden: false,
    }];
  });
}

function renderProfile(agent, capabilities) {
  const profile = [
    `name = ${JSON.stringify(agent.id)}`,
    `description = ${JSON.stringify(readAgentDescription(agent.skillId))}`,
  ];
  if (capabilities.model_override) profile.push(`model = ${JSON.stringify(agent.model)}`);
  if (capabilities.reasoning_override) {
    profile.push(`model_reasoning_effort = ${JSON.stringify(agent.effort)}`);
  }
  if (capabilities.sandbox_override && agent.readOnly) profile.push('sandbox_mode = "read-only"');
  profile.push(
    'developer_instructions = """',
    `You are the Codex execution profile for the Reversa skill ${agent.skillId}.`,
    'This session is already delegated. Do not delegate the same logical task back to another agent.',
    `Before acting, read .agents/skills/${agent.skillId}/SKILL.md completely and follow it exactly.`,
    'The installed SKILL.md is the semantic source of truth; do not recreate or weaken its instructions here.',
    '',
  );
  if (agent.escalatedFrom) {
    profile.push(
      `This is the single escalated retry from ${agent.escalatedFrom} to ${agent.computeClass}.`,
      'Complete the task or report a blocker. Do not request or start another compute escalation.',
    );
  } else if (agent.escalationId) {
    profile.push(
      `Your baseline compute class is ${agent.computeClass}. If the task materially exceeds that class, finish safely and report this contract to the parent orchestrator:`,
      'compute_escalation:',
      '  required: true',
      `  recommended_class: ${nextComputeClass(agent.computeClass)}`,
      `  recommended_profile: ${agent.escalationId}`,
      '  reason: <specific evidence-backed reason>',
      '  max_auto_escalations_for_task: 1',
      'Do not start the escalated retry yourself. Never recommend max reasoning automatically.',
    );
  } else {
    profile.push(
      `Your compute class is ${agent.computeClass}; no automatic higher class is available.`,
      'Complete the task or report a blocker. Do not request or start a compute escalation.',
    );
  }
  profile.push('"""', '');
  return `${profile.join('\n')}\n`;
}

export function installCodexProfiles(writer, agentIds, manifest = {}) {
  const routing = loadRoutingPolicy(writer.projectRoot, agentIds, 'codex');
  ensureProjectPolicy(writer, manifest, routing.defaultsText);
  if (!routing.enabled) {
    const removed = removeManagedProfiles(writer, manifest, isCodexProfile);
    removeManagedFile(writer, manifest, LOCK_REL_PATH);
    return { enabled: false, profileGenerationEnabled: false, profiles: [], removed, routing };
  }

  const profiles = expandProfiles(routing).map((agent) => ({
    ...agent,
    relativePath: relativePath('.codex', 'agents', `${agent.id}.toml`),
    status: routing.profileGenerationEnabled ? 'missing' : 'disabled',
  }));
  if (!routing.profileGenerationEnabled) {
    const removed = removeManagedProfiles(writer, manifest, isCodexProfile);
    const lock = writeRoutingLock(writer, manifest, LOCK_REL_PATH, routing, profiles);
    return { enabled: true, profileGenerationEnabled: false, profiles, removed, routing, lock };
  }

  const targetPaths = new Set(profiles.map((profile) => profile.relativePath));
  const materializedProfiles = profiles.map((agent) => ({
    ...agent,
    ...writeManagedFile(writer, manifest, agent.relativePath, renderProfile(agent, routing.capabilities)),
  }));
  const removed = removeManagedProfiles(writer, manifest, isCodexProfile, targetPaths);
  const lock = writeRoutingLock(writer, manifest, LOCK_REL_PATH, routing, materializedProfiles);
  return { enabled: true, profileGenerationEnabled: true, profiles: materializedProfiles, removed, routing, lock };
}

export function inspectCodexProfiles(projectRoot, agentIds, manifest = {}) {
  const routing = loadRoutingPolicy(projectRoot, agentIds, 'codex');
  const profiles = expandProfiles(routing).map((agent) => {
    const path = relativePath('.codex', 'agents', `${agent.id}.toml`);
    const status = inspectProfileStatus(projectRoot, path, manifest, routing.profileGenerationEnabled);
    return { ...agent, relativePath: path, status };
  });
  return { ...routing, profiles };
}
