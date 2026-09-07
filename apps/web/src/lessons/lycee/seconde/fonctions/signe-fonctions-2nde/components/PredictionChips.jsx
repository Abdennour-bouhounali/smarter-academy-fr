import React from 'react';

/**
 * PredictionChips — recueillir une prédiction SANS verdict (INTERACTION_PEDAGOGY
 * §6ter.3) : c'est la manipulation qui répondra, pas le texte.
 *
 * @param {{id, label}[]} options
 * @param {string|null} value
 * @param {(id:string)=>void} onChange
 * @param {boolean} [disabled]
 */
export default function PredictionChips({ options, value, onChange, disabled = false, ariaLabel = 'Ta prédiction', prompt = null }) {
  const chips = (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            disabled={disabled}
            aria-pressed={on}
            onClick={() => onChange(o.id)}
            className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              on ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400'
            } disabled:opacity-60`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
  if (!prompt) return chips;
  // Prédiction facultative, posée À CÔTÉ de la manipulation (jamais devant) :
  // le laboratoire est visible dès la première seconde.
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 space-y-2">
      <p className="text-xs font-semibold text-indigo-900">🔮 Avant d’essayer, ta prédiction (sans verdict) : {prompt}</p>
      {chips}
    </div>
  );
}
