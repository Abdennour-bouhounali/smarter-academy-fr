/**
 * The EVIDENCE of lesson `awwaliyan-fima-baynahuma` — PURE. Which answers count (written format, first try, no help) and
 * what is sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`,
 * the same rule as the server's). Here: the الكفاءة each key proves, and the CLAIM each kind of trainer answer makes.
 *
 * The keys and the learning points (`4am_awwaliyan-fima-baynahuma_P1…P3`), one to one:
 *   P1 « التعرّف على عددين أوّليّين فيما بينهما »                    ← 🤝 awwaliyan
 *   P2 « إثبات أنّهما أوّليّان فيما بينهما بحساب PGCD »             ← ✅ ithbat-awwaliyan
 *   P3 « إثبات أنّهما ليسا أوّليّين بإظهار قاسم مشترك يختلف عن 1 » ← ❌ shahid-wahid
 *
 * THE RULE OF A CLAIM (as in `bahth-pgcd`): the claim is TRUE exactly when the lesson's `check` (world/trainer.js)
 * accepts the WHOLE answer. An answer in several parts sends the claim of its FIRST wrong part, as he wrote it — or, when
 * every part is right, the claim that states the whole answer. Only existing kinds are used:
 *   hukm    « PGCD(a ; b) = [g] », then the verdict — `pgcd` (a ; b ; g) while g is wrong; once g is right, `coprime`
 *           (a ; b ; says) with the verdict he chose (no verdict: `says` is not a boolean, the claim is false).
 *   burhan, nafi  « a = b × [q] + [r] », « PGCD(a ; b) = [g] » — `division` while the division is wrong, then `pgcd`
 *           (the proof of ✅ IS « PGCD = 1 »; the PGCD of ❌'s « nafi » is the common divisor other than 1 it finds).
 *   shahid  « قاسم مشترك يختلف عن 1: [d] » — `commonDivisor` (a ; b ; d) with `notOne: true`: a common divisor OTHER
 *           THAN 1 (the option was added for this key, 2026-11-20 — LESSON_V2.md §1bis), so d = 1 is a FALSE claim.
 * Every answer of an exam question sends its claim: none is silent.
 * NOT evidence: a tap of the gate dash and « صحيح أم خطأ؟ علّل » (a choice, no number written).
 * `evidence.test.js` enumerates right, wrong and half-wrong answers of every kind: « `check` false ⇔ claim false ». The
 * kit drops, besides, any TRUE claim of an answer `check` refused (`guardEvidence`, Trainer.jsx).
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';

/** The الكفاءة each key proves (the codes of the lesson's `learningPoints`). */
const POINTS = {
  awwaliyan: 'P1',
  'ithbat-awwaliyan': 'P2',
  'shahid-wahid': 'P3',
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
    case 'hukm': {
      const first = pgcd(n('g'));
      if (!verifyClaim(first)) return claim(first);
      const v = value?.verdict;
      const says = v === 'yes' ? true : v === 'no' ? false : null;
      return claim({ kind: 'coprime', a: q.a, b: q.b, says });
    }
    case 'burhan':
    case 'nafi': {
      const first = division(n('q'), n('r'));
      return claim(verifyClaim(first) ? pgcd(n('g')) : first);
    }
    case 'shahid':
      // a witness OTHER THAN 1: d = 1 is a false claim, as `check` refuses it
      return claim({ kind: 'commonDivisor', a: q.a, b: q.b, d: n('d'), notOne: true });
    default:
      return null;
  }
}
