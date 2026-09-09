/**
 * Le modèle mathématique de « Variables aléatoires : loi et espérance ».
 *
 * Tout ce que les modules affichent en est DÉRIVÉ : aucune espérance, aucune
 * probabilité, aucun effectif n'est écrit à la main dans un module. Les lois
 * viennent d'EFFECTIFS entiers (`lawFromCounts` du noyau partagé), jamais de
 * décimaux saisis — c'est la seule façon d'avoir Σp = 1 exactement.
 *
 * LE SEL DE LA LEÇON, ET SA CONTRAINTE DE DONNÉES : l'espérance ne doit être
 * AUCUNE valeur atteignable de la roue. Gagner « 1,40 € en moyenne » à une roue
 * qui ne paie que 0, 1 ou 5 € est exactement ce qui rend l'espérance
 * intéressante — et un jeu de gains où E tomberait sur une valeur possible
 * viderait le module 4 de son propos. Le balayage est un TEST.
 */
import { lawFromCounts, expectation, expectationIsAttainable, expectedProfit, isFairGame, lawStandardDeviation, sampleFromLaw, tally, empiricalMean, probabilitySum } from '../../../../../common/stats';
import { formatDec } from '@smarter-academy/core';

/** Format français des nombres de la leçon : virgule, vrai signe moins. */
export const fr = (n, opts) => formatDec(n, opts);

/** Une somme d'argent, toujours à deux décimales quand elle n'est pas ronde. */
export const euros = (n) => `${fr(Math.round(n * 100) / 100)} €`;

/* ── La roue de loterie ──────────────────────────────────────────── */

/**
 * LA ROUE : dix secteurs de même taille, donc dix issues équiprobables.
 * Quatre ne paient rien, quatre paient 1 €, deux paient le GROS LOT.
 *
 * Pourquoi dix secteurs égaux : la probabilité de chaque gain est alors une
 * fraction de dénominateur 10, l'élève la LIT sur la roue (« 4 secteurs sur
 * 10 »), et la somme fait exactement 1 sans arrondi.
 */
export const SECTEURS = [
  { id: 's0', gain: 0, effectif: 4, couleur: '#94a3b8', label: 'rien' },
  { id: 's1', gain: 1, effectif: 4, couleur: '#38bdf8', label: 'petit lot' },
  { id: 'sJ', gain: null, effectif: 2, couleur: '#f59e0b', label: 'gros lot' },
];

export const NB_SECTEURS = SECTEURS.reduce((a, s) => a + s.effectif, 0);   // 10

/**
 * Les crans du GROS LOT — un cliquet, jamais un curseur : chaque valeur doit
 * être exactement atteignable, et chacune doit garder l'espérance HORS des
 * gains possibles.
 *
 * 3 € EST EXCLU À DESSEIN : il donnerait E = (4×0 + 4×1 + 2×3)/10 = 1 €, soit
 * exactement le petit lot. Le module 1 affirmerait alors « la ligne tombe sur
 * une valeur que la roue ne donne jamais » en montrant le contraire. Le
 * balayage de cette liste est un test.
 */
