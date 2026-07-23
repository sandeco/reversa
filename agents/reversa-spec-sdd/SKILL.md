---
name: reversa-spec-sdd
description: 'Agente final do time Code New Project: decompõe um PRD em componentes e gera specs SDD por componente com score de qualidade (0 a 100) e análise de gaps, lendo `_reversa_sdd/prd.md`. Também avalia specs existentes. Faz handoff para /reversa-forward. Use com "/reversa-spec-sdd" (ou via /reversa-new).'
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  team: newproject
  stage: spec-sdd
---

# reversa-spec-sdd, Spec-Driven Development no Reversa

Esta skill conduz o processo completo de SDD dentro do pipeline Code New Project Agents: **decompor → redigir → avaliar → iterar** até cada spec estar pronta para o ciclo forward.

A skill é uma versão vendored da `sdd-spec` global, adaptada para o contexto Reversa: lê `prd.md` como fonte primária, escreve em `_reversa_sdd/sdd/`, marca tudo com selo 🟡 e termina com handoff para `/reversa-forward`.

## Por que SDD?

Specs escritas antes do código economizam tempo porque:

- Tornam ambiguidades visíveis antes de virarem bugs
- Alinham expectativas entre quem pede e quem implementa
- Servem de referência permanente para testes, revisões e onboarding
- Permitem que LLMs implementem com muito mais precisão

A metodologia aqui é **RFC Pragmático mais LLM-First**: estruturada como um RFC (Problem / Goals / Design / Edge Cases), mas otimizada para ser consumida por humanos e por agentes de IA.

## Antes de começar

1. Leia `.reversa/state.json` para `user_name`, `chat_language`, `doc_language`, `output_folder` (padrão `_reversa_sdd`).
2. Verifique pré-condição: **`<output_folder>/prd.md` deve existir**. Se ausente, encerre com mensagem clara:
   > "Não encontrei `<output_folder>/prd.md`. Rode `/reversa-drafter` primeiro, ou invoque `/reversa-new` para conduzir o pipeline completo."
3. Garanta que a pasta `<output_folder>/sdd/` existe. Crie se ausente.

## Output path padrão

Cada spec gerada vai para:

```
<output_folder>/sdd/<componente-kebab-case>.md
```

Por exemplo: `_reversa_sdd/sdd/user-authentication.md`, `_reversa_sdd/sdd/payment-checkout.md`.

O componente é decomposto a partir do `prd.md` na primeira fase.

## Selo 🟡 obrigatório

Todos os itens das specs geradas pelo `reversa-spec-sdd` devem usar o selo **🟡 PLANEJADO** (variante de 🟡 INFERIDO usado em outros contextos do Reversa). O selo 🟢 CONFIRMADO é reservado para fatos extraídos de código existente pelo Time de Descoberta, regra herdada para evitar confusão entre "fato do legado" e "hipótese forward".

Cada requisito, comportamento, edge case e critério de aceite das specs deve começar com 🟡.

---

## Fluxo de trabalho

### Fase 0, Decomposição em componentes

Leia `<output_folder>/prd.md` na íntegra. A partir das seções "Escopo", "Personas-alvo" e "Critérios de aceite", proponha uma decomposição do produto em componentes lógicos. Cada componente deve representar uma unidade coesa que vai virar uma spec SDD individual.

Apresente a decomposição ao usuário:

> "Pelo PRD, identifiquei estes componentes lógicos:
>
>   1. **<componente 1>**: <descrição em uma frase>
>   2. **<componente 2>**: <descrição em uma frase>
>   3. **<componente N>**: ...
>
> Concorda com essa decomposição? Quer adicionar, remover ou renomear algum?"

Aguarde resposta. Itere até confirmação (máximo 2 ajustes). Para cada componente confirmado, normalize o nome em kebab-case ASCII.

### Fase 1, Entrevista por componente (opcional)

Para cada componente, decida se a informação no `prd.md` já basta:

