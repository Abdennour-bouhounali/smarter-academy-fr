import { describe, expect, it } from 'vitest';
import { MENTAL_LEVELS, makeProblem } from './levels.js';

/** Un évaluateur INDÉPENDANT : le problème affiché est relu et calculé en flottants. */
function toJs(tokens) {
  return tokens.map((t) => {
    if (typeof t === 'string') return t;
    if (t.frac) return `((${t.frac[0]})/(${t.frac[1]}))`;
    if (t.sqrt) return `Math.sqrt(${t.sqrt})`;
    return `**(${t.sup})`;
  }).join('')
    .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/%/g, '/100')
    .replace(/(\d|\))\s*(?=\(|M)/g, '$1*');
}
// eslint-disable-next-line no-new-func
const evaluate = (tokens) => new Function(`return (${toJs(tokens)});`)();
const readAnswer = (text) => Number(text.replace('−', '-').replace(',', '.'));

describe('mental arithmetic « الحساب الذهني » — 50 levels × 3 sub-levels', () => {
  it('has 50 distinct levels, from 2 + 1 to the champion', () => {
    expect(MENTAL_LEVELS).toHaveLength(50);
    expect(new Set(MENTAL_LEVELS.map((l) => l.id)).size).toBe(50);
    const first = makeProblem(1, 0, { level: 1, sub: 1 });
    expect(first.answer.n).toBeLessThanOrEqual(5);
  });

  for (const level of MENTAL_LEVELS) {
    it(`level ${level.n} « ${level.id} »: every problem's answer is what it shows, exact and short`, () => {
      for (let sub = 1; sub <= 3; sub += 1) {
        for (const seed of [1, 77, 2026, 31337]) {
          for (let i = 0; i < 25; i += 1) {
            const p = makeProblem(seed, i, { level: level.n, sub });
            const where = `level ${level.n}/${sub} seed ${seed} #${i}: ${toJs(p.tokens)}`;
            expect(p.answerText, where).toBeTruthy();
            expect(Math.abs(evaluate(p.tokens) - p.answer.n / p.answer.d), where).toBeLessThan(1e-9);
            expect(readAnswer(p.answerText), where).toBeCloseTo(p.answer.n / p.answer.d, 9);
            expect(p.answerText.length, where).toBeLessThanOrEqual(8);
          }
        }
      }
    });
  }

  it('gets harder: answers grow from level 1 to level 30', () => {
    const avg = (n) => {
      let s = 0;
      for (let i = 0; i < 40; i += 1) s += Math.abs(makeProblem(5, i, { level: n, sub: 2 }).answer.n);
      return s / 40;
    };
    expect(avg(1)).toBeLessThan(avg(10));
    expect(avg(10)).toBeLessThan(avg(28));
  });

  it('is the same problem for the same seed', () => {
    expect(makeProblem(9, 4, { level: 28, sub: 3 })).toEqual(makeProblem(9, 4, { level: 28, sub: 3 }));
  });
});
