/**
 * THE FELUCCA'S RIVER — the meshes the world gives the kit's gate run when it sails (`kit/GateRun.js › skin, hazards`,
 * `PYRAMIDS_WORLD_PLAN.md` §1.3, kit work K-b), ported from the owner's validated mock-up
 * (`docs/reports/mockups/thales-egypt-3d/main.js › felucca, crocodile, buoy, gameR`):
 *
 *   riverTrack()   the Nile between two banks of silt and crops, palms along them; `userData.flow(step)` makes the banks,
 *                  the palms and the ripples pass by (the boat stays where the run starts, the river comes to it)
 *   felucca()      Zero's boat: a curved wooden hull with its painted band, a mast and its lateen sail; its origin is
 *                  where Zero stands at the helm (`userData.deck`), built along +z like the kit's hoverboard
 *   crocodile()    a Nile crocodile half under the water, its snout towards the boat; `userData.tick` sways and breathes
 *   buoy()         a number buoy: the NUMBER is the kit's page text over it (a reading size), the buoy is dressed
 *                  'idle' | 'right' | 'picked' | 'other' by `userData.dress`
 *
 * Every texture is a DataTexture computed from value noise: nothing here needs a canvas or a page
 * (`riverMeshes.test.js` builds them all without a renderer). One unit is a metre (§1.5).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// ───────────────────────────── noise and textures (render-free) ─────────────────────────────
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
const fbm = (x, y, o = 4) => {
  let f = 0;
  let a = 0.5;
  let X = x;
  let Y = y;
  for (let i = 0; i < o; i += 1) {
    f += a * vnoise(X, Y);
    X *= 2.03;
    Y *= 2.03;
    a *= 0.5;
  }
  return f;
};

/** A tiling texture painted texel by texel: `paint(x, y) → [r, g, b]` (0–255). */
function dataTexture(size, paint, repeat, srgb = true) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1)
    for (let x = 0; x < size; x += 1) {
      const [r, g, b] = paint(x, y);
      const i = (y * size + x) * 4;
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
      data[i + 3] = 255;
    }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = 8;
  t.repeat.set(...repeat);
  t.needsUpdate = true;
  return t;
}
/** Noise that tiles over `period` texels (so the river never shows a seam). */
const tiled = (x, y, period, scale) => {
  const u = x / period;
  const v = y / period;
  const n = (a, b) => fbm(a * scale, b * scale);
  return n(u, v) * (1 - u) * (1 - v) + n(u - 1, v) * u * (1 - v) + n(u, v - 1) * (1 - u) * v + n(u - 1, v - 1) * u * v;
};
const SILT = (repeat) =>
  dataTexture(
    128,
    (x, y) => {
      const n = 0.75 + 0.35 * tiled(x, y, 128, 4) + (hash(x, y) - 0.5) * 0.1;
      return [112 * n, 92 * n, 62 * n];
    },
    repeat,
  );
const CROPS = (repeat) =>
  dataTexture(
    128,
    (x, y) => {
      const row = Math.sin((x / 128) * Math.PI * 2 * 9) > 0.35;
      const n = 0.75 + 0.4 * tiled(x, y, 128, 8) + (hash(x, y) - 0.5) * 0.15;
      return row ? [70 * n, 128 * n, 46 * n] : [96 * n, 84 * n, 52 * n];
    },
    repeat,
  );
/** The ripples of the water as a normal map: the slope of a tiling noise, a little stretched along the current. */
const RIPPLES = (repeat) => {
  const S = 128;
  const h = (x, y) => tiled(((x % S) + S) % S, ((y % S) + S) % S, S, 6);
  return dataTexture(
    S,
    (x, y) => {
      const dx = (h(x + 1, y) - h(x - 1, y)) * 3.2;
      const dy = (h(x, y + 1) - h(x, y - 1)) * 1.6;
      const l = Math.hypot(dx, dy, 1);
      return [(-dx / l) * 127 + 128, (-dy / l) * 127 + 128, (1 / l) * 127 + 128];
    },
    repeat,
    false,
  );
};

