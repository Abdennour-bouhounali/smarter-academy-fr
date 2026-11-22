/**
 * L'ANALYSEUR d'expressions du grapheur — logique pure, sans DOM.
 *
 * Il lit ce que MathLive produit (du LaTeX : `x^{2}`, `\frac{1}{x}`,
 * `\sqrt{x}`, `\sin\left(x\right)`, `\left|x\right|`) ET ce qu'une leçon ou
 * un test écrit à la main (de l'ASCII : `x^2`, `1/x`, `sqrt(x)`, `sin(x)`,
 * `|x|`). Une seule grammaire, tolérante, pour les deux — le document
 * n'enregistre qu'une représentation : la chaîne telle qu'elle a été saisie.
 *
 * Ce n'est PAS un système de calcul formel : aucune simplification, aucune
 * résolution, aucune dérivation. Analyser → évaluer → tracer.
 *
 * ── Le sous-ensemble accepté (docs/architecture/MATH_LAB.md) ──────────────
 *   nombres          2   2.5   2,5 (virgule décimale)
 *   variable         x   (et les paramètres déclarés dans `scope`, plus tard)
 *   constantes       pi  \pi  π   e  \exponentialE
 *   opérations       + - * / ^   \cdot \times \div   × · ÷ −
 *   multiplication implicite   2x   3(x+1)   x\sin x   (x+1)(x-2)
 *   puissances       x^2  x^{10}  x^-1  x²  x³  (associatives à droite)
 *   fractions        \frac{a}{b}   \frac12 (forme courte LaTeX)   a/b
 *   racines          \sqrt{x}  sqrt(x)  √x   \sqrt[3]{x}
 *   valeur absolue   |x|  \left|x\right|  \lvert x\rvert  abs(x)
 *   fonctions        sin cos tan sqrt abs exp ln log(décimal)
 *   parenthèses      ( )  { }  \left( \right)
 *
 * Un argument de fonction sans parenthèses s'étend au produit implicite qui
 * suit : `\sin 2x` = sin(2x), `\sin x^2` = sin(x²), `\sin x\cos x` = sin(x)·cos(x).
 * La multiplication implicite a la priorité de `*` : `1/2x` = (1/2)·x.
 *
 * ── Résultat ──────────────────────────────────────────────────────────────
 *   { ok: true,  ast }
 *   { ok: false, error: { code: 'empty' | 'incomplete' | 'unknownSymbol' | 'syntax', position, symbol? } }
 *
 * L'AST : { type: 'num', value } · { type: 'var', name } · { type: 'const', name }
 *         { type: 'neg', arg } · { type: 'bin', op, left, right } · { type: 'call', name, args }
 */

const FUNCTIONS = new Set(['sin', 'cos', 'tan', 'sqrt', 'abs', 'exp', 'ln', 'log']);
const CONSTANTS = new Set(['pi', 'e']);

// Les mots-lettres reconnus, du plus long au plus court : `xsin` se lit x·sin.
const WORDS = ['sqrt', 'sin', 'cos', 'tan', 'abs', 'exp', 'log', 'ln', 'pi', 'e'];

// Les commandes LaTeX qui ne changent rien au sens.
const SKIPPED_COMMANDS = new Set(['left', 'right', 'mleft', 'mright', 'displaystyle', 'textstyle', ',', ';', '!', ' ', 'quad', 'qquad', 'mathrm', 'operatorname']);

const COMMAND_TOKENS = {
  cdot: { type: 'op', value: '*' },
  times: { type: 'op', value: '*' },
  div: { type: 'op', value: '/' },
  frac: { type: 'frac' },
  dfrac: { type: 'frac' },
  tfrac: { type: 'frac' },
  sqrt: { type: 'sqrt' },
  pi: { type: 'const', value: 'pi' },
  exponentialE: { type: 'const', value: 'e' },
  lvert: { type: 'pipe' },
  rvert: { type: 'pipe' },
  vert: { type: 'pipe' },
  sin: { type: 'func', value: 'sin' },
  cos: { type: 'func', value: 'cos' },
  tan: { type: 'func', value: 'tan' },
  exp: { type: 'func', value: 'exp' },
  ln: { type: 'func', value: 'ln' },
  log: { type: 'func', value: 'log' },
  abs: { type: 'func', value: 'abs' },
};

