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
 *   { levels: [{ name, from }], gates, round(level, random, n) → { ask, tex?, options: [{ t } | { tex }] × 3, right, why: [3] },
 *     total? }
 *
 * `gates` right answers raise the level. WITHOUT `total` the run has no end but the last heart (« the number race »); WITH
 * `total` it is a COURSE of that many gates: it ends when the last one is passed (`won: true`) — or with the last heart.
 * What the screen reads is `state.run` (`kit/GateRunHud.jsx` draws it); the world decides what an end means in
 * `onOver(result) → extra fields of the « over » card`.
 */
import * as THREE from 'three';
import { glow, makeHoverboard } from '../engine/builders';

const LANES = [-2.5, 0, 2.5];
const DEFAULTS = {
  y: 0.3,
  gap: 34,
  hearts: 3,
  pause: 2.4,
  // faster than the first lesson's run from the first gate (owner, 2026-11-20: « the game is too slow »), and it keeps rising
  speedOf: (level, score) => Math.min(17, 10.5 + 0.7 * (level - 1) + 0.05 * score),
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
  }
  laneZ(lane) {
    return this.o.z + LANES[lane];
  }
  build() {
    const { x, y, z } = this.o;
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.visible = false;
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
    // two sets of arches take turns, so the next gate is already ahead when one is passed
    this.sets = [0, 1].map(() => {
      const set = new THREE.Group();
      set.visible = false;
      set.userData.arches = LANES.map((v) => {
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
      });
      g.add(set);
      return set;
    });
    this.board = makeHoverboard();
    this.board.visible = false;
    this.game.scene.add(this.board, g);
    this.track = g;
    this.onHidden = () => document.visibilityState === 'hidden' && this.pause(true);
    document.addEventListener('visibilitychange', this.onHidden);
  }
  dispose() {
    document.removeEventListener('visibilitychange', this.onHidden);
  }
  dress(set, good = null, picked = null) {
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
    };
    this.next(this.o.gap + 10);
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
        ...extra,
      },
    });
  }
  /** The next gate, one gap ahead, on the other set of arches: the one just passed keeps going behind him. */
  next(at = this.o.gap) {
    const r = this.runner;
    r.round = this.content.round(r.level, Math.random, r.n);
    r.set = 1 - r.set;
    r.x = at;
    r.n += 1;
    const set = this.sets[r.set];
    set.visible = true;
    set.position.x = at;
    this.dress(set);
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
    h.yaw = Math.PI / 2;
    h.pos.x = x;
    h.pos.y = y;
    if (r) {
      r.v += (LANES[r.lane] - r.v) * Math.min(1, dt * 14);
      h.pos.z = z + r.v;
    }
    this.board.position.set(h.pos.x, y + 0.05, h.pos.z);
    this.board.rotation.y = Math.PI / 2;
    this.board.rotation.z = r ? (LANES[r.lane] - r.v) * -0.25 : 0;
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
    this.sleepers.position.x = (this.sleepers.position.x - step) % 4;
    this.sets.forEach((set, k) => {
      if (k === r.set) set.position.x = r.x;
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
    };
    game.audio.fast = false;
    if (result.won) game.audio.play('success');
    this.sets.forEach((set) => (set.visible = false));
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
      v.set(this.o.x + Math.max(r.x, 0.5), this.o.y + 4.3, this.laneZ(lane)).project(this.game.camera);
      const far = Math.max(0, Math.min(1, r.x / this.o.gap));
      el.style.visibility = 'visible';
      el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * hgt}px) translate(-50%, -50%) scale(${1.25 - 0.6 * far})`;
    });
  }
  /** How the robot holds itself on the rail — null before the run starts (the world's own pose). */
  pose() {
    const r = this.runner;
    if (!r) return null;
    const stopped = r.pause > 0 || Boolean(r.held);
    return { lift: 0, speed: stopped ? 0 : this.speed(), sad: stopped };
  }
  /** The camera of the run: close behind him, leaning with his lane. */
  camera() {
    const { x, y, z } = this.o;
    const off = (this.runner?.v ?? 0) * 0.7;
    return {
      pos: new THREE.Vector3(x - 7.5, y + 4.4, z + off),
      look: new THREE.Vector3(x + 9, y + 1.4, z + off),
      k: 8,
    };
  }
}
