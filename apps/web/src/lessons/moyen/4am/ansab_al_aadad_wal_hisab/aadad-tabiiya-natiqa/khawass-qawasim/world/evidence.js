/**
 * The EVIDENCE of lesson `khawass-qawasim` — PURE. Which answers count (written format, first try, no help) and what
 * is sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`, the
 * same rule as the server's). Here: the الكفاءة each key proves, and the CLAIM each kind of trainer answer makes.
 *
 * THE RULE OF A CLAIM (2026-11-19 — a claim on the sum alone had credited an answer whose difference was wrong):
 *   the claim is TRUE exactly when the lesson's `check` (world/trainer.js) accepts the WHOLE answer, and it states the
 *   part of the answer that carries the الكفاءة of this lesson. An answer in several parts sends the claim of its FIRST
 *   wrong part — or, when every part before it is right, of its last part: the one that is the الكفاءة.
 * `evidence.test.js` enumerates right, wrong and half-wrong answers of every kind: « `check` false ⇒ claim false ».
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';

/** The الكفاءة each key proves (the codes of the lesson's `learningPoints`). */
const POINTS = { 'jam-wal-farq': 'P1', madaaf: 'P2', 'baqi-qisma': 'P3', burhan: 'P4' };
/** The evidence of this lesson. It has no real-world case yet: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '4am', points: POINTS }), caseEvidence: () => null };

const natural = (x) => Number.isInteger(x) && x >= 0;
/** « a = d × e »: a number written as a product whose factor is the divisor. */
const product = (a, d, e) => ({ kind: 'pair', a, b: d, e });

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  // an empty box is 0 and a missing one NaN: neither makes a claim true (a product needs a factor of at least 1)
  const n = (k) => Number(value?.[k]);
  switch (q.kind) {
    case 'sumDiff': {
      // two lines, « a + b = d × s » and « a − b = d × f »: the difference is claimed once the sum is right
      const sumRight = natural(n('s')) && q.d * n('s') === q.a + q.b;
      return {
        key: q.key,
        claim: sumRight ? product(q.a - q.b, q.d, n('f')) : product(q.a + q.b, q.d, n('s')),
      };
    }
    case 'multiple':
      // one line, « a × n = d × k »: the whole answer
      return { key: q.key, claim: product(q.a * q.n, q.d, n('k')) };
    case 'rest': {
      // the Euclidean division, then « الباقي = d × k »: the الكفاءة is the remainder written as a product of the common
      // divisor — claimed once the division is right. A wrong division is claimed as it was written (false).
      const [quo, r] = [n('q'), n('r')];
      const divided = natural(quo) && natural(r) && q.b * quo + r === q.a && r < q.b;
      return {
        key: q.key,
        claim: divided
          ? product(q.a % q.b, q.d, n('k'))
          : { kind: 'division', a: q.a, b: q.b, q: quo, r, fits: r === 0 },
      };
    }
    // a proof written with letters, and « صحيح أم خطأ؟ علّل », are NOT evidence: no verdict re-computed from numbers
    default:
      return null;
  }
}
