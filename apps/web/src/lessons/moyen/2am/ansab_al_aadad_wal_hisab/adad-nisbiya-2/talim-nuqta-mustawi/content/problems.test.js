import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const steps = (id, part) => PROBLEM[id].parts[part].steps;
const answer = (id, part, ask) => steps(id, part).find((s) => s.kind === 'numeric' && s.ask === ask).expected;
const choice = (id, part) => steps(id, part).find((s) => s.kind === 'choice');

describe('les مسائل du درس « تعليم نقطة في المستوي »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].table).toBe(LESSON_CONFIG.lessonProblem.table);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
    for (const pb of PROBLEMS) expect(pb.figure, pb.id).toBeTruthy();
  });

  it('مسألة 1 — le terrain : D(−4 ; −2), 45 m et 25 m, la région de P', () => {
    const A = [-4, 3]; const B = [5, 3]; const C = [5, -2];
    expect(answer('masala-1', 0, 0)).toBe(A[0]);
    expect(answer('masala-1', 0, 1)).toBe(C[1]);
    expect(answer('masala-1', 1, 0)).toBe(Math.abs(B[0] - A[0]) * 5);
    expect(answer('masala-1', 1, 1)).toBe(Math.abs(A[1] - C[1]) * 5);
    const c = choice('masala-1', 2);
    expect(c.options[c.correct]).toBe('فوق محور الفواصل وعلى يمين محور التراتيب');
    expect(3.5 > 0 && 0.5 > 0).toBe(true);
  });

  it('مسألة 2 — la carte : axes, symétrique de la bibliothèque, nouveau repère', () => {
    const L = [3, -2]; const B = [-2, 4]; const O = [0, 0];
    expect(choice('masala-2', 0).options[choice('masala-2', 0).correct]).toBe('الصيدلية والبريد');
    expect(answer('masala-2', 1, 0)).toBe(L[0]);
    expect(answer('masala-2', 1, 1)).toBe(-L[1]);
    expect(answer('masala-2', 2, 0)).toBe(O[0] - B[0]);
    expect(answer('masala-2', 2, 1)).toBe(O[1] - B[1]);
  });

  it('مسألة 3 — la température : points, signes, unité', () => {
    const temps = [-2, 1.5, -0.5, 3];
    expect(answer('masala-3', 0, 0)).toBe(temps[2]);
    expect(temps.map((t, i) => (t < 0 ? i + 1 : 0)).filter(Boolean)).toEqual([1, 3]);
    const c = choice('masala-3', 2);
    // la plus petite quantité de degrés par cm qui garde 3 °C dans 6 cm : 3 / 6 = 0,5
    expect(3 / 6).toBe(0.5);
    expect(c.options[c.correct]).toContain('0{,}5');
    expect(3 / 0.25).toBeGreaterThan(6);
    expect(3 / 1).toBeLessThan(6);
  });
});
