/**
 * The gate run (`kit/GateRun.js`). Its DEFAULT — the rail of light, the arches, the hoverboard, its rules — is what every
 * world had before the river skin and the hazards (K-b, `PYRAMIDS_WORLD_PLAN.md` §2.4): the scene it builds and the run it
 * plays are pinned here by fingerprints taken on the code BEFORE K-b. Then the options: `skin` (a track, a rider, the
 * gates as meshes of the world) and `hazards` (one lane closed between two gates; touching it costs a heart).
 */
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GateRun, hazardPlan } from './GateRun';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const read = (p) => fs.readFileSync(path.join(HERE, p), 'utf8');

let saved;
beforeAll(() => {
  saved = globalThis.document;
  globalThis.document = { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} };
});
afterAll(() => {
  globalThis.document = saved;
});

/** A seeded random (mulberry32): the run draws its rounds with `Math.random`, replaced while a trace is taken. */
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function withRandom(seed, fn) {
  const real = Math.random;
  Math.random = seeded(seed);
  try {
    return fn();
  } finally {
    Math.random = real;
  }
}

/** The least of a world the run touches: its scene, its robot, its sounds, its keys, its state. */
function fakeGame() {
  const keys = new Set();
  const g = {
    scene: new THREE.Scene(),
    hero: { pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0 },
    audio: { unlock() {}, startMusic() {}, play() {}, fast: false },
    input: { clear: () => keys.clear(), take: (k) => keys.delete(k), press: (k) => keys.add(k) },
    particles: { burst() {} },
    robot: { cheer() {} },
    canvas: { clientWidth: 1366, clientHeight: 768 },
    camera: new THREE.PerspectiveCamera(55, 1366 / 768, 0.1, 1200),
    shake: 0,
    state: {},
    log: [],
    set(patch) {
      this.state = { ...this.state, ...patch };
      if (patch.run) this.log.push(patch.run);
    },
  };
  g.camera.position.set(-7.5, 4.4, 0);
  g.camera.lookAt(9, 1.4, 0);
  g.camera.updateMatrixWorld();
  return g;
}

/** Every mesh of a built run: its geometry, its size, where it sits — rounded. */
function sceneFingerprint(scene) {
  const out = [];
  scene.traverse((o) => {
    if (!o.isMesh) return;
    o.updateWorldMatrix(true, false);
    const p = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
    const prm = o.geometry.parameters ?? {};
    const c = o.material.color?.getHex() ?? 0;
    out.push(
      [o.geometry.type, Object.values(prm).map((v) => +(+v).toFixed(2)), p.toArray().map((v) => +v.toFixed(2)), c].join(
        '|',
      ),
    );
  });
  return out;
}

const CONTENT = {
  levels: [
    { name: 'L1', from: 'a' },
    { name: 'L2', from: 'b' },
  ],
  gates: 2,
  round: (level, random, n) => {
    const right = Math.floor(random() * 3);
    return {
      ask: `q${n}`,
      options: [0, 1, 2].map((k) => ({ t: String(10 * level + k) })),
      right,
      why: ['a', 'b', 'c'],
    };
  },
};

/** A scripted run: 0.05 s frames, the lane chosen every frame by `steer(run, frame)`; what the screen read, in order. */
function trace(opts, content, steer, frames = 900) {
  const g = fakeGame();
  const run = new GateRun(g, opts);
  run.build();
  return withRandom(7, () => {
    run.open(content);
    run.start();
    for (let f = 0; f < frames && run.runner; f += 1) {
      const d = steer(run, f);
      if (d) run.lane(d);
      run.step(0.05);
    }
    return { log: g.log, run, game: g };
  });
}
const summary = (log) =>
  log.map((r) => [r.stage, r.n ?? '-', r.lane ?? '-', r.hearts ?? '-', r.score ?? '-', r.level ?? '-'].join(':'));
