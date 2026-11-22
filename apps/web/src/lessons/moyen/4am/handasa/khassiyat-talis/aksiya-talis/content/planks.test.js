import { describe, it, expect } from 'vitest';
import { M1_ROUNDS, PREDICT, FREE } from './planks.js';
import { violations, fourToFive } from './forbidden.js';
import * as L from '../../../../../../common/manipulations/logic/parallelLevel.js';
import { CHAINS_PLAYER } from '../../../../../../common/manipulations/geometry/ParallelLevel.jsx';
import { emptyLog, logEvent, roundWon, starsFor, needsHelp, countedTrials } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * Le niveau à bulle d'aksiya-talis (conseil du 2026-11-10, verdict L2). ÉCRIT AVANT les données des manches et lancé d'abord sur leurs nombres :
 * pour chaque manche, TOUT ce que son écran peut montrer (`logic › shownValues` : les barres, chaque encoche, chaque rapport atteignable par le
 * glisser, chaque pastille et son leurre, les positions des prédictions, les paires de la manche libre) ne rencontre jamais la signature de la
 * مسألة (content/forbidden.js). Puis chaque manche est JOUÉE jusqu'à son but, comme le labo la joue (un essai = un appui sur « ضع الميزان »).
 */
const playable = M1_ROUNDS.filter((r) => !r.free);
const labOf = (p) => L.init({ AB: p.AB, AC: p.AC, ratio: p.ratio, mode: p.mode });

/** Rejoue une manche : chaque position NOUVELLE est un verdict (le premier refus gratuit), la découverte et les suites annoncées quand le labo les atteint. */
function play(props, positions, { preds = [], answer = true } = {}) {
  let s = labOf(props);
  let log = emptyLog();
  let refused = 0; let told = false;
  const done = new Set();
  preds.forEach((ok) => { log = logEvent(log, 'trial', { tk: 'predict', ok }); });
  const chains = CHAINS_PLAYER[props.chains] ?? [];
  positions.forEach(([bp, cp]) => {
    const seen = s.trials.some((x) => x.bp === bp && x.cp === cp);
    s = L.commit(L.move(L.move(s, 'B', L.slotOf(bp)), 'C', L.slotOf(cp)), 'B', null);
    if (!seen) {
      const v = L.verdictOf(s, s.trials.at(-1));
      const free = !v.exact && refused === 0;
      if (!v.exact) refused += 1;
      log = logEvent(log, 'verdict', { ...v, ...(free ? { free: true } : {}) });
    }
    if (L.playerDiscovery(s) && !told) { told = true; log = logEvent(log, 'trial', { tk: 'discovered' }); }
    chains.filter((c) => c.reached(s) && !done.has(c.id)).forEach((c) => {
      if (!answer) return;
      done.add(c.id);
      log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: c.id });
    });
  });
  return { s, log, done };
}

describe('the forbidden rule (content/forbidden.js) catches what it must', () => {
  it('flags the climax bars, holes, ratios and products — and nothing of a clean screen', () => {
    expect(violations(L.shownValues({ AB: 20, AC: 24, mode: 'crossing' })).length).toBeGreaterThan(0);   // a bar of 20, a bar of 24, a notch at 24…
    expect(violations([{ role: 'distance', v: '24' }])).toHaveLength(1);
    expect(violations([{ role: 'ratio', v: '9/20' }])).toHaveLength(1);
    expect(violations([{ role: 'decoy', v: '-3/10' }])).toHaveLength(1);
    expect(violations([{ role: 'bar', v: '20' }])).toHaveLength(1);
    expect(violations([{ role: 'bar', v: '9' }, { role: 'distance', v: '9' }])).toHaveLength(0);   // 9 is a WEIGHT in the climax
    expect(violations(L.shownValues({ AB: 20, AC: 18, mode: 'crossing' })).some((x) => x.includes('9/20'))).toBe(true);
    expect(fourToFive(8, 10)).toBe(true);
  });
});

