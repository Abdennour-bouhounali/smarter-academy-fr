import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Pause, Shield, TrendingDown, TrendingUp, Volume2, VolumeX } from 'lucide-react';
import { LIVES } from '../sniper/constants';
import { formatScore } from '../madarModel';
import MathTokens from './MathTokens';

/** La manche d'échauffement : on gagne d'abord, une faute ne coûte rien. */
export function WarmupChip() {
  const { t } = useTranslation('madar');
  return (
    <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-0.5 font-inter text-xs font-bold text-emerald-100 ring-1 ring-emerald-300/30" data-warmup>
      🔥 {t('sniper.hud.warmup')}
    </p>
  );
}

/** أ / ب / ج — le sous-niveau. */
export const SUB_LETTERS = ['أ', 'ب', 'ج'];

/**
 * L'affichage de « قنّاص القيم » : la CIBLE au centre, sur une carte blanche
 * (les maths se lisent noir sur blanc) avec sa consigne selon le niveau
 * (« يساوي », « حلّها », « قيمتها عندما x = … »), le score, les boucliers, le
 * multiplicateur, le niveau (1…50 · أ/ب/ج) et son nom. Quand le niveau change,
 * une bannière le dit — toujours sur un ton qui encourage.
 * Il lit `statsRef` à son rythme et ne re-rend que si une valeur change.
 */
export default function SniperHud({ statsRef, muted, onToggleMute, onPause }) {
  const { t } = useTranslation('madar');
  const reduce = useReducedMotion();
  const [s, setS] = useState({ score: 0, lives: LIVES, mult: 1, level: 1, sub: 1, levelId: null, target: null, targetKey: null, mode: 'value', at: null, warming: false });
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let raf = 0;
    let lastChange = null;
    const read = () => {
      raf = requestAnimationFrame(read);
      const v = statsRef.current;
      if (!v) return;
      setS((cur) => (cur.score === v.score && cur.lives === v.lives && cur.mult === v.mult && cur.targetKey === v.targetKey && cur.warming === v.warming
        ? cur : { score: v.score, lives: v.lives, mult: v.mult, level: v.level, sub: v.sub, levelId: v.levelId, target: v.target, targetKey: v.targetKey, mode: v.mode, at: v.at, warming: v.warming }));
      if (v.change && v.change !== lastChange) {
        lastChange = v.change;
        setBanner(v.change);
      }
    };
    raf = requestAnimationFrame(read);
    return () => cancelAnimationFrame(raf);
  }, [statsRef]);

  useEffect(() => {
    if (!banner) return undefined;
    const id = setTimeout(() => setBanner(null), 2400);
    return () => clearTimeout(id);
  }, [banner]);

  const iconBtn = 'grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60';
  const prompt = s.mode === 'solution' ? t('sniper.hud.targetSolution') : s.mode === 'at' ? t('sniper.hud.targetAt', { x: s.at < 0 ? `−${-s.at}` : s.at }) : t('sniper.hud.target');

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pt-[max(10px,env(safe-area-inset-top))] sm:px-6" data-madar-hud="sniper">
      <div className="flex items-start justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-2">
          <button type="button" onClick={onPause} className={iconBtn} aria-label={t('hud.pause')} data-action="pause"><Pause size={20} aria-hidden="true" /></button>
          <button type="button" onClick={onToggleMute} className={iconBtn} aria-label={muted ? t('sound.unmute') : t('sound.mute')} aria-pressed={muted}>
            {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
          </button>
        </div>
        <div className="flex flex-col items-center">
          <p className="font-space text-3xl font-black tabular-nums text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-4xl" dir="ltr" data-score={s.score}>{formatScore(s.score)}</p>
          {s.mult > 1 && <p className="font-space text-sm font-black text-amber-300" dir="ltr" data-mult={s.mult}>×{s.mult}</p>}
        </div>
        <div className="flex items-center gap-1 rounded-2xl bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur" role="meter" aria-valuemin={0} aria-valuemax={LIVES} aria-valuenow={s.lives} aria-label={t('sniper.hud.shields')} data-lives={s.lives}>
          {Array.from({ length: LIVES }, (_, i) => (
            <Shield key={i} size={18} aria-hidden="true" className={i < s.lives ? 'fill-cyan-300 text-cyan-200' : 'text-white/25'} />
          ))}
        </div>
      </div>

      <div className="mx-auto mt-2 flex max-w-lg flex-col items-center" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {s.target && (
            <motion.div
              key={s.targetKey}
              initial={reduce ? false : { scale: 0.7, opacity: 0, y: -8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2 text-slate-950 shadow-[0_10px_40px_-10px_rgba(253,230,138,0.6)] ring-4 ring-amber-300/70"
              data-sniper-target
            >
              <span className="max-w-[9rem] font-inter text-xs font-bold leading-tight text-slate-500 sm:max-w-none sm:text-sm">{prompt}</span>
              <MathTokens tokens={s.target.tokens} className="font-space text-2xl font-black sm:text-4xl" />
            </motion.div>
          )}
        </AnimatePresence>
        {s.levelId && (
          <p className="mt-1.5 font-inter text-xs font-semibold text-white/75" data-sniper-level={`${s.level}-${s.sub}`}>
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-space text-[11px] font-black text-amber-200">{t('sniper.hud.level', { n: s.level, sub: SUB_LETTERS[s.sub - 1] })}</span>
            <span className="ms-1.5">{t(`sniper.levels.${s.levelId}`)}</span>
          </p>
        )}
        {s.warming && <WarmupChip />}
        <AnimatePresence>
          {banner && (
            <motion.p
              key={`${banner.id}-${banner.kind}`}
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-inter text-sm font-bold ring-1 backdrop-blur ${banner.kind === 'up' ? 'bg-emerald-400/20 text-emerald-100 ring-emerald-300/40' : 'bg-sky-400/15 text-sky-100 ring-sky-300/30'}`}
              role="status"
              data-level-change={banner.kind}
            >
              {banner.kind === 'up' ? <TrendingUp size={15} aria-hidden="true" /> : <TrendingDown size={15} aria-hidden="true" />}
              {t(banner.kind === 'up' ? 'sniper.hud.levelUp' : 'sniper.hud.levelDown', { n: banner.level, sub: SUB_LETTERS[banner.sub - 1] })}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
