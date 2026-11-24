/**
 * The pyramids world — THE LOOK (PYRAMIDS_WORLD_PLAN §1.4): realistic, « not a boy game », drawn in code. The builders of the
 * validated mock-up (`docs/reports/mockups/thales-egypt-3d/main.js`) PORTED here, not redrawn: the physical sky, the
 * procedural sand, limestone, silt and crops, the dunes, the Nile, date palms, the felucca, the stepped pyramids — merged
 * into few draw calls for a school laptop. One unit is one metre. It names no lesson.
 *
 * Respect (CLAUDE.md, §1.4): monuments of BUILDING — courses, ramps, quarries. No god, ankh, scarab, eye, cartouche,
 * hieroglyph, obelisk; nothing funerary; the capstone is plain limestone.
 */
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { labelScale } from './logic';

/** The east bank is x = 0; the river runs along z, 416 m wide (the width of the ferry, §3.5). */
export const BANK_X = 0;
export const RIVER_W = 416;
export const WATER_Y = -0.6;

// ───────────────────────────── noise and procedural textures (the mock-up's) ─────────────────────────────
const hash = (x, y) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
};
const vnoise = (x, y) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const s = (t) => t * t * (3 - 2 * t);
  const u = s(x - xi);
  const v = s(y - yi);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x, y, o = 5) => {
  let f = 0;
  let a = 0.5;
  let px = x;
  let py = y;
  for (let i = 0; i < o; i += 1) {
    f += a * vnoise(px, py);
    px *= 2.03;
    py *= 2.03;
    a *= 0.5;
  }
  return f;
};

const images = {};
function canvasTexture(key, size, paint, repeat = [1, 1]) {
  if (!images[key]) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    const img = g.createImageData(size, size);
    for (let y = 0; y < size; y += 1)
      for (let x = 0; x < size; x += 1) {
        const [r, gg, b] = paint(x, y);
        const i = (y * size + x) * 4;
        img.data[i] = r;
        img.data[i + 1] = gg;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
      }
    g.putImageData(img, 0, 0);
    images[key] = c;
  }
  const t = new THREE.CanvasTexture(images[key]);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.repeat.set(...repeat);
  return t;
}
const SAND = (repeat) =>
  canvasTexture(
    'sand',
    256,
    (x, y) => {
      const n = 0.82 + 0.3 * fbm(x / 26, y / 26) + (hash(x, y) - 0.5) * 0.09;
      return [214 * n, 172 * n, 112 * n];
    },
    repeat,
  );
/** Limestone blocks: 64 × 32 px, every other row offset; dark joints; weathered noise. */
const LIMESTONE = (repeat) =>
  canvasTexture(
    'limestone',
    256,
    (x, y) => {
      const row = Math.floor(y / 32);
      const bx = (x + (row % 2) * 32) % 64;
      const joint = bx < 2 || y % 32 < 2;
      const n = 0.78 + 0.32 * fbm(x / 18 + row * 7.1, y / 18) + (hash(x, y) - 0.5) * 0.08;
      const tone = 0.92 + 0.12 * hash(row, Math.floor((x + (row % 2) * 32) / 64));
      const k = joint ? 0.58 : n * tone;
      return [222 * k, 196 * k, 152 * k];
    },
    repeat,
  );
const SILT = (repeat) =>
  canvasTexture(
    'silt',
    256,
    (x, y) => {
      const n = 0.75 + 0.35 * fbm(x / 30, y / 30) + (hash(x, y) - 0.5) * 0.1;
      return [112 * n, 92 * n, 62 * n];
    },
    repeat,
  );
const CROPS = (repeat) =>
  canvasTexture(
    'crops',
    256,
    (x, y) => {
      const rowLine = Math.sin((x / 256) * Math.PI * 2 * 18) > 0.35;
      const n = 0.75 + 0.4 * fbm(x / 14, y / 14) + (hash(x, y) - 0.5) * 0.15;
      return rowLine ? [70 * n, 128 * n, 46 * n] : [96 * n, 84 * n, 52 * n];
    },
    repeat,
  );

