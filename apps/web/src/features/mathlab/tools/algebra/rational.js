/**
 * Les RATIONNELS du مختبر الجبر — logique pure, sans React.
 *
 * Une équation scolaire se résout EXACTEMENT ou pas du tout : `x/3 = 5`
 * donne 15, `3x = 1` donne 1/3, et l'élève doit lire « ⅓ », jamais
 * « 0,3333333333333333 ». Tout le laboratoire calcule donc sur des fractions
 * d'entiers réduites, et ne repasse en flottant que pour VÉRIFIER une
 * substitution (verify.js) ou dessiner une droite graduée.
 *
 *     { n, d }   d > 0 toujours, pgcd(|n|, d) = 1, le signe est porté par n.
 *
 * Les numérateurs restent minuscules (coefficients de manuel, quelques
 * opérations) : pas de BigInt, mais un garde-fou — au-delà de LIMIT une
 * opération est refusée plutôt que de rendre un résultat faux par
 * dépassement. C'est la même discipline que l'analyseur du grapheur :
 * un code d'erreur, jamais une exception qui traverse l'interface.
 */

/** Au-delà, un produit croisé sortirait des entiers sûrs de JavaScript. */
const LIMIT = 1e12;

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }

  return x;
}

/** Une fraction réduite, dénominateur positif. Lève RangeError au-delà des entiers sûrs. */
export function makeRational(numerator, denominator = 1) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    throw new RangeError('rational');
  }
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
    return fromNumber(numerator / denominator);
  }
  if (Math.abs(numerator) > LIMIT || Math.abs(denominator) > LIMIT) throw new RangeError('overflow');
  const sign = denominator < 0 ? -1 : 1;
  const n = numerator * sign;
  const d = denominator * sign;
  const g = gcd(n, d) || 1;

  // `|| 0` : jamais de −0 (0 × −1), qui ne serait pas `equals` à un 0 stocké.
  return { n: n / g || 0, d: d / g };
}

export const ZERO = Object.freeze({ n: 0, d: 1 });
export const ONE = Object.freeze({ n: 1, d: 1 });

/**
 * Un nombre décimal → la fraction qu'il écrit. `2,5` est 5/2 — l'élève a
 * saisi un décimal, pas une approximation, et la résolution doit rester
 * exacte. Au-delà de neuf décimales on arrondit : personne n'écrit cela
 * dans un exercice de quatrième.
 */
export function fromNumber(value) {
  if (!Number.isFinite(value)) throw new RangeError('rational');
  if (Number.isInteger(value)) return makeRational(value, 1);
  const text = String(value);
  const exponent = text.includes('e') || text.includes('E') ? null : (text.split('.')[1]?.length ?? 0);
  if (exponent === null || exponent > 9) {
    const d = 1e9;

    return makeRational(Math.round(value * d), d);
  }
  const d = 10 ** exponent;

  return makeRational(Math.round(value * d), d);
}

export function isZero(r) { return r.n === 0; }
export function isNegative(r) { return r.n < 0; }
export function isInteger(r) { return r.d === 1; }
export function toNumber(r) { return r.n / r.d; }

export function add(a, b) { return makeRational(a.n * b.d + b.n * a.d, a.d * b.d); }
export function subtract(a, b) { return makeRational(a.n * b.d - b.n * a.d, a.d * b.d); }
export function multiply(a, b) { return makeRational(a.n * b.n, a.d * b.d); }

export function divide(a, b) {
  if (isZero(b)) throw new RangeError('divideByZero');

  return makeRational(a.n * b.d, a.d * b.n);
}

export function negate(r) { return { n: -r.n, d: r.d }; }
export function equals(a, b) { return a.n === b.n && a.d === b.d; }

/** Le signe : −1, 0 ou +1. Sert au sens d'une inégalité (multiplier par un négatif la retourne). */
export function sign(r) { return r.n === 0 ? 0 : (r.n < 0 ? -1 : 1); }

/**
 * Le LaTeX d'un rationnel, pour MathText : un entier tel quel, une fraction
 * en `\frac`, le signe moins DEVANT la fraction (`-\frac{1}{3}`, jamais
 * `\frac{-1}{3}`) comme l'écrit le manuel.
 */
export function toLatex(r) {
  if (r.d === 1) return String(r.n);
  const body = `\\frac{${Math.abs(r.n)}}{${r.d}}`;

  return r.n < 0 ? `-${body}` : body;
}

/**
 * Le texte d'un rationnel pour une lecture hors formule (lecteur d'écran,
 * étiquette de droite graduée) : virgule décimale et vrai signe moins comme
 * partout sur la plateforme (grapherFormat.formatValue), la fraction écrite
 * « 1/3 » quand elle ne tombe pas juste.
 */
export function toPlainText(r) {
  if (r.d === 1) return String(r.n).replace('-', '−');
  const exact = r.n / r.d;
  const rounded = Number(exact.toFixed(6));
  if (Number(rounded.toFixed(6)) === exact && String(rounded).replace('-', '').split('.')[1]?.length <= 6) {
    return String(rounded).replace('.', ',').replace('-', '−');
  }

  return `${String(r.n).replace('-', '−')}/${r.d}`;
}
