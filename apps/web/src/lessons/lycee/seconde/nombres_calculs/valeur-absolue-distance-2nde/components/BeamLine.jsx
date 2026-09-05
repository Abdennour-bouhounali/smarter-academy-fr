import React from 'react';
import { formatDec } from '@smarter-academy/core';
import RealLine from '../../../../../common/components/RealLine';
import Stepper from './Stepper';
import { absInequalitySet, notation, satisfies, distance } from './absUtils';

/**
 * BeamLine — le faisceau du phare : un centre a, un rayon r, un point-test x.
 *
 * Activity: régler le centre et le rayon, promener un bateau-test x et lire
 *   s'il est éclairé.
 * Mathematical objective: |x − a| ≤ r ⇔ x ∈ [a − r ; a + r] ; strict ⇔
 *   ouvert ; les bords du faisceau sont les deux solutions de |x − a| = r.
 * Student action: steppers a / r, bascule ≤ / <, curseur x.
 * Controlled variable: a, r, strict, x.
 * Mathematical state: (module) ; l'intervalle éclairé est dérivé
 *   (absInequalitySet), le verdict aussi (satisfies).
 * Visual consequence: la bande s'étire symétriquement autour de a ; les
 *   crochets se ferment/s'ouvrent ; x passe vert/rouge ; |x − a| s'écrit.
 * Expected observation: le faisceau est toujours SYMÉTRIQUE ; ses bords
 *   sont a − r et a + r ; le bord lui-même n'est éclairé que si ≤.
 */
export default function BeamLine({
  a, r, strict = false, x, onA, onR, onX, onStrict,
  min = -10, max = 10, step = 1, snap = 0.5, rMax = 6, rStep = 0.5,
  showNotation = true, disabled = false,
}) {
  const I = absInequalitySet(a, r, strict);
  const lit = satisfies(x, a, r, strict);
  const dx = distance(x, a);
  const ineq = `|x − ${formatDec(a)}| ${strict ? '<' : '≤'} ${formatDec(r)}`;
  return (
    <div className="space-y-3" role="group" aria-label="Faisceau du phare">
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <RealLine
          min={min} max={max} step={step} snap={snap}
          intervals={I ? [{ id: 'beam', from: I.from, to: I.to, openFrom: I.openFrom, openTo: I.openTo, tone: 'amber', label: showNotation ? notation(I) : undefined }] : []}
          points={[{ id: 'a', value: a, label: `a = ${formatDec(a)}`, tone: 'amber' }]}
          handles={onX && !disabled ? [{ id: 'x', value: x, onChange: onX, label: `x = ${formatDec(x)}`, tone: lit ? 'emerald' : 'rose', ariaLabel: 'Bateau-test x' }] : []}
          disabled={disabled}
          ariaLabel={`Faisceau centré en ${formatDec(a)} de rayon ${formatDec(r)}, bateau en ${formatDec(x)} ${lit ? 'éclairé' : 'dans le noir'}`}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {onA && <Stepper label="centre a" value={a} onChange={onA} min={min + 1} max={max - 1} step={step} tone="amber" disabled={disabled} />}
        {onR && <Stepper label="rayon r" value={r} onChange={onR} min={0} max={rMax} step={rStep} tone="amber" disabled={disabled} />}
      </div>
      <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
        {onStrict && (
          <button type="button" disabled={disabled} aria-pressed={strict} onClick={() => onStrict(!strict)} aria-label={`Bord du faisceau : ${strict ? 'exclu (strictement moins de r)' : 'inclus (au plus r)'}`} className={`min-h-[44px] px-3 rounded-xl border-2 font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${strict ? 'bg-white border-rose-300 text-rose-700' : 'bg-emerald-600 border-emerald-700 text-white'}`}>
            {ineq} · bord {strict ? 'exclu' : 'inclus'}
          </button>
        )}
        {!onStrict && <span className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold">{ineq}</span>}
        <span className={`px-3 py-2 rounded-xl border-2 font-bold ${lit ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'}`} role="status">
          |{formatDec(x)} − {formatDec(a)}| = {formatDec(dx)} → {lit ? 'éclairé ✓' : 'dans le noir ✗'}
        </span>
      </div>
    </div>
  );
}
