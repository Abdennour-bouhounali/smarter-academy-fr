import React, { useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  fr, evalExpr, priority, writeExpr, rewriteSteps,
  labReduce, labPhase, labHint,
} from './operations';

/**
 * ExpressionLab — la manipulation SIGNATURE de la leçon (§6bis).
 *
 * L'élève DÉSIGNE un bloc dans un calcul écrit, et le calcul se réécrit sous
 * ses yeux jusqu'au total. Les nombres ne changent jamais ; seul change ce
 * qu'on calcule d'abord. C'est exactement l'idée que la leçon doit rendre
 * visible : un calcul n'est pas une phrase qu'on lit de gauche à droite, il a
 * une STRUCTURE, et les parenthèses la désignent.
 *
 * L'ÉTAT VIT DANS `operations.js` (`labReduce`), pas ici. Ce composant peint
 * un état et émet des gestes ; il n'en invente aucun. Une seule représentation
 * fait donc foi pour l'expression, la sélection en cours, le bloc commis et le
 * total — ils ne peuvent pas se contredire (§28), et la machine est balayée
 * exhaustivement par les tests unitaires plutôt que relue.
 *
 * TROIS PHASES, TROIS CONSIGNES — jamais deux à la fois (§8, divulgation
 * progressive) :
 *
 *   idle       « Touche un nombre pour commencer ton bloc. »
 *   selecting  « Touche maintenant le nombre où ton bloc s'arrête. »
 *   committed  « Tu viens de créer un bloc. » + la cascade de réécriture
 *
 * CE QUI EST GARANTI À L'ÉLÈVE, et vérifié par les tests :
 *  — un bloc obtenu ne disparaît JAMAIS tant qu'il n'en a pas posé un autre,
 *    ou touché l'un de ses nombres pour l'ouvrir (le bug corrigé : un tap sur
 *    un terme extérieur écrasait le bloc par une ouverture pendante) ;
 *  — la manipulation reste REJOUABLE indéfiniment — aucun `disabled` lié à la
 *    validation de l'étape (bug class relevée en 6e) ;
 *  — « Recommencer » est visible dès qu'il y a quelque chose à défaire : le
 *    retour à l'expression nue ne dépend pas d'un geste à deviner.
 *
 * Sécurité visuelle (§17bis) : tout est du DOM en flux — pas un seul <text>
 * SVG posé à des coordonnées calculées. Les termes sont des boutons de taille
 * tactile dans un conteneur qui passe à la ligne ; la cascade et le total
 * vivent en dessous. Aucune position n'est supposée : quel que soit le nombre
 * de termes, la longueur des nombres ou la largeur de l'écran, rien ne peut
 * chevaucher quoi que ce soit.
 *
 * @param {{nums: number[], ops: string[]}} expr  l'expression, jamais modifiée
 * @param {{anchor:number|null, paren:{from,to}|null}} state  l'état du labo
 * @param {(next) => void} onState                reçoit l'état SUIVANT
 * @param {boolean} [showResult=true]             afficher le total
 * @param {boolean} [showCascade=true]            afficher la réécriture pas à pas
 * @param {string} [resultLabel]                  libellé du bandeau de résultat
 */
