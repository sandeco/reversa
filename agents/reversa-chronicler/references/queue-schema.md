# Schema do `.reversa/chronicler-queue.json`

Arquivo de comunicação entre os hooks de engine e o agente Chronicler.

- **Hooks escrevem** entradas (modo append) quando o usuário edita / salva arquivos via Claude Code, Cursor, Kimi, Codex, Opencode
- **Chronicler lê** entradas no modo `after`, processa e remove

Modo manual (sem hooks instalados): este arquivo pode não existir. Chronicler usa `git diff HEAD` como fonte alternativa.

---

## Schema

```json
{
  "version": 1,
  "queue": [
    {
      "id": "uuid-v4-string",
      "phase": "pre" | "post",
      "tool": "Edit" | "Write" | "MultiEdit" | "afterFileEdit" | "...",
      "files": ["lib/auth/login.js", "lib/middleware/rate-limit.js"],
      "timestamp": "2026-04-29T20:30:00.000Z",
      "engine": "claude-code" | "cursor" | "kimi-cli" | "codex" | "opencode",
      "diff_summary": "added rate limiting middleware to login route",
      "affected_specs": ["sdd/authentication.md"]
    }
  ]
}
```

---

## Campos

### `version` (top-level)
Schema version. Atualmente `1`. Chronicler deve ignorar entradas com versão maior que a que conhece e logar warning.

### `queue` (top-level)
Array ordenado cronologicamente (mais antiga primeiro). Hooks fazem append no final.

### Por entrada

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | string (UUID v4) | sim | Identificador único da entrada — usado para deduplicação se hook disparar 2x |
| `phase` | `"pre"` ou `"post"` | sim | `pre` = antes da edição (intent); `post` = após salvar |
| `tool` | string | sim | Nome do tool/evento da engine que disparou (`Edit`, `Write`, `afterFileEdit`, etc.) |
| `files` | array de string | sim | Caminhos relativos ao project root dos arquivos afetados |
| `timestamp` | string ISO 8601 (UTC) | sim | Momento do evento |
| `engine` | string | sim | ID da engine — útil pra debug e métricas |
| `diff_summary` | string | não | Resumo de 1-2 linhas do diff (se a engine conseguir extrair). Pode ser vazio |
| `affected_specs` | array de string | não | Pré-cálculo das specs impactadas (se o hook conseguir consultar `code-spec-matrix.md`). Chronicler valida e completa |

---

## Concorrência

Hooks podem disparar simultaneamente (várias engines no mesmo projeto, ou edições em paralelo). Para evitar corrupção:

1. Antes de escrever: criar `.reversa/chronicler-queue.lock` (arquivo vazio) com retry/backoff
2. Ler queue atual, append nova entrada, escrever
3. Remover lock

Se o lock existir há >5s: assumir lock órfão, deletar e prosseguir.

O Chronicler segue o mesmo protocolo ao consumir / limpar entradas.

---

## Limpeza pelo Chronicler

Após processar entradas com sucesso (modo `after`):

1. Remover entradas processadas do array `queue`
2. Se `queue` ficar vazia: pode deletar o arquivo OU manter como `{ "version": 1, "queue": [] }`
3. Salvar timestamp em `.reversa/state.json.checkpoints.chronicler.last_run`

Se houver erro durante processamento de uma entrada específica: NÃO remover essa entrada. Logar em `.reversa/chronicler-errors.log` com motivo. Próxima invocação tenta de novo.

---

## Limites operacionais

- Tamanho máximo razoável: ~1000 entradas. Acima disso, hook deve printar aviso no terminal sugerindo rodar Chronicler.
- Entradas mais antigas que 30 dias podem ser auto-purgadas pelo runner (assumindo que o usuário esqueceu de processar).

---

## Exemplo realista

```json
{
  "version": 1,
  "queue": [
    {
      "id": "9f8e7d6c-5b4a-4321-9876-543210fedcba",
      "phase": "pre",
      "tool": "Edit",
      "files": ["lib/auth/login.js"],
      "timestamp": "2026-04-29T20:25:14.123Z",
      "engine": "claude-code"
    },
    {
      "id": "8e7d6c5b-4a39-4210-8765-43210fedcba9",
      "phase": "post",
      "tool": "Edit",
      "files": ["lib/auth/login.js"],
      "timestamp": "2026-04-29T20:25:18.456Z",
      "engine": "claude-code",
      "diff_summary": "added 5/min rate limit using express-rate-limit",
      "affected_specs": ["sdd/authentication.md", "sdd/api-contract.md"]
    },
    {
      "id": "7d6c5b4a-3928-4109-7654-3210fedcba98",
      "phase": "post",
      "tool": "Write",
      "files": ["lib/middleware/rate-limit.js"],
      "timestamp": "2026-04-29T20:26:02.789Z",
      "engine": "claude-code",
      "diff_summary": "new file: rate limit middleware factory",
      "affected_specs": []
    }
  ]
}
```

Neste exemplo:
- 3 entradas (1 pre, 2 post)
- Chronicler `after` processa as 2 entradas `post`, ignora `pre` (intent já concluído)
- Detecta arquivo novo `lib/middleware/rate-limit.js` sem spec → adiciona à `code-spec-matrix.md` apontando pra `sdd/authentication.md` (heurística: spec do dir pai)
