/**
 * L'ARITHMÉTIQUE du labo des nombres — logique pure, sans React (§60).
 *
 * Divisibilité, premiers, factorisation, PGCD, PPCM. Tout y est EXACT et
 * entier : pas un `Math.sqrt` qui décide qu'un nombre est premier, pas un
 * flottant qui tranche une divisibilité.
 *
 * ── Ce que ce module rend n'est presque jamais « la réponse » ─────────────
 * §20 le dit : « instead of simply displaying divisible / not divisible,
 * show the REASON ». Un module qui rendrait `true` obligerait l'interface à
 * refaire le raisonnement pour l'expliquer — et à le refaire autrement, donc
 * un jour faux. Chaque fonction rend donc la TRACE de son calcul :
 * `divisibilityBy` rend la somme des chiffres qu'elle a formée,
 * `euclideanAlgorithm` rend chacune de ses divisions, `sieve` rend chaque
 * élimination dans l'ordre. L'écran n'a plus qu'à dessiner ce que le calcul
 * a déjà dit.
 *
 * ── Les bornes ───────────────────────────────────────────────────────────
 * MAX_EXPLORABLE (10 000 000) est le plus grand nombre que le laboratoire
 * accepte d'ANALYSER : au-delà, la factorisation par essais successifs se
 * voit à l'œil nu. MAX_GRID (10 000) borne le crible, qui dessine une case
 * par nombre. Ce sont des limites de DESSIN, pas de mathématiques — et
 * l'interface dit laquelle elle a rencontrée plutôt que de se figer.
 */

/** Le plus grand nombre qu'on accepte de factoriser / analyser. */
export const MAX_EXPLORABLE = 10_000_000;

/** Le plus grand crible qu'on accepte de dessiner (§22). */
export const MAX_GRID = 10_000;

/** Le PGCD de deux entiers, par l'algorithme d'Euclide. gcd(0, 0) = 0. */
export function gcd(a, b) {
  let x = Math.abs(Math.trunc(a)) || 0;
  let y = Math.abs(Math.trunc(b)) || 0;
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }

  return x;
}

/** Le PPCM. lcm(a, 0) = 0 — aucun multiple commun non nul. */
export function lcm(a, b) {
  const x = Math.abs(Math.trunc(a)) || 0;
  const y = Math.abs(Math.trunc(b)) || 0;
  if (x === 0 || y === 0) return 0;

  return (x / gcd(x, y)) * y;
}


/** Deux nombres sont-ils premiers entre eux ? (§29) */
export const areCoprime = (a, b) => gcd(a, b) === 1;

/**
 * Est-il premier ? Par divisions successives jusqu'à √n, en sautant les
 * multiples de 2 et de 3 — assez pour MAX_EXPLORABLE, et parfaitement exact.
 */
export function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }

  return true;
}

/**
 * La DÉCOMPOSITION en facteurs premiers : `360 → [{p: 2, e: 3}, {p: 3, e: 2}, {p: 5, e: 1}]`.
 *
 * Rend `null` au-delà de MAX_EXPLORABLE plutôt que de faire attendre l'élève
 * devant un écran figé.
 *
 * @returns {Array<{p: number, e: number}> | null}
 */
export function primeFactorization(n) {
  if (!Number.isInteger(n) || n < 2 || n > MAX_EXPLORABLE) return null;
  const out = [];
  let rest = n;
  for (let p = 2; p * p <= rest; p += (p === 2 ? 1 : 2)) {
    let e = 0;
    while (rest % p === 0) { rest /= p; e += 1; }
    if (e) out.push({ p, e });
  }
  if (rest > 1) out.push({ p: rest, e: 1 });

  return out;
}

/** `2³ × 3² × 5` en LaTeX — ce que §23 affiche au bout de l'arbre. */
export function factorizationToLatex(factors) {
  if (!Array.isArray(factors) || factors.length === 0) return '';

  return factors.map(({ p, e }) => (e === 1 ? String(p) : `${p}^{${e}}`)).join(' \\times ');
}

