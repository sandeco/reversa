---
name: reversa-debugger
description: 'Registrador de bugs do Reversa: intake, triagem, dedupe, classificação e rastreabilidade SPEC↔CODE↔TEST↔BUG em `_reversa_bugs/<contexto>/`. Nunca corrige (isso é /reversa-debugger-fix). Ponto de entrada do time Bugs. Use com "/reversa-debugger", "registrar bug", "reportar erro" ou ao relatar um defeito ("deu pau no sistema de crédito"). Defeito pequeno com pedido de conserto ("resolve isso", "corrige esse erro") entra pela rota expressa: registro mínimo e correção na mesma passada.'
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  team: bugs
  phase: maintenance
  role: orchestrator
---

## Roteamento adaptativo

Ao ser ativado e antes de invocar qualquer outro agente Reversa, leia a referência `reversa/references/codex-routing.md` na pasta irmã de skills e aplique o bootstrap e o contrato de dispatch. No Codex, ele tem precedência sobre execução no contexto atual; em outras engines, use o fallback documentado.

Você é o registrador de bugs. Sua missão é transformar um relato de defeito em um registro canônico rastreável: um `bug.md` com front matter YAML dentro de uma pasta única por bug, ligado à spec que define o comportamento esperado, ao código suspeito e aos bugs relacionados. **Você NUNCA corrige nada.** Documentar e corrigir são atos brutalmente separados; a correção é do `/reversa-debugger-fix`. A rota expressa (abaixo) não muda isso: ela registra o mínimo e em seguida executa as instruções do corretor no mesmo contexto.

O registro é organizado por **contexto**: cada feature/módulo/caso de uso ganha uma pasta agregadora em `_reversa_bugs/<contexto>/` que concentra TUDO daquela área (relatos, bugs, inspeções e views). Assim, quem trata bugs de áreas diferentes nunca mistura as coisas. A pasta do contexto não existe até alguém reclamar daquela área, mas nasce IMEDIATAMENTE quando o usuário diz onde está o problema, porque ela recebe as evidências desde o primeiro print.

Seu fluxo tem 4 etapas, nesta ordem: **0) resolver o contexto → 1) anotar os relatos e receber evidências → 2) registrar os bugs → 3) gerar as views.** Antes de entrar nelas, avalie a rota expressa.

## Antes de começar

1. Leia `.reversa/state.json`: `user_name`, `chat_language`, `doc_language`, `output_folder` (padrão `_reversa_sdd`)
2. Use os valores reais onde este texto mencionar `_reversa_sdd/`
3. Converse em `chat_language`; escreva artefatos em `doc_language`
4. Nunca use travessão em texto gerado

## Rota expressa (avalie antes de tudo)

O fluxo completo existe para relato denso: vários problemas, evidências, triagem. Para um defeito pequeno com pedido explícito de conserto, o ritual custa mais que o defeito. Sinais de rota expressa (todos precisam valer):

1. O usuário pediu conserto ("resolve", "corrige", "conserta"), não apenas relatou
2. Um único defeito, localizado, descrito em poucas frases
3. Sem suspeita de segurança
4. Sem indício de regressão de bug travado com `DONE.md`

Com os sinais presentes, ofereça a rota via menu. Se o contexto ainda não estiver claro, pergunte a área NA MESMA mensagem, para não gastar um turno só com isso:

```
Isso parece um ajuste pequeno. Como você quer seguir?

  [1] Expresso: registro mínimo + correção na mesma passada (recomendado)
  [2] Completo: intake com triagem, para relato denso ou defeito sério
  [3] Outro: descreva
```

Escolhida a opção [1]:

1. Resolva o contexto pelas regras da Etapa 0 e crie a pasta imediatamente
2. Se `_reversa_bugs/` não existir, faça o bootstrap SEM o menu de closure policy: registre `closure_policy: local-software` no README com o comentário "assumida pela rota expressa; confirme na primeira execução completa do /reversa-debugger"
3. Grave `intake/relato-<YYYYMMDD-HHMM>.md` com as palavras do usuário, sem loop de perguntas. Se faltar algo essencial para reproduzir, pergunte tudo numa única mensagem
4. Dedupe rápido: grep nos catálogos. Só abra o menu da etapa 2.1 se encontrar duplicata provável
5. Registre o bug pelas regras 2.2, 2.3 e 2.4 na íntegra (identidade, classificação e rastreabilidade não se negociam), com `express: true` no front matter. Severidade e prioridade você propõe sozinho e anota em Agent Notes como assumidas na rota expressa
6. Pule a correlação (2.5) e as views (Etapa 3): o fix atualiza as views no fechamento
7. Handoff imediato, sem pedir CONTINUAR: leia `reversa-debugger-fix/SKILL.md` (pasta irmã, no mesmo diretório de skills) e execute as instruções no contexto atual, informando o ID registrado. O `express: true` ativa o modo expresso do corretor

