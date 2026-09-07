import React from 'react';
import { formatNumber, formatPercent, coefficient, applyRate } from '../../../../../common/stats';

/**
 * CoefficientDial — le taux d'évolution et son coefficient, liés par un
 * curseur continu.
 *
 * Activité : l'élève glisse un TAUX (ce qu'on lit dans un journal) et voit
 * le COEFFICIENT se déplacer sur un axe où 1 est au centre. Le geste continu
 * est ici l'argument pédagogique : en traversant 0 %, l'élève voit le curseur
 * passer par 1 — et non par 0. C'est ce passage qui rend impossible de
 * confondre « −20 % » avec ×0,2 ou ×(−0,2).
 *
 * RÈGLE GÉNÉRALE DU PROJET : jamais figé après validation de l'étape.
 */
export default function CoefficientDial({ rate, onChange, initial = 200, unit = '€' }) {
  const k = coefficient(rate);
  const final = applyRate(initial, rate);

  const W = 620;
  const H = 62;
  const kMin = 0.4; const kMax = 2.1;
  const xOf = (v) => ((v - kMin) / (kMax - kMin)) * W;

  return (
    <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <label htmlFor="cd-rate" className="text-sm font-semibold text-slate-700">Taux d’évolution :</label>
          <span className={`font-mono font-black text-lg tabular-nums ${rate > 0 ? 'text-emerald-700' : rate < 0 ? 'text-rose-700' : 'text-slate-600'}`}>
            {rate > 0 ? '+' : ''}{formatNumber(rate * 100, 0)} %
          </span>
        </div>
        <input id="cd-rate" type="range" min={-60} max={100} step={5}
          value={Math.round(rate * 100)}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          aria-label="Taux d’évolution"
          aria-valuetext={`${rate > 0 ? 'plus ' : rate < 0 ? 'moins ' : ''}${formatNumber(Math.abs(rate) * 100, 0)} pour cent`}
          className="sa-slider accent-cyan-600" />
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Coefficient multiplicateur ${formatNumber(k, 2)} sur un axe où 1 signifie aucun changement`}
        className="select-none overflow-visible">
        <line x1={0} y1={H - 22} x2={W} y2={H - 22} stroke="#475569" strokeWidth="1.5" />
        {/* Le 1 est le pivot : à gauche on diminue, à droite on augmente. */}
        <line x1={xOf(1)} y1={8} x2={xOf(1)} y2={H - 16} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
        <text x={xOf(1)} y={H - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">1 — rien ne change</text>
        {[0.5, 0.75, 1.25, 1.5, 2].map((v) => (
          <g key={v}>
            <line x1={xOf(v)} y1={H - 26} x2={xOf(v)} y2={H - 18} stroke="#cbd5e1" strokeWidth="1" />
            <text x={xOf(v)} y={H - 4} textAnchor="middle" fontSize="10" fill="#94a3b8">{formatNumber(v, 2)}</text>
          </g>
        ))}
        <circle cx={xOf(Math.max(kMin, Math.min(kMax, k)))} cy={H - 22} r="8"
          fill={k > 1 ? '#059669' : k < 1 ? '#e11d48' : '#64748b'} stroke="#fff" strokeWidth="2" />
        <text x={xOf(Math.max(kMin, Math.min(kMax, k)))} y={16} textAnchor="middle" fontSize="14" fontWeight="900"
          fill={k > 1 ? '#059669' : k < 1 ? '#e11d48' : '#64748b'}>
          ×{formatNumber(k, 2)}
        </text>
      </svg>

      <div className="rounded-xl border-2 border-cyan-200 bg-cyan-50 p-3.5 space-y-1.5">
        <p className="font-mono text-sm text-cyan-900">
          k = 1 {rate >= 0 ? '+' : '−'} {formatNumber(Math.abs(rate), 2)} = <strong className="text-lg">{formatNumber(k, 2)}</strong>
        </p>
        <p className="font-mono text-sm text-cyan-900">
          {formatNumber(initial, 2)} {unit} × {formatNumber(k, 2)} = <strong className="text-lg">{formatNumber(final, 2)} {unit}</strong>
        </p>
        <p className="text-xs text-cyan-700">
          {rate > 0 && <>Hausse de {formatPercent(rate, 0)} : k &gt; 1, la valeur augmente.</>}
          {rate < 0 && <>Baisse de {formatPercent(Math.abs(rate), 0)} : k &lt; 1 (mais toujours positif), la valeur diminue.</>}
          {rate === 0 && <>Aucune évolution : k = 1, la valeur est inchangée.</>}
        </p>
      </div>
    </div>
  );
}
