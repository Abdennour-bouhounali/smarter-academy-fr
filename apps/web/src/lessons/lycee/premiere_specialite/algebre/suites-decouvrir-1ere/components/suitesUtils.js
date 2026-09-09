/**
 * Le modèle mathématique de « Suites : générer et reconnaître ».
 *
 * Tout ce que les modules affichent en est DÉRIVÉ : aucun terme, aucune raison,
 * aucun écart n'est écrit à la main dans un module. Les valeurs des questions
 * sont recalculées par `suitesUtils.test.js` — une affirmation d'un module qui
 * ne serait pas vraie sur ces données est un mensonge que le test attrape.
 *
 * Le noyau partagé (`common/analysis/sequences.js`) porte les fonctions pures ;
 * ce fichier porte les DONNÉES de la leçon et les contraintes d'affichage.
 * Convention d'indexation héritée du noyau : **u0 est le premier terme**.
 */
import {
  arithmetic, geometric, terms, differences, ratios,
  detectKind, variationSense, raisonQuiCoincide, nthArithmetic, nthGeometric,
} from '../../../../../common/analysis/sequences';
import { formatDec } from '@smarter-academy/core';

/** Format français des nombres de la leçon : virgule, vrai signe moins. */
export const fr = (n) => formatDec(n, { maxDecimals: 4 }).replace('-', '−');

/**
 * Lecture d'une saisie d'élève, SIGNES COMPRIS.
 *
 * `parseFr` est entier-seulement et `parseDec` refuse le vrai signe moins
 * U+2212 — celui que la leçon écrit partout (raison négative du module 6, où
 * l'élève recopie « −3 » depuis l'écran). Sans cette normalisation, une
 * réponse juste serait déclarée fausse.
 */
export const parseNombre = (str) => {
  if (typeof str === 'number') return Number.isFinite(str) ? str : NaN;
  if (typeof str !== 'string') return NaN;
  const nettoye = str
    .trim()
    .replace(/[\s  ]/g, '')
    .replace(/[−–—]/g, '-')
    .replace(',', '.');
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(nettoye)) return NaN;
  return parseFloat(nettoye);
};

/* ══════════════════════════════════════════════════════════════════════════
   LE LABORATOIRE SIGNATURE — « la machine à deux boutons »
   ══════════════════════════════════════════════════════════════════════════ */

/** Le premier terme commun aux deux usines. Fixé : la variable pilotée est n. */
export const LAB_U0 = 2;

/**
 * Les crans du bouton « + » de l'usine additive. Cliquet discret, jamais un
 * curseur : chaque valeur est exactement atteignable et exactement lisible.
 */
export const LAB_PAS_ADDITIFS = [1, 2, 3, 4, 5, 6];

/**
 * Les crans du bouton « × » de l'usine multiplicative.
 *
 * ENTIERS SEULEMENT, et 4 EXCLU. Avec q = 2,5 la pile se remplit de décimales
 * (12,5 puis 31,25) illisibles dans une accolade ; avec q = 4 le plafond n'est
 * atteint qu'au rang 2, trop court pour montrer un motif de divergence. Chaque
 * cran retenu laisse au moins quatre rangs sous le plafond.
 */
export const LAB_PAS_MULTIPLICATIFS = [2, 3];

/**
 * PLAFOND D'AFFICHAGE. La pile géométrique explose : sans plafond, le rang 8
 * en q = 3 vaudrait 13 122 et sortirait du cadre. Le rang atteignable est donc
 * DÉRIVÉ du plafond, jamais fixé à la main — `rangMaxLab` ci-dessous, balayé
 * par un test sur toutes les combinaisons de réglages.
 */
export const LAB_PLAFOND = 100;

/**
 * Le plus grand rang que le cliquet « +1 rang » peut atteindre sans qu'aucune
 * des deux piles ne dépasse le plafond.
 */
export function rangMaxLab(pasAdd, pasMul, u0 = LAB_U0, plafond = LAB_PLAFOND) {
  let n = 0;
  while (
    nthArithmetic(u0, pasAdd, n + 1) <= plafond
    && nthGeometric(u0, pasMul, n + 1) <= plafond
  ) n += 1;
  return n;
}

