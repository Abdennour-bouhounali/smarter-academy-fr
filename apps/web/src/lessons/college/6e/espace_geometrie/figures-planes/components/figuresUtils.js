/**
 * Modèle mathématique de la leçon « Figures planes ».
 *
 * ─── ÉTAT CANONIQUE ────────────────────────────────────────────────────
 * Une figure est un simple tableau de SOMMETS `[{x,y}, …]`. Rien d'autre
 * n'est stocké : côtés, angles, propriétés et jusqu'au NOM de la figure en
 * sont DÉRIVÉS à chaque rendu.
 *
 * C'est l'architecture qui porte la leçon : quand l'élève déplace un sommet,
 * il ne « casse » pas une étiquette posée à la main — il fait réellement
 * perdre à la figure la propriété qui la définissait, et le nom change tout
 * seul. Une figure ne peut donc jamais être étiquetée « carré » sans en
 * vérifier les propriétés.
 *
 * ─── PÉRIMÈTRE 6e ──────────────────────────────────────────────────────
 * On CARACTÉRISE par propriétés (côtés égaux, angles droits, côtés
 * parallèles) ; on ne démontre pas. Les tolérances sont volontairement
 * lâches (3 % sur les longueurs, 1,5° sur les angles) : l'élève manipule à
 * la souris ou au doigt, pas au micron.
 */
import {
  sidesOf, sideLengths, interiorAngles, rightAngleCount, isRightAngleAt,
  allSidesEqual, oppositeSidesEqual, oppositeSidesParallel, diagonalLengths,
  perimeter, polygonArea, centroid, dist, midpoint,
} from '../../../../../common/utils/geometry2d';

export {
  sidesOf, sideLengths, interiorAngles, rightAngleCount, isRightAngleAt,
  allSidesEqual, oppositeSidesEqual, oppositeSidesParallel, diagonalLengths,
  perimeter, polygonArea, centroid, dist, midpoint,
};

/**
 * Tolérances de la leçon — une seule source, jamais de littéral dispersé.
 *
 * ATTENTION, CONTRAINTE D'AFFICHAGE : les longueurs sont montrées à l'élève
 * ARRONDIES à l'entier. La tolérance doit donc rester assez serrée pour que
 * deux côtés déclarés « égaux » affichent le MÊME nombre — sinon la figure
 * annonce « isocèle » pendant que les étiquettes disent 143 et 141, et
 * l'élève a raison de ne pas nous croire.
 *
 * Avec `lengthRatio: 0.04` sur un triangle de 190 px, l'écart toléré montait
 * à 7,6 px : c'est exactement ce défaut qui a été constaté. `absMax` plafonne
 * désormais l'écart à 1,5 px, soit au plus 1 unité d'arrondi.
 */
export const TOL = { lengthRatio: 0.04, absMax: 1.5, angleDeg: 1 };

/**
 * Deux longueurs sont-elles égales AU SENS DE LA LEÇON ?
 * On prend le plus contraignant des deux critères : relatif (pour les grandes
 * figures) et absolu (pour que l'affichage arrondi ne mente jamais).
 */
export function sameLength(a, b, max, epsRatio = TOL.lengthRatio) {
  return Math.abs(a - b) <= Math.min(epsRatio * max, TOL.absMax);
}

/* ── Les propriétés que la leçon ENSEIGNE ────────────────────────────── */

/**
 * Chaque propriété est un prédicat pur sur les sommets. Le catalogue sert à
 * la fois à l'affichage (les « voyants » de propriété) et à la
 * classification — les deux ne peuvent donc pas diverger.
 */
export const PROPERTIES = [
  {
    id: 'cotes-egaux',
    label: 'Tous les côtés égaux',
    short: '4 côtés égaux',
    test: (pts) => {
      const L = sideLengths(pts);
      const max = Math.max(...L);
      return L.every((l) => sameLength(l, L[0], max));
    },
  },
  {
    id: 'angles-droits',
    label: '4 angles droits',
    short: '4 angles droits',
    // Un quadrilatère à 4 angles droits a NÉCESSAIREMENT ses côtés opposés
    // égaux : c'est une conséquence, pas une condition supplémentaire. On la
    // vérifie quand même, car les seuls angles laissaient passer des figures
    // de travers (140/110/146/108 était accepté). Les deux tests ensemble ne
    // laissent passer qu'un vrai rectangle.
    test: (pts) => {
      if (pts.length !== 4) return false;
      if (rightAngleCount(pts, TOL.angleDeg) !== 4) return false;
      const L = sideLengths(pts);
      const max = Math.max(...L);
      return sameLength(L[0], L[2], max) && sameLength(L[1], L[3], max);
    },
  },
  {
    id: 'cotes-opposes-egaux',
    label: 'Côtés opposés égaux deux à deux',
    short: 'côtés opposés égaux',
    test: (pts) => {
      if (pts.length !== 4) return false;
      const L = sideLengths(pts);
      const max = Math.max(...L);
      return sameLength(L[0], L[2], max) && sameLength(L[1], L[3], max);
    },
  },
  {
    id: 'cotes-opposes-paralleles',
    label: 'Côtés opposés parallèles',
    short: 'côtés opposés parallèles',
    test: (pts) => oppositeSidesParallel(pts, TOL.lengthRatio),
  },
];

