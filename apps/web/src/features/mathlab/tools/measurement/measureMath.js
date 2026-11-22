/**
 * La MESURE — mathématique pure de « Grandeurs et mesures », sans React et sans écran.
 *
 * Tout ce que l'élève lit sur son rapporteur, sa règle ou sa grille sort
 * d'ici. C'est la couche qui doit être JUSTE : si `rectangleArea` se trompe,
 * l'élève ne découvre pas une règle fausse — il découvre une règle qui n'est
 * pas celle du monde, et l'instrument ment.
 *
 * ── Pourquoi aucune formule n'est nommée dans ce fichier ────────────────
 * `rectangleArea` COMPTE (longueur × largeur), et c'est bien la formule que
 * l'élève doit découvrir. Le secret n'est pas ici : il est dans ce que
 * l'interface MONTRE (§23 du cahier). Le moteur connaît la vérité — il faut
 * bien que quelqu'un la connaisse pour dire à l'élève que sa règle prédit 7
 * là où la mesure donne 12. Ce que l'instrument ne fait jamais, c'est
 * l'AFFICHER avant que l'élève ne l'ait construite.
 *
 * ── Exactitude ──────────────────────────────────────────────────────────
 * Les mesures se font sur des nombres flottants ; `cleanNumber` efface la
 * poussière binaire (0.30000000000000004 → 0.3) pour qu'une colonne de
 * tableau soit LISIBLE. Elle n'arrondit pas la mathématique, elle arrondit
 * l'affichage d'une mesure — et une mesure n'a de toute façon jamais plus de
 * chiffres que l'instrument qui l'a prise (§27).
 */

/** La tolérance d'une comparaison de mesures : deux longueurs égales à 1e-9 près le sont. */
const EPSILON = 1e-9;

/**
 * Efface la poussière des flottants sans toucher à la valeur.
 *
 * 0.1 + 0.2 vaut 0.30000000000000004 ; dans une colonne « Largeur » cela
 * s'affiche « 0,30000000000000004 » et l'élève cherche un motif dans du
 * bruit. Douze chiffres significatifs gardent tout ce qu'un collégien peut
 * mesurer et jettent le reste.
 */
export function cleanNumber(value) {
  if (!Number.isFinite(value)) return value;
  const rounded = Number(value.toPrecision(12));

  return Object.is(rounded, -0) ? 0 : rounded;
}

/** Deux mesures sont-elles égales, à la tolérance près ? */
export function nearlyEqual(a, b, tolerance = EPSILON) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;

  return Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b));
}

/** Une valeur ramenée dans [min, max] — un curseur ne sort jamais de sa règle. */
export function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;

  return Math.min(max, Math.max(min, value));
}

// ── Longueurs et angles ──────────────────────────────────────────────────

/** La distance entre deux points — la mesure que donne la règle. */
function distance(a, b) {
  if (!isPoint(a) || !isPoint(b)) return NaN;

  return cleanNumber(Math.hypot(b.x - a.x, b.y - a.y));
}

/** Un point valide ? (la frontière avec le JSON relu) */
function isPoint(p) {
  return Boolean(p) && typeof p === 'object' && Number.isFinite(p.x) && Number.isFinite(p.y);
}

/**
 * L'angle en B, en degrés, dans [0, 180] — ce que lit le rapporteur.
 *
 * Deux côtés confondus (B = A ou B = C) n'ont pas d'angle : on rend NaN
 * plutôt que 0, parce que 0 serait une MESURE, et il n'y en a pas.
 */
export function angleAt(a, b, c) {
  if (!isPoint(a) || !isPoint(b) || !isPoint(c)) return NaN;
  const u = { x: a.x - b.x, y: a.y - b.y };
  const v = { x: c.x - b.x, y: c.y - b.y };
  const nu = Math.hypot(u.x, u.y);
  const nv = Math.hypot(v.x, v.y);
  if (nu < EPSILON || nv < EPSILON) return NaN;
  const cosine = clamp((u.x * v.x + u.y * v.y) / (nu * nv), -1, 1);

  return cleanNumber((Math.acos(cosine) * 180) / Math.PI);
}

/** Les trois angles d'un triangle, dans l'ordre A, B, C. */
export function triangleAngles(a, b, c) {
  return [angleAt(c, a, b), angleAt(a, b, c), angleAt(b, c, a)];
}

// ── Aires et périmètres ──────────────────────────────────────────────────

/** L'aire d'un rectangle de côtés `length` et `width`. */
export function rectangleArea(length, width) {
  if (!Number.isFinite(length) || !Number.isFinite(width)) return NaN;

  return cleanNumber(length * width);
}

