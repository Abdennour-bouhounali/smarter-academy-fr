import React from 'react';
import { formatDec } from '@smarter-academy/core';
import MathText from '../../../../../common/components/MathText';
import { texLin, solveLinearEq, sameSolutions, isSolvedForm, texFrac, opAfter } from './eqUtils';

/**
 * EquationSteps — transformer une équation (ou une inéquation) par des
 * opérations tap-first appliquées AUX DEUX MEMBRES — ou, piège, à un seul.
 *
 * Activity: choisir une opération (« − 5 des deux côtés », « ÷ 2 des deux
 *   côtés », « − x des deux côtés », « − 5 à gauche seulement »), voir la
 *   nouvelle ligne s'écrire sous l'ancienne, jusqu'à x = ….
 * Mathematical objective: seules les opérations appliquées aux deux membres
 *   conservent les solutions ; diviser par un négatif retourne une inégalité.
 * Student action: toucher une opération ; « Annuler » ; « Recommencer ».
 * Controlled variable: la suite d'opérations.
 * Mathematical state: `history` [{ L, R, op, both, label }] (module) ;
 *   verdict dérivé (sameSolutions avec la ligne 0).
 * Visual consequence: la ligne s'ajoute ; si les solutions ont changé, la
 *   ligne est rouge avec « ⚠ solutions changées » ; quand x est isolé, la
 *   dernière ligne est verte.
 * Misconception targeted: « on fait passer de l'autre côté sans rien faire
 *   à l'autre membre », « ÷ (−3) garde le sens ».
 */
export default function EquationSteps({ history, ops, onApply, onUndo, onReset, ineq = null, disabled = false }) {
  const first = history[0];
  const last = history[history.length - 1];
  const solved = isSolvedForm(last);
  const symAt = (i) => {
    if (!ineq) return '=';
    let o = ineq;
    for (let j = 1; j <= i; j += 1) { const hh = history[j]; if (hh.op && (hh.op.type === 'mul' || hh.op.type === 'div') && hh.both) o = opAfter(o, hh.op.k); }
    return o;
  };
  const currentOp = symAt(history.length - 1);
  const sol = solveLinearEq(first.L, first.R);
  const tex = (s) => s.replace('≤', '\\le').replace('≥', '\\ge');

  return (
    <div className="space-y-3" role="group" aria-label="Résolution pas à pas">
      <ol className="rounded-2xl border-2 border-slate-200 bg-white divide-y divide-slate-100">
        {history.map((h, i) => {
          const broke = !ineq && !sameSolutions(first, h);
          const brokeI = ineq && h.op && !h.both;
          const isLast = i === history.length - 1;
          const tone = broke || brokeI ? 'bg-rose-50 text-rose-800' : isLast && solved ? 'bg-emerald-50 text-emerald-900' : 'text-slate-800';
          return (
            <li key={i} className={`px-3 py-2 flex items-center justify-between gap-2 flex-wrap ${tone}`}>
              <span className="font-mono text-lg font-extrabold">
                <MathText>{`$${texLin(h.L)} ${tex(symAt(i))} ${texLin(h.R)}$`}</MathText>
              </span>
              <span className="text-xs font-mono">
                {h.label && <span className="text-slate-500">{h.label}</span>}
                {(broke || brokeI) && <span className="ml-2 font-bold">⚠ solutions changées</span>}
                {isLast && solved && !broke && !brokeI && <span className="ml-2 font-bold">✓ x isolé</span>}
              </span>
            </li>
          );
        })}
      </ol>
      {!disabled && !solved && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Opérations">
          {ops.map((o) => (
            <button key={o.id} type="button" onClick={() => onApply(o)} aria-label={o.label}
              className={`min-h-[44px] px-3.5 rounded-xl border-2 text-sm font-bold font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${o.side ? 'border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-500' : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-500'}`}>
              {o.label}
            </button>
          ))}
          {history.length > 1 && <button type="button" onClick={onUndo} className="min-h-[44px] px-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-bold text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">↶ Annuler</button>}
          {history.length > 1 && <button type="button" onClick={onReset} className="min-h-[44px] px-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-bold text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">↺ Recommencer</button>}
        </div>
      )}
      {solved && !ineq && sol.kind === 'one' && (
        <p className="text-sm font-mono text-emerald-800" role="status">Solution : <MathText>{`$x = ${texFrac(sol.x)}$`}</MathText>{sol.x.den !== 1 && <> (≈ {formatDec(sol.x.num / sol.x.den, { maxDecimals: 2 })}, mais la fraction est la valeur EXACTE)</>}</p>
      )}
      {solved && ineq && <p className="text-sm font-mono text-emerald-800" role="status">Inéquation résolue : x {currentOp} {formatDec(last.R.b)}.</p>}
    </div>
  );
}
