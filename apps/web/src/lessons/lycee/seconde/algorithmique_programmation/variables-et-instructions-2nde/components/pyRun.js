/**
 * pyRun — un interprète du SOUS-ENSEMBLE de Python enseigné en Seconde.
 *
 * Pourquoi écrire un interprète plutôt qu'afficher un script : la leçon promet
 * « utiliser » un programme, pas le regarder. Un élève doit pouvoir modifier une
 * ligne et voir la sortie changer — sinon la promesse n'est pas tenue (c'est le
 * défaut relevé sur loi-grands-nombres-2nde par l'audit de 2de).
 *
 * Ce qui est supporté, et rien d'autre : affectation, arithmétique, comparaison,
 * booléens, `print`, `if/elif/else`, `for ... in range(...)`, `while`, et les
 * fonctions `int`, `float`, `str`, `len`, `abs`, `round`, `randint`.
 *
 * Le hasard est INJECTÉ (`rng`) : une exécution est donc reproductible, ce qui
 * permet de tester le moteur et de rejouer une simulation à l'identique.
 */

const KEYWORDS = new Set(['if', 'elif', 'else', 'for', 'while', 'in', 'range', 'True', 'False', 'and', 'or', 'not']);

/** Une erreur d'exécution que l'élève doit pouvoir lire et comprendre. */
export class PyError extends Error {
  constructor(message, line) {
    super(message);
    this.line = line;
  }
}

/* ── Tokenisation d'une expression ──────────────────────────────────────── */
function tokenize(src, line) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === ' ' || c === '\t') { i += 1; continue; }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j += 1;
      out.push({ t: 'num', v: Number(src.slice(i, j)) });
      i = j; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j += 1;
      out.push({ t: 'name', v: src.slice(i, j) });
      i = j; continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1; let s = '';
      while (j < src.length && src[j] !== c) { s += src[j]; j += 1; }
      if (j >= src.length) throw new PyError('guillemet non fermé', line);
      out.push({ t: 'str', v: s });
      i = j + 1; continue;
    }
    const two = src.slice(i, i + 2);
    if (['==', '!=', '<=', '>=', '//'].includes(two)) { out.push({ t: 'op', v: two }); i += 2; continue; }
    if ('+-*/%<>(),'.includes(c)) { out.push({ t: 'op', v: c }); i += 1; continue; }
    throw new PyError(`caractère inattendu « ${c} »`, line);
  }
  return out;
}

/* ── Analyse d'expression : descente récursive, priorités de Python ─────── */
function parseExpr(tokens, env, line, rng) {
  let pos = 0;
  const peek = () => tokens[pos];
  const eat = (v) => { if (peek() && peek().v === v) { pos += 1; return true; } return false; };

  function primary() {
    const tk = tokens[pos];
    if (!tk) throw new PyError('expression incomplète', line);
    if (tk.t === 'num' || tk.t === 'str') { pos += 1; return tk.v; }
    if (tk.v === '(') { pos += 1; const v = orExpr(); if (!eat(')')) throw new PyError('parenthèse non fermée', line); return v; }
    if (tk.v === '-') { pos += 1; return -primary(); }
    if (tk.v === 'not') { pos += 1; return !truthy(primary()); }
    if (tk.t === 'name') {
      pos += 1;
      if (tk.v === 'True') return true;
      if (tk.v === 'False') return false;
      if (peek() && peek().v === '(') {
        pos += 1;
        const args = [];
        if (!(peek() && peek().v === ')')) {
          do { args.push(orExpr()); } while (eat(','));
        }
        if (!eat(')')) throw new PyError('parenthèse non fermée', line);
        return callBuiltin(tk.v, args, line, rng);
      }
      if (!(tk.v in env)) throw new PyError(`la variable « ${tk.v} » n'existe pas encore`, line);
      return env[tk.v];
    }
    throw new PyError(`expression invalide près de « ${tk.v} »`, line);
  }

  function mul() {
    let v = primary();
    while (peek() && ['*', '/', '//', '%'].includes(peek().v)) {
      const op = tokens[pos].v; pos += 1;
      const r = primary();
      if ((op === '/' || op === '//' || op === '%') && r === 0) throw new PyError('division par zéro', line);
      if (op === '*') v = typeof v === 'string' ? v.repeat(r) : v * r;
      else if (op === '/') v = v / r;
      else if (op === '//') v = Math.floor(v / r);
      else v = ((v % r) + r) % r;
    }
    return v;
  }

  function add() {
    let v = mul();
    while (peek() && ['+', '-'].includes(peek().v)) {
      const op = tokens[pos].v; pos += 1;
      const r = mul();
      if (op === '+') {
        if (typeof v === 'string' || typeof r === 'string') {
          if (typeof v !== typeof r) throw new PyError('on ne peut pas additionner un nombre et une chaîne — utilise str(...)', line);
          v = v + r;
        } else v = v + r;
      } else v = v - r;
    }
    return v;
  }

  function cmp() {
    let v = add();
    while (peek() && ['<', '>', '<=', '>=', '==', '!='].includes(peek().v)) {
      const op = tokens[pos].v; pos += 1;
      const r = add();
      if (op === '<') v = v < r; else if (op === '>') v = v > r;
      else if (op === '<=') v = v <= r; else if (op === '>=') v = v >= r;
      else if (op === '==') v = v === r; else v = v !== r;
    }
    return v;
  }

  function andExpr() {
    let v = cmp();
    while (peek() && peek().v === 'and') { pos += 1; const r = cmp(); v = truthy(v) ? r : v; }
    return v;
  }

  function orExpr() {
    let v = andExpr();
    while (peek() && peek().v === 'or') { pos += 1; const r = andExpr(); v = truthy(v) ? v : r; }
    return v;
  }

  const value = orExpr();
  if (pos < tokens.length) throw new PyError(`morceau d'expression en trop : « ${tokens[pos].v} »`, line);
  return value;
}

