import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { isRight, MENTAL, PRACTICE_NODES, ladder, EXAM } from './practice';
import { gatePoints } from '../../../../../../common/gameworld/kit/ladder';
import { MISSIONS } from '../../../../../../common/gameworld/divisorIsles/cases';
import { explain, waveSay, T } from '../../../../../../common/gameworld/divisorIsles/strings';

const {
  LEVEL_ORDER,
  makeRun,
  makeWave,
  levelId,
  nodeOpen,
  levelOpen,
  nextLevel,
  practiceStars,
  MAX_PRACTICE_STARS,
  isCase: isDepot,
} = ladder;
const KEYS = PRACTICE_NODES.filter((n) => n.id !== EXAM).map((n) => n.id);
const DASH = LEVEL_ORDER.filter((x) => !isDepot(x.node, x.level));

describe('حلبة التدريب — practice logic', () => {
  it('has five nodes: two runs then a field mission per key, one run then three cases for the exam — 16 levels, 48 stars', () => {
    expect(PRACTICE_NODES).toHaveLength(5);
    expect(LEVEL_ORDER).toHaveLength(16);
    expect(MAX_PRACTICE_STARS).toBe(48);
    expect(PRACTICE_NODES.at(-1).id).toBe(EXAM);
    for (const node of PRACTICE_NODES) {
      expect(node.levels[0].game).toBeUndefined(); // every node starts with the easiest: a run
      expect(node.levels.at(-1).game).toBe('depot'); // and ends in the real world
      for (const l of node.levels) if (l.game === 'depot') expect(MISSIONS[l.mission]).toBeTruthy();
    }
    expect(
      new Set(
        LEVEL_ORDER.filter((x) => isDepot(x.node, x.level)).map((x) => PRACTICE_NODES[x.node].levels[x.level].mission),
      ).size,
    ).toBe(7);
  });

  it('every wave of every level has exactly one right gate, three different gates, and a key of the lesson', () => {
    for (const { node, level } of DASH)
      for (let seed = 1; seed <= 60; seed += 1) {
        for (const w of makeRun(rng(seed * 7919 + node * 31 + level), node, level)) {
          expect(w.gates).toHaveLength(3);
          expect(new Set(w.gates).size).toBe(3);
          expect(w.gates.filter((n) => isRight(w, n))).toEqual([w.gates[w.good]]);
          expect(KEYS).toContain(w.key);
          if (PRACTICE_NODES[node].id !== EXAM) expect(w.key).toBe(PRACTICE_NODES[node].id);
        }
      }
  });

  it('the gate dash is MENTAL arithmetic: every number to work with stays inside the multiplication tables', () => {
    for (const { node, level } of DASH)
      for (let seed = 1; seed <= 80; seed += 1)
        for (const w of makeRun(rng(seed * 53 + node * 7 + level), node, level, 8)) {
          const right = w.gates[w.good];
          if (w.a != null) expect(w.a, `${w.type} a`).toBeLessThanOrEqual(MENTAL.a);
          if (w.b != null) expect(w.b, `${w.type} b`).toBeLessThanOrEqual(MENTAL.b);
          if (w.q != null) expect(w.q, `${w.type} q`).toBeLessThanOrEqual(MENTAL.b);
          expect(right, `${w.type} right gate`).toBeLessThanOrEqual(MENTAL.a);
          // a wrong gate is either small, or an obvious multiple of the number (the trap), never a number to divide by hand
          for (const n of w.gates)
            if (n !== right && n > 12)
              expect(
                ['multipleOf', 'divisibleBy', 'biggest', 'smallest', 'sureOf'].includes(w.type) ||
                  (w.a && n % w.a === 0),
                `${w.type} gate ${n} for ${w.a ?? w.b}`,
              ).toBe(true);
        }
    // the slowest gate leaves at least 5 seconds of thinking, the fastest at least 4.5
    for (const { node, level } of DASH)
      expect(34 / (PRACTICE_NODES[node].levels[level].speed + 0.72)).toBeGreaterThan(4.5);
  });

  it('a level gets harder inside its node: bigger numbers, higher speed', () => {
    for (const node of PRACTICE_NODES.slice(0, 4)) expect(node.levels[1].speed).toBeGreaterThan(node.levels[0].speed);
    const biggest = (node, level) =>
      Math.max(
        ...Array.from({ length: 40 }, (_, s) => makeRun(rng(s + 1), node, level))
          .flat()
          .flatMap((w) => [w.a ?? 0, ...w.gates]),
      );
    expect(biggest(0, 1)).toBeGreaterThan(biggest(0, 0));
    expect(biggest(1, 1)).toBeGreaterThan(biggest(1, 0));
  });

  it('the divisor / multiple trap is really on the rail in the levels that announce it', () => {
    const runs = Array.from({ length: 30 }, (_, s) => makeRun(rng(s + 11), 2, 1)).flat();
    for (const w of runs) {
      if (w.type === 'divisorOf') expect(w.gates.some((n) => n > w.a && n % w.a === 0)).toBe(true); // a multiple of a among the gates
      if (w.type === 'multipleOf') expect(w.gates.some((n) => n < w.b && w.b % n === 0)).toBe(true); // a divisor of b among the gates
    }
  });

  it('never asks the same numbers twice in a row', () => {
    const run = makeRun(rng(5), 3, 0, 8);
    for (let i = 1; i < run.length; i += 1)
      expect(run[i].type === run[i - 1].type && run[i].a === run[i - 1].a && run[i].b === run[i - 1].b).toBe(false);
    expect(makeWave(rng(3), 0, 0, null)).toBeTruthy();
  });

  it('opens a node with its key, a level after the one before, the exam after the first level of the four nodes', () => {
    expect(nodeOpen(0, [], {})).toBe(false);
    expect(nodeOpen(0, [KEYS[0]], {})).toBe(true);
    expect(levelOpen(0, 1, [KEYS[0]], {})).toBe(false);
    expect(levelOpen(0, 1, [KEYS[0]], { [levelId(0, 0)]: { stars: 1 } })).toBe(true);
    const four = Object.fromEntries([0, 1, 2, 3].map((i) => [levelId(i, 0), { stars: 2 }]));
    expect(nodeOpen(4, KEYS, {})).toBe(false);
    expect(nodeOpen(4, KEYS, four)).toBe(true);
    expect(nextLevel(KEYS, {}).id).toBe(levelId(0, 0));
    expect(nextLevel(KEYS, { [levelId(0, 0)]: { stars: 3 } }).id).toBe(levelId(0, 1));
    expect(nextLevel([], {})).toBe(null);
    const all = Object.fromEntries(LEVEL_ORDER.map((x) => [x.id, { stars: 3 }]));
    expect(nextLevel(KEYS, all)).toBe(null);
    expect(nextLevel(KEYS, { ...all, [levelId(2, 1)]: { stars: 2 } }).id).toBe(levelId(2, 1));
    expect(practiceStars(all)).toBe(48);
  });

  it('pays more for a streak', () => {
    expect([1, 2, 3, 5, 9].map(gatePoints)).toEqual([100, 100, 150, 200, 200]);
  });

  it('writes a sentence for every wave and a guidance for every wrong gate — with the true division', () => {
    for (const { node, level } of DASH)
      for (const w of makeRun(rng(node * 100 + level + 3), node, level, 8)) {
        expect(waveSay(w).length).toBeGreaterThan(3);
        for (const n of w.gates)
          if (n !== w.gates[w.good]) {
            const g = explain(w, n);
            expect(g.wrong.length).toBeGreaterThan(8);
            expect(g.right.length).toBeGreaterThan(8);
            expect(`${g.wrong}${g.right}`).not.toMatch(/undefined|NaN/);
          }
        expect(T.tablets[w.key]).toBeTruthy();
      }
    // the classic confusion is named: 60 is a MULTIPLE of 30, not a divisor
    const g = explain({ type: 'divisorOf', key: KEYS[2], a: 30, gates: [15, 60, 7], good: 0 }, 60);
    expect(g.wrong).toContain('مضاعف');
    // and a number that leaves a remainder is answered by its division
    expect(explain({ type: 'divisorOf', key: KEYS[0], a: 42, gates: [6, 5, 4], good: 0 }, 5).wrong).toContain(
      '42 = 5 \\times 8 + 2',
    );
  });
});
