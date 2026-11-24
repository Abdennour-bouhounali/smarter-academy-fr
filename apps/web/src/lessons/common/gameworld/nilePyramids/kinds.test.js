/**
 * The three experiments and the forge's cases, played without a browser on the plan's numbers (PYRAMIDS_WORLD_PLAN
 * §3.3–§3.6, final). These specs are EXAMPLES of the shapes a lesson's `inquiries.js` writes.
 */
import { describe, expect, it } from 'vitest';
import { initPlan, planReducer, planResult, toolsOf, unknownsOf, CARDS, hintCards, laidOn, roundFig } from './plan';
import { initHalfturn, halfturnReducer, rotate } from './halfturn';
import { initScale, scaleReducer, perimeterChoices } from './scale';
import { thalesCase, caseId, runCase, segName } from './ruleForge';
import { gauge, points, chain, withPieces } from './figure';

import { NESTED, PLAN_SPEC, HALFTURN_SPEC, SCALE_SPEC, BUTTERFLY_PLAN_SPEC, ACROSS_PLAN_SPEC } from './test/specs';

const run = (reducer, spec, s, actions) => actions.reduce((acc, a) => reducer(spec, acc, a), s);

describe('plan, the computing plan (key 📐)', () => {
  it('round 1 is HIS course: the side SB and the piece BM give SM by a cut; 88 fits', () => {
    let s = initPlan(PLAN_SPEC);
    expect(toolsOf(s).map((t) => t.id)).toEqual(['VB-MB']);
    expect(unknownsOf(s, CARDS[0])).toBe(1);
    s = run(planReducer, PLAN_SPEC, s, [
      { type: 'tool', id: 'VB-MB' },
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'BC' },
    ]);
    s = run(planReducer, PLAN_SPEC, s, [{ type: 'type', text: '88' }, { type: 'lay' }]);
    expect(s.laid).toMatchObject({ fact: 'fits', diff: '0' });
  });
  it('a card with two unknowns refuses itself; the piece 11 leaves a gap of 77, written (the mirror)', () => {
    let s = initPlan(PLAN_SPEC);
    s = planReducer(PLAN_SPEC, s, { type: 'pick', card: 'VC' });
    expect(s.refused).toBe('VC');
    expect(s.picked).toEqual([]);
    s = run(planReducer, PLAN_SPEC, s, [
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'BC' },
      { type: 'type', text: '11' },
      { type: 'lay' },
    ]);
    expect(s.laid).toMatchObject({ fact: 'gap', diff: '77' });
    s = run(planReducer, PLAN_SPEC, s, [{ type: 'next' }, { type: 'type', text: '89' }, { type: 'lay' }]);
    expect(s.laid.fact).toBe('overhang');
    expect(hintCards(PLAN_SPEC, s)).toEqual(['BC']);
  });
  it('the whole experiment: a join, then the last round; the result carries every course and his plan', () => {
    let s = initPlan(PLAN_SPEC);
    s = run(planReducer, PLAN_SPEC, s, [
      { type: 'tool', id: 'VB-MB' },
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'BC' },
      { type: 'type', text: '88' },
      { type: 'lay' },
      { type: 'next' },
      { type: 'tool', id: 'VM+MB' },
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'BC' },
      { type: 'type', text: '63' },
      { type: 'lay' },
      { type: 'next' },
      { type: 'tool', id: 'VN+NC' },
      { type: 'pick', card: 'VC' },
      { type: 'pick', card: 'BC' },
      { type: 'type', text: '81' },
      { type: 'lay' },
      { type: 'next' },
    ]);
    expect(s.done).toBe(true);
    const out = planResult(s);
    expect(out.rows.map((r) => r.fact)).toEqual(['fits', 'fits', 'fits']);
    expect(out.plan).toEqual({ cards: ['VC', 'BC'], joins: ['VN+NC'] });
  });
});