- **Basta:** vá direto para Fase 2.
- **Falta:** faça no máximo 3 perguntas focadas, cobrindo os pontos abaixo que estiverem ausentes:
  1. **O problema específico daquele componente:** "Qual o papel do `<componente>` no produto?"
  2. **O sucesso:** "Como você saberá que esse componente funcionou? O que o usuário consegue fazer?"
  3. **Escopo:** "O que está explicitamente FORA do escopo desse componente?"
  4. **Edge cases:** "Já consegue antecipar casos difíceis ou situações de erro nesse componente?"

Limite total: 3 perguntas por componente, escolhendo as mais críticas.

### Fase 2, Redigir a spec

Use o template em `references/spec_template.md` como base. Preencha **todas** as seções:

- **Requisitos funcionais:** formato `RF-01`, `RF-02`. Cada um testável isoladamente. Selo 🟡 obrigatório.
- **Comportamentos:** descreva o que acontece, não como implementar. A spec define o **quê**, não o **como**.
- **Ambiguidade zero:** se não tiver certeza, marque com `⚠️ ABERTO:` e adicione à lista de Open Questions.
- **LLM-readiness:** escreva como se um desenvolvedor ou LLM fosse implementar sem perguntar nada.
- **Selo 🟡 em todos os itens da spec**, incluindo RFs, edge cases, critérios.

Use `<doc_language>` no conteúdo das specs.

### Fase 3, Avaliação automática de qualidade

Após redigir cada spec, execute o scorer.

**Detecção de Python:** tente `python --version` ou `python3 --version` via shell.

- **Se Python disponível:**

  ```
  python scripts/spec_scorer.py --spec <output_folder>/sdd/<componente>.md
  ```

  Use a saída literal do script.

- **Se Python não disponível (modo manual):** aplique o procedimento da seção "Scoring em engines sem Python" mais abaixo.

O scoring retorna:

- **Score total** (0 a 100) com breakdown por dimensão
- **Gaps críticos** que precisam de resolução
- **Sugestões** ordenadas por impacto

Dimensões avaliadas (ver `references/evaluation_rubric.md` para detalhes):

| Dimensão | Peso | O que avalia |
|---|---|---|
| Completude | 30% | Todas as seções preenchidas, requisitos cobertos |
| Testabilidade | 25% | Requisitos verificáveis, critérios de aceite claros |
| Clareza | 20% | Ausência de ambiguidades, linguagem precisa |
| Escopo | 15% | Non-goals definidos, limites claros |
| Edge Cases | 10% | Casos de erro e limites do sistema cobertos |

### Fase 4, Iteração

Com base no score:

1. Score **≥ 80**: spec pronta. Persista e siga para o próximo componente.
2. Score **60 a 79**: corrija os gaps óbvios automaticamente, depois confirme com o usuário se faltou algo crítico. Refaça scoring.
3. Score **< 60**: volte para Fase 1 com perguntas focadas nos gaps. Refaça scoring.

Limite: **3 iterações por componente**. Após 3 tentativas, persista com o score atual e adicione seção `## Pendências de qualidade` no arquivo.

A cada iteração, mostre o delta: "subiu de 54 para 71, faltam 2 gaps críticos".

### Fase 5, Persistência e handoff

Para cada componente concluído:

1. Escreva `<output_folder>/sdd/<componente-kebab-case>.md` com escrita atômica (tempfile mais rename), UTF-8 sem BOM.
2. Inclua no final do arquivo o **relatório de avaliação** (score + gaps + sugestões).
3. Se o arquivo já existir, pergunte ao usuário se quer sobrescrever.

Após gerar **todas** as specs, exiba relatório consolidado:

> "`<user_name>`, geração SDD concluída. Specs criadas em `<output_folder>/sdd/`:
>
> | Componente | Caminho | Score | Iterações |
> |---|---|---|---|
> | <comp1> | <output_folder>/sdd/<comp1>.md | 87 | 1 |
> | <comp2> | <output_folder>/sdd/<comp2>.md | 73 | 2 |
> | <comp3> | <output_folder>/sdd/<comp3>.md | 68 | 3 (com pendências) |
>
> Todos os itens marcados com selo 🟡 (planejado).
>
> Próximo passo: rodar `/reversa-forward`, que vai consumir essas specs e iniciar o ciclo de evolução até o código.
>
> Digite **CONTINUAR** para iniciar `/reversa-forward`, ou pause aqui."

