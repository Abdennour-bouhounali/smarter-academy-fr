/**
 * Noyau numérique de la leçon « Nombres rationnels » (5e).
 *
 * Tout ce qui est vrai mathématiquement vit ici et nulle part ailleurs : les
 * modules affichent, ce fichier calcule. Chaque affirmation de la leçon
 * (« 3/4 et 6/8 tombent au même endroit », « on ne peut additionner que sur
 * une graduation commune ») est donc vérifiable par un test.
 *
 * PÉRIMÈTRE 5e (objet officiel `nombres_rationnels`, BO n°10 du 5 mars 2026) :
 * la fraction comme NOMBRE, les fractions égales, la comparaison à même
 * dénominateur ou à dénominateurs multiples, l'addition et la soustraction
 * dans ces mêmes cas, et la fraction d'une quantité.
 *
 * HORS PÉRIMÈTRE — ce fichier REFUSE de le produire, par construction :
 *   — dénominateurs quelconques (1/3 + 1/5) : `peutAdditionner` renvoie false,
 *     et `somme` lève. C'est une garde exécutable du périmètre, pas un
 *     commentaire d'intention.
 *   — multiplication et division de fractions (4e) : aucune fonction.
 *   — fractions négatives (4e) : `Fraction` refuse un signe.
 */

/* ── Construction et invariants ────────────────────────────────────────── */

/**
 * Une fraction est un couple d'entiers POSITIFS (le dénominateur non nul).
 * On ne représente pas les rationnels relatifs : c'est de la 4e.
 */
export const frac = (num, den) => {
  if (!Number.isInteger(num) || !Number.isInteger(den)) {
    throw new Error(`fraction non entière : ${num}/${den}`);
  }
  if (den <= 0) throw new Error(`dénominateur nul ou négatif : ${den}`);
  if (num < 0) throw new Error(`numérateur négatif (hors périmètre 5e) : ${num}`);
  return { num, den };
};

/** Valeur décimale — sert à comparer et à placer, jamais à afficher. */
export const valeur = (f) => f.num / f.den;

/** Écriture « a/b », pour les libellés courts et les tests. */
export const texte = (f) => `${f.num}/${f.den}`;

/* ── Fractions égales ──────────────────────────────────────────────────── */

/**
 * Multiplier les DEUX termes par k : on coupe chaque part en k, il y a donc k
 * fois plus de parts, mais elles sont k fois plus petites. La longueur ne
 * bouge pas — c'est le phénomène du module 2.
 */
export const agrandir = (f, k) => {
  if (!Number.isInteger(k) || k < 1) throw new Error(`facteur invalide : ${k}`);
  return frac(f.num * k, f.den * k);
};

/**
 * Diviser les deux termes par k, quand c'est possible : le geste inverse,
 * celui du module 3 (simplifier).
 */
export const reduire = (f, k) => {
  if (!Number.isInteger(k) || k < 1) throw new Error(`facteur invalide : ${k}`);
  if (f.num % k !== 0 || f.den % k !== 0) return null;   // k ne divise pas les deux
  return frac(f.num / k, f.den / k);
};

/** Les diviseurs communs au numérateur et au dénominateur, dans l'ordre. */
export const diviseursCommuns = (f) => {
  const out = [];
  for (let d = 1; d <= Math.min(f.num, f.den); d += 1) {
    if (f.num % d === 0 && f.den % d === 0) out.push(d);
  }
  return out;
};

/** Deux fractions désignent-elles le MÊME nombre ? (produits en croix) */
export const memeNombre = (a, b) => a.num * b.den === b.num * a.den;

/**
 * La forme la plus simple : on divise par le plus grand diviseur commun.
 * Le résultat est celui qu'on ne peut plus réduire — la leçon dit
 * « simplifier au maximum », jamais le mot « irréductible », qui appartient au
 * travail de 4e sur les rationnels.
 */
export const simplifier = (f) => {
  const ds = diviseursCommuns(f);
  const g = ds[ds.length - 1];
  return frac(f.num / g, f.den / g);
};

/** Une fraction est-elle déjà simplifiée au maximum ? */
export const estSimplifiee = (f) => diviseursCommuns(f).length === 1;

/* ── Le cas autorisé en 5e : dénominateurs multiples ───────────────────── */

/**
 * Peut-on comparer ou additionner ces deux fractions AU NIVEAU 5e ?
 *
 * Oui si les dénominateurs sont égaux, ou si l'un est un multiple de l'autre :
 * il suffit alors de re-graduer la plus « grosse » sur la graduation de
 * l'autre, sans jamais chercher un dénominateur commun quelconque. C'est
 * exactement la frontière posée par le programme.
 */
export const peutAdditionner = (a, b) =>
  a.den === b.den || a.den % b.den === 0 || b.den % a.den === 0;

/** Le dénominateur commun du cas 5e : le plus grand des deux. */
export const denominateurCommun = (a, b) => {
  if (!peutAdditionner(a, b)) {
    throw new Error(`hors périmètre 5e : ${texte(a)} et ${texte(b)} n'ont pas de dénominateurs multiples`);
  }
  return Math.max(a.den, b.den);
};

/** Réécrit les deux fractions sur la graduation commune. */
export const surGraduationCommune = (a, b) => {
  const d = denominateurCommun(a, b);
  return [agrandir(a, d / a.den), agrandir(b, d / b.den)];
};

