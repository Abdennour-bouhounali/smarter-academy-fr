import React from 'react';
import { formatNumber, formatPercent } from './statsUtils';

/**
 * FrequencyChart — la fréquence observée en fonction du NOMBRE DE
 * RÉPÉTITIONS, en échelle logarithmique sur l'axe des n.
 *
 * L'échelle logarithmique n'est pas un choix esthétique : c'est le seul
 * moyen de voir sur un même graphique 10, 100, 1 000 et 10 000 répétitions
 * — donc de voir l'entonnoir se refermer, qui EST la loi des grands nombres.
 * La droite horizontale de la probabilité théorique reste fixe : c'est la
 * fréquence qui vient à elle, jamais l'inverse.
 *
 * @param {{n,frequency}[]} points   trajectoire (frequencyTrajectory)
 * @param {number} theoretical       probabilité théorique, tracée en repère
 * @param {{n,frequency,label}[]} [marks]  résultats ponctuels à situer
 */
export default function FrequencyChart({
  points,
  theoretical,
  marks = [],
  width = 640,
  height = 260,
  yPad = 0.12,
}) {
  if (!points || points.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
        Lance une première série pour voir la courbe apparaître.
      </div>
    );
  }
  const pad = { left: 46, right: 16, top: 16, bottom: 42 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;

  const allN = [...points.map((p) => p.n), ...marks.map((m) => m.n)];
  const nMax = Math.max(10, ...allN);
  const lx = (n) => (Math.log10(Math.max(1, n)) / Math.log10(nMax)) * W;

  const freqs = [...points.map((p) => p.frequency), theoretical, ...marks.map((m) => m.frequency)];
  let yLo = Math.min(...freqs) - yPad;
  let yHi = Math.max(...freqs) + yPad;
  yLo = Math.max(0, yLo); yHi = Math.min(1, yHi);
  if (yHi - yLo < 0.08) { yLo = Math.max(0, theoretical - 0.05); yHi = Math.min(1, theoretical + 0.05); }
  const ly = (f) => H - ((f - yLo) / (yHi - yLo)) * H;

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${lx(p.n).toFixed(1)},${ly(p.frequency).toFixed(1)}`).join(' ');

  const decades = [];
  for (let d = 1; d <= nMax; d *= 10) decades.push(d);
  if (decades[decades.length - 1] !== nMax) decades.push(nMax);

  const yTicks = [yLo, (yLo + yHi) / 2, yHi];

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label={`Fréquence observée selon le nombre de répétitions, probabilité théorique ${formatNumber(theoretical, 3)}`}
      className="select-none overflow-visible">
      <g transform={`translate(${pad.left},${pad.top})`}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={0} y1={ly(t)} x2={W} y2={ly(t)} stroke="#f1f5f9" strokeWidth="1" />
            <text x={-8} y={ly(t) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{formatPercent(t, 0)}</text>
          </g>
        ))}
        <line x1={0} y1={ly(theoretical)} x2={W} y2={ly(theoretical)} stroke="#059669" strokeWidth="2" strokeDasharray="6 4" />
        <text x={W - 2} y={ly(theoretical) - 6} textAnchor="end" fontSize="11" fontWeight="700" fill="#059669">
          p = {formatNumber(theoretical, 3)}
        </text>
        <path d={path} fill="none" stroke="#0284c7" strokeWidth="2.2" />
        {marks.map((m, i) => (
          <g key={i}>
            <circle cx={lx(m.n)} cy={ly(m.frequency)} r="4.5" fill="#e11d48" stroke="#fff" strokeWidth="1.5" />
            <text x={lx(m.n)} y={ly(m.frequency) - 9} textAnchor="middle" fontSize="10" fontWeight="700" fill="#e11d48">
              {m.label}
            </text>
          </g>
        ))}
        <line x1={0} y1={H} x2={W} y2={H} stroke="#475569" strokeWidth="1.5" />
        <line x1={0} y1={0} x2={0} y2={H} stroke="#475569" strokeWidth="1.5" />
        {decades.map((d) => (
          <g key={d}>
            <line x1={lx(d)} y1={H} x2={lx(d)} y2={H + 5} stroke="#94a3b8" strokeWidth="1" />
            <text x={lx(d)} y={H + 18} textAnchor="middle" fontSize="10" fill="#64748b">{d}</text>
          </g>
        ))}
        <text x={W} y={H + 34} textAnchor="end" fontSize="10" fill="#94a3b8">
          nombre de répétitions (échelle log)
        </text>
      </g>
    </svg>
  );
}
