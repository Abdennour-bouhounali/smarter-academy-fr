import React from 'react';
import { useReducedMotion } from 'framer-motion';
import MathText from '../../../../../common/components/MathText';
import { formatDec, roundTo } from './equationUtils';

/**
 * SquareVsRectangle — le duel d'aires du module 6.
 *
 * Extrait du module 6 original (« Carré contre Rectangle »), dont la
 * manipulation — deux figures qui se redimensionnent avec x, leurs aires
 * affichées en direct — était le meilleur moment de la leçon. Trois défauts
 * corrigés : le seul contrôle était un `<input type="range">` (rien au
 * doigt), les figures étaient des `<div>` en pixels (pas d'échelle
 * mathématique, débordement à x = 10), et l'avancement se déclenchait sur un
 * `setTimeout` automatique. Ici : puces + stepper + curseur, un SVG à échelle
 * fixe, et le module possède la progression.
 *
 * Activity: régler x et comparer l'aire du carré de côté x à celle du
 *   rectangle 4 sur x.
 * Mathematical objective: voir que x² = 4x pour deux valeurs seulement,
 *   0 et 4 — et que 0 ne convient pas à une figure.
 * Student action: taper une puce de valeur de x, ou pousser −/+.
 * Controlled variable: x, de 0 à 8 au pas 0,5.
 * Mathematical state: x ; les deux aires sont dérivées (x·x et 4·x).
 * Visual consequence: le carré grandit dans les deux directions, le
 *   rectangle seulement en hauteur ; les deux passent en ambre quand les
 *   aires coïncident.
 * Expected observation: le carré rattrape puis dépasse le rectangle ; ils
 *   sont égaux en x = 4 (et, dégénérés, en x = 0).
 * Misconception targeted: « x² et 4x, c'est pareil » (confusion entre
 *   exposant et coefficient) et « une équation en x² a une seule solution ».
 * Feedback: l'écart d'aire est affiché en cm², signé.
 * Formalization: x² = 4x → x² − 4x = 0 → x(x − 4) = 0, au module.
 * Scaffolding: puces incluant 0 et 4 ; l'égalité ne peut pas être manquée.
 * Transfer: la même figure sert de synthèse figée dans le boss.
 *
 * Composant CONTRÔLÉ : `x` appartient au module.
 *
 * @param {number} x @param {(x:number)=>void} onChange
 * @param {number} [max=8] @param {number} [step=0.5]
 * @param {boolean} [frozen=false]
 */
const CHIPS = [0, 1, 2, 3, 4, 5, 6];
const W = 420;
const H = 172;
const SCALE = 17;          // 1 cm = 17 unités de viewBox — x = 8 (136) tient dans le cadre
const BASE_Y = H - 24;

export default function SquareVsRectangle({ x, onChange, max = 8, step = 0.5, frozen = false }) {
  const reduced = useReducedMotion();
  const areaSquare = roundTo(x * x);
  const areaRect = roundTo(4 * x);
  const gap = roundTo(areaSquare - areaRect);
  const equal = gap === 0;

  const set = (v) => onChange?.(roundTo(Math.min(max, Math.max(0, Math.round(v / step) * step))));

  const sq = x * SCALE;
  const rw = 4 * SCALE;
  const rh = x * SCALE;
  const tone = equal ? { fill: '#fef3c7', stroke: '#d97706' } : null;
  const trans = reduced ? undefined : { transition: 'all 250ms ease-out' };

  return (
    <div className="space-y-3" role="group" aria-label="Carré contre rectangle">
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white flex justify-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto min-w-[320px] max-w-[440px] select-none"
          role="img"
          aria-label={`Carré de côté ${formatDec(x)} cm, aire ${formatDec(areaSquare)} cm²; rectangle 4 sur ${formatDec(x)} cm, aire ${formatDec(areaRect)} cm².`}
        >
          <g pointerEvents="none">
            {/* sol */}
            <line x1={12} y1={BASE_Y} x2={W - 12} y2={BASE_Y} stroke="#e2e8f0" strokeWidth="2" />

            {/* carré, posé sur le sol */}
            <rect
              x={30} y={BASE_Y - sq} width={sq} height={sq}
              fill={tone ? tone.fill : '#dbeafe'} stroke={tone ? tone.stroke : '#2563eb'} strokeWidth="2"
              style={trans}
            />
            <text x={30 + sq / 2} y={BASE_Y + 16} textAnchor="middle" fontSize="11" fill="#1d4ed8" fontFamily="monospace" fontWeight="bold">
              côté {formatDec(x)}
            </text>
            {sq > 34 && (
              <text x={30 + sq / 2} y={BASE_Y - sq / 2 + 4} textAnchor="middle" fontSize="12" fill="#1e3a8a" fontFamily="monospace" fontWeight="bold">
                x²
              </text>
            )}

            {/* rectangle 4 × x */}
            <rect
              x={W - 30 - rw} y={BASE_Y - rh} width={rw} height={rh}
              fill={tone ? tone.fill : '#d1fae5'} stroke={tone ? tone.stroke : '#059669'} strokeWidth="2"
              style={trans}
            />
            <text x={W - 30 - rw / 2} y={BASE_Y + 16} textAnchor="middle" fontSize="11" fill="#047857" fontFamily="monospace" fontWeight="bold">
              base 4
            </text>
            {rh > 24 && (
              <text x={W - 30 - rw / 2} y={BASE_Y - rh / 2 + 4} textAnchor="middle" fontSize="12" fill="#065f46" fontFamily="monospace" fontWeight="bold">
                4x
              </text>
            )}
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-2.5 text-center">
          <div className="text-[10px] font-mono uppercase text-blue-600">Aire du carré</div>
          <div className="font-mono text-lg font-extrabold tabular-nums text-blue-900">{formatDec(areaSquare)}</div>
          <div className="text-[10px] text-blue-600">cm²</div>
        </div>
        <div
          className={`rounded-2xl border-2 p-2.5 text-center ${
            equal ? 'border-amber-400 bg-amber-100' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-slate-500">Écart</div>
          <div className="font-mono text-lg font-extrabold tabular-nums text-slate-800">
            {gap > 0 ? '+' : ''}{formatDec(gap)}
          </div>
          <div className="text-[10px] text-slate-500">cm²</div>
        </div>
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-2.5 text-center">
          <div className="text-[10px] font-mono uppercase text-emerald-600">Aire du rectangle</div>
          <div className="font-mono text-lg font-extrabold tabular-nums text-emerald-900">{formatDec(areaRect)}</div>
          <div className="text-[10px] text-emerald-600">cm²</div>
        </div>
      </div>

      {!frozen && (
        <>
          <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Valeurs de x">
            {CHIPS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => set(v)}
                aria-pressed={x === v}
                aria-label={`x égale ${formatDec(v)}`}
                className={`min-w-[44px] min-h-[44px] rounded-xl border-2 font-mono text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  x === v ? 'bg-rose-600 border-rose-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-rose-500'
                }`}
              >
                {formatDec(v)}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => set(x - step)}
              disabled={x <= 0}
              aria-label="Diminuer x"
              className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              −
            </button>
            <span className="font-mono text-lg font-extrabold text-slate-800 tabular-nums w-28 text-center">
              <MathText>{`$x = ${formatDec(x)}$`}</MathText>
            </span>
            <button
              type="button"
              onClick={() => set(x + step)}
              disabled={x >= max}
              aria-label="Augmenter x"
              className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              +
            </button>
          </div>
        </>
      )}
    </div>
  );
}
