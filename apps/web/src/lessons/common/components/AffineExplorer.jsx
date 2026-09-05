import React from 'react';
import CoordPlane from './CoordPlane';
import MathText from './MathText';
import { formatAffine, formatDec, roundTo } from '@smarter-academy/core';

/**
 * AffineExplorer — les boutons a et b, et la droite qui répond.
 *
 * ACTION             l'élève règle a (et b) au doigt ou au pas ± .
 * CHANGEMENT         la droite pivote (a) ou glisse verticalement (b) ; le
 *                    point (0 ; b) suit ; l'escalier +1 → +a se redessine.
 * OBSERVATION        a et b ne font PAS le même travail ; b ne change jamais
 *                    l'inclinaison, a ne change jamais le point de départ.
 * SENS MATHÉMATIQUE  dans f(x) = ax + b, a est un taux (de combien ça monte
 *                    quand x avance de 1) et b une valeur initiale (f(0)).
 *
 * UN SEUL ÉTAT : {a, b} appartient au module. Le bandeau d'expression, la
 * droite, le point d'ordonnée à l'origine et le tableau en sont tous DÉRIVÉS —
 * ils ne peuvent pas se contredire.
 *
 * `showB={false}` donne la fonction linéaire : b est figé à 0, la droite pivote
 * autour de l'origine, et le réglage de b n'existe simplement pas.
 */

/** Un réglage de paramètre : glissière + pas ± + valeur lue. Tap-first. */
export function ParamSlider({
  label, value, onChange, min, max, step = 0.5,
  tone = 'indigo', unit = '', disabled = false, ariaLabel,
}) {
  const TONE = {
    indigo: 'bg-indigo-600', emerald: 'bg-emerald-600',
    amber: 'bg-amber-600', rose: 'bg-rose-600', sky: 'bg-sky-600',
  };
  const clamp = (v) => Math.max(min, Math.min(max, roundTo(v, 6)));
  const bump = (d) => !disabled && onChange(clamp(value + d * step));

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-bold text-slate-700 w-14 shrink-0">{label}</span>
      <button
        type="button" onClick={() => bump(-1)} disabled={disabled || value <= min}
        aria-label={`Diminuer ${ariaLabel ?? label}`}
        className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500"
      >−</button>
      <input
        type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        onChange={(e) => onChange(clamp(parseFloat(e.target.value)))}
        aria-label={ariaLabel ?? label}
        aria-valuetext={`${formatDec(value)}${unit}`}
        className="flex-1 min-w-[110px] h-11 accent-indigo-600"
        style={{ touchAction: 'manipulation' }}
      />
      <button
        type="button" onClick={() => bump(1)} disabled={disabled || value >= max}
        aria-label={`Augmenter ${ariaLabel ?? label}`}
        className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500"
      >+</button>
      <span className={`px-2.5 py-1 rounded-lg text-white font-mono font-bold tabular-nums text-sm ${TONE[tone] ?? TONE.indigo}`}>
        {formatDec(value)}{unit}
      </span>
    </div>
  );
}

export default function AffineExplorer({
  a,
  b = 0,
  onChange,                       // ({a, b}) => void
  showB = false,
  aRange = { min: -3, max: 3, step: 0.5 },
  bRange = { min: -5, max: 5, step: 1 },
  range = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
  variable = 'x',
  name = 'f',
  showStaircase = false,
  showIntercept = true,
  // Un paramètre verrouillé garde son réglage VISIBLE mais désactivé : l'élève
  // voit qu'il existe et qu'il ne bouge pas (pédagogie §8, une variable à la
  // fois). Masquer le curseur laisserait croire que le paramètre a disparu.
  lockA = false,
  lockB = false,
  compareWith = null,             // { a, b, label, tone } — deuxième droite figée
  points = [],
  disabled = false,
  frozen = false,
  caption = null,
  unit = '',
}) {
  const locked = disabled || frozen;
  const set = (patch) => !locked && onChange?.({ a, b, ...patch });

  const functions = [
    { id: 'f', a, b, tone: 'indigo', label: name },
    ...(compareWith
      ? [{ id: 'g', a: compareWith.a, b: compareWith.b ?? 0, tone: compareWith.tone ?? 'rose',
           label: compareWith.label ?? 'g', dashed: true }]
      : []),
  ];

  return (
    <div className="space-y-3">
      {/* Le bandeau d'expression : écrit par formatAffine, jamais à la main —
          c'est ce qui évite « f(x) = 0x » et « 0.5x » avec un point. */}
      <div className="text-center py-2.5 px-3 rounded-xl bg-slate-900 text-white">
        <MathText>{`$${formatAffine(a, showB ? b : 0, { variable, name })}$`}</MathText>
      </div>

      <CoordPlane
        range={range}
        functions={functions}
        points={points}
        intercept={showIntercept && showB ? { y: b } : null}
        staircase={showStaircase ? { from: { x: 0, y: showB ? b : 0 }, a, run: 1 } : null}
        frozen={frozen}
        disabled={locked}
        caption={false}
        ariaLabel={`Repère : droite d'équation ${formatAffine(a, showB ? b : 0, { variable, name })}`}
      />

      {!frozen && (
        <div className="space-y-2">
          <ParamSlider
            label="a" ariaLabel="le coefficient a" value={a}
            onChange={(v) => set({ a: v })}
            min={aRange.min} max={aRange.max} step={aRange.step ?? 0.5}
            tone="indigo" disabled={locked || lockA}
          />
          {showB && (
            <ParamSlider
              label="b" ariaLabel="l'ordonnée à l'origine b" value={b}
              onChange={(v) => set({ b: v })}
              min={bRange.min} max={bRange.max} step={bRange.step ?? 1}
              tone="amber" unit={unit} disabled={locked || lockB}
            />
          )}
        </div>
      )}

      {caption}
    </div>
  );
}
