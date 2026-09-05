import React from 'react';
import { formatDec } from '@smarter-academy/core';
import RealLine from '../../../../../common/components/RealLine';

/**
 * SignFlipLine — deux nombres sur la droite, multipliés par k.
 *
 * Activity: partir de 2 < 5 ; multiplier les deux par −1, par 2, par −2, et
 *   regarder l'ordre.
 * Mathematical objective: multiplier par un négatif RETOURNE l'ordre
 *   (symétrie par rapport à 0) ; par un positif, l'ordre est conservé.
 * Student action: toucher un multiplicateur.
 * Controlled variable: k.
 * Mathematical state: k (module) ; positions et relation dérivées.
 * Visual consequence: les deux points se déplacent (miroir pour k < 0), la
 *   relation s'écrit avec le bon signe.
 * Expected observation: −2 est à DROITE de −5 : −2 > −5.
 */
export default function SignFlipLine({ a = 2, b = 5, k, onK, choices = [-1, 2, -2, 3], disabled = false }) {
  const ka = a * k; const kb = b * k;
  const rel = ka < kb ? '<' : ka > kb ? '>' : '=';
  return (
    <div className="space-y-3" role="group" aria-label="Multiplier une inégalité">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-slate-700">Multiplier les deux nombres par</span>
        {choices.map((c) => (
          <button key={c} type="button" disabled={disabled} aria-pressed={k === c} aria-label={`Multiplier par ${formatDec(c)}`} onClick={() => onK(c)}
            className={`min-h-[44px] min-w-[52px] px-3 rounded-xl border-2 font-mono font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${k === c ? (c < 0 ? 'bg-rose-600 border-rose-700 text-white' : 'bg-emerald-600 border-emerald-700 text-white') : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'} disabled:opacity-60`}>
            × {formatDec(c)}
          </button>
        ))}
        <button type="button" disabled={disabled || k === 1} aria-pressed={k === 1} onClick={() => onK(1)} className="min-h-[44px] px-3 rounded-xl border-2 border-slate-200 bg-slate-50 font-mono text-sm font-bold text-slate-500 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">↺ × 1</button>
      </div>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <RealLine min={-15} max={15} step={1} labelEvery={5}
          points={[{ id: 'a', value: ka, label: `${formatDec(a)} × ${formatDec(k)} = ${formatDec(ka)}`, tone: 'indigo' }, { id: 'b', value: kb, label: `${formatDec(b)} × ${formatDec(k)} = ${formatDec(kb)}`, tone: 'amber' }]}
          ariaLabel={`Droite de −15 à 15 avec ${formatDec(ka)} et ${formatDec(kb)}`} />
      </div>
      <div className={`inline-block px-3 py-2 rounded-xl font-mono font-extrabold ${k < 0 ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`} role="status">
        {formatDec(a)} &lt; {formatDec(b)} &nbsp;→ × {formatDec(k)} →&nbsp; {formatDec(ka)} {rel} {formatDec(kb)} {k < 0 ? '(l’ordre se retourne)' : '(l’ordre est conservé)'}
      </div>
    </div>
  );
}
