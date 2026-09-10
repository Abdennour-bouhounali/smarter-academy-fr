import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { EXP, tangenteEn, tangenteEnZero, eq, fr, affiche } from './expoUtils';

/**
 * LaboExponentielle — la courbe de exp, avec un point de contact QUI SE SAISIT.
 *
 * Activity               l'élève ATTRAPE le point de contact posé sur la courbe
 *                        et le FAIT GLISSER (règle utilisateur « le glisser
 *                        d'abord ») ; la tangente le suit, et les deux nombres
 *                        du point — son ordonnée et sa pente — s'affichent côte
 *                        à côte. Ils sont TOUJOURS égaux : c'est la propriété
 *                        caractéristique, relue sur le dessin.
 * Mathematical objective f′ = f se VOIT : en tout point, la pente lue est
 *                        l'ordonnée lue. Et comme cette ordonnée est toujours
 *                        strictement positive, la tangente monte partout.
 * Student action         saisir le point et le tirer le long de la courbe.
 * Controlled variable    l'abscisse a du point de contact.
 * Mathematical state     { a } ; ordonnée, pente, tangente en sont dérivées.
 * Visual consequence     la tangente pivote, et ne devient JAMAIS horizontale.
 * Expected observation   « la pente et la hauteur affichent le même nombre, et
 *                        il n'est jamais négatif ni nul ».
 * Misconception targeted « une fonction toujours croissante doit bien finir par
 *                        s'aplatir » ; « la tangente en 0 a pour équation y = x ».
 *
 * L'ÉLÈVE NE DÉPLACE QUE L'ABSCISSE. `CoordPlane` rend un point librement
 * déplaçable dans le plan ; ici l'ordonnée est REPROJETÉE sur la courbe à
 * chaque mouvement, de sorte que le point ne quitte jamais le tracé — le geste
 * reste « je fais courir le point le long de la courbe ».
 *
 * CIBLE ATTEIGNABLE : le pas d'aimantation est 0,25 en x, ce qui met 0 — le
 * point de contact dont parle la tangente remarquable — exactement sur un cran
 * depuis n'importe quelle position. Vérifié par test.
 *
 * JAMAIS GELÉ : `draggableId` n'est annulé que par le verrou d'ANTÉRIORITÉ,
 * jamais par la réussite de l'étape (la forme `draggableId={done ? null : …}`
 * est proscrite au même titre que `disabled={done}`).
 */
const COURBE = '#4f46e5';
const TANGENTE = '#e11d48';
const POINT = '#d97706';

/** Le pas d'aimantation du point de contact. 0 tombe pile sur un cran. */
export const PAS_CONTACT = 0.25;

export default function LaboExponentielle({
  a,
  onChangeA,
  montrerTangente = true,
  montrerTangenteZero = false,
  verrouille = false,
}) {
  const fa = EXP.f(a);
  const tan = tangenteEn(a);
  const t0 = tangenteEnZero();

  const droites = [];
  if (montrerTangente) droites.push({ id: 'tan', a: tan.a, b: tan.b, tone: TANGENTE, label: 'tangente au point' });
  if (montrerTangenteZero) droites.push({ id: 'tan0', a: t0.a, b: t0.b, tone: '#0284c7', dashed: true, label: 'tangente en 0' });

  return (
    <div className="space-y-3">
      <CoordPlane
        range={EXP.range}
        unit={EXP.unit}
        unitY={EXP.unitY}
        xStep={PAS_CONTACT}
        yStep={1}
        labelEvery={4}
        step={{ x: PAS_CONTACT, y: 0.01 }}
        curves={[{ id: 'exp', points: echantillon(), tone: COURBE, width: 3 }]}
        functions={droites}
        points={[{ id: 'M', x: a, y: fa, color: POINT }]}
        // Le point suit le doigt en ABSCISSE, et son ordonnée est reprojetée
        // sur la courbe : il ne peut donc jamais en décoller.
        draggableId={verrouille ? null : 'M'}
        onPointChange={(p) => onChangeA?.(p.x)}
        caption={false}
        ariaLabel={
          `Courbe de la fonction exponentielle. Point de contact à l’abscisse ${fr(a)}, ` +
          `d’ordonnée ${fr(affiche(fa))}. La pente de la tangente y vaut ${fr(affiche(fa))}. ` +
          `Fais glisser le point, ou utilise les flèches gauche et droite.`
        }
      />

      {/* La légende des droites, en DOM : la tangente au point et celle en 0
          peuvent se confondre quand a s'approche de 0, et deux étiquettes
          posées dans le SVG s'y chevaucheraient. */}
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: POINT }} aria-hidden="true" />
          <strong>M</strong> ({fr(a)} ; {fr(affiche(fa))})
        </span>
        {montrerTangente && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5" style={{ background: TANGENTE }} aria-hidden="true" />
            tangente en M
          </span>
        )}
        {montrerTangenteZero && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5" style={{ background: '#0284c7' }} aria-hidden="true" />
            tangente en 0 : <strong>{eq(t0)}</strong>
          </span>
        )}
      </div>

      {/* LES DEUX NOMBRES DU POINT, CÔTE À CÔTE. C'est la disposition qui fait
          la découverte : ils portent toujours la même valeur. */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">abscisse</div>
          <div className="font-mono font-bold tabular-nums text-slate-900">{fr(a)}</div>
        </div>
        <div className="rounded-lg border-2 border-indigo-300 bg-indigo-50 px-2 py-2">
          <div className="text-[13px] text-indigo-700">ordonnée exp({fr(a)})</div>
          <div className="font-mono font-black tabular-nums text-indigo-900">{fr(affiche(fa))}</div>
        </div>
        <div className="rounded-lg border-2 border-rose-300 bg-rose-50 px-2 py-2">
          <div className="text-[13px] text-rose-700">pente de la tangente</div>
          <div className="font-mono font-black tabular-nums text-rose-900">{fr(affiche(EXP.fPrime(a)))}</div>
        </div>
      </div>
    </div>
  );
}

/** La courbe échantillonnée, COUPÉE au cadre — aucun tracé ne déborde. */
function echantillon() {
  const pts = [];
  const { xMin, xMax, yMin, yMax } = EXP.range;
  const n = 200;
  for (let i = 0; i <= n; i += 1) {
    const x = xMin + ((xMax - xMin) * i) / n;
    const y = EXP.f(x);
    if (y >= yMin && y <= yMax) pts.push({ x, y });
  }
  return pts;
}
