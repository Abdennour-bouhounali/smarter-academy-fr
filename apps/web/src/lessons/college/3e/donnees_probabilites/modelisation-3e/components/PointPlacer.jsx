import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { formatDec } from './modelUtils';

/**
 * PointPlacer — poser les points d'un tableau, un par un, dans le repère.
 *
 * Activity            déplacer le curseur (glisser, flèches, ou ± via les
 *                     boutons du module) puis « Poser » ; le point du tableau
 *                     correspondant se fixe s'il est au bon endroit.
 * Mathematical objective  chaque ligne du tableau EST un point ; la forme
 *                     que dessinent les points (droite, droite par O, courbe)
 *                     dit le modèle.
 * Student action      glisser le curseur, toucher « Poser ».
 * Controlled variable la position (x ; y) du curseur, aimantée à la grille.
 * Mathematical state  `cursor`, `placed` (Set des x posés) appartiennent au
 *                     module ; les cibles viennent du tableau (le modèle).
 * Visual consequence  le point posé passe en indigo ; un point mal posé
 *                     reste visible en rouge le temps du message et l'écart
 *                     est écrit (« 2 L trop haut »).
 *
 * SÉCURITÉ D'AFFICHAGE : `range`, `xStep`, `yStep`, `unit`, `unitY` sont
 * fournis par le module (via planeFor) — le curseur ne peut pas sortir du
 * cadre : CoordPlane le borne.
 */
export default function PointPlacer({
  rows,                 // [{ x, y }] cibles
  placed,               // Set<x>
  cursor,               // { x, y }
  onCursorChange,
  onPlace,              // () => void
  wrong = null,         // { x, y } dernier essai raté (affiché en rouge)
  geo,                  // { range, xStep, yStep, unit, unitY }
  xLabel = 'x', yLabel = 'y',
  disabled = false,
  frozen = false,
}) {
  const done = rows.every((r) => placed.has(r.x));
  const pts = [
    ...rows.filter((r) => placed.has(r.x)).map((r) => ({ id: `p${r.x}`, x: r.x, y: r.y, color: '#4f46e5' })),
    ...(wrong ? [{ id: 'wrong', x: wrong.x, y: wrong.y, color: '#e11d48' }] : []),
    ...(!frozen && !done ? [{ id: 'cursor', x: cursor.x, y: cursor.y, color: '#0284c7', name: 'curseur' }] : []),
  ];
  return (
    <div className="space-y-2" role="group" aria-label={`Placer les points : ${placed.size} sur ${rows.length} posés`}>
      <CoordPlane
        range={geo.range} unit={geo.unit} unitY={geo.unitY} xStep={geo.xStep} yStep={geo.yStep}
        step={{ x: geo.xStep, y: geo.yStep }}
        points={pts}
        draggableId={!frozen && !done ? 'cursor' : null}
        onPointChange={(p) => onCursorChange?.(p)}   /* CoordPlane ne passe que le point déplacé */
        curves={frozen || done ? [{ id: 'line', points: rows.map((r) => ({ x: r.x, y: r.y })), tone: 'indigo' }] : []}
        axisLabels={{ x: xLabel, y: yLabel }}
        ariaLabel={`Repère : curseur en (${formatDec(cursor.x)} ; ${formatDec(cursor.y)})`}
        disabled={disabled}
        frozen={frozen}
        caption={false}
      />
      {!frozen && !done && (
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-mono text-slate-700 tabular-nums">curseur : ({formatDec(cursor.x)} ; {formatDec(cursor.y)})</p>
          <button type="button" onClick={() => !disabled && onPlace?.()} disabled={disabled}
            className="ml-auto min-h-[44px] px-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{ touchAction: 'manipulation' }} aria-label="Poser le point">
            📍 Poser
          </button>
        </div>
      )}
    </div>
  );
}
