import React from 'react';
import GeoScene, { Dot, Poly, Seg } from '../../../../../common/geo5e/GeoScene';
import { triangleDe, diagnostiquerCotes, fr } from './triangles';

const W = 760;
const H = 430;
const U = 3.6;

/**
 * CompasLab — la construction au compas, étape par étape.
 *
 * `etape` va de 0 à 4 et rejoue exactement les gestes de la feuille :
 *   0 : rien ; 1 : le grand côté tracé ; 2 : le premier arc ;
 *   3 : le second arc ; 4 : le sommet marqué et le triangle fermé.
 *
 * LE SOMMET N'EST PAS PLACÉ À LA MAIN : il vient de `triangleDe` (testé), donc
 * de l'intersection réelle des deux cercles. Les arcs dessinés ont exactement
 * les rayons annoncés — un élève qui mesurerait à l'écran retrouverait ses
 * longueurs.
 */
export default function CompasLab({ a, b, c, etape, ariaLabel }) {
  const diag = diagnostiquerCotes(a, b, c);
  if (!diag.possible) return null;

  // a = BC (la base), c = AB, b = AC — la convention de triangleDe.
  const baseLen = a * U;
  const B = { x: (W - baseLen) / 2, y: 320 };
  const tri = triangleDe(a * U, b * U, c * U, B);
  const [A, B2, C] = tri;

  const rc = c * U;   // rayon depuis B
  const rb = b * U;   // rayon depuis C

  return (
    <div className="rounded-2xl border-2 border-emerald-200 bg-white overflow-hidden">
      <GeoScene
        width={W} height={H}
        labels={[
          ...(etape >= 1 ? [
            { id: 'B', text: 'B', anchor: B2, color: '#334155', size: 18 },
            { id: 'C', text: 'C', anchor: C, color: '#334155', size: 18 },
          ] : []),
          ...(etape >= 4 ? [{ id: 'A', text: 'A', anchor: A, color: '#334155', size: 18 }] : []),
        ]}
        obstacles={[]}
        ariaLabel={ariaLabel}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />

        {etape >= 1 && (
          <>
            <Seg a={B2} b={C} color="#334155" w={5} />
            <text x={(B2.x + C.x) / 2} y={B2.y + 30} textAnchor="middle" fontSize={16} fontWeight={800} fill="#334155">
              {fr(a, 0)} cm
            </text>
          </>
        )}

        {/* Les arcs : dessinés en entier au-dessus de la base, comme au compas. */}
        {etape >= 2 && (
          <circle
            cx={B2.x} cy={B2.y} r={rc}
            fill="none" stroke="#0ea5e9" strokeWidth={2.5} strokeDasharray="8 6"
            opacity={0.85}
          />
        )}
        {etape >= 3 && (
          <circle
            cx={C.x} cy={C.y} r={rb}
            fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="8 6"
            opacity={0.85}
          />
        )}

        {etape >= 4 && (
          <>
            <Poly pts={tri} fill="#10b981" stroke="#059669" fillOpacity={0.12} />
            <Dot p={A} color="#334155" r={7} />
          </>
        )}

        {etape >= 1 && (
          <>
            <Dot p={B2} color="#334155" r={7} />
            <Dot p={C} color="#334155" r={7} />
          </>
        )}
      </GeoScene>

      <div className="border-t-2 border-emerald-100 bg-emerald-50/60 px-4 py-2.5 text-center text-sm text-slate-700">
        {[
          'Prêt à construire un triangle de côtés ' + `${fr(a, 0)}, ${fr(b, 0)} et ${fr(c, 0)} cm.`,
          `1. On trace le plus grand côté : [BC] = ${fr(a, 0)} cm.`,
          `2. Compas ouvert à ${fr(c, 0)} cm, pointe sur B : on trace un arc.`,
          `3. Compas ouvert à ${fr(b, 0)} cm, pointe sur C : on trace un second arc.`,
          '4. Les deux arcs se croisent : c’est le sommet A. Le triangle est construit.',
        ][etape]}
      </div>
    </div>
  );
}

export { W as COMPAS_W, H as COMPAS_H };
