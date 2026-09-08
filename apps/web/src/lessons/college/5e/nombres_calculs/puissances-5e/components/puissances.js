/**
 * Noyau numérique de la leçon « Puissances » (5e).
 *
 * Tout ce qui est vrai mathématiquement vit ici et nulle part ailleurs : les
 * modules affichent, ce fichier calcule. Chaque affirmation de la leçon
 * (« l'exposant compte les facteurs », « 10ⁿ s'écrit 1 suivi de n zéros »)
 * devient ainsi vérifiable par un test plutôt que par relecture.
 *
 * PÉRIMÈTRE 5e (objet officiel `puissances`, BO n°10 du 5 mars 2026) : le sens
 * de la notation, le carré et le cube, les carrés parfaits de 0 à 12, les
 * puissances de 10 d'exposant positif, et des calculs simples.
 *
 * HORS PÉRIMÈTRE — ce fichier REFUSE de le produire, par construction :
 *   — exposants négatifs : `puissance` LÈVE. C'est une garde exécutable du
 *     périmètre, pas un commentaire d'intention.
 *   — écriture scientifique (4e) : aucune fonction.
 *   — règles algébriques aⁿ × aᵐ = aⁿ⁺ᵐ (3e) : aucune fonction. La leçon ne
 *     fait que CALCULER des puissances, elle ne les combine jamais.
 */

/* ── La notation et son sens ───────────────────────────────────────────── */

/**
 * a puissance n — définie par la RÉPÉTITION, pas par `Math.pow`.
 *
 * L'implémentation est la définition que la leçon enseigne : on multiplie le
 * facteur par lui-même, n fois. Un test compare ce résultat à `Math.pow` ; ils
 * ne peuvent donc pas diverger sans que la suite le dise.
 *
 * L'exposant doit être un entier POSITIF ou NUL : un exposant négatif est un
 * objet de 4e, et cette leçon ne doit jamais pouvoir en afficher un.
 */
export const puissance = (base, exposant) => {
  if (!Number.isInteger(exposant)) {
    throw new Error(`exposant non entier : ${exposant}`);
  }
  if (exposant < 0) {
    throw new Error(`exposant négatif (hors périmètre 5e, réservé à la 4e) : ${exposant}`);
  }
  let r = 1;
  for (let i = 0; i < exposant; i += 1) r *= base;
  return r;
};

/** La liste des facteurs d'une puissance : [2, 2, 2] pour 2³. */
export const facteurs = (base, exposant) => {
  if (exposant < 0) throw new Error(`exposant négatif (hors périmètre 5e) : ${exposant}`);
  return Array.from({ length: exposant }, () => base);
};

/** Le produit écrit en toutes lettres : « 2 × 2 × 2 ». C'est ce que la notation remplace. */
export const produitEcrit = (base, exposant) => {
  if (exposant === 0) return '1';
  return facteurs(base, exposant).join(' × ');
};

/** L'écriture puissance, en texte simple : « 2³ ». */
const EXPOSANTS_HAUT = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

export const ecrirePuissance = (base, exposant) => {
  const e = String(exposant).split('').map((c) => EXPOSANTS_HAUT[Number(c)]).join('');
  return `${base}${e}`;
};

/** Comment une puissance se LIT à voix haute — le module 2 s'en sert. */
export const lirePuissance = (base, exposant) => {
  if (exposant === 2) return `${base} au carré`;
  if (exposant === 3) return `${base} au cube`;
  return `${base} puissance ${exposant}`;
};

/* ── Le piège central : ce que l'exposant N'EST PAS ────────────────────── */

/**
 * Les deux confusions que le module 2 vise, calculées pour pouvoir être
 * MONTRÉES à côté du bon résultat plutôt que seulement interdites :
 *   — lire aⁿ comme a × n (2⁵ → 10) ;
 *   — intervertir la base et l'exposant (2⁵ → 5²).
 */
export const confusionProduit = (base, exposant) => base * exposant;
export const confusionEchange = (base, exposant) => puissance(exposant, base);

/**
 * Diagnostique une réponse d'élève à un calcul de puissance. Renvoie un code
 * que le module traduit en phrase — la logique ici, les mots là-bas.
 */
export const diagnostiquerPuissance = (base, exposant, rep) => {
  if (rep === puissance(base, exposant)) return 'ok';
  if (rep === confusionProduit(base, exposant)) return 'multiplie';
  if (exposant >= 0 && base >= 0 && rep === confusionEchange(base, exposant)) return 'echange';
  return 'autre';
};

