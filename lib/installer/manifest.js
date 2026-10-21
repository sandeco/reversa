import { createHash } from 'crypto';
import { readFileSync, existsSync, writeFileSync, mkdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { readJsonSafe } from '../utils/json-safe.js';

export function hashFile(filePath) {
  if (!existsSync(filePath)) return null;
  if (statSync(filePath).isDirectory()) return null;
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

// Accepts relative paths; stores them as relative keys in the manifest.
// Always use this signature — never pass absolute paths.
export function buildManifest(projectRoot, relPaths) {
  const manifest = {};
  for (const relPath of relPaths) {
    const normalizedPath = relPath.replace(/\\/g, '/');
    const absPath = join(projectRoot, normalizedPath);
    const hash = hashFile(absPath);
    if (hash) manifest[normalizedPath] = hash;
  }
  return manifest;
}

export function saveManifest(projectRoot, manifest) {
  const manifestPath = join(projectRoot, '.reversa', '_config', 'files-manifest.json');
  mkdirSync(dirname(manifestPath), { recursive: true });
  const normalized = Object.fromEntries(
    Object.entries(manifest).map(([path, hash]) => [path.replace(/\\/g, '/'), hash]),
  );
  writeFileSync(manifestPath, JSON.stringify(normalized, null, 2), 'utf8');
}

export function loadManifest(projectRoot) {
  const manifestPath = join(projectRoot, '.reversa', '_config', 'files-manifest.json');
  if (!existsSync(manifestPath)) return {};
  try {
    return Object.fromEntries(
      Object.entries(readJsonSafe(manifestPath)).map(([path, hash]) => [path.replace(/\\/g, '/'), hash]),
    );
  } catch {
    return {};
  }
}

// Returns 'intact' | 'modified' | 'missing'
export function fileStatus(projectRoot, relPath, originalHash) {
  const absPath = join(projectRoot, relPath);
  const current = hashFile(absPath);
  if (!current) return 'missing';
  return current === originalHash ? 'intact' : 'modified';
}

// Kept for compatibility
export function hasFileBeenModified(filePath, originalHash) {
  const current = hashFile(filePath);
  if (!current) return false;
  return current !== originalHash;
}
