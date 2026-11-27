// THE EVIDENCE of triangles-semblables: the shared checks (authoring kit) — a claim is true exactly when `check` accepts the
// WHOLE answer — then the lesson's own: P3 and P4 carried by the answers that pair the sides and compute the length.
// `../lesson.config` is the config the main session writes at assembly: until then these tests fail with SCAFFOLD.
import { describe, it, expect } from 'vitest';
import { describeEvidence } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { LESSON_CONFIG } from '../lesson.config';
import { KNOWLEDGE } from './knowledge';
import { KEYS } from './journey';
import { evidence, trainerEvidence } from './evidence';
import { check, solution, trainer } from './trainer';
import { K, minus, over, plus, read, times, write } from './math';

const ID = 'triangles-semblables';
const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const FIRST = { firstTry: true, helped: false };

/** The kinds whose first exam try is evidence, and their boxes. */
const BOXES = {
  coef: ['n', 'd'],
  homologue: ['n', 'd'],
  longueur: ['x'],
  troisieme: ['x'],
};
const KINDS = Object.keys(BOXES);
/** A quotient as the two boxes of a fraction. */
const asAnswer = (x) => ({ n: Number(read(x).n), d: Number(read(x).d) });
/** The mistakes of THIS lesson: the inverted quotient, the pairing by the names, the added difference, the sum of the angles. */
const MISTAKES = (q, right) => {
  switch (q.kind) {
    case 'coef':
      return [{ n: right.d, d: right.n }, asAnswer(q.byNames), { n: right.n * 3, d: right.d * 3 }];
    case 'homologue':
      return [{ n: right.d, d: right.n }, asAnswer(q.wrong)];
    case 'longueur':
      return [{ x: write(plus(q.P, minus(q.Q, q.D))) }, { x: write(over(times(q.P, q.D), q.Q)) }];
    case 'troisieme':
      return [{ x: q.sum }, { x: String(180 - Number(q.angles[2])) }];
    default:
      return [];
  }
};

// no `pointOf`: each key proves its OWN point (K1 → P1, K2 → P2); P3 and P4 are carried by answers (`point`), checked below
describeEvidence({
  id: ID,
  keys: KEYS,
  evidence,
  trainerEvidence,
  trainer,
  check,
  solution,
  cards: CARDS,
  boxes: BOXES,
  kinds: KINDS,
  mistakes: MISTAKES,
  config: LESSON_CONFIG,
});

describe(`${ID} — its own evidence`, () => {
  const sessions = () =>
    CARDS.flatMap((card) => Array.from({ length: 20 }, (_, s) => trainer.makeSession(rng(s * 97 + 5), card)).flat());

  it('K1 proves P1 and K2 proves P2 by their keys; the four points are each proved by some answer', () => {
    expect(evidence.learningPointOf(ID, K.cotes)).toBe(`3e_${ID}_P1`);
    expect(evidence.learningPointOf(ID, K.angles)).toBe(`3e_${ID}_P2`);
    const points = new Set();
    for (const q of sessions()) {
      const ev = trainerEvidence(q, solution(q), FIRST);
      if (!ev) continue;
      points.add(evidence.payloadOf(ID, { where: 'trainer' }, ev, 'a1').learningPoint);
    }
    expect([...points].sort()).toEqual([1, 2, 3, 4].map((n) => `3e_${ID}_P${n}`));
  });

  it('P3 is sent for the pairing by the equal angles, P4 for the length: under their own point, a true claim when right', () => {
    const seen = { homologue: 0, longueur: 0 };
    for (const q of sessions()) {
      if (q.kind !== 'homologue' && q.kind !== 'longueur') continue;
      const ev = trainerEvidence(q, solution(q), FIRST);
      expect(ev.point).toBe(q.kind === 'homologue' ? 'P3' : 'P4');
      expect(verifyClaim(ev.claim)).toBe(true);
      expect(evidence.payloadOf(ID, {}, ev, 'x')).toMatchObject({
        learningPoint: `3e_${ID}_${ev.point}`,
        claim: ev.claim,
      });
      seen[q.kind] += 1;
    }
    expect(seen.homologue).toBeGreaterThan(20);
    expect(seen.longueur).toBeGreaterThan(20);
  });

  it('the pairing by the equal angles refused: the claim is false for the side that does not go with it', () => {
    for (const q of sessions()) {
      if (q.kind !== 'homologue' || q.wrong === q.k) continue;
      const ev = trainerEvidence(q, asAnswer(q.wrong), FIRST);
      expect(verifyClaim(ev.claim), q.prompt).toBe(false);
    }
  });

  it('a key without a point sends nothing; a tap, a true / false and the choice of a side are never evidence', () => {
    expect(evidence.payloadOf(ID, {}, { key: 'nothing', claim: {} }, 'x')).toBe(null);
    for (const q of sessions())
      if (['tap', 'tf', 'apparier'].includes(q.kind)) expect(trainerEvidence(q, solution(q), FIRST)).toBe(null);
    expect(evidence.caseEvidence()).toBe(null);
  });
});
