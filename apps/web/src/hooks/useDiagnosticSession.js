import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchCurrentDiagnostic, startDiagnostic, submitDiagnosticResponse } from '../services/diagnosticService';

/**
 * Owns the data/API side of a diagnostic session — never the flow (phase,
 * transitions, navigation), which stays in the page component so this hook
 * is reusable by both the read-only intro peek (autoStart: false) and the
 * live run screen (autoStart: true).
 *
 * With autoStart: true, landing directly on the run screen (deep link,
 * resume, refresh) always ends up with a session + a question — the same
 * idempotent start-or-resume the backend already guarantees.
 */
export function useDiagnosticSession(grade, { autoStart = false } = {}) {
  const { token } = useContext(AuthContext);
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // "Latest request wins": React 18 StrictMode double-invokes effects in
  // dev (mount → cleanup → mount again) with no automatic request
  // cancellation, so two overlapping load() calls are a real scenario, not
  // just a dev artifact — the same shape of race a real slow-network
  // reconnect could trigger. Only the most recently *started* call is
  // allowed to commit state; a superseded one's result is discarded even
  // if it resolves later.
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    if (!token || !grade) {
      setLoading(false);
      return;
    }
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError('');
    try {
      let data = await fetchCurrentDiagnostic(token, grade);
      if (!data.session && autoStart) {
        data = await startDiagnostic(token, grade);
      }
      if (requestIdRef.current !== requestId) return;
      setSession(data.session);
      setQuestion(data.question);
      setProfile(data.session?.profile ?? null);
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setError(err.message);
    } finally {
      if (requestIdRef.current === requestId) setLoading(false);
    }
  }, [token, grade, autoStart]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * @returns {Promise<{isCorrect: boolean, completed: boolean, nextQuestion: object|null, profile: object|null}>}
   */
  const submitAnswer = useCallback(
    async (answer) => {
      if (!session || !question) return null;
      const result = await submitDiagnosticResponse(token, session.id, { questionId: question.id, answer });

      if (result.completed) {
        setProfile(result.profile);
        setSession((s) => (s ? { ...s, status: 'completed', profile: result.profile } : s));
        // question is deliberately left as-is (not nulled): the page still
        // needs to render the just-answered question, disabled, under the
        // completion feedback/"Voir mon profil" moment — it only stops
        // mattering once the page navigates away.
      }

      return result;
    },
    [session, question, token]
  );

  const advanceTo = useCallback((nextQuestion) => {
    setQuestion(nextQuestion);
  }, []);

  return { session, question, profile, loading, error, submitAnswer, advanceTo, reload: load };
}
