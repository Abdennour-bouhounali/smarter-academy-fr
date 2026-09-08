import React, { useCallback, useState } from 'react';
import GeoScene, { Handle, Poly, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import { clampPt, symCentralPts } from '../../../../../common/geo5e/geo5e';
import { estCentreDeSymetrie } from './transformations';
import { Grille } from './DemiTourLab';

const W = 700;
const H = 440;

/**
 * CentreFigureLab — « la figure revient-elle sur elle-même ? »
 *
 * L'élève promène un point candidat dans la figure et voit, en direct, l'image
 * de la figure par le demi-tour autour de ce point. Quand l'image recouvre
 * exactement la figure, la superposition se VOIT — et le verdict s'affiche.
 *
 * C'est ce qui rend la notion « centre de symétrie » palpable au lieu d'être
 * une liste de figures à retenir : sur le triangle équilatéral, l'élève cherche
 * partout et l'image refuse de coïncider, où qu'il pose le point.
 */
export default function CentreFigureLab({ figure, candidat, onCandidat, ariaLabel }) {
  const [drag, setDrag] = useState(false);
  const image = symCentralPts(figure, candidat);
  const coincide = estCentreDeSymetrie(figure, candidat, 6);

  const move = useCallback((p) => {
    if (!p || !drag) return;
    onCandidat(clampPt(p, W, H, 24));
  }, [drag, onCandidat]);

  return (
    <div className="rounded-2xl border-2 border-purple-200 bg-white overflow-hidden">
      <GeoScene
        width={W} height={H}
        labels={[{ id: 'P', text: 'P', anchor: candidat, color: '#dc2626', priority: true }]}
        obstacles={[...dotObstacles([candidat], 18), ...polyObstacles(figure)]}
        ariaLabel={ariaLabel}
        onPointerMove={move}
        onPointerUp={() => setDrag(false)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />
        <Grille />

        {/* L'image, dessous : quand elle coïncide, on ne la distingue plus —
            et c'est exactement le signe qu'on cherche. */}
        <Poly pts={image} fill="#f97316" stroke="#ea580c" fillOpacity={coincide ? 0.05 : 0.18} w={coincide ? 2 : 3.5} />
        <Poly pts={figure} fill="#a855f7" stroke="#7e22ce" fillOpacity={0.14} />

        <Handle
          p={candidat} color="#dc2626" r={13}
          dragging={drag}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); }}
          label="Déplacer le point candidat"
        />
      </GeoScene>

      <div className={`px-4 py-2.5 text-sm font-bold text-center border-t-2 ${
        coincide
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
          : 'bg-slate-50 text-slate-500 border-purple-100'
      }`}>
        {coincide
          ? '✓ La figure revient exactement sur elle-même : P est un centre de symétrie'
          : 'L’image (orange) dépasse de la figure : ce point n’est pas un centre de symétrie'}
      </div>
    </div>
  );
}

export { W as CF_W, H as CF_H };
