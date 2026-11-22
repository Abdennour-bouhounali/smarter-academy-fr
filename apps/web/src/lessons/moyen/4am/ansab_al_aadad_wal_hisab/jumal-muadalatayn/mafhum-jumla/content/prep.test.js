import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import { PREP_LADDER } from './prep.js';
import { TEXT } from './forbidden.js';

const F = (s) => (String(s).includes('/') ? Lin.frac(...String(s).split('/').map(Number)) : Lin.frac(Number(s)));
/** La vérité de chaque affirmation, recalculée. */
const truthOf = (c) => {
  if (c.expr) { const f = LS.parseLinear2(c.expr); return Lin.eq(Lin.add(Lin.add(Lin.mul(f.u, F(c.x)), Lin.mul(f.v, F(c.y))), f.k), F(c.value)); }
  if (c.at != null) { const [l, r] = c.eq.split('=').map(Lin.linear); return Lin.holds(l, r, F(c.at)); }
  return LS.holdsAt(LS.eq2(c.eq), F(c.x), F(c.y));
};

describe('« أستعدّ » ladder of mafhum-jumla', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down (overall and within a skill)', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'qima' : 'hall'); });
    const all = PREP_LADDER.map((x) => x.level);
    expect([...all].sort((a, b) => a - b)).toEqual(all);
    ['qima', 'hall'].forEach((sk) => {
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
    expect(truthOf({ eq: '5x=20', at: '4' })).toBe(true);
    expect(truthOf({ eq: '2x+y=15', x: '4', y: '7' })).toBe(true);
    expect(truthOf({ expr: '3x-y', x: '1', y: '4', value: '-1' })).toBe(true);
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
