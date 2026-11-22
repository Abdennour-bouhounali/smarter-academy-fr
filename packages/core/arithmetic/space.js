/**
 * Le calcul commun de l'unité 14 « الهندسة في الفضاء » (manuel pp. 163–169, docs/sources/4am/unit14/extraction.json) :
 * la كرة (surface) et la جلّة (solide), leur aire et leur volume, les مقاطع مستوية des solides usuels (كرة، بلاطة قائمة،
 * أسطوانة دوران، هرم، مخروط) et l'effet d'un تكبير / تصغير de rapport k sur les longueurs (k), les aires (k²), les volumes (k³).
 *
 * Une seule source de vérité pour les labs, les tests et les oracles de l'unité, sur linear.js (fractions) et
 * trigonometry.js (surds q·√r) :
 *   • une LONGUEUR est une fraction (« 1,4 », « 3/4 », 5) ou, quand elle sort d'une racine, un surd { q, r } ;
 *   • une grandeur en π (aire d'une sphère, volume d'une boule, d'un cylindre, d'un cône) est un « π-multiple »
 *     { k } = k·π, k fraction : on garde l'exact (\frac{1372}{375}\pi) ET on donne l'arrondi du manuel (11,494) ;
 *   • un POINT de l'espace est [x, y, z] (ou { x, y, z }), repère orthonormé, z vers le HAUT ;
 *   • un VERDICT se lit comme le manuel le définit : M ∈ (δ) ⇔ OM = R ; M ∈ (β) ⇔ OM ≤ R (comparaison EXACTE de OM² et R²).
 *
 *   ballPosition([0,0,0], 3, [1,2,2])      → { where: 'surface', onSphere: true, inBall: true, OM: 3 }      (معارف 1)
 *   sphereArea('1,4')                      → { k: 196/25, latex: '\frac{196}{25}\pi', number: 24.630… }   (معارف 2، مثال)
 *   ballVolume('1,4')                      → { k: 1372/375, … } ; roundTo(number, 3) = '11,494'
 *   sphereSection(3, '1,25')               → { kind: 'circle', radius2: 119/16, radius: √119/4 }        (نشاط 2)
 *   sphereSection('2,5', '1,5').radius     → 2                                                          (طرائق ص 169)
 *   cylinderSection('1,7', 6, { axisDistance: '0,8' }) → rectangle 3 × 6                               (نشاط 4)
 *   apexSection({ base: [4, 4], ratio: '3/4' }) → square 3 × 3                                          (نشاط 5)
 *   scaleEffect('3/5')                     → { length: 3/5, area: 9/25, volume: 27/125 }               (نشاط 6)
 *   frustumVolume({ R: 20, r: 15, h: 28 }) → π/3·h·(R² + Rr + r²)                                      (تحدّ)
 */
import { frac, parseNumber, add, sub, mul, div, cmp, eq, toNumber, fracLatex } from './linear.js';
import { surd, sqrt, surdMul, surdNumber, surdLatex, surdEq, roundTo } from './trigonometry.js';

const F = (v) => (typeof v === 'object' && v !== null && 'n' in v ? v : Number.isInteger(v) ? frac(v) : parseFrac(v));
function parseFrac(v) {
  const s = String(v).trim();
  if (s.includes('/')) { const [a, b] = s.split('/'); return div(parseNumber(a), parseNumber(b)); }
  return parseNumber(s);
}
const num = (v) => (typeof v === 'number' ? v : toNumber(F(v)));
const pow = (p, e) => { let r = frac(1); for (let i = 0; i < e; i += 1) r = mul(r, p); return r; };

export { roundTo };

// ── Points de l'espace ───────────────────────────────────────────────────────

/** Un point [x, y, z] (ou { x, y, z }) → trois fractions. */
const point3 = (p) => {
  const a = Array.isArray(p) ? p : [p.x, p.y, p.z];
  if (a.length !== 3) throw new Error('un point de l’espace a trois coordonnées');
  return Object.freeze(a.map(F));
};
/** AB² exact (fraction). */
export function distanceSquared3(A, B) {
  const a = point3(A); const b = point3(B);
  return [0, 1, 2].reduce((s, i) => { const d = sub(b[i], a[i]); return add(s, mul(d, d)); }, frac(0));
}
/** AB exact (surd : 3, √5, 2√3…). */
export const distance3 = (A, B) => sqrt(distanceSquared3(A, B));

