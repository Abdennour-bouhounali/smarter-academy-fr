/**
 * The practice space on the pyramids world: a level of the ladder is sailed on the river (plan §1.3, §3.9). The pure part
 * (`practice.js`) and the world's hooks (`Game.js › startPractice / endPractice / quitPractice / showRule / closeRule`),
 * played on a stand-in of the runtime — no renderer: what the river (`kit/GateRun.js`) is asked is recorded.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as THREE from 'three';
import { createLadder, SUMMARY } from '../kit/ladder';
import { rng } from '../kit/random';
import { railSpeed } from '../kit/GateRun';
import { NilePyramidsGame } from './Game';
import { practiceRun, practiceEnd, practiceSpeed, roundOfWave, buoyOption } from './practice';
import { WORLD_TEXT } from './strings';

// a ladder of two keys and the summary, its waves made of plain numbers (the world names no lesson)
const wave = (key) => (rand) => {
  const a = 2 + Math.floor(rand() * 8);
  return {
    type: key,
    key,
    a,
    b: a,
    say: `twice ${a}`,
    gates: [2 * a, 2 * a + 1, '3/4'],
    good: 0,
    why: { right: `${a} + ${a} = ${2 * a}`, wrong: { [2 * a + 1]: 'odd', '3/4': 'a fraction' } },
  };
};
const isRight = (w, g) => g === 2 * w.a;
const ladder = createLadder({
  nodes: [
    {
      id: 'k1',
      levels: [
        { speed: 6, mix: [['k1', {}]] },
        { speed: 6.6, mix: [['k1', {}]] },
      ],
    },
    { id: 'k2', levels: [{ mix: [['k2', {}]] }, { game: 'depot', mix: [['k2', {}]] }] },
    {
      id: SUMMARY,
      levels: [
        {
          speed: 6.2,
          mix: [
            ['k1', {}],
            ['k2', {}],
          ],
        },
      ],
    },
  ],
  generators: { k1: wave('k1'), k2: wave('k2') },
  isRight,
});

describe('a practice level on the river — the pure part', () => {
  it('a level is a COURSE of its waves, one buoy each, never a level up, with the world’s words and the level’s name', () => {
    const { drill, content } = practiceRun({
      ladder,
      node: 0,
      level: 1,
      random: rng(3),
      names: ['level a', 'level b'],
      text: WORLD_TEXT.practice,
    });
    expect(drill).toMatchObject({ node: 0, level: 1, speed: 6.6 });
    expect(drill.waves).toHaveLength(6);
    expect(content.total).toBe(6);
    expect(content.gates).toBeGreaterThan(content.total);
    expect(content.levels).toEqual([{ name: 'level b', from: '' }]);
    expect(content.text.title).toBe('level b');
    expect(content.text.bump).toBe(WORLD_TEXT.practice.bump);
    // every word the run's HUD reads (`kit/GateRunHud.jsx › content.text`) is there
    for (const k of ['say', 'rule', 'start', 'again', 'leave', 'order', 'gate', 'of', 'pause', 'resume', 'quit'])
      expect(typeof content.text[k], k).toBe('string');
    expect(content.text.won.title && content.text.lost.title).toBeTruthy();
    // the round n is the wave n, as the river plays it
    drill.waves.forEach((w, n) => expect(content.round(1, Math.random, n)).toEqual(roundOfWave(w)));
  });

  it('a buoy shows a FACT each — the right one its own, a wrong one what it is; « p/q » over a real bar', () => {
    const w = wave('k1')(rng(1));
    const r = roundOfWave(w);
    expect(r.ask).toBe(w.say);
    expect(r.right).toBe(0);
    expect(r.options).toEqual([{ t: String(2 * w.a) }, { t: String(2 * w.a + 1) }, { tex: '\\dfrac{3}{4}' }]);
    expect(r.why).toEqual([w.why.right, 'odd', 'a fraction']);
    expect(buoyOption('−2/5')).toEqual({ tex: '-\\dfrac{2}{5}' });
    expect(buoyOption('13,75')).toEqual({ t: '13,75' });
  });

  it('a wave that names points hands its figure to the river; one without has none', () => {
    const w = wave('k1')(rng(1));
    expect('figure' in roundOfWave(w)).toBe(false);
    const figure = { points: { A: [0, 0], B: [1, 0] }, segments: [] };
    expect(roundOfWave({ ...w, figure }).figure).toBe(figure);
  });

  it('the pace is the level’s own, rising a little with each buoy; a level without one sails at the legs’ pace', () => {
    const one = practiceRun({ ladder, node: 0, level: 0, random: rng(1), text: WORLD_TEXT.practice }).drill;
    expect(practiceSpeed(one, 0)).toBe(6);
    expect(practiceSpeed(one, 4)).toBeCloseTo(6.2);
    expect(practiceSpeed({ speed: 16.9 }, 100)).toBe(17);
    const none = practiceRun({ ladder, node: 1, level: 0, random: rng(1), text: WORLD_TEXT.practice }).drill;
    expect(none.speed).toBe(railSpeed(1, 0));
  });

  it('stars are the hearts left; a level lost gives none and never lowers what was won; the next level is proposed', () => {
    const drill = { node: 0, level: 0, waves: [{ key: 'k1' }] };
    const keys = ['k1', 'k2'];
    const won = practiceEnd({
      ladder,
      drill,
      result: { won: true, hearts: 2, score: 6, bumps: 1 },
      practice: {},
      keys,
    });
    expect(won.practice['k1:1']).toEqual({ stars: 2, best: 600 });
    expect(won.overlay).toMatchObject({ type: 'result', win: true, stars: 2, mistakes: 1, bumps: 1, key: 'k1' });
    expect(won.overlay.next).toMatchObject({ node: 0, level: 1 });
    const lost = practiceEnd({
      ladder,
      drill,
      result: { won: false, hearts: 0, score: 3 },
      practice: won.practice,
      keys,
    });
    expect(lost.practice).toBe(won.practice);
    expect(lost.overlay).toMatchObject({ win: false, stars: 0, next: null, best: 600 });
    const better = practiceEnd({
      ladder,
      drill,
      result: { won: true, hearts: 3, score: 6 },
      practice: won.practice,
      keys,
    });
    expect(better.practice['k1:1'].stars).toBe(3);
  });
});

/** A stand-in of the runtime: the world's methods run on it, the river records what it is asked. */
function standIn({ keys = ['k1'], phase = 'play', practice = {} } = {}) {
  const calls = [];
  const g = Object.create(NilePyramidsGame.prototype);
  Object.assign(g, {
    lesson: { ladder, text: { levels: { k1: ['first', 'second'], k2: ['first'], [SUMMARY]: ['mixed'] } } },
    T: WORLD_TEXT,
    keysEver: new Set(keys),
    practice,
    state: { phase, run: null, overlay: null, at: 2 },
    hero: { pos: new THREE.Vector3(5, 0, -300), vel: new THREE.Vector3(1, 0, 0), grounded: false },
    hold: null,
    dead: false,
    audio: { unlock() {}, play: (s) => calls.push(['sound', s]) },
    gateRun: {
      open: (c) => {
        calls.push(['open', c]);
        g.state = { ...g.state, phase: 'run', run: { stage: 'ready' } };
      },
      start: () => calls.push(['start']),
      hide: () => calls.push(['hide']),
    },
    set(patch) {
      this.state = { ...this.state, ...patch };
    },
    save: () => calls.push(['save']),
    lookTo() {},
    refreshObjective() {},
    openMap: (sel) => calls.push(['map', sel]),
  });
  return { g, calls };
}

