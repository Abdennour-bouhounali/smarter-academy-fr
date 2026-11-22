// Oracle du banc « qismat-nisbiyayn » (حاصل قسمة عددين نسبيين, 3AM unité 1, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer` ni dans le code de la leçon (relativeOps.js) :
//  - l'évaluateur est écrit dans ce fichier : rationnels EXACTS en BigInt, priorités, crochets, moins unaire, décimaux à virgule,
//    fractions `\dfrac{a}{b}` (rien n'est importé de packages/core) ;
//  - les expressions de l'ÉNONCÉ (formules `A = …` de la feuille, îlots `$…$` de la question) sont RELUES dans les fichiers du banc ;
//    là où le nombre vit dans un récit (température, moyenne, durée…), l'expression est RETAPÉE ici en ASCII (`e`) ;
//  - une case « □ » se résout par `manquant = a ÷ b` (ou `a × b` pour un dividende) puis se RE-VÉRIFIE en remplaçant la case
//    dans l'égalité (multiplication) ;
//  - un arrondi/encadrement est recalculé sur la fraction exacte (arrondi « demi vers le haut » à la décimale demandée) ;
//  - un QCM n'a qu'une seule bonne option : chaque option est évaluée et l'oracle échoue si le nombre d'options justes n'est pas 1 ;
//  - `audit` contrôle les étiquettes : chaque `misconceptionSignatures` et chaque distracteur étiqueté MISC-QISMA-* vaut
//    EXACTEMENT la valeur que cette erreur produit (SIGN : signe faux ; ORDER : ordre inversé ; DIST : on soustrait / multiplie
//    les distances ; DECIMAL : fausse place de la virgule ; PRIORITY : calcul de gauche à droite ; SUBNEG : 7 − (−6) = 1 ;
//    FRACSIGN : signe mal déplacé dans une écriture fractionnaire ; ZERO : « on peut diviser par 0 »).
// Les questions selfCheck (« بيّن أنّ ») n'ont pas de clé et ne figurent pas ici.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

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
  isInt() { return this.d === 1n; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
const num = (s) => { const [i, f = ''] = s.split('.'); return new Q(BigInt(i + f), 10n ** BigInt(f.length)); };
/** « 1.428 », « -3/4 », « 12 » → Q. */
const lit = (s) => { s = String(s).trim().replace(',', '.'); const neg = s.startsWith('-'); if (neg) s = s.slice(1); const [a, b] = s.split('/'); const v = b === undefined ? num(a) : num(a).div(num(b)); return neg ? v.neg() : v; };

/* ── LaTeX de l'énoncé → syntaxe de l'oracle ──────────────────────────────── */
function group(s, i) { // s[i] === '{' ; rend [contenu, indice après '}']
  if (s[i] !== '{') throw new Error(`« { » attendu dans ${s}`);
  let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (d === 0) return [s.slice(i + 1, j), j + 1]; } }
  throw new Error(`accolade non fermée dans ${s}`);
}
function dfracs(s) {
  let out = ''; let i = 0;
  while (i < s.length) {
    const m = /^\\d?frac/.exec(s.slice(i));
    if (m) { i += m[0].length; while (s[i] === ' ') i++; const [a, j] = group(s, i); const [b, k] = group(s, j); out += `((${dfracs(a)})/(${dfracs(b)}))`; i = k; } else out += s[i++];
  }
  return out;
}
/** `subs` : {a:'(-3)', b:'(7)'} remplace les lettres après la mise en forme. */
const norm = (s, subs = null) => {
  let t = dfracs(String(s)).replace(/\$/g, '').replace(/\\left|\\right/g, '').replace(/\\times|\\cdot/g, '*').replace(/\\div/g, '/')
    .replace(/\\square/g, 'x').replace(/\{,\}/g, '.').replace(/(\d),(\d)/g, '$1.$2').replace(/[−‒–]/g, '-')
    .replace(/\\,|\\;|\\ /g, '').replace(/\s+/g, '');
  if (subs) t = t.replace(/[ab]/g, (c) => subs[c]);
  return t.replace(/\)\(/g, ')*(').replace(/(\d)\(/g, '$1*(').replace(/(\d)x/g, '$1*x').replace(/\)x/g, ')*x');
};

/* ── analyse en arbre ──────────────────────────────────────────────────────── */
// nœuds : {t:'n',v} {t:'x'} {t:'u',c} {t:'p',c} {t:'b',op,l,r}
function parseNorm(t, src = t) {
  let i = 0; const peek = () => t[i];
  const expr = () => { let v = term(); while (peek() === '+' || peek() === '-') { const op = t[i++]; v = { t: 'b', op, l: v, r: term() }; } return v; };
  const term = () => { let v = unary(); while (peek() === '*' || peek() === '/') { const op = t[i++]; v = { t: 'b', op, l: v, r: unary() }; } return v; };
  const unary = () => { if (peek() === '-') { i++; return { t: 'u', c: unary() }; } if (peek() === '+') { i++; return unary(); } return primary(); };
  const primary = () => {
    if (peek() === '(' || peek() === '[') { const close = peek() === '(' ? ')' : ']'; i++; const v = expr(); if (t[i++] !== close) throw new Error(`« ${close} » attendu dans ${src}`); return { t: 'p', c: v }; }
    if (peek() === 'x') { i++; return { t: 'x' }; }
    const m = /^\d+(\.\d+)?/.exec(t.slice(i)); if (!m) throw new Error(`lecture impossible à ${i} dans « ${src} » (normalisé « ${t} »)`); i += m[0].length; return { t: 'n', v: num(m[0]) };
  };
  const v = expr(); if (i !== t.length) throw new Error(`reste « ${t.slice(i)} » dans « ${src} »`); return v;
}
const hasX = (n) => n.t === 'x' || (n.t === 'u' || n.t === 'p' ? hasX(n.c) : n.t === 'b' ? hasX(n.l) || hasX(n.r) : false);

