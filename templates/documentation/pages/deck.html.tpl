<!--
  Template: deck.html
  Producer: reversa-docs-storyteller
  Page ID: deck
  Reversa category: diagram
  Data consumed: assets/data/soul.json + features-index.json + (optional) metrics.json

  Markers:
  - DECK_SLIDES: 6 to 10 slides (cover, concepts, modules, metrics, features, closing)
  - SCRIPTS: arrow navigation + fullscreen + indicator

  Minimum viable version (greenfield): 4 slides (cover, glossary, 1 featured feature, closing).
-->

<!-- PAYLOAD_START -->
<section class="reversa-doc-deck" data-mode="presentation">
    <ol class="reversa-doc-deck-slides" id="deck-slides">
        <!-- DECK_SLIDES -->
    </ol>
    <nav class="reversa-doc-deck-nav" aria-label="Deck navigation">
        <button type="button" data-action="prev" aria-label="Previous slide">&larr;</button>
        <span class="reversa-doc-deck-counter" data-current="1" data-total="0">1 / 0</span>
        <button type="button" data-action="next" aria-label="Next slide">&rarr;</button>
        <button type="button" data-action="fullscreen" aria-label="Fullscreen">⛶</button>
    </nav>
</section>
<!-- PAYLOAD_END -->
