# Template — _reversa_sdd/questions.md

Este arquivo é gerado pelo Revisor e preenchido pelo usuário.

---

## Como o Revisor cria este arquivo

Para cada lacuna 🔴 que só o usuário pode resolver, atribua um ID estável no formato `Q-<UNIT>-<NN>` e crie uma entrada. Use um código de unit em letras maiúsculas, numeração crescente com pelo menos dois dígitos e nunca recicle um ID removido:

```markdown
## Q-[UNIT]-[NN] 🔴 — Pergunta [N]

**Contexto:** [Onde no sistema surgiu esta dúvida — módulo, função, linha]
**Spec afetada:** [`_reversa_sdd/<unit>/{requirements|design|tasks}.md`]
**Pergunta:** [Pergunta direta, sem ambiguidade]
**Impacto:** [O que muda na spec dependendo da resposta]

**Resposta:** <!-- preencha aqui -->
```

---

## Como o usuário responde

O usuário deve:
1. Preencher o campo `**Resposta:**` de cada pergunta
2. Avisar ao Revisor quando terminar (digitar `reversa` ou "respondi as perguntas")

---

## Como o Revisor processa as respostas

Após receber aviso do usuário:
1. Leia o arquivo completo
2. Para cada pergunta com resposta preenchida:
   - Atualize a spec correspondente
   - Reclassifique o item conforme a resposta (🔴→🟢 ou 🔴→🟡)
   - Marque a pergunta como `✅ Respondida` acima do campo Resposta
3. Para perguntas sem resposta: mantenha como 🔴 no relatório final
4. Atualize `confidence-report.md` com os novos percentuais

---

## Exemplo de arquivo gerado

```markdown
# Perguntas para Validação — [Nome do Projeto]

> Gerado pelo Revisor em [data]
> Responda cada pergunta e me avise quando terminar.

---

## Q-AUTH-01 🔴 — Pergunta 1

**Contexto:** Módulo `auth` — função `validateSession()` em `src/auth/session.ts:47`
**Spec afetada:** [`_reversa_sdd/auth/requirements.md`]
**Pergunta:** A sessão expira por inatividade ou apenas por tempo absoluto? O código usa `lastActivity` mas não há lógica de expiração visível.
**Impacto:** Se for por inatividade, a spec precisa incluir o tempo máximo de idle e o comportamento ao renovar a sessão.

**Resposta:** <!-- preencha aqui -->

---

## Q-ORDERS-01 🔴 — Pergunta 2

**Contexto:** Módulo `orders` — constante `MAX_ITEMS_PER_ORDER = 50` em `src/orders/constants.ts:12`
**Spec afetada:** [`_reversa_sdd/orders/requirements.md`]
**Pergunta:** O limite de 50 itens por pedido é uma regra de negócio ou um limite técnico temporário? Há planos de aumentar?
**Impacto:** Se for regra de negócio, precisa constar como 🟢 nas restrições. Se for técnico, deve ser 🟡 com nota de revisão futura.

**Resposta:** <!-- preencha aqui -->
```
