# Generative Seal Patterns

Catalog of the 5 established patterns produced by the `selo-generativo` skill. Each pattern has a distinct look, central algorithm, and parameters derived from the seed.

General seed pattern: the sha256 hash (64 hex chars) is sliced into 8-char chunks, each chunk becomes a `parseInt(slice, 16)` and feeds a different parameter. This way, different patterns from the same seed share a visual personality.

---

## 1. flow-field

Perlin flow fields: thousands of particles follow vectors derived from noise, leaving curved organic trails. "Natural turbulence" style.

**When it fits**: `sober` style (soft version) and `exploratory` (luminous version).

**Algorithm**:

```javascript
let particles = [];
const PARTICLE_COUNT = 500;
const NOISE_SCALE = 0.004;
const STEP = 1.5;

function setup() {
    const canvas = createCanvas(SIZE, SIZE);
    canvas.parent("seal-container");
    randomSeed(seedInt);
    noiseSeed(seedInt);
    background(palette.bg);
    noFill();
    strokeWeight(0.6);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: random(width),
            y: random(height),
            color: random(palette.foreground),
            life: random(200, 600)
        });
    }
    noLoop();
    drawFlowField();
}

function drawFlowField() {
    particles.forEach((p) => {
        stroke(p.color + "55"); // semi-transparent
        let x = p.x, y = p.y;
        for (let step = 0; step < p.life; step++) {
            const angle = noise(x * NOISE_SCALE, y * NOISE_SCALE) * TWO_PI * 4;
            const nx = x + cos(angle) * STEP;
            const ny = y + sin(angle) * STEP;
            line(x, y, nx, ny);
            x = nx;
            y = ny;
            if (x < 0 || x > width || y < 0 || y > height) break;
        }
    });
}
```

**Parameters derived from the seed**:
- `PARTICLE_COUNT`: 300 to 1000 (normalized slice 0).
- `NOISE_SCALE`: 0.002 to 0.008 (slice 1).
- Field center of gravity (if there is an attractor): XY coordinate (slices 2 and 3).

**Performance**: up to 1500 particles on an 800x800 canvas without freezing.

---

## 2. particle-orbit

Particles orbiting a center with fading trails, creating a "rotating constellation" pattern.

**When it fits**: `premium` style (dark, golden) and `exploratory` (luminous pastels).

**Algorithm**:

```javascript
const ORBITS = 6;
const PARTICLES_PER_ORBIT = 24;

function setup() {
    const canvas = createCanvas(SIZE, SIZE);
    canvas.parent("seal-container");
    randomSeed(seedInt);
    noiseSeed(seedInt);
    background(palette.bg);
    drawOrbit();
    noLoop();
}

function drawOrbit() {
    const cx = width / 2;
    const cy = height / 2;
    for (let o = 0; o < ORBITS; o++) {
        const radius = (o + 1) * (width / (ORBITS * 2.5));
        const orbitColor = palette.foreground[o % palette.foreground.length];
        const phase = random(TWO_PI);
        const tilt = random(-PI / 6, PI / 6);

        for (let p = 0; p < PARTICLES_PER_ORBIT; p++) {
            const angle = (p / PARTICLES_PER_ORBIT) * TWO_PI + phase;
            const x = cx + cos(angle) * radius;
            const y = cy + sin(angle) * radius * cos(tilt);
            const size = map(noise(angle * 2, o), 0, 1, 1, 6);

            // Trail
            stroke(orbitColor + "33");
            strokeWeight(0.4);
            noFill();
            arc(cx, cy, radius * 2, radius * 2 * cos(tilt), phase, angle);

            // Particle
            noStroke();
            fill(orbitColor);
            ellipse(x, y, size);
        }
    }

    // Center
    fill(palette.accent);
    noStroke();
    ellipse(cx, cy, 14);
}
```

**Parameters derived from the seed**:
- Number of orbits: 3 to 8 (slice 0).
- Orbit tilt: -π/4 to π/4 (slice 1).
- Particle density per orbit (slice 2).

**Performance**: trivial, dozens of elements.

---

## 3. crystal-lattice

Symmetric crystalline shape derived from a base polygon, with clean geometric subdivisions. "Architectural logo" style.

**When it fits**: `dense` style (saturated) and `sober` (clean).

**Algorithm**:

```javascript
function setup() {
    const canvas = createCanvas(SIZE, SIZE);
    canvas.parent("seal-container");
    randomSeed(seedInt);
    background(palette.bg);
    drawCrystal();
    noLoop();
}

function drawCrystal() {
    const cx = width / 2;
    const cy = height / 2;
    const sides = floor(random(5, 9)); // 5 to 8 sides
    const radius = width * 0.35;
    const layers = floor(random(3, 6));

    push();
    translate(cx, cy);

    for (let layer = layers; layer > 0; layer--) {
        const r = radius * (layer / layers);
        const rotation = (layers - layer) * (PI / sides);
        const color = palette.foreground[layer % palette.foreground.length];
        fill(color);
        stroke(palette.bg);
        strokeWeight(2);

        beginShape();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * TWO_PI + rotation;
            const x = cos(angle) * r;
            const y = sin(angle) * r;
            vertex(x, y);
        }
        endShape(CLOSE);
    }

    // Central core
    fill(palette.accent);
    noStroke();
    const coreRadius = radius * 0.15;
    beginShape();
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * TWO_PI;
        vertex(cos(angle) * coreRadius, sin(angle) * coreRadius);
    }
    endShape(CLOSE);

    pop();
}
```

