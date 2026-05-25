# Market benchmarks (market-benchmarks.md)

**Table version:** 2.0
**Benchmark reference date:** 2026-05

Documents the static references that the `reversa-pricing-estimate` agent uses for the Market Range scenario. v2 removes invented total ranges by combination and starts using hourly benchmarks by country and seniority, deriving the total from the hour range in `effort-formula.md`.

## Mandatory disclaimer

The numbers are educational approximations based on public and commercial sources known in May 2026. They do not replace updated regional research. Many public sources provide monthly or annual salary, not direct freelance rates. When a row derives a freelance rate from salary, the `source_kind` field must say so explicitly.

## How to calculate the Market scenario

Each row has:

```
country | seniority | currency | min_hourly | max_hourly | source_kind | source_year | sources
```

The total per feature is derived as follows:

```
market_min = horas_min[complexity_class][seniority] * min_hourly
market_max = horas_max[complexity_class][seniority] * max_hourly
```

`pricing_model` changes only the presentation:

- `time_and_materials`: show hourly rate and estimated total by hours
- `escopo_fechado`, `sprint`, `valor_fixo_por_entrega`: show total per feature derived from hours
- `retainer`: show "equivalent range per feature within retainer"

`client_profile` does not alter the number in v2. Without a dataset by profile, client multipliers would be invented. estimate.md may add a qualitative note for microempresa, pequena_empresa, or enterprise.

## Table v2

| country | seniority | currency | min_hourly | max_hourly | source_kind | source_year | sources |
|---|---|---:|---:|---:|---|---:|---|
| BR | junior | BRL | 40 | 80 | salary_derived_freelance_estimate | 2025-2026 | Portal Salario CAGED, Glassdoor Brasil |
| BR | mid | BRL | 70 | 130 | salary_derived_freelance_estimate | 2025-2026 | Portal Salario CAGED, Glassdoor Brasil |
| BR | senior | BRL | 100 | 200 | salary_derived_freelance_estimate | 2025-2026 | Portal Salario CAGED, Glassdoor Brasil |
| BR | staff_lead | BRL | 160 | 300 | salary_derived_freelance_estimate | 2025-2026 | Portal Salario CAGED, Glassdoor Brasil |
| BR | principal | BRL | 220 | 420 | salary_derived_freelance_estimate | 2025-2026 | Portal Salario CAGED, Glassdoor Brasil |
| US | junior | USD | 20 | 40 | freelance_platform_and_public_wage | 2024-2025 | Upwork, O*NET/BLS |
| US | mid | USD | 40 | 70 | freelance_platform_and_public_wage | 2024-2025 | Upwork, O*NET/BLS |
| US | senior | USD | 70 | 150 | freelance_platform_and_public_wage | 2024-2025 | Upwork, O*NET/BLS |
| US | staff_lead | USD | 120 | 200 | freelance_platform_and_public_wage | 2024-2025 | Upwork, O*NET/BLS |
| US | principal | USD | 160 | 260 | freelance_platform_and_public_wage | 2024-2025 | Upwork, O*NET/BLS |
| PT | junior | EUR | 25 | 45 | salary_derived_contractor_estimate | 2024-2026 | Landing.Jobs, Hays Portugal |
| PT | mid | EUR | 40 | 70 | salary_derived_contractor_estimate | 2024-2026 | Landing.Jobs, Hays Portugal |
| PT | senior | EUR | 60 | 100 | salary_derived_contractor_estimate | 2024-2026 | Landing.Jobs, Hays Portugal |
| PT | staff_lead | EUR | 90 | 140 | salary_derived_contractor_estimate | 2024-2026 | Landing.Jobs, Hays Portugal |
| PT | principal | EUR | 120 | 180 | salary_derived_contractor_estimate | 2024-2026 | Landing.Jobs, Hays Portugal |
| MX | junior | MXN | 200 | 400 | salary_derived_freelance_estimate | 2025 | Glassdoor Mexico, Computrabajo Mexico |
| MX | mid | MXN | 350 | 650 | salary_derived_freelance_estimate | 2025 | Glassdoor Mexico, Computrabajo Mexico |
| MX | senior | MXN | 600 | 1000 | salary_derived_freelance_estimate | 2025 | Glassdoor Mexico, Computrabajo Mexico |
| MX | staff_lead | MXN | 900 | 1500 | salary_derived_freelance_estimate | 2025 | Glassdoor Mexico, Computrabajo Mexico |
| MX | principal | MXN | 1200 | 2000 | salary_derived_freelance_estimate | 2025 | Glassdoor Mexico, Computrabajo Mexico |

## Seniority aliases

```
pleno -> mid
especialista -> staff_lead
staff -> staff_lead
lead -> staff_lead
```

## Sources

- Portal Salario, Information Systems Programmer, CBO 317110, CAGED/eSocial/Empregador Web data, updated in 2026: https://www.salario.com.br/profissao/programador-de-sistemas-de-informacao-cbo-317110/
- Glassdoor Brazil, Software Developer, monthly range, updated in 2025: https://www.glassdoor.com/Salaries/br%C3%A9sil-software-developer-salary-SRCH_IL.0%2C6_IN36_KO7%2C25.htm
- O*NET Online, Software Developers 15-1252.00, local wages sourced from BLS 2024: https://www.onetonline.org/link/localwages/15-1252.00
- Upwork, Software Developer hourly cost guide, entry, intermediate, and expert ranges: https://www.upwork.com/hire/software-developers/cost/
- Landing.Jobs Global Tech Talent Trends 2024: https://campaign.landing.jobs/gttt-2024
- Hays Portugal Salary Guide 2026: https://www.hays.pt/en/salary-guide/overview
- Glassdoor Mexico, Software Developer, monthly range, updated in 2025: https://www.glassdoor.com/Salaries/mexico-software-developer-salary-SRCH_IL.0%2C6_IN169_KO7%2C25.htm
- Computrabajo Mexico, Developer and IT Developer salaries, updated in 2025: https://mx.computrabajo.com/salarios/desarrollador-it

## Fallback rules

1. If `country` is not in the table, Market is `unavailable: true`
2. If `seniority` comes as an alias, normalize and calculate
3. If `pricing_model` is not among known models, use `escopo_fechado` presentation and record fallback
4. `client_profile` does not alter price in v2
5. `complexity_class` must always exist in size, if missing, fail with a message asking to recalculate Sizer

## Countries not covered in v2

For `country` outside `[BR, US, PT, MX]`, the Market scenario is unavailable with explanation:

"Market range for `<country>` is not yet documented in this version of Reversa. Covered in v2: BR, US, PT, MX."

## How to extend

To add a country:

1. Prefer a public source of direct freelance rate
2. If using salary, record `source_kind = salary_derived_freelance_estimate`
3. Cite source and year per row
4. Do not add `client_profile` multipliers without a dataset
5. Bump `market` formula_version