/** mode : 'ok' | 'flat' (gauche → droite) | 'subneg' (7 − (−6) = 7 − 6) | 'divsign' (négatif ÷ négatif = négatif). */
function ev(n, mode = 'ok', x = null) {
  switch (n.t) {
    case 'n': return n.v;
    case 'x': if (x === null) throw new Error('inconnue non résolue'); return x;
    case 'u': return ev(n.c, mode, x).neg();
    case 'p': return ev(n.c, mode, x);
    default: {
      if (mode === 'flat') return flat(n, x);
      return apply(n.op, ev(n.l, mode, x), ev(n.r, mode, x), mode);
    }
  }
}
function apply(op, a, b, mode) {
  if (op === '+') return a.add(b);
  if (op === '-') return a.sub(mode === 'subneg' && b.sign() < 0 ? b.abs() : b);
  if (op === '*') return a.mul(b);
  const q = a.div(b); return mode === 'divsign' && a.sign() < 0 && b.sign() < 0 ? q.abs().neg() : q;
}
function seq(n) { return n.t === 'b' ? [...seq(n.l), n.op, ...seq(n.r)] : [n]; }
function flat(n, x) { const s = seq(n); let v = ev(s[0], 'flat', x); for (let k = 1; k < s.length; k += 2) v = apply(s[k], v, ev(s[k + 1], 'flat', x), 'flat'); return v; }
const evalText = (src, subs) => ev(parseNorm(norm(src, subs), src));

/** La division racine d'une expression (en dépliant les parenthèses) : [a, b] valeurs, ou null. */
function rootQuot(n) { while (n.t === 'p') n = n.c; return n.t === 'b' && n.op === '/' ? [ev(n.l), ev(n.r)] : null; }

/** Les valeurs que chaque erreur nommée produit sur l'expression `n` (miroir des étiquettes MISC-QISMA-*). */
function cands(n) {
  const base = ev(n); const out = { SIGN: [], ORDER: [], DIST: [], DECIMAL: [], PRIORITY: [], SUBNEG: [] };
  const rq = rootQuot(n);
  if (rq && rq[1].sign() !== 0) {
    const [a, b] = rq;
    out.SIGN.push(base.neg());
    if (a.sign() !== 0) out.ORDER.push(b.div(a));
    out.DIST.push(a.sub(b), a.mul(b));
    for (const k of [1, -1, 2, -2]) out.DECIMAL.push(base.mul(new Q(k > 0 ? 10n ** BigInt(k) : 1n, k > 0 ? 1n : 10n ** BigInt(-k))));
  }
  out.SIGN.push(ev(n, 'divsign'));
  let top = n; while (top.t === 'p') top = top.c;
  if (top.t === 'b') out.PRIORITY.push(ev(top, 'flat'));
  out.SUBNEG.push(ev(n, 'subneg'));
  out.FRACSIGN = out.SIGN;
  return out;
}
const inList = (list, v) => list.some((w) => w.eq(v));

/* ── lecture du banc ───────────────────────────────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bankDir = join(here, '..', '..', 'content', 'practice', '3am', 'qismat-nisbiyayn');
const BANK = new Map();
for (const lvl of readdirSync(bankDir).filter((d) => d.startsWith('level-'))) {
  for (const f of readdirSync(join(bankDir, lvl)).filter((x) => x.endsWith('.json'))) {
    const ex = JSON.parse(readFileSync(join(bankDir, lvl, f), 'utf8')); BANK.set(ex.id, ex);
  }
}
const islands = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const defsOf = (ex) => Object.fromEntries((ex.statement.formulas ?? []).map((f) => { const k = f.indexOf('='); return [f.slice(0, k).trim(), f.slice(k + 1).trim()]; }));
const opIsland = (text) => { const hit = islands(text).find((s) => /\\times|\\div|\\dfrac/.test(s)); if (!hit) throw new Error(`aucune expression dans « ${text} »`); return hit; };
const exactlyOne = (flags, what) => { const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0); if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`); return hits[0]; };
const letterOf = (qq, k) => qq.choices[k].id;
const optText = (qq) => qq.choices.map((c) => c.content.replace(/\$/g, '').trim());
const WORD = { 'موجب': 1, 'سالب': -1 };
const YN = (txt) => (/^(صحيح|نعم)/.test(txt) ? true : /^(خاطئ|لا)/.test(txt) ? false : null);

/** Remplace les étiquettes de définitions (A, B, V, E…) d'une expression ASCII retapée par leur contenu lu dans la feuille. */
function withDefs(ex, e) {
  const defs = defsOf(ex);
  return String(e).replace(/[A-Z]/g, (L) => { if (defs[L] === undefined) throw new Error(`${ex.id} : « ${L} » non défini`); return `(${norm(defs[L])})`; });
}
/** L'expression visée : retapée (`e`), définie par la feuille (`of`), ou lue dans l'énoncé. */
function exprOf(ex, qq, sp) {
  if (sp.e !== undefined) return withDefs(ex, sp.e);
  if (sp.of !== undefined) { const d = defsOf(ex)[sp.of]; if (d === undefined) throw new Error(`${ex.id} : « ${sp.of} » non défini`); return norm(d); }
  return norm(opIsland(qq.statement));
}
const treeOf = (ex, qq, sp) => parseNorm(exprOf(ex, qq, sp));
const textOf = (ex, qq) => `${qq.statement} ${qq.lead ?? ''} ${ex.statement.content ?? ''}`;

/** Signes de a et b annoncés par l'énoncé (« $a$ عدد سالب و $b$ عدد موجب »). */
function lettersSigns(ex, qq) {
  const t = textOf(ex, qq);
  const a = /\$a\$ عدد (?:نسبي )?(سالب|موجب)/.exec(t); const b = /\$b\$ عدد (?:نسبي )?(سالب|موجب)/.exec(t);
  if (!a || !b) throw new Error(`${ex.id} : signes de a et b introuvables dans l'énoncé`);
  return { a: WORD[a[1]], b: WORD[b[1]] };
}
const lettersSubs = (sg) => ({ a: sg.a > 0 ? '(3)' : '(-3)', b: sg.b > 0 ? '(7)' : '(-7)' });

