import React from 'react';
import { pieSlices, slicePath, total, formatValue, polarPoint } from './chartUtils';

/**
 * PieChart — diagramme circulaire (au programme de 6e : « diagrammes en
 * bâtons, circulaires »).
 *
 * Les secteurs viennent tous de `pieSlices`, qui garantit une somme de 360°
 * exactement : le camembert ne peut donc pas laisser de trou ni déborder.
 * La leçon s'en sert pour UNE idée précise — un camembert montre des PARTS
 * d'un tout, là où les bâtons montrent des quantités comparables. Les
 * fractions et pourcentages ne sont pas calculés ici : hors programme au
 * niveau visé, on lit « à peu près la moitié », « un quart ».
 *
 * Mode 'read' : chaque secteur est un vrai bouton (role="button", Enter/Espace).
 * Mode 'display' : SVG role="img" énonçant toutes les parts.
 */
const SIZE = 220;
const CX = 110;
const CY = 104;
const R = 82;

const PALETTE = ['#0284c7', '#059669', '#d97706', '#7c3aed', '#e11d48', '#0891b2'];

export default function PieChart({
  series,
  mode = 'display',      // 'display' | 'read'
  selected = null,
  onSelect = null,
  title = '',
  disabled = false,
}) {
  const slices = pieSlices(series);
  const t = total(series);
  const interactive = mode === 'read' && !disabled;

  const readAll = slices
    .map((s) => `${s.category} : ${formatValue(series, s.value)}`)
    .join(', ');

  return (
    <div className="w-full">
      {title && <p className="text-center text-sm font-semibold text-slate-700 mb-1">{title}</p>}
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[240px] mx-auto block"
        style={{ touchAction: 'manipulation' }}
        role={interactive ? 'group' : 'img'}
        aria-label={`${title || 'Diagramme circulaire'}. Total ${formatValue(series, t)}. ${readAll}.`}
      >
        {slices.map((s, i) => {
          const isSel = selected === i;
          const path = slicePath(CX, CY, isSel ? R + 5 : R, s.startAngle, s.sweep);
          const mid = polarPoint(CX, CY, R * 0.62, s.startAngle + s.sweep / 2);
          return (
            <g key={s.category}>
              <path
                d={path}
                fill={PALETTE[i % PALETTE.length]}
                stroke="white"
                strokeWidth="2"
                opacity={selected !== null && !isSel ? 0.55 : 1}
                role={interactive ? 'button' : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-label={interactive ? `${s.category} : ${formatValue(series, s.value)}` : undefined}
                onClick={interactive ? () => onSelect?.(i) : undefined}
                onKeyDown={
                  interactive
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(i); }
                      }
                    : undefined
                }
                style={{ cursor: interactive ? 'pointer' : 'default', outline: 'none' }}
              />
              {s.sweep >= 34 && (
                <text
                  x={mid.x}
                  y={mid.y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="white"
                  fontFamily="monospace"
                  pointerEvents="none"
                >
                  {s.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
        {slices.map((s, i) => (
          <span key={s.category} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
              aria-hidden="true"
            />
            {s.category}
          </span>
        ))}
      </div>
    </div>
  );
}
