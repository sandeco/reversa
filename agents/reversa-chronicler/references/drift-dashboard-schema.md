# Schema do `<output_folder>/drift.md`

Dashboard de saúde das specs — mostra para cada spec o quão sincronizada está com o código atual.

Mantido pelo Chronicler no modo `after`. Pode ser lido por humanos e parseado pelo comando `npx reversa drift-check` (CI gate).

---

## Estrutura do arquivo

```markdown
# Drift Dashboard

Última atualização: YYYY-MM-DD HH:MM (UTC)
Geração: reversa-chronicler v2.0.0

## Resumo

- Total de specs: [N]
- 🟢 resolved: [N] ([P]%)
- 🟡 stale: [N] ([P]%)
- 🔴 pending: [N] ([P]%)

## Specs

| Spec | Última sincronização | Status | Distribuição confiança | Ação sugerida |
|---|---|---|---|---|
| `sdd/authentication.md` | 2026-04-29 14:32 | 🟢 resolved | 🟢 80% / 🟡 18% / 🔴 2% | — |
| `sdd/billing.md` | 2026-04-25 09:10 | 🟡 stale | 🟢 75% / 🟡 20% / 🔴 5% | Rodar `/reversa-archaeologist` |
| `sdd/notifications.md` | 2026-04-29 14:25 | 🔴 pending | 🟢 60% / 🟡 30% / 🔴 10% | Rodar `/reversa-chronicler after` |
```

---

## Campos

### `Spec`
Caminho relativo ao `<output_folder>/`. Geralmente em `sdd/`, mas pode incluir `openapi/`, `database/`, etc.

### `Última sincronização`
Timestamp UTC da última vez que o Chronicler atualizou (ou confirmou consistência) desta spec. Formato: `YYYY-MM-DD HH:MM`.

### `Status`
Um de:

| Valor | Significado | Quando aplicar |
|---|---|---|
| `🟢 resolved` | Spec sincronizada com o código atual | Após processar mudanças ou após confirmar que nenhuma mudança recente afetou a spec |
| `🟡 stale` | Sem sincronização há >7 dias e código foi modificado nos paths mapeados | Detectado por hooks (modo `after`) ou por escaneamento periódico |
| `🔴 pending` | Mudança detectada mas ainda não processada pelo Chronicler | Hooks marcam como `pending` no momento da edição; Chronicler `after` muda pra `resolved` |

### `Distribuição confiança`
Percentual de afirmações 🟢/🟡/🔴 na spec, recomputado quando a spec é atualizada.

Cálculo: contar emojis 🟢, 🟡, 🔴 na spec, dividir por total, arredondar para inteiro.

### `Ação sugerida`
Texto livre — geralmente o slash command recomendado:
- `Rodar /reversa-chronicler after` (status `pending`)
- `Rodar /reversa-archaeologist` (drift estrutural ou stale)
- `Rodar /reversa-reviewer` (múltiplas specs afetadas)
- `Rodar /reversa-data-master` (mudança em schema)
- `—` (status `resolved`, sem ação)

---

## Regras de transição de status

```
[novo arquivo de spec criado]
        │
        ▼
   🟢 resolved
        │
        │ (hook detecta edição em arquivo mapeado)
        ▼
   🔴 pending
        │
        │ (Chronicler after processa)
        ▼
   🟢 resolved
        │
        │ (>7 dias sem sync + edições não processadas detectadas)
        ▼
   🟡 stale
        │
        │ (Chronicler after ou Archaeologist processa)
        ▼
   🟢 resolved
```

---

## Auto-cleanup

Para evitar crescimento ilimitado:

- Specs `resolved` há mais de 30 dias **continuam** no dashboard (último sync é informação útil)
- Linhas de specs deletadas (arquivo de spec não existe mais) são removidas após 60 dias
- Não há rotação de drift.md — é o estado atual, não histórico

Histórico de mudanças vive em `<output_folder>/changelog/YYYY-MM-DD.md`.

---

## Parsing pelo `drift-check` CLI

O comando `npx reversa drift-check` parseia este arquivo procurando o emoji de status na coluna `Status`:

- Conta linhas com `🔴 pending` → `pendingCount`
- Conta linhas com `🟡 stale` → `staleCount`
- Conta linhas com `🟢 resolved` → `resolvedCount`

Exit codes:
- `0` se `pendingCount == 0` (limpo)
- `1` se `pendingCount > 0` (drift não-resolvido — falha CI)
- `2` se `drift.md` não existe (orienta rodar `/reversa` primeiro)

Filtros opcionais:
- `--severity high`: conta apenas `pending`
- `--severity medium`: conta `pending + stale`
- `--severity low`: ignora todos (sempre exit 0 — apenas reporta)
