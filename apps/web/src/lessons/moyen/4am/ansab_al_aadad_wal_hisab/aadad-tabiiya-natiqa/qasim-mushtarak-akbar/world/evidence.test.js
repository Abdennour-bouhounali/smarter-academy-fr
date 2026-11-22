import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { guardEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { evidence, trainerEvidence } from './evidence';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { check, solution, trainer } from './trainer';
import { divisorsOf } from './math';
import { LESSON_CONFIG } from '../lesson.config';

const FIRST = { firstTry: true, helped: false };
/** The kinds of trainer question whose first try is evidence, and the boxes of each. */
const BOXES = {
  commonList: ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'],
  nestList: ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'],
  pgcd: ['g'],
  bouquets: ['n', 'x', 'y'],
};
const list = (xs) => Object.fromEntries(xs.map((x, i) => [`c${i}`, x]));

/**
 * Answers a student can really write for a question: the right one, every box off by a little, emptied, doubled, a
 * decimal, a negative, two boxes swapped — whole-wrong and HALF-wrong — and the mistakes of THIS lesson: a common divisor
 * that is not the greatest, the product a × b, a divisor of one number only, a list one short, the roses and the lilies
 * of a bouquet swapped.
 */
function answersOf(q) {
  const right = solution(q);
  const out = [right];
  const boxes = BOXES[q.kind];
  for (const k of boxes) {
    for (const v of [right[k] + 1, right[k] - 1, right[k] * 2, 0, '', undefined, '2.5', -right[k], ' '])
      out.push({ ...right, [k]: v });
  }
  for (const k of boxes) for (const j of boxes) if (k !== j) out.push({ ...right, [k]: right[j], [j]: right[k] });
  const smaller = divisorsOf(q.g).filter((d) => d > 1 && d < q.g);
  const lone = [2, 3, 5, 7, 11, 13].find((d) => (q.a % d === 0) !== (q.b % d === 0));
  if (q.kind === 'commonList' || q.kind === 'nestList') {
    const all = divisorsOf(q.g);
    out.push(list(all.slice(0, 5))); // one short
    out.push(list([...all.slice(0, 5), all[0]])); // one twice
    out.push(list([...all.slice(0, 5), q.g * 2])); // the double of the greatest
    if (lone) out.push(list([...all.slice(0, 5), lone])); // a divisor of one number only
    out.push(list([...all.slice(1), q.a])); // the number itself
    out.push(list([...all].reverse())); // the right list in another order
  }
  if (q.kind === 'pgcd') {
    for (const d of smaller) out.push({ g: d }); // a common divisor, not the greatest
    out.push({ g: q.a * q.b }, { g: q.a }, { g: 1 });
    if (lone) out.push({ g: lone });
  }
  if (q.kind === 'bouquets') {
    for (const d of smaller) out.push({ n: d, x: q.a / d, y: q.b / d }); // possible, not the most
    out.push({ n: q.g, x: q.q, y: q.p }); // roses and lilies swapped
    out.push({ n: q.p, x: q.g, y: q.q }); // the roses of a bouquet as the number of bouquets
    out.push({ n: q.g, x: q.a, y: q.b }); // the flowers themselves
    if (lone) out.push({ n: lone, x: Math.floor(q.a / lone), y: Math.floor(q.b / lone) });
  }
  out.push({}, null);
  return out;
}

describe('the evidence of « القاسم المشترك الأكبر »', () => {
  it('each key proves one الكفاءة of the lesson, by its catalogue id, and a module of the lesson teaches it', () => {
    const points = KEYS.map((key) => evidence.learningPointOf('qasim-mushtarak-akbar', key));
    expect(points).toEqual(['P1', 'P2', 'P3', 'P4'].map((p) => `4am_qasim-mushtarak-akbar_${p}`));
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    for (const p of points) expect(taught.has(p), p).toBe(true);
  });

  it('only an exam answer given at the first try without help is sent, as a claim', () => {
    // PGCD(204 ; 228) = 12: the common divisors are 1, 2, 3, 4, 6, 12
    const q = { format: 'exam', kind: 'nestList', key: KEYS[3], a: 204, b: 228, g: 12 };
    const v = list([1, 2, 3, 4, 6, 12]);
    const ev = trainerEvidence(q, v, FIRST);
    expect(ev).toEqual({ key: KEYS[3], claim: { kind: 'divisors', a: 12, list: [1, 2, 3, 4, 6, 12], b: 6 } });
    expect(evidence.payloadOf('qasim-mushtarak-akbar', 'trainer', ev, 'att-1')).toEqual({
      attemptId: 'att-1',
      learningPoint: '4am_qasim-mushtarak-akbar_P4',
      context: 'trainer',
      claim: ev.claim,
    });
    expect(evidence.verify(ev.claim)).toBe(true);
    expect(trainerEvidence(q, v, { firstTry: true, helped: true })).toBe(null);
    expect(trainerEvidence(q, v, { firstTry: false, helped: false })).toBe(null);
    expect(trainerEvidence({ ...q, format: 'game' }, v, FIRST)).toBe(null);
    expect(trainerEvidence({ format: 'exam', kind: 'tf', key: KEYS[0] }, { truth: true, reason: 0 }, FIRST)).toBe(null);
    // « احسب PGCD(198 ; 234) »: the server re-computes the PGCD of the question's two numbers
    const p = { format: 'exam', kind: 'pgcd', key: KEYS[1], a: 198, b: 234, g: 18 };
    expect(trainerEvidence(p, { g: 18 }, FIRST)).toEqual({
      key: KEYS[1],
      claim: { kind: 'pgcd', a: 198, b: 234, g: 18 },
    });
    expect(verifyClaim(trainerEvidence(p, { g: 6 }, FIRST).claim)).toBe(false);
    // 40 roses and 56 lilies: 8 bouquets of 5 and 7 — the claim is the number of bouquets, PGCD(40 ; 56) = 8
    const b = { format: 'exam', kind: 'bouquets', key: KEYS[2], a: 40, b: 56, g: 8, p: 5, q: 7 };
    expect(trainerEvidence(b, { n: 8, x: 5, y: 7 }, FIRST).claim).toEqual({ kind: 'pgcd', a: 40, b: 56, g: 8 });
    expect(
      evidence.payloadOf('qasim-mushtarak-akbar', 'trainer', trainerEvidence(b, { n: 8, x: 5, y: 7 }, FIRST), 'a')
        .learningPoint,
    ).toBe('4am_qasim-mushtarak-akbar_P3');
    expect(evidence.caseEvidence()).toBe(null);
  });

  it('a HALF-right answer earns nothing: the answers the draft had credited or could have', () => {
    // 8 bouquets is right, but the roses and the lilies of a bouquet are swapped: the claim is the roses, 40 = 8 × 7 (false)
    const b = { format: 'exam', kind: 'bouquets', key: KEYS[2], a: 40, b: 56, g: 8, p: 5, q: 7 };
    expect(check(b, { n: 8, x: 7, y: 5 }).ok).toBe(false);
    expect(trainerEvidence(b, { n: 8, x: 7, y: 5 }, FIRST).claim).toEqual({ kind: 'pair', a: 40, b: 8, e: 7 });
    expect(verifyClaim(trainerEvidence(b, { n: 8, x: 7, y: 5 }, FIRST).claim)).toBe(false);
    // …the roses right, the lilies wrong: the claim is the lilies, 56 = 8 × 6 (false)
    expect(verifyClaim(trainerEvidence(b, { n: 8, x: 5, y: 6 }, FIRST).claim)).toBe(false);
    // 4 bouquets of 10 and 14 is a sharing that works — but not the most: the claim PGCD(40 ; 56) = 4 is false
    expect(check(b, { n: 4, x: 10, y: 14 }).ok).toBe(false);
    expect(verifyClaim(trainerEvidence(b, { n: 4, x: 10, y: 14 }, FIRST).claim)).toBe(false);
    // the common divisors of 204 and 228, with 17 (a divisor of 204 only): the claim is « 17 divides 204 AND 228 » (false)
    const l = { format: 'exam', kind: 'commonList', key: KEYS[0], a: 204, b: 228, g: 12 };
    const stray = trainerEvidence(l, list([1, 2, 3, 4, 6, 17]), FIRST);
    expect(stray.claim).toEqual({ kind: 'commonDivisor', a: 204, b: 228, d: 17 });
    expect(verifyClaim(stray.claim)).toBe(false);
    // five right divisors, one missing: true divisors, not ALL of them
    expect(verifyClaim(trainerEvidence(l, list([1, 2, 3, 4, 6]), FIRST).claim)).toBe(false);
    // and the kit's safety net drops any TRUE claim of an answer `check` refused
    expect(guardEvidence({ key: KEYS[1], claim: { kind: 'pgcd', a: 40, b: 56, g: 8 } }, false)).toBe(null);
  });

  it('for EVERY question of the trainer: the claim is true exactly when `check` accepts the whole answer', () => {
    const seen = { commonList: 0, nestList: 0, pgcd: 0, bouquets: 0 };
    const verdicts = { right: 0, wrong: 0 };
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id)) {
      for (let seed = 1; seed <= 30; seed += 1) {
        for (const q of trainer.makeSession(rng(seed * 7919 + 13), card)) {
          if (!BOXES[q.kind]) {
            // a tap, a true / false: never evidence, right or wrong
            expect(trainerEvidence(q, solution(q), FIRST), q.kind).toBe(null);
            expect(trainerEvidence(q, {}, FIRST), q.kind).toBe(null);
            continue;
          }
          expect(q.format).toBe('exam');
          seen[q.kind] += 1;
          for (const v of answersOf(q)) {
            const ok = check(q, v).ok;
            const ev = trainerEvidence(q, v, FIRST);
            expect(ev?.key, q.kind).toBe(q.key);
            expect(verifyClaim(ev.claim), `${q.prompt} ← ${JSON.stringify(v)} claims ${JSON.stringify(ev.claim)}`).toBe(
              ok,
            );
            expect(guardEvidence(ev, ok)).toBe(ev); // the safety net never has to step in
            verdicts[ok ? 'right' : 'wrong'] += 1;
          }
          expect(check(q, solution(q)).ok).toBe(true);
        }
      }
    }
    for (const kind of Object.keys(BOXES)) expect(seen[kind], kind).toBeGreaterThan(50);
    // the family of answers is not vacuous: wrong and half-wrong answers by the thousand, right ones too
    expect(verdicts.wrong).toBeGreaterThan(5000);
    expect(verdicts.right).toBeGreaterThan(300);
  });
});
