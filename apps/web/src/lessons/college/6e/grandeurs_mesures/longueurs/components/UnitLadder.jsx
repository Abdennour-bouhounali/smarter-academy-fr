import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { UNITS, factorBetween } from './lengthUtils';

/**
 * UnitLadder — échelle des unités interactive : touche un maillon pour
 * voir le facteur (×10, ×100 ou ×1000 selon la paire) entre deux unités
 * voisines. Le facteur vient de `factorBetween` (lengthUtils), jamais
 * d'une comparaison de chaîne sur le nom de l'unité — km→m et m→cm sont
 * deux facteurs différents (×1000 puis ×100) qu'un simple `u === 'm'`
 * confondait à tort dans la première version de ce composant.
 *
 * Extrait de Module07MissionFinale.jsx (où il vivait uniquement dans la
 * synthèse post-test) pour être réutilisé comme manipulation d'exploration
 * dans Module03ConstruireUnites.jsx.
 */
function formatFactor(n) {
  return n >= 1000 ? n.toLocaleString('fr-FR') : String(n);
}

export default function UnitLadder() {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap" role="group" aria-label="Échelle des unités, du kilomètre au millimètre">
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
                className="relative flex flex-col items-center justify-center px-1 sm:px-2 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <span className={`font-mono text-[10px] sm:text-xs font-extrabold transition-colors ${hover === i - 1 ? 'text-sky-600' : 'text-slate-300'}`}>
                  ×{formatFactor(factorBetween(UNITS[i - 1], u))}
                </span>
                <span aria-hidden="true" className={`text-sm transition-colors ${hover === i - 1 ? 'text-sky-500' : 'text-slate-300'}`}>→</span>
              </button>
            )}
            <motion.div
              animate={hover != null && (i === hover || i === hover + 1) ? { scale: 1.08 } : { scale: 1 }}
              transition={{ duration: reduced ? 0 : 0.15 }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center font-mono font-extrabold text-sm sm:text-base transition-colors ${
                hover != null && (i === hover || i === hover + 1)
                  ? 'bg-sky-600 border-sky-700 text-white shadow-sm'
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
              className="font-mono font-bold text-sm text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-4 py-1.5"
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
