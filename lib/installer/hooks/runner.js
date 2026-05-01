#!/usr/bin/env node
//
// Reversa Chronicler hook runner.
//
// Engine-agnostic. Invoked by hooks installed by `npx reversa add-hooks`
// from any supported engine (Claude Code, Cursor, Kimi CLI, Codex, Opencode).
//
// Responsibilities:
//   1. Append the event to .reversa/chronicler-queue.json (with file locking)
//   2. On `post` phase: write a stub entry to _reversa_sdd/changelog/YYYY-MM-DD.md
//   3. On `post` phase: mark affected specs as `pending` in _reversa_sdd/drift.md
//   4. Print a terminal warning if an affected spec has high-confidence content
//
// Contract:
//   - Reads JSON payload from stdin (best-effort — empty stdin is OK)
//   - Args: --phase pre|post --engine <id> [--tool <name>] [--files <comma>]
//   - ALWAYS exits 0. Never blocks the engine.
//   - Errors logged to .reversa/chronicler-errors.log
//
// No external deps — runs with bare Node 18+.

import {
  existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync,
  openSync, closeSync, unlinkSync, statSync,
} from 'node:fs';
import { join, dirname, relative, resolve as pathResolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const LOCK_TIMEOUT_MS = 5000;
const LOCK_RETRY_MS = 50;
const STALE_LOCK_MS = 5000;

function parseArgs(argv) {
  const out = { phase: null, engine: null, tool: null, files: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--phase') out.phase = argv[++i];
    else if (a === '--engine') out.engine = argv[++i];
    else if (a === '--tool') out.tool = argv[++i];
    else if (a === '--files') out.files = (argv[++i] ?? '').split(',').filter(Boolean);
  }
  return out;
}

async function readStdin() {
  if (process.stdin.isTTY) return '';
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    const timeout = setTimeout(() => resolve(data), 200);
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => { clearTimeout(timeout); resolve(data); });
    process.stdin.on('error', () => { clearTimeout(timeout); resolve(data); });
  });
}

function findProjectRoot(startDir) {
  let dir = pathResolve(startDir);
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, '.reversa', 'state.json'))) return dir;
    dir = dirname(dir);
  }
  return startDir;
}

function logError(projectRoot, message) {
  try {
    const logPath = join(projectRoot, '.reversa', 'chronicler-errors.log');
    mkdirSync(dirname(logPath), { recursive: true });
    appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`, 'utf8');
  } catch { /* swallow */ }
}

async function withLock(lockPath, fn) {
  const start = Date.now();
  while (Date.now() - start < LOCK_TIMEOUT_MS) {
    try {
      const fd = openSync(lockPath, 'wx');
      writeFileSync(fd, String(process.pid));
      closeSync(fd);
      try { return await fn(); }
      finally {
        try { unlinkSync(lockPath); } catch { /* ignore */ }
      }
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      try {
        const stat = statSync(lockPath);
        if (Date.now() - stat.mtimeMs > STALE_LOCK_MS) {
          unlinkSync(lockPath);
          continue;
        }
      } catch { /* lock vanished */ }
      await new Promise((r) => setTimeout(r, LOCK_RETRY_MS));
    }
  }
  throw new Error(`lock timeout: ${lockPath}`);
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch { return fallback; }
}

function readState(projectRoot) {
  return readJson(join(projectRoot, '.reversa', 'state.json'), { output_folder: '_reversa_sdd' });
}

function extractFilesFromPayload(payload, fallback) {
  if (!payload || typeof payload !== 'object') return fallback;
  const out = new Set(fallback);
  // Claude Code shapes
  const ti = payload.tool_input;
  if (ti) {
    if (typeof ti.file_path === 'string') out.add(ti.file_path);
    if (Array.isArray(ti.edits)) ti.edits.forEach((e) => e?.file_path && out.add(e.file_path));
    if (typeof ti.path === 'string') out.add(ti.path);
  }
  // Cursor shape
  if (typeof payload.file_path === 'string') out.add(payload.file_path);
  if (Array.isArray(payload.files)) payload.files.forEach((f) => typeof f === 'string' && out.add(f));
  // Opencode / generic
  if (payload.tool && payload.tool.input && typeof payload.tool.input.file_path === 'string') {
    out.add(payload.tool.input.file_path);
  }
  return Array.from(out);
}

function normalizeFiles(projectRoot, files) {
  return files.map((f) => {
    const abs = pathResolve(projectRoot, f);
    return relative(projectRoot, abs);
  }).filter((f) => !f.startsWith('..'));
}

function lookupSpecsForFiles(projectRoot, outputFolder, files) {
  const matrixPath = join(projectRoot, outputFolder, 'traceability', 'code-spec-matrix.md');
  if (!existsSync(matrixPath)) return new Map();
  const content = readFileSync(matrixPath, 'utf8');
  const map = new Map();
  for (const file of files) {
    const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\|\\s*\`?${escaped}\`?\\s*\\|\\s*\`?([^\`|]+)\`?\\s*\\|`, 'i');
    const match = content.match(re);
    if (match && match[1].trim() && match[1].trim() !== '—' && match[1].trim() !== '-') {
      map.set(file, match[1].trim());
    }
  }
  return map;
}

