import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { formatTime, formatDuration, fromSeconds } from './durationUtils';

/**
 * DurationLine — la ligne du temps de la méthode des sauts.
 *
 * Affichage contrôlé pur : le module fournit start/end/hops (de
 * hopsBetween) et `visibleCount` ; chaque saut révélé dessine son arc
 * (pathLength animé) et son étiquette « + 13 min », avec les instants
 * intermédiaires sous la ligne. Les durées se lisent comme des SAUTS entre
 * deux instants — jamais comme une soustraction posée en colonnes.
 */
const W = 640;
const LINE_Y = 96;
const PAD = 46;

export default function DurationLine({
  start,
  end,
  hops,
  visibleCount = 0,
  showTotal = false,
  size = 640,
  ariaLabel,
}) {
  const reduced = useReducedMotion();
  const n = hops.length;
  // Positions : répartition régulière des instants (schéma, pas à l'échelle
  // du temps réel — comme les schémas en barres du reste du site).
  const points = [start, ...hops.map((hp) => hp.arrivesAt)];
  const xs = points.map((_, i) => PAD + (i * (W - 2 * PAD)) / Math.max(1, points.length - 1));
  const totalMin = hops.slice(0, visibleCount).reduce((s, hp) => s + hp.minutes, 0);
  const allVisible = visibleCount >= n;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} 150`}
        className="w-full min-w-[340px] select-none"
        role="img"
        aria-label={ariaLabel ?? `Ligne du temps de ${formatTime(start)} à ${formatTime(end)}`}
      >
        {/* Ligne du temps + flèche */}
        <line x1={12} y1={LINE_Y} x2={W - 20} y2={LINE_Y} stroke="#334155" strokeWidth="3" strokeLinecap="round" style={{ pointerEvents: 'none' }} />
        <polygon points={`${W - 22},${LINE_Y - 6} ${W - 8},${LINE_Y} ${W - 22},${LINE_Y + 6}`} fill="#334155" style={{ pointerEvents: 'none' }} />

        {/* Instants */}
        {points.map((p, i) => {
          const revealed = i === 0 || i <= visibleCount;
          return (
            <g key={i} style={{ pointerEvents: 'none' }} opacity={revealed ? 1 : 0.25}>
              <circle cx={xs[i]} cy={LINE_Y} r={5} fill={i === 0 || i === points.length - 1 ? '#d97706' : '#0284c7'} />
              <text x={xs[i]} y={LINE_Y + 24} textAnchor="middle" style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700 }} className="fill-slate-700">
                {formatTime(p)}
              </text>
            </g>
          );
        })}

        {/* Arcs des sauts */}
        {hops.map((hp, i) => {
          if (i >= visibleCount) return null;
          const x1 = xs[i];
          const x2 = xs[i + 1];
          const mid = (x1 + x2) / 2;
          const lift = 44;
          return (
            <g key={i} style={{ pointerEvents: 'none' }}>
              <motion.path
                d={`M ${x1} ${LINE_Y - 8} Q ${mid} ${LINE_Y - lift - 18} ${x2} ${LINE_Y - 8}`}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduced ? 0.05 : 0.4 }}
              />
              <text x={mid} y={LINE_Y - lift - 24} textAnchor="middle" style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 800 }} className="fill-sky-700">
                {hp.label}
              </text>
            </g>
          );
        })}

        {/* Total, une fois tous les sauts posés */}
        {showTotal && allVisible && (
          <g style={{ pointerEvents: 'none' }}>
            <rect x={W / 2 - 78} y={4} width={156} height={26} rx={8} fill="#059669" />
            <text x={W / 2} y={22} textAnchor="middle" className="fill-white" style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 800 }}>
              {formatDuration(fromSeconds(totalMin * 60))}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
