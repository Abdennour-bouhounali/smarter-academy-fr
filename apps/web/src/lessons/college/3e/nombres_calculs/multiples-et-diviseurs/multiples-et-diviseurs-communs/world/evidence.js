/**
 * The EVIDENCE of lesson `multiples-et-diviseurs-communs` — PURE. Which answers count (written format, first try, no help)
 * and what is sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`,
 * the same rule as the server's `ClaimVerifier.php`). Here: the savoir-faire each key proves, and the CLAIM each kind of
 * trainer answer makes.
 *
 * The keys and the learning points (`learning_points.lock.json` › `3e_multiples-et-diviseurs-communs_P1…P3`) — FOUR keys,
 * THREE points, so `pointOf` is declared (`evidence.test.js`):
 *   P1 « reconnaître que des répétitions simultanées relèvent des multiples communs »  ← 🏗️ pilier-commun
 *   P2 « le plus petit multiple commun non nul, à partir des décompositions »            ← 🧮 ppcm-facteurs
 *   P3 « résoudre un problème de rendez-vous, lire le résultat en durée ou en tours »    ← 🔁 traduire-rendez-vous
 *                                                                                           and ⏳ cinq-equipes
 *
 * THE RULE OF A CLAIM: the claim is TRUE exactly when the lesson's `check` (world/trainer.js) accepts the WHOLE answer. An
 * answer in several parts sends the claim of its FIRST wrong part — or, when every part is right, the claim of the part
 * that carries the savoir-faire. Only existing kinds:
 *   pilier / rendezvous   « m », then « x » and « y » — `ppcm` (a, b, m typed) while m is wrong; then `pair` (m = a × x),
 *                         `pair` (m = b × y); when all three are right, `ppcm`.
 *   facteurs              the exponents of every prime, then the value — `factorization` of the smallest common multiple
 *                         (the question's, never the student's) with the typed exponents while one is wrong; then `ppcm`.
 *   horaire               minutes, then « h » and « min » — `ppcm`; then `division` of the arrival time in minutes by 60.
 *   fenetre               the first meeting, then how many in the window — `ppcm`; then `bracket` of the window by the meeting.
 *   jours                 the length of the pattern, then the day — `ppcm` of the cycles; then `ppcm` with m = day − 1.
 *   outil                 the greatest common divisor, then the smallest common multiple — `pgcd`, then `ppcm`.
 *   budget                the length of a section, then the whole sections the budget pays — `ppcm`; then `bracket`.
 * NOT evidence: a tap of the gate dash, « Vrai ou faux ? Justifie » (a choice, no number written).
 * `evidence.test.js` enumerates right, wrong and half-wrong answers of every kind: « `check` false ⇔ claim false ».
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { box } from './trainer';

/** The savoir-faire each key proves (the codes of the lesson's learning points). */
const POINTS = { 'pilier-commun': 'P1', 'ppcm-facteurs': 'P2', 'traduire-rendez-vous': 'P3', 'cinq-equipes': 'P3' };
/** The evidence of this lesson. It has no real-world case: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '3e', points: POINTS }), caseEvidence: () => null };

const natural = (x) => Number.isInteger(x) && x >= 0;

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  const claim = (c) => ({ key: q.key, claim: c });
  const ppcm = (m) => claim({ kind: 'ppcm', a: q.a, b: q.b, ...(q.more ? { more: q.more } : {}), m });
  switch (q.kind) {
    case 'pilier':
    case 'rendezvous': {
      const [m, x, y] = ['m', 'x', 'y'].map((k) => box(value, k));
      if (m !== q.m) return ppcm(m);
      if (!natural(x) || q.a * x !== q.m) return claim({ kind: 'pair', a: q.m, b: q.a, e: x });
      if (!natural(y) || q.b * y !== q.m) return claim({ kind: 'pair', a: q.m, b: q.b, e: y });
      return ppcm(m);
    }
    case 'facteurs': {
      const es = q.big.map((f) => ({ p: f.p, e: box(value, `e${f.p}`) }));
      if (es.some((f, i) => f.e !== q.big[i].e))
        return claim({ kind: 'factorization', a: q.m, factors: es.every((f) => Number.isInteger(f.e)) ? es : [] });
      return ppcm(box(value, 'g'));
    }
    case 'horaire': {
      const [m, h, min] = ['m', 'h', 'min'].map((k) => box(value, k));
      if (m !== q.m) return ppcm(m);
      return claim({ kind: 'division', a: q.arrival, b: 60, q: h, r: min, fits: min === 0 });
    }
    case 'fenetre': {
      const [m, n] = ['m', 'n'].map((k) => box(value, k));
      if (m !== q.m) return ppcm(m);
      return claim({ kind: 'bracket', a: q.window, b: q.m, lo: n, hi: n + 1 });
    }
    case 'jours': {
      const [m, d] = ['m', 'd'].map((k) => box(value, k));
      if (m !== q.m) return ppcm(m);
      return ppcm(d - 1);
    }
    case 'outil': {
      const [g, m] = ['g', 'm'].map((k) => box(value, k));
      if (g !== q.g) return claim({ kind: 'pgcd', a: q.a, b: q.b, g });
      return ppcm(m);
    }
    case 'budget': {
      const [m, n] = ['m', 'n'].map((k) => box(value, k));
      if (m !== q.m) return ppcm(m);
      return claim({ kind: 'bracket', a: q.budget, b: q.cost, lo: n, hi: n + 1 });
    }
    default:
      return null;
  }
}
