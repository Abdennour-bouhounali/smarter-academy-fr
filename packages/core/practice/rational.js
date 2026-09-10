/**
 * Arithmétique rationnelle EXACTE, et lecture d'une saisie élève française.
 *
 * Pourquoi ce module existe alors que `parseDec` existe déjà : `parseDec`
 * (numberFormat.js) teste `/^-?(\d+\.?\d*|\.\d+)$/` — il n'accepte que le
 * trait d'union U+002D. Or `formatDec`, `affineText` et MathLive ÉCRIVENT le
 * vrai moins typographique U+2212. Une valeur que l'interface affiche peut
 * donc échouer à se relire. Ce module normalise U+2212 (et les tirets demi- et
 * cadratin) avant toute analyse.
 *
 * Et surtout : il ne rend JAMAIS un flottant au moment de comparer. Une
 * réponse d'élève est juste ou fausse, pas « juste à 1e-9 près » — `0,1 + 0,2`
 * doit valoir `0,3`, ce que seule une fraction exacte garantit. La règle du
 * module : `Math.abs(a - b) < epsilon` est INTERDIT dans le chemin de
 * comparaison ; `toNumber()` n'existe que pour l'affichage.
 */

/** Au-delà, un produit en croix risque de dépasser Number.MAX_SAFE_INTEGER. */
const MAX_SAFE_COMPONENT = 94_906_265; // ⌊√(2^53 − 1)⌋

const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

/**
 * Normalise une saisie avant analyse : les quatre tirets Unicode deviennent le
 * trait d'union ASCII, les trois espaces (dont l'espace fine insécable que
 * `fr-FR` insère dans « 1 250 ») disparaissent, la virgule décimale devient un
 * point, et les enrobages LaTeX de MathLive sont retirés.
 */
export function normalizeNumeric(raw) {
  return String(raw)
    .replace(/[−‒–—―]/g, '-')
    .replace(/[\s   ]/g, '')
    .replace(/\\left|\\right|\\,|\;|\\!|\\ /g, '')
    .replace(/^\$|\$$/g, '')
    .replace(/,/g, '.');
}

export class Rational {
  /** Toujours construit via les fabriques : d > 0 et pgcd(|n|, d) = 1. */
  constructor(n, d) {
    this.n = n;
    this.d = d;
    Object.freeze(this);
  }

  /** Réduit et normalise le signe (porté par le numérateur). @returns {Rational|null} */
  static of(n, d = 1) {
    if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) return null;
    if (Math.abs(n) > MAX_SAFE_COMPONENT || Math.abs(d) > MAX_SAFE_COMPONENT) return null;
    const sign = d < 0 ? -1 : 1;
    const g = gcd(n, d);
    return new Rational((sign * n) / g, (sign * d) / g);
  }

  /**
   * Lit une réponse d'élève. Renvoie `null` pour TOUTE saisie non analysable —
   * l'appelant en fait une issue `syntax_error`, jamais un `incorrect` : ne pas
   * savoir écrire un nombre n'est pas la même erreur que se tromper de nombre.
   *
   * Formes acceptées : entier, décimal (virgule ou point), fraction `a/b`,
   * `\frac{a}{b}`, pourcentage `n%`. Un `+` de tête est accepté : découper une
   * expression en termes signés produit « +2x », dont le coefficient est « +2 ».
   *
   * @param {string|number|null|undefined} raw
   * @returns {Rational|null}
   */
  static parse(raw) {
    if (raw === null || raw === undefined) return null;
    if (typeof raw === 'number') {
      return Number.isFinite(raw) ? Rational.fromNumber(raw) : null;
    }
    if (typeof raw !== 'string') return null;

    let s = normalizeNumeric(raw);
    if (s === '') return null;

    // \frac{a}{b} — MathLive peut l'émettre.
    const frac = s.match(/^\\frac\{([+-]?\d+)\}\{([+-]?\d+)\}$/);
    if (frac) return Rational.of(Number(frac[1]), Number(frac[2]));

    // Pourcentage : 50% → 1/2.
    if (s.endsWith('%')) {
      const inner = Rational.parse(s.slice(0, -1));
      return inner ? Rational.of(inner.n, inner.d * 100) : null;
    }

    // Fraction a/b.
    const ratio = s.match(/^([+-]?\d+)\/([+-]?\d+)$/);
    if (ratio) return Rational.of(Number(ratio[1]), Number(ratio[2]));

    // Décimal ou entier — converti EXACTEMENT, sans passer par un flottant.
    const dec = s.match(/^([+-]?)(\d*)(?:\.(\d+))?$/);
    if (!dec) return null;
    const [, sign, whole, frth] = dec;
    if (whole === '' && (frth === undefined || frth === '')) return null;
    if (frth === undefined) return Rational.of(Number(`${sign}${whole}`), 1);
    if (frth.length > 12) return null; // au-delà, ce n'est plus une réponse d'élève
    const scale = 10 ** frth.length;
    return Rational.of(Number(`${sign}${whole || '0'}${frth}`), scale);
  }

  /** Conversion depuis un nombre JS, pour les valeurs calculées par affineUtils. */
  static fromNumber(x) {
    if (!Number.isFinite(x)) return null;
    if (Number.isInteger(x)) return Rational.of(x, 1);
    // 12 décimales : au-delà on est dans le bruit de représentation binaire.
    const s = x.toFixed(12).replace(/0+$/, '').replace(/\.$/, '');
    return Rational.parse(s);
  }

  equals(other) {
    return other instanceof Rational && this.n === other.n && this.d === other.d;
  }

  /** −1, 0 ou 1. Produit en croix : exact, jamais de flottant. */
  compare(other) {
    const left = this.n * other.d;
    const right = other.n * this.d;
    return left < right ? -1 : left > right ? 1 : 0;
  }

  add(other) { return Rational.of(this.n * other.d + other.n * this.d, this.d * other.d); }
  subtract(other) { return Rational.of(this.n * other.d - other.n * this.d, this.d * other.d); }
  abs() { return Rational.of(Math.abs(this.n), this.d); }
  isZero() { return this.n === 0; }
  get sign() { return Math.sign(this.n); }

  /** Affichage SEULEMENT. Ne jamais comparer sur cette valeur. */
  toNumber() { return this.n / this.d; }

  /** Forme canonique stable, pour `normalized_answer` et les traces d'audit. */
  toString() { return this.d === 1 ? String(this.n) : `${this.n}/${this.d}`; }
}

/**
 * Égalité de deux réponses, à une tolérance rationnelle près (`null` = exact).
 * @param {Rational} a @param {Rational} b @param {Rational|null} tolerance
 */
export function rationalEquals(a, b, tolerance = null) {
  if (!a || !b) return false;
  if (tolerance === null) return a.equals(b);
  const diff = a.subtract(b);
  return diff !== null && diff.abs().compare(tolerance) <= 0;
}
