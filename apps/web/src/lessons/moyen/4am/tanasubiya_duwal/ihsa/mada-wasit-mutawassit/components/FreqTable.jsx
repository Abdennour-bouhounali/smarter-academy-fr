import MathText from '../../../../../../common/components/MathText';

/**
 * Un tableau statistique du manuel (valeurs / effectifs, ou classes / effectifs), DESSINÉ en DOM : les lignes
 * gardent l'ordre du livre ; les nombres sont des îlots `$…$` (dir="ltr"), les en-têtes de ligne sont en arabe.
 *   rows = [{ head: 'درجة الحرارة', cells: ['18', '15', …] }, …] — chaque cellule est une chaîne (math ou texte)
 */
export default function FreqTable({ rows, caption, testId }) {
  const cell = (c) => (/^\$/.test(c) ? c : `$${c}$`);
  return (
    <figure className="space-y-1" data-freq-table={testId ?? ''}>
      <div className="overflow-x-auto">
        <table className="border-collapse text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.head}>
                <th scope="row" className="border border-slate-300 bg-slate-50 px-2 py-1 text-start text-xs font-bold text-slate-700">{r.head}</th>
                {r.cells.map((c, i) => (
                  <td key={`${r.head}${i}`} className="border border-slate-300 px-2 py-1 text-center"><MathText>{cell(String(c))}</MathText></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="text-xs text-slate-500">{caption}</figcaption>}
    </figure>
  );
}
