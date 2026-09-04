import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import {
  vecFromPoints, translatePoint, translatePolygon, formatVec, describeVec,
} from './vectorUtils';

/**
 * VectorLab — l'interaction signature de la leçon.
 *
 * ACTION            l'élève déplace l'ORIGINE de la flèche (réglages − / +),
 *                   sans jamais toucher à ses composantes.
 * CHANGEMENT        la flèche se pose ailleurs, à l'identique.
 * OBSERVATION       direction, sens et longueur ne bougent pas ; seul le point
 *                   de départ change.
 * SENS MATHÉMATIQUE un vecteur décrit un déplacement, PAS une position. Deux
 *                   flèches à des endroits différents peuvent être le même
 *                   vecteur.
 * FORMALISATION     les composantes (dx ; dy) sont le seul contenu du vecteur.
 *
 * Deux modes :
 *   'move'    l'élève déplace l'origine ; les composantes sont figées.
 *   'build'   l'élève règle les composantes ; l'origine est figée.
 * Séparer les deux est délibéré : une seule variable à la fois (playbook).
 */
export default function VectorLab({
  origin,
  vector,
  onOriginChange,
  onVectorChange,
  mode = 'move',
  range,
  figure = null,            // sommets à translater, ou null pour un point seul
  ghosts = [],              // autres flèches, pour comparer
  showImage = true,
  showComponents = true,
  target = null,            // flèche cible en pointillé
  disabled = false,
  ariaLabel,
}) {
  const tip = translatePoint(origin, vector);
  const image = figure ? translatePolygon(figure, vector) : null;

  const clampP = (p) => ({
    x: Math.max(range.xMin, Math.min(range.xMax, p.x)),
    y: Math.max(range.yMin, Math.min(range.yMax, p.y)),
  });

  /** Bouger l'origine : le vecteur voyage, il ne change pas. */
  const moveOrigin = (axis, delta) => {
    if (disabled || mode !== 'move') return;
    const next = clampP({ ...origin, [axis]: origin[axis] + delta });
    // L'extrémité doit rester dans le cadre, sinon la flèche sort de l'écran.
    const nextTip = translatePoint(next, vector);
    if (nextTip.x < range.xMin || nextTip.x > range.xMax
      || nextTip.y < range.yMin || nextTip.y > range.yMax) return;
    onOriginChange?.(next);
  };

  /** Régler une composante : le vecteur change, il ne voyage pas. */
  const setComponent = (key, delta) => {
    if (disabled || mode !== 'build') return;
    const next = { ...vector, [key]: vector[key] + delta };
    const nextTip = translatePoint(origin, next);
    if (nextTip.x < range.xMin || nextTip.x > range.xMax
      || nextTip.y < range.yMin || nextTip.y > range.yMax) return;
    onVectorChange?.(next);
  };

  const arrows = [
    ...ghosts.map((g, i) => ({
      id: `ghost${i}`,
      from: g.origin,
      to: translatePoint(g.origin, g.vector),
      ghost: true,
      label: g.label,
    })),
    ...(target ? [{
      id: 'target', from: target.origin, to: translatePoint(target.origin, target.vector),
      dashed: true, color: '#f59e0b', label: 'cible',
    }] : []),
    { id: 'main', from: origin, to: tip, color: '#7c3aed' },
  ];

  const Stepper = ({ label, onMinus, onPlus, value, color }) => (
    <div className="flex-1 min-w-[140px] rounded-xl border-2 border-slate-200 bg-white p-2">
      <p className={`text-xs font-semibold mb-1 ${color}`}>{label}</p>
      <div className="flex items-center gap-1 justify-center">
        <button type="button" onClick={onMinus} disabled={disabled}
          aria-label={`Diminuer ${label}`}
          className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">−</button>
        <span className="w-10 text-center text-xl font-mono font-bold tabular-nums">
          {String(value).replace('-', '−')}
        </span>
        <button type="button" onClick={onPlus} disabled={disabled}
          aria-label={`Augmenter ${label}`}
          className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">+</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <CoordPlane
        range={range}
        points={
          figure
            ? []
            : [
              { id: 'o', name: 'A', x: origin.x, y: origin.y, color: '#4f46e5' },
              ...(showImage ? [{ id: 't', name: "A'", x: tip.x, y: tip.y, color: '#059669' }] : []),
            ]
        }
        polygons={
          figure
            ? [
              { id: 'src', points: figure, fill: '#c7d2fe', stroke: '#4338ca' },
              ...(showImage && image
                ? [{ id: 'img', points: image, fill: '#a7f3d0', stroke: '#059669' }]
                : []),
            ]
            : []
        }
        arrows={arrows}
        caption={false}
        ariaLabel={ariaLabel ?? `Flèche partant de (${origin.x} ; ${origin.y}), déplacement ${describeVec(vector)}`}
      />

      <div className="flex gap-2 flex-wrap">
        {mode === 'move' && (
          <>
            <Stepper label="Origine — x" value={origin.x} color="text-indigo-700"
              onMinus={() => moveOrigin('x', -1)} onPlus={() => moveOrigin('x', 1)} />
            <Stepper label="Origine — y" value={origin.y} color="text-indigo-700"
              onMinus={() => moveOrigin('y', -1)} onPlus={() => moveOrigin('y', 1)} />
          </>
        )}
        {mode === 'build' && (
          <>
            <Stepper label="Déplacement horizontal" value={vector.dx} color="text-violet-700"
              onMinus={() => setComponent('dx', -1)} onPlus={() => setComponent('dx', 1)} />
            <Stepper label="Déplacement vertical" value={vector.dy} color="text-violet-700"
              onMinus={() => setComponent('dy', -1)} onPlus={() => setComponent('dy', 1)} />
          </>
        )}
      </div>

      {showComponents && (
        <p className="text-center text-sm" aria-live="polite">
          <span className="inline-block px-3 py-1 rounded-lg bg-violet-100 text-violet-800 font-mono font-bold">
            {formatVec(vector)}
          </span>
          <span className="ml-2 text-slate-600">{describeVec(vector)}</span>
        </p>
      )}
    </div>
  );
}
