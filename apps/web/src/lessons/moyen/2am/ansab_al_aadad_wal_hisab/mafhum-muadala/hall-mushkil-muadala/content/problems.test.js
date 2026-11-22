import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choice = (id, part, k = 0) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[k];
const keyOf = (c) => c.options[c.correct];

describe('les مسائل du درس « حلّ مشكل باستعمال معادلة »', () => {
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
  it('مسألة 1 : 3 × 0,6 = 1,8 ; 1,8 − 0,6 = 1,2 ; 1,2 × x = 18 → 15 ; 27 − 9 = 18', () => {
    expect(expectedOf('masala-1', 0)).toEqual([1.8]); expect(Math.round(3 * 0.6 * 10) / 10).toBe(1.8);
    expect(expectedOf('masala-1', 1)).toEqual([1.2]); expect(Math.round((1.8 - 0.6) * 10) / 10).toBe(1.2);
    expect(keyOf(choice('masala-1', 2))).toBe('$1{,}2\\times x=18$');
    expect(expectedOf('masala-1', 3)).toEqual([15]); expect(Math.round(1.2 * 15 * 10) / 10).toBe(18);
    expect(expectedOf('masala-1', 4)).toEqual([18]); expect(Math.round(1.8 * 15 * 10) / 10 - Math.round(0.6 * 15 * 10) / 10).toBe(18);
    // les distracteurs ne donnent pas 18 : 1,2 + x = 18 → 16,8 ; x / 1,2 = 18 → 21,6
    expect(18 - 1.2).not.toBe(15); expect(18 * 1.2).not.toBe(15);
  });
  it('مسألة 2 : 2(85 + x) = 2x + 170 ; 2x + 170 = 250 → x = 40 ; 250 × 120 = 30000', () => {
    for (const x of [0, 1, 40, 12.5]) expect(2 * (85 + x)).toBe(2 * x + 170);
    expect(keyOf(choice('masala-2', 0))).toBe('$2x+170$'); expect(keyOf(choice('masala-2', 1))).toBe('$2x+170=250$');
    expect(expectedOf('masala-2', 2)).toEqual([250 - 170, (250 - 170) / 2]); expect(2 * 40 + 170).toBe(250);
    expect(expectedOf('masala-2', 3)).toEqual([250 * 120]);
    // les distracteurs sont faux pour x = 40 : x + 170 = 210 ; 2x + 85 = 165
    expect(40 + 170).not.toBe(250); expect(2 * 40 + 85).not.toBe(250);
  });
  it('مسألة 3 : 157,5 ÷ x = 210 → 0,75 ; 157,5 ÷ 1,5 = 105 ; 157,5 ÷ 0,25 = 630', () => {
    expect(keyOf(choice('masala-3', 0))).toBe('$\\frac{157{,}5}{x}=210$');
    expect(expectedOf('masala-3', 1)).toEqual([0.75]); expect(Math.round(210 * 0.75 * 10) / 10).toBe(157.5);
    expect(expectedOf('masala-3', 2)).toEqual([105]); expect(Math.round(1.5 * 105 * 10) / 10).toBe(157.5);
    expect(expectedOf('masala-3', 3)).toEqual([630]); expect(0.25 * 630).toBe(157.5);
  });
});
