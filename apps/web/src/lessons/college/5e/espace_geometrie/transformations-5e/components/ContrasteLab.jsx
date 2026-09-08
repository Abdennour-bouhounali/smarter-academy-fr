import React, { useCallback, useState } from 'react';
import GeoScene, { Handle, Poly, Seg, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import { clampPt, symCentralPts, symAxial } from '../../../../../common/geo5e/geo5e';
import { Grille } from './DemiTourLab';

const W = 760;
const H = 460;

/**
 * ContrasteLab — le demi-tour et le pliage, sur la MÊME figure, en même temps.
 *
 * Les deux images sont affichées ensemble à partir de la même figure de
 * départ. On peut déplacer le centre et l'axe. La lettre « F » sert de figure
 * témoin : elle n'a aucune symétrie, donc un retournement se voit à l'œil nu —
 * le F du pliage est un F « à l'envers » qu'on ne peut pas remettre à
 * l'endroit en le faisant glisser, alors que celui du demi-tour, si.
 *
 * C'est la seule différence OBSERVABLE entre les deux transformations, et le
 * laboratoire la met sous les yeux au lieu de la faire mémoriser.
 */
export default function ContrasteLab({ figure, centre, onCentre, axeX, onAxeX, ariaLabel }) {
  const [drag, setDrag] = useState(null);
  const A = { x: axeX, y: 20 };
  const B = { x: axeX, y: H - 20 };
  const demi = symCentralPts(figure, centre);
  const plie = figure.map((p) => symAxial(p, A, B));

  const move = useCallback((p) => {
    if (!p || !drag) return;
    if (drag === 'O') onCentre(clampPt(p, W, H, 26));
    if (drag === 'axe') onAxeX(Math.min(W - 40, Math.max(40, p.x)));
  }, [drag, onCentre, onAxeX]);

  return (
    <div className="rounded-2xl border-2 border-rose-200 bg-white overflow-hidden">
      <GeoScene
        width={W} height={H}
        labels={[{ id: 'O', text: 'O', anchor: centre, color: '#dc2626', priority: true }]}
        obstacles={[
          ...dotObstacles([centre], 18),
          ...polyObstacles(figure), ...polyObstacles(demi), ...polyObstacles(plie),
        ]}
        ariaLabel={ariaLabel}
        onPointerMove={move}
        onPointerUp={() => setDrag(null)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />
        <Grille />

        {/* L'axe de pliage, saisissable. */}
        <Seg a={A} b={B} color="#0ea5e9" w={3} dash="10 7" />
        <Handle
          p={{ x: axeX, y: 34 }} color="#0ea5e9" r={11}
          dragging={drag === 'axe'}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag('axe'); }}
          label="Déplacer l’axe de pliage"
        />

        <Poly pts={plie} fill="#0ea5e9" stroke="#0284c7" fillOpacity={0.16} />
        <Poly pts={demi} fill="#7c3aed" stroke="#6d28d9" fillOpacity={0.16} />
        <Poly pts={figure} fill="#64748b" stroke="#334155" fillOpacity={0.12} />

        <Handle
          p={centre} color="#dc2626" r={13}
          dragging={drag === 'O'}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag('O'); }}
          label="Déplacer le centre du demi-tour"
        />
      </GeoScene>

      <div className="border-t-2 border-rose-100 bg-rose-50/50 px-4 py-2.5 grid grid-cols-3 gap-2 text-center text-sm">
        <Legende color="bg-slate-400" label="Figure de départ" />
        <Legende color="bg-violet-500" label="Demi-tour (centre O)" />
        <Legende color="bg-sky-500" label="Pliage (axe bleu)" />
      </div>
    </div>
  );
}

function Legende({ color, label }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className={`inline-block w-3 h-3 rounded ${color}`} aria-hidden="true" />
      <span className="text-slate-600 font-semibold text-xs sm:text-sm">{label}</span>
    </div>
  );
}

export { W as CONT_W, H as CONT_H };
