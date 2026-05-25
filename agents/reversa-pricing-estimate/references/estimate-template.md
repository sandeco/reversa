# estimate.md Template

This is the Markdown template used by the `reversa-pricing-estimate` agent to generate `_reversa_sdd/_pricing/<feature>/estimate.md`. Replace all `<placeholders>` with real values. Keep the structure fixed.

```markdown
# Price Estimate

**Feature:** `<feature_dir_relativa>`
**Generated at:** <created_at_local_readable>
**Calculation versions:** Effort v<effort_formula_version>, Value v<value_formula_version>, Market v<market_table_version>

**Consumed prerequisites:**
- Profile: `<output_folder>/_pricing/profile.json`
- Size: `<output_folder>/_pricing/<feature>/size.json` (class `<complexity_class>`, auxiliary score `<size_score>`)

## Overview

| Scenario | Range | Comment |
|---|---|---|
| **Effort** | <esforco_str> | <horas_min> to <horas_max>h, cost + tax + markup |
| **Value** | <valor_str> | 10% to 30% of the declared annual value |
| **Market Range** | <mercado_str> | sourced hourly rate by country and seniority |

## Effort Scenario

**What it is:** price calculated from likely hours, hourly rate, approximate tax reserve, and project markup. It is the defensible floor to avoid subsidizing the client.

**When to use:** always as a sanity check. Charging below Effort means taking a loss or reducing the project's profit too much.

| Item | Value |
|---|---|
| Complexity class | <complexity_class> |
| Seniority | <seniority> |
| Seniority factor | <seniority_factor> |
| Estimated hours | <horas_min> to <horas_max> h |
| Midpoint | <horas_estimadas> h |
| Hourly rate | <hourly_rate> <currency>/h |
| Direct cost | <custo_direto_min> to <custo_direto_max> <currency> |
| Approximate tax reserve | <imposto_aproximado_min> to <imposto_aproximado_max> <currency> |
| Project markup (<margin_percent>%) | <markup_aplicado_min> to <markup_aplicado_max> <currency> |
| **Effort Range** | **<preco_minimo> to <preco_maximo> <currency>** |
| Midpoint | <preco_total> <currency> |

<aviso_vat_se_aplicavel>
<bloco_billing_currency_se_aplicavel>

## Value Scenario

**What it is:** price based on part of the annual economic value that the feature generates or protects for the client. Reversa uses a capture of 10% to 30% of the declared annual value.

**When to use:** when the client can state return, savings, or cost of not doing it.

<se valor.available>

| Item | Value |
|---|---|
| Declared monthly return | <monthly_return_declared> <currency> |
| Impacted users | <users_impacted> |
| Cost of not doing it | <cost_of_not_doing> <currency> |
| Annual value used | <annual_value> <currency> |
| Applied capture | 10% to 30% |
| Recommended price | <preco_recomendado> <currency> |
| **Value Range** | **<preco_minimo> to <preco_maximo> <currency>** |
| Approximate payback | <payback_str> |

<bloco_billing_currency_se_aplicavel>

<se NOT valor.available>

> **Value Scenario not available:** <razao_unavailable>

</se>

## Market Range Scenario

**What it is:** range derived from hourly-rate benchmarks by country and seniority, multiplied by the same hour range used in the Effort scenario.

**When to use:** as an external reference. v2 does not multiply by client profile because there is no reliable public dataset for that.

<se mercado.available>

| Item | Value |
|---|---|
| Country / Seniority | <country_nome> / <seniority> |
| Pricing model / Client profile | <pricing_model> / <client_profile> |
| Complexity | <complexity_class> |
| Market hourly rate | <market_hourly_min> to <market_hourly_max> <currency>/h |
| Source type | <source_kind> |
| Reference year | <source_year> |
| Sources | <sources> |
| **Market Range** | **<preco_minimo_mercado> to <preco_maximo_mercado> <currency>** |

<se fallback aplicado>

> Fallback applied: <razao>

</se>

<bloco_billing_currency_se_aplicavel>

<se NOT mercado.available>

> **Market Scenario not available:** <razao_unavailable>

</se>

## How to choose between the three

<orientacao_pt_br_baseada_nos_cenarios>

General heuristic:

1. Client without a clear return: use Effort as the floor and Market as the external reference
2. Client with high and clear return: prefer Value, with Effort only as the minimum floor
3. Effort above Market: review profile, size, or client fit
4. Market above Effort: there is room to increase markup or improve the proposal

## Disclaimer

The numbers in this estimate are approximations for budgeting guidance, not a guarantee of closing the sale. The tax factor is an approximate reserve, not an exact legal rate. Real tax validation is the responsibility of the user's accountant. The market range is static and based on the sources documented in `market-benchmarks.md`. The client-declared return in the Value scenario is raw input and is not validated. It is recommended to add `_reversa_sdd/_pricing/<feature>/estimate.{md,json}` to `.gitignore` before committing.
```

## Billing currency

When `profile.billing_currency` is filled, each scenario gains an extra line:

```markdown
| In <billing_currency> | <valor_billing> <billing_currency> (exchange rate: 1 <billing_currency> = <exchange_rate_to_local> <currency>) |
```

## Short comments

| Scenario | Short comment |
|---|---|
| Effort | `<horas_min> to <horas_max>h, cost + tax + markup` |
| Value | `10% to 30% of the declared annual value` or `Not available` |
| Market | `sourced hourly rate by country and seniority` or `Not available` |
