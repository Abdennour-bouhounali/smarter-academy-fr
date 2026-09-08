/**
 * Noyau numérique de la leçon « Calcul littéral et algébrique » (5e).
 *
 * Tout ce qui est vrai mathématiquement vit ici et nulle part ailleurs : les
 * modules affichent, ce fichier calcule. Chaque affirmation de la leçon
 * (« la formule marche pour TOUTES les étapes », « développer ne change pas la
 * valeur ») devient ainsi vérifiable par un test plutôt que par relecture.
 *
 * PARTI PRIS. On ne construit PAS un moteur d'algèbre symbolique : la 5e n'en
 * a pas besoin, et un tel moteur serait impossible à vérifier exhaustivement.
 * Une expression est décrite par un petit objet, et la vérité de la leçon est
 * établie NUMÉRIQUEMENT — on évalue les deux écritures sur tout le domaine et
 * on constate qu'elles coïncident. C'est d'ailleurs exactement l'argument que
 * la leçon donne à l'élève : « essaie avec n'importe quel nombre ».
 *
 * PÉRIMÈTRE 5e (objet officiel `calcul_litteral`, BO n°10 du 5 mars 2026) :
 * la lettre comme nombre, la substitution, la distributivité SIMPLE
 * (numérique), et la production d'une formule.
 *
 * HORS PÉRIMÈTRE — ce fichier REFUSE de le produire, par construction :
 *   — la double distributivité (a+b)(c+d) : `developper` LÈVE si le facteur
 *     n'est pas un nombre seul. C'est une garde exécutable, pas un commentaire.
 *   — la factorisation formelle, la réduction d'expressions quelconques et la
 *     résolution d'équations : aucune fonction.
 */

/* ── Les expressions manipulées ────────────────────────────────────────── */

/**
 * Une expression du niveau est de la forme `a × n + b` — c'est tout ce dont la
 * 5e a besoin, et cela couvre tous les motifs de la leçon. `a` est le
 * coefficient (combien de fois la lettre), `b` la partie constante.
 *
 * On garde délibérément cette forme minimale : elle se teste entièrement, et
 * elle suffit à porter les six Learning Points.
 */
export const expr = (a, b) => ({ a, b });

/** La valeur d'une expression quand la lettre vaut `n` — la SUBSTITUTION. */
export const valeur = ({ a, b }, n) => a * n + b;

/**
 * L'écriture d'une expression, avec les conventions du niveau :
 *   — on n'écrit pas le signe × entre un nombre et une lettre (3 × n → 3n) ;
 *   — on n'écrit pas le coefficient 1 (1 × n → n) ;
 *   — on n'écrit pas « + 0 ».
 */
export const ecrire = ({ a, b }, lettre = 'n') => {
  const partA = a === 0 ? '' : a === 1 ? lettre : `${a}${lettre}`;
  if (b === 0) return partA || '0';
  if (partA === '') return String(b);
  return b > 0 ? `${partA} + ${b}` : `${partA} − ${Math.abs(b)}`;
};

/** L'écriture NON simplifiée, celle que l'élève produit d'abord. */
export const ecrireAvecFois = ({ a, b }, lettre = 'n') => {
  const partA = a === 0 ? '' : `${a} × ${lettre}`;
  if (b === 0) return partA || '0';
  if (partA === '') return String(b);
  return b > 0 ? `${partA} + ${b}` : `${partA} − ${Math.abs(b)}`;
};

/** Deux expressions désignent-elles la même chose, pour TOUTE valeur ? */
export const memeExpression = (e1, e2) => e1.a === e2.a && e1.b === e2.b;

/**
 * Vérification NUMÉRIQUE de l'équivalence, sur une plage de valeurs. C'est
 * l'argument que la leçon donne à l'élève — « essaie avec n'importe quel
 * nombre » — et le test s'en sert pour confirmer `memeExpression`.
 */
export const memeValeurSur = (e1, e2, max = 30) => {
  for (let n = 0; n <= max; n += 1) if (valeur(e1, n) !== valeur(e2, n)) return false;
  return true;
};

/* ── La distributivité SIMPLE ──────────────────────────────────────────── */

/**
 * Développer k × (a×n + b) = (k×a)×n + (k×b).
 *
 * `k` doit être un NOMBRE seul. Si l'on tentait de développer un produit de
 * deux expressions contenant chacune la lettre, on ferait de la double
 * distributivité — objet officiel de 4e, explicitement exclu du programme de
 * 5e. La fonction lève donc plutôt que de le produire.
 */
export const developper = (k, e) => {
  if (typeof k !== 'number' || !Number.isFinite(k)) {
    throw new Error('le facteur doit être un nombre seul — la double distributivité est de 4e');
  }
  return expr(k * e.a, k * e.b);
};

