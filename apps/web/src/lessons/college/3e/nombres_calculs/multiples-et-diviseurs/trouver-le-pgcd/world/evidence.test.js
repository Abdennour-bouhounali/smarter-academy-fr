// THE EVIDENCE of trouver-le-pgcd: the shared checks (authoring kit) — a claim is true exactly when `check` accepts the
// WHOLE answer — then the lesson's own: which savoir-faire each key proves, against the lock, and the mistakes its
// students make (the difference for the PGCD, a smaller common divisor, the largest exponent, the last quotient).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { describeEvidence } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { LESSON_CONFIG } from '../lesson.config';
import { KNOWLEDGE } from './knowledge';
import { KEYS } from './journey';
import { euclid } from './math';
import { evidence, trainerEvidence } from './evidence';
import { check, solution, trainer } from './trainer';

const ID = 'trouver-le-pgcd';
const LOCK = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL('../../../../../../../../../../packages/core/curriculum/fr/learning_points.lock.json', import.meta.url),
    ),
    'utf8',
  ),
);
const SLOTS = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'];
/** The kinds whose first exam try is evidence, and their boxes. */
const BOXES = (q) =>
  ({
    communs: [...SLOTS, 'g'],
    lots: ['n', 'x', 'y'],
    facteurs: [...(q.common ?? []).map((f) => `e${f.p}`), 'g'],
    euclide: ['q', 'r', 'g'],
  })[q.kind] ?? null;
const KINDS = ['communs', 'lots', 'facteurs', 'euclide'];
/** The mistakes of THIS lesson — each must make the claim false, as `check` refuses it. */
const MISTAKES = (q, right) => {
  if (q.kind === 'communs')
    return [
      { ...right, g: Math.abs(q.a - q.b) },
      { ...right, g: q.list.at(-2) },
    ];
  if (q.kind === 'lots') {
    // a smaller common divisor, with what each lot would then hold (a sharing that works, not the most lots)
    const n = q.list?.at?.(-2) ?? [2, 3, 5, 7].find((d) => q.a % d === 0 && q.b % d === 0 && d < q.g);
    return n ? [{ n, x: q.a / n, y: q.b / n }] : [];
  }
  if (q.kind === 'facteurs')
    return [
      // the largest exponent of each common prime
      {
        ...right,
        ...Object.fromEntries(
          q.common.map((f) => [`e${f.p}`, Math.max(q.xs.find((x) => x.p === f.p).e, q.ys.find((y) => y.p === f.p).e)]),
        ),
      },
      { ...right, g: q.A },
    ];
  if (q.kind === 'euclide') {
    const rows = euclid(q.a, q.b);
    return [
      { ...right, g: rows.at(-1).q },
      { ...right, g: rows[0].r },
    ];
  }
  return [];
};

describeEvidence({
  id: ID,
  keys: KEYS,
  evidence,
  trainerEvidence,
  trainer,
  check,
  solution,
  cards: KNOWLEDGE.graph.nodes.map((n) => n.id),
  boxes: BOXES,
  kinds: KINDS,
  mistakes: MISTAKES,
  config: LESSON_CONFIG,
});

describe(`${ID} — its own evidence`, () => {
  it('the points of the keys: P1 ← K1, P4 ← K2, P2 ← K3, P3 ← K4 — the ids of the lock', () => {
    expect(KEYS.map((k) => evidence.learningPointOf(ID, k))).toEqual([
      `3e_${ID}_P1`,
      `3e_${ID}_P4`,
      `3e_${ID}_P2`,
      `3e_${ID}_P3`,
    ]);
    expect(LOCK.lessons[ID].grade).toBe('3e');
    expect(LOCK.lessons[ID].points).toHaveLength(4);
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    expect([...taught].sort()).toEqual([1, 2, 3, 4].map((n) => `3e_${ID}_P${n}`));
  });

  it('a half-right answer claims its first wrong part, never the part that is right', () => {
    const FIRST = { firstTry: true, helped: false };
    const seen = new Set();
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id))
      for (let seed = 1; seed <= 6; seed += 1)
        for (const q of trainer.makeSession(rng(seed * 31 + 5), card)) {
          if (q.format !== 'exam' || !KINDS.includes(q.kind)) continue;
          const right = solution(q);
          if (q.kind === 'lots') {
            expect(trainerEvidence(q, { ...right, x: right.x + 1 }, FIRST).claim.kind).toBe('pair');
            expect(trainerEvidence(q, right, FIRST).claim).toEqual({ kind: 'pgcd', a: q.a, b: q.b, g: q.g });
          }
          if (q.kind === 'euclide')
            expect(trainerEvidence(q, { ...right, r: right.r + 1 }, FIRST).claim.kind).toBe('division');
          if (q.kind === 'facteurs')
            expect(trainerEvidence(q, { ...right, g: right.g + 1 }, FIRST).claim.kind).toBe('pgcd');
          if (q.kind === 'communs')
            expect(trainerEvidence(q, { ...right, c0: q.a + 1 }, FIRST).claim.kind).not.toBe('pgcd');
          seen.add(q.kind);
        }
    expect([...seen].sort()).toEqual([...KINDS].sort());
  });

  it('never evidence: a tap, a true / false, a second try or a helped answer', () => {
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id))
      for (const q of trainer.makeSession(rng(42), card)) {
        if (['tap', 'tf'].includes(q.kind))
          expect(trainerEvidence(q, solution(q), { firstTry: true, helped: false }), q.kind).toBe(null);
        expect(trainerEvidence(q, solution(q), { firstTry: false, helped: false })).toBe(null);
        expect(trainerEvidence(q, solution(q), { firstTry: true, helped: true })).toBe(null);
      }
  });
});
