# Effort scenario formula (effort-formula.md)

**Formula version:** 2.0

Documents the deterministic calculation that the `reversa-pricing-estimate` agent applies for the Effort scenario. Formula v2 removes the old linear conversion from score to hours and uses hour ranges by T-shirt size, with a seniority factor inspired by COCOMO II staff capability multipliers.

## Source and criterion

COCOMO II is a parametric effort estimation model that uses size, product attributes, platform, personnel, and project factors. For the Reversa UX, using the full model would be too complex. v2 uses only the defensible idea of staff capability multipliers while keeping simple hour ranges by class.

Main reference:

- Barry Boehm et al., *Software Cost Estimation with COCOMO II*, Prentice Hall, 2000
- Carnegie Mellon SEI, overview of software cost estimation and COCOMO II: https://insights.sei.cmu.edu/blog/software-cost-estimation-explained/

## Step 1: base hour range for senior

```
hours_by_complexity_class_senior:
  S:   4 to 12 hours
  M:   12 to 32 hours
  L:   32 to 80 hours
  XL:  80 to 160 hours
  XXL: 160 to 320 hours, with mandatory recommendation to break scope
```

These ranges are a Reversa heuristic based on T-shirt sizing. They are more honest than a linear constant because software estimation has real uncertainty.

## Step 2: seniority factor

```
seniority_factor:
  junior:      1.34
  mid:         1.15
  senior:      1.00
  staff_lead:  0.88
  principal:   0.76
```

Accepted aliases for compatibility:

```
pleno -> mid
especialista -> staff_lead
staff -> staff_lead
lead -> staff_lead
```

## Step 3: estimated hours

```
horas_min = round(hours_min[complexity_class] * seniority_factor)
horas_max = round(hours_max[complexity_class] * seniority_factor)
horas_estimadas = round((horas_min + horas_max) / 2)
```

The `horas_estimadas` field is the midpoint for compatibility and summary. The `horas_min` to `horas_max` range must be displayed in estimate.md.

## Step 4: direct cost

```
custo_direto_min = horas_min * profile.hourly_rate
custo_direto_max = horas_max * profile.hourly_rate
custo_direto = horas_estimadas * profile.hourly_rate
```

## Step 5: approximate tax

```
imposto_aproximado_min = custo_direto_min * profile.tax_factor
imposto_aproximado_max = custo_direto_max * profile.tax_factor
imposto_aproximado = custo_direto * profile.tax_factor
```

When `profile.tax_regime == "outro"` or `tax_factor = 0`, tax is not computed and estimate.md must show an explicit warning.

If the profile indicates that the factor includes VAT, IVA, or separately charged invoice tax, estimate.md must warn that this amount may be passed through to the client and does not necessarily reduce margin.

## Step 6: project markup

The historical `margin_percent` field must be treated as **project markup on top of direct cost**, not as accounting net margin.

```
markup_min = custo_direto_min * (profile.margin_percent / 100)
markup_max = custo_direto_max * (profile.margin_percent / 100)
markup_aplicado = custo_direto * (profile.margin_percent / 100)
```

## Step 7: total price

```
preco_minimo = round_currency(custo_direto_min + imposto_aproximado_min + markup_min)
preco_maximo = round_currency(custo_direto_max + imposto_aproximado_max + markup_max)
preco_total = round_currency(custo_direto + imposto_aproximado + markup_aplicado)
```

`preco_total` is the midpoint of the range and exists for compatibility. estimate.md should highlight `preco_minimo` to `preco_maximo`.

## Example

```
profile:
  country = BR, currency = BRL, seniority = senior
  hourly_rate = 100.00, margin_percent = 35, tax_factor = 0.15

size:
  complexity_class = L

hours_by_complexity_class_senior[L] = 32 to 80
seniority_factor[senior] = 1.00
horas_min = 32
horas_max = 80
horas_estimadas = 56

custo_direto_min = 3200.00
custo_direto_max = 8000.00
imposto_min = 480.00
imposto_max = 1200.00
markup_min = 1120.00
markup_max = 2800.00

preco_minimo = 4800.00 BRL
preco_maximo = 12000.00 BRL
preco_total = 8400.00 BRL
```

## Conversion to billing currency

When `profile.billing_currency` and `profile.exchange_rate_to_local` are filled:

```
valor_billing = round_currency(valor_local / exchange_rate_to_local)
```

estimate.md must print the rate used:

```
1 <billing_currency> = <exchange_rate_to_local> <currency>
```

## Limits

1. The formula does not mix team seniorities
2. XXL remains calculable, but must generate a strong recommendation to break scope
3. The hour range is heuristic, not a delivery promise
4. `size_score` does not enter the hour calculation
