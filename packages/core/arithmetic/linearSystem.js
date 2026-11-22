/**
 * Les JUMAL MU`ĀDALATAYN — جمل معادلتين من الدرجة الأولى بمجهولين — en fractions EXACTES : le calcul
 * commun de l'unité 5 (tableau des deux conditions, cartes d'élimination, modélisation d'une histoire).
 *
 * Une équation est { a, b, c } pour a·x + b·y = c, ses coefficients des fractions de `linear.js`
 * ({ n, d } irréductibles). Rien n'arrondit : 2x − 3y = 1 et 3x + 5y = 21 donnent exactement
 * (68/19 ; 39/19). Les vues ne recalculent jamais une règle : elles appellent ce module.
 * (La Math Lab a son propre moteur, `features/mathlab/tools/algebra/systems.js`, dans un autre
 * bundle et sur son propre type rationnel : une leçon n'importe jamais la Math Lab.)
 *
 *   const s = system('x + y = 32', '2(x - 5) = y - 3');
 *   classify(s)                    → { kind: 'unique', x: {n:13,d:1}, y: {n:19,d:1} }
 *   holdsAt(s[0], 13, 19)          → true        pairHolds(s, 24, 8) → [false, false]
 *   isolate(eq2('x - y = 2'), 'y') → { k: 1, m: -2 }   (y = 1·x − 2)
 *   substitute(eq2('3x + y = -4'), 'y', { k: 1, m: -2 }) → { a: 4, c: -2 }  (4x = −2)
 *   eliminationFactors(e1, e2, 'x') → [k1, k2] entiers minimaux : k1·a1 + k2·a2 = 0
 *   eqLatex(eq2('2x - y = 7'))     → '2x - y = 7'
 *
 * Les noms d'inconnues sont libres (le manuel écrit aussi (a ; b) et (d ; t)) : `vars = ['a', 'b']`.
 */
import { frac, parseNumber, add, sub, mul, div, neg, eq, isZero, cmp, fracLatex, fracText } from './linear.js';

const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseNumber(v));

/** Une équation { a, b, c } : a·u + b·v = c. */
export const eqn = (a, b, c) => Object.freeze({ a: F(a), b: F(b), c: F(c) });

/* ── Lecture : « 2(x - 5) = y - 3 », « x/6 - y = -1 », « 1/2x - y = -2 », « 3x = 2y » ─────────── */

/** Une forme affine { u, v, k } (coefficients de chaque inconnue et constante). */
const form = (u, v, k) => ({ u: F(u), v: F(v), k: F(k) });
const fAdd = (p, q) => form(add(p.u, q.u), add(p.v, q.v), add(p.k, q.k));
const fScale = (p, s) => form(mul(p.u, s), mul(p.v, s), mul(p.k, s));
const isConst = (p) => isZero(p.u) && isZero(p.v);

function tokenize(src, vars) {
  const s = String(src).replace(/[−–]/g, '-').replace(/×|·/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
  const out = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/[0-9.,]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.,]/.test(s[j])) j += 1;
      out.push({ t: 'num', v: parseNumber(s.slice(i, j)) });
      i = j;
    } else if (vars.includes(ch)) {
      out.push({ t: 'var', v: ch }); i += 1;
    } else if ('+-*/()'.includes(ch)) {
      out.push({ t: ch }); i += 1;
    } else {
      throw new Error(`linearSystem: caractère inattendu « ${ch} » dans « ${src} »`);
    }
  }
  return out;
}

/** Une expression du premier degré en deux inconnues → forme { u, v, k }. */
export function parseLinear2(src, vars = ['x', 'y']) {
  const toks = tokenize(src, vars);
  let p = 0;
  const peek = () => toks[p];
  const take = (t) => { if (toks[p]?.t !== t) throw new Error(`linearSystem: « ${t} » attendu dans « ${src} »`); p += 1; };

  function atom() {
    const tk = peek();
    if (!tk) throw new Error(`linearSystem: expression incomplète « ${src} »`);
    if (tk.t === 'num') { p += 1; return form(0, 0, tk.v); }
    if (tk.t === 'var') { p += 1; return tk.v === vars[0] ? form(1, 0, 0) : form(0, 1, 0); }
    if (tk.t === '(') { p += 1; const e = sum(); take(')'); return e; }
    if (tk.t === '-') { p += 1; return fScale(atom(), -1); }
    if (tk.t === '+') { p += 1; return atom(); }
    throw new Error(`linearSystem: « ${tk.t} » inattendu dans « ${src} »`);
  }
  function product() {
    let acc = atom();
    for (;;) {
      const tk = peek();
      if (tk && (tk.t === '*' || tk.t === '/')) {
        p += 1;
        const rhs = atom();
        if (tk.t === '/') {
          if (!isConst(rhs)) throw new Error(`linearSystem: division par une inconnue dans « ${src} »`);
          acc = fScale(acc, div(1, rhs.k));
        } else acc = mulForms(acc, rhs, src);
      } else if (tk && (tk.t === 'num' || tk.t === 'var' || tk.t === '(')) {
        acc = mulForms(acc, atom(), src); // multiplication implicite : 2x, 3(x - 1), x(…) refusé si non constant
      } else return acc;
    }
  }
  function sum() {
    let acc = product();
    for (;;) {
      const tk = peek();
      if (tk?.t === '+') { p += 1; acc = fAdd(acc, product()); } else if (tk?.t === '-') { p += 1; acc = fAdd(acc, fScale(product(), -1)); } else return acc;
    }
  }
  const e = sum();
  if (p !== toks.length) throw new Error(`linearSystem: fin inattendue dans « ${src} »`);
  return e;
}

