import { describe, it, expect } from 'vitest';
import { PREP_LADDER } from './prep.js';

const truthOf = (c) => {
  if (c.kind === 'prodSq') return (c.a * c.b) ** 2 === c.claim;
  if (c.kind === 'quotSq') { const [p, q] = c.a; const [r, s] = c.claim; return p * p * s === r * q * q; }
  if (c.kind === 'sqrt') { const [p, q] = c.a; const [r, s] = c.r; return r >= 0 && r * r * q === p * s * s; }
  if (c.kind === 'sqOfRoot') return c.a >= 0 && c.claim === c.a;
  throw new Error(c.kind);
};

describe('« أستعدّ » ladder of amaliyat-judhur', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down within a skill', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'quwa' : 'jidhr'); });
    ['quwa', 'jidhr'].forEach((sk) => {
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
  it('never uses the climax numbers (180, 12, 36, 6√5, 2√3, 192, 45, 18, 90, 150) nor the peer sheet\'s 13', () => {
    const text = PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' ');
    ['180', '12', '36', '192', '45', '18', '90', '150', '13'].forEach((x) => expect(new RegExp(`(^|[^0-9])${x}([^0-9]|$)`).test(text), x).toBe(false));
  });
});
