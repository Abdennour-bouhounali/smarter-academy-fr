import { describe, it, expect } from 'vitest';
import * as E from './expansion.js';

const t = (c, p = 0) => ({ c, p });
const P1 = [E.side(0, 3), E.side(1, 4)];
const P2 = [E.side(0, 2), E.side(1, -3)];
const P3 = [E.side(1, 3), E.side(1, 2)];
const P4 = [E.side(1, -2), E.side(1, -3)];
const ALL = { p1: P1, p2: P2, p3: P3, p4: P4 };
const xs = Array.from({ length: E.X_MAX - E.X_MIN + 1 }, (_, i) => E.X_MIN + i);

describe('expansion — sides and cuts', () => {
  it('terms, values, tex', () => {
    expect(E.sideTerms(E.side(1, -3))).toEqual([t(1, 1), t(-3)]);
    expect(E.sideTerms(E.side(0, 3))).toEqual([t(3)]);
    expect(E.sideTerms(E.side(2, 0))).toEqual([t(2, 1)]);
    expect(E.sideTex(E.side(1, -3))).toBe('x - 3');
    expect(E.sideFactorTex(E.side(1, -3))).toBe('(x - 3)');
    expect(E.sideFactorTex(E.side(0, 3))).toBe('3');
    expect(E.sideValue(E.side(2, 1), 5)).toBe(11);
  });
  it('cut positions: n > 0 at m·x, n < 0 at m·x + n; constants and pure x are not cut', () => {
    expect(E.cutRight(E.side(1, 4), 6)).toBe(6);
    expect(E.cutRight(E.side(2, 1), 5)).toBe(10);
    expect(E.cutRight(E.side(1, -3), 6)).toBe(3);
    expect(E.cutRight(E.side(2, -3), 5)).toBe(7);
    expect(E.cutRight(E.side(0, 3), 6)).toBeNull();
    expect(E.cutRight(E.side(1, 0), 6)).toBeNull();
    expect(E.drawnLength(E.side(1, 4), 6)).toBe(10);
    expect(E.drawnLength(E.side(1, -3), 6)).toBe(6);
    expect(E.drawnLength(E.side(0, 3), 6)).toBe(3);
  });
  it('judgeCut: right, the same split written in the other order, and refusals', () => {
    expect(E.judgeCut(E.side(1, 4), 6, 6)).toMatchObject({ ok: true, swapped: false });
    expect(E.judgeCut(E.side(1, 4), 6, 4)).toMatchObject({ ok: true, swapped: true });
    expect(E.judgeCut(E.side(1, 4), 6, 5)).toMatchObject({ ok: false });
    expect(E.judgeCut(E.side(1, 4), 6, 7)).toMatchObject({ ok: false });
    expect(E.judgeCut(E.side(1, -3), 6, 3)).toMatchObject({ ok: true, swapped: false });
    expect(E.judgeCut(E.side(1, -3), 6, 4)).toMatchObject({ ok: false });
    expect(E.judgeCut(E.side(0, 3), 6, 1).ok).toBe(false);
    // when n = m·x the two readings are the same cut
    expect(E.judgeCut(E.side(1, 6), 6, 6)).toMatchObject({ ok: true, swapped: false });
  });
  it('the two lengths of a cut', () => { expect(E.cutLengths(10, 4)).toEqual([4, 6]); });
  it('segment spans: a positive number follows, a negative one bites the end of the x-term', () => {
    expect(E.segmentSpan(E.side(1, 4), 0, 6)).toEqual({ from: 0, to: 6 });
    expect(E.segmentSpan(E.side(1, 4), 1, 6)).toEqual({ from: 6, to: 10 });
    expect(E.segmentSpan(E.side(1, -3), 1, 6)).toEqual({ from: 3, to: 6 });
    expect(E.segmentSpan(E.side(0, 3), 0, 6)).toEqual({ from: 0, to: 3 });
  });
  it('minX keeps (x − n) positive and never goes under 4', () => {
    expect(E.minX(E.side(1, -2), E.side(1, -3))).toBe(4);
    expect(E.minX(E.side(1, -5))).toBe(6);
    expect(E.minX(E.side(2, -6))).toBe(4);
    expect(E.minX(E.side(1, 3))).toBe(4);
    for (const x of xs) for (const [h, w] of Object.values(ALL)) if (x >= E.minX(h, w)) expect(E.plotArea(h, w, x)).toBeGreaterThan(0);
  });
});

