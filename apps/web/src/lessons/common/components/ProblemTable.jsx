import MathText from './MathText';

/**
 * Le tableau de données d'un problème (`problem.table`, 2026-10-06) — repris du DataTable de l'unité 8
 * (qiraat-wadiyat-ihsaiya) : en-têtes en français, première colonne d'en-têtes de ligne (à GAUCHE), nombres
 * en chasse fixe, formules en `$…$`. Défile horizontalement DANS son
 * cadre quand il est plus large que l'écran — la page, elle, ne défile jamais de côté.
 *
 *   table: { head: ['Note', '8', '10', '12'], rows: [['Effectif', '3', '7', '5']], caption?: '…' }
 *
 * `sheet: true` (le tableur, 2026-10-08) : une grille de TABLEUR — `head` = ['', 'A', 'B', …], première colonne =
 * numéros de ligne. Elle se lit comme l'écran d'un tableur : de GAUCHE à DROITE (la colonne A à gauche), en-têtes
 * gris du logiciel.
 */
const isNum = (s) => /^-?\d+([,.]\d+)?$/.test(String(s));

export default function ProblemTable({ head, rows, caption, sheet = false }) {
  return (
    <figure className="space-y-1" data-problem-table>
      {/* La légende HORS du cadre qui défile : sur un téléphone, une <caption> centrée sur la largeur
          du tableau était coupée au bord de l'écran (vu au déploiement, 2026-10-06). */}
      {caption && <figcaption className="text-xs font-bold text-slate-600"><MathText>{caption}</MathText></figcaption>}
      <div className="max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white" data-sheet={sheet ? '' : undefined}>
      <table className="min-w-full border-collapse text-center text-sm">
        <thead>
          <tr className={sheet ? 'bg-slate-200' : 'bg-slate-50'}>
            {head.map((h, i) => (
              <th key={i} scope="col" className={`whitespace-nowrap border border-slate-200 px-1.5 py-1 font-bold ${sheet ? 'font-mono text-slate-600' : 'text-slate-700'}`}>
                {isNum(h) ? h : <MathText>{String(h)}</MathText>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, i) => (i === 0
                ? <th key={i} scope="row" className={`whitespace-nowrap border border-slate-200 px-1.5 py-1 font-bold ${sheet ? 'bg-slate-200 font-mono text-slate-600' : 'text-slate-700'}`}><MathText>{String(c)}</MathText></th>
                : <td key={i} className="border border-slate-200 px-1.5 py-1 font-mono">{isNum(c) ? c : <MathText>{String(c)}</MathText>}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}
