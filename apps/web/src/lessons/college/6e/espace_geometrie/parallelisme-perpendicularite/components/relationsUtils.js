/**
 * Modèle mathématique de la leçon « Parallélisme et perpendicularité ».
 *
 * ─── ÉTAT CANONIQUE ────────────────────────────────────────────────────
 * Une droite de la leçon est `{ p, angleDeg, name }` : un point par lequel
 * elle passe, et son INCLINAISON en degrés. L'angle est l'état ; le vecteur
 * directeur en est dérivé (toDirLine). Une seule variable pour l'élève :
 * l'inclinaison, qu'il fait tourner.
 *
 * ─── CONVENTION D'ANGLE, LOCALE À CETTE LEÇON ──────────────────────────
 * 0° = horizontal vers la droite ; les degrés croissent dans le sens des
 * aiguilles d'une montre À L'ÉCRAN, parce que l'axe y du SVG descend :
 *     dir = (cos θ, sin θ) avec y vers le bas
 * Cette convention n'est PAS celle de angleUtils.js (0° = est, sens
 * trigonométrique) ni celle de durationUtils.js (0° = midi). Ne jamais
 * copier-coller de formule polaire entre ces fichiers — c'est la classe de
 * bug la plus prévisible du dépôt.
 *
 * ─── LE JUGE UNIQUE ────────────────────────────────────────────────────
 * `relationOf` est la SEULE fonction qui décide si deux droites sont
 * parallèles, perpendiculaires ou sécantes, et elle délègue à geometry2d.
 * Aucun composant ne compare de pentes (une verticale donnerait Infinity) ni
 * de chaînes d'angles. Les marques dessinées (chevrons, angle droit, point
 * d'intersection) en découlent toutes : le dessin ne peut donc pas
 * contredire les mathématiques.
 */
import {
  lineThrough, pointAt, projectOnLine, distPointLine, intersect,
  areParallel, arePerpendicular, angleBetweenDeg, dist, midpoint,
} from '../../../../../common/utils/geometry2d';

export { projectOnLine, distPointLine, intersect, dist, midpoint, angleBetweenDeg };

const RAD = Math.PI / 180;

/** Vecteur directeur unitaire d'une inclinaison, dans le repère SVG. */
export function dirOf(angleDeg) {
  return { x: Math.cos(angleDeg * RAD), y: Math.sin(angleDeg * RAD) };
}

/** `{p, angleDeg}` → droite canonique `{p, d}` de geometry2d. */
export function toLine(line) {
  const d = dirOf(line.angleDeg);
  return lineThrough(line.p, { x: line.p.x + d.x * 100, y: line.p.y + d.y * 100 });
}

/** Angle réduit à [0 ; 180[ — deux inclinaisons opposées donnent la même droite. */
export function normalizeAngle(angleDeg) {
  return ((angleDeg % 180) + 180) % 180;
}

/* ── LE juge des relations ───────────────────────────────────────────── */

export const RELATIONS = {
  paralleles: 'paralleles',
  perpendiculaires: 'perpendiculaires',
  secantes: 'secantes',
  confondues: 'confondues',
};

/**
 * Relation entre deux droites. Unique décideur de toute la leçon.
 * `confondues` est un cas particulier montré une fois, jamais évalué.
 */
export function relationOf(l1, l2, eps = 1e-3) {
  const a = toLine(l1);
  const b = toLine(l2);
  if (areParallel(a, b, eps)) {
    // Parallèles ET distance nulle ⇒ c'est la même droite.
    return distPointLine(a, l2.p) < 0.5 ? RELATIONS.confondues : RELATIONS.paralleles;
  }
  if (arePerpendicular(a, b, eps)) return RELATIONS.perpendiculaires;
  return RELATIONS.secantes;
}

export const RELATION_LABEL = {
  paralleles: 'parallèles',
  perpendiculaires: 'perpendiculaires',
  secantes: 'sécantes',
  confondues: 'confondues',
};

/** Le symbole mathématique associé, pour la fiche à retenir. */
export const RELATION_SYMBOL = {
  paralleles: '//',
  perpendiculaires: '⊥',
  secantes: '×',
  confondues: '=',
};

/**
 * Point d'intersection, ou null si parallèles.
 * INVARIANT : null ⟺ relationOf vaut « paralleles » ou « confondues ».
 * C'est ce qui rend « deux parallèles ne se coupent jamais » démontrable.
 */
export function intersectionOf(l1, l2, eps = 1e-3) {
  return intersect(toLine(l1), toLine(l2), eps);
}

/* ── Écart et distance ───────────────────────────────────────────────── */

/**
 * Distance du point q à la droite. Toujours mesurée PERPENDICULAIREMENT —
 * c'est la définition, et c'est ce que le module 8 fait découvrir.
 */
export function distanceTo(line, q) {
  return distPointLine(toLine(line), q);
}

/** Le pied de la perpendiculaire : l'autre bout du plus court chemin. */
export function footOf(line, q) {
  return projectOnLine(toLine(line), q);
}

/**
 * Écart entre deux droites parallèles, mesuré depuis un point de la première.
 * Renvoie null si elles ne sont pas parallèles : « l'écart » n'a alors aucun
 * sens, puisqu'il change d'un bout à l'autre.
 */
export function gapBetween(l1, l2) {
  if (relationOf(l1, l2) === RELATIONS.secantes || relationOf(l1, l2) === RELATIONS.perpendiculaires) {
    return null;
  }
  return distanceTo(l2, l1.p);
}

/** Point de la droite l1 au paramètre t — pour promener un point dessus. */
export function pointOn(line, t) {
  return pointAt(toLine(line), t);
}

/* ── Constructions ───────────────────────────────────────────────────── */

/** La parallèle à `line` passant par q : même inclinaison, autre point. */
export function parallelThroughPoint(line, q, name = 'd′') {
  return { p: { x: q.x, y: q.y }, angleDeg: line.angleDeg, name };
}

/** La perpendiculaire à `line` passant par q : inclinaison + 90°. */
export function perpendicularThroughPoint(line, q, name = 'd′') {
  return { p: { x: q.x, y: q.y }, angleDeg: normalizeAngle(line.angleDeg + 90), name };
}

/* ── Instruments ─────────────────────────────────────────────────────── */

/**
 * L'équerre est-elle correctement posée pour vérifier/tracer ?
 * DEUX conditions, ni une ni trois — c'est le « rituel en deux gestes » :
 *   1. un côté de l'angle droit est aligné sur la droite ;
 *   2. le sommet de l'angle droit est sur le point visé.
 */
export function isEquerreAligned(equerre, line, point, { angleTol = 6, distTol = 12 } = {}) {
  const onLine = distanceTo(line, equerre.p) <= distTol;
  const atPoint = point ? dist(equerre.p, point) <= distTol : true;
  const da = Math.abs(normalizeAngle(equerre.angleDeg) - normalizeAngle(line.angleDeg));
  const aligned = Math.min(da, 180 - da) <= angleTol;
  return { onLine, atPoint, aligned, ok: onLine && atPoint && aligned };
}

/** Message français expliquant ce qui manque au placement de l'équerre. */
export function equerreHint(state) {
  if (state.ok) return 'L’équerre est bien posée.';
  if (!state.aligned) return 'Un côté de l’angle droit doit être posé le long de la droite.';
  if (!state.atPoint) return 'Le sommet de l’angle droit doit être exactement sur le point.';
  return 'Approche l’équerre de la droite.';
}
