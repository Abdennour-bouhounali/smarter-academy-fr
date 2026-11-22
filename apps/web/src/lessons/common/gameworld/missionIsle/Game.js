/**
 * « جزيرة المهمّات » — THE WORLD OF A UNIT'S LAST LESSON (« أدمج تعلّماتي », `INTEGRATION_LESSON_PLAN.md` §4): one island,
 * the oasis depot, and nothing to forge. The lesson gives its missions as DATA (`lesson.missions`); this world shows
 * them from the island's home, plays the one he opens (the scenes are the depot's: `divisorIsles/Depot.js`), keeps
 * what he finished (stars, coins) in his save, and opens the lesson's exam sitting (the bank, the kit's screen).
 * It names no lesson. The robot does not walk here: the island is the stage of the missions.
 */
import * as THREE from 'three';
import { WorldRuntime } from '../kit/WorldRuntime';
import { Depot } from '../divisorIsles/Depot';
import { glow, makeHoverboard } from '../engine/builders';

const SKY = [0x3a8dff, 0xcfeeff, 0xfff6e6, 2.6, 1.0, 0];
const MISSION_PAN = new THREE.Vector3(0, 2.4, 3.2); // the notebook and the paper stand on the two sides
const CENTRE = { x: -340, z: 280 };
// « سباق الأعداد »: the rail of light, out at sea beside the island. The robot stays at RUN.x; the gates come to him.
// The lanes, the gap between two gates and the hearts are those of lesson 1's run (`divisorIsles/logic.js › DASH`).
const RUN = { x: CENTRE.x - 10, z: CENTRE.z + 60, y: 0.3, lanes: [-2.5, 0, 2.5], gap: 34, hearts: 3, pause: 2.4 };
const laneZ = (lane) => RUN.z + RUN.lanes[lane];
// faster than lesson 1's run from the first gate (owner, 2026-11-20: « the game is too slow »), and it keeps rising
const speedOf = (level, score) => Math.min(17, 10.5 + 0.7 * (level - 1) + 0.05 * score);

export class MissionIsleGame extends WorldRuntime {
  initWorld(sv) {
    this.done = { ...(sv?.missions ?? {}) };
    this.best = sv?.endless?.best ?? 0;
    this.partial = { ...(sv?.partial ?? {}) }; // a mission left half-way: what his copy held (private, like the save)
  }
  worldState() {
    return {
      mission: null,
      missions: this.done,
      stars: {},
      islandName: this.lesson.text.island,
      run: null,
      partial: this.partial,
    };
  }
  worldSave() {
    return { missions: this.done, endless: { best: this.best }, partial: this.partial };
  }
  worldCentre() {
    return CENTRE;
  }
  buildWorld() {
    this.depot = new Depot(this);
    this.buildTrack();
  }

