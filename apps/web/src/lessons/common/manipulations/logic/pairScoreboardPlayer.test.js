import { describe, it, expect } from 'vitest';
import * as P from './pairScoreboardPlayer.js';

/** Joue une suite de gestes ; rend la manche et tous les verdicts envoyés. */
function play(lab0, actions, round) {
  let lab = lab0; const verdicts = [];
  actions.forEach((a) => { const r = P.act(lab, a, round); lab = r.lab; verdicts.push(...r.verdicts); });
  return { lab, verdicts };
}
const set = (which, v) => ({ kind: 'set', which, v });
const SWAP = { kind: 'swap' };
const CLAIM = { kind: 'claim' };
const R = (min, max) => ({ x: { min, max }, y: { min, max } });

describe('pair-scoreboard player — the start, trials and free verdicts', () => {
  it('the start pair is posed but never a trial; the same pair committed again is not a trial', () => {
    const lab = P.initRound({ system: 'x+y=7|3x+y=17', theme: 'football', ranges: R(0, 9), start: { x: 0, y: 0 } });
    expect([lab.x, lab.y]).toEqual([0, 0]);
    expect(lab.trials).toEqual([]);
    const same = P.act(lab, set('x', 0), {});
    expect(same.verdicts).toEqual([]);
    const moved = play(lab, [set('x', 6), set('x', 0), set('x', 6)], {});
    expect(moved.verdicts).toHaveLength(1);
    expect(moved.lab.trials.map((t) => [t.x, t.y])).toEqual([[6, 0]]);
  });
  it('firstHalf: only the first one-gauge pair is free; an accepted claim on a committed pair adds nothing; a refused claim counts once', () => {
    const lab = P.initRound({ system: 'x+y=7|3x+y=17', theme: 'football', ranges: R(0, 9), start: { x: 0, y: 0 } });
    const r = play(lab, [set('x', 6), set('y', 1), set('x', 2), set('y', 5), CLAIM, CLAIM, set('x', 5), set('y', 2), CLAIM], { free: 'firstHalf' });
    // (6;0) none · (6;1) half FREE · (2;1) none · (2;5) half (second: counted) · claim refused (counted) · same claim again (nothing)
    // (5;5) none · (5;2) both · claim accepted on a committed pair (nothing)
    expect(r.verdicts.map((v) => [v.exact, !!v.free])).toEqual([[false, false], [false, true], [false, false], [false, false], [false, false], [false, false], [true, false]]);
    expect(r.lab.solved).toEqual({ x: 5, y: 2 });
    expect(P.discovered(r.lab, 'contrast')).toBe(true);
  });
  it('gauge1x3: the first three gauge-1 pairs and the swap of the accepted pair are free', () => {
    const lab = P.initRound({ system: 'x+y=9|50x+20y=300', theme: 'coins', ranges: R(0, 11), start: { x: 0, y: 0 } });
    const r = play(lab, [set('x', 9), SWAP, set('x', 4), set('y', 5), CLAIM, SWAP], { free: 'gauge1x3' });
    expect(r.verdicts.map((v) => [v.exact, !!v.free])).toEqual([[false, true], [false, true], [false, false], [true, true], [false, true]]);
    expect(P.gauge1Pairs(r.lab)).toHaveLength(4);
    expect(P.swapSeen(r.lab)).toBe(true);
    expect(P.discovered(r.lab, 'many')).toBe(true);
    // a fourth gauge-1 pair is counted
    const more = P.act(P.act(r.lab, set('x', 3), {}).lab, set('y', 6), { free: 'gauge1x3' });
    expect(more.verdicts[0].free).toBeUndefined();
  });
  it('covered: moving is not a trial; a claim on a new pair is; the first refusal is free; the second claim of a pair counts nothing', () => {
    const lab = P.initRound({ system: 'x+y=13|3x+y=29', theme: 'football', ranges: R(0, 13), start: { x: 0, y: 0 } });
    const round = { covered: true, free: 'firstRefusal' };
    const r = play(lab, [set('x', 9), set('y', 4), CLAIM, CLAIM, set('x', 7), set('y', 6), CLAIM, set('x', 8), set('y', 5), CLAIM], round);
    expect(r.verdicts.map((v) => [v.exact, !!v.free])).toEqual([[false, true], [false, false], [true, false]]);
    expect(P.claimAt(r.lab, 9, 4).ok).toEqual([true, false]);
    expect(P.fullRefused(r.lab)).toMatchObject({ x: 9, y: 4 });
    expect(P.discovered(r.lab, 'covered')).toBe(true);
  });
});

describe('pair-scoreboard player — review 2026-11-12', () => {
  it('a claim on the untouched start pair is not a trial: one refused verdict, the start stays out of the trials', () => {
    const lab = P.initRound({ system: 'x+y=7|3x+y=17', theme: 'football', ranges: R(0, 9), start: { x: 0, y: 0 } });
    const r = play(lab, [CLAIM], { free: 'firstHalf' });
    expect(r.verdicts).toEqual([{ groups: 0, exact: false }]);
    expect(r.lab.trials).toEqual([]);
  });
  it('gauge1x3 (module 2, owner OQ1): discovered after three gauge-1 pairs; a refused claim there is a counted verdict', () => {
    const lab = P.initRound({ system: 'x+y=6|50x+50y=280', theme: 'coins', ranges: R(0, 8), start: { x: 0, y: 0 } });
    const two = play(lab, [set('x', 6), SWAP], { free: 'gauge1x3' });
    expect(P.discovered(two.lab, 'gauge1x3')).toBe(false);
    const three = play(two.lab, [set('x', 3), set('y', 3), CLAIM], { free: 'gauge1x3' });
    expect(P.discovered(three.lab, 'gauge1x3')).toBe(true);
    expect(three.verdicts.map((v) => [v.exact, !!v.free])).toEqual([[false, false], [false, true], [false, false]]);
  });
  it('swapSol is judged by a swap visited BEFORE the acceptance too', () => {
    const lab = P.initRound({ system: 'x+y=9|50x+20y=300', theme: 'coins', ranges: R(0, 11), start: { x: 0, y: 0 } });
    const r = play(lab, [set('x', 5), set('y', 4), set('x', 4), set('y', 5), CLAIM], {});
    expect(P.predictJudged(r.lab, 'swapSol')).toBe(true);
  });
});

