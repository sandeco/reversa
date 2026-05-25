# Dependency Graph 3D

Directed dependency graph between modules visualized in 3D, with force simulation (attraction between connected nodes, repulsion between unconnected ones) that distributes the graph organically through space.

## Mapping

| Code attribute | Node visual attribute |
|---|---|
| Module | Sphere or icon |
| Size (LOC or number of dependents) | Sphere radius |
| Module type | Color |
| Folder | Secondary color or nearby cluster |
| Edge = `imports/requires` | Directed curved line (with arrow) |
| Edge weight (usage frequency) | Line thickness |

## When to use

- Detect **high coupling** (highly connected nodes stay at the center of the cluster).
- Identify **central modules** (high fan-in) and **isolated modules**.
- Visualize **dependency cycles** (visible loops in the simulation).
- Compare cohesion between folders (modules from the same folder should stay close together).

**When to avoid**: projects with more than ~300 modules, where the graph becomes an unreadable hairball. Use Code City or group by folder.

## Layout algorithm: 3D force

D3-force-like simulation adapted to three dimensions. Runs in a loop until it stabilizes, then freezes.

```javascript
const nodes = deps.nodes.map((n) => ({
    id: n.id,
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 200,
    z: (Math.random() - 0.5) * 200,
    vx: 0, vy: 0, vz: 0,
    fx: 0, fy: 0, fz: 0,
    mass: 1 + (n.loc ?? 0) / 100
}));

const edges = deps.edges.map((e) => ({
    source: nodes.find((n) => n.id === e.from),
    target: nodes.find((n) => n.id === e.to),
    weight: e.weight ?? 1
}));

const REPULSION = 800;
const ATTRACTION = 0.04;
const CENTER_GRAVITY = 0.002;
const DAMPING = 0.85;

function simulationStep() {
    nodes.forEach((n) => { n.fx = 0; n.fy = 0; n.fz = 0; });

    // Repulsion between all pairs
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j];
            const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
            const distSq = dx * dx + dy * dy + dz * dz + 0.1;
            const dist = Math.sqrt(distSq);
            const force = REPULSION / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            const fz = (dz / dist) * force;
            a.fx -= fx; a.fy -= fy; a.fz -= fz;
            b.fx += fx; b.fy += fy; b.fz += fz;
        }
    }

    // Attraction along the edges
    edges.forEach((e) => {
        const dx = e.target.x - e.source.x;
        const dy = e.target.y - e.source.y;
        const dz = e.target.z - e.source.z;
        const f = ATTRACTION * e.weight;
        e.source.fx += dx * f; e.source.fy += dy * f; e.source.fz += dz * f;
        e.target.fx -= dx * f; e.target.fy -= dy * f; e.target.fz -= dz * f;
    });

    // Gravity toward the center
    nodes.forEach((n) => {
        n.fx -= n.x * CENTER_GRAVITY;
        n.fy -= n.y * CENTER_GRAVITY;
        n.fz -= n.z * CENTER_GRAVITY;
    });

    // Integrate
    nodes.forEach((n) => {
        n.vx = (n.vx + n.fx / n.mass) * DAMPING;
        n.vy = (n.vy + n.fy / n.mass) * DAMPING;
        n.vz = (n.vz + n.fz / n.mass) * DAMPING;
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;
    });
}
```

For large graphs (>200 nodes), replace O(n²) repulsion with an **octree (Barnes-Hut)** to reduce it to O(n log n).

## Node rendering

Use `InstancedMesh` of spheres for up to 1,000 nodes; above that, use billboards with sprites.

