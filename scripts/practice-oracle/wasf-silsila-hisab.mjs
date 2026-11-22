// Oracle du banc « wasf-silsila-hisab » (وصف سلسلة حسابات, 2AM unité 1, leçon 3, 2026-10-29) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec un évaluateur écrit dans ce fichier : rationnels EXACTS en
// BigInt et un parseur de chaînes ( ) qui GARDE la position de chaque nœud (racine = dernière opération, blocs, ordre des
// opérations). Les chaînes sont retapées en littéraux ASCII (« * » = ×, « / » = ÷, « - » = −) dans SPEC ; audit() RELIT ensuite le
// LaTeX des feuilles (\dfrac, \times, \div, {,}) avec son propre lecteur et exige qu'il donne la même chaîne :
//  - RACINE : la dernière opération de l'arbre ; son nom (مجموع / فرق / جداء / حاصل قسمة), ses deux blocs (الحدّ الأول…, المقسوم / القاسم) ;
//  - lectures fautives nommées, chacune RECONSTRUITE ici : FIRSTOP (nommer par la première opération FAITE : la première × ÷ de
//    gauche à droite, dans la première paire de parenthèses fermée), FIRSTWRITTEN (nommer par le premier opérateur ÉCRIT), PIECES
//    (« les termes de 3 + 6 × 8 sont 3 et 6 » : le premier nombre du bloc, ou « العددين a و b والعدد c »), ORDERDIFF (l'ordre d'un
//    quotient ou d'une différence permuté), NOBRACKET (la chaîne écrite sans ses parenthèses) ;
//  - LA PHRASE : le décrit de chaque chaîne est écrit ICI (même règle : masculin « العدد / العددين », « و » entre les blocs, « على »
//    pour un quotient, premier bloc d'abord, virgule quand le premier bloc contient une chaîne) PUIS comparé trois fois : à celui de
//    chainOps.js (`describe`, importé PAR CHEMIN), à la feuille, et à une petite table écrite À LA MAIN (HAND) ;
//  - chaque QCM est jugé option par option (UNE seule option juste, celle qui est marquée) ; une option sans balise ne doit
//    reproduire AUCUNE lecture nommée ; un distracteur balisé reproduit exactement la lecture que nomme sa misconception ;
//  - toute chaîne écrite (clé, option, programme) a tous ses intermédiaires ≥ 0 et aucune division par 0 ;
//  - audit(bank) relit aussi le texte : aucune mention du manuel, argent entre isolats LTR, provenance (50 feuilles, 5 × 10,
//    2 sujets lus : 2am-s1-83 ex 1 et 2am-s1-87 ex 2, relus sur l'image du PDF).
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe as chainDescribe } from '@smarter-academy/core/arithmetic/chainOps.js';
import { R, C } from './helpers.mjs';

/* ── rationnels exacts ───────────────────────────────────────────────── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
class Q {
  constructor(n, d = 1n) { if (d === 0n) throw new Error('division par zéro'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; this.n = n / g; this.d = d / g; }
  add(o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Q(this.n * o.n, this.d * o.d); }
  div(o) { return new Q(this.n * o.d, this.d * o.n); }
  eq(o) { return this.n === o.n && this.d === o.d; }
  neg() { return this.n < 0n; }
  lt(o) { return this.n * o.d < o.n * this.d; }
}
const dq = (s) => { const m = /^(\d+)(?:\.(\d+))?$/.exec(String(s).trim()); if (!m) throw new Error(`nombre illisible : ${s}`); const f = m[2] ?? ''; return new Q(BigInt(m[1] + f), 10n ** BigInt(f.length)); };
const D = (x) => {
  for (let k = 0n; k <= 9n; k++) {
    const p = 10n ** k;
    if (p % x.d === 0n) {
      const N = x.n * (p / x.d); const s = (N < 0n ? -N : N).toString().padStart(Number(k) + 1, '0');
      const int = s.slice(0, s.length - Number(k)); const frac = s.slice(s.length - Number(k)).replace(/0+$/, '');
      return `${N < 0n ? '-' : ''}${int}${frac ? `.${frac}` : ''}`;
    }
  }
  throw new Error(`${x.n}/${x.d} n'est pas un décimal`);
};
const isDec = (x) => { try { D(x); return true; } catch { return false; } };

/* ── parseur ASCII : nombres, lettres (env), + - * /, ( ) ; chaque nœud garde ses jetons [lo, hi] ── */
const NAMES = { '+': 'مجموع', '-': 'فرق', '*': 'جداء', '/': 'حاصل قسمة' };           // table écrite à la main
const SYMS = { '$+$': '+', '$-$': '-', '$\\times$': '*', '$\\div$': '/' };
const subEnv = (s, env) => { let x = s; for (const [k, v] of Object.entries(env ?? {})) x = x.replace(new RegExp(`\\b${k}\\b`, 'g'), String(v)); return x; };
const tok = (s) => { const t = s.match(/\d+(?:\.\d+)?|[()+\-*/]/g) ?? []; if (t.join('') !== s.replace(/\s+/g, '')) throw new Error(`caractères illisibles dans « ${s} »`); return t; };
function parseT(s) {
  const t = tok(s); let i = 0;
  const factor = () => {
    const v = t[i];
    if (v === '(') { i++; const e = expr(); if (t[i] !== ')') throw new Error(`« ) » attendu dans « ${s} »`); i++; return { ...e, wraps: (e.wraps ?? 0) + 1 }; }
    if (v === undefined || !/^\d/.test(v)) throw new Error(`facteur attendu dans « ${s} »`);
    const lo = i; i++; return { t: 'num', s: v, v: dq(v), lo, hi: lo, wraps: 0 };
  };
  const join = (o, l, r, k) => ({ t: 'op', o, l, r, tok: k, lo: l.lo - (l.wraps ?? 0), hi: r.hi + (r.wraps ?? 0), wraps: 0 });
  const term = () => { let l = factor(); while (t[i] === '*' || t[i] === '/') { const k = i; const o = t[i++]; l = join(o, l, factor(), k); } return l; };
  const expr = () => { let l = term(); while (t[i] === '+' || t[i] === '-') { const k = i; const o = t[i++]; l = join(o, l, term(), k); } return l; };
  const root = expr(); if (i !== t.length) throw new Error(`reste dans « ${s} »`);
  return { tokens: t, root };
}
const apply = (o, a, b) => (o === '+' ? a.add(b) : o === '-' ? a.sub(b) : o === '*' ? a.mul(b) : a.div(b));
/** Valeur d'un nœud ; `strict` refuse un intermédiaire négatif (la leçon n'a pas les relatifs). */
function ev(n, strict = true) {
  if (n.t === 'num') return n.v;
  const r = apply(n.o, ev(n.l, strict), ev(n.r, strict));
  if (strict && r.neg()) throw new Error('intermédiaire négatif');
  return r;
}
export const E = (s, env) => ev(parseT(subEnv(s, env)).root, true);
const En = (s) => ev(parseT(s).root, false);
const norm = (s) => parseT(s).tokens.join(' ');
const strip = (s) => tok(s).filter((x) => x !== '(' && x !== ')').join(' ');
const hasBr = (s) => /[()]/.test(s);
const structOf = (n) => (n.t === 'num' ? D(n.v) : `(${structOf(n.l)}${n.o}${structOf(n.r)})`);
const struct = (s) => structOf(parseT(s).root);
const numsOf = (s) => (s.match(/\d+(?:\.\d+)?/g) ?? []).map((x) => D(dq(x)));
const NUMS = (s) => [...String(s).replace(/\{,\}/g, '.').replace(/(\d),(\d)/g, '$1.$2').matchAll(/\d+(?:\.\d+)?/g)].map((m) => D(dq(m[0])));

/** Le texte d'un bloc (jetons lo … hi) : parenthèses non appariées retirées, puis la paire qui entoure tout le bloc. */
function pieceText(tokens, lo, hi) {
  let part = tokens.slice(lo, hi + 1); const stack = []; const drop = new Set();
  part.forEach((x, i) => { if (x === '(') stack.push(i); else if (x === ')') { if (stack.length) stack.pop(); else drop.add(i); } });
  stack.forEach((i) => drop.add(i)); part = part.filter((_, i) => !drop.has(i));
  for (;;) {
    if (part[0] !== '(' || part.at(-1) !== ')') break;
    let d = 0; let whole = true;
    for (let i = 0; i < part.length - 1; i++) { if (part[i] === '(') d++; else if (part[i] === ')') d--; if (d === 0) { whole = false; break; } }
    if (!whole) break; part = part.slice(1, -1);
  }
  return part.join(' ');
}
/** La phrase d'un nœud, écrite d'après la règle de la leçon. */
function say(n) {
  const text = (x) => x.s.replace('.', ',');
  if (n.t === 'num') return `العدد ${text(n)}`;
  const side = (x) => (x.t === 'num' ? text(x) : say(x));
  const name = NAMES[n.o]; const kid = (x) => x.t === 'op' && (x.l.t === 'op' || x.r.t === 'op');
  if (n.o === '/') return `${name} ${side(n.l)} على ${side(n.r)}`;
  if (n.l.t === 'num' && n.r.t === 'num') return `${name} العددين ${text(n.l)} و ${text(n.r)}`;
  if (n.l.t === 'num') return `${name} العدد ${text(n.l)} و${say(n.r)}`;
  if (n.r.t === 'num') return `${name} ${say(n.l)}${kid(n.l) ? ' ،' : ''} والعدد ${text(n.r)}`;
  return `${name} ${say(n.l)}${kid(n.l) ? ' ،' : ''} و${say(n.r)}`;
}
const mk = (o, l, r) => ({ t: 'op', o, l, r });
const describeOwn = (s) => say(parseT(s).root);
const rootOf = (s) => parseT(s).root;
const opIdx = (tokens) => tokens.map((x, i) => (/^[+\-*/]$/.test(x) ? i : -1)).filter((i) => i >= 0);
function firstPerformed(tokens) {
  let lo = 0; let hi = tokens.length - 1; const fc = tokens.indexOf(')');
  if (fc >= 0) { hi = fc - 1; lo = tokens.slice(0, fc).lastIndexOf('(') + 1; }
  const ops = opIdx(tokens).filter((i) => i >= lo && i <= hi); const high = ops.filter((i) => tokens[i] === '*' || tokens[i] === '/');
  return (high.length ? high : ops)[0];
}
function cutAt(s, k) { // le mot coupé à l'opérateur du jeton k : la phrase de la chaîne qu'on obtiendrait
  const { tokens } = parseT(s);
  const left = parseT(pieceText(tokens, 0, k - 1)).root; const right = parseT(pieceText(tokens, k + 1, tokens.length - 1)).root;
  return { o: tokens[k], sentence: say(mk(tokens[k], left, right)) };
}
const readFirstOp = (s) => cutAt(s, firstPerformed(parseT(s).tokens));
const readFirstWritten = (s) => cutAt(s, opIdx(parseT(s).tokens)[0]);
const piecesRead = (s) => { const n = (s.match(/\d+(?:\.\d+)?/g) ?? []).map((x) => x.replace('.', ',')); if (n.length !== 3) return null; return `${NAMES[rootOf(s).o]} العددين ${n[0]} و ${n[1]} والعدد ${n[2]}`; };
/** Toutes les chaînes obtenues en permutant les deux blocs d'une différence ou d'un quotient (une seule permutation). */
function swapStructs(s) {
  const out = [];
  const walk = (n, rebuild) => {
    if (n.t === 'num') return;
    if (n.o === '-' || n.o === '/') out.push(structOf(rebuild(mk(n.o, n.r, n.l))));
    walk(n.l, (x) => rebuild(mk(n.o, x, n.r))); walk(n.r, (x) => rebuild(mk(n.o, n.l, x)));
  };
  walk(rootOf(s), (x) => x); return out;
}
const rootSwapStruct = (s) => { const n = rootOf(s); return (n.o === '-' || n.o === '/') ? structOf(mk(n.o, n.r, n.l)) : null; };
const blocksOf = (s) => { const { tokens, root } = parseT(s); return [pieceText(tokens, root.l.lo, root.l.hi), pieceText(tokens, root.r.lo, root.r.hi)]; };
const ROLE = { '+': ['الحدّ الأول', 'الحدّ الثاني'], '-': ['الحدّ الأول', 'الحدّ الثاني'], '*': ['العامل الأول', 'العامل الثاني'], '/': ['المقسوم', 'القاسم'] };
/** « 5 * 7 » ↔ « 5*7 » : comparaison de blocs sans espaces. */
const sp = (s) => String(s).replace(/\s+/g, '');

