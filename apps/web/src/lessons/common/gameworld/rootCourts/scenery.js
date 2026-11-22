/**
 * « Le palais des dalles » — what is DRAWN in the 3D world: a terrace of the palace, a tiled court, the platform, the palms, the
 * towers, the things a terrace may hold (the mirror of the forge, a calculator on its stand, the two stations).
 * Pure builders: each returns a THREE.Group (and the parts the game moves). They name no lesson; every word on a sign
 * comes from the caller. Drawn to scale: a court of L tiles a side is L × `unit` wide, its tiles are counted, and the
 * tiles along its two far walls are CUT when L is not whole.
 */
import * as THREE from 'three';
import { std, glow } from '../engine/builders';

const SAND = 0xe9d2a0;
const SAND_DARK = 0xcfa96c;
const ROCK = 0xb5854f;
const LIME = 0xfbf3df; // the whitewashed walls of the palace
const BLUE = 0x1d4ed8;
const BRASS = 0xd9aa4a;
const FONT = '"Inter", "Segoe UI", system-ui, sans-serif';

const mesh = (geo, mat, x = 0, y = 0, z = 0, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
};
const box = (w, h, d, mat, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z);

/**
 * A sign that always faces the camera, its text laid out left to right (a formula is never read backwards). `set(text)`
 * redraws it.
 */
export function makeLabel(text, { h = 0.9, bg = '#0f2147', color = '#ffffff', on = true } = {}) {
  const canvas = document.createElement('canvas');
  const g = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.renderOrder = 30;
  const font = `800 78px ${FONT}`;
  let shown = null;
  sprite.userData.set = (t) => {
    const s = String(t ?? '');
    if (s === shown) return;
    shown = s;
    sprite.userData.text = s; // what it says, for a walk that reads the 3D labels (the gate's « ? », the side's length)
    g.font = font;
    const w = Math.ceil(g.measureText(s).width + 96);
    // a WebGL texture cannot change size once uploaded: a text of another width gets a fresh one
    canvas.width = w;
    canvas.height = 132;
    g.font = font;
    g.direction = 'ltr';
    g.fillStyle = bg;
    g.beginPath();
    g.roundRect(0, 0, w, 132, 46);
    g.fill();
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(s, w / 2, 72);
    sprite.material.map.dispose();
    const fresh = new THREE.CanvasTexture(canvas);
    fresh.colorSpace = THREE.SRGBColorSpace;
    sprite.material.map = fresh;
    sprite.material.needsUpdate = true;
    sprite.scale.set((h * w) / 132, h, 1);
  };
  sprite.userData.set(text);
  sprite.visible = on;
  return sprite;
}

/** A date palm: a leaning trunk in rings, a crown of drooping fronds, a cluster of dates. */
function makePalm(rand, s = 1) {
  const g = new THREE.Group();
  const bark = std(0x9a6b3c);
  const lean = (rand() - 0.5) * 0.5;
  const rings = 7;
  let top = new THREE.Vector3();
  for (let i = 0; i < rings; i += 1) {
    const t = i / (rings - 1);
    const r = 0.26 - t * 0.09;
    const ring = mesh(new THREE.CylinderGeometry(r * 0.92, r, 0.62, 7), bark, lean * t * t * 1.6, 0.31 + i * 0.6, 0);
    g.add(ring);
    top = ring.position.clone().setY(ring.position.y + 0.3);
  }
  const leaves = [std(0x2f8f4e), std(0x3fa55c), std(0x257a40)];
  for (let i = 0; i < 9; i += 1) {
    const frond = new THREE.Group();
    const blade = mesh(new THREE.ConeGeometry(0.34, 2.9, 4), leaves[i % 3], 0, 1.45, 0);
    blade.scale.set(1, 1, 0.16);
    frond.add(blade);
    frond.position.copy(top);
    frond.rotation.set(0, (i / 9) * Math.PI * 2 + rand() * 0.3, 0);
    blade.rotation.z = -(1.05 + rand() * 0.45);
    blade.position.set(1.15, 0.55, 0);
    g.add(frond);
  }
  for (let i = 0; i < 5; i += 1)
    g.add(
      mesh(
        new THREE.SphereGeometry(0.1, 6, 5),
        std(0xd97706),
        top.x + (rand() - 0.5) * 0.4,
        top.y - 0.25,
        (rand() - 0.5) * 0.4,
      ),
    );
  g.scale.setScalar(s);
  return g;
}

