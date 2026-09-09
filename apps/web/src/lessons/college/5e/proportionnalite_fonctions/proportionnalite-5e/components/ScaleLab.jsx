import React from 'react';
import { fr } from './propUtils';

/**
 * ScaleLab — la manipulation du module 4 : la règle sur la carte.
 *
 * Activity               glisser une règle sur un plan et lire, en direct, la
 *                        distance réelle qu'elle représente.
 * Mathematical objective une échelle est un coefficient de proportionnalité
 *                        qu'on ne cherche pas : il est écrit sur la carte.
 * Student action         régler la longueur mesurée sur la carte (en cm).
 * Controlled variable    la longueur sur la carte. L'échelle est fixe — c'est
 *                        ce qui la distingue d'un coefficient à trouver.
 * Visual consequence     le segment s'allonge sur le plan, et les deux
 *                        lectures (cm sur la carte, distance réelle) se
 *                        réécrivent ensemble.
 * Expected observation   « la distance réelle suit exactement, et le rapport
 *                        entre les deux ne change jamais ».
 *
 * SÉCURITÉ VISUELLE : le segment vit dans une piste DOM dont la largeur est un
 * pourcentage ; les nombres sont dans des colonnes séparées. Aucun texte SVG,
 * donc aucun chevauchement possible quel que soit le nombre de chiffres.
 * L'échelle de la piste est fixée par `maxCm`, la plus grande longueur
 * atteignable : le segment ne peut jamais déborder.
 */
export default function ScaleLab({ scale, cm, onCm, maxCm = 10, unit = 'km', convert }) {
  const real = scale.toReal(cm);          // en centimètres réels
  const shown = convert(real);            // dans l'unité lisible
  const pct = Math.max(0, Math.min(100, (cm / maxCm) * 100));

  return (
    <div className="space-y-3">
      {/* La carte — un fond neutre, et le segment mesuré par-dessus. */}
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3.5 space-y-3">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <span className="text-sm font-bold text-emerald-900">
            <span aria-hidden="true">🗺️</span> Carte du parc — échelle{' '}
            <span className="font-mono">{scale.label}</span>
          </span>
        </div>

        <div className="rounded-xl bg-white border-2 border-emerald-200 p-3 space-y-2">
          {/* La piste : le segment ne peut pas sortir de son cadre. */}
          <div className="h-8 rounded-lg bg-slate-100 relative overflow-hidden">
            <div
              className="h-full bg-emerald-500/80 transition-[width] duration-200 flex items-center justify-end pr-2"
              style={{ width: `${pct}%` }}
            >
              <span className="text-[13px] font-bold text-white tabular-nums whitespace-nowrap">
                {fr(cm)} cm
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>0</span>
            <span>{fr(maxCm)} cm sur la carte</span>
          </div>
        </div>

        <div>
          <label htmlFor="scale-cm" className="text-sm font-bold text-emerald-900">
            Longueur mesurée sur la carte
          </label>
          <input
            id="scale-cm"
            type="range"
            min={1}
            max={maxCm}
            step={0.5}
            value={cm}
            onChange={(e) => onCm(Number(e.target.value))}
            className="w-full accent-emerald-600 h-6 cursor-pointer mt-1"
            aria-label="Longueur mesurée sur la carte, en centimètres"
          />
        </div>
      </div>

      {/* Les deux lectures, côte à côte : la carte et le terrain. */}
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-center space-y-0.5">
          <div className="text-xs font-semibold text-slate-500">Sur la carte</div>
          <div className="font-mono text-lg font-black tabular-nums text-slate-800">
            {fr(cm)} cm
          </div>
        </div>
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2.5 text-center space-y-0.5">
          <div className="text-xs font-semibold text-slate-500">En vrai, sur le terrain</div>
          <div className="font-mono text-lg font-black tabular-nums text-emerald-700">
            {fr(shown)} {unit}
          </div>
        </div>
      </div>
    </div>
  );
}
