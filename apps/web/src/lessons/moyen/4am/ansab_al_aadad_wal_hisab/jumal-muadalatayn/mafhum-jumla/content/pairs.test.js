import { describe, it, expect } from 'vitest';
import * as P from '../../../../../../common/manipulations/logic/pairScoreboardPlayer.js';
import * as L from '../../../../../../common/manipulations/logic/pairScoreboard.js';
import { emptyLog, logEvent, starsFor, roundWon, needsHelp } from '../../../../../../common/manipulations/rounds/roundsModel.js';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import { M1_ROUNDS, M2_ROUNDS, SYS, SYS_M2, FREE, PREDICT } from './pairs.js';
import { violations } from './forbidden.js';

/**
 * Les manches du module 1 (verdict §4) JOUÉES par la logique du labo : chaque manche requise atteint son but avec ★★★ en au plus `maxTrials`
 * essais comptés ; les départs n'allument rien ; la solution est unique dans les bornes ; la renversée est refusée par la jauge (2) ; les
 * entraînements sont plus petits ; aucun écran ne montre la signature de la مسألة dans son rôle (le balayage de `shownValues`).
 */
const set = (which, v) => ({ kind: 'set', which, v });
const CLAIM = { kind: 'claim' };
const SWAP = { kind: 'swap' };
const byId = Object.fromEntries(M1_ROUNDS.map((r) => [r.id, r]));
const byM2 = Object.fromEntries(M2_ROUNDS.map((r) => [r.id, r]));
const roundOf = (p) => ({ covered: !!p.covered, free: p.free ?? null });

/** Joue la manche : chaque verdict et chaque événement (découverte, prédictions, suite répondue juste du premier coup) dans le journal. */
function playRound(round, props, actions, { predictions = {} } = {}) {
  let lab = P.initRound(props);
  let log = emptyLog();
  Object.entries(predictions).forEach(([key, says]) => { if (P.predictWhen(key) === 'start') log = logEvent(log, 'trial', { tk: 'predict', ok: says === P.predictTruth(lab, key) }); });
  let sent = false;
  actions.forEach((a) => {
    const r = P.act(lab, a, roundOf(props));
    lab = r.lab;
    r.verdicts.forEach((v) => { log = logEvent(log, 'verdict', v); });
    if (lab.solved && predictions.swapSol && !log.swapAsked) {
      log = { ...logEvent(log, 'trial', { tk: 'predict', ok: predictions.swapSol === P.predictTruth(lab, 'swapSol') }), swapAsked: true };
    }
    if (!sent && P.discovered(lab, props.discover)) { sent = true; log = logEvent(log, 'trial', { tk: 'discovered' }); }
  });
  P.chainsOf(props.chains).forEach((sp) => {
    if (!sp.reached(lab)) return;
    P.questionsOf(sp, lab).forEach((q) => { log = logEvent(log, 'trial', { tk: 'checkpoint', id: sp.id, q, ok: true, tries: 1 }); });
    log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: sp.id });
  });
  return { lab, log, stars: starsFor(round, log), won: roundWon(round, log) };
}

/** Le chemin GÉNÉRIQUE : une ثنائية à une seule jauge, puis la solution, puis la réponse. */
function genericPath(props) {
  const lab = P.initRound(props);
  const sol = P.solutionIn(lab);
  if (props.covered) return [set('x', sol.x), set('y', sol.y), CLAIM];
  let half = null;
  for (let x = lab.range.x.min; x <= lab.range.x.max && !half; x += 1) for (let y = lab.range.y.min; y <= lab.range.y.max && !half; y += 1) {
    const ok = L.okPair(lab, x, y); if (ok[0] !== ok[1]) half = { x, y };
  }
  return [set('x', half.x), set('y', half.y), set('x', sol.x), set('y', sol.y), CLAIM];
}

const ALL = M1_ROUNDS.flatMap((r) => [[r.id, r.props, r], ...(r.easier ? [[`${r.id}-easier`, r.easier.props, r.easier]] : [])]);