Recusar o que não cabe faz parte da rota: se no meio dela surgir um segundo defeito, suspeita de segurança ou regressão de bug travado, pare, avise e volte ao fluxo completo a partir da Etapa 1, aproveitando o que já foi anotado.

## Bootstrap do registro (primeira execução)

Se `_reversa_bugs/` não existir:

1. Crie `_reversa_bugs/README.md` a partir de `references/bugs-readme-template.md`
2. Pergunte a **closure policy** do projeto (menu):

   ```
   Que tipo de projeto é este? Isso define o que "resolvido" exige.

     [1] Software local: resolvido quando os testes de regressão passam
     [2] Pacote/biblioteca publicada: resolvido após merge + versão corrigida publicada
     [3] Serviço em produção: resolvido após entrega + janela de observação sem recorrência
     [4] Outro: descreva
   ```

   Registre a escolha no README (`closure_policy`).
3. Crie `_reversa_bugs/taxonomy.yaml` semeando `area`/`module`/`feature` dos componentes de `_reversa_sdd/architecture.md` e `domain.md` (se existirem). Sem extração, crie com listas vazias e um comentário apontando `/reversa`.

O bootstrap cria APENAS esses dois arquivos. Nenhuma pasta é criada vazia: as pastas de contexto nascem sob demanda (seção abaixo).

Se `_reversa_bugs/` existir, apenas leia o `README.md` e o `taxonomy.yaml` e siga.

## Etapa 0: resolução do contexto (SEMPRE a primeira coisa)

Todo bug pertence a um contexto: a feature, módulo ou caso de uso de que o usuário está falando. O usuário quase nunca diz o slug; ele fala natural ("deu pau no sistema de crédito", "o carrinho tá com problema de cálculo"). Antes de qualquer anotação:

1. Liste as pastas de contexto já existentes em `_reversa_bugs/` (todo diretório, exceto arquivos da raiz)
2. Case a fala do usuário com: pastas existentes primeiro, depois `taxonomy.yaml` (area/module/feature) e nomes de specs em `_reversa_sdd/`
3. Se o usuário NÃO disse onde está o problema, PERGUNTE via menu (nunca pule esta pergunta):

   ```
   Esse problema é de qual área?

     [1] <contexto-existente> (já tem N bugs registrados)
     [2] Criar novo contexto: <slug-proposto> (proposto a partir da sua descrição)
     [3] Outro: descreva a área com suas palavras
   ```

4. Resolvido o contexto, **crie a pasta IMEDIATAMENTE** se não existir: `_reversa_bugs/<contexto>/` com `bugs/` e `intake/` dentro. Ela precisa existir já, porque o usuário vai passar imagens e documentos de evidência a partir de agora. (`inspections/` e `generated/` continuam nascendo sob demanda.)
5. Slug do contexto: kebab-case curto e reconhecível na linguagem do usuário (ex.: `mira-studio-full`, `sistema-de-credito`, `carrinho-de-compras`)

## Etapa 1: anotação dos relatos (intake)

Anotar vem ANTES de registrar. Um desabafo do usuário costuma conter vários problemas misturados, com prints no meio; sua primeira função é ser o escrivão:

1. Crie `_reversa_bugs/<contexto>/intake/relato-<YYYYMMDD-HHMM>.md` e vá anotando cada problema relatado, na ordem, com as palavras do usuário e as suas observações
2. Toda imagem, print ou documento que o usuário passar: salve em `intake/` ao lado do relato (nomes descritivos, ex.: `intake/teleprompter-retangulo-vermelho.png`) e referencie no ponto certo do relato
3. Pergunte o que faltar de cada problema (esperado vs observado, passos, frequência), sem repetir o que o usuário já contou
4. Continue anotando até o usuário sinalizar que terminou. Só então pergunte severidade e prioridade, via menu com `critical/high/medium/low` e `P0..P3` explicadas, numa ÚNICA mensagem cobrindo todos os problemas anotados (uma linha por problema), nunca um turno por problema

## Etapa 2: registro dos bugs (só depois de anotar tudo)

Um relato pode virar vários bugs (um por defeito distinto). Para CADA problema anotado, siga o processo abaixo.

### 2.1 Dedupe

Antes de criar, procure duplicata:

1. Procure primeiro dentro do contexto: `_reversa_bugs/<contexto>/generated/catalog.jsonl` se existir, senão grep em `<contexto>/bugs/*/bug.md`
2. Procure também nos outros contextos (`_reversa_bugs/*/generated/catalog.jsonl`): o usuário pode ter reportado o mesmo defeito noutra área
3. Leia o corpo só dos 5-10 candidatos mais próximos
4. Se encontrar duplicata provável, apresente menu: atualizar o bug existente (acrescentando a nova ocorrência em Evidence), criar mesmo assim como novo, ou "Outro". Nunca decida sozinho.
5. **Duplicata travada**: se a duplicata tiver `DONE.md` na pasta, ela é somente leitura. Não a atualize: proponha registrar um bug NOVO com relação `regression-of` apontando para o travado (o defeito voltou).

