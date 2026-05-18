# Os 4 agentes visuais

Quatro agentes formam o Time de Documentação, mais o orquestrador. Cada um roda em ordem fixa, pode ser invocado avulso com `/reversa-docs-<papel>` e escreve apenas dentro de `.reversa/documentation/`.

---

## Pipeline

```
Reversa Docs (orquestrador)
        │
        ▼  vendor bundle (Fase 0)
        │
        ▼
Mapper → Analyst → Storyteller → Publisher
```

Há pausa de revisão humana entre agentes. Modo padrão é interativo. Use `--auto` para pular pausas.

---

## 1. Reversa Docs (orquestrador)

**Comando:** `/reversa-docs`

Detecta quais fontes estão disponíveis, conduz a entrevista de três perguntas (perfil de leitor, profundidade, estilo visual), calcula um seed determinístico a partir de `soul.md` (ou do nome do projeto), persiste tudo em `.config.json` e conduz os quatro especialistas. Salva telemetria em `.state.json` e oferece seis opções de regeneração nas execuções seguintes.

**Produz:** `.config.json`, `.state.json` e a coreografia dos demais agentes.

---

## 2. Mapper

**Comando:** `/reversa-docs-mapper`

Estrutura espacial do projeto. Renderiza Code City em 3D (Three.js, via skill `reversa-arquitetura-3d`) onde cada prédio é um módulo, altura codifica LOC e cor codifica complexidade. Também gera um mapa de módulos 2D force-directed (D3) e, quando a topologia é detectada, uma visão side-by-side legado versus moderno.

**Produz:** `arquitetura.html`, `modulos.html`, `topologia.html` (quando aplicável). JSONs intermediários ficam em `assets/data/` para reuso pelo Analyst.

---

## 3. Analyst

**Comando:** `/reversa-docs-analyst`

Dashboard quantitativo. Highcharts treemap (LOC por módulo), colunas (complexidade por módulo), sankey (dependências entre módulos), histograma (distribuição de LOC). Quando `.reversa/chronicle.md` existe, também renderiza uma timeline interativa de eventos do projeto.

Reusa os JSONs do Mapper. Em invocação avulsa, roda extração mínima quando esses JSONs estão ausentes.

**Produz:** `metricas.html`, `timeline.html` (quando chronicle existe).

---

## 4. Storyteller

**Comando:** `/reversa-docs-storyteller`

Narrativa e onboarding. Três artefatos: glossário interativo (Concept Explainer com busca cliente-side), slide deck navegável (6 a 10 slides) e uma página detalhada por feature em layout *How a Feature Works*.

Não exige Analyst ou Mapper como pré-requisito hard: o deck adapta-se às páginas existentes. Em projeto greenfield com apenas `soul.md`, ainda produz glossário mais deck mínimo de 4 slides.

**Produz:** `glossario.html`, `deck.html`, `features/<spec>.html` (uma por spec SDD).

---

## 5. Publisher

**Comando:** `/reversa-docs-publisher`

Última peça do pipeline. Integra o trabalho dos três especialistas em um mini-site coerente com selo generativo único (via skill `reversa-selo-generativo`), injeta mini-selo retroativamente em cada página, faz auto-discovery de HTMLs auxiliares deixados por outros agentes do core Reversa (via meta tag `reversa-category`), valida links e roda um smoke test real (sobe `http.server`, busca cada página, procura padrões de erro) antes de declarar sucesso.

É dono do **vendor bundle**: baixa Three.js, D3, Highcharts e módulos para `assets/vendor/` com base em `references/vendor-pins.yaml`, com retry de CDN. É isso que faz o mini-site funcionar via `file://` e offline.

**Produz:** `index.html` (hero mais selo mais nav), `assets/js/data.js` (injeta `window.RV_DATA`), `assets/vendor/*` e telemetria final em `.state.json`.

---

## Skills compartilhadas

O time traz cinco skills compartilhadas que viajam junto. Não são agentes independentes, são blocos de capacidade consumidos pelos quatro especialistas.

| Skill | Usada por | Propósito |
|-------|-----------|-----------|
| `reversa-arquitetura-3d` | Mapper | Renderização Code City 3D sobre Three.js |
| `reversa-especialista-d3` | Mapper | Mapa de módulos force-directed em D3 |
| `reversa-highcharts-visualizer` | Analyst | Treemap, sankey, histograma e colunas Highcharts |
| `reversa-image-prompt-json` | Storyteller | Capas premium opcionais para os slides do deck |
| `reversa-selo-generativo` | Publisher | Selo generativo único por projeto, derivado do seed determinístico |

---

## Execução manual

Você quase nunca precisa chamar um agente isolado. `/reversa-docs` orquestra tudo. Mas se uma página específica quebrou ou você quer regenerar uma seção:

```
/reversa-docs                    # pipeline completo (com entrevista e CONTINUAR)
/reversa-docs --auto             # pipeline completo, sem pausas, perfil padrão
/reversa-docs-mapper             # regenera arquitetura / modulos / topologia
/reversa-docs-analyst            # regenera metricas / timeline
/reversa-docs-storyteller        # regenera glossario / deck / features
/reversa-docs-publisher          # regenera index mais selo mais nav, re-roda smoke test
```

Cada agente avulso roda a Fase 0 do Publisher (vendor bundle) como preâmbulo quando `assets/vendor/` está vazio, então uma chamada single-agent ainda produz página funcional.
