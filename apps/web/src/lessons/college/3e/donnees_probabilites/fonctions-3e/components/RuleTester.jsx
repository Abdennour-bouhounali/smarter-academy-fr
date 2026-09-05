import React from 'react';
import { formatDec } from '@smarter-academy/core';
import { imageOf } from './functionUtils';

/**
 * RuleTester — tester une hypothèse de règle sur les couples déjà obtenus.
 *
 * Activity            choisir une règle candidate ; la machine la REJOUE sur
 *                     chaque entrée déjà essayée et compare avec ce qu'elle
 *                     avait réellement donné.
 * Mathematical objective  une règle n'est pas « à peu près » : elle doit être
 *                     d'accord avec TOUS les couples. Une règle qui marche sur
 *                     une entrée et pas sur les autres n'est pas la règle.
 * Student action      toucher une pastille de règle ; en changer librement.
 * Controlled variable la règle candidate.
 * Mathematical state  { candidates, tested, selected } — les verdicts sont
 *                     CALCULÉS par `imageOf` sur chaque couple, jamais écrits
 *                     en dur : le tableau ne peut pas mentir.
 * Visual consequence  une ligne « ta règle donnerait » apparaît sous la ligne
 *                     « la machine a donné », colonne par colonne, avec ✓ / ✗.
 * Expected observation « une seule règle est d'accord partout — et une
 *                     mauvaise règle peut quand même tomber juste une fois ».
 * Misconception targeted  valider une règle sur un seul exemple.
 * Feedback            le décompte des accords, en clair, jamais un « faux ».
 * Formalization       aucune ici : le mot « fonction » attend le module 2.
 * Scaffolding         quatre candidates fermées (le module 6 fera retrouver
 *                     une règle sans candidates).
 * Transfer            la prédiction sur une entrée jamais essayée, juste après.
 *
 * SÉCURITÉ D'AFFICHAGE — tout vit dans le DOM (tableau à défilement
 * horizontal) : aucune étiquette SVG, donc aucun chevauchement possible quel
 * que soit le nombre ou la grandeur des couples.
 */
export default function RuleTester({
  candidates,          // [{ id, label, rule }]
  tested = [],         // [{ x, y }] — ce que la machine a réellement donné
  selected = null,     // id de la candidate en cours de test
  onSelect,            // (id) => void
  disabled = false,
}) {
  const cand = candidates.find((c) => c.id === selected) ?? null;
  const verdicts = cand ? tested.map((t) => ({ ...t, guess: imageOf(cand.rule, t.x) })) : [];
  const agree = verdicts.filter((v) => v.guess === v.y).length;
  const total = verdicts.length;
  const allAgree = total > 0 && agree === total;

  return (
    <div className="space-y-3" role="group" aria-label="Testeur de règle">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {candidates.map((c) => {
          const on = c.id === selected;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => !disabled && onSelect?.(c.id)}
              disabled={disabled}
              aria-pressed={on}
              className={`min-h-[44px] px-3 py-2 rounded-xl border-2 text-sm font-semibold text-left transition
                focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50
                ${on ? 'bg-indigo-600 border-indigo-600 text-white'
                     : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'}`}
              style={{ touchAction: 'manipulation' }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {cand && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Comparaison entre la machine et la règle testée</caption>
            <tbody>
              <tr>
                <th scope="row" className="text-left pr-2 font-semibold text-slate-600 whitespace-nowrap">Entrée</th>
                {verdicts.map((v) => (
                  <td key={`x${v.x}`} className="px-2 font-mono tabular-nums text-center">{formatDec(v.x)}</td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="text-left pr-2 font-semibold text-slate-600 whitespace-nowrap">La machine a donné</th>
                {verdicts.map((v) => (
                  <td key={`y${v.x}`} className="px-2 font-mono tabular-nums text-center text-emerald-700 font-bold">
                    {formatDec(v.y)}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-slate-200">
                <th scope="row" className="text-left pr-2 font-semibold text-indigo-700 whitespace-nowrap">Ta règle donnerait</th>
                {verdicts.map((v) => {
                  const ok = v.guess === v.y;
                  return (
                    <td
                      key={`g${v.x}`}
                      className={`px-2 font-mono tabular-nums text-center font-bold whitespace-nowrap ${ok ? 'text-emerald-700' : 'text-rose-700'}`}
                    >
                      {v.guess === null ? '—' : formatDec(v.guess)}{' '}
                      <span aria-hidden="true">{ok ? '✓' : '✗'}</span>
                      <span className="sr-only">{ok ? ', d’accord' : ', en désaccord'}</span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-slate-700" aria-live="polite">
        {!cand && <>Choisis une règle : la machine la rejoue sur tous tes couples.</>}
        {cand && allAgree && (
          <>
            « {cand.label} » est d’accord avec <strong>tous</strong> tes couples ({agree} sur {total}).
          </>
        )}
        {cand && !allAgree && (
          <>
            « {cand.label} » n’est d’accord qu’avec <strong>{agree}</strong> couple{agree > 1 ? 's' : ''} sur {total} :
            ce n’est pas elle. Une règle doit marcher pour <strong>toutes</strong> les entrées.
          </>
        )}
      </p>
    </div>
  );
}
