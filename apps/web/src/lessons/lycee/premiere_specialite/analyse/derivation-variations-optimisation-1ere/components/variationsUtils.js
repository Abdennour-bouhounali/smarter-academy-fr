/**
 * Le modèle mathématique de « Dérivation : variations et optimisation ».
 *
 * LE MODÈLE PUR D'ABORD (PATRON §18). Tout ce que les modules affichent en est
 * DÉRIVÉ : aucune flèche, aucune ligne de tableau, aucun extremum n'est écrit
 * à la main dans un module. Les dérivées sont EXACTES et littérales — jamais
 * `numericDerivative`, qui ne sert qu'au tracé (cf. l'en-tête de
 * common/analysis/derivative.js).
 *
 * PÉRIMÈTRE CODÉ, PAS COMMENTÉ (mémoire `perimetre_executable_lecon`) :
 * `assertDansLePerimetre` REFUSE une fonction dont les zéros de la dérivée ne
 * sont pas donnés en littéraux exacts. La leçon ne résout aucune équation par
 * dichotomie : ce serait de l'analyse numérique, hors programme de 1ère.
 */
import { signTable, numericDerivative } from '../../../../../common/analysis/derivative';
import { formatDec } from '@smarter-academy/core';

/** Format français des nombres de la leçon : virgule, vrai signe moins. */
export const fr = (n) => formatDec(n).replace('-', '−');

/**
 * `parseDec` refuse le VRAI signe moins U+2212 et les tirets typographiques,
 * alors que la leçon AFFICHE « −2 » partout et que l'élève le recopie.
 * (Piège n°1 du lot 1 : trois agents sur quatre l'ont payé.)
 */
export const parseSigned = (raw, parseDelegue) =>
  parseDelegue(String(raw ?? '').replace(/[−–—‒‐]/g, '-'));

// ─────────────────────────────────────────────────────────────────────────────
// Les fonctions étudiées
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Une fonction de la leçon déclare :
 *   f, fPrime  les DEUX expressions exactes ;
 *   zeros      les zéros de fPrime, en littéraux EXACTS et triés ;
 *   domain     l'intervalle d'étude ;
 *   fRange / fpRange  les deux cadres, dont la sécurité de mise en page est
 *              BALAYÉE par le test (jamais échantillonnée).
 */

/** La fonction de l'interaction signature : deux zéros bien séparés, un max ET un min. */
export const CUBE = {
  id: 'cube',
  name: 'f',
  label: 'f(x) = x³ − 3x',
  fPrimeText: 'f′(x) = 3x² − 3',
  f: (x) => x ** 3 - 3 * x,
  fPrime: (x) => 3 * x * x - 3,
  // 3x² − 3 = 0 ⟺ x² = 1 ⟺ x = −1 ou x = 1. Exact, entier, atteignable.
  zeros: [-1, 1],
  domain: { xMin: -2, xMax: 2 },
  // f varie de −2 à 2 sur le domaine ; f′ de −3 à 9. Les deux cadres partagent
  // EXACTEMENT la plage en x — c'est l'invariant de la vue scindée.
  fRange: { xMin: -2, xMax: 2, yMin: -2.6, yMax: 2.6 },
  fpRange: { xMin: -2, xMax: 2, yMin: -3.6, yMax: 9.6 },
  fUnit: 66,
  fUnitY: 34,
  fpUnit: 66,
  fpUnitY: 14,
};

/** Le CONTRE-EXEMPLE du module 2 : f′(0) = 0 sans extremum en 0. */
export const CUBE_SIMPLE = {
  id: 'cubeSimple',
  name: 'g',
  label: 'g(x) = x³',
  fPrimeText: 'g′(x) = 3x²',
  f: (x) => x ** 3,
  fPrime: (x) => 3 * x * x,
  zeros: [0],
  // CIBLE ATTEIGNABLE (PATRON §17) : le domaine est un multiple ENTIER du pas de
  // la sonde, ALIGNÉ sur 0. Avec ±1,6 le cran 0 n'existait pas et l'élève ne
  // pouvait jamais poser la sonde sur le point même dont parle le contre-exemple.
  domain: { xMin: -1.5, xMax: 1.5 },
  fRange: { xMin: -1.5, xMax: 1.5, yMin: -4.2, yMax: 4.2 },
  fpRange: { xMin: -1.5, xMax: 1.5, yMin: -1.2, yMax: 8 },
  fUnit: 80,
  fUnitY: 24,
  fpUnit: 80,
  fpUnitY: 15,
};

