import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Gem, Pause, Volume2, VolumeX } from 'lucide-react';
import { PLANET_HEALTH } from '../defense/constants';
import { waveInfo } from '../defense/render';
import { formatScore } from '../madarModel';
import HeartsRow from './HeartsRow';

/**
 * L'affichage de « دفاع الكوكب » : le score, la vague et le temps avant la
 * suivante, les cristaux (la monnaie des tourelles), la santé de la planète,
 * les cœurs ; une bannière à chaque vague (avec « زعيم! » quand un boss vient).
 * Il lit `statsRef` à son propre rythme et ne re-rend que si une valeur change.
 */
export default function DefenseHud({ statsRef, hearts, maxHearts, muted, onToggleMute, onPause }) {
  const { t } = useTranslation('madar');
  const reduce = useReducedMotion();
  const [s, setS] = useState({ score: 0, wave: 0, health: PLANET_HEALTH, crystals: 0, nextIn: 0 });
  const [banner, setBanner] = useState(null);
  const waveRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = requestAnimationFrame(read);
      const v = statsRef.current;
      if (!v) return;
      const nextIn = Math.ceil(v.nextIn);
      setS((cur) => (cur.score === v.score && cur.wave === v.wave && cur.health === v.health && cur.crystals === v.crystals && cur.nextIn === nextIn
        ? cur : { score: v.score, wave: v.wave, health: v.health, crystals: v.crystals, nextIn }));
      if (v.wave > waveRef.current) {
        waveRef.current = v.wave;
        setBanner({ wave: v.wave, ...waveInfo(v.wave) });
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
  const ratio = s.health / PLANET_HEALTH;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pt-[max(10px,env(safe-area-inset-top))] sm:px-6" data-madar-hud="defense">
      <div className="flex items-start justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-2">
          <button type="button" onClick={onPause} className={iconBtn} aria-label={t('hud.pause')} data-action="pause"><Pause size={20} aria-hidden="true" /></button>
          <button type="button" onClick={onToggleMute} className={iconBtn} aria-label={muted ? t('sound.unmute') : t('sound.mute')} aria-pressed={muted}>
            {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
          </button>
        </div>
        <div className="flex flex-col items-center">
          <p className="font-space text-3xl font-black tabular-nums text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-4xl" dir="ltr" data-score={s.score}>{formatScore(s.score)}</p>
          <p className="whitespace-nowrap font-inter text-xs font-semibold text-white/75 sm:text-sm" data-wave={s.wave}>
            {s.wave > 0 ? t('defense.hud.wave', { n: s.wave }) : t('defense.hud.ready')}
            <span className="text-white/50"> · {t('defense.hud.next', { s: s.nextIn })}</span>
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur"><HeartsRow hearts={hearts} max={maxHearts} size={16} /></div>
      </div>

      <div className="mx-auto mt-2 flex max-w-md items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/15 px-3 py-1 font-space text-base font-black text-cyan-100 ring-1 ring-cyan-300/30" data-crystals={s.crystals}>
          <Gem size={15} aria-hidden="true" /> <span dir="ltr">{s.crystals}</span>
          <span className="sr-only">{t('defense.hud.crystals')}</span>
        </span>
        <div className="flex-1" role="meter" aria-valuemin={0} aria-valuemax={PLANET_HEALTH} aria-valuenow={s.health} aria-label={t('defense.hud.health')}>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
            <div className={`h-full rounded-full transition-all ${ratio > 0.5 ? 'bg-emerald-400' : ratio > 0.25 ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${ratio * 100}%` }} />
          </div>
        </div>
        <span className="font-space text-xs font-bold text-white/70" dir="ltr">{s.health}/{PLANET_HEALTH}</span>
      </div>

      <AnimatePresence>
        {banner && (
          <motion.div key={banner.wave} initial={reduce ? false : { opacity: 0, y: -12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
            className="mx-auto mt-4 w-fit rounded-2xl bg-black/45 px-5 py-2 text-center ring-1 ring-white/15 backdrop-blur" role="status">
            <p className="font-space text-xl font-black text-white">{t('defense.hud.wave', { n: banner.wave })}</p>
            <p className="font-inter text-xs text-white/75">
              {t('defense.hud.enemies', { n: banner.enemies })}{banner.boss && <span className="ms-1 font-bold text-rose-300">· {t('defense.hud.boss')}</span>}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
