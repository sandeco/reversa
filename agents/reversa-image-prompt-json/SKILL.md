---
name: reversa-image-prompt-json
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI, and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  team: shared-skills
  role: image-prompt-builder
description: >
  Creates structured JSON prompts for high-quality image generation with a luxurious,
  cinematic aesthetic. Use this skill whenever the user wants to generate an image prompt,
  create a product photo, build a prompt for image AI, photograph a product virtually,
  create an image of food, drink, cosmetics, jewelry, fashion, or any visual
  item. It should also be activated when the user mentions: "image prompt",
  "generate product image", "AI product photo", "prompt for Midjourney/DALL-E/Flux",
  "photograph product", or asks to "build an image JSON prompt".
---

# Image Prompt Builder

Skill for building structured JSON prompts for product image generation with a
cinematic, luxurious aesthetic — optimized for **Nano Banana 2 (Gemini 3.1 Flash Image)**
via **Google Antigravity**, with support for all native model parameters.

---

## Required flow

When activated, this skill must **ALWAYS** follow these steps in order:

1. **Guided interview** — Collect user information in blocks
2. **Confirmation** — Show a summary and ask for approval
3. **JSON generation** — Build the final structured prompt

---

## STEP 1 — Guided interview by blocks

Collect the information in **3 rounds of questions**, never all at once.

---

### Round 1 — Product and Scene

Ask the user:

> "Let's build your image prompt! I need to understand the product first. Tell me:"

1. **Product type**: What is the product? (e.g. chocolate cake, perfume bottle, sneakers, shake, jewelry...)
2. **Brand name**: Is there visible branding? If so, what is the name?
3. **Product appearance**: Describe the color, texture, finish, shape. The more detail, the better.
4. **Extra elements**: Are there accompaniments? (fruits, ice, flowers, leaves, reflections...)
5. **Scene type**: What is the overall mood of the image?
   - Suggested options: luxurious and cinematic / clean and minimalist / dramatic and high-contrast / warm and cozy / futuristic and technological

---

### Round 2 — Composition and Action

> "Great! Now tell me about the dynamic visual side of the image:"

6. **Main action**: Is the product static or in motion? (e.g. liquid exploding, suspended particles, smoke, splash, cut revealing the inside...)
7. **Elements suspended in the air**: Which elements fly around the product? (e.g. droplets, powder, fragments, leaves, crystals, bubbles...)
8. **Support surface**: Where is the product placed? (e.g. polished white marble, matte black stone, rustic wood, transparent glass, abstract surface...)
9. **Camera angle**: How is the camera filming the product?
   - Options: low angle (dominance) / eye level / slightly above / extreme macro / 3/4 angle

---

### Round 3 — Lighting, Colors, and Technical Specifications

> "Almost there! Now the visual and technical part:"

10. **Lighting style**: How do you want the light?
    - Options: clean bright studio / dramatic with shadows / soft natural light / luxury product light with rim light / colorful neon light

11. **Background color palette**: Which color/gradient dominates the background? (e.g. charcoal black with amber bokeh, pink-to-champagne gradient, dark blue to white...)

12. **Accent colors**: Which colors appear in the surrounding elements? (e.g. gold, silver, vivid red, pastel tones...)

13. **Resolution**: What quality level do you need?
    - `512px` — fast iteration / tests
    - `1K` — social media and digital use
    - `2K` — professional content
    - `4K` — maximum production / print

14. **Aspect Ratio**: What is the image ratio? (default: `16:9`)
    - `16:9` — widescreen (default) ✅
    - `1:1` — square (Instagram feed)
    - `9:16` — vertical (Stories, Reels, TikTok)
    - `4:3` — classic
    - `3:4` — portrait
    - `4:1` / `1:4` — horizontal / vertical banner
    - `8:1` / `1:8` — super banner

15. **Rendering style**: Ultra-detailed photorealistic / illustration / 3D render / analog photo / other?

16. **Anything else?**: Any special detail you want to guarantee in the image?

---

## STEP 2 — Confirmation

After collecting all answers, show a **bullet-point summary** for the user to confirm:

```
📋 PROMPT SUMMARY:
- Product: [type] — [brand]
- Appearance: [description]
- Scene: [type]
- Action: [description]
- Suspended elements: [list]
- Surface: [description]
- Angle: [angle]
- Lighting: [style]
- Background: [colors]
- Accents: [colors]
- Resolution: [e.g. 2K]
- Aspect Ratio: [e.g. 1:1]
- Rendering: [e.g. ultra-photorealistic]

Is this correct? Can I build the JSON prompt now?
```

Only proceed to Step 3 after user confirmation.

---

## STEP 3 — JSON generation

With the confirmed answers, build the prompt following **exactly** this schema:

```json
{
  "master_prompt": {
    "scene_type": "[speed/style] [niche] photography",
    "product": {
      "type": "[rich, adjective-heavy description of the product]",
      "brand_name": "[brand name or 'no visible branding']",
      "appearance": "[color, texture, shape, finish described in detail]",
      "accompaniments": [
        "[element 1 with sensory description]",
        "[element 2 with sensory description]"
      ]
    },
    "composition": {
      "action": "[central dramatic action captured in motion]",
      "surrounding_elements": [
        "[suspended element 1 with motion detail]",
        "[suspended element 2 with motion detail]",
        "[suspended element 3 with motion detail]"
      ],
      "placement": "[centered hero positioning on the specified surface]"
    },
    "lighting": {
      "style": "[complete lighting style]",
      "effects": [
        "[rim light effect]",
        "[key light effect]",
        "[backlight or top light effect]",
        "[extra effect if needed]"
      ]
    },
    "color_palette": {
      "background": "[background gradient/bokeh with transition description]",
      "accents": "[list of accent colors separated by commas]"
    },
    "technical_specs": {
      "camera": "[lens type], [chosen angle]",
      "shutter": "[capture type — freeze-motion, long exposure, etc.]",
      "depth_of_field": "[main focus], [blur description]",
      "rendering_style": "[photorealistic / illustration / 3D render / analog photo / etc.]"
    },
    "output_specs": {
      "resolution": "[512px | 1K | 2K | 4K]",
      "aspect_ratio": "16:9",
      "model": "nano-banana-2",
      "synthid_watermark": true
    }
  }
}
```

---

## JSON quality rules

- **Luxury and premium adjectives** are mandatory in every descriptive field
- **Frozen motion** must always be present in `action` and `surrounding_elements`
- **Reflective surfaces** must be mentioned in `placement`
- The product is always the **centered hero** of the scene
- `surrounding_elements` must have **minimum 3, maximum 6 items**
- `lighting.effects` must **always have 3 or 4 effects** (rim, key, back/top + optional extra)
- `scene_type` must follow the pattern: `"[speed/style adjective] [niche] photography"`
- `output_specs.resolution` must use Nano Banana 2 native values: `512px`, `1K`, `2K`, or `4K`
- `output_specs.aspect_ratio` must use values natively supported by the model
- `output_specs.model` must always be `"nano-banana-2"`
- `output_specs.synthid_watermark` must always be `true` (Google-required default)

---

## After generating the JSON

Present the formatted JSON in a code block and add:

> 💡 **Antigravity usage tip:** Paste this JSON directly into the Nano Banana 2 prompt field in Google Antigravity. The `output_specs` fields are interpreted natively by the model — no additional prefix is required.

Ask whether the user wants to adjust any field, change the aspect ratio, or generate variations.

---

## Reference examples

For inspiration on language patterns, consult `/mnt/skills/user/image-prompt-builder/references/examples.md` if available.
