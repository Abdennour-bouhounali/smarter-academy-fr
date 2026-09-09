import React from 'react';
import { fr, produitsEnCroix, passageEntier } from './prop4e';

/**
 * CroixLab — le tableau à quatre cases, dont l'élève TIRE les diagonales.
 *
 * Activity              activer chacune des deux diagonales et comparer les
 *                       deux produits.
 * Mathematical objective dans un tableau proportionnel, les deux produits en
 *                       croix sont ÉGAUX ; c'est cette égalité qui donne la
 *                       case manquante quand aucun passage n'est entier.
 * Student action        toucher une diagonale (ou sa case) pour l'allumer.
 * Controlled variable   les valeurs du tableau, fixées par le module ; ce que
 *                       l'élève contrôle, c'est CE QU'IL REGARDE.
 * Mathematical state    (a, b, c, d) et les diagonales allumées.
 * Visual consequence    la diagonale se dessine, son produit s'affiche.
 * Expected observation  « les deux produits tombent sur le même nombre ».
 *
 * SÉCURITÉ VISUELLE : le tableau est du DOM (une vraie <table>), les
 * diagonales sont un SVG en surimpression avec `pointerEvents: none` — elles
 * ne peuvent jamais intercepter un clic ni recouvrir un nombre, quel que soit
 * le nombre de chiffres. Les produits vivent SOUS le tableau, dans leur
 * propre bloc.
 */
export default function CroixLab({
  a, b, c, d,
  labels = { colonnes: ['Affiches', 'Prix (€)'], lignes: ['Commande A', 'Commande B'] },
  inconnue = null,           // 'a' | 'b' | 'c' | 'd' | null
  diagonales = [],           // ['bleue', 'rouge']
  onDiagonale,
}) {
  const { gauche, droite } = produitsEnCroix(a, b, c, d);
  const cellules = { a, b, c, d };
  const affiche = (k) => (inconnue === k ? '?' : fr(cellules[k]));

  const actives = new Set(diagonales);

  return (
    <div className="space-y-3" role="group" aria-label="Tableau de proportionnalité et produits en croix">
      <div className="relative mx-auto max-w-[340px]">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr>
              <th className="w-1/3 pb-1 text-xs font-semibold text-slate-400" />
              <th className="pb-1 text-xs font-semibold text-slate-500">{labels.colonnes[0]}</th>
              <th className="pb-1 text-xs font-semibold text-slate-500">{labels.colonnes[1]}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="pr-2 text-right text-xs font-semibold text-slate-500">{labels.lignes[0]}</th>
              <td className="border-2 border-slate-200 bg-white px-2 py-3 font-mono text-lg font-bold tabular-nums text-slate-800">
                {affiche('a')}
              </td>
              <td className="border-2 border-slate-200 bg-white px-2 py-3 font-mono text-lg font-bold tabular-nums text-slate-800">
                {affiche('b')}
              </td>
            </tr>
            <tr>
              <th scope="row" className="pr-2 text-right text-xs font-semibold text-slate-500">{labels.lignes[1]}</th>
              <td className="border-2 border-slate-200 bg-white px-2 py-3 font-mono text-lg font-bold tabular-nums text-slate-800">
                {affiche('c')}
              </td>
              <td className={`border-2 px-2 py-3 font-mono text-lg font-bold tabular-nums ${
                inconnue === 'd' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-800'
              }`}>
                {affiche('d')}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Les diagonales : décor par-dessus, jamais cliquable (§ anti-pattern
            « SVG décoratif au-dessus des zones actives »). */}
        <svg viewBox="0 0 100 60" preserveAspectRatio="none"
             className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          {actives.has('bleue') && (
            <line x1="45" y1="18" x2="88" y2="50" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />
          )}
          {actives.has('rouge') && (
            <line x1="88" y1="18" x2="45" y2="50" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
          )}
        </svg>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => onDiagonale?.('bleue')}
          aria-pressed={actives.has('bleue')}
          className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors ${
            actives.has('bleue') ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-600'
          }`}
        >
          Diagonale bleue {actives.has('bleue') && inconnue == null && `: ${fr(a)} × ${fr(d)} = ${fr(gauche)}`}
        </button>
        <button
          type="button"
          onClick={() => onDiagonale?.('rouge')}
          aria-pressed={actives.has('rouge')}
          className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors ${
            actives.has('rouge') ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-slate-200 bg-white text-slate-600'
          }`}
        >
          Diagonale rouge {actives.has('rouge') && `: ${fr(b)} × ${fr(c)} = ${fr(droite)}`}
        </button>
      </div>

      {actives.size === 2 && inconnue == null && (
        <p className={`rounded-xl px-3 py-2 text-center text-sm font-semibold ${
          gauche === droite ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
        }`}>
          {gauche === droite
            ? `${fr(gauche)} et ${fr(droite)} : les deux produits sont égaux.`
            : `${fr(gauche)} et ${fr(droite)} : les deux produits sont différents.`}
        </p>
      )}

      {/* Le raccourci existe-t-il ? C'est ce qui justifie l'outil. */}
      {inconnue === 'd' && (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-center text-xs text-slate-600">
          {passageEntier(a, c)
            ? `Ici, on passe de ${fr(a)} à ${fr(c)} en multipliant par ${fr(c / a)} : le calcul se fait de tête.`
            : `Ici, on ne passe pas de ${fr(a)} à ${fr(c)} par un nombre entier. C’est là que la croix sert.`}
        </p>
      )}
    </div>
  );
}
