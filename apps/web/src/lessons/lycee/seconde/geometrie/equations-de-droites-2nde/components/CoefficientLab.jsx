import React from 'react';
import { Feedback } from '../../../../../common/components/LessonUI';
import LineScene from './LineScene';
import Stepper from './Stepper';
import {
  lineFromReduced, lineFromCartesian, cartesianOf, reducedOf, formatCartesian, formatReduced, formatVec,
  addVec, inRange, RANGE,
} from './lineUtils';
import { formatDec } from '@smarter-academy/core';

/**
 * CoefficientLab — le laboratoire des coefficients (module 4).
 *
 * Mode 'reduced' : y = m·x + p. Student action: steppers m et p (pas 0,5).
 *   Visual consequence: m tourne la droite autour du point (0 ; p) — la
 *   marche « +1 → +m » grandit ; p fait glisser la droite verticalement, la
 *   flèche (1 ; m) ne change pas. La droite d'avant reste en pointillés.
 *   Expected observation (aha): m = pente = u_y quand u_x = 1 ; p = ordonnée
 *   du point sur l'axe des y ; et AUCUN m ne rend la droite verticale.
 * Mode 'cartesian' : a·x + b·y + c = 0. Student action: steppers a, b, c.
 *   Visual consequence: b = 0 donne enfin la verticale x = −c/a ; a = b = 0
 *   ne donne rien. Expected observation: (−b ; a) dirige la droite.
 * Misconception targeted: p pris pour la pente ; « toute droite s'écrit
 *   y = mx + p » ; (a ; b) pris pour un vecteur directeur.
 */
export default function CoefficientLab({ mode = 'reduced', value, onChange, ghost = null, disabled = false, range = RANGE, showStairs = true }) {
  const line = mode === 'reduced' ? lineFromReduced(value.m, value.p) : lineFromCartesian(value);
  const red = line ? reducedOf(line) : null;
  const car = line ? cartesianOf(line) : null;
  const set = (patch) => onChange({ ...value, ...patch });

  // La flèche (1 ; m) part de (0 ; p) ; en cartésien (−b ; a) part du point A
  // calculé. Elle n'est dessinée que si sa pointe reste dans le cadre.
  const showArrow = !!line && inRange(line.A, range) && inRange(addVec(line.A, line.u), range);
  const corner = line ? { x: line.A.x + 1, y: line.A.y } : null;
  const stairs = showStairs && mode === 'reduced' && showArrow && value.m !== 0;
  const segments = stairs ? [
    { id: 'sx', from: line.A, to: corner, color: '#059669', width: 2.5, dashed: true },
    { id: 'sy', from: corner, to: addVec(line.A, line.u), color: '#e11d48', width: 2.5, dashed: true },
  ] : [];
  const labels = stairs ? [
    { id: 'dx', text: '+1', kind: 'arrow', from: line.A, to: corner, size: 12, color: '#047857' },
    { id: 'dy', text: `${value.m < 0 ? '−' : '+'}${formatDec(Math.abs(value.m))}`, kind: 'arrow', from: corner, to: addVec(line.A, line.u), size: 12, color: '#be123c' },
  ] : [];

  return (
    <div className="space-y-3">
      <LineScene range={range} line={line} ghost={ghost} showArrow={showArrow} nameA={mode === 'reduced' ? 'P' : 'A'} colorA={mode === 'reduced' ? '#d97706' : '#e11d48'}
        segments={segments} labels={labels} lineTone={mode === 'reduced' ? 'emerald' : 'indigo'}
        ariaLabel={line ? `Droite ${formatReduced(red)} ; ${formatCartesian(car)}` : 'Aucune droite : a et b sont nuls'} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono font-bold tabular-nums" aria-live="polite">
        <div className={`px-3 py-2 rounded-xl border ${mode === 'reduced' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-white border-slate-200 text-slate-800'}`}>
          <div className="text-[10px] font-sans font-semibold uppercase tracking-wide opacity-70">équation réduite</div>
          {line ? (red.vertical ? <span>aucune — droite verticale : {formatReduced(red)}</span> : formatReduced(red)) : '—'}
        </div>
        <div className={`px-3 py-2 rounded-xl border ${mode === 'cartesian' ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-white border-slate-200 text-slate-800'}`}>
          <div className="text-[10px] font-sans font-semibold uppercase tracking-wide opacity-70">équation cartésienne</div>
          {line ? formatCartesian(car) : '0 = 0 : ce n’est pas une droite'}
        </div>
      </div>
      {mode === 'reduced' ? (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Stepper label="m" value={value.m} onChange={(v) => set({ m: v })} min={-4} max={4} step={0.5} tone="emerald" disabled={disabled} />
          <Stepper label="p" value={value.p} onChange={(v) => set({ p: v })} min={-5} max={5} step={0.5} tone="amber" disabled={disabled} />
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Stepper label="a" value={value.a} onChange={(v) => set({ a: v })} min={-4} max={4} step={1} tone="indigo" disabled={disabled} />
          <Stepper label="b" value={value.b} onChange={(v) => set({ b: v })} min={-4} max={4} step={1} tone="indigo" disabled={disabled} />
          <Stepper label="c" value={value.c} onChange={(v) => set({ c: v })} min={-4} max={4} step={1} tone="indigo" disabled={disabled} />
        </div>
      )}
      {line && showArrow && <p className="text-xs text-slate-500">Flèche violette : le vecteur directeur {formatVec(line.u)}{mode === 'reduced' ? ' — un pas à droite, m vers le haut' : ' = (−b ; a)'}.</p>}
      {line && !showArrow && <p className="text-xs text-slate-500">La flèche {formatVec(line.u)} sortirait du cadre : seule la droite est dessinée.</p>}
      {!line && <Feedback tone="info">a = 0 et b = 0 : l’équation ne contient plus ni x ni y. Aucune droite.</Feedback>}
    </div>
  );
}
