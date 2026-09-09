import React from 'react';
import { meilleurCarre, estCarreParfait } from './racines4e';

/**
 * CarreauxLab — LA manipulation signature de « Racine carrée » (4e).
 *
 * Activity              l'élève reçoit un TAS de carreaux unité et tente de
 *                       les ranger en un carré plein. Il ajoute ou retire des
 *                       carreaux jusqu'à ce que le rangement tombe juste.
 * Mathematical objective la racine carrée est l'opération inverse du carré :
 *                       connaissant l'AIRE (le nombre de carreaux), on cherche
 *                       le CÔTÉ. Et tous les nombres n'y arrivent pas — ceux
 *                       qui y arrivent sont exactement les carrés parfaits.
 * Student action        −/+ sur le nombre de carreaux, ou un tap sur un
 *                       nombre proposé.
 * Controlled variable   le nombre de carreaux, seul.
 * Mathematical state    `n` — détenu par le MODULE. Composant CONTRÔLÉ :
 *                       aucun état interne, donc rejouable et insensible aux
 *                       remontages.
 * Visual consequence    les carreaux se rangent d'eux-mêmes dans le plus
 *                       grand carré possible ; ceux qui RESTENT s'empilent à
 *                       côté, en rouge. Le carré devient vert quand il ne
 *                       reste rien.
 * Expected observation  « 49 tombe pile, 50 laisse un carreau tout seul » —
 *                       puis « entre 49 et 64, aucun nombre ne tombe pile ».
 * Misconception targeted « la racine, c'est la moitié » : 36 carreaux
 *                       donnent un carré de côté 6, jamais 18 ; le rangement
 *                       le montre avant qu'aucune règle ne soit écrite.
 *
 * POURQUOI DISCRET, ET NON CONTINU. La leçon de 3e (`racines-carrees-3e`)
 * fait redimensionner un carré CONTINU dont l'aire suit — un excellent
 * laboratoire, qui mène à l'irrationalité. La 4e, qui INTRODUIT la notion,
 * a besoin d'autre chose : des carreaux qu'on COMPTE. L'élève ne glisse pas
 * vers une aire cible, il constate qu'un nombre entier de carreaux forme un
 * carré ou ne le forme pas. Réutiliser l'interaction de 3e ici ferait deux
 * fois la même leçon (memory: cross_level_inspiration_6e_3e).
 *
 * SÉCURITÉ VISUELLE (§17bis). Le carré est une grille CSS dont le nombre de
 * colonnes vaut le côté ; le reste est une rangée en `flex-wrap`. Aucune
 * coordonnée n'est calculée, les carreaux se partagent la largeur — rien ne
 * peut déborder ni se chevaucher, quel que soit `n` dans la plage autorisée.
 */
export default function CarreauxLab({
  n,                       // le nombre de carreaux — l'état, détenu par le module
  onN,                     // (valeur) => void
  min = 1,
  max = 80,
  propositions = [],       // raccourcis proposés par le module
  disabled = false,
}) {
  const { cote, utilises, reste } = meilleurCarre(n);
  const parfait = estCarreParfait(n);

  return (
    <div className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
      <p className="text-center text-sm text-slate-600">
        <strong className="tabular-nums text-lg text-slate-800">{n}</strong> carreaux à ranger en
        carré
      </p>

      <div className="flex flex-wrap items-start justify-center gap-4">
        {/* Le carré plein — sa taille de grille EST le côté. */}
        <div className="space-y-1">
          <div
            className={`grid gap-[2px] rounded-lg border-2 p-1 ${
              parfait ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'
            }`}
            style={{ gridTemplateColumns: `repeat(${Math.max(cote, 1)}, 18px)` }}
            role="img"
            aria-label={`Carré de ${cote} carreaux de côté, soit ${utilises} carreaux.`}
          >
            {Array.from({ length: utilises }, (_, i) => (
              <span
                key={i}
                className={`h-[18px] w-[18px] rounded-[3px] ${parfait ? 'bg-emerald-500' : 'bg-indigo-400'}`}
              />
            ))}
            {utilises === 0 && <span className="h-[18px] w-[18px]" />}
          </div>
          <p className="text-center text-xs font-semibold text-slate-600 tabular-nums">
            {cote} × {cote} = {utilises}
          </p>
        </div>

        {/* Ce qui reste — le point de la manipulation. */}
        {reste > 0 && (
          <div className="space-y-1">
            <div className="flex max-w-[120px] flex-wrap gap-[2px] rounded-lg border-2 border-rose-300 bg-rose-50 p-1">
              {Array.from({ length: reste }, (_, i) => (
                <span key={i} className="h-[18px] w-[18px] rounded-[3px] bg-rose-400" />
              ))}
            </div>
            <p className="text-center text-xs font-semibold text-rose-600 tabular-nums">
              {reste} en trop
            </p>
          </div>
        )}
      </div>

      <p className={`text-center text-sm font-semibold ${parfait ? 'text-emerald-700' : 'text-slate-500'}`}>
        {parfait
          ? `Carré parfait : ${n} carreaux forment exactement un carré de côté ${cote}.`
          : `Impossible : il reste ${reste} carreau${reste > 1 ? 'x' : ''} sur le côté.`}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          aria-label="Un carreau de moins"
          disabled={disabled || n <= min}
          onClick={() => onN(n - 1)}
          className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          −
        </button>
        <span className="inline-flex min-h-[44px] min-w-[64px] items-center justify-center rounded-lg border-2 border-indigo-300 bg-indigo-50 text-xl font-black tabular-nums text-indigo-800">
          {n}
        </span>
        <button
          type="button"
          aria-label="Un carreau de plus"
          disabled={disabled || n >= max}
          onClick={() => onN(n + 1)}
          className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          +
        </button>
      </div>

      {propositions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-label="Nombres à essayer">
          <span className="text-xs text-slate-500">essaie :</span>
          {propositions.map((p) => (
            <button
              key={p}
              type="button"
              disabled={disabled}
              onClick={() => onN(p)}
              className="min-h-[36px] rounded-lg border-2 border-slate-300 bg-white px-2.5 text-sm font-bold tabular-nums text-slate-600 hover:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