const CHAR_TOKENS = {
  '+': { type: 'op', value: '+' },
  '-': { type: 'op', value: '-' },
  '−': { type: 'op', value: '-' },
  '–': { type: 'op', value: '-' },
  '*': { type: 'op', value: '*' },
  '×': { type: 'op', value: '*' },
  '·': { type: 'op', value: '*' },
  '⋅': { type: 'op', value: '*' },
  '/': { type: 'op', value: '/' },
  '÷': { type: 'op', value: '/' },
  '^': { type: 'pow' },
  '(': { type: 'lparen' },
  ')': { type: 'rparen' },
  '{': { type: 'lbrace' },
  '}': { type: 'rbrace' },
  '[': { type: 'lbracket' },
  ']': { type: 'rbracket' },
  '|': { type: 'pipe' },
  'π': { type: 'const', value: 'pi' },
  '√': { type: 'sqrt' },
};

class ParseError extends Error {
  constructor(code, position, symbol) {
    super(code);
    this.code = code;
    this.position = position;
    this.symbol = symbol;
  }
}

/** Découpe la source en jetons. `variables` : les lettres qui sont des variables (x, et demain a, b…). */
function tokenize(source, variables = ['x']) {
  const tokens = [];
  const text = String(source ?? '');
  const isLetter = (ch) => /[a-zA-Z]/.test(ch);
  const isDigit = (ch) => /[0-9]/.test(ch);
  const variableSet = new Set(variables);
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (/\s/.test(ch)) { i += 1; continue; }

    if (ch === '\\') {
      // Une commande : \frac, \sin, \left, \, …
      let j = i + 1;
      if (j < text.length && !isLetter(text[j])) {
        // \, \; \! \  (espacement) — sans effet.
        i = j + 1;
        continue;
      }
      while (j < text.length && isLetter(text[j])) j += 1;
      const name = text.slice(i + 1, j);
      if (name === 'placeholder') throw new ParseError('incomplete', i);
      if (name === 'mathrm' || name === 'operatorname' || name === 'text') {
        // \mathrm{e}, \operatorname{abs} : le contenu du groupe est lu comme des lettres.
        const open = text.indexOf('{', j);
        const close = open >= 0 ? text.indexOf('}', open) : -1;
        if (open !== j || close < 0) throw new ParseError('syntax', i);
        const inner = text.slice(open + 1, close).trim();
        if (FUNCTIONS.has(inner)) tokens.push({ type: 'func', value: inner, position: i });
        else if (CONSTANTS.has(inner)) tokens.push({ type: 'const', value: inner, position: i });
        else if (variableSet.has(inner)) tokens.push({ type: 'var', value: inner, position: i });
        else throw new ParseError('unknownSymbol', i, inner);
        i = close + 1;
        continue;
      }
      if (SKIPPED_COMMANDS.has(name)) { i = j; continue; }
      const token = COMMAND_TOKENS[name];
      if (!token) throw new ParseError('unknownSymbol', i, `\\${name}`);
      tokens.push({ ...token, position: i });
      i = j;
      /**
       * `\frac12` : en LaTeX, chaque argument sans accolade est UN SEUL
       * caractère — c'est ½, pas « 12 sur rien ». MathLive produit cette
       * forme dès qu'un élève tape une demie au clavier virtuel, et le
       * lexeur, qui agglomère les chiffres, lisait `num:12`.
       *
       * On découpe donc les deux chiffres qui SUIVENT immédiatement un
       * `\frac` en deux nombres d'un chiffre. Ailleurs rien ne change :
       * `\frac{12}{5}` garde ses accolades et ses nombres entiers.
       */
      if (token.type === 'frac' && /^[0-9][0-9]/.test(text.slice(i))) {
        tokens.push({ type: 'num', value: Number(text[i]), position: i });
        tokens.push({ type: 'num', value: Number(text[i + 1]), position: i + 1 });
        i += 2;
      }
      continue;
    }

    if (isDigit(ch) || ((ch === '.' || ch === ',') && isDigit(text[i + 1] ?? ''))) {
      let j = i;
      let seenPoint = false;
      while (j < text.length) {
        const c = text[j];
        if (isDigit(c)) { j += 1; continue; }
        if ((c === '.' || c === ',') && !seenPoint && isDigit(text[j + 1] ?? '')) { seenPoint = true; j += 1; continue; }
        break;
      }
      tokens.push({ type: 'num', value: Number(text.slice(i, j).replace(',', '.')), position: i });
      i = j;
      continue;
    }

    if (ch === '²' || ch === '³') {
      tokens.push({ type: 'pow', position: i });
      tokens.push({ type: 'num', value: ch === '²' ? 2 : 3, position: i, literalExponent: true });
      i += 1;
      continue;
    }

    if (isLetter(ch)) {
      // Le mot le plus long reconnu à cette position, sinon une variable, sinon un symbole inconnu.
      const word = WORDS.find((w) => text.startsWith(w, i));
      if (variableSet.has(ch) && !(word && word.length > 1)) {
        tokens.push({ type: 'var', value: ch, position: i });
        i += 1;
        continue;
      }
      if (word) {
        if (FUNCTIONS.has(word)) tokens.push({ type: 'func', value: word, position: i });
        else if (word === 'sqrt') tokens.push({ type: 'sqrt', position: i });
        else tokens.push({ type: 'const', value: word, position: i });
        i += word.length;
        continue;
      }
      throw new ParseError('unknownSymbol', i, ch);
    }

    const token = CHAR_TOKENS[ch];
    if (!token) throw new ParseError('unknownSymbol', i, ch);
    tokens.push({ ...token, position: i });
    i += 1;
  }

  return tokens;
}

