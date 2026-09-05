import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { storyValues, formatDec } from './problemUtils';

/**
 * CheckStrip — vérifier DANS L'HISTOIRE, pas dans la dernière ligne.
 *
 * Activity: remettre la valeur trouvée dans chaque quantité de l'énoncé et
 *   regarder si la contrainte de l'histoire est respectée.
 * Mathematical objective: établir que vérifier, c'est recalculer les
 *   quantités du problème avec la valeur trouvée et retrouver la donnée de
 *   départ — pas réinjecter x dans l'avant-dernière ligne du calcul.
 * Student action: taper « Remettre x dans l'histoire ».
 * Controlled variable: la valeur x testée (fournie par le module).
 * Mathematical state: `storyValues(problem, choiceId, x)` — la valeur de
 *   CHAQUE quantité de l'énoncé, plus la vérification finale
 *   `target` vs la quantité `checkId`.
 * Visual consequence: chaque ligne de l'histoire prend sa valeur ; la ligne
 *   de contrôle s'allume en vert avec ✔ si elle retombe sur la donnée.
 * Expected observation: Tom 11, Léa 14 — dans 5 ans 16 et 19, dont la somme
 *   fait bien 35, la donnée de l'énoncé.
 * Misconception targeted: #5 — « 2x = 22, 2 × 11 = 22, c'est bon » : cette
 *   ligne-là vérifie le calcul, pas le problème.
 * Feedback: la ligne de contrôle porte le verdict ; le module commente.
 * Formalization: « vérifier, c'est remettre la valeur dans l'histoire ».
 * Scaffolding: un seul bouton ; les valeurs apparaissent d'un coup.
 * Transfer: reprise figée dans la synthèse du boss.
 *
 * Composant CONTRÔLÉ : `checked` et `onCheck` appartiennent au module.
 * Nœuds interactifs : 1 bouton.
 *
 * @param {object} problem      un problème de problemsData.js
 * @param {string} choiceId     la quantité nommée x
 * @param {number} x            la valeur trouvée
 * @param {string} checkId      l'id de la quantité à confronter à `target`
 * @param {number} target       la donnée de l'énoncé
 * @param {boolean} checked @param {()=>void} onCheck
 * @param {boolean} [frozen]
 */
export default function CheckStrip({
  problem,
  choiceId,
  x,
  checkId,
  target,
  unit = '',
  checked = false,
  onCheck,
  frozen = false,
  disabled = false,
  label = 'Remettre la valeur dans l’histoire',
}) {
  const values = storyValues(problem, choiceId, x) || [];
  const control = values.find((v) => v.id === checkId);
  const ok = control ? control.value === target : false;
  const shown = checked || frozen;
  const u = unit ? ` ${unit}` : '';

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2.5" role="group" aria-label="Vérification dans l’histoire">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
          L’histoire recalculée avec {problem.variable || 'x'} = {formatDec(x)}
        </p>
        {shown && (
          <span className={`text-[11px] font-mono font-bold ${ok ? 'text-emerald-700' : 'text-rose-700'}`}>
            {ok ? 'la donnée de l’énoncé est retrouvée' : 'la donnée de l’énoncé n’est pas retrouvée'}
          </span>
        )}
      </div>

      <ul className="space-y-1">
        {values.map((v) => {
          const isControl = v.id === checkId;
          return (
            <li
              key={v.id}
              className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm ${
                shown && isControl
                  ? ok
                    ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-300'
                    : 'bg-rose-50 text-rose-900 ring-1 ring-rose-300'
                  : 'bg-slate-50 text-slate-700'
              }`}
            >
              <span className="font-medium">{v.label}</span>
              <span className="font-mono font-bold tabular-nums">
                {shown ? `${formatDec(v.value)}${u}` : '…'}
                {shown && isControl && (
                  <>
                    <span className="text-slate-400 mx-1" aria-hidden="true">vs</span>
                    <span>{formatDec(target)}{u}</span>
                    {ok && <CheckCircle2 className="inline w-4 h-4 ml-1 text-emerald-600" aria-hidden="true" />}
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {!shown && !frozen && (
        <button
          type="button"
          disabled={disabled}
          onClick={onCheck}
          className="w-full min-h-[48px] rounded-xl border-2 border-emerald-700 bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {label}
        </button>
      )}

      <p className="sr-only" aria-live="polite">
        {shown
          ? `${values.map((v) => `${v.label} : ${formatDec(v.value)}`).join(', ')}. Contrôle : ${
              ok ? 'la valeur retrouve la donnée de l’énoncé' : 'la valeur ne retrouve pas la donnée'
            }.`
          : 'Vérification pas encore lancée.'}
      </p>
    </div>
  );
}
