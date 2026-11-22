/**
 * أولويات العمليات — un analyseur et un évaluateur PAS À PAS, exacts.
 * Logique pure, sans React (§60, §61).
 *
 *     2 × (3 + 4)^2 − 10
 *   = 2 × 7^2 − 10        نبدأ بما بين القوسين
 *   = 2 × 49 − 10         القوى أوّلًا
 *   = 98 − 10             الضرب والقسمة من اليسار إلى اليمين
 *   = 88                  الجمع والطرح من اليسار إلى اليمين
 *
 * ── Pourquoi un analyseur dédié ─────────────────────────────────────────
 * Un remplacement de chaînes (`replace(/\(([^()]*)\)/)…`) sait calculer, pas
 * MONTRER : il perd la forme de l'expression, donc l'étape. Ici l'expression
 * est un ARBRE qui GARDE ses parenthèses (nœud `group`) ; chaque pas réduit
 * UNE opération de l'arbre, puis l'arbre entier est réécrit — c'est ce que
 * l'élève fait sur son cahier.
 *
 * ── L'ordre de l'école (et pas celui d'un moteur) ───────────────────────
 *   1. les parenthèses les plus INTÉRIEURES d'abord (la plus à gauche s'il y
 *      en a plusieurs) ;
 *   2. dans ce groupe : les puissances, puis × ÷ de gauche à droite, puis
 *      + − de gauche à droite.
 * `20 − 12 ÷ 4 × 2` : l'arbre est `20 − ((12 ÷ 4) × 2)` (associativité à
 * gauche), et la réduction la plus à gauche parmi × ÷ est `12 ÷ 4` → 14.
 *
 * ── Ce que l'on accepte ─────────────────────────────────────────────────
 *   entiers, décimaux (`0,5` ou `0.5`), fractions `3/4` (deux entiers collés
 *   autour de `/`, sans puissance autour), `+ − × ÷ * / : ·`, `^`, `²`, `³`,
 *   `( )` et `[ ]`, le moins unaire, la multiplication implicite `2(3 + 4)`,
 *   les chiffres arabes-indiens ٠-٩.
 *   `−3^2` vaut −9 (la puissance porte sur 3), comme au collège.
 *
 * Tout est EXACT (bigRational.js). Division par zéro, exposant non entier,
 * nombre trop grand : un `error` avec sa POSITION, jamais Infinity ni NaN.
 */

import * as Q from './bigRational.js';

export const MAX_EXPRESSION_LENGTH = 120;
const MAX_OPERATIONS = 40;
const MAX_EXPONENT = 20;
const MAX_DIGITS = 60;

/* ── 1. Les jetons ─────────────────────────────────────────────────────── */

const OPERATOR_ALIASES = Object.freeze({
  '+': '+', '-': '-', '−': '-', '–': '-',
  '*': '*', '×': '*', '·': '*', x: '*', '⋅': '*',
  '/': '/', '÷': '/', ':': '/',
  '^': '^',
});
const OPEN = Object.freeze({ '(': ')', '[': ']' });
const CLOSE = Object.freeze({ ')': '(', ']': '[' });

/** Normaliser les chiffres arabes-indiens et la virgule arabe, SANS déplacer les positions. */
function normalizeChars(source) {
  return source.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/٫/g, ',');
}

/**
 * @returns {{ tokens: Array<{type, value?, text?, pos, end, spaceBefore}> } | { error: { code, pos } }}
 *   `pos` est l'indice (0-based) dans la chaîne tapée.
 */