/** L'état complet du laboratoire, DÉRIVÉ des trois réglages. */
export function etatLab(pasAdd, pasMul, rang, u0 = LAB_U0) {
  const add = terms(arithmetic(u0, pasAdd), rang);
  const mul = terms(geometric(u0, pasMul), rang);
  return {
    u0, pasAdd, pasMul, rang,
    add, mul,
    ecartsAdd: differences(add),
    ecartsMul: differences(mul),
    rapportsAdd: ratios(add),
    rapportsMul: ratios(mul),
    /** Le plus grand rang jusqu'où les deux piles sont encore identiques. */
    rangDeDivergence: premierRangQuiDiffere(add, mul),
    /** Les deux machines sont-elles réglées pour coïncider au rang 1 ? */
    coincidentAuRang1: Math.abs(pasAdd - raisonQuiCoincide(u0, pasMul)) < 1e-9,
  };
}

/** Le premier rang où les deux piles diffèrent, ou null si elles sont égales. */
export function premierRangQuiDiffere(a, b, eps = 1e-9) {
  const n = Math.min(a.length, b.length);
  for (let k = 0; k < n; k += 1) if (Math.abs(a[k] - b[k]) > eps) return k;
  return null;
}

/**
 * Le réglage qui fait coïncider les deux piles sur leurs DEUX premiers termes,
 * pour un pas multiplicatif donné : r = u0(q − 1).
 *
 * DEUX TERMES, ET PAS TROIS. La consigne du module 1 dit ce qui est vrai :
 * il n'existe AUCUN réglage qui fasse coïncider trois termes, sauf des
 * machines qui ne bougent pas (q = 1). La démonstration est dans l'en-tête de
 * `raisonQuiCoincide`, et le balayage est dans `sequences.test.js`.
 */
export const pasAdditifQuiCoincide = (pasMul, u0 = LAB_U0) => raisonQuiCoincide(u0, pasMul);

/** La mission du module 1 est-elle remplie ? */
export const missionLabRemplie = (etat) => etat.coincidentAuRang1 && etat.rang >= 2;

/* ══════════════════════════════════════════════════════════════════════════
   LES SUITES CITÉES PAR LES MODULES
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Le catalogue de reconnaissance du module 3 et de l'atelier du module 6.
 * Chaque entrée porte ses termes ET la nature ATTENDUE : le test compare cette
 * annonce à `detectKind`, de sorte qu'une entrée mal étiquetée est refusée
 * avant d'atteindre un élève.
 */
export const CATALOGUE = [
  { id: 'c-arith-4', label: 'u : 3, 7, 11, 15, 19', list: [3, 7, 11, 15, 19], nature: 'arithmetique', raison: 4 },
  { id: 'c-geo-2', label: 'v : 5, 10, 20, 40, 80', list: [5, 10, 20, 40, 80], nature: 'geometrique', raison: 2 },
  { id: 'c-arith-neg', label: 'w : 20, 14, 8, 2, −4', list: [20, 14, 8, 2, -4], nature: 'arithmetique', raison: -6 },
  { id: 'c-geo-demi', label: 'x : 80, 40, 20, 10, 5', list: [80, 40, 20, 10, 5], nature: 'geometrique', raison: 0.5 },
  { id: 'c-ni-carres', label: 'y : 1, 4, 9, 16, 25', list: [1, 4, 9, 16, 25], nature: 'ni', raison: null },
  { id: 'c-const', label: 'z : 6, 6, 6, 6, 6', list: [6, 6, 6, 6, 6], nature: 'arithmetique', raison: 0 },
];

/**
 * Les suites définies par une FORMULE (module 2, première moitié).
 * `expr` est le texte affiché ; `f` est la fonction qui juge. Les deux doivent
 * s'accorder — c'est un test.
 */
export const FORMULES = [
  { id: 'f-2n1', expr: 'u(n) = 2n + 1', f: (n) => 2 * n + 1 },
  { id: 'f-n2', expr: 'v(n) = n²', f: (n) => n * n },
  { id: 'f-3x2n', expr: 'w(n) = 3 × 2ⁿ', f: (n) => 3 * 2 ** n },
  { id: 'f-10-3n', expr: 'x(n) = 10 − 3n', f: (n) => 10 - 3 * n },
];

/**
 * Les suites définies par RÉCURRENCE (module 2, seconde moitié).
 * `pas` est la fonction qui fabrique le terme suivant à partir du précédent.
 */
export const RECURRENCES = [
  { id: 'r-plus5', premier: 4, pas: (u) => u + 5, texte: 'u(0) = 4 et u(n+1) = u(n) + 5' },
  { id: 'r-fois3', premier: 1, pas: (u) => u * 3, texte: 'v(0) = 1 et v(n+1) = 3 × v(n)' },
  { id: 'r-double-moins1', premier: 5, pas: (u) => 2 * u - 1, texte: 'w(0) = 5 et w(n+1) = 2 × w(n) − 1' },
];

