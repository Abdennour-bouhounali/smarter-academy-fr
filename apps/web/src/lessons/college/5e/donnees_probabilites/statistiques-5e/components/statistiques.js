/**
 * Noyau de calcul de la leçon « Statistiques » (5e) — PUR, sans React.
 *
 * Il repose sur le noyau partagé `common/stats` (mean, weightedMean,
 * frequencyTable, formatNumber…) : la moyenne n'est PAS réimplémentée ici.
 * Ce fichier ajoute seulement ce qui est propre à une enquête de 5e :
 *
 *   · un jeu de données VIVANT (on ajoute, on supprime, on trie) ;
 *   · le tableau d'effectifs et de fréquences qui en découle ;
 *   · la géométrie des deux représentations (barres, secteurs) ;
 *   · le contrôle « la somme des fréquences fait 1 ».
 *
 * PÉRIMÈTRE 5e (objet officiel `5e_statistiques`) — ce fichier n'expose
 * volontairement NI médiane, NI quartile, NI écart type, NI moyenne pondérée
 * par des classes : ce sont les objets de 4e et de 3e. La garde est
 * exécutable, pas commentée : `assertScope5e` lève si on demande un
 * indicateur hors programme (cf. memory « périmètre exécutable »).
 */
import { mean, sum, formatNumber } from '../../../../../common/stats';

/* ── Périmètre exécutable ────────────────────────────────────────── */

/** Indicateurs qui n'appartiennent PAS à la 5e. */
const HORS_PROGRAMME_5E = ['mediane', 'quartile', 'q1', 'q3', 'ecart-type', 'variance', 'etendue-interquartile'];

/**
 * Garde de périmètre. Appelée par les helpers qui pourraient dériver ; elle
 * transforme une erreur d'auteur en échec bruyant au lieu d'une leçon qui
 * enseignerait de la 3e en 5e.
 */
export function assertScope5e(indicator) {
  if (HORS_PROGRAMME_5E.includes(indicator)) {
    throw new Error(
      `[statistiques-5e] « ${indicator} » est hors du programme de 5e : ` +
      `l'objet officiel 5e_statistiques s'arrête à la moyenne simple.`,
    );
  }
  return indicator;
}

/* ── Le jeu de données vivant ────────────────────────────────────── */

/**
 * Une observation = la réponse d'UN élève à la question de l'enquête.
 * `id` est stable : il sert de clé React et permet la suppression ciblée
 * sans dépendre de l'ordre (qui change quand on trie).
 */
let nextId = 0;
export const makeObs = (prenom, valeur) => ({ id: `o${nextId++}`, prenom, valeur });

/**
 * L'enquête de départ : « Combien de livres as-tu lus pendant les vacances ? »
 * 12 élèves — assez pour que le tableau soit utile, assez peu pour que
 * l'élève puisse recompter à la main et vérifier chaque effectif.
 */
export const ENQUETE = {
  question: 'Combien de livres as-tu lus pendant les vacances ?',
  unite: 'livre',
  unitePluriel: 'livres',
  bruts: [
    ['Léa', 3], ['Tom', 1], ['Inès', 2], ['Hugo', 0],
    ['Sarah', 3], ['Malo', 2], ['Jade', 1], ['Noé', 5],
    ['Lina', 2], ['Ethan', 1], ['Camille', 3], ['Yanis', 2],
  ],
};

/** Construit l'état initial du laboratoire : les 12 observations brutes. */
export const datasetInit = () => ENQUETE.bruts.map(([p, v]) => makeObs(p, v));

/* ── Effectifs et fréquences ─────────────────────────────────────── */

/**
 * Le tableau de l'enquête : une ligne par valeur RENCONTRÉE, avec son
 * effectif et sa fréquence.
 *
 * Choix pédagogique : on n'invente pas de ligne d'effectif 0. Une valeur qui
 * n'a été donnée par personne n'a pas à figurer dans le tableau d'une enquête
 * de 5e — l'élève compte ce qu'il a récolté, il ne remplit pas une grille.
 *
 * → [{ valeur, effectif, frequence, pourcentage, angle }]
 */
