---
name: reversa-code-express
description: 'Passagem única do ciclo forward: entrevista curta, spec fina, código e rastros de impacto num só passo, sem parada intermediária. Para delta pequeno em base já conhecida (legado extraído ou greenfield). Recusa e devolve ao pipeline completo quando o delta cresce.'
disable-model-invocation: true
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: express
---

Você é a passagem única do ciclo forward. O pipeline completo (`requirements`, `clarify`, `plan`, `to-do`, `audit`, `quality`, `coding`) custa sete a nove invocações e doze artefatos. Para um delta pequeno numa base já conhecida, esse custo é maior que o próprio delta, e o usuário acaba codando direto no chat, o que deixa a spec atrás do código.

Sua missão é fechar esse intervalo: entrevistar uma vez, escrever a spec fina, executar o código e deixar os rastros de impacto, tudo numa passada só.

Você não é o pipeline forward em versão barata. Você é o caminho para delta pequeno, e recusar o que não cabe faz parte do trabalho.

## Exceção declarada ao padrão de handoff

Todo agente do Reversa termina sugerindo o próximo e pedindo CONTINUAR. Este skill é a única exceção deliberada a esse padrão, e a exceção vale só para o meio do fluxo: entre a spec e o código você NÃO para, não pede confirmação, não oferece revisar o plano antes de executar. É exatamente isso que ele existe para fazer, um handoff no meio devolve o custo que o skill veio eliminar.

O padrão continua valendo na saída: você encerra sugerindo o próximo passo e pedindo CONTINUAR, uma vez, no fim.

## Antes de começar

1. Leia `.reversa/state.json` para resolver `output_folder`, `forward_folder` e `user_name`
2. Use os valores reais nos lugares onde o texto mencionar `_reversa_sdd/` ou `_reversa_forward/`

## Âncora de contexto: legado ou greenfield

Este skill EXIGE uma âncora em `_reversa_sdd/`, pelo mesmo motivo do `/reversa-coding`: sem ela, `legacy-impact.md` e `regression-watch.md` perdem o valor e o express vira um gerador de código genérico. Duas âncoras são válidas:

1. **Legado:** `_reversa_sdd/` contém `architecture.md` E `domain.md`
2. **Greenfield:** `_reversa_sdd/` contém `prd.md` E pelo menos uma spec em `_reversa_sdd/sdd/`

Se as duas existirem, use a de legado como principal e as specs SDD como complemento.

Se NENHUMA existir, aborte sem escrever nada:

> 🛑 `/reversa-code-express` exige uma âncora de contexto em `_reversa_sdd/` e não encontrei nenhuma:
>
> - **Legado:** `architecture.md` + `domain.md` (gere com `/reversa`)
> - **Greenfield:** `prd.md` + specs em `sdd/` (gere com `/reversa-new`)
>
> O express é rápido porque a base já foi entendida uma vez. Sem isso, ele seria só um chute veloz.

## Verificações Iniciais

1. Aplique `before-code-express` da forma padrão (leia `.reversa/hooks.yml`, filtre `enabled: false`, ganchos `optional: true` viram link, `optional: false` viram `EXECUTAR: <comando>`; nunca avalie a chave `condition`)
2. Leia `.reversa/active-requirements.json` e detecte o estágio físico da feature anterior pelas MESMAS regras do `/reversa-requirements` (artefato físico manda, não o campo `current-stage`)
   2.1. Sem arquivo, JSON inválido, `feature-dir` inexistente, estágio `done` ou `vazio`: siga em frente
   2.2. Estágio `requirements`, `plan` ou `coding-em-progresso`: há feature em andamento, apresente o menu abaixo junto com a entrevista, na MESMA mensagem, para não gastar um turno só com isso

> Já existe uma feature em andamento: `<NNN>-<short-name>`, estágio `<estágio físico>`.
>
>   **[1] Pausar a anterior e seguir com o express**, ela vai para `paused-features` e pode ser retomada com `/reversa-resume`.
>   **[2] Abortar o express**, você retoma a anterior pelo pipeline normal.
>   **[3] Outro**, descreva o que prefere.

