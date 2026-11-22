import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MotionConfig } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { effectsEnabledNow, playSfx } from '../../../lessons/common/utils/playEffect';
import { playMedal } from '../../../features/practice/medals/medalSound';
import {
  fetchChallenge, fetchReplay, openKey, postponeChallenge, submitAttempt,
} from '../../../services/thinkingLabService';
import Workspace from '../../../features/thinkingLab/workspace/Workspace';
import AfterSolve from '../../../features/thinkingLab/replay/AfterSolve';
import { errorKey } from '../../../features/thinkingLab/thinkingModel';

/**
 * « مختبر التفكير » — un défi : l'espace de travail (écran 2), puis, porte franchie, la relecture
 * (écran 3). Le SERVEUR tient l'état ; recharger la page revient exactement où l'on était.
 * Un défi résolu ou appris ouvre directement sa relecture.
 */
export default function ThinkingChallengePage() {
  const { t } = useTranslation('thinking');
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [challenge, setChallenge] = useState(null);
  const [replay, setReplay] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fatal, setFatal] = useState(null);
  const [busy, setBusy] = useState(false);
  useDocumentMeta(challenge ? t('meta.challengeTitle', { number: challenge.number }) : t('meta.title'), t('meta.description'));

  const say = (e) => t(`errors.${errorKey(e?.reason)}`, { maxOpen: 3 });

  const openReplay = useCallback(async () => {
    try {
      const data = await fetchReplay(token, challengeId);
      setReplay(data.replay);
      window.scrollTo?.({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(say(e));
    }
  }, [token, challengeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async () => {
    setChallenge(null);
    setReplay(null);
    setResult(null);
    setFatal(null);
    try {
      const data = await fetchChallenge(token, challengeId);
      setChallenge(data.challenge);
      if (['solved', 'learned'].includes(data.challenge.state.status)) await openReplay();
    } catch (e) {
      setFatal(say(e));
    }
  }, [token, challengeId, openReplay]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (token) load(); }, [token, load]);

  const submit = async (answer, draft) => {
    setBusy(true);
    setError(null);
    try {
      const data = await submitAttempt(token, challengeId, answer, draft);
      setResult(data);
      setChallenge(data.challenge);
      if (data.attempt.correct) {
        playMedal('gold', effectsEnabledNow());
        await openReplay();
      } else if (data.attempt.reason !== 'syntax') {
        playSfx('notyet');
      }
      return data;
    } catch (e) {
      setError(say(e));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const key = async (k) => {
    setBusy(true);
    try {
      const data = await openKey(token, challengeId, k);
      setChallenge(data.challenge);
      playSfx('lock');
    } catch (e) {
      setError(say(e));
    } finally {
      setBusy(false);
    }
  };

  const postpone = async () => {
    setBusy(true);
    try {
      await postponeChallenge(token, challengeId);
      navigate('/espace/tafkir');
    } catch (e) {
      setError(say(e));
      setBusy(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
        {fatal && (
          <div className="mx-auto mt-10 max-w-md space-y-3 text-center">
            <p role="alert" className="rounded-2xl bg-slate-100 px-4 py-3 font-inter text-sm text-slate-700">{fatal}</p>
            <Link to="/espace/tafkir" className="font-inter text-sm font-bold text-nav-accent hover:underline">{t('after.backToLadder')}</Link>
          </div>
        )}
        {!challenge && !fatal && <Loader2 className="mx-auto mt-16 animate-spin text-indigo-500" size={28} aria-label="…" />}
        {challenge && !replay && (
          <Workspace challenge={challenge} busy={busy} result={result} error={error}
            onSubmit={submit} onOpenKey={key} onPostpone={postpone} onOpenReplay={openReplay} />
        )}
        {replay && <AfterSolve key={replay.id} replay={replay} />}
      </div>
    </MotionConfig>
  );
}
