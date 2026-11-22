import { describe, it, expect } from 'vitest';
import { PREP_LADDER } from './prep.js';
import { textViolations, NEVER } from './forbidden.js';

/** Un nombre à virgule (« 1,4 ») → une fraction exacte [numérateur, dénominateur] d'entiers. */
const frac = (t) => { const [i, d = ''] = String(t).split(','); return [Number(i + d), 10 ** d.length]; };
const mul = ([a, b], [c, d]) => [a * c, b * d];
const same = ([a, b], [c, d]) => a * d === b * c;

/** La vérité de chaque affirmation, recalculée en fractions exactes. */
const truthOf = (c) => {
  if (c.kind === 'fracEq') return same(mul(frac(c.a), frac(c.d)), mul(frac(c.b), frac(c.c)));
  if (c.kind === 'fourth') return same(mul(frac(c.a), frac(c.claim)), mul(frac(c.b), frac(c.c)));
  if (c.kind === 'table') return same(mul(frac(c.pairs[0][0]), frac(c.pairs[1][1])), mul(frac(c.pairs[0][1]), frac(c.pairs[1][0]))) === c.claim;
  if (c.kind === 'cross') {
    // a/b = c/d avec un terme 'x' remplacé par l'affirmation : vrai ⇔ a·d = b·c
    const v = (t) => frac(t === 'x' ? c.claim : t);
    return same(mul(v(c.left[0]), v(c.right[1])), mul(v(c.left[1]), v(c.right[0])));
  }
  throw new Error(c.kind);
};

describe('« أستعدّ » ladder of talis-hisab-atwal', () => {
  it('ten statements, numbered, the two skills alternating, levels never going down within a skill', () => {
    expect(PREP_LADDER).toHaveLength(10);
    PREP_LADDER.forEach((it, i) => { expect(it.n).toBe(i + 1); expect(it.skill).toBe(i % 2 === 0 ? 'kasr' : 'tanasub'); });
    ['kasr', 'tanasub'].forEach((sk) => {
      const lv = PREP_LADDER.filter((x) => x.skill === sk).map((x) => x.level);
      expect([...lv].sort((a, b) => a - b)).toEqual(lv);
    });
    expect(PREP_LADDER[0].level).toBe(1);
  });
  it('the first three are true, and both answers occur', () => {
    PREP_LADDER.slice(0, 3).forEach((it) => expect(it.answer).toBe(true));
    expect(PREP_LADDER.filter((x) => !x.answer).length).toBeGreaterThanOrEqual(3);
  });
  it('every answer is the truth, recomputed with exact fractions', () => {
    PREP_LADDER.forEach((it) => expect(truthOf(it.check), `${it.n}: ${it.text}`).toBe(it.answer));
    // each statement carries exactly one `x` when it is a cross proportion
    PREP_LADDER.filter((x) => x.check.kind === 'cross').forEach((it) => expect([...it.check.left, ...it.check.right].filter((t) => t === 'x')).toHaveLength(1));
  });
  it('tests PRIOR skills only: no statement needs Thales, a triangle or parallel lines', () => {
    PREP_LADDER.forEach((it) => expect(/طالس|مثلث|متوازي|\\parallel|\/\//.test(`${it.text} ${it.why}`), String(it.n)).toBe(false));
  });
  it('never uses the climax signature, the synthesis challenge, nor a control character', () => {
    const text = PREP_LADDER.map((x) => `${x.text} ${x.why}`).join(' ');
    expect(textViolations(text, 'prep')).toEqual([]);
    NEVER.forEach((n) => expect(text.includes(n) || text.includes(n.replace(',', '{,}')), n).toBe(false));
    expect(/[\t\n\r]/.test(text)).toBe(false);
    expect(text.includes('الكتاب')).toBe(false);
  });
});
