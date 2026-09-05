import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import MathText from '../../../../../common/components/MathText';
import { commaMove, formatShift, shiftDecimal, formatDec } from './powerUtils';

/**
 * DecimalShifter — « la virgule qui glisse » (reprise du module 2 d'origine,
 * convertie en composant contrôlé, tap-first, avec settle-then-number).
 *
 * Activity: changer l'exposant de 10 et regarder la virgule se déplacer
 *   d'un rang par cran.
 * Mathematical objective: multiplier par 10^n décale la virgule de n rangs
 *   (à droite si n > 0, à gauche si n < 0) — l'ordre de grandeur du nombre.
 * Student action: pousser −/+ sur l'exposant (curseur secondaire disponible).
 * Controlled variable: n, l'exposant de 10.
 * Mathematical state: `{ mantissa, n }` ; le nombre affiché vient de
 *   shiftDecimal, jamais d'un calcul en flottant dans le JSX.
 * Visual consequence: la virgule glisse visiblement le long de la rangée de
 *   chiffres (transition CSS de 320 ms), puis le nombre final s'affiche —
 *   settle-then-number, playbook §10.11.
 * Expected observation: un cran d'exposant = un rang de virgule. Le nombre
 *   ne change pas de « chiffres », seulement de place.
 * Misconception targeted: se tromper de sens (n > 0 déplacerait vers la
 *   gauche) et croire qu'un exposant négatif rend le nombre négatif.
 * Feedback: la phrase « la virgule se décale de k rangs vers la droite /
 *   gauche » accompagne chaque cran, et le module chiffre l'écart à la cible.
 * Formalization: le module nomme l'ordre de grandeur après le glissement.
 * Scaffolding: stepper principal, curseur secondaire, puces de cibles.
 * Transfer: repris figé dans la synthèse du boss.
 *
 * Composant CONTRÔLÉ : `n` appartient au module.
 * Nœuds interactifs : 2 boutons + 1 curseur = 3.
 *
 * @param {number} mantissa   le nombre de départ (ex. 3,45)
 * @param {number} n          exposant de 10
 * @param {(n:number)=>void} [onChange]
 * @param {number} [minN=-4] @param {number} [maxN=6]
 * @param {boolean} [frozen=false]
 */
export default function DecimalShifter({ mantissa, n, onChange, minN = -4, maxN = 6, frozen = false }) {
  const reduced = useReducedMotion();
  const [settled, setSettled] = useState(true);
  const prevN = useRef(n);

  // settle-then-number : le nombre final n'apparaît qu'une fois la virgule
  // arrivée à destination.
  useEffect(() => {
    if (prevN.current === n) return;
    prevN.current = n;
    if (reduced) { setSettled(true); return; }
    setSettled(false);
    const t = setTimeout(() => setSettled(true), 340);
    return () => clearTimeout(t);
  }, [n, reduced]);

  const value = shiftDecimal(mantissa, n);
  const move = commaMove(n);

  // La rangée de chiffres : les chiffres de la mantisse, sans virgule, et la
  // position de la virgule comptée depuis la gauche.
  const abs = Math.abs(mantissa).toString();
  const [ip, dp = ''] = abs.split('.');
  const digits = (ip + dp).split('');
  const dotIndex = ip.length + n; // peut sortir de [0 ; digits.length]

  // On complète par des zéros pour que la virgule ait toujours une place.
  const padLeft = Math.max(0, -dotIndex + 1);
  const padRight = Math.max(0, dotIndex - digits.length);
  const cells = [
    ...Array.from({ length: padLeft }, () => '0'),
    ...digits,
    ...Array.from({ length: padRight }, () => '0'),
  ];
  const commaAt = dotIndex + padLeft;

  return (
    <div className="space-y-3" role="group" aria-label="Décalage de la virgule">
      {/* ── L'écriture du produit ────────────────────────────────────── */}
      <div className="text-center">
        <MathText className="text-xl sm:text-2xl text-slate-800">
          {`$${String(formatDec(mantissa)).replace(',', '{,}')} \\times 10^{${n}}$`}
        </MathText>
      </div>

      {/* ── La rangée de chiffres, virgule glissante ─────────────────── */}
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-violet-200 bg-white py-4">
        <div className="flex items-end justify-center gap-0 min-w-max px-4">
          {cells.map((d, i) => (
            <React.Fragment key={`cell-${i}`}>
              {i === commaAt && <CommaMark reduced={reduced} />}
              <span
                className={`inline-flex items-center justify-center w-7 sm:w-8 h-11 font-mono text-2xl font-extrabold tabular-nums ${
                  i >= padLeft && i < padLeft + digits.length ? 'text-violet-800' : 'text-slate-300'
                }`}
              >
                {d}
              </span>
            </React.Fragment>
          ))}
          {/* Une virgule en toute fin ne s'écrit pas : le nombre est entier. */}
        </div>
      </div>

      {/* ── Le résultat, après que la virgule se soit posée ──────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide font-bold text-slate-500">Le nombre obtenu</p>
        <p className="font-mono text-2xl font-extrabold text-slate-800 tabular-nums min-h-[2rem]">
          {settled ? formatShift(mantissa, n) : '…'}
        </p>
        <p className="text-xs text-violet-800">
          {move.sens === 'aucun'
            ? 'La virgule ne bouge pas : multiplier par 10⁰ = 1 ne change rien.'
            : `La virgule se décale de ${formatDec(move.rangs)} rang${move.rangs > 1 ? 's' : ''} vers la ${move.sens} — le nombre ${
                move.sens === 'droite' ? 'grandit' : 'rapetisse'
              }.`}
        </p>
      </div>

      {!frozen && onChange && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onChange(n - 1)}
              disabled={n <= minN}
              aria-label="Diminuer l’exposant de 10 de 1"
              className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-violet-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              −
            </button>
            <span className="font-mono text-lg font-extrabold text-slate-800 tabular-nums w-24 text-center">
              n = {formatDec(n)}
            </span>
            <button
              type="button"
              onClick={() => onChange(n + 1)}
              disabled={n >= maxN}
              aria-label="Augmenter l’exposant de 10 de 1"
              className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-violet-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min={minN}
            max={maxN}
            step="1"
            value={n}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={`Exposant de 10, actuellement ${n}`}
            className="w-full max-w-md mx-auto block h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
          />
        </div>
      )}
      <p className="sr-only">
        {formatDec(mantissa)} multiplié par 10 puissance {n} vaut {formatShift(mantissa, n)}.
      </p>
    </div>
  );
}

function CommaMark({ reduced }) {
  return (
    <span
      className="inline-flex items-end justify-center w-3 h-11 text-3xl font-extrabold text-rose-600"
      style={{ transition: reduced ? 'none' : 'transform 320ms ease-out' }}
      aria-hidden="true"
    >
      ,
    </span>
  );
}
