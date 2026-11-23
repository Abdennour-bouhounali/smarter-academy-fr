/**
 * The EVIDENCE of lesson `trouver-le-pgcd` — PURE. Which answers count (written format, first try, no help) and what is
 * sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`, the
 * same rule as the server's `ClaimVerifier.php`). Here: the savoir-faire each key proves, and the CLAIM each kind of
 * trainer answer makes.
 *
 * The keys and the learning points (`learning_points.lock.json` › `3e_trouver-le-pgcd_P1…P4`), one to one:
 *   P1 « lister les diviseurs communs, reconnaître le plus grand : le PGCD »   ← 🤝 diviseurs-communs
 *   P2 « le PGCD à partir des décompositions en facteurs premiers »            ← 🧮 pgcd-facteurs
 *   P3 « le PGCD avec l’algorithme d’Euclide »                                  ← 🔁 euclide
 *   P4 « un partage en lots identiques : le plus de lots est le PGCD »          ← 🧺 lots-identiques
 *
 * THE RULE OF A CLAIM: the claim is TRUE exactly when the lesson's `check` (world/trainer.js) accepts the WHOLE answer. An
 * answer in several parts sends the claim of its FIRST wrong part — or, when every part is right, the claim of the part
 * that carries the savoir-faire (as the Algerian `qasim-mushtarak-akbar` and `bahth-pgcd` did). Only existing kinds:
 *   communs    six divisors, then « PGCD(a ; b) = [g] » — `commonDivisor` (a, b, d) of the first number that does not
 *              divide both; else `divisors` of g = PGCD(a ; b) (the question's, never the student's) with his list —
 *              true exactly when he wrote every common divisor once; else `pgcd` (a, b, g typed).
 *   lots       « n lots, x and y in each » — `pgcd` (a, b, n) while n is wrong; then `pair` (a = n × x), `pair`
 *              (b = n × y); when all three are right, `pgcd`: the number of lots IS the PGCD.
 *   facteurs   the exponents of the common primes, then the value — `factorization` of PGCD(A ; B) with the typed
 *              exponents while one is wrong; then `pgcd` (A, B, g typed).
 *   euclide    « a = b × [q] + [r] », « PGCD(a ; b) = [g] » — `division` while the division is wrong; then `pgcd`.
 * NOT evidence: a tap of the gate dash, « Vrai ou faux ? Justifie » (a choice, no number written).
 * `evidence.test.js` enumerates right, wrong and half-wrong answers of every kind: « `check` false ⇔ claim false ».
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { box } from './trainer';

/** The savoir-faire each key proves (the codes of the lesson's learning points). */
const POINTS = { 'diviseurs-communs': 'P1', 'lots-identiques': 'P4', 'pgcd-facteurs': 'P2', euclide: 'P3' };
/** The evidence of this lesson. It has no real-world case: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '3e', points: POINTS }), caseEvidence: () => null };

const SLOTS = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'];
const natural = (x) => Number.isInteger(x) && x >= 0;

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  const claim = (c) => ({ key: q.key, claim: c });
  const pgcd = (g) => claim({ kind: 'pgcd', a: q.a, b: q.b, g });
  switch (q.kind) {
    case 'communs': {
      const list = SLOTS.map((s) => box(value, s));
      const stray = list.find((d) => natural(d) && d >= 1 && (q.a % d !== 0 || q.b % d !== 0));
      if (stray != null) return claim({ kind: 'commonDivisor', a: q.a, b: q.b, d: stray });
      const all = claim({ kind: 'divisors', a: q.g, list, b: q.list.length });
      if (list.length !== q.list.length || new Set(list).size !== list.length || !list.every((d) => q.list.includes(d)))
        return all;
      return pgcd(box(value, 'g'));
    }
    case 'lots': {
      const [n, x, y] = ['n', 'x', 'y'].map((k) => box(value, k));
      if (n !== q.g) return pgcd(n);
      if (!natural(x) || n * x !== q.a) return claim({ kind: 'pair', a: q.a, b: n, e: x });
      if (!natural(y) || n * y !== q.b) return claim({ kind: 'pair', a: q.b, b: n, e: y });
      return pgcd(n);
    }
    case 'facteurs': {
      const es = q.common.map((f) => ({ p: f.p, e: box(value, `e${f.p}`) }));
      if (es.some((f, i) => f.e !== q.common[i].e))
        return claim({
          kind: 'factorization',
          a: q.a,
          factors: es.every((f) => Number.isInteger(f.e)) ? es : [],
        });
      return claim({ kind: 'pgcd', a: q.A, b: q.B, g: box(value, 'g') });
    }
    case 'euclide': {
      const [qq, r] = [box(value, 'q'), box(value, 'r')];
      if (!(natural(qq) && natural(r) && q.b * qq + r === q.a && r < q.b))
        return claim({ kind: 'division', a: q.a, b: q.b, q: qq, r, fits: r === 0 });
      return pgcd(box(value, 'g'));
    }
    default:
      return null;
  }
}
