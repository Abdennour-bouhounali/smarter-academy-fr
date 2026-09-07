import React from 'react';
import { formatNumber, formatPercent, coefficient, globalCoefficient, globalRate } from '../../../../../common/stats';

/**
 * EvolutionChain — LE laboratoire d'ouverture : la chaîne des évolutions.
 *
 * Activité (INTERACTION_PEDAGOGY §24) :
 *  - objectif : rendre visible que la seconde évolution s'applique à la
 *    valeur DÉJÀ MODIFIÉE, et donc que deux taux opposés ne se compensent
 *    pas ;
 *  - action de l'élève : choisir chaque taux de la chaîne (et, au besoin,
 *    en ajouter un troisième) ;
 *  - variable contrôlée : les taux successifs — jamais le résultat, qui doit
 *    rester une conséquence ;
 *  - conséquence visuelle immédiate : chaque maillon affiche la valeur qui
 *    ENTRE, le coefficient appliqué et la valeur qui SORT, et l'écart au
 *    point de départ est tracé sous la chaîne.
 *
 * Le maillon central est le point pédagogique : on y lit « ×0,80 appliqué à
 * 120 », pas « ×0,80 appliqué à 100 ». C'est cette base mouvante qui explique
 * tout le reste de la leçon.
 */
export default function EvolutionChain({
  initial = 100,
  rates,
  onRatesChange,
  unit = '€',
  editable = true,
  showGlobal = true,
  maxSteps = 3,
}) {
  const values = rates.reduce((acc, r) => [...acc, acc[acc.length - 1] * (1 + r)], [initial]);
  const kGlobal = globalCoefficient(rates);
  const tGlobal = globalRate(rates);
  const final = values[values.length - 1];

  const setRate = (i, r) => {
    const next = [...rates];
    next[i] = r;
    onRatesChange(next);
  };

  return (
    <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-4">
      {/* La chaîne : valeur → coefficient → valeur. Chaque flèche porte le
          coefficient ET rappelle sur QUOI il s'applique. */}
      <div className="flex flex-wrap items-stretch gap-2">
        {values.map((v, i) => (
          <React.Fragment key={i}>
            <div className={`rounded-xl border-2 px-3.5 py-2.5 min-w-[6.5rem] text-center ${
              i === 0 ? 'border-slate-300 bg-slate-50' : i === values.length - 1 ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'
            }`}>
              <p className="text-[13px] font-bold uppercase tracking-wide text-slate-400">
                {i === 0 ? 'départ' : i === values.length - 1 ? 'arrivée' : `étape ${i}`}
              </p>
              <p className={`font-mono font-black tabular-nums ${i === values.length - 1 ? 'text-lg text-indigo-900' : 'text-base text-slate-800'}`}>
                {formatNumber(v, 2)} {unit}
              </p>
            </div>
            {i < rates.length && (
              <div className="flex flex-col items-center justify-center px-1 min-w-[5.5rem]">
                <span className={`font-mono text-sm font-black ${rates[i] > 0 ? 'text-emerald-600' : rates[i] < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                  ×{formatNumber(coefficient(rates[i]), 2)}
                </span>
                <span className="text-2xl leading-none text-slate-300" aria-hidden="true">→</span>
                <span className="text-[13px] text-slate-400">
                  {rates[i] > 0 ? '+' : ''}{formatNumber(rates[i] * 100, 1)} %
                </span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {editable && (
        <div className="space-y-3">
          {rates.map((r, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <label htmlFor={`ec-rate-${i}`} className="text-sm font-semibold text-slate-700">
                  Évolution {i + 1} :
                  <span className="block text-[13px] font-normal text-slate-400">
                    s’applique à {formatNumber(values[i], 2)} {unit}
                  </span>
                </label>
                <span className={`font-mono font-black text-lg tabular-nums ${r > 0 ? 'text-emerald-700' : r < 0 ? 'text-rose-700' : 'text-slate-600'}`}>
                  {r > 0 ? '+' : ''}{formatNumber(r * 100, 0)} %
                </span>
              </div>
              {/* Curseur : en balayant, l'élève voit la valeur d'arrivée
                  bouger sans jamais revenir au départ quand deux taux
                  opposés se suivent — le phénomène, pas son énoncé. */}
              <input id={`ec-rate-${i}`} type="range" min={-50} max={100} step={5}
                value={Math.round(r * 100)}
                onChange={(e) => setRate(i, Number(e.target.value) / 100)}
                aria-label={`Taux de l’évolution ${i + 1}`}
                aria-valuetext={`${r > 0 ? 'plus ' : r < 0 ? 'moins ' : ''}${formatNumber(Math.abs(r) * 100, 0)} pour cent`}
                className="sa-slider accent-indigo-600" />
              {/* Bornes et repère du zéro : sans elles, la course du curseur
                  est un espace muet — l'élève ne sait pas où est « aucune
                  évolution », qui est justement le point de comparaison. */}
              <div className="flex justify-between text-[13px] font-mono text-slate-400 -mt-1 px-0.5">
                <span>−50 %</span>
                <span className={Math.abs(r) < 1e-9 ? 'font-bold text-slate-700' : ''}>0 %</span>
                <span>+100 %</span>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {rates.length < maxSteps && (
              <button type="button"
                onClick={() => onRatesChange([...rates, 0.1])}
                className="min-h-[44px] px-4 rounded-xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                + Ajouter une évolution
              </button>
            )}
            {rates.length > 2 && (
              <button type="button"
                onClick={() => onRatesChange(rates.slice(0, -1))}
                className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-600 hover:border-rose-400 hover:text-rose-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                − Retirer la dernière
              </button>
            )}
          </div>
        </div>
      )}

      {showGlobal && (
        <div className={`rounded-xl border-2 p-3.5 space-y-1.5 ${
          Math.abs(kGlobal - 1) < 1e-9 ? 'border-slate-200 bg-slate-50' : kGlobal > 1 ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
        }`}>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Du départ à l’arrivée</p>
          <p className="font-mono text-sm text-slate-800">
            {rates.map((r) => formatNumber(coefficient(r), 2)).join(' × ')} ={' '}
            <strong className="text-lg">{formatNumber(kGlobal, 4)}</strong>
          </p>
          <p className="text-sm font-bold text-slate-800">
            {formatNumber(initial, 2)} {unit} → {formatNumber(final, 2)} {unit} — évolution globale{' '}
            <span className={kGlobal > 1 ? 'text-emerald-700' : kGlobal < 1 ? 'text-rose-700' : 'text-slate-600'}>
              {tGlobal >= 0 ? '+' : '−'}{formatPercent(Math.abs(tGlobal), 2).replace('−', '')}
            </span>
          </p>
          <p className="text-xs text-slate-500">
            Somme des taux annoncés : {rates.reduce((a, r) => a + r, 0) >= 0 ? '+' : '−'}
            {formatPercent(Math.abs(rates.reduce((a, r) => a + r, 0)), 1)} — un nombre qui ne décrit pas cette chaîne.
          </p>
        </div>
      )}
    </div>
  );
}
