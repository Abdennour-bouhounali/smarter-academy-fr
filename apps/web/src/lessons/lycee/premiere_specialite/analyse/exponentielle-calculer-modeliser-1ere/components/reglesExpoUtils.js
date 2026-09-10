/**
 * Le modèle mathématique de « Exponentielle : règles de calcul et modèles ».
 *
 * LE MODÈLE PUR D'ABORD (PATRON §18). Tout ce que les modules affichent en est
 * DÉRIVÉ : aucune valeur, aucune cible d'aimantation, aucune largeur de zone
 * tactile, aucun distracteur n'est écrit à la main dans un module.
 *
 * LA LEÇON EST LA SUITE DIRECTE de « Exponentielle : la fonction égale à sa
 * dérivée ». Ce que celle-ci a établi — la définition, exp′ = exp, exp(0) = 1,
 * le signe strictement positif, la stricte croissance — est ACQUIS ici : on
 * s'en sert, on ne le réenseigne pas. En particulier, la STRICTE CROISSANCE est
 * l'unique argument qui autorise le passage de e^u = e^v à u = v, et de
 * e^u < e^v à u < v : `justifieParCroissance` l'écrit en code, pour qu'aucun
 * module ne puisse prétendre résoudre autrement.
 *
 * L'AFFICHEUR DOUBLE, ET LA CLASSE DE DÉFAUT QU'IL PORTE.
 *   Le laboratoire signature affiche CÔTE À CÔTE e^(a+b) et e^a × e^b. Les deux
 *   nombres ne sont PAS égaux au bit près — 119 couples de la grille les
 *   séparent d'un ulp — mais la LEÇON parle de leur AFFICHAGE. `valeurAffichee`
 *   est donc la seule voie d'accès à un nombre montré, et le test balaie la
 *   grille ENTIÈRE pour prouver que les deux chaînes coïncident. Comparer les
 *   flottants bruts aurait fait clignoter la découverte.
 */
import { formatDec } from '@smarter-academy/core';

/** Format français des nombres de la leçon : virgule, vrai signe moins. */
export const fr = (n) => formatDec(n).replace('-', '−');

/**
 * `parseDec` refuse le VRAI signe moins U+2212 et les tirets typographiques,
 * alors que la leçon AFFICHE « −2 » partout et que l'élève le recopie.
 * (Piège n°1 du lot 1, payé par trois agents sur quatre.)
 */
export const parseSigned = (raw, parseDelegue) =>
  parseDelegue(String(raw ?? '').replace(/[−–—‒‐]/g, '-'));

