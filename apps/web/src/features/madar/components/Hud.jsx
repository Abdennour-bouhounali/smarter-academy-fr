import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Pause, Shield, Volume2, VolumeX } from 'lucide-react';
import { sectorAt } from '../engine/constants';
import { formatScore } from '../madarModel';
import HeartsRow from './HeartsRow';

/**
 * L'affichage tête haute : le score au centre (gros, chiffres stables), le
 * multiplicateur quand une série d'étoiles le fait monter, les cœurs, le
 * bouclier, et la bannière du secteur (la planète) quand on en change.
 *
 * Il lit `statsRef` à son propre rythme (requestAnimationFrame) et ne se
 * re-rend que si une valeur affichée change : la page, elle, reste immobile.
 */
export default function Hud({ statsRef, hearts, maxHearts, muted, onToggleMute, onPause }) {
  const { t } = useTranslation('madar');
  const reduce = useReducedMotion();
  const [stats, setStats] = useState({ score: 0, multiplier: 1, sector: 0, shield: false });
  const [banner, setBanner] = useState(null);
  const sectorRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = requestAnimationFrame(read);
      const s = statsRef.current;
      if (!s) return;
      setStats((cur) => (cur.score === s.score && cur.multiplier === s.multiplier && cur.sector === s.sector && cur.shield === s.shield
        ? cur
        : { score: s.score, multiplier: s.multiplier, sector: s.sector, shield: s.shield }));
      if (s.sector > sectorRef.current) {
        sectorRef.current = s.sector;
        setBanner({ n: s.sector + 1, id: sectorAt(s.sector).id, key: s.sector });
      }
    };
    raf = requestAnimationFrame(read);
    return () => cancelAnimationFrame(raf);
  }, [statsRef]);

  useEffect(() => {
    if (!banner) return undefined;
    const id = setTimeout(() => setBanner(null), 2200);
    return () => clearTimeout(id);
  }, [banner]);

  const iconBtn = 'grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60';

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-[max(12px,env(safe-area-inset-top))] sm:px-6" data-madar-hud>
      <div className="flex items-start justify-between gap-3">
        <div className="pointer-events-auto flex items-center gap-2">
          <button type="button" onClick={onPause} className={iconBtn} aria-label={t('hud.pause')} data-action="pause">
            <Pause size={20} aria-hidden="true" />
          </button>
          <button type="button" onClick={onToggleMute} className={iconBtn} aria-label={muted ? t('sound.unmute') : t('sound.mute')} aria-pressed={muted}>
            {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
          </button>
        </div>

        <div className="flex flex-col items-center">
          <p className="sr-only">{t('hud.score')}</p>
          <p className="font-space text-4xl font-black tabular-nums tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-5xl" dir="ltr" data-score={stats.score}>
            {formatScore(stats.score)}
          </p>
          <AnimatePresence>
            {stats.multiplier > 1 && (
              <motion.span
                key={stats.multiplier}
                initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className="mt-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 px-3 py-0.5 font-space text-sm font-black text-white shadow-lg shadow-fuchsia-500/30"
                dir="ltr"
              >
                ×{stats.multiplier}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="rounded-2xl bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur">
            <HeartsRow hearts={hearts} max={maxHearts} size={18} />
          </div>
          {stats.shield && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/20 px-2.5 py-1 font-inter text-xs font-bold text-cyan-100 ring-1 ring-cyan-300/40">
              <Shield size={14} aria-hidden="true" /> {t('hud.shield')}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {banner && (
          <motion.div
            key={banner.key}
            initial={reduce ? false : { opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-6 w-fit rounded-2xl bg-black/40 px-5 py-2 text-center ring-1 ring-white/15 backdrop-blur"
            role="status"
          >
            <p className="font-inter text-xs font-semibold text-white/70">{t('hud.sector', { n: banner.n })}</p>
            <p className="font-space text-xl font-black text-white">{t(`sectors.${banner.id}`)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
