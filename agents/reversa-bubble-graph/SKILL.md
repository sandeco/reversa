---
name: reversa-bubble-graph
description: Gera um mapa visual da arquitetura de um sistema (Bubble Graph em Mermaid) focado em Coesão, Acoplamento e Encapsulamento, complementado por um Diagnóstico de Saúde do Software.
---

# Skill: Reversa Bubble Graph & Diagnóstico de Saúde

## Propósito
Atuar como uma extensão analítica de alto nível (compatível com o framework **Reversa**) para mapear a saúde arquitetural de um software. Por meio de análise estática e inspeção de dependências, o agente deve gerar um grafo visual (Bubble Graph) utilizando Mermaid.js e apresentar um diagnóstico técnico focado no acoplamento, modularidade e encapsulamento dos módulos do projeto, de forma retroativa (comparando versões) e progressiva (sugerindo próximos passos).

## Entradas (Inputs)
- **Árvore de Diretórios e Arquivos (Tree)** do projeto alvo.
- **Trechos Críticos de Código** ou definições de dependência (`import`, `require`, `include`).
- **Contexto Opcional:** Versão anterior da arquitetura (para análise retroativa/evolutiva).

## Pipeline de Análise (Workflow)
1. **Mapeamento de Domínios:** Identificar agrupamentos lógicos de responsabilidade (Core, UI, Dados, Integração, Infraestrutura).
2. **Medição Heurística de Saúde:**
   - **Coesão:** O módulo, classe ou arquivo possui responsabilidade única?
   - **Acoplamento:** Qual o número de conexões (inbound/outbound) do módulo? Existem dependências circulares?
   - **Encapsulamento:** As regras de negócio estão vazando para a UI ou para o Banco de Dados?
3. **Modelagem do Bubble Graph (Mermaid):** Construir o diagrama focando nas interfaces dos componentes (ocultando detalhes granulares para manter clareza).
4. **Relatório de Diagnóstico:** Redigir a "Análise Dinâmica", apontando os "God Objects" (classes gigantes centralizadoras de dependências) e avaliando a evolução arquitetural.

## Estrutura de Saída (Output)
A skill deve exportar obrigatoriamente um arquivo (ex: `0X_bubble_graph.md`) no diretório `_reversa_sdd/`, contendo a estrutura abaixo:

```markdown
# 🫧 Bubble Graph & Diagnóstico de Saúde

Este documento apresenta o panorama arquitetural atual do sistema e a saúde de suas dependências.

## Mapa Arquitetural

\`\`\`mermaid
graph TD
    %% Hub e Nós Centrais
    AppCore[Core Application<br>Regras Normativas]:::core
    
    %% Camadas Lógicas
    subgraph UI [Camada de Apresentação]
        Frontend[Views & Componentes]:::ui
    end
    
    subgraph Data [Persistência]
        DB[(Database)]:::data
        Repos[Repositories]:::data
    end

    %% Relacionamentos (Carga de Acoplamento)
    UI --> AppCore
    AppCore --> Repos
    Repos --> DB

    %% Paleta de Cores baseada em Domínio/Criticidade
    classDef core fill:#b87333,stroke:#333,stroke-width:2px,color:#fff;
    classDef ui fill:#1c2128,stroke:#e3b341,stroke-width:2px,color:#e6edf3;
    classDef data fill:#2a3140,stroke:#da3633,stroke-width:1px,color:#fff;
\`\`\`

## 📊 Diagnóstico de Saúde do Software

### 1. Nível de Encapsulamento & Modularidade
- **Isolamento Positivo:** [Identificar módulos que estão bem delimitados, com fronteiras estritas].
- **Fissuras Arquiteturais:** [Explicitar locais onde o encapsulamento quebra, ex: DTOs do banco sendo usados diretamente na UI].

### 2. Acoplamento & Pontos de Fricção (God Objects)
- **Gargalos de Dependência:** [Apontar o nó do Bubble Graph que recebe ou envia mais setas. Avaliar se ele é um "God Object"].
- **Dependências Cíclicas:** [Descrever eventuais laços fechados de acoplamento entre módulos].

### 3. Análise Retroativa & Vetor de Evolução
- **Antes vs. Agora:** [Descrever o que melhorou ou piorou em relação à arquitetura anterior. O sistema fragmentou responsabilidades? Diminuiu a carga do nó central?]
- **Prescrição de Refatoração:** [Listar 2 a 3 metas de engenharia recomendadas para a próxima iteração, baseadas nos princípios SOLID e Clean Architecture].
```

## Regras Inegociáveis (Guardrails)
1. **Sintaxe Segura:** O código Mermaid deve ser escrito de forma robusta. É **estritamente proibido** usar caracteres especiais como parênteses `()` ou colchetes `[]` nos identificadores dos nós, devendo usá-los apenas nos rótulos de texto (labels).
2. **Natureza Analítica:** O diagnóstico NÃO PODE apenas narrar o diagrama. Ele DEVE fornecer um juízo de valor arquitetural, identificando sintomas (ex: "alta fragilidade em `Módulo X` devido a forte acoplamento").
3. **Escopo Operacional:** O agente não deve alterar o código-fonte base da aplicação ao rodar esta skill. Seu papel é observacional, analítico e de geração de relatórios de Design de Software.
