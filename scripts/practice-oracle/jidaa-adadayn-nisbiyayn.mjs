// Oracle du banc « jidaa-adadayn-nisbiyayn » (جداء عددين نسبيين, 3AM, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer` :
//  - les expressions de l'ÉNONCÉ (formules `A = …` de la feuille, îlots `$…$` de la question) sont LUES dans les fichiers du banc
//    et évaluées par un analyseur écrit dans ce fichier, en rationnels EXACTS (BigInt, aucun flottant, rien importé de
//    packages/core) : « − » U+2212, « × », « ÷ », virgule décimale « {,} », crochets, produits sans signe (« (−2)(+5) ») ;
//  - quand la valeur vient d'un récit (ascenseur, température, points…), l'expression est RETAPÉE ici (`e`) dans la
//    syntaxe ASCII de l'oracle, et quand l'énoncé donne aussi la cible (« produit égal à −28 », « multiple qui précède 30 »)
//    l'oracle la RELIT dans l'énoncé et refuse tout désaccord avec la valeur retapée ;
//  - un QCM n'a qu'une seule bonne option : chaque option est évaluée (valeur, signe, produit de deux nombres, équation avec
//    un « □ » rempli par « + » puis par « − »…) et l'oracle échoue si le nombre d'options justes n'est pas exactement un.
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
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

