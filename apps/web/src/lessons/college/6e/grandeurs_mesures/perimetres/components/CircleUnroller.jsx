import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * CircleUnroller — la roue qui déroule son périmètre sur le sol.
 *
 * L'élève tape « Faire rouler » : la roue avance d'UN diamètre et tamponne
 * un ruban-copie du diamètre sur la ligne du sol. Après 3 roulés, le tour
 * n'est pas fini ; le 4ᵉ le termine avec un petit reste (~0,14 D). C'est la
 * découverte de π par le geste : « 3 diamètres et un petit peu ».
 *
 * Tap-first : le bouton intégré est LA commande (grand, focusable). Aucune
 * précision de glisser exigée. Tous les rubans/étiquettes du sol sont en
 * pointerEvents:'none'. Contrôlé : `step` (0..4) appartient au module.
 */

const LEFTOVER = 0.14; // le « petit peu » ≈ π − 3

export default function CircleUnroller({
  diameter = 72,
  step = 0,
  onAdvance,
  showRibbons = true,
  showLeftover = false,
  labels = true,
  size = 340,
  disabled = false,
}) {
  const reduced = useReducedMotion();
  const D = diameter;
  const r = D / 2;
  const groundY = 150;
  const startX = 30;
  // Position du centre de la roue : elle avance de D par étape entière,
  // puis de LEFTOVER × D au dernier pas.
  const advance = step <= 3 ? step * D : 3 * D + LEFTOVER * D;
  const wheelCx = startX + r + advance;
  // Rotation cohérente avec la distance parcourue : un tour complet (360°)
  // correspond à π × D de sol ; ici on fait rouler par diamètres, donc
  // 360° × (distance / (π × D)).
  const rotationDeg = (advance / (Math.PI * D)) * 360;

  const ribbons = [];
  const fullRibbons = Math.min(step, 3);
  for (let i = 0; i < fullRibbons; i += 1) {
    ribbons.push({ x: startX + i * D, w: D, label: String(i + 1), leftover: false });
  }
  if (step >= 4) {
    ribbons.push({ x: startX + 3 * D, w: LEFTOVER * D, label: '≈ 0,14 × D', leftover: true });
  }

  return (
    <div className="w-full space-y-3">
      <svg viewBox={`0 0 ${size} 190`} className="w-full select-none" role="img" aria-label="Roue qui déroule son périmètre sur le sol">
        {/* Sol */}
        <line x1={10} y1={groundY} x2={size - 10} y2={groundY} stroke="#94a3b8" strokeWidth="2" style={{ pointerEvents: 'none' }} />

        {/* Rubans-diamètres tamponnés */}
        {showRibbons && ribbons.map((rb, i) => (
          <g key={i} style={{ pointerEvents: 'none' }}>
            <motion.rect
              x={rb.x}
              y={groundY + 6}
              height={10}
              rx={3}
              fill={rb.leftover ? '#f59e0b' : '#ef4444'}
              opacity={rb.leftover && !showLeftover ? 0.45 : 0.85}
              initial={{ width: 0 }}
              animate={{ width: rb.w }}
              transition={{ duration: reduced ? 0.05 : 0.3 }}
            />
            {labels && (
              // Le ruban-reste est étroit : son étiquette descend d'une ligne
              // pour ne pas chevaucher le « 3 » du ruban voisin.
              <text
                x={rb.leftover ? rb.x + rb.w : rb.x + rb.w / 2}
                y={rb.leftover ? groundY + 50 : groundY + 32}
                textAnchor={rb.leftover ? 'end' : 'middle'}
                style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}
                className={rb.leftover ? 'fill-amber-600' : 'fill-red-600'}
              >
                {rb.label}
              </text>
            )}
          </g>
        ))}

        {/* Roue : rotation et translation synchronisées */}
        <motion.g
          animate={{ x: wheelCx, rotate: rotationDeg }}
          initial={false}
          transition={{ duration: reduced ? 0.1 : 0.7, ease: 'easeInOut' }}
          style={{ y: groundY - r, transformOrigin: '0px 0px', pointerEvents: 'none' }}
        >
          <circle cx={0} cy={0} r={r} fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" />
          {/* Diamètre peint en rouge sur la roue */}
          <line x1={-r} y1={0} x2={r} y2={0} stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
          <circle cx={0} cy={0} r={3.5} fill="#0284c7" />
          {/* Point-témoin sur la jante pour suivre la rotation */}
          <circle cx={0} cy={r - 4} r={4} fill="#0284c7" />
        </motion.g>

        {labels && step === 0 && (
          <text x={startX + r} y={groundY - D - 14} textAnchor="middle" style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, pointerEvents: 'none' }} className="fill-red-600">
            D
          </text>
        )}
      </svg>

      <div className="text-center">
        <button
          type="button"
          disabled={disabled || step >= 4}
          onClick={() => onAdvance?.()}
          className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-500 disabled:opacity-40 disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          {step >= 4 ? 'Tour complet !' : step === 3 ? 'Finir le tour' : 'Faire rouler ↻'}
        </button>
      </div>
    </div>
  );
}
