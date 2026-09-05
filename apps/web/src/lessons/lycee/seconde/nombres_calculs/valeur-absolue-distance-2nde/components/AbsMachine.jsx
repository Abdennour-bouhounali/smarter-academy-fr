import React, { useState } from 'react';
import { formatDec, parseDec } from '@smarter-academy/core';
import { NumberField } from '../../../../../common/components/LessonUI';
import { abs } from './absUtils';

/**
 * AbsMachine — la machine |x| à deux règles.
 *
 * Activity: entrer n'importe quel nombre (puce ou saisie), lire la sortie
 *   et la règle qui a servi.
 * Mathematical objective: |x| = x si x ≥ 0 ; |x| = −x si x < 0 — et « −x »
 *   est alors un nombre POSITIF (l'opposé d'un négatif).
 * Student action: toucher une puce / taper un nombre.
 * Controlled variable: x.
 * Mathematical state: la liste des essais (module).
 * Visual consequence: la règle utilisée s'allume ; « −x = −(−3) = 3 » s'écrit.
 * Misconception targeted: « |−3| = −3 », « −x est négatif », « |x| = x
 *   toujours ».
 */
export default function AbsMachine({ trials, onTry, chips = [], disabled = false }) {
  const [raw, setRaw] = useState('');
  const submit = () => { const n = parseDec(raw); if (Number.isFinite(n)) { onTry(n); setRaw(''); } };
  const last = trials.length ? trials[trials.length - 1] : null;
  return (
    <div className="space-y-3" role="group" aria-label="Machine valeur absolue">
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <button key={c} type="button" disabled={disabled} onClick={() => onTry(c)} aria-label={`Entrer ${formatDec(c)}`} className="min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 border-slate-300 bg-white font-mono font-bold text-slate-800 hover:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60">{formatDec(c)}</button>
        ))}
        <NumberField value={raw} onChange={setRaw} onEnter={submit} ariaLabel="Un nombre à entrer" width="w-28" size="sm" placeholder="−4,5" />
        <button type="button" disabled={disabled || !Number.isFinite(parseDec(raw))} onClick={submit} className="min-h-[44px] px-4 rounded-xl bg-indigo-600 text-white font-mono text-xs font-bold disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Entrer</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className={`rounded-2xl border-2 p-3 text-center font-mono ${last !== null && last >= 0 ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="text-[11px] font-bold uppercase text-slate-500">règle 1 · si x ≥ 0</div>
          <div className="text-lg font-extrabold text-slate-800">|x| = x</div>
          {last !== null && last >= 0 && <div className="text-sm text-emerald-800">|{formatDec(last)}| = {formatDec(last)}</div>}
        </div>
        <div className="text-center font-mono text-2xl font-extrabold text-slate-700" aria-live="polite">
          {last === null ? '|?|' : `|${formatDec(last)}| = ${formatDec(abs(last))}`}
        </div>
        <div className={`rounded-2xl border-2 p-3 text-center font-mono ${last !== null && last < 0 ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="text-[11px] font-bold uppercase text-slate-500">règle 2 · si x &lt; 0</div>
          <div className="text-lg font-extrabold text-slate-800">|x| = −x</div>
          {last !== null && last < 0 && <div className="text-sm text-emerald-800">−x = −({formatDec(last)}) = {formatDec(abs(last))}</div>}
        </div>
      </div>
      {trials.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Essais">
          {trials.map((t, i) => <li key={`${i}-${t}`} className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border bg-white border-slate-200 text-slate-700">|{formatDec(t)}| = {formatDec(abs(t))}</li>)}
        </ul>
      )}
    </div>
  );
}
