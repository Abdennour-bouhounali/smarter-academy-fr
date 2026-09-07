import React from 'react';
import { formatPercent, formatNumber } from '../../../../../common/stats';

/**
 * ReferenceLab — LE laboratoire de la leçon : choisir la population de
 * RÉFÉRENCE et voir le dénominateur changer.
 *
 * Activité (INTERACTION_PEDAGOGY §24) :
 *  - objectif : faire comprendre qu'une fréquence n'existe pas sans un groupe
 *    de référence, et que le même effectif en donne trois selon ce groupe ;
 *  - action de l'élève : cliquer une case (le numérateur), puis choisir la
 *    référence (tout le monde / sa ligne / sa colonne) ;
 *  - variable contrôlée : le DÉNOMINATEUR ;
 *  - conséquence visuelle immédiate : le groupe de référence s'illumine dans
 *    le tableau, et la division s'écrit en toutes lettres sous celui-ci.
 *
 * La division est montrée sous la forme « numérateur / dénominateur = % »,
 * avec le groupe nommé en français : c'est ce qui relie le calcul au sens du
 * mot « parmi ».
 *
 * RÈGLE GÉNÉRALE DU PROJET : jamais figé après validation de l'étape.
 */
const REFS = [
  { id: 'total', label: 'Tout le monde', phrase: (r, c) => 'de l’ensemble des enquêtés' },
  { id: 'col', label: 'Sa colonne', phrase: (r, c) => `parmi les « ${c} »` },
  { id: 'row', label: 'Sa ligne', phrase: (r, c) => `parmi les « ${r} »` },
];

export default function ReferenceLab({ table, row, col, refMode, onPick, onRefChange, rowsTitle = '', colsTitle = '' }) {
  const { cells, rowTotals, colTotals, grandTotal, rowOrder, colOrder } = table;
  const n = row && col ? cells[row][col] : null;
  const den = refMode === 'total' ? grandTotal : refMode === 'row' ? (row ? rowTotals[row] : null) : (col ? colTotals[col] : null);
  const ref = REFS.find((r) => r.id === refMode);

  const lit = (r, c) => {
    if (!row || !col) return false;
    if (refMode === 'total') return true;
    if (refMode === 'row') return r === row;
    return c === col;
  };

  return (
    <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Population de référence">
        <span className="text-sm font-semibold text-slate-700 self-center mr-1">Référence :</span>
        {REFS.map((r) => (
          <button key={r.id} type="button" aria-pressed={refMode === r.id}
            onClick={() => onRefChange(r.id)}
            className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              refMode === r.id ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400'
            }`}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th scope="col" className="border-2 border-slate-300 bg-slate-100 px-3 py-2 text-left text-xs font-bold text-slate-600">
                {rowsTitle} \ {colsTitle}
              </th>
              {colOrder.map((c) => (
                <th key={c} scope="col" className="border-2 border-slate-300 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">{c}</th>
              ))}
              <th scope="col" className="border-2 border-slate-400 bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {rowOrder.map((r) => (
              <tr key={r}>
                <th scope="row" className="border-2 border-slate-300 bg-slate-100 px-3 py-2 text-left text-xs font-bold text-slate-700">{r}</th>
                {colOrder.map((c) => {
                  const isNum = r === row && c === col;
                  const inRef = lit(r, c);
                  return (
                    <td key={c} className="border-2 border-slate-300 p-0">
                      <button type="button" onClick={() => onPick(r, c)}
                        aria-label={`Choisir la case ${r} et ${c}, effectif ${cells[r][c]}`}
                        aria-pressed={isNum}
                        className={`w-full min-h-[48px] px-3 py-2 text-center font-mono tabular-nums text-base font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          isNum ? 'bg-indigo-600 text-white'
                            : inRef ? 'bg-indigo-100 text-indigo-900'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}>
                        {cells[r][c]}
                      </button>
                    </td>
                  );
                })}
                <td className={`border-2 border-slate-400 px-3 py-2 text-center font-mono tabular-nums font-bold ${
                  refMode === 'row' && r === row ? 'bg-indigo-300 text-indigo-950' : 'bg-slate-50 text-slate-800'
                }`}>
                  {rowTotals[r]}
                </td>
              </tr>
            ))}
            <tr>
              <th scope="row" className="border-2 border-slate-400 bg-slate-200 px-3 py-2 text-left text-xs font-bold text-slate-700">Total</th>
              {colOrder.map((c) => (
                <td key={c} className={`border-2 border-slate-400 px-3 py-2 text-center font-mono tabular-nums font-bold ${
                  refMode === 'col' && c === col ? 'bg-indigo-300 text-indigo-950' : 'bg-slate-50 text-slate-800'
                }`}>
                  {colTotals[c]}
                </td>
              ))}
              <td className={`border-2 border-slate-500 px-3 py-2 text-center font-mono tabular-nums font-black ${
                refMode === 'total' ? 'bg-amber-300 text-amber-950' : 'bg-slate-200 text-slate-900'
              }`}>
                {grandTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3.5 space-y-1.5">
        {row && col ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
              « {row} » et « {col} », {ref.phrase(row, col)}
            </p>
            <p className="font-mono text-sm text-indigo-900">
              {n} / {den} = <span className="text-lg font-black">{formatPercent(n / den, 1)}</span>
            </p>
            <p className="text-xs text-indigo-700">
              Le numérateur ne change pas ({n} personnes) : c’est le <strong>dénominateur</strong> qui dépend du
              groupe de référence choisi.
            </p>
          </>
        ) : (
          <p className="text-sm text-indigo-800">Clique une case du tableau pour choisir le numérateur.</p>
        )}
      </div>
    </div>
  );
}
