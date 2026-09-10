/**
 * Le modèle mathématique de « Suites : calculer et modéliser ».
 *
 * Tout ce que les modules affichent en est DÉRIVÉ : aucun terme, aucune somme,
 * aucun montant n'est écrit à la main dans un module. `sommesUtils.test.js`
 * recalcule chaque valeur citée — une affirmation d'un module qui ne serait
 * pas vraie sur ces données est un mensonge que le test attrape.
 *
 * Le noyau partagé `common/analysis/sequences.js` porte les fonctions de
 * GÉNÉRATION (arithmetic, geometric, terms, nthArithmetic, nthGeometric) ;
 * ce fichier porte ce que la leçon amont s'interdisait explicitement : les
 * SOMMES, et les données de modélisation. Convention d'indexation héritée du
 * noyau, load-bearing : **u0 est le premier terme**, et `terms(gen, n)` rend
 * n + 1 valeurs, u0 … un.
 */
import {
  arithmetic, geometric, terms, differences, ratios,
  nthArithmetic, nthGeometric, detectKind, variationSense,
} from '../../../../../common/analysis/sequences';
import { formatDec } from '@smarter-academy/core';

/** Format français des nombres de la leçon : virgule, vrai signe moins. */
export const fr = (n) => formatDec(n, { maxDecimals: 4 }).replace('-', '−');

/** Format monétaire : deux décimales au plus, virgule, vrai signe moins. */
export const eur = (n) => formatDec(Math.round(n * 100) / 100, { maxDecimals: 2 }).replace('-', '−');

/**
 * Lecture d'une saisie d'élève, SIGNES COMPRIS.
 *
 * `parseFr` est entier-seulement et `parseDec` refuse le vrai signe moins
 * U+2212 — celui que `fr` écrit partout, et que l'élève recopie depuis
 * l'écran (raison −4 du module 2, dose décroissante du module 6). Sans cette
 * normalisation, une réponse juste serait déclarée fausse.
 */
export const parseNombre = (str) => {
  if (typeof str === 'number') return Number.isFinite(str) ? str : NaN;
  if (typeof str !== 'string') return NaN;
  const nettoye = str
    .trim()
    .replace(/[\s  ]/g, '')
    .replace(/[−–—]/g, '-')
    .replace(',', '.');
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(nettoye)) return NaN;
  return parseFloat(nettoye);
};

/* ══════════════════════════════════════════════════════════════════════════
   LES SOMMES — ce que la leçon amont s'interdisait
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * La somme u0 + u1 + … + un, calculée TERME À TERME.
 *
 * C'est la référence de vérité : les formules fermées ci-dessous sont
 * comparées à elle par balayage, jamais l'inverse. Une formule fausse est
 * ainsi attrapée par le test, pas par un élève.
 */
export function sommeTermes(list) {
  return list.reduce((a, b) => a + b, 0);
}

/**
 * Somme des n + 1 premiers termes d'une suite ARITHMÉTIQUE, par la formule de
 * Gauss : (nombre de termes) × (premier + dernier) / 2.
 *
 * NOMBRE DE TERMES, ET NON RANG. De u0 à un il y a n + 1 termes — le décalage
 * d'un cran est l'erreur centrale de ce chapitre, et c'est pourquoi la
 * fonction prend le rang du DERNIER terme (n) et calcule le compte elle-même.
 */
export function sommeArithmetique(u0, r, n) {
  return ((n + 1) * (u0 + nthArithmetic(u0, r, n))) / 2;
}

/**
 * Somme des n + 1 premiers termes d'une suite GÉOMÉTRIQUE :
 * u0 × (1 − q^(n+1)) / (1 − q), et (n + 1) × u0 quand q = 1.
 *
 * LE CAS q = 1 N'EST PAS UNE COQUETTERIE : le dénominateur 1 − q s'annule, et
 * sans ce test la formule rendrait NaN ou Infinity sur une suite constante —
 * qui est justement un cas que l'élève rencontre (une dose répétée sans
 * élimination). La branche est balayée par le test.
 */
export function sommeGeometrique(u0, q, n, eps = 1e-12) {
  if (Math.abs(q - 1) <= eps) return (n + 1) * u0;
  return (u0 * (1 - q ** (n + 1))) / (1 - q);
}

