// Oracle du banc « jidaa-ida-nisbiya » (جداء عدة أعداد نسبية, 3AM, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer` :
//  - les expressions de l'ÉNONCÉ (formules `A = …` de la feuille, îlots `$…$` de la question) sont LUES dans les fichiers du banc et
//    évaluées par un analyseur écrit dans ce fichier, en rationnels EXACTS (BigInt, aucun flottant, rien importé de packages/core) :
//    « − » U+2212, « × », « ÷ », « {,} », crochets, produits sans signe (« (−2)(+5) »), carrés « (−7)^2 », suites « (−1) × (−2) × … × (−18) » ;
//  - une CLÉ DE SIGNE d'un produit est calculée DEUX fois : en comptant les facteurs négatifs (parité) ET par le produit exact ; les deux
//    doivent s'accorder, sinon l'oracle échoue (`signBoth`) ;
//  - les énoncés « jouet » — « جداء n عاملًا dont p négatifs/positifs » — sont lus (n, p et le mot السالبة/الموجبة) dans l'énoncé et
//    le signe est obtenu en multipliant n facteurs ±1 en BigInt ;
//  - quand la valeur vient d'un récit (réservoir, points, cartes…), l'expression est RETAPÉE ici (`e`) en syntaxe ASCII, et quand
//    l'énoncé donne aussi la cible l'oracle la RELIT et refuse tout désaccord ;
//  - un QCM n'a qu'une seule bonne option : chaque option est évaluée et l'oracle échoue si le nombre d'options justes n'est pas 1.
// Les questions selfCheck (« علّل ») n'ont pas de clé et ne figurent pas ici.
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
  sign() { return this.n === 0n ? 0 : this.n < 0n ? -1 : 1; }
  cmp(o) { const l = this.n * o.d; const r = o.n * this.d; return l < r ? -1 : l > r ? 1 : 0; }
  eq(o) { return this.cmp(o) === 0; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
const num = (s) => { const [i, f = ''] = s.split('.'); return new Q(BigInt(i + f), 10n ** BigInt(f.length)); };
const ONE = new Q(1n);
const powInt = (a, n) => { let r = ONE; for (let i = 0; i < n; i++) r = r.mul(a); return r; };

/** Du LaTeX de l'énoncé vers la syntaxe de l'oracle. */
const norm = (s) => s
  .replace(/\$/g, '').replace(/\\left|\\right/g, '').replace(/\\times|\\cdot/g, '*').replace(/\\div/g, '/')
  .replace(/\{,\}/g, '.').replace(/(\d),(\d)/g, '$1.$2').replace(/[−‒–]/g, '-')
  .replace(/\\,|\\?;|\\ /g, '').replace(/\s+/g, '').replace(/\)\(/g, ')*(').replace(/(\d)\(/g, '$1*(');

/** expr = terme ((+|−) terme)* ; terme = unaire ((*|/) unaire)* ; unaire = (+|−) unaire | puissance ; puissance = primaire (^ entier)* ; primaire = nombre | (expr) | [expr]. */
function evaluate(src) {
  const t = norm(src); let i = 0; const peek = () => t[i];
  const expr = () => { let v = term(); while (peek() === '+' || peek() === '-') { const op = t[i++]; const w = term(); v = op === '+' ? v.add(w) : v.sub(w); } return v; };
  const term = () => { let v = unary(); while (peek() === '*' || peek() === '/') { const op = t[i++]; const w = unary(); v = op === '*' ? v.mul(w) : v.div(w); } return v; };
  const unary = () => { if (peek() === '-') { i++; return unary().neg(); } if (peek() === '+') { i++; return unary(); } return power(); };
  const power = () => { let v = primary(); while (peek() === '^') { i++; const m = /^\d+/.exec(t.slice(i)); if (!m) throw new Error(`exposant illisible dans ${src}`); i += m[0].length; v = powInt(v, Number(m[0])); } return v; };
  const primary = () => {
    if (peek() === '(' || peek() === '[') { const close = peek() === '(' ? ')' : ']'; i++; const v = expr(); if (t[i++] !== close) throw new Error(`« ${close} » attendu dans ${src}`); return v; }
    const m = /^\d+(\.\d+)?/.exec(t.slice(i)); if (!m) throw new Error(`lecture impossible à ${i} dans « ${src} » (normalisé « ${t} »)`); i += m[0].length; return num(m[0]);
  };
  const v = expr(); if (i !== t.length) throw new Error(`reste « ${t.slice(i)} » dans « ${src} »`); return v;
}
/** Comparaison typée « a < b », « a >= b », « a = b » : vrai / faux. */
function holds(src) {
  const m = /^(.*?)(>=|<=|<|>|=)(.*)$/.exec(src.replace(/\\square/g, '')); if (!m) throw new Error(`comparaison illisible : ${src}`);
  const c = evaluate(m[1]).cmp(evaluate(m[3]));
  return { '<': c < 0, '>': c > 0, '=': c === 0, '>=': c >= 0, '<=': c <= 0 }[m[2]];
}
/** Les facteurs de PREMIER NIVEAU d'un produit (coupés à « * » ou « )( » hors parenthèses), écrits à part des parseurs ci-dessus. */
function factorsOf(src) {
  const t = norm(src); const out = []; let depth = 0; let cur = '';
  for (const ch of t) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === '*' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur); return out;
}
/** Signe d'un produit calculé DEUX fois : en comptant les facteurs négatifs, et par le produit exact — ils doivent s'accorder. */
function signBoth(src) {
  const fs = factorsOf(src).map(evaluate);
  const negatives = fs.filter((f) => f.sign() < 0).length; const zero = fs.some((f) => f.sign() === 0);
  const byParity = zero ? 0 : negatives % 2 === 0 ? 1 : -1;
  const exact = evaluate(src).sign();
  if (byParity !== exact) throw new Error(`« ${src} » : parité (${negatives} négatifs) ≠ produit exact`);
  return { sign: exact, negatives, n: fs.length, zero };
}
/** décimal fini → chaîne (pour une borne). */
function decimalString(q, digits) {
  const scaled = q.n * (10n ** BigInt(digits)) / q.d; const neg = scaled < 0n; let s = (neg ? -scaled : scaled).toString().padStart(digits + 1, '0');
  s = s.slice(0, s.length - digits) + (digits ? '.' + s.slice(-digits) : ''); return (neg ? '-' : '') + s;
}

/* ── lecture du banc ───────────────────────────────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bankDir = join(here, '..', '..', 'content', 'practice', '3am', 'jidaa-ida-nisbiya');
const BANK = new Map();
for (const lvl of readdirSync(bankDir).filter((d) => d.startsWith('level-'))) {
  for (const f of readdirSync(join(bankDir, lvl)).filter((x) => x.endsWith('.json'))) {
    const ex = JSON.parse(readFileSync(join(bankDir, lvl, f), 'utf8')); BANK.set(ex.id, ex);
  }
}
const islands = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
/** Les définitions « A = … » de la feuille (étiquettes avec prime « P' » admises). */
const defsOf = (ex) => Object.fromEntries((ex.statement.formulas ?? []).map((f) => { const k = f.indexOf('='); return [f.slice(0, k).trim(), f.slice(k + 1).trim()]; }));
const productIsland = (text) => { const hit = islands(text).find((s) => /\\times|\\div|\^/.test(s)); if (!hit) throw new Error(`aucun produit dans « ${text} »`); return hit; };
const exactlyOne = (flags, what) => { const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0); if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`); return hits[0]; };
const letterOf = (qq, k) => qq.choices[k].id;
const optText = (qq) => qq.choices.map((c) => c.content.replace(/\$/g, '').trim());
const WORD = { 'موجب': 1, 'سالب': -1, 'معدوم': 0 };
const pickByText = (qq, wanted, what) => C(letterOf(qq, exactlyOne(optText(qq).map((o) => o === wanted), what)));
const pickWhere = (qq, pred, what) => C(letterOf(qq, exactlyOne(optText(qq).map(pred), what)));
const nthIsland = (qq, k) => islands(qq.statement)[k];

/** L'expression visée : retapée (`e`), ou définie par la feuille (`of`), ou lue dans l'énoncé. */
function target(ex, qq, spec) {
  if (spec.e !== undefined) return spec.e;
  if (spec.of !== undefined) { const d = defsOf(ex)[spec.of]; if (d === undefined) throw new Error(`${ex.id} : « ${spec.of} » non défini`); return d; }
  return productIsland(qq.statement);
}
/** Suite d'entiers « (−1) × (−2) × (−3) × … × (−18) » → ses facteurs. */
function chainOf(src) {
  const t = src.replace(/\$/g, ''); const [head, tail] = t.split('\\dots'); const nums = (s) => [...s.matchAll(/−?\d+/g)].map((m) => Number(m[0].replace('−', '-')));
  const a = nums(head); const z = nums(tail); if (a.length < 2 || z.length !== 1) throw new Error(`suite illisible : ${src}`);
  const step = a[1] - a[0]; const out = []; for (let v = a[0]; step > 0 ? v <= z[0] : v >= z[0]; v += step) out.push(v);
  if (out[out.length - 1] !== z[0]) throw new Error(`la suite ${src} n'atteint pas son dernier terme`);
  return out;
}
const claimWordIsFalse = (qq) => C(letterOf(qq, exactlyOne(optText(qq).map((o) => /^(خاطئة|خطأ|لا)/.test(o)), qq.statement)));

