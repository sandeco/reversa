# Price Estimate

**Feature:** `_reversa_sdd/forward/042-pagamento-pix`
**Generated at:** 2026-05-06 16:42 UTC
**Calculation versions:** Effort v2.0, Value v2.0, Market v2.0

**Consumed prerequisites:**
- Profile: `_reversa_sdd/_pricing/profile.json`
- Size: `_reversa_sdd/_pricing/042-pagamento-pix/size.json` (class `L`, auxiliary score `60`)

## Overview

| Scenario | Range | Comment |
|---|---|---|
| **Effort** | 4.800,00 to 12.000,00 BRL | 32 to 80h, cost + tax + markup |
| **Value** | 2.400,00 to 7.200,00 BRL | 10% to 30% of the declared annual value |
| **Market Range** | 3.200,00 to 16.000,00 BRL | sourced hourly rate by country and seniority |

## Effort Scenario

**What it is:** price calculated from likely hours, hourly rate, approximate tax reserve, and project markup. It is the defensible floor to avoid subsidizing the client.

**When to use:** always as a sanity check. Charging below Effort means taking a loss or reducing the project's profit too much.

| Item | Value |
|---|---|
| Complexity class | L |
| Seniority | senior |
| Seniority factor | 1,00 |
| Estimated hours | 32 to 80 h |
| Midpoint | 56 h |
| Hourly rate | 100,00 BRL/h |
| Direct cost | 3.200,00 to 8.000,00 BRL |
| Approximate tax reserve | 480,00 to 1.200,00 BRL |
| Project markup (35%) | 1.120,00 to 2.800,00 BRL |
| **Effort Range** | **4.800,00 to 12.000,00 BRL** |
| Midpoint | 8.400,00 BRL |

Warning: part of the tax factor may be pass-through tax charged to the client. Validate with an accountant.

## Value Scenario

**What it is:** price based on part of the annual economic value that the feature generates or protects for the client. Reversa uses a capture of 10% to 30% of the declared annual value.

**When to use:** when the client can state return, savings, or cost of not doing it.

| Item | Value |
|---|---|
| Declared monthly return | 2.000,00 BRL |
| Impacted users | 500 |
| Cost of not doing it | 5.000,00 BRL |
| Annual value used | 24.000,00 BRL |
| Applied capture | 10% to 30% |
| Recommended price | 4.800,00 BRL |
| **Value Range** | **2.400,00 to 7.200,00 BRL** |
| Approximate payback | 1,2 to 3,6 months |

## Market Range Scenario

**What it is:** range derived from hourly-rate benchmarks by country and seniority, multiplied by the same hour range used in the Effort scenario.

**When to use:** as an external reference. v2 does not multiply by client profile because there is no reliable public dataset for that.

| Item | Value |
|---|---|
| Country / Seniority | Brazil / senior |
| Pricing model / Client profile | escopo_fechado / pequena_empresa |
| Complexity | L |
| Market hourly rate | 100,00 to 200,00 BRL/h |
| Source type | salary_derived_freelance_estimate |
| Reference year | 2025-2026 |
| Sources | Portal Salario CAGED, Glassdoor Brasil |
| **Market Range** | **3.200,00 to 16.000,00 BRL** |

## How to choose between the three

The declared Value produces a lower range than the median Effort. Use Effort as the defensible floor and Market as the external reference. For this client, charge below 4.800 BRL only if there is a clear strategic reason.

General heuristic:

1. Client without a clear return: use Effort as the floor and Market as the external reference
2. Client with high and clear return: prefer Value, with Effort only as the minimum floor
3. Effort above Market: review profile, size, or client fit
4. Market above Effort: there is room to increase markup or improve the proposal

## Disclaimer

The numbers in this estimate are approximations for budgeting guidance, not a guarantee of closing the sale. The tax factor is an approximate reserve, not an exact legal rate. Real tax validation is the responsibility of the user's accountant. The market range is static and based on the sources documented in `market-benchmarks.md`. The client-declared return in the Value scenario is raw input and is not validated. It is recommended to add `_reversa_sdd/_pricing/<feature>/estimate.{md,json}` to `.gitignore` before committing.
