import { useTranslation } from 'react-i18next';
import { Flag, Fuel, HeartPulse } from 'lucide-react';
import { crashOptions, formatScore } from '../madarModel';
import CostBadge from './CostBadge';
import Sheet, { primaryBtn, secondaryBtn } from './Sheet';

/**
 * Le crash : le score atteint, puis le CHOIX — continuer (un cœur), gagner
 * un cœur à la محطة التزوّد pour continuer, ou terminer la rangée. C'est ici
 * que la boucle « résoudre pour rejouer » se ferme.
 */
export default function CrashSheet({ game = 'orbit', score, wave = 0, level = 1, hearts, revives, maxRevives, busy, error, onRevive, onRefuel, onEnd }) {
  const { t } = useTranslation('madar');
  const options = crashOptions({ hearts, revives, maxRevives });
  return (
    <Sheet labelledBy="madar-crash-title" tone="danger" data-madar-crash>
      <p className="text-center text-4xl" aria-hidden="true">{game === 'defense' ? '🪐' : game === 'explorer' ? '🧑‍🚀' : '💥'}</p>
      <h2 id="madar-crash-title" className="mt-1 text-center font-space text-3xl font-black text-white">{game === 'defense' ? t('defense.crash.title') : game === 'explorer' ? t('explorer.crash.title') : t('crash.title')}</h2>
      <p className="mt-1 text-center font-inter text-sm text-white/75">
        {game === 'defense' ? t('defense.crash.subtitle', { wave, score: formatScore(score) })
          : game === 'explorer' ? t('explorer.crash.subtitle', { level, score: formatScore(score) })
            : t('crash.subtitle', { score: formatScore(score) })}
      </p>
      <div className="mt-5 space-y-2.5">
        {options.revive && (
          <button type="button" className={primaryBtn} onClick={onRevive} disabled={busy} data-action="revive" data-autofocus>
            <HeartPulse size={22} aria-hidden="true" /> {game === 'defense' ? t('defense.crash.revive') : game === 'explorer' ? t('explorer.crash.revive') : t('crash.revive')}
            <CostBadge />
          </button>
        )}
        {options.refuelToRevive && (
          <button type="button" className={primaryBtn} onClick={onRefuel} disabled={busy} data-action="refuel-revive" data-autofocus>
            <Fuel size={22} aria-hidden="true" /> {game === 'defense' ? t('defense.crash.reviveByRefuel') : game === 'explorer' ? t('explorer.crash.reviveByRefuel') : t('crash.reviveByRefuel')}
          </button>
        )}
        <button type="button" className={secondaryBtn} onClick={onEnd} disabled={busy} data-action="end">
          <Flag size={16} aria-hidden="true" /> {t('crash.end')}
        </button>
      </div>
      <p className="mt-3 text-center font-inter text-xs text-white/55">
        {options.revivesLeft > 0 ? t('crash.revivesLeft', { count: options.revivesLeft }) : t('crash.noRevives')}
      </p>
      {error && <p role="alert" className="mt-3 rounded-2xl bg-rose-500/20 p-2.5 text-center font-inter text-sm text-rose-100">{error}</p>}
    </Sheet>
  );
}
