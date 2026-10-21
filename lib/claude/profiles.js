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

const LOCK_REL_PATH = '.reversa/_config/claude-routing.lock.json';
const PROFILE_PREFIX = '.claude/agents/reversa-';
const ROOT_PROFILE_PATH = '.claude/agents/reversa.md';

function isClaudeProfile(path) {
  return path === ROOT_PROFILE_PATH || (path.startsWith(PROFILE_PREFIX) && path.endsWith('.md'));
}

function renderProfile(agent, capabilities) {
  const frontmatter = [
    '---',
    `name: ${agent.id}`,
    `description: ${JSON.stringify(readAgentDescription(agent.id))}`,
  ];
  if (capabilities.model_override) frontmatter.push(`model: ${agent.model}`);
  if (capabilities.effort_override) frontmatter.push(`effort: ${agent.effort}`);
  if (capabilities.permission_override && agent.readOnly) frontmatter.push('permissionMode: plan');
  if (capabilities.skill_preload) frontmatter.push('skills:', `  - ${agent.id}`);
  frontmatter.push('---', '');

  const body = [
    `You are the Claude Code execution profile for the Reversa skill ${agent.id}.`,
    `Use the preloaded ${agent.id} skill as the semantic source of truth. If it was not preloaded, read .claude/skills/${agent.id}/SKILL.md completely; fall back to .agents/skills/${agent.id}/SKILL.md.`,
    'Do not recreate or weaken the installed skill instructions in this profile.',
    '',
    `Your baseline compute class is ${agent.computeClass}. If the task materially exceeds that class, report this contract to the parent orchestrator:`,
    'compute_escalation:',
    '  required: true',
    '  recommended_class: <next class only>',
    '  reason: <specific evidence-backed reason>',
    '  max_auto_escalations_for_task: 1',
    'Never recommend max effort automatically. Do not create recursive escalation loops.',
    '',
  ];
  return `${[...frontmatter, ...body].join('\n')}\n`;
}

export function installClaudeProfiles(writer, agentIds, manifest = {}) {
  const routing = loadRoutingPolicy(writer.projectRoot, agentIds, 'claude');
  ensureProjectPolicy(writer, manifest, routing.defaultsText);
  if (!routing.enabled) {
    const removed = removeManagedProfiles(writer, manifest, isClaudeProfile);
    removeManagedFile(writer, manifest, LOCK_REL_PATH);
    return { enabled: false, profileGenerationEnabled: false, profiles: [], removed, routing };
  }

  const profiles = routing.agents.map((agent) => ({
    ...agent,
    relativePath: relativePath('.claude', 'agents', `${agent.id}.md`),
    status: routing.profileGenerationEnabled ? 'missing' : 'disabled',
  }));
  if (!routing.profileGenerationEnabled) {
    const removed = removeManagedProfiles(writer, manifest, isClaudeProfile);
    const lock = writeRoutingLock(writer, manifest, LOCK_REL_PATH, routing, profiles);
    return { enabled: true, profileGenerationEnabled: false, profiles, removed, routing, lock };
  }

  const targetPaths = new Set(profiles.map((profile) => profile.relativePath));
  const materializedProfiles = profiles.map((agent) => ({
    ...agent,
    ...writeManagedFile(writer, manifest, agent.relativePath, renderProfile(agent, routing.capabilities)),
  }));
  const removed = removeManagedProfiles(writer, manifest, isClaudeProfile, targetPaths);
  const lock = writeRoutingLock(writer, manifest, LOCK_REL_PATH, routing, materializedProfiles);
  return { enabled: true, profileGenerationEnabled: true, profiles: materializedProfiles, removed, routing, lock };
}

export function inspectClaudeProfiles(projectRoot, agentIds, manifest = {}) {
  const routing = loadRoutingPolicy(projectRoot, agentIds, 'claude');
  const profiles = routing.agents.map((agent) => {
    const path = relativePath('.claude', 'agents', `${agent.id}.md`);
    const status = inspectProfileStatus(projectRoot, path, manifest, routing.profileGenerationEnabled);
    return { ...agent, relativePath: path, status };
  });
  return { ...routing, profiles };
}
