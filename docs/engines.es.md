# Motores compatibles

Reversa funciona con los principales motores de IA del mercado. El instalador detecta automáticamente cuáles están presentes en el entorno.

---

## Compatibilidad

| Motor | Archivo creado | Skills path | Cómo activar |
|-------|---------------|-------------|--------------|
| **Claude Code** ⭐ | `CLAUDE.md` | `.claude/skills/reversa-*/` y `.agents/skills/reversa-*/` | `/reversa` |
| **Codex** ⭐ | `AGENTS.md` | `.agents/skills/reversa-*/` | `reversa` |
| **Cursor** ⭐ | `.cursorrules` | `.agents/skills/reversa-*/` | `/reversa` |
| **Gemini CLI** | `GEMINI.md` | `.agents/skills/reversa-*/` | `/reversa` |
| **Windsurf** | `.windsurfrules` | `.agents/skills/reversa-*/` | `/reversa` |
| **Antigravity** | `AGENTS.md` | `.agents/skills/reversa-*/` | `/reversa` |
| **Kiro** | `.kiro/steering/reversa.md` | `.agents/skills/reversa-*/` | `/reversa` |
| **Opencode** | `AGENTS.md` | `.agents/skills/reversa-*/` | `reversa` |
| **Kimi CLI** | `AGENTS.md` | `.agents/skills/reversa-*/` | `reversa` |

---

## Claude Code

El motor más probado y con mejor soporte. Usa slash commands nativos, lo que hace la activación intuitiva.

---

## Codex y Opencode

Totalmente compatibles. Como no usan slash commands, la activación es por el nombre del agente directamente: `reversa`, `reversa-scout`, etc.

---

## Múltiples motores en el mismo proyecto

Puedes tener todos los motores instalados al mismo tiempo. Los agentes en `.agents/skills/` son compartidos por todos. Si trabajas en equipo y cada persona usa un motor diferente, funciona con normalidad.
