import React from 'react';
import { eur, pct, coefTexte, coefficientMultiplicateur, appliquerEvolution } from './prop4e';

/**
 * EvolutionLab — le prix qui monte et qui descend, et le coefficient qui suit.
 *
 * Activity              glisser un taux d'évolution et voir SIMULTANÉMENT le
 *                       prix d'arrivée, la barre, et le nombre par lequel on
 *                       a multiplié.
 * Mathematical objective une évolution en pourcentage est une
 *                       MULTIPLICATION : +20 % c'est ×1,2, −20 % c'est ×0,8.
 * Student action        glisser le taux ; le pas est de 1 point, assez fin
 *                       pour que la variation se VOIE plutôt que de sauter.
 * Controlled variable   le taux, et lui seul. Le prix de départ est fixé par
 *                       le module.
 * Mathematical state    (depart, taux). Le coefficient, le prix d'arrivée et
 *                       la longueur des barres en sont DÉRIVÉS.
 * Visual consequence    deux barres à la même échelle, l'écart hachuré entre
 *                       elles, et le coefficient réécrit à chaque cran.
 * Expected observation  « le coefficient passe au-dessous de 1 quand le prix
 *                       baisse » ; « ×1,2 puis ×0,8 ne revient pas au
 *                       départ ».
 *
 * SÉCURITÉ VISUELLE : pistes DOM, nombres dans leur propre colonne. L'échelle
 * contient le prix le plus élevé ATTEIGNABLE (taux maximal), donc aucune
 * barre ne peut sortir de son cadre, à aucun réglage.
 *
 * REJOUABLE : jamais de `disabled` lié à l'avancement.
 */
export default function EvolutionLab({
  depart,
  taux,
  onTaux,
  min = -0.5,
  max = 0.5,
  libelleDepart = 'Prix affiché',
  libelleArrivee = 'Nouveau prix',
}) {
  const k = coefficientMultiplicateur(taux);
  const arrivee = appliquerEvolution(depart, taux);
  // L'échelle contient le prix le plus cher atteignable : la barre ne peut
  // jamais déborder, quel que soit le réglage.
  const echelle = Math.max(depart, appliquerEvolution(depart, max)) || 1;
  const largeur = (v) => `${Math.max(0, Math.min(100, (v / echelle) * 100))}%`;
  const monte = arrivee > depart;
  const bouge = Math.abs(arrivee - depart) > 0.005;

  return (
    <div className="space-y-4" role="group" aria-label="Faire évoluer un prix d’un pourcentage">
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="evo-taux" className="text-sm font-bold text-slate-700">
            Évolution appliquée
          </label>
          <span className={`font-mono text-lg font-black tabular-nums ${
            monte ? 'text-rose-600' : bouge ? 'text-emerald-600' : 'text-slate-400'
          }`}>
            {pct(taux)}
          </span>
        </div>
        <input
          id="evo-taux"
          type="range"
          min={Math.round(min * 100)}
          max={Math.round(max * 100)}
          step={1}
          value={Math.round(taux * 100)}
          onChange={(e) => onTaux(Number(e.target.value) / 100)}
          className="sa-slider accent-indigo-600 w-full"
          role="slider"
          aria-valuemin={Math.round(min * 100)}
          aria-valuemax={Math.round(max * 100)}
          aria-valuenow={Math.round(taux * 100)}
          aria-valuetext={`${pct(taux)}, nouveau prix ${eur(arrivee)}`}
        />
        <div className="flex justify-between text-[11px] text-slate-400 -mt-1">
          <span>{pct(min, 0)}</span>
          <span>0 %</span>
          <span>{pct(max, 0)}</span>
        </div>
      </div>

      {/* Les deux barres, à la MÊME échelle : la comparaison est visuelle. */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs font-semibold text-slate-500">{libelleDepart}</span>
          <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-slate-400" style={{ width: largeur(depart) }} />
          </div>
          <span className="w-20 shrink-0 text-right font-mono text-sm font-bold tabular-nums text-slate-700">
            {eur(depart)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs font-semibold text-slate-500">{libelleArrivee}</span>
          <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-[width] duration-150 ${
                monte ? 'bg-rose-500' : bouge ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
              style={{ width: largeur(arrivee) }}
            />
          </div>
          <span className="w-20 shrink-0 text-right font-mono text-sm font-black tabular-nums text-slate-900">
            {eur(arrivee)}
          </span>
        </div>
      </div>

      {/* Le coefficient : la même évolution, dite comme une multiplication. */}
      <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
          On a multiplié par
        </p>
        <p className="font-mono text-3xl font-black tabular-nums text-indigo-900">{coefTexte(k)}</p>
        <p className="mt-1 text-xs text-indigo-700">
          {eur(depart)} × {coefTexte(k).slice(1)} = {eur(arrivee)}
        </p>
      </div>
    </div>
  );
}
