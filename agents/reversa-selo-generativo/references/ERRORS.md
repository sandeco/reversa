# Error Scenarios and Handling

Common scenarios in the `selo-generativo` skill and how to handle them.

---

## ERR-01: p5.js unavailable (CDN unreachable)

**Cause**: user offline on first run, or CDN blocked.

**Detection**: global `p5` variable undefined after the CDN `<script>`.

**Handling**:

```javascript
window.addEventListener("load", () => {
    if (typeof p5 === "undefined") {
        document.getElementById("seal-container").innerHTML = `
            <div class="seal-fallback" style="width: ${SIZE}px; height: ${SIZE}px;
                 background: ${palette.bg}; display: flex; align-items: center;
                 justify-content: center; border-radius: 50%; color: ${palette.fg};">
                <span>Seal unavailable</span>
            </div>`;
        return;
    }
    // normal setup here
});
```

Fallback: minimal SVG (circle + palette background color) inline, with no p5 dependency.

---

## ERR-02: Canvas not supported by the browser

**Cause**: very old browser without `<canvas>` support (extremely rare today).

**Detection**: `canvas.getContext("2d")` returns `null`.

**Handling**: fall back to inline SVG with `crystal-lattice` (the most compatible pattern with real SVG).

---

## ERR-03: Invalid or missing seed

**Cause**: agent called the skill without a seed, or passed an empty string.

**Detection**: input validation.

**Handling**: safe fallback.

```javascript
function resolveSeed(rawSeed) {
    if (!rawSeed || typeof rawSeed !== "string" || rawSeed.length === 0) {
        const timestamp = Date.now().toString();
        console.warn("Missing seed, using timestamp as fallback. Seal will not be reproducible.");
        return timestamp;
    }
    return rawSeed;
}
```

When timestamp is used, show a warning in the page footer (only for large hero): "Non-reproducible seal (no seed)".

---

## ERR-04: Extreme size

**Cause**: request for a very large canvas (>4096) or very small (<16).

**Detection**: validate `size` parameter.

**Handling**:

```javascript
function clampSize(requested) {
    const MIN = 16;
    const MAX = 4096;
    if (requested < MIN) {
        console.warn(`Size ${requested} below minimum (${MIN}). Adjusting.`);
        return MIN;
    }
    if (requested > MAX) {
        console.warn(`Size ${requested} above maximum (${MAX}). Adjusting.`);
        return MAX;
    }
    return requested;
}
```

Above 1024, pixel-loop patterns such as `wave-interference` become heavy. The skill should warn and require `noLoop()` with canvas cache.

---

## ERR-05: Palette with invalid colors

**Cause**: received palette with malformed hex or missing field.

**Detection**: validation regex on each color.

**Handling**:

```javascript
function validatePalette(palette) {
    const HEX_RX = /^#[0-9a-fA-F]{6}$/;
    const required = ["bg", "foreground", "accent", "fg"];
    for (const field of required) {
        if (!(field in palette)) {
            throw new Error(`Invalid palette: missing '${field}' field.`);
        }
    }
    if (!Array.isArray(palette.foreground) || palette.foreground.length === 0) {
        throw new Error("Invalid palette: 'foreground' must be a non-empty list.");
    }
    [palette.bg, palette.accent, palette.fg].forEach((c) => {
        if (!HEX_RX.test(c)) throw new Error(`Invalid color: ${c}`);
    });
    palette.foreground.forEach((c) => {
        if (!HEX_RX.test(c)) throw new Error(`Invalid foreground color: ${c}`);
    });
}
```

If the palette is invalid, fall back to `palettes.sober` (the most conservative fallback palette) and log the failure.

---

## ERR-06: Insufficient contrast

**Cause**: palette with `accent` and `bg` too close, making the central element invisible.

**Detection**: `contrastRatio(accent, bg) < 4.5` (see PALETTE_BY_STYLE.md).

**Handling**: derive adjusted `accent` automatically.

```javascript
function ensureContrast(palette) {
    if (contrastRatio(palette.accent, palette.bg) < 4.5) {
        const bgIsLight = luminance(palette.bg) > 0.5;
        palette.accent = bgIsLight ? darken(palette.accent, 0.4) : lighten(palette.accent, 0.4);
    }
    return palette;
}
```

---

## ERR-07: Chosen pattern incompatible with style

**Cause**: seed derivation resulted in a pattern visually incompatible with the chosen style (e.g. `crystal-lattice` in `exploratory` style).

**Detection**: compatibility table declared in `GENERATIVE_PATTERNS.md`.

**Handling**: re-roll within compatible patterns.

```javascript
const STYLE_COMPATIBLE = {
    sober: ["flow-field", "crystal-lattice", "noise-strata"],
    premium: ["particle-orbit", "wave-interference"],
    dense: ["crystal-lattice", "wave-interference"],
    exploratory: ["flow-field", "particle-orbit", "noise-strata"]
};

function pickCompatible(seedHex, styleHint) {
    const allowed = STYLE_COMPATIBLE[styleHint];
    if (!allowed) return PATTERNS[0];
    const idx = parseInt(seedHex.slice(2, 4), 16) % allowed.length;
    return allowed[idx];
}
```

---

## ERR-08: Very poor performance in mini seal

**Cause**: heavy pattern on a small canvas consuming disproportionate CPU.

**Detection**: measure time between `setup` and final `draw`.

**Handling**: if canvas is mini (<200px) and chosen pattern is `wave-interference` (pixel loop), automatically switch to `crystal-lattice` (simple geometry) with a console message.

---

## ERR-09: Multiple instances of the same seal on the same page

**Cause**: mini seal appears on every page of the mini-site. Reloading p5.js and generating a canvas on each one is wasteful.

**Handling**: generate the seal once as SVG (for `crystal-lattice`) or PNG dataURI (for other patterns) and embed inline on all pages. The skill accepts parameter `mode: "svg" | "dataURI" | "html"` to return the appropriate format.

```javascript
function exportAs(mode) {
    if (mode === "svg") return canvasToSvg();
    if (mode === "dataURI") return canvas.elt.toDataURL("image/png");
    return wrapInStandaloneHtml(canvas);
}
```

---

## ERR-10: Corrupted seed localStorage

Not directly applicable, because the skill does not persist state between runs. The seed always comes from the invoker (orchestrator agent), and reproducibility depends only on it.

If the invoker lost the seed, the agent should recalculate it from soul.md (sha256). This skill is not responsible for that.

---

## General principle

The seal is a **decorative** element. Seal failure must never break the whole page. In all scenarios above, there is a fallback that always renders something: a colored circle, a minimal SVG, a simplified version. No blank screen.

Messages in English, without em dashes.
