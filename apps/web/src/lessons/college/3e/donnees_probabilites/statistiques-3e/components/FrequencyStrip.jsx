import React from 'react';
import { formatDec } from '@smarter-academy/core';
import { FACES, totalOf, frequencies, pct, spreadPoints } from './diceUtils';

/**
 * FrequencyStrip — 10, 100, 1 000 lancers côte à côte, sur UNE échelle de %.
 *
 * Activity            comparer trois séries de tailles différentes.
 * Mathematical objective  rendre visible la STABILISATION : l'écart entre la
 *                     face la plus fréquente et la moins fréquente se resserre
 *                     quand le nombre de lancers grandit.
 * Mathematical state  trois tableaux d'effectifs figés par le module ; les
 *                     fréquences et l'écart sont dérivés ici.
 * Visual consequence  des barres très inégales à gauche, presque égales à droite.
 * Feedback            l'écart max − min est écrit sous chaque série.
 *
 * SÉCURITÉ D'AFFICHAGE : l'échelle commune vaut le plus grand pourcentage de
 * toutes les séries (plancher 40 %) ; les seuls textes du SVG sont les six
 * numéros de face, un par colonne de 18 unités — ils ne peuvent pas se
 * toucher. Titres et écarts sont des nœuds DOM.
 */

const W = 120;
const H = 84;
const TOP = 6;
const BASE = 68;
const COL = 18;
const X0 = 6;

export default function FrequencyStrip({ series }) {
  const shown = series.filter((s) => s && s.counts && totalOf(s.counts) > 0);
  if (shown.length === 0) return null;
  const maxPct = Math.max(40, ...shown.flatMap((s) => frequencies(s.counts).map((f) => pct(f))));

  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Comparaison de trois séries de lancers">
      {shown.map((s) => {
        const t = totalOf(s.counts);
        const fr = frequencies(s.counts);
        const spread = spreadPoints(s.counts);
        const reading = FACES.map((f) => `${f} : ${formatDec(pct(fr[f - 1]))} %`).join(', ');
        return (
          <div key={s.label} className="rounded-xl border-2 border-slate-200 bg-white p-2 flex flex-col items-center gap-1 min-w-0">
            <p className="text-xs font-mono font-bold text-slate-700 text-center leading-tight">
              {formatDec(t)} lancer{t > 1 ? 's' : ''}
            </p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
              aria-label={`${formatDec(t)} lancers — fréquences ${reading}`}>
              <line x1="2" y1={BASE} x2={W - 2} y2={BASE} stroke="#0f172a" strokeWidth="1.5" />
              {FACES.map((f, i) => {
                const h = (pct(fr[i]) / maxPct) * (BASE - TOP);
                const x = X0 + i * COL;
                return (
                  <g key={f}>
                    <rect x={x + 2} y={BASE - h} width={COL - 4} height={h} rx="2" fill="#818cf8" />
                    <text x={x + COL / 2} y={BASE + 11} textAnchor="middle" fontSize="8"
                      className="font-mono" fill="#64748b">{f}</text>
                  </g>
                );
              })}
            </svg>
            <p className="text-[11px] font-mono text-slate-600 text-center leading-tight">
              écart <strong className="text-slate-800">{formatDec(spread)}</strong> pts
            </p>
          </div>
        );
      })}
    </div>
  );
}