/* ── la table des phrases, écrite à la main (aucun appel à describe pour la fabriquer) ── */
export const HAND = [
  ['7 + 4 * 5', 'مجموع العدد 7 وجداء العددين 4 و 5'],
  ['(7 + 4) * 5', 'جداء مجموع العددين 7 و 4 والعدد 5'],
  ['45 - (10 + 5)', 'فرق العدد 45 ومجموع العددين 10 و 5'],
  ['(20 - 8) / (1 + 2)', 'حاصل قسمة فرق العددين 20 و 8 على مجموع العددين 1 و 2'],
  ['6 * (9 - 2) + 5', 'مجموع جداء العدد 6 وفرق العددين 9 و 2 ، والعدد 5'],
  ['4 * (1.5 + 2.5)', 'جداء العدد 4 ومجموع العددين 1,5 و 2,5'],
  ['(6 + 12 * 4) / (4 * 5 - 8)', 'حاصل قسمة مجموع العدد 6 وجداء العددين 12 و 4 على فرق جداء العددين 4 و 5 والعدد 8'],
  ['24 / 4 * 3', 'جداء حاصل قسمة 24 على 4 والعدد 3'],
  ['20 + 5 - 3', 'فرق مجموع العددين 20 و 5 والعدد 3'],
  ['60 / 5', 'حاصل قسمة 60 على 5'],
  ['9 + 2 * 7', 'مجموع العدد 9 وجداء العددين 2 و 7'],
];
const glyph = (s) => s.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
export const handProblems = () => HAND.flatMap(([c, t]) => [describeOwn(c) === t ? null : `HAND « ${c} » : l'oracle écrit « ${describeOwn(c)} »`, chainDescribe(glyph(c)) === t ? null : `HAND « ${c} » : chainOps.describe écrit « ${chainDescribe(glyph(c))} »`].filter(Boolean));

/* ── programme de calcul : « اختر عددًا، أضف … اضرب الناتج … » → la chaîne (les × ÷ mettent ce qui précède entre parenthèses) ── */
function progChain(start, steps) {
  let e = String(start);
  steps.forEach(([o, n], i) => { const top = i > 0 && /[+-]/.test(e.replace(/\([^()]*\)/g, '')); e = ((o === '*' || o === '/') && top) ? `(${e}) ${o} ${n}` : `${e} ${o} ${n}`; });
  return e;
}