export function tableau(observations) {
  const total = observations.length;
  const counts = new Map();
  for (const o of observations) counts.set(o.valeur, (counts.get(o.valeur) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([valeur, effectif]) => ({
      valeur,
      effectif,
      frequence: total === 0 ? 0 : effectif / total,
      pourcentage: total === 0 ? 0 : (effectif / total) * 100,
      // L'angle du secteur : la fréquence appliquée au tour complet. C'est
      // exactement le geste de proportionnalité de la 5e — 360 est le
      // « total » du disque comme `total` est celui de l'effectif.
      angle: total === 0 ? 0 : (effectif / total) * 360,
    }));
}

/** Effectif total = le nombre d'élèves interrogés. */
export const effectifTotal = (observations) => observations.length;

/**
 * La moyenne de la série, déléguée au noyau partagé.
 * `null` sur une série vide — jamais NaN, jamais 0 (0 serait un mensonge :
 * « zéro livre en moyenne » n'est pas « personne n'a répondu »).
 */
export const moyenne = (observations) => mean(observations.map((o) => o.valeur));

/**
 * La moyenne relue comme un partage équitable : total des livres ÷ nombre
 * d'élèves. C'est la DÉFINITION que le module de découverte fait construire,
 * avant que le mot « moyenne » ne soit prononcé.
 */
export function partageEquitable(observations) {
  const totalLivres = sum(observations.map((o) => o.valeur));
  const nb = observations.length;
  return { totalLivres, nb, part: nb === 0 ? null : totalLivres / nb };
}

/**
 * Contrôle exécutable : la somme des effectifs vaut l'effectif total, et la
 * somme des fréquences vaut 1. Le module de vérification l'AFFICHE — ce n'est
 * pas une assertion cachée, c'est la preuve que l'élève regarde.
 */
export function controle(observations) {
  const lignes = tableau(observations);
  const sommeEffectifs = sum(lignes.map((l) => l.effectif));
  const sommeFrequences = sum(lignes.map((l) => l.frequence));
  return {
    sommeEffectifs,
    total: observations.length,
    effectifsOk: sommeEffectifs === observations.length,
    sommeFrequences,
    // Comparaison à la tolérance flottante : 1/3 + 1/3 + 1/3 ne fait pas
    // exactement 1 en binaire, et l'élève ne doit jamais voir « faux » pour
    // cette raison-là.
    frequencesOk: observations.length === 0 || Math.abs(sommeFrequences - 1) < 1e-9,
  };
}

/* ── Tris ────────────────────────────────────────────────────────── */

/**
 * Les trois ordres possibles du tableau brut. Trier ne change AUCUN
 * indicateur — c'est précisément ce que le module fait constater.
 */
export const TRIS = {
  collecte: { id: 'collecte', label: 'Ordre de récolte', apply: (obs) => [...obs] },
  valeur: { id: 'valeur', label: 'Par nombre de livres', apply: (obs) => [...obs].sort((a, b) => a.valeur - b.valeur || a.prenom.localeCompare(b.prenom, 'fr')) },
  prenom: { id: 'prenom', label: 'Par prénom', apply: (obs) => [...obs].sort((a, b) => a.prenom.localeCompare(b.prenom, 'fr')) },
};

/* ── Formatage ───────────────────────────────────────────────────── */

/** Nombre à la française, réexporté pour que les modules n'importent qu'ici. */
export const fr = (v, d = 2) => formatNumber(v, d);

/**
 * Une fréquence telle qu'on l'écrit en 5e : « 4/12 » ET « 33,3 % ».
 * Les deux écritures ensemble, parce que la fraction dit d'où vient le
 * pourcentage — le pourcentage seul se mémorise sans se comprendre.
 */
export const fracEtPct = (effectif, total) =>
  total === 0 ? '—' : `${effectif}/${total} = ${formatNumber((effectif / total) * 100, 1)} %`;

/** Accord du nom de l'unité. */
export const unite = (n) => (Math.abs(n) >= 2 ? ENQUETE.unitePluriel : ENQUETE.unite);
