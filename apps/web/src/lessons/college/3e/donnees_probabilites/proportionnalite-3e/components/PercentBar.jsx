import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { formatDec, applyPercent, percentMultiplier, chainPercents } from './propUtils';

/**
 * PercentBar — une évolution en pourcentage, vue comme une barre qui s'étire.
 *
 * Activity            choisir un taux (chips −50 … +100) ; la barre « après »
 *                     s'ajuste face à la barre « avant » (100 %).
 * Mathematical objective  faire VOIR que « +20 % » est une MULTIPLICATION par
 *                     1,2, « −25 % » par 0,75 — et que deux évolutions
 *                     s'enchaînent en multipliant les coefficients (l'aller-
 *                     retour +20 % / −20 % ne revient pas au départ).
 * Student action      toucher un chip de taux (ou deux, en mode chaîne).
 * Controlled variable le taux t (et le second taux en mode chaîne).
 * Mathematical state  { value, rates[] } ; tout est calculé par
 *                     `chainPercents` (propUtils).
 * Visual consequence  la barre « après » s'allonge (t > 0) ou raccourcit
 *                     (t < 0) ; le multiplicateur s'écrit dès `showMultiplier`.
 * Expected observation « +20 % puis −20 % : 48, pas 50 ».
 *
 * Avec `maxRates = 1`, toucher un autre taux REMPLACE le taux courant : l'élève
 * peut toujours changer d'avis (un chip figé après le premier choix bloquait
 * l'étape). Avec `maxRates = 2`, les chips se ferment une fois la chaîne pleine.
 *
 * SÉCURITÉ D'AFFICHAGE : les barres sont des pourcentages d'une piste dont
 * l'échelle est le plus grand multiplicateur atteignable (2, pour +100 %) ;
 * les nombres ont leur colonne.
 */
const MAX_MULT = 2;

export default function PercentBar({
  value,
  rates,                 // [] | [t] | [t1, t2]
  choices = [-50, -25, -20, 10, 20, 50, 100],
  onPick,                // (rate) => void — ajoute (ou remplace) un taux
  maxRates = 1,
  showMultiplier = false,
  unit = '€',
  disabled = false,
  caption,
}) {
  const reduce = useReducedMotion();
  const chain = chainPercents(value, rates);
  const bar = (label, v, tone) => (
    <div key={label} className="grid items-center gap-2" style={{ gridTemplateColumns: '5.5rem minmax(0,1fr) 5.5rem' }}>
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <div className="relative h-7 rounded-lg bg-white border border-slate-200 overflow-hidden">
        <motion.div className={`absolute inset-y-0 left-0 rounded-lg ${tone}`} initial={false}
          animate={{ width: `${Math.min(100, (v / (value * MAX_MULT)) * 100)}%` }} transition={{ duration: reduce ? 0 : 0.35 }} />
        <span aria-hidden="true" className="absolute inset-y-0 border-l-2 border-dashed border-slate-500" style={{ left: '50%' }} />
      </div>
      <span className="font-mono font-bold text-slate-800 tabular-nums text-sm text-right whitespace-nowrap">{formatDec(v)} {unit}</span>
    </div>
  );

  return (
    <div className="w-full rounded-2xl border-2 border-slate-300 bg-slate-50 p-3 sm:p-4 space-y-3" role="group"
      aria-label={`Prix de départ ${formatDec(value)} ${unit}${rates.length ? `, après ${rates.map((r) => `${r > 0 ? '+' : ''}${formatDec(r)} %`).join(' puis ')} : ${formatDec(chain.result)} ${unit}` : ''}`}>
      {caption && <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wide">{caption}</p>}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choisir un taux">
        {choices.map((r) => {
          const on = rates.includes(r);
          return (
            <button key={r} type="button" disabled={disabled || (maxRates > 1 && rates.length >= maxRates && !on)} onClick={() => onPick?.(r)} aria-pressed={on}
              aria-label={`Taux ${r > 0 ? 'plus' : 'moins'} ${formatDec(Math.abs(r))} pour cent`}
              className={`min-h-[44px] min-w-[56px] px-3 rounded-xl border-2 font-mono font-bold text-sm transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40
                ${on ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-purple-500'}`}
              style={{ touchAction: 'manipulation' }}>
              {r > 0 ? '+' : '−'}{formatDec(Math.abs(r))} %
            </button>
          );
        })}
      </div>
      <div className="rounded-2xl bg-white border-2 border-slate-200 p-2 space-y-1.5">
        {bar('avant', value, 'bg-slate-500')}
        {chain.steps.slice(1).map((v, i) => bar(i === chain.steps.length - 2 ? 'après' : `étape ${i + 1}`, v, 'bg-purple-500'))}
        <p className="text-[10px] font-mono text-slate-400 text-right">le trait pointillé marque 100 % (le prix de départ)</p>
      </div>
      {showMultiplier && rates.length > 0 && (
        <p className="text-sm text-slate-800 font-mono tabular-nums" aria-live="polite">
          {rates.map((r) => `× ${formatDec(percentMultiplier(r))}`).join(' puis ')}{rates.length > 1 ? ` = × ${formatDec(chain.multiplier)}` : ''} :{' '}
          {formatDec(value)} × {formatDec(chain.multiplier)} = <strong>{formatDec(chain.result)} {unit}</strong>
        </p>
      )}
    </div>
  );
}

export { applyPercent };
