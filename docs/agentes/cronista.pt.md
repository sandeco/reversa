# Chronicler

O agente que impede que código novo vire legado.

## O que faz

O Chronicler fecha o ciclo de feedback entre as specs geradas pelo Reversa e as mudanças diárias de código. Roda em dois modos — antes da mudança (briefing read-only) e depois (atualiza specs, changelog e dashboard de drift).

## Por que existe

O Reversa gera specs a partir do código legado. Mas as specs envelhecem rapidamente conforme o código continua mudando. Sem um guardião, as specs ficam dessincronizadas em semanas e se tornam tão inúteis quanto a documentação ausente que o Reversa veio resolver.

O Chronicler é esse guardião. Trata specs como **fontes de verdade ativas**, não snapshots.

---

## Dois modos

### `before <descrição-ou-arquivos>`

Briefing read-only. Use **antes** de começar a mudança.

```
/reversa-chronicler before lib/auth/login.js
/reversa-chronicler before "vou adicionar rate limiting no login"
```

O agente:
1. Lê `_reversa_sdd/traceability/code-spec-matrix.md` para identificar specs que cobrem os arquivos afetados
2. Lê apenas essas specs (consciente de tokens — não percorre tudo)
3. Apresenta os contratos, invariantes e regras de negócio que a mudança precisa respeitar
4. Pergunta se sua mudança planejada respeita esses pontos
5. Não escreve nada — puramente informativo

### `after`

Modo padrão se houver mudanças não-commitadas ou eventos enfileirados pelos hooks. Use **depois** que terminar.

```
/reversa-chronicler after
/reversa-chronicler            # também usa after quando há queue
```

O agente:
1. Coleta arquivos modificados via `git diff HEAD` e (se hooks instalados) `.reversa/chronicler-queue.json`
2. Mapeia arquivos pra specs impactadas via `code-spec-matrix.md`
3. Faz 3 perguntas curtas: **Por quê** a mudança, **quebra de compatibilidade**, **contexto extra**
4. Atualiza cada spec impactada in-place, reclassifica confiança (🟢/🟡/🔴) seguindo as regras em `references/drift-rules.md`
5. Faz append de uma entrada em `<output_folder>/changelog/YYYY-MM-DD.md`
6. Atualiza `<output_folder>/drift.md` (o dashboard)
7. Limpa entradas processadas da queue

---

## Saídas

| Arquivo | Quando |
|---|---|
| `_reversa_sdd/changelog/YYYY-MM-DD.md` | Modo `after`, sempre |
| `_reversa_sdd/sdd/[componente].md` | Modo `after`, atualizado in-place se impactado |
| `_reversa_sdd/traceability/code-spec-matrix.md` | Modo `after`, quando arquivos adicionados/deletados |
| `_reversa_sdd/drift.md` | Modo `after`, sempre (o dashboard) |
| `.reversa/state.json` | Modo `after`, checkpoint |

Modo `before` não escreve nada.

---

## Regras de detecção de drift (resumo)

O Chronicler classifica mudanças em 5 categorias — cada uma com estratégia de atualização própria. Regras completas em `references/drift-rules.md`.

| Categoria | O que é | Ação |
|---|---|---|
| **Trivial** | Refactor, rename, otimização sem mudar contrato | Atualiza spec, mantém confiança |
| **Incremental** | Função / branch / validação nova | Adiciona seção nova na spec |
| **Estrutural** | Mudou assinatura, tipo de retorno, status code | Atualiza spec + nota de breaking change |
| **Semântico** | Código viola regra de negócio do `domain.md` | **Pausa e pergunta** — bug ou intencional? |
| **Deleção** | Código removido | Marca seção como `~~deprecated~~`, não apaga histórico |

---

## Reclassificação de confiança

Após processar uma mudança, o Chronicler pode subir ou descer a confiança de afirmações já existentes:

- 🟢 → 🟢: mudança confirma o que a spec dizia
- 🟢 → 🟡: mudança tornou a afirmação confirmada apenas parcialmente verdadeira
- 🟡 → 🟢: mudança fornece evidência direta do que era inferido
- ✕ → 🔴: mudança introduz gap (ex.: referência a env var ou feature flag não-visível)

---

## Trigger manual vs automatizado

Você pode rodar o Chronicler **manualmente** via `/reversa-chronicler` a qualquer momento — funciona em todas as engines suportadas sem setup adicional.

Para invocação **automática** quando arquivos são editados, instale hooks via [`npx reversa add-hooks`](../hooks.pt.md). Os hooks enfileiram eventos em `.reversa/chronicler-queue.json` e pré-preenchem stubs no changelog. Da próxima vez que você rodar `/reversa-chronicler after`, o agente enriquece com as 3 perguntas e atualiza as specs.

---

## Quando NÃO rodar

- Sem `_reversa_sdd/`: rode `/reversa` primeiro pra fazer bootstrap
- Sem `code-spec-matrix.md`: rode `/reversa-architect` ou `/reversa-writer` primeiro
- Sem mudanças de código (queue vazia + git diff limpo): nada a fazer

---

## Integração com o resto do time

O Chronicler **complementa** mas não substitui os outros agentes:

- **Reviewer** valida specs inicialmente e acha contradições internas — o Chronicler mantém atualizado depois
- **Archaeologist** faz análise profunda one-shot — o Chronicler faz updates pequenos, frequentes e incrementais
- **Architect** sintetiza diagramas — o Chronicler sinaliza quando uma mudança arquitetural deve disparar re-run

Se o Chronicler detecta mudança que afeta mais de 5 specs ao mesmo tempo, ou toca entry points / DI containers / schemas de banco, ele sugere escalar pro Reviewer / Architect / Data Master.
