/**
 * POURCENTAGES, PROPORTIONNALITÉ et RAPPORTS — logique pure (§14 à §19).
 *
 * Un pourcentage n'est pas une opération, c'est une FRACTION de dénominateur
 * 100 : tout ce fichier travaille donc sur les fractions exactes de
 * `fraction.js` et ne rend un flottant que pour dessiner. `35 %` de `200`
 * vaut `70` exactement, pas `69,99999999999999`.
 *
 * §15 demande que l'élève « voie la proportionnalité plutôt que de mémoriser
 * des formules ». D'où `percentageLadder` : une échelle de repères
 * (10 %, 25 %, 50 %…) calculés d'un coup, que l'écran montre ENSEMBLE. La
 * formule n'est jamais le sujet ; le rapport constant l'est.
 */

import {
  makeFrac, simplify, fracToNumber, multiplyFrac, fracToDecimal,
} from './fraction.js';
import { gcd, roundTo } from './numberTheory.js';

/* ── §14, §46 : un pourcentage est une fraction de dénominateur 100 ─────── */

/** `35` → `35/100`. Le pourcentage ENTIER ou décimal (`12,5 %` → `125/1000`). */
export function percentToFrac(percent) {
  if (!Number.isFinite(percent)) return null;
  if (Number.isInteger(percent)) return makeFrac(percent, 100);
  const places = String(percent).split('.')[1]?.length ?? 0;
  if (places > 6) return null;
  const factor = 10 ** places;

  return makeFrac(Math.round(percent * factor), 100 * factor);
}

/** `3/4` → `75`. Le chemin inverse, exact quand il tombe juste. */
export function fracToPercent(frac) {
  if (!frac || frac.d === 0) return null;

  return roundTo((frac.n * 100) / frac.d, 6);
}

/**
 * `35 %` de `200` (§14).
 *
 * Le calcul se fait en fractions, et `steps` porte les deux écritures que le
 * manuel donne — `200 × 35/100` et `200 ÷ 100 × 35` — parce que §14 veut que
 * la méthode se VOIE.
 *
 * @returns {{percent, quantity, result, exact: boolean, perUnit: number} | null}
 */
export function percentageOf(percent, quantity) {
  const frac = percentToFrac(percent);
  if (!frac || !Number.isFinite(quantity)) return null;
  const q = makeFrac(...ratioOfNumber(quantity));
  if (!q) return null;
  const product = multiplyFrac(frac, q);
  if (!product) return null;
  const result = fracToNumber(product.simplified);

  return {
    percent,
    quantity,
    result: roundTo(result, 6),
    fraction: product.simplified,
    exact: fracToDecimal(product.simplified)?.exact ?? false,
    // Ce que vaut UN pour cent : le pas de l'échelle de §15.
    perUnit: roundTo(quantity / 100, 8),
  };
}

/** Un nombre → le couple (numérateur, dénominateur) qui l'écrit exactement. */
function ratioOfNumber(value) {
  if (Number.isInteger(value)) return [value, 1];
  const places = String(value).split('.')[1]?.length ?? 0;
  if (places > 9) return [Math.round(value * 1e9), 1e9];
  const d = 10 ** places;

  return [Math.round(value * d), d];
}

/** Quel pourcentage `part` fait-il de `whole` ? — le sens inverse de §14. */
export function percentageThat(part, whole) {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole === 0) return null;

  return roundTo((part / whole) * 100, 6);
}

/**
 * Le POURCENTAGE INVERSE (§14) : « 70 est 35 % de quoi ? »
 *
 * C'est la question que les élèves ratent le plus, et elle mérite son propre
 * calcul plutôt qu'une division improvisée dans un composant.
 */
export function reversePercentage(result, percent) {
  if (!Number.isFinite(result) || !Number.isFinite(percent) || percent === 0) return null;

  return roundTo((result * 100) / percent, 6);
}

/**
 * L'ÉCHELLE de §15 : ce que valent les repères usuels d'un coup d'œil.
 *
 * On les calcule TOUS, pour que l'écran les montre ensemble et que la
 * proportionnalité saute aux yeux — 10 % vaut 20, donc 20 % vaut 40.
 */
const LADDER_STOPS = Object.freeze([1, 5, 10, 20, 25, 50, 75, 100]);

export function percentageLadder(quantity, stops = LADDER_STOPS) {
  if (!Number.isFinite(quantity)) return [];

  return stops.map((percent) => ({
    percent,
    value: roundTo((quantity * percent) / 100, 6),
  }));
}

/**
 * Le CHANGEMENT en pourcentage (§16).
 *
 * `direction` distingue hausse et baisse sans dépendre de la couleur (§16 :
 * « do not rely exclusively on color ») : c'est un mot que l'interface écrit,
 * plus une flèche, plus un signe.
 *
 * @returns {{from, to, difference, percent, direction: 'increase'|'decrease'|'none', factor} | null}
 */
export function percentageChange(from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from === 0) return null;
  const difference = to - from;

  return {
    from,
    to,
    difference: roundTo(difference, 6),
    percent: roundTo((difference / Math.abs(from)) * 100, 6),
    direction: difference === 0 ? 'none' : (difference > 0 ? 'increase' : 'decrease'),
    // Le COEFFICIENT multiplicateur : +20 % est ×1,2 — le lien que §16 doit montrer.
    factor: roundTo(to / from, 8),
  };
}

/** Appliquer une hausse ou une baisse : `200` puis `+15 %` → `230`. */
export function applyChange(value, percent) {
  if (!Number.isFinite(value) || !Number.isFinite(percent)) return null;

  return roundTo(value * (1 + percent / 100), 6);
}

