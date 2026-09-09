/**
 * Le modèle mathématique de « Produit scalaire : définir et détecter
 * l'orthogonalité ».
 *
 * Tout ce que les modules affichent en est DÉRIVÉ : aucun produit scalaire,
 * aucune ombre, aucune équation de droite n'est écrit à la main dans un
 * module. L'algèbre vectorielle vient de `common/utils/geometry2d` — ce
 * fichier NE LA RECRÉE PAS, il la spécialise pour la leçon.
 *
 * ─── L'IDÉE QUE TOUT LE FICHIER SERT ───────────────────────────────────
 * Deux recettes totalement différentes donnent le MÊME nombre :
 *
 *     ‖u‖ × (longueur signée de l'ombre de v sur la direction de u)
 *     x_u·x_v + y_u·y_v
 *
 * et ce nombre s'annule EXACTEMENT quand les deux flèches font un angle
 * droit. C'est cette coïncidence que le module 1 fait constater et que le
 * module 2 nomme.
 *
 * ─── LE SIGNE DE L'OMBRE ───────────────────────────────────────────────
 * `ombreSignee` vaut dot(u, v) / ‖u‖ et JAMAIS une longueur géométrique :
 * une longueur est positive par construction, si bien qu'un angle obtus
 * afficherait une ombre positive à côté d'un produit négatif — la figure
 * contredirait la leçon (règle de l'invariant visuel). Le pied de l'ombre
 * est `projectOnLine`, du module partagé.
 *
 * ─── LA CIBLE ATTEIGNABLE ──────────────────────────────────────────────
 * `PAS_DEG = 15` divise 90 : depuis le départ (v confondu avec u, k = 0),
 * l'angle droit est atteint en EXACTEMENT 6 crans. Et comme les crans
 * multiples de 6 sont construits par des quarts de tour EXACTS
 * (rotation entière (x ; y) ↦ (−y ; x)), les coordonnées de v y sont des
 * entiers et les deux afficheurs y valent 0 au bit près — pas « 1,8 × 10⁻¹⁵
 * arrondi à 0 ». Un test le verrouille.
 */
import {
  vec, add, scale, dot, norm, normalize, dist, cross,
  lineThrough, projectOnLine, arePerpendicular, angleBetweenDeg,
} from '../../../../../common/utils/geometry2d';

export { vec, add, scale, dot, norm, normalize, dist, cross, projectOnLine, arePerpendicular };

/* ── Écriture française ───────────────────────────────────────────────── */

/** Un nombre à la française : virgule, vrai signe moins, jamais « −0 ». */
export function fr(n, maxDecimals = 2) {
  if (!Number.isFinite(n)) return '?';
  let r = Math.round(n * 10 ** maxDecimals) / 10 ** maxDecimals;
  if (Object.is(r, -0) || r === 0) r = 0;
  return String(r).replace('.', ',').replace('-', '−');
}

/** Les coordonnées d'un vecteur ou d'un point : (4 ; −3). */
export const frVec = (v) => `(${fr(v.x)} ; ${fr(v.y)})`;

/**
 * Lecture d'une réponse numérique SIGNÉE.
 *
 * `parseDec` de @smarter-academy/core refuse le vrai signe moins « − »
 * (U+2212), celui que la leçon écrit partout ; `parseFr` refuse en plus les
 * décimaux. Une leçon dont la moitié des réponses sont négatives a donc
 * besoin de sa propre lecture, sans quoi « −12 » ne validerait jamais.
 */
export function parseSigned(str) {
  if (typeof str === 'number') return Number.isFinite(str) ? str : NaN;
  if (typeof str !== 'string') return NaN;
  const s = str
    .trim()
    .replace(/[\s  ]/g, '')
    .replace(/[−–—]/g, '-')
    .replace(',', '.');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  return Number(s);
}

/* ── Le laboratoire signature : « L'ombre portée » ────────────────────── */

/** Le cadre unique du laboratoire. 13 graduations sur chaque axe. */
export const RANGE = Object.freeze({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 });

/** L'origine commune des deux flèches, au centre du cadre. */
export const ORIGINE = Object.freeze({ x: 0, y: 0 });

