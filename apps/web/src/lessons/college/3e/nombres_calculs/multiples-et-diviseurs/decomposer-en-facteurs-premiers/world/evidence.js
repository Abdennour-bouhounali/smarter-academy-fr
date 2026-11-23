/**
 * The EVIDENCE of lesson `decomposer-en-facteurs-premiers` — PURE. Which answers count (written format, first try, no
 * help) and what is sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too
 * (`kit/claims.js`, the same rule as the server's `ClaimVerifier.php`). Here: the savoir-faire each key proves, and the
 * CLAIM each kind of trainer answer makes.
 *
 * The keys and the learning points (`learning_points.lock.json` › `3e_decomposer-en-facteurs-premiers_P1…P3`):
 *   P1 « décomposer en essayant 2, 3, 5, 7… dans l’ordre »   ← 🪜 plus-petit-premier, and 🛑 arret (« n est-il premier ? »)
 *   P2 « écrire la décomposition avec des puissances »        ← 🔢 puissances
 *   P3 « décomposer un grand nombre avec un outil »           ← 📊 tableur
 * Key 3 proves P1 through its own questions (a number by hand); the question about a LARGE number that the stop rule
 * serves is asked under key 4 (P3): a key proves one point (`createEvidence`), and the design's « P3 ← keys 3 and 4 »
 * is carried by key 4's questions.
 *
 * THE RULE OF A CLAIM: the claim is TRUE exactly when the lesson's `check` (world/trainer.js) accepts the WHOLE answer.
 *   decompose, big   « n = [ ] × [ ] × [ ] » — `factorization` of n, the typed primes sorted and grouped with their
 *                    exponents (any order is accepted, as by `check`); a box empty or not a whole number: no factor.
 *   powers           « n = 2 [ ] × 3 [ ] × … » — `factorization` of n with the printed primes and the typed exponents.
 *   quotient         « A ÷ d = 2 [ ] × … » — `factorization` of A ÷ d (computed from the question's numbers).
 *   prime            « on essaie jusqu’à [d] », « n est premier : oui / non » — `stop` (n ; d) while d is wrong, then
 *                    `prime` (n ; says).
 * NOT evidence: a tap of the gate dash, « Vrai ou faux ? Justifie » (a choice, no number written), and « trace » — the
 * trace of the program: NO claim kind states it (the exam sitting — the bank — is the evidence of those questions).
 * `evidence.test.js` enumerates right, wrong and half-wrong answers of every kind: « `check` false ⇔ claim false ».
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { box, exponentsOf, factorsTyped } from './trainer';

/** The savoir-faire each key proves (the codes of the lesson's learning points). */
const POINTS = { 'plus-petit-premier': 'P1', puissances: 'P2', arret: 'P1', tableur: 'P3' };
/** The evidence of this lesson. It has no real-world case: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '3e', points: POINTS }), caseEvidence: () => null };

/** The `factorization` claim of a list of typed primes: sorted, equal primes grouped with their exponent. */
export function factorizationOf(a, xs) {
  if (!xs.length || xs.some((x) => !Number.isInteger(x))) return { kind: 'factorization', a, factors: [] };
  const factors = [];
  for (const p of [...xs].sort((x, y) => x - y)) {
    const last = factors.at(-1);
    if (last?.p === p) last.e += 1;
    else factors.push({ p, e: 1 });
  }
  return { kind: 'factorization', a, factors };
}

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  const claim = (c) => ({ key: q.key, claim: c });
  switch (q.kind) {
    case 'decompose':
    case 'big':
      return claim(factorizationOf(q.a, factorsTyped(q, value)));
    case 'powers':
    case 'quotient': {
      const es = exponentsOf(q).map((f) => ({ p: f.p, e: box(value, `e${f.p}`) }));
      const whole = es.every((f) => Number.isInteger(f.e));
      return claim({ kind: 'factorization', a: q.a, factors: whole ? es : [] });
    }
    case 'prime': {
      const d = box(value, 'd');
      const stop = { kind: 'stop', a: q.a, b: Number.isInteger(d) ? d : -1 };
      if (!(d * d <= q.a && q.a < (d + 1) * (d + 1))) return claim(stop);
      const says = value?.says === 'oui' ? true : value?.says === 'non' ? false : null;
      return claim({ kind: 'prime', a: q.a, says });
    }
    default:
      return null;
  }
}
