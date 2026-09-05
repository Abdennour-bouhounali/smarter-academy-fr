import React from 'react';
import { niceMax, axisTicks, valueToY, formatValue, allVariations } from './chartUtils';

/**
 * LineChart — points reliés : la représentation de l'ÉVOLUTION.
 *
 * Utilisé au module 5 pour faire apparaître ce qu'un diagramme en bâtons
 * montre moins bien : le SENS de variation entre deux relevés. Les segments
 * peuvent être colorés selon la variation (montée verte / descente rose),
 * ce qui rend la lecture « ça monte, ça descend » littéralement visible.
 *
 * Composant d'affichage pur (role="img") : aucune zone tactile, donc aucune
 * règle de pointage à respecter ici. L'aria-label énonce la série entière
 * puis son allure générale.
 */
const VB = { w: 340, h: 230 };
const PLOT = { left: 42, right: 14, top: 18, bottom: 186 };

export default function LineChart({
  series,
  step = 5,
  colorByVariation = false,
  showPoints = true,
  highlightIndex = null,
  title = '',
  axisLabel = '',
}) {
  const max = niceMax(series, step);
  const ticks = axisTicks(series, step);
  const n = series.categories.length;
  const dx = (VB.w - PLOT.left - PLOT.right) / Math.max(1, n - 1);

  const px = (i) => PLOT.left + dx * i;
  const py = (v) => valueToY(v, max, PLOT.top, PLOT.bottom);

  const vars = allVariations(series);
  const readAll = series.categories.map((c, i) => `${c} : ${formatValue(series, series.values[i])}`).join(', ');

  return (
    <div className="w-full">
      {title && <p className="text-center text-sm font-semibold text-slate-700 mb-1">{title}</p>}
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="w-full max-w-md mx-auto block"
        role="img"
        aria-label={`${title || 'Graphique d’évolution'}. ${readAll}.`}
      >
        <g pointerEvents="none">
          {ticks.map((v) => (
            <g key={v}>
              <line x1={PLOT.left} y1={py(v)} x2={VB.w - PLOT.right} y2={py(v)} stroke="#e2e8f0" strokeWidth="1" />
              <text x={PLOT.left - 6} y={py(v) + 4} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="monospace">
                {v}
              </text>
            </g>
          ))}
          <line x1={PLOT.left} y1={PLOT.top} x2={PLOT.left} y2={PLOT.bottom} stroke="#334155" strokeWidth="1.5" />
          <line x1={PLOT.left} y1={PLOT.bottom} x2={VB.w - PLOT.right} y2={PLOT.bottom} stroke="#334155" strokeWidth="1.5" />
          {axisLabel && <text x={4} y={12} fontSize="10" fill="#475569" fontFamily="monospace">{axisLabel}</text>}

          {/* Segments : un par intervalle, colorés selon la variation. */}
          {series.values.slice(1).map((v, k) => {
            const i = k + 1;
            const dir = vars[k]?.direction;
            const stroke = !colorByVariation ? '#7c3aed' : dir === 'hausse' ? '#059669' : dir === 'baisse' ? '#e11d48' : '#64748b';
            return (
              <line
                key={series.categories[i]}
                x1={px(i - 1)}
                y1={py(series.values[i - 1])}
                x2={px(i)}
                y2={py(v)}
                stroke={stroke}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}

          {showPoints &&
            series.values.map((v, i) => (
              <circle
                key={series.categories[i]}
                cx={px(i)}
                cy={py(v)}
                r={highlightIndex === i ? 6 : 4}
                fill={highlightIndex === i ? '#f59e0b' : '#4c1d95'}
                stroke="white"
                strokeWidth="1.5"
              />
            ))}

          {series.categories.map((c, i) => (
            <text key={c} x={px(i)} y={PLOT.bottom + 16} textAnchor="middle" fontSize="10" fill="#475569">
              {c}
            </text>
          ))}

          {highlightIndex !== null && series.values[highlightIndex] !== undefined && (
            <text
              x={px(highlightIndex)}
              y={py(series.values[highlightIndex]) - 12}
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#0f172a"
              fontFamily="monospace"
            >
              {series.values[highlightIndex]}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
