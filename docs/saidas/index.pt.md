# Saídas geradas

Tudo que o Reversa produz vai para a pasta `_reversa_sdd/` (ou o nome que você configurar em `config.toml`). O projeto legado nunca é tocado.

O conjunto de artefatos gerados depende do **nível de documentação** escolhido no início da análise:

| Legenda | Nível |
|---------|-------|
| *(todos)* | Gerado nos 3 níveis |
| *(completo+)* | Apenas nos níveis `completo` e `detalhado` |
| *(detalhado)* | Apenas no nível `detalhado` |

---

## Estrutura completa

```
_reversa_sdd/
├── inventory.md              # Inventário do projeto — todos
├── dependencies.md           # Dependências com versões — todos
├── code-analysis.md          # Análise técnica por módulo — todos
├── data-dictionary.md        # Dicionário completo de dados — completo+
├── domain.md                 # Glossário e regras de negócio — todos
├── state-machines.md         # Máquinas de estado em Mermaid — completo+
├── permissions.md            # Matriz de permissões — completo+
├── architecture.md           # Visão arquitetural geral — todos
├── c4-context.md             # Diagrama C4: Contexto — todos
├── c4-containers.md          # Diagrama C4: Containers — completo+
├── c4-components.md          # Diagrama C4: Componentes — completo+
├── erd-complete.md           # ERD completo em Mermaid — completo+
├── deployment.md             # Diagrama de infraestrutura — detalhado
├── confidence-report.md      # Relatório de confiança 🟢🟡🔴 — todos
├── gaps.md                   # Lacunas sem resposta — completo+
├── questions.md              # Perguntas para validação humana — todos
├── sdd/                      # Specs por componente — todos
│   └── [componente].md
│
├── openapi/                  # Specs de API — completo+
│   └── [api].yaml
│
├── user-stories/             # User stories — completo+
│   └── [fluxo].md
│
├── adrs/                     # Decisões arquiteturais retroativas — completo+
│   └── [numero]-[titulo].md
│
├── flowcharts/               # Fluxogramas em Mermaid — completo+
│   └── [modulo].md
│
├── ui/                       # Specs de interface (Visor)
│   ├── inventory.md
│   ├── flow.md
│   └── screens/
│       └── [tela].md
│
├── database/                 # Specs de banco de dados (Data Master)
│   ├── erd.md
│   ├── data-dictionary.md
│   ├── relationships.md
│   ├── business-rules.md
│   └── procedures.md
│
├── design-system/            # Tokens de design (Design System)
│   ├── color-palette.md
│   ├── typography.md
│   ├── spacing.md
│   ├── tokens.md
│   └── design-system.md
│
├── addenda/                  # Adendos pós-entrega (reversa-sync)
│   └── [NNN]-[feature].md    # Um por feature entregue pelo /reversa-coding
│
└── traceability/
    ├── spec-impact-matrix.md # Qual spec impacta qual — completo+
    ├── code-spec-matrix.md   # Arquivo de código → spec correspondente — completo+
    └── bugs.md               # Matriz BUG ↔ SPEC (reversa-debugger-graph)
```

---

## Adendos: manter a extração atual

Uma extração é uma fotografia do sistema em um dado momento. Assim que uma feature do forward é entregue, o código segue em frente e `architecture.md` e `domain.md` passam a descrever um sistema que já não existe.

O `/reversa-sync` fecha esse intervalo sem tocar nos artefatos originais. Ele destila a feature entregue em um adendo dentro de `addenda/`, um arquivo por feature, contendo:

- uma seção de **vigência**, dizendo que o adendo vale até a próxima re-extração completa
- o delta introduzido pela feature, tirado de `legacy-impact.md` e `regression-watch.md`
- apontadores para as seções da extração que ficaram defasadas, para que quem as ler saiba que precisa ler o adendo também

A próxima execução completa do `/reversa` absorve a mudança e marca o adendo como superado. Nada da extração é reescrito no lugar.

---

## Rastreabilidade

Dois arquivos conectam tudo:

**`traceability/code-spec-matrix.md`:** mapeia cada arquivo de código para a spec correspondente, com o nível de cobertura. Você sabe o que está coberto e o que não está.

**`traceability/spec-impact-matrix.md`:** mapeia qual componente impacta qual. Antes de mexer em alguma coisa, você sabe o raio de blast da mudança.

---

## Não commitando o que não precisa

Sugestão de `.gitignore` para não versionar as saídas do Reversa junto com o código (a não ser que você queira):

```gitignore
# Saídas do Reversa (opcional: remova se quiser versionar as specs)
_reversa_sdd/

# Configuração pessoal do Reversa (nunca commitar)
.reversa/config.user.toml
```

---

## Próximo passo

Specs em mãos? Veja [Desenvolvendo com as specs](../desenvolvendo-com-specs.md) para a ordem recomendada de construção do sistema.
