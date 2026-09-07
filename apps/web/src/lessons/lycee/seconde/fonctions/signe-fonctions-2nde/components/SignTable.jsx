import React from 'react';
import { signTable, boundText, SIGN_LABEL } from './signeUtils';

/**
 * SignTable — le tableau de signes, rendu ET saisi.
 *
 * Lecture seule : lignes calculées par `signTable` (facteurs puis f). Mode
 * saisie (`editable`) : les cases de signe d'une ligne sont des boutons qui
 * cyclent + / − (les zéros « 0 » et les doubles barres sont fixés : ils
 * viennent de la mathématique, pas de l'élève) ; `values` et `onChange`
 * appartiennent au module. La correction (`reveal`) colore chaque case
 * d'après le tableau exact — la bonne réponse se VOIT dans chaque case.
 *
 * Structure : une ligne « x » (bornes et points critiques), une ligne par
 * facteur si `rows` les donne, la ligne finale. Aucune couleur seule : le
 * signe est toujours écrit.
 */
export function SignRow({ label, table, cells, marks, editable = false, values = null, onChange = null, reveal = false, quotientMarks = null }) {
  // cells: signs to show ; values: student picks (editable) ; reveal: compare values to cells
  const n = cells.length;
  const btn = (i, v) => {
    const truth = cells[i];
    const ok = reveal && v === truth; const ko = reveal && v !== null && v !== truth;
    return (
      <button key={i} type="button" disabled={!editable || reveal} aria-label={`Signe sur l’intervalle ${i + 1}${v ? ` : ${SIGN_LABEL[v]}` : ''}`}
        onClick={() => onChange?.(i, v === '+' ? '−' : '+')}
        className={`min-w-[44px] min-h-[44px] rounded-lg border-2 font-mono font-bold text-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${ok ? 'bg-emerald-600 border-emerald-700 text-white' : ko ? 'bg-rose-600 border-rose-700 text-white' : v ? 'bg-slate-800 border-slate-900 text-white' : 'bg-white border-dashed border-slate-400 text-slate-400'}`}>
        {v ?? '?'}{ko ? ` → ${truth}` : ''}
      </button>
    );
  };
  return (
    <tr className="border-t border-slate-200">
      <th scope="row" className="px-2 py-2 text-left font-mono text-sm font-bold text-slate-700 whitespace-nowrap">{label}</th>
      {Array.from({ length: 2 * n + 1 }).map((_, k) => {
        if (k % 2 === 1) {
          const i = (k - 1) / 2;
          return <td key={k} className="px-1 py-1 text-center">{editable || reveal ? btn(i, values ? values[i] : null) : <span className={`inline-block min-w-[44px] py-1.5 rounded-lg font-mono font-bold text-lg ${cells[i] === '+' ? 'text-emerald-700 bg-emerald-50' : cells[i] === '−' ? 'text-rose-700 bg-rose-50' : 'text-slate-500'}`}>{cells[i] ?? ''}</span>}</td>;
        }
        const j = k / 2; const m = j === 0 || j === n ? null : (quotientMarks ?? marks)[j - 1];
        return <td key={k} className="px-0.5 py-1 text-center w-6">{m ? (m.kind === 'forbidden' ? <span className="font-mono font-black text-slate-700 text-lg" aria-label="valeur interdite">‖</span> : <span className="font-mono font-bold text-amber-700 text-lg">0</span>) : ''}</td>;
      })}
    </tr>
  );
}

export default function SignTable({ f, rows = null, editable = false, values = null, onChange = null, reveal = false, showFactors = true, editRow = 'final', caption = null }) {
  const t = signTable(f);
  const factorRows = showFactors && f.factors ? f.factors.map((g) => ({ label: `${g.tex.replace(/\{,\}/g, ',').replace(/-/g, '−')}`, table: signTable(g), g })) : [];
  // Les lignes de facteurs sont alignées sur les mêmes colonnes (points critiques de f).
  const factorCells = (g) => t.cells.map((c) => { const probe = c.from === null && c.to === null ? 0 : c.from === null ? c.to - 1 : c.to === null ? c.from + 1 : (c.from + c.to) / 2; return signTable({ ...g, domain: [null, null] }).cells.find((cc) => (cc.from === null || probe >= cc.from) && (cc.to === null || probe <= cc.to))?.sign ?? null; });
  const factorMarks = (g) => t.marks.map((m) => (g.zeros.includes(m.x) ? { x: m.x, kind: 'zero' } : null));
  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
      <table className="w-full text-sm">
        {caption && <caption className="text-xs text-slate-500 py-1.5">{caption}</caption>}
        <thead>
          <tr className="bg-slate-50 text-slate-600">
            <th scope="row" className="px-2 py-2 text-left font-mono font-bold">x</th>
            {t.bounds.map((b, j) => (
              <React.Fragment key={j}>
                <td className="px-0.5 py-2 text-center font-mono font-bold tabular-nums whitespace-nowrap">{b === null ? (j === 0 ? '−∞' : '+∞') : boundText(b)}</td>
                {j < t.bounds.length - 1 && <td className="px-1 py-2" />}
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {factorRows.map((r, idx) => (
            <SignRow key={r.label} label={r.label} table={r.table} cells={factorCells(r.g)} marks={factorMarks(r.g)}
              editable={editable && editRow === `factor${idx}`} values={editRow === `factor${idx}` ? values : null} onChange={onChange} reveal={reveal && editRow === `factor${idx}`} />
          ))}
          <SignRow label={`${f.name}(x)`} table={t} cells={t.cells.map((c) => c.sign)} marks={t.marks}
            editable={editable && editRow === 'final'} values={editRow === 'final' ? values : null} onChange={onChange} reveal={reveal && editRow === 'final'} />
        </tbody>
      </table>
    </div>
  );
}
