// Oracle du banc « quwat-adad-nisbi » (قوة عدد نسبي, 3AM, 2026-10-20) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer` :
//  - les expressions de l'énoncé sont RETAPÉES ici dans une petite syntaxe (`*`, `/`, `^`, crochets) et évaluées par un
//    analyseur écrit dans ce fichier, en rationnels EXACTS (BigInt) — la puissance à exposant entier relatif aussi
//    (a^-n = 1 / a^n, a^0 = 1, a ≠ 0). La priorité est celle du programme : la puissance avant le moins unaire
//    (−3^4 = −81), puis × ÷, puis + − ;
//  - « écrire sous la forme a^n » : l'oracle cherche l'UNIQUE exposant entier n (−60 … 60) tel que a^n vaut l'expression
//    évaluée, sans jamais appliquer une règle de calcul sur les exposants ;
//  - un QCM n'a qu'un seul choix juste : chaque option chiffrée est retapée et évaluée, puis confrontée au calcul ; les
//    options qualitatives (signe, oui / non, tableau magique) sont décidées par une comparaison calculée.
// Les questions selfCheck (« برّر », « بيّن ») n'ont pas de clé et ne figurent pas ici.
import { R, C } from './helpers.mjs';

/* ── rationnels exacts ─────────────────────────────────────────────────────── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
class Q {
  constructor(n, d = 1n) {
    if (d === 0n) throw new Error('division par zéro');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n; this.n = n / g; this.d = d / g;
  }
  add(o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Q(this.n * o.n, this.d * o.d); }
  div(o) { return new Q(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  pow(k) {
    if (k.d !== 1n) throw new Error('exposant non entier');
    let e = k.n; let base = this;
    if (e < 0n) { if (this.n === 0n) throw new Error('0 puissance négative'); base = new Q(this.d, this.n); e = -e; }
    let r = new Q(1n); for (let i = 0n; i < e; i++) r = r.mul(base); return r;
  }
  eq(o) { return this.n === o.n && this.d === o.d; }
  cmp(o) { const l = this.n * o.d; const r = o.n * this.d; return l < r ? -1 : l > r ? 1 : 0; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
const num = (s) => { const [i, f = ''] = s.split('.'); return new Q(BigInt(i + f), 10n ** BigInt(f.length)); };

/* ── analyseur : expr = terme ((+|−) terme)* ; terme = unaire ((*|/) unaire)* ; unaire = −unaire | puissance ;
      puissance = primaire (^ exposant)? ; exposant = (−)? primaire ; primaire = nombre | (expr) | [expr] ── */
function evaluate(src) {
  const t = src.replace(/\s+/g, ''); let i = 0;
  const peek = () => t[i];
  const expr = () => { let v = term(); while (peek() === '+' || peek() === '-') { const op = t[i++]; const w = term(); v = op === '+' ? v.add(w) : v.sub(w); } return v; };
  const term = () => { let v = unary(); while (peek() === '*' || peek() === '/') { const op = t[i++]; const w = unary(); v = op === '*' ? v.mul(w) : v.div(w); } return v; };
  const unary = () => { if (peek() === '-') { i++; return unary().neg(); } return power(); };
  const power = () => { const b = primary(); if (peek() === '^') { i++; let s = false; if (peek() === '-') { s = true; i++; } const e = primary(); return b.pow(s ? e.neg() : e); } return b; };
  const primary = () => {
    if (peek() === '(' || peek() === '[') { const close = peek() === '(' ? ')' : ']'; i++; const v = expr(); if (t[i++] !== close) throw new Error(`« ${close} » attendu dans ${src}`); return v; }
    const m = /^\d+(\.\d+)?/.exec(t.slice(i)); if (!m) throw new Error(`lecture impossible à ${i} dans ${src}`); i += m[0].length; return num(m[0]);
  };
  const v = expr(); if (i !== t.length) throw new Error(`reste « ${t.slice(i)} » dans ${src}`); return v;
}
const V = (s) => evaluate(s).toString();
/** L'unique n entier tel que base^n = valeur de l'expression. */
const EXP = (base, s) => {
  const target = evaluate(s); const b = evaluate(String(base));
  const hits = []; for (let n = -60; n <= 60; n++) if (b.pow(new Q(BigInt(n))).eq(target)) hits.push(n);
  if (hits.length !== 1) throw new Error(`${s} : ${hits.length} exposants pour la base ${base}`);
  return hits[0];
};
/** L'unique a naturel (1…1000) tel que a^n = valeur. */
const BASE = (n, s) => { const target = evaluate(s); const hits = []; for (let a = 1; a <= 1000; a++) if (evaluate(`${a}^${n}`).eq(target)) hits.push(a); if (hits.length !== 1) throw new Error(`${s} : ${hits.length} bases`); return hits[0]; };
const letter = (k) => C('ABCDEF'[k]);
/** QCM chiffré : la seule option dont la valeur vaut celle de `s`. */
const pickVal = (s, options) => { const v = evaluate(s); const hits = options.map((o, k) => (evaluate(o).eq(v) ? k : -1)).filter((k) => k >= 0); if (hits.length !== 1) throw new Error(`QCM ${s} : ${hits.length} options justes`); return letter(hits[0]); };
/** QCM qualitatif : la seule option vraie. */
const pick = (flags) => { const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0); if (hits.length !== 1) throw new Error(`QCM : ${hits.length} options justes`); return letter(hits[0]); };
const sign = (s) => evaluate(s).cmp(new Q(0n));
const lt = (a, b) => evaluate(a).cmp(evaluate(b)) < 0;