/** Équation à une inconnue (□ ou x) : [côté contenant x, valeur de l'autre côté]. */
function equation(src) {
  const t = norm(src); const [l, r] = t.split('=');
  if (r === undefined) throw new Error(`pas d'égalité dans ${src}`);
  const L = parseNorm(l, src); const Rr = parseNorm(r, src);
  if (hasX(L) === hasX(Rr)) throw new Error(`l'inconnue doit être d'un seul côté dans ${src}`);
  return hasX(L) ? { u: L, c: ev(Rr), other: Rr } : { u: Rr, c: ev(L), other: L };
}
/** Résout `n(x) = target` pour un seul x (en descendant dans l'arbre) et renvoie aussi (k, c) de la dernière opération. */
function solve(n, target, trace = {}) {
  if (n.t === 'x') return target;
  if (n.t === 'p') return solve(n.c, target, trace);
  if (n.t === 'u') return solve(n.c, target.neg(), trace);
  const xl = hasX(n.l); const known = ev(xl ? n.r : n.l);
  if (n.op === '*') { trace.form = 'mul'; trace.k = known; trace.c = target; return solve(xl ? n.l : n.r, target.div(known), trace); }
  if (n.op === '/') {
    if (xl) { trace.form = 'dvd'; trace.k = known; trace.c = target; return solve(n.l, target.mul(known), trace); }
    trace.form = 'dvs'; trace.k = known; trace.c = target; return solve(n.r, known.div(target), trace);
  }
  throw new Error('équation à trou : seulement × et ÷');
}
function holeValue(src) {
  const { u, c } = equation(src); const trace = {}; const x = solve(u, c, trace);
  // re-vérification : on remet x dans l'égalité (multiplication / division)
  if (!ev(u, 'ok', x).eq(c)) throw new Error(`${src} : la case ${x} ne vérifie pas l'égalité`);
  return { x, ...trace };
}
function holeCands({ x, k, c }) {
  const out = { SIGN: [x.neg()], ORDER: [], DIST: [c.sub(k), c.add(k), c.mul(k), k.sub(c)], DECIMAL: [], PRIORITY: [], SUBNEG: [] };
  if (c.sign() !== 0) out.ORDER.push(k.div(c));
  if (k.sign() !== 0) out.ORDER.push(c.div(k));
  out.FRACSIGN = out.SIGN; return out;
}
const holeSrc = (ex, qq, sp) => (sp.of !== undefined ? defsOf(ex)[sp.of] : islands(qq.statement).find((s) => /\\square|=/.test(s) && /\\square|x/.test(s)));
const eqIsland = (qq) => { const hit = islands(qq.statement).find((s) => s.includes('=') && /\\square|\bx\b/.test(s)); if (!hit) throw new Error(`aucune égalité à trou dans « ${qq.statement} »`); return hit; };

/** 10^p en Q. */
const pow10 = (p) => new Q(10n ** BigInt(p));
const floorQ = (v) => { const q = v.n / v.d; return v.n < 0n && v.n % v.d !== 0n ? q - 1n : q; };
function roundAt(v, p, mode) {
  const s = pow10(p); const y = v.mul(s);
  let k;
  if (mode === 'floor') k = floorQ(y);
  else if (mode === 'ceil') k = -floorQ(y.neg());
  else { const h = y.abs().add(new Q(1n, 2n)); k = floorQ(h); if (y.sign() < 0) k = -k; } // demi vers le haut en valeur absolue
  return new Q(k).div(s);
}

/* ── tableaux : hexagone des cases inconnues ───────────────────────────────── */
const cell = (s) => { const t = String(s).replace(/\$/g, '').trim(); return t === '' || t === '؟' ? null : evalText(t); };
function pyramid(ex) {
  const rows = ex.statement.table.rows.map((r) => r.slice(1).map(cell));
  const L = rows.length; const lv = rows.map((r, i) => r.slice(0, rows[0].length - i));
  const rel = []; // [(niveau, indice), (niveau-1, indice), (niveau-1, indice+1)]
  for (let l = 1; l < L; l++) for (let i = 0; i < lv[l].length; i++) rel.push([[l, i], [l - 1, i], [l - 1, i + 1]]);
  const trace = {}; let again = true;
  while (again) {
    again = false;
    for (const [p, a, b] of rel) {
      const P = lv[p[0]][p[1]]; const A = lv[a[0]][a[1]]; const B = lv[b[0]][b[1]];
      const miss = [P, A, B].filter((v) => v === null).length;
      if (miss !== 1) continue;
      again = true;
      if (P === null) lv[p[0]][p[1]] = A.mul(B);
      else if (A === null) { lv[a[0]][a[1]] = P.div(B); trace[`${a[0]},${a[1]}`] = { form: 'mul', k: B, c: P }; } else { lv[b[0]][b[1]] = P.div(A); trace[`${b[0]},${b[1]}`] = { form: 'mul', k: A, c: P }; }
    }
  }
  if (lv.some((r) => r.some((v) => v === null))) throw new Error(`${ex.id} : pyramide non résolue`);
  // cohérence : toutes les relations vérifiées
  for (const [p, a, b] of rel) if (!lv[p[0]][p[1]].eq(lv[a[0]][a[1]].mul(lv[b[0]][b[1]]))) throw new Error(`${ex.id} : pyramide incohérente`);
  return { lv, trace };
}
function magic(ex, P) {
  const g = ex.statement.table.rows.map((r) => r.slice(1).map(cell));
  const lines = [[[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]], [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]], [[0, 0], [1, 1], [2, 2]], [[0, 2], [1, 1], [2, 0]]];
  const trace = {}; let again = true;
  while (again) {
    again = false;
    for (const ln of lines) {
      const vs = ln.map(([r, c]) => g[r][c]); const miss = vs.filter((v) => v === null).length;
      if (miss !== 1) continue;
      const at = vs.findIndex((v) => v === null); const prod = vs.filter((v) => v !== null).reduce((a, b) => a.mul(b), new Q(1n));
      g[ln[at][0]][ln[at][1]] = P.div(prod); trace[`${ln[at][0]},${ln[at][1]}`] = { form: 'mul', k: prod, c: P }; again = true;
    }
  }
  if (g.some((r) => r.some((v) => v === null))) throw new Error(`${ex.id} : carré non résolu`);
  for (const ln of lines) if (!ln.map(([r, c]) => g[r][c]).reduce((a, b) => a.mul(b), new Q(1n)).eq(P)) throw new Error(`${ex.id} : ligne de produit ≠ ${P}`);
  return { g, trace };
}
function seqOf(ex, label) {
  let raw = defsOf(ex)[label]; if (raw === undefined) throw new Error(`${ex.id} : suite ${label} non définie`);
  raw = raw.replace(/\\[;,]/g, '');
  return raw.split(';').map((s) => s.trim()).map((s) => (/ldots/.test(s) ? null : evalText(s)));
}
function seqRatio(ts) {
  let k = null;
  for (let i = 0; i + 1 < ts.length; i++) if (ts[i] && ts[i + 1]) { const r = ts[i].div(ts[i + 1]); if (k === null) k = r; else if (!k.eq(r)) throw new Error('suite : raison non constante'); }
  if (k === null) throw new Error('suite : aucune paire connue');
  return k;
}

