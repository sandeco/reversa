---
name: reversa-highcharts-visualizer
description: Cria visualizações de dados interativas com Highcharts.js, gerando HTML standalone com gráficos animados, responsivos e acessíveis a partir de dados inline, CSV ou JSON. Use com "gráfico", "chart", "dashboard", "highcharts", "visualização de dados" (linhas, barras, pizza, heatmap, treemap, sankey, gantt).
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  team: shared-skills
  role: charts-renderer
---

# Highcharts Visualizer

Cria visualizações de dados profissionais usando Highcharts.js. Gera sempre **HTML standalone**
(arquivo único, self-contained) com gráficos interativos, animados, responsivos e acessíveis.

## Fluxo de Trabalho

### 1. Receber os Dados

Os dados podem vir de:

- **Inline na conversa** → Usuário cola dados, tabela, lista de valores
- **CSV/JSON enviado** → Analise o conteúdo usando `view_file` e injete os dados diretamente no HTML gerado. Nunca crie scripts em Python.
- **Planilha Excel** → Extraia os dados das tabelas e injete-os no HTML. Não use Python.
- **Dados de exemplo** → Quando o usuário quer explorar um tipo de gráfico sem dados reais
- **URL de dados** → Usar `web_fetch` para buscar dados remotos

### 2. Analisar os Dados

Antes de gerar o gráfico, entender a natureza dos dados:

- **Dimensões**: quantas séries? Quantas categorias? Temporal ou categórico?
- **Escala**: range dos valores, outliers, distribuição
- **Relações**: comparação, composição, distribuição, tendência, correlação
- **Volume**: poucos pontos (<100), médio (100-10K), grande (>10K — usar boost module)

Analise os dados internamente após a leitura e injete as tags via string. Não crie programas Python intermediários.

### 3. Escolher o Tipo de Gráfico

Consultar `references/CHART_CATALOG.md` para o catálogo completo de 40+ tipos de gráfico,
com orientação de quando usar cada um.

**Regra de decisão rápida:**

| Objetivo | Tipos recomendados |
|----------|-------------------|
| Tendência ao longo do tempo | line, area, spline, areaspline |
| Comparação entre categorias | column, bar, lollipop, bullet |
| Composição / proporção | pie, donut, stacked column, stacked area, treemap, sunburst |
| Distribuição | histogram, box plot, scatter, bell curve |
| Correlação | scatter, bubble, heatmap |
| Fluxo / processo | sankey, dependency wheel, network graph |
| Hierarquia | treemap, sunburst, organization chart |
| Geográfico | map (Highcharts Maps module) |
| Financeiro / timeline | stock chart (candlestick, OHLC, flags) |
| Progresso / KPI | gauge, solid gauge, activity gauge |
| Projeto / planejamento | gantt chart |
| Funil / conversão | funnel, pyramid |

Se o usuário não especificou o tipo, sugerir 2-3 opções que melhor representam os dados.

### 4. Gerar o Código

Consultar `references/HIGHCHARTS_PATTERNS.md` para padrões de código testados.

**Regras fundamentais:**

1. **HTML standalone**: arquivo único `.html`. Quando rodada pelo Time Reversa Docs, Highcharts vem de `assets/vendor/` (baixado pelo Publisher via `vendor-pins.yaml`). Quando rodada isoladamente, aceita CDN como fallback mas o caminho preferido é local.
2. **Versão pinada**: `highcharts@11.4.8`. Core e módulos precisam ser da mesma versão.
3. **Módulos por demanda**: só incluir scripts extras quando necessário (ver tabela de módulos).
4. **Accessibility sempre**: sempre incluir `assets/vendor/highcharts-accessibility.js`.
5. **Exporting sempre**: sempre incluir `assets/vendor/highcharts-exporting.js`.
6. **Responsivo**: o gráfico deve se adaptar ao container/viewport.
7. **Tema consistente**: aplicar cores coesas e tipografia profissional.
8. **Animação**: habilitar animações de entrada e transições suaves.
9. **Tooltips ricos**: tooltips formatados, com unidades e contexto.
10. **Dados grandes**: para >10K pontos, incluir `modules/boost.js` (precisa entrar no `vendor-pins.yaml`).
11. **Sem `fetch()` para arquivos locais**: dados vêm de `window.RV_DATA.metrics` (ou `window.RV_DATA.timeline`), carregado por `assets/js/data.js`.

**Módulos necessários por tipo de gráfico (preferência: caminho local em `assets/vendor/`):**

| Recurso | Local (quando rodado pelo time Docs) | Fallback CDN |
|---------|--------------------------------------|--------------|
| Core (obrigatório) | `assets/vendor/highcharts.js` | `https://code.highcharts.com/11.4.8/highcharts.js` |
| Accessibility (obrigatório) | `assets/vendor/highcharts-accessibility.js` | `.../11.4.8/modules/accessibility.js` |
| Exporting (obrigatório) | `assets/vendor/highcharts-exporting.js` | `.../11.4.8/modules/exporting.js` |
| Treemap | `assets/vendor/highcharts-treemap.js` | `.../11.4.8/modules/treemap.js` |
| Sankey | `assets/vendor/highcharts-sankey.js` | `.../11.4.8/modules/sankey.js` |
| Timeline | `assets/vendor/highcharts-timeline.js` | `.../11.4.8/modules/timeline.js` |
| Outros (Sunburst, Heatmap, Funnel, etc) | adicionar em `vendor-pins.yaml` antes de usar | `.../11.4.8/modules/<modulo>.js` |
| Stock (candlestick, OHLC) | adicionar em `vendor-pins.yaml` antes de usar | `.../stock/11.4.8/highstock.js` |
| Maps | adicionar em `vendor-pins.yaml` antes de usar | `.../maps/11.4.8/highmaps.js` |
| Gantt | adicionar em `vendor-pins.yaml` antes de usar | `.../gantt/11.4.8/highcharts-gantt.js` |

> Se uma página precisa de módulo que **ainda não está** em `vendor-pins.yaml`, o caminho correto é:
> 1. Pedir ao Publisher que adicione o pin (commit nessa skill ou abrir issue), com URL primária + fallbacks.
> 2. Só depois usar o módulo.
> Apontar diretamente para CDN nas páginas finais é ruptura da invariante "funciona via `file://` sem internet".

Todos os CDNs (fallback) no formato: `https://code.highcharts.com/11.4.8/{path}`.

### 5. Salvar e Entregar

Salvar o HTML gerado diretamente na pasta de destino usando `write_to_file`. Sempre gere o arquivo HTML puro com todos os dados processados e injetados nas variáveis `<script>`. Não use trechos de Python.

## Diretrizes de Qualidade

- **Estética profissional**: cores coesas (usar paletas Highcharts ou custom), tipografia limpa, espaçamentos adequados
- **Dados formatados**: números com separadores de milhar, datas localizadas, unidades nos eixos
- **Legendas claras**: nomes de séries descritivos, posição que não obstrui os dados
- **Interatividade rica**: hover highlights, tooltips contextuais, zoom quando aplicável
- **Dark mode**: quando apropriado, oferecer versão dark com `backgroundColor: '#1a1a2e'`
- **Múltiplos gráficos**: para dashboards, organizar em grid CSS responsivo
- **Código comentado**: comentários em português explicando cada seção

## Tratamento de Erros

Consultar `references/ERRORS.md` para cenários de erro e soluções.