**Parameters derived from the seed**:
- Number of sides: 5 to 8 (slice 0).
- Number of concentric layers: 3 to 6 (slice 1).
- Offset rotation between layers (slice 2).

**Exportable as SVG**: this pattern is purely geometric, ideal for conversion to real SVG for mini seals.

**Performance**: trivial.

---

## 4. wave-interference

Moire-like interference patterns: circular waves from multiple centers crossing each other, generating complex textures from simple rules.

**When it fits**: `premium` style (black + gold, high contrast) and `dense`.

**Algorithm**:

```javascript
function setup() {
    const canvas = createCanvas(SIZE, SIZE);
    canvas.parent("seal-container");
    randomSeed(seedInt);
    pixelDensity(1);
    background(palette.bg);
    drawInterference();
    noLoop();
}

function drawInterference() {
    const centers = [];
    const numCenters = floor(random(2, 5));
    for (let i = 0; i < numCenters; i++) {
        centers.push({
            x: random(width * 0.2, width * 0.8),
            y: random(height * 0.2, height * 0.8),
            frequency: random(0.04, 0.10),
            phase: random(TWO_PI)
        });
    }

    loadPixels();
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let value = 0;
            centers.forEach((c) => {
                const dx = x - c.x;
                const dy = y - c.y;
                const dist = sqrt(dx * dx + dy * dy);
                value += sin(dist * c.frequency + c.phase);
            });
            value = (value / centers.length + 1) / 2;

            const colorIdx = floor(value * palette.foreground.length);
            const hex = palette.foreground[constrain(colorIdx, 0, palette.foreground.length - 1)];
            const rgb = hexToRgb(hex);
            const i = (y * width + x) * 4;
            pixels[i] = rgb.r;
            pixels[i + 1] = rgb.g;
            pixels[i + 2] = rgb.b;
            pixels[i + 3] = 255;
        }
    }
    updatePixels();
}

function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16)
    };
}
```

**Parameters derived from the seed**:
- Number of centers: 2 to 4 (slice 0).
- Wave frequency: 0.04 to 0.10 (slice 1).
- Position of each center (slices 2-N).

**Performance**: O(width * height * centers). At 800x800 with 3 centers, ~1.9M operations. Fine for `noLoop()`.

---

## 5. noise-strata

Horizontal strata of noise, forming an "abstract landscape" with Perlin noise layers.

**When it fits**: `sober` styles (neutral terracotta) and `exploratory` (auroral).

**Algorithm**:

```javascript
function setup() {
    const canvas = createCanvas(SIZE, SIZE);
    canvas.parent("seal-container");
    randomSeed(seedInt);
    noiseSeed(seedInt);
    background(palette.bg);
    drawStrata();
    noLoop();
}

function drawStrata() {
    const layers = floor(random(4, 8));
    const baseY = height * 0.3;
    const layerHeight = (height - baseY) / layers;

    for (let l = 0; l < layers; l++) {
        const y0 = baseY + l * layerHeight;
        const color = palette.foreground[l % palette.foreground.length];
        fill(color);
        noStroke();
        beginShape();
        vertex(0, height);
        for (let x = 0; x <= width; x += 4) {
            const n = noise(x * 0.005, l * 0.7);
            const y = y0 + n * layerHeight * 1.5;
            vertex(x, y);
        }
        vertex(width, height);
        endShape(CLOSE);
    }

    // Decorative sun/moon
    fill(palette.accent);
    noStroke();
    const sunX = random(width * 0.2, width * 0.8);
    const sunY = baseY - random(20, 60);
    const sunR = random(30, 70);
    ellipse(sunX, sunY, sunR * 2);
}
```

**Parameters derived from the seed**:
- Number of layers: 4 to 8 (slice 0).
- Base horizon height: 25% to 40% of canvas (slice 1).
- Decorative sun/moon position (slices 2 and 3).

**Performance**: trivial.

---

## Pattern selection by seed

```javascript
const PATTERNS = ["flow-field", "particle-orbit", "crystal-lattice", "wave-interference", "noise-strata"];

function pickPattern(seedHex, styleHint) {
    const patternIndex = parseInt(seedHex.slice(0, 2), 16) % PATTERNS.length;
    let chosen = PATTERNS[patternIndex];

    // Soft adjustment by style (choose among "compatible" patterns if there is mismatch)
    if (styleHint && !isStyleCompatible(chosen, styleHint)) {
        chosen = pickCompatible(seedHex, styleHint);
    }
    return chosen;
}
```

The `pattern x style` compatibility appears at the beginning of this reference. When there is declared incompatibility, the `pickCompatible` function reevaluates among the patterns marked as appropriate for the style.

---

## Manual override

The skill accepts parameter `forcePattern` to ignore seed derivation and choose the pattern manually, useful when the user wants a specific seal in a style different from the default.
