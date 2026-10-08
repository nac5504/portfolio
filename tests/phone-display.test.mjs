import * as THREE from 'three';
import { NodeIO } from '@gltf-transform/core';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Compile the small pure helpers in memory so this also runs on CI's Node 20.
async function loadTypeScript(relativePath) {
  const input = await readFile(new URL(relativePath, import.meta.url), 'utf8');
  const source = input.replace('from "three"', `from "${import.meta.resolve('three')}"`);
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { createDisplayGeometry, targetAtUV, screenTargets } = await loadTypeScript('../src/components/phone-display.ts');
const { apps } = await loadTypeScript('../src/components/app-data.ts');

const doc = await new NodeIO().read(new URL('../public/models/iphone-17-pro.glb', import.meta.url).pathname);
const prim = doc.getRoot().listMeshes().flatMap(m => m.listPrimitives()).find(p => p.getMaterial()?.getName() === 'Display');
const source = new THREE.BufferGeometry();
source.setAttribute('position', new THREE.BufferAttribute(prim.getAttribute('POSITION').getArray(), 3));
source.setIndex(new THREE.BufferAttribute(prim.getIndices().getArray(), 1));
const { geometry, aspect } = createDisplayGeometry(source);
assert.deepEqual(geometry.attributes.position.array, source.attributes.position.array);
assert.deepEqual(geometry.index.array, source.index.array);
assert.ok(aspect > 2 && aspect < 2.3);
const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.BackSide }));
const height = 300 * aspect, targets = screenTargets(apps, height);
const center = source.boundingBox.getCenter(new THREE.Vector3());
const size = source.boundingBox.getSize(new THREE.Vector3());
// Input must follow the real mesh under translation, scale, and rotation.
for (const angle of [0, .3, -.6, 1.2]) {
  mesh.position.set(-.09, .02, 0);
  mesh.rotation.set(.2, angle, .1);
  mesh.scale.setScalar(1.4);
  mesh.updateMatrixWorld(true);
  const point = new THREE.Vector3(source.boundingBox.min.x + size.x * 56 / 300, source.boundingBox.max.y - size.y * 108 / height, center.z).applyMatrix4(mesh.matrixWorld);
  const normal = new THREE.Vector3(0, 0, 1).transformDirection(mesh.matrixWorld);
  const ray = new THREE.Raycaster(point.clone().addScaledVector(normal, .2), normal.clone().negate());
  const hit = ray.intersectObject(mesh)[0];
  assert.ok(hit, `front hit at ${angle}`);
  assert.equal(targetAtUV(targets, hit.uv, height)?.slug, 'cravr');
  const back = new THREE.Raycaster(point.clone().addScaledVector(normal, -.2), normal);
  assert.equal(back.intersectObject(mesh).length, 0, 'display must not accept input from behind');
}
assert.throws(() => createDisplayGeometry(new THREE.BoxGeometry(1, 2, .1)), /planar/);
geometry.dispose();
mesh.material.dispose();
source.dispose();
console.log('PASS: original GLB silhouette; transformed input at four angles; rear input rejected; incompatible model rejected.');
