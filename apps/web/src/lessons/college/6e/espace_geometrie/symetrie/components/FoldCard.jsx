import React from 'react';
import { useReducedMotion } from 'framer-motion';
import { reflectPoints, isSymmetryAxis } from './symetrieUtils';

/**
 * FoldCard — le pliage, montré comme un pliage.
 *
 * ACTION          l'élève appuie sur « Plier ».
 * TRANSFORMATION  la moitié droite bascule sur la gauche (une rotation CSS
 *                 autour de l'axe), et l'on voit si les deux moitiés se
 *                 superposent exactement.
 * SENS MATH.      la symétrie axiale EST un pliage : deux moitiés qui
 *                 coïncident, pas deux moitiés « qui se ressemblent ».
 * FEEDBACK        superposition parfaite ⇒ vert ; débordement ⇒ la partie qui
 *                 dépasse reste visible en rose.
 *
 * Le verdict vient de `isSymmetryAxis`, jamais d'un drapeau posé à la main :
 * la carte ne peut pas annoncer « ça se superpose » pour une figure qui ne
 * se superpose pas.
 */
export default function FoldCard({
  points,
  axis,
  folded,
  box = { xMin: 0, yMin: 0, xMax: 240, yMax: 180 },
  label,
}) {
  const reduced = useReducedMotion();
  const symetrique = isSymmetryAxis(axis, points, 5);
  const image = reflectPoints(axis, points);

  const path = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-mono text-center text-slate-500">{label}</p>}
      <svg
        viewBox={`${box.xMin} ${box.yMin} ${box.xMax - box.xMin} ${box.yMax - box.yMin}`}
        className="w-full max-w-[300px] mx-auto bg-white rounded-xl border-2 border-slate-200"
        role="img"
        aria-label={
          folded
            ? symetrique
              ? `${label ?? 'Figure'} pliée : les deux moitiés se superposent exactement`
              : `${label ?? 'Figure'} pliée : les deux moitiés ne se superposent pas`
            : `${label ?? 'Figure'} à plier`
        }
      >
        <g style={{ pointerEvents: 'none' }}>
          {/* La figure d'origine */}
          <path
            d={path(points)}
            fill={folded && !symetrique ? '#ffe4e6' : '#eef2ff'}
            stroke={folded && !symetrique ? '#e11d48' : '#4f46e5'}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Le rabat : l'image, dessinée par-dessus quand on plie */}
          {folded && (
            <path
              d={path(image)}
              fill={symetrique ? '#d1fae5' : '#fecdd3'}
              fillOpacity="0.75"
              stroke={symetrique ? '#059669' : '#e11d48'}
              strokeWidth="2.5"
              strokeLinejoin="round"
              style={{
                transition: reduced ? 'none' : 'opacity 320ms ease-out',
              }}
            />
          )}

          {/* Le pli */}
          <line
            x1={axis.p.x - axis.d.x * 400} y1={axis.p.y - axis.d.y * 400}
            x2={axis.p.x + axis.d.x * 400} y2={axis.p.y + axis.d.y * 400}
            stroke="#6366f1" strokeWidth="2.5" strokeDasharray="8 5"
          />
        </g>
      </svg>

      {folded && (
        <p
          className={`text-center text-xs font-semibold ${symetrique ? 'text-emerald-700' : 'text-rose-700'}`}
          aria-live="polite"
        >
          {symetrique
            ? '✓ Les deux moitiés se superposent exactement.'
            : '✗ Ça dépasse : les deux moitiés ne coïncident pas.'}
        </p>
      )}
    </div>
  );
}
