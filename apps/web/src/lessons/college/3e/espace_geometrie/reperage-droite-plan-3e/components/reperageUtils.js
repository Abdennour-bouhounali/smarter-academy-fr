/**
 * Modèle mathématique de « Repérage sur une droite et dans le plan » (3e).
 *
 * ─── CE QUE CETTE LEÇON AJOUTE À CELLE DE 6e ───────────────────────────
 * En 6e (`reperage-plan`), le repère est un quadrillage à coordonnées
 * positives, et l'élève apprend à lire une case ou un nœud. Ici :
 *   - les coordonnées sont RELATIVES (quatre quadrants) ;
 *   - chaque coordonnée est reliée à UN déplacement (x → horizontal,
 *     y → vertical), ce qui est la clé de l'ordre du couple ;
 *   - les coordonnées deviennent un OUTIL : longueurs, milieux, figures.
 *
 * ─── CONVENTIONS ───────────────────────────────────────────────────────
 * Tous les points sont en coordonnées d'ÉLÈVE : x vers la droite, y vers le
 * HAUT. La conversion vers le repère SVG est faite par CoordPlane et nulle
 * part ailleurs. Aucune fonction d'ici ne connaît de pixel.
 *
 * ─── UNE DÉCISION MATHÉMATIQUE ─────────────────────────────────────────
 * `axisDistance` ne renvoie une longueur QUE pour un segment horizontal ou
 * vertical, et `null` sinon. C'est délibéré : la longueur d'un segment
 * oblique demande Pythagore, qui n'est pas encore disponible ici. Renvoyer
 * `null` oblige l'interface à dire « on ne peut pas encore », au lieu
 * d'afficher un nombre que la leçon n'a pas les moyens de justifier.
 */

/* ── Écriture française ───────────────────────────────────────────────── */

/** Un nombre à la française : virgule décimale et moins typographique (−). */
export function formatNumber(v, decimals = 0) {
  const r = decimals > 0 ? Number(v).toFixed(decimals).replace('.', ',') : String(Math.round(v));
  return r.replace('-', '−');
}

/** Le couple, avec le point-virgule de la notation française : (3 ; −2). */
export function formatCoords(p, decimals = 0) {
  return `(${formatNumber(p.x, decimals)} ; ${formatNumber(p.y, decimals)})`;
}

/** Phrase de lecture, pour les lecteurs d'écran et les corrections. */
export function readCoords(p, name) {
  const prefix = name ? `${name} ` : '';
  return `${prefix}a pour abscisse ${formatNumber(p.x)} et pour ordonnée ${formatNumber(p.y)}`;
}

/* ── Points ───────────────────────────────────────────────────────────── */

export function samePoint(a, b, eps = 1e-9) {
  return !!a && !!b && Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps;
}

/** Le couple inversé — le piège que la leçon fait VIVRE au module 2. */
export function swap(p) {
  return { x: p.y, y: p.x };
}

/**
 * Échanger les coordonnées change-t-il de point ?
 * Faux exactement sur la diagonale x = y — le seul cas où l'ordre ne se voit
 * pas, et donc le contre-exemple à ne pas choisir pour une démonstration.
 */
export function swapLandsElsewhere(p) {
  return !samePoint(p, swap(p));
}

/** Déplacement : +dx vers la droite, +dy vers le haut. */
export function displace(p, dx, dy) {
  return { x: p.x + dx, y: p.y + dy };
}

/** Le déplacement qui mène de a à b, lu comme un couple. */
export function displacementBetween(a, b) {
  return { dx: b.x - a.x, dy: b.y - a.y };
}

/** Phrase française d'un déplacement : « 3 vers la droite et 2 vers le bas ». */
export function describeDisplacement({ dx, dy }) {
  const parts = [];
  if (dx !== 0) parts.push(`${formatNumber(Math.abs(dx))} vers la ${dx > 0 ? 'droite' : 'gauche'}`);
  if (dy !== 0) parts.push(`${formatNumber(Math.abs(dy))} vers le ${dy > 0 ? 'haut' : 'bas'}`);
  if (parts.length === 0) return 'aucun déplacement';
  return parts.join(' et ');
}

/* ── Longueurs et milieux ─────────────────────────────────────────────── */

/** Le segment est-il horizontal (même ordonnée) ? */
export function isHorizontal(a, b, eps = 1e-9) {
  return Math.abs(a.y - b.y) < eps && Math.abs(a.x - b.x) > eps;
}

/** Le segment est-il vertical (même abscisse) ? */
export function isVertical(a, b, eps = 1e-9) {
  return Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) > eps;
}

/**
 * Longueur d'un segment horizontal ou vertical, lue sur les coordonnées :
 * c'est l'écart de la SEULE coordonnée qui change. Renvoie `null` pour un
 * segment oblique (voir l'en-tête) ou réduit à un point.
 */
export function axisDistance(a, b) {
  if (isHorizontal(a, b)) return Math.abs(b.x - a.x);
  if (isVertical(a, b)) return Math.abs(b.y - a.y);
  return null;
}

/** Nom de la coordonnée qui porte la longueur, pour l'expliquer à l'élève. */
export function axisOf(a, b) {
  if (isHorizontal(a, b)) return 'abscisses';
  if (isVertical(a, b)) return 'ordonnées';
  return null;
}