/**
 * Le pourcentage à appliquer pour ANNULER un changement (§16).
 *
 * `+25 %` s'annule par `−20 %`, pas par `−25 %` : c'est l'erreur classique,
 * et le laboratoire peut la montrer parce qu'il la calcule.
 */
export function inverseChange(percent) {
  if (!Number.isFinite(percent) || percent <= -100) return null;

  return roundTo((-percent / (100 + percent)) * 100, 6);
}

/* ── §17, §18 : la proportionnalité ────────────────────────────────────── */

/**
 * Une table est-elle proportionnelle ? Et de quel coefficient (§17) ?
 *
 * Le verdict est EXACT : on compare les produits croisés sur des entiers
 * quand on le peut, jamais `y1/x1 === y2/x2` en flottant — sur `0,1` et
 * `0,3`, cette égalité est fausse et le laboratoire mentirait.
 *
 * `ratios` porte chaque `y/x` pour que §17 les affiche, et `failures` dit
 * QUELLES colonnes cassent la proportionnalité — §53 : on montre la
 * relation, pas seulement le verdict.
 *
 * @param {Array<{x: number, y: number}>} rows
 */
export function analyzeProportionality(rows) {
  const clean = (Array.isArray(rows) ? rows : []).filter(
    (r) => Number.isFinite(r?.x) && Number.isFinite(r?.y),
  );
  if (clean.length === 0) return { proportional: false, coefficient: null, ratios: [], failures: [], usable: 0 };

  const usable = clean.filter((r) => r.x !== 0);
  const ratios = clean.map((r) => (r.x === 0 ? null : roundTo(r.y / r.x, 8)));

  // Une colonne (0, y≠0) interdit la proportionnalité : rien ne multiplie 0 en y.
  const zeroBreaks = clean.some((r) => r.x === 0 && r.y !== 0);
  if (usable.length === 0 || zeroBreaks) {
    return {
      proportional: false,
      coefficient: null,
      ratios,
      failures: clean.map((_, i) => i).filter((i) => clean[i].x === 0 && clean[i].y !== 0),
      usable: usable.length,
    };
  }

  const first = usable[0];
  const failures = [];
  clean.forEach((row, index) => {
    if (row.x === 0) return;
    // Produit croisé : y1·x2 = y2·x1, exact sur des entiers.
    const left = first.y * row.x;
    const right = row.y * first.x;
    const equal = Number.isSafeInteger(left) && Number.isSafeInteger(right)
      ? left === right
      : Math.abs(left - right) <= 1e-9 * Math.max(1, Math.abs(left), Math.abs(right));
    if (!equal) failures.push(index);
  });

  const proportional = failures.length === 0;
  const coefficient = proportional ? roundTo(first.y / first.x, 8) : null;

  return {
    proportional,
    coefficient,
    // Le coefficient en FRACTION quand il tombe juste — `3/2` se lit mieux que `1,5`.
    coefficientFraction: proportional ? exactRatio(first.x, first.y) : null,
    ratios,
    failures,
    usable: usable.length,
  };
}

/** Le rapport `y/x` en fraction réduite, quand x et y sont entiers. */
function exactRatio(x, y) {
  if (!Number.isInteger(x) || !Number.isInteger(y) || x === 0) return null;
  const g = gcd(Math.abs(x), Math.abs(y)) || 1;
  const sign = x < 0 ? -1 : 1;

  return simplify(makeFrac((y / g) * sign, Math.abs(x) / g));
}

/**
 * La QUATRIÈME proportionnelle — « si 4 valent 6, combien valent 10 ? »
 * C'est le produit en croix, l'outil de §19.
 */
export function fourthProportional(a, b, c) {
  if (![a, b, c].every(Number.isFinite) || a === 0) return null;

  return roundTo((b * c) / a, 8);
}

/* ── §19 : les rapports ────────────────────────────────────────────────── */

/**
 * Un rapport `a : b` réduit, et ce que vaut chaque part quand on partage un
 * TOTAL selon ce rapport — le cœur de §19 (recettes, mélanges, échelles).
 *
 * @returns {{a, b, simplified: [number, number], total, parts: [number, number], unit} | null}
 */
export function ratioShare(a, b, total = null) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0 || a + b === 0) return null;
  const integers = Number.isInteger(a) && Number.isInteger(b);
  const g = integers ? (gcd(a, b) || 1) : 1;
  const simplified = [integers ? a / g : a, integers ? b / g : b];
  const sum = a + b;
  const unit = Number.isFinite(total) ? roundTo(total / sum, 8) : null;

  return {
    a,
    b,
    simplified,
    total,
    parts: unit === null ? null : [roundTo(a * unit, 6), roundTo(b * unit, 6)],
    unit,
    // Chaque part en fraction du tout : `2:3` → `2/5` et `3/5`.
    fractions: [makeFrac(...ratioOfNumber(a / sum)), makeFrac(...ratioOfNumber(b / sum))],
  };
}

/** Mettre un rapport à l'échelle : `2:3` avec `a = 10` donne `b = 15` (§19). */
export function scaleRatio(a, b, knownA = null, knownB = null) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || a === 0 || b === 0) return null;
  if (Number.isFinite(knownA)) return { a: knownA, b: roundTo((knownA * b) / a, 8) };
  if (Number.isFinite(knownB)) return { a: roundTo((knownB * a) / b, 8), b: knownB };

  return null;
}

/** Deux rapports sont-ils égaux ? Le produit en croix, exact (§19). */
export function ratiosEqual(a, b, c, d) {
  if (![a, b, c, d].every(Number.isFinite)) return null;
  const left = a * d;
  const right = b * c;

  return {
    equal: Number.isSafeInteger(left) && Number.isSafeInteger(right)
      ? left === right
      : Math.abs(left - right) <= 1e-9 * Math.max(1, Math.abs(left), Math.abs(right)),
    left,
    right,
  };
}

