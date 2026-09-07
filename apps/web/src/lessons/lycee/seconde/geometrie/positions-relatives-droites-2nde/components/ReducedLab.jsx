import React from 'react';
import { ParamSlider } from '../../../../../common/components/AffineExplorer';
import TwoLinesPlane from './TwoLinesPlane';
import LineReadouts from './LineReadouts';
import { lineFromSlopeIntercept } from './droitesUtils';

/**
 * ReducedLab — deux droites données par leurs équations réduites : (d₁) est
 * figée (y = m₁x + p₁), (d₂) : y = m₂x + p₂ se règle avec deux curseurs
 * (ParamSlider, partagé : glissière + pas ± + valeur lue). Les droites
 * canoniques sont DÉRIVÉES de (m, p) par `lineFromSlopeIntercept` ; le plan et
 * les lectures en découlent. Un « zoom » facultatif change le cadre (±6, ±15,
 * ±40) sans changer les droites : c'est ainsi que l'élève retrouve un point
 * d'intersection sorti du cadre.
 */
export const FRAMES = [6, 15, 40];

export default function ReducedLab({ d1, value, onChange, disabled = false, lockM = false, lockP = false, halfSpan = 6, onHalfSpan = null, cartesian = false, showIntersection = true }) {
  const L1 = lineFromSlopeIntercept(d1.m, d1.p);
  const L2 = lineFromSlopeIntercept(value.m, value.p);
  const lines = [
    { id: 'd1', name: '(d₁)', line: L1, tone: 'indigo' },
    { id: 'd2', name: '(d₂)', line: L2, tone: 'rose' },
  ];
  const chip = (on) => `min-h-[44px] px-3.5 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${on ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500'}`;
  return (
    <div className="space-y-3">
      <TwoLinesPlane lines={lines} halfSpan={halfSpan} showIntersection={showIntersection} />
      {onHalfSpan && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Zoom du cadre">
          <span className="text-xs font-semibold text-slate-600">Cadre :</span>
          {FRAMES.map((h) => (
            <button key={h} type="button" className={chip(halfSpan === h)} aria-pressed={halfSpan === h} onClick={() => onHalfSpan(h)}>
              ±{h}
            </button>
          ))}
        </div>
      )}
      <LineReadouts L1={L1} L2={L2} halfSpan={halfSpan} cartesian={cartesian} show={{ equations: true, position: true, intersection: showIntersection }} />
      {!disabled && (
        <div className="space-y-2">
          <ParamSlider label="m₂" ariaLabel="le coefficient m₂" value={value.m} onChange={(m) => onChange({ ...value, m })} min={-3} max={3} step={0.5} tone="rose" disabled={lockM} />
          <ParamSlider label="p₂" ariaLabel="l’ordonnée à l’origine p₂" value={value.p} onChange={(p) => onChange({ ...value, p })} min={-5} max={5} step={0.5} tone="amber" disabled={lockP} />
        </div>
      )}
    </div>
  );
}
