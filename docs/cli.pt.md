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
    O `uninstall` remove **apenas** o que o Reversa criou. Nenhum arquivo original do projeto é tocado. As especificações geradas em `_reversa_sdd/` também são preservadas por padrão. Hooks instalados via `add-hooks` também são removidos.

---

### `add-hooks`

```bash
npx reversa add-hooks --engine claude-code
```

Instala hooks do Chronicler na config da engine pra ele rodar automaticamente após cada edição. Mostra preview, pede confirmação, escreve.

Engines suportadas: `claude-code`, `cursor`, `kimi-cli`, `codex`, `opencode`. Veja [Hooks](hooks.pt.md) pra referência completa.

---

### `remove-hooks`

```bash
npx reversa remove-hooks --engine claude-code
npx reversa remove-hooks --all
```

Remove os hooks do Chronicler da config da engine. Outros hooks que você adicionou manualmente são preservados.

---

### `drift-check`

```bash
npx reversa drift-check
npx reversa drift-check --severity medium --format json
```

CI gate. Lê `_reversa_sdd/drift.md` e exit 1 se houver specs pendentes no severity escolhido. Engine-agnostic — não carrega código de agente. Veja [drift-check](drift-check.pt.md) pra referência completa.
