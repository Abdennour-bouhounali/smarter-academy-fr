/**
 * LA LOI NORMALE — التوزيع الطبيعي (الغاوسي). Logique pure, sans React.
 *
 *     X ~ N(μ, σ²),  z = (x − μ) / σ,  P(X ≤ x) = Φ(z)
 *
 * Φ est calculée par deux méthodes classiques, chacune là où elle est exacte
 * (G. Marsaglia, « Evaluating the Normal Distribution », J. Stat. Softw.
 * 11(4), 2004) :
 *
 *   - |z| ≤ 7 : la série de Taylor  Φ(z) = 1/2 + φ(z)·(z + z³/3 + z⁵/(3·5) + …),
 *     sommée jusqu'à ce qu'un terme ne change plus rien — erreur absolue de
 *     l'ordre de 1e−15 ;
 *   - |z| > 7 : la fraction continue de la queue
 *     1 − Φ(z) = φ(z) / (z + 1/(z + 2/(z + 3/(z + …)))), évaluée de bas en haut
 *     — elle converge d'autant plus vite que z est grand.
 *
 * Aucune table, aucune approximation à 1e−4 : le laboratoire affiche quatre
 * décimales, il doit donc en connaître bien plus. Φ(±40) est fini (1 et 0).
 */

const SQRT_2PI = Math.sqrt(2 * Math.PI);

/** Ce qu'un paramètre peut valoir sans rendre la courbe absurde. */
export const NORMAL_VALUE_BOUND = 1e6;

/** La densité de N(0, 1). */
export function standardPdf(z) {
  return Math.exp(-0.5 * z * z) / SQRT_2PI;
}

/** La densité de N(μ, σ²). `null` si σ ≤ 0. */
export function normalPdf(x, mu, sigma) {
  if (!(sigma > 0)) return null;

  return standardPdf((x - mu) / sigma) / sigma;
}

/** Φ(z), la fonction de répartition de N(0, 1). */
export function standardCdf(z) {
  if (Number.isNaN(z)) return NaN;
  if (z === Infinity) return 1;
  if (z === -Infinity) return 0;
  if (Math.abs(z) <= 7) {
    let term = z;
    let sum = z;
    const z2 = z * z;
    for (let k = 3; k < 400; k += 2) {
      term *= z2 / k;
      const next = sum + term;
      if (next === sum) break;
      sum = next;
    }
    const value = 0.5 + standardPdf(z) * sum;

    return Math.min(1, Math.max(0, value));
  }
  const tail = upperTail(Math.abs(z));

  return z > 0 ? 1 - tail : tail;
}

/** 1 − Φ(z) pour z > 7, par la fraction continue (60 étages suffisent largement à cette distance). */
function upperTail(z) {
  const pdf = standardPdf(z);
  if (pdf === 0) return 0;
  let fraction = z;
  for (let k = 60; k >= 1; k -= 1) fraction = z + k / fraction;

  return pdf / fraction;
}

/** z = (x − μ) / σ ; `null` si σ ≤ 0 ou si une valeur n'est pas finie. */
export function zScore(x, mu, sigma) {
  if (![x, mu, sigma].every(Number.isFinite) || !(sigma > 0)) return null;

  return (x - mu) / sigma;
}

export const QUERY_TYPES = Object.freeze(['le', 'ge', 'between']);
export const SCALES = Object.freeze(['x', 'z']);

/**
 * Les problèmes d'un jeu de paramètres, en CODES (le texte est dans l'i18n) :
 *   `sigma`   σ ≤ 0 (ou illisible) ;
 *   `order`   a > b pour P(a ≤ X ≤ b) ;
 *   `finite`  une valeur manquante ou hors de ±NORMAL_VALUE_BOUND.
 */
export function normalIssues({ mu, sigma, x, a, b, query }) {
  const issues = [];
  const bounded = (v) => Number.isFinite(v) && Math.abs(v) <= NORMAL_VALUE_BOUND;
  if (!bounded(mu)) issues.push('finite');
  if (!Number.isFinite(sigma) || !(sigma > 0) || sigma > NORMAL_VALUE_BOUND) issues.push('sigma');
  if (query === 'between') {
    if (!bounded(a) || !bounded(b)) issues.push('finite');
    else if (a > b) issues.push('order');
  } else if (!bounded(x)) issues.push('finite');

  return [...new Set(issues)];
}

