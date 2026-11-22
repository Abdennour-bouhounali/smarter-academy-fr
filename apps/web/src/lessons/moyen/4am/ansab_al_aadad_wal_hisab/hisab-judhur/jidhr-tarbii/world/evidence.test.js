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
    bila: { whole: ['r'], dec: ['i', 'd'], frac: ['n', 'd'] }[q.shape],
    of: ['a'],
    dil: ['s'],
    hasr: ['lo', 'hi'],
    muqarraba: ['i1', 'd1', 'i2', 'd2'],
    ihsib: ['A', 'B'],
    ihsibFrac: ['i', 'd', 'n', 'dn'],
  })[q.kind] ?? null;

/**
 * THE MISTAKES of this lesson's students, each a whole answer: the half or the quarter for the root, the root of the
 * number for the number, the rounding for the value by default, the two numbers of a bracket swapped or not consecutive,
 * the square for (√a)², the sign kept, a fraction squared again.
 */
function mistakes(q, right) {
  switch (q.kind) {
    case 'bila':
      return q.shape === 'whole'
        ? [{ r: Number(q.a) / 2 }, { r: Number(q.a) / 4 }, { r: Number(q.a) }]
        : q.shape === 'frac'
          ? [
              { n: right.n * right.n, d: right.d * right.d },
              { n: right.n * 2, d: right.d * 2 },
            ]
          : [
              { i: 0, d: `0${right.d}` },
              { i: right.i * 10, d: right.d },
            ];
    case 'of':
      return [{ a: 2 * q.k }, { a: q.k }, { a: q.k * q.k + 1 }];
    case 'dil':
      return [{ s: q.a / 4 }, { s: q.a / 2 }, { s: 4 * q.s }];
    case 'hasr':
      return [
        { lo: right.hi, hi: right.lo },
        { lo: right.lo, hi: right.lo + 2 },
        { lo: right.lo - 1, hi: right.lo },
        { lo: right.lo, hi: right.lo },
      ];
    case 'muqarraba':
      return [
        { ...right, i1: right.i2, d1: right.d2 }, // by default rounded up
        { i1: right.i2, d1: right.d2, i2: right.i1, d2: right.d1 }, // the two swapped
        { ...right, d2: right.d1 }, // the same value twice
        { ...right, d1: `${right.d1}0` }, // the same value written 9,210: right
      ];
    case 'ihsib':
      return [
        { A: q.a * q.a, B: q.b },
        { A: q.a, B: q.b * q.b },
        { A: 2 * q.a, B: q.b },
        { A: q.a, B: 2 * q.b },
      ];
    case 'ihsibFrac':
      return [
        { ...right, n: right.n * right.n, dn: right.dn * right.dn },
        { ...right, n: right.n * 3, dn: right.dn * 3 }, // equal: right
        { ...right, d: `${right.d}0` }, // 1,30: right
        { ...right, i: 0, d: `0${right.d}` },
      ];
    default:
      return [];
  }
}

describeEvidence({
  id: 'jidhr-tarbii',
  keys: KEYS,
  evidence,
  trainerEvidence,
  trainer,
  check,
  solution,
  config: LESSON_CONFIG,
  cards: CARDS,
  boxes: boxesOf,
  kinds: ['bila', 'of', 'dil', 'hasr', 'muqarraba', 'ihsib', 'ihsibFrac'],
  mistakes,
  seeds: 40,
});

