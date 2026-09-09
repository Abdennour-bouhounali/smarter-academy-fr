import React, { useState } from 'react';
import GeoScene, { Handle, Dot, Poly, Seg, dotObstacles } from '../../../../../common/geo5e/GeoScene';
import {
  CADRE, A_DEFAUT, B_DEFAUT, cercleCirconscrit, caracterisationRectangle,
  medianeVersAB, midpoint, dist, fr, arrondi,
} from './triangles4e';

/**
 * DetectiveLab — la manipulation SIGNATURE de la leçon (INTERACTION_PEDAGOGY §6bis).
 *
 * Activity              faire glisser le sommet C n'importe où dans le plan, et
 *                       regarder le cercle circonscrit se recalculer.
 * Mathematical objective un triangle est rectangle en C EXACTEMENT quand le
 *                       centre de son cercle circonscrit est le milieu de [AB]
 *                       — autrement dit quand [AB] est un diamètre.
 * Student action        glisser C, LIBREMENT. Aucun cercle imposé, aucun
 *                       aimant, aucune correction de position.
 * Controlled variable   la position de C, et elle seule. A et B sont fixes.
 * Mathematical state    les trois sommets. Le centre O, le rayon, l'angle en C
 *                       et l'écart |O − milieu| sont TOUS mesurés sur ces points.
 * Visual consequence    le cercle change de taille et de place ; le centre O se
 *                       déplace ; deux nombres bougent en continu.
 * Expected observation  « quand l'angle atteint 90°, le centre vient se poser
 *                       exactement sur le milieu de [AB] ».
 * Misconception targeted croire qu'une propriété « marche dans les deux sens »
 *                       sans qu'on ait rien à vérifier : ici, les deux verdicts
 *                       s'allument et s'éteignent ENSEMBLE, et c'est CE fait
 *                       qui mérite le nom de caractérisation.
 *
 * POURQUOI C EST LIBRE, ALORS QUE `pythagore-4e` LE CONTRAINT AU CERCLE.
 * Les deux leçons sœurs n'ont pas la même question. Chez Pythagore, l'angle
 * droit est une HYPOTHÈSE qu'il faut préserver pendant qu'on observe les aires :
 * le cercle est donc la contrainte, et elle est montrée. Ici, l'angle droit est
 * la CIBLE : le contraindre reviendrait à donner la réponse avant la question.
 * L'élève cherche, l'écart affiché lui dit s'il chauffe, et il trouve.
 *
 * LA CIBLE EST ATTEIGNABLE, ET C'EST TESTÉ. Un défi qu'on ne peut pas gagner
 * n'est pas un défi. `parcours.test.js` mesure la hauteur de la bande gagnante
 * (environ 5,5 unités) et vérifie que le PAS CLAVIER est plus petit qu'elle —
 * la première version, avec le pas de 12 des labos voisins, l'enjambait et
 * rendait le défi impossible au clavier. Voir le commentaire sur `onKeyDown`.
 *
 * SÉCURITÉ VISUELLE — LE PIÈGE PROPRE À CETTE FIGURE. Le rayon du cercle
 * circonscrit TEND VERS L'INFINI quand C s'approche de la droite (AB). Un
 * viewBox déduit naïvement du cercle entier deviendrait alors gigantesque, et
 * la figure disparaîtrait en un point. On englobe donc le cercle SEULEMENT
 * jusqu'à un rayon plafonné, et on cesse carrément de le dessiner au-delà :
 * il vaut mieux ne rien montrer qu'écraser la figure. Le test de sécurité
 * visuelle vérifie que le cadre contient toujours A, B, C, O quand O est
 * proche, et que son rapport d'aspect reste ≤ 3 à toute position atteignable.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement. Le labo reste vivant après
 * validation de l'étape.
 */

/**
 * Le rayon de la cible tactile, en unités de viewBox (≈ 47 px à 375 px de
 * large sur un cadre de 620 unités — au-dessus du minimum de 44 px du §17).
 */
const HIT_R = 68;

/**
 * LA CIBLE TACTILE NE DÉBORDE JAMAIS DU CADRE — et pourquoi il faut la borner.
 *
 * DÉFAUT ATTRAPÉ AU NAVIGATEUR (audit `domOverflow`). Le cadre de ce labo est
 * DÉDUIT du contenu : il se resserre quand le cercle circonscrit est petit. Le
 * disque invisible de 68 unités autour de C dépassait alors du SVG, donc de la
 * colonne principale — invisible à l'œil, mais bien réel : une partie de la
 * zone sensible tombait hors de l'écran, et l'audit de débordement du dépôt le
 * signalait.
 *
 * On borne donc le rayon à ce que le cadre peut contenir autour de la poignée,
 * sans jamais descendre sous le rayon visible de la pastille. La cible reste
 * la plus grande possible, et elle reste ENTIÈREMENT atteignable.
 */