/**
 * Une REQUÊTE complète : les z, les Φ, la probabilité, et de quoi écrire le
 * calcul (formule → substitution → résultat). `ok: false` avec les codes
 * de `normalIssues` quand on ne peut pas calculer honnêtement.
 *
 *   le      : P(X ≤ x)      = Φ(z)
 *   ge      : P(X ≥ x)      = 1 − Φ(z)
 *   between : P(a ≤ X ≤ b)  = Φ(z_b) − Φ(z_a)
 */
export function normalQuery(params) {
  const issues = normalIssues(params);
  if (issues.length > 0) return { ok: false, issues };
  const { mu, sigma, x, a, b, query } = params;
  if (query === 'between') {
    const za = (a - mu) / sigma;
    const zb = (b - mu) / sigma;
    const phiA = standardCdf(za);
    const phiB = standardCdf(zb);

    return { ok: true, query, za, zb, phiA, phiB, probability: Math.max(0, phiB - phiA) };
  }
  const z = (x - mu) / sigma;
  const phi = standardCdf(z);

  return { ok: true, query: query === 'ge' ? 'ge' : 'le', z, phi, probability: query === 'ge' ? 1 - phi : phi };
}

/** La demi-largeur du dessin, en écarts types : ±4σ couvre 99,994 % de la masse. */
export const CURVE_HALF_WIDTH = 4;

/**
 * La courbe échantillonnée UNE fois par (μ, σ, échelle) : `count + 1`
 * points réguliers sur [μ − 4σ ; μ + 4σ] (échelle X) ou [−4 ; 4] (échelle Z,
 * la courbe centrée réduite). Chaque point porte t (l'abscisse dessinée) et
 * la densité à cette abscisse.
 */
export function sampleCurve(mu, sigma, scale = 'x', count = 160) {
  if (!(sigma > 0) || !Number.isFinite(mu)) return { from: 0, to: 0, peak: 0, points: [] };
  const standard = scale === 'z';
  const from = standard ? -CURVE_HALF_WIDTH : mu - CURVE_HALF_WIDTH * sigma;
  const to = standard ? CURVE_HALF_WIDTH : mu + CURVE_HALF_WIDTH * sigma;
  const points = [];
  for (let i = 0; i <= count; i += 1) {
    const t = from + ((to - from) * i) / count;
    points.push({ t, y: standard ? standardPdf(t) : normalPdf(t, mu, sigma) });
  }

  return { from, to, peak: standard ? standardPdf(0) : normalPdf(mu, mu, sigma), points };
}

/**
 * L'intervalle ombré, dans l'échelle dessinée et coupé au cadre du dessin :
 * `[lo ; hi]` (±Infinity quand la région court jusqu'au bout).
 */
export function shadedInterval(params, result, scale = 'x') {
  if (!result?.ok) return null;
  const toScale = (v) => (scale === 'z' ? (v - params.mu) / params.sigma : v);
  if (result.query === 'between') return { lo: toScale(params.a), hi: toScale(params.b) };
  if (result.query === 'ge') return { lo: toScale(params.x), hi: Infinity };

  return { lo: -Infinity, hi: toScale(params.x) };
}

/** Les repères μ + kσ (k = −3…3) dans l'échelle dessinée. */
export function sigmaTicks(mu, sigma, scale = 'x') {
  return [-3, -2, -1, 0, 1, 2, 3].map((k) => ({ k, t: scale === 'z' ? k : mu + k * sigma }));
}

/** La règle 68–95–99,7, CALCULÉE (pas récitée) : P(|Z| ≤ k) pour k = 1, 2, 3. */
export function empiricalRule() {
  return [1, 2, 3].map((k) => ({ k, probability: standardCdf(k) - standardCdf(-k) }));
}

/**
 * Le contour de la région ombrée : les points de la courbe échantillonnée
 * compris dans [lo ; hi] (coupé au cadre), plus les deux bords EXACTS
 * (densité calculée à la borne, pas au point d'échantillon voisin) — sinon
 * l'aire déborderait ou manquerait d'un pas.
 */
export function regionPoints(curve, interval, mu, sigma, scale = 'x') {
  if (!interval || curve.points.length === 0) return [];
  const lo = Math.max(curve.from, interval.lo);
  const hi = Math.min(curve.to, interval.hi);
  if (!(hi >= lo)) return [];
  const density = (t) => (scale === 'z' ? standardPdf(t) : normalPdf(t, mu, sigma));
  const inside = curve.points.filter((p) => p.t > lo && p.t < hi);

  return [{ t: lo, y: density(lo) }, ...inside, { t: hi, y: density(hi) }];
}
