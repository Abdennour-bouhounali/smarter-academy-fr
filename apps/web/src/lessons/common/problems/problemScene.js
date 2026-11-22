/**
 * La logique PURE des « مشاهد » interactives d'une مسألة (`problem.scene`, 2026-10-13) — sans DOM, testée.
 *
 * Le dessin n'illustre pas : il se MANIPULE. L'élève fait varier UN nombre (le nombre de groupes, la
 * distance entre deux poteaux, le côté d'un carreau) et voit, sur le dessin, si la division tombe juste :
 * le reste est dessiné (hachuré) et la ligne « total = d × q + r » est recalculée. La scène ne donne
 * JAMAIS la réponse : elle dit seulement « sans reste » ou « il reste r » — c'est l'algorithme (Euclide)
 * qui trouve le plus grand, la scène le fait sentir.
 *
 * Trois formes (`kind`) :
 *   share — des objets à répartir en n groupes égaux :
 *           { kind: 'share', items: [{ label, count }], groupLabel, max, tone }
 *   fence — des poteaux tous les d mètres autour d'un rectangle ou d'un triangle, un poteau à chaque coin :
 *           { kind: 'fence', shape: 'rect' | 'triangle', sides: [a, b] | [a, b, c], unit, stepLabel, max, tone }
 *   tiles — un rectangle pavé de carrés de côté s :
 *           { kind: 'tiles', length, width, unit, stepLabel, max, tone }
 * `start` (facultatif) : la valeur initiale du curseur (défaut 2). `ariaLabel` (arabe) est obligatoire, comme pour GeoFigure.
 */
const SCENE_KINDS = Object.freeze(['share', 'fence', 'tiles']);
const SCENE_TONES = Object.freeze(['indigo', 'violet', 'amber', 'emerald', 'teal', 'sky', 'rose']);

/** Division euclidienne de `total` par `d` : { q, r, exact }. */
export function divide(total, d) {
  const q = Math.floor(total / d);
  const r = total - q * d;
  return { q, r, exact: r === 0 };
}

/** Une valeur du curseur, ramenée à un entier de [1, max]. */
export const clampStep = (v, max) => Math.min(max, Math.max(1, Math.round(Number(v) || 1)));

/** « total = d × q + r » — l'égalité recalculée affichée à l'élève (toujours vraie). */
export const equalityLine = (total, d) => {
  const { q, r } = divide(total, d);
  return `${total} = ${d} × ${q} + ${r}`;
};

/** Tous les côtés du contour sont-ils des multiples de d (un poteau à chaque coin) ? */
export const fenceFits = (sides, d) => sides.every((s) => s % d === 0);

/** Nombre de poteaux sur un contour FERMÉ quand d divise chaque côté : autant que d'intervalles. */
export const fencePostCount = (sides, d) => (fenceFits(sides, d) ? sides.reduce((t, s) => t + s / d, 0) : null);

/** Le carrelage : nombre de carreaux entiers par ligne et par colonne, et les restes. */
export function tileGrid(length, width, s) {
  const cols = divide(length, s);
  const rows = divide(width, s);
  return { cols: cols.q, rows: rows.q, restLength: cols.r, restWidth: rows.r, exact: cols.exact && rows.exact, tiles: cols.q * rows.q };
}

/**
 * Les sommets d'un contour, en unités du dessin (y vers le HAUT), côtés `sides` :
 * rectangle [a, b] → (0,0) (a,0) (a,b) (0,b) ; triangle [a, b, c] → base a, puis b et c (loi des cosinus).
 */
export function fenceVertices(shape, sides) {
  if (shape === 'rect') {
    const [a, b] = sides;
    return [[0, 0], [a, 0], [a, b], [0, b]];
  }
  const [a, b, c] = sides; // base a de A(0,0) à B(a,0) ; |BC| = b ; |CA| = c
  const x = (a * a + c * c - b * b) / (2 * a);
  const y = Math.sqrt(Math.max(0, c * c - x * x));
  return [[0, 0], [a, 0], [x, y]];
}

/** Côtés d'un contour dans l'ordre des sommets : [[from, to, length], …]. */
export function fenceEdges(shape, sides) {
  const v = fenceVertices(shape, sides);
  if (shape === 'rect') {
    const [a, b] = sides;
    return [[v[0], v[1], a], [v[1], v[2], b], [v[2], v[3], a], [v[3], v[0], b]];
  }
  const [a, b, c] = sides;
  return [[v[0], v[1], a], [v[1], v[2], b], [v[2], v[0], c]];
}

/** Les erreurs d'une scène (tableau vide = conforme). */
export function validateScene(scene) {
  const errors = [];
  if (!scene || typeof scene !== 'object') return ['scene absente'];
  if (!SCENE_KINDS.includes(scene.kind)) errors.push(`kind inconnu « ${scene.kind} »`);
  if (scene.tone != null && !SCENE_TONES.includes(scene.tone)) errors.push(`ton inconnu « ${scene.tone} »`);
  if (typeof scene.ariaLabel !== 'string' || !/[؀-ۿ]/.test(scene.ariaLabel)) errors.push('ariaLabel arabe obligatoire');
  const pos = (n) => Number.isInteger(n) && n > 0;
  if (!pos(scene.max)) errors.push('max : entier > 0');
  if (scene.kind === 'share') {
    if (!Array.isArray(scene.items) || scene.items.length < 1) errors.push('items : au moins un');
    else scene.items.forEach((it, i) => { if (!it.label || !pos(it.count)) errors.push(`items[${i}] : label et count entier > 0`); });
    if (!scene.groupLabel) errors.push('groupLabel manquant');
  }
  if (scene.kind === 'fence') {
    const n = scene.shape === 'rect' ? 2 : scene.shape === 'triangle' ? 3 : 0;
    if (!n) errors.push('shape : rect ou triangle');
    else if (!Array.isArray(scene.sides) || scene.sides.length !== n || !scene.sides.every(pos)) errors.push(`sides : ${n} entiers > 0`);
    else if (n === 3) {
      const [a, b, c] = scene.sides;
      if (a + b <= c || a + c <= b || b + c <= a) errors.push('sides : inégalité triangulaire');
    }
    if (!scene.unit) errors.push('unit manquant');
    if (!scene.stepLabel) errors.push('stepLabel manquant');
  }
  if (scene.kind === 'tiles') {
    if (!pos(scene.length) || !pos(scene.width)) errors.push('length et width : entiers > 0');
    if (!scene.unit) errors.push('unit manquant');
    if (!scene.stepLabel) errors.push('stepLabel manquant');
  }
  return errors;
}
