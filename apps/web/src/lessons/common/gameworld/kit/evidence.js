/**
 * WHICH GAME ANSWERS COUNT TOWARD « savoir-faire » (owner decision, 2026-11-15) — PURE, and it names no lesson.
 * Only an answer that looks like an exam answer is evidence: written format, FIRST try, in paper mode, with no help opened
 * before it (no rule reminder, no model sheet). Right or wrong, the first try is what is reported — later tries, the gate
 * dash, the story and every game-format question count for nothing. The SERVER re-computes the result from the numbers
 * (`claim`): the browser's own verdict is never trusted.
 *
 * The lesson gives (`createEvidence`): its grade and, per key (rule), the code of the savoir-faire it proves. It keeps for
 * itself WHICH claim each of its answers makes; how a claim is verified is the kit's (`claims.js`), the same rule as the
 * server's.
 */
import { verifyClaim } from './claims';

/** Does this answer count? ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before it. */
export const counts = (ctx) => Boolean(ctx?.firstTry) && !ctx.helped;

/**
 * The kit's SAFETY NET on a trainer answer (Trainer.jsx): the lesson's `check` says the answer is NOT right, yet the claim
 * its evidence built would verify TRUE — the claim covers only part of the answer. It is not sent (a wrong answer is never
 * credited), and development says so: the lesson's `world/evidence.js` must claim the whole answer.
 */
export function guardEvidence(ev, ok) {
  if (!ev || ok || !verifyClaim(ev.claim)) return ev;
  if (import.meta.env.DEV) console.warn('[evidence] a wrong answer made a TRUE claim — not sent:', ev);
  return null;
}

export function createEvidence({ grade, points }) {
  /** The id of the savoir-faire a key proves, as the catalogue writes it — or null for a key that proves none. */
  const learningPointOf = (lessonId, key) => (points[key] ? `${grade}_${lessonId}_${points[key]}` : null);

  /** What is sent to the server for one answer that counts: POST /lessons/{lesson}/game-evidence (GameEvidenceController). */
  function payloadOf(lessonId, context, ev, attemptId) {
    const learningPoint = ev && learningPointOf(lessonId, ev.key);
    return learningPoint ? { attemptId, learningPoint, context, claim: ev.claim } : null;
  }

  return { learningPointOf, payloadOf, verify: verifyClaim };
}
