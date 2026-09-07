import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AGENT_CATALOG, assertCompleteCatalog } from '../lib/routing/catalog.js';
import { installCodexProfiles } from '../lib/codex/profiles.js';
import { loadRoutingPolicy } from '../lib/routing/policy.js';
import { buildManifest, loadManifest, saveManifest } from '../lib/installer/manifest.js';
import { Writer } from '../lib/installer/writer.js';
import { buildUninstallPlan, removeManagedArtifacts } from '../lib/commands/uninstall.js';
import modelsCommand from '../lib/commands/models.js';
import { parse } from 'smol-toml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const allAgents = readdirSync(join(repoRoot, 'agents'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

assert.equal(allAgents.length, 72, 'expected the complete Reversa agent inventory');
assertCompleteCatalog(allAgents);
assert.deepEqual(Object.keys(AGENT_CATALOG).sort(), allAgents, 'catalog must classify every agent exactly once');

const expectedClassGroups = {
  ROOT: [
    'reversa', 'reversa-autonomous', 'reversa-brainstorm', 'reversa-debugger',
    'reversa-docs', 'reversa-forward', 'reversa-migrate', 'reversa-new', 'reversa-refactor',
  ],
  T0: [
    'reversa-agents-help', 'reversa-clarify', 'reversa-debugger-graph', 'reversa-explorer',
    'reversa-image-prompt-json', 'reversa-pricing-size', 'reversa-scout', 'reversa-standardize',
  ],
  T1: [
    'reversa-add', 'reversa-arquitetura-3d', 'reversa-coding', 'reversa-docs-mapper',
    'reversa-docs-publisher', 'reversa-docs-storyteller', 'reversa-drafter',
    'reversa-especialista-d3', 'reversa-highcharts-visualizer', 'reversa-ideator', 'reversa-n8n',
    'reversa-plan', 'reversa-pre-spec', 'reversa-pricing-estimate', 'reversa-pricing-profile',
    'reversa-principles', 'reversa-prune', 'reversa-reconstructor', 'reversa-requirements',
    'reversa-resume', 'reversa-selo-generativo', 'reversa-simplify', 'reversa-spec-sdd',
    'reversa-sync', 'reversa-to-do', 'reversa-visor', 'reversa-writer',
  ],
  T2: [
    'reversa-archaeologist', 'reversa-audit', 'reversa-curator', 'reversa-data-master',
    'reversa-decouple', 'reversa-design-system', 'reversa-detective', 'reversa-debugger-review', 'reversa-docs-analyst',
    'reversa-extract-soul', 'reversa-framer', 'reversa-inspector', 'reversa-modularize',
    'reversa-optimize', 'reversa-paradigm-advisor', 'reversa-quality', 'reversa-researcher',
    'reversa-reviewer', 'reversa-restructure', 'reversa-screen-translator', 'reversa-strategist',
  ],
  T3: [
    'reversa-arbiter', 'reversa-architect', 'reversa-challenger', 'reversa-debugger-debate',
    'reversa-debugger-fix', 'reversa-depth-inspection', 'reversa-designer',
  ],
};
const expectedClassByAgent = Object.fromEntries(
  Object.entries(expectedClassGroups).flatMap(([computeClass, ids]) => ids.map((id) => [id, computeClass])),
);
assert.deepEqual(
  Object.fromEntries(Object.entries(AGENT_CATALOG).map(([id, metadata]) => [id, metadata.computeClass])),
  expectedClassByAgent,
  'the complete 72-agent default classification is an explicit compatibility contract',
);

