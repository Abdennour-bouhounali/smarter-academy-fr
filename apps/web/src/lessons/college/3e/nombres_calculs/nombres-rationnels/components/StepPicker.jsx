import React from 'react';
import MathText from '../../../../../common/components/MathText';

/**
 * StepPicker — le choix tap-first de la PROCHAINE opération autorisée.
 *
 * Activity: devant une expression à plusieurs opérations, taper la carte qui
 *   décrit l'étape à faire MAINTENANT.
 * Mathematical objective: les priorités ne sont pas un ordre de lecture mais
 *   un ordre d'EXÉCUTION — parenthèses, puis × et ÷, puis + et −.
 * Student action: taper une carte parmi les candidates.
 * Controlled variable: l'étape choisie.
 * Mathematical state: l'index de l'étape courante dans le scénario ; la
 *   chaîne de calcul (CalcChain, rendue par le module) en dérive.
 * Visual consequence: une carte correcte s'ajoute à la chaîne et la liste de
 *   candidates se renouvelle ; une carte prématurée reste en place, barrée,
 *   avec la raison.
 * Expected observation: on ne peut pas additionner tant que la multiplication
 *   n'est pas faite — l'expression le refuse.
 * Misconception targeted: « on calcule de gauche à droite » et « la parenthèse
 *   se traite en dernier ».
 * Feedback: chaque carte refusée porte SA raison (« il reste une
 *   multiplication à faire »), affichée sous la grille.
 * Formalization: « À retenir » — parenthèses, ×÷, +−, nommé après la partie.
 * Scaffolding: après 3 refus, le module propose de montrer la bonne carte.
 * Transfer: les mêmes cartes servent sur une expression du budget (module 7).
 *
 * @param {string} expression       LaTeX de l'expression en cours
 * @param {{id, label, latex?, why}[]} options  cartes candidates
 * @param {string} correctId
 * @param {string[]} rejected       ids déjà refusés (restent barrés)
 * @param {(id:string, ok:boolean)=>void} onPick
 * @param {boolean} [done=false]
 */
export default function StepPicker({
  expression,
  options,
  correctId,
  rejected = [],
  onPick,
  done = false,
  title = 'Quelle opération fait-on maintenant ?',
}) {
  const lastRejected = rejected.length ? options.find((o) => o.id === rejected[rejected.length - 1]) : null;

  return (
    <div className="space-y-3" role="group" aria-label="Choix de la prochaine étape">
      <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-4 text-center">
        <p className="text-[11px] font-mono uppercase tracking-wide text-blue-700 mb-1">Expression en cours</p>
        <MathText className="text-xl">{`$${expression}$`}</MathText>
      </div>

      <p className="text-sm font-semibold text-slate-700 text-center">{title}</p>

      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const isRejected = rejected.includes(o.id);
          const isRight = done && o.id === correctId;
          return (
            <button
              key={o.id}
              type="button"
              disabled={done || isRejected}
              onClick={() => onPick?.(o.id, o.id === correctId)}
              aria-label={o.label}
              className={`min-h-[56px] px-4 py-3 rounded-2xl border-2 text-left text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isRight
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : isRejected
                  ? 'border-rose-300 bg-rose-50 text-rose-500 line-through'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-blue-500'
              }`}
            >
              <span className="block">{o.label}</span>
              {o.latex && (
                <span className="block mt-1">
                  <MathText className="text-sm">{`$${o.latex}$`}</MathText>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!done && lastRejected && (
        <p className="text-center text-sm font-semibold text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl px-3 py-2">
          Pas encore : {lastRejected.why}
        </p>
      )}
    </div>
  );
}
