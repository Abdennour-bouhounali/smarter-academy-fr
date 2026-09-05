import React from 'react';
import { formatDec } from './propUtils';

/**
 * RatioTable — le tableau de proportionnalité à deux lignes, avec ses flèches.
 *
 * Rend visible ce qui, sur le papier, reste implicite :
 *   · la lecture VERTICALE (×k d'une ligne à l'autre — le coefficient) ;
 *   · la lecture HORIZONTALE (×f d'une colonne à l'autre — les DEUX lignes) ;
 *   · la ligne des RAPPORTS y ÷ x, révélée colonne par colonne quand
 *     `onColumnTap` est fourni : c'est le geste du module 2.
 *
 * Une case `y: null` est une case à trouver (« ? »). Le composant n'affiche
 * jamais un nombre qu'il n'a pas reçu : les valeurs viennent du module, qui
 * les calcule via propUtils.
 *
 * SÉCURITÉ D'AFFICHAGE : un vrai <table> dans un conteneur `overflow-x-auto`,
 * les flèches sont des cellules (jamais en position absolue) — aucune
 * superposition possible, quelle que soit la largeur des nombres.
 */
export default function RatioTable({
  xLabel, yLabel, xUnit = '', yUnit = '',
  columns,                  // [{ x, y }] — y peut être null
  ratios = null,            // Set d'index dont le rapport est révélé, ou 'all'
  onColumnTap = null,       // (index) => void — révèle le rapport de la colonne
  coefficient = null,       // nombre → flèche verticale « × k »
  horizontal = null,        // { from, to, factor } → flèche horizontale
  highlightIndex = null,
  caption = 'Tableau de proportionnalité',
  disabled = false,
}) {
  const shown = (i) => ratios === 'all' || (ratios && ratios.has(i));
  const tap = typeof onColumnTap === 'function' && !disabled;
  const ratioOf = (c) => (c.y === null || c.x === 0 ? null : c.y / c.x);
  const hasRatios = ratios !== null;

  return (
    <div className="w-full overflow-x-auto">
      <table className="border-collapse mx-auto text-sm">
        <caption className="caption-top text-xs text-slate-500 mb-2 font-medium">{caption}</caption>
        <tbody>
          {horizontal && (
            <tr>
              <td />
              {columns.map((c, i) => {
                if (i === horizontal.from) {
                  const span = horizontal.to - horizontal.from + 1;
                  return (
                    <td key={`h${i}`} colSpan={span} className="text-center text-xs font-mono font-bold text-amber-700 pb-1 whitespace-nowrap">
                      ⟶ × {formatDec(horizontal.factor)} ⟶
                    </td>
                  );
                }
                if (i > horizontal.from && i <= horizontal.to) return null;
                return <td key={`h${i}`} />;
              })}
            </tr>
          )}
          <tr>
            <th scope="row" className="bg-slate-700 text-white font-semibold px-3 py-2 border border-slate-300 text-left whitespace-nowrap">
              {xLabel} {xUnit && <span className="font-normal text-slate-300">({xUnit})</span>}
            </th>
            {columns.map((c, i) => (
              <td key={`x${i}`} className={`px-3 py-2 border border-slate-300 text-center font-mono font-bold min-w-[64px] ${highlightIndex === i ? 'bg-indigo-100' : 'bg-slate-50'} text-slate-800`}>
                {formatDec(c.x)}
              </td>
            ))}
          </tr>
          {coefficient !== null && (
            <tr>
              <td className="text-right pr-2 text-xs font-mono font-bold text-indigo-700 whitespace-nowrap">× {formatDec(coefficient)} ⬇</td>
              {columns.map((_, i) => <td key={`k${i}`} className="text-center text-indigo-300" aria-hidden="true">⬇</td>)}
            </tr>
          )}
          <tr>
            <th scope="row" className="bg-slate-700 text-white font-semibold px-3 py-2 border border-slate-300 text-left whitespace-nowrap">
              {yLabel} {yUnit && <span className="font-normal text-slate-300">({yUnit})</span>}
            </th>
            {columns.map((c, i) => (
              <td key={`y${i}`} className={`px-3 py-2 border border-slate-300 text-center font-mono font-bold min-w-[64px] ${c.y === null ? 'bg-amber-50 text-amber-700 border-dashed border-amber-400' : highlightIndex === i ? 'bg-indigo-100 text-slate-800' : 'bg-white text-slate-800'}`}>
                {c.y === null ? '?' : formatDec(c.y)}
              </td>
            ))}
          </tr>
          {hasRatios && (
            <tr>
              <th scope="row" className="bg-indigo-700 text-white font-semibold px-3 py-2 border border-slate-300 text-left whitespace-nowrap">
                {yLabel} ÷ {xLabel}
              </th>
              {columns.map((c, i) => {
                const r = ratioOf(c);
                const on = shown(i);
                const cell = on ? (r === null ? '—' : formatDec(r)) : (tap ? '?' : '');
                return (
                  <td key={`r${i}`} className={`border border-slate-300 text-center font-mono font-bold ${on ? 'bg-indigo-50 text-indigo-800' : 'bg-white text-slate-400'} p-0`}>
                    {tap && !on ? (
                      <button type="button" onClick={() => onColumnTap(i)} aria-label={`Révéler le rapport de la colonne ${formatDec(c.x)}`}
                        className="w-full min-h-[44px] min-w-[64px] px-2 font-mono font-bold text-indigo-700 hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                        style={{ touchAction: 'manipulation' }}>?</button>
                    ) : (
                      <span className="inline-block px-3 py-2">{cell}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
