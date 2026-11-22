// Oracle du banc « amaliyat-natiqa » (العمليات على الأعداد الناطقة, 3AM unité 2, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول / الثاني »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec un évaluateur de CHAÎNES de rationnels EXACTS en BigInt
// (pgcd propre, priorités, parenthèses, moins unaire, décimaux, fraction composée, puissance entière, lettres) écrit dans ce
// fichier — indépendant de packages/core ; les nombres de l'énoncé sont retapés en littéraux dans une écriture ASCII
// (« -7/12+3/8 », « 4/15:(-8/9) », « [3/4-1/6|5/8+1/3] » pour une fraction composée, « {5/-8} » pour un signe dans le dénominateur) :
//  - E(chaîne, env) : la valeur exacte ; A(x) = la clé « constructed » en écriture réduite ; RECIP, ROUNDU (arrondi à l'unité,
//    demi vers le haut), EQ / REL / SGN / ISINT / ISNAT : prédicats ; un QCM est jugé option par option : PICK exige qu'UNE seule
//    option soit vraie (donc tout distracteur est FAUX) ;
//  - audit(bank) : RE-LIT le LaTeX de l'énoncé et des options avec un second analyseur (\dfrac imbriqué, \left( \right), \times, \div,
//    {,} décimal, exposants, lettres + « من أجل ») : tout « احسب $…$ » est évalué PAR LES PRIORITÉS de la chaîne littérale et doit valoir
//    la clé ; « مقلوب », « جد العدد x » (substitution dans la chaîne), « بيّن أنّ … عدد صحيح / طبيعي » (la propriété est vraie),
//    « هل العدد … » / « هل المساواة … » / « إشارة العدد » / « قارن » / QCM de valeurs : chaque option est jugée, exactement UNE est vraie
//    et c'est la marquée ; les clés sont réduites ; chaque distracteur COMPTÉ porte un MISC-AMAL-* et ne vaut pas la clé ; les
//    distracteurs SUMSIGN / PRODSIGN / RECIPSIGN valent l'opposé de la clé (ou du mauvais mélange) et PRIORITY se recalcule de gauche
//    à droite sur la chaîne.
import { R, C } from './helpers.mjs';

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
  pow(k) { let r = new Q(1n); for (let i = 0; i < k; i++) r = r.mul(this); return r; }
  eq(o) { return this.n === o.n && this.d === o.d; }
  lt(o) { return this.n * o.d < o.n * this.d; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
/** « 12 », « 2.4 », « -3 » → Q (littéral exact, pas de flottant). */
const lit = (s) => {
  const neg = s.startsWith('-'); const t = neg ? s.slice(1) : s;
  const [i, f = ''] = t.split('.');
  const q = new Q(BigInt(i + f), 10n ** BigInt(f.length));
  return neg ? q.neg() : q;
};

/* ── Évaluateur de chaînes ASCII (retapées dans cet oracle) ─────────────── */
export function E(src, env = {}) {
  const s = src.replace(/\s+/g, ''); let i = 0;
  const vars = Object.fromEntries(Object.entries(env).map(([k, v]) => [k, typeof v === 'string' ? E(v) : v]));
  const peek = () => s[i] ?? '';
  const eat = (c) => { if (s[i] !== c) throw new Error(`« ${c} » attendu en ${i} de ${src}`); i++; };
  const num = () => { const m = /^-?\d+(\.\d+)?/.exec(s.slice(i)); if (!m) throw new Error(`nombre attendu en ${i} de ${src}`); i += m[0].length; return m[0]; };
  const atom = () => {
    const c = peek();
    if (c === '(') { i++; const v = sum(); eat(')'); return v; }
    if (c === '[') { i++; const n = sum(); eat('|'); const d = sum(); eat(']'); return n.div(d); }
    if (c === '{') { i++; const a = num(); eat('/'); const b = num(); eat('}'); return lit(a).div(lit(b)); }
    if (/[a-z]/.test(c)) { i++; if (!(c in vars)) throw new Error(`lettre ${c} sans valeur`); return vars[c]; }
    const a = lit(num());
    if (peek() === '/') { i++; return a.div(lit(num())); }
    return a;
  };
  const power = () => { const a = atom(); if (peek() === '^') { i++; return a.pow(Number(num())); } return a; };
  const unary = () => { if (peek() === '-') { i++; return unary().neg(); } return power(); };
  const prod = () => { let v = unary(); while (peek() === '*' || peek() === ':') { const op = s[i++]; const r = unary(); v = op === '*' ? v.mul(r) : v.div(r); } return v; };
  const sum = () => { let v = prod(); while (peek() === '+' || peek() === '-') { const op = s[i++]; const r = prod(); v = op === '+' ? v.add(r) : v.sub(r); } return v; };
  const out = sum();
  if (i !== s.length) throw new Error(`reste « ${s.slice(i)} » dans ${src}`);
  return out;
}
const A = (x) => R(x.toString());
const RECIP = (x) => new Q(1n).div(x);
const EQ = (a, b) => a.eq(b);
const SGN = (x) => (x.n > 0n ? 1 : x.n < 0n ? -1 : 0);
const REL = (a, b) => (a.lt(b) ? '<' : b.lt(a) ? '>' : '=');
const ISINT = (x) => x.d === 1n;
const ISNAT = (x) => x.d === 1n && x.n >= 0n;
/** Arrondi à l'unité, demi vers le haut : plancher de x + 1/2 par division entière. */
const ROUNDU = (x) => { const t = x.add(new Q(1n, 2n)); const f = t.n >= 0n ? t.n / t.d : -((-t.n + t.d - 1n) / t.d); return new Q(f); };
const PICK = (flags) => {
  const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`QCM : ${hits.length} options justes`);
  return C('ABCDEF'[hits[0]]);
};

