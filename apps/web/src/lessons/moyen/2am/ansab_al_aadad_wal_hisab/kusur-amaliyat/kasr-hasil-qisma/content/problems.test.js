import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choice = (id, part, k = 0) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[k];

describe('les مسائل du درس « الكسر: نسبة وحاصل قسمة وقيم مقرّبة »', () => {
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
  it('مسألة 1 : 10 ÷ 3 non décimal ; 3,33 | 3,34 (3 × 3,33 = 9,99 < 10 < 10,02) ; 3,3 L ne suffit pas, 3,5 L suffit', () => {
    expect(3 * 333 < 1000 && 1000 < 3 * 334).toBe(true);
    expect(choice('masala-1', 1).options[choice('masala-1', 1).correct]).toContain('3{,}33 <');
    expect(choice('masala-1', 2, 0).correct).toBe(1);   // لا : 3,3 < 10/3
    expect(choice('masala-1', 2, 1).correct).toBe(0);   // نعم : 3,5
    expect(3 * 33 < 100).toBe(true); expect(10 / 3 > 3.3 && 10 / 3 < 3.5).toBe(true);
  });
  it('مسألة 2 : 25 ÷ 1,5 = 250 ÷ 15 ; 16,6 | 16,7 ; 17 km impossible', () => {
    expect(expectedOf('masala-2', 0)).toEqual([15]);
    expect(15 * 166 < 2500 && 2500 < 15 * 167).toBe(true);
    expect(choice('masala-2', 1).options[choice('masala-2', 1).correct]).toContain('16{,}6 <');
    expect(choice('masala-2', 2).correct).toBe(1);
    expect(250 / 15 < 17).toBe(true);
  });
  it('مسألة 3 : 1000 ÷ 1,5 = 10000 ÷ 15 : 666 pleines, 666,6 | 666,7, 667 nécessaires', () => {
    expect(expectedOf('masala-3', 0)).toEqual([10000, 666]);
    expect(15 * 666 < 10000 && 10000 < 15 * 667).toBe(true);
    expect(15 * 6666 < 100000 && 100000 < 15 * 6667).toBe(true);
    expect(choice('masala-3', 1).options[choice('masala-3', 1).correct]).toContain('666{,}6 <');
    expect(choice('masala-3', 2).correct).toBe(1);
  });
});
