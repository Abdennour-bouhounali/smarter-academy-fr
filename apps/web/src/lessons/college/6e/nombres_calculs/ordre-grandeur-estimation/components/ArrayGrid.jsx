import React from 'react';
import { motion } from 'framer-motion';
import { formatFr } from './estimationUtils';

/**
 * ArrayGrid — représentation géométrique d'un produit rows × cols.
 *
 * Un produit comme 50 × 20 devient un RECTANGLE : la surface rend l'ordre
 * de grandeur visible d'un coup d'œil, sans compter 1 000 cases une par
 * une. La grille affichée est donc SCHÉMATIQUE (quelques lignes/colonnes
 * représentatives), jamais un damier littéral de `rows × cols` cellules.
 */
export default function ArrayGrid({ rows, cols, tone = 'indigo', caption }) {
  const TONE = {
    indigo: { fill: 'fill-indigo-400', stroke: 'stroke-indigo-600', text: 'text-indigo-700', bg: 'bg-indigo-50' },
    emerald: { fill: 'fill-emerald-400', stroke: 'stroke-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    amber: { fill: 'fill-amber-400', stroke: 'stroke-amber-600', text: 'text-amber-700', bg: 'bg-amber-50' },
  };
  const t = TONE[tone] || TONE.indigo;

  // Grille schématique : au plus 10 lignes/colonnes affichées, chaque
  // trait représentant un paquet de valeurs plutôt qu'une unité isolée.
  const showRows = Math.min(rows, 8);
  const showCols = Math.min(cols, 10);
  const W = 260;
  const H = (W * showRows) / showCols;
  const cellW = W / showCols;
  const cellH = H / showRows;

  return (
    <div className="space-y-2">
      <div className={`rounded-2xl border-2 p-4 ${t.bg} border-slate-200 flex flex-col items-center gap-2`}>
        <div className="flex items-center gap-2">
          <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-slate-500" style={{ height: H }}>
            <span>{rows}</span>
            <span className="self-end" aria-hidden="true">↓</span>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`Rectangle représentant ${rows} × ${cols}`}>
            <rect x="0" y="0" width={W} height={H} className={`${t.fill} opacity-20`} />
            {Array.from({ length: showRows + 1 }, (_, i) => (
              <line key={`h${i}`} x1={0} y1={i * cellH} x2={W} y2={i * cellH} className={t.stroke} strokeWidth="1.5" />
            ))}
            {Array.from({ length: showCols + 1 }, (_, i) => (
              <line key={`v${i}`} x1={i * cellW} y1={0} x2={i * cellW} y2={H} className={t.stroke} strokeWidth="1.5" />
            ))}
            <rect x="0" y="0" width={W} height={H} fill="none" className={t.stroke} strokeWidth="3" />
          </svg>
        </div>
        <div className="text-[10px] font-mono font-bold text-slate-500">{cols} →</div>
      </div>

      <p className={`text-xs font-mono text-center ${t.text}`}>
        {caption || `${formatFr(rows)} × ${formatFr(cols)} = surface du rectangle`}
      </p>
    </div>
  );
}
