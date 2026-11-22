import { describe, it, expect } from 'vitest';
import { M1_ROUNDS, M2_ROUNDS } from './pitch.js';
import { violations } from './forbidden.js';
import * as L from '../../../../../../common/manipulations/logic/vanishingPitch.js';
import * as P from '../../../../../../common/manipulations/logic/vanishingPitchPlayer.js';
import { roundWon, starsFor, emptyLog, logEvent } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * Les manches de jidaa-maadum : le balayage par RÔLE de tout ce qu'un écran peut montrer (règle mécanique, content/forbidden.js), les départs, et
 * chaque manche JOUÉE jusqu'à ses ★★★ avec la logique du labo.
 */
const ROUNDS = [...M1_ROUNDS, ...M2_ROUNDS];
const each = (fn) => ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => fn(x, r)));
const stateOf = (pr) => L.init({ expr: pr.expr, startX: pr.startX, range: pr.range });

describe('the pitch rounds', () => {
  it('every screen (rounds, practice rounds, free choices) is clean by role', () => {
    each((x, r) => expect(violations(P.shownValues(x.props), r.id)).toEqual([]));
  });
  it('the role scan has teeth: a pitch built from the climax factors is caught', () => {
    expect(violations(P.shownValues({ expr: '3x-12|x+6' }), 'control').length).toBeGreaterThan(0);
    expect(violations([{ role: 'rest', v: '−30' }]).length).toBe(1);
  });
  it('every start is a real pitch (never a zero), inside the ruler, and the ruler has the planned size', () => {
    const all = [];
    each((x) => { all.push(x.props); (x.props.choices ?? []).forEach((c) => all.push({ ...x.props, ...c })); });
    all.forEach((pr) => {
      const s = stateOf(pr);
      const v = L.defaultV(s);
      expect(v >= s.range.min && v <= s.range.max, pr.expr).toBe(true);
      expect(Lin0(L.sides(s, v).area), `${pr.expr} starts on a zero`).toBe(false);
    });
    expect(stateOf(M1_ROUNDS[2].props)).toMatchObject({ range: { min: -3, max: 1 } });
    expect(stateOf(M1_ROUNDS[0].props).range).toEqual({ min: -2, max: 5 });
    expect(stateOf(M2_ROUNDS[0].props).range).toEqual({ min: -6, max: 8 });   // halves: [-3 ; 4] x 2
  });
  it('the page defaults are untouched by the new options', () => {
    const a = L.init({ expr: 'x-2|x+5' });
    expect(a.range).toEqual({ min: -7, max: 4 });
    expect(a.startV).toBeUndefined();
    expect(L.defaultV(a)).toBe(0);
  });
  it('the right answers of the predictions differ inside a round', () => {
    [M1_ROUNDS[1], M1_ROUNDS[2], M2_ROUNDS[0], M2_ROUNDS[1]].forEach((r) => {
      const s = stateOf(r.props);
      const t = (r.props.predict ?? []).map((k) => P.predictTruth(s, k));
      expect(new Set(t).size).toBe(t.length);
    });
    expect(P.predictTruth(stateOf(M1_ROUNDS[1].props), 'atZero')).toBe('no');
    expect(P.predictTruth(stateOf(M1_ROUNDS[2].props), 'atZero')).toBe('yes');
    expect(P.predictTruth(stateOf(M1_ROUNDS[2].props), 'zeroB')).toBe('−2');
    expect(P.predictOptions(stateOf(M1_ROUNDS[2].props), 'zeroB')).toEqual(['2', '−2', '−1/2']);
    expect(P.predictTruth(stateOf(M2_ROUNDS[1].props), 'count')).toBe('1');
  });
  it('the build parts are true only for the intended tiles', () => {
    const c = P.buildConstParts(stateOf(M1_ROUNDS[0].props));
    expect(c).toEqual({ expected: ['x - 3', '3'], decoy: '2' });
    const o = P.buildOrParts(stateOf(M1_ROUNDS[1].props));
    expect(o.expected).toEqual(['x - 1', 'أو', 'x + 4']);
    expect(o.decoy).toBe('معًا');
    expect(P.buildSolParts(stateOf(M1_ROUNDS[2].props))).toMatchObject({ expected: ['-2', '0'], decoy: '2' });
    expect(P.buildSolParts(stateOf(M2_ROUNDS[0].props))).toMatchObject({ expected: ['-1', '\\dfrac{3}{2}'], decoy: '\\dfrac{2}{3}' });
  });
});

const Lin0 = (p) => p.n === 0;

/** Joue une manche comme un élève : épingle chaque zéro, balaie des deux côtés, revendique ; renvoie le journal de la manche. */
function play(round, { ask = true } = {}) {
  let s = stateOf(round.props);
  let log = emptyLog();
  const feed = (kind, ev) => { log = logEvent(log, kind, ev); };
  const visit = (v) => { s = L.move(s, v); };
  const pinAt = (v) => {
    visit(v);
    const fresh = P.isNewPin(s);
    s = L.pin(s);
    if (fresh) feed('verdict', P.pinVerdict(s, v));
  };
  s.rootUnits.forEach(pinAt);
  visit(s.range.min); visit(s.range.max);
  s = L.claimNoOther(s);
  if (P.playerReady(s)) feed('trial', { tk: 'discovered' });
  (round.props.predict ?? []).forEach(() => feed('trial', { tk: 'predict', ok: ask }));
  const id = round.goal.find((g) => g.checkpoint)?.checkpoint;
  if (id) feed('trial', { tk: 'checkpoint-done', id });
  return { s, log };
}

describe('every round is playable to ★★★', () => {
  it('the main rounds win with three stars within maxTrials, with no refusal', () => {
    ROUNDS.filter((r) => !r.free).forEach((r) => {
      const { s, log } = play(r);
      expect(P.playerReady(s), r.id).toBe(true);
      expect(roundWon(r, log), r.id).toBe(true);
      expect(starsFor(r, log), r.id).toBe(3);
    });
  });
  it('the practice rounds are really smaller and win too', () => {
    ROUNDS.filter((r) => r.easier).forEach((r) => {
      const big = stateOf(r.props);
      const small = stateOf(r.easier.props);
      expect(small.range.max - small.range.min).toBeLessThanOrEqual(big.range.max - big.range.min);
      const { log } = play(r.easier);
      expect(roundWon(r.easier, log), r.id).toBe(true);
    });
  });
  it('a trial is a NEW pin: the same x twice is not new; a missing claim counts once per set of pins', () => {
    let s = L.move(L.init({ expr: 'x-1|x+4', startX: 3 }), 2);
    expect(P.isNewPin(s)).toBe(true);
    s = L.pin(s);
    expect(P.isNewPin(s)).toBe(false);
    expect(P.pinVerdict(s, 2)).toEqual({ groups: 100 + (2 - s.range.min), exact: false });
    expect(P.isNewMissingClaim(s, [])).toBe(true);
    expect(P.isNewMissingClaim(s, [P.claimKey(s)])).toBe(false);
  });
});