/** Le périmètre d'un rectangle : le tour, côté après côté. */
export function rectanglePerimeter(length, width) {
  if (!Number.isFinite(length) || !Number.isFinite(width)) return NaN;

  return cleanNumber(2 * (length + width));
}

/**
 * L'aire d'un triangle par ses trois sommets (formule du lacet).
 *
 * On passe par les COORDONNÉES et non par base × hauteur ÷ 2 : l'élève
 * déplace des sommets, et l'aire doit rester juste pour un triangle
 * quelconque, y compris quand le pied de la hauteur tombe hors de la base.
 * La valeur absolue rend la mesure indépendante du sens de parcours.
 */
export function triangleAreaFromVertices(a, b, c) {
  if (!isPoint(a) || !isPoint(b) || !isPoint(c)) return NaN;

  return cleanNumber(Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2);
}

/**
 * La HAUTEUR issue de C relative à la base [AB] : la distance de C à la
 * droite (AB). C'est ce que l'élève mesure avec le segment perpendiculaire
 * que l'instrument dessine.
 */
export function heightToBase(a, b, c) {
  const base = distance(a, b);
  if (!(base > EPSILON)) return NaN;

  return cleanNumber((2 * triangleAreaFromVertices(a, b, c)) / base);
}

/**
 * Le PIED de la hauteur issue de C sur (AB) — le point où le segment
 * perpendiculaire touche la base. Il peut tomber HORS du segment [AB] :
 * c'est un fait géométrique, l'instrument le dessine tel quel (le trait
 * devient pointillé) plutôt que de le ramener de force entre A et B.
 */
export function footOfAltitude(a, b, c) {
  if (!isPoint(a) || !isPoint(b) || !isPoint(c)) return null;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < EPSILON) return null;
  const t = ((c.x - a.x) * dx + (c.y - a.y) * dy) / lengthSquared;

  return { x: cleanNumber(a.x + t * dx), y: cleanNumber(a.y + t * dy), t: cleanNumber(t) };
}

// ── Le cercle ────────────────────────────────────────────────────────────

/**
 * La circonférence d'un cercle de rayon r.
 *
 * L'élève ne la lit jamais telle quelle : il DÉROULE le cercle sur une
 * règle (§10) et lit la longueur du fil. C'est la même valeur — mais le
 * geste est la moitié de la découverte.
 */
export function circleCircumference(radius) {
  if (!Number.isFinite(radius) || radius < 0) return NaN;

  return cleanNumber(2 * Math.PI * radius);
}

/** L'aire d'un disque de rayon r. */
export function circleArea(radius) {
  if (!Number.isFinite(radius) || radius < 0) return NaN;

  return cleanNumber(Math.PI * radius * radius);
}

/**
 * Le découpage du disque en secteurs, réarrangés en « presque rectangle »
 * (§11) : la manipulation qui fait APPARAÎTRE πr².
 *
 * Avec n secteurs, la figure obtenue a :
 *   - une base ≈ la DEMI-circonférence (πr), car un secteur sur deux est
 *     retourné et les arcs se répartissent en haut et en bas ;
 *   - une hauteur ≈ r, exactement r·cos(π/n) car la pointe du secteur
 *     redressé n'atteint pas tout à fait le rayon.
 *
 * On rend les deux valeurs APPROCHÉES réelles, pas les valeurs limites :
 * c'est précisément en voyant `hauteur` monter vers r quand n grandit que
 * l'élève comprend pourquoi l'égalité n'est vraie qu'à la limite.
 */
export function sectorRearrangement(radius, sectors) {
  if (!Number.isFinite(radius) || radius < 0) return null;
  const n = Math.max(2, Math.round(Number.isFinite(sectors) ? sectors : 8));
  const half = Math.PI / n;
  // La hauteur du « rectangle » : l'apothème du secteur redressé.
  const height = cleanNumber(radius * Math.cos(half));
  // Sa base : la demi-circonférence, portée par les arcs du bas.
  const width = cleanNumber(Math.PI * radius);
  // L'aire de la figure réarrangée est EXACTEMENT celle du disque : on ne
  // perd rien en découpant. C'est le rectangle qui n'est qu'approché.
  return {
    sectors: n,
    height,
    width,
    rectangleArea: cleanNumber(width * height),
    exactArea: circleArea(radius),
  };
}

// ── Les volumes ──────────────────────────────────────────────────────────

/** Le volume d'un cube d'arête a. */
export function cubeVolume(edge) {
  if (!Number.isFinite(edge) || edge < 0) return NaN;

  return cleanNumber(edge * edge * edge);
}

/** Le volume d'un pavé droit. */
export function cuboidVolume(length, width, height) {
  if (![length, width, height].every((v) => Number.isFinite(v) && v >= 0)) return NaN;

  return cleanNumber(length * width * height);
}

