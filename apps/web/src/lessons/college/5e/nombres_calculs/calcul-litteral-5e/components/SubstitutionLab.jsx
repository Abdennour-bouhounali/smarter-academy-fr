import React from 'react';
import { valeur, ecrire, ecrireAvecFois } from './litteral';

/**
 * SubstitutionLab — la machine à remplacer la lettre.
 *
 * L'élève choisit une valeur pour la lettre, et voit la MÊME recette produire
 * un résultat différent à chaque fois. L'expression, elle, ne change jamais :
 * c'est précisément ce qui fait d'elle une recette valable pour tous les cas,
 * et de la lettre un simple emplacement.
 *
 * Expected observation : « l'expression reste la même, seul le nombre que je
 * mets à la place de la lettre change ».
 * Misconception targeted : croire que 3n avec n = 4 s'écrit « 34 » ; le
 * laboratoire montre l'étape intermédiaire « 3 × 4 » avant le résultat, ce qui
 * rend la concaténation visiblement absurde.
 *
 * Sécurité visuelle : trois lignes en flux, chacune dans sa cellule. Aucune
 * coordonnée, donc aucun chevauchement possible quelle que soit la valeur.
 */
export default function SubstitutionLab({
  e,                    // l'expression { a, b }
  n,                    // la valeur donnée à la lettre
  onN,
  valeurs = [0, 1, 2, 3, 5, 10],
  lettre = 'n',
  ariaLabel,
}) {
  const v = valeur(e, n);
  const partA = e.a === 1 ? `${n}` : `${e.a} × ${n}`;

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      {/* La recette — elle NE CHANGE JAMAIS. C'est le point. */}
      <div className="rounded-xl border-2 border-slate-300 bg-slate-50 px-3 py-2.5 text-center">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">La recette</div>
        <div className="font-mono text-2xl font-black text-slate-800">{ecrire(e, lettre)}</div>
      </div>

      {/* Le choix de la valeur — des puces de 44 px. */}
      <div className="space-y-1.5">
        <div className="text-xs uppercase tracking-wide text-slate-500 text-center">
          Je remplace {lettre} par…
        </div>
        <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label={ariaLabel || 'Choisir la valeur de la lettre'}>
          {valeurs.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onN?.(val)}
              aria-pressed={val === n}
              data-valeur={val}
              className={[
                'min-h-[44px] min-w-[48px] rounded-xl border-2 font-mono font-bold tabular-nums transition-colors',
                val === n
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400',
              ].join(' ')}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Les deux étapes du calcul, séparées : c'est l'étape du milieu qui
          empêche de lire « 3n avec n = 4 » comme « 34 ». */}
      <div className="space-y-1.5">
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-2 text-center">
          <div className="text-[11px] uppercase tracking-wide text-indigo-700">Je remplace</div>
          <div className="font-mono text-lg font-bold text-indigo-900" data-etape={partA}>
            {e.b === 0 ? partA : e.b > 0 ? `${partA} + ${e.b}` : `${partA} − ${Math.abs(e.b)}`}
          </div>
        </div>
        <div className="rounded-xl bg-emerald-50 border-2 border-emerald-300 px-3 py-2.5 text-center">
          <div className="text-[11px] uppercase tracking-wide text-emerald-700">Je calcule</div>
          <output
            className="font-mono text-3xl font-black text-emerald-800 tabular-nums"
            aria-live="polite"
            data-resultat={String(v)}
          >
            {v}
          </output>
        </div>
      </div>

      <p className="text-xs text-center text-slate-500">
        La recette <span className="font-mono font-bold">{ecrireAvecFois(e, lettre)}</span> ne change
        pas — seul le nombre mis à la place de {lettre} change.
      </p>
    </div>
  );
}
