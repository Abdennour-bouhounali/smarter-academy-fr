/**
 * The EVIDENCE of lesson `qawasim-adad-tabii` — PURE. Which answers count (written format, first try, no help) and what
 * is sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`, the
 * same rule as the server's). Here: the الكفاءة each key proves, and the CLAIM each kind of trainer answer makes.
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { READ, writtenList, writtenPairs } from './trainer';

/** The الكفاءة each key proves (the codes of the lesson's `learningPoints`). */
const POINTS = { 'jidaa-aamilayn': 'P1', 'qasim-rappel': 'P2', 'tariqa-qawasim': 'P3', 'qawaid-qisma': 'P4' };
/** The evidence of this lesson. It has no real-world case yet: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '4am', points: POINTS }), caseEvidence: () => null };

/** A box of the answer as a number — a box left EMPTY is no number (never 0: a blank must not complete a claim). */
const box = (value, k) => (value?.[k] == null || String(value[k]).trim() === '' ? NaN : Number(value[k]));

/**
 * Evidence of a TRAINER answer, or null when it does not count. Its claim states the WHOLE answer: a half-wrong answer
 * (a box left empty, one part right and one wrong) never makes a true claim.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  const n = (k) => box(value, k);
  switch (q.kind) {
    case 'pairs': {
      const pairs = writtenPairs(q, value).map(([x, y], i) => [
        Number.isNaN(box(value, `x${i}`)) ? NaN : x,
        Number.isNaN(box(value, `y${i}`)) ? NaN : y,
      ]);
      // a line whose product is not a: the claim is THAT line (« a = x × y »), false — never the numbers that happen to
      // be divisors (1 × 2 and 3 × 6 hold every divisor of 6, and neither line is 6)
      const bad = pairs.find(([x, y]) => x * y !== q.a);
      if (bad) return { key: q.key, claim: { kind: 'pair', a: q.a, b: bad[0], e: bad[1] } };
      // every line is a product equal to a: all its divisors are on the sheet (the square root once: 6 × 6 for 36)
      const list = [...new Set(pairs.flat())];
      return { key: q.key, claim: { kind: 'divisors', a: q.a, b: list.length, list } };
    }
    case 'show':
      return { key: q.key, claim: { kind: 'product', a: q.a, b: q.b, q: n('q'), other: n('x') } };
    case 'stop':
      return n('e') === n('d') + 1 ? { key: q.key, claim: { kind: 'stop', a: q.a, b: n('d') } } : null;
    case 'list': {
      const list = writtenList(q, value).map((d, i) => (Number.isNaN(box(value, `d${i}`)) ? NaN : d));
      return { key: q.key, claim: { kind: 'divisors', a: q.a, b: list.length, list } };
    }
    case 'rule':
      // the reading must be right too: a lucky verdict is not the rule
      return {
        key: q.key,
        claim: {
          kind: 'divisible',
          a: q.a,
          b: q.b,
          fits: n('v') === READ[q.b].of(q.a) ? Boolean(value?.fits) : !(q.a % q.b === 0),
        },
      };
    // « صحيح أم خطأ؟ علّل » is NOT evidence: its verdict cannot be re-computed from numbers
    default:
      return null;
  }
}
