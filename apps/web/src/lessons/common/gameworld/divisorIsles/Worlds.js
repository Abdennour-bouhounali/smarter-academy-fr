/**
 * Two more 3D worlds of the real cases (three.js, drawn in code), beside the cooperative's depot (Depot.js):
 *   ShareScene  « قعدة الأصدقاء » — a courtyard, a low table, a tray of sweets: the pieces are dealt round after round to the
 *               plates of the friends; what cannot be shared fairly stays on the tray.
 *   TileScene   « ورشة التبليط » — a corridor to tile: the tiles are laid end to end; a tile that does not fit leaves a gap
 *               (it would have to be cut). Then the boxes to buy: the last one is opened but not emptied.
 * Same contract as Depot: robotSpot, camPos, camLook, setOrder(order), runSim(sim, good, onStep), clearSim(), ship(), update(time).
 * No person is drawn: the friends are their plates and their names, the tiler is his tools.
 */
import * as THREE from 'three';
import { makeIsland, makeTree, makeRock, std, textSprite, seeded } from '../engine/builders';
import { divide } from './logic';

const easeOut = (t) => 1 - (1 - t) ** 3;
const NAMES = ['أمين', 'سليم', 'ياسين', 'أنس', 'إلياس', 'آدم', 'يونس', 'ريّان', 'مهدي', 'زكريّا', 'أيّوب', 'إسحاق'];
const wipe = (group, list) => {
  for (const m of list) {
    group.remove(m);
    m.traverse?.((o) => {
      if (o.geometry) o.geometry.dispose();
    });
  }
  list.length = 0;
};

