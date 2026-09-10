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

/**
 * LE GLISSER DU POINT B — l'aimantation sur le cran de h le plus proche.
 *
 * L'élève tire B ; ce qui compte n'est pas où son doigt s'arrête, mais le cran
 * de `H_STEPS` qui en est le plus proche. La comparaison se fait sur l'ÉCART
 * BRUT (et non en échelle logarithmique) parce que c'est la distance À L'ÉCRAN
 * qui décide de ce que l'élève croit viser.
 *
 * L'ÉCART EST SIGNÉ, ET SERRÉ À ZÉRO — et non pris en valeur absolue. B vit à
 * droite de A dans tout le module ; un doigt qui DÉPASSE A vers la gauche doit
 * rendre le plus PETIT cran (il rapprochait, il a été trop loin), et non le
 * cran symétrique. Avec une valeur absolue, un doigt lâché en a − 1 aurait
 * rendu h = 1, c'est-à-dire un ÉLOIGNEMENT — la sécante aurait sauté en
 * arrière au milieu d'un geste de rapprochement. Le test le vérifie.
 *
 * CIBLE ATTEIGNABLE : la valeur rendue est TOUJOURS un élément de `H_STEPS`,
 * jamais une valeur intermédiaire — c'est ce qui garantit que chaque pente
 * affichée reste exactement lisible. Verrouillé par un test.
 */
export function hAimante(xB, a, crans = H_STEPS) {
  const brut = Math.max(0, xB - a);
  let best = crans[0];
  let dist = Math.abs(brut - best);
  for (const c of crans) {
    const d = Math.abs(brut - c);
    if (d < dist) { dist = d; best = c; }
  }
  return best;
}

/**
 * La CELLULE DE PRÉHENSION d'un cran de h, en pixels : sa part de l'axe, de
 * mi-chemin du cran précédent à mi-chemin du suivant, multipliée par l'unité.
 *
 * Elle sert à DÉMONTRER, et non à supposer, jusqu'où le glisser reste
 * praticable : les crans se resserrant vers 0, la cellule du dernier ne vaut
 * qu'un pixel, et c'est pourquoi les boutons restent indispensables sur la
 * queue de convergence. Balayée par un test.
 */
export function cellulePrehension(i, unit, crans = H_STEPS) {
  const h = crans[i];
  const prev = i > 0 ? crans[i - 1] : null;
  const next = i < crans.length - 1 ? crans[i + 1] : null;
  const versLesPetits = next !== null ? (h - next) / 2 : h / 2;
  const versLesGrands = prev !== null ? (prev - h) / 2 : h / 2;
  return (versLesPetits + versLesGrands) * unit;
}