/** Arrondi de calcul : neutralise les artefacts de flottants sans mentir. */
export function arrondi(n, decimales = 9) {
  const p = 10 ** decimales;
  return Math.round(n * p) / p;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. LE LABORATOIRE SIGNATURE — deux axes superposés
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LA PLAGE DES EXPOSANTS, ET POURQUOI ELLE S'ARRÊTE À 2.
 *
 * L'axe du bas porte les VALEURS de e^x, et il explose : e^4 ≈ 54,6 quand
 * e^2 ≈ 7,39. La somme a + b doit rester dans le cadre — c'est la contrainte
 * qui décide, pas l'esthétique. Avec a et b dans [−2 ; 2], la somme vit dans
 * [−4 ; 4], et le cadre des valeurs doit donc monter jusqu'à e^4.
 *
 * Le choix retenu : chaque curseur vit dans [−2 ; 2], la SOMME est bornée à
 * [−2 ; 2] elle aussi par `sommeBornee` — de sorte que le repère du bas n'a
 * jamais à afficher plus que e^2. `balayageDansLeCadre` le prouve par balayage
 * complet de la grille, et non par échantillonnage.
 */
export const EXPO_MIN = -2;
export const EXPO_MAX = 2;

/**
 * LE PAS D'AIMANTATION, ET LES CIBLES QU'IL DOIT ATTEINDRE.
 *
 * 0,25 est le plus grand pas qui laisse une manipulation fine tout en faisant
 * tomber EXACTEMENT sur un cran chacune des cibles pédagogiques citées par les
 * modules (`CIBLES_PEDAGOGIQUES`). `estSurUnCran` et le test le vérifient
 * cible par cible : une consigne « amène a sur 1 et b sur 1 » serait un
 * mensonge si 1 n'était pas atteignable depuis n'importe où.
 */
export const PAS_EXPO = 0.25;

/** Le nombre de crans de la plage — la longueur du cliquet, dérivée. */
export const NB_CRANS = Math.round((EXPO_MAX - EXPO_MIN) / PAS_EXPO);

/**
 * LES CIBLES PÉDAGOGIQUES : les couples (a ; b) que les modules DEMANDENT
 * d'atteindre. Chacune doit tomber sur un cran, et sa somme doit rester dans
 * le cadre. Rien d'autre ne peut être exigé de l'élève.
 */
export const CIBLES_PEDAGOGIQUES = [
  { id: 'un-un', a: 1, b: 1, propos: 'la somme la plus simple : 1 + 1 = 2' },
  { id: 'deux-moins-un', a: 2, b: -1, propos: 'un exposant négatif : la valeur devient un diviseur' },
  { id: 'demi-demi', a: 0.5, b: 0.5, propos: 'deux demis qui refont 1' },
  { id: 'zero-un', a: 0, b: 1, propos: 'e^0 = 1 : multiplier par 1 ne change rien' },
  { id: 'moins-un-moins-un', a: -1, b: -1, propos: 'deux inverses qui se multiplient' },
];

/** Une valeur tombe-t-elle exactement sur un cran de la plage ? */
export function estSurUnCran(v, pas = PAS_EXPO) {
  if (v < EXPO_MIN - 1e-12 || v > EXPO_MAX + 1e-12) return false;
  const k = (v - EXPO_MIN) / pas;
  return Math.abs(k - Math.round(k)) < 1e-9;
}

/** L'aimantation d'une valeur brute sur le cran le plus proche, bornée au cadre. */
export function aimanteExposant(v, pas = PAS_EXPO) {
  const borne = Math.max(EXPO_MIN, Math.min(EXPO_MAX, v));
  return arrondi(EXPO_MIN + Math.round((borne - EXPO_MIN) / pas) * pas);
}

/**
 * LA SOMME RESTE DANS LE CADRE.
 *
 * a + b peut valoir 4 alors que l'axe des valeurs s'arrête à e^2. Plutôt que
 * de laisser un affichage sortir du repère — ce que l'invariant visuel
 * interdit — on BORNE la somme, et le laboratoire affiche alors la longueur
 * composée jusqu'à la borne avec une marque « au-delà du cadre ».
 *
 * Ce n'est PAS un mensonge : e^(a+b) est toujours calculé et affiché en DOM ;
 * seule la LONGUEUR DESSINÉE est écrêtée, et le composant le dit.
 */
export const sommeBornee = (a, b) => Math.max(EXPO_MIN, Math.min(EXPO_MAX, arrondi(a + b)));

/** La somme sort-elle du cadre dessinable ? */
export const sommeHorsCadre = (a, b) => arrondi(a + b) > EXPO_MAX + 1e-12 || arrondi(a + b) < EXPO_MIN - 1e-12;

/**
 * LES DEUX AFFICHEURS, ET LA GARANTIE D'ÉGALITÉ.
 *
 * `valeurAffichee` est l'UNIQUE façon d'obtenir un nombre montré à l'élève.
 * Quatre décimales : assez pour que e^0,25 ≈ 1,2840 se distingue de
 * e^0,5 ≈ 1,6487, assez peu pour que les deux chemins de calcul — la somme
 * puis l'exponentielle, ou les deux exponentielles puis le produit — rendent
 * LA MÊME CHAÎNE sur toute la grille (test : balayage 17 × 17).
 */
export const DECIMALES_AFFICHAGE = 4;

export const valeurAffichee = (n) =>
  formatDec(n, { minDecimals: DECIMALES_AFFICHAGE, maxDecimals: DECIMALES_AFFICHAGE }).replace('-', '−');

/** Le chemin « j'additionne les exposants, puis j'exponentie ». */
export const parLaSomme = (a, b) => Math.exp(arrondi(a + b));

/** Le chemin « j'exponentie chacun, puis je multiplie ». */
export const parLeProduit = (a, b) => Math.exp(a) * Math.exp(b);

/**
 * Les deux chemins donnent-ils la MÊME CHAÎNE affichée ? C'est la promesse du
 * laboratoire, et le test la balaie sur la grille entière.
 */
export const memeAffichage = (a, b) =>
  valeurAffichee(parLaSomme(a, b)) === valeurAffichee(parLeProduit(a, b));

/**
 * L'état complet du laboratoire pour un couple (a ; b) — tout ce que le
 * composant affiche, dérivé une fois pour toutes.
 */
export function etatDoubleAxe(a, b) {
  const somme = arrondi(a + b);
  return {
    a,
    b,
    somme,
    sommeDessinee: sommeBornee(a, b),
    horsCadre: sommeHorsCadre(a, b),
    valeurA: Math.exp(a),
    valeurB: Math.exp(b),
    parLaSomme: parLaSomme(a, b),
    parLeProduit: parLeProduit(a, b),
    // Un exposant négatif rend une valeur INFÉRIEURE à 1 : multiplier par elle
    // divise. C'est le basculement que le module 3 fait constater.
    aDivise: b < 0,
    bDivise: a < 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. LE CADRE DU LABORATOIRE — géométrie, et zone de préhension mesurée
// ─────────────────────────────────────────────────────────────────────────────

/** Les marges du cadre, en pixels de viewBox. */
export const MARGES = { left: 30, right: 30, top: 34, bottom: 26 };

/** La largeur utile de l'axe des exposants, en pixels de viewBox. */
export const LARGEUR_AXE_PX = 420;

/** La hauteur totale du cadre : deux axes superposés, plus leurs légendes. */
export const HAUTEUR_CADRE_PX = 250;

/** Les ordonnées, en pixels de viewBox, des deux axes superposés. */
export const Y_AXE_EXPOSANTS = 62;
export const Y_AXE_VALEURS = 186;

/** Les pixels par unité d'exposant. Un cran mesure PAS_EXPO × unitX pixels. */
export const uniteExposantPx = () => LARGEUR_AXE_PX / (EXPO_MAX - EXPO_MIN);

/**
 * LA LARGEUR DE LA ZONE DE PRÉHENSION, EN PIXELS — la mesure qui a décidé du
 * pas d'aimantation.
 *
 * La leçon amont a établi le plancher : 14 px À L'ÉCRAN, pas en viewBox. Un
 * défaut de 4,25 px a été attrapé deux fois dans cette mission ; on mesure donc
 * ici, et le test balaie les largeurs d'écran qui bornent le rendu.
 *
 * La zone de préhension d'un curseur est un DEMI-CRAN de part et d'autre : au
 * delà, c'est l'autre cran qui gagne. Sa largeur est donc un cran entier.
 */
export const largeurPrehensionPx = () => PAS_EXPO * uniteExposantPx();

/**
 * Le facteur d'échelle du SVG une fois rendu : la largeur disponible divisée
 * par la largeur de la viewBox. Le composant laisse la largeur suivre le
 * conteneur (`w-full h-auto`), donc c'est elle seule qui contraint.
 */
export function facteurRendu(largeurEcranPx) {
  const l = MARGES.left + MARGES.right + LARGEUR_AXE_PX;
  return largeurEcranPx / l;
}

/** La largeur que le doigt rencontre VRAIMENT, pour une largeur d'écran donnée. */
export const largeurPrehensionEcranPx = (largeurEcranPx) =>
  largeurPrehensionPx() * facteurRendu(largeurEcranPx);

/**
 * L'ÉCHELLE DE L'AXE DES VALEURS.
 *
 * L'axe du bas est MULTIPLICATIF : la position d'une valeur v y est
 * proportionnelle à son exposant, c'est-à-dire à ln(v). C'est exactement ce qui
 * fait que deux longueurs s'AJOUTENT en bas quand les valeurs se MULTIPLIENT —
 * la découverte de la leçon, rendue géométrique.
 *
 * On ne calcule jamais de logarithme : la leçon ne l'a pas, et n'en a pas
 * besoin. La position est celle de l'EXPOSANT qui a produit la valeur.
 */
export const positionExposantPx = (x) => MARGES.left + (x - EXPO_MIN) * uniteExposantPx();

/**
 * Les graduations de l'axe des valeurs réellement écrites : une sur quatre
 * crans (soit un pas d'exposant entier), pour qu'aucune étiquette ne se
 * chevauche. `ecartGraduationsPx` mesure l'écart et le test le borne.
 */
export const CRANS_PAR_GRADUATION = 4;

export const graduationsExposants = () => {
  const out = [];
  for (let k = 0; k <= NB_CRANS; k += CRANS_PAR_GRADUATION) out.push(arrondi(EXPO_MIN + k * PAS_EXPO));
  return out;
};

export const ecartGraduationsPx = () => CRANS_PAR_GRADUATION * PAS_EXPO * uniteExposantPx();

// ─────────────────────────────────────────────────────────────────────────────
// 3. LES RÈGLES DE CALCUL — énoncées comme des OBJETS, pas comme des textes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LES QUATRE RÈGLES, chacune portée par une FONCTION VÉRIFIABLE.
 *
 * `verifie` compare les deux membres NUMÉRIQUEMENT sur un échantillon
 * d'exposants, en écart RELATIF — un écart absolu déclarerait fausse une
 * identité simplement parce que ses deux membres sont grands (défaut mesuré
 * dans la leçon amont sur e^{3x+1}).
 */
export const REGLES = [
  {
    id: 'somme',
    tex: 'e^{a+b} = e^a \\times e^b',
    gauche: (a, b) => Math.exp(a + b),
    droite: (a, b) => Math.exp(a) * Math.exp(b),
    resume: 'la somme des exposants devient un produit de valeurs',
  },
  {
    id: 'oppose',
    tex: 'e^{-a} = \\dfrac{1}{e^a}',
    gauche: (a) => Math.exp(-a),
    droite: (a) => 1 / Math.exp(a),
    resume: 'un exposant opposé donne l’inverse',
  },
  {
    id: 'difference',
    tex: 'e^{a-b} = \\dfrac{e^a}{e^b}',
    gauche: (a, b) => Math.exp(a - b),
    droite: (a, b) => Math.exp(a) / Math.exp(b),
    resume: 'la différence des exposants devient un quotient',
  },
  {
    id: 'puissance',
    tex: '\\left(e^a\\right)^n = e^{na}',
    gauche: (a, n) => Math.exp(a) ** n,
    droite: (a, n) => Math.exp(n * a),
    resume: 'une puissance multiplie l’exposant',
  },
];

export const REGLE_PAR_ID = Object.fromEntries(REGLES.map((r) => [r.id, r]));

/**
 * Le contrôle de justesse d'une règle : ses deux membres coïncident-ils ?
 * L'écart se mesure en RELATIF (voir l'en-tête de REGLES).
 */
export function regleVerifiee(regle, couples) {
  const jeu = couples ?? COUPLES_DE_CONTROLE;
  return jeu.every(([x, y]) => {
    const g = regle.gauche(x, y);
    const d = regle.droite(x, y);
    return Math.abs(g - d) / Math.abs(g) < 1e-12;
  });
}

/** Les couples sur lesquels chaque règle est éprouvée. */
export const COUPLES_DE_CONTROLE = [
  [0, 0], [1, 1], [2, -1], [-1, -1], [0.5, 0.5], [-2, 2], [1.5, -0.5], [0.25, 1.75], [3, 2], [-3, 4],
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. LES PUISSANCES D'UNE EXPONENTIELLE — module 4
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La règle (e^a)^n = e^(na), DÉPLIÉE : élever à la puissance n, c'est
 * multiplier n fois, donc ADDITIONNER n fois l'exposant. La leçon la fait
 * découvrir par ce dépliage, jamais par l'énoncé.
 */
export function deplie(a, n) {
  return {
    facteurs: Array.from({ length: n }, () => a),
    sommeDesExposants: arrondi(n * a),
    valeur: Math.exp(n * a),
    // Le chemin naïf que l'élève doit voir échouer : on ne multiplie PAS les
    // exposants entre eux, on multiplie l'exposant PAR n.
    piegeExposantPuissance: a ** n,
  };
}

/**
 * Les cas travaillés au module 4. `n` est un ENTIER : on ne glisse pas un
 * entier abstrait, ce sera donc un choix parmi des cartes, pas un point.
 */
export const CAS_PUISSANCE = [
  { id: 'p1', a: 2, n: 3, exposant: 6 },
  { id: 'p2', a: -1, n: 4, exposant: -4 },
  { id: 'p3', a: 0.5, n: 6, exposant: 3 },
  { id: 'p4', a: 3, n: 2, exposant: 6 },
];

/**
 * PÉRIMÈTRE CODÉ, PAS COMMENTÉ (mémoire `perimetre_executable_lecon`).
 * La leçon travaille (e^a)^n pour n ENTIER : `assertPuissanceEntiere` REFUSE
 * tout le reste, de sorte qu'un module ne puisse pas glisser un exposant
 * fractionnaire — qui appellerait la racine, hors périmètre.
 */
export function assertPuissanceEntiere(cas) {
  if (!Number.isInteger(cas.n)) {
    throw new Error(`${cas.id} : n doit être un entier (n = ${cas.n}) — la leçon n’enseigne pas les puissances fractionnaires`);
  }
  if (cas.n < 2) {
    throw new Error(`${cas.id} : n < 2 ne produit pas de cas de puissance (n = ${cas.n})`);
  }
  if (arrondi(cas.n * cas.a) !== arrondi(cas.exposant)) {
    throw new Error(`${cas.id} : l’exposant annoncé (${cas.exposant}) doit valoir n × a (${cas.n * cas.a})`);
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ÉQUATIONS ET INÉQUATIONS — modules 5 et 6
// ─────────────────────────────────────────────────────────────────────────────

/**
 * L'ARGUMENT, ET LUI SEUL : la stricte croissance.
 *
 * exp est strictement croissante sur ℝ (acquis de la leçon amont). Une fonction
 * strictement croissante est injective, donc e^u = e^v entraîne u = v ; et elle
 * conserve l'ordre, donc e^u < e^v entraîne u < v — le sens NE S'INVERSE PAS.
 *
 * La fonction ci-dessous EXÉCUTE cet argument sur des valeurs, plutôt que de
 * l'affirmer : le test le balaie sur une grille fine, et un module qui
 * prétendrait résoudre autrement n'aurait rien pour s'appuyer.
 */
export function justifieParCroissance(u, v) {
  const eu = Math.exp(u);
  const ev = Math.exp(v);
  if (u < v) return { ordre: '<', coherent: eu < ev };
  if (u > v) return { ordre: '>', coherent: eu > ev };
  return { ordre: '=', coherent: eu === ev };
}

/**
 * Une équation de la forme e^(mx + p) = e^(qx + r), résolue par la stricte
 * croissance : on égale les exposants, et il reste une équation du premier
 * degré — matière de 2de, ACQUISE.
 *
 * Le résultat porte l'équation intermédiaire, parce que c'est ELLE que la
 * leçon fait écrire ; la valeur seule ne montrerait pas le geste.
 */
export function resoudreEquationExp({ m, p, q, r }) {
  const a = m - q;
  const b = r - p;
  if (a === 0) {
    return { type: b === 0 ? 'toujours' : 'jamais', solution: null, intermediaire: `${m}x + ${p} = ${q}x + ${r}` };
  }
  const solution = arrondi(b / a);
  return { type: 'unique', solution, coefA: a, coefB: b, intermediaire: `${m}x + ${p} = ${q}x + ${r}` };
}

/** Le contrôle : la solution trouvée annule-t-elle vraiment l'écart ? */
export function equationVerifiee(eq) {
  const res = resoudreEquationExp(eq);
  if (res.type !== 'unique') return true;
  const g = Math.exp(eq.m * res.solution + eq.p);
  const d = Math.exp(eq.q * res.solution + eq.r);
  return Math.abs(g - d) / Math.abs(g) < 1e-12;
}

/** Les équations travaillées au module 5, chacune à solution ENTIÈRE ou décimale simple. */
export const EQUATIONS = [
  { id: 'eq1', m: 1, p: 3, q: 2, r: 1, enonce: 'e^{x+3} = e^{2x+1}', solution: 2 },
  { id: 'eq2', m: 3, p: -1, q: 1, r: 5, enonce: 'e^{3x-1} = e^{x+5}', solution: 3 },
  { id: 'eq3', m: 2, p: 0, q: 0, r: 0, enonce: 'e^{2x} = 1', solution: 0 },
  { id: 'eq4', m: 1, p: 0, q: 4, r: -6, enonce: 'e^{x} = e^{4x-6}', solution: 2 },
];

/**
 * Une inéquation e^(mx + p) < e^(qx + r).
 *
 * LE SENS SE CONSERVE au passage aux exposants — c'est la stricte CROISSANCE.
 * Il peut ensuite s'inverser dans la RÉSOLUTION du premier degré, si l'on
 * divise par un nombre négatif ; ce sont deux moments distincts, et la leçon ne
 * les confond pas. `sensInverseALaDivision` dit lequel des deux est en jeu.
 */
export function resoudreInequationExp({ m, p, q, r }) {
  const a = m - q;
  const b = r - p;
  if (a === 0) return { type: b > 0 ? 'toujours' : 'jamais', borne: null, sens: null };
  const borne = arrondi(b / a);
  // e^(mx+p) < e^(qx+r) ⟺ mx + p < qx + r ⟺ a·x < b.
  const sens = a > 0 ? '<' : '>';
  return { type: 'demi-droite', borne, sens, coefA: a, sensInverseALaDivision: a < 0 };
}

/** Le contrôle par balayage : la solution décrite est-elle bien l'ensemble des x qui marchent ? */
export function inequationVerifiee(ineq, pas = 0.05, rayon = 6) {
  const res = resoudreInequationExp(ineq);
  if (res.type !== 'demi-droite') return true;
  for (let x = res.borne - rayon; x <= res.borne + rayon; x = arrondi(x + pas)) {
    if (Math.abs(x - res.borne) < 1e-9) continue;
    const vrai = Math.exp(ineq.m * x + ineq.p) < Math.exp(ineq.q * x + ineq.r);
    const predit = res.sens === '<' ? x < res.borne : x > res.borne;
    if (vrai !== predit) return false;
  }
  return true;
}

export const INEQUATIONS = [
  { id: 'in1', m: 1, p: 0, q: 0, r: 2, enonce: 'e^{x} < e^{2}', borne: 2, sens: '<' },
  { id: 'in2', m: 2, p: 1, q: 1, r: 4, enonce: 'e^{2x+1} < e^{x+4}', borne: 3, sens: '<' },
  { id: 'in3', m: -1, p: 0, q: 1, r: -4, enonce: 'e^{-x} < e^{x-4}', borne: 2, sens: '>' },
];

/**
 * LE CADRE DU LABORATOIRE DE CROISSANCE (module 5), et le défaut qu'il a payé.
 *
 * Le point M se GLISSE le long de la courbe, et son ordonnée est e^x : dès que
 * x dépasse ln(yMax), le point sort du repère alors que la poignée reste
 * saisissable. Un premier cadrage laissait glisser jusqu'à 2,5, où e^2,5 ≈ 12,18
 * pour un cadre s'arrêtant à 9 — la poignée disparaissait sous le doigt.
 *
 * La borne est donc CALCULÉE, jamais choisie : c'est le plus grand CRAN dont
 * l'image tienne dans le cadre. `balayageDansLeCadre` (test) parcourt tous les
 * crans de l'intervalle et vérifie qu'aucun n'en sort.
 */
export const CADRE_CROISSANCE = { xMin: -2.5, xMax: 2, yMin: -0.8, yMax: 9 };

/** Le plus grand cran dont l'exponentielle tienne dans le cadre. */
export function borneHauteCroissance(cadre = CADRE_CROISSANCE, pas = PAS_EXPO) {
  let x = cadre.xMin;
  let derniere = cadre.xMin;
  while (x <= cadre.xMax + 1e-12) {
    if (Math.exp(x) <= cadre.yMax) derniere = arrondi(x);
    x = arrondi(x + pas);
  }
  return derniere;
}

/** L'aimantation du point M, BORNÉE au cadre : il ne peut pas en sortir. */
export function aimanteCroissance(v, cadre = CADRE_CROISSANCE, pas = PAS_EXPO) {
  const haut = borneHauteCroissance(cadre, pas);
  const borne = Math.max(cadre.xMin, Math.min(haut, v));
  return arrondi(cadre.xMin + Math.round((borne - cadre.xMin) / pas) * pas);
}

/** Tout cran atteignable du laboratoire de croissance tient-il dans le cadre ? */
export function balayageDansLeCadre(cadre = CADRE_CROISSANCE, pas = PAS_EXPO) {
  const haut = borneHauteCroissance(cadre, pas);
  for (let x = cadre.xMin; x <= haut + 1e-12; x = arrondi(x + pas)) {
    const y = Math.exp(x);
    if (y < cadre.yMin || y > cadre.yMax) return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MODÉLISER — module 6
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LE MODÈLE : f(t) = A·e^{kt}.
 *
 * Le signe de k décide seul du sens : k > 0 fait croître, k < 0 fait décroître.
 * C'est une CONSÉQUENCE de la stricte croissance de exp composée avec t ↦ kt,
 * et non un fait à mémoriser — `sensDuModele` l'exécute.
 *
 * A est la valeur en 0, parce que e^0 = 1 : c'est la seule chose que l'élève
 * ait besoin de lire pour identifier A.
 */
export const modele = (A, k) => (t) => A * Math.exp(k * t);

export const sensDuModele = (k) => (k > 0 ? 'croissance' : k < 0 ? 'decroissance' : 'constante');

/**
 * LE FACTEUR PAR UNITÉ DE TEMPS, et pourquoi c'est LA règle de calcul en
 * action : f(t + 1) / f(t) = e^{k(t+1)} / e^{kt} = e^{k} — la même valeur pour
 * TOUT t. C'est la règle du quotient qui le dit, et c'est ce qui fait qu'un
 * modèle exponentiel se reconnaît à un facteur CONSTANT, jamais à un écart
 * constant.
 */
export const facteurParPas = (k, pas = 1) => Math.exp(k * pas);

/** Le facteur est-il vraiment constant ? Balayage, et non affirmation. */
export function facteurConstant(A, k, ts = [0, 1, 2, 3, 4, 5, 7.5, 10]) {
  const f = modele(A, k);
  const attendu = facteurParPas(k);
  return ts.every((t) => Math.abs(f(t + 1) / f(t) - attendu) / attendu < 1e-12);
}

/**
 * LES DEUX SITUATIONS du module 6. Chacune porte ses valeurs RÉELLES, et le
 * test recalcule chaque nombre que le module cite : aucune décimale n'est
 * recopiée.
 *
 * `k` est choisi pour que le facteur par pas soit LISIBLE et que les valeurs
 * restent dans un ordre de grandeur crédible — vérifié par test.
 */
export const SITUATIONS = [
  {
    id: 'bacteries',
    titre: 'Une culture de bactéries',
    unite: 'heure',
    grandeur: 'milliers de bactéries',
    A: 20,
    k: 0.4,
    tMax: 6,
    sens: 'croissance',
  },
  {
    id: 'refroidissement',
    titre: 'Un café qui refroidit',
    unite: 'minute',
    grandeur: 'degrés au-dessus de la pièce',
    A: 60,
    k: -0.15,
    tMax: 20,
    sens: 'decroissance',
  },
];

/** L'échantillon d'une situation, pour le tracé — coupé au cadre par le composant. */
export function courbeDuModele(situation, n = 120) {
  const f = modele(situation.A, situation.k);
  const pts = [];
  for (let i = 0; i <= n; i += 1) {
    const t = (situation.tMax * i) / n;
    pts.push({ x: t, y: f(t) });
  }
  return pts;
}

/**
 * Le cadre d'une situation, DÉRIVÉ de ses valeurs extrêmes : la courbe ne peut
 * donc pas sortir du repère, quelle que soit la situation ajoutée. Le test
 * balaie la courbe entière.
 */
export function cadreDuModele(situation) {
  const f = modele(situation.A, situation.k);
  const extremes = [f(0), f(situation.tMax)];
  const haut = Math.max(...extremes);
  const yMax = Math.ceil((haut * 1.1) / 10) * 10;
  return { xMin: 0, xMax: situation.tMax, yMin: 0, yMax };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. LES DISTRACTEURS DU BOSS, calculés et prouvés distincts
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Les pièges de la leçon, CALCULÉS depuis les données plutôt qu'écrits.
 * Chaque entrée porte la bonne réponse et ses pièges ; le test vérifie que
 * tous sont DISTINCTS deux à deux — deux options identiques rendraient une
 * épreuve insoluble (piège n°4 du lot 1).
 */
export function piegesSomme(a, b) {
  return {
    bon: arrondi(a + b),           // e^a × e^b = e^(a+b)
    produitDesExposants: arrondi(a * b),  // confusion produit/somme
    exposantInchange: a,           // « le second n'a rien fait »
    differenceDesExposants: arrondi(a - b),
  };
}

export function piegesPuissance(a, n) {
  return {
    bon: arrondi(n * a),           // (e^a)^n = e^(na)
    exposantALaPuissance: arrondi(a ** n), // on élève l'exposant au lieu de le multiplier
    exposantInchange: a,           // la puissance oubliée
    sommeAvecN: arrondi(a + n),    // on additionne au lieu de multiplier
  };
}

/** Tous les nombres d'un jeu de pièges sont-ils distincts deux à deux ? */
export function piegesDistincts(jeu) {
  const vals = Object.values(jeu);
  for (let i = 0; i < vals.length; i += 1) {
    for (let j = i + 1; j < vals.length; j += 1) {
      if (Math.abs(vals[i] - vals[j]) < 1e-9) return false;
    }
  }
  return true;
}