const fixture = mkdtempSync(join(tmpdir(), 'reversa-codex-routing-'));
try {
  mkdirSync(join(fixture, '.reversa', '_config'), { recursive: true });
  mkdirSync(join(fixture, '.codex', 'agents'), { recursive: true });
  mkdirSync(join(fixture, '.claude'), { recursive: true });
  const configPath = join(fixture, '.codex', 'config.toml');
  const customAgentPath = join(fixture, '.codex', 'agents', 'custom-user-agent.toml');
  const conflictPath = join(fixture, '.codex', 'agents', 'reversa-architect.toml');
  const userConfigPath = join(fixture, '.reversa', 'config.user.toml');
  const otherEnginePath = join(fixture, '.claude', 'user-owned.md');
  const existingConfig = '[agents]\nmax_concurrent_threads_per_session = 3\n';
  const customAgent = 'name = "custom-user-agent"\n';
  const userOwnedConflict = 'name = "reversa-architect"\n# user owned\n';
  writeFileSync(configPath, existingConfig, 'utf8');
  writeFileSync(customAgentPath, customAgent, 'utf8');
  writeFileSync(conflictPath, userOwnedConflict, 'utf8');
  writeFileSync(otherEnginePath, 'user-owned Claude artifact\n', 'utf8');
  writeFileSync(userConfigPath, '# personal overrides\n', 'utf8');
  writeFileSync(join(fixture, '.reversa', 'state.json'), JSON.stringify({
    engines: ['codex'],
    agents: allAgents,
    created_files: [],
  }, null, 2), 'utf8');

  const firstWriter = new Writer(fixture);
  const first = installCodexProfiles(firstWriter, allAgents, {});
  firstWriter.saveManifest();

  assert.equal(first.enabled, true);
  assert.equal(
    Object.keys(loadManifest(fixture)).some((path) => path.includes('\\')),
    false,
    'managed manifest keys must be platform-neutral',
  );
  assert.equal(first.profiles.length, 128);
  for (const profile of first.profiles.filter(({ status }) => status !== 'user-owned')) {
    const document = parse(readFileSync(join(fixture, profile.relativePath), 'utf8'));
    assert.equal(document.name, profile.id);
    assert.equal(typeof document.developer_instructions, 'string');
  }
  assert.equal(first.profiles.find((profile) => profile.id === 'reversa-architect').status, 'user-owned');
  assert.equal(readFileSync(configPath, 'utf8'), existingConfig, '.codex/config.toml must remain byte-for-byte');
  assert.equal(readFileSync(customAgentPath, 'utf8'), customAgent, 'custom agents must remain byte-for-byte');
  assert.equal(readFileSync(conflictPath, 'utf8'), userOwnedConflict, 'conflicting user profile must be preserved');
  assert.equal(readFileSync(otherEnginePath, 'utf8'), 'user-owned Claude artifact\n', 'other engines stay untouched');

  const expected = {
    reversa: ['ROOT', 'gpt-5.6-sol', 'high'],
    'reversa-scout': ['T0', 'gpt-5.6-luna', 'low'],
    'reversa-coding': ['T1', 'gpt-5.6-terra', 'medium'],
    'reversa-detective': ['T2', 'gpt-5.6-sol', 'high'],
    'reversa-debugger-review': ['T2', 'gpt-5.6-sol', 'high'],
    'reversa-architect': ['T3', 'gpt-5.6-sol', 'xhigh'],
  };
  const defaultRouting = loadRoutingPolicy(fixture, allAgents);
  for (const [agentId, values] of Object.entries(expected)) {
    const route = defaultRouting.agents.find((agent) => agent.id === agentId);
    assert.deepEqual([route.computeClass, route.model, route.effort], values, `${agentId} default route`);
  }

  const managedProfilePath = join(fixture, '.codex', 'agents', 'reversa-scout.toml');
  const escalatedScoutPath = join(fixture, '.codex', 'agents', 'reversa-scout-t1.toml');
  const baselineScout = readFileSync(managedProfilePath, 'utf8');
  const escalatedScout = readFileSync(escalatedScoutPath, 'utf8');
  assert.match(baselineScout, /recommended_profile: reversa-scout-t1/);
  assert.match(baselineScout, /This session is already delegated/);
  assert.match(escalatedScout, /name = "reversa-scout-t1"/);
  assert.match(escalatedScout, /model = "gpt-5\.6-terra"/);
  assert.match(escalatedScout, /model_reasoning_effort = "medium"/);
  assert.match(escalatedScout, /\.agents\/skills\/reversa-scout\/SKILL\.md/);
  assert.doesNotMatch(escalatedScout, /compute_escalation:/);
  assert.equal(
    existsSync(join(fixture, '.codex', 'agents', 'reversa-architect-t4.toml')),
    false,
    'T3 agents must not receive an automatic escalation profile',
  );
  const reviewProfilePath = join(fixture, '.codex', 'agents', 'reversa-debugger-review.toml');
  assert.match(readFileSync(reviewProfilePath, 'utf8'), /sandbox_mode = "read-only"/);
  assert.equal(
    existsSync(join(fixture, '.codex', 'agents', 'reversa-debugger-review-t3.toml')),
    false,
    'the independent reviewer must not receive an automatic escalation profile',
  );
  const beforeSecondInstall = readFileSync(managedProfilePath, 'utf8');
  const secondWriter = new Writer(fixture);
  installCodexProfiles(secondWriter, allAgents, loadManifest(fixture));
  assert.equal(readFileSync(managedProfilePath, 'utf8'), beforeSecondInstall, 'reinstall must be idempotent');
  assert.equal(readFileSync(configPath, 'utf8'), existingConfig);
  assert.equal(readFileSync(customAgentPath, 'utf8'), customAgent);

  writeFileSync(userConfigPath, [
    '[codex.compute.T0]',
    "reasoning = 'medium'",
    '',
    '[codex.agents."reversa-coding"]',
    'compute_class = "T2"',
    '',
  ].join('\n'), 'utf8');
  const overridden = loadRoutingPolicy(fixture, allAgents);
  assert.equal(overridden.agents.find((agent) => agent.id === 'reversa-scout').effort, 'medium');
  assert.equal(overridden.agents.find((agent) => agent.id === 'reversa-coding').computeClass, 'T2');
  const overrideWriter = new Writer(fixture);
  installCodexProfiles(overrideWriter, allAgents, loadManifest(fixture));
  overrideWriter.saveManifest(loadManifest(fixture));
  assert.match(readFileSync(managedProfilePath, 'utf8'), /model_reasoning_effort = "medium"/);

  writeFileSync(userConfigPath, [
    '[codex.capabilities]',
    'model_override = false',
    'reasoning_override = false',
    'sandbox_override = false',
    '',
  ].join('\n'), 'utf8');
  const inherited = loadRoutingPolicy(fixture, allAgents);
  assert.equal(inherited.capabilities.model_override, false);
  assert.equal(inherited.capabilities.reasoning_override, false);
  assert.equal(inherited.capabilities.sandbox_override, false);
  const inheritWriter = new Writer(fixture);
  installCodexProfiles(inheritWriter, allAgents, loadManifest(fixture));
  inheritWriter.saveManifest(loadManifest(fixture));
  assert.doesNotMatch(readFileSync(managedProfilePath, 'utf8'), /^model = /m);
  assert.doesNotMatch(readFileSync(managedProfilePath, 'utf8'), /^model_reasoning_effort = /m);
  const helpProfilePath = join(fixture, '.codex', 'agents', 'reversa-agents-help.toml');
  assert.doesNotMatch(readFileSync(helpProfilePath, 'utf8'), /^sandbox_mode = /m);

  const previousCwd = process.cwd();
  const originalLog = console.log;
  const modelOutput = [];
  try {
    process.chdir(fixture);
    console.log = (...args) => modelOutput.push(args.join(' '));
    await modelsCommand(['--json']);
  } finally {
    console.log = originalLog;
    process.chdir(previousCwd);
  }
  const modelDiagnostics = JSON.parse(modelOutput.join('\n'));
  const codexDiagnostics = modelDiagnostics.engines.codex;
  assert.equal(codexDiagnostics.configured, true);
  assert.equal(codexDiagnostics.profile_generation_enabled, true);
  assert.equal(modelDiagnostics.runtime_verification, 'unavailable');
  assert.equal(codexDiagnostics.capabilities.model_override, false);
  assert.equal(codexDiagnostics.agents.length, 128);
  const escalatedDiagnostic = codexDiagnostics.agents.find((agent) => agent.agent === 'reversa-scout-t1');
  assert.equal(escalatedDiagnostic.skill, 'reversa-scout');
  assert.equal(escalatedDiagnostic.escalated_from, 'T0');

  const humanModelOutput = [];
  try {
    process.chdir(fixture);
    console.log = (...args) => humanModelOutput.push(args.join(' '));
    await modelsCommand([]);
  } finally {
    console.log = originalLog;
    process.chdir(previousCwd);
  }
  assert.match(humanModelOutput.join('\n'), /configured/i);
  assert.match(humanModelOutput.join('\n'), /runtime verification unavailable/i);
  const agentsContract = readFileSync(join(repoRoot, 'templates', 'engines', 'AGENTS.md'), 'utf8');
  assert.match(agentsContract, /portable profile dispatch/i);
  assert.match(agentsContract, /spawn_agent/);
  assert.match(agentsContract, /fork_turns: "none"/);
  assert.match(agentsContract, /nunca use `"all"` nem uma contagem numérica/i);
  assert.match(agentsContract, /handoff limitado a 4\.000 tokens/i);
  assert.match(agentsContract, /máximo 2\.000 tokens/i);
  assert.match(agentsContract, /Limite de sessão e prevenção de compactação/i);
  assert.match(agentsContract, /dez iterações de modelo/i);
  assert.match(agentsContract, /cache hit abaixo de 90%/i);
  assert.match(agentsContract, /duas ou mais chamadas individuais abaixo de 20%/i);
  assert.match(agentsContract, /Agrupe leituras, buscas, logs e contagens independentes/i);
  assert.match(agentsContract, /não inicie um `codex exec` aninhado/i);
  assert.match(agentsContract, /uma única vez por tarefa lógica/i);
  assert.match(agentsContract, /recommended_profile/);
  const routingContract = readFileSync(
    join(repoRoot, 'agents', 'reversa', 'references', 'codex-routing.md'),
    'utf8',
  );
  assert.match(routingContract, /Native project custom agent/);
  assert.match(routingContract, /Portable profile dispatch/);
  assert.match(routingContract, /spawn_agent/);
  assert.match(routingContract, /fork_turns: "none"/);
  assert.match(routingContract, /never use `"all"` or a numeric turn count/i);
  assert.match(routingContract, /at or below 4,000 tokens/i);
  assert.match(routingContract, /at most 2,000 tokens/i);
  assert.match(routingContract, /Session budget and compaction avoidance/);
  assert.match(routingContract, /soft budget of ten model iterations/i);
  assert.match(routingContract, /do not split a narrow, healthy session solely because of its call count/i);
  assert.match(routingContract, /cache-hit ratio below 90%/i);
  assert.match(routingContract, /two or more individual calls below 20% cache hit/i);
  assert.match(routingContract, /Batch independent reads, searches, log aggregations, and static counts/i);
  assert.match(routingContract, /Do not reconstruct the parent transcript/i);
  assert.match(routingContract, /followup_task/);
  assert.match(routingContract, /Do not start a nested standalone `codex exec`/);
  assert.match(routingContract, /no thread with id/);
  assert.match(routingContract, /one logical task at a time/);
  assert.match(routingContract, /Entrypoint bootstrap/);
  assert.match(routingContract, /whole flow once/);
  const orchestratorSkills = allAgents.filter((agentId) => {
    const skill = readFileSync(join(repoRoot, 'agents', agentId, 'SKILL.md'), 'utf8');
    return /^\s*role:\s*orchestrator\s*$/m.test(skill);
  });
  assert.equal(orchestratorSkills.length, 9);
  for (const agentId of orchestratorSkills) {
    const skill = readFileSync(join(repoRoot, 'agents', agentId, 'SKILL.md'), 'utf8');
    assert.match(skill, /reversa\/references\/codex-routing\.md|references\/codex-routing\.md/);
  }

  writeFileSync(userConfigPath, '[codex.capabilities]\ncustom_agents = false\n', 'utf8');
  const noCustomAgents = loadRoutingPolicy(fixture, allAgents);
  assert.equal(noCustomAgents.profileGenerationEnabled, false);
  const noCustomAgentsWriter = new Writer(fixture);
  const noCustomAgentProfiles = installCodexProfiles(noCustomAgentsWriter, allAgents, loadManifest(fixture));
  noCustomAgentsWriter.saveManifest(loadManifest(fixture));
  assert.equal(noCustomAgentProfiles.enabled, true);
  assert.equal(noCustomAgentProfiles.profileGenerationEnabled, false);
  assert.equal(existsSync(managedProfilePath), false, 'managed profiles should be removed when custom agents are disabled');
  assert.equal(existsSync(escalatedScoutPath), false, 'managed escalation profiles should also be removed');
  const capabilityLock = JSON.parse(readFileSync(join(fixture, '.reversa', '_config', 'codex-routing.lock.json'), 'utf8'));
  assert.equal(capabilityLock.profile_generation_enabled, false);
  assert.equal(capabilityLock.capabilities.custom_agents, false);
  assert.equal(
    loadManifest(fixture)['.codex/agents/reversa-scout.toml'],
    undefined,
    'shared manifest reconciliation removes deleted managed profiles',
  );
  assert.equal(readFileSync(conflictPath, 'utf8'), userOwnedConflict, 'user-owned Reversa-named profile must survive custom-agent disable');

  writeFileSync(userConfigPath, '# personal overrides\n', 'utf8');
  const restoreWriter = new Writer(fixture);
  installCodexProfiles(restoreWriter, allAgents, loadManifest(fixture));
  restoreWriter.saveManifest(loadManifest(fixture));

  const beforeInvalid = readFileSync(managedProfilePath, 'utf8');
  writeFileSync(userConfigPath, '[codex.compute.T0]\nreasoning = "impossible"\n', 'utf8');
  assert.throws(
    () => installCodexProfiles(new Writer(fixture), allAgents, loadManifest(fixture)),
    /invalid reasoning level/,
  );
  assert.equal(readFileSync(managedProfilePath, 'utf8'), beforeInvalid, 'invalid config must not mutate profiles');

  writeFileSync(userConfigPath, '[codex.compute.T0\nreasoning = "medium"\n', 'utf8');
  assert.throws(
    () => installCodexProfiles(new Writer(fixture), allAgents, loadManifest(fixture)),
    /invalid TOML/,
  );
  assert.equal(readFileSync(managedProfilePath, 'utf8'), beforeInvalid, 'malformed TOML must not mutate profiles');

  writeFileSync(userConfigPath, '[codex]\nenabled = false\n', 'utf8');
  const disabledWriter = new Writer(fixture);
  const disabled = installCodexProfiles(disabledWriter, allAgents, loadManifest(fixture));
  assert.equal(disabled.enabled, false);
  assert.equal(existsSync(managedProfilePath), false, 'managed profiles should be removed when routing is disabled');
  assert.equal(existsSync(join(fixture, '.codex', 'agents', 'reversa.toml')), false, 'managed ROOT profile removed');
  assert.equal(readFileSync(conflictPath, 'utf8'), userOwnedConflict, 'user-owned Reversa-named profile must survive disable');
  assert.equal(readFileSync(configPath, 'utf8'), existingConfig);
  assert.equal(readFileSync(customAgentPath, 'utf8'), customAgent);
  assert.equal(readFileSync(otherEnginePath, 'utf8'), 'user-owned Claude artifact\n');

  const uninstallFixture = join(fixture, 'uninstall-case');
  mkdirSync(join(uninstallFixture, '.codex', 'agents'), { recursive: true });
  mkdirSync(join(uninstallFixture, '.reversa', '_config'), { recursive: true });
  const intactProfile = '.codex/agents/reversa-scout.toml';
  const modifiedProfile = '.codex/agents/reversa-writer.toml';
  const userProfile = join(uninstallFixture, '.codex', 'agents', 'custom-user-agent.toml');
  const userCodexConfig = join(uninstallFixture, '.codex', 'config.toml');
  writeFileSync(join(uninstallFixture, intactProfile), 'managed scout\n', 'utf8');
  writeFileSync(join(uninstallFixture, modifiedProfile), 'managed writer\n', 'utf8');
  writeFileSync(userProfile, customAgent, 'utf8');
  writeFileSync(userCodexConfig, existingConfig, 'utf8');
  const uninstallManifest = buildManifest(uninstallFixture, [intactProfile, modifiedProfile]);
  writeFileSync(join(uninstallFixture, modifiedProfile), 'user modified writer\n', 'utf8');
  saveManifest(uninstallFixture, uninstallManifest);
  const uninstallState = {
    created_files: [intactProfile, modifiedProfile],
  };
  const uninstallPlan = buildUninstallPlan(uninstallFixture, uninstallState, uninstallManifest);
  assert.deepEqual(uninstallPlan.modifiedFiles, [modifiedProfile]);
  const uninstallResult = removeManagedArtifacts(uninstallFixture, uninstallPlan);
  assert.equal(uninstallResult.errors, 0);
  assert.equal(existsSync(join(uninstallFixture, intactProfile)), false, 'intact managed profile removed');
  assert.equal(readFileSync(join(uninstallFixture, modifiedProfile), 'utf8'), 'user modified writer\n');
  assert.equal(readFileSync(userProfile, 'utf8'), customAgent, 'user profile survives uninstall');
  assert.equal(readFileSync(userCodexConfig, 'utf8'), existingConfig, 'Codex config survives uninstall');

console.log('Codex routing: 72 agents classified; routing, overrides, idempotency, fallback, and ownership checks passed.');
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
