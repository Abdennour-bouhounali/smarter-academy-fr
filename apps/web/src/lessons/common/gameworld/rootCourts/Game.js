/**
 * « قصر الساحات » — THE WORLD OF A UNIT ABOUT SQUARE ROOTS, played with a lesson's story (it names no lesson).
 *
 * The mechanic (`./logic.js` is its law, `docs/reports/ROOTS_WORLD_PLAN.md` its design):
 *   a TERRACE of the ksar holds square COURTS; a court's area is written on its gate, in tiles;
 *   at a court's corner post the student takes the ROD and walks along the wall: HIS WALK IS THE LENGTH. The world
 *   builds a square PLATFORM on the rod; he lowers it into the court;
 *   it RIDES the court's lift (and flies him to the terrace the court leads to) when it covers the court exactly;
 *   it leaves a BAND when it is smaller, it JAMS on the rim when it is larger — two facts, never « wrong »;
 *   when the story allows it, the rod is CLAMPED on the wall, corner to corner: a length that may have no number.
 *
 * THE STORY is the lesson's (`lesson.story`):
 *   terraces   [{ id, name, at?: [x, z] (default: the next place of ONE line into the screen), courts: [{ id, a, to, steps?, unit?, predict? }], feature?, decor? }]
 *              `a` = the area (text), `to` = the terrace its lift flies to, `steps` = the marks of the rod's dial
 *              (« 1 », « 0,1 »…; default ['1']), `feature` = { id, kind: 'mirror' | 'calculator' | 'stations', forge,
 *              prompt, screen?, names? } — a thing of the terrace that opens the forge of a key
 *   end        the id of the last terrace; `complete: false` while the story is not the whole lesson yet (the lesson's
 *              modules are then NOT marked done at its end)
 *   text       its own sentences over the world's (`./strings.js`)
 *   objective(game) · recall(game, terraceId) · onArrive(game, terraceId) · onVerdict(game, court, row) ·
 *   afterKey[key](game) · pendingForge(game) · featureOpen(game, feature) · courtOpen(game, court) ·
 *   canClamp(game, court) · stepsOf(game, court) · release(game, court)
 * The ground of the shared runtime is flat (y = 0): the terraces float at one height, like the islands of the first
 * world, and a platform that rides FLIES to the next terrace.
 */
import * as THREE from 'three';
import { WorldRuntime, easeOut } from '../kit/WorldRuntime';
import { seeded } from '../engine/builders';
import { GateRun } from '../kit/GateRun';
import { outcome, wall, isWall, lengthOf, rodText, rodTex, tex, approx, dialRod } from './logic';
import {
  makeTerrace,
  makeCourt,
  makePlatform,
  makePad,
  makeFeature,
  makeLabel,
  makeYard,
  makeYardTiles,
} from './scenery';
import { WORLD_TEXT, withStory, tiles } from './strings';

const SKY = [0x3f93ff, 0xffe9c9, 0xfff1d8, 2.7, 1.05, 0];
const HOVER = 1.55; // the height of the platform while he sets the rod
const GAP = 5; // between two courts of one terrace
const CELLS_SIDE = 20; // the widest platform whose tiles are counted one by one
const TERRACE_GAP = 46; // from one terrace to the next, along the line
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
/** A gate of a practice wave on the rail: a fraction « p/q » is drawn with a real bar, anything else as it is written. */
const gateOption = (g) => {
  const m = /^(−?)(\d+)\/(\d+)$/.exec(String(g));
  return m ? { tex: `${m[1] ? '-' : ''}\\dfrac{${m[2]}}{${m[3]}}` } : { t: String(g) };
};
const besideOf = (courts, id) => {
  const c = id ? courts.find((x) => x.id === id) : null;
  return c ? { x: c.post.x - 3.6, z: c.post.z - c.size * 0.4 } : null;
};

export class RootCourtsGame extends WorldRuntime {
  // ───────────────────────────── the world's hooks ─────────────────────────────
  initWorld(sv) {
    this.story = this.lesson.story;
    this.T = withStory(WORLD_TEXT, this.story.text);
    this.log = [...(sv?.log ?? [])]; // every platform he lowered: { a, s: rod, kind } — the evidence of the forges
    this.ridden = { ...(sv?.ridden ?? {}) }; // court id → the rod that rides it
    this.tries = { ...(sv?.tries ?? {}) };
    this.sealed = { ...(sv?.sealed ?? {}) }; // court id → true: closed as « no mark of this terrace rides it »
    this.guess = { ...(sv?.guess ?? {}) }; // court id → what he said before trying: true « تُركب », false « لا تُركب »
    this.hold = null; // the rod in his hand: { court, marks, step, held }
    this.cine = null;
    this.layout();
    this.atStart = clamp(sv?.terrace ?? 0, 0, this.ter.length - 1);
  }
  /** Where everything stands: the terraces from the story, their courts side by side, the pads where platforms land. */
  layout() {
    const byId = Object.fromEntries(this.story.terraces.map((t, i) => [t.id, i]));
    this.ter = this.story.terraces.map((t, i) => {
      const courts = (t.courts ?? []).map((c) => {
        const side = Math.sqrt(approx(c.a));
        // a court smaller than three tiles a side is drawn with bigger tiles: it stays readable from the rail
        const unit = c.unit ?? clamp(9 / side, 0.6, side < 3 ? 4.5 : 1.6);
        return { ...c, a: String(c.a), side, unit, size: side * unit, terrace: i, steps: c.steps ?? ['1'] };
      });
      const total = courts.reduce((s, c) => s + c.size, 0) + GAP * Math.max(0, courts.length - 1);
      const w = Math.max(30, total + 14);
      const d = 27;
      // ONE line, in the order of play, on the axis that goes into the screen — unless the story places a terrace itself
      const [x, z] = t.at ?? [0, -i * TERRACE_GAP];
      let left = x - total / 2;
      for (const c of courts) {
        c.post = { x: left, z: z + 1.5 }; // the corner post: the court spans x ∈ [post.x, post.x + size], z ∈ [post.z − size, post.z]
        c.rail = c.post.z + 1.25; // where he walks, in front of the wall
        left += c.size + GAP;
      }
      return {
        ...t,
        i,
        x,
        z,
        w,
        d,
        courts,
        pads: 0,
        spawn: new THREE.Vector3(x + 5, 0, z + d / 2 - 4),
        // a feature stands at the front right of its terrace — or BESIDE the court it speaks about (`feature.beside`),
        // left of that court's corner post, half-way along its side wall
        featureAt: t.feature ? (besideOf(courts, t.feature.beside) ?? { x: x + w / 2 - 6.5, z: z + d / 2 - 7 }) : null,
      };
    });
    this.courts = this.ter.flatMap((t) => t.courts);
    // a BUILDING YARD (`terrace.yard = { crates: ['9', '25'] }`): a crate of tiles he lays as a square, at the front left
    // of its terrace. It is driven by the rod as a court is (`hold.court` is the yard), but it is not a court: nothing
    // rides it, it joins no evidence and no travel (`this.yards`).
    this.yards = this.ter
      .filter((t) => t.yard)
      .map((t) => {
        const unit = 0.9;
        const reach = Math.ceil(Math.sqrt(Math.max(...t.yard.crates.map(Number)))) + 2;
        const post = { x: t.x - t.w / 2 + 4.6, z: t.z + t.d / 2 - 3.4 };
        return {
          id: `yard:${t.id}`,
          yard: true,
          terrace: t.i,
          crates: t.yard.crates.map(String),
          unit,
          reach,
          post,
          rail: post.z + 1.25,
          steps: ['1'],
          hover: 0.07,
          tries: 0,
        };
      });
    for (const c of this.courts) {
      // a court without `to` flies nowhere: its platform rides and stays (a terrace of several courts has ONE way out)
      const to = c.to ? this.ter[byId[c.to]] : null;
      c.target = to ? to.i : null;
      if (!to) continue;
      // each platform that lands on a terrace has its own pad, at the front left
      c.pad = { x: to.x - 4 + to.pads * 5.6, z: to.z + to.d / 2 - 5.2 };
      to.pads += 1;
    }
    this.endAt = byId[this.story.end] ?? this.ter.length - 1;
  }
  worldState(sv) {
    const at = clamp(sv?.terrace ?? 0, 0, this.story.terraces.length - 1);
    return {
      at,
      held: null,
      rod: null,
      last: null,
      equation: null,
      verdict: null,
      objective: '',
      count: null,
      run: null,
      recall: [],
      stars: { ...(sv?.stars ?? {}) },
      hasSave: Boolean(sv && (sv.stage > 0 || (sv.log ?? []).length)),
      islandName: this.story.terraces[at].name,
    };
  }
  /** `terrace`: where he stands — never `at`, which the kit's save keeps for its own date (`kit/saveSync.js`). */
  worldSave() {
    return {
      stars: this.state.stars,
      log: this.log,
      ridden: this.ridden,
      tries: this.tries,
      sealed: this.sealed,
      guess: this.guess,
      terrace: this.state.at,
    };
  }
  worldCentre() {
    const n = this.ter.length;
    return { x: this.ter.reduce((s, t) => s + t.x, 0) / n, z: this.ter.reduce((s, t) => s + t.z, 0) / n };
  }
  skyTarget() {
    return SKY;
  }
  spawnPoint() {
    return this.ter[this.atStart].spawn.clone();
  }
  respawnPoint() {
    return this.ter[this.state.at].spawn;
  }
  onFall() {
    this.drop(true);
    this.lookTo(Math.PI);
    this.say(this.T.say.fall[this.state.falls % this.T.say.fall.length], 4);
  }
  heading() {
    return Math.PI; // towards the courts — where the view starts, and where it returns on arriving
  }
  /** The view follows him in every direction: his keys are the hours of a clock, twelve towards the courts (the kit's free view). */
  freeLook() {
    return true;
  }
  /** While he holds the rod, ← → are the length of his walk along the wall: they do not turn him. */
  steers() {
    return !this.hold;
  }
  followsHero(ph) {
    return ph === 'play' || ph === 'dialog' || ph === 'lift';
  }
  cameraShot(ph) {
    if (ph === 'run') return this.gateRun.camera();
    if (this.cine) return { pos: this.cine.pos, look: this.cine.look, k: 2.6 };
    // while he holds the rod the lens rises behind him: the whole court and the platform over it stay in view
    const h = this.hold;
    if (!h || (ph !== 'play' && ph !== 'dialog')) return null;
    const c = h.court;
    const span = Math.max(c.size, c.parts.reach * c.unit * 0.8);
    const mid = c.post.x + span / 2;
    const pos = this.holdCam ?? (this.holdCam = { pos: new THREE.Vector3(), look: new THREE.Vector3() });
    pos.pos.set(mid * 0.7 + this.hero.pos.x * 0.3, span * 0.95 + 6.5, c.rail + span * 0.62 + 6.5);
    pos.look.set(mid, 0, c.post.z - c.size * 0.42);
    return { pos: pos.pos, look: pos.look, k: 3 };
  }
  stepPhase(ph) {
    return ph === 'lift' || ph === 'forge' || ph === 'run';
  }
  /** The left and right keys pick his lane while he runs the course of gates. */
  lanesLive(ph) {
    return ph === 'run';
  }
  fov() {
    return this.state.phase === 'run' ? 60 : 55;
  }
  robotPose(ph) {
    if (ph === 'run') return this.gateRun.pose() ?? { lift: 0, speed: null, sad: false };
    if (ph === 'lift') return { lift: 0, speed: 3, sad: false };
    if (this.hold) return { lift: 0, speed: Math.abs(this.hold.moving ?? 0) * 4, sad: false };
    return { lift: 0, speed: null, sad: false };
  }
  busy() {
    return this.state.phase === 'lift' || this.state.phase === 'forge' || this.state.phase === 'run';
  }
  walkable(x, z) {
    return this.ter.some((t) => Math.abs(x - t.x) <= t.w / 2 - 0.25 && Math.abs(z - t.z) <= t.d / 2 - 0.25);
  }

