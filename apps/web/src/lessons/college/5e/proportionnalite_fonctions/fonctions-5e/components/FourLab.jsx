import React from 'react';
import { fr } from './fonctionsUtils';

/**
 * FourLab — la manipulation SIGNATURE de la leçon (INTERACTION_PEDAGOGY §6bis).
 *
 * Activity               régler UNE molette — la durée de cuisson — et voir
 *                        TROIS grandeurs réagir en même temps.
 * Mathematical objective une grandeur d'entrée en détermine d'autres ; et une
 *                        même entrée redonne toujours exactement la même
 *                        sortie.
 * Student action         tourner la molette de durée ; revenir à une durée
 *                        déjà essayée.
 * Controlled variable    la durée, et elle seule. Les trois sorties sont
 *                        calculées par leurs règles.
 * Mathematical state     un entier t ∈ [0, 25] ; tout le reste en découle.
 * Visual consequence     la miche change de teinte, et les trois lectures se
 *                        réécrivent à l'instant, sans clic de validation.
 * Expected observation   « je remets 12 minutes et je retrouve exactement le
 *                        même pain » ; « la masse DESCEND quand la durée
 *                        monte — ça dépend quand même ».
 * Misconception targeted croire que « dépendre » veut dire « augmenter
 *                        ensemble », et croire qu'une dépendance doit être
 *                        proportionnelle.
 *
 * PÉRIMÈTRE : ni f(x), ni « image », ni « antécédent ». On dit « je règle »
 * et « j'obtiens ».
 *
 * SÉCURITÉ VISUELLE (§6ter.5) : les trois lectures sont des lignes DOM d'une
 * grille — une colonne pour le nom, une pour la barre, une pour le nombre.
 * Aucun texte SVG, donc aucun chevauchement possible ; la barre est un
 * pourcentage d'une piste dont l'échelle couvre toute la plage atteignable.
 */

/** La miche : sa teinte est calculée à partir de la couleur (0 → 10). */
function Miche({ couleur }) {
  const t = Math.max(0, Math.min(1, couleur / 10));
  // Du beige pâle au brun doré — une interpolation, jamais une liste d'images.
  const r = Math.round(240 - 100 * t);
  const g = Math.round(222 - 130 * t);
  const b = Math.round(179 - 140 * t);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="rounded-[50%] border-2 border-amber-900/30 transition-colors duration-200"
        style={{
          width: '108px',
          height: '62px',
          backgroundColor: `rgb(${r}, ${g}, ${b})`,
          boxShadow: 'inset 0 -6px 10px rgba(0,0,0,0.12)',
        }}
        role="img"
        aria-label={`Pain dont la croûte est dorée à ${fr(couleur)} sur 10`}
      />
      <span className="text-xs text-slate-500">le pain</span>
    </div>
  );
}

/** Une lecture : nom, barre, valeur — trois colonnes qui ne se recouvrent pas. */
function Readout({ q, t, range }) {
  const v = q.at(t);
  const span = range.max - range.min || 1;
  const pct = Math.max(0, Math.min(100, ((v - range.min) / span) * 100));
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5">
      <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
        <span aria-hidden="true">{q.emoji}</span> {q.label}
      </span>
      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className="font-mono text-sm font-black tabular-nums text-slate-800 text-right whitespace-nowrap"
        style={{ minWidth: '4.5rem' }}
      >
        {fr(v, q.decimals)} {q.unit}
      </span>
    </div>
  );
}

/**
 * @param {object[]} quantities les grandeurs qui réagissent
 * @param {number}   t          la durée réglée
 * @param {(t:number)=>void} onT
 * @param {object}   durees     { min, max, step }
 * @param {number[]} tried      les durées déjà essayées (pour le rappel)
 */
export default function FourLab({ quantities, t, onT, durees, tried = [], children }) {
  // L'échelle de chaque piste couvre TOUTE la plage atteignable : une barre ne
  // peut donc jamais sortir de son cadre, quelle que soit la durée.
  const rangeOf = (q) => {
    const vals = [];
    for (let x = durees.min; x <= durees.max; x += durees.step) vals.push(q.at(x));
    return { min: Math.min(...vals), max: Math.max(...vals) };
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Miche couleur={quantities.find((q) => q.id === 'couleur')?.at(t) ?? 0} />
          <div className="flex-1 min-w-[180px] space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor="four-t" className="text-sm font-bold text-amber-900">
                Durée de cuisson
              </label>
              <span className="font-mono text-2xl font-black tabular-nums text-amber-700">
                {t} min
              </span>
            </div>
            <input
              id="four-t"
              type="range"
              min={durees.min}
              max={durees.max}
              step={durees.step}
              value={t}
              onChange={(e) => onT(Number(e.target.value))}
              className="w-full accent-amber-600 h-6 cursor-pointer"
              aria-label="Durée de cuisson en minutes"
            />
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>{durees.min}</span>
              <span>{durees.max} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Les trois sorties, sous la même commande. */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 space-y-3">
        {quantities.map((q) => (
          <Readout key={q.id} q={q} t={t} range={rangeOf(q)} />
        ))}
      </div>

      {tried.length > 0 && (
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-xs font-semibold text-slate-500">Durées déjà essayées : </span>
          <span className="font-mono text-xs font-bold text-slate-700">
            {tried.slice().sort((a, b) => a - b).join(' · ')} min
          </span>
        </div>
      )}

      {children}
    </div>
  );
}
