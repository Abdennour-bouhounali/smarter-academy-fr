import { useCallback, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { submitLearningEvidence } from '../../../services/learningEvidenceService';
import { enqueueEvidence, flushEvidenceQueue } from '../evidenceQueue';

/**
 * The smallest possible bridge between a lesson question and the backend's
 * learning-evidence endpoint. Call submitEvidence at the exact point the
 * module already knows correctness (its existing validate handler) — no new
 * state machine, and it NEVER throws or blocks the lesson: a failed
 * submission is parked in the offline queue and retried later.
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
  const { token } = useContext(AuthContext);

  // Flush anything a previous offline session left behind — on mount (which
  // includes login, since the lesson tree remounts with a token) and whenever
  // connectivity returns.
  useEffect(() => {
    if (!token) return undefined;

    flushEvidenceQueue(token);
    const onOnline = () => flushEvidenceQueue(token);
    window.addEventListener('online', onOnline);

    return () => window.removeEventListener('online', onOnline);
  }, [token]);

  /**
   * @param {{id: string, assessment?: {enabled: boolean, type: string, learningPointIds: string[]}}} question
   * @param {boolean} isCorrect
   * @param {object|null} [answer] - optional raw answer payload for the audit trail
   */
  const submitEvidence = useCallback(
    (question, isCorrect, answer = null) => {
      const meta = question?.assessment;
      if (!token || !meta?.enabled || meta.type !== 'assessment' || !meta.learningPointIds?.length) {
        return;
      }

      const evidence = {
        questionCode: question.id,
        attemptId: crypto.randomUUID(),
        isCorrect,
        learningPointCodes: meta.learningPointIds,
        answer,
      };

      submitLearningEvidence(token, lessonCode, evidence).catch(() => {
        // Never surface this to the student — park it for a later flush.
        enqueueEvidence({ lessonCode, evidence });
      });
    },
    [token, lessonCode]
  );

  return { submitEvidence };
}
