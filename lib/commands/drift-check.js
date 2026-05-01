// `npx reversa drift-check [--format text|json] [--severity high|medium|low] [--folder <path>]`
//
// Standalone CLI gate for CI. Engine-agnostic — does NOT load chalk,
// inquirer, or any agent code. Just parses _reversa_sdd/drift.md and
// exits with a useful code.
//
// Exit codes:
//   0 — clean (no pending drift at chosen severity)
//   1 — drift detected at chosen severity
//   2 — _reversa_sdd/drift.md not found (project not initialized)
//
// Severity:
//   high   = only `pending` blocks
//   medium = `pending` + `stale` block
//   low    = always exit 0; reports counts only

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

function parseArgs(args) {
  const out = { format: 'text', severity: 'high', folder: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--format' || a === '-f') out.format = args[++i];
    else if (a.startsWith('--format=')) out.format = a.slice('--format='.length);
    else if (a === '--severity' || a === '-s') out.severity = args[++i];
    else if (a.startsWith('--severity=')) out.severity = a.slice('--severity='.length);
    else if (a === '--folder') out.folder = args[++i];
    else if (a.startsWith('--folder=')) out.folder = a.slice('--folder='.length);
  }
  return out;
}

function detectOutputFolder(projectRoot, override) {
  if (override) return override;
  const statePath = join(projectRoot, '.reversa', 'state.json');
  if (existsSync(statePath)) {
    try {
      const state = JSON.parse(readFileSync(statePath, 'utf8'));
      if (state.output_folder) return state.output_folder;
    } catch { /* ignore */ }
  }
  return '_reversa_sdd';
}

function parseDriftMd(content) {
  // Look for table rows. Each row format:
  //   | `spec/path.md` | TIMESTAMP | EMOJI status | DIST | ACTION |
  // We extract the spec name (col 1) and status (col 3).
  const lines = content.split('\n');
  const entries = [];
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.includes('---')) continue; // header separator
    if (line.toLowerCase().includes('última sincronização') || line.toLowerCase().includes('last synced')) continue;

    const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length < 4) continue;

    const specCell = cells[0];
    const statusCell = cells[2];

    if (!statusCell) continue;
    let status = null;
    if (statusCell.includes('🔴') || /\bpending\b/i.test(statusCell)) status = 'pending';
    else if (statusCell.includes('🟡') || /\bstale\b/i.test(statusCell)) status = 'stale';
    else if (statusCell.includes('🟢') || /\bresolved\b/i.test(statusCell)) status = 'resolved';
    if (!status) continue;

    const specMatch = specCell.match(/`([^`]+)`/);
    const spec = specMatch ? specMatch[1] : specCell;

    entries.push({ spec, status, action: cells[4] ?? '' });
  }
  return entries;
}

function classify(entries, severity) {
  const pending = entries.filter((e) => e.status === 'pending');
  const stale = entries.filter((e) => e.status === 'stale');
  const resolved = entries.filter((e) => e.status === 'resolved');

  let blocking;
  if (severity === 'low') blocking = [];
  else if (severity === 'medium') blocking = [...pending, ...stale];
  else blocking = pending; // high (default)

  return { pending, stale, resolved, blocking };
}

function reportText(driftPath, summary, opts) {
  const { pending, stale, resolved, blocking } = summary;
  const lines = [];
  lines.push('');
  lines.push(`reversa drift-check (severity=${opts.severity})`);
  lines.push(`  source: ${driftPath}`);
  lines.push(`  pending: ${pending.length}   stale: ${stale.length}   resolved: ${resolved.length}`);

  if (blocking.length === 0) {
    lines.push('');
    lines.push(`✓ clean — no drift at severity "${opts.severity}".`);
    lines.push('');
    return { text: lines.join('\n'), exit: 0 };
  }

  lines.push('');
  lines.push(`✗ ${blocking.length} spec(s) bloqueando:`);
  for (const e of blocking) {
    lines.push(`  - ${e.spec}  [${e.status}]  ${e.action || ''}`.trimEnd());
  }
  lines.push('');
  lines.push('Hint: rode `/reversa-chronicler after` para resolver, ou ajuste severity para `low`/`medium`.');
  lines.push('');
  return { text: lines.join('\n'), exit: opts.severity === 'low' ? 0 : 1 };
}

function reportJson(driftPath, summary, opts) {
  const { pending, stale, resolved, blocking } = summary;
  const payload = {
    severity: opts.severity,
    source: driftPath,
    counts: { pending: pending.length, stale: stale.length, resolved: resolved.length },
    blocking: blocking.map((e) => ({ spec: e.spec, status: e.status, action: e.action })),
    clean: blocking.length === 0,
  };
  return {
    text: JSON.stringify(payload, null, 2),
    exit: blocking.length === 0 ? 0 : (opts.severity === 'low' ? 0 : 1),
  };
}

export default async function driftCheck(args) {
  const opts = parseArgs(args);
  const projectRoot = resolve(process.cwd());
  const outputFolder = detectOutputFolder(projectRoot, opts.folder);
  const driftPath = join(projectRoot, outputFolder, 'drift.md');

  if (!existsSync(driftPath)) {
    if (opts.format === 'json') {
      process.stdout.write(JSON.stringify({
        error: 'drift.md not found',
        path: driftPath,
        hint: 'Run `/reversa` to initialize, then `/reversa-chronicler after` to populate drift.md',
      }, null, 2) + '\n');
    } else {
      process.stderr.write(`\nreversa drift-check: drift.md not found at ${driftPath}\n`);
      process.stderr.write(`Hint: rode \`/reversa\` no projeto, depois \`/reversa-chronicler after\` para popular drift.md.\n\n`);
    }
    process.exit(2);
  }

  const content = readFileSync(driftPath, 'utf8');
  const entries = parseDriftMd(content);
  const summary = classify(entries, opts.severity);

  const report = opts.format === 'json'
    ? reportJson(driftPath, summary, opts)
    : reportText(driftPath, summary, opts);

  const stream = report.exit === 0 ? process.stdout : process.stderr;
  stream.write(report.text + '\n');
  process.exit(report.exit);
}
