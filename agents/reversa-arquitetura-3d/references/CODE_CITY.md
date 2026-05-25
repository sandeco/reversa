# Code City

A well-established 3D software visualization pattern: each project file is a **building**, grouped into **districts** that correspond to folders. It lets you grasp code size, complexity, and distribution at a glance.

## Attribute mapping

| Code attribute | Building visual attribute |
|---|---|
| Lines of code (LOC) | Height |
| Cyclomatic complexity | Base area (width x depth) |
| File folder | District (position on the plane) |
| File type (code, test, config) | Base color |
| Hot path (change frequency or dependents) | Highlight color (red/yellow) |

## When to use

- Initial high-level view of an unfamiliar project.
- Identify very large files (tall buildings) or complex ones (wide buildings).
- Detect grouping by folder (cohesive vs scattered districts).
- Executive presentation: visually impactful and intuitive.

**When to avoid**: small projects (< 30 files), where the urban metaphor is overkill. Use Dependency Graph 3D or 2D D3 modules.

## Layout algorithm

### 1. Group by folder

```javascript
const districts = {};
modules.forEach((m) => {
    if (!districts[m.folder]) districts[m.folder] = [];
    districts[m.folder].push(m);
});
```

### 2. Calculate the size of each district

The district area is proportional to the number of files. Use simple packing (row by row) or a squarified treemap.

```javascript
function packDistrict(modules, padding = 1) {
    const count = modules.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    return { cols, rows };
}
```

### 3. Position districts on the plane

The districts form the city. For up to ~20 folders, pack them into a simple grid. For more, use a treemap.

```javascript
const districtSize = (count) => Math.sqrt(count) * cellSize * 2;
let offsetX = 0;
let offsetZ = 0;
const districtPositions = {};
Object.entries(districts).forEach(([folder, mods], i) => {
    const size = districtSize(mods.length);
    districtPositions[folder] = { x: offsetX, z: offsetZ, size };
    offsetX += size + districtGap;
    if ((i + 1) % gridCols === 0) {
        offsetX = 0;
        offsetZ += size + districtGap;
    }
});
```

### 4. Position buildings within the district

```javascript
modules.forEach((m) => {
    const district = districtPositions[m.folder];
    const local = packDistrict(districts[m.folder]);
    const indexInDistrict = districts[m.folder].indexOf(m);
    const col = indexInDistrict % local.cols;
    const row = Math.floor(indexInDistrict / local.cols);
    m.x = district.x + col * cellSize;
    m.z = district.z + row * cellSize;
});
```

### 5. Size each building

```javascript
const LOC_TO_HEIGHT = 0.4;      // 1000 LOC = 400 height units
const COMPLEXITY_TO_WIDTH = 0.8;
const MIN_W = 2;
const MIN_H = 1;

modules.forEach((m) => {
    m.height = Math.max(MIN_H, m.loc * LOC_TO_HEIGHT);
    const baseW = Math.max(MIN_W, Math.sqrt(m.complexity) * COMPLEXITY_TO_WIDTH);
    m.w = baseW;
    m.d = baseW;
});
```

### 6. Render with InstancedMesh

See `THREE_PATTERNS.md` for the InstancedMesh pattern. Each building is an instance of the same BoxGeometry, with a distinct matrix and color.

```javascript
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
boxGeo.translate(0, 0.5, 0); // base on the ground
const mat = new THREE.MeshStandardMaterial({ roughness: 0.6 });
const buildings = new THREE.InstancedMesh(boxGeo, mat, modules.length);
buildings.castShadow = true;
buildings.receiveShadow = true;

const dummy = new THREE.Object3D();
const color = new THREE.Color();

modules.forEach((m, i) => {
    dummy.position.set(m.x, 0, m.z);
    dummy.scale.set(m.w, m.height, m.d);
    dummy.updateMatrix();
    buildings.setMatrixAt(i, dummy.matrix);
    color.set(colorForModule(m));
    buildings.setColorAt(i, color);
});
buildings.instanceMatrix.needsUpdate = true;
buildings.instanceColor.needsUpdate = true;
scene.add(buildings);
```

### 7. Ground and districts

Add a large plane as the ground and colored squares marking each district.

```javascript
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshStandardMaterial({ color: 0x14141a, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

Object.entries(districtPositions).forEach(([folder, d]) => {
    const districtPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(d.size, d.size),
        new THREE.MeshStandardMaterial({ color: districtColor(folder), transparent: true, opacity: 0.15 })
    );
    districtPlane.rotation.x = -Math.PI / 2;
    districtPlane.position.set(d.x + d.size / 2, 0.01, d.z + d.size / 2);
    scene.add(districtPlane);
});
```

## Colors by file type

```javascript
const TYPE_COLORS = {
    code:    0x4a9eff,  // blue
    test:    0x6cc46c,  // green
    config:  0xffc857,  // yellow
    doc:     0xb39ddb,  // lilac
    style:   0xff9aa2,  // pink
    asset:   0x999999   // gray
};

function colorForModule(m) {
    if (m.isHotPath) return 0xff5a4f;
    return TYPE_COLORS[m.type] || 0xcccccc;
}
```

## Control sidebar (Code City)

```html
<aside id="sidebar">
    <h3>Code City</h3>

    <label>Height (LOC)
        <input type="range" min="0.1" max="2.0" step="0.1" value="0.4" data-param="locScale">
    </label>

    <label>Base (complexity)
        <input type="range" min="0.2" max="2.0" step="0.1" value="0.8" data-param="complexityScale">
    </label>

    <label>Hot path threshold
        <input type="range" min="0" max="100" step="5" value="50" data-param="hotPathThreshold">
    </label>

    <label>
        <input type="checkbox" data-param="showLabels" checked> Visible labels
    </label>

    <label>
        <input type="checkbox" data-param="showDistricts" checked> Show districts
    </label>

    <label>Filter folder
        <select data-param="folderFilter">
            <option value="all">All</option>
            <!-- POPULATED_FROM_DATA -->
        </select>
    </label>

    <button id="reset">Reset</button>
    <button id="export-png">Export PNG</button>
</aside>
```

When a slider changes, recalculate `m.height`, `m.w`, `m.d` and update the `InstancedMesh` with new matrices.

## Interaction

- **Hover over building**: tooltip shows file name, LOC, complexity, folder.
- **Click building**: focuses the camera on the building (animate `controls.target` to the building position).
- **Drag over district**: rotates the camera with OrbitControls.
- **Scroll**: zoom in/out.

## Performance

- Up to **5,000 buildings** is safe with InstancedMesh.
- Above that, group files by folder (one building = one folder with aggregated LOC height, area by number of files).
- Disable shadows if framerate drops below 30fps (detect via `requestAnimationFrame` timer).

## Optional variants

- **Temporal Code City**: animate growth throughout the project history (each commit makes buildings grow).
- **Code City colored by author**: colors indicate who the primary maintainer of each file is.
- **Code City with rain**: hot paths receive a falling red particle effect, indicating "instability".

These variants are left for future versions of the skill.
