# Schema da oportunidade e da transformação

Contrato mínimo dos artefatos que o time Code Quality escreve. Front matter YAML + corpo em Markdown. Escrita atômica (tempfile + rename, UTF-8 sem BOM).

## opportunities/<id>.md

```yaml
---
schema_version: 1
id: OPP-<YYYYMMDD>-<sufixo>          # sufixo: 4 chars base32 de hash de título+data
display_number: <n>                  # apelido humano global, maior existente + 1
context: <slug-do-contexto>
verb: restructure | modularize | decouple | optimize | simplify | standardize | prune
title: <frase curta>
target:
  files: [<caminho>, ...]
  symbol: <opcional: função/classe/módulo>
smell: <code smell ou motivo objetivo>
roi:
  confidence: green | yellow | red    # 🟢 coberto e entendido | 🟡 parcial | 🔴 sem prova
  impact: <por que vale: hotpath, acoplamento, risco, clareza>
  cost: low | medium | high
  est_return: <retorno esperado em uma frase>
state: proposed | approved | applied | reverted | declined
traceability:
  soul: [<locator em soul.md>, ...]   # regras/decisões da alma que tocam o alvo
  specs: [<caminho#âncora>, ...]      # seções de spec confirmadas relacionadas
---

<descrição da oportunidade, com o antes observado e a transformação proposta>
```

## transformations/OPP-.../transformation.md

```yaml
---
schema_version: 1
id: OPP-<...>
verb: <o mesmo da oportunidade>
state: applied | reverted
safety_net:
  kind: existing | characterization | none
  green_before: true | false
  green_after: true | false
preservation:
  method: tests | equivalence-proof | death-proof | pattern-only
  evidence: [<caminho relativo>, ...]
measurement:                          # obrigatório para optimize/decouple/simplify
  before: <complexidade/acoplamento/tempo antes>
  after: <depois>
change_set:
  - chg: CHG-001
    file: <caminho>
    purpose: <o que muda>
approval:
  by: user
  at: <ISO 8601>
reversible_via: [CHG-001.diff, ...]
---

<o que foi feito, por etapa, com links relativos para as evidências>
```

## Regras

- `soul` e `specs` confirmados que tocam o alvo são consultados sempre. Regra de negócio confirmada nunca é ferida nem tratada como código morto.
- Estados são monotônicos no sentido de auditoria: `declined` e `reverted` preservam o histórico, nunca apagam o registro.
- `prune` só marca `state: applied` com `preservation.method: death-proof` e a prova anexada. Órfão suspeito fica `proposed` com `promoted_to: null`.
