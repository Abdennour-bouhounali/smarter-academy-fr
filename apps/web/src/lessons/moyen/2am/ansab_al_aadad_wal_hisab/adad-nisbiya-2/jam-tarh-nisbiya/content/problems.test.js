import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const steps = (id, part) => PROBLEM[id].parts[part].steps;
const answer = (id, part) => steps(id, part).find((s) => s.kind === 'numeric').expected;

describe('les مسائل du درس « جمع وطرح عددين نسبيين »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].table).toBe(LESSON_CONFIG.lessonProblem.table);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — صباحات الجلفة : −4 ثم +11 ثم −9', () => {
    expect(answer('masala-1', 0)).toBe(-4 + 11);
    expect(answer('masala-1', 1)).toBe(-4 + 11 - 9);
    expect(answer('masala-1', 2)).toBe(-2 - -4);
  });

  it('مسألة 2 — مصعد البرج : −2 ثم +9 ثم −11 ; la différence −11', () => {
    expect(answer('masala-2', 0)).toBe(-2 + 9);
    expect(answer('masala-2', 1)).toBe(-2 + 9 - 11);
    expect(answer('masala-2', 2)).toBe(-4 - 7);
    expect(-2 + 9 - 11).toBeGreaterThanOrEqual(-4);
  });

  it('مسألة 3 — مسابقة : حصيلتان متعاكستان et l’écart 8', () => {
    expect(answer('masala-3', 0)).toBe(10 - 6);
    expect(answer('masala-3', 1)).toBe(5 - 9);
    expect(answer('masala-3', 0) + answer('masala-3', 1)).toBe(0);
    expect(answer('masala-3', 3)).toBe(4 - -4);
    const c = steps('masala-3', 2).find((s) => s.kind === 'choice');
    expect(c.options[c.correct]).toContain('متعاكستان');
  });
});
