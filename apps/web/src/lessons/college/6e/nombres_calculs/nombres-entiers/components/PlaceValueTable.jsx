import React from 'react';
import { motion } from 'framer-motion';
import { PLACES, CLASS_LABELS, formatFr, highestPlaceValue } from './numberUtils';

/**
 * PlaceValueTable — tableau de numération dynamique.
 *
 * Il rend visible le principe central de la leçon : le chiffre n'est pas la
 * valeur. C'est sa POSITION qui lui donne sa valeur.
 *
 * Props :
 *   value          nombre affiché
 *   fromValue      plus grande colonne affichée (déf. : celle du nombre)
 *   onDigitClick   (cell) => void — rend les chiffres cliquables
 *   selectedKey    clé de la colonne sélectionnée ('DM', 'C', …)
 *   highlightKeys  clés mises en évidence (ex. la 1re différence en comparaison)
 *   showValues     affiche la ligne « valeur représentée »
 *   dimZeros       grise les zéros (utile pour parler du rôle du zéro)
 */
export default function PlaceValueTable({
  value,
  fromValue,
  onDigitClick,
  selectedKey,
  highlightKeys = [],
  showValues = false,
  dimZeros = false,
  compact = false,
  caption,
}) {
  const top = fromValue || highestPlaceValue(value);
  const cells = PLACES.filter((p) => p.value <= top).map((p) => ({
    ...p,
    digit: Math.floor(value / p.value) % 10,
    contributed: (Math.floor(value / p.value) % 10) * p.value,
  }));

  // Regroupement par classe pour l'en-tête (Millions | Milliers | Unités simples)
  const classes = [];
  cells.forEach((c) => {
    const last = classes[classes.length - 1];
    if (last && last.key === c.className) last.span += 1;
    else classes.push({ key: c.className, span: 1 });
  });

  const interactive = typeof onDigitClick === 'function';

  return (
    <div className="w-full overflow-x-auto">
      <table className="mx-auto border-separate border-spacing-0 min-w-max">
        {caption && <caption className="text-xs font-mono text-slate-400 mb-2">{caption}</caption>}
        <thead>
          <tr>
            {classes.map((cl, i) => (
              <th
                key={`${cl.key}-${i}`}
                colSpan={cl.span}
                scope="colgroup"
                className={`text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2 py-1.5 border-b-2 ${
                  cl.key === 'millions'
                    ? 'text-rose-600 border-rose-300 bg-rose-50'
                    : cl.key === 'milliers'
                    ? 'text-indigo-600 border-indigo-300 bg-indigo-50'
                    : 'text-emerald-600 border-emerald-300 bg-emerald-50'
                } ${i === 0 ? 'rounded-tl-xl' : ''} ${i === classes.length - 1 ? 'rounded-tr-xl' : ''}`}
              >
                {CLASS_LABELS[cl.key]}
              </th>
            ))}
          </tr>
          <tr>
            {cells.map((c) => (
              <th
                key={c.key}
                scope="col"
                className="px-1.5 sm:px-3 py-1.5 text-[9px] sm:text-[10px] font-mono text-slate-500 font-semibold border-b border-slate-200 bg-slate-50 align-bottom"
              >
                <span className="hidden sm:inline">{c.label}</span>
                <span className="sm:hidden uppercase">{c.shortLabel}</span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr>
            {cells.map((c) => {
              const isSelected = selectedKey === c.key;
              const isHighlighted = highlightKeys.includes(c.key);
              const isDimmed = dimZeros && c.digit === 0;

              const base = `font-mono font-extrabold tabular-nums transition-all ${
                compact ? 'text-xl sm:text-2xl w-10 h-12' : 'text-2xl sm:text-4xl w-12 sm:w-16 h-14 sm:h-20'
              }`;

              const tone = isSelected
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : isHighlighted
                ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400'
                : isDimmed
                ? 'bg-slate-50 text-slate-300'
                : 'bg-white text-slate-800';

              return (
                <td key={c.key} className="p-1 text-center border-b border-slate-200">
                  {interactive ? (
                    <button
                      type="button"
                      onClick={() => onDigitClick(c)}
                      aria-pressed={isSelected}
                      aria-label={`Chiffre ${c.digit}, position ${c.label}`}
                      className={`${base} ${tone} rounded-xl border-2 ${
                        isSelected ? 'border-blue-700' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                      } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                    >
                      {c.digit}
                    </button>
                  ) : (
                    <div className={`${base} ${tone} rounded-xl border-2 border-slate-200 flex items-center justify-center mx-auto`}>
                      {c.digit}
                    </div>
                  )}
                </td>
              );
            })}
          </tr>

          {showValues && (
            <tr>
              {cells.map((c) => (
                <td key={c.key} className="px-1 pt-2 text-center align-top">
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-[10px] sm:text-xs font-mono font-bold rounded-lg py-1 ${
                      c.digit === 0 ? 'text-slate-300 bg-slate-50' : 'text-slate-600 bg-slate-100'
                    }`}
                  >
                    {formatFr(c.contributed)}
                  </motion.div>
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
