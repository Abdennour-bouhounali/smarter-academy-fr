import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choice = (id, part, k = 0) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[k];
const keyOf = (c) => c.options[c.correct];

describe('les مسائل du درس « اختبار صحة مساواة أو متباينة »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });
  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test)', () => {
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug, m.stage])).toEqual([
      [5, 'masala-1', 'practice_lab'], [6, 'masala-2', 'practice_lab'], [7, 'masala-3', 'practice_lab'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].table).toEqual(LESSON_CONFIG.lessonProblem.table);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => [q.label, q.text])).toEqual(PROBLEM['masala-1'].parts.map((p) => [p.label, p.question]));
  });
  it('every demand has its own answer and every مسألة has a drawn support', () => {
    for (const p of PROBLEMS) {
      expect(p.table, p.id).toBeTruthy();
      for (const part of p.parts) part.asks.forEach((_, k) => expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ${k}`).toBe(true));
    }
  });
  it('مسألة 1 : 70x + 45 ≤ 630 — 605 ✓, 675 ✗, plus grand x = 8 ; le tableau', () => {
    expect(keyOf(choice('masala-1', 0))).toBe('$70x+45\\le630$');
    expect(expectedOf('masala-1', 1)).toEqual([70 * 8 + 45, 70 * 9 + 45]); expect(605 <= 630).toBe(true); expect(675 <= 630).toBe(false);
    expect(expectedOf('masala-1', 2)).toEqual([8]);
    expect(Array.from({ length: 15 }, (_, x) => x).filter((x) => 70 * x + 45 <= 630).pop()).toBe(8);
    expect(PROBLEM['masala-1'].table.rows.map((r) => [70 * Number(r[0]), 70 * Number(r[0]) + 45])).toEqual(PROBLEM['masala-1'].table.rows.map((r) => [Number(r[1]), Number(r[2])]));
  });
  it('مسألة 2 : 6x + 900 = 10x — 1800, 2250, 2700 ; seule 225 ; 2250', () => {
    expect(keyOf(choice('masala-2', 0))).toBe('$6x+900=10x$');
    expect(expectedOf('masala-2', 1)).toEqual([150, 225, 300].map((x) => 6 * x + 900));
    expect([150, 225, 300].filter((x) => 6 * x + 900 === 10 * x)).toEqual([225]);
    expect(keyOf(choice('masala-2', 2))).toBe('$225$ دينارًا');
    expect(expectedOf('masala-2', 3)).toEqual([10 * 225]); expect(6 * 225 + 900).toBe(2250);
    expect(PROBLEM['masala-2'].table.rows.map((r) => 10 * Number(r[0]))).toEqual(PROBLEM['masala-2'].table.rows.map((r) => Number(r[1])));
  });
  it('مسألة 3 : 4 + 5 + 6 = 15 = 3 × 5 ; 4 × 5 × 6 = 120 ≠ 125 ; (n − 1) + n + (n + 1) = 3n', () => {
    expect(expectedOf('masala-3', 0)).toEqual([4 + 5 + 6, 4 * 5 * 6]); expect(4 * 5 * 6).not.toBe(5 ** 3);
    expect(keyOf(choice('masala-3', 1))).toContain('مثال مضادّ واحد يكفي');
    expect(keyOf(choice('masala-3', 2))).toContain('لا، مثال واحد');
    expect(keyOf(choice('masala-3', 3))).toBe('$3n$'); for (const n of [1, 5, 9]) expect((n - 1) + n + (n + 1)).toBe(3 * n);
  });
});
