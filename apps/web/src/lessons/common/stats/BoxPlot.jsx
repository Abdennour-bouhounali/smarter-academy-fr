import React from 'react';
import { fiveNumberSummary, formatNumber } from './statsUtils';

/**
 * BoxPlot — une ou plusieurs boîtes à moustaches sur un axe COMMUN.
 *
 * L'axe partagé est le point pédagogique : deux distributions ne se
 * comparent que sur la même échelle. Chaque boîte peut être révélée
 * partiellement (`reveal`), pour que la leçon construise le résumé des cinq
 * nombres dans l'ordre où l'élève le découvre.
 *
 * @param {{id, label, values, color?}[]} series
 * @param {{min,max}} [domain]
 * @param {'none'|'min'|'q1'|'median'|'q3'|'max'|'all'} [reveal='all'] dernier repère
 *        montré, dans l'ordre de construction ORDER. 'none' n'affiche que
 *        l'axe — l'état initial d'une construction progressive.
 */
const ORDER = ['min', 'max', 'median', 'q1', 'q3'];

export default function BoxPlot({
  series,
  domain,
  reveal = 'all',
  unit = '',
  width = 640,
  rowHeight = 92,
  showValues = true,
}) {
  const summaries = series.map((s) => ({ ...s, five: fiveNumberSummary(s.values) })).filter((s) => s.five);
  if (summaries.length === 0) return null;

  const lo = domain?.min ?? Math.min(...summaries.map((s) => s.five.min));
  const hi = domain?.max ?? Math.max(...summaries.map((s) => s.five.max));
  const span = hi - lo || 1;
  const marginRatio = 0.06;
  const axisLo = lo - span * marginRatio;
  const axisHi = hi + span * marginRatio;
  const axisSpan = axisHi - axisLo;

  const pad = { left: 96, right: 26, top: 14, bottom: 46 };
  const W = width - pad.left - pad.right;
  const height = pad.top + pad.bottom + summaries.length * rowHeight;
  const toX = (v) => ((v - axisLo) / axisSpan) * W;

  // 'all' montre tout ; 'none' (ou une valeur inconnue) ne montre rien —
  // indexOf renvoie -1, donc shownUpTo vaut 0 et aucun repère ne passe le test.
  const shownUpTo = reveal === 'all' ? ORDER.length : ORDER.indexOf(reveal) + 1;
  const shows = (mark) => reveal === 'all' || ORDER.indexOf(mark) < shownUpTo;
  const boxReady = shows('q1') && shows('q3');

  const niceStep = (sp) => {
    for (const st of [0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000]) if (sp / st <= 8) return st;
    return 5000;
  };
  const step = niceStep(axisSpan);
  const ticks = [];
  for (let t = Math.ceil(axisLo / step) * step; t <= axisHi + 1e-9; t += step) ticks.push(Number(t.toFixed(6)));

  const axisY = pad.top + summaries.length * rowHeight;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label={`Boîtes à moustaches : ${summaries.map((s) => s.label).join(', ')}`}
      className="select-none overflow-visible">
      {summaries.map((s, i) => {
        const y = pad.top + i * rowHeight + rowHeight / 2;
        const bh = Math.min(34, rowHeight - 30);
        const color = s.color ?? (i === 0 ? '#0284c7' : '#c026d3');
        const f = s.five;
        return (
          <g key={s.id}>
            <text x={pad.left - 12} y={y + 4} textAnchor="end" fontSize="12" fontWeight="700" fill="#334155">
              {s.label}
            </text>
            <g transform={`translate(${pad.left},0)`}>
              {/* moustaches — seulement quand min/max sont révélés */}
              {shows('min') && boxReady && (
                <line x1={toX(f.min)} y1={y} x2={toX(f.q1)} y2={y} stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
              )}
              {shows('max') && boxReady && (
                <line x1={toX(f.q3)} y1={y} x2={toX(f.max)} y2={y} stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
              )}
              {shows('min') && (
                <line x1={toX(f.min)} y1={y - bh / 2.6} x2={toX(f.min)} y2={y + bh / 2.6} stroke={color} strokeWidth="2.5" />
              )}
              {shows('max') && (
                <line x1={toX(f.max)} y1={y - bh / 2.6} x2={toX(f.max)} y2={y + bh / 2.6} stroke={color} strokeWidth="2.5" />
              )}
              {boxReady && (
                <rect x={toX(f.q1)} y={y - bh / 2} width={Math.max(2, toX(f.q3) - toX(f.q1))} height={bh}
                  fill={color} fillOpacity="0.16" stroke={color} strokeWidth="2" rx="3" />
              )}
              {shows('median') && (
                <line x1={toX(f.median)} y1={y - bh / 2} x2={toX(f.median)} y2={y + bh / 2}
                  stroke="#059669" strokeWidth="3" />
              )}
              {showValues && (() => {
                /* Les cinq étiquettes se chevauchaient dès que deux repères
                   étaient proches (Q1 contre le minimum, Q1 contre Q3 sur une
                   boîte étroite). On les répartit sur DEUX lignes au-dessus —
                   extrêmes sur la ligne haute, quartiles sur la ligne basse —
                   et l'on masque une étiquette de quartile qui viendrait
                   encore recouvrir sa voisine. La médiane reste sous la boîte. */
                const yTop = y - bh / 2 - 20;
                const yMid = y - bh / 2 - 6;
                const near = (a, b, px) => Math.abs(toX(a) - toX(b)) < px;
                const q1Hidden = shows('q1') && shows('q3') && near(f.q1, f.q3, 62);
                return (
                  <>
                    {shows('min') && <text x={toX(f.min)} y={yTop} textAnchor="middle" fontSize="10" fill="#64748b">{formatNumber(f.min, 2)}</text>}
                    {shows('max') && <text x={toX(f.max)} y={yTop} textAnchor="middle" fontSize="10" fill="#64748b">{formatNumber(f.max, 2)}</text>}
                    {shows('median') && <text x={toX(f.median)} y={y + bh / 2 + 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="#059669">{formatNumber(f.median, 2)}</text>}
                    {shows('q1') && !q1Hidden && <text x={toX(f.q1)} y={yMid} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>Q1 {formatNumber(f.q1, 2)}</text>}
                    {shows('q3') && <text x={toX(f.q3)} y={yMid} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>{q1Hidden ? `Q1 ${formatNumber(f.q1, 2)} · Q3 ${formatNumber(f.q3, 2)}` : `Q3 ${formatNumber(f.q3, 2)}`}</text>}
                  </>
                );
              })()}
            </g>
          </g>
        );
      })}
      <g transform={`translate(${pad.left},0)`}>
        <line x1={0} y1={axisY} x2={W} y2={axisY} stroke="#475569" strokeWidth="1.5" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={axisY} x2={toX(t)} y2={axisY + 5} stroke="#94a3b8" strokeWidth="1" />
            <text x={toX(t)} y={axisY + 19} textAnchor="middle" fontSize="11" fill="#64748b">{formatNumber(t, 2)}</text>
          </g>
        ))}
        {unit && <text x={W} y={axisY + 34} textAnchor="end" fontSize="10" fill="#94a3b8">{unit}</text>}
      </g>
    </svg>
  );
}
