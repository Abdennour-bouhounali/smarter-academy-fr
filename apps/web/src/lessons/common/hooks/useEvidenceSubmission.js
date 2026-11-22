import { useCallback, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { submitLearningEvidence } from '../../../services/learningEvidenceService';
import { enqueueEvidence, flushEvidenceQueue } from '../evidenceQueue';
import { isAssessedQuestion, buildEvidencePayload } from '../evidencePayload';
import { useLearningViewer } from '../../../features/learning/learningViewer';

/**
 * The smallest possible bridge between a lesson question and the backend's
 * learning-evidence endpoint. Call submitEvidence at the exact point the
 * student's answer is fixed (the final test's single submit) — no new state
 * machine, and it NEVER throws or blocks the lesson: a failed submission is
 * parked in the offline queue and retried later.
 *
 * Mastery V2 : the payload is `{questionCode, attemptId, answer: {picked}}`
 * (see evidencePayload.js). Correctness, learning points and difficulty are
 * the SERVER's — the client no longer sends `isCorrect` or
 * `learningPointCodes`. An unanswered question is sent with `picked: null`
 * so the server records it as `abandoned`.
 *
 * Only questions whose metadata is `assessment: {enabled: true, type:
 * 'assessment', learningPointIds: [...]}` generate evidence. The type check
 * is deliberate defense in depth on top of `enabled` — a discovery or
 * practice question can never produce authoritative mastery evidence even if
 * misconfigured (the server rejects non-'assessment' types too).
 *
 * Anonymous visitors (no token) produce no evidence at all — mastery
 * tracking is an account-level concept.
 */
export function useEvidenceSubmission(lessonCode) {
  const { token: authToken, user } = useContext(AuthContext);
  // Une preuve d'apprentissage est celle d'un ÉLÈVE : pour un enseignant qui
  // répond à une question en préparant son cours, le jeton est traité comme
  // absent — rien ne part, rien n'est mis en file (learningViewer).
  const { tracksProgress } = useLearningViewer();
  const token = tracksProgress ? authToken : null;

  // Flush anything a previous offline session left behind — on mount (which
  // includes login, since the lesson tree remounts with a token) and whenever
  // connectivity returns. Gated on `user`, not just `token`: the offline
  // queue is per-student scoped storage, which needs the current user id
  // resolved (see AuthContext/authUserId.js) before it can be read safely.
  // `user?.id` : la revalidation de `/auth/me` remplace l'objet du compte sans
  // changer d'élève — pas de nouveau vidage pour autant.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!token || userId == null) return undefined;

    flushEvidenceQueue(token);
    const onOnline = () => flushEvidenceQueue(token);
    window.addEventListener('online', onOnline);

    return () => window.removeEventListener('online', onOnline);
  }, [token, userId]);

  /**
   * @param {{id: string, assessment?: {enabled: boolean, type: string, learningPointIds: string[]}}} question
   * @param {{picked: number|null}|number|null} answer - the picked option index, `null` when unanswered
   */
  const submitEvidence = useCallback(
    (question, answer = null) => {
      if (!token || !isAssessedQuestion(question)) return;

      const evidence = buildEvidencePayload(question, answer);

      submitLearningEvidence(token, lessonCode, evidence).catch(() => {
        // Never surface this to the student — park it for a later flush.
        enqueueEvidence({ lessonCode, evidence });
      });
    },
    [token, lessonCode]
  );

  return { submitEvidence };
}
