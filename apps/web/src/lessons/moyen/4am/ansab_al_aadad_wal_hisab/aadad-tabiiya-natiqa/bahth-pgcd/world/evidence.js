/**
 * The EVIDENCE of lesson `bahth-pgcd` — PURE. Which answers count (written format, first try, no help) and what is sent
 * is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`, the same rule
 * as the server's). Here: the الكفاءة each key proves, and the CLAIM each kind of trainer answer makes.
 *
 * The keys and the learning points (`4am_bahth-pgcd_P1…P5`), one to one:
 *   P1 « PGCD(a ; b) = PGCD(b ; a − b) »          ← ➖ farq-yabqi
 *   P2 « خوارزمية الفروق المتتابعة »              ← 🪜 khawarizmiyat-al-tarh
 *   P3 « PGCD(a ; b) = PGCD(b ; r) »              ← 🧮 baqi-yabqi
 *   P4 « خوارزمية إقليدس »                         ← 🔁 iqlidis
 *   P5 « مقارنة الخوارزميتين »                     ← ⏱️ aqall-khutuwat
 *
 * THE RULE OF A CLAIM (as in `tayin-pgcd`): the claim is TRUE exactly when the lesson's `check` (world/trainer.js)
 * accepts the WHOLE answer. An answer in several parts sends the claim of its FIRST wrong part, as he wrote it — or, when
 * every part is right, the claim that states the whole answer. Only existing kinds are used:
 *   farq    « PGCD(a ; b) = PGCD(b ; [e]) », « PGCD(a ; b) = [g] » — a wrong e: `division` a = b × 1 + e (true only for
 *           e = a − b, since the pairs have b < a < 2b); then `pgcd` (a ; b ; g).
 *   furuq   « a − b = [d] », « PGCD(a ; b) = [g] » — a wrong d: `division` a = b × 1 + d; then `pgcd`.
 *   baqi    « a = b × [q] + [r] », « PGCD(a ; b) = PGCD(b ; [e]) » — `division` with what he wrote; once the division is
 *           right, `division` a = b × q + e (true only for e = r): the whole answer.
 *   iqlidis « a = b × [q] + [r] », « PGCD(a ; b) = [g] » — `division` while the division is wrong, then `pgcd`.
 * NOT evidence: a tap of the gate dash and « صحيح أم خطأ؟ علّل » (a choice, no number written), and « sura » — the counts
 * of divisions and subtractions and the choice of the faster algorithm: NO claim kind states them (reported; the exam
 * sitting — the bank — is the evidence of P5). `evidence.test.js` enumerates right, wrong and half-wrong answers of every
 * kind: « `check` false ⇔ claim false ». The kit drops, besides, any TRUE claim of an answer `check` refused
 * (`guardEvidence`, Trainer.jsx).
 * (The draft of 2026-11-18 claimed the division alone for « iqlidis »: a right first division and a wrong PGCD earned the
 * الكفاءة P4 — defects.md A6.)
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';

/** The الكفاءة each key proves (the codes of the lesson's `learningPoints`). */
const POINTS = {
  'farq-yabqi': 'P1',
  'khawarizmiyat-al-tarh': 'P2',
  'baqi-yabqi': 'P3',
  iqlidis: 'P4',
  'aqall-khutuwat': 'P5',
};
/** The evidence of this lesson. It has no real-world case: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '4am', points: POINTS }), caseEvidence: () => null };

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  // an empty box is 0 and a missing one NaN: neither makes a claim true where the answer is wrong
  const n = (k) => Number(value?.[k]);
  const claim = (c) => ({ key: q.key, claim: c });
  /** a = b × q + r, as written (fits: r = 0, said consistently: the claim is true only for the right q and r). */
  const division = (qq, r) => ({ kind: 'division', a: q.a, b: q.b, q: qq, r, fits: r === 0 });
  const pgcd = (g) => ({ kind: 'pgcd', a: q.a, b: q.b, g });
  switch (q.kind) {
    case 'farq': {
      const first = division(1, n('e'));
      return claim(verifyClaim(first) ? pgcd(n('g')) : first);
    }
    case 'furuq': {
      const first = division(1, n('d'));
      return claim(verifyClaim(first) ? pgcd(n('g')) : first);
    }
    case 'baqi': {
      const first = division(n('q'), n('r'));
      return claim(verifyClaim(first) ? division(n('q'), n('e')) : first);
    }
    case 'iqlidis': {
      const first = division(n('q'), n('r'));
      return claim(verifyClaim(first) ? pgcd(n('g')) : first);
    }
    default:
      return null;
  }
}
