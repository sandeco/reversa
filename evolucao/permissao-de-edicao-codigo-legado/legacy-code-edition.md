# Spec: Configuração de permissão de edição do legado (reversa-config.json)

**Versão:** 1.3
**Status:** Implementada (Reversa v1.2.59)
**Autor:** Sandeco (com apoio do Claude)
**Data:** 2026-08-21
**Reviewers:** N/A

---

## 1. Resumo

O Reversa passa a ler um arquivo de configuração, `.reversa/reversa-config.json`, com uma política que por padrão proíbe qualquer alteração no código do sistema legado e que o usuário pode liberar de forma explícita, global ou restrita a caminhos específicos. Todos os agentes que operam o Reversa (Claude Code, Cursor, Codex ou outros) consultam essa política antes de criar, modificar ou apagar arquivos fora das pastas próprias do Reversa.

---

## 2. Contexto e Motivação

**Problema:**
A regra atual do Reversa é fixa e não-negociável: "Nunca apague, modifique ou sobrescreva arquivos pré-existentes do projeto legado. O Reversa escreve apenas em `.reversa/`, `_reversa_sdd/`, `_reversa_docs/` e `_reversa_forward/`". Essa regra protege o legado durante a análise, mas conflita com o ciclo `/reversa-forward`, cujo propósito é implementar código. Lida ao pé da letra, ela proíbe até a criação de arquivos novos dentro do repositório legado, e um agente pode travar no meio do pipeline citando a regra.

**Evidências:**
Caso real no projeto deepseek-harness: o forward 001 (plugin de reconhecimento de voz) precisa criar dois pacotes novos dentro de `DEEPSEEK-HARNESS/packages/` e editar uma linha de um arquivo pré-existente (`packages/api/remotes/src/client/index.ts`). A exceção precisou ser registrada manualmente no requirements.md (RN-05) e ainda assim conflita com a cláusula "escreve apenas em" do CLAUDE.md do projeto, criando risco de recusa pelo agente durante o coding.

**Por que agora:**
O ciclo forward está entrando em uso real. Sem uma política configurável, cada projeto exige remendos manuais no CLAUDE.md, e a proteção do legado passa a depender de texto improvisado em vez de um mecanismo padronizado do framework.

---

## 3. Goals (Objetivos)

- [ ] G-01: O usuário controla, por arquivo de configuração, se o Reversa pode alterar o legado, sem editar instruções de agente manualmente.
- [ ] G-02: O comportamento padrão (arquivo ausente ou recém-instalado) é idêntico ao atual: legado intocável.
- [ ] G-03: A liberação pode ser restrita a caminhos específicos, evitando o "tudo ou nada".
- [ ] G-04: A política vale para qualquer agente que opere o Reversa, porque é referenciada nos arquivos de instrução (CLAUDE.md, AGENTS.md, CURSOR.md) e nos SKILL.md dos fluxos que escrevem código.

**Métricas de sucesso:**
| Métrica | Baseline atual | Target | Prazo |
|---------|---------------|--------|-------|
| Pipeline forward concluído sem recusa do agente por conflito com a regra do legado | Recusas possíveis (exceções manuais no CLAUDE.md) | 0 recusas em projeto com config liberando os caminhos da feature | 1ª release com a feature |
| Escritas fora dos caminhos permitidos em projeto com `allowLegacyEdits: false` | Sem mecanismo de medição | 0 ocorrências em teste manual do fluxo | 1ª release com a feature |

---

## 4. Non-Goals (Fora do Escopo)

- NG-01: Permissões por agente ou por usuário (a política é única por projeto).
- NG-02: Interface gráfica ou comando interativo para editar a configuração (edição manual do JSON nesta versão).
- NG-03: Integração com git (pre-commit, proteção de branch); a política atua no momento da escrita pelo agente.
- NG-04: Migração de esquema do JSON entre versões futuras (o campo `version` existe, mas só a versão 1 é definida aqui).
- NG-05: Enforcement duro em agentes que não suportam hooks (Cursor, Codex); nesses, a política é guardrail por instrução.

---

## 5. Usuários e Personas

**Usuário primário:** Desenvolvedor usando o Reversa em um projeto legado, com nível técnico suficiente para editar um JSON simples.
**Usuário secundário:** Alunos e equipes que recebem um projeto com Reversa instalado e não devem conseguir alterar o legado por acidente.

