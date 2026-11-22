import { describe, it, expect } from 'vitest';
import { PREP_LADDER } from './prep.js';
import { textHit } from './forbidden.js';

/** La vérité de chaque affirmation, recalculée : les deux membres comparés en plusieurs points (un seul point ne prouve rien). */
const POINTS = [{ x: 5 }, { x: -3 }, { x: 2 }, { x: 11 }];
const truthOf = (c) => POINTS.every((v) => c.lhs(v) === c.rhs(v));

describe('« أستعدّ » ladder of mutatabiqat-shahira', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down within a skill', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'nashr' : 'murabba'); });
    ['nashr', 'murabba'].forEach((sk) => {
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
    expect(0.5 * 0.5).toBe(0.25);
  });
  it('never shows the climax signature, never an identity of the lesson; no control character', () => {
    PREP_LADDER.forEach((it) => expect(textHit(`${it.text} ${it.why}`), it.text).toBe(false));
    PREP_LADDER.forEach((it) => expect(/\((a|x) [+-] (b|\d)\)\^2/.test(it.text), it.text).toBe(false));
    const text = PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' ');
    expect(/[\t\n\r]/.test(text)).toBe(false);
  });
});
