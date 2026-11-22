/**
 * Trigonométrie du triangle rectangle — le calcul commun de l'unité 10 « حساب المثلثات في المثلث القائم »
 * (manuel pp. 115–125, docs/sources/4am/unit10/extraction.json) : nommer les côtés relativement à un
 * angle aigu, les trois rapports cos / sin / tan, leurs valeurs EXACTES (3/√13, √3/2, √21/5…), les
 * relations cos² + sin² = 1 et tan = sin / cos, le choix du rapport pour une longueur ou un angle,
 * l'arrondi du manuel et les séquences de touches de la calculatrice.
 *
 * DEUX MONDES, jamais mélangés :
 *   • l'EXACT : une longueur ou un rapport est un « surd » { q, r } = q·√r, q fraction de linear.js,
 *     r entier sans facteur carré (r = 1 : un rationnel). 3/√13 s'écrit { q: 3/13, r: 13 } (= 3√13/13).
 *     Un rapport exact se lit sur les côtés, ou se déduit d'un autre par les relations ;
 *   • l'APPROCHÉ : les fonctions en degrés (sinDeg…, acosDeg…) et `roundTo` — ce que donne la
 *     calculatrice. Un arrondi est TOUJOURS une écriture (chaîne avec la virgule), jamais un état.
 *
 *   sides(['A','B','C'], 'A', 'B')            → { hypotenuse: 'BC', opposite: 'AC', adjacent: 'AB' }
 *   ratioExact('sin', { opposite: 3, hypotenuse: sqrt(13) }) → 3√13/13        (معارف 1، مثال)
 *   fromRatio('cos', '0,6')                    → { sin: 4/5, tan: 4/3, possible: true }  (طرائق ص 121)
 *   fromRatio('sin', '3/2')                    → { possible: false, reason: 'gt1' }      (تمرين 18)
 *   lengthPlan({ known: 'opposite', wanted: 'hypotenuse' }) → { ratio: 'sin', op: 'div' }  (BC = 2,5 / sin 25°)
 *   roundTo(2.5 / sinDeg(25), 2)               → '5,92'
 *   keysForAngle('sin', '0,4')                 → ['ON', '2nd', 'sin⁻¹', '0,4', '=']        (معارف 3، مثال 2)
 */
import { frac, parseNumber, add, sub, mul, div, cmp, eq, toNumber, fracText, fracLatex } from './linear.js';
import { largestSquareFactor } from './squareRoots.js';

const F = (v) => (typeof v === 'object' && v !== null && 'n' in v ? v : Number.isInteger(v) ? frac(v) : parseFrac(v));
function parseFrac(v) {
  const s = String(v).trim();
  if (s.includes('/')) { const [a, b] = s.split('/'); return div(parseNumber(a), parseNumber(b)); }
  return parseNumber(s);
}

// ── Surds q·√r ───────────────────────────────────────────────────────────────

/** q·√r normalisé : r sans facteur carré (√12 = 2√3), r = 1 pour un rationnel, q = 0 ⇒ r = 1. */
export function surd(q, r = 1) {
  if (!Number.isInteger(r) || r < 0) throw new Error('r doit être un entier ≥ 0');
  let Q = F(q);
  if (r === 0 || Q.n === 0) return Object.freeze({ q: frac(0), r: 1 });
  const { a, b } = largestSquareFactor(r);
  Q = mul(Q, frac(a));
  return Object.freeze({ q: Q, r: b });
}
const S = (v) => (typeof v === 'object' && v !== null && 'r' in v ? v : surd(F(v), 1));

/** √p exact pour une fraction p ≥ 0 : √(n/d) = √(n·d) / d. */
export function sqrt(p) {
  const P = F(p);
  if (P.n < 0) throw new Error('racine d’un négatif');
  return surd(frac(1, P.d), P.n * P.d);
}
/** Le carré d'un surd : une fraction (q²·r). */
export const square = (x) => { x = S(x); return mul(mul(x.q, x.q), frac(x.r)); };
export function surdMul(x, y) {
  x = S(x); y = S(y);
  const { a, b } = largestSquareFactor(x.r * y.r);
  return surd(mul(mul(x.q, y.q), frac(a)), b);
}
export function surdDiv(x, y) {
  x = S(x); y = S(y);
  if (y.q.n === 0) throw new Error('division par 0');
  // x / (q√r) = x·√r / (q·r)
  return surdMul(x, surd(div(frac(1), mul(y.q, frac(y.r))), y.r));
}
export const isRational = (x) => S(x).r === 1;
export const surdNumber = (x) => { x = S(x); return toNumber(x.q) * Math.sqrt(x.r); };
export const surdEq = (x, y) => { x = S(x); y = S(y); return x.r === y.r && eq(x.q, y.q); };
export const surdCmp = (x, y) => {
  x = S(x); y = S(y);
  const sx = cmp(x.q, frac(0)); const sy = cmp(y.q, frac(0));
  if (sx !== sy) return sx < sy ? -1 : 1;
  const c = cmp(square(x), square(y));
  return sx >= 0 ? c : -c;
};

