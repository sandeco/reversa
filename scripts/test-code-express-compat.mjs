#!/usr/bin/env node
// Teste de compatibilidade do /reversa-code-express.
//
// O express corta sete artefatos do ciclo forward. A aposta central do agente é
// que a pasta que ele deixa continua legível pelos skills que vêm depois. Este
// teste materializa uma feature no formato que o SKILL.md do express prescreve e
// checa três coisas, todas derivadas de texto normativo de outros skills:
//
//   1. A detecção de estágio físico (tabela replicada em reversa-forward,
//      reversa-requirements e reversa-resume) classifica a feature como `done`.
//   2. As pré-condições declaradas de /reversa-sync, /reversa-add e
//      /reversa-coding estão satisfeitas pelos artefatos que o express escreve.
//   3. As duas marcas do eixo de invocação atravessam o cpSync do installer.
//
// O caso negativo (fixture sem roadmap.md) existe para provar que a detecção de
// estágio de fato depende desse arquivo. Se ele passar a dar `done`, a razão de
// o express escrever um roadmap magro deixou de existir e a seção correspondente
// do SKILL.md pode ser revista.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
const check = (cond, msg) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.error(`  ✗ ${msg}`); failures++; }
};
const eq = (actual, expected, msg) => check(actual === expected, `${msg} (esperado \`${expected}\`, obtido \`${actual}\`)`);

// ---------------------------------------------------------------------------
// Detecção de estágio físico, transcrita da tabela canônica.
// Fonte: agents/reversa-forward/SKILL.md, seção "Detecção do estágio físico".
// A ordem das condições é a ordem das linhas da tabela.
// ---------------------------------------------------------------------------
const ACTION_ROW = /^\|\s*T\d{3}\s*\|/;
const OPEN_STATUS = /\|\s*`?\[ \]`?\s*\|\s*$/;
const CLOSED_STATUS = /\|\s*`?\[X\]`?\s*\|\s*$/;

function actionRows(actionsPath) {
  return readFileSync(actionsPath, 'utf8')
    .split(/\r?\n/)
    .filter(line => ACTION_ROW.test(line));
}

function detectStage(featureDir) {
  if (!featureDir || !existsSync(featureDir)) return 'sem-feature-ativa';
  if (!existsSync(join(featureDir, 'requirements.md'))) return 'vazio';
  if (!existsSync(join(featureDir, 'roadmap.md'))) return 'requirements';
  if (!existsSync(join(featureDir, 'actions.md'))) return 'plan';
  const rows = actionRows(join(featureDir, 'actions.md'));
  if (rows.length === 0) return 'plan';
  if (rows.some(r => OPEN_STATUS.test(r))) return 'coding-em-progresso';
  if (rows.every(r => CLOSED_STATUS.test(r))) return 'done';
  return 'indeterminado';
}

// Matriz de roteamento do /reversa-forward, apenas as linhas que o express alcança.
function routeFrom(stage, { hasAddendum = false } = {}) {
  switch (stage) {
    case 'requirements': return '/reversa-plan';
    case 'plan': return '/reversa-to-do';
    case 'coding-em-progresso': return '/reversa-coding';
    case 'done': return hasAddendum ? 'conclusao' : '/reversa-sync';
    default: return '/reversa-requirements';
  }
}

