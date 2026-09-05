import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { formatDec } from '@smarter-academy/core';
import { barsGeometry, CHART, totalOf } from './probaUtils';

/**
 * CountBars — n barres d'effectifs (6 faces, 11 sommes, 3 couleurs…).
 *
 * Purement visuel (role="img") : les effectifs appartiennent au module, la
 * géométrie est dérivée par `barsGeometry` à chaque rendu. Le repère
 * théorique (`theory`, une probabilité par barre) n'est dessiné que s'il est
 * passé — c'est le module qui décide QUAND le modèle apparaît.
 *
 * SÉCURITÉ D'AFFICHAGE : l'échelle contient toujours la barre et le repère
 * les plus hauts ; une seule étiquette d'effectif par colonne, avec halo ;
 * toute lecture longue reste dans le DOM du composant appelant.
 */
export default function CountBars({
  counts,
  labels,                   // une étiquette courte par barre (texte ou nombre)
  theory = null,            // [p0…pn] : repère théorique par barre
  highlight = () => false,  // (index) => bool — barres de l'événement / du pari
  accent = () => false,     // (index) => bool — barre alourdie (ambre)
  renderIcon = null,        // (index, cx) => SVG node sous la ligne de base
  ariaLabel,
  reading,
  tone = '#818cf8',
}) {
  const reduce = useReducedMotion();
  const g = CHART;
  const { bars } = barsGeometry(counts, theory);
  const total = totalOf(counts);
  const text = reading ?? `Effectifs : ${counts.map((c, i) => `${labels[i]} → ${formatDec(c)}`).join(', ')} ; total ${formatDec(total)}`;

  return (
    <svg viewBox={`0 0 ${g.W} ${g.H}`} className="w-full max-w-[640px] mx-auto select-none block"
      role="img" aria-label={ariaLabel ? `${ariaLabel} — ${text}` : text}>
      <line x1="8" y1={g.BASE} x2={g.W - 8} y2={g.BASE} stroke="#0f172a" strokeWidth="2" />
      {bars.map((b) => {
        const fill = accent(b.index) ? '#f59e0b' : highlight(b.index) ? '#4f46e5' : tone;
        return (
          <g key={b.index}>
            <motion.rect
              x={b.x} width={b.barW} rx="4" fill={fill}
              initial={false}
              animate={{ y: b.y, height: b.h }}
              transition={{ duration: reduce ? 0 : 0.5, ease: 'easeOut' }}
            />
            {b.tick !== null && (
              <line x1={b.cx - b.barW / 2 - 8} y1={b.tick} x2={b.cx + b.barW / 2 + 8} y2={b.tick}
                stroke="#d97706" strokeWidth="2.5" strokeDasharray="6 4" />
            )}
            <text x={b.cx} y={b.labelY} textAnchor="middle" fontSize="12"
              className="font-mono font-bold tabular-nums" fill="#1e293b"
              stroke="#ffffff" strokeWidth="3" paintOrder="stroke">
              {b.label}
            </text>
            {renderIcon ? renderIcon(b.index, b.cx) : (
              <text x={b.cx} y={g.FACE_Y + 16} textAnchor="middle" fontSize="13"
                className="font-mono font-bold" fill="#334155">{labels[b.index]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
