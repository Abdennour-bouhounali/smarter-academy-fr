import React from 'react';

/**
 * QuantityPicker — choisir les DEUX grandeurs qui comptent.
 *
 * Activity            toucher, parmi plusieurs grandeurs proposées, celles
 *                     qui interviennent dans la question posée.
 * Mathematical objective  avant tout calcul, nommer les grandeurs : celle
 *                     qui varie (la variable) et celle qui en dépend. Les
 *                     autres — poids, autonomie — sont du décor.
 * Mathematical state  `selected` (Set d'ids) appartient au module ; la
 *                     pertinence de chaque grandeur est une donnée.
 * Visual consequence  la grandeur retenue passe en indigo ; à la révélation,
 *                     ✓ / ✗ par grandeur.
 */
export default function QuantityPicker({ quantities, selected, onToggle, revealed = false, disabled = false, max = 2 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-label="Les grandeurs de la situation">
      {quantities.map((q) => {
        const on = selected.has(q.id);
        const ok = revealed && q.relevant;
        const ko = revealed && on && !q.relevant;
        return (
          <button key={q.id} type="button" disabled={disabled || revealed || (!on && selected.size >= max)} onClick={() => onToggle?.(q.id)} aria-pressed={on}
            aria-label={`Grandeur : ${q.label}${on ? ' (retenue)' : ''}`}
            className={`min-h-[48px] px-3 py-2 rounded-xl border-2 text-sm font-semibold text-left transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-70
              ${ok ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : ko ? 'bg-rose-50 border-rose-400 text-rose-800' : on ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400'}`}
            style={{ touchAction: 'manipulation' }}>
            {q.label}{revealed && <span aria-hidden="true" className="ml-2">{q.relevant ? '✓' : on ? '✗' : ''}</span>}
          </button>
        );
      })}
    </div>
  );
}
