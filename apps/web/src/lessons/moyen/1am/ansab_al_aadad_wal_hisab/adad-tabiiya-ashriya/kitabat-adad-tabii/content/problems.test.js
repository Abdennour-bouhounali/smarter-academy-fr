import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const count = (n, k) => Math.floor(n / 10 ** k);
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);

describe('les مسائل du درس « كتابة الأعداد الطبيعية ودلالة الأرقام »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[6, 'masala-1'], [7, 'masala-2'], [8, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 9, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — 245 380 DA', () => {
    const n = 245 * 1000 + 380;
    expect(expectedOf('masala-1', 0)).toEqual([n]);
    expect(String(n)[2]).toBe('5');
    expect(expectedOf('masala-1', 1)).toEqual([count(n, 3)]);
    expect(expectedOf('masala-1', 2)).toEqual([count(n, 3), n % 1000]);
  });

  it('مسألة 2 — 4 cartons, 12 rames, 23 feuilles', () => {
    const n = 4 * 1000 + 12 * 100 + 23;
    expect(expectedOf('masala-2', 0)).toEqual([n]);
    expect(String(n)).toBe('5223');
    expect(expectedOf('masala-2', 2)).toEqual([count(n, 2), n % 100]);
  });

  it('مسألة 3 — 1 099 999 + 1', () => {
    const n = 1099999 + 1;
    expect(expectedOf('masala-3', 1)).toEqual([n]);
    expect(String(1099999).match(/9+$/)[0]).toHaveLength(5);
    expect(expectedOf('masala-3', 2)).toEqual([Number(String(n)[1]), count(n, 3)]);
    expect(n).toBe(1 * 1e6 + 1 * 1e5);
  });
});