/** Atelier du module 4 : une parabole — un seul zéro, un minimum. */
export const PARABOLE = {
  id: 'parabole',
  name: 'p',
  label: 'p(x) = x² − 4x + 1',
  fPrimeText: 'p′(x) = 2x − 4',
  f: (x) => x * x - 4 * x + 1,
  fPrime: (x) => 2 * x - 4,
  zeros: [2],
  domain: { xMin: -1, xMax: 5 },
  fRange: { xMin: -1, xMax: 5, yMin: -4, yMax: 7 },
  fpRange: { xMin: -1, xMax: 5, yMin: -6.5, yMax: 6.5 },
  fUnit: 46, fUnitY: 24, fpUnit: 46, fpUnitY: 18,
  // Domaine large (6 unités) : un pas de 0,5 garde une zone de saisie de
  // 23 px, et le zéro 2 tombe toujours pile sur un cran.
  pasSonde: 0.5,
};

/** Atelier du module 4 : deux zéros, un max PUIS un min (l'ordre inverse de CUBE). */
export const CUBE_MAXMIN = {
  id: 'cubeMaxMin',
  name: 'q',
  label: 'q(x) = x³ − 6x² + 9x',
  fPrimeText: 'q′(x) = 3x² − 12x + 9',
  f: (x) => x ** 3 - 6 * x * x + 9 * x,
  fPrime: (x) => 3 * x * x - 12 * x + 9,
  // 3x² − 12x + 9 = 3(x − 1)(x − 3) : zéros exacts 1 et 3.
  zeros: [1, 3],
  domain: { xMin: 0, xMax: 4 },
  fRange: { xMin: 0, xMax: 4, yMin: -0.6, yMax: 4.6 },
  fpRange: { xMin: 0, xMax: 4, yMin: -3.6, yMax: 9.6 },
  fUnit: 68, fUnitY: 40, fpUnit: 68, fpUnitY: 14,
};

/** Atelier du module 4 : f′ ne s'annule JAMAIS — le tableau n'a qu'une flèche. */
export const TOUJOURS_CROISSANTE = {
  id: 'monotone',
  name: 'r',
  label: 'r(x) = x³ + 3x',
  fPrimeText: 'r′(x) = 3x² + 3',
  f: (x) => x ** 3 + 3 * x,
  fPrime: (x) => 3 * x * x + 3,
  // 3x² + 3 > 0 pour tout x : aucun zéro. C'est le cas qui interdit de croire
  // qu'un tableau de variations comporte forcément un retournement.
  zeros: [],
  domain: { xMin: -2, xMax: 2 },
  fRange: { xMin: -2, xMax: 2, yMin: -14.5, yMax: 14.5 },
  fpRange: { xMin: -2, xMax: 2, yMin: 0, yMax: 15.5 },
  fUnit: 66, fUnitY: 8, fpUnit: 66, fpUnitY: 8,
};

