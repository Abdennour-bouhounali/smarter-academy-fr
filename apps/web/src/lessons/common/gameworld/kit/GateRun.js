/**
 * THE RAIL OF LIGHT — the gate run every world can open (it names no world and no lesson): two glowing rails, a floor of
 * light with its sleepers and its two lane lines, three arches of light with a veil, the robot on its board seen from
 * behind, a trail of sparks. The robot stays where the rail starts; the sleepers and the gates come to him. He picks
 * his lane with ← → (or the two buttons of the screen); Space pauses.
 *
 * A world owns ONE `GateRun` and passes it the hooks of its runtime:
 *
 *   buildWorld()            this.gateRun = new GateRun(this, { x, y, z, … });  this.gateRun.build();
 *   stepWorld(dt, ph)       if (ph === 'run') this.gateRun.step(dt);
 *   lanesLive(ph)           ph === 'run'
 *   robotPose(ph)           ph === 'run' ? this.gateRun.pose() ?? super.robotPose(ph) : …
 *   cameraShot(ph)          ph === 'run' ? this.gateRun.camera() : …
 *   dispose()               this.gateRun.dispose()
 *
 * THE CONTENT is the lesson's, given to `open(content)`:
 *
 *   { levels: [{ name, from }], gates, round(level, random, n) → { ask, tex?, options: [{ t } | { tex }] × 3, right, why: [3],
 *     seconds?, figure? }, total? }
 *
 * `figure` (optional) is a GeoFigure spec — the drawing of a round that names points: `state.run.figure` (null without
 * it), drawn by the HUD in its own panel (`kit/trainerFigure.js › runFigure`). A world without figures is unchanged.
 *
 * `seconds` (optional) is the time the round needs — the lesson's estimate of the thinking, plus a margin: its gate is
 * placed that many seconds of travel ahead, never closer than `gap`; the run's option `warmup` adds seconds before the
 * first gate. A round without it is one `gap` ahead, as before.
 *
 * `gates` right answers raise the level. WITHOUT `total` the run has no end but the last heart (« the number race »); WITH
 * `total` it is a COURSE of that many gates: it ends when the last one is passed (`won: true`) — or with the last heart.
 * What the screen reads is `state.run` (`kit/GateRunHud.jsx` draws it); the world decides what an end means in
 * `onOver(result) → extra fields of the « over » card`.
 *
 * TWO OPTIONS change the look and add one rule (kit work K-b, `PYRAMIDS_WORLD_PLAN.md` §1.3). Without them a world gets
 * the rail of light and its rules exactly as before (`gateRun.test.js` pins both):
 *
 *   skin: { name, track(), rider(), gate(lane), lanes?, labelY?, bob?, camera?: { back, up, ahead, look } }
 *     — the world's meshes. `track()` replaces the rail (its `userData.flow(step, dt)` scrolls what passes by, its
 *     `userData.tick(dt, t)` animates); `rider()` replaces the hoverboard (built along +z like it, its origin where the
 *     hero stands, `userData.deck` the height of his feet); `gate(lane)` replaces an arch (`userData.dress(state)` with
 *     state 'idle' | 'taken' (his, the right one) | 'picked' (his, not the right one) | 'right' (the right one, not his) |
 *     'other'). `lanes` is the distance between two lanes (2.5 on the rail), `labelY` the height of the numbers (4.3),
 *     `bob` the swell of the rider, `lead` how far ahead of him a gate and an obstacle are DRAWN when they reach him
 *     (a boat's prow meets its buoy; 0 on the rail, where he passes under the arch).
 *   hazards: { mesh(), every?: 1, cost?: 1, react?: 0.9 }
 *     — one obstacle in one lane between two gate rows, every `every` gates (`hazardPlan`). Touching it costs `cost`
 *     hearts and shakes the rider; the question is never changed; the last heart ends the run (lost: « again » restarts
 *     the leg). It sits halfway between two gates and never closer to a gate than `react` seconds of travel, so the right
 *     gate is always reachable after it. On screen: `run.hazard` (its lane, or null once passed) and `run.bumps`.
 */
import * as THREE from 'three';
import { glow, makeHoverboard } from '../engine/builders';