// ───────────────────────────── the physical sky ─────────────────────────────
/** three's `Sky`, the mock-up's settings; `setSun(dir)` moves the sun (a unit vector) and returns the environment's scene. */
export function makePhysicalSky() {
  const make = () => {
    const s = new Sky();
    s.scale.setScalar(8000);
    const u = s.material.uniforms;
    u.turbidity.value = 9;
    u.rayleigh.value = 1.4;
    u.mieCoefficient.value = 0.006;
    u.mieDirectionalG.value = 0.82;
    return s;
  };
  const sky = make();
  const env = make();
  const envScene = new THREE.Scene();
  envScene.add(env);
  return {
    sky,
    envScene,
    setSun(dir) {
      sky.material.uniforms.sunPosition.value.copy(dir);
      env.material.uniforms.sunPosition.value.copy(dir);
    },
  };
}

// ───────────────────────────── a label that keeps its size on screen (≥ 18 px at 1366×768, §1.5) ─────────────────────────────
export function makeLabel(text, { bg = 'rgba(16,20,36,0.84)', fg = '#ffffff', px = 20, width = 0 } = {}) {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const font = '700 64px "Noto Naskh Arabic", "Segoe UI", Tahoma, sans-serif';
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, sizeAttenuation: false }),
  );
  s.renderOrder = 99;
  const h = labelScale(px);
  const set = (t) => {
    const str = String(t);
    s.userData.text = str;
    g.font = font;
    // a label whose text changes keeps ONE canvas width (a texture is not resized once uploaded)
    c.width = width || Math.ceil(g.measureText(str).width + 56);
    c.height = 96;
    g.font = font;
    g.fillStyle = bg;
    g.beginPath();
    g.roundRect(0, 0, c.width, c.height, 40);
    g.fill();
    g.fillStyle = fg;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.direction = /[\u0600-\u06FF]/.test(str) ? 'rtl' : 'ltr'; // a label in Arabic script reads right to left
    g.fillText(str, c.width / 2, 52);
    tex.needsUpdate = true;
    const r = s.userData.r ?? 1;
    s.scale.set((r * h * c.width) / c.height, r * h, 1);
  };
  set(text);
  s.userData.set = set;
  // a sprite of a fixed size is drawn in the units of the lens: `zoom(r)` keeps it the same on screen when the lens
  // narrows (r = tan(fov/2) / tan(55°/2) — Game.js › updateCamera)
  s.userData.zoom = (r) => {
    const k = r / (s.userData.r ?? 1);
    s.userData.r = r;
    s.scale.set(s.scale.x * k, s.scale.y * k, 1);
  };
  return s;
}

// ───────────────────────────── the ground: two desert banks, the Nile between them ─────────────────────────────
/**
 * The east bank (x ≥ 0) and the west bank (x ≤ −416): sand, flat where the play happens (`play`: a box in x, z), dunes
 * beyond; the river between, its bed, the two bank faces, and a strip of crops on the west bank.
 */
export function makeGround(play) {
  const g = new THREE.Group();
  const sand = new THREE.MeshStandardMaterial({ map: SAND([700, 700]), roughness: 0.96 });
  const bank = (x0, x1) => {
    const w = x1 - x0;
    const d = 6000;
    const geo = new THREE.PlaneGeometry(w, d, 120, 160);
    geo.rotateX(-Math.PI / 2);
    geo.translate(x0 + w / 2, 0, (play.z0 + play.z1) / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i += 1) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const dx = Math.max(0, play.x0 - x, x - play.x1);
      const dz = Math.max(0, play.z0 - z, z - play.z1);
      // the banks stay flat along the water; the dunes rise away from the river and from the play
      const away = Math.min(Math.hypot(dx, dz), Math.abs(x - (x0 < 0 ? x1 : x0)));
      const k = THREE.MathUtils.smoothstep(away, 260, 900);
      p.setY(i, k * (fbm(x / 260, z / 260, 4) - 0.3) * 70);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, sand);
    m.receiveShadow = true;
    return m;
  };
  g.add(bank(BANK_X, BANK_X + 4000), bank(BANK_X - RIVER_W - 4000, BANK_X - RIVER_W));
  const len = 6000;
  const zMid = (play.z0 + play.z1) / 2;
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(RIVER_W, len),
    new THREE.MeshPhysicalMaterial({ color: 0x2c6e8f, roughness: 0.08, clearcoat: 1, metalness: 0.05 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(BANK_X - RIVER_W / 2, WATER_Y, zMid);
  water.receiveShadow = true;
  const bed = new THREE.Mesh(
    new THREE.PlaneGeometry(RIVER_W, len),
    new THREE.MeshStandardMaterial({ color: 0x3b3122, roughness: 1 }),
  );
  bed.rotation.x = -Math.PI / 2;
  bed.position.set(BANK_X - RIVER_W / 2, -4, zMid);
  const face = new THREE.MeshStandardMaterial({ map: SILT([1, 300]), roughness: 1 });
  for (const x of [BANK_X - 0.1, BANK_X - RIVER_W + 0.1]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, len), face);
    f.position.set(x, -2, zMid);
    g.add(f);
  }
  const crops = new THREE.Mesh(
    new THREE.PlaneGeometry(90, len),
    new THREE.MeshStandardMaterial({ map: CROPS([6, 300]), roughness: 0.9, color: 0xe6ffc8 }),
  );
  crops.rotation.x = -Math.PI / 2;
  crops.position.set(BANK_X - RIVER_W - 45, 0.04, zMid);
  crops.receiveShadow = true;
  g.add(water, bed, crops);
  return g;
}