// ───────────────────────────── a date palm (two meshes: the trunk and the fronds) ─────────────────────────────
const BARK = new THREE.MeshStandardMaterial({ color: 0x7b5a3a, roughness: 0.95 });
const LEAF = new THREE.MeshStandardMaterial({ color: 0x3f7a35, roughness: 0.8, side: THREE.DoubleSide });
function palm(seed, h) {
  const g = new THREE.Group();
  const lean = (hash(seed, 1) - 0.5) * 0.25;
  const n = Math.round(h / 0.7);
  const rings = [];
  let top = new THREE.Vector3();
  for (let i = 0; i < n; i += 1) {
    const t = i / n;
    const seg = new THREE.CylinderGeometry(0.26 - 0.06 * t, 0.3 - 0.06 * t, 0.72, 9);
    seg.translate(lean * t * t * h, 0.36 + i * 0.7, 0);
    rings.push(seg);
    top = new THREE.Vector3(lean * t * t * h, 0.36 + i * 0.7, 0);
  }
  top.y += 0.3;
  const trunk = new THREE.Mesh(mergeGeometries(rings), BARK);
  trunk.castShadow = true;
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
    fronds.push(geo);
  }
  const crown = new THREE.Mesh(mergeGeometries(fronds), LEAF);
  crown.geometry.computeVertexNormals();
  crown.castShadow = true;
  g.add(trunk, crown);
  return g;
}

// ───────────────────────────── the river ─────────────────────────────
/**
 * The Nile in the run's frame: x along the course (the boat at 0, the gates come from +x), z across the water. `width`
 * is the water between the banks; the run's three lanes must fit in it (lanes 4 m apart: 8 m from side to side).
 */
export function riverTrack({ width = 17, length = 260, back = 40, palms = 22 } = {}) {
  const g = new THREE.Group();
  g.name = 'river';
  const mid = length / 2 - back;
  const ripples = RIPPLES([length / 24, width / 24]);
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(length, width + 6),
    new THREE.MeshPhysicalMaterial({
      color: 0x2b6c8a,
      roughness: 0.12,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      normalMap: ripples,
      normalScale: new THREE.Vector2(0.55, 0.55),
    }),
  );
  water.name = 'water';
  water.rotation.x = -Math.PI / 2;
  water.position.set(mid, 0, 0);
  water.receiveShadow = true;
  g.add(water);
  const scrolls = [ripples];
  const banks = [-1, 1].map((side) => {
    const silt = SILT([length / 10, 6]);
    const bank = new THREE.Mesh(
      new THREE.BoxGeometry(length, 1.2, 60),
      new THREE.MeshStandardMaterial({ map: silt, roughness: 1 }),
    );
    bank.name = 'bank';
    bank.position.set(mid, 0.2, side * (width / 2 + 30));
    bank.receiveShadow = true;
    const crops = CROPS([length / 16, 2]);
    const field = new THREE.Mesh(
      new THREE.PlaneGeometry(length, 40),
      new THREE.MeshStandardMaterial({ map: crops, roughness: 1 }),
    );
    field.name = 'field';
    field.rotation.x = -Math.PI / 2;
    field.position.set(mid, 0.82, side * (width / 2 + 34));
    field.receiveShadow = true;
    scrolls.push(silt, crops);
    g.add(bank, field);
    return bank;
  });
  const trees = [];
  for (let i = 0; i < palms; i += 1) {
    const p = palm(i + 90, 7 + hash(i, 4) * 4);
    const side = i % 2 ? 1 : -1;
    p.position.set(-back + (i * length) / palms, 0.8, side * (width / 2 + 3 + hash(i, 5) * 6));
    p.rotation.y = hash(i, 9) * Math.PI * 2;
    g.add(p);
    trees.push(p);
  }
  g.userData = {
    width,
    banks,
    palms: trees,
    /** The river passes by: `step` metres towards the boat. */
    flow(step) {
      for (const t of scrolls) t.offset.x = (t.offset.x + (step / length) * t.repeat.x) % 1;
      for (const p of trees) {
        p.position.x -= step;
        if (p.position.x < -back) p.position.x += length;
      }
    },
    /** The current, even when the boat waits. */
    tick(dt) {
      ripples.offset.y = (ripples.offset.y + dt * 0.01) % 1;
    },
  };
  return g;
}

// ───────────────────────────── the felucca ─────────────────────────────
const SAIL_YAW = -(Math.PI / 2 + 0.25);
/**
 * Zero's boat (the mock-up's, kept): the hull narrows to the prow and the stern and rises at both ends, the painted band of
 * a Nile felucca along its gunwale, the mast ahead of him and its lateen sail set along the boat, a little out over the
 * side (edge-on to the camera behind him, which looks over it at the buoys). Built along +z (the prow), its origin where
 * Zero stands at the helm: `userData.deck` is the height of his feet over the water.
 */
