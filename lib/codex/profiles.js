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

function isCodexProfile(path) {
  return path === ROOT_PROFILE_PATH || (path.startsWith(PROFILE_PREFIX) && path.endsWith('.toml'));
}

function renderProfile(agent, capabilities) {
  const profile = [
    `name = ${JSON.stringify(agent.id)}`,
    `description = ${JSON.stringify(readAgentDescription(agent.id))}`,
  ];
  if (capabilities.model_override) profile.push(`model = ${JSON.stringify(agent.model)}`);
  if (capabilities.reasoning_override) {
    profile.push(`model_reasoning_effort = ${JSON.stringify(agent.effort)}`);
  }
  if (capabilities.sandbox_override && agent.readOnly) profile.push('sandbox_mode = "read-only"');
  profile.push(
    'developer_instructions = """',
    `You are the Codex execution profile for the Reversa skill ${agent.id}.`,
    `Before acting, read .agents/skills/${agent.id}/SKILL.md completely and follow it exactly.`,
    'The installed SKILL.md is the semantic source of truth; do not recreate or weaken its instructions here.',
    '',
    `Your baseline compute class is ${agent.computeClass}. If the task materially exceeds that class, report this contract to the parent orchestrator:`,
    'compute_escalation:',
    '  required: true',
    '  recommended_class: <next class only>',
    '  reason: <specific evidence-backed reason>',
    '  max_auto_escalations_for_task: 1',
    'Never recommend max reasoning automatically. Do not create recursive escalation loops.',
    '"""',
    '',
  );
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

  const profiles = routing.agents.map((agent) => ({
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
  const profiles = routing.agents.map((agent) => {
    const path = relativePath('.codex', 'agents', `${agent.id}.toml`);
    const status = inspectProfileStatus(projectRoot, path, manifest, routing.profileGenerationEnabled);
    return { ...agent, relativePath: path, status };
  });
  return { ...routing, profiles };
}
