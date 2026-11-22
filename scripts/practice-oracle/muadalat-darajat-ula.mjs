// Oracle du banc « muadalat-darajat-ula » (المعادلات من الدرجة الأولى بمجهول واحد, 3AM, 2026-10-21) — feuilles d'examen de
// فصل (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec un calcul écrit dans ce fichier (rationnels
// EXACTS en BigInt), indépendant de packages/core :
//  - une équation de l'énoncé est RETAPÉE dans une petite syntaxe (`2x+1=3x-5`, `(3/4)x-2=5`, `(24-x)*150=3000`) et
//    analysée en formes affines a·x + b à coefficients rationnels ; SOLR la résout (solution unique x0 = (d−b)/(a−c)) ;
//  - HOLDS / TESTYN : un nombre est solution si et seulement si les DEUX membres, calculés séparément, sont égaux ;
//  - DERIVE : applique à l'équation de départ les opérations de la question (ajouter, retrancher, multiplier, diviser les
//    DEUX membres) et rend, pour chaque option, si elle est l'équation obtenue (forme par forme) ;
//  - EQT : « quelle équation traduit l'énoncé ? » — l'énoncé est REJOUÉ (FIND : recherche exhaustive du nombre qui
//    vérifie le texte, écrite avec l'arithmétique brute), puis chaque option est évaluée en ce nombre : une seule est vraie ;
//  - KIND : « équation du premier degré ? » (pas de signe =, puissance 2, ou premier degré) ;
//  - les problèmes en mots recalculent leurs données avec l'arithmétique brute (ou V = rationnels exacts) ;
//    les QCM de décision évaluent chaque option par un calcul.
// Les questions selfCheck (« برّر », « تحقّق ») n'ont pas de clé et ne figurent pas ici.
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
  eq(o) { return this.n === o.n && this.d === o.d; }
  isZero() { return this.n === 0n; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
const ZERO = new Q(0n); const ONE = new Q(1n);
const dec = (s) => { const [i, f = ''] = s.split('.'); return new Q(BigInt(i + f), 10n ** BigInt(f.length)); };

/* ── forme affine a·v + b ───────────────────────────────────────────────────── */
class Lin {
  constructor(a, b) { this.a = a; this.b = b; }
  add(o) { return new Lin(this.a.add(o.a), this.b.add(o.b)); }
  sub(o) { return new Lin(this.a.sub(o.a), this.b.sub(o.b)); }
  scale(k) { return new Lin(this.a.mul(k), this.b.mul(k)); }
  at(x) { return this.a.mul(x).add(this.b); }
  eq(o) { return this.a.eq(o.a) && this.b.eq(o.b); }
}
/** expr = terme ((+|−) terme)* ; terme = [−] facteur ((*|/) facteur | facteur-collé)* ; facteur = nombre | variable | (expr) */
function parseLin(src, v = 'x') {
  const t = src.replace(/\s+/g, ''); let i = 0;
  const peek = () => t[i];
  const mulLin = (u, w) => { if (u.a.isZero()) return w.scale(u.b); if (!w.a.isZero()) throw new Error(`non affine : ${src}`); return u.scale(w.b); };
  const expr = () => { let r = term(); while (peek() === '+' || peek() === '-') { const op = t[i++]; const w = term(); r = op === '+' ? r.add(w) : r.sub(w); } return r; };
  const term = () => {
    let neg = false; if (peek() === '-') { neg = true; i++; }
    let r = factor();
    for (;;) {
      const p = peek();
      if (p === '*') { i++; r = mulLin(r, factor()); }
      else if (p === '/') { i++; const w = factor(); if (!w.a.isZero() || w.b.isZero()) throw new Error(`division invalide : ${src}`); r = r.scale(ONE.div(w.b)); }
      else if (p === '(' || p === v || (p !== undefined && /\d/.test(p))) r = mulLin(r, factor());
      else break;
    }
    return neg ? r.scale(new Q(-1n)) : r;
  };
  const factor = () => {
    const p = peek();
    if (p === '(') { i++; const r = expr(); if (t[i++] !== ')') throw new Error(`« ) » attendu : ${src}`); return r; }
    if (p === v) { i++; return new Lin(ONE, ZERO); }
    const m = /^\d+(\.\d+)?/.exec(t.slice(i)); if (!m) throw new Error(`lecture impossible à ${i} dans ${src}`);
    i += m[0].length; return new Lin(ZERO, dec(m[0]));
  };
  const r = expr(); if (i !== t.length) throw new Error(`reste « ${t.slice(i)} » dans ${src}`); return r;
}
const parseEq = (s, v) => { const parts = s.split('='); if (parts.length !== 2) throw new Error(`égalité attendue : ${s}`); return [parseLin(parts[0], v), parseLin(parts[1], v)]; };
const num = (s) => parseLin(String(s), '§').b;                       // un nombre « -3/2 », « 0.5 »
const solveQ = (eq, v = 'x') => { const [l, r] = parseEq(eq, v); const d = l.sub(r); if (d.a.isZero()) throw new Error(`pas de solution unique : ${eq}`); return d.b.neg().div(d.a); };
/** x0 de l'équation, en chaîne exacte. */
const X0 = (eq, v = 'x') => solveQ(eq, v).toString();
const SOLR = (eq, v = 'x') => R(X0(eq, v));
/** valeur d'une expression en un nombre. */
const VALR = (expr, at, v = 'x') => R(parseLin(expr, v).at(num(at)).toString());
/** nombre `at` solution de `eq` : les DEUX membres calculés séparément sont égaux. */
const HOLDS = (eq, at, v = 'x') => {
  try { const [l, r] = parseEq(eq, v); return l.at(num(at)).eq(r.at(num(at))); } catch (e) {
    if (!/non affine/.test(String(e.message))) throw e;
    // une option NON affine (produit de deux expressions en x, jamais l'équation juste) : évaluation numérique des deux membres
    const ev = (side) => new Function(v, `return ${side.replace(/(\d|\))(\(|[a-z])/g, '$1*$2').replace(/\)\(/g, ')*(')};`);
    const [a, b] = eq.split('='); const x = Number(num(at).n) / Number(num(at).d);
    return Math.abs(ev(a)(x) - ev(b)(x)) < 1e-9;
  }
};
const VAL = (expr, at, v = 'x') => parseLin(expr, v).at(num(at)).toString();
/** Arithmétique pure en rationnels exacts (« 3/4-5/6 »). */
const V = (s) => { const r = parseLin(s, '§'); if (!r.a.isZero()) throw new Error(s); return r.b.toString(); };

/** QCM : la seule option vraie (les drapeaux sont CALCULÉS par l'appelant). */
const PICK = (flags) => {
  const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`QCM : ${hits.length} options justes`);
  return C('ABCDEF'[hits[0]]);
};
/** Recherche exhaustive d'un nombre p/den dans [lo, hi] vérifiant `pred` (rejoue un énoncé sans équation). */
const FIND = (pred, lo, hi, den = 1) => {
  const hits = [];
  for (let p = lo * den; p <= hi * den; p++) if (pred(p / den)) hits.push(p);
  if (hits.length !== 1) throw new Error(`FIND : ${hits.length} solutions`);
  return new Q(BigInt(hits[0]), BigInt(den)).toString();
};
/** « quelle équation traduit l'énoncé ? » : chaque option évaluée en x0 (le nombre trouvé en rejouant l'énoncé). */
const EQT = (eqs, x0, v = 'x') => eqs.map((e) => HOLDS(e, x0, v));
/** options NUMÉRIQUES comparées à la solution. */
const NUMEQ = (eq, opts, v = 'x') => opts.map((o) => solveQ(eq, v).eq(num(o)));
/** classification : 'none' (pas de =), 'deg2' (puissance), 'first'. */
const KIND = (s) => {
  if (!s.includes('=')) return 'none';
  if (/\^|xx|x\*x/.test(s)) return 'deg2';
  const [l, r] = parseEq(s, 'x'); return l.sub(r).a.isZero() ? 'degenerate' : 'first';
};
const KINDS = (s, kinds) => kinds.map((k) => KIND(s) === k);