const hash = (list) => {
  let h = 2166136261;
  for (const ch of list.join('\n')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
};

/** A player that always takes the right lane (one step a frame), and one that never moves. */
const toRight = (run) => {
  const r = run.runner;
  if (!r || r.pause > 0) return 0;
  return Math.sign(r.round.right - r.lane);
};
const still = () => 0;

describe('the gate run by default: the rail of light of before (divisor-isles, root-courts)', () => {
  it('builds the same scene: rails, floor, sleepers, lane lines, two sets of three arches, the hoverboard', () => {
    const g = fakeGame();
    const run = new GateRun(g, { x: 30, y: 0.3, z: -12, onOver: () => ({}) });
    run.build();
    const fp = sceneFingerprint(g.scene);
    expect(fp.length).toBe(69);
    expect(hash(fp)).toBe(FINGERPRINT.scene);
  });
  it('plays the same run: a perfect player and a still one read the same states as before', () => {
    const a = trace({ x: 0, y: 0.3, z: 0 }, { ...CONTENT, total: 6 }, toRight);
    expect(a.log.at(-1)).toMatchObject({ stage: 'over', won: true, score: 6, hearts: 3 });
    expect(hash(summary(a.log))).toBe(FINGERPRINT.perfect);
    const b = trace({ x: 0, y: 0.3, z: 0 }, CONTENT, still);
    expect(b.log.at(-1)).toMatchObject({ stage: 'over', won: false, hearts: 0 });
    expect(hash(summary(b.log))).toBe(FINGERPRINT.still);
  });
  it('the worlds that sail on it pass neither a skin nor hazards: root-courts as it is, divisor-isles never imports it', () => {
    const rc = read('../rootCourts/Game.js');
    const call = rc.slice(rc.indexOf('new GateRun('), rc.indexOf('this.gateRun.build()'));
    expect(call).not.toMatch(/skin|hazards/);
    for (const f of fs.readdirSync(path.join(HERE, '../divisorIsles')))
      if (/\.jsx?$/.test(f)) expect(read(`../divisorIsles/${f}`)).not.toMatch(/GateRun/);
  });
});

/** A skin of plain meshes, as a world gives it: what the kit did with them is read back from their `userData`. */
function plainSkin() {
  const made = { gates: [], dressed: [] };
  const box = (name) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
    m.name = name;
    return m;
  };
  const skin = {
    name: 'river',
    track: () => {
      const g = new THREE.Group();
      g.add(box('water'));
      g.userData = { flowed: 0, flow: (step) => (g.userData.flowed += step) };
      made.track = g;
      return g;
    },
    rider: () => {
      const b = box('boat');
      b.userData.deck = 0.6;
      made.rider = b;
      return b;
    },
    gate: (lane) => {
      const b = box('buoy');
      b.userData.dress = (state) => made.dressed.push([lane, state]);
      made.gates.push(b);
      return b;
    },
    lanes: 3.2,
    labelY: 3.4,
    camera: { back: 10, up: 6, ahead: 12, look: 1 },
  };
  return { skin, made };
}
const croc = () => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
  m.name = 'croc';
  return m;
};

