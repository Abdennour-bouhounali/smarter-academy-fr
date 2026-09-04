/**
 * geometry2d — algèbre vectorielle 2D pure, partagée par les leçons
 * « Espace et géométrie ».
 *
 * ─── CONVENTIONS (à lire avant tout usage) ──────────────────────────────
 *
 * 1. REPÈRE SVG : x vers la DROITE, y vers le BAS. C'est l'inverse de l'axe
 *    des ordonnées scolaire. Toute valeur montrée à l'élève comme une
 *    COORDONNÉE doit donc passer par le transformateur de sa leçon
 *    (gridToSvg / svgToGrid dans reperageUtils.js), jamais par un y SVG brut.
 *
 * 2. AUCUNE CONVENTION D'ANGLE ICI. Les helpers polaires restent locaux à
 *    leur leçon, et ils divergent volontairement :
 *      - angles/angleUtils.js      : 0° = est, sens trigonométrique (CCW)
 *      - durees/durationUtils.js   : 0° = midi, sens horaire (CW)
 *      - fractions/fractionUtils.js: 0° = midi, sens horaire (CW)
 *    Les unifier derrière un paramètre `convention` recréerait exactement la
 *    classe de bugs de signe que ces en-têtes servent à prévenir.
 *
 * 3. FLOTTANTS : aucun prédicat ne compare avec `===`. Chacun prend un `eps`
 *    explicite, avec une valeur par défaut adaptée à son échelle.
 *
 * 4. DROITE CANONIQUE : `{ p, d }` — un point et un vecteur directeur
 *    TOUJOURS UNITAIRE. `distPointLine` repose sur |d| = 1 ; une direction
 *    non normalisée renverrait silencieusement une distance mise à l'échelle.
 *
 * 5. OBJET GÉOMÉTRIQUE : `{ kind: 'droite'|'segment'|'demi-droite', a, b }`.
 *    Le type n'est PAS un drapeau de style : c'est une ÉTENDUE calculée.
 *    Les flèches, les points d'extrémité et la notation sont des fonctions
 *    du kind — jamais des props passées à un composant, ce qui permettrait
 *    au dessin de contredire les mathématiques.
 */

/* ── Points & vecteurs ────────────────────────────────────────────────── */

export function vec(a, b) {
  return { x: b.x - a.x, y: b.y - a.y };
}

export function add(p, v) {
  return { x: p.x + v.x, y: p.y + v.y };
}

export function scale(v, k) {
  return { x: v.x * k, y: v.y * k };
}

export function dot(u, v) {
  return u.x * v.x + u.y * v.y;
}

/** Produit vectoriel scalaire 2D. Nul ⟺ u et v sont colinéaires. */
export function cross(u, v) {
  return u.x * v.y - u.y * v.x;
}

export function norm(v) {
  return Math.hypot(v.x, v.y);
}

