/**
 * « La coopérative du verger » — the 3D depot of the real-world practice game (three.js, drawn in code).
 * An orchard island far from the archipelago: a warehouse, a pallet of goods, a packing floor and a truck. `runSim` PACKS FOR
 * REAL what the student decided: q containers appear one by one (the HUD's equality follows), and what does not fit stays
 * visible — items left on a red mat (crates), or a last truck half empty (trucks). Nothing here decides: all maths is cases.js.
 */
import * as THREE from 'three';
import { THEMES, makeIsland, makeRock, std, glow, textSprite, seeded } from '../engine/builders';
import { divide } from './logic';

THEMES.orchard = {
  grass: 0x9fcf6a,
  lip: 0xc9e39a,
  rock: 0xa39a8a,
  rockDark: 0x7d7466,
  leaf: [0x3f9a4a, 0x57b25a, 0x2f8748],
  trunk: 0x8a6239,
  flower: [0xffffff, 0xffd27a],
};
/**
 * A CRATE, drawn in code (no image): the produce shows between three wooden slats and two corner posts. One small canvas
 * per kind of produce, used as the map of every crate of that kind — on the quay, on a lot's pallet, on the bands.
 */
function crateMaterial(color) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = `#${new THREE.Color(color).getHexString()}`;
  g.fillRect(0, 0, 64, 64);
  // the produce: rounder, darker spots
  g.fillStyle = 'rgba(0,0,0,0.16)';
  for (let i = 0; i < 14; i += 1) {
    g.beginPath();
    g.arc(6 + ((i * 23) % 54), 8 + ((i * 37) % 50), 4, 0, 6.3);
    g.fill();
  }
  // the wood
  g.fillStyle = '#b5874a';
  for (const y of [4, 27, 50]) g.fillRect(0, y, 64, 10);
  g.fillRect(0, 0, 7, 64);
  g.fillRect(57, 0, 7, 64);
  g.strokeStyle = 'rgba(70,44,16,0.75)';
  g.lineWidth = 2;
  for (const y of [4, 27, 50]) g.strokeRect(0, y, 64, 10);
  g.strokeRect(1, 1, 62, 62);
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map, roughness: 0.85 });
}

const DEPOT_AT = { x: -340, z: 280 };
const PAD = { w: 14.5, d: 8.2, z: 0.4 };
const easeOut = (t) => 1 - (1 - t) ** 3;

/** An apple tree of the orchard: a short trunk, a round crown of three leafy balls, a few red apples. */
function makeAppleTree(rand, s = 1) {
  const g = new THREE.Group();
  const h = (2.0 + rand() * 0.8) * s;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.26 * s, h, 7), std(0x8a6239));
  trunk.position.y = h / 2;
  trunk.castShadow = true;
  g.add(trunk);
  const crown = [
    [0, h + 0.7 * s, 0, 1.25],
    [0.75 * s, h + 0.35 * s, 0.2 * s, 0.9],
    [-0.7 * s, h + 0.4 * s, -0.25 * s, 0.95],
  ];
  crown.forEach(([x, y, z, r], i) => {
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(r * s, 1), std([0x3f9a4a, 0x57b25a, 0x2f8748][i % 3]));
    ball.position.set(x, y, z);
    ball.castShadow = true;
    g.add(ball);
  });
  for (const [x, y, z] of [
    [0.9, 0.1, 0.8],
    [-0.8, 0.2, 0.7],
    [0.2, 0.6, 1.1],
    [-0.3, -0.1, -1.0],
  ]) {
    const apple = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16 * s, 0), std(0xc0392b));
    apple.position.set(x * s, h + y * s, z * s);
    g.add(apple);
  }
  return g;
}

function makeTruck() {
  const g = new THREE.Group();
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.0, 2.4), std(0x2f6fd0, { flatShading: false }));
  cab.position.set(2.9, 1.5, 0);
  cab.castShadow = true;
  g.add(cab);
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.8, 1.9),
    std(0xbfe6ff, { flatShading: false, roughness: 0.2 }),
  );
  glass.position.set(3.97, 1.85, 0);
  g.add(glass);
  const bed = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.3, 2.5), std(0x394766));
  bed.position.set(-0.6, 0.85, 0);
  bed.castShadow = true;
  g.add(bed);
  for (const z of [-1.2, 1.2]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.7, 0.1), std(0x4a5b80));
    side.position.set(-0.6, 1.35, z);
    g.add(side);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 2.5), std(0x4a5b80));
  back.position.set(-2.9, 1.35, 0);
  g.add(back);
  for (const [x, z] of [
    [2.7, 1.25],
    [2.7, -1.25],
    [-1.6, 1.25],
    [-1.6, -1.25],
  ]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 12), std(0x1c1f2b, { flatShading: false }));
    w.rotation.x = Math.PI / 2;
    w.position.set(x, 0.5, z);
    g.add(w);
  }
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.4), glow(0xffe27a, 0.9));
  lamp.position.set(3.97, 0.95, 0.8);
  g.add(lamp);
  g.userData.load = new THREE.Vector3(-0.6, 1.6, 0);
  return g;
}

