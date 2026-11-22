import { describe, it, expect } from 'vitest';
import { PREP_LADDER, PREP_LESSON } from './prep.js';
import { textViolations } from './forbidden.js';
import { LESSON_CONFIG } from '../lesson.config.js';

/** Un nombre à virgule (« 12,5 ») → une fraction exacte [numérateur, dénominateur] d'entiers. */
const frac = (t) => { const [i, d = ''] = String(t).split(','); return [Number(i + d), 10 ** d.length]; };
const mul = ([a, b], [c, d]) => [a * c, b * d];
const same = ([a, b], [c, d]) => a * d === b * c;
const f = (x) => frac(x);

/** La vérité de chaque affirmation, recalculée en fractions exactes. */
const truthOf = (c) => {
  if (c.kind === 'rule') return c.truth;
  if (c.kind === 'prop') return same(mul(f(c.a), f(c.c)), mul(f(c.b), f(c.claim)));             // a / b = claim / c
  if (c.kind === 'ratios') return c.sameOrder && same(mul(f(c.a), f(c.d)), mul(f(c.b), f(c.c)));   // a/b = c/d and the same order
  if (c.kind === 'share') return same(mul(f(c.parts), f(c.claim)), f(c.total));
  if (c.kind === 'rest') {                                                                          // MB = total × (den − num) ÷ den
    const [num, den, total] = [Number(c.num), Number(c.den), f(c.total)];
    return same(mul([den, 1], f(c.claim)), mul([den - num, 1], total));
  }
  throw new Error(c.kind);
};

describe('« أستعدّ » ladder of the unit-9 synthesis', () => {
  it('ten statements, numbered; the three skills cycle; levels never go down', () => {
    expect(PREP_LADDER).toHaveLength(10);
    const cycle = ['talis', 'aksiya', 'inshaat'];
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(cycle[i % 3]); });
    const lv = PREP_LADDER.map((x) => x.level);
    expect([...lv].sort((a, b) => a - b)).toEqual(lv);
    expect(lv[0]).toBe(1);
  });
  it('the first three are true, and both answers occur', () => {
    PREP_LADDER.slice(0, 3).forEach((it) => expect(it.answer).toBe(true));
    expect(PREP_LADDER.filter((x) => !x.answer).length).toBeGreaterThanOrEqual(3);
  });
  it('every answer is the truth, recomputed with exact fractions', () => {
    PREP_LADDER.forEach((it) => expect(truthOf(it.check), `${it.n}: ${it.text}`).toBe(it.answer));
  });
  it('each skill revises one of the unit\'s three lessons, all catalogue prerequisites — « راجع » is never empty', () => {
    expect(Object.values(PREP_LESSON).sort()).toEqual(['aksiya-talis', 'inshaat-talis', 'talis-hisab-atwal']);
    new Set(PREP_LADDER.map((x) => x.skill)).forEach((sk) => expect(PREP_LESSON[sk], sk).toBeTruthy());
    expect(LESSON_CONFIG.priorKnowledge).toEqual(expect.arrayContaining(['talis-mubashira', 'talis-aksiya']));
  });
  it('never uses the challenge nor the unit situation, a control character or the textbook', () => {
    const text = PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' ');
    expect(textViolations(text, 'prep')).toEqual([]);
    expect(/[\t\n\r]/.test(text)).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
  });
});
