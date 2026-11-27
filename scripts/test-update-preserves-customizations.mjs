#!/usr/bin/env node
// Teste de regressão do `reversa update`: customizações do usuário em skills
// instaladas precisam sobreviver a updates SUCESSIVOS, e uma skill intacta
// precisa ser atualizada mesmo quando uma skill irmã de nome parecido foi
// customizada.
//
// Cenário (projeto temporário, engine claude-code):
//   1. Instalação "antiga" com `reversa` (conteúdo desatualizado) e
//      `reversa-scout`, ambas registradas no manifest SHA-256.
//   2. O usuário customiza `.claude/skills/reversa-scout/SKILL.md`.
//   3. `reversa update` → a customização fica E o orquestrador `reversa`
//      (intacto) é atualizado. Antes da correção, `startsWith` sem `/` fazia
//      `reversa-scout/...` contaminar `reversa`, que ficava desatualizado.
//   4. `reversa update` de novo → a customização continua lá. Antes da
//      correção, o 1º update removia o arquivo modificado do manifest e o 2º
//      apagava a pasta da skill com rmSync e reinstalava por cima.
//
// O teste é hermético: o fetch ao registry do npm é desligado via --import,
// então o update segue pelo caminho offline.
import { spawnSync } from 'node:child_process';
import {
  appendFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest, saveManifest } from '../lib/installer/manifest.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CLI = join(ROOT, 'bin', 'reversa.js');
const OFFLINE = 'data:text/javascript,globalThis.fetch=()=>Promise.reject(new Error("offline"))';
const CUSTOM = '\n<!-- customização do usuário: não apagar -->\n';
const STALE = '# reversa (conteúdo de uma versão antiga)\n';

let failures = 0;
const check = (cond, msg) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.error(`  ✗ ${msg}`); failures++; }
};

function runUpdate(projectRoot) {
  const r = spawnSync(process.execPath, ['--import', OFFLINE, CLI, 'update'], {
    cwd: projectRoot,
    input: 'y\n',
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
    timeout: 120_000,
  });
  if (r.status !== 0) {
    console.error(r.stdout, r.stderr);
    throw new Error(`reversa update saiu com código ${r.status}`);
  }
}

const tmp = mkdtempSync(join(tmpdir(), 'reversa-update-'));
try {
  // 1. Instalação antiga
  const reversaDir = join(tmp, '.reversa');
  mkdirSync(join(reversaDir, '_config'), { recursive: true });
  writeFileSync(join(reversaDir, 'version'), '0.0.1');
  writeFileSync(join(reversaDir, 'state.json'), JSON.stringify({
    version: '0.0.1',
    engines: ['claude-code'],
    agents: ['reversa', 'reversa-scout'],
    output_folder: '_reversa_sdd',
    forward_folder: '_reversa_forward',
    created_files: [],
  }, null, 2));

  const installed = [];
  for (const skillsDir of ['.claude/skills', '.agents/skills']) {
    for (const agent of ['reversa', 'reversa-scout']) {
      cpSync(join(ROOT, 'agents', agent), join(tmp, skillsDir, agent), { recursive: true });
      installed.push(`${skillsDir}/${agent}/SKILL.md`);
    }
    writeFileSync(join(tmp, skillsDir, 'reversa', 'SKILL.md'), STALE);
  }
  saveManifest(tmp, buildManifest(tmp, installed));

  // 2. Customização do usuário
  const scout = join(tmp, '.claude/skills/reversa-scout/SKILL.md');
  appendFileSync(scout, CUSTOM);

  const orchestrator = join(tmp, '.claude/skills/reversa/SKILL.md');
  const upstreamOrchestrator = readFileSync(join(ROOT, 'agents/reversa/SKILL.md'), 'utf8');

  // 3. Primeiro update
  runUpdate(tmp);
  console.log('Após o 1º update:');
  check(readFileSync(scout, 'utf8').includes(CUSTOM),
    'customização em reversa-scout preservada');
  check(readFileSync(orchestrator, 'utf8') === upstreamOrchestrator,
    'skill intacta `reversa` atualizada apesar de `reversa-scout` estar customizada');

  // 4. Segundo update
  runUpdate(tmp);
  console.log('Após o 2º update:');
  check(readFileSync(scout, 'utf8').includes(CUSTOM),
    'customização em reversa-scout continua preservada');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log(failures
  ? `\nRESULTADO: ✗ ${failures} falha(s)`
  : '\nRESULTADO: ✓ update preserva customizações');
process.exit(failures ? 1 : 0);
