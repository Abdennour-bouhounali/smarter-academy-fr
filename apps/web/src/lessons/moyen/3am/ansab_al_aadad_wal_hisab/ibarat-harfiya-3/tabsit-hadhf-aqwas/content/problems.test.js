import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle écrit autrement que la leçon : chaque nombre recalculé ici avec de l'arithmétique entière. */
const numericOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceKey = (step) => step.options[step.correct];

describe('les مسائل du درس « تبسيط عبارة جبرية وحذف الأقواس »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].illustration).toBe(LESSON_CONFIG.lessonProblem.illustration);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — jardin triangulaire : 6x + 12, clôture 5x + 15, x = 5 → 40 m, 12 000 DA', () => {
    const x = 5;
    const sides = [2 * x + 5, x + 8, 3 * x - 1];
    for (const k of [1, 2, 7]) {
      const xx = k;
      expect((2 * xx + 5) + (xx + 8) + (3 * xx - 1)).toBe(6 * xx + 12);
      expect(6 * xx + 12 - (xx - 3)).toBe(5 * xx + 15);
      expect(6 * xx + 12 - xx - 3).not.toBe(5 * xx + 15); // le signe oublié
    }
    expect(sides.reduce((a, b) => a + b, 0)).toBe(42);
    expect(choiceKey(PROBLEM['masala-1'].parts[0].steps[1])).toBe('$6x+12$');
    expect(choiceKey(PROBLEM['masala-1'].parts[1].steps[1])).toBe('$5x+15$');
    expect(numericOf('masala-1', 1)).toEqual([5 * x + 15]);
    expect(numericOf('masala-1', 2)).toEqual([(5 * x + 15) * 300]);
    expect(numericOf('masala-1', 1)[0]).toBe(40);
  });

  it('مسألة 2 — حافلة : (3x+4) − (x−2) + (2x+5) = 4x + 11, x = 6 → 35', () => {
    for (const x of [0, 1, 6, 9]) {
      expect((3 * x + 4) - (x - 2) + (2 * x + 5)).toBe(4 * x + 11);
      expect((3 * x + 4) - x - 2 + (2 * x + 5)).not.toBe(4 * x + 11);
    }
    expect(choiceKey(PROBLEM['masala-2'].parts[1].steps[0])).toBe('$4x+11$');
    expect(numericOf('masala-2', 2)).toEqual([4 * 6 + 11]);
    expect(22 - 4 + 17).toBe(35);
  });

  it('مسألة 3 — قاعة : مساحة 6x², محيط 10x, x = 4 → 96 م², 40 م, 76 800 + 10 000 = 86 800', () => {
    const x = 4;
    expect(3 * x * (2 * x)).toBe(6 * x * x);
    expect(3 * x + 2 * x + 3 * x + 2 * x).toBe(10 * x);
    expect(numericOf('masala-3', 0)).toEqual([6 * x * x * 800]);
    expect(numericOf('masala-3', 1)).toEqual([10 * x * 250]);
    expect(numericOf('masala-3', 2)).toEqual([6 * x * x * 800 + 10 * x * 250]);
    expect(choiceKey(PROBLEM['masala-3'].parts[0].steps[1])).toBe('$6x^2$');
    expect(choiceKey(PROBLEM['masala-3'].parts[1].steps[0])).toBe('$10x$');
  });
});
