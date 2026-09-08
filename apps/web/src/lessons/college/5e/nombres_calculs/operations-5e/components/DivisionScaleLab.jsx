import React from 'react';
import { fr, div, mul, decimals } from './operations';

/**
 * DivisionScaleLab — le phénomène central du module « diviser par un décimal ».
 *
 * L'élève multiplie le dividende ET le diviseur par 10, autant de fois qu'il
 * veut. Les deux nombres changent à chaque coup — et le quotient, lui, ne
 * bouge pas d'un iota. Quand le diviseur devient entier, la division est
 * redevenue une division connue depuis la 6e.
 *
 * Expected observation : « les deux nombres grandissent, mais le résultat reste
 * le même » — puis « donc je peux toujours me ramener à un diviseur entier ».
 * Misconception targeted : croire que diviser rend forcément plus petit, et ne
 * pas savoir quoi faire d'une virgule au diviseur.
 *
 * Cause → effet immédiat : un tap sur ×10 (ou ÷10) réécrit les trois nombres
 * depuis le même état. Rejouable indéfiniment, dans les deux sens.
 *
 * Sécurité visuelle (§17bis) : la barre de quotient est un DIV dont la largeur
 * est un pourcentage borné — jamais un SVG à coordonnées. Les nombres vivent
 * dans des cellules de grille distinctes. Aucune longueur de nombre ne peut
 * faire déborder ou chevaucher quoi que ce soit.
 */
export default function DivisionScaleLab({
  a,                    // dividende de départ
  b,                    // diviseur de départ
  exposant,             // nombre de ×10 appliqués (état porté par le module)
  onExposant,
  maxExposant = 3,
  ariaLabel,
}) {
  const f = 10 ** exposant;
  const A = mul(a, f);
  const B = mul(b, f);
  const q = div(A, B);
  const qRef = div(a, b);
  const diviseurEntier = decimals(B) === 0;

  const setE = (e) => {
    const next = Math.max(0, Math.min(maxExposant, e));
    if (next !== exposant) onExposant?.(next);
  };

  return (
    <div
      className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3"
      aria-label={ariaLabel || 'Laboratoire de division — multiplier les deux nombres par 10'}
    >
      {/* Les trois quantités, chacune dans sa cellule : rien ne se superpose. */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <div className="text-center min-w-0">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Dividende</div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-slate-800 tabular-nums break-all" data-role="dividende">
            {fr(A)}
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-slate-400" aria-hidden="true">÷</div>
        <div className="text-center min-w-0">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Diviseur</div>
          <div
            className={[
              'font-mono text-2xl sm:text-3xl font-black tabular-nums break-all',
              diviseurEntier ? 'text-emerald-700' : 'text-orange-600',
            ].join(' ')}
            data-role="diviseur"
          >
            {fr(B)}
          </div>
          <div className={`text-[11px] font-semibold ${diviseurEntier ? 'text-emerald-600' : 'text-orange-600'}`}>
            {diviseurEntier ? 'entier ✓' : 'avec une virgule'}
          </div>
        </div>
      </div>

      {/* Le quotient — la valeur qui ne bouge pas. */}
      <div className="rounded-xl bg-slate-50 border-2 border-slate-200 px-3 py-2.5 text-center">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">Quotient</div>
        <output
          className="font-mono text-3xl sm:text-4xl font-black text-emerald-700 tabular-nums"
          aria-live="polite"
          data-role="quotient"
        >
          {fr(q)}
        </output>
        {exposant > 0 && (
          <div className="text-[11px] text-slate-500">
            {q === qRef ? 'inchangé depuis le début' : 'attention'}
          </div>
        )}
      </div>

      {/* Les commandes, hors du dessin, taille tactile. */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setE(exposant - 1)}
          disabled={exposant === 0}
          className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white font-mono font-black text-slate-700 disabled:opacity-40 hover:border-indigo-400"
        >
          ÷ 10
        </button>
        <span className="text-xs text-slate-500 px-1">
          les <strong>deux</strong> nombres
        </span>
        <button
          type="button"
          onClick={() => setE(exposant + 1)}
          disabled={exposant >= maxExposant}
          data-role="fois-dix"
          className="min-h-[44px] px-4 rounded-xl border-2 border-indigo-300 bg-indigo-50 font-mono font-black text-indigo-700 disabled:opacity-40 hover:border-indigo-500"
        >
          × 10
        </button>
      </div>
    </div>
  );
}