function tokenize(source) {
  const text = normalizeChars(String(source ?? ''));
  const tokens = [];
  let i = 0;
  let space = false;
  while (i < text.length) {
    const ch = text[i];
    if (/\s/.test(ch)) { space = true; i += 1; continue; }
    if (/\d/.test(ch) || ((ch === ',' || ch === '.') && /\d/.test(text[i + 1] ?? ''))) {
      const start = i;
      while (i < text.length && /\d/.test(text[i])) i += 1;
      let decimal = false;
      if ((text[i] === ',' || text[i] === '.') && /\d/.test(text[i + 1] ?? '')) {
        decimal = true;
        i += 1;
        while (i < text.length && /\d/.test(text[i])) i += 1;
      }
      const raw = text.slice(start, i);
      if (raw.replace(/[.,]/, '').length > 15) return { error: { code: 'numberTooLong', pos: start } };
      tokens.push({ type: 'num', text: raw.replace('.', ','), decimal, pos: start, end: i, spaceBefore: space });
      space = false;
      continue;
    }
    if (ch === '²' || ch === '³') {
      tokens.push({ type: 'sup', value: ch === '²' ? 2 : 3, pos: i, end: i + 1, spaceBefore: space });
      i += 1; space = false; continue;
    }
    if (OPERATOR_ALIASES[ch]) {
      tokens.push({ type: 'op', value: OPERATOR_ALIASES[ch], raw: ch, pos: i, end: i + 1, spaceBefore: space });
      i += 1; space = false; continue;
    }
    if (OPEN[ch]) { tokens.push({ type: 'open', value: ch, pos: i, end: i + 1, spaceBefore: space }); i += 1; space = false; continue; }
    if (CLOSE[ch]) { tokens.push({ type: 'close', value: ch, pos: i, end: i + 1, spaceBefore: space }); i += 1; space = false; continue; }

    return { error: { code: 'unexpectedChar', pos: i, char: ch } };
  }

  return { tokens };
}

/* ── 2. L'arbre ────────────────────────────────────────────────────────── */

/*
 * Nœuds :
 *   { type: 'num',   value: Rational, form: 'int'|'dec'|'frac', text, pos }
 *   { type: 'group', bracket: '(' | '[', child, pos }
 *   { type: 'bin',   op: '+'|'-'|'*'|'/', left, right, pos, implicit? }
 *   { type: 'pow',   base, exp, pos }
 *   { type: 'neg',   child, pos }
 * `pos` : l'indice du caractère qui a créé le nœud (l'opérateur, la parenthèse).
 */

let nextId = 0;
const node = (fields) => ({ id: (nextId += 1), ...fields });

/**
 * Analyser une expression.
 * @returns {{ ast } | { error: { code, pos } }}
 *   codes : empty, tooLong, unexpectedChar, unexpectedEnd, unexpectedToken,
 *           missingClose, unexpectedClose, mismatchedBracket, emptyGroup,
 *           numberTooLong, zeroDenominator, tooManyOperations
 */
