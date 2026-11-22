import MathText from '../../../../../../common/components/MathText';

/**
 * Un tableau à deux (ou trois) lignes, comme les tableaux du manuel : la première colonne nomme la
 * ligne (arabe), les nombres sont isolés en LTR (`dir="ltr"` sur le tableau, en-têtes en RTL).
 * `rows = [{ label, values: [string | number] }]` ; une valeur string peut porter des `$…$`.
 */
export default function DataTable({ rows, caption, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`} data-lesson-table>
      <table className="mx-auto border-collapse text-sm">
        {caption && <caption className="pb-1 text-xs text-slate-600">{caption}</caption>}
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border border-slate-300">
              <th scope="row" className="whitespace-nowrap border border-slate-300 bg-slate-100 px-2 py-1 text-start text-xs font-bold text-slate-700">
                {typeof r.label === 'string' ? <MathText>{r.label}</MathText> : r.label}
              </th>
              {r.values.map((v, i) => (
                <td key={i} dir="ltr" className="min-w-[2.5rem] border border-slate-300 bg-white px-2 py-1 text-center font-mono font-bold text-slate-900">
                  {typeof v === 'string' && v.includes('$') ? <MathText>{v}</MathText> : v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Le même tableau écrit en LaTeX (`$\begin{array}…$`), pour un endroit où un <table> ne peut pas
 * entrer (une ligne de BatchChoiceQuestion, l'énoncé d'une épreuve : du texte de phrase).
 * Les nombres s'écrivent comme le manuel (« 10,5 » → `10{,}5`).
 */
export function texTable(xs, ys, lx = 'x', ly = 'y') {
  const cell = (v) => String(v).replace(',', '{,}');
  const row = (l, vs) => [l, ...vs.map(cell)].join(' & ');
  return `$\\begin{array}{|c|${'c|'.repeat(xs.length)}} \\hline ${row(lx, xs)} \\\\ \\hline ${row(ly, ys)} \\\\ \\hline \\end{array}$`;
}