const LANES = [-2.5, 0, 2.5];
const CAMERA = { back: 7.5, up: 4.4, ahead: 9, look: 1.4 };

/**
 * Where the obstacle of a gap goes: HALFWAY between the gate just passed and the next (the same place whatever its lane,
 * so where it sits tells nothing of the answer), in any lane — the right one too, since from there he has at least
 * `react` seconds to come back to it. Too fast for that, the gap has no obstacle (null).
 */
export function hazardPlan({ gap, speed, random, react = 0.9 }) {
  const before = gap / 2;
  if (!(speed > 0) || before / speed < react) return null;
  return { lane: Math.min(2, Math.floor(random() * 3)), before };
}
/**
 * The pace of the rail when a world sets none (metres a second): faster than the first lesson's run from the first gate
 * (owner, 2026-11-20: « the game is too slow »), and it keeps rising. Exported for a world that sets its own pace for one
 * kind of run only (`nilePyramids/Game.js`: a practice level sails at its level's speed, a leg at this one).
 */
export const railSpeed = (level, score) => Math.min(17, 10.5 + 0.7 * (level - 1) + 0.05 * score);
const DEFAULTS = {
  y: 0.3,
  gap: 34,
  hearts: 3,
  pause: 2.4,
  speedOf: railSpeed,
  onOver: () => ({}),
};

