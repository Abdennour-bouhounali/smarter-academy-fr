/**
 * Le modèle mathématique de « Variables aléatoires : dispersion et loi binomiale ».
 *
 * Tout ce que les modules affichent en est DÉRIVÉ : aucune variance, aucun écart
 * type, aucune probabilité n'est écrite à la main dans un module. Les lois
 * viennent d'EFFECTIFS entiers (`lawFromCounts` du noyau partagé), jamais de
 * décimaux saisis — c'est la seule façon d'avoir Σp = 1 exactement.
 *
 * LE SEL DE LA LEÇON, ET SA CONTRAINTE DE DONNÉES : les deux jeux du module 1
 * doivent avoir EXACTEMENT la même espérance et des dispersions manifestement
 * opposées. « Exactement » n'est pas une figure de style : si les deux
 * espérances différaient d'un centième, le module 1 affirmerait « l'espérance ne
 * suffit pas à choisir » en montrant deux espérances différentes, et la leçon
 * entière s'effondrerait. Les deux jeux sont donc écrits sur le MÊME
 * dénominateur 10, et l'égalité est un test — pas une intention.
 *
 * PÉRIMÈTRE : la loi de probabilité, le tableau et l'espérance sont ACQUIS
 * (leçon « Variables aléatoires : loi et espérance »). Pas de loi normale, pas
 * d'intervalle de fluctuation, pas de somme de variables aléatoires : Terminale.
 */
import {
  lawFromCounts, expectation, lawStandardDeviation, sampleFromLaw, tally,
  empiricalMean, probabilitySum, makeRng,
  binomialCoeff, binomialPmf, binomialCdf,
  binomialExpectation, binomialVariance, binomialSd, binomialLaw,
} from '../../../../../common/stats';
import { formatDec, parseDec } from '@smarter-academy/core';

/** Format français des nombres de la leçon : virgule, vrai signe moins. */
export const fr = (n, opts) => formatDec(n, opts);

/** Une somme d'argent, toujours au centime près quand elle n'est pas ronde. */
export const euros = (n) => `${fr(Math.round(n * 1000) / 1000)} €`;

/**
 * PARSE TOLÉRANT AU VRAI SIGNE MOINS.
 *
 * `formatDec` AFFICHE « −1 » avec U+2212 (le vrai signe moins typographique),
 * l'élève le recopie au copier-coller… et `parseDec` le refuse, parce que son
 * expression régulière n'accepte que le trait d'union ASCII. Trois agents du
 * lot 1 ont payé ce piège. On normalise donc U+2212 (−), U+2013 (–) et U+2014
 * (—) en « - » avant de déléguer. Testé dans dispersionUtils.test.js.
 */
export function parseSigned(str) {
  if (typeof str !== 'string') return parseDec(str);
  return parseDec(str.replace(/[−–—]/g, '-'));
}

/* ── Les deux jeux du module 1 ───────────────────────────────────── */

/**
 * DEUX JEUX, LA MÊME ESPÉRANCE, DES DISPERSIONS OPPOSÉES.
 *
 * « Le Régulier » : on gagne à chaque partie, 1 €, 2 € ou 3 €.
 * « Le Jackpot »  : neuf fois sur dix on ne gagne rien, une fois sur dix 20 €.
 *
 * Effectifs sur 10 pour les deux — même dénominateur, comparaison directe,
 * aucun arrondi. Espérance commune : (4×1 + 2×2 + 4×3)/10 = 20/10 = 2 € d'un
 * côté, (9×0 + 1×20)/10 = 20/10 = 2 € de l'autre. Rigoureusement le même
 * nombre, écrit avec les mêmes entiers.
 *
 * Variances : 0,8 pour le Régulier contre 36 pour le Jackpot — un rapport de
 * 45. Écarts types : environ 0,89 € contre exactement 6 €. La différence est
 * visible à l'œil nu sur deux nuages de points, et c'est tout l'objet du
 * module 1.
 */
export const JEU_REGULIER = {
  id: 'regulier',
  nom: 'Le Régulier',
  emoji: '🐢',
  couleur: '#0f766e',
  resume: 'on gagne à chaque partie, mais jamais gros',
  counts: [{ x: 1, n: 4 }, { x: 2, n: 2 }, { x: 3, n: 4 }],
};

export const JEU_JACKPOT = {
  id: 'jackpot',
  nom: 'Le Jackpot',
  emoji: '💥',
  couleur: '#be123c',
  resume: 'presque toujours rien, et parfois beaucoup',
  counts: [{ x: 0, n: 9 }, { x: 20, n: 1 }],
};

export const JEUX = [JEU_REGULIER, JEU_JACKPOT];