/**
 * Le vecteur FIXE du laboratoire : u = (4 ; 3), de norme exactement 5.
 *
 * Choisi entier et de norme entière pour que ‖u‖ soit lisible sans racine, et
 * pour que les quarts de tour de v tombent eux aussi sur des entiers.
 */
export const U_LAB = Object.freeze({ x: 4, y: 3 });

/** Le rayon du cliquet : v garde une longueur constante, seul l'angle bouge. */
export const R_LAB = 5;

/** Le pas du cliquet, en degrés. DIVISE 90 : l'angle droit est atteignable. */
export const PAS_DEG = 15;

/** Le nombre de crans d'un tour complet. */
export const CRANS = 360 / PAS_DEG;

/** Les crans qui réalisent exactement l'angle droit, depuis k = 0. */
export const CRANS_DROITS = Object.freeze([CRANS / 4, (3 * CRANS) / 4]);

/**
 * Le vecteur v au cran k, de longueur `rayon`, tourné de k × 15° depuis u.
 *
 * CONSTRUCTION EXACTE AUX QUARTS DE TOUR. Le cran se décompose en q quarts de
 * tour et un reste r ∈ {0..5} : le reste passe par cos/sin, mais les q quarts
 * de tour sont appliqués par la rotation ENTIÈRE (x ; y) ↦ (−y ; x). Aux crans
 * 6, 12 et 18, v vaut donc exactement (−3 ; 4), (−4 ; −3), (3 ; −4) — des
 * entiers — et `produitCoordonnees(u, v)` y vaut 0 AU BIT PRÈS.
 *
 * Sans cette décomposition, le cran droit afficherait 1,78 × 10⁻¹⁵ : la
 * promesse « les deux afficheurs tombent à 0 exactement » serait fausse, et
 * `arePerpendicular` deviendrait un arrondi au lieu d'un fait.
 */
export function vAuCran(k, u = U_LAB, rayon = R_LAB) {
  const n = norm(u);
  if (n === 0) return { x: 0, y: 0 };
  const kk = ((k % CRANS) + CRANS) % CRANS;
  const q = Math.floor(kk / (CRANS / 4));
  const r = kk % (CRANS / 4);
  let bx = u.x / n;
  let by = u.y / n;
  if (r !== 0) {
    const t = (r * PAS_DEG * Math.PI) / 180;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const nx = bx * c - by * s;
    const ny = bx * s + by * c;
    bx = nx;
    by = ny;
  }
  for (let i = 0; i < q; i += 1) {
    const nx = -by;
    const ny = bx;
    bx = nx;
    by = ny;
  }
  return { x: bx * rayon, y: by * rayon };
}

/** L'angle (en degrés) entre u et v au cran k : exactement k × 15°, ramené dans [0 ; 180]. */
export function angleAuCran(k) {
  const kk = ((k % CRANS) + CRANS) % CRANS;
  const deg = kk * PAS_DEG;
  return deg > 180 ? 360 - deg : deg;
}

/* ── Les deux recettes ────────────────────────────────────────────────── */

/**
 * Recette 1 — l'OMBRE. Longueur SIGNÉE de la projection orthogonale de v sur
 * la direction de u : dot(u, v) / ‖u‖.
 *
 * Le signe est le cœur du module 1 : positif quand l'ombre part dans le sens
 * de u, NÉGATIF quand elle part à l'opposé. Le calculer comme une longueur
 * géométrique (`dist(origine, pied)`) donnerait toujours un nombre positif et
 * la figure contredirait le second afficheur dès l'angle obtus.
 */
export function ombreSignee(u, v) {
  const n = norm(u);
  if (n === 0) return 0;
  return dot(u, v) / n;
}

/** Le PIED de l'ombre : le projeté orthogonal de v sur la droite portée par u. */
export function piedOmbre(u, v, origine = ORIGINE) {
  const n = norm(u);
  if (n === 0) return { x: origine.x, y: origine.y };
  return projectOnLine(lineThrough(origine, add(origine, u)), add(origine, v));
}

/** Recette 1, affichée : ‖u‖ × (longueur signée de l'ombre). */
export function produitParOmbre(u, v) {
  return norm(u) * ombreSignee(u, v);
}