/**
 * Analyse une expression en x.
 *
 * @param {string} source
 * @param {{variables?: string[]}} [options]
 */
export function parseExpression(source, options = {}) {
  const variables = options.variables ?? ['x'];
  try {
    const tokens = tokenize(source, variables);
    if (tokens.length === 0) return { ok: false, error: { code: 'empty', position: 0 } };
    const parser = new Parser(tokens, String(source ?? '').length);
    const ast = parser.parseExpression();
    if (parser.index < tokens.length) throw new ParseError('syntax', tokens[parser.index].position);

    return { ok: true, ast };
  } catch (error) {
    if (error instanceof ParseError) {
      return { ok: false, error: { code: error.code, position: error.position, symbol: error.symbol } };
    }
    throw error;
  }
}

class Parser {
  constructor(tokens, length) {
    this.tokens = tokens;
    this.index = 0;
    this.length = length;
    this.absDepth = 0;
  }

  peek(offset = 0) { return this.tokens[this.index + offset] ?? null; }

  next() {
    const token = this.tokens[this.index];
    if (!token) throw new ParseError('syntax', this.length);
    this.index += 1;

    return token;
  }

  expect(type) {
    const token = this.peek();
    if (!token) throw new ParseError('syntax', this.length);
    if (token.type !== type) throw new ParseError('syntax', token.position);
    this.index += 1;

    return token;
  }

  isOp(value) {
    const token = this.peek();

    return token?.type === 'op' && token.value === value;
  }

  /** Un jeton qui peut COMMENCER un facteur — donc une multiplication implicite. */
  startsFactor(token, allowPipe) {
    if (!token) return false;
    switch (token.type) {
      case 'num': case 'var': case 'const': case 'func': case 'lparen': case 'lbrace': case 'frac': case 'sqrt':
        return true;
      case 'pipe':
        return allowPipe;
      default:
        return false;
    }
  }

  parseExpression() {
    let left = this.parseTerm();
    while (this.isOp('+') || this.isOp('-')) {
      const op = this.next().value;
      const right = this.parseTerm();
      left = { type: 'bin', op, left, right };
    }

    return left;
  }

  parseTerm() {
    let left = this.parseUnary();
    for (;;) {
      if (this.isOp('*') || this.isOp('/')) {
        const op = this.next().value;
        const right = this.parseUnary();
        left = { type: 'bin', op, left, right };
        continue;
      }
      const token = this.peek();
      // Multiplication implicite : `2x`, `x(x+1)`, `2\pi` — mais pas `2 3`,
      // et pas `|` quand on est DANS une valeur absolue (c'est sa fermeture).
      if (this.startsFactor(token, this.absDepth === 0) && !(token.type === 'num' && left.type === 'num')) {
        const right = this.parsePower();
        left = { type: 'bin', op: '*', left, right };
        continue;
      }

      return left;
    }
  }

  parseUnary() {
    if (this.isOp('-')) {
      this.next();

      return { type: 'neg', arg: this.parseUnary() };
    }
    if (this.isOp('+')) {
      this.next();

      return this.parseUnary();
    }

    return this.parsePower();
  }

  parsePower() {
    const base = this.parseAtom();
    if (this.peek()?.type === 'pow') {
      this.next();
      const exponent = this.parseExponent();

      return { type: 'bin', op: '^', left: base, right: exponent };
    }

    return base;
  }

