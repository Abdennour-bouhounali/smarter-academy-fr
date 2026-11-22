import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;
const choiceOf = (id, part, i = 0) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[i];
const numerics = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);

describe('les مسائل du درس « جداء عددين نسبيين »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — la température (−2) × t : −8 à 4 h, 6 à 21 h (t = −3), 5 à 21 h 30 (t = −2,5)', () => {
    const temp = (t2) => -2 * t2 / 2; // t en demi-heures
    expect(answerOf('masala-1', 0, 0)).toBe(temp(8));
    expect(answerOf('masala-1', 1, 0)).toBe(temp(-6));
    const c = choiceOf('masala-1', 2);
    expect(c.options[c.correct]).toBe('21:30');
    // 21:30 → t = −2,5 ; 02:30 → 2,5 ; 22:00 → −2 ; 19:00 → −5
    const times = { '21:30': -5, '02:30': 5, '22:00': -4, '19:00': -10 };
    c.options.forEach((o, i) => expect(temp(times[o]) === 5, o).toBe(i === c.correct));
  });

  it('مسألة 2 — +3 / −2 : 10, 5, puis deux questions annulées (−2) × (−2) = 4 → 9', () => {
    expect(6 * 3 + 4 * -2).toBe(answerOf('masala-2', 0, 0));
    expect(4 * -2).toBe(numerics('masala-2', 0)[0]);
    expect(5 * 3 + 5 * -2).toBe(answerOf('masala-2', 1, 0));
    expect((-2) * (-2)).toBe(4);
    expect(answerOf('masala-2', 2, 1)).toBe(5 + 4);
    expect(5 * 3 + 3 * -2).toBe(9); // la vérification du texte
    const c = choiceOf('masala-2', 2);
    expect(c.options[c.correct]).toContain('4');
  });

  it('مسألة 3 — (−350) × 3 = −1050 ; (−350) × (−4) = 1400 ; (−350) × 7 = −2450', () => {
    expect(answerOf('masala-3', 0, 0)).toBe(-350 * 3);
    expect(answerOf('masala-3', 1, 0)).toBe(-350 * -4);
    const c = choiceOf('masala-3', 2);
    const n = { '$7$': 7, '$-7$': -7, '$6$': 6, '$8$': 8 };
    c.options.forEach((o, i) => expect(-350 * n[o] === -2450, o).toBe(i === c.correct));
  });
});