const L = 'ex-3am-quwat-adad-nisbi';
const K = (lvl, n, q) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${q}`;

/* tableau « sorcier » de l5-003 (lignes de l'énoncé, retapées) */
const MAGIC = [['2^-2', '2^3', '4'], ['2^5', '2', '2^-3'], ['1', '1/2', '16']];
const magicLines = (() => {
  const cols = [0, 1, 2].map((c) => MAGIC.map((r) => r[c]));
  return [...MAGIC, ...cols, [MAGIC[0][0], MAGIC[1][1], MAGIC[2][2]], [MAGIC[0][2], MAGIC[1][1], MAGIC[2][0]]];
})();
const prod = (cells) => V(cells.map((c) => `(${c})`).join('*'));

export const ORACLE = {
  /* ── Niveau 1 ── */
  [K(1, 1, 'q1')]: R(V('(-3)^4')),
  [K(1, 1, 'q2')]: R(V('-3^4')),
  [K(1, 1, 'q3')]: R(V('(-2)^5')),
  [K(1, 1, 'q4')]: R(V('2^-3')),
  [K(1, 2, 'q1')]: pick([sign('(-7)^6') > 0, sign('(-7)^6') < 0]),
  [K(1, 2, 'q2')]: pick([sign('(-5)^9') > 0, sign('(-5)^9') < 0]),
  [K(1, 2, 'q3')]: R(V('(-1)^2025')),
  [K(1, 2, 'q4')]: pickVal('(-2)^5', ['-10', '-32', '32']),
  [K(1, 3, 'q1')]: R(EXP(5, '5^3*5^4')),
  [K(1, 3, 'q2')]: R(EXP(7, '7^9/7^4')),
  [K(1, 3, 'q3')]: R(EXP(2, '(2^3)^4')),
  [K(1, 3, 'q4')]: R(EXP(3, '3^-2*3^5')),
  [K(1, 4, 'q1')]: R(V('(2/3)^3')),
  [K(1, 4, 'q2')]: R(V('(-1/2)^4')),
  [K(1, 4, 'q3')]: R(V('5^0')),
  [K(1, 4, 'q4')]: R(V('(3/4)^-1')),
  [K(1, 5, 'q1')]: R(EXP(2, '2^4*2^7')),
  [K(1, 5, 'q2')]: R(EXP(9, '9^6*9^-10')),
  [K(1, 5, 'q3')]: R(EXP(6, '6^3*6^2*6^5')),
  [K(1, 5, 'q4')]: (() => { if (BASE(4, '3^4*5^4') !== 15) throw new Error('base'); return pickVal('3^4*5^4', ['15^4', '15^8', '8^4', '15^16']); })(),
  [K(1, 6, 'q1')]: R(V('2*3^2')),
  [K(1, 6, 'q2')]: R(V('(2*3)^2')),
  [K(1, 6, 'q3')]: R(V('10-2^3')),
  [K(1, 6, 'q4')]: R(V('5+2^2*3')),
  // tableau : (−2)^n = −32 ; a^-1 = 0,25 ; 11^n = 1 ; (−3)^4
  [K(1, 7, 'q1')]: R(EXP(-2, '-32')),
  [K(1, 7, 'q2')]: (() => { const hits = []; for (let a = -100; a <= 100; a++) if (a !== 0 && evaluate(`(${a})^-1`).eq(evaluate('0.25'))) hits.push(a); if (hits.length !== 1) throw new Error('a'); return R(hits[0]); })(),
  [K(1, 7, 'q3')]: R(EXP(11, '1')),
  [K(1, 7, 'q4')]: R(V('(-3)^4')),
  [K(1, 8, 'q1')]: R(V('4^-2')),
  [K(1, 8, 'q2')]: R(V('(-2)^-3')),
  [K(1, 8, 'q3')]: R(V('(1/3)^-2')),
  [K(1, 8, 'q4')]: R(V('7^0+7^1')),
  [K(1, 9, 'q1')]: pickVal('(5^2)^4', ['5^8', '5^6', '40']),
  [K(1, 9, 'q2')]: pickVal('3^5*3^5', ['9^10', '3^25', '3^10']),
  [K(1, 9, 'q3')]: pickVal('2^10/2', ['2^5', '2^9', '1^10']),
  [K(1, 9, 'q4')]: pickVal('4^7/4^-2', ['4^5', '4^-14', '4^9']),
  [K(1, 10, 'q1')]: R(V('2^5')),
  [K(1, 10, 'q2')]: R(V('2^8')),
  [K(1, 10, 'q3')]: pickVal('2^8/2^5', ['3', '8', '2^40']),

  /* ── Niveau 2 ── */
  [K(2, 1, 'q1')]: R(EXP(3, '(3^-2)^-3')),
  [K(2, 1, 'q2')]: R(EXP(7, '7/7^-2')),
  [K(2, 1, 'q3')]: R(EXP(6, '(2^5)^2*(3^2)^5')),
  [K(2, 2, 'q1')]: R(V('(-2)^6')),
  [K(2, 2, 'q2')]: R(V('-2^6')),
  [K(2, 2, 'q3')]: pick([sign('(-5)^13*(-3)^4') > 0, sign('(-5)^13*(-3)^4') < 0]),
  // la règle (a^m)^n = a^(mn) est la seule des trois options qui rende 25^3 = 5^6 ET 8^4 = 2^12 vrais
  // quand on lit 25 = 5^2 et 8 = 2^3 : on vérifie numériquement chaque lecture.
  [K(2, 3, 'q1')]: pick([
    evaluate('(5^2)^3').eq(evaluate('5^(2*3)')) && evaluate('25^3').eq(evaluate('5^6')),
    evaluate('5^2*5^3').eq(evaluate('25^3')),
    false, // option C, la règle du quotient : il n'y a aucune division dans 25^3 = 5^6 (QCM conceptuel)
  ]),
  [K(2, 3, 'q2')]: R(EXP(3, '27^5')),
  [K(2, 3, 'q3')]: R(EXP(4, '16^3')),
  [K(2, 4, 'q1')]: R(V('(9-2*3)^2')),
  [K(2, 4, 'q2')]: R(V('9-2*3^2')),
  [K(2, 4, 'q3')]: R(V('(9-2)*3^2')),
  [K(2, 4, 'q4')]: R(V('9-(2*3)^2')),
  // 2^5 × 2^n = 2^-1 ; 5^-3 / 5^n = 5^4 ; 12^3 = 3^3 × b^3
  [K(2, 5, 'q1')]: (() => { const h = []; for (let n = -30; n <= 30; n++) if (evaluate(`2^5*2^(${n})`).eq(evaluate('2^-1'))) h.push(n); return R(h[0]); })(),
  [K(2, 5, 'q2')]: (() => { const h = []; for (let n = -30; n <= 30; n++) if (evaluate(`5^-3/5^(${n})`).eq(evaluate('5^4'))) h.push(n); return R(h[0]); })(),
  [K(2, 5, 'q3')]: (() => { const h = []; for (let b = 1; b <= 50; b++) if (evaluate(`3^3*${b}^3`).eq(evaluate('12^3'))) h.push(b); return R(h[0]); })(),
  [K(2, 6, 'q1')]: R(V('3^-2')),
  [K(2, 6, 'q2')]: R(V('(-3)^-2')),
  [K(2, 6, 'q3')]: R(V('-3^-2')),
  [K(2, 6, 'q4')]: pick(['(-1)^3', '2026^0', '2026*0'].map((s) => evaluate(s).eq(new Q(1n)))),
  [K(2, 7, 'q1')]: R(EXP(3, '3^20+3^20+3^20')),
  [K(2, 7, 'q2')]: R(EXP(2, '2^40+2^40')),
  [K(2, 7, 'q3')]: R(EXP(4, '4^10+4^10+4^10+4^10')),
  // carré d'aire 7^8 : côté 7^n avec (7^n)^2 = 7^8 ; cube de volume 2^18 : arête 2^n avec (2^n)^3 = 2^18
  [K(2, 8, 'q1')]: (() => { const h = []; for (let n = -30; n <= 30; n++) if (evaluate(`(7^(${n}))^2`).eq(evaluate('7^8'))) h.push(n); return R(h[0]); })(),
  [K(2, 8, 'q2')]: (() => { const h = []; for (let n = -30; n <= 30; n++) if (evaluate(`(2^(${n}))^3`).eq(evaluate('2^18'))) h.push(n); return R(h[0]); })(),
  [K(2, 8, 'q3')]: (() => { for (let c = 1; c <= 1000; c++) if (evaluate(`${c}^3`).eq(evaluate('2^18'))) return R(c); throw new Error('arête'); })(),
  [K(2, 8, 'q4')]: (() => { for (let c = 1; c <= 1000; c++) if (evaluate(`${c}^3`).eq(evaluate('2^18'))) return R(V(`12*${c}`)); throw new Error('arête'); })(),
  [K(2, 9, 'q1')]: R(V('0.5^4*8^4')),
  [K(2, 9, 'q2')]: R(V('(2/5)^3')),
  [K(2, 9, 'q3')]: R(V('(-3/2)^4')),
  [K(2, 9, 'q4')]: R(V('6^5/3^5')),
  [K(2, 10, 'q1')]: pickVal('-2*5^2', ['100', '-50', '-20']),
  [K(2, 10, 'q2')]: R(V('-3*(-2)^3')),
  [K(2, 10, 'q3')]: R(V('(-3*2)^2')),

  /* ── Niveau 3 ── */
  [K(3, 1, 'q1')]: R(EXP(5, '(5^-2)^-3')),
  [K(3, 1, 'q2')]: R(EXP(13, '13/13^-2')),
  [K(3, 1, 'q3')]: R(V('4*5^2-3*2^3+[1+(-3)^2]^2')),
  [K(3, 2, 'q1')]: letter(1), // l'ordre : les puissances d'abord (règle du programme, option B)
  [K(3, 2, 'q2')]: R(V('3+4^2*2-5*2+1')),
  [K(3, 2, 'q3')]: R(V('6-2^2*(-3)+(-1)^5*4')),
  [K(3, 3, 'q1')]: R(EXP(7, '49')),
  [K(3, 3, 'q2')]: R(EXP(7, '49*7^5')),
  [K(3, 3, 'q3')]: R(EXP(7, '7^9*7^-6')),
  [K(3, 3, 'q4')]: R(EXP(7, '49*7^5/(7^9*7^-6)')),
  [K(3, 3, 'q5')]: R(V('49*7^5/(7^9*7^-6)')),
  [K(3, 4, 'q1')]: R(EXP(2, '8*2^4/(32*2^-3)')),
  [K(3, 4, 'q2')]: R(V('(4+2^3)*3-3^2+1/2^-4')),
  [K(3, 4, 'q3')]: R(V('(5^2-9)*3-2^3+3^1')),
  [K(3, 5, 'q1')]: R(EXP(2, '(2^3)^2')),
  [K(3, 5, 'q2')]: R(V('1.5*2^2')),
  [K(3, 5, 'q3')]: R(V('3^4-[(2^3)^2+1.5*2^2]+7')),
  [K(3, 6, 'q1')]: R(V('3^8*3^-2/(3^2)^3')),
  [K(3, 6, 'q2')]: R(V('5^6*5/(7-2)^5')),
  [K(3, 6, 'q3')]: R(V('(2-5)^3/(12-3*1)*2')),
  [K(3, 7, 'q1')]: R(V('(2/3)^2')),
  [K(3, 7, 'q2')]: R(V('5/6*2/15')),
  [K(3, 7, 'q3')]: R(V('(2/3)^2-5/6*2/15')),
  [K(3, 8, 'q1')]: R(V('2^-1+2^-2+2^0')),
  [K(3, 8, 'q2')]: R(V('(-2)^3*2^-2')),
  [K(3, 9, 'q1')]: R(EXP(2, '2^7/(2*4^2)')),
  [K(3, 9, 'q2')]: R(EXP(3, '9^4/(3*27)')),
  [K(3, 9, 'q3')]: R(EXP(5, '25^2*5^-3')),
  [K(3, 10, 'q1')]: R(EXP(2, '2^5*4/(2*2^3)')),
  [K(3, 10, 'q2')]: R(EXP(3, '3^4*27/3^9')),
  [K(3, 10, 'q3')]: R(EXP(5, '5^2*125/(5*5^3)')),
  [K(3, 10, 'q4')]: R(V('2^5*4/(2*2^3)')),

  /* ── Niveau 4 ── */
  [K(4, 1, 'q1')]: R(V('2+3^2*4-6*2+1')),
  [K(4, 1, 'q2')]: R(V('5-2^3*(-1)+(-2)^3*2')),
  [K(4, 1, 'q3')]: R(V('(14/15)/(-7/10)')),
  [K(4, 1, 'q4')]: R(V('5/2-5/2*6/25')),
  [K(4, 2, 'q1')]: R(V('(1/3-5/6)/(3/4)')),
  [K(4, 2, 'q2')]: R(EXP(2, '(2^2)^3')),
  [K(4, 2, 'q3')]: R(V('3^5-[(2^2)^3+0.5*2^4]+9')),
  [K(4, 3, 'q1')]: R(V('(-1/2)^3')),
  [K(4, 3, 'q2')]: R(V('3/4*5/6')),
  [K(4, 3, 'q3')]: R(V('(-1/2)^3+3/4*5/6')),
  [K(4, 3, 'q4')]: R(V('((-1/2)^3+3/4*5/6)^-1')),
  [K(4, 4, 'q1')]: R(EXP(3, '9*3^4/(27*3^-2)')),
  [K(4, 4, 'q2')]: R(EXP(10, '10^4*10^-3/((10^2)^-2*10^6)')),
  [K(4, 4, 'q3')]: R(V('(1+2^2)*4-3^2+1/3^-1')),
  [K(4, 4, 'q4')]: R(V('(3^2-2)*2-2^2+4^1')),
  [K(4, 5, 'q1')]: R(V('2^9*2^-3/(2^2)^3')),
  [K(4, 5, 'q2')]: R(V('3^4*3^3/(5-2)^5')),
  [K(4, 5, 'q3')]: R(V('3.5*2+9')),
  [K(4, 5, 'q4')]: R(V('(2-6)^3/(3.5*2+9)*3')),
  [K(4, 5, 'q5')]: R(V('2^-2-3^-1')),
  [K(4, 6, 'q1')]: R(EXP(10, '10^2*10^-5*1000^2')),
  [K(4, 6, 'q2')]: R(EXP(5, '(5^-2)^3')),
  [K(4, 6, 'q3')]: R(EXP(9, '9/9^-3')),
  [K(4, 6, 'q4')]: R(EXP(10, '(2^4)^3*(5^6)^2')),
  [K(4, 6, 'q5')]: R(V('12.5*10^2-2*5^2+[1+(-2)^3]^2')),
  // E = 1,5 × 10^-4 × 0,06 = 9 × 10^n
  [K(4, 7, 'q1')]: R(EXP(10, '1.5*10^-4*0.06/9')),
  [K(4, 7, 'q2')]: R(EXP(2, '16*2^5')),
  [K(4, 7, 'q3')]: R(EXP(2, '16*2^5/(2^10*2^-6)')),
  [K(4, 7, 'q4')]: R(V('16*2^5/(2^10*2^-6)')),
  [K(4, 8, 'q1')]: R(V('(-2/3)^2')),
  [K(4, 8, 'q2')]: R(V('(1/2)^-1')),
  [K(4, 8, 'q3')]: R(V('4/9*9/8')),
  [K(4, 8, 'q4')]: R(V('(-2/3)^2*9/8-(1/2)^-1')),
  [K(4, 9, 'q1')]: R(V('(3+1)^2/8')),
  [K(4, 9, 'q2')]: R(V('27/(7-4)^2')),
  [K(4, 9, 'q3')]: R(V('40/(4*6-4^2)')),
  [K(4, 9, 'q4')]: R(V('(6^2-4*7)^2/(20-2^4)')),
  [K(4, 9, 'q5')]: R(V('-2*(-3)^2-(-4)^3/8')),
  [K(4, 10, 'q1')]: R(EXP(10, '2^6*5^6')),
  [K(4, 10, 'q2')]: R(V('2^7*5^5')),
  [K(4, 10, 'q3')]: R(V('2^7*5^5/10^5')),
  [K(4, 10, 'q4')]: R(V('0.5*2^5*5^5')),

  /* ── Niveau 5 ── */
  // l5-001 : 3^n nouveaux bénévoles la semaine n ; objectif : plus de 2000
  [K(5, 1, 'q1')]: R(V('3^4')),
  [K(5, 1, 'q2')]: R(V('3^6')),
  [K(5, 1, 'q3')]: R(V('3^6/3^4')),
  [K(5, 1, 'q4')]: R(V('3^1+3^2+3^3+3^4')),
  [K(5, 1, 'q5')]: (() => { let w = 1; while (!lt('2000', `3^${w}`)) w++; return pick([w === 6, w === 7, w === 8]); })(),
  // l5-002 : 2^6 × 2^n bactéries ; un lavage divise par 2^7 ; objectif < 10
  [K(5, 2, 'q1')]: R(V('2^6*2^3')),
  [K(5, 2, 'q2')]: R(EXP(2, '2^6*2^9')),
  [K(5, 2, 'q3')]: R(V('2^6*2^9/2^7')),
  [K(5, 2, 'q4')]: R(V('2^6*2^9/2^7/2^7')),
  [K(5, 2, 'q5')]: (() => { const two = lt('2^6*2^9/2^7/2^7', '10'); const one = lt('2^6*2^9/2^7', '10'); return pick([two && !one, !two]); })(),
  // l5-003 : le tableau (retapé plus haut) est-il magique ?
  [K(5, 3, 'q1')]: R(EXP(2, '1/2')),
  [K(5, 3, 'q2')]: R(EXP(2, '1')),
  [K(5, 3, 'q3')]: R(EXP(2, '16')),
  [K(5, 3, 'q4')]: R(prod(MAGIC[0])),
  [K(5, 3, 'q5')]: R(EXP(2, prod(MAGIC.map((r) => r[0])))),
  [K(5, 3, 'q6')]: R(prod([MAGIC[0][0], MAGIC[1][1], MAGIC[2][2]])),
  [K(5, 3, 'q7')]: (() => { const ps = magicLines.map(prod); if (magicLines.length !== 8) throw new Error('8 lignes'); const magic = ps.every((p) => p === ps[0]) && ps[0] === V('2^3'); return pick([magic, !magic]); })(),
  // l5-004 : 2^(n−1) grains dans la case n ; un grain pèse 2^-5 g ; sac de 25 kg
  [K(5, 4, 'q1')]: R(V('2^(11-1)')),
  [K(5, 4, 'q2')]: R(EXP(2, '2^(21-1)/2^(11-1)')),
  [K(5, 4, 'q3')]: R(V('2^0+2^1+2^2+2^3+2^4')),
  [K(5, 4, 'q4')]: R(EXP(2, '2^(21-1)*2^-5')),
  [K(5, 4, 'q5')]: R(V('2^(21-1)*2^-5')),
  [K(5, 4, 'q6')]: (() => { const over = lt('25*1000', '2^(21-1)*2^-5'); return pick([over, !over]); })(),
  // l5-005 : épaisseur 0,1 × 2^n mm ; longueur 64 × 2^-n cm
  [K(5, 5, 'q1')]: R(V('0.1*2^5')),
  [K(5, 5, 'q2')]: R(V('0.1*2^10')),
  [K(5, 5, 'q3')]: R(V('(0.1*2^10)/(0.1*2^5)')),
  [K(5, 5, 'q4')]: R(V('64*2^-6')),
  [K(5, 5, 'q5')]: R(V('64*2^-8')),
  [K(5, 5, 'q6')]: (() => { const ep = evaluate('0.1*2^8/10'); const lo = evaluate('64*2^-8'); const c = ep.cmp(lo); return pick([c > 0, c < 0, c === 0]); })(), // mm → cm
  // l5-006 : cube d'arête 2^3 dm ; 2^2 familles ; 2^7 L par jour ; remplissage tous les 2 jours
  [K(5, 6, 'q1')]: R(EXP(2, '(2^3)^3')),
  [K(5, 6, 'q2')]: R(V('(2^3)^3')),
  [K(5, 6, 'q3')]: R(V('(2^3)^3/2^2')),
  [K(5, 6, 'q4')]: R(V('(2^3)^3/2^2/2^7')),
  [K(5, 6, 'q5')]: (() => { const days = evaluate('(2^3)^3/2^2/2^7'); const enough = days.cmp(new Q(2n)) >= 0; return pick([enough, !enough]); })(),
  // l5-007 : (−2)^n points à la manche n
  [K(5, 7, 'q1')]: R(V('(-2)^5')),
  [K(5, 7, 'q2')]: R(V('(-2)^6')),
  [K(5, 7, 'q3')]: pick([sign('(-2)^11') > 0, sign('(-2)^11') < 0]),
  [K(5, 7, 'q4')]: R(V('(-2)^1+(-2)^2+(-2)^3+(-2)^4')),
  [K(5, 7, 'q5')]: R(V('(-2)^5+(-2)^6')),
  [K(5, 7, 'q6')]: (() => { const c = evaluate('(-2)^1+(-2)^2+(-2)^3+(-2)^4').cmp(evaluate('(-2)^5+(-2)^6')); return pick([c > 0, c < 0, c === 0]); })(),
  // l5-008 : 64 × 2^-n mg après n périodes de 6 h ; nouvelle dose quand < 2^3
  [K(5, 8, 'q1')]: R(EXP(2, '64')),
  [K(5, 8, 'q2')]: R(V('64*2^-(24/6)')),
  [K(5, 8, 'q3')]: R(V('64*2^-(48/6)')),
  [K(5, 8, 'q4')]: R(V('64*2^-(18/6)')),
  [K(5, 8, 'q5')]: (() => { let n = 0; while (!lt(`64*2^-${n}`, '2^3')) n++; const h = n * 6; return pick([h === 12, h === 18, h === 24]); })(),
  // l5-009 : arêtes 6, 3 et 12 cm ; 70 petites boîtes
  [K(5, 9, 'q1')]: R(V('6^3')),
  [K(5, 9, 'q2')]: R(V('6^3/3^3')),
  [K(5, 9, 'q3')]: R(V('6^2/3^2')),
  [K(5, 9, 'q4')]: R(V('12^3/3^3')),
  [K(5, 9, 'q5')]: (() => { const fits = !lt('12^3/3^3', '70'); return pick([fits, !fits]); })(),
  // l5-010 : côté 2^5 m, carreaux 2^-1 m, 2^4 carreaux par boîte à 5^4 DA ; budget 150000
  [K(5, 10, 'q1')]: R(EXP(2, '(2^5)^2')),
  [K(5, 10, 'q2')]: R(V('2^5/2^-1')),
  [K(5, 10, 'q3')]: R(V('(2^5/2^-1)^2')),
  [K(5, 10, 'q4')]: R(V('(2^5/2^-1)^2/2^4')),
  [K(5, 10, 'q5')]: R(V('(2^5/2^-1)^2/2^4*5^4')),
  [K(5, 10, 'q6')]: (() => { const cost = evaluate('(2^5/2^-1)^2/2^4*5^4'); const gap = cost.sub(evaluate('150000')); return pick([gap.cmp(new Q(0n)) <= 0, gap.eq(evaluate('10000'))]); })(),
};
