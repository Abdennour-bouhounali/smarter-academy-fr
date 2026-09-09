import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { RANGE, ORIGINE, fr, frVec } from './scalaireUtils';

/**
 * ScalaireScene — le repère de la leçon, plus des flèches partant d'une même
 * origine, et RIEN d'autre. C'est l'illustration commune aux modules 3, 4 et 5.
 *
 * Comme dans OmbreLab, AUCUN nom n'est posé dans le SVG : deux flèches issues
 * de la même origine peuvent être arbitrairement proches (u et 2u sont même
 * exactement superposées au module 3), et le décalage fixe des étiquettes de
 * CoordPlane les ferait se chevaucher. Les noms et les coordonnées vivent dans
 * la LÉGENDE DOM sous la figure.
 *
 * Le composant ne CALCULE rien : il reçoit des flèches déjà construites par le
 * modèle et les dessine. Aucun drapeau de style ne décide qu'une flèche « est »
 * un normal ou « est » un directeur — c'est le module qui garde le sens.
 *
 * @param fleches [{ id, v, from?, color, nom, dashed?, width? }] — v en
 *                coordonnées d'ÉLÈVE, posée en `from` (l'origine par défaut).
 * @param droites [{ id, a, b, color, dashed? }] — deux points d'une droite à
 *                tracer en trait fin, prolongée au cadre.
 */
export const TONS = {
  u: '#7c3aed',
  v: '#0284c7',
  w: '#d97706',
  somme: '#059669',
  normal: '#e11d48',
  droite: '#64748b',
};

export default function ScalaireScene({
  fleches = [],
  droites = [],
  points = [],
  legende = true,
  unit = 28,
  ariaLabel,
}) {
  const arrows = fleches.map((f) => {
    const from = f.from ?? ORIGINE;
    return {
      id: f.id,
      from,
      to: { x: from.x + f.v.x, y: from.y + f.v.y },
      color: f.color ?? TONS.u,
      dashed: f.dashed,
      width: f.width ?? 3.5,
    };
  });

  // Les droites sont tracées comme des cordes coupées au cadre, calculées ici
  // à partir de deux points : une droite « prolongée à vue » sortirait du
  // repère et serait rognée par le navigateur.
  const overlay = (toSvg) => (
    <g pointerEvents="none">
      {droites.map((d) => {
        const dir = { x: d.b.x - d.a.x, y: d.b.y - d.a.y };
        const n = Math.hypot(dir.x, dir.y) || 1;
        const ux = dir.x / n;
        const uy = dir.y / n;
        // Le paramètre maximal qui garde le point dans le cadre, dans chaque sens.
        const tMax = (sx, sy) => {
          let t = Infinity;
          if (Math.abs(sx) > 1e-9) {
            t = Math.min(t, sx > 0 ? (RANGE.xMax - d.a.x) / sx : (RANGE.xMin - d.a.x) / sx);
          }
          if (Math.abs(sy) > 1e-9) {
            t = Math.min(t, sy > 0 ? (RANGE.yMax - d.a.y) / sy : (RANGE.yMin - d.a.y) / sy);
          }
          return Number.isFinite(t) ? t : 0;
        };
        const tp = tMax(ux, uy);
        const tn = tMax(-ux, -uy);
        const P1 = toSvg(d.a.x + ux * tp, d.a.y + uy * tp);
        const P2 = toSvg(d.a.x - ux * tn, d.a.y - uy * tn);
        return (
          <line
            key={d.id} x1={P1.x} y1={P1.y} x2={P2.x} y2={P2.y}
            stroke={d.color ?? TONS.droite} strokeWidth={2}
            strokeDasharray={d.dashed ? '6 5' : undefined}
          />
        );
      })}
    </g>
  );

  return (
    <div className="space-y-2">
      <CoordPlane
        range={RANGE}
        unit={unit}
        xStep={1}
        yStep={1}
        labelEvery={2}
        arrows={arrows}
        points={[
          { id: 'O', x: ORIGINE.x, y: ORIGINE.y, color: '#0f172a' },
          ...points.map((p) => ({ id: p.id, x: p.x, y: p.y, color: p.color ?? '#0f172a' })),
        ]}
        overlay={overlay}
        caption={false}
        disabled
        ariaLabel={
          ariaLabel
          ?? fleches.map((f) => `${f.nom} a pour coordonnées ${frVec(f.v)}`).join('. ')
        }
      />
      {legende && (
        <div className="flex flex-wrap items-center gap-3 text-[13px]">
          {fleches.map((f) => (
            <span key={f.id} className="inline-flex items-center gap-1.5">
              <span className="inline-block w-4 h-1.5 rounded-full" style={{ background: f.color ?? TONS.u }} aria-hidden="true" />
              <strong>{f.nom}</strong> {frVec(f.v)}
            </span>
          ))}
          {points.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: p.color ?? '#0f172a' }} aria-hidden="true" />
              <strong>{p.nom ?? p.id}</strong> ({fr(p.x)} ; {fr(p.y)})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