// ── Les π-multiples k·π ──────────────────────────────────────────────────────

/** k·π (k fraction) : l'exact, son écriture LaTeX, sa valeur décimale. */
export function piMultiple(k) {
  const K = F(k);
  return Object.freeze({ k: K, latex: piLatex(K), number: toNumber(K) * Math.PI });
}
/** \frac{32}{3}\pi, 4\pi, \pi, \frac{\pi}{3} … (jamais « 1\pi »). */
export function piLatex(k) {
  const K = F(k);
  if (K.n === 0) return '0';
  const sign = K.n < 0 ? '-' : '';
  const n = Math.abs(K.n);
  if (K.d === 1) return `${sign}${n === 1 ? '' : n}\\pi`;
  if (n === 1) return `${sign}\\frac{\\pi}{${K.d}}`;
  return `${sign}\\frac{${n}}{${K.d}}\\pi`;
}
/** L'arrondi d'un k·π à `digits` décimales, avec la virgule (« 24,63 »). */
export const piRound = (k, digits = 2) => roundTo(toNumber(F(k)) * Math.PI, digits);

// ── 1. La كرة et la جلّة ─────────────────────────────────────────────────────

const SURFACE = 'surface';
const INSIDE = 'inside';
const OUTSIDE = 'outside';
/**
 * La position d'un point M par rapport à la sphère (δ) et à la boule (β) de centre O et de rayon R — comparaison EXACTE
 * de OM² et R² : `surface` (M ∈ (δ), donc M ∈ (β)), `inside` (OM < R : M ∈ (β) mais M ∉ (δ)), `outside` (ni l'une ni l'autre).
 */
export function ballPosition(O, R, M) {
  const d2 = distanceSquared3(O, M);
  const r2 = mul(F(R), F(R));
  const c = cmp(d2, r2);
  const where = c === 0 ? SURFACE : c < 0 ? INSIDE : OUTSIDE;
  return Object.freeze({ where, onSphere: c === 0, inBall: c <= 0, OM2: d2, OM: sqrt(d2), R: F(R) });
}
/** Le diamètre 2R. */
export const diameter = (R) => mul(F(R), frac(2));
/** Un cercle d'une sphère (section) est un GRAND cercle ssi son rayon vaut R (son plan passe par O). */
export const isGreatCircle = (R, r) => surdEq(typeof r === 'object' && r && 'r' in r ? r : surd(F(r)), surd(F(R)));

// ── 2. Aire de la sphère, volume de la boule ─────────────────────────────────

/** 𝒜 = 4πR². */
export const sphereArea = (R) => piMultiple(mul(frac(4), pow(F(R), 2)));
/** 𝒱 = 4/3·πR³. */
export const ballVolume = (R) => piMultiple(mul(frac(4, 3), pow(F(R), 3)));
/** Le rayon d'une sphère d'aire k·π (k = 4R²) : un surd (exact quand R est rationnel). */
export const radiusFromSphereArea = (k) => sqrt(div(F(k), frac(4)));
/** Le rayon d'une boule de volume k·π (k = 4R³/3) : une fraction si c'est un cube parfait, sinon null (et `approx`). */
export function radiusFromBallVolume(k) {
  const c = div(mul(F(k), frac(3)), frac(4));
  const root = cubeRoot(c);
  return Object.freeze({ exact: root, approx: Math.cbrt(toNumber(c)) });
}
/** La racine cubique EXACTE d'une fraction (27/125 → 3/5), sinon null. */
export function cubeRoot(p) {
  const P = F(p);
  const rt = (n) => { const s = Math.sign(n); const r = Math.round(Math.cbrt(Math.abs(n))); return r ** 3 === Math.abs(n) ? s * r : null; };
  const a = rt(P.n); const b = rt(P.d);
  return a === null || b === null ? null : frac(a, b);
}
/** La racine carrée EXACTE d'une fraction (9/25 → 3/5), sinon null. */
function squareRootRational(p) {
  const s = sqrt(F(p));
  return s.r === 1 ? s.q : null;
}
/**
 * Archimède (مقدمة الوحدة) : la sphère de rayon R dans le cylindre de rayon R et de hauteur 2R.
 * Aire de la sphère = aire LATÉRALE du cylindre (4πR²) ; volume de la boule = 2/3 du volume du cylindre (2πR³).
 */
