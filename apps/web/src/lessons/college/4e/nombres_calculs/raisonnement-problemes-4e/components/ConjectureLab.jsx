import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Trash2 } from 'lucide-react';
import { tester } from './raisonnement4e';

/**
 * ConjectureLab — mettre une affirmation à l'épreuve de SES propres nombres.
 *
 * Activity              choisir des entiers, les lancer contre une conjecture,
 *                       et lire le verdict que le noyau en tire.
 * Mathematical objective la dissymétrie entre prouver et réfuter : aucun
 *                       nombre d'essais réussis ne prouve, un seul essai raté
 *                       réfute — définitivement.
 * Student action        taper un entier, appuyer sur « Tester » ; puis
 *                       recommencer, avec des nombres de plus en plus
 *                       inattendus.
 * Controlled variable   la liste des valeurs testées, et elle seule.
 * Mathematical state    détenu par le MODULE (`valeurs`). Ce composant est
 *                       CONTRÔLÉ : il n'accumule rien, il rend.
 * Visual consequence    chaque ligne s'accompagne d'un ✓ ou d'un ✗ ; dès le
 *                       premier ✗, le panneau bascule en « réfutée » et le
 *                       contre-exemple est nommé.
 * Expected observation  sur la conjecture VRAIE : « le compteur monte, le
 *                       verdict ne change pas ». Sur la FAUSSE : « un seul
 *                       essai a suffi ».
 * Misconception targeted deux d'un coup — « beaucoup d'exemples prouvent » et
 *                       la symétrie fausse « il faut plusieurs contre-exemples
 *                       pour réfuter ».
 *
 * LE VERDICT N'EST PAS RÉDIGÉ ICI. `tester(conj, valeurs)` renvoie son statut
 * et son message ; le composant les affiche. Il n'existe pas de branche du
 * code capable d'écrire « prouvée », parce que le noyau ne produit pas ce
 * statut — la leçon ne peut donc pas mentir, même par inadvertance.
 *
 * SÉCURITÉ VISUELLE (§17bis). Pas de SVG, pas de position absolue : une liste
 * de puces qui passe à la ligne, et un panneau de texte. Les valeurs sont
 * bornées, donc la largeur des puces est majorée.
 */

export const V_MIN = -20;
export const V_MAX = 200;

export default function ConjectureLab({
  conj,                    // l'objet conjecture du noyau
  valeurs,                 // number[] — détenues par le module
  onTester,                // (n) => void
  onVider,                 // () => void
  suggestions = [],        // quelques nombres proposés, pour démarrer vite
  label = 'Banc d’essai',
}) {
  const [brouillon, setBrouillon] = useState('');

  const n = Number.parseInt(brouillon, 10);
  const valide = Number.isInteger(n) && n >= V_MIN && n <= V_MAX;

  const lancer = (valeur) => {
    const v = valeur ?? n;
    if (!Number.isInteger(v)) return;
    onTester?.(v);
    setBrouillon('');
  };

  const bilan = valeurs.length > 0 ? tester(conj, valeurs) : null;

  return (
    <div className="space-y-3" role="group" aria-label={label}>
      {/* ── L'affirmation à éprouver ──────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/60 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-purple-500">
          L’affirmation à éprouver
        </p>
        <p className="mt-0.5 text-sm font-semibold text-purple-900">{conj.enonce}</p>
      </div>

      {/* ── La saisie ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-2 rounded-2xl border-2 border-slate-200 bg-white p-3">
        <label className="flex-1 min-w-[150px]">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Un entier à essayer
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={brouillon}
            onChange={(e) => setBrouillon(e.target.value.replace(/[^\d-]/g, ''))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); lancer(); } }}
            placeholder="ex. 12"
            aria-label="Entier à tester contre la conjecture"
            className="mt-1 min-h-[44px] w-full rounded-xl border-2 border-slate-300 px-3 text-base font-bold tabular-nums text-slate-800 focus:border-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          />
        </label>
        <button
          type="button"
          onClick={() => lancer()}
          disabled={!valide}
          className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold text-white transition-colors ${
            valide ? 'bg-purple-600 hover:bg-purple-700' : 'cursor-not-allowed bg-slate-300'
          }`}
        >
          Tester
        </button>
        {valeurs.length > 0 && onVider && (
          <button
            type="button"
            onClick={onVider}
            aria-label="Vider le banc d’essai"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 border-slate-200 px-3 text-slate-500 hover:border-slate-400 hover:text-slate-700"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500">Vite fait :</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => lancer(s)}
              className="min-h-[44px] min-w-[44px] rounded-xl border-2 border-slate-200 px-3 text-sm font-bold tabular-nums text-slate-700 hover:border-purple-400 hover:text-purple-700"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Les essais ────────────────────────────────────────────────── */}
      {valeurs.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">
          Aucun essai. À toi de choisir par où commencer.
        </p>
      ) : (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {bilan.resultats.length} essai{bilan.resultats.length > 1 ? 's' : ''}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {bilan.resultats.map((r, i) => (
              <motion.li
                key={`${i}-${r.n}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex min-h-[36px] items-center gap-1 rounded-xl border-2 px-2.5 text-sm font-bold tabular-nums ${
                  r.verifie
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-300 bg-rose-50 text-rose-800'
                }`}
              >
                {r.verifie
                  ? <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  : <X className="h-3.5 w-3.5" aria-hidden="true" />}
                {r.n}
                <span className="sr-only">
                  {r.verifie ? ' : l’affirmation tient' : ' : l’affirmation tombe'}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Le verdict, calculé par le noyau ───────────────────────────── */}
      {bilan && (
        <div
          data-verdict={bilan.statut}
          className={`rounded-2xl border-2 p-3 text-sm ${
            bilan.statut === 'refutee'
              ? 'border-rose-300 bg-rose-50 text-rose-900'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wide opacity-70">Verdict</p>
          <p className="mt-0.5 font-semibold">{bilan.message}</p>
        </div>
      )}
    </div>
  );
}
