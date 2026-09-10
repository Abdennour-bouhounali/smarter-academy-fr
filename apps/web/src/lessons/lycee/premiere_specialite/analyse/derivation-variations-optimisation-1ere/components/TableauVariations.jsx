import React from 'react';
import { tableauDeSignes, tableauDeVariations, extremums, FLECHE, fr } from './variationsUtils';

/**
 * TableauVariations — le tableau que l'élève REMPLIT, puis qu'il lit.
 *
 * Activity               deux lignes alignées sur les mêmes colonnes : le
 *                        SIGNE de f′ au-dessus, les VARIATIONS de f en dessous.
 *                        Dans le mode `aRemplir`, l'élève choisit lui-même le
 *                        signe de chaque intervalle ; la ligne des flèches se
 *                        déduit alors de SES choix, pas de la vérité.
 * Mathematical objective la ligne du bas se DÉDUIT de la ligne du haut. Un
 *                        élève qui pose un signe faux voit une flèche fausse :
 *                        la conséquence est immédiate et visible.
 * Student action         appuyer sur « + » ou « − » pour chaque intervalle.
 * Mathematical state     { fn, choix } — tout le reste est dérivé de
 *                        `tableauDeSignes` et `tableauDeVariations`.
 * Misconception targeted « le tableau se lit sur la courbe » ; « chaque zéro
 *                        de f′ donne un extremum ».
 *
 * AUCUNE LIGNE N'EST ÉCRITE À LA MAIN : bornes, valeurs, flèches et extremums
 * viennent tous du modèle (components/variationsUtils.js), verrouillé par
 * variationsUtils.test.js. Un tableau écrit en dur serait une seconde source
 * de vérité, et rien ne garantirait qu'il dit la même chose que la figure.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ.
 */
const arrondi = (n) => Math.round(n * 1000) / 1000;

export default function TableauVariations({
  fn,
  aRemplir = false,
  choix = {},
  onChoisir,
  montrerValeurs = true,
  montrerExtremums = false,
  disabled = false,
}) {
  const { lignes } = tableauDeSignes(fn);
  const vrai = tableauDeVariations(fn);
  const ext = extremums(fn);

  // La ligne des flèches suit les CHOIX de l'élève quand il remplit, et la
  // vérité sinon. C'est ce qui rend l'erreur visible au lieu d'être corrigée
  // en silence.
  const signeAffiche = (i) => (aRemplir ? (choix[i] ?? null) : lignes[i].sign);

  const btn = (actif, ton) =>
    `w-11 h-11 rounded-lg border-2 text-lg font-black disabled:opacity-40 ` +
    `focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ` +
    (actif
      ? ton === 1
        ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
        : 'border-rose-500 bg-rose-100 text-rose-800'
      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50');

  return (
    <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white">
      <table className="w-full text-center text-sm">
        <caption className="sr-only">
          Tableau de variations de {fn.label} sur l’intervalle de {fr(fn.domain.xMin)} à {fr(fn.domain.xMax)}
        </caption>
        <tbody>
          <tr className="bg-slate-50 border-b-2 border-slate-200">
            <th scope="row" className="px-3 py-2 text-left font-bold text-slate-700 whitespace-nowrap">x</th>
            {vrai.bornes.map((b, i) => (
              <React.Fragment key={`x${b.x}`}>
                <td className="px-2 py-2 font-mono font-bold tabular-nums text-slate-900">{fr(b.x)}</td>
                {i < vrai.bornes.length - 1 && <td className="px-2 py-2" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </tr>

          <tr className="border-b-2 border-slate-200">
            <th scope="row" className="px-3 py-2 text-left font-bold text-slate-700 whitespace-nowrap">
              signe de {fn.name}′
            </th>
            {lignes.map((l, i) => (
              <React.Fragment key={`s${l.from}`}>
                <td className="px-2 py-2 font-mono text-slate-400">{i === 0 ? '' : '0'}</td>
                <td className="px-2 py-2">
                  {aRemplir ? (
                    <span className="inline-flex gap-1.5" role="group" aria-label={`Signe de la dérivée entre ${fr(l.from)} et ${fr(l.to)}`}>
                      <button type="button" className={btn(choix[i] === 1, 1)} disabled={disabled}
                        onClick={() => onChoisir?.(i, 1)} aria-pressed={choix[i] === 1}
                        aria-label={`positif entre ${fr(l.from)} et ${fr(l.to)}`}>+</button>
                      <button type="button" className={btn(choix[i] === -1, -1)} disabled={disabled}
                        onClick={() => onChoisir?.(i, -1)} aria-pressed={choix[i] === -1}
                        aria-label={`négatif entre ${fr(l.from)} et ${fr(l.to)}`}>−</button>
                    </span>
                  ) : (
                    <span className={`font-mono text-xl font-black ${l.sign > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {l.sign > 0 ? '+' : '−'}
                    </span>
                  )}
                </td>
              </React.Fragment>
            ))}
            <td className="px-2 py-2 font-mono text-slate-400" aria-hidden="true" />
          </tr>

          <tr>
            <th scope="row" className="px-3 py-2 text-left font-bold text-slate-700 whitespace-nowrap">
              variations de {fn.name}
            </th>
            {lignes.map((l, i) => {
              const s = signeAffiche(i);
              return (
                <React.Fragment key={`v${l.from}`}>
                  <td className="px-2 py-3 font-mono font-bold tabular-nums text-indigo-900">
                    {montrerValeurs ? fr(arrondi(fn.f(l.from))) : '—'}
                  </td>
                  <td className="px-2 py-3 text-2xl leading-none" aria-label={
                    s === 1 ? 'croissante' : s === -1 ? 'décroissante' : 'sens non encore choisi'
                  }>
                    {s === 1 ? FLECHE.croissante : s === -1 ? FLECHE.décroissante : <span className="text-slate-300">?</span>}
                  </td>
                </React.Fragment>
              );
            })}
            <td className="px-2 py-3 font-mono font-bold tabular-nums text-indigo-900">
              {montrerValeurs ? fr(arrondi(fn.f(fn.domain.xMax))) : '—'}
            </td>
          </tr>
        </tbody>
      </table>

      {montrerExtremums && (
        <div className="border-t-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {ext.length === 0 ? (
            <>Aucun retournement à l’intérieur de l’intervalle : la ligne du signe ne change jamais.</>
          ) : (
            <ul className="space-y-1">
              {ext.map((x) => (
                <li key={x.x}>
                  <strong>{x.kind === 'maximum' ? 'Un maximum' : 'Un minimum'}</strong> est atteint{' '}
                  <em>en</em> x = {fr(x.x)} ; sa <em>valeur</em> est {fn.name}({fr(x.x)}) ={' '}
                  <strong>{fr(arrondi(x.y))}</strong>.
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
