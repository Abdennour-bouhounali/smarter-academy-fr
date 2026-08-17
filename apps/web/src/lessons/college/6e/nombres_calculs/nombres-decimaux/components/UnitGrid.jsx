import React from 'react';
import { motion } from 'framer-motion';
import { formatDec } from './decimalUtils';

/**
 * UnitGrid — le partage de l'unité rendu visible.
 *
 * C'est la manipulation fondatrice de la leçon : une unité que l'on découpe
 * en 10 (dixièmes) puis en 100 (centièmes). Tout le reste — fraction décimale,
 * écriture à virgule, comparaison — s'appuie sur cette image mentale.
 *
 * Le découpage est piloté par `parts` : 1, 10 ou 100. Les cellules gardent la
 * même surface totale, ce qui montre que la QUANTITÉ ne change pas quand on
 * change la finesse du découpage.
 */

const TONE = {
  emerald: { fill: 'bg-emerald-500', soft: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  sky: { fill: 'bg-sky-500', soft: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700' },
  violet: { fill: 'bg-violet-500', soft: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700' },
  amber: { fill: 'bg-amber-500', soft: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  rose: { fill: 'bg-rose-500', soft: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700' },
};

export const UNIT_TONE = TONE;

/**
 * Une unité découpée en `parts` parts égales.
 *
 * @param {number} parts        1, 10 ou 100
 * @param {number} [shaded]     nombre de parts coloriées (mode affichage)
 * @param {number[]} [cells]    indices coloriés (mode interactif) — prioritaire
 * @param {(i:number)=>void} [onToggle] rend chaque part cliquable
 */
export default function UnitGrid({
  parts = 10,
  shaded = 0,
  cells = null,
  onToggle,
  tone = 'emerald',
  label,
  showCount = true,
  size = 'md',
  dimmed = false,
}) {
  const t = TONE[tone] || TONE.emerald;
  const interactive = typeof onToggle === 'function';
  const isShaded = (i) => (cells ? cells.includes(i) : i < shaded);
  const count = cells ? cells.length : shaded;

  // 1 part → l'unité entière ; 10 → bandes verticales ; 100 → grille 10×10.
  // La grille des centièmes doit rester carrée pour que 100 cellules soient
  // réellement visibles et cliquables ; les dixièmes tiennent dans une barre.
  const heights = { sm: 'h-10', md: 'h-16 sm:h-20', lg: 'h-24 sm:h-28' };
  const squares = { sm: 'w-full max-w-[150px]', md: 'w-full max-w-[220px]', lg: 'w-full max-w-[300px]' };
  const boxHeight =
    parts === 100
      ? `aspect-square mx-auto ${squares[size] || squares.md}`
      : heights[size] || heights.md;
  const layout = parts === 100 ? 'grid grid-cols-10' : 'flex';

  return (
    <div className="space-y-1.5">
      {label && (
        <div className={`text-[11px] font-mono font-bold uppercase tracking-wider ${t.text}`}>{label}</div>
      )}

      <div
        className={`${boxHeight} w-full rounded-xl border-2 ${t.border} ${t.soft} overflow-hidden ${layout} ${
          dimmed ? 'opacity-40' : ''
        }`}
        role={interactive ? 'group' : 'img'}
        aria-label={
          interactive
            ? `Unité partagée en ${parts} parts égales, ${count} coloriée(s)`
            : `${count} part(s) coloriée(s) sur ${parts}`
        }
      >
        {Array.from({ length: parts }, (_, i) => {
          const on = isShaded(i);
          // Les traits de partage doivent rester visibles même quand aucune
          // part n'est coloriée (case transparente) : un trait blanc sur fond
          // pastel est quasi invisible, donc on utilise un gris franc.
          const cellClass =
            parts === 100
              ? 'border-[0.5px] border-slate-300'
              : parts === 10
              ? 'flex-1 border-r-2 border-slate-400 last:border-r-0'
              : 'flex-1';

          if (!interactive) {
            return (
              <motion.div
                key={i}
                initial={false}
                animate={{ opacity: 1 }}
                className={`${cellClass} ${on ? t.fill : 'bg-transparent'}`}
              />
            );
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(i)}
              aria-pressed={on}
              aria-label={`Part ${i + 1} sur ${parts}`}
              className={`${cellClass} transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 ${
                on ? t.fill : 'bg-transparent hover:bg-slate-900/10'
              }`}
            />
          );
        })}
      </div>

      {showCount && (
        <div className="flex items-baseline justify-between text-xs font-mono">
          <span className={`font-bold ${t.text}`}>
            {count} / {parts}
          </span>
          <span className="text-slate-400">
            {parts === 1 ? '1 unité' : `chaque part = 1/${parts}`}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * QuantityView — une quantité décimale complète : les unités entières pleines,
 * puis l'unité partielle découpée. C'est la vue « concrète » de 3,7 ou 0,37.
 *
 * @param {number} value  la quantité représentée
 * @param {number} den    finesse du découpage : 10 ou 100
 */
export function QuantityView({ value, den = 10, tone = 'emerald', maxWholes = 6, showCount = true }) {
  const whole = Math.floor(value);
  const remainder = Math.round((value - whole) * den);
  const shownWholes = Math.min(whole, maxWholes);
  const t = TONE[tone] || TONE.emerald;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: shownWholes }, (_, i) => (
          <UnitGrid key={`w${i}`} parts={den} shaded={den} tone={tone} showCount={false} size="sm" />
        ))}
        {whole > shownWholes && (
          <div className={`flex items-center justify-center text-sm font-mono font-bold ${t.text}`}>
            + {whole - shownWholes} unités
          </div>
        )}
        {remainder > 0 && (
          <UnitGrid key="partial" parts={den} shaded={remainder} tone={tone} showCount={false} size="sm" />
        )}
      </div>

      {showCount && (
        <p className="text-xs font-mono text-slate-500">
          {whole > 0 && (
            <>
              <strong className="text-slate-700">{whole}</strong> unité{whole > 1 ? 's' : ''} entière
              {whole > 1 ? 's' : ''}
            </>
          )}
          {whole > 0 && remainder > 0 && ' + '}
          {remainder > 0 && (
            <>
              <strong className="text-slate-700">{remainder}</strong> {den === 10 ? 'dixième' : 'centième'}
              {remainder > 1 ? 's' : ''}
            </>
          )}
          {' = '}
          <strong className="text-slate-800">{formatDec(value)}</strong>
        </p>
      )}
    </div>
  );
}
