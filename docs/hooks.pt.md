# Hooks (Chronicler automático)

Instala configuração de hooks na sua engine de IA para o Chronicler rodar automaticamente toda vez que você editar um arquivo.

`/reversa-chronicler after` manual sempre funciona como fallback. Hooks só removem a fricção.

---

## Quick start

```bash
npx reversa add-hooks --engine claude-code   # ou cursor, kimi-cli, codex, opencode
```

Vai aparecer um preview do que será escrito. Confirme para instalar.

Para desinstalar:

```bash
npx reversa remove-hooks --engine claude-code
npx reversa remove-hooks --all                # todas as engines de uma vez
```

---

## O que o hook faz

Quando a engine dispara um tool que edita arquivo (`Edit`, `Write`, `MultiEdit`, `apply_patch`, `afterFileEdit`, etc.), o hook invoca o **Reversa hook runner** — um script Node pequeno instalado em `.reversa/_hooks/runner.js`.

O runner:

1. Faz append de uma entrada em `.reversa/chronicler-queue.json` (com lock para edições concorrentes)
2. Escreve um stub em `_reversa_sdd/changelog/YYYY-MM-DD.md` pra mudança ser mencionada mesmo se você nunca rodar o Chronicler
3. Marca specs afetadas como `🔴 pending` em `_reversa_sdd/drift.md`
4. Imprime warning no terminal se uma spec de alta confiança foi tocada

O runner **nunca bloqueia** a engine e **nunca modifica seu código**. Erros são logados silenciosamente em `.reversa/chronicler-errors.log`.

Depois, quando você roda `/reversa-chronicler after`, o agente lê a queue, faz as 3 perguntas, enriquece o changelog, atualiza as specs e limpa a queue.

---

## Engines suportadas

| Engine | Arquivo | Eventos |
|---|---|---|
| Claude Code | `.claude/settings.json` | PreToolUse + PostToolUse (matcher `Edit\|Write\|MultiEdit`) |
| Cursor | `.cursor/hooks.json` | afterFileEdit (matcher `**/*`) |
| Kimi CLI | `.kimi/config.toml` (projeto) ou `~/.kimi/config.toml` (global, com backup) | PreToolUse + PostToolUse (matcher `Edit\|Write`) |
| Codex | `.codex/hooks.toml` | PreToolUse + PostToolUse (matcher `apply_patch`) |
| Opencode | `.opencode/plugins/reversa-chronicler.js` | tool.execute.before/after |

Para engines não listadas (Gemini CLI, Aider, Roo, Cline, Copilot, Windsurf, Antigravity, Kiro, Amazon Q): use o fluxo manual `/reversa-chronicler`.

---

## Garantias de segurança

- **Preview antes de escrever.** `add-hooks` mostra o JSON/TOML exato que será escrito e pede confirmação.
- **Sem overwrite cego.** Ao mesclar com config existente (ex.: `.claude/settings.json`), o Reversa preserva todas as chaves e hook entries existentes. Só toca em entradas identificadas pelo marcador `reversa/_hooks/runner.js` no command.
- **Backup pra config global.** Ao editar `~/.kimi/config.toml`, um backup timestamped é salvo como `~/.kimi/config.toml.bak.reversa-<ISO>`.
- **Install idempotente.** Rodar `add-hooks` duas vezes pra mesma engine substitui os hooks Reversa anteriores; não duplica.
- **Uninstall limpo.** `remove-hooks` tira só entradas Reversa. Outros hooks que você adicionou manualmente ficam preservados. `npx reversa uninstall` faz o mesmo automaticamente.

---

## Integração com CI

Hooks disparam só dentro da engine. Para garantir resolução de drift em PRs, combine hooks com [`npx reversa drift-check`](drift-check.pt.md) no CI.

```yaml
# .github/workflows/ci.yml
- name: Reversa drift gate
  run: npx reversa drift-check --severity high
```

Assim: hooks mantêm queue e dashboard atualizados enquanto o dev codifica local, e CI bloqueia merge se ficou algo não resolvido.

---

## Diagrama da arquitetura

```
[Edit/Write na engine]
        │
        ▼
[Hook da engine → spawna runner]
        │
        ▼
[.reversa/_hooks/runner.js]
        ├─→ append em .reversa/chronicler-queue.json
        ├─→ stub em _reversa_sdd/changelog/YYYY-MM-DD.md
        ├─→ marca _reversa_sdd/drift.md como pending
        └─→ warning no stderr (specs de alta confiança)
        │
        ▼ (depois, quando dev roda o agente)
[/reversa-chronicler after]
        ├─→ faz 3 perguntas (por quê / breaking / contexto)
        ├─→ enriquece changelog
        ├─→ atualiza specs in-place + reclassifica confiança
        ├─→ marca drift.md como resolved
        └─→ limpa queue
        │
        ▼ (em CI)
[npx reversa drift-check]
        └─→ exit 1 se drift.md ainda tem pending → bloqueia merge
```
