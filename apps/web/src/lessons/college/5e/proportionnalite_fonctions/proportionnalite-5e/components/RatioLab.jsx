import React from 'react';
import { fr, eur, ratio } from './propUtils';

/**
 * RatioLab — la manipulation du module 2 : la colonne « sortie ÷ entrée ».
 *
 * Activity               dévoiler, une colonne à la fois, le rapport de
 *                        chaque couple d'une situation.
 * Mathematical objective dans une situation proportionnelle, sortie ÷ entrée
 *                        donne TOUJOURS le même nombre. C'est ce nombre —
 *                        pas le tableau — qui est la situation.
 * Student action         toucher une colonne pour calculer son rapport.
 * Controlled variable    la colonne révélée.
 * Visual consequence     le rapport s'inscrit sous la colonne ; les rapports
 *                        identiques se colorent de la même couleur.
 * Expected observation   « à chaque fois je retombe sur 0,15 » — et, sur la
 *                        piscine, « ça ne tombe jamais deux fois pareil ».
 *
 * Le verdict n'est jamais écrit à la main : `constant` est calculé sur les
 * rapports RÉELLEMENT dévoilés (propUtils.ratio).
 *
 * SÉCURITÉ VISUELLE : un tableau DOM qui défile horizontalement dans son
 * propre conteneur (`overflow-x-auto`) — la page ne défile jamais
 * latéralement, quel que soit le nombre de colonnes ou de chiffres.
 */
export default function RatioLab({ rule, inputs, revealed, onReveal, showRatios = true }) {
  const fmt = (v) => (rule.money ? eur(v) : fr(v, rule.decimals ?? 2));
  const shownRatios = inputs.filter((x) => revealed.includes(x)).map((x) => ratio(rule, x));
  const allSame =
    shownRatios.length > 1 && shownRatios.every((r) => r !== null && r === shownRatios[0]);

  return (
    <div className="rounded-2xl border-2 border-violet-200 bg-white p-3.5 space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-bold text-slate-700">
          <span aria-hidden="true">{rule.emoji}</span> {rule.label}
        </span>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-sm border-collapse" style={{ minWidth: `${inputs.length * 5.5}rem` }}>
          <tbody>
            <tr>
              <th scope="row" className="text-left text-xs font-semibold text-slate-500 pr-3 whitespace-nowrap">
                {rule.inputLabel}
              </th>
              {inputs.map((x) => (
                <td key={x} className="px-1 py-1.5 text-center font-mono font-bold tabular-nums text-slate-800">
                  {x}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="text-left text-xs font-semibold text-slate-500 pr-3 whitespace-nowrap">
                {rule.outputLabel}
              </th>
              {inputs.map((x) => (
                <td key={x} className="px-1 py-1.5 text-center font-mono font-bold tabular-nums text-slate-800 whitespace-nowrap">
                  {fmt(rule.apply(x))}
                </td>
              ))}
            </tr>
            {showRatios && (
              <tr>
                <th scope="row" className="text-left text-xs font-semibold text-violet-700 pr-3 whitespace-nowrap">
                  ÷ {rule.inputLabelOne}
                </th>
                {inputs.map((x) => {
                  const on = revealed.includes(x);
                  const r = ratio(rule, x);
                  return (
                    <td key={x} className="px-1 py-1.5 text-center">
                      {on ? (
                        <span
                          className={`inline-block px-2 py-1 rounded-lg font-mono text-sm font-black tabular-nums whitespace-nowrap ${
                            allSame
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r === null ? '—' : fr(r)}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onReveal(x)}
                          className="min-h-[36px] w-full px-2 py-1 rounded-lg border-2 border-dashed border-violet-300 text-violet-600 text-xs font-bold hover:bg-violet-50 transition"
                          aria-label={`Calculer le rapport pour ${x} ${rule.inputLabel}`}
                        >
                          ?
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showRatios && shownRatios.length > 0 && (
        <p className="text-xs text-slate-500">
          {shownRatios.length === 1
            ? 'Dévoile une deuxième colonne pour comparer.'
            : allSame
              ? `Toujours le même nombre : ${fr(shownRatios[0])}.`
              : 'Les rapports ne tombent pas sur le même nombre.'}
        </p>
      )}
    </div>
  );
}
