import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { etapesProgramme, programmeMystere, tester, conjecture } from './raisonnement4e';

/**
 * EnqueteLab — LA MANIPULATION SIGNATURE de la leçon (§6bis).
 *
 * Activity              faire tourner un programme de calcul sur des nombres
 *                       que l'élève choisit LUI-MÊME, et verser chaque essai
 *                       au tableau des pièces à conviction.
 * Mathematical objective des essais, même nombreux, ne prouvent rien ; seule
 *                       une lettre traite tous les nombres d'un coup.
 * Student action        taper un nombre, appuyer sur « Lancer », recommencer
 *                       avec un autre — grand, nul, négatif.
 * Controlled variable   le nombre de départ, et lui seul. Les quatre valeurs
 *                       affichées viennent de `etapesProgramme(n)` : elles ne
 *                       peuvent pas mentir sur le programme.
 * Mathematical state    la liste des essais — détenue par le MODULE. Ce
 *                       composant est CONTRÔLÉ : il rend un état et signale un
 *                       geste, il n'en garde aucun (hors le brouillon du champ
 *                       de saisie, qui n'est pas de la mathématique).
 * Visual consequence    les trois premières colonnes CHANGENT d'une ligne à
 *                       l'autre, la quatrième non. Le verdict, lui, ne bouge
 *                       jamais de « ces essais ne prouvent rien ».
 * Expected observation  « je n'arrive pas à le mettre en défaut… mais
 *                       POURQUOI ? »
 * Misconception targeted « ça marche sur mes cinq exemples, donc c'est
 *                       prouvé ». Le verdict est calculé par `tester()`, qui
 *                       n'a délibérément AUCUN statut « prouvée » : la leçon
 *                       ne peut donc pas se contredire, même par mégarde.
 * Formalization         aucune ici. Le mot « conjecture » et l'algèbre
 *                       arrivent APRÈS, dans le module, quand le manque est
 *                       installé.
 *
 * LE SYSTÈME NE DONNE JAMAIS LA RÉPONSE. Il n'affiche ni « les 2n
 * s'annulent », ni « le résultat est toujours 6 » : il montre des lignes, il
 * les compte, et il refuse de conclure. C'est le refus qui crée le manque.
 *
 * SÉCURITÉ VISUELLE (§17bis). Aucun SVG : le tableau est du DOM, il défile
 * horizontalement dans son propre conteneur, et les nombres sont bornés
 * (−99 à 999) donc la largeur des colonnes est majorée. Rien ne peut se
 * chevaucher ni sortir du cadre, pour aucun état atteignable, y compris à
 * 375 px.
 */

/** Bornes du champ : assez large pour surprendre, assez étroite pour tenir. */
export const N_MIN = -99;
export const N_MAX = 999;

/**
 * La conjecture que le tableau met à l'épreuve : « le résultat vaut 6 ».
 * Elle est VRAIE, et pourtant `tester` ne la déclarera jamais prouvée — c'est
 * exactement ce que le module veut faire vivre.
 */
export const CONJ_RESULTAT_6 = conjecture({
  id: 'programme-vaut-6',
  enonce: 'Le programme donne toujours 6.',
  predicat: (n) => programmeMystere(n) === 6,
  vraie: true,
  preuve: '2 × (n + 3) − 2 × n = 2n + 6 − 2n = 6.',
});

// En-têtes COURTS : à 375 px, un intitulé long forcerait une largeur
// minimale et le tableau sortirait de la colonne (défaut réel, attrapé par
// l'audit de débordement de la suite e2e). Le libellé complet de chaque
// consigne reste affiché au-dessus, dans la liste ordonnée.
const COLONNES = ['nombre', '+ 3', '× 2', 'résultat'];

