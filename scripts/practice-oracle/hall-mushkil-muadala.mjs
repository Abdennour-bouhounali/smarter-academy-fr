// Oracle du banc « hall-mushkil-muadala » (حلّ مشكل باستعمال معادلة, 2AM unité 4, leçon 2, 2026-10-29) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الثاني / الثالث »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Tout est RECALCULÉ ICI, avec des outils écrits dans ce fichier (aucun import de packages/core) :
//  - rationnels EXACTS en BigInt (classe Q), un parseur ASCII (nombres décimaux, UNE lettre minuscule, + - * / ( )) ;
//  - SPEC (ci-dessous) ne contient QUE des équations / expressions ASCII et des paramètres de recette : jamais une réponse.
//    Pour chaque question l'oracle recalcule la clé : l'équation retapée est résolue par ANNULATION de la chaîne d'opérations
//    (dernière opération d'abord), puis la valeur est VÉRIFIÉE par substitution ; chaque distracteur est refait à partir de la
//    recette de son erreur nommée (MULTDIV, FLIP, SUBFORM, ADDFORM, DIVDIVIDEND, RANK, UNDOFIRST pour les valeurs ; SWAP, ROLE,
//    ADDFORM pour les équations d'une histoire ; UNDOFIRST pour l'équation obtenue après une étape), il est FAUX (jamais une
//    solution) et distinct des autres ; un seul choix vrai ; « oui / non » par comparaison exacte ;
//  - audit(bank) relit le LaTeX de chaque énoncé / option / corrigé (tex2ascii) : l'équation retapée est dans l'énoncé, les
//    nombres donnés y sont, la chaîne de calcul du corrigé vaut la clé, aucune valeur négative, aucun chiffre ni unité latine
//    hors d'un îlot `$…$` (argent `$…$ DA`, unité `\,\mathrm{u}`), aucune mention du manuel, mots interdits ;
//  - provenance (50 feuilles, 5 × 10, sujets réellement lus, une partie d'un sujet jamais citée deux fois en `term_exam`,
//    éléments adaptés présents dans docs/sources/2am/unit4/extraction.json avec cette leçon pour destination).
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

/* ── rationnels exacts ── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
class Q {
  constructor(n, d = 1n) { if (d === 0n) throw new Error('division par zéro'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; this.n = n / g; this.d = d / g; }
  add(o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Q(this.n * o.n, this.d * o.d); }
  div(o) { return new Q(this.n * o.d, this.d * o.n); }
  eq(o) { return this.n === o.n && this.d === o.d; }
  neg() { return this.n < 0n; }
}
const ZERO = new Q(0n); const ONE = new Q(1n);
const dq = (s) => { const m = /^(\d+)(?:\.(\d+))?$/.exec(String(s).trim()); if (!m) throw new Error(`nombre illisible : ${s}`); const f = m[2] ?? ''; return new Q(BigInt(m[1] + f), 10n ** BigInt(f.length)); };
const isDec = (x) => { for (let k = 0n; k <= 12n; k++) if ((10n ** k) % x.d === 0n) return true; return false; };
const D = (x) => {
  for (let k = 0n; k <= 12n; k++) {
    const p = 10n ** k;
    if (p % x.d === 0n) {
      const N = x.n * (p / x.d); const s = (N < 0n ? -N : N).toString().padStart(Number(k) + 1, '0');
      const int = s.slice(0, s.length - Number(k)); const frac = s.slice(s.length - Number(k)).replace(/0+$/, '');
      return `${N < 0n ? '-' : ''}${int}${frac ? `.${frac}` : ''}`;
    }
  }
  throw new Error(`${x.n}/${x.d} n'est pas un décimal`);
};

/* ── parseur ASCII → arbre ── */
function parse(s) {
  const t = s.match(/\d+(?:\.\d+)?|[a-z]|[()+\-*/]/g) ?? [];
  if (t.join('') !== s.replace(/\s+/g, '')) throw new Error(`caractères illisibles dans « ${s} »`);
  let i = 0;
  const atom = () => {
    const v = t[i++];
    if (v === '(') { const e = expr(); if (t[i++] !== ')') throw new Error(`« ) » attendu dans « ${s} »`); return e; }
    if (v !== undefined && /^\d/.test(v)) return { k: 'n', v: dq(v) };
    if (v !== undefined && /^[a-z]$/.test(v)) return { k: 'v', n: v };
    throw new Error(`facteur attendu dans « ${s} »`);
  };
  const term = () => { let l = atom(); while (t[i] === '*' || t[i] === '/') { const o = t[i++]; l = { k: 'b', o, l, r: atom() }; } return l; };
  const expr = () => { let l = term(); while (t[i] === '+' || t[i] === '-') { const o = t[i++]; l = { k: 'b', o, l, r: term() }; } return l; };
  const root = expr(); if (i !== t.length) throw new Error(`reste dans « ${s} »`);
  return root;
}
/** évaluation exacte ; refuse un intermédiaire négatif (2AM avant l'unité 3 : owner Q10). */
function ev(n, env, allowNeg = false) {
  if (n.k === 'n') return n.v;
  if (n.k === 'v') { if (!(n.n in env)) throw new Error(`lettre ${n.n} sans valeur`); return env[n.n]; }
  const l = ev(n.l, env, allowNeg); const r = ev(n.r, env, allowNeg);
  if (n.o === '+') return l.add(r);
  if (n.o === '-') { const o = l.sub(r); if (!allowNeg && o.neg()) throw new Error('intermédiaire négatif'); return o; }
  if (n.o === '*') return l.mul(r);
  return l.div(r);
}
const envQ = (e) => Object.fromEntries(Object.entries(e ?? {}).map(([k, v]) => [k, dq(String(v))]));
const letters = (n, acc = new Set()) => { if (n.k === 'v') acc.add(n.n); if (n.k === 'b') { letters(n.l, acc); letters(n.r, acc); } return acc; };

/* ── équations : « G = D », résolues par annulation de la chaîne d'opérations ── */
function eqOf(s) {
  const parts = s.split('='); if (parts.length !== 2) throw new Error(`pas une équation : ${s}`);
  const L = parse(parts[0]); const Rr = parse(parts[1]);
  const vs = new Set([...letters(L), ...letters(Rr)]); if (vs.size !== 1) throw new Error(`une seule lettre attendue dans ${s}`);
  return { L, R: Rr, v: [...vs][0] };
}
const holds = (E, x) => { try { return ev(E.L, { [E.v]: x }, true).eq(ev(E.R, { [E.v]: x }, true)); } catch { return false; } };
/** annule, de l'extérieur vers l'intérieur : la DERNIÈRE opération d'abord. Chaque étape doit rester ≥ 0. */
function solveChain(E) {
  let node = E.L; let rhs = ev(E.R, {}); const steps = [];
  while (node.k === 'b') {
    const hasL = letters(node.l).size === 1; const c = ev(hasL ? node.r : node.l, {}); const o = node.o;
    if (hasL) { // (X o c) = rhs
      if (o === '+') rhs = rhs.sub(c); else if (o === '-') rhs = rhs.add(c); else if (o === '*') rhs = rhs.div(c); else rhs = rhs.mul(c);
      node = node.l;
    } else {    // (c o X) = rhs
      if (o === '+') rhs = rhs.sub(c); else if (o === '-') rhs = c.sub(rhs); else if (o === '*') rhs = rhs.div(c); else rhs = c.div(rhs);
      node = node.r;
    }
    if (rhs.neg()) throw new Error('étape négative');
    steps.push(rhs);
  }
  if (node.k !== 'v') throw new Error('résolution impossible');
  return { x: rhs, steps };
}
/** forme reconnue + paramètres (a, b, c, m, d) pour les recettes. */
function formOf(E) {
  const num = (n) => (n.k === 'n' ? n.v : null); const isV = (n) => n.k === 'v'; const op = (n, o) => n.k === 'b' && n.o === o;
  const L = E.L; const d = ev(E.R, {});
  if (op(L, '*') && num(L.l) && isV(L.r)) return { f: 'mul', a: num(L.l), b: d };
  if (op(L, '/') && isV(L.l) && num(L.r)) return { f: 'div', a: num(L.r), b: d };
  if (op(L, '/') && num(L.l) && isV(L.r)) return { f: 'ldiv', a: num(L.l), b: d };
  if (op(L, '+') && isV(L.l) && num(L.r)) return { f: 'add', a: num(L.r), b: d };
  if (op(L, '-') && isV(L.l) && num(L.r)) return { f: 'sub', a: num(L.r), b: d };
  if (op(L, '+') && op(L.l, '*') && num(L.l.l) && isV(L.l.r) && num(L.r)) return { f: 'lin', m: num(L.l.l), c: num(L.r), d };
  if (op(L, '-') && op(L.l, '*') && num(L.l.l) && isV(L.l.r) && num(L.r)) return { f: 'lsub', m: num(L.l.l), c: num(L.r), d };
  if (op(L, '/') && op(L.l, '+') && isV(L.l.l) && num(L.l.r) && num(L.r)) return { f: 'div2', c: num(L.l.r), m: num(L.r), d };
  if (op(L, '/') && op(L.l, '-') && isV(L.l.l) && num(L.l.r) && num(L.r)) return { f: 'dsub', c: num(L.l.r), m: num(L.r), d };
  throw new Error(`forme d'équation non reconnue : ${E.L.k}`);
}
/** les lectures nommées (valeurs fautives) d'une équation : étiquette → valeur, reconstruites ici. */
function readings(E) {
  const F = formOf(E); const x = solveChain(E).x; const r = {};
  const { a, b, c, m, d } = F;
  if (F.f === 'mul') { r.MULTDIV = a.mul(b); r.FLIP = a.div(b); r.SUBFORM = b.sub(a); r.ADDFORM = a.add(b); }
  if (F.f === 'div') { r.DIVDIVIDEND = b.div(a); r.ADDFORM = a.add(b); r.SUBFORM = a.sub(b).neg() ? b.sub(a) : a.sub(b); }
  if (F.f === 'ldiv') { r.MULTDIV = a.mul(b); r.FLIP = b.div(a); r.SUBFORM = a.sub(b); r.RANK = x.n >= x.d ? x.div(new Q(10n)) : x.mul(new Q(10n)); }
  if (F.f === 'add') r.ADDFORM = a.add(b);
  if (F.f === 'sub') r.SUBFORM = b.sub(a);
  if (F.f === 'lin') { r.UNDOFIRST = d.div(m).sub(c); r.SUBFORM = d.sub(c); r.ADDFORM = d.add(c).div(m); }
  if (F.f === 'lsub') { r.UNDOFIRST = d.div(m).add(c); r.SUBFORM = d.sub(c).div(m); r.ADDFORM = d.add(c); }
  if (F.f === 'div2') { r.UNDOFIRST = m.mul(d.sub(c)); r.SUBFORM = d.sub(c); r.ADDFORM = m.mul(d).add(c); }
  if (F.f === 'dsub') { r.UNDOFIRST = m.mul(d.add(c)); r.SUBFORM = m.mul(d).sub(c); r.ADDFORM = d.add(c); }
  return { F, x, r };
}
/** une lecture n'est « nommée » que si elle est ≥ 0, décimale, ≠ de la clé et n'est PAS une solution. */
const legal = (E, x, v) => !v.neg() && isDec(v) && !v.eq(x) && !holds(E, v);

