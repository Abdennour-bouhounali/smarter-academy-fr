import React from 'react';
import GeoScene, { Dot, Poly, Seg } from '../../../../../common/geo5e/GeoScene';
import AngleArc from '../../../../../common/geo5e/AngleArc';
import { recollageAngles, triangleAngles, fr, rad } from './triangles';

const W = 760;
const H = 420;
const TEINTES = ['#7c3aed', '#0ea5e9', '#f59e0b'];

/**
 * DecoupageLab — LA démonstration de la somme des angles, jouée.
 *
 * `avancement` va de 0 (le triangle intact) à 1 (les trois coins recollés
 * bout à bout autour d'un point, formant l'angle plat). L'élève tire le
 * curseur : les trois secteurs quittent leur sommet et viennent se ranger
 * contre la droite, dans l'ordre.
 *
 * LA PREUVE EST CALCULÉE, PAS MIMÉE. Les secteurs recollés ont exactement la
 * mesure des angles du triangle affiché (`recollageAngles`, testé). Si la
 * somme ne faisait pas 180°, ils déborderaient de la droite ou laisseraient un
 * trou — l'animation ne peut pas mentir en faveur du résultat.
 */
export default function DecoupageLab({ tri, avancement, ariaLabel }) {
  const angles = triangleAngles(tri);
  const { cumul } = recollageAngles(tri);

  const O = { x: W / 2, y: 320 };
  const R = 118;
  const t = Math.max(0, Math.min(1, avancement));

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-white overflow-hidden">
      <GeoScene
        width={W} height={H}
        labels={t < 0.55 ? tri.map((p, i) => ({
          id: `s${i}`, text: ['A', 'B', 'C'][i], anchor: p, color: '#334155', size: 18,
        })) : []}
        obstacles={[]}
        ariaLabel={ariaLabel}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />

        {/* La droite d'accueil : elle n'apparaît qu'au moment du recollage. */}
        {t > 0.15 && (
          <Seg
            a={{ x: 60, y: O.y }} b={{ x: W - 60, y: O.y }}
            color="#334155" w={3} opacity={Math.min(1, (t - 0.15) / 0.25)}
          />
        )}

        {/* Le triangle s'efface à mesure que ses coins s'en vont. */}
        <g opacity={Math.max(0, 1 - t * 1.5)}>
          <Poly pts={tri} fill="#7c3aed" stroke="#6d28d9" fillOpacity={0.1} />
          {tri.map((p, i) => <Dot key={i} p={p} color="#334155" r={5} />)}
        </g>

        {/* Les trois coins : chacun voyage de son sommet vers le point O. */}
        {cumul.map((c, i) => {
          const sommet = tri[i];
          // Position interpolée du centre du secteur.
          const cx = sommet.x + (O.x - sommet.x) * t;
          const cy = sommet.y + (O.y - sommet.y) * t;

          // À l'arrivée, le secteur est rangé contre la droite, à sa place
          // dans la file ; au départ, il épouse l'angle du triangle.
          const aDepart = Math.atan2(tri[(i + 1) % 3].y - sommet.y, tri[(i + 1) % 3].x - sommet.x);
          const aArrivee = rad(180 - c.debut);
          // On interpole l'orientation, pas la mesure : le coin garde sa taille.
          const a0 = aDepart + (aArrivee - aDepart) * t;
          const sens = t > 0.5 ? -1 : Math.sign(
            ((Math.atan2(tri[(i + 2) % 3].y - sommet.y, tri[(i + 2) % 3].x - sommet.x) - aDepart + Math.PI * 3) % (Math.PI * 2)) - Math.PI,
          ) || 1;
          const a1 = a0 + sens * rad(c.mesure);

          const p0 = { x: cx + R * Math.cos(a0), y: cy + R * Math.sin(a0) };
          const p1 = { x: cx + R * Math.cos(a1), y: cy + R * Math.sin(a1) };
          const rayon = R * (0.45 + 0.55 * t);
          const q0 = { x: cx + rayon * Math.cos(a0), y: cy + rayon * Math.sin(a0) };
          const q1 = { x: cx + rayon * Math.cos(a1), y: cy + rayon * Math.sin(a1) };

          return (
            <g key={i}>
              <path
                d={`M ${cx} ${cy} L ${q0.x} ${q0.y} A ${rayon} ${rayon} 0 0 ${sens > 0 ? 1 : 0} ${q1.x} ${q1.y} Z`}
                fill={TEINTES[i]} fillOpacity={0.32}
                stroke={TEINTES[i]} strokeWidth={2.5} strokeLinejoin="round"
              />
              {/* La mesure du coin voyage avec lui : on voit que le morceau
                  n'a pas été redimensionné en route. */}
              <text
                x={cx + rayon * 0.62 * Math.cos(a0 + (sens * rad(c.mesure)) / 2)}
                y={cy + rayon * 0.62 * Math.sin(a0 + (sens * rad(c.mesure)) / 2)}
                textAnchor="middle" dominantBaseline="central"
                fontSize={16} fontWeight={800} fill={TEINTES[i]}
                stroke="#ffffff" strokeWidth={4} paintOrder="stroke"
              >
                {fr(c.mesure, 0)}°
              </text>
            </g>
          );
        })}

        {t > 0.9 && <Dot p={O} color="#334155" r={5} />}
      </GeoScene>

      <div className="border-t-2 border-indigo-100 bg-indigo-50/60 px-4 py-2.5 text-center text-sm">
        {t < 0.1 ? (
          <span className="text-slate-600">le triangle intact, avec ses trois coins</span>
        ) : t > 0.9 ? (
          <span className="font-bold text-indigo-800">
            les trois coins bout à bout remplissent exactement l’angle plat :{' '}
            {angles.map((a) => fr(a, 0)).join(' + ')} = 180°
          </span>
        ) : (
          <span className="text-slate-600">les coins se détachent et rejoignent la droite…</span>
        )}
      </div>
    </div>
  );
}

export { W as DEC_W, H as DEC_H };
