import React from 'react';
import { deplie, fr, valeurAffichee } from './reglesExpoUtils';

/**
 * DeplieurDePuissance — la manipulation du module 4 : déplier (e^a)^n en n
 * facteurs, et voir les exposants s'empiler en une somme.
 *
 * Activity               l'élève choisit le nombre n de copies avec un CLIQUET,
 *                        et voit les n facteurs se poser côte à côte, puis leurs
 *                        exposants s'additionner. Un afficheur compare la somme
 *                        obtenue au piège « on élève l'exposant ».
 * Mathematical objective (e^a)^n = e^(na) : élever à la puissance n, c'est
 *                        multiplier n fois, donc additionner n fois l'exposant.
 * Student action         régler n au cliquet, et lire la somme qui se construit.
 * Controlled variable    le nombre de copies n.
 * Mathematical state     { a, n } ; facteurs, somme, valeur et piège en sont
 *                        dérivés (`deplie`).
 * Visual consequence     la file de facteurs s'allonge, et la somme des
 *                        exposants la suit terme à terme.
 * Expected observation   « la somme, c'est n fois a ».
 * Misconception targeted « (e²)³ = e⁸ » — on élèverait l'exposant au lieu de le
 *                        multiplier.
 *
 * POURQUOI UN CLIQUET ICI, ET NON UN GLISSER.
 *   La règle utilisateur « le glisser d'abord » vise les POINTS et les FIGURES
 *   d'un repère. `n` est un ENTIER ABSTRAIT — le nombre de copies d'un facteur —
 *   et sa condition 3 le dit explicitement : « on ne glisse pas un entier
 *   abstrait ». Le laboratoire signature de la leçon, lui, se glisse ; celui-ci
 *   compte.
 *
 * JAMAIS GELÉ : `verrouille` ne porte que le verrou d'ANTÉRIORITÉ.
 */
const N_MIN = 2;
const N_MAX = 6;

export default function DeplieurDePuissance({ a, n, onChangeN, verrouille = false }) {
  const etat = deplie(a, n);

  return (
    <div className="space-y-3">
      {/* Le réglage du nombre de copies. Un entier abstrait se compte, il ne se
          glisse pas — d'où un cliquet, et non une poignée. */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir le nombre de copies">
        <span className="text-[13px] font-semibold text-slate-600">Nombre de copies n :</span>
        {Array.from({ length: N_MAX - N_MIN + 1 }, (_, k) => N_MIN + k).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChangeN?.(v)}
            disabled={verrouille}
            aria-pressed={v === n}
            className={
              'min-w-[48px] h-11 px-3 rounded-lg text-sm font-bold border-2 transition ' +
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' +
              'disabled:opacity-50 disabled:cursor-not-allowed ' +
              (v === n
                ? 'bg-emerald-600 border-emerald-700 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50')
            }
          >
            {v}
          </button>
        ))}
      </div>

      {/* LA FILE DE FACTEURS. Chaque copie porte son exposant ; ce sont EUX que
          l'on additionne, et la disposition le rend inévitable. */}
      <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 space-y-3">
        <div className="text-center text-[13px] font-semibold text-emerald-900">
          (e<sup>{fr(a)}</sup>)<sup>{n}</sup> signifie : e<sup>{fr(a)}</sup> multiplié par lui-même {n} fois
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {etat.facteurs.map((f, k) => (
            <React.Fragment key={k}>
              {k > 0 && <span className="text-emerald-700 font-bold">×</span>}
              <span className="inline-flex items-center justify-center min-w-[52px] h-10 rounded-lg border-2 border-emerald-300 bg-white px-2 font-mono font-bold text-emerald-900">
                e<sup>{fr(f)}</sup>
              </span>
            </React.Fragment>
          ))}
        </div>
        <div className="text-center text-[13px] text-emerald-800">
          la règle du produit transforme chaque × en + sur les exposants :
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {etat.facteurs.map((f, k) => (
            <React.Fragment key={k}>
              {k > 0 && <span className="text-emerald-700 font-bold">+</span>}
              <span className="inline-flex items-center justify-center min-w-[44px] h-9 rounded-lg border border-emerald-300 bg-white px-2 font-mono font-bold text-emerald-900">
                {fr(f)}
              </span>
            </React.Fragment>
          ))}
          <span className="text-emerald-700 font-bold">=</span>
          <span className="inline-flex items-center justify-center min-w-[56px] h-9 rounded-lg border-2 border-emerald-600 bg-emerald-600 px-2 font-mono font-black text-white">
            {fr(etat.sommeDesExposants)}
          </span>
        </div>
      </div>

      {/* LE RÉSULTAT ET LE PIÈGE, CÔTE À CÔTE. Les nombres sont en DOM, jamais
          en texte SVG : les deux colonnes peuvent porter des exposants longs. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2.5">
          <div className="text-[13px] text-emerald-700">n copies, donc n fois l’exposant : {n} × {fr(a)}</div>
          <div className="font-mono font-black tabular-nums text-lg text-emerald-900">
            e<sup>{fr(etat.sommeDesExposants)}</sup> ≈ {valeurAffichee(etat.valeur)}
          </div>
        </div>
        <div className="rounded-xl border-2 border-rose-200 bg-rose-50 px-3 py-2.5">
          <div className="text-[13px] text-rose-700">le piège : élever l’exposant, {fr(a)}<sup>{n}</sup></div>
          <div className="font-mono font-black tabular-nums text-lg text-rose-900">
            e<sup>{fr(etat.piegeExposantPuissance)}</sup>
          </div>
          <div className="text-[13px] text-rose-600">
            {Math.abs(etat.piegeExposantPuissance - etat.sommeDesExposants) < 1e-9
              ? 'ici les deux coïncident — c’est une exception, pas la règle'
              : 'un autre nombre : la file de facteurs ci-dessus tranche'}
          </div>
        </div>
      </div>
    </div>
  );
}
