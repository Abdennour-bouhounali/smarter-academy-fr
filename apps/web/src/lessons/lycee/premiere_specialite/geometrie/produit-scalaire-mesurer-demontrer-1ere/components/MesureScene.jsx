import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { RANGE, fr, frVec } from './theodoliteUtils';

/**
 * MesureScene — le repère commun aux modules 2 à 5 : des flèches, des points,
 * des segments et des droites, et RIEN d'autre.
 *
 * Comme TheodoliteLab, AUCUN nom n'est posé dans le SVG. Deux points peuvent
 * être à une case l'un de l'autre (le pied d'une hauteur et un sommet, trois
 * points alignés serrés), et le décalage fixe des étiquettes de CoordPlane les
 * ferait se chevaucher. Les noms et les coordonnées vivent dans la LÉGENDE DOM.
 *
 * Le composant ne CALCULE rien : il reçoit des objets déjà construits par le
 * modèle et les dessine. Aucun drapeau de style ne décide qu'une flèche « est »
 * un normal ou qu'un segment « est » une hauteur — le sens reste au module.
 *
 * @param fleches  [{ id, v, from?, color, nom, dashed?, width? }] — v en
 *                 coordonnées d'ÉLÈVE, posée en `from` (l'origine par défaut).
 * @param droites  [{ id, a, b, color, dashed? }] — deux points d'une droite
 *                 tracée en trait fin et COUPÉE AU CADRE.
 * @param triangle { A, B, C } — le contour rempli, facultatif.
 */
export const TONS = {
  u: '#7c3aed',
  v: '#0284c7',
  w: '#d97706',
  normal: '#e11d48',
  droite: '#64748b',
  ok: '#059669',
  fond: '#c7d2fe',
};

const ORIGINE = { x: 0, y: 0 };

export default function MesureScene({
  fleches = [],
  droites = [],
  segments = [],
  points = [],
  triangle = null,
  legende = true,
  unit = 26,
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

  /**
   * Les droites sont tracées comme des CORDES coupées au cadre, calculées ici
   * à partir de deux points. Une droite « prolongée à vue » sortirait du repère
   * et serait rognée par le navigateur au lieu de l'être par les mathématiques.
   */
  const overlay = (toSvg) => (
    <g pointerEvents="none">
      {droites.map((d) => {
        const dir = { x: d.b.x - d.a.x, y: d.b.y - d.a.y };
        const n = Math.hypot(dir.x, dir.y) || 1;
        const ux = dir.x / n;
        const uy = dir.y / n;
        const tMax = (sx, sy) => {
          let tt = Infinity;
          if (Math.abs(sx) > 1e-9) {
            tt = Math.min(tt, sx > 0 ? (RANGE.xMax - d.a.x) / sx : (RANGE.xMin - d.a.x) / sx);
          }
          if (Math.abs(sy) > 1e-9) {
            tt = Math.min(tt, sy > 0 ? (RANGE.yMax - d.a.y) / sy : (RANGE.yMin - d.a.y) / sy);
          }
          return Number.isFinite(tt) ? tt : 0;
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
        polygons={triangle
          ? [{ id: 'tri', points: [triangle.A, triangle.B, triangle.C], fill: TONS.fond, fillOpacity: 0.3, stroke: '#4f46e5', strokeWidth: 2.5 }]
          : []}
        segments={segments.map((s) => ({
          id: s.id, from: s.from, to: s.to,
          color: s.color ?? TONS.droite, width: s.width ?? 2.5, dashed: s.dashed,
        }))}
        arrows={arrows}
        points={points.map((p) => ({ id: p.id, x: p.x, y: p.y, color: p.color ?? '#0f172a' }))}
        overlay={overlay}
        caption={false}
        disabled
        ariaLabel={
          ariaLabel
          ?? [
            ...points.map((p) => `${p.nom ?? p.id} a pour coordonnées ${frVec(p)}`),
            ...fleches.map((f) => `${f.nom} a pour coordonnées ${frVec(f.v)}`),
          ].join('. ')
        }
      />
      {legende && (
        <div className="flex flex-wrap items-center gap-3 text-[13px]">
          {points.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: p.color ?? '#0f172a' }} aria-hidden="true" />
              <strong>{p.nom ?? p.id}</strong> ({fr(p.x)} ; {fr(p.y)})
            </span>
          ))}
          {fleches.map((f) => (
            <span key={f.id} className="inline-flex items-center gap-1.5">
              <span className="inline-block w-4 h-1.5 rounded-full" style={{ background: f.color ?? TONS.u }} aria-hidden="true" />
              <strong>{f.nom}</strong> {frVec(f.v)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