export class ShareScene {
  constructor(game) {
    this.game = game;
    this.at = { x: 340, z: 300 };
    this.items = [];
    this.plates = [];
    const g = new THREE.Group();
    g.position.set(this.at.x, 0, this.at.z);
    game.scene.add(g);
    this.group = g;
    const rand = seeded(909);
    g.add(makeIsland(18, 'meadow', 57));
    // the house wall, its blue door and window; the rug; the low round table and the tray
    const wall = new THREE.Mesh(new THREE.BoxGeometry(17, 4.6, 0.7), std(0xf6efe0));
    wall.position.set(0, 2.3, -9.5);
    wall.castShadow = true;
    g.add(wall);
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.4, 0.2), std(0x2f6fd0));
    door.position.set(-4.5, 1.7, -9.1);
    g.add(door);
    for (const x of [1.5, 5.2]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.5, 0.2), std(0x7fc4e8));
      win.position.set(x, 2.7, -9.1);
      g.add(win);
    }
    const rug = new THREE.Mesh(new THREE.BoxGeometry(13, 0.08, 10), std(0xb5403a));
    rug.position.set(0, 0.05, 0.3);
    rug.receiveShadow = true;
    g.add(rug);
    const rugIn = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.09, 8.4), std(0xd9744f));
    rugIn.position.set(0, 0.06, 0.3);
    g.add(rugIn);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 0.55, 12), std(0x7a5230));
    leg.position.set(0, 0.32, 0.3);
    g.add(leg);
    const table = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 3.9, 0.22, 36), std(0xa9743f, { flatShading: false }));
    table.position.set(0, 0.7, 0.3);
    table.castShadow = true;
    table.receiveShadow = true;
    g.add(table);
    const tray = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.2, 0.16, 24),
      std(0xd9a441, { flatShading: false, metalness: 0.4, roughness: 0.4 }),
    );
    tray.position.set(0, 0.9, 0.3);
    g.add(tray);
    this.top = 0.99;
    this.centre = new THREE.Vector3(0, this.top, 0.3);
    this.pieceMat = std(0xc8862b);
    this.label = textSprite('0', { h: 1.4, bg: 'rgba(10,26,60,0.9)', stroke: null, color: '#fff7d6' });
    this.label.position.set(0, 3.1, 0.3);
    g.add(this.label);
    this.leftLabel = textSprite('0', { h: 1.05, bg: 'rgba(190,40,40,0.95)', stroke: null, color: '#fff' });
    this.leftLabel.visible = false;
    g.add(this.leftLabel);
    // a lemon tree, pots, a teapot on a small stool: the courtyard lives
    for (const [x, z, s] of [
      [-11.5, -5, 1.5],
      [11.5, -4, 1.3],
      [12, 7, 1.1],
    ]) {
      const t = makeTree('meadow', rand, s);
      t.position.set(x, 0, z);
      g.add(t);
    }
    for (const [x, z] of [
      [-7.6, -8.4],
      [8, -8.4],
      [-1.5, -8.4],
    ]) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.36, 0.7, 10), std(0xc8553d));
      pot.position.set(x, 0.35, z);
      g.add(pot);
      const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), std(0x3fa34d));
      bush.position.set(x, 1.05, z);
      g.add(bush);
    }
    const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 10), std(0x7a5230));
    stool.position.set(8.4, 0.25, 4.6);
    g.add(stool);
    const pot = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 12, 10),
      std(0xcfd6e0, { flatShading: false, metalness: 0.6, roughness: 0.3 }),
    );
    pot.position.set(8.4, 0.9, 4.6);
    g.add(pot);
    this.robotSpot = new THREE.Vector3(this.at.x - 6.6, 0, this.at.z + 5.6);
    this.camPos = new THREE.Vector3(this.at.x, 14.5, this.at.z + 16);
    this.camLook = new THREE.Vector3(this.at.x, 0.6, this.at.z + 0.2);
  }

  piece() {
    const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), this.pieceMat);
    m.scale.set(1.25, 0.5, 0.85);
    m.castShadow = true;
    return m;
  }
  setOrder(order) {
    this.clearSim();
    this.total = order.n;
    this.label.userData.setText(String(order.n));
  }
  clearSim() {
    wipe(this.group, this.items);
    wipe(this.group, this.plates);
    this.leftLabel.visible = false;
    this.label.visible = true;
    if (this.total) this.label.userData.setText(String(this.total));
  }

  /** Deals n pieces to b plates, one each per round: q rounds, r pieces left on the tray. */
  async runSim({ n, b }, good, onStep = () => {}) {
    const game = this.game;
    const { q, r } = divide(n, b);
    this.clearSim();
    const spot = (k, rad) =>
      new THREE.Vector3(Math.sin((k / b) * Math.PI * 2) * rad, 0, 0.3 + Math.cos((k / b) * Math.PI * 2) * rad);
    for (let k = 0; k < b; k += 1) {
      const p = spot(k, 3.0);
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.62, 0.48, 0.09, 18),
        std(0xffffff, { flatShading: false }),
      );
      plate.position.set(p.x, this.top - 0.12, p.z);
      this.group.add(plate);
      this.plates.push(plate);
      const c = spot(k, 5.3);
      const cushion = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.9, 0.3, 14),
        std([0x2f6fd0, 0x16a34a, 0xd9a441, 0x8b5cf6][k % 4], { flatShading: false }),
      );
      cushion.position.set(c.x, 0.2, c.z);
      this.group.add(cushion);
      this.plates.push(cushion);
      const name = textSprite(NAMES[k % NAMES.length], {
        h: 0.62,
        bg: 'rgba(255,255,255,0.92)',
        stroke: null,
        color: '#10203f',
      });
      name.position.set(c.x, 1.25, c.z);
      this.group.add(name);
      this.plates.push(name);
    }
    onStep({ a: n, b, q: 0, r: n, live: true });
    const per = game.instantSim ? 0.001 : Math.min(0.45, Math.max(0.14, 3 / Math.max(1, q)));
    for (let round = 0; round < q; round += 1) {
      if (game.dead) return { q, r };
      const batch = [];
      for (let k = 0; k < b; k += 1) {
        const m = this.piece();
        m.position.copy(this.centre);
        this.group.add(m);
        this.items.push(m);
        const p = spot(k, 3.0);
        batch.push({
          m,
          to: new THREE.Vector3(
            p.x + ((round % 3) - 1) * 0.2,
            this.top - 0.02 + Math.floor(round / 3) * 0.11,
            p.z + ((round % 2) - 0.5) * 0.22,
          ),
        });
      }
      await game.tween(
        per,
        (t) =>
          batch.forEach((x) => {
            x.m.position.lerpVectors(this.centre, x.to, t);
            x.m.position.y += Math.sin(t * Math.PI) * 1.1;
          }),
        easeOut,
      );
      game.audio.play('plank', round);
      this.label.userData.setText(String(n - b * (round + 1)));
      onStep({ a: n, b, q: round + 1, r: n - b * (round + 1), live: true });
    }
    await game.wait(game.instantSim ? 0.001 : 0.25);
    if (r > 0) {
      for (let i = 0; i < r; i += 1) {
        const m = this.piece();
        m.material = std(0xe2553d);
        m.position.set(Math.cos(i * 1.7) * 0.6, this.top + 0.05, 0.3 + Math.sin(i * 1.7) * 0.6);
        this.group.add(m);
        this.items.push(m);
      }
      this.leftLabel.userData.setText(`بقي ${r}`);
      this.leftLabel.position.set(0, 2.0, 0.3);
      this.leftLabel.visible = true;
      this.label.visible = false;
      game.audio.play('fail');
      game.shake = 0.1;
    } else
      for (let k = 0; k < b; k += 1) {
        const p = spot(k, 3.0);
        game.particles.burst(new THREE.Vector3(this.at.x + p.x, 1.4, this.at.z + p.z), 0x8dffb0, 9, 2.5, 2.5, 1);
      }
    onStep({ a: n, b, q, r, live: false });
    return { q, r };
  }

  async ship() {
    const game = this.game;
    const from = this.items.map((m) => m.position.y);
    await game.tween(
      0.9,
      (t) =>
        this.items.forEach((m, i) => {
          m.position.y = from[i] + Math.abs(Math.sin(t * Math.PI * 2 + i)) * 0.35 * (1 - t);
        }),
      (t) => t,
    );
    game.particles.burst(new THREE.Vector3(this.at.x, 2, this.at.z + 0.3), 0xffd166, 60, 6, 4, 1.4);
    await game.wait(0.5);
    this.clearSim();
  }

  update(time) {
    if (this.leftLabel.visible) this.leftLabel.material.opacity = 0.75 + Math.abs(Math.sin(time * 4)) * 0.25;
  }
}

