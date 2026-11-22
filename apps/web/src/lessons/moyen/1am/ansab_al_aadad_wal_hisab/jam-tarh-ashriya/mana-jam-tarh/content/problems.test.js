import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// Décimaux exacts : tout en centièmes entiers.
const c = (x) => Math.round(x * 100);
const back = (n) => n / 100;
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);

describe('les مسائل du درس « معنى الجمع والطرح »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.slug, m.stage])).toEqual([
      [5, 'masala-1', 'practice_lab'], [6, 'masala-2', 'practice_lab'], [7, 'masala-3', 'practice_lab'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => [q.label, q.text]))
      .toEqual(PROBLEM['masala-1'].parts.map((p) => [p.label, p.question]));
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('مسألة 1 — the numbers are computed, not typed (« ينقصه » ⇒ addition)', () => {
    const spent = 2450 - 380;
    const stories = spent - 1275;
    expect(expectedOf('masala-1', 0)).toEqual([spent]);
    expect(expectedOf('masala-1', 1)).toEqual([stories, 1275 - stories]);
    expect(expectedOf('masala-1', 2)).toEqual([380 + 140]);
    expect(1275).toBeGreaterThan(stories);
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const rest = c(68.4) - c(27.85);
    expect(expectedOf('masala-2', 0).map(c)).toEqual([rest]);
    expect(expectedOf('masala-2', 1).map(c)).toEqual([rest - c(27.85)]);
    const back2 = c(68.4) - c(5.6);
    expect(expectedOf('masala-2', 2).map(c)).toEqual([back2, c(68.4) + back2]);
    expect(back(rest)).toBe(40.55);
  });

  it('مسألة 3 — the numbers are computed, not typed (« أكثر » ⇒ +, « أقلّ » ⇒ −)', () => {
    const b = c(18.6) + c(4.75);
    const cc = b - c(7.2);
    expect(expectedOf('masala-3', 0).map(c)).toEqual([b]);
    expect(expectedOf('masala-3', 1).map(c)).toEqual([cc]);
    const total = c(18.6) + b + cc;
    expect(expectedOf('masala-3', 2).map(c)).toEqual([total]);
    expect(total).toBeLessThan(c(60)); // « نعم : تكفي رحلة واحدة » (option 0)
    expect(PROBLEM['masala-3'].parts[2].steps.find((s) => s.kind === 'choice').correct).toBe(0);
  });
});