/** Du LaTeX de l'énoncé vers la syntaxe de l'oracle. */
const norm = (s) => s
  .replace(/\$/g, '').replace(/\\left|\\right/g, '').replace(/\\times|\\cdot/g, '*').replace(/\\div/g, '/')
  .replace(/\{,\}/g, '.').replace(/(\d),(\d)/g, '$1.$2').replace(/[−‒–]/g, '-')
  .replace(/\\,|\\?;|\\ /g, '').replace(/\s+/g, '').replace(/\)\(/g, ')*(').replace(/(\d)\(/g, '$1*(');

/** expr = terme ((+|−) terme)* ; terme = unaire ((*|/) unaire)* ; unaire = (+|−) unaire | primaire ; primaire = nombre | (expr) | [expr]. */
function evaluate(src) {
  const t = norm(src); let i = 0; const peek = () => t[i];
  const expr = () => { let v = term(); while (peek() === '+' || peek() === '-') { const op = t[i++]; const w = term(); v = op === '+' ? v.add(w) : v.sub(w); } return v; };
  const term = () => { let v = unary(); while (peek() === '*' || peek() === '/') { const op = t[i++]; const w = unary(); v = op === '*' ? v.mul(w) : v.div(w); } return v; };
  const unary = () => { if (peek() === '-') { i++; return unary().neg(); } if (peek() === '+') { i++; return unary(); } return primary(); };
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

/* ── lecture du banc ───────────────────────────────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bankDir = join(here, '..', '..', 'content', 'practice', '3am', 'jidaa-adadayn-nisbiyayn');
const BANK = new Map();
for (const lvl of readdirSync(bankDir).filter((d) => d.startsWith('level-'))) {
  for (const f of readdirSync(join(bankDir, lvl)).filter((x) => x.endsWith('.json'))) {
    const ex = JSON.parse(readFileSync(join(bankDir, lvl, f), 'utf8')); BANK.set(ex.id, ex);
  }
}
const islands = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
/** Les définitions « A = … » de la feuille. */
const defsOf = (ex) => Object.fromEntries((ex.statement.formulas ?? []).map((f) => { const k = f.indexOf('='); return [f.slice(0, k).trim(), f.slice(k + 1).trim()]; }));
const productIsland = (text) => { const hit = islands(text).find((s) => /\\times|\\div/.test(s)); if (!hit) throw new Error(`aucun produit dans « ${text} »`); return hit; };

/** L'expression visée par une question : retapée (`e`), ou définie par la feuille (`of`), ou lue dans l'énoncé. */
function target(ex, qq, spec) {
  if (spec.e !== undefined) return spec.e;
  if (spec.of !== undefined) { const d = defsOf(ex)[spec.of]; if (d === undefined) throw new Error(`${ex.id} : « ${spec.of} » non défini`); return d; }
  return productIsland(qq.statement);
}
const exactlyOne = (flags, what) => { const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0); if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`); return hits[0]; };
const letterOf = (qq, k) => qq.choices[k].id;
const optText = (qq) => qq.choices.map((c) => c.content.replace(/\$/g, '').trim());
const WORD = { 'موجب': 1, 'سالب': -1 };
const yesNo = (txt) => (/^(صحيح|نعم)/.test(txt) ? true : /^(خاطئ|لا)/.test(txt) ? false : null);

/** Le texte d'une option → ses nombres (îlots `$a$ و $b$`). */
const optNumbers = (c) => islands(c.content).map((s) => evaluate(s));

/* ── les kinds ─────────────────────────────────────────────────────────────── */
const KIND = {
  val: (ex, qq, sp) => R(evaluate(target(ex, qq, sp)).toString()),
  e: (ex, qq, sp) => R(evaluate(sp.e).toString()),
  count: (ex, qq, sp) => {
    const vals = Object.values(defsOf(ex)).map(evaluate);
    return R(vals.filter((v) => v.sign() === sp.sign).length);
  },
  pairs: (ex, qq, sp) => {
    const d = defsOf(ex); let n = 0;
    for (const a of sp.c1) for (const b of sp.c2) if (evaluate(d[a]).eq(evaluate(d[b]))) n++;
    return R(n);
  },
  optVal: (ex, qq, sp) => {
    const v = evaluate(target(ex, qq, sp));
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => evaluate(islands(c.content)[0]).eq(v)), qq.statement)));
  },
  signOf: (ex, qq, sp) => {
    const s = evaluate(target(ex, qq, sp)).sign();
    const opts = optText(qq);
    return C(letterOf(qq, exactlyOne(opts.map((o) => WORD[o] === s), qq.statement)));
  },
  signHole: (ex, qq) => {
    const eq = productIsland(qq.statement);
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => {
      const s = c.content.replace(/\$/g, '').trim() === '+' ? '+' : '-';
      const body = eq.replace(/\\square(\\,)?/g, s);
      const [l, r] = body.split('=');
      return evaluate(l).eq(evaluate(r));
    }), qq.statement)));
  },
  bool: (ex, qq, sp) => {
    const truth = holds(sp.e);
    if (sp.univ && truth) throw new Error(`${qq.statement} : un seul exemple ne prouve pas une généralité`);
    return C(letterOf(qq, exactlyOne(optText(qq).map((o) => yesNo(o) === truth), qq.statement)));
  },
  optProd: (ex, qq, sp) => {
    const tgt = evaluate(islands(qq.statement)[0]);
    if (sp.target !== undefined && !tgt.eq(evaluate(sp.target))) throw new Error(`${qq.statement} : cible retapée ≠ cible de l'énoncé`);
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => { const [a, b] = optNumbers(c); return a.mul(b).eq(tgt); }), qq.statement)));
  },
  optProps: (ex, qq, sp) => C(letterOf(qq, exactlyOne(qq.choices.map((c) => { const [a, b] = optNumbers(c); return a.mul(b).sign() === sp.prod && a.add(b).sign() === sp.sum; }), qq.statement))),
  optEq: (ex, qq, sp) => {
    const tgt = evaluate(islands(qq.statement)[0]);
    if (!tgt.eq(evaluate(sp.target))) throw new Error(`${qq.statement} : cible retapée ≠ cible de l'énoncé`);
    return C(letterOf(qq, exactlyOne(qq.choices.map((c) => evaluate(sp.e.replace('(N)', `(${islands(c.content)[0]})`)).eq(tgt)), qq.statement)));
  },
  mult: (ex, qq, sp) => {
    const x = evaluate(islands(qq.statement)[0]);
    if (!x.eq(evaluate(String(sp.x)))) throw new Error(`${qq.statement} : x retapé ≠ x de l'énoncé`);
    const m = new Q(BigInt(sp.of)); const k = x.div(m);
    const floor = k.n >= 0n ? k.n / k.d : -((-k.n + k.d - 1n) / k.d); // ⌊x/m⌋ (BigInt)
    const exact = k.d === 1n;
    const pick = sp.dir < 0 ? (exact ? floor - 1n : floor) : floor + 1n;
    return R(m.mul(new Q(pick)).toString());
  },
  cond: (ex, qq, sp) => {
    let s;
    if (sp.ea !== undefined && sp.eb !== undefined) s = sp.ea * sp.eb;
    else if (sp.ea !== undefined) s = sp.prod * sp.ea; // a·b a le signe prod : b a le signe prod·signe(a)
    else s = sp.prod * sp.eb;
    return C(letterOf(qq, exactlyOne(optText(qq).map((o) => WORD[o] === s), qq.statement)));
  },
};

