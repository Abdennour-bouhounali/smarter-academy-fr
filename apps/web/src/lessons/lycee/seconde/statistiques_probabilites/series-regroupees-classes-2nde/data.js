import { makeRng } from '../../../../common/stats';

/**
 * Données de la leçon « Séries regroupées en classes ».
 *
 * Les 200 temps de recharge sont ENGENDRÉS par le générateur reproductible
 * du projet (graine fixe) plutôt qu'écrits à la main : une série continue
 * réaliste demande des valeurs décimales toutes distinctes, et une liste de
 * 200 littéraux serait illisible et impossible à relire.
 *
 * La graine est figée, donc la série est TOUJOURS la même — pour l'élève, pour
 * les corrections des questions, pour les tests. `data.test.js` vérifie les
 * effectifs par classe cités dans les modules.
 *
 * Forme voulue : une distribution unimodale, légèrement étirée vers la droite
 * (quelques recharges très longues), sur [10 ; 90] minutes — de quoi rendre
 * l'histogramme intéressant sans être pathologique.
 */
function buildRecharges() {
  const rng = makeRng(20260906);
  const out = [];
  const seen = new Set();
  while (out.length < 200) {
    // Cloche (somme de deux uniformes) + queue exponentielle à droite : la
    // distribution est unimodale et ÉTIRÉE VERS LA DROITE, comme le sont les
    // durées réelles (quelques recharges très longues, aucune très courte).
    const bell = (rng() + rng()) / 2;                   // ~centré sur 0,5
    const tail = -Math.log(1 - rng() * 0.97) * 16;      // queue à droite, marquée
    const v = 12 + bell * 30 + tail;
    if (v < 10 || v >= 90) continue;
    // Deux décimales : la série reste CONTINUE (des valeurs quasi toutes
    // distinctes), ce qui est justement ce qui rend le tableau d'effectifs
    // inutilisable et motive le regroupement.
    const r = Math.round(v * 100) / 100;
    if (seen.has(r)) continue;
    seen.add(r);
    out.push(r);
  }
  return out;
}

/** 200 temps de recharge (min), une décimale. Série de référence de la leçon. */
export const RECHARGES = buildRecharges();

/** Les bornes utilisées par la leçon quand l'amplitude vaut 10 min. */
export const BORNES_10 = [10, 20, 30, 40, 50, 60, 70, 80, 90];

/** Amplitudes proposées par le laboratoire du module 1. */
export const AMPLITUDES = [2, 5, 10, 20, 40];

/**
 * Salaires mensuels (k€) d'une PME — classes d'AMPLITUDES INÉGALES, pour le
 * piège de l'atelier : la dernière classe est quatre fois plus large.
 */
export const SALAIRES = {
  bornes: [1, 2, 3, 4, 8],
  effectifs: [18, 34, 22, 16],
};
