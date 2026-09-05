import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { formatDec, evaluate, verdicts } from './modelUtils';

/**
 * ModelTester — rejouer un modèle candidat sur les données réelles.
 *
 * Activity            toucher un modèle candidat ; il est REJOUÉ sur chaque
 *                     ticket, et comparé au prix réellement payé.
 * Mathematical objective  un modèle n'est pas « à peu près » : il doit être
 *                     d'accord avec TOUTES les données ; un modèle qui tombe
 *                     juste sur un ticket et faux sur les autres n'est pas le
 *                     modèle de la situation.
 * Student action      toucher une carte de modèle ; en changer librement.
 * Controlled variable le modèle candidat.
 * Mathematical state  { candidates, points, selected } — les verdicts sont
 *                     CALCULÉS par `verdicts` (modelUtils), jamais écrits.
 * Visual consequence  une ligne « ton modèle donnerait » apparaît sous
 *                     « payé », ticket par ticket, avec ✓ / ✗ ; le décompte
 *                     des accords s'écrit en clair.
 * Expected observation « un seul modèle est d'accord partout ».
 * Misconception targeted  valider un modèle sur un seul exemple ; supposer
 *                     la proportionnalité malgré la part fixe (déblocage).
 *
 * SÉCURITÉ D'AFFICHAGE — tout vit dans le DOM (tableau à défilement
 * horizontal) : aucune étiquette SVG.
 * Adapté (copié, non importé) de fonctions-3e/components/RuleTester.jsx.
 */
export default function ModelTester({
  candidates,        // [{ id, label, model }]
  points,            // [{ id, x, y, label? }]
  selected = null,
  onSelect,
  xLabel = 'x', yLabel = 'y', xUnit = '', yUnit = '',
  disabled = false,
}) {
  const cand = candidates.find((c) => c.id === selected) ?? null;
  const vs = cand ? verdicts(cand.model, points) : [];
  const agree = vs.filter((v) => v.ok).length;
  const total = points.length;
  const allAgree = total > 0 && agree === total;

  return (
    <div className="space-y-3" role="group" aria-label="Testeur de modèle">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {candidates.map((c) => {
          const on = c.id === selected;
          return (
            <button key={c.id} type="button" onClick={() => !disabled && onSelect?.(c.id)} disabled={disabled} aria-pressed={on}
              aria-label={`Tester le modèle ${c.label}`}
              className={`min-h-[48px] px-3 py-2 rounded-xl border-2 text-sm font-semibold text-left transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50
                ${on ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400'}`}
              style={{ touchAction: 'manipulation' }}>
              <span className="font-mono">{c.label}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
        <table className="w-full text-sm font-mono tabular-nums">
          <caption className="sr-only">Les tickets, et ce que le modèle choisi donnerait</caption>
          <tbody>
            <tr className="bg-slate-50">
              <th scope="row" className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">{xLabel}{xUnit ? ` (${xUnit})` : ''}</th>
              {points.map((p) => <td key={p.id ?? p.x} className="px-3 py-2 text-center">{formatDec(p.x)}</td>)}
            </tr>
            <tr>
              <th scope="row" className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">{yLabel} payé{yUnit ? ` (${yUnit})` : ''}</th>
              {points.map((p) => <td key={p.id ?? p.x} className="px-3 py-2 text-center font-bold text-amber-700">{formatDec(p.y)}</td>)}
            </tr>
            <tr className="border-t border-slate-200">
              <th scope="row" className="px-3 py-2 text-left font-semibold text-indigo-700 whitespace-nowrap">ton modèle donnerait</th>
              {points.map((p) => {
                const v = vs.find((w) => w.x === p.x);
                return (
                  <td key={p.id ?? p.x} className={`px-3 py-2 text-center font-bold ${!v ? 'text-slate-300' : v.ok ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {v ? <>{formatDec(v.model)} <span aria-hidden="true">{v.ok ? '✓' : '✗'}</span><span className="sr-only">{v.ok ? ' (d’accord)' : ' (désaccord)'}</span></> : '—'}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-700" aria-live="polite">
        {!cand ? 'Touche un modèle pour le rejouer sur les trois tickets.' : allAgree
          ? <><strong>{agree}/{total}</strong> tickets d’accord : ce modèle raconte la situation.</>
          : <><strong>{agree}/{total}</strong> tickets d’accord — un modèle doit être d’accord avec <em>tous</em> les tickets.</>}
      </p>
      {cand && (
        <p className="text-center py-2 px-3 rounded-xl bg-slate-900 text-white"><MathText>{`$${cand.label.replace('×', '\\times').replace(/(\d),(\d)/g, '$1{,}$2')}$`}</MathText></p>
      )}
    </div>
  );
}

export const modelAt = evaluate;
