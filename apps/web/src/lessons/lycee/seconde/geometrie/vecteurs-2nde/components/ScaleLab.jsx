import React from 'react';
import VectorScene, { SCENE_COLORS, VecName } from './VectorScene';
import Stepper from './Stepper';
import { RANGE, add, scale, inRange, formatNum, formatVec, isZero, attributesOf, normText } from './vecteurUtils';

/**
 * ScaleLab — multiplier un vecteur par un réel.
 *
 * ACTION            l'élève règle k (curseur, stepper au demi, clavier).
 * CHANGEMENT        la flèche k·u se redessine depuis la même origine ; u
 *                   reste en fantôme pour comparer.
 * OBSERVATION       k > 0 : même sens, longueur multipliée par k ;
 *                   k < 0 : la flèche se retourne, même direction ;
 *                   k = 0 : le vecteur nul (un anneau).
 * SENS MATHÉMATIQUE k·u a pour coordonnées (k·x ; k·y) ; deux vecteurs qui
 *                   sont l'un un multiple de l'autre sont colinéaires.
 *
 * Les valeurs de k sont bornées pour que k·u reste dans le cadre.
 */
export default function ScaleLab({
  origin,
  u,
  k,
  onK,
  range = RANGE,
  kMin = -3,
  kMax = 3,
  step = 0.5,
  names = { u: 'u' },
  showCoords = true,
  disabled = false,
  ariaLabel,
}) {
  const ku = scale(u, k);
  const tip = add(origin, ku);

  // Bornes effectives : chaque k du curseur doit laisser k·u dans le cadre.
  const allowed = (kk) => inRange(add(origin, scale(u, kk)), range);
  let lo = kMin;
  while (lo < kMax && !allowed(lo)) lo += step;
  let hi = kMax;
  while (hi > kMin && !allowed(hi)) hi -= step;

  const setK = (next) => {
    if (disabled) return;
    const r = Math.round(next / step) * step;
    if (r < lo || r > hi) return;
    onK?.(r);
  };

  const attrs = isZero(ku) ? null : attributesOf(u, ku);
  const kLabel = formatNum(k);
  const kuName = k === 1 ? names.u : `${kLabel}·${names.u}`;
  const points = [{ id: 'O', name: 'A', x: origin.x, y: origin.y, color: '#4f46e5' }];
  const arrows = [
    { id: 'u', from: origin, to: add(origin, u), ghost: true, name: names.u },
    { id: 'ku', from: origin, to: tip, color: k < 0 ? SCENE_COLORS.sum : SCENE_COLORS.main, name: kuName, width: 3.5 },
  ];

  const sens = !attrs ? 'vecteur nul' : attrs.sens ? 'même sens' : 'sens contraire';
  const ratio = normText(u).value === 0 ? 0 : normText(ku).value / normText(u).value;

  return (
    <div className="space-y-3">
      <VectorScene range={range} points={points} arrows={arrows} disabled={disabled}
        ariaLabel={ariaLabel ?? `Repère — ${kuName} depuis A`} />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 flex-1 min-w-[220px]">
          k
          <input
            type="range" min={lo} max={hi} step={step} value={k}
            onChange={(e) => setK(Number(e.target.value))}
            disabled={disabled}
            aria-label="Réel k"
            aria-valuetext={`k = ${kLabel}`}
            className="flex-1 accent-violet-600 h-11"
          />
        </label>
        <Stepper label="k" value={k} onChange={setK} min={lo} max={hi} step={step} tone="indigo" disabled={disabled} />
      </div>
      {showCoords && (
        <div className="text-sm space-y-1" aria-live="polite">
          <p className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono font-bold tabular-nums"><VecName>{names.u}</VecName> {formatVec(u)}</span>
            <span className={`px-3 py-1 rounded-lg font-mono font-bold tabular-nums ${k < 0 ? 'bg-amber-100 text-amber-900' : 'bg-violet-100 text-violet-900'}`}>
              {kLabel}·<VecName>{names.u}</VecName> ({kLabel} × {formatNum(u.x)} ; {kLabel} × {formatNum(u.y)}) = {formatVec(ku)}
            </span>
          </p>
          <p className="text-slate-600">
            {attrs ? (
              <>Même direction · <strong>{sens}</strong> · longueur × <strong>{formatNum(ratio)}</strong></>
            ) : (
              <>k = 0 : le déplacement est <strong>nul</strong> — la flèche a disparu, il reste un point.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
