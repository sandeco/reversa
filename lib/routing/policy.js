import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'smol-toml';
import { AGENT_CATALOG, COMPUTE_CLASSES, assertCompleteCatalog } from './catalog.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_POLICY_PATH = resolve(__dirname, '..', '..', 'templates', 'model-routing.toml');
const ROUTABLE_CLASSES = new Set(['T0', 'T1', 'T2', 'T3']);
const DEFAULT_SETTING_KEYS = new Set(['compute_class']);
const ENGINE_SECTION_KEYS = new Set(['enabled', 'orchestrator', 'compute', 'agents', 'capabilities']);

const ENGINE_SPECS = Object.freeze({
  codex: Object.freeze({
    id: 'codex',
    effortKey: 'reasoning',
    effortLevels: new Set(['none', 'low', 'medium', 'high', 'xhigh', 'max', 'ultra']),
    capabilityKeys: new Set(['custom_agents', 'model_override', 'reasoning_override', 'sandbox_override']),
  }),
  claude: Object.freeze({
    id: 'claude',
    effortKey: 'effort',
    effortLevels: new Set(['low', 'medium', 'high', 'xhigh', 'max']),
    capabilityKeys: new Set([
      'custom_agents',
      'model_override',
      'effort_override',
      'permission_override',
      'skill_preload',
    ]),
  }),
});

export const ROUTING_ENGINES = Object.freeze(Object.keys(ENGINE_SPECS));

function engineSpec(engine) {
  const spec = ENGINE_SPECS[engine];
  if (!spec) throw new Error(`Unsupported model-routing engine ${engine}`);
  return spec;
}

function emptyPolicy() {
  return {
    version: undefined,
    defaults: {},
    engine: { enabled: undefined, orchestrator: {}, compute: {}, agents: {}, capabilities: {} },
  };
}

