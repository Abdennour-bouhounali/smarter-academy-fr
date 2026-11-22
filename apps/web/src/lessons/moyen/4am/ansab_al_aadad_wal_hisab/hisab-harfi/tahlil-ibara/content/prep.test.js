import { describe, it, expect } from 'vitest';
import { expand, samePolynomial } from '@smarter-academy/core/arithmetic/polynomials.js';
import { parseTerms } from '../../../../../../common/manipulations/logic/turfFactoring.js';
import { PREP_LADDER } from './prep.js';
import { TEXT, incompleteFactor } from './forbidden.js';

/** La vérité de chaque affirmation, recalculée : le produit développé des facteurs égale-t-il la somme annoncée ? */
const truthOf = (c) => samePolynomial(expand(...c.factors.map(parseTerms)), parseTerms(c.claim));

describe('« أستعدّ » ladder of tahlil-ibara', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down (overall and within a skill)', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'nashr' : 'huwiyat'); });
    const all = PREP_LADDER.map((x) => x.level);
    expect([...all].sort((a, b) => a - b)).toEqual(all);
    ['nashr', 'huwiyat'].forEach((sk) => {
      const lv = PREP_LADDER.filter((x) => x.skill === sk).map((x) => x.level);
      expect([...lv].sort((a, b) => a - b)).toEqual(lv);
    });
  });
  it('the first three are true, and both answers occur', () => {
    PREP_LADDER.slice(0, 3).forEach((it) => expect(it.answer).toBe(true));
    expect(PREP_LADDER.some((x) => !x.answer)).toBe(true);
  });
  it('every answer is the truth, recomputed by expansion; the checker tells a true expansion from a false one', () => {
    PREP_LADDER.forEach((it) => expect(truthOf(it.check), it.text).toBe(it.answer));
    expect(truthOf({ factors: ['x+7', 'x+7'], claim: 'x^2+14x+49' })).toBe(true);
    expect(truthOf({ factors: ['2x', '3x-4'], claim: '6x^2-8x' })).toBe(true);
  });
  it('never shows the climax signature, an incomplete factorisation, a control character or the book', () => {
    PREP_LADDER.forEach((it) => {
      const text = `${it.text} ${it.why}`;
      TEXT.forEach((re) => expect(re.test(text), `${it.n} ${re}`).toBe(false));
      expect(incompleteFactor(text), `${it.n}`).toBe(false);
      expect(/[\t\n\r]/.test(text)).toBe(false);
      expect(text.includes('الكتاب')).toBe(false);
    });
  });
});
