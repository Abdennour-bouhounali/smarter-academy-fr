// Oracle du banc « mutabayinat-amaliyat » (المتباينات والعمليات, 3AM, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec un calcul écrit dans ce fichier (rationnels
// EXACTS en BigInt), indépendant de packages/core. Méthode par TÉMOINS :
//  - une expression (`3x-2`, `x/(-4)`, `(3/4)p`) est retapée dans une petite syntaxe et évaluée exactement en
//    rationnels pour des valeurs données des lettres ; une relation ou un encadrement (`a<b`, `2<=t<=5`) est retapé de la
//    même façon ;
//  - on tire 200 valeurs rationnelles des lettres qui VÉRIFIENT la prémisse (grille de pas 1/64, plus les valeurs-frontières :
//    égalités a = b, littéraux et zéro de chaque inéquation affine), puis :
//      SYM   : le symbole juste est celui qui tient sur les 200 témoins ; chaque autre symbole est mis en défaut par au
//              moins un témoin ; « لا يمكن الحكم » exige des témoins des DEUX signes ;
//      INEQ  : parmi des inégalités complètes, une seule tient sur tous les témoins ;
//      TF    : « صحيحة » ssi la conclusion tient sur tous les témoins ;
//      LIMIT : la borne b d'une inéquation affine en une lettre (zéro de l'expression), image b' par une expression :
//              on vérifie sur des tirages libres que « prémisse ⇔ expression ⋈ b' » (sens donné par le signe de la pente) ;
//      BR / BRC : encadrements de ax + b recalculés aux DEUX bouts, sens inversé si a < 0, rigueur héritée, chaque
//              valeur d'encadrement vérifiée sur les témoins (et serrée : les bouts sont atteints) ;
//  - les problèmes en mots recalculent leurs données avec l'arithmétique brute ou des rationnels exacts.
// Les questions selfCheck (« علّل », « برّر ») n'ont pas de clé et ne figurent pas ici.
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
  cmp(o) { const l = this.n * o.d; const r = o.n * this.d; return l < r ? -1 : l > r ? 1 : 0; }
  sign() { return this.n < 0n ? -1 : this.n > 0n ? 1 : 0; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
const ZERO = new Q(0n); const ONE = new Q(1n);
const dec = (s) => { const [i, f = ''] = s.split('.'); return new Q(BigInt(i + f), 10n ** BigInt(f.length)); };

/** Évalue `src` (nombres, lettres, + − × ÷, parenthèses, produit collé `3x`, `(1/2)p`) pour les lettres de `env`. */
function ev(src, env = {}) {
  const t = src.replace(/\s+/g, ''); let i = 0;
  const peek = () => t[i];
  const expr = () => { let r = term(); while (peek() === '+' || peek() === '-') { const op = t[i++]; const w = term(); r = op === '+' ? r.add(w) : r.sub(w); } return r; };
  const term = () => {
    let neg = false; if (peek() === '-') { neg = true; i++; }
    let r = factor();
    for (;;) {
      const p = peek();
      if (p === '*') { i++; r = r.mul(factor()); }
      else if (p === '/') { i++; r = r.div(factor()); }
      else if (p === '(' || (p !== undefined && /[A-Za-z]/.test(p))) r = r.mul(factor());
      else break;
    }
    return neg ? r.neg() : r;
  };
  const factor = () => {
    const p = peek();
    if (p === '(') { i++; const r = expr(); if (t[i++] !== ')') throw new Error(`« ) » attendu : ${src}`); return r; }
    if (p !== undefined && /[A-Za-z]/.test(p)) { i++; if (!(p in env)) throw new Error(`lettre ${p} sans valeur : ${src}`); return env[p]; }
    const m = /^\d+(\.\d+)?/.exec(t.slice(i)); if (!m) throw new Error(`lecture impossible à ${i} dans ${src}`);
    i += m[0].length; return dec(m[0]);
  };
  const r = expr(); if (i !== t.length) throw new Error(`reste « ${t.slice(i)} » dans ${src}`); return r;
}
const RELS = /(<=|>=|<|>|=)/;
/** « 2<=t<=5 » → { exprs: ['2','t','5'], rels: ['<=','<='] }. */
const chainOf = (s) => { const parts = s.replace(/\s+/g, '').split(RELS); return { exprs: parts.filter((_, k) => k % 2 === 0), rels: parts.filter((_, k) => k % 2 === 1) }; };
const relHolds = (rel, a, b) => { const c = a.cmp(b); return rel === '<' ? c < 0 : rel === '>' ? c > 0 : rel === '<=' ? c <= 0 : rel === '>=' ? c >= 0 : c === 0; };
const chainHolds = (s, env) => { const { exprs, rels } = chainOf(s); return rels.every((r, k) => relHolds(r, ev(exprs[k], env), ev(exprs[k + 1], env))); };
const lits = (s) => (s.match(/\d+(\.\d+)?/g) ?? []).map(dec);

/* ── témoins ───────────────────────────────────────────────────────────────── */
let seed = 20261026;
const rnd = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0); }; // mulberry32
const grid = () => new Q(BigInt((rnd() % 2561) - 1280), 64n); // pas 1/64 sur [−20 ; 20]
/** Tirage autour d'une base b (0 ou un littéral de l'énoncé), à l'échelle de b : b + grille × max(1, |b|/10). */
const around = (bases) => { const b = bases[rnd() % bases.length]; const mag = b.sign() < 0 ? b.neg() : b; const s = mag.cmp(new Q(10n)) > 0 ? mag.div(new Q(10n)) : ONE; return b.add(grid().mul(s)); };
const basesOf = (srcs) => [ZERO, ...srcs.flatMap((s) => lits(s))];
/** Zéro de l'expression affine `s` en la lettre v (ou null si elle n'est pas affine non constante). */
const zeroOf = (s, v) => {
  const f = (x) => ev(s, { [v]: x }); const a = f(ZERO); const b = f(ONE) .sub(a);
  if (b.sign() === 0 || !f(new Q(2n)).sub(a).eq(b.mul(new Q(2n)))) return null; return a.neg().div(b);
};
/** 200 valeurs des lettres vérifiant TOUTES les prémisses. */
function witnesses(vars, prems, n = 200) {
  const out = []; const ok = (env) => prems.every((p) => chainHolds(p, env));
  const push = (env) => { if (out.length < n + 200 && ok(env)) out.push(env); };
  // valeurs-frontières : littéraux, zéro des inéquations affines (une lettre), égalités entre lettres
  const special = new Set(); for (const p of prems) for (const q of lits(p)) { special.add(q.toString()); special.add(q.neg().toString()); }
  if (vars.length === 1) for (const p of prems) { const { exprs } = chainOf(p); for (let k = 0; k + 1 < exprs.length; k++) { const z = zeroOf(`(${exprs[k]})-(${exprs[k + 1]})`, vars[0]); if (z) special.add(z.toString()); } }
  const sp = [...special].map((s) => ev(s));
  const bases = basesOf(prems);
  for (const v of vars) for (const s of sp) for (let k = 0; k < 12; k++) { const env = {}; for (const w of vars) env[w] = around(bases); env[v] = s; push(env); }
  if (vars.length === 2) for (let k = 0; k < 60; k++) { const g = around(bases); push({ [vars[0]]: g, [vars[1]]: g }); }
  let tries = 0;
  while (out.length < n && tries++ < 400000) { const env = {}; for (const w of vars) env[w] = around(bases); push(env); }
  if (vars.length === 0) { if (!ok({})) throw new Error(`prémisse fausse : ${prems}`); return [{}]; }
  if (out.length < 60) throw new Error(`trop peu de témoins (${out.length}) pour ${prems}`);
  return out;
}
const letter = (k) => C('ABCDEF'[k]);
const only = (flags, what) => { const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0); if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`); return letter(hits[0]); };
const PICK = (flags) => only(flags, 'QCM');
const SYMREL = { '<': '<', '>': '>', '<=': '<=', '>=': '>=', '=': '=' };

/** « أكمل بالرمز » : le symbole qui tient sur tous les témoins ; « U » = on ne peut pas décider. */
const SYM = (vars, prems, L, Rr, tokens) => {
  const w = witnesses(vars, prems);
  const lt = w.some((e) => ev(L, e).cmp(ev(Rr, e)) < 0); const gt = w.some((e) => ev(L, e).cmp(ev(Rr, e)) > 0);
  return only(tokens.map((tk) => (tk === 'U' ? lt && gt : w.every((e) => relHolds(SYMREL[tk], ev(L, e), ev(Rr, e))))), `SYM ${L} ? ${Rr}`);
};
/** Inégalités complètes (ou encadrements) : la seule qui tient sur tous les témoins. */
const INEQ = (vars, prems, opts) => { const w = witnesses(vars, prems); return only(opts.map((o) => w.every((e) => chainHolds(o, e))), `INEQ ${prems}`); };
/** « cette conclusion est-elle toujours vraie ? » A = صحيحة, B = خاطئة. */
const TF = (vars, prems, concl) => { const w = witnesses(vars, prems); return w.every((e) => chainHolds(concl, e)) ? C('A') : C('B'); };
/** Vérité d'une relation pour des valeurs données. */
const TFV = (rel, env) => (chainHolds(rel, Object.fromEntries(Object.entries(env).map(([k, v]) => [k, ev(String(v))]))) ? C('A') : C('B'));
/** Solution unique de l'égalité affine `eq` en la lettre v. */
const SOLVE = (eq, v) => { const { exprs } = chainOf(eq); const z = zeroOf(`(${exprs[0]})-(${exprs[1]})`, v); if (!z) throw new Error(eq); return R(z.toString()); };

/**
 * Borne d'une inéquation affine `prem` en v, puis image par `form` : le nombre b' tel que
 *   prem ⇔ form ⋈ b'  (⋈ = sens de prem, inversé si les pentes de prem et de form sont de signes opposés).
 * Vérifié sur 2000 tirages libres (équivalence, donc borne SERRÉE).
 */
const LIMIT = (prem, form, v = 'x') => {
  const { exprs, rels } = chainOf(prem); if (rels.length !== 1) throw new Error(prem);
  const diff = `(${exprs[0]})-(${exprs[1]})`; const z = zeroOf(diff, v); const rel = rels[0];
  const sPrem = ev(diff, { [v]: ONE }).sub(ev(diff, { [v]: ZERO })).sign(); // pente de (gauche − droite)
  const fz = ev(form, { [v]: z }); const g = ev(form, { [v]: ONE }).sub(ev(form, { [v]: ZERO })).sign();
  // prem ⇔ (gauche − droite) rel 0 ⇔ (v − z) rel' 0 où rel' = rel (pente > 0) ou rel inversé (pente < 0)
  const flip = { '<': '>', '>': '<', '<=': '>=', '>=': '<=', '=': '=' };
  const relV = sPrem > 0 ? rel : flip[rel]; const relF = g > 0 ? relV : flip[relV];
  const bs = basesOf([prem]); for (let k = 0; k < 2000; k++) { const x = around([...bs, z]); const lhs = chainHolds(prem, { [v]: x }); const rhs = relHolds(relF, ev(form, { [v]: x }), fz); if (lhs !== rhs) throw new Error(`LIMIT ${prem} → ${form} : ${x}`); }
  return R(fz.toString());
};
/** Encadrement de `form` (affine en v) quand `prem` = « lo <= v <= hi » : bout inférieur / supérieur, recalculés aux deux bouts. */
const brInfo = (prem, form, v) => {
  const { exprs, rels } = chainOf(prem); if (rels.length !== 2) throw new Error(prem);
  const lo = ev(exprs[0]); const hi = ev(exprs[2]); const fl = ev(form, { [v]: lo }); const fh = ev(form, { [v]: hi });
  const w = witnesses([v], [prem]); const mn = fl.cmp(fh) <= 0 ? fl : fh; const mx = fl.cmp(fh) <= 0 ? fh : fl;
  for (const e of w) { const y = ev(form, e); if (y.cmp(mn) < 0 || y.cmp(mx) > 0) throw new Error(`BR ${prem} ${form}`); }
  const inc = fl.cmp(fh) <= 0; // la pente est > 0 : le bout bas vient du bas
  const relLow = inc ? rels[0] : rels[1]; const relHigh = inc ? rels[1] : rels[0];
  return { mn, mx, relLow, relHigh };
};
const BR = (prem, form, which, v = 'x') => { const { mn, mx } = brInfo(prem, form, v); return R((which === 'lo' ? mn : mx).toString()); };
/** QCM d'encadrements « lo <= form <= hi » : le seul qui est exact (bouts atteints, rigueur héritée). */
const BRC = (prem, form, opts, v = 'x') => {
  const { mn, mx, relLow, relHigh } = brInfo(prem, form, v); const w = witnesses([v], [prem]);
  return only(opts.map((o) => {
    const { exprs, rels } = chainOf(o);
    return exprs[1] === form.replace(/\s+/g, '') && rels[0] === relLow.replace('>', '<') && rels[1] === relHigh.replace('>', '<')
      && ev(exprs[0]).eq(mn) && ev(exprs[2]).eq(mx) && w.every((e) => chainHolds(o, e));
  }), `BRC ${prem} ${form}`);
};
const V = (s) => ev(s).toString();

export const ORACLE = {
  "ex-3am-mutabayinat-amaliyat-l1-001:q1": INEQ(["x"], ["x>4"], ["-3x+5<-12","-3x+5>-7","-3x+5<-7"]),
  "ex-3am-mutabayinat-amaliyat-l1-001:q2": INEQ(["y"], ["y<-2"], ["4y+3>-5","4y+3<-5","4y+3<-8"]),
  "ex-3am-mutabayinat-amaliyat-l1-001:q3": SYM(["m"], ["m<=3"], "m-8", "-5", [">=","<="]),
  "ex-3am-mutabayinat-amaliyat-l1-002:q1": SYM(["a","b"], ["a<b"], "a-2", "b-2", ["<",">"]),
  "ex-3am-mutabayinat-amaliyat-l1-002:q2": SYM(["a","b"], ["a<b"], "4a", "4b", [">","<"]),
  "ex-3am-mutabayinat-amaliyat-l1-002:q3": SYM(["a","b"], ["a<b"], "-5a", "-5b", [">","<"]),
  "ex-3am-mutabayinat-amaliyat-l1-002:q4": SYM(["a","b"], ["a<b"], "a/(-2)+1", "b/(-2)+1", ["<",">"]),
  "ex-3am-mutabayinat-amaliyat-l1-003:q1": SYM(["a","b"], ["a>b"], "a+4", "b+4", ["<",">"]),
  "ex-3am-mutabayinat-amaliyat-l1-003:q2": SYM(["a","b"], ["a>b"], "8a", "8b", [">","<"]),
  "ex-3am-mutabayinat-amaliyat-l1-003:q3": SYM(["a","b"], ["a>b"], "-8a", "-8b", [">","<"]),
  "ex-3am-mutabayinat-amaliyat-l1-003:q4": SYM(["a","b"], ["a>b"], "a/(-4)", "b/(-4)", ["<",">"]),
  "ex-3am-mutabayinat-amaliyat-l1-004:q1": SYM(["a","b"], ["a<b"], "a+1/20", "b+1/20", ["<",">"]),
  "ex-3am-mutabayinat-amaliyat-l1-004:q2": SYM(["a","b"], ["a<b"], "2a", "2b", [">","<"]),
  "ex-3am-mutabayinat-amaliyat-l1-004:q3": SYM(["a","b"], ["a<b"], "a/5", "b/5", ["<",">"]),
  "ex-3am-mutabayinat-amaliyat-l1-004:q4": SYM(["a","b"], ["a<b"], "-a", "-b", ["<",">"]),
  "ex-3am-mutabayinat-amaliyat-l1-005:q1": INEQ(["n"], ["n<450"], ["n+25<450","n+25>475","n+25<475"]),
  "ex-3am-mutabayinat-amaliyat-l1-005:q2": LIMIT('n<450', 'n-30', 'n'),
  "ex-3am-mutabayinat-amaliyat-l1-005:q3": TF(["n"], ["n<450"], "n+25>475"),
  "ex-3am-mutabayinat-amaliyat-l1-005:q4": SYM(["n"], ["n<450"], "n+10", "460", ["<",">"]),
  "ex-3am-mutabayinat-amaliyat-l1-006:q1": LIMIT('x>=7', 'x-12', 'x'),
  "ex-3am-mutabayinat-amaliyat-l1-006:q2": SYM(["x"], ["x<=-3"], "x+9", "6", [">=","<="]),
  "ex-3am-mutabayinat-amaliyat-l1-006:q3": LIMIT('x>=2', '4x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l1-006:q4": LIMIT('x<=6', 'x/3', 'x'),
  "ex-3am-mutabayinat-amaliyat-l1-007:q1": SYM(["a","b"], ["a>=b"], "a+6", "b+6", ["<=",">="]),
  "ex-3am-mutabayinat-amaliyat-l1-007:q2": SYM(["a","b"], ["a>=b"], "a-b", "0", [">=","<="]),
  "ex-3am-mutabayinat-amaliyat-l1-007:q3": SYM(["a","b"], ["a>=b"], "3a", "3b", ["<=",">="]),
  "ex-3am-mutabayinat-amaliyat-l1-007:q4": SYM(["a","b"], ["a>=b"], "a/4", "b/4", [">=","<="]),
  "ex-3am-mutabayinat-amaliyat-l1-008:q1": SYM(["k","l"], ["k<l"], "-4k", "-4l", [">","<"]),
  "ex-3am-mutabayinat-amaliyat-l1-008:q2": SYM(["k","l"], ["k<l"], "k/(-2)", "l/(-2)", ["<",">"]),
  "ex-3am-mutabayinat-amaliyat-l1-008:q3": SYM(["k","l"], ["k<=l"], "-k", "-l", [">=","<="]),
  "ex-3am-mutabayinat-amaliyat-l1-008:q4": SYM(["k","l"], ["k>l"], "(-3/4)k", "(-3/4)l", [">","<"]),
  "ex-3am-mutabayinat-amaliyat-l1-009:q1": TF(["a","b"], ["a<b"], "a-7<b-7"),
  "ex-3am-mutabayinat-amaliyat-l1-009:q2": TF(["a","b"], ["a<b"], "5a>5b"),
  "ex-3am-mutabayinat-amaliyat-l1-009:q3": TF(["a","b"], ["a<b"], "-3a<-3b"),
  "ex-3am-mutabayinat-amaliyat-l1-009:q4": TF(["a","b"], ["a<b"], "0*a<0*b"),
  "ex-3am-mutabayinat-amaliyat-l1-010:q1": LIMIT('x<-4', 'x+10', 'x'),
  "ex-3am-mutabayinat-amaliyat-l1-010:q2": LIMIT('x<-4', '3x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l1-010:q3": INEQ(["x"], ["x<-4"], ["-2x<8","-2x>8"]),
  "ex-3am-mutabayinat-amaliyat-l1-010:q4": LIMIT('x<-4', 'x/(-4)', 'x'),
  "ex-3am-mutabayinat-amaliyat-l2-001:q1": R(V('3/5+(7/10)/(7/4)')),
  "ex-3am-mutabayinat-amaliyat-l2-001:q2": SYM(["x"], ["x>6"], "-3x+1", "-17", [">","<"]),
  "ex-3am-mutabayinat-amaliyat-l2-001:q3": LIMIT('x>6', 'x/(-2)+4', 'x'),
  "ex-3am-mutabayinat-amaliyat-l2-002:q1": TFV("5(x-1)=2x+4", {"x":2}),
  "ex-3am-mutabayinat-amaliyat-l2-002:q2": SOLVE('5(x-1)=2x+4', 'x'),
  "ex-3am-mutabayinat-amaliyat-l2-002:q3": INEQ(["x"], ["-3x+2>11"], ["x<-3","x<-9","x>-3"]),
  "ex-3am-mutabayinat-amaliyat-l2-003:q1": LIMIT('m>=0', '3m', 'm'),
  "ex-3am-mutabayinat-amaliyat-l2-003:q2": LIMIT('m<=2', 'm-2', 'm'),
  "ex-3am-mutabayinat-amaliyat-l2-003:q3": LIMIT('m>4/3', '4-3*m', 'm'),
  "ex-3am-mutabayinat-amaliyat-l2-003:q4": TF(["m"], ["m>=0"], "5m>0"),
  "ex-3am-mutabayinat-amaliyat-l2-004:q1": INEQ(["z"], ["-4z>=-10"], ["z<=5/2","z>=-10","z>=5/2"]),
  "ex-3am-mutabayinat-amaliyat-l2-004:q2": LIMIT('-4z>=-10', 'z', 'z'),
  "ex-3am-mutabayinat-amaliyat-l2-004:q3": LIMIT('-4z>=-10', '2z+1', 'z'),
  "ex-3am-mutabayinat-amaliyat-l2-005:q1": LIMIT('5x-4<=11', '5x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l2-005:q2": LIMIT('5x-4<=11', 'x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l2-005:q3": SYM(["x"], ["5x-4<=11"], "2x+1", "7", ["<=",">="]),
  "ex-3am-mutabayinat-amaliyat-l2-006:q1": LIMIT('6-2y>10', '-2y', 'y'),
  "ex-3am-mutabayinat-amaliyat-l2-006:q2": INEQ(["y"], ["6-2y>10"], ["y<-2","y>-2"]),
  "ex-3am-mutabayinat-amaliyat-l2-006:q3": TF(["y"], ["y<-2"], "3y+1<-5"),
  "ex-3am-mutabayinat-amaliyat-l2-007:q1": INEQ(["x"], ["3x<-6"], ["x<-18","x<-2","x>-2"]),
  "ex-3am-mutabayinat-amaliyat-l2-007:q2": INEQ(["x"], ["-4x<-8"], ["x<2","x>2"]),
  "ex-3am-mutabayinat-amaliyat-l2-007:q3": LIMIT('-5x<=20', 'x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l2-007:q4": LIMIT('x/4>-3', 'x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l2-008:q1": TF(["a","b"], ["a<b"], "0*a<0*b"),
  "ex-3am-mutabayinat-amaliyat-l2-008:q2": SYM(["a","b"], ["a<b"], "0*a", "0*b", ["<",">","="]),
  "ex-3am-mutabayinat-amaliyat-l2-008:q3": SYM(["a","b"], ["a<b"], "2a", "2b", [">","<"]),
  "ex-3am-mutabayinat-amaliyat-l2-009:q1": LIMIT('x>=-2', '-4x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l2-009:q2": LIMIT('x>=-2', '-4x+3', 'x'),
  "ex-3am-mutabayinat-amaliyat-l2-009:q3": SYM(["x"], ["x>=-2"], "-4x+3", "11", ["<=",">="]),
  "ex-3am-mutabayinat-amaliyat-l2-010:q1": SYM(["a","b"], ["a<b"], "a+1/2", "b+1/2", [">","U","<"]),
  "ex-3am-mutabayinat-amaliyat-l2-010:q2": SYM(["a","b"], ["a<b"], "a-2", "b-5", ["U",">","<"]),
  "ex-3am-mutabayinat-amaliyat-l2-010:q3": SYM(["a","b"], ["a<b"], "a-4", "b-1", [">","<","U"]),
  "ex-3am-mutabayinat-amaliyat-l3-001:q1": BRC("2<=t<=6", "3t", ["6<=3t<=18","2<=3t<=6","18<=3t<=6"], "t"),
  "ex-3am-mutabayinat-amaliyat-l3-001:q2": BR('2<=t<=6', '2t-3', 'lo', 't'),
  "ex-3am-mutabayinat-amaliyat-l3-001:q3": BRC("2<=t<=6", "-t+4", ["-2<=-t+4<=2","6<=-t+4<=10","2<=-t+4<=-2"], "t"),
  "ex-3am-mutabayinat-amaliyat-l3-001:q4": BR('2<=t<=6', '(5/2)t-1', 'hi', 't'),
  "ex-3am-mutabayinat-amaliyat-l3-002:q1": BR('9<=P<=12', 'P/3', 'lo', 'P'),
  "ex-3am-mutabayinat-amaliyat-l3-002:q2": BR('9<=P<=12', 'P/3', 'hi', 'P'),
  "ex-3am-mutabayinat-amaliyat-l3-002:q3": BRC("3<=c<=4", "4c", ["16<=4c<=12","12<=4c<=16","3<=4c<=4"], "c"),
  "ex-3am-mutabayinat-amaliyat-l3-002:q4": TF(["P"], ["9<=P<=12"], "P-2>=7"),
  "ex-3am-mutabayinat-amaliyat-l3-003:q1": SYM(["a","b"], ["a>=b"], "a-b", "0", ["<=",">="]),
  "ex-3am-mutabayinat-amaliyat-l3-003:q2": SYM(["a","b"], ["a>=b"], "2a+1", "2b+1", [">=","<="]),
  "ex-3am-mutabayinat-amaliyat-l3-003:q3": SYM(["a","b"], ["a>=b"], "3-a", "3-b", [">=","<="]),
  "ex-3am-mutabayinat-amaliyat-l3-003:q4": SYM(["a","b"], ["2a<=7b-3"], "7b-2a", "3", [">=","<="]),
  "ex-3am-mutabayinat-amaliyat-l3-004:q1": SYM(["a","b"], ["a>=b"], "5a", "5b", [">=","<="]),
  "ex-3am-mutabayinat-amaliyat-l3-004:q2": SYM(["a","b"], ["a>b"], "(-3/4)a", "(-3/4)b", [">","<"]),
  "ex-3am-mutabayinat-amaliyat-l3-004:q3": SYM(["a","b"], ["a<=b"], "2a-1", "2b-1", ["<=",">="]),
  "ex-3am-mutabayinat-amaliyat-l3-004:q4": SYM(["a","b"], ["a<b"], "-a+4", "-b+4", ["<",">"]),
  "ex-3am-mutabayinat-amaliyat-l3-005:q1": R(V('(5*4+2)-(3*4+8)')),
  "ex-3am-mutabayinat-amaliyat-l3-005:q2": SYM(["x"], ["x>3"], "5x+2", "3x+8", ["<",">","U"]),
  "ex-3am-mutabayinat-amaliyat-l3-005:q3": INEQ(["x"], ["x>3"], ["2x-6>0","2x-6>6","2x-6<0"]),
  "ex-3am-mutabayinat-amaliyat-l3-006:q1": BR('400<=x<=600', '3x', 'lo', 'x'),
  "ex-3am-mutabayinat-amaliyat-l3-006:q2": BRC("400<=x<=600", "3x+50", ["1250<=3x+50<=1850","1850<=3x+50<=1250","1200<=3x+50<=1800"], "x"),
  "ex-3am-mutabayinat-amaliyat-l3-006:q3": BR('400<=x<=600', '3x+50', 'hi', 'x'),
  "ex-3am-mutabayinat-amaliyat-l3-006:q4": PICK([1850>1900, 1850<=1900]),
  "ex-3am-mutabayinat-amaliyat-l3-007:q1": BRC("-4<=T<=8", "-3T", ["-24<=-3T<=12","-12<=-3T<=24","12<=-3T<=-24"], "T"),
  "ex-3am-mutabayinat-amaliyat-l3-007:q2": BR('-4<=T<=8', '10-3T', 'lo', 'T'),
  "ex-3am-mutabayinat-amaliyat-l3-007:q3": BR('-4<=T<=8', '10-3T', 'hi', 'T'),
  "ex-3am-mutabayinat-amaliyat-l3-007:q4": TF(["T"], ["-4<=T<=8"], "10-3T>=-14"),
  "ex-3am-mutabayinat-amaliyat-l3-008:q1": LIMIT('2x+1>=3', '2x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l3-008:q2": INEQ(["x"], ["3<=2x+1<9"], ["1<=x<4","4<=x<1","2<=x<8"]),
  "ex-3am-mutabayinat-amaliyat-l3-008:q3": BR('1<=x<4', '3x+1', 'lo', 'x'),
  "ex-3am-mutabayinat-amaliyat-l3-008:q4": TF(["x"], ["3<=2x+1<9"], "3x+1<13"),
  "ex-3am-mutabayinat-amaliyat-l3-009:q1": R(V('(-3*1+7)-(-1+3)')),
  "ex-3am-mutabayinat-amaliyat-l3-009:q2": SYM(["x"], ["x<2"], "-3x+7", "-x+3", ["U",">","<"]),
  "ex-3am-mutabayinat-amaliyat-l3-009:q3": INEQ(["x"], ["x<2"], ["-2x+4>4","-2x+4<0","-2x+4>0"]),
  "ex-3am-mutabayinat-amaliyat-l3-010:q1": SYM(["a","b"], ["a<b"], "a+9", "b+9", [">","<"]),
  "ex-3am-mutabayinat-amaliyat-l3-010:q2": SYM(["a","b"], ["a<b"], "a/2-1", "b/2-1", ["<",">"]),
  "ex-3am-mutabayinat-amaliyat-l3-010:q3": SYM(["a","b"], ["a<b"], "5-3a", "5-3b", ["<",">"]),
  "ex-3am-mutabayinat-amaliyat-l3-010:q4": SYM(["a","b"], ["a<b"], "2a+3", "2b+1", ["<","U",">"]),
  "ex-3am-mutabayinat-amaliyat-l4-001:q1": PICK([V('8.2+1.2')===V('17.6'), V('8.2+(8.2+1.2)')===V('17.6'), V('8.2*(8.2+1.2)')===V('17.6')]),
  "ex-3am-mutabayinat-amaliyat-l4-001:q2": SOLVE('x+(x+1.2)=17.6', 'x'),
  "ex-3am-mutabayinat-amaliyat-l4-001:q3": LIMIT('(17.6+m)/3>=10', 'm', 'm'),
  "ex-3am-mutabayinat-amaliyat-l4-001:q4": PICK([12>=12.4, 12<12.4]),
  "ex-3am-mutabayinat-amaliyat-l4-002:q1": LIMIT('w>=50', '90w', 'w'),
  "ex-3am-mutabayinat-amaliyat-l4-002:q2": SYM(["L","w"], ["L>=90","w>0"], "L*w", "90*w", [">=","<="]),
  "ex-3am-mutabayinat-amaliyat-l4-002:q3": R(100*60),
  "ex-3am-mutabayinat-amaliyat-l4-002:q4": PICK([4400<4500, 4400>=4500]),
  "ex-3am-mutabayinat-amaliyat-l4-003:q1": PICK([V('5*(35+40)')===V('215'), V('5*35+40')===V('215'), V('5*35')===V('215+40')]),
  "ex-3am-mutabayinat-amaliyat-l4-003:q2": SOLVE('5x+40=215', 'x'),
  "ex-3am-mutabayinat-amaliyat-l4-003:q3": LIMIT('6x+30<=300', 'x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l4-003:q4": PICK([48<=45, 48>45]),
  "ex-3am-mutabayinat-amaliyat-l4-004:q1": PICK([V('150*6+800')===V('1700'), V('800*6+150')===V('1700'), V('150*(6+800)')===V('1700')]),
  "ex-3am-mutabayinat-amaliyat-l4-004:q2": SOLVE('150n+800=1700', 'n'),
  "ex-3am-mutabayinat-amaliyat-l4-004:q3": LIMIT('150n+800<=2300', '150n', 'n'),
  "ex-3am-mutabayinat-amaliyat-l4-004:q4": LIMIT('150n+800<=2300', 'n', 'n'),
  "ex-3am-mutabayinat-amaliyat-l4-005:q1": PICK([V('3*8+3')===V('54'), V('2*((8+4)+(2*8-1))')===V('54'), V('(8+4)*(2*8-1)')===V('54')]),
  "ex-3am-mutabayinat-amaliyat-l4-005:q2": SOLVE('6x+6=54', 'x'),
  "ex-3am-mutabayinat-amaliyat-l4-005:q3": LIMIT('6x+6>=60', 'x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l4-005:q4": SYM(["x"], ["x>=9"], "6x+6", "60", ["<=",">="]),
  "ex-3am-mutabayinat-amaliyat-l4-006:q1": PICK([V('75*4')===V('300'), V('75+4')===V('300'), V('75/4')===V('300')]),
  "ex-3am-mutabayinat-amaliyat-l4-006:q2": SOLVE('75t=300', 't'),
  "ex-3am-mutabayinat-amaliyat-l4-006:q3": LIMIT('75t>=360', 't', 't'),
  "ex-3am-mutabayinat-amaliyat-l4-006:q4": PICK([4.5<4.8, 4.5>=4.8]),
  "ex-3am-mutabayinat-amaliyat-l4-007:q1": PICK([V('12+2*4')===V('4'), V('2*4-12')===V('4'), V('12-2*4')===V('4')]),
  "ex-3am-mutabayinat-amaliyat-l4-007:q2": SOLVE('12-2h=4', 'h'),
  "ex-3am-mutabayinat-amaliyat-l4-007:q3": INEQ(["h"], ["12-2h<0"], ["h<-6","h>6","h<6"]),
  "ex-3am-mutabayinat-amaliyat-l4-007:q4": LIMIT('12-2h>=-4', 'h', 'h'),
  "ex-3am-mutabayinat-amaliyat-l4-008:q1": PICK([V('4*12+12')===V('60'), V('4*(12+12)')===V('60'), V('12+16')===V('60')]),
  "ex-3am-mutabayinat-amaliyat-l4-008:q2": SOLVE('4n+12=60', 'n'),
  "ex-3am-mutabayinat-amaliyat-l4-008:q3": LIMIT('4n+12>=100', 'n', 'n'),
  "ex-3am-mutabayinat-amaliyat-l4-008:q4": SYM(["n"], ["n>=22"], "4n", "88", [">=","<="]),
  "ex-3am-mutabayinat-amaliyat-l4-009:q1": R(V('(2*13+3*14)/5')),
  "ex-3am-mutabayinat-amaliyat-l4-009:q2": SOLVE('(2x+42)/5=12', 'x'),
  "ex-3am-mutabayinat-amaliyat-l4-009:q3": LIMIT('(2x+42)/5>=10', 'x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l4-009:q4": PICK([3.5>=4, 3.5<4]),
  "ex-3am-mutabayinat-amaliyat-l4-010:q1": PICK([V('(1800-200)/3')===V('400'), V('3*1800-200')===V('400'), V('1800/3-200')===V('400')]),
  "ex-3am-mutabayinat-amaliyat-l4-010:q2": SOLVE('x/3-200=400', 'x'),
  "ex-3am-mutabayinat-amaliyat-l4-010:q3": LIMIT('x/3-200>=600', 'x/3', 'x'),
  "ex-3am-mutabayinat-amaliyat-l4-010:q4": LIMIT('x/3-200>=600', 'x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l5-001:q1": SOLVE('4a=96', 'a'),
  "ex-3am-mutabayinat-amaliyat-l5-001:q2": PICK([24*4===576, 24*24===576, 24*2===576]),
  "ex-3am-mutabayinat-amaliyat-l5-001:q3": TFV("5x<576-5x", {"x":24}),
  "ex-3am-mutabayinat-amaliyat-l5-001:q4": TFV("5x<576-5x", {"x":60}),
  "ex-3am-mutabayinat-amaliyat-l5-001:q5": INEQ(["x"], ["5x<576-5x"], ["x<57.6","x<5.76","x>57.6"]),
  "ex-3am-mutabayinat-amaliyat-l5-001:q6": PICK([24<57.6, 24>=57.6]),
  "ex-3am-mutabayinat-amaliyat-l5-002:q1": PICK([V('4.5*0.25*30')===V('12'), V('0.25+4.5*30')===V('12'), V('4.5+0.25*30')===V('12')]),
  "ex-3am-mutabayinat-amaliyat-l5-002:q2": LIMIT('4.5+0.25x<=12', '0.25x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l5-002:q3": LIMIT('4.5+0.25x<=12', 'x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l5-002:q4": TFV("4.5+0.25x<=12", {"x":28}),
  "ex-3am-mutabayinat-amaliyat-l5-002:q5": PICK([32>30, 32<=30]),
  "ex-3am-mutabayinat-amaliyat-l5-003:q1": PICK([12*31+75<=450, 12*31+75>=450, 12*(31+75)<=450]),
  "ex-3am-mutabayinat-amaliyat-l5-003:q2": LIMIT('12x+75<=450', '12x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l5-003:q3": LIMIT('12x+75<=450', 'x', 'x'),
  "ex-3am-mutabayinat-amaliyat-l5-003:q4": R(Math.floor(375/12)),
  "ex-3am-mutabayinat-amaliyat-l5-003:q5": TFV("12x+75<=450", {"x":31}),
  "ex-3am-mutabayinat-amaliyat-l5-004:q1": BRC("0<=h<=4", "-3h", ["0<=-3h<=-12","-12<=-3h<=0","0<=-3h<=12"], "h"),
  "ex-3am-mutabayinat-amaliyat-l5-004:q2": BR('0<=h<=4', '5-3h', 'lo', 'h'),
  "ex-3am-mutabayinat-amaliyat-l5-004:q3": BR('0<=h<=4', '5-3h', 'hi', 'h'),
  "ex-3am-mutabayinat-amaliyat-l5-004:q4": INEQ(["h"], ["5-3h<-4"], ["h>3","h<3","h<-3"]),
  "ex-3am-mutabayinat-amaliyat-l5-004:q5": PICK([5-3*2>-4, 5-3*2<=-4]),
  "ex-3am-mutabayinat-amaliyat-l5-005:q1": BRC("20<=n<=40", "250n", ["10000<=250n<=5000","20<=250n<=40","5000<=250n<=10000"], "n"),
  "ex-3am-mutabayinat-amaliyat-l5-005:q2": BR('20<=n<=40', '6000+250n', 'lo', 'n'),
  "ex-3am-mutabayinat-amaliyat-l5-005:q3": BR('20<=n<=40', '6000+250n', 'hi', 'n'),
  "ex-3am-mutabayinat-amaliyat-l5-005:q4": PICK([16000>15000, 16000<=15000]),
  "ex-3am-mutabayinat-amaliyat-l5-005:q5": LIMIT('6000+250n<=15000', 'n', 'n'),
  "ex-3am-mutabayinat-amaliyat-l5-006:q1": BRC("10<L<14", "2L+12", ["20<2L+12<28","32<2L+12<40","40<2L+12<32"], "L"),
  "ex-3am-mutabayinat-amaliyat-l5-006:q2": BRC("10<L<14", "6L", ["84<6L<60","10<6L<14","60<6L<84"], "L"),
  "ex-3am-mutabayinat-amaliyat-l5-006:q3": R(2*12+12),
  "ex-3am-mutabayinat-amaliyat-l5-006:q4": PICK([32<38&&38<40, 38>=40, 38<=32]),
  "ex-3am-mutabayinat-amaliyat-l5-006:q5": PICK([40<40, 40<32, 40>=40]),
  "ex-3am-mutabayinat-amaliyat-l5-007:q1": R(200-8*10),
  "ex-3am-mutabayinat-amaliyat-l5-007:q2": BRC("0<=t<=15", "-8t", ["0<=-8t<=120","-120<=-8t<=0","0<=-8t<=-120"], "t"),
  "ex-3am-mutabayinat-amaliyat-l5-007:q3": BR('0<=t<=15', '200-8t', 'lo', 't'),
  "ex-3am-mutabayinat-amaliyat-l5-007:q4": LIMIT('200-8t>=40', 't', 't'),
  "ex-3am-mutabayinat-amaliyat-l5-007:q5": PICK([80<40, 80>=40]),
  "ex-3am-mutabayinat-amaliyat-l5-008:q1": INEQ(["e"], ["e>6"], ["-2.5e>-15","-2.5e<-20","-2.5e<-15"]),
  "ex-3am-mutabayinat-amaliyat-l5-008:q2": LIMIT('e>6', '40-2.5e', 'e'),
  "ex-3am-mutabayinat-amaliyat-l5-008:q3": BRC("0<=e<=8", "40-2.5e", ["40<=40-2.5e<=20","20<=40-2.5e<=40","-20<=40-2.5e<=0"], "e"),
  "ex-3am-mutabayinat-amaliyat-l5-008:q4": BR('0<=e<=8', '40-2.5e', 'lo', 'e'),
  "ex-3am-mutabayinat-amaliyat-l5-008:q5": PICK([15<20, 15>=20]),
  "ex-3am-mutabayinat-amaliyat-l5-009:q1": R(400+150*6),
  "ex-3am-mutabayinat-amaliyat-l5-009:q2": BRC("4<=w<=10", "400+150w", ["1900<=400+150w<=1000","1000<=400+150w<=1900","600<=400+150w<=1500"], "w"),
  "ex-3am-mutabayinat-amaliyat-l5-009:q3": LIMIT('400+150w>=1600', 'w', 'w'),
  "ex-3am-mutabayinat-amaliyat-l5-009:q4": TFV("400+150w>=1600", {"w":8}),
  "ex-3am-mutabayinat-amaliyat-l5-009:q5": PICK([7>=8, 7<8]),
  "ex-3am-mutabayinat-amaliyat-l5-010:q1": R(V('(500+100*5)-(900+60*5)')),
  "ex-3am-mutabayinat-amaliyat-l5-010:q2": LIMIT('500+100n<900+60n', 'n', 'n'),
  "ex-3am-mutabayinat-amaliyat-l5-010:q3": SYM(["n"], ["n<10"], "500+100n", "900+60n", ["<",">","U"]),
  "ex-3am-mutabayinat-amaliyat-l5-010:q4": SYM(["n"], ["n>10"], "500+100n", "900+60n", ["U",">","<"]),
  "ex-3am-mutabayinat-amaliyat-l5-010:q5": PICK([500+100*12<900+60*12, 500+100*12>900+60*12]),
};
