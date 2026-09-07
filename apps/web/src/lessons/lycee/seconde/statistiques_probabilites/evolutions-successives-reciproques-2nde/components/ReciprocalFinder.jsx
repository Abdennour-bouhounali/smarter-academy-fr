import React from 'react';
import { formatNumber, formatPercent, coefficient, reciprocalRate } from '../../../../../common/stats';

/**
 * ReciprocalFinder — chercher le taux qui ANNULE une évolution donnée.
 *
 * Activité : la première évolution est imposée (elle vient de l'énoncé) ;
 * l'élève fait glisser la SECONDE et vise le retour exact au prix de départ.
 * Le composant affiche en permanence le produit des deux coefficients et
 * l'écart au départ, matérialisé par un segment rouge qui se referme.
 *
 * L'intérêt du geste : l'élève essaie naturellement l'opposé (−25 % pour
 * annuler +25 %) et VOIT que ça ne suffit pas, puis cherche — et trouve
 * −20 %. La règle k' = 1/k est ensuite nommée comme l'explication de ce
 * qu'il a trouvé, jamais comme une consigne préalable.
 *
 * Le pas de 1 % rend la cible atteignable exactement pour les taux usuels
 * (+25 % → −20 %, +100 % → −50 %, −20 % → +25 %).
 *
 * RÈGLE GÉNÉRALE DU PROJET : jamais figé après validation.
 */
export default function ReciprocalFinder({ firstRate, secondRate, onSecondChange, initial = 100, unit = '€' }) {
  const k1 = coefficient(firstRate);
  const k2 = coefficient(secondRate);
  const mid = initial * k1;
  const final = mid * k2;
  const kGlobal = k1 * k2;
  const exact = reciprocalRate(firstRate);
  const gap = final - initial;
  const onTarget = Math.abs(gap) < 0.005 * initial;

  const W = 620;
  const H = 46;
  // Échelle centrée sur le départ : ±50 % autour de la valeur initiale.
  const lo = initial * 0.5; const hi = initial * 1.5;
  const xOf = (v) => ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * W;

  return (
    <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-stretch gap-2">
        {[
          { l: 'départ', v: initial, k: null, tone: 'border-slate-300 bg-slate-50 text-slate-800' },
          { l: 'après la 1re', v: mid, k: k1, tone: 'border-slate-200 bg-white text-slate-800' },
          { l: 'arrivée', v: final, k: k2, tone: onTarget ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-900' },
        ].map((c) => (
          <React.Fragment key={c.l}>
            {c.k !== null && (
              <div className="flex flex-col items-center justify-center px-1 min-w-[4.5rem]">
                <span className="font-mono text-sm font-black text-slate-600">×{formatNumber(c.k, 3)}</span>
                <span className="text-2xl leading-none text-slate-300" aria-hidden="true">→</span>
              </div>
            )}
            <div className={`rounded-xl border-2 px-3.5 py-2.5 min-w-[6.5rem] text-center ${c.tone}`}>
              <p className="text-[13px] font-bold uppercase tracking-wide opacity-60">{c.l}</p>
              <p className="font-mono font-black tabular-nums text-lg">{formatNumber(c.v, 2)} {unit}</p>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* La cible : le départ est un trait vertical ; l'arrivée un point qui
          s'en approche. Le retour exact est un point unique, pas une zone. */}
      <svg width="100%" viewBox={`0 0 ${W} ${H + 16}`} role="img"
        aria-label={`Arrivée ${formatNumber(final, 2)} ${unit}, départ ${formatNumber(initial, 2)} ${unit}, écart ${formatNumber(gap, 2)} ${unit}`}
        className="select-none overflow-visible">
        <line x1={0} y1={H - 16} x2={W} y2={H - 16} stroke="#cbd5e1" strokeWidth="1.5" />
        {!onTarget && (
          <line x1={xOf(initial)} y1={H - 16} x2={xOf(final)} y2={H - 16} stroke="#e11d48" strokeWidth="4" />
        )}
        <line x1={xOf(initial)} y1={6} x2={xOf(initial)} y2={H - 8} stroke="#0f172a" strokeWidth="2.5" />
        <text x={Math.max(52, Math.min(W - 52, xOf(initial)))} y={H + 3}
          textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a">
          départ {formatNumber(initial, 0)} {unit}
        </text>
        <circle cx={xOf(final)} cy={H - 16} r="8" fill={onTarget ? '#059669' : '#e11d48'} stroke="#fff" strokeWidth="2" />
        <text x={Math.max(46, Math.min(W - 46, xOf(final)))} y={16}
          textAnchor="middle" fontSize="12" fontWeight="800" fill={onTarget ? '#059669' : '#e11d48'}>
          {onTarget ? '✓ au départ' : `${gap > 0 ? '+' : '−'}${formatNumber(Math.abs(gap), 2)} ${unit}`}
        </text>
      </svg>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <label htmlFor="rf-second" className="text-sm font-semibold text-slate-700">
            Seconde évolution — celle qui doit ramener au départ :
          </label>
          <span className={`font-mono font-black text-lg tabular-nums ${secondRate > 0 ? 'text-emerald-700' : secondRate < 0 ? 'text-rose-700' : 'text-slate-600'}`}>
            {secondRate > 0 ? '+' : ''}{formatNumber(secondRate * 100, 0)} %
          </span>
        </div>
        <input id="rf-second" type="range" min={-60} max={110} step={1}
          value={Math.round(secondRate * 100)}
          onChange={(e) => onSecondChange(Number(e.target.value) / 100)}
          aria-label="Taux de la seconde évolution"
          aria-valuetext={`${formatNumber(secondRate * 100, 0)} pour cent, arrivée ${formatNumber(final, 2)} ${unit}`}
          className="sa-slider accent-emerald-600" />
      </div>

      <div className={`rounded-xl border-2 p-3.5 space-y-1 ${onTarget ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
        <p className="font-mono text-sm text-slate-800">
          {formatNumber(k1, 2)} × {formatNumber(k2, 3)} = <strong className="text-lg">{formatNumber(kGlobal, 4)}</strong>
          <span className="text-slate-400"> — il faut exactement 1</span>
        </p>
        {onTarget ? (
          <p className="text-sm font-bold text-emerald-800">
            Trouvé : {exact >= 0 ? 'une hausse' : 'une baisse'} de {formatPercent(Math.abs(exact), 1)}, soit
            {' '}×{formatNumber(1 / k1, 3)} = 1 ÷ {formatNumber(k1, 2)}.
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            L’opposé du premier taux ({firstRate >= 0 ? '−' : '+'}{formatPercent(Math.abs(firstRate), 0)}) ne ramène pas au départ : essaie.
          </p>
        )}
      </div>
    </div>
  );
}