/** A round tower of the palace with its dome and a lit window. */
function makeTower(h = 5.2) {
  const g = new THREE.Group();
  const lime = std(LIME, { flatShading: false });
  g.add(mesh(new THREE.CylinderGeometry(1.25, 1.45, h, 14), lime, 0, h / 2, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.28, 14), std(SAND_DARK), 0, h + 0.1, 0));
  g.add(mesh(new THREE.SphereGeometry(1.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), lime, 0, h + 0.2, 0));
  g.add(mesh(new THREE.SphereGeometry(0.16, 8, 6), glow(BRASS, 0.8), 0, h + 1.62, 0));
  g.add(box(0.5, 0.9, 0.1, glow(0xffd98a, 1.3), 0, h * 0.62, 1.34));
  return g;
}

/**
 * A terrace: a slab of sandstone on a floating rock, a whitewashed parapet with merlons and blind arches behind, two
 * towers, palms. `w` × `d`, centred on the group's origin; the walkable top is y = 0.
 */
export function makeTerrace(w, d, rand) {
  const g = new THREE.Group();
  g.add(box(w, 0.5, d, std(SAND), 0, -0.25, 0));
  g.add(box(w + 0.6, 0.3, d + 0.6, std(SAND_DARK), 0, -0.62, 0));
  // the rock under it: a square frustum, then loose stones
  const under = mesh(new THREE.CylinderGeometry(1, 0.34, 7.5, 4, 1), std(ROCK), 0, -4.5, 0);
  under.rotation.y = Math.PI / 4;
  under.scale.set(w / Math.SQRT2, 1, d / Math.SQRT2);
  g.add(under);
  for (let i = 0; i < 7; i += 1)
    g.add(
      mesh(
        new THREE.DodecahedronGeometry(0.5 + rand() * 0.9, 0),
        std(ROCK),
        (rand() - 0.5) * w * 0.7,
        -8.6 - rand() * 2.4,
        (rand() - 0.5) * d * 0.7,
      ),
    );
  // the parapet at the back: a wall, its merlons, its blind arches
  const lime = std(LIME);
  const back = -d / 2 + 0.4;
  g.add(box(w - 3.2, 2.3, 0.7, lime, 0, 1.15, back));
  for (let x = -w / 2 + 2.6; x <= w / 2 - 2.6; x += 1.7) g.add(box(0.85, 0.5, 0.7, lime, x, 2.55, back));
  const shade = std(0xd9c39a);
  for (let x = -w / 2 + 4.2; x <= w / 2 - 4.2; x += 3.4) {
    g.add(box(1.1, 1.2, 0.08, shade, x, 0.6, back + 0.37));
    const arch = mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.08, 14, 1, false, 0, Math.PI),
      shade,
      x,
      1.2,
      back + 0.37,
    );
    arch.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    g.add(arch);
  }
  for (const sx of [-1, 1]) {
    const tower = makeTower(4.6 + rand() * 1.4);
    tower.position.set(sx * (w / 2 - 1.2), 0, back);
    g.add(tower);
    g.add(box(0.6, 0.7, d * 0.42, lime, sx * (w / 2 - 0.3), 0.35, -d * 0.27));
  }
  // palms on the two sides, clear of the lens that follows him from the front
  const palms = [
    [-w / 2 + 1.9, 2.6],
    [w / 2 - 1.9, 3.4],
  ];
  palms.forEach(([x, z]) => {
    const p = makePalm(rand, 0.95 + rand() * 0.25);
    p.position.set(x, 0, z);
    g.add(p);
  });
  return g;
}

