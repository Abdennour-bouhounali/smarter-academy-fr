import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');

describe('les مسائل du درس « تطبيق قاعدة حرفية »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — C = 6 000 + 150 × n : 24 → 9 600 ; 40 → 12 000 ; 48 → 13 200 ≠ 19 200', () => {
    const C = (n) => 6000 + 150 * n;
    expect(expectedOf('masala-1', 0)).toEqual([C(24)]);
    expect(C(24)).toBe(9600);
    expect(150 * 24).toBe(3600);
    expect(expectedOf('masala-1', 1)).toEqual([C(40)]);
    expect(C(40)).toBe(12000);
    expect(expectedOf('masala-1', 2)).toEqual([2 * C(24), C(48)]);
    expect(C(48)).toBe(13200);
    expect(2 * C(24)).toBe(19200);
    expect(C(48)).not.toBe(2 * C(24));
    expect(choicesOf('masala-1', 0)[0].options[0]).toContain('6\\,000+150\\times 24');
    expect(PROBLEM['masala-1'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['teachers']);
  });

  it('مسألة 2 — P = 2 × (a + b) : (26 ; 14) → 80 ; 80 × 450 = 36 000 ; (19 ; 21) → 80', () => {
    const P = (a, b) => 2 * (a + b);
    expect(expectedOf('masala-2', 0)).toEqual([26 + 14, P(26, 14)]);
    expect(P(26, 14)).toBe(80);
    expect(expectedOf('masala-2', 1)).toEqual([80 * 450]);
    expect(80 * 450).toBe(36000);
    expect(expectedOf('masala-2', 2)).toEqual([P(19, 21)]);
    expect(P(19, 21)).toBe(80);
    expect(P(26, 14)).toBe(P(19, 21));
    expect(26 * 14).not.toBe(19 * 21); // les deux jardins n'ont pas la même aire : le grillage seul est le même (ce que la leçon ne dit pas)
    expect(choicesOf('masala-2', 2)[0].options[0]).toContain('يكفي');
    expect(PROBLEM['masala-2'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['doors']);
  });

  it('مسألة 3 — 2 × n + 3 et 3 × n : (3) → 9 et 9 ; (5) → 13 et 15, la règle ne tient pas toujours', () => {
    const A = (n) => 2 * n + 3;
    const B = (n) => 3 * n;
    expect(expectedOf('masala-3', 0)).toEqual([A(3), B(3)]);
    expect([A(3), B(3)]).toEqual([9, 9]);
    expect(expectedOf('masala-3', 1)).toEqual([A(5), B(5)]);
    expect([A(5), B(5)]).toEqual([13, 15]);
    // égaux seulement pour n = 3 : 2n + 3 = 3n ⇔ n = 3
    expect([...Array(31).keys()].filter((n) => A(n) === B(n))).toEqual([3]);
    expect(PROBLEM['masala-3'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['pupils']);
    expect(PROBLEM['masala-3'].source.elementId).toBe('deep-5');
  });
});
