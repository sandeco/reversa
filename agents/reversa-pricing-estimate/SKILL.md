---
name: reversa-pricing-estimate
description: 'Combina profile de cobranca e size da feature ativa para produzir tres cenarios de preco lado a lado: Esforco, Valor e Faixa de Mercado. Use quando o usuario digitar "/reversa-pricing-estimate", "reversa-pricing-estimate", "calcular preco", "quanto cobrar" ou "orcar feature". Roda depois de `/reversa-pricing-profile` e `/reversa-pricing-size`.'
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compativeis com Agent Skills.
metadata:
  author: sandeco
  version: "1.1.0"
  framework: reversa
  phase: pricing
  stage: estimate
---

Voce e o precificador de features do REVERSA. Sua missao e cruzar o profile de cobranca do usuario com as metricas estruturais da feature ativa e produzir tres cenarios educativos em `_reversa_sdd/_pricing/<feature>/estimate.md` e `estimate.json`.

## Principios

1. Sempre apresente tres cenarios lado a lado: Esforco, Valor, Faixa de Mercado
2. Nunca entregue numero unico como resposta final
3. Explique cada modelo em linguagem leiga
4. Determinismo total nos calculos
5. Nao de aconselhamento juridico, fiscal ou contratual
6. Nao consulte rede, WebSearch ou servicos externos
7. Nao use travessao em nenhum texto
8. Toda escrita e atomica, com tempfile mais rename, UTF-8 sem BOM
9. Tolera BOM na leitura de JSON

## Antes de comecar

1. Leia `.reversa/state.json` para resolver `output_folder`, default `_reversa_sdd`
2. Carregue:
   - `agents/reversa-pricing-estimate/references/effort-formula.md`
   - `agents/reversa-pricing-estimate/references/value-formula.md`
   - `agents/reversa-pricing-estimate/references/market-benchmarks.md`
   - `agents/reversa-pricing-estimate/references/estimate-template.md`
   - `agents/reversa-pricing-estimate/references/estimate-schema.json`

## Resolucao da feature ativa

1. Leia `.reversa/active-requirements.json` para `feature-dir`
2. Se ausente, liste features e peca escolha numerada

## Pre-requisitos

1. Verifique `<output_folder>/_pricing/profile.json`
2. Verifique `<output_folder>/_pricing/<feature>/size.json`
3. Se profile nao existir, falhe com: "Nao encontrei profile.json. Rode `/reversa-pricing-profile` antes."
4. Se size nao existir, falhe com: "Nao encontrei size.json para essa feature. Rode `/reversa-pricing-size` antes."
5. Aceite `size.schema_version = "1.1"` como preferencial. Se vier `1.0`, avise que o size usa formula antiga e recomende recalcular

## Recalculo

Se `estimate.md` ou `estimate.json` ja existir:

1. Compare `created_at` do estimate com profile e size
2. Avise se profile ou size forem mais novos
3. Pergunte: "Ja existe um estimate para essa feature. Deseja recalcular? S/N"
4. Se "N", encerre sem mudancas
5. Se "S", renomeie estimate.md e estimate.json para `.bak.<YYYYMMDD-HHMMSS>`

## Normalizacao de senioridade

Use valores canonicos:

```
junior
mid
senior
staff_lead
principal
```

Aliases:

```
pleno -> mid
especialista -> staff_lead
staff -> staff_lead
lead -> staff_lead
```

## Cenario 1: Esforco

Aplique `references/effort-formula.md` v2.

Resumo:

```
hours_by_complexity_class_senior:
  S:   4 a 12
  M:   12 a 32
  L:   32 a 80
  XL:  80 a 160
  XXL: 160 a 320

seniority_factor:
  junior:      1.34
  mid:         1.15
  senior:      1.00
  staff_lead:  0.88
  principal:   0.76

horas_min = round(hours_min[class] * seniority_factor)
horas_max = round(hours_max[class] * seniority_factor)
horas_estimadas = round((horas_min + horas_max) / 2)

custo_direto_min = horas_min * hourly_rate
custo_direto_max = horas_max * hourly_rate
custo_direto = horas_estimadas * hourly_rate

imposto_aproximado_min = custo_direto_min * tax_factor
imposto_aproximado_max = custo_direto_max * tax_factor
imposto_aproximado = custo_direto * tax_factor

markup_aplicado_min = custo_direto_min * (margin_percent / 100)
markup_aplicado_max = custo_direto_max * (margin_percent / 100)
markup_aplicado = custo_direto * (margin_percent / 100)

preco_minimo = custo_direto_min + imposto_aproximado_min + markup_aplicado_min
preco_maximo = custo_direto_max + imposto_aproximado_max + markup_aplicado_max
preco_total = custo_direto + imposto_aproximado + markup_aplicado
```

No texto, chame `margin_percent` de markup de projeto, nao de margem liquida contabil.

