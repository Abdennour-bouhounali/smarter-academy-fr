import React from 'react';

/**
 * PrimeChips — les puces du crible : 2 · 3 · 5 · 7.
 *
 * Taper une puce barre tous les multiples de ce nombre sur la grille (à
 * partir de son carré). La puce se verrouille une fois utilisée : le crible
 * est un geste qu'on ne fait qu'une fois par premier.
 *
 * Composant CONTRÔLÉ : `tapped` (Set) appartient au module.
 */
export default function PrimeChips({
  primes = [2, 3, 5, 7],
  tapped = new Set(),
  onTap,
  disabled = false,
  label = 'Barre les multiples de…',
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-mono text-slate-500">{label}</p>
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Nombres premiers du crible">
        {primes.map((p) => {
          const used = tapped.has(p);
          return (
            <button
              key={p}
              type="button"
              disabled={disabled || used}
              onClick={() => onTap?.(p)}
              aria-pressed={used}
              aria-label={`Barrer les multiples de ${p}${used ? ', déjà fait' : ''}`}
              className={`min-w-[64px] min-h-[48px] rounded-xl border-2 font-mono text-base font-extrabold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                used
                  ? 'bg-violet-600 border-violet-700 text-white'
                  : 'bg-white border-violet-300 text-violet-700 hover:border-violet-600'
              }`}
            >
              {p}
              {used ? ' ✓' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
