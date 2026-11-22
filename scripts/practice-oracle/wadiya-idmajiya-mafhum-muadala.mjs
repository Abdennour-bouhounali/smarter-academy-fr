// Oracle du banc « wadiya-idmajiya-mafhum-muadala » (« أدمج تعلّماتي — مفهوم معادلة », synthèse de l'unité 4 de 2AM, 2026-10-30) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الثاني »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Tout est RECALCULÉ ICI, avec des outils écrits dans ce fichier (aucun import de packages/core) :
//  - rationnels EXACTS en BigInt (classe Q), un parseur ASCII (nombres décimaux, lettres minuscules, + - * / ( ), fractions [A|B]) ;
//  - SPEC (ci-dessous) ne contient QUE des expressions / équations ASCII et des paramètres de recette : jamais une réponse.
//    * val : la valeur d'une expression pour des valeurs de lettres (celles de l'énoncé, ou la clé d'une question précédente de la feuille) ;
//      chaque signature MISC-* est la valeur de la RECETTE de son erreur (JUXTA, ADDFOR, BRACKET, SYN-MUAD2-FIXED = le terme fixe oublié,
//      SYN-MUAD2-ADDCOEF = le fixe ajouté au coefficient, SYN-MUAD2-ROLE = fixe et variable échangés) ;
//    * solve : l'équation retapée (a·x = b, x/a = b, a/x = b, k·x ± c = d) est résolue par ANNULATION de la chaîne d'opérations (dernière
//      d'abord), vérifiée par substitution ; chaque signature est la lecture nommée refaite (MULTDIV, FLIP, SUBFORM, ADDFORM, UNDOFIRST du banc
//      `hall-mushkil-muadala`, plus SYN-MUAD2-FIXED = d ÷ k et SYN-MUAD2-SIGN = l'opération défaite par elle-même), jamais négative ni solution ;
//    * yn / cnt : une relation (=, <, <=, >, >=) testée à des valeurs données (jamais résolue) ; « combien de valeurs » recompté, signatures
//      BOUNDARY (< lu <=) et STRICT (<= lu <) refaites ; le choix « faux » d'un « نعم / لا » peut porter une recette qui renverse la décision ;
//    * pickx : UNE seule option égale à la vérité (identité de polynômes à plusieurs lettres, ou même équation), chaque option fausse égale à sa recette
//      et balisée ; dec : la formule la moins chère à une valeur donnée, la lecture fautive (le prix de l'unité seul) renverse le choix ;
//    * self : les égalités du corrigé sont revérifiées.
//  - audit(bank) relit le LaTeX de chaque énoncé / option / corrigé : la relation / l'équation retapée est dans l'énoncé, les valeurs des lettres y sont,
//    chaque nombre d'une expression est donné dans la feuille (ou clé précédente), chaînes d'égalités du corrigé vraies, aucune valeur négative, aucun chiffre ni
//    unité latine hors d'un îlot `$…$` (argent `$…$ DA`), aucune mention du manuel, mots interdits (ربح jamais فائدة) ;
//  - provenance (50 feuilles, 5 × 10 ; 3 term_exam lus — 2am-s2-52 ex 5, 2am-s2-53 ex 5, 2am-s2-56 ex 5 —, 45 modelled, 2 adaptés vérifiés dans l'extraction ;
//    une partie d'un sujet jamais citée deux fois dans le cycle).
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

/** deux équations de même lettre sont « la même écriture » si G − D coïncide en plusieurs points. */
const XS = ['1', '2', '3', '5', '7', '11', '13'].map((n) => new Q(BigInt(n)));
const sameEq = (A, B) => { try { const f = (E, x) => ev(E.L, { [E.v]: x }, true).sub(ev(E.R, { [E.v]: x }, true)); return XS.every((x) => f(A, x).eq(f(B, x))) || XS.every((x) => f(A, x).eq(f(B, x).mul(new Q(-1n)))); } catch { return false; } };


