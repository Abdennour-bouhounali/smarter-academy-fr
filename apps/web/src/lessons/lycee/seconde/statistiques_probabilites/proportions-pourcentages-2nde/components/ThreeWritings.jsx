import React from 'react';
import { formatNumber, formatPercent } from '../../../../../common/stats';

/**
 * ThreeWritings — les trois écritures d'UNE proportion, calculées ensemble.
 *
 * Activité : l'élève tape une part ; la fraction, le décimal et le
 * pourcentage apparaissent SIMULTANÉMENT, alignés. Il ne convertit rien à la
 * main : il constate que les trois cases bougent d'un bloc, donc qu'il s'agit
 * du même nombre. La fraction est aussi donnée SIMPLIFIÉE, pour que
 * « 480/800 » et « 3/5 » cessent d'être deux objets différents.
 *
 * Composant CONTRÔLÉ : `tested` (Set des parts déjà testées) et `onTest`
 * appartiennent au module.
 */
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

export default function ThreeWritings({ total, options, tested, onTest, disabled = false, unitLabel = 'élèves' }) {
  const rows = [...tested].map((part) => {
    const p = part / total;
    const g = gcd(part, total) || 1;
    return { part, p, num: part / g, den: total / g };
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Parts à tester">
        {options.map((v) => {
          const on = tested.has(v);
          return (
            <button key={v} type="button" disabled={disabled || on}
              aria-pressed={on}
              onClick={() => onTest(v)}
              className={`min-h-[44px] px-4 rounded-xl border-2 font-mono text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                on ? 'bg-violet-600 border-violet-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-violet-400'
              } disabled:opacity-60`}>
              {v} {unitLabel}
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="h-28 flex items-center justify-center text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          Choisis une part : ses trois écritures apparaîtront ici, ensemble.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm" aria-label="Les trois écritures de chaque proportion">
            <thead>
              <tr>
                {['Part', 'Fraction', 'Fraction simplifiée', 'Écriture décimale', 'Pourcentage'].map((h) => (
                  <th key={h} scope="col" className="border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.part}>
                  <td className="border border-slate-200 px-3 py-2 text-center font-mono tabular-nums text-slate-700">{r.part}</td>
                  <td className="border border-slate-200 px-3 py-2 text-center font-mono tabular-nums text-slate-700">{r.part}/{total}</td>
                  <td className="border border-slate-200 px-3 py-2 text-center font-mono tabular-nums text-violet-700 font-bold">{r.num}/{r.den}</td>
                  <td className="border border-slate-200 px-3 py-2 text-center font-mono tabular-nums text-violet-700 font-bold">{formatNumber(r.p, 4)}</td>
                  <td className="border border-slate-200 px-3 py-2 text-center font-mono tabular-nums text-violet-900 font-black">{formatPercent(r.p, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-slate-500">Sur un total de <strong>{total}</strong> {unitLabel}.</p>
    </div>
  );
}
