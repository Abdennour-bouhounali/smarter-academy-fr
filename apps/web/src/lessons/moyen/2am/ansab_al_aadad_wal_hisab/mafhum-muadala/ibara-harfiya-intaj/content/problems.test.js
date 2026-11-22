import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choice = (id, part, k = 0) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[k];
const keyOf = (c) => c.options[c.correct];

describe('les مسائل du درس « إنتاج عبارة حرفية واستعمالها »', () => {
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
  it('مسألة 1 : 1500 + 120x ; x = 10, 25, 50 → 2700, 4500, 7500 ; x = 0, 1, 2 → 1500, 1620, 1740', () => {
    const f = (x) => 1500 + 120 * x;
    expect(keyOf(choice('masala-1', 0))).toBe('$1500+120x$');
    expect(expectedOf('masala-1', 1)).toEqual([f(10), f(25), f(50)]);
    expect(expectedOf('masala-1', 2)).toEqual([f(0), f(1), f(2)]);
    expect(expectedOf('masala-1', 1)).toEqual([2700, 4500, 7500]);
    expect(f(0)).toBe(1500);
  });
  it('مسألة 2 : 24 ÷ 2 = 12 ; x(12 − x) en x = 5 → 35, x = 6 → 36 ; x = 12 → 0', () => {
    expect(24 / 2).toBe(12);
    expect(keyOf(choice('masala-2', 0, 0))).toBe('$12$ m'); expect(keyOf(choice('masala-2', 0, 1))).toBe('$12-x$');
    expect(expectedOf('masala-2', 2)).toEqual([5 * (12 - 5), 6 * (12 - 6)]); expect(expectedOf('masala-2', 2)).toEqual([35, 36]);
    expect(12 - 12).toBe(0);
    // le distracteur 24 − x est faux : 2 × (x + 24 − x) = 48 ≠ 24
    expect(2 * (5 + (24 - 5))).not.toBe(24);
  });
  it('مسألة 3 : (x + 4) × 2 − 2x = 8 pour x = 3, 10, 0 (et en fait pour tout x)', () => {
    const g = (x) => (x + 4) * 2 - 2 * x;
    expect(expectedOf('masala-3', 0)).toEqual([g(3), g(10), g(0)]);
    for (let x = 0; x < 200; x += 1) expect(g(x)).toBe(8);
    expect(expectedOf('masala-3', 2)).toEqual([8]);
    // les distracteurs de l'expression ne donnent PAS 8 pour tout x
    expect([0, 1, 2, 3].map((x) => 2 * x + 4 - 2 * x)).toEqual([4, 4, 4, 4]);
    expect([0, 1, 2, 3].map((x) => x + 4 * 2 - 2 * x)).toEqual([8, 7, 6, 5]);
  });
});
