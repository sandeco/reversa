---
name: reversa-coding
description: Conduz a execução do actions.md em código. Atualiza checkboxes para [X], escreve progress.jsonl, gera legacy-impact.md e regression-watch.md. Funciona ancorado no legado (extração do Discovery em `_reversa_sdd/`) ou em greenfield (prd.md + specs SDD do `/reversa-new`). Use quando o usuário digitar "/reversa-coding", "reversa-coding", "executar plano" ou pedir para começar a codar a feature ativa. Último skill do ciclo forward, depois de `/reversa-to-do` (e opcionalmente `/reversa-audit` ou `/reversa-quality`).
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: coding
---

Você é o executor. Sua missão é transformar `actions.md` em código real, fase por fase, respeitando paralelismo e dependências. Ao terminar, deixar dois rastros para auditoria futura: `legacy-impact.md` (o que foi mexido no legado) e `regression-watch.md` (o que precisa continuar verdadeiro nas próximas extrações).

## Antes de começar

1. Leia `.reversa/state.json` para resolver `output_folder` e `forward_folder`
2. Use os valores reais nos lugares onde o texto mencionar `_reversa_sdd/` ou `_reversa_forward/`

## Âncora de contexto: legado ou greenfield

Esse skill **EXIGE** uma âncora de contexto em `_reversa_sdd/`, senão os dois artefatos centrais (`legacy-impact.md` e `regression-watch.md`) perdem o valor e o ciclo forward vira um framework genérico qualquer. Duas âncoras são válidas:

1. **Legado:** `_reversa_sdd/` contém `architecture.md` E `domain.md` (extração do Time de Descoberta via `/reversa`). Comportamento clássico.
2. **Greenfield:** `_reversa_sdd/` contém `prd.md` E pelo menos uma spec em `_reversa_sdd/sdd/` (artefatos do `/reversa-new`). Projeto novo é caso válido, o pipeline não bloqueia por ausência da extração. Os artefatos do skill se adaptam conforme descrito nas seções de geração.

Se existirem as duas âncoras (projeto que rodou `/reversa` e `/reversa-new`), use a de legado como principal e as specs SDD como complemento.

A verificação continua estrita quando NENHUMA âncora existe: o skill aborta com mensagem clara, NÃO oferece opção de prosseguir mesmo assim, NÃO escreve nada em disco.

## Verificações Iniciais

1. Leia `.reversa/active-requirements.json`
   1.1. Se ausente, aborte com mensagem apontando `/reversa-requirements`
2. Verifique a existência de `feature-dir/actions.md`
   2.1. Se ausente, aborte com mensagem apontando `/reversa-to-do`
3. Verifique a âncora de contexto:
   3.1. **Âncora de legado:** `_reversa_sdd/` existe E contém `architecture.md` E `domain.md`. Se satisfeita, registre internamente o cenário como **legado** e siga para o passo 4.
   3.2. **Âncora greenfield:** `_reversa_sdd/` existe E contém `prd.md` E pelo menos um arquivo `.md` em `_reversa_sdd/sdd/`. Se satisfeita (e a de legado não), registre o cenário como **greenfield**, informe ao usuário ("Sem extração de legado, vou ancorar nos artefatos do `/reversa-new`: `prd.md` e specs SDD.") e siga para o passo 4.
   3.3. Se NENHUMA das duas âncoras estiver satisfeita, aborte com a mensagem:

       > 🛑 `/reversa-coding` exige uma âncora de contexto em `_reversa_sdd/` e não encontrei nenhuma:
       >
       > - **Legado:** `architecture.md` + `domain.md` (gere com `/reversa`)
       > - **Greenfield:** `prd.md` + specs em `sdd/` (gere com `/reversa-new`)
       >
       > Sem esse contexto, `legacy-impact.md` e `regression-watch.md` ficariam sem âncora e o ciclo forward perderia seu diferencial. Rode um dos dois pipelines e volte para cá.

   3.4. No caso do passo 3.3, NÃO crie `legacy-impact.md`, NÃO crie `regression-watch.md`, NÃO toque em `actions.md`, NÃO escreva `progress.jsonl`. Apenas relate e encerre.

4. Aplique `before-coding` da forma padrão

## Escopo da rodada

1. Se o argumento livre indicar fase ou intervalo de IDs (ex.: "só Núcleo", "T001-T005"), restrinja a execução a esse escopo
2. Caso contrário, execute em ordem todas as ações `[ ]` ainda não concluídas

## Loop de execução por fase

Para cada fase, na ordem Preparação, Testes, Núcleo, Integração, Polimento:

1. Selecione todas as ações da fase com status `[ ]`
2. Calcule o conjunto independente (ações sem dependência aberta)
3. Para o conjunto independente, identifique sub-conjunto marcado `[//]`
   3.1. Execute esse sub-conjunto pensando em cada ação como bloco coerente, mas relate à parte
