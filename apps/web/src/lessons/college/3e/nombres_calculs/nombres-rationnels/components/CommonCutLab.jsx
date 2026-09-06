import React, { useCallback, useRef } from 'react';
import MathText from '../../../../../common/components/MathText';
import { expandTo, formatDec, normalize, toDecimal, commonDenominator } from './rationalUtils';

/**
 * CommonCutLab — comparer en RE-DÉCOUPANT, pas en calculant.
 *
 * Activity: deux rationnels, une seule molette : le nombre de parts de la
 *   découpe commune. L'élève la fait glisser ; les deux barres se re-découpent
 *   ensemble, et les deux points restent où ils sont.
 * Mathematical objective: comparer deux rationnels, c'est les amener sur la
 *   MÊME graduation ; une fois là, il n'y a plus rien à calculer — on lit.
 * Student action: glisser (ou flécher) la molette des découpes.
 * Controlled variable: le dénominateur commun essayé.
 * Mathematical state: les deux rationnels d'origine, jamais modifiés ; les
 *   écritures affichées en sont DÉRIVÉES par `expandTo` — donc la valeur ne
 *   peut pas dériver, quelle que soit la découpe essayée.
 * Visual consequence: une découpe qui ne convient pas à l'un des deux le dit,
 *   avec sa raison ; une découpe commune fait apparaître les deux numérateurs
 *   sur la même règle, et la comparaison devient une lecture.
 * Expected observation: « il suffit qu'ils aient le même bas pour que le plus
 *   grand haut gagne ».
 * Misconception targeted: comparer les dénominateurs (« 1/4 > 1/2 car 4 > 2 »).
 *
 * Composant CONTRÔLÉ : `den` appartient au module.
 *
 * @param {{num,den}} a
 * @param {{num,den}} b
 * @param {string} [labelA]
 * @param {string} [labelB]
 * @param {number[]} candidates   les découpes atteignables, dans l'ordre
 * @param {number} den            la découpe courante
 * @param {(d:number, ok:boolean)=>void} onDen
 * @param {boolean} [frozen=false]
 */
export default function CommonCutLab({
  a, b, labelA = 'A', labelB = 'B', candidates, den, onDen, frozen = false,
}) {
  const x = normalize(a);
  const y = normalize(b);
  const ea = expandTo(x, den);
  const eb = expandTo(y, den);
  const ok = !!(ea && eb);
  const best = commonDenominator(x, y);

  const trackRef = useRef(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0) return;
    const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const d = candidates[Math.round(t * (candidates.length - 1))];
    if (d !== den) onDen?.(d, d % x.den === 0 && d % y.den === 0);
  }, [candidates, den, onDen, x.den, y.den]);

  const down = (e) => {
    if (frozen) return;
    dragging.current = true;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* relâché */ }
    setFromClientX(e.clientX);
  };
  const move = (e) => { if (dragging.current && !frozen) setFromClientX(e.clientX); };
  const up = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* idem */ }
  };
  const key = (e) => {
    if (frozen) return;
    const i = candidates.indexOf(den);
    const at = (j) => {
      const d = candidates[Math.max(0, Math.min(candidates.length - 1, j))];
      if (d !== den) onDen?.(d, d % x.den === 0 && d % y.den === 0);
    };
    const moves = {
      ArrowRight: () => at(i + 1), ArrowUp: () => at(i + 1),
      ArrowLeft: () => at(i - 1), ArrowDown: () => at(i - 1),
      Home: () => at(0), End: () => at(candidates.length - 1),
    };
    if (moves[e.key]) { e.preventDefault(); moves[e.key](); }
  };

  const bar = (r, e, tone, label) => {
    const parts = e ? Math.abs(e.num) : 0;
    return (
      <div className="space-y-1">
        <div className="flex items-baseline justify-between text-xs">
          <span className={`font-bold ${tone.text}`}>{label}</span>
          <span className="font-mono text-slate-500">
            {e ? `${e.num}/${e.den}` : `${r.num}/${r.den} — pas découpable en ${den}èmes`}
          </span>
        </div>
        <div className={`relative h-9 rounded-lg border-2 ${e ? tone.border : 'border-dashed border-slate-300'} bg-white overflow-hidden`}>
          {e && (
            <div className={`absolute inset-y-0 left-0 ${tone.fill}`} style={{ width: `${(parts / den) * 100}%` }} />
          )}
          {e && Array.from({ length: den - 1 }, (_, i) => (
            <div key={i} className="absolute inset-y-0 w-px bg-white/80" style={{ left: `${((i + 1) / den) * 100}%` }} />
          ))}
          {!e && (
            <div className="absolute inset-0 flex items-center justify-center text-[11px] text-slate-400">
              {den} n’est pas un multiple de {r.den}
            </div>
          )}
        </div>
      </div>
    );
  };

  const TONE_A = { text: 'text-indigo-700', border: 'border-indigo-300', fill: 'bg-indigo-400/70' };
  const TONE_B = { text: 'text-violet-700', border: 'border-violet-300', fill: 'bg-violet-400/70' };

  return (
    <div className="space-y-3" data-cut-den={den} data-cut-ok={ok ? 'true' : 'false'}>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3">
        {bar(x, ea, TONE_A, labelA)}
        {bar(y, eb, TONE_B, TONE_B && labelB)}

        {/* La molette des découpes : une seule commande, la bonne. */}
        <div className="pt-1">
          <div
            ref={trackRef}
            role="slider"
            tabIndex={frozen ? -1 : 0}
            aria-label="Nombre de parts de la découpe commune"
            aria-valuenow={den}
            aria-valuemin={candidates[0]}
            aria-valuemax={candidates[candidates.length - 1]}
            aria-valuetext={`${den} parts`}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onKeyDown={key}
            style={{ touchAction: 'none' }}
            className="relative h-11 rounded-xl bg-slate-100 border-2 border-slate-300 cursor-ew-resize focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {candidates.map((d, i) => {
              const left = (i / (candidates.length - 1)) * 100;
              const on = d === den;
              const works = d % x.den === 0 && d % y.den === 0;
              return (
                <div
                  key={d}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full font-mono font-bold flex items-center justify-center transition-all ${
                    on
                      ? `${works ? 'bg-emerald-600' : 'bg-rose-600'} text-white w-9 h-9 text-sm`
                      : 'bg-white text-slate-500 w-6 h-6 text-[11px] border border-slate-300'
                  }`}
                  style={{ left: `${left}%` }}
                >
                  {d}
                </div>
              );
            })}
          </div>
          <p className="text-center text-[11px] text-slate-500 mt-1">
            Glisse pour changer la découpe commune (ou utilise les flèches).
          </p>
        </div>
      </div>

      {ok ? (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Même découpe : <MathText>{`$\\frac{${ea.num}}{${den}}$`}</MathText> et{' '}
          <MathText>{`$\\frac{${eb.num}}{${den}}$`}</MathText>. Il n’y a plus qu’à comparer{' '}
          <strong>{ea.num}</strong> et <strong>{eb.num}</strong> :{' '}
          <strong>
            {ea.num > eb.num ? labelA : labelB} est le plus grand
          </strong>{' '}
          ({formatDec(toDecimal(x, 4))} contre {formatDec(toDecimal(y, 4))}).
          {den === best && ' C’est aussi la plus petite découpe qui marche.'}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {den} ne convient pas : il faudrait couper {!ea ? labelA : labelB} en parts qui ne tombent
          pas juste. Une découpe commune doit être un <strong>multiple des deux dénominateurs</strong>.
        </div>
      )}
    </div>
  );
}
