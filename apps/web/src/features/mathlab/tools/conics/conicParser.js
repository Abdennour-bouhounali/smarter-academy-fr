/**
 * L'ANALYSEUR d'équations de coniques (§30, §31, §51) — logique PURE.
 *
 * Il lit ce que l'élève écrit et en rend une conique CANONIQUE, ou une
 * erreur qui enseigne. Il ne fait rien d'autre : il n'évalue pas, il ne
 * simplifie pas symboliquement, il n'appelle jamais `eval` ni `Function`
 * (§51 — aucune entrée de l'élève n'est exécutée).
 *
 * ── Ce qu'il accepte ──────────────────────────────────────────────────────
 * Deux familles de formes, et rien entre les deux :
 *
 *   CANONIQUE     (x−2)² + (y+3)² = 16        x²/9 + y²/4 = 1
 *                 y = 2(x−1)² − 3            x = −(y+1)²
 *                 (x−1)²/9 − (y+2)²/4 = 1
 *
 *   DÉVELOPPÉE    x² + y² − 4x − 6y + 9 = 0   4x² + 9y² = 36
 *                 y = x² − 2x + 4             2x² − 3y² + 12 = 0
 *
 * ── Comment, et pourquoi ce chemin-là ────────────────────────────────────
 * Tout passe par la même route : l'équation est développée en ses SIX
 * coefficients `A x² + B xy + C y² + D x + E y + F`, puis la forme canonique
 * en est tirée par COMPLÉTION DU CARRÉ. C'est exact — pas approché — et
 * c'est la manipulation même que §30 veut enseigner. Un seul chemin signifie
 * aussi qu'une équation canonique et son développement donnent littéralement
 * la même conique, ce qu'un test vérifie.
 *
 * Le terme en `xy` (B ≠ 0) est REFUSÉ, pas ignoré : c'est une conique
 * tournée, hors du programme (§57), et la forme canonique de V1 ne sait pas
 * la porter. Mieux vaut le dire (`rotated`) que dessiner autre chose.
 *
 * ── L'analyse elle-même ──────────────────────────────────────────────────
 * Un mini-analyseur à descente récursive sur le sous-ensemble strict dont on
 * a besoin : `+ − × ÷`, les parenthèses, les puissances 1 et 2, `x`, `y` et
 * les nombres. Il n'y a NI fonction, NI variable libre, NI puissance
 * quelconque — et donc aucune surface où une entrée hostile pourrait faire
 * autre chose que produire une erreur. Chaque nœud est évalué dans l'anneau
 * des POLYNÔMES à deux variables de degré ≤ 2 (`polyMul` refuse au-delà),
 * ce qui fait du contrôle de degré une conséquence du calcul, et non un
 * test ajouté après coup.
 */

import * as C from './conicMath.js';

/** Le degré maximal admis : au-delà, ce n'est plus une conique. */
const MAX_DEGREE = 2;
/** La longueur maximale d'une saisie — une borne, pas une opinion. */
const MAX_EQUATION_LENGTH = 200;

const finite = Number.isFinite;
const { abs, sqrt } = Math;

/**
 * Le résultat de l'analyse.
 *
 * @typedef {object} ParseResult
 * @property {boolean} ok
 * @property {object} [conic]      la conique canonique, si elle existe
 * @property {object} [general]    les six coefficients développés
 * @property {string} [error]      la clé i18n de l'erreur (`errors.<code>`)
 * @property {object} [detail]     de quoi construire un message précis
 */

/**
 * ÉQUATION → CONIQUE. La porte d'entrée unique.
 *
 * @param {string} input
 * @returns {ParseResult}
 */
export function parseConicEquation(input) {
  if (typeof input !== 'string') return fail('empty');
  const text = input.trim();
  if (text.length === 0) return fail('empty');
  if (text.length > MAX_EQUATION_LENGTH) return fail('tooLong');

  const sides = text.split('=');
  if (sides.length !== 2) return fail(sides.length < 2 ? 'noEquals' : 'manyEquals');

  let left;
  let right;
  try {
    left = parsePolynomial(sides[0]);
    right = parsePolynomial(sides[1]);
  } catch (error) {
    return fail(error?.code ?? 'syntax', error?.detail);
  }

  // Tout d'un côté : `gauche − droite = 0`.
  const poly = polySub(left, right);
  const generalForm = toGeneralCoefficients(poly);
  if (!generalForm) return fail('syntax');

  const conic = generalToConic(generalForm);
  if (!conic.ok) return { ...conic, general: generalForm };

  return { ok: true, conic: conic.conic, general: generalForm, form: conic.form };
}

