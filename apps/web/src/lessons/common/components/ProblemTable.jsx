import MathText from './MathText';

/**
 * Le tableau de données d'un problème (`problem.table`, 2026-10-06) — repris du DataTable de l'unité 8
 * (qiraat-wadiyat-ihsaiya) : en-têtes en français, première colonne d'en-têtes de ligne (à GAUCHE), nombres
 * en chasse fixe, formules en `$…$`. Défile horizontalement DANS son
 * cadre quand il est plus large que l'écran — la page, elle, ne défile jamais de côté.
 *
 *   table: { head: ['Note', '8', '10', '12'], rows: [['Effectif', '3', '7', '5']], caption?: '…' }
 *
 * Une cellule de TEXTE (pas un nombre) part de la gauche et garde ses espaces : la ligne d'un programme est indentée
 * par sa place dans une boucle ou un « si » (espaces insécables de la banque), un centrage l'effaçait (2026-11-23).
 *
 * `sheet: true` (le tableur, 2026-10-08) : une grille de TABLEUR — `head` = ['', 'A', 'B', …], première colonne =
 * numéros de ligne. Elle se lit comme l'écran d'un tableur : de GAUCHE à DROITE (la colonne A à gauche), en-têtes
 * gris du logiciel.
 */
const isNum = (s) => /^-?\d+([,.]\d+)?$/.test(String(s));

export default function ProblemTable({ head, rows, caption, sheet = false }) {
  // a LISTING (its rows numbered 1, 2, 3… — a program's lines, a spreadsheet's rows): its text cells are what a machine
  // reads (« mettre N à 1700 », « =MOD(2431;A2) »), written as typed — no thousands space (`data-machine-text`, read by
  // the walks' check of grouped numbers)
  const listing = rows.length > 1 && rows.every((r, i) => String(r[0]) === String(i + 1));
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
                // a number is centred; a TEXT cell starts on the left and keeps its spaces — a program's line is indented
                // (no-break spaces, by its nesting: lines inside a loop or a « si »), and centring it erased that (2026-11-23)
                : isNum(c)
                  ? <td key={i} className="border border-slate-200 px-1.5 py-1 font-mono">{c}</td>
                  : <td key={i} className="border border-slate-200 px-1.5 py-1 font-mono text-left whitespace-pre-wrap" data-text-cell {...(listing ? { 'data-machine-text': '' } : {})}><MathText>{String(c)}</MathText></td>))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}