export class GateRun {
  constructor(game, opts) {
    this.game = game;
    this.o = { ...DEFAULTS, ...opts };
    this.runner = null;
    this.content = null;
    this.els = [null, null, null]; // the three numbers of the gate ahead: text of the page, placed every frame
    this.tmp = new THREE.Vector3();
    const skin = this.o.skin;
    this.L = skin?.lanes ? LANES.map((v) => (v / 2.5) * skin.lanes) : LANES;
    this.t = 0;
    this.lead = skin?.lead ?? 0;
  }
  laneZ(lane) {
    return this.o.z + this.L[lane];
  }
  build() {
    const { x, y, z } = this.o;
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.visible = false;
    const skin = this.o.skin;
    if (skin) {
      this.skinTrack = skin.track();
      g.add(this.skinTrack);
    } else this.buildRail(g);
    // two sets of arches take turns, so the next gate is already ahead when one is passed
    this.sets = [0, 1].map(() => {
      const set = new THREE.Group();
      set.visible = false;
      set.userData.arches = this.L.map((v, lane) => (skin ? this.skinGate(set, v, lane) : this.arch(set, v)));
      g.add(set);
      return set;
    });
    this.hazards = this.o.hazards
      ? [0, 1].map(() => {
          const m = this.o.hazards.mesh();
          m.visible = false;
          g.add(m);
          return m;
        })
      : [];
    this.board = skin ? skin.rider() : makeHoverboard();
    this.board.visible = false;
    this.game.scene.add(this.board, g);
    this.track = g;
    this.onHidden = () => document.visibilityState === 'hidden' && this.pause(true);
    document.addEventListener('visibilitychange', this.onHidden);
    if (import.meta.env?.DEV && typeof window !== 'undefined') window.__gateRun = this.debug();
  }
  /** The rail of light (the default look): two glowing rails, the floor, its sleepers, its two lane lines. */
  buildRail(g) {
    const LEN = 150;
    const mid = LEN / 2 - 16;
    for (const v of [-3.8, 3.8]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(LEN, 0.12, 0.16), glow(0x35d8f0, 0.8));
      rail.position.set(mid, 0, v);
      g.add(rail);
    }
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(LEN, 0.05, 7.5),
      new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.1, depthWrite: false }),
    );
    floor.position.set(mid, -0.05, 0);
    g.add(floor);
    this.sleepers = new THREE.Group();
    const sleeper = new THREE.MeshBasicMaterial({ color: 0xd8f6ff, transparent: true, opacity: 0.5 });
    for (let k = 0; k < Math.floor(LEN / 4); k += 1) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 7.6), sleeper);
      s.position.set(k * 4 - 14, -0.02, 0);
      this.sleepers.add(s);
    }
    g.add(this.sleepers);
    for (const v of [-1.25, 1.25]) {
      const ln = new THREE.Mesh(
        new THREE.BoxGeometry(LEN, 0.02, 0.05),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }),
      );
      ln.position.set(mid, 0, v);
      g.add(ln);
    }
  }
  /** One arch of light with its veil (the default gate). */
  arch(set, v) {
    const a = new THREE.Group();
    a.position.set(0, 0, v);
    const mat = glow(0x6f9dff, 0.6);
    for (const sz of [-1.05, 1.05]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.0, 0.14), mat);
      post.position.set(0, 1.5, sz);
      a.add(post);
    }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 2.24), mat);
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
    veil.rotation.y = Math.PI / 2;
    veil.position.y = 1.5;
    a.add(veil);
    set.add(a);
    return { mat, veil };
  }
  /** One gate of the world's skin (a buoy, …) in its lane. */
  skinGate(set, v, lane) {
    const obj = this.o.skin.gate(lane);
    obj.position.set(0, 0, v);
    set.add(obj);
    return { obj };
  }
  dispose() {
    document.removeEventListener('visibilitychange', this.onHidden);
    if (typeof window !== 'undefined' && window.__gateRun?.run === this) delete window.__gateRun;
  }
  /**
   * The dev handle of a walk (`window.__gateRun`, development only): where he is, his hearts, the obstacle ahead and the
   * gate ahead, in metres from him and in seconds — so a walk dodges deterministically. Never the right gate.
   */
  debug() {
    const run = this;
    const ahead = (dx) => ({ dx, s: run.speed() ? dx / run.speed() : null });
    return {
      run,
      get skin() {
        return run.o.skin?.name ?? 'rail';
      },
      get lane() {
        return run.runner?.lane ?? null;
      },
      get hearts() {
        return run.runner?.hearts ?? null;
      },
      get bumps() {
        return run.runner?.bumps ?? 0;
      },
      get speed() {
        return run.speed();
      },
      get gate() {
        const r = run.runner;
        return r ? { n: r.n, ...ahead(r.x) } : null;
      },
      get hazard() {
        const h = run.runner?.hz;
        return h && !h.done ? { lane: h.lane, ...ahead(h.m.position.x - run.lead) } : null;
      },
    };
  }
  dress(set, good = null, picked = null) {
    if (this.o.skin) {
      set.userData.arches.forEach(({ obj }, lane) => {
        const state =
          good == null
            ? 'idle'
            : lane === picked
              ? lane === good
                ? 'taken'
                : 'picked'
              : lane === good
                ? 'right'
                : 'other';
        obj.userData.dress?.(state);
      });
      return;
    }
    set.userData.arches.forEach((ar, lane) => {
      const c = good == null ? 0x6f9dff : lane === good ? 0x2fe37a : 0xff6b81;
      ar.mat.color.set(c);
      ar.mat.emissive.set(c);
      ar.veil.material.color.set(good == null ? 0x8fb8ff : c);
      ar.veil.material.opacity = good == null ? 0.16 : lane === good ? 0.35 : lane === picked ? 0.3 : 0.12;
    });
  }
  /** What the world adds to every state of the run (its best score, …). */
  extra() {
    return this.o.extra?.() ?? {};
  }
  /** The rail appears with the robot on it, and the run's card: its rule first, then « Je commence ». */
  open(content) {
    const game = this.game;
    this.content = content;
    game.audio.unlock();
    this.track.visible = true;
    this.board.visible = true;
    game.hero.pos.set(this.o.x, this.o.y, this.laneZ(1));
    game.hero.vel.set(0, 0, 0);
    game.hero.yaw = Math.PI / 2;
    this.sets.forEach((set) => (set.visible = false));
    this.runner = null;
    game.set({
      phase: 'run',
      overlay: null,
      prompt: null,
      run: { stage: 'ready', total: content.total ?? null, ...this.extra() },
    });
  }
  start() {
    const game = this.game;
    game.audio.startMusic();
    game.audio.fast = true;
    game.input.clear();
    this.sets.forEach((set) => (set.visible = false));
    this.runner = {
      lane: 1,
      v: 0,
      x: this.o.gap,
      set: 1,
      level: 1,
      score: 0,
      streak: 0,
      hearts: this.o.hearts,
      coins: 0,
      pause: 0,
      round: null,
      n: 0,
      bumps: 0,
      jolt: 0,
      hz: null,
    };
    this.hazards.forEach((m) => (m.visible = false));
    this.next(true);
  }
  levelOf(level) {
    const L = this.content.levels;
    return L[Math.min(level, L.length) - 1];
  }
  publish(extra = {}) {
    const r = this.runner;
    const L = this.levelOf(r.level);
    this.game.set({
      run: {
        ...this.extra(),
        stage: 'go',
        ask: r.round.ask,
        tex: r.round.tex ?? null,
        figure: r.round.figure ?? null,
        options: r.round.options,
        lane: r.lane,
        hearts: r.hearts,
        score: r.score,
        streak: r.streak,
        coins: r.coins,
        level: r.level,
        levelName: L.name,
        from: L.from,
        n: r.n,
        total: this.content.total ?? null,
        ...(this.o.hazards ? { hazard: r.hz && !r.hz.done ? r.hz.lane : null, bumps: r.bumps } : {}),
        ...extra,
      },
    });
  }
  /**
   * The next gate, on the other set of arches: the one just passed keeps going behind him. A round that says how long it
   * takes (`seconds`: thinking time and a margin, the lesson's estimate) is placed that many seconds of travel ahead —
   * never closer than one gap (owner, 2026-11-25: « the question is complex and needs more time »); the FIRST gate gets
   * `warmup` seconds more. A round without `seconds` keeps the gap.
   */
  next(first = false) {
    const r = this.runner;
    r.round = this.content.round(r.level, Math.random, r.n);
    const s = r.round.seconds;
    const gap = s > 0 ? Math.max(this.o.gap, this.speed() * s) : this.o.gap;
    const at = first ? gap + 10 + this.speed() * (this.o.warmup ?? 0) : gap;
    r.gap = gap; // the obstacle sits halfway along THIS spacing (the first gate's lead-in is not part of it)
    r.set = 1 - r.set;
    r.x = at;
    r.n += 1;
    const set = this.sets[r.set];
    set.visible = true;
    set.position.x = at + this.lead;
    this.dress(set);
    this.placeHazard(at);
    this.publish();
  }
  /** The obstacle of the gap before the gate at `at`: one of the two meshes, the other one keeps going behind him. */
  placeHazard(at) {
    const hz = this.o.hazards;
    const r = this.runner;
    if (!hz) return;
    r.hz = null;
    if ((r.n - 1) % (hz.every ?? 1) !== 0) return;
    const plan = hazardPlan({ gap: r.gap ?? this.o.gap, speed: this.speed(), random: Math.random, react: hz.react });
    if (!plan) return;
    const m = this.hazards[r.n % 2];
    m.visible = true;
    m.position.set(at - plan.before + this.lead, 0, this.L[plan.lane]);
    r.hz = { lane: plan.lane, m, done: false };
  }
  /** The obstacle reaches him: in his lane it costs a heart and shakes him — the gate and its question stay. */
  meetHazard() {
    const game = this.game;
    const r = this.runner;
    const h = r.hz;
    h.done = true;
    if (h.lane !== r.lane) {
      this.publish();
      return;
    }
    r.hearts -= this.o.hazards.cost ?? 1;
    r.bumps += 1;
    r.jolt = 0.6;
    game.shake = 0.5;
    game.audio.play('hit');
    game.particles.burst(game.hero.pos.clone().setY(this.o.y + 0.4), 0xeaf6ff, 30, 4, 2.5, 0.8);
    if (r.hearts <= 0) {
      this.end();
      return;
    }
    this.publish();
  }
  /** « Pause »: the run freezes where it is — the gate, the speed, the hearts — until he comes back to it. */
  pause(on = true) {
    const r = this.runner;
    if (!r || r.pause > 0 || Boolean(r.held) === on) return;
    r.held = on;
    this.game.audio.fast = !on;
    this.game.input.clear();
    this.publish(on ? { stage: 'paused' } : {});
  }
  /** His lane, from the keys or from the two buttons of the screen: -1 is left, +1 is right. */
  lane(d) {
    const r = this.runner;
    if (!r || r.pause > 0 || this.game.state.run?.stage !== 'go') return;
    const lane = Math.max(0, Math.min(2, r.lane + d));
    if (lane === r.lane) return;
    r.lane = lane;
    this.game.audio.play('lane');
    this.publish();
  }
  speed() {
    const r = this.runner;
    return r ? this.o.speedOf(r.level, r.score) : 0;
  }
  /** Is the course over after the gate just judged? (a run without `total` never is) */
  last() {
    const total = this.content.total;
    return total != null && this.runner.n >= total;
  }
  step(dt) {
    const game = this.game;
    const r = this.runner;
    const h = game.hero;
    const { x, y, z } = this.o;
    const skin = this.o.skin;
    h.yaw = Math.PI / 2;
    h.pos.x = x;
    h.pos.y = y;
    if (r) {
      r.v += (this.L[r.lane] - r.v) * Math.min(1, dt * 14);
      h.pos.z = z + r.v;
    }
    if (skin) this.ride(dt);
    else {
      this.board.position.set(h.pos.x, y + 0.05, h.pos.z);
      this.board.rotation.y = Math.PI / 2;
      this.board.rotation.z = r ? (LANES[r.lane] - r.v) * -0.25 : 0;
    }
    if (!r) return;
    // Space pauses and resumes; a run left alone (the page hidden) pauses by itself
    if (game.input.take('jump')) this.pause(!r.held);
    if (r.held) {
      game.input.take('left');
      game.input.take('right');
      this.place();
      return;
    }
    if (game.input.take('left')) this.lane(-1);
    if (game.input.take('right')) this.lane(1);
    if (r.pause > 0) {
      // a gate that was not the right one: the run stops while its fact is read, then it goes on — or ends
      r.pause -= dt;
      if (r.pause <= 0) {
        if (r.hearts <= 0 || this.last()) this.end();
        else this.next();
      }
      this.place();
      return;
    }
    const step = this.speed() * dt;
    r.x -= step;
    if (this.sleepers) this.sleepers.position.x = (this.sleepers.position.x - step) % 4;
    else this.skinTrack.userData.flow?.(step, dt);
    for (const m of this.hazards) {
      if (!m.visible) continue;
      m.position.x -= step;
      if (m.position.x < -12) m.visible = false;
    }
    if (r.hz && !r.hz.done && r.hz.m.position.x - this.lead <= 0) {
      this.meetHazard();
      if (!this.runner) return;
    }
    this.sets.forEach((set, k) => {
      if (k === r.set) set.position.x = r.x + this.lead;
      else {
        set.position.x -= step;
        if (set.position.x < -12) set.visible = false;
      }
    });
    // the trail warms up with the streak
    if (Math.random() < dt * 40)
      game.particles.burst(
        h.pos.clone().setY(y),
        r.streak >= 5 ? 0xffc12e : r.streak >= 3 ? 0xff9de0 : 0x7dfcff,
        r.streak >= 3 ? 2 : 1,
        1,
        0.2,
        0.5,
      );
    if (r.x <= 0) this.judge();
    this.place();
  }
  /** The world's rider (a boat, …) under him: the swell, the lean of a lane change, the jolt of an obstacle. */
  ride(dt) {
    const r = this.runner;
    const h = this.game.hero;
    const skin = this.o.skin;
    const rider = this.board;
    this.t += dt;
    const t = this.t;
    if (r) r.jolt = Math.max(0, r.jolt - dt);
    const jolt = r?.jolt ? Math.sin(r.jolt * 60) * 0.35 * (r.jolt / 0.6) : 0;
    const bob = (skin.bob ?? 0) * Math.sin(t * 2.4);
    rider.position.set(h.pos.x, this.o.y + bob, h.pos.z + jolt);
    rider.rotation.set(0, Math.PI / 2, r ? (this.L[r.lane] - r.v) * -0.08 + jolt * 0.2 : 0);
    h.pos.y = this.o.y + (rider.userData.deck ?? 0) + bob;
    h.pos.z += jolt;
    rider.userData.tick?.(dt, t);
    this.skinTrack.userData.tick?.(dt, t);
    for (const m of this.hazards) if (m.visible) m.userData.tick?.(dt, t);
    for (const set of this.sets) if (set.visible) for (const { obj } of set.userData.arches) obj.userData.tick?.(dt, t);
  }
  judge() {
    const game = this.game;
    const r = this.runner;
    const ok = r.lane === r.round.right;
    this.dress(this.sets[r.set], r.round.right, r.lane);
    if (ok) {
      r.score += 1;
      r.streak += 1;
      r.coins += r.level;
      game.audio.play('gate');
      if (r.streak >= 3) game.audio.play('star', Math.min(r.streak - 2, 4));
      game.particles.burst(game.hero.pos.clone().setY(1.5), 0x8dffb0, 36, 6, 2, 0.9);
      game.robot.cheer();
      if (this.last()) {
        this.end();
        return;
      }
      const up = r.score % this.content.gates === 0 && r.level < this.content.levels.length;
      if (up) {
        r.level += 1;
        game.audio.play('success');
      }
      this.next();
      this.publish({ ok: r.n - 1, up });
      return;
    }
    r.hearts -= 1;
    r.streak = 0;
    r.pause = this.o.pause;
    game.shake = 0.5;
    game.audio.play('hit');
    game.particles.burst(game.hero.pos.clone().setY(1.2), 0xff6b81, 30, 5, 2, 0.8);
    this.publish({ stage: 'hit', why: r.round.why[r.lane], picked: r.lane, right: r.round.right });
  }
  end() {
    const game = this.game;
    const r = this.runner;
    const total = this.content.total ?? null;
    const result = {
      score: r.score,
      level: r.level,
      coins: r.coins,
      hearts: r.hearts,
      total,
      won: total != null && r.hearts > 0,
      ...(this.o.hazards ? { bumps: r.bumps } : {}),
    };
    game.audio.fast = false;
    if (result.won) game.audio.play('success');
    this.sets.forEach((set) => (set.visible = false));
    this.hazards.forEach((m) => (m.visible = false));
    this.runner = null;
    const over = this.o.onOver(result) ?? {};
    game.set({
      run: { stage: 'over', levelName: this.levelOf(result.level).name, ...result, ...this.extra(), ...over },
    });
  }
  /** The rail goes away (the world puts the robot back where it wants, and its own phase). */
  hide() {
    this.runner = null;
    this.game.audio.fast = false;
    this.track.visible = false;
    this.board.visible = false;
    this.hazards.forEach((m) => (m.visible = false));
  }
  /** The numbers of the gate ahead, over its three arches: TEXT of the page (a real fraction bar, a reading size). */
  place() {
    const r = this.runner;
    const canvas = this.game.canvas;
    const w = canvas.clientWidth;
    const hgt = canvas.clientHeight;
    const v = this.tmp;
    this.els.forEach((el, lane) => {
      if (!el) return;
      if (!r) {
        el.style.visibility = 'hidden';
        return;
      }
      // a gate further than one gap (a round that takes time): its numbers wait one gap ahead, over their lanes, where
      // the three can be read apart — they meet the buoy when it comes within the gap
      // (at 60 % of the gap, not at the gap: there the lanes drew the three numbers touching — the walk, 2026-11-25)
      const near = Math.min(r.x, this.o.gap * (r.gap > this.o.gap ? 0.6 : 1));
      v.set(
        this.o.x + Math.max(near, 0.5) + this.lead,
        this.o.y + (this.o.skin?.labelY ?? 4.3),
        this.laneZ(lane),
      ).project(this.game.camera);
      const far = Math.max(0, Math.min(1, Math.min(r.x, this.o.gap) / this.o.gap));
      el.style.visibility = 'visible';
      el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * hgt}px) translate(-50%, -50%) scale(${1.25 - 0.6 * far})`;
    });
  }
  /** How the robot holds itself on the rail — null before the run starts (the world's own pose). */
  pose() {
    const r = this.runner;
    if (!r) return null;
    const stopped = r.pause > 0 || Boolean(r.held);
    return { lift: 0, speed: stopped ? 0 : this.speed(), sad: stopped || r.jolt > 0 };
  }
  /** The camera of the run: close behind him, leaning with his lane. */
  camera() {
    const { x, y, z } = this.o;
    const c = { ...CAMERA, ...this.o.skin?.camera };
    const off = (this.runner?.v ?? 0) * 0.7;
    return {
      pos: new THREE.Vector3(x - c.back, y + c.up, z + off),
      look: new THREE.Vector3(x + c.ahead, y + c.look, z + off),
      k: 8,
    };
  }
}
