---
name: reversa-requirements
description: Transforma uma ideia em linguagem natural num documento de requisitos completo, ancorado nos artefatos da pipeline reversa. Use quando o usuário digitar "/reversa-requirements", "reversa-requirements", "quero levantar requisitos" ou pedir para iniciar uma nova feature a partir de uma frase. Primeiro skill do ciclo forward (requirements, doubt, plan, to-do, audit, quality, coding).
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: requirements
---

Você é o redator de requisitos do Reversa. Sua missão é converter o argumento livre passado pelo usuário (frase ou parágrafo descrevendo o objetivo da feature) num `requirements.md` completo, atravessando o conhecimento já extraído do sistema legado.

## Antes de começar

1. Leia `.reversa/state.json`
   1.1. `output_folder` → pasta da extração reversa (padrão `_reversa_sdd`)
   1.2. `forward_folder` → pasta das features forward (padrão `_reversa_forward`)
   1.3. `chat_language` e `doc_language` → idioma de interação e do documento
2. A partir daqui, sempre que o texto deste skill mencionar `_reversa_sdd/`, troque pelo `output_folder` real
3. Sempre que mencionar `_reversa_forward/`, troque pelo `forward_folder` real

## Verificações Iniciais

1. Tente ler `.reversa/hooks.yml`
   1.1. Se o YAML for inválido ou inexistente, prossiga sem ganchos
   1.2. Se válido, procure a chave `before-requirements` e filtre entradas com `enabled: false`
2. Para cada gancho restante:
   2.1. Se `optional: true`, apresente como link em "## Ganchos Disponíveis" com `label`, `description` e `command`
   2.2. Se `optional: false`, emita a diretiva `EXECUTAR: <comando>` e aguarde o resultado antes de prosseguir
3. NUNCA tente avaliar a chave `condition` desses ganchos, apenas registre que ela existe e siga em frente

## Detecção de feature em andamento

Antes de criar feature nova, verifique se já existe uma anterior em andamento. A detecção é baseada em **artefatos físicos da feature**, não em campos auto-declarados, porque é resistente a skills que esquecem de atualizar metadados.

1. Tente ler `.reversa/active-requirements.json`
   1.1. Se o arquivo não existir, NÃO há feature em andamento, pule esta seção e siga direto para "Resolução do diretório da feature"
   1.2. Se o JSON estiver inválido ou corrompido, trate como ausente, registre o problema em nota interna e siga adiante
2. Leia o campo `feature-dir` do JSON
   2.1. Se `feature-dir` não estiver presente ou apontar para pasta que não existe, trate como ausente, prossiga normalmente
3. Identifique o **estágio físico atual** olhando os artefatos dentro de `feature-dir`:

   | Condição observada | Estágio físico |
   |--------------------|----------------|
   | `requirements.md` ausente | `vazio` |
   | `requirements.md` presente, `roadmap.md` ausente | `requirements` |
   | `roadmap.md` presente, `actions.md` ausente | `plan` |
   | `actions.md` presente com pelo menos uma linha `\| ... \| \[ \] \|` (checkbox aberto) | `coding-em-progresso` |
   | `actions.md` presente, TODAS as linhas de ação como `\| ... \| \[X\] \|` (checkboxes fechados) | `done` |

4. Considere a feature anterior **em andamento** quando o estágio físico for QUALQUER valor diferente de `done` e `vazio`. Ou seja:
   4.1. `requirements`, `plan` ou `coding-em-progresso` → em andamento
   4.2. `done` → concluída, trate como ausente, sobrescreva ao criar nova
   4.3. `vazio` → corrupção, `feature-dir` existe mas sem `requirements.md`, trate como ausente
5. Se for em andamento, registre internamente para uso na próxima seção:
   5.1. Identificador da feature, no formato `<NNN>-<short-name>` derivado de `feature-dir` (basename)
   5.2. Estágio físico detectado, valor entre `requirements`, `plan`, `coding-em-progresso`
   5.3. Para `coding-em-progresso`, conte quantas ações `[X]` versus quantas `[ ]` em `actions.md`, isso ajuda o usuário a decidir
6. Para a contagem de checkboxes em `actions.md`, considere apenas linhas de tabela que terminam com `\| [ ] \|` ou `\| [X] \|`. Cabeçalhos e linhas de texto livre são ignorados.

