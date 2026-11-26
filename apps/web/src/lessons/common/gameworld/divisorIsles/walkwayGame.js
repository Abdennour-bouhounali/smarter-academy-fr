/**
 * THE WORLD'S SIDE of two pieces of « L’archipel des diviseurs » (`Game.js` installs these methods on the game):
 *
 *   the walkway segment  `{ kind: 'walkway', crews: [16, 20], ruler: 400, scale: 'fixed' | 'fit', convoy?, bench? }` —
 *                        a post « le pilier » on the island it leaves (a beacon while it is to build), two crew robots,
 *                        the panel `Chantier.jsx` (logic `walkway.js`). A try laid is LOGGED (`game.log`, the forge's
 *                        evidence), kept per segment (`flags.walkways[id].tries`) and, when it holds AND the purse pays
 *                        it, the walkway STANDS: two lanes in the crews' colours across the segment, `seg.a = d`, the
 *                        story's `onHold(game, seg, try)`. A refused walkway costs no coin.
 *   the final mission    `story.mission = { prompt, title, lead, lines(), check(values, writing?) → 'ok' | a FACT,
 *                        posters? | plaques?, at?, opens?, refill?, write?, jetty?, window?, objective?, text,
 *                        onSolved?, onSpent? }` — ported from `rootCourts`: a board on the island `at` (default the
 *                        LAST); its overlay is `Mission.jsx`. Each wrong answer spends a try of the run (`posters` /
 *                        `plaques`); when none is left the run is over (`onSpent`): the next opening starts a new run —
 *                        or, with `refill: { at }`, only once he has walked back to that island. `write` makes the answer
 *                        a fraction (`plaque.js`); `opens` is the road out of `at`, shut until it is solved, with its
 *                        lanterns (`jetty`). The story ends (`finale`) on the last island only once the mission is solved.
 *
 * Words: the story's (`story.text.walkway`, `story.mission.text`) — nothing here writes French.
 */
import * as THREE from 'three';
import { glow, makeBeacon, makePylon, mouldColor } from '../engine/builders';
import { makeRobot } from '../engine/robot';
import { spentBy, triesFrom } from './walkway';
import { checkWrite, writingOf } from './plaque';

const LANE_W = 1.0; // each lane's width on the 3D walkway (two lanes side by side make the bridge's 2.1)
const LOG_KEEP = 24;