**Jornada atual (sem a feature):**
1. O usuário roda `/reversa-forward` e o pipeline planeja criar código no repositório legado.
2. O agente encontra a regra não-negociável no CLAUDE.md e recusa ou hesita.
3. O usuário edita o CLAUDE.md do projeto à mão, escrevendo uma exceção improvisada.

**Jornada futura (com a feature):**
1. O usuário abre `.reversa/reversa-config.json` e muda `allowLegacyEdits` para `true`, listando em `allowedPaths` os caminhos da feature.
2. O agente, instruído pelos arquivos de instrução e pelo SKILL.md, lê a configuração antes de escrever.
3. O pipeline forward cria e edita apenas os arquivos permitidos, sem recusas e sem remendos manuais.

---

## 6. Requisitos Funcionais

### 6.1 Requisitos Principais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | O Reversa deve ler a política de edição do legado de `.reversa/reversa-config.json`, relativo à raiz do projeto onde o Reversa está instalado | Must | Com o arquivo presente e válido, o agente cita a política lida antes de qualquer escrita fora das pastas do Reversa |
| RF-02 | Com o arquivo ausente, o comportamento deve ser idêntico a `allowLegacyEdits: false` | Must | Em projeto sem o arquivo, o agente recusa escrita fora das pastas próprias do Reversa e informa como criar a configuração |
| RF-03 | Com `allowLegacyEdits: false`, o agente deve recusar criar, modificar ou apagar qualquer arquivo fora das pastas próprias do Reversa: `.reversa/`, `_reversa_sdd/`, `_reversa_docs/`, `_reversa_forward/`, `_reversa_bugs/` e `_reversa_refactor/`, mesmo que `allowedPaths` esteja preenchido | Must | Pedido de escrita em `src/main.py` com `allow=false` resulta em recusa com mensagem orientando a habilitar a config |
| RF-04 | Com `allowLegacyEdits: true` e `allowedPaths` não vazio, o agente deve escrever apenas em caminhos que casem com ao menos um padrão da lista; os demais continuam proibidos | Must | Com `allowedPaths: ["packages/voice/**"]`, escrita em `packages/voice/voice/src/index.ts` é aceita e em `packages/core/x.ts` é recusada |
| RF-05 | Com `allowLegacyEdits: true` e `allowedPaths` vazio ou ausente, o agente deve tratar o projeto inteiro como liberado, e deve avisar o usuário uma vez por sessão que a liberação é irrestrita | Must | Sessão com config `{"allowLegacyEdits": true}` mostra o aviso na primeira escrita fora das pastas do Reversa |
| RF-06 | Os padrões de `allowedPaths` devem ser globs relativos à raiz do projeto, com barras normais (`/`), suportando `*` e `**` | Must | `packages/client/ui-voice/**` casa com qualquer arquivo sob essa pasta em Windows e Linux |
| RF-07 | As pastas próprias do Reversa (as seis listadas em RF-03) devem permanecer sempre graváveis, independentemente da política | Must | Com `allow=false`, escrita em `_reversa_forward/001-x/plan.md` ou `_reversa_bugs/ctx/bugs/b1/bug.md` continua aceita |
| RF-08 | Os arquivos de instrução gerados na instalação do Reversa (CLAUDE.md do projeto, AGENTS.md, CURSOR.md quando existirem) devem conter um parágrafo padrão mandando o agente ler `.reversa/reversa-config.json` antes de qualquer escrita fora das pastas do Reversa e obedecer ao resultado | Must | O texto padrão consta dos templates de instalação e aparece em projeto recém-instalado |
| RF-09 | Os SKILL.md dos fluxos do Reversa que escrevem ou alteram código devem incluir o passo de verificação da política antes da primeira escrita: forward/coding, add, migrate, debugger-fix, refactor e os 7 especialistas que aplicam transformação via gate (restructure, modularize, decouple, optimize, simplify, standardize, prune) | Must | Cada SKILL.md listado contém a instrução; o fluxo forward em projeto bloqueado para no passo de verificação com mensagem clara; nos fluxos com gate, aprovação do gate não substitui a política |
| RF-10 | Ao recusar uma escrita por política, o agente deve informar o caminho recusado, o estado atual da config e o que o usuário deve editar para liberar | Must | Mensagem de recusa contém os três elementos |
| RF-11 | O Reversa deve fornecer um hook PreToolUse para Claude Code (script instalável) que bloqueia Write/Edit fora dos caminhos permitidos quando `allow=false` ou fora de `allowedPaths` quando `allow=true`, como enforcement duro opcional | Should | Com o hook instalado e `allow=false`, uma chamada Write em arquivo do legado é negada pelo hook antes de executar |
| RF-12 | O agente não deve criar nem editar `.reversa/reversa-config.json` por iniciativa própria; alterações no arquivo só ocorrem por pedido explícito do usuário na conversa | Must | Pedido "implemente X no legado" com config bloqueada resulta em recusa e orientação, nunca em auto-edição da config |
| RF-13 | A atualização do Reversa em repositório que já tem o Reversa instalado deve configurar a feature: criar `.reversa/reversa-config.json` com o default seguro (`allowLegacyEdits: false`) quando ausente, adicionar o parágrafo padrão aos arquivos de instrução existentes (CLAUDE.md, AGENTS.md, CURSOR.md) sem apagar conteúdo do usuário, e atualizar os SKILL.md dos fluxos de RF-09. A atualização informa o usuário que a feature existe e como liberá-la | Must | Após atualizar o Reversa num projeto pré-existente, o arquivo de config existe com `allowLegacyEdits: false`, os arquivos de instrução contêm o parágrafo padrão e o conteúdo anterior deles está preservado |