// ─────────────────────────────────────────────────────────────────────────────
// Les problèmes d'optimisation (module 5)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La boîte sans couvercle : on découpe un carré de côté x aux quatre coins
 * d'un carton carré de 12 cm, puis on relève les bords.
 * V(x) = x(12 − 2x)² = 4x³ − 48x² + 144x, sur ]0 ; 6[.
 * V′(x) = 12x² − 96x + 144 = 12(x − 2)(x − 6) : sur ]0 ; 6[, seul x = 2 compte.
 * V(2) = 2 × 8² = 128 cm³. Tout est ENTIER — aucun arrondi ne s'invite.
 */
export const BOITE = {
  id: 'boite',
  name: 'V',
  label: 'V(x) = x(12 − 2x)²',
  fPrimeText: 'V′(x) = 12x² − 96x + 144',
  f: (x) => x * (12 - 2 * x) ** 2,
  fPrime: (x) => 12 * x * x - 96 * x + 144,
  zeros: [2],       // dans le domaine d'étude ; 6 est une borne, pas un intérieur
  domain: { xMin: 0, xMax: 6 },
  fRange: { xMin: 0, xMax: 6, yMin: 0, yMax: 140 },
  fpRange: { xMin: 0, xMax: 6, yMin: -60, yMax: 150 },
  fUnit: 56, fUnitY: 1.1, fpUnit: 56, fpUnitY: 1.1,
  // 6 unités à 0,25 donnent une zone de 14 px : tout juste tactile. On garde
  // 0,25 ici parce que l'élève doit pouvoir approcher finement l'optimum.
  optimum: { x: 2, y: 128, kind: 'maximum', unite: 'cm³' },
};

/**
 * Le bénéfice : B(x) = −2x³ + 30x² − 96x, en centaines d'euros, pour x
 * centaines d'articles produits, sur [0 ; 10].
 * B′(x) = −6x² + 60x − 96 = −6(x − 2)(x − 8) : DEUX zéros dans le domaine.
 * En x = 2 c'est un MINIMUM (B = −88), en x = 8 un MAXIMUM (B = 128).
 * C'est le piège du module 5 : annuler la dérivée ne suffit pas, il faut lire
 * le SIGNE de part et d'autre.
 */
export const BENEFICE = {
  id: 'benefice',
  name: 'B',
  label: 'B(x) = −2x³ + 30x² − 96x',
  fPrimeText: 'B′(x) = −6x² + 60x − 96',
  f: (x) => -2 * x ** 3 + 30 * x * x - 96 * x,
  fPrime: (x) => -6 * x * x + 60 * x - 96,
  zeros: [2, 8],
  domain: { xMin: 0, xMax: 10 },
  fRange: { xMin: 0, xMax: 10, yMin: -100, yMax: 140 },
  fpRange: { xMin: 0, xMax: 10, yMin: -100, yMax: 60 },
  fUnit: 34, fUnitY: 1.1, fpUnit: 34, fpUnitY: 1.6,
  // Domaine de 10 unités : à 0,25 la zone de saisie tomberait à 4 px. Un pas
  // de 0,5 la porte à 17 px, et les zéros 2 et 8 restent des crans exacts.
  pasSonde: 0.5,
  optimum: { x: 8, y: 128, kind: 'maximum', unite: 'centaines d’euros' },
};

export const FONCTIONS = [CUBE, CUBE_SIMPLE, PARABOLE, CUBE_MAXMIN, TOUJOURS_CROISSANTE, BOITE, BENEFICE];

// ─────────────────────────────────────────────────────────────────────────────
// Le périmètre, CODÉ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Refuse toute fonction dont les zéros de la dérivée ne sont pas EXACTS.
 * Le programme de 1ère résout f′(x) = 0 par l'algèbre (racine, factorisation),
 * jamais par balayage numérique : une fonction dont on ne connaît pas les zéros
 * en littéral n'a rien à faire dans cette leçon.
 */
export function assertDansLePerimetre(fn) {
  if (!Array.isArray(fn.zeros)) {
    throw new Error(`${fn.id} : les zéros de la dérivée doivent être déclarés en littéraux exacts`);
  }
  for (const z of fn.zeros) {
    // Le DOMAINE d'abord : un zéro hors du cadre d'étude est un défaut de
    // périmètre, pas un défaut de calcul, et c'est ce nom-là que l'auteur doit
    // lire. L'ordre inverse masquait la vraie cause derrière « f′(5) = 72 ».
    if (z < fn.domain.xMin - 1e-12 || z > fn.domain.xMax + 1e-12) {
      throw new Error(`${fn.id} : le zéro ${z} tombe hors du domaine d'étude`);
    }
    if (Math.abs(fn.fPrime(z)) > 1e-12) {
      throw new Error(`${fn.id} : ${z} est déclaré zéro de la dérivée mais f′(${z}) = ${fn.fPrime(z)}`);
    }
  }
  const tries = [...fn.zeros].sort((a, b) => a - b);
  if (tries.some((z, i) => z !== fn.zeros[i])) {
    throw new Error(`${fn.id} : les zéros doivent être déclarés dans l'ordre croissant`);
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Le tableau, DÉRIVÉ des zéros exacts
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le tableau de SIGNES de f′ : une ligne par intervalle délimité par les zéros
 * EXACTS. Le signe de chaque intervalle est lu au MILIEU — un point intérieur
 * suffit, puisque f′ est continue et ne s'annule qu'aux zéros déclarés.
 */
export function tableauDeSignes(fn) {
  assertDansLePerimetre(fn);
  const { xMin, xMax } = fn.domain;
  const bornes = [xMin, ...fn.zeros.filter((z) => z > xMin + 1e-12 && z < xMax - 1e-12), xMax];
  const lignes = [];
  for (let i = 0; i < bornes.length - 1; i += 1) {
    const from = bornes[i];
    const to = bornes[i + 1];
    const milieu = (from + to) / 2;
    lignes.push({ from, to, sign: Math.sign(fn.fPrime(milieu)) });
  }
  return { bornes, lignes };
}

/** Le nom français du sens de marche associé au signe de la dérivée. */
export const SENS = { 1: 'croissante', '-1': 'décroissante', 0: 'constante' };
export const FLECHE = { croissante: '↗', décroissante: '↘', constante: '→' };

/**
 * Le tableau de VARIATIONS, dérivé du tableau de signes.
 *
 * C'est LE THÉORÈME de la leçon, codé une fois : f′ > 0 sur un intervalle ⟹ f
 * croissante ; f′ < 0 ⟹ f décroissante. Aucun module ne réécrit cette
 * correspondance à la main — ils la CONSOMMENT.
 */
export function tableauDeVariations(fn) {
  const { bornes, lignes } = tableauDeSignes(fn);
  return {
    bornes: bornes.map((x) => ({ x, y: fn.f(x) })),
    fleches: lignes.map((l) => SENS[String(l.sign)]),
    signes: lignes.map((l) => l.sign),
  };
}

/**
 * Les extremums INTÉRIEURS : un zéro de f′ où le signe CHANGE vraiment.
 * Un zéro sans changement de signe (x³ en 0) n'en produit AUCUN — c'est le
 * contre-exemple du module 2, et il est ici une conséquence du modèle, pas une
 * exception écrite à la main.
 */
export function extremums(fn) {
  const { lignes } = tableauDeSignes(fn);
  const out = [];
  for (let i = 1; i < lignes.length; i += 1) {
    const avant = lignes[i - 1].sign;
    const apres = lignes[i].sign;
    if (avant === apres || avant === 0 || apres === 0) continue;
    const x = lignes[i].from;
    out.push({ x, y: fn.f(x), kind: avant > 0 && apres < 0 ? 'maximum' : 'minimum' });
  }
  return out;
}

/** Le maximum de f sur son domaine, BORNES COMPRISES — la règle de 2de. */
export function maximumSurLeDomaine(fn) {
  const candidats = [
    { x: fn.domain.xMin, y: fn.f(fn.domain.xMin) },
    { x: fn.domain.xMax, y: fn.f(fn.domain.xMax) },
    ...fn.zeros.map((x) => ({ x, y: fn.f(x) })),
  ];
  return candidats.reduce((best, c) => (c.y > best.y ? c : best));
}

// ─────────────────────────────────────────────────────────────────────────────
// L'interaction signature — la sonde qui traverse les deux panneaux
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le pas de la sonde par DÉFAUT. Un CLIQUET aimanté, jamais un x continu :
 * chaque cran est exact, et le glisser tombe toujours dessus.
 */
export const PAS_SONDE = 0.25;

/**
 * Le pas EFFECTIF d'une fonction. Il n'est pas décoratif : c'est lui qui
 * décide de la largeur, EN PIXELS, de la zone qu'un doigt doit viser pour
 * poser la sonde sur un cran donné — cette largeur vaut `pas × fUnit`.
 *
 * DEUX EXIGENCES CONTRAIRES, ARBITRÉES ICI. Un pas fin rend les crans nombreux
 * et la lecture précise ; mais sur un domaine large ([0 ; 10] pour le
 * bénéfice), garder 0,25 imposerait soit un panneau de 560 px — illisible sur
 * un téléphone — soit une zone de saisie de 4 px, que personne n'attrape au
 * doigt. Les fonctions à domaine large prennent donc un pas de 0,5 : leurs
 * zéros sont ENTIERS, donc toujours atteignables, et la zone de saisie
 * repasse au-dessus du seuil tactile. Le test le BALAIE, fonction par
 * fonction (« CIBLE ATTEIGNABLE AU DOIGT »).
 */
export const pasDe = (fn) => fn.pasSonde ?? PAS_SONDE;

/**
 * Les crans de la sonde sur le domaine d'une fonction.
 * CIBLE ATTEIGNABLE (PATRON §17) : le test vérifie que CHAQUE zéro de f′ tombe
 * exactement sur un cran — sans quoi l'élève ne pourrait jamais poser la sonde
 * là où la flèche bascule, et la leçon affirmerait un état inatteignable.
 */
export function cransSonde(fn, pas = null) {
  const p = pas ?? pasDe(fn);
  const { xMin, xMax } = fn.domain;
  const n = Math.round((xMax - xMin) / p);
  const out = [];
  for (let i = 0; i <= n; i += 1) out.push(Math.round((xMin + i * p) * 1e6) / 1e6);
  return out;
}

/**
 * L'état complet de la sonde en x — TOUT ce que les deux panneaux affichent.
 *
 * `sens` (panneau du HAUT) et `signe` (panneau du BAS) sont calculés à partir
 * du MÊME nombre f′(x) : c'est ce qui rend l'invariant central VRAI par
 * construction, et non par coïncidence de dessin. Le test le verrouille en
 * balayant toute la plage.
 */
export function etatSonde(fn, x) {
  const y = fn.f(x);
  const d = fn.fPrime(x);
  const signe = Math.sign(d);
  return {
    x,
    y,
    d,
    signe,
    sens: SENS[String(signe)],
    fleche: FLECHE[SENS[String(signe)]],
    // Au-dessus / en dessous de l'axe DANS LE PANNEAU DU BAS.
    position: signe > 0 ? 'au-dessus' : signe < 0 ? 'en dessous' : 'sur l’axe',
  };
}

/**
 * Les bandes de couleur peintes sur l'axe des abscisses, DÉRIVÉES du signe de
 * f′ — donc identiques dans les deux panneaux. C'est la synchronisation
 * visuelle du module 1 : les bornes viennent du même tableau que les flèches.
 */
export function bandesDeSigne(fn) {
  const { lignes } = tableauDeSignes(fn);
  const out = [];
  for (const l of lignes) {
    const tone = l.sign > 0 ? 'emerald' : l.sign < 0 ? 'rose' : 'slate';
    const precedent = out.at(-1);
    // FUSION des bandes de même signe. Sur g(x) = x³, f′ s'annule en 0 SANS
    // changer de signe : peindre deux bandes vertes accolées dessinerait une
    // frontière que les mathématiques ne portent pas — et l'élève chercherait
    // le changement là où il n'y en a pas. Une seule bande traverse 0, et c'est
    // EXACTEMENT ce que le contre-exemple du module 2 doit donner à voir.
    if (precedent && precedent.sign === l.sign) {
      precedent.to = l.to;
      continue;
    }
    out.push({ from: l.from, to: l.to, sign: l.sign, tone });
  }
  return out;
}

/** L'élève a-t-il traversé les deux bascules ? La condition porte sur les crans VISITÉS. */
export function aVuLesDeuxBascules(fn, visites) {
  const { lignes } = tableauDeSignes(fn);
  return lignes.every((l) => visites.some((v) => v > l.from - 1e-9 && v < l.to + 1e-9 && Math.sign(fn.fPrime(v)) === l.sign));
}

/**
 * La courbe échantillonnée, COUPÉE au cadre. Partagée par les deux panneaux
 * pour qu'aucun tracé ne déborde — la parade §16 contre le débordement.
 */
export function echantillon(f, range, n = 200) {
  const pts = [];
  const { xMin, xMax, yMin, yMax } = range;
  for (let i = 0; i <= n; i += 1) {
    const x = xMin + ((xMax - xMin) * i) / n;
    const y = f(x);
    if (y >= yMin && y <= yMax) pts.push({ x, y });
  }
  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Le GLISSER, et son aimantation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * L'abscisse aimantée correspondant à une position en pixels dans le panneau.
 *
 * C'est la fonction que le glisser appelle à CHAQUE mouvement du doigt, et
 * c'est la raison pour laquelle l'état de la leçon n'est jamais un x continu :
 * on aimante à la CONVERSION, pas après coup. Un élève qui traîne la sonde
 * sur un zéro de f′ tombe donc dessus exactement, alors qu'un glisser libre
 * le raterait de quelques millièmes — et la leçon affirmerait « f′ s'annule
 * ici » sur un état où f′ vaut 0,003.
 *
 * Exportée du modèle, et non enfouie dans le composant, précisément pour que le
 * test puisse BALAYER tous les pixels du panneau (règle §16 : on balaie, on
 * n'échantillonne pas).
 *
 * @param {object} fn      la fonction étudiée
 * @param {number} px      abscisse en pixels DANS le repère du viewBox
 * @param {number} padLeft marge gauche du panneau, en pixels
 * @param {number} pas     le pas de la sonde
 */
export function abscisseAimantee(fn, px, padLeft, pas = null) {
  const p = pas ?? pasDe(fn);
  const brut = fn.domain.xMin + (px - padLeft) / fn.fUnit;
  const borne = Math.max(fn.domain.xMin, Math.min(fn.domain.xMax, brut));
  const aimante = Math.round((borne - fn.domain.xMin) / p) * p + fn.domain.xMin;
  return Math.round(aimante * 1e6) / 1e6;
}

/**
 * Les graduations d'ordonnées d'un panneau : au plus six, à pas « rond ».
 *
 * Une échelle qui va de −100 à 140 ne doit pas produire 240 étiquettes
 * superposées, et un panneau sans aucune graduation ne se lit pas non plus.
 * Le pas est donc pris dans une liste de valeurs lisibles : la plus petite qui
 * tienne en six graduations.
 *
 * Exportée du modèle, et non enfouie dans le composant, pour que le test
 * vérifie sur LES MÊMES nombres que ceux qui s'affichent — deux copies de
 * cette formule finiraient par diverger, et le test cesserait de dire vrai.
 */
export const PAS_GRADUATION = [0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500];

export function graduationsY(range) {
  const etendue = range.yMax - range.yMin;
  const pas = PAS_GRADUATION.find((v) => etendue / v <= 6) ?? 1000;
  const out = [];
  for (let v = Math.ceil(range.yMin / pas) * pas; v <= range.yMax + 1e-9; v += pas) {
    out.push(Math.round(v * 1e6) / 1e6);
  }
  return out;
}

/**
 * La largeur, EN PIXELS, de la zone de glisser qui amène sur un cran donné.
 * Une cible qu'on ne peut atteindre qu'en visant trois pixels n'est pas
 * atteignable au doigt : le test exige une largeur utilisable.
 */
export function largeurCran(fn, pas = null) {
  return (pas ?? pasDe(fn)) * fn.fUnit;
}

/** Réexporté pour que la leçon consomme le noyau partagé plutôt que de le doubler. */
export { signTable, numericDerivative };
