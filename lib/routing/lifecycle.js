import { installClaudeProfiles } from '../claude/profiles.js';
import { installCodexProfiles } from '../codex/profiles.js';
import { loadRoutingPolicy } from './policy.js';

const ADAPTERS = Object.freeze({
  'claude-code': Object.freeze({ policyEngine: 'claude', install: installClaudeProfiles }),
  codex: Object.freeze({ policyEngine: 'codex', install: installCodexProfiles }),
});

export const ROUTED_ENGINE_IDS = Object.freeze(Object.keys(ADAPTERS));

export function validateModelRouting(projectRoot, engineIds, agentIds) {
  for (const engineId of engineIds) {
    const adapter = ADAPTERS[engineId];
    if (adapter) loadRoutingPolicy(projectRoot, agentIds, adapter.policyEngine);
  }
}

export function installModelRoutingProfiles(writer, engineIds, agentIds, manifest = {}) {
  const results = {};
  for (const engineId of engineIds) {
    const adapter = ADAPTERS[engineId];
    if (adapter) results[engineId] = adapter.install(writer, agentIds, manifest);
  }
  return results;
}