/* ── les kinds ─────────────────────────────────────────────────────────────── */
const KIND = {
  val: (ex, qq, sp) => R(ev(treeOf(ex, qq, sp)).toString()),
  e: (ex, qq, sp) => R(ev(treeOf(ex, qq, sp)).toString()),
  hole: (ex, qq, sp) => R(holeValue(holeSrc(ex, qq, sp)).x.toString()),
  round: (ex, qq, sp) => {
    const v = ev(treeOf(ex, qq, sp)); return R(roundAt(v, sp.p, sp.m ?? 'round').toString());
  },
  sign: (ex, qq, sp) => {
    let s;
    if (sp.part) { const raw = defsOf(ex)[sp.of].trim(); const [a, j] = group(raw.slice(6), 0); const [b] = group(raw.slice(6), j); s = ev(parseNorm(norm(sp.part === 'num' ? a : b))).sign(); }
    else {
      const t0 = sp.e !== undefined || sp.of !== undefined ? null : opIsland(qq.statement);
      if (t0 && /[ab]/.test(t0.replace(/\\(dfrac|times|div)/g, ''))) s = evalText(t0, lettersSubs(lettersSigns(ex, qq))).sign();
      else s = ev(treeOf(ex, qq, sp)).sign();
    }
    return C(letterOf(qq, exactlyOne(optText(qq).map((o) => WORD[o] === s), qq.statement)));
  },
  rel: (ex, qq, sp) => {
    const f = sp.facts; const sols = [];
    for (const a of [1, -1]) for (const b of [1, -1]) {
      if (f.prod !== undefined && a * b !== f.prod) continue; if (f.quo !== undefined && a * b !== f.quo) continue;
      if (f.a !== undefined && a !== f.a) continue; if (f.b !== undefined && b !== f.b) continue;
      sols.push({ a, b, prod: a * b, quo: a * b });
    }
    const vals = new Set(sols.map((s) => s[sp.ask])); if (vals.size !== 1) throw new Error(`${qq.statement} : signe non déterminé par les données`);
    const s = [...vals][0];
    return C(letterOf(qq, exactlyOne(optText(qq).map((o) => WORD[o] === s), qq.statement)));
  },
  letters: (ex, qq) => {
    const sg = lettersSigns(ex, qq); const ask = /الكسور الآتية (سالب|موجب)/.exec(qq.statement); if (!ask) throw new Error(`${qq.statement} : signe demandé introuvable`);
    const want = WORD[ask[1]];
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => evalText(islands(c.content)[0], lettersSubs(sg)).sign() === want), qq.statement)));
  },
  count: (ex, qq, sp) => {
    const word = /موجب|سالب/.exec(qq.statement)?.[0]; if (WORD[word] !== sp.sign) throw new Error(`${qq.statement} : signe demandé ≠ spec`);
    return R(Object.values(defsOf(ex)).filter((d) => !d.includes('=') && !d.includes('square')).map((d) => ev(parseNorm(norm(d)))).filter((v) => v.sign() === sp.sign).length);
  },
  pairs: (ex, qq, sp) => {
    const d = defsOf(ex); let n = 0;
    for (const a of sp.c1) for (const b of sp.c2) if (ev(parseNorm(norm(d[a]))).eq(ev(parseNorm(norm(d[b]))))) n++;
    return R(n);
  },
  optVal: (ex, qq, sp) => {
    const v = ev(treeOf(ex, qq, sp));
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => ev(parseNorm(norm(islands(c.content)[0]))).eq(v)), qq.statement)));
  },
  optHole: (ex, qq) => {
    const src = eqIsland(qq); const { x } = holeValue(src);
    const valOf = (c) => { const s = islands(c.content)[0]; const k = s.indexOf('='); return ev(parseNorm(norm(k >= 0 ? s.slice(k + 1) : s))); };
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => valOf(c).eq(x)), qq.statement)));
  },
  optPair: (ex, qq, sp) => {
    const t = lit(sp.t); if (!ev(parseNorm(norm(islands(qq.statement)[0]))).eq(t)) throw new Error(`${qq.statement} : cible retapée ≠ cible de l'énoncé`);
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => { const [a, b] = islands(c.content).map((s) => ev(parseNorm(norm(s)))); return a.div(b).eq(t); }), qq.statement)));
  },
  optSignW: (ex, qq, sp) => {
    const word = /الأعداد الآتية (سالب|موجب)/.exec(qq.statement)?.[1]; if (WORD[word] !== sp.ask) throw new Error(`${qq.statement} : signe demandé ≠ spec`);
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => ev(parseNorm(norm(islands(c.content)[0]))).sign() === sp.ask), qq.statement)));
  },
  bool: (ex, qq, sp) => {
    const m = /^(.*?)(>=|<=|<|>|=)(.*)$/.exec(withDefs(ex, sp.e)); const c = ev(parseNorm(m[1])).cmp(ev(parseNorm(m[3])));
    const truth = { '<': c < 0, '>': c > 0, '=': c === 0, '>=': c >= 0, '<=': c <= 0 }[m[2]];
    return C(letterOf(qq, exactlyOne(optText(qq).map((o) => YN(o) === truth), qq.statement)));
  },
  boolSignEq: (ex, qq, sp) => {
    const d = defsOf(ex); const truth = ev(parseNorm(norm(d[sp.a]))).sign() === ev(parseNorm(norm(d[sp.b]))).sign();
    return C(letterOf(qq, exactlyOne(optText(qq).map((o) => YN(o) === truth), qq.statement)));
  },
  natural: (ex, qq, sp) => {
    const v = ev(parseNorm(norm(defsOf(ex)[sp.of]))); const truth = v.isInt() && v.sign() >= 0;
    return C(letterOf(qq, exactlyOne(optText(qq).map((o) => YN(o) === truth), qq.statement)));
  },
  parity: (ex, qq, sp) => {
    const t = textOf(ex, qq); if (!t.includes(String(sp.n)) || !t.includes(String(sp.pos))) throw new Error(`${qq.statement} : n ou p absent de l'énoncé`);
    let s = 1; for (let k = 0; k < sp.n - sp.pos; k++) s *= -1; // on multiplie n − p fois par −1
    return C(letterOf(qq, exactlyOne(optText(qq).map((o) => WORD[o] === s), qq.statement)));
  },
  noSol: (ex, qq) => {
    const { u, other } = equation(eqIsland(qq)); const c = ev(other);
    const f0 = ev(u, 'ok', new Q(0n)); const f1 = ev(u, 'ok', new Q(1n));
    const exists = !f0.eq(f1) || f0.eq(c); // l'équation a au moins une solution ?
    return C(letterOf(qq, exactlyOne(optText(qq).map((o) => YN(o) === exists), qq.statement)));
  },
  pyr: (ex, qq, sp) => R(pyramid(ex).lv[sp.lvl][sp.idx].toString()),
  pyrDiv: (ex, qq, sp) => { const { lv } = pyramid(ex); return R(lv[sp.num[0]][sp.num[1]].div(lv[sp.den[0]][sp.den[1]]).toString()); },
  magic: (ex, qq, sp) => {
    if (!islands(ex.statement.content).some((s) => lit(s.replace(/[−]/g, '-')).eq(lit(sp.P)))) throw new Error(`${ex.id} : produit ${sp.P} absent de l'énoncé`);
    return R(magic(ex, lit(sp.P)).g[sp.r][sp.c].toString());
  },
  seqDiv: (ex, qq, sp) => R(seqRatio(seqOf(ex, sp.of)).toString()),
  seqMissing: (ex, qq, sp) => {
    const ts = seqOf(ex, sp.of); const k = seqRatio(ts); const i = ts.indexOf(null);
    const x = ts[i - 1].div(k); if (!x.div(k).eq(ts[i + 1])) throw new Error('suite incohérente');
    return R(x.toString());
  },
};

