import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Fuel, Home, Loader2, RotateCcw, TrendingUp } from 'lucide-react';
import { sectorAt } from '../engine/constants';
import { formatScore, rankMovement } from '../madarModel';
import CostBadge from './CostBadge';
import HeartsRow from './HeartsRow';
import Sheet, { primaryBtn, secondaryBtn } from './Sheet';
import ShipIcon from './ShipIcon';
import TurretIcon from './TurretIcon';
import { SUB_LETTERS } from './SniperHud';

function useCountUp(target, reduce) {
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) {
      setValue(target);
      return undefined;
    }
    let raf = 0;
    const start = performance.now();
    const dur = Math.min(1400, 500 + target / 4);
    const tick = (now) => {
      const k = Math.min(1, (now - start) / dur);
      setValue(Math.round(target * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduce]);
  return value;
}

const CONFETTI = ['#fde68a', '#f472b6', '#67e8f9', '#a78bfa', '#fb923c', '#86efac'];

/**
 * La fin de la rangée : le score qui monte, « رقم قياسي جديد! » quand c'est
 * vrai (et des confettis), ce que la partie a fait (étoiles, passages
 * frôlés, série, planète la plus lointaine), la montée au classement — jamais
 * une descente — et le vaisseau débloqué. Puis : rejouer, ou faire le plein.
 */
