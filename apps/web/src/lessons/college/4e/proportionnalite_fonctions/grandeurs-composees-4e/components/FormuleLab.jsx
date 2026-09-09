import React from 'react';
import { fr, relation, texteDuree } from './grandeurs4e';

/**
 * FormuleLab — une seule égalité, trois questions.
 *
 * Activity               choisir CE QU'ON CHERCHE parmi les trois grandeurs, et
 *                        voir la formule se retourner pour y répondre.
 * Mathematical objective d = v × t n'est pas trois formules à mémoriser, mais
 *                        UNE égalité lue dans trois sens. Ce qui décide de
 *                        l'écriture, c'est la grandeur INCONNUE.
 * Student action         taper la grandeur cherchée, puis régler les deux
 *                        connues.
 * Controlled variable    l'inconnue, et les deux valeurs données.
 * Mathematical state     deux nombres. Le troisième vient de `relation()`, qui
 *                        dit elle-même laquelle elle a calculée (`manquante`) —
 *                        l'écriture affichée ne peut donc pas contredire le
 *                        résultat affiché.
 * Visual consequence     la ligne de formule se réécrit, et le nombre cherché
 *                        s'allume.
 * Expected observation   « c'est toujours la même égalité, je la lis dans le
 *                        sens qui m'arrange ».
 * Misconception targeted apprendre trois formules séparées et se tromper de
 *                        division (t = v ÷ d au lieu de d ÷ v).
 *
 * VÉRIFICATION VISIBLE : sous le résultat, le produit v × t est recalculé et
 * comparé à d. C'est la réponse à « comment je sais que je ne me suis pas
 * trompé de sens ? » — on remultiplie, et on doit retomber sur la distance.
 *
 * SÉCURITÉ VISUELLE : tout en DOM, aucun SVG. Les durées passent par
 * `texteDuree`.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */

/** Les trois écritures de l'égalité, indexées par la grandeur cherchée. */
export const ECRITURES = {
  distance: { formule: 'd = v × t', mots: 'distance = vitesse × durée' },
  duree: { formule: 't = d ÷ v', mots: 'durée = distance ÷ vitesse' },
  vitesse: { formule: 'v = d ÷ t', mots: 'vitesse = distance ÷ durée' },
};

const NOMS = { distance: 'la distance', duree: 'la durée', vitesse: 'la vitesse' };
const UNITES = { distance: 'km', duree: 'h', vitesse: 'km/h' };

/**
 * Les réglages proposés pour chacune des deux grandeurs connues.
 *
 * CHAQUE COUPLE EST EXACT, et `parcours.test.js` le vérifie sur les soixante
 * combinaisons. Ce n'est pas une précaution de style : `relation` arrondit la
 * durée au centième, et 30 km à 45 km/h donnait 0,67 h — dont le produit
 * 45 × 0,67 = 30,15 CONTREDISAIT la distance affichée juste au-dessus. La
 * vitesse 45 a donc été retirée : une valeur qui fait mentir la vérification
 * détruit précisément ce que ce labo veut enseigner.
 */
export const CHOIX = {
  distance: [30, 45, 60, 90, 120],
  duree: [0.5, 1, 1.5, 2, 3],
  vitesse: [15, 20, 30, 60],
};

export default function FormuleLab({ cherche, onCherche, valeurs, onValeur }) {
  const connues = ['distance', 'duree', 'vitesse'].filter((g) => g !== cherche);
  const etat = { [connues[0]]: valeurs[connues[0]], [connues[1]]: valeurs[connues[1]] };
  const r = relation(etat);
  const ecriture = ECRITURES[cherche];

  const affiche = (g, v) => (g === 'duree' ? texteDuree(v) : `${fr(v)} ${UNITES[g]}`);

  return (
    <div className="space-y-4" role="group" aria-label="Retourner la formule reliant distance, durée et vitesse">
      {/* ── Que cherche-t-on ? ───────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <p className="text-sm font-bold text-slate-700">Qu’est-ce que tu cherches ?</p>
        <div className="flex flex-wrap gap-2">
          {['distance', 'duree', 'vitesse'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onCherche(g)}
              aria-pressed={g === cherche}
              className={`min-h-[44px] rounded-xl border-2 px-3.5 py-2 text-sm font-bold capitalize transition-colors ${
                g === cherche
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
              }`}
            >
              {NOMS[g]}
            </button>
          ))}
        </div>
      </div>

      {/* ── L'écriture qui répond à CETTE question ───────────────────── */}
      <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-4 text-center"
           data-ecriture={cherche}>
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">
          L’égalité, lue pour trouver {NOMS[cherche]}
        </p>
        <p className="font-mono text-2xl font-black text-purple-900">{ecriture.formule}</p>
        <p className="mt-0.5 text-[13px] text-purple-700">{ecriture.mots}</p>
      </div>

      {/* ── Les deux grandeurs connues ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {connues.map((g) => (
          <div key={g} className="rounded-2xl border-2 border-slate-200 bg-white p-3.5">
            <p className="mb-2 text-sm font-bold capitalize text-slate-700">
              {NOMS[g]} : <span className="font-mono">{affiche(g, valeurs[g])}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CHOIX[g].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onValeur(g, v)}
                  aria-pressed={v === valeurs[g]}
                  className={`min-h-[44px] rounded-lg border-2 px-2.5 py-1.5 font-mono text-[13px] font-bold transition-colors ${
                    v === valeurs[g]
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {affiche(g, v)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Le résultat, et sa VÉRIFICATION ──────────────────────────── */}
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
          {NOMS[cherche]} (calculée)
        </p>
        <p className="font-mono text-2xl font-black tabular-nums text-amber-900"
           data-resultat={cherche}>
          {affiche(cherche, r[cherche])}
        </p>
        <p className="mt-1 font-mono text-[13px] text-slate-600">
          {cherche === 'distance'
            ? `${fr(r.vitesse)} × ${fr(r.duree)} = ${fr(r.distance)}`
            : cherche === 'duree'
              ? `${fr(r.distance)} ÷ ${fr(r.vitesse)} = ${fr(r.duree)}`
              : `${fr(r.distance)} ÷ ${fr(r.duree)} = ${fr(r.vitesse)}`}
        </p>
        <p className="mt-2 rounded-xl bg-white px-3 py-2 text-[13px] text-slate-700">
          Vérification : {fr(r.vitesse)} × {fr(r.duree)} = {fr(Math.round(r.vitesse * r.duree * 100) / 100)},
          et la distance vaut {fr(r.distance)}. On retombe bien dessus.
        </p>
      </div>
    </div>
  );
}