/**
 * LE SEUL JEU ÉTIRABLE : « Le Régulier ».
 *
 * DÉFAUT ATTRAPÉ PAR LE TEST, et corrigé par une décision de CONCEPTION plutôt
 * que par une tolérance. L'étirement x ↦ m + k(x − m) préserve l'espérance par
 * ALGÈBRE, mais pas toujours au bit près : sur le Jackpot au cran 1,5, les
 * valeurs −1 et 29 pondérées par 9/10 et 1/10 rendent 2,000 000 000 000 000 4,
 * parce que ni 0,9 ni 0,1 n'a de développement binaire fini. Sur le Régulier,
 * les valeurs restent symétriques autour de 2 et les écarts opposés s'annulent
 * exactement : l'égalité tient au bit près à TOUS les crans.
 *
 * Le module 3 affirme « l'écart type bouge, l'espérance NE BOUGE PAS ». Cette
 * phrase ne doit pas être approximativement vraie ; le réglage ne porte donc
 * que sur le jeu où elle l'est exactement. Le Jackpot reste affiché à côté,
 * fixe, comme terme de comparaison.
 */
export const JEU_ETIRABLE = JEU_REGULIER;

/** La loi d'un jeu : [{ x, p, n, total }], triée par gain croissant, Σp = 1 exact. */
export const loiDuJeu = (jeu) => lawFromCounts(jeu.counts);

/** L'espérance d'un jeu — 2 € pour les deux, et le test le VÉRIFIE. */
export const esperanceDuJeu = (jeu) => expectation(loiDuJeu(jeu));

/**
 * La variance d'une loi : moyenne des CARRÉS DES ÉCARTS à l'espérance.
 *
 *     V(X) = Σ pᵢ (xᵢ − E(X))²
 *
 * On ne réécrit pas la somme : `weightedVariance` de statsUtils fait déjà
 * exactement ce calcul sur des couples (valeur, poids) — ici les poids sont les
 * probabilités, dont la somme vaut 1, si bien que la division par le total est
 * une division par 1. Une seule définition de la variance pondérée dans tout le
 * projet, et le test vérifie qu'elle coïncide avec la somme écrite à la main.
 *
 * NOTE D'IMPLÉMENTATION : `lawStandardDeviation` du noyau partagé calcule déjà
 * √V ; la variance s'en déduit par élévation au carré, mais on la calcule
 * DIRECTEMENT — un carré de racine réintroduit une erreur d'arrondi sur un
 * nombre que la leçon affiche à l'élève (0,7999999999999999 au lieu de 0,8).
 */
export function varianceDeLaLoi(loi) {
  const e = expectation(loi);
  return loi.reduce((acc, r) => acc + r.p * (r.x - e) ** 2, 0);
}

/** L'écart type d'une loi : la racine carrée de la variance. */
export const ecartTypeDeLaLoi = (loi) => Math.sqrt(varianceDeLaLoi(loi));

export const varianceDuJeu = (jeu) => varianceDeLaLoi(loiDuJeu(jeu));
export const ecartTypeDuJeu = (jeu) => ecartTypeDeLaLoi(loiDuJeu(jeu));

/**
 * Le DÉTAIL du calcul de la variance, ligne par ligne — ce que le module 2 fait
 * construire par l'élève, et jamais réciter. Chaque ligne porte les quatre
 * nombres du tableau : la valeur, sa probabilité, son écart à l'espérance, le
 * carré de cet écart, et la contribution p × écart².
 */
export function detailVariance(loi) {
  const e = expectation(loi);
  return loi.map((r) => ({
    x: r.x,
    p: r.p,
    n: r.n,
    total: r.total,
    ecart: r.x - e,
    carre: (r.x - e) ** 2,
    contribution: r.p * (r.x - e) ** 2,
  }));
}

/* ── L'ÉTIREMENT : la dispersion bouge, l'espérance NE BOUGE PAS ─── */

/**
 * LES CRANS DE L'ÉTIREMENT — un cliquet, jamais un curseur : chaque coefficient
 * doit être exactement atteignable, et chaque loi étirée doit rester lisible.
 *
 * Pourquoi ces huit-là : k = 1 est le jeu d'origine, et il DOIT figurer dans la
 * liste — sinon l'élève ne peut pas revenir à ce qu'il vient de voir. k = 2 est
 * le maximum, parce qu'au-delà la plus petite valeur deviendrait négative
 * (« gagner −1 € ») : le jeu cesserait d'en être un et la figure demanderait une
 * lecture de perte que la leçon n'enseigne pas. En dessous de 1/4, les trois
 * valeurs se collent à moins de 0,50 € et le nuage devient illisible.
 *
 * Toutes les valeurs étirées de JEU_REGULIER restent des quarts d'euro exacts,
 * donc affichables sans arrondi.
 */
export const CRANS_ETIREMENT = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/** Le cran de départ : 1, c'est-à-dire le jeu tel quel. */
export const CRAN_DEFAUT = 1;

