import React, { useCallback, useMemo, useRef } from 'react';
import { placeLabels, pointObstacle, segmentObstacles } from './labelLayout';

/**
 * GeoScene — la surface de dessin partagée de la famille « Transformations,
 * angles & triangles » (5e).
 *
 * Elle existe pour tenir DEUX invariants que trois leçons ne peuvent pas
 * tenir chacune de leur côté sans diverger :
 *
 *  1. AUCUNE COLLISION, pour tout état atteignable. Les noms de points ne
 *     sont jamais posés à un décalage fixe : on déclare les obstacles (les
 *     points, les segments, les arcs) et `placeLabels` cherche une place
 *     libre. Un élève qui traîne un sommet jusque dans un coin ne peut donc
 *     pas fabriquer un « A » collé à un trait — c'est ce que mesure
 *     scripts/audit-svg-collisions.mjs.
 *
 *  2. UNE FIGURE GRANDE. Le viewBox est fixé par l'auteur et le SVG occupe
 *     toute la largeur disponible : la figure grandit avec l'écran au lieu
 *     d'être une vignette centrée. Les épaisseurs sont en unités de viewBox,
 *     donc l'ensemble reste net à toute taille.
 *
 * Le repère est celui du SVG (y vers le bas). Les leçons travaillent
 * directement dans ce repère : à ce niveau, aucun axe n'est affiché, et un
 * « y qui descend » ne se voit pas — inutile d'imposer une conversion qui ne
 * ferait qu'ajouter des occasions de se tromper.
 */
export default function GeoScene({
  width = 720,
  height = 460,
  children,
  labels = [],
  obstacles = [],
  ariaLabel,
  onPointerMove,
  onPointerUp,
  className = '',
  labelSize = 19,
  margin = 6,
}) {
  const svgRef = useRef(null);

  /** Coordonnées viewBox d'un évènement pointeur — indépendantes du zoom. */
  const toLocal = useCallback((evt) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: ((evt.clientX - rect.left) / rect.width) * width,
      y: ((evt.clientY - rect.top) / rect.height) * height,
    };
  }, [width, height]);

  const frame = useMemo(
    () => ({ x: margin, y: margin, w: width - 2 * margin, h: height - 2 * margin }),
    [width, height, margin],
  );

  const placed = useMemo(
    () => placeLabels(
      labels.map((l) => ({ size: labelSize, pad: 2, ...l })),
      obstacles,
      frame,
    ),
    [labels, obstacles, frame, labelSize],
  );

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-auto touch-none select-none ${className}`}
      role="img"
      aria-label={ariaLabel}
      onPointerMove={onPointerMove ? (e) => onPointerMove(toLocal(e), e) : undefined}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {children}
      {placed.map((l) => (
        <text
          key={l.id}
          x={l.x}
          y={l.y}
          fontSize={l.size}
          fontWeight={800}
          fill={labels.find((o) => o.id === l.id)?.color ?? '#0f172a'}
          /* La « plaque » : le halo assume une superposition résiduelle et la
             garde lisible. L'audit ne compte donc pas ces textes. */
          stroke="#ffffff"
          strokeWidth={4}
          paintOrder="stroke"
          style={{ pointerEvents: 'none' }}
        >
          {l.text}
        </text>
      ))}
    </svg>
  );
}

/* ── Primitives de figure ──────────────────────────────────────────────── */

/** Un point manipulable : grande cible tactile, anneau de focus sur la pastille. */
export function Handle({ p, color = '#7c3aed', r = 11, onPointerDown, label, dragging }) {
  return (
    <g
      onPointerDown={onPointerDown}
      style={{ cursor: onPointerDown ? 'grab' : 'default' }}
      tabIndex={onPointerDown ? 0 : undefined}
      role={onPointerDown ? 'button' : undefined}
      aria-label={label}
      /* Le contour noir par défaut du navigateur déborde de la poignée et
         croise la figure : on le tue, et l'anneau ci-dessous le remplace. */
      className={onPointerDown ? 'outline-none focus-visible:[&>circle:last-of-type]:opacity-100' : ''}
    >
      {onPointerDown && (
        <circle cx={p.x} cy={p.y} r={r + 13} fill="transparent" data-visual-role="decor" />
      )}
      <circle cx={p.x} cy={p.y} r={r} fill={color} stroke="#ffffff" strokeWidth={3} />
      {dragging && (
        <circle cx={p.x} cy={p.y} r={r + 6} fill="none" stroke={color} strokeWidth={2} opacity={0.45} data-visual-role="decor" />
      )}
      <circle
        cx={p.x} cy={p.y} r={r + 5} fill="none" stroke={color} strokeWidth={3}
        opacity={0} data-visual-role="decor"
      />
    </g>
  );
}

/** Un point fixe de la figure. */
export function Dot({ p, color = '#0f172a', r = 7 }) {
  return <circle cx={p.x} cy={p.y} r={r} fill={color} stroke="#ffffff" strokeWidth={2.5} />;
}

/** Un segment. `dash` pour une construction, `arrow` pour une droite prolongée. */
export function Seg({ a, b, color = '#0f172a', w = 3, dash, opacity = 1 }) {
  return (
    <line
      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
      stroke={color} strokeWidth={w} strokeLinecap="round"
      strokeDasharray={dash} opacity={opacity}
    />
  );
}

/** Un polygone plein et bordé. */
export function Poly({ pts, fill = '#7c3aed', stroke = '#6d28d9', w = 3, fillOpacity = 0.13 }) {
  return (
    <polygon
      points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
      fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth={w} strokeLinejoin="round"
    />
  );
}

/* ── Obstacles, pour que les étiquettes s'écartent d'elles-mêmes ─────────── */

export const dotObstacles = (pts, r = 14) => pts.map((p) => pointObstacle(p, r));
export const segObstacles = (a, b) => segmentObstacles(a, b, 9);
export const polyObstacles = (pts) =>
  pts.flatMap((p, i) => segObstacles(p, pts[(i + 1) % pts.length]));