### 6.2 Fluxo Principal (Happy Path)

1. O usuário edita `.reversa/reversa-config.json` deixando `allowLegacyEdits: true` e `allowedPaths` com os globs da feature.
2. O usuário roda `/reversa-forward` e o pipeline chega ao passo de implementação.
3. O agente lê a configuração, confirma que os arquivos-alvo casam com `allowedPaths` e registra no documento do forward quais caminhos a política liberou.
4. O agente cria e edita apenas os arquivos permitidos.
5. Resultado: feature implementada, `git status` do legado mostra apenas mudanças dentro dos caminhos liberados.

### 6.3 Fluxos Alternativos

**Fluxo Alternativo A, projeto bloqueado:**
1. O agente chega ao passo de implementação com `allowLegacyEdits: false` (ou arquivo ausente).
2. O agente para antes da primeira escrita, exibe o estado da política e o snippet de JSON que o usuário deve salvar para liberar, e encerra o passo sem escrever.

**Fluxo Alternativo B, caminho fora da lista:**
1. Durante a implementação, o plano exige tocar um arquivo que não casa com `allowedPaths`.
2. O agente não escreve nesse arquivo; lista os caminhos faltantes e pede que o usuário os adicione à config antes de continuar.

---

## 7. Requisitos Não-Funcionais

| ID | Requisito | Valor alvo | Observação |
|----|-----------|-----------|------------|
| RNF-01 | Compatibilidade retroativa | Projetos sem o arquivo comportam-se exatamente como hoje | Nenhuma migração exigida |
| RNF-02 | Portabilidade | Globs funcionam em Windows e Unix | Sempre `/` no JSON; o agente normaliza separadores ao comparar |
| RNF-03 | Legibilidade | JSON de no máximo 3 campos na versão 1 | Editável à mão por iniciante |
| RNF-04 | Falha segura | Qualquer erro de leitura ou parse resulta em política bloqueada | Ver EC-01 e EC-02 |

---

## 8. Design e Interface

**Componentes afetados:** templates de instalação do Reversa (CLAUDE.md do projeto, AGENTS.md, CURSOR.md), SKILL.md dos fluxos que escrevem ou alteram código listados em RF-09 (12 skills), e um novo script de hook opcional para Claude Code.

**Comportamento esperado:**
Não há UI. A interface é o próprio JSON e as mensagens do agente. Texto padrão de recusa (referência): "A política do Reversa (`.reversa/reversa-config.json`) proíbe alterar `<caminho>`. Estado atual: allowLegacyEdits=<valor>, allowedPaths=<lista>. Para liberar, edite o arquivo e adicione o caminho desejado."

**Estados da UI:**
- Estado vazio: arquivo ausente; agente trata como bloqueado e informa como criar.
- Estado de carregamento: não aplicável.
- Estado de erro: JSON inválido; agente trata como bloqueado e mostra o erro de parse.
- Estado de sucesso: escrita realizada; o documento do forward registra os caminhos usados sob a política.

