import React from 'react';

/**
 * FileSorter — LE laboratoire d'ouverture : ranger les fiches une par une.
 *
 * Activité (INTERACTION_PEDAGOGY §24) :
 *  - objectif : faire éprouver qu'un tableau croisé est un COMPTAGE exhaustif
 *    et sans recouvrement — chaque individu va dans une case, et une seule ;
 *  - action de l'élève : lire la fiche affichée et cliquer la case du tableau
 *    où elle doit aller ;
 *  - variable contrôlée : le rangement lui-même ;
 *  - conséquence visuelle immédiate : la case s'incrémente, la fiche suivante
 *    apparaît, les marges se recalculent en direct.
 *
 * Le geste est le comptage. Une fiche mal rangée est corrigée sur place (la
 * bonne case clignote) sans bloquer : l'élève apprend en rangeant, il n'est
 * pas évalué. Un bouton permet de finir automatiquement le rangement, pour
 * que la mécanique une fois comprise ne devienne pas une corvée de 60 clics.
 *
 * RÈGLE GÉNÉRALE DU PROJET : jamais figé après validation de l'étape.
 */
export default function FileSorter({
  eleves,
  index,                 // fiche courante
  counts,                // { [ligne]: { [colonne]: n } }
  rowOrder, colOrder,
  rowKey, colKey,
  onPlace,               // (row, col, correct) => void
  onFinishAll,
  wrong = null,          // { row, col } — dernier mauvais placement
  labels = {},
}) {
  const done = index >= eleves.length;
  const fiche = done ? null : eleves[index];
  const total = rowOrder.reduce((a, r) => a + colOrder.reduce((b, c) => b + counts[r][c], 0), 0);

  const rowTotal = (r) => colOrder.reduce((a, c) => a + counts[r][c], 0);
  const colTotal = (c) => rowOrder.reduce((a, r) => a + counts[r][c], 0);

  return (
    <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-4">
      {/* LA FICHE : l'individu à ranger, lisible d'un coup d'œil. */}
      {fiche ? (
        <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4 space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
            Fiche {index + 1} sur {eleves.length}
          </p>
          <p className="text-xl font-black text-indigo-900">{fiche.prenom}</p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-sm font-bold text-indigo-800">
              {labels[colKey] ?? colKey} : {fiche[colKey]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-sm font-bold text-indigo-800">
              {labels[rowKey] ?? rowKey} : {fiche[rowKey]}
            </span>
          </div>
          <p className="text-xs text-indigo-600">Clique la case du tableau où cette fiche doit aller.</p>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
          <p className="text-sm font-black text-emerald-900">
            ✓ Les {eleves.length} fiches sont rangées.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th scope="col" className="border-2 border-slate-300 bg-slate-100 px-3 py-2 text-left text-xs font-bold text-slate-600">
                {(labels[rowKey] ?? rowKey)} \ {(labels[colKey] ?? colKey)}
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
                  const isWrong = wrong && wrong.row === r && wrong.col === c;
                  const isTarget = fiche && fiche[rowKey] === r && fiche[colKey] === c;
                  return (
                    <td key={c} className="border-2 border-slate-300 p-0">
                      <button type="button"
                        onClick={() => fiche && onPlace(r, c, isTarget)}
                        disabled={done}
                        aria-label={`Ranger dans ${r} et ${c}, actuellement ${counts[r][c]}`}
                        className={`w-full min-h-[52px] px-3 py-2 text-center font-mono tabular-nums text-lg font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          isWrong ? 'bg-rose-100 text-rose-800'
                            : done ? 'bg-white text-slate-800'
                            : 'bg-white text-slate-800 hover:bg-indigo-50'
                        }`}>
                        {counts[r][c]}
                      </button>
                    </td>
                  );
                })}
                <td className="border-2 border-slate-400 bg-slate-50 px-3 py-2 text-center font-mono tabular-nums font-bold text-slate-800">
                  {rowTotal(r)}
                </td>
              </tr>
            ))}
            <tr>
              <th scope="row" className="border-2 border-slate-400 bg-slate-200 px-3 py-2 text-left text-xs font-bold text-slate-700">Total</th>
              {colOrder.map((c) => (
                <td key={c} className="border-2 border-slate-400 bg-slate-50 px-3 py-2 text-center font-mono tabular-nums font-bold text-slate-800">
                  {colTotal(c)}
                </td>
              ))}
              <td className="border-2 border-slate-500 bg-slate-200 px-3 py-2 text-center font-mono tabular-nums font-black text-slate-900">
                {total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!done && (
          <button type="button" onClick={onFinishAll}
            className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Ranger automatiquement les fiches restantes
          </button>
        )}
        <span className="text-xs text-slate-500">{total} fiche{total > 1 ? 's' : ''} rangée{total > 1 ? 's' : ''} sur {eleves.length}</span>
      </div>
    </div>
  );
}