// ───────────────────────────── date palms (the mock-up's, merged: two draw calls a palm) ─────────────────────────────
const BARK = new THREE.MeshStandardMaterial({ color: 0x7b5a3a, roughness: 0.95 });
const LEAF = new THREE.MeshStandardMaterial({ color: 0x3f7a35, roughness: 0.8, side: THREE.DoubleSide });
export function makePalm(seed, h) {
  const g = new THREE.Group();
  const lean = (hash(seed, 1) - 0.5) * 0.25;
  const n = Math.round(h / 0.7);
  const trunk = [];
  const top = new THREE.Vector3();
  for (let i = 0; i < n; i += 1) {
    const t = i / n;
    const seg = new THREE.CylinderGeometry(0.26 - 0.06 * t, 0.3 - 0.06 * t, 0.72, 9);
    seg.translate(lean * t * t * h, 0.36 + i * 0.7, 0);
    trunk.push(seg);
    top.set(lean * t * t * h, 0.36 + i * 0.7, 0);
  }
  top.y += 0.3;
  const fronds = [];
  for (let i = 0; i < 14; i += 1) {
    const a = (i / 14) * Math.PI * 2 + hash(seed, i) * 0.4;
    const len = 3.2 + hash(i, seed) * 1.2;
    const geo = new THREE.PlaneGeometry(len, 0.55, 8, 1);
    geo.translate(len / 2, 0, 0);
    const p = geo.attributes.position;
    for (let k = 0; k < p.count; k += 1) {
      const x = p.getX(k);
      p.setY(k, p.getY(k) * (1 - x / len) * 1.3);
      p.setZ(k, -0.09 * x * x);
    }
    geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI / 2 + 0.25, 0, a)));
    geo.translate(top.x, top.y, top.z);
    geo.computeVertexNormals();
    fronds.push(geo);
  }
  const t = new THREE.Mesh(mergeGeometries(trunk), BARK);
  const f = new THREE.Mesh(mergeGeometries(fronds), LEAF);
  t.castShadow = true;
  f.castShadow = true;
  g.add(t, f);
  return g;
}

// ───────────────────────────── limestone: a box whose blocks keep their size whatever the box ─────────────────────────────
const TILE_W = 6;
const TILE_H = 3;
/** A BoxGeometry whose UVs repeat the limestone image every 6 m × 3 m on every face. */
function stoneBox(w, h, d) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.attributes.uv;
  // faces: +x, −x, +y, −y, +z, −z — four vertices each
  const spans = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];
  for (let f = 0; f < 6; f += 1)
    for (let k = 0; k < 4; k += 1) {
      const i = f * 4 + k;
      uv.setXY(i, (uv.getX(i) * spans[f][0]) / TILE_W, (uv.getY(i) * spans[f][1]) / TILE_H);
    }
  return geo;
}
const stoneMaterial = (tint = 0xffffff) =>
  new THREE.MeshStandardMaterial({ map: LIMESTONE(), roughness: 0.9, color: tint });

