# Passo — Marco doc ↔ código (doc-sync) e atualização incremental

O commit **não** é carimbado em cada arquivo de documentação. Há um **marco central** (SHA do HEAD) em `.reversa/doc-sync.json` e um histórico append-only no índice `_reversa_sdd/README.md`.

## Artefatos

| Arquivo | Papel |
|---------|--------|
| `.reversa/doc-sync.json` | Último SHA sincronizado (máquina) |
| `_reversa_sdd/README.md` → `## Sincronização doc ↔ código` | Histórico humano, append-only |

### Schema de `.reversa/doc-sync.json`

```json
{
  "commit": "<sha completo de git rev-parse HEAD>",
  "syncedAt": "<ISO-8601>",
  "branch": "<nome da branch, se disponível>",
  "action": "baseline|pipeline|atualizar|indice"
}
```

- `commit` é obrigatório e deve ser o SHA de 40 caracteres.
- `action` descreve o que acabou de gravar o marco.
- **Proibido** usar slug/nome do projeto no lugar do SHA.

### Formato da tabela no README

```markdown
## Sincronização doc ↔ código

> Histórico incremental de marcos doc↔código. Append a cada pipeline.
> Não editar manualmente; use `atualizar`, `atualizar --baseline` ou conclua um pipeline `/reversa`.

| Data | Branch | Commit | Ação | Notas |
|------|--------|--------|------|-------|
| 2026-07-24 16:30 | main | `abcdef0123…` | baseline | Marco inicial |
```

- **Preservar** todas as linhas existentes ao regenerar o `indice`.
- Na coluna `Commit`, preferir SHA completo entre backticks; short SHA só se `git rev-parse` ainda resolver.
- A **última linha** da tabela é o fallback se `doc-sync.json` sumir.

---

## Gravar marco (após pipeline ou `--baseline`)

1. Confirme que o diretório atual é um repositório git (`git rev-parse --is-inside-work-tree`).
2. Obtenha o SHA: `git rev-parse HEAD`.
3. Obtenha a branch (opcional): `git rev-parse --abbrev-ref HEAD`.
4. Escreva/atualize `.reversa/doc-sync.json` com o schema acima.
5. Garanta que `_reversa_sdd/README.md` existe (se não, rode o procedimento `indice` primeiro).
6. **Append** uma linha na tabela `## Sincronização doc ↔ código` (nunca reescreva o histórico).
7. Informe o usuário: marco gravado (`commit` curto + ação).

### Fallback sem `doc-sync.json`

1. Abra `_reversa_sdd/README.md`.
2. Localize a última linha de dados da tabela de sincronização.
3. Extraia o hash (com ou sem backticks).
4. Resolva com `git rev-parse <hash>`.
5. Se falhar: diga que não há marco e peça `atualizar --baseline`.

---

## `atualizar --baseline`

Só grava o marco. **Não** reescreve specs.

1. Execute o procedimento **Gravar marco** com `action: "baseline"`.
2. Notas da linha: `Marco inicial`.
3. Responda: marco definido; próximos `atualizar` usarão esse SHA.

---

## `atualizar` (incremental)

1. Leia o marco: `.reversa/doc-sync.json` → `commit`, ou fallback do README.
2. Liste mudanças desde o marco:
   ```bash
   git log <marco>..HEAD --name-only --pretty=format: --
   git diff --name-only <marco>..HEAD
   ```
3. Se não houver arquivos alterados: informe e **não** avance agentes.
4. Mapeie paths alterados → unidades em `_reversa_sdd/` (pastas de módulo / organização em `.reversa/config.toml` `[specs]`). Ignore ruído (`node_modules`, `dist`, `.git`, lockfiles sem mudança de código).
5. Apresente ao usuário as unidades afetadas e peça confirmação antes de re-rodar agentes.
6. Após confirmação, reative os agentes necessários **só** nas unidades afetadas (tipicamente Archaeologist/Detective/Writer/Reviewer conforme o que existir no plano).
7. Rode `indice` (preservando a tabela de sync).
8. Grave o marco com `action: "atualizar"` e notas resumindo as unidades tocadas.

---

## `atualizar [unidade]`

Igual ao incremental, mas o escopo é a unidade nomeada (mesmo que o `git log` sugira mais arquivos). Ainda assim, cite os commits/arquivos relevantes como evidência.

---

## `indice`

1. Se `_reversa_sdd/` não existir: avise e pare.
2. Se `README.md` já existir: leia e **preserve** a seção `## Sincronização doc ↔ código` inteira.
3. Regenere as demais seções a partir do template `references/README.indice.template.md` e do inventário real em `_reversa_sdd/`.
4. Não acrescente rodapé `*Gerado em …*`.
5. Se o pipeline acabou de alterar docs e ainda não houve append nesta sessão, faça o append do marco depois do `indice`.

---

## Anti-padrões

| ❌ Proibido | ✅ Correto |
|-------------|-----------|
| Frontmatter/`sourceCommit` em cada `design.md` | Marco em `.reversa/doc-sync.json` |
| Arquivo `doc-sync.md` | JSON + tabela no README |
| Rodapé `*Gerado em …*` | Tabela de sincronização |
| Usar slug do app como marco | SHA do `git rev-parse HEAD` |
| Apagar linhas antigas da tabela | Apenas append |