function asTable(value, label) {
  if (value === undefined) return {};
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a TOML table`);
  }
  return value;
}

function assertKnownKeys(table, allowedKeys, label) {
  const unknown = Object.keys(table).filter((key) => !allowedKeys.has(key));
  if (unknown.length > 0) throw new Error(`${label}: unsupported key(s): ${unknown.join(', ')}`);
}

function parseRoutingToml(content, source, spec) {
  let document;
  try {
    document = parse(content);
  } catch (error) {
    throw new Error(`${source}: invalid TOML: ${error.message ?? String(error)}`);
  }

  const defaults = asTable(document.defaults, `${source} [defaults]`);
  const engine = asTable(document[spec.id], `${source} [${spec.id}]`);
  const orchestrator = asTable(engine.orchestrator, `${source} [${spec.id}.orchestrator]`);
  const compute = asTable(engine.compute, `${source} [${spec.id}.compute]`);
  const agents = asTable(engine.agents, `${source} [${spec.id}.agents]`);
  const capabilities = asTable(engine.capabilities, `${source} [${spec.id}.capabilities]`);
  const modelSettingKeys = new Set(['model', spec.effortKey]);
  const agentSettingKeys = new Set(['compute_class', ...modelSettingKeys]);

  assertKnownKeys(defaults, DEFAULT_SETTING_KEYS, `${source} [defaults]`);
  assertKnownKeys(engine, ENGINE_SECTION_KEYS, `${source} [${spec.id}]`);
  assertKnownKeys(orchestrator, modelSettingKeys, `${source} [${spec.id}.orchestrator]`);
  assertKnownKeys(capabilities, spec.capabilityKeys, `${source} [${spec.id}.capabilities]`);

  for (const [computeClass, settings] of Object.entries(compute)) {
    if (!ROUTABLE_CLASSES.has(computeClass)) {
      throw new Error(`${source}: unknown compute class ${computeClass}`);
    }
    assertKnownKeys(
      asTable(settings, `${source} [${spec.id}.compute.${computeClass}]`),
      modelSettingKeys,
      `${source} [${spec.id}.compute.${computeClass}]`,
    );
  }
  for (const [agentId, settings] of Object.entries(agents)) {
    assertKnownKeys(
      asTable(settings, `${source} [${spec.id}.agents.${agentId}]`),
      agentSettingKeys,
      `${source} [${spec.id}.agents.${agentId}]`,
    );
  }

  return {
    version: document.version,
    defaults,
    engine: {
      enabled: engine.enabled,
      orchestrator,
      compute,
      agents,
      capabilities,
    },
  };
}

function mergePolicy(base, override) {
  const merged = structuredClone(base);
  if (override.version !== undefined) merged.version = override.version;
  Object.assign(merged.defaults, override.defaults);
  if (override.engine.enabled !== undefined) merged.engine.enabled = override.engine.enabled;
  Object.assign(merged.engine.orchestrator, override.engine.orchestrator);
  Object.assign(merged.engine.capabilities, override.engine.capabilities);
  for (const [computeClass, values] of Object.entries(override.engine.compute)) {
    merged.engine.compute[computeClass] = { ...(merged.engine.compute[computeClass] ?? {}), ...values };
  }
  for (const [agentId, values] of Object.entries(override.engine.agents)) {
    merged.engine.agents[agentId] = { ...(merged.engine.agents[agentId] ?? {}), ...values };
  }
  return merged;
}

function validateModelSettings(settings, label, spec) {
  if (typeof settings.model !== 'string' || settings.model.trim() === '') {
    throw new Error(`${label}: model must be a non-empty string`);
  }
  if (!spec.effortLevels.has(settings[spec.effortKey])) {
    throw new Error(`${label}: invalid ${spec.effortKey} level ${String(settings[spec.effortKey])}`);
  }
}

function validateCapabilities(capabilities, spec) {
  for (const capability of spec.capabilityKeys) {
    if (typeof capabilities[capability] !== 'boolean') {
      throw new Error(`${spec.id}.capabilities.${capability} must be true or false`);
    }
  }
}

function validateAgentOverrides(agentOverrides, spec) {
  for (const [agentId, override] of Object.entries(agentOverrides)) {
    if (!AGENT_CATALOG[agentId]) throw new Error(`Unknown Reversa agent override ${agentId}`);
    if (override.compute_class !== undefined && !COMPUTE_CLASSES.includes(override.compute_class)) {
      throw new Error(`Unknown compute class ${override.compute_class} for ${agentId}`);
    }
    if (override.model !== undefined && (typeof override.model !== 'string' || override.model.trim() === '')) {
      throw new Error(`${agentId}: model must be a non-empty string`);
    }
    const effort = override[spec.effortKey];
    if (effort !== undefined && !spec.effortLevels.has(effort)) {
      throw new Error(`${agentId}: invalid ${spec.effortKey} level ${effort}`);
    }
  }
}

function validatePolicy(policy, spec) {
  if (policy.version !== 1) throw new Error(`Unsupported model routing version ${String(policy.version)}`);
  if (!ROUTABLE_CLASSES.has(policy.defaults.compute_class)) {
    throw new Error(`Unknown default compute class ${String(policy.defaults.compute_class)}`);
  }
  if (typeof policy.engine.enabled !== 'boolean') {
    throw new Error(`${spec.id}.enabled must be true or false`);
  }
  validateCapabilities(policy.engine.capabilities, spec);
  validateModelSettings(policy.engine.orchestrator, `${spec.id}.orchestrator`, spec);
  for (const computeClass of ROUTABLE_CLASSES) {
    validateModelSettings(policy.engine.compute[computeClass] ?? {}, `${spec.id}.compute.${computeClass}`, spec);
  }
  validateAgentOverrides(policy.engine.agents, spec);
}

function countDifferences(base, override) {
  let count = 0;
  const visit = (left, right) => {
    for (const [key, value] of Object.entries(right ?? {})) {
      if (value === undefined) continue;
      if (value && typeof value === 'object' && !Array.isArray(value)) visit(left?.[key] ?? {}, value);
      else if (left?.[key] !== value) count++;
    }
  };
  visit(base, override);
  return count;
}

function readPolicyFile(path, spec) {
  return existsSync(path) ? parseRoutingToml(readFileSync(path, 'utf8'), path, spec) : emptyPolicy();
}

export function loadRoutingPolicy(projectRoot, agentIds, engine = 'codex') {
  const spec = engineSpec(engine);
  assertCompleteCatalog(agentIds);
  const defaultsText = readFileSync(DEFAULT_POLICY_PATH, 'utf8');
  const defaults = parseRoutingToml(defaultsText, DEFAULT_POLICY_PATH, spec);
  const projectPolicy = readPolicyFile(join(projectRoot, '.reversa', 'model-routing.toml'), spec);
  const userPolicy = readPolicyFile(join(projectRoot, '.reversa', 'config.user.toml'), spec);
  const projectMerged = mergePolicy(defaults, projectPolicy);
  const resolvedPolicy = mergePolicy(projectMerged, userPolicy);
  validatePolicy(resolvedPolicy, spec);

  const capabilities = Object.fromEntries(
    [...spec.capabilityKeys].map((capability) => [capability, resolvedPolicy.engine.capabilities[capability]]),
  );
  const computeRoutes = Object.fromEntries(
    [...ROUTABLE_CLASSES].map((computeClass) => {
      const settings = resolvedPolicy.engine.compute[computeClass];
      return [computeClass, {
        model: settings.model,
        effort: settings[spec.effortKey],
      }];
    }),
  );
  const agents = agentIds.map((agentId) => {
    const catalogEntry = AGENT_CATALOG[agentId];
    const explicit = resolvedPolicy.engine.agents[agentId] ?? {};
    const computeClass = explicit.compute_class ?? catalogEntry.computeClass
      ?? resolvedPolicy.defaults.compute_class;
    const baseSettings = computeClass === 'ROOT'
      ? resolvedPolicy.engine.orchestrator
      : resolvedPolicy.engine.compute[computeClass];
    const settings = {
      model: explicit.model ?? baseSettings.model,
      effort: explicit[spec.effortKey] ?? baseSettings[spec.effortKey],
    };
    validateModelSettings({ model: settings.model, [spec.effortKey]: settings.effort }, agentId, spec);
    return {
      id: agentId,
      computeClass,
      model: settings.model,
      effort: settings.effort,
      readOnly: catalogEntry.readOnly,
      explicitlyOverridden: Object.keys(explicit).length > 0,
    };
  });

  return {
    engine: spec.id,
    version: resolvedPolicy.version,
    enabled: resolvedPolicy.engine.enabled,
    capabilities,
    computeRoutes,
    profileGenerationEnabled: resolvedPolicy.engine.enabled && capabilities.custom_agents,
    agents,
    overrides: {
      project: countDifferences(defaults, projectPolicy),
      user: countDifferences(projectMerged, userPolicy),
      agent: Object.keys(resolvedPolicy.engine.agents).length,
    },
    runtimeVerification: 'unavailable',
    defaultsText,
  };
}