export class Depot {
  constructor(game) {
    this.game = game;
    this.items = [];
    this.left = [];
    const g = new THREE.Group();
    g.position.set(DEPOT_AT.x, 0, DEPOT_AT.z);
    game.scene.add(g);
    this.group = g;
    const rand = seeded(4242);
    g.add(makeIsland(21, 'orchard', 91));
    // the warehouse
    const house = new THREE.Group();
    house.position.set(0, 0, -11.5);
    g.add(house);
    const body = new THREE.Mesh(new THREE.BoxGeometry(13, 5, 6), std(0xf3e6c8));
    body.position.y = 2.5;
    body.castShadow = true;
    body.receiveShadow = true;
    house.add(body);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 4.6, 2.2, 4, 1), std(0xc8553d));
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(2.1, 1, 1);
    roof.position.y = 6.1;
    roof.castShadow = true;
    house.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.4, 0.2), std(0x4b3a2a));
    door.position.set(0, 1.7, 3.05);
    house.add(door);
    for (let i = 0; i < 6; i += 1) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.06, 0.24), std(0x6a543d));
      slat.position.set(0, 0.5 + i * 0.55, 3.06);
      house.add(slat);
    }
    // the cooperative's sign stands on its own posts beside the floor, where no panel of the screen hides it
    const board = new THREE.Group();
    board.position.set(10.2, 0, -5.6);
    g.add(board);
    for (const x of [-1.9, 1.9]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.6, 6), std(0x8a6239));
      post.position.set(x, 1.3, 0);
      post.castShadow = true;
      board.add(post);
    }
    const sign = textSprite('La coopérative du verger', {
      h: 1.2,
      bg: 'rgba(22,101,52,0.96)',
      stroke: null,
      color: '#fff7d6',
    });
    sign.position.set(0, 2.9, 0);
    board.add(sign);
    // apple trees and rocks
    for (const [x, z, s] of [
      [-15, -9, 1.1],
      [15, -10, 1.2],
      [-17, 3, 1],
      [17.5, 5, 0.95],
      [-9.5, -14, 1.15],
      [10, -15, 1],
      [-13, 12, 0.9],
      [14, 12, 1],
    ]) {
      const p = makeAppleTree(rand, s);
      p.position.set(x, 0, z);
      p.rotation.y = rand() * 6;
      g.add(p);
    }
    for (let i = 0; i < 6; i += 1) {
      const r = makeRock('orchard', rand, 0.4 + rand() * 0.5);
      const a = rand() * 6.28;
      r.position.x = Math.cos(a) * 17.5;
      r.position.z = Math.sin(a) * 17.5;
      g.add(r);
    }
    // the packing floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(PAD.w + 0.8, 0.12, PAD.d + 0.8), std(0xcfa565));
    floor.position.set(0, 0.03, PAD.z);
    floor.receiveShadow = true;
    g.add(floor);
    const inner = new THREE.Mesh(new THREE.BoxGeometry(PAD.w, 0.13, PAD.d), std(0xdcb878));
    inner.position.set(0, 0.04, PAD.z);
    inner.receiveShadow = true;
    g.add(inner);
    // the pallet of goods
    const pallet = new THREE.Group();
    pallet.position.set(-11.3, 0, 0.5);
    g.add(pallet);
    this.pallet = pallet;
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.3, 3), std(0x8a6239));
    base.position.y = 0.15;
    base.castShadow = true;
    pallet.add(base);
    this.goodsMat = std(0xb5651d);
    const pile = new THREE.InstancedMesh(new THREE.BoxGeometry(0.6, 0.5, 0.62), this.goodsMat, 60);
    pile.castShadow = true;
    const m = new THREE.Matrix4();
    let k = 0;
    for (let y = 0; y < 3; y += 1)
      for (let x = 0; x < 5; x += 1)
        for (let z = 0; z < 4; z += 1) {
          m.setPosition(-1.3 + x * 0.65, 0.58 + y * 0.53, -1.0 + z * 0.67);
          pile.setMatrixAt(k, m);
          k += 1;
        }
    pallet.add(pile);
    this.pile = pile;
    this.palletLabel = textSprite('0', { h: 1.5, bg: 'rgba(10,26,60,0.9)', stroke: null, color: '#fff7d6' });
    this.palletLabel.position.set(0, 3.5, 0);
    pallet.add(this.palletLabel);
    // the truck, and the red mat where what does not fit stays
    this.truck = makeTruck();
    this.truckHome = new THREE.Vector3(11.4, 0, 1.6);
    this.truck.position.copy(this.truckHome);
    this.truck.rotation.y = -0.12;
    g.add(this.truck);
    this.mat = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.1, 2.6),
      new THREE.MeshStandardMaterial({ color: 0xff7a5c, transparent: true, opacity: 0.85 }),
    );
    this.mat.position.set(-8.3, 0.08, 6.3);
    this.mat.visible = false;
    g.add(this.mat);
    this.leftLabel = textSprite('0', { h: 1.2, bg: 'rgba(190,40,40,0.95)', stroke: null, color: '#ffffff' });
    this.leftLabel.visible = false;
    g.add(this.leftLabel);
    this.counter = textSprite('0', { h: 1.5, color: '#fff3b0' });
    this.counter.visible = false;
    g.add(this.counter);
    this.robotSpot = new THREE.Vector3(DEPOT_AT.x - 3.6, 0, DEPOT_AT.z + 6.9);
    this.camPos = new THREE.Vector3(DEPOT_AT.x, 16.5, DEPOT_AT.z + 19.8);
    this.camLook = new THREE.Vector3(DEPOT_AT.x, 0.4, DEPOT_AT.z + 0.3);
  }

  setOrder(order) {
    this.clearSim();
    this.goodsMat.color.set(order.good.color);
    this.palletLabel.userData.setText(String(order.n));
    this.palletLabel.visible = true;
    this.pile.material = this.goodsMat;
    this.pile.count = 60;
    if (this.second) this.second.group.visible = false;
  }

  clearSim() {
    for (const it of [...this.items, ...this.left]) {
      this.group.remove(it);
      it.traverse?.((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material && o.material !== this.goodsMat && !this.kept?.has(o.material)) o.material.dispose();
      });
    }
    this.items = [];
    this.left = [];
    this.mat.visible = false;
    this.leftLabel.visible = false;
    this.counter.visible = false;
    this.restTags?.forEach((s) => {
      s.visible = false;
    });
  }

  container(size, color, trucks, fill = 1) {
    const g = new THREE.Group();
    const h = size * (trucks ? 0.55 : 0.62);
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(size, h, size * (trucks ? 0.62 : 1)),
      std(trucks ? 0x4f7cc4 : 0xc79a5b),
    );
    box.position.y = h / 2;
    box.castShadow = true;
    box.receiveShadow = true;
    g.add(box);
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(size * 0.84 * Math.max(0.08, fill), 0.07, size * (trucks ? 0.5 : 0.84)),
      std(fill < 1 ? 0xffb14a : color),
    );
    top.position.set(-(size * 0.84 * (1 - fill)) / 2, h + 0.03, 0);
    g.add(top);
    if (fill < 1) {
      const rim = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(size * 1.04, h * 1.06, size * (trucks ? 0.66 : 1.04))),
        new THREE.LineBasicMaterial({ color: 0xff7a1a }),
      );
      rim.position.y = h / 2;
      g.add(rim);
    }
    return g;
  }

  /**
   * Packs n items in containers of b. `onStep({ a, b, q, r, live })` follows the count. Resolves to { q, r }.
   * mode 'crates': r items stay on the red mat; mode 'trucks': one more container, partly filled.
   */
  async runSim({ n, b, mode = 'crates' }, good, onStep = () => {}) {
    const game = this.game;
    const { q, r } = divide(n, b);
    const trucks = mode === 'trucks';
    this.clearSim();
    const total = q + (trucks && r > 0 ? 1 : 0);
    const cols = Math.max(1, Math.min(10, Math.ceil(Math.sqrt(Math.max(1, total) * 1.9))));
    const rows = Math.max(1, Math.ceil(total / cols));
    const cell = Math.min(2.6, PAD.w / cols, PAD.d / rows);
    const size = cell * 0.8;
    const slot = (k) =>
      new THREE.Vector3(
        ((k % cols) - (cols - 1) / 2) * cell,
        0.1,
        PAD.z + (Math.floor(k / cols) - (rows - 1) / 2) * cell,
      );
    const from = new THREE.Vector3(this.pallet.position.x, 2.2, this.pallet.position.z);
    onStep({ a: n, b, q: 0, r: n, live: true });
    this.counter.visible = q > 0;
    const per = game.instantSim ? 0.001 : Math.min(0.3, Math.max(0.06, 2.8 / Math.max(1, q)));
    for (let k = 0; k < q; k += 1) {
      if (game.dead) return { q, r };
      const c = this.container(size, good.color, trucks);
      c.position.copy(from);
      c.scale.setScalar(0.2);
      this.group.add(c);
      this.items.push(c);
      const home = slot(k);
      await game.tween(
        per,
        (t) => {
          c.position.lerpVectors(from, home, t);
          c.position.y += Math.sin(t * Math.PI) * 2;
          c.scale.setScalar(0.2 + 0.8 * t);
        },
        easeOut,
      );
      game.audio.play('plank', k);
      this.counter.userData.setText(String(k + 1));
      this.counter.position.set(home.x, size + 1.3, home.z);
      onStep({ a: n, b, q: k + 1, r: n - b * (k + 1), live: true });
    }
    await game.wait(game.instantSim ? 0.001 : 0.25);
    this.counter.visible = false;
    if (r > 0 && trucks) {
      const c = this.container(size, good.color, true, r / b);
      c.position.copy(slot(q));
      this.group.add(c);
      this.items.push(c);
      this.leftLabel.userData.setText(`${b - r} places vides`);
      this.leftLabel.position.set(c.position.x, size + 1.2, c.position.z);
      this.leftLabel.visible = true;
      game.audio.play('plank', q);
    } else if (r > 0) {
      this.mat.visible = true;
      const show = Math.min(r, 36);
      const side = Math.ceil(Math.sqrt(show * 1.7));
      for (let i = 0; i < show; i += 1) {
        const cube = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.34), this.goodsMat);
        cube.castShadow = true;
        cube.position.set(
          this.mat.position.x - 1.9 + (i % side) * (3.8 / Math.max(1, side - 1 || 1)) * (side > 1 ? 1 : 0),
          0.3,
          this.mat.position.z - 0.9 + Math.floor(i / side) * 0.45,
        );
        this.group.add(cube);
        this.left.push(cube);
      }
      this.leftLabel.userData.setText(`reste ${r}`);
      this.leftLabel.position.set(this.mat.position.x, 2.1, this.mat.position.z);
      this.leftLabel.visible = true;
      game.audio.play('fail');
      game.shake = 0.12;
    } else {
      for (let i = 0; i <= 6; i += 1)
        game.particles.burst(
          new THREE.Vector3(DEPOT_AT.x - PAD.w / 2 + (PAD.w * i) / 6, 0.8, DEPOT_AT.z + PAD.z),
          0x8dffb0,
          8,
          3,
          3,
          1,
        );
    }
    onStep({ a: n, b, q, r, live: false });
    return { q, r };
  }

  /**
   * AN INTEGRATION MISSION's scene « lots » (`missions/lots.js` decides, this draws): two stocks packed in LOTS, one
   * pallet per lot. `spec = { lots: [{ a, b }], left: { a, b }, empty }`; `kinds = { a: { color }, b: { color } }`.
   * Up to 12 lots, each crate of a lot is drawn (he can count them and SEE two lots that differ); beyond, a lot is a
   * small pallet with two bands whose lengths are its two counts. What was not packed stays on the red mat, in its
   * two colours; a lot that could not be filled is an empty frame. `onStep(k)` follows the count of lots laid.
   */
  async runLots(
    { lots, left = { a: 0, b: 0 }, empty = 0 },
    kinds,
    { cheer = false, stock = null, onStep = () => {} } = {},
  ) {
    const game = this.game;
    this.clearSim();
    const total = lots.length + empty;
    const cols = Math.max(1, Math.min(14, Math.ceil(Math.sqrt(Math.max(1, total) * 1.9))));
    const rows = Math.max(1, Math.ceil(total / cols));
    const cell = Math.min(3.4, PAD.w / cols, PAD.d / rows);
    const size = cell * 0.86;
    const slot = (k) =>
      new THREE.Vector3(
        ((k % cols) - (cols - 1) / 2) * cell,
        0.1,
        PAD.z + (Math.floor(k / cols) - (rows - 1) / 2) * cell,
      );
    const col = { a: new THREE.Color(kinds.a.color), b: new THREE.Color(kinds.b.color) };
    const most = Math.max(1, ...lots.map((l) => l.a + l.b));
    const pallet = (lot) => {
      const g = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(size, 0.14, size), std(0x8a6239));
      base.position.y = 0.07;
      base.castShadow = true;
      base.receiveShadow = true;
      g.add(base);
      const n = lot.a + lot.b;
      if (total <= 12 && most <= 30) {
        // every crate drawn: `side` crates a row, the first kind first
        const side = Math.max(2, Math.ceil(Math.sqrt(most)));
        const c = (size * 0.9) / side;
        for (let i = 0; i < n; i += 1) {
          const cube = new THREE.Mesh(
            new THREE.BoxGeometry(c * 0.86, c * 0.7, c * 0.86),
            this.crates?.[i < lot.a ? 'a' : 'b'] ?? std(i < lot.a ? col.a : col.b),
          );
          cube.position.set(
            ((i % side) - (side - 1) / 2) * c,
            0.14 + c * 0.35,
            (Math.floor(i / side) - (side - 1) / 2) * c,
          );
          cube.castShadow = true;
          g.add(cube);
        }
      } else {
        // two bands: their lengths are the two counts (against the fullest lot of the scene)
        ['a', 'b'].forEach((k, i) => {
          const len = Math.max(0.06, (size * 0.9 * lot[k]) / most);
          const band = new THREE.Mesh(
            new THREE.BoxGeometry(len, size * 0.34, size * 0.38),
            this.crates?.[k] ?? std(col[k]),
          );
          band.position.set(-(size * 0.9 - len) / 2, 0.14 + size * 0.17, (i ? 1 : -1) * size * 0.22);
          band.castShadow = true;
          g.add(band);
        });
      }
      return g;
    };
    const from = new THREE.Vector3(this.pallet.position.x, 2.2, this.pallet.position.z);
    // THE QUAY GOES DOWN AS THE LOTS ARE MADE (owner, 2026-11-20): each lot laid takes its crates from the two piles,
    // whose counts follow — what the lots did not take is what stays, and goes to the red mat
    const rest = stock ? { ...stock } : null;
    if (rest) this.stockLabel(rest.a, rest.b, stock);
    this.counter.visible = lots.length > 0;
    const per = game.instantSim ? 0.001 : Math.min(0.32, Math.max(0.03, 3.2 / Math.max(1, lots.length)));
    // past 140 lots they land several at a time: 1188 lots are dealt in the time of 140, never in half a minute
    const batch = Math.max(1, Math.ceil(lots.length / 140));
    for (let k = 0; k < lots.length; k += 1) {
      if (game.dead) return;
      const c = pallet(lots[k]);
      this.group.add(c);
      this.items.push(c);
      const home = slot(k);
      if (rest) {
        rest.a -= lots[k].a;
        rest.b -= lots[k].b;
      }
      if (k % batch) {
        c.position.copy(home);
        continue;
      }
      c.position.copy(from);
      c.scale.setScalar(0.2);
      await game.tween(
        per,
        (t) => {
          c.position.lerpVectors(from, home, t);
          c.position.y += Math.sin(t * Math.PI) * 2;
          c.scale.setScalar(0.2 + 0.8 * t);
        },
        easeOut,
      );
      game.audio.play('plank', k);
      // the quay's counts change when the lot LANDS, with the count of lots
      if (rest) this.stockLabel(rest.a, rest.b);
      this.counter.userData.setText(String(k + 1));
      this.counter.position.set(home.x, size * 0.6 + 1.4, home.z);
      onStep(k + 1);
    }
    if (rest) this.stockLabel(rest.a, rest.b, null, true);
    await game.wait(game.instantSim ? 0.001 : 0.3);
    this.counter.visible = false;
    for (let k = 0; k < empty; k += 1) {
      const frame = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(size, 0.3, size)),
        new THREE.LineBasicMaterial({ color: 0xff7a1a }),
      );
      frame.position.copy(slot(lots.length + k)).setY(0.2);
      this.group.add(frame);
      this.items.push(frame);
    }
    const stay = left.a + left.b;
    if (stay > 0 && rest) {
      // the crates the lots did not take are still on their piles, counted in red: nothing is carried to a mat
      game.audio.play('fail');
      game.shake = 0.12;
    } else if (stay > 0) {
      this.mat.visible = true;
      const show = Math.min(stay, 36);
      const showA = stay <= 36 ? left.a : Math.round((36 * left.a) / stay);
      const side = Math.max(2, Math.ceil(Math.sqrt(show * 1.7)));
      for (let i = 0; i < show; i += 1) {
        const cube = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.34), std(i < showA ? col.a : col.b));
        cube.castShadow = true;
        cube.position.set(
          this.mat.position.x - 1.9 + (i % side) * (3.8 / (side - 1)),
          0.3,
          this.mat.position.z - 0.9 + Math.floor(i / side) * 0.45,
        );
        this.group.add(cube);
        this.left.push(cube);
      }
      this.leftLabel.userData.setText(`reste ${left.a} et ${left.b}`);
      this.leftLabel.position.set(this.mat.position.x, 2.1, this.mat.position.z);
      this.leftLabel.visible = true;
      game.audio.play('fail');
      game.shake = 0.12;
    } else if (empty > 0) {
      game.audio.play('fail');
      game.shake = 0.12;
    } else if (cheer) {
      // only when the caller says the lots are what was asked: identical lots that are too few get no applause
      game.audio.play('success');
      for (let i = 0; i <= 6; i += 1)
        game.particles.burst(
          new THREE.Vector3(DEPOT_AT.x - PAD.w / 2 + (PAD.w * i) / 6, 0.8, DEPOT_AT.z + PAD.z),
          0x8dffb0,
          8,
          3,
          3,
          1,
        );
    }
  }

  /**
   * ONE STOCK MEASURED WITH ANOTHER (a mission's Euclidean division, `big = small × q + r`): the big stock lies on the
   * floor as one long row; the small one is laid along it, `q` times, each copy landing after the one before; what the
   * copies do not cover — `r` crates — stands alone at the end, lit and counted. `colors = { big, small }`.
   */
  async runPairing({ big, small, q, r }, colors) {
    const game = this.game;
    this.clearSim();
    const W = PAD.w * 0.92;
    const x0 = -W / 2;
    const unit = W / big;
    const put = (m) => {
      this.group.add(m);
      this.items.push(m);
      return m;
    };
    const row = put(new THREE.Mesh(new THREE.BoxGeometry(W, 0.5, 1.5), std(colors.big)));
    row.position.set(0, 0.35, PAD.z - 1.5);
    row.castShadow = true;
    const tag = (text, x, z, h = 1.25) => {
      const s = put(textSprite(text, { h, bg: 'rgba(10,26,60,0.9)', stroke: null, color: '#fff7d6' }));
      s.position.set(x, 2.3, z);
      return s;
    };
    tag(String(big), 0, PAD.z - 3.2);
    const from = new THREE.Vector3(this.pallet.position.x, 2.2, this.pallet.position.z);
    for (let k = 0; k < q; k += 1) {
      if (game.dead) return;
      const len = small * unit;
      const copy = put(new THREE.Mesh(new THREE.BoxGeometry(len - 0.08, 0.5, 1.5), std(colors.small)));
      copy.castShadow = true;
      const home = new THREE.Vector3(x0 + k * len + len / 2, 0.35, PAD.z + 0.6);
      copy.position.copy(from);
      await game.tween(
        game.instantSim ? 0.001 : 0.55,
        (t) => {
          copy.position.lerpVectors(from, home, t);
          copy.position.y += Math.sin(t * Math.PI) * 2;
        },
        easeOut,
      );
      game.audio.play('plank', k);
      tag(String(small), home.x, PAD.z + 2.3, 1.05);
    }
    await game.wait(game.instantSim ? 0.001 : 0.3);
    if (r > 0) {
      const len = r * unit;
      const rest = put(new THREE.Mesh(new THREE.BoxGeometry(len, 0.62, 1.62), glow(0xffd24a, 0.55)));
      rest.position.set(x0 + q * small * unit + len / 2, 0.36, PAD.z - 1.5);
      tag(String(r), rest.position.x, PAD.z - 0.2, 1.5);
      game.audio.play('key');
    } else {
      game.audio.play('success');
    }
  }

  /**
   * THE SCENE « ring » OF A MISSION (BEM 2020: trees around a rectangular plot). The quay is cleared — no pile, no
   * truck — and a plot `L × W` (in metres, drawn to scale) lies on the packing floor with its two measures.
   */
  setPlot({ L, W }) {
    this.clearSim();
    this.clearPlot();
    [this.pallet, this.truck, this.second?.group].forEach((o) => o && (o.visible = false));
    const s = Math.min(11.5 / L, 6.6 / W);
    const g = new THREE.Group();
    g.position.set(0, 0.11, PAD.z);
    const soil = new THREE.Mesh(new THREE.BoxGeometry(L * s, 0.1, W * s), std(0x9ccf6a));
    soil.receiveShadow = true;
    g.add(soil);
    const side = (text, x, z) => {
      const tag = textSprite(text, { h: 0.95, bg: 'rgba(10,26,60,0.9)', stroke: null, color: '#fff7d6' });
      tag.position.set(x, 1.5, z);
      g.add(tag);
    };
    side(`${L} m`, 0, (W * s) / 2 + 0.75);
    side(`${W} m`, (L * s) / 2 + 1.1, 0);
    this.group.add(g);
    this.plot = { g, L, W, s, trees: [] };
  }

  clearPlot() {
    if (!this.plot) return;
    this.group.remove(this.plot.g);
    this.plot.g.traverse((o) => {
      o.geometry?.dispose();
      if (o.material && !this.kept?.has(o.material)) {
        o.material.map?.dispose();
        o.material.dispose();
      }
    });
    this.plot = null;
    [this.pallet, this.truck].forEach((o) => o && (o.visible = true));
  }

  /**
   * The world PLANTS what he decided: one tree every `d` metres around the plot, starting at a corner and walking the
   * whole way round. What his spacing produces is shown, never judged: a corner that got no tree carries a red sign,
   * and so does a last gap shorter than the others. With `count`, a count follows the planting. Resolves with what
   * was built.
   */
  async runRing({ d, count: counted = false }) {
    const { game, plot } = this;
    if (!plot || !(d > 0)) return null;
    plot.trees.forEach((o) => plot.g.remove(o));
    plot.trees = [];
    const { L, W, s } = plot;
    const P = 2 * (L + W);
    const at = (m) => {
      const x0 = (-L * s) / 2;
      const z0 = (W * s) / 2;
      if (m <= L) return [x0 + m * s, z0];
      if (m <= L + W) return [x0 + L * s, z0 - (m - L) * s];
      if (m <= 2 * L + W) return [x0 + L * s - (m - L - W) * s, z0 - W * s];
      return [x0, z0 - W * s + (m - 2 * L - W) * s];
    };
    const put = (o) => {
      plot.g.add(o);
      plot.trees.push(o);
      return o;
    };
    const n = Math.ceil(P / d - 1e-9);
    const size = Math.max(0.16, Math.min(0.5, (d * s) / 2.2));
    const trunkGeo = new THREE.CylinderGeometry(size * 0.16, size * 0.2, size * 1.1, 6);
    const leafGeo = new THREE.ConeGeometry(size * 0.7, size * 2, 7);
    const trunkMat = std(0x8a6239);
    const leafMat = std(0x2f8748);
    const count = put(textSprite('0', { h: 1.5, bg: 'rgba(10,26,60,0.9)', stroke: null, color: '#fff7d6' }));
    count.position.set(0, 2.4, 0);
    count.visible = counted; // the count is HIS to find: the plot shows it only when he asks it to count
    const fast = game.instantSim || n > 60;
    for (let k = 0; k < n; k += 1) {
      if (game.dead || this.plot !== plot) return null;
      const [x, z] = at(k * d);
      const tree = put(new THREE.Group());
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = size * 0.55;
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.y = size * 1.9;
      leaf.castShadow = true;
      tree.add(trunk, leaf);
      tree.position.set(x, 0.05, z);
      count.userData.setText(String(k + 1));
      if (!fast || k % 8 === 0) {
        if (!fast) game.audio.play('plank', k);
        await game.tween(
          fast ? 0.03 : Math.max(0.05, 0.9 / Math.sqrt(n)),
          (t) => tree.scale.setScalar(0.2 + 0.8 * t),
          easeOut,
        );
      }
    }
    const red = (text, x, z, h = 0.85) => {
      const tag = put(textSprite(text, { h, bg: 'rgba(190,40,40,0.95)', stroke: null, color: '#ffffff' }));
      tag.position.set(x, 2.1, z);
    };
    const corners = [0, L, L + W, 2 * L + W].filter((m) => m % d !== 0);
    corners.forEach((m) => {
      const [x, z] = at(m);
      const post = put(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.5, 8), glow(0xe5484d, 0.6)));
      post.position.set(x, 0.75, z);
      red('coin sans arbre', x, z);
    });
    const gap = P - (n - 1) * d;
    const uneven = Math.abs(gap - d) > 1e-9;
    if (uneven) {
      const [x, z] = at(P - gap / 2);
      red(`seulement ${String(Number(gap.toFixed(2))).replace('.', ',')} m`, x, z - 0.9, 0.8);
    }
    const [x1, z1] = at(d / 2);
    const first = put(
      textSprite(`${String(d).replace('.', ',')} m`, {
        h: 0.8,
        bg: 'rgba(255,244,214,0.96)',
        stroke: null,
        color: '#3b2a06',
      }),
    );
    first.position.set(x1, 1.3, z1 + 0.7);
    game.audio.play(corners.length || uneven ? 'key' : 'success');
    await game.wait(game.instantSim ? 0.001 : 0.4);
    return { n, corners: corners.length, gap, uneven };
  }

  /**
   * The TWO stocks of a mission stand apart on the quay, each pile under its own count (owner, 2026-11-20). The first
   * is the depot's pile; the second is built beside it the first time a mission asks for it.
   */
  setStock({ a, b }, kinds) {
    this.clearSim();
    if (!this.second) {
      // crates that look like crates: the same two materials for the quay and for every lot (never disposed)
      this.crates = { a: crateMaterial(kinds.a.color), b: crateMaterial(kinds.b.color) };
      this.kept = new Set([this.crates.a, this.crates.b]);
      const g = new THREE.Group();
      g.position.set(this.pallet.position.x, 0, this.pallet.position.z + 4.1);
      const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.3, 3), std(0x8a6239));
      base.position.y = 0.15;
      base.castShadow = true;
      g.add(base);
      const pile = new THREE.InstancedMesh(this.pile.geometry, this.crates.b, 60);
      pile.castShadow = true;
      const m = new THREE.Matrix4();
      for (let k = 0; k < 60; k += 1) {
        this.pile.getMatrixAt(k, m);
        pile.setMatrixAt(k, m);
      }
      g.add(pile);
      const label = textSprite('0', { h: 1.5, bg: 'rgba(10,26,60,0.9)', stroke: null, color: '#fff7d6' });
      label.position.set(0, 3.5, 0);
      g.add(label);
      this.group.add(g);
      this.second = { group: g, pile, label };
      // what the lots did not take STAYS on its pile, counted in red (owner, 2026-11-20: no separate mat)
      this.restTags = [this.pallet, g].map((parent) => {
        const s = textSprite('0', { h: 1.5, bg: 'rgba(190,40,40,0.95)', stroke: null, color: '#ffffff' });
        s.position.set(1.1, 3.5, 0); // a little toward the floor: the mission's notebook stands on that side
        s.visible = false;
        parent.add(s);
        return s;
      });
    }
    this.pile.material = this.crates.a;
    this.second.group.visible = true;
    this.full = { a: 1, b: 1 };
    this.stockLabel(a, b);
  }

  /**
   * What stands on the quay NOW: each pile's count (« ? » while the robot has not counted that stock — `null`), and
   * each pile as tall as what is left of it. `full` (the stocks whole) is given when a dealing starts.
   */
  stockLabel(a, b, full = null, stays = false) {
    if (full) this.full = full;
    // ONE scale for the two piles (owner, 2026-11-20: 528 is almost half of 1188, « the quantity size must appear like
    // that »): 60 crates stand for the LARGER stock, so the other pile is as small as it is. The pile goes down with
    // its count ALL THE WAY — never a floor it waits on, then a jump (owner, the same day) — and the last 12 crates
    // are shown one for one: what is left can be counted.
    const top = Math.max(1, this.full?.a ?? 1, this.full?.b ?? 1);
    const crates = (n, whole) => {
      const have = Math.max(0, n ?? whole);
      return Math.min(60, Math.max(Math.ceil((60 * have) / top), Math.min(have, 12)));
    };
    [
      [this.pile, this.palletLabel, a, this.full?.a],
      [this.second?.pile, this.second?.label, b, this.full?.b],
    ].forEach(([pile, label, n, whole], i) => {
      if (!pile) return;
      pile.count = crates(n, whole);
      const red = stays && n > 0;
      label.visible = !red;
      label.userData.setText(`${n ?? '?'}`);
      if (this.restTags) {
        this.restTags[i].visible = red;
        if (red) this.restTags[i].userData.setText(`reste ${n}`);
      }
    });
  }

  /** The order is right: the containers go on the truck, the truck leaves, an empty one comes back. */
  async ship() {
    const game = this.game;
    const items = this.items.slice();
    this.items = [];
    const to = this.truck.position.clone().add(this.truck.userData.load);
    const data = items.map((c, i) => ({
      c,
      from: c.position.clone(),
      delay: i * Math.min(0.03, 0.5 / Math.max(1, items.length)),
    }));
    const total = 0.55 + (data.at(-1)?.delay ?? 0);
    if (items.length)
      await game.tween(
        total,
        (t) => {
          const el = t * total;
          data.forEach((d) => {
            const p = Math.max(0, Math.min(1, (el - d.delay) / 0.5));
            d.c.position.lerpVectors(d.from, to, p);
            d.c.position.y += Math.sin(p * Math.PI) * 2.5;
            d.c.scale.setScalar(1 - 0.72 * p);
          });
        },
        (t) => t,
      );
    items.forEach((c, i) => {
      this.truck.attach(c);
      c.position.set(-2.3 + (i % 4) * 1.1, 1.2 + Math.floor(i / 8) * 0.42, i % 8 < 4 ? -0.55 : 0.55);
      c.scale.setScalar(0.3);
      c.visible = i < 24;
    });
    game.audio.play('wind');
    const home = this.truckHome;
    await game.tween(
      1.2,
      (t) => {
        this.truck.position.x = home.x + t * t * 34;
      },
      (t) => t,
    );
    items.forEach((c) => this.truck.remove(c));
    this.clearSim();
    this.truck.position.x = home.x + 34;
    await game.tween(
      0.8,
      (t) => {
        this.truck.position.x = home.x + 34 * (1 - t);
      },
      easeOut,
    );
  }

  update(time) {
    this.truck.position.y = Math.sin(time * 9) * 0.012;
    if (this.leftLabel.visible) this.leftLabel.material.opacity = 0.75 + Math.abs(Math.sin(time * 4)) * 0.25;
  }
}
