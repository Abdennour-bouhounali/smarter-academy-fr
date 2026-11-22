import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Timer, Check, AlarmClockOff } from 'lucide-react';
import { clockState, formatClock } from './examSheet';

/**
 * LE CHRONO D'UNE ÉTAPE (propriétaire, 2026-10-06 : « que l'élève sache s'il
 * l'a résolue dans le temps »). Il décompte le temps de l'étape
 * (`stepSeconds`) depuis son ouverture :
 *  - « ⏱ 02:45 » ; ambre dans le dernier cinquième ;
 *  - à zéro, « انتهى الوقت » puis le DÉPASSEMENT (+00:12) — il ne bloque
 *    jamais : on peut toujours répondre (invariant non bloquant) ;
 *  - réponse donnée (`stoppedSeconds`) : le bilan figé — dans le temps ✓, ou
 *    le dépassement.
 *
 * `startedAt` : horodatage (ms) de l'ouverture, conservé par le lecteur
 * (localStorage) pour survivre à un rechargement. Pas d'annonce vocale à
 * chaque seconde : `role="timer"` sans `aria-live`.
 */
export default function StepTimer({ limit, startedAt, stoppedSeconds = null }) {
  const { t } = useTranslation('student');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (stoppedSeconds !== null || !startedAt) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [stoppedSeconds, startedAt]);

  if (!startedAt && stoppedSeconds === null) return null;

  if (stoppedSeconds !== null) {
    const inTime = stoppedSeconds <= limit;
    return (
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 font-sans text-xs font-bold ${inTime ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-orange-50 text-orange-800 ring-1 ring-orange-200'}`}
        data-step-timer={inTime ? 'in-time' : 'late'}
      >
        {inTime ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <AlarmClockOff className="h-3.5 w-3.5" aria-hidden="true" />}
        {inTime
          ? t('practice.exam.timer.inTime', { used: formatClock(stoppedSeconds), limit: formatClock(limit) })
          : t('practice.exam.timer.late', { over: formatClock(stoppedSeconds - limit), limit: formatClock(limit) })}
      </span>
    );
  }

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const state = clockState(elapsed, limit);
  const style = {
    running: 'bg-slate-100 text-slate-800 ring-slate-200',
    warning: 'bg-amber-50 text-amber-900 ring-amber-300',
    over: 'bg-orange-100 text-orange-900 ring-orange-300',
  }[state];

  return (
    <span
      role="timer"
      aria-label={t('practice.exam.timer.label')}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 font-sans text-sm font-bold tabular-nums ring-1 ${style}`}
      data-step-timer={state}
    >
      <Timer className="h-4 w-4" aria-hidden="true" />
      {state === 'over'
        ? <>{t('practice.exam.timer.over')} <bdi dir="ltr">+{formatClock(elapsed - limit)}</bdi></>
        : <bdi dir="ltr">{formatClock(limit - elapsed)}</bdi>}
    </span>
  );
}
