import { describe, it, expect } from 'vitest';
import { PREP_LADDER, PREP_SYSTEMS } from './prep.js';
import { TEXT } from '../../_unit/signatures/mushkilat-jumla.js';
import { showsAny, solutionOf } from '../../_unit/forbiddenShared.js';

/** La vérité de chaque affirmation, recalculée (plusieurs points pour une expression ; le couple affirmé dans CHAQUE équation). */
const POINTS = [1, 2, 4, -3, 10];
function truthOf(c) {
  if (c.kind === 'pair') return c.eqs.every((f) => f(c.pair[0], c.pair[1]));
  if (c.kind === 'expr') return POINTS.every((x) => c.claim(x) === c.truth(x));
  if (c.kind === 'expr2') return POINTS.every((x) => POINTS.every((y) => c.claim(x, y) === c.truth(x, y)));
  if (c.kind === 'eq') return c.lhs(c.x) === c.rhs;
  throw new Error(`check inconnu ${c.kind}`);
}

describe('« أستعدّ » ladder of mushkilat-jumla', () => {
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
  it('the systems of the « hall » items are the ones the text shows; item 9\'s true solution is (7 ; 3), item 5\'s (6 ; 4)', () => {
    PREP_SYSTEMS.forEach(({ n, system }) => {
      const text = PREP_LADDER[n - 1].text.replace(/\s+/g, '');
      system.split('|').forEach((e) => expect(text, `${n} ${e}`).toContain(e));
    });
    expect(solutionOf(PREP_SYSTEMS.find((p) => p.n === 9).system).key).toBe('(7 ; 3)');
    expect(solutionOf(PREP_SYSTEMS.find((p) => p.n === 5).system).key).toBe('(6 ; 4)');
  });
  it('never shows the climax signature; no control character', () => {
    PREP_LADDER.forEach((x) => { expect(showsAny(TEXT, `${x.text} ${x.why}`), x.text).toBe(false); expect(/[\t\n\r]/.test(`${x.text}${x.why}`)).toBe(false); });
  });
});