/**
 * A stepped limestone pyramid (square base `base`, height `h`) of `courses` courses, merged into ONE mesh. `upTo`: how
 * many courses are built (an unfinished pyramid). Each course is as wide as the slope at its TOP, so the top of the
 * built part has exactly the width of the pyramid at that height.
 */
export function makeStepPyramid({ base, h, courses, upTo = courses, tint = 0xfff4e2 }) {
  const hc = h / courses;
  const parts = [];
  for (let k = 0; k < Math.min(upTo, courses); k += 1) {
    const w = Math.max(0.4, base * (1 - (k + 1) / courses));
    const geo = stoneBox(w, hc, w);
    geo.translate(0, hc * (k + 0.5), 0);
    parts.push(geo);
  }
  // the footing: the true base square, a hand high
  const foot = stoneBox(base, 0.15, base);
  foot.translate(0, 0.075, 0);
  parts.push(foot);
  const m = new THREE.Mesh(mergeGeometries(parts), stoneMaterial(tint));
  m.castShadow = true;
  m.receiveShadow = true;
  m.userData.tall = 'pyramid'; // a ghost in the top view (Game.js › ghostTall)
  return m;
}

/** A slab of limestone, a course: `side` × `side`, `height` thick. */
export function makeSlab(side, height) {
  const m = new THREE.Mesh(stoneBox(side, height, side), stoneMaterial(0xfff0d8));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** A square ring between `inner` and `outer`, `h` thick (a gap left round a course, or what overhangs it). */
export function makeRing(inner, outer, h, color) {
  const g = new THREE.Group();
  // its exact colour, whatever the light and the exposure: amber a gap, violet an overhang
  const mat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const band = (outer - inner) / 2;
  const mid = (outer + inner) / 4;
  for (const [x, z, w, d] of [
    [0, mid, outer, band],
    [0, -mid, outer, band],
    [mid, 0, band, inner],
    [-mid, 0, band, inner],
  ]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    b.position.set(x, 0, z);
    g.add(b);
  }
  return g;
}

// ───────────────────────────── ropes, stakes, rays ─────────────────────────────
const ROPE_MAT = new THREE.MeshStandardMaterial({ color: 0xe0b46a, roughness: 0.6 });
const KNOT_MAT = new THREE.MeshStandardMaterial({ color: 0x6b4520, roughness: 0.8 });
const STAKE_MAT = new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.9 });

/** A tape or rope from a to b (a thin box) — the mock-up's `tape`. */
export function makeTape(a, b, w, h, mat = ROPE_MAT) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1), mat);
  const set = (p, q) => {
    const A = new THREE.Vector3(p.x, p.y, p.z);
    const B = new THREE.Vector3(q.x, q.y, q.z);
    const L = Math.max(0.01, A.distanceTo(B));
    m.scale.set(1, 1, L);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.lookAt(B);
  };
  set(a, b);
  m.castShadow = true;
  m.userData.set = set;
  return m;
}

/**
 * THE KNOTTED ROPE in his hand: the rope from its stake to the knot he stands on, a knot every metre, and the length
 * written over its end. `set(from, to, knots)`; hidden with `group.visible`.
 */
export function makeKnottedRope(max = 260) {
  const group = new THREE.Group();
  const rope = makeTape({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, 0.16, 0.16);
  const knots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 8, 6), KNOT_MAT, max);
  knots.count = 0;
  const tip = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0xffc94d, emissive: 0xffb21e, emissiveIntensity: 1.2 }),
  );
  const label = makeLabel('0', { bg: 'rgba(120,72,12,0.92)', px: 22, width: 200 });
  group.add(rope, knots, tip, label);
  group.visible = false;
  const m = new THREE.Matrix4();
  group.userData.set = (from, to, n) => {
    const lift = (p) => ({ x: p.x, y: p.y + 0.12, z: p.z });
    rope.userData.set(lift(from), lift(to));
    const L = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z) || 1;
    const count = Math.min(max, Math.floor(n + 1e-6));
    for (let k = 1; k <= count; k += 1) {
      const t = Math.min(1, k / L);
      m.makeTranslation(
        from.x + (to.x - from.x) * t,
        from.y + 0.12 + (to.y - from.y) * t,
        from.z + (to.z - from.z) * t,
      );
      knots.setMatrixAt(k - 1, m);
    }
    knots.count = count;
    knots.instanceMatrix.needsUpdate = true;
    tip.position.set(to.x, to.y + 0.25, to.z);
    label.position.set(to.x, to.y + 3.6, to.z);
  };
  group.userData.label = label;
  return group;
}

