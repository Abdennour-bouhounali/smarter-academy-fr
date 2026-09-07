import React from 'react';
import { ParamSlider } from '../../../../../common/components/AffineExplorer';
import SignProbe from './SignProbe';
import SignTable from './SignTable';
import { affine, affineText, AFFINE_RANGE, formatDec, roundTo } from './signeUtils';

/**
 * AffineSignLab — le signe d'une fonction affine, sous les doigts.
 *
 * Activity               f(x) = ax + b avec deux curseurs ; l'axe est peint
 *                        ENTIÈREMENT selon le signe, le zéro est marqué.
 * Student action         régler b (le zéro glisse), puis a (le côté + bascule).
 * Expected observation   « le zéro est en −b/a » ; « à droite du zéro, le
 *                        signe est celui de a ».
 * Un paramètre verrouillé reste VISIBLE (pédagogie §8).
 */
export default function AffineSignLab({ a, b, onChange, lockA = false, lockB = false, disabled = false, showTable = true }) {
  const f = affine(a, b, 'f');
  const zero = a === 0 ? null : roundTo(-b / a, 6);
  return (
    <div className="space-y-3">
      <div className="text-center py-2 px-3 rounded-xl bg-slate-900 text-white font-mono font-bold">f(x) = {affineText(a, b)}</div>
      <SignProbe f={f} range={AFFINE_RANGE} unit={34} xStep={0.5} yStep={1} value={zero !== null && zero >= -5 && zero <= 5 ? zero : 0} paintAll showZeros="all" frozen />
      {!disabled && (
        <div className="space-y-2">
          <ParamSlider label="a" ariaLabel="le coefficient a" value={a} onChange={(v) => onChange({ a: v, b })} min={-3} max={3} step={0.5} tone="indigo" disabled={lockA} />
          <ParamSlider label="b" ariaLabel="l’ordonnée à l’origine b" value={b} onChange={(v) => onChange({ a, b: v })} min={-4} max={4} step={0.5} tone="amber" disabled={lockB} />
        </div>
      )}
      <div className="flex flex-wrap gap-2 text-sm font-mono font-bold tabular-nums" aria-live="polite">
        <span className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900" data-zero={zero ?? 'none'}>{zero === null ? (b === 0 ? 'f(x) = 0 pour tout x' : 'aucun zéro : f est constante') : `zéro : x = ${formatDec(zero)}`}</span>
        <span className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900">a {a > 0 ? '> 0' : a < 0 ? '< 0' : '= 0'}</span>
      </div>
      {showTable && a !== 0 && <SignTable f={f} showFactors={false} />}
    </div>
  );
}
