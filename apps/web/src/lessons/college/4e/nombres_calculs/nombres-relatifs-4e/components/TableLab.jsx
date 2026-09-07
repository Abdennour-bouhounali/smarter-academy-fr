import React from 'react';
import { fmt, multiplier } from './operations';

/**
 * TableLab — la manipulation SIGNATURE de la leçon (§6bis).
 *
 * Une COLONNE de table de multiplication que l'élève prolonge case par case
 * vers le bas. Le haut est déjà rempli (les produits qu'il connaît depuis la
 * 6e) ; à chaque case suivante il choisit la valeur, et la colonne affiche
 * l'écart avec la case précédente.
 *
 * Le phénomène : tant qu'on prolonge la régularité, l'écart reste CONSTANT.
 * Quand l'élève arrive sous le zéro, la seule valeur qui garde cet écart est
 * celle que donne la règle des signes — « − × − = + » n'est donc pas une
 * convention, mais la seule suite possible. C'est la découverte que le module
 * organise, et que la brique nomme ensuite.
 *
 * Sécurité visuelle (§17bis) : rien n'est dessiné en SVG. La table est un vrai
 * <table> ; les nombres, les écarts et les choix vivent dans le DOM, se
 * replient à 375 px et ne peuvent donc ni se chevaucher ni sortir d'un cadre.
 */
export default function TableLab({
  ligne,                 // la ligne de la table (ex. −3)
  kMax = 3,              // premier k affiché (en haut)
  kMin = -3,             // dernier k à atteindre (en bas)
  remplisJusqua,         // k jusqu'auquel les cases sont révélées (décroissant)
  choix = [],            // valeurs proposées pour la case courante
  onChoisir,             // (valeur) => void
  erreur = null,         // valeur fautive à signaler, ou null
  disabled = false,
}) {
  const rows = [];
  for (let k = kMax; k >= kMin; k -= 1) rows.push(k);

  const kCourant = remplisJusqua - 1;
  const pas = -ligne; // l'écart constant entre deux cases consécutives

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[280px]">
          <caption className="sr-only">
            Colonne de la table de multiplication de {fmt(ligne)}, à prolonger vers le bas
          </caption>
          <thead>
            <tr className="bg-slate-100">
              <th scope="col" className="p-2 text-left font-semibold text-slate-700">Calcul</th>
              <th scope="col" className="p-2 text-right font-semibold text-slate-700">Résultat</th>
              <th scope="col" className="p-2 text-right font-semibold text-slate-500">Écart</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((k) => {
              const revele = k >= remplisJusqua;
              const courant = k === kCourant;
              const val = multiplier(ligne, k);
              const prev = multiplier(ligne, k + 1);
              return (
                <tr
                  key={k}
                  className={[
                    'border-t border-slate-200',
                    courant ? 'bg-amber-50' : '',
                    k < 0 && revele ? 'bg-indigo-50/40' : '',
                  ].join(' ')}
                >
                  <th scope="row" className="p-2 text-left font-medium text-slate-700 tabular-nums whitespace-nowrap">
                    {fmt(ligne)} × {fmt(k)}
                  </th>
                  <td className="p-2 text-right tabular-nums font-bold">
                    {revele ? (
                      <span className={val < 0 ? 'text-rose-600' : val > 0 ? 'text-indigo-700' : 'text-slate-800'}>
                        {fmt(val)}
                      </span>
                    ) : courant ? (
                      <span className="text-amber-600 font-black" aria-label="case à compléter">?</span>
                    ) : (
                      <span className="text-slate-300" aria-hidden="true">·</span>
                    )}
                  </td>
                  <td className="p-2 text-right tabular-nums text-xs text-slate-500">
                    {revele && k < kMax ? (
                      <span className={val - prev === pas ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                        {val - prev > 0 ? '+' : ''}{fmt(val - prev)}
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {kCourant >= kMin && !disabled && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-slate-700">
            Quelle valeur continue la colonne pour{' '}
            <strong className="tabular-nums">{fmt(ligne)} × {fmt(kCourant)}</strong> ?
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choisir la valeur suivante">
            {choix.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChoisir?.(c)}
                className={[
                  'min-h-[44px] min-w-[64px] px-3 rounded-xl border-2 text-base font-bold tabular-nums',
                  erreur === c
                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400',
                ].join(' ')}
              >
                {fmt(c)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