/**
 * Somme — définie SEULEMENT dans le cas 5e. Elle lève sinon : une leçon de 5e
 * ne doit jamais pouvoir afficher 1/3 + 1/5, même par accident de données.
 */
export const somme = (a, b) => {
  const [x, y] = surGraduationCommune(a, b);
  return frac(x.num + y.num, x.den);
};

/** Différence — même garde, et jamais de résultat négatif (4e). */
export const difference = (a, b) => {
  const [x, y] = surGraduationCommune(a, b);
  if (x.num < y.num) {
    throw new Error(`différence négative (hors périmètre 5e) : ${texte(a)} − ${texte(b)}`);
  }
  return frac(x.num - y.num, x.den);
};

/* ── Comparaison ───────────────────────────────────────────────────────── */

/** −1, 0 ou 1. À même dénominateur, c'est le numérateur qui tranche. */
export const comparer = (a, b) => {
  const g = a.num * b.den;
  const d = b.num * a.den;
  return g === d ? 0 : g > d ? 1 : -1;
};

/**
 * Comment la comparaison se JUSTIFIE, au niveau 5e. Le module 4 s'en sert pour
 * expliquer, au lieu de dire « c'est plus grand ».
 */
export const raisonComparaison = (a, b) => {
  if (a.den === b.den) return 'meme-denominateur';
  if (peutAdditionner(a, b)) return 'denominateurs-multiples';
  return 'hors-perimetre';
};

/** Range des fractions dans l'ordre croissant. */
export const ranger = (fs) => [...fs].sort((x, y) => comparer(x, y));

/* ── Fraction d'une quantité ───────────────────────────────────────────── */

/**
 * Prendre a/b d'une quantité : on partage en b, on prend a parts. On ne
 * renvoie que des cas qui tombent juste — la 5e ne fait pas de quotient
 * décimal ici, et une donnée qui ne tombe pas juste est une erreur d'auteur
 * que le test doit attraper.
 */
export const fractionDe = (f, quantite) => {
  const part = (quantite * f.num) / f.den;
  return part;
};

/** La quantité se partage-t-elle exactement en `den` parts entières ? */
export const tombeJuste = (f, quantite) => Number.isInteger((quantite * f.num) / f.den);

/* ── Placement sur la droite graduée ───────────────────────────────────── */

/**
 * Les graduations d'une unité coupée en `den` parts, sur [0 ; max].
 * Retourne les abscisses en NOMBRE de parts, pas en pixels : le composant
 * s'occupe des pixels, ce fichier ne connaît que les mathématiques.
 */
export const graduations = (den, max = 1) =>
  Array.from({ length: den * max + 1 }, (_, i) => i);

/**
 * Deux fractions tombent-elles sur la même marque d'une droite graduée en
 * `den` parts ? C'est la vérification du module 1.
 */
export const memeMarque = (a, b) => memeNombre(a, b);

/* ── Diagnostic des erreurs, pour un retour qui NOMME l'erreur ─────────── */

/**
 * L'erreur reine sur les fractions : additionner les numérateurs ET les
 * dénominateurs. On la calcule pour pouvoir la reconnaître dans une réponse
 * d'élève et la nommer, au lieu d'écrire « Incorrect ».
 */
export const sommeNaive = (a, b) => ({ num: a.num + b.num, den: a.den + b.den });

/** L'autre erreur fréquente : additionner les numérateurs sans re-graduer. */
export const sommeNumerateurs = (a, b) => ({ num: a.num + b.num, den: Math.max(a.den, b.den) });

/**
 * Diagnostique une réponse d'élève à une addition. Renvoie un code que le
 * module traduit en phrase — la table des messages vit dans le module, la
 * logique ici.
 */
export const diagnostiquerSomme = (a, b, rep) => {
  const bonne = somme(a, b);
  if (memeNombre(rep, bonne)) return 'ok';
  const naive = sommeNaive(a, b);
  if (rep.num === naive.num && rep.den === naive.den) return 'somme-des-deux';
  const sansRegraduer = sommeNumerateurs(a, b);
  if (rep.num === sansRegraduer.num && rep.den === sansRegraduer.den) return 'oubli-regraduation';
  return 'autre';
};

/* ── Données des modules — vérifiées par les tests ─────────────────────── */

/** Module 1 : la barre à graduer. 3/4 et 6/8 tombent au même endroit. */
export const PAIRE_SIGNATURE = { a: frac(3, 4), b: frac(6, 8) };

/** Module 6 : la recette, à recalculer pour un nombre de parts donné. */
export const RECETTE = {
  personnes: 4,
  ingredients: [
    { nom: 'Farine', quantite: 300, unite: 'g' },
    { nom: 'Sucre', quantite: 120, unite: 'g' },
    { nom: 'Lait', quantite: 20, unite: 'cL' },
  ],
};

/**
 * Lecture d'une saisie élève représentant un ENTIER positif (numérateur ou
 * dénominateur d'un champ de fraction). Le `parseFr` du kit convient, mais on
 * garde une fonction locale pour tolérer les espaces et rester explicite.
 */
export const parseEntier = (str) => {
  if (typeof str === 'number') return Math.trunc(str);
  if (typeof str !== 'string') return NaN;
  const cleaned = str.replace(/[\s  ]/g, '');
  if (!/^\d+$/.test(cleaned)) return NaN;
  return parseInt(cleaned, 10);
};
