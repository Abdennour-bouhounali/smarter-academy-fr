import React from 'react';
import { angleOf, angleAt, deg, fr } from './geo5e';

/**
 * AngleArc — l'arc qui marque l'angle ABC, et la valeur qui l'accompagne.
 *
 * L'arc est CALCULÉ à partir des trois points, comme la valeur affichée : on
 * ne peut donc pas dessiner un arc de 40° en écrivant « 60° » à côté. C'est
 * l'invariant visuel de la famille, appliqué au seul objet qui le viole
 * facilement (INTERACTION_PEDAGOGY — un schéma ne contredit jamais la leçon).
 *
 * L'étiquette est placée sur la BISSECTRICE, à une distance qui croît quand
 * l'angle se referme : c'est là qu'elle ne touche ni l'un ni l'autre côté.
 */
export default function AngleArc({
  a, b, c,                 // l'angle de sommet b, entre les demi-droites [ba) et [bc)
  r = 44,
  color = '#7c3aed',
  fill = true,
  showValue = true,
  value,                   // forcer le texte (sinon : la mesure, en degrés)
  labelOffset = 26,
  width = 3.5,
  dash,
}) {
  const measure = angleAt(a, b, c);
  if (!Number.isFinite(measure) || measure < 0.2) return null;

  const a0 = angleOf(b, a);
  const a1 = angleOf(b, c);

  // Le sens de parcours qui balaie l'angle GÉOMÉTRIQUE (le petit côté) : on
  // ne marque jamais l'angle rentrant par mégarde.
  let delta = a1 - a0;
  while (delta <= -Math.PI) delta += 2 * Math.PI;
  while (delta > Math.PI) delta -= 2 * Math.PI;

  const p0 = { x: b.x + r * Math.cos(a0), y: b.y + r * Math.sin(a0) };
  const p1 = { x: b.x + r * Math.cos(a0 + delta), y: b.y + r * Math.sin(a0 + delta) };
  const sweep = delta > 0 ? 1 : 0;

  const bisect = a0 + delta / 2;
  // Un angle aigu resserre les deux côtés : l'étiquette doit s'éloigner pour
  // ne pas les toucher. Un angle obtus, au contraire, laisse de la place.
  const spread = Math.max(0.35, Math.sin(Math.abs(delta) / 2));
  const lr = r + labelOffset / spread ** 0.55;
  const lx = b.x + lr * Math.cos(bisect);
  const ly = b.y + lr * Math.sin(bisect);

  // L'angle droit se marque par un carré — la convention que l'élève connaît.
  const isRight = Math.abs(measure - 90) < 0.6;

  return (
    <g>
      {isRight ? (
        <path
          d={squarePath(b, a0, delta, r * 0.62)}
          fill={fill ? color : 'none'}
          fillOpacity={fill ? 0.16 : 0}
          stroke={color}
          strokeWidth={width}
          strokeDasharray={dash}
          strokeLinejoin="round"
        />
      ) : (
        <>
          {fill && (
            <path
              d={`M ${b.x} ${b.y} L ${p0.x} ${p0.y} A ${r} ${r} 0 0 ${sweep} ${p1.x} ${p1.y} Z`}
              fill={color}
              fillOpacity={0.16}
              stroke="none"
            />
          )}
          <path
            d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 ${sweep} ${p1.x} ${p1.y}`}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeDasharray={dash}
            strokeLinecap="round"
          />
        </>
      )}
      {showValue && (
        <text
          x={lx}
          y={ly}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={800}
          fill={color}
          stroke="#ffffff"
          strokeWidth={4}
          paintOrder="stroke"
          style={{ pointerEvents: 'none' }}
        >
          {value ?? `${fr(measure, 0)}°`}
        </text>
      )}
    </g>
  );
}

/** Le petit carré de l'angle droit, orienté comme l'angle. */
function squarePath(b, a0, delta, s) {
  const u = { x: Math.cos(a0), y: Math.sin(a0) };
  const v = { x: Math.cos(a0 + delta), y: Math.sin(a0 + delta) };
  return [
    `M ${b.x + s * u.x} ${b.y + s * u.y}`,
    `L ${b.x + s * (u.x + v.x)} ${b.y + s * (u.y + v.y)}`,
    `L ${b.x + s * v.x} ${b.y + s * v.y}`,
  ].join(' ');
}

/** Le marqueur « ces deux segments ont la même longueur » (traits obliques). */
export function TickMarks({ a, b, n = 1, color = '#0f172a', size = 9, gap = 7 }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const ux = Math.cos(ang);
  const uy = Math.sin(ang);
  // Le trait est oblique (45°) : il ne se confond jamais avec le segment
  // qu'il marque, ni avec une perpendiculaire de la figure.
  const tx = Math.cos(ang + Math.PI / 4) * size;
  const ty = Math.sin(ang + Math.PI / 4) * size;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const off = (i - (n - 1) / 2) * gap;
        const cx = mx + ux * off;
        const cy = my + uy * off;
        return (
          <line
            key={i}
            x1={cx - tx} y1={cy - ty} x2={cx + tx} y2={cy + ty}
            stroke={color} strokeWidth={3} strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

/** Le marqueur « ces deux droites sont parallèles » (chevrons). */
export function ParallelMark({ a, b, n = 1, color = '#0f172a', t = 0.5, size = 8 }) {
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const cx = a.x + (b.x - a.x) * t;
  const cy = a.y + (b.y - a.y) * t;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const off = (i - (n - 1) / 2) * 9;
        const px = cx + Math.cos(ang) * off;
        const py = cy + Math.sin(ang) * off;
        const w1 = { x: px + Math.cos(ang + 2.3) * size, y: py + Math.sin(ang + 2.3) * size };
        const w2 = { x: px + Math.cos(ang - 2.3) * size, y: py + Math.sin(ang - 2.3) * size };
        return (
          <path
            key={i}
            d={`M ${w1.x} ${w1.y} L ${px} ${py} L ${w2.x} ${w2.y}`}
            fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
          />
        );
      })}
    </g>
  );
}

export { deg };
