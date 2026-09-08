import { symCentral, symCentralPts, symAxial, rad } from '../../../../../common/geo5e/geo5e';

export { symCentral, symCentralPts, symAxial };

/**
 * Le noyau de la leçon « Transformations » (5e).
 *
 * LE PÉRIMÈTRE EST EXÉCUTABLE. La 5e ne connaît que le demi-tour : la
 * rotation d'un angle quelconque est de 4e. Cette frontière n'est pas un
 * commentaire dans un fichier de config — `rotate` LÈVE si on lui demande
 * autre chose que 180°, et le test le vérifie. Un module qui déraperait vers
 * la 4e casserait la suite au lieu de passer inaperçu.
 */
export function rotate(p, c, angleDeg) {
  if (Math.abs(Math.abs(angleDeg) - 180) > 1e-9) {
    throw new Error(
      `transformations-5e : seul le demi-tour (180°) est au programme de 5e ; reçu ${angleDeg}°. `
      + 'La rotation d’un angle quelconque est une notion de 4e.',
    );
  }
  return symCentral(p, c);
}

/** Le demi-tour, paramétré par un angle de 0 à 180° — pour l'ANIMER. */
export function rotatePartial(p, c, angleDeg) {
  const t = rad(angleDeg);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return {
    x: c.x + dx * Math.cos(t) - dy * Math.sin(t),
    y: c.y + dx * Math.sin(t) + dy * Math.cos(t),
  };
}

export const rotatePartialPts = (pts, c, angleDeg) =>
  pts.map((p) => rotatePartial(p, c, angleDeg));

/* ── Les figures de la leçon ─────────────────────────────────────────────── */

/**
 * Un drapeau : asymétrique, donc un demi-tour se VOIT (contrairement à un
 * carré, qui retomberait sur lui-même et cacherait le phénomène).
 *
 * TAILLE. Les sommets sont espacés d'au moins 60 px : c'est ce qui garantit
 * que leurs étiquettes (« A », « B »…) trouvent une place libre au lieu de se
 * marcher dessus, et que la figure occupe vraiment le cadre. Une figure
 * étriquée n'est pas seulement laide — ses noms de points deviennent
 * illisibles dès qu'on la fait tourner.
 */
export const DRAPEAU = [
  { x: 0, y: 0 }, { x: 0, y: -156 }, { x: 132, y: -120 }, { x: 40, y: -84 }, { x: 40, y: 0 },
];

/**
 * La lettre F : la figure TÉMOIN du module 6.
 *
 * Elle n'a ni axe ni centre de symétrie. C'est ce qui la rend décisive : un F
 * retourné par un pliage se reconnaît instantanément (il est « à l'envers »),
 * alors qu'un F ayant fait un demi-tour reste un F qu'on pourrait remettre
 * droit en le faisant glisser sur la table. Sur une figure symétrique, cette
 * différence serait invisible — et c'est justement pourquoi elle est
 * introuvable dans la plupart des exercices.
 */
export const LETTRE_F = [
  { x: 0, y: 0 }, { x: 0, y: -150 }, { x: 90, y: -150 }, { x: 90, y: -122 },
  { x: 30, y: -122 }, { x: 30, y: -88 }, { x: 76, y: -88 }, { x: 76, y: -60 },
  { x: 30, y: -60 }, { x: 30, y: 0 },
];

/** Un triangle quelconque — aucun angle droit, aucun côté égal. */
export const TRIANGLE = [{ x: 0, y: 0 }, { x: 168, y: 38 }, { x: 60, y: -108 }];

/** Place une figure modèle à une position donnée de la scène. */
export const placer = (forme, at) => forme.map((p) => ({ x: p.x + at.x, y: p.y + at.y }));

/**
 * Les figures du module 5 : lesquelles ont un centre de symétrie ?
 *
 * `centre` est null quand la figure n'en a pas — et c'est un fait VÉRIFIÉ par
 * `estCentreDeSymetrie`, pas une étiquette posée à la main.
 */
export const FIGURES_CENTRE = [
  {
    id: 'parallelogramme',
    nom: 'Parallélogramme',
    pts: [{ x: -70, y: -40 }, { x: 40, y: -40 }, { x: 70, y: 40 }, { x: -40, y: 40 }],
    aCentre: true,
  },
  {
    id: 'rectangle',
    nom: 'Rectangle',
    pts: [{ x: -80, y: -46 }, { x: 80, y: -46 }, { x: 80, y: 46 }, { x: -80, y: 46 }],
    aCentre: true,
  },
  {
    id: 'triangle',
    nom: 'Triangle équilatéral',
    pts: [{ x: 0, y: -62 }, { x: 54, y: 31 }, { x: -54, y: 31 }],
    aCentre: false,
  },
  {
    id: 'trapeze',
    nom: 'Trapèze isocèle',
    pts: [{ x: -40, y: -44 }, { x: 40, y: -44 }, { x: 80, y: 44 }, { x: -80, y: 44 }],
    aCentre: false,
  },
];

/**
 * La figure revient-elle exactement sur elle-même après un demi-tour autour
 * de `c` ? On compare les ENSEMBLES de sommets : l'ordre n'a pas à coïncider,
 * seule la figure compte.
 */
export function estCentreDeSymetrie(pts, c, tol = 1.5) {
  const images = symCentralPts(pts, c);
  return images.every((im) => pts.some((p) => Math.hypot(p.x - im.x, p.y - im.y) <= tol));
}

/** Le centre de symétrie d'une figure qui en a un : l'isobarycentre. */
export const centreDe = (pts) => ({
  x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
  y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
});

/**
 * Le TEST qui sépare demi-tour et pliage (module 6), calculé et non asséné :
 * une symétrie axiale RETOURNE la figure (l'aire orientée change de signe),
 * un demi-tour ne la retourne pas. C'est la seule différence observable qui
 * ne dépende ni de la position, ni de la figure choisie.
 */
export function aireOrientee(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i += 1) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    s += p.x * q.y - q.x * p.y;
  }
  return s / 2;
}

export const estRetournee = (avant, apres) =>
  Math.sign(aireOrientee(apres)) !== Math.sign(aireOrientee(avant));