/** Toutes les propriétés vérifiées par une figure, sous forme d'objet. */
export function propertiesOf(pts) {
  return Object.fromEntries(PROPERTIES.map((p) => [p.id, p.test(pts)]));
}

/* ── Classification — LE nom est calculé, jamais posé ─────────────────── */

export const SHAPE_LABEL = {
  carre: 'carré',
  rectangle: 'rectangle',
  losange: 'losange',
  parallelogramme: 'parallélogramme',
  quadrilatere: 'quadrilatère quelconque',
  'triangle-equilateral': 'triangle équilatéral',
  'triangle-isocele': 'triangle isocèle',
  'triangle-rectangle': 'triangle rectangle',
  'triangle-quelconque': 'triangle quelconque',
  polygone: 'polygone',
};

/**
 * Nom d'un QUADRILATÈRE, du plus spécifique au plus général.
 * L'ordre des tests EST la hiérarchie enseignée : un carré est aussi un
 * rectangle et un losange, mais on annonce toujours le nom le plus précis.
 */
export function classifyQuad(pts) {
  if (pts.length !== 4) return 'polygone';
  const Lq = sideLengths(pts);
  const maxq = Math.max(...Lq);
  const equal = Lq.every((l) => sameLength(l, Lq[0], maxq));
  const right =
    rightAngleCount(pts, TOL.angleDeg) === 4 &&
    sameLength(Lq[0], Lq[2], maxq) &&
    sameLength(Lq[1], Lq[3], maxq);
  if (equal && right) return 'carre';
  if (right) return 'rectangle';
  if (equal) return 'losange';
  if (oppositeSidesParallel(pts, TOL.lengthRatio)) return 'parallelogramme';
  return 'quadrilatere';
}

/** Nom d'un TRIANGLE. Isocèle et rectangle peuvent coexister — on renvoie le
 *  cas le plus remarquable, et `triangleTraits` donne le détail complet. */
export function classifyTriangle(pts) {
  if (pts.length !== 3) return 'polygone';
  const L = sideLengths(pts);
  const max = Math.max(...L);
  const eq = (a, b) => sameLength(a, b, max);
  const equilateral = eq(L[0], L[1]) && eq(L[1], L[2]);
  if (equilateral) return 'triangle-equilateral';
  const isocele = eq(L[0], L[1]) || eq(L[1], L[2]) || eq(L[0], L[2]);
  const rectangle = rightAngleCount(pts, TOL.angleDeg) >= 1;
  if (rectangle) return 'triangle-rectangle';
  if (isocele) return 'triangle-isocele';
  return 'triangle-quelconque';
}

/** Les caractères d'un triangle, cumulables (un triangle peut être isocèle
 *  ET rectangle). C'est ce que le module 4 fait découvrir. */
export function triangleTraits(pts) {
  const L = sideLengths(pts);
  const max = Math.max(...L);
  const eq = (a, b) => sameLength(a, b, max);
  const nbEqual = [eq(L[0], L[1]), eq(L[1], L[2]), eq(L[0], L[2])].filter(Boolean).length;
  return {
    equilateral: nbEqual >= 3,
    isocele: nbEqual >= 1,
    rectangle: rightAngleCount(pts, TOL.angleDeg) >= 1,
  };
}

/** Nom de la figure, quel que soit son nombre de côtés. */
export function classify(pts) {
  if (pts.length === 3) return classifyTriangle(pts);
  if (pts.length === 4) return classifyQuad(pts);
  return 'polygone';
}

/** Nom français affichable, article compris. */
export function shapeName(pts) {
  return SHAPE_LABEL[classify(pts)] ?? 'figure';
}

/* ── Vocabulaire de base (module 2) ──────────────────────────────────── */

/** Nombre de côtés et de sommets — égaux pour tout polygone fermé. */
export function countsOf(pts) {
  return { cotes: pts.length, sommets: pts.length };
}

/** Nom d'un polygone d'après son nombre de côtés. */
export const POLYGON_BY_SIDES = {
  3: 'triangle',
  4: 'quadrilatère',
  5: 'pentagone',
  6: 'hexagone',
};

/** Étiquettes A, B, C… pour nommer les sommets d'une figure. */
export function vertexNames(n) {
  return Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
}

/* ── Contrôle d'une construction sous contraintes (module 7) ──────────── */

/**
 * Une consigne est une LISTE d'ids de propriétés à vérifier simultanément.
 * On renvoie le détail par propriété, jamais un simple booléen : l'élève
 * doit voir LAQUELLE manque encore.
 */
export function checkConstraints(pts, requiredIds) {
  const props = propertiesOf(pts);
  const detail = requiredIds.map((id) => ({
    id,
    label: PROPERTIES.find((p) => p.id === id)?.label ?? id,
    ok: !!props[id],
  }));
  return { detail, ok: detail.every((d) => d.ok) };
}