/** LaTeX : « \dfrac{3\sqrt{13}}{13} », « \dfrac{\sqrt{3}}{2} », « 0{,}6 », « 2\sqrt{3} ». */
export function surdLatex(x) {
  x = S(x);
  if (x.r === 1) return decimalLatex(x.q);
  const root = `\\sqrt{${x.r}}`;
  const n = Math.abs(x.q.n); const d = x.q.d; const sign = x.q.n < 0 ? '-' : '';
  const top = n === 1 ? root : `${n}${root}`;
  return d === 1 ? `${sign}${top}` : `${sign}\\dfrac{${top}}{${d}}`;
}
/** Texte : « 3√13/13 », « √3/2 », « 4/3 ». */
export function surdText(x) {
  x = S(x);
  if (x.r === 1) return fracText(x.q);
  const n = Math.abs(x.q.n); const d = x.q.d; const sign = x.q.n < 0 ? '-' : '';
  const top = `${n === 1 ? '' : n}√${x.r}`;
  return d === 1 ? `${sign}${top}` : `${sign}${top}/${d}`;
}
function decimalLatex(p) {
  const P = F(p);
  let d = P.d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5;
  if (d === 1 && P.d <= 10000) {
    const s = String(+(P.n / P.d).toFixed(6));
    return s.replace('.', '{,}');
  }
  return fracLatex(P);
}

// ── Les côtés d'un triangle rectangle relativement à un angle aigu ─────────────

/**
 * vertices : les trois sommets ; right : le sommet de l'angle droit ; at : le sommet de l'angle aigu.
 * Rend les noms des côtés (lettres dans l'ordre du triangle donné, « BC » pas « CB »).
 */
export function sides(vertices, right, at) {
  const [X, Y, Z] = vertices;
  if (![X, Y, Z].includes(right) || ![X, Y, Z].includes(at) || right === at) throw new Error('sommets invalides');
  const other = [X, Y, Z].find((v) => v !== right && v !== at);
  const name = (p, q) => (vertices.indexOf(p) < vertices.indexOf(q) ? `${p}${q}` : `${q}${p}`);
  return Object.freeze({ hypotenuse: name(at, other), opposite: name(right, other), adjacent: name(at, right) });
}

export const RATIOS = Object.freeze(['cos', 'sin', 'tan']);
/** Ce que chaque rapport divise : cos = adjacent / hypotenuse, sin = opposite / hypotenuse, tan = opposite / adjacent. */
export const RATIO_SIDES = Object.freeze({
  cos: Object.freeze({ num: 'adjacent', den: 'hypotenuse' }),
  sin: Object.freeze({ num: 'opposite', den: 'hypotenuse' }),
  tan: Object.freeze({ num: 'opposite', den: 'adjacent' }),
});

/** Le rapport exact lu sur des longueurs (nombres, chaînes « 2,5 », fractions ou surds). */
export function ratioExact(kind, lengths) {
  const { num, den } = RATIO_SIDES[kind] ?? (() => { throw new Error(`rapport inconnu ${kind}`); })();
  if (lengths[num] == null || lengths[den] == null) throw new Error(`il faut ${num} et ${den}`);
  return surdDiv(S(lengths[num]), S(lengths[den]));
}

