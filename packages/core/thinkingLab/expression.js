/**
 * « مختبر التفكير » — lecture et équivalence d'EXPRESSIONS (check `expression`).
 *
 * Un analyseur à descente récursive écrit DEUX fois avec la même grammaire :
 * ici, et dans apps/api/app/Domain/ThinkingLab/ExpressionEvaluator.php. Les
 * deux consomment la même fixture content/thinking-lab/_fixtures/expressions.json
 * (Vitest et PHPUnit) : ils ne peuvent pas dériver. Jamais d'`eval`, jamais de
 * moteur symbolique : la NOTE est donnée par le serveur (PHP), ce fichier sert
 * au validateur de contenu, à l'oracle et à l'affichage.
 *
 * Grammaire (docs/architecture/THINKING_LAB.md §4) :
 *   expr    := term (('+' | '-') term)*
 *   term    := unary (('*' | '/') unary | <produit implicite> power)*
 *   unary   := ('-' | '+') unary | power
 *   power   := primary ('^' unary)?            -x^2 = -(x^2) ; 2^-1 permis ; associatif à droite
 *   primary := nombre | constante | variable | '(' expr ')' | '|' expr '|'
 *            | fonction '(' expr ')' | fonction unary   (√3x = √(3)·x ; sin x^2 = sin(x^2))
 * Le produit implicite a la priorité du produit écrit, de gauche à droite :
 * « 1/2x » se lit (1/2)·x.
 *
 * Équivalence : les deux expressions sont évaluées en `samples` points tirés
 * par un générateur congruentiel de Park–Miller (entiers exacts dans les deux
 * langages), dans le domaine déclaré. Refus si une valeur est indéfinie là où
 * l'autre est définie.
 */

/** Longueur maximale d'une saisie (caractères, après normalisation). */
export const MAX_LENGTH = 300;
/** Profondeur maximale de l'arbre (protection de la pile). */
export const MAX_DEPTH = 60;

export const FUNCTIONS = Object.freeze(['sqrt', 'sin', 'cos', 'tan', 'ln', 'exp', 'abs']);
const CONSTANTS = Object.freeze({ pi: Math.PI, e: Math.E });
/** Mots reconnus, du plus long au plus court (« exp » avant « e »). */
const WORDS = ['sqrt', 'sin', 'cos', 'tan', 'exp', 'abs', 'ln', 'pi'];

export const DEFAULT_DOMAIN = Object.freeze({ min: -4, max: 4 });
export const DEFAULTS = Object.freeze({ samples: 6, relTol: 1e-6, absTol: 1e-9, seed: 20261030 });

/** Codes d'erreur partagés avec le PHP (la fixture les compare). */
export const ERRORS = Object.freeze({
  EMPTY: 'empty',
  TOO_LONG: 'too_long',
  UNKNOWN_SYMBOL: 'unknown_symbol',
  BAD_NUMBER: 'bad_number',
  UNEXPECTED: 'unexpected_token',
  UNBALANCED: 'unbalanced',
  TOO_DEEP: 'too_deep',
});

class ParseError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

const SUPERSCRIPTS = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };

/**
 * Ramène une saisie (clavier arabe, MathLive ascii-math, Unicode) à l'alphabet
 * de la grammaire. Même suite de remplacements dans le PHP.
 */
export function normalizeInput(raw) {
  let s = String(raw ?? '')
    .replace(/[٠-٩]/g, (ch) => String(ch.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (ch) => String(ch.charCodeAt(0) - 0x06f0))
    .replace(/[\s   ]/g, '')
    .replace(/\\left|\\right|\\,|\\!/g, '')
    .replace(/\\cdot|\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\(sqrt|pi|sin|cos|tan|ln|exp)/g, '$1')
    .replace(/٫/g, '.')
    // MathLive écrit « ÷ » en ascii-math « -: » : à lire AVANT les tirets.
    .replace(/-:/g, '/')
    .replace(/[−‒–—―]/g, '-')
    .replace(/[×·⋅∙]/g, '*')
    .replace(/[÷∕]/g, '/')
    .replace(/\*\*/g, '^')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/[{[]/g, '(')
    .replace(/[}\]]/g, ')')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => `^${[...m].map((c) => SUPERSCRIPTS[c]).join('')}`);
  // Virgule décimale (« 1,5 ») : seulement entre deux chiffres.
  s = s.replace(/(\d),(?=\d)/g, '$1.');
  return s;
}

