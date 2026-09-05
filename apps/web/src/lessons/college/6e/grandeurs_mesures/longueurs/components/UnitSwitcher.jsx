import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { convert, formatLength } from './lengthUtils';

/**
 * UnitSwitcher — l'élève tape km / m / cm / mm pour une même distance
 * réelle fixe, et voit à la fois le nombre ET une densité de traits changer.
 *
 * La distance ne varie jamais : seule l'unité change, causalement. La
 * densité est représentative (nombre de traits plafonné), jamais un
 * rendu littéral d'une unité par élément — 465 000 000 mm ne peuvent
 * pas être 465 000 000 nœuds SVG.
 */

const UNITS = ['km', 'm', 'cm', 'mm'];
// Densité représentative : peu de traits (larges) en km, beaucoup (fins) en mm.
const TILE_COUNT = { km: 3, m: 8, cm: 24, mm: 48 };

export default function UnitSwitcher({ distanceKm = 465, unit, onUnitChange, disabled = false }) {
  const value = convert(distanceKm, 'km', unit);
  const tiles = TILE_COUNT[unit] ?? 8;

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2" role="group" aria-label="Choisir l'unité d'affichage">
        {UNITS.map((u) => (
          <button
            key={u}
            type="button"
            disabled={disabled}
            onClick={() => onUnitChange?.(u)}
            aria-pressed={u === unit}
            className={`px-4 py-2 rounded-xl font-mono font-extrabold text-sm border-2 transition-colors ${
              u === unit
                ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <p className="text-center text-xs text-slate-500">Paris → Lyon, exprimé en {unit}</p>
        {/* Le trajet occupe TOUJOURS toute la largeur : seul le nombre de
            morceaux change. C'est le contraste « peu de grosses unités » vs
            « beaucoup de petites » qui porte l'idée, pas la longueur du ruban. */}
        <div className="flex gap-[2px] h-8 items-stretch w-full" aria-hidden="true">
          {Array.from({ length: tiles }).map((_, i) => (
            <motion.div
              key={`${unit}-${i}`}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, delay: Math.min(i * 0.01, 0.3) }}
              className="bg-blue-500 rounded-[2px] flex-1 min-w-0"
            />
          ))}
        </div>
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={unit}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="inline-block font-mono font-extrabold text-2xl text-slate-800"
            >
              {formatLength(value, unit)}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <p className="text-center text-sm text-slate-600">
        Touche chaque unité : le trajet ne change pas, mais plus l'unité est petite, plus il en faut — et plus le
        nombre est long.
      </p>
    </div>
  );
}
