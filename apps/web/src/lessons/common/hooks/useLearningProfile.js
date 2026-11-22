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
 * Optional filters narrow the rollup server-side (Mastery V2) : a lesson
 * page passes `{lesson}`, a unit page `{unit}`; dashboards pass nothing and
 * receive the whole profile. The filters are read by value, so an inline
 * object literal does not refetch on every render.
 *
 * @param {{lesson?: string, unit?: string, grade?: string}} [filters]
 * @returns {{profile: {initialKnowledge: object[], currentMastery: object[]}|null,
 *            status: 'loading'|'anonymous'|'ready'|'error', reload: () => void}}
 */
export function useLearningProfile(filters) {
  const { token, loading: authLoading } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('loading');
  const lesson = filters?.lesson ?? null;
  const unit = filters?.unit ?? null;
  const grade = filters?.grade ?? null;

  const reload = useCallback(() => {
    if (authLoading) return;
    if (!token) {
      setStatus('anonymous');
      return;
    }
    setStatus('loading');
    fetchLearningProfile(token, { lesson, unit, grade })
      .then((p) => {
        setProfile(p);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [token, authLoading, lesson, unit, grade]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { profile, status, reload };
}
