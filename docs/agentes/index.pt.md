# Agentes

O Reversa coordena um time de especialistas. Cada agente faz uma coisa só e faz bem. Nenhum deles tenta fazer tudo.

O orquestrador central (o próprio Reversa) coordena quem entra quando, em que ordem e em que ritmo. Mas você também pode acionar qualquer agente diretamente quando precisar.

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
| [Chronicler](cronista.md) | O tabelião ao lado | Após cada mudança de código — mantém specs sincronizadas com o código |

---

## Sequência recomendada

```
/reversa → orquestra tudo automaticamente

Ou manualmente, se preferir controlar cada passo:

Scout → Archaeologist (N sessões) → Detective → Architect → Writer → Reviewer

Opcionais em qualquer fase:
Visor · Data Master · Design System
```