/**
 * ÉTIRER une loi autour de sa propre espérance, sans la déplacer :
 *
 *     x  ↦  m + k (x − m)      avec m = E(X)
 *
 * C'est la SEULE construction qui garantit l'invariance de l'espérance au bit
 * près, et elle la garantit par ALGÈBRE, pas par arrondi :
 *
 *     E(m + k(X − m)) = m + k (E(X) − m) = m + k × 0 = m.
 *
 * Un étirement écrit autrement — multiplier les valeurs par k, ou ajouter ±k
 * aux extrêmes — déplacerait l'espérance, et le module affirmerait « regarde,
 * elle ne bouge pas » en montrant qu'elle bouge. Le balayage de TOUS les crans
 * est un test, et il compare à l'ÉGALITÉ STRICTE, pas à une tolérance.
 *
 * Les effectifs sont conservés tels quels : seule l'échelle des valeurs change,
 * donc Σp reste exactement 1.
 */
export function etirer(jeu, k) {
  const m = esperanceDuJeu(jeu);
  return lawFromCounts(jeu.counts.map((c) => ({ x: m + k * (c.x - m), n: c.n })));
}

/**
 * La loi étirée d'un jeu, à un cran donné. `k = 1` rend la loi d'origine.
 * On passe par `etirer` pour que l'invariance soit prouvée sur le chemin
 * réellement emprunté par l'interface, et pas sur une variante de laboratoire.
 */
export const loiEtiree = (jeu, k = CRAN_DEFAUT) => etirer(jeu, k);

/**
 * L'écart type d'un jeu étiré. Il vaut EXACTEMENT k × σ, ce que le module 3
 * n'affirme pas mais que le test vérifie : c'est ce qui rend l'étirement
 * lisible — doubler le cran double la largeur du nuage.
 */
export const ecartTypeEtire = (jeu, k) => ecartTypeDeLaLoi(loiEtiree(jeu, k));
export const varianceEtiree = (jeu, k) => varianceDeLaLoi(loiEtiree(jeu, k));

/* ── La simulation des deux jeux ─────────────────────────────────── */

/** Nombre de parties simulées par jeu au module 1. */
export const N_PARTIES = 200;

/**
 * La graine d'une session.
 *
 * L'ALÉA EST INJECTÉ, JAMAIS TIRÉ DANS LE RENDU. Un élève qui ouvre le module
 * doit voir deux séries qui ne sont pas toujours les mêmes ; la graine mêle donc
 * un littéral à l'horloge. Un test ou un script Playwright qui a besoin d'une
 * suite rejouable fixe `window.__SMARTER_RNG_SEED` AVANT le chargement : la
 * graine redevient purement déterministe. Aucun `Math.random`.
 */
export const GRAINE_BASE = 20260911;

export function sessionSeed(base = GRAINE_BASE) {
  if (typeof window !== 'undefined' && Number.isFinite(window.__SMARTER_RNG_SEED)) {
    return base + window.__SMARTER_RNG_SEED;
  }
  return (base + (Date.now() % 2147483647)) % 2147483647 || base;
}

/**
 * Une série de `n` parties d'un jeu : les gains tirés, leur répartition, la
 * moyenne observée, et l'espérance. `rng` est INJECTÉ — la fonction ne fabrique
 * aucun aléa.
 */
export function serieDeParties(loi, n, rng) {
  const tirages = sampleFromLaw(loi, n, rng);
  return {
    n,
    tirages,
    lignes: tally(loi, tirages),
    moyenne: empiricalMean(tirages),
    esperance: expectation(loi),
    etendue: Math.max(...tirages) - Math.min(...tirages),
  };
}

/**
 * L'écart maximal ADMIS entre la moyenne observée et l'espérance, pour une
 * série de `n` parties.
 *
 * Le seuil se déclare en σ/√n et NON en euros fixes : le Jackpot a un écart type
 * six fois plus grand que le Régulier, donc une moyenne empirique six fois plus
 * dispersée — c'est le CONTENU de la leçon, pas un défaut à masquer. 5 σ/√n est
 * la borne balayée par le test sur 2 000 graines.
 */
export const MARGE_SIGMAS = 5;

export const margeAdmise = (loi, n = N_PARTIES) =>
  MARGE_SIGMAS * (ecartTypeDeLaLoi(loi) / Math.sqrt(n));

/* ── Le schéma de Bernoulli et la loi binomiale (modules 4 et 5) ── */

/**
 * L'ÉPREUVE DE BERNOULLI du module 4 : un contrôle qualité.
 *
 * Une ampoule prise au hasard en fin de chaîne est défectueuse avec la
 * probabilité 0,4 — deux issues, et deux seulement. La probabilité est
 * volontairement GRANDE (0,4 et non 0,02) : à 0,02, cinq ampoules ne donnent
 * presque jamais deux défauts, l'arbre du module 5 aurait des branches
 * invisibles, et l'élève ne verrait jamais l'événement dont on calcule la
 * probabilité.
 */
