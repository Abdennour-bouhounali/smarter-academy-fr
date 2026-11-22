import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle écrit autrement que la leçon : chaque nombre recalculé ici avec de l'arithmétique entière. */
const numericOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceKey = (step) => step.options[step.correct];

describe('les مسائل du درس « نشر عبارات جبرية »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].illustration).toBe(LESSON_CONFIG.lessonProblem.illustration);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — ساحة : (x+7)(x+4) = x² + 11x + 28 ; العشب x² + 9x + 14 ; x = 5 → 84 م², 12 600 دج', () => {
    for (const x of [-3, 0, 1, 5, 9]) {
      expect((x + 7) * (x + 4)).toBe(x * x + 11 * x + 28);
      expect((x + 7) * (x + 4) - 2 * (x + 7)).toBe(x * x + 9 * x + 14);
      expect((x + 7) * (x + 4) - 2 * (x + 7)).not.toBe(x * x + 9 * x + 28);
    }
    expect(choiceKey(PROBLEM['masala-1'].parts[0].steps[1])).toBe('$x^2+11x+28$');
    expect(choiceKey(PROBLEM['masala-1'].parts[1].steps[1])).toBe('$x^2+9x+14$');
    expect(numericOf('masala-1', 1)).toEqual([84]);
    expect(12 * 9 - 2 * 12).toBe(84);
    expect(numericOf('masala-1', 2)).toEqual([84 * 150]);
  });

  it('مسألة 2 — برنامج : (x+4)(x−2) − x² = 2x − 8 ; x = 10 → 12', () => {
    for (const x of [-5, 3, 10]) {
      expect((x + 4) * (x - 2) - x * x).toBe(2 * x - 8);
      expect((x + 4) * (x - 2)).not.toBe(2 * x - 8);
    }
    expect(choiceKey(PROBLEM['masala-2'].parts[1].steps[0])).toBe('$2x-8$');
    expect(numericOf('masala-2', 2)).toEqual([12]);
    expect(14 * 8 - 100).toBe(12);
  });

  it('مسألة 3 — أرض وممرّان : (x−2)(x−3) = x² − 5x + 6 ; x = 10 → 56 م², 6 720 دج', () => {
    for (const x of [-2, 0, 4, 10]) {
      expect((x - 2) * (x - 3)).toBe(x * x - 5 * x + 6);
      expect((x - 2) * (x - 3)).not.toBe(x * x - 5 * x - 6);
    }
    expect(choiceKey(PROBLEM['masala-3'].parts[0].steps[2])).toBe('$x^2-5x+6$');
    expect(numericOf('masala-3', 2)).toEqual([56 * 120]);
    expect(8 * 7).toBe(56);
    expect(2 * 3).toBe(6);
  });
});