/* ── Second analyseur : le LaTeX de l'énoncé (\dfrac imbriqué, \left( \right), \times, \div, {,}, ^{k}, lettres) ───────────────── */
export function TEX(latex, env = {}, ltr = false) {
  const s = latex.replace(/\\left|\\right/g, '').replace(/\{,\}/g, '.').replace(/\\dfrac/g, '§').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\\cdot/g, '*').replace(/\s+/g, '');
  let i = 0;
  const peek = () => s[i] ?? '';
  const eat = (c) => { if (s[i] !== c) throw new Error(`« ${c} » attendu en ${i} de ${latex}`); i++; };
  const num = () => { const m = /^\d+(\.\d+)?/.exec(s.slice(i)); if (!m) throw new Error(`nombre attendu en ${i} de ${latex}`); i += m[0].length; return lit(m[0]); };
  const atom = () => {
    const c = peek();
    if (c === '§') { i++; eat('{'); const n = sum(); eat('}'); eat('{'); const d = sum(); eat('}'); return n.div(d); }
    if (c === '(') { i++; const v = sum(); eat(')'); return v; }
    if (/[A-Za-z]/.test(c)) { i++; if (!(c in env)) throw new Error(`lettre ${c} sans valeur dans ${latex}`); return env[c]; }
    return num();
  };
  const power = () => {
    const a = atom();
    if (peek() === '^') { i++; let k; if (peek() === '{') { i++; k = Number(num().n); eat('}'); } else k = Number(num().n); return a.pow(k); }
    return a;
  };
  const unary = () => { if (peek() === '-') { i++; return unary().neg(); } return power(); };
  const prod = () => { let v = unary(); while (peek() === '*' || peek() === '/') { const op = s[i++]; const r = unary(); v = op === '*' ? v.mul(r) : v.div(r); } return v; };
  const sum = () => { let v = prod(); while (peek() === '+' || peek() === '-') { const op = s[i++]; const r = prod(); v = op === '+' ? v.add(r) : v.sub(r); } return v; };
  // ltr : chaîne de premier niveau lue de gauche à droite, sans priorités (le raisonnement du distracteur PRIORITY).
  const flat = () => { let v = unary(); while ('+-*/'.includes(peek()) && peek() !== '') { const op = s[i++]; const r = unary(); v = op === '+' ? v.add(r) : op === '-' ? v.sub(r) : op === '*' ? v.mul(r) : v.div(r); } return v; };
  const out = ltr ? flat() : sum();
  if (i !== s.length) throw new Error(`reste « ${s.slice(i)} » dans ${latex}`);
  return out;
}
const islands = (s) => [...s.matchAll(/\$([^$]+)\$/g)].map((x) => x[1]);
/** « E = expression » → expression ; une écriture sans nom reste telle quelle. */
const stripName = (isl) => { const k = isl.indexOf('='); if (k < 0) return isl; const l = isl.slice(0, k); return /^[A-Za-z\s\\]*(div|times|[+])?[A-Za-z\s]*$/.test(l) && l.replace(/[\s\\]/g, '') !== '' ? isl.slice(k + 1) : isl; };
/** Les affectations « x = valeur » d'un « من أجل » (toutes les îles qui suivent la première). */
const envOf = (statement) => {
  const env = {};
  for (const isl of islands(statement).slice(1)) {
    const m = /^\s*([A-Za-z])\s*=\s*(.+)$/.exec(isl);
    if (m) env[m[1]] = TEX(m[2]);
  }
  return env;
};
const SIGN_WORDS = [['موجب', 1], ['سالب', -1], ['معدوم', 0]];
const signWord = (txt) => SIGN_WORDS.find(([w]) => txt.includes(w))?.[1];
/** Une chaîne « a rel b » (rel ∈ < = >) dans un « A rel B ». */
const relOf = (txt) => (/<\s*B/.test(txt) ? '<' : />\s*B/.test(txt) ? '>' : '=');
/** Audit de la banque (appelé par practice-answer-oracle.test.mjs) : liste des problèmes (vide = conforme). */
export function audit(bank) {
  const problems = [];
  const MISC = /^MISC-AMAL-(SUMSIGN|ADDDIST|ACROSS|PRODSIGN|NOFLIP|FLIPFIRST|RECIPSIGN|PRIORITY|DECNUM)$/;
  for (const { key, q: qu } of bank) {
    const st = qu.statement; const isl = islands(st);
    try {
      if (qu.answerType === 'rational') {
        const e = String(qu.expectedAnswer);
        const m = /^(-?\d+)(?:\/(\d+))?$/.exec(e);
        if (!m) { problems.push(`${key} : clé non fractionnaire « ${e} »`); continue; }
        const val = E(e);
        if (m[2] !== undefined && gcd(BigInt(m[1]), BigInt(m[2])) !== 1n) problems.push(`${key} : la clé ${e} n'est pas réduite`);
        if (m[2] !== undefined && BigInt(m[2]) === 1n) problems.push(`${key} : clé « /1 »`);
        if ((val.d === 1n) === (qu.evaluationPolicy?.requiredForm === 'irreducible')) problems.push(`${key} : requiredForm « irreducible » attendu exactement pour une clé non entière`);
        for (const s of qu.misconceptionSignatures ?? []) {
          if (!MISC.test(s.id)) problems.push(`${key} : signature ${s.id} hors MISC-AMAL-*`);
          const sv = E(s.value);
          if (sv.eq(val)) problems.push(`${key} : la signature ${s.id} (${s.value}) est la bonne réponse`);
          if (/SUMSIGN|PRODSIGN/.test(s.id) && !sv.eq(val.neg())) problems.push(`${key} : ${s.id} (${s.value}) devrait être l'opposé de la clé`);
          if (s.id === 'MISC-AMAL-PRIORITY' && /^احسب/.test(st) && !TEX(stripName(isl[0]), envOf(st), true).eq(sv)) problems.push(`${key} : PRIORITY (${s.value}) n'est pas la lecture de gauche à droite de la chaîne`);
          if (s.id === 'MISC-AMAL-RECIPSIGN' && !sv.eq(val.neg())) problems.push(`${key} : RECIPSIGN (${s.value}) devrait être l'opposé du مقلوب`);
        }
        // « احسب $expression$ » : la clé est la valeur de l'expression imprimée, avec les priorités de la chaîne littérale.
        if (/^احسب/.test(st) && isl.length) {
          const env = envOf(st);
          const expr = stripName(isl[0]);
          if (!TEX(expr, env).eq(val)) problems.push(`${key} : l'expression « ${expr} » ne vaut pas la clé ${e}`);
        }
        // « ما مقلوب العدد x » : la clé est son inverse.
        if (/^ما مقلوب/.test(st)) {
          const x = TEX(isl[0]);
          if (!x.mul(val).eq(new Q(1n))) problems.push(`${key} : ${e} n'est pas le مقلوب de ${isl[0]}`);
          for (const s of qu.misconceptionSignatures ?? []) if (E(s.value).mul(x).eq(new Q(1n))) problems.push(`${key} : le distracteur ${s.value} est le مقلوب`);
        }
        // « جد العدد x … المساواة » : on substitue la clé dans la chaîne littérale.
        if (/^جد العدد/.test(st)) {
          const eq = isl.find((t) => t.includes('='));
          const [l, r] = eq.split('=');
          const env = { x: val };
          if (!TEX(l, env).eq(TEX(r, env))) problems.push(`${key} : x = ${e} ne vérifie pas ${eq}`);
        }
      } else if (qu.answerType === 'choice' || qu.answerType === 'multiChoice') {
        const good = qu.choices.filter((c) => c.isCorrect);
        if (qu.answerType === 'choice' && good.length !== 1) problems.push(`${key} : ${good.length} bonnes options`);
        if (qu.counted !== false) {
          for (const c of qu.choices.filter((x) => !x.isCorrect)) if (!c.misconceptionId || !MISC.test(c.misconceptionId)) problems.push(`${key} : le distracteur ${c.id} ne porte pas de MISC-AMAL-*`);
        }
        let truth = null; // une affirmation par option : booléens
        if (/^احسب .* ثمّ اختر النتيجة/.test(st) || /ثمّ اختر النتيجة الصحيحة/.test(st)) {
          const env = envOf(st);
          const v = TEX(stripName(isl[0]), env);
          truth = qu.choices.map((c) => TEX(islands(c.content)[0]).eq(v));
        } else if (/^ما مقلوب/.test(st)) {
          const x = TEX(isl[0]);
          truth = qu.choices.map((c) => TEX(islands(c.content)[0]).mul(x).eq(new Q(1n)));
        } else if (/إشارة العدد/.test(st)) {
          const v = TEX(stripName(isl[0]));
          truth = qu.choices.map((c) => signWord(c.content) === SGN(v));
        } else if (/^هل العدد/.test(st)) {
          const v = TEX(stripName(isl[0]));
          const nat = /طبيعي/.test(st);
          const yes = nat ? ISNAT(v) : ISINT(v);
          truth = qu.choices.map((c) => (c.content === 'نعم') === yes);
        } else if (/^هل المساواة/.test(st)) {
          const [l, r] = isl[0].split('=');
          const yes = TEX(l).eq(TEX(r));
          truth = qu.choices.map((c) => (c.content === 'نعم') === yes);
        } else if (/ثمّ اختر المقارنة/.test(st)) {
          const a = TEX(stripName(isl[0])); const b = TEX(stripName(isl[1]));
          truth = qu.choices.map((c) => relOf(islands(c.content)[0]) === REL(a, b));
        }
        if (truth === null) problems.push(`${key} : QCM non relu (énoncé inconnu)`);
        else {
          if (truth.filter(Boolean).length !== 1) problems.push(`${key} : ${truth.filter(Boolean).length} options vraies à la relecture`);
          qu.choices.forEach((c, k) => { if (truth[k] !== c.isCorrect) problems.push(`${key} : l'option ${c.id} est ${truth[k] ? 'vraie' : 'fausse'} mais marquée ${c.isCorrect ? 'correcte' : 'incorrecte'}`); });
        }
      } else if (qu.answerType === 'selfCheck') {
        if (/^بيّن أنّ العدد/.test(st)) {
          const env = envOf(st);
          const v = TEX(stripName(isl[0]), env);
          const nat = /عدد طبيعي/.test(st);
          if (!(nat ? ISNAT(v) : ISINT(v))) problems.push(`${key} : l'énoncé « بيّن أنّ » est faux (${v})`);
        }
      }
    } catch (err) { problems.push(`${key} : ${err.message}`); }
  }
  return problems;
}

