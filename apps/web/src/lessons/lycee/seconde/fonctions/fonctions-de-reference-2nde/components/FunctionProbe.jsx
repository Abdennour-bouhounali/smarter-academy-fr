import React from 'react';
// (copié-adapté de fonctions-2nde/components/FunctionProbe.jsx le 2026-09-06 — §6ter.6)
import CoordPlane from '../../../../../common/components/CoordPlane';
import { imageOf, antecedentsOf, curvePieces, inDomain, domainText, formatDec } from './referenceUtils';

/**
 * FunctionProbe — promener une sonde sur la courbe d'une fonction.
 *
 * Activity               un guide vertical (une valeur de x) ou horizontal
 *                        (une valeur de y) que l'élève déplace.
 * Mathematical objective la dissymétrie image / antécédent : un x donne UNE
 *                        image (ou aucune, hors de l'ensemble de définition) ;
 *                        un y peut avoir 0, 1, 2… antécédents. Sur une réunion
 *                        d'intervalles, la sonde tombe dans le trou.
 * Student action         glisser le guide, l'avancer d'un cran (− / +), clavier.
 * Controlled variable    la position du guide sur l'axe choisi.
 * Mathematical state     { mode, value } ; image et antécédents CALCULÉS par
 *                        fonctionsUtils — le texte ne peut pas contredire le dessin.
 * Visual consequence     mode x : un seul point s'allume (ou aucun) ; mode y :
 *                        tous les points d'intersection d'un coup.
 *
 * Les lectures vivent dans le DOM, jamais en <text> SVG (§17bis).
 */
export default function FunctionProbe({
  f, range, xStep = 1, yStep = 1, unit = 34, unitY = null,
  mode = 'x', value, onChange, onModeChange = null,
  xUnit = '', yUnit = '', axisLabels = { x: 'x', y: 'y' }, tone = 'indigo',
  extraPoints = [], highlightIntervals = [], disabled = false, frozen = false, ariaLabel,
  labelEvery = null, readout = null,
}) {
  const locked = disabled || frozen;
  const pieces = curvePieces(f, range);
  const curves = pieces.map((pc, i) => ({ id: `${f.name}${i}`, points: pc, tone, width: 2.5 }));
  const y = mode === 'x' ? imageOf(f, value) : null;
  const xs = mode === 'y' ? antecedentsOf(f, value, range) : [];
  const marks = mode === 'x'
    ? (y === null ? [] : [{ id: 'img', x: value, y, color: '#0284c7' }])
    : xs.map((x, i) => ({ id: `ant${i}`, x, y: value, color: '#059669' }));
  const step = mode === 'y' ? yStep : xStep;
  const lo = mode === 'y' ? range.yMin : range.xMin;
  const hi = mode === 'y' ? range.yMax : range.xMax;
  const bump = (d) => !locked && onChange?.(Math.max(lo, Math.min(hi, Math.round((value + d * step) / step) * step)));
  const btn = 'w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const chip = (on) => `flex-1 min-h-[44px] rounded-xl border-2 text-sm font-semibold transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${on ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-sky-400'}`;
  const fx = (v) => `${formatDec(v)}${xUnit}`;
  const fy = (v) => `${formatDec(v)}${yUnit}`;

  const defaultReadout = mode === 'x' ? (
    y === null ? (
      <p className="text-slate-800">Pour <strong className="font-mono">{axisLabels.x} = {fx(value)}</strong> : <strong className="text-rose-700">aucune image</strong> — {formatDec(value)} n’est pas dans l’ensemble de définition {domainText(f.domain)}.</p>
    ) : (
      <p className="text-slate-800">Pour <strong className="font-mono">{axisLabels.x} = {fx(value)}</strong>, la courbe donne <strong className="font-mono text-sky-700">{f.name}({formatDec(value)}) = {fy(y)}</strong> — c’est le point <strong className="font-mono">({formatDec(value)} ; {formatDec(y)})</strong>.</p>
    )
  ) : (
    <p className="text-slate-800">La valeur <strong className="font-mono">{fy(value)}</strong> est atteinte <strong className="font-mono text-emerald-700">{xs.length === 0 ? 'jamais' : xs.length === 1 ? 'une fois' : `${xs.length} fois`}</strong>{xs.length > 0 && <> : pour {axisLabels.x} {xs.length > 1 ? '≈' : '='} {xs.map((x) => fx(Math.round(x * 10) / 10)).join(' et ')}</>}.</p>
  );

  return (
    <div className="space-y-3">
      {onModeChange && !frozen && (
        <div className="flex gap-2" role="group" aria-label="Sens de lecture">
          <button type="button" className={chip(mode === 'x')} aria-pressed={mode === 'x'} disabled={locked} onClick={() => onModeChange('x')}>{`Un ${axisLabels.x} → son image`}</button>
          <button type="button" className={chip(mode === 'y')} aria-pressed={mode === 'y'} disabled={locked} onClick={() => onModeChange('y')}>{`Un ${axisLabels.y} → ses antécédents`}</button>
        </div>
      )}
      <CoordPlane
        range={range} unit={unit} unitY={unitY} xStep={xStep} yStep={yStep} labelEvery={labelEvery}
        curves={curves}
        readGuides={locked ? null : { mode, value, onChange }}
        points={[...marks, ...extraPoints]}
        highlightIntervals={highlightIntervals}
        frozen={frozen} disabled={locked}
        axisLabels={axisLabels} caption={false}
        ariaLabel={ariaLabel ?? `Repère : courbe de ${f.name}, sonde ${mode === 'x' ? 'verticale' : 'horizontale'}`}
      />
      {!locked && (
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Déplacer la sonde">
          <button type="button" className={btn} onClick={() => bump(-1)} disabled={value <= lo} aria-label="Reculer la sonde">−</button>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm">{mode === 'x' ? `${axisLabels.x} = ${fx(value)}` : `${axisLabels.y} = ${fy(value)}`}</span>
          <button type="button" className={btn} onClick={() => bump(1)} disabled={value >= hi} aria-label="Avancer la sonde">+</button>
        </div>
      )}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm" aria-live="polite">
        {readout ? readout({ mode, value, y, xs }) : defaultReadout}
      </div>
    </div>
  );
}