  /** Après `^` : un groupe `{…}`, ou un seul atome éventuellement signé (`x^-1`, `x^2x` = x²·x). */
  parseExponent() {
    const token = this.peek();
    if (!token) throw new ParseError('syntax', this.length);
    if (token.type === 'lbrace') {
      this.next();
      const inner = this.parseExpression();
      this.expect('rbrace');

      return inner;
    }
    if (token.type === 'op' && (token.value === '-' || token.value === '+')) {
      this.next();
      const arg = this.parseExponent();

      return token.value === '-' ? { type: 'neg', arg } : arg;
    }
    if (token.type === 'num' && token.literalExponent) {
      this.next();

      return { type: 'num', value: token.value };
    }

    return this.parsePower();
  }

  parseGroup() {
    this.expect('lbrace');
    const inner = this.parseExpression();
    this.expect('rbrace');

    return inner;
  }

  /**
   * L'argument d'un `\frac` ou d'un `\sqrt` : un GROUPE `{…}`, ou — en
   * LaTeX — le jeton unique qui suit.
   *
   * `\frac{1}{2}` et `\frac12` sont la MÊME chose en LaTeX, et MathLive
   * produit la seconde forme : un élève qui tape ½ au clavier virtuel envoie
   * `\frac12`. La QA navigateur l'a trouvé en tapant une demie dans le champ
   * de réponse du مختبر التحليل — la bonne réponse était rejetée comme
   * incompréhensible.
   *
   * Strictement ADDITIF : les accolades continuent d'être lues comme avant,
   * et seul le cas qui échouait jusqu'ici devient acceptable.
   */
  parseBraceOrToken() {
    const token = this.peek();
    if (!token) throw new ParseError('syntax', this.length);
    if (token.type === 'lbrace') return this.parseGroup();
    if (token.type === 'num') {
      this.next();

      return { type: 'num', value: token.value };
    }
    if (token.type === 'var') {
      this.next();

      return { type: 'var', name: token.value };
    }
    if (token.type === 'const') {
      this.next();

      return { type: 'const', name: token.value };
    }

    // Tout le reste garde l'exigence d'accolades : `\frac\sin(x){2}` n'est
    // pas du LaTeX, et l'accepter ouvrirait une grammaire qu'on ne teste pas.
    return this.parseGroup();
  }

  /** L'argument d'une fonction : entre parenthèses, entre accolades, ou le produit implicite qui suit. */
  parseFunctionArgument() {
    const token = this.peek();
    if (!token) throw new ParseError('syntax', this.length);
    if (token.type === 'lparen') {
      this.next();
      const inner = this.parseExpression();
      this.expect('rparen');

      return inner;
    }
    if (token.type === 'lbrace') return this.parseGroup();
    if (token.type === 'op' && token.value === '-') {
      this.next();

      return { type: 'neg', arg: this.parseFunctionArgument() };
    }
    let arg = this.parsePower();
    for (;;) {
      const nextToken = this.peek();
      if (!this.startsFactor(nextToken, this.absDepth === 0) || nextToken.type === 'func' || (nextToken.type === 'num' && arg.type === 'num')) break;
      arg = { type: 'bin', op: '*', left: arg, right: this.parsePower() };
    }

    return arg;
  }

  parseAtom() {
    const token = this.peek();
    if (!token) throw new ParseError('syntax', this.length);

    switch (token.type) {
      case 'num':
        this.next();

        return { type: 'num', value: token.value };
      case 'var':
        this.next();

        return { type: 'var', name: token.value };
      case 'const':
        this.next();

        return { type: 'const', name: token.value };
      case 'lparen': {
        this.next();
        const inner = this.parseExpression();
        this.expect('rparen');

        return inner;
      }
      case 'lbrace':
        return this.parseGroup();
      case 'pipe': {
        this.next();
        this.absDepth += 1;
        const inner = this.parseExpression();
        this.absDepth -= 1;
        this.expect('pipe');

        return { type: 'call', name: 'abs', args: [inner] };
      }
      case 'frac': {
        this.next();
        const numerator = this.parseBraceOrToken();
        const denominator = this.parseBraceOrToken();

        return { type: 'bin', op: '/', left: numerator, right: denominator };
      }
      case 'sqrt': {
        this.next();
        let degree = null;
        if (this.peek()?.type === 'lbracket') {
          this.next();
          degree = this.parseExpression();
          this.expect('rbracket');
        }
        const arg = this.parseFunctionArgument();

        return degree ? { type: 'call', name: 'root', args: [degree, arg] } : { type: 'call', name: 'sqrt', args: [arg] };
      }
      case 'func': {
        this.next();
        const arg = this.parseFunctionArgument();

        return { type: 'call', name: token.value, args: [arg] };
      }
      default:
        throw new ParseError('syntax', token.position);
    }
  }
}
