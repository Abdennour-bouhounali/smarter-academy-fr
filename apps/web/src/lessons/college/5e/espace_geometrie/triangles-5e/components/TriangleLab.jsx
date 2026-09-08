import React, { useCallback, useState } from 'react';
import GeoScene, { Dot, Handle, Poly, Seg, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import AngleArc, { TickMarks } from '../../../../../common/geo5e/AngleArc';
import { clampPt, fr, triangleAngles, sommeAngles, polygonArea } from './triangles';

const W = 760;
const H = 500;

const TEINTES = ['#7c3aed', '#0ea5e9', '#f59e0b'];

/**
 * TriangleLab — LE laboratoire de la leçon : un triangle dont les trois
 * sommets se traînent, et dont tout est mesuré en direct.
 *
 * Ce qu'on manipule, ce sont les SOMMETS eux-mêmes (§ « on traîne la figure,
 * jamais un bouton + / − »). Rien ne se fige une fois l'étape validée : après
 * avoir trouvé, on continue d'explorer.
 *
 * TOUT EST CALCULÉ. Les trois angles et leur somme viennent de `triangleAngles`
 * (testé) appliqué aux points RÉELLEMENT dessinés. C'est ce qui permet de
 * lancer le défi « fais changer la somme » sans risquer qu'un arrondi
 * fabrique un faux contre-exemple : le total affiché est le vrai total.
 *
 * Un triangle aplati est refusé à la source (aire minimale) : trois points
 * alignés ne forment pas un triangle, et leurs « angles » n'auraient pas de
 * sens.
 */
export default function TriangleLab({
  tri, onTri,
  noms = ['A', 'B', 'C'],
  montrerAngles = true,
  montrerSomme = true,
  extra = null,               // surcouche dessinée SOUS le triangle
  labelsExtra = [],
  obstaclesExtra = [],
  ariaLabel,
}) {
  const [drag, setDrag] = useState(null);

  const angles = triangleAngles(tri);
  const somme = sommeAngles(tri);

  const move = useCallback((p) => {
    if (!p || drag === null) return;
    const q = clampPt(p, W, H, 40);
    const candidat = tri.map((s, i) => (i === drag ? q : s));
    // Un triangle trop aplati n'est plus un triangle : on refuse le
    // déplacement plutôt que d'afficher des angles qui ne veulent rien dire.
    if (polygonArea(candidat) < 1800) return;
    onTri?.(candidat);
  }, [drag, onTri, tri]);

  const labels = [
    ...tri.map((p, i) => ({ id: `s${i}`, text: noms[i], anchor: p, color: '#334155', size: 20 })),
    ...labelsExtra,
  ];

  return (
    <div className="rounded-2xl border-2 border-violet-200 bg-white overflow-hidden">
      <GeoScene
        width={W} height={H}
        labels={labels}
        obstacles={[...dotObstacles(tri, 22), ...polyObstacles(tri), ...obstaclesExtra]}
        ariaLabel={ariaLabel}
        onPointerMove={move}
        onPointerUp={() => setDrag(null)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />
        <Grille />
        {extra}
        <Poly pts={tri} fill="#7c3aed" stroke="#6d28d9" fillOpacity={0.1} />
        {montrerAngles && tri.map((p, i) => (
          <AngleArc
            key={i}
            a={tri[(i + 1) % 3]} b={p} c={tri[(i + 2) % 3]}
            r={40} color={TEINTES[i]} showValue
          />
        ))}
        {tri.map((p, i) => (
          <Handle
            key={i}
            p={p} color="#334155" r={13}
            dragging={drag === i}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(i); }}
            label={`Déplacer le sommet ${noms[i]}`}
          />
        ))}
      </GeoScene>

      {montrerSomme && (
        <div className="border-t-2 border-violet-100 bg-violet-50/60 px-4 py-3">
          <div className="flex items-center justify-center gap-2 flex-wrap text-center">
            {angles.map((a, i) => (
              <React.Fragment key={i}>
                <span
                  className="rounded-lg bg-white border-2 px-2.5 py-1 font-mono text-base font-black tabular-nums"
                  style={{ borderColor: TEINTES[i], color: TEINTES[i] }}
                >
                  {fr(a, 1)}°
                </span>
                <span className="text-slate-400 font-bold">{i < 2 ? '+' : '='}</span>
              </React.Fragment>
            ))}
            <span className="rounded-lg bg-violet-600 px-3 py-1 font-mono text-lg font-black tabular-nums text-white">
              {fr(somme, 1)}°
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Le quadrillage : décor, jamais protégé par l'audit de collisions. */
export function Grille({ step = 40 }) {
  const lines = [];
  for (let x = step; x < W; x += step) lines.push(<line key={`x${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#f1f5f9" strokeWidth={1} data-visual-role="grid" />);
  for (let y = step; y < H; y += step) lines.push(<line key={`y${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#f1f5f9" strokeWidth={1} data-visual-role="grid" />);
  return <g>{lines}</g>;
}

export { W as TRI_W, H as TRI_H, TEINTES };
