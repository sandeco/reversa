# Reversa (Orquestrador)

**Comando:** `/reversa`
**Fase:** Orquestração

---

## 🎼 O regente de orquestra

Um regente não toca nenhum instrumento. Ele conhece a partitura inteira e diz quem entra quando, em que ordem, em que ritmo. Sem ele, cada músico tocaria sua parte sem se conectar com os outros. Com ele, tudo vira música.

---

## O que faz

O orquestrador central é o primeiro e o último a entrar em cena. Ele não escreve código, não analisa módulos, não gera specs. Ele conhece a partitura inteira e sabe quem precisa entrar quando, em que ordem e em que ritmo.

Sem ele, cada agente tocaria sua parte sem se conectar com os outros. Com ele, tudo vira música.

---

## Responsabilidades

- Verifica se existe uma análise em andamento (lê `.reversa/state.json`)
- Na primeira sessão: cria o plano de exploração personalizado e apresenta ao usuário
- Em sessões subsequentes: retoma exatamente de onde parou
- Executa os agentes do plano **sequencialmente**, um por vez
- Salva checkpoints após cada agente concluir
- Apresenta resumo breve do que foi gerado a cada etapa
- Avisa quando o contexto está se esgotando e salva o estado antes de parar
- Verifica se há uma nova versão disponível e avisa discretamente

---

## Comportamento especial após o Scout

Depois que o Scout termina, o Reversa lê o `surface.json` gerado e personaliza a Fase 2 do plano. Em vez de uma tarefa genérica "analisar o código", o plano vira uma tarefa por módulo identificado:

```
- [ ] Arqueólogo: análise do módulo `auth`
- [ ] Arqueólogo: análise do módulo `orders`
- [ ] Arqueólogo: análise do módulo `payments`
```

---

## Regras que ele nunca quebra

- Nunca executa múltiplos agentes ao mesmo tempo sem pedido explícito do usuário
- Nunca desvia da sequência do plano aprovado sem avisar
- Nunca apaga, modifica ou sobrescreve arquivos pré-existentes do projeto

---

## Como ativar

=== "Claude Code / Cursor / Gemini CLI"
    ```
    /reversa
    ```

=== "Codex e engines sem slash commands"
    ```
    reversa
    ```

Para retomar uma análise interrompida, basta ativar novamente. O estado salvo é lido automaticamente.

---

## Integração MCP

O Reversa também pode ser consultado via MCP (`npx reversa mcp`). O servidor MCP oferece:
- **Ferramentas:** `reversa_status`, `reversa_analyze`, `reversa_confidence`
- **Recursos:** `reversa://state`, `reversa://inventory`
- **Prompt:** `reversa-new-analysis`

Use estas ferramentas para consultar estado e relatórios sem sair do chat do agente. O pipeline em si continua sendo executado através deste skill — o MCP serve apenas para leitura de resultados.