function fail(error, detail = null) {
  return { ok: false, error, detail };
}

/**
 * ÉQUATION → DROITE. La porte d'entrée des MUSTAQĪM (§26).
 *
 * Une droite se manipule exactement comme une conique : on tire sa poignée
 * et l'équation suit, on écrit `y = 2x − 1` et la droite se place. Il aurait
 * été facile d'écrire un second analyseur pour `y = mx + p` ; ç'aurait été
 * une faute. Le front de `parseConicEquation` réduit DÉJÀ n'importe quelle
 * saisie à ses six coefficients, et une droite est simplement le cas
 * `A = B = C = 0`. On réutilise donc le même analyseur, la même
 * multiplication implicite, les mêmes refus, la même sécurité (§51) — et une
 * amélioration de l'un profite à l'autre pour toujours.
 *
 *     Dx + Ey + F = 0   →   E ≠ 0 : y = −(D/E)x − F/E
 *                            E = 0 : x = −F/D   (verticale)
 *
 * @param {string} input
 * @returns {{ok: boolean, line?: object, error?: string}}
 */
export function parseLineEquation(input) {
  if (typeof input !== 'string') return fail('empty');
  const text = input.trim();
  if (text.length === 0) return fail('empty');
  if (text.length > MAX_EQUATION_LENGTH) return fail('tooLong');

  const sides = text.split('=');
  if (sides.length !== 2) return fail(sides.length < 2 ? 'noEquals' : 'manyEquals');

  let poly;
  try {
    poly = polySub(parsePolynomial(sides[0]), parsePolynomial(sides[1]));
  } catch (error) {
    return fail(error?.code ?? 'syntax', error?.detail);
  }

  const general = toGeneralCoefficients(poly);
  if (!general) return fail('syntax');

  const { A, B, C: Cc, D, E, F } = general;

  // Un carré ou un terme croisé : c'est une conique, pas une droite. On le
  // DIT — l'élève s'est trompé de champ, ce n'est pas une erreur de syntaxe.
  if (abs(A) > 1e-12 || abs(B) > 1e-12 || abs(Cc) > 1e-12) return fail('notALine');

  const hasX = abs(D) > 1e-12;
  const hasY = abs(E) > 1e-12;
  if (!hasX && !hasY) return fail('notEquation');

  if (!hasY) {
    return { ok: true, line: { vertical: true, x: C.cleanNumber(-F / D) } };
  }

  return {
    ok: true,
    line: {
      vertical: false,
      slope: C.cleanNumber(-D / E),
      intercept: C.cleanNumber(-F / E),
    },
  };
}

// ── Les polynômes à deux variables, degré ≤ 2 ────────────────────────────

/**
 * Un polynôme est une CARTE de monômes : `{'x2': 3, 'xy': 0, 'y': −4, '1': 7}`.
 *
 * Six clés possibles, pas une de plus — et `polyMul` lève dès qu'un produit
 * en demanderait une septième. Le degré est donc borné par CONSTRUCTION.
 */
const MONOMIALS = Object.freeze(['x2', 'xy', 'y2', 'x', 'y', '1']);

function zeroPoly() {
  return {
    x2: 0, xy: 0, y2: 0, x: 0, y: 0, 1: 0,
  };
}

function constPoly(value) {
  const p = zeroPoly();
  p['1'] = value;

  return p;
}

function varPoly(name) {
  const p = zeroPoly();
  p[name] = 1;

  return p;
}

function polyAdd(a, b) {
  const out = zeroPoly();
  for (const key of MONOMIALS) out[key] = a[key] + b[key];

  return out;
}

function polySub(a, b) {
  const out = zeroPoly();
  for (const key of MONOMIALS) out[key] = a[key] - b[key];

  return out;
}

function polyNeg(a) {
  const out = zeroPoly();
  for (const key of MONOMIALS) out[key] = -a[key];

  return out;
}

/** Le degré d'un monôme, pour que la multiplication sache refuser. */
const DEGREE = Object.freeze({
  x2: 2, xy: 2, y2: 2, x: 1, y: 1, 1: 0,
});

