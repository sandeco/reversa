<!--
  Template: features/<spec-id>.html
  Producer: reversa-docs-storyteller
  Page ID: feature-<id>
  Reversa category: diagram
  Data consumed: _reversa_sdd/<spec>/requirements.md + design.md + tasks.md

  Pattern: "How a Feature Works" (TL;DR + accordion + snippets in tabs).

  Markers:
  - FEATURE_TLDR: 2 to 4 lines summarizing what the feature does
  - FEATURE_ACCORDION: collapsible sections (Requirements, Design, Tasks, Code Snippets)
  - FEATURE_TABS: tabs with relevant code excerpts
-->

<!-- PAYLOAD_START -->
<article class="reversa-doc-feature">
    <section class="reversa-doc-feature-tldr">
        <h2>TL;DR</h2>
        <p><!-- FEATURE_TLDR --></p>
    </section>

    <section class="reversa-doc-feature-accordion">
        <!-- FEATURE_ACCORDION -->
        <details open>
            <summary>Requirements</summary>
            <div data-section="requirements"><!-- FEATURE_REQUIREMENTS --></div>
        </details>
        <details>
            <summary>Design</summary>
            <div data-section="design"><!-- FEATURE_DESIGN --></div>
        </details>
        <details>
            <summary>Tasks</summary>
            <div data-section="tasks"><!-- FEATURE_TASKS --></div>
        </details>
    </section>

    <section class="reversa-doc-feature-tabs" hidden>
        <h2>Relevant snippets</h2>
        <!-- FEATURE_TABS -->
    </section>
</article>
<!-- PAYLOAD_END -->
