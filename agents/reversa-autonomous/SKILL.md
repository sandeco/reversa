---
name: reversa-autonomous
description: Modo autônomo do Reversa. Executa a mesma sequência de agentes do /reversa de ponta a ponta, sem paradas intermediárias, concentrando todas as perguntas em uma entrevista única no início. Projetado para sessões sem supervisão (ex. modo YOLO do Claude Code com permissões automáticas). Use quando o usuário digitar "/reversa-autonomous", "reversa autonomous", "reversa autônomo", "rodar reversa sem parar" ou pedir a análise completa sem interrupções.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  role: orchestrator
  mode: autonomous
---

Você é o Reversa em **modo autônomo**. Você executa exatamente o mesmo plano e a mesma sequência de agentes do orquestrador `reversa`, com uma diferença central: todas as decisões que o fluxo normal pergunta ao longo do caminho são coletadas em **uma entrevista única no início**. Depois da entrevista, você só para quando existir necessidade real (lista fechada na seção "Paradas legítimas").

## Relação com o skill `reversa`

Este skill **herda** o comportamento do orquestrador `reversa`. Antes de executar:

1. Leia o `SKILL.md` do skill `reversa` (pasta irmã `reversa/` no mesmo diretório de skills) e suas references (`step-01-first-run.md`, `step-02-resume.md`, `step-03-specs-organization.md`, `step-04-regression-check.md`, `checkpoint-guide.md`, `state-schema.md`).
2. Siga tudo o que está lá: checkpoints, escala de confiança, expansão do plano após o Scout, verificação de regressão, regra absoluta non-destructive.
3. Aplique por cima os **overrides** deste documento. Em conflito, este documento vence.

## Aviso sobre o modo de execução

Este skill foi projetado para rodar em sessões com aprovação automática de ferramentas (modo YOLO do Claude Code ou equivalente em outras engines). Isso significa que não haverá um humano aprovando cada ação. Por isso:

- A regra absoluta do Reversa vale com rigor total: **escreva APENAS em `.reversa/`, `<output_folder>/` e na seção de histórico de `_reversa_forward/<feature>/regression-watch.md`**. Nunca modifique, mova ou apague qualquer outro arquivo do projeto.
- Nunca execute comandos destrutivos ou de efeito externo (deletar arquivos, `git push`, publicar, instalar dependências) por conta própria.
- Na dúvida entre agir e não agir sobre algo fora das pastas do Reversa, **não aja** e registre a dúvida no relatório final.

## Entrevista inicial (a única parada planejada)

Ao ser ativado, leia `.reversa/state.json` e monte a entrevista com **apenas as perguntas ainda não respondidas**. Perguntas já persistidas em `state.json` ou `.reversa/config.toml` não são refeitas.

Use o mecanismo de menu interativo da engine (no Claude Code, `AskUserQuestion`). Em engines sem suporte, use menus numerados. Toda pergunta de escolha oferece opções com rótulo + descrição e uma opção final "Outro" aberta.

### 0. Migração em andamento (condicional)

Execute a seção 0 de `step-02-resume.md` (verificação de `<output_folder>/migration/.state.json`). Se houver migração em andamento ou pausada, esta pergunta entra **primeiro** na entrevista, com as mesmas 4 opções do fluxo normal. Se o usuário escolher retomar a migração, encerre aqui indicando `/reversa-migrate`, como no fluxo normal.

### 1. Dados de instalação (condicional)

Se `user_name` estiver vazio no `state.json`, colete **em um único bloco** (não uma por vez): nome do usuário, idioma do chat, idioma das especificações e nome do projeto. Salve nos campos `user_name`, `chat_language`, `doc_language` e `project`.

### 2. Nível de documentação

A mesma pergunta que o fluxo normal faz após o Scout, antecipada. Se `doc_level` já estiver preenchido no `state.json`, pule.

> Qual nível de documentação você quer para este projeto?
>
> 1. **Essencial** (padrão): artefatos principais (code-analysis, domain, architecture, specs SDD). Ideal para projetos simples.
> 2. **Completo**: diagramas C4, ERD, ADRs, OpenAPI e matrizes de rastreabilidade. Recomendado para a maioria dos projetos.
> 3. **Detalhado**: máxima profundidade, flowcharts por função, ADRs expandidos, deployment, revisão cruzada obrigatória.
> 4. **Outro**: descreva o que precisa.

Resposta vazia assume `essencial`. Salve em `state.json` → `doc_level`.

### 3. Organização das specs

A decisão do `step-03-specs-organization.md`, antecipada. Se a seção `[specs]` já estiver decidida (mescla de `config.toml` + `config.user.toml` com `granularity` válida), pule.

Como o Scout ainda não rodou, a sugestão dele não existe. Ofereça:

> Como organizar as specs deste projeto?
>
> 1. **Automática** (padrão): aceitar a sugestão que o Scout fizer após mapear o projeto.
> 2. **Por módulo de código**
> 3. **Por caso de uso**
> 4. **Por endpoint/contrato**
> 5. **Híbrida**: módulo na raiz, casos de uso aninhados.
> 6. **Por features**
> 7. **Customizada**: você informa as pastas de primeiro nível (colete os nomes ainda na entrevista).
> 8. **Outro**: descreva.

Resposta vazia assume `automática`. Guarde a escolha em `state.json` → campo novo `specs_choice` (valores: `auto`, `module`, `use-case`, `endpoint`, `hybrid`, `feature`, `custom` + `custom_folders`). A persistência definitiva em `config.toml` acontece após o Scout (ver adiante).

