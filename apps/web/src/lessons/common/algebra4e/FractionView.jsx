import React from 'react';
import { ratIsInt, ratSign, ratAbs } from './exprCore';

/**
 * FractionView — une fraction RELATIVE, écrite comme au tableau.
 *
 * Deux nombres empilés autour d'une barre, jamais « a/b » sur une ligne :
 * l'empilement EST la fraction, et c'est la seule écriture qu'un élève de
 * 4e doit voir. Le signe se pose DEVANT la barre, à hauteur de celle-ci —
 * la convention française : −3/4, jamais (−3)/4 ni 3/(−4).
 *
 * Sécurité visuelle (§17bis) : rien n'est positionné en coordonnées. Les
 * deux nombres sont deux blocs empilés dont la barre prend la largeur du
 * plus large. Un numérateur à trois chiffres élargit simplement la barre —
 * aucun chevauchement possible, à aucune taille.
 */
export default function FractionView({
  value,                 // rationnel {n, d} — signe porté par le numérateur
  size = 'md',           // 'sm' | 'md' | 'lg'
  tone = 'slate',
  showIntegerAsFraction = false,   // écrire 2 comme 2/1 plutôt que 2
  className = '',
}) {
  const SIZES = {
    sm: { num: 'text-base', bar: 'h-[2px]', pad: 'px-1.5', sign: 'text-base' },
    md: { num: 'text-xl', bar: 'h-[2.5px]', pad: 'px-2', sign: 'text-xl' },
    lg: { num: 'text-3xl', bar: 'h-[3px]', pad: 'px-2.5', sign: 'text-3xl' },
  };
  const TONES = {
    slate: 'text-slate-800', indigo: 'text-indigo-700', violet: 'text-violet-700',
    emerald: 'text-emerald-700', rose: 'text-rose-600', amber: 'text-amber-700',
  };
  const s = SIZES[size] ?? SIZES.md;
  const c = TONES[tone] ?? TONES.slate;

  const neg = ratSign(value) < 0;
  const abs = ratAbs(value);
  const asInteger = ratIsInt(value) && !showIntegerAsFraction;

  return (
    <span
      className={`inline-flex items-center gap-0.5 align-middle ${className}`}
      role="img"
      aria-label={
        asInteger
          ? String(value.n)
          : `${neg ? 'moins ' : ''}${abs.n} sur ${abs.d}`
      }
    >
      {neg && <span className={`font-black ${s.sign} ${c}`} aria-hidden="true">−</span>}
      {asInteger ? (
        <span className={`font-black tabular-nums ${s.num} ${c}`} aria-hidden="true">{abs.n}</span>
      ) : (
        <span className="inline-flex flex-col items-center" aria-hidden="true">
          <span className={`font-black tabular-nums leading-tight ${s.pad} ${s.num} ${c}`}>{abs.n}</span>
          <span className={`w-full rounded bg-current ${s.bar} ${c}`} />
          <span className={`font-black tabular-nums leading-tight ${s.pad} ${s.num} ${c}`}>{abs.d}</span>
        </span>
      )}
    </span>
  );
}