describe('a practice level on the river — the world’s hooks (Game.js)', () => {
  afterEach(() => vi.useRealTimers());

  it('startPractice opens the river with the level and starts it; Zero comes back where he stood', () => {
    const { g, calls } = standIn();
    expect(g.startPractice(0, 0)).toBe(true);
    const open = calls.find((c) => c[0] === 'open')[1];
    expect(open.total).toBe(6);
    expect(open.text.title).toBe('first');
    expect(g.runContent).toBe(open);
    expect(calls.map((c) => c[0])).toContain('start');
    expect(g.drill).toMatchObject({ node: 0, level: 0, speed: 6 });
    g.leaveRun(); // « quit »: nothing kept, back to the hub on that node
    expect(g.drill).toBe(null);
    expect(calls.at(-1)).toEqual(['map', 0]);
    expect(g.hero.pos.toArray()).toEqual([5, 0, -300]);
    expect(g.practice).toEqual({});
  });

  it('refuses a level not open, a case level, and a level while he sails or runs', () => {
    // a rule's first level is open with or without its key (owner, 2026-11-26): it is the ORDER of the levels that holds
    expect(standIn().g.startPractice(1, 1)).toBe(false); // k2 not held: its level 2 before its level 1
    expect(standIn().g.startPractice(0, 1)).toBe(false); // level 2 before level 1
    expect(standIn({ keys: ['k1', 'k2'], practice: { 'k2:1': { stars: 1, best: 0 } } }).g.startPractice(1, 1)).toBe(
      false,
    ); // a real-world case: not on the river
    expect(standIn({ phase: 'sail' }).g.startPractice(0, 0)).toBe(false);
  });

  it('a level won keeps its stars (the hearts left) and shows the kit’s result card; « again » replays it', () => {
    vi.useFakeTimers();
    const { g, calls } = standIn({ phase: 'title' });
    g.startPractice(0, 0);
    expect(g.startRun()).toBe(true); // the run's own « again »: the same level, new waves
    expect(calls.filter((c) => c[0] === 'open')).toHaveLength(2);
    expect(g.runOver({ won: true, hearts: 3, score: 6, bumps: 0 })).toEqual({});
    vi.runAllTimers();
    expect(g.practice['k1:1']).toEqual({ stars: 3, best: 600 });
    expect(g.state).toMatchObject({ phase: 'title', run: null, practice: g.practice });
    expect(g.state.overlay).toMatchObject({ type: 'result', win: true, stars: 3, node: 0, level: 0 });
    expect(calls).toContainEqual(['sound', 'finale']);
    expect(calls).toContainEqual(['save']);
  });

  it('a felucca leg is not a practice level: its end still reaches the next dock', () => {
    const { g } = standIn();
    g.drill = null;
    g.runOver({ won: true, hearts: 1, score: 4 });
    expect(g.runWon).toBe(true);
    expect(g.practice).toEqual({});
  });

  it('« remind me of the rule » shows the rule’s tablet and closing it comes back to the card it came from', () => {
    const { g } = standIn();
    g.state.overlay = { type: 'map', sel: 0 };
    g.showRule('k1', { sel: 0, space: null });
    expect(g.state.overlay).toMatchObject({ type: 'rule', key: 'k1', back: { type: 'map', sel: 0 } });
    g.closeRule();
    expect(g.state.overlay).toMatchObject({ type: 'map', sel: 0 });
  });
});