/**
 * L'APPARIEMENT DE GAUSS, rendu explicite — c'est la manipulation du module 4.
 *
 * On apparie le premier terme avec le dernier, le deuxième avec l'avant-
 * dernier, etc. Chaque paire a la MÊME somme, u0 + un. Le cas IMPAIR (nombre
 * de termes impair) laisse une colonne CENTRALE seule : elle n'est pas cachée,
 * elle vaut exactement la demi-somme d'une paire, et c'est ce qui rend la
 * division par 2 nécessaire plutôt que suspecte.
 *
 * @param {number[]} list les termes, u0 en tête
 * @returns {{
 *   paires: {i:number, j:number, a:number, b:number, total:number}[],
 *   centre: {i:number, valeur:number}|null,
 *   totalPaire: number,
 *   nbTermes: number,
 *   somme: number,
 * }}
 */
export function apparierGauss(list) {
  const paires = [];
  let i = 0;
  let j = list.length - 1;
  while (i < j) {
    paires.push({ i, j, a: list[i], b: list[j], total: list[i] + list[j] });
    i += 1;
    j -= 1;
  }
  const centre = i === j ? { i, valeur: list[i] } : null;
  return {
    paires,
    centre,
    totalPaire: list.length > 0 ? list[0] + list[list.length - 1] : 0,
    nbTermes: list.length,
    somme: sommeTermes(list),
  };
}

/**
 * Le TÉLESCOPAGE S − qS, découverte de la somme géométrique (module 5).
 *
 * S    = u0 + u0q + u0q² + … + u0qⁿ
 * qS   =      u0q + u0q² + … + u0qⁿ + u0q^(n+1)
 * S−qS = u0 − u0q^(n+1)         (tout le milieu s'annule)
 *
 * La fonction rend les trois lignes, pour que le module les AFFICHE plutôt
 * que de les réécrire à la main, et le RESTE après annulation. `restants`
 * vaut toujours { debut: u0, fin: −u0·q^(n+1) } — le test le vérifie par
 * balayage sur des q entiers, décimaux et inférieurs à 1.
 */
