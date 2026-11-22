import { describe, it, expect } from 'vitest';
import { PREP_LADDER } from './prep.js';

/**
 * La vérité de chaque affirmation, recalculée en entiers. `cross` : a/b = c/d où un terme est 'x' = n/m (l'affirmation) — on remplace x et on
 * compare les produits en croix multipliés par m. `thales` : part/whole = other/x ⇒ x = other·whole/part (`rest` : whole = part + rest).
 */
const truthOf = (c) => {
  if (c.kind === 'statement') return c.claim;
  if (c.kind === 'fracEq') return c.a * c.d === c.b * c.c;
  if (c.kind === 'cross') {
    const [n, m] = c.claim;
    // chaque terme en numérateur sur le dénominateur commun m : un entier vaut k·m/m, x vaut n/m
    const v = (t) => (t === 'x' ? n : t * m);
    const [a, b] = c.left.map(v); const [cc, d] = c.right.map(v);
    return a * d === b * cc;
  }
  if (c.kind === 'thales') {
    const whole = c.whole ?? c.part + c.rest;
    const [n, m] = c.claim;
    return c.other * whole * m === c.part * n;
  }
  throw new Error(c.kind);
};

describe('« أستعدّ » ladder of inshaat-talis', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down (overall and within a skill)', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'talis' : 'kasr'); });
    const all = PREP_LADDER.map((x) => x.level);
    expect([...all].sort((a, b) => a - b)).toEqual(all);
    ['kasr', 'talis'].forEach((sk) => {
      const lv = PREP_LADDER.filter((x) => x.skill === sk).map((x) => x.level);
      expect([...lv].sort((a, b) => a - b)).toEqual(lv);
    });
  });
  it('the first three are true, and both answers occur', () => {
    PREP_LADDER.slice(0, 3).forEach((it) => expect(it.answer).toBe(true));
    expect(PREP_LADDER.some((x) => !x.answer)).toBe(true);
  });
  it('every answer is the truth, recomputed; the checker itself tells a true proportion from a false one', () => {
    PREP_LADDER.forEach((it) => expect(truthOf(it.check), it.text).toBe(it.answer));
    expect(truthOf({ kind: 'cross', left: [3, 'x'], right: [6, 7], claim: [7, 2] })).toBe(true);
    expect(truthOf({ kind: 'cross', left: [6, 'x'], right: [9, 4], claim: [8, 3] })).toBe(true);
    expect(truthOf({ kind: 'thales', part: 2, rest: 4, other: 3, claim: [9, 1] })).toBe(true);
    expect(truthOf({ kind: 'thales', part: 3, whole: 9, other: 2, claim: [6, 1] })).toBe(true);
  });
  it('never uses the climax numbers nor its ratios', () => {
    const text = PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' ');
    ['10', '40', '30', '35', '20', '15', '650', '600', '3000'].forEach((x) => expect(new RegExp(`(^|[^0-9])${x}([^0-9]|$)`).test(text), x).toBe(false));
    ['4}{3', '3}{4', '4}{7', '3}{7', '40}{7', '30}{7', '10}{7', '40}{3'].forEach((x) => expect(text.includes(x), x).toBe(false));
    expect(/[\t\n\r]/.test(text)).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
  });
});
