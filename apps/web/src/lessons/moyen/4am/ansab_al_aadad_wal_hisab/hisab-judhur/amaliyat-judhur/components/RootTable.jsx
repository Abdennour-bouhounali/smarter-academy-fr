import MathText from '../../../../../../common/components/MathText';

/**
 * Le TABLEAU de l'activité 4 (p. 21), tel que le manuel le dessine : les
 * colonnes a, b données, les cinq autres à compléter. Avant la réponse de
 * l'élève, les cases à compléter sont vides (« … ») — le tableau ne donne
 * jamais la réponse. Après (`filled`), chaque case montre la valeur calculée
 * (content/textbook.js → rows[].answer) ; `null` = « لا معنى له ».
 *
 * RTL : la colonne a est à droite, comme dans le livre ; chaque case est un
 * îlot mathématique (MathText → dir="ltr"). La largeur est bornée par un
 * défilement horizontal propre au tableau, jamais de la page (320 px).
 */
export default function RootTable({ columns, rows, filled = false, noMeaning, caption }) {
  return (
    <div className="overflow-x-auto rounded-xl border-2 border-pink-200 bg-white" data-root-table data-filled={filled ? 'true' : 'false'}>
      <table className="min-w-full border-collapse text-center text-sm">
        {caption && <caption className="px-2 py-1 text-start text-xs font-bold text-pink-800">{caption}</caption>}
        <thead className="bg-pink-50">
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col" className="border border-pink-200 px-2 py-1.5 font-semibold text-slate-800"><MathText>{c}</MathText></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.a}:${r.b}`}>
              <td className="border border-pink-100 px-2 py-1.5 font-bold"><MathText>{`$${r.a}$`}</MathText></td>
              <td className="border border-pink-100 px-2 py-1.5 font-bold"><MathText>{`$${r.b}$`}</MathText></td>
              {r.answer.map((v, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <td key={i} className={`border border-pink-100 px-2 py-1.5 ${filled ? 'text-emerald-800' : 'text-slate-300'}`}>
                  {!filled ? '…' : v === null ? <span className="text-xs text-rose-700">{noMeaning}</span> : <MathText>{`$${v}$`}</MathText>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
