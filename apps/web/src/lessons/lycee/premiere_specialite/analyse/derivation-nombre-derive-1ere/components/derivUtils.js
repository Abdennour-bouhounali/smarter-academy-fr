/**
 * Le modèle mathématique de « Le nombre dérivé et la tangente ».
 *
 * Tout ce que les modules affichent en est DÉRIVÉ : aucune pente, aucune
 * équation, aucun triangle n'est écrit à la main dans un module. Les dérivées
 * sont EXACTES et littérales — jamais `numericDerivative`, qui ne sert qu'au
 * tracé (voir l'en-tête de common/analysis/derivative.js).
 */
import { secantSlope, tangentAt, lineEquation } from '../../../../../common/analysis/derivative';
import { formatDec } from '@smarter-academy/core';

/** Format français des nombres de la leçon : virgule, vrai signe moins. */
export const fr = (n) => formatDec(n).replace('-', '−');

/** Équation d'une droite, écrite en français scolaire. */
export const eq = (line) => lineEquation(line, fr);

/**
 * Les fonctions étudiées, avec leur dérivée EXACTE.
 * `fPrime` est la formule mathématique, pas une approximation : c'est elle qui
 * juge les réponses de l'élève.
 */
export const CARRE = {
  id: 'carre',
  label: 'f(x) = x²',
  f: (x) => x * x,
  fPrime: (x) => 2 * x,
  fPrimeText: 'f′(x) = 2x',
  range: { xMin: -1, xMax: 4, yMin: -2, yMax: 10 },
  // Bornes du point de contact dans TangentReader. Balayées dans le test :
  // l'escalier de lecture de pente doit rester dans le cadre partout.
  contactRange: { lo: 0, hi: 2.5 },
  // Pas du cliquet de pente dans TangentBuilder. CIBLE ATTEIGNABLE : depuis
  // une pente de départ nulle, chaque f′(a) visé doit tomber sur un cran.
  pasPente: 0.5,
  unit: 46,
  unitY: 26,
};

export const CUBE = {
  id: 'cube',
  label: 'g(x) = x³ − 3x',
  f: (x) => x ** 3 - 3 * x,
  fPrime: (x) => 3 * x * x - 3,
  fPrimeText: 'g′(x) = 3x² − 3',
  range: { xMin: -2.5, xMax: 2.5, yMin: -4, yMax: 4 },
  // hi = 1,5 et non 1 : c'est la SEULE abscisse atteignable où la courbe est
  // SOUS l'axe et la tangente MONTE. Sans elle, la cible du module 3 serait
  // infaisable et sa question n'aurait pas de contre-exemple à montrer.
  contactRange: { lo: -1.5, hi: 1.5 },
  // 0,25 et non 0,5 : les pentes de g valent 3,75 et −2,25 aux points visés,
  // qu'un cliquet de 0,5 n'atteindrait jamais depuis 0.
  pasPente: 0.25,
  unit: 52,
  unitY: 30,
};

/**
 * Les crans de h du laboratoire signature.
 *
 * CIBLE ATTEIGNABLE : un cliquet, jamais un curseur. Chaque valeur est
 * exactement représentable et exactement lisible ; l'élève ne peut pas
 * « manquer » 0,01. Décroissants, parce que le geste EST le rapprochement.
 */
export const H_STEPS = [2, 1, 0.5, 0.25, 0.1, 0.05, 0.01];

/** Le taux de variation, avec ses deux ingrédients visibles. */
export function tauxDetail(fn, a, h) {
  const fa = fn.f(a);
  const fb = fn.f(a + h);
  return { a, h, fa, fb, rise: fb - fa, run: h, slope: secantSlope(fn.f, a, h) };
}

/** La sécante (AB) et la tangente en A, toutes deux en forme affine { a, b }. */
export const secante = (fn, a, h) => {
  const s = secantSlope(fn.f, a, h);
  return { a: s, b: fn.f(a) - s * a };
};
export const tangente = (fn, a) => tangentAt(fn.fPrime(a), a, fn.f(a));

/**
 * L'élève a-t-il assez rapproché B pour voir la stabilisation ?
 * La condition porte sur les crans VISITÉS, pas sur le cran courant : ce qui
 * fait la découverte, c'est la SUITE des pentes, pas la dernière.
 */
export const aVuLaStabilisation = (visites) =>
  H_STEPS.slice(-3).every((h) => visites.includes(h));

/**
 * L'écart entre la pente de la sécante et le nombre dérivé, ce que la colonne
 * d'historique rend visible. Sert aussi au test : il doit décroître.
 */
export const ecartAuNombreDerive = (fn, a, h) => Math.abs(secantSlope(fn.f, a, h) - fn.fPrime(a));

/**
 * L'avancée de l'escalier de lecture de pente, la plus lisible qui TIENNE dans
 * le cadre. On préfère 1 (la lecture « +1 → +f′(a) » du cours), et l'on descend
 * à 0,5 puis 0,25 quand le sommet de la marche — ou son abscisse — sortirait du
 * repère.
 *
 * SÉCURITÉ DE MISE EN PAGE (INTERACTION_PEDAGOGY §17bis) : les bornes se
 * CALCULENT, elles ne se constatent pas après coup. Sur g(x) = x³ − 3x en
 * a = −1,5, une avancée fixée à 1 hisserait le sommet à 4,875 dans un cadre qui
 * s'arrête à 4.
 */
export function stepRun(fn, a, pente, fa) {
  const { xMax, yMin, yMax } = fn.range;
  for (const dx of [1, 0.5, 0.25]) {
    const sommet = fa + pente * dx;
    if (a + dx <= xMax && sommet >= yMin && sommet <= yMax) return dx;
  }
  return 0.25;
}
