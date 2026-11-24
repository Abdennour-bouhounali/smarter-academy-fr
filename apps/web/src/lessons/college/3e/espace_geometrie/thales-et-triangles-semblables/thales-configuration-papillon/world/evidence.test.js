// THE EVIDENCE of thales-configuration-papillon: the shared checks (authoring kit) — a claim is true exactly when `check`
// accepts the WHOLE answer — then the lesson's own: P2 carried by the answers that choose the length from the vertex.
import { describe, it, expect } from 'vitest';
import { describeEvidence } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { LESSON_CONFIG } from '../lesson.config';
import { KNOWLEDGE } from './knowledge';
import { KEYS } from './journey';
import { evidence, trainerEvidence } from './evidence';
import { check, solution, trainer } from './trainer';
import { K, over, times, write } from './math';

const ID = 'thales-configuration-papillon';
const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const FIRST = { firstTry: true, helped: false };

/** The kinds whose first exam try is evidence, and their boxes. */
const BOXES = {
  rapport: ['n', 'd'],
  rapportTravers: ['n', 'd'],
  longueur: ['x'],
  travers: ['w', 'x'],
  emboite: ['w', 'x'],
};
const KINDS = Object.keys(BOXES);
/** The mistakes of THIS lesson: the inverted ratio, the length across the vertex, the piece for the side. */
const MISTAKES = (q, right) => {
  const f = q.f;
  switch (q.kind) {
    case 'rapport':
    case 'rapportTravers': {
      const across = over(f.VM, f.VMB);
      return [
        { n: right.d, d: right.n },
        { n: Number(across.n), d: Number(across.d) },
        { n: right.n * 3, d: right.d * 3 },
      ];
    }
    case 'longueur':
      return [{ x: write(over(times(f[q.sol.P], f[q.sol.D]), f[q.sol.Q])) }, { x: f.VMB }, { x: f.VNC }];
    case 'travers':
      return [
        { ...right, w: f.VMB },
        { ...right, x: write(over(times(f.VMB, f[q.sol.P]), f.VM)) },
      ];
    case 'emboite':
      return [
        { ...right, w: f[q.piece] },
        { ...right, x: write(over(times(f[q.piece], f[q.sol.P]), f[q.part])) },
      ];
    default:
      return [];
  }
};

// no `pointOf`: each key proves its OWN point (K1 → P1, K2 → P3); P2 is carried by answers (`point`), checked below
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

  it('K1 proves P1 and K2 proves P3 by their keys; the three points are each proved by some answer', () => {
    expect(evidence.learningPointOf(ID, K.papillon)).toBe(`3e_${ID}_P1`);
    expect(evidence.learningPointOf(ID, K.calcul)).toBe(`3e_${ID}_P3`);
    const points = new Set();
    for (const q of sessions()) {
      const ev = trainerEvidence(q, solution(q), FIRST);
      if (!ev) continue;
      points.add(evidence.payloadOf(ID, { where: 'trainer' }, ev, 'a1').learningPoint);
    }
    expect([...points].sort()).toEqual([1, 2, 3].map((n) => `3e_${ID}_P${n}`));
  });

  it('P2 is sent for the ratio across the vertex and for the first part of a two-step length, while it is not right', () => {
    let p2 = 0;
    for (const q of sessions()) {
      const right = solution(q);
      if (q.kind === 'rapportTravers') {
        const ev = trainerEvidence(q, right, FIRST);
        expect(ev.point).toBe('P2');
        expect(evidence.payloadOf(ID, {}, ev, 'x')).toMatchObject({ learningPoint: `3e_${ID}_P2`, claim: ev.claim });
        p2 += 1;
      }
      if (q.kind === 'travers' || q.kind === 'emboite') {
        const wrongFirst = trainerEvidence(q, { ...right, w: q.f.VMB ?? q.f[q.piece] }, FIRST);
        expect(wrongFirst.point, q.kind).toBe('P2');
        expect(verifyClaim(wrongFirst.claim)).toBe(false);
        const whole = trainerEvidence(q, right, FIRST);
        expect(whole.point).toBeUndefined();
        expect(verifyClaim(whole.claim)).toBe(true);
        expect(evidence.payloadOf(ID, {}, whole, 'x').learningPoint).toBe(`3e_${ID}_P3`);
        p2 += 1;
      }
    }
    expect(p2).toBeGreaterThan(50);
  });

  it('a key without a point sends nothing; a tap, a true / false and the three ratios are never evidence', () => {
    expect(evidence.payloadOf(ID, {}, { key: 'nothing', claim: {} }, 'x')).toBe(null);
    for (const q of sessions())
      if (['tap', 'tf', 'rapports'].includes(q.kind)) expect(trainerEvidence(q, solution(q), FIRST)).toBe(null);
    expect(evidence.caseEvidence()).toBe(null);
  });
});
