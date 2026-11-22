import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choice = (id, part, k = 0) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[k];
// fractions entières indépendantes : a/b → [a, b] ; égalité par produit en croix
const eq = ([a, b], [c, d]) => a * d === c * b;

describe('les مسائل du درس « جمع وطرح كسرين »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });
  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test)', () => {
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug, m.stage])).toEqual([
      [5, 'masala-1', 'practice_lab'], [6, 'masala-2', 'practice_lab'], [7, 'masala-3', 'practice_lab'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => [q.label, q.text])).toEqual(PROBLEM['masala-1'].parts.map((p) => [p.label, p.question]));
  });
  it('every demand has its own answer', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ${k}`).toBe(true));
    }
  });
  it('مسألة 1 : 2/5 + 3/10 = 7/10 ; 1 − 7/10 = 3/10 ; sur 20 : 14 et 6 (10 est multiple de 5 et de 1 : cas de 2AM)', () => {
    expect(expectedOf('masala-1', 0)).toEqual([4]); expect(4 * 5).toBe(2 * 10);
    expect(eq([4 + 3, 10], [7, 10])).toBe(true);
    expect(choice('masala-1', 0).options[choice('masala-1', 0).correct]).toContain('\\frac{7}{10}');
    expect(choice('masala-1', 1).options[choice('masala-1', 1).correct]).toContain('\\frac{3}{10}');
    expect(10 - 7).toBe(3);
    expect(expectedOf('masala-1', 2)).toEqual([14, 6]); expect(14 * 10).toBe(7 * 20); expect(6 * 10).toBe(3 * 20);
  });
  it('مسألة 2 : 1/4 = 2/8 ; 2/8 + 3/8 = 5/8 ; 1 − 5/8 = 3/8 ; 5/8 > 4/8', () => {
    expect(expectedOf('masala-2', 0)).toEqual([2]); expect(2 * 4).toBe(1 * 8);
    expect(choice('masala-2', 0).options[choice('masala-2', 0).correct]).toContain('\\frac{5}{8}');
    expect(2 + 3).toBe(5); expect(8 - 5).toBe(3);
    expect(choice('masala-2', 1).options[choice('masala-2', 1).correct]).toContain('\\frac{3}{8}');
    expect(choice('masala-2', 2).correct).toBe(0); expect(5 > 4).toBe(true);
  });
  it('مسألة 3 : 1/3 = 4/12 ; 5/12 + 4/12 = 9/12 = 3/4 ; 1 − 3/4 = 1/4 = 3/12 ; 3/12 + 1/12 = 4/12 = 1/3', () => {
    expect(expectedOf('masala-3', 0)).toEqual([4]); expect(4 * 3).toBe(1 * 12);
    expect(eq([5 + 4, 12], [3, 4])).toBe(true);
    expect(eq([4 - 3, 4], [3, 12])).toBe(true);
    expect(expectedOf('masala-3', 2)).toEqual([3]); expect(3 * 4).toBe(1 * 12);
    expect(eq([3 + 1, 12], [1, 3])).toBe(true);
    expect(choice('masala-3', 2, 0).options[choice('masala-3', 2, 0).correct]).toContain('\\frac{4}{12}');
  });
});