export function felucca({ scale = 1 } = {}) {
  const outer = new THREE.Group();
  outer.name = 'felucca';
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x7a4f2a, roughness: 0.8 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x4a2f19, roughness: 0.85 });
  const paint = new THREE.MeshStandardMaterial({ color: 0x2f6fb0, roughness: 0.6 });
  const shapeHull = (geo, rise = 0.6) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i += 1) {
      const z = p.getZ(i);
      const k = 1 - Math.abs(z / 2.8) ** 2.2 * 0.75; // narrow to the prow and the stern
      p.setX(i, p.getX(i) * k);
      if (p.getY(i) < 0) p.setX(i, p.getX(i) * 0.6);
      p.setY(i, p.getY(i) + Math.abs(z / 2.8) ** 3 * rise);
    }
    geo.computeVertexNormals();
    return geo;
  };
  const hull = new THREE.Mesh(shapeHull(new THREE.BoxGeometry(2.4, 0.7, 5.6, 1, 1, 8)), wood);
  hull.name = 'hull';
  hull.position.y = 0.25;
  hull.castShadow = true;
  const band = new THREE.Mesh(shapeHull(new THREE.BoxGeometry(2.46, 0.14, 5.64, 1, 1, 8), 0.62), paint);
  band.position.y = 0.52;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 3.6), dark);
  deck.position.y = 0.55;
  deck.receiveShadow = true;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 4.2, 8), wood);
  mast.position.set(0, 0.55 + 2.1, 0.6);
  mast.castShadow = true;
  const sail = new THREE.Mesh(
    new THREE.ShapeGeometry(
      new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(2.7, 0.3), new THREE.Vector2(0.15, 3.75)]),
    ),
    new THREE.MeshStandardMaterial({ color: 0xf4ead6, roughness: 0.9, side: THREE.DoubleSide }),
  );
  sail.name = 'sail';
  sail.position.set(0, 0.9, 0.6);
  sail.rotation.y = SAIL_YAW; // from the mast towards the prow, a little out over the side: edge-on to the camera
  sail.castShadow = true;
  const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.5), dark);
  rudder.position.set(0, 0.15, -2.95);
  g.add(hull, band, deck, mast, sail, rudder);
  // Zero stands aft of the mast, at the helm (1.3 m behind the middle): that spot is the origin
  g.position.set(0, 0, 1.3);
  outer.add(g);
  outer.scale.setScalar(scale);
  outer.userData = {
    deck: 0.58 * scale,
    sail,
    tick(dt, t) {
      sail.rotation.y = SAIL_YAW + Math.sin(t * 0.9) * 0.04; // the sail breathes in the wind
    },
  };
  return outer;
}

// ───────────────────────────── the crocodile ─────────────────────────────
/**
 * A Nile crocodile (the mock-up's): a low body, a long snout, a ridged back and yellow eyes, HALF UNDER THE WATER — only
 * its back, its eyes and its snout break the surface. Its snout points to −x, towards the boat that comes.
 */
export function crocodile() {
  const outer = new THREE.Group();
  outer.name = 'crocodile';
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0x3d5228, roughness: 0.85 });
  const belly = new THREE.MeshStandardMaterial({ color: 0x6f7a45, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.55, 3.6), skin);
  body.position.y = 0.05;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.42, 1.2), skin);
  head.position.set(0, 0.08, 2.3);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.28, 1.5), belly);
  snout.position.set(0, 0.02, 3.5);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.55, 3.4, 6), skin);
  tail.rotation.x = -Math.PI / 2;
  tail.position.set(0, 0.02, -3.4);
  g.add(body, head, snout, tail);
  for (let i = 0; i < 7; i += 1) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.3), skin);
    r.position.set(i % 2 ? 0.3 : -0.3, 0.38, -1.4 + i * 0.45);
    g.add(r);
  }
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xf2d02a, emissive: 0x4a3a00 });
  for (const x of [-0.3, 0.3]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), eyeMat);
    e.name = 'eye';
    e.position.set(x, 0.36, 2.0);
    g.add(e);
  }
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  g.rotation.y = -Math.PI / 2; // the snout (+z of the body) towards −x
  g.position.y = -0.12; // half under: the water at 0 cuts the body in two
  outer.add(g);
  outer.scale.setScalar(0.7); // about 6.5 m from the snout to the tail: a big Nile crocodile, narrower than a lane
  outer.userData = {
    body: g,
    tick(dt, t) {
      g.rotation.y = -Math.PI / 2 + Math.sin(t * 1.6 + outer.position.z) * 0.12;
      g.position.y = -0.12 + Math.sin(t * 2.1 + outer.position.z) * 0.04;
      tail.rotation.z = Math.sin(t * 3) * 0.15;
    },
  };
  return outer;
}

