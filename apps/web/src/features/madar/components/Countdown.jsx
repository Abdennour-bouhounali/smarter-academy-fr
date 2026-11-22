import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Hand, Keyboard } from 'lucide-react';

/**
 * 3 · 2 · 1 · انطلق! — et, la première fois seulement, le geste à faire
 * (un anneau qui pulse sous le vaisseau et UNE phrase). Le coach se range
 * au premier changement d'orbite et ne revient plus sur cet appareil.
 */
export function Countdown({ onDone }) {
  const { t } = useTranslation('madar');
  const reduce = useReducedMotion();
  const [n, setN] = useState(3);
  useEffect(() => {
    if (n < 0) {
      onDone();
      return undefined;
    }
    const id = setTimeout(() => setN((x) => x - 1), n === 0 ? 450 : 600);
    return () => clearTimeout(id);
  }, [n, onDone]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center" aria-live="assertive">
      <AnimatePresence mode="popLayout">
        {n >= 0 && (
          <motion.p
            key={n}
            initial={reduce ? false : { scale: 2.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? undefined : { scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="font-space text-8xl font-black text-white drop-shadow-[0_6px_30px_rgba(251,191,36,0.6)]"
            dir="ltr"
          >
            {n === 0 ? t('countdown.go') : n}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const coachKey = (game) => (game === 'orbit' ? 'madar.coached' : `madar.coached.${game}`);

export function hasBeenCoached(game = 'orbit') {
  try {
    return window.localStorage.getItem(coachKey(game)) === '1';
  } catch {
    return false;
  }
}

export function markCoached(game = 'orbit') {
  try {
    window.localStorage.setItem(coachKey(game), '1');
  } catch {
    // Stockage indisponible : le coach reviendra, sans gravité.
  }
}

export function Coach({ game = 'orbit' }) {
  const { t } = useTranslation('madar');
  const k = game === 'defense' ? 'defense.coach' : game === 'explorer' ? 'explorer.coach' : game === 'sniper' ? 'sniper.coach' : game === 'odd' ? 'odd.coach' : game === 'mental' ? 'mental.coach' : 'coach';
  const reduce = useReducedMotion();
  // « قنّاص القيم » : la cible occupe le haut de l'écran ; le coach se place sous le champ.
  const place = game === 'sniper'
    ? 'bottom-[14%] lg:bottom-auto lg:top-1/2'
    : 'top-[13%] lg:top-1/2';
  return (
    <div className={`pointer-events-none absolute inset-x-0 z-20 flex flex-col items-center gap-3 px-4 lg:inset-x-auto lg:end-10 lg:w-80 lg:-translate-y-1/2 ${place}`} data-madar-coach>
      <motion.span
        className="grid h-16 w-16 place-items-center rounded-full ring-4 ring-amber-300/80"
        animate={reduce ? undefined : { scale: [1, 1.18, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.1, repeat: Infinity }}
        aria-hidden="true"
      >
        <Hand size={28} className="text-amber-200" />
      </motion.span>
      <div className="max-w-sm rounded-2xl bg-slate-950/80 px-4 py-3 text-center ring-1 ring-amber-300/40 backdrop-blur" role="status">
        <p className="font-space text-base font-black text-white">{t(`${k}.tap`)}</p>
        <p className="mt-0.5 font-inter text-sm text-white/75">{t(`${k}.goal`)}</p>
        <p className="mt-1 hidden items-center justify-center gap-1 font-inter text-xs text-white/55 sm:flex"><Keyboard size={13} aria-hidden="true" /> {t(`${k}.keys`)}</p>
      </div>
    </div>
  );
}
