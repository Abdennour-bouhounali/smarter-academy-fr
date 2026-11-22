import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { serverElapsed } from '../../dailyChallenge/challengeModel';
import { remainingMs, timerTone } from '../madarModel';

const TONES = {
  calm: { ring: '#34d399', text: 'text-emerald-700' },
  warn: { ring: '#f59e0b', text: 'text-amber-700' },
  danger: { ring: '#ef4444', text: 'text-rose-700' },
};

/**
 * Le chronomètre d'une question de la « محطة التزوّد » : un anneau qui se
 * vide, les secondes au centre. L'horloge est celle du SERVEUR (servedAt +
 * serverNow corrigent l'heure du téléphone) ; à zéro, `onExpire` — la page
 * envoie ce que l'élève a écrit, et le serveur tranche « hors délai ».
 * Figé (`frozen`) une fois la question répondue.
 */
export default function RefuelTimer({ servedAt, serverNow, receivedAt, timeLimitS, frozen = false, onExpire }) {
  const { t } = useTranslation('madar');
  const reduce = useReducedMotion();
  const elapsed = useMemo(() => serverElapsed(servedAt, serverNow, receivedAt), [servedAt, serverNow, receivedAt]);
  const total = timeLimitS * 1000;
  const [left, setLeft] = useState(() => remainingMs(timeLimitS, elapsed(Date.now())));
  const fired = useRef(false);
  const expire = useRef(onExpire);
  expire.current = onExpire;

  useEffect(() => {
    fired.current = false;
  }, [servedAt]);

  useEffect(() => {
    if (frozen) return undefined;
    const tick = () => {
      const next = remainingMs(timeLimitS, elapsed(Date.now()));
      setLeft(next);
      if (next <= 0 && !fired.current) {
        fired.current = true;
        expire.current?.();
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [elapsed, timeLimitS, frozen]);

  const tone = TONES[timerTone(left, total)];
  const seconds = Math.ceil(left / 1000);
  const r = 22;
  const c = 2 * Math.PI * r;
  const ratio = total > 0 ? left / total : 0;
  const label = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className={`relative grid h-14 w-14 shrink-0 place-items-center ${!reduce && seconds <= 10 && seconds > 0 && !frozen ? 'animate-pulse' : ''}`}
      role="timer" aria-label={t('refuel.timerLabel', { seconds })} data-refuel-timer={seconds}>
      <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={tone.ring} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - ratio)} style={{ transition: reduce ? 'none' : 'stroke-dashoffset 250ms linear' }} />
      </svg>
      <span className={`font-space text-sm font-black tabular-nums ${tone.text}`} dir="ltr">{label}</span>
    </div>
  );
}
