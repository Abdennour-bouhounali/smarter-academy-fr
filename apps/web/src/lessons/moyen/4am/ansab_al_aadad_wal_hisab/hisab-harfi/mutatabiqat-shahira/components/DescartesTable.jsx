import MathText from '../../../../../../common/components/MathText';

/**
 * Le TABLEAU DE DESCARTES de la page 31 du manuel, pour (2x + 1)² : la ligne
 * et la colonne d'en-tête sont les termes x ، x ، 1 du côté 2x + 1, chaque
 * case est l'aire d'une zone du carré. C'est exactement la grille que le
 * laboratoire `pitch-expansion` dessine sous le terrain (« ×, termes du
 * côté, produits partiels ») : on la nomme ici pour que l'élève reconnaisse
 * l'outil de Descartes dans son propre terrain.
 *
 * Données : content/textbook.js → DESCARTES (head, cells), jamais retapées.
 * Mathématiques : un tableau se lit de gauche à droite, comme dans le livre
 * (`dir="ltr"`), chaque case est un îlot MathText. Défilement propre au
 * tableau, jamais de la page (320 px).
 */
export default function DescartesTable({ head, cells, caption }) {
  return (
    <div className="overflow-x-auto rounded-xl border-2 border-emerald-200 bg-white" dir="ltr" data-descartes-table>
      <table className="mx-auto border-separate border-spacing-1 text-center text-sm">
        {caption && <caption className="px-2 py-1 text-xs font-bold text-emerald-800" dir="rtl">{caption}</caption>}
        <thead>
          <tr>
            <th scope="col" className="px-2 font-mono text-xs text-slate-500" aria-hidden="true">×</th>
            {head.map((h, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <th key={i} scope="col" className="min-w-[48px] rounded-md bg-emerald-100 px-2 py-1 text-emerald-900"><MathText>{h}</MathText></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cells.map((r, j) => (
            // eslint-disable-next-line react/no-array-index-key
            <tr key={j}>
              <th scope="row" className="rounded-md bg-emerald-100 px-2 py-1 text-emerald-900"><MathText>{head[j]}</MathText></th>
              {r.map((c, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <td key={i} className="min-h-[40px] rounded-lg border-2 border-emerald-300 bg-white px-2 py-1 font-bold text-slate-800"><MathText>{c}</MathText></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