describe('plan on BUTTERFLIES (France K2: 416 ; 5,5 ; 12,5 — the across once: too long)', () => {
  const B = BUTTERFLY_PLAN_SPEC;
  it('a butterfly gets its lengths ACROSS the vertex under their own keys, never a piece MB / NC', () => {
    const fig = roundFig(B, 2).fig;
    expect(fig.len).toMatchObject({ VMB: '31,5', VNC: '38,5' });
    expect(fig.len).not.toHaveProperty('MB');
    expect(fig.len).not.toHaveProperty('NC');
    expect(roundFig(B, 0).fig.len.VMB).toBe('81'); // the river: EA = ES + SA = 9 + 72
    // a length already given is kept; a rational plus a root is no one length: null
    const raw = B.rounds[2].fig;
    expect(withPieces({ ...raw, len: { ...raw.len, VMB: '30' } }).len.VMB).toBe('30');
    expect(roundFig(B, 0).fig.len.VNC).toBe('9√2785');
    expect(withPieces({ ...raw, len: { ...raw.len, VC: '√2' } }).len.VNC).toBeNull();
    // the nested figure keeps its pieces, and no across key
    expect(roundFig(B, 1).fig.len).toMatchObject({ MB: '4', NC: '9' });
    expect(roundFig(B, 1).fig.len).not.toHaveProperty('VMB');
    expect(segName(fig, 'VMB')).toBe('AE');
    expect(segName(fig, 'VNC')).toBe('BF');
  });
  it('round 1, HIS river: the across join is offered; 468 (the across) overhangs by 52, 416 fits', () => {
    let s = initPlan(B);
    expect(s.kind).toBe('butterfly');
    expect(toolsOf(s)).toEqual([{ id: 'VM+VB', gives: 'VMB' }]);
    s = run(planReducer, B, s, [
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'BC' },
      { type: 'type', text: '468' },
      { type: 'lay' },
    ]);
    expect(s.laid).toMatchObject({ fact: 'overhang', diff: '52' });
    s = run(planReducer, B, s, [{ type: 'next' }, { type: 'type', text: '416' }, { type: 'lay' }]);
    expect(s.laid).toMatchObject({ fact: 'fits', unknown: 'BC' });
  });
  it('round 2, nested: a join along the side (AB = 6), the piece’s 8,25 overhangs, 5,5 fits', () => {
    let s = run(planReducer, B, initPlan(B), [
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'BC' },
      { type: 'type', text: '416' },
      { type: 'lay' },
      { type: 'next' },
    ]);
    expect(s).toMatchObject({ i: 1, kind: 'nested' });
    expect(toolsOf(s).map((t) => t.id)).toEqual(['VM+MB']);
    s = run(planReducer, B, s, [
      { type: 'tool', id: 'VM+MB' },
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'BC' },
      { type: 'type', text: '8,25' },
      { type: 'lay' },
    ]);
    expect(s.laid).toMatchObject({ fact: 'overhang', diff: '2,75' });
    s = run(planReducer, B, s, [{ type: 'next' }, { type: 'type', text: '5,5' }, { type: 'lay' }]);
    expect(s.laid.fact).toBe('fits');
  });
  it('round 3, the butterfly at k = 2/5: a CUT across (OE = AE − OA = 22,5); the across’s 17,5 overhangs, 2 leaves a gap, 12,5 fits', () => {
    const lay = (text) => [{ type: 'type', text }, { type: 'lay' }, { type: 'next' }];
    const cards = [
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'BC' },
    ];
    let s = run(planReducer, B, initPlan(B), [
      ...cards,
      ...lay('416'),
      { type: 'tool', id: 'VM+MB' },
      ...cards,
      ...lay('5,5'),
    ]);
    expect(s).toMatchObject({ i: 2, kind: 'butterfly', known: ['VM', 'VMB', 'MN'] });
    expect(toolsOf(s)).toEqual([{ id: 'VMB-VM', gives: 'VB' }]);
    s = run(planReducer, B, s, [...cards, { type: 'type', text: '17,5' }, { type: 'lay' }]);
    expect(s.laid).toMatchObject({ fact: 'overhang', diff: '5' });
    s = run(planReducer, B, s, [{ type: 'next' }, { type: 'type', text: '2' }, { type: 'lay' }]);
    expect(s.laid).toMatchObject({ fact: 'gap', diff: '10,5' });
    s = run(planReducer, B, s, [
      { type: 'next' },
      { type: 'tool', id: 'VMB-VM' },
      { type: 'type', text: '12,5' },
      { type: 'lay' },
      { type: 'next' },
    ]);
    expect(s.known).toContain('VB');
    expect(s.done).toBe(true);
    expect(planResult(s).plan).toEqual({ cards: ['VB', 'BC'], joins: ['VMB-VM'] });
    expect(laidOn(roundFig(B, 2).fig, 'BC')).toBe('course');
  });
  it('the unknown ACROSS the vertex is laid as a rope from the vertex: OF = 27,5 typed for BF falls short by 11', () => {
    const A = ACROSS_PLAN_SPEC;
    const fig = roundFig(A, 0).fig;
    expect(laidOn(fig, 'VNC')).toBe('line');
    expect(laidOn(fig, 'VB')).toBe('line');
    expect(laidOn(roundFig(B, 1).fig, 'MB')).toBe('course'); // a nested piece stays a course (the DZ lesson's round 4)
    let s = run(planReducer, A, initPlan(A), [
      { type: 'pick', card: 'VB' },
      { type: 'pick', card: 'VC' },
      { type: 'type', text: '27,5' },
      { type: 'lay' },
    ]);
    expect(s.laid).toMatchObject({ unknown: 'VNC', fact: 'gap', diff: '11' });
    s = run(planReducer, A, s, [{ type: 'next' }, { type: 'type', text: '38,5' }, { type: 'lay' }]);
    expect(s.laid.fact).toBe('fits');
  });
});

