import React from 'react';
import { fr, eur, pathsToCell } from './propUtils';

/**
 * PathTable — la manipulation du module 3 : une case vide, trois chemins.
 *
 * Activity               choisir le chemin par lequel on remplit la case.
 * Mathematical objective les trois procédures (unité, facteur, coefficient)
 *                        sont trois RÉCITS du même calcul et donnent la même
 *                        valeur ; on choisit celle dont les nombres sont
 *                        commodes, pas la dernière apprise.
 * Student action         toucher un chemin ; son calcul se déroule dans le
 *                        tableau, avec ses flèches.
 * Visual consequence     la flèche du chemin choisi s'affiche (verticale pour
 *                        l'unité et le coefficient, horizontale pour le
 *                        facteur), et les étapes s'écrivent.
 * Expected observation   « peu importe le chemin, je tombe sur le même
 *                        nombre ».
 *
 * Les valeurs viennent toutes de `pathsToCell` : les trois chemins ne peuvent
 * pas diverger, puisqu'ils sont calculés à partir de la même colonne connue.
 *
 * SÉCURITÉ VISUELLE : tableau DOM, conteneur `overflow-x-auto`, aucune
 * position absolue — les flèches sont des cellules, pas des superpositions.
 */
const CHEMINS = [
  { id: 'unite', label: 'Par l’unité', hint: 'je cherche la valeur pour 1' },
  { id: 'facteur', label: 'Par le facteur', hint: 'je passe d’une colonne à l’autre' },
  { id: 'coefficient', label: 'Par le coefficient', hint: 'j’utilise k' },
];

export default function PathTable({ situation, known, target, chosen, onChoose, revealValue }) {
  const paths = pathsToCell(known, target);
  const fmt = (v) => (situation.money ? eur(v) : `${fr(v)} ${situation.unit}`);
  const path = chosen ? paths[chosen] : null;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-sky-200 bg-white p-3.5 space-y-3">
        <div className="text-sm font-bold text-slate-700">
          <span aria-hidden="true">{situation.emoji}</span> {situation.label}
        </div>

        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-sm border-collapse" style={{ minWidth: '18rem' }}>
            <tbody>
              <tr>
                <th scope="row" className="text-left text-xs font-semibold text-slate-500 pr-3 whitespace-nowrap">
                  {situation.inputLabel}
                </th>
                <td className="px-2 py-2 text-center font-mono font-bold tabular-nums text-slate-800 bg-slate-50 rounded-lg">
                  {fr(known.x)}
                </td>
                <td className="px-2 py-2 text-center font-mono font-bold tabular-nums text-slate-800 bg-slate-50 rounded-lg">
                  {fr(target)}
                </td>
              </tr>
              <tr>
                <th scope="row" className="text-left text-xs font-semibold text-slate-500 pr-3 whitespace-nowrap">
                  {situation.outputLabel}
                </th>
                <td className="px-2 py-2 text-center font-mono font-bold tabular-nums text-slate-800 bg-slate-50 rounded-lg whitespace-nowrap">
                  {fmt(known.y)}
                </td>
                <td
                  className={`px-2 py-2 text-center font-mono font-black tabular-nums rounded-lg whitespace-nowrap ${
                    revealValue ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-700 border-2 border-dashed border-amber-300'
                  }`}
                >
                  {revealValue ? fmt(paths.value) : '?'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        {CHEMINS.map((c) => {
          const on = chosen === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChoose(c.id)}
              aria-pressed={on}
              className={`min-h-[44px] rounded-xl border-2 px-3 py-2 text-left transition-colors ${
                on
                  ? 'border-sky-500 bg-sky-50'
                  : 'border-slate-300 bg-white hover:border-sky-400'
              }`}
            >
              <div className={`text-sm font-bold ${on ? 'text-sky-800' : 'text-slate-700'}`}>
                {c.label}
              </div>
              <div className="text-xs text-slate-500">{c.hint}</div>
            </button>
          );
        })}
      </div>

      {path && (
        <div className="rounded-xl border-2 border-sky-300 bg-sky-50 p-3 space-y-1.5">
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-800">
            {CHEMINS.find((c) => c.id === chosen).label}
          </div>
          <ol className="space-y-1 text-sm text-slate-700 list-decimal list-inside">
            {path.steps.map((s) => (
              <li key={s} className="font-mono">
                {s}
              </li>
            ))}
          </ol>
          <div className="text-sm font-black text-sky-800 font-mono">= {fmt(paths.value)}</div>
        </div>
      )}
    </div>
  );
}