describe('the evidence of « الجذر التربيعي لعدد موجب » — the lesson’s own', () => {
  it('each key proves its own الكفاءة: 🔑 P1, ✍️ P2, 🔁 P3', () => {
    expect(KEYS.map((k) => evidence.learningPointOf('jidhr-tarbii', k))).toEqual([
      '4am_jidhr-tarbii_P1',
      '4am_jidhr-tarbii_P2',
      '4am_jidhr-tarbii_P3',
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
    expect([...seen].sort()).toEqual(['bila', 'dil', 'hasr', 'ihsib', 'ihsibFrac', 'muqarraba', 'of']);
  });

  it('the claims, written out: a root, a bracket, the two values to 0,01, the two properties', () => {
    const K = { saha: KEYS[0], qima: KEYS[1], iyab: KEYS[2] };
    const ex = (q) => ({ format: 'exam', ...q });
    // √324 = 18: 18 × 18 = 324
    expect(
      trainerEvidence(ex({ kind: 'bila', key: K.saha, shape: 'whole', a: '324', r: '18' }), { r: 18 }, FIRST),
    ).toEqual({
      key: K.saha,
      claim: { kind: 'pair', a: 324, b: 18, e: 18 },
    });
    // √0,0036 = 0,06, on numbers × 10^4 and × 10^2: 6 × 6 = 36
    expect(
      trainerEvidence(ex({ kind: 'bila', key: K.saha, shape: 'dec', a: '0,0036', r: '0,06' }), { i: 0, d: '06' }, FIRST)
        .claim,
    ).toEqual({ kind: 'pair', a: 36, b: 6, e: 6 });
    // …and 0,6 typed for it is 60 × 60 ≠ 36
    expect(
      verifyClaim(
        trainerEvidence(
          ex({ kind: 'bila', key: K.saha, shape: 'dec', a: '0,0036', r: '0,06' }),
          { i: 0, d: '6' },
          FIRST,
        ).claim,
      ),
    ).toBe(false);
    // 11 < √140 < 12: the number before is claimed first, then the one after (as « 12 − 1 is the one before »)
    const hasr = ex({ kind: 'hasr', key: K.qima, a: 140, n: 11 });
    expect(trainerEvidence(hasr, { lo: 11, hi: 12 }, FIRST).claim).toEqual({ kind: 'stop', a: 140, b: 11 });
    expect(trainerEvidence(hasr, { lo: 12, hi: 13 }, FIRST).claim).toEqual({ kind: 'stop', a: 140, b: 12 });
    expect(verifyClaim(trainerEvidence(hasr, { lo: 11, hi: 13 }, FIRST).claim)).toBe(false);
    // √85 ≈ 9,219544457: 9,21 and 9,22 — in hundredths, 921² ≤ 850000 < 922²
    const muq = ex({ kind: 'muqarraba', key: K.qima, a: 85, lo: 921 });
    expect(trainerEvidence(muq, { i1: 9, d1: '21', i2: 9, d2: '22' }, FIRST).claim).toEqual({
      kind: 'stop',
      a: 850000,
      b: 921,
    });
    expect(verifyClaim(trainerEvidence(muq, { i1: 9, d1: '22', i2: 9, d2: '23' }, FIRST).claim)).toBe(false);
    // (√53)² = 53, then √((−18)²) = 18: 18 × 18 = 324; a wrong A is claimed as « A × 1 = 53 », false
    const ih = ex({ kind: 'ihsib', key: K.iyab, a: 53, b: 18, neg: true });
    expect(trainerEvidence(ih, { A: 53, B: 18 }, FIRST).claim).toEqual({ kind: 'pair', a: 324, b: 18, e: 18 });
    expect(trainerEvidence(ih, { A: 2809, B: 18 }, FIRST).claim).toEqual({ kind: 'pair', a: 53, b: 2809, e: 1 });
    expect(verifyClaim(trainerEvidence(ih, { A: 2809, B: 18 }, FIRST).claim)).toBe(false);
    // (√1,3)² = 1,3 then √((3/8)²) = 3/8 — 6/16 is the same fraction
    const fr = ex({ kind: 'ihsibFrac', key: K.iyab, x: '1,3', f: '3/8' });
    expect(trainerEvidence(fr, { i: 1, d: '3', n: 6, dn: 16 }, FIRST).claim).toEqual({
      kind: 'fraction',
      a: 3,
      b: 8,
      p: 6,
      q: 16,
      reduced: false,
    });
    expect(verifyClaim(trainerEvidence(fr, { i: 1, d: '3', n: 9, dn: 64 }, FIRST).claim)).toBe(false);
    // never: a second try, a helped answer, the game format, a true / false
    expect(trainerEvidence(hasr, { lo: 11, hi: 12 }, { firstTry: false, helped: false })).toBe(null);
    expect(trainerEvidence(hasr, { lo: 11, hi: 12 }, { firstTry: true, helped: true })).toBe(null);
    expect(trainerEvidence({ ...hasr, format: 'game' }, { lo: 11, hi: 12 }, FIRST)).toBe(null);
    expect(trainerEvidence(ex({ kind: 'tf', key: K.saha, truth: true }), { truth: true }, FIRST)).toBe(null);
  });

  it('the payload names the الكفاءة by its catalogue id', () => {
    const ev = trainerEvidence({ format: 'exam', kind: 'dil', key: KEYS[0], a: 1296, s: 36 }, { s: 36 }, FIRST);
    expect(evidence.payloadOf('jidhr-tarbii', 'trainer', ev, 'att-1')).toEqual({
      attemptId: 'att-1',
      learningPoint: '4am_jidhr-tarbii_P1',
      context: 'trainer',
      claim: { kind: 'pair', a: 1296, b: 36, e: 36 },
    });
  });
});
