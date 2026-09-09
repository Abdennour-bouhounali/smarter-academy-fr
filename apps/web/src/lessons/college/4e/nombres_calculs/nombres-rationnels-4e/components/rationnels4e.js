/**
 * Noyau numérique de la leçon « Nombres rationnels » (4e).
 *
 * Tout ce qui est vrai mathématiquement vit ici ; les modules affichent, ce
 * fichier calcule. Chaque affirmation de la leçon est donc vérifiable par un
 * test — y compris les affirmations sur les ERREURS d'élève, qu'on nomme au
 * lieu d'écrire « Incorrect ».
 *
 * CE QUE LA 4e AJOUTE À LA 5e. La 5e a construit la fraction comme NOMBRE
 * (une position), les fractions égales, la simplification, et l'addition dans
 * le seul cas où un dénominateur est multiple de l'autre. Elle s'arrêtait là,
 * et son propre noyau REFUSE d'aller plus loin (`somme` y lève pour 1/3 + 1/5,
 * et un numérateur négatif y est une erreur).
 *
 * La 4e lève exactement ces deux barrières :
 *   — le SIGNE : un rationnel est le quotient de deux entiers RELATIFS ;
 *   — les dénominateurs QUELCONQUES : 1/3 + 1/5 devient calculable, ce qui
 *     oblige à fabriquer un dénominateur commun au lieu de le trouver donné.
 * Et elle ouvre le produit, l'inverse et le quotient.
 *
 * PÉRIMÈTRE — ce fichier refuse par construction ce qui appartient au niveau
 * suivant (`docs/architecture/CURRICULUM_MATRIX_5E_4E.md`, colonne « hors
 * périmètre ») :
 *   — les identités remarquables sur les fractions (3e) : aucune fonction ;
 *   — les puissances de fractions (objet officiel « Puissances ») ;
 *   — les fractions littérales (objet officiel « Calcul littéral »).
 *
 * On ne réutilise PAS `rationnels.js` de la 5e : son contrat interdit
 * précisément ce que la 4e enseigne. Le rationnel signé de la 4e s'appuie sur
 * `common/algebra4e/exprCore` — un seul noyau de rationnels exacts pour tout
 * le niveau, partagé avec le calcul littéral et les équations.
 */

import {
  rat, ratAdd, ratSub, ratMul, ratDiv, ratNeg, ratEq, ratSign, ratAbs,
  ratToNumber, ratIsZero, ratIsInt,
} from '../../../../../common/algebra4e';

/* ── Construction ──────────────────────────────────────────────────────── */

/**
 * Un rationnel de 4e : le quotient de deux entiers RELATIFS, le dénominateur
 * non nul. `rat` réduit et porte le signe au numérateur — c'est la forme
 * canonique dont tout le reste dépend.
 */
export const q = (num, den = 1) => rat(num, den);

/** Le signe est porté par le numérateur : −3/4, jamais 3/(−4). */
export const estNegatif = (f) => ratSign(f) < 0;
export const oppose = (f) => ratNeg(f);
export const valeurAbsolue = (f) => ratAbs(f);
export const valeur = (f) => ratToNumber(f);
export const estEntier = (f) => ratIsInt(f);
export const estNul = (f) => ratIsZero(f);

/** Écriture « a/b » pour les libellés courts et les tests (jamais l'affichage). */
export const texte = (f) => (ratIsInt(f) ? String(f.n) : `${f.n}/${f.d}`);

/* ── Égalité : les produits en croix ───────────────────────────────────── */

/**
 * Une écriture BRUTE, telle que l'élève la lit sur la feuille : le couple de
 * chiffres, non réduit. `q()` réduit à la construction — indispensable pour
 * calculer juste, mais fatal ici : le produit en croix de 9/12 doit se faire
 * sur 9 et 12, pas sur le 3/4 que la réduction aurait déjà trouvé. Sinon la
 * manipulation démontrerait l'égalité avant que l'élève l'ait testée.
 */
