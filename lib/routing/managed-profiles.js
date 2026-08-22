import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { fileStatus } from '../installer/manifest.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
export const POLICY_REL_PATH = '.reversa/model-routing.toml';

export function relativePath(...parts) {
  return join(...parts).replace(/\\/g, '/');
}

export function readAgentDescription(agentId) {
  try {
    const metadataPath = join(REPO_ROOT, 'agents', agentId, 'agents', 'openai.yaml');
    const metadata = readFileSync(metadataPath, 'utf8');
    const match = metadata.match(/^\s*short_description:\s*("(?:[^"\\]|\\.)*")\s*$/m);
    return match ? JSON.parse(match[1]) : `${agentId} Reversa agent`;
  } catch {
    return `${agentId} Reversa agent`;
  }
}

export function ensureProjectPolicy(writer, manifest, defaultsText) {
  const policyPath = join(writer.projectRoot, POLICY_REL_PATH);
  if (!existsSync(policyPath)) {
    mkdirSync(dirname(policyPath), { recursive: true });
    writeFileSync(policyPath, defaultsText, 'utf8');
    writer.registerPath(policyPath);
  } else if (
    manifest[POLICY_REL_PATH]
    && fileStatus(writer.projectRoot, POLICY_REL_PATH, manifest[POLICY_REL_PATH]) === 'intact'
  ) {
    writer.registerPath(policyPath);
  }
}

export function writeManagedFile(writer, manifest, path, content) {
  const absolutePath = join(writer.projectRoot, path);
  const originalHash = manifest[path];
  if (existsSync(absolutePath)) {
    if (!originalHash) return { relativePath: path, status: 'user-owned', changed: false };
    if (fileStatus(writer.projectRoot, path, originalHash) === 'modified') {
      return { relativePath: path, status: 'modified', changed: false };
    }
    if (readFileSync(absolutePath, 'utf8') === content) {
      writer.registerPath(absolutePath);
      return { relativePath: path, status: 'managed', changed: false };
    }
  }
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content, 'utf8');
  writer.registerPath(absolutePath);
  return { relativePath: path, status: 'managed', changed: true };
}

export function removeManagedProfiles(writer, manifest, isManagedProfile, targetPaths = new Set()) {
  const removed = [];
  for (const path of Object.keys(manifest)) {
    if (!isManagedProfile(path) || targetPaths.has(path)) continue;
    const status = fileStatus(writer.projectRoot, path, manifest[path]);
    if (status === 'intact') unlinkSync(join(writer.projectRoot, path));
    if (status === 'missing' || status === 'intact') {
      writer.removedFiles.push(path);
      removed.push(path);
    }
  }
  return removed;
}

export function removeManagedFile(writer, manifest, path) {
  if (!manifest[path]) return;
  const status = fileStatus(writer.projectRoot, path, manifest[path]);
  if (status === 'intact') unlinkSync(join(writer.projectRoot, path));
  if (status !== 'modified') writer.removedFiles.push(path);
}

export function writeRoutingLock(writer, manifest, lockPath, routing, profiles) {
  const lock = {
    version: 1,
    engine: routing.engine,
    configured: true,
    profile_generation_enabled: routing.profileGenerationEnabled,
    runtime_verification: routing.runtimeVerification,
    capabilities: routing.capabilities,
    overrides: routing.overrides,
    profiles: profiles.map(({ id, computeClass, model, effort, relativePath: path, status }) => ({
      id,
      compute_class: computeClass,
      model,
      effort,
      path,
      status,
    })),
  };
  return writeManagedFile(writer, manifest, lockPath, `${JSON.stringify(lock, null, 2)}\n`);
}

export function inspectProfileStatus(projectRoot, path, manifest, profileGenerationEnabled) {
  const absolutePath = join(projectRoot, path);
  if (!existsSync(absolutePath)) return profileGenerationEnabled ? 'missing' : 'disabled';
  if (!manifest[path]) return 'user-owned';
  const status = fileStatus(projectRoot, path, manifest[path]);
  if (profileGenerationEnabled) return status;
  return status === 'modified' ? 'stale-modified' : 'stale-managed';
}