export function parseExpression(source) {
  const text = String(source ?? '');
  if (!text.trim()) return { error: { code: 'empty', pos: 0 } };
  if (text.length > MAX_EXPRESSION_LENGTH) return { error: { code: 'tooLong', pos: MAX_EXPRESSION_LENGTH } };
  const lexed = tokenize(text);
  if (lexed.error) return { error: lexed.error };
  const { tokens } = lexed;
  let index = 0;
  let operations = 0;

  const peek = (offset = 0) => tokens[index + offset];
  const fail = (code, pos) => { throw Object.assign(new Error(code), { parseError: { code, pos } }); };
  const endPos = text.length;

  const countOp = () => {
    operations += 1;
    if (operations > MAX_OPERATIONS) fail('tooManyOperations', peek()?.pos ?? endPos);
  };

  function parseSum() {
    let left = parseProduct();
    while (peek()?.type === 'op' && (peek().value === '+' || peek().value === '-')) {
      const op = tokens[index]; index += 1;
      countOp();
      const right = parseProduct();
      left = node({ type: 'bin', op: op.value, left, right, pos: op.pos });
    }

    return left;
  }

  function parseProduct() {
    let left = parseUnary();
    for (;;) {
      const token = peek();
      if (token?.type === 'op' && (token.value === '*' || token.value === '/')) {
        index += 1;
        countOp();
        const right = parseUnary();
        left = node({ type: 'bin', op: token.value, left, right, pos: token.pos });
      } else if (token?.type === 'open') {
        // Multiplication implicite : 2(3 + 4), (1 + 2)(3 + 4).
        countOp();
        const right = parseUnary();
        left = node({ type: 'bin', op: '*', left, right, pos: token.pos, implicit: true });
      } else {
        return left;
      }
    }
  }

  function parseUnary() {
    const token = peek();
    if (token?.type === 'op' && (token.value === '-' || token.value === '+')) {
      index += 1;
      const child = parseUnary();

      return token.value === '-' ? node({ type: 'neg', child, pos: token.pos }) : child;
    }

    return parsePower();
  }

  function parsePower() {
    let base = parsePrimary();
    for (;;) {
      const token = peek();
      if (token?.type === 'sup') {
        index += 1;
        countOp();
        base = node({
          type: 'pow', base, pos: token.pos,
          exp: node({ type: 'num', value: Q.rat(token.value), form: 'int', text: String(token.value), pos: token.pos }),
        });
      } else if (token?.type === 'op' && token.value === '^') {
        index += 1;
        countOp();
        // L'exposant est associatif à DROITE : 2^3^2 = 2^(3^2). Il peut être négatif : 2^-1.
        const exp = parseUnary();
        return node({ type: 'pow', base, exp, pos: token.pos });
      } else {
        return base;
      }
    }
  }

  function parsePrimary() {
    const token = peek();
    if (!token) return fail('unexpectedEnd', endPos);
    if (token.type === 'num') {
      index += 1;
      // Une FRACTION écrite : deux entiers collés autour de « / » (3/4), et
      // aucune puissance qui la toucherait (2^3/4 se lit (2^3) ÷ 4).
      const slash = peek();
      const denominator = peek(1);
      const before = tokens[index - 2];
      const after = peek(2);
      if (!token.decimal && slash?.type === 'op' && slash.raw === '/' && !slash.spaceBefore
          && denominator?.type === 'num' && !denominator.decimal && !denominator.spaceBefore
          && !(before?.type === 'op' && before.value === '^')
          && !(after && (after.type === 'sup' || (after.type === 'op' && after.value === '^')))) {
        index += 2;
        const value = Q.rat(BigInt(token.text), BigInt(denominator.text));
        if (!value) return fail('zeroDenominator', denominator.pos);

        return node({ type: 'num', value, form: 'frac', text: `${token.text}/${denominator.text}`, num: token.text, den: denominator.text, pos: token.pos });
      }
      const value = token.decimal ? Q.fromDecimalText(token.text) : Q.rat(BigInt(token.text));

      return node({ type: 'num', value, form: token.decimal ? 'dec' : 'int', text: token.text, pos: token.pos });
    }
    if (token.type === 'open') {
      index += 1;
      if (peek()?.type === 'close') return fail('emptyGroup', peek().pos);
      const child = parseSum();
      const close = peek();
      if (!close) return fail('missingClose', token.pos);
      if (close.type !== 'close') return fail('unexpectedToken', close.pos);
      if (CLOSE[close.value] !== token.value) return fail('mismatchedBracket', close.pos);
      index += 1;

      return node({ type: 'group', bracket: token.value, child, pos: token.pos });
    }
    if (token.type === 'close') return fail('unexpectedClose', token.pos);

    return fail('unexpectedToken', token.pos);
  }

  try {
    const ast = parseSum();
    if (index < tokens.length) {
      const token = tokens[index];
      return { error: { code: token.type === 'close' ? 'unexpectedClose' : 'unexpectedToken', pos: token.pos } };
    }

    return { ast };
  } catch (error) {
    if (error.parseError) return { error: error.parseError };
    throw error;
  }
}

/* ── 3. Le pas à pas ───────────────────────────────────────────────────── */

const isNum = (n) => n?.type === 'num';

/**
 * Les simplifications qui ne SONT pas une opération : `−(7)` devient le
 * nombre −7, et `(7)` perd ses parenthèses. Elles accompagnent le pas qui les
 * a rendues possibles (« (3 + 4) × 5 = 7 × 5 » est UN pas au cahier).
 */
function tidy(n) {
  switch (n.type) {
    case 'num': return n;
    case 'group': {
      const child = tidy(n.child);
      if (isNum(child)) return child;

      return child === n.child ? n : { ...n, child };
    }
    case 'neg': {
      const child = tidy(n.child);
      if (isNum(child)) {
        // Le nombre GARDE l'identité de ce qui vient d'être calculé : la surbrillance le suit.
        return { ...child, value: Q.neg(child.value), pos: n.pos, fromNeg: true };
      }

      return child === n.child ? n : { ...n, child };
    }
    case 'pow': {
      const base = tidy(n.base);
      const exp = tidy(n.exp);

      return base === n.base && exp === n.exp ? n : { ...n, base, exp };
    }
    case 'bin': {
      const left = tidy(n.left);
      const right = tidy(n.right);

      return left === n.left && right === n.right ? n : { ...n, left, right };
    }
    default: return n;
  }
}

function containsGroup(n) {
  if (!n) return false;
  switch (n.type) {
    case 'group': return true;
    case 'neg': return containsGroup(n.child);
    case 'pow': return containsGroup(n.base) || containsGroup(n.exp);
    case 'bin': return containsGroup(n.left) || containsGroup(n.right);
    default: return false;
  }
}

