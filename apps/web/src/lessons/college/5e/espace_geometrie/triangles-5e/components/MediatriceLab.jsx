import React, { useCallback, useState } from 'react';
import GeoScene, { Dot, Handle, Poly, Seg, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import { TickMarks } from '../../../../../common/geo5e/AngleArc';
import {
  clampPt, mediatrice, circumcenter, rayonCirconscrit, ecartRayons, dist,
  midpoint, polygonArea, clipLine, fr,
} from './triangles';
import { Grille } from './TriangleLab';

const W = 760;
const H = 500;
const COTES = ['#0ea5e9', '#f59e0b', '#10b981'];

/**
 * MediatriceLab — les trois médiatrices, et le point qu'elles s'obstinent à
 * partager.
 *
 * L'élève traîne les sommets ; les médiatrices suivent. Le point de concours
 * n'est PAS dessiné à l'avance : il est calculé (`circumcenter`, testé), et
 * l'écart entre les trois rayons est affiché en direct. Si les médiatrices ne
 * concouraient pas, cet écart le dirait — il reste nul, quoi qu'on fasse.
 *
 * `nbMediatrices` permet de les révéler une par une : deux médiatrices
 * suffisent à définir le point, la troisième est la surprise.
 */
export default function MediatriceLab({
  tri, onTri,
  nbMediatrices = 3,
  montrerCercle = false,
  montrerRayons = false,
  ariaLabel,
}) {
  const [drag, setDrag] = useState(null);

  const O = circumcenter(tri);
  const R = rayonCirconscrit(tri);
  const ecart = ecartRayons(tri);

  const move = useCallback((p) => {
    if (!p || drag === null) return;
    const q = clampPt(p, W, H, 60);
    const candidat = tri.map((s, i) => (i === drag ? q : s));
    if (polygonArea(candidat) < 4000) return;
    // Le centre doit rester visible : sinon l'élève croit qu'il n'existe pas.
    const c = circumcenter(candidat);
    if (!c || c.x < -80 || c.x > W + 80 || c.y < -80 || c.y > H + 80) return;
    onTri?.(candidat);
  }, [drag, onTri, tri]);

  /** La médiatrice du côté i, prolongée jusqu'aux bords du cadre. */
  const traceMediatrice = (i) => {
    const P = tri[(i + 1) % 3];
    const Q = tri[(i + 2) % 3];
    const [m, d] = mediatrice(P, Q);
    return { seg: clipLine(m, d, W, H, 6), milieu: midpoint(P, Q), P, Q };
  };

  return (
    <div className="rounded-2xl border-2 border-purple-200 bg-white overflow-hidden">
      <GeoScene
        width={W} height={H}
        labels={[
          ...tri.map((p, i) => ({ id: `s${i}`, text: ['A', 'B', 'C'][i], anchor: p, color: '#334155', size: 20 })),
          ...(nbMediatrices >= 2 && O ? [{ id: 'O', text: 'O', anchor: O, color: '#dc2626', size: 19 }] : []),
        ]}
        obstacles={[
          ...dotObstacles(tri, 22),
          ...polyObstacles(tri),
          ...(O ? dotObstacles([O], 18) : []),
        ]}
        ariaLabel={ariaLabel}
        onPointerMove={move}
        onPointerUp={() => setDrag(null)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />
        <Grille />

        {montrerCercle && O && R && (
          <circle cx={O.x} cy={O.y} r={R} fill="none" stroke="#a855f7" strokeWidth={3} />
        )}

        <Poly pts={tri} fill="#7c3aed" stroke="#6d28d9" fillOpacity={0.08} />

        {/* Les médiatrices, révélées une par une. */}
        {[0, 1, 2].slice(0, nbMediatrices).map((i) => {
          const { seg, milieu, P, Q } = traceMediatrice(i);
          return (
            <g key={i}>
              <Seg a={seg[0]} b={seg[1]} color={COTES[i]} w={2.5} dash="9 6" />
              {/* Les deux demi-côtés portent la même marque : c'est le MILIEU. */}
              <TickMarks a={P} b={milieu} n={i + 1} color={COTES[i]} />
              <TickMarks a={milieu} b={Q} n={i + 1} color={COTES[i]} />
              <Dot p={milieu} color={COTES[i]} r={5} />
            </g>
          );
        })}

        {montrerRayons && O && tri.map((p, i) => (
          <Seg key={`r${i}`} a={O} b={p} color="#dc2626" w={2} dash="5 5" />
        ))}

        {nbMediatrices >= 2 && O && <Dot p={O} color="#dc2626" r={8} />}

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

      {nbMediatrices >= 2 && O && (
        <div className="border-t-2 border-purple-100 bg-purple-50/60 px-4 py-3 grid grid-cols-3 gap-2 text-center">
          {tri.map((p, i) => (
            <div key={i}>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                O{['A', 'B', 'C'][i]}
              </div>
              <div className="font-mono text-base font-black tabular-nums text-purple-700">
                {fr(dist(O, p) / 40, 2)} u
              </div>
            </div>
          ))}
          <div className="col-span-3 text-sm font-bold text-emerald-700">
            {ecart !== null && ecart < 0.5
              ? '✓ les trois distances sont égales — O est à égale distance des trois sommets'
              : 'les distances diffèrent'}
          </div>
        </div>
      )}
    </div>
  );
}

export { W as MED_W, H as MED_H };
