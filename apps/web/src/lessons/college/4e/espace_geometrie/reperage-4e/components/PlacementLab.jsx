import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { placer, memePoint, couple, fr, atteignable } from './reperage4e';

/**
 * PlacementLab — poser un point quand une graduation ne vaut pas 1.
 *
 * Activity              amener un point mobile sur une cible annoncée par ses
 *                       coordonnées, dans un repère dont le pas n'est pas 1.
 * Mathematical objective placer, c'est traduire une VALEUR en un NOMBRE DE
 *                       GRADUATIONS — l'opération inverse de la lecture, et
 *                       elle aussi non triviale dès que le pas change.
 * Student action        glisser le point (ou flèches). L'aimantation le pose
 *                       sur les nœuds réellement dessinés.
 * Controlled variable   la position du point mobile.
 * Mathematical state    le couple courant, comparé à la cible par `memePoint`.
 * Visual consequence    la cible s'allume quand le point l'atteint.
 * Expected observation  « pour aller à 1,5 avec un pas de 0,5, je compte trois
 *                       graduations, pas une et demie ».
 * Misconception targeted compter autant de graduations que d'unités.
 *
 * ATTEIGNABILITÉ — LA GARANTIE CENTRALE. Une cible dont les coordonnées ne
 * tombent pas sur un nœud du pas courant serait INATTEIGNABLE : le geste ne
 * pourrait jamais la satisfaire, et l'élève chercherait indéfiniment une
 * position qui n'existe pas. C'est une classe de défaut qui a cassé deux
 * labos plus tôt dans cette vague. Le composant REFUSE donc de dessiner une
 * cible inatteignable (il l'affiche comme une anomalie), et le test de
 * parcours vérifie que chaque cible de la leçon tombe sur un nœud dessiné.
 *
 * SÉCURITÉ VISUELLE : la lecture du point courant est dans le DOM ; le cadre
 * est borné dans les deux dimensions.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement — la cible atteinte reste
 * manipulable, l'élève peut repartir et recommencer.
 */
export default function PlacementLab({
  repere,
  point,
  onPoint,
  /** La cible à atteindre, {x, y, nom}. Facultative. */
  cible = null,
  /** Points fixes de décor (sommets déjà placés, par exemple). */
  fixes = [],
  /** Segments à tracer entre points nommés, [{de:{x,y}, a:{x,y}, ton}]. */
  segments = [],
  ariaLabel = 'Placer un point dans le repère',
}) {
  const courant = placer(point, repere);
  const atteint = cible ? memePoint(courant, cible, 1e-9) : false;
  const cibleValide = cible ? atteignable(cible, repere) : true;

  const etendueX = repere.xMax - repere.xMin;
  const etendueY = repere.yMax - repere.yMin;
  const unit = Math.min(340 / Math.max(etendueX, 1e-9), 44);
  const unitY = Math.min(260 / Math.max(etendueY, 1e-9), 44);

  const points = [
    ...fixes.map((f) => ({ ...f, color: f.color ?? '#0f172a' })),
    ...(cible && cibleValide && !atteint
      ? [{ id: '__cible', x: cible.x, y: cible.y, color: '#f59e0b' }]
      : []),
    { id: 'mobile', x: point.x, y: point.y, name: point.nom ?? 'M', color: atteint ? '#059669' : '#4f46e5' },
  ];

  return (
    <div className="space-y-3" role="group" aria-label={ariaLabel}>
      {cible && !cibleValide && (
        <p className="rounded-xl border-2 border-rose-300 bg-rose-50 p-2.5 text-sm font-semibold text-rose-900">
          Cible inatteignable à ce pas — anomalie de conception.
        </p>
      )}

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
          points={points}
          segments={segments}
          draggableId="mobile"
          onPointChange={(p) => onPoint({ ...point, x: p.x, y: p.y })}
          caption={false}
          ariaLabel={`Placer un point ; une graduation vaut ${fr(repere.xStep, 2)}`}
        />
      </div>

      {/* La lecture courante et la cible, dans le DOM. */}
      <div className="grid grid-cols-2 gap-2" aria-live="polite">
        <div className={`rounded-2xl border-2 p-3 text-center ${
          atteint ? 'border-emerald-300 bg-emerald-50' : 'border-indigo-200 bg-indigo-50'
        }`}>
          <div className={`text-xs font-semibold uppercase tracking-wide ${
            atteint ? 'text-emerald-600' : 'text-indigo-500'
          }`}>
            ton point
          </div>
          <div className={`font-mono text-xl font-black tabular-nums ${
            atteint ? 'text-emerald-900' : 'text-indigo-900'
          }`}>
            {couple(courant, 1)}
          </div>
        </div>
        {cible && (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-center">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              cible{cible.nom ? ` ${cible.nom}` : ''}
            </div>
            <div className="font-mono text-xl font-black tabular-nums text-amber-900">
              {couple(cible, 1)}
            </div>
          </div>
        )}
      </div>

      {cible && (
        <p className={`rounded-xl px-3 py-2 text-center text-sm font-semibold ${
          atteint ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-600'
        }`}>
          {atteint
            ? 'Point atteint. Tu peux continuer à le déplacer.'
            : `Une graduation vaut ${fr(repere.xStep, 2)} : compte les graduations, pas les unités.`}
        </p>
      )}
    </div>
  );
}
