import React from 'react';
import { formatDec } from '@smarter-academy/core';

/**
 * TruncatedLine — la courbe dont l'axe vertical ne part PAS de zéro.
 *
 * POURQUOI UN COMPOSANT À PART : `CoordPlane` dessine ses axes en x = 0 et
 * y = 0 par construction. Sur un cadre commençant à 17, l'axe des abscisses
 * tomberait 950 px sous un cadre de 198 px — hors du viewBox. Un axe tronqué
 * est donc impossible là-bas, et c'est pourtant l'objet même de la leçon : il
 * faut un tracé dont la base est une VALEUR, pas l'origine.
 *
 * Activity            comparer deux mises à l'échelle de la même série.
 * Mathematical objective  montrer qu'un axe tronqué n'invente aucun nombre mais
 *                     amplifie l'écart perçu.
 * Visual consequence  la base porte sa valeur en clair, et une marque « ≠ 0 »
 *                     signale la troncature au lieu de la cacher.
 *
 * SÉCURITÉ D'AFFICHAGE (§17bis) : les graduations sont mesurées avant d'être
 * posées ; la marge gauche s'adapte à la plus large d'entre elles, si bien
 * qu'une valeur comme « 1 250 » ne sort jamais du cadre.
 */

const VB_W = 340;
const VB_H = 232;
const PLOT = { top: 18, bottom: 178, right: 14 };
const GLYPH = { ',': 3, '−': 5.5, '-': 5.5, '.': 3 };
const textWidth = (s, size = 10) =>
  [...String(s)].reduce((n, c) => n + (GLYPH[c] ?? size * 0.6), 0);

export default function TruncatedLine({
  rows,                    // [{x, y}]
  base,                    // valeur du bas de l'axe (0 = axe complet)
  top,                     // valeur du haut de l'axe
  step,                    // pas des graduations
  xLabel = '',
  yLabel = '',
  tone = '#e11d48',
  ariaLabel,
}) {
  const ticks = [];
  for (let v = base; v <= top + 1e-9; v += step) ticks.push(Number(v.toFixed(6)));

  // La marge gauche est DÉDUITE de la plus large graduation réellement écrite.
  const widest = ticks.reduce((m, v) => Math.max(m, textWidth(formatDec(v))), 0);
  const left = Math.max(34, widest + 12);
  const plotW = VB_W - left - PLOT.right;
  const plotH = PLOT.bottom - PLOT.top;

  const xs = rows.map((r) => r.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const toX = (x) => left + ((x - xMin) / (xMax - xMin || 1)) * plotW;
  const toY = (y) => PLOT.bottom - ((y - base) / (top - base || 1)) * plotH;

  const pts = rows.map((r) => `${toX(r.x).toFixed(1)},${toY(r.y).toFixed(1)}`).join(' ');
  const truncated = base !== 0;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="w-full max-w-[460px] select-none bg-white rounded-xl border-2 border-slate-200"
      role="img"
      aria-label={
        ariaLabel ??
        `Courbe, axe vertical de ${formatDec(base)} à ${formatDec(top)}${truncated ? ', axe tronqué' : ''}`
      }
    >
      <g style={{ pointerEvents: 'none' }}>
        {ticks.map((v) => (
          <g key={`t${v}`}>
            <line x1={left} y1={toY(v)} x2={left + plotW} y2={toY(v)} stroke="#e2e8f0" strokeWidth="1" />
            <text x={left - 6} y={toY(v) + 4} textAnchor="end" fontSize="10"
              className="font-mono tabular-nums" fill="#64748b">
              {formatDec(v)}
            </text>
          </g>
        ))}

        <line x1={left} y1={PLOT.top} x2={left} y2={PLOT.bottom} stroke="#0f172a" strokeWidth="2" />
        <line x1={left} y1={PLOT.bottom} x2={left + plotW} y2={PLOT.bottom} stroke="#0f172a" strokeWidth="2" />

        {/* La troncature est SIGNALÉE, jamais dissimulée. */}
        {truncated && (
          <g>
            <path d={`M ${left - 5} ${PLOT.bottom - 8} l 10 -4 M ${left - 5} ${PLOT.bottom - 3} l 10 -4`}
              stroke="#d97706" strokeWidth="2" fill="none" />
            <text x={left - 6} y={PLOT.bottom + 26} textAnchor="start" fontSize="9"
              fill="#b45309" className="font-semibold">
              axe tronqué
            </text>
          </g>
        )}

        <polyline points={pts} fill="none" stroke={tone} strokeWidth="2.5" strokeLinejoin="round" />
        {rows.map((r, i) => (
          <circle key={`p${i}`} cx={toX(r.x)} cy={toY(r.y)} r="4.5" fill={tone} stroke="#fff" strokeWidth="1.5" />
        ))}

        {rows.map((r, i) => (
          <text key={`x${i}`} x={toX(r.x)} y={PLOT.bottom + 16} textAnchor="middle" fontSize="10"
            className="font-mono tabular-nums" fill="#64748b">
            {formatDec(r.x)}
          </text>
        ))}

        {xLabel && (
          <text x={left + plotW} y={PLOT.bottom + 30} textAnchor="end" fontSize="11" fill="#475569">{xLabel}</text>
        )}
        {yLabel && (
          <text x={left} y={PLOT.top - 6} textAnchor="middle" fontSize="11" fill="#475569">{yLabel}</text>
        )}
      </g>
    </svg>
  );
}