/* ── Carré et cube : la lecture géométrique ────────────────────────────── */

/** Aire d'un carré de côté n — c'est ce que « n au carré » veut dire. */
export const aireCarre = (n) => puissance(n, 2);

/** Volume d'un cube d'arête n — c'est ce que « n au cube » veut dire. */
export const volumeCube = (n) => puissance(n, 3);

/** Les carrés parfaits de 0 à 12, au programme de 5e. */
export const CARRES_PARFAITS = Array.from({ length: 13 }, (_, n) => ({ n, carre: puissance(n, 2) }));

/** `x` est-il le carré d'un entier de 0 à 12 ? */
export const estCarreParfait = (x) => CARRES_PARFAITS.some((c) => c.carre === x);

/** Le côté du carré d'aire `x`, s'il est entier entre 0 et 12 ; sinon null. */
export const coteDuCarre = (x) => CARRES_PARFAITS.find((c) => c.carre === x)?.n ?? null;

/* ── Puissances de 10 ──────────────────────────────────────────────────── */

/**
 * 10ⁿ s'écrit « 1 suivi de n zéros ». La leçon l'affirme ; cette fonction la
 * construit littéralement ainsi, et le test la compare à `puissance(10, n)`.
 */
export const dixPuissanceEcrit = (n) => {
  if (n < 0) throw new Error(`exposant négatif (hors périmètre 5e) : ${n}`);
  return `1${'0'.repeat(n)}`;
};

/** Le nom courant d'une puissance de 10, quand il existe. */
export const NOMS_DIX = {
  2: 'cent',
  3: 'mille',
  6: 'un million',
  9: 'un milliard',
};

/* ── Calculs simples contenant une puissance ───────────────────────────── */

/**
 * Priorité des puissances : elles se calculent AVANT les × et ÷, eux-mêmes
 * avant les + et −. C'est le seul ajout de cette leçon à la convention
 * installée par « Opérations » (5e), et le module 6 le fait constater.
 */
export const PRIORITE = { puissance: 3, produit: 2, somme: 1 };

/**
 * Évalue une expression de la forme `a + b × cⁿ` décrite par un objet, ce qui
 * évite tout parseur : les modules décrivent, ce fichier calcule.
 * Forme : { type: 'somme'|'produit'|'puissance'|'nombre', ... }
 */
export const evaluer = (e) => {
  if (e.type === 'nombre') return e.v;
  if (e.type === 'puissance') return puissance(evaluer(e.base), e.exposant);
  if (e.type === 'produit') return evaluer(e.a) * evaluer(e.b);
  if (e.type === 'somme') return evaluer(e.a) + evaluer(e.b);
  if (e.type === 'difference') return evaluer(e.a) - evaluer(e.b);
  throw new Error(`type d'expression inconnu : ${e.type}`);
};

/** Raccourcis de construction, pour que les modules restent lisibles. */
export const n = (v) => ({ type: 'nombre', v });
export const pow = (base, exposant) => ({ type: 'puissance', base: n(base), exposant });
export const mul = (a, b) => ({ type: 'produit', a, b });
export const add = (a, b) => ({ type: 'somme', a, b });
export const sub = (a, b) => ({ type: 'difference', a, b });

/* ── Données des modules — vérifiées par les tests ─────────────────────── */

/**
 * Module 1 : la légende de l'échiquier. Un grain sur la case 1, puis on
 * double. Le nombre de grains de la case k est 2^(k−1).
 */
export const grainsCase = (k) => puissance(2, k - 1);

/** Le nombre de cases que le laboratoire du module 1 laisse parcourir. */
export const CASES_MAX = 16;

/** Module 5 : des grandeurs réelles qui appellent une puissance de 10. */
export const GRANDEURS = [
  { nom: 'Un kilomètre en mètres', valeur: 1000, exposant: 3 },
  { nom: 'Un million de secondes', valeur: 1000000, exposant: 6 },
  { nom: 'Cent centimes dans un euro', valeur: 100, exposant: 2 },
];

/**
 * Lecture d'une saisie élève représentant un ENTIER positif. Le `parseFr` du
 * kit convient, mais on garde une fonction locale pour tolérer les espaces
 * (y compris l'espace fine insécable des milliers, que l'élève recopie).
 */
export const parseEntier = (str) => {
  if (typeof str === 'number') return Math.trunc(str);
  if (typeof str !== 'string') return NaN;
  const cleaned = str.replace(/[\s  ]/g, '');
  if (!/^\d+$/.test(cleaned)) return NaN;
  return parseInt(cleaned, 10);
};