/* ── les questions (généré une fois, relu et maintenu à la main ensuite) ───── */
const SPEC = {
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-001:q1": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-001:q2": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-001:q3": { k: 'val', of: 'C' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-001:q4": { k: 'val', of: 'D' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-002:q1": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-002:q2": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-002:q3": { k: 'val', of: 'C' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-002:q4": { k: 'val', of: 'D' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-003:q1": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-003:q2": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-003:q3": { k: 'val', of: 'C' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-003:q4": { k: 'val', of: 'D' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-004:q1": { k: 'optVal' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-004:q2": { k: 'optVal' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-004:q3": { k: 'optVal' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-005:q1": { k: 'optVal' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-005:q2": { k: 'optVal' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-005:q3": { k: 'optVal' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-006:q1": { k: 'optVal' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-006:q2": { k: 'optVal' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-006:q3": { k: 'optVal' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-007:q1": { k: 'signOf', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-007:q2": { k: 'signOf', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-007:q3": { k: 'signOf', of: 'C' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-007:q4": { k: 'signOf', of: 'D' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-007:q5": { k: 'count', list: 'formulas', sign: 1 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-008:q1": { k: 'count', list: 'formulas', sign: 1 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-008:q2": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-008:q3": { k: 'val', of: 'D' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-008:q4": { k: 'val', of: 'E' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-009:q1": { k: 'count', list: 'formulas', sign: -1 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-009:q2": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-009:q3": { k: 'val', of: 'D' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-009:q4": { k: 'val', of: 'E' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-010:q1": { k: 'e', e: '(-5)+(-5)+(-5)+(-5)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-010:q2": { k: 'val' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-010:q3": { k: 'e', e: '(-30)*5' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l1-010:q4": { k: 'optVal', e: '(-4)*6' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-001:q1": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-001:q2": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-001:q3": { k: 'val', of: 'C' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-001:q4": { k: 'val', of: 'D' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-001:q5": { k: 'val', of: 'E' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-002:q1": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-002:q2": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-002:q3": { k: 'val', of: 'C' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-002:q4": { k: 'val', of: 'D' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-003:q1": { k: 'signHole' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-003:q2": { k: 'signHole' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-003:q3": { k: 'signHole' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-003:q4": { k: 'signHole' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-004:q1": { k: 'val' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-004:q2": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-004:q3": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-004:q4": { k: 'val', of: 'C' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-004:q5": { k: 'val', of: 'D' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-005:q1": { k: 'optVal' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-005:q2": { k: 'optVal' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-005:q3": { k: 'optVal' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-006:q1": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-006:q2": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-006:q3": { k: 'val', of: 'C' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-007:q1": { k: 'signHole' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-007:q2": { k: 'signHole' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-007:q3": { k: 'signHole' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-007:q4": { k: 'signHole' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-008:q1": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-008:q2": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-008:q3": { k: 'val', of: 'C' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-008:q4": { k: 'val', of: 'D' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-009:q1": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-009:q2": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-009:q3": { k: 'val', of: 'C' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-009:q4": { k: 'val', of: 'D' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-010:q1": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-010:q2": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-010:q3": { k: 'val', of: 'C' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-010:q4": { k: 'val', of: 'D' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-010:q5": { k: 'val', of: 'E' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-010:q6": { k: 'val', of: 'F' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l2-010:q7": { k: 'pairs', c1: ['A', 'B', 'C'], c2: ['D', 'E', 'F'] },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-001:q1": { k: 'e', e: '(-2)*(3)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-001:q2": { k: 'e', e: '(-2)*(-2)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-001:q3": { k: 'e', e: '(-2)*(-4)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-001:q4": { k: 'optVal', e: '(-2)*(-3)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-002:q1": { k: 'e', e: '(3)*(2)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-002:q2": { k: 'e', e: '(3)*(-3)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-002:q3": { k: 'e', e: '(3)*(-2)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-002:q4": { k: 'optVal', e: '3*(-1)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-003:q1": { k: 'e', e: '(-3)*(2)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-003:q2": { k: 'e', e: '(-3)*(-4)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-003:q3": { k: 'e', e: '(-3)*(-1.5)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-003:q4": { k: 'optVal', e: '(-3)*(-3)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-004:q1": { k: 'e', e: '(-1.5)*(4)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-004:q2": { k: 'e', e: '(-1.5)*(-6)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-004:q3": { k: 'e', e: '(-1.5)*(-2.5)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-004:q4": { k: 'optVal', e: '(-1.5)*(-2)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-005:q1": { k: 'e', e: '3*4' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-005:q2": { k: 'e', e: '(-2)*5' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-005:q3": { k: 'e', e: '3*4+(-2)*5' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-005:q4": { k: 'e', e: '(-2)*(-3)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-006:q1": { k: 'e', e: '(-450)*(4)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-006:q2": { k: 'e', e: '(-450)*(-3)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-006:q3": { k: 'optEq', e: '(-450)*(N)', target: '-2700' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-007:q1": { k: 'val' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-007:q2": { k: 'val', of: 'V' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-007:q3": { k: 'val', of: 'E' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-008:q1": { k: 'optProd', target: '-28' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-008:q2": { k: 'optProd', target: '36' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-008:q3": { k: 'optProd', target: '-0.25' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-008:q4": { k: 'optProd', target: '4.9' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-009:q1": { k: 'e', e: '(-12)+(-12)+(-12)+(-12)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-009:q2": { k: 'e', e: '(-12)*2.5' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-010:q1": { k: 'e', e: '(-18)*(36)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-010:q2": { k: 'e', e: '(-18)*(20)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l3-010:q3": { k: 'e', e: '(-18)*36/100' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-001:q1": { k: 'val' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-001:q2": { k: 'e', e: '5+(-5)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-001:q3": { k: 'e', e: '(-6)*(-5)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-002:q1": { k: 'e', e: '0-(-5)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-002:q2": { k: 'e', e: '(-5)*(-1)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-002:q3": { k: 'e', e: '(-5)*(-2)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-002:q4": { k: 'e', e: '(-5)*(-3)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-003:q1": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-003:q2": { k: 'e', e: '(-1.5)*(0.6+(-0.6))' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-003:q3": { k: 'e', e: '(-1.5)*(-0.6)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-004:q1": { k: 'optProps', prod: 1, sum: -1 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-004:q2": { k: 'optProps', prod: -1, sum: 1 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-004:q3": { k: 'optProps', prod: 1, sum: 1 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-004:q4": { k: 'optProps', prod: -1, sum: -1 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-005:q1": { k: 'bool', e: '(-3)*(-4)<0', univ: true },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-005:q2": { k: 'val' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-005:q3": { k: 'bool', e: '(-3)*2>2', univ: true },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-005:q4": { k: 'val' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-006:q1": { k: 'signOf' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-006:q2": { k: 'signOf', of: 'G' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-007:q1": { k: 'signOf' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-007:q2": { k: 'val' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-007:q3": { k: 'signOf', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-007:q4": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-007:q5": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-008:q1": { k: 'mult', of: 6, dir: -1, x: 30 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-008:q2": { k: 'mult', of: 6, dir: -1, x: -12 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-008:q3": { k: 'mult', of: 6, dir: 1, x: -20 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-008:q4": { k: 'mult', of: 6, dir: 1, x: 42 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-009:q1": { k: 'val' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-009:q2": { k: 'val' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-009:q3": { k: 'e', e: '(-4)*6+(-4)*(-6)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-010:q1": { k: 'cond', ea: -1, eb: -1 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-010:q2": { k: 'cond', ea: 1, eb: -1 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-010:q3": { k: 'cond', ea: -1, prod: 1 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l4-010:q4": { k: 'cond', eb: -1, prod: -1 },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-001:q1": { k: 'e', e: '(-3)*(2)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-001:q2": { k: 'e', e: '(-3)*(-2)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-001:q3": { k: 'e', e: '(-3)*(-3)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-001:q4": { k: 'bool', e: '(-3)*(-2)=-6' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-001:q6": { k: 'e', e: '(2)*(-4)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-001:q7": { k: 'optVal', e: '2*(-3)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-002:q1": { k: 'e', e: '(-2.5)*(3)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-002:q2": { k: 'e', e: '(-2.5)*(-4)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-002:q3": { k: 'e', e: '(-2.5)*(-2)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-002:q4": { k: 'bool', e: '(-2.5)*(-4)<5' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-002:q5": { k: 'e', e: '(-2.5)*(-4)-(-2.5)*3' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-003:q1": { k: 'e', e: '4*7' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-003:q2": { k: 'e', e: '(-3)*2' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-003:q3": { k: 'e', e: '4*7+(-3)*2' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-003:q4": { k: 'e', e: '(-3)*4' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-003:q5": { k: 'e', e: '(-3)*(-2)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-003:q6": { k: 'bool', e: '5*4+(-3)*4+(-3)*(-2)>22' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-004:q1": { k: 'e', e: '(-600)*(6)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-004:q2": { k: 'e', e: '(-600)*(-5)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-004:q3": { k: 'e', e: '(-600)*(12)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-004:q4": { k: 'bool', e: '4000+(-600)*12>=0' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-004:q5": { k: 'e', e: '0-(4000+(-600)*12)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-005:q1": { k: 'e', e: '(-15)*(8)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-005:q2": { k: 'e', e: '(-15)*(-6)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-005:q3": { k: 'optEq', e: '(-15)*(N)', target: '-105' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-005:q4": { k: 'e', e: '(-7.5)*(4)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-005:q5": { k: 'e', e: '(-7.5)*(-4)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-006:q1": { k: 'e', e: '(-6)*(5)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-006:q2": { k: 'e', e: '(-6)*(-4)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-006:q3": { k: 'optVal', e: '(-6)*(-3)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-006:q4": { k: 'e', e: '(-6)*(-7)' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-006:q5": { k: 'bool', e: '(-6)*(-7)<0' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-007:q1": { k: 'val' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-007:q2": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-007:q3": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-007:q4": { k: 'e', e: '((16.5)*(-4)+(-39)/0.5)/((9-12)*(18-(1+35/7)))' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-008:q1": { k: 'val' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-008:q2": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-008:q3": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-009:q1": { k: 'val', of: 'A' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-009:q2": { k: 'val', of: 'B' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-009:q3": { k: 'signOf', e: '((-1.2)*(-5))*(8*(-0.75))' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-009:q4": { k: 'e', e: '((-1.2)*(-5))*(8*(-0.75))' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-010:q1": { k: 'val' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-010:q2": { k: 'val' },
  "ex-3am-jidaa-adadayn-nisbiyayn-l5-010:q3": { k: 'val' },
};

export const ORACLE = {};
for (const [key, sp] of Object.entries(SPEC)) {
  const [exId, qId] = key.split(':'); const ex = BANK.get(exId);
  if (!ex) throw new Error(`oracle jidaa : feuille ${exId} introuvable`);
  const qq = ex.questions.find((x) => x.id === qId); if (!qq) throw new Error(`oracle jidaa : ${key} introuvable`);
  if (!KIND[sp.k]) throw new Error(`oracle jidaa : kind « ${sp.k} » inconnu (${key})`);
  ORACLE[key] = KIND[sp.k](ex, qq, sp);
}