export function archimedes(R) {
  const r = F(R);
  const cyl = cylinder(r, mul(r, frac(2)));
  return Object.freeze({
    sphereArea: sphereArea(r), ballVolume: ballVolume(r), cylinderLateral: cyl.lateral, cylinderVolume: cyl.volume,
    areaRatio: div(sphereArea(r).k, cyl.lateral.k), volumeRatio: div(ballVolume(r).k, cyl.volume.k),
  });
}

// ── Les solides usuels (le أستعدّ et les sections) ────────────────────────────

/** Le cube d'arête a : volume a³, aire totale 6a². */
export const cube = (a) => { const A = F(a); return Object.freeze({ volume: pow(A, 3), area: mul(frac(6), pow(A, 2)) }); };
/** La بلاطة قائمة (pavé droit / متوازي المستطيلات) a × b × c : volume, aire totale 2(ab + bc + ca). */
export function cuboid(a, b, c) {
  const [A, B, C] = [a, b, c].map(F);
  return Object.freeze({
    volume: mul(mul(A, B), C),
    area: mul(frac(2), add(add(mul(A, B), mul(B, C)), mul(C, A))),
    faces: Object.freeze([mul(A, B), mul(B, C), mul(C, A)]),
  });
}
/** La أسطوانة دوران de rayon r et de hauteur h : volume πr²h, aire latérale 2πrh, aire totale 2πr(r + h). */
export function cylinder(r, h) {
  const [R, H] = [r, h].map(F);
  return Object.freeze({
    volume: piMultiple(mul(pow(R, 2), H)),
    lateral: piMultiple(mul(mul(frac(2), R), H)),
    area: piMultiple(mul(mul(frac(2), R), add(R, H))),
  });
}
/** Le مخروط دوران de rayon r et de hauteur h : volume πr²h/3. */
export const cone = (r, h) => Object.freeze({ volume: piMultiple(div(mul(pow(F(r), 2), F(h)), frac(3))) });
/** La pyramide (هرم) d'aire de base B et de hauteur h : volume B·h/3. */
export const pyramid = (baseArea, h) => Object.freeze({ volume: div(mul(F(baseArea), F(h)), frac(3)) });
/** Le tronc de cône (مخروط مبتور) de rayons R (grand) et r (petit), de hauteur h : π/3·h·(R² + Rr + r²). */
export function frustumVolume({ R, r, h }) {
  const [A, B, H] = [R, r, h].map(F);
  return piMultiple(mul(div(H, frac(3)), add(add(pow(A, 2), mul(A, B)), pow(B, 2))));
}

// ── 3. Les sections planes ───────────────────────────────────────────────────

/**
 * Section d'une sphère de rayon R par un plan à la distance h du centre (manuel : h = OA) :
 * h > R → 'none' ; h = R → 'point' (tangence) ; 0 < h < R → 'circle' de rayon √(R² − h²) (Pythagore dans OAM) ;
 * h = 0 → 'great-circle' (rayon R).
 */