Nunca prossiga automaticamente.

---

## Scoring em engines sem Python

Quando `python --version` e `python3 --version` falham, ative o modo manual:

1. **Leia `references/evaluation_rubric.md`** para os critérios de cada dimensão.
2. Para cada uma das 5 dimensões, avalie a spec mentalmente e atribua nota 0 a 100, justificando em 1 a 2 frases:

   - **Completude (30%):** todas as 9 seções obrigatórias preenchidas? RFs cobrem o escopo declarado?
   - **Testabilidade (25%):** RFs são verificáveis isoladamente? Critérios de aceite têm formato Dado/Quando/Então ou equivalente?
   - **Clareza (20%):** há frases vagas (intuitivo, rápido, fácil)? Há contradições?
   - **Escopo (15%):** non-goals declarados explicitamente? Limites claros?
   - **Edge cases (10%):** pelo menos 3 casos de erro/limite cobertos?

3. **Calcule o score ponderado:**

   ```
   score = (Completude * 0.30) + (Testabilidade * 0.25) + (Clareza * 0.20)
         + (Escopo * 0.15) + (Edge Cases * 0.10)
   ```

4. **Liste os gaps** em ordem de criticidade (bloqueadores, importantes, melhorias).

5. **Renderize a saída** no mesmo formato do script:

   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SCORE TOTAL: <NN>/100
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Breakdown:
     Completude:    <NN>/100 (peso 30%)
     Testabilidade: <NN>/100 (peso 25%)
     Clareza:       <NN>/100 (peso 20%)
     Escopo:        <NN>/100 (peso 15%)
     Edge Cases:    <NN>/100 (peso 10%)

   Gaps críticos:
     - <gap 1>
     - <gap 2>

   Sugestões (por impacto):
     1. <sugestão>
     2. <sugestão>
   ```

O resultado em modo manual deve ser equivalente ao do script para uma mesma spec.

---

## Modo: avaliação de spec existente

Se o usuário invocar `/reversa-spec-sdd` fora do pipeline `/reversa-new`, com uma spec já escrita para avaliação:

1. Pergunte o caminho do arquivo.
2. Execute scoring (script ou manual).
3. Apresente score com análise detalhada por dimensão.
4. Liste gaps em ordem de criticidade.
5. Pergunte se quer que você corrija os pontos apontados.

Esse modo não exige `prd.md` nem entra no pipeline. É uma utilidade avulsa herdada da skill original.

---

## Arquivos de referência

| Arquivo | Quando usar |
|---|---|
| `references/spec_template.md` | Template completo com todas as seções, use como base para redigir |
| `references/evaluation_rubric.md` | Critérios detalhados de avaliação por dimensão |
| `references/sdd_guide.md` | Princípios da metodologia e boas práticas |
| `assets/spec_examples.md` | Exemplos de spec boa vs. ruim com anotações |
| `scripts/spec_scorer.py` | Script de scoring automático, usado quando Python está disponível |

---

## Sinais de uma spec ruim (evite)

- Requisitos que não podem ser testados ("o sistema deve ser intuitivo")
- Seção de escopo ausente ou vaga ("vamos ver o que faz sentido")
- Misturar design técnico de implementação com comportamento esperado
- Requisitos contraditórios não sinalizados
- Nenhum critério de aceite definido
- Edge cases de erro completamente ausentes

## Sinais de uma spec boa (busque)

- Qualquer desenvolvedor pode implementar sem fazer perguntas
- Qualquer QA pode escrever testes a partir dela
- Os non-goals estão tão claros quanto os goals
- Casos de erro têm comportamento definido
- Cada requisito tem um ID único rastreável

---

## Regra absoluta

Escreva apenas em `<output_folder>/sdd/`. Nunca toque em arquivos do projeto fora dessa pasta. Em sobrescrita, sempre peça confirmação `sim/não`.

## Saída final

Após gerar todas as specs do PRD, termine sempre com:

> Digite **CONTINUAR** para prosseguir com `/reversa-forward`, ou pause aqui.

Nunca prossiga automaticamente.
