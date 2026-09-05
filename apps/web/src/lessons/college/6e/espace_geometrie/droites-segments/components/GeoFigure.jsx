import React from 'react';
import { clipToBox, endpointsOf, notationOf } from './droitesUtils';

/**
 * GeoFigure — le rendu PUR d'une figure faite de droites, segments et
 * demi-droites. Aucune interaction : c'est donc légitimement un role="img"
 * (playbook §10.4 — un role="img" ne masque ici aucun bouton réel).
 *
 * RÈGLE CENTRALE : rien du dessin n'est passé en prop de style. Les flèches,
 * les points d'extrémité et la notation sont TOUS calculés à partir du kind
 * via clipToBox / endpointsOf / notationOf. Il est donc impossible de
 * dessiner un segment avec des flèches, ou une droite avec des extrémités —
 * le dessin ne peut pas contredire les mathématiques.
 */
const COLORS = ['#4f46e5', '#0891b2', '#e11d48', '#7c3aed', '#059669'];

export default function GeoFigure({
  objects = [],
  points = [],
  box = { xMin: 0, yMin: 0, xMax: 320, yMax: 200 },
  showNotation = false,
  showEndpoints = true,
  showNames = true,
  highlight = null,
  size,
  ariaLabel,
}) {
  const w = box.xMax - box.xMin;
  const h = box.yMax - box.yMin;
  const ARROW = 9;

  /** Petite flèche au bout ouvert : le signe visuel de « ça continue ». */
  const arrow = (from, to, key) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    const tip = { x: to.x, y: to.y };
    const p1 = { x: to.x - ux * ARROW + nx * (ARROW * 0.5), y: to.y - uy * ARROW + ny * (ARROW * 0.5) };
    const p2 = { x: to.x - ux * ARROW - nx * (ARROW * 0.5), y: to.y - uy * ARROW - ny * (ARROW * 0.5) };
    return <polygon key={key} points={`${tip.x},${tip.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill="currentColor" />;
  };

  return (
    <svg
      viewBox={`${box.xMin} ${box.yMin} ${w} ${h}`}
      className="w-full max-w-[520px] mx-auto select-none"
      style={{ width: size, touchAction: 'manipulation' }}
      role="img"
      aria-label={ariaLabel ?? 'Figure géométrique'}
    >
      <g style={{ pointerEvents: 'none' }}>
        {objects.map((o, i) => {
          const clipped = clipToBox(o, box);
          if (!clipped) return null;
          const color = o.color ?? COLORS[i % COLORS.length];
          const dim = highlight && o.name && highlight !== o.name;
          return (
            <g key={o.name ?? `obj${i}`} color={color} opacity={dim ? 0.25 : 1}>
              <line
                x1={clipped.from.x} y1={clipped.from.y} x2={clipped.to.x} y2={clipped.to.y}
                stroke={color} strokeWidth={highlight === o.name ? 4 : 3} strokeLinecap="round"
              />
              {/* Flèches UNIQUEMENT aux bouts ouverts — dérivées du kind. */}
              {clipped.openFrom && arrow(clipped.to, clipped.from, `af${i}`)}
              {clipped.openTo && arrow(clipped.from, clipped.to, `at${i}`)}

              {/* Points d'extrémité : autant que endpointsOf en renvoie. */}
              {showEndpoints &&
                endpointsOf(o).map((p, k) => (
                  <circle key={`ep${i}-${k}`} cx={p.x} cy={p.y} r="5" fill={color} stroke="#fff" strokeWidth="2" />
                ))}

              {showNotation && (
                <text
                  x={(clipped.from.x + clipped.to.x) / 2}
                  y={(clipped.from.y + clipped.to.y) / 2 - 10}
                  textAnchor="middle" className="font-mono" fontSize="13" fontWeight="700" fill={color}
                >
                  {notationOf(o, o.nameA ?? 'A', o.nameB ?? 'B')}
                </text>
              )}
            </g>
          );
        })}

        {/* Points nommés libres (M, N…) posés sur la figure */}
        {points.map((p) => (
          <g key={p.name}>
            <circle cx={p.x} cy={p.y} r={p.r ?? 5} fill={p.color ?? '#0f172a'} stroke="#fff" strokeWidth="1.5" />
            {showNames && p.name && (
              <text
                x={p.x + 9} y={p.y - 8} className="font-space" fontSize="14" fontWeight="700" fill="#0f172a"
              >
                {p.name}
              </text>
            )}
          </g>
        ))}

        {/* Noms des points définissants de chaque objet */}
        {showNames &&
          objects.flatMap((o, i) =>
            [
              o.nameA ? { p: o.a, n: o.nameA } : null,
              o.nameB ? { p: o.b, n: o.nameB } : null,
            ]
              .filter(Boolean)
              .map((e, k) => (
                <text
                  key={`nm${i}-${k}`}
                  x={e.p.x + 9} y={e.p.y - 8}
                  className="font-space" fontSize="14" fontWeight="700" fill="#0f172a"
                >
                  {e.n}
                </text>
              ))
          )}
      </g>
    </svg>
  );
}
