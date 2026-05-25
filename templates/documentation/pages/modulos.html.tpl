<!--
  Template: modulos.html
  Producer: reversa-docs-mapper
  Invoked skill: especialista-d3 (force-directed mode)
  Page ID: modulos
  Reversa category: diagram
  Data consumed: assets/data/modules.json, assets/data/deps.json

  Markers:
  - D3_CANVAS: force-directed SVG
  - SIDEBAR: filters (language, type, force)
  - HEAD_EXTRAS: <script src="assets/vendor/d3.v7.min.js"></script>
                 (downloaded by the Publisher via vendor-pins.yaml, d3@7.8.5 IIFE)
  - SCRIPTS: builds the force-directed graph from window.RV_DATA.modules and
             window.RV_DATA.deps (no local fetch)
-->

<!-- PAYLOAD_START -->
<section class="reversa-doc-graph-stage" data-mode="force-directed">
    <svg id="d3-canvas" class="reversa-doc-d3-canvas" aria-label="Module map">
        <!-- D3_CANVAS -->
    </svg>
</section>

<details class="reversa-doc-graph-legend">
    <summary>Legend</summary>
    <ul>
        <li>Node: module. Size proportional to LOC.</li>
        <li>Edge: dependency. Thickness proportional to weight.</li>
        <li>Red node: part of a detected cycle.</li>
    </ul>
</details>
<!-- PAYLOAD_END -->