/** Milieu d'un segment : la moyenne de chaque coordonnée. */
export function midpointCoords(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/* ── Configurations ───────────────────────────────────────────────────── */

/** Symétrique d'un point par rapport à un axe du repère. */
export function reflectAcrossAxis(p, axis) {
  if (axis === 'x') return { x: p.x, y: -p.y };
  if (axis === 'y') return { x: -p.x, y: p.y };
  throw new Error(`reflectAcrossAxis: axe inconnu « ${axis} » (attendu : x ou y).`);
}

/** Symétrique par rapport à l'origine — les deux coordonnées changent de signe. */
export function reflectAcrossOrigin(p) {
  return { x: -p.x, y: -p.y };
}

/**
 * Quatrième sommet du parallélogramme ABCD : D = A + (C − B).
 * Pour un rectangle à côtés parallèles aux axes, c'est aussi le sommet qui
 * complète la figure — et c'est exactement l'opération que l'élève fait à la
 * main en comptant les carreaux.
 */
export function fourthVertex(a, b, c) {
  return { x: a.x + c.x - b.x, y: a.y + c.y - b.y };
}

/** Le quadrilatère (dans l'ordre) a-t-il ses côtés parallèles aux axes ? */
export function isAxisAlignedRectangle(pts, eps = 1e-9) {
  if (!pts || pts.length !== 4) return false;
  const [p, q, r, s] = pts;
  const horiz = (a, b) => Math.abs(a.y - b.y) < eps;
  const vert = (a, b) => Math.abs(a.x - b.x) < eps;
  const okA = horiz(p, q) && vert(q, r) && horiz(r, s) && vert(s, p);
  const okB = vert(p, q) && horiz(q, r) && vert(r, s) && horiz(s, p);
  if (!okA && !okB) return false;
  // Un rectangle aplati n'en est pas un.
  return Math.abs(p.x - r.x) > eps && Math.abs(p.y - r.y) > eps;
}

/**
 * Le triangle est-il isocèle, décidé sur les longueurs des côtés ?
 * Renvoie `{ isocele, sommet }` — `sommet` est l'indice du sommet principal.
 * On compare des carrés de longueurs : ce sont des entiers quand les points
 * sont sur les nœuds, donc la comparaison est EXACTE, sans tolérance.
 */
export function isoscelesByCoords(pts) {
  if (!pts || pts.length !== 3) return { isocele: false, sommet: null };
  const sq = (a, b) => (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  const [A, B, C] = pts;
  const ab = sq(A, B);
  const ac = sq(A, C);
  const bc = sq(B, C);
  if (ab === ac) return { isocele: true, sommet: 0 };
  if (ab === bc) return { isocele: true, sommet: 1 };
  if (ac === bc) return { isocele: true, sommet: 2 };
  return { isocele: false, sommet: null };
}

/** Dans quel quadrant se trouve le point ? 0 = sur un axe. */
export function quadrantOf(p, eps = 1e-9) {
  if (Math.abs(p.x) < eps || Math.abs(p.y) < eps) return 0;
  if (p.x > 0) return p.y > 0 ? 1 : 4;
  return p.y > 0 ? 2 : 3;
}

/** Le signe des deux coordonnées, en français, pour décrire un quadrant. */
export function describeQuadrant(p) {
  const q = quadrantOf(p);
  if (q === 0) return 'sur un axe';
  const sx = p.x > 0 ? 'positive' : 'négative';
  const sy = p.y > 0 ? 'positive' : 'négative';
  return `abscisse ${sx}, ordonnée ${sy}`;
}

/* ── Les scènes de la leçon (constantes littérales, jamais un état) ──── */

/** Le parc : le repère est centré sur la fontaine. */
export const PARC = {
  // Repère CARRÉ, et ce n'est pas cosmétique : avec un cadre plus large que
  // haut, le fantôme du couple inversé (y ; x) sortait du cadre pour 22
  // positions sur 143 — l'élève ne voyait alors rien du tout au moment
  // précis où la leçon veut lui montrer quelque chose.
  range: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
  lieux: [
    { id: 'fontaine', nom: 'la fontaine', emoji: '⛲', x: 0, y: 0 },
    { id: 'manege', nom: 'le manège', emoji: '🎠', x: 4, y: 3 },
    { id: 'kiosque', nom: 'le kiosque', emoji: '🎪', x: -3, y: 2 },
    { id: 'etang', nom: "l'étang", emoji: '🦆', x: -4, y: -3 },
    { id: 'entree', nom: "l'entrée", emoji: '🚪', x: 3, y: -4 },
    { id: 'arbre', nom: 'le grand chêne', emoji: '🌳', x: 0, y: -3 },
  ],
};

export function lieuById(id) {
  return PARC.lieux.find((l) => l.id === id) ?? null;
}

export const FIGURES = {
  rectangle: [{ x: -3, y: 2 }, { x: 3, y: 2 }, { x: 3, y: -1 }, { x: -3, y: -1 }],
  triangle: [{ x: -2, y: -2 }, { x: 2, y: -2 }, { x: 0, y: 3 }],
};
