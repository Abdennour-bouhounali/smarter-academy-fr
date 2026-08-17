import React from 'react';
import { motion } from 'framer-motion';

/**
 * Base10Blocks — matériel de numération base 10 (cubes, barres, plaques, blocs).
 *
 * Chaque forme rend visible le groupement par 10 :
 *   unité   = 1 petit carré
 *   dizaine = une barre de 10 carrés
 *   centaine= une plaque de 10 barres (10 × 10)
 *   millier = un bloc de 10 plaques (effet d'empilement)
 *
 * La représentation visuelle correspond exactement à l'écriture symbolique :
 * c'est ce qui permet à l'élève de relier « 3 centaines » et « 300 ».
 */

const UNIT = 'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2px]';

const TONE = {
  U: { fill: 'bg-emerald-500', ring: 'ring-emerald-600/30', text: 'text-emerald-700', soft: 'bg-emerald-50 border-emerald-200' },
  D: { fill: 'bg-sky-500', ring: 'ring-sky-600/30', text: 'text-sky-700', soft: 'bg-sky-50 border-sky-200' },
  C: { fill: 'bg-violet-500', ring: 'ring-violet-600/30', text: 'text-violet-700', soft: 'bg-violet-50 border-violet-200' },
  UM: { fill: 'bg-amber-500', ring: 'ring-amber-600/30', text: 'text-amber-700', soft: 'bg-amber-50 border-amber-200' },
};

export const BLOCK_TONE = TONE;

/** Un cube-unité. */
function Unit({ tone }) {
  return <div className={`${UNIT} ${tone.fill} ${tone.ring} ring-1`} aria-hidden="true" />;
}

/** Une barre-dizaine : 10 unités alignées — le groupement est visible. */
function Ten({ tone }) {
  return (
    <div className="flex flex-col gap-[2px] p-[3px] rounded bg-white/70 border border-slate-200" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className={`${UNIT} ${tone.fill}`} />
      ))}
    </div>
  );
}

/** Une plaque-centaine : 10 barres côte à côte. */
function Hundred({ tone }) {
  return (
    <div className="grid grid-cols-10 gap-[2px] p-[3px] rounded bg-white/70 border border-slate-200" aria-hidden="true">
      {Array.from({ length: 100 }, (_, i) => (
        <div key={i} className={`${UNIT} ${tone.fill}`} />
      ))}
    </div>
  );
}

/** Un bloc-millier : une plaque avec un effet d'empilement (10 plaques). */
function Thousand({ tone }) {
  return (
    <div className="relative" aria-hidden="true">
      <div className="absolute -top-1.5 -right-1.5 w-full h-full rounded bg-amber-200/70 border border-amber-300" />
      <div className="absolute -top-0.5 -right-0.5 w-full h-full rounded bg-amber-300/80 border border-amber-400" />
      <div className="relative grid grid-cols-10 gap-[2px] p-[3px] rounded bg-white/80 border border-slate-200">
        {Array.from({ length: 100 }, (_, i) => (
          <div key={i} className={`${UNIT} ${tone.fill}`} />
        ))}
      </div>
    </div>
  );
}

const SHAPES = { U: Unit, D: Ten, C: Hundred, UM: Thousand };

const GROUP_META = [
  { key: 'UM', label: 'milliers', unitLabel: 'millier', value: 1000 },
  { key: 'C', label: 'centaines', unitLabel: 'centaine', value: 100 },
  { key: 'D', label: 'dizaines', unitLabel: 'dizaine', value: 10 },
  { key: 'U', label: 'unités', unitLabel: 'unité', value: 1 },
];

/**
 * @param {{UM?:number, C?:number, D?:number, U?:number}} counts
 * @param {boolean} [showLabels] affiche le libellé « 3 centaines = 300 »
 * @param {string}  [highlight]  clé de la position à mettre en avant
 * @param {number}  [max]        nombre max de formes rendues par position (garde-fou)
 */
export default function Base10Blocks({ counts, showLabels = true, highlight, max = 12, compact = false }) {
  const groups = GROUP_META.filter((g) => (counts[g.key] || 0) > 0);

  if (groups.length === 0) {
    return (
      <div className="text-center text-sm text-slate-400 py-8 border-2 border-dashed border-slate-200 rounded-2xl">
        Aucun bloc pour l'instant — ajoute du matériel pour construire ton nombre.
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap ${compact ? 'gap-3' : 'gap-4 sm:gap-6'} items-end`}>
      {groups.map((g) => {
        const n = counts[g.key] || 0;
        const Shape = SHAPES[g.key];
        const tone = TONE[g.key];
        const shown = Math.min(n, max);
        const isHighlighted = highlight === g.key;

        return (
          <div
            key={g.key}
            className={`rounded-2xl border-2 p-3 transition-all ${
              isHighlighted ? `${tone.soft} ring-2 ${tone.ring}` : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex ${g.key === 'U' ? 'flex-wrap max-w-[120px]' : ''} items-end gap-1.5`}>
              {Array.from({ length: shown }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.18, delay: Math.min(i * 0.02, 0.2) }}
                >
                  <Shape tone={tone} />
                </motion.div>
              ))}
              {n > shown && (
                <span className={`text-xs font-mono font-bold ${tone.text} self-center`}>+{n - shown}</span>
              )}
            </div>

            {showLabels && (
              <div className="mt-2 text-center">
                <div className={`text-xs font-mono font-bold ${tone.text}`}>
                  {n} {n > 1 ? g.label : g.unitLabel}
                </div>
                <div className="text-[11px] font-mono text-slate-400">= {n * g.value}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
