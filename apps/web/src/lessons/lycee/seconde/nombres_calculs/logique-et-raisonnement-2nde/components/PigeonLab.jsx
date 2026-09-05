import React from 'react';
import { pigeonhole } from './logicUtils';

/**
 * PigeonLab — treize élèves, douze mois.
 *
 * Activity: ajouter des élèves un par un en essayant d'éviter tout partage
 *   de mois ; constater qu'au 13e c'est impossible.
 * Mathematical objective: faire vivre le raisonnement par l'absurde — on
 *   SUPPOSE qu'aucun mois n'est partagé, on place, et on se cogne : la
 *   supposition est intenable, donc son contraire est vrai.
 * Student action: toucher « ajouter un élève » (le placement évite les
 *   doublons tant que c'est possible).
 * Controlled variable: le nombre d'élèves.
 * Mathematical state: `count` (module) ; la répartition et le premier
 *   partage forcé sont DÉRIVÉS (pigeonhole).
 * Visual consequence: les douze mois se remplissent ; le 13e élève force un
 *   deuxième jeton dans un mois, mis en évidence.
 */
const MONTHS = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];

export default function PigeonLab({ count, onCount, disabled = false, max = 15 }) {
  const { fill, firstShare } = pigeonhole(count);
  return (
    <div className="space-y-3" role="group" aria-label="Douze mois, des élèves">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={disabled || count >= max} onClick={() => onCount(count + 1)} aria-label="Ajouter un élève"
          className="min-h-[44px] px-4 rounded-xl bg-indigo-600 text-white font-mono text-sm font-bold disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          + Ajouter un élève
        </button>
        <button type="button" disabled={disabled || count === 0} onClick={() => onCount(0)} aria-label="Recommencer"
          className="min-h-[44px] px-3 rounded-xl border-2 border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">↺ Recommencer</button>
        <span className="font-mono text-sm font-bold text-slate-700">{count} élève{count > 1 ? 's' : ''}</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {MONTHS.map((m, i) => (
          <div key={m} className={`rounded-xl border-2 p-1.5 text-center ${fill[i] > 1 ? 'border-rose-400 bg-rose-50' : fill[i] === 1 ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}
            aria-label={`${m} : ${fill[i]} élève${fill[i] > 1 ? 's' : ''}`}>
            <div className="text-[10px] font-mono font-bold uppercase text-slate-500">{m}</div>
            <div className="flex justify-center gap-0.5 min-h-[20px] items-center">
              {Array.from({ length: fill[i] }, (_, k) => <span key={k} className={`inline-block w-4 h-4 rounded-full ${fill[i] > 1 ? 'bg-rose-500' : 'bg-emerald-500'}`} aria-hidden="true" />)}
            </div>
          </div>
        ))}
      </div>
      <div className={`rounded-xl border-2 px-3 py-2 font-mono text-sm ${firstShare ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-slate-200 bg-slate-50 text-slate-700'}`} role="status" aria-live="polite">
        {firstShare
          ? <>Au <strong>{firstShare}e élève</strong>, impossible d’éviter : deux élèves partagent un mois. La supposition « aucun partage » ne tient plus.</>
          : count === 12 ? <>Douze élèves, douze mois : toujours aucun partage. Ajoute-en un de plus…</> : <>Aucun partage pour l’instant — chaque élève a pris un mois libre.</>}
      </div>
    </div>
  );
}
