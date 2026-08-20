import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { fetchLearningProfile } from '../../../services/learningEvidenceService';

/**
 * Fetches the student's real learning-profile rollup
 * (`GET /students/me/learning-profile`) — the only source of Learning Point
 * mastery. Anonymous visitors never fetch (mastery is an account-level
 * concept, same rule as useEvidenceSubmission); `status` distinguishes that
 * from "still loading" and "request failed" so a consumer never renders a
 * fabricated mastery state.
 *
 * @returns {{profile: {initialKnowledge: object[], currentMastery: object[]}|null,
 *            status: 'loading'|'anonymous'|'ready'|'error', reload: () => void}}
 */
export function useLearningProfile() {
  const { token, loading: authLoading } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('loading');

  const reload = useCallback(() => {
    if (authLoading) return;
    if (!token) {
      setStatus('anonymous');
      return;
    }
    setStatus('loading');
    fetchLearningProfile(token)
      .then((p) => {
        setProfile(p);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [token, authLoading]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { profile, status, reload };
}
