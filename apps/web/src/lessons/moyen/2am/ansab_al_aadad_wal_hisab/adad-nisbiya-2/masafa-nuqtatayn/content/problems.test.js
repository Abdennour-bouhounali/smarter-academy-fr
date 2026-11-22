import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const steps = (id, part) => PROBLEM[id].parts[part].steps;
const answer = (id, part, ask) => steps(id, part).find((s) => s.kind === 'numeric' && s.ask === ask).expected;
const choice = (id, part) => steps(id, part).find((s) => s.kind === 'choice');
const gap = (a, b) => Math.abs(Math.round(a * 100) - Math.round(b * 100)) / 100;

describe('les مسائل du درس « المسافة بين نقطتين على مستقيم مدرّج »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].table).toBe(LESSON_CONFIG.lessonProblem.table);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
    for (const pb of PROBLEMS) expect(pb.table, pb.id).toBeTruthy();
  });

  it('مسألة 1 — trois villes : 13, 18, 13 ; la plus grande étendue ; la minimale +1', () => {
    const cities = { جلفة: [-5, 8], تمنراست: [4, 22], قسنطينة: [-1, 12] };
    const ranges = Object.values(cities).map(([lo, hi]) => hi - lo);
    expect(ranges).toEqual([13, 18, 13]);
    ranges.forEach((r, i) => expect(answer('masala-1', 0, i)).toBe(r));
    const c = choice('masala-1', 1);
    expect(c.options[c.correct]).toBe('تمنراست');
    expect(Math.max(...ranges)).toBe(ranges[1]);
    const cands = [-5 + 6, -5 - 6];
    expect(cands.filter((x) => x > 0)).toEqual([answer('masala-1', 2, 0)]);
    expect(gap(1, -5)).toBe(6);
  });

  it('مسألة 2 — les arrêts : 6, 9,5, 3,5 ; le kiosque 1,25 ; B la plus proche', () => {
    const A = -3.5; const B = 2.5; const C = 6;
    expect([gap(A, B), gap(A, C), gap(B, C)]).toEqual([6, 9.5, 3.5]);
    [0, 1, 2].forEach((i) => expect(answer('masala-2', 0, i)).toBe([6, 9.5, 3.5][i]));
    expect(gap(A, B) + gap(B, C)).toBe(gap(A, C));
    const mid = A + gap(A, C) / 2;
    expect(mid).toBe(1.25);
    expect(answer('masala-2', 1, 0)).toBe(mid);
    const d = { A: gap(A, mid), B: gap(B, mid), C: gap(C, mid) };
    expect(d).toEqual({ A: 4.75, B: 1.25, C: 4.75 });
    expect(Math.min(...Object.values(d))).toBe(d.B);
    expect(choice('masala-2', 2).options[choice('masala-2', 2).correct]).toBe('$B$');
  });

  it('مسألة 3 — la tour : 31,5 ; 16,5 ; la symétrie de la distance', () => {
    expect(answer('masala-3', 0, 0)).toBe(gap(-7.5, 24));
    expect(gap(-7.5, 24)).toBe(31.5);
    expect(answer('masala-3', 1, 0)).toBe(gap(-7.5, 9));
    expect(gap(-7.5, 9)).toBe(16.5);
    expect(gap(24, -7.5)).toBe(gap(-7.5, 24));
    const c = choice('masala-3', 2);
    expect(c.options[c.correct]).toBe('متساويتان');
  });
});