describe('mafhum-jumla — the rounds of module 1 (verdict §4)', () => {
  it('the numbers are the verdict\'s: r1 (5 ; 2), r2 (4 ; 5), r3 (8 ; 5), ⭐ (3 ; −1); free (11 ; 3), (6 ; 5), (7 ; 4), (2 ; 1)', () => {
    const solOf = (system, ranges) => P.solutionIn(P.initRound({ system, ranges }));
    expect(solOf(SYS.r1, byId.r1.props.ranges)).toEqual({ x: 5, y: 2 });
    expect(solOf(SYS.r2, byId.r2.props.ranges)).toEqual({ x: 4, y: 5 });
    expect(solOf(SYS.r3, byId.r3.props.ranges)).toEqual({ x: 8, y: 5 });
    expect(solOf(SYS.star)).toEqual({ x: 3, y: -1 });
    expect(FREE.map((s) => solOf(s, byId.free.props.choiceSpec[s].ranges))).toEqual([{ x: 11, y: 3 }, { x: 6, y: 5 }, { x: 7, y: 4 }, { x: 2, y: 1 }]);
    expect(byId.r1.props.ranges.x).toEqual({ min: 0, max: 9 });
    expect(byId.r2.props.ranges.x).toEqual({ min: 0, max: 11 });
    expect(byId.r3.props.ranges.x).toEqual({ min: 0, max: 13 });
    expect(P.initRound({ system: SYS.star, start: byId.challenge.props.start }).range.x).toEqual({ min: -6, max: 10 });
    expect([byId.r1.stars.maxTrials, byId.r2.stars.maxTrials, byId.r3.stars.maxTrials, byId.challenge.stars.maxTrials]).toEqual([6, 3, 4, 4]);
  });
  it.each(ALL.filter(([id]) => id !== 'free'))('%s: the start lights nothing, the solution is unique in the ranges and is not the start', (id, props) => {
    const lab = P.initRound(props);
    expect(L.okPair(lab, lab.start.x, lab.start.y).some(Boolean), id).toBe(false);
    let n = 0;
    for (let x = lab.range.x.min; x <= lab.range.x.max; x += 1) for (let y = lab.range.y.min; y <= lab.range.y.max; y += 1) if (L.okPair(lab, x, y).every(Boolean)) n += 1;
    expect(n, id).toBe(1);
  });
  it('the swapped solution: r1 (2 ; 5) reads 11, r2 (5 ; 4) reads 330, r3 (5 ; 8) reads 23 on gauge 2 — refused; ⭐ (−1 ; 3) lights neither', () => {
    const swapRead = (system, sol) => { const lab = P.initRound({ system }); return [L.okPair(lab, sol.y, sol.x), P.gaugeValue(lab, 1, sol.y, sol.x)?.have]; };
    expect(swapRead(SYS.r1, { x: 5, y: 2 })).toEqual([[true, false], 11]);
    expect(swapRead(SYS.r2, { x: 4, y: 5 })).toEqual([[true, false], 330]);
    expect(swapRead(SYS.r3, { x: 8, y: 5 })).toEqual([[true, false], 23]);
    expect(swapRead(SYS.star, { x: 3, y: -1 })[0]).toEqual([false, false]);
  });
  it('at each accepted pair the two gauges show different numbers; the build tiles and the chips are distinct', () => {
    [['r1', { x: 5, y: 2 }], ['r2', { x: 4, y: 5 }], ['r3', { x: 8, y: 5 }]].forEach(([id, sol]) => {
      const lab = { ...P.initRound(byId[id].props), solved: sol };
      expect(P.gaugeValue(lab, 0, sol.x, sol.y).have).not.toBe(P.gaugeValue(lab, 1, sol.x, sol.y).have);
    });
    const s1 = { ...P.initRound(byId.r1.props), solved: { x: 5, y: 2 } };
    expect(P.buildLine(s1).tiles).toEqual([17, 5, 2, 15]);
    const s2 = { ...P.initRound(byId.r2.props), solved: { x: 4, y: 5 } };
    expect(P.buildEq2(s2).tiles).toEqual([20, 330, 50, 300]);
    const s3 = { ...P.initRound(byId.r3.props), solved: { x: 8, y: 5 } };
    const rc = P.readCovered(s3);
    expect(new Set([rc.right, ...rc.wrong.map((w) => w.v)]).size).toBe(3);
  });
  it('r1 played by hand: (6 ; 1) is the free one-gauge pair, (5 ; 2) is accepted — ★★★', () => {
    const r = playRound(byId.r1, byId.r1.props, [set('x', 6), set('y', 1), set('x', 5), set('y', 2), CLAIM]);
    expect(r.won).toBe(true);
    expect(r.stars).toBe(3);
    expect(r.log.verdicts.filter((v) => v.free)).toHaveLength(1);
  });
  it('r2: three gauge-1 pairs free, (4 ; 5) accepted, the swap free; both predictions right — ★★★ with 1 counted trial', () => {
    expect(PREDICT.r2).toEqual(['manyFirst', 'swapSol']);
    const r = playRound(byId.r2, byId.r2.props, [set('x', 9), SWAP, set('x', 4), set('y', 5), CLAIM, SWAP], { predictions: { manyFirst: 'many', swapSol: 'no' } });
    expect(r.won).toBe(true);
    expect(r.stars).toBe(3);
    expect(r.log.verdicts.filter((v) => !v.free)).toHaveLength(1);
    // a natural walk along the line also fits: (6 ; 3), (3 ; 6), (4 ; 5)
    const w = playRound(byId.r2, byId.r2.props, [set('x', 6), set('y', 3), set('x', 3), set('y', 6), set('x', 4), set('y', 5), CLAIM, SWAP], { predictions: { manyFirst: 'many', swapSol: 'no' } });
    expect(w.stars).toBe(3);
    // a wrong prediction costs one star
    const p = playRound(byId.r2, byId.r2.props, [set('x', 9), SWAP, set('x', 4), set('y', 5), CLAIM, SWAP], { predictions: { manyFirst: 'one', swapSol: 'no' } });
    expect(p.stars).toBe(2);
  });
  it('r3 covered: one free refusal at a full season, then (8 ; 5) — ★★★; the « why » question is in its chain', () => {
    const r = playRound(byId.r3, byId.r3.props, [set('x', 9), set('y', 4), CLAIM, set('x', 8), set('y', 5), CLAIM]);
    expect(r.won).toBe(true);
    expect(r.stars).toBe(3);
    expect(P.questionsOf(P.chainsOf('covered')[0], r.lab)).toEqual(['readCovered', 'coveredWhy']);
    // three refusals open the easier round
    const stuck = playRound(byId.r3, byId.r3.props, [set('x', 9), set('y', 4), CLAIM, set('x', 10), set('y', 3), CLAIM, set('x', 7), set('y', 6), CLAIM]);
    expect(needsHelp(byId.r3, stuck.log)).toBe(true);
  });
  it('⭐ and every easier round reach their goal within maxTrials along a plain path', () => {
    const star = playRound(byId.challenge, byId.challenge.props, [set('x', 5), set('x', 3), set('y', -1), CLAIM]);
    expect(star.stars).toBe(3);
    M1_ROUNDS.filter((r) => r.easier).forEach((r) => {
      const e = playRound(r.easier, r.easier.props, genericPath(r.easier.props));
      expect(e.won, r.id).toBe(true);
      expect(e.stars, r.id).toBe(3);
    });
  });
  it('the easier rounds are really smaller (N 7 → 5, 9 → 5, 13 → 6) and release the round', () => {
    M1_ROUNDS.filter((r) => r.easier).forEach((r) => {
      const big = P.initRound(r.props).shape.N; const small = P.initRound(r.easier.props).shape.N;
      expect(small, r.id).toBeLessThan(big);
      expect(r.easier.releases).toBe(true);
    });
  });
  it('every round screen (rounds, easier rounds, free choices) is clean by role', () => {
    ALL.forEach(([id, props]) => expect(violations(P.shownValues(props), id)).toEqual([]));
  });
  it('module 2 (owner decision OQ1): m2a has NO solution, m2b infinitely many; gauge 2 reads 300 on every gauge-1 pair', () => {
    const a = P.initRound(byM2.m2a.props); const b = P.initRound(byM2.m2b.props);
    expect(LS.classify(a.sys).kind).toBe('none');
    expect(LS.classify(b.sys).kind).toBe('infinite');
    expect([SYS_M2.none, SYS_M2.infinite]).toEqual([byM2.m2a.props.system, byM2.m2b.props.system]);
    [a, b].forEach((lab) => {
      expect(L.okPair(lab, 0, 0).some(Boolean)).toBe(false);
      const ones = P.eq1Pairs(lab);
      expect(ones.length).toBeGreaterThanOrEqual(3);
      ones.forEach((pr) => expect(P.gaugeValue(lab, 1, pr.x, pr.y).have).toBe(300));
    });
    expect(P.eq1Pairs(a).some((pr) => L.okPair(a, pr.x, pr.y)[1])).toBe(false);
    expect(P.eq1Pairs(b).every((pr) => L.okPair(b, pr.x, pr.y)[1])).toBe(true);
    expect([P.parallelFacts(a).kind, P.parallelFacts(b).kind]).toEqual(['none', 'infinite']);
  });
  it('module 2: both rounds played — three gauge-1 pairs (free), one tap — ★★★ with 1 counted trial', () => {
    M2_ROUNDS.forEach((r) => {
      const res = playRound(r, r.props, [set('x', 6), SWAP, set('x', 3), set('y', 3)]);
      expect(res.won, r.id).toBe(true);
      expect(res.stars, r.id).toBe(3);
      expect(res.log.verdicts.filter((v) => !v.free), r.id).toHaveLength(1);
    });
  });
  it('module 2 rounds are clean by role', () => {
    M2_ROUNDS.forEach((r) => expect(violations(P.shownValues(r.props), r.id)).toEqual([]));
  });
  it('the role scan fires (negative control)', () => {
    expect(violations(P.shownValues({ system: 'x+y=42|x-3y=-6', chains: 'none' }), 'ctl').length).toBeGreaterThan(0);
    expect(violations([{ role: 'reading', v: '24' }, { role: 'chip', v: '24' }, { role: 'solution', v: '(30 ; 12)' }])).toHaveLength(2);
  });
});
