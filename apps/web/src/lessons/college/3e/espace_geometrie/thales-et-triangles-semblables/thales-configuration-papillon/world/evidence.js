/**
 * The EVIDENCE of lesson `thales-configuration-papillon` — PURE. Which answers count (written format, first try, no
 * help) and what is sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too
 * (`kit/claims.js`, the same rule as the server's `ClaimVerifier.php`). Here: the savoir-faire each key proves, and the
 * CLAIM each kind of trainer answer makes.
 *
 * TWO KEYS, THREE SAVOIR-FAIRE (design § 2: K1 → P1, P2; K2 → P2, P3). `createEvidence` maps a key to ONE point: K1 is
 * read as P1 and K2 as P3 (their tablets, the sitting's cards); P2 — « choisir l’ordre des longueurs selon la
 * configuration » — is carried by the ANSWERS that choose it: the ratio of a line given across the vertex (K1,
 * `rapportTravers`), and the first part of a two-step length — the length from the vertex cut from the one across it
 * (K2, `travers`) or joined from its two pieces in a nested figure (K2, `emboite`). Such an answer's evidence says
 * `point: 'P2'`, and this lesson's `payloadOf` sends it under P2 (the kit's, otherwise: `LessonWorld.jsx` calls
 * `lesson.evidence.payloadOf`). NOT VERIFIED against the server: it must accept P2 for a key whose own point is P1 / P3.
 *
 * The claims, all of kinds that exist (`fraction`):
 *   `fraction`          his ratio p/q equals the ratio of the figure (unreduced: any equal writing is right);
 *   `fraction` op '*'   his length equals P × Q × 1/D — the cross product the server computes from the three known
 *                       lengths (a decimal length is a fraction: 32,5 = 65/2);
 *   `fraction` op '-'   his length from the vertex equals the length across less the other part (VB = VMB − VM);
 *   `fraction` op '+'   his nested side equals the sum of its two pieces.
 * THE RULE OF A CLAIM (defects.md A6): the claim is TRUE exactly when the lesson's `check` (world/trainer.js) accepts the
 * WHOLE answer. An answer in two parts sends the claim of its FIRST part while it is not right, else of its last.
 * Never evidence: a tap, a true / false, the three ratios written with segment names (no claim kind states a pairing of
 * names), a second try, an answer after help.
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { K, equal, over, read, times, typedNumber, typedWhole } from './math';

/** The savoir-faire each key proves (the codes of the lesson's learning points) — see the header. */
export const POINTS = { [K.papillon]: 'P1', [K.calcul]: 'P3' };
const base = createEvidence({ grade: '3e', points: POINTS });
/**
 * The evidence of this lesson: the kit's, but an answer that proves P2 (its evidence carries `point`) is sent under P2.
 * It has no real-world case: nothing is claimed from one.
 */
export const evidence = {
  ...base,
  payloadOf(lessonId, context, ev, attemptId) {
    if (!ev?.point) return base.payloadOf(lessonId, context, ev, attemptId);
    return { attemptId, learningPoint: `3e_${lessonId}_${ev.point}`, context, claim: ev.claim };
  },
  caseEvidence: () => null,
};

const nat = (x) => Number(x);
/** A typed length as a fraction n/d of naturals, or [null, null]. */
function typedParts(x) {
  const t = typedNumber(x);
  if (t == null) return [null, null];
  const v = read(t);
  return [nat(v.n), nat(v.d)];
}
/** « his length = x op z » with the exact operands — the server computes x op z itself. */
function opClaim(op, x, z, typed) {
  const [a, b] = typedParts(typed);
  const [X, Z] = [read(x), read(z)];
  return { kind: 'fraction', a, b, p: a, q: b, op, x: nat(X.n), y: nat(X.d), z: nat(Z.n), w: nat(Z.d), reduced: false };
}
/** « his length = P × Q ÷ D »: P × Q and 1/D, multiplied by the server. */
const crossClaim = (f, s, typed) => opClaim('*', times(f[s.P], f[s.Q]), over('1', f[s.D]), typed);

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  const v = value ?? {};
  switch (q.kind) {
    case 'rapport':
    case 'rapportTravers': {
      const k = read(q.k);
      const claim = {
        kind: 'fraction',
        a: nat(k.n),
        b: nat(k.d),
        p: typedWhole(v.n),
        q: typedWhole(v.d),
        reduced: false,
      };
      return q.kind === 'rapportTravers' ? { key: q.key, point: 'P2', claim } : { key: q.key, claim };
    }
    case 'longueur':
      return { key: q.key, claim: crossClaim(q.f, q.sol, v.x) };
    case 'travers':
    case 'emboite': {
      const w = typedNumber(v.w);
      if (w == null || !equal(w, q.f[q.side])) {
        const claim =
          q.kind === 'travers'
            ? opClaim('-', q.f[q.whole], q.f[q.part], v.w)
            : opClaim('+', q.f[q.part], q.f[q.piece], v.w);
        return { key: q.key, point: 'P2', claim };
      }
      return { key: q.key, claim: crossClaim(q.f, q.sol, v.x) };
    }
    default:
      return null;
  }
}
