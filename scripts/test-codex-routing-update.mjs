import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { updateProject } from '../lib/commands/update.js';
import { installCodexProfiles } from '../lib/codex/profiles.js';
import { fileStatus, loadManifest } from '../lib/installer/manifest.js';
import { Writer } from '../lib/installer/writer.js';

const fixture = mkdtempSync(join(tmpdir(), 'reversa-codex-update-'));
const previousCwd = process.cwd();
const originalLog = console.log;
try {
  mkdirSync(join(fixture, '.reversa', '_config'), { recursive: true });
  mkdirSync(join(fixture, '.codex', 'agents'), { recursive: true });
  mkdirSync(join(fixture, '.claude'), { recursive: true });

  const agents = ['reversa-scout', 'reversa-writer'];
  writeFileSync(join(fixture, '.reversa', 'state.json'), `${JSON.stringify({
    version: '0.0.0',
    engines: ['codex'],
    agents,
    created_files: [],
  }, null, 2)}\n`, 'utf8');

  const configPath = join(fixture, '.codex', 'config.toml');
  const customAgentPath = join(fixture, '.codex', 'agents', 'custom-user-agent.toml');
  const otherEnginePath = join(fixture, '.claude', 'user-owned.md');
  const configBytes = '[agents]\nmax_concurrent_threads_per_session = 9\n';
  const customAgentBytes = 'name = "custom-user-agent"\n';
  const otherEngineBytes = 'user-owned Claude artifact\n';
  writeFileSync(configPath, configBytes, 'utf8');
  writeFileSync(customAgentPath, customAgentBytes, 'utf8');
  writeFileSync(otherEnginePath, otherEngineBytes, 'utf8');

  const initialWriter = new Writer(fixture);
  installCodexProfiles(initialWriter, agents, {});
  initialWriter.saveManifest();

  const modifiedPath = join(fixture, '.codex', 'agents', 'reversa-writer.toml');
  const missingPath = join(fixture, '.codex', 'agents', 'reversa-scout.toml');
  const modifiedBytes = `${readFileSync(modifiedPath, 'utf8')}# user modification\n`;
  writeFileSync(modifiedPath, modifiedBytes, 'utf8');
  unlinkSync(missingPath);

  process.chdir(fixture);
  console.log = () => {};
  const dependencies = {
    fetchLatestVersion: async () => null,
    prompt: async () => ({ confirm: true }),
  };
  await updateProject([], dependencies);

  assert.equal(readFileSync(modifiedPath, 'utf8'), modifiedBytes, 'update preserves modified managed profile');
  assert.equal(existsSync(missingPath), true, 'update restores missing managed profile');
  assert.equal(readFileSync(configPath, 'utf8'), configBytes, 'update preserves .codex/config.toml byte-for-byte');
  assert.equal(readFileSync(customAgentPath, 'utf8'), customAgentBytes, 'update preserves custom Codex agent');
  assert.equal(readFileSync(otherEnginePath, 'utf8'), otherEngineBytes, 'Codex update leaves other engines untouched');
  const stateHash = loadManifest(fixture)['.reversa/state.json'];
  assert.equal(fileStatus(fixture, '.reversa/state.json', stateHash), 'intact', 'updated state hash is reconciled');

  const restoredBytes = readFileSync(missingPath, 'utf8');
  await updateProject([], dependencies);
  assert.equal(readFileSync(modifiedPath, 'utf8'), modifiedBytes, 'second update still preserves user changes');
  assert.equal(readFileSync(missingPath, 'utf8'), restoredBytes, 'second update is idempotent');
  assert.equal(readFileSync(configPath, 'utf8'), configBytes);
  assert.equal(readFileSync(customAgentPath, 'utf8'), customAgentBytes);
  assert.equal(readFileSync(otherEnginePath, 'utf8'), otherEngineBytes);
} finally {
  console.log = originalLog;
  process.chdir(previousCwd);
  rmSync(fixture, { recursive: true, force: true });
}

console.log('Codex routing update: ownership, restoration, idempotency, and engine isolation checks passed.');
