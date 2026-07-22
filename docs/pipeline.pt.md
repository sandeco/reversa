# Pipeline de análise

O Reversa transforma um sistema legado em especificações executáveis em 5 fases. Cada fase tem agentes específicos, e o orquestrador central coordena tudo para que aconteça na ordem certa.

---

## Visão geral

```
Fase 1          Fase 2        Fase 3              Fase 4        Fase 5
Reconhecimento  Escavação     Interpretação       Geração       Revisão
   Scout        Archaeologist    Detective            Writer       Reviewer
                               Architect
```

**Agentes independentes** que rodam em qualquer fase: **Visor**, **Data Master**, **Design System**

---

## Fase 1: Reconhecimento

**Agente:** Scout

O Scout faz o primeiro tour no projeto. Como um corretor de imóveis que visita um imóvel pela primeira vez: não abre gavetas, não lê todos os documentos, só mapeia o território.

O que ele produz:

- Inventário completo do projeto (`inventory.md`)
- Lista de dependências com versões (`dependencies.md`)
- Estrutura de dados em JSON para os próximos agentes (`.reversa/context/surface.json`)

Depois que o Scout termina, o Reversa usa o `surface.json` para personalizar a Fase 2: em vez de uma tarefa genérica "analisar o código", o plano vira uma tarefa por módulo identificado.

Também é nesse momento que o Reversa apresenta o resumo do Scout e pergunta o **nível de documentação** (`doc_level`): essencial, completo ou detalhado. A escolha define quais artefatos cada agente vai gerar nas fases seguintes — veja [Como usar](uso.md#nível-de-documentação) para a tabela completa.

---

## Fase 2: Escavação

**Agente:** Archaeologist

O Archaeologist escava o terreno módulo a módulo. Com paciência e precisão, cataloga cada artefato: funções, algoritmos, estruturas de dados, fluxos de controle. Ele não interpreta nem julga. Só descreve com precisão o que está lá.

**Importante:** o Archaeologist roda um módulo por sessão, de propósito. Projetos grandes têm muitos módulos, e tentar analisar tudo de uma vez consome contexto e reduz a qualidade da análise.

O que ele produz:

- Análise técnica consolidada (`code-analysis.md`)
- Dicionário de dados (`data-dictionary.md`)
- Fluxogramas em Mermaid por módulo (`flowcharts/[modulo].md`)
- Dados estruturados por módulo (`.reversa/context/modules.json`)

---

## Fase 3: Interpretação

**Agentes:** Detective + Architect

Aqui a análise deixa de ser descritiva e vira interpretativa. Dois agentes trabalham em paralelo nessa fase.

**O Detective** é o Sherlock Holmes do time. Olha para o que o Archaeologist catalogou e pergunta: *"Mas por que isso está aqui? Quem tomou essa decisão? O que o histórico git revela?"*. Extrai regras de negócio implícitas, ADRs retroativos, máquinas de estado e matrizes de permissão.

**O Architect** é o cartógrafo. Sintetiza tudo em documentação arquitetural formal: diagramas C4 nos três níveis (Contexto, Containers, Componentes), ERD completo, mapa de integrações, dívidas técnicas.

O que eles produzem:

- Domínio e regras de negócio (`domain.md`)
- Máquinas de estado em Mermaid (`state-machines.md`)
- Matriz de permissões (`permissions.md`)
- ADRs retroativos (`adrs/`)
- Diagramas C4 (`c4-context.md`, `c4-containers.md`, `c4-components.md`)
- ERD completo (`erd-complete.md`)
- Visão arquitetural geral (`architecture.md`)

---

## Fase 4: Geração

**Agente:** Writer

O Writer é o tabelião do time. Transforma tudo que foi descoberto nas fases anteriores em contratos formais: uma pasta por unit (módulo, endpoint, caso de uso, feature etc., conforme a organização escolhida no início do fluxo) com os 3 arquivos canônicos SDD dentro, mais globais transversais como specs OpenAPI e user stories.

Cada afirmação é marcada com a [escala de confiança](escala-confianca.md): 🟢 CONFIRMADO, 🟡 INFERIDO ou 🔴 LACUNA.

O Writer não gera tudo de uma vez. Ele monta um plano cobrindo todas as units, apresenta para você aprovar, e depois gera um arquivo por vez, esperando confirmação antes de continuar. Isso permite revisão incremental e evita desperdício de contexto.

O que ele produz:

- Uma pasta por unit com `<unit>/requirements.md`, `<unit>/design.md`, `<unit>/tasks.md` (mais opcionais quando o nível de documentação pede)
- Specs de API (`openapi/[api].yaml`)
- User stories (`user-stories/[fluxo].md`)
- Matriz de rastreabilidade legado-unit (`traceability/code-spec-matrix.md`)

---

## Fase 5: Revisão

**Agente:** Reviewer

O Reviewer tenta furar as specs. Encontra contradições internas, conflitos entre specs diferentes, afirmações marcadas como 🟢 que são na verdade inferências, comportamentos óbvios não especificados.

Ele também coleta as lacunas 🔴 que só você pode resolver e apresenta como perguntas para validação humana. Depois que você responde, ele atualiza as specs e gera o relatório final de confiança.

Bônus: se o plugin do Codex estiver ativo na sessão, o Reviewer pode solicitar uma revisão cruzada independente antes de fazer a sua própria análise.

O que ele produz:

- Perguntas para validação (`questions.md`)
- Relatório final de confiança (`confidence-report.md`)
- Lacunas sem resposta (`gaps.md`)
- Specs atualizadas in-place com as reclassificações

---

## Agentes independentes

Esses agentes não pertencem a uma fase específica e podem ser acionados a qualquer momento:

| Agente | Quando usar |
|--------|-------------|
| **Visor** | Quando você tiver screenshots do sistema disponíveis |
| **Data Master** | Quando houver DDL, migrations ou modelos ORM para analisar |
| **Design System** | Quando houver arquivos CSS, temas ou screenshots de interface |
| **Soul Extractor** | Logo após o Scout, para uma Spec executiva única (`soul.md`) com propósito, entidades centrais e decisões fundadoras |

---

## Rodar o pipeline sem paradas

O `/reversa-autonomous` executa essas mesmas 5 fases, com os mesmos agentes, os mesmos checkpoints e a mesma escala de confiança. A diferença está em *quando* ele pergunta.

O fluxo normal distribui as perguntas pelo caminho: dados de instalação no começo, nível de documentação depois do Scout, organização das specs antes do Writer. O modo autônomo concentra todas elas em uma **entrevista única no início**, pulando o que já estiver respondido em `.reversa/state.json` ou `.reversa/config.toml`. Depois dessa entrevista, ele roda até o fim, parando apenas diante de uma lista fechada de situações que realmente exigem um humano.

Foi desenhado para sessões sem supervisão, com aprovação automática de ferramentas (modo YOLO do Claude Code ou equivalente), então as travas são mais rígidas que o usual: a escrita fica restrita a `.reversa/` e à pasta de saída, e nenhum comando destrutivo ou de efeito externo (apagar, `git push`, publicar, instalar dependências) é executado por conta própria. O que for ambíguo fora das pastas do Reversa fica intocado e é reportado no resumo final.

Os checkpoints são salvos exatamente como no fluxo normal, então uma execução autônoma interrompida pode ser retomada tanto com `/reversa` quanto com `/reversa-autonomous`.