/** Le produit de deux monômes, ou `null` quand il sort du degré 2. */
const PRODUCT = Object.freeze({
  '1|1': '1', '1|x': 'x', '1|y': 'y', '1|x2': 'x2', '1|xy': 'xy', '1|y2': 'y2',
  'x|x': 'x2', 'x|y': 'xy', 'y|y': 'y2',
});

function monomialProduct(a, b) {
  if (DEGREE[a] + DEGREE[b] > MAX_DEGREE) return null;

  return PRODUCT[`${a}|${b}`] ?? PRODUCT[`${b}|${a}`] ?? null;
}

function polyMul(a, b) {
  const out = zeroPoly();
  for (const ka of MONOMIALS) {
    if (a[ka] === 0) continue;
    for (const kb of MONOMIALS) {
      if (b[kb] === 0) continue;
      const key = monomialProduct(ka, kb);
      if (!key) throw parseError('degree');
      out[key] += a[ka] * b[kb];
    }
  }

  return out;
}

/** La division par un SCALAIRE seulement : `x²/9` oui, `1/x` jamais. */
function polyDiv(a, b) {
  if (!isConstant(b)) throw parseError('divideByVariable');
  const value = b['1'];
  if (abs(value) < 1e-12) throw parseError('divideByZero');
  const out = zeroPoly();
  for (const key of MONOMIALS) out[key] = a[key] / value;

  return out;
}

function isConstant(p) {
  return MONOMIALS.every((key) => key === '1' || p[key] === 0);
}

/** La puissance : 0, 1 ou 2, et uniquement par un exposant CONSTANT entier. */
function polyPow(base, exponentPoly) {
  if (!isConstant(exponentPoly)) throw parseError('exponent');
  const exponent = exponentPoly['1'];
  if (!Number.isInteger(exponent) || exponent < 0 || exponent > MAX_DEGREE) throw parseError('exponent');
  if (exponent === 0) return constPoly(1);
  if (exponent === 1) return base;

  return polyMul(base, base);
}

function parseError(code, detail = null) {
  const error = new Error(code);
  error.code = code;
  error.detail = detail;

  return error;
}

// ── L'analyseur à descente récursive ─────────────────────────────────────

/**
 * Le TOKENISEUR — il connaît six sortes de lexèmes et rien d'autre.
 *
 * La virgule décimale est acceptée (`2,5`) : l'élève écrit comme il lit
 * (FRENCH_LANGUAGE_CONTRACT §5), et le point l'est aussi.
 */
function tokenize(source) {
  const tokens = [];
  const text = source
    .replace(/[−–—]/g, '-') // le vrai signe moins typographique
    .replace(/[×·]/g, '*')
    .replace(/[÷]/g, '/')
    .replace(/[\u066B]/g, ',') // la virgule décimale arabe
    .replace(/²/g, '^2')
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660)); // chiffres arabo-hindis
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === ' ' || ch === '\t') { i += 1; continue; }
    if (ch >= '0' && ch <= '9') {
      let j = i;
      while (j < text.length && ((text[j] >= '0' && text[j] <= '9') || text[j] === '.' || text[j] === ',')) j += 1;
      const raw = text.slice(i, j).replace(',', '.');
      const value = Number(raw);
      if (!finite(value)) throw parseError('number', raw);
      tokens.push({ type: 'number', value });
      i = j;
      continue;
    }
    if (ch === 'x' || ch === 'X') { tokens.push({ type: 'var', value: 'x' }); i += 1; continue; }
    if (ch === 'y' || ch === 'Y') { tokens.push({ type: 'var', value: 'y' }); i += 1; continue; }
    if ('+-*/^()'.includes(ch)) { tokens.push({ type: ch }); i += 1; continue; }

    throw parseError('character', ch);
  }

  return tokens;
}

/**
 * `expression → terme (('+' | '−') terme)*`
 * `terme      → facteur (('*' | '/') facteur)*`
 * `facteur    → ('−')* puissance`
 * `puissance  → primaire ('^' facteur)?`
 * `primaire   → nombre | 'x' | 'y' | '(' expression ')'`
 *
 * La MULTIPLICATION IMPLICITE est reconnue là où le manuel l'écrit : `2x`,
 * `3(x−1)`, `(x−1)(x+2)`, `2x²`. Sans elle l'élève devrait écrire `2*x`, ce
 * qu'aucun manuel ne fait.
 */