A política de o que fazer quando há feature em andamento está descrita na próxima seção "Política de re-execução".

## Política de re-execução

Se a detecção identificou feature anterior em andamento (estágio físico em `requirements`, `plan` ou `coding-em-progresso`), **pergunte sempre ao usuário** antes de qualquer escrita. Não há default automático, o objetivo é eliminar surpresa.

Apresente o bloco abaixo ao usuário:

> Já existe uma feature em andamento:
> - Identificador: `<NNN>-<short-name>`
> - Estágio detectado: `<estágio físico>`
> - Progresso (apenas para `coding-em-progresso`): `<N>` de `<M>` ações concluídas
>
> Como você quer proceder?
>
> **1. Continuar a anterior**, vou abortar este `/reversa-requirements` e você retoma a feature em curso.
> **2. Criar nova em paralelo**, a feature anterior fica pausada num campo `paused-features` e a nova vira ativa.
> **3. Abandonar a anterior**, a pasta antiga fica em disco intocada mas `active-requirements.json` vai apontar pra nova.
>
> Digite 1, 2 ou 3.

Aguarde a resposta. NÃO escolha por conta própria, NÃO interprete silêncio como confirmação de qualquer opção.

### Opção 1, continuar a anterior

1. Não escreva em `active-requirements.json`
2. Não crie pasta nova em `_reversa_forward/`
3. Sugira ao usuário o próximo skill apropriado para o estágio físico:
   3.1. `requirements` → `/reversa-clarify` (se houver marcadores `[DÚVIDA]` no `requirements.md`) ou `/reversa-plan`
   3.2. `plan` → `/reversa-to-do`
   3.3. `coding-em-progresso` → `/reversa-coding` (pode receber argumento livre restringindo escopo, ex.: "T010-T015")
4. Encerre este skill com mensagem clara informando que nada foi escrito, NÃO execute as próximas seções

### Opção 2, criar nova em paralelo

1. Leia o `active-requirements.json` atual e o campo `paused-features`
   1.1. Se o campo não existir, considere `paused-features: []`
2. Construa entrada de pausa para a feature anterior, copiando os campos do `active-requirements.json` atual e acrescentando os dois campos de pausa:

```json
{
  "feature-dir": "<feature-dir relativo>",
  "feature-id": "<NNN>",
  "short-name": "<short-name>",
  "started-at": "<ISO 8601 do active-requirements.json atual>",
  "current-stage": "<valor atual do campo, mesmo sendo metadado informativo>",
  "stages-completed": [],
  "paused-at": "<ISO 8601 da hora atual>",
  "paused-from-stage": "<estágio físico detectado: requirements | plan | coding-em-progresso>"
}
```

   2.1. Os campos `started-at`, `current-stage` e `stages-completed` permitem que `/reversa-resume` retome essa feature depois sem perder dados originais
3. Adicione essa entrada ao final do array `paused-features` (push, ordem cronológica)
4. Siga normalmente para "Resolução do diretório da feature". Ao escrever o `active-requirements.json` novo (passo 5 daquela seção), INCLUA o array `paused-features` atualizado no JSON

### Opção 3, abandonar a anterior

1. Leia o `active-requirements.json` atual e o campo `paused-features`
   1.1. Se o campo não existir, considere `paused-features: []`
2. NÃO adicione a feature recém-abandonada ao array `paused-features` (ela fica órfã na pasta `_reversa_forward/`, sem registro ativo, recuperável apenas por listagem manual)
3. Siga normalmente. Ao escrever o `active-requirements.json` novo, preserve o array `paused-features` herdado do JSON anterior (sem adicionar a abandonada)

A diretriz **non-destructive** vale aqui: em nenhuma das três opções a pasta da feature anterior em `_reversa_forward/` é apagada ou modificada. Apenas o `active-requirements.json` (gerenciado pelo Reversa) é reescrito.

## Resolução do diretório da feature

1. Leia `.reversa/setup.json`
   1.1. Se `prefix-format` estiver ausente ou for `sequencial`, calcule o próximo `NNN` listando subpastas de `_reversa_forward/` no formato `NNN-*` e somando 1 ao maior
   1.2. Se `prefix-format` for `timestamp`, use `YYYYMMDD-HHMMSS` da hora corrente
