# Como usar

## Ativar o Reversa

Após instalar, abra o projeto no seu agente de IA e ative o Reversa:

=== "Claude Code / Cursor / Gemini CLI"

    ```
    /reversa
    ```

=== "Codex e engines sem slash commands"

    ```
    reversa
    ```

É só isso. O Reversa assume o controle e coordena toda a análise a partir daí.

---

## Escolhendo o comando de entrada

O `/reversa` é o ponto de entrada para analisar um sistema existente, mas não é o único fluxo:

| Objetivo | Comando |
|----------|---------|
| Analisar um legado existente e produzir specs | `/reversa` |
| A mesma análise, de ponta a ponta, sem paradas intermediárias | `/reversa-autonomous` |
| Começar um projeto novo a partir de uma ideia em uma linha | `/reversa-new` (com `expresso` vai até o código) |
| Evoluir o sistema uma feature por vez, da spec ao código | `/reversa-forward` |
| Convergir uma feature entregue de volta na extração | `/reversa-sync` |
| Reconstruir o legado em uma stack moderna | `/reversa-migrate` |
| Renderizar o conhecimento extraído como mini-site HTML | `/reversa-docs` |
| Registrar e corrigir defeitos com rastreabilidade causal | `/reversa-debugger`, `/reversa-debugger-fix` |
| Estimar esforço, tamanho e preço a partir das specs | `/reversa-pricing-profile`, `/reversa-pricing-size`, `/reversa-pricing-estimate` |

---

## Modo sem supervisão

Se você quer que a análise rode sem você na frente do terminal:

```
/reversa-autonomous
```

Ele executa exatamente os mesmos agentes e fases do `/reversa`, mas concentra todas as perguntas em uma **entrevista única no início** (dados de instalação, nível de documentação, organização das specs) e pula o que já estiver respondido no `.reversa/state.json`. Depois da entrevista, vai até o fim, parando apenas diante da lista fechada de situações que realmente exigem um humano.

A mesma ideia existe do lado greenfield: `/reversa-new expresso "<sua ideia>"` vai da ideia ao código implementado sem parar, emendando no ciclo forward assim que as specs ficam prontas.

!!! warning "Feito para sessões com aprovação automática"
    Esses modos são para ambientes onde as ferramentas são aprovadas automaticamente (modo YOLO do Claude Code ou equivalente). Como ninguém está aprovando cada ação, as travas são mais rígidas: a escrita fica restrita a `.reversa/` e às pastas de saída, e nenhum comando destrutivo ou de efeito externo (apagar, `git push`, publicar, instalar dependências) é executado por conta própria. Ainda assim, faça backup do projeto antes de começar, como recomendado na [página inicial](index.md).

---

## O que acontece quando você ativa

O Reversa verifica se existe uma análise em andamento:

**Primeira vez:** ele cria um plano de exploração personalizado para o seu projeto, apresenta ao usuário para aprovação e começa a análise pela fase 1.

**Sessão retomada:** ele lê o checkpoint salvo em `.reversa/state.json` e continua exatamente de onde parou. Não importa se você fechou o editor, reiniciou a máquina ou deixou dormindo por três dias.

---

## Fluxo típico de uma análise completa

```
Você digita /reversa
        ↓
Reversa cria o plano de exploração
        ↓
Você revisa e aprova o plano
        ↓
Scout mapeia a superfície do projeto
        ↓
Reversa apresenta o resumo do Scout e você escolhe o nível de documentação
        ↓
Archaeologist analisa módulo por módulo
        ↓
Detective e Architect interpretam o que foi encontrado
        ↓
Writer gera as especificações (uma por vez, com sua aprovação)
        ↓
Reviewer revisa tudo e levanta perguntas para validação
        ↓
Especificações prontas em _reversa_sdd/
```

O processo é incremental e conversacional. Você não precisa estar presente o tempo todo: o Reversa avisa quando precisa de você.

---

## Quanto tempo leva?

Depende do tamanho do projeto, mas uma regra geral:

| Tamanho do projeto | Estimativa |
|--------------------|------------|
| Pequeno (< 10 módulos) | 2 a 4 sessões |
| Médio (10 a 30 módulos) | 5 a 10 sessões |
| Grande (30+ módulos) | 10+ sessões |

O Archaeologist analisa um módulo por sessão para economizar contexto. Para projetos grandes, você vai retomar várias vezes, mas cada retomada é automática e sem perda de progresso.

---

## Dica: estouro de contexto

Se a sessão ficar muito longa e o contexto começar a acabar, o Reversa salva o checkpoint automaticamente e avisa:

> "Vou pausar aqui. Tudo está salvo. Digite `/reversa` em uma nova sessão para continuar."

Sem drama. Sem perda. É só continuar depois.

---

## Nível de documentação

Depois que o Scout termina, o Reversa apresenta um resumo do que encontrou (quantos módulos, integrações, se há banco de dados) e pergunta qual volume de documentação você quer para o projeto:

| Nível | Quando usar | O que gera |
|-------|-------------|------------|
| **Essencial** | Projetos simples, scripts, protótipos | Artefatos principais: análise de código, domínio, arquitetura, specs SDD |
| **Completo** | Projetos médios, equipes pequenas (padrão) | Tudo do essencial + diagramas C4, ERD, ADRs, OpenAPI, user stories e matrizes de rastreabilidade |
| **Detalhado** | Sistemas enterprise, múltiplas equipes | Tudo do completo + flowcharts por função, ADRs expandidos, diagrama de deployment e revisão cruzada obrigatória |

A escolha fica salva em `.reversa/state.json` e todos os agentes seguintes a respeitam automaticamente. Se precisar ajustar depois de iniciada a análise, basta editar o campo `doc_level` no arquivo.

---

## Ativar um agente específico manualmente

Se quiser rodar um agente avulso, sem passar pelo orquestrador:

```
/reversa-scout
/reversa-detective
/reversa-data-master
```

Útil quando você já tem uma análise em andamento e quer executar um agente específico por algum motivo pontual.
