import { describe, it, expect } from 'vitest';
import { PREP_LADDER } from './prep.js';
import { NEVER, BAD_EXPANSION, bare } from './forbidden.js';

/** La vérité de chaque affirmation, recalculée : les deux membres comparés en plusieurs points (un seul point ne prouve rien). */
const POINTS = [{ a: 1, b: 2, c: 3, x: 5, y: 4 }, { a: 7, b: -2, c: 4, x: -3, y: 11 }, { a: -5, b: 6, c: -1, x: 2, y: -7 }];
const truthOf = (c) => POINTS.every((v) => c.lhs(v) === c.rhs(v));

describe('« أستعدّ » ladder of nashr-tabsit', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down within a skill', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'nashr' : 'tabsit'); });
    ['nashr', 'tabsit'].forEach((sk) => {
      const lv = PREP_LADDER.filter((x) => x.skill === sk).map((x) => x.level);
      expect([...lv].sort((a, b) => a - b)).toEqual(lv);
    });
  });
  it('the first three are true, and both answers occur', () => {
    PREP_LADDER.slice(0, 3).forEach((it) => expect(it.answer).toBe(true));
    expect(PREP_LADDER.filter((x) => !x.answer).length).toBeGreaterThanOrEqual(3);
  });
  it('every answer is the truth, recomputed at several points', () => {
    PREP_LADDER.forEach((it) => expect(truthOf(it.check), it.text).toBe(it.answer));
    expect((2 + 5) * (3 + 1)).toBe(28);
  });
  it('never uses the climax numbers, factors or expansions; no control character', () => {
    const text = PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' ');
    NEVER.forEach((x) => expect(new RegExp(`(^|[^0-9])${x}([^0-9]|$)`).test(text), x).toBe(false));
    ['2x+10', 'x-4', '2x+12', 'x-3'].forEach((f) => expect(bare(text).includes(f), f).toBe(false));
    BAD_EXPANSION.forEach((e) => expect(bare(text).includes(e), e).toBe(false));
    expect(/[\t\n\r]/.test(text)).toBe(false);
  });
});
