import { NodeIO } from '@gltf-transform/core';

// ── Helpers ──────────────────────────────────────────────────────────

/** Multiply a 4x4 matrix (column-major flat array) by a vec3 point → vec3. */
function transformPoint(m, [x, y, z]) {
  const w = m[3] * x + m[7] * y + m[11] * z + m[15];
  return [
    (m[0] * x + m[4] * y + m[8]  * z + m[12]) / w,
    (m[1] * x + m[5] * y + m[9]  * z + m[13]) / w,
    (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
  ];
}

/** Compose a 4×4 TRS matrix (column-major) from T, R (quaternion), S. */
function trsToMatrix(t, r, s) {
  const [tx, ty, tz] = t;
  const [qx, qy, qz, qw] = r;
  const [sx, sy, sz] = s;
  const m = new Array(16).fill(0);

  const x2 = qx + qx, y2 = qy + qy, z2 = qz + qz;
  const xx = qx * x2, xy = qx * y2, xz = qx * z2;
  const yy = qy * y2, yz = qy * z2, zz = qz * z2;
  const wx = qw * x2, wy = qw * y2, wz = qw * z2;

  m[0]  = (1 - (yy + zz)) * sx;
  m[1]  = (xy + wz) * sx;
  m[2]  = (xz - wy) * sx;
  m[3]  = 0;
  m[4]  = (xy - wz) * sy;
  m[5]  = (1 - (xx + zz)) * sy;
  m[6]  = (yz + wx) * sy;
  m[7]  = 0;
  m[8]  = (xz + wy) * sz;
  m[9]  = (yz - wx) * sz;
  m[10] = (1 - (xx + yy)) * sz;
  m[11] = 0;
  m[12] = tx;
  m[13] = ty;
  m[14] = tz;
  m[15] = 1;
  return m;
}

/** Multiply two column-major 4×4 matrices: result = a * b */
function mat4Multiply(a, b) {
  const r = new Array(16).fill(0);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      r[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3];
    }
  }
  return r;
}

const IDENTITY = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

/** Walk up the node tree collecting the world matrix. */
function getWorldMatrix(node) {
  const chain = [];
  let cur = node;
  while (cur) {
    chain.push(cur);
    cur = cur.listParents().find(p => p.propertyType === 'Node') ?? null;
  }
  chain.reverse();
  let world = IDENTITY;
  for (const n of chain) {
    const t = n.getTranslation()  ?? [0, 0, 0];
    const r = n.getRotation()     ?? [0, 0, 0, 1];
    const s = n.getScale()        ?? [1, 1, 1];
    const local = trsToMatrix(t, r, s);
    world = mat4Multiply(world, local);
  }
  return world;
}

/** Compute AABB of a mesh in world space given its node's world matrix. */
function worldAABB(mesh, worldMatrix) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  let vertexCount = 0;
  const buf = new Float32Array(3);

  for (const prim of mesh.listPrimitives()) {
    const posAccessor = prim.getAttribute('POSITION');
    if (!posAccessor) continue;
    const count = posAccessor.getCount();
    for (let i = 0; i < count; i++) {
      posAccessor.getElement(i, buf);
      const wp = transformPoint(worldMatrix, [buf[0], buf[1], buf[2]]);
      for (let a = 0; a < 3; a++) {
        if (wp[a] < min[a]) min[a] = wp[a];
        if (wp[a] > max[a]) max[a] = wp[a];
      }
      vertexCount++;
    }
  }
  return { min, max, vertexCount };
}

// ── Main ─────────────────────────────────────────────────────────────

const FILE = '/Users/nicholascandello/Desktop/portfolio/public/models/iphone_17_pro_max (1).glb';

const io = new NodeIO();
const doc = await io.read(FILE);
const root = doc.getRoot();

const allMeshes = root.listMeshes();
console.log(`Total meshes in file: ${allMeshes.length}\n`);

// Build a map:  Mesh -> Node (first node referencing it)
const meshNodeMap = new Map();
for (const node of root.listNodes()) {
  const m = node.getMesh();
  if (m && !meshNodeMap.has(m)) {
    meshNodeMap.set(m, node);
  }
}

// ── 1) List ALL mesh names with world-space bounding boxes ───────────

const allEntries = [];
let displayOrangeEntry = null;

console.log('='.repeat(110));
console.log('  ALL MESHES  (index | name | material(s) | world AABB min | world AABB max)');
console.log('='.repeat(110));