/** Les groupes qui ne contiennent AUCUN autre groupe, de gauche à droite. */
function innermostGroups(n, out = []) {
  const walk = (m) => {
    if (!m) return false;
    switch (m.type) {
      case 'group': {
        const nested = walk(m.child);
        if (!nested) out.push(m);

        return true;
      }
      case 'neg': return walk(m.child);
      case 'pow': { const a = walk(m.base); const b = walk(m.exp); return a || b; }
      case 'bin': { const a = walk(m.left); const b = walk(m.right); return a || b; }
      default: return false;
    }
  };
  walk(n);

  return out.sort((a, b) => a.pos - b.pos);
}

/** Les opérations « feuilles » (opérandes déjà réduits) d'un sous-arbre. */
function leafOperations(n, out = []) {
  if (!n) return out;
  switch (n.type) {
    case 'pow':
      if (isNum(n.base) && isNum(n.exp)) out.push(n);
      else { leafOperations(n.base, out); leafOperations(n.exp, out); }
      break;
    case 'bin':
      if (isNum(n.left) && isNum(n.right)) out.push(n);
      else { leafOperations(n.left, out); leafOperations(n.right, out); }
      break;
    case 'neg': leafOperations(n.child, out); break;
    case 'group': leafOperations(n.child, out); break;
    default: break;
  }

  return out;
}

/** Choisir l'opération que l'école fait MAINTENANT. */
function pickNext(ast) {
  const groups = innermostGroups(ast);
  const scope = groups.length ? groups[0].child : ast;
  const leaves = leafOperations(scope).sort((a, b) => a.pos - b.pos);
  const power = leaves.find((n) => n.type === 'pow');
  if (power) return { target: power, rule: 'power', inGroup: groups.length > 0 };
  const product = leaves.find((n) => n.type === 'bin' && (n.op === '*' || n.op === '/'));
  if (product) return { target: product, rule: 'multiplyDivide', inGroup: groups.length > 0 };
  const sum = leaves.find((n) => n.type === 'bin' && (n.op === '+' || n.op === '-'));
  if (sum) return { target: sum, rule: 'addSubtract', inGroup: groups.length > 0 };

  return null;
}

/** La forme d'écriture d'un résultat : entier, décimal fini (si aucun opérande n'était une fraction), ou fraction. */
function resultForm(value, operands) {
  if (Q.isInteger(value)) return 'int';
  if (operands.some((o) => o.form === 'frac')) return 'frac';
  if (Q.isTerminating(value)) return 'dec';

  return 'frac';
}

/** Effectuer UNE opération feuille. @returns {{ value } | { error }} */
function compute(target) {
  if (target.type === 'pow') {
    const exp = target.exp.value;
    if (!Q.isInteger(exp)) return { error: 'nonIntegerExponent' };
    if (exp.n > BigInt(MAX_EXPONENT) || exp.n < BigInt(-MAX_EXPONENT)) return { error: 'exponentTooLarge' };
    const result = Q.pow(target.base.value, Number(exp.n), { maxDigits: MAX_DIGITS });
    if (result.error) return { error: result.error };

    // Une puissance NÉGATIVE s'écrit en fraction (2^{-2} = 1/4), sauf sur une base décimale.
    const operands = exp.n < 0n && target.base.form !== 'dec' ? [target.base, { form: 'frac' }] : [target.base];

    return { value: result.value, operands };
  }
  const { left, right, op } = target;
  let value;
  switch (op) {
    case '+': value = Q.add(left.value, right.value); break;
    case '-': value = Q.sub(left.value, right.value); break;
    case '*': value = Q.mul(left.value, right.value); break;
    default:
      value = Q.div(left.value, right.value);
      if (!value) return { error: 'divisionByZero' };
  }
  if (Q.digitLength(value) > MAX_DIGITS) return { error: 'tooLarge' };

  return { value, operands: [left, right] };
}

function replaceNode(n, id, replacement) {
  if (!n) return n;
  if (n.id === id) return replacement;
  switch (n.type) {
    case 'group': { const child = replaceNode(n.child, id, replacement); return child === n.child ? n : { ...n, child }; }
    case 'neg': { const child = replaceNode(n.child, id, replacement); return child === n.child ? n : { ...n, child }; }
    case 'pow': {
      const base = replaceNode(n.base, id, replacement);
      const exp = replaceNode(n.exp, id, replacement);

      return base === n.base && exp === n.exp ? n : { ...n, base, exp };
    }
    case 'bin': {
      const left = replaceNode(n.left, id, replacement);
      const right = replaceNode(n.right, id, replacement);

      return left === n.left && right === n.right ? n : { ...n, left, right };
    }
    default: return n;
  }
}