/** La même chose en texte nu, pour un lecteur d'écran. */
export function factorizationToText(factors) {
  if (!Array.isArray(factors) || factors.length === 0) return '';

  return factors.map(({ p, e }) => (e === 1 ? String(p) : `${p}^${e}`)).join(' × ');
}

/** Le produit d'une décomposition — la VÉRIFICATION de §24. */
export const factorizationProduct = (factors) => (Array.isArray(factors)
  ? factors.reduce((acc, { p, e }) => acc * p ** e, 1)
  : 0);

/**
 * TOUS les diviseurs, croissants. On ne balaie que jusqu'à √n et on ajoute
 * le quotient : c'est ce qui rend §25 instantané même sur 9 999 999.
 */
export function divisors(n) {
  const value = Math.abs(Math.trunc(n));
  if (!Number.isInteger(value) || value < 1 || value > MAX_EXPLORABLE) return [];
  const small = [];
  const large = [];
  for (let i = 1; i * i <= value; i += 1) {
    if (value % i === 0) {
      small.push(i);
      if (i !== value / i) large.push(value / i);
    }
  }

  return small.concat(large.reverse());
}

/**
 * Les COUPLES de facteurs : `24 → [[1,24],[2,12],[3,8],[4,6]]` (§25, §26).
 *
 * C'est la forme que §26 dessine en rectangles — d'où le couple et non la
 * liste plate : un rectangle a deux côtés.
 */
export function factorPairs(n) {
  const value = Math.abs(Math.trunc(n));
  if (!Number.isInteger(value) || value < 1 || value > MAX_EXPLORABLE) return [];
  const out = [];
  for (let i = 1; i * i <= value; i += 1) {
    if (value % i === 0) out.push([i, value / i]);
  }

  return out;
}

/** Les `count` premiers multiples de n, non nuls (§30). */
export function multiples(n, count = 12) {
  const value = Math.abs(Math.trunc(n));
  if (!value || !Number.isInteger(value)) return [];

  return Array.from({ length: Math.max(0, Math.min(200, count)) }, (_, i) => value * (i + 1));
}

/** Les diviseurs COMMUNS de deux nombres — §27 « common divisors ». */
export function commonDivisors(a, b) {
  const g = gcd(a, b);

  return g ? divisors(g) : [];
}

/* ── §20, §21 : la divisibilité et sa RAISON ───────────────────────────── */

/** Les diviseurs dont le programme donne un critère. */
export const DIVISIBILITY_RULES = Object.freeze([2, 3, 4, 5, 6, 8, 9, 10, 11, 25]);

export const digitsOf = (n) => String(Math.abs(Math.trunc(n))).split('').map(Number);
export const digitSum = (n) => digitsOf(n).reduce((a, d) => a + d, 0);

/**
 * La somme des chiffres RÉPÉTÉE jusqu'à un seul chiffre : `9999 → 36 → 9`.
 * C'est l'expérience de §21 — on voit la somme redescendre vers 3 ou 9.
 */
export function digitSumChain(n) {
  const chain = [Math.abs(Math.trunc(n))];
  while (chain[chain.length - 1] >= 10) chain.push(digitSum(chain[chain.length - 1]));

  return chain;
}

/** La somme ALTERNÉE des chiffres, de droite à gauche — le critère de 11. */
function alternatingDigitSum(n) {
  const digits = digitsOf(n).reverse();

  return digits.reduce((acc, d, i) => acc + (i % 2 === 0 ? d : -d), 0);
}

/**
 * Divisible par `by` — et POURQUOI (§20).
 *
 * `evidence` nomme le critère et porte le nombre sur lequel il porte : la
 * somme des chiffres pour 3 et 9, les deux derniers chiffres pour 4, le
 * dernier pour 2, 5 et 10. L'interface écrit la phrase ; le calcul, lui,
 * n'est fait qu'ici.
 *
 * @returns {{by: number, divisible: boolean, quotient: number, remainder: number,
 *            rule: string, evidence: number|null, evidenceText: string|null} | null}
 */