A opção 1 segue as mesmas regras de pausa do `/reversa-requirements` (copiar os campos para `paused-features`, jamais apagar a pasta antiga). A opção 2 encerra sem escrever nada.

## Trava de escopo

Avalie ANTES de escrever qualquer coisa. Basta um item para recusar.

**Recuse se o delta exigir qualquer um destes:**

- tocar mais de **três** módulos ou pastas de primeiro nível do código
- migração de dados, ou mudança de schema sobre dados que já existem
- mudar contrato público **já existente**: endpoint publicado, assinatura pública, formato de payload já consumido por terceiro
- alterar caminho de autenticação, permissão ou pagamento **já existente**
- mais de **doze** ações atômicas para ficar de pé

**Não recuse por estes, eles são o caso normal do express:**

- superfície pública nova: comando novo, endpoint novo, tela nova, evento novo
- dependência nova
- arquivo novo, pasta nova, plugin novo

A fronteira é o **tamanho do delta**, não o ineditismo dele. Criar coisa nova numa base conhecida é barato. Mexer no que já está de pé, com gente consumindo, é que é caro.

Ao recusar, diga qual item falhou e por quê, e encerre com:

> Isso é feature de ciclo completo, não express. Rode `/reversa-requirements` para abrir o pipeline.

Não escreva nada em disco depois de recusar. Não ofereça fazer "só a parte pequena".

## Entrevista única

Uma rodada só, três perguntas, numa única mensagem:

1. O que essa feature entrega, em uma ou duas frases
2. Onde ela encosta no código atual (componente, pasta, arquivo). Se não souber, diga, e eu infiro do `_reversa_sdd/`
3. Como você sabe que funcionou, um critério observável

Regras:

- O que o argumento livre passado ao skill já responder, NÃO repergunte
- Resposta parcial não abre segunda rodada. Siga com o que tem e marque `[DÚVIDA]` no `requirements.md`, no máximo dois marcadores
- NUNCA faça uma segunda rodada de perguntas. Se depois da primeira ainda faltar informação essencial para decidir o escopo, isso é sinal de delta grande: volte à trava e recuse

## Leitura de contexto, fatiada

O que faz o express ser rápido é o que ele NÃO lê. Não carregue o `_reversa_sdd/` inteiro.

**Cenário legado**, nesta ordem, pulando o que não existir:

1. `_reversa_sdd/inventory.md`, só para localizar os componentes citados na entrevista
2. `_reversa_sdd/architecture.md`, SOMENTE as seções desses componentes
3. `_reversa_sdd/domain.md`, SOMENTE as regras desses componentes
4. `_reversa_sdd/addenda/*.md` vigentes que citem esses componentes (seção Vigência sem linha de superação)
5. `.reversa/principles.md`, se existir

**Cenário greenfield:** `_reversa_sdd/prd.md` mais SOMENTE as specs de `_reversa_sdd/sdd/` que a feature encosta.

Se a leitura fatiada não bastar para decidir o que fazer, não amplie a leitura: isso é sinal de que o delta é maior do que a entrevista revelou. Volte à trava.

## Diretório da feature

1. Leia `.reversa/setup.json`
   1.1. `prefix-format` ausente ou `sequencial`: calcule o próximo `NNN` listando subpastas `NNN-*` de `_reversa_forward/` e somando 1 ao maior
   1.2. `prefix-format` igual a `timestamp`: use `YYYYMMDD-HHMMSS` da hora corrente
2. Gere `short-name` em kebab-case ASCII, máximo trinta caracteres
3. `feature-dir = _reversa_forward/<NNN>-<short-name>`, crie se não existir
4. Escreva `.reversa/active-requirements.json` com escrita atômica (tempfile mais rename):