/** Forme canonique d'un littéral : « 01.50 » → « 1.5 », « .5 » → « 0.5 », « 3. » → « 3 ». */
function canonicalLiteral(text) {
  let [int, frac = ''] = text.split('.');
  int = int.replace(/^0+(?=\d)/, '');
  if (int === '') int = '0';
  frac = frac.replace(/0+$/, '');
  return frac === '' ? int : `${int}.${frac}`;
}

function tokenize(s, vars) {
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const text = s.slice(i, j);
      if ((text.match(/\./g) ?? []).length > 1 || text === '.') throw new ParseError(ERRORS.BAD_NUMBER);
      tokens.push({ t: 'num', v: canonicalLiteral(text) });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      const word = WORDS.find((w) => s.startsWith(w, i));
      if (word) {
        tokens.push(FUNCTIONS.includes(word) ? { t: 'fn', v: word } : { t: 'const', v: word });
        i += word.length;
        continue;
      }
      if (vars.includes(c)) tokens.push({ t: 'var', v: c });
      else if (c === 'e') tokens.push({ t: 'const', v: 'e' });
      else throw new ParseError(ERRORS.UNKNOWN_SYMBOL);
      i++;
      continue;
    }
    if ('+-*/^()|'.includes(c)) {
      tokens.push({ t: 'op', v: c });
      i++;
      continue;
    }
    throw new ParseError(ERRORS.UNKNOWN_SYMBOL);
  }
  return tokens;
}

function parseTokens(tokens) {
  let pos = 0;
  let depth = 0;
  let absDepth = 0;
  const peek = () => tokens[pos];
  const isOp = (tok, v) => tok?.t === 'op' && tok.v === v;
  const enter = () => {
    depth++;
    if (depth > MAX_DEPTH) throw new ParseError(ERRORS.TOO_DEEP);
  };
  const leave = () => {
    depth--;
  };

  /** Un jeton qui OUVRE un opérande (déclenche le produit implicite). */
  const startsOperand = (tok) => {
    if (!tok) return false;
    if (tok.t !== 'op') return true;
    if (tok.v === '(') return true;
    if (tok.v === '|') return absDepth === 0;
    return false;
  };

  function expr() {
    enter();
    let node = term();
    while (isOp(peek(), '+') || isOp(peek(), '-')) {
      const op = tokens[pos++].v;
      node = { t: 'bin', op, a: node, b: term() };
    }
    leave();
    return node;
  }

  function term() {
    enter();
    let node = unary();
    for (;;) {
      const tok = peek();
      if (isOp(tok, '*') || isOp(tok, '/')) {
        pos++;
        node = { t: 'bin', op: tok.v, a: node, b: unary() };
      } else if (startsOperand(tok)) {
        node = { t: 'bin', op: '*', a: node, b: power() };
      } else break;
    }
    leave();
    return node;
  }

  function unary() {
    enter();
    let node;
    if (isOp(peek(), '-')) {
      pos++;
      node = { t: 'neg', a: unary() };
    } else if (isOp(peek(), '+')) {
      pos++;
      node = unary();
    } else node = power();
    leave();
    return node;
  }

  function power() {
    enter();
    let node = primary();
    if (isOp(peek(), '^')) {
      pos++;
      node = { t: 'bin', op: '^', a: node, b: unary() };
    }
    leave();
    return node;
  }

  function primary() {
    enter();
    const tok = tokens[pos++];
    let node;
    if (!tok) throw new ParseError(ERRORS.UNEXPECTED);
    if (tok.t === 'num') node = { t: 'num', v: tok.v };
    else if (tok.t === 'const') node = { t: 'const', v: tok.v };
    else if (tok.t === 'var') node = { t: 'var', v: tok.v };
    else if (tok.t === 'fn') {
      if (isOp(peek(), '(')) {
        pos++;
        const inner = expr();
        if (!isOp(tokens[pos++], ')')) throw new ParseError(ERRORS.UNBALANCED);
        node = { t: 'fn', f: tok.v, a: inner };
      } else node = { t: 'fn', f: tok.v, a: unary() };
    } else if (isOp(tok, '(')) {
      node = expr();
      if (!isOp(tokens[pos++], ')')) throw new ParseError(ERRORS.UNBALANCED);
    } else if (isOp(tok, '|')) {
      absDepth++;
      const inner = expr();
      absDepth--;
      if (!isOp(tokens[pos++], '|')) throw new ParseError(ERRORS.UNBALANCED);
      node = { t: 'fn', f: 'abs', a: inner };
    } else if (isOp(tok, ')')) throw new ParseError(ERRORS.UNBALANCED);
    else throw new ParseError(ERRORS.UNEXPECTED);
    leave();
    return node;
  }

  const root = expr();
  if (pos < tokens.length) {
    throw new ParseError(isOp(tokens[pos], ')') ? ERRORS.UNBALANCED : ERRORS.UNEXPECTED);
  }
  return root;
}

