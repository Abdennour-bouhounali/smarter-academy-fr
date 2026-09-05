import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { rewriteQuantities, formatLin, plainMath } from './problemUtils';

/**
 * UnknownPicker — « nomme une quantité x, et regarde les autres s'écrire ».
 *
 * Activity: choisir, parmi les quantités de l'histoire, celle qu'on appelle x.
 * Mathematical objective: faire du CHOIX de l'inconnue un geste visible, et
 *   montrer que plusieurs entrées sont valables — mais pas n'importe laquelle.
 * Student action: taper une carte « l'âge de Tom », « l'âge de Léa », « la
 *   somme de leurs âges ».
 * Controlled variable: `chosen` — l'id de la quantité nommée x.
 * Mathematical state: `rewriteQuantities(problem, chosen)` — la liste des
 *   écritures de TOUTES les quantités selon ce choix, ou `null` si le choix
 *   ne permet pas de réécrire le reste.
 * Visual consequence: chaque ligne se réécrit en direct (Léa = x + 3, la
 *   somme dans 5 ans = 2x + 13) ; un choix invalide grise toutes les lignes
 *   et affiche « impossible avec ce choix ».
 * Expected observation: choisir x, c'est choisir par où on entre ; les
 *   autres quantités s'écrivent alors toutes seules, avec x.
 * Misconception targeted: « x, c'est la réponse » — l'élève qui nomme x la
 *   quantité cherchée (« la somme ») ne peut plus écrire le reste.
 * Feedback: le composant AFFICHE l'impossibilité ; le module rend le
 *   Feedback qui la commente.
 * Formalization: « l'inconnue est une quantité dont les autres dépendent ».
 * Scaffolding: chaque carte reste tapable — on peut changer d'avis autant
 *   de fois qu'on veut tant que le module ne verrouille pas.
 * Transfer: le module 4 (Le Traducteur) part de ce choix ; le module 6
 *   remet la valeur trouvée dans ces mêmes écritures.
 *
 * Composant CONTRÔLÉ : `chosen` et `onChoose` appartiennent au module.
 * Nœuds interactifs : ≤ 3 cartes de choix.
 *
 * @param {object} problem      un problème de problemsData.js
 * @param {string|null} chosen
 * @param {(id:string)=>void} onChoose
 * @param {string} [variable='x']
 * @param {boolean} [disabled]
 */
export default function UnknownPicker({
  problem,
  chosen,
  onChoose,
  variable = 'x',
  disabled = false,
  hideIds = [],
}) {
  const rewrites = chosen ? rewriteQuantities(problem, chosen) : null;
  const invalid = !!chosen && !rewrites;
  const rows = problem.quantities.filter((q) => !hideIds.includes(q.id));

  return (
    <div className="space-y-3" role="group" aria-label="Choisir l’inconnue">
      <div className="space-y-1.5">
        <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
          J’appelle {variable}…
        </p>
        <div className="flex flex-wrap gap-1.5">
          {problem.choices.map((c) => {
            const picked = chosen === c.id;
            return (
              <button
                key={c.id}
                type="button"
                disabled={disabled}
                onClick={() => onChoose?.(c.id)}
                aria-pressed={picked}
                aria-label={`Appeler ${variable} ${c.label}`}
                className={`min-h-[44px] px-3 py-2 rounded-xl border-2 text-sm font-semibold text-left transition-colors disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  picked
                    ? 'border-violet-600 bg-violet-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-violet-400'
                }`}
              >
                {picked && (
                  <span className="font-mono mr-1" aria-hidden="true">
                    {variable} =
                  </span>
                )}
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Les quantités réécrites — la conséquence visible du choix */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Écriture de chaque quantité de l’histoire selon le choix de l’inconnue
          </caption>
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs">
              <th scope="col" className="px-3 py-2 text-left font-bold">Quantité de l’histoire</th>
              <th scope="col" className="px-3 py-2 text-right font-bold">S’écrit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => {
              const l = rewrites?.find((r) => r.id === q.id)?.lin ?? null;
              return (
                <tr key={q.id} className={`border-t border-slate-100 ${l ? '' : 'text-slate-400'}`}>
                  <th scope="row" className="px-3 py-2 text-left font-medium">{q.label}</th>
                  <td className="px-3 py-2 text-right font-mono">
                    {l ? (
                      <span className="text-violet-800 font-bold">
                        <MathText>{`$${formatLin(l, variable)}$`}</MathText>
                        <span className="sr-only">{plainMath(formatLin(l, variable))}</span>
                      </span>
                    ) : chosen ? (
                      <span className="text-rose-500 italic text-xs">impossible avec ce choix</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="sr-only" aria-live="polite">
        {invalid
          ? 'Avec ce choix, aucune autre quantité ne peut s’écrire.'
          : rewrites
          ? `Choix valide : ${rewrites.length} quantités réécrites.`
          : 'Aucun choix fait pour l’instant.'}
      </p>
    </div>
  );
}