describe('expansion — the four plots of the brief', () => {
  const tex = { p1: '3x + 12', p2: '2x - 6', p3: 'x^2 + 5x + 6', p4: 'x^2 - 5x + 6' };
  const raw = { p1: '3x + 12', p2: '2x - 6', p3: 'x^2 + 2x + 3x + 6', p4: 'x^2 - 3x - 2x + 6' };
  for (const [id, [h, w]] of Object.entries(ALL)) {
    it(`${id}: the area counted two ways is the same at every x, the patches write the expansion`, () => {
      const ps = E.patchesOf(h, w);
      expect(E.expansionTex(ps)).toBe(raw[id]);
      expect(E.reducedTex(ps)).toBe(tex[id]);
      for (const x of xs) {
        expect(E.partsSum(ps, x)).toBe(E.plotArea(h, w, x));
        expect(E.partsSum(ps, x)).toBe(E.sideValue(h, x) * E.sideValue(w, x));
      }
    });
  }
  it('patch signs: p1 +,+ · p2 +,− · p3 four + · p4 +,−,−,+ with the corner', () => {
    expect(E.patchesOf(...P1).map((p) => p.sign)).toEqual([1, 1]);
    expect(E.patchesOf(...P2).map((p) => p.sign)).toEqual([1, -1]);
    expect(E.patchesOf(...P3).map((p) => p.sign)).toEqual([1, 1, 1, 1]);
    const p4 = E.patchesOf(...P4);
    expect(p4.map((p) => p.sign)).toEqual([1, -1, -1, 1]);
    expect(p4.map((p) => p.corner)).toEqual([false, false, false, true]);
    expect(p4.map((p) => p.id)).toEqual(['p00', 'p01', 'p10', 'p11']);
    expect(E.patchArea(p4[3], 6)).toBe(6);
    expect(E.patchArea(p4[0], 6)).toBe(36);
    expect(E.patchSigned(p4[1], 6)).toBe(-18);
  });
});

describe('expansion — the sign judge is the counted area', () => {
  it('the right sign passes at every x, the wrong sign never does (by twice the patch)', () => {
    for (const [h, w] of Object.values(ALL)) {
      const ps = E.patchesOf(h, w);
      for (const p of ps) for (const x of xs) {
        const ok = E.signJudge(h, w, x, ps, {}, p.id, p.sign);
        expect(ok.ok).toBe(true);
        expect(ok.written).toBe(ok.counted);
        const bad = E.signJudge(h, w, x, ps, {}, p.id, -p.sign);
        expect(bad.ok).toBe(false);
        expect(bad.written - bad.counted).toBe(-2 * p.sign * E.patchArea(p, x));
      }
    }
  });
  it('the corner of (x − 2)(x − 3) at x = 6: taking it away again gives 18 against 12', () => {
    const [h, w] = P4;
    const ps = E.patchesOf(h, w);
    const r = E.signJudge(h, w, 6, ps, { p00: 1, p01: -1, p10: -1 }, 'p11', -1);
    expect(r).toEqual({ ok: false, counted: 12, written: 0 });
  });
  it('decidedSum counts only what the hand has decided', () => {
    const ps = E.patchesOf(...P3);
    expect(E.decidedSum(ps, 6, {})).toBe(0);
    expect(E.decidedSum(ps, 6, { p00: 1 })).toBe(36);
  });
});

