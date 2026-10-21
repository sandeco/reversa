#!/usr/bin/env node
// Smoke test for invocation metadata copied by the installer.
//
// The installer uses cpSync(src, dest, { recursive: true }) for each skill.
// This test exercises the same transport in a temporary directory and verifies
// that both invocation controls survive: disable-model-invocation in SKILL.md
// and policy.allow_implicit_invocation in agents/openai.yaml.
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = 'reversa-scout';
const src = join(ROOT, 'agents', SKILL);

const tmp = mkdtempSync(join(tmpdir(), 'reversa-transport-'));
let failures = 0;
const check = (cond, msg) => { if (!cond) { console.error(`  ✗ ${msg}`); failures++; } else { console.log(`  ✓ ${msg}`); } };

try {
  const dest = join(tmp, SKILL);
  cpSync(src, dest, { recursive: true });

  const skill = readFileSync(join(dest, 'SKILL.md'), 'utf8');
  check(/^disable-model-invocation:\s*true\s*$/m.test(skill),
    'flag disable-model-invocation atravessou para o SKILL.md instalado');

  const yaml = readFileSync(join(dest, 'agents', 'openai.yaml'), 'utf8');
  check(/^\s*allow_implicit_invocation:\s*false\s*$/m.test(yaml),
    'policy.allow_implicit_invocation atravessou no agents/openai.yaml instalado');
  check(/display_name:/.test(yaml),
    'interface.display_name presente no openai.yaml instalado');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log(failures ? `\nRESULTADO: ✗ ${failures} falha(s)` : '\nRESULTADO: ✓ transporte íntegro');
process.exit(failures ? 1 : 0);
