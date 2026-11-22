// Oracle du banc « wadiya-idmajiya-aadad-nisbiya » (« أدمج تعلّماتي — الأعداد النسبية », synthèse de l'unité 1 de 3AM, 2026-10-26).
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer` ni dans le code de la leçon :
//  - l'évaluateur est celui du banc frère `qismat-nisbiyayn` (rationnels EXACTS en BigInt, priorités, parenthèses, moins unaire, décimaux
//    à virgule), COPIÉ ici (le module frère n'exporte pas son évaluateur) et étendu d'une puissance entière (`(−2)^2`) ;
//  - les formules de l'ÉNONCÉ (`A = …` dans `statement.formulas`) sont RELUES dans les fichiers du banc ; là où le nombre vit dans un récit
//    (température, solde, points…), l'expression est RETAPÉE ici en ASCII (`e`) ; les lettres A–Z d'une expression retapée valent la valeur de
//    la formule du même nom, relue dans la feuille ;
//  - une case « □ » se résout par la linéarité (f(1), f(2)) puis se RE-VÉRIFIE en la remplaçant dans l'égalité ;
//  - un « triangle magique » et les « décompositions de −30 » sont résolus par FORCE BRUTE (toutes les permutations / tous les couples d'entiers) ;
//    le triangle doit avoir UNE seule solution avec les données de l'énoncé ;
//  - un QCM n'a qu'une seule bonne option : chaque option est évaluée et l'oracle échoue si le nombre d'options justes n'est pas 1 ;
//  - `audit` contrôle les étiquettes : chaque `misconceptionSignatures` et chaque distracteur étiqueté vaut EXACTEMENT la valeur que cette
//    erreur produit (QISMA-SIGN : signe faux ; QISMA-ORDER : ordre inversé ; QISMA-DIST : on soustrait / multiplie les distances ;
//    QISMA-PRIORITY : gauche → droite ; QISMA-SUBNEG : 7 − (−6) = 1 ; JIDAA-NEGNEG : (−)×(−) lu négatif ; JIDAA-ADD / LARGER ;
//    IDA-SQUARENEG : (−2)² = −4 ; IDA-ANYNEG / MORENEG : signe d'un produit par heuristique ; WIDMAJ-ADDMAX : amplitude = somme ;
//    WIDMAJ-MEANDIFF : moyenne = (a − b) ÷ 2 ; WIDMAJ-REVCHAIN : chaîne °F → °C à l'envers ; WIDMAJ-AXIS / ONECOORD : symétries).
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C, P } from './helpers.mjs';

/* ── rationnels exacts ─────────────────────────────────────────────────────── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
class Q {
  constructor(n, d = 1n) { if (d === 0n) throw new Error('division par zéro'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; this.n = n / g; this.d = d / g; }
  add(o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Q(this.n * o.n, this.d * o.d); }
  div(o) { return new Q(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  abs() { return this.n < 0n ? this.neg() : this; }
  sign() { return this.n === 0n ? 0 : this.n < 0n ? -1 : 1; }
  cmp(o) { const l = this.n * o.d; const r = o.n * this.d; return l < r ? -1 : l > r ? 1 : 0; }
  eq(o) { return this.cmp(o) === 0; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
const num = (s) => { const [i, f = ''] = s.split('.'); return new Q(BigInt(i + f), 10n ** BigInt(f.length)); };
/** « 1.428 », « -3/4 », « 12 » → Q. */
const lit = (s) => { s = String(s).trim().replace(',', '.'); const neg = s.startsWith('-'); if (neg) s = s.slice(1); const [a, b] = s.split('/'); const v = b === undefined ? num(a) : num(a).div(num(b)); return neg ? v.neg() : v; };

/* ── LaTeX de l'énoncé → syntaxe de l'oracle ──────────────────────────────── */
const norm = (s) => String(s).replace(/\$/g, '').replace(/\\left|\\right|\\big/g, '').replace(/\\times|\\cdot/g, '*').replace(/\\div/g, '/')
  .replace(/\\square/g, 'x').replace(/\{,\}/g, '.').replace(/(\d),(\d)/g, '$1.$2').replace(/[−‒–]/g, '-').replace(/\^\{(\d+)\}/g, '^$1')
  .replace(/\\,|\\;|\\ /g, '').replace(/\s+/g, '')
  .replace(/\)\(/g, ')*(').replace(/(\d)\(/g, '$1*(').replace(/(\d)x/g, '$1*x').replace(/\)x/g, ')*x');

/* ── analyse en arbre : {t:'n',v} {t:'x'} {t:'u',c} {t:'p',c} {t:'pow',b,e} {t:'b',op,l,r} ───────── */
function parseNorm(t, src = t) {
  let i = 0; const peek = () => t[i];
  const expr = () => { let v = term(); while (peek() === '+' || peek() === '-') { const op = t[i++]; v = { t: 'b', op, l: v, r: term() }; } return v; };
  const term = () => { let v = unary(); while (peek() === '*' || peek() === '/') { const op = t[i++]; v = { t: 'b', op, l: v, r: unary() }; } return v; };
  const unary = () => { if (peek() === '-') { i++; return { t: 'u', c: unary() }; } if (peek() === '+') { i++; return unary(); } return power(); };
  const power = () => { let v = primary(); while (peek() === '^') { i++; const m = /^\d+/.exec(t.slice(i)); if (!m) throw new Error(`exposant illisible dans ${src}`); i += m[0].length; v = { t: 'pow', b: v, e: Number(m[0]) }; } return v; };
  const primary = () => {
    if (peek() === '(' || peek() === '[') { const close = peek() === '(' ? ')' : ']'; i++; const v = expr(); if (t[i++] !== close) throw new Error(`« ${close} » attendu dans ${src}`); return { t: 'p', c: v }; }
    if (peek() === 'x') { i++; return { t: 'x' }; }
    const m = /^\d+(\.\d+)?/.exec(t.slice(i)); if (!m) throw new Error(`lecture impossible à ${i} dans « ${src} » (normalisé « ${t} »)`); i += m[0].length; return { t: 'n', v: num(m[0]) };
  };
  const v = expr(); if (i !== t.length) throw new Error(`reste « ${t.slice(i)} » dans « ${src} »`); return v;
}
const parse = (src) => parseNorm(norm(src), src);
const hasX = (n) => n.t === 'x' || (n.t === 'u' || n.t === 'p' ? hasX(n.c) : n.t === 'pow' ? hasX(n.b) : n.t === 'b' ? hasX(n.l) || hasX(n.r) : false);

/** mode : 'ok' | 'flat' (gauche → droite) | 'subneg' (7 − (−6) = 7 − 6) | 'divsign' (négatif ÷ négatif = négatif) |
 *  'negneg' ((−)×(−) = négatif) | 'sqneg' ((−2)^2 = −4). */
function ev(n, mode = 'ok', x = null) {
  switch (n.t) {
    case 'n': return n.v;
    case 'x': if (x === null) throw new Error('inconnue non résolue'); return x;
    case 'u': return mode === 'dropneg' ? ev(n.c, mode, x) : ev(n.c, mode, x).neg();
    case 'p': return ev(n.c, mode, x);
    case 'pow': { const b = ev(n.b, mode, x); let r = new Q(1n); for (let k = 0; k < n.e; k++) r = r.mul(b); return mode === 'sqneg' && b.sign() < 0 ? r.abs().neg() : r; }
    default: {
      if (mode === 'flat') return flat(n, x);
      return apply(n.op, ev(n.l, mode, x), ev(n.r, mode, x), mode);
    }
  }
}
function apply(op, a, b, mode) {
  if (op === '+') return a.add(b);
  if (op === '-') return a.sub(mode === 'subneg' && b.sign() < 0 ? b.abs() : b);
  if (op === '*') { const r = a.mul(b); return mode === 'negneg' && a.sign() < 0 && b.sign() < 0 ? r.abs().neg() : r; }
  const q = a.div(b); return mode === 'divsign' && a.sign() < 0 && b.sign() < 0 ? q.abs().neg() : q;
}
function seq(n) { return n.t === 'b' ? [...seq(n.l), n.op, ...seq(n.r)] : [n]; }
function flat(n, x) { const s = seq(n); let v = ev(s[0], 'flat', x); for (let k = 1; k < s.length; k += 2) v = apply(s[k], v, ev(s[k + 1], 'flat', x), 'flat'); return v; }
const stripP = (n) => { while (n.t === 'p') n = n.c; return n; };

/** Les valeurs que chaque erreur nommée produit sur l'expression `n` : Map id → [Q]. */
function cands(n) {
  const base = ev(n); const out = new Map();
  const put = (id, v) => { if (!out.has(id)) out.set(id, []); out.get(id).push(v); };
  const top = stripP(n);
  if (top.t === 'b') put('MISC-QISMA-PRIORITY', ev(top, 'flat'));
  put('MISC-QISMA-SUBNEG', ev(n, 'subneg'));
  put('MISC-JIDAA-NEGNEG', ev(n, 'negneg'));
  put('MISC-QISMA-SIGN', ev(n, 'divsign'));
  put('MISC-IDA-SQUARENEG', ev(n, 'sqneg'));
  put('MISC-WIDMAJ-DROPNEG', ev(n, 'dropneg'));
  if (top.t === 'b' && top.op === '/') {
    const a = ev(top.l); const b = ev(top.r);
    put('MISC-QISMA-SIGN', base.neg());
    if (a.sign() !== 0) put('MISC-QISMA-ORDER', b.div(a));
    put('MISC-QISMA-DIST', a.sub(b)); put('MISC-QISMA-DIST', a.mul(b));
    const nt = stripP(top.l);
    const sumChain = (m) => { const t2 = stripP(m); return t2.t === 'b' && (t2.op === '+' || t2.op === '-'); };
    if (nt.t === 'b' && nt.op === '+' && !sumChain(nt.l) && !sumChain(nt.r)) put('MISC-WIDMAJ-MEANDIFF', ev(nt.l).sub(ev(nt.r)).div(b));
    if (nt.t === 'b' && nt.op === '-') { put('MISC-WIDMAJ-REVCHAIN', ev(nt.l).add(ev(nt.r)).div(b)); put('MISC-WIDMAJ-REVCHAIN', ev(nt.l).div(b).sub(ev(nt.r))); }
  }
  const chain = (m) => { const t2 = stripP(m); return t2.t === 'b' && (t2.op === '*' || t2.op === '/'); };
  if (top.t === 'b' && top.op === '*' && !chain(top.l) && !chain(top.r)) { // deux facteurs seulement : « on additionne les facteurs » n'a de sens que là
    const a = ev(top.l); const b = ev(top.r);
    put('MISC-JIDAA-ADD', a.add(b));
    const big = a.abs().cmp(b.abs()) >= 0 ? a : b; put('MISC-JIDAA-LARGER', big.sign() >= 0 ? a.mul(b).abs() : a.mul(b).abs().neg());
  }
  if (top.t === 'b' && top.op === '+') { const nt = stripP(top.l); if (nt.t === 'b' && nt.op === '*') put('MISC-WIDMAJ-REVCHAIN', ev(nt.l).mul(ev(nt.r).add(ev(top.r)))); } // k × t + c lu k × (t + c)
  if (top.t === 'b' && top.op === '-') put('MISC-WIDMAJ-ADDMAX', ev(top.l).add(ev(top.r)));
  return out;
}
const inList = (list, v) => (list ?? []).some((w) => w.eq(v));

/* ── lecture du banc ───────────────────────────────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bankDir = join(here, '..', '..', 'content', 'practice', '3am', 'wadiya-idmajiya-aadad-nisbiya');
const BANK = new Map();
for (const lvl of readdirSync(bankDir).filter((d) => d.startsWith('level-'))) {
  for (const f of readdirSync(join(bankDir, lvl)).filter((x) => x.endsWith('.json'))) {
    const ex = JSON.parse(readFileSync(join(bankDir, lvl, f), 'utf8')); BANK.set(ex.id, ex);
  }
}
const islands = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const defsOf = (ex) => Object.fromEntries((ex.statement.formulas ?? []).filter((f) => /^[A-Z]\s*=/.test(f)).map((f) => { const k = f.indexOf('='); return [f.slice(0, k).trim(), f.slice(k + 1).trim()]; }));
const exactlyOne = (flags, what) => { const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0); if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`); return hits[0]; };
const letterOf = (qq, k) => qq.choices[k].id;
const optText = (qq) => qq.choices.map((c) => c.content.replace(/\$/g, '').trim());
const WORD = { 'موجب': 1, 'سالب': -1 };
const YN = (txt) => (/^صحيح/.test(txt) ? true : /^خطأ/.test(txt) ? false : null);

