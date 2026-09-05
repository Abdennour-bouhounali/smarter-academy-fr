import React, { useState } from 'react';
import { formatDec } from '@smarter-academy/core';
import { Feedback } from '../../../../../common/components/LessonUI';
import { formatTerm, evaluate, poly, monomial, add } from './litteralUtils';

/**
 * TermMerger — des cartes de termes ; deux cartes semblables s'empilent.
 *
 * Activity: toucher deux termes ; s'ils sont de même forme (x², x ou
 *   nombre) ils fusionnent en un seul ; sinon la fusion est refusée avec la
 *   raison. La valeur de l'expression en x = 2 reste affichée : elle ne
 *   bouge jamais.
 * Mathematical objective: réduire = additionner les coefficients des termes
 *   SEMBLABLES, et seulement eux ; la réduction ne change pas la valeur.
 * Student action: toucher deux cartes.
 * Controlled variable: la paire choisie.
 * Mathematical state: `terms` [{ id, coef, degree }] (module).
 * Visual consequence: fusion en une carte ; refus en rouge ; la valeur
 *   « pour x = 2 » identique à celle de départ.
 * Misconception targeted: « 3x² + 2x = 5x³ », « 3x + 2 = 5x ».
 */
const DEG = { 0: 'nombre', 1: 'terme en x', 2: 'terme en x²' };

export default function TermMerger({ terms, original, onMerge, disabled = false, testX = 2 }) {
  const [sel, setSel] = useState(null);
  const [refused, setRefused] = useState(null);
  const current = terms.reduce((p, t) => add(p, monomial(t.coef, t.degree)), poly(0));
  const tap = (t) => {
    if (disabled) return;
    if (sel === null || sel === t.id) { setSel(sel === t.id ? null : t.id); setRefused(null); return; }
    const a = terms.find((k) => k.id === sel);
    if (a.degree === t.degree) { onMerge(a.id, t.id); setRefused(null); } else setRefused({ a, b: t });
    setSel(null);
  };
  return (
    <div className="space-y-3" role="group" aria-label="Cartes de termes">
      <div className="flex flex-wrap gap-2 min-h-[52px]">
        {terms.map((t, i) => (
          <React.Fragment key={t.id}>
            {i > 0 && <span className="self-center font-mono font-bold text-slate-400">+</span>}
            <button type="button" disabled={disabled} aria-pressed={sel === t.id} aria-label={`Terme ${formatTerm(t)}`} onClick={() => tap(t)}
              className={`min-h-[48px] px-4 rounded-xl border-2 font-mono text-lg font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                sel === t.id ? 'bg-indigo-600 border-indigo-700 text-white' : t.degree === 2 ? 'bg-violet-50 border-violet-300 text-violet-900' : t.degree === 1 ? 'bg-sky-50 border-sky-300 text-sky-900' : 'bg-amber-50 border-amber-300 text-amber-900'
              } disabled:opacity-70`}>
              {t.coef < 0 && i > 0 ? `(${formatTerm(t)})` : formatTerm(t)}
            </button>
          </React.Fragment>
        ))}
      </div>
      {sel !== null && <p className="text-xs text-indigo-700 font-semibold">Touche un autre terme de la même forme pour les empiler.</p>}
      {refused && (
        <Feedback tone="ko">Empilement refusé : <strong className="font-mono">{formatTerm(refused.a)}</strong> est un {DEG[refused.a.degree]} et <strong className="font-mono">{formatTerm(refused.b)}</strong> un {DEG[refused.b.degree]}. Des formes différentes ne s’additionnent pas — pas plus que 3 pommes et 2 poires ne font 5 pommes.</Feedback>
      )}
      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"><span className="block text-[11px] font-bold uppercase text-slate-500">départ, pour x = {formatDec(testX)}</span><span className="font-extrabold text-slate-800">{formatDec(evaluate(original, testX))}</span></div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2"><span className="block text-[11px] font-bold uppercase text-emerald-700">maintenant, pour x = {formatDec(testX)}</span><span className="font-extrabold text-emerald-900">{formatDec(evaluate(current, testX))}</span></div>
      </div>
    </div>
  );
}
