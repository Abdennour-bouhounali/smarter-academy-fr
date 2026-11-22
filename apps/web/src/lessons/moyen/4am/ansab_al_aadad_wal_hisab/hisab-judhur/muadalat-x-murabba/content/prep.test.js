import { describe, it, expect } from 'vitest';
import { PREP_LADDER } from './prep';

const truthOf = (c) => {
  if (c.kind === 'sq') { const [p, q] = c.x; const [r, s] = c.y; return p * p * s === r * q * q; }
  if (c.kind === 'sqrt') { const [p, q] = c.a; const [r, s] = c.r; return r >= 0 && r * r * q === p * s * s; }
  throw new Error(c.kind);
};

describe('« أستعدّ » ladder of muadalat-x-murabba', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down within a skill', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'murabba' : 'jidhr'); });
    ['murabba', 'jidhr'].forEach((sk) => {
      const lv = PREP_LADDER.filter((x) => x.skill === sk).map((x) => x.level);
      expect([...lv].sort((a, b) => a - b)).toEqual(lv);
    });
  });
  it('the first three are true, and both answers occur', () => {
    PREP_LADDER.slice(0, 3).forEach((it) => expect(it.answer).toBe(true));
    expect(PREP_LADDER.some((x) => !x.answer)).toBe(true);
  });
  it('every answer is the truth, recomputed', () => {
    PREP_LADDER.forEach((it) => expect(truthOf(it.check), it.text).toBe(it.answer));
  });
  it('never uses the climax numbers (64, 0,09, 0,3, 11, 3,3, 36, 42) nor the peer sheet\'s 0,16', () => {
    const text = JSON.stringify(PREP_LADDER.map((x) => `${x.text} ${x.why}`));
    ['64', '0{,}09', '0{,}3', '0,3', '11', '3{,}3', '36', '42', '0{,}16'].forEach((x) => expect(text.includes(x), x).toBe(false));
  });
});
