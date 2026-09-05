import React from 'react';
import { formatDec } from '@smarter-academy/core';
import Stepper from './Stepper';

/**
 * IdentityGrid — le carré de côté a + b (ou a, ou l'équerre a² − b²), avec
 * a et b réglables.
 *
 * Activity: régler a et b ; lire les aires des morceaux ; comparer avec a² + b².
 * Mathematical objective: (a + b)² = a² + 2ab + b² ; (a − b)² = a² − 2ab + b² ;
 *   (a + b)(a − b) = a² − b² — lus sur des aires.
 * Student action: steppers a, b ; choix du mode par le module.
 * Controlled variable: a, b.
 * Mathematical state: a, b (module) ; toutes les aires dérivées.
 * Visual consequence: le carré se redécoupe ; la légende recalcule.
 * Expected observation: il y a DEUX rectangles ab, jamais zéro.
 *
 * SÉCURITÉ D'AFFICHAGE : viewBox fixe 300 × 300, échelle = 260 / côté ;
 * les étiquettes intérieures ne sont dessinées que si le morceau mesure
 * ≥ 34 px ; toutes les valeurs numériques sont dans la légende DOM.
 */
const S = 300; const PAD = 20; const INNER = S - 2 * PAD;
const FONT = "'JetBrains Mono', monospace";

function Piece({ x, y, w, h, fill, stroke, label, textFill = '#0f172a' }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth="2" />
      {w >= 34 && h >= 26 && <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="800" fontFamily={FONT} fill={textFill}>{label}</text>}
    </g>
  );
}

export default function IdentityGrid({ a, b, mode = 'plus', onA, onB, aRange = [1, 6], bRange = [1, 4], disabled = false }) {
  const side = mode === 'plus' ? a + b : a;
  const u = INNER / side;
  const A = a * u; const B = b * u;
  const legend = (() => {
    if (mode === 'plus') return { title: `(a + b)² avec a = ${a}, b = ${b}`, rows: [[`a² = ${a * a}`, '#c7d2fe'], [`ab = ${a * b}`, '#fde68a'], [`ab = ${a * b}`, '#fde68a'], [`b² = ${b * b}`, '#bbf7d0']], total: `(${a} + ${b})² = ${(a + b) ** 2} = ${a * a} + 2 × ${a * b} + ${b * b}`, trap: `a² + b² = ${a * a + b * b} ≠ ${(a + b) ** 2}` };
    if (mode === 'minus') return { title: `(a − b)² avec a = ${a}, b = ${b}`, rows: [[`(a − b)² = ${(a - b) ** 2}`, '#c7d2fe'], [`bande ab = ${a * b}`, '#fecaca'], [`bande ab = ${a * b}`, '#fecaca'], [`coin b² = ${b * b} (retiré deux fois, remis une fois)`, '#fbcfe8']], total: `(${a} − ${b})² = ${(a - b) ** 2} = ${a * a} − 2 × ${a * b} + ${b * b}`, trap: `a² − b² = ${a * a - b * b} ≠ ${(a - b) ** 2}` };
    return { title: `(a + b)(a − b) avec a = ${a}, b = ${b}`, rows: [[`a² = ${a * a}`, '#c7d2fe'], [`coin b² retiré = ${b * b}`, '#f1f5f9'], [`équerre = a² − b² = ${a * a - b * b}`, '#bbf7d0']], total: `(${a} + ${b})(${a} − ${b}) = ${(a + b) * (a - b)} = ${a * a} − ${b * b}`, trap: null };
  })();

  return (
    <div className="space-y-3" role="group" aria-label={legend.title}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Stepper label="a" value={a} onChange={onA} min={aRange[0]} max={aRange[1]} step={1} disabled={disabled} />
        <Stepper label="b" value={b} onChange={onB} min={bRange[0]} max={Math.min(bRange[1], mode === 'plus' ? bRange[1] : a - 1)} step={1} tone="amber" disabled={disabled} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-3 items-start">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[300px] h-auto mx-auto select-none" role="img" aria-label={legend.title}>
          {mode === 'plus' && (
            <g>
              <Piece x={PAD} y={PAD} w={A} h={A} fill="#c7d2fe" stroke="#4338ca" label="a²" />
              <Piece x={PAD + A} y={PAD} w={B} h={A} fill="#fde68a" stroke="#b45309" label="ab" />
              <Piece x={PAD} y={PAD + A} w={A} h={B} fill="#fde68a" stroke="#b45309" label="ab" />
              <Piece x={PAD + A} y={PAD + A} w={B} h={B} fill="#bbf7d0" stroke="#047857" label="b²" />
              <text x={PAD + A / 2} y={PAD - 6} textAnchor="middle" fontSize="13" fontFamily={FONT} fontWeight="700" fill="#4338ca">a</text>
              <text x={PAD + A + B / 2} y={PAD - 6} textAnchor="middle" fontSize="13" fontFamily={FONT} fontWeight="700" fill="#b45309">b</text>
            </g>
          )}
          {mode === 'minus' && (
            <g>
              <Piece x={PAD} y={PAD} w={A - B} h={A - B} fill="#c7d2fe" stroke="#4338ca" label="(a−b)²" />
              <Piece x={PAD + A - B} y={PAD} w={B} h={A - B} fill="#fecaca" stroke="#b91c1c" label="ab" />
              <Piece x={PAD} y={PAD + A - B} w={A - B} h={B} fill="#fecaca" stroke="#b91c1c" label="ab" />
              <Piece x={PAD + A - B} y={PAD + A - B} w={B} h={B} fill="#fbcfe8" stroke="#be185d" label="b²" />
              <text x={PAD + A / 2} y={PAD - 6} textAnchor="middle" fontSize="13" fontFamily={FONT} fontWeight="700" fill="#4338ca">a</text>
              <text x={PAD + A + 6} y={PAD + A - B / 2 + 4} textAnchor="start" fontSize="13" fontFamily={FONT} fontWeight="700" fill="#b91c1c">b</text>
            </g>
          )}
          {mode === 'diff' && (
            <g>
              <Piece x={PAD} y={PAD} w={A} h={A - B} fill="#bbf7d0" stroke="#047857" label="a(a−b)" />
              <Piece x={PAD} y={PAD + A - B} w={A - B} h={B} fill="#bbf7d0" stroke="#047857" label="b(a−b)" />
              <Piece x={PAD + A - B} y={PAD + A - B} w={B} h={B} fill="#f1f5f9" stroke="#94a3b8" label="b²" textFill="#64748b" />
              <text x={PAD + A / 2} y={PAD - 6} textAnchor="middle" fontSize="13" fontFamily={FONT} fontWeight="700" fill="#047857">a</text>
              <text x={PAD + A + 6} y={PAD + A - B / 2 + 4} textAnchor="start" fontSize="13" fontFamily={FONT} fontWeight="700" fill="#64748b">b</text>
            </g>
          )}
        </svg>
        <div className="space-y-1.5 font-mono text-sm">
          <div className="text-[11px] font-bold uppercase text-slate-500">{legend.title}</div>
          {legend.rows.map(([txt, color], i) => (
            <div key={i} className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded border border-slate-300" style={{ background: color }} aria-hidden="true" /><span className="text-slate-800">{txt}</span></div>
          ))}
          <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2 font-extrabold text-emerald-900" role="status">{legend.total}</div>
          {legend.trap && <div className="text-xs text-rose-700 font-bold">{legend.trap}</div>}
        </div>
      </div>
    </div>
  );
}
