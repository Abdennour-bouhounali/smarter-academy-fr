import { describe, it, expect } from 'vitest';
import { EXERCISES, NOW_47_1, partsOf } from './exercises.js';
import { TEXT } from './forbidden.js';

/**
 * Les exercices de muadala-ula, réécrits par la plateforme (verdict X2) : chaque équation est ÉCRITE ici comme une fonction f(x) = membre gauche −
 * membre droit, et la solution annoncée doit l'annuler (et elle seule : f(x + 1) ≠ 0). Rien n'est lu de la chaîne LaTeX.
 */
const s3 = Math.sqrt(3); const s2 = Math.sqrt(2);
const EQ = {
  'now-47-1-a': [(x) => 9 - 4 * x, 9 / 4], 'now-47-1-b': [(x) => (-x + 5) / 3 - (x + 1) / 2, 7 / 5], 'now-47-1-c': [(x) => 3 * x - 1 / 2 - (x / 4 + 5), 2],
  'ex-1-a': [(x) => 3 * x - 14, 14 / 3], 'ex-1-b': [(x) => -4 * x - 7, -7 / 4], 'ex-1-c': [(x) => 1.5 * x - 4.5, 3], 'ex-1-d': [(x) => x / 3 - 8, 24],
  'ex-2-a': [(x) => 10 * x - 1000, 100], 'ex-2-b': [(x) => 1e6 * x - 1e4, 1 / 100], 'ex-2-c': [(x) => 9 * x - 81, 9],
  'ex-3-a': [(x) => x + 12 - 4, -8], 'ex-3-b': [(x) => x - 7 - 7, 14], 'ex-3-c': [(x) => s3 - x - (2 - s3), 2 * s3 - 2], 'ex-3-d': [(x) => 2.6 + x - 4, 7 / 5],
  'ex-4-a': [(x) => 4 * x + 9 - 17, 2], 'ex-4-b': [(x) => x - 5 - (2 * x + 3), -8], 'ex-4-c': [(x) => 3 * x - 4 - (-x + 6), 5 / 2], 'ex-4-d': [(x) => 4 * x + 9 - (9 * x + 4), 1],
  'ex-5-a': [(x) => s3 * x - Math.sqrt(12), 2], 'ex-5-b': [(x) => 3 * s2 * x - (s2 * x + Math.sqrt(50)), 5 / 2], 'ex-5-c': [(x) => s3 * x + Math.sqrt(12) * x - 9 * s3, 3],
  'ex-5-d': [(x) => x / s3 - x / 3 - 2 / (s3 + 1), 3], 'ex-5-e': [(x) => 3 * s2 * x - (s2 / 2) * x - s2 / 4, 1 / 10],
  'ex-6-2': [(x) => 3 * x + 20 - 4 * (x - 3) - 50, -18],
  'ex-7-2': [(x) => 3 * (2 * x - 1) + 5 - (4 * (x + 2) - x), 2],
  'ex-8-a': [(x) => 0.5 * (4 * x - 1) - 3 * (x / 3 - 0.5), -1], 'ex-8-b': [(x) => 9 * x * x - 3 * (x + 4) - 2 - 3 * x * (3 * x - 2), 14 / 3],
  'ex-9-a': [(x) => (x - 2) / 8 - (x + 1) / 4, -4], 'ex-9-c': [(x) => (x + 3) / 6 - (1 / 6 - x / 3), -2 / 3], 'ex-9-d': [(x) => x - ((x + 5) / 3 + 1), 4],
};
const near = (a, b) => Math.abs(a - b) < 1e-9;
const all = [...NOW_47_1, ...EXERCISES];

describe('the rewritten exercises of muadala-ula', () => {
  it('every typed answer is the root of its own equation, and the only one', () => {
    all.filter((ex) => ex.interaction === 'fraction').forEach((ex) => {
      const [f, root] = EQ[ex.id];
      const [n, d = '1'] = ex.question.expected.split('/');
      expect(near(Number(n) / Number(d), root), `${ex.id} expected ${ex.question.expected}`).toBe(true);
      expect(near(f(root), 0), ex.id).toBe(true);
      expect(near(f(root + 1), 0), `${ex.id} unique`).toBe(false);
    });
    expect(Object.keys(EQ).filter((id) => !all.some((ex) => ex.id === id))).toEqual([]);
  });
  it('the choices: the right option is true and every distractor is false', () => {
    const c3 = EXERCISES.find((e) => e.id === 'ex-3-c').question;
    expect(near(2 * s3 - 2, EQ['ex-3-c'][1])).toBe(true);
    expect(c3.options[c3.correct]).toContain('2\\sqrt{3} - 2');
    expect(c3.options.filter((o, i) => i !== c3.correct && near(o.includes('2 - 2') ? 2 - 2 * s3 : 2, EQ['ex-3-c'][1]))).toEqual([]);
    // ex-9-b has no solution: 2 + 2x = 2x + 5 never holds
    const c9 = EXERCISES.find((e) => e.id === 'ex-9-b').question;
    expect(c9.options[c9.correct]).toContain('لا يوجد');
    [0, -1.5, 3, 100].forEach((x) => expect(near((1 + x) / 2, (2 * x + 5) / 4)).toBe(false));
    // ex-6-1 and ex-7-1 expansions
    const f6 = (x) => 3 * x + 20 - 4 * (x - 3);
    [0, 1, 5].forEach((x) => expect(near(f6(x), -x + 32)).toBe(true));
    [0, 2, 7].forEach((x) => { expect(near(3 * (2 * x - 1) + 5, 6 * x + 2)).toBe(true); expect(near(4 * (x + 2) - x, 3 * x + 8)).toBe(true); });
    expect(EXERCISES.find((e) => e.id === 'ex-6-1').question.options[1]).toBe('$-x + 32$');
  });
  it('the nine families and their ids, learning points and difficulties are kept', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9].every((n) => partsOf(n).length > 0)).toBe(true);
    expect(EXERCISES.map((e) => e.id)).toHaveLength(30);
    all.forEach((ex) => { expect(ex.learningPointId).toMatch(/^4am_muadala-ula_P[12]$/); expect(['facile', 'moyen', 'difficile']).toContain(ex.difficulty); expect(ex.source.part).toBe('بأعداد المنصّة'); });
  });
  it('never shows the climax signature, a control character or the book', () => {
    const text = JSON.stringify(all.map((e) => ({ ...e, source: undefined })));
    TEXT.forEach((re) => expect(re.test(text), String(re)).toBe(false));
    expect(/[\t\n\r]/.test(text.replace(/\\[nrt]/g, ''))).toBe(false);
    expect(/الكتاب(?!ة)|تمرين\s*\d/.test(text)).toBe(false);
  });
});