/**
 * LE DÉROULÉ COMPLET.
 *
 * @returns {{
 *   ok: true, initialLatex: string,
 *   steps: Array<{ rule, inGroup, latex, operationLatex, resultLatex, highlightId }>,
 *   result: { value, latex, fraction: string, decimal: { text, exact }, isInteger: boolean }
 * } | { ok: false, error: { code, pos }, initialLatex?: string, steps?: Array }}
 *   En cas d'erreur de CALCUL (division par zéro…), les pas déjà faits sont
 *   rendus avec l'erreur : l'élève voit OÙ le calcul s'arrête.
 */
export function evaluateStepByStep(source) {
  const parsed = parseExpression(source);
  if (parsed.error) return { ok: false, error: parsed.error };
  let ast = parsed.ast;
  const initialLatex = toLatex(ast);
  const steps = [];
  let guard = 0;
  for (;;) {
    guard += 1;
    if (guard > MAX_OPERATIONS * 2 + 4) break;
    const tidied = tidy(ast);
    if (isNum(tidied)) {
      if (tidied !== ast && containsGroup(ast)) {
        // Il ne restait que des parenthèses ou un signe : un dernier pas pour les ôter.
        steps.push({ rule: 'removeBrackets', inGroup: false, latex: toLatex(tidied, tidied.id), plainLatex: toLatex(tidied), beforeLatex: toLatex(ast), target: null, operationLatex: null, resultLatex: toLatex(tidied), highlightId: tidied.id });
      }
      ast = tidied;
      break;
    }
    const next = pickNext(tidied);
    if (!next) break;
    const computed = compute(next.target);
    if (computed.error) {
      return {
        ok: false,
        error: { code: computed.error, pos: next.target.pos },
        initialLatex,
        steps,
        failingLatex: toLatex(tidied, next.target.id),
      };
    }
    const form = resultForm(computed.value, computed.operands);
    const replacement = node({ type: 'num', value: computed.value, form, text: null, pos: next.target.pos });
    const operationLatex = `${toLatex(next.target)} = ${numberLatex(replacement)}`;
    // L'état AVANT, la cible en orange : c'est lui que le tableau désigne (orderFrames.js).
    const beforeLatex = toLatex(tidied, next.target.id);
    ast = tidy(replaceNode(tidied, next.target.id, replacement));
    steps.push({
      rule: next.rule,
      inGroup: next.inGroup,
      latex: toLatex(ast, replacement.id),
      plainLatex: toLatex(ast),
      beforeLatex,
      target: describeTarget(next.target),
      operationLatex,
      resultLatex: numberLatex(replacement),
      highlightId: replacement.id,
    });
  }
  if (!isNum(ast)) return { ok: false, error: { code: 'unexpectedToken', pos: 0 }, initialLatex, steps };

  const { value } = ast;

  return {
    ok: true,
    initialLatex,
    steps,
    result: {
      value,
      latex: Q.toLatex(value),
      fraction: Q.toText(value),
      decimal: Q.toDecimal(value, { places: 6 }),
      isInteger: Q.isInteger(value),
    },
  };
}

/**
 * La cible d'un pas, en morceaux : les deux opérandes et l'opérateur d'une
 * opération binaire (ce que le tableau relie par un arc), ou `null` pour une
 * puissance / un autre nœud (désigné d'un seul tenant).
 */
function describeTarget(target) {
  if (target.type !== 'bin') return { type: target.type };

  return {
    type: 'bin',
    leftLatex: toLatex(target.left, null, { leading: true, powBase: false }),
    rightLatex: toLatex(target.right, null, { leading: false, powBase: false }),
    symbolLatex: { '+': '+', '-': '-', '*': '\\times', '/': '\\div' }[target.op],
  };
}

/* ── 4. L'écriture ─────────────────────────────────────────────────────── */

export const HIGHLIGHT_COLOR = '#F36D21';

/** Le LaTeX d'un nombre, dans la forme où l'élève l'attend. */
function numberLatex(n) {
  if (n.form === 'frac' && n.num) return `${Q.isNegative(n.value) ? '-' : ''}\\frac{${n.num}}{${n.den}}`;
  if (n.text && !n.fromNeg) return n.text.replace(',', '{,}');
  if (n.form === 'dec') return Q.toDecimal(n.value, { places: 12 }).text.replace('−', '-').replace(',', '{,}');

  return Q.toLatex(n.value);
}