function appendQueueEntry(projectRoot, entry) {
  const queuePath = join(projectRoot, '.reversa', 'chronicler-queue.json');
  const lockPath = queuePath + '.lock';
  mkdirSync(dirname(queuePath), { recursive: true });
  return withLock(lockPath, () => {
    const q = readJson(queuePath, { version: 1, queue: [] });
    if (q.version !== 1) {
      logError(projectRoot, `unknown queue version ${q.version}, refusing to append`);
      return;
    }
    q.queue.push(entry);
    writeFileSync(queuePath, JSON.stringify(q, null, 2), 'utf8');
  });
}

function appendChangelogStub(projectRoot, outputFolder, entry) {
  const date = new Date(entry.timestamp);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');

  const dayFile = join(projectRoot, outputFolder, 'changelog', `${yyyy}-${mm}-${dd}.md`);
  mkdirSync(dirname(dayFile), { recursive: true });

  const filesBlock = entry.files.map((f) => `- \`${f}\``).join('\n');
  const stub = [
    '',
    `## ${hh}:${min} — auto-stub (chronicler pending)`,
    '',
    `**O quê:** ${entry.tool} em ${entry.files.length} arquivo(s)`,
    '',
    '**Arquivos:**',
    filesBlock,
    '',
    `**Engine:** ${entry.engine}`,
    '',
    `> Stub criado automaticamente pelos hooks. Rode \`/reversa-chronicler after\` para enriquecer com motivo, impacto e contexto.`,
    '',
  ].join('\n');

  if (!existsSync(dayFile)) {
    const header = `# Changelog — ${yyyy}-${mm}-${dd}\n\nEntradas em ordem cronológica (mais antigas no topo).\n`;
    writeFileSync(dayFile, header + stub, 'utf8');
  } else {
    appendFileSync(dayFile, stub, 'utf8');
  }
}

