/**
 * Noyau numérique de la leçon « Puissances » (4e).
 *
 * Tout ce qui est vrai mathématiquement vit ici ; les modules affichent, ce
 * fichier calcule. Les puissances font vite déborder les entiers JavaScript :
 * ce noyau raisonne donc sur les EXPOSANTS (des petits entiers) et ne
 * fabrique une valeur numérique que lorsqu'elle est sûre.
 *
 * CE QUE LA 4e AJOUTE À LA 5e. La 5e a construit le SENS de la puissance
 * (un raccourci d'écriture pour un produit de facteurs identiques),
 * l'exposant qui COMPTE les facteurs, le carré et le cube, les carrés
 * parfaits et les puissances de 10 d'exposant POSITIF. Elle s'arrêtait là.
 *
 * La 4e ouvre :
 *   — l'exposant NÉGATIF, obtenu en prolongeant la descente des exposants ;
 *   — les règles opératoires (produit, quotient, puissance de puissance) ;
 *   — la notation scientifique et les ordres de grandeur.
 *
 * PÉRIMÈTRE — refusé par construction (`CURRICULUM_MATRIX_5E_4E.md`) :
 *   — les puissances littérales complexes (a^m × b^m avec a ≠ b) : aucune
 *     fonction ne les produit ;
 *   — les exposants fractionnaires et les racines n-ièmes ;
 *   — les chiffres significatifs et la précision des mesures.
 */

/* ── La puissance comme couple (base, exposant) ────────────────────────── */

/**
 * Une puissance est le couple `{base, exp}`. On ne la réduit JAMAIS
 * spontanément en un nombre : 2^40 dépasse ce qu'un élève de 4e manipule, et
 * 10^-9 s'affiche en notation exponentielle anglaise si on le laisse faire.
 */
export const pow = (base, exp) => {
  if (!Number.isInteger(exp)) throw new Error(`exposant non entier (hors périmètre 4e) : ${exp}`);
  return { base, exp };
};

/** La valeur numérique — seulement quand elle reste lisible. */
export const valeur = (p) => p.base ** p.exp;

/**
 * Le produit de facteurs qu'une puissance abrège : 2^3 → [2, 2, 2].
 * Vide pour l'exposant 0, ce qui EST la raison pour laquelle a^0 = 1.
 * Non défini pour un exposant négatif : c'est justement là que l'écriture
 * « produit de facteurs » cesse de fonctionner, et le module 1 le montre.
 */
export const facteurs = (p) => {
  if (p.exp < 0) return null;
  return Array.from({ length: p.exp }, () => p.base);
};

/* ── La descente des exposants — le cœur du module 1 ───────────────────── */

/**
 * La colonne des puissances de `base`, de l'exposant `expMax` (en haut) à
 * `expMin` (en bas). Chaque ligne porte sa valeur EXACTE en rationnel
 * {n, d}, si bien que 10^-2 vaut 1/100 et non 0,01 — l'écriture décimale
 * n'est qu'une des lectures possibles, et surtout pas la définition.
 *
 * Le phénomène que la colonne rend visible : d'une ligne à la suivante on
 * DIVISE par la base. Cette division ne s'arrête pas à l'exposant 0 — et
 * c'est elle, et non une convention, qui impose 10^0 = 1 puis 10^-1 = 1/10.
 */
export const colonne = (base, expMax, expMin) => {
  const out = [];
  for (let e = expMax; e >= expMin; e -= 1) {
    out.push({ exp: e, ...valeurExacte(base, e) });
  }
  return out;
};

/** La valeur exacte de base^exp, en rationnel {n, d}. */
export const valeurExacte = (base, exp) => {
  if (exp >= 0) return { n: base ** exp, d: 1 };
  return { n: 1, d: base ** -exp };
};

/** L'écriture décimale d'une puissance de 10, en français : 10^-2 → « 0,01 ». */
export const decimalDeDix = (exp) => {
  if (exp === 0) return '1';
  if (exp > 0) return `1${'0'.repeat(exp)}`;
  return `0,${'0'.repeat(-exp - 1)}1`;
};

/**
 * Le nombre de zéros de l'écriture décimale d'une puissance de 10 — ce que
 * l'élève compte réellement. Positif : les zéros APRÈS le 1. Négatif : les
 * zéros AVANT le 1, virgule comprise.
 */
export const zerosDeDix = (exp) => Math.abs(exp);

/* ── Les règles opératoires ────────────────────────────────────────────── */

/**
 * Produit de deux puissances de MÊME base : on additionne les exposants.
 * Lève si les bases diffèrent — la règle n'existe pas dans ce cas, et une
 * leçon de 4e ne doit jamais pouvoir afficher « 2^3 × 3^2 = 6^5 ».
 */
export const produit = (a, b) => {
  if (a.base !== b.base) {
    throw new Error(`produit de bases différentes (${a.base} et ${b.base}) : aucune règle ne s'applique`);
  }
  return pow(a.base, a.exp + b.exp);
};

/** Quotient de deux puissances de même base : on soustrait les exposants. */
export const quotient = (a, b) => {
  if (a.base !== b.base) {
    throw new Error(`quotient de bases différentes (${a.base} et ${b.base}) : aucune règle ne s'applique`);
  }
  return pow(a.base, a.exp - b.exp);
};

/** Puissance d'une puissance : on multiplie les exposants. */
export const puissanceDePuissance = (a, n) => {
  if (!Number.isInteger(n)) throw new Error(`exposant non entier : ${n}`);
  return pow(a.base, a.exp * n);
};

