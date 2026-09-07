import React from 'react';
import { sorted, fiveNumberSummary, mean as meanOf, formatNumber } from './statsUtils';

/**
 * DotPlot — la série brute posée sur un axe, une pastille par individu
 * (empilées quand une valeur se répète).
 *
 * C'est la représentation « avant tout indicateur » : l'élève voit les
 * données elles-mêmes, et peut ensuite y superposer la moyenne, la médiane
 * ou les quartiles pour constater où ils tombent. Les repères sont OPTIONNELS
 * et révélés un par un par le module — jamais tous affichés d'emblée.
 *
 * @param {number[]} values
 * @param {{min:number,max:number}} [domain]   bornes de l'axe (déf. étendue de la série)
 * @param {boolean} [showMean] [showMedian] [showQuartiles]
 * @param {number[]} [highlight]  valeurs à mettre en évidence (ex. la valeur ajoutée)
 */
export default function DotPlot({
  values,
  domain,
  showMean = false,
  showMedian = false,
  showQuartiles = false,
  highlight = [],
  unit = '',
  width = 640,
  height = 222,
  label = 'Série',
}) {
  const s = sorted(values);
  const lo = domain?.min ?? (s.length ? s[0] : 0);
  const hi = domain?.max ?? (s.length ? s[s.length - 1] : 1);
  const span = hi - lo || 1;
  const pad = { left: 34, right: 34, top: 16, bottom: 48 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;
  const toX = (v) => ((v - lo) / span) * W;

  // Empilement : chaque valeur répétée monte d'un cran.
  const seen = new Map();
  const dots = s.map((v) => {
    const k = seen.get(v) ?? 0;
    seen.set(v, k + 1);
    return { v, stack: k };
  });
  const maxStack = Math.max(1, ...[...seen.values()]);
  const dotR = Math.max(4, Math.min(8, H / (maxStack + 2) / 2));
  const baseY = H - 4;
  const yOf = (stack) => baseY - stack * (dotR * 2 + 2) - dotR;

  const five = s.length ? fiveNumberSummary(s) : null;
  const m = s.length ? meanOf(s) : null;

  // Graduations rondes : au plus 8.
  const niceStep = (sp) => {
    for (const st of [0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000]) if (sp / st <= 8) return st;
    return 2000;
  };
  const step = niceStep(span);
  const ticks = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) ticks.push(Number(t.toFixed(6)));

  const marker = (x, color, text, dy) => (
    <g key={`${text}-${x}`}>
      <line x1={toX(x)} y1={-2} x2={toX(x)} y2={baseY + 2} stroke={color} strokeWidth="2" strokeDasharray="4 3" />
      <text x={toX(x)} y={dy} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{text}</text>
    </g>
  );

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label={`${label} : ${s.length} valeurs de ${formatNumber(lo)} à ${formatNumber(hi)}${unit ? ` ${unit}` : ''}`}
      className="select-none overflow-visible">
      <g transform={`translate(${pad.left},${pad.top})`}>
        {showQuartiles && five && (
          <rect x={toX(five.q1)} y={2} width={Math.max(1, toX(five.q3) - toX(five.q1))} height={baseY - 2}
            fill="#c7d2fe" opacity="0.35" />
        )}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={baseY} x2={toX(t)} y2={baseY + 5} stroke="#94a3b8" strokeWidth="1" />
            <text x={toX(t)} y={baseY + 19} textAnchor="middle" fontSize="11" fill="#64748b">
              {formatNumber(t, 2)}
            </text>
          </g>
        ))}
        <line x1={0} y1={baseY} x2={W} y2={baseY} stroke="#475569" strokeWidth="1.5" />
        {dots.map((d, i) => {
          const on = highlight.includes(d.v);
          return (
            <circle key={i} cx={toX(d.v)} cy={yOf(d.stack)} r={dotR}
              fill={on ? '#e11d48' : '#0284c7'} stroke="#fff" strokeWidth="1.5" opacity={on ? 1 : 0.85} />
          );
        })}
        {showQuartiles && five && (
          <>
            {marker(five.q1, '#7c3aed', `Q1 = ${formatNumber(five.q1, 2)}`, -4)}
            {marker(five.q3, '#7c3aed', `Q3 = ${formatNumber(five.q3, 2)}`, baseY + 34)}
          </>
        )}
        {showMedian && five && marker(five.median, '#059669', `Méd = ${formatNumber(five.median, 2)}`, -4)}
        {showMean && m !== null && marker(m, '#d97706', `Moy = ${formatNumber(m, 2)}`, baseY + 34)}
        {unit && <text x={W} y={baseY + 34} textAnchor="end" fontSize="10" fill="#94a3b8">{unit}</text>}
      </g>
    </svg>
  );
}
