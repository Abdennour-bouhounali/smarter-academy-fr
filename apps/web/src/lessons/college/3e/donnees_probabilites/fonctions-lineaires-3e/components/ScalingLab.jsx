import React from 'react';
import { formatDec } from '@smarter-academy/core';
import { ParamSlider } from '../../../../../common/components/AffineExplorer';
import { priceWithFixed } from './linearUtils';

/**
 * ScalingLab — la balance du marchand : une masse, un prix, et les deux
 * quantités qui grandissent ENSEMBLE.
 *
 * Activity            régler la masse de cerises ; les cerises et les pièces
 *                     se comptent sous les yeux ; noter le couple au tableau.
 * Mathematical objective  faire ÉPROUVER la proportionnalité comme un
 *                     grandissement conjoint : deux fois plus de cerises,
 *                     deux fois plus de pièces — et le rapport prix ÷ masse
 *                     qui ne bouge pas.
 * Student action      glisser (ou ± ) la masse ; toucher « Noter ».
 * Controlled variable x, la masse en kilos (pas 0,5).
 * Mathematical state  { a, x, fixed } — le prix est TOUJOURS calculé par
 *                     `priceWithFixed`, jamais saisi : la pile de pièces, le
 *                     texte et la ligne du tableau ne peuvent pas se contredire.
 * Visual consequence  une tuile 🍒 par demi-kilo, une pièce par euro ; les
 *                     deux rangées s'allongent en même temps.
 * Expected observation « quand je double les cerises, les pièces doublent ».
 * Misconception targeted  ajouter 4 au lieu de multiplier par 4 ; croire
 *                     qu'une part fixe (la barquette) resterait proportionnelle.
 * Feedback            la lecture « x kg → y € », mise à jour à chaque geste.
 * Formalization       aucune ici : f(x) = ax est posé en pied de module.
 * Scaffolding         masse libre (SHOW) → prédiction du double (TRY) →
 *                     prix hors balance (EXPLORE) → contre-exemple (CHALLENGE).
 * Transfer            le module 2 fait varier le coefficient lui-même.
 *
 * SÉCURITÉ D'AFFICHAGE — les tuiles sont bornées par construction (x ≤ xMax,
 * donc au plus 2·xMax cerises et a·xMax + fixed pièces) et vivent dans des
 * rangées `flex-wrap` : rien ne peut sortir du cadre, quelle que soit la masse.
 */
export default function ScalingLab({
  a,                       // prix au kilo
  x,                       // masse courante (kg)
  onXChange,
  xMax = 5,
  step = 0.5,
  fixed = 0,               // part fixe (la barquette) — 0 en régime proportionnel
  onRecord,                // (x) => void — « Noter dans le tableau »
  recorded = new Set(),    // masses déjà notées
  disabled = false,
}) {
  const price = priceWithFixed(a, x, fixed);
  const cherries = Math.max(0, Math.round(x / 0.5));
  const coins = Math.max(0, Math.round(price - fixed));
  const already = recorded.has(x);

  return (
    <div className="space-y-3" role="group" aria-label="Balance du marchand">
      <ParamSlider
        label="Masse"
        ariaLabel="la masse de cerises"
        value={x}
        onChange={(v) => !disabled && onXChange?.(v)}
        min={0}
        max={xMax}
        step={step}
        tone="emerald"
        unit=" kg"
        disabled={disabled}
      />

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-3">
        {/* Les cerises : une tuile par demi-kilo */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sur la balance</span>
            <span className="font-mono font-bold text-emerald-700 tabular-nums">{formatDec(x)} kg</span>
          </div>
          <div className="flex flex-wrap gap-1 min-h-[28px]" aria-hidden="true">
            {Array.from({ length: cherries }, (_, i) => (
              <span key={i} className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-base leading-none">
                🍒
              </span>
            ))}
            {cherries === 0 && <span className="text-xs text-slate-400 italic">rien sur la balance</span>}
          </div>
        </div>

        {/* Les pièces : une pièce par euro, plus la barquette s'il y en a une */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">À la caisse</span>
            <span className="font-mono font-bold text-amber-700 tabular-nums" aria-live="polite">
              {formatDec(price)} €
            </span>
          </div>
          <div className="flex flex-wrap gap-1 min-h-[28px]" aria-hidden="true">
            {fixed > 0 && (
              <span className="h-7 px-2 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 whitespace-nowrap">
                📦 {formatDec(fixed)} €
              </span>
            )}
            {Array.from({ length: coins }, (_, i) => (
              <span key={i} className="w-7 h-7 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-[11px] font-bold text-amber-800">
                1
              </span>
            ))}
            {coins === 0 && fixed === 0 && <span className="text-xs text-slate-400 italic">rien à payer</span>}
          </div>
        </div>

        <p className="text-center text-sm text-slate-700">
          <strong className="font-mono tabular-nums">{formatDec(x)} kg</strong>
          <span className="mx-2 text-slate-400" aria-hidden="true">→</span>
          <span className="sr-only">donne</span>
          <strong className="font-mono tabular-nums">{formatDec(price)} €</strong>
        </p>
      </div>

      {onRecord && (
        <button
          type="button"
          onClick={() => !disabled && !already && onRecord(x)}
          disabled={disabled || already}
          className="w-full min-h-[48px] rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700
            disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{ touchAction: 'manipulation' }}
        >
          {already ? `${formatDec(x)} kg est déjà dans le tableau` : `Noter ${formatDec(x)} kg → ${formatDec(price)} € dans le tableau`}
        </button>
      )}
    </div>
  );
}