export function dist(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Vecteur unitaire de même direction. Renvoie {0,0} si v est (quasi) nul. */
export function normalize(v, eps = 1e-9) {
  const n = norm(v);
  if (n < eps) return { x: 0, y: 0 };
  return { x: v.x / n, y: v.y / n };
}

/* ── Droites — forme canonique { p, d }, d unitaire ───────────────────── */

/**
 * Droite passant par a et b. Lève une erreur si a et b sont confondus :
 * deux points identiques ne définissent aucune droite, et laisser passer ce
 * cas produirait un d nul qui casserait silencieusement toutes les distances.
 */
export function lineThrough(a, b, eps = 1e-9) {
  const d = vec(a, b);
  if (norm(d) < eps) {
    throw new Error('lineThrough: les deux points sont confondus — aucune droite définie.');
  }
  return { p: { x: a.x, y: a.y }, d: normalize(d) };
}

export function pointAt(line, t) {
  return add(line.p, scale(line.d, t));
}

/** Paramètre t du projeté orthogonal de q (|d| = 1 ⇒ pas de division). */
export function paramOf(line, q) {
  return dot(vec(line.p, q), line.d);
}

/** Pied de la perpendiculaire abaissée de q sur la droite. */
export function projectOnLine(line, q) {
  return pointAt(line, paramOf(line, q));
}

/** Distance d'un point à une droite. Exige |d| = 1 (garanti par lineThrough). */
export function distPointLine(line, q) {
  return Math.abs(cross(line.d, vec(line.p, q)));
}

/** Rotation de +90° du vecteur directeur, dans le repère SVG. */
export function perpDirection(d) {
  return { x: -d.y, y: d.x };
}

export function perpendicularThrough(line, q) {
  return { p: { x: q.x, y: q.y }, d: perpDirection(line.d) };
}

export function parallelThrough(line, q) {
  return { p: { x: q.x, y: q.y }, d: { x: line.d.x, y: line.d.y } };
}

/**
 * Point d'intersection, ou `null` si les droites sont parallèles.
 *
 * Invariant capital : `intersect(...) === null` ⟺ `areParallel(...)`, avec le
 * MÊME eps. C'est ce qui rend « deux parallèles ne se coupent jamais »
 * démontrable à l'écran plutôt qu'affirmé.
 */
export function intersect(l1, l2, eps = 1e-6) {
  const den = cross(l1.d, l2.d);
  if (Math.abs(den) < eps) return null;
  const t = cross(vec(l1.p, l2.p), l2.d) / den;
  return pointAt(l1, t);
}

/* ── Relations — les prédicats que les leçons ENSEIGNENT ──────────────── */

/** Seul juge du parallélisme. Aucun composant ne compare de coefficients
 *  directeurs : une droite verticale donnerait Infinity. */
export function areParallel(l1, l2, eps = 1e-6) {
  return Math.abs(cross(l1.d, l2.d)) < eps;
}

/** Seul juge de la perpendicularité. */
export function arePerpendicular(l1, l2, eps = 1e-6) {
  return Math.abs(dot(l1.d, l2.d)) < eps;
}

/** Alignement de trois POINTS (et non de droites). */
export function areCollinear(a, b, c, eps = 1e-6) {
  return Math.abs(cross(vec(a, b), vec(a, c))) < eps;
}

/** Angle non orienté entre deux droites, dans [0 ; 90]. Affichage seulement —
 *  les décisions passent par areParallel / arePerpendicular. */
export function angleBetweenDeg(l1, l2) {
  const c = Math.min(1, Math.abs(dot(l1.d, l2.d)));
  return (Math.acos(c) * 180) / Math.PI;
}

/* ── Segments / demi-droites / droites — le modèle d'ÉTENDUE ──────────── */

const KINDS = ['droite', 'segment', 'demi-droite'];

/**
 * Étendue de l'objet, exprimée en paramètre t le long de (ab), avec t = 0 en a
 * et t = dist(a,b) en b. C'est LA propriété qui distingue les trois objets.
 */
export function extentOf(obj) {
  switch (obj.kind) {
    case 'segment':
      return { fromT: 0, toT: dist(obj.a, obj.b) };
    case 'demi-droite':
      return { fromT: 0, toT: Infinity };
    case 'droite':
      return { fromT: -Infinity, toT: Infinity };
    default:
      throw new Error(`extentOf: kind inconnu « ${obj.kind} » (attendu : ${KINDS.join(', ')}).`);
  }
}

/**
 * Extrémités de l'objet — la propriété discriminante enseignée par la leçon.
 * Une droite n'en a aucune, une demi-droite une seule (son origine), un
 * segment deux.
 */
export function endpointsOf(obj) {
  switch (obj.kind) {
    case 'segment':
      return [obj.a, obj.b];
    case 'demi-droite':
      return [obj.a];
    case 'droite':
      return [];
    default:
      throw new Error(`endpointsOf: kind inconnu « ${obj.kind} ».`);
  }
}

/** Le point q appartient-il à l'objet ? Respecte l'étendue, pas seulement la
 *  droite support. */
export function containsPoint(obj, q, eps = 1e-6) {
  const line = lineThrough(obj.a, obj.b);
  if (distPointLine(line, q) > eps) return false;
  const t = paramOf(line, q);
  const { fromT, toT } = extentOf(obj);
  return t >= fromT - eps && t <= toT + eps;
}

/**
 * Ce qu'il faut réellement dessiner dans la boîte `box`
 * ({ xMin, yMin, xMax, yMax }) : renvoie { from, to, openFrom, openTo }.
 *
 * `openFrom` / `openTo` indiquent que le trait sort de la boîte de ce côté —
 * c'est là que le composant dessine une flèche. Une droite renvoie toujours la
 * corde complète, un segment exactement [a, b], une demi-droite de a au bord.
 */
export function clipToBox(obj, box) {
  const line = lineThrough(obj.a, obj.b);
  const { fromT, toT } = extentOf(obj);

  // Intervalle de t pour lequel pointAt(line, t) reste dans la boîte.
  let tMin = -Infinity;
  let tMax = Infinity;
  const slab = (origin, direction, lo, hi) => {
    if (Math.abs(direction) < 1e-12) {
      // Direction parallèle à cette paire de bords : hors boîte ⇒ vide.
      if (origin < lo || origin > hi) {
        tMin = Infinity;
        tMax = -Infinity;
      }
      return;
    }
    const t1 = (lo - origin) / direction;
    const t2 = (hi - origin) / direction;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  };
  slab(line.p.x, line.d.x, box.xMin, box.xMax);
  slab(line.p.y, line.d.y, box.yMin, box.yMax);

  const from = Math.max(tMin, fromT);
  const to = Math.min(tMax, toT);
  if (from > to) return null; // l'objet ne traverse pas la boîte

  return {
    from: pointAt(line, from),
    to: pointAt(line, to),
    // Le trait continue au-delà du bord ⟺ l'étendue dépasse la découpe.
    openFrom: fromT < from - 1e-9,
    openTo: toT > to + 1e-9,
  };
}

/** Notation française de l'objet : (AB), [AB] ou [AB). */
export function notationOf(obj, nameA = 'A', nameB = 'B') {
  switch (obj.kind) {
    case 'droite':
      return `(${nameA}${nameB})`;
    case 'segment':
      return `[${nameA}${nameB}]`;
    case 'demi-droite':
      return `[${nameA}${nameB})`;
    default:
      throw new Error(`notationOf: kind inconnu « ${obj.kind} ».`);
  }
}

/** Description française complète : « la droite (AB) », « le segment [AB] »… */
export function describeObj(obj, nameA = 'A', nameB = 'B') {
  const notation = notationOf(obj, nameA, nameB);
  switch (obj.kind) {
    case 'droite':
      return `la droite ${notation}`;
    case 'segment':
      return `le segment ${notation}`;
    case 'demi-droite':
      return `la demi-droite ${notation}`;
    default:
      throw new Error(`describeObj: kind inconnu « ${obj.kind} ».`);
  }
}

/* ── Quadrillage ──────────────────────────────────────────────────────── */

export function snapToGrid(p, step) {
  return { x: Math.round(p.x / step) * step, y: Math.round(p.y / step) * step };
}

/** Nœud du quadrillage le plus proche, borné à [0, cols] × [0, rows]. */
export function nearestNode(p, step, cols, rows) {
  const clamp = (v, max) => Math.max(0, Math.min(max, v));
  return {
    col: clamp(Math.round(p.x / step), cols),
    row: clamp(Math.round(p.y / step), rows),
  };
}

/* ── Polygones ────────────────────────────────────────────────────────
 *
 * Un polygone est un simple tableau de sommets `[{x,y}, …]`, dans l'ordre du
 * contour. Tout le reste — côtés, angles, propriétés — en est DÉRIVÉ, jamais
 * stocké : c'est ce qui permet à l'élève de déformer une figure et de voir
 * ses propriétés se perdre ou apparaître en direct.
 */

/** Les côtés, sous forme de paires de sommets consécutifs (le dernier boucle). */
export function sidesOf(pts) {
  return pts.map((p, i) => [p, pts[(i + 1) % pts.length]]);
}

/** Longueur de chaque côté, dans l'ordre du contour. */
export function sideLengths(pts) {
  return sidesOf(pts).map(([a, b]) => dist(a, b));
}

/**
 * Angle intérieur à chaque sommet, en degrés (0..180).
 * L'angle au sommet i est formé par les côtés [i-1, i] et [i, i+1].
 */
export function interiorAngles(pts) {
  const n = pts.length;
  return pts.map((p, i) => {
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const u = normalize(vec(p, prev));
    const v = normalize(vec(p, next));
    const c = Math.max(-1, Math.min(1, dot(u, v)));
    return (Math.acos(c) * 180) / Math.PI;
  });
}

/** Le sommet i porte-t-il un angle droit ? */
export function isRightAngleAt(pts, i, epsDeg = 1.5) {
  return Math.abs(interiorAngles(pts)[i] - 90) <= epsDeg;
}

/** Nombre de sommets portant un angle droit. */
export function rightAngleCount(pts, epsDeg = 1.5) {
  return interiorAngles(pts).filter((a) => Math.abs(a - 90) <= epsDeg).length;
}

/**
 * Tous les côtés ont-ils la même longueur ?
 * `epsRatio` est RELATIF : un écart de 2 % sur une figure de 200 px n'a pas
 * le même sens que sur une figure de 20 px.
 */
export function allSidesEqual(pts, epsRatio = 0.03) {
  const L = sideLengths(pts);
  const max = Math.max(...L);
  return L.every((l) => Math.abs(l - L[0]) <= epsRatio * max);
}

/** Les côtés opposés ont-ils deux à deux la même longueur ? (quadrilatères) */
export function oppositeSidesEqual(pts, epsRatio = 0.03) {
  if (pts.length !== 4) return false;
  const L = sideLengths(pts);
  const max = Math.max(...L);
  return Math.abs(L[0] - L[2]) <= epsRatio * max && Math.abs(L[1] - L[3]) <= epsRatio * max;
}

/** Les côtés opposés sont-ils parallèles deux à deux ? (quadrilatères) */
export function oppositeSidesParallel(pts, eps = 0.03) {
  if (pts.length !== 4) return false;
  const S = sidesOf(pts);
  const dir = ([a, b]) => normalize(vec(a, b));
  return (
    Math.abs(cross(dir(S[0]), dir(S[2]))) < eps && Math.abs(cross(dir(S[1]), dir(S[3]))) < eps
  );
}

/** Longueur des deux diagonales d'un quadrilatère. */
export function diagonalLengths(pts) {
  if (pts.length !== 4) return [];
  return [dist(pts[0], pts[2]), dist(pts[1], pts[3])];
}

/** Périmètre — la somme des côtés. */
export function perimeter(pts) {
  return sideLengths(pts).reduce((s, l) => s + l, 0);
}

/** Aire d'un polygone simple (formule du lacet), toujours positive. */
export function polygonArea(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i += 1) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

/** Centre de gravité des sommets — utile pour poser une étiquette au milieu. */
export function centroid(pts) {
  const n = pts.length || 1;
  return {
    x: pts.reduce((s, p) => s + p.x, 0) / n,
    y: pts.reduce((s, p) => s + p.y, 0) / n,
  };
}

/* ── Symétrie axiale ──────────────────────────────────────────────────
 *
 * L'axe est une droite canonique {p, d}. Le symétrique d'un point est son
 * reflet de l'autre côté : même distance à l'axe, sur la perpendiculaire.
 */

/** Symétrique d'un point par rapport à une droite. */
export function reflectPoint(line, q) {
  const foot = projectOnLine(line, q);
  return { x: 2 * foot.x - q.x, y: 2 * foot.y - q.y };
}

/** Symétrique d'une figure entière — chaque sommet réfléchi. */
export function reflectPoints(line, pts) {
  return pts.map((p) => reflectPoint(line, p));
}

/**
 * La droite est-elle un axe de symétrie de la figure ?
 * Vrai ⟺ l'ensemble des sommets réfléchis est le MÊME ensemble que les
 * sommets d'origine (à l'ordre près) — c'est la définition, pas une
 * approximation visuelle.
 */
export function isSymmetryAxis(line, pts, eps = 2) {
  const reflected = reflectPoints(line, pts);
  return reflected.every((r) => pts.some((p) => dist(p, r) <= eps));
}

/* ── Angles en un sommet, cercles, rapports ───────────────────────────────
 *
 * Ajouts pour les leçons « Espace et géométrie » de 3e (triangles, Pythagore,
 * Thalès, trigonométrie). Toujours les mêmes règles : fonctions pures, repère
 * SVG y vers le bas, aucun prédicat qui compare avec `===`.
 */

/**
 * Angle ABC (au sommet b), en degrés, dans [0 ; 180].
 *
 * Non orienté : c'est l'angle géométrique, celui que l'élève mesure au
 * rapporteur. Le sens du repère SVG n'intervient donc pas — l'inverser
 * donnerait le même nombre.
 */
export function angleAtDeg(a, b, c) {
  const u = normalize(vec(b, a));
  const v = normalize(vec(b, c));
  const d = Math.max(-1, Math.min(1, dot(u, v)));
  return (Math.acos(d) * 180) / Math.PI;
}

/**
 * Intersections de deux cercles — LA mathématique du compas.
 *
 * Renvoie 0, 1 ou 2 points. Le tableau est VIDE exactement quand les deux
 * arcs ne peuvent pas se rencontrer, c'est-à-dire quand l'inégalité
 * triangulaire n'est pas vérifiée (r1 + r2 < d, ou un cercle enfermé dans
 * l'autre). C'est ce qui permet à l'élève de DÉCOUVRIR l'inégalité
 * triangulaire en voyant deux arcs qui ne se croisent jamais, au lieu de la
 * lire dans un encadré.
 */
export function circleCircleIntersections(c1, r1, c2, r2, eps = 1e-9) {
  const d = dist(c1, c2);
  if (d < eps) return []; // concentriques : aucune intersection isolée
  if (d > r1 + r2 + eps) return []; // trop loin : les arcs ne se rejoignent pas
  if (d < Math.abs(r1 - r2) - eps) return []; // un cercle est enfermé dans l'autre

  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h2 = r1 * r1 - a * a;
  const h = h2 > 0 ? Math.sqrt(h2) : 0;
  const dir = normalize(vec(c1, c2));
  const base = add(c1, scale(dir, a));
  if (h < eps) return [base]; // cercles tangents : un seul point
  const perp = perpDirection(dir);
  return [add(base, scale(perp, h)), add(base, scale(perp, -h))];
}

/** Point à la fraction t du segment [a, b] : t = 0 en a, t = 1 en b. */
export function pointOnSegmentAt(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/**
 * Rapport de deux longueurs, `null` si le dénominateur est (quasi) nul.
 *
 * Renvoyer `null` plutôt qu'Infinity est délibéré : un rapport de Thalès dont
 * le dénominateur s'annule n'a pas de sens géométrique, et l'affichage doit
 * dire « — », pas « ∞ ».
 */
export function lengthRatio(numerator, denominator, eps = 1e-9) {
  if (Math.abs(denominator) < eps) return null;
  return numerator / denominator;
}
