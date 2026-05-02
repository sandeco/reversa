# CLI

O Reversa tem um CLI simples para gerenciar a instalação e o ciclo de vida dos agentes no seu projeto. Todos os comandos rodam com `npx reversa` na raiz do projeto.

---

## Comandos disponíveis

### `install`

```bash
npx reversa install
```

Instala o Reversa no projeto legado atual. Detecta as engines presentes, pergunta suas preferências e cria toda a estrutura necessária.

Use uma vez, na raiz do projeto que você quer analisar.

**Modo não-interativo (CI/headless):**

```bash
npx reversa install --yes \
  --project meu-app \
  --engines opencode,claude-code \
  --user Desenvolvedor
```

Flags disponíveis: `--project`, `--engines`, `--user`, `--chat-language`, `--doc-language`, `--output`, `--git-strategy`, `--answer-mode`, `--agents`, `--reinstall=yes`.

---

### `status`

```bash
npx reversa status
```

Mostra o estado atual da análise: qual fase está em andamento, quais agentes já rodaram, o que falta completar.

Útil para ter uma visão geral rápida antes de retomar uma sessão.

---

### `update`

```bash
npx reversa update
```

Atualiza os agentes para a versão mais recente do Reversa.

O comando é inteligente: ele verifica o manifesto SHA-256 de cada arquivo e nunca sobrescreve arquivos que você personalizou. Se você fez ajustes em algum agente, eles ficam intactos.

---

### `add-agent`

```bash
npx reversa add-agent
```

Adiciona um agente específico ao projeto. Útil se você não instalou todos os agentes na instalação inicial e agora quer incluir, por exemplo, o Data Master ou o Design System.

---

### `add-engine`

```bash
npx reversa add-engine
```

Adiciona suporte a uma engine de IA que não estava presente quando você instalou. Por exemplo: instalou só para Claude Code e agora quer adicionar Codex também.

---

### `uninstall`

```bash
npx reversa uninstall
```

Remove o Reversa do projeto: apaga os arquivos criados pela instalação (`.reversa/`, `.agents/skills/reversa-*/`, os arquivos de entrada das engines).

!!! info "Seus arquivos continuam intactos"
    O `uninstall` remove **apenas** o que o Reversa criou. Nenhum arquivo original do projeto é tocado. As especificações geradas em `_reversa_sdd/` também são preservadas por padrão.

---

### `mcp`

```bash
npx reversa mcp
```

Inicia o servidor MCP do Reversa via stdio. Oferece 3 ferramentas, 2 recursos e 1 prompt para integração com agentes de IA:

- **Ferramentas:** `reversa_status(path)`, `reversa_analyze(path, level?)`, `reversa_confidence(path)`
- **Recursos:** `reversa://state`, `reversa://inventory`
- **Prompt:** `reversa-new-analysis`

Configure em qualquer cliente MCP:

```json
{
  "mcpServers": {
    "reversa": {
      "command": "npx",
      "args": ["reversa", "mcp"]
    }
  }
}
```

Use para consultar estado e relatórios sem sair do chat do agente. O pipeline em si roda quando o agente digita `reversa` ou `/reversa`.
