/**
 * LA MATHÉMATIQUE des تحويلات — logique PURE : pas de React, pas de DOM, pas
 * de pixels. Tout ce que le laboratoire affiche se calcule ICI et nulle part
 * ailleurs — la règle de tout le مختبر (rational.js pour l'algèbre,
 * vectorMath.js pour les أشعة, trigMath.js pour les مثلثات).
 *
 * Le vocabulaire est celui du programme algérien de 4AM :
 *
 *     الانسحاب = translation        الدوران = rotation
 *     التناظر المحوري = symétrie axiale (réflexion)
 *     التناظر المركزي = symétrie centrale
 *     التحاكي = homothétie          الشعاع = vecteur
 *
 * ── Une transformation est une FONCTION du plan, pas un dessin ───────────
 * Chaque transformation est ici décrite par une MATRICE AFFINE 2×3
 *
 *     ⎡ a  c  e ⎤        (x, y) ↦ (a·x + c·y + e,  b·x + d·y + f)
 *     ⎣ b  d  f ⎦
 *
 * parce que c'est ce qui rend la COMPOSITION (§20) triviale — composer deux
 * transformations, c'est multiplier deux matrices, et la pile de §21 n'est
 * alors qu'un `reduce`. C'est aussi ce qui donne §27 (la vue matricielle)
 * gratuitement : la matrice n'est pas calculée POUR l'affichage, elle EST
 * la transformation.
 *
 * Aucune fonction n'arrondit : l'arrondi est un fait d'AFFICHAGE, fait au
 * dernier moment par grapherFormat.formatValue.
 */

/** En deçà, deux flottants issus d'un glissement ou d'un cos(90°) sont « le même ». */
export const EPSILON = 1e-9;

/** Un point du plan est `{x, y}` — rien d'autre, jamais d'identité ici. */
export const ORIGIN = Object.freeze({ x: 0, y: 0 });

const finite = Number.isFinite;

/** L'identité, comme matrice affine. */
export const IDENTITY = Object.freeze({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });

export function isPoint(p) {
  return Boolean(p) && finite(p.x) && finite(p.y);
}

function isMatrix(m) {
  return Boolean(m) && finite(m.a) && finite(m.b) && finite(m.c) && finite(m.d) && finite(m.e) && finite(m.f);
}

// ── Les quatre transformations, chacune comme une matrice ────────────────

/**
 * الانسحاب — translation de شعاع (a, b) : `(x, y) ↦ (x + a, y + b)`.
 *
 * C'est la seule des quatre dont la partie linéaire est l'identité : elle ne
 * fait QUE déplacer. C'est pourquoi elle conserve tout sauf les coordonnées.
 */
export function translation(vx, vy) {
  if (!finite(vx) || !finite(vy)) return null;

  return { a: 1, b: 0, c: 0, d: 1, e: vx, f: vy };
}

/**
 * الدوران — rotation d'angle θ (DEGRÉS, sens direct = trigonométrique)
 * autour d'un centre.
 *
 *     (x, y) ↦ centre + R(θ)·(point − centre)
 *
 * L'angle est reçu en degrés parce que c'est l'unité du manuel de 4AM et
 * celle de toutes les commandes de l'instrument ; la conversion est faite
 * ici, une fois, et jamais dans un composant.
 *
 * Les angles DROITS sont traités exactement : `Math.cos(Math.PI / 2)` vaut
 * 6,12e−17 et non 0, et une rotation de 90° d'un point à coordonnées
 * entières doit rendre des ENTIERS — sans quoi §25 affiche « 3,0000000000000004 »
 * et §24 déclare qu'une longueur n'est pas conservée. C'est la robustesse
 * numérique exigée par §55, et elle se joue ici, à la source.
 */
export function rotation(angleDeg, center = ORIGIN) {
  if (!finite(angleDeg) || !isPoint(center)) return null;
  const { cos, sin } = exactCosSin(angleDeg);

  // Autour de C : translate(−C) → rotate → translate(+C), déjà réduit.
  return {
    a: cos, b: sin, c: -sin, d: cos,
    e: center.x - cos * center.x + sin * center.y,
    f: center.y - sin * center.x - cos * center.y,
  };
}

