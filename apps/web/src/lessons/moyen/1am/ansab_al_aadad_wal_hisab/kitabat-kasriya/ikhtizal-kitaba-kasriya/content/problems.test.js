import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const area2 = ([a, b, c]) => Math.abs(a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));

describe('les مسائل du درس « الكتابات الكسرية لحاصل قسمة واختزال كسر »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[6, 'masala-1'], [7, 'masala-2'], [8, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 9, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — 18/30 = 9/15 = 3/5 = 0,6', () => {
    expect(18 * 5).toBe(30 * 3);
    expect(9 * 5).toBe(15 * 3);
    expect([gcd(18, 30), gcd(9, 15)]).toEqual([6, 3]);
    expect(expectedOf('masala-1', 2)).toEqual([3 / 5]);
  });

  it('مسألة 2 — the triangles of أتعمّق 1 (5/16 and 6/16 = 3/8)', () => {
    const P = PROBLEM['masala-2'].figure.points;
    const t1 = ['P', 'Q', 'R'].map((k) => [P[k][0] - 6, P[k][1]]);
    const t2 = ['U', 'V', 'W'].map((k) => P[k]);
    expect(area2(t1) / 2).toBe(5);
    expect(area2(t2) / 2).toBe(6);
    expect(expectedOf('masala-2', 0)).toEqual([16]);
    expect(expectedOf('masala-2', 1)).toEqual([16 - 6, 6]);
    expect([gcd(6, 16), gcd(5, 16)]).toEqual([2, 1]);
  });

  it('مسألة 3 — 5Δ2□ : 5220, 5625, and 5220/5625 = 116/125', () => {
    const all = [];
    for (let t = 0; t < 10; t += 1) for (let u = 0; u < 10; u += 1) all.push(5020 + 100 * t + u);
    expect(all.filter((n) => n % 10 === 0).every((n) => n % 10 === 0)).toBe(true);
    expect(all.filter((n) => n % 45 === 0)).toEqual([5220, 5625]);
    expect(gcd(5220, 5625)).toBe(45);
    expect([5220 / 45, 5625 / 45]).toEqual([116, 125]);
  });
});