describe('pair-scoreboard player — chains, builds, predictions, coach, grid', () => {
  const solved = (system, theme, sol, ranges) => ({ ...P.initRound({ system, theme, ranges, start: { x: 0, y: 0 } }), solved: sol });
  it('the builds are computed on the round: r1 17 = 3 × 5 + 2 (decoy 15), r2 50x + 20y = 300 (decoy 330), r3 chips 29 · 13 · 24', () => {
    const b1 = P.buildLine(solved('x+y=7|3x+y=17', 'football', { x: 5, y: 2 }));
    expect(b1.expected).toEqual([17, 5, 2]);
    expect(b1.decoy).toBe(15);
    expect(new Set(b1.tiles).size).toBe(4);
    const b2 = P.buildEq2(solved('x+y=9|50x+20y=300', 'coins', { x: 4, y: 5 }));
    expect(b2.expected).toEqual([50, 20, 300]);
    expect(b2.tiles).toEqual([20, 330, 50, 300]);
    const c = P.readCovered(solved('x+y=13|3x+y=29', 'football', { x: 8, y: 5 }));
    expect([c.right, ...c.wrong.map((w) => w.v)]).toEqual([29, 13, 24]);
  });
  it('coveredWhy is asked only after a refusal whose gauge 1 was lit', () => {
    let lab = P.initRound({ system: 'x+y=13|3x+y=29', theme: 'football', ranges: R(0, 13), start: { x: 0, y: 0 } });
    lab = play(lab, [set('x', 8), set('y', 5), CLAIM], { covered: true }).lab;
    expect(P.questionsOf(P.chainsOf('covered')[0], lab)).toEqual(['readCovered']);
    lab = play(lab, [set('x', 2), set('y', 2), CLAIM], { covered: true }).lab;
    expect(P.questionsOf(P.chainsOf('covered')[0], lab)).toEqual(['readCovered']);
    lab = play(lab, [set('x', 10), set('y', 3), CLAIM], { covered: true }).lab;
    expect(P.questionsOf(P.chainsOf('covered')[0], lab)).toEqual(['readCovered', 'coveredWhy']);
  });
  it('predictions: many pairs give 9 pieces; the swapped solution is refused; judged by the field', () => {
    const lab = P.initRound({ system: 'x+y=9|50x+20y=300', theme: 'coins', ranges: R(0, 11), start: { x: 0, y: 0 } });
    expect(P.predictTruth(lab, 'manyFirst')).toBe('many');
    expect(P.predictTruth(lab, 'swapSol')).toBe('no');
    const right = (key) => P.predictOptions(key).findIndex((o) => o.says === P.predictTruth(lab, key));
    expect(right('manyFirst')).not.toBe(right('swapSol'));
    expect(P.predictJudged(lab, 'manyFirst')).toBe(false);
    const two = play(lab, [set('x', 9), SWAP], {}).lab;
    expect(P.predictJudged(two, 'manyFirst')).toBe(true);
    expect(P.predictWhen('swapSol')).toBe('accepted');
  });
  it('the coach shows the gesture, never the answer', () => {
    const lab = P.initRound({ system: 'x+y=7|3x+y=17', theme: 'football', ranges: R(0, 9), start: { x: 0, y: 0 } });
    expect(P.coachOf(lab, {}).id).toBe('handleX');
    expect(P.coachOf(lab, { movedX: true }).id).toBe('handleY');
    const one = play(lab, [set('x', 6), set('y', 1)], {}).lab;
    expect(P.coachOf(one, { movedX: true, movedY: true }).id).toBe('claim');
    expect(P.coachOf(P.act(lab, set('x', 6), {}).lab, { movedX: true, movedY: true }).id).toBe('gauge1');
    expect(P.coachOf(lab, { movedX: true, movedY: true, covered: true }).id).toBe('reveal');
    expect(P.coachOf(lab, { done: true })).toBeNull();
  });
  it('the strip grid is the largest cell in width × height, with 1 to 4 rows', () => {
    const g = P.stripGrid({ count: 7, width: 560, maxHeight: 100 });
    expect(g.rows).toBe(1);
    expect(g.width).toBeLessThanOrEqual(560);
    const big = P.stripGrid({ count: 26, width: 560, maxHeight: 100 });
    expect(big.height).toBeLessThanOrEqual(100);
    expect(big.width).toBeLessThanOrEqual(560);
    expect(big.rows).toBeGreaterThan(1);
  });
  it('readings: values only for a count world', () => {
    const c = P.initRound({ system: 'x+y=7|3x+y=17', theme: 'football' });
    const a = P.initRound({ system: 'x-y=4|x+2y=1', start: { x: 1, y: 1 } });
    expect(P.readingsOf(c, 'values')).toBe('values');
    expect(P.readingsOf(a, 'values')).toBe('lines');
    expect(P.gaugeValue(c, 1, 5, 2)).toEqual({ have: 17, target: 17 });
  });
});
