/**
 * Loi binomiale et coefficients binomiaux — noyau de calcul partagé.
 *
 * Complète `randomVariable.js` : celui-ci sait ce qu'est une loi de probabilité
 * quelconque et ce qu'on en attend ; ce module-ci sait construire LA loi d'une
 * situation particulière — la répétition de `n` épreuves identiques et
 * indépendantes à deux issues.
 *
 * TROIS RÈGLES QUE CE MODULE FAIT RESPECTER PAR CONSTRUCTION :
 *
 * 1. `binomialCoeff` est MULTIPLICATIF, jamais un quotient de factorielles.
 *    21! vaut 51 090 942 171 709 440 000, qui dépasse déjà Number.MAX_SAFE_INTEGER
 *    (9 007 199 254 740 991) : C(21,10) calculé par n!/(k!(n−k)!) rend un nombre
 *    FAUX en silence, alors que la récurrence multiplicative
 *    C(n,k) = C(n,k−1) × (n−k+1)/k reste exacte bien au-delà — chaque produit
 *    partiel est lui-même un coefficient binomial, donc un entier.
 *    Le test balaie n jusqu'à 50 et compare à un calcul exact en BigInt.
 *
 * 2. `binomialCoeff` exploite la SYMÉTRIE C(n,k) = C(n,n−k) pour ne jamais
 *    boucler plus de min(k, n−k) fois : C(50,49) coûte une itération, pas 49.
 *
 * 3. `binomialPmf` ne passe PAS par les logarithmes. Aux tailles d'une leçon de
 *    Première (n ≤ 50), le produit direct reste très loin de tout dépassement,
 *    et exp(log(...)) introduirait une erreur d'arrondi là où il n'y en avait
 *    aucune : P(X = k) doit valoir 0,2048 et non 0,20480000000000004 quand
 *    l'élève a droit à une valeur décimale exacte.
 *
 * PÉRIMÈTRE : ce module CALCULE. Il ne dit pas ce qu'est un schéma de
 * Bernoulli — c'est une leçon qui l'enseigne. Il ne fabrique aucun aléa non
 * plus : une simulation binomiale se fait avec `runBernoulliTrials` de
 * randomUtils, qui reçoit son générateur.
 */

/**
 * Coefficient binomial C(n, k) — « le nombre de chemins de l'arbre qui portent
 * exactement k succès ».
 *
 * Calcul MULTIPLICATIF : on part de 1 et l'on multiplie par (n−k+i)/i pour i
 * allant de 1 à k. Chaque résultat intermédiaire est C(n−k+i, i), donc un
 * ENTIER : la division tombe toujours juste, et l'on ne fabrique jamais le
 * nombre géant qu'une factorielle produirait. L'arrondi final rattrape le seul
 * bruit de flottant possible sur les grands n.
 *
 * Rend 0 hors de 0 ≤ k ≤ n — c'est la convention usuelle, et elle évite qu'un
 * appel malheureux fasse remonter un NaN dans une somme.
 */
export function binomialCoeff(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k)) {
    throw new Error('binomialCoeff : n et k doivent être des entiers.');
  }
  if (n < 0) throw new Error('binomialCoeff : n doit être positif ou nul.');
  if (k < 0 || k > n) return 0;

  // Symétrie C(n,k) = C(n,n−k) : on boucle du côté le plus court.
  const kk = Math.min(k, n - k);
  let c = 1;
  for (let i = 1; i <= kk; i += 1) {
    c = (c * (n - kk + i)) / i;
  }
  return Math.round(c);
}

/** Contrôle commun à toutes les fonctions de loi : n entier ≥ 0, p dans [0 ; 1]. */
function checkParams(n, p, who) {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`${who} : le nombre de répétitions n doit être un entier positif ou nul.`);
  }
  if (!Number.isFinite(p) || p < 0 || p > 1) {
    throw new Error(`${who} : la probabilité de succès doit être dans [0 ; 1] (p = ${p}).`);
  }
}

/**
 * P(X = k) pour X suivant la loi binomiale de paramètres n et p :
 *
 *     P(X = k) = C(n, k) × p^k × (1 − p)^(n−k)
 *
 * Les trois facteurs se lisent sur l'arbre : combien de chemins (le
 * coefficient), ce que coûte un succès (p^k), ce que coûte un échec
 * ((1−p)^(n−k)).
 *
 * Rend 0 hors de 0 ≤ k ≤ n : l'événement « 7 succès en 5 épreuves » est
 * impossible, pas indéfini.
 */
export function binomialPmf(n, k, p) {
  checkParams(n, p, 'binomialPmf');
  if (!Number.isInteger(k)) throw new Error('binomialPmf : k doit être un entier.');
  if (k < 0 || k > n) return 0;
  return binomialCoeff(n, k) * p ** k * (1 - p) ** (n - k);
}

/**
 * P(X ≤ k) — la probabilité cumulée, « au plus k succès ».
 *
 * Somme des termes de 0 à k, dans cet ordre : les premiers termes sont les plus
 * gros quand p est petit, et l'addition des plus grands d'abord garde l'erreur
 * relative minimale. Rend 0 sous 0 et 1 au-delà de n — bornes exactes, jamais
 * un 0,999 999 9 résiduel.
 */
export function binomialCdf(n, k, p) {
  checkParams(n, p, 'binomialCdf');
  if (k < 0) return 0;
  if (k >= n) return 1;
  let acc = 0;
  for (let i = 0; i <= Math.floor(k); i += 1) acc += binomialPmf(n, i, p);
  return acc;
}

/**
 * Espérance d'une loi binomiale : E(X) = n p.
 *
 * Ce n'est pas une définition mais un RÉSULTAT — on peut le retrouver en
 * calculant Σ k P(X = k), et le test le vérifie sur plusieurs couples (n, p).
 * La formule directe est ici pour que les leçons ne recalculent pas une somme.
 */
export function binomialExpectation(n, p) {
  checkParams(n, p, 'binomialExpectation');
  return n * p;
}

/** Variance d'une loi binomiale : V(X) = n p (1 − p). Vérifiée contre Σ (k − np)² P(X = k). */
export function binomialVariance(n, p) {
  checkParams(n, p, 'binomialVariance');
  return n * p * (1 - p);
}

/** Écart type d'une loi binomiale : σ(X) = √(n p (1 − p)). */
export function binomialSd(n, p) {
  return Math.sqrt(binomialVariance(n, p));
}

/**
 * La loi binomiale COMPLÈTE, sous la forme d'une loi de probabilité que
 * `expectation`, `lawStandardDeviation` et `sampleFromLaw` de randomVariable.js
 * savent déjà consommer : [{ x: k, p: P(X = k) }] pour k de 0 à n.
 *
 * C'est le pont entre les deux modules : une loi binomiale est une loi de
 * probabilité comme une autre, et rien de ce qui a été construit sur les lois
 * générales n'a besoin d'être réécrit pour elle.
 */
export function binomialLaw(n, p) {
  checkParams(n, p, 'binomialLaw');
  return Array.from({ length: n + 1 }, (_, k) => ({ x: k, p: binomialPmf(n, k, p) }));
}