/* ── les kinds ─────────────────────────────────────────────────────────────── */
const KIND = {
  val: (ex, qq, sp) => { const e = target(ex, qq, sp); if (/^[^+\-−]*$/.test(norm(e).replace(/\(.*?\)/g, ''))) signBoth(e); return R(evaluate(e).toString()); },
  e: (ex, qq, sp) => {
    const v = evaluate(sp.e);
    if (sp.target !== undefined && !v.eq(evaluate(sp.target))) throw new Error(`${qq.statement} : cible retapée ≠ valeur`);
    return R(v.toString());
  },
  signOf: (ex, qq, sp) => {
    const e = target(ex, qq, sp); const { sign } = signBoth(e);
    return pickWhere(qq, (o) => WORD[o] === sign, qq.statement);
  },
  countNeg: (ex, qq, sp) => { const e = target(ex, qq, sp); const { negatives } = signBoth(e); return R(negatives); },
  countDefs: (ex, qq, sp) => R(Object.values(defsOf(ex)).filter((d) => evaluate(d).sign() === sp.sign).length),
  /** « جداء عدد عوامله n وعدد العوامل السالبة/الموجبة فيه p » — lu dans l'énoncé. */
  nfact: (ex, qq, sp) => {
    const [n, p] = islands(qq.statement).map(Number); const which = /السالبة فيه/.test(qq.statement) ? 'neg' : /الموجبة فيه/.test(qq.statement) ? 'pos' : null;
    if (which !== sp.which) throw new Error(`${qq.statement} : mot (${which}) ≠ spec (${sp.which})`);
    const neg = which === 'neg' ? p : n - p; let prod = ONE; for (let i = 0; i < n; i++) prod = prod.mul(new Q(i < neg ? -1n : 1n));
    return pickWhere(qq, (o) => WORD[o] === prod.sign(), qq.statement);
  },
  nfactCount: (ex, qq, sp) => {
    const [n, p] = islands(qq.statement).map(Number); const which = /السالبة فيه/.test(qq.statement) ? 'neg' : /الموجبة فيه/.test(qq.statement) ? 'pos' : null;
    if (which !== sp.which || n !== sp.n || p !== sp.p) throw new Error(`${qq.statement} : lecture ≠ spec`);
    return R(which === 'neg' ? p : n - p);
  },
  nrel: (ex, qq, sp) => {
    const isl = islands(qq.statement).map(Number); const pos = isl[0]; const t = qq.statement;
    if (pos !== sp.p) throw new Error(`${t} : p lu ≠ spec`);
    const neg = /بواحد/.test(t) ? pos + 1 : /نصف/.test(t) ? pos / 2 : /أضعاف/.test(t) ? pos * isl[1] : /ضعف/.test(t) ? pos * 2 : NaN;
    if (!Number.isInteger(neg)) throw new Error(`${t} : relation illisible`);
    let prod = ONE; for (let i = 0; i < neg; i++) prod = prod.mul(new Q(-1n));
    return pickWhere(qq, (o) => WORD[o] === prod.sign(), t);
  },
  /** « جداء n عاملًا كلّها تساوي a » */
  allEq: (ex, qq) => {
    const [ns, base] = islands(qq.statement); const v = powInt(evaluate(base), Number(ns));
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => evaluate(islands(c.content)[0]).eq(v)), qq.statement)));
  },
  optAllEq: (ex, qq) => {
    const tgt = evaluate(nthIsland(qq, 0));
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => { const [n, base] = islands(c.content); return powInt(evaluate(base), Number(n)).eq(tgt); }), qq.statement)));
  },
  /** « جداء k أعداد سالبة هو عدد سالب » / « جداء n أعداد منها k سالبة … هو عدد موجب ». */
  claimSign: (ex, qq) => {
    const isl = islands(qq.statement).map(Number); const k = isl.length === 1 ? isl[0] : isl[1];
    const claimed = /عدد سالب\.?$/.test(qq.statement) ? -1 : /عدد موجب\.?$/.test(qq.statement) ? 1 : null; if (claimed === null) throw new Error(`conclusion illisible : ${qq.statement}`);
    const truth = (k % 2 === 0 ? 1 : -1) === claimed; return pickByText(qq, truth ? 'صحيح' : 'خطأ', qq.statement);
  },
  counter: (ex, qq, sp) => { // un contre-exemple : produit positif dont un facteur est négatif → « tout facteur est positif » est FAUX
    const { sign, negatives } = signBoth(sp.e); if (!(sign > 0 && negatives > 0)) throw new Error(`${sp.e} n'est pas un contre-exemple`);
    return pickByText(qq, 'خطأ', qq.statement);
  },
  claimFalse: (ex, qq, sp) => { if (holds(sp.e)) throw new Error(`${sp.e} : l'énoncé universel tient sur cet exemple, ce n'est pas un contre-exemple`); return claimWordIsFalse(qq); },
  claimSquare: (ex, qq, sp) => { // aucune valeur d'une grille fine n'a de carré (ou de somme de deux carrés) négatif
    const grid = []; for (let v = -80; v <= 80; v++) grid.push(new Q(BigInt(v), 4n));
    const sq = grid.map((g) => g.mul(g)); const neg = sp.sum ? sq.some((a) => sq.some((b) => a.add(b).sign() < 0)) : sq.some((a) => a.sign() < 0);
    if (neg) throw new Error('carré négatif trouvé');
    return claimWordIsFalse(qq);
  },
  minSquare: () => { let m = null; for (let v = -80; v <= 80; v++) { const g = new Q(BigInt(v), 4n); const s = g.mul(g); if (m === null || s.cmp(m) < 0) m = s; } return R(m.toString()); },
  optHole: (ex, qq) => {
    const eq = productIsland(qq.statement); const [l, r] = eq.split('=');
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => evaluate(l.replace('\\square', `(${islands(c.content)[0]})`)).eq(evaluate(r))), qq.statement)));
  },
  optVal: (ex, qq, sp) => {
    const v = evaluate(sp.e ?? nthIsland(qq, 0));
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => evaluate(islands(c.content)[0]).eq(v)), qq.statement)));
  },
  /** options « A = D » / « A > D » / « P' = −P » / « Q' = 2Q » : les lettres sont remplacées par les valeurs des définitions de la feuille. */
  optRel: (ex, qq) => {
    const d = defsOf(ex); const val = (k) => `(${evaluate(d[k]).toString()})`;
    const sub = (s) => s.replace(/\$/g, '').replace(/[A-Z]'?/g, (m) => { if (d[m] === undefined) throw new Error(`${ex.id} : « ${m} » non défini`); return val(m); });
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => holds(sub(c.content))), qq.statement)));
  },
  sameValue: (ex, qq, sp) => {
    const stated = islands(qq.statement)[0].split('=')[1]; if (!evaluate(stated).eq(evaluate(sp.e2))) throw new Error(`${qq.statement} : e2 retapé ≠ énoncé`);
    return pickByText(qq, evaluate(sp.e1).eq(evaluate(sp.e2)) ? 'نعم' : 'لا', qq.statement);
  },
  natural: (ex, qq, sp) => { const v = evaluate(defsOf(ex)[sp.of]); return pickByText(qq, v.d === 1n && v.sign() >= 0 ? 'نعم' : 'لا', qq.statement); },
  eqIsland: (ex, qq) => {
    const [l, r] = nthIsland(qq, 0).split('='); const truth = evaluate(l).eq(evaluate(r));
    return pickByText(qq, truth ? 'صحيحة' : 'خاطئة', qq.statement);
  },
  /** encadrement décimal de num/den (valeurs lues dans les définitions de la feuille). */
  trunc: (ex, qq, sp) => {
    const d = defsOf(ex); const r = evaluate(d[sp.num]).div(evaluate(d[sp.den])); const scale = 10n ** BigInt(sp.digits);
    let f = r.n * scale / r.d; if (r.n < 0n && f * r.d !== r.n * scale) f -= 1n; // plancher
    const k = sp.up ? (f * r.d === r.n * scale ? f : f + 1n) : f;
    return R(decimalString(new Q(k, scale), sp.digits));
  },
  chainSign: (ex, qq, sp) => {
    const fs = chainOf(defsOf(ex)[sp.of]); let prod = ONE; for (const v of fs) prod = prod.mul(new Q(BigInt(v)));
    const byParity = fs.filter((v) => v < 0).length % 2 === 0 ? 1 : -1; if (byParity !== prod.sign()) throw new Error(`${sp.of} : parité ≠ produit exact`);
    return pickWhere(qq, (o) => WORD[o] === prod.sign(), qq.statement);
  },
  chainCount: (ex, qq, sp) => R(chainOf(defsOf(ex)[sp.of]).length),
  optBool: (ex, qq, sp) => {
    const flags = qq.choices.map((c) => { const hit = sp.t.find(([text]) => text.replace(/\$/g, '').trim() === c.content.replace(/\$/g, '').trim()); if (!hit) throw new Error(`${qq.statement} : option « ${c.content} » sans prédicat`); return holds(hit[1]); });
    return C(letterOf(qq, exactlyOne(flags, qq.statement)));
  },
  /** deux programmes de calcul comparés sur un échantillon de valeurs exactes. */
  optSamples: (ex, qq, sp) => {
    const xs = ['-7', '-2.5', '-1', '0', '1', '3', '10']; const run = (f, x) => evaluate(f.replace(/x/g, `(${x})`));
    const pairs = xs.map((x) => [x, run(sp.fa, x), run(sp.fb, x)]);
    const test = { eq: pairs.every(([, a, b]) => a.eq(b)), opp: pairs.every(([, a, b]) => a.eq(b.neg())), neqNeg: pairs.some(([x, a, b]) => x.startsWith('-') && !a.eq(b)), neqPos: pairs.some(([x, a, b]) => !x.startsWith('-') && x !== '0' && !a.eq(b)) };
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => { const hit = sp.map.find(([text]) => text === c.content.replace(/\$/g, '').trim()); if (!hit) throw new Error(`option « ${c.content} » inconnue`); return test[hit[1]]; }), qq.statement)));
  },
  optRoots: (ex, qq) => {
    const tgt = evaluate(nthIsland(qq, 0));
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => { const xs = islands(c.content).map(evaluate); return xs.length === 2 && xs.every((x) => x.mul(x).eq(tgt)) && xs[0].eq(xs[1].neg()); }), qq.statement)));
  },
  /** abscisses opposées : chaque option dit un centre de symétrie, une translation ou l'identité. */
  optLine: (ex, qq, sp) => {
    const xs = sp.xs.map(evaluate); const ys = xs.map((x) => x.mul(new Q(-1n)));
    const two = new Q(2n);
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => {
      const hit = sp.opts.find(([text]) => text.replace(/\$/g, '').trim() === c.content.replace(/\$/g, '').trim()); if (!hit) throw new Error(`option « ${c.content} » inconnue`);
      const o = hit[1];
      if (o.center !== undefined) return xs.every((x, k) => x.add(ys[k]).div(two).eq(evaluate(o.center)));
      if (o.shift !== undefined) return xs.every((x, k) => ys[k].sub(x).eq(evaluate(o.shift)));
      return xs.every((x, k) => ys[k].eq(x));
    }), qq.statement)));
  },
  solveCoef: (ex, qq, sp) => R(evaluate(sp.target).div(evaluate(sp.coef)).toString()),
  coef: (ex, qq, sp) => R(evaluate(sp.coef).toString()),
  /** « ثلاثة أعداد جداؤها T ، اثنان منها a و b » → x = T / (a·b). */
  missing3: (ex, qq) => { const [t, a, b] = islands(qq.statement).map(evaluate); return R(t.div(a.mul(b)).toString()); },
  /** le tableau 3 × 3 de la feuille : toutes les lignes, colonnes et diagonales ont-elles le même produit ? */
  magic: (ex, qq) => {
    const rows = ex.statement.table.rows.map((r) => r.slice(1).map((c) => evaluate(islands(c)[0])));
    const prod = (idx) => idx.reduce((a, [i, j]) => a.mul(rows[i][j]), ONE);
    const lines = [0, 1, 2].flatMap((i) => [[[i, 0], [i, 1], [i, 2]], [[0, i], [1, i], [2, i]]]).concat([[[0, 0], [1, 1], [2, 2]], [[0, 2], [1, 1], [2, 0]]]);
    const ps = lines.map(prod); return pickByText(qq, ps.every((p) => p.eq(ps[0])) ? 'نعم' : 'لا', qq.statement);
  },
};

