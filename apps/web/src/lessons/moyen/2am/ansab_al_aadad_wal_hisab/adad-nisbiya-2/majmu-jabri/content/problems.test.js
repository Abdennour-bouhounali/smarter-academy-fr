import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const steps = (id, part) => PROBLEM[id].parts[part].steps;
const answer = (id, part) => steps(id, part).find((s) => s.kind === 'numeric').expected;

describe('les مسائل du درس « حساب مجموع جبري »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].table).toBe(LESSON_CONFIG.lessonProblem.table);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — الغوّاص : −3 ثم −5 ، +2 ، −7 ، +9', () => {
    const moves = [-3, -5, 2, -7, 9];
    const pos = moves.map((_, i) => moves.slice(0, i + 1).reduce((a, b) => a + b, 0));
    expect(pos).toEqual([-3, -8, -6, -13, -4]);
    expect(answer('masala-1', 1)).toBe(pos.at(-1));
    expect(answer('masala-1', 2)).toBe(Math.min(...pos));
    expect(2 + 9 + (-3 - 5 - 7)).toBe(-4);
  });

  it('مسألة 2 — سطيف : −5 ثم +3 +6 −2 +4 −8', () => {
    const changes = [3, 6, -2, 4, -8];
    expect(answer('masala-2', 1)).toBe(-5 + changes.reduce((a, b) => a + b, 0));
    expect(changes.reduce((a, b) => a + b, 0)).toBe(3);
    expect(3 + 6 + 4).toBe(13);
    expect(-(5 + 2 + 8)).toBe(-15);
  });

  it('مسألة 3 — حصيلتان متعاكستان et l’arbitre à 0', () => {
    expect(answer('masala-3', 0)).toBe(-6 + -9);
    expect(answer('masala-3', 1)).toBe(4 + 18 - 7);
    expect(answer('masala-3', 0) + answer('masala-3', 1)).toBe(0);
    expect(answer('masala-3', 3)).toBe(20 - (12 + 5) - 3);
    const c = steps('masala-3', 2).find((s) => s.kind === 'choice');
    expect(c.options[c.correct]).toContain('متعاكسان');
  });
});
