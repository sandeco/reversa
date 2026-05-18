# Agentes

O Reversa coordena **6 Teams especializados** de agentes. Cada agente faz uma coisa só e faz bem; cada Team agrupa os agentes em torno de uma fase do trabalho.

O orquestrador central (o próprio Reversa) coordena quem entra quando, em que ordem e em que ritmo. Mas você também pode acionar qualquer agente diretamente quando precisar.

---

## Os 6 Teams

| Team | Função | No instalador |
|------|--------|---------------|
| **Reversa Agents Core** | Descoberta e orquestração do legado: mapeia, escava, interpreta e documenta. Detalhado nas tabelas abaixo. | Sempre instalado |
| **Code New Project Agents** | Pipeline greenfield, da ideia em uma linha até specs SDD. Veja [Code New Project Agents](../newproject/index.md). | Marcado por padrão |
| **Code Forward Agents** | Conduzem a evolução a partir das specs: requirements, plan, to-do, audit, quality, coding. Veja [Code Forward Agents](../forward/index.md). | Marcado por padrão |
| **Migration Agents** | Transformam as specs do legado em um plano de reconstrução em stack moderna. Veja [Migração](../migracao/index.md). | Marcado por padrão |
| **Pricing and Size Agents** | Estimam esforço, tamanho e precificação a partir das specs. Veja [Pricing](../pricing/index.md). | Marcado por padrão |
| **Documentation Team** | Renderiza o conhecimento extraído como mini-site HTML autocontido. Veja [Time de Documentação](../documentation/index.md). | Marcado por padrão |
| **Translators N8N->Specs->Python** | Adaptadores que transformam artefatos estruturados (ex.: workflow N8N) em specs. Veja [N8N Translator](n8n.md). | Desmarcado |

As tabelas abaixo detalham os agentes que compõem o Team **Reversa Agents Core**.

---

## Agentes obrigatórios

Esses fazem parte do pipeline principal. O orquestrador os executa na sequência certa.

| Agente | Fase | Analogia | Função |
|--------|------|----------|--------|
| [Reversa](reversa.md) | Orquestração | O regente de orquestra | Coordena todos os agentes, salva checkpoints e guia o usuário |
| [Scout](scout.md) | Reconhecimento | O corretor de imóveis | Mapeia a superfície: pastas, linguagens, frameworks, dependências, entry points |
| [Archaeologist](arqueologo.md) | Escavação | O escavador | Análise profunda módulo a módulo: algoritmos, fluxos, estruturas de dados |
| [Detective](detetive.md) | Interpretação | Sherlock Holmes | Extrai regras de negócio implícitas, ADRs, máquinas de estado, permissões |
| [Architect](arquiteto.md) | Interpretação | O cartógrafo | Sintetiza tudo em diagramas C4, ERD e mapa de integrações |
| [Writer](redator.md) | Geração | O tabelião | Gera specs SDD, OpenAPI e user stories com rastreabilidade de código |

---

## Agentes opcionais

Instalados por padrão, mas podem ser acionados de forma independente em qualquer momento.

| Agente | Analogia | Quando usar |
|--------|----------|-------------|
| [Reviewer](revisor.md) | O revisor de specs | Após o Writer: revisa criticamente as specs e valida lacunas |
| [Visor](visor.md) | O ilustrador forense | Quando tiver screenshots do sistema disponíveis |
| [Data Master](data-master.md) | O geólogo | Quando houver DDL, migrations ou modelos ORM para analisar |
| [Design System](design-system.md) | O estilista | Quando houver arquivos CSS, temas ou screenshots de interface |

---

## Tradutores (adaptadores de entrada)

Use quando o "código" legado não for código-fonte, e sim um artefato estruturado como um workflow visual. Geram uma spec SDD e preparam o estado para o pipeline principal continuar.

| Agente | Analogia | Quando usar |
|--------|----------|-------------|
| [N8N Translator](n8n.md) | O tradutor juramentado | Quando tiver um workflow N8N exportado em JSON e quiser documentá-lo como spec ou portar para Python |

---

## Sequência recomendada

```
/reversa → orquestra tudo automaticamente

Ou manualmente, se preferir controlar cada passo:

Scout → Archaeologist (N sessões) → Detective → Architect → Writer → Reviewer

Opcionais em qualquer fase:
Visor · Data Master · Design System
```
