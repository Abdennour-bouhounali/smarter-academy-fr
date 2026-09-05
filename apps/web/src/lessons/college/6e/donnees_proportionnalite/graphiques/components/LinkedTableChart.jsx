import React from 'react';
import BarChart from './BarChart';
import { formatValue, niceMax, snapValue } from './chartUtils';

/**
 * LinkedTableChart — LA manipulation signature de la leçon Graphiques.
 *
 * UNE SEULE DONNÉE, DEUX RENDUS. Le composant ne possède aucun état : il
 * reçoit `series` et remonte chaque modification par `onChange(i, valeur)`.
 * Le tableau et le diagramme lisent donc littéralement le même tableau de
 * nombres — il est structurellement impossible qu'ils se contredisent
 * (CLAUDE.md §8 : jamais deux états mathématiques indépendants).
 *
 * GESTE : deux entrées pour la même donnée —
 *   · tirer le sommet d'une barre (doigt, souris, flèches du clavier) ;
 *   · appuyer sur − / + dans la case du tableau.
 * Dans les deux cas, l'AUTRE représentation bouge sous les yeux de l'élève.
 *
 * CE QUE ÇA REND VISIBLE : un graphique n'illustre pas un tableau, il le
 * REDIT. La hauteur EST le nombre.
 */
export default function LinkedTableChart({
  series,
  onChange,                 // (i, value) => void
  step = 1,
  tone = 'emerald',
  title = '',
  axisLabel = '',
  editableIndex = null,     // limite le réglage à une seule catégorie
  target = null,            // { index, value } — objectif à atteindre
  disabled = false,
  tableCaption = 'Tableau des données',
  axisFloor = 0,            // fige l'échelle quand la série part de zéro
}) {
  const max = niceMax(series, 5, axisFloor);

  const bump = (i, delta) => {
    if (disabled) return;
    if (editableIndex !== null && editableIndex !== i) return;
    const next = snapValue(series.values[i] + delta, step, max);
    if (next !== series.values[i]) onChange?.(i, next);
  };

  return (
    <div className="space-y-4">
      <BarChart
        series={series}
        mode={disabled ? 'display' : 'edit'}
        editStep={step}
        editableIndex={editableIndex}
        axisFloor={axisFloor}
        target={target}
        onChange={onChange}
        tone={tone}
        title={title}
        axisLabel={axisLabel}
        disabled={disabled}
      />

      <div className="w-full overflow-x-auto flex justify-center">
        <table className="border-collapse mx-auto text-sm">
          <caption className="caption-top text-xs text-slate-500 mb-2 font-medium">{tableCaption}</caption>
          <thead>
            <tr>
              {series.categories.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="bg-slate-700 text-white font-semibold px-2 py-2 border border-slate-300 text-center text-xs whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {series.values.map((v, i) => {
                const canEdit = !disabled && (editableIndex === null || editableIndex === i);
                return (
                  <td key={series.categories[i]} className="border border-slate-300 p-1 bg-white align-middle">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-mono font-bold text-slate-800 text-sm" aria-hidden="true">
                        {formatValue(series, v)}
                      </span>
                      {canEdit && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => bump(i, -step)}
                            aria-label={`Diminuer ${series.categories[i]}, actuellement ${formatValue(series, v)}`}
                            className="w-11 h-11 rounded-lg border-2 border-slate-300 bg-white text-slate-600 font-bold hover:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                          >
                            −
                          </button>
                          <button
                            type="button"
                            onClick={() => bump(i, step)}
                            aria-label={`Augmenter ${series.categories[i]}, actuellement ${formatValue(series, v)}`}
                            className="w-11 h-11 rounded-lg border-2 border-slate-300 bg-white text-slate-600 font-bold hover:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
