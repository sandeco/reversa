# `drift-check` — CI gate

CLI standalone para fallar el build de CI cuando las specs están desincronizadas con el código.

```bash
npx reversa drift-check
```

Exit codes:

| Code | Significado |
|---|---|
| 0 | Limpio — sin drift al severity elegido |
| 1 | Drift detectado — bloquea el build |
| 2 | `_reversa_sdd/drift.md` ausente — proyecto sin inicializar |

---

## Opciones

```
npx reversa drift-check [--format text|json] [--severity high|medium|low] [--folder <path>]
```

| Severity | Qué bloquea |
|---|---|
| **high** (default) | Solo `🔴 pending` |
| medium | `🔴 pending` + `🟡 stale` |
| low | Nada — siempre exit 0 |

| Format | Salida |
|---|---|
| **text** (default) | Resumen + lista |
| json | Payload estructurado |

---

## Por qué importa

Sin este gate, el drift loop es disciplina humana. Hooks encolan eventos, Chronicler actualiza specs — pero nada impide que un PR mergee con specs aún en `pending`.

`drift-check` cierra el ciclo: build que intenta enviar drift sin resolver falla.

---

## Ejemplo GitHub Actions

```yaml
- run: npx reversa drift-check --severity high
```

---

## Ver también

- [Agente Chronicler](agentes/cronista.es.md)
- [Hooks](hooks.es.md)
