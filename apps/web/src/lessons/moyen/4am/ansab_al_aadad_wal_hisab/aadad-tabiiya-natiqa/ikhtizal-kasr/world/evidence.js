/**
 * The EVIDENCE of lesson `ikhtizal-kasr` — PURE. Which answers count (written format, first try, no help) and what is
 * sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`, the
 * same rule as the server's). Here: the الكفاءة each key proves, and the CLAIM each kind of trainer answer makes.
 *
 * The keys and the learning points (`4am_ikhtizal-kasr_P1…P4`), one to one:
 *   P1 « اختزال كسر بالقسمة المتتابعة على قواسم مشتركة »                     ← 🪜 ikhtizal-marahil
 *   P2 « التعرّف على الكسر غير القابل للاختزال »                              ← 🔒 ghayr-qabil
 *   P3 « كتابة كسر على الشكل غير القابل للاختزال بالقسمة على PGCD »          ← 🎯 ikhtizal-pgcd
 *   P4 « إعطاء نتيجة حساب على الأعداد الناطقة على شكل كسر غير قابل للاختزال » ← 🧾 natija-mukhtazala
 *
 * THE RULE OF A CLAIM: the claim is TRUE exactly when the lesson's `check` (world/trainer.js) accepts the WHOLE answer.
 * An answer in several parts sends the claim of its FIRST wrong part, as he wrote it — or, when every part is right, the
 * claim of its last part (which, the parts before being right, states the whole answer). Only existing kinds are used:
 *   marahil    « a/b = [p1]/[q1] = [p2]/[q2] », divided by d then by e — four `division` claims in turn, each « x = k × [y] »
 *              (fits: true): a = d × p1, b = d × q1, a/d = e × p2, b/d = e × q2. The quotient IS the number he wrote.
 *   hukm       « PGCD(a ; b) = [g] », then « the fraction is irreducible or not » — `pgcd` (a ; b ; g) while g is wrong;
 *              once g is right, `coprime` (a ; b ; says) with says = « irreducible » (a fraction is irreducible exactly
 *              when its numerator and denominator are coprime); no verdict: `says` is not a boolean, the claim is false.
 *   mukhtazal  « PGCD(a ; b) = [g] », then « a/b = [p]/[q] » — `pgcd` while g is wrong, then `fraction` (a ; b ; p ; q),
 *              equal AND irreducible: the irreducible form is unique, so the claim is true for p/q = (a ÷ g)/(b ÷ g) only.
 *   hisab      « x/y op z/w = [s]/[t] = [p]/[q] » — `fraction` (A ; B ; s ; t ; reduced: false) — an EQUAL fraction,
 *              as `check` accepts any writing of the result — then `fraction` (A ; B ; p ; q), irreducible. Both carry
 *              the CALCULATION (`op`, x ; y ; z ; w — the option `op` of `fraction`, 2026-11-20): the server computes
 *              x/y op z/w itself and refuses a claim whose A/B is not its result — it trusts neither A/B nor p/q.
 * Every answer of an exam question sends its claim: none is silent.
 * NOT evidence: a tap (a gate of the dash, a choice, no number written).
 * `evidence.test.js` enumerates right, wrong and half-wrong answers of every kind: « `check` false ⇔ claim false ». The
 * kit drops, besides, any TRUE claim of an answer `check` refused (`guardEvidence`, Trainer.jsx).
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';

/** The الكفاءة each key proves (the codes of the lesson's `learningPoints`). */
const POINTS = {
  'ikhtizal-marahil': 'P1',
  'ghayr-qabil': 'P2',
  'ikhtizal-pgcd': 'P3',
  'natija-mukhtazala': 'P4',
};
/** The evidence of this lesson. It has no real-world case: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '4am', points: POINTS }), caseEvidence: () => null };

/** The first claim of a list that is false, or the last one when every claim holds. */
const firstFalse = (claims) => claims.find((c) => !verifyClaim(c)) ?? claims.at(-1);

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  // an empty box is 0 and a missing one NaN: neither makes a claim true where the answer is wrong
  const n = (k) => Number(value?.[k]);
  const claim = (c) => ({ key: q.key, claim: c });
  /** x = k × y, as he wrote y (the quotient of an exact division). */
  const division = (x, k, y) => ({ kind: 'division', a: x, b: k, q: y, r: 0, fits: true });
  switch (q.kind) {
    case 'marahil': {
      const [a1, b1] = [q.a / q.d, q.b / q.d];
      return claim(
        firstFalse([
          division(q.a, q.d, n('p1')),
          division(q.b, q.d, n('q1')),
          division(a1, q.e, n('p2')),
          division(b1, q.e, n('q2')),
        ]),
      );
    }
    case 'hukm': {
      const first = { kind: 'pgcd', a: q.a, b: q.b, g: n('g') };
      if (!verifyClaim(first)) return claim(first);
      const v = value?.verdict;
      const says = v === 'irr' ? true : v === 'red' ? false : null;
      return claim({ kind: 'coprime', a: q.a, b: q.b, says });
    }
    case 'mukhtazal':
      return claim(
        firstFalse([
          { kind: 'pgcd', a: q.a, b: q.b, g: n('g') },
          { kind: 'fraction', a: q.a, b: q.b, p: n('p'), q: n('q') },
        ]),
      );
    case 'hisab': {
      // the calculation itself, as the question poses it (the claim's operations are '+', '-', '*')
      const calc = { op: q.op === '×' ? '*' : q.op, x: q.x, y: q.y, z: q.z, w: q.w };
      return claim(
        firstFalse([
          { kind: 'fraction', a: q.A, b: q.B, p: n('s'), q: n('t'), reduced: false, ...calc },
          { kind: 'fraction', a: q.A, b: q.B, p: n('p'), q: n('q'), ...calc },
        ]),
      );
    }
    default:
      return null;
  }
}
