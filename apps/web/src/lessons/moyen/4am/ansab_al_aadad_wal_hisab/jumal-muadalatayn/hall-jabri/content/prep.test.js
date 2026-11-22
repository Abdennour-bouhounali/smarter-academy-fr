import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import { PREP_LADDER } from './prep.js';
import { TEXT, RULE_P } from './forbidden.js';

const num = (s) => Lin.parseNumber(String(s));
/** La vérité de chaque affirmation, recalculée en fractions exactes. */
const truthOf = (c) => {
  if (c.given) {
    const [a, b] = LS.system(c.given, c.claim);
    const z = (p, q) => Lin.isZero(Lin.sub(Lin.mul(p[0], q[1]), Lin.mul(p[1], q[0])));
    return z([a.a, a.b], [b.a, b.b]) && z([a.a, a.c], [b.a, b.c]) && z([a.b, a.c], [b.b, b.c]);
  }
  const e = LS.eq2(`${c.expr}=0`);
  return Lin.eq(LS.leftAt(e, num(c.at[0]), num(c.at[1])), num(c.value));
};

describe('« أستعدّ » ladder of hall-jabri', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'naql' : 'taawid'); });
    const all = PREP_LADDER.map((x) => x.level);
    expect([...all].sort((a, b) => a - b)).toEqual(all);
  });
  it('the first three are true, and both answers occur', () => {
    PREP_LADDER.slice(0, 3).forEach((it) => expect(it.answer).toBe(true));
    expect(PREP_LADDER.some((x) => !x.answer)).toBe(true);
  });
  it('every answer is the truth, recomputed exactly; the checker tells a true statement from a false one', () => {
    PREP_LADDER.forEach((it) => expect(truthOf(it.check), it.text).toBe(it.answer));
    expect(truthOf({ given: 'x+3y=2', claim: '2x+6y=4' })).toBe(true);
    expect(truthOf({ expr: '5x-2y', at: ['2', '3'], value: '4' })).toBe(true);
  });
  it('never shows the climax signature, a minus before a bracket, a control character or the book', () => {
    PREP_LADDER.forEach((it) => {
      const text = `${it.text} ${it.why}`;
      TEXT.forEach((re) => expect(re.test(text), `${it.n} ${re}`).toBe(false));
      expect(RULE_P.test(text), `${it.n} rule P`).toBe(false);
      expect(/[\t\n\r]/.test(text)).toBe(false);
      expect(text.includes('الكتاب')).toBe(false);
    });
  });
});