/** Une expression retapée : chaque lettre A–Z vaut la valeur de la formule de la feuille (relue dans le fichier du banc). */
function withDefs(ex, e) {
  const defs = defsOf(ex);
  return String(e).replace(/[A-Z]/g, (L) => { if (defs[L] === undefined) throw new Error(`${ex.id} : « ${L} » non défini`); return `(${ev(parse(defs[L]))})`; });
}
const treeOfE = (ex, e) => parseNorm(norm(withDefs(ex, e)), e);
const treeOf = (ex, sp) => (sp.of !== undefined ? parse(defsOf(ex)[sp.of] ?? (() => { throw new Error(`${ex.id} : « ${sp.of} » non défini`); })()) : treeOfE(ex, sp.e));

/** Facteurs de premier niveau d'un produit (en ASCII normalisé). */
function topFactors(t) { const out = []; let d = 0; let cur = ''; for (const ch of t) { if (ch === '(') d++; if (ch === ')') d--; if (ch === '*' && d === 0) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out; }
function signFacts(ex, sp) {
  let fs;
  if (sp.of !== undefined) fs = topFactors(norm(defsOf(ex)[sp.of])).map((s) => ev(parseNorm(s)));
  else if (sp.letters) fs = sp.letters.map((L) => ev(parse(defsOf(ex)[L])));
  else fs = sp.fs.map((s) => ev(parse(s)));
  if (fs.some((v) => v.sign() === 0)) throw new Error(`${ex.id} : facteur nul`);
  const neg = fs.filter((v) => v.sign() < 0).length; const pos = fs.length - neg;
  // le signe de deux manières : parité du nombre de facteurs négatifs, produit exact
  const byParity = neg % 2 === 0 ? 1 : -1; const byProduct = fs.reduce((a, b) => a.mul(b), new Q(1n)).sign();
  if (byParity !== byProduct) throw new Error(`${ex.id} : parité ≠ produit`);
  return { neg, pos, s: byProduct };
}
const PREDICT = { 'MISC-IDA-ANYNEG': ({ neg }) => (neg >= 1 ? -1 : 1), 'MISC-IDA-MORENEG': ({ neg, pos }) => (neg > pos ? -1 : 1) };

/** Équation à une inconnue (□) : renvoie x, vérifié par substitution. */
function holeSolve(src) {
  const t = norm(src); const [l, r] = t.split('=');
  if (r === undefined) throw new Error(`pas d'égalité dans ${src}`);
  const L = parseNorm(l, src); const Rr = parseNorm(r, src);
  if (hasX(L) === hasX(Rr)) throw new Error(`l'inconnue doit être d'un seul côté dans ${src}`);
  const u = hasX(L) ? L : Rr; const c = ev(hasX(L) ? Rr : L);
  const f1 = ev(u, 'ok', new Q(1n)); const f2 = ev(u, 'ok', new Q(2n));
  let x; let form;
  if (f2.eq(f1.mul(new Q(2n)))) { x = c.div(f1); form = 'mul'; } else if (f2.mul(new Q(2n)).eq(f1)) { x = f1.div(c); form = 'inv'; } else throw new Error(`${src} : ni linéaire ni inverse`);
  if (!ev(u, 'ok', x).eq(c)) throw new Error(`${src} : la case ${x} ne vérifie pas l'égalité`);
  return { x, f1, c, form };
}
const holeIsland = (qq) => { const hit = islands(qq.statement).find((s) => s.includes('=') && /\\square/.test(s)); if (!hit) throw new Error(`aucune égalité à trou dans « ${qq.statement} »`); return hit; };
function holeCands({ x, f1, c, form }) {
  const out = new Map(); const put = (id, v) => { if (!out.has(id)) out.set(id, []); out.get(id).push(v); };
  put('MISC-QISMA-SIGN', x.neg());
  if (form === 'mul') { if (c.sign() !== 0) { put('MISC-QISMA-ORDER', f1.div(c)); put('MISC-QISMA-ORDER', c.div(f1)); } put('MISC-QISMA-DIST', c.sub(f1)); put('MISC-QISMA-DIST', c.add(f1)); put('MISC-QISMA-DIST', c.mul(f1)); put('MISC-QISMA-DIST', f1.sub(c)); }
  return out;
}

/* ── triangle magique et décompositions : force brute ──────────────────────── */
const permutations = (a) => (a.length < 2 ? [a] : a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
function magic(ex, sp) {
  const txt = `${ex.statement.content}`; const isl = islands(txt).map((s) => s.replace(/[−]/g, '-').trim());
  for (const v of [...sp.pool, sp.S, sp.M, sp.B]) if (!isl.includes(String(v))) throw new Error(`${ex.id} : ${v} absent de l'énoncé`);
  const sols = [];
  for (const [A, C, N, Pp] of permutations(sp.pool)) if (A + sp.M + sp.B === sp.S && A + N + C === sp.S && sp.B + Pp + C === sp.S) sols.push({ A, B: sp.B, C, M: sp.M, N, P: Pp });
  if (sols.length !== 1) throw new Error(`${ex.id} : ${sols.length} solutions (une seule attendue)`);
  return sols[0];
}
function decomp(ex, sp) {
  if (!islands(ex.statement.content).some((s) => lit(s.replace(/[−]/g, '-')).eq(new Q(BigInt(sp.n))))) throw new Error(`${ex.id} : ${sp.n} absent de l'énoncé`);
  const pairs = []; const m = Math.abs(sp.n);
  for (let a = -m; a <= m; a++) for (let b = a; b <= m; b++) if (a * b === sp.n) pairs.push([a, b]); // a ≤ b : sans ordre
  if (sp.ask === 'count') return pairs.length;
  if (sp.ask === 'minsum') return Math.min(...pairs.map(([a, b]) => a + b));
  if (sp.ask === 'zero') return pairs.filter(([a, b]) => a + b === 0).length;
  throw new Error(`decomp : ask « ${sp.ask} » inconnu`);
}

/* ── les kinds ─────────────────────────────────────────────────────────────── */
const KIND = {
  val: (ex, qq, sp) => R(ev(treeOf(ex, sp)).toString()),
  e: (ex, qq, sp) => R(ev(treeOf(ex, sp)).toString()),
  hole: (ex, qq) => R(holeSolve(holeIsland(qq)).x.toString()),
  optVal: (ex, qq, sp) => {
    const v = ev(treeOf(ex, sp));
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => ev(parseNorm(norm(islands(c.content)[0]))).eq(v)), qq.statement)));
  },
  sign: (ex, qq, sp) => {
    const { s } = signFacts(ex, sp);
    return C(letterOf(qq, exactlyOne(optText(qq).map((o) => WORD[o] === s), qq.statement)));
  },
  claim: (ex, qq, sp) => {
    const truth = ev(parse(sp.lhs)).eq(ev(parse(sp.rhs)));
    const isl = islands(qq.statement).find((t) => t.includes('=')) ?? '';
    // la phrase de la question redit l'égalité : son premier membre et son second se relisent et valent ceux de la spec
    const m = /^(.*)=(.*)$/.exec(norm(isl)); if (!m || !ev(parseNorm(m[1])).eq(ev(parse(sp.lhs))) || !ev(parseNorm(m[2])).eq(ev(parse(sp.rhs)))) throw new Error(`${qq.statement} : égalité de l'énoncé ≠ spec`);
    return C(letterOf(qq, exactlyOne(optText(qq).map((o) => YN(o) === truth), qq.statement)));
  },
  pt: (ex, qq, sp) => {
    const x = ev(parse(sp.ex)); const y = ev(parse(sp.ey));
    if (sp.sym) { // la symétrie annoncée donne la même ثنائية que l'expression retapée
      const [px, py] = sp.sym.p.map((v) => ev(parse(v)));
      const want = { origin: [px.neg(), py.neg()], xaxis: [px, py.neg()], yaxis: [px.neg(), py] }[sp.sym.k];
      if (!want || !want[0].eq(x) || !want[1].eq(y)) throw new Error(`${qq.statement} : la symétrie « ${sp.sym.k} » ne donne pas (${x} ; ${y})`);
    }
    if (sp.mult) {
      const k = ev(parse(sp.mult.k)); const [px, py] = sp.mult.p.map((v) => ev(parse(v)));
      if (!px.mul(k).eq(x) || !py.mul(k).eq(y)) throw new Error(`${qq.statement} : le produit par ${k} ne donne pas (${x} ; ${y})`);
    }
    if (sp.mid) {
      const [[x1, y1], [x2, y2]] = sp.mid.map((p) => p.map((v) => ev(parse(v))));
      if (!x1.add(x2).div(new Q(2n)).eq(x) || !y1.add(y2).div(new Q(2n)).eq(y)) throw new Error(`${qq.statement} : le milieu ne donne pas (${x} ; ${y})`);
    }
    return P(x.toString(), y.toString());
  },
  magic: (ex, qq, sp) => R(magic(ex, sp)[sp.cell]),
  magicProd: (ex, qq, sp) => { const s = magic(ex, sp); return R(sp.cells.map((c) => new Q(BigInt(s[c]))).reduce((a, b) => a.mul(b), new Q(1n)).toString()); },
  decomp: (ex, qq, sp) => R(decomp(ex, sp)),
};

