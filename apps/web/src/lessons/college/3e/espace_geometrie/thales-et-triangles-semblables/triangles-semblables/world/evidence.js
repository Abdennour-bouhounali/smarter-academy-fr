/**
 * The EVIDENCE of lesson `triangles-semblables` — PURE. Which answers count (written format, first try, no help) and what
 * is sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`, the
 * same rule as the server's `ClaimVerifier.php`). Here: the savoir-faire each key proves, and the CLAIM each kind of trainer
 * answer makes.
 *
 * TWO KEYS, FOUR SAVOIR-FAIRE (design, « Bank, satellites »: P1 ← K1, P2 ← K2, P3 ← both last steps and the mission's
 * pairing, P4 ← K1's last step, the mission and the bank). `createEvidence` maps a key to ONE point: K1 is read as P1 and K2
 * as P2; P3 and P4 are carried by the ANSWERS that choose the pairing or compute the length — `homologue` (the side OPPOSITE
 * the equal angle: P3) and `longueur` (the side from the quotient: P4). Such an answer's evidence says `point`, and this
 * lesson's `payloadOf` sends it under that point (the kit's, otherwise: `LessonWorld.jsx` calls `lesson.evidence.payloadOf`).
 * NOT VERIFIED against the server: it must accept P3 and P4 for a key whose own point is P1 or P2.
 *
 * The claims, all of kinds that exist (`fraction`):
 *   `fraction`          his quotient p/q equals the quotient of the two triangles (`coef`, `homologue`: unreduced, any equal
 *                       writing is right);
 *   `fraction` op '*'   his length equals P × Q × 1/D — the cross product the server computes from the three known
 *                       lengths (`longueur`; a decimal length is a fraction: 7,5 = 15/2);
 *   `fraction` op '-'   his third angle equals 180 − (the two angles given) (`troisieme`).
 * THE RULE OF A CLAIM (defects.md A6): the claim is TRUE exactly when the lesson's `check` (world/trainer.js) accepts the
 * WHOLE answer. Never evidence: a tap, a true / false, the choice of a homologous side (`apparier`: no claim kind states a
 * pairing of names — REPORTED), a second try, an answer after help.
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { K, over, read, times, typedNumber, typedWhole } from './math';

/** The savoir-faire each key proves (the codes of the lesson's learning points) — see the header. */
export const POINTS = { [K.cotes]: 'P1', [K.angles]: 'P2' };
/** The savoir-faire proved by ANSWERS rather than by a key (read by scripts/validate-lessons.mjs, like POINTS). */
const ANSWER_POINTS = ['P3', 'P4'];
const base = createEvidence({ grade: '3e', points: POINTS });
/**
 * The evidence of this lesson: the kit's, but an answer that proves P3 or P4 (its evidence carries `point`) is sent under
 * that point. It has no real-world case: nothing is claimed from one.
 */
export const evidence = {
  ...base,
  payloadOf(lessonId, context, ev, attemptId) {
    if (!ANSWER_POINTS.includes(ev?.point)) return base.payloadOf(lessonId, context, ev, attemptId);
    return { attemptId, learningPoint: `3e_${lessonId}_${ev.point}`, context, claim: ev.claim };
  },
  caseEvidence: () => null,
  /**
   * The key whose LAST STEP teaches each answer-proved savoir-faire (`kit/bankSitting.js › keysOfPoints`): P4 — a length
   * from k — is K1's last step; P3 — the homologous vertices — K2's. A brevet sheet's steps on them count there.
   */
  answerKeys: { P4: K.cotes, P3: K.angles },
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

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  const v = value ?? {};
  switch (q.kind) {
    case 'coef':
    case 'homologue': {
      const k = read(q.k);
      const claim = {
        kind: 'fraction',
        a: nat(k.n),
        b: nat(k.d),
        p: typedWhole(v.n),
        q: typedWhole(v.d),
        reduced: false,
      };
      return q.kind === 'homologue' ? { key: q.key, point: 'P3', claim } : { key: q.key, claim };
    }
    case 'longueur':
      return { key: q.key, point: 'P4', claim: opClaim('*', times(q.P, q.Q), over('1', q.D), v.x) };
    case 'troisieme':
      return { key: q.key, claim: opClaim('-', '180', q.sum, v.x) };
    default:
      return null;
  }
}
