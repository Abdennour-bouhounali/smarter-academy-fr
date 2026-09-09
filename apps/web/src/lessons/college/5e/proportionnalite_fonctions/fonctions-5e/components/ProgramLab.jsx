import React from 'react';
import { fr } from './fonctionsUtils';

/**
 * ProgramLab — la manipulation du module 3 : le programme de calcul et le
 * tableau qu'il engendre.
 *
 * Activity               choisir un nombre d'entrée, voir le programme se
 *                        dérouler étape par étape, puis inscrire le couple
 *                        obtenu dans le tableau.
 * Mathematical objective un programme de calcul décrit COMMENT la sortie se
 *                        fabrique ; en le rejouant sur plusieurs nombres, on
 *                        engendre un tableau de valeurs.
 * Student action         choisir l'entrée, dérouler, enregistrer.
 * Visual consequence     le déroulé s'écrit ligne à ligne, et la colonne
 *                        apparaît dans le tableau.
 * Expected observation   « le tableau n'est pas donné : je le fabrique ».
 *
 * PÉRIMÈTRE : le déroulé pas à pas remplace la notation f(x), hors programme
 * en 5e. Aucun libellé n'emploie « image » ni « antécédent ».
 *
 * SÉCURITÉ VISUELLE : le tableau défile dans son propre conteneur
 * (`overflow-x-auto`) ; la page ne défile jamais latéralement quel que soit
 * le nombre de colonnes enregistrées.
 */
export default function ProgramLab({
  prog,
  x,
  onX,
  choices,
  recorded,
  onRecord,
  xLabel = 'Nombre choisi',
  yLabel = 'Résultat',
}) {
  const trace = prog.trace(x);
  const already = recorded.some((r) => r.x === x);

  return (
    <div className="space-y-3">
      {/* Le choix de l'entrée. */}
      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-3.5 space-y-2.5">
        <span className="text-sm font-bold text-sky-900">Choisis un nombre de départ</span>
        <div className="flex flex-wrap gap-2">
          {choices.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onX(c)}
              aria-pressed={x === c}
              className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 text-sm font-bold tabular-nums transition-colors ${
                x === c
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-sky-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Le déroulé — ce qui remplace f(x) en 5e. */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Le programme, étape par étape
        </p>
        <ol className="space-y-1.5">
          {trace.map((s, i) => (
            <li
              key={s.label}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 ${
                i === trace.length - 1 ? 'bg-sky-50 border-2 border-sky-300' : 'bg-slate-50'
              }`}
            >
              <span className="text-sm text-slate-700">{s.label}</span>
              <span className="font-mono text-base font-black tabular-nums text-slate-800">
                {fr(s.value)}
              </span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => onRecord(x)}
          disabled={already}
          className="w-full min-h-[44px] rounded-xl border-2 border-sky-500 bg-sky-500 px-3 py-2 text-sm font-bold text-white hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {already ? 'Déjà dans le tableau' : `Inscrire (${fr(x)} ; ${fr(prog.run(x))}) au tableau`}
        </button>
      </div>

      {/* Le tableau engendré. */}
      <div className="rounded-2xl border-2 border-sky-200 bg-white p-3.5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Ton tableau de valeurs
        </p>
        {recorded.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            Il est encore vide — enregistre un premier couple.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-1 px-1">
            <table
              className="w-full text-sm border-collapse"
              style={{ minWidth: `${Math.max(3, recorded.length) * 4.5}rem` }}
            >
              <tbody>
                <tr>
                  <th
                    scope="row"
                    className="text-left text-xs font-semibold text-slate-500 pr-3 whitespace-nowrap"
                  >
                    {xLabel}
                  </th>
                  {recorded.map((r) => (
                    <td
                      key={r.x}
                      className="px-2 py-1.5 text-center font-mono font-bold tabular-nums text-slate-800"
                    >
                      {fr(r.x)}
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-slate-200">
                  <th
                    scope="row"
                    className="text-left text-xs font-semibold text-slate-500 pr-3 whitespace-nowrap"
                  >
                    {yLabel}
                  </th>
                  {recorded.map((r) => (
                    <td
                      key={r.x}
                      className="px-2 py-1.5 text-center font-mono font-bold tabular-nums text-sky-700"
                    >
                      {fr(r.y)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
