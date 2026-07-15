# Bug Agents

O Time **Bug Agents** transforma o tratamento de defeitos numa **memória causal de defeitos** nativa do repositório. Cada bug é uma pasta autocontida com um registro em front matter YAML, rastreável às especificações extraídas pelo Time de Descoberta (`SPEC ↔ CODE ↔ TEST ↔ BUG`), e acompanhado do registro até a recuperação comprovada do sistema.

A regra fundadora: **documentar bug e corrigir bug são atos estritamente separados.**

Sempre instalado, como grupo único fixo ao lado do Reversa Agents Core.

---

## Quando usar

Algo está errado no sistema e você quer mais que um patch rápido: um registro classificado e rastreável, causa raiz com evidências, teste de regressão e um veredito sobre se a spec original deve ser versionada. Ou uma feature "vive quebrando" e você quer uma varredura profunda em vez de mais um hotfix.

O Time funciona melhor sobre uma extração (`_reversa_sdd/`), mas degrada bem: sem specs, os bugs carregam o label `spec-gap` até o `/reversa` rodar.

---

## Os 5 comandos

```
/reversa-bug ──registra──► _reversa_bugs/bugs/BUG-.../   ◄──registra achados── /reversa-depth-inspection
      │
      ▼
/reversa-bug-fix ──opt-in──► /reversa-bug-debate (diagnosis | repair | spec)
      │
      ▼ fecha pela closure policy
/reversa-bug-graph ──regenera──► generated/* + _reversa_sdd/traceability/bugs.md
```

| Agente | Papel |
|--------|-------|
| **Bug** | Intake, triagem, dedupe, classificação (`taxonomy.yaml`), rastreabilidade inicial e suspeita de segurança. Nunca corrige. `/reversa-bug` |
| **Bug Fix** | Orquestrador do ciclo de vida: mitigação opcional, cápsula de reprodução, causa raiz com evidências (com `git bisect` para regressões), dois gates de aprovação (testes que falham primeiro, depois o change set de correção), veredito de spec, closure policy. `/reversa-bug-fix` |
| **Bug Debate** | Debate multiagente em épocas fixas com juiz isolado, em três modos: `diagnosis` (hipóteses causais concorrentes), `repair` (estratégias concorrentes), `spec` (divergência código vs spec; termina em recomendação, a decisão é humana). Sempre opt-in, com custo mostrado antes. Harness externos (Codex, Gemini CLI, OpenCode) só entram como debatedores com aceite explícito. `/reversa-bug-debate` |
| **Depth Inspection** | Pente-fino de uma feature problemática com lentes especializadas: conformidade com a spec, fluxo de dados, contratos, estados de erro, cobertura de testes, concorrência. Só diagnóstico; achados confirmados viram bugs registrados. `/reversa-depth-inspection` |
| **Bug Graph** | Regenera todas as views derivadas: índice, catálogo compacto (`catalog.jsonl`), matriz esparsa de relações, grafo mermaid com clusters e impact score, e a matriz de rastreabilidade BUG ↔ SPEC nas duas pontas. Valida invariantes e para com erro explícito em inconsistência. `/reversa-bug-graph` |

---

## Anatomia de um bug

Uma pasta por bug, com **endereço imutável**: a pasta nunca se move nem é renomeada. O status vive no front matter, nunca no caminho.

```
_reversa_bugs/
├── README.md                 o contrato do projeto (lifecycle, closure policy, regras)
├── taxonomy.yaml             vocabulário controlado de area/module/feature
├── bugs/
│   └── BUG-20260715-A7K3-desconto-duplicado/
│       ├── bug.md            registro canônico (source of truth)
│       ├── evidence/         logs, prints, cápsula de reprodução
│       ├── debate/           se aberto: rodadas, convergência, resposta final
│       └── fix/              diffs do change set tipado, verificação
├── inspections/<feature>/    relatórios do pente-fino
└── generated/                views regeneradas (nunca editadas à mão)
```

Conceitos centrais do schema:

- **IDs merge-safe**: `BUG-<data>-<sufixo>` nunca colide, mesmo com dois harness registrando bugs em worktrees paralelas. Um `display_number` humano ("BUG-007") fica para a conversa.
- **3 status + phase**: `open`, `active`, `resolved`, com uma `phase` separada (mitigating, reproducing, diagnosing, observing...). Bloqueio é condição, nunca status.
- **Estados epistemológicos**: causa raiz e relações entre bugs carregam `hypothesized / supported / confirmed / rejected` com evidências. Hipótese nunca entra no grafo como fato.
- **Correction Change Set**: uma correção é um conjunto tipado de mudanças (código, teste, configuração, migration, reparo de dados, especificação...), porque código curado não é sistema curado.
- **Closure policy**: o que `resolved` exige depende do perfil do projeto: software local fecha com testes de regressão passando; serviço em produção só depois da entrega e de uma janela de observação sem recorrência.

---

## Veredito de spec

Toda correção responde: *o errado era o código ou a spec?* Três saídas: `spec-correta` (o código divergiu, a spec fica), `spec-desatualizada` (um adendo versionado é gerado em `_reversa_sdd/addenda/`, a spec original nunca é editada) ou `spec-gap` (o comportamento nunca foi especificado; nasce um adendo aditivo). O agente recomenda com evidências; **a decisão é humana**. Diff do código e diff da spec ficam registrados **juntos** na Resolution do bug.

O vínculo reverso vive também do lado da spec: `_reversa_sdd/traceability/bugs.md` é um espelho gerado listando, por seção de spec, os bugs que a atingem.

---

## Non-destructive

Os Bug Agents escrevem apenas dentro de `_reversa_bugs/`, além dos adendos em `_reversa_sdd/addenda/` e do espelho gerado em `_reversa_sdd/traceability/`. O código do projeto só muda pelos dois gates de aprovação, com diffs explícitos. Bugs com `visibility: restricted` (segurança) ficam fora das views públicas e nunca chegam a harness externos.
