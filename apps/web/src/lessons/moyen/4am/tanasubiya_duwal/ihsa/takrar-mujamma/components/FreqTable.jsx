import MathText from '../../../../../../common/components/MathText';

/**
 * Un tableau statistique comme ceux du manuel : la colonne des NOMS (arabe) à droite, les valeurs de gauche
 * à droite en ordre croissant (le tableau est `dir="ltr"`, ses en-têtes de ligne `dir="rtl"`).
 * `head` nomme la ligne des valeurs, `values` ses cellules, `rows = [{ label, cells }]` ; une cellule peut
 * porter des `$…$` (fractions, classes) ; « … » = une case à compléter.
 */
const Cell = ({ v }) => (typeof v === 'string' && v.includes('$') ? <MathText>{v}</MathText> : v);

export default function FreqTable({ head, values, rows = [], caption, className = '' }) {
  const all = [{ label: head, cells: values, isHead: true }, ...rows];
  return (
    <div className={`overflow-x-auto ${className}`} data-lesson-table>
      <table dir="ltr" className="mx-auto border-collapse text-sm">
        {caption && <caption className="pb-1 text-xs text-slate-600" dir="rtl">{caption}</caption>}
        <tbody>
          {all.map((r) => (
            <tr key={r.label}>
              {r.cells.map((v, i) => (
                <td key={i} className={`min-w-[2.4rem] whitespace-nowrap border border-slate-300 px-1.5 py-1 text-center font-mono ${r.isHead ? 'bg-amber-50 font-extrabold text-slate-900' : 'bg-white font-bold text-slate-800'}`}>
                  <Cell v={v} />
                </td>
              ))}
              <th scope="row" dir="rtl" className="whitespace-nowrap border border-slate-300 bg-amber-100 px-2 py-1 text-start text-xs font-bold text-slate-800">
                <MathText>{r.label}</MathText>
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Le même tableau en île KaTeX (`$\begin{array}…$`), NOMBRES SEULS, pour un endroit où un <table> ne peut pas
 * entrer (l'énoncé d'une épreuve, rendu dans un <p>) : les noms des lignes sont dits dans la phrase.
 * Une cellule peut être une écriture LaTeX (« 0 \le x < 10 ») ; la virgule décimale devient `{,}`.
 */
export function texTable(rows) {
  const cell = (v) => String(v).replace(/\$/g, '').replace(/(\d),(\d)/g, '$1{,}$2');
  const n = rows[0].length;
  return `$\\begin{array}{|${'c|'.repeat(n)}} \\hline ${rows.map((r) => r.map(cell).join(' & ')).join(' \\\\ \\hline ')} \\\\ \\hline \\end{array}$`;
}
