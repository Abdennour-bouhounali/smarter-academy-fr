import { describe, it, expect } from 'vitest';
import { PREP_LADDER } from './prep.js';

const isqrt = (x) => { const r = Math.round(Math.sqrt(x)); return r * r === x ? r : null; };
const truthOf = (c) => {
  if (c.kind === 'distrib') return c.a * c.b === c.claim;
  if (c.kind === 'collect') return c.coefs.reduce((s, x) => s + x, 0) === c.claim;
  if (c.kind === 'expand') return c.p + c.q === c.mid && c.p * c.q === c.c;
  if (c.kind === 'prodRoot') return typeof c.claim === 'object' ? c.a * c.b === c.claim.rad : c.claim >= 0 && c.a * c.b === c.claim * c.claim;
  if (c.kind === 'quotRoot') return c.a % c.b === 0 && c.a / c.b === c.claim * c.claim;
  if (c.kind === 'rootA2B') return isqrt(c.a2) === c.claim;
  throw new Error(c.kind);
};

describe('« أستعدّ » ladder of tawzif-khawass-judhur', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down within a skill', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'huwiyat' : 'jidaa'); });
    ['huwiyat', 'jidaa'].forEach((sk) => {
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
  it('never uses the climax numbers (200, 100, 50, 120, 12, 10, 25) nor the peer sheet\'s 96 and 24', () => {
    const text = PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' ');
    ['200', '100', '50', '120', '12', '10', '25', '96', '24'].forEach((x) => expect(new RegExp(`(^|[^0-9])${x}([^0-9]|$)`).test(text), x).toBe(false));
  });
});
