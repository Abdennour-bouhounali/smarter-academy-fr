import { describe, it, expect } from 'vitest';
import { describeEvidence } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { evidence, trainerEvidence } from './evidence';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { check, solution, trainer } from './trainer';
import { LESSON_CONFIG } from '../lesson.config';

const FIRST = { firstTry: true, helped: false };
const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
/** The boxes of each kind of exam question that claims — a decimal is two boxes, a fraction two. */
const boxesOf = (q) =>
  ({
    jidhr: q.shape === 'frac' ? ['n', 'd'] : ['i', 'd'],
    dil: ['i', 'd'],
    murabbaQima: ['i', 'd'],
    tadwir: ['i1', 'd1', 'i2', 'd2'],
    qiyam: ['i1', 'd1', 'i2', 'd2', 'i3', 'd3'],
  })[q.kind] ?? null;

/**
 * THE MISTAKES of this lesson's students, each a whole answer: the comma moved, the half, the fraction squared again or
 * one term only rooted, the display squared into the radicand, the rounded value taken by default (or by excess), the
 * value by excess given for the one by default, the two swapped.
 */
function mistakes(q, right) {
  switch (q.kind) {
    case 'jidhr':
    case 'dil':
      return q.shape === 'frac'
        ? [
            { n: right.n * right.n, d: right.d * right.d },
            { n: right.n * 2, d: right.d * 2 }, // equal: right
            { n: right.n, d: right.d * right.d },
          ]
        : [
            { i: 0, d: `0${right.d}` },
            { i: right.i * 10 + Number(right.d[0]), d: right.d.slice(1) || '0' },
            { ...right, d: `${right.d}0` }, // equal: right
          ];
    case 'murabbaQima':
      return [
        { i: q.a, d: '0' },
        { i: right.i, d: `${right.d}1` },
        { i: right.i + 1, d: right.d },
      ];
    case 'tadwir':
    case 'qiyam': {
      const r = { ...right };
      const swap = q.kind === 'tadwir' ? { i2: r.i1, d2: r.d1 } : { i3: r.i1, d3: r.d1 };
      const up = q.kind === 'tadwir' ? null : { i3: r.i2, d3: r.d2 };
      return [
        { ...r, ...swap }, // the rounded value taken by default
        ...(up ? [{ ...r, ...up }] : []), // the rounded value taken by excess
        { ...r, i1: r.i1 + 1 }, // by default above the root
        { ...r, d1: `${r.d1}5` }, // a middle mark given by default
      ];
    }
    default:
      return [];
  }
}

describeEvidence({
  id: 'natiqa-ghayr-natiqa',
  keys: KEYS,
  evidence,
  trainerEvidence,
  trainer,
  check,
  solution,
  config: LESSON_CONFIG,
  cards: CARDS,
  boxes: boxesOf,
  kinds: ['jidhr', 'dil', 'murabbaQima', 'tadwir', 'qiyam'],
  mistakes,
  seeds: 40,
});

