import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { guardEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { evidence, trainerEvidence } from './evidence';
import { trainer, solution, check, PLAN_OF } from './trainer';
import { KEYS } from './journey';
import { LESSON_CONFIG } from '../lesson.config';

const FIRST = { firstTry: true, helped: false };

/** Every answer that keeps one part of the right answer and spoils another: a box emptied, a number moved, a yes flipped. */
function halfWrong(right) {
  if (typeof right !== 'object' || right === null) return [];
  const out = [];
  for (const k of Object.keys(right)) {
    const v = right[k];
    if (typeof v === 'boolean') out.push({ ...right, [k]: !v });
    else for (const w of ['', Number(v) + 1, Number(v) - 1, 0]) out.push({ ...right, [k]: w });
  }
  return out;
}

describe('the evidence of « قواسم عدد طبيعي »', () => {
  it('each key proves one الكفاءة of the lesson, by its catalogue id', () => {
    const points = KEYS.map((key) => evidence.learningPointOf('qawasim-adad-tabii', key));
    expect(points).toEqual(['P1', 'P2', 'P3', 'P4'].map((p) => `4am_qawasim-adad-tabii_${p}`));
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    for (const p of points) expect(taught.has(p), p).toBe(true);
  });

  it('only an exam answer given at the first try without help is sent, as a claim', () => {
    const q = { format: 'exam', kind: 'stop', key: KEYS[2], a: 96 };
    const ev = trainerEvidence(q, { d: 9, e: 10 }, FIRST);
    expect(ev).toEqual({ key: KEYS[2], claim: { kind: 'stop', a: 96, b: 9 } });
    expect(evidence.payloadOf('qawasim-adad-tabii', 'trainer', ev, 'att-1')).toEqual({
      attemptId: 'att-1',
      learningPoint: '4am_qawasim-adad-tabii_P3',
      context: 'trainer',
      claim: { kind: 'stop', a: 96, b: 9 },
    });
    expect(trainerEvidence(q, { d: 9, e: 10 }, { firstTry: true, helped: true })).toBe(null);
    expect(trainerEvidence({ ...q, format: 'game' }, { d: 9, e: 10 }, FIRST)).toBe(null);
    expect(trainerEvidence({ format: 'exam', kind: 'tf', key: KEYS[0] }, { truth: true, reason: 0 }, FIRST)).toBe(null);
    expect(evidence.caseEvidence()).toBe(null);
    expect(evidence.verify({ kind: 'stop', a: 96, b: 9 })).toBe(true);
  });

  it('a right answer makes a true claim — every kind, a perfect square too (6 × 6 is one line of 36)', () => {
    let seen = 0;
    for (const id of Object.keys(PLAN_OF))
      for (let seed = 1; seed <= 40; seed += 1)
        for (const q of trainer.makeSession(rng(seed * 11 + 3), id)) {
          const ev = q.format === 'exam' ? trainerEvidence(q, solution(q), FIRST) : null;
          if (!ev) continue;
          seen += 1;
          expect(check(q, solution(q)).ok).toBe(true);
          expect(evidence.verify(ev.claim), `${q.kind} ${q.a}`).toBe(true);
        }
    expect(seen).toBeGreaterThan(200);
    const sq = { format: 'exam', kind: 'pairs', key: KEYS[0], a: 36, n: 5 };
    const lines = { x0: 1, y0: 36, x1: 2, y1: 18, x2: 3, y2: 12, x3: 4, y3: 9, x4: 6, y4: 6 };
    expect(evidence.verify(trainerEvidence(sq, lines, FIRST).claim)).toBe(true);
  });

  it('a half-wrong answer never yields a true claim (and the kit drops one that would)', () => {
    let tried = 0;
    for (const id of Object.keys(PLAN_OF))
      for (let seed = 1; seed <= 40; seed += 1)
        for (const q of trainer.makeSession(rng(seed * 13 + 5), id)) {
          if (q.format !== 'exam' || q.kind === 'tf') continue;
          for (const v of halfWrong(solution(q))) {
            if (check(q, v).ok) continue;
            const ev = trainerEvidence(q, v, FIRST);
            tried += 1;
            expect(ev && evidence.verify(ev.claim), `${q.kind} ${q.a} ${JSON.stringify(v)}`).toBeFalsy();
            expect(guardEvidence(ev, false)?.claim ?? null).toEqual(ev?.claim ?? null);
          }
        }
    expect(tried).toBeGreaterThan(500);
    // 1 × 2 and 3 × 6 hold every divisor of 6, yet neither line is 6: the claim is the false line
    const six = { format: 'exam', kind: 'pairs', key: KEYS[0], a: 6, n: 2 };
    const ev = trainerEvidence(six, { x0: 1, y0: 2, x1: 3, y1: 6 }, FIRST);
    expect(check(six, { x0: 1, y0: 2, x1: 3, y1: 6 }).ok).toBe(false);
    expect(evidence.verify(ev.claim)).toBe(false);
  });
});
