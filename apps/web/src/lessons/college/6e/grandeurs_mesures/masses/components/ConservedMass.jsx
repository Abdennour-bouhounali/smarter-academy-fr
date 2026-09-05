import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { factorBetween, formatMass } from './massUtils';

/**
 * ConservedMass — un bloc de largeur PIXEL fixe, dont seules les
 * subdivisions et l'étiquette changent quand l'élève tape une autre unité.
 * Le bloc lui-même ne bouge jamais : c'est ce qui montre que la masse
 * physique ne change pas, seul le nombre qui la décrit change.
 *
 * Les unités proposées se limitent par défaut à fromUnit/toUnit (pas les 4
 * unités du programme) : au-delà, le facteur peut valoir 1 000 000 (illisible)
 * ou être inférieur à 1 (une unité plus grande : rien à subdiviser).
 */

const BAR_LEFT = 60;
const BAR_RIGHT = 940;
const BAR_W = BAR_RIGHT - BAR_LEFT;

export default function ConservedMass({ value, fromUnit, toUnit, unit, onUnitChange, offeredUnits, width = 1000, height = 130, disabled = false }) {
  const reduced = useReducedMotion();
  const units = offeredUnits ?? [fromUnit, toUnit];
  const activeUnit = unit ?? fromUnit;
  const displayValue = activeUnit === fromUnit ? value : value * factorBetween(fromUnit, activeUnit);
  // Subdivisions représentatives du changement d'échelle, plafonnées pour
  // rester lisibles : entre masses le facteur réel vaut 1 000 par marche.
  const rawFactor = factorBetween(fromUnit, activeUnit);
  const subdivisions = rawFactor <= 1 ? 1 : Math.min(40, Math.round(rawFactor));

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2" role="group" aria-label="Choisir l'unité d'affichage de la masse">
        {units.map((u) => (
          <button
            key={u}
            type="button"
            disabled={disabled}
            onClick={() => onUnitChange?.(u)}
            aria-pressed={u === activeUnit}
            className={`px-3 py-1.5 rounded-lg font-mono font-extrabold text-sm border-2 transition-colors ${
              u === activeUnit
                ? 'bg-rose-600 border-rose-700 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300'
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Masse de valeur fixe, unité et subdivisions variables">
        {/* Le bloc : position et largeur ne changent JAMAIS, quelle que soit l'unité. */}
        <rect x={BAR_LEFT} y={height / 2 - 16} width={BAR_W} height={32} rx={6} fill="#ffe4e6" stroke="#e11d48" strokeWidth="3" />

        <AnimatePresence mode="wait">
          <motion.g
            key={activeUnit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.05 : 0.22 }}
          >
            {Array.from({ length: subdivisions + 1 }).map((_, i) => {
              const x = BAR_LEFT + (i / subdivisions) * BAR_W;
              return (
                <line key={i} x1={x} y1={height / 2 - 16} x2={x} y2={height / 2 + 16} stroke="#e11d48" strokeWidth={i === 0 || i === subdivisions ? 0 : 1.5} opacity={0.55} />
              );
            })}
          </motion.g>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.text
            key={`label-${activeUnit}`}
            x={width / 2}
            y={height / 2 + 48}
            textAnchor="middle"
            initial={{ opacity: 0, y: height / 2 + 42 }}
            animate={{ opacity: 1, y: height / 2 + 48 }}
            exit={{ opacity: 0, y: height / 2 + 54 }}
            transition={{ duration: reduced ? 0.05 : 0.22 }}
            style={{ fontSize: 24, fontFamily: 'monospace', fontWeight: 800 }}
            className="fill-rose-800"
          >
            {formatMass(displayValue, activeUnit)}
          </motion.text>
        </AnimatePresence>
      </svg>

      <p className="text-center text-sm text-slate-600">
        Le bloc ne change pas de taille : c'est toujours la même masse. Seuls le découpage et le nombre changent
        avec l'unité.
      </p>
    </div>
  );
}