/* ── les questions (généré une fois, relu et maintenu à la main ensuite) ───── */
const SPEC = {
  "ex-3am-qismat-nisbiyayn-l1-001:q1": {"k": "sign", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l1-001:q2": {"k": "sign", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l1-001:q3": {"k": "sign", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l1-001:q4": {"k": "sign", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l1-002:q1": {"k": "optVal"},
  "ex-3am-qismat-nisbiyayn-l1-002:q2": {"k": "optVal"},
  "ex-3am-qismat-nisbiyayn-l1-002:q3": {"k": "optVal"},
  "ex-3am-qismat-nisbiyayn-l1-003:q1": {"k": "letters"},
  "ex-3am-qismat-nisbiyayn-l1-003:q2": {"k": "letters"},
  "ex-3am-qismat-nisbiyayn-l1-003:q3": {"k": "letters"},
  "ex-3am-qismat-nisbiyayn-l1-004:q1": {"k": "sign", "part": "num", "of": "Q"},
  "ex-3am-qismat-nisbiyayn-l1-004:q2": {"k": "sign", "part": "den", "of": "Q"},
  "ex-3am-qismat-nisbiyayn-l1-004:q3": {"k": "sign", "of": "Q"},
  "ex-3am-qismat-nisbiyayn-l1-004:q4": {"k": "val", "of": "Q"},
  "ex-3am-qismat-nisbiyayn-l1-005:q1": {"k": "sign"},
  "ex-3am-qismat-nisbiyayn-l1-005:q2": {"k": "sign"},
  "ex-3am-qismat-nisbiyayn-l1-005:q3": {"k": "sign"},
  "ex-3am-qismat-nisbiyayn-l1-005:q4": {"k": "sign"},
  "ex-3am-qismat-nisbiyayn-l1-006:q1": {"k": "sign", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l1-006:q2": {"k": "sign", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l1-006:q3": {"k": "sign", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l1-006:q4": {"k": "sign", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l1-006:q5": {"k": "count", "sign": 1},
  "ex-3am-qismat-nisbiyayn-l1-007:q1": {"k": "rel", "facts": {"prod": -1}, "ask": "quo"},
  "ex-3am-qismat-nisbiyayn-l1-007:q2": {"k": "rel", "facts": {"prod": 1, "a": -1}, "ask": "quo"},
  "ex-3am-qismat-nisbiyayn-l1-007:q3": {"k": "rel", "facts": {"quo": 1, "a": -1}, "ask": "prod"},
  "ex-3am-qismat-nisbiyayn-l1-007:q4": {"k": "rel", "facts": {"quo": -1, "b": 1}, "ask": "a"},
  "ex-3am-qismat-nisbiyayn-l1-008:q1": {"k": "sign"},
  "ex-3am-qismat-nisbiyayn-l1-008:q2": {"k": "val"},
  "ex-3am-qismat-nisbiyayn-l1-008:q3": {"k": "sign"},
  "ex-3am-qismat-nisbiyayn-l1-008:q4": {"k": "val"},
  "ex-3am-qismat-nisbiyayn-l1-009:q1": {"k": "count", "sign": -1},
  "ex-3am-qismat-nisbiyayn-l1-009:q2": {"k": "sign", "of": "E"},
  "ex-3am-qismat-nisbiyayn-l1-009:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l1-010:q1": {"k": "sign", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l1-010:q2": {"k": "sign", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l1-010:q3": {"k": "boolSignEq", "a": "A", "b": "B"},
  "ex-3am-qismat-nisbiyayn-l1-010:q4": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l2-001:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l2-001:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l2-001:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l2-001:q4": {"k": "val", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l2-002:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l2-002:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l2-002:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l2-002:q4": {"k": "val", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l2-002:q5": {"k": "val", "of": "E"},
  "ex-3am-qismat-nisbiyayn-l2-002:q6": {"k": "val", "of": "F"},
  "ex-3am-qismat-nisbiyayn-l2-003:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l2-003:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l2-003:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l2-003:q4": {"k": "val", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l2-003:q5": {"k": "val", "of": "E"},
  "ex-3am-qismat-nisbiyayn-l2-003:q6": {"k": "val", "of": "F"},
  "ex-3am-qismat-nisbiyayn-l2-004:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l2-004:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l2-004:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l2-004:q4": {"k": "val", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l2-004:q5": {"k": "val", "of": "E"},
  "ex-3am-qismat-nisbiyayn-l2-004:q6": {"k": "val", "of": "F"},
  "ex-3am-qismat-nisbiyayn-l2-004:q7": {"k": "pairs", "c1": ["A", "B", "C"], "c2": ["D", "E", "F"]},
  "ex-3am-qismat-nisbiyayn-l2-005:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l2-005:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l2-005:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l2-005:q4": {"k": "val", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l2-006:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l2-006:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l2-006:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l2-006:q4": {"k": "val", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l2-007:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l2-007:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l2-007:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l2-007:q4": {"k": "val", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l2-008:q1": {"k": "e", "e": "(-7)+(-4)+1+(-6)+(-2)"},
  "ex-3am-qismat-nisbiyayn-l2-008:q2": {"k": "e", "e": "((-7)+(-4)+1+(-6)+(-2))/5"},
  "ex-3am-qismat-nisbiyayn-l2-008:q3": {"k": "e", "e": "((-7)+(-4)+1+(-6)+(-2)+(-12))/6"},
  "ex-3am-qismat-nisbiyayn-l2-008:q4": {"k": "e", "e": "(-3.6)-(-5)"},
  "ex-3am-qismat-nisbiyayn-l2-009:q1": {"k": "e", "e": "-(9)"},
  "ex-3am-qismat-nisbiyayn-l2-009:q2": {"k": "e", "e": "(-4)*7"},
  "ex-3am-qismat-nisbiyayn-l2-009:q3": {"k": "e", "e": "(-35)/5"},
  "ex-3am-qismat-nisbiyayn-l2-009:q4": {"k": "e", "e": "(-48)/(-6)"},
  "ex-3am-qismat-nisbiyayn-l2-010:q1": {"k": "e", "e": "(-48)*2"},
  "ex-3am-qismat-nisbiyayn-l2-010:q2": {"k": "e", "e": "(-48)/3"},
  "ex-3am-qismat-nisbiyayn-l2-010:q3": {"k": "e", "e": "(-48)/4"},
  "ex-3am-qismat-nisbiyayn-l2-010:q4": {"k": "e", "e": "-(-48)"},
  "ex-3am-qismat-nisbiyayn-l3-001:q1": {"k": "hole", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l3-001:q2": {"k": "hole", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l3-001:q3": {"k": "hole", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l3-001:q4": {"k": "hole", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l3-001:q5": {"k": "hole", "of": "E"},
  "ex-3am-qismat-nisbiyayn-l3-001:q6": {"k": "hole", "of": "F"},
  "ex-3am-qismat-nisbiyayn-l3-002:q1": {"k": "hole", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l3-002:q2": {"k": "hole", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l3-002:q3": {"k": "hole", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l3-002:q4": {"k": "hole", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l3-002:q5": {"k": "hole", "of": "E"},
  "ex-3am-qismat-nisbiyayn-l3-002:q6": {"k": "hole", "of": "F"},
  "ex-3am-qismat-nisbiyayn-l3-003:q1": {"k": "hole", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l3-003:q2": {"k": "hole", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l3-003:q3": {"k": "hole", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l3-003:q4": {"k": "hole", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l3-003:q5": {"k": "hole", "of": "E"},
  "ex-3am-qismat-nisbiyayn-l3-003:q6": {"k": "hole", "of": "F"},
  "ex-3am-qismat-nisbiyayn-l3-004:q1": {"k": "hole", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l3-004:q2": {"k": "hole", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l3-004:q3": {"k": "hole", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l3-004:q4": {"k": "hole", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l3-004:q5": {"k": "hole", "of": "E"},
  "ex-3am-qismat-nisbiyayn-l3-004:q6": {"k": "hole", "of": "F"},
  "ex-3am-qismat-nisbiyayn-l3-005:q1": {"k": "optPair", "t": "-4"},
  "ex-3am-qismat-nisbiyayn-l3-005:q2": {"k": "optPair", "t": "6"},
  "ex-3am-qismat-nisbiyayn-l3-005:q3": {"k": "optPair", "t": "-5/2"},
  "ex-3am-qismat-nisbiyayn-l3-005:q4": {"k": "optPair", "t": "-1"},
  "ex-3am-qismat-nisbiyayn-l3-006:q1": {"k": "optHole"},
  "ex-3am-qismat-nisbiyayn-l3-006:q2": {"k": "optHole"},
  "ex-3am-qismat-nisbiyayn-l3-006:q3": {"k": "optHole"},
  "ex-3am-qismat-nisbiyayn-l3-006:q4": {"k": "noSol"},
  "ex-3am-qismat-nisbiyayn-l3-007:q1": {"k": "hole", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l3-007:q2": {"k": "hole", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l3-007:q3": {"k": "hole", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l3-007:q4": {"k": "hole", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l3-007:q5": {"k": "hole", "of": "E"},
  "ex-3am-qismat-nisbiyayn-l3-007:q6": {"k": "hole", "of": "F"},
  "ex-3am-qismat-nisbiyayn-l3-008:q1": {"k": "pyr", "lvl": 0, "idx": 0},
  "ex-3am-qismat-nisbiyayn-l3-008:q2": {"k": "pyr", "lvl": 1, "idx": 1},
  "ex-3am-qismat-nisbiyayn-l3-008:q3": {"k": "pyr", "lvl": 2, "idx": 0},
  "ex-3am-qismat-nisbiyayn-l3-008:q4": {"k": "pyrDiv", "num": [2, 0], "den": [1, 0]},
  "ex-3am-qismat-nisbiyayn-l3-009:q1": {"k": "optSignW", "ask": 1},
  "ex-3am-qismat-nisbiyayn-l3-009:q2": {"k": "optSignW", "ask": -1},
  "ex-3am-qismat-nisbiyayn-l3-009:q3": {"k": "optVal"},
  "ex-3am-qismat-nisbiyayn-l3-010:q1": {"k": "optVal"},
  "ex-3am-qismat-nisbiyayn-l3-010:q2": {"k": "optVal"},
  "ex-3am-qismat-nisbiyayn-l3-010:q3": {"k": "optVal"},
  "ex-3am-qismat-nisbiyayn-l4-001:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l4-001:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l4-001:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l4-001:q4": {"k": "val", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l4-002:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l4-002:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l4-002:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l4-002:q4": {"k": "val", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l4-003:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l4-003:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l4-003:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l4-004:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l4-004:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l4-004:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l4-005:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l4-005:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l4-005:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l4-006:q1": {"k": "optVal"},
  "ex-3am-qismat-nisbiyayn-l4-006:q2": {"k": "optVal"},
  "ex-3am-qismat-nisbiyayn-l4-006:q3": {"k": "optVal"},
  "ex-3am-qismat-nisbiyayn-l4-006:q4": {"k": "optVal"},
  "ex-3am-qismat-nisbiyayn-l4-007:q1": {"k": "seqDiv", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l4-007:q2": {"k": "seqMissing", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l4-007:q3": {"k": "seqDiv", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l4-007:q4": {"k": "seqMissing", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l4-008:q1": {"k": "magic", "P": "64", "r": 0, "c": 1},
  "ex-3am-qismat-nisbiyayn-l4-008:q2": {"k": "magic", "P": "64", "r": 1, "c": 2},
  "ex-3am-qismat-nisbiyayn-l4-008:q3": {"k": "magic", "P": "64", "r": 2, "c": 0},
  "ex-3am-qismat-nisbiyayn-l4-009:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l4-009:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l4-009:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l4-009:q4": {"k": "val", "of": "D"},
  "ex-3am-qismat-nisbiyayn-l4-010:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l4-010:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l4-010:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l5-001:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l5-001:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l5-001:q3": {"k": "parity", "n": 123, "pos": 16},
  "ex-3am-qismat-nisbiyayn-l5-002:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l5-002:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l5-002:q3": {"k": "e", "e": "(A)/(B)"},
  "ex-3am-qismat-nisbiyayn-l5-002:q4": {"k": "e", "e": "-((A)/(B))"},
  "ex-3am-qismat-nisbiyayn-l5-002:q5": {"k": "e", "e": "(B)/(A)"},
  "ex-3am-qismat-nisbiyayn-l5-003:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l5-003:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l5-003:q3": {"k": "rel", "facts": {"a": -1, "b": -1}, "ask": "quo"},
  "ex-3am-qismat-nisbiyayn-l5-003:q4": {"k": "e", "e": "(A)/(B)"},
  "ex-3am-qismat-nisbiyayn-l5-004:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l5-004:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l5-004:q3": {"k": "sign", "e": "(A)/(B)"},
  "ex-3am-qismat-nisbiyayn-l5-004:q4": {"k": "round", "e": "(A)/(B)", "p": 2},
  "ex-3am-qismat-nisbiyayn-l5-005:q1": {"k": "val"},
  "ex-3am-qismat-nisbiyayn-l5-005:q2": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l5-005:q3": {"k": "e", "e": "(C)"},
  "ex-3am-qismat-nisbiyayn-l5-006:q1": {"k": "e", "e": "(-5)*(-2)*3*(-2.4)*(-1)"},
  "ex-3am-qismat-nisbiyayn-l5-006:q2": {"k": "e", "e": "(-36)/((-5)*(-2)*3*(-2.4)*(-1))"},
  "ex-3am-qismat-nisbiyayn-l5-006:q3": {"k": "val", "of": "F"},
  "ex-3am-qismat-nisbiyayn-l5-006:q4": {"k": "val", "of": "G"},
  "ex-3am-qismat-nisbiyayn-l5-006:q5": {"k": "natural", "of": "G"},
  "ex-3am-qismat-nisbiyayn-l5-007:q1": {"k": "val", "of": "V"},
  "ex-3am-qismat-nisbiyayn-l5-007:q2": {"k": "val", "of": "E"},
  "ex-3am-qismat-nisbiyayn-l5-007:q3": {"k": "round", "e": "(V)/(E)", "p": 3, "m": "floor"},
  "ex-3am-qismat-nisbiyayn-l5-007:q4": {"k": "round", "e": "(V)/(E)", "p": 3, "m": "ceil"},
  "ex-3am-qismat-nisbiyayn-l5-007:q5": {"k": "round", "e": "(V)/(E)", "p": 1},
  "ex-3am-qismat-nisbiyayn-l5-008:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l5-008:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l5-008:q3": {"k": "val", "of": "C"},
  "ex-3am-qismat-nisbiyayn-l5-009:q1": {"k": "val", "of": "A"},
  "ex-3am-qismat-nisbiyayn-l5-009:q2": {"k": "val", "of": "B"},
  "ex-3am-qismat-nisbiyayn-l5-009:q3": {"k": "sign", "e": "(A)/(B)"},
  "ex-3am-qismat-nisbiyayn-l5-009:q4": {"k": "e", "e": "(A)/(B)"},
  "ex-3am-qismat-nisbiyayn-l5-010:q1": {"k": "e", "e": "(-2.5)*4"},
  "ex-3am-qismat-nisbiyayn-l5-010:q2": {"k": "e", "e": "10+(-2.5)*4"},
  "ex-3am-qismat-nisbiyayn-l5-010:q3": {"k": "e", "e": "(-15)/(-2.5)"},
  "ex-3am-qismat-nisbiyayn-l5-010:q4": {"k": "rel", "facts": {"prod": 1, "a": -1}, "ask": "b"},
  "ex-3am-qismat-nisbiyayn-l5-010:q5": {"k": "e", "e": "10/(-2.5)"},
  "ex-3am-qismat-nisbiyayn-l5-010:q6": {"k": "e", "e": "(-18)/8"},
};

export const ORACLE = {};
for (const [key, sp] of Object.entries(SPEC)) {
  const [exId, qId] = key.split(':'); const ex = BANK.get(exId);
  if (!ex) throw new Error(`oracle qismat : feuille ${exId} introuvable`);
  const qq = ex.questions.find((x) => x.id === qId); if (!qq) throw new Error(`oracle qismat : ${key} introuvable`);
  if (!KIND[sp.k]) throw new Error(`oracle qismat : kind « ${sp.k} » inconnu (${key})`);
  ORACLE[key] = KIND[sp.k](ex, qq, sp);
}

/* ── audit : étiquettes MISC-QISMA-* ───────────────────────────────────────── */
const MISC = /^MISC-QISMA-(SIGN|ORDER|DIST|ZERO|FRACSIGN|PRIORITY|SUBNEG|DECIMAL)$/;
const idOf = (m) => m.replace('MISC-QISMA-', '');

/** Les valeurs de chaque erreur pour une question à clé numérique. */
function numericCands(ex, qq, sp) {
  switch (sp.k) {
    case 'val': case 'e': return cands(treeOf(ex, qq, sp));
    case 'hole': return holeCands(holeValue(holeSrc(ex, qq, sp)));
    case 'optHole': return holeCands(holeValue(eqIsland(qq)));
    case 'round': { const v = roundAt(ev(treeOf(ex, qq, sp)), sp.p, sp.m ?? 'round'); return { SIGN: [v.neg()], ORDER: [], DIST: [], DECIMAL: [], PRIORITY: [], SUBNEG: [], FRACSIGN: [v.neg()] }; }
    case 'seqDiv': { const k = seqRatio(seqOf(ex, sp.of)); return { SIGN: [k.neg()], ORDER: [new Q(1n).div(k)], DIST: [], DECIMAL: [], PRIORITY: [], SUBNEG: [], FRACSIGN: [] }; }
    case 'seqMissing': { const ts = seqOf(ex, sp.of); const k = seqRatio(ts); const x = ts[ts.indexOf(null) - 1].div(k); return { SIGN: [x.neg()], ORDER: [], DIST: [], DECIMAL: [], PRIORITY: [], SUBNEG: [], FRACSIGN: [] }; }
    case 'magic': { const { g, trace } = magic(ex, lit(sp.P)); const x = g[sp.r][sp.c]; const t = trace[`${sp.r},${sp.c}`]; return holeCands({ x, ...t }); }
    case 'pyr': { const { lv, trace } = pyramid(ex); const x = lv[sp.lvl][sp.idx]; const t = trace[`${sp.lvl},${sp.idx}`]; if (t) return holeCands({ x, ...t }); return { SIGN: [x.neg()], ORDER: [], DIST: [], DECIMAL: [], PRIORITY: [], SUBNEG: [], FRACSIGN: [] }; }
    case 'pyrDiv': { const { lv } = pyramid(ex); const v = lv[sp.num[0]][sp.num[1]].div(lv[sp.den[0]][sp.den[1]]); return { SIGN: [v.neg()], ORDER: [], DIST: [], DECIMAL: [], PRIORITY: [], SUBNEG: [], FRACSIGN: [] }; }
    default: return null;
  }
}

export function audit(bank) {
  const problems = [];
  for (const { key } of bank) {
    const [exId, qId] = key.split(':'); const ex = BANK.get(exId); const qq = ex?.questions.find((x) => x.id === qId);
    if (!qq) { problems.push(`${key} : introuvable dans le banc de l'oracle`); continue; }
    const sp = SPEC[key];
    if (qq.answerType === 'selfCheck') continue;
    if (!sp) { problems.push(`${key} : aucune spec d'oracle`); continue; }
    if (qq.answerType === 'rational') {
      const e = String(qq.expectedAnswer);
      if (!/^-?\d+(\.\d+)?$|^-?\d+\/\d+$/.test(e)) problems.push(`${key} : clé illisible « ${e} »`);
      const cs = numericCands(ex, qq, sp);
      for (const s of qq.misconceptionSignatures ?? []) {
        if (!MISC.test(s.id)) { problems.push(`${key} : signature ${s.id} hors MISC-QISMA-*`); continue; }
        if (lit(s.value).eq(lit(e))) problems.push(`${key} : la signature ${s.id} (${s.value}) est la bonne réponse`);
        if (!cs) { problems.push(`${key} : signature ${s.id} sur une question sans erreur calculable (${sp.k})`); continue; }
        if (!inList(cs[idOf(s.id)] ?? [], lit(s.value))) problems.push(`${key} : la signature ${s.id} (${s.value}) n'est pas la valeur que cette erreur produit`);
      }
    } else if (qq.answerType === 'choice') {
      const good = qq.choices.filter((c) => c.isCorrect);
      if (good.length !== 1) problems.push(`${key} : ${good.length} bonnes options`);
      for (const c of qq.choices.filter((x) => !x.isCorrect)) {
        if (!c.misconceptionId || !MISC.test(c.misconceptionId)) { problems.push(`${key} : le distracteur ${c.id} ne porte pas de MISC-QISMA-*`); continue; }
        const id = idOf(c.misconceptionId);
        try {
          const ok = checkDistractor(ex, qq, sp, c, id);
          if (ok !== true) problems.push(`${key} : le distracteur ${c.id} (${id}) ${ok}`);
        } catch (err) { problems.push(`${key} : ${err.message}`); }
      }
    }
  }
  return problems;
}

/** true si le distracteur `c` vaut ce que l'erreur `id` produit ; sinon un message. */
function checkDistractor(ex, qq, sp, c, id) {
  const optVal = () => ev(parseNorm(norm(islands(c.content)[0])));
  switch (sp.k) {
    case 'sign': case 'rel': case 'parity': return id === 'SIGN' ? true : 'doit porter SIGN';
    case 'boolSignEq': return id === 'SIGN' ? true : 'doit porter SIGN';
    case 'natural': { // « non » parce que le quotient de deux négatifs est lu négatif
      if (id !== 'SIGN') return 'doit porter SIGN';
      const v = ev(parseNorm(norm(defsOf(ex)[sp.of])), 'divsign'); return !(v.isInt() && v.sign() >= 0) ? true : 'ne correspond à aucune erreur de signe';
    }
    case 'noSol': return id === 'ZERO' ? true : 'doit porter ZERO';
    case 'letters': {
      const sg = lettersSigns(ex, qq); const want = WORD[/الكسور الآتية (سالب|موجب)/.exec(qq.statement)[1]];
      const raw = islands(c.content)[0]; const tru = evalText(raw, lettersSubs(sg)).sign();
      if (tru === want) return 'est en réalité juste';
      const inner = /^\\dfrac\{(.*)\}\{(.*)\}$/.exec(raw.trim()); if (!inner) return 'n\'est pas une fraction';
      const top = evalText(inner[1], lettersSubs(sg)).sign();
      if (id === 'SIGN') return top === want ? true : 'ne prend pas le signe du numérateur';
      if (id === 'FRACSIGN') return /^[-−]/.test(inner[1].trim()) && /^[-−]/.test(inner[2].trim()) ? true : 'n\'a pas deux signes « − » écrits';
      return 'étiquette inattendue';
    }
    case 'optSignW': {
      if (id !== 'FRACSIGN') return 'doit porter FRACSIGN';
      const raw = islands(c.content)[0].trim().replace(/^[-−]/, ''); const without = ev(parseNorm(norm(raw))).sign();
      return without === sp.ask ? true : 'ne vaut pas ce que donne le « − » extérieur oublié';
    }
    case 'optPair': {
      const t = lit(sp.t); const [a, b] = islands(c.content).map((s) => ev(parseNorm(norm(s))));
      const m = { SIGN: a.div(b).eq(t.neg()), ORDER: b.div(a).eq(t), DIST: a.sub(b).eq(t) };
      return m[id] === true ? true : 'ne correspond pas à l\'erreur annoncée';
    }
    case 'optVal': {
      const cs = cands(treeOf(ex, qq, sp)); return inList(cs[id] ?? [], optVal()) ? true : `vaut ${optVal()} qui n'est pas ce que produit cette erreur`;
    }
    case 'optHole': {
      const { x, form, k, c: cc } = holeValue(eqIsland(qq)); const cs = holeCands({ x, form, k, c: cc });
      const s = islands(c.content)[0]; const v = ev(parseNorm(norm(s.indexOf('=') >= 0 ? s.slice(s.indexOf('=') + 1) : s)));
      return inList(cs[id] ?? [], v) ? true : `vaut ${v} qui n'est pas ce que produit cette erreur`;
    }
    default: return `kind ${sp.k} sans règle de distracteur`;
  }
}
