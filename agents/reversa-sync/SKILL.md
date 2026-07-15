---
name: reversa-sync
description: Convergência pós-coding do Reversa. Destila a feature entregue (requirements, legacy-impact, regression-watch) em um adendo dentro de `_reversa_sdd/addenda/`, mantendo a extração reversa representativa do sistema entre re-extrações, sem tocar nos artefatos originais. Use quando o usuário digitar "/reversa-sync", "reversa-sync", "sincronizar specs", "converger a feature na extração" ou pedir para atualizar a extração com a feature recém-codada. Passo opcional do ciclo forward, depois de `/reversa-coding`.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: sync
---

Você é o sincronizador. Entre uma entrega do ciclo forward e a próxima re-extração `/reversa`, a extração em `_reversa_sdd/` fica defasada: o código já mudou, mas `architecture.md` e `domain.md` continuam descrevendo o sistema anterior. Sua missão é fechar esse intervalo criando um **adendo** por feature entregue em `_reversa_sdd/addenda/`, para que quem ler a extração (humano ou agente) enxergue o sistema como ele está hoje. O adendo é uma ponte: vale até a próxima re-extração, que o marcará como superado.

## Antes de começar

1. Leia `.reversa/state.json` para resolver `output_folder` e `forward_folder`
2. Use os valores reais nos lugares onde o texto mencionar `_reversa_sdd/` ou `_reversa_forward/`

## Verificações Iniciais

1. Leia `.reversa/active-requirements.json`
   1.1. Se ausente, aborte com mensagem apontando `/reversa-requirements`
2. Verifique a existência de `feature-dir/legacy-impact.md`
   2.1. Se ausente, aborte: "A feature ativa ainda não passou pelo `/reversa-coding`, não há entrega para converger. Rode `/reversa-coding` primeiro."
3. Detecte o cenário da entrega:
   3.1. **Legado:** `_reversa_sdd/` contém `architecture.md` E `domain.md`
   3.2. **Greenfield:** o cabeçalho de `legacy-impact.md` registra "Feature greenfield", ou `_reversa_sdd/` contém `prd.md` E specs em `_reversa_sdd/sdd/` (sem a âncora de legado)
4. Se `feature-dir/actions.md` ainda tiver ações `[ ]` abertas, apresente o menu antes de prosseguir:

   ```
   A feature ativa ainda tem <N> ação(ões) aberta(s) em actions.md.

     [1] Sincronizar parcial: gera o adendo com o que já foi entregue, uma reexecução futura complementa
     [2] Aguardar: encerrar agora e voltar depois que /reversa-coding fechar todas as ações
     [3] Outro: descreva o que você prefere fazer
   ```

   Aguarde a escolha. Não decida sozinho.
5. Aplique `before-sync` da forma padrão

## Fontes de leitura

Leia, pulando o que não existir:

1. `feature-dir/legacy-impact.md` (obrigatório, fonte principal do delta)
2. `feature-dir/regression-watch.md` (IDs dos watch items criados)
3. `feature-dir/requirements.md` (objetivo e requisitos da feature)
4. `feature-dir/progress.jsonl` (contagem de ações executadas)
5. Os artefatos da extração citados no `legacy-impact.md`, apenas para conferir nomes de seções ao montar os apontadores

## Geração do adendo

Caminho: `_reversa_sdd/addenda/<feature-id>-<short-name>.md` (mesmo nome da pasta da feature em `_reversa_forward/`). Crie a pasta `addenda/` se ainda não existir.

Estrutura do arquivo:

1. Cabeçalho com título, identificador da feature, data ISO 8601 e cenário (`legado` ou `greenfield`)
2. Seção `## Vigência` contendo, na criação, uma única linha:

   ```
   Vigente desde YYYY-MM-DD.
   ```

   A pipeline reversa acrescenta depois a linha `Superado pela re-extração de YYYY-MM-DD.` quando `/reversa` rodar de novo. Um adendo é **vigente** enquanto não houver linha de superação. Nunca crie o adendo já superado, nunca escreva essa segunda linha você mesmo.
3. Seção `## Resumo da entrega`: objetivo da feature em prosa curta (do `requirements.md`) e a contagem de ações concluídas
4. Seção `## Impacto por artefato da extração`: tabela `Artefato | Seção | Tipo de impacto | Delta`
   4.1. **Cenário legado:** derive as linhas do `legacy-impact.md`. Componentes apontam para `_reversa_sdd/architecture.md#<seção>`, regras de negócio para `_reversa_sdd/domain.md#<seção>`. Reuse a taxonomia do coding: `regra-alterada`, `regra-removida`, `regra-nova`, `componente-novo`, `componente-extinto`, `delta-de-dados`, `delta-de-contrato-externo`
   4.2. **Cenário greenfield:** aponte para `_reversa_sdd/prd.md` e para as specs em `_reversa_sdd/sdd/`, com tipo `componente-novo`, registrando os requisitos funcionais implementados
   4.3. A coluna `Delta` descreve em uma frase como o artefato deveria ser lido agora (por exemplo: "a regra X passou a exigir Y, ver legacy-impact.md da feature")
5. Seção `## Regras sob vigilância`: apenas os IDs dos watch items (`W001`, ...) com apontador para `_reversa_forward/<feature>/regression-watch.md`. Não duplique o conteúdo dos watch items
6. Seção `## Fontes`: caminhos relativos dos artefatos da feature usados como base

Política de escrita:

- Primeira execução: cria o arquivo (escrita atômica, tempfile mais rename, UTF-8 sem BOM)
- Reexecução para a mesma feature (por exemplo, após sincronização parcial): acrescente uma seção `## Atualização YYYY-MM-DD` ao final com o delta novo. Jamais reescreva ou apague o conteúdo anterior do adendo
- Jamais modifique `architecture.md`, `domain.md`, `prd.md`, as specs em `sdd/` ou qualquer outro artefato da extração. O adendo anota, não corrige

## Ganchos Pós-execução

Aplique `after-sync` da forma padrão.

## Relatório final ao usuário

1. Caminho absoluto do adendo criado ou atualizado
2. Quantidade de impactos registrados na tabela, quebrados por tipo
3. Cenário detectado (legado ou greenfield)
4. Aviso explícito: o adendo mantém a extração legível até a próxima re-extração. Ao rodar `/reversa` de novo, a verificação de regressão marcará este adendo como superado e a extração regenerada volta a ser a fonte única

Termine com:

> Digite **CONTINUAR** para prosseguir com `/reversa-forward` (nova feature) ou digite `/reversa` quando quiser a re-extração completa.

## Regra absoluta

**Nunca apague, modifique ou sobrescreva arquivos pré-existentes do projeto.**
Este skill escreve APENAS em `_reversa_sdd/addenda/`. Os artefatos originais da extração e os artefatos da feature em `_reversa_forward/` são somente leitura aqui.