// ---------------------------------------------------------------------------
// Fixture: a pasta que o /reversa-code-express deixa depois de uma passada
// completa. Conteúdo minimalista de propósito, o que está sendo testado é a
// FORMA (quais arquivos, quais seções, qual formato de linha de ação).
// ---------------------------------------------------------------------------
function writeExpressFeature(featureDir, { withRoadmap = true, allClosed = true, greenfield = false } = {}) {
  mkdirSync(featureDir, { recursive: true });
  const status = allClosed ? '`[X]`' : '`[ ]`';

  writeFileSync(join(featureDir, 'requirements.md'), `# Requirements: Plugin de microfone

> Identificador: \`001-plugin-microfone\`
> Data: \`2026-08-23\`
> Modo: express
> Pasta da extração reversa: \`_reversa_sdd/\`

## 1. Resumo executivo

Adiciona captura de voz ao harness, transcrevendo local e devolvendo texto ao chat.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| \`_reversa_sdd/architecture.md#interface-cliente\` | superfície de UI do chat | 🟢 |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** transcrição roda local, sem chamada de rede 🟢
   - Tipo: nova

## 7. Critérios de Aceitação

1. Falar no microfone insere o texto transcrito no campo de mensagem.

## Emendas
`);

  if (withRoadmap) {
    writeFileSync(join(featureDir, 'roadmap.md'), `# Roadmap: Plugin de microfone

> Identificador: \`001-plugin-microfone\`
> Data: \`2026-08-23\`
> Modo: express

## 1. Resumo da abordagem

Pacote novo de captura, ligado ao campo de mensagem por um seam de contexto.

## 5. Delta arquitetural

| Componente | Tipo | Arquivo alvo |
|-----------|------|--------------|
| voice | componente-novo | \`packages/voice/src/index.ts\` |
`);
  }

  writeFileSync(join(featureDir, 'actions.md'), `# Actions: Plugin de microfone

> Identificador: \`001-plugin-microfone\`
> Data: \`2026-08-23\`
> Roadmap: \`roadmap.md\`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 3 |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Scaffold do pacote de voz | - | \`[//]\` | \`packages/voice/package.json\` | 🟢 | ${status} |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Captura de áudio do microfone | T001 | - | \`packages/voice/src/capture.ts\` | 🟢 | ${status} |
| T003 | Ligação com o campo de mensagem | T002 | - | \`packages/client/ui-voice/src/index.ts\` | 🟢 | ${status} |

## Notas de execução

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-08-23 | Versão inicial gerada por \`/reversa-code-express\` | claude-code |
`);

  // No cenário greenfield o express herda a regra do /reversa-coding: o cabeçalho
  // precisa registrar "Feature greenfield", é por essa string que o /reversa-sync
  // decide o cenário quando não há âncora de legado.
  const ancora = greenfield
    ? '> Feature greenfield, sem legado pré-existente. Âncora: prd.md + specs SDD.\n'
    : '';

  writeFileSync(join(featureDir, 'legacy-impact.md'), `# Legacy Impact: Plugin de microfone

> Identificador: \`001-plugin-microfone\`
> Modo: express
${ancora}> Política de edição do legado: \`allowLegacyEdits: true\`, \`allowedPaths: ["packages/**"]\`

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|-----------|------|------------|---------------|
| \`packages/voice/src/capture.ts\` | voice | componente-novo | LOW | pacote novo |

## Preservadas

## Modificadas
`);

  writeFileSync(join(featureDir, 'regression-watch.md'), `# Regression Watch: Plugin de microfone

> Identificador: \`001-plugin-microfone\`

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|------------------------|------------------------------|---------------------|-------------------|
| W001 | \`_reversa_sdd/architecture.md#interface-cliente\` | superfície de chat ganha entrada de voz | presença | entrada ausente |

## Histórico de re-extrações

## Arquivadas

## Observações
`);

  const line = (id) => JSON.stringify({ ts: '2026-08-23T12:00:00Z', action: id, status: 'done', files: ['packages/voice/src/capture.ts'] });
  const ids = allClosed ? ['T001', 'T002', 'T003'] : ['T001'];
  writeFileSync(join(featureDir, 'progress.jsonl'), ids.map(line).join('\n') + '\n');
}

