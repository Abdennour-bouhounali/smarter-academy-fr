import { describe, it, expect } from 'vitest';
import * as L from './pitchExpansion';
import { evaluate, samePolynomial } from '@smarter-academy/core/arithmetic/polynomials.js';

/**
 * pitch-expansion — la logique PURE ajoutée pour la leçon 2 `mutatabiqat-shahira` (rollout 2026-11-11 ; conseil L2.1–L2.7). Rien de la leçon 1 ne
 * change (logic/pitchExpansion.test.js reste tel quel) : les terrains carrés et (a + b)(a − b), leurs questions, leurs prédictions, le guide.
 */
const carry = (expr, ids = null, simplify = true) => {
  let s = L.init({ expr, simplify });
  (ids ?? s.cells.map((c) => c.id)).forEach((id) => { s = L.collect(s, id); });
  return s;
};

describe('parsePoly reads a predicted claim', () => {
  it('x^2-25, -x^2+4x, 3, 2x', () => {
    expect(L.parsePoly('x^2-25')).toEqual([{ c: 1, p: 2 }, { c: -25, p: 0 }]);
    expect(L.parsePoly('-x^2 + 4x')).toEqual([{ c: -1, p: 2 }, { c: 4, p: 1 }]);
    expect(L.parsePoly('3')).toEqual([{ c: 3, p: 0 }]);
    expect(L.parsePoly('2x')).toEqual([{ c: 2, p: 1 }]);
    expect(() => L.parsePoly('x^2+?')).toThrow();
  });
});

describe('the identities: kinds, binomial, the restored corner', () => {
  it('(x + 4)², (x − 5)², (x + 4)(x − 4) are identity kinds; 3(x + 5) and (x − 2)(2x − 1) are not', () => {
    expect(['x+4', 'x-5', 'x+4|x-4'].map((e) => L.isIdentityKind(L.init({ expr: e })))).toEqual([true, true, true]);
    expect(['3|x+5', 'x-2|2x-1'].map((e) => L.isIdentityKind(L.init({ expr: e })))).toEqual([false, false]);
  });
  it('binomialOf and restoredCell', () => {
    expect(L.binomialOf(L.init({ expr: '2x-1' }))).toEqual({ a: { c: 2, p: 1 }, b: { c: 1, p: 0 }, minus: true });
    expect(L.restoredCell(L.init({ expr: 'x-5' })).term).toEqual({ c: 25, p: 0 });
    expect(L.restoredCell(L.init({ expr: 'x+4' }))).toBeNull();
  });
});

describe('the questions of the square fields: one right option, truths recomputed, the right one moves', () => {
  it('stripFill: two strips, each ab (not 2ab, not b²)', () => {
    [['x+4', '4x'], ['x+2', '2x'], ['2x+5', '10x']].forEach(([expr, ab]) => {
      const [count, each] = L.stripFillParts(L.init({ expr }));
      expect(count.expected).toBe('2');
      expect(each.expected).toBe(ab);
      [count, each].forEach((f) => { expect(f.options).toContain(f.expected); expect(new Set(f.options).size).toBe(3); });
    });
    const a = L.stripFillParts(L.init({ expr: 'x+4' }))[1].options.indexOf('4x');
    const b = L.stripFillParts(L.init({ expr: 'x+2' }))[1].options.indexOf('2x');
    expect(a).not.toBe(b);
  });
  it('cornerFill: cut 2 times; +b² in the sum', () => {
    [['x-5', '+25'], ['x-2', '+4']].forEach(([expr, v]) => {
      const [times, sign] = L.cornerFillParts(L.init({ expr }));
      expect(times.expected).toBe('2');
      expect(sign.expected).toBe(v);
      expect(sign.options).toEqual(expect.arrayContaining([v, v.replace('+', '-'), '0']));
    });
  });
  it('cancelFill: +bx and −bx make 0', () => {
    expect(L.cancelFillParts(L.init({ expr: 'x+4|x-4' }))[0]).toMatchObject({ expected: '0' });
    expect(L.cancelFillParts(L.init({ expr: 'x+2|x-2' }))[0].options).toEqual(expect.arrayContaining(['0', '4x', '-4x']));
  });
  it('coefParts: (2x − 1)² = 4x² − 4x + 1 (decoy 2x²), (2x + 1)² = 4x² + 4x + 1', () => {
    const d = L.coefParts(L.init({ expr: '2x-1' }));
    expect([d.expected, d.decoy, d.ops]).toEqual([['4x^2', '-4x', '+1'], '2x^2', ['', '']]);
    const s = L.coefParts(L.init({ expr: '2x+1' }));
    expect([s.expected, s.ops]).toEqual([['4x^2', '+4x', '+1'], ['', '']]);
    // the tiles with their signs ARE the expansion
    [[d, '2x-1', -1], [s, '2x+1', 1]].forEach(([c, expr, sg]) => {
      expect(samePolynomial([c.aa, { ...c.ab2, c: sg * c.ab2.c }, c.bb], L.init({ expr }).cells.map((u) => u.term))).toBe(true);
    });
  });
});

