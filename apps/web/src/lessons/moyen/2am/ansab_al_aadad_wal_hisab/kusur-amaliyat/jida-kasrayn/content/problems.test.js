import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choice = (id, part, k = 0) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[k];
const keyOf = (c) => c.options[c.correct];
// fractions entières indépendantes : a/b → [a, b] ; égalité par produit en croix
const eq = ([a, b], [c, d]) => a * d === c * b;
const mul = ([a, b], [c, d]) => [a * c, b * d];

describe('les مسائل du درس « جداء كسرين »', () => {
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
  it('مسألة 1 : 1 − 1/4 = 3/4 ; 2/3 de 3/4 = 6/12 = 1/2 ; 1/4 + 1/2 = 3/4 ; 1/4 × 2400 = 600', () => {
    expect(keyOf(choice('masala-1', 0))).toContain('\\frac{3}{4}'); expect(4 - 1).toBe(3);
    expect(expectedOf('masala-1', 1)).toEqual([6]); expect(mul([2, 3], [3, 4])).toEqual([6, 12]); expect(eq([6, 12], [1, 2])).toBe(true);
    expect(keyOf(choice('masala-1', 1))).toContain('\\frac{1}{2}');
    expect(eq([1 * 2 + 1 * 4, 8], [3, 4])).toBe(true);                       // 1/4 + 1/2 = 3/4
    expect(keyOf(choice('masala-1', 2))).toContain('\\frac{3}{4}');
    expect(expectedOf('masala-1', 3)).toEqual([600]); expect(2400 / 4).toBe(600); expect(2400 * (1 - 3 / 4)).toBe(600);
  });
  it('مسألة 2 : 1 − 1/3 = 2/3 ; 1/2 de 2/3 = 1/3 ; 1/3 + 1/3 = 2/3 ; 1/3 × 45 = 15', () => {
    expect(keyOf(choice('masala-2', 0, 0))).toContain('\\frac{2}{3}');
    expect(eq(mul([1, 2], [2, 3]), [1, 3])).toBe(true); expect(keyOf(choice('masala-2', 0, 1))).toContain('\\frac{1}{3}');
    expect(keyOf(choice('masala-2', 1))).toContain('\\frac{2}{3}');
    expect(expectedOf('masala-2', 2)).toEqual([15]); expect(45 / 3).toBe(15);
  });
  it('مسألة 3 : 2/3 × 3/4 = 1/2 ; 1/2 × 216 = 108 ; 2/3 × 18 = 12 ; 3/4 × 12 = 9 ; 12 × 9 = 108', () => {
    expect(eq(mul([2, 3], [3, 4]), [1, 2])).toBe(true); expect(keyOf(choice('masala-3', 0))).toContain('\\frac{1}{2}');
    expect(expectedOf('masala-3', 1)).toEqual([108, 12, 9, 108]);
    expect((18 * 12) / 2).toBe(108); expect((2 * 18) / 3).toBe(12); expect((3 * 12) / 4).toBe(9); expect(12 * 9).toBe(108);
  });
});
