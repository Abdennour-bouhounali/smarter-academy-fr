import React, { useId } from 'react';
import { motion } from 'framer-motion';

/**
 * LiquidContainer — récipient animé (verre, bouteille, cruche, seau, cube)
 * dont le niveau de liquide est purement proportionnel à `fillPct`
 * (0 → vide, 1 → plein). Le remplissage reste volontairement LINÉAIRE quel
 * que soit le profil du récipient : l'objectif 6e n'est pas de modéliser
 * la physique d'un col étroit, mais de montrer qu'un même récipient peut
 * être plus ou moins rempli, et que des récipients de formes différentes
 * ne se comparent pas « à l'œil ».
 *
 * `graduations` (optionnel) : [{ pct, label }] — trace des repères sur la
 * paroi, pour l'exercice de lecture d'un récipient gradué.
 *
 * `overflowing` (bool) : au-delà du bord, affiche quelques gouttes qui
 * débordent — utilisé pour l'interaction « verser l'un dans l'autre » du
 * Module 01 (si le contenu déborde, c'est que le récipient source
 * contenait plus que le récipient destination).
 */
const SHAPES = {
  glass: 'M35,190 L20,30 L140,30 L125,190 Z',
  bottle: 'M65,8 L95,8 L95,48 L136,48 L136,190 L24,190 L24,48 L65,48 Z',
  jug: 'M15,190 L10,58 L150,58 L145,190 Z',
  bucket: 'M22,190 L14,46 L146,46 L138,190 Z',
  cube: 'M30,190 L30,50 L110,50 L110,190 Z',
};

const VIEW_TOP = { glass: 30, bottle: 8, jug: 58, bucket: 46, cube: 50 };
const VIEW_BOTTOM = 190;

export default function LiquidContainer({
  shape = 'glass',
  fillPct = 0,
  overflowing = false,
  label = null,
  graduations = [],
  color = '#3b82f6',
  height = 220,
  ariaLabel = 'Récipient',
}) {
  const clipId = useId();
  const top = VIEW_TOP[shape] ?? VIEW_TOP.glass;
  const bottom = VIEW_BOTTOM;
  const totalH = bottom - top;
  const pct = Math.max(0, Math.min(1, fillPct));
  const liquidY = bottom - pct * totalH;

  return (
    <div className="flex flex-col items-center gap-1.5" role="img" aria-label={ariaLabel}>
      <svg viewBox="0 0 160 210" style={{ height }} className="select-none overflow-visible">
        <defs>
          <clipPath id={clipId}>
            <path d={SHAPES[shape] ?? SHAPES.glass} />
          </clipPath>
        </defs>

        {/* Contour du récipient */}
        <path d={SHAPES[shape] ?? SHAPES.glass} fill="#f8fafc" stroke="#334155" strokeWidth="3" strokeLinejoin="round" />

        {/* Liquide, clippé à la silhouette */}
        <g clipPath={`url(#${clipId})`}>
          <motion.rect
            x="0"
            width="160"
            height="300"
            initial={false}
            animate={{ y: liquidY }}
            transition={{ type: 'spring', stiffness: 110, damping: 16 }}
            fill={color}
            opacity={0.75}
          />
          <motion.rect
            x="0"
            width="160"
            height="4"
            initial={false}
            animate={{ y: liquidY }}
            transition={{ type: 'spring', stiffness: 110, damping: 16 }}
            fill={color}
            opacity={0.95}
          />
        </g>

        {/* Graduations */}
        {graduations.map((g, i) => {
          const y = bottom - g.pct * totalH;
          return (
            <g key={i}>
              <line x1={18} y1={y} x2={34} y2={y} stroke="#64748b" strokeWidth="2" />
              {g.label && (
                <text x={12} y={y + 4} textAnchor="end" style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }} fill="#475569">
                  {g.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Débordement */}
        {overflowing && (
          <motion.g initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={30 + i * 45}
                r="4"
                fill={color}
                initial={{ cy: top - 6, opacity: 0.9 }}
                animate={{ cy: top + 40, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15, ease: 'easeIn' }}
              />
            ))}
          </motion.g>
        )}
      </svg>
      {label && <div className="font-mono text-sm font-bold text-slate-700 tabular-nums">{label}</div>}
    </div>
  );
}