/** L'inverse d'une puissance : on change le signe de l'exposant. */
export const inverse = (a) => pow(a.base, -a.exp);

/**
 * POURQUOI chaque règle est vraie, en comptant les facteurs. Le module
 * affiche cette justification au lieu d'énoncer la règle sèche.
 * Non défini quand un exposant est négatif : on ne peut plus compter des
 * facteurs, et c'est honnête de le dire.
 */
export const justification = (a, b, op) => {
  if (a.exp < 0 || b.exp < 0) return null;
  if (op === '×') return { gauche: a.exp, droite: b.exp, total: a.exp + b.exp };
  if (op === '÷') return { gauche: a.exp, droite: b.exp, restants: a.exp - b.exp };
  return null;
};

/* ── Notation scientifique ─────────────────────────────────────────────── */

/**
 * L'écriture scientifique d'un nombre : `{coefficient, exposant}` avec un
 * coefficient dans [1 ; 10[.
 *
 * Zéro n'a pas d'écriture scientifique — aucun coefficient de [1 ; 10[ ne
 * peut le produire. La fonction le dit en levant plutôt qu'en renvoyant un
 * couple absurde qu'un module afficherait sans le voir.
 */
export const scientifique = (x) => {
  if (x === 0) throw new Error('zéro n’a pas d’écriture scientifique');
  const signe = Math.sign(x);
  const abs = Math.abs(x);
  const exposant = Math.floor(Math.log10(abs));
  // Le passage par log10 peut dériver d'un ulp sur des cas comme 1000 :
  // on recale sur la définition, coefficient dans [1 ; 10[.
  let e = exposant;
  let c = abs / 10 ** e;
  if (c >= 10) { c /= 10; e += 1; }
  if (c < 1) { c *= 10; e -= 1; }
  return { coefficient: signe * arrondi(c), exposant: e };
};

/** Arrondi de travail — évite les 4,999999999 d'une division flottante. */
const arrondi = (v, dp = 10) => Math.round(v * 10 ** dp) / 10 ** dp;

/** Une écriture est-elle scientifique ? (coefficient dans [1 ; 10[) */
export const estScientifique = (coefficient) => {
  const a = Math.abs(coefficient);
  return a >= 1 && a < 10;
};

/**
 * Pourquoi une écriture proposée n'est PAS scientifique — le module traduit
 * ce code en phrase, la logique vit ici.
 */
export const diagnostiquerScientifique = (coefficient) => {
  const a = Math.abs(coefficient);
  if (a === 0) return 'zero';
  if (a >= 10) return 'coefficient-trop-grand';
  if (a < 1) return 'coefficient-trop-petit';
  return 'ok';
};

/* ── Ordres de grandeur ────────────────────────────────────────────────── */

/**
 * L'ordre de grandeur d'un nombre : la puissance de 10 la plus proche.
 * C'est ce que le programme demande de COMPARER — pas les nombres eux-mêmes.
 */
export const ordreDeGrandeur = (x) => {
  if (x === 0) return null;
  const { coefficient, exposant } = scientifique(x);
  // Un coefficient ≥ 5 rapproche de la puissance supérieure.
  return Math.abs(coefficient) >= 5 ? exposant + 1 : exposant;
};

/** Combien de fois l'un est-il plus grand que l'autre, en puissances de 10 ? */
export const rapportEnPuissances = (x, y) => ordreDeGrandeur(x) - ordreDeGrandeur(y);

/* ── Diagnostic des erreurs — nommer l'erreur, pas la constater ────────── */

/**
 * L'erreur reine sur les puissances : MULTIPLIER l'exposant par la base au
 * lieu de compter les facteurs. 2^3 lu « 6 ».
 */
export const erreurProduitBaseExposant = (p) => p.base * p.exp;

/** L'erreur du produit : multiplier les exposants au lieu de les additionner. */
export const erreurExposantsMultiplies = (a, b) => pow(a.base, a.exp * b.exp);

/** L'erreur du signe : croire que 10^-3 est négatif. */
export const erreurPuissanceNegative = (exp) => -(10 ** Math.abs(exp));

export const diagnostiquerProduit = (a, b, repExp) => {
  if (repExp === a.exp + b.exp) return 'ok';
  if (repExp === a.exp * b.exp) return 'exposants-multiplies';
  if (repExp === a.exp - b.exp) return 'a-soustrait';
  return 'autre';
};

export const diagnostiquerQuotient = (a, b, repExp) => {
  if (repExp === a.exp - b.exp) return 'ok';
  if (repExp === a.exp + b.exp) return 'a-additionne';
  if (repExp === b.exp - a.exp) return 'sens-inverse';
  return 'autre';
};

/* ── Garde de périmètre exécutable ─────────────────────────────────────── */

/**
 * Le périmètre du niveau, en code plutôt qu'en commentaire
 * (memory: perimetre_executable_lecon). Les exposants d'une leçon de 4e
 * restent lisibles, et les bases sont des entiers usuels.
 */
export const DANS_LE_PERIMETRE_4E = (p) =>
  Number.isInteger(p.exp) && Math.abs(p.exp) <= 12
  && Number.isInteger(p.base) && p.base >= 2 && p.base <= 10;

export const verifierPerimetre = (p, ou = '') => {
  if (!DANS_LE_PERIMETRE_4E(p)) {
    throw new Error(`hors périmètre 4e${ou ? ` (${ou})` : ''} : ${p.base}^${p.exp}`);
  }
  return p;
};
