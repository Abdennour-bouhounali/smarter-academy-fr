/**
 * THE WORLD RUNTIME — everything a lesson's game world has whatever its mechanic is (it names no lesson and no world).
 *
 * It owns the three.js scene, the loop, the robot the student steers, the camera, the sky, the things he can use (`addInteract`),
 * the gems, the game state React reads (`subscribe` / `getState`) and the flows every lesson has around its story: the hub,
 * « fiche de connaissances », « brevet blanc », the paper mode, the evidence, the save.
 *
 * A WORLD extends it and gives the mechanic through these hooks (the ONLY way the runtime reaches a world):
 *   initWorld(save)        its own fields, before the state exists (layout, what is built)
 *   worldState(save)       its own keys of the state React reads
 *   worldSave()            its part of the save
 *   worldCentre()          { x, z }: where the sea of clouds is centred
 *   buildWorld(rand)       add the world to `this.scene` (`rand`: the seeded generator of the scenery)
 *   spawnPoint()           where the robot stands when the world opens
 *   restore()              put the world in the state of the save
 *   walkable(x, z)         is there ground under this point?
 *   onGround()             the robot stands on the ground this step (a world notices an arrival here)
 *   respawnPoint(), onFall()   where a fall brings the robot back, and what a fall costs or says
 *   onStart()              the story begins, or resumes
 *   stepPhase(phase, dt)   drive the robot in a phase of its own (a run on a rail): true when it did
 *   lanesLive(phase)       does this phase read « left » / « right » as gestures?
 *   freeLook(), steers()   a view that follows him in EVERY direction: his keys are the hours of a clock (12 = `heading()`);
 *                          `steers()` false while the world reads ← → itself; `lookTo(angle)` turns him at once
 *   turnKeys()             in a free view: null (the keys are the hours of the world's clock), or { step, rate, delay }:
 *                          ← → TURN him (one press = `step` degrees) and ↑ ↓ walk along his facing (`kit/steer.js`)
 *                          (`kit/steer.js`; default false — the `rootCourts` world keeps the world's clock)
 *   stepWorld(dt, phase)   its animations of each step
 *   robotPose(phase)       { lift, speed, sad }: how the robot holds itself now
 *   heading()              the angle the camera should look along — it reads `this.facing` (1 forward, -1 when the
 *                          student has turned ROUND with « back »: the camera then looks back along the road)
 *   cameraShot(phase)      { pos, look, k } when the camera is not following the robot (a cinematic `this.cine` by default)
 *   followsHero(phase), fov(), skyTarget()
 *   sunDir()               the unit vector towards the sun (default: the fixed sun of every world before 2026-11-24)
 *   shadowBox()            { half, near, far, distance, at? }: the box the sun's shadow map covers, how far the sun stands
 *                          from its target, and that target (default: ±26 around the robot)
 *   fogRange()             [near, far] of the fog (default [70, 300]); the camera's far plane follows it (never under 1200)
 *                          — a shadow that carries mathematics is never the shadow map: a slow machine drops the map
 *                          (`adaptQuality`), so a world DRAWS such a shadow as a mesh of its own
 *   busy()                 is the student in the middle of something the hub must not interrupt?
 *   pausesWorld(page)      does this full-screen page hide the world (nothing is simulated or drawn behind it)?
 */
import * as THREE from 'three';
import { seeded, makeCloud, makeGem, makeSky, Particles, disposeScene } from '../engine/builders';
import { makeRobot } from '../engine/robot';
import { GameAudio } from '../engine/audio';
import { GameInput } from '../engine/input';
import { emptyExam } from './journey';
import { LESSON_FLOWS } from './lessonFlows';
import { steerAngle, turnStep } from './steer';

const SPEED = 6.2;
const JUMP = 7.4;
const GRAVITY = 21;
// THE LIGHT OF A WORLD THAT SAYS NOTHING (PYRAMIDS_WORLD_PLAN K-f): the values every world had before the hooks existed
const SUN_OFFSET = new THREE.Vector3(22, 38, 16);
const SUN_DIR = SUN_OFFSET.clone().normalize();
const SHADOW_BOX = Object.freeze({ half: 26, near: 1, far: 120, distance: SUN_OFFSET.length(), at: null });
const FOG_RANGE = Object.freeze([70, 300]);
const FAR_MIN = 1200;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
export const easeOut = (t) => 1 - (1 - t) ** 3;
export const damp = (k, dt) => 1 - Math.exp(-k * dt);