const LEN = 15.5;
export class TileScene {
  constructor(game) {
    this.game = game;
    this.at = { x: 20, z: 560 };
    this.tiles = [];
    this.boxes = [];
    const g = new THREE.Group();
    g.position.set(this.at.x, 0, this.at.z);
    game.scene.add(g);
    this.group = g;
    const rand = seeded(313);
    g.add(makeIsland(20, 'stone', 71));
    // a house being finished: bare block walls, a door frame, the corridor to tile
    for (const [x, w] of [
      [-5.6, 6.6],
      [5.6, 6.6],
    ]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 3.6, 0.6), std(0xb9b3a6));
      wall.position.set(x, 1.8, -4.4);
      wall.castShadow = true;
      g.add(wall);
    }
    for (let i = 0; i < 7; i += 1) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(17.8, 0.05, 0.62), std(0x9a9488));
      line.position.set(0, 0.5 + i * 0.5, -4.4);
      g.add(line);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.5, 0.6), std(0x8d8d95));
    lintel.position.set(0, 3.35, -4.4);
    g.add(lintel);
    const screed = new THREE.Mesh(new THREE.BoxGeometry(LEN + 0.5, 0.12, 3.2), std(0x6f7480));
    screed.position.set(0, 0.06, 0.2);
    screed.receiveShadow = true;
    g.add(screed);
    for (const x of [-LEN / 2 - 0.35, LEN / 2 + 0.35]) {
      const kerb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 3.4), std(0xd9d6cc));
      kerb.position.set(x, 0.2, 0.2);
      g.add(kerb);
    }
    this.label = textSprite('0', { h: 1.25, bg: 'rgba(10,26,60,0.9)', stroke: null, color: '#e9fbff' });
    this.label.position.set(0, 3.0, 0.2);
    g.add(this.label);
    // the tiler's tools: a level, a bucket, cement sacks, a wheelbarrow, the pile of tiles
    const level = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.2), std(0xf2c230));
    level.position.set(-4.6, 0.22, 3.2);
    level.rotation.y = 0.3;
    g.add(level);
    const bucket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.38, 0.7, 12),
      std(0x2f6fd0, { flatShading: false }),
    );
    bucket.position.set(-7.6, 0.35, 3.6);
    g.add(bucket);
    for (let i = 0; i < 3; i += 1) {
      const sack = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 0.9), std(0xd9cdb0));
      sack.position.set(8.6, 0.25 + i * 0.46, -2.2 + (i % 2) * 0.15);
      sack.rotation.y = i * 0.2;
      sack.castShadow = true;
      g.add(sack);
    }
    const barrow = new THREE.Group();
    barrow.position.set(9.6, 0, 3.4);
    barrow.rotation.y = -0.5;
    g.add(barrow);
    const tub = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 1.2), std(0x16a34a));
    tub.position.y = 0.85;
    tub.castShadow = true;
    barrow.add(tub);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 12), std(0x1c1f2b));
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(1.1, 0.4, 0);
    barrow.add(wheel);
    this.stack = new THREE.Vector3(-9.6, 0.5, 0.2);
    this.tileMats = [std(0xc96f4a), std(0xe0a070)];
    for (let i = 0; i < 6; i += 1) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 1.5), this.tileMats[i % 2]);
      t.position.set(this.stack.x, 0.1 + i * 0.13, this.stack.z);
      t.castShadow = true;
      g.add(t);
    }
    for (let i = 0; i < 5; i += 1) {
      const r = makeRock('stone', rand, 0.35 + rand() * 0.4);
      const a = rand() * 6.28;
      r.position.x = Math.cos(a) * 16;
      r.position.z = Math.sin(a) * 16;
      g.add(r);
    }
    const sign = textSprite('ورشة عمّي الطاهر', { h: 1.1, bg: 'rgba(180,83,9,0.96)', stroke: null, color: '#fff7d6' });
    sign.position.set(-6.5, 4.4, -4.2);
    g.add(sign);
    this.gap = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.14, 2.9),
      new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.6 }),
    );
    this.gap.visible = false;
    g.add(this.gap);
    this.note = textSprite('0', { h: 1.0, bg: 'rgba(190,40,40,0.95)', stroke: null, color: '#fff' });
    this.note.visible = false;
    g.add(this.note);
    this.counter = textSprite('0', { h: 1.3, color: '#fff3b0' });
    this.counter.visible = false;
    g.add(this.counter);
    this.robotSpot = new THREE.Vector3(this.at.x - 3.4, 0, this.at.z + 7.2);
    this.camPos = new THREE.Vector3(this.at.x, 15.5, this.at.z + 19);
    this.camLook = new THREE.Vector3(this.at.x, 0.4, this.at.z + 0.9);
  }

  setOrder(order) {
    this.clearSim();
    this.label.userData.setText(`${order.L} سم`);
  }
  clearSim() {
    wipe(this.group, this.tiles);
    wipe(this.group, this.boxes);
    this.gap.visible = false;
    this.note.visible = false;
    this.counter.visible = false;
  }
  /** Only the boxes of a wrong purchase go away: the corridor stays tiled. */
  clearBoxes() {
    wipe(this.group, this.boxes);
    this.note.visible = false;
    this.counter.visible = false;
  }

  async runSim({ n, b, mode }, good, onStep = () => {}) {
    const game = this.game;
    const { q, r } = divide(n, b);
    onStep({ a: n, b, q: 0, r: n, live: true });
    this.note.visible = false;
    this.counter.visible = q > 0;
    const per = game.instantSim ? 0.001 : Math.min(0.3, Math.max(0.07, 2.8 / Math.max(1, q)));
    if (mode === 'row') {
      // n = the length of the corridor in cm, b = the length of a tile: q whole tiles, r cm uncovered
      wipe(this.group, this.tiles);
      this.gap.visible = false;
      const unit = LEN / n;
      const w = b * unit;
      for (let k = 0; k < q; k += 1) {
        if (game.dead) return { q, r };
        const tile = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.05, w - 0.05), 0.14, 2.8), this.tileMats[k % 2]);
        tile.castShadow = true;
        tile.receiveShadow = true;
        this.group.add(tile);
        this.tiles.push(tile);
        const home = new THREE.Vector3(-LEN / 2 + (k + 0.5) * w, 0.19, 0.2);
        await game.tween(
          per,
          (t) => {
            tile.position.lerpVectors(this.stack, home, t);
            tile.position.y += Math.sin(t * Math.PI) * 2;
          },
          easeOut,
        );
        game.audio.play('plank', k);
        this.counter.userData.setText(String(k + 1));
        this.counter.position.set(home.x, 1.6, home.z);
        onStep({ a: n, b, q: k + 1, r: n - b * (k + 1), live: true });
      }
      await game.wait(game.instantSim ? 0.001 : 0.25);
      this.counter.visible = false;
      if (r > 0) {
        const gw = r * unit;
        this.gap.scale.x = gw;
        this.gap.position.set(LEN / 2 - gw / 2, 0.2, 0.2);
        this.gap.visible = true;
        this.note.userData.setText(`يبقى ${r} سم`);
        this.note.position.set(LEN / 2 - gw / 2, 1.9, 0.2);
        this.note.visible = true;
        game.audio.play('fail');
        game.shake = 0.1;
      } else
        for (let i = 0; i <= 6; i += 1)
          game.particles.burst(
            new THREE.Vector3(this.at.x - LEN / 2 + (LEN * i) / 6, 0.8, this.at.z + 0.2),
            0x8dffb0,
            8,
            3,
            3,
            1,
          );
    } else {
      // the boxes to buy: n tiles in boxes of b — q full boxes, and one more opened for the r that are still needed
      wipe(this.group, this.boxes);
      const total = q + (r > 0 ? 1 : 0);
      const cols = Math.min(10, total);
      const size = Math.min(1.25, 13 / cols);
      for (let k = 0; k < total; k += 1) {
        if (game.dead) return { q, r };
        const full = k < q;
        const box = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(size * 0.86, size * 0.5, size * 0.86), std(0xb08a5a));
        body.position.y = size * 0.25;
        body.castShadow = true;
        box.add(body);
        const fill = full ? 1 : r / b;
        const top = new THREE.Mesh(
          new THREE.BoxGeometry(size * 0.72 * fill, 0.07, size * 0.72),
          std(full ? 0xc96f4a : 0xffb14a),
        );
        top.position.set(-(size * 0.72 * (1 - fill)) / 2, size * 0.5 + 0.03, 0);
        box.add(top);
        const home = new THREE.Vector3(((k % cols) - (cols - 1) / 2) * size, 0.1, 4.6 + Math.floor(k / cols) * size);
        this.group.add(box);
        this.boxes.push(box);
        await game.tween(
          per,
          (t) => {
            box.position.lerpVectors(this.stack, home, t);
            box.position.y += Math.sin(t * Math.PI) * 1.6;
          },
          easeOut,
        );
        game.audio.play('plank', k);
        if (full) {
          this.counter.userData.setText(String(k + 1));
          this.counter.position.set(home.x, 1.5, home.z);
          onStep({ a: n, b, q: k + 1, r: n - b * (k + 1), live: true });
        } else {
          this.note.userData.setText(`تبقى ${b - r}`);
          this.note.position.set(home.x, 1.7, home.z);
          this.note.visible = true;
        }
      }
      await game.wait(game.instantSim ? 0.001 : 0.25);
      this.counter.visible = false;
    }
    onStep({ a: n, b, q, r, live: false });
    return { q, r };
  }

  async ship() {
    const game = this.game;
    for (let i = 0; i <= 8; i += 1)
      game.particles.burst(
        new THREE.Vector3(this.at.x - LEN / 2 + (LEN * i) / 8, 0.6, this.at.z + 0.2),
        0xffd166,
        10,
        3,
        3,
        1.2,
      );
    game.audio.play('success');
    await game.wait(1.1);
    this.clearSim();
  }

  update(time) {
    if (this.gap.visible) this.gap.material.opacity = 0.4 + Math.abs(Math.sin(time * 5)) * 0.4;
  }
}
