import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { Feedback } from '../../../../../common/components/LessonUI';
import { imageOf, curvePieces, formatDec, coupleText } from './fonctionsUtils';

/**
 * PlotTable — du tableau à la courbe : placer soi-même chaque point (x ; f(x)).
 *
 * Activity               une ligne du tableau à la fois : la puce « x = … »
 *                        choisit la ligne, le point se déplace sur le repère
 *                        (glisser, clavier) jusqu'à la bonne position.
 * Mathematical objective un point de la courbe a pour coordonnées (x ; f(x)) —
 *                        l'abscisse est la valeur de la variable, l'ordonnée
 *                        son image ; l'ordre compte.
 * Controlled variable    la position du point de la ligne active.
 * Mathematical state     `placed` : x → { x, y } (positions posées) ; la
 *                        validation compare à (x ; f(x)) calculé.
 * Visual consequence     le point suit ; validé, il passe en vert et la ligne
 *                        du tableau se coche ; tous posés, la courbe peut être
 *                        tracée à travers eux.
 * Misconception targeted (y ; x) pour (x ; y) ; « la courbe s'arrête aux points ».
 *
 * Après `escapeAfter` déplacements sur une même ligne, « Montre-moi » pose le
 * point (jamais de blocage). Nombres dans le DOM uniquement.
 */
export default function PlotTable({ f, xs, range, placed, onPlace, moves, onEscape, active, onActive, showCurve = false, disabled = false, escapeAfter = 12 }) {
  const targets = xs.map((x) => ({ x, y: imageOf(f, x) }));
  const isOk = (x) => placed[x] && placed[x].x === x && placed[x].y === imageOf(f, x);
  const allOk = xs.every(isOk);
  const cur = placed[active] ?? { x: 0, y: 0 };
  const points = xs.filter((x) => placed[x] || x === active).map((x) => {
    const p = placed[x] ?? { x: 0, y: 0 };
    return { id: `p${x}`, x: p.x, y: p.y, color: isOk(x) ? '#059669' : x === active ? '#4f46e5' : '#94a3b8' };
  });
  const chip = (x) => `min-h-[44px] px-3 rounded-xl border-2 font-mono text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 ${isOk(x) ? 'bg-emerald-600 border-emerald-700 text-white' : x === active ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400'}`;
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
        <table className="w-full text-sm font-mono tabular-nums">
          <caption className="sr-only">Tableau de valeurs de {f.name}</caption>
          <thead><tr className="bg-slate-50 text-slate-600"><th scope="row" className="px-3 py-2 text-left font-bold">x</th>{targets.map((t) => <td key={t.x} className="px-2 py-2 text-center">{formatDec(t.x)}</td>)}</tr></thead>
          <tbody><tr className="border-t border-slate-100"><th scope="row" className="px-3 py-2 text-left font-bold">{f.name}(x)</th>{targets.map((t) => <td key={t.x} className={`px-2 py-2 text-center font-bold ${isOk(t.x) ? 'text-emerald-700' : 'text-slate-800'}`}>{formatDec(t.y)}{isOk(t.x) ? ' ✓' : ''}</td>)}</tr></tbody>
        </table>
      </div>
      {!disabled && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Ligne du tableau à placer">
          {xs.map((x) => (
            <button key={x} type="button" className={chip(x)} aria-pressed={x === active} onClick={() => onActive(x)} aria-label={`Placer le point d’abscisse ${formatDec(x)}`}>
              {isOk(x) ? '✓ ' : ''}x = {formatDec(x)}
            </button>
          ))}
        </div>
      )}
      <CoordPlane
        range={range}
        points={points}
        draggableId={disabled || active == null || isOk(active) ? null : `p${active}`}
        onPointChange={(p) => onPlace(active, p)}
        curves={showCurve ? curvePieces(f, range).map((pc, i) => ({ id: `c${i}`, points: pc, tone: 'indigo', width: 2.5 })) : []}
        caption={false}
        disabled={disabled}
        ariaLabel={active != null ? `Repère — place le point d’abscisse ${formatDec(active)} ; il est en ${coupleText(cur.x, cur.y)}` : 'Repère'}
      />
      {!disabled && active != null && !isOk(active) && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-mono font-bold text-slate-700">point en {coupleText(cur.x, cur.y)} — cible : ({formatDec(active)} ; {f.name}({formatDec(active)}))</span>
          {(moves[active] ?? 0) >= escapeAfter && (
            <button type="button" onClick={() => onEscape(active)} className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-indigo-400">Je bloque — montre-moi</button>
          )}
        </div>
      )}
      {!disabled && active != null && !isOk(active) && placed[active] && (placed[active].x !== active ? (
        <Feedback tone="info">L’abscisse du point doit être {formatDec(active)} (la valeur de x du tableau) : le point est en abscisse {formatDec(placed[active].x)}.</Feedback>
      ) : (
        <Feedback tone="info">Abscisse juste. L’ordonnée est l’image : {f.name}({formatDec(active)}) = {formatDec(imageOf(f, active))} — le point est en ordonnée {formatDec(placed[active].y)}.</Feedback>
      ))}
      {allOk && <Feedback tone="ok">Les {xs.length} points sont posés : chacun a pour coordonnées (x ; {f.name}(x)).</Feedback>}
    </div>
  );
}