/**
 * Le DÉNOMBREMENT d'un pavé en cubes unités — ce que l'élève compte
 * réellement à l'écran (§13) : une couche, puis le nombre de couches.
 *
 * C'est la structure du produit, rendue visible. Les dimensions sont
 * arrondies à l'entier : on ne compte pas 3,5 cubes.
 */
export function cuboidUnitCount(length, width, height) {
  const l = Math.max(0, Math.round(length));
  const w = Math.max(0, Math.round(width));
  const h = Math.max(0, Math.round(height));

  return { perRow: l, rowsPerLayer: w, perLayer: l * w, layers: h, total: l * w * h };
}

/** Le dénombrement d'un rectangle en carrés unités : une ligne, puis les lignes. */
export function rectangleUnitCount(length, width) {
  const l = Math.max(0, Math.round(length));
  const w = Math.max(0, Math.round(width));

  return { perRow: l, rows: w, total: l * w };
}

// ── Pythagore ────────────────────────────────────────────────────────────

/**
 * Les trois carrés construits sur les côtés d'un triangle rectangle en B
 * (§15) : ce que l'élève COMPARE, en aires, avant qu'on ne nomme le théorème.
 */
export function squaresOnSides(a, b, c) {
  const side1 = distance(a, b);
  const side2 = distance(b, c);
  const hypotenuse = distance(a, c);

  return {
    side1,
    side2,
    hypotenuse,
    square1: cleanNumber(side1 * side1),
    square2: cleanNumber(side2 * side2),
    squareHypotenuse: cleanNumber(hypotenuse * hypotenuse),
    sum: cleanNumber(side1 * side1 + side2 * side2),
    rightAngle: angleAt(a, b, c),
  };
}

/** Le triangle est-il rectangle en B, à la tolérance d'une mesure près ? */
export function isRightAngled(a, b, c, toleranceDegrees = 0.5) {
  const angle = angleAt(a, b, c);

  return Number.isFinite(angle) && Math.abs(angle - 90) <= toleranceDegrees;
}

// ── Les conversions d'unités ─────────────────────────────────────────────

/**
 * Les unités de longueur du programme, par leur facteur vers le mètre.
 * L'élève n'apprend pas ce tableau : il le RECONSTRUIT en subdivisant un
 * segment (§14).
 */
const LENGTH_UNITS = Object.freeze({
  km: 1000, m: 1, dm: 0.1, cm: 0.01, mm: 0.001,
});

/** Le facteur d'une conversion de LONGUEUR : de `from` vers `to`. */
export function lengthFactor(from, to) {
  const a = LENGTH_UNITS[from];
  const b = LENGTH_UNITS[to];
  if (!a || !b) return NaN;

  return cleanNumber(a / b);
}

/**
 * Le facteur d'une conversion en DIMENSION `dimension` (1 longueur,
 * 2 aire, 3 volume) : le facteur des longueurs, à la puissance `dimension`.
 *
 * C'est TOUTE la découverte de §14 : 1 m = 100 cm, donc 1 m² = 100² cm² et
 * 1 m³ = 100³ cm³. La fonction ne récite pas un tableau — elle élève au
 * carré ou au cube le seul facteur qui existe, celui des longueurs.
 */
export function unitFactor(from, to, dimension = 1) {
  const base = lengthFactor(from, to);
  if (!Number.isFinite(base)) return NaN;
  const d = Math.round(dimension);
  if (d < 1 || d > 3) return NaN;

  return cleanNumber(base ** d);
}

/** Convertir une valeur d'une unité à une autre, en dimension 1, 2 ou 3. */
export function convert(value, from, to, dimension = 1) {
  if (!Number.isFinite(value)) return NaN;
  const factor = unitFactor(from, to, dimension);
  if (!Number.isFinite(factor)) return NaN;

  return cleanNumber(value * factor);
}

// ── La mesure approchée (§27) ────────────────────────────────────────────

/**
 * Une mesure ARRONDIE au pas de l'instrument — pas du bruit aléatoire.
 *
 * §27 demande qu'une mesure ne soit pas toujours un entier parfait ; mais
 * §27 interdit aussi d'introduire du hasard là où la découverte doit être
 * exacte. La réponse est un arrondi DÉTERMINISTE à la graduation : une
 * règle graduée au millimètre lit 3,98 et non 3,9812…, et deux élèves qui
 * mesurent le même segment lisent la même chose. Aucun `Math.random` dans
 * cet instrument.
 *
 * @param {number} value      la longueur vraie
 * @param {number} step       la graduation (0 = lecture exacte)
 */
export function readWithPrecision(value, step = 0) {
  if (!Number.isFinite(value)) return NaN;
  if (!Number.isFinite(step) || step <= 0) return cleanNumber(value);

  return cleanNumber(Math.round(value / step) * step);
}