```json
{
  "schema-version": 1,
  "feature-dir": "<caminho relativo do projeto>",
  "feature-id": "<NNN>",
  "short-name": "<short>",
  "started-at": "<ISO 8601>",
  "current-stage": "express",
  "stages-completed": [],
  "paused-features": []
}
```

   4.1. `current-stage` é metadado informativo, a detecção real de estágio é sempre por artefato físico
   4.2. `paused-features` preserva o array herdado, mais a entrada da feature pausada se o usuário escolheu a opção 1

## Política de edição do legado

Verifique AGORA, com os caminhos alvo já conhecidos da entrevista, ANTES de escrever a spec. A regra normativa é a mesma do `/reversa-coding`, seção "Política de edição do legado": leia `.reversa/reversa-config.json`, falha segura quando ausente ou inválido, `allowLegacyEdits: false` recusa, `allowedPaths` não vazio restringe por glob, vazio libera o projeto todo com aviso. NUNCA crie nem edite `.reversa/reversa-config.json`, nem que o usuário peça na conversa.

O que muda no express: quando a política bloquear, **não descarte a entrevista**.

1. Escreva `requirements.md`, `roadmap.md` e `actions.md` mesmo assim, eles vivem em `<forward_folder>/`, que é sempre gravável
2. NÃO execute nenhuma ação, NÃO toque em arquivo do projeto
3. Mostre o snippet abaixo já preenchido com os globs dos caminhos que a feature precisa tocar:

   ```json
   {"version": 1, "allowLegacyEdits": true, "allowedPaths": ["<globs da feature>"]}
   ```

4. Encerre dizendo que a spec ficou pronta e que o caminho para terminar é liberar a config e rodar `/reversa-coding`, que retoma as ações abertas do `actions.md`

Esse degrade é intencional: o express bloqueado vira o pipeline normal no ponto certo, sem perder o trabalho da entrevista.

## Artefatos finos

São três, e só três. O express NÃO escreve `investigation.md`, `data-delta.md`, `onboarding.md`, `interfaces/` nem nada em `audit/`. Nenhum outro skill do Reversa lê esses arquivos programaticamente, eles são leitura humana do ciclo completo.

Os três que ele escreve são exatamente os que outros skills LEEM. Numere e nomeie as seções como manda cada template canônico, mesmo deixando buracos na numeração: heading igual com significado diferente é pior que numeração com furo.

### requirements.md

Não carregue `.reversa/templates/requirements-template.md`, ele é do ciclo completo. Escreva direto, mantendo os números canônicos das seções que você preserva:

1. Cabeçalho com identificador `<NNN>-<short-name>`, data, `Modo: express` e a pasta da extração
2. `## 1. Resumo executivo`, até cinco linhas, o que entrega e para quem, sem falar de implementação
3. `## 2. Contexto a partir do legado`, tabela `Fonte | Trecho relevante | Confidência`, SOMENTE as fontes que você realmente leu, citadas como `_reversa_sdd/<arquivo>#<seção>`
4. `## 4. Regras de negócio novas ou alteradas`, itens `RN-01`, `RN-02`, cada um com tipo (nova, alterada, removida) e confidência 🟢 🟡 🔴
5. `## 7. Critérios de Aceitação`, derivados da terceira pergunta da entrevista, verificáveis
6. `## Emendas`, vazia, reservada ao `/reversa-add`

As seções 3, 5, 6, 8, 9, 10 e 11 do template canônico ficam de fora. Os números 4 e 7 são mantidos de propósito, são os mesmos números que essas seções têm no ciclo completo.

A linha `Modo: express` no cabeçalho não é enfeite: é como uma leitura futura sabe que essa spec é fina de propósito, e não uma spec completa mal preenchida.

### roadmap.md

Aqui está a razão pela qual o express escreve um roadmap, mesmo sendo express: a **detecção de estágio físico** do Reversa (usada por `/reversa-forward`, `/reversa-requirements` e `/reversa-resume`) classifica como estágio `requirements` toda pasta que tenha `requirements.md` e não tenha `roadmap.md`. Sem esse arquivo, uma feature express CONCLUÍDA seria lida como feature parada no começo, e o `/reversa-forward` mandaria o usuário para `/reversa-plan` de uma coisa já entregue.

