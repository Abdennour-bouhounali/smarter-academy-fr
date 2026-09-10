import React from 'react';
import { numericDerivative } from '../../../../../common/analysis/derivative';
import { fr } from './reglesUtils';

/**
 * ConfrontationPente — la même épreuve de vérité que le banc, appliquée à un
 * objet déjà construit (un quotient au module 4, une composée au module 5).
 *
 * Activity               l'élève choisit un point, PRÉDIT en cliquant sur l'une
 *                        des deux écritures candidates, puis mesure.
 * Mathematical objective une règle plausible n'est pas une règle juste : seule
 *                        la pente mesurée tranche.
 * Student action         choisir le point, choisir la candidate, mesurer.
 * Controlled variable    (x, candidate).
 * Mathematical state     la fonction et ses deux dérivées candidates ; la
 *                        pente mesurée en est la seule juge.
 * Visual consequence     deux nombres et un verdict.
 * Expected observation   « la candidate naïve donne le signe opposé » (M4),
 *                        « il manque un facteur 3 » (M5).
 *
 * `numericDerivative` mesure la pente pour VÉRIFIER une prédiction. Il ne juge
 * JAMAIS une réponse d'élève : c'est le rôle des `expected` littéraux des
 * questions du kit.
 *
 * Tous les nombres en DOM. JAMAIS GELÉ après validation.
 */
const btn =
  'min-h-[44px] px-3 py-2 rounded-xl border-2 text-sm font-bold transition ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40';
const choisi = 'border-emerald-500 bg-emerald-50 text-emerald-900';
const libre = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';

export default function ConfrontationPente({
  titre,
  expression,
  objet,              // { f, fPrime, fPrimeNaif, domaine }
  labelJuste,
  labelNaif,
  x,
  points,
  onChangeX,
  mesure = false,
  onMesurer,
  disabled = false,
}) {
  const valide = points.filter((p) => objet.domaine(p));
  const dansDomaine = objet.domaine(x);
  const vrai = dansDomaine ? objet.fPrime(x) : NaN;
  const naif = dansDomaine ? objet.fPrimeNaif(x) : NaN;
  const pente = dansDomaine ? numericDerivative(objet.f, x) : NaN;
  const memeSigne = Math.sign(vrai) === Math.sign(naif);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-slate-800 bg-slate-900 p-3 text-center">
        {titre && <div className="text-[13px] text-slate-300">{titre}</div>}
        <div className="font-mono font-black text-[19px] text-white">{expression}</div>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir le point de mesure">
        <span className="text-[13px] font-semibold text-slate-600">Mesurer la pente en x =</span>
        {valide.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChangeX?.(v)}
            disabled={disabled || !onChangeX}
            aria-pressed={v === x}
            className={`${btn} ${v === x ? choisi : libre} min-w-[52px] font-mono`}
          >
            {fr(v)}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onMesurer?.({ x, vrai, naif, pente })}
        disabled={disabled || !onMesurer}
        className="w-full min-h-[48px] rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        📏 Mesurer la vraie pente en x = {fr(x)}
      </button>

      {mesure && (
        <div className="space-y-2" aria-live="polite">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
              <div className="text-[13px] font-semibold text-amber-800">Candidate plausible</div>
              <div className="font-mono text-[15px] text-amber-900 mt-1">{labelNaif}</div>
              <div className="font-mono font-black text-[19px] tabular-nums text-amber-900 mt-1">{fr(naif)}</div>
            </div>
            <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50 p-3">
              <div className="text-[13px] font-semibold text-emerald-800">Pente réellement mesurée</div>
              <div className="text-[13px] text-emerald-700 mt-1">{labelJuste}</div>
              <div className="font-mono font-black text-[19px] tabular-nums text-emerald-900 mt-1">{fr(pente)}</div>
            </div>
          </div>
          <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-sm font-semibold text-rose-900">
            ✗ {fr(naif)} contre {fr(pente)}.{' '}
            {memeSigne
              ? <>Un écart de <strong>{fr(Math.abs(vrai - naif))}</strong> — la candidate perd un facteur en route.</>
              : <>Elles n’ont même pas le même <strong>signe</strong> : l’une monte quand l’autre descend.</>}
          </div>
        </div>
      )}
    </div>
  );
}
