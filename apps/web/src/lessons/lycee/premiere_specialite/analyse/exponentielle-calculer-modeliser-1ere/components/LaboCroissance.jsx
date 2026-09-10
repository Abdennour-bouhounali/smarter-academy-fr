import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import {
  PAS_EXPO, valeurAffichee, fr, justifieParCroissance,
  CADRE_CROISSANCE, borneHauteCroissance, aimanteCroissance,
} from './reglesExpoUtils';

/**
 * LaboCroissance — la courbe de exp, avec DEUX repères de hauteur dont l'un se
 * SAISIT et se fait glisser le long de la courbe.
 *
 * Activity               un point M se saisit et court le long de la courbe ;
 *                        un second point, N, est fixé à une hauteur cible.
 *                        L'élève cherche à faire coïncider les deux hauteurs, et
 *                        constate qu'UNE SEULE abscisse y parvient.
 * Mathematical objective e^u = e^v ⟺ u = v. La courbe étant strictement
 *                        croissante, elle ne repasse JAMAIS deux fois par la
 *                        même hauteur : une hauteur donnée ne peut venir que
 *                        d'un seul exposant.
 * Student action         SAISIR le point M et le tirer (règle utilisateur « le
 *                        glisser d'abord ») ; `CoordPlane` fournit le geste, le
 *                        pointer capture, l'aimantation et le chemin clavier.
 * Controlled variable    l'abscisse de M.
 * Mathematical state     { u, v } ; hauteurs et verdict d'ordre en sont dérivés
 *                        (`justifieParCroissance`).
 * Visual consequence     les deux traits horizontaux se rapprochent, et ne
 *                        peuvent coïncider qu'en un point.
 * Expected observation   « il n'y a qu'un seul endroit où les deux hauteurs sont
 *                        les mêmes ».
 * Misconception targeted « une équation exponentielle peut avoir deux
 *                        solutions, comme une équation du second degré ».
 *
 * L'ÉLÈVE NE DÉPLACE QUE L'ABSCISSE : `CoordPlane` rend un point librement
 * déplaçable, et l'ordonnée est REPROJETÉE sur la courbe par le module — le
 * point ne quitte donc jamais le tracé.
 *
 * CIBLE ATTEIGNABLE : le pas d'aimantation est celui de la leçon (0,25), donc
 * toute cible entière ou demi-entière tombe pile sur un cran. Vérifié par test.
 *
 * LE POINT NE SORT JAMAIS DU CADRE — défaut attrapé avant l'écriture du module.
 * L'ordonnée de M vaut e^x, et un premier cadrage laissait glisser jusqu'à 2,5,
 * où e^2,5 ≈ 12,18 pour un cadre s'arrêtant à 9 : la poignée disparaissait sous
 * le doigt. La borne haute est désormais CALCULÉE (`borneHauteCroissance`) et
 * l'aimantation l'applique ; un test balaie tous les crans de l'intervalle.
 *
 * JAMAIS GELÉ : `draggableId` n'est annulé que par le verrou d'ANTÉRIORITÉ,
 * jamais par la réussite (la forme `draggableId={done ? null : …}` est proscrite
 * au même titre que `disabled={done}`).
 */
const COURBE = '#4f46e5';
const M_COULEUR = '#d97706';
const N_COULEUR = '#e11d48';

/** Le cadre, DÉRIVÉ du modèle : assez haut pour e², assez large pour montrer la
    platitude à gauche. La borne haute du glisser en découle. */
export const CADRE = CADRE_CROISSANCE;
export const BORNE_HAUTE = borneHauteCroissance();

export default function LaboCroissance({ u, v, onChangeU, verrouille = false }) {
  const eu = Math.exp(u);
  const ev = Math.exp(v);
  const verdict = justifieParCroissance(u, v);

  return (
    <div className="space-y-3">
      <CoordPlane
        range={CADRE}
        unit={52}
        unitY={32}
        xStep={PAS_EXPO}
        yStep={1}
        labelEvery={4}
        step={{ x: PAS_EXPO, y: 0.01 }}
        curves={[{ id: 'exp', points: echantillon(), tone: COURBE, width: 3 }]}
        // Les deux hauteurs comparées, en traits horizontaux : c'est leur
        // écart qui porte toute l'information.
        functions={[
          { id: 'hv', a: 0, b: ev, tone: N_COULEUR, dashed: true },
          { id: 'hu', a: 0, b: eu, tone: M_COULEUR, dashed: true },
        ]}
        points={[
          { id: 'M', x: u, y: eu, color: M_COULEUR },
          { id: 'N', x: v, y: ev, color: N_COULEUR },
        ]}
        draggableId={verrouille ? null : 'M'}
        // L'abscisse est RE-AIMANTÉE et BORNÉE par le modèle : le point ne
        // peut donc jamais monter au-delà de ce que le cadre sait montrer.
        onPointChange={(p) => onChangeU?.(aimanteCroissance(p.x))}
        caption={false}
        ariaLabel={
          `Courbe de la fonction exponentielle. Le point M, déplaçable, est à l’abscisse ${fr(u)} ` +
          `et à la hauteur ${valeurAffichee(eu)}. Le point N est fixé à l’abscisse ${fr(v)} ` +
          `et à la hauteur ${valeurAffichee(ev)}. ` +
          (verdict.ordre === '=' ? 'Les deux hauteurs coïncident.' : `La hauteur de M est ${verdict.ordre === '<' ? 'inférieure' : 'supérieure'} à celle de N.`) +
          ' Fais glisser M, ou utilise les flèches gauche et droite.'
        }
      />

      {/* LA LÉGENDE ET LES NOMBRES, EN DOM : les deux points peuvent se
          superposer exactement, et deux étiquettes posées dans le SVG s'y
          chevaucheraient. */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg border-2 px-2 py-2" style={{ borderColor: M_COULEUR }}>
          <div className="text-[13px]" style={{ color: M_COULEUR }}>M : exposant {fr(u)}</div>
          <div className="font-mono font-black tabular-nums text-slate-900">{valeurAffichee(eu)}</div>
        </div>
        <div className="rounded-lg border-2 px-2 py-2" style={{ borderColor: N_COULEUR }}>
          <div className="text-[13px]" style={{ color: N_COULEUR }}>N : exposant {fr(v)}</div>
          <div className="font-mono font-black tabular-nums text-slate-900">{valeurAffichee(ev)}</div>
        </div>
      </div>

      <div
        className={
          'rounded-xl border-2 px-3 py-2.5 text-center text-sm font-semibold ' +
          (verdict.ordre === '='
            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
            : 'border-slate-200 bg-white text-slate-700')
        }
      >
        {verdict.ordre === '=' ? (
          <>
            Les deux hauteurs sont égales — et les deux exposants aussi : {fr(u)} = {fr(v)}.
          </>
        ) : (
          <>
            exposants : {fr(u)} {verdict.ordre} {fr(v)} &nbsp;·&nbsp; hauteurs : {valeurAffichee(eu)}{' '}
            {verdict.ordre} {valeurAffichee(ev)} — le même sens des deux côtés
          </>
        )}
      </div>
    </div>
  );
}

/** La courbe échantillonnée, COUPÉE au cadre — aucun tracé ne déborde. */
function echantillon() {
  const pts = [];
  const n = 240;
  for (let i = 0; i <= n; i += 1) {
    const x = CADRE.xMin + ((CADRE.xMax - CADRE.xMin) * i) / n;
    const y = Math.exp(x);
    if (y >= CADRE.yMin && y <= CADRE.yMax) pts.push({ x, y });
  }
  return pts;
}