function mulForms(p, q, src) {
  if (isConst(p)) return fScale(q, p.k);
  if (isConst(q)) return fScale(p, q.k);
  throw new Error(`linearSystem: produit de deux inconnues dans « ${src} » (pas du premier degré)`);
}

/** « 2(x - 5) = y - 3 » → { a: 2, b: -1, c: 7 } (tout passe à gauche, la constante à droite). */
export function eq2(src, vars = ['x', 'y']) {
  const parts = String(src).split('=');
  if (parts.length !== 2) throw new Error(`linearSystem: une équation a un seul « = » : « ${src} »`);
  const L = parseLinear2(parts[0], vars);
  const R = parseLinear2(parts[1], vars);
  const a = sub(L.u, R.u);
  const b = sub(L.v, R.v);
  if (isZero(a) && isZero(b)) throw new Error(`linearSystem: aucune inconnue dans « ${src} »`);
  return eqn(a, b, sub(R.k, L.k));
}

/** Deux équations écrites comme le manuel → la jumla [e1, e2]. */
export const system = (src1, src2, vars = ['x', 'y']) => Object.freeze([eq2(src1, vars), eq2(src2, vars)]);

/* ── Vérifier une ثنائية ──────────────────────────────────────────────────────────────────── */

/** La valeur du premier membre a·x + b·y en (x ; y). */
export const leftAt = (e, x, y) => add(mul(e.a, F(x)), mul(e.b, F(y)));
/** L'équation est-elle vraie en (x ; y) ? */
export const holdsAt = (e, x, y) => eq(leftAt(e, x, y), e.c);
/** [vraie dans (1), vraie dans (2)] : une ثنائية est un حل للجملة ⇔ les deux. */
export const pairHolds = (sys, x, y) => sys.map((e) => holdsAt(e, x, y));
export const isSolution = (sys, x, y) => pairHolds(sys, x, y).every(Boolean);

/* ── Résoudre ───────────────────────────────────────────────────────────────────────────────── */

/** Le déterminant a1·b2 − a2·b1. */
export const det = ([e1, e2]) => sub(mul(e1.a, e2.b), mul(e2.a, e1.b));

/** Deux équations proportionnelles (même droite) ? */
const proportional = (e1, e2) => isZero(sub(mul(e1.a, e2.c), mul(e2.a, e1.c))) && isZero(sub(mul(e1.b, e2.c), mul(e2.b, e1.c)));

/**
 * Les trois cas du manuel (حالات خاصة) : 'unique' avec le couple exact, 'none' (on aboutit à
 * « 2x − y = 0 et 2x − y = 4 »), 'infinite' (une seule équation, « 2x + 3y = 1 » deux fois).
 */
export function classify(sys) {
  const [e1, e2] = sys;
  const D = det(sys);
  if (!isZero(D)) {
    const x = div(sub(mul(e1.c, e2.b), mul(e2.c, e1.b)), D);
    const y = div(sub(mul(e1.a, e2.c), mul(e2.a, e1.c)), D);
    return Object.freeze({ kind: 'unique', x, y });
  }
  return Object.freeze({ kind: proportional(e1, e2) ? 'infinite' : 'none' });
}

/* ── Les gestes des deux méthodes ─────────────────────────────────────────────────────────── */

