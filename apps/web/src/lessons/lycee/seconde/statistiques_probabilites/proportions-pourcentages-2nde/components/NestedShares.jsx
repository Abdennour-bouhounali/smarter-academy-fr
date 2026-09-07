import React from 'react';
import { formatPercent, nestedProportion } from '../../../../../common/stats';

/**
 * NestedShares — deux proportions EMBOÎTÉES, réglées séparément par deux
 * curseurs.
 *
 * Activité : l'élève glisse p₁ (la part) puis p₂ (la part DE cette part). La
 * barre du bas est dessinée à l'échelle de la barre du haut, si bien que le
 * sous-groupe est visiblement plus petit que chacun des deux groupes — ce
 * qui rend l'addition (« 60 + 25 = 85 ») immédiatement absurde à l'œil, avant
 * tout calcul.
 *
 * Le geste continu importe ici plus qu'ailleurs : en balayant p₂ de 0 à 100 %,
 * l'élève voit la barre bleue ne JAMAIS dépasser la barre violette. La borne
 * est visible, elle n'est pas énoncée.
 *
 * RÈGLE GÉNÉRALE DU PROJET : la manipulation ne se fige jamais après
 * validation de l'étape — l'exploration continue.
 */
export default function NestedShares({ total, outer, inner, onChange }) {
  const nOuter = Math.round(total * outer);
  const nInner = Math.round(nOuter * inner);
  const combined = nestedProportion(outer, inner);

  const W = 620;
  const H1 = 46;
  const H2 = 30;
  const xOf = (p) => p * W;

  const Slider = ({ id, label, value, onPick, accent, hint }) => (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
          {hint && <span className="block text-[13px] font-normal text-slate-400">{hint}</span>}
        </label>
        <span className="font-mono font-black text-lg tabular-nums text-slate-800">{formatPercent(value, 0)}</span>
      </div>
      <input id={id} type="range" min={0} max={100} step={5}
        value={Math.round(value * 100)}
        onChange={(e) => onPick(Number(e.target.value) / 100)}
        aria-label={label} aria-valuetext={formatPercent(value, 0)}
        className={`sa-slider ${accent}`} />
    </div>
  );

  return (
    <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <svg width="100%" viewBox={`0 0 ${W} ${H1 + H2 + 46}`} role="img"
        aria-label={`${total} élèves, dont ${nOuter} demi-pensionnaires, dont ${nInner} internes soit ${formatPercent(combined, 2)} du lycée`}
        className="select-none overflow-visible">
        <text x={0} y={11} fontSize="11" fontWeight="700" fill="#64748b">Les {total} élèves du lycée</text>
        <rect x={0} y={16} width={W} height={H1} fill="#e2e8f0" rx="6" />
        <rect x={0} y={16} width={xOf(outer)} height={H1} fill="#4f46e5" rx="6" />
        {xOf(outer) > 90 && (
          <text x={xOf(outer) / 2} y={16 + H1 / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">
            {nOuter} demi-pens.
          </text>
        )}
        {/* La barre du sous-groupe reste à l'échelle du TOUT : c'est ce qui
            rend l'emboîtement visible plutôt que raconté. */}
        <rect x={0} y={16 + H1 + 8} width={xOf(outer)} height={H2} fill="#4f46e5" opacity="0.22" rx="4" />
        <rect x={0} y={16 + H1 + 8} width={xOf(outer * inner)} height={H2} fill="#0ea5e9" rx="4" />
        {xOf(outer * inner) > 60 && (
          <text x={xOf(outer * inner) / 2} y={16 + H1 + 8 + H2 / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">
            {nInner}
          </text>
        )}
        <text x={Math.min(xOf(outer) + 8, W - 4)} y={16 + H1 + 8 + H2 / 2 + 4}
          textAnchor={xOf(outer) > W - 150 ? 'end' : 'start'} fontSize="11" fill="#64748b">
          ⌞ {formatPercent(inner, 0)} des {nOuter} demi-pensionnaires
        </text>
      </svg>

      <div className="space-y-3">
        <Slider id="ns-outer" label="Demi-pensionnaires (du lycée) :" value={outer}
          onPick={(p) => onChange(p, inner)} accent="accent-indigo-600" />
        <Slider id="ns-inner" label="Internes (parmi eux) :" value={inner}
          hint={`soit ${formatPercent(inner, 0)} des ${nOuter} demi-pensionnaires`}
          onPick={(p) => onChange(outer, p)} accent="accent-sky-600" />
      </div>

      <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3.5 space-y-1.5">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-500">Internes, rapportés au lycée entier</p>
        <p className="font-mono text-sm text-sky-900">
          {formatPercent(outer, 0)} × {formatPercent(inner, 0)} = <span className="text-lg font-black">{formatPercent(combined, 2)}</span>
          <span className="text-sky-500"> — soit {nInner} élèves sur {total}</span>
        </p>
        <p className="text-xs text-sky-700">
          Somme des deux pourcentages : {formatPercent(outer + inner, 0)} — un nombre qui ne correspond à aucun groupe de la barre.
        </p>
      </div>
    </div>
  );
}
