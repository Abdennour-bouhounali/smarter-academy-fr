import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { formatFrac, gcd, normalize, plainFrac } from './rationalUtils';

/**
 * Simplifier — le simplificateur pas-à-pas, EXTRAIT de l'ancien module 02
 * de la leçon pré-kit (« Fractions irréductibles ») et remis aux normes :
 * état contrôlé par le module, contrôles ≥ 44 px, message d'erreur qui
 * donne la RAISON mathématique, et un chemin « d'un seul coup » par le PGCD.
 *
 * Activity: diviser en même temps le numérateur et le dénominateur par un
 *   diviseur commun, jusqu'à ce qu'il n'en reste plus.
 * Mathematical objective: une fraction est irréductible quand PGCD = 1 ; la
 *   valeur ne change à AUCUNE étape (c'est toujours le même point).
 * Student action: taper une puce diviseur ; « d'un seul coup » divise par le
 *   PGCD ; « Recommencer » revient au départ.
 * Controlled variable: le diviseur choisi.
 * Mathematical state: le rationnel courant + la trace des divisions faites.
 * Visual consequence: la fraction rétrécit, l'historique s'allonge, et la
 *   bannière « Irréductible ! » apparaît quand PGCD = 1.
 * Expected observation: plusieurs chemins (÷2 ÷2 ÷3 ou ÷12) mènent au MÊME
 *   résultat 2/3 — l'irréductible est unique.
 * Misconception targeted: « je simplifie le haut et j'oublie le bas », et
 *   « on peut diviser par n'importe quel nombre ».
 * Feedback: une puce non-diviseur affiche pourquoi (« 4 ne divise pas 18 »),
 *   sans jamais bloquer ni réinitialiser.
 * Formalization: irréductible ⇔ plus aucun diviseur commun autre que 1.
 * Scaffolding: le PGCD est offert comme raccourci APRÈS le pas-à-pas.
 * Transfer: la barre du module 2 rétrécit ses coupes en parallèle.
 *
 * @param {{num,den}} start          la fraction de départ (pour « Recommencer »)
 * @param {{num,den}} value          la fraction courante (contrôlée)
 * @param {{by:number, num:number, den:number}[]} history
 * @param {(next, by)=>void} onDivide  divisions valides seulement
 * @param {(divisor:number)=>void} [onRefused] puce non-diviseur tapée
 * @param {()=>void} [onReset]
 * @param {number[]} [divisors=[2,3,4,5,6,9,12]]
 * @param {string} [error]           message d'erreur rendu par le module
 * @param {boolean} [frozen=false]
 */
export default function Simplifier({
  start,
  value,
  history = [],
  onDivide,
  onRefused,
  onReset,
  divisors = [2, 3, 4, 5, 6, 9, 12],
  error = '',
  showGcdShortcut = true,
  frozen = false,
}) {
  const r = normalize(value);
  const g = gcd(r.num, r.den);
  const irreducible = g === 1;

  const tap = (d) => {
    if (frozen) return;
    if (r.num % d === 0 && r.den % d === 0) {
      onDivide?.({ num: r.num / d, den: r.den / d }, d);
    } else {
      onRefused?.(d);
    }
  };

  return (
    <div className="space-y-3" role="group" aria-label="Simplificateur de fraction">
      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/50 p-4 space-y-3">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <MathText className="text-3xl">{`$${formatFrac(r)}$`}</MathText>
          {irreducible ? (
            <span className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-extrabold text-white">
              ✓ Irréductible
            </span>
          ) : (
            <span className="rounded-xl bg-white border-2 border-sky-300 px-3 py-2 text-xs font-mono font-bold text-sky-800">
              PGCD({Math.abs(r.num)} ; {r.den}) = {g} — encore réductible
            </span>
          )}
        </div>

        {/* ── Puces diviseurs (tap-first, ≥ 44 px) ─────────────────── */}
        {!frozen && !irreducible && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 mr-1">Diviser en haut ET en bas par :</span>
            {divisors.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => tap(d)}
                aria-label={`Diviser le numérateur et le dénominateur par ${d}`}
                className="min-w-[48px] min-h-[44px] rounded-xl border-2 border-sky-300 bg-white text-base font-extrabold text-sky-700 hover:border-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="text-center text-sm font-semibold text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        {/* ── La trace : on voit le chemin parcouru ────────────────── */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-sm text-slate-600 border-t border-sky-200 pt-3">
          <span className="text-xs font-semibold text-slate-500">Trajet :</span>
          <span className="font-mono font-bold">{plainFrac(normalize(start))}</span>
          {history.map((h, i) => (
            <React.Fragment key={`${h.by}-${i}`}>
              <span className="font-mono text-xs text-slate-400">— ÷{h.by} →</span>
              <span className="font-mono font-bold">{plainFrac(normalize(h))}</span>
            </React.Fragment>
          ))}
        </div>

        {!frozen && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {showGcdShortcut && !irreducible && (
              <button
                type="button"
                onClick={() => onDivide?.({ num: r.num / g, den: r.den / g }, g)}
                aria-label={`Diviser d'un seul coup par le PGCD, qui vaut ${g}`}
                className="min-h-[44px] px-4 rounded-xl border-2 border-emerald-500 bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                D’un seul coup : ÷ {g} (le PGCD)
              </button>
            )}
            {history.length > 0 && onReset && (
              <button
                type="button"
                onClick={onReset}
                className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-600 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Recommencer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
