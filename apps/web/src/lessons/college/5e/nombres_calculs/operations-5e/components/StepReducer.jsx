import React from 'react';
import { fr, priority, traceEval, evalExpr } from './operations';

/**
 * StepReducer — l'élève CHOISIT quelle opération effectuer, une à la fois, et
 * l'expression se réécrit sous ses yeux, plus courte à chaque coup.
 *
 * Ce n'est pas une correction animée : c'est une manipulation. Choisir la
 * mauvaise opération n'est pas interdit — le laboratoire l'accepte, l'effectue,
 * et l'élève constate lui-même que le résultat final n'est plus le même. C'est
 * la façon dont ce module fait vivre la nécessité de l'ordre, plutôt que de
 * l'énoncer (INTERACTION_PEDAGOGY §12, « l'erreur comme manipulation »).
 *
 * Cause → effet : un tap sur un opérateur contracte les deux termes qui
 * l'entourent. Rien d'autre ne bouge.
 *
 * Sécurité visuelle : mise en page en flux, boutons de 44 px, retour à la
 * ligne autorisé. Aucune coordonnée calculée, donc aucun chevauchement
 * possible quel que soit le nombre de termes.
 */
export default function StepReducer({
  expr,                 // { nums, ops } — l'expression de départ
  state,                // { nums, ops, history } — l'état courant, porté par le module
  onState,
  attendu = null,       // valeur correcte, pour le verdict de fin
  ariaLabel,
}) {
  const { nums, ops, history } = state;
  const fini = ops.length === 0;
  const resultat = nums[0];

  /** Effectue l'opération d'indice i : les deux termes fusionnent. */
  const jouer = (i) => {
    if (fini) return;
    const a = nums[i];
    const b = nums[i + 1];
    const op = ops[i];
    const res =
      op === '+' ? Number((a + b).toFixed(10)) :
      op === '−' ? Number((a - b).toFixed(10)) :
      op === '×' ? Number((a * b).toFixed(10)) :
      Number((a / b).toFixed(10));
    onState?.({
      nums: [...nums.slice(0, i), res, ...nums.slice(i + 2)],
      ops: [...ops.slice(0, i), ...ops.slice(i + 1)],
      history: [...history, { a, op, b, res }],
    });
  };

  /** L'ordre attendu par la convention — pour nommer l'écart, pas pour bloquer. */
  const bonneEtape = () => {
    const t = traceEval({ nums, ops });
    return t.length ? t[0] : null;
  };
  const attendue = fini ? null : bonneEtape();

  const juste = attendu !== null && fini && resultat === attendu;

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      <div
        className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5"
        role="group"
        aria-label={ariaLabel || 'Calcul — touche une opération pour l’effectuer'}
      >
        {nums.map((n, i) => (
          <React.Fragment key={`n-${i}`}>
            <span className="min-h-[44px] px-2.5 flex items-center rounded-xl border-2 border-slate-200 bg-slate-50 font-mono text-xl sm:text-2xl font-black text-slate-800 tabular-nums">
              {fr(n)}
            </span>
            {i < ops.length && (
              <button
                type="button"
                onClick={() => jouer(i)}
                data-op={i}
                aria-label={`Effectuer ${fr(n)} ${ops[i]} ${fr(nums[i + 1])}`}
                className={[
                  'min-h-[44px] min-w-[44px] rounded-xl border-2 text-xl sm:text-2xl font-black transition-colors',
                  priority(ops[i]) === 2
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:border-indigo-500'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-500',
                ].join(' ')}
              >
                {ops[i]}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* L'historique : ce que l'élève a déjà fait, dans l'ordre. */}
      {history.length > 0 && (
        <ol className="space-y-1">
          {history.map((h, i) => (
            <li key={i} className="text-sm font-mono text-slate-600 text-center">
              <span className="text-slate-400">{i + 1}.</span> {fr(h.a)} {h.op} {fr(h.b)} = <strong className="text-slate-800">{fr(h.res)}</strong>
            </li>
          ))}
        </ol>
      )}

      {fini && (
        <div
          className={[
            'rounded-xl border-2 px-3 py-2.5 text-center',
            attendu === null ? 'border-slate-200 bg-slate-50'
              : juste ? 'border-emerald-300 bg-emerald-50' : 'border-orange-300 bg-orange-50',
          ].join(' ')}
        >
          <div className="text-xs uppercase tracking-wide text-slate-500">Tu obtiens</div>
          <output className="font-mono text-2xl font-black tabular-nums text-slate-800" data-result={String(resultat)}>
            {fr(resultat)}
          </output>
          {attendu !== null && !juste && (
            <p className="text-xs text-orange-800 mt-1">
              La convention donne <strong className="font-mono">{fr(attendu)}</strong>. Ton ordre
              n’était pas celui des priorités — recommence pour voir la différence.
            </p>
          )}
        </div>
      )}

      {!fini && attendue && (
        <p className="text-xs text-center text-slate-500">
          Touche l’opération que tu veux effectuer.
        </p>
      )}
    </div>
  );
}

/** État initial du réducteur, à partir d'une expression. */
export const initReducer = (expr) => ({ nums: [...expr.nums], ops: [...expr.ops], history: [] });

/** L'expression est-elle résolue selon la convention ? */
export const bonResultat = (expr) => evalExpr(expr, null);
