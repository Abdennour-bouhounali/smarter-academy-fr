import React from 'react';
import { formatDec } from '@smarter-academy/core';
import RealLine from '../../../../../common/components/RealLine';
import { bracketAt, roundedAt, truncatedDigits, valueOf, squareOfDecimal } from './realsUtils';

/**
 * RoundingLab — écriture exacte contre valeurs approchées.
 *
 * Activity: choisir un nombre et une précision 10^-k ; lire l'encadrement,
 *   la troncature et l'arrondi ; élever l'approximation au carré.
 * Mathematical objective: une valeur approchée est UN nombre de
 *   l'encadrement, pas le nombre ; (1,414)² ≠ 2 quel que soit k ; seule
 *   l'écriture exacte √2 vérifie (√2)² = 2.
 * Student action: toucher un nombre ; pousser − / + sur la précision.
 * Controlled variable: k (0..4) et le nombre.
 * Mathematical state: { spec, k } (module) ; tout dérivé des chiffres exacts.
 * Visual consequence: la fenêtre se resserre, les deux bornes se
 *   rapprochent, l'arrondi bascule d'une borne à l'autre selon le chiffre
 *   suivant ; le carré de l'approximation s'écrit, jamais égal à 2.
 * Misconception targeted: « √2 = 1,414 », « arrondir = tronquer ».
 */
export default function RoundingLab({ spec, k, onK, choices = [], onChoose, showSquare = false, disabled = false }) {
  const { lo, hi } = bracketAt(spec, k);
  const rounded = roundedAt(spec, k);
  const next = truncatedDigits(spec, k + 1).slice(-1);
  const x = valueOf(spec);
  const fmtK = (v) => formatDec(v, { minDecimals: k, maxDecimals: k });
  const fmt = (v) => formatDec(v, { maxDecimals: k + 1 });

  return (
    <div className="space-y-3" role="group" aria-label={`Approcher ${spec.label}`}>
      {choices.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Nombre à approcher">
          {choices.map((c) => (
            <button key={c.id} type="button" disabled={disabled} aria-pressed={c.id === spec.id} aria-label={`Approcher ${c.label}`} onClick={() => onChoose?.(c.id)}
              className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 font-mono font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${c.id === spec.id ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'} disabled:opacity-60`}>
              {c.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold text-slate-700">Précision</span>
        <button type="button" disabled={disabled || k <= 0} onClick={() => onK?.(k - 1)} aria-label="Diminuer la précision" className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500">−</button>
        <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-mono font-bold">10<sup>−{k}</sup> {k === 0 ? '(à l’unité)' : k === 1 ? '(au dixième)' : k === 2 ? '(au centième)' : k === 3 ? '(au millième)' : ''}</span>
        <button type="button" disabled={disabled || k >= 4} onClick={() => onK?.(k + 1)} aria-label="Augmenter la précision" className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500">+</button>
      </div>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <RealLine
          min={lo} max={hi} step={10 ** -(k + 1)} format={fmt}
          points={[{ id: 'x', value: Math.min(hi, Math.max(lo, x)), label: spec.label, tone: 'indigo' }, { id: 'r', value: rounded, label: 'arrondi', tone: 'emerald' }]}
          ariaLabel={`Fenêtre de ${fmt(lo)} à ${fmt(hi)}`}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-sm">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"><span className="block text-[11px] font-bold text-slate-500 uppercase">encadrement</span><span className="font-extrabold text-slate-800">{fmtK(lo)} ≤ {spec.label} &lt; {fmtK(hi)}</span></div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"><span className="block text-[11px] font-bold text-slate-500 uppercase">troncature</span><span className="font-extrabold text-slate-800">{fmtK(lo)}</span></div>
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2"><span className="block text-[11px] font-bold text-emerald-700 uppercase">arrondi (chiffre suivant : {next})</span><span className="font-extrabold text-emerald-900">{fmtK(rounded)}</span></div>
      </div>
      {showSquare && spec.id === 'sqrt2' && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 font-mono text-sm text-amber-900" role="status">
          ({fmtK(rounded)})² = <strong>{formatDec(squareOfDecimal(rounded, k), { maxDecimals: 2 * k })}</strong> — pas 2. Et (√2)² = <strong>2</strong>, exactement.
        </div>
      )}
    </div>
  );
}
