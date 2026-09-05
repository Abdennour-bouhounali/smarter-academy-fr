import React from 'react';
import { formatDec } from './proportionUtils';

/**
 * ProportionTable — le tableau de proportionnalité, deux lignes.
 *
 * Rend visible ce qui, sur le papier, reste implicite : les FLÈCHES. Deux
 * lectures coexistent et la leçon les distingue explicitement —
 *
 *   · verticale  : d'une grandeur à l'autre, on multiplie toujours par le
 *     même nombre (le coefficient) ;
 *   · horizontale : d'une colonne à l'autre, on applique un facteur (×2,
 *     ÷3…) aux DEUX lignes en même temps.
 *
 * Les cases à trouver sont de vrais <button> quand `onCellClick` est fourni,
 * et le composant n'affiche jamais un nombre qu'il n'a pas reçu : les
 * valeurs viennent du module, qui les calcule via proportionUtils.
 */
export default function ProportionTable({
  xLabel,
  yLabel,
  columns,                 // [{ x, y }] — y peut être null (case à trouver)
  unit = '',
  xUnit = '',
  selectedIndex = null,
  onCellClick = null,      // (index) => void
  wrongIndex = null,
  solvedIndexes = [],
  coefficient = null,      // affiche la flèche verticale « ×k » si fourni
  horizontalHint = null,   // { from, to, factor } — flèche horizontale
  disabled = false,
  caption = 'Tableau de proportionnalité',
}) {
  const interactive = typeof onCellClick === 'function' && !disabled;

  return (
    <div className="w-full overflow-x-auto flex justify-center">
      <div className="inline-block">
        <table className="border-collapse mx-auto text-sm">
          <caption className="caption-top text-xs text-slate-500 mb-2 font-medium">{caption}</caption>
          <tbody>
            <tr>
              <th scope="row" className="bg-slate-700 text-white font-semibold px-3 py-2 border border-slate-300 text-left whitespace-nowrap">
                {xLabel} {xUnit && <span className="font-normal text-slate-300">({xUnit})</span>}
              </th>
              {columns.map((c, i) => (
                <td
                  key={`x-${c.x}`}
                  className={`px-3 py-2 border border-slate-300 text-center font-mono font-bold min-w-[62px] ${
                    selectedIndex === i ? 'bg-violet-100' : 'bg-slate-50'
                  } text-slate-800`}
                >
                  {formatDec(c.x)}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="bg-slate-700 text-white font-semibold px-3 py-2 border border-slate-300 text-left whitespace-nowrap">
                {yLabel} {unit && <span className="font-normal text-slate-300">({unit})</span>}
              </th>
              {columns.map((c, i) => {
                const known = c.y !== null && c.y !== undefined;
                const isSolved = solvedIndexes.includes(i);
                const isWrong = wrongIndex === i;
                const label = known ? formatDec(c.y) : '?';

                const cls = `px-3 py-2 text-center font-mono font-bold min-w-[62px] h-11 ${
                  isWrong
                    ? 'bg-rose-100 text-rose-700'
                    : isSolved
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedIndex === i
                    ? 'bg-violet-500 text-white'
                    : known
                    ? 'bg-white text-slate-800'
                    : 'bg-amber-50 text-amber-600'
                }`;

                if (!interactive || known) {
                  return (
                    <td
                      key={`y-${c.x}`}
                      className={`border border-slate-300 ${cls}`}
                      aria-label={`${xLabel} ${formatDec(c.x)} ${xUnit} : ${known ? `${formatDec(c.y)} ${unit}` : 'valeur à trouver'}`}
                    >
                      {label}
                    </td>
                  );
                }
                return (
                  <td key={`y-${c.x}`} className="p-0 border border-slate-300">
                    <button
                      type="button"
                      onClick={() => onCellClick(i)}
                      aria-label={`Trouver la valeur pour ${formatDec(c.x)} ${xUnit}`}
                      aria-pressed={selectedIndex === i}
                      className={`w-full ${cls} hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400`}
                    >
                      {label}
                    </button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>

        {(coefficient !== null || horizontalHint) && (
          <div className="mt-2 space-y-1 text-center">
            {coefficient !== null && (
              <p className="text-xs font-mono text-violet-700">
                ↓ D'une ligne à l'autre : toujours <strong>×{formatDec(coefficient)}</strong>
              </p>
            )}
            {horizontalHint && (
              <p className="text-xs font-mono text-sky-700">
                → De {formatDec(horizontalHint.from)} à {formatDec(horizontalHint.to)} :{' '}
                <strong>×{formatDec(horizontalHint.factor)}</strong> sur les DEUX lignes
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
