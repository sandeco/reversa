<!--
  Template: arquitetura.html
  Producer: reversa-docs-mapper
  Invoked skill: reversa-arquitetura-3d (code-city mode)
  Page ID: arquitetura
  Reversa category: diagram
  Data consumed: assets/data/modules.json, assets/data/deps.json

  Specific markers:
  - THREE_CANVAS: Three.js canvas container
  - SIDEBAR: controls (vertical scale, grouping, palette)
  - HEAD_EXTRAS: <script src="assets/vendor/three.min.js"></script>
                 + <script src="assets/vendor/OrbitControls.js"></script>
                 (both downloaded by the Publisher via vendor-pins.yaml,
                  three@0.147.0 IIFE + OrbitControls r147 IIFE)
  - SCRIPTS: inline JS that builds the Code City by reading window.RV_DATA.modules
             (NEVER local fetch; the page must open via file:// without CORS)
-->

<!-- PAYLOAD_START -->
<section class="reversa-doc-3d-stage" data-mode="code-city">
    <div id="three-canvas" class="reversa-doc-three-canvas">
        <!-- THREE_CANVAS -->
    </div>
    <div class="reversa-doc-3d-loader" aria-live="polite">Loading Code City...</div>
</section>

<details class="reversa-doc-3d-legend">
    <summary>Legend</summary>
    <ul>
        <li>Building height: lines of code (LOC).</li>
        <li>Color: cyclomatic complexity.</li>
        <li>District (colored ground): source folder.</li>
    </ul>
</details>
<!-- PAYLOAD_END -->
