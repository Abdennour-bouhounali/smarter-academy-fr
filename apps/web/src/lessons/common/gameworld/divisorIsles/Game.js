/**
 * « L’archipel des diviseurs » — a game world (student only), played with the content of the lesson that names it in its pack.
 *
 * A chain of floating islands. Between two islands a gap of `a` cells; the student carries a mould of length `b` and fires
 * planks of that length: the scene lays q planks and shows the r cells left (a = b × q + r). The bridge HOLDS only when r = 0,
 * otherwise it crumbles — so « b is a divisor of a » is something the student sees happen before any word names it.
 *
 * This file is the MECHANIC: the islands, the gaps, the moulds, the forge, the storm, the statues, the last bridge, the gate
 * dash and the real-world cases. The scene, the loop, the robot, the camera, the hub and the save are the kit's
 * (`kit/WorldRuntime.js`), which it extends and feeds through its hooks. The lesson's content comes as `this.lesson`.
 * React (DivisorIsles.jsx) only draws the HUD and overlays from `state` and calls the public methods.
 */
import * as THREE from 'three';
import {
  seeded,
  std,
  glow,
  textSprite,
  makeIsland,
  makeTree,
  makeRock,
  makeFlower,
  makeBigCrystal,
  mouldColor,
  makePedestal,
  makeMould,
  makeAltar,
  makeBeacon,
  makePylon,
  makeSign,
  makeAnvil,
  makeStatue,
  makeHoverboard,
  makeLighthouse,
} from '../engine/builders';
import { divide, predictOptions, bridgeStars, buildLayout, DASH, checkDivision, checkCount, gapSign } from './logic';
import { T as WORLD_TEXT, waveSay, waveHint } from './strings';
import { gatePoints, PRACTICE_HEARTS, MAX_WAVES } from '../kit/ladder';
import { makeMission, judge, facts, answerParts, WORLD_OF, ORDER_PAY, MISTAKE_COST, CASE_HEARTS } from './cases';
import { Depot } from './Depot';
import { WorldRuntime, easeOut, damp } from '../kit/WorldRuntime';
import { ShareScene, TileScene } from './Worlds';

/** The 3D worlds of the real cases, built the first time they are played. */
import { markVerdict, signChain } from './mark';

const WORLDS = { depot: Depot, share: ShareScene, tiling: TileScene };
const MISSION_PAN = new THREE.Vector3(0, 2.4, 3.2); // the notebook and the paper stand on the two sides

const BRIDGE_HALF = 1.15;

/** Sky palettes along the journey: morning → noon → gold → dusk → night. [top, bottom, sun colour, sun intensity, ambient, night] */
const SKIES = [
  [0x3f94ff, 0xd4f1ff, 0xfff4dc, 2.5, 1.0, 0],
  [0x3a8dff, 0xcfeeff, 0xfff6e6, 2.6, 1.0, 0],
  [0x3585f5, 0xc9eaff, 0xfffaf0, 2.7, 1.0, 0],
  [0x3f86ee, 0xd3e9ff, 0xfff4e0, 2.6, 1.0, 0],
  [0x4a84e6, 0xdfe8ff, 0xffeed2, 2.6, 0.98, 0],
  [0x5682dc, 0xf2e4f0, 0xffe6c4, 2.5, 0.95, 0],
  [0x5f72cc, 0xf1dbe6, 0xffd9bb, 2.4, 0.95, 0.1],
  [0x2c3788, 0xc6c4ea, 0xffd0b4, 2.1, 0.92, 0.45],
  [0x0b1038, 0x2a3a7a, 0x9fb8ff, 1.1, 0.8, 1],
];

/** The world's words with the story's over them, key by key (a story changes only what it tells differently). */
function withStory(base, over) {
  if (!over) return base;
  const out = { ...base };
  for (const [k, v] of Object.entries(over))
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && typeof base[k] === 'object' ? withStory(base[k], v) : v;
  return out;
}

export class DivisorIslesGame extends WorldRuntime {
  // ───────────────────────────── what this world gives the runtime (kit/WorldRuntime.js › hooks) ─────────────────────────────
  initWorld(sv) {
    // THE STORY is the lesson's: its islands and gaps, what each island holds (`feature`), what a segment is (`boss`,
    // `storm`, `workshop`), its words, and what happens on the way (`onArrive`, `afterKey`, `onHold`…). This file is the
    // mechanic that plays it.
    this.story = this.lesson.story;
    this.T = withStory(WORLD_TEXT, this.story.text);
    this.layout = buildLayout(this.story.islands, this.story.segments);
    this.isl = this.layout.islands;
    this.segs = this.layout.segs.map((s) => ({
      ...s,
      planks: [],
      builtLen: 0,
      complete: false,
      builtWith: null, // the plank that holds it (a bridge may hold with more than one: the one HE laid)
      stat: { firstPrediction: null, falls: 0, fails: 0 },
    }));
    this.rail = this.segs.find((seg) => seg.kind === 'rail');
    this.bossSeg = this.segs.find((seg) => seg.boss) ?? null;
    this.stoneAt = this.isl.findIndex((isl) => isl.feature === 'stone');
    // the student's crossing as evidence for the rule forge (every bridge fired)
    this.log = [...(sv?.log ?? [])];
    // the plank each standing bridge was built with (segment id → b)
    this.built = { ...(sv?.built ?? {}) };
    // A MARKED STRETCH (`seg.mark`, `./mark.js`): the planks that held each such bridge, in the order he built them —
    // the sign of the bridge is rewritten once per plank (segment id → [b, …])
    this.markSigns = { ...(sv?.signs ?? {}) };
    this.heldSaved = sv?.held ?? null;
    // CONVOYS (owner, 2026-11-19): consecutive bridges that carry the same `convoy` id are built with the planks of ONE
    // island — the first one's. The islands in between hold no planks and he keeps the plank he carries; if a later gap
    // refuses it he WALKS BACK and picks again, and every bridge of the convoy is rebuilt with the new planks. A convoy
    // may have a PURSE (`story.convoys[id].purse`): a coin per plank laid, whatever its length.
    this.convoys = this.story.convoys ?? {};
  }
  worldState(sv) {
    return {
      held: null,
      equation: null,
      pinned: null,
      stars: { ...(sv?.stars ?? {}) },
      verdict: null,
      objective: '',
      dash: null,
      hasSave: Boolean(sv && (sv.stage > 0 || Object.keys(sv.stars ?? {}).length)),
      islandName: this.isl[sv?.stage ?? 0].name,
      depot: null,
      recall: [],
      purse: null,
      sign: null,
      mission: null,
    };
  }
  worldSave() {
    return { stars: this.state.stars, log: this.log, built: this.built, held: this.state.held, signs: this.markSigns };
  }
  worldCentre() {
    return this.isl[Math.floor(this.isl.length / 2)];
  }
  buildWorld(cr) {
    // far islets, only scenery
    for (let i = 0; i < 16; i += 1) {
      const isl = this.isl[Math.floor(cr() * this.isl.length)];
      const a = cr() * Math.PI * 2;
      const d = 45 + cr() * 70;
      const R = 2.5 + cr() * 4;
      const x = isl.x + Math.cos(a) * d;
      const z = isl.z + Math.sin(a) * d;
      if (this.isl.some((o) => Math.hypot(o.x - x, o.z - z) < o.R + R + 14) || this.nearAnySegment(x, z, R + 8))
        continue;
      const g = makeIsland(R, ['meadow', 'pine', 'autumn', 'crystal'][i % 4], 300 + i);
      g.position.set(x, -6 + cr() * 14, z);
      const tr = makeTree(['meadow', 'pine', 'autumn', 'crystal'][i % 4], cr, 1.2);
      g.add(tr);
      g.userData.bob = cr() * 6;
      this.scene.add(g);
      this.clouds.push(g);
      g.userData.v = 0;
    }

    this.isl.forEach((isl, i) => this.buildIsland(isl, i));
    this.segs.forEach((seg) => (seg.kind === 'rail' ? this.buildRail(seg) : this.buildBridge(seg)));
    this.heldMesh = null;
  }
  spawnPoint() {
    return this.spawnOf(this.state.stage);
  }
  /** The sky follows the journey; the depot of the practice game works in daylight, whatever the hour of the story. */
  skyTarget() {
    return this.caseRun ? SKIES[1] : SKIES[Math.min(this.state.finished ? 8 : this.state.stage, 8)];
  }
  /**
   * Where he stands on the road: the bridge under him, or the island he is on — never past the island he has reached.
   * `ahead` is the segment that leaves that place, `behind` the one that led to it.
   */
  place() {
    const h = this.hero;
    const last = this.segs.length - 1;
    if (!h)
      return { ahead: Math.min(this.state.stage, last), behind: Math.max(0, Math.min(this.state.stage, last) - 1) };
    for (const seg of this.segs) {
      if (seg.kind !== 'bridge' || seg.builtLen <= 0) continue;
      const u = (h.pos.x - seg.sx) * seg.dx + (h.pos.z - seg.sz) * seg.dz;
      const v = (h.pos.x - seg.sx) * seg.rx + (h.pos.z - seg.sz) * seg.rz;
      if (Math.abs(v) <= BRIDGE_HALF + 0.4 && u > 0.6 && u < seg.len - 0.6)
        return { ahead: seg.index, behind: seg.index };
    }
    const i = Math.min(h?.island ?? this.state.stage, this.state.stage, last);
    return { ahead: i, behind: Math.max(0, i - 1) };
  }
  /** The road ahead of where he stands — or, when he has turned round (`facing` -1), the road back. */
  heading() {
    const at = this.place();
    const back = this.facing < 0;
    const seg = this.segs[back ? at.behind : at.ahead];
    return Math.atan2(seg.dx, seg.dz) + (back ? Math.PI : 0);
  }
  cameraShot(ph) {
    const h = this.hero;
    const want = new THREE.Vector3();
    const look = new THREE.Vector3();
    let k = 4.5;
    if (ph === 'title' && !this.dash && !this.caseRun) {
      const a = this.time * 0.12 + 0.6;
      const c = this.isl[this.state.stage];
      want.set(c.x + Math.sin(a) * 19, 8.5, c.z + Math.cos(a) * 19);
      look.set(c.x, 1.2, c.z);
      k = 2;
    } else if (ph === 'end') {
      const a = this.time * 0.16;
      const c = this.lighthouseWorld;
      want.set(c.x + Math.sin(a) * 30, 15, c.z + Math.cos(a) * 30);
      look.set(c.x, 8, c.z);
      k = 1.2;
    } else {
      const cine = super.cameraShot(ph);
      if (cine) return cine;
      if (this.state.mission) {
        // the mission's panel stands on the left of the screen: the depot is framed in what is left of it
        want.copy(this.depot.camPos).add(MISSION_PAN);
        look.copy(this.depot.camLook).add(MISSION_PAN);
        k = 2.4;
      } else if (this.caseRun) {
        want.copy(this.depot.camPos);
        look.copy(this.depot.camLook);
        k = 2.4;
      } else if (this.dash) {
        const rail = this.rail;
        const off = this.dash.v * 0.7;
        want.set(h.pos.x - rail.dx * 7.5 - rail.rx * off, 4.6, h.pos.z - rail.dz * 7.5 - rail.rz * off);
        look.set(h.pos.x + rail.dx * 9 - rail.rx * off, 1.6, h.pos.z + rail.dz * 9 - rail.rz * off);
        k = 8;
      } else return null;
    }
    return { pos: want, look, k };
  }
  followsHero(ph) {
    return super.followsHero(ph) && !this.dash && !this.caseRun;
  }
  fov() {
    return this.dash ? 60 : this.caseRun ? 50 : 55;
  }
  busy() {
    return Boolean(this.dash || this.caseRun);
  }
  /** The rule forge is a full-screen page too. */
  pausesWorld(page) {
    return page === 'forge' || super.pausesWorld(page);
  }
  onStart() {
    if (this.state.stage === 0 && !this.segs[0].complete) this.say(this.T.say.hello, 10);
    // a forge left unfinished (the page was closed in front of a mirror) opens again: a key cannot be skipped
    const pending = this.pendingForge();
    if (pending)
      this.wait(0.9).then(
        () => !this.dead && this.state.phase === 'play' && !this.state.overlay && this.openForge(pending),
      );
  }
  onGround() {
    const h = this.hero;
    const i = this.isl.findIndex((isl) => Math.hypot(h.pos.x - isl.x, h.pos.z - isl.z) <= isl.R - 0.12);
    if (i >= 0) {
      if (h.island !== i) {
        h.island = i;
        this.syncSign(); // the sign shown is the one of the bridge that leaves THIS island
      } else h.island = i;
      if (i === this.state.stage + 1 && this.segs[this.state.stage]?.complete) this.arrive(i);
    }
  }
  respawnPoint() {
    return this.isl[this.hero.island].spawn;
  }
  onFall() {
    const seg = this.segs[this.state.stage];
    if (seg && !seg.complete) seg.stat.falls += 1;
    this.say(this.T.say.fall[this.state.falls % this.T.say.fall.length], 4);
  }
  stepPhase(ph, dt) {
    if (ph !== 'dash' || !this.dash) return false;
    this.updateDash(dt);
    return true;
  }
  lanesLive(ph) {
    return ph === 'dash';
  }
  robotPose(ph) {
    const eq = this.state.equation;
    return {
      lift: this.dash ? 0.15 : 0,
      speed: this.dash ? 4 : null,
      sad: Boolean(ph === 'forge' && eq && !eq.live && eq.r > 0 && this.state.verdict?.right !== true),
    };
  }
  stepWorld(dt, ph) {
    const h = this.hero;
    if (this.heldMesh) {
      this.heldMesh.position.set(h.pos.x, h.pos.y + 2.75 + Math.sin(this.time * 2.5) * 0.08, h.pos.z);
      this.heldMesh.userData.box.rotation.y += dt * 1.2;
    }
    for (const isl of this.isl)
      for (const p of isl.pedestals) {
        const m = p.group.userData.mould;
        m.position.y = 1.75 + Math.sin(this.time * 2 + p.b) * 0.1;
        m.userData.box.rotation.y += dt * 0.8;
      }
    for (const seg of this.segs)
      if (seg.altar) {
        const u = seg.altar.userData;
        u.prism.rotation.y += dt * 1.5;
        u.prism.position.y = 1.55 + Math.sin(this.time * 2.2) * 0.12;
        // the beacon: this platform is the next step (a mould is in hand, or the last bridge is open)
        const next =
          ph === 'play' &&
          seg.index === this.state.stage &&
          (seg.boss
            ? Boolean(this.flags.key4) && !(seg.complete && this.flags.bossPaid)
            : !seg.complete && this.state.held != null);
        u.beacon.visible = next;
        if (next) u.beacon.userData.animate(this.time, dt, this.activeIt === seg.altarIt);
      }
    if (this.stoneBeacon) {
      const on = ph === 'play' && this.state.stage === this.stoneAt && !this.flags.key4;
      this.stoneBeacon.visible = on;
      if (on) this.stoneBeacon.userData.animate(this.time, dt, this.activeIt === this.stoneIt);
    }
    if (this.gapPulse) this.gapPulse.material.opacity = 0.35 + Math.abs(Math.sin(this.time * 7)) * 0.45;
    for (const isl of this.isl)
      if (isl.anvil) {
        isl.anvil.userData.spark.rotation.y += dt * 2;
        isl.anvil.userData.spark.visible = this.anvilOpen(isl.index);
      }
    if (this.statueRing) this.statueRing.visible = !this.flags.statues;
    if (this.board && !this.dash && !this.rail.complete)
      this.board.position.y = 0.35 + Math.sin(this.time * 2.4) * 0.07;
    if (this.lit) this.lighthouse.userData.beams.rotation.y += dt * 0.5;
    if (this.depot) this.depot.update(this.time);
  }

