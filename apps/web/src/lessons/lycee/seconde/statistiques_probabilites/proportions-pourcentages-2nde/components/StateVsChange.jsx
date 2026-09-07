import React from 'react';
import { formatPercent, formatNumber, evolutionRate, percentagePointDifference } from '../../../../../common/stats';

/**
 * StateVsChange — deux états, deux lectures, affichées ENSEMBLE.
 *
 * Activité : l'élève règle une proportion « avant » et une proportion
 * « après » ; le composant affiche côte à côte les deux façons de résumer le
 * passage :
 *   · la différence en POINTS de pourcentage (après − avant) ;
 *   · le taux d'ÉVOLUTION relatif ((après − avant) / avant).
 *
 * Les deux nombres sont vrais et différents ; les voir diverger sur des
 * réglages qu'on choisit soi-même est le seul moyen d'installer la
 * distinction — un texte l'explique, une manipulation la fait constater.
 * Le cas particulier où ils coïncident (avant = 100 %) est atteignable.
 */
export default function StateVsChange({ before, after, onChange, unit = 'des élèves' }) {
  const points = percentagePointDifference(before, after);
  const rate = evolutionRate(before, after);
  const W = 300;
  const H = 120;

  const Bar = ({ p, label, color }) => (
    <div className="flex-1 min-w-[8rem] space-y-1.5">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label} : ${formatPercent(p, 1)}`} className="select-none">
        <rect x={0} y={0} width={W} height={H} fill="#e2e8f0" rx="6" />
        <rect x={0} y={H - p * H} width={W} height={p * H} fill={color} rx="6" />
        <text x={W / 2} y={H - p * H + (p > 0.22 ? 22 : -8)} textAnchor="middle" fontSize="18" fontWeight="900"
          fill={p > 0.22 ? '#fff' : '#334155'}>
          {formatPercent(p, 1)}
        </text>
      </svg>
    </div>
  );

  /** Curseur : le balayage continu montre les deux lectures diverger. */
  const Slider = ({ id, label, value, onPick, accent }) => (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">{label}</label>
        <span className="font-mono font-black text-lg tabular-nums text-slate-800">{formatPercent(value, 0)}</span>
      </div>
      <input id={id} type="range" min={5} max={100} step={5}
        value={Math.round(value * 100)}
        onChange={(e) => onPick(Number(e.target.value) / 100)}
        aria-label={label} aria-valuetext={formatPercent(value, 0)}
        className={`sa-slider ${accent}`} />
    </div>
  );

  return (
    <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <div className="flex gap-4 items-end">
        <Bar p={before} label={`Boursiers, année 1 (${unit})`} color="#64748b" />
        <div className="pb-10 text-2xl text-slate-400" aria-hidden="true">→</div>
        <Bar p={after} label={`Boursiers, année 2 (${unit})`} color="#059669" />
      </div>

      <div className="space-y-3">
        <Slider id="svc-before" label="Boursiers, année 1 :" value={before} onPick={(p) => onChange(p, after)} accent="accent-slate-600" />
        <Slider id="svc-after" label="Boursiers, année 2 :" value={after} onPick={(p) => onChange(before, p)} accent="accent-emerald-600" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3.5 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Différence — en POINTS</p>
          <p className="font-mono text-lg font-black text-amber-900 tabular-nums">
            {points >= 0 ? '+' : '−'}{formatNumber(Math.abs(points) * 100, 1)} points
          </p>
          <p className="text-xs text-amber-700">{formatPercent(after, 1)} − {formatPercent(before, 1)} : on soustrait deux états.</p>
        </div>
        <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3.5 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wide text-rose-600">Évolution — en POUR CENT</p>
          <p className="font-mono text-lg font-black text-rose-900 tabular-nums">
            {rate === null ? '—' : `${rate >= 0 ? '+' : '−'}${formatNumber(Math.abs(rate) * 100, 1)} %`}
          </p>
          <p className="text-xs text-rose-700">
            ({formatPercent(after, 1)} − {formatPercent(before, 1)}) ÷ {formatPercent(before, 1)} : on rapporte au départ.
          </p>
        </div>
      </div>
      {Math.abs(before - 1) < 1e-9 && (
        <p className="text-xs text-slate-500 italic">
          Cas particulier : quand la valeur de départ vaut 100 %, les deux lectures coïncident. C’est la seule situation où elles le font.
        </p>
      )}
      {Math.abs(before - after) < 1e-9 && (
        <p className="text-xs text-slate-500 italic">
          Deux années identiques : 0 point d’écart et 0 % d’évolution — les deux lectures se rejoignent aussi sur « rien n’a changé ».
        </p>
      )}
    </div>
  );
}
