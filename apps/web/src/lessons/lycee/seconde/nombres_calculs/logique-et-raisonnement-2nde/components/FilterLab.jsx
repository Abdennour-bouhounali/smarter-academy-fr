import React from 'react';
import { formatDec } from '@smarter-academy/core';

/**
 * FilterLab — deux propriétés, un connecteur, un domaine de nombres.
 *
 * Activity: choisir le connecteur (ET, OU, NON P) et regarder QUELS nombres
 *   passent le filtre ; les deux voyants de chaque nombre restent visibles.
 * Mathematical objective: ET exige les deux, OU se contente d'une (et
 *   accepte les deux : il est inclusif), NON inverse.
 * Student action: toucher un connecteur.
 * Controlled variable: le connecteur.
 * Mathematical state: `connector` (module) ; l'appartenance de chaque nombre
 *   est DÉRIVÉE des tests des propriétés (and/or/not de logicUtils).
 * Visual consequence: chaque jeton passe en vert ou gris ; le compte
 *   s'ajuste ; les deux voyants P et Q restent lisibles.
 * Expected observation: « pair OU > 5 » laisse passer 7 (impair) et 8
 *   (les deux) — seuls 1, 3, 5 restent dehors.
 * Misconception targeted: « OU veut dire l'un ou l'autre mais pas les deux ».
 */
const CONNECTORS = [
  { id: 'and', label: 'P ET Q', test: (P, Q, n) => P.test(n) && Q.test(n) },
  { id: 'or', label: 'P OU Q', test: (P, Q, n) => P.test(n) || Q.test(n) },
  { id: 'notP', label: 'NON P', test: (P, Q, n) => !P.test(n) },
  { id: 'notQ', label: 'NON Q', test: (P, Q, n) => !Q.test(n) },
];

export default function FilterLab({ P, Q, domain, connector, onConnector, disabled = false }) {
  const c = CONNECTORS.find((k) => k.id === connector) ?? CONNECTORS[0];
  const pass = domain.filter((n) => c.test(P, Q, n));
  return (
    <div className="space-y-3" role="group" aria-label="Filtre logique">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2"><span className="text-[11px] font-bold uppercase text-indigo-600 block">P</span><span className="font-mono font-bold text-indigo-900">{P.text}</span></div>
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2"><span className="text-[11px] font-bold uppercase text-amber-700 block">Q</span><span className="font-mono font-bold text-amber-900">{Q.text}</span></div>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Connecteur">
        {CONNECTORS.map((k) => (
          <button key={k.id} type="button" disabled={disabled} aria-pressed={connector === k.id} aria-label={`Filtre ${k.label}`} onClick={() => onConnector(k.id)}
            className={`min-h-[44px] px-4 rounded-xl border-2 font-mono font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${connector === k.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'} disabled:opacity-60`}>
            {k.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
        <div className="flex flex-wrap gap-1.5">
          {domain.map((n) => {
            const ok = c.test(P, Q, n);
            return (
              <div key={n} className={`rounded-xl border-2 px-2 py-1 text-center min-w-[52px] ${ok ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 opacity-70'}`}
                aria-label={`${formatDec(n)} : P ${P.test(n) ? 'vraie' : 'fausse'}, Q ${Q.test(n) ? 'vraie' : 'fausse'} — ${ok ? 'passe' : 'ne passe pas'}`}>
                <div className={`font-mono font-extrabold ${ok ? 'text-emerald-800' : 'text-slate-500'}`}>{formatDec(n)}</div>
                <div className="flex justify-center gap-0.5 text-[10px] font-mono font-bold">
                  <span className={P.test(n) ? 'text-indigo-700' : 'text-slate-300'} aria-hidden="true">P</span>
                  <span className={Q.test(n) ? 'text-amber-700' : 'text-slate-300'} aria-hidden="true">Q</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 font-mono text-sm text-slate-800" role="status">
          <strong>{c.label}</strong> laisse passer {pass.length} nombre{pass.length > 1 ? 's' : ''} : {pass.length ? pass.map(formatDec).join(' · ') : '(aucun)'}
        </p>
      </div>
    </div>
  );
}
