# Palettes by Visual Style

Table of palettes used by the seal, derived from the visual style chosen by the user in `/reversa-documentation`.

Each palette has 4 fields:

- `bg`: canvas background color.
- `foreground`: list of main colors used by the pattern (3 to 5 colors).
- `accent`: highlight color for central elements (1 color).
- `fg`: text color for the label outside the canvas.

---

## Palette: `sober`

Sober, technical, neutral style. Focus on legibility and timelessness.

```json
{
  "bg": "#f5f3ee",
  "foreground": ["#3d4a5c", "#7c8a99", "#a06b4a", "#4f6b5d", "#bdb4a4"],
  "accent": "#1e2937",
  "fg": "#1e2937"
}
```

Visual translation:
- Background: off-white paper.
- Foreground: teal blue, stone gray, terracotta, moss green, sand.
- Accent: deep midnight blue.

**Dark variant**: for use in mini seal on dark header, mirror it (`bg ↔ fg`).

---

## Palette: `premium`

Cinematic, luxurious, dark style. Focus on contrast and glow.

```json
{
  "bg": "#0a0a14",
  "foreground": ["#d4af37", "#7a1c2a", "#b8b8b8", "#1e2b4f", "#3a3a4a"],
  "accent": "#f4d03f",
  "fg": "#eaeaea"
}
```

Visual translation:
- Background: blue-black night.
- Foreground: gold, wine red, silver, midnight blue, smoke gray.
- Accent: light gold (brighter than the base gold).

**Typical use**: executive presentation hero, premium documentation cover seal.

---

## Palette: `dense`

Dense, saturated, high visual density style. Focus on distinction between multiple categories.

```json
{
  "bg": "#f8f9fa",
  "foreground": ["#ff7a3e", "#00c6c6", "#e93f8f", "#a3d930", "#5b3fce"],
  "accent": "#1a1a2e",
  "fg": "#1a1a2e"
}
```

Visual translation:
- Background: ice white.
- Foreground: orange, cyan, magenta, lime, indigo.
- Accent: blue-black.

**Typical use**: documentation for a system with many components to distinguish; the seal covers multiple hues.

---

## Palette: `exploratory`

Exploratory, ethereal, luminous style. Focus on 3D and contemplation.

```json
{
  "bg": "#0d0d1a",
  "foreground": ["#ffb3ba", "#a0e7e5", "#c9b6e8", "#fff5b8", "#b8e0d2"],
  "accent": "#ffffff",
  "fg": "#eaeaea"
}
```

Visual translation:
- Background: deep violet-black.
- Foreground: aurora pink, glacier cyan, mist lilac, soft yellow, watery green.
- Accent: bright white.

**Typical use**: documentation with strong 3D-scene presence; the seal dialogues with the aesthetics of `arquitetura.html`.

---

## Palette `other` (fallback)

When the user chooses "Other" in the style menu and provides a freeform description, the skill maps the description to the closest palette, or applies a basic heuristic:

```javascript
function paletteFromFreeform(text) {
    const lower = text.toLowerCase();
    if (/(luxury|premium|cinematic|dark)/.test(lower)) return palettes.premium;
    if (/(technical|sober|clean|minimal)/.test(lower)) return palettes.sober;
    if (/(dense|saturated|colorful|vibrant)/.test(lower)) return palettes.dense;
    if (/(exploratory|3D|luminous|ethereal)/.test(lower)) return palettes.exploratory;
    return palettes.sober; // safe fallback
}
```

---

## Color distribution within the palette

Even with 5 colors in `foreground`, the seal does not use them all equally. Visual proportion rule:

| Position in palette | Visual proportion in seal |
|---|---|
| 1st color | 50% (dominant) |
| 2nd color | 25% (secondary) |
| 3rd color | 15% |
| 4th color | 7% |
| 5th color | 3% (trace) |

Patterns such as `flow-field` and `wave-interference` inherit this distribution automatically (color 1 appears in more particles).

Patterns such as `crystal-lattice` use colors in distinct layers, but the most visible layers (outer ones) use colors 1 and 2; inner layers use 3, 4, 5.

---

## Automatic adaptation for mini seal

In mini seals (<200px), the palette is simplified to only 3 colors:

```javascript
function simplifyForMini(palette) {
    return {
        ...palette,
        foreground: palette.foreground.slice(0, 3)
    };
}
```

Maintains legibility and visual impact even at reduced size.

---

## Contrast verification

Before rendering, verify that `accent` has sufficient contrast with `bg` for patterns that highlight the center (minimum ratio 4.5:1 per WCAG AA).

```javascript
function contrastRatio(hex1, hex2) {
    const lum = (hex) => {
        const { r, g, b } = hexToRgb(hex);
        const sRGB = [r, g, b].map((c) => {
            const v = c / 255;
            return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };
    const l1 = lum(hex1);
    const l2 = lum(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}
```

If contrast fails, replace `accent` with a lighter/darker version derived automatically.