/** L'écriture du produit non développé : « 3 × (n + 2) ». */
export const ecrireProduit = (k, e, lettre = 'n') => `${k} × (${ecrire(e, lettre)})`;

/**
 * La version NUMÉRIQUE de la distributivité, celle par laquelle la leçon passe
 * d'abord : k × (a + b) = k×a + k×b, lue sur l'aire d'un rectangle coupé.
 */
export const developperNombres = (k, a, b) => ({
  gauche: k * (a + b),
  droite: k * a + k * b,
});

/* ── Les motifs qui grandissent — le cœur du module 1 ──────────────────── */

/**
 * Un motif est décrit par sa RÈGLE, pas par une liste de valeurs : le nombre
 * d'éléments à l'étape n vaut `a × n + b`. Le laboratoire dessine, ce noyau
 * dit la vérité, et le test vérifie que les premiers termes dessinés
 * correspondent bien à la formule — ce qui interdit qu'un motif affiché
 * contredise la formule que la leçon en tire.
 */
export const MOTIFS = {
  /** Une file de carrés : chaque étape ajoute 1 carré. Étape n : n + 1. */
  file: {
    id: 'file',
    titre: 'La file de carrés',
    regle: expr(1, 1),
    /** Ce que la figure contient réellement à l'étape n — la source du dessin. */
    compte: (n) => n + 1,
  },
  /** Un escalier : chaque étape ajoute 2 carrés. Étape n : 2n + 1. */
  escalier: {
    id: 'escalier',
    titre: 'L’escalier',
    regle: expr(2, 1),
    compte: (n) => 2 * n + 1,
  },
  /** Une bordure de table : 3 par étape, plus 2 aux extrémités. */
  table: {
    id: 'table',
    titre: 'Les tables du restaurant',
    regle: expr(3, 2),
    compte: (n) => 3 * n + 2,
  },
};

/** Les premières valeurs d'un motif, pour le tableau étape → nombre. */
export const premieresValeurs = (motif, jusqua = 5) =>
  Array.from({ length: jusqua }, (_, i) => ({ etape: i + 1, nombre: motif.compte(i + 1) }));

/** L'écart constant entre deux étapes consécutives — c'est le coefficient. */
export const ecartConstant = (motif) => motif.compte(2) - motif.compte(1);

/* ── Diagnostic des erreurs, pour un retour qui NOMME l'erreur ─────────── */

/**
 * Les confusions que la leçon vise, calculées pour pouvoir être reconnues dans
 * une réponse d'élève et nommées — au lieu d'écrire « Incorrect ».
 */

/** Coller le coefficient et la valeur : 3n avec n = 4 lu « 34 ». */
export const confusionConcatenation = ({ a }, n) => Number(`${a}${n}`);

/** Oublier la partie constante : ne calculer que a × n. */
export const confusionSansConstante = ({ a }, n) => a * n;

/** Ajouter au lieu de multiplier : a + n au lieu de a × n. */
export const confusionSomme = ({ a, b }, n) => a + n + b;

/** Ne distribuer que sur le premier terme : k×(a n + b) → k a n + b. */
export const confusionDemiDistribution = (k, e) => expr(k * e.a, e.b);

/**
 * Diagnostique une réponse d'élève à une substitution. Renvoie un code que le
 * module traduit en phrase — la logique ici, les mots là-bas.
 */
export const diagnostiquerSubstitution = (e, n, rep) => {
  if (rep === valeur(e, n)) return 'ok';
  if (rep === confusionConcatenation(e, n)) return 'colle';
  if (e.b !== 0 && rep === confusionSansConstante(e, n)) return 'oubli-constante';
  if (rep === confusionSomme(e, n)) return 'ajoute';
  return 'autre';
};

/* ── Données des modules — vérifiées par les tests ─────────────────────── */

/** Module 1 : le motif signature, et l'étape qu'on ne peut plus dessiner. */
export const MOTIF_SIGNATURE = MOTIFS.escalier;
export const ETAPE_HORS_DESSIN = 20;
export const ETAPE_TRES_LOIN = 100;

/** Module 6 : le carrelage à border. Une formule à produire puis à appliquer. */
export const CARRELAGE = {
  /** Une bordure d'une rangée autour d'un carré de côté n : 4n + 4 carreaux. */
  regle: expr(4, 4),
  compte: (n) => 4 * n + 4,
};

/**
 * Lecture d'une saisie élève représentant un ENTIER positif. Le `parseFr` du
 * kit convient, mais on garde une fonction locale pour tolérer les espaces.
 */
export const parseEntier = (str) => {
  if (typeof str === 'number') return Math.trunc(str);
  if (typeof str !== 'string') return NaN;
  const cleaned = str.replace(/[\s  ]/g, '');
  if (!/^\d+$/.test(cleaned)) return NaN;
  return parseInt(cleaned, 10);
};
