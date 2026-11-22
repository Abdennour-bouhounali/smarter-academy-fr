/**
 * The EVIDENCE of lesson `jidhr-tarbii` — PURE. Which answers count (written format, first try, no help) and what is
 * sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`, the
 * same rule as the server's). Here: the الكفاءة each key proves, and the CLAIM each kind of trainer answer makes.
 *
 * No claim kind was added (the brief): a root is stated with the kinds that exist, on natural numbers ≤ 10^6 —
 *   `pair` a = b × e with b = e = what he typed: « his number times itself is the radicand » (a whole root; a decimal
 *          root on numbers scaled by 10^k, k its decimals — 1,3 typed for √1,69 is 13 × 13 = 169);
 *   `pair` a = b × 1: « what he typed IS that number » ((√a)² = a: his A against a — no kind states it better);
 *   `stop` b² ≤ a < (b + 1)²: « b is the whole number before √a » (a bracket; on numbers scaled by 10^4, the value of √a
 *          to 0,01 by default); the number AFTER is claimed as `stop` on (what he typed − 1);
 *   `fraction` a/b = p/q, `reduced: false`: his fraction equals the root written as a fraction.
 * THE RULE OF A CLAIM (defects.md A6): the claim is TRUE exactly when the lesson's `check` (world/trainer.js) accepts the
 * WHOLE answer. An answer in two parts sends the claim of its FIRST part when that part is not right, else of its second.
 * `evidence.test.js` enumerates right, wrong and half-wrong answers of every kind: « `check` false ⇔ claim false ».
 * Never evidence: a tap, a true / false (no verdict re-computed from numbers), a second try, an answer after help.
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { K1, K2, K3, decimalsOf, read, scaled, typedDecimal, typedWhole, wholeBelow } from './math';

/** The الكفاءة each key proves (the codes of the lesson's `learningPoints`). */
const POINTS = { [K1]: 'P1', [K2]: 'P2', [K3]: 'P3' };
/** The evidence of this lesson. It has no real-world case: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '4am', points: POINTS }), caseEvidence: () => null };

/** « x × x = a »: x is the root of a. */
const root = (a, x) => ({ kind: 'pair', a, b: x, e: x });
/** « x = a », as a × 1 = x. */
const same = (a, x) => ({ kind: 'pair', a, b: x, e: 1 });
/** « b is the whole number before √a »: b² ≤ a < (b + 1)². */
const before = (a, b) => ({ kind: 'stop', a, b });
/** The whole number after: the one before it is (what he typed − 1). */
const after = (a, typed) => ({ kind: 'stop', a, b: typed == null ? null : typed - 1 });
/** A decimal he typed, × 10^k (an integer when it has at most k decimals). */
const typedScaled = (i, d, k) => scaled(typedDecimal(i, d), k);

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  const v = value ?? {};
  switch (q.kind) {
    case 'bila': {
      // √a written without the sign: a whole number, a decimal (two boxes), or a fraction (a typed bar)
      if (q.shape === 'whole') return { key: q.key, claim: root(Number(q.a), typedWhole(v.r)) };
      if (q.shape === 'dec') {
        const k = decimalsOf(q.r);
        return { key: q.key, claim: root(scaled(q.a, 2 * k), typedScaled(v.i, v.d, k)) };
      }
      const r = read(q.r);
      return {
        key: q.key,
        claim: {
          kind: 'fraction',
          a: Number(r.n),
          b: Number(r.d),
          p: typedWhole(v.n),
          q: typedWhole(v.d),
          reduced: false,
        },
      };
    }
    case 'of':
      // « the number whose root is k »: what he typed is k × k
      return { key: q.key, claim: { kind: 'pair', a: typedWhole(v.a), b: q.k, e: q.k } };
    case 'dil':
      return { key: q.key, claim: root(q.a, typedWhole(v.s)) };
    case 'hasr': {
      const lo = typedWhole(v.lo);
      return { key: q.key, claim: lo === wholeBelow(String(q.a)) ? after(q.a, typedWhole(v.hi)) : before(q.a, lo) };
    }
    case 'muqarraba': {
      // the values to 0,01, in hundredths: √a × 100 lies between them — a × 10^4 ≤ 10^6 (a ≤ 100)
      const A = q.a * 10000;
      const lo = typedScaled(v.i1, v.d1, 2);
      return { key: q.key, claim: lo === q.lo ? after(A, typedScaled(v.i2, v.d2, 2)) : before(A, lo) };
    }
    case 'ihsib': {
      const A = typedWhole(v.A);
      return { key: q.key, claim: A === q.a ? root(q.b * q.b, typedWhole(v.B)) : same(q.a, A) };
    }
    case 'ihsibFrac': {
      const k = decimalsOf(q.x);
      const X = scaled(q.x, k);
      const A = typedScaled(v.i, v.d, k);
      const f = read(q.f);
      return {
        key: q.key,
        claim:
          A === X
            ? {
                kind: 'fraction',
                a: Number(f.n),
                b: Number(f.d),
                p: typedWhole(v.n),
                q: typedWhole(v.dn),
                reduced: false,
              }
            : same(X, A),
      };
    }
    default:
      return null;
  }
}