export const brut = (n, d) => {
  if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error(`écriture non entière : ${n}/${d}`);
  if (d === 0) throw new Error('dénominateur nul');
  return { n, d };
};

/**
 * Les deux produits en croix d'une égalité présumée a/b = c/d. Le point du
 * programme de 4e n'est pas le verdict mais la MÉTHODE : on compare a×d et
 * b×c, deux ENTIERS, au lieu de comparer deux quotients.
 *
 * Prend les écritures BRUTES (voir `brut`) et renvoie les deux produits ET
 * leur égalité, pour que le module puisse MONTRER le calcul, pas seulement
 * sa conclusion.
 */
export const produitsEnCroix = (a, b) => ({
  gauche: a.n * b.d,
  droite: b.n * a.d,
  egaux: a.n * b.d === b.n * a.d,
});

/** Deux écritures désignent-elles le même nombre ? */
export const memeNombre = (a, b) => ratEq(a, b);

/**
 * Toutes les écritures d'un même rationnel, du plus simple au plus étoffé.
 * Sert au module 1 : un nombre, une infinité d'écritures.
 */
export const ecritures = (f, combien = 4) =>
  Array.from({ length: combien }, (_, i) => ({ n: f.n * (i + 1), d: f.d * (i + 1) }));

/** La forme irréductible — c'est déjà ce que `rat` produit. Nommée pour la lisibilité. */
export const simplifier = (f) => rat(f.n, f.d);

/** Une écriture donnée est-elle déjà irréductible ? */
export const estIrreductible = (n, d) => {
  const s = rat(n, d);
  return Math.abs(s.n) === Math.abs(n) && s.d === Math.abs(d);
};

/* ── Les quatre opérations ─────────────────────────────────────────────── */

export const somme = (a, b) => ratAdd(a, b);
export const difference = (a, b) => ratSub(a, b);
export const produit = (a, b) => ratMul(a, b);

/**
 * L'inverse. Il n'existe PAS pour zéro — et la fonction le dit en levant,
 * plutôt qu'en renvoyant un infini qu'un module afficherait sans le vouloir.
 */
export const inverse = (f) => {
  if (ratIsZero(f)) throw new Error('inverse de zéro : aucun nombre ne convient');
  return rat(f.d, f.n);
};

/** Diviser, c'est multiplier par l'inverse — écrit littéralement ainsi. */
export const quotient = (a, b) => {
  if (ratIsZero(b)) throw new Error('division par zéro');
  return ratMul(a, inverse(b));
};

/* ── Le dénominateur commun : ce que la 4e doit FABRIQUER ──────────────── */

const pgcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) { const t = x % y; x = y; y = t; }
  return x || 1;
};

/** Le plus petit dénominateur commun — celui qu'on cherche, pas le produit. */
export const denominateurCommun = (a, b) => (a.d * b.d) / pgcd(a.d, b.d);

/**
 * Réécrit les deux fractions sur le dénominateur commun, en gardant le
 * FACTEUR utilisé : le module doit pouvoir montrer « ×5 » et « ×3 » à côté
 * des flèches, pas seulement le résultat.
 */
export const surDenominateurCommun = (a, b) => {
  const d = denominateurCommun(a, b);
  return [
    { frac: { n: a.n * (d / a.d), d }, facteur: d / a.d },
    { frac: { n: b.n * (d / b.d), d }, facteur: d / b.d },
  ];
};

/** Le produit des dénominateurs marche toujours, mais n'est pas toujours le plus petit. */
export const produitDesDenominateurs = (a, b) => a.d * b.d;

/** Le plus petit dénominateur commun est-il strictement meilleur que le produit ? */
export const communPlusPetitQueProduit = (a, b) =>
  denominateurCommun(a, b) < produitDesDenominateurs(a, b);

/* ── Comparaison ───────────────────────────────────────────────────────── */

/** −1, 0 ou 1. Par produits en croix — valable aussi pour les négatifs. */
export const comparer = (a, b) => {
  const g = a.n * b.d;
  const d = b.n * a.d;
  return g === d ? 0 : g > d ? 1 : -1;
};

