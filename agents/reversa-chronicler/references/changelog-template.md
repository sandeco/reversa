# Template de entrada do changelog

Use este formato ao adicionar entradas em `<output_folder>/changelog/YYYY-MM-DD.md`.

Cada entrada começa com `## HH:MM` (hora em UTC). Sempre **append** — nunca sobrescreva entradas anteriores do mesmo dia.

---

## Estrutura

```markdown
## HH:MM — [descrição curta da alteração]

**O quê:** [resumo técnico baseado no diff — 1-3 linhas]

**Por quê:** [resposta do usuário à pergunta 1]

**Impacto:** [resposta da pergunta 2 — quebras / efeitos colaterais. Use "Nenhum" se confirmado]

**Arquivos:**
- `caminho/arquivo1.ext` — [verbo: adicionado | modificado | deletado]
- `caminho/arquivo2.ext` — [verbo]

**Specs afetadas:**
- `sdd/componente1.md` — atualizada
- `sdd/componente2.md` — confiança reclassificada (🟢 → 🟡)

**Contexto:** [resposta da pergunta 3, ou omitir esta linha se o usuário pulou]

**Engine:** [claude-code | codex | cursor | kimi-cli | opencode | manual]
```

---

## Exemplo preenchido

```markdown
## 14:32 — Adiciona rate limiting no endpoint de login

**O quê:** Adicionado middleware de rate limit (5 req/min por IP) na rota POST /auth/login. Bloqueio retorna 429 com header Retry-After.

**Por quê:** Picos de tentativas de brute force detectados em produção esta semana.

**Impacto:** Quebra para clientes que faziam mais de 5 logins/min do mesmo IP (caso raro — uso humano fica abaixo). Frontend precisa tratar 429.

**Arquivos:**
- `lib/auth/login.js` — modificado
- `lib/middleware/rate-limit.js` — adicionado
- `lib/routes.js` — modificado

**Specs afetadas:**
- `sdd/authentication.md` — atualizada (nova seção "Rate limiting")
- `sdd/api-contract.md` — confiança da resposta de erro reclassificada (🟡 → 🟢)

**Contexto:** Implementação usa `express-rate-limit`. Configuração centralizada em `config/rate-limits.js` para futuras rotas.

**Engine:** claude-code
```

---

## Cabeçalho do arquivo do dia

Quando o arquivo do dia for criado pela primeira vez, comece com:

```markdown
# Changelog — YYYY-MM-DD

Entradas em ordem cronológica (mais antigas no topo).
```

Depois, append cada entrada nova com `## HH:MM`.