/** A wooden stake, its letter over it, and the lamp that lights when it is where to go next. */
export function makeStake(letter, h = 1.6) {
  const g = new THREE.Group();
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, h, 8), STAKE_MAT);
  s.position.y = h / 2;
  s.castShadow = true;
  const label = makeLabel(letter, { bg: 'rgba(29,78,216,0.92)', px: 20 });
  label.position.y = h + 1.4;
  const lamp = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.09, 8, 32),
    new THREE.MeshStandardMaterial({ color: 0x37e0ff, emissive: 0x37e0ff, emissiveIntensity: 1.4 }),
  );
  lamp.rotation.x = Math.PI / 2;
  lamp.position.y = 0.08;
  lamp.visible = false;
  g.add(s, label, lamp);
  g.userData.lamp = lamp;
  g.userData.label = label;
  return g;
}

/** A straight dashed ray from a to b (the mock-up's `ray`): a line of mathematics, never the shadow map. */
export function makeRay(a, b, r, color) {
  const A = new THREE.Vector3(a.x, a.y, a.z);
  const B = new THREE.Vector3(b.x, b.y, b.z);
  const L = A.distanceTo(B);
  const dash = Math.max(0.3, L / 40);
  const dir = B.clone().sub(A).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
  const parts = [];
  for (let s = 0; s < L; s += dash * 1.8) {
    const len = Math.min(dash, L - s);
    const geo = new THREE.CylinderGeometry(r, r, len, 6);
    geo.applyQuaternion(q);
    const p = A.clone().lerp(B, (s + len / 2) / L);
    geo.translate(p.x, p.y, p.z);
    parts.push(geo);
  }
  return new THREE.Mesh(
    mergeGeometries(parts),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, fog: false }),
  );
}

/** A shadow DRAWN on the ground (a polygon of x, z points): what carries mathematics is never the shadow map (B2). */
export function makeGroundShadow(points, opacity = 0.42) {
  const shape = new THREE.Shape(points.map((p) => new THREE.Vector2(p.x, -p.z)));
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      color: 0x2a2014,
      transparent: true,
      opacity,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
  );
  m.position.y = 0.06;
  m.renderOrder = 2;
  return m;
}

// ───────────────────────────── the field after the flood (stage 1) ─────────────────────────────
/** The field's ground: black silt around, crops inside the triangle `tri` (three x, z points), the canals as ditches. */
export function makeField(tri, canals) {
  const g = new THREE.Group();
  // the black silt round the field, never over the water
  const xs = tri.map((p) => p.x);
  const zs = tri.map((p) => p.z);
  const x0 = Math.max(BANK_X + 0.5, Math.min(...xs) - 8);
  const x1 = Math.max(...xs) + 8;
  const z0 = Math.min(...zs) - 8;
  const z1 = Math.max(...zs) + 8;
  const silt = new THREE.Mesh(
    new THREE.PlaneGeometry(x1 - x0, z1 - z0),
    new THREE.MeshStandardMaterial({ map: SILT([(x1 - x0) / 18, (z1 - z0) / 18]), roughness: 1 }),
  );
  silt.rotation.x = -Math.PI / 2;
  silt.position.set((x0 + x1) / 2, 0.02, (z0 + z1) / 2);
  silt.receiveShadow = true;
  const shape = new THREE.Shape(tri.map((p) => new THREE.Vector2(p.x, -p.z)));
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  const uv = geo.attributes.uv;
  const pos = geo.attributes.position;
  for (let i = 0; i < uv.count; i += 1) uv.setXY(i, pos.getX(i) / 9, pos.getZ(i) / 9);
  const crops = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: CROPS(), roughness: 0.9 }));
  crops.position.y = 0.04;
  crops.receiveShadow = true;
  g.add(silt, crops);
  const ditch = new THREE.MeshStandardMaterial({ color: 0x2b2318, roughness: 1 });
  for (const [a, b] of canals) {
    const d = makeTape({ x: a.x, y: 0.05, z: a.z }, { x: b.x, y: 0.05, z: b.z }, 1.1, 0.04, ditch);
    d.castShadow = false;
    d.receiveShadow = true;
    g.add(d);
  }
  return g;
}