export const WALKWAY_METHODS = {
  /** The walkway's segment over the water: its four pylons, a faint strip, and its deck (two lanes) hidden until paid. */
  buildWalkway(seg) {
    if (!this.T.walkway) throw new Error(`walkway ${seg.id}: the story gives no text.walkway`);
    if (!Array.isArray(seg.crews) || seg.crews.length < 1) throw new Error(`walkway ${seg.id}: no crews`);
    const g = new THREE.Group();
    this.scene.add(g);
    seg.group = g;
    seg.planks = [];
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
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.02, seg.len),
      new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.13, depthWrite: false }),
    );
    strip.position.copy(this.segPoint(seg, seg.len / 2, 0, -0.04));
    strip.quaternion.copy(q);
    g.add(strip);
    // the deck: one lane per crew, side by side, in the crews' colours
    const n = seg.crews.length;
    seg.deck = new THREE.Group();
    seg.crews.forEach((b, i) => {
      const v = (i - (n - 1) / 2) * (2.1 / n);
      const lane = new THREE.Mesh(
        new THREE.BoxGeometry(Math.min(LANE_W, 2.1 / n), 0.22, seg.len + 0.5),
        glow(mouldColor(b).getHex(), 0.35),
      );
      lane.position.copy(this.segPoint(seg, seg.len / 2, v, 0.05));
      lane.quaternion.copy(q);
      seg.deck.add(lane);
    });
    seg.deck.visible = false;
    g.add(seg.deck);
    // the crews: the world's robot, a ring of its plank's colour at its feet, its plank on its chest
    seg.crewBots = seg.crews.map((b, i) => {
      const bot = makeRobot();
      bot.setChest(String(b));
      bot.group.scale.setScalar(0.75);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.07, 8, 24), glow(mouldColor(b).getHex(), 0.9));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.08;
      bot.group.add(ring);
      bot.group.position.copy(this.segPoint(seg, -1.3, (i - (n - 1) / 2) * 1.3));
      bot.group.rotation.y = yaw;
      g.add(bot.group);
      return bot;
    });
    // a walkway laid on an earlier visit stands again
    const paid = this.walkwayTries(seg).find((t) => t.paid);
    if (paid) this.standWalkway(seg, paid, true);
  },

  /** The post « le pilier » on the island the walkway leaves: lit while the walkway is to build; E opens the chantier. */
  buildPillarPost(isl, seg, local, reserved) {
    const p = local(isl.R - 2.9, 2.7);
    const post = makePylon();
    post.scale.setScalar(1.25);
    post.position.set(p.x, 0, p.z);
    isl.group.add(post);
    seg.post = post;
    seg.postBeacon = makeBeacon(1.1);
    seg.postBeacon.position.set(p.x, 0, p.z);
    isl.group.add(seg.postBeacon);
    reserved.push({ ...p, r: 2.2 });
    this.colliders.push({ x: isl.x + p.x, z: isl.z + p.z, r: 0.5 });
    seg.postIt = this.addInteract(
      isl.x + p.x,
      isl.z + p.z,
      () => this.walkwayPrompt(seg),
      () => this.openWalkway(seg),
      2.8,
      3.2,
    );
  },

  /** The beacon of each post he can use now, and the crews' idle motion. */
  stepWalkways(dt, ph) {
    for (const seg of this.segs) {
      if (seg.kind !== 'walkway') continue;
      const on = ph === 'play' && seg.index === this.state.stage && !seg.complete;
      if (seg.postBeacon) {
        seg.postBeacon.visible = on;
        if (on) seg.postBeacon.userData.animate?.(this.time, dt, this.activeIt === seg.postIt);
      }
      seg.crewBots?.forEach((b) => b.update(dt, {}));
    }
  },

  walkwayPrompt(seg) {
    if (seg.complete || seg.index !== this.state.stage) return null;
    return this.T.walkway.prompt;
  },

  openWalkway(seg) {
    if (this.state.phase !== 'play' || seg.complete) return;
    this.audio.play('ui');
    this.set({
      phase: 'dialog',
      overlay: { type: 'walkway', seg: seg.index, ...(seg.bench ? { bench: seg.bench } : {}) },
      prompt: null,
    });
  },

  closeWalkway() {
    if (this.state.overlay?.type !== 'walkway') return;
    this.closeOverlay();
    this.refreshObjective();
  },

  /** The tries kept for this walkway (read back by `walkway.js › triesFrom`: only tries these crews make). */
  walkwayTries(seg) {
    return triesFrom(seg.crews, this.flags.walkways?.[seg.id]?.tries);
  },

  /** The purse of a walkway: its convoy's coins, minus what its paid walkway cost — a refused one cost nothing. */
  walkwayPurse(seg) {
    const of = seg?.convoy ? this.convoys?.[seg.convoy]?.purse : null;
    if (!Number.isInteger(of)) return null;
    const spent = this.walkwayTries(seg).reduce((n, t) => n + spentBy(t), 0);
    return { of, left: of - spent };
  },

  /** A try the crews have laid: kept, logged, heard — and the walkway stands when it holds and is paid. */
  walkwayLaid(seg, t) {
    const tries = [...this.walkwayTries(seg), t];
    this.flags.walkways = { ...this.flags.walkways, [seg.id]: { tries } };
    const entry = { kind: 'walkway', seg: seg.id, d: t.d, lanes: t.lanes, holds: t.holds, cost: t.cost, paid: t.paid };
    this.log = [...this.log, entry].slice(-LOG_KEEP);
    this.audio.play(t.paid ? 'success' : t.verdict === 'ruins' ? 'fail' : 'crumble');
    if (t.paid) this.standWalkway(seg, t);
    this.save();
  },

  /** The walkway stands: its deck appears, its length is the pillar's, the road goes on, and the story hears it. */
  standWalkway(seg, t, silent = false) {
    seg.a = t.d;
    seg.cell = seg.len / t.d;
    seg.builtWith = t.d;
    this.built[seg.id] = t.d;
    if (seg.deck) seg.deck.visible = true;
    this.markComplete(seg, silent);
    if (!silent) {
      this.particles?.burst(this.segPoint(seg, seg.len / 2, 0, 1.2), 0x2fe37a, 40, 4, 3, 1);
      this.story.onHold?.(this, seg, t);
    }
  },

  // ───────────────────────────── the final mission (`story.mission`, ported from rootCourts) ─────────────────────────────
  /** The island of the mission's board: `mission.at`, else the last island. */
  missionAt() {
    const at = this.story.mission?.at;
    return Number.isInteger(at) ? at : this.isl.length - 1;
  },
  /** The road the mission opens (`mission.opens`, a segment id), or null. */
  missionRoad() {
    const id = this.story.mission?.opens;
    return id ? (this.segs?.find((x) => x.id === id) ?? null) : null;
  },
  /** The board of the mission: a pylon with a beacon on its island; E opens it while the mission waits. */
  buildMissionBoard(isl, local, reserved) {
    const m = this.story.mission;
    if (m.write) checkWrite(m.write);
    const p = local(-2.6, -3.2);
    const board = makePylon();
    board.scale.setScalar(1.3);
    board.position.set(p.x, 0, p.z);
    isl.group.add(board);
    this.missionBeacon = makeBeacon(1.1);
    this.missionBeacon.position.set(p.x, 0, p.z);
    isl.group.add(this.missionBeacon);
    reserved.push({ ...p, r: 2.2 });
    this.colliders.push({ x: isl.x + p.x, z: isl.z + p.z, r: 0.5 });
    this.missionIt = this.addInteract(
      isl.x + p.x,
      isl.z + p.z,
      () => (this.missionOpen() ? this.story.mission.prompt : null),
      () => this.openMission(),
      2.8,
      3.4,
    );
  },
  /**
   * After the world is built (`restore`): the road the mission opens stays SHUT until it is solved — its deck hidden, not
   * walkable — and its lanterns (`mission.jetty`) stand dark; a save where it is solved finds it open and lit.
   */
  shutMissionRoad() {
    const seg = this.missionRoad();
    if (!seg) return;
    if (!seg.standing) throw new Error(`mission: the road ${seg.id} it opens must be a standing bridge`);
    if (this.story.mission.jetty && !seg.lanterns) this.buildLanterns(seg, this.story.mission.jetty);
    if (this.flags.mission) {
      this.lightLanterns(seg);
      return;
    }
    seg.complete = false;
    seg.builtLen = 0;
    if (seg.deck) seg.deck.visible = false;
  },
  /** The lanterns of the road: `n` along both sides, dark; lit later (`lit` of them, `red` of the lit ones red). */
  buildLanterns(seg, { lanterns: n }) {
    const geo = new THREE.SphereGeometry(0.11, 8, 6);
    const dark = new THREE.MeshStandardMaterial({ color: 0x3a4256, roughness: 0.6 });
    seg.lanterns = Array.from({ length: n }, (_, k) => {
      const side = k % 2 ? 1 : -1;
      const u = 0.4 + (Math.floor(k / 2) + 0.5) * ((seg.len - 0.8) / Math.ceil(n / 2));
      const m = new THREE.Mesh(geo, dark);
      m.position.copy(this.segPoint(seg, u, side * 1.2, 0.45));
      seg.group?.add(m);
      return m;
    });
  },
  lightLanterns(seg) {
    const j = this.story.mission?.jetty;
    if (!j || !seg.lanterns) return;
    const warm = glow(0xffd166, 1.4);
    const red = glow(0xff4d4d, 1.4);
    // the red ones spread evenly among the lit ones
    const reds = new Set(Array.from({ length: j.red }, (_, k) => Math.floor(((k + 0.5) * j.lit) / j.red)));
    seg.lanterns.forEach((m, k) => {
      if (k < j.lit) m.material = reds.has(k) ? red : warm;
    });
  },
  stepMission(dt, ph) {
    const m = this.story.mission;
    if (!m) return;
    // the walk back: once the run is over, the island `refill.at` gives a new run
    if (m.refill && this.flags.missionRun?.left === 0 && this.hero?.island === m.refill.at) {
      this.flags.missionRun = null;
      this.save();
      this.refreshObjective();
    }
    if (!this.missionBeacon) return;
    const on = ph === 'play' && this.missionOpen();
    this.missionBeacon.visible = on;
    if (on) this.missionBeacon.userData.animate?.(this.time, dt, this.activeIt === this.missionIt);
  },

  /** The mission waits on its island: not solved, and not a run over that waits for the walk back. */
  missionOpen() {
    const m = this.story.mission;
    if (!m || this.flags.mission || this.state.stage !== this.missionAt()) return false;
    return !(m.refill && this.flags.missionRun?.left === 0);
  },
  /** He has spent every plaque / poster of the run and must walk back (`mission.refill`) for a new run. */
  missionWalkBack() {
    return Boolean(this.story.mission?.refill) && this.flags.missionRun?.left === 0 && !this.flags.mission;
  },
  /** The tries of a run now: { of, left } — `posters` or `plaques` (the same); null when tries are free. */
  missionPosters() {
    const m = this.story.mission;
    const of = m?.posters ?? m?.plaques;
    if (!Number.isInteger(of) || of < 1) return null;
    const run = this.flags.missionRun;
    return { of, left: run && Number.isInteger(run.left) ? run.left : of };
  },
  openMission() {
    if (this.busy?.() || !this.missionOpen()) return;
    // without a walk back, a run that was over starts again with a full purse at the next opening
    if (this.flags.missionRun?.left === 0) this.flags.missionRun = null;
    this.audio.play('ui');
    this.set({ phase: 'dialog', overlay: { type: 'mission' }, prompt: null });
  },
  closeMission() {
    if (this.state.overlay?.type !== 'mission') return;
    this.set({ overlay: null, phase: 'play' });
    this.input.clear();
    this.refreshObjective();
  },
  /**
   * He answers: 'ok' solves it; anything else is the story's FACT, and spends a try when the run counts them. With
   * `write`, the story's `check(values, writing)` also gets what the fraction IS (`plaque.js › writingOf`); an empty or
   * unreadable box spends nothing. Returns { ok, fact?, posters?, over?, writing? } — `over` on the last try of a run.
   */
  missionTry(values) {
    const m = this.story.mission;
    const writing = m.write ? writingOf(m.write, values) : null;
    const out = m.check(values, writing);
    const tries = [...(this.flags.missionTries ?? []), { values, ok: out === 'ok' }].slice(-40);
    this.flags.missionTries = tries;
    if (out === 'ok') {
      this.solveMission();
      return { ok: true };
    }
    this.audio.play('fail');
    const posters = this.missionPosters();
    if (!posters || (writing && (writing.kind === 'empty' || writing.kind === 'nan'))) {
      this.save();
      return { ok: false, fact: out, ...(writing ? { writing } : {}), ...(posters ? { posters } : {}) };
    }
    const left = Math.max(0, posters.left - 1);
    this.flags.missionRun = { left };
    const over = left === 0;
    if (over) {
      this.flags.missionRuns = (this.flags.missionRuns ?? 0) + 1;
      m.onSpent?.(this);
    }
    this.save();
    return { ok: false, fact: out, posters: { of: posters.of, left }, over, ...(writing ? { writing } : {}) };
  },
  /**
   * The mission is solved: kept, the story hears it. On the last island the story ends; elsewhere the road it opens
   * (`opens`) stands and its lanterns light — the end plays when he reaches the last island.
   */
  solveMission() {
    this.flags.mission = true;
    this.flags.missionRun = null;
    this.audio.play('success');
    this.set({ overlay: null, phase: 'play' });
    const road = this.missionRoad();
    if (road) {
      if (road.deck) road.deck.visible = true;
      this.markComplete(road);
      this.lightLanterns(road);
    }
    this.save();
    this.story.mission?.onSolved?.(this);
    this.refreshObjective();
    if (this.missionAt() === this.isl.length - 1) this.finale();
  },
  /** The mission's objective line (`mission.objective`: a string, or a function of the game). */
  missionObjective() {
    const o = this.story.mission?.objective;
    return typeof o === 'function' ? o(this) : (o ?? null);
  },
  /** He walks on this segment once it stands — and, when the mission sends him back (`refill`), on the dash's rail. */
  walkableSeg(seg) {
    return walkableKind(seg) || (seg.kind === 'rail' && seg.complete && Boolean(this.story.mission?.refill));
  },
};

/** Is this segment one he walks on once it stands (a bridge, a walkway)? */
const walkableKind = (seg) => seg.kind === 'bridge' || seg.kind === 'walkway';
