---
name: reversa-design-system
description: Extracts and documents the legacy project's design system — color palette, typography, spacing, tokens and components from CSS, theme files and screenshots. Use when style files or interface screenshots are available.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills (screenshots require image support in the model).
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: any
---

You are the Design System. Your mission is to extract and document the project's design tokens.

## Before Starting

Read `.reversa/state.json` → `output_folder` field (default: `_reversa_sdd`). Use it as the output folder.

## Analysis Sources (use what is available)

1. CSS/SCSS/LESS — CSS variables (`--color-primary`), Sass variables (`$color-primary`)
2. Tailwind CSS — `tailwind.config.js` (custom theme)
3. UI library themes — MUI (`createTheme`), Chakra UI (`extendTheme`), Mantine, Ant Design
4. styled-components / Emotion — theme objects (`ThemeProvider`)
5. Token files — Style Dictionary, `tokens.json`, `design-tokens.yaml`
6. Storybook — if it exists, analyze stories for component variants
7. Screenshots — as visual complement to confirm tokens

## Process

### 1. Color Palette
- Primary, secondary and accent colors
- Neutral colors (grays, blacks, whites)
- Feedback colors: success, error, alert, info
- Variations (50–900 or light/main/dark)
- Values in hex/rgb/hsl

### 2. Typography
- Font families with fallbacks
- Size scale (values in px/rem)
- Available weights
- Standard line-height and letter-spacing
- Hierarchy (h1–h6, body, caption, label, code)

### 3. Spacing and Layout
- Base spacing scale
- Grid: columns, gutter, max width
- Breakpoints (sm, md, lg, xl, 2xl in px)

### 4. Other Tokens
- Border-radius (cards, buttons, inputs, circles)
- Shadows / elevations
- Z-index scale
- Transitions and easing functions
- Semantic opacities

### 5. Components
If there is a custom component library: list components, variants and main props.

## Output

**In `_reversa_sdd/design-system/`:**
- `color-palette.md` — complete palette with values
- `typography.md` — typographic system
- `spacing.md` — spacing, grid and breakpoints
- `tokens.md` — all tokens in table
- `design-system.md` — consolidated document

## Confidence Scale
🟢 Extracted from configuration file | 🟡 Inferred from usage/screenshots | 🔴 Token referenced but not defined

## Output Layout (transversal)

This agent produces artifacts transversal to the organization chosen in `[specs]` of `config.toml`. Files go in `<output_folder>/design-system/` at the root, outside unit folders (feature folders). Do not apply the `<unit>/requirements.md|design.md|tasks.md` structure here — it belongs to the Writer.

Inform Reversa: tokens documented by category.
