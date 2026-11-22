import { describe, it, expect } from 'vitest';
import { PREP_LADDER } from './prep.js';

/** La vérité de chaque affirmation, recalculée. `thales` : part/whole = x/other ⇒ x = part·other/whole ; `inverse` : part/whole = other/x ⇒ x = other·whole/part. */
const truthOf = (c) => {
  if (c.kind === 'fracEq') return c.a * c.d === c.b * c.c;
  if (c.kind === 'between') return c.claim;
  if (c.kind === 'thales') return (c.inverse ? (c.other * c.whole) / c.part : (c.part * c.other) / c.whole) === c.claim;
  throw new Error(c.kind);
};

describe('« أستعدّ » ladder of aksiya-talis', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down within a skill', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'kasr' : 'talis'); });
    ['kasr', 'talis'].forEach((sk) => {
      const lv = PREP_LADDER.filter((x) => x.skill === sk).map((x) => x.level);
      expect([...lv].sort((a, b) => a - b)).toEqual(lv);
    });
  });
  it('the first three are true, and both answers occur', () => {
    PREP_LADDER.slice(0, 3).forEach((it) => expect(it.answer).toBe(true));
    expect(PREP_LADDER.some((x) => !x.answer)).toBe(true);
  });
  it('every answer is the truth, recomputed (the false 10th: AC = 7,5, not 6)', () => {
    PREP_LADDER.forEach((it) => expect(truthOf(it.check), it.text).toBe(it.answer));
    expect((3 * 5) / 2).toBe(7.5);
  });
  it('never uses the climax numbers nor the peer sheet\'s', () => {
    const text = PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' ');
    ['80', '100', '24', '30', '36', '44', '45', '46', '2400', '3600', '3680', '25'].forEach((x) => expect(new RegExp(`(^|[^0-9])${x}([^0-9]|$)`).test(text), x).toBe(false));
    // the climax ratios, and the peer sheet's own ratios (6/15, 6/9, 4/10)
    ['3}{10', '9}{20', '23}{50', '6}{15', '6}{9', '4}{10'].forEach((x) => expect(text.includes(x), x).toBe(false));
    expect(/[\t\n\r]/.test(text)).toBe(false);
  });
});
