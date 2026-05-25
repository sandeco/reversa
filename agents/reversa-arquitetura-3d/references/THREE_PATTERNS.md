# Three.js Patterns for Architecture Visualization

Quick reference for setup, materials, and techniques common to all skill modes. Three.js v0.158+, ESM via CDN.

---

## Base scene setup

```javascript
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js";

const container = document.getElementById("scene-container");
const width = container.clientWidth;
const height = container.clientHeight;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a14);
scene.fog = new THREE.Fog(0x0a0a14, 100, 800);

// Camera
const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
camera.position.set(150, 200, 300);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 20;
controls.maxDistance = 1500;
```

## Default lighting

```javascript
// Light ambient light so shadows are not completely black
const ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambient);

// Hemisphere: sky vs ground, gives natural depth
const hemi = new THREE.HemisphereLight(0xddeeff, 0x202028, 0.5);
hemi.position.set(0, 200, 0);
scene.add(hemi);

// Directional: simulates sun, casts shadows
const dir = new THREE.DirectionalLight(0xffffff, 0.85);
dir.position.set(80, 200, 100);
dir.castShadow = true;
dir.shadow.mapSize.set(2048, 2048);
dir.shadow.camera.left = -400;
dir.shadow.camera.right = 400;
dir.shadow.camera.top = 400;
dir.shadow.camera.bottom = -400;
scene.add(dir);
```

## Rendering loop

```javascript
function tick() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
}
tick();
```

## Resize handler

```javascript
window.addEventListener("resize", () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
});
```

## InstancedMesh for large volumes

When there are more than 200 elements of the same type (Code City buildings, dep graph nodes), use `InstancedMesh` instead of a loop with `add()`.

```javascript
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const instanced = new THREE.InstancedMesh(boxGeo, mat, modules.length);

const dummy = new THREE.Object3D();
const colorObj = new THREE.Color();

modules.forEach((m, i) => {
    dummy.position.set(m.x, m.height / 2, m.z);
    dummy.scale.set(m.w, m.height, m.d);
    dummy.updateMatrix();
    instanced.setMatrixAt(i, dummy.matrix);
    colorObj.set(m.color);
    instanced.setColorAt(i, colorObj);
});
instanced.instanceMatrix.needsUpdate = true;
if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
scene.add(instanced);
```

## Labels in CSS2D (always readable)

```javascript
import { CSS2DRenderer, CSS2DObject } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/renderers/CSS2DRenderer.js";

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(width, height);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0";
labelRenderer.domElement.style.pointerEvents = "none";
container.appendChild(labelRenderer.domElement);

function addLabel(text, position) {
    const div = document.createElement("div");
    div.className = "label-3d";
    div.textContent = text;
    const label = new CSS2DObject(div);
    label.position.copy(position);
    return label;
}
```

In `tick()`, call `labelRenderer.render(scene, camera)` together with the main renderer.

**Rule**: show labels only when the node is close to the camera (distance < threshold) or on hover, to avoid clutter.

## Raycaster for hover and click

```javascript
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

renderer.domElement.addEventListener("pointermove", (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(instanced);
    if (hits.length > 0) {
        const i = hits[0].instanceId;
        showTooltip(modules[i]);
    } else {
        hideTooltip();
    }
});
```

## Reactive sidebar

```javascript
const sliders = document.querySelectorAll("aside input[type=range]");
sliders.forEach((slider) => {
    slider.addEventListener("input", (e) => {
        const param = e.target.dataset.param;
        const value = parseFloat(e.target.value);
        applyParam(param, value); // mode-specific function
        localStorage.setItem(`arq3d.${param}`, value);
    });
    // restore
    const saved = localStorage.getItem(`arq3d.${slider.dataset.param}`);
    if (saved !== null) {
        slider.value = saved;
        slider.dispatchEvent(new Event("input"));
    }
});
```

## Export PNG

```javascript
document.getElementById("export-png").addEventListener("click", () => {
    renderer.render(scene, camera); // ensure current frame
    renderer.domElement.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "arquitetura-3d.png";
        a.click();
        URL.revokeObjectURL(url);
    });
});
```

## Dispose when switching modes

```javascript
function clearScene() {
    scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
            else obj.material.dispose();
        }
    });
    while (scene.children.length > 0) scene.remove(scene.children[0]);
}
```

## Performance: practical limits

| Scenario | Safe limit | Above that |
|---|---|---|
| Independent BoxGeometry | 200 | Migrate to InstancedMesh |
| Cube InstancedMesh | 5,000 | Apply grouping by folder |
| Lines (LineSegments) | 10,000 segments | Use Line2 (fat lines) or group |
| Sprites/CSS2D labels | 100 visible | Show only on hover or proximity |
| Textured polygons | 50,000 tris | Reduce LOD or disable shadows |