function markSpecsPending(projectRoot, outputFolder, specs) {
  if (specs.length === 0) return;
  const driftPath = join(projectRoot, outputFolder, 'drift.md');
  const now = new Date();
  const ts = now.toISOString().replace('T', ' ').slice(0, 16);

  let content;
  if (existsSync(driftPath)) {
    content = readFileSync(driftPath, 'utf8');
  } else {
    content = [
      '# Drift Dashboard',
      '',
      `Última atualização: ${ts} (UTC)`,
      'Geração: reversa-chronicler hooks v2.0.0',
      '',
      '## Resumo',
      '',
      '_Recompute ao rodar `/reversa-chronicler after`._',
      '',
      '## Specs',
      '',
      '| Spec | Última sincronização | Status | Distribuição confiança | Ação sugerida |',
      '|---|---|---|---|---|',
      '',
    ].join('\n');
  }

  const lines = content.split('\n');
  const updated = new Set();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const spec of specs) {
      if (updated.has(spec)) continue;
      if (line.includes(`\`${spec}\``) || line.includes(`| ${spec} |`)) {
        const cells = line.split('|');
        if (cells.length >= 6) {
          cells[2] = ` ${ts} `;
          cells[3] = ' 🔴 pending ';
          cells[5] = ' Rodar `/reversa-chronicler after` ';
          lines[i] = cells.join('|');
          updated.add(spec);
        }
      }
    }
  }

  for (const spec of specs) {
    if (updated.has(spec)) continue;
    const row = `| \`${spec}\` | ${ts} | 🔴 pending | — | Rodar \`/reversa-chronicler after\` |`;
    lines.push(row);
    updated.add(spec);
  }

  writeFileSync(driftPath, lines.join('\n'), 'utf8');
}

function warnHighConfidenceImpact(projectRoot, outputFolder, specs) {
  let warned = false;
  for (const spec of specs) {
    const specPath = join(projectRoot, outputFolder, spec);
    if (!existsSync(specPath)) continue;
    const text = readFileSync(specPath, 'utf8');
    const total = (text.match(/[🟢🟡🔴]/gu) || []).length;
    const green = (text.match(/🟢/gu) || []).length;
    if (total > 0 && green / total >= 0.5) {
      if (!warned) {
        process.stderr.write('\n[reversa-chronicler] Atenção — specs de alta confiança impactadas:\n');
        warned = true;
      }
      process.stderr.write(`  - ${spec} (🟢 ${Math.round((green / total) * 100)}%)\n`);
    }
  }
  if (warned) {
    process.stderr.write('  Rode `/reversa-chronicler after` antes de commitar para revalidar.\n\n');
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.phase || !args.engine) return;
  if (args.phase !== 'pre' && args.phase !== 'post') return;

  const projectRoot = findProjectRoot(process.cwd());

  const stdinRaw = await readStdin();
  let payload = null;
  if (stdinRaw.trim()) {
    try { payload = JSON.parse(stdinRaw); } catch { /* non-JSON, ignore */ }
  }

  const state = readState(projectRoot);
  const outputFolder = state.output_folder ?? '_reversa_sdd';

  const files = normalizeFiles(projectRoot, extractFilesFromPayload(payload, args.files));
  if (files.length === 0 && args.phase === 'post') return;

  const specMap = lookupSpecsForFiles(projectRoot, outputFolder, files);
  const affectedSpecs = Array.from(new Set(specMap.values()));

  const entry = {
    id: randomUUID(),
    phase: args.phase,
    tool: args.tool ?? (payload?.tool_name ?? 'unknown'),
    files,
    timestamp: new Date().toISOString(),
    engine: args.engine,
    diff_summary: '',
    affected_specs: affectedSpecs,
  };

  try {
    appendQueueEntry(projectRoot, entry);
  } catch (e) {
    logError(projectRoot, `queue append failed: ${e.message}`);
    return;
  }

  if (args.phase === 'post') {
    try { appendChangelogStub(projectRoot, outputFolder, entry); }
    catch (e) { logError(projectRoot, `changelog stub failed: ${e.message}`); }

    try { markSpecsPending(projectRoot, outputFolder, affectedSpecs); }
    catch (e) { logError(projectRoot, `drift update failed: ${e.message}`); }

    try { warnHighConfidenceImpact(projectRoot, outputFolder, affectedSpecs); }
    catch { /* warnings best-effort */ }
  }
}

main().catch((e) => {
  try {
    const root = findProjectRoot(process.cwd());
    logError(root, `runner crashed: ${e.message}`);
  } catch { /* ignore */ }
}).finally(() => {
  process.exit(0);
});
