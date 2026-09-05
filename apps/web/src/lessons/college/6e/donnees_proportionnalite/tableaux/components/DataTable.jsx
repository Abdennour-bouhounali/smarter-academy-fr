import React from 'react';
import { cellValue, formatCell, cellAriaLabel, rowTotal, colTotal } from './tableUtils';

/**
 * DataTable — la vue unique du modèle `TableModel` (tableUtils.js).
 *
 * Toute la leçon affiche ses tableaux par ce composant : il n'existe donc
 * qu'UNE façon de dessiner un croisement, et les totaux affichés sont
 * toujours ceux calculés par `rowTotal`/`colTotal` (jamais des nombres
 * recopiés à la main dans le JSX).
 *
 * Règles d'ingénierie appliquées (playbook §10, §12) :
 *  - vrai <table> sémantique avec <caption> et scope="col"/"row" : la
 *    structure ligne/colonne est réellement lue par un lecteur d'écran ;
 *  - une cellule ne devient un <button> que si `onCellClick` est fourni —
 *    sinon c'est une <td> inerte (jamais de faux interactif) ;
 *  - chaque cellule tappable porte l'aria-label COMPLET du croisement
 *    (« Léa, Mardi : 12 € ») : la lecture ne dépend pas du repérage visuel ;
 *  - hauteur de cellule ≥ 44 px, et le tableau défile dans son propre
 *    conteneur overflow-x-auto — jamais de scroll horizontal de page.
 */
const TONES = {
  emerald: { head: 'bg-emerald-600', sel: 'bg-emerald-500 text-white border-emerald-600', ring: 'focus-visible:ring-emerald-400', soft: 'bg-emerald-50' },
  sky: { head: 'bg-sky-600', sel: 'bg-sky-500 text-white border-sky-600', ring: 'focus-visible:ring-sky-400', soft: 'bg-sky-50' },
  violet: { head: 'bg-violet-600', sel: 'bg-violet-500 text-white border-violet-600', ring: 'focus-visible:ring-violet-400', soft: 'bg-violet-50' },
  amber: { head: 'bg-amber-600', sel: 'bg-amber-500 text-white border-amber-600', ring: 'focus-visible:ring-amber-400', soft: 'bg-amber-50' },
  slate: { head: 'bg-slate-700', sel: 'bg-slate-600 text-white border-slate-700', ring: 'focus-visible:ring-slate-400', soft: 'bg-slate-50' },
};

const sameCell = (a, b) => !!a && !!b && a.r === b.r && a.c === b.c;

export default function DataTable({
  table,                     // TableModel
  caption,                   // texte du <caption> (obligatoire pour l'accessibilité)
  onCellClick = null,        // (r, c) => void — rend les cellules tappables
  selected = null,           // { r, c } — cellule sélectionnée
  highlight = [],            // [{ r, c }] — cellules mises en évidence (cible, correction)
  wrongCells = [],           // [{ r, c }] — cellules à marquer en erreur
  highlightRow = null,       // index de ligne à souligner (guidage visuel)
  highlightCol = null,       // index de colonne à souligner
  showRowTotals = false,
  showColTotals = false,
  totalsLabel = 'Total',
  tone = 'slate',
  disabled = false,
  emptyText = '?',
}) {
  const t = TONES[tone] ?? TONES.slate;
  const interactive = typeof onCellClick === 'function' && !disabled;
  const isHi = (r, c) => highlight.some((h) => h.r === r && h.c === c);
  const isWrong = (r, c) => wrongCells.some((h) => h.r === r && h.c === c);

  return (
    <div className="w-full overflow-x-auto flex justify-center">
      <table className="border-collapse mx-auto text-sm">
        <caption className="caption-top text-xs text-slate-500 mb-2 font-medium">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className={`${t.head} text-white font-semibold px-3 py-2 border border-slate-300 text-left rounded-tl-lg`}>
              {table.rowHeader}
            </th>
            {table.colHeaders.map((h, c) => (
              <th
                key={h}
                scope="col"
                className={`${t.head} text-white font-semibold px-3 py-2 border border-slate-300 text-center whitespace-nowrap ${
                  highlightCol === c ? 'ring-2 ring-inset ring-amber-300' : ''
                }`}
              >
                {h}
              </th>
            ))}
            {showRowTotals && (
              <th scope="col" className="bg-slate-800 text-white font-semibold px-3 py-2 border border-slate-300 text-center">
                {totalsLabel}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {table.rowLabels.map((label, r) => (
            <tr key={label}>
              <th
                scope="row"
                className={`bg-slate-100 text-slate-700 font-semibold px-3 py-2 border border-slate-300 text-left whitespace-nowrap ${
                  highlightRow === r ? 'ring-2 ring-inset ring-amber-400' : ''
                }`}
              >
                {label}
              </th>
              {table.colHeaders.map((_, c) => {
                const v = cellValue(table, r, c);
                const shown = v === null ? emptyText : formatCell(table, v);
                const sel = sameCell(selected, { r, c });
                const hi = isHi(r, c);
                const wrong = isWrong(r, c);
                const inCross = highlightRow === r || highlightCol === c;

                const base = `px-3 py-2 border border-slate-300 text-center font-mono min-w-[64px] h-11 ${
                  wrong ? 'bg-rose-100 text-rose-700 font-bold'
                    : sel ? t.sel
                    : hi ? 'bg-amber-100 text-amber-900 font-bold ring-2 ring-inset ring-amber-400'
                    : inCross ? t.soft
                    : v === null ? 'bg-white text-slate-300'
                    : 'bg-white text-slate-800'
                }`;

                if (!interactive) {
                  return (
                    <td key={c} className={base} aria-label={cellAriaLabel(table, r, c)}>
                      {shown}
                    </td>
                  );
                }
                return (
                  <td key={c} className="p-0 border border-slate-300">
                    <button
                      type="button"
                      onClick={() => onCellClick(r, c)}
                      aria-label={cellAriaLabel(table, r, c)}
                      aria-pressed={sel}
                      className={`w-full h-11 px-3 py-2 text-center font-mono min-w-[64px] transition-colors focus:outline-none focus-visible:ring-2 ${t.ring} ${
                        wrong ? 'bg-rose-100 text-rose-700 font-bold'
                          : sel ? t.sel
                          : hi ? 'bg-amber-100 text-amber-900 font-bold'
                          : inCross ? t.soft
                          : v === null ? 'bg-white text-slate-300 hover:bg-slate-50'
                          : 'bg-white text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {shown}
                    </button>
                  </td>
                );
              })}
              {showRowTotals && (
                <td className="px-3 py-2 border border-slate-300 text-center font-mono font-bold bg-slate-800 text-white">
                  {formatCell(table, rowTotal(table, r))}
                </td>
              )}
            </tr>
          ))}
          {showColTotals && (
            <tr>
              <th scope="row" className="bg-slate-800 text-white font-semibold px-3 py-2 border border-slate-300 text-left">
                {totalsLabel}
              </th>
              {table.colHeaders.map((_, c) => (
                <td key={c} className="px-3 py-2 border border-slate-300 text-center font-mono font-bold bg-slate-800 text-white">
                  {formatCell(table, colTotal(table, c))}
                </td>
              ))}
              {showRowTotals && <td className="border border-slate-300 bg-slate-900" />}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