  // ───────────────────────────── store ─────────────────────────────

  // ───────────────────────────── helpers ─────────────────────────────
  segPoint(seg, u, v = 0, y = 0) {
    return new THREE.Vector3(seg.sx + seg.dx * u + seg.rx * v, y, seg.sz + seg.dz * u + seg.rz * v);
  }
  exitDir(i) {
    const s = this.segs[Math.min(i, this.segs.length - 1)];
    return { dx: s.dx, dz: s.dz, rx: s.rx, rz: s.rz };
  }
  entryDir(i) {
    const s = this.segs[Math.max(0, i - 1)];
    return { dx: s.dx, dz: s.dz, rx: s.rx, rz: s.rz };
  }
  spawnOf(i) {
    const isl = this.isl[i];
    if (i === 0) return new THREE.Vector3(isl.x, 0, isl.z + 3.2);
    const d = this.entryDir(i);
    return new THREE.Vector3(isl.x - d.dx * (isl.R - 2.6), 0, isl.z - d.dz * (isl.R - 2.6));
  }

  // ───────────────────────────── build ─────────────────────────────

  nearAnySegment(x, z, margin) {
    return this.layout.segs.some((s) => {
      const u = (x - s.sx) * s.dx + (z - s.sz) * s.dz;
      const v = (x - s.sx) * s.rx + (z - s.sz) * s.rz;
      return u > -margin && u < s.len + margin && Math.abs(v) < margin;
    });
  }