/**
 * Cosinus et sinus d'un angle en degrés, EXACTS sur les multiples de 90°.
 *
 * Hors de ces quatre angles on rend la valeur flottante ordinaire : elle est
 * juste, et l'affichage l'arrondit. Sur les quatre, on rend −1, 0 ou 1 tels
 * quels, pour que « rotation de 180° » soit exactement `(x,y) ↦ (−x,−y)`.
 */
function exactCosSin(angleDeg) {
  const normalized = normalizeAngle(angleDeg);
  if (Math.abs(normalized % 90) < EPSILON) {
    const quarter = ((Math.round(normalized / 90) % 4) + 4) % 4;

    return [
      { cos: 1, sin: 0 },
      { cos: 0, sin: 1 },
      { cos: -1, sin: 0 },
      { cos: 0, sin: -1 },
    ][quarter];
  }
  const radians = (normalized * Math.PI) / 180;

  return { cos: Math.cos(radians), sin: Math.sin(radians) };
}

/** Un angle ramené dans [0, 360). */
export function normalizeAngle(angleDeg) {
  if (!finite(angleDeg)) return 0;
  const value = angleDeg % 360;

  return value < 0 ? value + 360 : value;
}

/**
 * التناظر المحوري — réflexion à travers une droite.
 *
 * La droite est donnée par un POINT et une DIRECTION (dx, dy), jamais par
 * `y = ax + b` : cette forme-là ne sait pas dire « la droite verticale
 * x = 3 », qui est pourtant la première que l'élève trace. La conversion
 * depuis `y = ax + b` ou depuis deux points est faite par `lineFrom*` plus
 * bas — une seule représentation dans le moteur.
 *
 *     Avec u = (dx, dy) unitaire, la partie linéaire est
 *     ⎡ dx²−dy²   2·dx·dy ⎤
 *     ⎣ 2·dx·dy   dy²−dx² ⎦
 *
 * Son déterminant vaut −1 : c'est la trace algébrique du fait qu'une
 * réflexion RETOURNE l'orientation (§24).
 */
export function reflection(line) {
  const normalized = normalizeLine(line);
  if (!normalized) return null;
  const { point, dx, dy } = normalized;
  const a = dx * dx - dy * dy;
  const b = 2 * dx * dy;

  // Autour d'une droite passant par P : translate(−P) → réfléchir → translate(+P).
  return {
    a, b, c: b, d: -a,
    e: point.x - a * point.x - b * point.y,
    f: point.y - b * point.x + a * point.y,
  };
}

/**
 * التحاكي — homothétie de centre C et de rapport k.
 *
 *     (x, y) ↦ C + k·(point − C)
 *
 * `k = −1` est exactement la symétrie centrale de centre C (التناظر المركزي),
 * et c'est volontairement le MÊME code : l'élève de §36 qui tire le rapport
 * de 2 vers −1 voit la figure se retourner à travers le centre, et découvre
 * que la symétrie centrale n'est pas une cinquième transformation.
 */
export function dilation(k, center = ORIGIN) {
  if (!finite(k) || !isPoint(center)) return null;

  return {
    a: k, b: 0, c: 0, d: k,
    e: center.x * (1 - k),
    f: center.y * (1 - k),
  };
}

// ── Les droites : une seule représentation, plusieurs entrées ────────────

/**
 * Une droite normalisée : un point dessus et une direction UNITAIRE.
 * Rend `null` pour une direction nulle — une « droite » sans direction n'en
 * est pas une, et réfléchir à travers elle n'a pas de sens (§55).
 */
export function normalizeLine(line) {
  if (!line || !isPoint(line.point)) return null;
  const { dx, dy } = line;
  if (!finite(dx) || !finite(dy)) return null;
  const length = Math.hypot(dx, dy);
  if (!(length > EPSILON)) return null;

  return { point: { x: line.point.x, y: line.point.y }, dx: dx / length, dy: dy / length };
}

/** La droite par deux points — `null` s'ils sont confondus (§55). */
export function lineFromPoints(a, b) {
  if (!isPoint(a) || !isPoint(b)) return null;

  return normalizeLine({ point: a, dx: b.x - a.x, dy: b.y - a.y });
}

