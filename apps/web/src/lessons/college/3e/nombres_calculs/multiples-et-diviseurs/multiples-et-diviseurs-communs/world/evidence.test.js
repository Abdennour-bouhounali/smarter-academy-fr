// THE EVIDENCE of multiples-et-diviseurs-communs: the shared checks (authoring kit) — a claim is true exactly when `check`
// accepts the WHOLE answer — then the lesson's own: which savoir-faire each key proves (four keys, three points: `pointOf`),
// against the lock, and the mistakes its students make (the product, the smaller exponent, the turns swapped, the rest days
// as the cycle, the day counted from 0, a duration for a clock time, the other tool).
// The config is `../lesson.config` until the assembly renames it: this test fails until it is written.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { describeEvidence } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { LESSON_CONFIG } from '../lesson.config';
import { KNOWLEDGE } from './knowledge';
import { KEYS } from './journey';
import { lcmOf } from './math';
import { evidence, trainerEvidence } from './evidence';
import { check, solution, trainer } from './trainer';

const ID = 'multiples-et-diviseurs-communs';
const LOCK = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL('../../../../../../../../../../packages/core/curriculum/fr/learning_points.lock.json', import.meta.url),
    ),
    'utf8',
  ),
);
/** Four keys, three points: K3 and K4 both prove P3 (a rendez-vous problem read as a duration, a number of turns, a day). */
const POINT_OF = { 'pilier-commun': 'P1', 'ppcm-facteurs': 'P2', 'traduire-rendez-vous': 'P3', 'cinq-equipes': 'P3' };
/** The kinds whose first exam try is evidence, and their boxes. */
const BOXES = (q) =>
  ({
    pilier: ['m', 'x', 'y'],
    rendezvous: ['m', 'x', 'y'],
    facteurs: [...(q.big ?? []).map((f) => `e${f.p}`), 'g'],
    horaire: ['m', 'h', 'min'],
    fenetre: ['m', 'n'],
    jours: ['m', 'd'],
    outil: ['g', 'm'],
    budget: ['m', 'n'],
  })[q.kind] ?? null;
const KINDS = ['pilier', 'rendezvous', 'facteurs', 'horaire', 'fenetre', 'jours', 'outil', 'budget'];
/** The mistakes of THIS lesson — each must make the claim false, as `check` refuses it. */
const MISTAKES = (q, right) => {
  switch (q.kind) {
    case 'pilier':
    case 'rendezvous':
      // the product, the larger number, the turns swapped
      return [
        { m: q.a * q.b, x: q.b, y: q.a },
        { ...right, m: Math.max(q.a, q.b) },
        { ...right, x: right.y, y: right.x },
      ];
    case 'facteurs':
      // the smaller exponent of every prime, the exponent 1 everywhere
      return [
        {
          ...right,
          ...Object.fromEntries(
            q.big.map((f) => [`e${f.p}`, Math.min(...q.xs.map((fs) => fs.find((g) => g.p === f.p)?.e ?? 99))]),
          ),
        },
        { ...right, ...Object.fromEntries(q.big.map((f) => [`e${f.p}`, 1])) },
      ];
    case 'horaire':
      return [{ ...right, h: 0, min: q.m }];
    case 'fenetre':
      return [{ ...right, n: Math.ceil(q.window / q.m) + (q.window % q.m === 0 ? 1 : 0) }];
    case 'jours':
      // the rest days as the cycle, day 1 forgotten
      return [
        { m: lcmOf(q.rests), d: 1 + lcmOf(q.rests) },
        { m: q.m, d: q.m },
      ];
    case 'outil':
      return [
        { g: q.m, m: q.g },
        { g: q.g, m: q.g },
      ];
    case 'budget':
      return [{ ...right, m: q.a * q.b }];
    default:
      return [];
  }
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
  pointOf: POINT_OF,
  config: LESSON_CONFIG,
});

describe(`${ID} — its own evidence`, () => {
  it('the points of the keys: P1 ← K1, P2 ← K2, P3 ← K3 and K4 — the ids of the lock', () => {
    expect(KEYS.map((k) => evidence.learningPointOf(ID, k))).toEqual([
      `3e_${ID}_P1`,
      `3e_${ID}_P2`,
      `3e_${ID}_P3`,
      `3e_${ID}_P3`,
    ]);
    expect(LOCK.lessons[ID].grade).toBe('3e');
    expect(LOCK.lessons[ID].points).toHaveLength(3);
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    expect([...taught].sort()).toEqual([1, 2, 3].map((n) => `3e_${ID}_P${n}`));
  });

  it('a half-right answer claims its first wrong part, never the part that is right', () => {
    const FIRST = { firstTry: true, helped: false };
    const seen = new Set();
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id))
      for (let seed = 1; seed <= 6; seed += 1)
        for (const q of trainer.makeSession(rng(seed * 31 + 5), card)) {
          if (q.format !== 'exam' || !KINDS.includes(q.kind)) continue;
          const right = solution(q);
          const kind = (v) => trainerEvidence(q, v, FIRST).claim.kind;
          if (q.kind === 'pilier' || q.kind === 'rendezvous') {
            expect(kind({ ...right, x: right.x + 1 })).toBe('pair');
            expect(kind({ ...right, m: right.m + 1 })).toBe('ppcm');
            expect(trainerEvidence(q, right, FIRST).claim).toMatchObject({ kind: 'ppcm', a: q.a, b: q.b, m: q.m });
          }
          if (q.kind === 'facteurs') {
            expect(kind({ ...right, g: right.g + 1 })).toBe('ppcm');
            expect(kind({ ...right, [`e${q.big[0].p}`]: q.big[0].e + 1 })).toBe('factorization');
          }
          if (q.kind === 'horaire') {
            expect(kind({ ...right, min: right.min + 1 })).toBe('division');
            expect(kind({ ...right, m: right.m + 1 })).toBe('ppcm');
          }
          if (q.kind === 'fenetre') expect(kind({ ...right, n: right.n + 1 })).toBe('bracket');
          if (q.kind === 'budget') expect(kind({ ...right, n: right.n + 1 })).toBe('bracket');
          if (q.kind === 'jours') {
            // both parts are the claim `ppcm`: the pattern, then the day less 1
            expect(trainerEvidence(q, { ...right, d: right.d + 1 }, FIRST).claim).toMatchObject({
              kind: 'ppcm',
              m: q.m + 1,
            });
            expect(trainerEvidence(q, { ...right, m: right.m + 1 }, FIRST).claim).toMatchObject({
              kind: 'ppcm',
              m: q.m + 1,
            });
          }
          if (q.kind === 'outil') {
            expect(kind({ ...right, g: right.g + 1 })).toBe('pgcd');
            expect(kind({ ...right, m: right.m + 1 })).toBe('ppcm');
          }
          seen.add(q.kind);
        }
    expect([...seen].sort()).toEqual([...KINDS].sort());
  });

  it('a claim of three numbers carries them all: `more` holds the third cycle or the third number', () => {
    const FIRST = { firstTry: true, helped: false };
    let three = 0;
    for (let seed = 1; seed <= 40; seed += 1)
      for (const q of trainer.makeSession(rng(seed * 17), 'equipes')) {
        if (q.kind !== 'jours' || !q.more) continue;
        expect(trainerEvidence(q, solution(q), FIRST).claim).toMatchObject({ kind: 'ppcm', more: q.more });
        three += 1;
      }
    expect(three).toBeGreaterThan(5);
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