  // ───────────────────────────── build ─────────────────────────────
  buildWorld() {
    const rand = seeded(41);
    for (const t of this.ter) {
      const g = makeTerrace(t.w, t.d, rand);
      g.position.set(t.x, 0, t.z);
      this.scene.add(g);
      if (t.feature) this.buildFeature(t);
      if (t.decor) {
        // what stands on a terrace for the eye only (the pavilion of the top terrace)
        t.decorMesh = makeFeature({ kind: t.decor });
        t.decorMesh.position.set(t.x, 0, t.z - 3);
        this.scene.add(t.decorMesh);
        this.colliders.push({ x: t.x, z: t.z - 3, r: 0.9 });
        // THE LESSON'S FINAL MISSION waits in the pavilion of the last terrace (`story.mission`)
        if (this.story.mission && t.i === this.endAt) {
          this.addBeam(t, t.x, t.z - 3);
          this.addInteract(
            t.x,
            t.z + 0.2,
            () => (this.missionOpen() ? this.story.mission.prompt : null),
            () => this.openMission(),
            3.6,
            4.6,
          );
        }
      }
    }
    for (const c of this.courts) this.buildCourt(c);
    for (const y of this.yards) this.buildYard(y);
    // the rail of light of the lesson's course of gates (`lesson.run`), out in the sky beside the terrace of its gate
    const runAt = this.ter.find((t) => t.feature?.kind === 'run') ?? this.ter[0];
    this.gateRun = new GateRun(this, {
      x: runAt.x + runAt.w / 2 + 30,
      z: runAt.z,
      // a first course: time to read a product before its gate; a practice level sets its own pace (`runSpeed`)
      speedOf: (level) => (this.runSpeed ?? 8.5) + 0.6 * (level - 1),
      onOver: (result) => this.runOver(result),
    });
    this.gateRun.build();
    // ONE thing follows him while he holds a rod: lower the platform, clamp the rod, or put it down
    this.follow = this.addInteract(
      0,
      0,
      () => this.holdPrompt(),
      () => this.holdAct(),
      1.6,
      2.9,
    );
    this.rodBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 1, 10).rotateZ(Math.PI / 2).translate(0.5, 0, 0),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 1.6 }),
    );
    this.rodBar.visible = false;
    // THE SAME LENGTH ON THE OTHER SIDE: a platform is a square — the rod's length is written along the side wall too
    this.sideBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 1, 10).rotateX(Math.PI / 2).translate(0, 0, -0.5),
      this.rodBar.material,
    );
    this.sideBar.visible = false;
    this.sideLabel = makeLabel('', { h: 0.85, bg: '#1d4ed8', on: false });
    // the tiles of a platform, lit one by one while they are counted, and the number the count reaches
    this.cells = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 0.06, 1),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.55 }),
      CELLS_SIDE * CELLS_SIDE,
    );
    this.cells.count = 0;
    this.cells.visible = false;
    this.countLabel = makeLabel('', { h: 1.5, bg: '#0f2147', on: false });
    // the NUMBER of each counted tile, written inside it (one canvas laid over the platform, drawn tile after tile)
    this.numCanvas = document.createElement('canvas');
    this.numTex = new THREE.CanvasTexture(this.numCanvas);
    this.numTex.colorSpace = THREE.SRGBColorSpace;
    this.cellNums = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: this.numTex, transparent: true, depthWrite: false }),
    );
    this.cellNums.visible = false;
    this.cellNums.renderOrder = 20;
    // the key of a court he has just ridden
    this.keyMesh = new THREE.Group();
    const gold = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 1.4 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.1, 10, 24), gold);
    ring.position.y = 0.45;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.75, 0.14), gold);
    shaft.position.y = -0.2;
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.14), gold);
    tooth.position.set(0.15, -0.45, 0);
    this.keyMesh.add(ring, shaft, tooth);
    this.keyMesh.visible = false;
    this.keyCourt = null;
    this.keyIt = this.addInteract(
      0,
      0,
      () => (this.keyCourt && !this.hold ? this.T.prompt.key : null),
      () => this.takeKey(),
      2.6,
      3.6,
    );
    this.scene.add(this.sideBar, this.sideLabel, this.cells, this.cellNums, this.countLabel, this.keyMesh);
    this.onDropKey = (e) => {
      if (e.code === 'KeyX' && !e.repeat && !/^(INPUT|TEXTAREA)$/.test(e.target?.tagName ?? '')) this.putDown();
    };
    window.addEventListener('keydown', this.onDropKey);
    // the rod in his hand is LIT: a bright tip that carries a light along the wall
    this.rodTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 14, 10),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 2.6 }),
    );
    this.rodTip.visible = false;
    this.rodLight = new THREE.PointLight(0x22d3ee, 0, 9, 1.6);
    this.scene.add(this.rodBar, this.rodTip, this.rodLight);
    this.rodLabel = makeLabel('', { h: 0.85, bg: '#1d4ed8', on: false });
    this.areaLabel = makeLabel('', { h: 0.85, bg: '#0f2147', on: false });
    this.scene.add(this.rodLabel, this.areaLabel);
  }
  buildCourt(c) {
    // a court whose area nobody wrote yet (`hide: true`): its gate shows « ؟ » until a platform that rides has been counted
    c.shown = !c.hide || Boolean(this.ridden[c.id]);
    const parts = makeCourt(c.side, c.unit, c.shown ? tiles(c.a) : '؟');
    parts.group.position.set(c.post.x, 0, c.post.z);
    this.scene.add(parts.group);
    c.parts = parts;
    c.platform = makePlatform(c.unit);
    c.platform.visible = false;
    this.scene.add(c.platform);
    if (c.pad) {
      const pad = makePad();
      pad.position.set(c.pad.x, 0, c.pad.z);
      this.scene.add(pad);
    }
    // a court closed as « no mark rides it » says so over its floor
    c.sealLabel = makeLabel(this.T.hud.sealed, { h: 0.8, bg: '#92400e' });
    c.sealLabel.position.set(c.post.x + c.size / 2, 1.5, c.post.z - c.size / 2);
    c.sealLabel.visible = false;
    this.scene.add(c.sealLabel);
    // the corner post: take the rod — or, once the court is ridden, board its platform when it waits here
    this.addInteract(
      c.post.x,
      c.rail,
      () => {
        if (this.hold) return null;
        if (c.sealed) return null;
        if (c.ridden)
          return c.target != null && c.shuttle === 'home' && this.mayTravel()
            ? this.T.prompt.ride(this.ter[c.target].name)
            : null;
        return this.courtOpen(c) ? this.T.prompt.grab : null;
      },
      () => (c.ridden ? this.board(c, 'away') : this.take(c)),
      2.3,
      3,
    );
    if (c.pad)
      this.addInteract(
        c.pad.x,
        c.pad.z,
        () =>
          c.ridden && c.shuttle === 'away' && !this.hold && this.mayTravel()
            ? this.T.prompt.ride(this.ter[c.terrace].name)
            : null,
        () => this.board(c, 'home'),
        2.6,
        3,
      );
  }
  buildYard(y) {
    const parts = makeYard(y.unit, y.reach);
    parts.group.position.set(y.post.x, 0, y.post.z);
    this.scene.add(parts.group);
    y.parts = parts;
    y.size = parts.size;
    y.platform = makeYardTiles(y.unit, y.reach);
    y.platform.visible = false;
    this.scene.add(y.platform);
    this.colliders.push({ x: y.post.x - 1.9, z: y.post.z - 1.0, r: 1.1 });
    this.addInteract(
      y.post.x,
      y.rail,
      () => (!this.hold && this.yardOpen(y) ? this.T.prompt.grab : null),
      () => this.grab(y),
      2.3,
      3,
    );
    this.loadCrate(y);
  }
  /** The crate he works on now: the first one not built yet (all built: the last square stands). */
  loadCrate(y) {
    const done = Math.min(this.flags[y.id] ?? 0, y.crates.length);
    y.done = done;
    y.finished = done >= y.crates.length;
    y.a = y.crates[Math.min(done, y.crates.length - 1)];
    y.side = Math.sqrt(Number(y.a));
    y.platform.userData.setArea(Number(y.a));
    y.platform.position.set(y.post.x, y.hover, y.post.z);
    if (y.finished) {
      y.platform.userData.resize(y.side * y.unit);
      y.platform.userData.tone('ride');
      y.platform.visible = true;
      y.parts.wall(y.side);
      y.parts.plaque.userData.set(tiles(y.a));
      y.parts.count.userData.set('0');
    } else {
      y.platform.userData.resize(0);
      y.platform.userData.tone(null);
      y.platform.visible = false;
      y.parts.wall(0);
      y.parts.count.userData.set(tiles(y.a));
    }
  }
  yardOpen(y) {
    return !y.finished && (this.story.yardOpen?.(this, y) ?? true);
  }
  /** He fixes the square he laid: the crate is empty and no cell is open — or tiles remain, or tiles are missing. */
  async fixYard(y, r) {
    const out = outcome(r, y.a);
    this.input.clear();
    this.rodLabel.visible = false;
    this.set({ phase: 'forge', prompt: null, equation: null, verdict: null, count: null });
    // the tiles he laid are COUNTED from above, one by one — the tiles the crate really gave, never the open cells
    const n = Math.round(lengthOf(r));
    const side = n * y.unit;
    await this.countCells(
      { post: y.post, unit: y.unit, size: side },
      n,
      { x: y.post.x + side / 2, z: y.post.z - side / 2 },
      y.hover,
      Math.min(n * n, Number(y.a)),
    );
    if (this.dead) return;
    this.cine = null;
    this.set({
      count: null,
      equation: { s: rodTex(r), covers: tex(out.covers), a: y.a, kind: out.kind, yard: true },
      verdict: { kind: out.kind, diff: out.diff, covers: out.covers, yard: true, side: rodText(r) },
    });
    y.platform.userData.tone(out.kind);
    if (out.kind === 'ride') {
      this.audio.play('success');
      this.robot.cheer();
      y.parts.wall(Math.round(lengthOf(r)));
      y.parts.plaque.userData.set(tiles(y.a));
      this.particles.burst(new THREE.Vector3(y.post.x + 2, 0.6, y.post.z - 2), 0x86efac, 50, 6, 3, 1.3);
    } else this.audio.play(out.kind === 'band' ? 'plank' : 'hit');
    await this.wait(out.kind === 'ride' ? 2.6 : 2.4);
    if (this.dead) return;
    this.cells.visible = false;
    this.cellNums.visible = false;
    this.countLabel.visible = false;
    if (out.kind !== 'ride') {
      y.platform.userData.tone(null);
      this.set({ phase: 'play', equation: null, verdict: null, count: null });
      this.refreshObjective();
      return;
    }
    this.flags[y.id] = y.done + 1;
    this.hold = null;
    this.rodBar.visible = false;
    this.set({ phase: 'play', rod: null, held: null, equation: null, verdict: null, last: null, count: null });
    this.loadCrate(y);
    this.story.onYard?.(this, y);
    this.save();
    this.refreshObjective();
  }
  /** A COLUMN OF LIGHT FROM ABOVE and a ring on the ground: they stand on what calls him now (`stepWorld` shows them). */
  addBeam(t, x, z) {
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 1.5, 16, 20, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xfde68a,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    beam.position.set(x, 8, z);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.7, 2.1, 40),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.05, z);
    beam.visible = false;
    ring.visible = false;
    this.scene.add(beam, ring);
    t.beam = { beam, ring };
  }
  buildFeature(t) {
    const f = t.feature;
    const g = makeFeature(f);
    g.position.set(t.featureAt.x, 0, t.featureAt.z);
    this.scene.add(g);
    t.featureMesh = g;
    this.addBeam(t, t.featureAt.x, t.featureAt.z);
    this.colliders.push({ x: t.featureAt.x, z: t.featureAt.z, r: f.kind === 'stations' ? 2.6 : 1.3 });
    this.addInteract(
      t.featureAt.x,
      t.featureAt.z + 1.9,
      () => (!this.hold && this.featureOpen(f) ? f.prompt : null),
      () => (f.kind === 'run' ? this.openRun() : this.openForge(f.forge)),
      3.2,
      4.4,
    );
  }
  restore() {
    for (const c of this.courts) {
      c.tries = this.tries[c.id] ?? 0;
      c.ridden = this.ridden[c.id] ?? null;
      if (c.ridden) this.reveal(c);
      c.sealed = Boolean(this.sealed[c.id]);
      c.sealLabel.visible = c.sealed;
      if (!c.ridden) continue;
      // a platform that rode waits where he is: on its court, or on its pad of the terrace it reached
      const away = c.target != null && (c.target === this.state.at || c.terrace !== this.state.at);
      this.park(c, away ? 'away' : 'home');
    }
    this.hero.island = this.state.at;
    this.set({ recall: this.recallOf(this.state.at) });
    this.refreshObjective();
  }

  // ───────────────────────────── what the story decides ─────────────────────────────
  courtOpen(c) {
    return this.story.courtOpen?.(this, c) ?? true;
  }
  featureOpen(f) {
    if (this.state.keys.includes(f.forge)) return false;
    return this.story.featureOpen?.(this, f) ?? true;
  }
  canClamp(c) {
    return Boolean(this.story.canClamp?.(this, c));
  }
  stepsOf(c) {
    return this.story.stepsOf?.(this, c) ?? c.steps;
  }
  recallOf(at) {
    return this.story.recall?.(this, this.ter[at].id) ?? [];
  }
  /** While the platform flies there is nothing to do: no instruction. */
  refreshObjective() {
    if (this.state.phase === 'lift') return;
    const T = this.T.objective;
    const here = this.ter[this.state.at];
    // the key of a court he has just ridden comes before anything the story asks next
    let o =
      this.keyCourt && !this.hold
        ? this.leavesWith(this.keyCourt)
          ? T.key
          : T.keyStay
        : (this.story.objective?.(this) ?? null);
    if (!o) {
      const open = here.courts.find((c) => !this.courtDone(c) && this.courtOpen(c));
      const waiting = this.courts.find((c) => c.ridden && c.target != null && this.sideOf(c) === here.i);
      if (this.hold) {
        const hc = this.hold.court;
        o = hc.yard ? T.yard(hc.a) : hc.shown === false ? T.walkHidden : T.walk(hc.a);
      } else if (here.i === this.endAt) o = T.end;
      else if (open) o = open.shown === false ? T.grabHidden : T.grab(open.a);
      else if (waiting) o = T.ride(this.ter[waiting.shuttle === 'home' ? waiting.target : waiting.terrace].name);
      else o = T.end;
    }
    if (o !== this.state.objective) this.set({ objective: o });
  }
  /**
   * THE GAME HOLDS THE ORDER (owner, 2026-11-21): a platform that waits takes him to another terrace only when the
   * terrace he stands on is FINISHED — the story asks nothing more here and no court of it waits to be ridden.
   */
  mayTravel() {
    if (this.story.objective?.(this)) return false;
    return !this.ter[this.state.at].courts.some((c) => !this.courtDone(c) && this.courtOpen(c));
  }
  /** The count has reached the area of a court nobody had written: its gate writes it now. */
  reveal(c) {
    if (c.shown) return;
    c.shown = true;
    c.parts.plaque.userData.set(tiles(c.a));
  }
  /** A court is DONE when its platform rides — or when it was closed as « no mark of this terrace rides it ». */
  courtDone(c) {
    return Boolean(c.ridden || c.sealed);
  }
  /** The terrace where a ridden court's platform waits now. */
  sideOf(c) {
    return c.shuttle === 'home' ? c.terrace : c.target;
  }

  // ───────────────────────────── the rod ─────────────────────────────
  stepLength(step) {
    return approx(step);
  }
  /** The rod in his hand, exactly: the dial's mark he stands on — or the wall when he clamped it. */
  rodNow() {
    const h = this.hold;
    return h.held ?? dialRod(Math.round(h.marks), h.step);
  }
  /**
   * THE COUNT: the lens rises over the court and looks straight down; the tiles of the platform light one by one, from
   * the corner post, row after row, while a counter runs at the top of the screen; the last number stays written on the
   * platform. The first tiles go slowly — he counts with it — then faster (a court of 196 takes about five seconds).
   */
  async countCells(c, n, mid, y, total = n * n) {
    const span = Math.max(c.size, n * c.unit);
    this.cine = {
      pos: new THREE.Vector3(mid.x, span * 1.25 + 9, mid.z + span * 0.32 + 0.5),
      look: new THREE.Vector3(mid.x, 0, mid.z),
    };
    const m = new THREE.Matrix4();
    this.cells.count = 0;
    this.cells.visible = true;
    // the canvas of the numbers: one square of pixels a tile, the first tile at the corner post
    const px = n <= 10 ? 128 : 64;
    this.numCanvas.width = n * px;
    this.numCanvas.height = n * px;
    const g = this.numCanvas.getContext('2d');
    g.clearRect(0, 0, n * px, n * px);
    g.font = `900 ${Math.round(px * (total > 99 ? 0.4 : 0.52))}px Cairo, Tajawal, system-ui, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#0f2147';
    this.numTex.dispose(); // its size changed: a fresh upload
    this.numTex.needsUpdate = true;
    this.cellNums.scale.set(n * c.unit, 1, n * c.unit);
    this.cellNums.position.set(c.post.x + (n * c.unit) / 2, y + 0.17, c.post.z - (n * c.unit) / 2);
    this.cellNums.visible = true;
    await this.wait(0.9);
    for (let k = 0; k < total && !this.dead; k += 1) {
      const [col, row] = [k % n, Math.floor(k / n)];
      m.makeScale(c.unit * 0.9, 1, c.unit * 0.9);
      m.setPosition(c.post.x + (col + 0.5) * c.unit, y + 0.12, c.post.z - (row + 0.5) * c.unit);
      this.cells.setMatrixAt(k, m);
      this.cells.count = k + 1;
      this.cells.instanceMatrix.needsUpdate = true;
      // its number, inside it (the canvas's first row is the far one: the corner post is at the bottom left)
      g.fillText(String(k + 1), (col + 0.5) * px, (n - 1 - row + 0.5) * px);
      this.numTex.needsUpdate = true;
      this.set({ count: k + 1 });
      const pause = Math.max(2.6 / total, 0.3 * 0.9 ** k);
      // a note for each tile, climbing with the count (every second or third tile once they come too fast to hear apart)
      if (pause > 0.07 || k % 3 === 0) this.audio.play('plank', k % 15);
      await this.wait(pause);
    }
    this.audio.play('star', 2);
    this.countLabel.userData.set(String(total));
    this.countLabel.position.set(c.post.x + (n * c.unit) / 2, y + 1.3, c.post.z - (n * c.unit) / 2);
    this.countLabel.visible = true;
    await this.wait(0.8);
  }
  /** Will taking this court's key carry him on? Only the terrace's way out does, and only once nothing else waits here. */
  leavesWith(c) {
    return (
      c.target != null && !this.ter[c.terrace].courts.some((x) => x !== c && !this.courtDone(x) && this.courtOpen(x))
    );
  }
  /** The key of a court he has just ridden floats in front of him: E takes it. */
  showKey(c) {
    const h = this.hero;
    this.keyCourt = c;
    this.keyMesh.position.set(h.pos.x + 1.3, 3.0, h.pos.z - 1.2); // beside him and above his head: never behind it
    this.keyMesh.scale.setScalar(1.7);
    this.keyMesh.visible = true;
    this.keyIt.x = h.pos.x;
    this.keyIt.z = h.pos.z - 0.6;
    this.audio.play('key');
    this.say(this.T.say.key, 5);
  }
  async takeKey() {
    const c = this.keyCourt;
    if (!c || this.busy()) return;
    this.keyCourt = null;
    this.set({ phase: 'forge', prompt: null });
    const from = this.keyMesh.position.clone();
    await this.tween(0.55, (t) => {
      this.keyMesh.position.lerpVectors(from, this.hero.pos.clone().setY(1.4), t);
      this.keyMesh.scale.setScalar(1.7 * (1 - t * 0.7));
    });
    this.keyMesh.visible = false;
    this.keyMesh.scale.setScalar(1);
    this.particles.burst(this.hero.pos.clone().setY(1.5), 0xfde68a, 40, 5, 2, 0.9);
    this.audio.play('crystal');
    this.cells.visible = false;
    this.cellNums.visible = false;
    this.countLabel.visible = false;
    this.set({ count: null, phase: 'play' });
    const spoke = this.guessed(c, true);
    // the platform carries him on when this court is the terrace's way out and nothing else waits here
    if (!this.leavesWith(c)) {
      this.refreshObjective();
      return;
    }
    if (!spoke) this.say(this.T.say.ride, 3); // what he had said before trying is answered first: never covered by « انطلقنا »
    await this.fly(c, 'away');
  }
  /** He takes the rod of a court. A court that asks « will it ride? » (`ask: 'rides'`) asks it once, BEFORE any try. */
  take(c) {
    if (c.ask === 'rides' && this.guess[c.id] == null) {
      this.audio.play('ui');
      this.set({ phase: 'dialog', prompt: null, overlay: { type: 'guess', court: c.id, a: c.a } });
      return;
    }
    this.grab(c);
  }
  answerGuess(yes) {
    const o = this.state.overlay;
    if (o?.type !== 'guess') return;
    const c = this.courts.find((x) => x.id === o.court);
    this.guess[c.id] = Boolean(yes);
    this.set({ overlay: null, phase: 'play' });
    this.input.clear();
    this.save();
    this.grab(c);
  }
  /** The court is done (it rides, or it is closed): what he had said before trying is compared with the fact. */
  guessed(c, rides) {
    if (c.ask !== 'rides' || this.guess[c.id] == null) return false;
    const right = this.guess[c.id] === rides;
    this.set({ stars: { ...this.state.stars, [c.id]: right ? 3 : 1 } });
    this.say(right ? this.T.say.guessRight : rides ? this.T.say.guessRode : this.T.say.guessSealed, 6);
    return true;
  }
  /**
   * A court that may be CLOSED (`seal: true`): once a band and a jam are seen on two NEIGHBOURING marks of the finest
   * dial of the terrace, no mark of that dial rides it — the world says so, takes the rod back and closes the court.
   */
  nears(c, r, kind) {
    if (!c.seal || isWall(r)) return false;
    const near = c.near ?? (c.near = { band: null, jam: null });
    const v = approx(r.q);
    if (kind === 'band') near.band = Math.max(near.band ?? -Infinity, v);
    if (kind === 'jam') near.jam = Math.min(near.jam ?? Infinity, v);
    const finest = this.stepLength(this.stepsOf(c).at(-1));
    if (near.band == null || near.jam == null || near.jam - near.band > finest + 1e-9) return false;
    c.sealed = true;
    this.sealed[c.id] = true;
    c.sealLabel.visible = true;
    this.audio.play('key');
    this.say(this.T.say.sealed, 7);
    this.guessed(c, false);
    this.story.onSeal?.(this, c);
    c.platform.rotation.set(0, 0, 0);
    this.set({ phase: 'play', equation: null, verdict: null });
    this.drop(true);
    this.save();
    return true;
  }
  grab(c) {
    const step = this.stepsOf(c)[0];
    this.hold = { court: c, marks: 0, step, held: null, moving: 0, since: 0 };
    c.platform.userData.tone('hover');
    c.platform.userData.resize(0.02);
    c.platform.position.set(c.post.x, c.hover ?? HOVER, c.post.z);
    c.platform.rotation.set(0, 0, 0);
    c.platform.visible = true;
    this.audio.play('pick');
    if (!this.flags.grabbed) {
      this.flags.grabbed = true;
      this.say(this.T.say.grab, 7);
    }
    this.cells.visible = false;
    this.cellNums.visible = false;
    this.countLabel.visible = false;
    this.set({ equation: null, verdict: null, last: null, count: null });
    this.syncRod();
    this.refreshObjective();
  }
  drop(silent = false) {
    const h = this.hold;
    if (!h) return;
    this.hold = null;
    h.court.platform.visible = false;
    if (h.court.yard) this.loadCrate(h.court); // the tiles go back into the crate
    this.rodBar.visible = false;
    this.rodLabel.visible = false;
    this.areaLabel.visible = false;
    if (!silent) this.audio.play('ui');
    this.set({ rod: null, held: null, last: null });
    this.refreshObjective();
  }
  /** The dial's marks change (« 1 » → « 0,1 »…): the rod keeps its length, rounded to the new marks. */
  setStep(step) {
    const h = this.hold;
    if (!h || h.step === step || !this.stepsOf(h.court).includes(step)) return;
    h.marks = Math.round((h.marks * this.stepLength(h.step)) / this.stepLength(step));
    h.step = step;
    if (this.state.last) this.set({ last: null });
    this.audio.play('ui');
    this.syncRod();
  }
  /** What the HUD shows of the rod: its length, the court, and — on marks finer than a tile — what the platform covers. */
  syncRod() {
    const h = this.hold;
    if (!h) return;
    const r = this.rodNow();
    const fine = h.step !== '1';
    const text = rodText(r);
    if (this.state.rod?.s === text && this.state.rod?.step === h.step) return;
    this.set({
      held: this.T.held(text),
      rod: {
        a: h.court.shown === false ? null : h.court.a,
        s: text,
        tex: rodTex(r),
        step: h.step,
        steps: this.stepsOf(h.court),
        covers: fine || h.court.yard ? outcome(r, h.court.a).covers : null,
        // a yard: the tiles still in the crate (below zero: the cells he opened that no tile fills)
        left: h.court.yard ? Number(h.court.a) - Math.round(h.marks) ** 2 : null,
      },
    });
  }
  /** He may put the rod down WHENEVER he wants, at any length and without lowering anything: key X, or the HUD's button. */
  putDown() {
    if (this.hold && this.state.phase === 'play' && !this.state.overlay) this.drop();
  }
  dispose() {
    window.removeEventListener('keydown', this.onDropKey);
    this.gateRun.dispose();
    super.dispose();
  }
  holdPrompt() {
    const h = this.hold;
    if (!h) return null;
    if (this.nearFar(h)) return this.T.prompt.clamp;
    if (Math.round(h.marks) === 0) return this.T.prompt.drop;
    if (h.court.yard) return this.T.prompt.fix(rodText(this.rodNow()));
    return this.T.prompt.lower(rodText(this.rodNow()));
  }
  holdAct() {
    const h = this.hold;
    if (!h) return;
    if (this.nearFar(h)) {
      h.held = wall(h.court.a);
      this.audio.play('key');
      this.run(h.court, h.held, null);
    } else if (Math.round(h.marks) === 0) this.drop();
    else if (h.court.yard) this.fixYard(h.court, this.rodNow());
    else this.lower();
  }
  /** Is he at the court's far corner, with a rod the story lets him clamp there? */
  nearFar(h) {
    // « at the corner » is the mark nearest to the wall's end, whatever the dial: with marks of 1 the wall of a court
    // of 30 ends between 5 and 6, and both count (a fixed 0,32 left no whole mark near enough — the clamp never came)
    const step = this.stepLength(h.step);
    return this.canClamp(h.court) && Math.abs(Math.round(h.marks) * step - h.court.side) < Math.max(0.32, step * 0.56);
  }
  /** He lowers the platform. A rod of whole tiles asks first how many tiles it covers: the prediction comes before the fact. */
  /** He lowers the platform he has set: the world answers at once — it asks him nothing it is about to show. */
  lower() {
    this.run(this.hold.court, this.rodNow());
  }

  /** THE WORLD ANSWERS: the platform comes down, and it rides, leaves a band, or jams. */
  async run(c, r) {
    const out = outcome(r, c.a);
    const len = lengthOf(r) * c.unit;
    c.tries += 1;
    this.tries[c.id] = c.tries;
    this.log = [...this.log, { a: c.a, s: r, kind: out.kind }].slice(-24);
    this.input.clear();
    // A WHOLE rod: the area is COUNTED in front of him, tile by tile, seen from above — the product is written only
    // once the count has reached it (owner, 2026-11-21: never ask him a number the gate already shows; show how the
    // area comes from the side)
    const whole = !isWall(r) && /^\d+$/.test(r.q) && Number(r.q) >= 1 && Number(r.q) <= CELLS_SIDE ? Number(r.q) : 0;
    // a rod taken from the wall has no product to show: « its length × itself = the area » is not the world's to say
    // an unwritten court stays « ؟ » until the count of a platform that rides has ENDED
    const hidden = c.shown === false && out.kind !== 'ride';
    const eq = {
      s: rodTex(r),
      covers: tex(out.covers),
      a: c.shown === false ? null : c.a,
      kind: null,
      wall: isWall(r),
    };
    this.set({ phase: 'forge', overlay: null, prompt: null, verdict: null, equation: whole ? null : eq, count: null });
    this.countLabel.visible = false;
    this.rodLabel.visible = false;
    this.areaLabel.visible = false;
    const mid = { x: c.post.x + c.size / 2, z: c.post.z - c.size / 2 };
    this.cine = {
      pos: new THREE.Vector3(mid.x + c.size * 0.75 + 5, c.size * 0.95 + 6.5, c.post.z + c.size * 0.45 + 8.5),
      look: new THREE.Vector3(mid.x, 0, mid.z),
    };
    const p = c.platform;
    p.userData.resize(len);
    p.userData.tone(null);
    this.audio.play('sweep');
    const rest = out.kind === 'jam' ? 0.66 : 0.1;
    await this.tween(0.95, (t) => {
      p.position.y = HOVER + (rest - HOVER) * t;
    });
    if (this.dead) return;
    if (whole) {
      await this.countCells(c, whole, mid, rest);
      if (this.dead) return;
    }
    if (out.kind === 'ride' && c.shown === false) {
      this.reveal(c);
      eq.a = c.a;
    }
    p.userData.tone(out.kind);
    if (out.kind === 'ride') {
      this.audio.play('success');
      this.robot.cheer();
      this.particles.burst(new THREE.Vector3(mid.x, 0.6, mid.z), 0x86efac, 60, 6, 3, 1.3);
    } else if (out.kind === 'band') {
      this.audio.play('plank', 2);
      c.band = true; // the floor it leaves glows amber (stepWorld); the platform slides in the room it has
      this.tween(2.2, (t) => {
        const slide = Math.sin(t * Math.PI * 3) * Math.min(0.35, (c.size - len) * 0.5) * (1 - t);
        p.position.x = c.post.x + slide;
        p.position.z = c.post.z - slide;
      });
    } else {
      this.audio.play('hit');
      this.shake = 0.28;
      p.rotation.z = -0.03;
      p.rotation.x = 0.02;
    }
    // the count has ended: its number stays on the platform (in 3D), the product takes its place at the top
    this.set({
      count: null,
      equation: { ...eq, kind: out.kind },
      verdict: {
        covers: out.covers,
        kind: out.kind,
        diff: hidden ? null : out.diff,
        wall: isWall(r),
      },
    });
    this.robot.setChest(out.kind === 'ride' ? '✓' : '•', out.kind === 'ride' ? true : undefined);
    this.story.onVerdict?.(this, c, { a: c.a, s: r, ...out });
    this.save();
    await this.wait(out.kind === 'ride' ? 1.5 : 2.9);
    if (this.dead) return;
    this.cine = null;
    c.band = false;
    c.parts.band.material.opacity = 0;
    if (out.kind === 'ride') {
      c.ridden = r;
      this.ridden[c.id] = r;
      const stars = c.tries === 1 ? 3 : c.tries <= 3 ? 2 : 1;
      this.hold = null;
      this.rodBar.visible = false;
      this.set({ stars: { ...this.state.stars, [c.id]: stars }, rod: null, held: null, equation: null, verdict: null });
      // THE KEY OF THE COURT appears over its platform: he takes it, and the platform carries him on
      this.park(c, 'home');
      this.showKey(c);
      this.set({ phase: 'play' });
      this.save(); // the ride is kept before he takes the key: a reload then finds the platform waiting on its court
      this.refreshObjective();
      return;
    }
    if (this.nears(c, r, out.kind)) return;
    // a band, a jam: the platform comes back over the court, the rod stays in his hand
    this.cells.visible = false;
    this.cellNums.visible = false;
    this.countLabel.visible = false;
    p.rotation.set(0, 0, 0);
    p.userData.tone('hover');
    await this.tween(0.5, (t) => {
      p.position.set(c.post.x, rest + (HOVER - rest) * t, c.post.z);
    });
    if (this.dead) return;
    if (this.hold) this.hold.held = null;
    // back in his hands: the rod's chip returns, with ONE line of what the world has just done — until he moves again
    this.set({
      phase: 'play',
      equation: null,
      verdict: null,
      count: null,
      last: { s: eq.s, covers: eq.covers, kind: out.kind, diff: hidden ? null : out.diff },
    });
    // the story may take the rod back (this court has nothing more to give for now): he is free to walk elsewhere,
    // and the instruction of the moment is the story's, not « walk until the platform covers the court »
    if (this.hold && this.story.release?.(this, c)) this.drop(true);
    else this.refreshObjective();
  }

  // ───────────────────────────── the course of gates ─────────────────────────────
  /** He enters the gate of light: the kit's rail (`kit/GateRun.js`) plays the lesson's course (`lesson.run`). */
  openRun() {
    if (this.busy() || !this.lesson.run) return;
    this.drop(true);
    this.runFrom = this.hero.pos.clone();
    this.drill = null;
    this.runSpeed = 8.5;
    this.runContent = this.lesson.run;
    this.set({ objective: '' });
    this.gateRun.open(this.lesson.run);
  }
  startRun() {
    if (this.drill) return this.startPractice(this.drill.node, this.drill.level, true);
    this.gateRun.start();
    return true;
  }
  runLane(d) {
    this.gateRun.lane(d);
  }
  pauseRun(on) {
    this.gateRun.pause(on);
  }
  /** The run is over. The story's course, passed whole, is kept (`flags.run`); a practice level gives its result. */
  runOver(result) {
    if (this.drill) {
      setTimeout(() => !this.dead && this.endPractice(result), 0); // after the rail has published its own end
      return {};
    }
    if (result.won && !this.flags.run) {
      this.flags.run = true;
      this.save();
    }
    return {};
  }
  /** The rail goes away and the robot stands again where the story left him. */
  leaveRail() {
    this.gateRun.hide();
    this.hero.pos.copy(this.runFrom ?? this.ter[this.state.at].spawn);
    this.hero.pos.y = 0;
    this.hero.vel.set(0, 0, 0);
    this.hero.grounded = true;
    this.lookTo(Math.PI);
  }
  leaveRun() {
    if (this.drill) return this.quitPractice();
    this.leaveRail();
    this.set({ run: null, phase: 'play' });
    this.refreshObjective();
    return undefined;
  }

  // ───────────────────────────── « حلبة التدريب »: a level of the practice ladder, on the same rail ─────────────────────────────
  /**
   * A level of the lesson's ladder (`lesson.ladder`, the kit's) is a run of gates: here it is played by the kit's rail.
   * A wave of the lesson carries what the rail shows — `say` (the order), `tex?`, `gates` (three numbers or short
   * strings), `good`, and `why: { right, wrong: { [gate]: fact } }` (the FACT of each gate).
   */
  startPractice(node, level, again = false) {
    const ladder = this.lesson.ladder;
    if (!ladder || (this.state.run && !again) || ladder.isCase(node, level)) return false;
    if (!ladder.levelOpen(node, level, [...this.keysEver], this.practice)) return false;
    this.audio.unlock();
    if (!this.mapFrom) this.mapFrom = this.state.phase === 'title' ? 'title' : 'play';
    if (!this.drill && !this.state.run) this.runFrom = this.hero.pos.clone();
    this.drop(true);
    const waves = ladder.makeRun(Math.random, node, level);
    const names = this.lesson.text?.levels?.[ladder.nodes[node].id] ?? [];
    // a lesson without a course of gates of its own (`lesson.run`) gives no words to the rail's end card, which shows for
    // one frame before the kit's result card replaces it: never undefined
    const base = this.lesson.run?.text ?? { won: {}, lost: {} };
    this.drill = { node, level, waves };
    this.runSpeed = Math.min(12, 8.5 + level);
    this.runContent = {
      total: waves.length,
      gates: waves.length + 1,
      levels: [{ name: names[level] ?? '', from: '' }],
      round: (_level, _rand, n) => {
        const w = waves[n % waves.length];
        return {
          ask: w.say,
          tex: w.tex ?? null,
          options: w.gates.map(gateOption),
          right: w.good,
          why: w.gates.map((g, k) => (k === w.good ? w.why.right : (w.why.wrong?.[g] ?? w.why.right))),
        };
      },
      text: { ...base, ...this.T.practice, title: names[level] ?? base.title },
    };
    this.gateRun.open(this.runContent);
    this.gateRun.start();
    return true;
  }
  /** The level is over: its stars are his hearts left (a level lost gives none), kept as the kit keeps them. */
  endPractice(result) {
    const d = this.drill;
    if (!d) return;
    const ladder = this.lesson.ladder;
    const id = ladder.levelId(d.node, d.level);
    const before = this.practice[id] ?? { stars: 0, best: 0 };
    const win = result.won;
    const stars = win ? Math.max(1, result.hearts) : 0;
    const score = result.score * 100;
    if (win) {
      this.practice = {
        ...this.practice,
        [id]: { stars: Math.max(before.stars, stars), best: Math.max(before.best, score) },
      };
      this.audio.play(stars === 3 ? 'finale' : 'success');
    } else this.audio.play('fail');
    this.drill = null;
    this.leaveRail();
    const next = win ? ladder.nextLevel([...this.keysEver], this.practice) : null;
    this.set({
      phase: this.mapFrom === 'title' ? 'title' : 'dialog',
      run: null,
      practice: this.practice,
      overlay: {
        type: 'result',
        win,
        node: d.node,
        level: d.level,
        stars,
        score,
        best: Math.max(before.best, win ? score : 0),
        newBest: win && score > before.best,
        streak: 0,
        mistakes: 3 - result.hearts,
        key: d.waves.at(-1)?.key ?? null,
        next,
      },
    });
    this.save();
  }
  quitPractice() {
    const d = this.drill;
    if (!d) return;
    this.drill = null;
    this.leaveRail();
    this.set({ run: null, phase: this.mapFrom === 'title' ? 'title' : 'dialog' });
    this.openMap(d.node);
  }
  /** « ذكّرني بالقاعدة » from the hub or a result: the tablet of a rule; closing it comes back where he was. */
  showRule(key, from) {
    if (!key) return;
    this.audio.play('ui');
    const o = this.state.overlay;
    this.set({ overlay: { type: 'rule', key, back: from && o ? { ...o, ...from } : o } });
  }

  // ───────────────────────────── the final mission ─────────────────────────────
  /** `story.mission = { prompt, title, lead: [...], lines(), check(values) → 'ok' | a FACT, ok }`: one written problem that needs the lesson. */
  missionOpen() {
    return Boolean(this.story.mission) && !this.flags.mission && this.state.at === this.endAt;
  }
  openMission() {
    if (this.busy() || !this.missionOpen()) return;
    this.audio.play('ui');
    this.set({ phase: 'dialog', overlay: { type: 'mission' }, prompt: null });
  }
  closeMission() {
    this.set({ overlay: null, phase: 'play' });
    this.input.clear();
  }
  /** The mission is solved: it is kept, and the story ends. */
  passMission() {
    this.flags.mission = true;
    this.audio.play('success');
    this.set({ overlay: null, phase: 'play' });
    this.save();
    this.refreshObjective();
    this.finale();
  }

  // ───────────────────────────── the lift ─────────────────────────────
  /** Where a court's platform stands on each side: on the court (its corner at the post), or centred on its pad. */
  spot(c, side) {
    const len = lengthOf(c.ridden) * c.unit;
    return side === 'home'
      ? new THREE.Vector3(c.post.x, 0.1, c.post.z)
      : new THREE.Vector3(c.pad.x - len / 2, 0.1, c.pad.z + len / 2);
  }
  park(c, side) {
    const len = lengthOf(c.ridden) * c.unit;
    c.shuttle = side;
    c.platform.userData.resize(len);
    c.platform.userData.tone('ride');
    c.platform.position.copy(this.spot(c, side));
    c.platform.rotation.set(0, 0, 0);
    c.platform.visible = true;
  }
  /** He boards a platform that waits (a court he has ridden): it flies him to its other side. */
  board(c, side) {
    if (this.busy() || !c.ridden || !this.mayTravel()) return;
    this.fly(c, side);
  }
  /** The platform flies, the robot on it: up, across in an arc, down. */
  async fly(c, side) {
    this.cells.visible = false;
    this.cellNums.visible = false;
    this.countLabel.visible = false;
    const p = c.platform;
    const len = lengthOf(c.ridden) * c.unit;
    const from = p.position.clone();
    const to = this.spot(c, side);
    const h = this.hero;
    const ride = (pos) => {
      p.position.copy(pos);
      h.pos.set(pos.x + len / 2, pos.y - 0.1, pos.z - len / 2);
    };
    this.set({ phase: 'lift', prompt: null, overlay: null, objective: '' });
    this.audio.play('gate');
    h.grounded = false;
    h.vel.set(0, 0, 0);
    h.yaw = Math.atan2(to.x - from.x, to.z - from.z);
    const top = 5.2;
    await this.tween(0.9, (t) => ride(from.clone().setY(from.y + (top - from.y) * t)), easeOut);
    const dist = Math.hypot(to.x - from.x, to.z - from.z);
    await this.tween(clamp(dist / 13, 2, 4.6), (t) => {
      const pos = from.clone().lerp(to, t);
      pos.y = top + Math.sin(t * Math.PI) * (3.2 + Math.max(0, dist - 50) * 0.09); // a long flight passes OVER the terraces between
      ride(pos);
    });
    await this.tween(0.8, (t) => ride(to.clone().setY(top + (to.y - top) * t)), easeOut);
    if (this.dead) return;
    c.shuttle = side;
    h.pos.y = 0;
    h.grounded = true;
    this.audio.play('plank', 4);
    const at = this.sideOf(c);
    this.particles.burst(h.pos.clone().setY(0.4), 0x7dd3fc, 26, 4, 2, 0.8);
    this.set({ phase: 'play' });
    this.arrive(at);
  }
  arrive(at) {
    const t = this.ter[at];
    const first = !this.flags[`seen:${t.id}`];
    this.flags[`seen:${t.id}`] = true;
    this.lookTo(Math.PI);
    this.hero.island = at;
    this.set({
      at,
      islandName: t.name,
      stage: Math.max(this.state.stage, at),
      equation: null,
      verdict: null,
      recall: this.recallOf(at),
    });
    this.robot.setChest('•');
    this.refreshObjective();
    this.save();
    if (first) this.say(this.T.say.landed(t.name), 4);
    this.story.onArrive?.(this, t.id, first);
    this.save(); // what the story has just decided on arriving (a flag, a door opened) is part of the journey
    // the story ends on its last terrace — after the lesson's final mission, when it has one
    if (at === this.endAt && (!this.story.mission || this.flags.mission)) this.finale();
  }

  // ───────────────────────────── the forge of a key ─────────────────────────────
  onStart() {
    if (!this.flags.hello && this.state.stage === 0 && !this.log.length) {
      this.flags.hello = true;
      this.say(this.T.say.hello, 10);
    }
    this.refreshObjective();
    const pending = this.story.pendingForge?.(this) ?? null;
    if (pending)
      this.wait(0.9).then(
        () => !this.dead && this.state.phase === 'play' && !this.state.overlay && this.openForge(pending),
      );
  }
  openForge(key) {
    this.drop(true);
    this.audio.play('crystal');
    this.flags[`forge:${key}`] = true; // a forge left unfinished opens again (`story.pendingForge`)
    this.save();
    this.set({ phase: 'dialog', overlay: { type: 'forge', key, log: this.log }, prompt: null });
  }
  /** A case the mirror of a forge showed him: evidence too. */
  logMirror(c) {
    this.log = [...this.log, { a: c.a, s: c.s, mirror: true }].slice(-24);
    this.save();
  }
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
    this.queue.shift()?.();
    this.refreshObjective();
    this.save();
  }

  // ───────────────────────────── the doors of the kit ─────────────────────────────
  /** A door of the kit whose part the lesson has not got yet (`lesson.notYet`) does not open; the launch then starts the story. */
  openHub(overlay) {
    if (this.lesson.notYet?.includes(overlay.type)) {
      if (overlay.type === 'launch' && overlay.then === 'start') this.start();
      return;
    }
    super.openHub(overlay);
  }
  closeMap() {
    const from = this.mapFrom ?? 'play';
    this.mapFrom = null;
    this.set({ overlay: null, phase: from === 'title' ? 'title' : 'play' });
    this.input.clear();
  }
  closeRule() {
    const back = this.state.overlay?.back;
    if (back) this.set({ overlay: back });
    else this.closeMap();
  }
  async finale() {
    const again = this.state.finished;
    const whole = this.story.complete !== false;
    this.set({ phase: 'end', prompt: null, finished: whole || again });
    this.save();
    await this.wait(1.2);
    if (this.dead) return;
    if (!again) {
      this.audio.play('finale');
      this.robot.cheer();
      this.particles.burst(this.hero.pos.clone().setY(3), 0xfff1a8, 120, 9, 5, 2);
      this.say(this.T.say.end, 8);
    }
    await this.wait(again ? 0.5 : 3.6);
    if (this.dead) return;
    this.set({ overlay: { type: 'end', elapsed: Date.now() - this.startedAt } });
  }

  // ───────────────────────────── each step ─────────────────────────────
  stepWorld(dt, ph) {
    if (ph === 'run') this.gateRun.step(dt);
    const h = this.hold;
    if (h && ph === 'play') {
      // HIS WALK IS THE LENGTH: left and right move him along the wall, mark by mark; the longer he walks, the faster
      const c = h.court;
      const ax = this.input.axis().x;
      h.since = ax ? h.since + dt : 0;
      const per = this.stepLength(h.step);
      const speed = h.step === '1' ? 3.1 : Math.min(3.1 / per, 4 + h.since * h.since * 45); // marks a second
      h.marks = clamp(h.marks + ax * speed * dt, 0, c.parts.reach / per);
      h.moving = ax;
      if (ax && this.state.last) this.set({ last: null });
      const hero = this.hero;
      hero.pos.set(c.post.x + h.marks * per * c.unit, 0, c.rail);
      hero.vel.set(0, 0, 0);
      hero.grounded = true;
      hero.yaw = ax > 0.2 ? Math.PI / 2 : ax < -0.2 ? -Math.PI / 2 : Math.PI;
      this.view = Math.PI; // the lens faces the court while he sets the rod
      const r = this.rodNow();
      const len = lengthOf(r) * c.unit;
      c.platform.userData.resize(len);
      if (c.yard) c.parts.count.userData.set(tiles(String(Math.max(0, Number(c.a) - Math.round(h.marks) ** 2))));
      else c.platform.position.set(c.post.x, HOVER + Math.sin(this.time * 2.4) * 0.06, c.post.z);
      this.rodBar.visible = true;
      this.rodBar.position.set(c.post.x, 0.95, c.rail - 0.5);
      this.rodBar.scale.set(Math.max(0.02, len), 1, 1);
      const beat = Math.sin(this.time * 5);
      this.rodBar.material.emissiveIntensity = 1.6 + beat * 0.5;
      this.rodTip.visible = true;
      this.rodTip.position.set(c.post.x + len, 0.95, c.rail - 0.5);
      this.rodTip.scale.setScalar(1 + beat * 0.15);
      this.rodLight.position.set(c.post.x + len, 1.5, c.rail - 0.2);
      this.rodLight.intensity = 14 + beat * 3;
      this.rodLabel.userData.set(rodText(r));
      this.rodLabel.position.set(c.post.x + len / 2, 2.05, c.rail - 0.5);
      this.rodLabel.visible = len > 0.05;
      this.sideBar.visible = len > 0.05;
      this.sideBar.position.set(c.post.x - 0.45, 0.95, c.post.z);
      this.sideBar.scale.set(1, 1, Math.max(0.02, len));
      this.sideLabel.userData.set(rodText(r));
      this.sideLabel.position.set(c.post.x - 1.35, 2.05, c.post.z - len / 2);
      this.sideLabel.visible = len > 0.05;
      c.parts.far.visible = this.canClamp(c);
      this.follow.x = hero.pos.x;
      this.follow.z = hero.pos.z;
      this.syncRod();
    }
    if (this.keyMesh.visible) {
      this.keyMesh.rotation.y += dt * 2.2;
      this.keyMesh.position.y = 3.0 + Math.sin(this.time * 3) * 0.14;
    }
    if (!this.hold || !this.rodBar.visible) {
      this.sideBar.visible = false;
      this.sideLabel.visible = false;
      this.rodLabel.visible = false; // a ridden platform keeps no stale length over its tiles
      this.rodTip.visible = false;
      this.rodLight.intensity = 0;
    }
    for (const y of this.yards) {
      y.parts.lamp.visible = this.yardOpen(y);
      y.parts.lamp.scale.setScalar(1.25 + Math.sin(this.time * 4) * 0.3);
      y.parts.handle.visible = y.parts.lamp.visible && this.hold?.court !== y;
      y.parts.handle.userData.halo.material.opacity = 0.55 + Math.sin(this.time * 3.2) * 0.3;
    }
    for (const c of this.courts) {
      if (c.band) c.parts.band.material.opacity = 0.55 + Math.sin(this.time * 7) * 0.25;
      // the lamp of a corner post is lit on a court he can take now, and only there: it shows where to go
      c.parts.lamp.visible = !this.courtDone(c) && this.courtOpen(c);
      c.parts.handle.visible = c.parts.lamp.visible && this.hold?.court !== c;
      const ring = c.parts.handle.userData.halo;
      ring.scale.setScalar(1 + Math.sin(this.time * 3.2) * 0.12);
      ring.material.opacity = 0.55 + Math.sin(this.time * 3.2) * 0.3;
      c.parts.lamp.scale.setScalar(1.25 + Math.sin(this.time * 4 + c.post.x) * 0.3);
    }
    for (const t of this.ter) if (t.decorMesh?.userData.spin) t.decorMesh.userData.spin.rotation.y += dt * 0.8;
    for (const t of this.ter)
      if (t.beam) {
        const calls = t.feature ? this.featureOpen(t.feature) : this.missionOpen();
        const on = t.i === this.state.at && !this.hold && calls;
        t.beam.beam.visible = on;
        t.beam.ring.visible = on;
        if (on) {
          t.beam.beam.material.opacity = 0.26 + Math.sin(this.time * 2.6) * 0.1;
          t.beam.ring.scale.setScalar(1 + Math.sin(this.time * 3) * 0.12);
        }
      }
    for (const t of this.ter)
      if (t.featureMesh?.userData.pulse)
        t.featureMesh.userData.pulse.emissiveIntensity = 0.8 + Math.sin(this.time * 2.2) * 0.3;
  }
}
