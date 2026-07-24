# CLI

O Reversa tem um CLI simples para gerenciar a instalação e o ciclo de vida dos agentes no seu projeto. Todos os comandos rodam com `npx reversa` na raiz do projeto.

---

## Comportamento inicial

Ao iniciar e antes de mostrar a logo ASCII do Reversa, o CLI deve limpar a tela do terminal. A logo deve aparecer no alto do terminal, sem conteúdo anterior acima dela.

A assinatura `by sandeco` deve aparecer em branco na última linha da arte, depois de uma margem à direita do final do `Reversa` grande. Ela não deve ficar flutuando no meio da altura da logo.

Formato esperado:

```text
  ______
  | ___ \
  | |_/ /_____   _____ _ __ ___  __ _
  |    // _ \ \ / / _ \ '__/ __|/ _` |
  | |\ \  __/\ V /  __/ |  \__ \ (_| |
  \_| \_\___| \_/ \___|_|  |___/\__,_|  by sandeco

  AI-Powered Reverse Engineering Framework
```

---

## Comandos disponíveis

### `install`

```bash
npx reversa install
```

Instala o Reversa no projeto legado atual. Detecta as engines presentes, pergunta suas preferências e cria toda a estrutura necessária.

Use uma vez, na raiz do projeto que você quer analisar.

#### Layout do menu de instalação

O instalador deve tratar o menu como interface principal, não como despejo de texto. As perguntas devem ser numeradas, ter uma linha em branco antes da pergunta e, quando houver opções, uma linha em branco entre a pergunta e a lista.

Após o usuário confirmar uma pergunta de múltipla escolha, o CLI não deve imprimir todos os itens selecionados em uma única linha contínua. Isso é proibido porque gera um parágrafo longo e ilegível. Use uma destas alternativas:

- Não renderizar a seleção completa e avançar para a próxima pergunta.
- Renderizar um resumo curto, uma linha por time.

O menu de agentes lista times, não agentes individuais. O usuário escolhe na granularidade de time; o instalador expande cada time selecionado nos seus agentes:

1. `Reversa Agents Core` (renderizado em cinza como separator, sempre instalado)
2. `Migration Agents`
3. `Code Forward Agents`
4. `Pricing and Size Agents`
5. `Translators N8N->Specs->Python` (desmarcado por padrão)

O `Reversa Agents Core` é renderizado como um separator cinza não selecionável que visualmente mostra `(*)` como se fosse um item marcado e desabilitado: o usuário enxerga, sabe que está incluído, e o cursor pula por cima. Ele contém todos os agentes de descoberta (Reversa, Scout, Soul Extractor, Archaeologist, Detective, Architect, Writer, Reviewer, Visor, Data Master, Design System, Agents Help, Reconstructor), então o antigo grupo "Discovery Add-ons" deixou de existir como conceito separado. Mesmo o menu escondendo o detalhe por agente, o resumo final da instalação continua quebrando a contagem por time (Discovery, Migration, Code Forward, New Project, Documentation, Translators e Pricing).

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

## Comandos de chat do orquestrador (não são CLI)

Depois de ativar `/reversa` no chat da engine, estes atalhos atualizam a documentação sem passar pelo `npx reversa`:

| Comando | Ação |
|---------|------|
| `indice` | Gera/atualiza `_reversa_sdd/README.md` |
| `atualizar` | Atualiza specs a partir dos commits desde o último marco |
| `atualizar [unidade]` | Mesmo fluxo, escopo em uma unidade |
| `atualizar --baseline` | Grava o HEAD como marco inicial em `.reversa/doc-sync.json` |

O marco doc↔código fica em `.reversa/doc-sync.json` e no histórico append-only da tabela **Sincronização doc ↔ código** do README índice — não em cada arquivo de spec.