  buildIsland(isl, i) {
    const g = makeIsland(isl.R, isl.theme, 11 + i * 7);
    g.position.set(isl.x, 0, isl.z);
    this.scene.add(g);
    isl.group = g;
    isl.pedestals = [];
    const rand = seeded(500 + i * 13);
    const out = this.exitDir(i);
    const inn = this.entryDir(i);
    const last = i === this.isl.length - 1;
    const reserved = [];
    const axis = last ? inn : out;
    const local = (u, v) => ({ x: axis.dx * u + axis.rx * v, z: axis.dz * u + axis.rz * v });

    // name sign near the entrance
    const sign = makeSign(isl.name);
    const sp =
      i === 0
        ? { x: -3.4, z: 4.4 }
        : { x: -inn.dx * (isl.R - 1.6) + inn.rx * 2.6, z: -inn.dz * (isl.R - 1.6) + inn.rz * 2.6 };
    sign.position.set(sp.x, 0, sp.z);
    g.add(sign);
    reserved.push({ ...sp, r: 1.6 });
    this.signs.push({ obj: sign, x: isl.x + sp.x, z: isl.z + sp.z });

    const seg = this.segs[i];
    if (seg && seg.kind === 'bridge') {
      // the forge platform, to the right of the bridge's entrance
      const ap = local(isl.R - 2.9, 2.7);
      const altar = makeAltar();
      altar.position.set(ap.x, 0, ap.z);
      g.add(altar);
      seg.altar = altar;
      seg.altarWorld = new THREE.Vector3(isl.x + ap.x, 0, isl.z + ap.z);
      reserved.push({ ...ap, r: 2.4 });
      seg.altarIt = this.addInteract(
        isl.x + ap.x,
        isl.z + ap.z,
        () => this.altarPrompt(seg),
        () => this.actAltar(seg),
        2.8,
        3.0,
      );
      this.placePedestals(isl, i, seg.moulds, local, reserved);
    }
    if (isl.feature === 'guardians') this.buildGuardians(isl, local, reserved);
    if (this.segs[i] === this.rail) this.buildBoard(isl, i, local);
    if (isl.feature === 'anvil') {
      const p = local(-5.2, -2.7);
      const anvil = makeAnvil();
      anvil.position.set(p.x, 0, p.z);
      g.add(anvil);
      this.anvil = anvil;
      isl.anvil = anvil; // an island's own workshop (a world may have several: 2026-11-19)
      reserved.push({ ...p, r: 2 });
      this.colliders.push({ x: isl.x + p.x, z: isl.z + p.z, r: 1.0 });
      this.addInteract(
        isl.x + p.x,
        isl.z + p.z,
        () => (this.anvilOpen(i) ? this.T.prompt.anvil : this.T.prompt.anvilLocked),
        () => this.actAnvil(i),
        2.6,
      );
    }
    if (isl.feature === 'stone') {
      // the question stone of the island
      const p = local(-1.5, -3.6);
      const stone = new THREE.Group();
      const slab = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.3, 0.4), std(0x8d8d95));
      slab.position.y = 1.15;
      slab.castShadow = true;
      stone.add(slab);
      const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), glow(0xffc12e, 0.7));
      rune.position.set(0, 1.5, 0.3);
      stone.add(rune);
      stone.position.set(p.x, 0, p.z);
      stone.rotation.y = Math.atan2(-p.x, -p.z);
      g.add(stone);
      reserved.push({ ...p, r: 2 });
      this.colliders.push({ x: isl.x + p.x, z: isl.z + p.z, r: 0.9 });
      this.stoneIt = this.addInteract(
        isl.x + p.x,
        isl.z + p.z,
        () => (this.state.stage === this.stoneAt && !this.flags.key4 ? this.T.prompt.stone : null),
        () => this.openStone(),
        2.8,
        3.6,
      );
      this.stoneBeacon = makeBeacon(1.25);
      this.stoneBeacon.position.set(p.x, 0, p.z);
      g.add(this.stoneBeacon);
    }
    if (last) {
      const lh = makeLighthouse();
      const p = local(2.4, 0);
      lh.position.set(p.x, 0, p.z);
      lh.rotation.y = Math.atan2(-inn.dx, -inn.dz);
      g.add(lh);
      this.lighthouse = lh;
      this.lighthouseWorld = new THREE.Vector3(isl.x + p.x, 0, isl.z + p.z);
      reserved.push({ ...p, r: 4.6 });
      this.colliders.push({ x: isl.x + p.x, z: isl.z + p.z, r: 3.2 });
    }

    // scenery, kept off the path (entrance → centre → exit) and off the reserved spots
    const onPath = (x, z) => {
      const d1 = i === 0 ? 99 : distToSeg(x, z, -inn.dx * isl.R, -inn.dz * isl.R, 0, 0);
      const d2 = last ? 99 : distToSeg(x, z, 0, 0, out.dx * isl.R, out.dz * isl.R);
      return Math.min(d1, d2) < 2.3;
    };
    const free = (x, z, rr) => !onPath(x, z) && reserved.every((q) => Math.hypot(q.x - x, q.z - z) > q.r + rr);
    const scatter = (n, minD, maxD, rr, make, collide) => {
      let placed = 0;
      let tries = 0;
      while (placed < n && tries < n * 30) {
        tries += 1;
        const a = rand() * Math.PI * 2;
        const d = minD + rand() * (maxD - minD);
        const x = Math.cos(a) * d;
        const z = Math.sin(a) * d;
        if (!free(x, z, rr)) continue;
        const m = make();
        m.position.x = x;
        m.position.z = z;
        m.rotation.y = rand() * Math.PI * 2;
        g.add(m);
        if (collide === 0.4) this.occluders.push({ obj: m, x: isl.x + x, z: isl.z + z, s: 1 });
        reserved.push({ x, z, r: rr });
        if (collide) this.colliders.push({ x: isl.x + x, z: isl.z + z, r: collide });
        placed += 1;
      }
    };
    scatter(
      isl.theme === 'stone' ? 3 : 6,
      isl.R * 0.5,
      isl.R - 1.3,
      1.1,
      () => makeTree(isl.theme, rand, 0.9 + rand() * 0.5),
      0.4,
    );
    scatter(4, isl.R * 0.3, isl.R - 0.9, 0.8, () => makeRock(isl.theme, rand, 0.35 + rand() * 0.45), 0.5);
    if (isl.theme === 'crystal')
      scatter(
        3,
        isl.R * 0.5,
        isl.R - 1.2,
        1.0,
        () => makeBigCrystal([0xb69cff, 0x7dfcff, 0xff9de0][Math.floor(rand() * 3)], rand, 0.9),
        0.5,
      );
    scatter(16, 1, isl.R - 0.6, 0.25, () => makeFlower(isl.theme, rand), 0);

    // gems
    for (let k = 0; k < 4; k += 1) {
      const a = rand() * Math.PI * 2;
      const d = 2 + rand() * (isl.R - 3.2);
      this.addGem(`i${i}-${k}`, isl.x + Math.cos(a) * d, k === 0 ? 1.9 : 0.9, isl.z + Math.sin(a) * d);
    }
    isl.spawn = this.spawnOf(i);
  }

  placePedestals(isl, i, moulds, local, reserved) {
    isl.pedestals.forEach((p) => {
      p.group.parent?.remove(p.group);
      p.dead = true;
    });
    isl.pedestals = [];
    const n = moulds.length;
    moulds.forEach((b, k) => {
      const off = (k - (n - 1) / 2) * (n > 4 ? 2.5 : 2.9);
      const p = local(0.6 - Math.abs(off) * 0.22, -off - (n === 1 ? 2.2 : 0));
      const ped = makePedestal(b);
      ped.position.set(p.x, 0, p.z);
      isl.group.add(ped);
      const rec = { b, group: ped, x: isl.x + p.x, z: isl.z + p.z, dead: false };
      isl.pedestals.push(rec);
      reserved?.push({ ...p, r: 1.5 });
      const col = { x: rec.x, z: rec.z, r: 0.85 };
      this.colliders.push(col);
      rec.col = col;
      this.addInteract(
        rec.x,
        rec.z,
        () => (rec.dead || this.state.held === b ? null : this.T.prompt.take(b)),
        () => {
          if (!rec.dead) this.take(b);
        },
        2.1,
        3.7,
      );
    });
  }

  buildGuardians(isl, local, reserved) {
    this.statues = [];
    for (let k = 0; k < 4; k += 1) {
      const side = k < 2 ? -1 : 1;
      const p = local(1.6 - Math.abs(k - 1.5) * 1.1, (k - 1.5) * 2.4 + side * 1.7);
      const s = makeStatue(k);
      s.position.set(p.x, 0, p.z);
      const back = local(-6, 0);
      s.rotation.y = Math.atan2(back.x - p.x, back.z - p.z);
      isl.group.add(s);
      this.statues.push(s);
      reserved.push({ ...p, r: 1.6 });
      this.colliders.push({ x: isl.x + p.x, z: isl.z + p.z, r: 0.9 });
    }
    const c = local(-1.2, 0);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.08, 6, 30), glow(0xffc12e, 0.7));
    ring.rotation.x = Math.PI / 2;
    ring.position.set(c.x, 0.06, c.z);
    isl.group.add(ring);
    this.statueRing = ring;
    reserved.push({ ...c, r: 2 });
    this.addInteract(
      isl.x + c.x,
      isl.z + c.z,
      () => (!this.flags.statues ? this.T.prompt.statues : null),
      () => this.openStatues(),
      2.4,
    );
  }

  /** The board of light waits where the rail starts. */
  buildBoard(isl, i, local) {
    const b = local(isl.R - 2.4, 0);
    const board = makeHoverboard();
    board.position.set(isl.x + b.x, 0.35, isl.z + b.z);
    this.scene.add(board);
    const out = this.exitDir(i);
    board.rotation.y = Math.atan2(out.dx, out.dz);
    this.board = board;
    this.boardHome = board.position.clone();
    this.addInteract(
      isl.x + b.x,
      isl.z + b.z,
      () => (this.rail.complete ? null : this.T.prompt.board),
      () => this.actBoard(),
      2.2,
    );
  }

  buildBridge(seg) {
    const g = new THREE.Group();
    this.scene.add(g);
    seg.group = g;
    const yaw = Math.atan2(seg.dx, seg.dz);
    seg.yaw = yaw;
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    seg.pylons = [];
    for (const [u, v] of [
      [0.2, 1.55],
      [0.2, -1.55],
      [seg.len - 0.2, 1.55],
      [seg.len - 0.2, -1.55],
    ]) {
      const p = makePylon();
      p.position.copy(this.segPoint(seg, u, v));
      g.add(p);
      seg.pylons.push(p);
      this.colliders.push({ x: p.position.x, z: p.position.z, r: 0.35 });
    }
    // the gap drawn as a faint strip of light with one tick per cell: its length can be counted
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.02, seg.len),
      new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.13, depthWrite: false }),
    );
    strip.position.copy(this.segPoint(seg, seg.len / 2, 0, -0.04));
    strip.quaternion.copy(q);
    g.add(strip);
    if (seg.a <= 200) {
      const tick = new THREE.InstancedMesh(
        new THREE.BoxGeometry(2.3, 0.03, Math.min(0.05, seg.cell * 0.14)),
        new THREE.MeshBasicMaterial({ color: 0xd8f6ff, transparent: true, opacity: 0.75 }),
        seg.a + 1,
      );
      const m = new THREE.Matrix4();
      for (let k = 0; k <= seg.a; k += 1) {
        m.compose(this.segPoint(seg, k * seg.cell, 0, -0.01), q, new THREE.Vector3(1, 1, 1));
        tick.setMatrixAt(k, m);
      }
      g.add(tick);
    }
    if (seg.mark) this.buildMark(seg, g, q);
    // the last bridge may be announced by the story's label (« 2³ × 3² × 7 cases »), never by its count (logic.js › gapSign)
    const label = textSprite(seg.mark ? this.T.mark.label(seg.mark, seg.a) : gapSign(seg), {
      h: 1.25,
      bg: 'rgba(10,26,60,0.86)',
      stroke: null,
      color: '#e9fbff',
    });
    label.position.copy(this.segPoint(seg, seg.len / 2, 0, 3.4));
    g.add(label);
    seg.label = label;
    const gap = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.12, 1),
      new THREE.MeshBasicMaterial({ color: 0xff9d3c, transparent: true, opacity: 0.55, depthWrite: false }),
    );
    gap.visible = false;
    gap.quaternion.copy(q);
    g.add(gap);
    seg.gap = gap;
    const count = textSprite('0', { h: 1.3, color: '#fff3b0' });
    count.visible = false;
    g.add(count);
    seg.count = count;
    for (let k = 1; k <= 3; k += 1) {
      const p = this.segPoint(seg, (seg.len * k) / 4);
      this.addGem(`${seg.id}-${k}`, p.x, 1.0, p.z);
    }
    // A GAP OF 0 CELLS (`standing: true`, a: 0): nothing is open, so the bridge stands from the start and costs no plank
    // — every plank « fills » it (`0 = d × 0`). It is drawn as one deck; he just walks across.
    if (seg.standing) {
      const deck = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.22, seg.len + 0.5), glow(0x2fe37a, 0.35));
      deck.position.copy(this.segPoint(seg, seg.len / 2, 0, 0.05));
      deck.quaternion.copy(q);
      g.add(deck);
      seg.deck = deck;
      this.markComplete(seg, true);
    }
  }

  /**
   * THE MARKED STRETCH of a bridge (`seg.mark` cells from the island he leaves; `./mark.js`): a band of light over those
   * cells — one colour per stroke when it was marked in several (`seg.strokes`) — and a LANTERN POST standing where it
   * ends, on each side: the post is what must stand on a joint between two planks.
   */
  buildMark(seg, g, q) {
    const strokes = seg.strokes?.length ? seg.strokes : [seg.mark];
    const tints = [0xffd24a, 0xff9d3c];
    let from = 0;
    strokes.forEach((n, k) => {
      const len = n * seg.cell;
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(2.7, 0.03, len),
        new THREE.MeshBasicMaterial({ color: tints[k % 2], transparent: true, opacity: 0.42, depthWrite: false }),
      );
      band.position.copy(this.segPoint(seg, from + len / 2, 0, -0.02));
      band.quaternion.copy(q);
      g.add(band);
      from += len;
    });
    seg.posts = [1.5, -1.5].map((v) => {
      const post = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.6, 8), std(0x1e4fa8));
      pole.position.y = 1.3;
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10), glow(0xffd24a, 1.1));
      lamp.position.y = 2.7;
      post.add(pole, lamp);
      post.userData.lamp = lamp;
      post.position.copy(this.segPoint(seg, seg.mark * seg.cell, v, 0));
      g.add(post);
      return post;
    });
  }

  /** The sign of the marked bridge he stands before: the fraction in cells, then once per plank that held. */
  syncSign() {
    const seg = this.segs[this.hero?.island ?? this.state.stage];
    const sign = seg?.mark
      ? { chain: signChain(seg.a, seg.mark, this.markSigns[seg.id] ?? []), strokes: seg.strokes ?? null }
      : null;
    if (JSON.stringify(sign) !== JSON.stringify(this.state.sign)) this.set({ sign });
  }

  buildRail(seg) {
    const g = new THREE.Group();
    this.scene.add(g);
    seg.group = g;
    const yaw = Math.atan2(seg.dx, seg.dz);
    seg.yaw = yaw;
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    for (const v of [-3.8, 3.8]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, seg.len), glow(0x35d8f0, 0.8));
      rail.position.copy(this.segPoint(seg, seg.len / 2, v, 0));
      rail.quaternion.copy(q);
      g.add(rail);
    }
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 0.05, seg.len),
      new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.1, depthWrite: false }),
    );
    floor.position.copy(this.segPoint(seg, seg.len / 2, 0, -0.05));
    floor.quaternion.copy(q);
    g.add(floor);
    const n = Math.floor(seg.len / 4);
    const sl = new THREE.InstancedMesh(
      new THREE.BoxGeometry(7.6, 0.05, 0.16),
      new THREE.MeshBasicMaterial({ color: 0xd8f6ff, transparent: true, opacity: 0.5 }),
      n,
    );
    const m = new THREE.Matrix4();
    for (let k = 0; k < n; k += 1) {
      m.compose(this.segPoint(seg, k * 4 + 2, 0, -0.02), q, new THREE.Vector3(1, 1, 1));
      sl.setMatrixAt(k, m);
    }
    g.add(sl);
    for (const v of [-1.25, 1.25]) {
      const ln = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.02, seg.len),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }),
      );
      ln.position.copy(this.segPoint(seg, seg.len / 2, v, 0));
      ln.quaternion.copy(q);
      g.add(ln);
    }
    seg.gates = this.story.dashWaves.map((w, k) => {
      const u = DASH.first + k * DASH.gap;
      const arches = DASH.lanes.map((v) => {
        const a = new THREE.Group();
        a.position.copy(this.segPoint(seg, u, v));
        a.quaternion.copy(q);
        const mat = glow(0x6f9dff, 0.6);
        for (const sx of [-1.05, 1.05]) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.0, 0.14), mat);
          post.position.set(sx, 1.5, 0);
          a.add(post);
        }
        const bar = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.14, 0.14), mat);
        bar.position.y = 3.0;
        a.add(bar);
        const veil = new THREE.Mesh(
          new THREE.PlaneGeometry(2.0, 2.9),
          new THREE.MeshBasicMaterial({
            color: 0x8fb8ff,
            transparent: true,
            opacity: 0.16,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        veil.position.y = 1.5;
        a.add(veil);
        const num = textSprite('0', { h: 2.1 });
        num.position.y = 4.3;
        a.add(num);
        g.add(a);
        return { group: a, mat, veil, num };
      });
      return { u, arches, wave: w, order: [0, 1, 2] };
    });
  }

  /** Puts the world in the state of the save: earlier bridges rebuilt, flags applied. */
  /**
   * PROTOTYPE (dev builds only): the QA page `/__qa/mission-1` mounts this world to play a mission and names it in
   * `window.__qaMission`. Every world built on a `/__qa/` address starts it by itself (in dev React builds the world
   * twice; owner, 2026-11-20: he saw the host lesson's title screen instead of the mission).
   */
  qaMission() {
    if (!import.meta.env.DEV || typeof window === 'undefined' || !window.__qaMission) return;
    if (!window.location.pathname.startsWith('/__qa/')) return; // a lesson opened afterwards is a lesson
    setTimeout(() => {
      if (this.dead || !window.__qaMission || this.state.mission) return;
      this.start();
      this.startMission(window.__qaMission);
    }, 900);
  }

  restore() {
    this.qaMission();
    const stage = this.state.stage;
    this.segs.forEach((seg, i) => {
      if (i >= stage) return;
      if (seg.kind === 'bridge' && !seg.standing) {
        seg.builtWith = this.built[seg.id] ?? seg.holdsWith;
        this.layPlanksInstant(seg, seg.builtWith);
      }
      this.markComplete(seg, true);
    });
    if (this.flags.storm) this.swapStormPedestals();
    if (this.flags.statues) this.statues?.forEach((s) => s.userData.lit(true));
    if (this.rail.complete) this.board.position.copy(this.segPoint(this.rail, this.rail.len - 3, 0, 0.35));
    if (this.state.finished) this.lightUp(true);
    this.skyNow = SKIES[Math.min(this.state.finished ? 8 : stage, 8)].slice();
    // the planks he carried when he left (kept only inside a convoy: elsewhere the island gives them again)
    if (this.heldSaved != null && this.convoyOf(this.segs[stage])) {
      this.heldMesh = makeMould(this.heldSaved);
      this.heldMesh.scale.setScalar(0.72);
      this.scene.add(this.heldMesh);
      this.state = { ...this.state, held: this.heldSaved };
    }
    this.state = { ...this.state, recall: this.recallOf(stage) };
    this.refreshObjective();
  }

  // ───────────────────────────── convoys: two bridges, the planks of one island ─────────────────────────────
  /** The bridges built with the same planks as `seg` (its convoy, the first one first) — null when it stands alone. */
  convoyOf(seg) {
    return seg?.convoy ? this.segs.filter((s) => s.convoy === seg.convoy) : null;
  }
  /** Is `seg` a bridge of a convoy AFTER its first one — a gap whose island holds no planks? */
  convoyTail(seg) {
    const group = this.convoyOf(seg);
    return Boolean(group && group[0] !== seg);
  }
  /** The purse of the convoy of `seg`: { of, left, n } — a coin per plank of its standing bridges; null without a purse. */
  purseOf(seg) {
    const of = seg?.convoy ? this.convoys[seg.convoy]?.purse : null;
    if (!of) return null;
    const group = this.convoyOf(seg);
    const spent = group.reduce((n, s) => n + (s.complete && s.builtWith ? s.a / s.builtWith : 0), 0);
    // `n`: the bridges it pays — the chip says « the purse of the bridge » for a convoy of one (lesson 8)
    return { of, left: of - spent, n: group.length };
  }
  /**
   * He takes planks on the FIRST island of a convoy: they build every bridge of it. Bridges standing on other planks go
   * back to their pedestal (and their coins to the purse), and the road starts again from this island.
   */
  convoyChoice(b) {
    const seg = this.segs[this.hero?.island ?? -1];
    const group = this.convoyOf(seg);
    if (!group || group[0] !== seg) return;
    this.flags.convoyStuck = null;
    const stale = group.filter((s) => s.builtWith != null && s.builtWith !== b);
    for (const s of stale) {
      s.builtWith = null;
      delete this.built[s.id];
      this.crumble(s);
    }
    if (stale.length) {
      this.set({ stage: seg.index, islandName: this.isl[seg.index].name });
      this.say(this.T.say.convoyReset(b), 7);
    }
    this.refreshObjective();
    this.save();
  }
  /** What matters from the island before, for the card on the right: the story's words, or the gap he has just crossed. */
  recallOf(k) {
    const told = this.story.recall?.(this, k);
    if (told) return told;
    const seg = this.segs[k - 1];
    if (!seg || seg.kind !== 'bridge' || !seg.complete || seg.standing) return [];
    const b = seg.builtWith ?? seg.holdsWith;
    return [this.T.recall.bridge(seg.a, b, seg.a / b)];
  }

  // ───────────────────────────── moulds & forge ─────────────────────────────
  take(b) {
    if (b != null) this.audio.play('pick');
    if (this.heldMesh) this.scene.remove(this.heldMesh);
    this.heldMesh = b == null ? null : makeMould(b);
    if (this.heldMesh) {
      this.heldMesh.scale.setScalar(0.72);
      this.scene.add(this.heldMesh);
    }
    // taking planks starts something new: the result of the bridge before leaves the screen
    this.set(b == null ? { held: b } : { held: b, equation: null, verdict: null });
    if (b != null) this.convoyChoice(b);
    if (b != null && this.state.stage === 0 && !this.segs[0].complete && !this.toldAltar) {
      this.toldAltar = true;
      this.say(this.T.say.goAltar, 9);
    }
  }

  altarPrompt(seg) {
    // the store of the last bridge opens only once the island's question is answered: never a prompt that does nothing
    if (seg.boss) return !this.flags.key4 || (seg.complete && this.flags.bossPaid) ? null : this.T.prompt.boss;
    if (seg.standing) return null; // a gap of 0 cells: nothing to build
    if (this.state.held == null) return seg.complete ? null : this.T.prompt.needMould;
    // a bridge that stands on the planks he carries has nothing to offer: no prompt over its result
    if (seg.complete && this.state.held === seg.builtWith) return null;
    return this.T.prompt.forge(this.state.held);
  }

  actAltar(seg) {
    if (this.state.phase !== 'play') return;
    if (seg.boss) {
      if (!this.flags.key4) return;
      if (!seg.complete || !this.flags.bossPaid) this.openBoss();
      return;
    }
    if (seg.standing || this.state.held == null) {
      this.say(seg.complete ? this.T.say.done : this.T.prompt.needMould, 3);
      return;
    }
    const b = this.state.held;
    // a later bridge of a convoy takes only the planks that hold the bridge before it
    if (this.convoyTail(seg) && b !== this.segs[seg.index - 1].builtWith) {
      this.say(this.T.say.convoyOnly, 6);
      return;
    }
    if (seg.predict) {
      this.audio.play('ui');
      this.set({
        phase: 'dialog',
        overlay: { type: 'predict', a: seg.a, b, options: predictOptions(seg.a, b), seg: seg.index },
      });
    } else this.forge(seg, b, null);
  }

  answerPredict(value) {
    const o = this.state.overlay;
    if (o?.type !== 'predict') return;
    this.forge(this.segs[o.seg], o.b, value);
  }

  plankMesh(seg, b, k) {
    const len = b * seg.cell;
    const col = mouldColor(b);
    if (k % 2) col.offsetHSL(0, -0.05, 0.1);
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.24, Math.max(0.05, len - Math.min(0.07, len * 0.12))),
      new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.22,
        roughness: 0.45,
        transparent: true,
      }),
    );
    m.rotation.y = seg.yaw;
    m.castShadow = true;
    m.receiveShadow = true;
    m.userData.home = this.segPoint(seg, (k + 0.5) * len, 0, -0.12);
    return m;
  }

  layPlanksInstant(seg, b) {
    this.clearPlanks(seg);
    const { q } = divide(seg.a, b);
    for (let k = 0; k < q; k += 1) {
      const m = this.plankMesh(seg, b, k);
      m.position.copy(m.userData.home);
      seg.group.add(m);
      seg.planks.push(m);
    }
  }

  clearPlanks(seg) {
    seg.planks.forEach((m) => {
      seg.group.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
    seg.planks = [];
    seg.gap.visible = false;
    seg.count.visible = false;
  }

  markComplete(seg, silent = false) {
    seg.complete = true;
    seg.builtLen = seg.len + 0.7;
    seg.pylons?.forEach((p) => {
      p.userData.orb.material.color.set(0x2fe37a);
      p.userData.orb.material.emissive.set(0x2fe37a);
    });
    if (seg.label) seg.label.visible = false;
    if (!silent) this.refreshObjective();
  }

  async crumble(seg, wind = false) {
    const planks = seg.planks.slice();
    seg.planks = [];
    seg.builtLen = 0;
    seg.complete = false;
    seg.pylons?.forEach((p) => {
      p.userData.orb.material.color.set(0x35d8f0);
      p.userData.orb.material.emissive.set(0x35d8f0);
    });
    if (seg.label) seg.label.visible = true;
    if (!planks.length) {
      seg.gap.visible = false;
      seg.count.visible = false;
      return;
    }
    this.audio.play(wind ? 'wind' : 'crumble');
    const data = planks.map((m, k) => ({
      m,
      from: m.position.clone(),
      rx: (Math.random() - 0.5) * 3,
      rz: (Math.random() - 0.5) * 3,
      side: wind ? 14 + Math.random() * 18 : (Math.random() - 0.5) * 4,
      delay: wind ? k * 0.03 : (planks.length - 1 - k) * Math.min(0.05, 0.6 / planks.length),
    }));
    const total = 1.15 + Math.max(...data.map((d) => d.delay));
    await this.tween(
      total,
      (t) => {
        const el = t * total;
        data.forEach((d) => {
          const p = Math.max(0, Math.min(1, (el - d.delay) / 1.1));
          d.m.position.set(
            d.from.x + seg.rx * d.side * p,
            d.from.y - 14 * p * p + (wind ? 10 * p * (1 - p) : 0),
            d.from.z + seg.rz * d.side * p,
          );
          d.m.rotation.x = d.rx * p;
          d.m.rotation.z = d.rz * p;
          d.m.material.opacity = 1 - p;
        });
      },
      (t) => t,
    );
    planks.forEach((m) => {
      seg.group.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
    seg.gap.visible = false;
    seg.count.visible = false;
  }

  /** The forge: lays q planks of length b one by one, then the bridge holds (r = 0) or crumbles (r > 0). */
  async forge(seg, b, predicted) {
    const a = seg.a;
    const { q, r } = divide(a, b);
    // a marked stretch: the post must stand on a joint (`./mark.js`) — the equation shows the stretch's division too
    const mv = seg.mark ? markVerdict(a, seg.mark, b) : null;
    const eqMark = (laid) =>
      mv ? { mark: { ...mv.mark, shown: laid * b >= Math.min(a, mv.mark.m + (mv.mark.r ? b - mv.mark.r : 0)) } } : {};
    // the last bridge announced by a LABEL (`boss.label`): the equation writes the label in place of a, and hides what is
    // left while the planks are laid (r + b × q would give a away); the verdict names the label too
    const lab = seg.boss?.label ?? null;
    const named = lab ? { aTex: lab.tex, aText: lab.text } : {};
    this.logBridge(a, b);
    if (mv) this.logBridge(seg.mark, b);
    this.input.clear();
    this.set({
      phase: 'forge',
      overlay: null,
      prompt: null,
      verdict: null,
      equation: { a, b, q: 0, r: a, live: true, ...eqMark(0), ...named },
    });
    // cinematic camera: from the side, the whole gap in view
    const mid = this.segPoint(seg, seg.len / 2);
    const dist = seg.len * 0.62 + 7;
    this.cine = {
      pos: new THREE.Vector3(
        mid.x + seg.rx * dist - seg.dx * seg.len * 0.12,
        seg.len * 0.3 + 5.5,
        mid.z + seg.rz * dist - seg.dz * seg.len * 0.12,
      ),
      look: new THREE.Vector3(mid.x, 0.4, mid.z),
    };
    // a MARKED bridge that stands is rebuilt to write its sign shorter: if the new planks fail, it stands again as it was
    const stood = seg.mark && seg.complete ? seg.builtWith : null;
    const standAgain = () => {
      if (stood == null) return;
      this.layPlanksInstant(seg, stood);
      seg.builtWith = stood;
      this.built[seg.id] = stood;
      this.markComplete(seg, true);
    };
    if (seg.planks.length) await this.crumble(seg);
    this.clearPlanks(seg);
    seg.builtWith = null;
    delete this.built[seg.id];
    // the purse of a convoy pays a coin per plank: with too few coins the bridge stops where they run out
    const purse = this.purseOf(seg);
    const paid = purse ? Math.min(q, purse.left) : q;
    if (purse) this.set({ purse });
    this.robot.setChest('…');
    await this.wait(0.9);
    const from = seg.altarWorld.clone().setY(1.6);
    seg.count.visible = q > 0;
    seg.count.userData.setText('0');
    // a plank every 0.1 s at least — but a long bridge (322 planks of 2 on 645 cells) is laid in about 7 s, not 32
    const per = Math.min(0.42, Math.max(q > 70 ? 7 / q : 0.1, 3.4 / Math.max(1, q)));
    if (q === 0) {
      // the plank is longer than the whole gap: it tips over the edge and falls
      const m = this.plankMesh(seg, b, 0);
      seg.group.add(m);
      const home = this.segPoint(seg, seg.len * 0.5, 0, 0.6);
      await this.tween(
        0.5,
        (t) => {
          m.position.lerpVectors(from, home, t);
        },
        easeOut,
      );
      this.audio.play('fall');
      await this.tween(1.0, (t) => {
        m.position.y = home.y - 16 * t * t;
        m.rotation.x = t * 2.2;
        m.material.opacity = 1 - t;
      });
      seg.group.remove(m);
    }
    for (let k = 0; k < paid; k += 1) {
      if (this.dead) return;
      const m = this.plankMesh(seg, b, k);
      m.position.copy(from);
      m.scale.setScalar(0.2);
      seg.group.add(m);
      seg.planks.push(m);
      const home = m.userData.home;
      await this.tween(
        per,
        (t) => {
          m.position.lerpVectors(from, home, t);
          m.position.y += Math.sin(t * Math.PI) * 2.2;
          m.scale.setScalar(0.2 + 0.8 * t);
        },
        easeOut,
      );
      this.audio.play('plank', k);
      this.particles.burst(home.clone().setY(0.2), mouldColor(b), 6, 2, 1.5, 0.5);
      seg.count.userData.setText(String(k + 1));
      seg.count.position.copy(this.segPoint(seg, (k + 0.5) * b * seg.cell, 0, 1.6));
      this.set({
        equation: { a, b, q: k + 1, r: a - b * (k + 1), live: true, ...eqMark(k + 1), ...named },
        ...(purse ? { purse: { ...purse, left: purse.left - (k + 1) } } : {}),
      });
    }
    await this.wait(0.35);
    if (this.dead) return;
    if (paid < q) {
      // THE PURSE IS EMPTY before the gap is filled: what is laid is shown, with what is still open, then it all goes back
      const open = a - b * paid;
      this.set({
        equation: { a, b, q: paid, r: open, live: false, unpaid: true, ...named },
        verdict: {
          right: null,
          first: false,
          predicted: null,
          a,
          b,
          r: open,
          holds: false,
          purse: true,
          q: paid,
          need: q,
        },
      });
      seg.count.visible = false;
      if (seg.label) seg.label.visible = false; // the result panel takes its place; crumble() brings it back
      seg.stat.fails += 1;
      this.audio.play('fail');
      this.shake = 0.15;
      const gl = open * seg.cell;
      seg.gap.scale.z = gl;
      seg.gap.position.copy(this.segPoint(seg, seg.len - gl / 2, 0, 0));
      seg.gap.visible = true;
      this.gapPulse = seg.gap;
      await this.wait(2.2);
      this.gapPulse = null;
      await this.crumble(seg);
      standAgain();
      this.cine = null;
      this.set({ phase: 'play' });
      if (this.convoyTail(seg)) this.flags.convoyStuck = seg.id;
      this.say(this.T.say.purseOut(paid, q), 9);
      if (seg.boss) this.bossRefused(b, { purse: true, laid: paid, need: q });
      this.refreshObjective();
      this.save();
      return;
    }
    this.set({ equation: { a, b, q, r, live: false, ...eqMark(q), ...named } });
    this.robot.setChest(String(r), r === 0 ? true : null);
    seg.count.visible = false;
    // TWO results, never mixed: was the PREDICTION right? — then, does this mould fill the gap? A right prediction of a
    // remainder that is not 0 is a success of the student (the division was done), even though the bridge will not hold.
    let right = null;
    let first = false;
    if (predicted != null) {
      right = predicted === r;
      first = seg.stat.firstPrediction == null;
      if (first) seg.stat.firstPrediction = right;
      if (right) {
        this.audio.play('star', 1);
        setTimeout(() => this.audio.play('star', 2), 160);
        this.robot.cheer();
      }
    }
    this.set({
      verdict: {
        right,
        first,
        predicted,
        a,
        b,
        r,
        holds: mv ? mv.holds : r === 0,
        ...(mv ? { mark: mv.mark } : {}),
        ...named,
      },
    });
    if (seg.label) seg.label.visible = false; // the result panel takes its place on screen; crumble() brings it back

    if (mv && r === 0 && !mv.joint) {
      // THE GAP IS FILLED BUT THE POST STANDS IN THE MIDDLE OF A PLANK: that plank is shown, then the bridge goes back
      seg.stat.fails += 1;
      this.audio.play('fail');
      this.shake = 0.15;
      seg.gap.scale.z = b * seg.cell;
      seg.gap.position.copy(this.segPoint(seg, (mv.mark.q + 0.5) * b * seg.cell, 0, 0.08));
      seg.gap.visible = true;
      this.gapPulse = seg.gap;
      await this.wait(2.4);
      this.gapPulse = null;
      await this.crumble(seg);
      standAgain();
      this.cine = null;
      this.set({ phase: 'play' });
      if (this.convoyTail(seg)) this.flags.convoyStuck = seg.id;
      this.say(this.T.say.markMiss(b, mv.mark), 10);
      if (seg.boss) this.bossRefused(b, { mark: mv.mark.r });
      this.refreshObjective();
      this.save();
      return;
    }
    if (r === 0) {
      this.audio.play('success');
      this.robot.cheer();
      for (let k = 0; k <= 8; k += 1)
        this.particles.burst(this.segPoint(seg, (seg.len * k) / 8, 0, 0.4), 0x8dffb0, 10, 3, 3, 1.1);
      if (seg.storm && !this.flags.storm && b === seg.storm.after) {
        await this.storm(seg);
        return;
      }
      await this.wait(1.3);
      this.finishBridge(seg, b, q);
    } else {
      seg.stat.fails += 1;
      if (right !== true) {
        this.audio.play('fail');
        this.shake = 0.15;
      }
      if (q > 0) {
        const gl = r * seg.cell;
        seg.gap.scale.z = gl;
        seg.gap.position.copy(this.segPoint(seg, seg.len - gl / 2, 0, 0));
        seg.gap.visible = true;
        this.gapPulse = seg.gap;
      }
      await this.wait(q > 0 ? 1.9 : 0.4);
      this.gapPulse = null;
      await this.crumble(seg);
      standAgain();
      this.cine = null;
      this.set({ phase: 'play' });
      this.afterFail(seg, b, q, r, right);
    }
  }

  finishBridge(seg, b, q) {
    seg.builtWith = b;
    this.built[seg.id] = b;
    if (seg.mark) this.markSigns[seg.id] = [...(this.markSigns[seg.id] ?? []).filter((x) => x !== b), b];
    this.markComplete(seg);
    this.cine = null;
    if (seg.boss) {
      this.set({ phase: 'dialog', overlay: this.bossOverlay('cost', { b, q }) });
      this.say(this.T.say.bossOk, 7);
      return;
    }
    if (!this.state.stars[seg.id]) {
      const stars = bridgeStars({
        firstPrediction: seg.predict ? seg.stat.firstPrediction : null,
        falls: seg.stat.falls,
      });
      this.set({ stars: { ...this.state.stars, [seg.id]: stars } });
      for (let k = 0; k < stars; k += 1) setTimeout(() => this.audio.play('star', k), 200 + k * 220);
    }
    this.set({ phase: 'play' });
    if (!this.story.onHold?.(this, seg, b, q)) this.say(this.T.say.ok(b, q));
    this.save();
  }

  /**
   * The store's planks were refused for another reason than cells left open — the purse ran out, or the post of a marked
   * stretch missed its joint: the try is remembered (`flags.bossTried[b]` = what happened), it counts against the
   * store's stars, and the store opens again so he chooses once more (the sentence was already said).
   */
  bossRefused(b, why) {
    this.flags.bossTried = { ...(this.flags.bossTried ?? {}), [b]: why };
    this.flags.bossWrong = (this.flags.bossWrong ?? 0) + 1;
    this.set({ phase: 'dialog', overlay: this.bossOverlay('choose') });
  }

  afterFail(seg, b, q, r, right = null) {
    if (seg.boss) {
      this.flags.bossTried = { ...(this.flags.bossTried ?? {}), [b]: r };
      this.say(this.T.say.bossFail(b, r), 8);
      this.set({ phase: 'dialog', overlay: this.bossOverlay('choose') });
      this.save();
      return;
    }
    if (this.convoyTail(seg)) {
      // the island of this gap holds no planks: he walks back to the first island of the convoy and picks again
      this.flags.convoyStuck = seg.id;
      this.say(this.T.say.convoyBack(this.isl[this.convoyOf(seg)[0].index].name, r), 10);
      this.refreshObjective();
      this.save();
      return;
    }
    if (q === 0) this.say(this.T.say.tooLong(b, seg.a), 7);
    else if (right === true) this.say(this.T.say.gapRight(r), 8);
    else if (seg.stat.fails === 1) this.say(this.T.say.gap(r), 7);
    else this.say(this.T.say.gapShort(r), 5);
    if (seg.workshop && seg.stat.fails >= 2 && !this.flags.anvil) {
      this.flags.anvil = true;
      // the instruction says it at once: the workshop is open (lesson 7's walk, 2026-11-20 — it still said « take it here »)
      this.refreshObjective();
      this.audio.play('key');
      this.particles.burst(this.anvil.getWorldPosition(new THREE.Vector3()).setY(1.5), 0xff9d3c, 40, 4, 4, 1.2);
      setTimeout(() => !this.dead && this.say(this.T.say.anvilOpen, 9), 2600);
      this.save();
    }
  }

  /** Island « des miroirs »: the bridge of 48 held with 6 (8 planks); a gust takes it away and leaves moulds 5, 7, 8, 9. */
  async storm(seg) {
    await this.wait(2.0);
    this.say(this.T.say.storm, 8);
    this.shake = 0.6;
    await this.crumble(seg, true);
    this.flags.storm = true;
    this.take(null);
    this.swapStormPedestals();
    this.robot.setChest('•');
    this.cine = null;
    this.set({ phase: 'play', pinned: seg.storm.pinned, equation: null, verdict: null });
    this.refreshObjective();
    setTimeout(() => !this.dead && this.say(this.T.say.stormHint, 8), 4200);
    this.save();
  }

  swapStormPedestals() {
    const i = this.segs.findIndex((seg) => seg.storm);
    const isl = this.isl[i];
    const out = this.exitDir(i);
    const local = (u, v) => ({ x: out.dx * u + out.rx * v, z: out.dz * u + out.rz * v });
    isl.pedestals.forEach((p) => {
      const k = this.colliders.indexOf(p.col);
      if (k >= 0) this.colliders.splice(k, 1);
    });
    this.placePedestals(isl, i, this.segs[i].storm.moulds, local, null);
    if (!this.segs[i].complete && this.state.stage === i)
      this.state = { ...this.state, pinned: this.segs[i].storm.pinned };
  }

  // ───────────────────────────── scripted moments ─────────────────────────────
  refreshObjective() {
    const i = this.state.stage;
    const seg = this.segs[i];
    let o = this.T.objective.end;
    if (seg) {
      const told = this.story.objective?.(this, seg, i);
      if (told) o = told;
      else if (this.flags.convoyStuck && this.convoyTail(seg) && !seg.complete)
        o = this.T.objective.convoyBack(this.isl[this.convoyOf(seg)[0].index].name);
      else if (i === this.stoneAt && !this.flags.key4) o = this.T.objective.stone;
      else if (seg.boss) o = seg.complete && this.flags.bossPaid ? this.T.objective.bossCross : this.T.objective.bossGo;
      else if (seg.complete) o = this.T.objective.cross;
      else if (seg.kind === 'rail') o = this.boardReady() ? this.T.objective.board : this.T.objective.statues;
      else o = this.T.objective.bridge(seg.a);
    }
    if (this.state.objective !== o) this.set({ objective: o });
    this.syncSign();
    // the purse of the convoy he is building (shown while one of its bridges is still to build)
    const group = this.convoyOf(seg);
    const purse = group && group.some((s) => !s.complete) ? this.purseOf(seg) : null;
    if ((this.state.purse?.left ?? null) !== (purse?.left ?? null)) this.set({ purse });
  }

  arrive(k) {
    this.facing = 1;
    this.set({ stage: k, islandName: this.isl[k].name, equation: null, pinned: null, verdict: null });
    this.set({ recall: this.recallOf(k) });
    this.robot.setChest('•');
    this.audio.mood = Math.min(1, k / 8);
    // inside a convoy he keeps the planks he carries: the next bridge is built with them
    if (this.state.held != null && !this.isl[k].keepMould && !this.convoyTail(this.segs[k])) this.take(null);
    this.refreshObjective();
    this.save();
    // what the story does on this island: a sentence, a forge (no rule is told), a module marked, the stone…
    this.story.onArrive?.(this, k);
    if (k === this.isl.length - 1) this.finale();
  }

  openStone() {
    if (this.flags.key4 || this.state.phase !== 'play') return;
    // the story says what the stone shows now: its question, or the mirror where the last key is forged
    const next = this.story.onStone(this);
    if (next.forge) this.openForge(next.forge);
    else this.set({ phase: 'dialog', overlay: { type: 'quiz', id: next.quiz, closable: true } });
  }

  /** Called by the HUD with the chosen values; returns { ok, feedback }. */
  answerQuiz(id, picked) {
    const spec = this.T.quiz[id];
    const ok = picked.length === spec.answer.length && spec.answer.every((v) => picked.includes(v));
    if (!ok) {
      this.audio.play('fail');
      if (!spec.a) return { ok: false, feedback: spec.wrong?.[picked[0]] ?? spec.wrongGeneric };
      // each chosen mould is judged on its own, with the division that proves it — the missing ones are counted, never named
      const marks = [...picked].sort((x, y) => x - y).map((v) => ({ v, a: spec.a, ...divide(spec.a, v) }));
      return { ok: false, marks, missing: spec.answer.filter((v) => !picked.includes(v)).length };
    }
    this.audio.play('success');
    this.story.onQuiz?.(this, id);
    return { ok: true };
  }

  // ───────────────────────────── the rule forges (the mirrors of the islands) ─────────────────────────────
  /** Every bridge fired is a line of evidence: a forge tests the student's rule on HIS crossing (the last sixteen are kept). */
  logBridge(a, b, mirror = false) {
    const was = this.log.find((x) => x.a === a && x.b === b);
    this.log = [
      ...this.log.filter((x) => x !== was),
      { a, b, ...(mirror && (!was || was.mirror) ? { mirror: true } : {}) },
    ].slice(-16);
  }
  /** A bridge the mirror of the forge built in front of him: evidence too, marked as the mirror's. */
  logMirror(c) {
    this.logBridge(c.a, c.b, true);
    this.save();
  }
  /**
   * The evidence a save from before the forge still gives: the bridges of THE STORY's road that are standing, each with
   * the plank that holds it — the one he laid (`builtWith`, restored from the save), else the one the story names
   * (`holdsWith`). A bridge that stands from the start (`standing`, a gap of 0) was never built: it is no evidence. The
   * last sixteen, as the log keeps them.
   */
  crossing() {
    if (this.log.length) return this.log;
    return this.segs
      .filter((seg) => seg.kind === 'bridge' && seg.complete && !seg.standing)
      .map((seg) => ({ a: seg.a, b: seg.builtWith ?? this.built?.[seg.id] ?? seg.holdsWith }))
      .filter((x) => Number.isInteger(x.b) && x.b > 0)
      .slice(-16);
  }
  /** The forge of a key of the lesson (`lesson.forges[key]`), in the mirror of the island where the story needs it. */
  openForge(key) {
    this.audio.play('crystal');
    this.set({ phase: 'dialog', overlay: { type: 'forge', key, log: this.crossing() }, prompt: null });
  }
  /** The forge the story is waiting for, when the page was closed in front of its mirror (the last one waits at its stone). */
  pendingForge() {
    return this.story.pendingForge?.(this) ?? null;
  }
  /** The rule survived the mirror: it is kept as HIS rule, the tablet then gives it its name, and the story goes on. */
  sealRule(key, record) {
    this.rules = { ...this.rules, [key]: record };
    this.audio.play('key');
    this.set({ rules: this.rules, overlay: { type: 'tablet', key } });
    this.queue.push(() => this.story.afterKey?.[key]?.(this));
    this.save();
  }

  closeTablet() {
    const key = this.state.overlay?.key;
    const keys = key && !this.state.keys.includes(key) ? [...this.state.keys, key] : this.state.keys;
    if (key) this.keysEver.add(key);
    this.set({ overlay: null, phase: 'play', keys, openKeys: [...this.keysEver] });
    this.input.clear();
    const next = this.queue.shift();
    next?.();
    this.save();
  }

  quizBack() {
    this.set({ overlay: null, phase: 'play' });
    this.say(this.T.say.stoneWaits, 7);
    this.input.clear();
  }

  openStatues() {
    if (this.state.phase === 'play') {
      this.audio.play('ui');
      this.set({ phase: 'dialog', overlay: { type: 'statues' } });
    }
  }

  /** `order[i]` = true when sentence i is written divisor first (6 … 120). Returns the per-sentence verdicts. */
  submitStatues(order) {
    const res = this.story.statues.sentences.map((s, i) => order[i] === s.smallFirst);
    if (res.every(Boolean)) {
      this.flags.statues = true;
      this.statues.forEach((s, i) =>
        setTimeout(() => {
          if (this.dead) return;
          s.userData.lit(true);
          this.audio.play('star', i);
          this.particles.burst(s.getWorldPosition(new THREE.Vector3()).setY(3), 0xffd166, 24, 3, 3, 1);
        }, i * 260),
      );
      this.audio.play('success');
      this.save();
      // the four sentences are right: the story goes on (a mirror that asks him WHY, a tablet…)
      this.story.onStatues?.(this);
    } else this.audio.play('fail');
    return res;
  }

  /**
   * The segment a workshop makes planks for: the one that leaves ITS island when it declares a `workshop`, else the
   * world's one workshop segment (the pilot's stubborn island). `workshop: { min, max, open?, typed?, bench? }`:
   * `open` — it works from the start (else it opens after two refusals, `flags.anvil`); `typed` and `bench` are read by
   * the workshop's screen (he types the length; a bench — an inquiry spec — opens beside it).
   */
  workshopOf(i) {
    const own = this.segs[i];
    return own?.workshop ? own : (this.segs.find((x) => x.workshop) ?? null);
  }
  anvilOpen(i) {
    const seg = this.workshopOf(i);
    return Boolean(seg && (seg.workshop.open || this.flags.anvil));
  }
  actAnvil(i = this.hero?.island ?? this.state.stage) {
    if (this.state.phase !== 'play') return;
    if (!this.anvilOpen(i)) {
      this.say(this.T.prompt.anvilLocked, 3);
      return;
    }
    this.audio.play('ui');
    const seg = this.workshopOf(i);
    // the gaps his plank must build: the whole convoy of that segment, or the segment alone
    const gaps = (this.convoyOf(seg) ?? [seg]).filter((s) => !s.standing).map((s) => s.a);
    this.set({ phase: 'dialog', overlay: { type: 'workshop', a: seg.a, seg: seg.index, gaps, ...seg.workshop } });
  }

  /**
   * The workshop's BENCH (`workshop.bench`, an inquiry spec): it opens over the workshop and closes back to it, and what
   * he did there is KEPT — the experiment's own state, per segment, in `flags.benches` (saved with the world).
   */
  benchKept(i) {
    return this.flags.benches?.[this.segs[i]?.id] ?? null;
  }
  openBench() {
    const o = this.state.overlay;
    if (o?.type !== 'workshop' || !o.bench) return;
    this.audio.play('ui');
    this.set({ overlay: { ...o, benchOpen: true } });
  }
  closeBench(kept) {
    const o = this.state.overlay;
    if (o?.type !== 'workshop') return;
    if (kept) this.flags.benches = { ...this.flags.benches, [this.segs[o.seg].id]: kept };
    this.set({ overlay: { ...o, benchOpen: false } });
    this.save();
  }

  craft(b) {
    this.set({ overlay: null, phase: 'play' });
    this.take(b);
    this.say(this.T.say.crafted(b), 4);
    this.input.clear();
  }

  // ───────────────────────────── the last bridge ─────────────────────────────
  /**
   * The store: the student CHOOSES a mould (the story's `boss.options`), types its Euclidean division
   * (`bossDivision`) — or, when the story announces the gap by a label (`boss.label`), the number of planks only
   * (`bossCount`) — and the world shows what it builds.
   */
  bossOverlay(view, extra = {}) {
    return { type: 'boss', view, tried: { ...(this.flags.bossTried ?? {}) }, ...extra };
  }

  openBoss() {
    const seg = this.bossSeg;
    this.audio.play('ui');
    this.set({
      phase: 'dialog',
      overlay: seg.complete
        ? this.bossOverlay('cost', { b: seg.holdsWith, q: seg.a / seg.holdsWith })
        : this.bossOverlay('choose'),
    });
  }

  bossPick(b) {
    this.audio.play('pick');
    this.set({ overlay: this.bossOverlay('divide', { b }) });
  }
  bossBack() {
    this.set({ overlay: this.bossOverlay('choose') });
  }

  bossDivision(b, q, r) {
    const status = checkDivision(this.bossSeg.a, b, q, r);
    if (status !== 'ok') {
      this.flags.bossWrong = (this.flags.bossWrong ?? 0) + 1;
      this.audio.play('fail');
      return status;
    }
    this.forge(this.bossSeg, b, null);
    return 'ok';
  }

  /**
   * The store of a last bridge announced by a LABEL (`boss.label`): he typed how many planks of b fill it, worked out
   * from the label (logic.js › checkCount). A count that is not the one of a plank that fills the gap is refused with
   * its sentence (`long`, `short`, `nan`: a wrong try of the store); a plank that does NOT fill the gap is built
   * whatever count he typed — no count is right, and the world shows what is left (`open`).
   */
  bossCount(b, q) {
    const status = checkCount(this.bossSeg.a, b, q);
    if (status !== 'ok' && status !== 'open') {
      this.flags.bossWrong = (this.flags.bossWrong ?? 0) + 1;
      this.audio.play('fail');
      return status;
    }
    this.forge(this.bossSeg, b, null);
    return status;
  }

  bossCost(n) {
    if (n !== (this.bossSeg.a / this.bossSeg.holdsWith) * this.bossSeg.boss.price) {
      this.flags.bossWrong = (this.flags.bossWrong ?? 0) + 1;
      this.audio.play('fail');
      return false;
    }
    this.flags.bossPaid = true;
    this.audio.play('key');
    const seg = this.bossSeg;
    const stars = Math.max(1, 3 - (this.flags.bossWrong ?? 0));
    this.set({
      overlay: null,
      phase: 'play',
      stars: { ...this.state.stars, [seg.id]: Math.max(stars, this.state.stars[seg.id] ?? 0) },
    });
    this.story.onBossPaid?.(this);
    this.say(this.T.say.pay, 6);
    this.refreshObjective();
    this.save();
    this.input.clear();
    return true;
  }

  // ───────────────────────────── the gate dash (story) and the practice runs ─────────────────────────────
  actBoard() {
    if (this.state.phase !== 'play') return;
    if (!this.boardReady()) {
      this.say(this.T.say.statuesFirst, 4);
      return;
    }
    this.startDash(0);
  }
  /** The board of light moves once the island's guardians are awake — at once on an island that has none. */
  boardReady() {
    return !this.statues || Boolean(this.flags.statues);
  }

  /** The story's eight waves, in the run format: { say, gates, good }. */
  storyWaves() {
    return this.story.dashWaves.map((w) => {
      const gates = w.gates.slice().sort(() => Math.random() - 0.5);
      return { say: w.say, gates, good: gates.findIndex(w.test) };
    });
  }

  dressGate(k) {
    const g = this.rail.gates[k];
    const w = this.dash?.waves[k];
    g.arches.forEach((ar, lane) => {
      ar.group.visible = Boolean(w);
      if (w) ar.num.userData.setText(String(w.gates[lane]));
      ar.num.visible = false;
      ar.mat.color.set(0x6f9dff);
      ar.mat.emissive.set(0x6f9dff);
      ar.veil.material.color.set(0x8fb8ff);
      ar.veil.material.opacity = 0.16;
    });
  }

  /** Starts a run on the rail. `d` = { mode: 'story' | 'practice', waves, hearts, … }. */
  beginRun(d) {
    this.dash = {
      s: 0,
      lane: 1,
      v: 0,
      wave: 0,
      slow: 0,
      stickLatch: false,
      score: 0,
      streak: 0,
      bestStreak: 0,
      mistakes: 0,
      ...d,
    };
    this.rail.gates.forEach((_, k) => this.dressGate(k));
    this.input.clear();
    if (this.state.held != null) this.take(null);
    this.audio.fast = true;
    this.set({ phase: 'dash', prompt: null, overlay: null });
    this.showWave();
  }

  startDash(restarts) {
    this.beginRun({ mode: 'story', waves: this.storyWaves(), hearts: DASH.hearts, restarts });
    this.say(restarts ? this.T.say.dashAgain : this.T.say.dashGo, 5);
  }

  showWave() {
    const seg = this.rail;
    const d = this.dash;
    seg.gates.forEach((g, k) =>
      g.arches.forEach((ar) => {
        ar.num.visible = k === d.wave;
      }),
    );
    const w = d.waves[d.wave];
    const practice = d.mode === 'practice';
    this.set({
      dash: {
        mode: d.mode,
        say: w ? (practice ? waveSay(w) : w.say) : '',
        hint: w && practice ? waveHint(w) : null,
        index: Math.min(d.wave + 1, d.waves.length),
        total: d.waves.length,
        hearts: d.hearts,
        done: !w,
        score: d.score,
        streak: d.streak,
        node: d.node,
        level: d.level,
      },
    });
  }

  updateDash(dt) {
    const seg = this.rail;
    const d = this.dash;
    const practice = d.mode === 'practice';
    let move = 0;
    if (this.input.take('left')) move -= 1;
    if (this.input.take('right')) move += 1;
    const sx = this.input.stick.x;
    if (Math.abs(sx) > 0.55 && !d.stickLatch) {
      move += Math.sign(sx);
      d.stickLatch = true;
    }
    if (Math.abs(sx) < 0.25) d.stickLatch = false;
    if (move) {
      const nl = Math.max(0, Math.min(2, d.lane + move));
      if (nl !== d.lane) {
        d.lane = nl;
        this.audio.play('lane');
      }
    }
    d.slow = Math.max(0, d.slow - dt);
    const cruise = practice ? d.speed + Math.min(d.streak, 6) * 0.12 : 7.2 + d.wave * 0.38;
    d.s += cruise * (d.slow > 0 ? 0.35 : 1) * dt;
    d.v += (DASH.lanes[d.lane] - d.v) * damp(14, dt);
    const p = this.segPoint(seg, d.s, d.v, 0.25);
    this.hero.pos.copy(p);
    this.hero.yaw = seg.yaw;
    this.board.position.copy(p).setY(0.3);
    this.board.rotation.y = seg.yaw;
    this.board.rotation.z = (DASH.lanes[d.lane] - d.v) * -0.25;
    // the trail warms up with the streak
    if (Math.random() < dt * 40)
      this.particles.burst(
        p.clone().setY(0.2),
        d.streak >= 5 ? 0xffc12e : d.streak >= 3 ? 0xff9de0 : 0x7dfcff,
        d.streak >= 3 ? 2 : 1,
        1,
        0.2,
        0.5,
      );
    const gate = seg.gates[d.wave];
    const w = d.waves[d.wave];
    if (w && d.s >= gate.u) {
      const hit = d.lane === w.good;
      gate.arches.forEach((ar, lane) => {
        const c = lane === w.good ? 0x2fe37a : 0xff6b81;
        ar.mat.color.set(c);
        ar.mat.emissive.set(c);
        ar.veil.material.color.set(c);
        ar.veil.material.opacity = lane === w.good ? 0.35 : 0.12;
      });
      d.wave += 1;
      if (hit) {
        d.streak += 1;
        d.bestStreak = Math.max(d.bestStreak, d.streak);
        d.score += gatePoints(d.streak);
        this.audio.play('gate');
        if (d.streak >= 3) this.audio.play('star', Math.min(d.streak - 2, 4));
        this.particles.burst(p.clone().setY(1.5), 0x8dffb0, 36, 6, 2, 0.9);
        this.robot.cheer();
      } else {
        d.hearts -= 1;
        d.streak = 0;
        d.mistakes += 1;
        d.slow = 0.9;
        this.shake = 0.5;
        this.audio.play('hit');
        this.particles.burst(p.clone().setY(1.2), 0xff6b81, 30, 5, 2, 0.8);
        if (!practice) {
          this.say(this.T.say.dashHit, 3);
          if (d.hearts <= 0) {
            this.startDash(d.restarts + 1);
            return;
          }
        } else {
          if (d.hearts <= 0) {
            this.endPractice(false);
            return;
          }
          // GUIDED: the run stops on the mistake, says why with the true division, and a question of the same kind comes back
          let again = false;
          if (d.waves.length < MAX_WAVES) {
            d.waves.push(this.lesson.ladder.makeWave(Math.random, d.node, d.level, w));
            this.dressGate(d.waves.length - 1);
            again = true;
          }
          this.set({
            phase: 'dialog',
            overlay: { type: 'guide', wave: w, picked: w.gates[d.lane], again, lost: d.mistakes >= 2 },
          });
          this.showWave();
          return;
        }
      }
      this.showWave();
    }
    if (practice) {
      if (d.wave >= d.waves.length && d.s >= seg.gates[d.waves.length - 1].u + 9) this.endPractice(true);
    } else if (d.s >= seg.len - 3) this.finishDash();
  }

  async finishDash() {
    const seg = this.rail;
    const d = this.dash;
    this.dash = null;
    this.audio.fast = false;
    this.set({ phase: 'forge', dash: null });
    const from = this.hero.pos.clone();
    // the island at the rail's end (lesson 4: 6; lesson 5's rail runs from island I to J: 9)
    const next = seg.index + 1;
    const to = this.spawnOf(next);
    this.audio.play('jump');
    await this.tween(
      0.7,
      (t) => {
        this.hero.pos.lerpVectors(from, to, t);
        this.hero.pos.y = Math.sin(t * Math.PI) * 2.2;
      },
      (t) => t,
    );
    this.hero.pos.y = 0;
    this.hero.vel.set(0, 0, 0);
    this.hero.grounded = true;
    this.markComplete(seg, true);
    const stars = d.restarts > 0 ? 1 : Math.max(1, d.hearts);
    this.set({
      phase: 'play',
      stars: { ...this.state.stars, [seg.id]: Math.max(this.state.stars[seg.id] ?? 0, stars) },
    });
    this.audio.play('success');
    this.hero.island = next;
    this.arrive(next);
  }

  // ───────────────────────────── « la carte des connaissances » and the practice game ─────────────────────────────

  /** A help was opened during the current step of a case (the rule, a model sheet): its answer is no longer evidence. */
  markHelped() {
    if (this.caseRun) this.caseRun.helped = true;
  }

  closeMap() {
    const from = this.mapFrom ?? 'play';
    this.mapFrom = null;
    this.ret = null;
    this.set({ overlay: null, phase: from === 'title' ? 'title' : 'play' });
    this.input.clear();
  }

  /** Plays level `level` (0-based) of node `node` of the map: a run of the gate dash, wherever the robot is in the story. */
  startPractice(node, level) {
    const keys = [...this.keysEver];
    if (this.dash || this.caseRun || !this.lesson.ladder.levelOpen(node, level, keys, this.practice)) return false;
    this.audio.unlock();
    this.audio.startMusic();
    if (!this.mapFrom) this.mapFrom = this.state.phase === 'title' ? 'title' : 'play';
    if (!this.ret)
      this.ret = { pos: this.hero.pos.clone(), yaw: this.hero.yaw, island: this.hero.island, held: this.state.held };
    if (this.lesson.ladder.isCase(node, level)) return this.startCase(node, level);
    this.beginRun({
      mode: 'practice',
      node,
      level,
      waves: this.lesson.ladder.makeRun(Math.random, node, level),
      hearts: PRACTICE_HEARTS,
      speed: this.lesson.ladder.nodes[node].levels[level].speed,
    });
    return true;
  }

  /** Puts the robot and the board back where the story left them. */
  leaveRail() {
    this.dash = null;
    this.audio.fast = false;
    const r = this.ret;
    const h = this.hero;
    if (r) {
      h.pos.copy(r.pos);
      h.yaw = r.yaw;
      h.island = r.island;
      h.vel.set(0, 0, 0);
      h.grounded = true;
      if (r.held != null && this.state.held == null) this.take(r.held);
    }
    const rail = this.rail;
    if (rail.complete) this.board.position.copy(this.segPoint(rail, rail.len - 3, 0, 0.35));
    else this.board.position.copy(this.boardHome);
    this.board.rotation.z = 0;
    rail.gates.forEach((g) =>
      g.arches.forEach((ar) => {
        ar.group.visible = true;
        ar.num.visible = false;
      }),
    );
    this.camPos.set(h.pos.x - this.camDir.x * 10.5, 7.6, h.pos.z - this.camDir.y * 10.5);
    this.camLook.copy(h.pos);
  }

  endPractice(win) {
    const d = this.dash;
    const id = this.lesson.ladder.levelId(d.node, d.level);
    const before = this.practice[id] ?? { stars: 0, best: 0 };
    const stars = win ? Math.max(1, d.hearts) : 0;
    if (win) {
      this.practice = {
        ...this.practice,
        [id]: { stars: Math.max(before.stars, stars), best: Math.max(before.best, d.score) },
      };
      this.audio.play(stars === 3 ? 'finale' : 'success');
    } else this.audio.play('fail');
    this.leaveRail();
    const next = win ? this.lesson.ladder.nextLevel([...this.keysEver], this.practice) : null;
    this.set({
      phase: this.mapFrom === 'title' ? 'title' : 'dialog',
      dash: null,
      practice: this.practice,
      overlay: {
        type: 'result',
        win,
        node: d.node,
        level: d.level,
        stars,
        score: d.score,
        best: Math.max(before.best, win ? d.score : 0),
        newBest: win && d.score > before.best,
        streak: d.bestStreak,
        mistakes: d.mistakes,
        key: d.waves[Math.min(d.wave, d.waves.length) - 1]?.key ?? null,
        next,
      },
    });
    this.save();
  }

  quitPractice() {
    if (this.caseRun) {
      const { node } = this.caseRun;
      this.leaveDepot();
      this.openMap(node);
      return;
    }
    if (this.dash?.mode !== 'practice') return;
    const { node } = this.dash;
    this.leaveRail();
    this.set({ dash: null });
    this.openMap(node);
  }

  /** After the guidance (or the rule), the run goes on. */
  resumeRun() {
    if (!this.dash) return;
    this.set({ overlay: null, phase: 'dash' });
    this.input.clear();
    this.showWave();
  }

  /** « Rappelle-moi la règle »: the tablet of the rule the current question uses — from the HUD of a run, or from the guidance. */
  /** `from` — the hub's own place ({ sel, space }): closing the tablet comes back to the same node. */
  showRule(key, from) {
    const d = this.dash;
    const c = this.caseRun;
    this.markHelped();
    const k = key ?? (c ? c.orders[c.oi]?.key : d?.waves[Math.min(d.wave, d.waves.length - 1)]?.key);
    if (!k) return;
    this.audio.play('ui');
    this.set({
      phase: d || c ? 'dialog' : this.state.phase,
      overlay: {
        type: 'rule',
        key: k,
        back: c
          ? 'case'
          : d
            ? 'run'
            : from && this.state.overlay
              ? { ...this.state.overlay, ...from }
              : this.state.overlay,
      },
    });
  }

  closeRule() {
    const o = this.state.overlay;
    if (o?.back === 'run') this.resumeRun();
    else if (o?.back === 'case') this.resumeCase();
    else this.set({ overlay: o?.back ?? null });
  }

  // ───────────────────────────── « La coopérative du verger »: the real-world practice game ─────────────────────────────
  /** A day at the depot: the orders of the level's mission, solved step by step; the depot packs what the student decides. */
  startCase(node, level) {
    const { mission } = this.lesson.ladder.nodes[node].levels[level];
    const world = WORLD_OF[mission];
    if (!this.worlds) this.worlds = {};
    this.depot = this.worlds[world] ?? (this.worlds[world] = new WORLDS[world](this));
    const orders = makeMission(Math.random, mission);
    this.caseRun = {
      log: [],
      world,
      node,
      level,
      orders,
      oi: 0,
      si: 0,
      hearts: CASE_HEARTS,
      mistakes: 0,
      orderMistakes: 0,
      earned: 0,
      busy: false,
      note: null,
    };
    if (this.state.held != null) this.take(null);
    const h = this.hero;
    h.pos.copy(this.depot.robotSpot);
    h.vel.set(0, 0, 0);
    h.grounded = true;
    h.yaw = 1.9;
    this.camPos.copy(this.depot.camPos).add(new THREE.Vector3(0, 6, 8));
    this.camLook.copy(this.depot.camLook);
    this.depot.setOrder(orders[0]);
    this.skyNow = SKIES[1].slice();
    this.input.clear();
    this.set({ phase: 'depot', overlay: null, prompt: null, equation: null, verdict: null });
    this.publishCase();
    return true;
  }

  publishCase() {
    const c = this.caseRun;
    if (!c) return;
    const o = c.orders[c.oi];
    this.set({
      depot: {
        history: c.log.slice(),
        world: c.world,
        tip: c.tip ?? null,
        facts: facts(o, Math.min(c.si, o.steps.length)),
        node: c.node,
        level: c.level,
        kind: o.kind,
        client: o.client,
        brief: o.brief,
        index: c.oi + 1,
        total: c.orders.length,
        hearts: c.hearts,
        earned: c.earned,
        step: o.steps[c.si] ?? null,
        stepIndex: Math.min(c.si, o.steps.length - 1),
        steps: o.steps.length,
        busy: c.busy,
        note: c.note,
      },
    }); // step null = the order is done, the truck is leaving
  }

  /** The student's answer to the current step: the depot shows its consequence, then the step is confirmed or explained. */
  async answerCase(value) {
    const c = this.caseRun;
    if (!c || c.busy || this.state.phase !== 'depot') return;
    const o = c.orders[c.oi];
    const res = judge(o, c.si, value);
    // every answer is kept, right or wrong: the student can go back and read any earlier step of the day
    let rec = c.log.find((x) => x.oi === c.oi && x.si === c.si);
    this.evidence(
      'case',
      this.lesson.evidence.caseEvidence(o, c.si, value, { firstTry: !rec, helped: Boolean(c.helped) }),
    );
    if (!rec) {
      rec = {
        oi: c.oi,
        si: c.si,
        steps: o.steps.length,
        prompt: o.steps[c.si].prompt,
        brief: o.brief,
        facts: facts(o, c.si),
        attempts: [],
        tip: null,
        done: false,
      };
      c.log.push(rec);
    }
    rec.attempts.push({ parts: answerParts(o.steps[c.si], value), ok: res.ok, text: res.text });
    if (res.ok) {
      rec.done = true;
      rec.tip = res.tip ?? null;
    }
    c.busy = true;
    c.note = null;
    c.tip = null;
    this.publishCase();
    for (const sim of res.sims) {
      await this.depot.runSim(sim, o.good, (eq) => this.set({ equation: { ...eq, mode: sim.mode ?? 'crates' } }));
      await this.wait(0.55);
      if (this.dead || this.caseRun !== c) return;
    }
    if (res.ok) {
      this.audio.play('success');
      this.robot.cheer();
      c.note = res.text;
      c.tip = res.tip ?? null;
      c.si += 1; // the shortcut comes AFTER the right answer
      c.helped = false;
      if (res.sims.length) c.keep = res.sims.at(-1); // what was built stays in the world for the next steps
      if (c.si >= o.steps.length) {
        c.earned += Math.max(MISTAKE_COST, ORDER_PAY - c.orderMistakes * MISTAKE_COST);
        this.publishCase();
        await this.wait(1.1);
        await this.depot.ship();
        if (this.dead || this.caseRun !== c) return;
        c.oi += 1;
        c.si = 0;
        c.orderMistakes = 0;
        c.note = null;
        c.tip = null;
        c.keep = null;
        this.set({ equation: null });
        if (c.oi >= c.orders.length) {
          this.endCase(true);
          return;
        }
        this.depot.setOrder(c.orders[c.oi]);
      }
      c.busy = false;
      this.publishCase();
    } else {
      c.hearts -= 1;
      c.mistakes += 1;
      c.orderMistakes += 1;
      c.busy = false;
      if (!res.sims.length) this.audio.play('fail');
      this.publishCase();
      if (c.hearts <= 0) {
        await this.wait(res.sims.length ? 1.4 : 0.3);
        if (this.caseRun === c) this.endCase(false, res.text);
        return;
      }
      this.set({
        phase: 'dialog',
        overlay: { type: 'caseGuide', text: res.text, key: o.key, lost: c.mistakes >= 2, prompt: o.steps[c.si].prompt },
      });
    }
  }

  /**
   * After a guidance card the wrong attempt is cleared — but what the student had already built in this case comes back
   * at once (no animation, no sound): the world keeps the data the next step needs.
   */
  async resumeCase() {
    const c = this.caseRun;
    if (!c) return;
    this.depot.clearSim();
    this.set({ overlay: null, phase: 'depot', equation: null });
    if (c.keep) {
      c.busy = true;
      this.publishCase();
      const sound = this.audio.enabled;
      this.audio.enabled = false;
      this.instantSim = true;
      await this.depot.runSim(c.keep, c.orders[c.oi].good, (eq) => {
        if (!eq.live) this.set({ equation: { ...eq, mode: c.keep.mode ?? 'crates' } });
      });
      this.instantSim = false;
      this.audio.enabled = sound;
      if (this.caseRun !== c) return;
      c.busy = false;
    }
    this.publishCase();
  }

  // ───────────────── an integration mission, played in the depot (missions/MissionRunner.jsx) ─────────────────
  /**
   * The student is the engineer of the cooperative: the depot BUILDS whatever he read of the situation. `sit` is the
   * situation's data; the screen (`state.mission`) asks, this carries out (`missionRun`), `missionShip` sends the lots.
   */
  startMission(sit) {
    if (!this.worlds) this.worlds = {};
    this.depot = this.worlds.depot ?? (this.worlds.depot = new WORLDS.depot(this));
    const h = this.hero;
    this.ret = { pos: h.pos.clone(), yaw: h.yaw, island: h.island, held: this.state.held };
    if (this.state.held != null) this.take(null);
    h.pos.copy(this.depot.robotSpot);
    h.vel.set(0, 0, 0);
    h.grounded = true;
    h.yaw = 1.9;
    this.camPos.copy(this.depot.camPos).add(new THREE.Vector3(0, 6, 8));
    this.camLook.copy(this.depot.camLook);
    if (sit.scene?.kind === 'ring') this.depot.setPlot(sit.scene);
    else {
      this.depot.clearPlot();
      this.depot.setStock({ a: null, b: null }, sit.kinds);
      this.depot.stockLabel(null, null, sit.stock); // not counted yet (« ? »), but each pile already has its size
    }
    this.skyNow = SKIES[1].slice();
    this.input.clear();
    this.set({
      phase: 'depot',
      overlay: null,
      prompt: null,
      equation: null,
      verdict: null,
      say: null,
      recall: [],
      mission: sit,
      objective: '',
    });
  }

  /** The depot packs `spec` (what `missions/lots.js` computed from HIS reading), then `ship` sends the lots away. */
  async missionRun(spec, opts = {}) {
    const { ship = false } = opts;
    const sit = this.state.mission;
    if (!sit) return null;
    if (spec.ring) return this.depot.runRing(spec.ring);
    if (spec.pairing) {
      this.depot.stockLabel(sit.stock.a, sit.stock.b, sit.stock); // the two stocks stand whole while one is laid along the other
      await this.depot.runPairing(spec.pairing, spec.colors);
    } else await this.depot.runLots(spec, sit.kinds, { cheer: Boolean(opts.cheer), stock: spec.stock ?? null });
    if (ship && !this.dead && this.state.mission === sit) {
      this.robot.cheer();
      await this.wait(0.9);
      await this.depot.ship();
    }
  }

  /** What the robot has counted so far shows on the quay (`null` = not counted yet). */
  missionStock(a, b) {
    if (this.state.mission?.scene?.kind) return; // a scene of its own has no quay to count
    this.depot?.stockLabel(a, b, this.state.mission?.stock ?? null);
  }

  /** A right answer of a mission: the robot cheers, stars ring, sparks fly — more of each at the end (`big`). */
  missionCheer(big = false) {
    if (this.dead || !this.state.mission) return;
    this.robot.cheer();
    const at = this.hero.pos.clone().setY(1.4);
    if (!big) {
      this.audio.play('star', 1);
      this.particles.burst(at, 0xfbbf24, 18, 3, 3, 0.9);
      return;
    }
    this.audio.play('success');
    [0, 1, 2].forEach((k) => setTimeout(() => !this.dead && this.audio.play('star', k), 250 + k * 240));
    for (let i = 0; i < 7; i += 1)
      setTimeout(
        () =>
          !this.dead &&
          this.particles.burst(
            at.clone().add(new THREE.Vector3((i - 3) * 2.2, 1, 0)),
            [0xfbbf24, 0x34d399, 0xa5f3fc][i % 3],
            26,
            4,
            5,
            1.4,
          ),
        i * 160,
      );
    this.shake = 0.1;
  }

  leaveMission() {
    this.depot?.clearPlot();
    this.set({ mission: null });
    this.leaveDepot();
    this.refreshObjective();
  }

  leaveDepot() {
    this.caseRun = null;
    this.depot?.clearSim();
    const r = this.ret;
    const h = this.hero;
    if (r) {
      h.pos.copy(r.pos);
      h.yaw = r.yaw;
      h.island = r.island;
      h.vel.set(0, 0, 0);
      h.grounded = true;
      if (r.held != null && this.state.held == null) this.take(r.held);
    }
    this.camPos.set(h.pos.x - this.camDir.x * 10.5, 7.6, h.pos.z - this.camDir.y * 10.5);
    this.camLook.copy(h.pos);
    this.skyNow = SKIES[Math.min(this.state.finished ? 8 : this.state.stage, 8)].slice();
    this.set({ depot: null, equation: null });
  }

  endCase(win, why = null) {
    const c = this.caseRun;
    const id = this.lesson.ladder.levelId(c.node, c.level);
    const before = this.practice[id] ?? { stars: 0, best: 0 };
    const stars = win ? Math.max(1, c.hearts) : 0;
    if (win) {
      this.practice = {
        ...this.practice,
        [id]: { stars: Math.max(before.stars, stars), best: Math.max(before.best, c.earned) },
      };
      this.audio.play(stars === 3 ? 'finale' : 'success');
    } else this.audio.play('fail');
    const key = c.orders[Math.min(c.oi, c.orders.length - 1)].key;
    this.leaveDepot();
    const next = win ? this.lesson.ladder.nextLevel([...this.keysEver], this.practice) : null;
    this.set({
      phase: this.mapFrom === 'title' ? 'title' : 'dialog',
      practice: this.practice,
      overlay: {
        type: 'result',
        money: true,
        world: c.world,
        win,
        node: c.node,
        level: c.level,
        stars,
        score: c.earned,
        best: Math.max(before.best, win ? c.earned : 0),
        newBest: win && c.earned > before.best,
        mistakes: c.mistakes,
        key,
        why,
        next,
      },
    });
    this.save();
  }

  // ───────────────────────────── ending ─────────────────────────────
  lightUp(instant = false) {
    const { lamp, beams, light } = this.lighthouse.userData;
    lamp.material.color.set(0xfff1a8);
    lamp.material.emissive.set(0xffe27a);
    lamp.material.emissiveIntensity = 3;
    beams.visible = true;
    light.intensity = instant ? 260 : 0;
    this.lit = true;
    if (!instant)
      this.tween(2, (t) => {
        light.intensity = 260 * t;
      });
  }

  async finale() {
    const again = this.state.finished;
    this.set({ phase: 'end', prompt: null, finished: true });
    this.save();
    await this.wait(1.2);
    if (this.dead) return;
    if (!again) {
      this.lightUp();
      this.audio.play('finale');
      this.robot.cheer();
      this.particles.burst(this.lighthouseWorld.clone().setY(13), 0xfff1a8, 120, 9, 5, 2);
      this.say(this.T.say.end, 8);
    }
    await this.wait(again ? 0.5 : 4.2);
    if (this.dead) return;
    this.set({ overlay: { type: 'end', elapsed: Date.now() - this.startedAt } });
  }

  // ───────────────────────────── public: shell commands ─────────────────────────────

  // ───────────────────────────── loop ─────────────────────────────
  walkable(x, z) {
    for (const isl of this.isl) if (Math.hypot(x - isl.x, z - isl.z) <= isl.R - 0.12) return true;
    for (const seg of this.segs) {
      if (seg.kind !== 'bridge' || seg.builtLen <= 0) continue;
      const u = (x - seg.sx) * seg.dx + (z - seg.sz) * seg.dz;
      const v = (x - seg.sx) * seg.rx + (z - seg.sz) * seg.rz;
      if (Math.abs(v) <= BRIDGE_HALF && u >= -0.7 && u <= seg.builtLen) return true;
    }
    return false;
  }
}

function distToSeg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const l2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2));
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}
