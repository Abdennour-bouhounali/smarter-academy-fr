import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { NumberField } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { REFERENCES, imageOf, curvePieces, inRange, LAB_RANGE, formatDec, parseDec } from './referenceUtils';

/**
 * ThreeMachines — l'interaction SIGNATURE : trois machines, une sonde.
 *
 * Activity               un nombre x entre dans TROIS machines à la fois :
 *                        x², 1/x, |x|. Trois sorties, trois points sur un
 *                        même repère.
 * Mathematical objective les trois références se comportent très différemment
 *                        pour la même entrée : symétrie (x et −x), refus de 0
 *                        par l'inverse, explosion près de 0 (1/x) et loin de 0
 *                        (x²), et chaque famille de points dessine SA courbe.
 * Student action         toucher une pastille (−4 … 4 par 0,5) ou taper son
 *                        propre nombre ; les sorties s'affichent ; les points
 *                        s'accumulent ; les courbes apparaissent après six entrées.
 * Controlled variable    x, l'entrée.
 * Mathematical state     { x, tested: x[] } ; les sorties sont CALCULÉES.
 * Visual consequence     trois sorties dans le DOM (ou « refusé » pour 1/0),
 *                        trois points, trois courbes.
 * Expected observation   « −3 et 3 donnent le même carré et la même valeur
 *                        absolue, mais des inverses opposés » ; « 0,1 fait
 *                        exploser 1/x, 100 fait exploser x² ».
 * Misconception targeted « 1/0 = 0 » ; « (−3)² = −9 » ; « |−3| = −3 ».
 *
 * Nombres dans le DOM uniquement ; hors du cadre, un point n'est pas dessiné
 * mais sa valeur reste lue (« hors du cadre »).
 */
export default function ThreeMachines({ x, onChange, tested = [], showCurves = false, disabled = false, allowCustom = true, xs = [-4, -3, -2, -1, -0.5, 0, 0.5, 1, 2, 3, 4] }) {
  const [draft, setDraft] = React.useState('');
  const [draftError, setDraftError] = React.useState(null);
  const pick = (v) => { if (!disabled) onChange(v); };
  const useDraft = () => {
    if (disabled) return;
    const v = parseDec(draft);
    if (!Number.isFinite(v)) { setDraftError('Écris un nombre, par exemple 0,1 ou −25.'); return; }
    if (Math.abs(v) > 1000) { setDraftError('Reste entre −1 000 et 1 000.'); return; }
    setDraftError(null); setDraft(''); pick(v);
  };
  const points = tested.flatMap((t) => REFERENCES.map((f) => {
    const y = imageOf(f, t);
    return y === null || !inRange(LAB_RANGE, t, y) ? null : { id: `${f.id}-${t}`, x: t, y, color: f.color };
  }).filter(Boolean));
  const curves = showCurves ? REFERENCES.flatMap((f) => curvePieces(f, LAB_RANGE).map((pc, i) => ({ id: `${f.id}${i}`, points: pc, tone: f.color, width: 2 }))) : [];
  const chip = (on) => `min-w-[44px] h-11 px-3 rounded-xl border-2 font-mono font-bold tabular-nums transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 ${on ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'}`;

  return (
    <div className="space-y-3" role="group" aria-label="Trois machines à nombres">
      {!disabled && (
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {xs.map((v) => (
            <button key={v} type="button" onClick={() => pick(v)} aria-pressed={v === x} aria-label={`Entrée ${formatDec(v)}`} className={chip(v === x)} style={{ touchAction: 'manipulation' }}>{formatDec(v)}</button>
          ))}
        </div>
      )}
      {allowCustom && !disabled && (
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-slate-600">ou ton nombre :</span>
            <NumberField value={draft} onChange={(v) => { setDraft(v); if (draftError) setDraftError(null); }} onEnter={useDraft} ariaLabel="Ton propre nombre d’entrée" width="w-24" size="sm" />
            <button type="button" onClick={useDraft} disabled={draft === ''} className="min-h-[44px] px-3 rounded-xl border-2 border-slate-200 bg-white font-semibold text-slate-700 hover:border-indigo-400 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500">Utiliser</button>
          </div>
          {draftError && <p className="text-center text-xs text-rose-700" role="status">{draftError}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" aria-live="polite">
        {REFERENCES.map((f) => {
          const y = imageOf(f, x);
          const out = y === null ? null : inRange(LAB_RANGE, x, y);
          return (
            <div key={f.id} className="rounded-2xl border-2 bg-white p-3 text-center space-y-1" style={{ borderColor: f.color }}>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">entrée {formatDec(x)}</div>
              <div className="rounded-lg px-2 py-1.5 text-white font-bold" style={{ backgroundColor: f.color }}><MathText>{`$${f.tex.split(' = ')[1]}$`}</MathText></div>
              <div className={`font-mono font-bold text-lg tabular-nums ${y === null ? 'text-rose-700 text-sm' : 'text-slate-900'}`} data-machine={f.id} data-output={y === null ? 'refuse' : y}>
                {y === null ? 'refusé : on ne divise pas par 0' : formatDec(y)}
              </div>
              {y !== null && out === false && <div className="text-xs text-slate-500">hors du cadre du repère</div>}
            </div>
          );
        })}
      </div>
      <CoordPlane range={LAB_RANGE} unit={34} unitY={30} xStep={1} yStep={1} points={points} curves={curves} cursor={{ x: Math.max(LAB_RANGE.xMin, Math.min(LAB_RANGE.xMax, x)) }} caption={false}
        ariaLabel={`Repère : ${tested.length} entrée(s) testée(s), points de x², 1/x et |x|`} />
      <div className="flex flex-wrap gap-3 text-xs font-semibold">
        {REFERENCES.map((f) => <span key={f.id} className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} /> {f.label}</span>)}
        <span className="text-slate-500">· {tested.length} entrée{tested.length > 1 ? 's' : ''} testée{tested.length > 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
