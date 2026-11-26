// THE EVIDENCE of fraction-irreductible: the shared checks (authoring kit) — a claim is true exactly when `check` accepts the
// WHOLE answer — then the lesson's own: which savoir-faire each key proves, against the lock, and the mistakes its
// students make (a term not divided, a result left as it is, the denominators added, a verdict by 2, 3 and 5).
// The first shared check and the config assertions fail until `lesson.config.js` (modules and their points) is written.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { describeEvidence } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { LESSON_CONFIG } from '../lesson.config';
import { KNOWLEDGE } from './knowledge';
import { KEYS } from './journey';
import { evidence, trainerEvidence } from './evidence';
import { check, solution, trainer } from './trainer';

const ID = 'fraction-irreductible';
const LOCK = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL('../../../../../../../../../../packages/core/curriculum/fr/learning_points.lock.json', import.meta.url),
    ),
    'utf8',
  ),
);
/** The kinds whose first exam try is evidence, and their boxes. */
const BOXES = {
  barrer: ['p', 'q'],
  verdict: ['g'],
  diviser: ['g', 'p', 'q'],
  calcul: ['s', 't', 'p', 'q'],
};
const KINDS = ['barrer', 'verdict', 'diviser', 'calcul'];
/** The mistakes of THIS lesson — each must make the claim false, as `check` refuses it. */
const MISTAKES = (q, right) => {
  if (q.kind === 'barrer')
    return [
      { p: right.p, q: q.b },
      { p: q.a, q: q.b },
    ];
  if (q.kind === 'verdict')
    return [
      { ...right, verdict: right.verdict === 'irr' ? 'red' : 'irr' },
      { ...right, g: Math.abs(q.a - q.b) || 1 },
    ];
  if (q.kind === 'diviser')
    return [
      { ...right, p: q.a, q: q.b },
      { ...right, p: right.p, q: q.b },
    ];
  if (q.kind === 'calcul')
    return [
      { ...right, p: right.s, q: right.t },
      { ...right, s: q.x + q.z, t: q.y + q.w },
    ];
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
  it('the points of the keys: P2 ← K1, P1 ← K2, P4 ← K3, P3 ← K4 — the ids of the lock', () => {
    expect(KEYS.map((k) => evidence.learningPointOf(ID, k))).toEqual([
      `3e_${ID}_P2`,
      `3e_${ID}_P1`,
      `3e_${ID}_P4`,
      `3e_${ID}_P3`,
    ]);
    expect(LOCK.lessons[ID].grade).toBe('3e');
    expect(LOCK.lessons[ID].points).toHaveLength(4);
  });

  it('the points the config teaches are exactly the four of the lock (config)', () => {
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
          if (q.kind === 'diviser') {
            expect(trainerEvidence(q, { ...right, g: right.g + 1 }, FIRST).claim.kind).toBe('pgcd');
            expect(trainerEvidence(q, right, FIRST).claim).toMatchObject({ kind: 'fraction', a: q.a, b: q.b });
          }
          if (q.kind === 'verdict') {
            expect(trainerEvidence(q, { ...right, g: right.g + 1 }, FIRST).claim.kind).toBe('pgcd');
            expect(trainerEvidence(q, right, FIRST).claim.kind).toBe('coprime');
          }
          if (q.kind === 'calcul') {
            // the first writing wrong: its claim is the first, unreduced one; both carry the calculation
            const first = trainerEvidence(q, { ...right, s: right.s + 1 }, FIRST).claim;
            expect(first).toMatchObject({ kind: 'fraction', reduced: false, op: q.op === '×' ? '*' : '+' });
            expect(trainerEvidence(q, right, FIRST).claim.reduced).toBeUndefined();
          }
          seen.add(q.kind);
        }
    expect([...seen].sort()).toEqual([...KINDS].sort());
  });

  it('never evidence: a tap, a second try or a helped answer', () => {
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id))
      for (const q of trainer.makeSession(rng(42), card)) {
        if (q.kind === 'tap')
          expect(trainerEvidence(q, solution(q), { firstTry: true, helped: false }), q.kind).toBe(null);
        expect(trainerEvidence(q, solution(q), { firstTry: false, helped: false })).toBe(null);
        expect(trainerEvidence(q, solution(q), { firstTry: true, helped: true })).toBe(null);
      }
  });
});
