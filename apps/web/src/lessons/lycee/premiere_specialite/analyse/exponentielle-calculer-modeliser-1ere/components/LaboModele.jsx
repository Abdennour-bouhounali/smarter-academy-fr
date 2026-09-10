import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import {
  modele, courbeDuModele, cadreDuModele, facteurParPas, valeurAffichee, fr, arrondi,
} from './reglesExpoUtils';

/**
 * LaboModele — une situation réelle modélisée par A·e^{kt}, avec un point de
 * lecture QUI SE SAISIT.
 *
 * Activity               l'élève ATTRAPE le point de lecture posé sur la courbe
 *                        et le FAIT GLISSER le long du temps. À chaque position,
 *                        un tableau montre la valeur lue ET le quotient de cette
 *                        valeur par celle du pas précédent — quotient qui ne
 *                        bouge JAMAIS.
 * Mathematical objective f(t+1)/f(t) = e^k, constant : c'est la règle du
 *                        quotient qui le dit, et c'est la signature d'un modèle
 *                        exponentiel.
 * Student action         saisir le point et le tirer le long de la courbe.
 * Controlled variable    l'instant t du point de lecture.
 * Mathematical state     { situation, t } ; valeur, facteur, cadre et courbe en
 *                        sont dérivés (`reglesExpoUtils`).
 * Visual consequence     la courbe s'emballe (ou s'aplatit) tandis que le
 *                        facteur affiché reste rigoureusement le même.
 * Expected observation   « la valeur change tout le temps, le facteur jamais ».
 * Misconception targeted « une croissance exponentielle ajoute la même chose à
 *                        chaque pas » ; « une décroissance finit par atteindre
 *                        zéro ».
 *
 * LE CADRE EST DÉRIVÉ de la situation (`cadreDuModele`), et le test balaie la
 * courbe entière : aucune situation, même ajoutée plus tard, ne peut produire
 * un tracé qui déborde.
 *
 * CIBLE ATTEIGNABLE : le pas d'aimantation est 1 unité de temps — l'instant que
 * les questions désignent (« au bout de 3 heures ») tombe donc pile sur un cran.
 *
 * JAMAIS GELÉ : `draggableId` n'est annulé que par le verrou d'ANTÉRIORITÉ.
 */
const COURBE = '#4f46e5';
const POINT = '#d97706';

/** Le pas d'aimantation du point de lecture : une unité de temps entière. */
export const PAS_TEMPS = 1;

export default function LaboModele({ situation, t, onChangeT, verrouille = false }) {
  const f = modele(situation.A, situation.k);
  const cadre = cadreDuModele(situation);
  const valeur = f(t);
  const facteur = facteurParPas(situation.k);
  // Le quotient RÉELLEMENT lu entre l'instant courant et le précédent : il vaut
  // e^k, et le test le prouve constant. On ne l'écrit pas à la main.
  const precedent = t >= PAS_TEMPS ? f(t - PAS_TEMPS) : null;
  const quotientLu = precedent === null ? null : valeur / precedent;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2">
        <div className="text-[13px] font-semibold text-amber-900">{situation.titre}</div>
        <div className="text-[13px] text-amber-800">
          f(t) = {fr(situation.A)} × e<sup>{fr(situation.k)}t</sup>, où t est en {situation.unite}s et
          f(t) en {situation.grandeur}
        </div>
      </div>

      <CoordPlane
        range={cadre}
        unit={Math.max(14, Math.round(360 / (cadre.xMax - cadre.xMin)))}
        unitY={Math.max(1.2, 240 / (cadre.yMax - cadre.yMin))}
        xStep={PAS_TEMPS}
        yStep={Math.max(1, Math.round(cadre.yMax / 10))}
        labelEvery={cadre.xMax > 12 ? 4 : 2}
        step={{ x: PAS_TEMPS, y: 0.01 }}
        curves={[{ id: 'modele', points: courbeDuModele(situation), tone: COURBE, width: 3 }]}
        points={[{ id: 'L', x: t, y: valeur, color: POINT }]}
        draggableId={verrouille ? null : 'L'}
        // L'ordonnée est REPROJETÉE sur la courbe : le point ne peut jamais en
        // décoller, et l'abscisse est bornée par le cadre lui-même.
        onPointChange={(p) => onChangeT?.(Math.max(cadre.xMin, Math.min(cadre.xMax, Math.round(p.x))))}
        caption={false}
        axisLabels={{ x: 't', y: 'f(t)' }}
        ariaLabel={
          `${situation.titre}. Point de lecture à t = ${fr(t)} ${situation.unite}s, ` +
          `où la valeur est ${valeurAffichee(valeur)} ${situation.grandeur}. ` +
          `Fais glisser le point, ou utilise les flèches gauche et droite.`
        }
      />

      {/* LES NOMBRES, EN DOM : la valeur lue, et le facteur d'un pas au suivant. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">instant t</div>
          <div className="font-mono font-bold tabular-nums text-slate-900">{fr(t)}</div>
        </div>
        <div className="rounded-lg border-2 border-indigo-300 bg-indigo-50 px-2 py-2">
          <div className="text-[13px] text-indigo-700">valeur f({fr(t)})</div>
          <div className="font-mono font-black tabular-nums text-indigo-900">
            {fr(arrondi(valeur, 2))}
          </div>
        </div>
        <div className="rounded-lg border-2 border-rose-300 bg-rose-50 px-2 py-2">
          <div className="text-[13px] text-rose-700">f(t) ÷ f(t − 1)</div>
          <div className="font-mono font-black tabular-nums text-rose-900">
            {quotientLu === null ? '—' : valeurAffichee(quotientLu)}
          </div>
          <div className="text-[13px] text-rose-600">
            {quotientLu === null ? 'avance d’un pas pour le lire' : `toujours e^${fr(situation.k)} ≈ ${valeurAffichee(facteur)}`}
          </div>
        </div>
      </div>

      {/* LE CONTRE-MODÈLE, EN CHIFFRES : l'écart d'un pas au suivant, lui, ne
          cesse de changer — c'est ce qui distingue le modèle d'une fonction
          affine. */}
      {precedent !== null && (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-600">
          Écart sur ce pas : <strong>{fr(arrondi(valeur - precedent, 2))}</strong>. Déplace le point
          et compare — l’écart change à chaque pas, alors que le facteur, lui, ne bouge pas d’un
          millième.
        </div>
      )}
    </div>
  );
}
