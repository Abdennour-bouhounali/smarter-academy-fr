import { describe, it, expect } from 'vitest';
import { describeEvidence } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { evidence, trainerEvidence } from './evidence';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { check, solution, trainer } from './trainer';
import { gcd } from './math';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * THE MISTAKES of this lesson's students, each a whole answer: a writing equal to the fraction that still reduces, the
 * fraction not divided at all, the denominators added, the stage divided by another number, the verdict swapped.
 */
function mistakes(q, right) {
  switch (q.kind) {
    case 'marahil':
      return [
        { ...right, p1: q.a, q1: q.b },
        { ...right, p2: right.p1, q2: right.q1 },
        { ...right, q1: q.b },
      ];
    case 'hukm':
      return [
        { ...right, verdict: right.verdict === 'irr' ? 'red' : 'irr' },
        { ...right, verdict: undefined },
        { g: 1, verdict: 'irr' },
      ];
    case 'mukhtazal': {
      const g = right.g;
      const d = [2, 3, 5, 7].find((k) => g % k === 0 && k < g);
      return [
        { ...right, p: q.a, q: q.b },
        { ...right, p: right.p * 2, q: right.q * 2 },
        ...(d
          ? [
              { g: g / d, p: q.a / d, q: q.b / d },
              { ...right, p: q.a / d, q: q.b / d },
            ]
          : []),
      ];
    }
    case 'hisab':
      return [
        { ...right, t: q.B * 2 },
        { ...right, s: right.s * 2, t: right.t * 2 },
        { ...right, p: right.s, q: right.t },
        { ...right, s: right.p, t: right.q },
        { ...right, p: right.p * 3, q: right.q * 3 },
      ];
    default:
      return [];
  }
}

describeEvidence({
  id: 'ikhtizal-kasr',
  keys: KEYS,
  evidence,
  trainerEvidence,
  trainer,
  check,
  solution,
  config: LESSON_CONFIG,
  cards: KNOWLEDGE.graph.nodes.map((n) => n.id),
  boxes: { marahil: ['p1', 'q1', 'p2', 'q2'], hukm: ['g'], mukhtazal: ['g', 'p', 'q'], hisab: ['s', 't', 'p', 'q'] },
  mistakes,
});

describe('the evidence of « اختزال كسر » — the lesson’s own', () => {
  it('each key proves its own الكفاءة: 🪜 P1, 🔒 P2, 🎯 P3, 🧾 P4', () => {
    expect(KEYS.map((k) => evidence.learningPointOf('ikhtizal-kasr', k))).toEqual([
      '4am_ikhtizal-kasr_P1',
      '4am_ikhtizal-kasr_P2',
      '4am_ikhtizal-kasr_P3',
      '4am_ikhtizal-kasr_P4',
    ]);
  });

  it('a right answer sends the claim that states it whole; an equal writing that still reduces is never a true claim', () => {
    const seen = new Set();
    for (const card of ['marahil', 'ghayr', 'pgcd', 'natija'])
      for (let seed = 1; seed <= 40; seed += 1)
        for (const q of trainer.makeSession(rng(seed * 31 + 7), card)) {
          if (q.format !== 'exam') continue;
          seen.add(q.kind);
          const right = solution(q);
          const ev = trainerEvidence(q, right, { firstTry: true, helped: false });
          expect(verifyClaim(ev.claim), q.prompt).toBe(true);
          if (q.kind === 'mukhtazal') {
            expect(ev.claim).toMatchObject({ kind: 'fraction', a: q.a, b: q.b, p: right.p, q: right.q });
            const twice = { ...right, p: right.p * 2, q: right.q * 2 };
            expect(verifyClaim(trainerEvidence(q, twice, { firstTry: true, helped: false }).claim)).toBe(false);
          }
          if (q.kind === 'hisab') {
            const op = { '+': '+', '-': '-', '×': '*' }[q.op];
            expect(ev.claim).toMatchObject({ kind: 'fraction', a: q.A, b: q.B, op, x: q.x, y: q.y, z: q.z, w: q.w });
            expect(gcd(ev.claim.p, ev.claim.q)).toBe(1);
            // the claim states the CALCULATION: a result A/B the browser got wrong makes it false, even when the
            // student's writing equals that wrong result (the server computes x/y op z/w itself)
            const forged = { ...ev.claim, a: ev.claim.a + ev.claim.b, b: ev.claim.b };
            expect(
              verifyClaim({ ...forged, p: forged.a / gcd(forged.a, forged.b), q: forged.b / gcd(forged.a, forged.b) }),
            ).toBe(false);
            const withoutCalc = { ...forged, op: undefined };
            expect(
              verifyClaim({
                ...withoutCalc,
                p: forged.a / gcd(forged.a, forged.b),
                q: forged.b / gcd(forged.a, forged.b),
              }),
            ).toBe(true);
          }
          if (q.kind === 'hukm') expect(ev.claim).toMatchObject({ kind: 'coprime', says: gcd(q.a, q.b) === 1 });
          if (q.kind === 'marahil') expect(ev.claim).toMatchObject({ kind: 'division', a: q.b / q.d, b: q.e });
        }
    expect([...seen].sort()).toEqual(['hisab', 'hukm', 'marahil', 'mukhtazal']);
  });
});
