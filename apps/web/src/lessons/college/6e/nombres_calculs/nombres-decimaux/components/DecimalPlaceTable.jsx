import React from 'react';
import { motion } from 'framer-motion';
import { decCells, formatDec } from './decimalUtils';

/**
 * DecimalPlaceTable — tableau de numération décimal.
 *
 * La virgule n'est pas un signe de ponctuation posé au hasard : c'est la
 * FRONTIÈRE entre les unités entières et les parts d'unité. Le tableau la rend
 * visible comme une colonne à part entière, entre « Unités » et « Dixièmes ».
 */
export default function DecimalPlaceTable({
  value,
  intPlaces = 2,
  decPlaces = 3,
  onDigitClick,
  selectedKey,
  highlightKeys = [],
  showValues = false,
  dimZeros = false,
  compact = false,
  caption,
}) {
  const cells = decCells(value, { intPlaces, decPlaces });
  const interactive = typeof onDigitClick === 'function';
  const intCount = cells.filter((c) => c.side === 'int').length;
  const decCount = cells.filter((c) => c.side === 'dec').length;

  const digitBox = compact
    ? 'text-xl sm:text-2xl w-10 h-12'
    : 'text-2xl sm:text-4xl w-12 sm:w-16 h-14 sm:h-20';

  const renderCell = (c) => {
    const isSelected = selectedKey === c.key;
    const isHighlighted = highlightKeys.includes(c.key);
    const isDimmed = dimZeros && c.digit === 0;

    const tone = isSelected
      ? 'bg-blue-600 text-white border-blue-700 shadow-md'
      : isHighlighted
      ? 'bg-amber-100 text-amber-800 border-amber-400 ring-2 ring-amber-300'
      : isDimmed
      ? 'bg-slate-50 text-slate-300 border-slate-200'
      : 'bg-white text-slate-800 border-slate-200';

    const base = `${digitBox} font-mono font-extrabold tabular-nums rounded-xl border-2 transition-all`;

    return interactive ? (
      <button
        type="button"
        onClick={() => onDigitClick(c)}
        aria-pressed={isSelected}
        aria-label={`Chiffre ${c.digit}, position ${c.label}`}
        className={`${base} ${tone} ${
          isSelected ? '' : 'hover:border-blue-400 hover:bg-blue-50'
        } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
      >
        {c.digit}
      </button>
    ) : (
      <div className={`${base} ${tone} flex items-center justify-center mx-auto`}>{c.digit}</div>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="mx-auto border-separate border-spacing-0 min-w-max">
        {caption && <caption className="text-xs font-mono text-slate-400 mb-2">{caption}</caption>}
        <thead>
          <tr>
            <th
              colSpan={intCount}
              scope="colgroup"
              className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2 py-1.5 border-b-2 text-indigo-600 border-indigo-300 bg-indigo-50 rounded-tl-xl"
            >
              Partie entière
            </th>
            <th className="w-6" aria-hidden="true" />
            <th
              colSpan={decCount}
              scope="colgroup"
              className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2 py-1.5 border-b-2 text-emerald-600 border-emerald-300 bg-emerald-50 rounded-tr-xl"
            >
              Partie décimale
            </th>
          </tr>
          <tr>
            {cells.map((c, i) => (
              <React.Fragment key={c.key}>
                {i === intCount && (
                  <th className="px-0.5 pb-1 text-center align-bottom" aria-hidden="true">
                    <span className="text-[9px] font-mono text-slate-400 uppercase">virgule</span>
                  </th>
                )}
                <th
                  scope="col"
                  className="px-1.5 sm:px-3 py-1.5 text-[9px] sm:text-[10px] font-mono text-slate-500 font-semibold border-b border-slate-200 bg-slate-50 align-bottom"
                >
                  <span className="hidden sm:inline">{c.label}</span>
                  <span className="sm:hidden uppercase">{c.shortLabel}</span>
                </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr>
            {cells.map((c, i) => (
              <React.Fragment key={c.key}>
                {i === intCount && (
                  <td className="px-0.5 align-middle text-center">
                    {/* La virgule vit ENTRE deux colonnes : elle sépare, elle ne compte pas. */}
                    <span className="text-3xl sm:text-4xl font-extrabold text-rose-500 leading-none">,</span>
                  </td>
                )}
                <td className="p-1 text-center border-b border-slate-200">{renderCell(c)}</td>
              </React.Fragment>
            ))}
          </tr>

          {showValues && (
            <tr>
              {cells.map((c, i) => (
                <React.Fragment key={c.key}>
                  {i === intCount && <td aria-hidden="true" />}
                  <td className="px-1 pt-2 text-center align-top">
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-[10px] sm:text-xs font-mono font-bold rounded-lg py-1 ${
                        c.digit === 0 ? 'text-slate-300 bg-slate-50' : 'text-slate-600 bg-slate-100'
                      }`}
                    >
                      {formatDec(c.contributed)}
                    </motion.div>
                  </td>
                </React.Fragment>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
