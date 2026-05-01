# `drift-check` — CI gate

CLI standalone pra falhar o build de CI quando specs estão fora de sincronia com o código.

```bash
npx reversa drift-check
```

Exit codes:

| Code | Significado |
|---|---|
| 0 | Limpo — sem drift no severity escolhido |
| 1 | Drift detectado — bloqueia o build |
| 2 | `_reversa_sdd/drift.md` ausente — projeto não inicializado |

---

## Opções

```
npx reversa drift-check [--format text|json] [--severity high|medium|low] [--folder <path>]
```

### `--severity`

| Nível | O que bloqueia |
|---|---|
| **high** (padrão) | Apenas specs `🔴 pending` |
| medium | `🔴 pending` + `🟡 stale` |
| low | Nada — sempre exit 0, só reporta contagens |

### `--format`

| Formato | Saída |
|---|---|
| **text** (padrão) | Resumo legível + lista + dica de fix |
| json | Payload estruturado pra ferramentas de CI |

### `--folder`

Override do output folder. Por padrão lê `output_folder` de `.reversa/state.json` com fallback `_reversa_sdd`.

---

## Por que importa

Sem este gate, o drift loop é puramente disciplina humana. Hooks enfileiram eventos, Chronicler atualiza specs — mas nada impede um PR de mergear com specs ainda em `pending`.

`drift-check` fecha o ciclo: build que tenta enviar drift não-resolvido falha. Desenvolvedores ou rodam `/reversa-chronicler after` pra resolver, ou explicitamente baixam a severidade (com justificativa) pra aquele PR.

---

## Exemplos de CI

### GitHub Actions

```yaml
# .github/workflows/ci.yml
jobs:
  drift-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx reversa drift-check --severity high --format json
```

### GitLab CI

```yaml
drift-check:
  image: node:20
  script:
    - npx reversa drift-check --severity high
```

### pre-push hook genérico

```bash
#!/bin/sh
# .git/hooks/pre-push
if ! npx reversa drift-check --severity high; then
  echo "Push bloqueado. Rode /reversa-chronicler after pra resolver."
  exit 1
fi
```

---

## Engine-agnostic

Esse comando NÃO carrega código de agente, chalk, inquirer ou geradores de hook. Só:

1. Lê `.reversa/state.json` pra achar output folder (best-effort)
2. Parseia a tabela markdown em `_reversa_sdd/drift.md`
3. Conta status
4. Sai

Cold start rápido (sem imports pesados), serve em qualquer CI runner.

---

## Schema JSON

```json
{
  "severity": "high",
  "source": "/abs/path/to/_reversa_sdd/drift.md",
  "counts": { "pending": 1, "stale": 2, "resolved": 12 },
  "blocking": [
    { "spec": "sdd/notifications.md", "status": "pending", "action": "Rodar /reversa-chronicler after" }
  ],
  "clean": false
}
```

Quando `_reversa_sdd/drift.md` está ausente, saída JSON:

```json
{
  "error": "drift.md not found",
  "path": "/abs/path/to/_reversa_sdd/drift.md",
  "hint": "Rode /reversa pra inicializar, depois /reversa-chronicler after pra popular drift.md"
}
```

---

## Veja também

- [Agente Chronicler](agentes/cronista.pt.md) — quem popula o `drift.md`
- [Hooks](hooks.pt.md) — auto-trigger do Chronicler por edição de arquivo
