import React from 'react';
import { independence, conditional, pct, quotient, ratValue } from './indepUtils';

/**
 * CrossJudge — le tableau croisé d'où se lit un VERDICT.
 *
 * Trois modules s'en servent, pour trois usages qui ne diffèrent que par ce
 * qu'ils dévoilent :
 *   · module 3, `reveal="poids"` — les deux poids de deuxième génération, à
 *     comparer À L'ŒIL. Le verdict reste caché : c'est l'élève qui juge.
 *   · module 4, `reveal="calcul"` — l'égalité d'entiers, posée en toutes
 *     lettres : n(A ∩ B) × N d'un côté, n(A) × n(B) de l'autre.
 *   · module 5, `reveal="tout"` — les deux, plus la ligne d'incompatibilité.
 *
 * POURQUOI UN TABLEAU ET PAS UN ARBRE ICI. L'arbre du module 1 sert à faire
 * NAÎTRE le constat ; à partir du module 3 il faut COMPTER, et le tableau met
 * les quatre effectifs et leurs marges sous les yeux en même temps. Les deux
 * représentations disent la même chose ; on choisit celle dont le geste a
 * besoin (INTERACTION_PEDAGOGY §16).
 *
 * TOUS LES NOMBRES SONT DANS LE DOM. Le composant n'a aucun SVG : ni collision,
 * ni débordement possible, à n'importe quelle largeur. Le tableau lui-même est
 * dans un conteneur `overflow-x-auto`, seule exception admise à la règle du
 * défilement horizontal.
 *
 * `onCellClick` est optionnel : quand il est fourni, les quatre cases
 * deviennent des boutons — et elles le RESTENT après validation. Aucun `done`
 * ne les désactive.
 */
export default function CrossJudge({
  table,
  labels = {},
  rowKey,
  colKey,
  title = null,
  reveal = 'poids',           // 'poids' | 'calcul' | 'tout' | 'aucun'
  selected = null,            // 'r/c' — la case mise en avant
  onCellClick = null,
  totalLabel = 'total',
}) {
  const ind = independence(table, { rowKey, colKey });
  const { rows, cols, cells, rowTotals, colTotals, total } = table;
  const otherRow = rows.find((r) => r !== rowKey);
  const poidsA = conditional(table, { axis: 'row', key: rowKey }, colKey);
  const poidsNotA = conditional(table, { axis: 'row', key: otherRow }, colKey);
  const lab = (k) => labels[k] ?? k;

  const cellClass = (r, c) => {
    const on = selected === `${r}/${c}`;
    const inter = r === rowKey && c === colKey;
    return [
      'px-2 py-1.5 text-right font-mono tabular-nums transition',
      inter ? 'font-black text-fuchsia-800 bg-fuchsia-50' : 'text-slate-700',
      on ? 'ring-2 ring-inset ring-indigo-500' : '',
      onCellClick ? 'cursor-pointer hover:bg-indigo-50' : '',
    ].join(' ');
  };

  return (
    <div className="rounded-2xl border-2 border-sky-100 bg-white p-4 space-y-3">
      {title && <p className="text-sm font-bold text-slate-700">{title}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="px-2 py-1 text-left font-semibold" />
              {cols.map((c) => (
                <th key={c} className={`px-2 py-1 text-right font-semibold ${c === colKey ? 'text-fuchsia-700' : ''}`}>
                  {lab(c)}
                </th>
              ))}
              <th className="px-2 py-1 text-right font-semibold">{totalLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r} className="border-t border-slate-100">
                <th scope="row" className={`px-2 py-1.5 text-left text-xs font-semibold ${r === rowKey ? 'text-indigo-700' : 'text-slate-500'}`}>
                  {lab(r)}
                </th>
                {cols.map((c) => (
                  <td key={c} className={cellClass(r, c)}
                    onClick={onCellClick ? () => onCellClick(`${r}/${c}`) : undefined}>
                    {cells[r][c]}
                  </td>
                ))}
                <td className="px-2 py-1.5 text-right font-mono font-bold tabular-nums text-slate-600">
                  {rowTotals[r]}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-300 bg-slate-50">
              <th scope="row" className="px-2 py-1.5 text-left text-xs font-semibold text-slate-500">{totalLabel}</th>
              {cols.map((c) => (
                <td key={c} className="px-2 py-1.5 text-right font-mono font-bold tabular-nums text-slate-600">
                  {colTotals[c]}
                </td>
              ))}
              <td className="px-2 py-1.5 text-right font-mono font-black tabular-nums text-slate-800">{total}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {(reveal === 'poids' || reveal === 'tout') && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2">
            <p className="text-xs text-indigo-900">
              parmi les <strong>{lab(rowKey)}</strong>, la part de « {lab(colKey)} »
            </p>
            <p className="font-mono text-lg font-black tabular-nums text-indigo-900">
              {quotient(cells[rowKey][colKey], rowTotals[rowKey])} = {pct(poidsA, 1)}
            </p>
          </div>
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 px-3 py-2">
            <p className="text-xs text-sky-900">
              parmi les <strong>{lab(otherRow)}</strong>, la part de « {lab(colKey)} »
            </p>
            <p className="font-mono text-lg font-black tabular-nums text-sky-900">
              {quotient(cells[otherRow][colKey], rowTotals[otherRow])} = {pct(poidsNotA, 1)}
            </p>
          </div>
        </div>
      )}

      {(reveal === 'calcul' || reveal === 'tout') && (
        <div className={`rounded-xl border-2 px-3 py-2.5 ${ind.independent ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
            le test, sur des entiers
          </p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-base font-black tabular-nums">
            <span>{ind.counts.nAB} × {ind.counts.N} = {ind.exact.left}</span>
            <span className={ind.independent ? 'text-emerald-700' : 'text-rose-700'}>
              {ind.independent ? '=' : '≠'}
            </span>
            <span>{ind.counts.nA} × {ind.counts.nB} = {ind.exact.right}</span>
          </div>
          <p className={`mt-1 text-xs font-semibold ${ind.independent ? 'text-emerald-800' : 'text-rose-800'}`}>
            {ind.independent
              ? 'l’égalité tient : ces deux événements sont indépendants'
              : `l’égalité est fausse (écart de ${Math.abs(ind.exact.left - ind.exact.right)}) : ils ne sont pas indépendants`}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            P(A ∩ B) = {pct(ind.pInter, 2)} · P(A) × P(B) = {pct(ind.pAtimesPB, 2)}
          </p>
        </div>
      )}

      {reveal === 'tout' && (
        <p className="text-xs text-slate-500">
          Case commune : <strong className="tabular-nums">{ind.counts.nAB}</strong>{' '}
          {ind.counts.nAB === 0
            ? '— aucune : les deux ne se produisent jamais ensemble.'
            : '— il en existe, donc les deux peuvent se produire ensemble.'}
          {' '}P(A) = {pct(ind.pA, 1)} · P(B) = {pct(ind.pB, 1)}
          {ind.counts.nAB === 0 && ratValue(ind.pAtimesPB) > 0 && (
            <> · et pourtant P(A) × P(B) = {pct(ind.pAtimesPB, 2)} n’est pas nul.</>
          )}
        </p>
      )}
    </div>
  );
}
