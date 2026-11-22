import { describe, it, expect } from 'vitest';
import { expand, reduce, samePolynomial } from '@smarter-academy/core/arithmetic/polynomials.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { parseTerms } from '../../../../../../common/manipulations/logic/turfFactoring.js';
import { PREP_LADDER } from './prep.js';
import { TEXT, SITUATION_REFUSAL } from './forbidden.js';

/** La vérité de chaque affirmation, recalculée : le nombre annoncé annule-t-il l'expression ? les deux membres développés sont-ils le même polynôme ? */
const side = (prods) => reduce(prods.flatMap((fs) => expand(...fs.map(parseTerms))));
const truthOf = (c) => (c.solve != null
  ? Lin.isZero(Lin.linAt(Lin.linear(c.solve), Lin.parseNumber(c.claim)))
  : samePolynomial(side(c.lhs), side(c.rhs)));

describe('« أستعدّ » ladder of jidaa-maadum', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down (overall and within a skill)', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'muadala' : 'tahlil'); });
    const all = PREP_LADDER.map((x) => x.level);
    expect([...all].sort((a, b) => a - b)).toEqual(all);
    ['muadala', 'tahlil'].forEach((sk) => {
      const lv = PREP_LADDER.filter((x) => x.skill === sk).map((x) => x.level);
      expect([...lv].sort((a, b) => a - b)).toEqual(lv);
    });
  });
  it('the first three are true, and both answers occur (6 true, 4 false)', () => {
    PREP_LADDER.slice(0, 3).forEach((it) => expect(it.answer).toBe(true));
    expect(PREP_LADDER.filter((x) => x.answer)).toHaveLength(6);
  });
  it('every answer is the truth, recomputed; the checker tells a true claim from a false one', () => {
    PREP_LADDER.forEach((it) => expect(truthOf(it.check), it.text).toBe(it.answer));
    expect(truthOf({ solve: 'x+9', claim: '-9' })).toBe(true);
    expect(truthOf({ solve: '5x-2', claim: '2/5' })).toBe(true);
    expect(truthOf({ lhs: [['x^2-4']], rhs: [['x-2', 'x+2']] })).toBe(true);
  });
  it('never shows the climax signature, a situation-refused root, a control character or the book', () => {
    PREP_LADDER.forEach((it) => {
      const text = `${it.text} ${it.why}`;
      TEXT.forEach((re) => expect(re.test(text.replace(/−/g, '-')), `${it.n} ${re}`).toBe(false));
      expect(SITUATION_REFUSAL.test(text)).toBe(false);
      expect(/[\t\n\r]/.test(text)).toBe(false);
      expect(text.includes('الكتاب')).toBe(false);
    });
  });
});
