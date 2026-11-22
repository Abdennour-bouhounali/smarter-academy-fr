import MathText from '../../../../../../common/components/MathText';

/**
 * Un tableau de données du manuel (le تحدّ, ex-14) : en-têtes arabes, nombres dans des îlots LTR
 * (« -7 », « 12,5 » ne s'inversent pas). Défile horizontalement DANS son cadre quand il est plus large que
 * l'écran (12 mois à 320 px) — la page, elle, ne défile jamais de côté.
 */
const isNum = (s) => /^-?\d+(,\d+)?$/.test(s);
export default function DataTable({ head, rows, caption }) {
  return (
    <div className="max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white" data-data-table>
      <table className="min-w-full border-collapse text-center text-sm">
        {caption && <caption className="py-1 text-xs font-bold text-slate-600">{caption}</caption>}
        <thead>
          <tr className="bg-slate-50">
            {head.map((h, i) => <th key={i} scope="col" className="whitespace-nowrap border border-slate-200 px-1.5 py-1 font-bold text-slate-700">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) => (i === 0
                ? <th key={i} scope="row" className="whitespace-nowrap border border-slate-200 px-1.5 py-1 font-bold text-slate-700">{c}</th>
                : <td key={i} className="border border-slate-200 px-1.5 py-1 font-mono">{isNum(c) ? <bdi dir="ltr">{c}</bdi> : <MathText>{c}</MathText>}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
