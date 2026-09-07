import React from 'react';
import BarChart from './BarChart';
import { formatValue } from './chartUtils';

/**
 * LinkedTableChart — LA manipulation signature de la leçon Graphiques.
 *
 * UNE SEULE DONNÉE, DEUX RENDUS. Le composant ne possède aucun état : il
 * reçoit `series` et remonte chaque modification par `onChange(i, valeur)`.
 * Le tableau et le diagramme lisent donc littéralement le même tableau de
 * nombres — il est structurellement impossible qu'ils se contredisent
 * (CLAUDE.md §8 : jamais deux états mathématiques indépendants).
 *
 * GESTE : on TIRE le sommet de la barre — au doigt, à la souris ou aux
 * flèches du clavier (`BarChart` en mode `edit`). Le nombre du tableau change
 * dans le même mouvement, sans clic de validation.
 *
 * PAS DE `+` / `−` (règle projet du 2026-09-06, INTERACTION_PEDAGOGY §16) :
 * une hauteur est une grandeur CONTINUE, et c'est la continuité qui enseigne
 * — en tirant, l'élève traverse toutes les valeurs intermédiaires et voit le
 * nombre les traverser avec lui. Deux boutons auraient fait sauter la barre
 * de cran en cran et rompu le lien entre le geste et la grandeur. Le tableau
 * reste un MIROIR (§11) : il affiche, il ne pilote pas. Le clavier reste
 * disponible sur la barre elle-même (flèches, Début, Fin).
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
                // Le miroir : la case s'allume quand sa barre est celle qu'on
                // règle, pour que le lien hauteur ↔ nombre saute aux yeux.
                const live = !disabled && (editableIndex === null || editableIndex === i);
                return (
                  <td
                    key={series.categories[i]}
                    className={`border border-slate-300 px-2 h-11 text-center align-middle transition-colors ${
                      live ? 'bg-emerald-50' : 'bg-white'
                    }`}
                  >
                    <span
                      className={`font-mono font-bold text-sm tabular-nums ${
                        live ? 'text-emerald-800' : 'text-slate-800'
                      }`}
                    >
                      {formatValue(series, v)}
                    </span>
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