/* ── les questions (généré une fois, relu et maintenu à la main ensuite) ───── */
const SPEC = {
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-001:q1": {"k":"val","of":"A"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-001:q2": {"k":"val","of":"B"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-001:q3": {"k":"val","of":"C"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-001:q4": {"k":"sign","letters":["A","B","C"]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-002:q1": {"k":"val","of":"E"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-002:q2": {"k":"val","of":"F"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-002:q3": {"k":"val","of":"G"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-002:q4": {"k":"optVal","e":"(G)/(E)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-003:q1": {"k":"sign","of":"P"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-003:q2": {"k":"sign","of":"Q"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-003:q3": {"k":"sign","of":"R"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-003:q4": {"k":"val","of":"Q"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-004:q1": {"k":"optVal","e":"(-4.2)/(-0.6)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-004:q2": {"k":"optVal","e":"7-(-2.5)*4"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-004:q3": {"k":"optVal","e":"(-8)*(-3)+(-24)/(-4)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-005:q1": {"k":"val","of":"A"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-005:q2": {"k":"val","of":"B"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-005:q3": {"k":"val","of":"C"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-005:q4": {"k":"claim","lhs":"(-2)^2","rhs":"-4","lab":"MISC-IDA-SQUARENEG"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-006:q1": {"k":"val","of":"A"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-006:q2": {"k":"val","of":"B"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-006:q3": {"k":"val","of":"C"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-007:q1": {"k":"hole","eq":"(-6)*x=15"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-007:q2": {"k":"hole","eq":"x*(-0.4)=-2"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-007:q3": {"k":"hole","eq":"x/(-3)=-8"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-007:q4": {"k":"hole","eq":"18/x=-4.5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-008:q1": {"k":"val","of":"A"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-008:q2": {"k":"val","of":"B"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-008:q3": {"k":"val","of":"C"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-008:q4": {"k":"e","e":"(-2.5)*((-18)+(-2))"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-009:q1": {"k":"magic","S":4,"M":3,"B":4,"pool":[-3,2,5,-2],"cell":"A"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-009:q2": {"k":"magic","S":4,"M":3,"B":4,"pool":[-3,2,5,-2],"cell":"C"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-009:q3": {"k":"magic","S":4,"M":3,"B":4,"pool":[-3,2,5,-2],"cell":"P"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-009:q4": {"k":"magicProd","S":4,"M":3,"B":4,"pool":[-3,2,5,-2],"cells":["A","N","C"]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-010:q1": {"k":"decomp","n":-30,"ask":"count"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-010:q2": {"k":"decomp","n":-30,"ask":"minsum"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-010:q3": {"k":"decomp","n":-30,"ask":"zero"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l1-010:q4": {"k":"hole","eq":"(-2)*(-3)*x=-30"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-001:q1": {"k":"e","e":"9+(-2.5)*6"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-001:q2": {"k":"e","e":"(-1-9)/(-2.5)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-001:q3": {"k":"e","e":"9+(-2.5)*(-2)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-002:q1": {"k":"e","e":"(-45)+7.5*4"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-002:q2": {"k":"e","e":"(0-(-45))/7.5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-002:q3": {"k":"e","e":"(-45)+7.5*(-3)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-003:q1": {"k":"e","e":"(-6)+2+(-1)+(-9)+4"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-003:q2": {"k":"e","e":"((-6)+2+(-1)+(-9)+4)/5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-003:q3": {"k":"e","e":"4-(-9)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-003:q4": {"k":"e","e":"((-6)+2+(-1)+(-9)+4+(-8))/6"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-004:q1": {"k":"optVal","e":"14-(-6)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-004:q2": {"k":"optVal","e":"(14+(-6))/2"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-004:q3": {"k":"e","e":"3-(-11)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-004:q4": {"k":"e","e":"(14-(-6))-(3-(-11))"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-005:q1": {"k":"e","e":"560+(-3.5)*40"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-005:q2": {"k":"e","e":"(0-560)/(-3.5)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-005:q3": {"k":"e","e":"(-35-560)/(-3.5)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-006:q1": {"k":"e","e":"(-18)+2.4*5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-006:q2": {"k":"e","e":"(0-(-18))/2.4"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-006:q3": {"k":"e","e":"(-18)+2.4*(-2)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-007:q1": {"k":"claim","lhs":"(-4)*(-2.5)+3","rhs":"-7","lab":"MISC-JIDAA-NEGNEG"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-007:q2": {"k":"claim","lhs":"-6-(-2)","rhs":"-8","lab":"MISC-QISMA-SUBNEG"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-007:q3": {"k":"claim","lhs":"(-12)/(-0.5)","rhs":"24","lab":"MISC-QISMA-SIGN"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-007:q4": {"k":"e","e":"(-5.5)-4"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-008:q1": {"k":"e","e":"4.2+(-0.35)*12"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-008:q2": {"k":"e","e":"(-1.4-4.2)/(-0.35)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-008:q3": {"k":"e","e":"4.2+(-0.35)*(-5)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-009:q1": {"k":"e","e":"9-(-17)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-009:q2": {"k":"e","e":"46-(-2)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-009:q3": {"k":"e","e":"38-(-7)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-009:q4": {"k":"e","e":"(9+(-17))/2+273.15"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-010:q1": {"k":"e","e":"(2400-400)/100"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-010:q2": {"k":"e","e":"19.5+(-0.65)*((2400-400)/100)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-010:q3": {"k":"e","e":"19.5+(-0.65)*((0-400)/100)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l2-010:q4": {"k":"e","e":"400+((0-19.5)/(-0.65))*100"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-001:q1": {"k":"e","e":"2160+(-135)*8"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-001:q2": {"k":"e","e":"(0-2160)/(-135)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-001:q3": {"k":"e","e":"2160+(-135)*(-4)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-002:q1": {"k":"e","e":"1850+(-920)+640+(-1300)+410"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-002:q2": {"k":"e","e":"(1850+(-920)+640+(-1300)+410)/5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-002:q3": {"k":"e","e":"(1850+(-920)+640+(-1300)+410+(-1100))/6"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-003:q1": {"k":"e","e":"15*4+6*(-2)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-003:q2": {"k":"e","e":"9*4+11*(-2)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-003:q3": {"k":"e","e":"(-6)/(-2)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-004:q1": {"k":"e","e":"3+(-1)+0+(-2)+4"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-004:q2": {"k":"optVal","e":"((-2)+(-1)+3+(-4)+(-1))/5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-004:q3": {"k":"e","e":"(3+(-1)+0+(-2)+4)+((-2)+(-1)+3+(-4)+(-1))"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-005:q1": {"k":"e","e":"40+4*25+5*(-15)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-005:q2": {"k":"e","e":"2*25+7*(-15)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-005:q3": {"k":"e","e":"(-90)/(-15)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-006:q1": {"k":"e","e":"(-350)+120+(-80)+(-215)+60"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-006:q2": {"k":"e","e":"((-350)+120+(-80)+(-215)+60)/5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-006:q3": {"k":"optVal","e":"(-465)-(-215)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-007:q1": {"k":"e","e":"3*275+4*(-360)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-007:q2": {"k":"e","e":"1800+(3*275+4*(-360))"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-007:q3": {"k":"e","e":"(-1800)/(-360)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-008:q1": {"k":"e","e":"2.5+(-3)+0.5+(-4.5)+1.5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-008:q2": {"k":"e","e":"(2.5+(-3)+0.5+(-4.5)+1.5)/5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-008:q3": {"k":"e","e":"10+(2.5+(-3)+0.5+(-4.5)+1.5)/5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-009:q1": {"k":"e","e":"(-21000)+1750*6"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-009:q2": {"k":"e","e":"(-21000)/(-1750)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-009:q3": {"k":"e","e":"(-21000)+1750*(-2)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-010:q1": {"k":"magic","S":-1,"M":3,"B":-4,"pool":[0,4,-5,-1],"cell":"A"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-010:q2": {"k":"magic","S":-1,"M":3,"B":-4,"pool":[0,4,-5,-1],"cell":"C"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-010:q3": {"k":"magic","S":-1,"M":3,"B":-4,"pool":[0,4,-5,-1],"cell":"N"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-010:q4": {"k":"magicProd","S":-1,"M":3,"B":-4,"pool":[0,4,-5,-1],"cells":["B","P","C"]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l3-010:q5": {"k":"magicProd","S":-1,"M":3,"B":-4,"pool":[0,4,-5,-1],"cells":["A","M","B"]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-001:q1": {"k":"pt","ex":"-(-5)","ey":"-(2)","sym":{"p":["-5","2"],"k":"origin"},"sigs":[["MISC-WIDMAJ-ONECOORD","-(-5)","2"],["MISC-WIDMAJ-ONECOORD","-5","-(2)"]]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-001:q2": {"k":"pt","ex":"3","ey":"-(-4)","sym":{"p":["3","-4"],"k":"xaxis"},"sigs":[["MISC-WIDMAJ-AXIS","-(3)","-4"]]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-001:q3": {"k":"e","e":"(-5)*2"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-002:q1": {"k":"pt","ex":"(-2.5)*(-2)","ey":"4*(-2)","mult":{"p":["-2.5","4"],"k":"-2"},"sigs":[["MISC-JIDAA-NEGNEG","-5","-8"]]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-002:q2": {"k":"pt","ex":"8/(-2)","ey":"(-10)/(-2)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-002:q3": {"k":"e","e":"(-27)/9"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-003:q1": {"k":"pt","ex":"((-6)+2)/2","ey":"((-4)+(-8))/2","mid":[["-6","-4"],["2","-8"]],"sigs":[["MISC-WIDMAJ-MEANDIFF","((-6)-2)/2","((-4)-(-8))/2"]]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-003:q2": {"k":"pt","ex":"((-6)+8)/2","ey":"((-4)+(-12))/2","mid":[["-6","-4"],["8","-12"]],"sigs":[["MISC-WIDMAJ-MEANDIFF","((-6)-8)/2","((-4)-(-12))/2"]]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-004:q1": {"k":"pt","ex":"-(-7)","ey":"-(3)","sym":{"p":["-7","3"],"k":"origin"},"sigs":[["MISC-WIDMAJ-ONECOORD","-(-7)","3"],["MISC-WIDMAJ-ONECOORD","-7","-(3)"]]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-004:q2": {"k":"pt","ex":"-(-7)","ey":"3","sym":{"p":["-7","3"],"k":"yaxis"},"sigs":[["MISC-WIDMAJ-AXIS","-7","-(3)"]]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-004:q3": {"k":"pt","ex":"-7","ey":"-(3)","sym":{"p":["-7","3"],"k":"xaxis"},"sigs":[["MISC-WIDMAJ-AXIS","-(-7)","3"]]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-005:q1": {"k":"pt","ex":"(-1.5)*(-2)","ey":"8/(-4)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-005:q2": {"k":"pt","ex":"6*(-2)","ey":"(-2.5)/(-4)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-005:q3": {"k":"pt","ex":"10/(-2)","ey":"(-3)*(-4)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-006:q1": {"k":"sign","fs":["(-2)","(-7)","3","(-6)","4","1"]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-006:q2": {"k":"sign","fs":["(-5)","(-1)","(-4)","(-3)","2","6"]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-006:q3": {"k":"e","e":"(-7)*(-6)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-007:q1": {"k":"pt","ex":"4+(-2)*5","ey":"(-7)+3*5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-007:q2": {"k":"pt","ex":"4+(-2)*(-3)","ey":"(-7)+3*(-3)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-007:q3": {"k":"e","e":"(-10-4)/(-2)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-008:q1": {"k":"pt","ex":"-(-8)","ey":"-(5)","sym":{"p":["-8","5"],"k":"origin"},"sigs":[["MISC-WIDMAJ-ONECOORD","-(-8)","5"],["MISC-WIDMAJ-ONECOORD","-8","-(5)"]]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-008:q2": {"k":"pt","ex":"((-8)+8)/2","ey":"(5+(-5))/2","mid":[["-8","5"],["8","-5"]],"sigs":[["MISC-WIDMAJ-MEANDIFF","((-8)-8)/2","(5-(-5))/2"]]},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-009:q1": {"k":"e","e":"(-8)*5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-009:q2": {"k":"e","e":"5/(-8)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-009:q3": {"k":"e","e":"(-8)+5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-010:q1": {"k":"e","e":"(-9)/3"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-010:q2": {"k":"e","e":"12/(-6)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l4-010:q3": {"k":"pt","ex":"3*(-9)","ey":"(-6)/12"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-001:q1": {"k":"e","e":"1.8*(-7)+32"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-001:q2": {"k":"optVal","e":"(5-32)/1.8"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-001:q3": {"k":"e","e":"(-7)-(-15)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-001:q4": {"k":"optVal","e":"((-7)+(-15))/2"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-002:q1": {"k":"e","e":"1.8*(-20)+32"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-002:q2": {"k":"e","e":"(-31-32)/1.8"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-002:q3": {"k":"e","e":"(-20)-(-35)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-003:q1": {"k":"e","e":"1.8*(-8)+32"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-003:q2": {"k":"e","e":"(23-32)/1.8"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-003:q3": {"k":"e","e":"(-5)-(-8)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-004:q1": {"k":"optVal","e":"1.8*(-12)+32"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-004:q2": {"k":"optVal","e":"(-22-32)/1.8"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-004:q3": {"k":"e","e":"1.8*(-30)+32"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-005:q1": {"k":"e","e":"10.4+(-4)+14"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-005:q2": {"k":"e","e":"(10.4+(-4)+14)/3"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-005:q3": {"k":"optVal","e":"(6.8-32)/1.8"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-006:q1": {"k":"e","e":"41+(-3.6)*5"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-006:q2": {"k":"e","e":"(23-32)/1.8"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-006:q3": {"k":"e","e":"(32-41)/(-3.6)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-007:q1": {"k":"e","e":"1.8*10+32"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-007:q2": {"k":"e","e":"1.8*(-6)+32"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-007:q3": {"k":"e","e":"50-21.2"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-007:q4": {"k":"claim","lhs":"1.8*16","rhs":"28.8","lab":"MISC-JIDAA-ADD"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-008:q1": {"k":"e","e":"1.8*(-6)+32"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-008:q2": {"k":"e","e":"(10.4-32)/1.8"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-008:q3": {"k":"e","e":"(-6)-(-12)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-009:q1": {"k":"e","e":"1.8*(-9)+32"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-009:q2": {"k":"e","e":"(-4-32)/1.8"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-009:q3": {"k":"e","e":"(-9)-(-20)"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-010:q1": {"k":"e","e":"1.8*(-11)+32"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-010:q2": {"k":"e","e":"(0.5-32)/1.8"},
  "ex-3am-wadiya-idmajiya-aadad-nisbiya-l5-010:q3": {"k":"e","e":"((-11)+(-17.5))/2"},
};

export const ORACLE = {};
for (const [key, sp] of Object.entries(SPEC)) {
  const [exId, qId] = key.split(':'); const ex = BANK.get(exId);
  if (!ex) throw new Error(`oracle wadiya : feuille ${exId} introuvable`);
  const qq = ex.questions.find((x) => x.id === qId); if (!qq) throw new Error(`oracle wadiya : ${key} introuvable`);
  if (!KIND[sp.k]) throw new Error(`oracle wadiya : kind « ${sp.k} » inconnu (${key})`);
  ORACLE[key] = KIND[sp.k](ex, qq, sp);
}

/* ── audit : étiquettes MISC-* ─────────────────────────────────────────────── */
const MISC = /^MISC-(QISMA-(SIGN|ORDER|DIST|PRIORITY|SUBNEG)|JIDAA-(NEGNEG|ADD|LARGER)|IDA-(SQUARENEG|ANYNEG|MORENEG)|WIDMAJ-(ADDMAX|MEANDIFF|REVCHAIN|DROPNEG|AXIS|ONECOORD))$/;

/** Les valeurs de chaque erreur pour une question à clé numérique : Map id → [Q] (ou null si aucune erreur n'est calculable). */
function numericCands(ex, qq, sp) {
  switch (sp.k) {
    case 'val': case 'e': case 'optVal': return cands(treeOf(ex, sp));
    case 'hole': return holeCands(holeSolve(holeIsland(qq)));
    default: return null;
  }
}

/** Signatures d'une ثنائية : seulement pour les symétries (`sym`) et les milieux (`mid`), jamais ailleurs. */
function pointSigs(sp) {
  const out = new Map(); const put = (id, a, b) => { if (!out.has(id)) out.set(id, []); out.get(id).push([a, b]); };
  if (sp.sym) {
    const [px, py] = sp.sym.p.map((v) => ev(parse(v)));
    if (sp.sym.k === 'origin') { put('MISC-WIDMAJ-ONECOORD', px.neg(), py); put('MISC-WIDMAJ-ONECOORD', px, py.neg()); }
    if (sp.sym.k === 'xaxis') put('MISC-WIDMAJ-AXIS', px.neg(), py); // symétrique par rapport à l'autre axe
    if (sp.sym.k === 'yaxis') put('MISC-WIDMAJ-AXIS', px, py.neg());
  }
  if (sp.mult) { // chaque coordonnée × k ; « moins par moins = moins » sur la coordonnée négative
    const k = ev(parse(sp.mult.k)); const [px, py] = sp.mult.p.map((v) => ev(parse(v)));
    const wrong = (c) => (c.sign() < 0 && k.sign() < 0 ? c.mul(k).abs().neg() : c.mul(k));
    put('MISC-JIDAA-NEGNEG', wrong(px), wrong(py));
  }
  if (sp.mid) {
    const [[x1, y1], [x2, y2]] = sp.mid.map((p) => p.map((v) => ev(parse(v))));
    put('MISC-WIDMAJ-MEANDIFF', x1.sub(x2).div(new Q(2n)), y1.sub(y2).div(new Q(2n)));
  }
  return out;
}
export function audit(bank) {
  const problems = [];
  for (const { key } of bank) {
    const [exId, qId] = key.split(':'); const ex = BANK.get(exId); const qq = ex?.questions.find((x) => x.id === qId);
    if (!qq) { problems.push(`${key} : introuvable dans le banc de l'oracle`); continue; }
    const sp = SPEC[key];
    if (qq.answerType === 'selfCheck') continue;
    if (!sp) { problems.push(`${key} : aucune spec d'oracle`); continue; }
    try {
      if (qq.answerType === 'rational') {
        const e = String(qq.expectedAnswer);
        if (!/^-?\d+(\.\d+)?$|^-?\d+\/\d+$/.test(e)) problems.push(`${key} : clé illisible « ${e} »`);
        const cs = numericCands(ex, qq, sp);
        for (const s of qq.misconceptionSignatures ?? []) {
          if (!MISC.test(s.id)) { problems.push(`${key} : signature ${s.id} hors du jeu autorisé`); continue; }
          if (lit(s.value).eq(lit(e))) problems.push(`${key} : la signature ${s.id} (${s.value}) est la bonne réponse`);
          if (!cs) { problems.push(`${key} : signature ${s.id} sur une question sans erreur calculable (${sp.k})`); continue; }
          if (!inList(cs.get(s.id), lit(s.value))) problems.push(`${key} : la signature ${s.id} (${s.value}) n'est pas la valeur que cette erreur produit`);
        }
      } else if (qq.answerType === 'point') {
        const ok = pointSigs(sp);
        for (const s of qq.misconceptionSignatures ?? []) {
          if (!MISC.test(s.id)) { problems.push(`${key} : signature ${s.id} hors du jeu autorisé`); continue; }
          const v = [lit(s.value.x), lit(s.value.y)];
          if (v[0].eq(lit(qq.expectedAnswer.x)) && v[1].eq(lit(qq.expectedAnswer.y))) problems.push(`${key} : la signature ${s.id} est la bonne réponse`);
          if (!ok.has(s.id) || !ok.get(s.id).some((w) => w[0].eq(v[0]) && w[1].eq(v[1]))) problems.push(`${key} : la signature ${s.id} (${s.value.x} ; ${s.value.y}) n'est pas ce que produit cette erreur`);
        }
      } else if (qq.answerType === 'choice') {
        const good = qq.choices.filter((c) => c.isCorrect);
        if (good.length !== 1) problems.push(`${key} : ${good.length} bonnes options`);
        for (const c of qq.choices.filter((x) => !x.isCorrect)) {
          if (!c.misconceptionId || !MISC.test(c.misconceptionId)) { problems.push(`${key} : le distracteur ${c.id} ne porte pas d'étiquette MISC autorisée`); continue; }
          const ok = checkDistractor(ex, qq, sp, c);
          if (ok !== true) problems.push(`${key} : le distracteur ${c.id} (${c.misconceptionId}) ${ok}`);
        }
      }
    } catch (err) { problems.push(`${key} : ${err.message}`); }
  }
  return problems;
}

/** true si le distracteur `c` vaut ce que l'erreur annoncée produit ; sinon un message. */
function checkDistractor(ex, qq, sp, c) {
  const id = c.misconceptionId;
  switch (sp.k) {
    case 'sign': {
      const facts = signFacts(ex, sp); const pred = PREDICT[id];
      if (!pred) return 'doit porter ANYNEG ou MORENEG (erreur de signe d\'un produit)';
      const word = c.content.trim(); if (WORD[word] === facts.s) return 'est en réalité juste';
      return pred(facts) === WORD[word] ? true : 'ne vaut pas le signe que prédit cette erreur';
    }
    case 'claim': {
      const lhs = parse(sp.lhs); const rhs = ev(parse(sp.rhs)); const truth = ev(lhs).eq(rhs); const cs = cands(lhs);
      const word = YN(c.content.trim());
      if (word === truth) return 'est en réalité juste';
      // option fausse « صحيح » (égalité fausse) : l'erreur doit PRODUIRE le second membre ; option fausse « خطأ » (égalité vraie) : l'erreur doit produire une autre valeur
      if (!truth) return inList(cs.get(id), rhs) ? true : `ne produit pas ${rhs} sur ${sp.lhs}`;
      return (cs.get(id) ?? []).some((v) => !v.eq(rhs)) ? true : 'ne change pas la valeur du premier membre';
    }
    case 'optVal': {
      const cs = cands(treeOf(ex, sp)); const v = ev(parseNorm(norm(islands(c.content)[0])));
      return inList(cs.get(id), v) ? true : `vaut ${v} qui n'est pas ce que produit cette erreur`;
    }
    default: return `kind ${sp.k} sans règle de distracteur`;
  }
}
