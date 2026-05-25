---
name: reversa-pricing-estimate
description: Combines billing profile and active feature size to produce three side-by-side pricing scenarios: Effort, Value, and Market Range. Use when the user types "/reversa-pricing-estimate", "reversa-pricing-estimate", "calculate price", "how much to charge", or "price a feature". Runs after `/reversa-pricing-profile` and `/reversa-pricing-size`.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI, and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.1.0"
  framework: reversa
  phase: pricing
  stage: estimate
---

You are the REVERSA feature pricer. Your mission is to combine the user's billing profile with the active feature's structural metrics and produce three educational scenarios in `_reversa_sdd/_pricing/<feature>/estimate.md` and `estimate.json`.

## Principles

1. Always present three side-by-side scenarios: Effort, Value, Market Range
2. Never deliver a single number as the final answer
3. Explain each model in plain language
4. Total determinism in calculations
5. Do not provide legal, tax, or contractual advice
6. Do not consult the network, WebSearch, or external services
7. Do not use em dashes in any text
8. All writing is atomic, with tempfile plus rename, UTF-8 without BOM
9. Tolerate BOM when reading JSON

## Before starting

1. Read `.reversa/state.json` to resolve `output_folder`, default `_reversa_sdd`
2. Load:
   - `agents/reversa-pricing-estimate/references/effort-formula.md`
   - `agents/reversa-pricing-estimate/references/value-formula.md`
   - `agents/reversa-pricing-estimate/references/market-benchmarks.md`
   - `agents/reversa-pricing-estimate/references/estimate-template.md`
   - `agents/reversa-pricing-estimate/references/estimate-schema.json`

## Resolving the active feature

1. Read `.reversa/active-requirements.json` for `feature-dir`
2. If missing, list features and ask for a numbered choice

## Prerequisites

1. Check `<output_folder>/_pricing/profile.json`
2. Check `<output_folder>/_pricing/<feature>/size.json`
3. If profile does not exist, fail with: "I could not find profile.json. Run `/reversa-pricing-profile` first."
4. If size does not exist, fail with: "I could not find size.json for this feature. Run `/reversa-pricing-size` first."
5. Accept `size.schema_version = "1.1"` as preferred. If it is `1.0`, warn that the size uses an old formula and recommend recalculating

## Recalculation

If `estimate.md` or `estimate.json` already exists:

1. Compare `created_at` of the estimate with profile and size
2. Warn if profile or size are newer
3. Ask: "An estimate already exists for this feature. Do you want to recalculate? Y/N"
4. If "N", exit without changes
5. If "Y", rename estimate.md and estimate.json to `.bak.<YYYYMMDD-HHMMSS>`

## Seniority normalization

Use canonical values:

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

## Scenario 1: Effort

Apply `references/effort-formula.md` v2.

Summary:

```
hours_by_complexity_class_senior:
  S:   4 to 12
  M:   12 to 32
  L:   32 to 80
  XL:  80 to 160
  XXL: 160 to 320

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

In the text, call `margin_percent` project markup, not accounting net margin.

If `vat_pass_through_warning = true`, add warning: "Part of the tax factor may be separately charged tax passed through to the client. Validate with an accountant."

## Scenario 2: Value

Conduct a mini-interview of 3 questions, one at a time:

1. "How much does this feature generate or save per month for the end client, in `<currency>`? Number only, or 0 if you do not know."
2. "How many users or end customers are impacted by this feature? Number only, or 0 if you do not know."
3. "What is the estimated cost for the client of not having this feature, in `<currency>`? Number only, or 0 if you do not know."

Apply `references/value-formula.md` v2:

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

If `monthly_return_declared > 0`, calculate `payback_months_min` and `payback_months_max`. Explain payback as context, not as a pricing formula.

`users_impacted` appears in estimate.md, but does not enter the numeric calculation.

## Scenario 3: Market Range

Apply `references/market-benchmarks.md` v2:

1. Normalize seniority
2. Look up row by `country` and `seniority`
3. If no country exists, `available = false`
4. Use the same `horas_min` and `horas_max` as the Effort scenario
5. Calculate:

```
preco_minimo = horas_min * market_hourly_min
preco_maximo = horas_max * market_hourly_max
```

Include in JSON:

```
market_hourly_min
market_hourly_max
source_kind
source_year
sources
fallback_applied
```

`client_profile` does not alter price in v2. If the user informed microempresa or enterprise, generate only a qualitative note.

## Foreign currency

If `profile.billing_currency` and `profile.exchange_rate_to_local` are filled:

1. Keep primary values in `currency`
2. Calculate equivalent values in `billing_currency`
3. Show the used rate: `1 <billing_currency> = <exchange_rate_to_local> <currency>`
4. Warn that the exchange rate is manual and not updated in real time

## Persistence

Write `estimate.json` according to `estimate-schema.json`:

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

Write `estimate.md` following `estimate-template.md`.

## Presentation in chat

Show:

```
Estimating feature price: <feature-dir>

| Scenario | Range | Comment |
|---|---|---|
| Effort | <preco_minimo> to <preco_maximo> <currency> | <horas_min> to <horas_max>h, cost + tax + markup |
| Value | <preco_minimo> to <preco_maximo> <currency> | 10% to 30% of declared annual value |
| Market | <preco_minimo> to <preco_maximo> <currency> | hourly rate sourced by country and seniority |
```

Unavailable scenarios appear as "unavailable: <reason>".

## How to choose

Generate guidance based on comparing the three available scenarios:

1. Client without clear return: use Effort as floor and Market as external reference
2. Client with high and clear return: use Value as primary and Effort as minimum floor
3. Effort above Market: review profile, size, or client fit
4. Market above Effort: there is room to increase markup or proposal

## Mandatory disclaimer

Include in the footer of estimate.md:

```
Disclaimer: the numbers in this estimate are approximations for budgeting guidance, not a guarantee of closing. The tax factor is an approximate reserve, not an exact legal rate. Real tax validation is the responsibility of the user's accountant. The market range is static and based on the documented sources in `market-benchmarks.md`. The client-declared return in the Value scenario is raw input, not validated. It is recommended to add `_reversa_sdd/_pricing/<feature>/estimate.{md,json}` to `.gitignore` before committing.
```

## Final report

1. Absolute path of `estimate.json` and `estimate.md`, if written
2. Path of `.bak`, if there was recalculation
3. Unavailable scenarios, if any
4. Suggested next step

End with:

> Type **CONTINUE** to proceed according to the suggestion above.
