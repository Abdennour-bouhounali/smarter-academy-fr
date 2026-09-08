/**
 * geo5e — le noyau de calcul partagé par « Transformations », « Angles » et
 * « Triangles » (5e).
 *
 * Une règle gouverne ce fichier : LA FIGURE NE MENT JAMAIS. Tout ce qu'une
 * leçon affirme (« ces deux angles sont égaux », « la somme fait 180° »,
 * « ces deux aires sont les mêmes ») est CALCULÉ ici à partir des points
 * réellement dessinés, jamais écrit en dur à côté d'un dessin approximatif.
 * Si l'élève traîne un sommet, les nombres affichés suivent — et restent
 * vrais. Les tests de ce module vérifient exactement cela.
 *
 * Le repère est celui du SVG : x vers la droite, y VERS LE BAS.
 */

export const TAU = Math.PI * 2;

export const deg = (rad) => (rad * 180) / Math.PI;
export const rad = (d) => (d * Math.PI) / 180;

/** Arrondi d'affichage — une seule fonction, pour que tout concorde. */
export const round = (x, n = 0) => {
  const f = 10 ** n;
  return Math.round(x * f + Number.EPSILON) / f;
};

/** Nombre à la française (virgule décimale), sans zéro inutile. */
export const fr = (x, n = 1) => String(round(x, n)).replace('.', ',');

export const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

export const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/**
 * Le symétrique de `p` par rapport au CENTRE `c` — le demi-tour.
 *
 * C'est l'unique définition de la symétrie centrale utilisée par la leçon :
 * c est le milieu de [p, p']. Toutes les propriétés (conservation des
 * longueurs, alignement, milieu) en découlent, elles ne sont jamais posées à
 * part.
 */
export const symCentral = (p, c) => ({ x: 2 * c.x - p.x, y: 2 * c.y - p.y });

export const symCentralPts = (pts, c) => pts.map((p) => symCentral(p, c));

/** Le symétrique de `p` par rapport à la DROITE (a, b) — pour contraster. */
export function symAxial(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return { ...p };
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  const h = { x: a.x + t * dx, y: a.y + t * dy };
  return { x: 2 * h.x - p.x, y: 2 * h.y - p.y };
}

/** Angle orienté du vecteur (o → p), en radians, repère SVG. */
export const angleOf = (o, p) => Math.atan2(p.y - o.y, p.x - o.x);

/**
 * L'angle géométrique ABC (sommet B), en degrés, toujours dans [0 ; 180].
 * C'est l'angle que l'élève MESURE au rapporteur — jamais un angle orienté.
 */
export function angleAt(a, b, c) {
  const u = { x: a.x - b.x, y: a.y - b.y };
  const v = { x: c.x - b.x, y: c.y - b.y };
  const nu = Math.hypot(u.x, u.y);
  const nv = Math.hypot(v.x, v.y);
  if (nu === 0 || nv === 0) return 0;
  const cos = Math.min(1, Math.max(-1, (u.x * v.x + u.y * v.y) / (nu * nv)));
  return deg(Math.acos(cos));
}

/** Les trois angles du triangle ABC, dans l'ordre des sommets. */
export const triangleAngles = ([A, B, C]) => [
  angleAt(C, A, B),
  angleAt(A, B, C),
  angleAt(B, C, A),
];

/** Aire d'un polygone (valeur absolue, unités de la figure). */
export function polygonArea(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i += 1) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    s += p.x * q.y - q.x * p.y;
  }
  return Math.abs(s) / 2;
}

/** Distance d'un point à la DROITE (a, b) — la hauteur, mesurée. */
export function distToLine(p, a, b) {
  const len = dist(a, b);
  if (len === 0) return dist(p, a);
  return Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / len;
}

/** Le pied de la perpendiculaire menée de `p` à la droite (a, b). */
export function footOnLine(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return { ...a };
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  return { x: a.x + t * dx, y: a.y + t * dy };
}

/** Intersection de deux droites (a1,b1) et (a2,b2) ; null si parallèles. */
export function lineInter(a1, b1, a2, b2, eps = 1e-9) {
  const d1 = { x: b1.x - a1.x, y: b1.y - a1.y };
  const d2 = { x: b2.x - a2.x, y: b2.y - a2.y };
  const den = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(den) < eps) return null;
  const t = ((a2.x - a1.x) * d2.y - (a2.y - a1.y) * d2.x) / den;
  return { x: a1.x + t * d1.x, y: a1.y + t * d1.y };
}

/** Le centre du cercle circonscrit : l'intersection de deux médiatrices. */
export function circumcenter([A, B, C]) {
  const mAB = midpoint(A, B);
  const mBC = midpoint(B, C);
  const perp = (p, q, m) => ({ x: m.x - (q.y - p.y), y: m.y + (q.x - p.x) });
  return lineInter(mAB, perp(A, B, mAB), mBC, perp(B, C, mBC));
}

/** Trois longueurs forment-elles un triangle ? (inégalité triangulaire) */
export const isTriangle = (a, b, c) => a + b > c && a + c > b && b + c > a;

/**
 * Prolonge un segment [a,b] des deux côtés jusqu'aux bords du cadre.
 * Sert à dessiner une DROITE (et non un segment) sans jamais déborder.
 */
export function clipLine(a, b, w, h, pad = 0) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return [a, b];
  const ts = [];
  const push = (t, x, y) => {
    if (x >= pad - 0.01 && x <= w - pad + 0.01 && y >= pad - 0.01 && y <= h - pad + 0.01) ts.push(t);
  };
  if (dx !== 0) {
    for (const X of [pad, w - pad]) {
      const t = (X - a.x) / dx;
      push(t, X, a.y + t * dy);
    }
  }
  if (dy !== 0) {
    for (const Y of [pad, h - pad]) {
      const t = (Y - a.y) / dy;
      push(t, a.x + t * dx, Y);
    }
  }
  if (ts.length < 2) return [a, b];
  const t0 = Math.min(...ts);
  const t1 = Math.max(...ts);
  return [
    { x: a.x + t0 * dx, y: a.y + t0 * dy },
    { x: a.x + t1 * dx, y: a.y + t1 * dy },
  ];
}

/** Garde un point dans le cadre (marge comprise) : aucune poignée fuyante. */
export const clampPt = (p, w, h, m = 26) => ({
  x: Math.min(w - m, Math.max(m, p.x)),
  y: Math.min(h - m, Math.max(m, p.y)),
});