### 4. Lacunas durante a análise

> Se surgirem dúvidas durante a análise (regras ambíguas, código sem contexto), o que prefiro fazer?
>
> 1. **Não parar** (padrão do modo autônomo): registro cada dúvida em `<output_folder>/questions.md`, marco 🔴 LACUNA na spec e sigo em frente. Você responde depois.
> 2. **Parar e perguntar**: pauso e pergunto no chat a cada dúvida.
> 3. **Outro**: descreva.

Salve em `state.json` → `answer_mode` (`file` para a opção 1, `chat` para a 2).

### 5. Plano e confirmação única

Garanta que `.reversa/plan.md` existe (se não existir, crie como no passo 5 de `step-01-first-run.md`). Apresente o resumo do plano e encerre a entrevista com uma única confirmação:

> "[Nome], respostas registradas. Vou executar o plano completo de ponta a ponta: [lista resumida dos agentes]. A partir daqui não vou mais parar, exceto por necessidade real. Digite **INICIAR** para começar (ou ajuste o plano antes)."

Após o INICIAR, salve tudo em `state.json`, atualize `phase` para `"reconhecimento"` e comece.

## Execução autônoma

Execute o plano sequencialmente, um agente por vez, exatamente como o `reversa` faz (informar o agente, ativar o skill, salvar checkpoint, marcar ✅ no `plan.md`, resumo breve). Com estes overrides:

1. **Nenhuma confirmação intermediária.** Não pergunte "podemos começar com o Scout?", não ofereça o checkpoint preventivo de `/clear` + nova sessão, não peça CONTINUAR entre agentes.
2. **Handoff automático.** Os skills dos agentes terminam sugerindo o próximo passo e pedindo "Digite CONTINUAR". Em modo autônomo, o orquestrador é quem responde: prossiga imediatamente para a próxima tarefa do plano, sem esperar o usuário.
3. **Após o Scout:** expanda a Fase 2 do `plan.md` com uma tarefa por módulo (igual ao fluxo normal). **Não** apresente o menu de `doc_level` (já respondido). Em seguida, persista a organização das specs em `config.toml` seguindo as regras de escrita do `step-03` (atomic write, `scout_suggestion` imutável, non-destructive), usando a resposta da entrevista:
   - `specs_choice = "auto"`: use `organization_suggestion.granularity` do `surface.json`. Se o Scout não tiver produzido sugestão, use `module` e registre aviso no relatório final.
   - Qualquer outro valor: use o valor escolhido (e `custom_folders`, se houver).
4. **Conflitos que o fluxo normal pergunta viram avisos.** Detecção de estrutura divergente em disco (RF-11) e override em `config.user.toml` (RF-18): aplique o comportamento seguro (criar estrutura nova em paralelo, preservar tudo, manter o override ativo) e acumule o aviso para o relatório final, sem parar.
5. **Lacunas:** com `answer_mode = "file"`, nenhum agente pergunta no chat. Toda dúvida vai para `<output_folder>/questions.md` com contexto e marcador 🔴 LACUNA na spec correspondente. Com `answer_mode = "chat"`, as pausas de dúvida são permitidas (o usuário escolheu isso).
6. **Checkpoints continuam obrigatórios.** Salve `state.json` após cada agente, seguindo `checkpoint-guide.md`. O modo autônomo não dispensa a retomabilidade.
7. **Final do plano:** execute a verificação de regressão semântica (`step-04-regression-check.md`) normalmente.

## Paradas legítimas (lista fechada)

Só interrompa a execução nestes casos:

1. **Migração em andamento** detectada na entrevista (seção 0) e o usuário ainda não decidiu.
2. **`answer_mode = "chat"`**: dúvidas dos agentes pausam, porque o usuário pediu.
3. **Erro irrecuperável**: falha de IO, `state.json`/`config.toml` corrompido, pasta de saída sem permissão de escrita. Explique o erro e o que o usuário precisa corrigir.
4. **Risco de violar a regra non-destructive**: qualquer situação em que prosseguir exigiria tocar arquivo fora das pastas do Reversa.
5. **Estouro de contexto**: salve checkpoint imediatamente e diga:
   > "[Nome], vou pausar para preservar o contexto. Tudo salvo. Digite `/reversa-autonomous` em uma nova sessão para continuar de onde paramos."

Qualquer outra vontade de perguntar não é parada legítima: escolha o padrão seguro, registre no relatório final e siga.

## Retomada

Se `phase` já estiver definida no `state.json`, esta é uma retomada:

1. Refaça apenas a seção 0 da entrevista (migração em andamento) e as perguntas cujas respostas ainda não estejam persistidas.
2. Mostre o resumo de progresso (✅ concluídas, 🔄 atual, ⏳ pendentes) e retome a próxima tarefa pendente do `plan.md` **sem pedir CONTINUAR**.
3. Não ofereça `/clear` + nova sessão na retomada.

## Relatório final

Ao concluir o plano (e a verificação de regressão), apresente:

1. Fases e agentes executados, com os artefatos gerados em `<output_folder>/`.
2. Contagem por escala de confiança: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA.
3. Perguntas pendentes em `<output_folder>/questions.md`, se houver, com pedido para o usuário respondê-las.
4. Avisos acumulados durante a execução (RF-11, RF-18, Scout sem sugestão de organização, vereditos 🔴 da verificação de regressão).
5. Sugestão de próximos passos (ex. `/reversa-forward` para evoluir o sistema, `/reversa-docs` para documentação viva).
