/**
 * Divisibilité, diviseurs, PGCD et réduction de fractions — le noyau
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

/** `d` divise-t-il `n` ? (« d قاسم لـ n »). */
export function isDivisor(d, n) {
  return isPositiveNatural(d) && isNatural(n) && n % d === 0;
}

/**
 * La borne de la méthode du manuel (p. 11) : on teste les diviseurs dont le
 * carré est ≤ a. Pour 105 → 10 (10² ≤ 105 < 11²).
 */
export function divisionTestBound(n) {
  if (!isPositiveNatural(n)) return 0;
  return Math.floor(Math.sqrt(n));
}

/**
 * Les couples (d, n/d) avec d ≤ n/d — le tableau « كتابة العدد على شكل جداء
 * عاملين » de l'activité 2. Pour 60 : [1,60], [2,30], [3,20], [4,15], [5,12], [6,10].
 */
export function factorPairs(n) {
  if (!isPositiveNatural(n)) return [];
  const pairs = [];
  for (let d = 1; d <= divisionTestBound(n); d += 1) {
    if (n % d === 0) pairs.push([d, n / d]);
  }
  return pairs;
}

/** Les diviseurs d'un naturel non nul, croissants. */
export function divisors(n) {
  if (!isPositiveNatural(n)) return [];
  const out = new Set();
  for (const [d, e] of factorPairs(n)) {
    out.add(d);
    out.add(e);
  }
  return [...out].sort((x, y) => x - y);
}

/** Les diviseurs COMMUNS de deux naturels, croissants. */
export function commonDivisors(a, b) {
  const db = new Set(divisors(b));
  return divisors(a).filter((d) => db.has(d));
}

/**
 * Le PGCD par la DÉFINITION (le plus grand des diviseurs communs), séparé des
 * deux algorithmes pour que la vérification d'une méthode ne soit pas circulaire.
 * Convention du manuel (نتائج مباشرة) : PGCD(a ; 0) = a.
 */
export function gcdByDefinition(a, b) {
  if (!isNatural(a) || !isNatural(b)) return null;
  if (a === 0 && b === 0) return 0;
  if (a === 0) return b;
  if (b === 0) return a;
  const common = commonDivisors(a, b);
  return common[common.length - 1];
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

/** Le nombre d'étapes de la méthode des différences (le manuel demande « ثمان خطوات » pour 765 et 135). */
export function differenceStepCount(a, b) {
  return differenceSteps(a, b).steps.length;
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

/** PGCD(a ; b) = 1 ? (« أوليان فيما بينهما »). */
export function areCoprime(a, b) {
  return gcdByDefinition(a, b) === 1;
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

/**
 * Un pas de réduction par un diviseur commun choisi (la méthode de سمير :
 * 84/48 → ÷4 → 21/12). Rend null si `k` ne divise pas les deux.
 */
export function reduceByCommonDivisor(n, d, k) {
  if (!isPositiveNatural(k) || !isNatural(n) || !isPositiveNatural(d)) return null;
  if (n % k !== 0 || d % k !== 0) return null;
  return { n: n / k, d: d / k, k };
}

/**
 * Le chemin complet de réduction par une suite de diviseurs communs
 * (ex. [4, 3] pour 84/48 → 21/12 → 7/4). Renvoie les états successifs ; un
 * diviseur invalide arrête le chemin (`ok: false`).
 */
export function reducePath(n, d, divisorsToApply) {
  const path = [{ n, d, k: null }];
  let cur = { n, d };
  for (const k of divisorsToApply) {
    const next = reduceByCommonDivisor(cur.n, cur.d, k);
    if (!next) return { path, ok: false, irreducible: isIrreducible(cur.n, cur.d) };
    path.push(next);
    cur = next;
  }
  return { path, ok: true, irreducible: isIrreducible(cur.n, cur.d) };
}

/**
 * La méthode du manuel (p. 13) : diviser numérateur et dénominateur par leur
 * PGCD, en une fois. Renvoie aussi le PGCD et la trace d'Euclide utilisée.
 */
export function reduceFraction(n, d) {
  if (!isNatural(n) || !isPositiveNatural(d)) return null;
  const g = n === 0 ? d : gcd(n, d);
  return { n: n / g, d: d / g, gcd: g, euclid: n === 0 ? [] : euclidSteps(n, d).steps };
}

/* ── Mise en forme LaTeX (les leçons n'assemblent jamais ces chaînes) ─────── */

/** `1938 = 836 \times 2 + 266` */
export function euclidStepTex({ a, b, q, r }) {
  return `${a} = ${b} \\times ${q} + ${r}`;
}

/** `117 - 91 = 26` */
export function differenceStepTex({ big, small, diff }) {
  return `${big} - ${small} = ${diff}`;
}

/** `\mathrm{PGCD}(117\ ;\ 91) = \mathrm{PGCD}(91\ ;\ 26)` */
export function pgcdEqualityTex(a, b, c, d) {
  return `\\mathrm{PGCD}(${a}\\ ;\\ ${b}) = \\mathrm{PGCD}(${c}\\ ;\\ ${d})`;
}

/** `\mathrm{PGCD}(117\ ;\ 91) = 13` */
export function pgcdValueTex(a, b, value) {
  return `\\mathrm{PGCD}(${a}\\ ;\\ ${b}) = ${value}`;
}

/** `\dfrac{84}{48} = \dfrac{84 \div 4}{48 \div 4} = \dfrac{21}{12}` */
export function reductionStepTex(n, d, k) {
  return `\\dfrac{${n}}{${d}} = \\dfrac{${n} \\div ${k}}{${d} \\div ${k}} = \\dfrac{${n / k}}{${d / k}}`;
}