export const EPREUVE = {
  id: 'ampoule',
  contexte: 'une ampoule prise au hasard en fin de chaîne',
  succes: 'défectueuse',
  echec: 'conforme',
  p: 0.4,
};

/** La loi d'une épreuve de Bernoulli : 1 pour un succès, 0 pour un échec. */
export const loiDeBernoulli = (p = EPREUVE.p) =>
  lawFromCounts([{ x: 0, n: Math.round((1 - p) * 10) }, { x: 1, n: Math.round(p * 10) }]);

/**
 * LA RÉPÉTITION du module 5 : on prélève CINQ ampoules, indépendamment.
 *
 * n = 5 et p = 0,4 : les six probabilités sont des décimaux EXACTS à cinq
 * chiffres (0,07776 · 0,2592 · 0,3456 · 0,2304 · 0,0768 · 0,01024), l'espérance
 * vaut 2 exactement — le même 2 que les deux jeux du module 1, ce qui n'est pas
 * un hasard mais un fil conducteur — et la variance vaut 1,2, DIFFÉRENTE des
 * 0,8 du Régulier pour qu'aucune coïncidence numérique ne laisse croire à un
 * lien qui n'existe pas.
 */
export const N_PRELEVEES = 5;

export const LOI_BINOMIALE = () => binomialLaw(N_PRELEVEES, EPREUVE.p);

/** Les six probabilités de la loi binomiale de la leçon, dans l'ordre de k. */
export const probasBinomiales = (n = N_PRELEVEES, p = EPREUVE.p) =>
  Array.from({ length: n + 1 }, (_, k) => binomialPmf(n, k, p));

/**
 * LES QUATRE SITUATIONS À TRIER du module 5, étape « reconnaître ».
 *
 * Trois des quatre conditions d'un schéma de Bernoulli répété peuvent tomber
 * séparément : l'indépendance (tirage sans remise), le nombre fixé de
 * répétitions (on s'arrête au premier succès), les deux issues (trois
 * catégories). Chaque situation en casse UNE et une seule — sinon l'élève ne
 * saurait pas laquelle il vient de reconnaître.
 */
export const SITUATIONS = [
  {
    id: 'des',
    label: 'On lance 10 fois un dé équilibré et l’on compte les 6 obtenus.',
    binomiale: true,
    raison: 'Dix répétitions fixées d’avance, deux issues à chaque lancer (6 ou pas 6), et un lancer n’influence pas le suivant.',
  },
  {
    id: 'sans-remise',
    label: 'Une urne contient 3 boules rouges et 7 vertes. On en tire 4 SANS remise et l’on compte les rouges.',
    binomiale: false,
    raison: 'Les tirages ne sont pas indépendants : sortir une rouge change la composition de l’urne, donc la probabilité du tirage suivant.',
    condition: 'indépendance',
  },
  {
    id: 'jusqu-au-premier',
    label: 'On lance une pièce jusqu’à obtenir le premier pile, et l’on compte les lancers.',
    binomiale: false,
    raison: 'Le nombre de répétitions n’est pas fixé d’avance : il dépend du résultat. On ne sait pas combien de lancers on fera.',
    condition: 'nombre de répétitions fixé',
  },
  {
    id: 'trois-issues',
    label: 'On interroge 20 personnes au hasard qui répondent « oui », « non » ou « sans avis », et l’on note les trois effectifs.',
    binomiale: false,
    raison: 'Chaque épreuve a TROIS issues, pas deux. Il faudrait regrouper « non » et « sans avis » pour retrouver deux issues.',
    condition: 'deux issues',
  },
];

/* ── Le laboratoire de modélisation du module 6 ──────────────────── */

/**
 * LA SITUATION À MODÉLISER : un livreur fait 4 tournées ; à chaque tournée il
 * est en retard avec la probabilité 0,25, indépendamment des autres.
 *
 * n = 4 et p = 0,25 : l'énoncé donne les deux paramètres SANS les nommer, et
 * c'est l'élève qui doit dire lesquels sont n et p — le geste de modélisation.
 * E = 1 retard sur 4 tournées, un nombre qui se raconte en une phrase.
 */
export const LIVREUR = { n: 4, p: 0.25, contexte: 'tournée', succes: 'en retard' };

export const loiDuLivreur = () => binomialLaw(LIVREUR.n, LIVREUR.p);

/* ── Réexports utiles aux modules ────────────────────────────────── */

export {
  expectation, lawStandardDeviation, probabilitySum, makeRng,
  binomialCoeff, binomialPmf, binomialCdf,
  binomialExpectation, binomialVariance, binomialSd, binomialLaw,
};