/** Écriture canonique, entièrement parenthésée : identique en PHP (clé `normalized` de la fixture). */
export function printAst(node) {
  switch (node.t) {
    case 'num':
    case 'const':
    case 'var':
      return node.v;
    case 'neg':
      return `(-${printAst(node.a)})`;
    case 'fn':
      return `${node.f}(${printAst(node.a)})`;
    default:
      return `(${printAst(node.a)}${node.op}${printAst(node.b)})`;
  }
}

/**
 * @param {string} raw    la saisie
 * @param {string[]} vars les variables permises (une lettre chacune, jamais « e »)
 * @returns {{ok: true, ast: object, normalized: string} | {ok: false, error: string}}
 */
export function parseExpression(raw, vars = []) {
  const s = normalizeInput(raw);
  if (s === '') return { ok: false, error: ERRORS.EMPTY };
  if ([...s].length > MAX_LENGTH) return { ok: false, error: ERRORS.TOO_LONG };
  try {
    const ast = parseTokens(tokenize(s, vars));
    return { ok: true, ast, normalized: printAst(ast) };
  } catch (e) {
    if (e instanceof ParseError) return { ok: false, error: e.code };
    throw e;
  }
}

const finite = (v) => (Number.isFinite(v) ? v : NaN);

/** Valeur numérique ; NaN = indéfinie (division par 0, √ d'un négatif, ln ≤ 0…). */
export function evaluateAst(node, scope = {}) {
  switch (node.t) {
    case 'num':
      return finite(Number(node.v));
    case 'const':
      return CONSTANTS[node.v];
    case 'var':
      return Object.prototype.hasOwnProperty.call(scope, node.v) ? Number(scope[node.v]) : NaN;
    case 'neg':
      return -evaluateAst(node.a, scope);
    case 'fn': {
      const a = evaluateAst(node.a, scope);
      if (Number.isNaN(a)) return NaN;
      switch (node.f) {
        case 'sqrt': return a < 0 ? NaN : Math.sqrt(a);
        case 'ln': return a <= 0 ? NaN : Math.log(a);
        case 'exp': return finite(Math.exp(a));
        case 'sin': return Math.sin(a);
        case 'cos': return Math.cos(a);
        case 'tan': return finite(Math.tan(a));
        case 'abs': return Math.abs(a);
        default: return NaN;
      }
    }
    default: {
      const a = evaluateAst(node.a, scope);
      const b = evaluateAst(node.b, scope);
      if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
      switch (node.op) {
        case '+': return finite(a + b);
        case '-': return finite(a - b);
        case '*': return finite(a * b);
        case '/': return b === 0 ? NaN : finite(a / b);
        case '^':
          if (a < 0 && Math.floor(b) !== b) return NaN;
          if (a === 0 && b < 0) return NaN;
          return finite(a ** b);
        default: return NaN;
      }
    }
  }
}

