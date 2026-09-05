import React from 'react';
import { digitSum } from './divisibilityUtils';

/**
 * NumberGrid — la grille des nombres 1 → limit, rangés par lignes de `cols`.
 *
 * Deux usages, un seul composant contrôlé :
 *  - MODULE 3 (peindre) : `onToggle(k)` est fourni, chaque case est un
 *    <button> ; l'ensemble `painted` appartient au module. Le motif (colonnes
 *    pour 2/5/10, diagonales pour 3/9) est ce que l'élève doit LIRE.
 *  - MODULE 5 (cribler) : `onToggle` absent → les cases ne sont pas
 *    interactives (playbook §10.5 : 50 boutons, c'est déjà le plafond de
 *    densité ; le crible se commande par 4 puces, pas par 50 taps).
 *
 * `readout='digitSum'` affiche, sous la dernière case touchée, la somme de
 * ses chiffres — la réponse à la misconception « divisible par 3 ⇔ dernier
 * chiffre 3, 6 ou 9 ».
 *
 * Mobile (playbook §11 / risque A8) : à 375 px, 10 colonnes donnent des
 * cases ~32 px. La case visible reste petite mais chaque bouton porte une
 * hauteur minimale de 44 px : la zone tappable dépasse le carré peint.
 */
export default function NumberGrid({
  limit = 50,
  cols = 10,
  painted = new Set(),
  struck = new Set(),
  onToggle,
  lastTapped = null,
  readout = null,
  highlight = null, // Set<number> — contour ambre (motif à observer)
  disabled = false,
  tone = 'cyan',
  ariaLabel = 'Grille des nombres',
}) {
  const interactive = typeof onToggle === 'function' && !disabled;
  const numbers = Array.from({ length: limit }, (_, i) => i + 1);

  const TONES = {
    cyan: 'bg-cyan-500 border-cyan-600 text-white',
    violet: 'bg-violet-500 border-violet-600 text-white',
    emerald: 'bg-emerald-500 border-emerald-600 text-white',
  };
  const paintClass = TONES[tone] ?? TONES.cyan;

  return (
    <div className="space-y-2">
      <div
        className="grid gap-1 mx-auto"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: cols * 46 }}
        role="group"
        aria-label={ariaLabel}
      >
        {numbers.map((k) => {
          const isPainted = painted.has(k);
          const isStruck = struck.has(k);
          const isHi = highlight?.has(k);
          const base =
            'relative flex items-center justify-center rounded-md border-2 font-mono text-[11px] sm:text-xs font-bold min-h-[44px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
          const skin = isStruck
            ? 'bg-slate-200 border-slate-300 text-slate-400 line-through'
            : isPainted
            ? paintClass
            : 'bg-white border-slate-200 text-slate-700';
          const ring = isHi && !isStruck ? ' ring-2 ring-amber-400 ring-offset-1' : '';

          const content = (
            <>
              {k}
              {isStruck && (
                <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-rose-400 text-base">
                  ╱
                </span>
              )}
            </>
          );

          if (!interactive) {
            return (
              <div
                key={k}
                className={`${base} ${skin}${ring}`}
                aria-label={`${k}${isStruck ? ', barré' : ''}${isPainted ? ', colorié' : ''}`}
              >
                {content}
              </div>
            );
          }
          return (
            <button
              key={k}
              type="button"
              onClick={() => onToggle(k)}
              aria-pressed={isPainted}
              aria-label={`${k}${isPainted ? ', colorié' : ''}`}
              className={`${base} ${skin}${ring} hover:border-slate-500`}
            >
              {content}
            </button>
          );
        })}
      </div>

      {readout === 'digitSum' && (
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-center">
          {lastTapped == null ? (
            <span className="text-xs font-mono text-slate-400">
              Touche une case : la somme de ses chiffres s’affichera ici.
            </span>
          ) : (
            <span className="text-sm font-mono text-slate-700">
              <strong>{lastTapped}</strong> → somme des chiffres ={' '}
              {String(lastTapped).split('').join(' + ')} ={' '}
              <strong className="text-cyan-700">{digitSum(lastTapped)}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