function parsePolynomial(source) {
  const tokens = tokenize(source);
  if (tokens.length === 0) throw parseError('empty');
  let position = 0;

  const peek = () => tokens[position];
  const eat = (type) => {
    if (tokens[position]?.type === type) { position += 1; return true; }

    return false;
  };

  function expression() {
    let value = term();
    for (;;) {
      if (eat('+')) value = polyAdd(value, term());
      else if (eat('-')) value = polySub(value, term());
      else return value;
    }
  }

  function term() {
    let value = factor();
    for (;;) {
      if (eat('*')) value = polyMul(value, factor());
      else if (eat('/')) value = polyDiv(value, factor());
      else if (startsImplicitProduct()) value = polyMul(value, factor());
      else return value;
    }
  }

  /**
   * Un produit implicite commence là où un nombre, une variable ou une
   * parenthèse ouvrante SUIT une valeur déjà lue. `x2` n'en est pas un
   * (le tokeniseur ne produit pas ce cas) ; `2x`, `(x+1)(x−1)` et `3(y)` en
   * sont.
   */
  function startsImplicitProduct() {
    const next = peek();

    return next?.type === 'number' || next?.type === 'var' || next?.type === '(';
  }

  function factor() {
    if (eat('-')) return polyNeg(factor());
    if (eat('+')) return factor();

    return power();
  }

  function power() {
    const base = primary();
    if (eat('^')) return polyPow(base, factor());

    return base;
  }

  function primary() {
    const token = peek();
    if (!token) throw parseError('unexpectedEnd');
    if (token.type === 'number') { position += 1; return constPoly(token.value); }
    if (token.type === 'var') { position += 1; return varPoly(token.value); }
    if (token.type === '(') {
      position += 1;
      const inner = expression();
      if (!eat(')')) throw parseError('unclosed');

      return inner;
    }
    throw parseError('syntax');
  }

  const result = expression();
  if (position !== tokens.length) throw parseError('syntax');

  return result;
}

/** Le polynôme → les six coefficients, nettoyés du bruit de virgule flottante. */
function toGeneralCoefficients(poly) {
  const out = {
    A: C.cleanNumber(poly.x2),
    B: C.cleanNumber(poly.xy),
    C: C.cleanNumber(poly.y2),
    D: C.cleanNumber(poly.x),
    E: C.cleanNumber(poly.y),
    F: C.cleanNumber(poly['1']),
  };

  return Object.values(out).every(finite) ? out : null;
}

// ── LA COMPLÉTION DU CARRÉ : développée → canonique (§30) ────────────────

/**
 * Les six coefficients → la conique canonique.
 *
 * C'est §30 tout entier, et c'est fait exactement :
 *
 *     Ax² + Cy² + Dx + Ey + F = 0
 *     A(x + D/2A)² + C(y + E/2C)² = D²/4A + E²/4C − F
 *
 * puis la nature se lit sur les SIGNES de A et C :
 *
 *     A = C  et même signe      → cercle
 *     A, C même signe, A ≠ C    → ellipse
 *     A, C de signes opposés    → hyperbole
 *     A ou C nul (pas les deux) → parabole
 *
 * Chaque cas dégénéré est NOMMÉ plutôt que rendu faux : `pointCircle`
 * (rayon nul), `emptySet` (rayon imaginaire), `crossingLines` (hyperbole
 * dégénérée), `line` (les deux carrés absents). Un élève qui écrit
 * `x² + y² = −4` mérite d'apprendre qu'aucun point ne convient, pas de lire
 * « erreur de syntaxe ».
 */