/** Valeur d'une saisie en un point (null = illisible ou indéfinie). */
export function evaluateExpression(raw, scope = {}, vars = Object.keys(scope)) {
  const parsed = parseExpression(raw, vars);
  if (!parsed.ok) return null;
  const v = evaluateAst(parsed.ast, scope);
  return Number.isNaN(v) ? null : v;
}

/** Générateur de Park–Miller (« minimal standard », 48271) : entiers exacts en JS comme en PHP. */
export function createSampler(seed = DEFAULTS.seed) {
  let state = Math.trunc(Math.abs(seed)) % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

/** Distance minimale à une valeur exclue du domaine. */
const EXCLUDE_RADIUS = 1e-3;

/**
 * Les points candidats (jusqu'à 8 × samples), dans l'ordre des variables
 * déclarées ; un point trop proche d'une valeur exclue est écarté.
 */
export function samplePoints(vars, { samples = DEFAULTS.samples, domain = {}, seed = DEFAULTS.seed } = {}) {
  const next = createSampler(seed);
  const points = [];
  for (let draw = 0; draw < samples * 8; draw++) {
    const point = {};
    let excluded = false;
    for (const v of vars) {
      const d = domain[v] ?? DEFAULT_DOMAIN;
      const x = d.min + (d.max - d.min) * next();
      if ((d.exclude ?? []).some((g) => Math.abs(x - g) < EXCLUDE_RADIUS)) excluded = true;
      point[v] = x;
    }
    if (!excluded) points.push(point);
  }
  return points;
}

export function closeEnough(a, b, relTol = DEFAULTS.relTol, absTol = DEFAULTS.absTol) {
  const diff = Math.abs(a - b);
  return diff <= absTol || diff <= relTol * Math.max(Math.abs(a), Math.abs(b));
}

/**
 * Deux expressions sont-elles ÉGALES comme fonctions sur le domaine ?
 *
 * @param {string} given    la saisie de l'élève
 * @param {string} expected l'expression attendue (contenu : une erreur de lecture LÈVE)
 * @param {{vars?: string[], samples?: number, relTol?: number, absTol?: number,
 *          domain?: Record<string,{min:number,max:number,exclude?:number[]}>, seed?: number}} opts
 * @returns {{equivalent: boolean, reason: 'equal'|'differs'|'domain'|'undefined'|'syntax', error?: string, normalized?: string}}
 */
export function equivalentExpressions(given, expected, opts = {}) {
  const vars = opts.vars ?? [];
  const samples = opts.samples ?? DEFAULTS.samples;
  const relTol = opts.relTol ?? DEFAULTS.relTol;
  const absTol = opts.absTol ?? DEFAULTS.absTol;

  const exp = parseExpression(expected, vars);
  if (!exp.ok) throw new Error(`expression attendue illisible (${exp.error}) : ${expected}`);
  const giv = parseExpression(given, vars);
  if (!giv.ok) return { equivalent: false, reason: 'syntax', error: giv.error };

  const points = vars.length === 0 ? [{}] : samplePoints(vars, { samples, domain: opts.domain ?? {}, seed: opts.seed ?? DEFAULTS.seed });
  const needed = vars.length === 0 ? 1 : samples;
  let agreed = 0;
  for (const point of points) {
    if (agreed >= needed) break;
    const e = evaluateAst(exp.ast, point);
    const g = evaluateAst(giv.ast, point);
    const eNaN = Number.isNaN(e);
    const gNaN = Number.isNaN(g);
    if (eNaN && gNaN) continue;
    if (eNaN !== gNaN) return { equivalent: false, reason: 'domain', normalized: giv.normalized };
    if (!closeEnough(e, g, relTol, absTol)) return { equivalent: false, reason: 'differs', normalized: giv.normalized };
    agreed++;
  }
  // Trop peu de points où l'attendu est défini : on ne conclut pas à l'égalité.
  if (agreed < Math.ceil(needed / 2)) return { equivalent: false, reason: 'undefined', normalized: giv.normalized };
  return { equivalent: true, reason: 'equal', normalized: giv.normalized };
}