/** Multiplier les deux membres par k ≠ 0 (k = 0 détruit l'information : refusé). */
export function scale(e, k) {
  if (isZero(F(k))) throw new Error('linearSystem: multiplier par 0 est interdit');
  return eqn(mul(e.a, k), mul(e.b, k), mul(e.c, k));
}
/** Additionner deux équations طرفا بطرف. */
export const addEqs = (e1, e2) => eqn(add(e1.a, e2.a), add(e1.b, e2.b), add(e1.c, e2.c));
/** Soustraire (e1 − e2). */
export const subEqs = (e1, e2) => addEqs(e1, scale(e2, -1));
/** L'inconnue a-t-elle disparu ? 'x', 'y', 'both' (0 = c) ou null. */
export function eliminated(e) {
  if (isZero(e.a) && isZero(e.b)) return 'both';
  if (isZero(e.a)) return 'x';
  if (isZero(e.b)) return 'y';
  return null;
}

/**
 * Isoler une inconnue (« التعبير عن أحد المجهولين بدلالة الآخر ») : v = k·u + m.
 * `which` = 'x' ou 'y' (la première ou la seconde inconnue). null si son coefficient est nul.
 */
export function isolate(e, which) {
  const own = which === 'x' ? e.a : e.b;
  const other = which === 'x' ? e.b : e.a;
  if (isZero(own)) return null;
  return Object.freeze({ k: div(neg(other), own), m: div(e.c, own) });
}

/**
 * Remplacer `which` dans `e` par k·u + m : on obtient une équation à UNE inconnue A·u = C
 * (u = l'autre inconnue). Exemple : 3x + (x − 2) = −4 → { a: 4, c: −2 }.
 */
export function substitute(e, which, { k, m }) {
  const own = which === 'x' ? e.a : e.b;
  const other = which === 'x' ? e.b : e.a;
  return Object.freeze({ a: add(other, mul(own, k)), c: sub(e.c, mul(own, m)) });
}

const igcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };

/**
 * Les multiplicateurs ENTIERS minimaux [k1, k2] (k1 > 0) tels que k1·coef1 + k2·coef2 = 0 pour
 * l'inconnue `which` : la « طريقة الجمع ». null si l'un des deux coefficients est nul (rien à faire).
 * 3x + 7y = 11 et −5x + 2y = 5, 'x' → [5, 3] ; 2x + y = 7 et 3x − 2y = 4,2, 'y' → [2, 1].
 */
export function eliminationFactors(e1, e2, which) {
  const p = which === 'x' ? e1.a : e1.b;
  const q = which === 'x' ? e2.a : e2.b;
  if (isZero(p) || isZero(q)) return null;
  // k1·p + k2·q = 0  ⇔  k1/k2 = −q/p ; on rend la fraction −q/p irréductible en entiers.
  const r = div(neg(q), p); // = k1 / k2
  let k1 = r.n; let k2 = r.d;
  if (k1 < 0) { k1 = -k1; k2 = -k2; }
  const g = igcd(k1, k2);
  return [k1 / g, k2 / g];
}

/* ── Écrire ─────────────────────────────────────────────────────────────────────────────────── */

function termLatex(coef, name, first) {
  if (isZero(coef)) return '';
  const negative = cmp(coef, 0) < 0;
  const abs = negative ? neg(coef) : coef;
  const one = eq(abs, 1);
  const body = one ? name : `${fracLatex(abs)}${name}`;
  if (first) return negative ? `-${body}` : body;
  return negative ? ` - ${body}` : ` + ${body}`;
}

/** « 2x - y = 7 », « -x + 3y = 2 », « 5y = 15 », « 0 = 4 » (une équation sans inconnue). */
export function eqLatex(e, vars = ['x', 'y']) {
  const t1 = termLatex(e.a, vars[0], true);
  const t2 = termLatex(e.b, vars[1], t1 === '');
  const left = `${t1}${t2}` || '0';
  return `${left} = ${fracLatex(e.c)}`;
}
/** La jumla en LaTeX : \begin{cases} … \\ … \end{cases}. */
export const systemLatex = (sys, vars = ['x', 'y']) => `\\begin{cases} ${eqLatex(sys[0], vars)} \\\\ ${eqLatex(sys[1], vars)} \\end{cases}`;
/** « (13 ; 19) », « \left(-\dfrac{1}{2} ; -\dfrac{5}{2}\right) » — la ثنائية à la façon du manuel. */
export function pairLatex(x, y) {
  const fx = fracLatex(F(x)); const fy = fracLatex(F(y));
  return fx.includes('dfrac') || fy.includes('dfrac') ? `\\left(${fx} ; ${fy}\\right)` : `(${fx} ; ${fy})`;
}
/** « (13 ; 19) » en texte (ARIA, tests). */
export const pairText = (x, y) => `(${fracText(F(x))} ; ${fracText(F(y))})`;
