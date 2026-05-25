<!--
  Template: glossario.html
  Producer: reversa-docs-storyteller
  Page ID: glossario
  Reversa category: diagram
  Data consumed: assets/data/soul.json (derived from .reversa/soul.md)

  Markers:
  - GLOSSARY_SEARCH: client-side search input
  - GLOSSARY_CARDS: concept cards
  - SCRIPTS: inline JS for search and filtering
-->

<!-- PAYLOAD_START -->
<section class="reversa-doc-glossary">
    <header class="reversa-doc-glossary-header">
        <label for="glossary-search" class="visually-hidden">Search concept</label>
        <input
            type="search"
            id="glossary-search"
            placeholder="Search concept..."
            autocomplete="off"
        >
        <!-- GLOSSARY_SEARCH -->
    </header>
    <div class="reversa-doc-glossary-grid" id="glossary-grid">
        <!-- GLOSSARY_CARDS -->
    </div>
</section>
<!-- PAYLOAD_END -->