export const ORACLE = {
  // ex-3am-amaliyat-natiqa-l1-001
  'ex-3am-amaliyat-natiqa-l1-001:q1': A(E('-7/12+3/8', {})),
  'ex-3am-amaliyat-natiqa-l1-001:q2': A(E('5/6-9/10', {})),
  'ex-3am-amaliyat-natiqa-l1-001:q3': A(E('4/9*(-3/10)', {})),
  'ex-3am-amaliyat-natiqa-l1-001:q4': A(E('4/15:(-8/9)', {})),
  // ex-3am-amaliyat-natiqa-l1-002
  'ex-3am-amaliyat-natiqa-l1-002:q1': A(E('-5/8+7/12', {})),
  'ex-3am-amaliyat-natiqa-l1-002:q2': A(E('9/14-5/6', {})),
  'ex-3am-amaliyat-natiqa-l1-002:q3': A(E('-8/15:(-4/5)', {})),
  'ex-3am-amaliyat-natiqa-l1-002:q4': A(E('-3/7*(-14/15)', {})),
  // ex-3am-amaliyat-natiqa-l1-003
  'ex-3am-amaliyat-natiqa-l1-003:q1': A(RECIP(E('-9/4'))),
  'ex-3am-amaliyat-natiqa-l1-003:q2': A(RECIP(E('-15'))),
  'ex-3am-amaliyat-natiqa-l1-003:q3': A(E('7/10:(-7/15)', {})),
  'ex-3am-amaliyat-natiqa-l1-003:q4': A(E('-5/12:(-15/8)', {})),
  // ex-3am-amaliyat-natiqa-l1-004
  'ex-3am-amaliyat-natiqa-l1-004:q1': A(E('1.5/4-5/6', {})),
  'ex-3am-amaliyat-natiqa-l1-004:q2': A(E('-3.2/5+7/10', {})),
  'ex-3am-amaliyat-natiqa-l1-004:q3': A(E('2.4/9*(-5/4)', {})),
  'ex-3am-amaliyat-natiqa-l1-004:q4': A(E('{-4.5/6}:3/8', {})),
  // ex-3am-amaliyat-natiqa-l1-005
  'ex-3am-amaliyat-natiqa-l1-005:q1': A(RECIP(E('-3/7'))),
  'ex-3am-amaliyat-natiqa-l1-005:q2': A(RECIP(E('-12'))),
  'ex-3am-amaliyat-natiqa-l1-005:q3': A(RECIP(E('{5/-8}'))),
  'ex-3am-amaliyat-natiqa-l1-005:q4': A(E('(-3/7)*(-7/3)', {})),
  // ex-3am-amaliyat-natiqa-l1-006
  'ex-3am-amaliyat-natiqa-l1-006:q1': A(E('5/9:(-10/3)', {})),
  'ex-3am-amaliyat-natiqa-l1-006:q2': A(E('-6/7:(-9/14)', {})),
  'ex-3am-amaliyat-natiqa-l1-006:q3': A(E('-8:4/5', {})),
  'ex-3am-amaliyat-natiqa-l1-006:q4': A(E('-3/10:6', {})),
  // ex-3am-amaliyat-natiqa-l1-007
  'ex-3am-amaliyat-natiqa-l1-007:q1': A(E('6/5*(-15/8)', {})),
  'ex-3am-amaliyat-natiqa-l1-007:q2': A(E('{-9/10}*{25/-6}', {})),
  'ex-3am-amaliyat-natiqa-l1-007:q3': A(E('-12*(-5/8)', {})),
  'ex-3am-amaliyat-natiqa-l1-007:q4': A(E('3/8*10/9', {})),
  // ex-3am-amaliyat-natiqa-l1-008
  'ex-3am-amaliyat-natiqa-l1-008:q1': A(RECIP(E('-8'))),
  'ex-3am-amaliyat-natiqa-l1-008:q2': A(RECIP(E('7/2'))),
  'ex-3am-amaliyat-natiqa-l1-008:q3': A(RECIP(E('-5/11'))),
  'ex-3am-amaliyat-natiqa-l1-008:q4': PICK([EQ(E('0.33'), RECIP(E('3'))), EQ(E('-3'), RECIP(E('3'))), EQ(E('1/3'), RECIP(E('3')))]),
  // ex-3am-amaliyat-natiqa-l1-009
  'ex-3am-amaliyat-natiqa-l1-009:q1': PICK([EQ(E('87/200'), E('1.2/5+{-2.7/4}', {})), EQ(E('-87/20'), E('1.2/5+{-2.7/4}', {})), EQ(E('-87/200'), E('1.2/5+{-2.7/4}', {}))]),
  'ex-3am-amaliyat-natiqa-l1-009:q2': A(E('3.5/6-1.2/4', {})),
  'ex-3am-amaliyat-natiqa-l1-009:q3': A(E('{-1.8/4}*(-5/9)', {})),
  // ex-3am-amaliyat-natiqa-l1-010
  'ex-3am-amaliyat-natiqa-l1-010:q1': A(E('-5/13:10', {})),
  'ex-3am-amaliyat-natiqa-l1-010:q2': A(E('7/8:9/4', {})),
  'ex-3am-amaliyat-natiqa-l1-010:q3': A(E('4/15:(-8/3)', {})),
  'ex-3am-amaliyat-natiqa-l1-010:q4': A(E('8:6/5', {})),
  // ex-3am-amaliyat-natiqa-l2-001
  'ex-3am-amaliyat-natiqa-l2-001:q1': A(E('5/6-3/4*2/9', {})),
  'ex-3am-amaliyat-natiqa-l2-001:q2': A(E('(1/2-7/8)*(-4/9)', {})),
  'ex-3am-amaliyat-natiqa-l2-001:q3': PICK([SGN(E('(-3/7)*5.2*(-8/9)*(-0.4)')) === 1, SGN(E('(-3/7)*5.2*(-8/9)*(-0.4)')) === -1, SGN(E('(-3/7)*5.2*(-8/9)*(-0.4)')) === 0]),
  'ex-3am-amaliyat-natiqa-l2-001:q4': PICK([SGN(E('(-11/4):(-7/9)')) === -1, SGN(E('(-11/4):(-7/9)')) === 0, SGN(E('(-11/4):(-7/9)')) === 1]),
  // ex-3am-amaliyat-natiqa-l2-002
  'ex-3am-amaliyat-natiqa-l2-002:q3': A(E('-2:3', {})),
  // ex-3am-amaliyat-natiqa-l2-003
  'ex-3am-amaliyat-natiqa-l2-003:q1': A(E('3/4-7/10:(-14/15)', {})),
  'ex-3am-amaliyat-natiqa-l2-003:q2': PICK([ISINT(E('3/4-7/10:(-14/15)')), !ISINT(E('3/4-7/10:(-14/15)'))]),
  'ex-3am-amaliyat-natiqa-l2-003:q3': A(E('(2/3-1/2)*(-6)', {})),
  'ex-3am-amaliyat-natiqa-l2-003:q4': PICK([!ISINT(E('(2/3-1/2)*(-6)')), ISINT(E('(2/3-1/2)*(-6)'))]),
  // ex-3am-amaliyat-natiqa-l2-004
  'ex-3am-amaliyat-natiqa-l2-004:q1': PICK([SGN(E('-9/7+(-2/5)')) === 1, SGN(E('-9/7+(-2/5)')) === -1, SGN(E('-9/7+(-2/5)')) === 0]),
  'ex-3am-amaliyat-natiqa-l2-004:q2': PICK([SGN(E('5/4+(-1/9)')) === -1, SGN(E('5/4+(-1/9)')) === 0, SGN(E('5/4+(-1/9)')) === 1]),
  'ex-3am-amaliyat-natiqa-l2-004:q3': PICK([SGN(E('(-3/8)*(-7/5)*(-1/2)')) === 0, SGN(E('(-3/8)*(-7/5)*(-1/2)')) === 1, SGN(E('(-3/8)*(-7/5)*(-1/2)')) === -1]),
  'ex-3am-amaliyat-natiqa-l2-004:q4': PICK([SGN(E('(-7/9):(-14/3)')) === 1, SGN(E('(-7/9):(-14/3)')) === -1, SGN(E('(-7/9):(-14/3)')) === 0]),
  // ex-3am-amaliyat-natiqa-l2-005
  'ex-3am-amaliyat-natiqa-l2-005:q1': A(E('-5/6+7/15', {})),
  'ex-3am-amaliyat-natiqa-l2-005:q3': A(E('4/9-11/12', {})),
  // ex-3am-amaliyat-natiqa-l2-006
  'ex-3am-amaliyat-natiqa-l2-006:q1': PICK([ISINT(E('(3/4-1/4):(1/6)')), !ISINT(E('(3/4-1/4):(1/6)'))]),
  'ex-3am-amaliyat-natiqa-l2-006:q2': PICK([!ISNAT(E('(-5/6+1/3)*(-4)')), ISNAT(E('(-5/6+1/3)*(-4)'))]),
  'ex-3am-amaliyat-natiqa-l2-006:q3': PICK([ISINT(E('(7/10-1/5):(-3/4)')), !ISINT(E('(7/10-1/5):(-3/4)'))]),
  'ex-3am-amaliyat-natiqa-l2-006:q4': PICK([!ISINT(E('(-8/9)*(-3/4)-1/2')), ISINT(E('(-8/9)*(-3/4)-1/2'))]),
  // ex-3am-amaliyat-natiqa-l2-007
  'ex-3am-amaliyat-natiqa-l2-007:q1': A(RECIP(E('-13/6'))),
  'ex-3am-amaliyat-natiqa-l2-007:q2': A(RECIP(E('-7'))),
  'ex-3am-amaliyat-natiqa-l2-007:q3': A(E('8/15:(-12/5)', {})),
  'ex-3am-amaliyat-natiqa-l2-007:q4': A(E('-5/6:(-10/9)', {})),
  // ex-3am-amaliyat-natiqa-l2-008
  'ex-3am-amaliyat-natiqa-l2-008:q1': A(E('-1.4/6+2.5/9', {})),
  'ex-3am-amaliyat-natiqa-l2-008:q2': A(E('3.6/8-2.4/10', {})),
  'ex-3am-amaliyat-natiqa-l2-008:q3': A(E('{-4.2/7}:(-9/4)', {})),
  // ex-3am-amaliyat-natiqa-l2-009
  'ex-3am-amaliyat-natiqa-l2-009:q1': PICK([EQ(E('0'), E('5/6-5/6*3/7', {})), EQ(E('10/21'), E('5/6-5/6*3/7', {})), EQ(E('-10/21'), E('5/6-5/6*3/7', {}))]),
  'ex-3am-amaliyat-natiqa-l2-009:q2': A(E('4/5-4/5*(-5/8)', {})),
  'ex-3am-amaliyat-natiqa-l2-009:q3': A(E('2/3-1/2*4/9', {})),
  // ex-3am-amaliyat-natiqa-l2-010
  'ex-3am-amaliyat-natiqa-l2-010:q1': PICK([EQ(E('3/4-2/5*5/8'), E('(6/5-1)*(5/2)')), !EQ(E('3/4-2/5*5/8'), E('(6/5-1)*(5/2)'))]),
  'ex-3am-amaliyat-natiqa-l2-010:q2': PICK([!EQ(E('1/5:(3/4-5/6)'), E('(3/5-4):(2/3)')), EQ(E('1/5:(3/4-5/6)'), E('(3/5-4):(2/3)'))]),
  'ex-3am-amaliyat-natiqa-l2-010:q3': A(E('(6/5-1)*(5/2)', {})),
  // ex-3am-amaliyat-natiqa-l3-001
  'ex-3am-amaliyat-natiqa-l3-001:q1': A(E('3/4-5/6:10/9', {})),
  'ex-3am-amaliyat-natiqa-l3-001:q2': A(E('(2/3-5/2):(-7/6)', {})),
  'ex-3am-amaliyat-natiqa-l3-001:q3': A(E('-5/4+3/2*(-2/9)', {})),
  'ex-3am-amaliyat-natiqa-l3-001:q4': A(E('(7/9-1/3)*(-3/2)+1/6', {})),
  // ex-3am-amaliyat-natiqa-l3-002
  'ex-3am-amaliyat-natiqa-l3-002:q1': A(E('1/2+1/3:(-4/9)', {})),
  'ex-3am-amaliyat-natiqa-l3-002:q2': A(E('(5/6-1/4):(7/9)', {})),
  // ex-3am-amaliyat-natiqa-l3-003
  'ex-3am-amaliyat-natiqa-l3-003:q1': A(E('(1/2-5/4):3/16', {})),
  'ex-3am-amaliyat-natiqa-l3-003:q2': A(E('3/5-2/3*(-9/10)', {})),
  'ex-3am-amaliyat-natiqa-l3-003:q3': A(E('(-7/4+1/2)*4/5', {})),
  'ex-3am-amaliyat-natiqa-l3-003:q4': PICK([REL(E('(-7/4+1/2)*4/5'), E('3/5-2/3*(-9/10)')) === '<', REL(E('(-7/4+1/2)*4/5'), E('3/5-2/3*(-9/10)')) === '=', REL(E('(-7/4+1/2)*4/5'), E('3/5-2/3*(-9/10)')) === '>']),
  // ex-3am-amaliyat-natiqa-l3-004
  'ex-3am-amaliyat-natiqa-l3-004:q1': A(E('-7/10+3/5:(-6/5)', {})),
  'ex-3am-amaliyat-natiqa-l3-004:q2': A(E('(-4/3+5/6)*(-9/5)', {})),
  'ex-3am-amaliyat-natiqa-l3-004:q3': A(E('2-(3/4-5/6)*6', {})),
  'ex-3am-amaliyat-natiqa-l3-004:q4': A(E('(-5/8)*(-12/25)-1/10', {})),
  // ex-3am-amaliyat-natiqa-l3-005
  'ex-3am-amaliyat-natiqa-l3-005:q1': A(E('-8/15+7/10', {})),
  'ex-3am-amaliyat-natiqa-l3-005:q2': A(E('(-4/9)*(5/12)', {})),
  'ex-3am-amaliyat-natiqa-l3-005:q3': A(E('-5/6:(-25/9)', {})),
  // ex-3am-amaliyat-natiqa-l3-006
  'ex-3am-amaliyat-natiqa-l3-006:q1': A(E('[3/4-1/6|5/8+1/3]', {})),
  'ex-3am-amaliyat-natiqa-l3-006:q2': A(E('2+[3|1/2+5/4]', {})),
  'ex-3am-amaliyat-natiqa-l3-006:q3': A(E('[-5/6+1/3|-3/4:9/2]', {})),
  // ex-3am-amaliyat-natiqa-l3-007
  'ex-3am-amaliyat-natiqa-l3-007:q1': A(E('(-3/4+5/6)*(7/10-1/2):(-1/9)', {})),
  'ex-3am-amaliyat-natiqa-l3-007:q2': A(E('-2/5-(1/3-3/4)*(-6)', {})),
  'ex-3am-amaliyat-natiqa-l3-007:q3': A(E('[1/2-1/3|1/6]:(-1/3)', {})),
  // ex-3am-amaliyat-natiqa-l3-008
  'ex-3am-amaliyat-natiqa-l3-008:q1': A(E('2.5/4-1.5/6*(-5/3)', {})),
  'ex-3am-amaliyat-natiqa-l3-008:q2': A(E('(-3.6/8+7/10):(-0.6/3)', {})),
  // ex-3am-amaliyat-natiqa-l3-009
  'ex-3am-amaliyat-natiqa-l3-009:q1': A(E('(1-1/2)*(1-1/3)*(1-1/4)*(1-1/5)*(1-1/6)*(1-1/7)', {})),
  'ex-3am-amaliyat-natiqa-l3-009:q2': A(E('(1-1/4)*(1-1/5)*(1-1/6)*(1-1/7)*(1-1/8)*(1-1/9)', {})),
  // ex-3am-amaliyat-natiqa-l3-010
  'ex-3am-amaliyat-natiqa-l3-010:q1': A(E('2+[1|5+1/12]', {})),
  'ex-3am-amaliyat-natiqa-l3-010:q2': A(E('3+[1|7+[1|2]]', {})),
  'ex-3am-amaliyat-natiqa-l3-010:q3': A(E('1+[1|2+[1|3]]', {})),
  // ex-3am-amaliyat-natiqa-l4-001
  'ex-3am-amaliyat-natiqa-l4-001:q1': A(E('(-1/2)^3+3/4:(-3/2)', {})),
  'ex-3am-amaliyat-natiqa-l4-001:q2': A(E('(-3)^2*(-2/9)-1/3', {})),
  'ex-3am-amaliyat-natiqa-l4-001:q3': A(E('5/6:(-10/9)+2/3*(-3/4)', {})),
  // ex-3am-amaliyat-natiqa-l4-002
  'ex-3am-amaliyat-natiqa-l4-002:q1': A(E('(-2)^3:(-1/4)', {})),
  'ex-3am-amaliyat-natiqa-l4-002:q2': A(E('(-2/3)^2:(4/9)-1/2', {})),
  'ex-3am-amaliyat-natiqa-l4-002:q3': A(E('(-3/5)*(-10/9)*(-7/4)', {})),
  // ex-3am-amaliyat-natiqa-l4-003
  'ex-3am-amaliyat-natiqa-l4-003:q2': A(E('(5/6-3/4)*(-36)', {})),
  'ex-3am-amaliyat-natiqa-l4-003:q3': PICK([!ISNAT(E('(5/6-3/4)*(-36)')), ISNAT(E('(5/6-3/4)*(-36)'))]),
  // ex-3am-amaliyat-natiqa-l4-004
  'ex-3am-amaliyat-natiqa-l4-004:q1': PICK([SGN(E('(-2/3)*(-9/4)*(-1/6)*(5/7)')) === 1, SGN(E('(-2/3)*(-9/4)*(-1/6)*(5/7)')) === -1, SGN(E('(-2/3)*(-9/4)*(-1/6)*(5/7)')) === 0]),
  'ex-3am-amaliyat-natiqa-l4-004:q2': A(E('(-2/3)*(-9/4)*(-1/6)*(5/7)', {})),
  // ex-3am-amaliyat-natiqa-l4-005
  'ex-3am-amaliyat-natiqa-l4-005:q1': A(E('(-1/2)^2+(-1/3)^2', {})),
  'ex-3am-amaliyat-natiqa-l4-005:q2': A(E('(-3/4)^2:(3/8)', {})),
  'ex-3am-amaliyat-natiqa-l4-005:q3': A(E('-4/7:(-8/21)+5/6', {})),
  // ex-3am-amaliyat-natiqa-l4-006
  'ex-3am-amaliyat-natiqa-l4-006:q1': A(E('(-5/2)^2*(-4/15)', {})),
  'ex-3am-amaliyat-natiqa-l4-006:q2': A(E('(-2)^3*(3/16)+1/4', {})),
  'ex-3am-amaliyat-natiqa-l4-006:q3': PICK([SGN(E('(-5/2)^2*(-4/15)')) === -1, SGN(E('(-5/2)^2*(-4/15)')) === 0, SGN(E('(-5/2)^2*(-4/15)')) === 1]),
  'ex-3am-amaliyat-natiqa-l4-006:q4': A(E('(-9/10)*(5/6)*(-4/3)', {})),
  // ex-3am-amaliyat-natiqa-l4-007
  'ex-3am-amaliyat-natiqa-l4-007:q1': A(E('x^2-y*x', {x:'-1/2',y:'2/3'})),
  'ex-3am-amaliyat-natiqa-l4-007:q2': A(E('x*y-x:y', {x:'-1/2',y:'2/3'})),
  // ex-3am-amaliyat-natiqa-l4-008
  'ex-3am-amaliyat-natiqa-l4-008:q1': A(E('[5+x|8]', {x:'1/2'})),
  'ex-3am-amaliyat-natiqa-l4-008:q2': A(E('[5|x+3]', {x:'1/2'})),
  'ex-3am-amaliyat-natiqa-l4-008:q3': PICK([REL(E('[5+1/2|8]'), E('[5|1/2+3]')) === '<', REL(E('[5+1/2|8]'), E('[5|1/2+3]')) === '=', REL(E('[5+1/2|8]'), E('[5|1/2+3]')) === '>']),
  'ex-3am-amaliyat-natiqa-l4-008:q4': PICK([REL(E('[5-2|8]'), E('[5|-2+3]')) === '>', REL(E('[5-2|8]'), E('[5|-2+3]')) === '<', REL(E('[5-2|8]'), E('[5|-2+3]')) === '=']),
  // ex-3am-amaliyat-natiqa-l4-009
  'ex-3am-amaliyat-natiqa-l4-009:q1': A(E('(-2/7)*(-5/8)*(-4/3)*(-9/10)*(-7/3)', {})),
  'ex-3am-amaliyat-natiqa-l4-009:q2': A(E('(3/4-1/2)*(-8/3)*(-9/5)', {})),
  // ex-3am-amaliyat-natiqa-l4-010
  'ex-3am-amaliyat-natiqa-l4-010:q2': A(E('(-5/6+1/3)*(-8/3)', {})),
  'ex-3am-amaliyat-natiqa-l4-010:q3': PICK([ISINT(E('(-5/6+1/3)*(-8/3)')), !ISINT(E('(-5/6+1/3)*(-8/3)'))]),
  // ex-3am-amaliyat-natiqa-l5-001
  'ex-3am-amaliyat-natiqa-l5-001:q1': A(E('13/4*7/5', {})),
  'ex-3am-amaliyat-natiqa-l5-001:q2': A(E('2*(13/4+7/5)', {})),
  'ex-3am-amaliyat-natiqa-l5-001:q3': A(ROUNDU(E('13/4*7/5', {}))),
  // ex-3am-amaliyat-natiqa-l5-002
  'ex-3am-amaliyat-natiqa-l5-002:q1': A(E('(7/6-3/4):(5/12)', {})),
  'ex-3am-amaliyat-natiqa-l5-002:q3': A(E('(7/6-3/4):(5/12)+(-5/4+3/8)*(-16/7)', {})),
  // ex-3am-amaliyat-natiqa-l5-003
  'ex-3am-amaliyat-natiqa-l5-003:q1': A(E('2/3*(-3/4)+5/6', {})),
  'ex-3am-amaliyat-natiqa-l5-003:q2': A(E('(-9/8)*(-3/4)+5/6', {})),
  'ex-3am-amaliyat-natiqa-l5-003:q3': A(E('(-5/6):(-3/4)')),
  // ex-3am-amaliyat-natiqa-l5-004
  'ex-3am-amaliyat-natiqa-l5-004:q1': A(E('x*y-z', {x:'3/2',y:'-4/5',z:'1/10'})),
  'ex-3am-amaliyat-natiqa-l5-004:q2': A(E('(x+y):z', {x:'3/2',y:'-4/5',z:'1/10'})),
  'ex-3am-amaliyat-natiqa-l5-004:q3': A(E('x-y*z', {x:'3/2',y:'-4/5',z:'1/10'})),
  // ex-3am-amaliyat-natiqa-l5-005
  'ex-3am-amaliyat-natiqa-l5-005:q1': A(E('5/6+1/4', {})),
  'ex-3am-amaliyat-natiqa-l5-005:q2': A(E('7/8-1/3', {})),
  'ex-3am-amaliyat-natiqa-l5-005:q3': A(E('(5/6+1/4)*(7/8-1/3)', {})),
  // ex-3am-amaliyat-natiqa-l5-006
  'ex-3am-amaliyat-natiqa-l5-006:q1': A(E('3/10*(-5/3)-1/2', {})),
  'ex-3am-amaliyat-natiqa-l5-006:q2': A(E('3/10:(-4/5)+3/4', {})),
  'ex-3am-amaliyat-natiqa-l5-006:q3': A(E('1/2:(-5/3)')),
  // ex-3am-amaliyat-natiqa-l5-007
  'ex-3am-amaliyat-natiqa-l5-007:q1': A(E('1-3/8-1/5', {})),
  'ex-3am-amaliyat-natiqa-l5-007:q2': A(E('2/3*(1-3/8-1/5)', {})),
  'ex-3am-amaliyat-natiqa-l5-007:q3': A(E('(1-3/8-1/5):3', {})),
  // ex-3am-amaliyat-natiqa-l5-008
  'ex-3am-amaliyat-natiqa-l5-008:q1': A(E('-3/2-5/4+1/2', {})),
  'ex-3am-amaliyat-natiqa-l5-008:q2': A(E('(-3/2-5/4+1/2):3', {})),
  'ex-3am-amaliyat-natiqa-l5-008:q3': A(E('-1/2+(-3/2-5/4+1/2)', {})),
  // ex-3am-amaliyat-natiqa-l5-009
  'ex-3am-amaliyat-natiqa-l5-009:q1': A(E('5*3/5-7/12', {})),
  'ex-3am-amaliyat-natiqa-l5-009:q2': A(E('7/8*3/5-7/12', {})),
  'ex-3am-amaliyat-natiqa-l5-009:q3': A(E('7/12:(3/5)')),
  // ex-3am-amaliyat-natiqa-l5-010
  'ex-3am-amaliyat-natiqa-l5-010:q1': A(E('x*y', {x:'-2/3',y:'-3/4'})),
  'ex-3am-amaliyat-natiqa-l5-010:q2': A(E('x:y', {x:'-2/3',y:'-3/4'})),
  'ex-3am-amaliyat-natiqa-l5-010:q3': A(E('(x+y):(x*y)', {x:'-2/3',y:'-3/4'})),
  'ex-3am-amaliyat-natiqa-l5-010:q4': PICK([ISINT(E('((-2/3)+(-3/4)):((-2/3)*(-3/4))')), !ISINT(E('((-2/3)+(-3/4)):((-2/3)*(-3/4))'))]),
};
