import React from 'react';
import MathText from '../../../../../common/components/MathText';
import CalcChain from '../../../../../common/components/CalcChain';
import { formatEquation, plainMath } from './problemUtils';

/**
 * SolutionStrip — organiser la résolution, une étape valable à la fois.
 *
 * Activity: choisir, parmi trois cartes, la prochaine étape qui garde
 *   l'équation équivalente ; la chaîne de résolution grandit d'une ligne.
 * Mathematical objective: établir qu'une résolution est une SUITE d'étapes
 *   dont chacune conserve les solutions — et qu'une opération d'un seul côté
 *   n'en est pas une.
 * Student action: taper une des trois cartes offertes.
 * Controlled variable: l'équation courante (le dernier maillon de la chaîne).
 * Mathematical state: `steps` — la liste des équations traversées ; les
 *   cartes valables viennent de `nextValidSteps(eq)` (module), les
 *   distracteurs sont des opérations à un seul côté.
 * Visual consequence: la carte choisie s'ajoute au CalcChain partagé, avec
 *   son libellé (« − 13 des deux côtés ») et la nouvelle équation ; un
 *   distracteur affiche la ligne cassée en rose sans l'ajouter à la chaîne.
 * Expected observation: on n'invente pas les étapes — on les choisit, et
 *   seules celles qui agissent des DEUX côtés font avancer.
 * Misconception targeted: « diviser 35 par 2 » (opérer sur un seul terme) et
 *   « retirer 13 à gauche seulement ».
 * Feedback: la ligne refusée reste visible avec sa raison ; le module rend
 *   le Feedback quantifié.
 * Formalization: « résoudre, c'est enchaîner des étapes équivalentes ».
 * Scaffolding: après 3 essais, le module révèle la suite complète.
 * Transfer: le boss e8 rejoue la première étape de 4x + 8 = 40.
 *
 * Composant CONTRÔLÉ : `steps`, `offered`, `rejected` appartiennent au
 * module. Nœuds interactifs : ≤ 3 cartes offertes.
 *
 * @param {{label, eq, valid?:boolean, why?:string}[]} steps  les étapes DÉJÀ retenues
 * @param {object} startEq  l'équation de départ
 * @param {{id, label, eq, valid, why}[]} offered  les trois cartes du tour
 * @param {(card)=>void} onPick
 * @param {{label, why}|null} [rejected]  la dernière carte refusée
 * @param {string} [variable='x']
 * @param {boolean} [frozen] @param {boolean} [disabled]
 */
export default function SolutionStrip({
  steps = [],
  startEq,
  offered = [],
  onPick,
  rejected = null,
  variable = 'x',
  frozen = false,
  disabled = false,
  startLabel = 'L’équation du problème',
}) {
  const chain = [
    { label: startLabel, value: plainMath(formatEquation(startEq, variable)), tone: 'indigo' },
    ...steps.map((s, i) => ({
      label: s.label,
      value: plainMath(formatEquation(s.eq, variable)),
      tone: i === steps.length - 1 ? 'emerald' : 'indigo',
    })),
  ];

  return (
    <div className="space-y-3" role="group" aria-label="Organiser la résolution">
      <CalcChain steps={chain} />

      {!frozen && offered.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Étape suivante — laquelle garde l’équilibre ?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5" role="group" aria-label="Étapes proposées">
            {offered.map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={disabled}
                onClick={() => onPick?.(c)}
                aria-label={`Étape : ${c.label}`}
                className="min-h-[52px] px-3 py-2 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-700 text-center hover:border-purple-500 hover:bg-purple-50 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {rejected && (
        <div className="rounded-xl border-2 border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          <span className="font-bold">« {rejected.label} »</span> — {rejected.why}
          {rejected.eq && (
            <span className="block font-mono text-xs mt-0.5">
              On obtiendrait <MathText>{`$${formatEquation(rejected.eq, variable)}$`}</MathText>, dont la
              solution n’est plus la même.
            </span>
          )}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        Chaîne actuelle : {chain.map((c) => `${c.label} : ${c.value}`).join(' ; ')}.
      </p>
    </div>
  );
}
