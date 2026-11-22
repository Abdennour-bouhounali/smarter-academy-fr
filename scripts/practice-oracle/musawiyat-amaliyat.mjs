// Oracle du banc « musawiyat-amaliyat » (المساويات والعمليات, 3AM, 2026-10-21) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec un calcul écrit dans ce fichier (rationnels
// EXACTS en BigInt), indépendant de packages/core :
//  - une égalité de l'énoncé est RETAPÉE dans une petite syntaxe (`2x-5=2`, `(3/4)p=2400`) et analysée en formes
//    affines a·x + b à coefficients rationnels ;
//  - DERIVE : applique à l'égalité de départ les opérations de la question (ajouter, soustraire, multiplier, diviser les
//    DEUX membres) et trouve l'unique option égale, forme par forme, à l'égalité obtenue ;
//  - FOLLOWS / TF : l'égalité de départ a une solution unique x0 (calculée ici) ; une égalité proposée est vraie si et
//    seulement si elle est vraie en x0 — un QCM n'a qu'une option vraie ;
//  - FILL : valeur de l'expression demandée en x0 ; OPNUM : le nombre c tel que l'égalité d'arrivée est celle de départ
//    après l'opération (comparaison des deux membres, qui doit donner le MÊME c) ;
//  - les problèmes en mots recalculent leurs données avec l'arithmétique brute (ou V = rationnels exacts) ; les QCM
//    de décision évaluent chaque option par un calcul.
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
const parseEq = (s, v) => { const [l, r] = s.split('='); if (!r || s.split('=').length !== 2) throw new Error(`égalité attendue : ${s}`); return [parseLin(l, v), parseLin(r, v)]; };
/** Solution unique x0 de l'égalité de départ. */
const solve = (base, v) => { const [l, r] = parseEq(base, v); const d = l.sub(r); if (d.a.isZero()) throw new Error(`pas de solution unique : ${base}`); return d.b.neg().div(d.a); };
const holds = (eq, x0, v) => { const [l, r] = parseEq(eq, v); return l.at(x0).eq(r.at(x0)); };
/** Arithmétique pure en rationnels exacts. */
const V = (s) => { const r = parseLin(s, '§'); if (!r.a.isZero()) throw new Error(s); return r.b.toString(); };

