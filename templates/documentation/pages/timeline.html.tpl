<!--
  Template: timeline.html
  Producer: reversa-docs-analyst
  Invoked skill: highcharts-visualizer (Highcharts Timeline)
  Page ID: timeline
  Reversa category: diagram
  Data consumed: assets/data/timeline.json (derived from .reversa/chronicle.md)

  Markers:
  - HEAD_EXTRAS: <script src="assets/vendor/highcharts.js"></script>
                 + <script src="assets/vendor/highcharts-accessibility.js"></script>
                 + <script src="assets/vendor/highcharts-timeline.js"></script>
                 (all downloaded by the Publisher via vendor-pins.yaml,
                  highcharts@11.4.8)
  - CHART_TIMELINE: timeline container
  - EVENT_DETAILS: side panel with details of the clicked event
  - SCRIPTS: builds the timeline from window.RV_DATA.timeline (no local fetch)
-->

<!-- PAYLOAD_START -->
<section class="reversa-doc-timeline" data-layout="split">
    <div class="reversa-doc-timeline-stage">
        <div id="chart-timeline"><!-- CHART_TIMELINE --></div>
    </div>
    <aside class="reversa-doc-timeline-details" aria-live="polite">
        <h2>Event details</h2>
        <div id="event-details">
            <!-- EVENT_DETAILS -->
            <p class="reversa-doc-empty-hint">Click an event on the timeline to view details.</p>
        </div>
    </aside>
</section>
<!-- PAYLOAD_END -->
