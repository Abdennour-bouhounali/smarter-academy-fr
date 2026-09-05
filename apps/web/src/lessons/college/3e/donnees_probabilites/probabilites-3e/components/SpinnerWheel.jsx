import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { formatDec } from '@smarter-academy/core';
import MathText from '../../../../../common/components/MathText';
import { COLOURS, fracLatex, formatPct } from './probaUtils';
import { btnPrimary, btnSecondary } from './DiceLab';
import { MARBLE_FILL as FILL, MARBLE_LABELS as LABELS } from './MarbleBag';

/**
 * SpinnerWheel — une roue à 12 secteurs égaux, coloriés par le module.
 *
 * Activity            régler le nombre de secteurs rouges / bleus (le vert
 *                     complète), tourner la roue ×1 ou ×120.
 * Mathematical objective  transférer P = favorables ÷ possibles à des SECTEURS :
 *                     P(rouge) = nb de secteurs rouges ÷ 12 — la part de la
 *                     roue, proportionnelle à l'angle.
 * Student action      − / + sur les couleurs ; « Tourner ».
 * Controlled variable la composition de la roue.
 * Mathematical state  `sectors` {rouge, bleu} (vert = 12 − rouge − bleu)
 *                     appartient au module ; les probabilités et les
 *                     tirages sont dérivés / fournis en instantané.
 * Visual consequence  les secteurs se recolorient ; la roue tourne puis
 *                     s'arrête ; la couleur sous l'aiguille est annoncée
 *                     APRÈS l'arrêt (settle-then-number).
 * Expected observation « 4 secteurs sur 12, c'est 1 sur 3 ».
 *
 * SÉCURITÉ D'AFFICHAGE : aucun texte dans le SVG ; lectures dans le DOM.
 */
const N = 12;
const R = 90;
const CX = 100;
const CY = 100;

function sectorPath(i) {
  const a0 = ((i * 360) / N - 90) * (Math.PI / 180);
  const a1 = (((i + 1) * 360) / N - 90) * (Math.PI / 180);
  const x0 = CX + R * Math.cos(a0);
  const y0 = CY + R * Math.sin(a0);
  const x1 = CX + R * Math.cos(a1);
  const y1 = CY + R * Math.sin(a1);
  return `M${CX} ${CY} L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z`;
}

export const wheelColours = (sectors) => {
  const out = [];
  for (let i = 0; i < sectors.rouge; i += 1) out.push('rouge');
  for (let i = 0; i < sectors.bleu; i += 1) out.push('bleu');
  while (out.length < N) out.push('vert');
  return out;
};

