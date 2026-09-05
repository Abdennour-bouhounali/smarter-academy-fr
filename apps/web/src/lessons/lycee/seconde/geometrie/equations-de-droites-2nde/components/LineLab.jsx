import React from 'react';
import { Feedback } from '../../../../../common/components/LessonUI';
import LineScene from './LineScene';
import Stepper from './Stepper';
import { addVec, inRange, isZeroVec, scaleVec, formatPoint, formatVec, RANGE } from './lineUtils';

/**
 * LineLab — le laboratoire des droites (signature, module 1).
 *
 * Activity: un point A et une flèche u ; la droite qui passe par A dans la
 *   direction de u est redessinée à chaque geste.
 * Student action: orienter la flèche (pointe glissable, steppers u_x / u_y,
 *   chips ×2, ×½, ×(−1)) ou déplacer A (point glissable, steppers).
 * Controlled variables: A et u — les DEUX seules variables d'une droite.
 * Mathematical state: { A, u }, u ≠ 0, A + u dans le cadre (la pointe est une
 *   poignée, elle doit rester visible).
 * Visual consequence: la droite pivote autour de A quand u tourne ; elle NE
 *   BOUGE PAS quand u est doublé ou renversé ; elle glisse parallèlement
 *   quand A se déplace. La droite précédente reste en pointillés pour que le
 *   changement — ou l'absence de changement — se voie.
 * Expected observation (aha): « un point + une direction = UNE droite ; la
 *   longueur et le sens de la flèche ne comptent pas ».
 * Misconception targeted: « 2u donne une autre droite », « déplacer A fait
 *   tourner la droite ».
 * Formalization: aucune ici (module 3 écrit l'équation).
 */
export default function LineLab({
  A, u, onChange, ghost = null,
  mode = 'u',                 // 'u' : la flèche est mobile ; 'A' : le point
  modes = ['u'],              // chips de choix si plusieurs
  onMode,
  showScale = false,
  disabled = false,
  range = RANGE,
  ariaLabel,
}) {
  const T = addVec(A, u);

  const trySetU = (next) => {
    if (isZeroVec(next)) return 'zero';
    if (!inRange(addVec(A, next), range)) return 'range';
    onChange({ A, u: next });
    return null;
  };
  const trySetA = (next) => {
    if (!inRange(next, range) || !inRange(addVec(next, u), range)) return 'range';
    onChange({ A: next, u });
    return null;
  };
  const [notice, setNotice] = React.useState(null);
  const report = (why) => setNotice(why === 'zero'
    ? 'Une flèche de longueur nulle n’indique aucune direction : u ne peut pas être (0 ; 0).'
    : why === 'range' ? 'La pointe de la flèche doit rester dans le cadre.' : null);

  const onPointChange = (p) => {
    if (disabled) return;
    if (mode === 'A') report(trySetA(p));
    else report(trySetU({ x: p.x - A.x, y: p.y - A.y }));
  };

  const scaleU = (k) => report(trySetU(scaleVec(u, k)));
  const canScale = (k) => !isZeroVec(scaleVec(u, k)) && inRange(addVec(A, scaleVec(u, k)), range)
    && Number.isInteger(u.x * k * 2) && Number.isInteger(u.y * k * 2);

  const chip = (on) => `min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${on ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400'} disabled:opacity-60`;
  const scaleBtn = 'min-h-[44px] px-4 rounded-xl border-2 border-violet-300 bg-white text-violet-800 text-sm font-bold hover:border-violet-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <div className="space-y-3">
      {modes.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Élément à déplacer">
          {modes.includes('u') && <button type="button" className={chip(mode === 'u')} aria-pressed={mode === 'u'} disabled={disabled} onClick={() => onMode?.('u')}>🎯 Orienter la flèche u</button>}
          {modes.includes('A') && <button type="button" className={chip(mode === 'A')} aria-pressed={mode === 'A'} disabled={disabled} onClick={() => onMode?.('A')}>📍 Déplacer le point A</button>}
        </div>
      )}
      <LineScene
        range={range} line={{ A, u }} ghost={ghost} showArrow
        draggableId={disabled ? null : (mode === 'A' ? 'A' : 'T')}
        onPointChange={onPointChange}
        ariaLabel={ariaLabel ?? (mode === 'A' ? 'Repère — déplace le point A ; la droite suit' : 'Repère — déplace la pointe de la flèche u ; la droite tourne autour de A')}
      />
      {/* Lectures dans le DOM, jamais dans le SVG : aucune collision possible. */}
      <div className="flex flex-wrap gap-2 text-sm font-mono font-bold tabular-nums" aria-live="polite">
        <span className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">A {formatPoint(A)}</span>
        <span className="px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-800">u {formatVec(u)}</span>
      </div>
      {mode === 'u' ? (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Stepper label="u_x" value={u.x} onChange={(v) => report(trySetU({ x: v, y: u.y }))} min={range.xMin} max={range.xMax} step={1} tone="indigo" disabled={disabled} />
          <Stepper label="u_y" value={u.y} onChange={(v) => report(trySetU({ x: u.x, y: v }))} min={range.yMin} max={range.yMax} step={1} tone="indigo" disabled={disabled} />
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Stepper label="x_A" value={A.x} onChange={(v) => report(trySetA({ x: v, y: A.y }))} min={range.xMin} max={range.xMax} step={1} tone="rose" disabled={disabled} />
          <Stepper label="y_A" value={A.y} onChange={(v) => report(trySetA({ x: A.x, y: v }))} min={range.yMin} max={range.yMax} step={1} tone="rose" disabled={disabled} />
        </div>
      )}
      {showScale && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Étirer ou renverser la flèche">
          <button type="button" className={scaleBtn} disabled={disabled || !canScale(2)} onClick={() => scaleU(2)} aria-label="Doubler la flèche u">u → 2u</button>
          <button type="button" className={scaleBtn} disabled={disabled || !canScale(0.5)} onClick={() => scaleU(0.5)} aria-label="Réduire la flèche u de moitié">u → ½u</button>
          <button type="button" className={scaleBtn} disabled={disabled || !canScale(-1)} onClick={() => scaleU(-1)} aria-label="Renverser la flèche u">u → −u</button>
        </div>
      )}
      {notice && <Feedback tone="info">{notice}</Feedback>}
      <p className="text-xs text-slate-500">Pointe de la flèche {formatPoint(T)} · droite en trait plein, droite précédente en pointillés.</p>
    </div>
  );
}
