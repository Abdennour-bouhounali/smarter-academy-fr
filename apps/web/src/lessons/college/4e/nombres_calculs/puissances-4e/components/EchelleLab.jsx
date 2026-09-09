import React from 'react';
import { valeurExacte, decimalDeDix } from './puissances4e';

/**
 * EchelleLab — LA manipulation signature de « Puissances » (4e).
 *
 * Activity              descendre l'échelle des puissances d'un cran à la
 *                       fois, en choisissant à chaque barreau la valeur qui
 *                       vient — y compris SOUS l'exposant 0.
 * Mathematical objective l'exposant négatif n'est pas une convention : c'est
 *                       la seule façon de continuer une descente où l'on
 *                       DIVISE par la base à chaque cran. 10^0 = 1 puis
 *                       10^-1 = 0,1 s'imposent, ils ne se décrètent pas.
 * Student action        choisir la valeur du barreau suivant parmi trois.
 * Controlled variable   un barreau à la fois, celui du bas.
 * Mathematical state    l'exposant atteint — détenu par le MODULE.
 * Visual consequence    la colonne « ÷ base » à droite reste verte tant que
 *                       le rapport avec le barreau du dessus vaut bien la
 *                       base ; elle passe au rouge sinon.
 * Expected observation  « d'un cran à l'autre je divise toujours par 10 ; ça
 *                       ne s'arrête pas à 1, donc après 1 vient 0,1 ».
 * Misconception targeted « 10^-2 est un nombre négatif ». Ici la colonne ne
 *                       cesse jamais d'être positive : elle rapetisse, elle
 *                       ne change pas de côté.
 * Formalization         AUCUNE ici : le mot « exposant négatif » et la règle
 *                       a^-n = 1/a^n sont posés au module suivant.
 *
 * C'est une échelle et non une table (la leçon voisine « Opérations sur les
 * nombres relatifs » utilise déjà une colonne de table de multiplication) :
 * ici l'invariant est un RAPPORT constant, pas un écart constant — la
 * différence est mathématique, pas cosmétique.
 *
 * SÉCURITÉ VISUELLE (§17bis) : rien n'est dessiné en SVG. L'échelle est un
 * vrai <table> ; valeurs, écritures décimales et choix vivent dans le DOM,
 * se replient à 375 px et ne peuvent ni se chevaucher ni sortir d'un cadre.
 */

/** L'écriture d'une valeur exacte : « 1000 » ou « 1/100 ». */
const ecrire = (base, exp) => {
  const v = valeurExacte(base, exp);
  if (v.d === 1) return String(v.n);
  return `1/${v.d}`;
};

export default function EchelleLab({
  base = 10,
  expMax = 3,
  expMin = -2,
  atteint,               // exposant le plus bas révélé — l'état, détenu par le module
  choix = [],            // valeurs proposées (chaînes) pour le barreau courant
  onChoisir,             // (valeur) => void
  erreur = null,         // valeur fautive à signaler, ou null
  montrerDecimal = true, // la 3e colonne : l'écriture décimale
  disabled = false,
}) {
  const rows = [];
  for (let e = expMax; e >= expMin; e -= 1) rows.push(e);
  const expCourant = atteint - 1;

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] border-collapse text-sm">
          <caption className="sr-only">
            Échelle des puissances de {base}, à prolonger vers le bas
          </caption>
          <thead>
            <tr className="bg-slate-100">
              <th scope="col" className="p-2 text-left font-semibold text-slate-700">Puissance</th>
              <th scope="col" className="p-2 text-right font-semibold text-slate-700">Valeur</th>
              {montrerDecimal && (
                <th scope="col" className="p-2 text-right font-semibold text-slate-500">En décimal</th>
              )}
              <th scope="col" className="p-2 text-right font-semibold text-slate-500">Rapport</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => {
              const revele = e >= atteint;
              const courant = e === expCourant;
              const v = valeurExacte(base, e);
              const prev = valeurExacte(base, e + 1);
              const rapport = (prev.n / prev.d) / (v.n / v.d);
              const rapportOk = Math.abs(rapport - base) < 1e-9;
              return (
                <tr
                  key={e}
                  className={[
                    'border-t border-slate-200',
                    courant ? 'bg-amber-50' : '',
                    e < 0 && revele ? 'bg-indigo-50/40' : '',
                  ].join(' ')}
                >
                  <th scope="row" className="whitespace-nowrap p-2 text-left font-medium tabular-nums text-slate-700">
                    {base}
                    <sup className={e < 0 ? 'font-bold text-indigo-700' : ''}>
                      {e < 0 ? `−${-e}` : e}
                    </sup>
                  </th>
                  <td className="p-2 text-right font-bold tabular-nums">
                    {revele ? (
                      <span className={e < 0 ? 'text-indigo-700' : 'text-slate-800'}>
                        {ecrire(base, e)}
                      </span>
                    ) : courant ? (
                      <span className="font-black text-amber-600" aria-label="valeur à trouver">?</span>
                    ) : (
                      <span className="text-slate-300" aria-hidden="true">·</span>
                    )}
                  </td>
                  {montrerDecimal && (
                    <td className="p-2 text-right font-mono text-xs tabular-nums text-slate-500">
                      {revele && base === 10 ? decimalDeDix(e) : null}
                    </td>
                  )}
                  <td className="p-2 text-right text-xs tabular-nums text-slate-500">
                    {revele && e < expMax ? (
                      <span className={rapportOk ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                        ÷ {base}
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {expCourant >= expMin && !disabled && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-slate-700">
            Quelle valeur continue l’échelle pour{' '}
            <strong className="tabular-nums">
              {base}
              <sup>{expCourant < 0 ? `−${-expCourant}` : expCourant}</sup>
            </strong>{' '}
            ?
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choisir la valeur suivante">
            {choix.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChoisir?.(c)}
                className={[
                  'min-h-[44px] min-w-[72px] rounded-xl border-2 px-3 text-base font-bold tabular-nums',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                  erreur === c
                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400',
                ].join(' ')}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