  // ───────────────────────────── « سباق الأعداد » — the endless game ─────────────────────────────
  /**
   * THE RAIL OF LIGHT — the gate run of the unit's first lesson, design for design (owner, 2026-11-20: « use 100% the same
   * design of the game of the lesson 1 »; `divisorIsles/Game.js › buildRail`): two glowing rails, a floor of light with its
   * sleepers and its two lane lines, arches of light with a veil, the robot on its board, a trail of sparks. Here the rail
   * has no end: the robot stays at RUN.x, the sleepers and the gates come to him. Two sets of arches take turns, so the
   * next gate is already ahead when one is passed.
   */
  buildTrack() {
    const g = new THREE.Group();
    g.position.set(RUN.x, RUN.y, RUN.z);
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
    this.gateSets = [0, 1].map(() => {
      const set = new THREE.Group();
      set.visible = false;
      set.userData.arches = RUN.lanes.map((v) => {
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
    this.scene.add(this.board);
    this.scene.add(g);
    this.track = g;
    this.gateEls = [null, null, null];
    this.onHidden = () => document.visibilityState === 'hidden' && this.pauseRun(true);
    document.addEventListener('visibilitychange', this.onHidden);
  }
  dispose() {
    document.removeEventListener('visibilitychange', this.onHidden);
    super.dispose();
  }
  dressGates(set, good = null, picked = null) {
    set.userData.arches.forEach((ar, lane) => {
      const c = good == null ? 0x6f9dff : lane === good ? 0x2fe37a : 0xff6b81;
      ar.mat.color.set(c);
      ar.mat.emissive.set(c);
      ar.veil.material.color.set(good == null ? 0x8fb8ff : c);
      ar.veil.material.opacity = good == null ? 0.16 : lane === good ? 0.35 : lane === picked ? 0.3 : 0.12;
    });
  }
  /** The door of the home: the game's card first (its rule, his best), then « أبدأ ». */
  openRun() {
    this.audio.unlock();
    this.track.visible = true;
    this.board.visible = true;
    this.hero.pos.set(RUN.x, RUN.y, laneZ(1));
    this.hero.yaw = Math.PI / 2;
    this.gateSets.forEach((set) => (set.visible = false));
    this.runner = null;
    this.set({ phase: 'run', overlay: null, run: { stage: 'ready', best: this.best } });
  }
  startRun() {
    this.audio.startMusic();
    this.audio.fast = true;
    this.input.clear();
    this.gateSets.forEach((set) => (set.visible = false));
    this.runner = {
      lane: 1,
      v: 0,
      x: RUN.gap,
      set: 1,
      level: 1,
      score: 0,
      streak: 0,
      hearts: RUN.hearts,
      coins: 0,
      pause: 0,
      round: null,
      n: 0,
    };
    this.nextRound(RUN.gap + 10);
  }
  publishRun(extra = {}) {
    const r = this.runner;
    const L = this.lesson.endless.levels[Math.min(r.level, this.lesson.endless.levels.length) - 1];
    this.set({
      run: {
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
        best: this.best,
        n: r.n,
        ...extra,
      },
    });
  }
  /** The next gate, `RUN.gap` ahead, on the other set of arches: the one just passed keeps going behind him. */
  nextRound(at = RUN.gap) {
    const r = this.runner;
    r.round = this.lesson.endless.round(r.level, Math.random);
    r.set = 1 - r.set;
    r.x = at;
    r.n += 1;
    const set = this.gateSets[r.set];
    set.visible = true;
    set.position.x = at;
    this.dressGates(set);
    this.publishRun();
  }
  /** « إيقاف مؤقّت »: the run freezes where it is — the gate, the speed, the hearts — until he comes back to it. */
  pauseRun(on = true) {
    const r = this.runner;
    if (!r || r.pause > 0 || Boolean(r.held) === on) return;
    r.held = on;
    this.audio.fast = !on;
    this.input.clear();
    this.publishRun(on ? { stage: 'paused' } : {});
  }
  /** His lane, from the keys or from the two buttons of the screen: -1 is left, +1 is right. */
  runLane(d) {
    const r = this.runner;
    if (!r || r.pause > 0 || this.state.run?.stage !== 'go') return;
    const lane = Math.max(0, Math.min(2, r.lane + d));
    if (lane === r.lane) return;
    r.lane = lane;
    this.audio.play('lane');
    this.publishRun();
  }
  stepRun(dt) {
    const r = this.runner;
    const h = this.hero;
    h.yaw = Math.PI / 2;
    h.pos.x = RUN.x;
    h.pos.y = RUN.y;
    if (r) {
      r.v += (RUN.lanes[r.lane] - r.v) * Math.min(1, dt * 14);
      h.pos.z = RUN.z + r.v;
    }
    this.board.position.set(h.pos.x, RUN.y + 0.05, h.pos.z);
    this.board.rotation.y = Math.PI / 2;
    this.board.rotation.z = r ? (RUN.lanes[r.lane] - r.v) * -0.25 : 0;
    if (!r) return;
    // Space pauses and resumes; a run left alone (the page hidden) pauses by itself
    if (this.input.take('jump')) this.pauseRun(!r.held);
    if (r.held) {
      this.input.take('left');
      this.input.take('right');
      this.placeGates();
      return;
    }
    if (this.input.take('left')) this.runLane(-1);
    if (this.input.take('right')) this.runLane(1);
    if (r.pause > 0) {
      // a wrong gate: the run stops while its fact is read, then it goes on — or ends with the last heart
      r.pause -= dt;
      if (r.pause <= 0) {
        if (r.hearts <= 0) this.endRun();
        else this.nextRound();
      }
      this.placeGates();
      return;
    }
    const v = speedOf(r.level, r.score);
    const step = v * dt;
    r.x -= step;
    this.sleepers.position.x = (this.sleepers.position.x - step) % 4;
    this.gateSets.forEach((set, k) => {
      if (k === r.set) set.position.x = r.x;
      else {
        set.position.x -= step;
        if (set.position.x < -12) set.visible = false;
      }
    });
    // the trail warms up with the streak, as on lesson 1's rail
    if (Math.random() < dt * 40)
      this.particles.burst(
        h.pos.clone().setY(RUN.y),
        r.streak >= 5 ? 0xffc12e : r.streak >= 3 ? 0xff9de0 : 0x7dfcff,
        r.streak >= 3 ? 2 : 1,
        1,
        0.2,
        0.5,
      );
    if (r.x <= 0) this.judgeGate();
    this.placeGates();
  }
  judgeGate() {
    const r = this.runner;
    const ok = r.lane === r.round.right;
    this.dressGates(this.gateSets[r.set], r.round.right, r.lane);
    if (ok) {
      r.score += 1;
      r.streak += 1;
      r.coins += r.level;
      this.audio.play('gate');
      if (r.streak >= 3) this.audio.play('star', Math.min(r.streak - 2, 4));
      this.particles.burst(this.hero.pos.clone().setY(1.5), 0x8dffb0, 36, 6, 2, 0.9);
      this.robot.cheer();
      const up = r.score % this.lesson.endless.gates === 0 && r.level < this.lesson.endless.levels.length;
      if (up) {
        r.level += 1;
        this.audio.play('success');
      }
      this.nextRound();
      this.publishRun({ ok: r.n - 1, up });
      return;
    }
    r.hearts -= 1;
    r.streak = 0;
    r.pause = RUN.pause;
    this.shake = 0.5;
    this.audio.play('hit');
    this.particles.burst(this.hero.pos.clone().setY(1.2), 0xff6b81, 30, 5, 2, 0.8);
    this.publishRun({ stage: 'hit', why: r.round.why[r.lane], picked: r.lane, right: r.round.right });
  }
  endRun() {
    const r = this.runner;
    const record = r.score > this.best;
    this.best = Math.max(this.best, r.score);
    this.save();
    this.audio.fast = false;
    this.gateSets.forEach((set) => (set.visible = false));
    this.set({ run: { stage: 'over', score: r.score, level: r.level, coins: r.coins, best: this.best, record } });
    this.runner = null;
  }
  leaveRun() {
    this.runner = null;
    this.audio.fast = false;
    this.track.visible = false;
    this.board.visible = false;
    this.hero.pos.copy(this.depot.robotSpot);
    this.hero.yaw = 1.9;
    this.set({ run: null, phase: 'home' });
  }
  /**
   * The numbers of the gate ahead, over its three arches where lesson 1 draws them — here as TEXT of the page placed
   * every frame (a real fraction bar, a reading size).
   */
  placeGates() {
    const r = this.runner;
    const w = this.canvas.clientWidth;
    const hgt = this.canvas.clientHeight;
    const v = this.tmpG ?? (this.tmpG = new THREE.Vector3());
    this.gateEls.forEach((el, lane) => {
      if (!el) return;
      if (!r) {
        el.style.visibility = 'hidden';
        return;
      }
      v.set(RUN.x + Math.max(r.x, 0.5), RUN.y + 4.3, laneZ(lane)).project(this.camera);
      const far = Math.max(0, Math.min(1, r.x / RUN.gap));
      el.style.visibility = 'visible';
      el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * hgt}px) translate(-50%, -50%) scale(${1.25 - 0.6 * far})`;
    });
  }
  stepWorld(dt, ph) {
    if (ph === 'run') this.stepRun(dt);
  }
  /** The left and right keys steer the robot while he runs. */
  lanesLive(ph) {
    return ph === 'run';
  }
  robotPose(ph) {
    if (ph !== 'run' || !this.runner) return super.robotPose(ph);
    const stopped = this.runner.pause > 0 || Boolean(this.runner.held);
    return { lift: 0, speed: stopped ? 0 : speedOf(this.runner.level, this.runner.score), sad: stopped };
  }
  spawnPoint() {
    return this.depot.robotSpot.clone();
  }
  respawnPoint() {
    return this.depot.robotSpot.clone();
  }
  skyTarget() {
    return SKY;
  }
  heading() {
    return 1.9;
  }
  followsHero() {
    return false;
  }
  fov() {
    return this.state.phase === 'run' ? 60 : 55;
  }
  restore() {
    this.hero.yaw = 1.9;
    // no title screen and no road: the world opens on its home, the missions of the lesson
    this.state = { ...this.state, phase: 'home', stars: this.starsOf(), stage: this.stageOf() };
    this.qaMission();
    // ON THE BOARD OF THE CLASS (`MissionIsle › board`): the world opens on ONE mission, and leaving it leaves the world
    const open = this.lesson.board && this.lesson.missions.find((m) => m.id === this.lesson.board.mission);
    if (open) this.startMission(open);
  }
  starsOf() {
    return Object.fromEntries(Object.entries(this.done).map(([id, d]) => [id, d.stars ?? 0]));
  }
  stageOf() {
    return Object.keys(this.done).length;
  }
  busy() {
    return Boolean(this.state.mission || this.state.run);
  }
  cameraShot(ph) {
    const cine = super.cameraShot(ph);
    if (cine) return cine;
    if (ph === 'run') {
      // the camera of lesson 1's run: close behind him, leaning with his lane
      const off = (this.runner?.v ?? 0) * 0.7;
      return {
        pos: new THREE.Vector3(RUN.x - 7.5, RUN.y + 4.4, RUN.z + off),
        look: new THREE.Vector3(RUN.x + 9, RUN.y + 1.4, RUN.z + off),
        k: 8,
      };
    }
    const pan = this.state.mission ? MISSION_PAN : new THREE.Vector3(0, 3.4, 4.6);
    return { pos: this.depot.camPos.clone().add(pan), look: this.depot.camLook.clone().add(pan), k: 2.4 };
  }

  /** The dev pages `/__qa/…` name a mission in `window.__qaMission`: the world opens on it (never in a real lesson). */
  qaMission() {
    if (!import.meta.env.DEV || typeof window === 'undefined' || !window.__qaMission) return;
    if (!window.location.pathname.startsWith('/__qa/')) return;
    this.startMission(window.__qaMission);
  }

  // ── the kit's doors: this world has no map, no launch kit and no title — they all lead home ──
  home() {
    this.set({ overlay: null, phase: 'home' });
  }
  openMap() {
    this.home();
  }
  closeMap() {
    this.home();
  }
  closeOverlay() {
    this.home();
  }
  roam() {
    this.home();
  }
  openBag() {}
  openSitting(level = 1) {
    this.audio.unlock();
    super.openSitting(level);
  }

  /** The mission served from the bank: one sheet of the lesson's bank in exam form (the kit's sitting), whatever the ladder. */
  openBank() {
    this.audio.unlock();
    const level = this.lesson.bank.level;
    this.openHub({ type: 'sitting', level, weak: this.exam.weak?.[level] ?? [], n: (this.exam.sittings ?? 0) + 1 });
  }
  quitSitting() {
    this.home();
  }
  finishSitting(level, mark, total, weak) {
    super.finishSitting(level, mark, total, weak);
    if (level !== this.lesson.bank.level) return;
    // the bank mission is done once a sheet was handed in; its stars are the sitting's
    const stars = this.exam.best?.[level]?.stars ?? 0;
    const before = this.done[this.lesson.bank.id];
    this.done = {
      ...this.done,
      [this.lesson.bank.id]: { stars: Math.max(before?.stars ?? 0, stars), times: (before?.times ?? 0) + 1 },
    };
    const all = this.allDone();
    this.set({ missions: this.done, stars: this.starsOf(), stage: this.stageOf(), finished: all });
    this.save();
  }
  allDone() {
    return [...this.lesson.missions.map((m) => m.id), this.lesson.bank.id].every((id) => this.done[id]);
  }

  // ── a mission ──
  startMission(sit) {
    this.audio.unlock();
    this.audio.startMusic();
    this.depot.clearSim();
    if (sit.scene?.kind === 'ring') this.depot.setPlot(sit.scene);
    else {
      this.depot.clearPlot();
      this.depot.setStock({ a: null, b: null }, sit.kinds);
      this.depot.stockLabel(null, null, sit.stock);
    }
    this.input.clear();
    this.set({ phase: 'mission', overlay: null, mission: sit });
  }
  async missionRun(spec, opts = {}) {
    const sit = this.state.mission;
    if (!sit) return null;
    if (spec.ring) return this.depot.runRing(spec.ring);
    if (spec.pairing) {
      this.depot.stockLabel(sit.stock.a, sit.stock.b, sit.stock);
      await this.depot.runPairing(spec.pairing, spec.colors);
    } else await this.depot.runLots(spec, sit.kinds, { cheer: Boolean(opts.cheer), stock: spec.stock ?? null });
    if (opts.ship && !this.dead && this.state.mission === sit) {
      this.robot.cheer();
      await this.wait(0.9);
      await this.depot.ship();
    }
    return null;
  }
  missionStock(a, b) {
    if (this.state.mission?.scene?.kind) return;
    this.depot.stockLabel(a, b, this.state.mission?.stock ?? null);
  }
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
  /** A mission reached its end: what he earned is kept (his best). All done = the lesson is finished (`save.finished`: the shell then marks every module, kit/storyEnd.js). */
  /** What his copy holds, at each step forward of a mission: kept until the mission is finished. */
  missionKeep(snapshot) {
    const sit = this.state.mission;
    if (!sit || this.lesson.board) return;
    this.partial = { ...this.partial, [sit.id]: snapshot };
    this.set({ partial: this.partial });
    this.save();
  }
  missionDone(result) {
    const sit = this.state.mission;
    if (!sit) return;
    const { [sit.id]: _finished, ...rest } = this.partial;
    this.partial = rest;
    const before = this.done[sit.id];
    this.done = {
      ...this.done,
      [sit.id]: {
        stars: Math.max(before?.stars ?? 0, result.stars),
        coins: Math.max(before?.coins ?? 0, result.coins),
        times: (before?.times ?? 0) + 1,
      },
    };
    const all = this.allDone();
    this.set({
      missions: this.done,
      stars: this.starsOf(),
      stage: this.stageOf(),
      finished: all,
      partial: this.partial,
    });
    this.save();
  }
  leaveMission() {
    this.depot.clearSim();
    this.depot.clearPlot();
    this.set({ mission: null, phase: 'home' });
    this.lesson.board?.onLeave?.();
  }
}
