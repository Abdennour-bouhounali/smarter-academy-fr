/**
 * The EVIDENCE of lesson `qawaid-qabiliyat-qisma` — PURE. Which answers count (written format, first try, no help) and
 * what is sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`,
 * the same rule as the server's). Here: the الكفاءة each key proves, and the CLAIM each kind of trainer answer makes.
 */
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { readingOf } from './trainer';

/**
 * The الكفاءة each key proves (the codes of the lesson's `learningPoints`, in the order of its `skills`): P1 the units
 * digit (2 and 5), P2 the sum of the digits (3 and 9), P3 the last two digits (4), P4 « divisible » as a remainder 0.
 */
const POINTS = { 'raqm-alahad': 'P1', 'majmu-arqam': 'P2', 'raqmayn-akhirayn': 'P3', 'baqi-sifr': 'P4' };
/** The three phrasings of « اختر الجملة الصحيحة », by the slot of their line (world/trainer.js › PHRASES). */
const PHRASINGS = ['yaqbal', 'mudaaf', 'yaqsim'];
/** The evidence of this lesson. It has no real-world case: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '1am', points: POINTS }), caseEvidence: () => null };

/** A box he filled with a natural number (never an empty box read as 0). */
const typed = (x) => x !== '' && x != null && Number.isInteger(Number(x)) && Number(x) >= 0;
/** The verdict he chose, or null when he chose none. */
const said = (v) => (v === 'yes' ? true : v === 'no' ? false : null);

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 *
 * THE RULE OF THIS FILE (evidence.test.js sweeps it over every kind): an answer the trainer refuses (`check(q, v).ok`
 * false) NEVER gives a claim the server finds true. So a claim is made only from a COMPLETE answer, and it carries the
 * part of the answer the trainer refused:
 *   judge   the claim is his verdict about n — made only when the reading he wrote is the one in the number. A wrong
 *           reading with a verdict that happens to be right is not a claim about n at all: no kind of `kit/claims.js`
 *           carries a reading, so it is not sent (it is neither right nor wrong evidence).
 *   rest    the division he wrote and his verdict (the server checks both).
 *   phrase  three sentences chosen, ONE claim: the first sentence he put the wrong way round — or, when the three are
 *           right, « … يقسم … ».
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  switch (q.kind) {
    case 'judge': {
      // « n يقبل (لا يقبل) القسمة على b »: the server re-computes n mod b
      const r = readingOf(q.n, q.b);
      const fits = said(value?.v);
      if (fits === null || !typed(value?.[r.slot]) || Number(value[r.slot]) !== r.value) return null;
      return { key: q.key, claim: { kind: 'divisible', a: q.n, b: q.b, fits } };
    }
    case 'digit': {
      // the digit he wrote makes a number he says is divisible by b
      const d = Number(value);
      if (!typed(value) || d > 9) return null;
      return { key: q.key, claim: { kind: 'divisible', a: q.value + d * (q.place / 10), b: q.b, fits: true } };
    }
    case 'rest': {
      // the Euclidean division he wrote and his verdict: « divisible » must be said exactly when his remainder is 0
      const fits = said(value?.v);
      if (fits === null || !typed(value?.q) || !typed(value?.r)) return null;
      return {
        key: q.key,
        claim: { kind: 'division', a: q.a, b: q.b, q: Number(value.q), r: Number(value.r), fits },
      };
    }
    case 'phrase': {
      // in each phrasing the number written first is the multiple — or, for « يقسم », the divisor
      const first = (slot) => Number(value?.[slot]);
      const claimOf = (slot) => ({ kind: 'phrase', phrase: slot, first: first(slot), a: q.a, b: q.b });
      if (!PHRASINGS.every((slot) => [q.a, q.b].includes(first(slot)))) return null;
      const wrong = PHRASINGS.find((slot) => !verifyClaim(claimOf(slot)));
      return { key: q.key, claim: claimOf(wrong ?? 'yaqsim') };
    }
    // « صحيح أم خطأ؟ علّل » is NOT evidence: its reason is chosen among sentences, no verdict re-computed from numbers
    default:
      return null;
  }
}
