import React, { useCallback, useState } from 'react';
import GeoScene, { Dot, Handle, Poly, Seg, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import { TickMarks } from '../../../../../common/geo5e/AngleArc';
import {
  clampPt, hauteur, mediane, airesSepareesParMediane, polygonArea, fr, natureDe,
} from './triangles';
import { Grille } from './TriangleLab';

const W = 760;
const H = 500;
const U2 = 1600;        // px² par unité d'aire (40 px = 1 u)

/**
 * HauteurMedianeLab — la hauteur et la médiane issues du même sommet.
 *
 * `mode` choisit ce qu'on montre : 'hauteur', 'mediane', 'les-deux', ou
 * 'aires' (la médiane, plus les deux morceaux coloriés et leurs aires).
 *
 * TOUT EST MESURÉ. Les deux aires viennent de `airesSepareesParMediane`
 * (testé), appliqué aux points réellement dessinés : l'élève peut déformer le
 * triangle autant qu'il veut, les deux nombres restent égaux — et ce n'est pas
 * une coïncidence d'affichage, c'est le théorème.
 *
 * L'ÉCART hauteur/médiane est affiché : il tombe à zéro exactement quand le
 * triangle devient isocèle en A, ce qui rend visible le « cas particulier »
 * sans avoir à l'annoncer.
 */
export default function HauteurMedianeLab({
  tri, onTri,
  mode = 'les-deux',
  ariaLabel,
}) {
  const [drag, setDrag] = useState(null);

  const h = hauteur(tri, 0);
  const m = mediane(tri, 0);
  const aires = airesSepareesParMediane(tri, 0);
  const ecart = Math.hypot(h.pied.x - m.milieu.x, h.pied.y - m.milieu.y);
  const nature = natureDe(tri);

  const move = useCallback((p) => {
    if (!p || drag === null) return;
    const q = clampPt(p, W, H, 45);
    const candidat = tri.map((s, i) => (i === drag ? q : s));
    if (polygonArea(candidat) < 4000) return;
    onTri?.(candidat);
  }, [drag, onTri, tri]);

  const montreH = mode === 'hauteur' || mode === 'les-deux';
  const montreM = mode === 'mediane' || mode === 'les-deux' || mode === 'aires';

  return (
    <div className="rounded-2xl border-2 border-rose-200 bg-white overflow-hidden">
      <GeoScene
        width={W} height={H}
        labels={[
          ...tri.map((p, i) => ({ id: `s${i}`, text: ['A', 'B', 'C'][i], anchor: p, color: '#334155', size: 20 })),
          ...(montreH ? [{ id: 'H', text: 'H', anchor: h.pied, color: '#0284c7', size: 18 }] : []),
          ...(montreM ? [{ id: 'M', text: 'M', anchor: m.milieu, color: '#059669', size: 18 }] : []),
        ]}
        obstacles={[
          ...dotObstacles(tri, 22),
          ...polyObstacles(tri),
          ...dotObstacles([h.pied, m.milieu], 16),
        ]}
        ariaLabel={ariaLabel}
        onPointerMove={move}
        onPointerUp={() => setDrag(null)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />
        <Grille />

        {mode === 'aires' ? (
          <>
            {/* Les deux morceaux, coloriés distinctement. */}
            <Poly pts={[tri[0], tri[1], m.milieu]} fill="#0ea5e9" stroke="#0284c7" fillOpacity={0.28} />
            <Poly pts={[tri[0], m.milieu, tri[2]]} fill="#f59e0b" stroke="#d97706" fillOpacity={0.28} />
            {/* La hauteur commune, en pointillés : c'est le second ingrédient
                de la preuve, et il doit se VOIR. */}
            <Seg a={h.sommet} b={h.pied} color="#94a3b8" w={2} dash="6 5" />
          </>
        ) : (
          <Poly pts={tri} fill="#7c3aed" stroke="#6d28d9" fillOpacity={0.08} />
        )}

        {montreH && (
          <>
            <Seg a={h.sommet} b={h.pied} color="#0284c7" w={3.5} />
            {/* Le petit carré de l'angle droit, à la main : le pied EST le
                point où la perpendiculaire touche. */}
            <MarqueDroit sommet={h.pied} vers1={h.sommet} vers2={tri[1]} />
            <Dot p={h.pied} color="#0284c7" r={6} />
          </>
        )}

        {montreM && (
          <>
            <Seg a={m.sommet} b={m.milieu} color="#059669" w={3.5} dash={mode === 'les-deux' ? '9 6' : undefined} />
            <TickMarks a={tri[1]} b={m.milieu} n={1} color="#059669" />
            <TickMarks a={m.milieu} b={tri[2]} n={1} color="#059669" />
            <Dot p={m.milieu} color="#059669" r={6} />
          </>
        )}

        {tri.map((p, i) => (
          <Handle
            key={i}
            p={p} color="#334155" r={13}
            dragging={drag === i}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(i); }}
            label={`Déplacer le sommet ${['A', 'B', 'C'][i]}`}
          />
        ))}
      </GeoScene>

      {mode === 'aires' ? (
        <div className="border-t-2 border-rose-100 bg-rose-50/60 px-4 py-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Aire de ABM</div>
              <div className="font-mono text-xl font-black tabular-nums text-sky-700">
                {fr(aires.aire1 / U2, 2)} u²
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Aire de AMC</div>
              <div className="font-mono text-xl font-black tabular-nums text-amber-700">
                {fr(aires.aire2 / U2, 2)} u²
              </div>
            </div>
          </div>
          <div className="mt-2 text-center text-sm font-bold text-emerald-700">
            {Math.abs(aires.aire1 - aires.aire2) < 1
              ? '✓ les deux moitiés ont exactement la même aire'
              : 'les aires diffèrent'}
          </div>
        </div>
      ) : mode === 'les-deux' ? (
        <div className="border-t-2 border-rose-100 bg-rose-50/60 px-4 py-2.5 text-center text-sm">
          {ecart < 4 ? (
            <span className="font-bold text-orange-700">
              ⚠ hauteur et médiane sont CONFONDUES — le triangle est isocèle en A
            </span>
          ) : (
            <span className="text-slate-600">
              H et M sont distants de{' '}
              <strong className="tabular-nums text-slate-800">{fr(ecart / 40, 2)} u</strong> — ce
              sont bien deux droites différentes
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Le petit carré de l'angle droit au pied de la hauteur. */
function MarqueDroit({ sommet, vers1, vers2, s = 15 }) {
  const u = norm(vers1, sommet);
  const v = norm(vers2, sommet);
  return (
    <path
      d={`M ${sommet.x + s * u.x} ${sommet.y + s * u.y}
          L ${sommet.x + s * (u.x + v.x)} ${sommet.y + s * (u.y + v.y)}
          L ${sommet.x + s * v.x} ${sommet.y + s * v.y}`}
      fill="none" stroke="#0284c7" strokeWidth={2.5} strokeLinejoin="round"
    />
  );
}

function norm(p, o) {
  const dx = p.x - o.x;
  const dy = p.y - o.y;
  const n = Math.hypot(dx, dy) || 1;
  return { x: dx / n, y: dy / n };
}

export { W as HM_W, H as HM_H };