// ───────────────────────────── a dock, the felucca ─────────────────────────────
/** A dock: a limestone landing on the bank, a wooden jetty into the water, a mooring post, its name, its lamp. */
export function makeDock(name) {
  const g = new THREE.Group();
  const land = new THREE.Mesh(stoneBox(7, 0.5, 8), stoneMaterial());
  land.position.set(3.5, 0.0, 0);
  land.receiveShadow = true;
  const wood = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.85 });
  const jetty = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.3, 3.6), wood);
  jetty.position.set(-6.0, -0.15, 0);
  jetty.receiveShadow = true;
  jetty.castShadow = true;
  for (const x of [-11.5, -7.5, -3.5]) {
    for (const z of [-1.6, 1.6]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 4, 6), wood);
      leg.position.set(x, -2.2, z);
      g.add(leg);
    }
  }
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 1.6, 10), wood);
  post.position.set(-11.6, 0.8, 1.4);
  post.castShadow = true;
  const lamp = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.16, 10, 48),
    new THREE.MeshStandardMaterial({ color: 0x37e0ff, emissive: 0x37e0ff, emissiveIntensity: 1.3 }),
  );
  lamp.rotation.x = Math.PI / 2;
  lamp.position.set(-6, 0.15, 0);
  lamp.visible = false;
  const label = makeLabel(name, { bg: 'rgba(12,72,110,0.92)', px: 20 });
  label.position.set(2, 5.2, 0);
  label.userData.dock = true;
  g.add(land, jetty, post, lamp, label);
  g.userData.lamp = lamp;
  return g;
}

/** The felucca (the mock-up's): its hull, its mast and its lateen sail. Zero rides it as the runtime's robot. */
export function makeFelucca() {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x7a4f2a, roughness: 0.8 });
  const hullGeo = new THREE.BoxGeometry(2.4, 0.7, 5.6, 1, 1, 6);
  const p = hullGeo.attributes.position;
  for (let i = 0; i < p.count; i += 1) {
    const z = p.getZ(i);
    const k = 1 - Math.abs(z / 2.8) ** 2.2 * 0.75;
    p.setX(i, p.getX(i) * k);
    if (p.getY(i) < 0) p.setX(i, p.getX(i) * 0.6);
    p.setY(i, p.getY(i) + Math.abs(z / 2.8) ** 3 * 0.6);
  }
  hullGeo.computeVertexNormals();
  const hull = new THREE.Mesh(hullGeo, wood);
  hull.position.y = 0.3;
  hull.castShadow = true;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 5.5, 8), wood);
  mast.position.set(0, 3.2, -0.6);
  const sail = new THREE.Mesh(
    new THREE.ShapeGeometry(
      new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(3.6, 0.4), new THREE.Vector2(0.2, 5)]),
    ),
    new THREE.MeshStandardMaterial({ color: 0xf4ead6, roughness: 0.9, side: THREE.DoubleSide }),
  );
  sail.position.set(0, 1.1, -0.6);
  sail.rotation.y = -Math.PI / 2 + 0.35;
  sail.castShadow = true;
  g.add(hull, mast, sail);
  g.scale.setScalar(1.6);
  return g;
}

/** A grey box: a post of the scale boxes of phase 1 (B6), its letter over it. */
export function makeGreyPost(letter, h = 3) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.45, h, 10),
    new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 0.8 }),
  );
  m.position.y = h / 2;
  m.castShadow = true;
  const label = makeLabel(letter, { bg: 'rgba(55,65,81,0.92)', px: 20 });
  label.position.y = h + 2;
  g.add(m, label);
  return g;
}

/** The 2 m stick of the plateau. */
export function makeStick(h) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.09, h, 10),
    new THREE.MeshStandardMaterial({ color: 0x5a3b1e, roughness: 0.85 }),
  );
  m.position.y = h / 2;
  m.castShadow = true;
  return m;
}