export function sphereSection(R, h) {
  const r = F(R); const H = F(h);
  if (cmp(H, frac(0)) < 0) throw new Error('h est une distance (≥ 0)');
  const r2 = sub(pow(r, 2), pow(H, 2));
  const c = cmp(H, r);
  if (c > 0) return Object.freeze({ kind: 'none', radius2: null, radius: null });
  if (c === 0) return Object.freeze({ kind: 'point', radius2: frac(0), radius: surd(0) });
  return Object.freeze({ kind: eq(H, frac(0)) ? 'great-circle' : 'circle', radius2: r2, radius: sqrt(r2) });
}
/** La distance du plan au centre qui donne un cercle de rayon ρ : h = √(R² − ρ²) (null si ρ > R). */
export function sectionDistance(R, rho) {
  const d = sub(pow(F(R), 2), pow(F(rho), 2));
  return cmp(d, frac(0)) < 0 ? null : sqrt(d);
}
/**
 * Section d'une بلاطة قائمة a × b × c (a, b dans la base, c la hauteur) :
 *   { parallelTo: 'face', face: 'ab' | 'bc' | 'ca' } → un rectangle de mêmes dimensions que la face parallèle ;
 *   { parallelTo: 'edge', p, q } → un plan parallèle à une arête VERTICALE (longueur c) qui coupe la base selon un
 *     segment joignant deux arêtes adjacentes à p et q du coin : rectangle c × √(p² + q²) (نشاط 3 : 6 × 5).
 */
export function cuboidSection({ a, b, c }, cut) {
  const [A, B, C] = [a, b, c].map(F);
  if (cut.parallelTo === 'face') {
    const dims = { ab: [A, B], bc: [B, C], ca: [C, A] }[cut.face];
    if (!dims) throw new Error(`face inconnue ${cut.face}`);
    return Object.freeze({ kind: 'rectangle', sides: Object.freeze(dims.map((x) => surd(x))), area: mul(dims[0], dims[1]) });
  }
  if (cut.parallelTo === 'edge') {
    const w = sqrt(add(pow(F(cut.p), 2), pow(F(cut.q), 2)));
    return Object.freeze({ kind: 'rectangle', sides: Object.freeze([surd(C), w]), area: surdMul(w, surd(C)) });
  }
  throw new Error('cut.parallelTo = face | edge');
}
/**
 * Section d'une أسطوانة دوران de rayon r et de hauteur h :
 *   { parallelTo: 'base' } → cercle de rayon r (centre sur l'axe) ;
 *   { axisDistance: d } (plan parallèle à l'axe à la distance d) → d < r : rectangle h × 2√(r² − d²) ;
 *     d = r : 'segment' (le plan est tangent : une génératrice) ; d > r : 'none'.
 */
export function cylinderSection(r, h, cut) {
  const R = F(r); const H = F(h);
  if (cut.parallelTo === 'base') return Object.freeze({ kind: 'circle', radius: surd(R), area: piMultiple(pow(R, 2)) });
  if (cut.axisDistance == null) throw new Error('cut = { parallelTo: "base" } | { axisDistance }');
  const d = F(cut.axisDistance);
  const c = cmp(d, R);
  if (c > 0) return Object.freeze({ kind: 'none' });
  if (c === 0) return Object.freeze({ kind: 'segment', sides: Object.freeze([surd(H)]) });
  const half = sqrt(sub(pow(R, 2), pow(d, 2)));
  const width = surdMul(half, surd(2));
  return Object.freeze({ kind: 'rectangle', sides: Object.freeze([width, surd(H)]), halfWidth: half, area: surdMul(width, surd(H)) });
}
/**
 * Section d'une pyramide (ou d'un cône) par un plan PARALLÈLE à la base, à la position SE = ratio·SA depuis le sommet :
 * une RÉDUCTION de la base de rapport k = ratio (Thalès) — longueurs × k, aire × k².
 *   apexSection({ base: [4, 4], ratio: '3/4' }) → côtés 3 et 3, aire 9   (هرم، نشاط 5)
 *   apexSection({ radius: 6, ratio: '1/3' })    → cercle de rayon 2       (مخروط)
 */
export function apexSection({ base, radius, ratio }) {
  const k = F(ratio);
  if (!(cmp(k, frac(0)) > 0 && cmp(k, frac(1)) <= 0)) throw new Error('0 < ratio ≤ 1');
  if (radius != null) {
    const r = mul(F(radius), k);
    return Object.freeze({ kind: 'circle', radius: surd(r), area: piMultiple(pow(r, 2)), k });
  }
  const sides = base.map((s) => mul(F(s), k));
  return Object.freeze({ kind: sides.every((s) => eq(s, sides[0])) && sides.length === 2 ? 'square' : 'polygon', sides: Object.freeze(sides), k });
}

// ── 4. Agrandissement et réduction ───────────────────────────────────────────