export function telescopage(u0, q, n) {
  const ligneS = terms(geometric(u0, q), n);
  const ligneQS = ligneS.map((x) => x * q);
  // Ce qui SURVIT à la soustraction : le premier de S, et le dernier de qS.
  const debut = ligneS[0];
  const fin = -ligneQS[ligneQS.length - 1];
  return {
    ligneS,
    ligneQS,
    debut,
    fin,
    /** S − qS, calculé terme à terme — la vérification du télescopage. */
    difference: sommeTermes(ligneS) - sommeTermes(ligneQS),
    /** Le nombre de termes qui s'annulent deux à deux au milieu. */
    annules: Math.max(0, ligneS.length - 1),
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 1 — LE LABORATOIRE SIGNATURE « Sauter au rang 30 »
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * La suite du laboratoire. ENTIÈRE et LISIBLE jusqu'au rang cible : u30 = 95
 * tient dans une case, aucun terme intermédiaire n'a de décimale, et la pile
 * n'explose jamais — contrairement à une géométrique, qu'on ne peut pas
 * gravir à la main sans dépassement.
 */
export const SAUT_U0 = 5;
export const SAUT_R = 3;
/** Le rang à atteindre. Trente clics : le coût est physique, pas allégué. */
export const SAUT_CIBLE = 30;

/** Le générateur du laboratoire. */
export const sautGen = arithmetic(SAUT_U0, SAUT_R);

/** Le terme de rang n du laboratoire : u0 + n·r. */
export const sautTerme = (n) => nthArithmetic(SAUT_U0, SAUT_R, n);

/**
 * Le seuil de clics à partir duquel le bouton « aller au rang… » apparaît.
 *
 * DIX, ET PAS TRENTE. Le point pédagogique est l'EXASPÉRATION, pas
 * l'épuisement : après une dizaine de pas l'élève a compris que la marche est
 * régulière et que vingt de plus n'apprendront rien. Le seuil est bien
 * inférieur à la cible — c'est un test.
 */
export const SAUT_SEUIL_CLICS = 10;

/**
 * L'état du laboratoire de saut, DÉRIVÉ du couple (rang, clics).
 * Le rang est le seul état mathématique ; les clics sont un COMPTEUR de coût.
 */
export function etatSaut(rang, clics) {
  const rangSur = Math.max(0, Math.min(rang, SAUT_CIBLE));
  return {
    rang: rangSur,
    clics,
    terme: sautTerme(rangSur),
    /** Les termes déjà gravis, u0 en tête — la trace du pas-à-pas. */
    marches: terms(sautGen, rangSur),
    /** Le raccourci est-il débloqué ? */
    sautOuvert: clics >= SAUT_SEUIL_CLICS,
    /** La cible est-elle atteinte ? */
    atteint: rangSur === SAUT_CIBLE,
    /** Combien de pas resterait-il à faire à la main ? */
    restants: SAUT_CIBLE - rangSur,
  };
}

/**
 * L'ESCALIER DE PIÈCES du temps 2 — la somme rendue physique.
 *
 * Deux jeux de données, l'un à nombre PAIR de termes, l'autre IMPAIR : le cas
 * impair a une colonne centrale, et la leçon ne la cache pas. Les rangs sont
 * choisis pour que les colonnes tiennent côte à côte à 375 px : au plus neuf
 * colonnes, et une hauteur maximale bornée par `ESCALIER_HAUTEUR_MAX`.
 */
export const ESCALIER_HAUTEUR_MAX = 30;

export const ESCALIERS = [
  {
    id: 'esc-pair',
    /** rang du DERNIER terme ; le nombre de termes vaut n + 1 */
    n: 5,
    u0: SAUT_U0,
    r: SAUT_R,
    parite: 'pair',      // 6 termes : trois paires pleines, pas de colonne seule
    label: 'six colonnes',
  },
  {
    id: 'esc-impair',
    n: 6,
    u0: SAUT_U0,
    r: SAUT_R,
    parite: 'impair',    // 7 termes : trois paires, et une colonne centrale
    label: 'sept colonnes',
  },
];

/** Les colonnes d'un escalier, et son appariement complet. */
export function escalier(spec) {
  const list = terms(arithmetic(spec.u0, spec.r), spec.n);
  return { ...spec, list, ...apparierGauss(list) };
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 2 — LE TERME DE RANG n D'UNE SUITE ARITHMÉTIQUE (P1)
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Les cas travaillés au module 2. Chaque entrée déclare la valeur attendue au
 * rang visé ; le test la RECALCULE par déroulé pas-à-pas, de sorte qu'une
 * formule mal appliquée dans la donnée ne survit pas.
 *
 * Le cas à raison NÉGATIVE est là exprès : la formule u0 + n·r n'a pas besoin
 * d'être modifiée, et c'est le piège « on soustrait n fois » qui tombe.
 */
export const CAS_ARITHMETIQUES = [
  { id: 'a-plus3', u0: 5, r: 3, n: 30, label: 'u(0) = 5 et raison 3' },
  { id: 'a-plus7', u0: 2, r: 7, n: 12, label: 'u(0) = 2 et raison 7' },
  { id: 'a-moins4', u0: 100, r: -4, n: 15, label: 'u(0) = 100 et raison −4' },
];

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 3 — LE TERME DE RANG n D'UNE SUITE GÉOMÉTRIQUE (P2)
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Les cas travaillés au module 3.
 *
 * PLAFOND DE LISIBILITÉ : chaque terme visé reste sous 1e6 et s'écrit sans
 * plus de quatre décimales. Une géométrique de raison 3 au rang 30 vaudrait
 * 2 × 10¹⁴ — illisible, et surtout inutile : le point est que la puissance
 * fait le travail, pas qu'elle produise un monstre.
 */
export const GEO_PLAFOND = 1e6;

export const CAS_GEOMETRIQUES = [
  { id: 'g-fois2', u0: 3, q: 2, n: 10, label: 'u(0) = 3 et raison 2' },
  { id: 'g-fois1-05', u0: 400, q: 1.05, n: 10, label: 'u(0) = 400 et raison 1,05' },
  { id: 'g-demi', u0: 64, q: 0.5, n: 6, label: 'u(0) = 64 et raison 0,5' },
];

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 5 — LA SOMME GÉOMÉTRIQUE PAR TÉLESCOPAGE (P4)
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Les cas de somme géométrique. `q` entier pour le télescopage (les lignes
 * s'alignent sans décimale), puis un q décimal pour montrer que la formule ne
 * demande rien de plus.
 */
export const CAS_SOMMES_GEO = [
  { id: 'sg-2', u0: 1, q: 2, n: 5, label: 'u(0) = 1 et raison 2' },
  { id: 'sg-3', u0: 2, q: 3, n: 4, label: 'u(0) = 2 et raison 3' },
  { id: 'sg-demi', u0: 16, q: 0.5, n: 4, label: 'u(0) = 16 et raison 0,5' },
];

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 6 — MODÉLISER ET INTERPRÉTER (P5, P6)
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Les trois situations à modéliser, puis à INTERPRÉTER.
 *
 * Chacune porte sa nature, sa raison, et — c'est le point du LP « interpréter »
 * — la QUESTION que le modèle permet de trancher : un total cumulé pour
 * l'épargne, un seuil pour la population, un palier pour la dose.
 *
 * `gen` est le générateur ; toutes les valeurs citées par le module en sont
 * dérivées.
 */
export const SITUATIONS = [
  {
    id: 's-epargne',
    titre: 'L’épargne',
    enonce: 'Un compte contient 800 € et l’on y verse 60 € au début de chaque mois.',
    nature: 'arithmetique',
    u0: 800,
    raison: 60,
    gen: arithmetic(800, 60),
    unite: '€',
    libelleRang: 'mois',
    /** La question d'interprétation : au bout de combien de mois dépasse-t-on 2 000 € ? */
    seuil: 2000,
  },
  {
    id: 's-population',
    titre: 'La population',
    enonce: 'Une ville de 12 000 habitants perd 4 % de sa population chaque année.',
    nature: 'geometrique',
    u0: 12000,
    raison: 0.96,
    gen: geometric(12000, 0.96),
    unite: 'habitants',
    libelleRang: 'année',
    /** Au bout de combien d'années passe-t-on sous 10 000 habitants ? */
    seuil: 10000,
  },
  {
    id: 's-dose',
    titre: 'La dose de médicament',
    enonce:
      'Un patient reçoit 20 mg de médicament. Chaque jour, son organisme en élimine 40 % de ce qui reste.',
    nature: 'geometrique',
    u0: 20,
    raison: 0.6,
    gen: geometric(20, 0.6),
    unite: 'mg',
    libelleRang: 'jour',
    /** Au bout de combien de jours reste-t-il moins de 2 mg ? */
    seuil: 2,
  },
];

/**
 * Le premier rang où la suite FRANCHIT un seuil, dans le sens de sa variation.
 *
 * Deux sens, un seul appel : quand la suite croît, on cherche le premier rang
 * où u(n) ≥ seuil ; quand elle décroît, le premier rang où u(n) ≤ seuil. Le
 * sens est LU sur les termes (`variationSense`), jamais présumé — une suite
 * modélisant une baisse et une hausse ne peut pas partager une convention.
 *
 * @returns {{rang:number, valeur:number, sens:string}|null} null si le seuil
 *   n'est pas atteint dans la fenêtre.
 */
export function rangDeFranchissement(gen, seuil, rangMax = 200) {
  const echantillon = terms(gen, Math.min(6, rangMax));
  const { sens } = variationSense(echantillon);
  const franchi = sens === 'decroissante' ? (v) => v <= seuil : (v) => v >= seuil;
  for (let n = 0; n <= rangMax; n += 1) {
    const v = gen(n);
    if (franchi(v)) return { rang: n, valeur: v, sens };
  }
  return null;
}

/** Le total VERSÉ au bout de n mois pour l'épargne — une somme, pas un terme. */
export const totalCumule = (gen, n) => sommeTermes(terms(gen, n));

/* Ré-exports pratiques pour les modules — un seul point d'import. */
export {
  arithmetic, geometric, terms, differences, ratios,
  nthArithmetic, nthGeometric, detectKind, variationSense,
};
