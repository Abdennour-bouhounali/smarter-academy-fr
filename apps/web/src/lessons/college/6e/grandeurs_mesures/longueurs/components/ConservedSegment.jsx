import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { factorBetween, formatLength } from './lengthUtils';

/**
 * ConservedSegment — une barre de largeur PIXEL fixe, dont seules les
 * subdivisions et l'étiquette changent quand l'élève tape une autre unité.
 * La barre elle-même ne bouge jamais : c'est ce qui montre que la longueur
 * physique ne change pas, seul le nombre qui la décrit change.
 *
 * Les unités proposées se limitent par défaut à fromUnit/toUnit (pas les 4
 * unités du programme) : au-delà de ces deux-là, le facteur avec fromUnit
 * peut être très grand (mm) ou inférieur à 1 (une unité plus grande, ex.
 * km) et le découpage cesse d'être lisible ou pertinent pour cette manche.
 */

const BAR_LEFT = 60;
const BAR_RIGHT = 940;
const BAR_W = BAR_RIGHT - BAR_LEFT;

export default function ConservedSegment({ value, fromUnit, toUnit, unit, onUnitChange, offeredUnits, width = 1000, height = 130, disabled = false }) {
  const reduced = useReducedMotion();
  const units = offeredUnits ?? [fromUnit, toUnit];
  const activeUnit = unit ?? fromUnit;
  const displayValue = activeUnit === fromUnit ? value : value * factorBetween(fromUnit, activeUnit);
  // Nombre de subdivisions représentatif du changement d'échelle, plafonné
  // pour rester lisible : le facteur réel peut valoir jusqu'à 1 000 000, ou
  // être inférieur à 1 si l'élève choisit une unité PLUS GRANDE que
  // fromUnit (ex. fromUnit="m", activeUnit="km" → facteur 0,001). Dans ce
  // cas il n'y a pas de subdivision à montrer : le segment reste entier.
  const rawFactor = factorBetween(fromUnit, activeUnit);
  const subdivisions = rawFactor <= 1 ? 1 : Math.min(40, Math.round(rawFactor));

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2" role="group" aria-label="Choisir l'unité d'affichage du segment">
        {units.map((u) => (
          <button
            key={u}
            type="button"
            disabled={disabled}
            onClick={() => onUnitChange?.(u)}
            aria-pressed={u === activeUnit}
            className={`px-3 py-1.5 rounded-lg font-mono font-extrabold text-sm border-2 transition-colors ${
              u === activeUnit
                ? 'bg-violet-600 border-violet-700 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:border-violet-300'
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Segment de longueur fixe, unité et subdivisions variables">
        {/* La barre : position et largeur ne changent JAMAIS, quelle que soit l'unité. */}
        <rect x={BAR_LEFT} y={height / 2 - 14} width={BAR_W} height={28} rx={6} fill="#ede9fe" stroke="#7c3aed" strokeWidth="3" />

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
                <line key={i} x1={x} y1={height / 2 - 14} x2={x} y2={height / 2 + 14} stroke="#7c3aed" strokeWidth={i === 0 || i === subdivisions ? 0 : 1.5} opacity={0.55} />
              );
            })}
          </motion.g>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.text
            key={`label-${activeUnit}`}
            x={width / 2}
            y={height / 2 + 46}
            textAnchor="middle"
            initial={{ opacity: 0, y: height / 2 + 40 }}
            animate={{ opacity: 1, y: height / 2 + 46 }}
            exit={{ opacity: 0, y: height / 2 + 52 }}
            transition={{ duration: reduced ? 0.05 : 0.22 }}
            style={{ fontSize: 24, fontFamily: 'monospace', fontWeight: 800 }}
            className="fill-violet-800"
          >
            {formatLength(displayValue, activeUnit)}
          </motion.text>
        </AnimatePresence>
      </svg>

      <p className="text-center text-sm text-slate-600">
        Le segment ne bouge pas : c'est toujours la même longueur. Seuls le découpage et le nombre changent avec
        l'unité.
      </p>
    </div>
  );
}