export function divisibilityBy(n, by) {
  const value = Math.trunc(n);
  if (!Number.isInteger(value) || !Number.isInteger(by) || by === 0) return null;
  const remainder = ((value % by) + Math.abs(by)) % Math.abs(by);
  const divisible = remainder === 0;
  const quotient = divisible ? value / by : Math.trunc(value / by);
  const digits = digitsOf(value);
  const lastTwo = Number(String(Math.abs(value)).slice(-2));
  const lastThree = Number(String(Math.abs(value)).slice(-3));

  let rule = 'division';
  let evidence = null;
  let evidenceText = null;
  switch (by) {
    case 2:
      rule = 'lastDigit'; evidence = digits[digits.length - 1]; evidenceText = String(evidence); break;
    case 5:
    case 10:
      rule = 'lastDigit'; evidence = digits[digits.length - 1]; evidenceText = String(evidence); break;
    case 3:
    case 9:
      rule = 'digitSum'; evidence = digitSum(value); evidenceText = digits.join(' + '); break;
    case 4:
      rule = 'lastTwo'; evidence = lastTwo; evidenceText = String(lastTwo); break;
    case 25:
      rule = 'lastTwo'; evidence = lastTwo; evidenceText = String(lastTwo); break;
    case 8:
      rule = 'lastThree'; evidence = lastThree; evidenceText = String(lastThree); break;
    case 11:
      rule = 'alternating'; evidence = alternatingDigitSum(value);
      evidenceText = digitsOf(value).reverse().map((d, i) => (i % 2 === 0 ? `+${d}` : `−${d}`)).reverse().join(' ');
      break;
    case 6:
      // 6 n'a pas de critère propre : c'est 2 ET 3, et c'est ce qu'il faut dire.
      rule = 'composite'; evidence = null; evidenceText = null; break;
    default:
      rule = 'division'; break;
  }

  return { by, divisible, quotient, remainder, rule, evidence, evidenceText };
}

/** Le tableau complet de §20 : un verdict et sa raison pour chaque critère. */
export function divisibilityTable(n, rules = DIVISIBILITY_RULES) {
  return rules.map((by) => divisibilityBy(n, by)).filter(Boolean);
}

/* ── §27, §28 : l'algorithme d'Euclide ─────────────────────────────────── */

/**
 * Les DIVISIONS successives d'Euclide (§27) :
 *
 *     84 = 36 × 2 + 12
 *     36 = 12 × 3 + 0      → PGCD = 12
 *
 * Chaque pas porte aussi `square` et `rest`, ce dont §28 a besoin pour
 * dessiner la version GÉOMÉTRIQUE : on découpe `quotient` carrés de côté
 * `divisor` dans un rectangle `dividend × divisor`, et il reste un rectangle
 * `divisor × remainder`. Le dernier carré est le PGCD.
 *
 * @returns {{steps: Array, gcd: number} | null}
 */
export function euclideanAlgorithm(a, b) {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  if (!Number.isInteger(x) || !Number.isInteger(y) || (x === 0 && y === 0)) return null;
  if (x < y) [x, y] = [y, x];

  const steps = [];
  let guard = 0;
  while (y !== 0 && guard < 200) {
    const quotient = Math.floor(x / y);
    const remainder = x % y;
    steps.push({ dividend: x, divisor: y, quotient, remainder, square: y, rest: remainder });
    x = y;
    y = remainder;
    guard += 1;
  }

  return { steps, gcd: x };
}

/**
 * Le PGCD par les FACTEURS PREMIERS (§27, « factor method ») : on garde
 * chaque premier à l'exposant le PLUS PETIT des deux, et le PPCM au plus
 * grand. Les deux décompositions et leur combinaison sont rendues, car c'est
 * la comparaison colonne par colonne qui enseigne.
 *
 * @returns {{a: Array, b: Array, gcd: Array, lcm: Array, primes: number[]} | null}
 */
