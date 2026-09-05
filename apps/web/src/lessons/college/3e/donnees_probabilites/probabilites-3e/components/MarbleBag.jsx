import React from 'react';
import { formatDec } from '@smarter-academy/core';
import MathText from '../../../../../common/components/MathText';
import { COLOURS, bagTotal, bagProbability, fracLatex, formatPct } from './probaUtils';
import { btnPrimary, btnSecondary } from './DiceLab';

/**
 * MarbleBag — composer un sac de billes, puis y tirer.
 *
 * Activity            ajouter / retirer des billes de trois couleurs ; tirer
 *                     200 fois avec remise.
 * Mathematical objective  faire naître P(couleur) = nb de billes de la couleur
 *                     ÷ nb total, comme la DESCRIPTION du sac ; puis constater
 *                     que doubler le sac ne change pas la part (fractions
 *                     égales) et que l'effectif observé tourne autour de P × n.
 * Student action      − / + sur chaque couleur ; « Tirer 200 fois ».
 * Controlled variable la composition du sac.
 * Mathematical state  `bag` {rouge, bleu, vert} appartient au module ; total,
 *                     probabilités, fractions réduites sont dérivés
 *                     (bagProbability / fracLatex). Les tirages sont un
 *                     instantané `draws` fourni par le module.
 * Visual consequence  les billes apparaissent dans le sac (plafonnées, badge
 *                     « ×N » au-delà) ; la fraction se réduit sous les yeux.
 * Expected observation « 2 rouges sur 8, c'est 1 sur 4 ; 4 sur 16 aussi ».
 * Misconception targeted  « plus de billes rouges → forcément plus probable »
 *                     (sans regarder le total) ; « doubler change la chance ».
 * Feedback            le module quantifie l'écart avec la part visée.
 * Formalization       la fraction n'est montrée que si `showProbability`.
 *
 * SÉCURITÉ D'AFFICHAGE : au plus MAX_SHOWN billes dessinées dans une grille
 * fixe (6 par rangée, 4 rangées) ; au-delà, un badge « ×N » ; lectures en DOM.
 */
const MAX_SHOWN = 24;
const PER_ROW = 6;
const FILL = { rouge: '#e11d48', bleu: '#2563eb', vert: '#059669' };
const LABEL = { rouge: 'rouge', bleu: 'bleue', vert: 'verte' };
const LABELS = { rouge: 'rouges', bleu: 'bleues', vert: 'vertes' };

