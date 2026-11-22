import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { formatClock, serverElapsed } from '../challengeModel';

/**
 * Le chronomètre de la question — celui du SERVEUR (`startedAt`), recalé
 * sur l'horloge du téléphone. Calme : pas de dixièmes, pas de rouge, pas de
 * compte à rebours ; il s'arrête sur le temps enregistré dès la réponse.
 * `aria-live` coupé : un lecteur d'écran n'annonce pas chaque seconde.
 */
export default function ChallengeTimer({ startedAt, serverNow, receivedAt, frozenMs = null }) {
  const { t } = useTranslation('challenge');
  const elapsed = useMemo(() => serverElapsed(startedAt, serverNow, receivedAt), [startedAt, serverNow, receivedAt]);
  const [ms, setMs] = useState(() => (frozenMs ?? elapsed(Date.now())));

  useEffect(() => {
    if (frozenMs !== null) {
      setMs(frozenMs);
      return undefined;
    }
    setMs(elapsed(Date.now()));
    const id = window.setInterval(() => setMs(elapsed(Date.now())), 1000);
    return () => window.clearInterval(id);
  }, [elapsed, frozenMs]);

  const text = formatClock(ms);

  return (
    <span role="timer" aria-live="off" aria-label={t('session.timerLabel', { time: text })}
      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-mono-jetbrains text-sm text-slate-700" data-timer>
      <Clock size={14} aria-hidden="true" className="text-slate-500" />
      <span dir="ltr" className="tabular-nums">{text}</span>
    </span>
  );
}