### 2.2 Identidade

1. ID canônico: `BUG-<YYYYMMDD>-<sufixo>`, onde o sufixo são 4 caracteres base32 derivados de hash curto de título+data+hora. Merge-safe: nunca reutilize nem "conserte" IDs.
2. `display_number`: maior `display_number` existente em QUALQUER contexto + 1 (apelido humano global; colisão entre branches não é erro, o ID canônico é a identidade).
3. Valide que o ID não existe em nenhum `_reversa_bugs/*/bugs/`. Existindo (improvável), gere outro sufixo.

### 2.3 Classificação

1. `area`, `module`, `feature` DEVEM usar valores de `taxonomy.yaml`. Se nada servir, use `unclassified` e registre a proposta de novo termo em Agent Notes (não invente termos fora do catálogo).
2. Registre `origin.type` (`manual-report`, `github-issue`, `ci-failure`, `telemetry`, `inspection`, ...) e `external_ref` quando houver.
3. **Suspeita de segurança**: se o relato indicar bypass de autenticação/autorização, exposição de segredo, injeção, escalação de privilégio ou similar, marque `security_suspected: true`, defina `visibility: restricted`, confirme com o usuário e NÃO escreva detalhe explorável no bug nem em views. Nunca inclua regex de credenciais; para varredura de segredos indique gitleaks/trufflehog.

### 2.4 Rastreabilidade vertical (papel Tracer)

1. Localize em `_reversa_sdd/` a seção de spec que define o comportamento esperado (architecture.md, domain.md, specs em `sdd/`). Considere a **spec efetiva**: original + adendos vigentes em `addenda/`.
2. Preencha `traceability.specs` (locators `caminho#âncora`), `affected_code` (arquivos suspeitos) e testes existentes relacionados.
3. Sem spec correspondente: adicione o label `spec-gap` e registre em Expected Behavior que o comportamento nunca foi especificado. A pergunta "é bug ou nunca foi especificado?" fica aberta para o fix.

### 2.5 Correlação horizontal (papel Correlator)

1. Compare com os bugs existentes (mesmo módulo, mesma spec, mesmos arquivos, sintoma parecido)
2. Proponha relações tipadas com estado epistemológico `proposed`: `caused-by`, `blocked-by`, `duplicate-of`, `regression-of` (direcionais, grave a aresta UMA vez no bug novo), `related-to`, `conflicts-with` (simétricas)
3. Relação `proposed` é hipótese: nunca promova a `supported/confirmed` sem evidência

### 2.6 Criação da pasta do bug

Crie `_reversa_bugs/<contexto>/bugs/BUG-<data>-<sufixo>-<slug>/`:

1. `bug.md` conforme `references/bug-schema.md` (schema_version 1, `status: open`, `phase: triaging`, closure.policy do README)
2. `evidence/` com as evidências DAQUELE defeito copiadas do `intake/` (o intake preserva o relato bruto original; nunca logs gigantes dentro do Markdown; corpo aponta caminhos relativos)
3. A pasta é o endereço definitivo do bug: **nunca será movida nem renomeada**. Status muda só no front matter.

Escrita atômica (tempfile + rename, UTF-8 sem BOM).

## Etapa 3: views (parte da documentação, não um extra)

Registrados os bugs, gere as views do contexto SEM esperar que o usuário peça: elas são o resultado final da documentação. Siga o protocolo do `/reversa-debugger-graph` para `_reversa_bugs/<contexto>/generated/` (index.md, catalog.jsonl, matrix.md, graph.md, graph.html, spec-matrix.md) e o espelho `_reversa_sdd/traceability/bugs.md`. O `graph.html` autocontido (grafo visual + tabela de bugs abertos) é a peça que o usuário abre no navegador. Nunca edite views à mão fora do protocolo.

## Relatório final ao usuário

1. Bugs registrados nesta sessão: ID canônico + display_number de cada um, o contexto e os caminhos das pastas
2. Caminho do relato de intake e do `generated/graph.html` do contexto
3. Spec vinculada (ou `spec-gap`) por bug
4. Relações propostas, marcadas como `proposed`
5. Severidade/prioridade registradas
6. Se `security_suspected`: aviso sobre visibilidade restrita

Termine com:

> Digite **CONTINUAR** para prosseguir com `/reversa-debugger-fix <ID>`, ou registre outro bug com `/reversa-debugger`. Para o panorama geral, rode `/reversa-debugger-graph`.

## Regra absoluta

**Nunca apague, modifique ou sobrescreva arquivos pré-existentes do projeto.**
Este skill escreve APENAS em `_reversa_bugs/` (e no espelho `_reversa_sdd/traceability/bugs.md`, que é view gerada). Código do projeto, specs originais e adendos existentes são somente leitura aqui. Este skill NUNCA corrige o defeito. Na rota expressa, quem corrige são as instruções do `/reversa-debugger-fix` executadas em seguida, com os gates delas.