export default function EnqueteLab({
  essais,              // number[] — les nombres déjà essayés, détenus par le module
  onEssai,             // (n) => void
  onVider,             // () => void — repartir de zéro
  showVerdict = true,  // le panneau piloté par tester()
  label = 'Programme mystère',
}) {
  const [brouillon, setBrouillon] = useState('');

  const n = Number.parseInt(brouillon, 10);
  const valide = Number.isInteger(n) && n >= N_MIN && n <= N_MAX;

  const lancer = () => {
    if (!valide) return;
    onEssai?.(n);
    setBrouillon('');
  };

  // Le verdict est CALCULÉ par le noyau, jamais rédigé ici : c'est ce qui
  // garantit qu'aucune copie ne pourra dire « prouvée ».
  const bilan = essais.length > 0 ? tester(CONJ_RESULTAT_6, essais) : null;

  return (
    <div className="space-y-3" role="group" aria-label={label}>
      {/* ── Les quatre consignes du programme ─────────────────────────── */}
      <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {etapesProgramme(0).map((e, i) => (
          <li
            key={e.rang}
            className="rounded-xl border-2 border-indigo-100 bg-indigo-50/60 px-2.5 py-2 text-xs font-semibold text-indigo-900"
          >
            <span className="mr-1 text-indigo-400">{i + 1}.</span>
            {e.consigne}
          </li>
        ))}
      </ol>

      {/* ── La saisie ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-2 rounded-2xl border-2 border-slate-200 bg-white p-3">
        <label className="flex-1 min-w-[150px]">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ton nombre de départ
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={brouillon}
            onChange={(e) => setBrouillon(e.target.value.replace(/[^\d-]/g, ''))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); lancer(); } }}
            placeholder="ex. 7"
            aria-label="Nombre de départ du programme"
            className="mt-1 min-h-[44px] w-full rounded-xl border-2 border-slate-300 px-3 text-base font-bold tabular-nums text-slate-800 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          />
        </label>
        <button
          type="button"
          onClick={lancer}
          disabled={!valide}
          className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold text-white transition-colors ${
            valide ? 'bg-indigo-600 hover:bg-indigo-700' : 'cursor-not-allowed bg-slate-300'
          }`}
        >
          Lancer le programme
        </button>
        {essais.length > 0 && onVider && (
          <button
            type="button"
            onClick={onVider}
            aria-label="Vider le tableau des essais"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 border-slate-200 px-3 text-slate-500 hover:border-slate-400 hover:text-slate-700"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {brouillon !== '' && !valide && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Choisis un nombre entier entre {N_MIN} et {N_MAX}.
        </p>
      )}

      {/* ── Le tableau des pièces à conviction ────────────────────────── */}
      {essais.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">
          Aucun essai pour l’instant. Choisis un nombre, n’importe lequel.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white p-2 sm:p-3">
          <table className="w-full text-sm tabular-nums">
            <caption className="sr-only">Les essais déjà lancés, étape par étape</caption>
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                {COLONNES.map((c, i) => (
                  <th key={c} scope="col" className={`px-0.5 pb-1 ${i === 0 ? 'text-left' : 'text-right'}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {essais.map((valeur, i) => {
                const etapes = etapesProgramme(valeur);
                return (
                  <motion.tr
                    key={`${i}-${valeur}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-slate-100"
                  >
                    {etapes.map((e, j) => (
                      <td
                        key={e.rang}
                        className={
                          j === 0
                            ? 'py-1.5 text-left font-bold text-slate-800'
                            : j === etapes.length - 1
                            ? 'py-1.5 text-right'
                            : 'py-1.5 text-right text-slate-500'
                        }
                      >
                        {j === etapes.length - 1 ? (
                          <span className="rounded-lg bg-indigo-100 px-2 py-0.5 font-black text-indigo-800">
                            {e.valeur}
                          </span>
                        ) : (
                          e.valeur
                        )}
                      </td>
                    ))}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Le verdict, entièrement calculé par le noyau ───────────────── */}
      {showVerdict && bilan && (
        <div
          data-verdict={bilan.statut}
          className={`rounded-2xl border-2 p-3 text-sm ${
            bilan.statut === 'refutee'
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wide opacity-70">Verdict du tableau</p>
          <p className="mt-0.5 font-semibold">{bilan.message}</p>
        </div>
      )}
    </div>
  );
}
