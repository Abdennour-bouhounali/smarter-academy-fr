/**
 * Les FRACTIONS du مختبر الأعداد — logique pure, sans React (§60, §61).
 *
 * Le مختبر الجبر a déjà des rationnels (`tools/algebra/rational.js`) et ce
 * module les RÉUTILISE : `makeRational`, `add`, `multiply`, `toLatex`… ne
 * sont pas réécrits ici. Ce que ce fichier ajoute est ce qu'une fraction doit
 * savoir faire quand elle est l'OBJET du laboratoire et non le coefficient
 * d'une équation :
 *
 *   - garder sa forme NON réduite. `2/4` et `1/2` sont le même nombre et
 *     deux fractions différentes : §9 fait découvrir l'équivalence en
 *     coupant les parts en deux, et un moteur qui réduit tout seul détruit
 *     exactement ce qu'on veut montrer. D'où `Frac` — `{n, d}` brut, jamais
 *     normalisé — à côté du rationnel réduit du مختبر الجبر.
 *   - dire son dénominateur commun (§12), sa forme décimale (§13), son
 *     pourcentage (§46), sa place sur une droite (§7).
 *
 * §61 : `1/3 + 1/3 + 1/3` doit rendre `1`, jamais `0,999…`. Tout passe donc
 * par les entiers ; on ne repasse en flottant que pour DESSINER ou COMPARER
 * à l'affichage, jamais pour calculer.
 */

import { gcd, lcm } from './numberTheory.js';

/**
 * Une fraction TELLE QUE L'ÉLÈVE L'ÉCRIT : `{n, d}`, d > 0, non réduite.
 *
 * C'est la différence avec le rationnel du مختبر الجبر, qui réduit toujours.
 * Ici `{n: 2, d: 4}` reste `2/4` : c'est le sujet du chapitre.
 *
 * @typedef {{n: number, d: number}} Frac
 */

/** Au-delà, un produit croisé sortirait des entiers sûrs de JavaScript. */
const LIMIT = 1e12;

/** Le plus grand dénominateur qu'un élève manipule — au-delà, le dessin n'apprend plus rien (§9). */
export const MAX_DENOMINATOR = 1000;

/** Une fraction brute, dénominateur positif, NON réduite. Rend null si elle n'a pas de sens. */
export function makeFrac(n, d = 1) {
  if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) return null;
  if (Math.abs(n) > LIMIT || Math.abs(d) > LIMIT) return null;
  const sign = d < 0 ? -1 : 1;

  return { n: n * sign, d: d * sign };
}

/** La fraction réduite — le geste de §13, explicite et jamais automatique. */
export function simplify(frac) {
  if (!frac || frac.d === 0) return null;
  const g = gcd(Math.abs(frac.n), frac.d) || 1;

  return { n: frac.n / g, d: frac.d / g };
}

/** Est-elle déjà irréductible ? Ce que §50 « fraction challenge » demande de vérifier. */
export function isSimplified(frac) {
  if (!frac) return false;

  return gcd(Math.abs(frac.n), frac.d) === 1;
}

/** Le facteur par lequel on peut encore simplifier — 1 si la fraction est irréductible. */
export function simplifyFactor(frac) {
  if (!frac) return 1;

  return gcd(Math.abs(frac.n), frac.d) || 1;
}

export const fracToNumber = (frac) => (frac && frac.d !== 0 ? frac.n / frac.d : NaN);


/**
 * Une fraction ÉQUIVALENTE, obtenue en multipliant haut et bas par le même
 * entier — le geste de §9 : couper chaque part en `factor` morceaux.
 */
export function expand(frac, factor) {
  if (!frac || !Number.isInteger(factor) || factor < 1) return null;

  return makeFrac(frac.n * factor, frac.d * factor);
}

/** Les premières fractions équivalentes, la fraction elle-même comprise (§9). */
export function equivalents(frac, count = 6) {
  if (!frac) return [];
  const base = simplify(frac);
  const out = [];
  for (let k = 1; out.length < count && k <= 40; k += 1) {
    const next = expand(base, k);
    if (next && next.d <= MAX_DENOMINATOR) out.push(next);
  }

  return out;
}

/**
 * Le DÉNOMINATEUR COMMUN de deux fractions, et ce que chacune devient (§12).
 *
 * On prend le PPCM, pas le produit : `1/4 + 1/6` donne douzièmes et non
 * vingt-quatrièmes. C'est ce que fait le manuel, et le dessin de §12 subdivise
 * d'autant moins de fois.
 *
 * @returns {{denominator: number, left: Frac, right: Frac, leftFactor: number, rightFactor: number} | null}
 */