export const GROS_LOTS = [4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Le gros lot de départ : 5 €, celui dont l'espérance vaut 1,40 €. */
export const GROS_LOT_DEFAUT = 5;

/** Les trois gains effectifs de la roue pour un gros lot donné. */
export const gainsDeLaRoue = (grosLot = GROS_LOT_DEFAUT) =>
  SECTEURS.map((s) => (s.gain === null ? grosLot : s.gain));

/** La roue, secteur par secteur, gros lot résolu — ce que dessine WheelLab. */
export const secteursDeLaRoue = (grosLot = GROS_LOT_DEFAUT) =>
  SECTEURS.map((s) => ({ ...s, gain: s.gain === null ? grosLot : s.gain }));

/**
 * La LOI de la roue : [{ x, p, n, total }], triée par gain croissant.
 * Construite depuis les effectifs de secteurs — Σp = 1 exactement.
 */
export const loiDeLaRoue = (grosLot = GROS_LOT_DEFAUT) =>
  lawFromCounts(secteursDeLaRoue(grosLot).map((s) => ({ x: s.gain, n: s.effectif })));

/** L'espérance de la roue, pour un gros lot donné. E = 0,4 + 0,2 × grosLot. */
export const esperanceDeLaRoue = (grosLot = GROS_LOT_DEFAUT) => expectation(loiDeLaRoue(grosLot));

/** Nombre de tirages de la grande simulation du module 1. */
export const N_SIMULATION = 500;

/**
 * La graine d'une session.
 *
 * L'ALÉA EST INJECTÉ, JAMAIS TIRÉ DANS LE RENDU. Un élève qui ouvre le module
 * doit voir une roue qui ne tombe pas toujours sur la même case ; la graine
 * mêle donc un littéral à l'horloge. Un test ou un script Playwright qui a
 * besoin d'une suite rejouable fixe `window.__SMARTER_RNG_SEED` AVANT le
 * chargement : la graine redevient purement déterministe. Aucun `Math.random`.
 */
export const GRAINE_BASE = 20260910;

export function sessionSeed(base = GRAINE_BASE) {
  if (typeof window !== 'undefined' && Number.isFinite(window.__SMARTER_RNG_SEED)) {
    return base + window.__SMARTER_RNG_SEED;
  }
  return (base + (Date.now() % 2147483647)) % 2147483647 || base;
}

/**
 * L'écart maximal ADMIS entre la moyenne observée et l'espérance, en euros,
 * pour une série de `n` tirages.
 *
 * Le seuil se déclare en σ/√n et NON en euros fixes : sur la même roue, un gros
 * lot trois fois plus élevé triple l'écart typique sans que rien ne soit cassé.
 * 5 σ/√n est la borne mesurée (pire cas observé : 4,80 sur 3 000 graines × les
 * 9 gros lots du cliquet). C'est cette marge, et non une égalité, que la leçon
 * affirme : la moyenne S'APPROCHE de la ligne, elle ne s'y pose jamais.
 */
export const MARGE_SIGMAS = 5;

export const margeAdmise = (loi, n = N_SIMULATION) =>
  MARGE_SIGMAS * (lawStandardDeviation(loi) / Math.sqrt(n));

/* ── Le grand livre ──────────────────────────────────────────────── */

/**
 * Une série de `n` tirages et son GRAND LIVRE : chaque gain possible avec son
 * effectif observé, sa fréquence, sa probabilité — et la moyenne empirique.
 *
 * `rng` est INJECTÉ. La fonction ne fabrique aucun aléa.
 */
export function grandLivre(loi, n, rng) {
  const tirages = sampleFromLaw(loi, n, rng);
  return {
    n,
    tirages,
    lignes: tally(loi, tirages),
    moyenne: empiricalMean(tirages),
    esperance: expectation(loi),
  };
}

/* ── Les deux offres du module 6 ─────────────────────────────────── */

/**
 * DEUX OFFRES À COMPARER, et le piège qu'elles tendent.
 *
 * L'offre « Éclair » a le PLUS GROS lot (20 €) et la plus grosse mise ;
 * l'offre « Régulier » ne dépasse jamais 5 € mais paie plus souvent. L'élève
 * qui choisit au plus gros gain se trompe : c'est l'espérance qui décide.
 *
 * Les effectifs sont sur 10 pour les deux — même dénominateur, comparaison
 * directe, aucun arrondi.
 */
export const OFFRE_ECLAIR = {
  id: 'eclair',
  nom: 'Éclair',
  emoji: '⚡',
  mise: 3,
  counts: [{ x: 0, n: 7 }, { x: 2, n: 2 }, { x: 20, n: 1 }],
};

export const OFFRE_REGULIER = {
  id: 'regulier',
  nom: 'Régulier',
  emoji: '🐢',
  mise: 3,
  counts: [{ x: 1, n: 4 }, { x: 4, n: 4 }, { x: 5, n: 2 }],
};

export const OFFRES = [OFFRE_ECLAIR, OFFRE_REGULIER];

/** La loi d'une offre, et son espérance de gain (avant la mise). */
export const loiDeLOffre = (offre) => lawFromCounts(offre.counts);
export const esperanceDeLOffre = (offre) => expectation(loiDeLOffre(offre));

/** Le bénéfice espéré d'une offre : espérance de gain − mise. */
export const beneficeDeLOffre = (offre) => expectedProfit(loiDeLOffre(offre), offre.mise);

/** L'offre à choisir : celle dont le bénéfice espéré est le plus grand. */
export const meilleureOffre = () =>
  OFFRES.reduce((best, o) => (beneficeDeLOffre(o) > beneficeDeLOffre(best) ? o : best));

/* ── Le jeu du module 5 : la tombola de la fête ──────────────────── */

/**
 * LA TOMBOLA, la situation à interpréter : 200 billets, un lot de 100 €,
 * quatre lots de 20 €, quinze lots de 5 €, le reste ne gagne rien.
 *
 * Effectifs sur 200 : Σp = 1 exactement. E = (100 + 80 + 75)/200 = 1,275 €,
 * une valeur qu'aucun billet ne paie jamais — et un billet vendu 2 € fait donc
 * perdre 0,725 € par billet à long terme.
 */
export const TOMBOLA = {
  prix: 2,
  counts: [
    { x: 0, n: 180 },
    { x: 5, n: 15 },
    { x: 20, n: 4 },
    { x: 100, n: 1 },
  ],
};

export const loiDeLaTombola = () => lawFromCounts(TOMBOLA.counts);
export const esperanceDeLaTombola = () => expectation(loiDeLaTombola());
export const beneficeDeLaTombola = () => expectedProfit(loiDeLaTombola(), TOMBOLA.prix);

/**
 * Ce qu'un organisateur encaisse à long terme sur `n` billets vendus :
 * l'opposé du bénéfice espéré du joueur, multiplié par le nombre de billets.
 * C'est l'INTERPRÉTATION de l'espérance, et elle se calcule, elle ne se devine
 * pas.
 */
export const gainOrganisateur = (n) => -beneficeDeLaTombola() * n;

/* ── Réexports utiles aux modules ────────────────────────────────── */

export { expectation, expectationIsAttainable, expectedProfit, isFairGame, lawStandardDeviation, probabilitySum };
