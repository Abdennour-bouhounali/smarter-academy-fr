import React, { useCallback, useState } from 'react';
import GeoScene, { Handle, Poly, Seg, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import { clampPt, dist, fr, polygonArea, symCentralPts, triangleAngles } from '../../../../../common/geo5e/geo5e';
import { Grille } from './DemiTourLab';

const W = 760;
const H = 470;

/**
 * InvariantsLab — la chasse au contre-exemple.
 *
 * L'élève déforme le triangle À SA GUISE (chaque sommet est une poignée) et
 * déplace le centre. Le tableau de bord compare, en temps réel, la figure et
 * son image sur quatre grandeurs : un côté, un angle, l'aire, et le nombre de
 * sommets alignés. Il CHERCHE une position où l'un des quatre diffère.
 *
 * Il n'en trouvera pas — et c'est le but. Une propriété qu'on a tenté de
 * mettre en défaut vaut mieux qu'une propriété qu'on a lue : la conviction
 * vient de l'échec de la recherche, pas de l'affirmation du cours.
 *
 * TOUT EST MESURÉ sur les points réellement dessinés (geo5e) : la table ne
 * peut pas afficher « égal » sur une figure qui ne le serait pas.
 */
export default function InvariantsLab({ sommets, onSommets, centre, onCentre, ariaLabel }) {
  const [drag, setDrag] = useState(null);
  const image = symCentralPts(sommets, centre);

  const move = useCallback((p) => {
    if (!p || drag === null) return;
    const q = clampPt(p, W, H, 30);
    if (drag === 'O') onCentre(q);
    else onSommets(sommets.map((s, i) => (i === drag ? q : s)));
  }, [drag, onCentre, onSommets, sommets]);

  // Les quatre grandeurs comparées, calculées des deux côtés.
  const cote = dist(sommets[0], sommets[1]);
  const coteImg = dist(image[0], image[1]);
  const angles = triangleAngles(sommets);
  const anglesImg = triangleAngles(image);
  const aire = polygonArea(sommets);
  const aireImg = polygonArea(image);

  const lignes = [
    { id: 'l', label: 'Longueur AB', a: `${fr(cote / 40, 2)} u`, b: `${fr(coteImg / 40, 2)} u`, egal: Math.abs(cote - coteImg) < 0.01 },
    { id: 'a', label: 'Angle en A', a: `${fr(angles[0], 1)}°`, b: `${fr(anglesImg[0], 1)}°`, egal: Math.abs(angles[0] - anglesImg[0]) < 0.01 },
    { id: 's', label: 'Aire', a: `${fr(aire / 1600, 2)} u²`, b: `${fr(aireImg / 1600, 2)} u²`, egal: Math.abs(aire - aireImg) < 0.01 },
  ];

  const noms = ['A', 'B', 'C'];

  return (
    <div className="rounded-2xl border-2 border-emerald-200 bg-white overflow-hidden">
      <GeoScene
        width={W} height={H}
        labels={[
          { id: 'O', text: 'O', anchor: centre, color: '#dc2626', priority: true },
          ...sommets.map((p, i) => ({ id: `s${i}`, text: noms[i], anchor: p, color: '#334155', priority: true })),
          ...image.map((p, i) => ({ id: `i${i}`, text: `${noms[i]}’`, anchor: p, color: '#059669', priority: true })),
        ]}
        obstacles={[
          ...dotObstacles([centre, ...sommets, ...image], 18),
          ...polyObstacles(sommets), ...polyObstacles(image),
        ]}
        ariaLabel={ariaLabel}
        onPointerMove={move}
        onPointerUp={() => setDrag(null)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />
        <Grille />

        {/* Les trois traces : elles rappellent que O est le milieu de chacune. */}
        {sommets.map((p, i) => (
          <Seg key={`t${i}`} a={p} b={image[i]} color="#fde68a" w={2} dash="6 6" />
        ))}

        <Poly pts={sommets} fill="#64748b" stroke="#475569" fillOpacity={0.1} />
        <Poly pts={image} fill="#10b981" stroke="#059669" fillOpacity={0.14} />

        {image.map((p, i) => (
          <circle key={`ip${i}`} cx={p.x} cy={p.y} r={8} fill="#059669" stroke="#fff" strokeWidth={2.5} />
        ))}
        {sommets.map((p, i) => (
          <Handle
            key={`h${i}`} p={p} color="#334155" r={13}
            dragging={drag === i}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(i); }}
            label={`Déplacer le sommet ${noms[i]}`}
          />
        ))}
        <Handle
          p={centre} color="#dc2626" r={13}
          dragging={drag === 'O'}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag('O'); }}
          label="Déplacer le centre O"
        />
      </GeoScene>

      <div className="border-t-2 border-emerald-100 bg-emerald-50/50 px-3 py-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="text-left font-semibold py-1">Grandeur</th>
              <th className="font-semibold">Figure</th>
              <th className="font-semibold">Image</th>
              <th className="font-semibold">Égales ?</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.id} className="border-t border-emerald-100">
                <td className="py-1.5 text-slate-700 font-semibold">{l.label}</td>
                <td className="text-center font-mono tabular-nums text-slate-600">{l.a}</td>
                <td className="text-center font-mono tabular-nums text-slate-600">{l.b}</td>
                <td className={`text-center font-black ${l.egal ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {l.egal ? 'oui' : 'NON'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { W as INV_W, H as INV_H };