describe('halfturn, the half-turn (key 🦋)', () => {
  it('he says where K lands, turns by 30° steps, and K lands on line (IP); the crooked one lands crooked', () => {
    let s = initHalfturn(HALFTURN_SPEC);
    s = halfturnReducer(HALFTURN_SPEC, s, { type: 'predict', line: 'C' });
    for (let k = 0; k < 6; k += 1) s = halfturnReducer(HALFTURN_SPEC, s, { type: 'turn', d: 1 });
    expect(s.stage).toBe('landed');
    expect(s.rows[0]).toMatchObject({ landed: 'B', right: false, parallel: true });
    s = run(halfturnReducer, HALFTURN_SPEC, s, [{ type: 'next' }, { type: 'predict', line: 'B' }]);
    for (let k = 0; k < 6; k += 1) s = halfturnReducer(HALFTURN_SPEC, s, { type: 'turn', d: 1 });
    expect(s.rows[1]).toMatchObject({ right: true, parallel: false });
    expect(halfturnReducer(HALFTURN_SPEC, s, { type: 'next' }).done).toBe(true);
  });
  it('the turn stops at 0° and at 180°; the half-turn carries K onto the ray of P', () => {
    let s = halfturnReducer(HALFTURN_SPEC, initHalfturn(HALFTURN_SPEC), { type: 'predict', line: 'B' });
    s = halfturnReducer(HALFTURN_SPEC, s, { type: 'turn', d: -1 });
    expect(s.angle).toBe(0);
    const P = points(HALFTURN_SPEC.rounds[0].fig);
    const k = rotate(P.K, 180);
    expect(k[0]).toBeCloseTo(35, 9);
    expect(Math.abs(k[1])).toBeLessThan(1e-9);
    expect(P.P[0]).toBeCloseTo(50, 9);
  });
});

describe('scale, the copying frame (key 🔍)', () => {
  it('the capstone is a fact; 6/5 on AMN covers ABC; on ABC it goes beyond; 5/6 brings ABC back; × k is the perimeter', () => {
    let s = initScale(SCALE_SPEC);
    expect(s.stage).toBe('fact');
    s = run(scaleReducer, SCALE_SPEC, s, [{ type: 'next' }, { type: 'say', v: 'exact' }, { type: 'feed' }]);
    expect(s.copy).toMatchObject({ sides: ['24', '48', '66'], image: 'exact', perimeter: '138' });
    expect(s.rows.at(-1).right).toBe(true);
    s = run(scaleReducer, SCALE_SPEC, s, [{ type: 'next' }, { type: 'say', v: 'smaller' }, { type: 'feed' }]);
    expect(s.copy.image).toBe('outside');
    expect(s.rows.at(-1).right).toBe(false);
    s = run(scaleReducer, SCALE_SPEC, s, [
      { type: 'next' },
      { type: 'frac', part: 'n', text: '6' },
      { type: 'frac', part: 'd', text: '5' },
      { type: 'feed' },
    ]);
    expect(s.copy.image).toBe('outside');
    s = run(scaleReducer, SCALE_SPEC, s, [
      { type: 'next' },
      { type: 'frac', part: 'n', text: '5' },
      { type: 'frac', part: 'd', text: '6' },
      { type: 'feed' },
    ]);
    expect(s.copy).toMatchObject({ image: 'exact', sides: ['20', '40', '55'] });
    s = scaleReducer(SCALE_SPEC, s, { type: 'next' });
    expect(perimeterChoices(SCALE_SPEC, 'small', '6/5')).toEqual({ times: '138', plus: '116,2', times3: '414' });
    s = run(scaleReducer, SCALE_SPEC, s, [{ type: 'choose', v: 'times' }, { type: 'feed' }]);
    expect(s.rows.at(-1)).toMatchObject({ right: true, perimeter: '138' });
    expect(scaleReducer(SCALE_SPEC, s, { type: 'next' }).done).toBe(true);
  });
});

describe('a case of the forge is a Thalès figure (plan §2.3)', () => {
  const fresh = thalesCase({
    names: NESTED,
    len: { VM: '14', VB: '63', VN: '16', VC: '72', MN: '18', BC: '81' },
    head: 'new',
  });
  const old = thalesCase({
    names: { ...NESTED, M: 'P', N: 'Q' },
    len: { VM: '39', VB: '63', VN: '28', VC: '72', MN: '41', BC: '81' },
  });
  it('the new canal holds the chain, the old one does not; the pieces are added', () => {
    expect(fresh.held).toBe(true);
    expect(old.held).toBe(false);
    expect(fresh.len).toMatchObject({ MB: '49', NC: '56' });
    expect(runCase(fresh).ratios).toEqual({ VB: '2/9', VC: '2/9', BC: '2/9' });
    expect(gauge(fresh).aligned).toBe(true);
    expect(gauge(old).aligned).toBe(false);
  });
  it('a case has its identity and names its segments with its own letters', () => {
    expect(caseId(old)).not.toBe(caseId(fresh));
    expect(segName(old, 'VM')).toBe('AP');
  });
  it('the drawing puts every point at its lengths', () => {
    const P = points(fresh);
    const d = (a, b) => Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]);
    expect(d('B', 'C')).toBeCloseTo(81, 9);
    expect(d('M', 'N')).toBeCloseTo(18, 9);
    expect(chain(fresh)).toBe(true);
  });
});