```javascript
const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
const sphereMat = new THREE.MeshStandardMaterial({ roughness: 0.4 });
const nodeMesh = new THREE.InstancedMesh(sphereGeo, sphereMat, nodes.length);
nodeMesh.castShadow = true;

const dummy = new THREE.Object3D();
const color = new THREE.Color();

function updateNodes() {
    nodes.forEach((n, i) => {
        dummy.position.set(n.x, n.y, n.z);
        const radius = 1 + Math.sqrt(n.mass) * 0.5;
        dummy.scale.set(radius, radius, radius);
        dummy.updateMatrix();
        nodeMesh.setMatrixAt(i, dummy.matrix);
        color.set(colorForNode(n));
        nodeMesh.setColorAt(i, color);
    });
    nodeMesh.instanceMatrix.needsUpdate = true;
    nodeMesh.instanceColor.needsUpdate = true;
}
```

## Edge rendering

3D curved lines using `BufferGeometry` with `LineSegments`, or `TubeGeometry` for edges with volume.

```javascript
const edgePositions = new Float32Array(edges.length * 6);
const edgeGeo = new THREE.BufferGeometry();
edgeGeo.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));
const edgeMat = new THREE.LineBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.4 });
const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
scene.add(edgeLines);

function updateEdges() {
    edges.forEach((e, i) => {
        edgePositions[i * 6 + 0] = e.source.x;
        edgePositions[i * 6 + 1] = e.source.y;
        edgePositions[i * 6 + 2] = e.source.z;
        edgePositions[i * 6 + 3] = e.target.x;
        edgePositions[i * 6 + 4] = e.target.y;
        edgePositions[i * 6 + 5] = e.target.z;
    });
    edgeGeo.attributes.position.needsUpdate = true;
}
```

For directed edges with a visible arrow, use `ArrowHelper` or small cones near the target.

## Simulation + rendering loop

```javascript
let frame = 0;
const MAX_SIM_FRAMES = 400; // stabilizes after ~7s at 60fps
function tick() {
    if (frame < MAX_SIM_FRAMES) {
        simulationStep();
        updateNodes();
        updateEdges();
        frame++;
    }
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
}
```

After stabilizing, keep rendering but pause the simulation to save CPU.

## Cycle detection

Run Tarjan or Kosaraju before rendering; nodes that belong to cycles get a special color (orange) and their edges turn red.

```javascript
const cycles = findStronglyConnectedComponents(nodes, edges).filter((c) => c.length > 1);
cycles.flat().forEach((n) => n.inCycle = true);
edges.forEach((e) => {
    e.inCycle = e.source.inCycle && e.target.inCycle;
});
```

## Controls sidebar

```html
<aside id="sidebar">
    <h3>Dependency Graph 3D</h3>

    <label>Repulsion
        <input type="range" min="100" max="2000" value="800" data-param="repulsion">
    </label>

    <label>Attraction
        <input type="range" min="0.01" max="0.2" step="0.01" value="0.04" data-param="attraction">
    </label>

    <label>Filter by folder
        <select data-param="folderFilter">
            <option value="all">All</option>
        </select>
    </label>

    <label>
        <input type="checkbox" data-param="highlightCycles" checked> Highlight cycles
    </label>

    <label>
        <input type="checkbox" data-param="showLabels"> Visible labels
    </label>

    <button id="reset">Reset</button>
    <button id="freeze">Freeze simulation</button>
    <button id="export-png">Export PNG</button>
</aside>
```

Slider changes reactivate the simulation for 100 more frames before freezing again.

## Interaction

- **Hover on node**: tooltip with name, number of dependents (fan-in), dependencies (fan-out).
- **Click on node**: highlights the node and its connected edges, blurs the others (reduced opacity).
- **Double-click on node**: focuses the camera on the node.
- **Scroll**: zoom.

## Performance

| Nodes | Strategy |
|---|---|
| < 50 | Individual spheres with `add()` |
| 50 to 500 | InstancedMesh + O(n²) repulsion |
| 500 to 2,000 | InstancedMesh + Barnes-Hut octree |
| > 2,000 | Group by folder first (each cluster = one meta-node) |

Edges: up to **10,000** with LineSegments. Above that, simplify (show only the top N by weight) or use a color gradient instead of duplicating geometry.
