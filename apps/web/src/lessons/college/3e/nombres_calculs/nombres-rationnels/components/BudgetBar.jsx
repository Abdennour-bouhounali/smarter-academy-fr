import React, { useCallback, useRef } from 'react';
import MathText from '../../../../../common/components/MathText';
import { formatDec } from './rationalUtils';

/**
 * BudgetBar — composer un budget en tirant ses frontières.
 *
 * Activity: un budget total découpé en `den` parts. L'élève fait glisser la
 *   frontière de chaque poste pour lui donner sa part ; le reste, non
 *   attribué, se réduit d'autant sous ses yeux.
 * Mathematical objective: additionner des fractions de même dénominateur, et
 *   voir qu'un « reste » est une SOUSTRACTION au tout (12/12).
 * Student action: glisser une frontière (ou la déplacer aux flèches).
 * Controlled variable: la part de chaque poste, en douzièmes.
 * Mathematical state: les parts appartiennent au module ; le reste et les
 *   montants en euros en sont DÉRIVÉS — jamais recopiés.
 * Visual consequence: le bloc « ? » rétrécit exactement de ce que le poste a
 *   pris ; la somme des parts s'affiche en direct.
 * Expected observation: « 4 douzièmes + 3 douzièmes, il reste 5 douzièmes » —
 *   la somme se lit sur la barre avant d'être posée en calcul.
 * Misconception targeted: confondre la part dépensée et la part restante.
 *
 * Piste en DOM et non en SVG (§6ter.5) : les étiquettes ne peuvent alors ni
 * déborder ni se chevaucher, quel que soit le nombre de chiffres.
 *
 * Composant CONTRÔLÉ.
 *
 * @param {number} den                       le nombre de parts du tout
 * @param {{id,label,tone,parts}[]} segments les postes, en parts
 * @param {(id:string, parts:number)=>void} onResize
 * @param {number} [total]                   montant total (affichage dérivé)
 * @param {string} [unknownLabel]
 * @param {boolean} [frozen=false]
 */
const TONE = {
  sky: { fill: 'bg-sky-400/80', border: 'border-sky-600', text: 'text-sky-800' },
  amber: { fill: 'bg-amber-400/80', border: 'border-amber-600', text: 'text-amber-800' },
  violet: { fill: 'bg-violet-400/80', border: 'border-violet-600', text: 'text-violet-800' },
  emerald: { fill: 'bg-emerald-400/80', border: 'border-emerald-600', text: 'text-emerald-800' },
};

export default function BudgetBar({
  den, segments, onResize, total = null, unknownLabel = '?', frozen = false,
}) {
  const used = segments.reduce((n, s) => n + s.parts, 0);
  const left = den - used;

  const trackRef = useRef(null);
  const dragging = useRef(null);

  const partsFromClientX = useCallback((clientX) => {
    const el = trackRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0) return null;
    const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    return Math.round(t * den);
  }, [den]);

  /** La frontière du segment i : elle fixe le CUMUL jusqu'à i inclus. */
  const setBoundary = useCallback((i, cumul) => {
    if (frozen) return;
    const before = segments.slice(0, i).reduce((n, s) => n + s.parts, 0);
    const after = segments.slice(i + 1).reduce((n, s) => n + s.parts, 0);
    const parts = Math.max(0, Math.min(den - before - after, cumul - before));
    if (parts !== segments[i].parts) onResize(segments[i].id, parts);
  }, [frozen, segments, den, onResize]);

  const down = (i) => (e) => {
    if (frozen) return;
    dragging.current = i;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* relâché */ }
  };
  const move = (e) => {
    if (dragging.current == null || frozen) return;
    const c = partsFromClientX(e.clientX);
    if (c != null) setBoundary(dragging.current, c);
  };
  const up = (e) => {
    if (dragging.current == null) return;
    dragging.current = null;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* idem */ }
  };

  const key = (i) => (e) => {
    if (frozen) return;
    const cumul = segments.slice(0, i + 1).reduce((n, s) => n + s.parts, 0);
    const moves = {
      ArrowRight: () => setBoundary(i, cumul + 1), ArrowUp: () => setBoundary(i, cumul + 1),
      ArrowLeft: () => setBoundary(i, cumul - 1), ArrowDown: () => setBoundary(i, cumul - 1),
    };
    if (moves[e.key]) { e.preventDefault(); moves[e.key](); }
  };

  let acc = 0;
  const laid = segments.map((s) => {
    const start = acc;
    acc += s.parts;
    return { ...s, start, end: acc };
  });

  return (
    <div className="space-y-2" data-budget-used={used} data-budget-left={left}>
      <div
        ref={trackRef}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="relative h-14 rounded-xl border-2 border-slate-300 bg-slate-100 overflow-hidden"
        style={{ touchAction: dragging.current != null ? 'none' : 'manipulation' }}
      >
        {/* les graduations du tout */}
        {Array.from({ length: den - 1 }, (_, i) => (
          <div key={i} className="absolute inset-y-0 w-px bg-white/70" style={{ left: `${((i + 1) / den) * 100}%` }} />
        ))}
        {laid.map((s) => {
          const t = TONE[s.tone] ?? TONE.sky;
          return (
            <div
              key={s.id}
              className={`absolute inset-y-0 ${t.fill} border-r-2 ${t.border}`}
              style={{ left: `${(s.start / den) * 100}%`, width: `${(s.parts / den) * 100}%` }}
            />
          );
        })}
        {/* le reste, dérivé */}
        <div
          className="absolute inset-y-0 flex items-center justify-center text-sm font-bold text-slate-500"
          style={{ left: `${(used / den) * 100}%`, width: `${(left / den) * 100}%` }}
        >
          {left > 0 && unknownLabel}
        </div>
        {/* les poignées de frontière */}
        {!frozen && laid.map((s, i) => (
          <div
            key={`h${s.id}`}
            role="separator"
            tabIndex={0}
            aria-label={`Frontière de ${s.label} : ${s.parts} douzièmes sur ${den}`}
            aria-valuenow={s.parts}
            onPointerDown={down(i)}
            onKeyDown={key(i)}
            className="absolute inset-y-0 w-11 -translate-x-1/2 cursor-ew-resize focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            style={{ left: `${(s.end / den) * 100}%` }}
          >
            <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-1 rounded bg-slate-700/70" />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs">
        {laid.map((s) => {
          const t = TONE[s.tone] ?? TONE.sky;
          return (
            <span key={s.id} className={`font-semibold ${t.text}`}>
              {s.label} : <MathText>{`$\\frac{${s.parts}}{${den}}$`}</MathText>
              {total != null && <> — {formatDec((s.parts / den) * total)} €</>}
            </span>
          );
        })}
        <span className="font-semibold text-slate-600">
          reste : <MathText>{`$\\frac{${left}}{${den}}$`}</MathText>
          {total != null && <> — {formatDec((left / den) * total)} €</>}
        </span>
      </div>
    </div>
  );
}
