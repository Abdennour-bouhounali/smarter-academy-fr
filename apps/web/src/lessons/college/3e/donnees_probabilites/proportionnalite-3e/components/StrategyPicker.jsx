import React from 'react';
import CalcChain from '../../../../../common/components/CalcChain';
import { formatDec } from './propUtils';

/**
 * StrategyPicker — les chemins vers la case vide, à choisir puis à dérouler.
 *
 * Activity            toucher un chemin (unité, facteur, coefficient, produit
 *                     en croix) : ses étapes se déroulent en chaîne de calcul.
 * Mathematical objective  faire constater que TOUS les chemins mènent au même
 *                     nombre — et que le plus court dépend des nombres du
 *                     tableau (un facteur ×3 est imbattable ; sans facteur
 *                     lisible, l'unité ou le coefficient prennent le relais).
 * Student action      toucher un ou plusieurs chemins.
 * Mathematical state  `strategies` viennent de `strategiesFor` (propUtils) :
 *                     chaque résultat est calculé, jamais écrit ; `chosen`
 *                     (Set d'ids) appartient au module.
 * Visual consequence  la chaîne de calcul apparaît sous le chemin choisi ; les
 *                     résultats identiques s'alignent.
 * Expected observation « quatre chemins, une seule case ».
 */
const ICON = { unite: '1️⃣', facteur: '➡️', coefficient: '⬇️', croix: '✖️' };

export default function StrategyPicker({ strategies, chosen, onChoose, yUnit = '', disabled = false }) {
  return (
    <div className="space-y-3" role="group" aria-label="Chemins de calcul">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {strategies.map((s) => {
          const on = chosen.has(s.id);
          return (
            <button key={s.id} type="button" disabled={disabled || on} onClick={() => onChoose?.(s.id)} aria-pressed={on}
              aria-label={`Chemin : ${s.label}`}
              className={`min-h-[48px] px-3 py-2 rounded-xl border-2 text-sm font-semibold text-left transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-80
                ${on ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-500'}`}
              style={{ touchAction: 'manipulation' }}>
              <span aria-hidden="true" className="mr-2">{ICON[s.id] ?? '•'}</span>{s.label}
            </button>
          );
        })}
      </div>
      {strategies.filter((s) => chosen.has(s.id)).map((s) => (
        <div key={s.id} className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
          <p className="text-xs font-mono font-bold uppercase tracking-wide text-emerald-800">{s.label}</p>
          <CalcChain steps={s.steps.map((st, i) => ({
            label: i === s.steps.length - 1 ? 'résultat' : `étape ${i + 1}`,
            expr: i === s.steps.length - 1 ? st : null,
            value: i === s.steps.length - 1 ? `${formatDec(s.result)}${yUnit ? ` ${yUnit}` : ''}` : st,
          }))} />
        </div>
      ))}
    </div>
  );
}
