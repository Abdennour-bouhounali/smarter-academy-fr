import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { curvePieces, imageOf, formatDec, compareImages } from './referenceUtils';

/**
 * TwoProbes — deux sondes a et b sur UNE courbe de référence.
 *
 * Activity               deux abscisses a et b (steppers, pas `step`), leurs
 *                        deux points sur la courbe, et la comparaison de
 *                        leurs images dans le DOM ; en option le point
 *                        symétrique de a (miroir en x = 0).
 * Mathematical objective comparer f(a) et f(b) selon la position de a et b :
 *                        symétrie f(−a) = ±f(a), sens de variation sur un
 *                        intervalle, piège de l'inverse sur ℝ*.
 * Controlled variables   a et b — une à la fois par les boutons.
 * Mathematical state     { a, b } ; images et comparaison CALCULÉES.
 *
 * Tap-first (playbook §10.1) : pas de glisser ici, deux valeurs à régler.
 */
function Probe({ label, value, onChange, min, max, step, color, disabled }) {
  const clamp = (v) => Math.max(min, Math.min(max, Math.round(v / step) * step));
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold" style={{ color }}>{label}</span>
      <button type="button" disabled={disabled || value <= min} onClick={() => onChange(clamp(value - step))} aria-label={`Diminuer ${label}`} className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500">−</button>
      <span className="px-3 py-1.5 rounded-lg text-white font-mono font-bold tabular-nums" style={{ backgroundColor: color }}>{formatDec(value)}</span>
      <button type="button" disabled={disabled || value >= max} onClick={() => onChange(clamp(value + step))} aria-label={`Augmenter ${label}`} className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500">+</button>
    </div>
  );
}

export default function TwoProbes({ f, range, unit = 34, unitY = null, a, b, onChange, step = 0.5, min, max, showMirror = false, showB = true, disabled = false, extraCurves = [], highlightIntervals = [] }) {
  const lo = min ?? range.xMin; const hi = max ?? range.xMax;
  const ya = imageOf(f, a); const yb = imageOf(f, b); const ym = imageOf(f, -a);
  const cmp = compareImages(f, a, b);
  const inR = (x, y) => y !== null && y >= range.yMin && y <= range.yMax;
  const points = [
    ...(inR(a, ya) ? [{ id: 'A', x: a, y: ya, color: '#0284c7' }] : []),
    ...(showB && inR(b, yb) ? [{ id: 'B', x: b, y: yb, color: '#d97706' }] : []),
    ...(showMirror && inR(-a, ym) ? [{ id: 'M', x: -a, y: ym, color: '#7c3aed' }] : []),
  ];
  const segs = [
    ...(inR(a, ya) ? [{ id: 'ga', from: { x: a, y: 0 }, to: { x: a, y: ya }, color: '#0284c7', dashed: true, width: 1.5 }] : []),
    ...(showB && inR(b, yb) ? [{ id: 'gb', from: { x: b, y: 0 }, to: { x: b, y: yb }, color: '#d97706', dashed: true, width: 1.5 }] : []),
    ...(showMirror && inR(-a, ym) && inR(a, ya) ? [{ id: 'gm', from: { x: -a, y: ym }, to: { x: a, y: ya }, color: '#7c3aed', dashed: true, width: 1.5 }] : []),
  ];
  const curves = [...curvePieces(f, range).map((pc, i) => ({ id: `${f.id}${i}`, points: pc, tone: f.color, width: 2.5 })), ...extraCurves];
  const txt = (y) => (y === null ? 'n’existe pas' : formatDec(y));
  return (
    <div className="space-y-3">
      <CoordPlane range={range} unit={unit} unitY={unitY} points={points} segments={segs} curves={curves} highlightIntervals={highlightIntervals} caption={false}
        ariaLabel={`Courbe de ${f.name} : ${f.name}(${formatDec(a)}) = ${txt(ya)}${showB ? `, ${f.name}(${formatDec(b)}) = ${txt(yb)}` : ''}`} />
      {!disabled && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Probe label="a" value={a} onChange={(v) => onChange({ a: v, b })} min={lo} max={hi} step={step} color="#0284c7" disabled={disabled} />
          {showB && <Probe label="b" value={b} onChange={(v) => onChange({ a, b: v })} min={lo} max={hi} step={step} color="#d97706" disabled={disabled} />}
        </div>
      )}
      <div className="flex flex-wrap gap-2 text-sm font-mono font-bold tabular-nums" aria-live="polite">
        <span className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-900">{f.name}({formatDec(a)}) = {txt(ya)}</span>
        {showMirror && <span className="px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-900">{f.name}({formatDec(-a)}) = {txt(ym)}</span>}
        {showB && <span className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">{f.name}({formatDec(b)}) = {txt(yb)}</span>}
        {showB && cmp && <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white" data-compare={cmp}>{a < b ? 'a < b' : a > b ? 'a > b' : 'a = b'} et {f.name}(a) {cmp} {f.name}(b)</span>}
      </div>
    </div>
  );
}
