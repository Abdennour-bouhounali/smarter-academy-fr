import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const steps = (id, part) => PROBLEM[id].parts[part].steps;
const answer = (id, part, ask) => steps(id, part).find((s) => s.kind === 'numeric' && s.ask === ask).expected;
const choice = (id, part) => steps(id, part).find((s) => s.kind === 'choice');

describe('les مسائل du درس « التعليم على مستقيم مدرّج »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — la frise : origine 2000 puis 1990', () => {
    expect(answer('masala-1', 0, 0)).toBe(1985 - 2000);
    expect(answer('masala-1', 0, 1)).toBe(2024 - 2000);
    expect(answer('masala-1', 2, 0)).toBe(2024 - 1990);
    const years = [1985, 1990, 2010, 2015, 2024].map((y) => y - 2000);
    const pairs = years.flatMap((a, i) => years.slice(i + 1).filter((b) => a === -b).map((b) => [a, b]));
    expect(pairs).toEqual([[-15, 15], [-10, 10]]);
    const c = choice('masala-1', 1);
    expect(c.options[c.correct]).toBe('$1985$ و $2015$');
    // la graduation : la plus petite de 2, 5, 10 qui garde −15 … 24 dans six graduations
    const fits = (g) => years.every((x) => Math.abs(x) <= 6 * g);
    const t = steps('masala-1', 2).find((s) => s.kind === 'choice');
    const gs = t.options.map((o) => Number(o.replace(/[^0-9]/g, '')));
    expect(gs[t.correct]).toBe(Math.min(...gs.filter(fits)));
  });

  it('مسألة 2 — le niveau du barrage', () => {
    const levels = [1.5, 0.5, -0.75, -2.25];
    const fits = (g) => levels.every((x) => Math.abs(x) <= 6 * g);
    const c = choice('masala-2', 0);
    const gs = c.options.map((o) => Number(o.replace(/\$/g, '').replace('{,}', '.')));
    expect(gs[c.correct]).toBe(Math.min(...gs.filter(fits)));
    expect(gs.filter(fits).length).toBeGreaterThan(1);
    expect(levels.includes(-0.5)).toBe(false);
    expect(answer('masala-2', 2, 0)).toBe(2.25);
  });

  it('مسألة 3 — les étages', () => {
    expect(answer('masala-3', 0, 0)).toBe(-3);
    expect(-4 < -3).toBe(true);
    expect(answer('masala-3', 2, 0)).toBe(-3 - 2);
  });
});