describe('expansion — reducing', () => {
  it('used powers, coefficients and the coefficient judge', () => {
    const terms = E.expansionTerms(E.patchesOf(...P3));
    expect(E.usedPowers(terms)).toEqual([2, 1, 0]);
    expect(E.coefOf(terms, 1)).toBe(5);
    expect(E.coefJudge(terms, { 2: 1, 1: 5, 0: 6 }, 6, 72)).toMatchObject({ ok: true, wrong: [] });
    const bad = E.coefJudge(terms, { 2: 1, 1: 4, 0: 6 }, 6, 72);
    expect(bad).toMatchObject({ ok: false, wrong: [1], counted: 72, written: 66 });
  });
  it('the x coefficient of (x + 3)(x − 3) cancels to 0 but the power stays in the list', () => {
    const ps = E.patchesOf(E.side(1, 3), E.side(1, -3));
    const terms = E.expansionTerms(ps);
    expect(E.usedPowers(terms)).toEqual([2, 1, 0]);
    expect(E.coefOf(terms, 1)).toBe(0);
    expect(E.reducedTex(ps)).toBe('x^2 - 9');
  });
});

describe('expansion — arrows', () => {
  const a1 = { products: [E.product(1, [t(5)], [t(1, 1), t(2)])] };
  const a2 = { products: [E.product(1, [t(-3)], [t(1, 1), t(-4)])] };
  const a3 = { products: [E.product(1, [t(2, 1), t(1)], [t(1, 1), t(-3)])] };
  const a4 = { products: [E.product(1, [t(3)], [t(2), t(-1, 1)]), E.product(-1, [t(4)], [t(1, 1), t(-1)])] };
  const want = { a1: ['5(x + 2)', '5x + 10'], a2: ['-3(x - 4)', '-3x + 12'], a3: ['(2x + 1)(x - 3)', '2x^2 - 5x - 3'], a4: ['3(2 - x) - 4(x - 1)', '-7x + 10'] };
  const all = { a1, a2, a3, a4 };
  for (const [id, e] of Object.entries(all)) {
    it(`${id}: ${want[id][0]} expands to ${want[id][1]}, value invariant at every x`, () => {
      expect(E.exprTex(e)).toBe(want[id][0]);
      expect(E.reducedExprTex(e)).toBe(want[id][1]);
      for (const x of xs) {
        expect(E.exprValue(e, x)).toBe(E.arrowTerms(e).reduce((s, q) => s + q.c * x ** q.p, 0));
        expect(E.exprValue(e, x)).toBe(E.reducedExprTerms(e).reduce((s, q) => s + q.c * x ** q.p, 0));
      }
    });
  }
  it('arrows count and numbering (origins and targets run over the whole line)', () => {
    expect([a1, a2, a3, a4].map(E.arrowCount)).toEqual([2, 2, 4, 4]);
    const ar = E.arrowsOf(a4);
    expect(ar.map((a) => a.id)).toEqual(['0>0', '0>1', '1>2', '1>3']);
    expect(ar.map((a) => a.k)).toEqual([0, 0, 1, 1]);
    expect(ar.map((a) => E.arrowSign(a))).toEqual([1, -1, -1, 1]);
    expect(E.expandedTex(a4)).toBe('6 - 3x - 4x + 4');
  });
  it('the sign judge: (2x)·(−3) at x = 6 is −36, a + card is refused with both numbers', () => {
    const ar = E.arrowsOf(a3);
    const a = ar.find((q) => q.id === '0>1');
    expect(a.term).toEqual(t(-6, 1));
    expect(a.mag).toEqual(t(6, 1));
    expect(E.arrowJudge(a, -1, 6)).toEqual({ ok: true, truth: -36, shown: -36 });
    expect(E.arrowJudge(a, 1, 6)).toEqual({ ok: false, truth: -36, shown: 36 });
    // a minus in front of a product flips the partial product's sign
    const m = E.arrowsOf(a4).find((q) => q.id === '1>2');
    expect(E.arrowJudge(m, -1, 5)).toMatchObject({ ok: true, truth: -20 });
    expect(E.arrowJudge(E.arrowsOf(a4).find((q) => q.id === '1>3'), 1, 5)).toMatchObject({ ok: true, truth: 4 });
  });
  it('a custom product with a negative later factor is parenthesised', () => {
    expect(E.exprTex({ products: [E.product(1, [t(2)], [t(1, 1)]), E.product(1, [t(-3)], [t(1, 1), t(1)])] })).toBe('2(x) + (-3)(x + 1)');
  });
});
