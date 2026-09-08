import React from 'react';
import GeoScene, { Dot, Seg } from '../../../../../common/geo5e/GeoScene';
import { diagnostiquerCotes, fr, rad } from './triangles';

const W = 760;
const H = 330;
const U = 4.2;              // pixels par unité de longueur

/**
 * FermetureLab — trois barres articulées qui essaient de fermer.
 *
 * C'est le dispositif de découverte de l'inégalité triangulaire : les deux
 * côtés courts sont montés sur charnières aux extrémités du grand côté, et ils
 * pivotent l'un vers l'autre autant qu'ils peuvent. Quand ils sont trop
 * courts, un ÉCART subsiste — visible, mesuré — et le triangle ne se ferme pas.
 *
 * LE VERDICT EST CALCULÉ (`diagnostiquerCotes`, testé) : la figure ne peut pas
 * fermer un triangle impossible, ni refuser un triangle valable. Et l'écart
 * affiché est le vrai manque, pas une approximation.
 */
export default function FermetureLab({ a, b, c, ariaLabel }) {
  const diag = diagnostiquerCotes(a, b, c);

  // Le plus grand côté est posé horizontalement : c'est la base.
  const grand = Math.max(a, b, c);
  const petits = (() => {
    const l = [a, b, c];
    const i = l.indexOf(grand);
    return l.filter((_, k) => k !== i);
  })();
  const [p1, p2] = petits;

  const baseLen = grand * U;
  const B = { x: (W - baseLen) / 2, y: 215 };
  const C = { x: B.x + baseLen, y: 215 };

  let A = null;             // le sommet, quand la fermeture est possible
  let bout1 = null;         // l'extrémité libre de la barre partie de B
  let bout2 = null;         // l'extrémité libre de la barre partie de C

  if (diag.possible) {
    // Intersection des deux cercles : la construction au compas.
    const x = (grand * grand + p1 * p1 - p2 * p2) / (2 * grand);
    const h = Math.sqrt(Math.max(0, p1 * p1 - x * x));
    A = { x: B.x + x * U, y: B.y - h * U };
  } else {
    // Les deux barres se lèvent au maximum l'une vers l'autre : elles restent
    // couchées sur la base, et l'écart se voit.
    bout1 = { x: B.x + p1 * U, y: B.y };
    bout2 = { x: C.x - p2 * U, y: B.y };
  }

  const ecart = diag.possible ? 0 : grand - (p1 + p2);

  return (
    <div className={`rounded-2xl border-2 overflow-hidden bg-white ${diag.possible ? 'border-emerald-300' : 'border-orange-300'}`}>
      <GeoScene
        width={W} height={H}
        labels={[
          { id: 'B', text: 'B', anchor: B, color: '#334155', size: 18 },
          { id: 'C', text: 'C', anchor: C, color: '#334155', size: 18 },
          ...(A ? [{ id: 'A', text: 'A', anchor: A, color: '#334155', size: 18 }] : []),
        ]}
        obstacles={[]}
        ariaLabel={ariaLabel}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />

        {/* La base : le plus grand côté. */}
        <Seg a={B} b={C} color="#334155" w={6} />
        <text x={(B.x + C.x) / 2} y={B.y + 30} textAnchor="middle" fontSize={16} fontWeight={800} fill="#334155">
          {fr(grand, 0)}
        </text>

        {diag.possible ? (
          <>
            <Seg a={B} b={A} color="#0ea5e9" w={6} />
            <Seg a={C} b={A} color="#f59e0b" w={6} />
            <text
              x={(B.x + A.x) / 2 - 20} y={(B.y + A.y) / 2}
              textAnchor="middle" fontSize={16} fontWeight={800} fill="#0284c7"
              stroke="#fff" strokeWidth={4} paintOrder="stroke"
            >
              {fr(p1, 0)}
            </text>
            <text
              x={(C.x + A.x) / 2 + 20} y={(C.y + A.y) / 2}
              textAnchor="middle" fontSize={16} fontWeight={800} fill="#d97706"
              stroke="#fff" strokeWidth={4} paintOrder="stroke"
            >
              {fr(p2, 0)}
            </text>
            <Dot p={A} color="#334155" r={7} />
          </>
        ) : (
          <>
            {/* Les deux barres couchées, et le trou entre elles. */}
            <Seg a={B} b={bout1} color="#0ea5e9" w={6} />
            <Seg a={C} b={bout2} color="#f59e0b" w={6} />
            <text x={(B.x + bout1.x) / 2} y={B.y - 16} textAnchor="middle" fontSize={16} fontWeight={800} fill="#0284c7">
              {fr(p1, 0)}
            </text>
            <text x={(C.x + bout2.x) / 2} y={B.y - 16} textAnchor="middle" fontSize={16} fontWeight={800} fill="#d97706">
              {fr(p2, 0)}
            </text>
            {ecart > 0 && (
              <>
                <Seg a={bout1} b={bout2} color="#dc2626" w={3} dash="7 5" />
                <text
                  x={(bout1.x + bout2.x) / 2} y={B.y - 42}
                  textAnchor="middle" fontSize={17} fontWeight={800} fill="#dc2626"
                  stroke="#fff" strokeWidth={4} paintOrder="stroke"
                >
                  il manque {fr(ecart, 1)}
                </text>
              </>
            )}
            <Dot p={bout1} color="#0284c7" r={6} />
            <Dot p={bout2} color="#d97706" r={6} />
          </>
        )}

        <Dot p={B} color="#334155" r={7} />
        <Dot p={C} color="#334155" r={7} />
      </GeoScene>

      <div className={`border-t-2 px-4 py-2.5 text-center text-sm font-bold ${diag.possible ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-orange-200 bg-orange-50 text-orange-800'}`}>
        {diag.possible ? (
          <>✓ {fr(grand, 0)} &lt; {fr(p1, 0)} + {fr(p2, 0)} = {fr(p1 + p2, 0)} — le triangle se ferme</>
        ) : diag.raison === 'plat' ? (
          <>✕ {fr(grand, 0)} = {fr(p1, 0)} + {fr(p2, 0)} — tout est aplati : c’est un segment, pas un triangle</>
        ) : (
          <>✕ {fr(grand, 0)} &gt; {fr(p1, 0)} + {fr(p2, 0)} = {fr(p1 + p2, 0)} — les deux côtés sont trop courts pour se rejoindre</>
        )}
      </div>
    </div>
  );
}

export { W as FERM_W, H as FERM_H };