---

## 9. Modelo de Dados

**Entidades novas ou modificadas:**

```
reversa-config.json (versão 1) {
  version: number          // fixo em 1 nesta versão
  allowLegacyEdits: bool   // default false; false bloqueia todo o legado
  allowedPaths: string[]   // opcional; globs relativos à raiz, só considerados quando allowLegacyEdits=true
}
```

Exemplo mínimo bloqueado: `{"version": 1, "allowLegacyEdits": false}`
Exemplo liberado restrito: `{"version": 1, "allowLegacyEdits": true, "allowedPaths": ["DEEPSEEK-HARNESS/packages/voice/**", "DEEPSEEK-HARNESS/packages/api/remotes/src/client/index.ts"]}`

**Migrações necessárias:** Não. Arquivo novo, ausência equivale ao comportamento atual.

---

## 10. Integrações e Dependências

| Dependência | Tipo | Impacto se indisponível |
|-------------|------|------------------------|
| Arquivos de instrução do agente (CLAUDE.md, AGENTS.md, CURSOR.md) | Obrigatória | Sem o parágrafo padrão, o agente não sabe da política; instalação do Reversa deve incluí-lo |
| Hooks PreToolUse do Claude Code | Opcional | Sem o hook, a política vale como guardrail por instrução (comportamento igual aos demais agentes) |

---

## 11. Edge Cases e Tratamento de Erros

| Cenário | Trigger | Comportamento esperado |
|---------|---------|----------------------|
| EC-01: Arquivo ausente | Projeto sem `.reversa/reversa-config.json` | Tratar como `allowLegacyEdits: false`; informar como criar o arquivo ao recusar uma escrita |
| EC-02: JSON malformado ou campo com tipo errado | Erro de parse ou `allowLegacyEdits` não booleano | Tratar como bloqueado (falha segura); mostrar o erro ao usuário |
| EC-03: Glob que escapa da raiz | Padrão com `..` ou caminho absoluto em `allowedPaths` | Ignorar o padrão, avisar o usuário; nunca liberar caminho fora da raiz do projeto |
| EC-04: Config alterada no meio da sessão | Usuário edita o JSON após o início do trabalho | O agente relê o arquivo antes de cada novo bloco de escritas no legado (no mínimo, a cada ativação de skill) |
| EC-05: `allowedPaths` cobre as pastas do Reversa | Ex.: `_reversa_sdd/**` na lista | Redundante e inofensivo; as pastas do Reversa são sempre graváveis (RF-07) |
| EC-06: Pedido do usuário conflita com a config | Usuário manda editar o legado com política bloqueada | Recusar a escrita e orientar a editar a config; não tratar o pedido na conversa como liberação implícita (RF-12) |
| EC-07: Agente tenta se autoliberar | Qualquer fluxo tenta editar `reversa-config.json` sem pedido explícito | Proibido por RF-12; o hook (quando instalado) também nega escrita nesse arquivo |
| EC-08: Deleção de arquivo pré-existente | Plano exige apagar arquivo do legado dentro de `allowedPaths` | Permitido pela política, mas o agente confirma com o usuário antes de apagar, listando o arquivo |
| EC-09: Atualização sobre instalação com exceções manuais | Repositório atualizado já tem exceções improvisadas escritas no CLAUDE.md (caso do forward 001 deste projeto) | A atualização preserva o texto manual e sugere ao usuário migrar as exceções para `allowedPaths`, sem migrá-las automaticamente (RF-12) |

---

## 12. Segurança e Privacidade

- **Autenticação:** não aplicável; a política vale para qualquer operador do projeto.
- **Autorização:** a autoridade é o conteúdo do JSON no disco, editado pelo usuário. O risco central é autoautorização pelo agente, coberto por RF-12 e EC-07.
- **Dados sensíveis:** nenhum; o arquivo contém apenas política de caminhos.
- **Auditoria:** os documentos do ciclo forward registram, por feature, quais caminhos foram escritos sob qual estado da política (RF de rastreabilidade no passo 3 do fluxo principal).

---

## 13. Plano de Rollout

