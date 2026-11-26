/**
 * The EVIDENCE of lesson `fraction-irreductible` — PURE. Which answers count (written format, first try, no help) and what
 * is sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`, the
 * same rule as the server's `ClaimVerifier.php`). Here: the savoir-faire each key proves, and the CLAIM each kind of
 * trainer answer makes.
 *
 * The keys and the learning points (`learning_points.lock.json` › `3e_fraction-irreductible_P1…P4`):
 *   P1 « reconnaître une fraction irréductible »                              ← 🔒 irreductible
 *   P2 « rendre irréductible avec les décompositions, en barrant »            ← 🪜 simplifier-facteurs
 *   P3 « donner le résultat d’un calcul sous forme irréductible »             ← 🧾 resultat-irreductible
 *   P4 « rendre irréductible en une étape, en divisant par le PGCD »          ← 🎯 diviser-par-le-pgcd
 *
 * THE RULE OF A CLAIM: the claim is TRUE exactly when the lesson's `check` (world/trainer.js) accepts the WHOLE answer. An
 * answer in several parts sends the claim of its FIRST wrong part — or, when every part is right, the claim of its last
 * part (which, the parts before being right, states the whole answer). Only existing kinds:
 *   barrer    « a/b = [p]/[q] » — `fraction` (a ; b ; p ; q): equal AND irreducible, the irreducible form being unique.
 *   verdict   « PGCD(a ; b) = [g] », then « irréductible ou non » — `pgcd` while g is wrong; then `coprime` (says: his verdict).
 *   diviser   « PGCD(a ; b) = [g] », then « a/b = [p]/[q] » — `pgcd` while g is wrong, then `fraction`.
 *   calcul    « x/y op z/w = [s]/[t] = [p]/[q] » — `fraction` (A ; B ; s ; t ; reduced: false), then `fraction` (A ; B ; p ;
 *             q); both carry the CALCULATION (`op`, x ; y ; z ; w): the server computes it and refuses a claim whose A/B is
 *             not its result.
 * NOT evidence: a tap (a gate of the dash). `evidence.test.js` enumerates right, wrong and half-wrong answers.
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';

/** The savoir-faire each key proves (the codes of the lesson's learning points). */
const POINTS = {
  'simplifier-facteurs': 'P2',
  irreductible: 'P1',
  'diviser-par-le-pgcd': 'P4',
  'resultat-irreductible': 'P3',
};
/** The evidence of this lesson. It has no real-world case: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '3e', points: POINTS }), caseEvidence: () => null };

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
  switch (q.kind) {
    case 'barrer':
      return claim({ kind: 'fraction', a: q.a, b: q.b, p: n('p'), q: n('q') });
    case 'verdict': {
      const first = { kind: 'pgcd', a: q.a, b: q.b, g: n('g') };
      if (!verifyClaim(first)) return claim(first);
      const v = value?.verdict;
      const says = v === 'irr' ? true : v === 'red' ? false : null;
      return claim({ kind: 'coprime', a: q.a, b: q.b, says });
    }
    case 'diviser':
      return claim(
        firstFalse([
          { kind: 'pgcd', a: q.a, b: q.b, g: n('g') },
          { kind: 'fraction', a: q.a, b: q.b, p: n('p'), q: n('q') },
        ]),
      );
    case 'calcul': {
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
