/**
 * labelLayout — placer les noms des points SANS collision ni sortie de cadre,
 * pour n'importe quelle configuration atteignable (INTERACTION_PEDAGOGY §17bis).
 *
 * Un nom de point n'a pas de position fixe : il a une ANCRE (le point, en
 * pixels SVG) et un jeu de positions candidates autour d'elle. On choisit,
 * point après point, la candidate qui reste dans le cadre et chevauche le
 * moins possible les autres points, les autres étiquettes déjà posées et les
 * segments à éviter. Pur, donc testable sur toute la grille.
 *
 * Largeurs : police 14 px « space » — ~0,62 em par glyphe, mesuré plutôt
 * que supposé pour un nom d'un ou deux caractères (A, B', C).
 */
const GLYPH = 0.62;

export const textWidth = (str, size = 14) => [...String(str)].reduce((n, c) => n + (c === "'" || c === '’' ? size * 0.3 : size * GLYPH), 0);

/** Les positions candidates : (décalage x, décalage y de la ligne de base, ancre du texte). */
const CANDIDATES = [
  [10, -8, 'start'], [-10, -8, 'end'], [10, 17, 'start'], [-10, 17, 'end'],
  [0, -13, 'middle'], [0, 21, 'middle'], [14, 5, 'start'], [-14, 5, 'end'],
];

/** La boîte d'un texte posé en (x, y) avec l'ancre donnée. */
function boxOf(x, y, w, h, anchor) {
  const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return { x0, y0: y - h * 0.8, x1: x0 + w, y1: y + h * 0.25 };
}
const overlapArea = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
const boxAroundDisc = (c, r) => ({ x0: c.x - r, y0: c.y - r, x1: c.x + r, y1: c.y + r });

/** Distance d'un rectangle à un segment (0 si le segment le traverse). */
function boxSegmentOverlap(box, s) {
  // Échantillonner le segment suffit ici (segments courts, boîtes de 20 px).
  const n = 24;
  let hits = 0;
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const x = s.from.x + (s.to.x - s.from.x) * t;
    const y = s.from.y + (s.to.y - s.from.y) * t;
    if (x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1) hits += 1;
  }
  return hits;
}

/**
 * @param {{id:string, name:string, x:number, y:number, r?:number}[]} anchors  points en px SVG
 * @param {{width:number, height:number}} frame                               le viewBox
 * @param {{segments?: {from:{x,y}, to:{x,y}}[], obstacles?: {x0,y0,x1,y1}[], size?: number}} [opts]
 *   `obstacles` : des boîtes à éviter comme les disques — les bandes des
 *   graduations du repère, par exemple (un point posé SUR un axe voyait son
 *   nom recouvrir une graduation).
 * @returns {{id, name, x, y, anchor, box}[]}
 */
export function placeLabels(anchors, frame, opts = {}) {
  const size = opts.size ?? 14;
  const segments = opts.segments ?? [];
  const obstacles = opts.obstacles ?? [];
  const placed = [];
  const discs = anchors.map((a) => boxAroundDisc(a, (a.r ?? 6) + 2));
  anchors.forEach((a, idx) => {
    const w = textWidth(a.name, size);
    let best = null;
    for (const [dx, dy, anchor] of CANDIDATES) {
      const x = a.x + dx; const y = a.y + dy;
      const box = boxOf(x, y, w, size, anchor);
      // Hors cadre : pénalité forte, proportionnelle au dépassement.
      const out = Math.max(0, -box.x0) + Math.max(0, box.x1 - frame.width) + Math.max(0, -box.y0) + Math.max(0, box.y1 - frame.height);
      let score = out * 1000;
      discs.forEach((d, j) => { if (j !== idx) score += overlapArea(box, d) * 4; });
      for (const p of placed) score += overlapArea(box, p.box) * 6;
      for (const s of segments) score += boxSegmentOverlap(box, s) * 3;
      for (const o of obstacles) score += overlapArea(box, o) * 4;
      if (!best || score < best.score) best = { score, x, y, anchor, box };
    }
    placed.push({ id: a.id, name: a.name, x: best.x, y: best.y, anchor: best.anchor, box: best.box, score: best.score });
  });
  return placed;
}

/**
 * Les bandes occupées par les graduations d'un CoordPlane : sous l'axe des
 * abscisses (étiquettes à O.y + 8…18) et à gauche de l'axe des ordonnées
 * (étiquettes ancrées en O.x − 8). Dérivées de la géométrie réelle, jamais
 * d'un décalage supposé.
 */
export function axisObstacles(geo) {
  const O = geo.toSvg(0, 0);
  return [
    { x0: 0, y0: O.y + 6, x1: geo.width, y1: O.y + 19 },
    { x0: O.x - 28, y0: 0, x1: O.x - 6, y1: geo.height },
  ];
}

/** Deux étiquettes placées se chevauchent-elles ? (pour les tests) */
export const labelsOverlap = (a, b) => overlapArea(a.box, b.box) > 1.5;
export const labelInFrame = (l, frame) => l.box.x0 >= -0.5 && l.box.y0 >= -0.5 && l.box.x1 <= frame.width + 0.5 && l.box.y1 <= frame.height + 0.5;