/* ── équations d'une histoire (une opération) : SWAP, ROLE, ADDFORM refaits depuis la forme de la vérité ── */
function storyReadings(E) {
  const F = formOf(E); const v = E.v; const s = (q) => D(q);
  const out = {};
  if (F.f === 'mul') { out.SWAP = `${s(F.b)}*${v}=${s(F.a)}`; out.ROLE = `${v}/${s(F.a)}=${s(F.b)}`; }
  if (F.f === 'div') { out.SWAP = `${v}/${s(F.b)}=${s(F.a)}`; out.ROLE = `${s(F.a)}/${v}=${s(F.b)}`; }
  if (F.f === 'ldiv') { out.SWAP = `${s(F.b)}/${v}=${s(F.a)}`; out.ROLE = `${v}/${s(F.a)}=${s(F.b)}`; }
  out.ADDFORM = `${v}+${s(F.a)}=${s(F.b)}`;
  return out;
}
/** après la première étape de annulation (équation à étape) : vérité et lecture UNDOFIRST. */
function stepReadings(E) {
  const F = formOf(E); const v = E.v; const s = (q) => D(q); const out = {};
  if (F.f === 'lin') { out.TRUTH = `${s(F.m)}*${v}=${s(F.d.sub(F.c))}`; out.UNDOFIRST = `${v}+${s(F.c)}=${s(F.d.div(F.m))}`; out.ADDFORM = `${s(F.m)}*${v}=${s(F.d.add(F.c))}`; }
  if (F.f === 'lsub') { out.TRUTH = `${s(F.m)}*${v}=${s(F.d.add(F.c))}`; out.UNDOFIRST = `${v}-${s(F.c)}=${s(F.d.div(F.m))}`; out.SUBFORM = `${s(F.m)}*${v}=${s(F.d.sub(F.c))}`; }
  if (F.f === 'div2') { out.TRUTH = `${v}+${s(F.c)}=${s(F.m.mul(F.d))}`; out.UNDOFIRST = `${v}/${s(F.m)}=${s(F.d.sub(F.c))}`; }
  if (F.f === 'dsub') { out.TRUTH = `${v}-${s(F.c)}=${s(F.m.mul(F.d))}`; out.UNDOFIRST = `${v}/${s(F.m)}=${s(F.d.add(F.c))}`; }
  return out;
}
/** deux équations de même lettre sont « la même écriture » si G − D coïncide en plusieurs points. */
const XS = ['1', '2', '3', '5', '7', '11', '13'].map((n) => new Q(BigInt(n)));
const sameEq = (A, B) => { try { const f = (E, x) => ev(E.L, { [E.v]: x }, true).sub(ev(E.R, { [E.v]: x }, true)); return XS.every((x) => f(A, x).eq(f(B, x))) || XS.every((x) => f(A, x).eq(f(B, x).mul(new Q(-1n)))); } catch { return false; } };
/** polynôme du 1er degré (m, c) d'une expression ASCII en x. */
const affine = (s) => { const e = parse(s); const c = ev(e, { x: ZERO }, true); const m = ev(e, { x: ONE }, true).sub(c); return { m, c }; };

