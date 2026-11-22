/**
 * gear-crank — la GÉOMÉTRIE PURE du dessin (aucun React) : un plateau et un pignon dessinés avec leur VRAI nombre de dents (24 dents = 24 dents
 * dessinées), au même PAS (la distance entre deux dents voisines, donc entre deux maillons), et la chaîne qui les entoure. Testée dans `gearArt.test.js`.
 *
 * Un engrenage de n dents a le rayon primitif r = pas × n / 2π : sa circonférence porte exactement n pas. Quand la manivelle avance d'UNE dent, la chaîne
 * avance d'UN pas le long de son tracé — c'est ce qui fait « passer les maillons dent par dent ».
 */
export const PITCH = 3.5;
const TAU = Math.PI * 2;

/** Le rayon primitif d'un engrenage de `n` dents. */
export const pitchRadius = (n, p = PITCH) => (p * n) / TAU;

const pt = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
const f2 = (v) => Math.round(v * 100) / 100;

/** Les `n` dents d'un engrenage centré en (0, 0) : la dent 0 est en haut ; chacune est un trapèze `[[x, y] × 4]` (pied gauche, sommet gauche, sommet droit, pied droit). */
export function gearTeeth(n, p = PITCH) {
  const r = pitchRadius(n, p);
  const step = TAU / n;
  const tip = r + 1.5;
  const root = r - 1.3;
  return Array.from({ length: n }, (_, k) => {
    const a = -Math.PI / 2 + k * step;
    return [pt(0, 0, root, a - 0.3 * step), pt(0, 0, tip, a - 0.14 * step), pt(0, 0, tip, a + 0.14 * step), pt(0, 0, root, a + 0.3 * step)];
  });
}

/** Le tracé SVG du contour denté (une dent = un sommet plat) et celui de la dent repère (la dent 0, en haut). */
export function gearPath(n, p = PITCH) {
  const teeth = gearTeeth(n, p);
  const d = teeth.map((t, k) => `${k === 0 ? 'M' : 'L'}${t.map(([x, y]) => `${f2(x)} ${f2(y)}`).join('L')}`).join('') + 'Z';
  const mark = `M${teeth[0].map(([x, y]) => `${f2(x)} ${f2(y)}`).join('L')}Z`;
  return { d, mark, r: pitchRadius(n, p) };
}

/**
 * La chaîne autour d'un plateau (c1, r1) et d'un pignon (c2, r2) : deux tangentes extérieures et deux arcs, tracé dans le SENS DE LA MARCHE (horaire à
 * l'écran : le brin du haut avance vers le plateau). Le pas effectif ajuste le pas pour que la boucle se ferme sur un nombre ENTIER de maillons.
 */
export function chainGeometry(c1, r1, c2, r2, p = PITCH) {
  const dx = c2.x - c1.x; const dy = c2.y - c1.y;
  const dist = Math.hypot(dx, dy);
  const phi = Math.atan2(dy, dx);
  const beta = Math.acos((r1 - r2) / dist);
  const aT = phi + beta; // le point de tangence du haut
  const aB = phi - beta; // celui du bas
  const mod = (a) => ((a % TAU) + TAU) % TAU;
  const d1 = mod(aB - aT);
  const d2 = mod(aT - aB);
  const straight = Math.sqrt(dist * dist - (r1 - r2) ** 2);
  const length = 2 * straight + r1 * d1 + r2 * d2;
  const links = Math.max(8, Math.round(length / p));
  const [t1x, t1y] = pt(c1.x, c1.y, r1, aT);
  const [b1x, b1y] = pt(c1.x, c1.y, r1, aB);
  const [b2x, b2y] = pt(c2.x, c2.y, r2, aB);
  const [t2x, t2y] = pt(c2.x, c2.y, r2, aT);
  const d = `M${f2(t1x)} ${f2(t1y)}A${f2(r1)} ${f2(r1)} 0 ${d1 > Math.PI ? 1 : 0} 1 ${f2(b1x)} ${f2(b1y)}L${f2(b2x)} ${f2(b2y)}A${f2(r2)} ${f2(r2)} 0 ${d2 > Math.PI ? 1 : 0} 1 ${f2(t2x)} ${f2(t2y)}Z`;
  return { d, length, links, pEff: length / links };
}

/** Le décalage du tiret pour que la chaîne ait avancé de `teeth` pas (le sens de la marche = le sens du tracé). */
export const chainOffset = (teeth, geom) => -((teeth * geom.pEff) % geom.length);

/** Un arc de cercle de rayon r qui se remplit de la fraction f (0 … 1) à partir du haut, dans le sens horaire. f = 1 → le cercle entier. */
export function arcPath(cx, cy, r, f) {
  const x = Math.max(0, Math.min(1, f));
  if (x <= 0) return '';
  if (x >= 0.9999) return `M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx} ${cy + r}A${r} ${r} 0 1 1 ${cx} ${cy - r}Z`;
  const a = -Math.PI / 2 + x * TAU;
  const [ex, ey] = pt(cx, cy, r, a);
  return `M${cx} ${cy - r}A${r} ${r} 0 ${x > 0.5 ? 1 : 0} 1 ${f2(ex)} ${f2(ey)}`;
}
