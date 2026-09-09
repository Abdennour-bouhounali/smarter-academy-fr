import React from 'react';
import { eur, percentOf, discountFactor, applyDiscount, fr } from './propUtils';

/**
 * PercentLab — la manipulation du module 5 : la barre des soldes.
 *
 * Activity               régler le taux de remise et voir le prix se scinder
 *                        en deux morceaux : ce qu'on enlève, ce qu'on paie.
 * Mathematical objective une remise de t % laisse (100 − t) % du prix ; le
 *                        prix soldé s'obtient donc EN UNE FOIS, en multipliant
 *                        par (1 − t/100).
 * Student action         glisser le taux.
 * Controlled variable    le taux, et lui seul. Le prix de départ est fixe.
 * Visual consequence     la barre se partage en deux ; les deux montants et
 *                        les deux coefficients se réécrivent ensemble.
 * Expected observation   « la part que je paie et la part que j'économise font
 *                        toujours 100 % — et le prix soldé se calcule d'un
 *                        seul coup ».
 * Misconception targeted multiplier par 0,30 pour une remise de 30 %, c'est
 *                        calculer la RÉDUCTION, pas le prix à payer. Les deux
 *                        sont affichés côte à côte pour que la confusion soit
 *                        impossible à entretenir.
 *
 * SÉCURITÉ VISUELLE : une seule piste DOM partagée en deux segments dont les
 * largeurs somment exactement à 100 %. Les montants sont sous la piste, dans
 * une grille — jamais superposés au dessin.
 */
export default function PercentLab({ prix, taux, onTaux, min = 0, max = 70, step = 5 }) {
  const remise = percentOf(taux, prix);
  const paye = applyDiscount(taux, prix);
  const facteur = discountFactor(taux);
  const pctPaye = 100 - taux;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-3.5 space-y-3">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <span className="text-sm font-bold text-rose-900">
            <span aria-hidden="true">🏷️</span> Sweat du collège — {eur(prix)}
          </span>
          <span className="font-mono text-2xl font-black tabular-nums text-rose-700">
            −{taux} %
          </span>
        </div>

        {/* La piste : deux segments qui font exactement 100 %. */}
        <div className="space-y-1.5">
          {/* La piste ne porte AUCUN texte : deux segments dont les largeurs
              somment à 100 %. Rien à rogner, quel que soit le taux. */}
          <div className="h-9 w-full max-w-full rounded-lg overflow-hidden flex bg-slate-100 border-2 border-white">
            <div
              className="h-full bg-emerald-500 transition-[width] duration-200"
              style={{ width: `${pctPaye}%`, minWidth: 0 }}
            />
            <div
              className="h-full bg-rose-400 transition-[width] duration-200"
              style={{ width: `${taux}%`, minWidth: 0 }}
            />
          </div>
          {/* La légende, dans sa propre ligne : toujours lisible en entier. */}
          <div className="flex items-center justify-between gap-3 text-xs font-bold">
            <span className="text-emerald-700 whitespace-nowrap">
              <span aria-hidden="true">▄</span> je paie {pctPaye} %
            </span>
            <span className="text-rose-600 whitespace-nowrap">
              <span aria-hidden="true">▄</span> remise {taux} %
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="percent-taux" className="text-sm font-bold text-rose-900">
            Taux de remise
          </label>
          <input
            id="percent-taux"
            type="range"
            min={min}
            max={max}
            step={step}
            value={taux}
            onChange={(e) => onTaux(Number(e.target.value))}
            className="w-full accent-rose-600 h-6 cursor-pointer mt-1"
            aria-label="Taux de remise en pourcentage"
          />
        </div>
      </div>

      {/* Les deux calculs, côte à côte : la réduction et le prix payé. */}
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-center space-y-1">
          <div className="text-xs font-semibold text-slate-500">Ce que j’économise</div>
          <div className="font-mono text-lg font-black tabular-nums text-rose-600">
            {eur(remise)}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {fr(prix)} × {fr(taux / 100)}
          </div>
        </div>
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2.5 text-center space-y-1">
          <div className="text-xs font-semibold text-slate-500">Ce que je paie</div>
          <div className="font-mono text-lg font-black tabular-nums text-emerald-700">
            {eur(paye)}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {fr(prix)} × {fr(facteur)}
          </div>
        </div>
      </div>
    </div>
  );
}