export function commonDenominator(a, b) {
  if (!a || !b) return null;
  const denominator = lcm(a.d, b.d);
  if (!denominator || denominator > LIMIT) return null;
  const leftFactor = denominator / a.d;
  const rightFactor = denominator / b.d;

  return {
    denominator,
    leftFactor,
    rightFactor,
    left: makeFrac(a.n * leftFactor, denominator),
    right: makeFrac(b.n * rightFactor, denominator),
  };
}

/* ── Les quatre opérations (§11) ───────────────────────────────────────────
   Chacune rend le résultat BRUT — celui que le calcul écrit — et sa forme
   réduite à part. §11 veut qu'on montre le modèle puis le calcul : l'élève
   doit voir `7/12` naître de `4/12 + 3/12`, et décider lui-même de simplifier. */

/** @returns {{raw: Frac, simplified: Frac, common: object|null} | null} */
export function addFrac(a, b) {
  const common = commonDenominator(a, b);
  if (!common) return null;
  const raw = makeFrac(common.left.n + common.right.n, common.denominator);
  if (!raw) return null;

  return { raw, simplified: simplify(raw), common };
}

export function subtractFrac(a, b) {
  const common = commonDenominator(a, b);
  if (!common) return null;
  const raw = makeFrac(common.left.n - common.right.n, common.denominator);
  if (!raw) return null;

  return { raw, simplified: simplify(raw), common };
}

export function multiplyFrac(a, b) {
  if (!a || !b) return null;
  const raw = makeFrac(a.n * b.n, a.d * b.d);
  if (!raw) return null;

  return { raw, simplified: simplify(raw), common: null };
}

/** La division : multiplier par l'inverse. `reciprocal` est ce que le pas montre. */
export function divideFrac(a, b) {
  if (!a || !b || b.n === 0) return null;
  const reciprocal = makeFrac(b.d, b.n);
  if (!reciprocal) return null;
  const raw = makeFrac(a.n * reciprocal.n, a.d * reciprocal.d);
  if (!raw) return null;

  return { raw, simplified: simplify(raw), common: null, reciprocal };
}

/**
 * La COMPARAISON, exacte (§10). Produit croisé sur des entiers : `3/5` et
 * `4/7` se départagent par `21` contre `20`, sans jamais passer en flottant.
 *
 * @returns {-1|0|1|null}
 */
export function compareFrac(a, b) {
  if (!a || !b) return null;
  const left = a.n * b.d;
  const right = b.n * a.d;
  if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right)) {
    const diff = fracToNumber(a) - fracToNumber(b);

    return diff === 0 ? 0 : (diff < 0 ? -1 : 1);
  }

  return left === right ? 0 : (left < right ? -1 : 1);
}

/** Les produits croisés eux-mêmes — ce que §10 affiche pour EXPLIQUER la comparaison. */
export function crossProducts(a, b) {
  if (!a || !b) return null;

  return { left: a.n * b.d, right: b.n * a.d, leftLabel: `${a.n} × ${b.d}`, rightLabel: `${b.n} × ${a.d}` };
}

/** `<`, `>` ou `=` — le signe que §45 demande d'afficher. */
export function comparisonSign(order) {
  if (order === null) return null;

  return order < 0 ? '<' : (order > 0 ? '>' : '=');
}

/**
 * Le DÉCIMAL d'une fraction, et s'il tombe juste (§13).
 *
 * Une fraction est décimale si son dénominateur réduit ne contient que des 2
 * et des 5 : c'est un FAIT sur les puissances de dix, et l'élève doit
 * pouvoir le lire plutôt que le subir. Quand elle ne tombe pas juste, on rend
 * la période — `1/3 = 0,(3)` — qui est la vraie réponse, pas `0,3333`.
 *
 * @returns {{exact: boolean, value: number, digits: string, period: string|null, integer: string}}
 */
export function fracToDecimal(frac, maxDigits = 12) {
  if (!frac || frac.d === 0) return null;
  const simplified = simplify(frac);
  const negative = simplified.n < 0;
  let n = Math.abs(simplified.n);
  const d = simplified.d;
  const integer = Math.floor(n / d);
  n %= d;

  // La partie décimale, chiffre par chiffre : la division posée elle-même.
  const seen = new Map();
  const digits = [];
  let periodStart = -1;
  while (n !== 0 && digits.length < maxDigits) {
    if (seen.has(n)) { periodStart = seen.get(n); break; }
    seen.set(n, digits.length);
    n *= 10;
    digits.push(Math.floor(n / d));
    n %= d;
  }

  const exact = n === 0 && periodStart === -1;
  const text = digits.join('');

  return {
    exact,
    negative,
    integer: String(integer),
    digits: periodStart === -1 ? text : text.slice(0, periodStart),
    period: periodStart === -1 ? null : text.slice(periodStart),
    value: fracToNumber(frac),
  };
}