export class WorldRuntime {
  constructor(
    canvas,
    {
      lesson,
      save = null,
      onSave = () => {},
      onModule = () => {},
      onEvidence = () => {},
      onSitting = () => {},
      sound = true,
      unlockedKeys = [],
    } = {},
  ) {
    this.canvas = canvas;
    this.lesson = lesson;
    this.onSave = onSave;
    this.onModule = onModule;
    this.onEvidence = onEvidence;
    this.onSitting = onSitting;
    this.listeners = new Set();
    this.occluders = [];
    this.signs = [];
    this.tweens = [];
    this.interactables = [];
    this.colliders = [];
    this.gems = [];
    this.queue = [];
    this.dead = false;
    this.time = 0;
    this.shake = 0;
    this.sayId = 0;
    this.toastId = 0;
    const sv = save && save.v === 1 ? save : null;
    this.initWorld(sv);
    this.flags = { ...(sv?.flags ?? {}) };
    this.startedAt = Date.now() - (sv?.elapsed ?? 0);
    // the practice game: what is passed, and every key ever earned (on this device, or known from the lesson's progress)
    this.practice = { ...(sv?.practice ?? {}) };
    this.keysEver = new Set([...(sv?.keysEver ?? []), ...(sv?.keys ?? []), ...unlockedKeys]);
    // « Espace brevet »: the ladder of sittings; and, per key, the first tries done as in an exam (right / all)
    this.exam = { ...emptyExam(), ...(sv?.exam ?? {}) };
    this.tally = { ...(sv?.tally ?? {}) };
    // the rules the student forged himself
    this.rules = { ...(sv?.rules ?? {}) };
    // « fiche de connaissances »: the cards read and the rules sealed by their memory test
    this.know = {
      read: [...(sv?.know?.read ?? [])],
      sealed: [...(sv?.know?.sealed ?? [])],
      trained: { ...(sv?.know?.trained ?? {}) },
      found: [...(sv?.know?.found ?? [])],
    };
    this.state = {
      phase: 'title',
      stage: sv?.stage ?? 0,
      prompt: null,
      overlay: null,
      gems: sv?.gems?.length ?? 0,
      keys: [...(sv?.keys ?? [])],
      falls: sv?.falls ?? 0,
      say: null,
      toast: null,
      sound,
      finished: Boolean(sv?.finished),
      practice: this.practice,
      openKeys: [...this.keysEver],
      know: this.know,
      paper: false,
      exam: this.exam,
      tally: this.tally,
      rules: this.rules,
      ...this.worldState(sv),
    };
    this.takenGems = new Set(sv?.gems ?? []);
    this.audio = new GameAudio();
    this.audio.enabled = sound;
    this.input = new GameInput();
    this.build();
    this.restore();
    this.loop = this.loop.bind(this);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  // ───────────────────────────── the hooks a world may leave as they are ─────────────────────────────
  onGround() {}
  onFall() {}
  onStart() {}
  stepPhase() {
    return false;
  }
  lanesLive() {
    return false;
  }
  /** Does the view follow him in EVERY direction (his keys are the hours of a clock; the lens looks where he walks)? */
  freeLook() {
    return false;
  }
  /** In a free view: do his keys walk him now? (a world that reads them for a gesture of its own says no) */
  steers() {
    return true;
  }
  /**
   * In a free view: null — his keys are the hours of the world's clock (twelve = `heading()`) — or { step, rate, delay }:
   * ← → turn him by `step` degrees a press (`rate` °/s held past `delay` s), ↑ ↓ walk along his facing (`kit/steer.js`).
   */
  turnKeys() {
    return null;
  }
  /** In a free view: turn him (and the lens) to this angle — on arriving somewhere, after a fall. */
  lookTo(angle) {
    this.view = angle;
  }
  stepWorld() {}
  robotPose() {
    return { lift: 0, speed: null, sad: false };
  }
  cameraShot() {
    return this.cine ? { pos: this.cine.pos, look: this.cine.look, k: 2.6 } : null;
  }
  followsHero(phase) {
    return phase === 'play' || phase === 'dialog';
  }
  fov() {
    return 55;
  }
  /** The unit vector from the ground towards the sun (K-f). */
  sunDir() {
    return SUN_DIR;
  }
  /** The box of the sun's shadow map: `half` its half side, `near` / `far` its depth, `distance` from the sun to its target, `at` that target ({ x, z }; default: the robot). */
  shadowBox() {
    return SHADOW_BOX;
  }
  /** [near, far] of the fog; the camera sees twice as far (never under 1200). */
  fogRange() {
    return FOG_RANGE;
  }
  busy() {
    return false;
  }
  /** The kit's full-screen pages are opaque: the world behind them is neither simulated nor drawn. */
  pausesWorld(page) {
    return page === 'lab' || page === 'sitting' || page === 'launch' || page === 'know' || page === 'progress';
  }

  // ───────────────────────────── store ─────────────────────────────
  subscribe = (fn) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getState = () => this.state;
  say(text, hold = 6) {
    this.sayId += 1;
    this.set({ say: { text, id: this.sayId, hold } });
  }
  toast(text, tone = 'good') {
    this.toastId += 1;
    this.set({ toast: { text, tone, id: this.toastId } });
  }

  save() {
    this.onSave({
      v: 1,
      stage: this.state.stage,
      gems: [...this.takenGems],
      keys: this.state.keys,
      falls: this.state.falls,
      flags: this.flags,
      elapsed: Date.now() - this.startedAt,
      finished: this.state.finished,
      practice: this.practice,
      keysEver: [...this.keysEver],
      know: this.know,
      exam: this.exam,
      tally: this.tally,
      rules: this.rules,
      ...this.worldSave(),
    });
  }

  // ───────────────────────────── helpers ─────────────────────────────
  tween(d, fn, e = ease) {
    return new Promise((res) => {
      this.tweens.push({ t: 0, d: Math.max(0.0001, d), fn, e, res });
    });
  }
  wait(d) {
    return this.tween(d, () => {});
  }

  // ───────────────────────────── build ─────────────────────────────
  build() {
    const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer = r;
    this.scene = new THREE.Scene();
    const [fogNear, fogFar] = this.fogRange();
    this.scene.fog = new THREE.Fog(0xcfeeff, fogNear, fogFar);
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, Math.max(FAR_MIN, fogFar * 2));
    this.camPos = new THREE.Vector3(0, 9, 14);
    this.camLook = new THREE.Vector3();
    this.camDir = new THREE.Vector2(0, -1);
    // TURNING ROUND (owner, 2026-11-19: « the student must be able to return »; the control is his: « click the bottom
    // arrow → the camera view turns toward the previous island → then the top arrow to start walking toward it; the
    // bottom arrow again → the camera moves to the front »). « back » is a TOGGLE on its press: `facing` flips between 1
    // and -1, the world's `heading()` then points back along the road and the camera swings behind him. « back » never
    // walks him; « forward » walks him the way he faces. `moveDir` is the frame his keys are read in (`updateHero`).
    this.facing = 1;
    this.backHeld = false;
    this.turning = false;
    this.moveDir = new THREE.Vector2(0, -1);
    this.view = null; // the angle he looks along, when the world's view is free (`freeLook`)
    this.camera.position.copy(this.camPos);

    this.sky = makeSky();
    this.scene.add(this.sky);
    this.hemi = new THREE.HemisphereLight(0xdff3ff, 0x6a7a55, 1.0);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff4dc, 2.5);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.fitShadow(this.shadowBox());
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.04;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
    this.skyNow = this.skyTarget().slice();