function callBuiltin(name, args, line, rng) {
  switch (name) {
    case 'int': return Math.trunc(Number(args[0]));
    case 'float': return Number(args[0]);
    case 'str': return pyStr(args[0]);
    case 'len': return String(args[0]).length;
    case 'abs': return Math.abs(args[0]);
    case 'round': return args.length > 1 ? Number(Number(args[0]).toFixed(args[1])) : Math.round(args[0]);
    case 'randint': {
      const [a, b] = args;
      return a + Math.floor(rng() * (b - a + 1));
    }
    default: throw new PyError(`fonction inconnue « ${name} »`, line);
  }
}

const truthy = (v) => !(v === false || v === 0 || v === '' || v === null || v === undefined);

/** Affichage à la Python : True/False, et pas de « .0 » sur les entiers. */
export function pyStr(v) {
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(10)));
  return String(v);
}

/** Le type Python d'une valeur, tel que la leçon le nomme. */
export function pyType(v) {
  if (typeof v === 'boolean') return 'bool';
  if (typeof v === 'string') return 'str';
  if (typeof v === 'number') return Number.isInteger(v) ? 'int' : 'float';
  return '?';
}

/* ── Découpage en blocs par indentation ─────────────────────────────────── */
function parseBlock(lines, start, indent) {
  const body = [];
  let i = start;
  while (i < lines.length) {
    const { text, indent: ind, no } = lines[i];
    if (text === '') { i += 1; continue; }
    if (ind < indent) break;
    if (ind > indent) throw new PyError('indentation inattendue', no);

    if (text.startsWith('if ') || text.startsWith('elif ') || text.startsWith('while ')) {
      const kind = text.split(' ')[0];
      if (!text.endsWith(':')) throw new PyError(`il manque « : » à la fin de la ligne`, no);
      const cond = text.slice(kind.length, -1).trim();
      const [inner, next] = parseBlock(lines, i + 1, indent + 1);
      body.push({ kind, cond, body: inner, no });
      i = next; continue;
    }
    if (text === 'else:') {
      const [inner, next] = parseBlock(lines, i + 1, indent + 1);
      body.push({ kind: 'else', body: inner, no });
      i = next; continue;
    }
    if (text.startsWith('for ')) {
      const m = text.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\((.+)\)\s*:$/);
      if (!m) throw new PyError('la boucle for doit s’écrire : for i in range(...) :', no);
      const [inner, next] = parseBlock(lines, i + 1, indent + 1);
      body.push({ kind: 'for', varName: m[1], rangeArgs: m[2], body: inner, no });
      i = next; continue;
    }
    body.push({ kind: 'stmt', text, no });
    i += 1;
  }
  return [body, i];
}