/* ── les questions (généré une fois, relu et maintenu à la main ensuite) ───── */
const SPEC = {
  "ex-3am-jidaa-ida-nisbiya-l1-001:q1": {"k":"signOf","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l1-001:q2": {"k":"signOf","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l1-001:q3": {"k":"signOf","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l1-001:q4": {"k":"signOf","of":"D"},
  "ex-3am-jidaa-ida-nisbiya-l1-002:q1": {"k":"signOf","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l1-002:q2": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l1-002:q3": {"k":"signOf","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l1-002:q4": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l1-002:q5": {"k":"signOf","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l1-002:q6": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l1-003:q1": {"k":"signOf","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l1-003:q3": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l1-003:q4": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l1-004:q1": {"k":"countNeg","of":"G"},
  "ex-3am-jidaa-ida-nisbiya-l1-004:q2": {"k":"signOf","of":"G"},
  "ex-3am-jidaa-ida-nisbiya-l1-005:q1": {"k":"countNeg","of":"M"},
  "ex-3am-jidaa-ida-nisbiya-l1-005:q2": {"k":"signOf","of":"M"},
  "ex-3am-jidaa-ida-nisbiya-l1-005:q3": {"k":"countNeg","of":"N"},
  "ex-3am-jidaa-ida-nisbiya-l1-005:q4": {"k":"signOf","of":"N"},
  "ex-3am-jidaa-ida-nisbiya-l1-005:q5": {"k":"signOf","e":"(-6)*4*(-2.5)*(-3)*(+7)*9*(-1.5)*(-8)*(+0.2)*(-4)*(-5)*(+3)"},
  "ex-3am-jidaa-ida-nisbiya-l1-006:q1": {"k":"nfact","n":12,"p":5,"which":"neg"},
  "ex-3am-jidaa-ida-nisbiya-l1-006:q2": {"k":"nfact","n":9,"p":6,"which":"pos"},
  "ex-3am-jidaa-ida-nisbiya-l1-006:q3": {"k":"nfact","n":6,"p":2,"which":"neg"},
  "ex-3am-jidaa-ida-nisbiya-l1-006:q4": {"k":"nfact","n":8,"p":4,"which":"pos"},
  "ex-3am-jidaa-ida-nisbiya-l1-006:q5": {"k":"nfact","n":20,"p":20,"which":"neg"},
  "ex-3am-jidaa-ida-nisbiya-l1-007:q1": {"k":"allEq"},
  "ex-3am-jidaa-ida-nisbiya-l1-007:q2": {"k":"allEq"},
  "ex-3am-jidaa-ida-nisbiya-l1-007:q3": {"k":"optAllEq"},
  "ex-3am-jidaa-ida-nisbiya-l1-008:q1": {"k":"signOf","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l1-008:q2": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l1-008:q3": {"k":"signOf","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l1-008:q4": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l1-008:q5": {"k":"signOf","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l1-009:q1": {"k":"chainSign","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l1-009:q2": {"k":"chainCount","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l1-009:q3": {"k":"chainSign","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l1-009:q4": {"k":"chainCount","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l1-009:q5": {"k":"chainSign","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l1-009:q6": {"k":"chainSign","of":"D"},
  "ex-3am-jidaa-ida-nisbiya-l1-010:q1": {"k":"claimSign"},
  "ex-3am-jidaa-ida-nisbiya-l1-010:q2": {"k":"claimSign"},
  "ex-3am-jidaa-ida-nisbiya-l1-010:q3": {"k":"counter","e":"(-2)*(-3)"},
  "ex-3am-jidaa-ida-nisbiya-l1-010:q4": {"k":"claimSign"},
  "ex-3am-jidaa-ida-nisbiya-l2-001:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l2-001:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l2-001:q3": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l2-001:q4": {"k":"val","of":"D"},
  "ex-3am-jidaa-ida-nisbiya-l2-001:q5": {"k":"countDefs","sign":-1},
  "ex-3am-jidaa-ida-nisbiya-l2-002:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l2-002:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l2-002:q3": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l2-002:q4": {"k":"val","of":"D"},
  "ex-3am-jidaa-ida-nisbiya-l2-002:q5": {"k":"optRel"},
  "ex-3am-jidaa-ida-nisbiya-l2-003:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l2-003:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l2-003:q3": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l2-004:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l2-004:q2": {"k":"signOf","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l2-004:q3": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l2-004:q4": {"k":"natural","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l2-005:q1": {"k":"optHole"},
  "ex-3am-jidaa-ida-nisbiya-l2-005:q2": {"k":"optHole"},
  "ex-3am-jidaa-ida-nisbiya-l2-005:q3": {"k":"optHole"},
  "ex-3am-jidaa-ida-nisbiya-l2-005:q4": {"k":"optHole"},
  "ex-3am-jidaa-ida-nisbiya-l2-006:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l2-006:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l2-006:q3": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l2-006:q4": {"k":"val","of":"D"},
  "ex-3am-jidaa-ida-nisbiya-l2-007:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l2-007:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l2-007:q3": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l2-007:q4": {"k":"val","of":"D"},
  "ex-3am-jidaa-ida-nisbiya-l2-007:q5": {"k":"sameValue","e1":"(-25)*17*(-4)","e2":"(-4)*17*(-25)"},
  "ex-3am-jidaa-ida-nisbiya-l2-008:q1": {"k":"e","e":"2*(-3)"},
  "ex-3am-jidaa-ida-nisbiya-l2-008:q2": {"k":"e","e":"(-3)*(-1)"},
  "ex-3am-jidaa-ida-nisbiya-l2-008:q3": {"k":"e","e":"(-1)*4"},
  "ex-3am-jidaa-ida-nisbiya-l2-008:q4": {"k":"e","e":"(2*(-3))*((-3)*(-1))"},
  "ex-3am-jidaa-ida-nisbiya-l2-008:q5": {"k":"e","e":"((-3)*(-1))*((-1)*4)"},
  "ex-3am-jidaa-ida-nisbiya-l2-008:q6": {"k":"e","e":"((2*(-3))*((-3)*(-1)))*(((-3)*(-1))*((-1)*4))"},
  "ex-3am-jidaa-ida-nisbiya-l2-009:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l2-009:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l2-009:q3": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l2-009:q4": {"k":"val","of":"D"},
  "ex-3am-jidaa-ida-nisbiya-l2-010:q1": {"k":"e","e":"(-15)*3*4"},
  "ex-3am-jidaa-ida-nisbiya-l2-010:q2": {"k":"e","e":"(-15)*3*(-2)"},
  "ex-3am-jidaa-ida-nisbiya-l2-010:q3": {"k":"signOf","e":"(-15)*4*(-5)"},
  "ex-3am-jidaa-ida-nisbiya-l2-010:q4": {"k":"e","e":"(-15)*5*6"},
  "ex-3am-jidaa-ida-nisbiya-l3-001:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l3-001:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l3-001:q3": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l3-001:q4": {"k":"val","of":"D"},
  "ex-3am-jidaa-ida-nisbiya-l3-002:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l3-002:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l3-002:q3": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l3-002:q4": {"k":"val","of":"D"},
  "ex-3am-jidaa-ida-nisbiya-l3-003:q1": {"k":"val","of":"V"},
  "ex-3am-jidaa-ida-nisbiya-l3-003:q2": {"k":"val","of":"E"},
  "ex-3am-jidaa-ida-nisbiya-l3-003:q3": {"k":"trunc","num":"V","den":"E","digits":3,"up":false},
  "ex-3am-jidaa-ida-nisbiya-l3-003:q4": {"k":"trunc","num":"V","den":"E","digits":3,"up":true},
  "ex-3am-jidaa-ida-nisbiya-l3-004:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l3-004:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l3-004:q3": {"k":"e","e":"-((-5.2)*(-3.4)*(-8))","target":"141.44"},
  "ex-3am-jidaa-ida-nisbiya-l3-005:q1": {"k":"optVal","e":"-(-5)"},
  "ex-3am-jidaa-ida-nisbiya-l3-005:q2": {"k":"optVal","e":"-(8)"},
  "ex-3am-jidaa-ida-nisbiya-l3-005:q3": {"k":"claimFalse","e":"-(-5) < 0"},
  "ex-3am-jidaa-ida-nisbiya-l3-005:q4": {"k":"optVal","e":"(-1)*(-7.5)"},
  "ex-3am-jidaa-ida-nisbiya-l3-006:q1": {"k":"e","e":"-(8.2) - 5"},
  "ex-3am-jidaa-ida-nisbiya-l3-006:q2": {"k":"e","e":"(8.2)*(-1) + (-5)"},
  "ex-3am-jidaa-ida-nisbiya-l3-006:q3": {"k":"e","e":"-(-3.6) - 5"},
  "ex-3am-jidaa-ida-nisbiya-l3-006:q4": {"k":"e","e":"(-3.6)*(-1) + (-5)"},
  "ex-3am-jidaa-ida-nisbiya-l3-006:q5": {"k":"optSamples","fa":"-(x) - 5","fb":"(x)*(-1) + (-5)","map":[["متساويتان دائمًا","eq"],["متعاكستان دائمًا","opp"],["مختلفتان إذا كان العدد سالبًا","neqNeg"],["مختلفتان إذا كان العدد موجبًا","neqPos"]]},
  "ex-3am-jidaa-ida-nisbiya-l3-007:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l3-007:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l3-007:q3": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l3-007:q4": {"k":"val","of":"D"},
  "ex-3am-jidaa-ida-nisbiya-l3-007:q5": {"k":"e","e":"-(-3.8)"},
  "ex-3am-jidaa-ida-nisbiya-l3-008:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l3-008:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l3-008:q3": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l3-008:q4": {"k":"claimSquare"},
  "ex-3am-jidaa-ida-nisbiya-l3-008:q5": {"k":"optRoots"},
  "ex-3am-jidaa-ida-nisbiya-l3-009:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l3-009:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l3-009:q3": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l3-009:q4": {"k":"val","of":"D"},
  "ex-3am-jidaa-ida-nisbiya-l3-009:q5": {"k":"sameValue","e1":"(-0.5)*(-8)*(-1.25)*(-6)","e2":"(-1.25)*(-6)*(-0.5)*(-8)"},
  "ex-3am-jidaa-ida-nisbiya-l3-010:q1": {"k":"e","e":"(-4)*(-1)"},
  "ex-3am-jidaa-ida-nisbiya-l3-010:q2": {"k":"e","e":"(-2.5)*(-1)"},
  "ex-3am-jidaa-ida-nisbiya-l3-010:q3": {"k":"e","e":"(1.5)*(-1)"},
  "ex-3am-jidaa-ida-nisbiya-l3-010:q4": {"k":"e","e":"(3)*(-1)"},
  "ex-3am-jidaa-ida-nisbiya-l3-010:q5": {"k":"optLine","xs":["-4","-2.5","0","1.5","3"],"opts":[["متناظرتان بالنسبة إلى المبدأ $O$",{"center":"0"}],["متناظرتان بالنسبة إلى النقطة التي فاصلتها $1$",{"center":"1"}],["$M'$ هي $M$ مزاحة بمقدار $1$ نحو اليمين",{"shift":"1"}],["$M'$ هي $M$ نفسها",{"same":true}]]},
  "ex-3am-jidaa-ida-nisbiya-l4-001:q1": {"k":"optVal"},
  "ex-3am-jidaa-ida-nisbiya-l4-001:q2": {"k":"optVal"},
  "ex-3am-jidaa-ida-nisbiya-l4-001:q3": {"k":"optVal"},
  "ex-3am-jidaa-ida-nisbiya-l4-002:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l4-002:q2": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l4-002:q3": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l4-002:q4": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l4-002:q5": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l4-002:q6": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l4-003:q1": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l4-003:q2": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l4-003:q3": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l4-003:q4": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l4-003:q5": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l4-004:q1": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l4-004:q2": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l4-004:q3": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l4-004:q4": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l4-005:q1": {"k":"eqIsland"},
  "ex-3am-jidaa-ida-nisbiya-l4-005:q2": {"k":"eqIsland"},
  "ex-3am-jidaa-ida-nisbiya-l4-005:q3": {"k":"eqIsland"},
  "ex-3am-jidaa-ida-nisbiya-l4-005:q4": {"k":"eqIsland"},
  "ex-3am-jidaa-ida-nisbiya-l4-005:q5": {"k":"eqIsland"},
  "ex-3am-jidaa-ida-nisbiya-l4-006:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l4-006:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l4-006:q3": {"k":"nfactCount","n":123,"p":16,"which":"pos"},
  "ex-3am-jidaa-ida-nisbiya-l4-006:q4": {"k":"nfact","n":123,"p":16,"which":"pos"},
  "ex-3am-jidaa-ida-nisbiya-l4-007:q1": {"k":"val","of":"P"},
  "ex-3am-jidaa-ida-nisbiya-l4-007:q2": {"k":"val","of":"P'"},
  "ex-3am-jidaa-ida-nisbiya-l4-007:q3": {"k":"optRel","defs":{"P":"(-2)*5*(-3)","P'":"2*(-5)*3"}},
  "ex-3am-jidaa-ida-nisbiya-l4-007:q4": {"k":"val","of":"Q"},
  "ex-3am-jidaa-ida-nisbiya-l4-007:q5": {"k":"val","of":"Q'"},
  "ex-3am-jidaa-ida-nisbiya-l4-007:q6": {"k":"optRel","defs":{"Q":"(-2)*(-3)*4*5","Q'":"2*3*(-4)*(-5)"}},
  "ex-3am-jidaa-ida-nisbiya-l4-008:q1": {"k":"nrel","p":3,"rel":"mul"},
  "ex-3am-jidaa-ida-nisbiya-l4-008:q2": {"k":"nrel","p":7,"rel":"mul"},
  "ex-3am-jidaa-ida-nisbiya-l4-008:q3": {"k":"nrel","p":5,"rel":"mul"},
  "ex-3am-jidaa-ida-nisbiya-l4-008:q4": {"k":"nrel","p":10,"rel":"half"},
  "ex-3am-jidaa-ida-nisbiya-l4-008:q5": {"k":"nrel","p":14,"rel":"half"},
  "ex-3am-jidaa-ida-nisbiya-l4-009:q1": {"k":"coef","coef":"(-5)*(-2)*3*(-2.4)*(-1)"},
  "ex-3am-jidaa-ida-nisbiya-l4-009:q2": {"k":"solveCoef","coef":"(-5)*(-2)*3*(-2.4)*(-1)","target":"-36"},
  "ex-3am-jidaa-ida-nisbiya-l4-010:q1": {"k":"e","e":"(-3.5)*98"},
  "ex-3am-jidaa-ida-nisbiya-l4-010:q2": {"k":"e","e":"(-3.5)*46 + (-3.5)*54"},
  "ex-3am-jidaa-ida-nisbiya-l4-010:q3": {"k":"e","e":"(-12)*24 + (-12)*76"},
  "ex-3am-jidaa-ida-nisbiya-l4-010:q4": {"k":"e","e":"(-12)*205"},
  "ex-3am-jidaa-ida-nisbiya-l5-001:q1": {"k":"e","e":"(-2.5)*3*6"},
  "ex-3am-jidaa-ida-nisbiya-l5-001:q2": {"k":"e","e":"(-2.5)*2*(-4)"},
  "ex-3am-jidaa-ida-nisbiya-l5-001:q3": {"k":"signOf","e":"(-2.5)*4*(-7)"},
  "ex-3am-jidaa-ida-nisbiya-l5-001:q4": {"k":"e","e":"(-4)*5*3"},
  "ex-3am-jidaa-ida-nisbiya-l5-001:q5": {"k":"e","e":"(-4)*5*18 + (-4)*5*12"},
  "ex-3am-jidaa-ida-nisbiya-l5-001:q6": {"k":"optBool","t":[["لا","(-4)*5*(-2) > 0"],["نعم","(-4)*5*(-2) < 0"]]},
  "ex-3am-jidaa-ida-nisbiya-l5-002:q1": {"k":"e","e":"(-3)*4*3"},
  "ex-3am-jidaa-ida-nisbiya-l5-002:q2": {"k":"e","e":"(-5)*2*3*2"},
  "ex-3am-jidaa-ida-nisbiya-l5-002:q3": {"k":"e","e":"(-1)*((-3)*4*3)"},
  "ex-3am-jidaa-ida-nisbiya-l5-002:q4": {"k":"e","e":"(-3)*28 + (-3)*22"},
  "ex-3am-jidaa-ida-nisbiya-l5-002:q5": {"k":"optBool","t":[["القسم $C$","(-3)*28 + (-3)*22 < (-3)*4*3"],["الفريق $A$","(-3)*4*3 < (-3)*28 + (-3)*22"],["خسرا العدد نفسه من النقاط","(-3)*4*3 = (-3)*28 + (-3)*22"]]},
  "ex-3am-jidaa-ida-nisbiya-l5-003:q1": {"k":"signOf","e":"(-2)*3*(-0.5)*(-4)*5"},
  "ex-3am-jidaa-ida-nisbiya-l5-003:q2": {"k":"e","e":"(-2)*3*(-0.5)*(-4)*5"},
  "ex-3am-jidaa-ida-nisbiya-l5-003:q3": {"k":"e","e":"(-1.5)*(-1.5)"},
  "ex-3am-jidaa-ida-nisbiya-l5-003:q4": {"k":"e","e":"4*(-2)*0*5*(-3)*9"},
  "ex-3am-jidaa-ida-nisbiya-l5-003:q5": {"k":"optBool","t":[["رياض","4*(-2)*0*5*(-3)*9 > (-2)*3*(-0.5)*(-4)*5"],["سلمى","(-2)*3*(-0.5)*(-4)*5 > 4*(-2)*0*5*(-3)*9"],["تعادل","(-2)*3*(-0.5)*(-4)*5 = 4*(-2)*0*5*(-3)*9"]]},
  "ex-3am-jidaa-ida-nisbiya-l5-004:q1": {"k":"e","e":"-(4.5)"},
  "ex-3am-jidaa-ida-nisbiya-l5-004:q2": {"k":"e","e":"4.5*(-4.5)"},
  "ex-3am-jidaa-ida-nisbiya-l5-004:q3": {"k":"e","e":"(-6)*(-(-6))"},
  "ex-3am-jidaa-ida-nisbiya-l5-004:q4": {"k":"e","e":"(-6)*(-6)"},
  "ex-3am-jidaa-ida-nisbiya-l5-004:q5": {"k":"claimFalse","e":"0*(-(0)) < 0"},
  "ex-3am-jidaa-ida-nisbiya-l5-005:q1": {"k":"e","e":"(-2)*36*(-3)"},
  "ex-3am-jidaa-ida-nisbiya-l5-005:q2": {"k":"e","e":"(-12)*1*(-18)"},
  "ex-3am-jidaa-ida-nisbiya-l5-005:q3": {"k":"e","e":"(-2)*9*(-12)"},
  "ex-3am-jidaa-ida-nisbiya-l5-005:q4": {"k":"e","e":"(-2)*6*(-18)"},
  "ex-3am-jidaa-ida-nisbiya-l5-005:q5": {"k":"e","e":"(-3)*6*(-12)"},
  "ex-3am-jidaa-ida-nisbiya-l5-005:q6": {"k":"magic"},
  "ex-3am-jidaa-ida-nisbiya-l5-006:q1": {"k":"missing3"},
  "ex-3am-jidaa-ida-nisbiya-l5-006:q2": {"k":"missing3"},
  "ex-3am-jidaa-ida-nisbiya-l5-006:q3": {"k":"missing3"},
  "ex-3am-jidaa-ida-nisbiya-l5-006:q4": {"k":"missing3"},
  "ex-3am-jidaa-ida-nisbiya-l5-007:q1": {"k":"signOf","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l5-007:q3": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l5-007:q4": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l5-007:q5": {"k":"signOf","e":"(-3)*(+2)*(-5)*(-1)*(+4)*(-0.5)*(-6)*(-8)*(+10)"},
  "ex-3am-jidaa-ida-nisbiya-l5-008:q1": {"k":"val","of":"A"},
  "ex-3am-jidaa-ida-nisbiya-l5-008:q2": {"k":"val","of":"B"},
  "ex-3am-jidaa-ida-nisbiya-l5-008:q3": {"k":"optRel"},
  "ex-3am-jidaa-ida-nisbiya-l5-008:q4": {"k":"e","e":"-((-2)*(-3)*(-5)*4)","target":"120"},
  "ex-3am-jidaa-ida-nisbiya-l5-009:q1": {"k":"val","of":"C"},
  "ex-3am-jidaa-ida-nisbiya-l5-009:q2": {"k":"val","of":"D"},
  "ex-3am-jidaa-ida-nisbiya-l5-009:q3": {"k":"claimSquare","sum":true},
  "ex-3am-jidaa-ida-nisbiya-l5-009:q4": {"k":"minSquare"},
  "ex-3am-jidaa-ida-nisbiya-l5-010:q1": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l5-010:q2": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l5-010:q3": {"k":"val"},
  "ex-3am-jidaa-ida-nisbiya-l5-010:q4": {"k":"val"},
};

export const ORACLE = {};
for (const [key, sp] of Object.entries(SPEC)) {
  const [exId, qId] = key.split(':'); const ex = BANK.get(exId);
  if (!ex) throw new Error(`oracle jidaa-ida : feuille ${exId} introuvable`);
  const qq = ex.questions.find((x) => x.id === qId); if (!qq) throw new Error(`oracle jidaa-ida : ${key} introuvable`);
  if (!KIND[sp.k]) throw new Error(`oracle jidaa-ida : kind « ${sp.k} » inconnu (${key})`);
  ORACLE[key] = KIND[sp.k](ex, qq, sp);
}