// ───────────────────────────── the number buoy ─────────────────────────────
const BUOY_LOOK = {
  idle: { light: 0xfff2c2, glow: 0.35, body: 0xe8692c },
  taken: { light: 0x2fe37a, glow: 1.4, body: 0xe8692c },
  right: { light: 0x2fe37a, glow: 1.4, body: 0xe8692c },
  picked: { light: 0xfbbf24, glow: 1.2, body: 0xe8692c },
  other: { light: 0x8a94a8, glow: 0.05, body: 0x9a5a3c },
};
/**
 * A number buoy (the mock-up's: an orange float with its white band) and a lamp on its top that the run lights:
 * green on the right one, amber on his when it was not, dim on the others; the right one he TOOK sinks (the mock-up's
 * buoy is collected). Its number is the kit's PAGE text
 * (`kit/GateRunHud.jsx`), placed over it at `labelY` — never a texture, so it reads at its size.
 */
export function buoy() {
  const outer = new THREE.Group();
  outer.name = 'buoy';
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: BUOY_LOOK.idle.body, roughness: 0.5 });
  const float = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 1.6, 20), bodyMat);
  float.position.y = 0.5;
  float.castShadow = true;
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.93, 0.98, 0.35, 20),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
  );
  band.position.y = 0.6;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.5, 20), bodyMat);
  cap.position.y = 1.55;
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x2b2b2b }),
  );
  pole.position.y = 2.1;
  const lampMat = new THREE.MeshStandardMaterial({
    color: BUOY_LOOK.idle.light,
    emissive: BUOY_LOOK.idle.light,
    emissiveIntensity: BUOY_LOOK.idle.glow,
  });
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), lampMat);
  lamp.name = 'lamp';
  lamp.position.y = 2.5;
  g.add(float, band, cap, pole, lamp);
  outer.add(g);
  outer.userData = {
    state: 'idle',
    lamp,
    dress(state) {
      const look = BUOY_LOOK[state] ?? BUOY_LOOK.idle;
      outer.userData.state = state in BUOY_LOOK ? state : 'idle';
      lampMat.color.set(look.light);
      lampMat.emissive.set(look.light);
      lampMat.emissiveIntensity = look.glow;
      bodyMat.color.set(look.body);
    },
    tick(dt, t) {
      const ph = outer.position.z * 0.7;
      const sink = outer.userData.state === 'taken' ? Math.min(3, (outer.userData.sunk ?? 0) + dt * 6) : 0;
      outer.userData.sunk = sink;
      g.visible = sink < 3;
      g.position.y = Math.sin(t * 2 + ph) * 0.08 - sink;
      g.rotation.x = Math.sin(t * 1.4 + ph) * 0.06;
      g.rotation.z = Math.cos(t * 1.7 + ph) * 0.06;
    },
  };
  return outer;
}

/**
 * The run's options for the felucca (what the world passes to `new GateRun(this, { …, ...riverRun() })`): the river
 * skin and the crocodiles. Lanes 4 m apart (the boat is 2.4 m wide, a buoy 2.2 m: the three numbers never touch), the
 * numbers over the buoys at 3.4 m, a camera higher and further back than the rail's, looking over the sail at the buoys.
 */
export function riverRun({ every = 1, cost = 1 } = {}) {
  return {
    skin: {
      name: 'river',
      track: () => riverTrack(),
      rider: () => felucca(),
      gate: () => buoy(),
      lanes: 4,
      labelY: 3.4,
      lead: 4.2, // the prow meets the buoy
      bob: 0.08,
      camera: { back: 12, up: 7, ahead: 18, look: 0.5 },
    },
    hazards: { mesh: () => crocodile(), every, cost },
    // three seconds more before the first buoy: he settles in the boat before the first question (owner, 2026-11-25)
    warmup: 3,
  };
}