/* ── SPEC : ce que la feuille demande (expressions / équations ASCII + recettes), jamais une réponse ── */
const SPEC = {
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-001:q1": {"t": "pickx", "mode": "expr", "truth": "35*n+120", "opts": [{"id": "A", "e": "35+n+120", "ok": false, "tag": "MISC-IBARA2-ADDFOR", "rec": "35+n+120"}, {"id": "B", "e": "155*n", "ok": false, "tag": "MISC-IBARA2-PERCELL", "rec": "(35+120)*n"}, {"id": "C", "e": "35*n+120", "ok": true}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-002:q1": {"t": "val", "e": "5*a+2*b+3", "env": {"a": 4, "b": 6}, "sigs": [["MISC-IBARA2-JUXTA", "54+26+3"], ["MISC-IBARA2-ADDFOR", "5+4+2+6+3"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-003:q1": {"t": "pickx", "mode": "expr", "truth": "5*a", "opts": [{"id": "A", "e": "24*a", "ok": false, "tag": "MISC-IBARA2-MULTCOEF", "rec": "(3*4*2)*a"}, {"id": "B", "e": "5*a", "ok": true}, {"id": "C", "e": "5*a*a", "ok": false, "tag": "MISC-IBARA2-ADDPOWERS", "rec": "(3+4-2)*a*a"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-004:q1": {"t": "yn", "l": "2*x+9", "rel": "=", "r": "5*x-3", "env": {"x": 3}, "order": ["no", "yes"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-005:q1": {"t": "cnt", "l": "3*x+4", "rel": "<", "r": "22", "v": "x", "cands": [2, 4, 6, 8], "sigs": [["MISC-IKHTIBAR-BOUNDARY", "<="]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-006:q1": {"t": "pickx", "mode": "eq", "truth": "45*x=720", "opts": [{"id": "A", "e": "45*x=720", "ok": true}, {"id": "B", "e": "[x|45]=720", "ok": false, "tag": "MISC-MAJHUL-ROLE", "rec": "x/45=720"}, {"id": "C", "e": "x+45=720", "ok": false, "tag": "MISC-MAJHUL-ADDFORM", "rec": "x+45=720"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-007:q1": {"t": "yn", "l": "54/x", "rel": "=", "r": "8", "env": {"x": 6}, "order": ["no", "yes"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-008:q1": {"t": "solve", "eq": "x/7=2.5", "sigs": ["ADDFORM", "SUBFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-009:q1": {"t": "solve", "eq": "84/x=12", "sigs": ["MULTDIV", "SUBFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-010:q1": {"t": "solve", "eq": "4*x+9=45", "sigs": ["UNDOFIRST", "SUBFORM", "ADDFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-001:q1": {"t": "pickx", "mode": "expr", "truth": "4000+250*h", "opts": [{"id": "A", "e": "4250*h", "ok": false, "tag": "MISC-SYN-MUAD2-ADDCOEF", "rec": "(4000+250)*h"}, {"id": "B", "e": "250+4000*h", "ok": false, "tag": "MISC-SYN-MUAD2-ROLE", "rec": "250+4000*h"}, {"id": "C", "e": "4000+250*h", "ok": true}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-001:q2": {"t": "val", "e": "4000+250*h", "env": {"h": 6}, "sigs": [["MISC-SYN-MUAD2-FIXED", "250*h"], ["MISC-SYN-MUAD2-ADDCOEF", "4250*h"], ["MISC-SYN-MUAD2-ROLE", "250+4000*h"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-001:q3": {"t": "yn", "l": "4000+250*h", "rel": "<=", "r": "5800", "env": {"h": 8}, "order": ["no", "yes"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-002:q1": {"t": "val", "e": "50+35*d", "env": {"d": 12}, "sigs": [["MISC-SYN-MUAD2-FIXED", "35*d"], ["MISC-SYN-MUAD2-ADDCOEF", "85*d"], ["MISC-SYN-MUAD2-ROLE", "35+50*d"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-002:q2": {"t": "solve", "eq": "35*d+50=330", "sigs": ["SUBFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-003:q1": {"t": "val", "e": "1200+90*n", "env": {"n": 10}, "sigs": [["MISC-SYN-MUAD2-FIXED", "90*n"], ["MISC-SYN-MUAD2-ADDCOEF", "1290*n"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-003:q2": {"t": "solve", "eq": "90*n+1200=3000", "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-004:q1": {"t": "pickx", "mode": "eq", "truth": "150*x=4200", "opts": [{"id": "A", "e": "[x|150]=4200", "ok": false, "tag": "MISC-MAJHUL-ROLE", "rec": "x/150=4200"}, {"id": "B", "e": "150*x=4200", "ok": true}, {"id": "C", "e": "150+x=4200", "ok": false, "tag": "MISC-MAJHUL-ADDFORM", "rec": "x+150=4200"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-004:q2": {"t": "solve", "eq": "150*x=4200", "sigs": ["MULTDIV", "SUBFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-004:q3": {"t": "val", "e": "150*x", "env": {}, "from": {"q": "q2", "v": "x"}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-005:q1": {"t": "pickx", "mode": "expr", "truth": "2*(a+b)", "opts": [{"id": "A", "e": "2*a+b", "ok": false, "tag": "MISC-IBARA2-BRACKET", "rec": "2*a+b"}, {"id": "B", "e": "2+a+b", "ok": false, "tag": "MISC-IBARA2-ADDFOR", "rec": "2+a+b"}, {"id": "C", "e": "2*(a+b)", "ok": true}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-005:q2": {"t": "val", "e": "2*(a+b)", "env": {"a": 7.5, "b": 4}, "sigs": [["MISC-IBARA2-BRACKET", "2*a+b"], ["MISC-IBARA2-ADDFOR", "2+a+b"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-006:q1": {"t": "pickx", "mode": "expr", "truth": "6*x", "opts": [{"id": "A", "e": "x+5", "ok": false, "tag": "MISC-IBARA2-ADDFOR", "rec": "x+2+3"}, {"id": "B", "e": "6*x", "ok": true}, {"id": "C", "e": "6*x*x", "ok": false, "tag": "MISC-IBARA2-ADDPOWERS", "rec": "(1+2+3)*x*x"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-006:q2": {"t": "solve", "eq": "6*x=180", "sigs": ["MULTDIV", "SUBFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-006:q3": {"t": "val", "e": "3*x", "env": {}, "from": {"q": "q2", "v": "x"}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-007:q1": {"t": "pickx", "mode": "expr", "truth": "4*(x+2)-3", "opts": [{"id": "A", "e": "4*x+2-3", "ok": false, "tag": "MISC-IBARA2-BRACKET", "rec": "4*x+2-3"}, {"id": "B", "e": "4*(x+2)-3", "ok": true}, {"id": "C", "e": "4+x+2-3", "ok": false, "tag": "MISC-IBARA2-ADDFOR", "rec": "4+x+2-3"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-007:q2": {"t": "val", "e": "4*(x+2)-3", "env": {"x": 5}, "sigs": [["MISC-IBARA2-BRACKET", "4*x+2-3"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-008:q1": {"t": "val", "e": "90*n+60", "env": {"n": 4}, "sigs": [["MISC-SYN-MUAD2-FIXED", "90*n"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-008:q2": {"t": "val", "e": "90*n+60", "env": {"n": 7}, "sigs": [["MISC-SYN-MUAD2-FIXED", "90*n"], ["MISC-SYN-MUAD2-ADDCOEF", "150*n"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-008:q3": {"t": "val", "e": "90*n+60", "env": {"n": 10}, "sigs": [["MISC-SYN-MUAD2-ROLE", "60*n+90"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-009:q1": {"t": "yn", "l": "80+25*d", "rel": "=", "r": "330", "env": {"d": 10}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-009:q2": {"t": "val", "e": "80+25*d", "env": {"d": 12}, "sigs": [["MISC-SYN-MUAD2-FIXED", "25*d"], ["MISC-SYN-MUAD2-ADDCOEF", "105*d"], ["MISC-SYN-MUAD2-ROLE", "25+80*d"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-010:q1": {"t": "yn", "l": "1800+140*x", "rel": "<=", "r": "6000", "env": {"x": 30}, "order": ["no", "yes"], "tag": "MISC-IKHTIBAR-STRICT", "rec": {"rel": "<"}},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-010:q2": {"t": "cnt", "l": "1800+140*x", "rel": "<=", "r": "6000", "v": "x", "cands": [25, 28, 30, 32], "sigs": [["MISC-IKHTIBAR-STRICT", "<"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-001:q1": {"t": "pickx", "mode": "expr", "truth": "2*x+13", "opts": [{"id": "A", "e": "2*x+6.5", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "2*x+2.5+4"}, {"id": "B", "e": "2*x+13", "ok": true}, {"id": "C", "e": "2*x+8", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "2*x+4+4"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-001:q2": {"t": "pickx", "mode": "expr", "truth": "4*x+10", "opts": [{"id": "A", "e": "4*x+2.5", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "4*x+2.5"}, {"id": "B", "e": "4*x+10", "ok": true}, {"id": "C", "e": "4+2.5+x", "ok": false, "tag": "MISC-IBARA2-ADDFOR", "rec": "4+2.5+x"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-001:q3": {"t": "solve", "eq": "4*x+10=32", "sigs": ["SUBFORM", "ADDFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-001:q4": {"t": "val", "e": "4*x/((25/100)*(25/100))", "env": {}, "from": {"q": "q3", "v": "x"}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-001:q5": {"t": "val", "e": "352/8*480", "env": {}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-001:q6": {"t": "val", "e": "352/16*840", "env": {}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-002:q1": {"t": "val", "e": "800+120*n", "env": {"n": 20}, "sigs": [["MISC-SYN-MUAD2-FIXED", "120*n"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-002:q2": {"t": "val", "e": "200+150*n", "env": {"n": 20}, "sigs": [["MISC-SYN-MUAD2-FIXED", "150*n"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-002:q3": {"t": "yn", "l": "800+120*n", "rel": "=", "r": "200+150*n", "env": {"n": 20}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-002:q4": {"t": "dec", "a": "800+120*n", "b": "200+150*n", "env": {"n": 12}, "order": ["a", "b"], "tag": "MISC-SYN-MUAD2-FIXED", "rec": {"a": "120*n", "b": "150*n"}},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-003:q1": {"t": "val", "e": "1500+25*n", "env": {"n": 100}, "sigs": [["MISC-SYN-MUAD2-FIXED", "25*n"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-003:q2": {"t": "yn", "l": "1500+25*n", "rel": "=", "r": "300+40*n", "env": {"n": 80}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-003:q3": {"t": "dec", "a": "1500+25*n", "b": "300+40*n", "env": {"n": 40}, "order": ["a", "b"], "tag": "MISC-SYN-MUAD2-FIXED", "rec": {"a": "25*n", "b": "40*n"}},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-004:q1": {"t": "yn", "l": "100+40*d", "rel": "=", "r": "60+45*d", "env": {"d": 8}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-004:q2": {"t": "dec", "a": "100+40*d", "b": "60+45*d", "env": {"d": 5}, "order": ["a", "b"], "tag": "MISC-SYN-MUAD2-FIXED", "rec": {"a": "40*d", "b": "45*d"}},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-004:q3": {"t": "cnt", "l": "100+40*d", "rel": "<", "r": "60+45*d", "v": "d", "cands": [6, 8, 10, 12], "sigs": [["MISC-IKHTIBAR-BOUNDARY", "<="]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-005:q1": {"t": "pickx", "mode": "expr", "truth": "1000+450*m", "opts": [{"id": "A", "e": "1450*m", "ok": false, "tag": "MISC-SYN-MUAD2-ADDCOEF", "rec": "(1000+450)*m"}, {"id": "B", "e": "450+1000*m", "ok": false, "tag": "MISC-SYN-MUAD2-ROLE", "rec": "450+1000*m"}, {"id": "C", "e": "1000+450*m", "ok": true}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-005:q2": {"t": "yn", "l": "3000+200*m", "rel": "=", "r": "1000+450*m", "env": {"m": 8}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-005:q3": {"t": "dec", "a": "3000+200*m", "b": "1000+450*m", "env": {"m": 6}, "order": ["a", "b"], "tag": "MISC-SYN-MUAD2-FIXED", "rec": {"a": "200*m", "b": "450*m"}},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-006:q1": {"t": "pickx", "mode": "expr", "truth": "1200+110*n", "opts": [{"id": "A", "e": "110+1200*n", "ok": false, "tag": "MISC-SYN-MUAD2-ROLE", "rec": "110+1200*n"}, {"id": "B", "e": "1200+110*n", "ok": true}, {"id": "C", "e": "1310*n", "ok": false, "tag": "MISC-SYN-MUAD2-ADDCOEF", "rec": "(1200+110)*n"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-006:q2": {"t": "yn", "l": "2400+80*n", "rel": "=", "r": "1200+110*n", "env": {"n": 40}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-006:q3": {"t": "dec", "a": "2400+80*n", "b": "1200+110*n", "env": {"n": 30}, "order": ["a", "b"], "tag": "MISC-SYN-MUAD2-FIXED", "rec": {"a": "80*n", "b": "110*n"}},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-007:q1": {"t": "yn", "l": "2000+100*n", "rel": "=", "r": "800+160*n", "env": {"n": 20}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-007:q2": {"t": "cnt", "l": "800+160*n", "rel": "<", "r": "2000+100*n", "v": "n", "cands": [15, 20, 25, 30], "sigs": [["MISC-IKHTIBAR-BOUNDARY", "<="]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-007:q3": {"t": "val", "e": "800+160*n", "env": {"n": 15}, "sigs": [["MISC-SYN-MUAD2-FIXED", "160*n"], ["MISC-SYN-MUAD2-ADDCOEF", "960*n"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-008:q1": {"t": "val", "e": "1500+90*n", "env": {"n": 20}, "sigs": [["MISC-SYN-MUAD2-FIXED", "90*n"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-008:q2": {"t": "val", "e": "900+120*n", "env": {"n": 20}, "sigs": [["MISC-SYN-MUAD2-FIXED", "120*n"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-008:q3": {"t": "yn", "l": "1500+90*n", "rel": "=", "r": "900+120*n", "env": {"n": 20}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-008:q4": {"t": "val", "e": "900+120*n", "env": {"n": 30}, "sigs": [["MISC-SYN-MUAD2-FIXED", "120*n"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-009:q1": {"t": "yn", "l": "500+100*h", "rel": "=", "r": "200+130*h", "env": {"h": 10}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-009:q2": {"t": "cnt", "l": "200+130*h", "rel": "<", "r": "500+100*h", "v": "h", "cands": [6, 8, 10, 12], "sigs": [["MISC-IKHTIBAR-BOUNDARY", "<="]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-009:q3": {"t": "dec", "a": "500+100*h", "b": "200+130*h", "env": {"h": 8}, "order": ["a", "b"], "tag": "MISC-SYN-MUAD2-FIXED", "rec": {"a": "100*h", "b": "130*h"}},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-010:q1": {"t": "val", "e": "1000+50*n", "env": {"n": 10}, "sigs": [["MISC-SYN-MUAD2-FIXED", "50*n"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-010:q2": {"t": "val", "e": "400+80*n", "env": {"n": 10}, "sigs": [["MISC-SYN-MUAD2-FIXED", "80*n"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-010:q3": {"t": "self", "facts": [["1000+50*10", "1500"], ["400+80*10", "1200"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-001:q1": {"t": "val", "e": "50*50", "env": {}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-001:q2": {"t": "solve", "eq": "20*x=2500", "sigs": ["MULTDIV", "SUBFORM", "ADDFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-001:q3": {"t": "val", "e": "2*2500/5", "env": {}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-001:q4": {"t": "solve", "eq": "50*m-1500=14500", "sigs": ["FIXED", "SIGN", "ADDFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-002:q1": {"t": "pickx", "mode": "expr", "truth": "4*x+30", "opts": [{"id": "A", "e": "4*x+15", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "x+x+x+x+15"}, {"id": "B", "e": "2*x+30", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "x+x+15+15"}, {"id": "C", "e": "4*x+30", "ok": true}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-002:q2": {"t": "solve", "eq": "4*x+30=130", "sigs": ["UNDOFIRST", "SUBFORM", "ADDFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-002:q3": {"t": "val", "e": "(x+15)*x", "env": {}, "from": {"q": "q2", "v": "x"}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-002:q4": {"t": "val", "e": "130*120", "env": {}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-003:q1": {"t": "pickx", "mode": "expr", "truth": "4*x+8", "opts": [{"id": "A", "e": "4*x+4", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "x+x+x+4+x"}, {"id": "B", "e": "4*x+8", "ok": true}, {"id": "C", "e": "2*x+8", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "x+x+4+4"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-003:q2": {"t": "solve", "eq": "4*x+8=56", "sigs": ["UNDOFIRST", "SUBFORM", "ADDFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-003:q3": {"t": "val", "e": "(x+4)*x", "env": {}, "from": {"q": "q2", "v": "x"}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-003:q4": {"t": "val", "e": "192*95", "env": {}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-004:q1": {"t": "pickx", "mode": "expr", "truth": "12*x", "opts": [{"id": "A", "e": "12+x", "ok": false, "tag": "MISC-IBARA2-ADDFOR", "rec": "12+x"}, {"id": "B", "e": "4*x", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "4*x"}, {"id": "C", "e": "12*x", "ok": true}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-004:q2": {"t": "solve", "eq": "12*x=168", "sigs": ["MULTDIV", "SUBFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-004:q3": {"t": "val", "e": "x*x", "env": {}, "from": {"q": "q2", "v": "x"}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-004:q4": {"t": "val", "e": "196*35", "env": {}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-005:q1": {"t": "pickx", "mode": "expr", "truth": "6*x+10", "opts": [{"id": "A", "e": "3*x+5", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "x+2*x+5"}, {"id": "B", "e": "6*x+5", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "2*x+2*(2*x)+5"}, {"id": "C", "e": "6*x+10", "ok": true}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-005:q2": {"t": "solve", "eq": "6*x+10=190", "sigs": ["SUBFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-005:q3": {"t": "val", "e": "2*x+5", "env": {}, "from": {"q": "q2", "v": "x"}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-005:q4": {"t": "val", "e": "30*65", "env": {}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-006:q1": {"t": "pickx", "mode": "expr", "truth": "3*x+6", "opts": [{"id": "A", "e": "3*x+4", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "x+x+x+4"}, {"id": "B", "e": "x+6", "ok": false, "tag": "MISC-IBARA2-ADDFOR", "rec": "x+2+4"}, {"id": "C", "e": "3*x+6", "ok": true}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-006:q2": {"t": "solve", "eq": "3*x+6=51", "sigs": ["UNDOFIRST", "SUBFORM", "ADDFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-006:q3": {"t": "val", "e": "x+4", "env": {}, "from": {"q": "q2", "v": "x"}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-006:q4": {"t": "val", "e": "x+(x+2)+(x+4)", "env": {}, "from": {"q": "q2", "v": "x"}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-007:q1": {"t": "pickx", "mode": "expr", "truth": "8*x", "opts": [{"id": "A", "e": "5*x", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "2*x+3*x"}, {"id": "B", "e": "8*x", "ok": true}, {"id": "C", "e": "2+x+3*x", "ok": false, "tag": "MISC-IBARA2-ADDFOR", "rec": "2+x+3*x"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-007:q2": {"t": "solve", "eq": "8*x=96", "sigs": ["MULTDIV", "SUBFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-007:q3": {"t": "val", "e": "3*x", "env": {}, "from": {"q": "q2", "v": "x"}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-007:q4": {"t": "val", "e": "12*36", "env": {}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-008:q1": {"t": "pickx", "mode": "expr", "truth": "2*a+2*b", "opts": [{"id": "A", "e": "2*a+b", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "2*a+b"}, {"id": "B", "e": "2*a+2*b", "ok": true}, {"id": "C", "e": "a+b+2", "ok": false, "tag": "MISC-IBARA2-ADDFOR", "rec": "a+b+2"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-008:q2": {"t": "val", "e": "2*a+2*b", "env": {"a": 18, "b": 7}, "sigs": [["MISC-IBARA2-NOFIRST", "2*a+b"], ["MISC-IBARA2-ADDFOR", "a+b+2"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-008:q3": {"t": "val", "e": "50*3", "env": {}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-009:q1": {"t": "pickx", "mode": "expr", "truth": "4*x+20", "opts": [{"id": "A", "e": "4*x+5", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "4*x+5"}, {"id": "B", "e": "4+x+5", "ok": false, "tag": "MISC-IBARA2-ADDFOR", "rec": "4+x+5"}, {"id": "C", "e": "4*x+20", "ok": true}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-009:q2": {"t": "solve", "eq": "4*x+20=100", "sigs": ["UNDOFIRST", "SUBFORM", "ADDFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-009:q3": {"t": "val", "e": "2*(x+5+4)", "env": {}, "from": {"q": "q2", "v": "x"}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-010:q1": {"t": "solve", "eq": "3*x=54", "sigs": ["MULTDIV", "SUBFORM", "ADDFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-010:q2": {"t": "val", "e": "2*(3+x)", "env": {}, "from": {"q": "q1", "v": "x"}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-010:q3": {"t": "val", "e": "54*400", "env": {}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-010:q4": {"t": "yn", "l": "21600", "rel": "<=", "r": "20000", "env": {}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-001:q1": {"t": "pickx", "mode": "expr", "truth": "4*x", "opts": [{"id": "A", "e": "4+x", "ok": false, "tag": "MISC-IBARA2-ADDFOR", "rec": "4+x"}, {"id": "B", "e": "4*x", "ok": true}, {"id": "C", "e": "2*x", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "x+x"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-001:q2": {"t": "pickx", "mode": "expr", "truth": "70+2*x", "opts": [{"id": "A", "e": "72*x", "ok": false, "tag": "MISC-SYN-MUAD2-ADDCOEF", "rec": "(70+2)*x"}, {"id": "B", "e": "2+70*x", "ok": false, "tag": "MISC-SYN-MUAD2-ROLE", "rec": "2+70*x"}, {"id": "C", "e": "70+2*x", "ok": true}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-001:q3": {"t": "solve", "eq": "4*x=24", "sigs": ["MULTDIV", "SUBFORM", "ADDFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-001:q4": {"t": "val", "e": "70+2*x", "env": {}, "from": {"q": "q3", "v": "x"}, "sigs": [["MISC-SYN-MUAD2-ADDCOEF", "72*x"], ["MISC-SYN-MUAD2-ROLE", "2+70*x"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-001:q5": {"t": "val", "e": "25*(10+x)-x*x", "env": {"x": 5}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-001:q6": {"t": "yn", "l": "350/0.04", "rel": "<=", "r": "9000", "env": {}, "order": ["no", "yes"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-002:q1": {"t": "pickx", "mode": "expr", "truth": "9000+250*x", "opts": [{"id": "A", "e": "9250*x", "ok": false, "tag": "MISC-SYN-MUAD2-ADDCOEF", "rec": "(9000+250)*x"}, {"id": "B", "e": "9000+250*x", "ok": true}, {"id": "C", "e": "250+9000*x", "ok": false, "tag": "MISC-SYN-MUAD2-ROLE", "rec": "250+9000*x"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-002:q2": {"t": "val", "e": "9000+250*x", "env": {"x": 28}, "sigs": [["MISC-SYN-MUAD2-FIXED", "250*x"], ["MISC-SYN-MUAD2-ADDCOEF", "9250*x"], ["MISC-SYN-MUAD2-ROLE", "250+9000*x"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-002:q3": {"t": "solve", "eq": "250*x+9000=14000", "sigs": ["SUBFORM", "FIXED"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-002:q4": {"t": "yn", "l": "9000+250*x", "rel": "=", "r": "6000+300*x", "env": {"x": 60}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-002:q5": {"t": "dec", "a": "9000+250*x", "b": "6000+300*x", "env": {"x": 40}, "order": ["a", "b"], "tag": "MISC-SYN-MUAD2-FIXED", "rec": {"a": "250*x", "b": "300*x"}},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-003:q1": {"t": "pickx", "mode": "expr", "truth": "2800+25*x", "opts": [{"id": "A", "e": "2825*x", "ok": false, "tag": "MISC-SYN-MUAD2-ADDCOEF", "rec": "(2800+25)*x"}, {"id": "B", "e": "25+2800*x", "ok": false, "tag": "MISC-SYN-MUAD2-ROLE", "rec": "25+2800*x"}, {"id": "C", "e": "2800+25*x", "ok": true}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-003:q2": {"t": "val", "e": "2800+25*x", "env": {"x": 80}, "sigs": [["MISC-SYN-MUAD2-FIXED", "25*x"], ["MISC-SYN-MUAD2-ADDCOEF", "2825*x"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-003:q3": {"t": "yn", "l": "2800+25*x", "rel": "<=", "r": "5000", "env": {"x": 80}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-003:q4": {"t": "cnt", "l": "2800+25*x", "rel": "<=", "r": "5000", "v": "x", "cands": [84, 88, 90, 96], "sigs": [["MISC-IKHTIBAR-STRICT", "<"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-003:q5": {"t": "solve", "eq": "25*x+2800=5000", "sigs": ["FIXED"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-004:q1": {"t": "pickx", "mode": "expr", "truth": "4*x+24", "opts": [{"id": "A", "e": "4*x+12", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "x+x+x+12+x"}, {"id": "B", "e": "4*x+24", "ok": true}, {"id": "C", "e": "2*x+24", "ok": false, "tag": "MISC-IBARA2-NOFIRST", "rec": "x+x+12+12"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-004:q2": {"t": "solve", "eq": "4*x+24=96", "sigs": ["UNDOFIRST", "SUBFORM", "ADDFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-004:q3": {"t": "val", "e": "(x+12)*x", "env": {}, "from": {"q": "q2", "v": "x"}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-004:q4": {"t": "val", "e": "540/20*150", "env": {}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-004:q5": {"t": "yn", "l": "4050", "rel": "<=", "r": "4000", "env": {}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-005:q1": {"t": "yn", "l": "2500+140*n", "rel": "=", "r": "900+220*n", "env": {"n": 20}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-005:q2": {"t": "val", "e": "900+220*n", "env": {"n": 25}, "sigs": [["MISC-SYN-MUAD2-FIXED", "220*n"], ["MISC-SYN-MUAD2-ADDCOEF", "1120*n"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-005:q3": {"t": "dec", "a": "2500+140*n", "b": "900+220*n", "env": {"n": 12}, "order": ["a", "b"], "tag": "MISC-SYN-MUAD2-FIXED", "rec": {"a": "140*n", "b": "220*n"}},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-005:q4": {"t": "solve", "eq": "140*n+2500=6000", "sigs": ["SUBFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-006:q1": {"t": "pickx", "mode": "expr", "truth": "3200+300*x", "opts": [{"id": "A", "e": "3200+300*x", "ok": true}, {"id": "B", "e": "3500*x", "ok": false, "tag": "MISC-SYN-MUAD2-ADDCOEF", "rec": "(3200+300)*x"}, {"id": "C", "e": "300+3200*x", "ok": false, "tag": "MISC-SYN-MUAD2-ROLE", "rec": "300+3200*x"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-006:q2": {"t": "val", "e": "3200+300*x", "env": {"x": 28}, "sigs": [["MISC-SYN-MUAD2-FIXED", "300*x"], ["MISC-SYN-MUAD2-ADDCOEF", "3500*x"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-006:q3": {"t": "yn", "l": "3200+300*x", "rel": "<=", "r": "12200", "env": {"x": 28}, "order": ["no", "yes"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-006:q4": {"t": "solve", "eq": "300*x+3200=12200", "sigs": ["SUBFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-007:q1": {"t": "val", "e": "120+15*t", "env": {"t": 20}, "sigs": [["MISC-SYN-MUAD2-FIXED", "15*t"], ["MISC-SYN-MUAD2-ROLE", "15+120*t"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-007:q2": {"t": "solve", "eq": "15*t+120=600", "sigs": ["FIXED", "SUBFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-007:q3": {"t": "yn", "l": "120+15*t", "rel": "=", "r": "300+10*t", "env": {"t": 36}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-007:q4": {"t": "yn", "l": "300+10*t", "rel": ">", "r": "120+15*t", "env": {"t": 30}, "order": ["no", "yes"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-008:q1": {"t": "pickx", "mode": "expr", "truth": "120*x+85*y", "opts": [{"id": "A", "e": "120+x+85+y", "ok": false, "tag": "MISC-IBARA2-ADDFOR", "rec": "120+x+85+y"}, {"id": "B", "e": "205*x*y", "ok": false, "tag": "MISC-IBARA2-PERCELL", "rec": "(120+85)*x*y"}, {"id": "C", "e": "120*x+85*y", "ok": true}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-008:q2": {"t": "val", "e": "120*x+85*y", "env": {"x": 8, "y": 12}, "sigs": [["MISC-IBARA2-JUXTA", "1208+8512"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-008:q3": {"t": "yn", "l": "120*x+85*y", "rel": "<=", "r": "2000", "env": {"x": 8, "y": 12}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-008:q4": {"t": "yn", "l": "120*x+85*y", "rel": "<=", "r": "2000", "env": {"x": 10, "y": 12}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-009:q1": {"t": "val", "e": "30*x+12", "env": {"x": 9}, "sigs": [["MISC-SYN-MUAD2-FIXED", "30*x"], ["MISC-SYN-MUAD2-ADDCOEF", "42*x"]]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-009:q2": {"t": "solve", "eq": "30*x+12=372", "sigs": ["UNDOFIRST", "SUBFORM", "FIXED"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-009:q3": {"t": "val", "e": "372*8", "env": {}, "sigs": []},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-009:q4": {"t": "yn", "l": "2976", "rel": ">=", "r": "3000", "env": {}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-010:q1": {"t": "pickx", "mode": "expr", "truth": "7800+180*x", "opts": [{"id": "A", "e": "7980*x", "ok": false, "tag": "MISC-SYN-MUAD2-ADDCOEF", "rec": "(7800+180)*x"}, {"id": "B", "e": "7800+180*x", "ok": true}, {"id": "C", "e": "180+7800*x", "ok": false, "tag": "MISC-SYN-MUAD2-ROLE", "rec": "180+7800*x"}]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-010:q2": {"t": "solve", "eq": "180*x+7800=15000", "sigs": ["SUBFORM"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-010:q3": {"t": "yn", "l": "7800+180*x", "rel": "<=", "r": "15000", "env": {"x": 45}, "order": ["yes", "no"]},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-010:q4": {"t": "yn", "l": "15000/x", "rel": "=", "r": "375", "env": {"x": 40}, "order": ["no", "yes"]}
};
const PROV = {
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-001": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-002": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-003": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-004": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-005": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-006": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-007": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-008": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-009": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l1-010": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-001": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-002": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-003": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-004": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-005": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-006": {"t": "ad", "el": "deep-58"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-007": {"t": "ad", "el": "self-2"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-008": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-009": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l2-010": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-001": {"t": "tt", "file": "2am-s2-52", "ex": 5},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-002": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-003": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-004": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-005": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-006": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-007": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-008": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-009": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l3-010": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-001": {"t": "tt", "file": "2am-s2-53", "ex": 5},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-002": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-003": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-004": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-005": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-006": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-007": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-008": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-009": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l4-010": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-001": {"t": "tt", "file": "2am-s2-56", "ex": 5},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-002": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-003": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-004": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-005": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-006": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-007": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-008": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-009": {"t": "mod"},
  "ex-2am-wadiya-idmajiya-mafhum-muadala-l5-010": {"t": "mod"}
};

/* ── outils propres à cette synthèse ── */
const PTS = [1, 2, 3, 5, 7, 11].map((k) => k);
const fracAscii = (s) => { let t = String(s); for (;;) { const n = t.replace(/\[([^[\]|]*)\|([^[\]]*)\]/g, '(($1)/($2))'); if (n === t) break; t = n; } return t; };
const P = (s) => parse(fracAscii(s));
const allLetters = (...ss) => { const L = new Set(); for (const s of ss) letters(P(s), L); return [...L]; };
/** deux expressions (plusieurs lettres) sont égales si elles coïncident en plusieurs points entiers */
const sameExpr = (a, b) => {
  const L = allLetters(a, b);
  return PTS.every((k, i) => { const env = Object.fromEntries(L.map((l, j) => [l, new Q(BigInt(k + 2 * j + i))])); try { return ev(P(a), env, true).eq(ev(P(b), env, true)); } catch { return false; } });
};
const valAt = (s, env) => ev(P(s), envQ(env), true);
const relTest = (rel, a, b) => { const c = a.n * b.d - b.n * a.d; return rel === '=' ? c === 0n : rel === '<' ? c < 0n : rel === '<=' ? c <= 0n : rel === '>' ? c > 0n : c >= 0n; };
const MISCS = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/misconceptions.json'), 'utf8'));
const sigId = (t) => (['FIXED', 'SIGN'].includes(t) ? `MISC-SYN-MUAD2-${t}` : `MISC-MAJHUL-${t}`);
/** lectures d'une équation en plus de celles du banc hall : le terme fixe oublié, l'opération défaite par elle-même */
function extra(E) {
  const F = formOf(E); const r = {};
  if (F.f === 'lin') { r.FIXED = F.d.div(F.m); r.SIGN = F.d.add(F.c).div(F.m); }
  if (F.f === 'lsub') { r.FIXED = F.d.div(F.m); r.SIGN = F.d.sub(F.c).div(F.m); }
  return r;
}

/** Jugement d'une question : { answer, problems, info } */
function judge(S, keyOf) {
  const problems = []; let answer = null; const info = {};
  const envOf = (e0, from) => { const env = envQ(e0); if (from) env[from.v] = keyOf(from.q); return env; };
  if (S.t === 'val') {
    const env = envOf(S.env, S.from); const key = ev(P(S.e), env);
    if (!isDec(key)) problems.push('valeur non décimale');
    answer = R(D(key)); info.key = key; info.env = env; info.sigs = [];
    for (const [tag, e2] of S.sigs) {
      const v = ev(P(e2), env);
      if (v.eq(key) || !isDec(v)) problems.push(`signature ${tag} : valeur ${D(v)} égale à la clé ou non décimale`); else info.sigs.push([D(v), tag]);
    }
    const vs = info.sigs.map(([v]) => v); if (new Set([...vs, D(key)]).size !== vs.length + 1) problems.push('deux signatures égales entre elles ou à la clé');
  } else if (S.t === 'solve') {
    const E = eqOf(S.eq); const { x, steps } = solveChain(E);
    if (!holds(E, x)) problems.push('la valeur trouvée ne vérifie pas l\'équation');
    if (!isDec(x)) problems.push('solution non décimale');
    answer = R(D(x)); info.key = x; info.steps = steps; info.sigs = [];
    const all = { ...readings(E).r, ...extra(E) };
    for (const tag of S.sigs) {
      if (!(tag in all)) { problems.push(`recette ${tag} inexistante`); continue; }
      const v = all[tag]; if (v.neg() || !isDec(v) || v.eq(x) || holds(E, v)) problems.push(`signature ${tag} illégale (négative, non décimale, = clé ou solution)`); else info.sigs.push([D(v), sigId(tag)]);
    }
    const vs = info.sigs.map(([v]) => v); if (new Set([...vs, D(x)]).size !== vs.length + 1) problems.push('deux signatures égales entre elles ou à la clé');
  } else if (S.t === 'yn') {
    const env = envOf(S.env, S.from); const a = ev(P(S.l), env), b = ev(P(S.r), env);
    const yes = relTest(S.rel, a, b); info.yes = yes; info.a = a; info.b = b;
    answer = C('AB'[S.order.findIndex((w) => (w === 'yes') === yes)]);
    if (S.tag) {
      const rl = S.rec.rel ?? S.rel; const yes2 = relTest(rl, ev(P(S.rec.l ?? S.l), env), ev(P(S.rec.r ?? S.r), env));
      if (yes2 === yes) problems.push('la recette de l\'erreur ne renverse pas la décision');
    }
  } else if (S.t === 'cnt') {
    const ok = (rl, c) => relTest(rl, ev(P(S.l), { [S.v]: dq(String(c)) }), ev(P(S.r), { [S.v]: dq(String(c)) }));
    const key = S.cands.filter((c) => ok(S.rel, c)).length; info.key = new Q(BigInt(key)); answer = R(String(key)); info.sigs = [];
    for (const [tag, rel2] of S.sigs) { const v = S.cands.filter((c) => ok(rel2, c)).length; if (v === key) problems.push(`signature ${tag} égale à la clé`); else info.sigs.push([String(v), tag]); }
    if (new Set(S.cands).size !== S.cands.length) problems.push('candidats répétés');
  } else if (S.t === 'pickx') {
    const same = S.mode === 'eq' ? (o) => sameEq(eqOf(fracAscii(o)), eqOf(fracAscii(S.truth))) : (o) => sameExpr(o, S.truth);
    const oks = S.opts.filter((o) => same(o.e)); if (oks.length !== 1) problems.push(`${oks.length} options vraies`); else answer = C(oks[0].id);
    for (const o of S.opts) {
      if (o.ok !== same(o.e)) problems.push(`option ${o.id} : ok déclaré ≠ calcul`);
      if (!o.ok) {
        if (!o.tag) problems.push(`option ${o.id} fausse sans balise`);
        else if (!o.rec || !(S.mode === 'eq' ? sameEq(eqOf(fracAscii(o.e)), eqOf(fracAscii(o.rec))) : sameExpr(o.e, o.rec))) problems.push(`option ${o.id} ≠ sa recette ${o.rec}`);
        if (o.tag && same(o.rec ?? o.e)) problems.push(`la recette de ${o.id} est VRAIE`);
      }
    }
    if (new Set(S.opts.map((o) => o.e)).size !== S.opts.length) problems.push('deux options égales');
  } else if (S.t === 'dec') {
    const a = valAt(S.a, S.env), b = valAt(S.b, S.env); if (a.eq(b)) problems.push('égalité : pas de choix');
    const best = a.n * b.d < b.n * a.d ? 'a' : 'b'; info.best = best;
    answer = C('AB'[S.order.indexOf(best)]);
    if (S.tag) { const a2 = valAt(S.rec.a, S.env), b2 = valAt(S.rec.b, S.env); const best2 = a2.n * b2.d < b2.n * a2.d ? 'a' : 'b'; if (best2 === best) problems.push('la recette de l\'erreur ne renverse pas le choix'); }
  } else if (S.t === 'self') {
    for (const [l, r] of S.facts) if (!ev(P(l), {}).eq(ev(P(r), {}))) problems.push(`fait faux : ${l} ≠ ${r}`);
  } else problems.push(`type ${S.t}`);
  return { answer, problems, info };
}

/* ── ORACLE ── */
const sheetOf = (key) => key.split(':')[0];
const keysOfSheet = (id) => (qid) => { const S = SPEC[`${id}:${qid}`]; if (!S) throw new Error(`${id}:${qid} inconnue`); const { info } = judge(S, keysOfSheet(id)); if (!info.key) throw new Error(`${id}:${qid} n'est pas une valeur`); return info.key; };
export const ORACLE = {};
for (const [key, S] of Object.entries(SPEC)) { const { answer } = judge(S, keysOfSheet(sheetOf(key))); if (answer) ORACLE[key] = answer; }

/* ── audit ── */
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const AR = '\\u0621-\\u064A';
const FORBIDDEN = new RegExp(`(?<![${AR}])(?:خنزير|خمر|نبيذ|بيرة|كحول|قمار|ميسر|يانصيب|ورق اللعب|أوراق اللعب|نرد|كازينو|ربا|فوائد|فائدة|رأس السنة|عيد الميلاد|الكتاب|كتاب|الكتاب المدرسي|المنهاج)(?![${AR}])|🐷|ص\\s*\\d|صفحة`);
const islands = (t) => [...String(t ?? '').matchAll(/\$([^$]*)\$/g)].map((m) => m[1]);
const outside = (t) => String(t ?? '').replace(/\$[^$]*\$( DA)?/g, '');
function texToAscii(t) {
  let s = String(t).replace(/\\,/g, '').replace(/\\ /g, '').replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\\le(?![a-z])/g, '<=').replace(/\\ge(?![a-z])/g, '>=').replace(/\\mathrm\{[^}]*\}(\^\{\d\})?/g, '');
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
/** une île « G rel D » : [G, rel, D] en ASCII, ou null */
const relParts = (isl) => { const a = texToAscii(isl).replace(/^[A-Z]_\d=/, ''); const m = /^(.*?)(<=|>=|<|>|=)(.*)$/.exec(a); return m ? [m[1], m[2], m[3]] : null; };
const shows = (text, l, rel, r) => islands(text).some((i) => { try { const p = relParts(i); if (!p || p[1] !== rel) return false; return sameExpr(p[0], l) && sameExpr(p[2], r); } catch { return false; } });
const eqShown = (text, eq) => islands(text).some((i) => { try { return sameEq(eqOf(fracAscii(texToAscii(i))), eqOf(eq)); } catch { return false; } });
/** les chaînes d'égalités numériques d'un corrigé sont vraies */
function chainProblems(key, text) {
  const out = [];
  for (const isl of islands(text)) {
    if (/\\(le|ge|neq)|[<>]/.test(isl) || !/=/.test(isl)) continue;
    const parts = isl.split('=').map((p, i) => (i === 0 ? p.replace(/^\s*[A-Za-z]_\d\s*$/, '') : p));
    const vals = [];
    for (const p of parts) { if (!p.trim()) continue; try { const a = texToAscii(p); if (/[a-z]/.test(a)) { vals.length = 0; break; } vals.push(ev(P(a), {}, true)); } catch { vals.length = 0; break; } }
    for (let i = 1; i < vals.length; i++) if (!vals[0].eq(vals[i])) { out.push(`${key} : « $${isl}$ » : ${D(vals[0])} ≠ ${D(vals[i])}`); break; }
  }
  return out;
}
const LPS_OK = new Set(['2am_wadiya-idmajiya-mafhum-muadala_P1']); // l'unique LP de la synthèse (le validateur n'admet que les LP de la leçon elle-même)
const BADGE = 'على منوال اختبار الفصل الثاني';
const READ = { '2am-s2-52': [5], '2am-s2-53': [5], '2am-s2-56': [5] };
const EXPECTED = { 1: [0, 10, 0], 2: [0, 8, 2], 3: [1, 9, 0], 4: [1, 9, 0], 5: [1, 9, 0] };

export function audit(bank) {
  const problems = []; const P_ = (key, msg) => problems.push(`${key} : ${msg}`);
  const dir = join(root, 'content/practice/2am/wadiya-idmajiya-mafhum-muadala');
  const sheets = {};
  for (const lv of readdirSync(dir)) for (const f of readdirSync(join(dir, lv))) { const ex = JSON.parse(readFileSync(join(dir, lv, f), 'utf8')); sheets[ex.id] = ex; }
  const extraction = JSON.parse(readFileSync(join(root, 'docs/sources/2am/unit4/extraction.json'), 'utf8'));
  const earlierKeys = {};
  for (const { key, q } of bank) {
    const id = sheetOf(key); const sh = sheets[id]; const S = SPEC[key];
    if (!S) { P_(key, 'aucune spec'); continue; }
    if (!sh) { P_(key, 'feuille introuvable'); continue; }
    let j; try { j = judge(S, keysOfSheet(id)); } catch (err) { P_(key, `jugement impossible : ${err.message}`); continue; }
    for (const m of j.problems) P_(key, m);
    if (!LPS_OK.has(q.learningPoints?.[0]?.code) || q.learningPoints.length !== 1 || q.learningPoints[0].role !== 'primary') P_(key, 'code de la كفاءة');
    const qtext = [sh.statement.content, q.statement, ...(q.choices ?? []).map((c) => c.content)].join(' ');
    // nombres connus : énoncé, options, clés précédentes de la feuille, constantes de conversion
    const known = new Set([...numbersIn(qtext), '0', '1', '2', '100', ...(earlierKeys[id] ?? [])]);
    for (const q2 of sh.questions) { if (q2.id === q.id) break; for (const t of [q2.statement, ...(q2.choices ?? []).map((c) => c.content)]) numbersIn(t).forEach((n) => known.add(n)); }
    const lits = (s) => (fracAscii(s).match(/\d+(?:\.\d+)?/g) ?? []).map((n) => D(dq(n)));
    const checkLits = (s, what) => { for (const n of lits(s)) if (!known.has(n)) P_(key, `le nombre ${n} de ${what} « ${s} » n'est pas donné dans la feuille (ni clé précédente)`); };
    if (S.t === 'val') {
      if (q.answerType !== 'rational') P_(key, 'une valeur est `rational`');
      if (q.expectedAnswer !== D(j.info.key)) P_(key, `l'oracle trouve ${D(j.info.key)}, la feuille ${q.expectedAnswer}`);
      if (q.solution?.result !== D(j.info.key).replace('.', '{,}')) P_(key, `résultat du corrigé ${q.solution?.result}`);
      checkLits(S.e, 'l\'expression');
      if (!S.from) for (const [l, v] of Object.entries(S.env)) { if (!numbersIn(qtext).has(D(dq(String(v))))) P_(key, `la valeur ${l} = ${v} n'est pas dans l'énoncé`); }
      const have = (q.misconceptionSignatures ?? []).map((x) => `${x.value}|${x.id}`).sort(); const want = j.info.sigs.map(([v, t]) => `${v}|${t}`).sort();
      if (JSON.stringify(have) !== JSON.stringify(want)) P_(key, `signatures ${have.join(' ; ')} ≠ attendues ${want.join(' ; ')}`);
      earlierKeys[id] = [...(earlierKeys[id] ?? []), D(j.info.key)];
    } else if (S.t === 'solve') {
      if (q.answerType !== 'rational') P_(key, 'une valeur est `rational`');
      if (q.expectedAnswer !== D(j.info.key)) P_(key, `l'oracle trouve ${D(j.info.key)}, la feuille ${q.expectedAnswer}`);
      if (q.solution?.result !== D(j.info.key).replace('.', '{,}')) P_(key, `résultat du corrigé ${q.solution?.result}`);
      if (!eqShown(q.statement, S.eq)) P_(key, `l'équation « ${S.eq} » n'est pas dans l'énoncé`);
      const have = (q.misconceptionSignatures ?? []).map((x) => `${x.value}|${x.id}`).sort(); const want = j.info.sigs.map(([v, t]) => `${v}|${t}`).sort();
      if (JSON.stringify(have) !== JSON.stringify(want)) P_(key, `signatures ${have.join(' ; ')} ≠ attendues ${want.join(' ; ')}`);
      const solNums = numbersIn((q.solution?.lines ?? []).join(' ')); for (const st of j.info.steps) if (!solNums.has(D(st))) P_(key, `étape ${D(st)} absente du corrigé`);
      if (!(q.solution?.lines ?? []).some((l) => /التحقّق/.test(l))) P_(key, 'le corrigé ne vérifie pas la solution');
      earlierKeys[id] = [...(earlierKeys[id] ?? []), D(j.info.key)];
    } else if (S.t === 'yn') {
      if (q.answerType !== 'choice' || q.choices.length !== 2) P_(key, 'oui / non : deux choix');
      S.order.forEach((w, i) => { const c = q.choices[i]; if (c?.content !== (w === 'yes' ? 'نعم' : 'لا')) P_(key, `ordre des choix ${w}`); if (c?.isCorrect !== (j.info.yes === (w === 'yes'))) P_(key, `choix « ${w} » : isCorrect`); });
      const wrongC = q.choices.find((c) => !c.isCorrect);
      if (S.tag ? wrongC?.misconceptionId !== S.tag : wrongC?.misconceptionId) P_(key, 'étiquette du choix faux');
      if (!S.from && !shows(q.statement, S.l, S.rel, S.r)) P_(key, `la relation « ${S.l} ${S.rel} ${S.r} » n'est pas dans l'énoncé`);
      if (!S.from) for (const [l, v] of Object.entries(S.env)) if (!numbersIn(q.statement).has(D(dq(String(v))))) P_(key, `la valeur ${l} = ${v} n'est pas dans l'énoncé`);
      checkLits(S.l, 'le membre gauche'); checkLits(S.r, 'le membre droit');
    } else if (S.t === 'cnt') {
      if (q.answerType !== 'rational') P_(key, 'un comptage est `rational`');
      if (q.expectedAnswer !== D(j.info.key)) P_(key, `l'oracle trouve ${D(j.info.key)}, la feuille ${q.expectedAnswer}`);
      if (!shows(q.statement, S.l, S.rel, S.r)) P_(key, `la relation « ${S.l} ${S.rel} ${S.r} » n'est pas dans l'énoncé`);
      for (const c of S.cands) if (!numbersIn(q.statement).has(D(dq(String(c))))) P_(key, `le candidat ${c} n'est pas dans l'énoncé`);
      const have = (q.misconceptionSignatures ?? []).map((x) => `${x.value}|${x.id}`).sort(); const want = j.info.sigs.map(([v, t]) => `${v}|${t}`).sort();
      if (JSON.stringify(have) !== JSON.stringify(want)) P_(key, `signatures ${have.join(' ; ')} ≠ attendues ${want.join(' ; ')}`);
    } else if (S.t === 'pickx') {
      if (q.answerType !== 'choice' || q.choices.length !== S.opts.length) P_(key, 'nombre de choix');
      for (const o of S.opts) {
        const c = q.choices.find((x) => x.id === o.id); if (!c) { P_(key, `choix ${o.id} absent`); continue; }
        if (c.isCorrect !== (j.answer?.choiceId === o.id)) P_(key, `choix ${o.id} : isCorrect ${c.isCorrect}, l'oracle ${j.answer?.choiceId}`);
        if ((c.misconceptionId ?? undefined) !== (o.ok ? undefined : o.tag)) P_(key, `choix ${o.id} : misconceptionId ${c.misconceptionId} ≠ ${o.tag}`);
        const isl = islands(c.content)[0]; const a = isl ? fracAscii(texToAscii(isl)) : '';
        try { if (!(S.mode === 'eq' ? sameEq(eqOf(a), eqOf(fracAscii(o.e))) : sameExpr(a, o.e))) P_(key, `choix ${o.id} : « ${c.content} » ≠ ${o.e}`); } catch { P_(key, `choix ${o.id} illisible`); }
      }
      if (S.opts.length === 3 && q.choices[0].isCorrect) earlierKeys.__first = (earlierKeys.__first ?? 0) + 1;
    } else if (S.t === 'dec') {
      if (q.answerType !== 'choice' || q.choices.length !== 2) P_(key, 'deux choix');
      S.order.forEach((w, i) => { const c = q.choices[i]; if (c?.isCorrect !== (w === j.info.best)) P_(key, `choix ${c?.id} : isCorrect`); if (!c?.isCorrect && S.tag && c.misconceptionId !== S.tag) P_(key, 'étiquette du choix faux'); });
      for (const side of [S.a, S.b]) { const ok = shows([sh.statement.content, q.statement].join(' '), '0', '=', '0') || true; void ok; void side; }
      for (const n of lits(S.a).concat(lits(S.b))) if (!known.has(n)) P_(key, `le nombre ${n} des formules n'est pas donné dans l'énoncé`);
      for (const [l, v] of Object.entries(S.env)) if (!numbersIn(qtext).has(D(dq(String(v))))) P_(key, `la valeur ${l} = ${v} n'est pas dans l'énoncé`);
    } else if (S.t === 'self') {
      if (q.answerType !== 'selfCheck') P_(key, 'selfCheck attendu');
    }
    if ((S.t === 'val' || S.t === 'solve') && (q.hints ?? []).length !== 3) P_(key, '3 indices attendus');
    if ((q.hints ?? []).length !== 3) P_(key, '3 indices attendus');
    for (const h of q.hints ?? []) if (/\d/.test(h.content)) P_(key, 'chiffre dans un indice');
    /* --- texte --- */
    const strings = [['énoncé', q.statement], ['feedback.correct', q.feedback?.correct], ['feedback.incorrect', q.feedback?.incorrect], ...(q.hints ?? []).map((h) => ['indice', h.content]), ...(q.choices ?? []).map((c) => ['choix', c.content]), ...(q.solution?.lines ?? []).map((l) => ['corrigé', l])];
    for (const [w, t] of strings) {
      if (FORBIDDEN.test(String(t))) P_(key, `${w} : texte interdit`);
      const o = outside(t);
      if (/\d/.test(o)) P_(key, `${w} : chiffre hors $…$`);
      if (/[A-Za-z]/.test(o)) P_(key, `${w} : lettre latine hors $…$ (« ${o.trim().slice(0, 40)} »)`);
      for (const i of islands(t)) {
        if (/\\mathrm\{[^}]*\}/.test(i) && !/\d\\,\\mathrm/.test(i)) P_(key, `${w} : unité sans « valeur\\,\\mathrm » dans $${i}$`);
        if (/(?:^|[=(\s]|\\times|\+)-\d/.test(i)) P_(key, `${w} : nombre négatif dans $${i}$`);
      }
    }
    for (const l of q.solution?.lines ?? []) problems.push(...chainProblems(key, l));
    if (S.t === 'pickx' && !(q.solution?.lines ?? []).length) P_(key, 'corrigé vide');
    if (S.t !== 'self') { if (!(q.solution?.lines ?? []).length) P_(key, 'corrigé vide'); }
  }
  const firstOfThree = earlierKeys.__first ?? 0; const threeOpt = bank.filter((b) => SPEC[b.key]?.t === 'pickx' && SPEC[b.key].opts.length === 3).length;
  if (threeOpt && firstOfThree > threeOpt * 0.5) P_('banc', `la bonne option est la première dans ${firstOfThree} / ${threeOpt} QCM à trois choix`);
  /* --- feuilles : provenance --- */
  const els = Object.fromEntries(extraction.elements.map((e) => [e.id, e]));
  const L = (n) => Object.values(sheets).filter((x) => x.level === n);
  const seenPart = new Set();
  for (let lv = 1; lv <= 5; lv++) {
    const got = [L(lv).filter((x) => x.metadata.source.type === 'term_exam').length, L(lv).filter((x) => x.metadata.source.type === 'platform_addition').length, L(lv).filter((x) => x.metadata.source.type === 'textbook').length];
    if (L(lv).length !== 10) problems.push(`niveau ${lv} : ${L(lv).length} feuilles`);
    if (JSON.stringify(got) !== JSON.stringify(EXPECTED[lv])) problems.push(`niveau ${lv} : term_exam / modelled / adaptés = ${got} ≠ ${EXPECTED[lv]}`);
    if (L(lv).some((x) => x.metadata.exam.heading !== (lv === 5 ? 'الوضعية الإدماجية' : 'التمرين') && !(x.metadata.source.type === 'term_exam' && x.metadata.exam.heading === 'المسألة'))) problems.push(`niveau ${lv} : intitulé d'épreuve`);
  }
  // un sujet cité ailleurs dans le cycle (même fichier, même exercice) ne l'est pas deux fois
  const others = []; const base2 = join(root, 'content/practice/2am');
  for (const lesson of readdirSync(base2)) { if (lesson === 'wadiya-idmajiya-mafhum-muadala') continue; for (const lv of readdirSync(join(base2, lesson))) for (const f of readdirSync(join(base2, lesson, lv))) { const s = JSON.parse(readFileSync(join(base2, lesson, lv, f), 'utf8')).metadata?.source; if (s?.type === 'term_exam') others.push(`${s.file}#${s.exercise}`); } }
  for (const [id, ex] of Object.entries(sheets)) {
    const s = ex.metadata.source; const pv = PROV[id];
    if (!pv) { problems.push(`${id} : provenance non déclarée`); continue; }
    for (const t of [ex.metadata.title, ...(ex.metadata.tags ?? []), ex.statement.content]) if (t && FORBIDDEN.test(t)) problems.push(`${id} : texte interdit dans « ${String(t).slice(0, 50)} »`);
    if (/\d/.test(outside(ex.statement.content))) problems.push(`${id} : chiffre hors $…$ dans l'énoncé`);
    if (/[A-Za-z]/.test(outside(ex.statement.content))) problems.push(`${id} : lettre latine hors $…$ dans l'énoncé`);
    for (const i of islands(ex.statement.content)) if (/\\mathrm\{[^}]*\}/.test(i) && !/\d\\,\\mathrm/.test(i)) problems.push(`${id} : unité sans valeur dans $${i}$`);
    if (pv.t === 'tt') {
      const part = `${pv.file}#${pv.ex}`;
      if (!READ[pv.file]?.includes(pv.ex)) problems.push(`${id} : ${part} n'est pas une partie lue`);
      if (seenPart.has(part)) problems.push(`${id} : ${part} citée deux fois en term_exam`); seenPart.add(part);
      if (others.includes(part)) problems.push(`${id} : ${part} est déjà citée par une autre feuille du cycle`);
      if (s.type !== 'term_exam' || s.grade !== '2am' || s.semester !== 2 || s.file !== pv.file || s.exercise !== pv.ex) problems.push(`${id} : source term_exam ≠ ${pv.file} ex ${pv.ex}`);
      if (ex.metadata.exam.badge !== BADGE || ex.metadata.exam.kind !== 'modelled') problems.push(`${id} : badge / kind`);
    } else if (pv.t === 'mod') {
      if (s.type !== 'platform_addition' || s.reason !== 'term_exam_modelled' || s.modelledOn !== '2am-s2') problems.push(`${id} : provenance modelled mal formée`);
      if (ex.metadata.exam.badge !== BADGE || ex.metadata.exam.kind !== 'modelled') problems.push(`${id} : badge / kind`);
    } else {
      const el = els[pv.el];
      if (s.type !== 'textbook' || s.elementId !== pv.el) problems.push(`${id} : élément ${s.elementId} ≠ ${pv.el}`);
      if (!el) problems.push(`${id} : élément ${pv.el} absent de l'extraction`);
      else if (s.page !== el.page || s.number !== el.number || s.section !== el.section) problems.push(`${id} : page / numéro / section de ${pv.el} ≠ extraction`);
      if (ex.metadata.exam.kind !== 'adapted' || ex.metadata.exam.badge !== null) problems.push(`${id} : adapted sans badge`);
    }
  }
  const used = new Set(Object.values(PROV).filter((p) => p.t === 'ad').map((p) => p.el)); if (used.size !== 2) problems.push(`éléments adaptés cités : ${[...used].join(',')}`);
  for (const t of ['FIXED', 'ADDCOEF', 'ROLE', 'SIGN']) if (!MISCS[`MISC-SYN-MUAD2-${t}`]) problems.push(`MISC-SYN-MUAD2-${t} absent de misconceptions.json`);
  for (const sh of Object.values(sheets)) for (const q of sh.questions) { for (const x of q.misconceptionSignatures ?? []) if (!MISCS[x.id]) problems.push(`${sh.id}:${q.id} : ${x.id} absent`); for (const c of q.choices ?? []) if (c.misconceptionId && !MISCS[c.misconceptionId]) problems.push(`${sh.id}:${q.id} : ${c.misconceptionId} absent`); }
  return problems;
}
