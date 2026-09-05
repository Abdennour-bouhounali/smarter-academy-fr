import React, { useState } from 'react';
import { Feedback } from '../../../../../common/components/LessonUI';
import { vennRegion } from './intervalUtils';

/**
 * VennSorter — deux ensembles finis qui se croisent, des nombres à placer.
 *
 * Activity: placer chaque nombre dans la bonne région (A seulement, A et B,
 *   B seulement, ni l'un ni l'autre).
 * Mathematical objective: faire naître ∩ (la zone commune) et ∪ (tout ce
 *   qui est coloré) comme des RÉGIONS avant les symboles.
 * Student action: toucher un nombre, puis une région.
 * Controlled variable: l'affectation nombre → région.
 * Mathematical state: `placed` { nombre: région } (module) ; la bonne région
 *   est dérivée de `vennRegion`.
 * Visual consequence: le nombre se pose ; en rouge barré s'il est mal placé,
 *   avec la raison (« 6 divise 12 ET 18 »).
 * Expected observation: la zone du milieu contient exactement les diviseurs
 *   communs ; 5 ne divise ni 12 ni 18.
 */
const REGIONS = [
  { id: 'A', label: 'A seulement' },
  { id: 'both', label: 'dans A et dans B' },
  { id: 'B', label: 'B seulement' },
  { id: 'none', label: 'ni dans A ni dans B' },
];

export default function VennSorter({ numbers, A, B, labelA, labelB, placed, onPlace, disabled = false }) {
  const [selected, setSelected] = useState(null);
  const pool = numbers.filter((n) => placed[n] === undefined);
  const wrong = numbers.filter((n) => placed[n] !== undefined && placed[n] !== vennRegion(n, A, B));

  const reason = (n) => {
    const a = A.includes(n);
    const b = B.includes(n);
    if (a && b) return `${n} divise 12 ET 18 : il est dans les deux.`;
    if (a) return `${n} divise 12 mais pas 18 : dans A seulement.`;
    if (b) return `${n} divise 18 mais pas 12 : dans B seulement.`;
    return `${n} ne divise ni 12 ni 18 : hors des deux.`;
  };

  const Region = ({ id, extraClass }) => {
    const r = REGIONS.find((x) => x.id === id);
    const items = numbers.filter((n) => placed[n] === id);
    return (
      <button
        type="button"
        disabled={disabled || selected === null}
        onClick={() => { if (selected !== null) { onPlace(selected, id); setSelected(null); } }}
        aria-label={`Placer ${r.label}`}
        className={`min-h-[76px] rounded-2xl border-2 p-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${extraClass} ${
          selected !== null && !disabled ? 'ring-2 ring-indigo-300 cursor-pointer' : 'cursor-default'
        }`}
      >
        <div className="text-[11px] font-mono font-bold text-slate-600 uppercase">{r.label}</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {items.map((n) => {
            const ok = vennRegion(n, A, B) === id;
            return (
              <span key={n} className={`px-2 py-0.5 rounded-lg font-mono text-sm font-bold border ${ok ? 'bg-white border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800 line-through'}`}>{n}</span>
            );
          })}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-3" role="group" aria-label="Diagramme de deux ensembles">
      <div className="flex flex-wrap gap-1.5 min-h-[44px]" role="group" aria-label="Nombres à placer">
        {pool.length === 0 && <span className="text-xs text-slate-400 italic self-center">Tous les nombres sont placés.</span>}
        {pool.map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            aria-pressed={selected === n}
            aria-label={`Nombre ${n}`}
            onClick={() => setSelected(selected === n ? null : n)}
            className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 font-mono font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              selected === n ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {selected !== null && <p className="text-xs text-indigo-700 font-semibold">Touche la région où va {selected}.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Region id="A" extraClass="border-sky-300 bg-sky-50" />
        <Region id="both" extraClass="border-violet-300 bg-violet-50" />
        <Region id="B" extraClass="border-amber-300 bg-amber-50" />
      </div>
      <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 px-1 flex-wrap gap-2">
        <span className="text-sky-700">A = {labelA}</span>
        <span className="text-amber-700">B = {labelB}</span>
      </div>
      <Region id="none" extraClass="border-slate-300 bg-slate-50" />
      {wrong.length > 0 && (
        <Feedback tone="ko">
          {wrong.map((n) => <span key={n} className="block">{reason(n)}</span>)}
        </Feedback>
      )}
    </div>
  );
}