/** The floor of a court: `L` tiles a side in two tones, cut along the two far walls when L is not whole. */
function courtTexture(L) {
  const px = Math.max(24, Math.min(128, Math.floor(1100 / Math.max(1, L))));
  const size = Math.max(16, Math.round(L * px));
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  for (let i = 0; i < L; i += 1)
    for (let j = 0; j < L; j += 1) {
      // the corner post is the bottom left of the canvas: whole tiles start there
      g.fillStyle = (i + j) % 2 ? '#f6ead0' : '#ecd9ae';
      g.fillRect(i * px, size - (j + 1) * px, px, px);
      g.strokeStyle = '#b88a3e';
      g.lineWidth = Math.max(1.5, px / 22);
      g.strokeRect(i * px, size - (j + 1) * px, px, px);
      if (px >= 48) {
        // a small star of zellige in the middle of each tile
        g.fillStyle = (i + j) % 2 ? '#93c5fd' : '#60a5fa';
        g.beginPath();
        const cx = i * px + px / 2;
        const cy = size - (j + 1) * px + px / 2;
        for (let k = 0; k < 8; k += 1) {
          const r = k % 2 ? px * 0.07 : px * 0.15;
          const a = (k / 8) * Math.PI * 2;
          g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        g.fill();
      }
    }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** The ruler along the wall where the rod is pulled: a mark per tile, numbered, from the corner post. */
function rulerTexture(n) {
  const px = 96;
  const c = document.createElement('canvas');
  c.width = n * px;
  c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#16306b';
  g.fillRect(0, 0, c.width, 64);
  g.fillStyle = '#ffffff';
  g.font = `800 34px ${FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (let i = 0; i <= n; i += 1) {
    g.fillRect(i * px - 2, 0, 4, 22);
    for (let k = 1; k < 10; k += 1) g.fillRect(i * px + (k * px) / 10 - 1, 0, 2, k === 5 ? 15 : 9);
    if (i > 0 && i < n) g.fillText(String(i), i * px, 42);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/**
 * A court of `side` tiles a side (a number for drawing), `unit` world units per tile. The group's origin is the CORNER
 * POST, where the rod starts: the court spans x ∈ [0, S], z ∈ [−S, 0]; the rod is pulled along +x, in front of the wall.
 * Returns the parts the game moves: `band` (the amber floor a small platform leaves), `plaque` (the gate's sign),
 * `far` (the corner where a rod is clamped), `reach` (how far the ruler goes, in tiles).
 */
export function makeCourt(side, unit, sign) {
  const g = new THREE.Group();
  const S = side * unit;
  const floor = mesh(
    new THREE.PlaneGeometry(S, S),
    new THREE.MeshStandardMaterial({ map: courtTexture(side), roughness: 0.82 }),
    S / 2,
    0.02,
    -S / 2,
    false,
  );
  floor.rotation.x = -Math.PI / 2;
  g.add(floor);
  const band = mesh(
    new THREE.PlaneGeometry(S, S),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0 }),
    S / 2,
    0.035,
    -S / 2,
    false,
  );
  band.rotation.x = -Math.PI / 2;
  g.add(band);
  // the glazed blue kerb, the four posts
  const kerb = std(BLUE, { flatShading: false, roughness: 0.35 });
  g.add(box(S + 0.36, 0.16, 0.18, kerb, S / 2, 0.08, 0.09), box(S + 0.36, 0.16, 0.18, kerb, S / 2, 0.08, -S - 0.09));
  g.add(box(0.18, 0.16, S, kerb, -0.09, 0.08, -S / 2), box(0.18, 0.16, S, kerb, S + 0.09, 0.08, -S / 2));
  const brass = std(BRASS, { flatShading: false, metalness: 0.5, roughness: 0.35 });
  for (const [x, z] of [
    [S, 0],
    [S, -S],
    [0, -S],
  ]) {
    g.add(mesh(new THREE.CylinderGeometry(0.11, 0.14, 1.0, 10), brass, x, 0.5, z));
    g.add(mesh(new THREE.SphereGeometry(0.17, 10, 8), glow(0xffd98a, 0.9), x, 1.08, z));
  }
  // the corner post, where the rod is anchored: taller, blue
  g.add(mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.5, 12), std(0x1e3a8a, { flatShading: false }), 0, 0.75, 0));
  const lamp = mesh(new THREE.SphereGeometry(0.26, 14, 10), glow(0x60a5fa, 1.6), 0, 1.62, 0);
  g.add(lamp);
  // the rod at rest on its post, lit, and a ring of light on the ground around it: « it is here » (shown while it can be taken)
  const handle = new THREE.Group();
  handle.add(
    mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.1, 10).rotateZ(Math.PI / 2), glow(0x06b6d4, 2.4), 0.55, 0.95, 0.75),
  );
  handle.add(mesh(new THREE.SphereGeometry(0.2, 12, 10), glow(0x22d3ee, 2.6), 1.1, 0.95, 0.75));
  const halo = mesh(new THREE.RingGeometry(0.9, 1.3, 40), glow(0x06b6d4, 2.4), 0, 0.04, 1.25);
  halo.rotation.x = -Math.PI / 2;
  halo.material.transparent = true;
  halo.material.side = THREE.DoubleSide;
  handle.add(halo);
  handle.userData.halo = halo;
  g.add(handle);
  // the far corner along the wall: where a rod is clamped, corner to corner
  const far = mesh(new THREE.TorusGeometry(0.42, 0.07, 8, 22), glow(0x7dd3fc, 1.4), S, 1.25, 0);
  far.rotation.x = Math.PI / 2;
  far.visible = false;
  g.add(far);
  // the ruler on the ground, in front of the wall
  const reach = Math.ceil(side) + 1;
  const ruler = mesh(
    new THREE.PlaneGeometry(reach * unit, 0.62),
    new THREE.MeshBasicMaterial({ map: rulerTexture(reach) }),
    (reach * unit) / 2,
    0.03,
    0.72,
    false,
  );
  ruler.rotation.x = -Math.PI / 2;
  g.add(ruler);
  // the gate behind the court: two pillars, a lintel, the plaque with the area
  const lime = std(LIME);
  const gz = -S - 1.0;
  g.add(box(0.5, 2.6, 0.5, lime, S / 2 - 1.9, 1.3, gz), box(0.5, 2.6, 0.5, lime, S / 2 + 1.9, 1.3, gz));
  g.add(box(4.6, 0.5, 0.6, std(SAND_DARK), S / 2, 2.85, gz));
  g.add(box(3.4, 1.25, 0.16, std(0x10224d, { flatShading: false }), S / 2, 1.85, gz + 0.3));
  const plaque = makeLabel(sign, { h: 1.05, bg: '#10224d' });
  plaque.position.set(S / 2, 1.85, gz + 0.5);
  g.add(plaque);
  return { group: g, band, far, lamp, handle, plaque, reach, size: S };
}

/**
 * The platform built on the rod: a slab of light that grows from the corner post. `resize(len)` sets its side (world
 * units) and keeps its own grid of tiles aligned with the court's (`unit` world units per tile).
 */
export function makePlatform(unit) {
  const g = new THREE.Group();
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = '#dbeafe';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    transparent: true,
    opacity: 0.86,
    emissive: 0x2563eb,
    emissiveIntensity: 0.35,
    roughness: 0.4,
  });
  const geo = new THREE.BoxGeometry(1, 0.16, 1).translate(0.5, 0, -0.5);
  const slab = new THREE.Mesh(geo, mat);
  slab.castShadow = true;
  g.add(slab);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xffffff }));
  g.add(edge);
  g.userData.resize = (len) => {
    const s = Math.max(0.02, len);
    slab.scale.set(s, 1, s);
    edge.scale.set(s, 1, s);
    tex.repeat.set(s / unit, s / unit);
    // the texture's origin is the corner post too (v runs away from it)
    tex.offset.set(0, 1 - ((s / unit) % 1));
  };
  /** The colour of what it did: blue while it hovers, amber over a band, violet when jammed, green when it rides. */
  g.userData.tone = (kind) => {
    const col = { band: 0x3b82f6, jam: 0x8b5cf6, ride: 0x22c55e }[kind] ?? 0x3b82f6;
    mat.emissive.set(col);
    mat.color.set(kind === 'jam' ? 0xc4b5fd : kind === 'ride' ? 0xbbf7d0 : 0xffffff);
    mat.emissiveIntensity = kind === 'ride' ? 0.75 : 0.35;
    mat.opacity = kind === 'hover' ? 0.5 : 0.88;
  };
  g.userData.resize(0.02);
  return g;
}

/** The pad where a platform lands and waits: a square of light on the terrace. */
export function makePad() {
  const g = new THREE.Group();
  const ring = mesh(
    new THREE.RingGeometry(1.5, 1.85, 4, 1),
    new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
    0,
    0.04,
    0,
    false,
  );
  ring.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
  g.add(ring);
  return g;
}

/** The mirror of the forge: a horseshoe arch of the palace holding a sheet of light. */
function makeMirror() {
  const g = new THREE.Group();
  const lime = std(LIME);
  g.add(box(0.6, 3.4, 0.6, lime, -1.5, 1.7, 0), box(0.6, 3.4, 0.6, lime, 1.5, 1.7, 0));
  const arch = mesh(new THREE.TorusGeometry(1.5, 0.3, 10, 22, Math.PI), lime, 0, 3.4, 0);
  g.add(arch);
  const sheet = mesh(
    new THREE.PlaneGeometry(2.5, 3.6),
    new THREE.MeshStandardMaterial({
      color: 0x9bdcff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
    }),
    0,
    1.95,
    0,
    false,
  );
  g.add(sheet);
  g.add(mesh(new THREE.CircleGeometry(1.2, 22, 0, Math.PI), sheet.material, 0, 3.72, 0, false));
  g.userData.pulse = sheet.material;
  return g;
}

/** A calculator on its stand: its ten digits are on its screen (`screen`, text). */
function makeCalculator(screen) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.45, 0.65, 1.2, 10), std(SAND_DARK), 0, 0.6, 0));
  const body = new THREE.Group();
  body.add(box(2.2, 0.28, 2.9, std(0x1e293b, { flatShading: false }), 0, 0, 0));
  body.add(box(1.9, 0.06, 0.7, glow(0xa7f3d0, 0.9), 0, 0.17, -0.9));
  const keys = [std(0x475569), std(0x2563eb), std(0xf59e0b)];
  for (let i = 0; i < 4; i += 1)
    for (let j = 0; j < 4; j += 1)
      body.add(box(0.38, 0.1, 0.34, keys[j === 3 ? 2 : i === 3 ? 1 : 0], -0.72 + j * 0.48, 0.19, -0.25 + i * 0.44));
  body.position.set(0, 1.5, 0);
  body.rotation.x = 0.55;
  g.add(body);
  const digits = makeLabel(screen ?? '', { h: 0.62, bg: '#064e3b', color: '#a7f3d0' });
  digits.position.set(0, 3.0, 0);
  g.add(digits);
  return g;
}

/** The two stations: one builds a court on a rod, the other takes the side of a court. Their names are the caller's. */
function makeStations(names = []) {
  const g = new THREE.Group();
  const lime = std(LIME);
  const frame = (x, tint) => {
    const s = new THREE.Group();
    s.add(box(2.6, 0.5, 2.6, std(SAND_DARK), 0, 0.25, 0));
    s.add(box(0.3, 2.4, 0.3, lime, -1.1, 1.7, -1.1), box(0.3, 2.4, 0.3, lime, 1.1, 1.7, -1.1));
    s.add(box(2.6, 0.3, 0.3, lime, 0, 2.95, -1.1));
    s.add(mesh(new THREE.TorusGeometry(0.75, 0.09, 8, 4), glow(tint, 1.2), 0, 1.5, 0, false));
    s.position.x = x;
    return s;
  };
  const a = frame(-2.2, 0x60a5fa);
  a.children[4].rotation.set(Math.PI / 2, 0, Math.PI / 4); // a square of light lying flat: a court comes out
  const b = frame(2.2, 0xfbbf24);
  b.children[4].scale.set(1.5, 0.12, 1); // a bar of light: a rod comes out
  g.add(a, b);
  names.slice(0, 2).forEach((name, i) => {
    const sign = makeLabel(name, { h: 0.62 });
    sign.position.set(i ? 2.2 : -2.2, 3.7, -1.1);
    g.add(sign);
  });
  return g;
}

/**
 * THE BUILDING YARD — a crate of loose tiles and bare ground: he lays the tiles as a SQUARE (the root's own gesture:
 * from the number of tiles to the side). Same corner post, same lit rod and same ruler as a court, so that taking the
 * rod here is the gesture he keeps for the whole palace. `reach` is how far the ruler goes, in tiles.
 * Returns the parts the game moves: `lamp`, `handle`, `far` (never shown here), `count` (the label over the crate),
 * `plaque` (shown once the square stands), `wall(n)` (the kerb rises round a square of n tiles a side, or goes with 0).
 */
export function makeYard(unit, reach) {
  const g = new THREE.Group();
  const R = reach * unit;
  const ground = mesh(
    new THREE.PlaneGeometry(R, R),
    new THREE.MeshStandardMaterial({ color: SAND_DARK, roughness: 0.95, transparent: true, opacity: 0.55 }),
    R / 2,
    0.015,
    -R / 2,
    false,
  );
  ground.rotation.x = -Math.PI / 2;
  g.add(ground);
  g.add(mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.5, 12), std(0x1e3a8a, { flatShading: false }), 0, 0.75, 0));
  const lamp = mesh(new THREE.SphereGeometry(0.26, 14, 10), glow(0x60a5fa, 1.6), 0, 1.62, 0);
  g.add(lamp);
  const handle = new THREE.Group();
  handle.add(
    mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.1, 10).rotateZ(Math.PI / 2), glow(0x06b6d4, 2.4), 0.55, 0.95, 0.75),
  );
  handle.add(mesh(new THREE.SphereGeometry(0.2, 12, 10), glow(0x22d3ee, 2.6), 1.1, 0.95, 0.75));
  const halo = mesh(new THREE.RingGeometry(0.9, 1.3, 40), glow(0x06b6d4, 2.4), 0, 0.04, 1.25);
  halo.rotation.x = -Math.PI / 2;
  halo.material.transparent = true;
  halo.material.side = THREE.DoubleSide;
  handle.add(halo);
  handle.userData.halo = halo;
  g.add(handle);
  const far = new THREE.Group();
  far.visible = false;
  g.add(far);
  const ruler = mesh(
    new THREE.PlaneGeometry(R, 0.62),
    new THREE.MeshBasicMaterial({ map: rulerTexture(reach) }),
    R / 2,
    0.03,
    0.72,
    false,
  );
  ruler.rotation.x = -Math.PI / 2;
  g.add(ruler);
  // the crate of tiles, left of the post, and the number of tiles still in it
  const wood = std(0x9a6a3a);
  g.add(box(1.7, 1.1, 1.7, wood, -1.9, 0.55, -1.0));
  g.add(box(1.8, 0.12, 1.8, std(0x7a5230), -1.9, 1.14, -1.0));
  g.add(box(1.3, 0.12, 1.3, std(LIME), -1.9, 1.22, -1.0));
  const count = makeLabel('', { h: 0.95, bg: '#7a5230' });
  count.position.set(-1.9, 2.25, -1.0);
  g.add(count);
  const plaque = makeLabel('', { h: 1.0, bg: '#10224d' });
  plaque.visible = false;
  g.add(plaque);
  const kerbs = new THREE.Group();
  g.add(kerbs);
  const kerb = std(BLUE, { flatShading: false, roughness: 0.35 });
  const wall = (n) => {
    kerbs.clear();
    plaque.visible = n > 0;
    if (!n) return;
    const S = n * unit;
    kerbs.add(
      box(S + 0.36, 0.16, 0.18, kerb, S / 2, 0.08, 0.09),
      box(S + 0.36, 0.16, 0.18, kerb, S / 2, 0.08, -S - 0.09),
    );
    kerbs.add(box(0.18, 0.16, S, kerb, -0.09, 0.08, -S / 2), box(0.18, 0.16, S, kerb, S + 0.09, 0.08, -S / 2));
    plaque.position.set(S / 2, 1.7, -S - 0.4);
  };
  return { group: g, lamp, handle, far, count, plaque, wall, reach, size: R * 0.75 };
}

/**
 * The tiles of a yard, laid one by one from the corner post, row after row: `resize(len)` lays a square of that side
 * with the tiles the crate HOLDS (`setArea`) — when the crate is empty the cells still open show as holes.
 * It answers the same calls as a court's platform (`resize`, `tone`), so the rod drives it the same way.
 */
export function makeYardTiles(unit, reach) {
  const g = new THREE.Group();
  const max = reach * reach;
  const mat = new THREE.MeshStandardMaterial({
    color: 0xfdf3d8,
    emissive: 0x22c55e,
    emissiveIntensity: 0,
    roughness: 0.6,
  });
  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(unit * 0.92, 0.1, unit * 0.92), mat, max);
  tiles.castShadow = true;
  const holes = new THREE.InstancedMesh(
    new THREE.BoxGeometry(unit * 0.92, 0.03, unit * 0.92),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.5 }),
    max,
  );
  g.add(tiles, holes);
  const m = new THREE.Matrix4();
  let area = 0;
  let n = 0;
  const lay = () => {
    let t = 0;
    let h = 0;
    for (let k = 0; k < n * n; k += 1) {
      m.makeTranslation(((k % n) + 0.5) * unit, 0, -(Math.floor(k / n) + 0.5) * unit);
      if (k < area) tiles.setMatrixAt(t++, m);
      else holes.setMatrixAt(h++, m);
    }
    tiles.count = t;
    holes.count = h;
    tiles.instanceMatrix.needsUpdate = true;
    holes.instanceMatrix.needsUpdate = true;
  };
  g.userData.setArea = (a) => {
    area = a;
    lay();
  };
  g.userData.resize = (len) => {
    const next = Math.min(reach, Math.max(0, Math.round(len / unit)));
    if (next === n) return;
    n = next;
    lay();
  };
  g.userData.tone = (kind) => {
    mat.emissiveIntensity = kind === 'ride' ? 0.55 : 0;
  };
  lay();
  return g;
}

/** The gate of light of a course of gates: an arch of the rail's own cyan, a veil that breathes (`userData.pulse`). */
function makeLightGate() {
  const g = new THREE.Group();
  const mat = glow(0x35d8f0, 1.4);
  for (const x of [-1.5, 1.5]) g.add(mesh(new THREE.BoxGeometry(0.22, 3.6, 0.22), mat, x, 1.8, 0));
  g.add(mesh(new THREE.BoxGeometry(3.22, 0.22, 0.22), mat, 0, 3.6, 0));
  const veil = mesh(
    new THREE.PlaneGeometry(2.8, 3.4),
    new THREE.MeshStandardMaterial({
      color: 0x8fb8ff,
      emissive: 0x6f9dff,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    0,
    1.75,
    0,
    false,
  );
  g.add(veil);
  g.userData.pulse = veil.material;
  return g;
}

/** The pavilion of the top terrace: a dome on four pillars over a lantern — where the climb ends. */
function makePavilion() {
  const g = new THREE.Group();
  const lime = std(LIME, { flatShading: false });
  g.add(mesh(new THREE.CylinderGeometry(4.4, 4.7, 0.5, 8), std(SAND_DARK), 0, 0.25, 0));
  for (let i = 0; i < 4; i += 1) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    g.add(mesh(new THREE.CylinderGeometry(0.3, 0.36, 4.2, 10), lime, Math.cos(a) * 3.1, 2.6, Math.sin(a) * 3.1));
  }
  g.add(mesh(new THREE.CylinderGeometry(4.1, 4.1, 0.45, 8), std(SAND_DARK), 0, 4.9, 0));
  g.add(mesh(new THREE.SphereGeometry(3.5, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), lime, 0, 5.1, 0));
  g.add(mesh(new THREE.SphereGeometry(0.32, 10, 8), glow(BRASS, 1), 0, 8.8, 0));
  const lantern = mesh(new THREE.OctahedronGeometry(0.75, 0), glow(0xffd98a, 2), 0, 2.4, 0, false);
  g.add(lantern);
  g.userData.spin = lantern;
  return g;
}

/** What a terrace may hold beside its courts: `{ kind: 'mirror' | 'calculator' | 'stations' | 'pavilion', screen?, names? }`. */
export function makeFeature(feature) {
  if (feature.kind === 'mirror') return makeMirror();
  if (feature.kind === 'calculator') return makeCalculator(feature.screen);
  if (feature.kind === 'pavilion') return makePavilion();
  if (feature.kind === 'run') return makeLightGate();
  return makeStations(feature.names);
}