export function generalToConic(general) {
  if (!general) return fail('syntax');
  const {
    A, B, C: Cc, D, E, F,
  } = general;

  // Le terme en xy : une conique TOURNÉE, hors de V1 (§57).
  if (abs(B) > 1e-9) return fail('rotated');

  const hasX2 = abs(A) > 1e-12;
  const hasY2 = abs(Cc) > 1e-12;

  // ── Aucun carré : une droite, pas une conique ─────────────────────────
  if (!hasX2 && !hasY2) {
    return fail(abs(D) > 1e-12 || abs(E) > 1e-12 ? 'line' : 'notEquation');
  }

  // ── Un seul carré : PARABOLE ──────────────────────────────────────────
  if (hasX2 !== hasY2) {
    return parabolaFromGeneral(general, hasX2);
  }

  // ── Deux carrés : cercle, ellipse ou hyperbole ────────────────────────
  const h = -D / (2 * A);
  const k = -E / (2 * Cc);
  // La constante après complétion : A·h² + C·k² − F
  const constant = A * h * h + Cc * k * k - F;
  const sameSign = A * Cc > 0;

  if (sameSign) {
    // Le signe de la constante décide de l'existence.
    if (abs(constant) <= 1e-12 * Math.max(1, abs(A), abs(Cc))) {
      return fail('pointCircle', { h: C.cleanNumber(h), k: C.cleanNumber(k) });
    }
    if (constant / A < 0) return fail('emptySet');

    const aSq = constant / A;
    const bSq = constant / Cc;
    if (!(aSq > 0) || !(bSq > 0)) return fail('emptySet');
    const semiX = sqrt(aSq);
    const semiY = sqrt(bSq);

    if (C.nearlyEqual(semiX, semiY, 1e-9)) {
      return {
        ok: true,
        form: 'circle',
        conic: {
          kind: 'circle', h: C.cleanNumber(h), k: C.cleanNumber(k), r: C.cleanNumber(semiX),
        },
      };
    }

    return {
      ok: true,
      form: 'ellipse',
      conic: {
        kind: 'ellipse', h: C.cleanNumber(h), k: C.cleanNumber(k), a: C.cleanNumber(semiX), b: C.cleanNumber(semiY),
      },
    };
  }

  // ── Signes opposés : HYPERBOLE ────────────────────────────────────────
  if (abs(constant) <= 1e-12 * Math.max(1, abs(A), abs(Cc))) {
    return fail('crossingLines', { h: C.cleanNumber(h), k: C.cleanNumber(k) });
  }

  // La branche « positive » est celle dont le coefficient a le signe de la constante.
  const xPositive = constant / A > 0;
  const aSq = xPositive ? constant / A : constant / Cc;
  const bSq = xPositive ? -(constant / Cc) : -(constant / A);
  if (!(aSq > 0) || !(bSq > 0)) return fail('emptySet');

  return {
    ok: true,
    form: 'hyperbola',
    conic: {
      kind: 'hyperbola',
      h: C.cleanNumber(h),
      k: C.cleanNumber(k),
      a: C.cleanNumber(sqrt(aSq)),
      b: C.cleanNumber(sqrt(bSq)),
      orientation: xPositive ? 'horizontal' : 'vertical',
    },
  };
}

/**
 * Le cas d'un seul carré : `y = a(x−h)² + k` ou `x = a(y−k)² + h`.
 *
 * Il faut que le terme du PREMIER degré de l'autre variable soit présent :
 * `x² − 4 = 0` n'est pas une parabole mais deux droites verticales, et le
 * dire vaut mieux que dessiner une parabole absente.
 */
function parabolaFromGeneral(general, squaredIsX) {
  const {
    A, C: Cc, D, E, F,
  } = general;
  if (squaredIsX) {
    // A x² + D x + E y + F = 0  →  y = −(A x² + D x + F)/E
    if (abs(E) <= 1e-12) return fail('parallelLines');
    const a = -A / E;
    const h = -D / (2 * A);
    // k = valeur de y au sommet
    const k = -(A * h * h + D * h + F) / E;

    return {
      ok: true,
      form: 'parabola',
      conic: {
        kind: 'parabola', orientation: 'horizontal', h: C.cleanNumber(h), k: C.cleanNumber(k), a: C.cleanNumber(a),
      },
    };
  }

  // C y² + E y + D x + F = 0  →  x = −(C y² + E y + F)/D
  if (abs(D) <= 1e-12) return fail('parallelLines');
  const a = -Cc / D;
  const k = -E / (2 * Cc);
  const h = -(Cc * k * k + E * k + F) / D;

  return {
    ok: true,
    form: 'parabola',
    conic: {
      kind: 'parabola', orientation: 'vertical', h: C.cleanNumber(h), k: C.cleanNumber(k), a: C.cleanNumber(a),
    },
  };
}

// ── CONIQUE → TEXTE (§7, §30) ────────────────────────────────────────────

/**
 * La conique ÉCRITE en forme canonique — la chaîne que l'élève voit et peut
 * réécrire. Elle est volontairement la MÊME que ce que l'analyseur relit :
 * ce que le laboratoire affiche, l'élève peut le copier, le modifier et le
 * rendre. Un test vérifie cet aller-retour.
 */
