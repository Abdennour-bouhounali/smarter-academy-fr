import React from 'react';
import { Feedback } from '../../../../../common/components/LessonUI';

/**
 * TableFiller — REMPLIR soi-même un tableau croisé, case par case.
 *
 * Activity               quatre cases intérieures à saisir ; les marges et le
 *                        total se recalculent en direct à partir de ce que
 *                        l'élève a écrit, jamais à partir de la solution.
 * Mathematical objective un tableau croisé se complète par différences, et il
 *                        se VÉRIFIE : la somme des lignes et celle des colonnes
 *                        doivent retomber sur le même total.
 * Controlled variable    la valeur de chaque case intérieure.
 * Mathematical state     `values` : { [row_col]: number|null }.
 * Visual consequence     chaque case juste passe en vert ; les marges affichent
 *                        la somme SAISIE et se comparent à la marge attendue.
 * Misconception targeted « le tableau est un décor » — non : c'est un
 *                        instrument de contrôle, les marges dénoncent l'erreur.
 *
 * Jamais gelé : les champs restent modifiables après réussite.
 */
export default function TableFiller({
  rows,                  // [{ id, label, total }]
  cols,                  // [{ id, label }]
  target,                // { [`${rowId}_${colId}`]: number }
  values,                // idem, valeurs saisies (number | null)
  onChange,
  grandTotal,
  rowsTitle = '',
  colsTitle = '',
}) {
  const key = (r, c) => `${r}_${c}`;
  const val = (r, c) => values[key(r, c)];
  const okCell = (r, c) => val(r, c) != null && val(r, c) === target[key(r, c)];
  const allOk = rows.every((r) => cols.every((c) => okCell(r.id, c.id)));

  // Les marges sont calculées sur ce que l'élève a SAISI : c'est ce qui rend
  // l'erreur visible avant qu'on ne la lui signale.
  const rowSum = (r) => cols.reduce((s, c) => s + (val(r, c.id) ?? 0), 0);
  const colSum = (c) => rows.reduce((s, r) => s + (val(r.id, c) ?? 0), 0);
  const colTarget = (c) => rows.reduce((s, r) => s + target[key(r.id, c)], 0);
  const filled = rows.every((r) => cols.every((c) => val(r.id, c.id) != null));
  const total = rows.reduce((s, r) => s + rowSum(r.id), 0);

  const cellCls = (r, c) => {
    const v = val(r, c);
    if (v == null) return 'border-slate-300 bg-white';
    return okCell(r, c) ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-amber-400 bg-amber-50 text-amber-900';
  };

  return (
    <div className="space-y-3" role="group" aria-label="Tableau croisé à compléter">
      <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
        <table className="w-full text-sm tabular-nums">
          <caption className="sr-only">Tableau croisé à compléter : {rowsTitle} en lignes, {colsTitle} en colonnes</caption>
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th scope="col" className="px-3 py-2 text-left font-bold">{rowsTitle}</th>
              {cols.map((c) => <th key={c.id} scope="col" className="px-3 py-2 text-center font-bold">{c.label}</th>)}
              <th scope="col" className="px-3 py-2 text-center font-bold bg-slate-100">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <th scope="row" className="px-3 py-2 text-left font-bold text-slate-700">{r.label}</th>
                {cols.map((c) => (
                  <td key={c.id} className="px-2 py-2 text-center">
                    <input
                      type="text" inputMode="numeric"
                      className={`w-20 min-h-[44px] rounded-lg border-2 px-2 text-center font-mono font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${cellCls(r.id, c.id)}`}
                      value={val(r.id, c.id) ?? ''}
                      aria-label={`${r.label}, ${c.label}`}
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        const n = raw === '' ? null : Number(raw.replace(/\s/g, ''));
                        onChange({ ...values, [key(r.id, c.id)]: raw === '' ? null : (Number.isFinite(n) ? n : null) });
                      }}
                    />
                  </td>
                ))}
                <td className={`px-3 py-2 text-center font-mono font-bold ${rowSum(r.id) === r.total ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {rowSum(r.id)}<span className="text-xs font-normal text-slate-400"> / {r.total}</span>
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-300 bg-slate-50">
              <th scope="row" className="px-3 py-2 text-left font-bold text-slate-700">Total</th>
              {cols.map((c) => (
                <td key={c.id} className={`px-3 py-2 text-center font-mono font-bold ${colSum(c.id) === colTarget(c.id) ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {colSum(c.id)}
                </td>
              ))}
              <td className={`px-3 py-2 text-center font-mono font-black ${total === grandTotal ? 'text-emerald-700' : 'text-slate-500'}`} data-grand-total={total}>
                {total}<span className="text-xs font-normal text-slate-400"> / {grandTotal}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {allOk ? (
        <Feedback tone="ok">
          Les quatre cases sont justes, et les marges tombent : {rows.map((r) => r.total).join(' + ')} = {grandTotal}
          {' '}en lignes, autant en colonnes. <strong>C’est cette double vérification qui fait du tableau
          un instrument de contrôle</strong>, et pas un simple décor.
        </Feedback>
      ) : filled ? (
        <Feedback tone="ko">
          Le tableau est rempli, mais une marge au moins ne tombe pas juste. Compare chaque total de
          ligne à celui qui est attendu : la case fautive est sur cette ligne.
        </Feedback>
      ) : (
        <Feedback tone="info">
          Remplis les quatre cases intérieures. Les totaux se recalculent au fur et à mesure — utilise-les
          pour te vérifier : une ligne se complète par différence.
        </Feedback>
      )}
    </div>
  );
}