/** La droite `y = slope·x + intercept`. Ne peut pas être verticale, par construction. */
export function lineFromSlope(slope, intercept) {
  if (!finite(slope) || !finite(intercept)) return null;

  return normalizeLine({ point: { x: 0, y: intercept }, dx: 1, dy: slope });
}

/** La droite verticale `x = value`. */
export function verticalLine(value) {
  return finite(value) ? normalizeLine({ point: { x: value, y: 0 }, dx: 0, dy: 1 }) : null;
}

/** La droite horizontale `y = value`. */
export function horizontalLine(value) {
  return finite(value) ? normalizeLine({ point: { x: 0, y: value }, dx: 1, dy: 0 }) : null;
}

/** Le projeté orthogonal d'un point sur une droite — le pied de la perpendiculaire (§15). */
export function projectOnLine(point, line) {
  const normalized = normalizeLine(line);
  if (!normalized || !isPoint(point)) return null;
  const { point: origin, dx, dy } = normalized;
  const t = (point.x - origin.x) * dx + (point.y - origin.y) * dy;

  return { x: origin.x + t * dx, y: origin.y + t * dy };
}

// ── Appliquer, composer, inverser ────────────────────────────────────────

/** L'image d'un point par une matrice affine. */
export function applyMatrix(matrix, point) {
  if (!isMatrix(matrix) || !isPoint(point)) return null;

  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  };
}

/**
 * La COMPOSITION : `compose(m2, m1)` applique m1 PUIS m2 — l'ordre des
 * mathématiques, `(m2 ∘ m1)(p) = m2(m1(p))`.
 *
 * C'est de cette convention que §23 tire sa leçon : `compose(R, T)` et
 * `compose(T, R)` sont deux matrices DIFFÉRENTES, et l'élève le voit sans
 * qu'on le lui dise.
 */
export function compose(m2, m1) {
  if (!isMatrix(m2) || !isMatrix(m1)) return null;

  return {
    a: m2.a * m1.a + m2.c * m1.b,
    b: m2.b * m1.a + m2.d * m1.b,
    c: m2.a * m1.c + m2.c * m1.d,
    d: m2.b * m1.c + m2.d * m1.d,
    e: m2.a * m1.e + m2.c * m1.f + m2.e,
    f: m2.b * m1.e + m2.d * m1.f + m2.f,
  };
}

/**
 * La composition d'une LISTE, dans l'ordre d'application : `[T, R]` rend la
 * matrice « T puis R ». C'est l'ordre de lecture de la pile de §21, de haut
 * en bas, et donc le seul que l'instrument manipule.
 */
export function composeAll(matrices) {
  if (!Array.isArray(matrices)) return IDENTITY;

  return matrices.reduce((accumulated, matrix) => {
    if (!isMatrix(matrix)) return accumulated;

    return compose(matrix, accumulated);
  }, IDENTITY);
}

/** Le déterminant de la partie linéaire : le facteur d'AIRE signé (§19, §24). */
export function determinant(matrix) {
  return isMatrix(matrix) ? matrix.a * matrix.d - matrix.b * matrix.c : Number.NaN;
}

/**
 * La transformation inverse — `null` quand elle n'existe pas.
 *
 * Une homothétie de rapport 0 écrase le plan sur un point : elle n'est pas
 * inversible, et c'est un fait mathématique que l'instrument doit dire
 * plutôt que de rendre des infinis (§55).
 */
export function invert(matrix) {
  const det = determinant(matrix);
  if (!finite(det) || Math.abs(det) < EPSILON) return null;

  return {
    a: matrix.d / det,
    b: -matrix.b / det,
    c: -matrix.c / det,
    d: matrix.a / det,
    e: (matrix.c * matrix.f - matrix.d * matrix.e) / det,
    f: (matrix.b * matrix.e - matrix.a * matrix.f) / det,
  };
}

// ── La géométrie mesurée (§29, §30, §31, §32) ────────────────────────────

