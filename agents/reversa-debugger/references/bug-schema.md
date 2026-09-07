# Schema do bug.md (schema_version: 1)

Contrato compartilhado por todos os comandos do Time Reversa Bugs. O `bug.md` é a source of truth;
tudo em `generated/` é projeção. Referências entre documentos usam sempre o ID canônico, nunca caminho.

## Front matter

```yaml
---
schema_version: 1
id: BUG-20260715-A7K3        # BUG-<YYYYMMDD>-<4 chars base32>, imutável, merge-safe
display_number: 7            # apelido humano; comandos aceitam ID ou display_number
title: Desconto aplicado duas vezes no fechamento do pedido
status: open                 # open | active | resolved (a pasta NUNCA carrega o status)
phase: triaging              # triaging | mitigating | reproducing | diagnosing | planning |
                             # testing | patching | delivering | observing | awaiting-human
severity: high               # critical | high | medium | low  (tamanho do estrago)
priority: P1                 # P0 | P1 | P2 | P3               (urgência de correção)
created: 2026-07-15
updated: 2026-07-15

origin:
  type: manual-report        # manual-report | github-issue | gitlab-issue | ci-failure |
                             # telemetry | alert | support | customer | security-advisory |
                             # inspection | other
  external_ref: null         # {provider, id} quando houver

area: vendas                 # valores de taxonomy.yaml ou unclassified
module: checkout
feature: desconto
labels: []                   # ex.: spec-gap, financeiro

visibility: normal           # normal | internal | restricted (segurança: fora de views públicas)
security_suspected: false

reproduction:
  classification: deterministic   # deterministic | intermittent | environment-dependent |
                                  # not-reproduced | unknown
  rate: "10/10"                   # tentativas com falha / tentativas
  suspected_triggers: []          # para intermitentes

blocking: []                 # condições que travam o bug; is_blocked é DERIVADO, nunca status
# - kind: bug
#   target: BUG-20260701-Q2R8
# - kind: external
#   reason: "Aguardando credenciais do fornecedor"
#   since: 2026-07-15

relationships: []            # arestas canônicas, gravadas UMA vez; inversas derivadas nas views
# - bug: BUG-20260701-Q2R8
#   type: caused-by          # direcionais: caused-by, blocked-by, duplicate-of, regression-of
#   state: proposed          # proposed | supported | confirmed | rejected
#   evidence: []             # obrigatório para state >= supported
# tipos simétricos: related-to, conflicts-with
# proibido: autorrelação, ID inexistente, ciclo de duplicate-of

traceability:
  specs: []                  # locators "caminho#âncora" na spec EFETIVA (original + adendos vigentes)
  affected_code: []          # onde o bug APARECE
  root_cause: null           # onde o bug NASCEU, com estado epistemológico (preenchido pelo fix):
  # root_cause:
  #   state: hypothesized    # hypothesized | supported | confirmed | rejected
  #   hypothesis: "..."
  #   causal_path: []
  #   evidence: [{ref, observation}]
  #   code_refs: [{file, symbol, commit}]
  reproduction_tests: []     # provam que o defeito relatado aparece
  regression_tests: []       # protegem o que não pode voltar a quebrar (conceitos DISTINTOS)

spec_verdict: null           # spec-correta | spec-desatualizada | spec-gap (decisão HUMANA registrada)

change_set: []               # mudanças corretivas tipadas (preenchido pelo fix)
# - id: CHG-001
#   kind: test | code | configuration | migration | data-repair | dependency | infrastructure |
#         feature-flag | api-contract | cache | observability | specification | documentation | other
#   artifact: caminho
#   purpose: frase curta
#   diff: fix/CHG-001.diff

closure:
  policy: local-software     # local-software | package | production-service (do README do registro)
  satisfied: false
resolution_kind: null        # fixed | duplicate | invalid | cannot-reproduce | spec-only |
                             # instrumentation-required
---
```

Blocos opcionais (só quando o contexto existe): `express: true` (bug registrado pela rota
expressa do `/reversa-debugger`; ativa o modo expresso do fix), `mitigation` (kind, applied_at, temporary),
`data_impact` / `data_repair` (código curado não é sistema curado), `regression_analysis`
(last_known_good, first_known_bad, bisect, culprit_commit), `versions` / `backports`,
`ownership` (inferido de CODEOWNERS, nunca inventado; sem evidência use unclassified),
`delivery` (branch, PR, CI, merge), `post_fix_observation`, `change_risk`
(classification baixa|média|alta + motivos).

## Corpo (seções na ordem)

1. `# <título>`
2. `## Summary`
3. `## Expected Behavior` (citando a spec efetiva; se spec-gap, dizer explicitamente)
4. `## Actual Behavior`
5. `## Steps to Reproduce`
6. `## Evidence` (caminhos relativos à pasta do bug, ex.: `evidence/fechamento.log`)
7. `## Suspected Area`
8. `## Acceptance Criteria`
9. `## Traceability` (espelho legível do bloco YAML)
10. `## Resolution` (preenchida pelo fix: root cause, veredito de spec aprovado, resolution_kind,
    tabela do change set, diffs de código e spec JUNTOS, testes de reprodução e regressão)
11. `## Agent Notes` (restrições para quem for corrigir; propostas de taxonomia)

## Trava de conclusão (DONE.md)

Quando a closure policy é satisfeita, o fix grava `DONE.md` na pasta do bug (data, `resolution_kind`
e o aviso de somente leitura). Pasta com `DONE.md` é INTOCÁVEL por qualquer agente: reabrir exige o
usuário remover a trava, ou um bug novo com `regression-of`.

## Invariantes (o /reversa-debugger-graph valida e PARA com erro, nunca conserta em silêncio)

- `status: resolved` exige `resolution_kind` preenchido e `closure.satisfied: true`
- `DONE.md` sem `status: resolved`, ou `resolved` + `closure.satisfied` sem `DONE.md`, é inconsistência
- `resolution_kind: fixed` exige `root_cause.state: confirmed`, `regression_tests` não vazio e `spec_verdict` preenchido
- ID duplicado, referência a ID inexistente, autorrelação e ciclo de `duplicate-of` são erros
- Relação `proposed` nunca entra em priorização automática nem no impact score