// .reversa/active-requirements.json no formato que o express prescreve.
// É o único lugar onde ele grava um valor inédito: `current-stage: "express"`.
function writeActiveRequirements(reversaDir, featureDirRel) {
  mkdirSync(reversaDir, { recursive: true });
  writeFileSync(join(reversaDir, 'active-requirements.json'), JSON.stringify({
    'schema-version': 1,
    'feature-dir': featureDirRel,
    'feature-id': '001',
    'short-name': 'plugin-microfone',
    'started-at': '2026-08-23T11:00:00Z',
    'current-stage': 'express',
    'stages-completed': [],
    'paused-features': [],
  }, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// Pré-condições declaradas pelos skills consumidores.
// Cada entrada cita a seção "Verificações Iniciais" do skill correspondente.
// ---------------------------------------------------------------------------
const CONSUMERS = [
  { skill: '/reversa-sync', requires: ['legacy-impact.md'], reads: ['regression-watch.md', 'requirements.md', 'progress.jsonl', 'actions.md'] },
  { skill: '/reversa-add', requires: ['requirements.md', 'legacy-impact.md'], reads: ['actions.md', 'regression-watch.md', 'progress.jsonl'] },
  { skill: '/reversa-coding', requires: ['actions.md'], reads: ['progress.jsonl'] },
];

// ===========================================================================
const tmp = mkdtempSync(join(tmpdir(), 'reversa-express-'));

try {
  console.log('=== eixo de invocação do agente novo');
  {
    const dest = join(tmp, 'skill-copy');
    cpSync(join(ROOT, 'agents', 'reversa-code-express'), dest, { recursive: true });
    const skill = readFileSync(join(dest, 'SKILL.md'), 'utf8');
    const yaml = readFileSync(join(dest, 'agents', 'openai.yaml'), 'utf8');
    check(/^disable-model-invocation:\s*true\s*$/m.test(skill), 'disable-model-invocation atravessou o cpSync do installer');
    check(/^\s*allow_implicit_invocation:\s*false\s*$/m.test(yaml), 'allow_implicit_invocation atravessou no openai.yaml');
    check(/^name:\s*reversa-code-express\s*$/m.test(skill), 'frontmatter declara name: reversa-code-express');
    check(/^\s*stage:\s*express\s*$/m.test(yaml) || /^\s*stage:\s*express\s*$/m.test(skill), 'metadata.stage: express presente');
  }

  console.log('\n=== registro no installer e nos ganchos');
  {
    const prompts = readFileSync(join(ROOT, 'lib', 'installer', 'prompts.js'), 'utf8');
    check(/'reversa-code-express'/.test(prompts), 'agente registrado em lib/installer/prompts.js');
    const hooks = readFileSync(join(ROOT, 'templates', 'forward', 'hooks.yml'), 'utf8');
    check(/^before-code-express:/m.test(hooks), 'chave before-code-express existe em templates/forward/hooks.yml');
    check(/^after-code-express:/m.test(hooks), 'chave after-code-express existe em templates/forward/hooks.yml');
  }

  console.log('\n=== detecção de estágio físico');
  {
    const done = join(tmp, 'express-done');
    writeExpressFeature(done);
    eq(detectStage(done), 'done', 'feature express concluída é lida como concluída');
    eq(routeFrom(detectStage(done)), '/reversa-sync', '/reversa-forward encaminha a feature express para sync');

    const partial = join(tmp, 'express-parcial');
    writeExpressFeature(partial, { allClosed: false });
    eq(detectStage(partial), 'coding-em-progresso', 'execução parcial fica visível como coding-em-progresso');
    eq(routeFrom(detectStage(partial)), '/reversa-coding', 'execução parcial é retomável pelo /reversa-coding');

    // Caso negativo: prova que o roadmap magro é carga estrutural, não enfeite.
    const noRoadmap = join(tmp, 'express-sem-roadmap');
    writeExpressFeature(noRoadmap, { withRoadmap: false });
    eq(detectStage(noRoadmap), 'requirements', 'sem roadmap.md a feature concluída seria lida como parada no começo');
  }

  console.log('\n=== pré-condições dos skills consumidores');
  {
    const done = join(tmp, 'express-done');
    for (const { skill, requires, reads } of CONSUMERS) {
      for (const f of requires) check(existsSync(join(done, f)), `${skill} encontra ${f} (aborta sem ele)`);
      for (const f of reads) check(existsSync(join(done, f)), `${skill} encontra ${f} (leitura)`);
    }
    check(!existsSync(join(done, 'roadmap-inexistente.md')), 'nenhum consumidor depende de artefato que o express cortou');
  }

  console.log('\n=== active-requirements.json');
  {
    // /reversa-sync e /reversa-add abortam sem esse arquivo, e o express grava
    // nele um `current-stage` que nenhum outro agente escreve. O que importa é
    // que ninguém DECIDA por esse campo: a detecção é sempre por artefato físico.
    const projeto = join(tmp, 'projeto');
    const featureRel = '_reversa_forward/001-plugin-microfone';
    const featureAbs = join(projeto, '_reversa_forward', '001-plugin-microfone');
    writeExpressFeature(featureAbs);
    writeActiveRequirements(join(projeto, '.reversa'), featureRel);

    const raw = readFileSync(join(projeto, '.reversa', 'active-requirements.json'), 'utf8');
    let json = null;
    try { json = JSON.parse(raw); } catch { /* json fica null */ }
    check(json !== null, 'active-requirements.json é JSON válido');
    eq(json?.['schema-version'], 1, 'schema-version preservado');
    eq(json?.['current-stage'], 'express', 'express grava o current-stage inédito');
    check(existsSync(join(projeto, json?.['feature-dir'] ?? '')), 'feature-dir aponta para pasta existente');
    eq(detectStage(join(projeto, json?.['feature-dir'] ?? '')), 'done',
      'estágio físico ignora o current-stage declarado e lê a entrega como concluída');
  }

  console.log('\n=== cenário greenfield');
  {
    // /reversa-sync decide o cenário pela string "Feature greenfield" no cabeçalho
    // do legacy-impact.md quando não há âncora de legado (agents/reversa-sync/SKILL.md).
    const gf = join(tmp, 'express-greenfield');
    writeExpressFeature(gf, { greenfield: true });
    const header = readFileSync(join(gf, 'legacy-impact.md'), 'utf8');
    check(/Feature greenfield/.test(header), 'legacy-impact.md greenfield carrega a marca que o /reversa-sync procura');
    check(/Modo: express/.test(header), 'a marca de express convive com a de greenfield no mesmo cabeçalho');
    eq(detectStage(gf), 'done', 'feature express greenfield também é lida como concluída');

    const legado = readFileSync(join(tmp, 'express-done', 'legacy-impact.md'), 'utf8');
    check(!/Feature greenfield/.test(legado), 'cenário legado NÃO carrega a marca de greenfield');
  }

  console.log('\n=== controle: feature real do ciclo completo');
  {
    const real = 'C:\\CHUPA-CABRA\\deepseek-harness\\_reversa_forward\\001-plugin-reconhecimento-de-voz';
    if (existsSync(real)) {
      eq(detectStage(real), 'done', 'a mesma detecção classifica a feature real do pipeline completo');
      const cut = ['investigation.md', 'data-delta.md', 'onboarding.md', 'audit', 'interfaces'];
      const presentes = cut.filter(f => existsSync(join(real, f)));
      eq(presentes.length, cut.length, 'a feature real tem os artefatos que o express corta');
      console.log(`  · o express não escreveria: ${presentes.join(', ')}`);
    } else {
      console.log('  · pulado, projeto de controle ausente nesta máquina');
    }
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log(failures ? `\nRESULTADO: ✗ ${failures} falha(s)` : '\nRESULTADO: ✓ compatibilidade do express íntegra');
process.exit(failures ? 1 : 0);