for (let i = 0; i < allMeshes.length; i++) {
  const mesh = allMeshes[i];
  const name = mesh.getName() || `(unnamed-${i})`;
  const node = meshNodeMap.get(mesh);
  const materials = mesh.listPrimitives().map(p => p.getMaterial()?.getName() ?? '(none)');
  const matNames = [...new Set(materials)].join(', ');

  let aabb = { min: [0,0,0], max: [0,0,0], vertexCount: 0 };
  if (node) {
    const wm = getWorldMatrix(node);
    aabb = worldAABB(mesh, wm);
  }

  const entry = { index: i, name, materials: matNames, aabb };
  allEntries.push(entry);

  // Check for Display_orange material
  if (materials.some(m => m === 'Display_orange')) {
    displayOrangeEntry = entry;
  }

  const tag = (name.toLowerCase().includes('orange') || matNames.toLowerCase().includes('orange'))
    ? '  <-- ORANGE'
    : '';

  console.log(
    `[${String(i).padStart(2)}] ${name.padEnd(40)} mat: ${matNames.padEnd(30)} ` +
    `min: [${aabb.min.map(v => v.toFixed(4)).join(', ')}]  ` +
    `max: [${aabb.max.map(v => v.toFixed(4)).join(', ')}]${tag}`
  );
}

// ── 2) Display_orange mesh details ───────────────────────────────────

console.log('\n' + '='.repeat(110));
console.log('  DISPLAY_ORANGE MESH DETAILS');
console.log('='.repeat(110));

if (displayOrangeEntry) {
  const { name, materials, aabb } = displayOrangeEntry;
  const center = aabb.min.map((lo, a) => (lo + aabb.max[a]) / 2);
  const dims   = aabb.min.map((lo, a) => aabb.max[a] - lo);

  console.log(`  Mesh name:    ${name}`);
  console.log(`  Material(s):  ${materials}`);
  console.log(`  AABB min:     [${aabb.min.map(v => v.toFixed(6)).join(', ')}]`);
  console.log(`  AABB max:     [${aabb.max.map(v => v.toFixed(6)).join(', ')}]`);
  console.log(`  Center:       [${center.map(v => v.toFixed(6)).join(', ')}]`);
  console.log(`  Dimensions:   [${dims.map(v => v.toFixed(6)).join(', ')}]  (W x H x D)`);
  console.log(`  Vertices:     ${aabb.vertexCount}`);
} else {
  console.log('  *** No mesh found with material "Display_orange" ***');
}

// ── 3 & 4) Orange variant overall bounding box & center ──────────────

console.log('\n' + '='.repeat(110));
console.log('  ORANGE VARIANT — OVERALL BOUNDING BOX & CENTER');
console.log('='.repeat(110));

const orangeMin = [Infinity, Infinity, Infinity];
const orangeMax = [-Infinity, -Infinity, -Infinity];
let orangeCount = 0;
const orangeMeshNames = [];

for (const entry of allEntries) {
  const isOrange =
    entry.name.toLowerCase().includes('orange') ||
    entry.materials.toLowerCase().includes('orange');
  if (!isOrange) continue;
  orangeCount++;
  orangeMeshNames.push(entry.name);
  for (let a = 0; a < 3; a++) {
    if (entry.aabb.min[a] < orangeMin[a]) orangeMin[a] = entry.aabb.min[a];
    if (entry.aabb.max[a] > orangeMax[a]) orangeMax[a] = entry.aabb.max[a];
  }
}

if (orangeCount > 0) {
  const orangeCenter = orangeMin.map((lo, a) => (lo + orangeMax[a]) / 2);
  const orangeDims   = orangeMin.map((lo, a) => orangeMax[a] - lo);

  console.log(`  Orange meshes found: ${orangeCount}`);
  console.log(`  Mesh names: ${orangeMeshNames.join(', ')}`);
  console.log(`  Overall AABB min:    [${orangeMin.map(v => v.toFixed(6)).join(', ')}]`);
  console.log(`  Overall AABB max:    [${orangeMax.map(v => v.toFixed(6)).join(', ')}]`);
  console.log(`  Center position:     [${orangeCenter.map(v => v.toFixed(6)).join(', ')}]`);
  console.log(`  Total dimensions:    [${orangeDims.map(v => v.toFixed(6)).join(', ')}]  (W x H x D)`);
} else {
  console.log('  *** No orange variant meshes found ***');
}

console.log('\nDone.');