export function factorMethod(a, b) {
  const fa = primeFactorization(Math.abs(Math.trunc(a)));
  const fb = primeFactorization(Math.abs(Math.trunc(b)));
  if (!fa || !fb) return null;
  const mapA = new Map(fa.map(({ p, e }) => [p, e]));
  const mapB = new Map(fb.map(({ p, e }) => [p, e]));
  const primes = [...new Set([...mapA.keys(), ...mapB.keys()])].sort((x, y) => x - y);

  return {
    a: fa,
    b: fb,
    primes,
    gcd: primes
      .map((p) => ({ p, e: Math.min(mapA.get(p) ?? 0, mapB.get(p) ?? 0) }))
      .filter(({ e }) => e > 0),
    lcm: primes.map((p) => ({ p, e: Math.max(mapA.get(p) ?? 0, mapB.get(p) ?? 0) })),
  };
}

/**
 * §31 : `PGCD(a,b) × PPCM(a,b) = a × b`, VÉRIFIÉ et non affirmé.
 *
 * On calcule les deux membres séparément et on les compare. `holds` est donc
 * une mesure, pas une citation — et si un jour elle était fausse, le
 * laboratoire le dirait.
 */
export function gcdLcmRelation(a, b) {
  const x = Math.abs(Math.trunc(a));
  const y = Math.abs(Math.trunc(b));
  if (!x || !y) return null;
  const g = gcd(x, y);
  const l = lcm(x, y);

  return { a: x, b: y, gcd: g, lcm: l, product: g * l, abProduct: x * y, holds: g * l === x * y };
}

/* ── §22 : le crible d'Ératosthène ─────────────────────────────────────── */

/**
 * Le crible, PAS À PAS (§22).
 *
 * On ne rend pas « les premiers jusqu'à n » — ce serait la réponse, et
 * l'élève doit voir l'élimination se faire. Chaque passe porte son premier et
 * les nombres qu'il raye, dans l'ordre où l'animation doit les rayer.
 *
 * @returns {{limit: number, passes: Array<{prime: number, struck: number[]}>, primes: number[]} | null}
 */
export function sievePasses(limit) {
  const n = Math.trunc(limit);
  if (!Number.isInteger(n) || n < 2 || n > MAX_GRID) return null;
  const composite = new Uint8Array(n + 1);
  const passes = [];
  for (let p = 2; p <= n; p += 1) {
    if (composite[p]) continue;
    const struck = [];
    // On part de p² : les multiples plus petits ont déjà été rayés par un
    // premier plus petit. C'est le crible tel qu'Ératosthène le fait.
    for (let m = p * p; m <= n; m += p) {
      if (!composite[m]) { composite[m] = 1; struck.push(m); }
    }
    if (struck.length || p * p <= n) passes.push({ prime: p, struck });
  }
  const primes = [];
  for (let i = 2; i <= n; i += 1) if (!composite[i]) primes.push(i);

  return { limit: n, passes, primes };
}

/** Les premiers jusqu'à `limit`, sans la trace — pour une vérification rapide. */
export function primesUpTo(limit) {
  return sievePasses(limit)?.primes ?? [];
}

/** Le premier suivant / précédent — les « nombres voisins » de §4. */
export function nextPrime(n) {
  let candidate = Math.trunc(n) + 1;
  while (candidate <= MAX_EXPLORABLE && !isPrime(candidate)) candidate += 1;

  return candidate <= MAX_EXPLORABLE ? candidate : null;
}

export function previousPrime(n) {
  let candidate = Math.trunc(n) - 1;
  while (candidate >= 2 && !isPrime(candidate)) candidate -= 1;

  return candidate >= 2 ? candidate : null;
}

/* ── §5, §6 : la valeur de position ────────────────────────────────────── */

/**
 * Les rangs d'un nombre décimal, du plus grand au plus petit.
 *
 * `power` est la puissance de dix du rang (3 pour les milliers, −2 pour les
 * centièmes) : c'est lui qui nomme la colonne, et lui qui dit à §5 combien
 * vaut une unité de ce rang.
 *
 * @returns {Array<{power: number, digit: number, value: number}>}
 */
