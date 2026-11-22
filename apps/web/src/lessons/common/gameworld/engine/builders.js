/**
 * Low-poly builders of the game worlds (three.js): islands, trees, rocks, crystals, clouds, text sprites, sky, particles.
 * Everything is drawn in code — no model, no texture file. Arabic and numbers are canvas text (shaped by the browser).
 */
import * as THREE from 'three';

export const seeded = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const FONT = "'Cairo', 'Tajawal', 'Noto Sans Arabic', system-ui, sans-serif";

export const std = (color, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: true, ...extra });
export const glow = (color, intensity = 1.2, extra = {}) =>
  new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.4,
    flatShading: true,
    ...extra,
  });

/** A sprite showing a text. `h` = world height. `setText` redraws it. */
export function textSprite(
  text,
  { h = 1, color = '#ffffff', bg = null, stroke = 'rgba(8,20,48,0.85)', weight = 800, pad = 0.35 } = {},
) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  const draw = (t) => {
    const px = 96;
    ctx.font = `${weight} ${px}px ${FONT}`;
    const w = Math.ceil(ctx.measureText(String(t)).width + px * (bg ? pad * 2 + 0.3 : 0.5));
    const hh = Math.ceil(px * 1.5);
    // a WebGL texture cannot change size once uploaded: a longer text needs a fresh one
    if (canvas.width !== Math.max(64, w) || canvas.height !== hh) tex.dispose();
    canvas.width = Math.max(64, w);
    canvas.height = hh;
    ctx.font = `${weight} ${px}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    ctx.clearRect(0, 0, canvas.width, hh);
    if (bg) {
      ctx.fillStyle = bg;
      const r = hh / 2;
      ctx.beginPath();
      ctx.roundRect(2, 2, canvas.width - 4, hh - 4, r);
      ctx.fill();
    }
    if (stroke) {
      ctx.lineWidth = 12;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = stroke;
      ctx.strokeText(String(t), canvas.width / 2, hh / 2 + 4);
    }
    ctx.fillStyle = color;
    ctx.fillText(String(t), canvas.width / 2, hh / 2 + 4);
    tex.needsUpdate = true;
    sprite.scale.set(h * (canvas.width / hh), h, 1);
  };
  draw(text);
  sprite.userData.setText = draw;
  return sprite;
}

/** A plane with a canvas texture (the robot's chest screen, boards). */
export function textPlane(text, { w = 1, h = 1, color = '#7dfcff', bg = '#06202b', px = 150 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
  const draw = (t, c = color, b = bg) => {
    ctx.fillStyle = b;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = c;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const s = String(t);
    ctx.font = `800 ${s.length > 2 ? px * 0.62 : s.length > 1 ? px * 0.85 : px}px ${FONT}`;
    ctx.fillText(s, 128, 138);
    tex.needsUpdate = true;
  };
  draw(text);
  mesh.userData.setText = draw;
  return mesh;
}

export const THEMES = {
  meadow: {
    grass: 0x6cc24a,
    lip: 0x8fdc5f,
    rock: 0x8a6f52,
    rockDark: 0x6b533c,
    leaf: [0x3fa34d, 0x58b85a, 0x2f8f4a],
    trunk: 0x7a5230,
    flower: [0xffe066, 0xff8fab, 0xffffff],
  },
  pine: {
    grass: 0x4fae5a,
    lip: 0x76cf70,
    rock: 0x7b6a5a,
    rockDark: 0x5c4d40,
    leaf: [0x1f7a4d, 0x2a9160, 0x17633d],
    trunk: 0x6a4526,
    flower: [0xffffff, 0xc7b8ff],
  },
  crystal: {
    grass: 0x5bb7a6,
    lip: 0x86dccb,
    rock: 0x6c6a8f,
    rockDark: 0x4d4b70,
    leaf: [0x49a0b8, 0x66c2c9, 0x3b7fa6],
    trunk: 0x5a4a6a,
    flower: [0xb69cff, 0x9be7ff],
  },
  stone: {
    grass: 0x9fb07a,
    lip: 0xbfd096,
    rock: 0x8d8d95,
    rockDark: 0x66666f,
    leaf: [0x6f9a4f, 0x88b060, 0x577d3f],
    trunk: 0x6b5a45,
    flower: [0xffd27a, 0xffffff],
  },
  autumn: {
    grass: 0xc9a544,
    lip: 0xe2c463,
    rock: 0x94614a,
    rockDark: 0x6f4635,
    leaf: [0xe2702f, 0xd9482b, 0xf2a93b],
    trunk: 0x5e3b22,
    flower: [0xfff1b8, 0xff9d6c],
  },
  snow: {
    grass: 0xe9f2fb,
    lip: 0xffffff,
    rock: 0x7f93ad,
    rockDark: 0x5b6e88,
    leaf: [0x3d7f73, 0x4f9a8a, 0x2f6a61],
    trunk: 0x5a4636,
    flower: [0xbfe3ff, 0xffffff],
  },
};

function jitter(geo, amount, rand, keep = () => false) {
  const pos = geo.attributes.position;
  const seen = new Map();
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (keep(x, y, z)) continue;
    const key = `${x.toFixed(3)}|${y.toFixed(3)}|${z.toFixed(3)}`;
    let d = seen.get(key);
    if (!d) {
      d = [(rand() - 0.5) * amount, (rand() - 0.5) * amount, (rand() - 0.5) * amount];
      seen.set(key, d);
    }
    pos.setXYZ(i, x + d[0], y + d[1], z + d[2]);
  }
  geo.computeVertexNormals();
  return geo;
}

/** A floating island: flat walkable top at y = 0 (radius R), a rock body tapering below. */
export function makeIsland(R, themeName, seed = 1) {
  const th = THEMES[themeName] ?? THEMES.meadow;
  const rand = seeded(seed);
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.94, 0.9, 40, 1), std(th.grass));
  top.position.y = -0.45;
  top.receiveShadow = true;
  g.add(top);
  const lip = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.12, R + 0.02, 0.28, 40, 1), std(th.lip));
  lip.position.y = -0.2;
  lip.receiveShadow = true;
  g.add(lip);
  const bodyH = R * 1.5;
  const bodyGeo = new THREE.ConeGeometry(R * 0.95, bodyH, 11, 4);
  jitter(bodyGeo, R * 0.16, rand, (x, y) => y < -bodyH / 2 + 0.01);
  const body = new THREE.Mesh(bodyGeo, std(th.rock));
  body.rotation.x = Math.PI;
  body.position.y = -0.85 - bodyH / 2;
  g.add(body);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.96, R * 0.8, 0.9, 11, 1), std(th.rockDark));
  band.position.y = -1.3;
  g.add(band);
  for (let i = 0; i < 4; i += 1) {
    const a = rand() * Math.PI * 2;
    const d = R * (0.2 + rand() * 0.45);
    const s = 0.5 + rand() * 0.9;
    const rk = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(s, 0), s * 0.3, rand), std(th.rockDark));
    rk.position.set(Math.cos(a) * d, -bodyH * (0.75 + rand() * 0.4), Math.sin(a) * d);
    g.add(rk);
  }
  // patches of darker and lighter grass
  for (let i = 0; i < 7; i += 1) {
    const a = rand() * Math.PI * 2;
    const d = rand() * (R - 1.6);
    const patch = new THREE.Mesh(
      new THREE.CircleGeometry(0.6 + rand() * 1.1, 9),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(th.grass).offsetHSL(0, 0, (rand() - 0.5) * 0.09),
        roughness: 1,
      }),
    );
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(Math.cos(a) * d, 0.012 + i * 0.001, Math.sin(a) * d);
    patch.receiveShadow = true;
    g.add(patch);
  }
  return g;
}

export function makeTree(themeName, rand, scale = 1) {
  const th = THEMES[themeName] ?? THEMES.meadow;
  const g = new THREE.Group();
  const h = (1.1 + rand() * 0.5) * scale;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * scale, 0.22 * scale, h, 6), std(th.trunk));
  trunk.position.y = h / 2;
  trunk.castShadow = true;
  g.add(trunk);
  const pine = themeName === 'pine' || themeName === 'snow' || rand() < 0.35;
  if (pine) {
    for (let i = 0; i < 3; i += 1) {
      const c = new THREE.Mesh(
        new THREE.ConeGeometry((1.15 - i * 0.28) * scale, 1.3 * scale, 7),
        std(th.leaf[i % th.leaf.length]),
      );
      c.position.y = h + 0.35 * scale + i * 0.7 * scale;
      c.castShadow = true;
      g.add(c);
      if (themeName === 'snow') {
        const cap = new THREE.Mesh(new THREE.ConeGeometry((0.62 - i * 0.14) * scale, 0.5 * scale, 7), std(0xffffff));
        cap.position.y = c.position.y + 0.45 * scale;
        g.add(cap);
      }
    }
  } else {
    for (let i = 0; i < 3; i += 1) {
      const s = (0.75 + rand() * 0.45) * scale;
      const b = new THREE.Mesh(
        jitter(new THREE.IcosahedronGeometry(s, 0), s * 0.25, rand),
        std(th.leaf[i % th.leaf.length]),
      );
      b.position.set(
        (rand() - 0.5) * 0.9 * scale,
        h + 0.4 * scale + rand() * 0.7 * scale,
        (rand() - 0.5) * 0.9 * scale,
      );
      b.castShadow = true;
      g.add(b);
    }
  }
  return g;
}

export function makeRock(themeName, rand, s = 0.6) {
  const th = THEMES[themeName] ?? THEMES.meadow;
  const m = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(s, 0), s * 0.35, rand), std(th.rockDark));
  m.position.y = s * 0.45;
  m.scale.y = 0.75;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function makeFlower(themeName, rand) {
  const th = THEMES[themeName] ?? THEMES.meadow;
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 4), std(0x3d8b3d));
  stem.position.y = 0.14;
  g.add(stem);
  const head = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.09, 0),
    std(th.flower[Math.floor(rand() * th.flower.length)]),
  );
  head.position.y = 0.3;
  g.add(head);
  return g;
}

export function makeBigCrystal(color, rand, s = 1) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i += 1) {
    const hgt = (1.2 + rand() * 1.4) * s;
    const c = new THREE.Mesh(
      new THREE.CylinderGeometry(0, 0.34 * s, hgt, 5),
      glow(color, 0.55, { transparent: true, opacity: 0.9 }),
    );
    c.position.set((rand() - 0.5) * 0.7 * s, hgt / 2 - 0.05, (rand() - 0.5) * 0.7 * s);
    c.rotation.set((rand() - 0.5) * 0.5, rand() * 3, (rand() - 0.5) * 0.5);
    c.castShadow = true;
    g.add(c);
  }
  return g;
}

/** A collectable: a small spinning octahedron. */
export function makeGem() {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), glow(0x18c8e8, 0.55));
  m.scale.y = 1.35;
  return m;
}

export function makeCloud(rand, s = 1) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    flatShading: true,
    transparent: true,
    opacity: 0.93,
  });
  const n = 4 + Math.floor(rand() * 3);
  for (let i = 0; i < n; i += 1) {
    const r = (1.2 + rand() * 1.5) * s;
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat);
    b.position.set((i - n / 2) * 1.5 * s + rand(), rand() * 0.6 * s, (rand() - 0.5) * 2 * s);
    b.scale.y = 0.6;
    g.add(b);
  }
  g.userData.mat = mat;
  return g;
}

/** Colour of a mould of length b — the same b always has the same colour. */
export function mouldColor(b) {
  return new THREE.Color().setHSL((b * 0.137 + 0.52) % 1, 0.85, 0.5);
}

/** A stone pedestal carrying a mould (a glowing bar and its number). */
export function makePedestal(b) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.8, 0.9, 8), std(0x8f8f9a));
  base.position.y = 0.45;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.62, 0.16, 8), std(0xb3b3bf));
  cap.position.y = 0.96;
  g.add(cap);
  const mould = makeMould(b);
  mould.position.y = 1.75;
  g.add(mould);
  g.userData.mould = mould;
  return g;
}

export function makeMould(b) {
  const g = new THREE.Group();
  const col = mouldColor(b);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), glow(col, 0.28));
  box.castShadow = true;
  g.add(box);
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.74, 0.74, 0.74)),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }),
  );
  g.add(edge);
  const label = textSprite(String(b), { h: 0.85 });
  label.position.y = 0.95;
  g.add(label);
  g.userData.label = label;
  g.userData.box = box;
  g.userData.b = b;
  return g;
}

/**
 * The beacon of « your next step »: a beam of light, a halo on the ground and a bouncing arrow, seen from the other side of
 * the island. `userData.animate(time, dt, near)` moves it; the arrow hides when the robot is close (the HUD prompt takes over).
 */
export function makeBeacon(r = 1) {
  const beacon = new THREE.Group();
  beacon.visible = false;
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95 * r, 0.95 * r, 9, 20, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffc12e,
      transparent: true,
      opacity: 0.13,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  beam.position.y = 4.8;
  beacon.add(beam);
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(1.05 * r, 1.75 * r, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffd34d,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.34;
  beacon.add(halo);
  const arrow = new THREE.Group();
  beacon.add(arrow);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.75, 4), glow(0xffc12e, 0.9));
  head.rotation.x = Math.PI;
  arrow.add(head);
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.7, 0.26), glow(0xffc12e, 0.9));
  shaft.position.y = 0.68;
  arrow.add(shaft);
  beacon.userData.animate = (time, dt, near) => {
    arrow.visible = !near;
    arrow.position.y = 3.5 + Math.abs(Math.sin(time * 3.4)) * 0.9;
    arrow.rotation.y += dt * 2.4;
    halo.scale.setScalar(1 + Math.sin(time * 4) * 0.1);
    halo.material.opacity = near ? 0.9 : 0.4 + Math.abs(Math.sin(time * 4)) * 0.3;
  };
  return beacon;
}

/** The forge platform at a bridge's entrance: a stone disc with a glowing ring and a floating prism. */
export function makeAltar() {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.4, 0.3, 10), std(0x7d7d8c));
  disc.position.y = 0.15;
  disc.receiveShadow = true;
  disc.castShadow = true;
  g.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.07, 6, 28), glow(0x35d8f0, 0.7));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.33;
  g.add(ring);
  const prism = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), glow(0xffc93c, 0.6));
  prism.position.y = 1.55;
  g.add(prism);
  const beacon = makeBeacon();
  g.add(beacon);
  g.userData.ring = ring;
  g.userData.prism = prism;
  g.userData.beacon = beacon;
  return g;
}

export function makePylon() {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.9, 6), std(0x77788a));
  post.position.y = 0.95;
  post.castShadow = true;
  g.add(post);
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 1), glow(0x35d8f0, 0.7));
  orb.position.y = 2.1;
  g.add(orb);
  g.userData.orb = orb;
  return g;
}

export function makeSign(text) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.7, 5), std(0x7a5230));
  post.position.y = 0.85;
  post.castShadow = true;
  g.add(post);
  const label = textSprite(text, { h: 0.72, bg: 'rgba(12,28,60,0.82)', stroke: null, color: '#fff7d6' });
  label.position.y = 2.2;
  g.add(label);
  return g;
}

export function makeAnvil() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.5, 6), std(0x55566a));
  base.position.y = 0.25;
  base.castShadow = true;
  g.add(base);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.8), std(0x3a3b4c));
  top.position.y = 0.68;
  top.castShadow = true;
  g.add(top);
  const spark = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), glow(0xff8a1f, 0.7));
  spark.position.y = 1.6;
  g.add(spark);
  const label = textSprite('ورشة القوالب', { h: 0.6, bg: 'rgba(12,28,60,0.82)', stroke: null, color: '#ffd9a0' });
  label.position.y = 2.5;
  g.add(label);
  g.userData.spark = spark;
  return g;
}

export function makeStatue(i) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.6, 0.9), std(0x8d8d95));
  body.position.y = 1.3;
  body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.95, 1.05), std(0x9c9ca6));
  head.position.y = 3.05;
  head.castShadow = true;
  g.add(head);
  const eyes = [];
  for (const sx of [-0.3, 0.3]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.05), glow(0x33343f, 0.05));
    e.position.set(sx, 3.1, 0.54);
    g.add(e);
    eyes.push(e);
  }
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), glow(0x33343f, 0.05));
  gem.position.set(0, 1.7, 0.5);
  g.add(gem);
  g.userData.lit = (on) => {
    const c = on ? [0x7dfcff, 0xffd166, 0xb69cff, 0x8dffb0][i % 4] : 0x33343f;
    [...eyes, gem].forEach((m) => {
      m.material.color.set(c);
      m.material.emissive.set(c);
      m.material.emissiveIntensity = on ? 0.9 : 0.05;
    });
  };
  return g;
}

export function makeHoverboard() {
  const g = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 2.1), std(0x2b3a67, { flatShading: false }));
  deck.castShadow = true;
  g.add(deck);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.13, 2.12), glow(0xffc12e, 0.5));
  g.add(stripe);
  const under = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.06, 1.8), glow(0x35d8f0, 0.9));
  under.position.y = -0.09;
  g.add(under);
  return g;
}

export function makeLighthouse() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.1, 1.2, 10), std(0x8794a8));
  base.position.y = 0.6;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);
  const cols = [0xf4f4f8, 0xd9483b, 0xf4f4f8, 0xd9483b, 0xf4f4f8];
  let y = 1.2;
  let r = 2.1;
  cols.forEach((c) => {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.2, r, 2.2, 10), std(c));
    seg.position.y = y + 1.1;
    seg.castShadow = true;
    g.add(seg);
    y += 2.2;
    r -= 0.2;
  });
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.55, 0.3, 10), std(0x3a4660));
  deck.position.y = y + 0.15;
  g.add(deck);
  const lamp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 1.5, 8),
    glow(0x44485a, 0.05, { transparent: true, opacity: 0.95 }),
  );
  lamp.position.y = y + 1.05;
  g.add(lamp);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.35, 1.3, 8), std(0xd9483b));
  roof.position.y = y + 2.45;
  roof.castShadow = true;
  g.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 0.15), std(0x5a3b22));
  door.position.set(0, 2.0, 2.05);
  g.add(door);
  const beams = new THREE.Group();
  beams.position.y = y + 1.05;
  beams.visible = false;
  for (const s of [1, -1]) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(3.2, 46, 14, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xfff1a8,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    cone.rotation.z = (s * Math.PI) / 2;
    cone.position.x = s * 23;
    beams.add(cone); // tip on the lamp, widening outwards
  }
  g.add(beams);
  const light = new THREE.PointLight(0xffe9a0, 0, 80, 1.6);
  light.position.y = y + 1.05;
  g.add(light);
  g.userData = { lamp, beams, light };
  return g;
}

/** Sky dome with a vertical gradient (uniforms `top`, `bottom`) and stars that fade in with `night`. */
export function makeSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new THREE.Color(0x3d8bff) },
      bottom: { value: new THREE.Color(0xcdeeff) },
      night: { value: 0 },
    },
    vertexShader:
      'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec3 vP; uniform vec3 top; uniform vec3 bottom; uniform float night;
      float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }
      void main(){ vec3 d = normalize(vP); float t = smoothstep(-0.15, 0.75, d.y);
        vec3 c = mix(bottom, top, t);
        vec3 sp = d * 230.0; vec3 fr = fract(sp) - 0.5;
        float s = step(0.9935, hash(floor(sp))) * smoothstep(0.42, 0.05, length(fr)) * smoothstep(0.0, 0.3, d.y) * night;
        gl_FragColor = vec4(c + vec3(s), 1.0); }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(600, 24, 16), mat);
  m.frustumCulled = false;
  m.renderOrder = -10;
  return m;
}

/** A small pool of additive particles: `burst(pos, color, n, speed)`; `update(dt)` each frame. */
export class Particles {
  constructor(max = 500) {
    this.max = max;
    this.n = 0;
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.base = new Float32Array(max * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.28,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    );
    this.points.frustumCulled = false;
    this.cursor = 0;
    for (let i = 0; i < max; i += 1) this.pos[i * 3 + 1] = -9999;
  }

  burst(p, color, n = 20, speed = 4, up = 2.5, life = 0.9) {
    const c = new THREE.Color(color);
    for (let k = 0; k < n; k += 1) {
      const i = this.cursor;
      this.cursor = (this.cursor + 1) % this.max;
      const a = Math.random() * Math.PI * 2;
      const e = Math.random() * Math.PI - Math.PI / 2;
      const s = speed * (0.4 + Math.random() * 0.6);
      this.pos.set([p.x, p.y, p.z], i * 3);
      this.vel.set([Math.cos(a) * Math.cos(e) * s, Math.sin(e) * s + up, Math.sin(a) * Math.cos(e) * s], i * 3);
      this.base.set([c.r, c.g, c.b], i * 3);
      this.life[i] = life * (0.6 + Math.random() * 0.5);
    }
  }

  update(dt) {
    for (let i = 0; i < this.max; i += 1) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      const j = i * 3;
      if (this.life[i] <= 0) {
        this.pos[j + 1] = -9999;
        continue;
      }
      this.vel[j + 1] -= 6 * dt;
      this.pos[j] += this.vel[j] * dt;
      this.pos[j + 1] += this.vel[j + 1] * dt;
      this.pos[j + 2] += this.vel[j + 2] * dt;
      const f = Math.min(1, this.life[i] * 2.5);
      this.col[j] = this.base[j] * f;
      this.col[j + 1] = this.base[j + 1] * f;
      this.col[j + 2] = this.base[j + 2] * f;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
  }
}

export function disposeScene(scene) {
  scene.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    mats.forEach((m) => {
      if (m.map) m.map.dispose();
      m.dispose();
    });
  });
}