export default function MarbleBag({
  bag,
  onChange,               // (bag) => void
  max = 12,               // par couleur
  draws = null,           // { counts: {rouge, bleu, vert}, n } — instantané
  onDraw,                 // (n) => void
  drawN = 200,
  showProbability = false,
  highlight = null,       // couleur mise en avant dans les lectures
  disabled = false,       // fige les steppers (le sac), pas le tirage
  drawDisabled = false,
  caption,
}) {
  const total = bagTotal(bag);
  const marbles = COLOURS.flatMap((c) => Array.from({ length: bag[c] ?? 0 }, () => c));
  const shown = marbles.slice(0, MAX_SHOWN);
  const overflow = marbles.length - shown.length;
  const bump = (c, d) => {
    if (disabled) return;
    const v = Math.max(0, Math.min(max, (bag[c] ?? 0) + d));
    onChange?.({ ...bag, [c]: v });
  };
  const reading = `Sac : ${COLOURS.map((c) => `${formatDec(bag[c] ?? 0)} ${LABELS[c]}`).join(', ')}, ${formatDec(total)} billes au total`;

  return (
    <div className="w-full rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3" role="group" aria-label={reading}>
      {caption && <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wide">{caption}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-3 items-start">
        {/* Le sac */}
        <svg viewBox="0 0 200 180" className="w-full max-w-[220px] mx-auto block" role="img" aria-label={reading}>
          <path d="M40 40 Q30 10 60 12 L140 12 Q170 10 160 40 L182 150 Q186 170 166 170 L34 170 Q14 170 18 150 Z"
            fill="#f8fafc" stroke="#475569" strokeWidth="3" />
          {shown.map((c, i) => {
            const row = Math.floor(i / PER_ROW);
            const col = i % PER_ROW;
            return (
              <circle key={i} cx={46 + col * 22 + (row % 2) * 6} cy={150 - row * 24} r="9"
                fill={FILL[c]} stroke="#ffffff" strokeWidth="2" />
            );
          })}
          {overflow > 0 && (
            <g>
              <rect x="120" y="24" width="64" height="24" rx="12" fill="#0f172a" />
              <text x="152" y="41" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff" className="font-mono">+{formatDec(overflow)}</text>
            </g>
          )}
          {total === 0 && (
            <text x="100" y="100" textAnchor="middle" fontSize="13" fill="#94a3b8">sac vide</text>
          )}
        </svg>

        {/* Les steppers */}
        <div className="space-y-2">
          {COLOURS.map((c) => {
            const n = bag[c] ?? 0;
            const p = bagProbability(bag, c);
            const hi = highlight === c;
            return (
              <div key={c} className={`flex items-center gap-2 flex-wrap rounded-xl border-2 px-2 py-1.5 ${hi ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
                <span className="w-4 h-4 rounded-full shrink-0" style={{ background: FILL[c] }} aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-700 w-16">{LABELS[c]}</span>
                <button type="button" onClick={() => bump(c, -1)} disabled={disabled || n <= 0}
                  aria-label={`Retirer une bille ${LABEL[c]}`}
                  className="w-11 h-11 rounded-lg bg-white border-2 border-slate-200 hover:border-slate-400 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{ touchAction: 'manipulation' }}>−</button>
                <span className="font-mono font-bold tabular-nums text-slate-800 w-6 text-center" aria-live="polite">{n}</span>
                <button type="button" onClick={() => bump(c, 1)} disabled={disabled || n >= max}
                  aria-label={`Ajouter une bille ${LABEL[c]}`}
                  className="w-11 h-11 rounded-lg bg-white border-2 border-slate-200 hover:border-slate-400 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{ touchAction: 'manipulation' }}>+</button>
                {showProbability && (
                  <span className="ml-auto text-sm font-mono text-slate-700 tabular-nums">
                    {p === null ? '—' : (
                      <MathText>{`$P(\\text{${LABEL[c]}}) = \\frac{${n}}{${total}}${fracLatex(n, total) !== `\\frac{${n}}{${total}}` ? ` = ${fracLatex(n, total)}` : ''}$`}</MathText>
                    )}
                  </span>
                )}
              </div>
            );
          })}
          <p className="text-xs font-mono text-slate-500">Total : <strong className="text-slate-700">{formatDec(total)}</strong> bille{total > 1 ? 's' : ''}</p>
        </div>
      </div>

      {onDraw && (
        <button type="button" className={btnPrimary} disabled={drawDisabled || total === 0}
          onClick={() => onDraw(drawN)} aria-label={`Tirer ${formatDec(drawN)} fois`} style={{ touchAction: 'manipulation' }}>
          🎯 Tirer {formatDec(drawN)} fois (avec remise)
        </button>
      )}

      {draws && (
        <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={`Résultats de ${formatDec(draws.n)} tirages`}>
          {COLOURS.map((c) => {
            const k = draws.counts[c];
            return (
              <div key={c} className={`rounded-xl border-2 px-2 py-1.5 flex flex-col items-center gap-0.5 ${highlight === c ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
                <span className="w-4 h-4 rounded-full" style={{ background: FILL[c] }} aria-hidden="true" />
                <span className="font-mono font-bold text-slate-800 tabular-nums text-sm">{formatDec(k)}</span>
                <span className="font-mono text-[11px] text-slate-500 tabular-nums">/ {formatDec(draws.n)}</span>
                <span className="font-mono text-xs font-semibold text-indigo-700 tabular-nums">{formatPct(k / draws.n, draws.n)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { FILL as MARBLE_FILL, LABELS as MARBLE_LABELS, btnSecondary };