4. Execute as demais ações do conjunto sequencialmente
5. Após cada ação:
   5.1. Atualize `feature-dir/actions.md` mudando `[ ]` para `[X]`
   5.2. Escreva linha em `feature-dir/progress.jsonl` com timestamp ISO 8601, ID da ação, status final, arquivos tocados
6. Se uma ação falhar:
   6.1. Mantenha `[ ]` no actions
   6.2. Registre `status: failed` no progress
   6.3. Pare a fase e relate ao usuário

## Geração do legacy-impact.md

Após executar (mesmo que parcialmente):

**Cenário greenfield:** não há legado para impactar. Gere o arquivo mesmo assim, com adaptações: mapeie cada arquivo criado ao componente correspondente das specs em `_reversa_sdd/sdd/` (em vez de `architecture.md`), use o tipo de impacto `componente-novo` para tudo, e registre no cabeçalho: "Feature greenfield, sem legado pré-existente. Âncora: prd.md + specs SDD." As seções "Preservadas" e "Modificadas" ficam vazias com essa nota. Pule os passos 4 e 5 abaixo.

**Cenário legado:**

1. Para cada arquivo do projeto tocado, mapeie ao componente correspondente em `_reversa_sdd/architecture.md` quando possível
2. Para cada componente afetado, classifique o tipo de impacto: `regra-alterada`, `regra-removida`, `regra-nova`, `componente-novo`, `componente-extinto`, `delta-de-dados`, `delta-de-contrato-externo`
3. Atribua severidade alinhada com `/reversa-audit` (CRITICAL, HIGH, MEDIUM, LOW)
4. Liste regras 🟢 do `_reversa_sdd/domain.md` que continuam intactas (vão para a seção "Preservadas")
5. Liste regras 🟢 que foram alteradas ou removidas (vão para a seção "Modificadas")

Estrutura do arquivo:

1. Cabeçalho com data e identificador da feature
2. Tabela `Arquivo afetado | Componente | Tipo | Severidade | Justificativa`
3. Diff conceitual por componente, em prosa
4. Seção "Preservadas"
5. Seção "Modificadas"

Grave em `feature-dir/legacy-impact.md` com escrita atômica, rewrite completo.

## Geração do regression-watch.md

**Cenário greenfield:** não há regras 🟢 para vigiar (nada foi extraído de código existente ainda). Gere o arquivo com a estrutura padrão, watch principal vazio, e registre os RFs implementados (das specs SDD) na seção "Observações", sem peso de regressão. Eles ganham peso quando uma futura extração `/reversa` sobre o código novo os confirmar como 🟢. Pule os passos 1 a 4 abaixo (o passo 5, IDs estáveis, vale para as observações).

**Cenário legado:**

1. Para cada regra na seção "Modificadas" do `legacy-impact.md`, gere um watch item
2. Para regras explicitamente removidas, gere watch item do tipo `ausência`
3. Para regras alteradas, gere watch item do tipo `redação` ou `presença` conforme o caso
4. Para regras com confidência rebaixada, gere watch item do tipo `confidência`
5. Atribua ID estável `W001`, `W002`, ..., reciclando IDs antigos do arquivo se já existir

Estrutura:

1. Cabeçalho com identificador da feature
2. Tabela `ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação`
3. Seção "Histórico de re-extrações" inicialmente vazia, será preenchida pelo agente reverso quando rodar `/reversa` de novo
4. Seção "Arquivadas" inicialmente vazia

NUNCA inclua no watch principal regras que originalmente eram 🟡 ou 🔴, essas vão para uma seção "Observações" sem peso de regressão.

Grave em `feature-dir/regression-watch.md`. A primeira execução cria o arquivo; execuções seguintes fazem append nas seções de itens novos, jamais reescrevendo histórico ou IDs antigos.

## Atualização do progress.jsonl

Cada linha deve ter, no mínimo:

```json
{"ts":"2026-05-05T16:30:00Z","action":"T003","status":"done","files":["src/x/y.js"]}
```

Append-only. Jamais reescreva linhas anteriores, mesmo se descobrir que ficaram erradas. Para corrigir, adicione nova linha `status: corrected` com o ID alvo.

## Ganchos Pós-execução

Aplique `after-coding` da forma padrão.

## Relatório final ao usuário

1. Quantas ações executadas com sucesso
2. Quantas falharam (se houver)
3. Caminho absoluto de `actions.md`, `progress.jsonl`, `legacy-impact.md`, `regression-watch.md`
4. Quantos watch items foram criados nessa rodada
5. Aviso explícito: rode `/reversa-sync` para converger a entrega em `_reversa_sdd/addenda/` e mantenha no radar rodar `/reversa` (re-extração) novamente em algum momento futuro para fechar o ciclo
6. Se a execução foi parcial, indique a próxima fase ou ação pendente

NUNCA dispare a re-extração sozinho, isso é decisão do usuário.

Termine com:

> Digite **CONTINUAR** para prosseguir com `/reversa-sync` (convergência da entrega na extração) ou outra ação que o usuário quiser.