export const ranger = (fs) => [...fs].sort((x, y) => comparer(x, y));

/**
 * Pourquoi tel nombre est le plus grand — la JUSTIFICATION, que le module
 * affiche au lieu d'un verdict nu.
 */
export const raisonComparaison = (a, b) => {
  if (ratEq(a, b)) return 'egaux';
  if (ratSign(a) !== ratSign(b)) return 'signes-differents';
  if (a.d === b.d) return 'meme-denominateur';
  return 'produits-en-croix';
};

/* ── Diagnostic des erreurs — nommer l'erreur, pas la constater ────────── */

/** L'erreur reine : additionner les numérateurs ET les dénominateurs. */
export const sommeNaive = (a, b) => ({ n: a.n + b.n, d: a.d + b.d });

/** Additionner les numérateurs en gardant un dénominateur, sans re-graduer. */
export const sommeSansRegraduer = (a, b) => ({ n: a.n + b.n, d: Math.max(a.d, b.d) });

/** Multiplier en croix, comme dans une addition mal apprise. */
export const produitEnCroixFautif = (a, b) => ({ n: a.n * b.d, d: a.d * b.n });

/**
 * Diagnostique une réponse d'élève. Renvoie un CODE ; la phrase vit dans le
 * module, la logique ici.
 */
export const diagnostiquerSomme = (a, b, rep) => {
  if (!rep || !Number.isFinite(rep.n) || !Number.isFinite(rep.d) || rep.d === 0) return 'illisible';
  if (memeNombre(rep, somme(a, b))) return 'ok';
  const naive = sommeNaive(a, b);
  if (rep.n === naive.n && rep.d === naive.d) return 'somme-des-deux-termes';
  const sans = sommeSansRegraduer(a, b);
  if (rep.n === sans.n && rep.d === sans.d) return 'oubli-regraduation';
  if (memeNombre(rep, produit(a, b))) return 'a-multiplie';
  return 'autre';
};

export const diagnostiquerProduit = (a, b, rep) => {
  if (!rep || !Number.isFinite(rep.n) || !Number.isFinite(rep.d) || rep.d === 0) return 'illisible';
  if (memeNombre(rep, produit(a, b))) return 'ok';
  if (memeNombre(rep, somme(a, b))) return 'a-additionne';
  const croix = produitEnCroixFautif(a, b);
  if (rep.n === croix.n && rep.d === croix.d) return 'produit-en-croix';
  return 'autre';
};

export const diagnostiquerQuotient = (a, b, rep) => {
  if (!rep || !Number.isFinite(rep.n) || !Number.isFinite(rep.d) || rep.d === 0) return 'illisible';
  if (memeNombre(rep, quotient(a, b))) return 'ok';
  if (memeNombre(rep, produit(a, b))) return 'a-multiplie-sans-inverser';
  // Inverser le PREMIER au lieu du second — la confusion classique.
  if (!ratIsZero(a) && memeNombre(rep, produit(inverse(a), b))) return 'inverse-le-mauvais';
  return 'autre';
};

/* ── Garde de périmètre exécutable ─────────────────────────────────────── */

/**
 * Le périmètre du niveau, en code plutôt qu'en commentaire
 * (memory: perimetre_executable_lecon). Une donnée de module qui sortirait du
 * programme de 4e fait échouer le test, elle ne se glisse pas dans l'UI.
 *
 * Les bornes sont celles d'un calcul mental de 4e : des entiers qui restent
 * lisibles, jamais des dénominateurs à trois chiffres.
 */
export const DANS_LE_PERIMETRE_4E = (f) =>
  Number.isInteger(f.n) && Number.isInteger(f.d) && f.d !== 0
  && Math.abs(f.n) <= 200 && Math.abs(f.d) <= 60;

export const verifierPerimetre = (f, ou = '') => {
  if (!DANS_LE_PERIMETRE_4E(f)) {
    throw new Error(`hors périmètre 4e${ou ? ` (${ou})` : ''} : ${texte(f)}`);
  }
  return f;
};
