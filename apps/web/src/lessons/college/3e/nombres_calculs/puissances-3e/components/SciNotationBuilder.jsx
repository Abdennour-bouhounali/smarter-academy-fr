import React from 'react';
import MathText from '../../../../../common/components/MathText';
import {
  formatDec, formatScientific, isValidMantissa, shiftDecimal, toScientific,
} from './powerUtils';

/**
 * SciNotationBuilder — construire l'écriture scientifique en déplaçant la
 * virgule, l'exposant suivant automatiquement.
 *
 * Activity: déplacer la virgule dans les chiffres d'un nombre ; l'exposant
 *   de 10 se corrige tout seul pour que la VALEUR reste la même.
 * Mathematical objective: comprendre que a × 10^n est une réécriture, pas un
 *   nouveau nombre, et qu'une seule position de virgule donne 1 ≤ a < 10.
 * Student action: taper « ◀ » / « ▶ » pour bouger la virgule d'un rang.
 * Controlled variable: la position de la virgule (donc la mantisse a).
 * Mathematical state: `shift` (entier) ; a = shiftDecimal(x, −shift) et
 *   n = shift. Le produit a × 10^n est recalculé et affiché — il ne change
 *   jamais : c'est l'INVARIANT visible.
 * Visual consequence: la mantisse et l'exposant bougent en sens opposés ; la
 *   carte « valeur » reste identique, et un liseré vert apparaît dès que la
 *   mantisse entre dans [1 ; 10[.
 * Expected observation: il existe exactement une position acceptée.
 * Misconception targeted: « 38 × 10^{-5} est une écriture scientifique »
 *   (mantisse ≥ 10) et « 0,38 × 10^{-3} » (mantisse < 1).
 * Feedback: le composant dit pourquoi la mantisse courante est refusée
 *   (trop grande / trop petite) sans jamais bloquer le bouton.
 * Formalization: le module nomme la règle 1 ≤ a < 10 après la construction.
 * Scaffolding: deux boutons seulement ; la valeur invariante est toujours
 *   affichée en dessous.
 *
 * Composant CONTRÔLÉ : `shift` appartient au module.
 * Nœuds interactifs : 2 boutons.
 *
 * @param {number} value        le nombre à réécrire
 * @param {number} shift        de combien de rangs la virgule a été déplacée
 * @param {(s:number)=>void} [onChange]
 * @param {number} [maxShift=8]
 * @param {boolean} [frozen=false]
 */
export default function SciNotationBuilder({ value, shift, onChange, maxShift = 8, frozen = false }) {
  const a = shiftDecimal(value, -shift);
  const n = shift;
  const ok = isValidMantissa(a);
  const target = toScientific(value);

  return (
    <div className="space-y-3" role="group" aria-label="Constructeur d’écriture scientifique">
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide font-bold text-slate-500">Le nombre de départ</p>
        <p className="font-mono text-xl font-extrabold text-slate-800 tabular-nums">
          {formatDec(value, { maxDecimals: 12 })}
        </p>
      </div>

      {/* ── L'écriture en construction ───────────────────────────────── */}
      <div
        className={`rounded-2xl border-2 p-4 text-center space-y-2 transition-colors ${
          ok ? 'border-emerald-400 bg-emerald-50' : 'border-amber-300 bg-amber-50'
        }`}
      >
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center justify-center min-w-[96px] min-h-[52px] px-3 rounded-xl border-2 font-mono text-2xl font-extrabold tabular-nums ${
              ok ? 'border-emerald-500 bg-white text-emerald-800' : 'border-amber-400 bg-white text-amber-800'
            }`}
          >
            {formatDec(a, { maxDecimals: 12 })}
          </span>
          <span className="text-xl text-slate-500" aria-hidden="true">
            ×
          </span>
          <span className="inline-flex items-center justify-center min-w-[80px] min-h-[52px] px-3 rounded-xl border-2 border-slate-300 bg-white">
            <MathText className="text-xl text-slate-800">{`$10^{${n}}$`}</MathText>
          </span>
        </div>
        <p className={`text-xs font-semibold ${ok ? 'text-emerald-800' : 'text-amber-900'}`}>
          {ok
            ? 'Coefficient entre 1 et 10 : c’est une écriture scientifique.'
            : Math.abs(a) >= 10
            ? `Coefficient ${formatDec(a, { maxDecimals: 12 })} : trop grand (il faut moins de 10). Déplace la virgule vers la gauche.`
            : `Coefficient ${formatDec(a, { maxDecimals: 12 })} : trop petit (il faut au moins 1). Déplace la virgule vers la droite.`}
        </p>
      </div>

      {/* ── L'invariant : la valeur ne change JAMAIS ─────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 text-center">
        <p className="text-xs uppercase tracking-wide font-bold text-slate-500">
          Ce que vaut cette écriture
        </p>
        <p className="font-mono text-lg font-extrabold text-slate-800 tabular-nums">
          {formatDec(shiftDecimal(a, n), { maxDecimals: 12 })}
        </p>
        <p className="text-[11px] text-slate-500">
          Toujours le même nombre : bouger la virgule d’un rang et changer l’exposant d’un cran se
          compensent exactement.
        </p>
      </div>

      {!frozen && onChange && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onChange(shift - 1)}
            disabled={shift <= -maxShift}
            aria-label="Déplacer la virgule d’un rang vers la droite"
            className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-blue-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            ▶ virgule à droite
          </button>
          <button
            type="button"
            onClick={() => onChange(shift + 1)}
            disabled={shift >= maxShift}
            aria-label="Déplacer la virgule d’un rang vers la gauche"
            className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-blue-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            ◀ virgule à gauche
          </button>
        </div>
      )}

      <p className="sr-only">
        Écriture courante : {formatDec(a, { maxDecimals: 12 })} fois 10 puissance {n}. L’écriture
        scientifique attendue est {formatDec(target.a, { maxDecimals: 12 })} fois 10 puissance {target.n}.
      </p>
      {frozen && (
        <p className="text-center text-sm">
          <MathText>{`$${formatScientific(target)}$`}</MathText>
        </p>
      )}
    </div>
  );
}
