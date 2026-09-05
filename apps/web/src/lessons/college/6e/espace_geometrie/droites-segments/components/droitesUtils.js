/**
 * Modèle mathématique de la leçon « Droites et segments ».
 *
 * ─── ÉTAT CANONIQUE ────────────────────────────────────────────────────
 * Un objet géométrique est TOUJOURS `{ kind, a, b }` où a et b sont ses deux
 * points DÉFINISSANTS et kind ∈ { 'droite', 'segment', 'demi-droite' }.
 *
 * La seule chose qui distingue les trois objets est leur ÉTENDUE — et cette
 * étendue est CALCULÉE (geometry2d.extentOf), jamais stockée. C'est pourquoi
 * changer le kind sans toucher à a ni b suffit à transformer un segment en
 * droite : c'est très exactement l'idée que la leçon enseigne.
 *
 * Conséquence d'architecture : aucun composant ne reçoit « dessine une
 * flèche » ou « dessine un point d'extrémité » en prop. Flèches, extrémités
 * et notation sont des fonctions du kind, de sorte que le dessin ne peut pas
 * contredire les mathématiques.
 *
 * ─── REPÈRE ────────────────────────────────────────────────────────────
 * Les coordonnées sont en unités SVG (y vers le BAS). Cette leçon ne montre
 * jamais de coordonnées à l'élève — elle parle de points nommés A, B, M —
 * donc l'inversion verticale du repérage n'a pas lieu d'être ici.
 */
import {
  lineThrough, dist, midpoint, projectOnLine, distPointLine, areCollinear,
  extentOf, endpointsOf, containsPoint, clipToBox, notationOf, describeObj,
} from '../../../../../common/utils/geometry2d';

export {
  extentOf, endpointsOf, containsPoint, clipToBox, notationOf, describeObj,
  dist, midpoint, areCollinear, projectOnLine, distPointLine, lineThrough,
};

/** Les trois objets au programme, dans l'ordre où la leçon les découvre. */
export const KINDS = ['segment', 'demi-droite', 'droite'];

export const KIND_LABEL = {
  segment: 'segment',
  'demi-droite': 'demi-droite',
  droite: 'droite',
};

/** Article défini français, pour composer des phrases correctes. */
export const KIND_ARTICLE = {
  segment: 'le',
  'demi-droite': 'la',
  droite: 'la',
};

/** Nombre d'extrémités — LA propriété discriminante de la leçon. */
export function endpointCount(kind) {
  return endpointsOf({ kind, a: { x: 0, y: 0 }, b: { x: 1, y: 0 } }).length;
}

/** Phrase française décrivant l'étendue, sans jargon. */
export function extentSentence(kind) {
  switch (kind) {
    case 'segment':
      return 'il s’arrête des deux côtés';
    case 'demi-droite':
      return 'elle s’arrête d’un seul côté et continue de l’autre';
    case 'droite':
      return 'elle continue des deux côtés, sans fin';
    default:
      throw new Error(`extentSentence: kind inconnu « ${kind} ».`);
  }
}

/** Le nom des extrémités réellement portées par l'objet. */
export function endpointNames(kind, nameA = 'A', nameB = 'B') {
  switch (kind) {
    case 'segment':
      return [nameA, nameB];
    case 'demi-droite':
      return [nameA];
    case 'droite':
      return [];
    default:
      throw new Error(`endpointNames: kind inconnu « ${kind} ».`);
  }
}

/* ── Prédicats enseignés ─────────────────────────────────────────────── */

/**
 * Le point q est-il ALIGNÉ avec a et b ? Tolérance en unités SVG : deux
 * pixels d'écart restent « alignés à l'œil » mais pas mathématiquement, ce
 * qui est exactement le piège que le module 4 fait constater.
 */
export function isAligned(a, b, q, eps = 1.5) {
  return areCollinear(a, b, q, eps * dist(a, b));
}

/** Écart d'un point à la droite (ab) — quantifie « à quel point c'est faux ». */
export function alignmentGap(a, b, q) {
  return distPointLine(lineThrough(a, b), q);
}

/** M est-il le milieu de [AB] ? Égalité des deux distances ET appartenance. */
export function isMidpoint(a, b, m, eps = 2) {
  if (!isAligned(a, b, m)) return false;
  return Math.abs(dist(a, m) - dist(m, b)) <= eps;
}

/** Écart entre les deux demi-longueurs — le chiffre montré à l'élève. */
export function midpointGap(a, b, m) {
  return Math.abs(dist(a, m) - dist(m, b));
}

/* ── Notation ────────────────────────────────────────────────────────── */

/**
 * Décompose une notation en ses deux symboles, pour l'expliquer côté par côté.
 * Un crochet ferme (une extrémité existe), une parenthèse ouvre (ça continue).
 */
export function notationParts(kind) {
  switch (kind) {
    case 'segment':
      return { left: '[', right: ']', leftMeans: 'ça s’arrête ici', rightMeans: 'ça s’arrête ici' };
    case 'demi-droite':
      return { left: '[', right: ')', leftMeans: 'ça s’arrête ici', rightMeans: 'ça continue sans fin' };
    case 'droite':
      return { left: '(', right: ')', leftMeans: 'ça continue sans fin', rightMeans: 'ça continue sans fin' };
    default:
      throw new Error(`notationParts: kind inconnu « ${kind} ».`);
  }
}

/** Toutes les notations d'une paire de points — utile pour les distracteurs. */
export function allNotations(nameA = 'A', nameB = 'B') {
  return KINDS.map((kind) => ({ kind, notation: notationOf({ kind }, nameA, nameB) }));
}

/**
 * Le kind correspondant à une notation écrite, ou null. On compare les
 * SYMBOLES encadrants, pas la chaîne entière : la notation peut porter
 * n'importe quels noms de points ([MN], [uv)…).
 */
export function kindOfNotation(notation) {
  const s = notation.trim();
  if (s.length < 2) return null;
  const left = s[0];
  const right = s[s.length - 1];
  return KINDS.find((kind) => {
    const p = notationParts(kind);
    return p.left === left && p.right === right;
  }) ?? null;
}
