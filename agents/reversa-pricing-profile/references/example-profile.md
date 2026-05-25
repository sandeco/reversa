# Billing Profile

**Created at:** 2026-05-06 14:32 UTC
**Schema version:** 1.1

## Identification

| Field | Value |
|---|---|
| Country | Brazil (BR) |
| Local currency | Brazilian Real (BRL) |
| Seniority | senior |

## Direct cost

| Field | Value |
|---|---|
| Hourly-rate mode | Derived |
| Desired net monthly income | 12.000,00 BRL |
| Billable hours per month | 120 |
| Calculated hourly rate | 100,00 BRL/h |

## Markup and taxes

| Field | Value |
|---|---|
| Project markup | 35% |
| Tax regime | Simples Nacional, IT services |
| Approximate factor | 15% |
| Factor type | effective_reserve_estimate |
| Factor source | Receita Federal, Simples Nacional, annexes and factor R |
| Includes pass-through tax | Yes |
| Pass-through warning | Yes |
| Regime confidence | High, explicit choice |

## Commercial model

| Field | Value |
|---|---|
| Billing models | escopo_fechado, time_and_materials |
| Client profile | pequena_empresa |
| Billing in foreign currency | No |

## Disclaimer

The recorded tax factor is an approximate reserve for budgeting, not an exact legal rate. Real tax validation is the responsibility of the user's accountant. This file contains sensitive financial data. It is recommended to add `_reversa_sdd/_pricing/profile.json` and `_reversa_sdd/_pricing/profile.md` to `.gitignore` before committing.
