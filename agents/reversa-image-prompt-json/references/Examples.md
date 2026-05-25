# Reference Examples — Image Prompt Builder

These examples demonstrate the language pattern and structure expected in generated prompts.

---

## Example 1 — Dessert (Lava Cake)

```json
{
  "master_prompt": {
    "scene_type": "high-speed cinematic luxury dessert photography",
    "product": {
      "type": "ultra-premium molten chocolate lava cake",
      "brand_name": "no visible branding",
      "appearance": "perfectly baked dark chocolate fondant with slightly cracked top and rich molten dark chocolate core flowing smoothly",
      "accompaniments": [
        "quenelle of vanilla bean ice cream",
        "fresh raspberries with natural gloss",
        "mint micro-leaves for elegance"
      ]
    },
    "composition": {
      "action": "dramatic molten chocolate burst captured mid-flow as cake is gently sliced",
      "surrounding_elements": [
        "cocoa powder dust explosion frozen mid-air",
        "dark chocolate shards suspended dynamically",
        "gold flakes subtly dispersing",
        "raspberry juice droplets captured in motion"
      ],
      "placement": "centered hero dessert on matte black stone plate with subtle reflection on polished marble surface"
    },
    "lighting": {
      "style": "luxury studio dessert lighting",
      "effects": [
        "soft rim lighting outlining cake texture",
        "warm directional key light enhancing molten gloss",
        "gentle top light defining ice cream texture",
        "subtle backlight for cinematic depth and separation"
      ]
    },
    "color_palette": {
      "background": "deep charcoal fading into warm amber bokeh",
      "accents": "rich dark chocolate brown, creamy ivory, vibrant raspberry red, matte black, subtle gold highlights"
    },
    "technical_specs": {
      "camera": "macro lens, slight low angle for premium dominance",
      "shutter": "ultra-fast freeze-motion capture",
      "depth_of_field": "shallow focus on molten center, soft blur on suspended particles",
      "rendering_style": "ultra-photorealistic texture detailing"
    },
    "output_specs": {
      "resolution": "4K",
      "aspect_ratio": "16:9",
      "model": "nano-banana-2",
      "synthid_watermark": true
    }
  }
}
```

---

## Example 2 — Drink (Shake)

```json
{
  "master_prompt": {
    "scene_type": "high-speed commercial luxury shake photography",
    "product": {
      "type": "elegant frosted glass bottle filled with velvety strawberry shake",
      "brand_name": "ROSE VELVET",
      "appearance": "minimalist vertical blush label with embossed rose-gold serif typography, creamy pastel pink liquid with natural strawberry swirls",
      "accompaniments": [
        "fresh strawberry halves with visible seeds and juicy texture",
        "soft dusting of powdered sugar diffusing delicately"
      ]
    },
    "composition": {
      "action": "dynamic high-velocity creamy splash explosion",
      "surrounding_elements": [
        "sculptural waves of thick strawberry shake splashing outward",
        "silky ribbons of strawberry puree suspended mid-air",
        "floating fresh strawberry halves with visible seeds",
        "fine droplets of creamy pink mist catching the light"
      ],
      "placement": "centered hero bottle with a crisp reflection on a polished white marble surface"
    },
    "lighting": {
      "style": "luxury glossy studio product lighting",
      "effects": [
        "sharp rim lighting to define bottle silhouette",
        "brilliant highlights on creamy splashes and glossy strawberry surfaces",
        "soft rosy glow in the background for warmth and elegance"
      ]
    },
    "color_palette": {
      "background": "smooth gradient of blush pink fading into soft champagne ivory",
      "accents": "fresh strawberry red, rose gold, and creamy vanilla tones"
    },
    "technical_specs": {
      "camera": "macro lens, eye-level angle",
      "shutter": "ultra-fast freeze-motion capture",
      "depth_of_field": "shallow focus on the label, gentle blur on dynamic splash elements",
      "rendering_style": "ultra-photorealistic texture"
    },
    "output_specs": {
      "resolution": "4K",
      "aspect_ratio": "1:1",
      "model": "nano-banana-2",
      "synthid_watermark": true
    }
  }
}
```

---

## Required language patterns

| Field | Expected pattern |
|---|---|
| `type` | premium adjective + material + product name |
| `action` | impact verb + frozen motion + context |
| `surrounding_elements` | visual noun + motion/texture detail |
| `placement` | `centered hero [product] on [surface] with [reflection]` |
| `lighting.effects` | rim / key / top or back / optional extra |
| `background` | main color + transition + effect (bokeh, gradient...) |
| `rendering_style` | realism descriptor or visual style |
| `resolution` | `512px` / `1K` / `2K` / `4K` |
| `aspect_ratio` | `1:1` / `16:9` / `9:16` / `4:3` / `3:4` / `4:1` / `1:4` / `8:1` / `1:8` |
| `model` | always `"nano-banana-2"` |
| `synthid_watermark` | always `true` |