export function placeValues(value, { minPower = null, maxPower = null } = {}) {
  if (!Number.isFinite(value)) return [];
  const negative = value < 0;
  const text = Math.abs(value).toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  const [intPart, decPart = ''] = text.split('.');
  const out = [];
  const high = maxPower ?? intPart.length - 1;
  const low = minPower ?? -decPart.length;

  for (let power = high; power >= low; power -= 1) {
    let digit = 0;
    if (power >= 0) {
      const index = intPart.length - 1 - power;
      digit = index >= 0 && index < intPart.length ? Number(intPart[index]) : 0;
    } else {
      const index = -power - 1;
      digit = index < decPart.length ? Number(decPart[index]) : 0;
    }
    out.push({ power, digit, value: digit * 10 ** power * (negative ? -1 : 1) });
  }

  return out;
}

/** `360 = 300 + 60` — la décomposition de §4, sans les rangs nuls. */
export function decomposition(value) {
  return placeValues(value).filter(({ digit }) => digit !== 0);
}

/* ── §32 : l'arrondi ───────────────────────────────────────────────────── */

/**
 * ARRONDIR à un rang, et dire POURQUOI (§32).
 *
 * Les deux voisins, le milieu, et de quel côté on tombe. L'arrondi se fait
 * sur des ENTIERS (`Math.round(value / step)` refait en multipliant par une
 * puissance de dix) pour que `2,675` à deux décimales ne devienne pas
 * `2,67` par accident de flottant.
 *
 * @returns {{value, power, lower, upper, midpoint, rounded, distanceToLower,
 *            distanceToUpper, atMidpoint, direction: 'down'|'up'} | null}
 */
export function roundingDetail(value, power) {
  if (!Number.isFinite(value) || !Number.isInteger(power)) return null;
  const step = 10 ** power;
  // On travaille en unités de `step` : scaled est le nombre de pas.
  const scaled = value / step;
  const lowerUnits = Math.floor(scaled + 1e-9);
  const lower = roundTo(lowerUnits * step, Math.max(0, -power) + 2);
  const upper = roundTo((lowerUnits + 1) * step, Math.max(0, -power) + 2);
  const midpoint = roundTo((lowerUnits + 0.5) * step, Math.max(0, -power) + 3);
  const distanceToLower = Math.abs(value - lower);
  const distanceToUpper = Math.abs(upper - value);
  const atMidpoint = Math.abs(distanceToLower - distanceToUpper) < step * 1e-9;
  // À égale distance, on monte : c'est la convention du manuel.
  const direction = atMidpoint || distanceToUpper < distanceToLower ? 'up' : 'down';

  return {
    value, power, lower, upper, midpoint, step,
    rounded: direction === 'up' ? upper : lower,
    distanceToLower, distanceToUpper, atMidpoint, direction,
  };
}

/** Un arrondi propre, sans bruit de flottant : `roundTo(1.005, 2) === 1.01`. */
export function roundTo(value, decimals = 6) {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** Math.max(0, Math.min(12, decimals));

  return Math.round((value + Number.EPSILON * Math.sign(value || 1) * Math.abs(value)) * factor) / factor;
}

/** La TRONCATURE, qui n'est pas l'arrondi — §33 les oppose. */
export function truncateTo(value, power) {
  if (!Number.isFinite(value) || !Number.isInteger(power)) return null;
  const step = 10 ** power;

  return roundTo(Math.trunc(value / step + 1e-9) * step, Math.max(0, -power) + 2);
}

/**
 * L'ERREUR d'une approximation (§33, §34).
 *
 * L'erreur RELATIVE n'existe pas quand la valeur exacte est nulle : on rend
 * `null`, jamais `Infinity` déguisé en pourcentage.
 */
export function approximationError(exact, approximation) {
  if (!Number.isFinite(exact) || !Number.isFinite(approximation)) return null;
  const absolute = Math.abs(exact - approximation);

  return {
    exact,
    approximation,
    absolute,
    relative: exact === 0 ? null : absolute / Math.abs(exact),
    signed: approximation - exact,
    over: approximation > exact,
  };
}
