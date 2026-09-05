import React from 'react';
import { filledCells, foldsIntoCube, patronHint } from './solidesUtils';

/**
 * PatronGrid — l'INTERACTION SIGNATURE de la leçon.
 *
 * ACTION          l'élève coche et décoche des cases pour dessiner un patron.
 * TRANSFORMATION  le verdict « se replie en cube » se recalcule à chaque
 *                 clic, par SIMULATION du pliage (foldsIntoCube).
 * SENS MATH.      un patron n'est pas une forme à reconnaître de mémoire :
 *                 c'est une configuration qui se replie, ou non.
 * FEEDBACK        le refus est motivé — trop de cases, morceaux séparés, ou
 *                 deux faces qui se superposent.
 * GÉNÉRALISATION  il existe plusieurs patrons valides ; ce qui compte n'est
 *                 pas leur allure mais le pliage.
 *
 * Chaque case est un vrai <button> de 44 px : pas de zone SVG minuscule, et
 * le clavier fonctionne naturellement.
 */
export default function PatronGrid({
  grid,
  onToggle,
  readOnly = false,
  showVerdict = true,
  cellSize = 44,
  ariaLabel,
}) {
  const result = foldsIntoCube(grid);
  const count = filledCells(grid).length;

  return (
    <div className="space-y-3">
      <div
        className="mx-auto w-fit"
        role="group"
        aria-label={ariaLabel ?? 'Grille du patron'}
      >
        {Array.from({ length: grid.rows }, (_, r) => (
          <div key={r} className="flex">
            {Array.from({ length: grid.cols }, (_, c) => {
              const on = !!grid.cells[r]?.[c];
              const label = `Case ligne ${r + 1}, colonne ${c + 1}${on ? ' — pleine' : ' — vide'}`;
              if (readOnly) {
                return (
                  <div
                    key={c}
                    aria-hidden="true"
                    style={{ width: cellSize, height: cellSize }}
                    className={`border ${on ? 'bg-violet-500 border-violet-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                );
              }
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onToggle?.(r, c)}
                  aria-pressed={on}
                  aria-label={label}
                  style={{ width: cellSize, height: cellSize }}
                  className={`border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:z-10 relative ${
                    on
                      ? 'bg-violet-500 border-violet-700 hover:bg-violet-600'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {showVerdict && (
        <div
          className={`rounded-xl border-2 px-4 py-2.5 text-center text-sm font-semibold ${
            result.ok
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
          aria-live="polite"
        >
          <span className="font-mono text-xs mr-2">{count} / 6 cases</span>
          {result.ok ? '✓ Ce patron se replie en cube.' : patronHint(result)}
        </div>
      )}
    </div>
  );
}