function hitBorne(pDansCadre, vue, rVisible) {
  const marges = [
    pDansCadre.x, vue.w - pDansCadre.x,
    pDansCadre.y, vue.h - pDansCadre.y,
  ];
  return Math.max(rVisible + 6, Math.min(HIT_R, ...marges));
}

/** La marge du cadre déduit. */
export const MARGE = 30;

/**
 * Le rayon au-delà duquel on cesse d'agrandir le cadre pour suivre le cercle.
 * Deux fois [AB] : au-delà, l'arc visible est quasi rectiligne et le centre est
 * hors sujet — l'élève regarde l'angle, pas un cercle qui a fui l'écran.
 */
export const RAYON_MAX_CADRE = dist(A_DEFAUT, B_DEFAUT) * 2;

/**
 * Le cadre déduit du contenu — reproduit à l'identique par `parcours.test.js`.
 * Exporté pour que le test ne puisse pas diverger de ce qui est dessiné.
 */
export function vueDe(C, A = A_DEFAUT, B = B_DEFAUT) {
  const cercle = cercleCirconscrit(A, B, C);
  const pts = [A, B, C, midpoint(A, B)];
  if (cercle) {
    // Le centre n'entre dans le cadre que s'il est raisonnablement proche ; le
    // cercle n'y entre qu'à rayon plafonné (voir le doc-commentaire).
    const r = Math.min(cercle.rayon, RAYON_MAX_CADRE);
    if (dist(cercle.centre, midpoint(A, B)) <= RAYON_MAX_CADRE) {
      pts.push(cercle.centre);
      if (cercle.rayon <= RAYON_MAX_CADRE) {
        pts.push({ x: cercle.centre.x - r, y: cercle.centre.y - r });
        pts.push({ x: cercle.centre.x + r, y: cercle.centre.y + r });
      }
    }
  }
  const minX = Math.min(...pts.map((p) => p.x)) - MARGE;
  const maxX = Math.max(...pts.map((p) => p.x)) + MARGE;
  const minY = Math.min(...pts.map((p) => p.y)) - MARGE;
  const maxY = Math.max(...pts.map((p) => p.y)) + MARGE;
  /* GARDE DE RAPPORT D'ASPECT : on n'accepte jamais un cadre plus haut que
     large d'un facteur 3, ni l'inverse. Quand le contenu l'exige, on ÉLARGIT
     la dimension trop courte autour de son centre — jamais on ne rogne, ce qui
     ferait sortir un point du cadre. */
  let w = Math.max(1, maxX - minX);
  let h = Math.max(1, maxY - minY);
  let cx = (minX + maxX) / 2;
  let cy = (minY + maxY) / 2;
  if (h > w * 3) w = h / 3;
  if (w > h * 3) h = w / 3;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

/** L'identifiant du clip, stable : un seul labo est monté par étape. */
const CLIP_ID = 'tg4-detective-clip';

export default function DetectiveLab({
  C,
  onC,
  A = A_DEFAUT,
  B = B_DEFAUT,
  montrerCercle = true,
  montrerMediane = false,
  montrerEcart = true,
  tol,
}) {
  const [drag, setDrag] = useState(false);

  const k = caracterisationRectangle(A, B, C, tol);
  const cercle = k.cercle;
  const M = midpoint(A, B);
  const med = medianeVersAB(A, B, C, tol);
  const vue = vueDe(C, A, B);

  /** Point de la scène → point du cadre mesuré. */
  const d = (p) => ({ x: p.x - vue.x, y: p.y - vue.y });

  /**
   * Placer C. Aucune projection, aucun aimant : on borne seulement au cadre de
   * référence pour que le point ne puisse pas fuir hors de l'écran, et on
   * interdit la bande de 14 unités autour de (AB) — trois points alignés n'ont
   * pas de cercle circonscrit, et la figure n'aurait plus rien à montrer.
   */
  const placer = (p) => {
    if (!p) return;
    const x = Math.max(24, Math.min(CADRE.largeur - 24, p.x));
    const brut = Math.max(24, Math.min(CADRE.hauteur - 24, p.y));
    const y = brut > A.y - 14 ? A.y - 14 : brut;
    onC({ x, y });
  };

  // `setPointerCapture` n'est pas optionnel : sans lui, le glissement se fige
  // au premier pixel dès que le pointeur quitte la poignée (piège documenté).
  const onDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
  };

  const proche = cercle && dist(cercle.centre, M) <= RAYON_MAX_CADRE;
  const cercleDessinable = cercle && cercle.rayon <= RAYON_MAX_CADRE * 1.6;

  return (
    <div className="space-y-3" role="group" aria-label="Triangle ABC et son cercle circonscrit">
      <GeoScene
        width={vue.w}
        height={vue.h}
        ariaLabel="Triangle ABC, son cercle circonscrit et le centre de ce cercle"
        onPointerMove={(p) => { if (drag) placer(p ? { x: p.x + vue.x, y: p.y + vue.y } : null); }}
        onPointerUp={() => setDrag(false)}
        labels={[
          { id: 'A', text: 'A', anchor: d(A), color: '#0f172a', size: 17, priority: true },
          { id: 'B', text: 'B', anchor: d(B), color: '#0f172a', size: 17, priority: true },
          { id: 'C', text: 'C', anchor: d(C), color: '#0f172a', size: 17, priority: true },
          ...(montrerCercle && proche
            ? [{ id: 'O', text: 'O', anchor: d(cercle.centre), color: '#dc2626', size: 16 }]
            : []),
          { id: 'M', text: 'M', anchor: d(M), color: '#0891b2', size: 15 },
        ]}
        obstacles={dotObstacles(
          [d(A), d(B), d(C), d(M), ...(montrerCercle && proche ? [d(cercle.centre)] : [])],
          16,
        )}
      >
        {/* Le cercle circonscrit.
            DEUX BORNES, et deux raisons différentes :
            · `cercleDessinable` cesse de le tracer quand son rayon explose —
              un arc quasi rectiligne d'un cercle enfui n'apprend rien ;
            · le `clipPath` empêche le tracé de sortir du cadre. Sans lui, le
              cercle débordait de la colonne principale dès que le cadre se
              resserrait (défaut attrapé par l'audit `domOverflow`). On le
              ROGNE plutôt que d'élargir le cadre : élargir rapetisserait la
              figure, alors que la partie utile du cercle est celle qui passe
              par A, B et C — et elle, elle est toujours dans le cadre. */}
        <defs>
          <clipPath id={CLIP_ID}>
            <rect x={0} y={0} width={vue.w} height={vue.h} />
          </clipPath>
        </defs>
        {montrerCercle && cercleDessinable && (
          <circle
            cx={d(cercle.centre).x}
            cy={d(cercle.centre).y}
            r={cercle.rayon}
            fill="none"
            stroke={k.droit ? '#059669' : '#94a3b8'}
            strokeWidth={2.5}
            strokeDasharray={k.droit ? undefined : '6 5'}
            clipPath={`url(#${CLIP_ID})`}
          />
        )}

        {/* Le triangle. */}
        <Poly pts={[A, B, C].map(d)} fill="#f8fafc" fillOpacity={0.92} stroke="#0f172a" w={2.5} />

        {/* La médiane vers le milieu de [AB], quand la leçon la demande. */}
        {montrerMediane && (
          <Seg a={d(C)} b={d(M)} color="#7c3aed" w={2.5} dash="7 5" />
        )}

        {/* Le trait qui relie le centre au milieu : c'est l'ÉCART, dessiné.
            Il disparaît quand il tombe à zéro — le geste de la découverte. */}
        {montrerCercle && proche && !k.centreSurMilieu && (
          <Seg a={d(cercle.centre)} b={d(M)} color="#dc2626" w={2} dash="4 4" />
        )}

        {/* La marque d'angle droit, dessinée SEULEMENT quand il l'est. */}
        {k.droit && (() => {
          const u = { x: (A.x - C.x) / dist(C, A), y: (A.y - C.y) / dist(C, A) };
          const v = { x: (B.x - C.x) / dist(C, B), y: (B.y - C.y) / dist(C, B) };
          const t = 17;
          return (
            <polyline
              points={[
                d({ x: C.x + u.x * t, y: C.y + u.y * t }),
                d({ x: C.x + (u.x + v.x) * t, y: C.y + (u.y + v.y) * t }),
                d({ x: C.x + v.x * t, y: C.y + v.y * t }),
              ].map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none" stroke="#059669" strokeWidth={2.5}
            />
          );
        })()}

        <Dot p={d(A)} color="#0f172a" r={5} />
        <Dot p={d(B)} color="#0f172a" r={5} />
        <Dot p={d(M)} color="#0891b2" r={5} />
        {montrerCercle && proche && <Dot p={d(cercle.centre)} color="#dc2626" r={5} />}
        <Handle
          p={d(C)}
          color="#b45309"
          r={11}
          hitR={hitBorne(d(C), vue, 11)}
          dragging={drag}
          label="Sommet C — fais-le glisser"
          onPointerDown={onDown}
          /* LE PAS CLAVIER VAUT 4, ET C'EST MESURÉ — pas choisi.
             DÉFAUT RÉEL, ATTRAPÉ PAR LE TEST D'ATTEIGNABILITÉ. La première
             version reprenait le pas de 12 unités des labos voisins. Or la
             bande de positions où l'angle est déclaré droit ne fait qu'environ
             5,5 unités de haut : un pas de 12 l'ENJAMBE. L'angle passait de
             97,7° à 92,4° puis 87,5° — un élève au clavier ne pouvait JAMAIS
             gagner le défi, alors que le même défi se gagne à la souris.
             Le chemin clavier est une manipulation aussi (§27) : le pas est
             donc plus fin que la cible, et `parcours.test.js` le vérifie en
             comparant les deux nombres. */
          onKeyDown={(e) => {
            const pas = 4;
            const map = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] };
            const v = map[e.key];
            if (!v) return;
            e.preventDefault();
            placer({ x: C.x + v[0], y: C.y + v[1] });
          }}
        />
      </GeoScene>

      {/* Les lectures, dans le DOM — jamais en texte SVG. */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`rounded-2xl border-2 p-2.5 text-center ${
          k.droit ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
        }`}>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Angle en C
          </div>
          <div className={`font-mono text-xl font-black tabular-nums ${
            k.droit ? 'text-emerald-700' : 'text-slate-800'
          }`} data-lab="angle-c">
            {fr(arrondi(k.angleC, 1), 1)}°
          </div>
          <div className={`text-xs font-semibold ${
            k.droit ? 'text-emerald-700' : k.angleC > 90 ? 'text-rose-600' : 'text-sky-600'
          }`}>
            {k.nature}
          </div>
        </div>

        {montrerEcart && (
          <div className={`rounded-2xl border-2 p-2.5 text-center ${
            k.centreSurMilieu ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
          }`}>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Distance O — M
            </div>
            <div className={`font-mono text-xl font-black tabular-nums ${
              k.centreSurMilieu ? 'text-emerald-700' : 'text-slate-800'
            }`} data-lab="ecart-om">
              {cercle ? fr(arrondi(cercle.ecartAuMilieu / 10, 1), 1) : '—'}
            </div>
            <div className="text-xs font-semibold text-slate-500">
              {k.centreSurMilieu ? 'O est sur M' : 'unités'}
            </div>
          </div>
        )}

        {montrerMediane && (
          <div className={`rounded-2xl border-2 p-2.5 text-center ${
            med.estLaMoitie ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-white'
          }`}>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              CM ÷ AB
            </div>
            <div className="font-mono text-xl font-black tabular-nums text-slate-800" data-lab="rapport-cm">
              {med.rapport === null ? '—' : fr(arrondi(med.rapport, 2), 2)}
            </div>
            <div className="text-xs font-semibold text-slate-500">
              {med.estLaMoitie ? 'exactement la moitié' : 'pas la moitié'}
            </div>
          </div>
        )}
      </div>

      {/* Le verdict de la caractérisation : les deux témoins, ensemble. */}
      <div className={`rounded-2xl border-2 p-3 text-center ${
        k.droit && k.centreSurMilieu ? 'border-emerald-300 bg-emerald-50' : 'border-amber-200 bg-amber-50'
      }`}>
        <p className={`text-sm font-semibold ${
          k.droit && k.centreSurMilieu ? 'text-emerald-800' : 'text-amber-900'
        }`}>
          {k.droit && k.centreSurMilieu
            ? 'Angle droit en C, et O posé sur M : les deux témoins sont d’accord.'
            : k.droit !== k.centreSurMilieu
              ? 'Les deux témoins se contredisent — regarde de plus près.'
              : `L’angle en C n’est pas droit, et O n’est pas sur M. Continue de chercher.`}
        </p>
      </div>
    </div>
  );
}

export { HIT_R };