/* ── SPEC : ce que la feuille demande (équations ASCII + recettes), jamais une réponse ── */
const SPEC = {
  "ex-2am-hall-mushkil-muadala-l1-001:q1": {"t":"solve","eq":"54/x=6","var":"x","sigs":["MULTDIV","SUBFORM","RANK"]},
  "ex-2am-hall-mushkil-muadala-l1-001:q2": {"t":"solve","eq":"x+8=20","var":"x","sigs":["ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-001:q3": {"t":"solve","eq":"17*x=221","var":"x","sigs":["MULTDIV","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-002:q1": {"t":"solve","eq":"8*x=20","var":"x","sigs":["MULTDIV","FLIP","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-002:q2": {"t":"solve","eq":"x/6=1.5","var":"x","sigs":["DIVDIVIDEND","ADDFORM","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-002:q3": {"t":"solve","eq":"36/x=0.4","var":"x","sigs":["MULTDIV","SUBFORM","RANK"]},
  "ex-2am-hall-mushkil-muadala-l1-003:q1": {"t":"solve","eq":"1.2*x=9","var":"x","sigs":["MULTDIV","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-003:q2": {"t":"solve","eq":"x/0.4=15","var":"x","sigs":["DIVDIVIDEND","ADDFORM","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-003:q3": {"t":"solve","eq":"72/x=4.5","var":"x","sigs":["MULTDIV","FLIP","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-004:q1": {"t":"solve","eq":"0.5*x=3.5","var":"x","sigs":["MULTDIV","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-004:q2": {"t":"solve","eq":"x/12=0.25","var":"x","sigs":["ADDFORM","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-004:q3": {"t":"solve","eq":"9/x=0.75","var":"x","sigs":["MULTDIV","SUBFORM","RANK"]},
  "ex-2am-hall-mushkil-muadala-l1-005:q1": {"t":"solve","eq":"x-1.5=4","var":"x","sigs":["SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-005:q2": {"t":"solve","eq":"4*x=3","var":"x","sigs":["MULTDIV","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-005:q3": {"t":"solve","eq":"15/x=2.5","var":"x","sigs":["MULTDIV","SUBFORM","RANK"]},
  "ex-2am-hall-mushkil-muadala-l1-006:q1": {"t":"solve","eq":"x/0.5=8","var":"x","sigs":["DIVDIVIDEND","ADDFORM","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-006:q2": {"t":"solve","eq":"2.4*x=12","var":"x","sigs":["MULTDIV","FLIP","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-006:q3": {"t":"solve","eq":"48/x=0.6","var":"x","sigs":["MULTDIV","FLIP","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-007:q1": {"t":"pick","eq":"7*x=4.2","var":"x","opts":[{"id":"A","v":"29.4","tag":"MULTDIV","ok":false},{"id":"B","v":"11.2","tag":"ADDFORM","ok":false},{"id":"C","v":"0.6","tag":null,"ok":true}]},
  "ex-2am-hall-mushkil-muadala-l1-007:q2": {"t":"pick","eq":"20/x=8","var":"x","opts":[{"id":"A","v":"160","tag":"MULTDIV","ok":false},{"id":"B","v":"0.4","tag":"FLIP","ok":false},{"id":"C","v":"2.5","tag":null,"ok":true}]},
  "ex-2am-hall-mushkil-muadala-l1-007:q3": {"t":"pick","eq":"x/5=0.9","var":"x","opts":[{"id":"A","v":"5.9","tag":"ADDFORM","ok":false},{"id":"B","v":"0.18","tag":"DIVDIVIDEND","ok":false},{"id":"C","v":"4.5","tag":null,"ok":true}]},
  "ex-2am-hall-mushkil-muadala-l1-008:q1": {"t":"solve","eq":"0.3*x=2.4","var":"x","sigs":["MULTDIV","FLIP","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-008:q2": {"t":"solve","eq":"5.6/x=1.4","var":"x","sigs":["MULTDIV","FLIP","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-008:q3": {"t":"solve","eq":"x/2.5=4","var":"x","sigs":["DIVDIVIDEND","ADDFORM","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-009:q1": {"t":"pick","eq":"25.2/x=36","var":"x","opts":[{"id":"A","v":"0.7","tag":null,"ok":true},{"id":"B","v":"907.2","tag":"MULTDIV","ok":false},{"id":"C","v":"7","tag":"RANK","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l1-009:q2": {"t":"solve","eq":"0.7*x=4.9","var":"x","sigs":["MULTDIV","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-009:q3": {"t":"solve","eq":"x/1.5=0.8","var":"x","sigs":["ADDFORM","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-010:q1": {"t":"solve","eq":"156/x=12","var":"x","sigs":["MULTDIV","SUBFORM","RANK"]},
  "ex-2am-hall-mushkil-muadala-l1-010:q2": {"t":"solve","eq":"135/x=27","var":"x","sigs":["MULTDIV","FLIP","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l1-010:q3": {"t":"solve","eq":"8.4/x=0.1","var":"x","sigs":["MULTDIV","SUBFORM","RANK"]},
  "ex-2am-hall-mushkil-muadala-l1-010:q4": {"t":"solve","eq":"253/x=0.01","var":"x","sigs":["MULTDIV","SUBFORM","RANK"]},
  "ex-2am-hall-mushkil-muadala-l2-001:q1": {"t":"solve","eq":"7*x=28","var":"x","sigs":["MULTDIV","FLIP","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l2-001:q2": {"t":"solve","eq":"x+3.5=8","var":"x","sigs":["ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l2-001:q3": {"t":"solve","eq":"x+2=4.7","var":"x","sigs":["ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l2-001:q4": {"t":"yn","eq":"x/5=3","var":"x","v":"15","order":["yes","no"]},
  "ex-2am-hall-mushkil-muadala-l2-002:q1": {"t":"yn","eq":"12/x=4","var":"x","v":"3","order":["no","yes"]},
  "ex-2am-hall-mushkil-muadala-l2-002:q2": {"t":"yn","eq":"12/x=4","var":"x","v":"48","order":["yes","no"]},
  "ex-2am-hall-mushkil-muadala-l2-002:q3": {"t":"yn","eq":"12/x=4","var":"x","v":"8","order":["no","yes"]},
  "ex-2am-hall-mushkil-muadala-l2-003:q1": {"t":"yn","eq":"2.5*x=10","var":"x","v":"4","order":["yes","no"]},
  "ex-2am-hall-mushkil-muadala-l2-003:q2": {"t":"yn","eq":"2.5*x=10","var":"x","v":"25","order":["no","yes"]},
  "ex-2am-hall-mushkil-muadala-l2-003:q3": {"t":"yn","eq":"2.5*x=10","var":"x","v":"7.5","order":["no","yes"]},
  "ex-2am-hall-mushkil-muadala-l2-003:q4": {"t":"yn","eq":"2.5*x=10","var":"x","v":"0.25","order":["yes","no"]},
  "ex-2am-hall-mushkil-muadala-l2-004:q1": {"t":"yn","eq":"x/0.4=15","var":"x","v":"6","order":["yes","no"]},
  "ex-2am-hall-mushkil-muadala-l2-004:q2": {"t":"yn","eq":"x/0.4=15","var":"x","v":"37.5","order":["yes","no"]},
  "ex-2am-hall-mushkil-muadala-l2-004:q3": {"t":"yn","eq":"x/0.4=15","var":"x","v":"15.4","order":["no","yes"]},
  "ex-2am-hall-mushkil-muadala-l2-005:q1": {"t":"yn","eq":"4.8/x=1.6","var":"x","v":"3","order":["yes","no"]},
  "ex-2am-hall-mushkil-muadala-l2-005:q2": {"t":"yn","eq":"4.8/x=1.6","var":"x","v":"7.68","order":["no","yes"]},
  "ex-2am-hall-mushkil-muadala-l2-005:q3": {"t":"yn","eq":"4.8/x=1.6","var":"x","v":"0.3","order":["yes","no"]},
  "ex-2am-hall-mushkil-muadala-l2-005:q4": {"t":"yn","eq":"4.8/x=1.6","var":"x","v":"3.2","order":["no","yes"]},
  "ex-2am-hall-mushkil-muadala-l2-006:q1": {"t":"yn","eq":"x/5=2.4","var":"x","v":"12","order":["no","yes"]},
  "ex-2am-hall-mushkil-muadala-l2-006:q2": {"t":"yn","eq":"6*x=45","var":"x","v":"7.5","order":["no","yes"]},
  "ex-2am-hall-mushkil-muadala-l2-006:q3": {"t":"yn","eq":"9/x=0.5","var":"x","v":"4.5","order":["no","yes"]},
  "ex-2am-hall-mushkil-muadala-l2-007:q1": {"t":"steq","truth":"120*x=300","kind":"mul","var":"x","opts":[{"id":"A","eq":"120*x=300","tag":null,"ok":true},{"id":"B","eq":"x/120=300","tag":"ROLE","ok":false},{"id":"C","eq":"300*x=120","tag":"SWAP","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l2-007:q2": {"t":"solve","eq":"120*x=300","var":"x","sigs":["MULTDIV","FLIP","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l2-007:q3": {"t":"yn","eq":"120*x=300","var":"x","v":"2","order":["yes","no"]},
  "ex-2am-hall-mushkil-muadala-l2-008:q1": {"t":"steq","truth":"150/x=200","kind":"ldiv","var":"x","opts":[{"id":"A","eq":"200/x=150","tag":"SWAP","ok":false},{"id":"B","eq":"150/x=200","tag":null,"ok":true},{"id":"C","eq":"x/150=200","tag":"ROLE","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l2-008:q2": {"t":"solve","eq":"150/x=200","var":"x","sigs":["MULTDIV","RANK"]},
  "ex-2am-hall-mushkil-muadala-l2-008:q3": {"t":"yn","eq":"150/x=200","var":"x","v":"1.5","order":["yes","no"]},
  "ex-2am-hall-mushkil-muadala-l2-009:q1": {"t":"steq","truth":"720*x=2160","kind":"mul","var":"x","opts":[{"id":"A","eq":"2160*x=720","tag":"SWAP","ok":false},{"id":"B","eq":"x/720=2160","tag":"ROLE","ok":false},{"id":"C","eq":"720*x=2160","tag":null,"ok":true}]},
  "ex-2am-hall-mushkil-muadala-l2-009:q2": {"t":"steq","truth":"2160/x=720","kind":"ldiv","var":"x","opts":[{"id":"A","eq":"x/2160=720","tag":"ROLE","ok":false},{"id":"B","eq":"720/x=2160","tag":"SWAP","ok":false},{"id":"C","eq":"2160/x=720","tag":null,"ok":true}]},
  "ex-2am-hall-mushkil-muadala-l2-009:q3": {"t":"solve","eq":"720*x=2160","var":"x","sigs":["MULTDIV","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l2-010:q1": {"t":"solve","eq":"x-0.75=9","var":"x","sigs":["SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l2-010:q2": {"t":"solve","eq":"0.1*x=0.47","var":"x","sigs":["MULTDIV","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l2-010:q3": {"t":"solve","eq":"0.36/x=0.1","var":"x","sigs":["MULTDIV","SUBFORM","RANK"]},
  "ex-2am-hall-mushkil-muadala-l3-001:q1": {"t":"steq","truth":"48*x=720","kind":"mul","var":"x","opts":[{"id":"A","eq":"48*x=720","tag":null,"ok":true},{"id":"B","eq":"720*x=48","tag":"SWAP","ok":false},{"id":"C","eq":"x/48=720","tag":"ROLE","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l3-001:q2": {"t":"solve","eq":"48*x=720","var":"x","sigs":["MULTDIV","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l3-001:q3": {"t":"val","e":"6*x","env":{"x":"15"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l3-002:q1": {"t":"steq","truth":"12*x=480","kind":"mul","var":"x","opts":[{"id":"A","eq":"x/12=480","tag":"ROLE","ok":false},{"id":"B","eq":"480*x=12","tag":"SWAP","ok":false},{"id":"C","eq":"12*x=480","tag":null,"ok":true}]},
  "ex-2am-hall-mushkil-muadala-l3-002:q2": {"t":"solve","eq":"12*x=480","var":"x","sigs":["MULTDIV","FLIP","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l3-002:q3": {"t":"val","e":"2*(x+12)","env":{"x":"40"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l3-003:q1": {"t":"steq","truth":"15*x=825","kind":"mul","var":"x","opts":[{"id":"A","eq":"825*x=15","tag":"SWAP","ok":false},{"id":"B","eq":"x/15=825","tag":"ROLE","ok":false},{"id":"C","eq":"15*x=825","tag":null,"ok":true}]},
  "ex-2am-hall-mushkil-muadala-l3-003:q2": {"t":"solve","eq":"15*x=825","var":"x","sigs":["MULTDIV","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l3-003:q3": {"t":"val","e":"9*x","env":{"x":"55"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l3-004:q1": {"t":"steq","truth":"1.5*x=36","kind":"mul","var":"x","opts":[{"id":"A","eq":"x/1.5=36","tag":"ROLE","ok":false},{"id":"B","eq":"1.5*x=36","tag":null,"ok":true},{"id":"C","eq":"36*x=1.5","tag":"SWAP","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l3-004:q2": {"t":"solve","eq":"1.5*x=36","var":"x","sigs":["MULTDIV","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l3-004:q3": {"t":"val","e":"20*x","env":{"x":"24"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l3-005:q1": {"t":"steq","truth":"7.5/x=0.25","kind":"ldiv","var":"x","opts":[{"id":"A","eq":"x/7.5=0.25","tag":"ROLE","ok":false},{"id":"B","eq":"0.25/x=7.5","tag":"SWAP","ok":false},{"id":"C","eq":"7.5/x=0.25","tag":null,"ok":true}]},
  "ex-2am-hall-mushkil-muadala-l3-005:q2": {"t":"solve","eq":"7.5/x=0.25","var":"x","sigs":["MULTDIV","SUBFORM","RANK"]},
  "ex-2am-hall-mushkil-muadala-l3-005:q3": {"t":"val","e":"80*x","env":{"x":"30"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l3-006:q1": {"t":"steq","truth":"x/12=2.5","kind":"div","var":"x","opts":[{"id":"A","eq":"x/12=2.5","tag":null,"ok":true},{"id":"B","eq":"x+12=2.5","tag":"ADDFORM","ok":false},{"id":"C","eq":"12/x=2.5","tag":"ROLE","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l3-006:q2": {"t":"solve","eq":"x/12=2.5","var":"x","sigs":["ADDFORM","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l3-006:q3": {"t":"val","e":"x/15","env":{"x":"30"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l3-007:q1": {"t":"steq","truth":"8.5*x=127.5","kind":"mul","var":"x","opts":[{"id":"A","eq":"x/8.5=127.5","tag":"ROLE","ok":false},{"id":"B","eq":"127.5*x=8.5","tag":"SWAP","ok":false},{"id":"C","eq":"8.5*x=127.5","tag":null,"ok":true}]},
  "ex-2am-hall-mushkil-muadala-l3-007:q2": {"t":"solve","eq":"8.5*x=127.5","var":"x","sigs":["MULTDIV","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l3-007:q3": {"t":"val","e":"120*2*(x+8.5)","env":{"x":"15"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l3-008:q1": {"t":"steq","truth":"54/x=12","kind":"ldiv","var":"x","opts":[{"id":"A","eq":"x/54=12","tag":"ROLE","ok":false},{"id":"B","eq":"12/x=54","tag":"SWAP","ok":false},{"id":"C","eq":"54/x=12","tag":null,"ok":true}]},
  "ex-2am-hall-mushkil-muadala-l3-008:q2": {"t":"solve","eq":"54/x=12","var":"x","sigs":["MULTDIV","SUBFORM","RANK"]},
  "ex-2am-hall-mushkil-muadala-l3-008:q3": {"t":"val","e":"7*x","env":{"x":"4.5"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l3-009:q1": {"t":"steq","truth":"25*x=450","kind":"mul","var":"x","opts":[{"id":"A","eq":"450*x=25","tag":"SWAP","ok":false},{"id":"B","eq":"x/25=450","tag":"ROLE","ok":false},{"id":"C","eq":"25*x=450","tag":null,"ok":true}]},
  "ex-2am-hall-mushkil-muadala-l3-009:q2": {"t":"solve","eq":"25*x=450","var":"x","sigs":["MULTDIV","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l3-009:q3": {"t":"val","e":"7*x","env":{"x":"18"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l3-010:q1": {"t":"steq","truth":"9*x=13.5","kind":"mul","var":"x","opts":[{"id":"A","eq":"13.5*x=9","tag":"SWAP","ok":false},{"id":"B","eq":"x/9=13.5","tag":"ROLE","ok":false},{"id":"C","eq":"9*x=13.5","tag":null,"ok":true}]},
  "ex-2am-hall-mushkil-muadala-l3-010:q2": {"t":"solve","eq":"9*x=13.5","var":"x","sigs":["MULTDIV","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l3-010:q3": {"t":"val","e":"2*(9+x)","env":{"x":"1.5"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l4-001:q1": {"t":"solve","eq":"(x-2)/5=3.5","var":"x","sigs":["UNDOFIRST","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l4-001:q2": {"t":"solve","eq":"3*y+8=35","var":"y","sigs":["SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l4-001:q3": {"t":"val","e":"3*y+8","env":{"y":"9"},"from":"q2","xvar":"y"},
  "ex-2am-hall-mushkil-muadala-l4-002:q1": {"t":"perim","sides":["7","x","7","x"],"opts":[{"id":"A","a":"2*x+7","ok":false},{"id":"B","a":"x+14","ok":false},{"id":"C","a":"2*x+14","ok":true}]},
  "ex-2am-hall-mushkil-muadala-l4-002:q2": {"t":"solve","eq":"2*x+14=24","var":"x","sigs":["SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l4-002:q3": {"t":"val","e":"7*x","env":{"x":"5"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l4-003:q1": {"t":"solve","eq":"4*y+5=37","var":"y","sigs":["UNDOFIRST","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l4-003:q2": {"t":"solve","eq":"z/6=4","var":"z","sigs":["ADDFORM","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l4-003:q3": {"t":"solve","eq":"56/t=7","var":"t","sigs":["MULTDIV","FLIP","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l4-003:q4": {"t":"val","e":"y+z+t","env":{"y":"8","z":"24","t":"8"},"from":null,"xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l4-004:q1": {"t":"step","eq":"400*x+300=2700","var":"x","opts":[{"id":"A","eq":"x+300=6.75","tag":"UNDOFIRST","ok":false},{"id":"B","eq":"400*x=3000","tag":"ADDFORM","ok":false},{"id":"C","eq":"400*x=2400","tag":null,"ok":true}]},
  "ex-2am-hall-mushkil-muadala-l4-004:q2": {"t":"solve","eq":"400*x+300=2700","var":"x","sigs":["SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l4-004:q3": {"t":"val","e":"400*x+300","env":{"x":"6"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l4-005:q1": {"t":"step","eq":"2.5*x+4=19","var":"x","opts":[{"id":"A","eq":"2.5*x=15","tag":null,"ok":true},{"id":"B","eq":"2.5*x=23","tag":"ADDFORM","ok":false},{"id":"C","eq":"x+4=7.6","tag":"UNDOFIRST","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l4-005:q2": {"t":"solve","eq":"2.5*x+4=19","var":"x","sigs":["UNDOFIRST","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l4-005:q3": {"t":"val","e":"2.5*x+4","env":{"x":"6"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l4-006:q1": {"t":"step","eq":"(x+6)/4=9","var":"x","opts":[{"id":"A","eq":"x+6=2.25","tag":null,"ok":false},{"id":"B","eq":"x+6=36","tag":null,"ok":true},{"id":"C","eq":"x/4=3","tag":"UNDOFIRST","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l4-006:q2": {"t":"solve","eq":"(x+6)/4=9","var":"x","sigs":["UNDOFIRST","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l4-006:q3": {"t":"val","e":"(x+6)/4","env":{"x":"30"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l4-007:q1": {"t":"step","eq":"50*x-80=420","var":"x","opts":[{"id":"A","eq":"x-80=8.4","tag":"UNDOFIRST","ok":false},{"id":"B","eq":"50*x=500","tag":null,"ok":true},{"id":"C","eq":"50*x=340","tag":"SUBFORM","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l4-007:q2": {"t":"solve","eq":"50*x-80=420","var":"x","sigs":["UNDOFIRST","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l4-007:q3": {"t":"val","e":"50*x-80","env":{"x":"10"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l4-008:q1": {"t":"step","eq":"(x-3)/4=6","var":"x","opts":[{"id":"A","eq":"x-3=24","tag":null,"ok":true},{"id":"B","eq":"x/4=9","tag":"UNDOFIRST","ok":false},{"id":"C","eq":"x-3=1.5","tag":null,"ok":false}]},
  "ex-2am-hall-mushkil-muadala-l4-008:q2": {"t":"solve","eq":"(x-3)/4=6","var":"x","sigs":["UNDOFIRST","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l4-008:q3": {"t":"val","e":"(x-3)/4","env":{"x":"27"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l4-009:q1": {"t":"val","e":"3*x+7","env":{"x":"7"},"from":null,"xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l4-009:q2": {"t":"solve","eq":"3*x+7=31","var":"x","sigs":["SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l4-009:q3": {"t":"val","e":"3*x+7","env":{"x":"8"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l4-010:q1": {"t":"step","eq":"60*x+150=870","var":"x","opts":[{"id":"A","eq":"60*x=1020","tag":"ADDFORM","ok":false},{"id":"B","eq":"60*x=720","tag":null,"ok":true},{"id":"C","eq":"x+150=14.5","tag":"UNDOFIRST","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l4-010:q2": {"t":"solve","eq":"60*x+150=870","var":"x","sigs":["SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l4-010:q3": {"t":"val","e":"60*x+150","env":{"x":"12"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l5-001:q1": {"t":"perim","sides":["100","x","60","50","x+30"],"opts":[{"id":"A","a":"x+240","ok":false},{"id":"B","a":"2*x+140","ok":false},{"id":"C","a":"2*x+240","ok":true}]},
  "ex-2am-hall-mushkil-muadala-l5-001:q2": {"t":"solve","eq":"2*x+240=300","var":"x","sigs":["SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l5-001:q3": {"t":"val","e":"150*(2*x+240-2)","env":{"x":"30"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l5-001:q4": {"t":"cmp","e":"150*(2*x+240-2)","env":{"x":"30"},"op":"<=","b":"45000","order":["yes","no"],"from":"q2"},
  "ex-2am-hall-mushkil-muadala-l5-002:q1": {"t":"perim","sides":["80","x","40","50","x+30"],"opts":[{"id":"A","a":"x+200","ok":false},{"id":"B","a":"2*x+120","ok":false},{"id":"C","a":"2*x+200","ok":true}]},
  "ex-2am-hall-mushkil-muadala-l5-002:q2": {"t":"solve","eq":"2*x+200=240","var":"x","sigs":["SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l5-002:q3": {"t":"val","e":"120*(2*x+200-3)","env":{"x":"20"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l5-002:q4": {"t":"cmp","e":"120*(2*x+200-3)","env":{"x":"20"},"op":"<=","b":"28000","order":["yes","no"],"from":"q2"},
  "ex-2am-hall-mushkil-muadala-l5-003:q1": {"t":"perim","sides":["x","x+8","x","x+8"],"opts":[{"id":"A","a":"4*x+16","ok":true},{"id":"B","a":"3*x+16","ok":false},{"id":"C","a":"4*x+26","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l5-003:q2": {"t":"solve","eq":"4*x+16=96","var":"x","sigs":["UNDOFIRST","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l5-003:q3": {"t":"val","e":"200*(4*x+16-4)","env":{"x":"20"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l5-003:q4": {"t":"cmp","e":"200*(4*x+16-4)","env":{"x":"20"},"op":"<=","b":"20000","order":["no","yes"],"from":"q2"},
  "ex-2am-hall-mushkil-muadala-l5-004:q1": {"t":"perim","sides":["x","25","x","25"],"opts":[{"id":"A","a":"2*x+60","ok":false},{"id":"B","a":"2*x+50","ok":true},{"id":"C","a":"x+50","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l5-004:q2": {"t":"solve","eq":"2*x+50=130","var":"x","sigs":["UNDOFIRST","SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l5-004:q3": {"t":"val","e":"90*(2*x+50)","env":{"x":"40"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l5-004:q4": {"t":"cmp","e":"90*(2*x+50)","env":{"x":"40"},"op":"<=","b":"11000","order":["no","yes"],"from":"q2"},
  "ex-2am-hall-mushkil-muadala-l5-005:q1": {"t":"perim","sides":["x","x+5","x","x+5","30"],"opts":[{"id":"A","a":"3*x+40","ok":false},{"id":"B","a":"4*x+50","ok":false},{"id":"C","a":"4*x+40","ok":true}]},
  "ex-2am-hall-mushkil-muadala-l5-005:q2": {"t":"solve","eq":"4*x+40=120","var":"x","sigs":["SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l5-005:q3": {"t":"val","e":"110*(4*x+40-5)","env":{"x":"20"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l5-005:q4": {"t":"cmp","e":"110*(4*x+40-5)","env":{"x":"20"},"op":"<=","b":"13000","order":["no","yes"],"from":"q2"},
  "ex-2am-hall-mushkil-muadala-l5-006:q1": {"t":"perim","sides":["x","2*x","x","2*x"],"opts":[{"id":"A","a":"5*x","ok":false},{"id":"B","a":"6*x","ok":true},{"id":"C","a":"6*x+10","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l5-006:q2": {"t":"solve","eq":"6*x=150","var":"x","sigs":["MULTDIV","FLIP","SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l5-006:q3": {"t":"val","e":"100*(6*x-2)","env":{"x":"25"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l5-006:q4": {"t":"cmp","e":"100*(6*x-2)","env":{"x":"25"},"op":"<=","b":"14500","order":["yes","no"],"from":"q2"},
  "ex-2am-hall-mushkil-muadala-l5-007:q1": {"t":"perim","sides":["60","x","35","x+15","20"],"opts":[{"id":"A","a":"x+130","ok":false},{"id":"B","a":"2*x+70","ok":false},{"id":"C","a":"2*x+130","ok":true}]},
  "ex-2am-hall-mushkil-muadala-l5-007:q2": {"t":"solve","eq":"2*x+130=190","var":"x","sigs":["SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l5-007:q3": {"t":"val","e":"80*(2*x+130-2)","env":{"x":"30"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l5-007:q4": {"t":"cmp","e":"80*(2*x+130-2)","env":{"x":"30"},"op":"<=","b":"15000","order":["no","yes"],"from":"q2"},
  "ex-2am-hall-mushkil-muadala-l5-008:q1": {"t":"perim","sides":["x","45","x","45","20"],"opts":[{"id":"A","a":"x+110","ok":false},{"id":"B","a":"2*x+120","ok":false},{"id":"C","a":"2*x+110","ok":true}]},
  "ex-2am-hall-mushkil-muadala-l5-008:q2": {"t":"solve","eq":"2*x+110=170","var":"x","sigs":["SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l5-008:q3": {"t":"val","e":"130*(2*x+110-3)","env":{"x":"30"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l5-008:q4": {"t":"cmp","e":"130*(2*x+110-3)","env":{"x":"30"},"op":"<=","b":"22000","order":["no","yes"],"from":"q2"},
  "ex-2am-hall-mushkil-muadala-l5-009:q1": {"t":"perim","sides":["2*x","30","2*x","30"],"opts":[{"id":"A","a":"4*x+60","ok":true},{"id":"B","a":"3*x+60","ok":false},{"id":"C","a":"4*x+70","ok":false}]},
  "ex-2am-hall-mushkil-muadala-l5-009:q2": {"t":"solve","eq":"4*x+60=200","var":"x","sigs":["SUBFORM","ADDFORM"]},
  "ex-2am-hall-mushkil-muadala-l5-009:q3": {"t":"val","e":"95*(4*x+60-4)","env":{"x":"35"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l5-009:q4": {"t":"cmp","e":"95*(4*x+60-4)","env":{"x":"35"},"op":"<=","b":"18000","order":["no","yes"],"from":"q2"},
  "ex-2am-hall-mushkil-muadala-l5-010:q1": {"t":"perim","sides":["x","x+12","50","x","38"],"opts":[{"id":"A","a":"2*x+100","ok":false},{"id":"B","a":"3*x+110","ok":false},{"id":"C","a":"3*x+100","ok":true}]},
  "ex-2am-hall-mushkil-muadala-l5-010:q2": {"t":"solve","eq":"3*x+100=190","var":"x","sigs":["SUBFORM"]},
  "ex-2am-hall-mushkil-muadala-l5-010:q3": {"t":"val","e":"140*(3*x+100-2)","env":{"x":"30"},"from":"q2","xvar":"x"},
  "ex-2am-hall-mushkil-muadala-l5-010:q4": {"t":"cmp","e":"140*(3*x+100-2)","env":{"x":"30"},"op":"<=","b":"26500","order":["yes","no"],"from":"q2"}
};
const PROV = {
  "ex-2am-hall-mushkil-muadala-l1-001": {"t":"tt","grade":"2am","sem":2,"file":"2am-s2-72","ex":2},
  "ex-2am-hall-mushkil-muadala-l1-002": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l1-003": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l1-004": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l1-005": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l1-006": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l1-007": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l1-008": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l1-009": {"t":"ad","el":"self-11"},
  "ex-2am-hall-mushkil-muadala-l1-010": {"t":"ad","el":"ex-39"},
  "ex-2am-hall-mushkil-muadala-l2-001": {"t":"tt","grade":"2am","sem":2,"file":"2am-s2-50","ex":2},
  "ex-2am-hall-mushkil-muadala-l2-002": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l2-003": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l2-004": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l2-005": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l2-006": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l2-007": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l2-008": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l2-009": {"t":"ad","el":"act-4"},
  "ex-2am-hall-mushkil-muadala-l2-010": {"t":"ad","el":"ex-37"},
  "ex-2am-hall-mushkil-muadala-l3-001": {"t":"tt","grade":"2am","sem":3,"file":"2am-s3-25","ex":2},
  "ex-2am-hall-mushkil-muadala-l3-002": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l3-003": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l3-004": {"t":"mod","sem":3},
  "ex-2am-hall-mushkil-muadala-l3-005": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l3-006": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l3-007": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l3-008": {"t":"mod","sem":3},
  "ex-2am-hall-mushkil-muadala-l3-009": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l3-010": {"t":"ad","el":"deep-56"},
  "ex-2am-hall-mushkil-muadala-l4-001": {"t":"tt","grade":"2am","sem":2,"file":"1am-s2-79","ex":2},
  "ex-2am-hall-mushkil-muadala-l4-002": {"t":"tt","grade":"2am","sem":2,"file":"2am-s2-75","ex":5},
  "ex-2am-hall-mushkil-muadala-l4-003": {"t":"tt","grade":"2am","sem":3,"file":"2am-s3-25","ex":5},
  "ex-2am-hall-mushkil-muadala-l4-004": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l4-005": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l4-006": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l4-007": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l4-008": {"t":"mod","sem":3},
  "ex-2am-hall-mushkil-muadala-l4-009": {"t":"ad","el":"deep-53"},
  "ex-2am-hall-mushkil-muadala-l4-010": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l5-001": {"t":"tt","grade":"2am","sem":2,"file":"2am-s2-50","ex":5},
  "ex-2am-hall-mushkil-muadala-l5-002": {"t":"tt","grade":"2am","sem":2,"file":"2am-s2-73","ex":5},
  "ex-2am-hall-mushkil-muadala-l5-003": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l5-004": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l5-005": {"t":"mod","sem":3},
  "ex-2am-hall-mushkil-muadala-l5-006": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l5-007": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l5-008": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l5-009": {"t":"mod","sem":2},
  "ex-2am-hall-mushkil-muadala-l5-010": {"t":"mod","sem":3}
};
const READ = { '2am-s2-72': [2], '2am-s2-50': [2, 5], '2am-s2-73': [5], '2am-s2-75': [5], '1am-s2-79': [2], '2am-s3-25': [2, 5] };
const EXPECTED = { 1: [1, 7, 2], 2: [1, 7, 2], 3: [1, 8, 1], 4: [3, 6, 1], 5: [2, 8, 0] };
const MISC = (t) => `MISC-MAJHUL-${t}`;
const LP = (n) => `2am_hall-mushkil-muadala_P${n}`;
const BADGE = { 2: 'على منوال اختبار الفصل الثاني', 3: 'على منوال اختبار الفصل الثالث' };
const sheetOf = (key) => key.split(':')[0];

/** Jugement d'une question : { answer, problems, info }. `keyOf(qid)` donne la valeur d'une question de la même feuille. */
function judge(S, keyOf) {
  const problems = []; let answer = null; const info = {};
  if (S.t === 'solve') {
    const E = eqOf(S.eq); const { x, steps } = solveChain(E);
    if (!holds(E, x)) problems.push('la valeur trouvée ne vérifie pas l\'équation');
    if (!isDec(x)) problems.push('solution non décimale');
    answer = R(D(x)); info.key = x; info.steps = steps;
    const { r } = readings(E); info.sigs = [];
    for (const tag of S.sigs) { if (!(tag in r)) { problems.push(`recette ${tag} inexistante`); continue; } if (!legal(E, x, r[tag])) problems.push(`signature ${tag} illégale (négative, non décimale, = clé ou solution)`); else info.sigs.push([D(r[tag]), MISC(tag)]); }
    const vals = info.sigs.map(([v]) => v); if (new Set([...vals, D(x)]).size !== vals.length + 1) problems.push('deux signatures égales entre elles ou à la clé');
  } else if (S.t === 'pick') {
    const E = eqOf(S.eq); const { x } = solveChain(E); const { r } = readings(E); info.opts = [];
    for (const o of S.opts) {
      const v = dq(o.v); const isOK = holds(E, v); const pb = [];
      if (o.tag) { if (!(o.tag in r)) pb.push(`recette ${o.tag} inexistante`); else if (!v.eq(r[o.tag])) pb.push(`option ${o.id} ≠ lecture ${o.tag}`); if (isOK) pb.push(`option ${o.id} balisée ${o.tag} mais VRAIE`); }
      else if (!isOK) pb.push(`option ${o.id} fausse sans balise`);
      if (o.tag && !legal(E, x, v)) pb.push(`option ${o.id} : lecture illégale`);
      info.opts.push({ ...o, isOK, pb });
    }
    for (const o of info.opts) problems.push(...o.pb);
    const ok = info.opts.filter((o) => o.isOK); if (ok.length !== 1 || ok[0].tag) problems.push(`${ok.length} options vraies`); else answer = C(ok[0].id);
    if (new Set(S.opts.map((o) => o.v)).size !== S.opts.length) problems.push('deux options égales');
  } else if (S.t === 'yn') {
    const E = eqOf(S.eq); const yes = holds(E, dq(S.v));
    answer = C(S.order.map((w, i) => [w, 'AB'[i]]).find(([w]) => (w === 'yes') === yes)[1]); info.yes = yes;
  } else if (S.t === 'steq') {
    const T = eqOf(S.truth); const x0 = solveChain(T).x; const rec = storyReadings(T); info.opts = [];
    for (const o of S.opts) {
      const E = eqOf(o.eq); const isOK = holds(E, x0); const pb = [];
      if (o.ok !== sameEq(E, T)) pb.push(`option ${o.id} : ok déclaré ≠ égalité avec la vérité`);
      if (o.tag) { if (!rec[o.tag]) pb.push(`recette ${o.tag} inexistante`); else if (!sameEq(E, eqOf(rec[o.tag]))) pb.push(`option ${o.id} ≠ lecture ${o.tag} (${rec[o.tag]})`); if (isOK) pb.push(`option ${o.id} balisée ${o.tag} mais VRAIE`); }
      else if (!isOK && !o.ok) pb.push(`option ${o.id} fausse sans balise`);
      info.opts.push({ ...o, isOK, pb });
    }
    for (const o of info.opts) problems.push(...o.pb);
    const ok = info.opts.filter((o) => o.isOK); if (ok.length !== 1) problems.push(`${ok.length} équations vraies`); else answer = C(ok[0].id);
  } else if (S.t === 'step') {
    const E = eqOf(S.eq); const x0 = solveChain(E).x; const rec = stepReadings(E); info.opts = [];
    for (const o of S.opts) {
      const O = eqOf(o.eq); const isOK = holds(O, x0); const pb = [];
      if (o.tag) { if (!rec[o.tag]) pb.push(`recette ${o.tag} inexistante`); else if (!sameEq(O, eqOf(rec[o.tag]))) pb.push(`option ${o.id} ≠ lecture ${o.tag} (${rec[o.tag]})`); if (isOK) pb.push(`option ${o.id} balisée ${o.tag} mais VRAIE`); }
      else if (!isOK) for (const [tg, rs] of Object.entries(rec)) if (tg !== 'TRUTH' && sameEq(O, eqOf(rs))) pb.push(`option ${o.id} sans balise reproduit la lecture ${tg}`);
      if (isOK && !sameEq(O, eqOf(rec.TRUTH))) pb.push(`option ${o.id} vraie mais ≠ équation après annulation de la dernière opération`);
      info.opts.push({ ...o, isOK, pb });
    }
    for (const o of info.opts) problems.push(...o.pb);
    const ok = info.opts.filter((o) => o.isOK); if (ok.length !== 1) problems.push(`${ok.length} équations vraies`); else answer = C(ok[0].id);
  } else if (S.t === 'val') {
    const env = envQ(S.env); if (S.from) env[S.xvar] = keyOf(S.from);
    const key = ev(parse(S.e), env); if (!isDec(key)) problems.push('valeur non décimale');
    answer = R(D(key)); info.key = key; info.env = env;
  } else if (S.t === 'cmp') {
    const env = envQ(S.env); if (S.from) env.x = keyOf(S.from);
    const a = ev(parse(S.e), env); const b = dq(S.b);
    const yes = { '<': a.n * b.d < b.n * a.d, '<=': a.n * b.d <= b.n * a.d, '>': a.n * b.d > b.n * a.d, '>=': a.n * b.d >= b.n * a.d }[S.op];
    answer = C(S.order.map((w, i) => [w, 'AB'[i]]).find(([w]) => (w === 'yes') === yes)[1]); info.yes = yes; info.a = a;
  } else if (S.t === 'perim') {
    // somme des côtés (chacun affine en x) ; options affines comparées par coefficients
    const tot = S.sides.map(affine).reduce((p, q) => ({ m: p.m.add(q.m), c: p.c.add(q.c) }), { m: ZERO, c: ZERO }); info.tot = tot; info.opts = [];
    for (const o of S.opts) { const f = affine(o.a); info.opts.push({ ...o, isOK: f.m.eq(tot.m) && f.c.eq(tot.c), f }); }
    const ok = info.opts.filter((o) => o.isOK); if (ok.length !== 1) problems.push(`${ok.length} expressions vraies`); else answer = C(ok[0].id);
    for (const o of info.opts) if (o.isOK !== o.ok) problems.push(`option ${o.id} : « ok » déclaré ≠ calcul`);
    if (new Set(info.opts.map((o) => `${D(o.f.m)}|${D(o.f.c)}`)).size !== info.opts.length) problems.push('deux expressions égales');
  } else problems.push(`type ${S.t}`);
  return { answer, problems, info };
}

/* ── ORACLE : la clé de chaque question, calculée ici ── */
const keysOfSheet = (id) => (qid) => { const S = SPEC[`${id}:${qid}`]; if (!S) throw new Error(`${id}:${qid} inconnue`); const { info } = judge(S, keysOfSheet(id)); if (!info.key) throw new Error(`${id}:${qid} n'est pas une valeur`); return info.key; };
export const ORACLE = {};
for (const [key, S] of Object.entries(SPEC)) { const { answer } = judge(S, keysOfSheet(sheetOf(key))); if (answer) ORACLE[key] = answer; }

/* ── audit ── */
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const AR = '\\u0621-\\u064A';
const FORBIDDEN = new RegExp(`(?<![${AR}])(?:خنزير|خمر|نبيذ|بيرة|كحول|قمار|ميسر|يانصيب|ورق اللعب|أوراق اللعب|نرد|كازينو|ربا|فوائد|رأس السنة|عيد الميلاد|الكتاب|كتاب|الكتاب المدرسي|المنهاج)(?![${AR}])|🐷|ص\\s*\\d|صفحة`);
const islands = (t) => [...String(t ?? '').matchAll(/\$([^$]*)\$/g)].map((m) => m[1]);
const outside = (t) => String(t ?? '').replace(/\$[^$]*\$( DA)?/g, '');
/** LaTeX → ASCII de l'oracle (fractions \dfrac{A}{B} → (A)/(B), \times → *, \div → /, {,} → .). */
function texToAscii(t) {
  let s = String(t).replace(/\\,/g, '').replace(/\\ /g, '').replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\\mathrm\{[^}]*\}(\^\{\d\})?/g, '');
  for (;;) {
    const i = s.search(/\\d?frac\{/); if (i < 0) break;
    const open = s.indexOf('{', i); let depth = 0; let j = open;
    for (; j < s.length; j++) { if (s[j] === '{') depth++; if (s[j] === '}') { depth--; if (depth === 0) break; } }
    const A = s.slice(open + 1, j); const open2 = j + 1; let d2 = 0; let k = open2;
    for (; k < s.length; k++) { if (s[k] === '{') d2++; if (s[k] === '}') { d2--; if (d2 === 0) break; } }
    const B = s.slice(open2 + 1, k); s = `${s.slice(0, i)}(${A})/(${B})${s.slice(k + 1)}`;
  }
  return s.replace(/\s+/g, '').replace(/(\d)([a-z(])/g, '$1*$2').replace(/(\))(\d|[a-z(])/g, '$1*$2');
}
const numbersIn = (t) => new Set(islands(t).flatMap((i) => texToAscii(i).match(/\d+(?:\.\d+)?/g) ?? []).map((n) => D(dq(n))));

export function audit(bank) {
  const problems = []; const P_ = (key, msg) => problems.push(`${key} : ${msg}`);
  const dir = join(root, 'content/practice/2am/hall-mushkil-muadala');
  const sheets = {};
  for (const lv of readdirSync(dir)) for (const f of readdirSync(join(dir, lv))) { const ex = JSON.parse(readFileSync(join(dir, lv, f), 'utf8')); sheets[ex.id] = ex; }
  const miscs = JSON.parse(readFileSync(join(root, 'content/practice/misconceptions.json'), 'utf8'));
  const extraction = JSON.parse(readFileSync(join(root, 'docs/sources/2am/unit4/extraction.json'), 'utf8'));
  let firstOfThree = 0; let threeOpt = 0;
  for (const { key, q } of bank) {
    const id = sheetOf(key); const sh = sheets[id]; const S = SPEC[key];
    if (!S) { P_(key, 'aucune spec'); continue; }
    if (!sh) { P_(key, 'feuille introuvable'); continue; }
    let j; try { j = judge(S, keysOfSheet(id)); } catch (err) { P_(key, `jugement impossible : ${err.message}`); continue; }
    for (const m of j.problems) P_(key, m);
    const qtext = [sh.statement.content, q.statement].join(' ');
    const nums = numbersIn(qtext);
    if (![LP(1), LP(2), LP(3)].includes(q.learningPoints?.[0]?.code)) P_(key, 'code de la كفاءة');
    if ((S.t === 'perim') !== (q.counted === false)) P_(key, '`counted: false` réservé à l\'étape « expression du périmètre »');
    const miscOf = (tag) => { if (!miscs[MISC(tag)]) P_(key, `${MISC(tag)} absent de misconceptions.json`); return MISC(tag); };
    const eqShown = (asc, text) => islands(text).some((i) => { try { return sameEq(eqOf(texToAscii(i)), eqOf(asc)); } catch { return false; } });

    if (S.t === 'solve' || S.t === 'val') {
      if (q.answerType !== 'rational') P_(key, 'une valeur est `rational`');
      if (q.expectedAnswer !== D(j.info.key)) P_(key, `l'oracle trouve ${D(j.info.key)}, la feuille ${q.expectedAnswer}`);
      if (q.solution?.result !== D(j.info.key).replace('.', '{,}')) P_(key, `résultat du corrigé ${q.solution?.result}`);
      if (S.t === 'solve') {
        if (!eqShown(S.eq, qtext)) P_(key, `l'équation « ${S.eq} » n'est pas dans l'énoncé`);
        const have = (q.misconceptionSignatures ?? []).map((x) => `${x.value}|${x.id}`).sort(); const want = j.info.sigs.map(([v, i]) => `${v}|${i}`).sort();
        if (JSON.stringify(have) !== JSON.stringify(want)) P_(key, `signatures ${have.join(' ; ')} ≠ attendues ${want.join(' ; ')}`);
        for (const [, i] of j.info.sigs) if (!miscs[i]) P_(key, `${i} absent`);
        // chaîne du corrigé : chaque étape ≥ 0 recalculée par annulation ; les nombres écrits dans le corrigé sont ceux des étapes
        const solNums = numbersIn((q.solution?.lines ?? []).join(' '));
        for (const st of j.info.steps) if (!solNums.has(D(st))) P_(key, `étape ${D(st)} absente du corrigé`);
        if (!(q.solution?.lines ?? []).some((l) => /التحقّق/.test(l))) P_(key, 'le corrigé ne vérifie pas la solution');
      } else {
        // l'expression du corrigé, évaluée avec les valeurs, vaut la clé
        const first = islands(q.solution?.lines?.[0] ?? '')[0] ?? ''; const left = texToAscii(first.split('=')[0]);
        try {
          const env = { ...j.info.env }; const got = ev(parse(left), env);
          if (!got.eq(j.info.key)) P_(key, `le calcul du corrigé « ${left} » vaut ${D(got)}, pas ${D(j.info.key)}`);
        } catch (err) { P_(key, `calcul du corrigé illisible : ${err.message}`); }
        // les nombres de l'expression sont donnés dans l'énoncé (ou sont la solution d'une question précédente de la feuille)
        const lits = (S.e.match(/\d+(?:\.\d+)?/g) ?? []).map((n) => D(dq(n)));
        const prevSol = new Set([...Object.values(j.info.env ?? {})].map(D));
        for (const [k2, v2] of Object.entries(SPEC)) if (k2.startsWith(`${id}:`) && v2.t === 'perim') { const tt = v2.sides.map(affine).reduce((p, q2) => ({ m: p.m.add(q2.m), c: p.c.add(q2.c) }), { m: ZERO, c: ZERO }); prevSol.add(D(tt.m)); prevSol.add(D(tt.c)); }
        for (const l of lits) if (!nums.has(l) && !prevSol.has(l)) P_(key, `le nombre ${l} de « ${S.e} » n'est pas donné dans l'énoncé`);
        const sheetKeys = new Set(Object.entries(SPEC).filter(([k, v]) => k.startsWith(`${id}:`) && v.t === 'solve').map(([k]) => D(solveChain(eqOf(SPEC[k].eq)).x)));
        if (!S.from) for (const [l, v] of Object.entries(S.env)) if (!numbersIn(qtext).has(D(dq(v))) && !sheetKeys.has(D(dq(v)))) P_(key, `la valeur ${l} = ${v} n'est pas dans l'énoncé ni la solution d'une question de la feuille`);
      }
    } else if (S.t === 'pick' || S.t === 'steq' || S.t === 'step' || S.t === 'perim') {
      if (q.answerType !== 'choice') P_(key, 'un QCM est `choice`');
      if (q.choices.length !== S.opts.length) P_(key, 'nombre de choix');
      if (S.opts.length === 3) { threeOpt++; if (q.choices[0].isCorrect) firstOfThree++; }
      for (const o of S.opts) {
        const c = q.choices.find((x) => x.id === o.id); if (!c) { P_(key, `choix ${o.id} absent`); continue; }
        const should = j.answer.choiceId === o.id; if (c.isCorrect !== should) P_(key, `choix ${o.id} : isCorrect ${c.isCorrect}, l'oracle ${should}`);
        const wantMisc = o.tag ? miscOf(o.tag) : undefined; if ((c.misconceptionId ?? undefined) !== wantMisc) P_(key, `choix ${o.id} : misconceptionId ${c.misconceptionId} ≠ ${wantMisc}`);
        const isl = islands(c.content);
        if (S.t === 'pick' && texToAscii(isl[0] ?? '') !== D(dq(o.v))) P_(key, `choix ${o.id} : « ${c.content} » ≠ ${o.v}`);
        if ((S.t === 'steq' || S.t === 'step') && !(isl[0] && sameEq(eqOf(texToAscii(isl[0])), eqOf(o.eq)))) P_(key, `choix ${o.id} : « ${c.content} » ≠ ${o.eq}`);
        if (S.t === 'perim') { try { const f = affine(texToAscii(isl[0] ?? '')); const g = affine(o.a); if (!(f.m.eq(g.m) && f.c.eq(g.c))) P_(key, `choix ${o.id} : « ${c.content} » ≠ ${o.a}`); } catch { P_(key, `choix ${o.id} illisible`); } }
      }
      if (S.t === 'pick' || S.t === 'step') { if (!eqShown(S.eq, qtext)) P_(key, `l'équation « ${S.eq} » n'est pas dans l'énoncé`); }
      if (S.t === 'steq') {
        // l'équation de la vérité est celle de la question de résolution suivante, et ses nombres sont donnés (ou sont un produit de deux nombres donnés)
        const nx = SPEC[`${id}:q${Number(key.split(':')[1].slice(1)) + 1}`]; const T = eqOf(S.truth);
        if (nx && nx.t === 'solve' && !solveChain(eqOf(nx.eq)).x.eq(solveChain(T).x)) P_(key, 'la résolution qui suit ne donne pas la solution de l\'équation de la vérité');
        const F = formOf(T); const given = [...nums].map(dq);
        for (const n of [F.a, F.b]) if (!given.some((g) => g.eq(n)) && !given.some((g) => given.some((h) => g.mul(h).eq(n)))) P_(key, `le nombre ${D(n)} n'est ni donné ni produit de deux nombres donnés`);
      }
      if (S.t === 'perim') {
        for (const s of S.sides) for (const n of s.match(/\d+(?:\.\d+)?/g) ?? []) { const w = D(dq(n)); if (!numbersIn(sh.statement.content).has(w)) P_(key, `le nombre ${w} du côté « ${s} » n'est pas dans l'énoncé`); }
        const nx = SPEC[`${id}:q${Number(key.split(':')[1].slice(1)) + 1}`];
        if (nx && nx.t === 'solve') { const F = formOf(eqOf(nx.eq)); const got = F.f === 'lin' ? { m: F.m, c: F.c } : F.f === 'mul' ? { m: F.a, c: ZERO } : { m: ONE, c: F.a }; if (!(got.m.eq(j.info.tot.m) && got.c.eq(j.info.tot.c))) P_(key, 'l\'équation de la question suivante n\'est pas « périmètre = valeur »'); }
      }
    } else if (S.t === 'yn' || S.t === 'cmp') {
      if (q.answerType !== 'choice' || q.choices.length !== 2) P_(key, 'oui / non : deux choix');
      for (const w of ['yes', 'no']) { const i = S.order.indexOf(w); const c = q.choices[i]; if (c?.content !== (w === 'yes' ? 'نعم' : 'لا')) P_(key, `ordre des choix ${w}`); if (c?.isCorrect !== (j.info.yes === (w === 'yes'))) P_(key, `choix « ${w} » : isCorrect`); }
      if (S.t === 'yn') { if (!eqShown(S.eq, qtext)) P_(key, `l'équation « ${S.eq} » n'est pas dans l'énoncé`); if (!numbersIn(q.statement).has(D(dq(S.v)))) P_(key, `la valeur ${S.v} n'est pas dans l'énoncé`); }
      if (S.t === 'cmp') { if (!numbersIn(q.statement).has(D(dq(S.b)))) P_(key, `le seuil ${S.b} n'est pas dans l'énoncé`); if (j.info.a.n < 0n) P_(key, 'valeur négative'); }
    }
    // hints : au moins trois, sans chiffre (aucune fuite de la réponse)
    if ((q.hints ?? []).length !== 3) P_(key, '3 indices attendus');
    /* --- texte : bidi, unités, mots interdits, manuel --- */
    const strings = [['énoncé', q.statement], ['feedback.correct', q.feedback?.correct], ['feedback.incorrect', q.feedback?.incorrect], ...(q.hints ?? []).map((h) => ['indice', h.content]), ...(q.choices ?? []).map((c) => ['choix', c.content]), ...(q.solution?.lines ?? []).map((l) => ['corrigé', l])];
    for (const [w, t] of strings) {
      if (FORBIDDEN.test(String(t))) P_(key, `${w} : texte interdit`);
      const o = outside(t);
      if (/\d/.test(o)) P_(key, `${w} : chiffre hors $…$`);
      if (/[A-Za-z]/.test(o)) P_(key, `${w} : lettre latine hors $…$ (« ${o.trim().slice(0, 40)} »)`);
      for (const i of islands(t)) {
        if (/\\mathrm\{[^}]*\}/.test(i) && !/\d\\,\\mathrm/.test(i)) P_(key, `${w} : unité sans « valeur\\,\\mathrm » dans $${i}$`);
        if (/(?:^|[^\\a-zA-Z])(?:kg|cm|km|dm|m|L)(?![a-zA-Z{])/.test(i.replace(/\\mathrm\{[^}]*\}/g, '').replace(/\\[a-zA-Z]+/g, '')) && !/^[a-z]$/.test(i)) { /* lettres m / L peuvent être des inconnues : seul « kg|cm|km|dm » est refusé nu */ if (/(?:kg|cm|km|dm)/.test(i.replace(/\\mathrm\{[^}]*\}/g, ''))) P_(key, `${w} : unité nue dans $${i}$`); }
        if (/(?:^|[=(\s]|\\times|\+)-\d/.test(i)) P_(key, `${w} : nombre négatif dans $${i}$`);
      }
    }
  }
  if (threeOpt > 0 && firstOfThree > threeOpt * 0.5) P_('banc', `la bonne option est la première dans ${firstOfThree} / ${threeOpt} QCM à trois choix`);
  /* --- feuilles : titres, métadonnées, provenance --- */
  const els = Object.fromEntries(extraction.elements.map((e) => [e.id, e]));
  const L = (n) => Object.values(sheets).filter((x) => x.level === n);
  const seenPart = new Set(); const seenEl = new Set();
  for (let lv = 1; lv <= 5; lv++) {
    const got = [L(lv).filter((x) => x.metadata.source.type === 'term_exam').length, L(lv).filter((x) => x.metadata.source.type === 'platform_addition').length, L(lv).filter((x) => x.metadata.source.type === 'textbook').length];
    if (L(lv).length !== 10) problems.push(`niveau ${lv} : ${L(lv).length} feuilles`);
    if (JSON.stringify(got) !== JSON.stringify(EXPECTED[lv])) problems.push(`niveau ${lv} : term_exam / modelled / adaptés = ${got} ≠ ${EXPECTED[lv]}`);
    if (L(lv).some((x) => x.metadata.exam.heading !== (lv === 5 ? 'الوضعية الإدماجية' : 'التمرين'))) problems.push(`niveau ${lv} : intitulé d'épreuve`);
  }
  for (const [id, ex] of Object.entries(sheets)) {
    const pv = PROV[id]; const s = ex.metadata.source;
    if (!pv) { problems.push(`${id} : provenance non déclarée`); continue; }
    for (const t of [ex.metadata.title, ...(ex.metadata.tags ?? []), ex.statement.content]) if (t && (FORBIDDEN.test(t))) problems.push(`${id} : texte interdit dans « ${String(t).slice(0, 50)} »`);
    if (/\d/.test(outside(ex.statement.content))) problems.push(`${id} : chiffre hors $…$ dans l'énoncé`);
    if (/[A-Za-z]/.test(outside(ex.statement.content))) problems.push(`${id} : lettre latine hors $…$ dans l'énoncé`);
    for (const i of islands(ex.statement.content)) if (/\\mathrm\{[^}]*\}/.test(i) && !/\d\\,\\mathrm/.test(i)) problems.push(`${id} : unité sans valeur dans $${i}$`);
    if (pv.t === 'tt') {
      const sem = pv.sem; const part = `${pv.file}#${pv.ex}`;
      if (!READ[pv.file]?.includes(pv.ex)) problems.push(`${id} : ${part} n'est pas une partie lue`);
      if (seenPart.has(part)) problems.push(`${id} : ${part} citée deux fois en term_exam`); seenPart.add(part);
      if (s.type !== 'term_exam' || s.grade !== '2am' || s.semester !== sem || s.file !== pv.file || s.exercise !== pv.ex) problems.push(`${id} : source term_exam ≠ ${pv.file} ex ${pv.ex}`);
      if (ex.metadata.exam.badge !== BADGE[sem] || ex.metadata.exam.kind !== 'modelled') problems.push(`${id} : badge / kind`);
    } else if (pv.t === 'mod') {
      if (s.type !== 'platform_addition' || s.reason !== 'term_exam_modelled' || s.modelledOn !== `2am-s${pv.sem}`) problems.push(`${id} : provenance modelled mal formée`);
      if (ex.metadata.exam.badge !== BADGE[pv.sem] || ex.metadata.exam.kind !== 'modelled') problems.push(`${id} : badge / kind`);
    } else {
      const el = els[pv.el]; seenEl.add(pv.el);
      if (s.type !== 'textbook' || s.elementId !== pv.el) problems.push(`${id} : élément ${s.elementId} ≠ ${pv.el}`);
      if (!el) problems.push(`${id} : élément ${pv.el} absent de l'extraction`);
      else {
        if (extraction.destinations[pv.el]?.lesson !== 'hall-mushkil-muadala') problems.push(`${id} : ${pv.el} n'a pas cette leçon pour destination`);
        if (s.page !== el.page || s.number !== el.number || s.section !== el.section) problems.push(`${id} : page / numéro / section de ${pv.el} ≠ extraction`);
      }
      if (ex.metadata.exam.kind !== 'adapted' || ex.metadata.exam.badge !== null) problems.push(`${id} : adapted sans badge`);
    }
  }
  if (seenEl.size !== 6) problems.push(`éléments adaptés cités : ${[...seenEl].join(',')}`);
  return problems;
}
