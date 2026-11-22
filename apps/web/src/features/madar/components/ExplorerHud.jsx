import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Gem, Pause, Shield, Volume2, VolumeX } from 'lucide-react';
import { formatScore } from '../madarModel';
import HeartsRow from './HeartsRow';

/**
 * L'affichage de « المستكشف » : le niveau, le score, les cristaux (x / total —
 * la 2e étoile), le chrono (rouge dans les 15 dernières secondes), la
 * progression vers la fusée, le bouclier, les cœurs.
 */
export default function ExplorerHud({ statsRef, hearts, maxHearts, muted, onToggleMute, onPause }) {
  const { t } = useTranslation('madar');
  const [s, setS] = useState(null);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = requestAnimationFrame(read);
      const v = statsRef.current;
      if (!v) return;
      const time = Math.ceil(v.timeLeft);
      const progress = Math.round(v.progress * 100);
      setS((cur) => (cur && cur.score === v.score && cur.crystals === v.crystals && cur.time === time && cur.progress === progress && cur.shield === v.shield
        ? cur : { score: v.score, crystals: v.crystals, total: v.totalCrystals, time, progress, shield: v.shield, level: v.level, world: v.world }));
    };
    raf = requestAnimationFrame(read);
    return () => cancelAnimationFrame(raf);
  }, [statsRef]);

  const iconBtn = 'grid h-11 w-11 place-items-center rounded-2xl bg-black/30 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-black/45 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60';
  if (!s) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pt-[max(8px,env(safe-area-inset-top))] sm:px-6" data-madar-hud="explorer">
      <div className="flex items-start justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-2">
          <button type="button" onClick={onPause} className={iconBtn} aria-label={t('hud.pause')} data-action="pause"><Pause size={20} aria-hidden="true" /></button>
          <button type="button" onClick={onToggleMute} className={iconBtn} aria-label={muted ? t('sound.unmute') : t('sound.mute')} aria-pressed={muted}>
            {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
          </button>
        </div>
        <div className="flex flex-col items-center">
          <p className="whitespace-nowrap font-inter text-xs font-semibold text-white/80">{t('explorer.levelName', { n: s.level })} · {t(`explorer.worlds.${s.world}`)}</p>
          <p className="font-space text-3xl font-black tabular-nums text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]" dir="ltr">{formatScore(s.score)}</p>
        </div>
        <div className="rounded-2xl bg-black/30 px-2.5 py-2 ring-1 ring-white/20 backdrop-blur"><HeartsRow hearts={hearts} max={maxHearts} size={16} /></div>
      </div>
      <div className="mx-auto mt-1.5 flex max-w-lg items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/20 px-2.5 py-1 font-space text-sm font-black text-cyan-50 ring-1 ring-cyan-300/30" dir="ltr" data-crystals={s.crystals}>
          <Gem size={14} aria-hidden="true" /> {s.crystals}/{s.total}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.progress} aria-label={t('explorer.progress')}>
          {/* Le niveau avance vers la gauche : la barre se remplit depuis la droite (début en RTL). */}
          <div className="h-full rounded-full bg-gradient-to-l from-amber-300 to-orange-500 transition-all" style={{ width: `${s.progress}%` }} />
        </div>
        {s.shield && <Shield size={18} className="text-cyan-200" aria-label={t('hud.shield')} />}
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-space text-sm font-black ring-1 ${s.time <= 15 ? 'bg-rose-500/30 text-rose-50 ring-rose-300/40' : 'bg-black/30 text-white ring-white/20'}`} dir="ltr">
          <Clock size={14} aria-hidden="true" /> {s.time}
        </span>
      </div>
    </div>
  );
}
