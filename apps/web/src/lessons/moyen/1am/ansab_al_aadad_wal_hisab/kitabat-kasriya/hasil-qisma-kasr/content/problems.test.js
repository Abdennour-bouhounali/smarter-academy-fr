import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);

describe('les مسائل du درس « حاصل القسمة والكسر »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });
  it('مسألة 1 — 7 ÷ 3 : 3 × 7/3 = 7 ; 2,33 par défaut à 0,01 ; 3 × 2,33 = 6,99', () => {
    expect(expectedOf('masala-1', 1)).toEqual([7]);
    expect(expectedOf('masala-1', 2)).toEqual([2.33]);
    expect(Math.floor((7 * 100) / 3) / 100).toBe(2.33);
    expect(Math.round(3 * 233)).toBe(699);
    expect(7 % 3).not.toBe(0);
  });
  it('مسألة 2 — 27,28 × 14 = 381,92 ; + 8 = 389,92 ; + 0,08 = 382 (centièmes exacts)', () => {
    expect(Math.round(2728 * 14)).toBe(38192);
    expect(expectedOf('masala-2', 1)).toEqual([381.92, 389.92]);
    expect(38192 + 8 * 100).toBe(38992);
    expect(38192 + 8).toBe(38200);
    expect(expectedOf('masala-2', 2)).toEqual([382]);
  });
  it('مسألة 3 — 13/8 : 8 × 13/8 = 13 ; 13 ÷ 8 = 1,625 (1625 × 8 = 13000)', () => {
    expect(expectedOf('masala-3', 1)).toEqual([13]);
    expect(expectedOf('masala-3', 2)).toEqual([1.625]);
    expect(1625 * 8).toBe(13000);
  });
});
