<!--
  Template: topologia.html
  Producer: reversa-docs-mapper
  Invoked skill: especialista-d3 (hierarchical mode) or manual HTML
  Page ID: topologia
  Reversa category: diagram
  Data consumed: _reversa_sdd/architecture.md (parsed)

  Markers:
  - TOPOLOGY_LEGACY: left column, detected legacy topology
  - TOPOLOGY_MODERN: right column, proposed modern alternative
  - TOPOLOGY_HYBRID: optional, center band with the hybrid option
-->

<!-- PAYLOAD_START -->
<section class="reversa-doc-topology" data-layout="side-by-side">
    <article class="reversa-doc-topology-col" data-variant="legacy">
        <h2>Current topology (legacy)</h2>
        <!-- TOPOLOGY_LEGACY -->
    </article>
    <article class="reversa-doc-topology-col" data-variant="modern">
        <h2>Modern alternative</h2>
        <!-- TOPOLOGY_MODERN -->
    </article>
</section>

<section class="reversa-doc-topology-hybrid" hidden>
    <h2>Hybrid path (if applicable)</h2>
    <!-- TOPOLOGY_HYBRID -->
</section>
<!-- PAYLOAD_END -->