/**
 * Le chemin inverse (§13) : un décimal → la fraction qu'il ÉCRIT.
 *
 * `0,75` donne d'abord `75/100` — ce que le nombre dit littéralement — puis
 * `3/4`. Les deux sont rendues, car §13 veut montrer la simplification, pas
 * l'escamoter.
 *
 * @returns {{literal: Frac, simplified: Frac, factor: number} | null}
 */
export function decimalToFrac(value) {
  if (!Number.isFinite(value)) return null;
  const text = String(value);
  if (text.includes('e') || text.includes('E')) return null;
  const places = text.split('.')[1]?.length ?? 0;
  if (places > 9) return null;
  const d = 10 ** places;
  const literal = makeFrac(Math.round(value * d), d);
  if (!literal) return null;

  return { literal, simplified: simplify(literal), factor: simplifyFactor(literal) };
}

/**
 * Le NOMBRE MIXTE — `7/3 = 2 ⅓`. Le manuel algérien l'écrit, et §46 le
 * compte parmi les représentations d'une même valeur.
 *
 * @returns {{whole: number, n: number, d: number, negative: boolean} | null}
 */
export function toMixed(frac) {
  if (!frac || frac.d === 0) return null;
  const negative = frac.n < 0;
  const n = Math.abs(frac.n);
  const whole = Math.floor(n / frac.d);

  return { whole, n: n % frac.d, d: frac.d, negative };
}

/** Le chemin inverse : `2 ⅓` → `7/3`. */
export function fromMixed(whole, n, d, negative = false) {
  if (!Number.isInteger(whole) || !Number.isInteger(n) || !Number.isInteger(d) || d <= 0) return null;
  const total = whole * d + n;

  return makeFrac(negative ? -total : total, d);
}

/**
 * Le LaTeX d'une fraction, pour MathText. Le signe moins DEVANT la barre
 * (`-\frac{1}{3}`), jamais au numérateur — comme l'écrit le manuel, et comme
 * le fait déjà `rational.toLatex`.
 */
export function fracToLatex(frac) {
  if (!frac) return '';
  if (frac.d === 1) return String(frac.n);
  const body = `\\frac{${Math.abs(frac.n)}}{${frac.d}}`;

  return frac.n < 0 ? `-${body}` : body;
}

/** `3/4` en texte nu — ce que lit un lecteur d'écran, avec le VRAI signe moins. */
export function fracToText(frac) {
  if (!frac) return '';
  if (frac.d === 1) return String(frac.n).replace('-', '−');

  return `${String(frac.n).replace('-', '−')}/${frac.d}`;
}

/**
 * Lire ce que l'élève tape : `3/4`, `0,75`, `75%`, `2 1/3`, `-5`.
 *
 * Une seule porte d'entrée pour toutes les écritures d'une même valeur —
 * c'est §46 (« une valeur, plusieurs représentations ») pris au sérieux dès
 * la saisie. La virgule décimale est acceptée comme le point : sur un clavier
 * algérien, c'est elle qu'on tape.
 *
 * @returns {{frac: Frac, source: 'fraction'|'decimal'|'percent'|'mixed'|'integer'} | null}
 */
export function parseNumberInput(raw) {
  if (typeof raw !== 'string') return null;
  const text = raw.trim().replace(/٫|،/g, ',').replace(/\s+/g, ' ');
  if (!text) return null;

  const percent = /^(-?[\d,. ]+)\s*%$/.exec(text);
  if (percent) {
    const inner = parseNumberInput(percent[1].trim());
    if (!inner) return null;
    const frac = makeFrac(inner.frac.n, inner.frac.d * 100);

    return frac ? { frac, source: 'percent' } : null;
  }

  const mixed = /^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(text);
  if (mixed) {
    const whole = Number(mixed[1]);
    const frac = fromMixed(Math.abs(whole), Number(mixed[2]), Number(mixed[3]), whole < 0 || Object.is(whole, -0));

    return frac ? { frac, source: 'mixed' } : null;
  }

  const fraction = /^(-?\d+)\s*\/\s*(-?\d+)$/.exec(text);
  if (fraction) {
    const frac = makeFrac(Number(fraction[1]), Number(fraction[2]));

    return frac ? { frac, source: 'fraction' } : null;
  }

  const decimal = /^-?\d*[,.]?\d+$/.exec(text);
  if (decimal) {
    const value = Number(text.replace(',', '.'));
    if (!Number.isFinite(value)) return null;
    if (Number.isInteger(value)) {
      const frac = makeFrac(value, 1);

      return frac ? { frac, source: 'integer' } : null;
    }
    const parsed = decimalToFrac(value);

    return parsed ? { frac: parsed.literal, source: 'decimal' } : null;
  }

  return null;
}