/** Déroule une récurrence : rend u0, u1, …, un (l'indice EST le rang). */
export function deroulerRecurrence(rec, n) {
  const out = [rec.premier];
  for (let k = 1; k <= n; k += 1) out.push(rec.pas(out[k - 1]));
  return out;
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 4 — LA DÉMONSTRATION
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Les suites à démontrer. `preuve` est la piste : 'ecart' quand c'est
 * u(n+1) − u(n) qui est constant, 'rapport' quand c'est u(n+1) / u(n).
 * Chaque entrée déclare la valeur constante ; le test la recalcule sur les
 * quatre premiers rangs plutôt que de la croire.
 */
export const A_DEMONTRER = [
  {
    id: 'd-affine', formule: 'u(n) = 5n − 2', f: (n) => 5 * n - 2,
    preuve: 'ecart', constante: 5,
    calcul: 'u(n+1) − u(n) = [5(n+1) − 2] − [5n − 2] = 5n + 5 − 2 − 5n + 2 = 5',
  },
  {
    id: 'd-expo', formule: 'v(n) = 4 × 3ⁿ', f: (n) => 4 * 3 ** n,
    preuve: 'rapport', constante: 3,
    calcul: 'v(n+1) / v(n) = (4 × 3ⁿ⁺¹) / (4 × 3ⁿ) = 3',
  },
  {
    id: 'd-affine-neg', formule: 'w(n) = 12 − 4n', f: (n) => 12 - 4 * n,
    preuve: 'ecart', constante: -4,
    calcul: 'w(n+1) − w(n) = [12 − 4(n+1)] − [12 − 4n] = 12 − 4n − 4 − 12 + 4n = −4',
  },
];

/** L'écart u(n+1) − u(n) pour une suite donnée par sa formule. */
export const ecartFormule = (f, n) => f(n + 1) - f(n);
/** Le rapport u(n+1) / u(n) pour une suite donnée par sa formule. */
export const rapportFormule = (f, n) => (f(n) === 0 ? NaN : f(n + 1) / f(n));

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 5 — LE SENS DE VARIATION
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Les six cas du sens de variation. Ils balaient les quatre pièges :
 * une raison négative ; une raison entre 0 et 1 qui fait DESCENDRE une
 * géométrique ; un premier terme négatif qui RENVERSE le sens d'une
 * géométrique ; une raison nulle / égale à 1 qui donne une suite constante.
 */
export const CAS_VARIATION = [
  { id: 'v-arith-plus', label: 'u(0) = 1, raison +3', list: buildA(1, 3), attendu: 'croissante' },
  { id: 'v-arith-moins', label: 'u(0) = 20, raison −5', list: buildA(20, -5), attendu: 'decroissante' },
  { id: 'v-geo-2', label: 'u(0) = 3, raison ×2', list: buildG(3, 2), attendu: 'croissante' },
  { id: 'v-geo-demi', label: 'u(0) = 64, raison ×0,5', list: buildG(64, 0.5), attendu: 'decroissante' },
  { id: 'v-geo-u0-neg', label: 'u(0) = −3, raison ×2', list: buildG(-3, 2), attendu: 'decroissante' },
  { id: 'v-const', label: 'u(0) = 7, raison ×1', list: buildG(7, 1), attendu: 'constante' },
];

function buildA(u0, r) { return terms(arithmetic(u0, r), 4); }
function buildG(u0, q) { return terms(geometric(u0, q), 4); }

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 6 — LA MODÉLISATION
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Les deux situations à modéliser : l'une additive (un versement fixe),
 * l'autre multiplicative (une hausse en pourcentage). Elles réutilisent
 * `coefficient-multiplicateur` de 2de : + 5 % ⟺ × 1,05.
 */
export const MODELES = [
  {
    id: 'm-epargne', titre: 'Le versement fixe',
    enonce: 'Un compte contient 150 € et l’on y verse 20 € chaque mois.',
    u0: 150, nature: 'arithmetique', raison: 20,
    gen: arithmetic(150, 20),
  },
  {
    id: 'm-hausse', titre: 'La hausse de 5 %',
    enonce: 'Un loyer de 400 € augmente de 5 % chaque année.',
    u0: 400, nature: 'geometrique', raison: 1.05,
    gen: geometric(400, 1.05),
  },
];

/* Ré-exports pratiques pour les modules — un seul point d'import. */
export {
  arithmetic, geometric, terms, differences, ratios,
  detectKind, variationSense, nthArithmetic, nthGeometric,
};
