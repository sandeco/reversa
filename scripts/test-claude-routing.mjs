import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import modelsCommand from '../lib/commands/models.js';
import { loadManifest } from '../lib/installer/manifest.js';
import { Writer } from '../lib/installer/writer.js';
import { loadRoutingPolicy } from '../lib/routing/policy.js';
import { installModelRoutingProfiles } from '../lib/routing/lifecycle.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const allAgents = readdirSync(join(repoRoot, 'agents'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const fixture = mkdtempSync(join(tmpdir(), 'reversa-claude-routing-'));
const userConfigPath = join(fixture, '.reversa', 'config.user.toml');
const settingsPath = join(fixture, '.claude', 'settings.json');
const customAgentPath = join(fixture, '.claude', 'agents', 'custom-user-agent.md');
const conflictingAgentPath = join(fixture, '.claude', 'agents', 'reversa-architect.md');
const scoutPath = join(fixture, '.claude', 'agents', 'reversa-scout.md');
const helpPath = join(fixture, '.claude', 'agents', 'reversa-agents-help.md');
const codingPath = join(fixture, '.claude', 'agents', 'reversa-coding.md');

function install(manifest = {}) {
  const writer = new Writer(fixture);
  const result = installModelRoutingProfiles(writer, ['claude-code'], allAgents, manifest)['claude-code'];
  writer.saveManifest(manifest);
  return result;
}

function profile(agentId) {
  return readFileSync(join(fixture, '.claude', 'agents', `${agentId}.md`), 'utf8');
}