const applyOp = ([l, r], [kind, c], v) => {
  const k = parseLin(c, v);
  if (kind === 'add') return [l.add(k), r.add(k)];
  if (kind === 'sub') return [l.sub(k), r.sub(k)];
  const n = num(c);
  if (kind === 'mul') return [l.scale(n), r.scale(n)];
  if (kind === 'div') return [l.scale(ONE.div(n)), r.scale(ONE.div(n))];
  throw new Error(kind);
};
/** « quelle équation obtient-on en… » : pour chaque option, ses deux membres sont-ils exactement ceux de l'équation transformée ? */
const DERIVE = (base, ops, options, v = 'x') => {
  let cur = parseEq(base, v); for (const op of ops) cur = applyOp(cur, op, v);
  return options.map((o) => { const [l, r] = parseEq(o, v); return l.eq(cur[0]) && r.eq(cur[1]); });
};
/** identité polynomiale (valeurs entières) : quelles options sont égales à `expr` pour tout x testé ? */
const POLYSAME = (expr, options) => {
  const f = (s) => new Function('x', `return ${s.replace(/\^/g, '**').replace(/(\d)\s*x/g, '$1*x').replace(/(\d)\s*\(/g, '$1*(').replace(/\)\s*\(/g, ')*(')};`);
  const g = f(expr);
  return options.map((o) => { const h = f(o); return [-3, -2, -1, 0, 1, 2, 3, 5].every((x) => g(x) === h(x)); });
};

