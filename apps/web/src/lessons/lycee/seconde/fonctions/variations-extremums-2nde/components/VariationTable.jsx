import React from 'react';
import { variationTable, formatDec, DIR_ARROW } from './variationsUtils';

/**
 * VariationTable — le tableau de variations, rendu ET saisi.
 *
 * Ligne x : bornes et points de retournement. Ligne f(x) : les valeurs aux
 * bornes, posées en haut ou en bas selon la flèche, et entre elles une
 * flèche ↗ ou ↘. En mode saisie (`editable`), les flèches sont des boutons
 * qui alternent ↗ / ↘ ; les valeurs (calculées) restent affichées ; la
 * correction (`reveal`) colore chaque flèche d'après le tableau exact.
 * `values`/`onChange` appartiennent au module. Tout est dérivé de la fonction.
 */
export default function VariationTable({ f, editable = false, values = null, onChange = null, reveal = false, unit = '', caption = null, hideValues = false }) {
  const t = variationTable(f);
  const n = t.arrows.length;
  const truth = t.arrows;
  // Position haute/basse de chaque valeur : haut si la flèche arrivante monte ou la sortante descend.
  const isHigh = (i) => {
    const before = i > 0 ? (values && (editable || reveal) ? values[i - 1] ?? truth[i - 1] : truth[i - 1]) : null;
    const after = i < n ? (values && (editable || reveal) ? values[i] ?? truth[i] : truth[i]) : null;
    if (before === 'croissante') return true; if (before === 'decroissante') return false;
    if (after === 'decroissante') return true; if (after === 'croissante') return false;
    return true;
  };
  const arrowBtn = (i) => {
    const v = values ? values[i] : null; const ok = reveal && v === truth[i]; const ko = reveal && v !== null && v !== truth[i];
    return (
      <button key={i} type="button" disabled={!editable || reveal} aria-label={`Flèche de l’intervalle ${i + 1}${v ? ` : ${v}` : ''}`}
        onClick={() => onChange?.(i, v === 'croissante' ? 'decroissante' : 'croissante')}
        className={`min-w-[52px] min-h-[44px] rounded-lg border-2 font-bold text-2xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${ok ? 'bg-emerald-600 border-emerald-700 text-white' : ko ? 'bg-rose-600 border-rose-700 text-white' : v ? 'bg-slate-800 border-slate-900 text-white' : 'bg-white border-dashed border-slate-400 text-slate-400'}`}>
        {v ? DIR_ARROW[v] : '?'}{ko ? <span className="text-sm"> → {DIR_ARROW[truth[i]]}</span> : ''}
      </button>
    );
  };
  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
      <table className="w-full text-sm">
        {caption && <caption className="text-xs text-slate-500 py-1.5">{caption}</caption>}
        <thead>
          <tr className="bg-slate-50 text-slate-600">
            <th scope="row" className="px-2 py-2 text-left font-mono font-bold">x</th>
            {t.bounds.map((b, j) => (
              <React.Fragment key={j}>
                <td className="px-1 py-2 text-center font-mono font-bold tabular-nums whitespace-nowrap">{formatDec(b.x)}</td>
                {j < n && <td className="px-1 py-2" />}
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-200">
            <th scope="row" className="px-2 py-2 text-left font-mono font-bold text-slate-700 whitespace-nowrap align-middle">{f.name}(x)</th>
            {t.bounds.map((b, j) => (
              <React.Fragment key={j}>
                <td className="px-1 py-1 text-center align-middle">
                  <div className={`flex flex-col ${isHigh(j) ? 'justify-start' : 'justify-end'}`} style={{ minHeight: 76 }}>
                    <span className={`font-mono font-bold tabular-nums text-slate-800 whitespace-nowrap ${isHigh(j) ? 'mt-0' : 'mt-auto'}`} data-bound-value={b.y}>{hideValues ? '' : `${formatDec(b.y)}${unit}`}</span>
                  </div>
                </td>
                {j < n && (
                  <td className="px-1 py-1 text-center align-middle">
                    {editable || reveal ? arrowBtn(j) : <span className={`text-3xl font-bold ${truth[j] === 'croissante' ? 'text-emerald-600' : truth[j] === 'decroissante' ? 'text-rose-600' : 'text-slate-500'}`} aria-label={truth[j]}>{DIR_ARROW[truth[j]]}</span>}
                  </td>
                )}
              </React.Fragment>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
