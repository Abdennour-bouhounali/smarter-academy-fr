import React from 'react';
import { computePythagoreanLeg, roundTenth } from './pythagoreUtils';

/**
 * LadderScene — l'échelle contre le mur, RENDUE DYNAMIQUE.
 *
 * La version pré-kit dessinait une échelle 3-4-5 avec un angle de rotation
 * écrit en dur (53,13°) : changer une donnée cassait silencieusement le
 * dessin. Ici tout est calculé à partir des deux longueurs, et la hauteur
 * atteinte vient de `computePythagoreanLeg` — le dessin ne peut donc pas
 * contredire le calcul demandé à l'élève.
 *
 * Purement visuel (role="img") : les réglages sont des boutons DOM à côté.
 */
const BOX = { w: 300, h: 260 };
const SCALE = 38;          // pixels par mètre
const GROUND_Y = 215;
const WALL_X = 70;

export default function LadderScene({ ladder, distance, reveal = false, ariaLabel }) {
  const height = computePythagoreanLeg(ladder, distance);
  const valid = Number.isFinite(height) && height > 0;

  const foot = { x: WALL_X + distance * SCALE, y: GROUND_Y };
  const top = { x: WALL_X, y: valid ? GROUND_Y - height * SCALE : GROUND_Y };

  /* Les barreaux, répartis le long de l'échelle. */
  const rungs = [];
  if (valid) {
    const n = Math.max(3, Math.round(ladder * 1.6));
    for (let i = 1; i < n; i += 1) {
      const t = i / n;
      const x = foot.x + (top.x - foot.x) * t;
      const y = foot.y + (top.y - foot.y) * t;
      // Perpendiculaire à l'échelle, longueur fixe.
      const dx = top.x - foot.x;
      const dy = top.y - foot.y;
      const len = Math.hypot(dx, dy) || 1;
      const px = (-dy / len) * 6;
      const py = (dx / len) * 6;
      rungs.push(
        <line key={i} x1={x - px} y1={y - py} x2={x + px} y2={y + py}
          stroke="#a16207" strokeWidth="2" strokeLinecap="round" />
      );
    }
  }

  return (
    <svg
      viewBox={`0 0 ${BOX.w} ${BOX.h}`}
      className="w-full max-w-[340px] mx-auto bg-white rounded-xl border-2 border-slate-200"
      role="img"
      aria-label={ariaLabel ?? `Échelle de ${ladder} mètres posée à ${distance} mètres du mur`}
    >
      <g style={{ pointerEvents: 'none' }}>
        {/* Le mur et le sol */}
        <rect x={WALL_X - 26} y={30} width={26} height={GROUND_Y - 30} fill="#cbd5e1" />
        <line x1={0} y1={GROUND_Y} x2={BOX.w} y2={GROUND_Y} stroke="#475569" strokeWidth="3" />
        <line x1={WALL_X} y1={30} x2={WALL_X} y2={GROUND_Y} stroke="#475569" strokeWidth="2.5" />

        {/* La marque d'angle droit, entre le mur et le sol */}
        <path d={`M ${WALL_X + 13} ${GROUND_Y} L ${WALL_X + 13} ${GROUND_Y - 13} L ${WALL_X} ${GROUND_Y - 13}`}
          fill="none" stroke="#dc2626" strokeWidth="2" />

        {valid && (
          <>
            {/* L'échelle */}
            <line x1={foot.x} y1={foot.y} x2={top.x} y2={top.y}
              stroke="#ca8a04" strokeWidth="5" strokeLinecap="round" />
            {rungs}

            {/* Les cotes */}
            <line x1={foot.x} y1={GROUND_Y + 14} x2={WALL_X} y2={GROUND_Y + 14}
              stroke="#0284c7" strokeWidth="2" />
            <text x={(foot.x + WALL_X) / 2} y={GROUND_Y + 30} textAnchor="middle"
              fontSize="12" className="font-mono font-semibold" fill="#0369a1">
              {String(distance).replace('.', ',')} m
            </text>

            <text
              x={(foot.x + top.x) / 2 + 16} y={(foot.y + top.y) / 2 - 6}
              fontSize="12" className="font-mono font-semibold" fill="#a16207"
            >
              {String(ladder).replace('.', ',')} m
            </text>

            <line x1={WALL_X - 12} y1={top.y} x2={WALL_X - 12} y2={GROUND_Y}
              stroke="#16a34a" strokeWidth="2" strokeDasharray={reveal ? undefined : '5 4'} />
            <text x={WALL_X - 18} y={(top.y + GROUND_Y) / 2} textAnchor="end"
              fontSize="12" className="font-mono font-semibold" fill="#15803d">
              {reveal ? `${String(roundTenth(height)).replace('.', ',')} m` : '?'}
            </text>
          </>
        )}

        {!valid && (
          <text x={BOX.w / 2} y={GROUND_Y - 60} textAnchor="middle" fontSize="13"
            className="font-semibold" fill="#dc2626">
            L’échelle est trop courte pour atteindre le mur
          </text>
        )}
      </g>
    </svg>
  );
}
