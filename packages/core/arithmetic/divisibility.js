/**
 * Divisibilité, PGCD et fractions irréductibles — le noyau
 * mathématique de l'unité 1 de 4AM (« الأعداد الطبيعية والأعداد الناطقة »).
 *
 * CONTRAT (convention de la plateforme) : tout ce qui est AFFICHÉ par une
 * leçon ou une manipulation dérive de ces fonctions pures. Aucun module ne
 * recalcule un PGCD à la main, aucune étape d'algorithme n'est écrite en dur.
 *
 * FIDÉLITÉ AU MANUEL — deux points où ce module diffère volontairement d'une
 * implémentation « naturelle » :
 *
 *   • `differenceSteps` continue jusqu'à un fruit NUL (13 − 13 = 0) et
 *     désigne le PGCD comme « آخر فرق غير معدوم » (manuel p. 13). Une version
 *     qui s'arrête à l'égalité des deux nombres donnerait le même résultat
 *     mais pas la même trace, et c'est la trace que l'élève lit.
 *   • `euclidSteps` écrit chaque étape sous la forme a = b × q + r et inclut
 *     l'étape au reste nul ; le PGCD est « آخر باقٍ غير معدوم ».
 *
 * Aucun texte arabe ici : l'affichage appartient aux leçons.
 */

const isNatural = (n) => Number.isInteger(n) && n >= 0;
const isPositiveNatural = (n) => Number.isInteger(n) && n > 0;

/** Division euclidienne a = b × q + r, 0 ≤ r < b. */
export function divmod(a, b) {
  if (!isNatural(a) || !isPositiveNatural(b)) return null;
  const q = Math.floor(a / b);
  return { q, r: a - q * b };
}

/**
 * خوارزمية الفروق المتتابعة — PGCD(a ; b) = PGCD(b ; a − b), a ≥ b.
 *
 * Chaque étape porte le couple (big, small) et sa différence. La dernière
 * étape a une différence NULLE (manuel : « و 13 − 13 = 0 »). Le PGCD est la
 * dernière différence non nulle.
 *
 * `maxSteps` borne la trace (1000 et 1 en demandent 1000). Une trace COUPÉE
 * n'a pas atteint le fruit nul : elle rend `complete: false` et `gcd: null`
 * — sa dernière différence non nulle n'est PAS le PGCD, et le dire serait
 * faux (défaut corrigé le 2026-09-30).
 *
 * @returns {{steps: Array<{big:number, small:number, diff:number}>, gcd:number|null, complete:boolean}}
 */
export function differenceSteps(a, b, { maxSteps = 10_000 } = {}) {
  if (!isPositiveNatural(a) || !isPositiveNatural(b)) return { steps: [], gcd: null, complete: false };
  let big = Math.max(a, b);
  let small = Math.min(a, b);
  const steps = [];
  let lastNonZero = null;
  while (steps.length < maxSteps) {
    const diff = big - small;
    steps.push({ big, small, diff });
    if (diff === 0) break;
    lastNonZero = diff;
    big = Math.max(small, diff);
    small = Math.min(small, diff);
  }
  const complete = steps.length > 0 && steps[steps.length - 1].diff === 0;
  return { steps, gcd: complete ? (lastNonZero ?? big) : null, complete };
}

/**
 * خوارزمية إقليدس — PGCD(a ; b) = PGCD(b ; r), r reste de a par b.
 *
 * Chaque étape : a = b × q + r. L'étape au reste nul est incluse ; le PGCD
 * est le dernier reste non nul (= le diviseur de la dernière étape).
 *
 * @returns {{steps: Array<{a:number, b:number, q:number, r:number}>, gcd:number}}
 */
export function euclidSteps(a, b) {
  if (!isPositiveNatural(a) || !isPositiveNatural(b)) return { steps: [], gcd: null };
  let x = Math.max(a, b);
  let y = Math.min(a, b);
  const steps = [];
  while (y !== 0) {
    const { q, r } = divmod(x, y);
    steps.push({ a: x, b: y, q, r });
    x = y;
    y = r;
  }
  return { steps, gcd: x };
}

/** Le PGCD, calculé par Euclide (rapide) — pour les usages hors démonstration. */
export function gcd(a, b) {
  if (!isNatural(a) || !isNatural(b)) return null;
  if (a === 0) return b;
  if (b === 0) return a;
  return euclidSteps(a, b).gcd;
}

/** La fraction n/d est-elle irréductible ? (n et d premiers entre eux, d ≠ 0.) */
export function isIrreducible(n, d) {
  if (!isNatural(Math.abs(n)) || !isPositiveNatural(d)) return false;
  return gcd(Math.abs(n), d) === 1;
}