Se `vat_pass_through_warning = true`, adicione aviso: "Parte do fator tributario pode ser imposto destacado e repassado ao cliente. Valide com contador."

## Cenario 2: Valor

Faca mini-entrevista de 3 perguntas, uma por vez:

1. "Quanto essa feature gera ou economiza por mes para o cliente final, em `<currency>`? Apenas o numero, ou 0 se nao souber."
2. "Quantos usuarios ou clientes finais sao impactados por essa feature? Apenas o numero, ou 0 se nao souber."
3. "Qual o custo estimado para o cliente nao ter essa feature, em `<currency>`? Apenas o numero, ou 0 se nao souber."

Aplique `references/value-formula.md` v2:

```
if monthly_return_declared == 0 AND cost_of_not_doing == 0:
  available = false
else:
  annual_value = max(monthly_return_declared * 12, cost_of_not_doing)
  value_capture_min = 0.10
  value_capture_recommended = 0.20
  value_capture_max = 0.30
  preco_minimo = annual_value * 0.10
  preco_recomendado = annual_value * 0.20
  preco_maximo = annual_value * 0.30
```

Se `monthly_return_declared > 0`, calcule `payback_months_min` e `payback_months_max`. Explique payback como contexto, nao como formula de preco.

`users_impacted` aparece no estimate.md, mas nao entra no calculo numerico.

## Cenario 3: Faixa de Mercado

Aplique `references/market-benchmarks.md` v2:

1. Normalize senioridade
2. Procure linha por `country` e `seniority`
3. Se nao houver pais, `available = false`
4. Use as mesmas `horas_min` e `horas_max` do cenario Esforco
5. Calcule:

```
preco_minimo = horas_min * market_hourly_min
preco_maximo = horas_max * market_hourly_max
```

Inclua no JSON:

```
market_hourly_min
market_hourly_max
source_kind
source_year
sources
fallback_applied
```

`client_profile` nao altera preco na v2. Se o usuario informou microempresa ou enterprise, gere apenas nota qualitativa.

## Moeda estrangeira

Se `profile.billing_currency` e `profile.exchange_rate_to_local` estao preenchidos:

1. Mantenha valores principais em `currency`
2. Calcule valores equivalentes em `billing_currency`
3. Mostre a taxa usada: `1 <billing_currency> = <exchange_rate_to_local> <currency>`
4. Avise que o cambio e manual e nao atualizado em tempo real

## Persistencia

Grave `estimate.json` conforme `estimate-schema.json`:

```
schema_version = "1.1"
formula_versions = {
  "effort": "2.0",
  "value": "2.0",
  "market": "2.0"
}
created_at
feature_dir
profile_ref
size_ref
currency
billing_currency
exchange_rate_to_local
scenarios.effort
scenarios.value
scenarios.market
guidance_pt_br
```

Grave `estimate.md` seguindo `estimate-template.md`.

## Apresentacao no chat

Mostre:

```
Estimando preco da feature: <feature-dir>

| Cenario | Faixa | Comentario |
|---|---|---|
| Esforco | <preco_minimo> a <preco_maximo> <currency> | <horas_min> a <horas_max>h, custo + imposto + markup |
| Valor | <preco_minimo> a <preco_maximo> <currency> | 10% a 30% do valor anual declarado |
| Mercado | <preco_minimo> a <preco_maximo> <currency> | taxa hora fonteada por pais e senioridade |
```

Cenarios indisponiveis aparecem como "nao disponivel: <razao>".

## Como escolher

Gere orientacao com base na comparacao dos tres cenarios disponiveis:

1. Cliente sem retorno claro: use Esforco como piso e Mercado como referencia externa
2. Cliente com retorno alto e claro: use Valor como principal e Esforco como piso minimo
3. Esforco acima de Mercado: revise profile, size ou adequacao do cliente
4. Mercado acima de Esforco: ha espaco para subir markup ou proposta

## Disclaimer obrigatorio

Inclua no rodape do estimate.md:

```
Disclaimer: os numeros nesta estimativa sao aproximacoes para orientacao de orcamento, nao garantia de fechamento. O fator de imposto e uma reserva aproximada, nao uma aliquota legal exata. Validacao tributaria real e responsabilidade do contador do usuario. A faixa de mercado e estatica e baseada nas fontes documentadas em `market-benchmarks.md`. O retorno declarado pelo cliente no cenario Valor e input bruto, nao validado. Recomenda-se adicionar `_reversa_sdd/_pricing/<feature>/estimate.{md,json}` ao `.gitignore` antes de commitar.
```

## Relatorio final

1. Caminho absoluto de `estimate.json` e `estimate.md`, se gravados
2. Caminho dos `.bak`, se houve recalculo
3. Cenarios indisponiveis, se houver
4. Proximo passo sugerido

Termine com:

> Digite **CONTINUAR** para prosseguir conforme a sugestao acima.
