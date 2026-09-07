import React from 'react';
import { formatPercent } from './statsUtils';

/**
 * CrossTableView — un tableau croisé d'effectifs, avec ses marges et son
 * total général, et la mise en évidence de la population de RÉFÉRENCE.
 *
 * Partagé par « Tableaux croisés », « Fréquences conditionnelles »,
 * « Probabilités conditionnelles » et « Tests diagnostiques ». Le point
 * pédagogique qu'il rend visible : selon la condition, ce n'est pas la même
 * case qui sert de DÉNOMINATEUR. `highlight` colore la ligne, la colonne ou
 * le total qui joue ce rôle ; `mode` choisit ce qu'affichent les cases.
 *
 * @param {object} table            sortie de crossTable()
 * @param {{rows:object, cols:object}} labels  libellés lisibles des modalités
 * @param {'counts'|'conditional'|'joint'} [mode='counts']
 * @param {{axis:'row'|'col'|'total', key?:string}} [highlight]
 * @param {(row,col)=>void} [onCellClick]
 */
export default function CrossTableView({
  table,
  labels = { rows: {}, cols: {} },
  rowsTitle = '',
  colsTitle = '',
  mode = 'counts',
  highlight = null,
  onCellClick = null,
  cellNote = null,     // (row, col) => ReactNode — annotation sous la valeur
  caption,
}) {
  const { cells, rowTotals, colTotals, grandTotal, rowOrder, colOrder } = table;

  const isRowLit = (r) => highlight?.axis === 'row' && highlight.key === r;
  const isColLit = (c) => highlight?.axis === 'col' && highlight.key === c;
  const isTotalLit = highlight?.axis === 'total';

  // Le dénominateur dépend de la condition : c'est exactement ce que la
  // leçon fait manipuler, donc il est calculé ici et pas dans chaque module.
  const denominatorFor = (r, c) => {
    if (highlight?.axis === 'row') return rowTotals[highlight.key];
    if (highlight?.axis === 'col') return colTotals[highlight.key];
    return grandTotal;
  };

  const valueOf = (r, c) => {
    const n = cells[r][c];
    if (mode === 'counts') return String(n);
    if (mode === 'joint') return grandTotal ? formatPercent(n / grandTotal) : '—';
    // conditionnelle : n'a de sens que dans la ligne/colonne de référence
    const inScope = highlight?.axis === 'row' ? highlight.key === r
      : highlight?.axis === 'col' ? highlight.key === c : true;
    if (!inScope) return String(n);
    const d = denominatorFor(r, c);
    return d ? formatPercent(n / d) : '—';
  };

  const litCell = (r, c) => isRowLit(r) || isColLit(c);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm" aria-label={caption ?? 'Tableau croisé'}>
        {caption && <caption className="text-xs text-slate-500 mb-2 text-left">{caption}</caption>}
        <thead>
          <tr>
            <th scope="col" className="border border-slate-300 bg-slate-100 px-3 py-2 text-left text-xs font-bold text-slate-600">
              {rowsTitle}{rowsTitle && colsTitle ? ' \\ ' : ''}{colsTitle}
            </th>
            {colOrder.map((c) => (
              <th key={c} scope="col"
                className={`border border-slate-300 px-3 py-2 text-xs font-bold ${isColLit(c) ? 'bg-violet-200 text-violet-900' : 'bg-slate-100 text-slate-700'}`}>
                {labels.cols[c] ?? c}
              </th>
            ))}
            <th scope="col" className={`border border-slate-300 px-3 py-2 text-xs font-bold ${isTotalLit ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-700'}`}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {rowOrder.map((r) => (
            <tr key={r}>
              <th scope="row"
                className={`border border-slate-300 px-3 py-2 text-left text-xs font-bold ${isRowLit(r) ? 'bg-violet-200 text-violet-900' : 'bg-slate-100 text-slate-700'}`}>
                {labels.rows[r] ?? r}
              </th>
              {colOrder.map((c) => (
                <td key={c}
                  className={`border border-slate-300 px-3 py-2 text-center font-mono tabular-nums ${
                    litCell(r, c) ? 'bg-violet-50 font-bold text-violet-900' : 'bg-white text-slate-700'
                  } ${onCellClick ? 'cursor-pointer hover:bg-sky-50' : ''}`}
                  onClick={onCellClick ? () => onCellClick(r, c) : undefined}
                >
                  <div>{valueOf(r, c)}</div>
                  {cellNote && <div className="text-[13px] font-sans text-slate-400">{cellNote(r, c)}</div>}
                </td>
              ))}
              <td className={`border border-slate-300 px-3 py-2 text-center font-mono tabular-nums font-bold ${
                isRowLit(r) ? 'bg-violet-300 text-violet-950' : 'bg-slate-50 text-slate-800'
              }`}>
                {rowTotals[r]}
              </td>
            </tr>
          ))}
          <tr>
            <th scope="row" className="border border-slate-300 bg-slate-200 px-3 py-2 text-left text-xs font-bold text-slate-700">
              Total
            </th>
            {colOrder.map((c) => (
              <td key={c} className={`border border-slate-300 px-3 py-2 text-center font-mono tabular-nums font-bold ${
                isColLit(c) ? 'bg-violet-300 text-violet-950' : 'bg-slate-50 text-slate-800'
              }`}>
                {colTotals[c]}
              </td>
            ))}
            <td className={`border border-slate-300 px-3 py-2 text-center font-mono tabular-nums font-black ${
              isTotalLit ? 'bg-amber-300 text-amber-950' : 'bg-slate-200 text-slate-900'
            }`}>
              {grandTotal}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
