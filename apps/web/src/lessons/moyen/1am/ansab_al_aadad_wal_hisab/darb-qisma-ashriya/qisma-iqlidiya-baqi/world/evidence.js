/**
 * The EVIDENCE of lesson `qisma-iqlidiya-baqi` — PURE. Which answers count (written format, first try, no help) and what
 * is sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`, the
 * same rule as the server's). Here: the الكفاءة each key proves, and the CLAIM each kind of trainer answer makes.
 *   P1 « إنجاز القسمة الإقليدية » (divisor of one or two digits)  — the full groups; the estimate of a big quotient;
 *   P2 « كتابة a = b × q + r مع r < b »                           — the remainder smaller than the divisor; the equality;
 *   P3 « توظيفها في مشكلات توزيع وتجميع »                         — what the leftover means in a situation.
 *
 * THE RULE OF A CLAIM (tested for every kind, on right, wrong and half-wrong answers): the claim sent is TRUE exactly
 * when the trainer's `check` accepts the answer. An answer in several parts sends the claim of its FIRST wrong part —
 * a wrong division, then a wrong decision — so a half-right answer never earns the الكفاءة.
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';

/** The الكفاءة each key proves (the codes of the lesson's `learningPoints`). */
const POINTS = {
  'majmuaat-kamila': 'P1',
  'baqi-asghar': 'P2',
  'musawat-qisma': 'P2',
  'taqdir-hasil': 'P1',
  'baqi-fi-masala': 'P3',
};
/** The evidence of this lesson. It has no real-world case yet: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '1am', points: POINTS }), caseEvidence: () => null };

/** A box as a number; an empty box is no number (the claim that carries it is false on both sides). */
const numberOf = (x) => (x === '' || x == null ? Number.NaN : Number(x));
/** « a = b × q + r » as he wrote it. */
const division = (a, b, q, r) => ({ kind: 'division', a, b, q, r, fits: r === 0 });
const isDivision = (a, b, q, r) => Number.isInteger(q) && Number.isInteger(r) && r >= 0 && r < b && b * q + r === a;

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  const n = (k) => numberOf(value?.[k]);
  const claim = (c) => ({ key: q.key, claim: c });
  switch (q.kind) {
    case 'division':
      // the Euclidean division he wrote: the server re-computes a = b × q + r with r < b
      return claim(division(q.a, q.b, n('q'), n('r')));
    case 'fix':
      // he did not refuse the writing for its remainder: that writing is his claim, and it is not the Euclidean division
      if (value?.verdict !== 'no') return claim(division(q.a, q.b, q.shown.q, q.shown.r));
      return claim(division(q.a, q.b, n('q'), n('r')));
    case 'dividend':
      // the dividend he rebuilt, with the quotient and the remainder of the statement…
      if (n('a') !== q.a) return claim(division(n('a'), q.b, q.quo, q.r));
      // …then « the biggest remainder is m »: the last number whose quotient is still `quo` is b × quo + m
      if (n('m') !== q.b - 1) return claim(division(q.b * q.quo + q.b - 1, q.b, q.quo, n('m')));
      return claim(division(q.a, q.b, q.quo, q.r));
    case 'problem': {
      // the division first; then the DECISION the question asks for
      if (!isDivision(q.a, q.b, n('q'), n('r'))) return claim(division(q.a, q.b, n('q'), n('r')));
      // how many are left out: the remainder itself
      if (q.ask === 'left') return claim(division(q.a, q.b, n('q'), n('n')));
      // how many are full: the quotient — b × n ≤ a < b × (n + 1)
      if (q.ask === 'full') return claim({ kind: 'bracket', a: q.a, b: q.b, lo: n('n'), hi: n('n') + 1 });
      // how many are needed so that nothing stays: the full ones, and one more when something is left
      return claim({ kind: 'fullNeeded', a: q.a, b: q.b, full: n('q'), need: n('n') });
    }
    // « صحيح أم خطأ؟ علّل » is NOT evidence: no verdict re-computed from numbers
    default:
      return null;
  }
}