describe("the skin: the world's track, rider and gates in place of the rail", () => {
  it('builds no rail: the track, the boat and six buoys of the world; the hero rides on its deck', () => {
    const g = fakeGame();
    const { skin, made } = plainSkin();
    const run = new GateRun(g, { x: 0, y: 0.3, z: 0, skin });
    run.build();
    const names = [];
    g.scene.traverse((o) => o.isMesh && names.push(o.name));
    expect(names.filter((n) => n === 'buoy')).toHaveLength(6);
    expect(names.filter((n) => n === 'water')).toHaveLength(1);
    expect(names.filter((n) => n === 'boat')).toHaveLength(1);
    expect(names.every((n) => ['buoy', 'water', 'boat'].includes(n))).toBe(true);
    expect(run.sleepers).toBeUndefined();
    expect(made.gates.map((b) => b.position.z)).toEqual([-3.2, 0, 3.2, -3.2, 0, 3.2]);
    withRandom(3, () => {
      run.open(CONTENT);
      run.start();
      run.lane(1);
      for (let f = 0; f < 20; f += 1) run.step(0.05);
    });
    expect(g.hero.pos.y).toBeCloseTo(0.9, 6);
    expect(g.hero.pos.z).toBeCloseTo(3.2, 1);
    expect(made.rider.position.z).toBeCloseTo(g.hero.pos.z, 6);
    expect(made.track.userData.flowed).toBeGreaterThan(0);
    const cam = run.camera();
    expect(cam.pos.x).toBeCloseTo(-10, 6);
    expect(cam.look.y).toBeCloseTo(1.3, 6);
  });
  it('dresses its buoys when a gate is judged — right, picked, other — and idle again for the next one', () => {
    const { skin, made } = plainSkin();
    const { log } = trace({ x: 0, y: 0.3, z: 0, skin }, CONTENT, still, 400);
    const hit = log.find((r) => r.stage === 'hit');
    expect(hit).toBeDefined();
    const judged = made.dressed.filter(([, st]) => st !== 'idle');
    expect(judged.some(([lane, st]) => st === 'right' && lane === hit.right)).toBe(true);
    expect(judged.some(([lane, st]) => st === 'picked' && lane === 1)).toBe(true);
    expect(judged.some(([, st]) => st === 'other')).toBe(true);
    expect(made.dressed.filter(([, st]) => st === 'idle').length).toBeGreaterThan(3);
  });
  it("places the numbers at the skin's height over the buoys", () => {
    const g = fakeGame();
    const run = new GateRun(g, { x: 0, y: 0.3, z: 0, skin: plainSkin().skin });
    run.build();
    const els = [0, 1, 2].map(() => ({ style: {} }));
    run.els = els;
    withRandom(1, () => {
      run.open(CONTENT);
      run.start();
    });
    const spy = [];
    const project = THREE.Vector3.prototype.project;
    THREE.Vector3.prototype.project = function p(cam) {
      spy.push(this.y);
      return project.call(this, cam);
    };
    try {
      run.place();
    } finally {
      THREE.Vector3.prototype.project = project;
    }
    expect(spy).toEqual([3.7, 3.7, 3.7].map((v) => expect.closeTo(v, 6)));
    expect(els.every((el) => el.style.visibility === 'visible')).toBe(true);
  });
});

describe("the skin's `lead`: a gate and an obstacle drawn ahead of him when they reach him (a prow meets its buoy)", () => {
  it('draws them `lead` metres further, and judges them where they were', () => {
    const plain = trace({ x: 0, y: 0.3, z: 0, skin: plainSkin().skin }, { ...CONTENT, total: 3 }, toRight);
    const { skin } = plainSkin();
    const led = trace({ x: 0, y: 0.3, z: 0, skin: { ...skin, lead: 4.2 } }, { ...CONTENT, total: 3 }, toRight);
    expect(summary(led.log)).toEqual(summary(plain.log));
    const g = fakeGame();
    const run = new GateRun(g, { x: 0, y: 0.3, z: 0, skin: { ...skin, lead: 4.2 }, hazards: { mesh: croc } });
    run.build();
    withRandom(4, () => {
      run.open(CONTENT);
      run.start();
    });
    const r = run.runner;
    expect(run.sets[r.set].position.x).toBeCloseTo(r.x + 4.2, 9);
    expect(r.hz.m.position.x).toBeCloseTo(r.x - 17 + 4.2, 9);
    expect(run.debug().hazard.dx).toBeCloseTo(r.x - 17, 9);
  });
});