/** Ce que fait un rapport k > 0 : longueurs × k, aires × k², volumes × k³ ; `kind` = تكبير (k > 1), تصغير (k < 1), تقايس (k = 1). */
export function scaleEffect(k) {
  const K = F(k);
  if (cmp(K, frac(0)) <= 0) throw new Error('k > 0');
  const c = cmp(K, frac(1));
  return Object.freeze({ k: K, length: K, area: pow(K, 2), volume: pow(K, 3), kind: c > 0 ? 'enlargement' : c < 0 ? 'reduction' : 'identity' });
}
/** L'image d'une grandeur par le rapport k : dimension 1 (longueur), 2 (aire), 3 (volume). Accepte une fraction ou un π-multiple. */
export function scaled(value, k, dim) {
  if (![1, 2, 3].includes(dim)) throw new Error('dim = 1 | 2 | 3');
  const f = pow(F(k), dim);
  if (value && typeof value === 'object' && 'k' in value && !('n' in value)) return piMultiple(mul(value.k, f));
  return mul(F(value), f);
}
/**
 * Le rapport k qui envoie une grandeur sur une autre : k = image / original pour des longueurs, la racine carrée du
 * rapport des aires, la racine cubique du rapport des volumes — EXACT (fraction) ou null quand il ne l'est pas.
 */
export function ratioFrom(original, image, dim) {
  const q = div(F(image), F(original));
  if (dim === 1) return q;
  if (dim === 2) return squareRootRational(q);
  if (dim === 3) return cubeRoot(q);
  throw new Error('dim = 1 | 2 | 3');
}
/** Tous les côtés d'une figure multipliés par k (un agrandissement / une réduction). */
export const scaleAll = (lengths, k) => Object.freeze(lengths.map((x) => mul(F(x), F(k))));

// ── La synthèse : un seau (tronc de cône) ─────────────────────────────────────

/**
 * Un seau en tronc de cône (le تحدّ) : rayon du fond r, rayon de l'ouverture R, hauteur H ; l'eau a la profondeur `depth`
 * (mesurée depuis le fond). Par Thalès le rayon de la surface de l'eau est ρ = r + (R − r)·depth/H ; en complétant le cône,
 * sa hauteur au-dessous du fond est a = r·H/(R − r), le grand cône (jusqu'à l'eau) a la hauteur a + depth et le petit cône
 * (le fond) est sa réduction de rapport k = a/(a + depth) : V = V_grand·(1 − k³) = π/3·depth·(ρ² + ρr + r²).
 */
export function bucketWater({ R, r, H, depth }) {
  const [Rr, rr, HH, d] = [R, r, H, depth].map(F);
  if (!(cmp(Rr, rr) > 0)) throw new Error('R > r (ouverture plus large que le fond)');
  if (cmp(d, HH) > 0 || cmp(d, frac(0)) < 0) throw new Error('0 ≤ depth ≤ H');
  const rho = add(rr, div(mul(sub(Rr, rr), d), HH));
  const apex = div(mul(rr, HH), sub(Rr, rr));
  const big = cone(rho, add(apex, d)).volume;
  const k = div(apex, add(apex, d));
  const volume = frustumVolume({ R: rho, r: rr, h: d });
  return Object.freeze({ surfaceRadius: rho, apexBelowBottom: apex, bigCone: big, k, smallCone: piMultiple(mul(big.k, pow(k, 3))), volume });
}

// ── Unités de capacité ───────────────────────────────────────────────────────

/** cm³ → L (1 L = 1 dm³ = 1000 cm³). */
export const cm3ToLitres = (v) => div(F(v), frac(1000));
/** m³ → L. */
export const m3ToLitres = (v) => mul(F(v), frac(1000));

/** Écriture LaTeX d'une longueur exacte (fraction ou surd). */
export const lengthLatex = (x) => (x && typeof x === 'object' && 'r' in x ? surdLatex(x) : fracLatex(F(x)));
/** Valeur décimale d'une longueur exacte (fraction ou surd). */
export const lengthNumber = (x) => (x && typeof x === 'object' && 'r' in x ? surdNumber(x) : num(x));
