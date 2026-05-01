# Hooks (Chronicler automático)

Instala hooks en tu engine de IA para que el Chronicler corra automáticamente cuando edites un archivo.

`/reversa-chronicler after` manual siempre funciona como fallback.

---

## Quick start

```bash
npx reversa add-hooks --engine claude-code   # o cursor, kimi-cli, codex, opencode
```

Verás un preview antes de escribir. Confirma para instalar.

Para desinstalar:

```bash
npx reversa remove-hooks --engine claude-code
npx reversa remove-hooks --all
```

---

## Qué hace el hook

Cuando la engine dispara un tool que edita archivos, el hook invoca el runner en `.reversa/_hooks/runner.js`. El runner:

1. Append en `.reversa/chronicler-queue.json` (con lock para concurrencia)
2. Stub en `_reversa_sdd/changelog/YYYY-MM-DD.md`
3. Marca specs afectadas como `🔴 pending` en `_reversa_sdd/drift.md`
4. Warning en stderr si se afectó spec de alta confianza

Nunca bloquea la engine. Nunca modifica tu código. Errores en `.reversa/chronicler-errors.log`.

---

## Engines soportadas

| Engine | Archivo | Eventos |
|---|---|---|
| Claude Code | `.claude/settings.json` | PreToolUse + PostToolUse |
| Cursor | `.cursor/hooks.json` | afterFileEdit |
| Kimi CLI | `.kimi/config.toml` o `~/.kimi/config.toml` (con backup) | PreToolUse + PostToolUse |
| Codex | `.codex/hooks.toml` | PreToolUse + PostToolUse (apply_patch) |
| Opencode | `.opencode/plugins/reversa-chronicler.js` | tool.execute.before/after |

---

## Garantías

- Preview antes de escribir
- Sin overwrite ciego — preserva otras entradas
- Backup automático para configs globales (Kimi)
- Install idempotente
- Uninstall limpio

---

## Integración CI

Combina con [`npx reversa drift-check`](drift-check.es.md):

```yaml
- name: Reversa drift gate
  run: npx reversa drift-check --severity high
```
