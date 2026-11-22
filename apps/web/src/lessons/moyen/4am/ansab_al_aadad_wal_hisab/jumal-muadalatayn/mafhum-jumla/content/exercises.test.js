import { describe, it, expect } from 'vitest';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { EXERCISES, EX } from './exercises.js';
import { TEXT } from './forbidden.js';

/** Les exercices du module 3, écrits par la plateforme : chaque réponse RECALCULÉE (verdict G11 : hors de la règle des collisions de l'unité). */
const F = (v) => (typeof v === 'string' && v.includes('/') ? Lin.frac(...v.split('/').map(Number)) : Lin.frac(Number(v)));
const holds = (eq, [x, y]) => LS.holdsAt(LS.eq2(eq), F(x), F(y));

describe('mafhum-jumla — the exercises of module 3 (platform numbers)', () => {
  it('ex-1: each row tells the truth of 2x − y = 5', () => {
    const ex = EX['ex-1'];
    ex.check.pairs.forEach((p, i) => expect(ex.question.rows[i].correct, String(p)).toBe(holds(ex.check.eq, p) ? 0 : 1));
  });
  it('ex-2 and ex-3-1: in every row exactly ONE option is the right set of pairs, every distractor holds a pair that fails', () => {
    ['ex-2', 'ex-2-b', 'ex-3-1'].forEach((id) => {
      const ex = EX[id];
      ex.check.rows.forEach((row, r) => {
        expect(ex.question.rows[r].correct, `${id} row ${r}`).toBe(row.correct);
        expect(ex.question.rows[r].options).toHaveLength(row.options.length);
        const right = row.options.map((set) => {
          if (id.startsWith('ex-2')) {
            const sols = ex.check.pairs.filter((p) => holds(row.eq, p)).map(String).sort();
            return JSON.stringify(set.map(String).sort()) === JSON.stringify(sols);
          }
          return set.length === 2 && set.every((p) => holds(row.eq, p)) && String(set[0]) !== String(set[1]);
        });
        expect(right.filter(Boolean), `${id} row ${r}`).toHaveLength(1);
        expect(right.indexOf(true), `${id} row ${r}`).toBe(row.correct);
      });
    });
  });
  it('ex-3-2: the systems solved « de tête » give (1/2 ; −3) and (1 ; 3)', () => {
    ['ex-3-2a', 'ex-3-2b'].forEach((id) => {
      const ex = EX[id];
      const c = LS.classify(LS.system(...ex.check.system));
      expect(c.kind).toBe('unique');
      expect([Lin.fracText(c.x), Lin.fracText(c.y)]).toEqual([ex.question.expected.x, ex.question.expected.y]);
    });
  });
  it('ex-4: (1 ; 2) satisfies the first equation only; (2 ; −1) both', () => {
    ['ex-4-a', 'ex-4-b'].forEach((id) => {
      const ex = EX[id];
      const ok = ex.check.system.map((e) => holds(e, ex.check.pair));
      expect(ex.question.correct, id).toBe(ok.every(Boolean) ? 0 : 1);
    });
    expect(EX['ex-4-a'].check.system.map((e) => holds(e, [1, 2]))).toEqual([true, false]);
  });
  it('the ids and LPs of the book are kept; no exercise shows the climax signature or names the book', () => {
    expect(EXERCISES.map((e) => e.id)).toEqual(['ex-1', 'ex-2', 'ex-2-b', 'ex-3-1', 'ex-3-2a', 'ex-3-2b', 'ex-4-a', 'ex-4-b']);
    const text = JSON.stringify(EXERCISES.map(({ source, ...rest }) => rest));
    TEXT.forEach((re) => expect(re.test(text), String(re)).toBe(false));
    expect(/الكتاب(?!ة)|تمرين\s*\d/.test(text)).toBe(false);
  });
});