try {
  mkdirSync(join(fixture, '.reversa', '_config'), { recursive: true });
  mkdirSync(join(fixture, '.claude', 'agents'), { recursive: true });

  const settingsBytes = '{"permissions":{"allow":["Bash(git status:*)"]}}\n';
  const customAgentBytes = '---\nname: custom-user-agent\ndescription: User owned\n---\nDo not change.\n';
  const conflictBytes = '---\nname: reversa-architect\ndescription: User owned conflict\n---\nDo not change.\n';
  writeFileSync(settingsPath, settingsBytes, 'utf8');
  writeFileSync(customAgentPath, customAgentBytes, 'utf8');
  writeFileSync(conflictingAgentPath, conflictBytes, 'utf8');
  writeFileSync(join(fixture, '.reversa', 'state.json'), `${JSON.stringify({
    engines: ['claude-code'],
    agents: allAgents,
  }, null, 2)}\n`, 'utf8');

  const first = install();
  assert.equal(first.enabled, true);
  assert.equal(first.profileGenerationEnabled, true);
  assert.equal(first.profiles.length, allAgents.length);
  assert.equal(first.profiles.find((entry) => entry.id === 'reversa-architect').status, 'user-owned');
  assert.equal(readFileSync(settingsPath, 'utf8'), settingsBytes);
  assert.equal(readFileSync(customAgentPath, 'utf8'), customAgentBytes);
  assert.equal(readFileSync(conflictingAgentPath, 'utf8'), conflictBytes);

  const expected = {
    reversa: ['ROOT', 'opus', 'high'],
    'reversa-scout': ['T0', 'haiku', 'low'],
    'reversa-coding': ['T1', 'sonnet', 'medium'],
    'reversa-detective': ['T2', 'opus', 'high'],
    'reversa-architect': ['T3', 'opus', 'xhigh'],
  };
  const routing = loadRoutingPolicy(fixture, allAgents, 'claude');
  for (const [agentId, values] of Object.entries(expected)) {
    const route = routing.agents.find((agent) => agent.id === agentId);
    assert.deepEqual([route.computeClass, route.model, route.effort], values, `${agentId} default route`);
  }

  assert.match(profile('reversa-scout'), /^---\nname: reversa-scout\n/m);
  assert.match(profile('reversa-scout'), /^model: haiku$/m);
  assert.match(profile('reversa-scout'), /^effort: low$/m);
  assert.match(profile('reversa-scout'), /^skills:\n  - reversa-scout$/m);
  assert.match(readFileSync(helpPath, 'utf8'), /^permissionMode: plan$/m);

  const firstScoutBytes = readFileSync(scoutPath, 'utf8');
  const second = install(loadManifest(fixture));
  assert.equal(second.profiles.find((entry) => entry.id === 'reversa-scout').changed, false);
  assert.equal(readFileSync(scoutPath, 'utf8'), firstScoutBytes);

  writeFileSync(userConfigPath, [
    '[claude.compute.T0]',
    'effort = "medium"',
    '',
    '[claude.agents."reversa-coding"]',
    'compute_class = "T2"',
    '',
  ].join('\n'), 'utf8');
  const overridden = install(loadManifest(fixture)).routing;
  assert.equal(overridden.agents.find((agent) => agent.id === 'reversa-scout').effort, 'medium');
  assert.equal(overridden.agents.find((agent) => agent.id === 'reversa-coding').computeClass, 'T2');
  assert.match(profile('reversa-scout'), /^effort: medium$/m);
  assert.match(readFileSync(codingPath, 'utf8'), /^model: opus$/m);

  writeFileSync(userConfigPath, [
    '[claude.capabilities]',
    'model_override = false',
    'effort_override = false',
    'permission_override = false',
    'skill_preload = false',
    '',
  ].join('\n'), 'utf8');
  install(loadManifest(fixture));
  const capabilityLimitedScout = profile('reversa-scout');
  assert.doesNotMatch(capabilityLimitedScout, /^model:/m);
  assert.doesNotMatch(capabilityLimitedScout, /^effort:/m);
  assert.doesNotMatch(capabilityLimitedScout, /^permissionMode:/m);
  assert.doesNotMatch(capabilityLimitedScout, /^skills:/m);
  assert.equal(readFileSync(settingsPath, 'utf8'), settingsBytes);
  assert.equal(readFileSync(customAgentPath, 'utf8'), customAgentBytes);

  writeFileSync(userConfigPath, '', 'utf8');
  install(loadManifest(fixture));
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
  const diagnostics = JSON.parse(modelOutput.join('\n'));
  assert.equal(diagnostics.runtime_verification, 'unavailable');
  assert.equal(diagnostics.engines.claude.agents.length, allAgents.length);
  assert.equal(diagnostics.engines.claude.capabilities.skill_preload, true);

  writeFileSync(userConfigPath, '[claude.capabilities]\ncustom_agents = false\n', 'utf8');
  const disabledProfiles = install(loadManifest(fixture));
  assert.equal(disabledProfiles.enabled, true);
  assert.equal(disabledProfiles.profileGenerationEnabled, false);
  assert.equal(existsSync(scoutPath), false);
  assert.equal(existsSync(conflictingAgentPath), true);
  assert.equal(readFileSync(settingsPath, 'utf8'), settingsBytes);
  assert.equal(readFileSync(customAgentPath, 'utf8'), customAgentBytes);
  const lock = JSON.parse(readFileSync(join(fixture, '.reversa', '_config', 'claude-routing.lock.json'), 'utf8'));
  assert.equal(lock.profile_generation_enabled, false);

  writeFileSync(userConfigPath, '[claude]\nenabled = false\n', 'utf8');
  const disabledRouting = install(loadManifest(fixture));
  assert.equal(disabledRouting.enabled, false);
  assert.equal(existsSync(scoutPath), false);
  assert.equal(existsSync(conflictingAgentPath), true);

  const beforeInvalidSettings = readFileSync(settingsPath, 'utf8');
  writeFileSync(userConfigPath, '[claude.compute.T0]\neffort = "ultra"\n', 'utf8');
  assert.throws(() => install(loadManifest(fixture)), /invalid effort level ultra/);
  assert.equal(readFileSync(settingsPath, 'utf8'), beforeInvalidSettings);
  assert.equal(readFileSync(conflictingAgentPath, 'utf8'), conflictBytes);

  writeFileSync(userConfigPath, '[claude.compute.T0\neffort = "medium"\n', 'utf8');
  assert.throws(() => install(loadManifest(fixture)), /invalid TOML/);
  assert.equal(readFileSync(settingsPath, 'utf8'), beforeInvalidSettings);

  console.log(`Claude routing: ${allAgents.length} agents classified; profiles, capabilities, diagnostics, fallback, and ownership checks passed.`);
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