const letter = (k) => C('ABCDEF'[k]);
const only = (flags, what) => { const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0); if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`); return letter(hits[0]); };
/** QCM qualitatif : la seule option vraie (les drapeaux sont CALCULÉS par l'appelant). */
const PICK = (flags) => only(flags, 'QCM');

const applyOp = ([l, r], [kind, c]) => {
  const k = parseLin(c, '§').b; // le nombre, éventuellement fractionnaire (« 1/2 »)
  if (kind === 'add') return [l.add(new Lin(ZERO, k)), r.add(new Lin(ZERO, k))];
  if (kind === 'sub') return [l.sub(new Lin(ZERO, k)), r.sub(new Lin(ZERO, k))];
  if (kind === 'mul') return [l.scale(k), r.scale(k)];
  if (kind === 'div') return [l.scale(ONE.div(k)), r.scale(ONE.div(k))];
  throw new Error(kind);
};
/** QCM « quelle égalité obtient-on en… » : l'option dont les deux membres sont exactement ceux de l'égalité transformée. */
const DERIVE = (base, ops, options, v = 'x') => {
  let cur = parseEq(base, v); for (const op of ops) cur = applyOp(cur, op);
  return only(options.map((o) => { const [l, r] = parseEq(o, v); return l.eq(cur[0]) && r.eq(cur[1]); }), `DERIVE ${base}`);
};
/** QCM « quelle égalité est vraie sachant… » : vraie en x0, l'unique solution de l'égalité de départ. */
const FOLLOWS = (base, options, v = 'x') => { const x0 = solve(base, v); return only(options.map((o) => holds(o, x0, v)), `FOLLOWS ${base}`); };
/** « cette égalité est-elle vraie ? » : A = صحيحة, B = خاطئة. */
const TF = (base, target, v = 'x') => (holds(target, solve(base, v), v) ? C('A') : C('B'));
/** « أكمل » : la valeur de l'expression en x0. */
const FILL = (base, expr, v = 'x') => R(parseLin(expr, v).at(solve(base, v)).toString());
/** Le nombre ajouté / retranché / multiplié / divisé : même c sur les deux membres. */
const OPNUM = (base, target, kind, v = 'x') => {
  const [bl, br] = parseEq(base, v); const [tl, tr] = parseEq(target, v);
  if (kind === 'add' || kind === 'sub') {
    const dl = tl.sub(bl); const dr = tr.sub(br);
    if (!dl.a.isZero() || !dr.a.isZero() || !dl.b.eq(dr.b)) throw new Error(`pas une addition : ${base} → ${target}`);
    return R((kind === 'add' ? dl.b : dl.b.neg()).toString());
  }
  const ratio = (u, w) => (!u.a.isZero() ? w.a.div(u.a) : w.b.div(u.b));
  const pick = !bl.a.isZero() || !bl.b.isZero() ? [bl, tl] : [br, tr];
  const k = ratio(pick[0], pick[1]);
  if (!bl.scale(k).eq(tl) || !br.scale(k).eq(tr)) throw new Error(`pas un produit : ${base} → ${target}`);
  return R((kind === 'mul' ? k : ONE.div(k)).toString());
};

export const ORACLE = {
  'ex-3am-musawiyat-amaliyat-l1-001:q1': FILL("x=30", "x+9", "x"),
  'ex-3am-musawiyat-amaliyat-l1-001:q2': FILL("x=-5", "x-6", "x"),
  'ex-3am-musawiyat-amaliyat-l1-001:q3': FILL("x=0", "3x+7", "x"),
  'ex-3am-musawiyat-amaliyat-l1-001:q4': FILL("x=1/2", "4x-1/2", "x"),
  'ex-3am-musawiyat-amaliyat-l1-002:q1': OPNUM("x=7", "x+5=12", "add", "x"),
  'ex-3am-musawiyat-amaliyat-l1-002:q2': OPNUM("x=-3", "x-4=-7", "sub", "x"),
  'ex-3am-musawiyat-amaliyat-l1-002:q3': OPNUM("2x=10", "2x+6=16", "add", "x"),
  'ex-3am-musawiyat-amaliyat-l1-002:q4': OPNUM("3y=-2", "3y-1/2=-5/2", "sub", "y"),
  'ex-3am-musawiyat-amaliyat-l1-003:q1': TF("x=5", "x+3=8", "x"),
  'ex-3am-musawiyat-amaliyat-l1-003:q2': TF("x=5", "x+3=5", "x"),
  'ex-3am-musawiyat-amaliyat-l1-003:q3': TF("x=-2", "x-4=-2", "x"),
  'ex-3am-musawiyat-amaliyat-l1-003:q4': TF("a=6", "a+10=16", "a"),
  'ex-3am-musawiyat-amaliyat-l1-004:q1': FILL("x=-3", "4x", "x"),
  'ex-3am-musawiyat-amaliyat-l1-004:q2': FILL("x=12", "x/(-4)", "x"),
  'ex-3am-musawiyat-amaliyat-l1-004:q3': FILL("y=15", "y/5", "y"),
  'ex-3am-musawiyat-amaliyat-l1-004:q4': FILL("3a=-12", "a", "a"),
  'ex-3am-musawiyat-amaliyat-l1-005:q1': DERIVE("4=2x-6", [["mul", "-3"]], ["-12=-6x+18", "-12=6x-18", "-12=2x-6", "-12=-6x-6"], "x"),
  'ex-3am-musawiyat-amaliyat-l1-005:q2': DERIVE("2x-3=7", [["div", "2"]], ["x-3=(7/2)", "x-(3/2)=(7/2)", "x-(5/2)=(15/2)", "x-(3/2)=7"], "x"),
  'ex-3am-musawiyat-amaliyat-l1-005:q3': DERIVE("x+2=-6", [["mul", "-2"]], ["-2x+2=12", "-2x-4=-12", "-2x-4=-6", "-2x-4=12"], "x"),
  'ex-3am-musawiyat-amaliyat-l1-006:q1': OPNUM("6x=18", "x=3", "div", "x"),
  'ex-3am-musawiyat-amaliyat-l1-006:q2': OPNUM("x=-4", "-5x=20", "mul", "x"),
  'ex-3am-musawiyat-amaliyat-l1-006:q3': OPNUM("x/3=2", "x=6", "mul", "x"),
  'ex-3am-musawiyat-amaliyat-l1-006:q4': OPNUM("4y=1", "y=1/4", "div", "y"),
  'ex-3am-musawiyat-amaliyat-l1-007:q1': PICK([(-1===0), (0.5===0), (0===0)]),
  'ex-3am-musawiyat-amaliyat-l1-007:q2': PICK([(7*0===7*0), (7*0===7), false]),
  'ex-3am-musawiyat-amaliyat-l1-007:q3': PICK([(3*0===5*0 && 3!==5), false, false]),
  'ex-3am-musawiyat-amaliyat-l1-008:q1': FOLLOWS("2x+1=9", ["4x+1=18", "2x+6=14", "2x=10", "2x+6=9"], "x"),
  'ex-3am-musawiyat-amaliyat-l1-008:q2': FOLLOWS("3x-2=10", ["6x-4=20", "6x-2=20", "6x-4=10"], "x"),
  'ex-3am-musawiyat-amaliyat-l1-008:q3': TF("2x+1=9", "x+1/2=9/2", "x"),
  'ex-3am-musawiyat-amaliyat-l1-009:q1': FILL("3x=-2", "-6x", "x"),
  'ex-3am-musawiyat-amaliyat-l1-009:q2': FILL("3x=-2", "3x+5", "x"),
  'ex-3am-musawiyat-amaliyat-l1-009:q3': FILL("3x=-2", "x-3", "x"),
  'ex-3am-musawiyat-amaliyat-l1-009:q4': FILL("3x=-2", "x/2-1", "x"),
  'ex-3am-musawiyat-amaliyat-l1-010:q1': FOLLOWS("x=-3", ["x-4=1", "x+4=-3", "x+4=1"], "x"),
  'ex-3am-musawiyat-amaliyat-l1-010:q2': FOLLOWS("x=-3", ["-2x=6", "-2x=-3", "-2x=-6"], "x"),
  'ex-3am-musawiyat-amaliyat-l2-001:q1': FILL("y=-7", "3y", "y"),
  'ex-3am-musawiyat-amaliyat-l2-001:q2': FILL("y=-7", "9+3y", "y"),
  'ex-3am-musawiyat-amaliyat-l2-002:q1': ((S) => PICK([(4+S===35), (4*S===35), (S+4*S===35)]))(35/5),
  'ex-3am-musawiyat-amaliyat-l2-002:q2': R(35/5),
  'ex-3am-musawiyat-amaliyat-l2-002:q3': R(4*(35/5)),
  'ex-3am-musawiyat-amaliyat-l2-003:q1': FILL("3x+3=36", "3x", "x"),
  'ex-3am-musawiyat-amaliyat-l2-003:q2': FILL("3x=33", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l2-003:q3': R((36-3)/3+2),
  'ex-3am-musawiyat-amaliyat-l2-004:q1': DERIVE("(5x+3)/4=7/2", [["mul", "4"]], ["5x+3=14", "5x+(19/4)=(15/2)", "5x+3=(7/2)", "5x+(3/4)=14"], "x"),
  'ex-3am-musawiyat-amaliyat-l2-004:q2': FILL("5x+3=14", "5x", "x"),
  'ex-3am-musawiyat-amaliyat-l2-004:q3': FILL("5x=11", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l2-005:q1': TF("x=4", "-3x=-12", "x"),
  'ex-3am-musawiyat-amaliyat-l2-005:q2': TF("x=4", "-3x=12", "x"),
  'ex-3am-musawiyat-amaliyat-l2-005:q3': FILL("y=-5", "-2y", "y"),
  'ex-3am-musawiyat-amaliyat-l2-006:q1': TF("2x+3=11", "4x+6=22", "x"),
  'ex-3am-musawiyat-amaliyat-l2-006:q2': TF("2x+3=11", "2x=7", "x"),
  'ex-3am-musawiyat-amaliyat-l2-007:q1': FILL("x=-2", "3x+7", "x"),
  'ex-3am-musawiyat-amaliyat-l2-007:q2': FILL("x=-2", "-4x+1", "x"),
  'ex-3am-musawiyat-amaliyat-l2-007:q3': TF("x=-2", "5x+10=0", "x"),
  'ex-3am-musawiyat-amaliyat-l2-008:q1': DERIVE("x-3=5", [["mul", "-2"]], ["-2x+6=-10", "-2x+6=10", "-2x+6=5", "-2x-3=-10"], "x"),
  'ex-3am-musawiyat-amaliyat-l2-008:q2': DERIVE("-2x+1=-5", [["div", "-2"]], ["x-(1/2)=(5/2)", "x+1=(5/2)", "x+(1/2)=(-11/2)", "x-(1/2)=-5"], "x"),
  'ex-3am-musawiyat-amaliyat-l2-009:q1': FILL("5a+10=0", "a", "a"),
  'ex-3am-musawiyat-amaliyat-l2-009:q2': FILL("-2a+1=-3", "a", "a"),
  'ex-3am-musawiyat-amaliyat-l2-009:q3': FILL("7a-3=18", "a", "a"),
  'ex-3am-musawiyat-amaliyat-l2-009:q4': FILL("a/3+1=0", "a", "a"),
  'ex-3am-musawiyat-amaliyat-l2-010:q1': TF("3x=4", "x=1", "x"),
  'ex-3am-musawiyat-amaliyat-l2-010:q2': TF("17-x=0", "x=17", "x"),
  'ex-3am-musawiyat-amaliyat-l2-010:q3': TF("8x=8", "x=0", "x"),
  'ex-3am-musawiyat-amaliyat-l2-010:q4': TF("2-5x=0", "x=2/5", "x"),
  'ex-3am-musawiyat-amaliyat-l3-001:q1': ((W) => PICK([(2*(4*W+W)===200), (4*W*W===200), (4*W+W===200), (2*4*W+W===200)]))(200/10),
  'ex-3am-musawiyat-amaliyat-l3-001:q2': FILL("10w=200", "w", "w"),
  'ex-3am-musawiyat-amaliyat-l3-001:q3': R(4*(200/10)),
  'ex-3am-musawiyat-amaliyat-l3-002:q1': DERIVE("(-3x+5)/4=-1", [["mul", "4"]], ["-3x+5=-1", "-3x+(5/4)=-4", "-3x+5=-4", "-3x+(21/4)=3"], "x"),
  'ex-3am-musawiyat-amaliyat-l3-002:q2': FILL("-3x+5=-4", "-3x", "x"),
  'ex-3am-musawiyat-amaliyat-l3-002:q3': FILL("-3x=-9", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l3-002:q4': TF("(-3x+5)/4=-1", "x=3", "x"),
  'ex-3am-musawiyat-amaliyat-l3-003:q1': ((X) => PICK([(8*X+20===2*((3*X+4)+(X+6))), (4*X+10===2*((3*X+4)+(X+6))), (4*X+20===2*((3*X+4)+(X+6)))]))((148-20)/8),
  'ex-3am-musawiyat-amaliyat-l3-003:q2': FILL("8x+20=148", "8x", "x"),
  'ex-3am-musawiyat-amaliyat-l3-003:q3': FILL("8x=128", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l3-003:q4': R((148-20)/8+6),
  'ex-3am-musawiyat-amaliyat-l3-004:q1': ((A) => PICK([(A-3===27), (A+(A-3)===27), (A+(A+3)===27)]))((27+3)/2),
  'ex-3am-musawiyat-amaliyat-l3-004:q2': FILL("2a-3=27", "2a", "a"),
  'ex-3am-musawiyat-amaliyat-l3-004:q3': FILL("2a=30", "a", "a"),
  'ex-3am-musawiyat-amaliyat-l3-004:q4': R((27+3)/2-3),
  'ex-3am-musawiyat-amaliyat-l3-005:q1': FOLLOWS("x=-4", ["x+7=-4", "x-7=3", "x+7=3"], "x"),
  'ex-3am-musawiyat-amaliyat-l3-005:q2': FOLLOWS("x=-4", ["-3x=-12", "-3x=-4", "-3x=12"], "x"),
  'ex-3am-musawiyat-amaliyat-l3-005:q3': FOLLOWS("2x=-6", ["x=-6", "x=-3", "x=-12"], "x"),
  'ex-3am-musawiyat-amaliyat-l3-005:q4': DERIVE("3x+1=-5", [["sub", "1"]], ["3x=-4", "3x=-5", "3x=-6"], "x"),
  'ex-3am-musawiyat-amaliyat-l3-006:q1': DERIVE("1=3x-8", [["mul", "-2"]], ["-2=-6x+16", "-2=-6x-8", "-2=6x-16", "-2=3x-8"], "x"),
  'ex-3am-musawiyat-amaliyat-l3-006:q2': DERIVE("5=2-3x", [["mul", "-4"]], ["-20=12x+2", "-20=12x-8", "1=12x-2", "-20=-3x+2"], "x"),
  'ex-3am-musawiyat-amaliyat-l3-006:q3': FOLLOWS("1=3x-8", ["-7=3x", "9=3x-8", "9=3x"], "x"),
  'ex-3am-musawiyat-amaliyat-l3-007:q1': ((a, b) => PICK([(a+300>b+300), (a+300===b+300), (a+300<b+300)]))(1000, 1000),
  'ex-3am-musawiyat-amaliyat-l3-007:q2': ((m) => PICK([(m-750===m+300-450 && m-150===m+300-450), (m+150===m+300-450), (m-150===m+300-450)]))(1000),
  'ex-3am-musawiyat-amaliyat-l3-007:q3': R(1200+300-450),
  'ex-3am-musawiyat-amaliyat-l3-007:q4': FILL("m-150=1050", "m", "m"),
  'ex-3am-musawiyat-amaliyat-l3-008:q1': ((P) => PICK([(P+3===1350), (3*P===1350), (P/3===1350)]))(1350/3),
  'ex-3am-musawiyat-amaliyat-l3-008:q2': FILL("3p=1350", "p", "p"),
  'ex-3am-musawiyat-amaliyat-l3-008:q3': FILL("p=450", "5p", "p"),
  'ex-3am-musawiyat-amaliyat-l3-008:q4': TF("3p=1350", "6p=2700", "p"),
  'ex-3am-musawiyat-amaliyat-l3-009:q1': ((X) => PICK([(8*X+1===(2*X+1)+2*(3*X-1)), (8*X-1===(2*X+1)+2*(3*X-1)), (5*X===(2*X+1)+2*(3*X-1))]))((31+1)/8),
  'ex-3am-musawiyat-amaliyat-l3-009:q2': FILL("8x-1=31", "8x", "x"),
  'ex-3am-musawiyat-amaliyat-l3-009:q3': FILL("8x=32", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l3-009:q4': R(3*((31+1)/8)-1),
  'ex-3am-musawiyat-amaliyat-l3-010:q1': FILL("x+8=0", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l3-010:q2': FILL("5x=1", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l3-010:q3': FILL("-6x=6", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l3-010:q4': FILL("x=0", "9+2x", "x"),
  'ex-3am-musawiyat-amaliyat-l4-001:q1': ((X, K) => PICK([(2*X*X+5*X-4===K), (2*X*X+7*X-4===K), (2*X*X+5*X+4===K)]))(3, 2*3*(3+3)-(3-4)),
  'ex-3am-musawiyat-amaliyat-l4-001:q2': FILL("5x+4=24", "5x", "x"),
  'ex-3am-musawiyat-amaliyat-l4-001:q3': FILL("5x=20", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l4-001:q4': TF("5x+4=24", "10x+8=48", "x"),
  'ex-3am-musawiyat-amaliyat-l4-002:q1': R(75000*20/100),
  'ex-3am-musawiyat-amaliyat-l4-002:q2': DERIVE("(6/5)p=90000", [["mul", "5"]], ["6p+5=90005", "6p=90000", "6p=450000"], "p"),
  'ex-3am-musawiyat-amaliyat-l4-002:q3': FILL("6p=450000", "p", "p"),
  'ex-3am-musawiyat-amaliyat-l4-002:q4': TF("(6/5)p=90000", "p=75000", "p"),
  'ex-3am-musawiyat-amaliyat-l4-003:q1': R(V('2/5+(3/5)/(3/2)')),
  'ex-3am-musawiyat-amaliyat-l4-003:q2': FILL("x=4/5", "5x", "x"),
  'ex-3am-musawiyat-amaliyat-l4-003:q3': FILL("x=4/5", "5x-4", "x"),
  'ex-3am-musawiyat-amaliyat-l4-003:q4': TF("x=4/5", "10x-8=0", "x"),
  'ex-3am-musawiyat-amaliyat-l4-004:q1': ((X, D) => PICK([(4*X-6===D), (4*X+10===D), (4*X-10===D)]))(5, (5+2)*(5-3)-(5*5-5*5+4)),
  'ex-3am-musawiyat-amaliyat-l4-004:q2': FILL("x=3", "4x-10", "x"),
  'ex-3am-musawiyat-amaliyat-l4-004:q3': FILL("4x-10=14", "4x", "x"),
  'ex-3am-musawiyat-amaliyat-l4-004:q4': FILL("4x=24", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l4-005:q1': R(V('1-1/2-1/4')),
  'ex-3am-musawiyat-amaliyat-l4-005:q2': FILL("N/4=30", "N", "N"),
  'ex-3am-musawiyat-amaliyat-l4-005:q3': R((30*4)/2),
  'ex-3am-musawiyat-amaliyat-l4-005:q4': TF("N/4=30", "N=30", "N"),
  'ex-3am-musawiyat-amaliyat-l4-006:q1': R(180/3),
  'ex-3am-musawiyat-amaliyat-l4-006:q2': ((T) => PICK([(T/60===150), (60*T===150), (60+T===150)]))(150/60),
  'ex-3am-musawiyat-amaliyat-l4-006:q3': FILL("60t=150", "t", "t"),
  'ex-3am-musawiyat-amaliyat-l4-006:q4': R((150/60)*60),
  'ex-3am-musawiyat-amaliyat-l4-007:q1': R(4000*25/100),
  'ex-3am-musawiyat-amaliyat-l4-007:q2': DERIVE("(3/4)p=2400", [["mul", "4"]], ["3p=9600", "3p+4=2404", "3p=2400"], "p"),
  'ex-3am-musawiyat-amaliyat-l4-007:q3': FILL("3p=9600", "p", "p"),
  'ex-3am-musawiyat-amaliyat-l4-007:q4': TF("(3/4)p=2400", "p=3200", "p"),
  'ex-3am-musawiyat-amaliyat-l4-008:q1': R(V('3/4-5/6')),
  'ex-3am-musawiyat-amaliyat-l4-008:q2': FILL("x=3/4", "x-5/6", "x"),
  'ex-3am-musawiyat-amaliyat-l4-008:q3': FILL("x=3/4", "-4x/3", "x"),
  'ex-3am-musawiyat-amaliyat-l4-008:q4': TF("x=3/4", "4x=3", "x"),
  'ex-3am-musawiyat-amaliyat-l4-009:q1': R(Math.sqrt(6*6+8*8)),
  'ex-3am-musawiyat-amaliyat-l4-009:q2': FILL("24c=3600", "c", "c"),
  'ex-3am-musawiyat-amaliyat-l4-009:q3': TF("24c=3600", "12c=1800", "c"),
  'ex-3am-musawiyat-amaliyat-l4-010:q1': R((10+12+14)/3),
  'ex-3am-musawiyat-amaliyat-l4-010:q2': DERIVE("(26+x)/3=13", [["mul", "3"]], ["x+26=13", "x+(35/3)=16", "x+26=39"], "x"),
  'ex-3am-musawiyat-amaliyat-l4-010:q3': FILL("x+26=39", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l4-010:q4': TF("(26+x)/3=13", "x=13", "x"),
  'ex-3am-musawiyat-amaliyat-l5-001:q1': ((W) => PICK([(2*(3*W+W)===240), (3*W+W===240), (2*3*W+W===240)]))(240/8),
  'ex-3am-musawiyat-amaliyat-l5-001:q2': FILL("8w=240", "w", "w"),
  'ex-3am-musawiyat-amaliyat-l5-001:q3': R(3*(240/8)),
  'ex-3am-musawiyat-amaliyat-l5-001:q4': R(80/(15/60)),
  'ex-3am-musawiyat-amaliyat-l5-001:q5': FILL("320t=160", "t", "t"),
  'ex-3am-musawiyat-amaliyat-l5-001:q6': (() => PICK([(80>=90)===false, false, (320>=90)&&false]))(),
  'ex-3am-musawiyat-amaliyat-l5-002:q1': ((X) => PICK([(3*X+8===2*((2*X+5)+(X+3))), (6*X+8===2*((2*X+5)+(X+3))), (6*X+16===2*((2*X+5)+(X+3)))]))((106-16)/6),
  'ex-3am-musawiyat-amaliyat-l5-002:q2': FILL("6x+16=106", "6x", "x"),
  'ex-3am-musawiyat-amaliyat-l5-002:q3': FILL("6x=90", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l5-002:q4': R(2*((106-16)/6)+5),
  'ex-3am-musawiyat-amaliyat-l5-002:q5': FILL("106c=53000", "c", "c"),
  'ex-3am-musawiyat-amaliyat-l5-002:q6': (() => PICK([(118*500===60118), (118*500===62000), (118*500<=60000 && 118*500===59000)]))(),
  'ex-3am-musawiyat-amaliyat-l5-003:q1': FILL("4a=72", "a", "a"),
  'ex-3am-musawiyat-amaliyat-l5-003:q2': ((X) => PICK([(6*X===12*X/2), (12*X===12*X/2), (X+12===12*X/2)]))(5),
  'ex-3am-musawiyat-amaliyat-l5-003:q3': FILL("324-6x=288", "-6x", "x"),
  'ex-3am-musawiyat-amaliyat-l5-003:q4': FILL("-6x=-36", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l5-003:q5': (() => PICK([((324-288)/-6>=0 && (324-288)/-6<=18 && false), ((324-288)/6>=0 && (324-288)/6<=18), (324-6*0===288)]))(),
  'ex-3am-musawiyat-amaliyat-l5-004:q1': R(V('1-2/5-1/5')),
  'ex-3am-musawiyat-amaliyat-l5-004:q2': DERIVE("(2/5)N=36", [["mul", "5"]], ["2N=36", "2N+5=41", "2N=180"], "N"),
  'ex-3am-musawiyat-amaliyat-l5-004:q3': FILL("2N=180", "N", "N"),
  'ex-3am-musawiyat-amaliyat-l5-004:q4': DERIVE("(3/4)C=4500", [["mul", "4"]], ["3C=18000", "3C+4=4504", "3C=4500"], "C"),
  'ex-3am-musawiyat-amaliyat-l5-004:q5': FILL("3C=18000", "C", "C"),
  'ex-3am-musawiyat-amaliyat-l5-004:q6': (() => PICK([(90*50===5000), (90*50===4500), (90*50===3500)]))(),
  'ex-3am-musawiyat-amaliyat-l5-005:q1': ((X) => PICK([(10*X+2===2*((4*X-1)+(X+2))), (10*X+1===2*((4*X-1)+(X+2))), (5*X+1===2*((4*X-1)+(X+2)))]))((62-2)/10),
  'ex-3am-musawiyat-amaliyat-l5-005:q2': FILL("10x+2=62", "10x", "x"),
  'ex-3am-musawiyat-amaliyat-l5-005:q3': FILL("10x=60", "x", "x"),
  'ex-3am-musawiyat-amaliyat-l5-005:q4': R(4*((62-2)/10)-1),
  'ex-3am-musawiyat-amaliyat-l5-005:q5': FILL("184c=331200", "c", "c"),
  'ex-3am-musawiyat-amaliyat-l5-005:q6': (() => PICK([(184*1800===368000), (184*1800===352000), (184*1800<=350000 && 184*1800===331200)]))(),
  'ex-3am-musawiyat-amaliyat-l5-006:q1': ((B) => PICK([(B*2*B*3*B===360), (B+2*B+3*B===360), (B+2+3===360)]))(360/6),
  'ex-3am-musawiyat-amaliyat-l5-006:q2': FILL("6b=360", "b", "b"),
  'ex-3am-musawiyat-amaliyat-l5-006:q3': R(3*(360/6)),
  'ex-3am-musawiyat-amaliyat-l5-006:q4': FILL("360c+2000=56000", "360c", "c"),
  'ex-3am-musawiyat-amaliyat-l5-006:q5': FILL("360c=54000", "c", "c"),
  'ex-3am-musawiyat-amaliyat-l5-006:q6': (() => PICK([(50*150===8500), (50*150===9000), (50*150<=8000 && 50*150===7500)]))(),
  'ex-3am-musawiyat-amaliyat-l5-007:q1': ((N) => PICK([(3+N*40===160), (N+3+40===160), (3*N+40===160)]))((160-40)/3),
  'ex-3am-musawiyat-amaliyat-l5-007:q2': FILL("3n+40=160", "3n", "n"),
  'ex-3am-musawiyat-amaliyat-l5-007:q3': FILL("3n=120", "n", "n"),
  'ex-3am-musawiyat-amaliyat-l5-007:q4': FILL("n=40", "5n+80", "n"),
  'ex-3am-musawiyat-amaliyat-l5-007:q5': (() => PICK([((5*40+80<=300) && 5*40+80===280), (5*40+80===305), (5*40+80===320)]))(),
  'ex-3am-musawiyat-amaliyat-l5-008:q1': R(Math.sqrt(3*3+4*4)),
  'ex-3am-musawiyat-amaliyat-l5-008:q2': (() => PICK([(3*5===8), (3+5===8), (5-3===8)]))(),
  'ex-3am-musawiyat-amaliyat-l5-008:q3': FILL("x=8", "3x", "x"),
  'ex-3am-musawiyat-amaliyat-l5-008:q4': FILL("24s=960", "s", "s"),
  'ex-3am-musawiyat-amaliyat-l5-008:q5': (() => PICK([(24*40<=1000 && 24*40===960), (24*40===1032), (24*40===1200)]))(),
  'ex-3am-musawiyat-amaliyat-l5-009:q1': ((A) => PICK([(A+4===1200), (A/4===1200), (4*A===1200)]))(1200/4),
  'ex-3am-musawiyat-amaliyat-l5-009:q2': FILL("4a=1200", "a", "a"),
  'ex-3am-musawiyat-amaliyat-l5-009:q3': R(2*(1200/4)),
  'ex-3am-musawiyat-amaliyat-l5-009:q4': FILL("a+150=450", "a", "a"),
  'ex-3am-musawiyat-amaliyat-l5-009:q5': FILL("a=300", "a+150-400", "a"),
  'ex-3am-musawiyat-amaliyat-l5-009:q6': (() => PICK([(300+150-400===35), (300+150-400>=40 && 300+150-400===50), (300+150-400===0)]))(),
  'ex-3am-musawiyat-amaliyat-l5-010:q1': ((K) => PICK([(7*(K+12)===187), (K+7+12===187), (7*K+12===187)]))((187-12)/7),
  'ex-3am-musawiyat-amaliyat-l5-010:q2': FILL("7k+12=187", "7k", "k"),
  'ex-3am-musawiyat-amaliyat-l5-010:q3': FILL("7k=175", "k", "k"),
  'ex-3am-musawiyat-amaliyat-l5-010:q4': FILL("5s+2=187", "5s", "s"),
  'ex-3am-musawiyat-amaliyat-l5-010:q5': FILL("5s=185", "s", "s"),
  'ex-3am-musawiyat-amaliyat-l5-010:q6': (() => PICK([(5*38<=187), (5*38<=187), (5*38>187)]))(),
};
