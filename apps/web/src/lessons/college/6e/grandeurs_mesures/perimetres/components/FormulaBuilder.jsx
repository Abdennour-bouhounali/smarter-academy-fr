import React from 'react';
import { motion } from 'framer-motion';

/**
 * FormulaBuilder — construire une formule avec des jetons, au tap.
 *
 * L'élève tape un jeton de la réserve : le module le place dans le premier
 * emplacement vide. Taper un emplacement rempli le vide. Le composant est
 * un affichage contrôlé pur : `slots`/`chips` appartiennent au module, qui
 * valide lui-même la séquence (par ids de jetons, pas par libellés).
 */
export default function FormulaBuilder({
  slots,   // [{ id, placedChipId | null }]
  chips,   // [{ id, label, used }]
  onChipTap,
  onSlotTap,
  prefix = null, // ex. « P = » affiché avant les emplacements
  disabled = false,
  tone = 'violet',
}) {
  const toneMap = {
    violet: { filled: 'bg-violet-600 border-violet-700 text-white', chip: 'hover:border-violet-400' },
    emerald: { filled: 'bg-emerald-600 border-emerald-700 text-white', chip: 'hover:border-emerald-400' },
  };
  const t = toneMap[tone] ?? toneMap.violet;
  const chipLabel = (id) => chips.find((c) => c.id === id)?.label ?? '?';

  return (
    <div className="space-y-4">
      {/* Emplacements */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap" role="group" aria-label="Formule en construction">
        {prefix && <span className="font-mono font-extrabold text-lg text-slate-700 mr-1">{prefix}</span>}
        {slots.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            onClick={() => s.placedChipId && onSlotTap?.(s.id)}
            aria-label={s.placedChipId ? `Retirer ${chipLabel(s.placedChipId)}` : 'Emplacement vide'}
            className={`min-w-[44px] min-h-[44px] px-2 rounded-lg border-2 font-mono font-extrabold text-lg flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
              s.placedChipId
                ? t.filled
                : 'bg-white border-dashed border-slate-300 text-slate-300'
            }`}
          >
            {s.placedChipId ? chipLabel(s.placedChipId) : '·'}
          </button>
        ))}
      </div>

      {/* Réserve de jetons */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap" role="group" aria-label="Jetons disponibles">
        {chips.map((c) => (
          <motion.button
            key={c.id}
            type="button"
            layout
            disabled={disabled || c.used}
            onClick={() => onChipTap?.(c.id)}
            aria-label={`Placer ${c.label}`}
            className={`min-w-[44px] min-h-[44px] px-2 rounded-lg border-2 font-mono font-extrabold text-lg flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
              c.used
                ? 'bg-slate-100 border-slate-200 text-slate-300'
                : `bg-white border-slate-300 text-slate-700 ${t.chip}`
            }`}
          >
            {c.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