/** La distance AB. */
export function distance(a, b) {
  if (!isPoint(a) || !isPoint(b)) return Number.NaN;

  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Le milieu de [AB]. */
export function midpoint(a, b) {
  if (!isPoint(a) || !isPoint(b)) return null;

  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * L'angle ∠ABC en degrés, mesuré AU SOMMET B, dans [0, 180].
 *
 * Rend `NaN` quand un des deux côtés est de longueur nulle : l'angle n'est
 * alors pas défini, et l'inspecteur doit écrire « — » plutôt qu'un zéro qui
 * mentirait (§55).
 */
export function angleAt(a, b, c) {
  if (!isPoint(a) || !isPoint(b) || !isPoint(c)) return Number.NaN;
  const u = { x: a.x - b.x, y: a.y - b.y };
  const v = { x: c.x - b.x, y: c.y - b.y };
  const lu = Math.hypot(u.x, u.y);
  const lv = Math.hypot(v.x, v.y);
  if (!(lu > EPSILON) || !(lv > EPSILON)) return Number.NaN;
  const cosine = Math.min(1, Math.max(-1, (u.x * v.x + u.y * v.y) / (lu * lv)));

  return (Math.acos(cosine) * 180) / Math.PI;
}

/**
 * L'aire SIGNÉE d'un polygone (formule du lacet / shoelace).
 *
 * Signée, et c'est tout l'intérêt : son SIGNE est l'orientation du polygone,
 * et c'est lui qui permet à §24 de dire honnêtement qu'une réflexion
 * retourne l'orientation alors qu'une rotation la conserve. L'aire affichée
 * à l'élève est sa valeur absolue (`area`), mais le signe, lui, est un fait
 * mathématique que l'instrument ne jette pas.
 */
function signedArea(vertices) {
  if (!Array.isArray(vertices) || vertices.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < vertices.length; i += 1) {
    const current = vertices[i];
    const next = vertices[(i + 1) % vertices.length];
    if (!isPoint(current) || !isPoint(next)) return Number.NaN;
    sum += current.x * next.y - next.x * current.y;
  }

  return sum / 2;
}

/** L'aire d'un polygone : toujours positive, quelle que soit l'orientation. */
export function area(vertices) {
  const signed = signedArea(vertices);

  return finite(signed) ? Math.abs(signed) : Number.NaN;
}

/** L'orientation d'un polygone : `1` direct, `−1` indirect, `0` aplati (§24). */
export function orientation(vertices) {
  const signed = signedArea(vertices);
  if (!finite(signed) || Math.abs(signed) < EPSILON) return 0;

  return signed > 0 ? 1 : -1;
}

/** Le périmètre d'une ligne polygonale fermée. */
export function perimeter(vertices) {
  if (!Array.isArray(vertices) || vertices.length < 2) return 0;
  let sum = 0;
  for (let i = 0; i < vertices.length; i += 1) {
    const d = distance(vertices[i], vertices[(i + 1) % vertices.length]);
    if (!finite(d)) return Number.NaN;
    sum += d;
  }

  return sum;
}

/** Les longueurs des côtés, dans l'ordre des sommets. */
export function sideLengths(vertices) {
  if (!Array.isArray(vertices) || vertices.length < 2) return [];

  return vertices.map((vertex, i) => distance(vertex, vertices[(i + 1) % vertices.length]));
}

/** Les angles intérieurs, un par sommet, dans l'ordre des sommets. */
export function interiorAngles(vertices) {
  if (!Array.isArray(vertices) || vertices.length < 3) return [];

  return vertices.map((vertex, i) => angleAt(
    vertices[(i - 1 + vertices.length) % vertices.length],
    vertex,
    vertices[(i + 1) % vertices.length],
  ));
}

/**
 * Un polygone est-il DÉGÉNÉRÉ ? (§55)
 *
 * Trois sommets alignés, ou deux confondus : l'aire est nulle, les angles ne
 * veulent plus rien dire. L'instrument ne refuse pas de le dessiner — l'élève
 * a le droit d'aplatir son triangle en le tirant — mais l'inspecteur doit
 * pouvoir le DIRE au lieu d'afficher des mesures fausses.
 */
export function isDegenerate(vertices) {
  if (!Array.isArray(vertices) || vertices.length < 3) return true;

  return Math.abs(signedArea(vertices)) < EPSILON;
}

// ── Les constructions (§33) ──────────────────────────────────────────────

/**
 * Les sommets d'un polygone RÉGULIER : centre, rayon, nombre de côtés.
 * Le premier sommet est à l'angle `startDeg` (90° par défaut : sommet en
 * haut, comme un élève le dessine).
 */
export function regularPolygon(center, radius, sides, startDeg = 90) {
  if (!isPoint(center) || !finite(radius) || !Number.isInteger(sides) || sides < 3) return [];
  const vertices = [];
  for (let i = 0; i < sides; i += 1) {
    const { cos, sin } = exactCosSin(startDeg + (360 * i) / sides);
    vertices.push({ x: center.x + radius * cos, y: center.y + radius * sin });
  }

  return vertices;
}

/** Les quatre sommets d'un rectangle donné par son coin bas-gauche, sa largeur et sa hauteur. */
export function rectangleVertices(corner, width, height) {
  if (!isPoint(corner) || !finite(width) || !finite(height)) return [];

  return [
    { x: corner.x, y: corner.y },
    { x: corner.x + width, y: corner.y },
    { x: corner.x + width, y: corner.y + height },
    { x: corner.x, y: corner.y + height },
  ];
}

// ── L'accrochage à la grille (§34) ───────────────────────────────────────

/** Une coordonnée accrochée au pas `step` — `step = 0` ou absent : rien n'est accroché. */
export function snapValue(value, step) {
  if (!finite(value)) return value;
  if (!finite(step) || !(step > 0)) return value;

  return Math.round(value / step) * step;
}

/** Un point accroché. */
export function snapPoint(point, step) {
  if (!isPoint(point)) return point;

  return { x: snapValue(point.x, step), y: snapValue(point.y, step) };
}

/**
 * Le BRUIT de virgule flottante, effacé.
 *
 * `0.30000000000000004` n'est pas une mesure, c'est un artefact. §55 interdit
 * de le montrer ; on le supprime donc à la source, dès qu'un point est posé
 * dans la scène — pas seulement à l'affichage — pour que l'élève qui lit
 * « 3 » et l'élève qui lit la table de §25 lisent le MÊME nombre.
 */
export function cleanNumber(value, decimals = 10) {
  if (!finite(value)) return value;
  const rounded = Number(value.toFixed(decimals));

  return Object.is(rounded, -0) ? 0 : rounded;
}

/** Un point débarrassé de son bruit. */
export function cleanPoint(point) {
  if (!isPoint(point)) return point;

  return { x: cleanNumber(point.x), y: cleanNumber(point.y) };
}

/** Deux points sont-ils confondus, à la tolérance près ? */
export function samePoint(a, b, tolerance = 1e-6) {
  if (!isPoint(a) || !isPoint(b)) return false;

  return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;
}

/** Deux listes de sommets se superposent-elles, sommet par sommet ? (§42, les puzzles) */
export function sameVertices(first, second, tolerance = 1e-6) {
  if (!Array.isArray(first) || !Array.isArray(second) || first.length !== second.length) return false;

  return first.every((vertex, i) => samePoint(vertex, second[i], tolerance));
}

/**
 * Les deux figures se superposent-elles en tant qu'ENSEMBLES de sommets ?
 *
 * Un triangle posé sur sa cible est le même triangle, que l'élève y soit
 * arrivé en partant de A ou de B : le puzzle de §42 doit donc accepter toute
 * permutation CIRCULAIRE des sommets, dans les deux sens de parcours — une
 * réflexion renverse l'ordre sans déplacer la figure.
 */
export function figuresCoincide(first, second, tolerance = 1e-6) {
  if (!Array.isArray(first) || !Array.isArray(second) || first.length !== second.length || first.length === 0) {
    return false;
  }
  const reversed = [...second].reverse();
  for (let shift = 0; shift < second.length; shift += 1) {
    const rotatedForward = second.map((_, i) => second[(i + shift) % second.length]);
    const rotatedBackward = reversed.map((_, i) => reversed[(i + shift) % reversed.length]);
    if (sameVertices(first, rotatedForward, tolerance) || sameVertices(first, rotatedBackward, tolerance)) {
      return true;
    }
  }

  return false;
}