export default function ExpressionLab({
  expr,
  state,
  onState,
  showResult = true,
  showCascade = true,
  resultLabel = 'Ce calcul vaut',
  ariaLabel,
}) {
  const { nums, ops } = expr;
  const { anchor, paren } = state;
  const phase = labPhase(state);
  const total = evalExpr(expr, paren);

  const dispatch = useCallback((action) => onState?.(labReduce(state, action)), [onState, state]);

  const inParen = (i) => paren && i >= paren.from && i <= paren.to;

  /**
   * La cascade de réécriture — le cœur de §13 : montrer la STRUCTURE, pas
   * seulement le total. `traceEval` donne l'ordre réel des opérations ; on le
   * rejoue en réécrivant l'expression entière à chaque étape, pour que l'élève
   * lise « (2 + 3) × 4 → 5 × 4 → 20 » et comprenne qu'il n'a pas changé les
   * nombres, seulement le morceau qui se calcule en premier.
   */
  const cascade = React.useMemo(() => rewriteSteps(expr, paren), [expr, paren]);

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      {/* ── L'expression manipulable ────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5"
        role="group"
        aria-label={ariaLabel || `Calcul ${writeExpr(expr, null)} — désigne un bloc à calculer en premier`}
      >
        {nums.map((n, i) => (
          <React.Fragment key={`t-${i}`}>
            {/* Les parenthèses sont des caractères à part, jamais superposés. */}
            {paren && i === paren.from && (
              <span className="text-2xl sm:text-3xl font-black text-amber-600" aria-hidden="true">(</span>
            )}
            <button
              type="button"
              onClick={() => dispatch({ type: 'tap', index: i })}
              data-term={i}
              data-selected={inParen(i) ? 'bloc' : anchor === i ? 'ancre' : 'non'}
              aria-pressed={inParen(i) || anchor === i}
              aria-label={
                inParen(i)
                  ? `Nombre ${fr(n)} — dans le bloc ; touche-le pour ouvrir le bloc`
                  : anchor === i
                  ? `Nombre ${fr(n)} — début de ton bloc ; touche-le à nouveau pour annuler`
                  : `Nombre ${fr(n)} — touche-le pour ${phase === 'selecting' ? 'fermer' : 'commencer'} un bloc`
              }
              className={[
                'min-h-[48px] min-w-[48px] px-2.5 sm:px-3 rounded-xl border-2 font-mono text-xl sm:text-2xl',
                'font-black tabular-nums transition-colors focus:outline-none focus-visible:ring-2',
                'focus-visible:ring-indigo-500 focus-visible:ring-offset-1',
                inParen(i)
                  ? 'border-amber-400 bg-amber-100 text-amber-900'
                  : anchor === i
                  ? 'border-indigo-500 border-dashed bg-indigo-50 text-indigo-800'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-400 active:bg-slate-50',
              ].join(' ')}
            >
              {fr(n)}
            </button>
            {paren && i === paren.to && (
              <span className="text-2xl sm:text-3xl font-black text-amber-600" aria-hidden="true">)</span>
            )}
            {i < ops.length && (
              <span
                className={[
                  'px-0.5 sm:px-1 text-xl sm:text-2xl font-black select-none',
                  priority(ops[i]) === 2 ? 'text-indigo-600' : 'text-slate-500',
                ].join(' ')}
                aria-hidden="true"
              >
                {ops[i]}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── La cascade : ce que la structure change, ligne à ligne (§13) ── */}
      {showCascade && cascade.length > 1 && (
        <ol
          className="flex flex-col items-center gap-0.5 rounded-xl bg-slate-50 border border-slate-200 py-2.5 px-3"
          aria-label="Le calcul, étape par étape"
        >
          {cascade.map((ligne, i) => (
            <li key={`${ligne}-${i}`} className="flex flex-col items-center gap-0.5">
              {i > 0 && <span className="text-slate-300 text-xs leading-none" aria-hidden="true">↓</span>}
              <span
                className={[
                  'font-mono tabular-nums text-center break-words',
                  i === cascade.length - 1
                    ? 'text-lg sm:text-xl font-black text-emerald-700'
                    : 'text-base sm:text-lg font-bold text-slate-600',
                ].join(' ')}
              >
                {ligne}
              </span>
            </li>
          ))}
        </ol>
      )}

      {/* ── Le total — en flux, sous le calcul : il ne peut rien recouvrir. */}
      {showResult && (
        <div className="flex items-center justify-center gap-3 rounded-xl bg-emerald-50 border-2 border-emerald-200 px-3 py-2.5 flex-wrap">
          <span className="text-xs uppercase tracking-wide text-emerald-800">{resultLabel}</span>
          <output
            className="font-mono text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums"
            aria-live="polite"
            data-total={String(total)}
          >
            {fr(total)}
          </output>
        </div>
      )}

      {/* ── UNE consigne, celle de la phase courante, + le geste de secours. */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <p
          className={[
            'text-xs text-center flex-1 min-w-[12rem]',
            phase === 'committed' ? 'text-amber-700 font-semibold' : 'text-slate-500',
          ].join(' ')}
          data-phase={phase}
          aria-live="polite"
        >
          {phase === 'committed' && <strong>Tu viens de créer un bloc. </strong>}
          {labHint(state, expr)}
        </p>
        {phase !== 'idle' && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'reset' })}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border-2 border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Recommencer
          </button>
        )}
      </div>
    </div>
  );
}
