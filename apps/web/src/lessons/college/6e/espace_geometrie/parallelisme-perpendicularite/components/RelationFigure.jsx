import React from 'react';
import { clipToBox } from '../../../../../common/utils/geometry2d';
import {
  toLine, relationOf, RELATIONS, RELATION_LABEL, intersectionOf, footOf, distanceTo, dirOf,
} from './relationsUtils';

/**
 * RelationFigure — le rendu PUR de deux droites et de leur relation.
 *
 * RÈGLE CENTRALE : aucune marque n'est passée en prop. Les chevrons de
 * parallélisme, le carré d'angle droit et le point d'intersection sont TOUS
 * dérivés de `relationOf`. Il est donc impossible de dessiner un angle droit
 * là où les droites ne sont pas perpendiculaires : le dessin ne peut pas
 * mentir sur les mathématiques.
 *
 * Purement visuel ⇒ role="img" légitime (aucun bouton à l'intérieur).
 */
const COLORS = { d1: '#4f46e5', d2: '#0891b2', extra: '#e11d48' };

export default function RelationFigure({
  droites = [],
  points = [],
  box = { xMin: 0, yMin: 0, xMax: 320, yMax: 200 },
  showMarks = true,
  showIntersection = true,
  distanceFrom = null,
  connector = null,
  size,
  ariaLabel,
}) {
  const [d1, d2] = droites;
  const relation = d1 && d2 ? relationOf(d1, d2) : null;
  const inter = d1 && d2 && showIntersection ? intersectionOf(d1, d2) : null;

  /** Trace d'une droite, découpée à la boîte visible. */
  const draw = (line, color, key) => {
    const seg = clipToBox({ kind: 'droite', a: line.p, b: { x: line.p.x + dirOf(line.angleDeg).x * 50, y: line.p.y + dirOf(line.angleDeg).y * 50 } }, box);
    if (!seg) return null;
    return (
      <g key={key}>
        <line
          x1={seg.from.x} y1={seg.from.y} x2={seg.to.x} y2={seg.to.y}
          stroke={color} strokeWidth="3" strokeLinecap="round"
        />
        {line.name && (
          <text
            x={seg.to.x - 14} y={seg.to.y - 8}
            className="font-space" fontSize="13" fontWeight="700" fill={color}
          >
            {line.name}
          </text>
        )}
      </g>
    );
  };

  /** Chevrons « // » sur chaque droite — dessinés SEULEMENT si parallèles. */
  const chevrons = () => {
    if (relation !== RELATIONS.paralleles) return null;
    return droites.slice(0, 2).map((line, i) => {
      const dir = dirOf(line.angleDeg);
      const seg = clipToBox(
        { kind: 'droite', a: line.p, b: { x: line.p.x + dir.x * 50, y: line.p.y + dir.y * 50 } },
        box
      );
      if (!seg) return null;
      const mid = { x: (seg.from.x + seg.to.x) / 2, y: (seg.from.y + seg.to.y) / 2 };
      const n = { x: -dir.y, y: dir.x };
      const s = 6;
      return (
        <g key={`chev${i}`} stroke={i === 0 ? COLORS.d1 : COLORS.d2} strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path
            d={`M ${mid.x - dir.x * s + n.x * s} ${mid.y - dir.y * s + n.y * s}
                L ${mid.x + dir.x * s} ${mid.y + dir.y * s}
                L ${mid.x - dir.x * s - n.x * s} ${mid.y - dir.y * s - n.y * s}`}
          />
        </g>
      );
    });
  };

  /** Carré d'angle droit — dessiné SEULEMENT si perpendiculaires. */
  const rightAngleMark = () => {
    if (relation !== RELATIONS.perpendiculaires || !inter) return null;
    const u = dirOf(d1.angleDeg);
    const v = dirOf(d2.angleDeg);
    const s = 15;
    const p1 = { x: inter.x + u.x * s, y: inter.y + u.y * s };
    const p2 = { x: inter.x + u.x * s + v.x * s, y: inter.y + u.y * s + v.y * s };
    const p3 = { x: inter.x + v.x * s, y: inter.y + v.y * s };
    return (
      <path
        d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`}
        fill="none" stroke="#059669" strokeWidth="2.5"
      />
    );
  };

  const relationText = relation ? `deux droites ${RELATION_LABEL[relation]}` : 'figure géométrique';

  return (
    <svg
      viewBox={`${box.xMin} ${box.yMin} ${box.xMax - box.xMin} ${box.yMax - box.yMin}`}
      className="w-full max-w-[520px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
      style={{ width: size, touchAction: 'manipulation' }}
      role="img"
      aria-label={ariaLabel ?? relationText}
    >
      <g style={{ pointerEvents: 'none' }}>
        {droites.map((l, i) => draw(l, l.color ?? (i === 0 ? COLORS.d1 : i === 1 ? COLORS.d2 : COLORS.extra), `d${i}`))}

        {showMarks && chevrons()}
        {showMarks && rightAngleMark()}

        {/* Point d'intersection : dessiné seulement s'il existe vraiment */}
        {inter && (
          <>
            <circle cx={inter.x} cy={inter.y} r="5" fill="#0f172a" />
            {/* Étiquette placée AU-DESSUS du point : à sa droite, elle
                chevauchait la droite qui file dans cette direction
                (collision constatée en revue visuelle). */}
            <text
              x={inter.x} y={inter.y - 16} textAnchor="middle"
              className="font-mono" fontSize="10" fill="#475569"
            >
              elles se coupent
            </text>
          </>
        )}

        {/* Le plus court chemin : toujours perpendiculaire, par construction */}
        {distanceFrom && d1 && (
          <>
            {(() => {
              const f = footOf(d1, distanceFrom);
              const dd = distanceTo(d1, distanceFrom);
              const u = dirOf(d1.angleDeg);
              const n = { x: -u.y, y: u.x };
              const s = 11;
              return (
                <g>
                  <line
                    x1={distanceFrom.x} y1={distanceFrom.y} x2={f.x} y2={f.y}
                    stroke="#059669" strokeWidth="2.5" strokeDasharray="5 4"
                  />
                  {/* Le carré d'angle droit au pied : signe que c'est LA distance */}
                  <path
                    d={`M ${f.x + u.x * s} ${f.y + u.y * s}
                        L ${f.x + u.x * s - n.x * s * Math.sign(dd || 1)} ${f.y + u.y * s - n.y * s * Math.sign(dd || 1)}
                        L ${f.x - n.x * s * Math.sign(dd || 1)} ${f.y - n.y * s * Math.sign(dd || 1)}`}
                    fill="none" stroke="#059669" strokeWidth="2"
                  />
                  <circle cx={f.x} cy={f.y} r="4" fill="#059669" />
                </g>
              );
            })()}
          </>
        )}

        {/* Connecteur libre (comparaison de trajets) */}
        {connector && (
          <line
            x1={connector.from.x} y1={connector.from.y} x2={connector.to.x} y2={connector.to.y}
            stroke={connector.color ?? '#94a3b8'} strokeWidth="2.5"
            strokeDasharray={connector.dashed ? '5 4' : undefined}
          />
        )}

        {points.map((p) => (
          <g key={p.name}>
            <circle cx={p.x} cy={p.y} r={p.r ?? 5.5} fill={p.color ?? '#0f172a'} stroke="#fff" strokeWidth="2" />
            {p.name && (
              <text x={p.x + 9} y={p.y - 8} className="font-space" fontSize="14" fontWeight="700" fill="#0f172a">
                {p.name}
              </text>
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}
