import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Lock, Star } from 'lucide-react';
import Panel from './Panel';

const WORLD_TONE = {
  moon: 'from-slate-400/25 to-indigo-400/10 ring-slate-300/30',
  mars: 'from-orange-500/25 to-rose-500/10 ring-orange-300/30',
  nebula: 'from-fuchsia-500/25 to-violet-500/10 ring-fuchsia-300/30',
};

/**
 * La carte des niveaux de « المستكشف » : trois mondes de quatre niveaux, les
 * étoiles gagnées, le niveau suivant mis en avant ; un niveau verrouillé dit
 * ce qui l'ouvre (réussir le précédent). Choisir un niveau ouvert le lance
 * (−1 ❤️).
 */
export default function LevelMap({ explorer, disabled, onPlay }) {
  const { t } = useTranslation('madar');
  const reduce = useReducedMotion();
  const levels = explorer?.levels ?? [];
  const next = levels.find((l) => l.unlocked && !l.completed)?.n ?? null;
  const worlds = [...new Set(levels.map((l) => l.world))];

  return (
    <Panel className="space-y-4" data-level-map>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-space text-lg font-black text-white">{t('explorer.map.title')}</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/20 px-2.5 py-1 font-space text-sm font-black text-amber-100" dir="ltr">
          <Star size={14} className="fill-amber-300 text-amber-300" aria-hidden="true" /> {explorer?.totalStars ?? 0}/{explorer?.maxStars ?? 36}
        </span>
      </div>
      {worlds.map((world) => (
        <section key={world} aria-label={t(`explorer.worlds.${world}`)}>
          <p className="mb-2 font-inter text-xs font-bold text-white/70">{t(`explorer.worlds.${world}`)}</p>
          <ol className="grid grid-cols-4 gap-2">
            {levels.filter((l) => l.world === world).map((l) => {
              const isNext = l.n === next;
              return (
                <li key={l.n}>
                  <motion.button
                    type="button"
                    disabled={!l.unlocked || disabled}
                    onClick={() => onPlay(l.n)}
                    animate={isNext && !reduce ? { scale: [1, 1.06, 1] } : undefined}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className={`flex w-full flex-col items-center gap-1 rounded-2xl bg-gradient-to-b px-1 py-2.5 ring-1 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50 disabled:cursor-not-allowed ${
                      l.unlocked ? WORLD_TONE[world] : 'from-white/5 to-white/0 ring-white/10'} ${isNext ? 'ring-2 ring-amber-300' : ''}`}
                    data-level={l.n} data-unlocked={l.unlocked || undefined}
                  >
                    <span className={`font-space text-xl font-black ${l.unlocked ? 'text-white' : 'text-white/40'}`} dir="ltr">{l.unlocked ? l.n : <Lock size={18} aria-label={t('explorer.map.locked')} />}</span>
                    <span className="flex gap-0.5" aria-label={t('explorer.map.stars', { n: l.stars })}>
                      {[1, 2, 3].map((i) => (
                        <Star key={i} size={12} aria-hidden="true" className={i <= l.stars ? 'fill-amber-300 text-amber-300' : 'text-white/25'} />
                      ))}
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      <p className="font-inter text-[11px] leading-relaxed text-white/55">{t('explorer.map.rules')}</p>
    </Panel>
  );
}
