import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import MathText from '../../../../../common/components/MathText';
import { formatDec, roundTo } from '@smarter-academy/core';
import { affineFromTwoPoints, slopeBetween, formatAffine } from './affineUtils';

/**
 * SlopeFromTwoPoints — le triangle qui donne le coefficient.
 *
 * Activity            déplacer A et B, et lire a sur les deux côtés du triangle.
 * Mathematical objective  a = Δy / Δx : le coefficient est un RAPPORT entre un
 *                     déplacement horizontal et un déplacement vertical, pas un
 *                     nombre lu quelque part.
 * Student action      choisir le point actif (deux pastilles), puis le déplacer
 *                     au doigt ou aux flèches.
 * Controlled variable la position de A ou de B, au pas de 1.
 * Mathematical state  { A, B } — le triangle, l'expression et la droite en
 *                     dérivent ; `affineFromTwoPoints` fait foi.
 * Visual consequence  le côté horizontal porte Δx, le vertical Δy ; la droite
 *                     passe par les deux points et se prolonge jusqu'au cadre.
 * Expected observation « si j'avance de 1 et que je monte de 2, a vaut 2 ».
 * Misconception targeted  lire a comme une ordonnée ; inverser Δy/Δx ; croire
 *                     qu'une droite existe toujours (abscisses égales).
 * Feedback            l'expression se réécrit à chaque déplacement ; le cas
 *                     impossible est nommé au lieu d'être masqué.
 * Formalization       la formule a = Δy/Δx apparaît sous le triangle.
 * Scaffolding         un point mobile d'abord, puis les deux.
 * Transfer            le module 6 applique la méthode à deux factures.
 *
 * CAS LIMITES TRAITÉS (règle de sécurité d'affichage §17bis) :
 *  - Δx = 0 : aucune fonction, triangle masqué, message explicite.
 *  - A = B : idem, plus « les deux points sont confondus ».
 *  - |Δy| petit : l'étiquette Δy se décale à droite du côté vertical pour ne
 *    pas chevaucher celle de Δx.
 *  - a non décimal court : on affiche la fraction Δy/Δx plutôt qu'un décimal
 *    illisible.
 */

const RANGE = { xMin: -5, xMax: 5, yMin: -6, yMax: 6 };

export default function SlopeFromTwoPoints({
  A,
  B,
  active = 'A',
  onActiveChange,
  onPointChange,
  showTriangle = true,
  showExpression = true,
  disabled = false,
  frozen = false,
  range = RANGE,
}) {
  const locked = disabled || frozen;
  const dx = roundTo(B.x - A.x, 6);
  const dy = roundTo(B.y - A.y, 6);
  const samePoint = dx === 0 && dy === 0;
  const vertical = dx === 0 && !samePoint;
  const f = vertical || samePoint ? null : affineFromTwoPoints(A, B);
  const a = f ? f.a : null;

  // Un coefficient qui ne tombe pas juste s'écrit en fraction : « 0,333… »
  // n'apprend rien, « 1/3 » se lit.
  const aReadsWell = a !== null && roundTo(a, 2) === a;

  const corner = { x: B.x, y: A.y };
  const segments = showTriangle && f
    ? [
        { id: 'dx', from: A, to: corner, color: '#059669', width: 2.5, label: `Δx = ${formatDec(dx)}` },
        { id: 'dy', from: corner, to: B, color: '#e11d48', width: 2.5, label: `Δy = ${formatDec(dy)}` },
      ]
    : [];

  return (
    <div className="space-y-3">
      {showExpression && (
        <div className="text-center py-2.5 px-3 rounded-xl bg-slate-900 text-white">
          {f ? (
            <MathText>{`$${formatAffine(f.a, f.b)}$`}</MathText>
          ) : (
            <span className="text-sm font-semibold">
              {samePoint ? 'A et B sont confondus : aucune droite' : 'Même abscisse : aucune fonction ne convient'}
            </span>
          )}
        </div>
      )}

      <CoordPlane
        range={range}
        unit={30}
        points={[
          { id: 'A', name: 'A', x: A.x, y: A.y, color: active === 'A' ? '#4f46e5' : '#94a3b8' },
          { id: 'B', name: 'B', x: B.x, y: B.y, color: active === 'B' ? '#4f46e5' : '#94a3b8' },
        ]}
        draggableId={locked ? null : active}
        onPointChange={(p) => onPointChange?.(active, p)}
        segments={segments}
        functions={f ? [{ id: 'd', a: f.a, b: f.b, tone: 'indigo', dashed: true }] : []}
        frozen={frozen}
        disabled={locked}
        caption={false}
        ariaLabel={
          f
            ? `Repère : droite passant par A et B, coefficient ${formatDec(a)}`
            : 'Repère : A et B ne définissent aucune fonction'
        }
      />

      {!frozen && (
        <div className="flex gap-2">
          {['A', 'B'].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onActiveChange?.(id)}
              disabled={locked}
              aria-pressed={active === id}
              className={`flex-1 min-h-[44px] rounded-xl border-2 font-bold transition disabled:opacity-50
                focus-visible:ring-2 focus-visible:ring-blue-500
                ${active === id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'}`}
              style={{ touchAction: 'manipulation' }}
            >
              Déplacer {id}
            </button>
          ))}
        </div>
      )}

      {/* Le calcul, en toutes lettres, sous le triangle. */}
      {f && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
          <MathText>
            {aReadsWell
              ? `$a = \\dfrac{\\Delta y}{\\Delta x} = \\dfrac{${formatDec(dy)}}{${formatDec(dx)}} = ${formatDec(a)}$`
              : `$a = \\dfrac{\\Delta y}{\\Delta x} = \\dfrac{${formatDec(dy)}}{${formatDec(dx)}}$`}
          </MathText>
        </div>
      )}
    </div>
  );
}