/** Recette 2, affichée : x_u·x_v + y_u·y_v. C'est `dot` de geometry2d. */
export function produitCoordonnees(u, v) {
  return dot(u, v);
}

/**
 * Les deux recettes coïncident-elles ? Sert au test de la PROMESSE du module 1,
 * pas à l'affichage : c'est l'élève qui doit constater l'égalité.
 */
export function lesDeuxCoincident(u, v, eps = 1e-9) {
  return Math.abs(produitParOmbre(u, v) - produitCoordonnees(u, v)) <= eps;
}

/**
 * Le produit scalaire par les normes et l'angle : ‖u‖ × ‖v‖ × cos(angle).
 * Employé au module 2 pour la formule P2 — et testé contre les coordonnées.
 */
export function produitParAngle(u, v) {
  const nu = norm(u);
  const nv = norm(v);
  if (nu === 0 || nv === 0) return 0;
  const a = (angleBetweenDeg(
    lineThrough(ORIGINE, u),
    lineThrough(ORIGINE, v),
  ) * Math.PI) / 180;
  // angleBetweenDeg est NON ORIENTÉ et vit dans [0 ; 90] : il perd le signe.
  // On le rétablit par le signe du produit scalaire, qui est la définition.
  const signe = Math.sign(dot(u, v)) || 1;
  return signe * nu * nv * Math.cos(a);
}

/** L'angle géométrique entre deux vecteurs non nuls, dans [0 ; 180]. */
export function angleVecteursDeg(u, v) {
  const nu = norm(u);
  const nv = norm(v);
  if (nu === 0 || nv === 0) return 0;
  const c = Math.max(-1, Math.min(1, dot(u, v) / (nu * nv)));
  return (Math.acos(c) * 180) / Math.PI;
}

/* ── Orthogonalité (P4) ───────────────────────────────────────────────── */

/**
 * Deux vecteurs sont orthogonaux ⟺ leur produit scalaire est nul.
 *
 * SEUL JUGE de l'orthogonalité dans la leçon. Aucun module ne compare des
 * coefficients directeurs : une flèche verticale donnerait Infinity, et le
 * critère cesserait de fonctionner exactement là où l'élève l'attend le plus.
 */
export function sontOrthogonaux(u, v, eps = 1e-9) {
  if (norm(u) < eps || norm(v) < eps) return false;
  return Math.abs(dot(u, v)) <= eps;
}

/* ── Bilinéarité et symétrie (P3) ─────────────────────────────────────── */

/**
 * Les trois identités que le module 3 fait CONSTATER avant de les énoncer.
 * Chacune renvoie les deux membres SÉPARÉMENT : c'est l'élève qui lit
 * l'égalité, le code ne la lui affirme pas.
 */
export const symetrie = (u, v) => ({ gauche: dot(u, v), droite: dot(v, u) });

export const homogeneite = (k, u, v) => ({
  gauche: dot(scale(u, k), v),
  droite: k * dot(u, v),
});

export const additivite = (u, v, w) => ({
  gauche: dot(u, add(v, w)),
  droite: dot(u, v) + dot(u, w),
});

/* ── Vecteur normal à une droite (P5) ─────────────────────────────────── */

/**
 * Un vecteur normal au vecteur directeur w : la rotation d'un quart de tour
 * (x ; y) ↦ (−y ; x). ENTIÈRE, donc exacte : le produit scalaire vaut 0 au bit
 * près pour tout w à coordonnées entières.
 */
export function normalDe(w) {
  return { x: -w.y, y: w.x };
}

/**
 * L'équation cartésienne ax + by + c = 0 de la droite passant par A et de
 * vecteur normal n = (a ; b). Le coefficient c est CALCULÉ en écrivant que A
 * appartient à la droite : c = −(a·xA + b·yA).
 */
export function equationCartesienne(A, n) {
  return { a: n.x, b: n.y, c: -(n.x * A.x + n.y * A.y) };
}

/** M appartient-il à la droite d'équation ax + by + c = 0 ? */
export function estSurLaDroite(eqn, M, eps = 1e-9) {
  return Math.abs(eqn.a * M.x + eqn.b * M.y + eqn.c) <= eps;
}

