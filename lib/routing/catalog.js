const GROUPS = Object.freeze({
  ROOT: [
    'reversa',
    'reversa-autonomous',
    'reversa-brainstorm',
    'reversa-debugger',
    'reversa-docs',
    'reversa-forward',
    'reversa-migrate',
    'reversa-new',
    'reversa-refactor',
  ],
  T0: [
    'reversa-agents-help',
    'reversa-clarify',
    'reversa-debugger-graph',
    'reversa-explorer',
    'reversa-image-prompt-json',
    'reversa-pricing-size',
    'reversa-scout',
    'reversa-standardize',
  ],
  T1: [
    'reversa-add',
    'reversa-arquitetura-3d',
    'reversa-coding',
    'reversa-docs-mapper',
    'reversa-docs-publisher',
    'reversa-docs-storyteller',
    'reversa-drafter',
    'reversa-especialista-d3',
    'reversa-highcharts-visualizer',
    'reversa-ideator',
    'reversa-n8n',
    'reversa-plan',
    'reversa-pre-spec',
    'reversa-pricing-estimate',
    'reversa-pricing-profile',
    'reversa-principles',
    'reversa-prune',
    'reversa-reconstructor',
    'reversa-requirements',
    'reversa-resume',
    'reversa-selo-generativo',
    'reversa-simplify',
    'reversa-spec-sdd',
    'reversa-sync',
    'reversa-to-do',
    'reversa-visor',
    'reversa-writer',
  ],
  T2: [
    'reversa-archaeologist',
    'reversa-audit',
    'reversa-curator',
    'reversa-data-master',
    'reversa-decouple',
    'reversa-design-system',
    'reversa-detective',
    'reversa-docs-analyst',
    'reversa-extract-soul',
    'reversa-framer',
    'reversa-inspector',
    'reversa-modularize',
    'reversa-optimize',
    'reversa-paradigm-advisor',
    'reversa-quality',
    'reversa-researcher',
    'reversa-reviewer',
    'reversa-restructure',
    'reversa-screen-translator',
    'reversa-strategist',
  ],
  T3: [
    'reversa-arbiter',
    'reversa-architect',
    'reversa-challenger',
    'reversa-debugger-debate',
    'reversa-debugger-fix',
    'reversa-depth-inspection',
    'reversa-designer',
  ],
});
const READ_ONLY_AGENTS = new Set(['reversa-agents-help']);

export const COMPUTE_CLASSES = Object.freeze(Object.keys(GROUPS));

export const AGENT_CATALOG = Object.freeze(Object.fromEntries(
  Object.entries(GROUPS).flatMap(([computeClass, agentIds]) =>
    agentIds.map((id) => [id, Object.freeze({
      computeClass,
      // Read-only is opt-in only for roles proven not to create Reversa artifacts.
      readOnly: READ_ONLY_AGENTS.has(id),
    })])
  )
));

export function assertCompleteCatalog(agentIds) {
  const unknown = agentIds.filter((id) => !AGENT_CATALOG[id]);
  if (unknown.length > 0) {
    throw new Error(`Unclassified Reversa agent(s): ${unknown.join(', ')}`);
  }
}

export function listAgentCatalog() {
  return Object.entries(AGENT_CATALOG)
    .map(([id, metadata]) => ({ id, ...metadata }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
