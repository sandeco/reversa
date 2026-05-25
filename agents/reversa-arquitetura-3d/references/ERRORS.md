# Error Scenarios and Handling

Catalog of common errors in the `arquitetura-3d` skill and how to handle them to preserve the user experience.

---

## ERR-01: Three.js unavailable (CDN unreachable)

**Cause**: the user is offline on the first run, or the CDN is blocked by a corporate firewall.

**Detection**: the `<script type="module">` script fails to import, or `THREE` remains `undefined` after loading.

**Handling**:

```javascript
try {
    const mod = await import("https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js");
    window.THREE = mod;
} catch (e) {
    document.getElementById("loader").innerHTML = `
        <div class="error-panel">
            <h2>Could not load the 3D library</h2>
            <p>This visualization requires internet access to download Three.js once.
               Connect to the internet and reload the page.</p>
            <p>Technical detail: ${e.message}</p>
        </div>`;
    return;
}
```

Text always in pt-br, without em dashes.

---

## ERR-02: WebGL not supported

**Cause**: browser without WebGL (very rare today, but possible in old VMs or restricted corporate environments).

**Detection**: `new THREE.WebGLRenderer()` throws an exception or returns `null`.

**Handling**:

```javascript
let renderer;
try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (e) {
    showFallback("WebGL is not available in your browser. Use an up-to-date Chrome, Firefox, or Edge.");
    return;
}
```

Fallback displays a static version of the scene (pre-rendered screenshot if available, or symbolic ASCII art) with a clear message.

---

## ERR-03: Malformed JSON

**Cause**: `modules.json` or `deps.json` has invalid syntax, or expected fields are missing.

**Detection**: `JSON.parse` fails, or schema validation indicates missing fields.

**Handling**:

```javascript
function loadData() {
    const raw = document.getElementById("data").textContent;
    let data;
    try {
        data = JSON.parse(raw);
    } catch (e) {
        showError("Invalid input data: malformed JSON file. " + e.message);
        return null;
    }

    if (!Array.isArray(data.modules)) {
        showError("Invalid input data: 'modules' must be a list.");
        return null;
    }

    data.modules = data.modules.filter((m) => {
        if (!m.name) {
            console.warn("Module without 'name' discarded:", m);
            return false;
        }
        return true;
    });

    return data;
}
```

Non-fatal errors (a single bad module) discard the item with a warning. Fatal errors (invalid root structure) show a clear message.

---

## ERR-04: Empty project or no visualizable data

**Cause**: `modules.json` has 0 items, or `deps.json` has 0 edges, or both.

**Detection**: item count after `loadData()`.

**Handling**:

```javascript
if (data.modules.length === 0) {
    showEmptyState({
        title: "Nothing to visualize yet",
        message: "The project has no detected modules. Run `/reversa` first to extract the structure.",
        actions: [
            { label: "Back to documentation", href: "index.html" }
        ]
    });
    return;
}
```

Friendly empty state, never a silent blank scene.

---

## ERR-05: Project too large (>5,000 modules without grouping)

**Cause**: the user forces Code City mode without grouping on a huge project.

**Detection**: `data.modules.length > 5000` and no grouping strategy enabled.

**Handling**: apply grouping automatically and notify the user.

```javascript
if (data.modules.length > 5000) {
    showToast("Large project detected (" + data.modules.length + " files). Grouping by folder to preserve performance.");
    data.modules = groupByFolder(data.modules);
    config.grouped = true;
}
```

The grouping and its impact appear in the page's persistent footer: "Visualization grouped by folder. Each block represents N files."

---

## ERR-06: Degraded performance (fps < 30)

**Cause**: weak hardware, project at the upper limit, heavy shadows.

**Detection**: measure `requestAnimationFrame` delta.

```javascript
let frameTimes = [];
function measureFps(time) {
    frameTimes.push(time);
    if (frameTimes.length > 60) frameTimes.shift();
    if (frameTimes.length === 60) {
        const fps = 1000 / ((frameTimes[59] - frameTimes[0]) / 59);
        if (fps < 30 && !config.degraded) {
            degradeQuality();
        }
    }
}
```

**Progressive handling** (`degradeQuality`):

1. Disable shadows.
2. Reduce pixelRatio to 1.
3. Reduce the number of particles in tours.
4. Show toast: "Performance mode enabled".

---

## ERR-07: InstancedMesh limit exceeded

**Cause**: attempt to create an InstancedMesh with more instances than the hardware supports (around ~65k on older hardware via Uint16, but rare).

**Detection**: Three.js console error after `setMatrixAt` for high indices.

**Handling**:

```javascript
const MAX_INSTANCES = 32768;
if (modules.length > MAX_INSTANCES) {
    showWarning("Instance limit exceeded. Showing only the top " + MAX_INSTANCES + " largest items.");
    modules = modules.sort((a, b) => b.loc - a.loc).slice(0, MAX_INSTANCES);
}
```

---

## ERR-08: Infinite dependency cycle during layout

**Cause**: graph with a closed cycle and iterative layout without a stop criterion.

**Detection**: measure simulation iterations; if it exceeds `MAX_SIM_FRAMES` without converging, abort.

**Handling**: stop the simulation at the frame limit, show warning "Layout did not converge, positions may not reflect ideal stability", draw it anyway.

---

## ERR-09: WebGL context lost

**Cause**: inactive tab for too long, graphics driver switch, overloaded GPU.

**Detection**: `webglcontextlost` event on the canvas.

**Handling**:

```javascript
renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    showToast("3D context was lost. Trying to recover...");
});

renderer.domElement.addEventListener("webglcontextrestored", () => {
    rebuildScene();
    showToast("Context recovered.");
});
```

Instead of reloading the page, rebuild the scene on the same canvas. Important: call `rebuildScene()` to recreate textures and buffers.

---

## ERR-10: Corrupted sidebar localStorage

**Cause**: old localStorage data with an incompatible format after a skill update.

**Detection**: `JSON.parse` fails when restoring state, or the value is outside the expected slider range.

**Handling**: silent, discard and use the default.

```javascript
function loadSliderState(slider) {
    try {
        const saved = localStorage.getItem(`arq3d.${slider.dataset.param}`);
        if (saved !== null) {
            const value = parseFloat(saved);
            if (value >= slider.min && value <= slider.max) {
                slider.value = value;
            }
        }
    } catch (e) {
        // ignore and keep default value
    }
}
```

---

## Utility function: showError + showWarning + showToast

```javascript
function showError(message) {
    const panel = document.createElement("div");
    panel.className = "reversa-error-panel";
    panel.innerHTML = `<h2>Error</h2><p>${escapeHtml(message)}</p>`;
    document.body.appendChild(panel);
}

function showWarning(message) {
    const panel = document.createElement("div");
    panel.className = "reversa-warning-banner";
    panel.textContent = message;
    document.body.appendChild(panel);
    setTimeout(() => panel.remove(), 8000);
}

function showToast(message) {
    const t = document.createElement("div");
    t.className = "reversa-toast";
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
```

Styles `reversa-error-panel`, `reversa-warning-banner`, and `reversa-toast` live in the mini-site shared CSS.

---

## General principle

No error should ever result in a **silent blank screen**. Always show a clear message in pt-br with an actionable instruction or a clear indication of the limitation. Messages should be short, without framework jargon, without em dashes.