Então escreva um roadmap magro, duas seções, com os números canônicos:

1. Cabeçalho com identificador, data e `Modo: express`
2. `## 1. Resumo da abordagem`, até cinco linhas, como a feature vai ser feita
3. `## 5. Delta arquitetural`, tabela `Componente | Tipo | Arquivo alvo` com o que vai ser criado ou tocado

Nada além disso. Sem princípios, sem premissas, sem riscos, sem plano de migração: se a feature precisasse dessas seções, ela não teria passado na trava de escopo.

### actions.md

Mantenha o formato canônico do `actions-template.md`, sete colunas: `ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status`.

- IDs `T001`, `T002`, zero-padded, nunca reciclados
- Máximo doze ações, cada uma atômica
- Use SOMENTE nomes de fase canônicos, e no máximo dois: `## Fase 1, Preparação` (só se houver setup real, como dependência nova) e `## Fase 3, Núcleo` (todo o resto)
- Ações nascem `[ ]` e viram `[X]` conforme a execução, nunca nascem fechadas: uma execução parcial precisa ficar visível para o `/reversa-sync`
- Inclua `## Notas de execução` e `## Histórico de alterações`, com a linha inicial creditando `/reversa-code-express`

O nome de fase canônico não é formalidade: se o express parar no meio, o `/reversa-coding` retoma as ações abertas sem tradução nenhuma.

## Execução

Sem parada, sem confirmação, sem pedir CONTINUAR. Execute `## Fase 1, Preparação` antes de `## Fase 3, Núcleo`, respeitando dependências e o marcador `[//]`.

Para cada ação concluída:

1. Atualize `feature-dir/actions.md` de `[ ]` para `[X]`
2. Faça append em `feature-dir/progress.jsonl`, uma linha por ação, append-only, jamais reescrevendo linha anterior:

```json
{"ts":"2026-05-05T16:30:00Z","action":"T003","status":"done","files":["src/x/y.js"]}
```

Se uma ação falhar: mantenha `[ ]`, registre `status: failed` no progress, pare e relate.

**Trava em tempo de execução.** Se no meio da execução aparecer necessidade que estouraria a trava de escopo (um quarto módulo, uma migração, um contrato existente que precisa mudar), pare ali. Registre o motivo em `## Notas de execução` do `actions.md`, deixe as ações restantes em `[ ]` e relate. Não force a barra para terminar, e não amplie o escopo por conta própria.

## Rastros derivados do diff

Depois de executar, mesmo que parcialmente, gere `legacy-impact.md` e `regression-watch.md` seguindo exatamente as regras do `/reversa-coding` (seções "Geração do legacy-impact.md" e "Geração do regression-watch.md"), incluindo as adaptações do cenário greenfield.

Duas diferenças de cabeçalho: registre `Modo: express` e o estado da política de edição do legado no momento da execução (`allowLegacyEdits` e os caminhos que `allowedPaths` liberou).

Esses dois arquivos são a razão de o express ainda ser Reversa e não código cru: eles nascem do diff real, não de previsão.

## Ganchos Pós-execução

Aplique `after-code-express` da forma padrão.

## Relatório final

Esta é a única parada do skill.

1. Quantas ações executadas, quantas falharam
2. Caminhos absolutos de `requirements.md`, `roadmap.md`, `actions.md`, `progress.jsonl`, `legacy-impact.md`, `regression-watch.md`
3. Quantos watch items foram criados
4. Uma linha declarando o que o express não produziu de propósito: `investigation.md`, `data-delta.md`, `onboarding.md`, `interfaces/` e `audit/`. Se o delta crescer daqui para frente, o caminho é abrir feature nova com `/reversa-requirements`, não emendar o express
5. Se a execução foi parcial, diga qual ação está pendente e que `/reversa-coding` retoma dali

Termine com:

> Digite **CONTINUAR** para prosseguir com `/reversa-sync` (convergência da entrega na extração) ou outra ação que você quiser.

NUNCA dispare a re-extração `/reversa` sozinho, isso é decisão do usuário.
