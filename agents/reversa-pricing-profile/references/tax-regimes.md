# Tax regime catalog

Extensible catalog used by the `reversa-pricing-profile` agent to map the tax regime declared by the user to an approximate `tax_factor`. These factors are educational budget reserves, not exact legal tax rates.

## How to read this file

Each regime has:

- `key`: canonical key stored in `profile.json`
- `country`: ISO 3166-1 alpha-2 code or `INTL`
- `name_pt_br`: friendly label used in chat
- `tax_factor`: approximate factor applied over direct cost
- `tax_factor_kind`: `effective_reserve_estimate`, `statutory_proxy`, or `not_computed`
- `includes_vat`: whether it combines income/contribution tax with charged VAT/IVA/ISS
- `vat_pass_through_warning`: whether estimate should warn that part of the tax may be passed through to the client
- `tax_factor_source`: public source or description of the basis
- `notes_pt_br`: short note for the user

## Mandatory disclaimer

The factors listed here are educational approximations based on public references known in 2026-05. They do not replace accounting guidance. Accuracy depends on deductions, municipality, revenue band, CNAE, tax framing, withholdings, international treaties, and the rules in force when the invoice is issued.

The agent must repeat this disclaimer during the interview and in the footer of `profile.md`.

## Brazil (BR)

| key | name_pt_br | tax_factor | tax_factor_kind | includes_vat | vat_pass_through_warning | tax_factor_source | notes_pt_br |
|---|---|---:|---|---|---|---|---|
| MEI | Microempreendedor Individual (MEI) | 0.06 | effective_reserve_estimate | true | true | Portal do Empreendedor and public DAS-MEI rules | Simplified reserve. MEI usually has a fixed DAS and a revenue cap. Software activity may require category validation. |
| simples_servicos | Simples Nacional, servicos de TI | 0.15 | effective_reserve_estimate | true | true | Receita Federal, Simples Nacional, annexes and factor R | Medium reserve. The real rate depends on annex, RBT12, factor R, ISS, and withholdings. |
| lucro_presumido | Lucro Presumido, servicos | 0.165 | effective_reserve_estimate | true | true | Receita Federal, IRPJ, CSLL, PIS, COFINS, and ISS | Combined reserve for services. Validate municipal ISS and withholdings. |
| autonomo_pf | Pessoa fisica autonoma, carne-leao | 0.275 | effective_reserve_estimate | false | false | Receita Federal, progressive IRPF, and INSS | Reserve for a senior professional. Effective rate varies with deductions and social security contribution. |

## United States (US)

| key | name_pt_br | tax_factor | tax_factor_kind | includes_vat | vat_pass_through_warning | tax_factor_source | notes_pt_br |
|---|---|---:|---|---|---|---|---|
| self_employed_1099 | Self-Employed, 1099, sole proprietor | 0.30 | effective_reserve_estimate | false | false | IRS, self-employment tax, and federal income tax | Combined reserve. Does not include state tax or specific deductions. |
| s_corp_llc | S-Corp or LLC with S-Corp election | 0.22 | effective_reserve_estimate | false | false | IRS, payroll tax, reasonable salary, and distributions | Simplified reserve. Requires an accountant for reasonable salary and distributions. |

## Portugal (PT)

| key | name_pt_br | tax_factor | tax_factor_kind | includes_vat | vat_pass_through_warning | tax_factor_source | notes_pt_br |
|---|---|---:|---|---|---|---|---|
| pt_simplificado | Categoria B, regime simplificado | 0.21 | effective_reserve_estimate | true | true | Autoridade Tributaria, IRS Categoria B, IVA, and Seguranca Social | Combined reserve. VAT may be charged separately and passed through to the client. |
| pt_organizada | Categoria B, contabilidade organizada | 0.18 | effective_reserve_estimate | true | true | Autoridade Tributaria, organized accounting rules | Simplified reserve. Real costs may reduce the taxable base. |

## Mexico (MX)

| key | name_pt_br | tax_factor | tax_factor_kind | includes_vat | vat_pass_through_warning | tax_factor_source | notes_pt_br |
|---|---|---:|---|---|---|---|---|
| mx_resico | Regimen Simplificado de Confianza (RESICO) | 0.10 | effective_reserve_estimate | true | true | SAT, RESICO PF, and IVA | Combined reserve. ISR may be low, but VAT may apply depending on the case. |
| mx_actividad_empresarial | Actividad Empresarial y Profesional (PF) | 0.20 | effective_reserve_estimate | true | true | SAT, progressive ISR, and IVA | Simplified reserve for an independent professional. |

## International (INTL)

| key | name_pt_br | tax_factor | tax_factor_kind | includes_vat | vat_pass_through_warning | tax_factor_source | notes_pt_br |
|---|---|---:|---|---|---|---|---|
| intl_freelance_no_withhold | Freelance internacional, cliente sem retencao | 0.00 | not_computed | false | false | Depends on the provider's country | Client pays gross. Use the provider's national regime for the real tax calculation. |
| intl_freelance_with_withhold | Freelance internacional, cliente retem na fonte | 0.15 | effective_reserve_estimate | false | false | Bilateral treaties and local rules | Real withholding depends on the treaty and the client's country. |

## Other

| key | name_pt_br | tax_factor | tax_factor_kind | includes_vat | vat_pass_through_warning | tax_factor_source | notes_pt_br |
|---|---|---:|---|---|---|---|---|
| outro | Other regime, not listed | 0.00 | not_computed | false | false | User reported a regime that is not in the catalog | Tax not computed. Estimate should warn that the calculation is left to the accountant. |

## Essential regimes for future regions

Do not enable these countries as covered in the Market scenario without cataloging the minimum regimes:

| country | essential regimes |
|---|---|
| GB | sole_trader_self_assessment, limited_company |
| DE | freiberufler, gewerbe_einzelunternehmen, gmbh |
| ES | autonomo_estimacion_directa_simplificada, autonomo_estimacion_directa_normal, sociedad_limitada |
| AR | monotributo, responsable_inscripto |
| CO | regimen_simple, regimen_ordinario_persona_natural, sociedad |

Verified official sources:

- UK GOV.UK, sole trader and limited company: https://www.gov.uk/set-up-business/sole-trader.html
- Germany, federal administrative portal, tax registration: https://verwaltung.bund.de/leistungsverzeichnis/EN/leistung/99102019120000/herausgeber/HH-S1000020010000009790/region/020000000000
- Spain, Agencia Tributaria, income-determination regimes: https://sede.agenciatributaria.gob.es/Sede/irpf/empresarios-individuales-profesionales/regimenes-determinar-rendimiento-actividad.html
- Argentina ARCA, Monotributo: https://www.afip.gob.ar/monotributo/
- Colombia DIAN, Regimen Simple de Tributacion: https://micrositios.dian.gov.co/regimen-simple-tributacion/

## Suggested default regime by country

When the user answers "I don't know", the agent suggests the default below and marks `tax_regime_confidence = "low"`:

| country | suggested default regime |
|---|---|
| BR | simples_servicos |
| US | self_employed_1099 |
| PT | pt_simplificado |
| MX | mx_resico |
| Other country | no suggestion, request an explicit choice |

## How to extend

1. Add the country section with the same table
2. Cite a public source
3. Mark whether the factor includes VAT, IVA, or another charged tax
4. Do not call `tax_factor` a legal tax rate
5. Update the schema if new fields become necessary