    this.particles = new Particles(600);
    this.scene.add(this.particles.points);

    // clouds: a sea far below and a few drifting high
    this.clouds = [];
    const cr = seeded(77);
    const mid = this.worldCentre();
    for (let i = 0; i < 70; i += 1) {
      const c = makeCloud(cr, 1.6 + cr() * 2.2);
      const high = i % 9 === 0;
      c.position.set(mid.x + (cr() - 0.5) * 700, high ? 26 + cr() * 22 : -16 - cr() * 26, mid.z + (cr() - 0.5) * 760);
      c.userData.v = 0.4 + cr() * 0.9;
      this.scene.add(c);
      this.clouds.push(c);
    }

    this.buildWorld(cr);

    this.robot = makeRobot();
    this.scene.add(this.robot.group);
    this.hero = {
      pos: this.spawnPoint(),
      vel: new THREE.Vector3(),
      yaw: Math.PI,
      grounded: true,
      island: this.state.stage,
      dead: false,
    };

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.canvas.parentElement);
    this.resize();
  }

  resize() {
    const p = this.canvas.parentElement;
    if (!p) return;
    const w = Math.max(2, p.clientWidth);
    const h = Math.max(2, p.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** `y` = height of the floating prompt above the thing (the HUD anchors « E » there). */
  addInteract(x, z, prompt, act, r = 2.3, y = 3.1) {
    const it = { x, z, r, prompt, act, y };
    this.interactables.push(it);
    return it;
  }

  addGem(id, x, y, z) {
    if (this.takenGems.has(id)) return;
    const m = makeGem();
    m.position.set(x, y, z);
    this.scene.add(m);
    this.gems.push({ id, mesh: m, y });
  }

  closeOverlay() {
    if (this.state.phase === 'dialog') this.set({ overlay: null, phase: 'play' });
    this.input.clear();
  }

  // ───────────────────────────── the hub: the map, « Ma progression », « Mon labo », the launch ─────────────────────────────
  /** « Mes règles »: the rules he owns, readable from anywhere he plays (the button of the top bar). */
  openRules(key = null) {
    if (!this.state.keys.length) return;
    this.openHub({ type: 'rules', key });
  }
  closeRules() {
    const from = this.mapFrom ?? 'play';
    this.mapFrom = null;
    this.set({ overlay: null, phase: from === 'title' ? 'title' : 'play' });
    this.input.clear();
  }
  // ───────────────────────────── public: shell commands ─────────────────────────────
  start() {
    this.audio.unlock();
    this.audio.startMusic();
    this.set({ phase: 'play' });
    this.onStart();
  }

  roam() {
    this.set({ overlay: null, phase: 'play' });
    this.input.clear();
  }
  setSound(on) {
    this.audio.setEnabled(on);
    this.set({ sound: on });
  }
  openBag() {
    if (this.state.phase === 'play' || this.state.phase === 'title') this.openMap();
  }

  // ───────────────────────────── loop ─────────────────────────────
  updateHero(dt) {
    const h = this.hero;
    const ax = this.input.axis();
    let mx;
    let mz;
    const free = this.freeLook();
    if (free) {
      // THE VIEW FOLLOWS HIM IN EVERY DIRECTION (owner, 2026-11-21): his keys are the hours of a CLOCK laid on the
      // ground, twelve being the world's `heading()` — « forward » is 12, « right » 3, « back » 6, « left » 9, and two
      // keys together the hour between them (forward + right: half past one). He walks that way and the lens swings
      // to look along it. The clock does not turn with the lens: a key held keeps ONE direction.
      if (this.view == null) this.view = this.heading();
      const turn = this.turnKeys();
      if (turn) {
        // HIS OWN FACING (the pyramids world, owner 2026-11-24): ← → turn him step by step, ↑ ↓ walk along where he faces
        const live = this.steers();
        this.keyTurn = turnStep({ way: 0, held: 0, ...this.keyTurn, view: this.view }, live ? ax.x : 0, dt, turn);
        this.view = this.keyTurn.view;
        const along = live ? Math.max(-1, Math.min(1, ax.y)) * (ax.y < 0 ? 0.6 : 1) : 0;
        mx = Math.sin(this.view) * along;
        mz = Math.cos(this.view) * along;
      } else {
        const mag = Math.hypot(ax.x, ax.y);
        const live = mag > 0.3 && this.steers();
        if (live) this.view = steerAngle(this.heading(), ax);
        const along = live ? Math.min(1, mag) : 0;
        mx = Math.sin(this.view) * along;
        mz = Math.cos(this.view) * along;
      }
    } else {
      // each PRESS of « back » (a key, or the stick pulled down) turns him round; it is read once, on its way down
      const back = ax.y < -0.5;
      if (back && !this.backHeld && this.state.phase === 'play') {
        this.facing = -this.facing;
        this.turning = true; // the ROBOT turns round too, on the spot, with the view (owner, 2026-11-19)
      }
      this.backHeld = back;
      const to = this.heading();
      const tx = Math.sin(to);
      const tz = Math.cos(to);
      // the frame of his keys: the ROAD he faces (the direction the lens is turning to) — and the lens's own direction only
      // once it is within ~15° of it, a blend from ~30° (2026-11-19: with a wider blend he walked off a bridge while the
      // lens swung round)
      const c = this.camDir;
      const s = Math.max(0, Math.min(1, (c.x * tx + c.y * tz - 0.86) / 0.11));
      const f = this.moveDir.set(tx + (c.x - tx) * s, tz + (c.y - tz) * s).normalize();
      const along = Math.max(0, ax.y); // « forward » walks him the way he faces; « back » only turns him
      const rx = -f.y;
      const rz = f.x;
      mx = f.x * along + rx * ax.x;
      mz = f.y * along + rz * ax.x;
    }
    const k = damp(h.grounded ? 12 : 4, dt);
    h.vel.x += (mx * SPEED - h.vel.x) * k;
    h.vel.z += (mz * SPEED - h.vel.z) * k;
    if (h.grounded && this.input.take('jump')) {
      h.vel.y = JUMP;
      h.grounded = false;
      this.audio.play('jump');
    }
    if (!h.grounded) h.vel.y -= GRAVITY * dt;
    h.pos.x += h.vel.x * dt;
    h.pos.z += h.vel.z * dt;
    h.pos.y += h.vel.y * dt;
    if (h.pos.y > -0.4)
      for (const c of this.colliders) {
        const dx = h.pos.x - c.x;
        const dz = h.pos.z - c.z;
        const d = Math.hypot(dx, dz);
        const min = c.r + 0.42;
        if (d < min && d > 0.0001) {
          h.pos.x = c.x + (dx / d) * min;
          h.pos.z = c.z + (dz / d) * min;
        }
      }
    const on = this.walkable(h.pos.x, h.pos.z);
    if (h.grounded && !on) {
      h.grounded = false;
      this.audio.play('fall');
    }
    if (!h.grounded && h.pos.y <= 0 && h.vel.y <= 0 && on && h.pos.y > -0.45) {
      h.pos.y = 0;
      h.vel.y = 0;
      h.grounded = true;
    }
    if (h.pos.y < -20) this.respawn();
    const sp = Math.hypot(h.vel.x, h.vel.z);
    if (free) {
      // he faces the hour he walks to
      let dy = this.view - h.yaw;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      h.yaw += dy * damp(12, dt);
    } else if (sp > 0.4) {
      const target = Math.atan2(h.vel.x, h.vel.z);
      let dy = target - h.yaw;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      h.yaw += dy * damp(12, dt);
      this.turning = false;
    } else if (this.turning) {
      // he has just turned round and stands still: the robot turns on the spot to face the road the view now shows
      let dy = this.heading() - h.yaw;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      h.yaw += dy * damp(7, dt);
      if (Math.abs(dy) < 0.03) this.turning = false;
    }
    if (h.grounded) this.onGround();
  }

  respawn() {
    const h = this.hero;
    h.pos.copy(this.respawnPoint()).setY(6);
    h.vel.set(0, 0, 0);
    this.facing = 1;
    h.grounded = false;
    this.set({ falls: this.state.falls + 1 });
    this.onFall();
    this.particles.burst(h.pos.clone(), 0xffffff, 30, 3, 1, 0.8);
  }

  updateInteract() {
    const h = this.hero;
    let best = null;
    let bd = 1e9;
    let label = null;
    if (h.grounded)
      for (const it of this.interactables) {
        const d = Math.hypot(h.pos.x - it.x, h.pos.z - it.z);
        if (d < it.r && d < bd) {
          const p = it.prompt();
          if (p) {
            best = it;
            bd = d;
            label = p;
          }
        }
      }
    // a world that names its next place (`guideAt()`, opt-in) keeps the « E » bubble over it from any distance — the
    // world is big, and he must see where the next round is without walking about (owner, 2026-11-25); E acts only near
    let shown = best;
    if (!best && h.grounded && this.guideAt) {
      const g = this.guideAt();
      const p = g?.prompt();
      if (p) {
        shown = g;
        label = p;
      }
    }
    this.activeIt = best;
    this.promptIt = shown;
    if (label !== this.state.prompt) this.set({ prompt: label });
    if (this.input.take('act') && best) best.act();
  }

  updateGems(dt) {
    const h = this.hero;
    for (const g of this.gems) {
      if (g.taken) continue;
      g.mesh.rotation.y += dt * 2.2;
      g.mesh.position.y = g.y + Math.sin(this.time * 2 + g.mesh.position.x) * 0.15;
      if (
        Math.hypot(h.pos.x - g.mesh.position.x, h.pos.z - g.mesh.position.z) < 0.95 &&
        Math.abs(h.pos.y + 0.9 - g.mesh.position.y) < 0.85
      ) {
        g.taken = true;
        this.scene.remove(g.mesh);
        this.takenGems.add(g.id);
        this.audio.play('crystal');
        this.particles.burst(g.mesh.position, 0x5ff2ff, 16, 3, 2, 0.7);
        this.set({ gems: this.takenGems.size });
      }
    }
  }

  updateCamera(dt) {
    const h = this.hero;
    const ph = this.state.phase;
    const cur = Math.atan2(this.camDir.x, this.camDir.y);
    const free = this.freeLook();
    let dy = (free ? (this.view ?? this.heading()) : this.heading()) - cur;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    // a turn round (he walks back, or forward again) is quicker than the slow swing from one island's road to the next;
    // a view that follows him in every direction stays close behind his turn
    const ny = cur + dy * damp(free ? 3.2 : Math.abs(dy) > 1.3 ? 4.2 : 1.6, dt);
    this.camDir.set(Math.sin(ny), Math.cos(ny));
    const want = new THREE.Vector3();
    const look = new THREE.Vector3();
    let k = 4.5;
    const shot = this.cameraShot(ph);
    if (shot) {
      want.copy(shot.pos);
      look.copy(shot.look);
      k = shot.k;
    } else {
      want.set(h.pos.x - this.camDir.x * 10.5, Math.max(0, h.pos.y) + 7.6, h.pos.z - this.camDir.y * 10.5);
      look.set(h.pos.x + this.camDir.x * 2.5, Math.max(-2, h.pos.y) + 1.2, h.pos.z + this.camDir.y * 2.5);
    }
    this.camPos.lerp(want, damp(k, dt));
    this.camLook.lerp(look, damp(k * 1.3, dt));
    // a tree standing between the camera and the robot ducks down; a sign too close to the lens hides
    const follow = this.followsHero(ph);
    const cx = this.camPos.x;
    const cz = this.camPos.z;
    const hx = h.pos.x - cx;
    const hz = h.pos.z - cz;
    const l2 = hx * hx + hz * hz || 1;
    for (const o of this.occluders) {
      let target = 1;
      if (follow && !this.cine) {
        const t = ((o.x - cx) * hx + (o.z - cz) * hz) / l2;
        if (t > 0.02 && t < 0.93 && Math.hypot(o.x - (cx + hx * t), o.z - (cz + hz * t)) < 2.7) target = 0.14;
      }
      if (Math.abs(o.s - target) > 0.005) {
        o.s += (target - o.s) * damp(9, dt);
        o.obj.scale.setScalar(o.s);
      }
    }
    for (const sg of this.signs) sg.obj.visible = !follow || Math.hypot(sg.x - cx, sg.z - cz) > 7.5;
    this.camera.position.copy(this.camPos);
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt);
      this.camera.position.x += (Math.random() - 0.5) * this.shake * 0.8;
      this.camera.position.y += (Math.random() - 0.5) * this.shake * 0.8;
    }
    this.camera.lookAt(this.camLook);
    const fovT = this.fov();
    if (Math.abs(this.camera.fov - fovT) > 0.1) {
      this.camera.fov += (fovT - this.camera.fov) * damp(3, dt);
      this.camera.updateProjectionMatrix();
    }
  }

  updateSky(dt) {
    const tgt = this.skyTarget();
    const k = damp(0.5, dt);
    const cA = new THREE.Color();
    const cB = new THREE.Color();
    for (let i = 0; i < 3; i += 1) {
      cA.set(this.skyNow[i]);
      cB.set(tgt[i]);
      cA.lerp(cB, k);
      this.skyNow[i] = cA.getHex();
    }
    for (let i = 3; i < 6; i += 1) this.skyNow[i] += (tgt[i] - this.skyNow[i]) * k;
    const u = this.sky.material.uniforms;
    u.top.value.set(this.skyNow[0]);
    u.bottom.value.set(this.skyNow[1]);
    u.night.value = this.skyNow[5];
    this.scene.fog.color.set(this.skyNow[1]).lerp(cA.set(this.skyNow[0]), 0.25);
    this.sun.color.set(this.skyNow[2]);
    this.sun.intensity = this.skyNow[3];
    this.hemi.intensity = this.skyNow[4];
    this.hemi.color.set(this.skyNow[1]).lerp(cB.set(0xffffff), 0.55);
    this.sky.position.copy(this.camera.position);
    this.applyLight();
  }

  /** The sun, its shadow box and the fog, from the world's hooks (K-f) — every frame; a change re-fits the cameras. */
  applyLight() {
    const box = this.shadowBox();
    const at = box.at ?? this.hero.pos;
    this.sun.target.position.set(at.x, 0, at.z);
    this.sun.position.copy(this.sun.target.position).addScaledVector(this.sunDir(), box.distance);
    this.fitShadow(box);
    const [near, far] = this.fogRange();
    this.scene.fog.near = near;
    this.scene.fog.far = far;
    const see = Math.max(FAR_MIN, far * 2);
    if (this.camera.far !== see) {
      this.camera.far = see;
      this.camera.updateProjectionMatrix();
    }
  }
  fitShadow({ half, near, far }) {
    const sc = this.sun.shadow.camera;
    if (sc.right === half && sc.near === near && sc.far === far) return;
    sc.left = -half;
    sc.right = half;
    sc.top = half;
    sc.bottom = -half;
    sc.near = near;
    sc.far = far;
    sc.updateProjectionMatrix();
  }

  loop(now) {
    if (this.dead) return;
    this.raf = requestAnimationFrame(this.loop);
    const raw = Math.max(0, (now - this.last) / 1000);
    this.last = now;
    // a full-screen page hides the world (« Mon labo », the exam sheet, « fiche de connaissances », « Ma progression »): nothing is simulated or
    // drawn behind it — the frames belong to the page (a tablet draws the lab's drags and fits a card's text, not an island
    // nobody sees)
    if (this.pausesWorld(this.state.overlay?.type)) return;
    const dt = Math.min(0.05, raw);
    this.adaptQuality(raw);
    this.step(dt);
    this.renderer.render(this.scene, this.camera);
    this.placePrompt();
    this.dodgeHero();
  }

  /** Zero on the screen, in the page's pixels — or null when he is not in front of the lens. */
  heroRect() {
    const box = (this.tmpBox ??= new THREE.Box3()).setFromObject(this.robot.group);
    if (box.isEmpty()) return null;
    const v = (this.tmpH ??= new THREE.Vector3());
    const base = this.canvas.getBoundingClientRect();
    let [l, t, r, b] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const x of [box.min.x, box.max.x])
      for (const y of [box.min.y, box.max.y])
        for (const z of [box.min.z, box.max.z]) {
          v.set(x, y, z).project(this.camera);
          if (v.z >= 1) return null;
          const px = base.left + (v.x * 0.5 + 0.5) * base.width;
          const py = base.top + (-v.y * 0.5 + 0.5) * base.height;
          l = Math.min(l, px);
          r = Math.max(r, px);
          t = Math.min(t, py);
          b = Math.max(b, py);
        }
    return { left: l, right: r, top: t, bottom: b };
  }

  /**
   * NOTHING WRITTEN COVERS ZERO (owner, 2026-11-27): the « E » prompt of the bottom centre steps to his side when he
   * stands there (`--dodge`), and his own sentence rises above his head (`--lift`). In steps of 8 px, so that his bob
   * does not make them tremble. The same button says whether the place is still far (`data-far`: no key to press yet).
   */
  dodgeHero() {
    const doc = this.canvas.ownerDocument;
    const act = doc.querySelector('[data-di-act]');
    const say = doc.querySelector('.di-say');
    if (!act && !say) return;
    const h = this.state.phase === 'play' || this.state.phase === 'dialog' ? this.heroRect() : null;
    const step = (px) => `${Math.round(px / 8) * 8}px`;
    if (act) {
      act.toggleAttribute('data-far', Boolean(this.promptIt && this.promptIt !== this.activeIt));
      const r = act.getBoundingClientRect();
      const base = this.canvas.getBoundingClientRect();
      const mid = base.left + base.width / 2;
      let dodge = 0;
      if (
        h &&
        r.bottom > h.top - 8 &&
        r.top < h.bottom + 8 &&
        mid + r.width / 2 > h.left - 12 &&
        mid - r.width / 2 < h.right + 12
      ) {
        const right = h.right + 12 + r.width / 2 - mid;
        const left = h.left - 12 - r.width / 2 - mid;
        // to the side that asks the shorter step — and stays on the screen
        dodge = Math.abs(left) < right && mid + left - r.width / 2 > base.left + 8 ? left : right;
      }
      act.style.setProperty('--dodge', step(dodge));
    }
    if (say) {
      const lift0 = parseFloat(say.style.getPropertyValue('--lift')) || 0;
      const r = say.getBoundingClientRect();
      // where it would stand with no lift
      const bottom = r.bottom + lift0;
      const top = r.top + lift0;
      let lift = 0;
      if (h && bottom > h.top - 8 && top < h.bottom && r.right > h.left && r.left < h.right)
        lift = bottom - (h.top - 12);
      // never up into the instruction: the top bar and one line are kept
      lift = Math.max(0, Math.min(lift, top - 130));
      say.style.setProperty('--lift', step(lift));
    }
  }

  /** Anchors the HUD's « E » bubble (an element handed over by the shell) above the thing the robot can use now. */
  placePrompt() {
    const el = this.promptEl;
    if (!el) return;
    const it = this.state.phase === 'play' ? (this.promptIt ?? this.activeIt) : null;
    if (!it || !this.state.prompt) {
      el.style.visibility = 'hidden';
      return;
    }
    const v = this.tmpV ?? (this.tmpV = new THREE.Vector3());
    v.set(it.x, it.y, it.z).project(this.camera);
    // the guided place behind him: the bubble waits at the bottom edge, on the side he must turn to
    const behind = v.z >= 1 && it !== this.activeIt;
    if (behind) v.set(-v.x, -1, 0);
    el.toggleAttribute('data-far', it !== this.activeIt);
    const w = this.canvas.clientWidth;
    const hgt = this.canvas.clientHeight;
    // never cut by the window's edge: the bubble's own half-width, not a fixed margin (a far place's bubble is wide)
    const edge = Math.max(150, el.offsetWidth / 2 + 12);
    const x = Math.max(edge, Math.min(w - edge, (v.x * 0.5 + 0.5) * w));
    let y = Math.max(150, Math.min(hgt - 150, (-v.y * 0.5 + 0.5) * hgt));
    // the bubble never covers THE INSTRUCTION (it stays on screen, GAME_WORLD.md §2ter-1): when the thing to use stands
    // behind it — a tall instruction at 1024×768 — the bubble drops just under it
    // — and never what the world has just answered either: the purse, the sign of a bridge, the equation and its verdict
    // (2026-11-20: after a refusal, at the light platform, the bubble sat on « 85 = 3 × 28 + 1 »)
    // — a world marks anything else it shows in the middle `data-di-clear` (the rod in his hand, in « Le palais des dalles »)
    const base = this.canvas.getBoundingClientRect();
    const half = el.offsetWidth / 2;
    for (const box of el.ownerDocument.querySelectorAll(
      '[data-di-instruction], [data-di-clear], .di-purse, .di-sign, .di-eq, .di-verdict',
    )) {
      const r = box.getBoundingClientRect();
      if (!r.width) continue;
      const under = r.bottom - base.top + 8 + el.offsetHeight;
      if (x + half > r.left - base.left && x - half < r.right - base.left && y < under) y = under;
    }
    el.style.visibility = v.z < 1 || behind ? 'visible' : 'hidden';
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
  }

  /**
   * A slow machine first loses the retina resolution, then the shadows — the game stays playable on a school laptop.
   * It drops the shadow MAP only: a shadow a world draws as a mesh (one that carries mathematics, K-f) stays.
   */
  adaptQuality(raw) {
    if (this.quality === 0 || raw > 0.5) return;
    this.frameAvg = this.frameAvg == null ? raw : this.frameAvg * 0.95 + raw * 0.05;
    this.frameCount = (this.frameCount ?? 0) + 1;
    if (this.frameCount < 90 || this.frameAvg < 0.03) return;
    this.quality = (this.quality ?? 2) - 1;
    this.frameCount = 0;
    this.frameAvg = null;
    if (this.quality === 1) {
      this.renderer.setPixelRatio(1);
      this.resize();
    } else {
      this.renderer.shadowMap.enabled = false;
      this.sun.castShadow = false;
      this.scene.traverse((o) => {
        if (o.material) o.material.needsUpdate = true;
      });
    }
  }

  /** One simulation step (also used by the tests to fast-forward the world). */
  step(dt) {
    this.time += dt;
    for (let i = this.tweens.length - 1; i >= 0; i -= 1) {
      const tw = this.tweens[i];
      tw.t += dt;
      const p = Math.min(1, tw.t / tw.d);
      tw.fn(tw.e(p));
      if (p >= 1) {
        this.tweens.splice(i, 1);
        tw.res();
      }
    }
    const ph = this.state.phase;
    const h = this.hero;
    if (ph === 'play') {
      this.updateHero(dt);
      this.updateInteract();
    } else if (!this.stepPhase(ph, dt)) {
      h.vel.x *= 0.8;
      h.vel.z *= 0.8;
    }
    if (ph !== 'play') {
      this.input.take('act');
      this.input.take('jump');
      if (!this.lanesLive(ph)) {
        this.input.take('left');
        this.input.take('right');
      }
    }
    this.updateGems(dt);
    const pose = this.robotPose(ph);
    this.robot.group.position.copy(h.pos);
    this.robot.group.position.y += pose.lift;
    this.robot.group.rotation.y = h.yaw;
    this.robot.update(dt, {
      speed: pose.speed ?? Math.hypot(h.vel.x, h.vel.z),
      vy: h.vel.y,
      air: !h.grounded,
      sad: pose.sad,
    });
    this.stepWorld(dt, ph);
    for (const c of this.clouds) {
      if (c.userData.v) {
        c.position.x += c.userData.v * dt;
        if (c.position.x > h.pos.x + 380) c.position.x -= 760;
      } else c.position.y += Math.sin(this.time * 0.4 + c.userData.bob) * 0.004;
    }
    this.particles.update(dt);
    this.updateCamera(dt);
    this.updateSky(dt);
  }

  dispose() {
    this.dead = true;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.input.dispose();
    this.audio.dispose();
    disposeScene(this.scene);
    this.renderer.dispose();
    this.listeners.clear();
  }
}

// The flows that touch no 3D — the hub, « fiche de connaissances », « brevet blanc », the evidence — live in `lessonFlows.js`:
// the world's runtime and the runtime of the lesson's tools opened WITHOUT a world (`ToolsRuntime.js`) run the same code.
Object.assign(WorldRuntime.prototype, LESSON_FLOWS);
