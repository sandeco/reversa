# Hooks do Reversa

## check-legacy-policy.mjs (Claude Code, opcional)

Enforcement duro da política de edição do legado (`.reversa/reversa-config.json`). Sem ele, a política vale como guardrail por instrução, que é o denominador comum entre as engines (Cursor, Codex, Gemini CLI etc.). Com ele, o Claude Code bloqueia `Write`/`Edit` fora dos caminhos permitidos ANTES de a ferramenta executar, inclusive em modos permissivos de execução.

O que o hook bloqueia:

- Qualquer escrita fora das pastas próprias do Reversa quando `allowLegacyEdits` é `false`, ou quando a config está ausente ou inválida (falha segura).
- Escrita em caminho que não casa com nenhum glob de `allowedPaths` quando `allowLegacyEdits` é `true`.
- Qualquer escrita do agente em `.reversa/reversa-config.json`: a config só muda pela mão do usuário.

As pastas próprias do Reversa continuam sempre graváveis, independentemente da política.

### Instalação (passo manual)

Adicione ao `.claude/settings.json` do projeto (crie o arquivo se não existir, ou mescle com o conteúdo atual):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node .reversa/hooks/check-legacy-policy.mjs"
          }
        ]
      }
    ]
  }
}
```

Requisito: Node.js 18+ disponível no PATH (o mesmo exigido pelo instalador do Reversa).

### Remoção

Remova o bloco acima do `.claude/settings.json`. O arquivo `.reversa/hooks/check-legacy-policy.mjs` pode ficar, ele só age quando referenciado pelo settings.
