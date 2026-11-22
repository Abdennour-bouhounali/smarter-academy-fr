import { describe, it, expect } from 'vitest';
import { M1_ROUNDS, M2_ROUNDS } from './rays';
import { violations } from './forbidden';
import * as L from '../../../../../../common/manipulations/logic/solutionRay.js';
import * as P from '../../../../../../common/manipulations/logic/solutionRayPlayer.js';
import { roundWon, starsFor, emptyLog, logEvent } from '../../../../../../common/manipulations/rounds/roundsModel.js';

const ROUNDS = [...M1_ROUNDS, ...M2_ROUNDS];
const each = (fn) => ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => fn(x, r)));
const labOf = (p, src = p.ineq) => L.initLab({ ineq: src, whole: p.whole ?? false, min: p.min, max: p.max });

describe('the rays of mutarajiha-ula (council L3)', () => {
  it('five required rounds: M1 r1, r2 and M2 r1, r2, r3; M1 r3 became a star; every round has a free field', () => {
    const required = (rs) => rs.filter((r) => !r.free && !r.optional).map((r) => r.id);
    expect(required(M1_ROUNDS)).toEqual(['r1', 'r2']);
    expect(required(M2_ROUNDS)).toEqual(['r1', 'r2', 'r3']);
    expect(M1_ROUNDS.find((r) => r.id === 'star').optional).toBe(true);
    expect(M1_ROUNDS.find((r) => r.id === 'star').props.ineq).toBe('4x-5<11');
    expect(M1_ROUNDS.at(-1).free && M2_ROUNDS.at(-1).free).toBe(true);
  });
  it('every round screen (rounds, easier rounds, free choices) is clean by role', () => {
    each((x, r) => expect(violations(P.shownValues(x.props), r.id)).toEqual([]));
  });
  it('negative controls: the climax inequality and a colliding one are caught', () => {
    expect(violations(P.shownValues({ ineq: '-3x+5<=20', bracket: true, transform: true }), 'ctl').length).toBeGreaterThan(0);
    expect(violations(P.shownValues({ ineq: '5x+40<=100', whole: true, bracket: false }), 'ctl').length).toBeGreaterThan(0);
    expect(violations(P.shownValues({ ineq: '-3x+480>=200', bracket: true, transform: true }), 'ctl').length).toBeGreaterThan(0);
  });
  it('no phone before the climax (no round sets `context`), and no round has a coefficient or a card ±3', () => {
    each((x) => expect(x.props.context).toBeUndefined());
    each((x, r) => P.shownValues(x.props).filter((v) => v.role === 'coef' || v.role === 'divisor').forEach((v) => expect(['3', '-3'], r.id).not.toContain(v.v)));
  });
  it('every start is explicit, on the line, and is neither the bound nor a neighbour of it', () => {
    each((x, r) => {
      const p = x.props;
      if (r.free || p.choices) return;
      (p.sequence ?? [p.ineq]).forEach((src) => {
        const lab = labOf(p, src);
        expect(p.start, r.id).not.toBeUndefined();
        const k = p.start * lab.den;
        expect(L.inRange(lab, k), `${r.id} range`).toBe(true);
        expect(Math.abs(k - L.boundK(lab)) > lab.den, `${r.id} ${src}`).toBe(true);
      });
    });
  });
  it('the two predictions of a round have different truths; only supported keys', () => {
    each((x, r) => {
      const keys = x.props.predict ?? [];
      keys.forEach((key) => expect(P.PREDICT_KEYS_OK(key), key).toBe(true));
      if (keys.length === 2) {
        const lab = labOf(x.props);
        expect(P.predictTruth(lab, keys[0]) === P.predictTruth(lab, keys[1]) && keys.every((k) => k.startsWith('isSol')), r.id).toBe(false);
      }
    });
    const lab1 = labOf(M1_ROUNDS[1].props);
    expect(P.predictTruth(lab1, 'isSol:3')).toBe('no');
    expect(P.predictTruth(lab1, 'isSol:9')).toBe('yes');
    expect(P.predictTruth(labOf(M2_ROUNDS[1].props), 'redSide')).toBe('small');
    expect(P.predictTruth(labOf(M2_ROUNDS[2].props), 'redSide')).toBe('large');
    expect(P.predictTruth(labOf(M2_ROUNDS[2].props), 'isSol:2')).toBe('yes');
  });
  it('each build has a decoy distinct from its tiles, and every round line holds a solution and a non-solution', () => {
    each((x, r) => (x.props.sequence ?? [x.props.ineq]).forEach((src) => { const lab = labOf(x.props, src); expect(P.edgeInfo(lab), `${r.id} ${src}`).not.toBeNull(); }));
    [M1_ROUNDS[0], M1_ROUNDS[1]].forEach((r) => {
      const b = P.buildIneqParts(labOf(r.props));
      expect(new Set(b.tiles).size).toBe(b.tiles.length);
      expect(b.expected).not.toContain(b.decoy);
    });
  });
  it('M1 rounds are won within maxTrials by a sensible player (start, the last red, its outer neighbour)', () => {
    [[M1_ROUNDS[0], false], [M1_ROUNDS[1], false], [M1_ROUNDS[2], false], [M1_ROUNDS[0].easier, true], [M1_ROUNDS[1].easier, true]].forEach(([r, easy]) => {
      const lab = labOf(r.props);
      const g = P.edgeInfo(lab);
      const ks = [...new Set([r.props.start * lab.den, g.edge, g.out].filter((k) => k != null))];
      let log = emptyLog();
      ks.forEach((k) => { log = logEvent(log, 'verdict', { groups: k, exact: true }); });
      log = logEvent(log, 'trial', { tk: 'discovered' });
      const cp = r.goal.find((c) => c.checkpoint);
      if (cp) log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: cp.checkpoint });
      (r.props.predict ?? []).forEach(() => { log = logEvent(log, 'trial', { tk: 'predict', ok: true }); });
      expect(roundWon(r, log), JSON.stringify(r.props.ineq)).toBe(true);
      expect(ks.length).toBeLessThanOrEqual(r.stars.maxTrials);
      if (!easy && cp) expect(starsFor(r, log)).toBe(3);
    });
  });
  it('M2 flip rounds are played to the end with the lab\'s own judge: bracket, the first line, the BUILT division', () => {
    [M2_ROUNDS[1], M2_ROUNDS[2], M2_ROUNDS[1].easier, M2_ROUNDS[2].easier].forEach((r) => {
      const p = r.props;
      let lab = labOf(p);
      const bk = L.boundK(lab);
      lab = [p.start * lab.den, bk, bk + (L.sideOf(lab.sol) === 'left' ? 1 : -1)].reduce((acc, k) => L.addTrace(acc, k), lab);
      lab = L.placeBracket(lab, { k: bk, side: L.sideOf(lab.sol), toward: L.closedOf(lab.sol) });
      expect(lab.bracket).toBeTruthy();
      let stage = 1;
      for (let i = 0; i < 6 && !L.transformDone(lab); i += 1) {
        if (P.isDivisionStage(L.current(lab))) {
          const d = P.divisionParts(lab);
          // the decoy is refused, the true line accepted
          expect(L.chooseStep(lab, d.card, d.wrongRel).accepted, r.id).toBe(false);
          expect(d.expected[0]).toBe(P.relGlyph(d.rel));
          lab = L.chooseStep(lab, d.card, d.rel).lab; stage += 1;
        } else {
          const card = L.cardsFor(L.current(lab), p.divide)[0];
          lab = L.chooseStep(lab, card, L.candidates(lab, card).rel).lab; stage += 1;
        }
      }
      expect(L.transformDone(lab), r.id).toBe(true);
      const need = r.goal.find((c) => c.solvedAll).solvedAll;
      expect(stage).toBe(need);
    });
  });
  it('the twins are not mirrors: same bound 1, closed in both, opposite sides', () => {
    const a = labOf(M2_ROUNDS[1].props); const b = labOf(M2_ROUNDS[2].props);
    expect(L.boundK(a)).toBe(1); expect(L.boundK(b)).toBe(1);
    expect(L.closedOf(a.sol) && L.closedOf(b.sol)).toBe(true);
    expect(L.sideOf(a.sol)).not.toBe(L.sideOf(b.sol));
  });
  it('sequence rounds: two cases with the SAME bound, one strict one closed', () => {
    const seq = M2_ROUNDS[0].props.sequence;
    const labs = seq.map((s) => L.initLab({ ineq: s, min: -2, max: 10 }));
    expect(labs.map((l) => L.boundK(l))).toEqual([4, 4]);
    expect(labs.map((l) => L.closedOf(l.sol))).toEqual([false, true]);
  });
});
