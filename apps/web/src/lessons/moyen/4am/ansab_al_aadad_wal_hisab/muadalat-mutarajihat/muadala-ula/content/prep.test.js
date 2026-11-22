import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { PREP_LADDER } from './prep.js';
import { TEXT } from './forbidden.js';

const num = (s) => (String(s).includes('/') ? Lin.frac(...String(s).split('/').map(Number)) : Lin.frac(Number(s)));
/** La vérité de chaque affirmation, recalculée. */
const truthOf = (c) => {
  if (c.eq) { const [l, r] = c.eq.split('=').map(Lin.linear); return Lin.holds(l, r, num(c.at)); }
  const l = Lin.linear(c.lhs); const r = Lin.linear(c.rhs);
  return Lin.eq(l.a, r.a) && Lin.eq(l.b, r.b);
};

describe('« أستعدّ » ladder of muadala-ula', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down (overall and within a skill)', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'musawat' : 'hall'); });
    const all = PREP_LADDER.map((x) => x.level);
    expect([...all].sort((a, b) => a - b)).toEqual(all);
    ['musawat', 'hall'].forEach((sk) => {
      const lv = PREP_LADDER.filter((x) => x.skill === sk).map((x) => x.level);
      expect([...lv].sort((a, b) => a - b)).toEqual(lv);
    });
  });
  it('the first three are true, and both answers occur', () => {
    PREP_LADDER.slice(0, 3).forEach((it) => expect(it.answer).toBe(true));
    expect(PREP_LADDER.some((x) => !x.answer)).toBe(true);
  });
  it('every answer is the truth, recomputed exactly; the checker tells a true statement from a false one', () => {
    PREP_LADDER.forEach((it) => expect(truthOf(it.check), it.text).toBe(it.answer));
    expect(truthOf({ eq: '3x-1=7', at: '8/3' })).toBe(true);
    expect(truthOf({ lhs: 'x-4', rhs: 'x-4' })).toBe(true);
  });
  it('never shows the climax signature, a control character or the book', () => {
    PREP_LADDER.forEach((it) => {
      const text = `${it.text} ${it.why}`;
      TEXT.forEach((re) => expect(re.test(text), `${it.n} ${re}`).toBe(false));
      expect(/[\t\n\r]/.test(text)).toBe(false);
      expect(text.includes('الكتاب')).toBe(false);
    });
  });
});
