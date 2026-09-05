import React from 'react';
import { formatDec, roundTo } from '@smarter-academy/core';
import RealLine from '../../../../../common/components/RealLine';
import { sqrtIntegerBracket, sqrtTenthBracket } from './realsUtils';

/**
 * SquareBracketer — encadrer √n avec des carrés, sans calculatrice.
 *
 * Activity: toucher un candidat a ; son carré s'affiche et se compare à n ;
 *   quand a² ≤ n < (a+1)², l'encadrement se pose ; puis au dixième.
 * Mathematical objective: √n est le nombre dont le carré vaut n — on
 *   l'encadre en encadrant n par deux carrés.
 * Student action: toucher des candidats (entiers, puis dixièmes).
 * Controlled variable: le candidat a.
 * Mathematical state: { level: 0|1, tried: Set } (module) ; la réponse est
 *   dérivée (sqrtIntegerBracket / sqrtTenthBracket).
 * Visual consequence: chaque candidat s'affiche avec son carré (vert si
 *   a² ≤ n, rouge sinon) ; la droite montre l'encadrement trouvé.
 * Misconception targeted: « √10 = 5 » (moitié), « √10 ≈ 3,3 » (deviné).
 */
export default function SquareBracketer({ n, level, tried, onTry, disabled = false }) {
  const intB = sqrtIntegerBracket(n);
  const tenthB = sqrtTenthBracket(n);
  const candidates = level === 0
    ? Array.from({ length: 11 }, (_, i) => i)
    : Array.from({ length: 11 }, (_, i) => roundTo(intB.lo + i / 10, 1));
  const found = level === 0
    ? tried.has(intB.lo) && tried.has(intB.hi)
    : tried.has(tenthB.lo) && tried.has(tenthB.hi);
  const lo = level === 0 ? intB.lo : tenthB.lo;
  const hi = level === 0 ? intB.hi : tenthB.hi;
  const fmt = (v) => formatDec(v, { maxDecimals: 2 });

  return (
    <div className="space-y-3" role="group" aria-label={`Encadrer racine de ${n}`}>
      <p className="text-sm text-slate-600">Touche un candidat : son carré se compare à {n}. Trouve le dernier dont le carré ne dépasse pas {n}, et le premier qui le dépasse.</p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Candidats">
        {candidates.map((a) => {
          const t = tried.has(a);
          const sq = roundTo(a * a, 2);
          const below = sq <= n;
          return (
            <button
              key={a}
              type="button"
              disabled={disabled || t}
              onClick={() => onTry?.(a)}
              aria-label={`Essayer ${fmt(a)}`}
              className={`min-h-[44px] min-w-[52px] px-2 rounded-xl border-2 font-mono text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                t ? (below ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800') : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'
              } disabled:cursor-default`}
            >
              {t ? `${fmt(a)}² = ${fmt(sq)}` : fmt(a)}
            </button>
          );
        })}
      </div>
      {found && (
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-2 space-y-1">
          <RealLine
            min={level === 0 ? Math.max(0, lo - 1) : lo - 0.1} max={level === 0 ? hi + 1 : hi + 0.1} step={level === 0 ? 1 : 0.1}
            format={fmt}
            intervals={[{ id: 'b', from: lo, to: hi, openTo: true, tone: 'emerald', label: `${fmt(lo)} ≤ √${n} < ${fmt(hi)}` }]}
            points={[{ id: 'x', value: Math.sqrt(n), label: `√${n}`, tone: 'indigo' }]}
            ariaLabel={`Encadrement de racine de ${n} entre ${fmt(lo)} et ${fmt(hi)}`}
          />
          <p className="text-sm text-emerald-900 font-mono px-1" role="status">
            {fmt(lo)}² = {fmt(roundTo(lo * lo, 2))} ≤ {n} &lt; {fmt(roundTo(hi * hi, 2))} = {fmt(hi)}², donc <strong>{fmt(lo)} ≤ √{n} &lt; {fmt(hi)}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
