# Time de Documentação

O **Time de Documentação** transforma o conhecimento extraído pelo restante do Reversa em um mini-site HTML autocontido, servido direto do disco. Sem servidor de build, sem conexão com a internet para visualizar: cada biblioteca, cada dataset, cada asset visual está vendored localmente.

Ative com:

```
/reversa-docs
```

O orquestrador detecta quais fontes estão disponíveis (`_reversa_sdd/`, `.reversa/soul.md`, `.reversa/chronicle.md`, código fonte), conduz uma breve entrevista de três perguntas (perfil de leitor, profundidade, estilo visual) e depois executa quatro agentes especialistas em ordem fixa.

---

## Quando usar

Você já rodou `/reversa` e quer dar a alguém, um dev novo, um stakeholder não-técnico, um time externo auditando, uma forma de navegar o que foi extraído sem precisar ler Markdown bruto. O mini-site é opinativo sobre onboarding: Code City 3D para intuição espacial, dashboards para mordida quantitativa, glossário mais deck para narrativa.

Em um projeto greenfield puro (sem fontes detectadas), o orquestrador pergunta se deseja abortar ou gerar apenas um index mínimo.

---

## Pipeline

```
/reversa-docs                   (orquestrador)
       │
       ▼ Fase 0: vendor bundle
       │   baixa Three.js, D3, Highcharts, OrbitControls
       │   para assets/vendor/ para funcionar via file:// offline
       │
       ▼ Fase 1
Mapper        → arquitetura.html (Code City 3D)
              → modulos.html (force-directed D3)
              → topologia.html (legado vs moderno side-by-side)
       │
       ▼ Fase 2
Analyst       → metricas.html (Highcharts treemap, sankey, histograma, colunas)
              → timeline.html (eventos de .reversa/chronicle.md)
       │
       ▼ Fase 3
Storyteller   → glossario.html (busca cliente-side)
              → deck.html (6 a 10 slides navegáveis)
              → features/<spec>.html (uma por spec SDD)
       │
       ▼ Fase 4
Publisher     → index.html com hero e selo generativo único
              → auto-discovery de HTMLs auxiliares
              → validação de links e telemetria local
```

Há um checkpoint `CONTINUAR` entre agentes. Use `--auto` para pular a entrevista e as pausas.

---

## Onde os artefatos ficam

Tudo é gravado em `.reversa/documentation/`. O time **nunca** modifica artefatos do core (`_reversa_sdd/`, `.reversa/soul.md`, `.reversa/chronicle.md`), apenas lê.

```
.reversa/documentation/
├── index.html              (Publisher: hero, selo, nav)
├── arquitetura.html        (Mapper)
├── modulos.html            (Mapper)
├── topologia.html          (Mapper, se topologia detectada)
├── metricas.html           (Analyst)
├── timeline.html           (Analyst, se chronicle existir)
├── glossario.html          (Storyteller)
├── deck.html               (Storyteller)
├── features/
│   └── <spec>.html         (Storyteller, uma por spec SDD)
├── viewer.html             (shell compartilhado)
├── assets/
│   ├── vendor/             (Three.js, D3, Highcharts, ...)
│   ├── js/data.js          (Publisher: injeta window.RV_DATA)
│   └── data/*.json         (caches intermediários entre agentes)
├── .config.json            (entrevista, seed, estilo visual)
└── .state.json             (telemetria do pipeline, hashes por página)
```

Se `.reversa/documentation/` já existir, o orquestrador oferece seis opções de regeneração (manter, regenerar tudo, regenerar um agente ou página, refazer a entrevista, ...) e sempre cria `.backup-<timestamp>/` antes de sobrescrever.

---

## Invariantes

Cada página produzida pelo time respeita quatro invariantes. O Publisher é o guardião final, mas qualquer agente que viole quebra o mini-site:

1. **Funciona via `file://`**: duplo clique em `index.html` basta. Nenhuma página faz `fetch()` para arquivos locais (CORS bloqueia origin `null`); dados vêm de `window.RV_DATA.<chave>`, injetado por `assets/js/data.js`.
2. **Funciona offline**: nenhum `<script src="https://...">` para CDN. Toda lib externa fica vendored em `assets/vendor/`.
3. **Nav reflete `pagesGenerated`**: o marcador `<!-- NAV_LINKS -->` em `viewer.html` é preenchido pelo Publisher lendo `.state.json.pagesGenerated`. Páginas omitidas não aparecem.
4. **Smoke test antes de declarar sucesso**: o Publisher sobe um `http.server` local, busca cada página e procura padrões de erro. Falhas aparecem em destaque no resumo final.

---

## Próximos passos

- [Os 4 agentes visuais](agentes.md): o que cada um renderiza, entradas e saídas.
- [Code Forward Agents](../forward/index.md): o ciclo sobre o qual o time é construído.
