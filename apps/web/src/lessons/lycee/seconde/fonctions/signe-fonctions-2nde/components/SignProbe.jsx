import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { curvePieces, signAt, imageOf, formatDec, SIGN_LABEL } from './signeUtils';

/**
 * SignProbe — l'interaction SIGNATURE : au-dessus ou en dessous ?
 *
 * Activity               une sonde verticale balaie la courbe ; le point
 *                        s'allume en vert (au-dessus de l'axe), rose (en
 *                        dessous) ou ambre (sur l'axe) ; et l'axe des
 *                        abscisses SE PEINT sous la sonde, case par case, de
 *                        la couleur du signe.
 * Mathematical objective le signe de f(x) EST la position de la courbe par
 *                        rapport à l'axe ; il ne change qu'aux zéros ; l'axe
 *                        peint est déjà un tableau de signes.
 * Student action         glisser la sonde, ou l'avancer d'un cran (− / +), clavier.
 * Controlled variable    x.
 * Mathematical state     { x, visited: x[] } ; signe et image CALCULÉS.
 * Visual consequence     point coloré, axe peint, zéro marqué quand on tombe dessus.
 * Expected observation   « le signe change exactement là où la courbe traverse l'axe ».
 * Misconception targeted « le signe de f(x) est le signe de x » ; « la courbe
 *                        peut changer de signe sans toucher l'axe ».
 *
 * Nombres dans le DOM ; l'axe peint est fait de rectangles sans texte.
 */
const COLOR = { '+': '#059669', '−': '#e11d48', '0': '#d97706' };

export default function SignProbe({ f, range, unit, unitY = null, xStep = 1, yStep = 1, value, onChange, visited = [], paintAll = false, showZeros = 'found', disabled = false, frozen = false, axisLabels = { x: 'x', y: 'y' }, xUnit = '', yUnit = '', highlightIntervals = [], labelEvery = null }) {
  const locked = disabled || frozen;
  const curves = curvePieces(f, range).map((pc, i) => ({ id: `${f.name}${i}`, points: pc, tone: '#4f46e5', width: 2.5 }));
  const y = imageOf(f, value);
  const s = signAt(f, value);
  const points = y !== null && y >= range.yMin && y <= range.yMax ? [{ id: 'probe', x: value, y, color: COLOR[s] ?? '#64748b' }] : [];
  const lo = f.domain[0] === null ? range.xMin : Math.max(range.xMin, f.domain[0]);
  const hi = f.domain[1] === null ? range.xMax : Math.min(range.xMax, f.domain[1]);
  const cellsToPaint = paintAll ? Array.from({ length: Math.round((hi - lo) / xStep) + 1 }, (_, i) => lo + i * xStep) : visited;
  const zerosShown = showZeros === 'all' ? f.zeros : showZeros === 'found' ? f.zeros.filter((z) => visited.includes(z) || paintAll) : [];
  const overlay = (toSvg) => (
    <g>
      {cellsToPaint.map((cx) => {
        const sg = signAt(f, cx);
        if (!sg || sg === '0') return null;
        const a = toSvg(Math.max(lo, cx - xStep / 2), 0); const b = toSvg(Math.min(hi, cx + xStep / 2), 0);
        return <rect key={`c${cx}`} x={a.x} y={a.y - 5} width={Math.max(0, b.x - a.x)} height={10} fill={COLOR[sg]} opacity={0.55} rx={2} />;
      })}
      {zerosShown.map((z) => { const p = toSvg(z, 0); return <circle key={`z${z}`} cx={p.x} cy={p.y} r={7} fill="#d97706" stroke="#fff" strokeWidth={2} />; })}
    </g>
  );
  const bump = (d) => !locked && onChange?.(Math.max(lo, Math.min(hi, Math.round((value + d * xStep) / xStep) * xStep)));
  const btn = 'w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  return (
    <div className="space-y-3">
      <CoordPlane range={range} unit={unit} unitY={unitY} xStep={xStep} yStep={yStep} labelEvery={labelEvery} curves={curves} points={points} overlay={overlay}
        readGuides={locked ? null : { mode: 'x', value, onChange }} highlightIntervals={highlightIntervals} frozen={frozen} disabled={locked} axisLabels={axisLabels} caption={false}
        ariaLabel={`Courbe de ${f.name} : sonde en ${axisLabels.x} = ${formatDec(value)}, ${f.name}(${formatDec(value)}) ${y === null ? 'n’existe pas' : `= ${formatDec(y)}, ${SIGN_LABEL[s]}`}`} />
      {!locked && (
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Déplacer la sonde">
          <button type="button" className={btn} onClick={() => bump(-1)} disabled={value <= lo} aria-label="Reculer la sonde">−</button>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm">{axisLabels.x} = {formatDec(value)}{xUnit}</span>
          <button type="button" className={btn} onClick={() => bump(1)} disabled={value >= hi} aria-label="Avancer la sonde">+</button>
        </div>
      )}
      <div className="rounded-xl border p-3 text-sm font-semibold" aria-live="polite" data-sign={s ?? 'none'}
        style={{ backgroundColor: s === '+' ? '#ecfdf5' : s === '−' ? '#fff1f2' : s === '0' ? '#fffbeb' : '#f8fafc', borderColor: COLOR[s] ?? '#e2e8f0', color: s === '+' ? '#065f46' : s === '−' ? '#9f1239' : s === '0' ? '#92400e' : '#334155' }}>
        {y === null ? `${f.name}(${formatDec(value)}) n’existe pas.` : s === '0'
          ? <>{f.name}({formatDec(value)}) = 0 : la courbe <strong>touche l’axe</strong> des abscisses — un zéro.</>
          : <>{f.name}({formatDec(value)}) = {formatDec(y)}{yUnit} {s === '+' ? '> 0' : '< 0'} : la courbe est <strong>{s === '+' ? 'au-dessus' : 'en dessous'}</strong> de l’axe des abscisses.</>}
      </div>
    </div>
  );
}
