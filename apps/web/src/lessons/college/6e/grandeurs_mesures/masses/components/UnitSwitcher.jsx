import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { convert, formatMass } from './massUtils';

/**
 * UnitSwitcher — l'élève tape t / kg / g / mg pour une même masse réelle
 * fixe, et voit à la fois le nombre ET une densité de blocs changer.
 *
 * La masse ne varie jamais : seule l'unité change, causalement. La densité
 * est représentative (nombre de blocs plafonné), jamais un rendu littéral
 * d'une unité par élément — 12 000 000 000 mg ne peuvent pas être
 * 12 000 000 000 nœuds DOM.
 */

const UNITS = ['t', 'kg', 'g', 'mg'];
// Densité représentative : peu de blocs (larges) en t, beaucoup (fins) en mg.
const TILE_COUNT = { t: 3, kg: 10, g: 26, mg: 52 };

export default function UnitSwitcher({ massT = 12, label = 'Le camion chargé', unit, onUnitChange, disabled = false }) {
  const value = convert(massT, 't', unit);
  const tiles = TILE_COUNT[unit] ?? 10;

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
                ? 'bg-sky-600 border-sky-700 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300'
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <p className="text-center text-xs text-slate-500">{label}, exprimé en {unit}</p>
        {/* La masse occupe TOUJOURS toute la largeur : seul le nombre de
            morceaux change. C'est le contraste « peu de grosses unités » vs
            « beaucoup de petites » qui porte l'idée, pas la taille du bandeau. */}
        <div className="flex gap-[2px] h-8 items-stretch w-full" aria-hidden="true">
          {Array.from({ length: tiles }).map((_, i) => (
            <motion.div
              key={`${unit}-${i}`}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, delay: Math.min(i * 0.01, 0.3) }}
              className="bg-sky-500 rounded-[2px] flex-1 min-w-0"
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
              {formatMass(value, unit)}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <p className="text-center text-sm text-slate-600">
        Touche chaque unité : la masse ne change pas, mais plus l'unité est petite, plus il en faut — et plus le
        nombre est long.
      </p>
    </div>
  );
}
