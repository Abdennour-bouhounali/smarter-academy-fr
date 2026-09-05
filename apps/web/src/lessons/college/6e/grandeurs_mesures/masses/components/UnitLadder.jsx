import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { UNITS, factorBetween } from './massUtils';

/**
 * UnitLadder — échelle des unités interactive : touche un maillon pour voir
 * le facteur entre deux unités voisines.
 *
 * Le facteur vient de `factorBetween` (massUtils), jamais d'une comparaison
 * de chaîne sur le nom de l'unité. Pour les masses les trois marches valent
 * ×1 000 (t→kg→g→mg), mais on garde la dérivation : elle reste juste si les
 * unités changent, et elle a évité un vrai bug dans la leçon Longueurs, où
 * un `u === 'm'` confondait ×1 000 et ×100.
 */
function formatFactor(n) {
  return n >= 1000 ? n.toLocaleString('fr-FR') : String(n);
}

export default function UnitLadder() {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap" role="group" aria-label="Échelle des unités, de la tonne au milligramme">
        {UNITS.map((u, i) => (
          <React.Fragment key={u}>
            {i > 0 && (
              <button
                type="button"
                onMouseEnter={() => setHover(i - 1)}
                onMouseLeave={() => setHover((h) => (h === i - 1 ? null : h))}
                onFocus={() => setHover(i - 1)}
                onBlur={() => setHover((h) => (h === i - 1 ? null : h))}
                onClick={() => setHover((h) => (h === i - 1 ? null : i - 1))}
                aria-label={`Relation entre ${UNITS[i - 1]} et ${u} — clique pour voir le facteur`}
                className="relative flex flex-col items-center justify-center px-1 sm:px-2 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <span className={`font-mono text-[10px] sm:text-xs font-extrabold transition-colors ${hover === i - 1 ? 'text-violet-600' : 'text-slate-300'}`}>
                  ×{formatFactor(factorBetween(UNITS[i - 1], u))}
                </span>
                <span aria-hidden="true" className={`text-sm transition-colors ${hover === i - 1 ? 'text-violet-500' : 'text-slate-300'}`}>→</span>
              </button>
            )}
            <motion.div
              animate={hover != null && (i === hover || i === hover + 1) ? { scale: 1.08 } : { scale: 1 }}
              transition={{ duration: reduced ? 0 : 0.15 }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center font-mono font-extrabold text-sm sm:text-base transition-colors ${
                hover != null && (i === hover || i === hover + 1)
                  ? 'bg-violet-600 border-violet-700 text-white shadow-sm'
                  : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              {u}
            </motion.div>
          </React.Fragment>
        ))}
      </div>

      <div className="min-h-[34px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {hover != null ? (
            <motion.div
              key={hover}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: reduced ? 0 : 0.15 }}
              className="font-mono font-bold text-sm text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5"
            >
              1 {UNITS[hover]} = {formatFactor(factorBetween(UNITS[hover], UNITS[hover + 1]))} {UNITS[hover + 1]}
            </motion.div>
          ) : (
            <div className="text-[11px] text-slate-400 text-center">
              Touche une flèche pour voir la relation entre deux unités voisines.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
