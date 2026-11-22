import MathText from '../../../../../../common/components/MathText';

/**
 * Un tableau de valeurs du manuel (deux lignes, en-tête à droite) : « السعر قبل / بعد التخفيض »,
 * « x / f(x) ». Les nombres sont des îlots LaTeX (LTR) ; l'ordre des colonnes est celui du livre.
 * `arrow` (ex. « \times(-3) ») écrit la flèche du manuel entre les deux lignes. `n` numérote le
 * tableau (نشاط 2). Données seulement : aucun calcul ici.
 */
export default function ValueTable({ rows, arrow, n, caption, className = '' }) {
  return (
    <figure className={`space-y-1 ${className}`} data-value-table={n ?? ''}>
      {(caption || n) && <figcaption className="text-xs font-bold text-slate-600">{caption ?? `الجدول ${n}`}</figcaption>}
      <div className="flex items-stretch gap-2">
        <table className="min-w-0 flex-1 border-collapse text-center text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row" className="border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700"><MathText>{r.label}</MathText></th>
                {r.cells.map((c, i) => (
                  <td key={`${r.label}-${i}`} className="border border-slate-300 px-1.5 py-1 font-mono">
                    {c === '…' ? <span className="text-slate-400">…</span> : <MathText>{`$${c}$`}</MathText>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {arrow && <span className="self-center whitespace-nowrap text-sm text-indigo-800" dir="ltr"><MathText>{`$\\downarrow ${arrow}$`}</MathText></span>}
      </div>
    </figure>
  );
}
