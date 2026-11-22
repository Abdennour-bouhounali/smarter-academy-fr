import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftCircle, Fuel, Gem, Home, Loader2, Map, RotateCcw, Star } from 'lucide-react';
import { formatScore, rankMovement } from '../madarModel';
import CostBadge from './CostBadge';
import HeartsRow from './HeartsRow';
import Sheet, { primaryBtn, secondaryBtn } from './Sheet';

/**
 * La fin d'un niveau de « المستكشف » : réussi ou non, les étoiles qui
 * s'allument une à une (terminé · tous les cristaux · sans reprise — calculées
 * par le serveur), les cristaux, le score, le niveau suivant débloqué. Puis :
 * niveau suivant, rejouer, faire le plein, carte des niveaux.
 */
export default function ExplorerResults({ local, result, saving, error, hearts, maxHearts, canPlay, onNext, onRetry, onRefuel, onMap }) {
  const { t } = useTranslation('madar');
  const reduce = useReducedMotion();
  const level = result?.level;
  const completed = result ? result.run.completed : local.completed;
  const stars = level?.stars ?? 0;
  const movement = rankMovement(result?.rank);

  return (
    <Sheet labelledBy="explorer-results-title" data-explorer-results={completed ? 'won' : 'failed'}>
      <p className="text-center font-inter text-sm font-semibold text-white/65">{t('explorer.levelName', { n: local.level })}</p>
      <h2 id="explorer-results-title" className="mt-1 text-center font-space text-3xl font-black text-white">{completed ? t('explorer.results.won') : t('explorer.results.failed')}</h2>

      <div className="mt-4 flex items-end justify-center gap-3" aria-label={t('explorer.map.stars', { n: stars })}>
        {[1, 2, 3].map((i) => (
          <motion.span key={i}
            initial={reduce ? false : { scale: 0, rotate: -40 }}
            animate={{ scale: i === 2 ? 1.25 : 1, rotate: 0 }}
            transition={{ delay: reduce ? 0 : 0.25 + i * 0.25, type: 'spring', stiffness: 400, damping: 14 }}
            className={i === 2 ? 'mb-2' : ''}>
            <Star size={i === 2 ? 56 : 44} aria-hidden="true" className={i <= stars ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.7)]' : 'text-white/20'} />
          </motion.span>
        ))}
      </div>
      <ul className="mt-3 space-y-1 text-center font-inter text-xs text-white/65">
        <li className={stars >= 1 ? 'text-amber-200' : ''}>{t('explorer.results.star1')}</li>
        <li className={level && level.crystals >= level.totalCrystals ? 'text-amber-200' : ''}>{t('explorer.results.star2')}</li>
        <li className={stars >= 3 ? 'text-amber-200' : ''}>{t('explorer.results.star3')}</li>
      </ul>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-2xl bg-white/[0.06] py-2">
          <dt className="font-inter text-[11px] text-white/55">{t('results.score')}</dt>
          <dd className="font-space text-2xl font-black" dir="ltr">{formatScore(result?.run?.score ?? local.score)}</dd>
        </div>
        <div className="rounded-2xl bg-white/[0.06] py-2">
          <dt className="font-inter text-[11px] text-white/55">{t('explorer.results.crystals')}</dt>
          <dd className="inline-flex items-center gap-1 font-space text-2xl font-black" dir="ltr"><Gem size={18} className="text-cyan-300" aria-hidden="true" />{local.crystals}/{local.totalCrystals}</dd>
        </div>
      </dl>

      <div className="mt-3 min-h-[22px] space-y-1 text-center font-inter text-sm" aria-live="polite">
        {saving && <p className="inline-flex items-center gap-2 text-white/60"><Loader2 size={14} className="animate-spin" aria-hidden="true" />{t('results.saving')}</p>}
        {error && <p role="alert" className="text-rose-200">{error}</p>}
        {level?.nextUnlocked && <p className="font-bold text-emerald-300">{t('explorer.results.unlocked', { n: level.next })}</p>}
        {result?.newBest && <p className="font-bold text-amber-200">{t('results.newBest')}</p>}
        {movement?.kind === 'up' && <p className="font-bold text-emerald-300">{t('results.rankUp', { n: movement.to })}</p>}
        {result?.run?.flagged && <p className="text-xs text-white/45">{t('results.flagged')}</p>}
      </div>

      <div className="mt-3 flex items-center justify-center"><HeartsRow hearts={hearts} max={maxHearts} size={20} /></div>

      <div className="mt-3 space-y-2.5">
        {completed && level?.next && canPlay && (
          <button type="button" className={primaryBtn} onClick={() => onNext(level.next)} disabled={saving} data-action="next-level" data-autofocus>
            <ArrowLeftCircle size={20} aria-hidden="true" /> {t('explorer.results.next', { n: level.next })} <CostBadge />
          </button>
        )}
        {(!completed || !level?.next) && canPlay && (
          <button type="button" className={primaryBtn} onClick={onRetry} disabled={saving} data-action="retry" data-autofocus>
            <RotateCcw size={20} aria-hidden="true" /> {t('explorer.results.retry')} <CostBadge />
          </button>
        )}
        {!canPlay && hearts < maxHearts && (
          <button type="button" className={primaryBtn} onClick={onRefuel} disabled={saving} data-action="refuel" data-autofocus>
            <Fuel size={20} aria-hidden="true" /> {t('results.refuel')}
          </button>
        )}
        <div className="grid grid-cols-2 gap-2">
          {completed && canPlay && (
            <button type="button" className={secondaryBtn} onClick={onRetry} disabled={saving}><RotateCcw size={16} aria-hidden="true" /> {t('explorer.results.retry')}</button>
          )}
          <button type="button" className={`${secondaryBtn} ${completed && canPlay ? '' : 'col-span-2'}`} onClick={onMap} disabled={saving} data-action="map">
            <Map size={16} aria-hidden="true" /> {t('explorer.results.map')}
          </button>
        </div>
        <span className="sr-only"><Home size={1} /></span>
      </div>
    </Sheet>
  );
}
