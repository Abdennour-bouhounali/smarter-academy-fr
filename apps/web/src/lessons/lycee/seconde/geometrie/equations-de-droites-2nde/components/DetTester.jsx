import React from 'react';
import { Feedback } from '../../../../../common/components/LessonUI';
import LineScene from './LineScene';
import Stepper from './Stepper';
import { detTest, formatPoint, formatVec, RANGE } from './lineUtils';
import { formatDec } from '@smarter-academy/core';

/**
 * DetTester — le test du déterminant (module 3).
 *
 * Activity: un point M libre sur la grille ; le nombre det(AM, u) est
 *   calculé sous les yeux de l'élève à chaque position.
 * Student action: déplacer M (glisser, steppers, clavier).
 * Controlled variable: M.
 * Mathematical state: { A, u } fixes, M, l'ensemble des positions où le
 *   nombre vaut 0.
 * Visual consequence: M devient vert et s'ajoute aux « trouvés » quand le
 *   nombre vaut 0 — et il est alors, à chaque fois, SUR la droite.
 * Expected observation (aha): det(AM, u) = 0 exactement quand M est sur la
 *   droite ; c'est une relation entre x et y — l'équation, écrite juste après.
 */
const f = (v) => formatDec(v);
const par = (v) => (v < 0 ? `(${f(v)})` : f(v));

export default function DetTester({ line, M, onM, found = [], disabled = false, range = RANGE }) {
  const { A, u } = line;
  const d = detTest(line, M);
  const zero = d === 0;
  const onPoint = (p) => {
    if (disabled) return;
    if ((p.x === A.x && p.y === A.y) || (p.x === A.x + u.x && p.y === A.y + u.y)) return; // M ne recouvre ni A ni la pointe
    onM(p);
  };
  const points = [
    ...found.filter((q) => !(q.x === M.x && q.y === M.y)).map((q, i) => ({ id: `f${i}`, ...q, color: '#059669' })),
    { id: 'M', name: 'M', ...M, color: zero ? '#059669' : '#0284c7' },
  ];
  return (
    <div className="space-y-3">
      <LineScene line={line} showArrow points={points} draggableId={disabled ? null : 'M'} onPointChange={onPoint} range={range}
        ariaLabel={`Repère — déplace le point M ; A ${formatPoint(A)}, u ${formatVec(u)}, M ${formatPoint(M)}`} />
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Stepper label="x_M" value={M.x} onChange={(v) => onPoint({ x: v, y: M.y })} min={range.xMin} max={range.xMax} step={1} tone="indigo" disabled={disabled} />
        <Stepper label="y_M" value={M.y} onChange={(v) => onPoint({ x: M.x, y: v })} min={range.yMin} max={range.yMax} step={1} tone="indigo" disabled={disabled} />
      </div>
      <div className={`rounded-xl border p-3 text-sm font-mono font-bold tabular-nums ${zero ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-800'}`} aria-live="polite">
        <div className="text-[11px] font-sans font-semibold uppercase tracking-wide opacity-70">det(AM, u) = u_y·(x_M − x_A) − u_x·(y_M − y_A)</div>
        <div>= {f(u.y)}·({f(M.x)} − {par(A.x)}) − {f(u.x)}·({f(M.y)} − {par(A.y)}) = {f(u.y)}·{par(M.x - A.x)} − {f(u.x)}·{par(M.y - A.y)} = <span className="text-base">{f(d)}</span></div>
      </div>
      {zero
        ? <Feedback tone="ok">det = 0 : M {formatPoint(M)} est SUR la droite. {found.length < 3 ? 'Trouve-en un autre.' : ''}</Feedback>
        : <Feedback tone="info">det = {f(d)} ≠ 0 : M n’est pas sur la droite. Amène-le dessus — le nombre doit tomber à 0.</Feedback>}
    </div>
  );
}