describe('predictions of lesson 2: computed, judged by the move that settles them', () => {
  it('claim x² − 25 for (x − 5)²: no; twice: yes; noX for (x + 4)(x − 4): no — and yes for (x + 4)²', () => {
    const s = L.init({ expr: 'x-5' });
    expect(L.predictTruth(s, 'claim', { claim: 'x^2-25' })).toBe('no');
    expect(L.predictTruth(s, 'claim', { claim: 'x^2-10x+25' })).toBe('yes');
    expect(L.predictTruth(s, 'twice')).toBe('yes');
    expect(L.predictTruth(L.init({ expr: 'x+4' }), 'twice')).toBe('no');
    expect(L.predictTruth(L.init({ expr: 'x+4|x-4' }), 'noX')).toBe('no');
    expect(L.predictTruth(L.init({ expr: 'x+4' }), 'noX')).toBe('yes');
    expect(L.predictOptions(s, 'claim')).toEqual(['yes', 'no']);
  });
  it('claim and twice are judged at the first right x; noX once the sum is complete and reduced', () => {
    const preds = [{ key: 'c', kind: 'claim', claim: 'x^2-25' }, { key: 't', kind: 'twice' }];
    let s = carry('x-5');
    expect(L.judgedPredictions(s, preds)).toEqual([]);
    s = L.verify(s, 9);
    expect(L.judgedPredictions(s, preds)).toEqual(['c', 't']);
    let m = carry('x+4|x-4');
    const nx = [{ key: 'n', kind: 'noX' }];
    expect(L.judgedPredictions(m, nx)).toEqual([]);
    const xs = m.tray.filter((c) => c.term.p === 1);
    m = L.merge(m, xs[0].id, xs[1].id);
    expect(L.judgedPredictions(m, nx)).toEqual(['n']);
  });
});

describe('the coach on a square of a sum: the two squares first, then the check (the strips light up after the refusal)', () => {
  it('carry 0-0 → carry 1-1 → check → the lit strip → … ', () => {
    let s = L.init({ expr: 'x+4', simplify: false });
    expect(L.coachOf(s, { x: 3 })).toMatchObject({ id: 'carry', target: '[data-pitch-zone="0-0"]' });
    s = L.collect(s, '0-0');
    expect(L.coachOf(s, { x: 3 })).toMatchObject({ id: 'carryMore', target: '[data-pitch-zone="1-1"]' });
    s = L.collect(s, '1-1');
    expect(L.coachOf(s, { x: 3 })).toMatchObject({ id: 'check' });
    s = L.verify(s, 3);
    expect(s.trials[0]).toMatchObject({ ok: false, missing: ['0-1', '1-0'] });
    // the refused sum is 9 + 16 = 25 against 49: the missing 24 is two strips of 12
    expect([s.trials[0].sum, s.trials[0].product]).toEqual([25, 49]);
    expect(L.coachOf(s, { x: 3 })).toMatchObject({ id: 'missing', target: '[data-pitch-zone="0-1"]' });
  });
  it('lesson 1 kinds are unchanged (a double product still starts with its unhatched zones in order)', () => {
    expect(L.coachOf(L.collect(L.init({ expr: '3x-1|3+x', simplify: false }), '0-0'), { x: 2 })).toMatchObject({ target: '[data-pitch-zone="0-1"]' });
  });
});

describe('shownValues adds what the lesson-2 questions show', () => {
  it('the strip options, the corner options, the cancel options, the coef tiles, the claim evaluated at every x', () => {
    const has = (v, role, x) => v.some((o) => o.role === role && o.v === String(x));
    const a = L.shownValues({ expr: 'x+4', span: 5, labels: 'area', chains: 'square' });
    expect(has(a, 'term', '8x')).toBe(true);
    expect(has(a, 'term', '16')).toBe(true);
    const b = L.shownValues({ expr: 'x-5', span: 5, labels: 'terms', chains: 'squareDiff', predict: [{ key: 'c', kind: 'claim', claim: 'x^2-25' }] });
    expect(has(b, 'term', '+25')).toBe(true);
    expect(has(b, 'term', '-25')).toBe(true);
    expect(has(b, 'expansion', 'x^2 - 25')).toBe(true);
    expect(has(b, 'decoy', evaluate([{ c: 1, p: 2 }, { c: -25, p: 0 }], 9))).toBe(true);
    const c = L.shownValues({ expr: '2x-1', span: 5, labels: 'terms', chains: 'coef' });
    expect(has(c, 'term', '2x^2')).toBe(true);
    const d = L.shownValues({ expr: 'x+4|x-4', span: 5, labels: 'terms', chains: 'sumDiff' });
    expect(has(d, 'term', '-8x')).toBe(true);
  });
});
