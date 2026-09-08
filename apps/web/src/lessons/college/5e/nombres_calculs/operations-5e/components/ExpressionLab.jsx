import React from 'react';
import { fr, evalExpr, priority } from './operations';

/**
 * ExpressionLab — la manipulation SIGNATURE de la leçon (§6bis).
 *
 * L'élève POSE une parenthèse sur un calcul écrit, et le total se réécrit à
 * l'instant. Les nombres ne changent jamais ; seul change ce qu'on calcule
 * d'abord. C'est exactement l'idée que la leçon doit rendre visible : un
 * calcul n'est pas une phrase qu'on lit de gauche à droite, il a une
 * STRUCTURE, et les parenthèses la désignent.
 *
 * Cause → effet immédiat : un tap sur un terme ouvre la parenthèse, un tap sur
 * un second terme la ferme, et le résultat est recalculé depuis le même état.
 * Aucun bouton « Valider » entre le geste et sa conséquence. Un troisième tap
 * sur le même terme la retire : la manipulation est REJOUABLE, toujours — elle
 * ne se fige jamais parce qu'une étape a été validée (bug class relevée en 6e).
 *
 * Sécurité visuelle (§17bis) : tout est du DOM en flux — pas un seul <text>
 * SVG posé à des coordonnées calculées. Les termes sont des boutons de taille
 * tactile dans un conteneur qui passe à la ligne ; le bandeau de résultat vit
 * en dessous. Aucune position n'est supposée : quel que soit le nombre de
 * termes, la longueur des nombres ou la largeur de l'écran, rien ne peut
 * chevaucher quoi que ce soit.
 *
 * @param {{nums: number[], ops: string[]}} expr  l'expression, jamais modifiée
 * @param {{from:number,to:number}|null} paren    la parenthèse posée
 * @param {(p) => void} onParen                   appelée à chaque changement
 * @param {boolean} [showResult=true]             afficher le total
 * @param {string} [resultLabel]                  libellé du bandeau de résultat
 * @param {boolean} [locked=false]                figer la pose (rarement utile)
 */
export default function ExpressionLab({
  expr,
  paren,
  onParen,
  showResult = true,
  resultLabel = 'Ce calcul vaut',
  locked = false,
  ariaLabel,
}) {
  const { nums, ops } = expr;
  const total = evalExpr(expr, paren);

  /** Un tap sur le terme i : ouvrir, fermer, ou retirer la parenthèse. */
  const tap = (i) => {
    if (locked) return;
    if (!paren) { onParen?.({ from: i, to: null }); return; }
    if (paren.to === null) {
      if (i === paren.from) { onParen?.(null); return; }      // annule l'ouverture
      const from = Math.min(paren.from, i);
      const to = Math.max(paren.from, i);
      onParen?.({ from, to });
      return;
    }
    // Une parenthèse complète est posée : un tap la retire et rouvre ailleurs.
    if (i === paren.from || i === paren.to) { onParen?.(null); return; }
    onParen?.({ from: i, to: null });
  };

  const inParen = (i) => paren && paren.to !== null && i >= paren.from && i <= paren.to;
  const isOpen = (i) => paren && paren.to === null && i === paren.from;

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      <div
        className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5"
        role="group"
        aria-label={ariaLabel || 'Calcul — touche deux nombres pour poser une parenthèse'}
      >
        {nums.map((n, i) => (
          <React.Fragment key={`t-${i}`}>
            {/* La parenthèse ouvrante — un caractère à part, jamais superposé. */}
            {paren && paren.to !== null && i === paren.from && (
              <span className="text-2xl sm:text-3xl font-black text-amber-600" aria-hidden="true">(</span>
            )}
            <button
              type="button"
              disabled={locked}
              onClick={() => tap(i)}
              data-term={i}
              aria-pressed={inParen(i) || isOpen(i)}
              aria-label={`Nombre ${fr(n)}`}
              className={[
                'min-h-[44px] min-w-[44px] px-2.5 sm:px-3 rounded-xl border-2 font-mono text-xl sm:text-2xl font-black tabular-nums transition-colors',
                inParen(i)
                  ? 'border-amber-400 bg-amber-50 text-amber-800'
                  : isOpen(i)
                  ? 'border-amber-400 bg-white text-amber-700 border-dashed'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-400',
                locked ? 'opacity-70' : '',
              ].join(' ')}
            >
              {fr(n)}
            </button>
            {paren && paren.to !== null && i === paren.to && (
              <span className="text-2xl sm:text-3xl font-black text-amber-600" aria-hidden="true">)</span>
            )}
            {i < ops.length && (
              <span
                className={[
                  'px-0.5 sm:px-1 text-xl sm:text-2xl font-black select-none',
                  priority(ops[i]) === 2 ? 'text-indigo-600' : 'text-slate-500',
                ].join(' ')}
              >
                {ops[i]}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Le résultat — en flux, sous le calcul : il ne peut rien recouvrir. */}
      {showResult && (
        <div className="flex items-center justify-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 flex-wrap">
          <span className="text-xs uppercase tracking-wide text-slate-500">{resultLabel}</span>
          <output
            className="font-mono text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums"
            aria-live="polite"
            data-total={String(total)}
          >
            {fr(total)}
          </output>
        </div>
      )}

      <p className="text-xs text-center text-slate-500">
        {paren && paren.to === null
          ? 'Touche un second nombre pour fermer la parenthèse.'
          : paren
          ? 'Touche un nombre de la parenthèse pour l’enlever, ou un autre pour recommencer.'
          : 'Touche deux nombres pour poser une parenthèse autour d’eux.'}
      </p>
    </div>
  );
}
