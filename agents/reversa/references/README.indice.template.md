# Índice — `_reversa_sdd`

> **Propósito:** <uma frase sobre o sistema>.
>
> Índice gerado por `/reversa` → `indice`. Não adicione rodapé "Gerado em…".

## Sumário

- [Comece por aqui](#comece-por-aqui)
- [Artefatos globais](#artefatos-globais)
- [Unidades](#unidades)
- [Manutenção agêntica](#manutenção-agêntica)
- [Como atualizar](#como-atualizar)
- [Sincronização doc ↔ código](#sincronização-doc--código)
- [Checklist PR](#checklist-pr)

---

## Comece por aqui

Ordem de leitura recomendada:

1. [domain.md](domain.md) — glossário e regras de negócio
2. [architecture.md](architecture.md) — visão arquitetural
3. Unidade específica: pasta da unidade → `requirements.md` / `design.md` / `tasks.md` (conforme `doc_level`)
4. [confidence-report.md](confidence-report.md) — cobertura e lacunas (se existir)

---

## Artefatos globais

| Artefato | Descrição |
|----------|-----------|
| [inventory.md](inventory.md) | Inventário do repositório |
| [dependencies.md](dependencies.md) | Stack e dependências |
| [code-analysis.md](code-analysis.md) | Análise técnica |
| [domain.md](domain.md) | Glossário e regras |
| [architecture.md](architecture.md) | Visão arquitetural |
| [confidence-report.md](confidence-report.md) | Relatório de confiança |

<!-- Substitua/expanda a tabela com os arquivos realmente presentes em _reversa_sdd/. -->

---

## Unidades

| Unidade | Specs |
|---------|:-----:|
| `[nome](nome/)` | ✅ / ⏳ / — |

<!-- Uma linha por unidade conforme a organização em .reversa/config.toml [specs]. -->

---

## Manutenção agêntica

Antes de implementar qualquer alteração, leia nesta ordem:

1. `domain.md`
2. Artefatos da unidade em escopo (`requirements.md` / `design.md` / `tasks.md`)
3. `architecture.md` e ADRs relacionados (se existirem)
4. `confidence-report.md` / `gaps.md` (se existirem)

```
Prompt para IA:
Leia domain.md e a pasta da unidade antes de codar.
Não invente endpoints ou tabelas — cite evidência ou marque LACUNA 🔴.
```

---

## Como atualizar

Com `/reversa` ativo:

| Comando | Ação |
|---------|------|
| `indice` | Regenera este README (preserva a tabela de sync) |
| `atualizar` | Incremental: commits desde o marco → unidades afetadas |
| `atualizar [unidade]` | Atualiza uma unidade específica |
| `atualizar --baseline` | Grava HEAD como marco inicial |

---

## Checklist PR

- [ ] Specs da unidade afetada atualizadas
- [ ] Este README com tabela **Sincronização doc ↔ código** atualizada (append)
- [ ] `.reversa/doc-sync.json` refletindo o HEAD documentado
- [ ] Commit de docs no mesmo PR do código (ou PR imediato seguinte)

---

## Sincronização doc ↔ código

> Histórico incremental de marcos doc↔código. Append a cada pipeline.
> Não editar manualmente; use `atualizar`, `atualizar --baseline` ou conclua um pipeline `/reversa`.

| Data | Branch | Commit | Ação | Notas |
|------|--------|--------|------|-------|
| <!-- YYYY-MM-DD HH:MM --> | <!-- branch --> | <!-- `sha` --> | <!-- baseline\|pipeline\|atualizar\|indice --> | <!-- notas --> |
