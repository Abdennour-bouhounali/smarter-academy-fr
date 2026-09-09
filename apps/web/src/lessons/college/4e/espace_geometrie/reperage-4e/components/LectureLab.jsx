import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { lirePoint, fr } from './reperage4e';

/**
 * LectureLab — lire un point dont les coordonnées ne sont pas des entiers.
 *
 * Activity              déplacer un point dans un repère de pas 0,5 et lire
 *                       ce qu'il vaut.
 * Mathematical objective une coordonnée n'est pas un NOMBRE DE GRADUATIONS :
 *                       c'est ce nombre MULTIPLIÉ par le pas. Tant que le pas
 *                       valait 1, les deux se confondaient — et c'est ce qui
 *                       rend l'erreur si tenace.
 * Student action        glisser le point, ou le déplacer aux flèches.
 * Controlled variable   la position du point.
 * Mathematical state    le couple (x ; y). Le compte de graduations et la
 *                       valeur sont tous deux calculés par `lirePoint`.
 * Visual consequence    les deux lectures s'affichent côte à côte et
 *                       DIVERGENT — c'est toute la démonstration.
 * Expected observation  « 3 graduations, mais 1,5 : ce n'est pas la même
 *                       chose ».
 * Misconception targeted compter les carreaux et annoncer le compte.
 *
 * SÉCURITÉ VISUELLE : les deux lectures sont dans le DOM. Le nombre de
 * décimales affiché est celui que le pas IMPOSE (`lirePoint`), jamais un
 * arrondi de confort : afficher « 2 » sous un point posé en 1,5 ferait croire
 * à l'élève que son point est mal placé alors qu'il est juste.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */
export default function LectureLab({
  repere,
  point,
  onPoint,
  /** Points de décor, non déplaçables. */
  reperes = [],
  ariaLabel = 'Lire un point entre les graduations',
  montrerGraduations = true,
}) {
  const l = lirePoint(point, repere);

  const etendueX = repere.xMax - repere.xMin;
  const etendueY = repere.yMax - repere.yMin;
  // Le cadre garde un rapport sain : on borne l'unité par les deux dimensions.
  const unit = Math.min(340 / Math.max(etendueX, 1e-9), 44);
  const unitY = Math.min(260 / Math.max(etendueY, 1e-9), 44);

  return (
    <div className="space-y-3" role="group" aria-label={ariaLabel}>
      <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white p-2">
        <CoordPlane
          range={{ xMin: repere.xMin, xMax: repere.xMax, yMin: repere.yMin, yMax: repere.yMax }}
          unit={unit}
          unitY={unitY}
          xStep={repere.xStep}
          yStep={repere.yStep}
          /* ÉTIQUETER UNE GRADUATION SUR DEUX quand le pas est décimal.
             À 0,5, les étiquettes « −0,5 » sont plus larges que l'écart entre
             deux traits : elles se chevauchaient entre elles et recouvraient
             le « O » de l'origine (défaut relevé par l'audit de mise en page
             de la suite navigateur). En n'étiquetant que les valeurs
             entières, l'axe reste lisible ET honnête : les graduations
             intermédiaires restent dessinées, on ne les nomme simplement
             pas. */
          labelEvery={repere.xStep < 1 ? 2 : 1}
          points={[
            ...reperes.map((r) => ({ ...r, color: r.color ?? '#94a3b8' })),
            { id: 'mobile', x: point.x, y: point.y, name: point.nom ?? 'M', color: '#4f46e5' },
          ]}
          draggableId="mobile"
          onPointChange={(p) => onPoint({ ...point, x: p.x, y: p.y })}
          caption={false}
          ariaLabel={`Point mobile dans un repère de pas ${fr(repere.xStep, 2)}`}
        />
      </div>

      {/* LES DEUX LECTURES, CÔTE À CÔTE — c'est leur divergence qui enseigne. */}
      <div className="grid grid-cols-2 gap-2" aria-live="polite">
        {montrerGraduations && (
          <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 text-center">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              graduations comptées
            </div>
            <div className="font-mono text-xl font-black tabular-nums text-slate-700">
              {fr(l.graduationsX, 2)} · {fr(l.graduationsY, 2)}
            </div>
            <div className="text-xs text-slate-400">depuis le coin bas-gauche</div>
          </div>
        )}
        <div className={`rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-3 text-center ${
          montrerGraduations ? '' : 'col-span-2'
        }`}>
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            coordonnées du point
          </div>
          <div className="font-mono text-xl font-black tabular-nums text-indigo-900">
            {l.texte}
          </div>
          <div className="text-xs text-indigo-400">
            une graduation vaut {fr(repere.xStep, 2)}
          </div>
        </div>
      </div>
    </div>
  );
}