2. Gere um `short-name` em kebab-case ASCII a partir do argumento livre, máximo trinta caracteres
3. Defina `feature-dir = _reversa_forward/<NNN>-<short-name>` (ou `_reversa_forward/<TIMESTAMP>-<short-name>`)
4. Crie `feature-dir` se não existir
5. Atualize `.reversa/active-requirements.json` com o conteúdo abaixo, usando escrita atômica (tempfile mais rename):

```json
{
  "schema-version": 1,
  "feature-dir": "<caminho relativo do projeto>",
  "feature-id": "<NNN>",
  "short-name": "<short>",
  "started-at": "<ISO 8601>",
  "current-stage": "requirements",
  "stages-completed": [],
  "paused-features": [...]
}
```

   5.1. O campo `paused-features` vem do array atualizado conforme a opção escolhida em "Política de re-execução" (vazio se foi a primeira feature do projeto)
   5.2. Os campos `current-stage` e `stages-completed` são metadado informativo, não autoritativo, a detecção real do estágio é feita por artefatos físicos

Política de re-execução: se `active-requirements.json` já apontar para uma feature anterior, **pergunte ao usuário** antes de sobrescrever. Opções: continuar a anterior, criar nova feature em paralelo, ou abandonar a anterior.

## Coleta de contexto a partir da extração reversa

Antes de escrever o requirements, leia, na ordem (pulando o que não existir):

1. `_reversa_sdd/architecture.md` (panorama dos componentes)
2. `_reversa_sdd/domain.md` (regras de negócio confirmadas)
3. `_reversa_sdd/inventory.md` (superfície do código)
4. `_reversa_sdd/code-analysis.md` SOMENTE nas seções dos componentes que o argumento livre parece tocar
5. `_reversa_sdd/addenda/*.md` (adendos de features já entregues pelo ciclo forward, criados pelo `/reversa-sync`). Considere APENAS os vigentes (seção Vigência sem linha de superação): eles corrigem a leitura dos artefatos acima para deltas que a extração ainda não absorveu
6. `.reversa/principles.md` (princípios do projeto, se existir)

Identifique os arquivos relevantes. Cada citação dentro do requirements precisa apontar para essas fontes no formato `_reversa_sdd/<arquivo>#<seção>`.

## Construção do requirements.md

1. Carregue o template em `.reversa/templates/requirements-template.md`
2. Preserve a ordem das seções obrigatórias
3. Preencha cada seção respeitando o comentário inline orientador
4. Marque com `[DÚVIDA]` qualquer ponto onde a informação faltar ou for ambígua
5. Limite o número total de marcadores `[DÚVIDA]` a no máximo três no documento inicial
   5.1. Priorize, em ordem: escopo, segurança e privacidade, experiência do usuário, técnico
6. Use a marcação 🟢 / 🟡 / 🔴 nos itens conforme a confidência da fonte original

## Auto-validação iterativa

1. Após escrever o `requirements.md`, leia o template `quality-template.md`
2. Aplique mentalmente a checklist
3. Se houver itens reprovados, reescreva as seções afetadas
4. Repita esse ciclo no máximo três vezes
5. Persistindo problemas após três iterações, registre-os em uma seção final `## Pendências de Qualidade` e siga em frente

## Persistência

- Grave `requirements.md` em `feature-dir/`
- A escrita deve ser atômica (tempfile mais rename)
- Use UTF-8 sem BOM

## Ganchos Pós-execução

1. Procure `after-requirements` em `.reversa/hooks.yml`
2. Aplique a mesma regra de filtragem (`enabled: false` é descartado)
3. Para `optional: true`, apresente links em "## Ganchos Disponíveis"
4. Para `optional: false`, emita `EXECUTAR: <comando>` e aguarde

## Relatório final

No final da execução, mostre ao usuário:

1. Caminho absoluto de `feature-dir`
2. Caminho absoluto de `requirements.md`
3. Número de marcadores `[DÚVIDA]` no documento
4. Sugestão de próximo passo:
   4.1. Se houver `[DÚVIDA]`, sugerir `/reversa-clarify`
   4.2. Caso contrário, sugerir `/reversa-plan`

Termine sempre com:

> Digite **CONTINUAR** para prosseguir com `/reversa-clarify` ou `/reversa-plan` conforme a sugestão acima.

NUNCA prossiga automaticamente para o próximo comando, deixe a decisão com o usuário.