export default function SpinnerWheel({
  sectors,                // { rouge, bleu } — vert = reste
  onChange,
  spins = null,           // { counts: {rouge, bleu, vert}, n, last }
  onSpin,                 // (n) => void
  spinning = false,
  showProbability = false,
  disabled = false,       // fige les steppers, pas le bouton Tourner
  caption,
}) {
  const reduce = useReducedMotion();
  const cols = wheelColours(sectors);
  const green = N - sectors.rouge - sectors.bleu;
  const [turn, setTurn] = useState(0);
  useEffect(() => { if (spinning && !reduce) setTurn((t) => t + 720 + 30); }, [spinning, reduce]);

  const bump = (c, d) => {
    if (disabled) return;
    const next = { ...sectors, [c]: sectors[c] + d };
    if (next[c] < 0 || next.rouge + next.bleu > N) return;
    onChange?.(next);
  };
  const counts = { rouge: sectors.rouge, bleu: sectors.bleu, vert: green };
  const reading = `Roue : ${COLOURS.map((c) => `${counts[c]} secteur${counts[c] > 1 ? 's' : ''} ${LABELS[c]}`).join(', ')} sur 12`;

  return (
    <div className="w-full rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3" role="group" aria-label={reading}>
      {caption && <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wide">{caption}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-3 items-center">
        <div className="relative w-[200px] mx-auto">
          <svg viewBox="0 0 200 200" className="w-full block" role="img" aria-label={reading}>
            <g style={{ transformOrigin: '100px 100px', transform: `rotate(${turn}deg)`, transition: reduce ? 'none' : 'transform 900ms cubic-bezier(.2,.8,.2,1)' }}>
              {cols.map((c, i) => (
                <path key={i} d={sectorPath(i)} fill={FILL[c]} stroke="#ffffff" strokeWidth="2" />
              ))}
              <circle cx={CX} cy={CY} r="10" fill="#0f172a" />
            </g>
            <polygon points="100,2 92,22 108,22" fill="#0f172a" />
          </svg>
        </div>
        <div className="space-y-2">
          {['rouge', 'bleu'].map((c) => (
            <div key={c} className="flex items-center gap-2 flex-wrap rounded-xl border-2 border-slate-200 bg-slate-50 px-2 py-1.5">
              <span className="w-4 h-4 rounded-full shrink-0" style={{ background: FILL[c] }} aria-hidden="true" />
              <span className="text-sm font-semibold text-slate-700 w-14">{LABELS[c]}</span>
              <button type="button" onClick={() => bump(c, -1)} disabled={disabled || sectors[c] <= 0}
                aria-label={`Un secteur ${c} de moins`}
                className="w-11 h-11 rounded-lg bg-white border-2 border-slate-200 hover:border-slate-400 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ touchAction: 'manipulation' }}>−</button>
              <span className="font-mono font-bold tabular-nums text-slate-800 w-6 text-center">{sectors[c]}</span>
              <button type="button" onClick={() => bump(c, 1)} disabled={disabled || green <= 0}
                aria-label={`Un secteur ${c} de plus`}
                className="w-11 h-11 rounded-lg bg-white border-2 border-slate-200 hover:border-slate-400 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ touchAction: 'manipulation' }}>+</button>
              {showProbability && (
                <span className="ml-auto text-sm font-mono text-slate-700"><MathText>{`$P(\\text{${c}}) = ${fracLatex(sectors[c], N)}$`}</MathText></span>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-2 py-1.5 min-h-[44px]">
            <span className="w-4 h-4 rounded-full shrink-0" style={{ background: FILL.vert }} aria-hidden="true" />
            <span className="text-sm font-semibold text-slate-700 w-14">vertes</span>
            <span className="font-mono font-bold tabular-nums text-slate-800">{green}</span>
            <span className="text-xs text-slate-500">(le reste)</span>
            {showProbability && (
              <span className="ml-auto text-sm font-mono text-slate-700"><MathText>{`$P(\\text{vert}) = ${fracLatex(green, N)}$`}</MathText></span>
            )}
          </div>
        </div>
      </div>

      {onSpin && (
        <div className="flex flex-wrap gap-2 items-center">
          <button type="button" className={btnPrimary} disabled={spinning} onClick={() => onSpin(1)}
            aria-label="Tourner la roue" style={{ touchAction: 'manipulation' }}>🎡 Tourner</button>
          <button type="button" className={btnSecondary} disabled={spinning} onClick={() => onSpin(120)}
            aria-label="Tourner 120 fois" style={{ touchAction: 'manipulation' }}>Tourner ×120</button>
          <span className="text-sm font-mono text-slate-700" aria-live="polite">
            {spinning && !reduce ? '…' : spins?.last ? <>→ <strong style={{ color: FILL[spins.last] }}>{spins.last}</strong></> : ''}
          </span>
        </div>
      )}

      {spins && spins.n > 0 && (
        <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={`Résultats de ${formatDec(spins.n)} tours`}>
          {COLOURS.map((c) => (
            <div key={c} className="rounded-xl border-2 border-slate-200 bg-slate-50 px-2 py-1.5 flex flex-col items-center gap-0.5">
              <span className="w-4 h-4 rounded-full" style={{ background: FILL[c] }} aria-hidden="true" />
              <span className="font-mono font-bold text-slate-800 tabular-nums text-sm">{formatDec(spins.counts[c])}</span>
              <span className="font-mono text-[11px] text-slate-500 tabular-nums">/ {formatDec(spins.n)}</span>
              <span className="font-mono text-xs font-semibold text-indigo-700 tabular-nums">{formatPct(spins.counts[c] / spins.n, spins.n)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