/**
 * Le LaTeX de l'arbre ENTIER, le nœud `highlight` en orange.
 *
 * Les parenthèses TAPÉES sont gardées (nœuds `group`) ; l'arbre de
 * l'analyseur respecte déjà les priorités, donc aucune n'est inventée — sauf
 * autour d'un nombre NÉGATIF qui n'ouvre pas son expression (`2 × (−3)`,
 * `1 + (−3) × 2`) ou qui est élevé à une puissance (`(−2)^{2}`), comme au
 * cahier.
 *
 * @param {object} ctx  `leading` : le nœud ouvre-t-il son expression ? `powBase` : est-il sous une puissance ?
 */
function toLatex(n, highlight = null, ctx = { leading: true, powBase: false }) {
  const mark = (latex) => (n.id === highlight ? `\\textcolor{${HIGHLIGHT_COLOR}}{${latex}}` : latex);
  switch (n.type) {
    case 'num': {
      const latex = numberLatex(n);
      const negative = Q.isNegative(n.value);
      const needs = ctx.powBase
        ? (negative || (n.form === 'frac' && !Q.isInteger(n.value)))
        : (negative && !ctx.leading);

      return mark(needs ? `\\left(${latex}\\right)` : latex);
    }
    case 'group': {
      const inner = toLatex(n.child, highlight, { leading: true, powBase: false });

      return mark(n.bracket === '[' ? `\\left[${inner}\\right]` : `\\left(${inner}\\right)`);
    }
    case 'neg': {
      const latex = `-${toLatex(n.child, highlight, { leading: false, powBase: false })}`;

      return mark(ctx.leading && !ctx.powBase ? latex : `\\left(${latex}\\right)`);
    }
    case 'pow': {
      const base = toLatex(n.base, highlight, { leading: true, powBase: true });

      return mark(`${base}^{${toLatex(n.exp, highlight, { leading: true, powBase: false })}}`);
    }
    case 'bin': {
      const left = toLatex(n.left, highlight, { leading: ctx.leading, powBase: false });
      const right = toLatex(n.right, highlight, { leading: false, powBase: false });
      const symbol = { '+': '+', '-': '-', '*': '\\times', '/': '\\div' }[n.op];

      return mark(`${left} ${symbol} ${right}`);
    }
    default: return '';
  }
}

/* ── 5. Exemples ───────────────────────────────────────────────────────── */

export const ORDER_EXAMPLES = Object.freeze([
  { id: 'o-1', level: 'beginner', expression: '3 + 4 × 5' },
  { id: 'o-2', level: 'beginner', expression: '(3 + 4) × 5' },
  { id: 'o-3', level: 'beginner', expression: '18 − 6 ÷ 3' },
  { id: 'o-4', level: 'intermediate', expression: '20 − 12 ÷ 4 × 2' },
  { id: 'o-5', level: 'intermediate', expression: '2 × (3 + 4)^2 − 10' },
  { id: 'o-6', level: 'intermediate', expression: '5 − 3^2 + (−2)^2' },
  { id: 'o-7', level: 'advanced', expression: '3/4 + 1/2 × 3' },
  { id: 'o-8', level: 'advanced', expression: '[12 − (2 + 4) × 1,5] ÷ 3' },
  { id: 'o-9', level: 'advanced', expression: '(2/3 − 1/6) ÷ 5/4' },
]);

/** Une expression aléatoire de niveau collège, toujours bien formée et sans division par zéro. */
export function randomExpression(random = Math.random) {
  const int = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));
  const templates = [
    () => `${int(2, 20)} + ${int(2, 9)} × ${int(2, 9)}`,
    () => `(${int(2, 12)} + ${int(2, 9)}) × ${int(2, 6)}`,
    () => `${int(20, 60)} − ${int(2, 9) * 2} ÷ 2 × ${int(2, 5)}`,
    () => `${int(2, 5)} × (${int(1, 6)} + ${int(1, 4)})^2 − ${int(1, 30)}`,
    () => `${int(1, 9)}^2 − ${int(2, 9)} × (${int(10, 20)} − ${int(2, 9)})`,
    () => `[${int(10, 30)} − (${int(1, 5)} + ${int(1, 5)}) × 2] ÷ ${int(1, 4)}`,
  ];

  return templates[int(0, templates.length - 1)]();
}