/**
 * Exécute un programme et renvoie ce que l'élève doit voir.
 * @returns {{output: string[], env: object, steps: number, error: PyError|null}}
 */
export function pyRun(source, { rng = Math.random, maxSteps = 20000 } = {}) {
  const lines = source.split('\n').map((raw, k) => {
    const noComment = raw.split('#')[0];
    const trimmed = noComment.trim();
    const spaces = noComment.length - noComment.trimStart().length;
    return { text: trimmed, indent: Math.floor(spaces / 4), no: k + 1 };
  });

  const output = [];
  const env = {};
  let steps = 0;

  const evalExpr = (src, no) => parseExpr(tokenize(src, no), env, no, rng);

  function run(block) {
    let skipElse = false;
    for (const node of block) {
      steps += 1;
      if (steps > maxSteps) throw new PyError('le programme ne s’arrête pas (boucle infinie ?)', node.no);

      if (node.kind === 'stmt') {
        const t = node.text;
        if (t.startsWith('print(')) {
          if (!t.endsWith(')')) throw new PyError('parenthèse non fermée', node.no);
          const inner = t.slice(6, -1).trim();
          if (inner === '') { output.push(''); continue; }
          // print peut recevoir plusieurs valeurs séparées par des virgules, au
          // premier niveau de parenthèses seulement.
          const parts = []; let depth = 0; let cur = '';
          for (const ch of inner) {
            if (ch === '(') depth += 1;
            if (ch === ')') depth -= 1;
            if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
            cur += ch;
          }
          parts.push(cur);
          output.push(parts.map((p) => pyStr(evalExpr(p.trim(), node.no))).join(' '));
          continue;
        }
        // `from random import randint` / `import random` : Python l'exige, notre
        // interpréteur fournit randint d'office. On ACCEPTE la ligne sans rien
        // faire, pour que le script affiché soit du vrai Python exécutable.
        if (/^(import\s+\w+|from\s+\w+\s+import\s+[\w,\s]+)$/.test(t)) continue;
        const m = t.match(/^([A-Za-z_]\w*)\s*(\+=|-=|\*=|=)\s*(.+)$/);
        if (!m) throw new PyError(`instruction non reconnue : « ${t} »`, node.no);
        const [, name, op, rhs] = m;
        if (KEYWORDS.has(name)) throw new PyError(`« ${name} » est un mot réservé de Python`, node.no);
        const value = evalExpr(rhs, node.no);
        if (op === '=') env[name] = value;
        else {
          if (!(name in env)) throw new PyError(`la variable « ${name} » n'existe pas encore`, node.no);
          env[name] = op === '+=' ? env[name] + value : op === '-=' ? env[name] - value : env[name] * value;
        }
        continue;
      }

      if (node.kind === 'if' || node.kind === 'elif') {
        if (node.kind === 'elif' && skipElse) continue;
        const ok = truthy(evalExpr(node.cond, node.no));
        if (ok) { run(node.body); skipElse = true; } else if (node.kind === 'if') skipElse = false;
        continue;
      }
      if (node.kind === 'else') { if (!skipElse) run(node.body); skipElse = false; continue; }

      if (node.kind === 'for') {
        const args = node.rangeArgs.split(',').map((a) => evalExpr(a.trim(), node.no));
        const [from, to, step] = args.length === 1 ? [0, args[0], 1] : args.length === 2 ? [args[0], args[1], 1] : args;
        for (let v = from; step > 0 ? v < to : v > to; v += step) {
          env[node.varName] = v;
          steps += 1;
          if (steps > maxSteps) throw new PyError('le programme ne s’arrête pas (boucle infinie ?)', node.no);
          run(node.body);
        }
        continue;
      }

      if (node.kind === 'while') {
        while (truthy(evalExpr(node.cond, node.no))) {
          steps += 1;
          if (steps > maxSteps) throw new PyError('le programme ne s’arrête pas — la condition ne devient jamais fausse', node.no);
          run(node.body);
        }
        continue;
      }
    }
  }

  try {
    const [block] = parseBlock(lines, 0, 0);
    run(block);
    return { output, env, steps, error: null };
  } catch (e) {
    if (e instanceof PyError) return { output, env, steps, error: e };
    throw e;
  }
}

/** Générateur reproductible, pour que randint soit testable et rejouable. */
export function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
