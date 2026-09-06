import React from 'react';
import MathText from '../../../../../common/components/MathText';

/**
 * ErrorSpotter — juger une COPIE, pas un résultat.
 *
 * Activity: on montre le travail d'un élève, ligne par ligne. Une seule est
 *   fautive. L'élève tape la ligne qu'il accuse, puis choisit la réparation.
 * Mathematical objective: savoir REFAIRE un calcul ne suffit pas ; savoir où
 *   un calcul dérape est une compétence distincte, et c'est celle que les
 *   contrôles sanctionnent (INTERACTION_PEDAGOGY §12, « l'erreur objet d'étude »).
 * Student action: taper une ligne, puis une réparation.
 * Controlled variable: la ligne accusée — l'état appartient au module.
 * Visual consequence: la ligne tapée porte immédiatement son verdict ET sa
 *   raison ; une ligne juste n'est pas « fausse », elle est expliquée.
 * Feedback: `reasonFor(id)` est fourni par le module, donc dérivé des mêmes
 *   nombres que l'énoncé — la correction ne peut pas diverger de la copie.
 * Scaffolding: rien ne bloque. Une accusation fausse laisse ré-essayer, et la
 *   phase de réparation ne s'ouvre qu'une fois la faute localisée — on ne
 *   répare pas ce qu'on n'a pas identifié.
 *
 * Composant CONTRÔLÉ et MUET : il n'invente aucun texte mathématique.
 *
 * @param {string} title
 * @param {{id:string, latex?:string, text?:React.ReactNode, note?:string}[]} lines
 * @param {string} faultyId                  la ligne réellement fautive
 * @param {string[]} tapped                  ids déjà tapés
 * @param {(id:string, ok:boolean)=>void} onTap
 * @param {(id:string)=>React.ReactNode} reasonFor  pourquoi cette ligne va (ou non)
 * @param {{id:string, latex?:string, label?:React.ReactNode}[]} [repairs]
 * @param {string} [repairId]                la bonne réparation
 * @param {string|null} [repairPicked]
 * @param {(id:string, ok:boolean)=>void} [onRepair]
 * @param {React.ReactNode} [repairPrompt]
 */
export default function ErrorSpotter({
  title = 'Une copie à corriger',
  lines,
  faultyId,
  tapped = [],
  onTap,
  reasonFor,
  repairs = null,
  repairId = null,
  repairPicked = null,
  onRepair = null,
  repairPrompt = 'Comment fallait-il faire ?',
}) {
  const found = tapped.includes(faultyId);
  const last = tapped[tapped.length - 1];

  return (
    <div className="space-y-3" data-error-spotter={faultyId}>
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-700">🔍 {title}</p>

        <div className="flex flex-col gap-1.5">
          {lines.map((l) => {
            const isTapped = tapped.includes(l.id);
            const isFaulty = l.id === faultyId;
            const tone = !isTapped
              ? 'border-slate-200 bg-white hover:border-amber-400'
              : isFaulty
                ? 'border-rose-400 bg-rose-50'
                : 'border-emerald-300 bg-emerald-50';
            return (
              <button
                key={l.id}
                type="button"
                data-spot-line={l.id}
                aria-pressed={isTapped}
                disabled={found && !isTapped}
                onClick={() => onTap(l.id, isFaulty)}
                className={`w-full text-left min-h-[44px] px-3 py-2 rounded-xl border-2 transition-colors flex items-center gap-3 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${tone}`}
              >
                <span className="text-slate-800 flex-1">
                  {l.latex ? <MathText>{`$${l.latex}$`}</MathText> : l.text}
                </span>
                {isTapped && (
                  <span className={`text-xs font-bold ${isFaulty ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {isFaulty ? '✗ la faute' : '✓ correcte'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {last && (
          <p className={`text-sm ${last === faultyId ? 'text-rose-800' : 'text-emerald-800'}`}>
            {reasonFor(last)}
          </p>
        )}
        {!last && (
          <p className="text-xs text-slate-500">Tape la ligne où le calcul dérape.</p>
        )}
      </div>

      {found && repairs && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
          <p className="text-sm font-semibold text-slate-700">{repairPrompt}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {repairs.map((r) => {
              const picked = repairPicked === r.id;
              const ok = r.id === repairId;
              const tone = !picked
                ? 'border-slate-300 bg-white hover:border-indigo-400'
                : ok
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                  : 'border-rose-400 bg-rose-50 text-rose-900';
              return (
                <button
                  key={r.id}
                  type="button"
                  data-spot-repair={r.id}
                  aria-pressed={picked}
                  disabled={repairPicked === repairId}
                  onClick={() => onRepair?.(r.id, ok)}
                  className={`min-h-[52px] px-3 py-2 rounded-xl border-2 text-sm font-bold transition-colors disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${tone}`}
                >
                  {r.latex ? <MathText>{`$${r.latex}$`}</MathText> : r.label}
                </button>
              );
            })}
          </div>
          {repairPicked && (
            <p className={`text-sm ${repairPicked === repairId ? 'text-emerald-800' : 'text-rose-800'}`}>
              {reasonFor(repairPicked)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
