import React, { useEffect, useRef, useState } from 'react';
import { Feedback } from '../../../../../common/components/LessonUI';
import LineScene from './LineScene';
import Stepper from './Stepper';
import { lineFromPoints, isOnLine, residual, pointAt, formatPoint, formatCartesian, formatReduced, cartesianOf, reducedOf, RANGE, inRange } from './lineUtils';

/**
 * LineBuilder — tracer une droite à partir de son équation (modules 4 et 7).
 *
 * Activity: deux points P et Q à poser ; la droite (PQ) apparaît dès qu'ils
 *   sont distincts. La cible n'est PAS dessinée : c'est l'équation qui guide.
 * Student action: choisir P ou Q, le glisser / stepper / clavier.
 * Controlled variables: P, Q.
 * Mathematical state: P, Q, la cible { A, u } ; réussite ⟺ P et Q satisfont
 *   tous deux l'équation (donc (PQ) = cible), P ≠ Q.
 * Visual consequence: chaque point est vert quand l'équation est vérifiée,
 *   bleu sinon ; la droite prend la couleur émeraude à la réussite.
 * Feedback: par point, la valeur de a·x + b·y + c (0 attendu) — le nombre
 *   dit lequel est faux et de combien. Après `maxMoves` déplacements, un
 *   « Montre-moi » place la droite et complète honnêtement.
 * Completion: automatique à la réussite (effet), inconditionnelle.
 */
const MAX_MOVES = 14;

export default function LineBuilder({ target, initial = { P: { x: -4, y: -4 }, Q: { x: 4, y: -4 } }, solved = false, onSolved, react, range = RANGE, showReduced = true }) {
  const [P, setP] = useState(initial.P);
  const [Q, setQ] = useState(initial.Q);
  const [active, setActive] = useState('P');
  const [moves, setMoves] = useState(0);
  const [shown, setShown] = useState(false);
  const fired = useRef(false);

  const car = cartesianOf(target);
  const red = reducedOf(target);
  const pOk = isOnLine(target, P);
  const qOk = isOnLine(target, Q);
  const distinct = !(P.x === Q.x && P.y === Q.y);
  const built = distinct ? lineFromPoints(P, Q) : null;
  const success = pOk && qOk && distinct;

  useEffect(() => {
    if (success && !fired.current) {
      fired.current = true;
      react?.(!shown);
      onSolved?.();
    }
  }, [success, shown, onSolved, react]);

  const move = (which, p) => {
    if (solved || success) return;
    const other = which === 'P' ? Q : P;
    if (p.x === other.x && p.y === other.y) return; // deux points ne partagent jamais un nœud
    (which === 'P' ? setP : setQ)(p);
    setMoves((n) => n + 1);
  };
  const showMe = () => {
    // Deux points de la cible dans le cadre.
    const cands = [];
    for (let t = -12; t <= 12; t += 1) { const pt = pointAt(target.A, target.u, t); if (inRange(pt, range) && Number.isInteger(pt.x) && Number.isInteger(pt.y)) cands.push(pt); }
    if (cands.length >= 2) { setP(cands[0]); setQ(cands[cands.length - 1]); setShown(true); }
  };
  const cur = active === 'P' ? P : Q;
  const chip = (on) => `min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${on ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400'}`;
  const frozen = solved || success;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        <span className="font-semibold">Trace la droite :</span> <span className="font-mono font-bold">{showReduced && !red.vertical ? formatReduced(red) : formatCartesian(car)}</span>
      </div>
      {!frozen && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Point à placer">
          <button type="button" className={chip(active === 'P')} aria-pressed={active === 'P'} onClick={() => setActive('P')}>Placer P</button>
          <button type="button" className={chip(active === 'Q')} aria-pressed={active === 'Q'} onClick={() => setActive('Q')}>Placer Q</button>
        </div>
      )}
      <LineScene range={range} line={built} nameA={null} lineTone={success ? 'emerald' : 'sky'}
        points={[{ id: 'P', name: 'P', ...P, color: pOk ? '#059669' : '#0284c7' }, { id: 'Q', name: 'Q', ...Q, color: qOk ? '#059669' : '#0284c7' }]}
        draggableId={frozen ? null : active} onPointChange={(p) => move(active, p)}
        ariaLabel={`Repère — place ${active} ; P ${formatPoint(P)}, Q ${formatPoint(Q)}`} />
      {!frozen && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Stepper label={`x_${active}`} value={cur.x} onChange={(v) => move(active, { x: v, y: cur.y })} min={range.xMin} max={range.xMax} step={1} tone="indigo" />
          <Stepper label={`y_${active}`} value={cur.y} onChange={(v) => move(active, { x: cur.x, y: v })} min={range.yMin} max={range.yMax} step={1} tone="indigo" />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono tabular-nums" aria-live="polite">
        {[['P', P, pOk], ['Q', Q, qOk]].map(([n, pt, ok]) => (
          <div key={n} className={`px-3 py-2 rounded-xl border ${ok ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <span className="font-bold">{n} {formatPoint(pt)}</span> : {formatCartesian(car).replace(' = 0', '')} = <strong>{residual(target, pt)}</strong> {ok ? '✓ sur la droite' : '≠ 0'}
          </div>
        ))}
      </div>
      {success ? (
        <Feedback tone="ok">{shown ? 'Pas grave, on te la montre : ' : ''}P et Q vérifient l’équation, la droite (PQ) est bien <span className="font-mono font-bold">{formatCartesian(car)}</span>. Deux points suffisent — l’équation dit lesquels conviennent.</Feedback>
      ) : !distinct ? (
        <Feedback tone="info">P et Q sont confondus : deux points distincts sont nécessaires.</Feedback>
      ) : (
        <Feedback tone="info">
          {pOk ? 'P est bon. ' : ''}{qOk ? 'Q est bon. ' : ''}
          {!pOk && !qOk ? 'Cherche un x, calcule le y que donne l’équation, et pose P dessus ; puis Q.' : !pOk ? 'Il reste P.' : 'Il reste Q.'}
          {moves >= MAX_MOVES && !solved && <button type="button" onClick={showMe} className="ml-2 underline font-semibold">Je ne trouve pas — montre-moi</button>}
        </Feedback>
      )}
    </div>
  );
}