export default function Results({ game = 'orbit', local, result, saving, error, hearts, maxHearts, canPlay, free = false, onAgain, onRefuel, onHome, onFlyShip }) {
  const { t } = useTranslation('madar');
  const reduce = useReducedMotion();
  const score = result?.run?.score ?? local.score;
  const shown = useCountUp(score, reduce);
  const newBest = Boolean(result?.newBest);
  const movement = rankMovement(result?.rank);
  const unlocked = result?.unlocked ?? [];
  const toBeat = result && !newBest && result.best > score ? result.best - score : null;

  return (
    <Sheet labelledBy="madar-results-title" data-madar-results>
      {newBest && !reduce && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0" aria-hidden="true">
          {Array.from({ length: 28 }, (_, i) => (
            <motion.span
              key={i}
              className="absolute block h-2.5 w-1.5 rounded-sm"
              style={{ insetInlineStart: `${(i * 37) % 100}%`, background: CONFETTI[i % CONFETTI.length] }}
              initial={{ y: 0, opacity: 1, rotate: 0 }}
              animate={{ y: [-10 - (i % 5) * 18, 260 + (i % 7) * 30], opacity: [1, 1, 0], rotate: (i % 2 ? 1 : -1) * 540 }}
              transition={{ duration: 1.6 + (i % 5) * 0.2, ease: 'easeOut', delay: (i % 6) * 0.05 }}
            />
          ))}
        </div>
      )}

      <h2 id="madar-results-title" className="text-center font-inter text-sm font-semibold text-white/65">{t('results.title')}</h2>
      {newBest && (
        <motion.p initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}
          className="mx-auto mt-2 w-fit rounded-full bg-gradient-to-r from-amber-300 to-orange-500 px-4 py-1 font-space text-sm font-black text-slate-950" data-new-best>
          {t('results.newBest')}
        </motion.p>
      )}
      <p className="mt-2 text-center font-space text-6xl font-black tabular-nums" dir="ltr" data-final-score={score}>{formatScore(shown)}</p>
      <p className="text-center font-inter text-xs text-white/55">{t('results.score')}</p>

      <dl className="mt-4 grid grid-cols-4 gap-1.5 text-center">
        {(free ? [
          ['sniper.results.round', result?.run?.wave ?? local.round],
          ['sniper.results.hits', local.hits],
          ['sniper.results.accuracy', local.accuracy == null ? '—' : `${Math.round(local.accuracy * 100)}%`],
          ['results.combo', local.bestStreak],
        ] : game === 'defense' ? [
          ['defense.results.wave', result?.run?.wave ?? local.wave],
          ['defense.results.kills', local.kills],
          ['lobby.best', formatScore(result?.best ?? 0)],
          ['defense.lobby.bestWave', result?.bestWave ?? '—'],
        ] : [
          ['results.stars', `⭐ ${local.stars}`],
          ['results.near', local.nearMisses],
          ['results.combo', local.bestCombo],
          ['results.sector', t(`sectors.${sectorAt(local.sector).id}`)],
        ]).map(([key, value]) => (
          <div key={key} className="rounded-2xl bg-white/[0.06] px-1 py-2">
            <dt className="font-inter text-[10px] text-white/55">{t(key)}</dt>
            <dd className="mt-0.5 truncate font-space text-sm font-black">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 min-h-[24px] space-y-1.5 text-center font-inter text-sm" aria-live="polite">
        {saving && <p className="inline-flex items-center gap-2 text-white/60"><Loader2 size={14} className="animate-spin" aria-hidden="true" />{t('results.saving')}</p>}
        {error && <p role="alert" className="text-rose-200">{error}</p>}
        {movement?.kind === 'up' && <p className="inline-flex items-center gap-1.5 font-bold text-emerald-300"><TrendingUp size={16} aria-hidden="true" />{t('results.rankUp', { n: movement.to })}</p>}
        {movement?.kind === 'same' && <p className="text-white/70">{t('results.rank', { n: movement.to })}</p>}
        {toBeat !== null && <p className="text-white/60">{t('results.toBeat', { n: formatScore(toBeat) })}</p>}
        {result?.run?.flagged && <p className="text-xs text-white/45">{t('results.flagged')}</p>}
        {free && result?.level && (
          <p className={`inline-flex items-center gap-1.5 font-bold ${result.level.change === 'up' ? 'text-emerald-300' : 'text-white/75'}`} data-level-result={result.level.change}>
            {t(`sniper.results.level.${result.level.change}`, {
              from: t('sniper.hud.level', { n: result.level.from.level, sub: SUB_LETTERS[result.level.from.sub - 1] }),
              to: t('sniper.hud.level', { n: result.level.to.level, sub: SUB_LETTERS[result.level.to.sub - 1] }),
            })}
          </p>
        )}
      </div>

      {unlocked.map((id) => (
        <motion.div key={id} initial={reduce ? false : { y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-3 flex items-center gap-3 rounded-2xl bg-gradient-to-l from-fuchsia-500/25 to-amber-300/15 p-3 ring-1 ring-fuchsia-300/40" data-unlocked={id}>
          <ShipIcon id={id} size={52} />
          <div className="min-w-0 flex-1">
            <p className="font-space text-base font-black">{t('ships.unlockedTitle')}</p>
            <p className="font-inter text-xs text-white/75">{t('ships.unlockedBody', { name: t(`ships.names.${id}`) })}</p>
          </div>
          <button type="button" onClick={() => onFlyShip(id)} className="rounded-xl bg-white/15 px-3 py-2 font-inter text-xs font-bold hover:bg-white/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300/50">{t('ships.fly')}</button>
        </motion.div>
      ))}

      {(result?.unlockedTurrets ?? []).map((id) => (
        <motion.div key={id} initial={reduce ? false : { y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-3 flex items-center gap-3 rounded-2xl bg-gradient-to-l from-cyan-500/25 to-violet-400/15 p-3 ring-1 ring-cyan-300/40" data-unlocked-turret={id}>
          <TurretIcon type={id} size={46} />
          <div className="min-w-0 flex-1">
            <p className="font-space text-base font-black">{t('defense.results.turretsUnlocked')}</p>
            <p className="font-inter text-xs text-white/75">{t('defense.results.turretsUnlockedBody', { name: t(`defense.turrets.${id}.name`) })}</p>
          </div>
        </motion.div>
      ))}

      <div className="mt-4 flex items-center justify-center"><HeartsRow hearts={hearts} max={maxHearts} size={20} /></div>

      <div className="mt-3 space-y-2.5">
        {canPlay ? (
          <button type="button" className={primaryBtn} onClick={onAgain} disabled={saving} data-action="again" data-autofocus>
            <RotateCcw size={20} aria-hidden="true" /> {free ? t('sniper.results.again') : t('results.again')}
            {!free && <CostBadge />}
          </button>
        ) : hearts < maxHearts ? (
          <button type="button" className={primaryBtn} onClick={onRefuel} disabled={saving} data-action="refuel" data-autofocus>
            <Fuel size={20} aria-hidden="true" /> {t('results.refuel')}
          </button>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          {canPlay && hearts < maxHearts && (
            <button type="button" className={secondaryBtn} onClick={onRefuel} disabled={saving}><Fuel size={16} aria-hidden="true" /> {t('results.refuel')}</button>
          )}
          <button type="button" className={`${secondaryBtn} ${canPlay && hearts < maxHearts ? '' : 'col-span-2'}`} onClick={onHome} disabled={saving} data-action="home">
            <Home size={16} aria-hidden="true" /> {t('results.home')}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
