/**
 * The EVIDENCE of lesson `qisma-iqlidiya-hasr` — PURE. Which answers count (written format, first try, no help) and what
 * is sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`, the
 * same rule as the server's). Here: the الكفاءة each key proves, and the CLAIM each kind of trainer answer makes.
 *
 * THE RULE OF THIS FILE: a claim states the WHOLE answer, in the part that carries the lesson's الكفاءة — so it is FALSE
 * whenever the trainer's `check` refuses the answer (`evidence.test.js` sweeps wrong and half-wrong answers of every
 * kind). A claim that covers only a part credits a wrong answer: « a يقسم b » chosen under a right division, a bracket
 * whose lower end is wrong, full boxes miscounted beside the right boxes needed.
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';

/** The الكفاءة each key proves (the codes of the lesson's الكفاءات: `2am_qisma-iqlidiya-hasr_P1` …). */
const POINTS = { 'qisma-ay-adad': 'P1', 'hasr-hasil': 'P2', 'inidam-baqi': 'P3' };
/** The evidence of this lesson. It has no real-world case yet: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '2am', points: POINTS }), caseEvidence: () => null };

/** A box as a number: an empty or missing box is NOT 0 — it makes every claim false. */
const typed = (x) => (x === '' || x == null ? NaN : Number(x));

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  const n = (k) => typed(value?.[k]);
  const { a, b } = q;
  switch (q.kind) {
    case 'division':
      // the Euclidean division he wrote: the server re-computes a = b × q + r with r < b
      return { key: q.key, claim: { kind: 'division', a, b, q: n('q'), r: n('r'), fits: n('r') === 0 } };
    case 'exact': {
      // the sentence he chose is the الكفاءة: « a يقسم b » is a claim of its own (false: a is the multiple) …
      if (value?.ph === 'swap') return { key: q.key, claim: { kind: 'phrase', phrase: 'yaqsim', a, b, first: a } };
      // … and « a (لا) يقبل القسمة على b » is said rightly exactly when the remainder HE found is 0 — no sentence, no claim
      const fits = value?.ph === 'yes' ? true : value?.ph === 'no' ? false : null;
      return { key: q.key, claim: { kind: 'division', a, b, q: n('q'), r: n('r'), fits } };
    }
    case 'bracket':
      // BOTH ends: b × lo ≤ a < b × hi and hi = lo + 1
      return { key: q.key, claim: { kind: 'bracket', a, b, lo: n('lo'), hi: n('hi') } };
    case 'needed':
      // BOTH counts: the boxes that are full (rounded down) and the boxes needed (rounded up)
      return { key: q.key, claim: { kind: 'fullNeeded', a, b, full: n('full'), need: n('need') } };
    // « صحيح أم خطأ؟ علّل » is NOT evidence: no verdict re-computed from numbers
    default:
      return null;
  }
}
