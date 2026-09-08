import React from 'react';
import { divise } from './operations';

/**
 * RectangleLab — un diviseur, c'est un côté possible.
 *
 * L'élève choisit une largeur et essaie de ranger `n` carreaux en un rectangle
 * plein. Quand ça tombe juste, le rectangle est complet ; sinon, la dernière
 * rangée reste trouée — et c'est le reste de la division, rendu visible.
 *
 * Expected observation : « il y a des largeurs qui marchent et d'autres non,
 * et celles qui marchent sont exactement les nombres par lesquels on peut
 * diviser ». Le mot « diviseur » n'arrive qu'après ce constat.
 *
 * Sécurité visuelle (§17bis) : la grille est un CSS grid dont la taille de
 * carreau est bornée ; elle passe à la ligne et se réduit sur mobile. Aucun
 * texte n'est posé sur le dessin — les libellés vivent au-dessus et au-dessous.
 */
const CASE = 22;   // taille d'un carreau, en px
const CASE_SM = 16;

export default function RectangleLab({
  n,                  // nombre de carreaux à ranger
  largeur,            // largeur essayée (état porté par le module)
  onLargeur,
  maxLargeur = 12,
  ariaLabel,
}) {
  const complet = divise(largeur, n);
  const lignes = Math.ceil(n / largeur);
  const cases = Array.from({ length: lignes * largeur }, (_, i) => i < n);

  return (
    <div
      className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3"
      aria-label={ariaLabel || `Ranger ${n} carreaux en rectangle`}
    >
      {/* Le choix de la largeur — des puces, pas un stepper : on essaie, on
          compare, on revient en arrière. Chacune fait 44 px de haut. */}
      <div className="space-y-1.5">
        <div className="text-xs uppercase tracking-wide text-slate-500 text-center">
          Largeur du rectangle
        </div>
        <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Choisir la largeur">
          {Array.from({ length: maxLargeur }, (_, i) => i + 1).map((L) => (
            <button
              key={L}
              type="button"
              onClick={() => onLargeur?.(L)}
              data-largeur={L}
              aria-pressed={L === largeur}
              className={[
                'min-h-[44px] min-w-[44px] rounded-xl border-2 font-mono font-bold tabular-nums transition-colors',
                L === largeur
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400',
              ].join(' ')}
            >
              {L}
            </button>
          ))}
        </div>
      </div>

      {/* Le rectangle. Overflow horizontal contenu dans SON propre conteneur. */}
      <div className="overflow-x-auto">
        <div
          className="grid gap-[2px] mx-auto w-max"
          style={{ gridTemplateColumns: `repeat(${largeur}, minmax(0, ${CASE}px))` }}
          role="img"
          aria-label={
            complet
              ? `Rectangle complet de ${largeur} sur ${n / largeur}`
              : `Rectangle incomplet : la dernière rangée n’est pas pleine`
          }
        >
          {cases.map((plein, i) => (
            <div
              key={i}
              className={[
                'rounded-[3px] aspect-square',
                plein
                  ? complet ? 'bg-emerald-500' : 'bg-indigo-400'
                  : 'bg-slate-100 border border-dashed border-slate-300',
              ].join(' ')}
              style={{ width: CASE, height: CASE, minWidth: CASE_SM }}
            />
          ))}
        </div>
      </div>

      {/* Le verdict, en flux sous le dessin. */}
      <div
        className={[
          'rounded-xl border-2 px-3 py-2.5 text-center text-sm',
          complet ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600',
        ].join(' ')}
        aria-live="polite"
        data-complet={complet ? '1' : '0'}
      >
        {complet ? (
          <>
            <strong className="font-mono">{largeur} × {n / largeur} = {n}</strong> — le rectangle est
            plein.
          </>
        ) : (
          <>
            Avec une largeur de <strong className="font-mono">{largeur}</strong>, il reste{' '}
            <strong className="font-mono">{n % largeur}</strong> carreau
            {n % largeur > 1 ? 'x' : ''} en trop : la dernière rangée n’est pas pleine.
          </>
        )}
      </div>
    </div>
  );
}
