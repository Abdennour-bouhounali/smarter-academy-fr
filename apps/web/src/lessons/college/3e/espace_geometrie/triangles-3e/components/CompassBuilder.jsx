import React from 'react';
import { circleCircleIntersections } from '../../../../../common/utils/geometry2d';
import { triangleInequality, VERTEX_NAMES } from './triangleUtils';

/**
 * CompassBuilder — construire un triangle au compas, comme sur le papier.
 *
 * ACTION            l'élève règle les trois longueurs (réglages − / +).
 * CHANGEMENT        les deux arcs de cercle changent de rayon.
 * OBSERVATION       pour certains triplets, les arcs ne se rencontrent JAMAIS.
 * SENS MATHÉMATIQUE l'inégalité triangulaire n'est pas une règle arbitraire :
 *                   c'est la condition pour que les deux arcs se croisent.
 * FORMALISATION     « le plus grand côté doit être plus court que la somme des
 *                   deux autres » est énoncé APRÈS l'avoir vu échouer.
 *
 * Le sommet C est CALCULÉ par `circleCircleIntersections` : impossible de
 * dessiner un triangle qui n'existe pas.
 */
const SCALE = 26;      // pixels par unité de longueur
const ORIGIN = { x: 42, y: 168 };
// Le cadre doit contenir les DEUX arcs entiers : leur rayon peut atteindre
// 10 unités (260 px), et ils descendent sous la ligne [AB].
const BOX = { w: 340, h: 250 };

export default function CompassBuilder({
  sides,               // { a, b, c } — a = BC, b = AC, c = AB
  showArcs = true,
  ariaLabel,
}) {
  const { a, b, c } = sides;
  const A = ORIGIN;
  const B = { x: ORIGIN.x + c * SCALE, y: ORIGIN.y };
  const verdict = triangleInequality(a, b, c);
  const inter = circleCircleIntersections(A, b * SCALE, B, a * SCALE);
  const C = inter.length ? (inter[0].y <= inter[1]?.y ? inter[0] : inter[1]) : null;

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${BOX.w} ${BOX.h}`}
        className="w-full max-w-[400px] mx-auto bg-white rounded-xl border-2 border-slate-200"
        role="img"
        aria-label={ariaLabel ?? (verdict.ok
          ? `Triangle de côtés ${a}, ${b} et ${c} construit`
          : `Les deux arcs de rayons ${b} et ${a} ne se rencontrent pas`)}
      >
        <g style={{ pointerEvents: 'none' }}>
          {/* Les arcs du compas, tracés depuis A et depuis B */}
          {showArcs && (
            <>
              <circle cx={A.x} cy={A.y} r={b * SCALE} fill="none"
                stroke="#0284c7" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.75" />
              <circle cx={B.x} cy={B.y} r={a * SCALE} fill="none"
                stroke="#16a34a" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.75" />
            </>
          )}

          {/* Le triangle, seulement s'il existe */}
          {C && (
            <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
              fill="#eef2ff" fillOpacity="0.8" stroke="#4338ca" strokeWidth="2.5"
              strokeLinejoin="round" />
          )}

          {/* Le segment [AB], toujours présent : c'est le point de départ */}
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#0f172a" strokeWidth="3" />

          {[[A, 'A'], [B, 'B']].map(([p, n]) => (
            <g key={n}>
              <circle cx={p.x} cy={p.y} r="6" fill="#0f172a" />
              <text x={p.x} y={p.y + 22} textAnchor="middle" fontSize="15" fontWeight="700"
                className="font-space" fill="#0f172a">{n}</text>
            </g>
          ))}
          {C && (
            <g>
              <circle cx={C.x} cy={C.y} r="6" fill="#4338ca" stroke="#fff" strokeWidth="2" />
              <text x={C.x} y={C.y - 12} textAnchor="middle" fontSize="15" fontWeight="700"
                className="font-space" fill="#0f172a">{VERTEX_NAMES[2]}</text>
            </g>
          )}

          {/* Étiquette du côté connu, décalée sous les noms de sommets pour
              ne pas se superposer à eux (défaut vu en revue visuelle). */}
          <text x={(A.x + B.x) / 2} y={A.y + 38} textAnchor="middle" fontSize="12"
            className="font-mono font-semibold" fill="#475569">AB = {c}</text>
        </g>
      </svg>

      <p className="text-center text-sm" aria-live="polite">
        {verdict.ok && (
          <span className="inline-block px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold">
            Les arcs se croisent : le triangle existe
          </span>
        )}
        {verdict.degenerate && (
          <span className="inline-block px-3 py-1 rounded-lg bg-amber-100 text-amber-800 font-semibold">
            Les arcs se touchent en un seul point : le triangle est aplati
          </span>
        )}
        {!verdict.ok && !verdict.degenerate && (
          <span className="inline-block px-3 py-1 rounded-lg bg-rose-100 text-rose-800 font-semibold">
            Les arcs ne se rencontrent jamais : ce triangle n’existe pas
          </span>
        )}
      </p>
    </div>
  );
}
