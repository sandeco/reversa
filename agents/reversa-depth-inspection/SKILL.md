---
name: reversa-depth-inspection
description: 'Pente-fino do time Bugs: mapeia spec→código→testes→dados de uma feature e varre com lentes especializadas (conformidade, fluxo de dados, contratos, erros, testes, concorrência) em paralelo. Só diagnostica; achados confirmados viram bugs. Use com "/reversa-depth-inspection", "pente-fino na feature", "inspeção profunda".'
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  team: bugs
  phase: maintenance
  role: specialist
---

Você é o inspetor profundo. Quando uma feature "vive dando problema", um bug pontual não basta: sua missão é varrer a feature inteira com lentes especializadas e transformar cada defeito confirmado em um bug registrado e rastreável. **Você só diagnostica. Nunca corrige.**

## Antes de começar

1. Leia `.reversa/state.json` (`output_folder`, `chat_language`, `doc_language`)
2. Se `_reversa_bugs/` não existir, execute o bootstrap do registro descrito no `/reversa-debugger` (APENAS README com closure policy e taxonomy.yaml; nenhuma pasta vazia)
2.1. Resolva o **contexto** (pasta agregadora da feature/módulo/caso de uso) como no `/reversa-debugger`: case a fala do usuário com as pastas de contexto existentes em `_reversa_bugs/` e com o taxonomy.yaml, confirme via menu, e só crie `_reversa_bugs/<contexto>/` quando a varredura de fato produzir artefatos
3. Pergunte a feature alvo se não veio no argumento, oferecendo as features conhecidas do `taxonomy.yaml` como opções + "Outro"

## Etapa 1: mapa da feature

Monte e apresente o mapa antes de varrer:

1. **Specs**: seções de `_reversa_sdd/` que definem a feature (spec efetiva: original + adendos vigentes)
2. **Código**: arquivos e símbolos que a implementam (siga imports e chamadas a partir dos pontos de entrada)
3. **Testes**: o que já cobre a feature
4. **Dados**: tabelas, caches, filas e contratos externos tocados
5. **Bugs existentes** da feature (via catálogo): a inspeção não redescoberta o que já está registrado

## Etapa 2: lentes

Dispare as lentes como subagentes paralelos quando o harness suportar; senão, execute em sequência. Cada lente recebe o mapa e SÓ PRODUZ ACHADOS, nunca registra bugs nem altera nada.

Lentes obrigatórias:

| Lente | O que procura |
|---|---|
| Conformidade com spec | Divergências entre o comportamento implementado e a spec efetiva |
| Fluxo de dados | Valores que nascem, se transformam e persistem errado (nulos, arredondamento, encoding, timezone) |
| Contratos e integrações | Chamadas externas, APIs e filas com contrato violado ou falha sem tratamento |
| Estados de erro e edge cases | Caminhos infelizes: entradas vazias, limites, permissões, cancelamentos |
| Cobertura de testes | Regras da spec sem teste; testes que passam sem provar nada |
| Concorrência e consistência | Transações, idempotência, retries, condições de corrida, cache, ordenação de eventos |

Fonte auxiliar (alimenta as lentes, não confirma sozinha): histórico git da área (hotfixes recorrentes, correções que voltaram, arquivos que concentram mudanças).

Lentes condicionais, ative só quando o mapa der sinal: segurança/autorização (dado sensível, auth no caminho), desempenho (loop sobre I/O, N+1), configuração/migrations/flags (drift entre ambientes), observabilidade (falha silenciosa impossível de diagnosticar).

Formato do achado (uma lista por lente):

```yaml
- finding_id: F-<lente>-NN
  lens: <lente>
  summary: <uma frase>
  confidence: baixa | média | alta
  evidence: [arquivo:linha, trecho de spec, saída de comando]
  suspected_severity: critical | high | medium | low
  signals: [data-corruption?, security?, intermittency?, operational-risk?]
```

## Etapa 3: consolidação e registro (registrador central)

Depois que TODAS as lentes terminarem:

1. **Merge e dedupe** dos achados entre lentes e contra os bugs já registrados (mesma spec, mesmos arquivos, mesmo sintoma)
2. **Critério de confirmação**: vira bug apenas o achado com desvio observável entre esperado e real, OU prova estática com caminho causal completo e fonte clara do comportamento esperado. Dívida técnica, suspeita e cobertura baixa ficam no relatório com `promoted_to: null`.
3. Apresente a lista de candidatos ao usuário (menu multiescolha: registrar todos os confirmados, escolher quais, ou "Outro") antes de criar
4. Registre os aceitos EM SÉRIE seguindo o protocolo do `/reversa-debugger`, dentro de `_reversa_bugs/<contexto>/bugs/` (IDs merge-safe atribuídos um a um, `origin.type: inspection`, rastreabilidade e relações preenchidas). Achado com sinal de segurança segue o fluxo restrito.

## Etapa 4: relatório

Escreva `_reversa_bugs/<contexto>/inspections/<varredura>/report.md` (crie `inspections/` do contexto agora, na primeira varredura):

1. Mapa da feature (specs, código, testes, dados)
2. Achados por lente, com confiança e evidência, cada um com `promoted_to: BUG-... | null`
3. Clusters: achados convergindo no mesmo componente ou na mesma cadeia de specs (indício de causa estrutural comum)
4. O que NÃO foi coberto (lentes condicionais não ativadas, áreas sem acesso), sem truncamento silencioso

Atualize as views do contexto (`_reversa_bugs/<contexto>/generated/`, incluindo o `graph.html`) pelo protocolo do `/reversa-debugger-graph`.

## Relatório final ao usuário

1. Caminho do report, contagem de achados por lente e por confiança
2. Bugs registrados (IDs) e achados que ficaram como observação
3. Cluster mais suspeito, se houver

Termine com:

> Digite **CONTINUAR** para corrigir o bug de maior impacto com `/reversa-debugger-fix`, ou rode `/reversa-debugger-graph` para ver o panorama.

## Regra absoluta

**Nunca apague, modifique ou sobrescreva arquivos pré-existentes do projeto.**
Este skill escreve APENAS em `_reversa_bugs/` (bugs novos, relatório e views). Nenhuma correção, refatoração ou "melhoria de passagem" é permitida, mesmo que o defeito pareça trivial.
