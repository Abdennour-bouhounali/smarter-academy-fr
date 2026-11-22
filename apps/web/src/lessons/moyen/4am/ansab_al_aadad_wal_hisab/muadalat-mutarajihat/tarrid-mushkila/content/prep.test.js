import { describe, it, expect } from 'vitest';
import { PREP_LADDER } from './prep.js';
import { TEXT } from '../../_unit/signatures/tarrid-mushkila.js';
import { showsAny } from '../../_unit/forbiddenShared.js';

/** La vérité de chaque affirmation, recalculée (plusieurs points pour une expression ; la valeur affirmée pour une solution). */
const POINTS = [1, 2, 4, -3, 10];
const truthOf = (c) => (c.kind === 'solves' ? c.lhs(c.x) === c.rhs(c.x) : POINTS.every((x) => c.claim(x) === c.truth(x)));

describe('« أستعدّ » ladder of tarrid-mushkila', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'hall' : 'tarjama'); });
    const lv = PREP_LADDER.map((x) => x.level);
    expect([...lv].sort((a, b) => a - b)).toEqual(lv);
  });
  it('the first three are true, and both answers occur', () => {
    PREP_LADDER.slice(0, 3).forEach((it) => expect(it.answer).toBe(true));
    expect(PREP_LADDER.filter((x) => !x.answer).length).toBeGreaterThanOrEqual(3);
  });
  it('every answer is the truth, recomputed', () => {
    PREP_LADDER.forEach((it) => expect(truthOf(it.check), it.text).toBe(it.answer));
  });
  it('never shows the climax signature; no control character', () => {
    PREP_LADDER.forEach((x) => { expect(showsAny(TEXT, `${x.text} ${x.why}`), x.text).toBe(false); expect(/[\t\n\r]/.test(`${x.text}${x.why}`)).toBe(false); });
  });
});