/* ── lecture du LaTeX de la feuille ──────────────────────────────────── */
const islands = (s) => [...String(s ?? '').matchAll(/\$([^$]+)\$/g)].map((x) => x[1]);
function braceArg(s, i) { let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (d === 0) return [s.slice(i + 1, j), j + 1]; } } throw new Error(`accolade non fermée dans « ${s} »`); }
/** « \dfrac{N}{D} » → « (N) / (D) » ; \times → * ; \div → / ; {,} → . ; \mathrm{…} retiré. */
function lx2a(l) {
  let s = l.replace(/\{,\}/g, '.');
  for (;;) {
    const k = s.indexOf('\\dfrac'); if (k < 0) break;
    const [n, e1] = braceArg(s, k + 6); const [d, e2] = braceArg(s, e1);
    s = `${s.slice(0, k)}(${lx2a(n)}) / (${lx2a(d)})${s.slice(e2)}`;
  }
  s = s.replace(/\\mathrm\{[^}]*\}/g, '').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\\[,; ]|\\ /g, ' ');
  return s.replace(/\s+/g, ' ').trim();
}
/** Les chaînes d'un texte : chaque îlot $…$, après un éventuel « A = » ; null si illisible. */
function chainsIn(text, env) {
  const out = [];
  for (const i of islands(text)) {
    let a = lx2a(i); const m = /^[A-Za-z]\s*=\s*(.*)$/.exec(a); if (m) a = m[1];
    if (/=/.test(a)) continue;
    try { if (env) { out.push({ raw: a, ok: true }); } else { parseT(a); out.push({ raw: a, ok: true }); } } catch { /* pas une chaîne */ }
  }
  return out.map((x) => x.raw);
}
const letterOf = (flags, what) => { const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0); if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`); return 'ABCD'[hits[0]]; };
const MISC = { FIRSTOP: 'MISC-WASF-FIRSTOP', FIRSTWRITTEN: 'MISC-WASF-FIRSTWRITTEN', PIECES: 'MISC-WASF-PIECES', ORDERDIFF: 'MISC-WASF-ORDERDIFF', NOBRACKET: 'MISC-WASF-NOBRACKET' };

/* ── jugement d'une question (clé + options) ─────────────────────────── */
function cmpTruth(S) { const [, c, op, num] = S.claim; const v = E(c); const n = dq(num); return op === '>=' ? !v.lt(n) : op === '>' ? n.lt(v) : v.lt(n); }
function ynTruth(S) {
  const c = S.claim;
  if (c[0] === 'name') return NAMES[rootOf(c[1]).o] === c[2];
  if (c[0] === 'needed') return struct(strip(c[2])) !== struct(c[2]);
  if (c[0] === 'term') { const [pf, ps] = blocksOf(c[1]); return sp(c[2] === 'first' ? pf : ps) === sp(c[3]); }
  return cmpTruth(S);
}
function judge(S) {
  switch (S.k) {
    case 'val': case 'valw': return { answer: R(D(E(S.c, S.env))) };
    case 'prog': return { answer: R(D(E(progChain(S.start, S.steps)))) };
    case 'name': { const root = NAMES[rootOf(subEnv(S.c, S.env)).o]; const fl = S.opts.map(([x]) => (S.sym ? NAMES[SYMS[x]] : x) === root); return { answer: C(letterOf(fl, `nom de ${S.c}`)), flags: fl }; }
    case 'terms': { const [pf, ps] = blocksOf(S.c); const right = sp(S.role === 'first' ? pf : ps); const fl = S.opts.map(([x]) => sp(x) === right); return { answer: C(letterOf(fl, `bloc de ${S.c}`)), flags: fl }; }
    case 'desc': { const t = describeOwn(S.c); const fl = S.opts.map(([x]) => x === t); return { answer: C(letterOf(fl, `phrase de ${S.c}`)), flags: fl }; }
    case 'write': { const t = struct(S.c); const fl = S.opts.map(([x]) => struct(x) === t); return { answer: C(letterOf(fl, `chaîne de ${S.c}`)), flags: fl }; }
    case 'yn': { const t = ynTruth(S); return { answer: C(t ? 'A' : 'B'), flags: [t, !t] }; }
    case 'descself': case 'writeself': case 'tree': return { answer: null };
    default: throw new Error(`genre inconnu ${S.k}`);
  }
}

/* ── Les spécifications retapées (une par question ; relues et recalculées par judge() et audit()) ───────── */
const SPEC = {
  // ex-2am-wasf-silsila-hisab-l1-001
  "ex-2am-wasf-silsila-hisab-l1-001:q1": {"k":"name","c":"8 + 3 * 7","opts":[["مجموع",null],["جداء","FIRSTOP"],["فرق",null]]},
  "ex-2am-wasf-silsila-hisab-l1-001:q2": {"k":"name","c":"(8 + 3) * 7","opts":[["مجموع","FIRSTWRITTEN"],["جداء",null],["فرق",null]]},
  "ex-2am-wasf-silsila-hisab-l1-001:q3": {"k":"name","c":"50 - 4 * 9","opts":[["جداء","FIRSTOP"],["مجموع",null],["فرق",null]]},
  "ex-2am-wasf-silsila-hisab-l1-001:q4": {"k":"name","c":"(40 - 16) / 6","opts":[["حاصل قسمة",null],["فرق","FIRSTWRITTEN"],["مجموع",null]]},
  // ex-2am-wasf-silsila-hisab-l1-002
  "ex-2am-wasf-silsila-hisab-l1-002:q1": {"k":"name","c":"6 + 24 / 4","opts":[["حاصل قسمة","FIRSTOP"],["مجموع",null],["فرق",null]]},
  "ex-2am-wasf-silsila-hisab-l1-002:q2": {"k":"val","c":"6 + 24 / 4"},
  "ex-2am-wasf-silsila-hisab-l1-002:q3": {"k":"name","c":"(6 + 24) / 4","opts":[["مجموع","FIRSTWRITTEN"],["فرق",null],["حاصل قسمة",null]]},
  "ex-2am-wasf-silsila-hisab-l1-002:q4": {"k":"val","c":"(6 + 24) / 4"},
  // ex-2am-wasf-silsila-hisab-l1-003
  "ex-2am-wasf-silsila-hisab-l1-003:q1": {"k":"terms","c":"4 + 5 * 7","role":"second","opts":[["5 * 7",null],["5","PIECES"],["7",null]]},
  "ex-2am-wasf-silsila-hisab-l1-003:q2": {"k":"terms","c":"63 - 28 / 7","role":"second","opts":[["28","PIECES"],["28 / 7",null],["63","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l1-003:q3": {"k":"terms","c":"(4 + 5) * 7","role":"first","opts":[["4","PIECES"],["7",null],["4 + 5",null]]},
  "ex-2am-wasf-silsila-hisab-l1-003:q4": {"k":"terms","c":"(42 + 6) / 8","role":"first","opts":[["42 + 6",null],["42","PIECES"],["8","ORDERDIFF"]]},
  // ex-2am-wasf-silsila-hisab-l1-004
  "ex-2am-wasf-silsila-hisab-l1-004:q1": {"k":"yn","claim":["name","18 + 5 - 9","مجموع"],"labels":["صحيحة","خاطئة"],"opts":[["صحيحة","FIRSTOP"],["خاطئة",null]]},
  "ex-2am-wasf-silsila-hisab-l1-004:q2": {"k":"yn","claim":["name","(18 + 5) * 2","مجموع"],"labels":["صحيحة","خاطئة"],"opts":[["صحيحة","FIRSTWRITTEN"],["خاطئة",null]]},
  "ex-2am-wasf-silsila-hisab-l1-004:q3": {"k":"yn","claim":["name","18 + 5 * 2","مجموع"],"labels":["صحيحة","خاطئة"],"opts":[["صحيحة",null],["خاطئة","FIRSTOP"]]},
  "ex-2am-wasf-silsila-hisab-l1-004:q4": {"k":"yn","claim":["name","40 - 6 * 5","جداء"],"labels":["صحيحة","خاطئة"],"opts":[["صحيحة","FIRSTOP"],["خاطئة",null]]},
  // ex-2am-wasf-silsila-hisab-l1-005
  "ex-2am-wasf-silsila-hisab-l1-005:q1": {"k":"name","c":"2.5 * 4 + 1.5","opts":[["جداء","FIRSTOP"],["مجموع",null],["فرق",null]]},
  "ex-2am-wasf-silsila-hisab-l1-005:q2": {"k":"name","c":"2.5 * (4 + 1.5)","opts":[["مجموع","FIRSTOP"],["فرق",null],["جداء",null]]},
  "ex-2am-wasf-silsila-hisab-l1-005:q3": {"k":"name","c":"9 - 1.5 * 4","opts":[["فرق",null],["جداء","FIRSTOP"],["مجموع",null]]},
  // ex-2am-wasf-silsila-hisab-l1-006
  "ex-2am-wasf-silsila-hisab-l1-006:q1": {"k":"name","c":"20 + 5 - 3","opts":[["مجموع","FIRSTOP"],["فرق",null],["جداء",null]]},
  "ex-2am-wasf-silsila-hisab-l1-006:q2": {"k":"terms","c":"20 + 5 - 3","role":"first","opts":[["20","PIECES"],["3","ORDERDIFF"],["20 + 5",null]]},
  "ex-2am-wasf-silsila-hisab-l1-006:q3": {"k":"name","c":"30 - 6 + 4","opts":[["مجموع",null],["فرق","FIRSTOP"],["جداء",null]]},
  "ex-2am-wasf-silsila-hisab-l1-006:q4": {"k":"terms","c":"30 - 6 + 4","role":"first","opts":[["30","PIECES"],["30 - 6",null],["4",null]]},
  // ex-2am-wasf-silsila-hisab-l1-007
  "ex-2am-wasf-silsila-hisab-l1-007:q1": {"k":"name","c":"60 / 4 * 3","opts":[["حاصل قسمة","FIRSTOP"],["مجموع",null],["جداء",null]]},
  "ex-2am-wasf-silsila-hisab-l1-007:q2": {"k":"name","c":"60 / (4 + 6)","opts":[["حاصل قسمة",null],["مجموع","FIRSTOP"],["فرق",null]]},
  "ex-2am-wasf-silsila-hisab-l1-007:q3": {"k":"name","c":"60 / 4 + 6","opts":[["حاصل قسمة","FIRSTOP"],["مجموع",null],["فرق",null]]},
  // ex-2am-wasf-silsila-hisab-l1-008
  "ex-2am-wasf-silsila-hisab-l1-008:q1": {"k":"desc","c":"5 * (3 + 6)","opts":[["مجموع جداء العددين 5 و 3 والعدد 6","FIRSTOP"],["جداء العددين 5 و 3 والعدد 6","PIECES"],["جداء العدد 5 ومجموع العددين 3 و 6",null]]},
  "ex-2am-wasf-silsila-hisab-l1-008:q2": {"k":"desc","c":"48 - (9 + 7)","opts":[["فرق العدد 48 ومجموع العددين 9 و 7",null],["مجموع فرق العددين 48 و 9 والعدد 7","FIRSTOP"],["فرق مجموع العددين 9 و 7 والعدد 48","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l1-008:q3": {"k":"desc","c":"4 + 7 * 5","opts":[["جداء مجموع العددين 4 و 7 والعدد 5","FIRSTOP"],["مجموع العدد 4 وجداء العددين 7 و 5",null],["مجموع العددين 4 و 7 والعدد 5","PIECES"]]},
  // ex-2am-wasf-silsila-hisab-l1-009
  "ex-2am-wasf-silsila-hisab-l1-009:q1": {"k":"name","c":"(84 - 24) / 15","opts":[["فرق","FIRSTOP"],["مجموع",null],["حاصل قسمة",null]]},
  "ex-2am-wasf-silsila-hisab-l1-009:q2": {"k":"name","c":"(9.5 + 2.5) * (10 - 4)","opts":[["جداء",null],["مجموع","FIRSTOP"],["فرق",null]]},
  "ex-2am-wasf-silsila-hisab-l1-009:q3": {"k":"name","c":"7 + (18 - 6)","opts":[["فرق","FIRSTOP"],["مجموع",null],["جداء",null]]},
  "ex-2am-wasf-silsila-hisab-l1-009:q4": {"k":"name","c":"36 - 4 * 5","opts":[["جداء","FIRSTOP"],["مجموع",null],["فرق",null]]},
  // ex-2am-wasf-silsila-hisab-l1-010
  "ex-2am-wasf-silsila-hisab-l1-010:q1": {"k":"name","sym":true,"c":"(52 + 8) / 5","opts":[["$\\div$",null],["$+$","FIRSTWRITTEN"],["$-$",null]]},
  "ex-2am-wasf-silsila-hisab-l1-010:q2": {"k":"name","sym":true,"c":"36 - (8 + 6)","opts":[["$+$","FIRSTOP"],["$-$",null],["$\\times$",null]]},
  "ex-2am-wasf-silsila-hisab-l1-010:q3": {"k":"name","sym":true,"c":"9 + 4 * 6","opts":[["$\\times$","FIRSTOP"],["$-$",null],["$+$",null]]},
  "ex-2am-wasf-silsila-hisab-l1-010:q4": {"k":"name","sym":true,"c":"7 * (15 - 6)","opts":[["$\\times$",null],["$-$","FIRSTOP"],["$+$",null]]},
  // ex-2am-wasf-silsila-hisab-l2-001
  "ex-2am-wasf-silsila-hisab-l2-001:q1": {"k":"desc","c":"14 + 6 * 3","opts":[["جداء مجموع العددين 14 و 6 والعدد 3","FIRSTOP"],["مجموع العدد 14 وجداء العددين 6 و 3",null],["مجموع العددين 14 و 6 والعدد 3","PIECES"]]},
  "ex-2am-wasf-silsila-hisab-l2-001:q2": {"k":"desc","c":"(14 + 6) * 3","opts":[["مجموع العدد 14 وجداء العددين 6 و 3","FIRSTWRITTEN"],["جداء العددين 14 و 6 والعدد 3","PIECES"],["جداء مجموع العددين 14 و 6 والعدد 3",null]]},
  "ex-2am-wasf-silsila-hisab-l2-001:q3": {"k":"desc","c":"45 - 12 / 4","opts":[["فرق العدد 45 وحاصل قسمة 12 على 4",null],["حاصل قسمة فرق العددين 45 و 12 على 4","FIRSTOP"],["فرق حاصل قسمة 12 على 4 والعدد 45","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l2-001:q4": {"k":"desc","c":"(45 - 12) / 3","opts":[["فرق العدد 45 وحاصل قسمة 12 على 3","FIRSTWRITTEN"],["حاصل قسمة فرق العددين 45 و 12 على 3",null],["حاصل قسمة 3 على فرق العددين 45 و 12","ORDERDIFF"]]},
  // ex-2am-wasf-silsila-hisab-l2-002
  "ex-2am-wasf-silsila-hisab-l2-002:q1": {"k":"write","c":"70 - 8 * 6","sentence":"فرق العدد 70 وجداء العددين 8 و 6","opts":[["(70 - 8) * 6",null],["70 - 8 * 6",null]]},
  "ex-2am-wasf-silsila-hisab-l2-002:q2": {"k":"valw","c":"70 - 8 * 6","sentence":"فرق العدد 70 وجداء العددين 8 و 6","sigs":[]},
  "ex-2am-wasf-silsila-hisab-l2-002:q3": {"k":"write","c":"9 * (7 + 5)","sentence":"جداء العدد 9 ومجموع العددين 7 و 5","opts":[["9 * (7 + 5)",null],["9 * 7 + 5","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l2-002:q4": {"k":"valw","c":"9 * (7 + 5)","sentence":"جداء العدد 9 ومجموع العددين 7 و 5","sigs":[["68","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  // ex-2am-wasf-silsila-hisab-l2-003
  "ex-2am-wasf-silsila-hisab-l2-003:q1": {"k":"descself","c":"24 + 18 / 6"},
  "ex-2am-wasf-silsila-hisab-l2-003:q2": {"k":"desc","c":"(24 + 18) / 6","opts":[["مجموع العدد 24 وحاصل قسمة 18 على 6","FIRSTWRITTEN"],["حاصل قسمة مجموع العددين 24 و 18 على 6",null],["حاصل قسمة 6 على مجموع العددين 24 و 18","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l2-003:q3": {"k":"descself","c":"60 - (15 + 9)"},
  // ex-2am-wasf-silsila-hisab-l2-004
  "ex-2am-wasf-silsila-hisab-l2-004:q1": {"k":"write","c":"(6 + 12 * 4) / (4 * 5 - 8)","sentence":null,"bar":true,"opts":[["(4 * 5 - 8) / (6 + 12 * 4)","ORDERDIFF"],["6 + 12 * 4 / 4 * 5 - 8","NOBRACKET"],["(6 + 12 * 4) / (4 * 5 - 8)",null]]},
  "ex-2am-wasf-silsila-hisab-l2-004:q2": {"k":"valw","c":"(6 + 12 * 4) / (4 * 5 - 8)","sentence":null,"sigs":[["58","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l2-004:q3": {"k":"yn","claim":["needed","x","(6 + 12 * 4) / (4 * 5 - 8)"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا","NOBRACKET"]]},
  // ex-2am-wasf-silsila-hisab-l2-005
  "ex-2am-wasf-silsila-hisab-l2-005:q1": {"k":"writeself","c":"14 + 36 / 9","sentence":"مجموع العدد 14 وحاصل قسمة 36 على 9"},
  "ex-2am-wasf-silsila-hisab-l2-005:q2": {"k":"yn","claim":["needed","x","14 + 36 / 9"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا",null]]},
  "ex-2am-wasf-silsila-hisab-l2-005:q3": {"k":"write","c":"(14 + 22) / 9","sentence":"حاصل قسمة مجموع العددين 14 و 22 على 9","opts":[["(14 + 22) / 9",null],["14 + 22 / 9","NOBRACKET"],["9 / (14 + 22)","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l2-005:q4": {"k":"valw","c":"(14 + 22) / 9","sentence":"حاصل قسمة مجموع العددين 14 و 22 على 9","sigs":[]},
  // ex-2am-wasf-silsila-hisab-l2-006
  "ex-2am-wasf-silsila-hisab-l2-006:q1": {"k":"descself","c":"9 * (4 + 6) - 20"},
  "ex-2am-wasf-silsila-hisab-l2-006:q2": {"k":"desc","c":"(9 * 4 + 6) / 7","opts":[["جداء العدد 9 ومجموع العدد 4 وحاصل قسمة 6 على 7","FIRSTOP"],["حاصل قسمة مجموع جداء العددين 9 و 4 والعدد 6 على 7",null],["حاصل قسمة 7 على مجموع جداء العددين 9 و 4 والعدد 6","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l2-006:q3": {"k":"yn","claim":["name","9 * (4 + 6) - 20","فرق"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا","FIRSTWRITTEN"]]},
  // ex-2am-wasf-silsila-hisab-l2-007
  "ex-2am-wasf-silsila-hisab-l2-007:q1": {"k":"valw","c":"20 - 3 * 4","sentence":"فرق العدد 20 وجداء العددين 3 و 4","sigs":[]},
  "ex-2am-wasf-silsila-hisab-l2-007:q2": {"k":"valw","c":"(12 + 6) / 6","sentence":"حاصل قسمة مجموع العددين 12 و 6 على 6","sigs":[["13","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l2-007:q3": {"k":"valw","c":"5 * (7 - 6)","sentence":"جداء العدد 5 وفرق العددين 7 و 6","sigs":[["29","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l2-007:q4": {"k":"val","c":"12 + 6 / 6"},
  "ex-2am-wasf-silsila-hisab-l2-007:q5": {"k":"yn","claim":["cmp","12 + 6 / 6","<","10"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا",null]]},
  // ex-2am-wasf-silsila-hisab-l2-008
  "ex-2am-wasf-silsila-hisab-l2-008:q1": {"k":"yn","claim":["term","4 + 7 * 9","second","7"],"labels":["نعم","لا"],"opts":[["نعم","PIECES"],["لا",null]]},
  "ex-2am-wasf-silsila-hisab-l2-008:q2": {"k":"yn","claim":["term","(3 + 6) * 8","first","3 + 6"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا","PIECES"]]},
  "ex-2am-wasf-silsila-hisab-l2-008:q3": {"k":"yn","claim":["term","45 - (10 + 5)","first","10 + 5"],"labels":["نعم","لا"],"opts":[["نعم","ORDERDIFF"],["لا",null]]},
  "ex-2am-wasf-silsila-hisab-l2-008:q4": {"k":"yn","claim":["name","(5 + 4) * 3","جداء"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا","FIRSTWRITTEN"]]},
  // ex-2am-wasf-silsila-hisab-l2-009
  "ex-2am-wasf-silsila-hisab-l2-009:q1": {"k":"valw","c":"8 + 3 * 9","sentence":"مجموع العدد 8 وجداء العددين 3 و 9","sigs":[]},
  "ex-2am-wasf-silsila-hisab-l2-009:q2": {"k":"valw","c":"(52 - 16) / 9","sentence":"حاصل قسمة فرق العددين 52 و 16 على 9","sigs":[]},
  "ex-2am-wasf-silsila-hisab-l2-009:q3": {"k":"valw","c":"7 * (20 - 14)","sentence":"جداء العدد 7 وفرق العددين 20 و 14","sigs":[["126","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l2-009:q4": {"k":"valw","c":"60 - (25 - 10)","sentence":"فرق العدد 60 وفرق العددين 25 و 10","sigs":[["25","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  // ex-2am-wasf-silsila-hisab-l2-010
  "ex-2am-wasf-silsila-hisab-l2-010:q1": {"k":"val","c":"a + b / c","env":{"a":36,"b":12,"c":4}},
  "ex-2am-wasf-silsila-hisab-l2-010:q2": {"k":"val","c":"(a + b) / c","env":{"a":36,"b":12,"c":4}},
  "ex-2am-wasf-silsila-hisab-l2-010:q3": {"k":"val","c":"a / (b + c)","env":{"a":36,"b":12,"c":4}},
  "ex-2am-wasf-silsila-hisab-l2-010:q4": {"k":"name","c":"(a + b) / c","env":{"a":36,"b":12,"c":4},"opts":[["مجموع","FIRSTWRITTEN"],["فرق",null],["حاصل قسمة",null]]},
  "ex-2am-wasf-silsila-hisab-l2-010:q5": {"k":"name","c":"a + b / c","env":{"a":36,"b":12,"c":4},"opts":[["مجموع",null],["حاصل قسمة","FIRSTOP"],["فرق",null]]},
  // ex-2am-wasf-silsila-hisab-l3-001
  "ex-2am-wasf-silsila-hisab-l3-001:q1": {"k":"name","c":"(26 - 14) * 5","opts":[["فرق","FIRSTWRITTEN"],["جداء",null],["مجموع",null]]},
  "ex-2am-wasf-silsila-hisab-l3-001:q2": {"k":"terms","c":"(26 - 14) * 5","role":"first","opts":[["26","PIECES"],["5",null],["26 - 14",null]]},
  "ex-2am-wasf-silsila-hisab-l3-001:q3": {"k":"descself","c":"(26 - 14) * 5"},
  "ex-2am-wasf-silsila-hisab-l3-001:q4": {"k":"write","c":"(38 + 22) / 12","sentence":"حاصل قسمة مجموع العددين 38 و 22 على 12","opts":[["(38 + 22) / 12",null],["38 + 22 / 12","NOBRACKET"],["12 / (38 + 22)","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l3-001:q5": {"k":"valw","c":"(38 + 22) / 12","sentence":"حاصل قسمة مجموع العددين 38 و 22 على 12","sigs":[]},
  // ex-2am-wasf-silsila-hisab-l3-002
  "ex-2am-wasf-silsila-hisab-l3-002:q1": {"k":"name","c":"7 * 4 + 3 * 5","opts":[["جداء","FIRSTOP"],["مجموع",null],["فرق",null]]},
  "ex-2am-wasf-silsila-hisab-l3-002:q2": {"k":"descself","c":"7 * 4 + 3 * 5"},
  "ex-2am-wasf-silsila-hisab-l3-002:q3": {"k":"write","c":"90 - 6 * 7","sentence":"فرق العدد 90 وجداء العددين 6 و 7","opts":[["(90 - 6) * 7",null],["90 - 6 * 7",null]]},
  "ex-2am-wasf-silsila-hisab-l3-002:q4": {"k":"valw","c":"90 - 6 * 7","sentence":"فرق العدد 90 وجداء العددين 6 و 7","sigs":[]},
  "ex-2am-wasf-silsila-hisab-l3-002:q5": {"k":"yn","claim":["name","7 * 4 + 3 * 5","جداء"],"labels":["نعم","لا"],"opts":[["نعم","FIRSTOP"],["لا",null]]},
  // ex-2am-wasf-silsila-hisab-l3-003
  "ex-2am-wasf-silsila-hisab-l3-003:q1": {"k":"name","c":"64 - (18 + 14)","opts":[["فرق",null],["مجموع","FIRSTOP"],["جداء",null]]},
  "ex-2am-wasf-silsila-hisab-l3-003:q2": {"k":"terms","c":"64 - (18 + 14)","role":"second","opts":[["18","PIECES"],["18 + 14",null],["64","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l3-003:q3": {"k":"desc","c":"64 - (18 + 14)","opts":[["مجموع فرق العددين 64 و 18 والعدد 14","FIRSTOP"],["فرق مجموع العددين 18 و 14 والعدد 64","ORDERDIFF"],["فرق العدد 64 ومجموع العددين 18 و 14",null]]},
  "ex-2am-wasf-silsila-hisab-l3-003:q4": {"k":"write","c":"4 * (15 - 9)","sentence":"جداء العدد 4 وفرق العددين 15 و 9","opts":[["4 * 15 - 9","NOBRACKET"],["4 * (15 - 9)",null]]},
  "ex-2am-wasf-silsila-hisab-l3-003:q5": {"k":"valw","c":"4 * (15 - 9)","sentence":"جداء العدد 4 وفرق العددين 15 و 9","sigs":[["51","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  // ex-2am-wasf-silsila-hisab-l3-004
  "ex-2am-wasf-silsila-hisab-l3-004:q1": {"k":"name","c":"(45 + 15) / 4","opts":[["مجموع","FIRSTWRITTEN"],["حاصل قسمة",null],["فرق",null]]},
  "ex-2am-wasf-silsila-hisab-l3-004:q2": {"k":"terms","c":"(45 + 15) / 4","role":"second","opts":[["45 + 15","ORDERDIFF"],["4",null]]},
  "ex-2am-wasf-silsila-hisab-l3-004:q3": {"k":"descself","c":"(45 + 15) / 4"},
  "ex-2am-wasf-silsila-hisab-l3-004:q4": {"k":"write","c":"12 + 45 / 9","sentence":"مجموع العدد 12 وحاصل قسمة 45 على 9","opts":[["12 + 45 / 9",null],["(12 + 45) / 9",null]]},
  "ex-2am-wasf-silsila-hisab-l3-004:q5": {"k":"valw","c":"12 + 45 / 9","sentence":"مجموع العدد 12 وحاصل قسمة 45 على 9","sigs":[]},
  "ex-2am-wasf-silsila-hisab-l3-004:q6": {"k":"yn","claim":["needed","x","12 + 45 / 9"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا",null]]},
  // ex-2am-wasf-silsila-hisab-l3-005
  "ex-2am-wasf-silsila-hisab-l3-005:q1": {"k":"name","c":"8 * (7 - 3) + 6","opts":[["فرق","FIRSTOP"],["مجموع",null],["حاصل قسمة",null]]},
  "ex-2am-wasf-silsila-hisab-l3-005:q2": {"k":"terms","c":"8 * (7 - 3) + 6","role":"first","opts":[["8","PIECES"],["6",null],["8 * ( 7 - 3 )",null]]},
  "ex-2am-wasf-silsila-hisab-l3-005:q3": {"k":"desc","c":"8 * (7 - 3) + 6","opts":[["مجموع جداء العدد 8 وفرق العددين 7 و 3 ، والعدد 6",null],["فرق جداء العددين 8 و 7 ومجموع العددين 3 و 6","FIRSTOP"],["جداء العدد 8 ومجموع فرق العددين 7 و 3 والعدد 6","FIRSTWRITTEN"]]},
  "ex-2am-wasf-silsila-hisab-l3-005:q4": {"k":"write","c":"(2 + 6) * (9 - 4)","sentence":"جداء مجموع العددين 2 و 6 وفرق العددين 9 و 4","opts":[["(2 + 6) * (9 - 4)",null],["2 + 6 * 9 - 4","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l3-005:q5": {"k":"valw","c":"(2 + 6) * (9 - 4)","sentence":"جداء مجموع العددين 2 و 6 وفرق العددين 9 و 4","sigs":[["52","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  // ex-2am-wasf-silsila-hisab-l3-006
  "ex-2am-wasf-silsila-hisab-l3-006:q1": {"k":"name","c":"18 / (2 + 4) + 7","opts":[["فرق",null],["مجموع",null]]},
  "ex-2am-wasf-silsila-hisab-l3-006:q2": {"k":"descself","c":"18 / (2 + 4) + 7"},
  "ex-2am-wasf-silsila-hisab-l3-006:q3": {"k":"write","c":"(50 - 14) / (3 * 4)","sentence":"حاصل قسمة فرق العددين 50 و 14 على جداء العددين 3 و 4","opts":[["(50 - 14) / (3 * 4)",null],["50 - 14 / 3 * 4","NOBRACKET"],["3 * 4 / (50 - 14)","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l3-006:q4": {"k":"valw","c":"(50 - 14) / (3 * 4)","sentence":"حاصل قسمة فرق العددين 50 و 14 على جداء العددين 3 و 4","sigs":[]},
  // ex-2am-wasf-silsila-hisab-l3-007
  "ex-2am-wasf-silsila-hisab-l3-007:q1": {"k":"name","c":"(5 + 4) * (12 - 9)","opts":[["مجموع","FIRSTWRITTEN"],["جداء",null],["فرق",null]]},
  "ex-2am-wasf-silsila-hisab-l3-007:q2": {"k":"terms","c":"(5 + 4) * (12 - 9)","role":"first","opts":[["5","PIECES"],["9",null],["5 + 4",null]]},
  "ex-2am-wasf-silsila-hisab-l3-007:q3": {"k":"desc","c":"(5 + 4) * (12 - 9)","opts":[["مجموع العدد 5 وجداء العدد 4 وفرق العددين 12 و 9","FIRSTOP"],["جداء مجموع العددين 5 و 4 وفرق العددين 12 و 9",null]]},
  "ex-2am-wasf-silsila-hisab-l3-007:q4": {"k":"write","c":"80 - 7 * 9","sentence":"فرق العدد 80 وجداء العددين 7 و 9","opts":[["80 - 7 * 9",null],["(80 - 7) * 9",null]]},
  "ex-2am-wasf-silsila-hisab-l3-007:q5": {"k":"valw","c":"80 - 7 * 9","sentence":"فرق العدد 80 وجداء العددين 7 و 9","sigs":[]},
  // ex-2am-wasf-silsila-hisab-l3-008
  "ex-2am-wasf-silsila-hisab-l3-008:q1": {"k":"name","c":"40 - (26 - 11)","opts":[["مجموع",null],["فرق",null]]},
  "ex-2am-wasf-silsila-hisab-l3-008:q2": {"k":"terms","c":"40 - (26 - 11)","role":"second","opts":[["26 - 11",null],["26","PIECES"],["40","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l3-008:q3": {"k":"desc","c":"40 - (26 - 11)","opts":[["فرق فرق العددين 40 و 26 والعدد 11","FIRSTOP"],["فرق فرق العددين 26 و 11 والعدد 40","ORDERDIFF"],["فرق العددين 40 و 26 والعدد 11","PIECES"],["فرق العدد 40 وفرق العددين 26 و 11",null]]},
  "ex-2am-wasf-silsila-hisab-l3-008:q4": {"k":"write","c":"15 + (32 - 20)","sentence":"مجموع العدد 15 وفرق العددين 32 و 20","opts":[["15 + (32 - 20)",null],["15 + 32 - 20","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l3-008:q5": {"k":"valw","c":"15 + (32 - 20)","sentence":"مجموع العدد 15 وفرق العددين 32 و 20","sigs":[]},
  // ex-2am-wasf-silsila-hisab-l3-009
  "ex-2am-wasf-silsila-hisab-l3-009:q1": {"k":"name","c":"24 / 4 * 3","opts":[["جداء",null],["حاصل قسمة","FIRSTOP"],["مجموع",null]]},
  "ex-2am-wasf-silsila-hisab-l3-009:q2": {"k":"terms","c":"24 / 4 * 3","role":"first","opts":[["24","PIECES"],["24 / 4",null],["3",null]]},
  "ex-2am-wasf-silsila-hisab-l3-009:q3": {"k":"desc","c":"24 / 4 * 3","opts":[["حاصل قسمة 24 على جداء العددين 4 و 3","FIRSTOP"],["جداء حاصل قسمة 24 على 4 والعدد 3",null]]},
  "ex-2am-wasf-silsila-hisab-l3-009:q4": {"k":"write","c":"72 / (4 * 3)","sentence":"حاصل قسمة 72 على جداء العددين 4 و 3","opts":[["72 / (4 * 3)",null],["72 / 4 * 3","NOBRACKET"],["4 * 3 / 72","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l3-009:q5": {"k":"valw","c":"72 / (4 * 3)","sentence":"حاصل قسمة 72 على جداء العددين 4 و 3","sigs":[["54","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  // ex-2am-wasf-silsila-hisab-l3-010
  "ex-2am-wasf-silsila-hisab-l3-010:q1": {"k":"tree","c":"(48 - 12) / 6 + 7"},
  "ex-2am-wasf-silsila-hisab-l3-010:q2": {"k":"name","c":"(48 - 12) / 6 + 7","opts":[["فرق","FIRSTOP"],["مجموع",null],["جداء",null]]},
  "ex-2am-wasf-silsila-hisab-l3-010:q3": {"k":"write","c":"(6 + 4) * 15","sentence":null,"opts":[["(6 + 4) * 15",null],["6 + 4 * 15","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l3-010:q4": {"k":"prog","start":"6","steps":[["+","4"],["*","15"]],"sigs":[["66","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  // ex-2am-wasf-silsila-hisab-l4-001
  "ex-2am-wasf-silsila-hisab-l4-001:q1": {"k":"val","c":"6 + 3 * 2.5"},
  "ex-2am-wasf-silsila-hisab-l4-001:q2": {"k":"val","c":"10 - 3 * 2"},
  "ex-2am-wasf-silsila-hisab-l4-001:q3": {"k":"write","c":"(6 + 3 * 2.5) / (10 - 3 * 2)","sentence":"حاصل قسمة مجموع العدد 6 وجداء العددين 3 و 2,5 على فرق العدد 10 وجداء العددين 3 و 2","bar":true,"opts":[["(6 + 3 * 2.5) / (10 - 3 * 2)",null],["6 + 3 * 2.5 / 10 - 3 * 2","NOBRACKET"],["(10 - 3 * 2) / (6 + 3 * 2.5)","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l4-001:q4": {"k":"valw","c":"(6 + 3 * 2.5) / (10 - 3 * 2)","sentence":"حاصل قسمة مجموع العدد 6 وجداء العددين 3 و 2,5 على فرق العدد 10 وجداء العددين 3 و 2","sigs":[["0.75","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l4-001:q5": {"k":"name","c":"(6 + 3 * 2.5) / (10 - 3 * 2)","opts":[["جداء","FIRSTOP"],["حاصل قسمة",null],["فرق",null]]},
  // ex-2am-wasf-silsila-hisab-l4-002
  "ex-2am-wasf-silsila-hisab-l4-002:q1": {"k":"val","c":"9 + 15 / 3"},
  "ex-2am-wasf-silsila-hisab-l4-002:q2": {"k":"val","c":"4 * (7 - 2)"},
  "ex-2am-wasf-silsila-hisab-l4-002:q3": {"k":"desc","c":"4 * (7 - 2)","opts":[["فرق جداء العددين 4 و 7 والعدد 2","FIRSTOP"],["جداء العددين 4 و 7 والعدد 2","PIECES"],["جداء العدد 4 وفرق العددين 7 و 2",null]]},
  "ex-2am-wasf-silsila-hisab-l4-002:q4": {"k":"write","c":"3 * (9 + 15 / 3)","sentence":"جداء العدد 3 ومجموع العدد 9 وحاصل قسمة 15 على 3","opts":[["3 * (9 + 15 / 3)",null],["3 * 9 + 15 / 3","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l4-002:q5": {"k":"valw","c":"3 * (9 + 15 / 3)","sentence":"جداء العدد 3 ومجموع العدد 9 وحاصل قسمة 15 على 3","sigs":[["32","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  // ex-2am-wasf-silsila-hisab-l4-003
  "ex-2am-wasf-silsila-hisab-l4-003:q1": {"k":"val","c":"(40 - 16) / 6"},
  "ex-2am-wasf-silsila-hisab-l4-003:q2": {"k":"val","c":"12 + 3 * 5"},
  "ex-2am-wasf-silsila-hisab-l4-003:q3": {"k":"write","c":"(40 - 16) / 6 + 3 * 5","sentence":"مجموع حاصل قسمة فرق العددين 40 و 16 على 6 ، وجداء العددين 3 و 5","opts":[["(40 - 16) / (6 + 3 * 5)",null],["(40 - 16) / 6 + 3 * 5",null]]},
  "ex-2am-wasf-silsila-hisab-l4-003:q4": {"k":"valw","c":"(40 - 16) / 6 + 3 * 5","sentence":"مجموع حاصل قسمة فرق العددين 40 و 16 على 6 ، وجداء العددين 3 و 5","sigs":[]},
  "ex-2am-wasf-silsila-hisab-l4-003:q5": {"k":"yn","claim":["needed","x","(40 - 16) / 6 + 3 * 5"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا","NOBRACKET"]]},
  // ex-2am-wasf-silsila-hisab-l4-004
  "ex-2am-wasf-silsila-hisab-l4-004:q1": {"k":"val","c":"2 * 4.5 + 3 * 1.5"},
  "ex-2am-wasf-silsila-hisab-l4-004:q2": {"k":"desc","c":"2 * 4.5 + 3 * 1.5","opts":[["مجموع جداء العددين 2 و 4,5 وجداء العددين 3 و 1,5",null],["جداء العدد 2 ومجموع العدد 4,5 وجداء العددين 3 و 1,5","FIRSTOP"]]},
  "ex-2am-wasf-silsila-hisab-l4-004:q3": {"k":"write","c":"(2 * 4.5 + 3 * 1.5) / 3","sentence":"حاصل قسمة مجموع جداء العددين 2 و 4,5 وجداء العددين 3 و 1,5 على 3","bar":true,"opts":[["(2 * 4.5 + 3 * 1.5) / 3",null],["2 * 4.5 + 3 * 1.5 / 3","NOBRACKET"],["3 / (2 * 4.5 + 3 * 1.5)","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l4-004:q4": {"k":"valw","c":"(2 * 4.5 + 3 * 1.5) / 3","sentence":"حاصل قسمة مجموع جداء العددين 2 و 4,5 وجداء العددين 3 و 1,5 على 3","sigs":[["10.5","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l4-004:q5": {"k":"name","c":"(2 * 4.5 + 3 * 1.5) / 3","opts":[["جداء","FIRSTOP"],["حاصل قسمة",null],["مجموع",null]]},
  // ex-2am-wasf-silsila-hisab-l4-005
  "ex-2am-wasf-silsila-hisab-l4-005:q1": {"k":"val","c":"56 / 7 + 4"},
  "ex-2am-wasf-silsila-hisab-l4-005:q2": {"k":"val","c":"56 / 7 - 3"},
  "ex-2am-wasf-silsila-hisab-l4-005:q3": {"k":"write","c":"5 * (56 / 7 - 3)","sentence":"جداء العدد 5 وفرق حاصل قسمة 56 على 7 والعدد 3","opts":[["5 * 56 / 7 - 3","NOBRACKET"],["5 * (56 / 7 - 3)",null]]},
  "ex-2am-wasf-silsila-hisab-l4-005:q4": {"k":"valw","c":"5 * (56 / 7 - 3)","sentence":"جداء العدد 5 وفرق حاصل قسمة 56 على 7 والعدد 3","sigs":[["37","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l4-005:q5": {"k":"descself","c":"5 * (56 / 7 - 3)"},
  // ex-2am-wasf-silsila-hisab-l4-006
  "ex-2am-wasf-silsila-hisab-l4-006:q1": {"k":"val","c":"3 * 15 + 2 * 22.5"},
  "ex-2am-wasf-silsila-hisab-l4-006:q2": {"k":"write","c":"(3 * 15 + 2 * 22.5) / 6","sentence":null,"bar":true,"opts":[["(3 * 15 + 2 * 22.5) / 6",null],["3 * 15 + 2 * 22.5 / 6","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l4-006:q3": {"k":"valw","c":"(3 * 15 + 2 * 22.5) / 6","sentence":null,"sigs":[["52.5","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l4-006:q4": {"k":"yn","claim":["cmp","(3 * 15 + 2 * 22.5) / 6",">","12"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا",null]]},
  // ex-2am-wasf-silsila-hisab-l4-007
  "ex-2am-wasf-silsila-hisab-l4-007:q1": {"k":"val","c":"30 - 6"},
  "ex-2am-wasf-silsila-hisab-l4-007:q2": {"k":"val","c":"5 + 3"},
  "ex-2am-wasf-silsila-hisab-l4-007:q3": {"k":"write","c":"(30 - 6) * (5 + 3)","sentence":"جداء فرق العددين 30 و 6 ومجموع العددين 5 و 3","opts":[["30 - 6 * 5 + 3","NOBRACKET"],["(30 - 6) * (5 + 3)",null],["(30 - 6) * 5 + 3",null]]},
  "ex-2am-wasf-silsila-hisab-l4-007:q4": {"k":"valw","c":"(30 - 6) * (5 + 3)","sentence":"جداء فرق العددين 30 و 6 ومجموع العددين 5 و 3","sigs":[["3","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l4-007:q5": {"k":"terms","c":"(30 - 6) * (5 + 3)","role":"second","opts":[["5","PIECES"],["3",null],["5 + 3",null]]},
  // ex-2am-wasf-silsila-hisab-l4-008
  "ex-2am-wasf-silsila-hisab-l4-008:q1": {"k":"val","c":"72 / 8 + 6"},
  "ex-2am-wasf-silsila-hisab-l4-008:q2": {"k":"val","c":"72 / (8 + 4)"},
  "ex-2am-wasf-silsila-hisab-l4-008:q3": {"k":"desc","c":"72 / (8 + 4)","opts":[["حاصل قسمة 72 على مجموع العددين 8 و 4",null],["مجموع حاصل قسمة 72 على 8 والعدد 4","FIRSTOP"],["حاصل قسمة مجموع العددين 8 و 4 على 72","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l4-008:q4": {"k":"write","c":"90 - 72 / (8 + 4)","sentence":"فرق العدد 90 وحاصل قسمة 72 على مجموع العددين 8 و 4","opts":[["90 - 72 / 8 + 4","NOBRACKET"],["90 - 72 / (8 + 4)",null],["(90 - 72) / (8 + 4)",null]]},
  "ex-2am-wasf-silsila-hisab-l4-008:q5": {"k":"valw","c":"90 - 72 / (8 + 4)","sentence":"فرق العدد 90 وحاصل قسمة 72 على مجموع العددين 8 و 4","sigs":[["85","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  // ex-2am-wasf-silsila-hisab-l4-009
  "ex-2am-wasf-silsila-hisab-l4-009:q1": {"k":"prog","start":"5","steps":[["*","3"],["+","9"],["/","6"]],"sigs":[["16.5","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l4-009:q2": {"k":"write","c":"(5 * 3 + 9) / 6","sentence":null,"bar":true,"opts":[["5 * 3 + 9 / 6","NOBRACKET"],["(5 * 3 + 9) / 6",null]]},
  "ex-2am-wasf-silsila-hisab-l4-009:q3": {"k":"desc","c":"(5 * 3 + 9) / 6","opts":[["حاصل قسمة مجموع جداء العددين 5 و 3 والعدد 9 على 6",null],["جداء العدد 5 ومجموع العدد 3 وحاصل قسمة 9 على 6","FIRSTOP"],["حاصل قسمة 6 على مجموع جداء العددين 5 و 3 والعدد 9","ORDERDIFF"]]},
  "ex-2am-wasf-silsila-hisab-l4-009:q4": {"k":"prog","start":"12","steps":[["*","3"],["+","9"],["/","6"]],"sigs":[["37.5","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  // ex-2am-wasf-silsila-hisab-l4-010
  "ex-2am-wasf-silsila-hisab-l4-010:q1": {"k":"prog","start":"3","steps":[["+","6"],["*","3"],["/","9"]],"sigs":[["5","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l4-010:q2": {"k":"prog","start":"6","steps":[["+","6"],["*","3"],["/","9"]],"sigs":[["8","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l4-010:q3": {"k":"prog","start":"4.5","steps":[["+","6"],["*","3"],["/","9"]],"sigs":[["6.5","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l4-010:q4": {"k":"desc","c":"(3 + 6) * 3 / 9","opts":[["مجموع العدد 3 وحاصل قسمة جداء العددين 6 و 3 على 9","FIRSTOP"],["حاصل قسمة جداء مجموع العددين 3 و 6 والعدد 3 على 9",null]]},
  "ex-2am-wasf-silsila-hisab-l4-010:q5": {"k":"descself","c":"(12 + 6) * 3 / 9"},
  // ex-2am-wasf-silsila-hisab-l5-001
  "ex-2am-wasf-silsila-hisab-l5-001:q1": {"k":"write","c":"(5 + 7) * 4 - 6","sentence":null,"opts":[["(5 + 7) * 4 - 6",null],["5 + 7 * 4 - 6","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-001:q2": {"k":"prog","start":"5","steps":[["+","7"],["*","4"],["-","6"]],"sigs":[["27","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-001:q3": {"k":"prog","start":"2.5","steps":[["+","7"],["*","4"],["-","6"]],"sigs":[["24.5","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-001:q4": {"k":"descself","c":"(5 + 7) * 4 - 6"},
  "ex-2am-wasf-silsila-hisab-l5-001:q5": {"k":"yn","claim":["cmp","(9 + 7) * 4 - 6",">","60"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا",null]]},
  // ex-2am-wasf-silsila-hisab-l5-002
  "ex-2am-wasf-silsila-hisab-l5-002:q1": {"k":"valw","c":"(18 + 12) / 6","sentence":null,"sigs":[["20","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-002:q2": {"k":"valw","c":"30 - 3 * 8","sentence":null,"sigs":[]},
  "ex-2am-wasf-silsila-hisab-l5-002:q3": {"k":"valw","c":"(15 - 6) / 3","sentence":null,"sigs":[["13","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-002:q4": {"k":"val","c":"18 + 12 / 6"},
  "ex-2am-wasf-silsila-hisab-l5-002:q5": {"k":"yn","claim":["cmp","18 + 12 / 6","<","10"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا",null]]},
  // ex-2am-wasf-silsila-hisab-l5-003
  "ex-2am-wasf-silsila-hisab-l5-003:q1": {"k":"prog","start":"4","steps":[["+","8"],["*","3"],["/","6"]],"sigs":[["8","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-003:q2": {"k":"prog","start":"10","steps":[["+","8"],["*","3"],["/","6"]],"sigs":[["14","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-003:q3": {"k":"desc","c":"(4 + 8) * 3 / 6","opts":[["مجموع العدد 4 وحاصل قسمة جداء العددين 8 و 3 على 6","FIRSTOP"],["حاصل قسمة جداء مجموع العددين 4 و 8 والعدد 3 على 6",null]]},
  "ex-2am-wasf-silsila-hisab-l5-003:q4": {"k":"yn","claim":["cmp","(10 + 8) * 3 / 6",">","8"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا",null]]},
  "ex-2am-wasf-silsila-hisab-l5-003:q5": {"k":"writeself","c":"(10 + 8) * 3 / 6","sentence":null},
  // ex-2am-wasf-silsila-hisab-l5-004
  "ex-2am-wasf-silsila-hisab-l5-004:q1": {"k":"write","c":"1000 - (12 * 45 + 6 * 15)","sentence":null,"opts":[["1000 - (12 * 45 + 6 * 15)",null],["1000 - 12 * 45 + 6 * 15","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-004:q2": {"k":"val","c":"12 * 45 + 6 * 15"},
  "ex-2am-wasf-silsila-hisab-l5-004:q3": {"k":"valw","c":"1000 - (12 * 45 + 6 * 15)","sentence":null,"sigs":[["550","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-004:q4": {"k":"yn","claim":["cmp","1000 - (12 * 45 + 6 * 15)",">=","300"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا",null]]},
  "ex-2am-wasf-silsila-hisab-l5-004:q5": {"k":"writeself","c":"1000 - (12 * 45 + 6 * 15)","sentence":null},
  // ex-2am-wasf-silsila-hisab-l5-005
  "ex-2am-wasf-silsila-hisab-l5-005:q1": {"k":"write","c":"(8 * 15 - 3 * 15 - 12) / 7","sentence":null,"bar":true,"opts":[["8 * 15 - 3 * 15 - 12 / 7","NOBRACKET"],["(8 * 15 - 3 * 15 - 12) / 7",null]]},
  "ex-2am-wasf-silsila-hisab-l5-005:q2": {"k":"val","c":"8 * 15 - 3 * 15 - 12"},
  "ex-2am-wasf-silsila-hisab-l5-005:q3": {"k":"valw","c":"(8 * 15 - 3 * 15 - 12) / 7","sentence":null,"sigs":[]},
  "ex-2am-wasf-silsila-hisab-l5-005:q4": {"k":"yn","claim":["cmp","(8 * 15 - 3 * 15 - 12) / 7",">=","10"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا",null]]},
  "ex-2am-wasf-silsila-hisab-l5-005:q5": {"k":"descself","c":"(8 * 15 - 3 * 15 - 12) / 7"},
  // ex-2am-wasf-silsila-hisab-l5-006
  "ex-2am-wasf-silsila-hisab-l5-006:q1": {"k":"write","c":"(6 * 3 + 4 * 1) / 11","sentence":null,"bar":true,"opts":[["(6 * 3 + 4 * 1) / 11",null],["6 * 3 + 4 * 1 / 11","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-006:q2": {"k":"val","c":"6 * 3 + 4 * 1"},
  "ex-2am-wasf-silsila-hisab-l5-006:q3": {"k":"valw","c":"(6 * 3 + 4 * 1) / 11","sentence":null,"sigs":[]},
  "ex-2am-wasf-silsila-hisab-l5-006:q4": {"k":"yn","claim":["cmp","(6 * 3 + 4 * 1) / 11",">=","2"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا",null]]},
  "ex-2am-wasf-silsila-hisab-l5-006:q5": {"k":"descself","c":"(6 * 3 + 4 * 1) / 11"},
  // ex-2am-wasf-silsila-hisab-l5-007
  "ex-2am-wasf-silsila-hisab-l5-007:q1": {"k":"write","c":"(3 * 28 + 15) / 9","sentence":null,"bar":true,"opts":[["3 * 28 + 15 / 9","NOBRACKET"],["(3 * 28 + 15) / 9",null]]},
  "ex-2am-wasf-silsila-hisab-l5-007:q2": {"k":"val","c":"3 * 28 + 15"},
  "ex-2am-wasf-silsila-hisab-l5-007:q3": {"k":"valw","c":"(3 * 28 + 15) / 9","sentence":null,"sigs":[]},
  "ex-2am-wasf-silsila-hisab-l5-007:q4": {"k":"yn","claim":["cmp","(3 * 28 + 15) / 9",">","10"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا",null]]},
  "ex-2am-wasf-silsila-hisab-l5-007:q5": {"k":"descself","c":"(3 * 28 + 15) / 9"},
  // ex-2am-wasf-silsila-hisab-l5-008
  "ex-2am-wasf-silsila-hisab-l5-008:q1": {"k":"write","c":"(6 * 24 - 4 * 8 - 10) / 6","sentence":null,"bar":true,"opts":[["(6 * 24 - 4 * 8 - 10) / 6",null],["6 * 24 - 4 * 8 - 10 / 6","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-008:q2": {"k":"val","c":"6 * 24 - 4 * 8 - 10"},
  "ex-2am-wasf-silsila-hisab-l5-008:q3": {"k":"valw","c":"(6 * 24 - 4 * 8 - 10) / 6","sentence":null,"sigs":[]},
  "ex-2am-wasf-silsila-hisab-l5-008:q4": {"k":"yn","claim":["cmp","(6 * 24 - 4 * 8 - 10) / 6","<","15"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا",null]]},
  "ex-2am-wasf-silsila-hisab-l5-008:q5": {"k":"descself","c":"(6 * 24 - 4 * 8 - 10) / 6"},
  // ex-2am-wasf-silsila-hisab-l5-009
  "ex-2am-wasf-silsila-hisab-l5-009:q1": {"k":"write","c":"(240 + 3 * 20 - 40) / 4","sentence":null,"bar":true,"opts":[["240 + 3 * 20 - 40 / 4","NOBRACKET"],["(240 + 3 * 20 - 40) / 4",null]]},
  "ex-2am-wasf-silsila-hisab-l5-009:q2": {"k":"val","c":"240 + 3 * 20 - 40"},
  "ex-2am-wasf-silsila-hisab-l5-009:q3": {"k":"valw","c":"(240 + 3 * 20 - 40) / 4","sentence":null,"sigs":[["290","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-009:q4": {"k":"yn","claim":["cmp","(240 + 3 * 20 - 40) / 4",">=","60"],"labels":["نعم","لا"],"opts":[["نعم",null],["لا",null]]},
  "ex-2am-wasf-silsila-hisab-l5-009:q5": {"k":"descself","c":"(240 + 3 * 20 - 40) / 4"},
  // ex-2am-wasf-silsila-hisab-l5-010
  "ex-2am-wasf-silsila-hisab-l5-010:q1": {"k":"prog","start":"6","steps":[["+","9"],["*","5"],["/","15"]],"sigs":[["9","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-010:q2": {"k":"prog","start":"12","steps":[["+","9"],["*","5"],["/","15"]],"sigs":[["15","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-010:q3": {"k":"prog","start":"7.5","steps":[["+","9"],["*","5"],["/","15"]],"sigs":[["10.5","MISC-WASF-NOBRACKET","NOBRACKET"]]},
  "ex-2am-wasf-silsila-hisab-l5-010:q4": {"k":"desc","c":"(12 + 9) * 5 / 15","opts":[["حاصل قسمة جداء مجموع العددين 12 و 9 والعدد 5 على 15",null],["مجموع العدد 12 وحاصل قسمة جداء العددين 9 و 5 على 15","FIRSTOP"]]},
  "ex-2am-wasf-silsila-hisab-l5-010:q5": {"k":"descself","c":"(12 + 9) * 5 / 15"},
};

/** Les réponses justes (indépendantes du contenu), clé `<feuille>:<question>` ; les selfCheck n'ont pas de clé. */
export const ORACLE = {};
for (const [k, S] of Object.entries(SPEC)) { const j = judge(S); if (j.answer) ORACLE[k] = j.answer; }

/* ── Audit : relecture du contenu ───────────────────────────────────── */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/2am/wasf-silsila-hisab');
const FORBIDDEN = /الكتاب|خنزير|قمار|نرد|ورق اللعب|خمر|ربا |فائدة|يانصيب/;
const TERM_SOURCES = new Set(['2am-s1-83:1', '2am-s1-87:2']); // lus sur l'image du PDF (pdftoppm -r 130)
const PROVENANCE = { 1: [1, 6, 3], 2: [1, 7, 2], 3: [0, 9, 1], 4: [0, 9, 1], 5: [0, 9, 1] }; // term_exam / modelled / adapted
const ADAPTED = new Set(['act-5', 'self-5', 'ex-19', 'ex-18', 'ex-20', 'ex-9', 'deep-48', 'deep-49']);
const LPS = new Set(['2am_wasf-silsila-hisab_P1', '2am_wasf-silsila-hisab_P2', '2am_wasf-silsila-hisab_P3']);
const MONEY = /(?<![\u2066\d,])\d[\d,]*\s?DA/;

export function audit(bank) {
  const problems = [];
  problems.push(...handProblems());
  const sheets = {};
  try { for (const lv of readdirSync(ROOT)) for (const f of readdirSync(join(ROOT, lv))) { const d = JSON.parse(readFileSync(join(ROOT, lv, f), 'utf8')); sheets[d.id] = d; } } catch { /* banque absente */ }
  const sheetText = (sid) => { const s = sheets[sid]; return [s.statement.content, ...s.questions.map((x) => x.statement), ...s.questions.flatMap((x) => (x.choices ?? []).map((c) => c.content))].join(' '); };

  for (const { key, q } of bank) {
    const S = SPEC[key];
    if (!S) { problems.push(`${key} : aucune spec d'oracle`); continue; }
    const [sid] = key.split(':'); const allText = sheetText(sid);
    const P = (m) => problems.push(`${key} : ${m}`);
    const texts = [q.statement, q.answerFormat, ...(q.hints ?? []).map((h) => h.content), q.feedback?.correct, q.feedback?.incorrect, ...(q.solution?.lines ?? []), q.solution?.result, ...(q.choices ?? []).map((c) => c.content)];
    for (const t of texts) {
      if (!t) continue;
      if (FORBIDDEN.test(t)) P(`texte interdit dans « ${t} »`);
      if (MONEY.test(t.replace(/\$[^$]*\$/g, ''))) P(`somme d'argent sans isolat LTR dans « ${t} »`);
    }
    if (!LPS.has(q.learningPoints?.[0]?.code)) P('learning point inconnu');
    if (q.answerType === 'selfCheck' && q.counted !== undefined) P('selfCheck marquée counted');

    /* chaînes écrites : tous les intermédiaires ≥ 0 */
    const written = [];
    if (S.c) written.push(subEnv(S.c, S.env));
    if (S.k === 'prog') written.push(progChain(S.start, S.steps));
    if (S.k === 'write') S.opts.forEach(([x]) => written.push(x));
    if (S.k === 'yn' && S.claim[0] !== 'cmp') { const x = S.claim[0] === 'needed' ? S.claim[2] : S.claim[1]; written.push(x); }
    if (S.k === 'yn' && S.claim[0] === 'cmp') written.push(S.claim[1]);
    for (const w of written) { try { E(w); } catch (err) { P(`la chaîne « ${w} » : ${err.message}`); } }

    /* clé */
    let j; try { j = judge(S); } catch (err) { P(err.message); continue; }
    if (q.answerType === 'rational') {
      if (!/^\d+(\.\d+)?$/.test(String(q.expectedAnswer))) P(`clé « ${q.expectedAnswer} » (décimal positif exact attendu, point décimal)`);
      if (j.answer.value !== String(q.expectedAnswer)) P(`l'oracle trouve ${j.answer.value}, la feuille ${q.expectedAnswer}`);
    }
    const sigsBank = (q.misconceptionSignatures ?? []).map((x) => `${D(dq(x.value))}|${x.id}`).sort();
    if (S.k === 'valw' || S.k === 'prog') {
      const chain = S.k === 'valw' ? S.c : progChain(S.start, S.steps);
      const want = []; const flat = strip(chain);
      if (hasBr(chain)) { try { const w = En(flat); const k = E(chain); if (!w.neg() && isDec(w) && !w.eq(k)) want.push(`${D(w)}|${MISC.NOBRACKET}`); } catch { /* pas décimal */ } }
      if (JSON.stringify(sigsBank) !== JSON.stringify(want.sort())) P(`signatures ${sigsBank.join(' ; ')} ≠ attendues ${want.join(' ; ')}`);
      const spec = (S.sigs ?? []).map(([v, id]) => `${v}|${id}`).sort();
      if (JSON.stringify(spec) !== JSON.stringify(want.sort())) P(`spec : signatures ${spec.join(' ; ')} ≠ attendues ${want.join(' ; ')}`);
    } else if (sigsBank.length) P(`signatures sur une question de genre ${S.k}`);

    /* la chaîne du texte */
    const shownChain = (what) => {
      const found = chainsIn(q.statement, S.env);
      if (S.env) { if (!found.some((x) => sp(x) === sp(what))) P(`l'énoncé relu ${JSON.stringify(found)} ne contient pas « ${what} »`); }
      else if (!found.some((x) => norm(x) === norm(what))) P(`l'énoncé relu ${JSON.stringify(found)} ne contient pas « ${what} »`);
    };
    const numbersShown = (c) => { const have = new Set(NUMS(allText)); for (const n of numsOf(c)) if (!have.has(n)) P(`le nombre ${n} de « ${c} » n'est pas dans la feuille`); };
    const solLines = (q.solution?.lines ?? []).join(' ');

    /* QCM : options, balises */
    if (q.answerType === 'choice') {
      if (q.choices.length !== S.opts.length) P(`${q.choices.length} options pour ${S.opts.length} dans la spec`);
      if (j.answer.choiceId !== q.choices[q.choices.findIndex((c) => c.isCorrect)]?.id) P(`l'oracle juge ${j.answer.choiceId}, la feuille marque ${q.choices.find((c) => c.isCorrect)?.id}`);
      if (q.choices.filter((c) => c.isCorrect).length !== 1) P('plusieurs options marquées justes');
      q.choices.forEach((c, k) => {
        if (c.id !== 'ABCD'[k]) P(`identifiant d'option ${c.id}`);
        const how = S.opts[k][1]; const want = how ? MISC[how] : undefined;
        if (c.isCorrect && c.misconceptionId) P(`l'option juste ${c.id} porte ${c.misconceptionId}`);
        if (!c.isCorrect && c.misconceptionId !== want) P(`le distracteur ${c.id} porte ${c.misconceptionId} au lieu de ${want}`);
        if (how && !MISC[how]) P(`balise inconnue ${how}`);
      });
    }

    switch (S.k) {
      case 'val': {
        const found = chainsIn(q.statement, S.env);
        if (found.length) { if (!found.some((x) => (S.env ? sp(x) === sp(S.c) : norm(x) === norm(S.c)))) P(`l'énoncé relu ${JSON.stringify(found)} ne contient pas « ${S.c} »`); } else numbersShown(S.c);
        break;
      }
      case 'valw': {
        if (S.sentence !== null) {
          const own = describeOwn(S.c);
          if (own !== S.sentence) P(`la phrase de « ${S.c} » : oracle « ${own} » ≠ spec « ${S.sentence} »`);
          if (chainDescribe(glyph(S.c)) !== own) P(`chainOps.describe « ${chainDescribe(glyph(S.c))} » ≠ oracle « ${own} »`);
          if (!q.statement.includes(own) && !sheets[sid].statement.content.includes(own)) P(`la phrase « ${own} » n'est pas dans l'énoncé`);
        } else numbersShown(S.c);
        break;
      }
      case 'prog': { const nb = new Set(NUMS(allText)); for (const n of [S.start, ...S.steps.map((x) => x[1])]) if (!nb.has(D(dq(n)))) P(`le nombre ${n} du programme n'est pas dans la feuille`); break; }
      case 'name': {
        const cc = subEnv(S.c, S.env); const root = rootOf(cc); const fo = NAMES[readFirstOp(cc).o]; const fw = NAMES[readFirstWritten(cc).o];
        shownChain(S.c);
        if (!S.sym && !S.env && chainDescribe(glyph(S.c)) === undefined) P('chainOps');
        S.opts.forEach(([x, how], k) => {
          const nm = S.sym ? NAMES[SYMS[x]] : x; const ok = nm === NAMES[root.o]; if (ok) return;
          if (S.sym && !SYMS[x]) P(`symbole inconnu ${x}`);
          if (how === 'FIRSTOP' && nm !== fo) P(`${nm} n'est pas la lecture FIRSTOP de « ${S.c} » (${fo})`);
          if (how === 'FIRSTWRITTEN' && nm !== fw) P(`${nm} n'est pas la lecture FIRSTWRITTEN de « ${S.c} » (${fw})`);
          if (!how && (nm === fo || nm === fw)) P(`l'option ${'ABCD'[k]} « ${nm} » reproduit une lecture nommée mais n'est pas balisée`);
          if (how && how !== 'FIRSTOP' && how !== 'FIRSTWRITTEN') P(`balise ${how} sur une question de nom`);
        });
        if (S.sym) S.opts.forEach(([x], k) => { if (q.choices[k].content !== x) P(`option ${k} « ${q.choices[k].content} » ≠ « ${x} »`); });
        else S.opts.forEach(([x], k) => { if (q.choices[k].content !== x) P(`option ${k} « ${q.choices[k].content} » ≠ « ${x} »`); });
        break;
      }
      case 'terms': {
        shownChain(S.c); const [pf, ps] = blocksOf(S.c); const root = rootOf(S.c); const right = S.role === 'first' ? pf : ps; const other = S.role === 'first' ? ps : pf;
        if (!q.statement.includes(ROLE[root.o][S.role === 'first' ? 0 : 1])) P(`le mot « ${ROLE[root.o][S.role === 'first' ? 0 : 1]} » manque dans l'énoncé`);
        const firstNum = (numsOf(right).length >= 2) ? numsOf(right)[0] : null;
        S.opts.forEach(([x, how], k) => {
          const got = chainsIn(q.choices[k].content); if (got.length !== 1 || sp(got[0]) !== sp(x)) P(`option ${k} relue ${JSON.stringify(got)} ≠ « ${x} »`);
          if (sp(x) === sp(right)) return;
          const isP = firstNum !== null && sp(x) === sp(firstNum); const isO = (root.o === '-' || root.o === '/') && sp(x) === sp(other);
          if (how === 'PIECES' && !isP) P(`« ${x} » n'est pas la lecture PIECES de « ${S.c} »`);
          if (how === 'ORDERDIFF' && !isO) P(`« ${x} » n'est pas la lecture ORDERDIFF de « ${S.c} »`);
          if (!how && (isP || isO)) P(`l'option « ${x} » reproduit une lecture nommée mais n'est pas balisée`);
          if (how && how !== 'PIECES' && how !== 'ORDERDIFF') P(`balise ${how} sur une question de termes`);
        });
        break;
      }
      case 'desc': {
        const own = describeOwn(S.c); shownChain(S.c);
        if (chainDescribe(glyph(S.c)) !== own) P(`chainOps.describe « ${chainDescribe(glyph(S.c))} » ≠ oracle « ${own} »`);
        const r = { FIRSTOP: readFirstOp(S.c).sentence, FIRSTWRITTEN: readFirstWritten(S.c).sentence, PIECES: piecesRead(S.c), ORDERDIFF: rootSwapStruct(S.c) ? say(mk(rootOf(S.c).o, rootOf(S.c).r, rootOf(S.c).l)) : null };
        S.opts.forEach(([x, how], k) => {
          if (q.choices[k].content !== x) P(`option ${k} « ${q.choices[k].content} » ≠ « ${x} »`);
          if (x === own) return;
          if (how && r[how] !== x) P(`« ${x} » n'est pas la lecture ${how} de « ${S.c} » (« ${r[how]} »)`);
          if (!how && Object.values(r).includes(x)) P(`la phrase « ${x} » reproduit une lecture nommée mais n'est pas balisée`);
        });
        break;
      }
      case 'descself': {
        const own = describeOwn(S.c); shownChain(S.c);
        if (chainDescribe(glyph(S.c)) !== own) P(`chainOps.describe « ${chainDescribe(glyph(S.c))} » ≠ oracle « ${own} »`);
        if (!solLines.includes(own)) P(`le corrigé ne contient pas la phrase « ${own} »`);
        break;
      }
      case 'write': {
        const own = describeOwn(S.c);
        if (chainDescribe(glyph(S.c)) !== own) P(`chainOps.describe « ${chainDescribe(glyph(S.c))} » ≠ oracle « ${own} »`);
        if (S.sentence !== null) { if (S.sentence !== own) P(`la phrase de « ${S.c} » : oracle « ${own} » ≠ spec « ${S.sentence} »`); if (!q.statement.includes(`«${own}»`)) P(`la phrase « ${own} » n'est pas citée dans l'énoncé`); } else numbersShown(S.c);
        const swaps = swapStructs(S.c);
        S.opts.forEach(([x, how], k) => {
          const got = chainsIn(q.choices[k].content); if (got.length !== 1 || sp(got[0]) !== sp(x)) P(`option ${k} relue ${JSON.stringify(got)} ≠ « ${x} »`);
          if (S.bar && how !== undefined && /^\(.*\) \/ \(.*\)$/.test(x) && !q.choices[k].content.includes('\\dfrac')) P(`option ${k} : la barre de fraction n'est pas écrite en \\dfrac`);
          if (struct(x) === struct(S.c)) return;
          if (how === 'NOBRACKET' && !(!hasBr(x) && norm(x) === norm(strip(S.c)))) P(`« ${x} » n'est pas « ${S.c} » sans parenthèses`);
          if (how === 'ORDERDIFF' && !swaps.includes(struct(x))) P(`« ${x} » n'est pas « ${S.c} » avec deux blocs permutés`);
          if (!how && (struct(x) === struct(strip(S.c)) || swaps.includes(struct(x)))) P(`l'option « ${x} » reproduit une lecture nommée mais n'est pas balisée`);
          if (how && how !== 'NOBRACKET' && how !== 'ORDERDIFF') P(`balise ${how} sur une question d'écriture`);
        });
        if (new Set(S.opts.map(([x]) => struct(x))).size !== S.opts.length) P('deux options ont la même structure');
        break;
      }
      case 'writeself': {
        const own = describeOwn(S.c);
        if (S.sentence !== null && S.sentence !== own) P(`la phrase de « ${S.c} » : oracle « ${own} » ≠ spec`);
        if (S.sentence !== null && !q.statement.includes(`«${own}»`)) P(`la phrase « ${own} » n'est pas citée dans l'énoncé`);
        if (S.sentence === null) numbersShown(S.c);
        const sol = chainsIn(solLines); if (!sol.some((x) => { try { return struct(x) === struct(S.c); } catch { return false; } })) P('le corrigé ne contient pas la chaîne attendue');
        break;
      }
      case 'tree': {
        shownChain(S.c); const { tokens, root } = parseT(S.c); const lines = q.solution.lines.slice(1, -1);
        const nOps = tokens.filter((x) => /^[+\-*/]$/.test(x)).length; const nNum = tokens.filter((x) => /^\d/.test(x)).length;
        if (lines.length !== nOps + nNum) P(`l'arbre a ${lines.length} lignes au lieu de ${nOps + nNum}`);
        const rootLine = lines[0] ?? '';
        const symTex = { '+': '$+$', '-': '$-$', '*': '$\\times$', '/': '$\\div$' }[root.o];
        if (!rootLine.includes(symTex) || !rootLine.includes(`(= ${D(ev(root, true)).replace('.', '{,}')})`)) P(`la ligne de la racine « ${rootLine} » ≠ ${symTex} (= ${D(ev(root, true))})`);
        if (lines.filter((x) => x.includes('(= ')).length !== nOps) P('nombre de lignes d\'opérations');
        break;
      }
      case 'yn': {
        const c = S.claim; const truth = judge(S).flags[0]; const wrong = S.opts[truth ? 1 : 0]; const how = wrong[1];
        if (q.choices.map((x) => x.content).join('|') !== S.labels.join('|')) P(`libellés ${q.choices.map((x) => x.content).join('|')} ≠ ${S.labels.join('|')}`);
        if (S.opts[truth ? 0 : 1][1]) P('l\'option juste est balisée');
        if (c[0] === 'name') {
          shownChain(c[1]); if (!q.statement.includes(c[2])) P(`le nom « ${c[2]} » n'est pas dans l'énoncé`);
          if (!how || (how !== 'FIRSTOP' && how !== 'FIRSTWRITTEN')) P('un distracteur de nom doit être balisé FIRSTOP / FIRSTWRITTEN');
          else { const rn = NAMES[(how === 'FIRSTOP' ? readFirstOp : readFirstWritten)(c[1]).o]; if (truth ? rn === c[2] : rn !== c[2]) P(`la lecture ${how} de « ${c[1]} » (${rn}) ne produit pas le verdict faux (${truth ? 'vrai' : 'faux'})`); }
        } else if (c[0] === 'needed') {
          if (truth && how !== 'NOBRACKET') P('quand les parenthèses sont nécessaires, « non » doit être NOBRACKET');
          if (!truth && how) P('quand elles ne le sont pas, « oui » n\'a pas de balise (le sur-parenthésage n\'est pas nommé)');
          if (c[1] !== 'x' && !q.statement.includes(c[1])) P('phrase absente');
          numbersShown(c[2]);
        } else if (c[0] === 'term') {
          shownChain(c[1]); const [pf, ps] = blocksOf(c[1]); const root = rootOf(c[1]); const right = c[2] === 'first' ? pf : ps; const other = c[2] === 'first' ? ps : pf; const fn = numsOf(right).length >= 2 ? numsOf(right)[0] : null;
          if (!q.statement.includes(ROLE[root.o][c[2] === 'first' ? 0 : 1])) P('le rôle manque dans l\'énoncé');
          const claimed = sp(c[3]);
          if (how === 'PIECES') { if (fn === null) P('PIECES : bloc réduit à un nombre'); else if (truth ? claimed !== sp(right) : claimed !== sp(fn)) P('PIECES : le verdict ne suit pas la lecture'); }
          else if (how === 'ORDERDIFF') { if (!(root.o === '-' || root.o === '/')) P('ORDERDIFF : ni différence ni quotient'); else if (!truth && claimed !== sp(other)) P('ORDERDIFF : le bloc affirmé n\'est pas l\'autre bloc'); }
          else P('un distracteur de bloc doit être balisé PIECES / ORDERDIFF');
        } else if (how) P('une décision ne porte pas de balise');
        if (c[0] === 'cmp') numbersShown(c[1]);
        break;
      }
      default: break;
    }
  }

  /* niveau fichier : 50 feuilles, provenance */
  const files = Object.values(sheets);
  if (files.length !== 50) problems.push(`la banque compte ${files.length} feuilles au lieu de 50`);
  for (let lv = 1; lv <= 5; lv++) {
    const L = files.filter((x) => x.level === lv);
    if (L.length !== 10) problems.push(`niveau ${lv} : ${L.length} feuilles au lieu de 10`);
    const got = [L.filter((x) => x.metadata.source.type === 'term_exam').length, L.filter((x) => x.metadata.source.type === 'platform_addition').length, L.filter((x) => x.metadata.source.type === 'textbook').length];
    if (JSON.stringify(got) !== JSON.stringify(PROVENANCE[lv])) problems.push(`niveau ${lv} : provenance ${got.join('/')} au lieu de ${PROVENANCE[lv].join('/')}`);
  }
  const seenEl = new Set();
  for (const ex of files) {
    const s = ex.metadata.source;
    const all = [ex.metadata.title, ...(ex.metadata.tags ?? []), ex.statement.content];
    for (const t of all) { if (t && FORBIDDEN.test(t)) problems.push(`${ex.id} : texte interdit dans « ${String(t).slice(0, 60)} »`); if (t && MONEY.test(String(t).replace(/\$[^$]*\$/g, ''))) problems.push(`${ex.id} : somme d'argent sans isolat LTR`); }
    if (s.type === 'term_exam' && !TERM_SOURCES.has(`${s.file}:${s.exercise}`)) problems.push(`${ex.id} : sujet ${s.file} ex ${s.exercise} non lu pour cette banque`);
    if (s.type === 'textbook') { if (!ADAPTED.has(s.elementId)) problems.push(`${ex.id} : élément ${s.elementId} inattendu`); if (seenEl.has(s.elementId)) problems.push(`${ex.id} : élément ${s.elementId} cité deux fois`); seenEl.add(s.elementId); }
    if (s.type === 'platform_addition' && (s.reason !== 'term_exam_modelled' || s.modelledOn !== '2am-s1')) problems.push(`${ex.id} : provenance modelled mal formée`);
    if (ex.metadata.exam.kind === 'official' || ex.metadata.exam.kind === 'excerpt') problems.push(`${ex.id} : jamais officiel en 2AM`);
  }
  if (seenEl.size !== ADAPTED.size) problems.push(`éléments adaptés ${[...seenEl].join(',')}`);
  const s4 = sheets['ex-2am-wasf-silsila-hisab-l2-004'];
  if (s4 && !s4.statement.content.includes('حاصل قسمة مجموع العدد 6 وجداء العددين 12 و 4 على فرق جداء العددين 4 و 5 والعدد 8')) problems.push('l2-004 : la phrase de E manque dans l\'énoncé de la feuille');
  return problems;
}
