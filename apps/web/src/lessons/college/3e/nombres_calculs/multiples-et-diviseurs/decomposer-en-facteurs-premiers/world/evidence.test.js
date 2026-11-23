// THE EVIDENCE of decomposer-en-facteurs-premiers: the shared checks (authoring kit) — a claim is true exactly when
// `check` accepts the WHOLE answer — then the lesson's own: which savoir-faire each key proves, against the lock, and
// the mistakes its students make (a composite left in, an exponent read as a factor, a verdict without the limit).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { describeEvidence } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { LESSON_CONFIG } from '../lesson.config';
import { KNOWLEDGE } from './knowledge';
import { KEYS } from './journey';
import { evidence, factorizationOf, trainerEvidence } from './evidence';
import { check, solution, trainer } from './trainer';

const ID = 'decomposer-en-facteurs-premiers';
const LOCK = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL('../../../../../../../../../../packages/core/curriculum/fr/learning_points.lock.json', import.meta.url),
    ),
    'utf8',
  ),
);
const boxes = (q) =>
  ({
    decompose: Array.from({ length: q.count ?? 0 }, (_, i) => `f${i + 1}`),
    big: Array.from({ length: q.count ?? 0 }, (_, i) => `f${i + 1}`),
    powers: (q.primes ?? []).map((p) => `e${p}`),
    quotient: (q.primes ?? []).map((p) => `e${p}`),
    prime: ['d'],
  })[q.kind] ?? null;
/** The mistakes of THIS lesson: a composite kept, a factor 1 added, the verdict flipped or forgotten. */
const mistakes = (q, right) => {
  if (q.kind === 'decompose' || q.kind === 'big') {
    const [a, b] = q.list;
    return [
      { ...right, f1: a * b, f2: right.f3, f3: 1 },
      { ...right, f1: 1 },
    ];
  }
  if (q.kind === 'prime')
    return [
      { ...right, says: right.says === 'oui' ? 'non' : 'oui' },
      { ...right, says: undefined },
      { ...right, says: 'peut-être' },
    ];
  if (q.kind === 'powers' || q.kind === 'quotient') return [Object.fromEntries(Object.keys(right).map((k) => [k, 1]))];
  return [];
};

// key 3 proves P1 as key 1 does (a key proves ONE point, and the lesson has three points for four keys): the shared
// suite asks one point per key, so it is handed the three keys that prove three different points — key 3's claims are
// checked by it all the same (its questions are in every session of its cards)
describeEvidence({
  id: ID,
  keys: KEYS.filter((k) => k !== 'arret'),
  evidence,
  trainerEvidence,
  trainer,
  check,
  solution,
  cards: KNOWLEDGE.graph.nodes.map((n) => n.id),
  boxes,
  kinds: ['decompose', 'big', 'powers', 'quotient', 'prime'],
  mistakes,
  config: LESSON_CONFIG,
});

describe('decomposer-en-facteurs-premiers — its own evidence', () => {
  it('the points of the keys: P1 ← keys 1 and 3, P2 ← key 2, P3 ← key 4 — the ids of the lock', () => {
    expect(KEYS.map((k) => evidence.learningPointOf(ID, k))).toEqual([
      `3e_${ID}_P1`,
      `3e_${ID}_P2`,
      `3e_${ID}_P1`,
      `3e_${ID}_P3`,
    ]);
    // the lock keeps the texts in order: P<n> is the n-th — three points for this lesson
    expect(LOCK.lessons[ID].grade).toBe('3e');
    expect(LOCK.lessons[ID].points).toHaveLength(3);
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    expect([...taught].sort()).toEqual([`3e_${ID}_P1`, `3e_${ID}_P2`, `3e_${ID}_P3`]);
  });

  it('a factorization claim groups the typed primes with their exponents, whatever their order', () => {
    expect(factorizationOf(84, [7, 2, 3, 2])).toEqual({
      kind: 'factorization',
      a: 84,
      factors: [
        { p: 2, e: 2 },
        { p: 3, e: 1 },
        { p: 7, e: 1 },
      ],
    });
    expect(verifyClaim(factorizationOf(84, [7, 2, 3, 2]))).toBe(true);
    expect(verifyClaim(factorizationOf(84, [4, 3, 7]))).toBe(false);
    expect(verifyClaim(factorizationOf(84, [NaN, 3, 7]))).toBe(false);
  });

  it('never evidence: a tap, a true / false, the trace of the program, a second try or a helped answer', () => {
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id))
      for (const q of trainer.makeSession(rng(42), card)) {
        if (['tap', 'tf', 'trace'].includes(q.kind))
          expect(trainerEvidence(q, solution(q), { firstTry: true, helped: false }), q.kind).toBe(null);
        expect(trainerEvidence(q, solution(q), { firstTry: false, helped: false })).toBe(null);
        expect(trainerEvidence(q, solution(q), { firstTry: true, helped: true })).toBe(null);
      }
  });
});
