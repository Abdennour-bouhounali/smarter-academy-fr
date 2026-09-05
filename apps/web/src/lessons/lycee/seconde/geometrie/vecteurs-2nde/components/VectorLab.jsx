import React, { useState } from 'react';
import VectorScene, { SCENE_COLORS, VecReadout } from './VectorScene';
import Stepper from './Stepper';
import { RANGE, add, vec, inRange } from './vecteurUtils';

/**
 * VectorLab — une flèche et UNE variable à la fois.
 *
 *   mode 'move'   l'élève déplace l'ORIGINE ; les coordonnées du vecteur sont
 *                 figées. Ce qu'il doit voir : la flèche voyage identique à
 *                 elle-même. (Modules 2 et 8.)
 *   mode 'build'  l'élève règle les COORDONNÉES ; l'origine est figée.
 *                 (Modules 3, 6.)
 *   mode 'points' l'élève déplace A OU B (puce « Je déplace ») ; le vecteur AB
 *                 est dérivé. Ce qu'il doit voir : xB − xA et yB − yA.
 *                 (Module 3.)
 *
 * Toutes les bornes des steppers sont CALCULÉES pour que l'origine ET
 * l'extrémité restent dans le cadre : un bouton se désactive au bord au
 * lieu de laisser une flèche sortir de l'écran. Le glisser passe par
 * CoordPlane (aimanté à la grille) et est reborné de la même façon.
 */
export default function VectorLab({
  origin,
  vector,
  onOriginChange,
  onVectorChange,
  mode = 'move',
  range = RANGE,
  names = { origin: 'A', tip: 'B', vector: 'u' },
  ghosts = [],
  target = null,
  extraPoints = [],
  extraArrows = [],
  escalier = false,
  showCoords = true,
  showWords = true,
  step = 1,
  disabled = false,
  ariaLabel,
  color = SCENE_COLORS.main,
}) {
  const tip = add(origin, vector);
  const [which, setWhich] = useState('B');

  // Bornes : l'origine et l'extrémité doivent rester dans le cadre.
  const originBounds = (axis) => {
    const lo = axis === 'x' ? range.xMin : range.yMin;
    const hi = axis === 'x' ? range.xMax : range.yMax;
    const v = vector[axis];
    return { min: Math.max(lo, lo - v), max: Math.min(hi, hi - v) };
  };
  const vectorBounds = (axis) => {
    const lo = axis === 'x' ? range.xMin : range.yMin;
    const hi = axis === 'x' ? range.xMax : range.yMax;
    return { min: lo - origin[axis], max: hi - origin[axis] };
  };
  const pointBounds = (axis) => ({ min: axis === 'x' ? range.xMin : range.yMin, max: axis === 'x' ? range.xMax : range.yMax });

  const setOrigin = (next) => {
    if (disabled) return;
    if (!inRange(next, range) || !inRange(add(next, vector), range)) return;
    onOriginChange?.(next);
  };
  const setVector = (next) => {
    if (disabled) return;
    if (!inRange(add(origin, next), range)) return;
    onVectorChange?.(next);
  };
  const setTip = (nextTip) => setVector(vec(origin, nextTip));

  const draggableId = disabled ? null : mode === 'move' ? 'origin' : mode === 'build' ? 'tip' : (which === 'A' ? 'origin' : 'tip');
  const onPointChange = (p) => {
    if (draggableId === 'origin') {
      if (mode === 'points') {
        // Déplacer A change le vecteur ; B ne bouge pas.
        if (inRange(p, range)) onOriginChange?.(p, vec(p, tip));
      } else setOrigin(p);
    } else if (draggableId === 'tip') setTip(p);
  };

  const points = [
    { id: 'origin', name: names.origin, x: origin.x, y: origin.y, color: color === SCENE_COLORS.main ? '#4f46e5' : color },
    { id: 'tip', name: names.tip, x: tip.x, y: tip.y, color: '#059669' },
    ...extraPoints,
  ];
  const arrows = [
    ...ghosts.map((g, i) => ({ id: `ghost${i}`, from: g.origin, to: add(g.origin, g.vector), ghost: true, name: g.name })),
    ...(target ? [{ id: 'target', from: target.origin, to: add(target.origin, target.vector), dashed: true, color: '#f59e0b', name: target.name ?? 'cible' }] : []),
    ...extraArrows,
    { id: 'main', from: origin, to: tip, color, name: names.vector, escalier },
  ];

  const bx = mode === 'move' ? originBounds('x') : mode === 'build' ? vectorBounds('x') : pointBounds('x');
  const by = mode === 'move' ? originBounds('y') : mode === 'build' ? vectorBounds('y') : pointBounds('y');

  return (
    <div className="space-y-3">
      <VectorScene
        range={range}
        points={points}
        arrows={arrows}
        draggableId={draggableId}
        onPointChange={onPointChange}
        step={step}
        disabled={disabled}
        ariaLabel={ariaLabel ?? `Repère — flèche de ${names.origin} à ${names.tip}`}
      />

      {mode === 'points' && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Point à déplacer">
          <span className="text-sm font-semibold text-slate-700">Je déplace :</span>
          {['A', 'B'].map((k) => (
            <button key={k} type="button" aria-pressed={which === k} disabled={disabled}
              onClick={() => setWhich(k)}
              className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold ${which === k ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-700'} disabled:opacity-60`}>
              {k === 'A' ? names.origin : names.tip}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {mode === 'move' && (
          <>
            <Stepper label={`${names.origin} — x`} value={origin.x} onChange={(v) => setOrigin({ ...origin, x: v })} min={bx.min} max={bx.max} step={step} disabled={disabled} />
            <Stepper label={`${names.origin} — y`} value={origin.y} onChange={(v) => setOrigin({ ...origin, y: v })} min={by.min} max={by.max} step={step} disabled={disabled} />
          </>
        )}
        {mode === 'build' && (
          <>
            <Stepper label="Horizontal" value={vector.x} onChange={(v) => setVector({ ...vector, x: v })} min={bx.min} max={bx.max} step={step} tone="indigo" disabled={disabled} />
            <Stepper label="Vertical" value={vector.y} onChange={(v) => setVector({ ...vector, y: v })} min={by.min} max={by.max} step={step} tone="emerald" disabled={disabled} />
          </>
        )}
        {mode === 'points' && which === 'A' && (
          <>
            <Stepper label={`${names.origin} — x`} value={origin.x} onChange={(v) => onOriginChange?.({ ...origin, x: v }, vec({ ...origin, x: v }, tip))} min={bx.min} max={bx.max} step={step} disabled={disabled} />
            <Stepper label={`${names.origin} — y`} value={origin.y} onChange={(v) => onOriginChange?.({ ...origin, y: v }, vec({ ...origin, y: v }, tip))} min={by.min} max={by.max} step={step} disabled={disabled} />
          </>
        )}
        {mode === 'points' && which === 'B' && (
          <>
            <Stepper label={`${names.tip} — x`} value={tip.x} onChange={(v) => setTip({ ...tip, x: v })} min={bx.min} max={bx.max} step={step} tone="emerald" disabled={disabled} />
            <Stepper label={`${names.tip} — y`} value={tip.y} onChange={(v) => setTip({ ...tip, y: v })} min={by.min} max={by.max} step={step} tone="emerald" disabled={disabled} />
          </>
        )}
      </div>

      {showCoords && <VecReadout name={names.vector} v={vector} words={showWords} />}
    </div>
  );
}