/** Le côté manquant par Pythagore : { hypotenuse } ou un côté de l'angle droit, exact. */
export function pythagoras({ a, b, hypotenuse }) {
  if (hypotenuse == null) return sqrt(add(square(S(a)), square(S(b))));
  const leg = a ?? b;
  const d = sub(square(S(hypotenuse)), square(S(leg)));
  if (cmp(d, frac(0)) <= 0) throw new Error('le côté dépasse l’hypoténuse');
  return sqrt(d);
}
/** Réciproque de Pythagore : le triangle de côtés (exacts) est-il rectangle, et en quel côté ? */
export function isRightTriangle(a, b, c) {
  const sq = [a, b, c].map((x) => square(S(x)));
  const iMax = sq.reduce((im, v, i) => (cmp(v, sq[im]) > 0 ? i : im), 0);
  const others = sq.filter((_, i) => i !== iMax);
  return Object.freeze({ right: eq(add(others[0], others[1]), sq[iMax]), hypotenuseIndex: iMax });
}

// ── Les bornes et les relations ──────────────────────────────────────────────

/**
 * Une valeur est-elle possible pour ce rapport d'un angle AIGU ? sin, cos ∈ ]0 ; 1[ (l'hypoténuse est
 * le plus grand côté), tan > 0. reason : 'le0' | 'gt1' | 'eq1' | null.
 */
export function isPossible(kind, value) {
  const v = S(value);
  if (surdCmp(v, 0) <= 0) return { possible: false, reason: 'le0' };
  if (kind === 'tan') return { possible: true, reason: null };
  const c = surdCmp(v, 1);
  if (c > 0) return { possible: false, reason: 'gt1' };
  if (c === 0) return { possible: false, reason: 'eq1' };
  return { possible: true, reason: null };
}

/**
 * Les trois rapports exacts d'un angle aigu dont on connaît UN rapport (relations du manuel p. 120) :
 * cos² + sin² = 1 et tan = sin / cos (donc 1 + tan² = 1 / cos²).
 */
export function fromRatio(kind, value) {
  const v = S(value);
  const p = isPossible(kind, v);
  if (!p.possible) return Object.freeze({ possible: false, reason: p.reason });
  let cos; let sin; let tan;
  if (kind === 'cos') { cos = v; sin = sqrt(sub(frac(1), square(v))); tan = surdDiv(sin, cos); }
  else if (kind === 'sin') { sin = v; cos = sqrt(sub(frac(1), square(v))); tan = surdDiv(sin, cos); }
  else { tan = v; cos = surdDiv(1, sqrt(add(frac(1), square(v)))); sin = surdMul(tan, cos); }
  return Object.freeze({ possible: true, reason: null, cos, sin, tan });
}
/** cos² x + sin² x = 1 vérifié EXACTEMENT sur deux valeurs. */
export const pythagoreanIdentity = (cos, sin) => eq(add(square(S(cos)), square(S(sin))), frac(1));

/** Les rapports exacts des angles remarquables (exercices 19 et 30). */
export const SPECIAL = Object.freeze({
  30: Object.freeze({ cos: surd(frac(1, 2), 3), sin: surd(frac(1, 2)), tan: surd(frac(1, 3), 3) }),
  45: Object.freeze({ cos: surd(frac(1, 2), 2), sin: surd(frac(1, 2), 2), tan: surd(1) }),
  60: Object.freeze({ cos: surd(frac(1, 2)), sin: surd(frac(1, 2), 3), tan: surd(1, 3) }),
});

// ── Choisir le rapport ───────────────────────────────────────────────────────

const PAIR = { 'adjacent|hypotenuse': 'cos', 'hypotenuse|opposite': 'sin', 'adjacent|opposite': 'tan' };
const pairKey = (x, y) => [x, y].sort().join('|');
/** Le rapport qui lie deux côtés (null s'il n'y en a pas : un côté avec lui-même). */
export const ratioLinking = (x, y) => PAIR[pairKey(x, y)] ?? null;

/**
 * Pour une LONGUEUR : connaissant l'angle et le côté `known`, calculer `wanted`.
 * op 'mul' : wanted = known × ratio(angle) ; op 'div' : wanted = known ÷ ratio(angle).
 */
export function lengthPlan({ known, wanted }) {
  const ratio = ratioLinking(known, wanted);
  if (!ratio) throw new Error('aucun rapport ne lie ces deux côtés');
  const op = RATIO_SIDES[ratio].num === wanted ? 'mul' : 'div';
  return Object.freeze({ ratio, op });
}
/** La longueur approchée par ce plan (angle en degrés). */
export function lengthByAngle({ known, wanted, length, angle }) {
  const { ratio, op } = lengthPlan({ known, wanted });
  const r = DEG[ratio](toNumber(F(angle)));
  const L = toNumber(F(length));
  return op === 'mul' ? L * r : L / r;
}
/** Pour un ANGLE : les deux côtés connus → le rapport, sa valeur exacte et l'angle approché (degrés). */
export function anglePlan(lengths) {
  const have = Object.keys(lengths).filter((k) => lengths[k] != null);
  for (const kind of ['tan', 'sin', 'cos']) {
    const { num, den } = RATIO_SIDES[kind];
    if (have.includes(num) && have.includes(den)) {
      const value = ratioExact(kind, lengths);
      return Object.freeze({ ratio: kind, value, angle: INV[kind](surdNumber(value)) });
    }
  }
  throw new Error('il faut deux côtés');
}

