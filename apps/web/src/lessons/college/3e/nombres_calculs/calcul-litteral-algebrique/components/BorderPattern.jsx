import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { evaluateBorder } from './litteralUtils';

/**
 * BorderPattern — le jardin carré de côté n et sa bordure de dalles.
 *
 * Activity: régler n avec un stepper et regarder la bordure se redessiner.
 * Mathematical objective: faire naître le besoin d'une EXPRESSION — la
 *   bordure se compte de trois façons (4n + 4, 4(n + 1), (n + 2)² − n²) et
 *   donne toujours le même nombre.
 * Student action: taper − / +, ou une puce de valeur.
 * Controlled variable: n (1 à 6).
 * Mathematical state: n. Le dessin, le décompte et les trois formules en
 *   sont DÉRIVÉS (evaluateBorder).
 * Visual consequence: le carré vert grandit, la couronne de dalles suit ; le
 *   décompte affiché change avec elle.
 * Expected observation: pour chaque n, les trois écritures donnent le même
 *   nombre de dalles — et pourtant on ne compte pas de la même manière.
 * Misconception targeted: « des écritures différentes = des quantités
 *   différentes » ; prépare « une valeur ne suffit pas » (module 3).
 * Feedback: le décompte est LE retour ; le module rend les <Feedback>.
 * Formalization: le mot « expression littérale » est nommé APRÈS.
 * Scaffolding: `showFormulas` révèle les trois lectures coloriées.
 * Transfer: la bordure revient dans le registre du boss.
 *
 * Composant CONTRÔLÉ : `n` appartient au module. Les dalles sont des <rect>
 * STATIQUES (pointerEvents none) — 2 nœuds interactifs seulement (− / +).
 *
 * @param {number} n @param {(n:number)=>void} [onChange]
 * @param {boolean} [showFormulas] @param {number} [min=1] @param {number} [max=6]
 * @param {boolean} [frozen]
 */
const CELL = 24;
const GAP = 2;

export default function BorderPattern({
  n,
  onChange,
  showFormulas = false,
  min = 1,
  max = 6,
  frozen = false,
  highlightCorners = false, // colorie les 4 coins (lecture « 4n + 4 »)
}) {
  const side = n + 2;                    // le jardin + la bordure
  const total = evaluateBorder(n);       // 4n + 4
  const size = side * (CELL + GAP) - GAP;
  const PAD = 10;

  const cells = [];
  for (let r = 0; r < side; r += 1) {
    for (let c = 0; c < side; c += 1) {
      const isBorder = r === 0 || c === 0 || r === side - 1 || c === side - 1;
      const isCorner = (r === 0 || r === side - 1) && (c === 0 || c === side - 1);
      cells.push({ r, c, isBorder, isCorner });
    }
  }

  const cellFill = (cell) => {
    if (!cell.isBorder) return '#bbf7d0';                        // le jardin
    if (highlightCorners && cell.isCorner) return '#fca5a5';     // les 4 coins
    return '#fcd34d';                                            // les dalles
  };

  return (
    <div className="space-y-3" role="group" aria-label="Jardin carré et sa bordure de dalles">
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white p-3">
        <svg
          viewBox={`0 0 ${size + 2 * PAD} ${size + 2 * PAD}`}
          className="w-full h-auto max-w-[300px] mx-auto block"
          role="img"
          aria-label={`Jardin de côté ${n}, entouré de ${total} dalles`}
        >
          <g pointerEvents="none">
            {cells.map((cell) => (
              <rect
                key={`${cell.r}-${cell.c}`}
                x={PAD + cell.c * (CELL + GAP)}
                y={PAD + cell.r * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx="3"
                fill={cellFill(cell)}
                stroke={cell.isBorder ? '#b45309' : '#16a34a'}
                strokeWidth="1.5"
              />
            ))}
          </g>
        </svg>
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {!frozen && (
          <button
            type="button"
            onClick={() => onChange?.(Math.max(min, n - 1))}
            disabled={n <= min}
            aria-label="Diminuer le côté du jardin"
            className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-indigo-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            −
          </button>
        )}
        <span className="font-mono text-lg font-extrabold text-slate-800 tabular-nums w-28 text-center">
          n = {n}
        </span>
        {!frozen && (
          <button
            type="button"
            onClick={() => onChange?.(Math.min(max, n + 1))}
            disabled={n >= max}
            aria-label="Augmenter le côté du jardin"
            className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-indigo-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            +
          </button>
        )}
      </div>

      <p className="text-center text-sm font-semibold text-slate-700">
        Dalles de bordure : <strong className="font-mono text-amber-700">{total}</strong>
      </p>

      {showFormulas && (
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { who: 'Maya', latex: '4n + 4', why: 'quatre côtés de n dalles, plus les 4 coins' },
            { who: 'Sacha', latex: '4(n + 1)', why: 'quatre bandes de n + 1 dalles' },
            { who: 'Iris', latex: '(n + 2)^{2} - n^{2}', why: 'tout le grand carré, moins le jardin' },
          ].map((f) => (
            <div key={f.who} className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wide text-slate-500">{f.who}</div>
              <MathText className="text-base text-slate-800">{`$${f.latex}$`}</MathText>
              <div className="text-[11px] text-slate-500 leading-snug">{f.why}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