export const ORACLE = {
  'ex-3am-muadalat-darajat-ula-l1-001:q1': PICK(((a)=>[a[1],a[2],a[0]])(KINDS("5x+2=3x-8",["first", "deg2", "none"]))),
  'ex-3am-muadalat-darajat-ula-l1-001:q2': PICK(((a)=>[a[1],a[0],a[2]])(KINDS("x^2+1=5",["deg2", "first", "none"]))),
  'ex-3am-muadalat-darajat-ula-l1-001:q3': PICK(((a)=>[a[0],a[1],a[2]])(KINDS("4y-3",["none", "first", "deg2"]))),
  'ex-3am-muadalat-darajat-ula-l1-001:q4': PICK(((a)=>[a[1],a[2],a[0]])(KINDS("x/2+3=1-x",["first", "deg2", "none"]))),
  'ex-3am-muadalat-darajat-ula-l1-003:q1': PICK(((a)=>[a[0],a[1]])([(HOLDS("4x-7=x+2","3","x")), !(HOLDS("4x-7=x+2","3","x"))])),
  'ex-3am-muadalat-darajat-ula-l1-003:q2': PICK(((a)=>[a[1],a[0]])([!(HOLDS("5x-4=2x+8","3","x")), (HOLDS("5x-4=2x+8","3","x"))])),
  'ex-3am-muadalat-darajat-ula-l1-003:q3': PICK(((a)=>[a[0],a[1]])([(HOLDS("-m+3=2m+9","-2","m")), !(HOLDS("-m+3=2m+9","-2","m"))])),
  'ex-3am-muadalat-darajat-ula-l1-003:q4': PICK(((a)=>[a[1],a[0]])([!(HOLDS("x/2+1=x/4+3","4","x")), (HOLDS("x/2+1=x/4+3","4","x"))])),
  'ex-3am-muadalat-darajat-ula-l1-004:q1': VALR('3x-5','4'),
  'ex-3am-muadalat-darajat-ula-l1-004:q2': VALR('x+7','4'),
  'ex-3am-muadalat-darajat-ula-l1-004:q3': R(V(VAL('3x-5','6')+'-('+VAL('x+7','6')+')')),
  'ex-3am-muadalat-darajat-ula-l1-004:q4': VALR('5y-9','-2','y'),
  'ex-3am-muadalat-darajat-ula-l1-005:q1': SOLR("x-7=3","x"),
  'ex-3am-muadalat-darajat-ula-l1-005:q2': SOLR("x+8=-2","x"),
  'ex-3am-muadalat-darajat-ula-l1-005:q3': SOLR("6x=15","x"),
  'ex-3am-muadalat-darajat-ula-l1-005:q4': SOLR("-3x=12","x"),
  'ex-3am-muadalat-darajat-ula-l1-006:q1': PICK(((a)=>[a[1],a[0],a[2]])(NUMEQ("5x+2=2x-7",["-3", "-5/3", "3"],"x"))),
  'ex-3am-muadalat-darajat-ula-l1-006:q2': PICK(((a)=>[a[0],a[1],a[2]])(NUMEQ("4x-3=-x+12",["3", "-3", "5"],"x"))),
  'ex-3am-muadalat-darajat-ula-l1-006:q3': PICK(((a)=>[a[0],a[1],a[2]])(NUMEQ("x/2+3=x-1",["8", "-8", "-4"],"x"))),
  'ex-3am-muadalat-darajat-ula-l1-007:q1': PICK(((a)=>[a[0],a[1],a[2]])(EQT(["2x+5=17", "2(x+5)=17", "2x-5=17"],FIND((n)=>2*n+5===17,0,50),"x"))),
  'ex-3am-muadalat-darajat-ula-l1-007:q2': PICK(((a)=>[a[1],a[0],a[2]])(EQT(["3x-8=19", "8-3x=19", "3(x-8)=19"],FIND((n)=>3*n-8===19,0,50),"x"))),
  'ex-3am-muadalat-darajat-ula-l1-007:q3': PICK(((a)=>[a[1],a[0],a[2]])(EQT(["x+(x+7)=31", "x+7=31", "x+(x-7)=31"],FIND((n)=>n+(n+7)===31,0,50),"x"))),
  'ex-3am-muadalat-darajat-ula-l1-007:q4': PICK(((a)=>[a[1],a[2],a[0]])(EQT(["3x+50=500", "3x-50=500", "x+3+50=500"],FIND((n)=>3*n+50===500,0,500),"x"))),
  'ex-3am-muadalat-darajat-ula-l1-009:q1': SOLR("9x-5=4x+10","x"),
  'ex-3am-muadalat-darajat-ula-l1-009:q2': SOLR("-3x+8=2x-12","x"),
  'ex-3am-muadalat-darajat-ula-l1-010:q1': SOLR('4x=3600'),
  'ex-3am-muadalat-darajat-ula-l1-010:q2': SOLR('3x=2400'),
  'ex-3am-muadalat-darajat-ula-l1-010:q3': SOLR('x+(x+6)=20'),
  'ex-3am-muadalat-darajat-ula-l2-001:q1': PICK(((a)=>[a[1],a[0]])([!(HOLDS("x/2-3=x/4-2","6","x")), (HOLDS("x/2-3=x/4-2","6","x"))])),
  'ex-3am-muadalat-darajat-ula-l2-001:q2': SOLR("x/2-3=x/4-2","x"),
  'ex-3am-muadalat-darajat-ula-l2-002:q1': VALR('4x-3','5'),
  'ex-3am-muadalat-darajat-ula-l2-002:q2': VALR('2x+7','5'),
  'ex-3am-muadalat-darajat-ula-l2-002:q3': PICK(((a)=>[a[0],a[1]])([(HOLDS("4x-3=2x+7","5","x")), !(HOLDS("4x-3=2x+7","5","x"))])),
  'ex-3am-muadalat-darajat-ula-l2-003:q1': SOLR("7x+4=3x-12","x"),
  'ex-3am-muadalat-darajat-ula-l2-003:q2': VALR('7x+4','-4'),
  'ex-3am-muadalat-darajat-ula-l2-003:q3': PICK(((a)=>[a[0],a[1]])([(HOLDS("4x=-16","-4","x")), !(HOLDS("4x=-16","-4","x"))])),
  'ex-3am-muadalat-darajat-ula-l2-004:q1': SOLR('4(x-3)=x+6'),
  'ex-3am-muadalat-darajat-ula-l2-004:q2': SOLR('(-5x+1)/3=-8'),
  'ex-3am-muadalat-darajat-ula-l2-005:q1': PICK(((a)=>[a[0],a[1],a[2]])(KINDS("4x-6=0",["first", "deg2", "none"]))),
  'ex-3am-muadalat-darajat-ula-l2-005:q2': SOLR("4x-6=0","x"),
  'ex-3am-muadalat-darajat-ula-l2-005:q3': SOLR("3x+2=-x+8","x"),
  'ex-3am-muadalat-darajat-ula-l2-005:q4': PICK(((a)=>[a[0],a[1]])([(X0('4x-6=0')===X0('3x+2=-x+8')), !(X0('4x-6=0')===X0('3x+2=-x+8'))])),
  'ex-3am-muadalat-darajat-ula-l2-005:q5': PICK(((a)=>[a[1],a[0]])([!(X0('5x+1=0')===X0('2x-3=x-4')), (X0('5x+1=0')===X0('2x-3=x-4'))])),
  'ex-3am-muadalat-darajat-ula-l2-006:q1': VALR('4x+3','-1/2'),
  'ex-3am-muadalat-darajat-ula-l2-006:q2': VALR('-6x-2','-1/2'),
  'ex-3am-muadalat-darajat-ula-l2-006:q3': PICK(((a)=>[a[0],a[1]])([(HOLDS("4x+3=-6x-2","-1/2","x")), !(HOLDS("4x+3=-6x-2","-1/2","x"))])),
  'ex-3am-muadalat-darajat-ula-l2-006:q4': PICK(((a)=>[a[1],a[0]])([!(HOLDS("4x+3=-6x-2","1/2","x")), (HOLDS("4x+3=-6x-2","1/2","x"))])),
  'ex-3am-muadalat-darajat-ula-l2-007:q1': SOLR("1.5x-2=0.5x+3","x"),
  'ex-3am-muadalat-darajat-ula-l2-007:q2': VALR('1.5x-2','5'),
  'ex-3am-muadalat-darajat-ula-l2-007:q3': SOLR("0.4x+1.2=2x-2","x"),
  'ex-3am-muadalat-darajat-ula-l2-008:q1': PICK(((a)=>[a[1],a[0],a[2]])(KINDS("-5x-4=3x+12",["first", "deg2", "none"]))),
  'ex-3am-muadalat-darajat-ula-l2-008:q2': SOLR("-3x+7=2x-8","x"),
  'ex-3am-muadalat-darajat-ula-l2-008:q3': SOLR("-5x-4=3x+12","x"),
  'ex-3am-muadalat-darajat-ula-l2-008:q4': PICK(((a)=>[a[1],a[0],a[2]])(DERIVE('-3x+7=2x-8',[['add','3x']],['7=5x-8','7=2x-8','-6x+7=2x-8']))),
  'ex-3am-muadalat-darajat-ula-l2-009:q1': PICK(((a)=>[a[1],a[0]])([!(HOLDS('4(x+1/2)=3x+18-7x','-1')), (HOLDS('4(x+1/2)=3x+18-7x','-1'))])),
  'ex-3am-muadalat-darajat-ula-l2-009:q2': SOLR('4(x+1/2)=3x+18-7x'),
  'ex-3am-muadalat-darajat-ula-l2-010:q1': SOLR("x+2.5=7.9","x"),
  'ex-3am-muadalat-darajat-ula-l2-010:q2': SOLR("-18x=54","x"),
  'ex-3am-muadalat-darajat-ula-l2-010:q3': SOLR("-x/4=3","x"),
  'ex-3am-muadalat-darajat-ula-l2-010:q4': SOLR("9x+5=2x+12","x"),
  'ex-3am-muadalat-darajat-ula-l3-001:q1': PICK(((a)=>[a[1],a[2],a[0]])(EQT(["2x+x=18", "2x=18", "x+2=18"],FIND((n)=>2*n+n===18,0,20),"x"))),
  'ex-3am-muadalat-darajat-ula-l3-001:q2': SOLR('2x+x=18'),
  'ex-3am-muadalat-darajat-ula-l3-001:q3': R(2*Number(X0('2x+x=18'))),
  'ex-3am-muadalat-darajat-ula-l3-002:q1': PICK(((a)=>[a[1],a[2],a[0]])(EQT(["x+(x-1.4)=25.6", "x+(x+1.4)=25.6", "x-1.4=25.6"],FIND((n)=>Math.abs(n+(n-1.4)-25.6)<1e-9,0,20,10),"x"))),
  'ex-3am-muadalat-darajat-ula-l3-002:q2': SOLR('x+(x-1.4)=25.6'),
  'ex-3am-muadalat-darajat-ula-l3-002:q3': R(V('27/2-7/5')),
  'ex-3am-muadalat-darajat-ula-l3-002:q4': SOLR('(25.6+y)/3=12','y'),
  'ex-3am-muadalat-darajat-ula-l3-003:q1': PICK(((a)=>[a[1],a[2],a[0]])(EQT(["x+(x+1)+(x+2)=39", "3x=39", "x+1+2=39"],FIND((n)=>n+(n+1)+(n+2)===39,0,50),"x"))),
  'ex-3am-muadalat-darajat-ula-l3-003:q2': SOLR('x+(x+1)+(x+2)=39'),
  'ex-3am-muadalat-darajat-ula-l3-003:q3': R(String(Number(X0('x+(x+1)+(x+2)=39'))+2)),
  'ex-3am-muadalat-darajat-ula-l3-003:q4': R(39*250),
  'ex-3am-muadalat-darajat-ula-l3-004:q1': PICK(((a)=>[a[1],a[0],a[2]])(EQT(["38+x=3(10+x)", "38+x=30+x", "38=3(10+x)"],FIND((n)=>38+n===3*(10+n),0,60),"x"))),
  'ex-3am-muadalat-darajat-ula-l3-004:q2': SOLR('38+x=3(10+x)'),
  'ex-3am-muadalat-darajat-ula-l3-004:q3': R(String(10+Number(X0('38+x=3(10+x)')))),
  'ex-3am-muadalat-darajat-ula-l3-005:q1': SOLR("(2/3)x+1=x-2","x"),
  'ex-3am-muadalat-darajat-ula-l3-005:q2': VALR('(2/3)x+1','9'),
  'ex-3am-muadalat-darajat-ula-l3-005:q3': SOLR("(x+1)/2=(x-3)/4","x"),
  'ex-3am-muadalat-darajat-ula-l3-006:q1': PICK(((a)=>[a[1],a[2],a[0]])(EQT(["8n+120=12n", "8+120n=12n", "8n+120=12+n"],FIND((n)=>8*n+120===12*n,0,200),"n"))),
  'ex-3am-muadalat-darajat-ula-l3-006:q2': SOLR('8n+120=12n','n'),
  'ex-3am-muadalat-darajat-ula-l3-006:q3': R(8*30+120),
  'ex-3am-muadalat-darajat-ula-l3-007:q1': PICK(((a)=>[a[1],a[0],a[2]])(EQT(["2x+(x+30)+(3x-12)=180", "2x+(x+30)+(3x-12)=90", "2x+(x+30)+(3x-12)=360"],FIND((n)=>2*n+(n+30)+(3*n-12)===180,0,180),"x"))),
  'ex-3am-muadalat-darajat-ula-l3-007:q2': SOLR('2x+(x+30)+(3x-12)=180'),
  'ex-3am-muadalat-darajat-ula-l3-007:q3': R(3*Number(X0('2x+(x+30)+(3x-12)=180'))-12),
  'ex-3am-muadalat-darajat-ula-l3-008:q1': PICK(((a)=>[a[1],a[2],a[0]])(EQT(["2((2x+3)+(x+5))=70", "(2x+3)+(x+5)=70", "2(2x+3)+(x+5)=70"],FIND((n)=>2*((2*n+3)+(n+5))===70,0,60),"x"))),
  'ex-3am-muadalat-darajat-ula-l3-008:q2': SOLR('2((2x+3)+(x+5))=70'),
  'ex-3am-muadalat-darajat-ula-l3-008:q3': R(2*Number(X0('2((2x+3)+(x+5))=70'))+3),
  'ex-3am-muadalat-darajat-ula-l3-008:q4': R(Number(X0('2((2x+3)+(x+5))=70'))+5),
  'ex-3am-muadalat-darajat-ula-l3-009:q1': PICK(((a)=>[a[0],a[1],a[2]])(EQT(["(x+2)+(2x-1)+(x+5)=58", "(x+2)(2x-1)(x+5)=58", "x+2+2x-1=58"],FIND((n)=>(n+2)+(2*n-1)+(n+5)===58,1,60),"x"))),
  'ex-3am-muadalat-darajat-ula-l3-009:q2': SOLR('(x+2)+(2x-1)+(x+5)=58'),
  'ex-3am-muadalat-darajat-ula-l3-009:q3': R(2*Number(X0('(x+2)+(2x-1)+(x+5)=58'))-1),
  'ex-3am-muadalat-darajat-ula-l3-010:q1': PICK(((a)=>[a[0],a[1],a[2]])(EQT(["3(4x)+5x=340", "3x+5(4x)=340", "12x+5=340"],FIND((n)=>3*(4*n)+5*n===340,0,200),"x"))),
  'ex-3am-muadalat-darajat-ula-l3-010:q2': SOLR('3(4x)+5x=340'),
  'ex-3am-muadalat-darajat-ula-l3-010:q3': R(4*Number(X0('3(4x)+5x=340'))),
  'ex-3am-muadalat-darajat-ula-l4-001:q1': PICK(((a)=>[a[1],a[2],a[0]])(POLYSAME('3x*(2x+1)-(x-2)',['6x^2+2x+2','6x^2+2x-2','6x^2+4x+2']))),
  'ex-3am-muadalat-darajat-ula-l4-001:q2': SOLR('2x+2=5x+8'),
  'ex-3am-muadalat-darajat-ula-l4-002:q1': SOLR('(4x-2)/3=2/5'),
  'ex-3am-muadalat-darajat-ula-l4-002:q2': R(23400-20000),
  'ex-3am-muadalat-darajat-ula-l4-002:q3': R(3400*100/20000),
  'ex-3am-muadalat-darajat-ula-l4-003:q1': PICK(((a)=>[a[0],a[1],a[2]])(EQT(["0.85x=3400", "x-15=3400", "1.15x=3400"],FIND((n)=>Math.abs(n*0.85-3400)<1e-6,3000,5000),"x"))),
  'ex-3am-muadalat-darajat-ula-l4-003:q2': SOLR('0.85x=3400'),
  'ex-3am-muadalat-darajat-ula-l4-003:q3': R(Number(X0('0.85x=3400'))*15/100),
  'ex-3am-muadalat-darajat-ula-l4-003:q4': PICK(((a)=>[a[0],a[1]])([(3500>=Number(X0('0.85x=3400'))*0.85), !(3500>=Number(X0('0.85x=3400'))*0.85)])),
  'ex-3am-muadalat-darajat-ula-l4-004:q1': R(Math.sqrt(6*6+8*8)),
  'ex-3am-muadalat-darajat-ula-l4-004:q2': PICK(((a)=>[a[0],a[1],a[2]])(EQT(["(24-x)*150=3000", "24-x=3000", "x*150=3000"],FIND((n)=>(24-n)*150===3000,0,24),"x"))),
  'ex-3am-muadalat-darajat-ula-l4-004:q3': SOLR('(24-x)*150=3000'),
  'ex-3am-muadalat-darajat-ula-l4-005:q1': R(V('1-3/5')),
  'ex-3am-muadalat-darajat-ula-l4-005:q2': PICK(((a)=>[a[1],a[2],a[0]])(EQT(["x-(3/5)x-2=3", "(3/5)x-2=3", "x-3/5-2=3"],FIND((n)=>Math.abs(n-0.6*n-2-3)<1e-9,0,30,2),"x"))),
  'ex-3am-muadalat-darajat-ula-l4-005:q3': SOLR('x-(3/5)x-2=3'),
  'ex-3am-muadalat-darajat-ula-l4-005:q4': R(V('3/5*25/2')),
  'ex-3am-muadalat-darajat-ula-l4-006:q1': R(V('1-1/3-1/2')),
  'ex-3am-muadalat-darajat-ula-l4-006:q2': PICK(((a)=>[a[0],a[1],a[2]])(EQT(["x-x/3-x/2=2000", "x/3+x/2=2000", "x-1/3-1/2=2000"],FIND((n)=>Math.abs(n-n/3-n/2-2000)<1e-6,0,30000),"x"))),
  'ex-3am-muadalat-darajat-ula-l4-006:q3': SOLR('x-x/3-x/2=2000'),
  'ex-3am-muadalat-darajat-ula-l4-006:q4': R(Number(X0('x-x/3-x/2=2000'))/3),
  'ex-3am-muadalat-darajat-ula-l4-007:q1': PICK(((a)=>[a[1],a[0],a[2]])(EQT(["3+36t=21", "36+3t=21", "3*36t=21"],FIND((n)=>3+36*n===21,0,5,2),"t"))),
  'ex-3am-muadalat-darajat-ula-l4-007:q2': SOLR('3+36t=21','t'),
  'ex-3am-muadalat-darajat-ula-l4-007:q3': R(Number(60)*0.5),
  'ex-3am-muadalat-darajat-ula-l4-008:q1': PICK(((a)=>[a[0],a[1],a[2]])(EQT(["2(x+(2x+3))=54", "x+(2x+3)=54", "2x+(2x+3)=54"],FIND((n)=>2*(n+(2*n+3))===54,0,40),"x"))),
  'ex-3am-muadalat-darajat-ula-l4-008:q2': SOLR('2(x+(2x+3))=54'),
  'ex-3am-muadalat-darajat-ula-l4-008:q3': R(8*(2*8+3)),
  'ex-3am-muadalat-darajat-ula-l4-009:q1': R(15+9+12),
  'ex-3am-muadalat-darajat-ula-l4-009:q2': PICK(((a)=>[a[1],a[0],a[2]])(EQT(["(36+x)/4=12.5", "36+x=12.5", "(36+x)*4=12.5"],FIND((n)=>Math.abs((36+n)/4-12.5)<1e-9,0,20),"x"))),
  'ex-3am-muadalat-darajat-ula-l4-009:q3': SOLR('(36+x)/4=12.5'),
  'ex-3am-muadalat-darajat-ula-l4-009:q4': PICK(((a)=>[a[0],a[1]])([(Number(X0('(36+x)/4=12.5'))>=0 && Number(X0('(36+x)/4=12.5'))<=20), !(Number(X0('(36+x)/4=12.5'))>=0 && Number(X0('(36+x)/4=12.5'))<=20)])),
  'ex-3am-muadalat-darajat-ula-l4-010:q1': PICK(((a)=>[a[0],a[1],a[2]])(EQT(["60n+900=90n-450", "60n-900=90n+450", "60n+900=90n+450"],FIND((n)=>90*n===(60*n+900)+450,1,200),"n"))),
  'ex-3am-muadalat-darajat-ula-l4-010:q2': SOLR('60n+900=90n-450','n'),
  'ex-3am-muadalat-darajat-ula-l4-010:q3': R(60*45+900),
  'ex-3am-muadalat-darajat-ula-l5-001:q1': PICK(((a)=>[a[1],a[2],a[0]])(POLYSAME('(3x+2)+5+4+3+(3x-2)+8',['6x+20','6x+24','3x+20']))),
  'ex-3am-muadalat-darajat-ula-l5-001:q2': SOLR('6x+20=74'),
  'ex-3am-muadalat-darajat-ula-l5-001:q3': R(3*Number(X0('6x+20=74'))+2),
  'ex-3am-muadalat-darajat-ula-l5-001:q4': R(29*8-4*3),
  'ex-3am-muadalat-darajat-ula-l5-001:q5': SOLR('220c=528000','c'),
  'ex-3am-muadalat-darajat-ula-l5-001:q6': PICK(((a)=>[a[0],a[1],a[2]])([250*2400===600000 && 600000>580000, 600000<=580000, 250*2400===2650])),
  'ex-3am-muadalat-darajat-ula-l5-002:q1': PICK(((a)=>[a[0],a[1],a[2]])(POLYSAME('2((4x+7)+(2x-2))',['12x+10','12x+5','6x+10']))),
  'ex-3am-muadalat-darajat-ula-l5-002:q2': SOLR('12x+10=154'),
  'ex-3am-muadalat-darajat-ula-l5-002:q3': R(4*Number(X0('12x+10=154'))+7),
  'ex-3am-muadalat-darajat-ula-l5-002:q4': R(2*Number(X0('12x+10=154'))-2),
  'ex-3am-muadalat-darajat-ula-l5-002:q5': SOLR('154c=231000','c'),
  'ex-3am-muadalat-darajat-ula-l5-002:q6': PICK(((a)=>[a[1],a[0],a[2]])([154*1400+15000<231000 && 231000-(154*1400+15000)===400, 231000<154*1400+15000, 231000===154*1400+15000])),
  'ex-3am-muadalat-darajat-ula-l5-003:q1': R(V('1-1/3-2/5')),
  'ex-3am-muadalat-darajat-ula-l5-003:q2': PICK(((a)=>[a[1],a[2],a[0]])(EQT(["x-x/3-(2/5)x=28", "x/3+(2/5)x=28", "x-1/3-2/5=28"],FIND((n)=>Math.abs(n-n/3-0.4*n-28)<1e-9,0,300),"x"))),
  'ex-3am-muadalat-darajat-ula-l5-003:q3': SOLR('x-x/3-(2/5)x=28'),
  'ex-3am-muadalat-darajat-ula-l5-003:q4': R(105*18),
  'ex-3am-muadalat-darajat-ula-l5-003:q5': SOLR('18n+1890=2160','n'),
  'ex-3am-muadalat-darajat-ula-l5-003:q6': PICK(((a)=>[a[1],a[0],a[2]])([105*18<=2000 && 2000-105*18===110, 105*18>2000, 2000-105*18===90])),
  'ex-3am-muadalat-darajat-ula-l5-004:q1': PICK(((a)=>[a[1],a[0],a[2]])(EQT(["2(w+(2w+6))=156", "2w+(2w+6)=156", "w+(2w+6)=156"],FIND((n)=>2*(n+(2*n+6))===156,0,100),"w"))),
  'ex-3am-muadalat-darajat-ula-l5-004:q2': SOLR('2(w+(2w+6))=156','w'),
  'ex-3am-muadalat-darajat-ula-l5-004:q3': R(2*Number(X0('2(w+(2w+6))=156','w'))+6),
  'ex-3am-muadalat-darajat-ula-l5-004:q4': R(12/(40/60)),
  'ex-3am-muadalat-darajat-ula-l5-004:q5': SOLR('18t=21','t'),
  'ex-3am-muadalat-darajat-ula-l5-004:q6': PICK(((a)=>[a[1],a[2],a[0]])([(7*60+15+70)<=8*60+30 && (7*60+15+70)===8*60+25, (7*60+15+70)===8*60+35, (7*60+15+70)===8*60+45])),
  'ex-3am-muadalat-darajat-ula-l5-005:q1': PICK(((a)=>[a[1],a[2],a[0]])(EQT(["40+x=2(12+x)", "40+x=2*12+x", "40=2(12+x)"],FIND((n)=>40+n===2*(12+n),0,60),"x"))),
  'ex-3am-muadalat-darajat-ula-l5-005:q2': SOLR('40+x=2(12+x)'),
  'ex-3am-muadalat-darajat-ula-l5-005:q3': R(12+Number(X0('40+x=2(12+x)'))),
  'ex-3am-muadalat-darajat-ula-l5-005:q4': SOLR('y+(2y+600)=5400','y'),
  'ex-3am-muadalat-darajat-ula-l5-005:q5': R(2*Number(X0('y+(2y+600)=5400','y'))+600),
  'ex-3am-muadalat-darajat-ula-l5-005:q6': PICK(((a)=>[a[0],a[1],a[2]])([1700>=1600 && 1700-1600===100, 1700<1600, 1700-1600===1600])),
  'ex-3am-muadalat-darajat-ula-l5-006:q1': PICK(((a)=>[a[1],a[2],a[0]])(EQT(["100+40k=220+25k", "100+40=220+25k", "100k+40=220k+25"],FIND((n)=>100+40*n===220+25*n,0,100),"k"))),
  'ex-3am-muadalat-darajat-ula-l5-006:q2': SOLR('100+40k=220+25k','k'),
  'ex-3am-muadalat-darajat-ula-l5-006:q3': R(100+40*8),
  'ex-3am-muadalat-darajat-ula-l5-006:q4': R(100+40*12),
  'ex-3am-muadalat-darajat-ula-l5-006:q5': R(220+25*12),
  'ex-3am-muadalat-darajat-ula-l5-006:q6': PICK(((a)=>[a[1],a[2],a[0]])([520<580 && 580-520===60, 580<520, 580===520])),
  'ex-3am-muadalat-darajat-ula-l5-007:q1': PICK(((a)=>[a[0],a[1],a[2]])(EQT(["2(x+20)+(3x-20)=180", "(x+20)+(3x-20)=180", "2(x+20)+(3x-20)=90"],FIND((n)=>2*(n+20)+(3*n-20)===180,0,180),"x"))),
  'ex-3am-muadalat-darajat-ula-l5-007:q2': SOLR('2(x+20)+(3x-20)=180'),
  'ex-3am-muadalat-darajat-ula-l5-007:q3': R(3*Number(X0('2(x+20)+(3x-20)=180'))-20),
  'ex-3am-muadalat-darajat-ula-l5-007:q4': R(Number(X0('2(x+20)+(3x-20)=180'))+20),
  'ex-3am-muadalat-darajat-ula-l5-007:q5': R(180-52),
  'ex-3am-muadalat-darajat-ula-l5-007:q6': PICK(((a)=>[a[1],a[2],a[0]])([76!==90 && 52!==90 && 52===52, 76===90||52===90, 76===52])),
  'ex-3am-muadalat-darajat-ula-l5-008:q1': PICK(((a)=>[a[0],a[1],a[2]])(EQT(["9x-70=8x+35", "9x+70=8x-35", "9x-70=8x-35"],FIND((n)=>9*n-70===8*n+35,0,500),"x"))),
  'ex-3am-muadalat-darajat-ula-l5-008:q2': SOLR('9x-70=8x+35'),
  'ex-3am-muadalat-darajat-ula-l5-008:q3': R(9*Number(X0('9x-70=8x+35'))-70),
  'ex-3am-muadalat-darajat-ula-l5-008:q4': R(875-8*105),
  'ex-3am-muadalat-darajat-ula-l5-008:q5': R(Math.floor(875/105)),
  'ex-3am-muadalat-darajat-ula-l5-008:q6': PICK(((a)=>[a[1],a[0],a[2]])([10*105>875 && 10*105-875===175, 10*105<=875, 10*105-875===70])),
  'ex-3am-muadalat-darajat-ula-l5-009:q1': PICK(((a)=>[a[0],a[1],a[2]])(EQT(["2((x+4)+6)=3(x+2)", "(x+4)+6=x+2", "2((x+4)+6)=x+2"],FIND((n)=>2*((n+4)+6)===3*(n+2),0,100),"x"))),
  'ex-3am-muadalat-darajat-ula-l5-009:q2': SOLR('2((x+4)+6)=3(x+2)'),
  'ex-3am-muadalat-darajat-ula-l5-009:q3': R(Number(X0('2((x+4)+6)=3(x+2)'))+4),
  'ex-3am-muadalat-darajat-ula-l5-009:q4': R(2*(18+6)),
  'ex-3am-muadalat-darajat-ula-l5-009:q5': R(48+48),
  'ex-3am-muadalat-darajat-ula-l5-009:q6': PICK(((a)=>[a[1],a[2],a[0]])([96*85>8000 && 96*85-8000===160, 96*85<=8000, 96*85-8000===8160])),
  'ex-3am-muadalat-darajat-ula-l5-010:q1': PICK(((a)=>[a[0],a[1],a[2]])(EQT(["6v+12=7v-3", "6v-12=7v+3", "6v+12=7v+3"],FIND((n)=>6*n+12===7*n-3,0,100),"v"))),
  'ex-3am-muadalat-darajat-ula-l5-010:q2': SOLR('6v+12=7v-3','v'),
  'ex-3am-muadalat-darajat-ula-l5-010:q3': R(6*15+12),
  'ex-3am-muadalat-darajat-ula-l5-010:q4': R(102*650),
  'ex-3am-muadalat-darajat-ula-l5-010:q5': R(70000-102*650),
  'ex-3am-muadalat-darajat-ula-l5-010:q6': PICK(((a)=>[a[0],a[1],a[2]])([5*650<=3700 && 3700-5*650===450, 5*650>3700, 3700-5*650===3250])),
};