/** The masons' table where a forge opens: a limestone block, its board glowing while it calls him. */
export function makeForgeTable() {
  const g = new THREE.Group();
  const block = new THREE.Mesh(stoneBox(2.2, 1, 1.3), stoneMaterial());
  block.position.y = 0.5;
  block.castShadow = true;
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.06, 0.9),
    new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffb21e, emissiveIntensity: 1.1 }),
  );
  board.position.y = 1.04;
  g.add(block, board);
  g.userData.board = board;
  return g;
}

/** A builders' ramp of packed earth from `a` (on the ground) to `b` (high on the pyramid), `w` wide. */
export function makeRamp(a, b, w = 6) {
  const m = makeTape(
    a,
    b,
    w,
    0.8,
    new THREE.MeshStandardMaterial({ map: SAND([2, 20]), color: 0xf1d6a8, roughness: 1 }),
  );
  m.receiveShadow = true;
  return m;
}

/** A plain limestone capstone: a square pyramid of base `base` and height `h` (never gilded, never inscribed). */
export function makeCapstone(base, h) {
  const geo = new THREE.ConeGeometry(base / Math.SQRT2, h, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, h / 2, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xf3e7cf, roughness: 0.7 }));
  m.castShadow = true;
  return m;
}

/** The mark of a right angle on the ground at `at`, along the unit directions `u` and `v` (the 3-4-5 rope's angle). */
export function makeRightAngle(at, u, v, size = 2.4) {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0xe11d48, toneMapped: false });
  const p = (k, l) => ({ x: at.x + u.x * k + v.x * l, y: 0.12, z: at.z + u.z * k + v.z * l });
  g.add(makeTape(p(size, 0), p(size, size), 0.14, 0.05, mat), makeTape(p(0, size), p(size, size), 0.14, 0.05, mat));
  return g;
}

/** Ibn al-Haytham's box: a dark box, a hole O at its front, the pyramid's image upside down on its back wall. */
export function makeCameraBox() {
  const g = new THREE.Group();
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.9, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x2b2118, roughness: 0.9 }),
  );
  box.position.y = 0.45;
  box.castShadow = true;
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), new THREE.MeshBasicMaterial({ color: 0xfff3c4 }));
  hole.position.set(0.61, 0.5, 0);
  hole.rotation.y = Math.PI / 2;
  const image = new THREE.Mesh(
    new THREE.ShapeGeometry(
      new THREE.Shape([new THREE.Vector2(-0.18, 0.12), new THREE.Vector2(0.18, 0.12), new THREE.Vector2(0, -0.13)]),
    ),
    new THREE.MeshBasicMaterial({ color: 0xffd27a, side: THREE.DoubleSide, toneMapped: false }),
  );
  image.position.set(-0.61, 0.5, 0);
  image.rotation.y = -Math.PI / 2;
  g.add(box, hole, image);
  return g;
}

/**
 * Zero's flight to the height he typed: a column of light along the pyramid's axis and a ring at his height, drawn
 * THROUGH the stone (a mark of the world, seen even inside the pyramid). `set(h)`.
 */
export function makeFlightBeam() {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.35, depthTest: false });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 12, 1, true), mat);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.35, 10, 40),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, depthTest: false, toneMapped: false }),
  );
  ring.rotation.x = Math.PI / 2;
  beam.renderOrder = 50;
  ring.renderOrder = 51;
  g.add(beam, ring);
  g.visible = false;
  g.userData.set = (h) => {
    beam.scale.y = Math.max(0.01, h);
    beam.position.y = h / 2;
    ring.position.y = h;
  };
  return g;
}

/** A translucent copy of the stick, its shadow and its ray: the drawn triangle he slides along the shadow's axis (B5). */
export function makeGhostStick(h, shadow) {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75, toneMapped: false });
  g.add(makeTape({ x: 0, y: 0, z: 0 }, { x: 0, y: h, z: 0.001 }, 0.12, 0.12, mat));
  g.add(makeTape({ x: 0, y: 0.08, z: 0 }, { x: -shadow, y: 0.08, z: 0 }, 0.14, 0.05, mat));
  g.add(makeRay({ x: 0, y: h, z: 0 }, { x: -shadow, y: 0, z: 0 }, 0.04, 0xffb21e));
  return g;
}
