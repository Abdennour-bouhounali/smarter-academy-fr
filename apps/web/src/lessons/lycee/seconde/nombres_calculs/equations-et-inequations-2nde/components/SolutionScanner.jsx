import React from 'react';
import { formatDec } from '@smarter-academy/core';
import RealLine from '../../../../../common/components/RealLine';
import Stepper from './Stepper';
import { evalLin, formatLin, relationAt, solveLinearEq, solveLinearIneq, fracValue } from './eqUtils';

/**
 * SolutionScanner — deux expressions, un curseur x, deux barres
 * (manipulation signature, module 1).
 *
 * Activity: balayer x et comparer L(x) et R(x) ; repérer l'égalité ; voir
 *   la région où L(x) < R(x) s'allumer sur la droite.
 * Mathematical objective: « résoudre » = trouver TOUTES les valeurs de x
 *   qui rendent une égalité (une valeur, ici) ou une inégalité (une
 *   demi-droite entière) vraie.
 * Student action: curseur (glisser / clavier) et stepper.
 * Controlled variable: x.
 * Mathematical state: x (module) ; L, R constants ; barres, relation,
 *   région et point d'égalité DÉRIVÉS (evalLin, solveLinearEq/Ineq).
 * Visual consequence: les deux barres DOM s'allongent ; le badge dit <, =
 *   ou > ; sur la droite, le point d'égalité (vert) et la région où la
 *   relation demandée tient.
 * Expected observation: une seule valeur de x rend les prix égaux ; une
 *   infinité rendent A moins cher ; deux droites parallèles ne se croisent
 *   jamais.
 * Misconception targeted: « une inéquation a une solution », « résoudre =
 *   deviner une valeur qui marche ».
 *
 * SÉCURITÉ D'AFFICHAGE : barres en DOM (pourcentage d'une piste, scaleMax =
 * plus grande valeur atteignable sur [min ; max]) ; nombres dans leur
 * colonne ; la droite RealLine borne ses étiquettes.
 */
export default function SolutionScanner({
  L, R, labelL = 'A', labelR = 'B', unit = '€', x, onX, min = 0, max = 10, step = 1, snap = 0.5,
  showRegion = null,   // '<' | '>' | null : allume la région où L op R
  showRoot = false,
  disabled = false,
}) {
  const l = evalLin(L, x); const r = evalLin(R, x);
  const rel = relationAt(L, R, x);
  const sol = solveLinearEq(L, R);
  const root = sol.kind === 'one' ? fracValue(sol.x) : null;
  const region = showRegion ? solveLinearIneq(L, R, showRegion) : null;
  const scaleMax = Math.max(1, ...[min, max].flatMap((v) => [Math.abs(evalLin(L, v)), Math.abs(evalLin(R, v))]));
  const pct = (v) => `${Math.min(100, (Math.abs(v) / scaleMax) * 100)}%`;
  const relText = rel === '=' ? `${labelL} = ${labelR}` : rel === '<' ? `${labelL} < ${labelR}` : `${labelL} > ${labelR}`;

  const intervals = [];
  if (region && !region.kind) intervals.push({ id: 'reg', from: Math.max(region.from, min), to: Math.min(region.to, max), openFrom: Number.isFinite(region.from) && region.from >= min ? region.openFrom : false, openTo: Number.isFinite(region.to) && region.to <= max ? region.openTo : false, tone: 'emerald', label: `${labelL} ${showRegion} ${labelR}` });
  const points = [];
  if (showRoot && root !== null && root >= min && root <= max) points.push({ id: 'root', value: root, label: `${labelL} = ${labelR}`, tone: 'emerald' });

  const Bar = ({ label, f, value, tone }) => (
    <div className="grid grid-cols-[3.2rem_1fr_5.5rem] items-center gap-2 text-sm font-mono">
      <span className={`font-bold ${tone === 'indigo' ? 'text-indigo-700' : 'text-amber-700'}`}>{label}</span>
      <div className="h-6 rounded-lg bg-slate-100 overflow-hidden" aria-hidden="true">
        <div className={`h-full rounded-lg ${tone === 'indigo' ? 'bg-indigo-500' : 'bg-amber-500'} ${value < 0 ? 'opacity-40' : ''}`} style={{ width: pct(value), transition: 'width 120ms linear' }} />
      </div>
      <span className="text-right font-extrabold tabular-nums text-slate-800" aria-label={`${label} vaut ${formatDec(value)}${unit ? ` ${unit}` : ''}`}>{formatDec(value)}{unit && ` ${unit}`}</span>
      <span className="col-span-3 text-[11px] text-slate-500 -mt-1">{label} = {formatLin(f)}</span>
    </div>
  );

  return (
    <div className="space-y-3" role="group" aria-label="Scanner de solutions">
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
        <Bar label={labelL} f={L} value={l} tone="indigo" />
        <Bar label={labelR} f={R} value={r} tone="amber" />
        <div className={`inline-block px-3 py-1.5 rounded-lg font-mono font-extrabold ${rel === '=' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'}`} role="status" aria-live="polite">
          x = {formatDec(x)} : {relText}{rel === '=' && ' — égalité !'}
        </div>
      </div>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <RealLine
          min={min} max={max} step={step} snap={snap}
          intervals={intervals} points={points}
          handles={disabled ? [] : [{ id: 'x', value: x, onChange: onX, label: `x = ${formatDec(x)}`, tone: rel === '=' ? 'emerald' : 'indigo', ariaLabel: 'Curseur x' }]}
          disabled={disabled}
          ariaLabel={`Axe des x de ${formatDec(min)} à ${formatDec(max)}, curseur en ${formatDec(x)}`}
        />
      </div>
      {!disabled && <Stepper label="x" value={x} onChange={onX} min={min} max={max} step={snap} />}
    </div>
  );
}