- **Estratégia:** big bang na próxima versão do Reversa. Instalações novas já nascem com a config; instalações existentes recebem a feature no fluxo de atualização (RF-13), com o default seguro tornando a mudança invisível até o usuário optar por liberar.
- **Como reverter (rollback):** apagar `.reversa/reversa-config.json` (volta ao comportamento atual) e remover o parágrafo padrão dos arquivos de instrução.
- **Monitoramento pós-deploy:** nos primeiros usos do forward, revisar `git status` do legado após cada implementação e conferir que só os caminhos liberados aparecem.

---

## 14. Open Questions

| # | Pergunta | Impacto | Dono | Prazo |
|---|---------|---------|------|-------|
| OQ-01 | O hook PreToolUse deve ser instalado por padrão pelo instalador do Reversa ou ficar como passo manual documentado? | Médio | Sandeco | Antes da release |
| OQ-02 | O `/reversa-forward` deve oferecer, ao detectar bloqueio, a geração do snippet de config já preenchido com os caminhos do plano (sem aplicá-lo, respeitando RF-12)? | Baixo | Sandeco | Antes da release |

---

## 15. Decisões Tomadas (Decision Log)

| Decisão | Alternativas consideradas | Racional |
|---------|--------------------------|---------|
| Arquivo em `.reversa/reversa-config.json` | JSON solto na raiz do projeto | `.reversa/` já é território do framework; evita poluir a raiz do legado |
| Booleano + lista de globs | Só booleano | O caso real quase nunca é "libera tudo"; a lista evita o 8 ou 80 |
| Falha segura (erro = bloqueado) | Erro = liberado ou perguntar | Proteger o legado é o propósito da regra; na dúvida, bloquear |
| Guardrail por instrução com hook opcional | Só hook obrigatório | O Reversa roda em agentes sem suporte a hooks (Cursor, Codex); a instrução é o denominador comum e o hook endurece onde possível |
| Agente proibido de editar a config | Permitir com confirmação | Autoautorização anula a política; a edição é ato exclusivo do usuário |

---

## Apêndice

### Referências
- Regra atual não-negociável: CLAUDE.md do projeto deepseek-harness (seção "Regra não-negociável").
- Caso motivador: `_reversa_forward/001-plugin-reconhecimento-de-voz/requirements.md` (RN-05 e RNF Composição).
- Hooks do Claude Code (PreToolUse): documentação oficial do Claude Code.

### Histórico de Revisões
| Versão | Data | Autor | Mudanças |
|--------|------|-------|---------|
| 1.0 | 2026-08-21 | Sandeco | Criação inicial |
| 1.1 | 2026-08-21 | Sandeco | RF-13 e EC-09: caminho de atualização em instalação pré-existente configura a feature |
| 1.2 | 2026-08-21 | Sandeco (implementação com Claude) | Feature implementada na v1.2.59. OQ-01 resolvida: o hook é instalado por padrão em `.reversa/hooks/`, mas o wiring no `.claude/settings.json` é passo manual documentado no `README.md` da pasta (o Reversa não toca settings do usuário). OQ-02 resolvida: o `reversa-coding`, ao detectar bloqueio, mostra o snippet de config pré-preenchido com os globs do plano, sem aplicá-lo (RF-12 respeitado). Nota de implementação: as pastas sempre graváveis incluem também `_reversa_bugs/` e `_reversa_refactor/`, territórios do Reversa criados depois da lista original de quatro pastas |
| 1.3 | 2026-08-21 | Sandeco | A spec absorve a nota de implementação: RF-03 e RF-07 passam a listar as seis pastas próprias do Reversa (incluindo `_reversa_bugs/` e `_reversa_refactor/`). RF-09 ampliado para cobrir todos os fluxos que escrevem código: entram `reversa-add` e os 7 especialistas do time Refactor, todos com o bloco da política no próprio SKILL.md e a regra de que gate aprovado não substitui a política |

### Relatório de Avaliação (spec_scorer)

```
SCORE TOTAL: 88.0/100  —  ✅ Boa — Pronta com ajustes menores

Dimensão             Score      Peso     Contribuição
Completude           100%       30%     30.0
Testabilidade         72%       25%     18.0
Clareza               75%       20%     15.0
Escopo               100%       15%     15.0
Edge Cases           100%       10%     10.0

Melhorias recomendadas:
- Métricas de sucesso sem valores numéricos (as metas usam "0 recusas"/"0 ocorrências"; heurística do scorer)
- Possível contradição entre requisitos (RF-03 vs RF-05: não há conflito, as condições allow=false e allow=true são mutuamente exclusivas)
```
