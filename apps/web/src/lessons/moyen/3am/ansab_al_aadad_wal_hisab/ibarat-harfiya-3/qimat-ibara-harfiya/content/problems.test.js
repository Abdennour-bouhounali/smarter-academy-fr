import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle écrit autrement que la leçon : chaque nombre recalculé ici avec de l'arithmétique entière (centièmes/dixièmes exacts). */
const numericOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceKey = (step) => step.options[step.correct];

describe('les مسائل du درس « حساب قيمة عبارة حرفية »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].illustration).toBe(LESSON_CONFIG.lessonProblem.illustration);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — الحديقة : S = (x+3)(2x−1) = 2x² + 5x − 3 ; x = 2,5 → 22 ; x = 3,5 → 39 ; 22 > 20', () => {
    // en dixièmes : x = 25/10 → (x+3)(2x−1) = (55/10)(40/10) = 2200/100
    const S = (x10) => ((x10 + 30) * (2 * x10 - 10)); // en centièmes
    expect(S(25) / 100).toBe(22);
    expect(S(35) / 100).toBe(39);
    for (const x of [-3, 0, 1, 5, 9]) {
      expect((x + 3) * (2 * x - 1) + 0).toBe(2 * x * x + 5 * x - 3);
    }
    expect([-3, 0, 1, 5, 9].some((x) => (x + 3) * (2 * x - 1) !== 2 * x * x + 7 * x - 3)).toBe(true);
    expect(choiceKey(PROBLEM['masala-1'].parts[0].steps[1])).toBe('$2x^2+5x-3$');
    expect(numericOf('masala-1', 1)).toEqual([22]);
    expect(numericOf('masala-1', 3)).toEqual([39]);
    expect(22 > 20 && 39 > 20).toBe(true);
    expect(choiceKey(PROBLEM['masala-1'].parts[2].steps[0])).toContain('كيسان');
    // la forme développée en 2,5 : 12,5 + 12,5 − 3 = 22 (centièmes)
    expect(2 * 625 + 5 * 250 - 300).toBe(2200);
  });

  it('مسألة 2 — برنامجان : (x+3)² − 9 et x² + 6 : 7 et 7 en 1, 16 et 10 en 2 ; x(x+6) = (x+3)² − 9 = x² + 6x', () => {
    const P1 = (x) => (x + 3) ** 2 - 9; const P2 = (x) => x * x + 6; const P3 = (x) => x * (x + 6);
    expect([P1(1), P2(1)]).toEqual([7, 7]);
    expect([P1(2), P2(2)]).toEqual([16, 10]);
    expect(numericOf('masala-2', 0)).toEqual([7, 7]);
    expect(numericOf('masala-2', 1)).toEqual([16, 10]);
    expect([P3(-1), P1(-1)]).toEqual([-5, -5]);
    expect(numericOf('masala-2', 3)).toEqual([-5]);
    for (const x of [-7, -3, -1, 0, 2, 4, 10]) { expect(P1(x)).toBe(P3(x)); expect(P1(x)).toBe(x * x + 6 * x); }
    expect(P1(2) === P2(2)).toBe(false);
    expect(choiceKey(PROBLEM['masala-2'].parts[2].steps[0])).toContain('مثال مضاد');
  });

  it('مسألة 3 — الحرارة : T = 15 − 6h : 0 en 2,5 ; −3 en 3 ; 15,24 en −0,04 ; 1,2 en 2,3', () => {
    // en centièmes
    const T = (h100) => 1500 - 6 * h100; // h en centièmes de km → T en centièmes de degré
    expect(T(250)).toBe(0); expect(T(300)).toBe(-300); expect(T(-4)).toBe(1524); expect(T(230)).toBe(120);
    expect(numericOf('masala-3', 0)).toEqual([0, -3]);
    expect(numericOf('masala-3', 1)).toEqual([15.24]);
    expect(numericOf('masala-3', 2)).toEqual([1.2]);
    expect(T(0)).toBe(1500); expect(T(-4) > T(0)).toBe(true);
    expect(-0.04 * 1000).toBeCloseTo(-40, 6); // 40 m = 0,04 km
  });
});
