import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MotionConfig } from 'framer-motion';
import { AuthContext } from '../../../context/AuthContext';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import {
  fetchTodayChallenge, startChallenge, openNextQuestion, submitChallengeAnswer, completeChallenge,
} from '../../../services/dailyChallengeService';
import ChallengeIntro from '../../../features/dailyChallenge/components/ChallengeIntro';
import ChallengeQuestion from '../../../features/dailyChallenge/components/ChallengeQuestion';
import ChallengeComplete from '../../../features/dailyChallenge/components/ChallengeComplete';
import { reasonKey } from '../../../features/dailyChallenge/challengeModel';

/**
 * « التحدّي اليومي » — une page, trois moments : l'intro, la séance, la fin.
 *
 * Le SERVEUR tient l'état : la tentative, la question ouverte et l'instant
 * où elle a été servie. Recharger la page, changer d'onglet, perdre le
 * réseau un moment : on revient exactement où l'on était, chronomètre
 * compris (POST …/next renvoie la même question tant qu'elle n'a pas de
 * réponse). Le navigateur ne garde rien.
 */
export default function DailyChallengePage() {
  const { t } = useTranslation('challenge');
  useDocumentMeta(t('meta.title'), t('meta.description'));
  const { token } = useContext(AuthContext);

  const [phase, setPhase] = useState('loading'); // loading | intro | session | complete | error
  const [today, setToday] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answered, setAnswered] = useState([]);
  const [current, setCurrent] = useState(null);
  const [value, setValue] = useState(null);
  const [result, setResult] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const errorText = (e) => t(`reasons.${reasonKey(e?.reason)}`);

  const load = useCallback(async () => {
    setPhase('loading');
    try {
      const data = await fetchTodayChallenge(token);
      setToday(data);
      setPhase('intro');
    } catch (e) {
      setError(errorText(e));
      setPhase('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  useEffect(() => { if (token) load(); }, [token, load]);

  const showCompletion = useCallback(async (id) => {
    const data = await completeChallenge(token, id);
    setCompletion(data.completion);
    setPhase('complete');
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  }, [token]);

  const openNext = useCallback(async (id) => {
    const data = await openNextQuestion(token, id);
    if (!data.question) {
      await showCompletion(id);
      return;
    }
    setCurrent({ ...data.question, receivedAt: Date.now() });
    setValue(null);
    setResult(null);
    setPhase('session');
  }, [token, showCompletion]);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const state = await startChallenge(token);
      setAttemptId(state.attempt.id);
      setAnswered(state.answered ?? []);
      if (state.attempt.status !== 'in_progress') {
        await showCompletion(state.attempt.id);
      } else if (state.current) {
        setCurrent({ ...state.current, receivedAt: Date.now() });
        setPhase('session');
      } else {
        await openNext(state.attempt.id);
      }
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await submitChallengeAnswer(token, attemptId, current.position, value);
      setResult(data.answer);
      setAnswered((list) => [...list.filter((a) => a.position !== data.answer.position), data.answer]);
      if (data.completion) setCompletion(data.completion);
    } catch (e) {
      if (e?.reason === 'expired' || e?.reason === 'finished') {
        await showCompletion(attemptId).catch(() => setError(errorText(e)));
      } else {
        setError(errorText(e));
      }
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    if (completion) {
      setPhase('complete');
      window.scrollTo?.({ top: 0, behavior: 'smooth' });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await openNext(attemptId);
    } catch (e) {
      if (e?.reason === 'expired' || e?.reason === 'finished') await showCompletion(attemptId).catch(() => {});
      else setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const seeResult = async () => {
    setBusy(true);
    try { await showCompletion(today.attempt.id); } catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="sa-surface-plain sa-page sa-page--flush py-6 sm:py-8" data-daily-challenge-page data-phase={phase}>
        {phase === 'loading' && (
          <div className="grid min-h-[40vh] place-items-center" role="status">
            <p className="font-inter text-sm text-slate-500">{t('loading')}</p>
          </div>
        )}
        {phase === 'error' && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center">
            <p className="text-sm text-rose-800">{error}</p>
            <button type="button" onClick={load} className="mt-3 min-h-[44px] rounded-xl bg-white px-4 text-sm font-bold text-rose-800 ring-1 ring-rose-200">↻</button>
          </div>
        )}
        {phase === 'intro' && today && (
          <>
            <ChallengeIntro today={today} onStart={start} onSeeResult={seeResult} busy={busy} />
            {error && <p role="alert" className="mt-3 rounded-2xl bg-rose-50 p-3 text-center text-sm text-rose-800">{error}</p>}
          </>
        )}
        {phase === 'session' && current && (
          <ChallengeQuestion
            current={current}
            answered={answered}
            value={value}
            onChange={setValue}
            onSubmit={submit}
            onNext={next}
            result={result}
            busy={busy}
            error={error}
            isLast={Boolean(completion) || current.position >= current.total}
          />
        )}
        {phase === 'complete' && completion && <ChallengeComplete completion={completion} />}
      </div>
    </MotionConfig>
  );
}