export function formatCanonical(conic) {
  if (!C.isValidConic(conic)) return '';
  const { h, k } = conic;
  const X = shift('x', h);
  const Y = shift('y', k);
  switch (conic.kind) {
    case 'circle':
      return `${X}² + ${Y}² = ${num(conic.r * conic.r)}`;
    case 'ellipse':
      return `${X}²/${num(conic.a * conic.a)} + ${Y}²/${num(conic.b * conic.b)} = 1`;
    case 'hyperbola': {
      const horizontal = C.orientationOf(conic) === 'horizontal';
      const first = horizontal ? `${X}²/${num(conic.a * conic.a)}` : `${Y}²/${num(conic.a * conic.a)}`;
      const second = horizontal ? `${Y}²/${num(conic.b * conic.b)}` : `${X}²/${num(conic.b * conic.b)}`;

      return `${first} − ${second} = 1`;
    }
    case 'parabola': {
      const vertical = C.orientationOf(conic) === 'vertical';
      const coefficient = coefficientPrefix(conic.a);
      if (vertical) return `x = ${coefficient}${Y}²${offset(h)}`;

      return `y = ${coefficient}${X}²${offset(k)}`;
    }
    default:
      return '';
  }
}

/**
 * La DROITE écrite comme au tableau : `y = 2x − 1`, `y = −x`, `y = 3`,
 * `x = 2` pour une verticale.
 *
 * Comme `formatCanonical`, ce qui est écrit ici doit pouvoir être relu par
 * `parseLineEquation` — un test tient cet aller-retour.
 */
export function formatLine(line) {
  if (!line) return '';
  if (line.vertical) return `x = ${num(line.x)}`;
  const m = C.cleanNumber(line.slope);
  const p = C.cleanNumber(line.intercept);
  if (abs(m) < 1e-12) return `y = ${num(p)}`;
  const slopePart = C.nearlyEqual(m, 1, 1e-12) ? 'x'
    : C.nearlyEqual(m, -1, 1e-12) ? '−x'
      : `${num(m)}x`;
  if (abs(p) < 1e-12) return `y = ${slopePart}`;

  return `y = ${slopePart} ${p > 0 ? '+' : '−'} ${num(abs(p))}`;
}

/** La conique ÉCRITE en forme développée — l'autre face de §30. */
export function formatGeneral(conic) {
  const g = C.toGeneral(conic);
  if (!g) return '';
  const parts = [];
  pushTerm(parts, g.A, 'x²');
  pushTerm(parts, g.C, 'y²');
  pushTerm(parts, g.D, 'x');
  pushTerm(parts, g.E, 'y');
  pushTerm(parts, g.F, '');
  if (parts.length === 0) return '0 = 0';

  return `${parts.join(' ').replace(/^\+\s*/, '')} = 0`;
}

function pushTerm(parts, coefficient, symbol) {
  const value = C.cleanNumber(coefficient);
  if (abs(value) < 1e-12) return;
  const sign = value < 0 ? '−' : '+';
  const magnitude = abs(value);
  const shown = symbol && C.nearlyEqual(magnitude, 1, 1e-12) ? '' : num(magnitude);
  parts.push(sign, `${shown}${symbol}`);
}

/** `(x − 2)`, `(x + 3)`, `x` quand le décalage est nul. */
function shift(variable, value) {
  const v = C.cleanNumber(value);
  if (abs(v) < 1e-12) return variable;

  return `(${variable} ${v > 0 ? '−' : '+'} ${num(abs(v))})`;
}

/** ` + 4`, ` − 3`, rien du tout quand c'est zéro. */
function offset(value) {
  const v = C.cleanNumber(value);
  if (abs(v) < 1e-12) return '';

  return ` ${v > 0 ? '+' : '−'} ${num(abs(v))}`;
}

/** `2`, `−`, `` — le coefficient devant une parenthèse, comme au tableau. */
function coefficientPrefix(a) {
  const v = C.cleanNumber(a);
  if (C.nearlyEqual(v, 1, 1e-12)) return '';
  if (C.nearlyEqual(v, -1, 1e-12)) return '−';

  return num(v);
}

/**
 * Un nombre pour une ÉQUATION : virgule décimale, vrai signe moins, et
 * jamais de zéros parasites. Le même esprit que `grapherFormat.formatValue`,
 * mais sans arrondi fixe — une équation ne doit pas mentir sur `1/3`.
 */
function num(value) {
  const v = C.cleanNumber(value);
  if (!finite(v)) return '—';
  const rounded = Number(v.toFixed(4));
  const text = abs(rounded) < 1e-12 ? '0' : String(rounded);

  return text.replace('.', ',').replace('-', '−');
}
