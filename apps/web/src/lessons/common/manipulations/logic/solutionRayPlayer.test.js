import { describe, it, expect } from 'vitest';
import * as L from './solutionRay.js';
import * as P from './solutionRayPlayer.js';

const lab = (ineq, o = {}) => L.initLab({ ineq, ...o });
const trace = (l, ...ks) => ks.reduce((acc, k) => L.addTrace(acc, k), l);

describe('solution-ray — player logic', () => {
  it('cardsFor(divide: coef) offers only the division by the coefficient itself; the page still offers both', () => {
    const pos = L.parseIneq('2x<=2'); const neg = L.parseIneq('-2x<=-2');
    expect(L.cardsFor(pos)).toHaveLength(2);
    expect(L.cardsFor(pos, 'coef').map((c) => L.cardTex(c))).toEqual(['\\div 2']);
    expect(L.cardsFor(neg, 'coef').map((c) => L.cardTex(c))).toEqual(['\\div (-2)']);
  });
  it('isDivisionStage', () => {
    expect(P.isDivisionStage(L.parseIneq('2x<=2'))).toBe(true);
    expect(P.isDivisionStage(L.parseIneq('2x+7<=9'))).toBe(false);
    expect(P.isDivisionStage(L.parseIneq('x<=2'))).toBe(false);
  });
  it('the border is seen only when the last working graduation AND its outer neighbour are traced', () => {
    const l0 = lab('6x+20<=80', { whole: true, min: 0, max: 18 });
    expect(P.edgeInfo(l0)).toMatchObject({ left: true, edge: 10, out: 11 });
    expect(P.borderSeen(trace(l0, 16, 10))).toBe(false);
    expect(P.borderSeen(trace(l0, 11))).toBe(false);
    expect(P.borderSeen(trace(l0, 10, 11))).toBe(true);
    const r = lab('15x+25>100', { whole: true, min: 0, max: 14 });
    expect(P.edgeInfo(r)).toMatchObject({ left: false, edge: 6, out: 5 });
    expect(P.borderSeen(trace(r, 6, 5))).toBe(true);
  });
  it('the division to build: right line, decoy = the other direction, refused with a witness from the traces', () => {
    const l0 = lab('-2x+7<=5', { min: -6, max: 6 });
    let l = trace(l0, 0, 3, 1, 0);
    l = L.placeBracket(l, { k: 1, side: 'right', toward: true });
    const card = L.cardsFor(L.current(l))[0];
    l = L.chooseStep(l, card, L.candidates(l, card).rel).lab;
    expect(P.isDivisionStage(L.current(l))).toBe(true);
    const d = P.divisionParts(l);
    expect(d.expected).toEqual(['≥', '1']);
    expect(d.tiles).toEqual(['≥', '1', '≤']);
    expect(d.refusal.accepted).toBe(false);
    expect(d.refusal.witness).toBeTruthy();
    const f = P.divisionFillParts(l);
    expect(f).toMatchObject({ expected: '1', divisor: '-2', dividend: '-2' });
    expect(f.options).toEqual(['1', '-1', '-4', '0']);
  });
  it('the positive twin keeps the direction; the twins share the bound 1 (closed) and are not mirrors', () => {
    const a = lab('2x+7<=9', { min: -6, max: 6 }); const b = lab('-2x+7<=5', { min: -6, max: 6 });
    expect(L.rayOf(a.ineq)).toMatchObject({ rel: '<=' });
    expect(L.rayOf(b.ineq)).toMatchObject({ rel: '>=' });
    expect(L.boundK(a)).toBe(1); expect(L.boundK(b)).toBe(1);
  });
  it('buildIneqParts: the tiles hold the numbers, the sign and ONE decoy sign', () => {
    const b = P.buildIneqParts(lab('6x+20<=80', { whole: true, min: 0, max: 18 }));
    expect(b.expected).toEqual(['6', '20', '≤', '80']);
    expect(b.tiles).toEqual(['6', '20', '≤', '80', '<']);
    const c = P.buildIneqParts(lab('15x+25>100', { whole: true, min: 0, max: 14 }));
    expect(c.tiles.at(-1)).toBe('≥');
  });
  it('edgeFillParts', () => {
    const f = P.edgeFillParts(lab('6x+20<=80', { whole: true, min: 0, max: 18 }));
    expect(f.costOptions).toEqual(['80', '86', '60', '30']);
    const g = P.edgeFillParts(lab('15x+25>100', { whole: true, min: 0, max: 14 }));
    expect(g.edgeOptions).toEqual(['6', '5', '7', '4']);
  });
  it('predictions: truth is computed', () => {
    const l = lab('15x+25>100', { whole: true, min: 0, max: 14 });
    expect(P.predictTruth(l, 'isSol:3')).toBe('no');
    expect(P.predictTruth(l, 'isSol:9')).toBe('yes');
    expect(P.predictTruth(l, 'redSide')).toBe('large');
    expect(P.predictTruth(lab('2x+7<=9'), 'redSide')).toBe('small');
  });
  it('coachOf: the gesture, never the answer', () => {
    const l = lab('x<=2', { min: -4, max: 8 });
    expect(P.coachOf(l, { mode: 'bracket' }).id).toBe('probe');
    expect(P.coachOf(trace(l, 5), { mode: 'bracket' }).id).toBe('again');
    const two = trace(l, 5, 0);
    expect(P.coachOf(two, { mode: 'bracket', draft: {} }).id).toBe('bracket');
    expect(P.coachOf(two, { mode: 'bracket', draft: { k: 2 } }).id).toBe('side');
    expect(P.coachOf(two, { mode: 'bracket', draft: { k: 2, side: 'left' } }).id).toBe('toward');
    expect(P.coachOf(two, { mode: 'bracket', draft: { k: 2, side: 'left', toward: true } }).id).toBe('fix');
    expect(P.coachOf(two, { mode: 'region', done: true })).toBeNull();
  });
  it('shownValues lists every graduation with both member values', () => {
    const sv = P.shownValues({ ineq: '6x+20<=80', whole: true, min: 0, max: 18, bracket: false, chains: 'cost' });
    expect(sv.filter((x) => x.role === 'probe')).toHaveLength(19);
    expect(sv.filter((x) => x.role === 'member' && x.v === '86')).toHaveLength(1);
    expect(sv.some((x) => x.role === 'tile' && x.v === '<')).toBe(true);
  });
});
