# Code Forward Agents

O Team **Code Forward Agents** pega as specs produzidas pela descoberta e conduz a evolução: de uma ideia livre até código rodando, sempre ancorado nos artefatos do legado já extraídos pelo Reversa.

Marcado por padrão no instalador.

---

## Pipeline

```
/reversa-forward         (orquestrador, detecta o estágio e sugere o próximo skill)
        │
        ▼
/reversa-requirements
        │
        ▼
/reversa-clarify           (opcional, esclarece ambiguidade)
        │
        ▼
/reversa-plan            (abordagem técnica como delta sobre o legado)
        │
        ▼
/reversa-to-do           (tarefas atômicas, IDs, dependências, paralelismo)
        │
        ▼
/reversa-audit           (opcional, cross-check requirements x roadmap x actions)
/reversa-quality         (opcional, qualidade textual do requirements)
        │
        ▼
/reversa-coding          (executa actions.md em código)
        │
        ▼
/reversa-sync            (opcional, converge a entrega em _reversa_sdd/addenda/)
```

`/reversa-forward` é o ponto de entrada opcional do ciclo: olha o estado atual e diz qual o próximo skill. Útil quando você não lembra onde parou.
`/reversa-principles` roda separado, gerencia princípios duradouros do projeto.
`/reversa-resume` troca a feature ativa por uma pausada.

---

## Agentes

| Agente | Stage | Função |
|--------|-------|--------|
| `reversa-forward` | orchestrator | Detecta o estágio físico da feature ativa em `_reversa_forward/` e sugere o próximo skill do ciclo. Não escreve artefatos, só roteia. |
| `reversa-requirements` | requirements | Transforma uma ideia livre em `requirements.md` completo, ancorado nos artefatos da pipeline reversa. |
| `reversa-clarify` | clarify | Até cinco perguntas dirigidas para resolver pontos abertos do `requirements.md` e integrar as respostas. |
| `reversa-plan` | plan | Esboça a abordagem técnica como delta sobre o legado: roadmap, investigation, data-delta, onboarding, interfaces. |
| `reversa-to-do` | to-do | Decompõe o roadmap em ações atômicas com IDs estáveis, dependências e marcador de paralelismo. |
| `reversa-audit` | audit | Auditor estritamente leitor: contradições e lacunas entre requirements, roadmap e actions, severidade reportada. |
| `reversa-quality` | quality | Revisa a clareza da escrita do `requirements.md`. Não verifica testes de implementação. |
| `reversa-coding` | coding | Executa `actions.md` em código real, atualiza checkboxes e deixa `legacy-impact.md` e `regression-watch.md`. |
| `reversa-sync` | sync | Opcional, depois do coding. Destila a feature entregue em um adendo em `_reversa_sdd/addenda/`, mantendo a extração representativa até a próxima re-extração. Não edita os artefatos originais. |
| `reversa-principles` | principles | Cria e mantém princípios duradouros do projeto, separados dos requisitos de cada feature. |
| `reversa-resume` | resume | Retoma uma feature pausada listada em `paused-features` de `active-requirements.json`. |

---

## Onde os artefatos vão parar

Cada feature mora em sua própria pasta sob `_reversa_forward/`. O caminho exato sai do campo `forward_folder` em `.reversa/state.json`.

Os Code Forward Agents jamais tocam no código legado sem supervisão, nem editam os artefatos do Discovery Team. Consomem as saídas de Discovery e escrevem dentro da pasta forward.

A única exceção é o `/reversa-sync`, que escreve em `_reversa_sdd/addenda/` — uma pasta nova, criada só para os adendos pós-entrega. Os artefatos originais da extração (`architecture.md`, `domain.md`, specs) continuam intocados; o adendo apenas aponta para as seções que ficaram defasadas.
