# Os agentes do Forward

Dez agentes formam o time **Code Forward Agents**. O orquestrador (`/reversa-forward`) detecta o estágio físico da feature ativa e sugere o próximo skill. Os outros nove cobrem o ciclo de vida da ideia em texto livre até o código em execução.

O orquestrador roda em **dois cenários**: evolução de legado com `_reversa_sdd/` populado, ou greenfield, sem extração ainda. Em ambos os casos prepara as pastas e nunca bloqueia o pipeline.

---

## Pipeline

```
Reversa Forward (orquestrador, ponto de entrada opcional)
        │
        ▼
Requirements → Clarify → Quality → Plan → To-Do → Audit → Coding
                (opcional)  (opcional)             (opcional)

Principles e Resume rodam fora desse fluxo linear.
```

Há um checkpoint `CONTINUAR` entre agentes. Cada skill verifica suas próprias precondições e se recusa a rodar se um predecessor obrigatório está ausente. `reversa-coding` é o mais rigoroso: aborta a menos que pelo menos `_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md` existam, para manter a ponte legado-código sólida.

---

## 1. Reversa Forward (orquestrador)

**Comando:** `/reversa-forward`

Olha `.reversa/state.json` e `_reversa_forward/<feature>/` para detectar o estágio físico inspecionando os artefatos no disco (não metadados). Sugere o próximo skill, nunca executa automaticamente: toda transição termina com pedido de `CONTINUAR`.

Detecta greenfield (sem `_reversa_sdd/`), cria as pastas que `/reversa` criaria e deixa o pipeline rodar sem bloqueio.

**Produz:** nada por conta própria. Apenas roteia.

---

## 2. Requirements

**Comando:** `/reversa-requirements`

Transforma uma ideia em texto livre ("quero que o usuário exporte faturas em PDF") em um `requirements.md` completo, ancorado em `_reversa_sdd/architecture.md`, `domain.md`, `state-machines.md` e no glossário. Marca pontos abertos com `[DOUBT]`, lista gaps e registra a feature em `.reversa/active-requirements.json`.

Detecta features em andamento: se outra estiver ativa, pergunta ao usuário se quer continuar, rodar em paralelo (pausando a anterior) ou abandonar. Nunca decide sozinho.

**Produz:** `requirements.md` e entrada em `active-requirements.json`.

---

## 3. Clarify

**Comando:** `/reversa-clarify`

Gera até cinco perguntas direcionadas para resolver marcadores `[DOUBT]`, frases vagas ("provavelmente", "talvez") e gaps óbvios. Perguntas são múltipla escolha ou resposta curta, nunca abertas. As respostas são integradas de volta em `requirements.md` sob uma seção `## Clarifications` datada.

**Produz:** edições in-place em `requirements.md`.

---

## 4. Quality

**Comando:** `/reversa-quality`

Auditor read-only de clareza textual. Pergunta: *esse texto está bom o suficiente para planejar em cima sem retrabalho?*. Categorias: clareza, completude, terminologia, cobertura de cenários, edge cases, jargão, soluções implícitas, alinhamento com `principles.md`. Veredito: Aprovado, Aprovado com ressalvas ou Reprovado. Não verifica testes de implementação.

**Produz:** `audit/requirements-audit.md`.

---

## 5. Plan

**Comando:** `/reversa-plan`

O arquiteto da evolução. Traduz requirements em uma proposta técnica concreta expressa como **delta sobre o legado**, nunca uma re-arquitetura completa. Cada decisão carrega um marcador de confiança (🟢 evidência forte, 🟡 parcial ou baseada em premissas aceitas, 🔴 fraca). Conflitos com `principles.md` são sinalizados, mas nunca silenciosamente sobrescritos.

**Produz:** `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md`, `interfaces/*` (um arquivo por contrato externo afetado).

---

## 6. To-Do

**Comando:** `/reversa-to-do`

Decompõe o roadmap em ações atômicas distribuídas em cinco fases fixas: Preparação, Testes, Core, Integração, Polimento. Cada ação recebe ID estável (`T001`, `T002`, ..., nunca reciclados), dependências explícitas, arquivo alvo, marcador de confiança herdado e flag `[//]` quando pode rodar em paralelo com irmãs.

**Produz:** `actions.md`.

---

## 7. Audit

**Comando:** `/reversa-audit`

Cross-check read-only entre requirements, roadmap e actions. Achados são reportados com severidade (CRITICAL, HIGH, MEDIUM, LOW), agrupados em quatro eixos: cobertura, consistência, coerência com o legado (`_reversa_sdd/domain.md`, `architecture.md`) e sanidade do grafo de actions (sem ciclos, tarefas paralelas não compartilham arquivos). O skill nunca edita os documentos analisados, mesmo se o usuário pedir.

**Produz:** `audit/cross-check.md`.

---

## 8. Coding

**Comando:** `/reversa-coding`

O executor. Percorre `actions.md` fase por fase, respeita o paralelismo `[//]` e as dependências, vira checkboxes de `[ ]` para `[X]` apenas em sucesso e adiciona uma linha por action em `progress.jsonl`. Ao concluir (total ou parcial), escreve duas trilhas para a próxima execução do Discovery:

- `legacy-impact.md`: quais arquivos do legado foram tocados.
- `regression-watch.md`: invariantes que devem permanecer verdadeiros na próxima extração reversa.

**Produz:** código fonte, checkboxes atualizados em `actions.md`, `progress.jsonl`, `legacy-impact.md`, `regression-watch.md`.

---

## 9. Principles

**Comando:** `/reversa-principles`

Gerencia regras duráveis do projeto em `.reversa/principles.md`, separadas dos requirements de feature. Princípios são raros (tipicamente menos que uma vez por mês), usam algarismos romanos (I, II, III, ...) que nunca são reciclados e mudanças são rastreadas em uma seção de histórico. Quando um princípio muda, o skill emite um relatório de impacto (`principles-impact-YYYYMMDD.md`) sugerindo ajustes em templates. O humano aplica, o skill nunca reescreve templates automaticamente.

**Produz:** `.reversa/principles.md` e `principles-impact-YYYYMMDD.md` em cada mudança.

---

## 10. Resume

**Comando:** `/reversa-resume`

Troca a feature ativa por uma de `paused-features`. Detecta o estágio físico de cada feature pausada, mostra entradas órfãs (pasta deletada manualmente) e nunca cria features novas.

**Produz:** swap in-place de `active-requirements.json`. Nenhum artefato de feature é tocado.

---

## Execução manual

`/reversa-forward` é o ponto de entrada recomendado quando você não lembra onde a feature ativa parou. Mas cada skill pode ser ativado avulso:

```
/reversa-forward                 # detecta estágio e sugere próximo skill
/reversa-requirements <ideia>    # nova feature a partir de ideia em texto livre
/reversa-clarify                 # resolve marcadores [DOUBT] em requirements.md
/reversa-quality                 # audita clareza textual (read-only)
/reversa-plan                    # delta sobre legado a partir de requirements.md
/reversa-to-do                   # ações atômicas a partir de roadmap.md
/reversa-audit                   # cross-check entre os três docs (read-only)
/reversa-coding                  # executa actions.md
/reversa-principles              # gerencia regras duráveis
/reversa-resume                  # troca por uma feature pausada
```

Hooks declarados em `.reversa/hooks.yml` (slots `before-<stage>` e `after-<stage>`) se aplicam em toda transição.
