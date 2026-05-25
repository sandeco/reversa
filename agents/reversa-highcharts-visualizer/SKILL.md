---
name: reversa-highcharts-visualizer
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI, and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  team: shared-skills
  role: charts-renderer
description: >
  Creates professional, interactive data visualizations using Highcharts.js, generating
  standalone HTML with animated, responsive, and accessible charts. Use this skill whenever
  the user asks to create graphs, charts, dashboards, data visualizations, or any visual
  representation of numeric/categorical data. It must be used when the user mentions
  terms such as "graph", "chart", "dashboard", "highcharts", "data visualization",
  "line chart", "bars", "pie", "scatter", "heatmap", "treemap", "gauge", "stock chart",
  "map", "gantt", "sankey", "funnel", or when they provide data (CSV, JSON, table, spreadsheet)
  asking for a visual representation. It should also be activated when the user asks for beautiful,
  interactive, animated charts with tooltips, drill-down, or export support. It works with inline data,
  CSV, JSON, and data files. It always generates complete and functional standalone HTML.
---

# Highcharts Visualizer

Creates professional data visualizations using Highcharts.js. Always generates **standalone HTML**
(a single, self-contained file) with interactive, animated, responsive, and accessible charts.

## Workflow

### 1. Receive the Data

The data may come from:

- **Inline in the conversation** → User pastes data, table, list of values
- **CSV/JSON sent** → Analyze the content using `view_file` and inject the data directly into the generated HTML. Never create Python scripts.
- **Excel spreadsheet** → Extract the data from the tables and inject it into the HTML. Do not use Python.
- **Sample data** → When the user wants to explore a chart type without real data
- **Data URL** → Use `web_fetch` to fetch remote data

### 2. Analyze the Data

Before generating the chart, understand the nature of the data:

- **Dimensions**: how many series? How many categories? Temporal or categorical?
- **Scale**: value range, outliers, distribution
- **Relationships**: comparison, composition, distribution, trend, correlation
- **Volume**: few points (<100), medium (100-10K), large (>10K — use boost module)

Analyze the data internally after reading it and inject the tags via string. Do not create intermediate Python programs.

### 3. Choose the Chart Type

Consult `references/CHART_CATALOG.md` for the complete catalog of 40+ chart types,
with guidance on when to use each one.

**Quick decision rule:**

| Objective | Recommended types |
|----------|-------------------|
| Trend over time | line, area, spline, areaspline |
| Comparison between categories | column, bar, lollipop, bullet |
| Composition / proportion | pie, donut, stacked column, stacked area, treemap, sunburst |
| Distribution | histogram, box plot, scatter, bell curve |
| Correlation | scatter, bubble, heatmap |
| Flow / process | sankey, dependency wheel, network graph |
| Hierarchy | treemap, sunburst, organization chart |
| Geographic | map (Highcharts Maps module) |
| Financial / timeline | stock chart (candlestick, OHLC, flags) |
| Progress / KPI | gauge, solid gauge, activity gauge |
| Project / planning | gantt chart |
| Funnel / conversion | funnel, pyramid |

If the user did not specify the type, suggest 2-3 options that best represent the data.

### 4. Generate the Code

Consult `references/HIGHCHARTS_PATTERNS.md` for proven code patterns.

**Fundamental rules:**

1. **Standalone HTML**: single `.html` file. When run by the Reversa Docs Team, Highcharts comes from `assets/vendor/` (downloaded by the Publisher via `vendor-pins.yaml`). When run in isolation, CDN is acceptable as a fallback but the preferred path is local.
2. **Pinned version**: `highcharts@11.4.8`. Core and modules must use the same version.
3. **On-demand modules**: only include extra scripts when needed (see module table).
4. **Accessibility always**: always include `assets/vendor/highcharts-accessibility.js`.
5. **Exporting always**: always include `assets/vendor/highcharts-exporting.js`.
6. **Responsive**: the chart must adapt to the container/viewport.
7. **Consistent theme**: apply cohesive colors and professional typography.
8. **Animation**: enable entry animations and smooth transitions.
9. **Rich tooltips**: formatted tooltips with units and context.
10. **Large data**: for >10K points, include `modules/boost.js` (must be added to `vendor-pins.yaml`).
11. **No `fetch()` for local files**: data comes from `window.RV_DATA.metrics` (or `window.RV_DATA.timeline`), loaded by `assets/js/data.js`.

**Required modules by chart type (preference: local path in `assets/vendor/`):**

| Feature | Local (when run by the Docs team) | CDN fallback |
|---------|-----------------------------------|--------------|
| Core (required) | `assets/vendor/highcharts.js` | `https://code.highcharts.com/11.4.8/highcharts.js` |
| Accessibility (required) | `assets/vendor/highcharts-accessibility.js` | `.../11.4.8/modules/accessibility.js` |
| Exporting (required) | `assets/vendor/highcharts-exporting.js` | `.../11.4.8/modules/exporting.js` |
| Treemap | `assets/vendor/highcharts-treemap.js` | `.../11.4.8/modules/treemap.js` |
| Sankey | `assets/vendor/highcharts-sankey.js` | `.../11.4.8/modules/sankey.js` |
| Timeline | `assets/vendor/highcharts-timeline.js` | `.../11.4.8/modules/timeline.js` |
| Others (Sunburst, Heatmap, Funnel, etc.) | add to `vendor-pins.yaml` before using | `.../11.4.8/modules/<module>.js` |
| Stock (candlestick, OHLC) | add to `vendor-pins.yaml` before using | `.../stock/11.4.8/highstock.js` |
| Maps | add to `vendor-pins.yaml` before using | `.../maps/11.4.8/highmaps.js` |
| Gantt | add to `vendor-pins.yaml` before using | `.../gantt/11.4.8/highcharts-gantt.js` |

> If a page needs a module that is **not yet** in `vendor-pins.yaml`, the correct path is:
> 1. Ask the Publisher to add the pin (commit in that skill or open an issue), with primary URL + fallbacks.
> 2. Only then use the module.
> Pointing final pages directly to a CDN breaks the invariant "works via `file://` without internet".

All CDNs (fallback) use the format: `https://code.highcharts.com/11.4.8/{path}`.

### 5. Save and Deliver

Save the generated HTML directly to the destination folder using `write_to_file`. Always generate the raw HTML file with all processed data injected into the `<script>` variables. Do not use Python snippets.

## Quality Guidelines

- **Professional aesthetics**: cohesive colors (use Highcharts palettes or custom), clean typography, adequate spacing
- **Formatted data**: numbers with thousands separators, localized dates, units on axes
- **Clear legends**: descriptive series names, position that does not obstruct the data
- **Rich interactivity**: hover highlights, contextual tooltips, zoom when applicable
- **Dark mode**: when appropriate, offer a dark version with `backgroundColor: '#1a1a2e'`
- **Multiple charts**: for dashboards, organize in a responsive CSS grid
- **Commented code**: comments in English explaining each section

## Error Handling

Consult `references/ERRORS.md` for error scenarios and solutions.
