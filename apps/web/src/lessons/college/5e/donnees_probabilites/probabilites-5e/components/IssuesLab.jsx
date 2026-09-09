import React from 'react';
import { EXPERIENCES, EVENEMENTS_DE, issuesElementaires } from './probabilites';

/**
 * IssuesLab — cocher les issues.
 *
 * Deux usages, le même geste :
 *  · module 2 : cocher TOUTES les issues de l'expérience (les énumérer sans
 *    oubli ni doublon) ;
 *  · module 3 : cocher les issues qui RÉALISENT un événement donné — c'est
 *    littéralement la définition du programme, faite à la main.
 *
 * Le composant ne dit jamais « faux » : il rend la sélection courante et
 * laisse le module diagnostiquer (§23). Il expose seulement ce qui est coché.
 *
 * JAMAIS GELÉ : la sélection reste modifiable après validation.
 */
export default function IssuesLab({
  experience = 'de',
  selection,
  onSelection,
  intitule,
  ariaLabel,
}) {
  const exp = EXPERIENCES[experience];
  const issues = issuesElementaires(exp);

  const bascule = (id) => {
    const next = selection.includes(id)
      ? selection.filter((s) => s !== id)
      : [...selection, id];
    onSelection(next);
  };

  return (
    <div className="space-y-2" aria-label={ariaLabel ?? `Issues de : ${exp.nom}`}>
      {intitule && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-700">
          {intitule}
        </div>
      )}
      <div
        className="flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Résultats possibles"
      >
        {issues.map((issue) => {
          const actif = selection.includes(issue.id);
          return (
            <button
              key={issue.id}
              type="button"
              onClick={() => bascule(issue.id)}
              aria-pressed={actif}
              className={`grid h-14 w-14 place-items-center rounded-xl border-2 font-mono text-lg font-black tabular-nums transition active:scale-95 ${
                actif
                  ? 'border-amber-500 bg-amber-100 text-amber-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
              }`}
            >
              {exp.id === 'urne' ? (
                <span
                  className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                  style={{ background: { rouge: '#dc2626', bleu: '#2563eb', vert: '#16a34a' }[issue.label] }}
                >
                  <span className="sr-only">bille {issue.label}</span>
                </span>
              ) : (
                issue.label
              )}
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs text-slate-500">
        {selection.length === 0
          ? 'Aucune issue cochée pour l’instant.'
          : `${selection.length} issue${selection.length > 1 ? 's' : ''} cochée${selection.length > 1 ? 's' : ''} sur ${issues.length}.`}
      </p>
    </div>
  );
}

/** Les événements du dé, proposés au choix — utilisé par le module 3. */
export const EVENEMENTS_LISTE = Object.values(EVENEMENTS_DE);