describe('the hazards: one lane closed between two gates, a heart if he touches it', () => {
  it('sits halfway between two gates, at least `react` seconds from the next one, in any lane — or nowhere if too fast', () => {
    const r = seeded(11);
    const lanes = new Set();
    for (let speed = 6; speed <= 17; speed += 0.5)
      for (let k = 0; k < 40; k += 1) {
        const plan = hazardPlan({ gap: 34, speed, random: r });
        expect(plan.before).toBe(17);
        expect(plan.before / speed).toBeGreaterThanOrEqual(0.9);
        expect((34 - plan.before) / speed).toBeGreaterThanOrEqual(0.9);
        lanes.add(plan.lane);
      }
    // every lane, the right one included: where the obstacle sits tells nothing of the answer
    expect([...lanes].sort()).toEqual([0, 1, 2]);
    expect(hazardPlan({ gap: 34, speed: 20, random: r })).toBeNull();
    expect(hazardPlan({ gap: 34, speed: 20, random: r, react: 0.8 })).not.toBeNull();
  });

  /**
   * The right answer is always reachable: at the fastest speed, a player who reads the obstacle and goes to the right lane
   * only once the obstacle has passed (when it closes that lane) — one lane per frame, after 0.3 s of reaction — never
   * touches it and passes every gate right.
   */
  it('a player who dodges then takes the right lane wins the course with three hearts, at the fastest speed', () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const g = fakeGame();
      const run = new GateRun(g, { x: 0, y: 0.3, z: 0, speedOf: () => 17, hazards: { mesh: croc } });
      run.build();
      const dbg = run.debug();
      const got = withRandom(seed, () => {
        run.open({ ...CONTENT, total: 8 });
        run.start();
        let wait = 0;
        let seen = -1;
        for (let f = 0; f < 2000 && run.runner; f += 1) {
          const r = run.runner;
          const hz = dbg.hazard;
          const right = r.round.right;
          const n = r.n * 10 + (hz ? 1 : 0);
          if (n !== seen) {
            seen = n;
            wait = 6; // 0.3 s to read what changed
          }
          let target = right;
          if (hz && hz.lane === right) target = right === 1 ? 0 : 1; // the obstacle closes the right lane: wait beside it
          if (wait > 0) wait -= 1;
          else if (r.pause <= 0 && target !== r.lane) run.lane(Math.sign(target - r.lane));
          run.step(0.05);
        }
        return g.log.at(-1);
      });
      expect(got).toMatchObject({ stage: 'over', won: true, score: 8, hearts: 3, bumps: 0 });
    }
  });

  it('touching one costs a heart and shakes the boat, the question stays; the last heart ends the leg, « again » restarts it', () => {
    const g = fakeGame();
    const run = new GateRun(g, { x: 0, y: 0.3, z: 0, hazards: { mesh: croc } });
    run.build();
    const dbg = run.debug();
    withRandom(5, () => {
      run.open({ ...CONTENT, total: 40 });
      run.start();
      let bumps = 0;
      for (let f = 0; f < 6000 && run.runner; f += 1) {
        const r = run.runner;
        const hz = dbg.hazard;
        // he always sails INTO the obstacle's lane, and takes the right gate once it has passed
        const target = hz ? hz.lane : r.round.right;
        if (r.pause <= 0 && target !== r.lane) run.lane(Math.sign(target - r.lane));
        const before = { round: r.round, n: r.n, hearts: r.hearts };
        run.step(0.05);
        if (run.runner && run.runner.bumps > bumps) {
          bumps = run.runner.bumps;
          expect(run.runner.round).toBe(before.round);
          expect(run.runner.n).toBe(before.n);
          expect(run.runner.hearts).toBe(before.hearts - 1);
          expect(run.runner.jolt).toBeGreaterThan(0);
          expect(g.shake).toBe(0.5);
          expect(g.state.run).toMatchObject({ stage: 'go', bumps, hearts: before.hearts - 1, hazard: null });
          expect(run.pose().sad).toBe(true);
        }
      }
    });
    expect(g.state.run).toMatchObject({ stage: 'over', won: false, hearts: 0, bumps: 3 });
    // the hazard of each gap was announced, then cleared once passed
    expect(g.log.some((r) => r.hazard != null)).toBe(true);
    withRandom(9, () => run.start());
    expect(g.state.run).toMatchObject({ stage: 'go', hearts: 3, bumps: 0, n: 1 });
    expect(run.hazards.filter((m) => m.visible)).toHaveLength(1);
  });

  it('`every: 2` closes a lane before every other gate only', () => {
    const g = fakeGame();
    const run = new GateRun(g, { x: 0, y: 0.3, z: 0, hazards: { mesh: croc, every: 2 } });
    run.build();
    const withHz = [];
    withRandom(2, () => {
      run.open({ ...CONTENT, total: 6 });
      run.start();
      for (let f = 0; f < 3000 && run.runner; f += 1) {
        const r = run.runner;
        if (withHz[r.n - 1] === undefined) withHz[r.n - 1] = Boolean(r.hz);
        if (r.pause <= 0 && r.round.right !== r.lane && !(r.hz && !r.hz.done && r.hz.lane === r.round.right))
          run.lane(Math.sign(r.round.right - r.lane));
        run.step(0.05);
      }
    });
    expect(withHz).toEqual([true, false, true, false, true, false]);
  });
});

// taken on the code before K-b (commit of 2026-11-24, `kit/GateRun.js` as the worlds sail on it)
const FINGERPRINT = { scene: 767120524, perfect: 2811406027, still: 2790959622 };