// ── Le monde approché (calculatrice) ─────────────────────────────────────────

const RAD = Math.PI / 180;
export const sinDeg = (d) => Math.sin(d * RAD);
export const cosDeg = (d) => Math.cos(d * RAD);
export const tanDeg = (d) => Math.tan(d * RAD);
export const asinDeg = (v) => Math.asin(v) / RAD;
export const acosDeg = (v) => Math.acos(v) / RAD;
export const atanDeg = (v) => Math.atan(v) / RAD;
const DEG = { sin: sinDeg, cos: cosDeg, tan: tanDeg };
const INV = { sin: asinDeg, cos: acosDeg, tan: atanDeg };
export const ratioDeg = (kind, d) => DEG[kind](d);
export const angleDeg = (kind, v) => INV[kind](typeof v === 'number' ? v : surdNumber(S(F(v))));

/**
 * L'arrondi du manuel (« المدوّر إلى الجزء من 100 ») écrit avec la virgule : roundTo(5.9155, 2) → '5,92'.
 * Un epsilon relatif protège des flottants (2,795 → '2,8' et non '2,7' à cause de 2,79499999).
 */
export function roundTo(x, digits = 0) {
  const k = 10 ** digits;
  const y = Math.round(x * k + Math.sign(x) * 1e-9 * Math.max(1, Math.abs(x * k))) / k;
  return y.toFixed(digits).replace('.', ',');
}
/** Troncature (« القيمة المقربة بالنقصان ») — utile pour contraster avec l'arrondi. */
export function truncateTo(x, digits = 0) {
  const k = 10 ** digits;
  return (Math.floor(x * k + 1e-9) / k).toFixed(digits).replace('.', ',');
}
/** L'écran de la calculatrice (10 chiffres significatifs, virgule) : 0,8090169944. */
export const screen = (x) => String(Number(x.toPrecision(10))).replace('.', ',');

const KEY = { sin: 'sin', cos: 'cos', tan: 'tan' };
const INV_KEY = { sin: 'sin⁻¹', cos: 'cos⁻¹', tan: 'tan⁻¹' };
const num = (v) => String(v).replace('.', ',');
/** ON sin 54 = (معارف 3، مثال 1). */
export const keysForRatio = (kind, deg) => Object.freeze(['ON', KEY[kind], num(deg), '=']);
/** ON 2nd sin⁻¹ 0,4 = (معارف 3، مثال 2). */
export const keysForAngle = (kind, value) => Object.freeze(['ON', '2nd', INV_KEY[kind], num(value), '=']);
/** ON 2,5 ÷ sin 25 (طرائق ص 119) : la longueur par le plan `lengthPlan`. */
export const keysForLength = ({ length, op, ratio, angle }) =>
  Object.freeze(['ON', num(length), op === 'mul' ? '×' : '÷', KEY[ratio], num(angle)]);

/**
 * Ce que fait une calculatrice réglée en RADIANS (mode « R ») — le piège de معارف 3 (« يجب برمجتها بالوحدة الدرجة ») :
 * ratioRad('sin', 30) → −0,988… (sin de 30 RADIANS), angleRad('sin', 0.52) → 0,5469… (un angle en radians, pas en degrés).
 * Utilisé par le lab trig-calculator (lesson hasiba-muthallathiya) pour montrer ce que la nacelle du drone contredit.
 */
export const ratioRad = (kind, x) => DEG[kind](x / RAD);
export const angleRad = (kind, v) => INV[kind](v) * RAD;

/** Hauteur d'un objet vu sous l'angle d'élévation `angle` depuis `distance` (+ hauteur de l'œil). */
export const heightByElevation = ({ distance, angle, eye = 0 }) => toNumber(F(distance)) * tanDeg(toNumber(F(angle))) + toNumber(F(eye));