describe('the plank rounds of aksiya-talis', () => {
  it('the council\'s numbers: 3/6 → 9/12 at 1/3 → 8/12 free → ⭐ 12/16 → free pairs; practice 2/4, 3/6 at 1/3, 3/6', () => {
    expect(M1_ROUNDS.map((r) => [r.props.AB, r.props.AC, r.props.mode, r.props.ratio ?? null]))
      .toEqual([[3, 6, 'ladder', null], [9, 12, 'crossing', '1/3'], [8, 12, 'crossing', null], [12, 16, 'crossing', null], [6, 9, 'crossing', null]]);
    expect(M1_ROUNDS.slice(0, 3).map((r) => [r.easier.props.AB, r.easier.props.AC, r.easier.props.ratio ?? null])).toEqual([[2, 4, null], [3, 6, '1/3'], [3, 6, null]]);
    expect(FREE).toEqual([[6, 9], [4, 8], [12, 18], [14, 21]]);
    expect(M1_ROUNDS.map((r) => r.props.chains)).toEqual(['ladder', 'side', 'cross', 'none', 'none']);
    expect(M1_ROUNDS.map((r) => r.props.ratios)).toEqual(['hide', 'pick', 'pick', 'pick', 'show']);
  });

  it('the level positions, recomputed by converse', () => {
    const levels = (p) => {
      const lab = labOf(p); const out = [];
      for (let sb = lab.rangeB.min; sb <= lab.rangeB.max; sb += 1) for (let sc = lab.rangeC.min; sc <= lab.rangeC.max; sc += 1) {
        const at = { bp: L.abscissaOf(sb), cp: L.abscissaOf(sc) };
        const r = L.reading(lab, at);
        if (r.parallel && (r.condition ?? true)) out.push([at.bp, at.cp]);
      }
      return out.sort((a, b) => a[0] - b[0]);
    };
    expect(levels(M1_ROUNDS[0].props)).toEqual([[1, 2], [2, 4]]);
    expect(levels(M1_ROUNDS[0].easier.props)).toEqual([[1, 2]]);
    expect(levels(M1_ROUNDS[1].props)).toEqual([[-3, -4], [3, 4]]);
    expect(levels(M1_ROUNDS[2].props)).toEqual([[-4, -6], [-2, -3], [2, 3], [4, 6], [6, 9]]);
    expect(levels(M1_ROUNDS[3].props)).toEqual([[-6, -8], [-3, -4], [3, 4], [6, 8], [9, 12]]);
    // every round starts tilted
    M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => expect(L.reading(labOf(x.props)).parallel, r.id).toBe(false)));
  });

  it('no screen of any round, practice round or free pair meets the climax signature (role-paired, dry-run over every drag-reachable value)', () => {
    M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      expect(violations(L.shownValues(x.props), r.id), r.id).toEqual([]);
      expect(fourToFive(x.props.AB, x.props.AC), r.id).toBe(false);
    }));
    FREE.forEach(([b, c]) => { expect(violations(L.shownValues({ AB: b, AC: c, mode: 'crossing' }), `free ${b}/${c}`)).toEqual([]); expect(fourToFive(b, c)).toBe(false); });
    // every number written in a title, a lead, a mission or a help line
    M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const words = `${r.title ?? ''} ${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''}`.match(/\d+/g) ?? [];
      words.forEach((w) => expect(['24', '30', '36', '44', '45', '46', '80', '100', '25', '2400', '3600', '3680'].includes(w), `${r.id}: ${w}`).toBe(false));
    }));
  });

  it('predictions: at most two per round, their truths differ within a round, the right option moves (2nd, 1st, 2nd)', () => {
    const truths = (p, list) => list.map((x) => L.predictTruth(labOf(p), x.at));
    expect(truths(M1_ROUNDS[1].props, PREDICT.r2)).toEqual(['no', 'yes']);
    expect(truths(M1_ROUNDS[2].props, PREDICT.r3)).toEqual(['no']);
    // the options are always [yes, no]: the right one sits 2nd, 1st, 2nd
    expect([...truths(M1_ROUNDS[1].props, PREDICT.r2), ...truths(M1_ROUNDS[2].props, PREDICT.r3)].map((x) => (x === 'yes' ? 0 : 1))).toEqual([1, 0, 1]);
    M1_ROUNDS.forEach((r) => expect((r.props.predict ?? []).length, r.id).toBeLessThanOrEqual(2));
    // r2 P1 is « same side, wrong ratio » (never the climax's opposite-sides trap — moved to r3, L2.4); r2 P2 « both past A »
    const r2 = L.reading(labOf(M1_ROUNDS[1].props), { bp: 3, cp: 6 });
    expect([r2.sameOrder, r2.ratiosEqual]).toEqual([true, false]);
    expect(L.classOf(L.reading(labOf(M1_ROUNDS[1].props), { bp: -3, cp: -4 }))).toBe('par1');
    expect(L.classOf(L.reading(labOf(M1_ROUNDS[2].props), { bp: 2, cp: -3 }))).toBe('order');
  });

  it('every goal is reachable by doing, with three stars inside maxTrials; the first refusal is free', () => {
    const plays = {
      r1: play(M1_ROUNDS[0].props, [[1, 2], [2, 4]]),
      r2: play(M1_ROUNDS[1].props, [[3, 4], [-3, -4]], { preds: [true, true] }),
      r3: play(M1_ROUNDS[2].props, [[2, 3], [-2, -3], [2, -3]], { preds: [true] }),
      challenge: play(M1_ROUNDS[3].props, [[3, 4], [-3, -4]]),
    };
    playable.forEach((r) => {
      const { log } = plays[r.id];
      expect(roundWon(r, log), r.id).toBe(true);
      expect(starsFor(r, log), r.id).toBe(3);
    });
    expect(countedTrials(plays.r3.log)).toBe(2);   // the opposite-sides plank is the free refusal
    // the practice rounds are won too
    expect(roundWon({ id: 'e1', goal: M1_ROUNDS[0].easier.goal }, play(M1_ROUNDS[0].easier.props, [[1, 2]]).log)).toBe(true);
    expect(roundWon({ id: 'e2', goal: M1_ROUNDS[1].easier.goal }, play(M1_ROUNDS[1].easier.props, [[1, 2], [-1, -2]]).log)).toBe(true);
    expect(roundWon({ id: 'e3', goal: M1_ROUNDS[2].easier.goal }, play(M1_ROUNDS[2].easier.props, [[1, 2], [-1, -2], [1, -2]]).log)).toBe(true);
  });

  it('a round is never won while its question is open: every question asked is in the goal', () => {
    playable.forEach((r) => {
      (CHAINS_PLAYER[r.props.chains] ?? []).forEach((c) => expect(r.goal.some((g) => g.checkpoint === c.id), `${r.id} ${c.id}`).toBe(true));
    });
    expect(roundWon(M1_ROUNDS[0], play(M1_ROUNDS[0].props, [[1, 2], [2, 4]], { answer: false }).log)).toBe(false);
    expect(roundWon(M1_ROUNDS[1], play(M1_ROUNDS[1].props, [[3, 4], [-3, -4]], { answer: false }).log)).toBe(false);
    expect(roundWon(M1_ROUNDS[2], play(M1_ROUNDS[2].props, [[2, 3], [-2, -3], [2, -3]], { answer: false }).log)).toBe(false);
    // the easier r1 asks « lv », and it is in its goal
    expect(M1_ROUNDS[0].easier.goal).toContainEqual({ checkpoint: 'lv' });
  });

  it('the same position pressed again is not a trial; walking between two ends never counts', () => {
    const { log } = play(M1_ROUNDS[0].props, [[2, 5], [2, 5], [1, 2], [2, 4]]);
    expect(log.verdicts).toHaveLength(3);
    expect(countedTrials(log)).toBe(2);
  });

  it('three refusals offer « جرّب أصغر »; the challenge and the free round never do', () => {
    const { log } = play(M1_ROUNDS[0].props, [[2, 5], [1, 3], [2, 3]]);
    expect(needsHelp(M1_ROUNDS[0], log)).toBe(true);
    expect(needsHelp(M1_ROUNDS[3], log)).toBe(false);
    expect(needsHelp(M1_ROUNDS[4], log)).toBe(false);
  });
});