/** Le vecteur directeur d'une droite d'équation ax + by + c = 0 : (−b ; a). */
export function directeurDeEquation(eqn) {
  return { x: -eqn.b, y: eqn.a };
}

/**
 * L'équation écrite comme au tableau : « 3x − 2y + 6 = 0 », sans « 1x »,
 * sans « + −4 », sans « + 0 ».
 */
export function equationTexte(eqn) {
  const terme = (coef, lettre, premier) => {
    if (coef === 0) return '';
    const signe = coef < 0 ? '−' : premier ? '' : '+';
    const abs = Math.abs(coef);
    const nombre = abs === 1 ? '' : fr(abs);
    return `${signe}${signe && !premier ? ' ' : ''}${nombre}${lettre} `;
  };
  let s = terme(eqn.a, 'x', true);
  s += terme(eqn.b, 'y', s === '');
  if (eqn.c !== 0) {
    const signe = eqn.c < 0 ? '−' : '+';
    s += s === '' ? fr(eqn.c) : `${signe} ${fr(Math.abs(eqn.c))} `;
  }
  return `${s.trim()} = 0`;
}

/* ── Les scènes littérales de la leçon ────────────────────────────────── */

/**
 * Les données citées par les modules. Chaque valeur affichée à l'élève est
 * RECALCULÉE dans scalaireUtils.test.js : aucun nombre du texte n'est écrit
 * à la main sans être vérifié.
 */
export const SCENES = Object.freeze({
  /** M2 — deux vecteurs entiers pour poser les deux formules. */
  nommer: { u: { x: 3, y: 1 }, v: { x: 2, y: 4 } },            // u·v = 10
  /** M3 — symétrie, homogénéité, additivité. */
  proprietes: {
    u: { x: 3, y: 2 },
    v: { x: 1, y: 4 },
    w: { x: 2, y: -1 },
    // k = 2 et non 3 : 3u = (9 ; 6) SORT du cadre, et le module 3 doit pouvoir
    // DESSINER k·u comme une flèche — pas seulement l'écrire. 2u = (6 ; 4)
    // tient exactement dans le repère. Défaut trouvé par le test de cadre.
    k: 2,
  },
  /**
   * M4 — quatre couples à trancher par le CALCUL, et non à l'œil.
   *
   * Deux d'entre eux sont des TROMPE-L'ŒIL délibérés : leur angle vaut 86,8°
   * et 91,4°, écarts que personne ne voit sur une figure de 300 px. C'est ce
   * qui rend le module honnête — si les non-orthogonaux étaient à 42°, l'élève
   * trancherait à l'œil et n'aurait aucune raison de calculer. Les angles sont
   * vérifiés dans le test.
   */
  orthogonalite: [
    { id: 'o1', u: { x: 3, y: 2 }, v: { x: -2, y: 3 } },       // 0 → orthogonaux (90°)
    { id: 'o2', u: { x: 4, y: 3 }, v: { x: -2, y: 3 } },       // 1 → NON (86,8°)
    { id: 'o3', u: { x: 4, y: 5 }, v: { x: 6, y: -5 } },       // −1 → NON (91,2°)
    { id: 'o4', u: { x: -1, y: 4 }, v: { x: 4, y: 1 } },       // 0 → orthogonaux (90°)
  ],
  /** M5 — la droite et son vecteur normal. */
  normal: {
    A: { x: 1, y: 2 },
    directeur: { x: 3, y: -1 },       // n = (1 ; 3), équation x + 3y − 7 = 0
    autre: { A: { x: -2, y: 1 }, directeur: { x: 2, y: 4 } },  // n = (−4 ; 2)
  },
});

/**
 * Les couples d'orthogonalité, chacun avec son verdict CALCULÉ.
 * Le module ne stocke aucun « vrai / faux » : il lit celui-ci.
 */
export const verdictsOrthogonalite = () =>
  SCENES.orthogonalite.map((c) => ({
    ...c,
    produit: dot(c.u, c.v),
    orthogonaux: sontOrthogonaux(c.u, c.v),
  }));