describe('the evidence of « الأعداد الناطقة والأعداد غير الناطقة » — the lesson’s own', () => {
  it('each key proves ONE of the three الكفاءات of the catalogue: 🧩 P2, ♾️ P1, 🎯 P3', () => {
    expect(KEYS.map((k) => evidence.learningPointOf('natiqa-ghayr-natiqa', k))).toEqual([
      '4am_natiqa-ghayr-natiqa_P2',
      '4am_natiqa-ghayr-natiqa_P1',
      '4am_natiqa-ghayr-natiqa_P3',
    ]);
    expect(evidence.caseEvidence()).toBe(null);
  });

  it('a right answer states itself whole, on natural numbers of the server’s range (≤ 10^6)', () => {
    const seen = new Set();
    for (const card of CARDS)
      for (let seed = 1; seed <= 30; seed += 1)
        for (const q of trainer.makeSession(rng(seed * 31 + 7), card)) {
          const ev = trainerEvidence(q, solution(q), FIRST);
          if (q.format !== 'exam' || q.kind === 'tf') {
            expect(ev, q.kind).toBe(null);
            continue;
          }
          seen.add(q.kind);
          expect(ev.key).toBe(q.key);
          expect(verifyClaim(ev.claim), `${q.prompt} ${JSON.stringify(ev.claim)}`).toBe(true);
          for (const k of ['a', 'b', 'e', 'p', 'q'].filter((x) => ev.claim[x] != null))
            expect(ev.claim[k], `${q.kind} ${k}`).toBeLessThanOrEqual(1000000);
        }
    expect([...seen].sort()).toEqual(['dil', 'jidhr', 'murabbaQima', 'qiyam', 'tadwir']);
  });

  it('the claims, written out: a decimal root, a fraction root, a display squared, a value by default, a rounded value', () => {
    const [K1, K2, K3] = KEYS;
    const ex = (q) => ({ format: 'exam', ...q });
    // √3,24 = 1,8: 18 × 18 = 324
    expect(
      trainerEvidence(ex({ kind: 'jidhr', key: K1, shape: 'dec', a: '3,24', r: '1,8' }), { i: 1, d: '8' }, FIRST),
    ).toEqual({
      key: K1,
      claim: { kind: 'pair', a: 324, b: 18, e: 18 },
    });
    // √(32/162) = 4/9: (4/9)² = 16/81
    const fr = ex({ kind: 'jidhr', key: K1, shape: 'frac', a: '16/81', r: '4/9', shown: [32, 162] });
    expect(trainerEvidence(fr, { n: 4, d: 9 }, FIRST).claim).toEqual({
      kind: 'fraction',
      a: 16,
      b: 81,
      p: 16,
      q: 81,
      reduced: false,
    });
    expect(verifyClaim(trainerEvidence(fr, { n: 16, d: 81 }, FIRST).claim)).toBe(false);
    // the display of √21 cut to 0,01 is 4,58: 4,58² = 20,9764 — 458 × 458 = 209764
    const mq = ex({ kind: 'murabbaQima', key: K2, a: 21, x: '4,58' });
    expect(trainerEvidence(mq, { i: 20, d: '9764' }, FIRST).claim).toEqual({ kind: 'pair', a: 209764, b: 458, e: 458 });
    expect(verifyClaim(trainerEvidence(mq, { i: 21, d: '0' }, FIRST).claim)).toBe(false);
    // √23 to 0,1: 4,7 by default (47² ≤ 2300 < 48²), rounded 4,8 (⌊2 √23 × 10⌋ = 95 = 47 + 48)
    const td = ex({ kind: 'tadwir', key: K3, a: 23, n: 4 });
    expect(trainerEvidence(td, { i1: 4, d1: '7', i2: 4, d2: '8' }, FIRST).claim).toEqual({
      kind: 'stop',
      a: 9200,
      b: 95,
    });
    expect(verifyClaim(trainerEvidence(td, { i1: 4, d1: '7', i2: 4, d2: '8' }, FIRST).claim)).toBe(true);
    expect(verifyClaim(trainerEvidence(td, { i1: 4, d1: '7', i2: 4, d2: '7' }, FIRST).claim)).toBe(false);
    expect(trainerEvidence(td, { i1: 4, d1: '8', i2: 4, d2: '8' }, FIRST).claim).toEqual({
      kind: 'stop',
      a: 2300,
      b: 48,
    });
    // never: a second try, a helped answer, the game format, a true / false
    expect(trainerEvidence(td, { i1: 4, d1: '7', i2: 4, d2: '8' }, { firstTry: false, helped: false })).toBe(null);
    expect(trainerEvidence(td, { i1: 4, d1: '7', i2: 4, d2: '8' }, { firstTry: true, helped: true })).toBe(null);
    expect(trainerEvidence({ ...td, format: 'game' }, { i1: 4, d1: '7', i2: 4, d2: '8' }, FIRST)).toBe(null);
    expect(trainerEvidence(ex({ kind: 'tf', key: K2, truth: false }), { truth: false }, FIRST)).toBe(null);
  });

  it('the payload names the الكفاءة by its catalogue id', () => {
    const ev = trainerEvidence(
      { format: 'exam', kind: 'tadwir', key: KEYS[2], a: 23, n: 4 },
      { i1: 4, d1: '7', i2: 4, d2: '8' },
      FIRST,
    );
    expect(evidence.payloadOf('natiqa-ghayr-natiqa', 'trainer', ev, 'att-1')).toEqual({
      attemptId: 'att-1',
      learningPoint: '4am_natiqa-ghayr-natiqa_P3',
      context: 'trainer',
      claim: { kind: 'stop', a: 9200, b: 95 },
    });
  });
});
