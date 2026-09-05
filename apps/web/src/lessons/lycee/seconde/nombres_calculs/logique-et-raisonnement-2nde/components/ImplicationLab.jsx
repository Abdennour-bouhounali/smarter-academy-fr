import React from 'react';
import { formatDec } from '@smarter-academy/core';
import { caseOf, counterexample } from './logicUtils';

/**
 * ImplicationLab — chercher le seul cas interdit d'une implication.
 *
 * Activity: parcourir un domaine ; chaque nombre se range dans une des
 *   quatre cases (P vraie/fausse × Q vraie/fausse) ; la case « P vraie,
 *   Q fausse » est la seule qui tue l'implication.
 * Mathematical objective: P ⇒ Q est vraie tant qu'aucun cas TF n'existe ;
 *   la réciproque Q ⇒ P se teste séparément (les cas FT deviennent alors
 *   interdits).
 * Student action: toucher le sens à tester (P ⇒ Q ou Q ⇒ P).
 * Controlled variable: le sens.
 * Mathematical state: `direction` (module) ; le classement de chaque nombre
 *   et le verdict sont DÉRIVÉS (caseOf, counterexample).
 * Visual consequence: les quatre cases se remplissent ; celle qui est
 *   interdite passe en rouge dès qu'elle contient un nombre.
 * Expected observation: « multiple de 4 ⇒ pair » n'a aucun cas interdit ;
 *   sa réciproque tombe sur 2, 6, 10…
 */
const BOXES = [
  { id: 'TT', title: 'P vraie, Q vraie', tone: 'border-emerald-300 bg-emerald-50' },
  { id: 'TF', title: 'P vraie, Q FAUSSE', tone: 'border-rose-400 bg-rose-50' },
  { id: 'FT', title: 'P fausse, Q vraie', tone: 'border-slate-200 bg-slate-50' },
  { id: 'FF', title: 'P fausse, Q fausse', tone: 'border-slate-200 bg-slate-50' },
];

export default function ImplicationLab({ P, Q, domain, direction = 'PQ', onDirection, disabled = false }) {
  const A = direction === 'PQ' ? P : Q;
  const B = direction === 'PQ' ? Q : P;
  const ce = counterexample(A, B, domain);
  const grouped = BOXES.map((b) => ({ ...b, items: domain.filter((n) => caseOf(A, B, n) === b.id) }));
  return (
    <div className="space-y-3" role="group" aria-label="Laboratoire d’implication">
      {onDirection && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sens à tester">
          <button type="button" disabled={disabled} aria-pressed={direction === 'PQ'} aria-label={`Tester ${P.text} implique ${Q.text}`} onClick={() => onDirection('PQ')}
            className={`min-h-[44px] px-4 rounded-xl border-2 font-mono text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${direction === 'PQ' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'}`}>
            P ⇒ Q
          </button>
          <button type="button" disabled={disabled} aria-pressed={direction === 'QP'} aria-label={`Tester la réciproque : ${Q.text} implique ${P.text}`} onClick={() => onDirection('QP')}
            className={`min-h-[44px] px-4 rounded-xl border-2 font-mono text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${direction === 'QP' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'}`}>
            Q ⇒ P (réciproque)
          </button>
        </div>
      )}
      <p className="font-mono text-sm text-slate-800">On teste : <strong>si {A.text}, alors {B.text}</strong>.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {grouped.map((b) => (
          <div key={b.id} className={`rounded-2xl border-2 p-2.5 ${b.id === 'TF' && b.items.length ? 'border-rose-500 bg-rose-100' : b.tone}`}>
            <div className="text-[11px] font-mono font-bold uppercase text-slate-600">{b.title}{b.id === 'TF' && ' — interdit'}</div>
            <div className="flex flex-wrap gap-1 mt-1 min-h-[28px]">
              {b.items.length === 0 && <span className="text-xs text-slate-400 italic">vide</span>}
              {b.items.map((n) => <span key={n} className="px-2 py-0.5 rounded-lg bg-white border border-slate-300 font-mono text-sm font-bold text-slate-800">{formatDec(n)}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div className={`rounded-xl border-2 px-3 py-2 font-mono text-sm ${ce === null ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-900'}`} role="status" aria-live="polite">
        {ce === null
          ? <>Aucun cas « vraie ⇒ fausse » sur ce domaine : l’implication <strong>tient</strong>.</>
          : <>Contre-exemple : <strong>{formatDec(ce)}</strong> — {A.text} y est vraie, {B.text} y est fausse. L’implication est <strong>fausse</strong>.</>}
      </div>
    </div>
  );
}
