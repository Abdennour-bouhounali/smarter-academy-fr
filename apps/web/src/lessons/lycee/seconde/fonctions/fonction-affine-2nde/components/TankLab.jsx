import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import MathText from '../../../../../common/components/MathText';
import { ParamSlider } from '../../../../../common/components/AffineExplorer';
import { affine, imageOf, affineTex, TANK, TANK_RANGE, formatDec } from './affineUtils';

/**
 * TankLab — l'interaction SIGNATURE : le réservoir.
 *
 * Activity               un réservoir de 40 L ; un robinet de débit a (L/min,
 *                        négatif = on vide), un volume de départ b ; une
 *                        horloge t (0 → 10 min). Le volume V(t) = a·t + b se
 *                        lit sur la cuve ET sur la courbe.
 * Mathematical objective a est ce que V gagne à chaque minute (un taux, le
 *                        même à chaque minute) ; b est V(0), la valeur de
 *                        départ ; a > 0 remplit, a < 0 vide, a = 0 stagne.
 * Student action         régler t (sonde), a et b (curseurs / ±) — un à la fois.
 * Controlled variables   t, a, b.
 * Mathematical state     { a, b, t } ; V et la courbe DÉRIVÉS (formatAffine partagé).
 * Visual consequence     la cuve se remplit / se vide ; la droite pivote (a)
 *                        ou glisse (b) ; l'escalier +1 → +a se dessine ;
 *                        le point (0 ; b) est marqué.
 * Expected observation   « +a litres chaque minute, toujours », « b est le
 *                        volume à t = 0 », « a négatif : la courbe descend ».
 *
 * Nombres dans le DOM ; la cuve est un rectangle sans texte.
 */
export default function TankLab({ a, b, t, onChange, lockA = false, lockB = false, lockT = false, disabled = false, showStaircase = false, showIntercept = true, showTable = false, frozen = false }) {
  const f = affine(a, b);
  const v = imageOf(f, t);
  const level = Math.max(0, Math.min(TANK.capacity, v));
  const empty = v <= 0; const overflow = v > TANK.capacity;
  const set = (patch) => !disabled && onChange?.({ a, b, t, ...patch });
  const btn = 'w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  return (
    <div className="space-y-3" role="group" aria-label="Le réservoir">
      <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-3 items-start">
        <div className="flex flex-col items-center gap-2">
          <svg viewBox="0 0 110 170" className="w-[110px] h-[170px] select-none" role="img" aria-label={`Cuve : ${formatDec(level)} litres sur ${TANK.capacity}${overflow ? ', déborde' : empty ? ', vide' : ''}`}>
            <rect x="15" y="10" width="80" height="150" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
            <rect x="18" y={13 + 144 * (1 - level / TANK.capacity)} width="74" height={144 * (level / TANK.capacity)} rx="3" fill={empty ? '#e2e8f0' : overflow ? '#f43f5e' : '#38bdf8'} opacity="0.85" />
            {[10, 20, 30].map((g) => <line key={g} x1="15" y1={13 + 144 * (1 - g / TANK.capacity)} x2="25" y2={13 + 144 * (1 - g / TANK.capacity)} stroke="#334155" strokeWidth="1.5" />)}
            <rect x="45" y="0" width="20" height="10" fill={a > 0 ? '#0ea5e9' : '#94a3b8'} />
            <rect x="95" y="140" width="15" height="8" fill={a < 0 ? '#0ea5e9' : '#94a3b8'} />
          </svg>
          <div className={`text-sm font-mono font-bold tabular-nums px-3 py-1.5 rounded-lg ${overflow ? 'bg-rose-100 text-rose-800' : empty ? 'bg-slate-200 text-slate-700' : 'bg-sky-100 text-sky-900'}`} aria-live="polite" data-volume={v}>
            {overflow ? `${formatDec(v)} L : ça déborde !` : empty ? `${formatDec(v)} L : vide` : `${formatDec(v)} L`}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-center py-2 px-3 rounded-xl bg-slate-900 text-white"><MathText>{`$${affineTex(f, { name: 'V', variable: 't' })}$`}</MathText></div>
          <CoordPlane range={TANK_RANGE} unit={30} unitY={5} xStep={1} yStep={10} functions={[{ id: 'V', a, b, tone: 'sky' }]}
            cursor={{ x: t }} intercept={showIntercept ? { y: b, label: `b = ${formatDec(b)}` } : null}
            staircase={showStaircase && a !== 0 ? (() => { /* l'escalier reste à droite de l'étiquette « b = … » */ const x0 = Math.min(Math.max(t, 3), 9); return { from: { x: x0, y: imageOf(f, x0) }, a, run: 1 }; })() : null}
            frozen={frozen} disabled={disabled} axisLabels={{ x: 't', y: 'V' }} caption={false}
            ariaLabel={`Courbe du volume : V(t) = ${formatDec(a)} t + ${formatDec(b)}, sonde à t = ${formatDec(t)} min`} />
        </div>
      </div>
      {!disabled && !frozen && (
        <div className="space-y-2">
          {!lockT && (
            <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Horloge">
              <span className="text-sm font-bold text-slate-700 w-14 shrink-0">t</span>
              <button type="button" className={btn} onClick={() => set({ t: Math.max(0, t - 1) })} disabled={t <= 0} aria-label="Reculer d’une minute">−</button>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-mono font-bold tabular-nums text-sm">t = {formatDec(t)} min</span>
              <button type="button" className={btn} onClick={() => set({ t: Math.min(TANK.tMax, t + 1) })} disabled={t >= TANK.tMax} aria-label="Avancer d’une minute">+</button>
            </div>
          )}
          <ParamSlider label="a" ariaLabel="le débit a" value={a} onChange={(val) => set({ a: val })} min={TANK.aMin} max={TANK.aMax} step={TANK.aStep} tone="indigo" unit=" L/min" disabled={lockA} />
          <ParamSlider label="b" ariaLabel="le volume initial b" value={b} onChange={(val) => set({ b: val })} min={TANK.bMin} max={TANK.bMax} step={TANK.bStep} tone="amber" unit=" L" disabled={lockB} />
        </div>
      )}
      {showTable && (
        <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
          <table className="w-full text-sm font-mono tabular-nums">
            <caption className="sr-only">Volume minute par minute</caption>
            <thead><tr className="bg-slate-50 text-slate-600"><th scope="row" className="px-3 py-2 text-left font-bold">t (min)</th>{[0, 1, 2, 3, 4, 5].map((k) => <td key={k} className="px-2 py-2 text-center">{k}</td>)}</tr></thead>
            <tbody>
              <tr className="border-t border-slate-100"><th scope="row" className="px-3 py-2 text-left font-bold">V (L)</th>{[0, 1, 2, 3, 4, 5].map((k) => <td key={k} className="px-2 py-2 text-center font-bold text-slate-800">{formatDec(imageOf(f, k))}</td>)}</tr>
              <tr className="border-t border-slate-100 bg-indigo-50/40"><th scope="row" className="px-3 py-2 text-left font-bold text-indigo-800">+ par minute</th>{[0, 1, 2, 3, 4, 5].map((k) => <td key={k} className="px-2 py-2 text-center text-indigo-700">{k === 0 ? '' : `${a >= 0 ? '+' : ''}${formatDec(a)}`}</td>)}</tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
