import React from 'react';
import { dist } from './constructionsUtils';

/**
 * CompasTool — le report d'une longueur, montré comme un écartement.
 *
 * ACTION          l'élève règle l'écartement, puis pointe le compas ailleurs.
 * TRANSFORMATION  l'arc tracé garde EXACTEMENT le même rayon.
 * SENS MATH.      le compas ne mesure pas : il conserve. C'est ce qui permet
 *                 de reporter une longueur qu'on n'a jamais lue.
 * FEEDBACK        le rayon affiché est le même des deux côtés — visible.
 *
 * Purement visuel (role="img") : les réglages sont des boutons DOM à côté.
 */
export default function CompasTool({
  centre,
  rayon,
  reference = null,
  cible = null,
  box = { w: 320, h: 200 },
  ariaLabel,
}) {
  return (
    <svg
      viewBox={`0 0 ${box.w} ${box.h}`}
      className="w-full max-w-[460px] mx-auto bg-white rounded-xl border-2 border-slate-200"
      role="img"
      aria-label={ariaLabel ?? `Compas d’écartement ${Math.round(rayon)}`}
    >
      <g style={{ pointerEvents: 'none' }}>
        {/* Le segment de référence, dont on reporte la longueur */}
        {reference && (
          <g>
            <line
              x1={reference.a.x} y1={reference.a.y} x2={reference.b.x} y2={reference.b.y}
              stroke="#4f46e5" strokeWidth="3" strokeLinecap="round"
            />
            <circle cx={reference.a.x} cy={reference.a.y} r="4.5" fill="#4f46e5" />
            <circle cx={reference.b.x} cy={reference.b.y} r="4.5" fill="#4f46e5" />
            <text
              x={(reference.a.x + reference.b.x) / 2} y={reference.a.y - 12}
              textAnchor="middle" className="font-mono" fontSize="11" fill="#4338ca"
            >
              {Math.round(dist(reference.a, reference.b))}
            </text>
          </g>
        )}

        {/* L'arc tracé au compas — même rayon, par construction */}
        <circle
          cx={centre.x} cy={centre.y} r={rayon}
          fill="none" stroke="#7c3aed" strokeWidth="2" strokeDasharray="6 4"
        />
        <circle cx={centre.x} cy={centre.y} r="4.5" fill="#7c3aed" />
        <line
          x1={centre.x} y1={centre.y} x2={centre.x + rayon} y2={centre.y}
          stroke="#7c3aed" strokeWidth="2"
        />
        <text
          x={centre.x + rayon / 2} y={centre.y - 8}
          textAnchor="middle" className="font-mono" fontSize="11" fill="#6d28d9"
        >
          {Math.round(rayon)}
        </text>

        {/* Le point cible atteint par le report */}
        {cible && (
          <g>
            <circle cx={cible.x} cy={cible.y} r="6" fill="#059669" stroke="#fff" strokeWidth="2" />
            <text x={cible.x + 9} y={cible.y - 8} className="font-space" fontSize="12" fontWeight="700" fill="#047857">
              C
            </text>
          </g>
        )}
      </g>
    </svg>
  );
}
