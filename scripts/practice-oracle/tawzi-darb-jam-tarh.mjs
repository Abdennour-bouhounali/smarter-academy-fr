// Oracle du banc « tawzi-darb-jam-tarh » (توزيع الضرب على الجمع والطرح, 2AM unité 1, leçon 4, 2026-10-29) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec des outils écrits dans ce fichier (indépendants de
// packages/core et de chainOps.js) : rationnels EXACTS en BigInt, un parseur ASCII (nombres décimaux, lettre x, « ? », + - * / ( ),
// « 4x » = 4 * x) qui évalue en forme affine a·x + b (une seule lettre) et refuse tout intermédiaire négatif entre nombres (le
// 2AM n'a pas les relatifs). Les expressions sont retapées en ASCII dans SPEC (« * » = ×, « / » = ÷) ; audit() RELIT ensuite le
// LaTeX des feuilles (\times, \div, {,}, \,, \ldots) avec son propre lecteur et exige qu'il redonne la même chaîne :
//  - clé : val (valeur), dist (k(a ± b) calculé en deux manières), blank (le « ? » d'une égalité résolu par évaluation en 0 et 1),
//    lval (valeur pour x = …), digits (nombre de chiffres), cmp (comparaison à un budget / une longueur) ;
//  - QCM jugés option par option, les options étant CONSTRUITES ici : exp (nxxxxxxxx) et fac1, lexp (développement avec x),
//    yn (la MISE EN ÉGALITÉ est-elle vraie ?), prop (quelle propriété), name (nom d'une chaîne = dernière opération) ;
//  - lectures fautives nommées, chacune RECONSTRUITE ici : FIRSTONLY k(a+b) = k·a + b ; SIGNCHANGE k(a−b) = k·a + k·b (et sa
//    réciproque pour la factorisation) ; ADDK k + a ± b ; FACTORMULT k·a + k·b = k·a·b ; FACTORWRONG 8·13 − 8·7 = 8(13 − 8) ;
//    NOTATION 4(x − 3) = 4x − 3 ou 3x lu 3 + x ; une option sans balise est FAUSSE et ne reproduit AUCUNE lecture nommée ;
//  - chaque `$…$` des énoncés, options, indices, corrigés est relu : lisible, tous ses intermédiaires ≥ 0, chaque chaîne
//    « a = b = c » du corrigé a ses membres égaux, chaque fait « 6 × 43 = 258 » donné est vrai ;
//  - audit(bank) relit aussi le texte : aucune mention du manuel, argent dans $…\mathrm{DA}$, provenance (50 feuilles, 5 × 10,
//    sujets réellement lus, une partie d'un sujet jamais citée deux fois en `term_exam`).
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  zero() { return this.n === 0n; }
}
const Z = new Q(0n);
export const dq = (s) => { const m = /^(\d+)(?:\.(\d+))?$/.exec(String(s).trim()); if (!m) throw new Error(`nombre illisible : ${s}`); const f = m[2] ?? ''; return new Q(BigInt(m[1] + f), 10n ** BigInt(f.length)); };
/** Écriture décimale exacte (point), ou erreur si le rationnel n'est pas un décimal. */
export const D = (x) => {
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

/* ── formes affines a·x + b (a ≠ 0 seulement si la lettre x est libre) ── */
class Af {
  constructor(a, b) { this.a = a; this.b = b; }
  const() { return this.a.zero(); }
  eq(o) { return this.a.eq(o.a) && this.b.eq(o.b); }
}
/** Valeur d'un nœud. `env.x` : un nombre (Q) ou absent (x reste libre) ; `env.q` : la valeur du « ? ». */
function evNode(n, env) {
  switch (n.t) {
    case 'num': return new Af(Z, n.v);
    case 'x': if (env.x) return new Af(Z, env.x); return new Af(new Q(1n), Z);
    case 'q': if (!env.q) throw new Error('« ? » sans valeur'); return new Af(Z, env.q);
    default: {
      const l = evNode(n.l, env); const r = evNode(n.r, env);
      if (n.o === '+') return new Af(l.a.add(r.a), l.b.add(r.b));
      if (n.o === '-') {
        const out = new Af(l.a.sub(r.a), l.b.sub(r.b));
        if (!env.lax && l.const() && r.const() && out.b.neg()) throw new Error('intermédiaire négatif');
        return out;
      }
      if (n.o === '*') {
        if (!l.const() && !r.const()) throw new Error('produit de deux termes en x');
        return l.const() ? new Af(r.a.mul(l.b), r.b.mul(l.b)) : new Af(l.a.mul(r.b), l.b.mul(r.b));
      }
      if (!r.const() || r.b.zero()) throw new Error('division interdite');
      return new Af(l.a.div(r.b), l.b.div(r.b));
    }
  }
}
function tok(s) {
  const t = s.match(/\d+(?:\.\d+)?|[()+\-*/=?x]/g) ?? [];
  if (t.join('') !== s.replace(/\s+/g, '')) throw new Error(`caractères illisibles dans « ${s} »`);
  return t;
}
/** Arbre de « s » (sans « = »). Les parenthèses ne laissent pas de nœud ; « 4x » = 4 * x. */
export function parse(s) {
  const t = tok(s); let i = 0; let ord = 0;
  const factor = () => {
    const v = t[i];
    if (v === '(') { i++; const e = expr(); if (t[i] !== ')') throw new Error(`« ) » attendu dans « ${s} »`); i++; return e; }
    if (v === 'x') { i++; return { t: 'x' }; }
    if (v === '?') { i++; return { t: 'q' }; }
    if (v === undefined || !/^\d/.test(v)) throw new Error(`facteur attendu dans « ${s} »`);
    i++; const num = { t: 'num', v: dq(v), s: v };
    if (t[i] === 'x') { i++; return { t: 'op', o: '*', l: num, r: { t: 'x' }, ord: ord++, tok: i, implicit: true }; }
    return num;
  };
  const bin = (o, l, r) => ({ t: 'op', o, l, r, ord: ord++ });
  const term = () => { let l = factor(); while (t[i] === '*' || t[i] === '/') { const o = t[i++]; l = bin(o, l, factor()); } return l; };
  const expr = () => { let l = term(); while (t[i] === '+' || t[i] === '-') { const o = t[i++]; l = bin(o, l, term()); } return l; };
  const root = expr(); if (i !== t.length) throw new Error(`reste dans « ${s} »`);
  return root;
}
const A = (s, env = {}) => evNode(parse(s), env);
/** Valeur numérique d'une expression sans lettre libre. */
export const E = (s, env = {}) => { const a = A(s, env); if (!a.const()) throw new Error(`« ${s} » dépend de x`); return a.b; };
export const Ev = (s, env) => D(E(s, env));
const sameAf = (a, b) => a.eq(b);
/** Comparaison indépendante en virgule flottante (garde-fou contre une erreur du parseur ci-dessus). */
const float = (s, x) => { const js = s.replace(/(\d+(?:\.\d+)?)x/g, '($1*x)').replace(/\bx\b/g, `(${x ?? 0})`); return Function(`return (${js});`)(); };

/* ── les lectures fautives, reconstruites ici ───────────────────────── */
const flip = (o) => (o === '+' ? '-' : '+');
const NOTATION_READ = (s) => s.replace(/(\d+(?:\.\d+)?)x/g, '($1+x)');
/** Options d'un développement k(a ± b) (côté g) ou d'une factorisation, indexées par le nom de la lecture. */
export function builders(S) {
  const { k, a, b, op } = S; const R_ = S.side === 'R';
  if (S.t === 'lexp') {
    const km2 = D(dq(String(k)).mul(dq(String(S.m ?? 1)))); const kb = D(dq(String(k)).mul(dq(String(b))));
    const lead = (c) => (c === '1' ? 'x' : `${c}x`);
    return {
      show: R_ ? `(${S.m && S.m !== 1 ? `${S.m}x` : 'x'}${op}${b})*${k}` : `${k}*(${S.m && S.m !== 1 ? `${S.m}x` : 'x'}${op}${b})`,
      OK: `${lead(km2)}${op}${kb}`, NOTATION: `${lead(km2)}${op}${b}`, SIGNCHANGE: `${lead(km2)}${flip(op)}${kb}`,
    };
  }
  if (S.t === 'fac1') return { show: `${k}+${k}*${b}`, OK: `${k}*(1+${b})`, FACTORWRONG: `${k}*(${k}+${b})`, ADDK: `(${k}+1)*${b}` };
  if (S.dir === 'factor') {
    return R_
      ? { show: `${a}*${k}${op}${b}*${k}`, OK: `(${a}${op}${b})*${k}`, FACTORMULT: `${a}*${b}*${k}`, SIGNCHANGE: `(${a}${flip(op)}${b})*${k}` }
      : { show: `${k}*${a}${op}${k}*${b}`, OK: `${k}*(${a}${op}${b})`, FACTORMULT: `${k}*${a}*${b}`, FACTORWRONG: `${k}*(${a}${op}${k})`, SIGNCHANGE: `${k}*(${a}${flip(op)}${b})` };
  }
  return R_
    ? { show: `(${a}${op}${b})*${k}`, OK: `${a}*${k}${op}${b}*${k}`, FIRSTONLY: `${a}*${k}${op}${b}`, SIGNCHANGE: `${a}*${k}${flip(op)}${b}*${k}` }
    : { show: `${k}*(${a}${op}${b})`, OK: `${k}*${a}${op}${k}*${b}`, FIRSTONLY: `${k}*${a}${op}${b}`, SIGNCHANGE: `${k}*${a}${flip(op)}${k}*${b}`, ADDK: `${k}+${a}${op}${b}` };
}
const MISC = (id) => `MISC-TAWZI-${id}`;
const NAMES = { '+': 'مجموع', '-': 'فرق', '*': 'جداء', '/': 'حاصل قسمة' };
const PROPS = { DJ: ['توزيع الضرب على الجمع', '+'], DT: ['توزيع الضرب على الطرح', '-'], CJ: ['تبديل حدّي الجمع', null], AD: ['تجميع عوامل الجداء', null] };

/* ── noms : première opération écrite / première opération faite ─────── */
function firstWritten(s) { const m = /[+\-*/]/.exec(s.replace(/\s+/g, '')); return m ? m[0] : null; }
function postOrder(n, out = []) { if (n.t === 'op') { postOrder(n.l, out); postOrder(n.r, out); out.push(n); } return out; }
const firstDone = (s) => { const o = postOrder(parse(s)); return o.length ? o[0].o : null; };
const rootOp = (s) => parse(s).o;

/* ── jugement d'une spec ─────────────────────────────────────────────── */
const xEnv = (S) => (S.x === undefined ? {} : { x: dq(S.x) });
const afEq = (L, Rr, env = {}) => sameAf(A(L, env), A(Rr, env));
/** Les options d'un QCM de spec S : [{ id, ascii, tag, ok }] dans l'ordre de S.opts, avec leur vérité calculée. */
export function optionsOf(S) {
  if (['exp', 'lexp', 'fac1'].includes(S.t)) {
    const B = builders(S);
    return S.opts.map((id) => ({ id, ascii: B[id], tag: id === 'OK' ? null : id, ok: afEq(B.show, B[id]) }));
  }
  if (S.t === 'name') {
    const fw = firstWritten(S.c); const fd = firstDone(S.c); const root = rootOp(S.c);
    return S.opts.map((o) => ({ id: o, name: NAMES[o], tagSet: o === root ? [] : [...(o === fw ? ['FIRSTWRITTEN'] : []), ...(o === fd ? ['FIRSTOP'] : [])], ok: o === root }));
  }
  if (S.t === 'prop') {
    const want = S.op;
    return S.opts.map((o) => ({ id: o, name: PROPS[o][0], ok: PROPS[o][1] === want }));
  }
  if (S.t === 'yn' || S.t === 'cmp') return null;
  throw new Error(`pas d'options pour ${S.t}`);
}
/** La mise en égalité d'une spec yn : { claim (ASCII), truth }. */
export function claimOf(S) {
  const B = builders({ ...S, t: S.letter ? 'lexp' : 'exp' });
  const rhs = B[S.rhs]; const claim = `${B.show}=${rhs}`;
  const truth = afEq(B.show, rhs);
  return { claim, truth, lhs: B.show, rhs };
}
export function judge(S) {
  switch (S.t) {
    case 'val': return { answer: R(Ev(S.c, S.x === undefined ? {} : xEnv(S))) };
    case 'dist': return { answer: R(Ev(`${S.k}*(${S.a}${S.op}${S.b})`)) };
    case 'blank': {
      const f = (q) => { const [l, r] = S.eq.split('='); return A(l, { q: dq(q), lax: true }).b.sub(A(r, { q: dq(q), lax: true }).b); };
      const d0 = f('0'); const d1 = f('1'); const slope = d1.sub(d0);
      if (slope.zero()) throw new Error('blank : « ? » sans effet');
      const root = d0.mul(new Q(-1n)).div(slope);
      const [l0, r0] = S.eq.split('='); A(l0, { q: root }); A(r0, { q: root }); // au « ? » trouvé, aucun intermédiaire négatif
      if (root.neg()) throw new Error('blank : racine négative');
      return { answer: R(D(root)), root };
    }
    case 'lval': return { answer: R(Ev(S.c, xEnv(S))) };
    case 'digits': return { answer: R(String(Ev(S.c).replace(/\.\d+$/, '').length)) };
    case 'exp': case 'lexp': case 'fac1': case 'name': case 'prop': {
      const o = optionsOf(S); const ok = o.filter((x) => x.ok);
      if (ok.length !== 1) throw new Error(`${ok.length} options justes`);
      return { answer: C('ABCDEF'[o.indexOf(ok[0])]) };
    }
    case 'yn': { const c = claimOf(S); return { answer: C('ABCDEF'[S.order.indexOf(c.truth ? 'yes' : 'no')]), truth: c.truth }; }
    case 'cmp': {
      const v = E(S.c); const n = dq(S.n);
      const truth = S.rel === 'le' ? !n.sub(v).neg() : !v.sub(n).neg();
      return { answer: C('ABCDEF'[S.order.indexOf(truth ? 'yes' : 'no')]), truth };
    }
    case 'self': return {};
    default: throw new Error(`genre ${S.t}`);
  }
}
/** Signatures d'une réponse constructed : { valeur décimale → id } reconstruites ici. */
export function sigsOf(S) {
  const out = [];
  if (S.t === 'dist') {
    const B = builders({ ...S, t: 'exp', dir: 'expand' });
    for (const id of S.sigs ?? []) out.push([D(E(B[id])), id]);
  }
  if (S.t === 'lval') for (const id of S.sigs ?? []) { if (id !== 'NOTATION') throw new Error('signature inconnue'); out.push([D(E(NOTATION_READ(S.c), xEnv(S))), id]); }
  return out;
}

/* ── SPEC : les questions retapées en ASCII (« * » = ×, « / » = ÷, « 4x » = 4 × x), générées avec la banque ── */
export const SPEC = {
  "ex-2am-tawzi-darb-jam-tarh-l1-001:q1": { "t": "dist", "lp": "P1", "k": "0.35", "a": 12, "b": 28, "op": "+", "sigs": [ "FIRSTONLY", "ADDK" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-001:q2": { "t": "val", "lp": "P1", "c": "0.35*12+0.35*28" },
  "ex-2am-tawzi-darb-jam-tarh-l1-001:q3": { "t": "exp", "lp": "P1", "k": "0.35", "a": 12, "b": 28, "op": "+", "dir": "expand", "opts": [ "FIRSTONLY", "OK", "ADDK" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-001:q4": { "t": "prop", "lp": "P1", "k": "0.35", "a": 12, "b": 28, "op": "+", "opts": [ "CJ", "DJ", "AD" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-002:q1": { "t": "dist", "lp": "P1", "k": 4, "a": 6, "b": 9, "op": "+", "sigs": [ "FIRSTONLY", "ADDK" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-002:q2": { "t": "val", "lp": "P1", "c": "4*6+4*9" },
  "ex-2am-tawzi-darb-jam-tarh-l1-002:q3": { "t": "blank", "lp": "P1", "eq": "4*(6+9)=4*6+4*?" },
  "ex-2am-tawzi-darb-jam-tarh-l1-002:q4": { "t": "prop", "lp": "P1", "k": 4, "a": 6, "b": 9, "op": "+", "opts": [ "AD", "CJ", "DJ" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-003:q1": { "t": "dist", "lp": "P2", "k": 6, "a": 25, "b": 8, "op": "-", "sigs": [ "FIRSTONLY", "SIGNCHANGE" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-003:q2": { "t": "val", "lp": "P2", "c": "6*25-6*8" },
  "ex-2am-tawzi-darb-jam-tarh-l1-003:q3": { "t": "exp", "lp": "P2", "k": 6, "a": 25, "b": 8, "op": "-", "dir": "expand", "opts": [ "SIGNCHANGE", "OK", "FIRSTONLY" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-003:q4": { "t": "prop", "lp": "P2", "k": 6, "a": 25, "b": 8, "op": "-", "opts": [ "DT", "AD", "DJ" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-004:q1": { "t": "exp", "lp": "P3", "k": 4, "a": 8.5, "b": 3.5, "op": "-", "dir": "factor", "opts": [ "FACTORMULT", "FACTORWRONG", "OK", "SIGNCHANGE" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-004:q2": { "t": "val", "lp": "P2", "c": "4*(8.5-3.5)" },
  "ex-2am-tawzi-darb-jam-tarh-l1-004:q3": { "t": "val", "lp": "P2", "c": "4*8.5-4*3.5" },
  "ex-2am-tawzi-darb-jam-tarh-l1-004:q4": { "t": "blank", "lp": "P3", "eq": "4*8.5-4*3.5=4*(8.5-?)" },
  "ex-2am-tawzi-darb-jam-tarh-l1-005:q1": { "t": "exp", "lp": "P3", "k": 12, "a": 5, "b": 8, "op": "+", "dir": "expand", "opts": [ "OK", "FIRSTONLY", "ADDK" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-005:q2": { "t": "val", "lp": "P1", "c": "12*5+12*8" },
  "ex-2am-tawzi-darb-jam-tarh-l1-005:q3": { "t": "blank", "lp": "P1", "eq": "12*(5+8)=12*?+12*8" },
  "ex-2am-tawzi-darb-jam-tarh-l1-005:q4": { "t": "yn", "lp": "P3", "k": 12, "a": 5, "b": 8, "op": "+", "dir": "expand", "rhs": "FIRSTONLY", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-006:q1": { "t": "exp", "lp": "P3", "k": 7, "a": 13, "b": 17, "op": "+", "dir": "factor", "opts": [ "FACTORMULT", "OK", "FACTORWRONG" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-006:q2": { "t": "val", "lp": "P3", "c": "7*(13+17)" },
  "ex-2am-tawzi-darb-jam-tarh-l1-006:q3": { "t": "blank", "lp": "P3", "eq": "7*13+7*17=7*(?+17)" },
  "ex-2am-tawzi-darb-jam-tarh-l1-006:q4": { "t": "val", "lp": "P2", "c": "2.5*(18-8)" },
  "ex-2am-tawzi-darb-jam-tarh-l1-007:q1": { "t": "exp", "lp": "P2", "k": 9, "a": 8, "b": 3, "op": "-", "dir": "expand", "opts": [ "OK", "FIRSTONLY", "SIGNCHANGE" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-007:q2": { "t": "val", "lp": "P2", "c": "9*8-9*3" },
  "ex-2am-tawzi-darb-jam-tarh-l1-007:q3": { "t": "yn", "lp": "P2", "k": 9, "a": 8, "b": 3, "op": "-", "dir": "expand", "rhs": "SIGNCHANGE", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-007:q4": { "t": "prop", "lp": "P2", "k": 9, "a": 8, "b": 3, "op": "-", "opts": [ "DJ", "DT", "CJ" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-008:q1": { "t": "blank", "lp": "P1", "eq": "15*(20+4)=15*?+15*4" },
  "ex-2am-tawzi-darb-jam-tarh-l1-008:q2": { "t": "blank", "lp": "P2", "eq": "6*9-6*4=6*(?-4)" },
  "ex-2am-tawzi-darb-jam-tarh-l1-008:q3": { "t": "blank", "lp": "P3", "eq": "23*30-23*7=?*(30-7)" },
  "ex-2am-tawzi-darb-jam-tarh-l1-008:q4": { "t": "blank", "lp": "P2", "eq": "(12-5)*17=12*?-5*17" },
  "ex-2am-tawzi-darb-jam-tarh-l1-009:q1": { "t": "exp", "lp": "P3", "k": 18, "a": 5, "b": 9, "op": "+", "dir": "expand", "opts": [ "OK", "ADDK", "FIRSTONLY" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-009:q2": { "t": "exp", "lp": "P3", "k": 7.5, "a": 9, "b": 3.5, "op": "-", "dir": "expand", "opts": [ "FIRSTONLY", "OK", "SIGNCHANGE" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-009:q3": { "t": "exp", "lp": "P3", "k": 2.4, "a": 11, "b": 6, "op": "+", "dir": "expand", "side": "R", "opts": [ "FIRSTONLY", "SIGNCHANGE", "OK" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-009:q4": { "t": "exp", "lp": "P3", "k": 10, "a": 8.6, "b": 4.1, "op": "-", "dir": "expand", "side": "R", "opts": [ "OK", "SIGNCHANGE", "FIRSTONLY" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-010:q1": { "t": "exp", "lp": "P3", "k": 6, "a": 14, "b": 16, "op": "+", "dir": "factor", "opts": [ "OK", "FACTORMULT", "FACTORWRONG" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-010:q2": { "t": "exp", "lp": "P3", "k": 2.5, "a": 14, "b": 9, "op": "-", "dir": "factor", "opts": [ "FACTORWRONG", "FACTORMULT", "OK", "SIGNCHANGE" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-010:q3": { "t": "exp", "lp": "P3", "k": 4, "a": 7.3, "b": 5.2, "op": "+", "dir": "factor", "side": "R", "opts": [ "FACTORMULT", "SIGNCHANGE", "OK" ] },
  "ex-2am-tawzi-darb-jam-tarh-l1-010:q4": { "t": "exp", "lp": "P3", "k": 3, "a": 15.8, "b": 6.6, "op": "-", "dir": "factor", "side": "R", "opts": [ "OK", "SIGNCHANGE", "FACTORMULT" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-001:q1": { "t": "fac1", "lp": "P3", "k": 6.5, "b": 2.4, "opts": [ "ADDK", "OK", "FACTORWRONG" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-001:q2": { "t": "val", "lp": "P3", "c": "6.5*(1+2.4)" },
  "ex-2am-tawzi-darb-jam-tarh-l2-001:q3": { "t": "blank", "lp": "P3", "eq": "8*3.6-8*1.6+16=8*(3.6-1.6+?)" },
  "ex-2am-tawzi-darb-jam-tarh-l2-001:q4": { "t": "val", "lp": "P2", "c": "8*3.6-8*1.6+16" },
  "ex-2am-tawzi-darb-jam-tarh-l2-002:q1": { "t": "yn", "lp": "P1", "k": 7, "a": 40, "b": 3, "op": "+", "dir": "expand", "rhs": "FIRSTONLY", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-002:q2": { "t": "yn", "lp": "P2", "k": 12, "a": 9, "b": 5, "op": "-", "dir": "expand", "rhs": "SIGNCHANGE", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-002:q3": { "t": "yn", "lp": "P1", "k": 6, "a": 15, "b": 4, "op": "+", "dir": "expand", "rhs": "OK", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-002:q4": { "t": "yn", "lp": "P3", "k": 8, "a": 13, "b": 7, "op": "-", "dir": "factor", "rhs": "FACTORWRONG", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-002:q5": { "t": "self", "lp": "P3" },
  "ex-2am-tawzi-darb-jam-tarh-l2-003:q1": { "t": "prop", "lp": "P1", "k": 5, "a": 12, "b": 3, "op": "+", "opts": [ "DT", "DJ", "CJ" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-003:q2": { "t": "prop", "lp": "P2", "k": 9, "a": 14, "b": 6, "op": "-", "opts": [ "AD", "DJ", "DT" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-003:q3": { "t": "prop", "lp": "P3", "k": 4, "a": 15, "b": 7, "op": "-", "opts": [ "DT", "CJ", "AD" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-003:q4": { "t": "yn", "lp": "P3", "k": 5, "a": 12, "b": 3, "op": "+", "dir": "expand", "rhs": "ADDK", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-004:q1": { "t": "yn", "lp": "P1", "k": 3, "a": 20, "b": 5, "op": "+", "dir": "expand", "rhs": "ADDK", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-004:q2": { "t": "yn", "lp": "P2", "k": 4, "a": 15, "b": 6, "op": "-", "dir": "expand", "rhs": "ADDK", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-004:q3": { "t": "yn", "lp": "P3", "k": 9, "a": 12, "b": 5, "op": "+", "dir": "factor", "rhs": "SIGNCHANGE", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-004:q4": { "t": "yn", "lp": "P3", "k": 9, "a": 14, "b": 6, "op": "-", "dir": "factor", "rhs": "OK", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-004:q5": { "t": "self", "lp": "P3" },
  "ex-2am-tawzi-darb-jam-tarh-l2-005:q1": { "t": "exp", "lp": "P4", "k": 7, "a": 100, "b": 1, "op": "-", "dir": "expand", "side": "R", "opts": [ "FIRSTONLY", "OK", "SIGNCHANGE" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-005:q2": { "t": "val", "lp": "P4", "c": "99*7" },
  "ex-2am-tawzi-darb-jam-tarh-l2-005:q3": { "t": "exp", "lp": "P4", "k": 6, "a": 50, "b": 2, "op": "-", "dir": "expand", "side": "R", "opts": [ "OK", "SIGNCHANGE", "FIRSTONLY" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-005:q4": { "t": "val", "lp": "P4", "c": "48*6" },
  "ex-2am-tawzi-darb-jam-tarh-l2-006:q1": { "t": "yn", "lp": "P1", "k": 2.5, "a": 4, "b": 6, "op": "+", "dir": "expand", "rhs": "OK", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-006:q2": { "t": "yn", "lp": "P1", "k": 1.5, "a": 8, "b": 2.4, "op": "+", "dir": "expand", "rhs": "FIRSTONLY", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-006:q3": { "t": "yn", "lp": "P3", "k": 3.5, "a": 2, "b": 6, "op": "+", "dir": "factor", "rhs": "FACTORMULT", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-006:q4": { "t": "yn", "lp": "P3", "k": 4.2, "a": 5, "b": 3, "op": "-", "dir": "factor", "rhs": "OK", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-006:q5": { "t": "self", "lp": "P3" },
  "ex-2am-tawzi-darb-jam-tarh-l2-007:q1": { "t": "yn", "lp": "P1", "k": 7, "a": 16, "b": 5, "op": "+", "dir": "expand", "rhs": "SIGNCHANGE", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-007:q2": { "t": "yn", "lp": "P2", "k": 15, "a": 12, "b": 9, "op": "-", "dir": "expand", "rhs": "FIRSTONLY", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-007:q3": { "t": "yn", "lp": "P3", "k": 40, "a": 8, "b": 3, "op": "-", "dir": "factor", "rhs": "SIGNCHANGE", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-007:q4": { "t": "yn", "lp": "P3", "k": 9, "a": 14, "b": 6, "op": "-", "dir": "factor", "rhs": "FACTORWRONG", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-007:q5": { "t": "self", "lp": "P3" },
  "ex-2am-tawzi-darb-jam-tarh-l2-008:q1": { "t": "exp", "lp": "P4", "k": 6, "a": 30, "b": 8, "op": "+", "dir": "expand", "side": "R", "opts": [ "OK", "FIRSTONLY", "SIGNCHANGE" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-008:q2": { "t": "exp", "lp": "P4", "k": 6, "a": 40, "b": 2, "op": "-", "dir": "expand", "side": "R", "opts": [ "OK", "SIGNCHANGE", "FIRSTONLY" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-008:q3": { "t": "val", "lp": "P4", "c": "38*6" },
  "ex-2am-tawzi-darb-jam-tarh-l2-008:q4": { "t": "yn", "lp": "P4", "k": 6, "a": 40, "b": 2, "op": "-", "dir": "expand", "side": "R", "rhs": "SIGNCHANGE", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-009:q1": { "t": "val", "lp": "P3", "c": "8*(325+3)" },
  "ex-2am-tawzi-darb-jam-tarh-l2-009:q2": { "t": "val", "lp": "P3", "c": "9*(47-5)" },
  "ex-2am-tawzi-darb-jam-tarh-l2-009:q3": { "t": "yn", "lp": "P3", "k": 8, "a": 325, "b": 3, "op": "+", "dir": "expand", "rhs": "FIRSTONLY", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-010:q1": { "t": "yn", "lp": "P2", "k": 14, "a": 9, "b": 4, "op": "-", "dir": "expand", "rhs": "OK", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-010:q2": { "t": "yn", "lp": "P3", "k": 6, "a": 7, "b": 5, "op": "+", "dir": "factor", "rhs": "FACTORMULT", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-010:q3": { "t": "yn", "lp": "P2", "k": 11, "a": 20, "b": 8, "op": "-", "dir": "expand", "rhs": "FIRSTONLY", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l2-010:q4": { "t": "prop", "lp": "P3", "k": 3, "a": 18, "b": 5, "op": "-", "opts": [ "DT", "DJ", "AD" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-001:q1": { "t": "exp", "lp": "P3", "k": 3.2, "a": 0.25, "b": 0.95, "op": "+", "dir": "factor", "opts": [ "FACTORMULT", "OK", "FACTORWRONG" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-001:q2": { "t": "val", "lp": "P3", "c": "0.25+0.95" },
  "ex-2am-tawzi-darb-jam-tarh-l3-001:q3": { "t": "val", "lp": "P3", "c": "3.2*(0.25+0.95)" },
  "ex-2am-tawzi-darb-jam-tarh-l3-001:q4": { "t": "val", "lp": "P1", "c": "3.2*0.25+3.2*0.95" },
  "ex-2am-tawzi-darb-jam-tarh-l3-002:q1": { "t": "exp", "lp": "P3", "k": 7.5, "a": 14, "b": 2.5, "op": "+", "dir": "expand", "opts": [ "OK", "FIRSTONLY", "ADDK" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-002:q2": { "t": "val", "lp": "P1", "c": "7.5*14" },
  "ex-2am-tawzi-darb-jam-tarh-l3-002:q3": { "t": "val", "lp": "P1", "c": "7.5*2.5" },
  "ex-2am-tawzi-darb-jam-tarh-l3-002:q4": { "t": "val", "lp": "P1", "c": "7.5*14+7.5*2.5" },
  "ex-2am-tawzi-darb-jam-tarh-l3-003:q1": { "t": "exp", "lp": "P3", "k": 2.6, "a": 5, "b": 1.5, "op": "-", "dir": "expand", "opts": [ "OK", "SIGNCHANGE", "FIRSTONLY" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-003:q2": { "t": "val", "lp": "P2", "c": "2.6*5-2.6*1.5" },
  "ex-2am-tawzi-darb-jam-tarh-l3-003:q3": { "t": "val", "lp": "P2", "c": "2.6*(5-1.5)" },
  "ex-2am-tawzi-darb-jam-tarh-l3-003:q4": { "t": "yn", "lp": "P2", "k": 2.6, "a": 5, "b": 1.5, "op": "-", "dir": "expand", "rhs": "FIRSTONLY", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-004:q1": { "t": "lexp", "lp": "P3", "k": 4, "b": 6, "op": "-", "opts": [ "NOTATION", "OK", "SIGNCHANGE" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-004:q2": { "t": "lval", "lp": "P3", "c": "4*(x-6)", "x": "9" },
  "ex-2am-tawzi-darb-jam-tarh-l3-004:q3": { "t": "lval", "lp": "P3", "c": "4x-24", "x": "9" },
  "ex-2am-tawzi-darb-jam-tarh-l3-004:q4": { "t": "lval", "lp": "P3", "c": "4x-24", "x": "6" },
  "ex-2am-tawzi-darb-jam-tarh-l3-005:q1": { "t": "val", "lp": "P4", "c": "45*11" },
  "ex-2am-tawzi-darb-jam-tarh-l3-005:q2": { "t": "val", "lp": "P4", "c": "28*99" },
  "ex-2am-tawzi-darb-jam-tarh-l3-005:q3": { "t": "val", "lp": "P4", "c": "3.2*101" },
  "ex-2am-tawzi-darb-jam-tarh-l3-005:q4": { "t": "val", "lp": "P4", "c": "64*9" },
  "ex-2am-tawzi-darb-jam-tarh-l3-006:q1": { "t": "val", "lp": "P4", "c": "6.5*11" },
  "ex-2am-tawzi-darb-jam-tarh-l3-006:q2": { "t": "val", "lp": "P4", "c": "35*99" },
  "ex-2am-tawzi-darb-jam-tarh-l3-006:q3": { "t": "val", "lp": "P4", "c": "17*6.1+17*3.9" },
  "ex-2am-tawzi-darb-jam-tarh-l3-006:q4": { "t": "val", "lp": "P4", "c": "12*8.4+12*1.6" },
  "ex-2am-tawzi-darb-jam-tarh-l3-007:q1": { "t": "lexp", "lp": "P3", "k": 5, "b": 4, "op": "-", "opts": [ "OK", "NOTATION", "SIGNCHANGE" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-007:q2": { "t": "lval", "lp": "P3", "c": "5*(x-4)", "x": "7" },
  "ex-2am-tawzi-darb-jam-tarh-l3-007:q3": { "t": "lval", "lp": "P3", "c": "5x-20", "x": "7" },
  "ex-2am-tawzi-darb-jam-tarh-l3-007:q4": { "t": "yn", "lp": "P3", "k": 5, "b": 4, "op": "-", "rhs": "NOTATION", "letter": true, "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-008:q1": { "t": "lexp", "lp": "P3", "k": 3, "b": 7, "op": "+", "opts": [ "NOTATION", "OK", "SIGNCHANGE" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-008:q2": { "t": "lval", "lp": "P3", "c": "3*(x+7)", "x": "2.5" },
  "ex-2am-tawzi-darb-jam-tarh-l3-008:q3": { "t": "lval", "lp": "P3", "c": "3x+21", "x": "2.5" },
  "ex-2am-tawzi-darb-jam-tarh-l3-008:q4": { "t": "lval", "lp": "P3", "c": "3x+7", "x": "2.5", "sigs": [ "NOTATION" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-009:q1": { "t": "lexp", "lp": "P3", "k": 4, "b": 3, "op": "+", "m": 2, "opts": [ "OK", "SIGNCHANGE", "NOTATION" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-009:q2": { "t": "lval", "lp": "P3", "c": "4*(2x+3)", "x": "0.5", "sigs": [ "NOTATION" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-009:q3": { "t": "lval", "lp": "P3", "c": "8x+12", "x": "0.5", "sigs": [ "NOTATION" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-009:q4": { "t": "val", "lp": "P4", "c": "17*5.39-17*2.39" },
  "ex-2am-tawzi-darb-jam-tarh-l3-010:q1": { "t": "lexp", "lp": "P3", "k": 6, "b": 2, "op": "-", "opts": [ "OK", "NOTATION", "SIGNCHANGE" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-010:q2": { "t": "lexp", "lp": "P3", "k": 3, "b": 4, "op": "+", "side": "R", "opts": [ "NOTATION", "SIGNCHANGE", "OK" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-010:q3": { "t": "lexp", "lp": "P3", "k": 5, "b": 1, "op": "-", "m": 2, "opts": [ "SIGNCHANGE", "OK", "NOTATION" ] },
  "ex-2am-tawzi-darb-jam-tarh-l3-010:q4": { "t": "lval", "lp": "P3", "c": "5*(2x-1)", "x": "1", "sigs": [ "NOTATION" ] },
  "ex-2am-tawzi-darb-jam-tarh-l4-001:q1": { "t": "name", "lp": "P3", "nc": true, "c": "3*(14+6)-2*5", "opts": [ "*", "-", "+" ] },
  "ex-2am-tawzi-darb-jam-tarh-l4-001:q2": { "t": "val", "lp": "P3", "c": "3*(14+6)-2*5" },
  "ex-2am-tawzi-darb-jam-tarh-l4-001:q3": { "t": "val", "lp": "P3", "c": "3*14+3*6-2*5" },
  "ex-2am-tawzi-darb-jam-tarh-l4-001:q4": { "t": "blank", "lp": "P1", "eq": "3*(14+6)-2*5=?-2*5" },
  "ex-2am-tawzi-darb-jam-tarh-l4-002:q1": { "t": "name", "lp": "P3", "nc": true, "c": "20+4*(15-5)", "opts": [ "+", "*", "-" ] },
  "ex-2am-tawzi-darb-jam-tarh-l4-002:q2": { "t": "val", "lp": "P3", "c": "20+4*(15-5)" },
  "ex-2am-tawzi-darb-jam-tarh-l4-002:q3": { "t": "val", "lp": "P3", "c": "20+4*15-4*5" },
  "ex-2am-tawzi-darb-jam-tarh-l4-002:q4": { "t": "yn", "lp": "P2", "k": 4, "a": 15, "b": 5, "op": "-", "dir": "expand", "rhs": "FIRSTONLY", "order": [ "yes", "no" ] },
  "ex-2am-tawzi-darb-jam-tarh-l4-003:q1": { "t": "name", "lp": "P3", "nc": true, "c": "(36+24)*5-8*(9-4)", "opts": [ "+", "-", "*" ] },
  "ex-2am-tawzi-darb-jam-tarh-l4-003:q2": { "t": "val", "lp": "P3", "c": "(36+24)*5-8*(9-4)" },
  "ex-2am-tawzi-darb-jam-tarh-l4-003:q3": { "t": "val", "lp": "P3", "c": "36*5+24*5-8*9+8*4" },
  "ex-2am-tawzi-darb-jam-tarh-l4-003:q4": { "t": "blank", "lp": "P1", "eq": "(36+24)*5=36*5+?*5" },
  "ex-2am-tawzi-darb-jam-tarh-l4-004:q1": { "t": "name", "lp": "P3", "nc": true, "c": "4.5*12+4.5*8-4.5*5", "opts": [ "*", "-", "+" ] },
  "ex-2am-tawzi-darb-jam-tarh-l4-004:q2": { "t": "blank", "lp": "P3", "eq": "4.5*12+4.5*8-4.5*5=4.5*(12+8-?)" },
  "ex-2am-tawzi-darb-jam-tarh-l4-004:q3": { "t": "val", "lp": "P3", "c": "4.5*(12+8-5)" },
  "ex-2am-tawzi-darb-jam-tarh-l4-004:q4": { "t": "val", "lp": "P2", "c": "4.5*12+4.5*8-4.5*5" },
  "ex-2am-tawzi-darb-jam-tarh-l4-005:q1": { "t": "name", "lp": "P3", "nc": true, "c": "6+3*(x-2)", "opts": [ "+", "*", "-" ] },
  "ex-2am-tawzi-darb-jam-tarh-l4-005:q2": { "t": "lval", "lp": "P3", "c": "6+3*(x-2)", "x": "5" },
  "ex-2am-tawzi-darb-jam-tarh-l4-005:q3": { "t": "lval", "lp": "P3", "c": "6+3x-6", "x": "5", "sigs": [ "NOTATION" ] },
  "ex-2am-tawzi-darb-jam-tarh-l4-005:q4": { "t": "lval", "lp": "P3", "c": "6+3*(x-2)", "x": "2" },
  "ex-2am-tawzi-darb-jam-tarh-l4-006:q1": { "t": "name", "lp": "P3", "nc": true, "c": "8*20-8*5", "opts": [ "*", "-", "+" ] },
  "ex-2am-tawzi-darb-jam-tarh-l4-006:q2": { "t": "val", "lp": "P2", "c": "8*20-8*5" },
  "ex-2am-tawzi-darb-jam-tarh-l4-006:q3": { "t": "exp", "lp": "P3", "k": 8, "a": 20, "b": 5, "op": "-", "dir": "factor", "opts": [ "OK", "FACTORMULT", "FACTORWRONG" ] },
  "ex-2am-tawzi-darb-jam-tarh-l4-006:q4": { "t": "val", "lp": "P3", "c": "8*(20-5)" },
  "ex-2am-tawzi-darb-jam-tarh-l4-007:q1": { "t": "name", "lp": "P3", "nc": true, "c": "(15+5)*4+(9-3)*4", "opts": [ "*", "+", "-" ] },
  "ex-2am-tawzi-darb-jam-tarh-l4-007:q2": { "t": "val", "lp": "P3", "c": "(15+5)*4+(9-3)*4" },
  "ex-2am-tawzi-darb-jam-tarh-l4-007:q3": { "t": "val", "lp": "P3", "c": "(15+5+9-3)*4" },
  "ex-2am-tawzi-darb-jam-tarh-l4-007:q4": { "t": "blank", "lp": "P3", "eq": "(15+5)*4+(9-3)*4=(15+5+9-?)*4" },
  "ex-2am-tawzi-darb-jam-tarh-l4-008:q1": { "t": "name", "lp": "P3", "nc": true, "c": "7*99+7", "opts": [ "*", "+", "-" ] },
  "ex-2am-tawzi-darb-jam-tarh-l4-008:q2": { "t": "val", "lp": "P4", "c": "7*99+7" },
  "ex-2am-tawzi-darb-jam-tarh-l4-008:q3": { "t": "val", "lp": "P4", "c": "7*(99+1)" },
  "ex-2am-tawzi-darb-jam-tarh-l4-008:q4": { "t": "blank", "lp": "P3", "eq": "7*99+7=7*(99+?)" },
  "ex-2am-tawzi-darb-jam-tarh-l4-009:q1": { "t": "name", "lp": "P3", "nc": true, "c": "2.4*15-2.4*5+2.4*10", "opts": [ "*", "+", "-" ] },
  "ex-2am-tawzi-darb-jam-tarh-l4-009:q2": { "t": "val", "lp": "P3", "c": "2.4*15-2.4*5+2.4*10" },
  "ex-2am-tawzi-darb-jam-tarh-l4-009:q3": { "t": "val", "lp": "P3", "c": "2.4*(15-5+10)" },
  "ex-2am-tawzi-darb-jam-tarh-l4-009:q4": { "t": "blank", "lp": "P3", "eq": "2.4*15-2.4*5+2.4*10=2.4*(15-5+?)" },
  "ex-2am-tawzi-darb-jam-tarh-l4-010:q1": { "t": "val", "lp": "P4", "c": "12.5*80" },
  "ex-2am-tawzi-darb-jam-tarh-l4-010:q2": { "t": "val", "lp": "P4", "c": "12.5*83" },
  "ex-2am-tawzi-darb-jam-tarh-l4-010:q3": { "t": "val", "lp": "P4", "c": "12.5*80+12.5*3" },
  "ex-2am-tawzi-darb-jam-tarh-l4-010:q4": { "t": "blank", "lp": "P3", "eq": "12.5*83=12.5*80+12.5*?" },
  "ex-2am-tawzi-darb-jam-tarh-l5-001:q1": { "t": "val", "lp": "P1", "c": "3*40+2*30", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-001:q2": { "t": "val", "lp": "P1", "c": "24*(3*40+2*30)", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-001:q3": { "t": "val", "lp": "P1", "c": "24*3*40+24*2*30", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-001:q4": { "t": "cmp", "lp": "P1", "c": "24*(3*40+2*30)", "order": [ "yes", "no" ], "n": 4500, "rel": "le", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-002:q1": { "t": "val", "lp": "P2", "c": "12*18-5*18", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-002:q2": { "t": "val", "lp": "P2", "c": "(12-5)*18", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-002:q3": { "t": "cmp", "lp": "P2", "c": "(12-5)*18", "order": [ "yes", "no" ], "n": 120, "rel": "ge", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-003:q1": { "t": "digits", "lp": "P4", "c": "23456789*99" },
  "ex-2am-tawzi-darb-jam-tarh-l5-003:q2": { "t": "val", "lp": "P4", "c": "23456789*100-23456789", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-003:q3": { "t": "val", "lp": "P2", "c": "2345678900-23456789" },
  "ex-2am-tawzi-darb-jam-tarh-l5-003:q4": { "t": "cmp", "lp": "P4", "c": "23456789*99", "order": [ "yes", "no" ], "n": 99999999, "rel": "le", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-004:q1": { "t": "val", "lp": "P1", "c": "15*(2.35+0.65)", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-004:q2": { "t": "val", "lp": "P1", "c": "15*2.35+15*0.65", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-004:q3": { "t": "val", "lp": "P2", "c": "50-45", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-005:q1": { "t": "val", "lp": "P1", "c": "85+15", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-005:q2": { "t": "val", "lp": "P1", "c": "25*(85+15)", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-005:q3": { "t": "val", "lp": "P1", "c": "25*85+25*15", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-005:q4": { "t": "cmp", "lp": "P1", "c": "25*(85+15)", "order": [ "yes", "no" ], "n": 2400, "rel": "le", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-006:q1": { "t": "val", "lp": "P1", "c": "6*10+4*15", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-006:q2": { "t": "val", "lp": "P1", "c": "36*(6*10+4*15)", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-006:q3": { "t": "val", "lp": "P1", "c": "36*6*10+36*4*15", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-006:q4": { "t": "cmp", "lp": "P1", "c": "36*(6*10+4*15)", "order": [ "yes", "no" ], "n": 4000, "rel": "ge", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-007:q1": { "t": "val", "lp": "P4", "c": "48*65", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-007:q2": { "t": "val", "lp": "P4", "c": "48*60+48*5", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-007:q3": { "t": "cmp", "lp": "P4", "c": "48*65", "order": [ "yes", "no" ], "n": 3000, "rel": "le", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-008:q1": { "t": "val", "lp": "P1", "c": "7*(12.5+7.5)", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-008:q2": { "t": "val", "lp": "P1", "c": "7*12.5+7*7.5", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-008:q3": { "t": "val", "lp": "P2", "c": "7*(12.5-4.5)", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-008:q4": { "t": "val", "lp": "P2", "c": "7*12.5-7*4.5" },
  "ex-2am-tawzi-darb-jam-tarh-l5-009:q1": { "t": "val", "lp": "P4", "c": "38*6", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-009:q2": { "t": "val", "lp": "P4", "c": "40*6-2*6", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-009:q3": { "t": "val", "lp": "P4", "c": "(40-2)*6" },
  "ex-2am-tawzi-darb-jam-tarh-l5-009:q4": { "t": "cmp", "lp": "P4", "c": "38*6", "order": [ "yes", "no" ], "n": 220, "rel": "ge", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-010:q1": { "t": "val", "lp": "P1", "c": "18*4.6", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-010:q2": { "t": "val", "lp": "P2", "c": "18*4.6-3*4.6", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-010:q3": { "t": "val", "lp": "P2", "c": "(18-3)*4.6", "story": true },
  "ex-2am-tawzi-darb-jam-tarh-l5-010:q4": { "t": "cmp", "lp": "P2", "c": "(18-3)*4.6", "order": [ "yes", "no" ], "n": 65, "rel": "ge", "story": true }
};
const PROV = {"ex-2am-tawzi-darb-jam-tarh-l1-001":{"t":"tt","file":"2am-s1-74","ex":1,"part":"ب"},"ex-2am-tawzi-darb-jam-tarh-l1-002":{"t":"tt","file":"2am-s1-81","ex":1,"part":"③"},"ex-2am-tawzi-darb-jam-tarh-l1-003":{"t":"tt","file":"2am-s1-78","ex":1,"part":"ب"},"ex-2am-tawzi-darb-jam-tarh-l1-004":{"t":"tt","file":"2am-s1-84","ex":1,"part":"④"},"ex-2am-tawzi-darb-jam-tarh-l1-005":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l1-006":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l1-007":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l1-008":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l1-009":{"t":"adp","el":"ex-24"},"ex-2am-tawzi-darb-jam-tarh-l1-010":{"t":"adp","el":"ex-25"},"ex-2am-tawzi-darb-jam-tarh-l2-001":{"t":"tt","file":"2am-s1-91","ex":1,"part":"②"},"ex-2am-tawzi-darb-jam-tarh-l2-002":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l2-003":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l2-004":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l2-005":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l2-006":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l2-007":{"t":"adp","el":"ex-23"},"ex-2am-tawzi-darb-jam-tarh-l2-008":{"t":"adp","el":"self-8"},"ex-2am-tawzi-darb-jam-tarh-l2-009":{"t":"adp","el":"ex-33"},"ex-2am-tawzi-darb-jam-tarh-l2-010":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l3-001":{"t":"tt","file":"2am-s1-79","ex":2,"part":"E"},"ex-2am-tawzi-darb-jam-tarh-l3-002":{"t":"tt","file":"2am-s1-84","ex":1,"part":"③"},"ex-2am-tawzi-darb-jam-tarh-l3-003":{"t":"tt","file":"2am-s1-83","ex":2,"part":"②"},"ex-2am-tawzi-darb-jam-tarh-l3-004":{"t":"tt","file":"2am-s1-67","ex":1,"part":"②"},"ex-2am-tawzi-darb-jam-tarh-l3-005":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l3-006":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l3-007":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l3-008":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l3-009":{"t":"adp","el":"now-13"},"ex-2am-tawzi-darb-jam-tarh-l3-010":{"t":"adp","el":"self-10"},"ex-2am-tawzi-darb-jam-tarh-l4-001":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l4-002":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l4-003":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l4-004":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l4-005":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l4-006":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l4-007":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l4-008":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l4-009":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l4-010":{"t":"adp","el":"ex-34"},"ex-2am-tawzi-darb-jam-tarh-l5-001":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l5-002":{"t":"adp","el":"ex-27"},"ex-2am-tawzi-darb-jam-tarh-l5-003":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l5-004":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l5-005":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l5-006":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l5-007":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l5-008":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l5-009":{"t":"mod"},"ex-2am-tawzi-darb-jam-tarh-l5-010":{"t":"mod"}};

/** Les réponses justes (indépendantes du contenu), clé `<feuille>:<question>` ; les selfCheck n'ont pas de clé. */
export const ORACLE = {};
for (const [k, S] of Object.entries(SPEC)) { const j = judge(S); if (j.answer) ORACLE[k] = j.answer; }

/* ── Audit : relecture du contenu ───────────────────────────────────── */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/2am/tawzi-darb-jam-tarh');
const FORBIDDEN = /الكتاب(?![ةا])|ص\s?\d|صفحة|خنزير|قمار|نرد|ورق اللعب|خمر|ربا |فائدة|يانصيب|الساحر|سحر/;
const MONEY = /(?<![⁦\d,])\d[\d,]*\s?DA/;
const LPS = new Set(['2am_tawzi-darb-jam-tarh_P1', '2am_tawzi-darb-jam-tarh_P2', '2am_tawzi-darb-jam-tarh_P3', '2am_tawzi-darb-jam-tarh_P4']);
const BADGE = 'على منوال اختبار الفصل الأول';
// Sujets réellement LUS (pdftoppm, image du PDF) pour cette banque : fichier → exercices lus.
const READ = { '2am-s1-81': [1], '2am-s1-78': [1], '2am-s1-84': [1], '2am-s1-91': [1], '2am-s1-79': [2], '2am-s1-74': [1], '2am-s1-83': [2], '2am-s1-67': [1] };
const PROVENANCE = { 1: [4, 4, 2], 2: [1, 6, 3], 3: [4, 4, 2], 4: [0, 9, 1], 5: [0, 9, 1] }; // term_exam / modelled / adapted
const ADAPTED = new Set(['ex-24', 'ex-25', 'ex-23', 'self-8', 'ex-33', 'now-13', 'self-10', 'ex-34', 'ex-27']);

/** LaTeX → ASCII, avec son propre lecteur (indépendant du générateur de la banque). */
export const fromTex = (t) => t.replace(/\\,|\\ |~/g, '').replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\\ldots|\\dots/g, '?').replace(/\\mathrm\{[^}]*\}/g, '').replace(/\s+/g, '');
const islands = (t) => [...String(t ?? '').matchAll(/\$([^$]*)\$/g)].map((m) => m[1]);
const compact = (s) => s.replace(/\s+/g, '');
const NUMS = (t) => new Set([...fromTex(String(t ?? '').replace(/\$/g, ' ')).matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]));
const numsOf = (c) => [...c.matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);

export function audit(bank) {
  const problems = [];
  const sheets = {};
  try { for (const lv of readdirSync(ROOT)) for (const f of readdirSync(join(ROOT, lv))) { const d = JSON.parse(readFileSync(join(ROOT, lv, f), 'utf8')); sheets[d.id] = d; } } catch { /* banque absente */ }
  const prior = {}; // clés des questions déjà vues d'une feuille

  for (const { key, q } of bank) {
    const S = SPEC[key];
    if (!S) { problems.push(`${key} : aucune spec d'oracle`); continue; }
    const [sid] = key.split(':'); const sh = sheets[sid];
    const P = (m) => problems.push(`${key} : ${m}`);
    const sheetText = [sh.statement.content, q.statement].join(' ');
    const texts = [q.statement, q.answerFormat, ...(q.hints ?? []).map((h) => h.content), q.feedback?.correct, q.feedback?.incorrect, ...(q.solution?.lines ?? []), q.solution?.result, ...(q.choices ?? []).map((c) => c.content)];
    for (const t of texts) {
      if (!t) continue;
      if (FORBIDDEN.test(t)) P(`texte interdit dans « ${t} »`);
      if (MONEY.test(t.replace(/\$[^$]*\$/g, ''))) P(`somme d'argent hors $…\\mathrm{DA}$ dans « ${t} »`);
      if (/\[\[|\]\]/.test(t)) P(`marqueur non converti dans « ${t} »`);
    }
    if (!LPS.has(q.learningPoints?.[0]?.code)) P('learning point inconnu');
    if (q.learningPoints?.[0]?.code !== `2am_tawzi-darb-jam-tarh_${S.lp}`) P(`learning point ${q.learningPoints?.[0]?.code} ≠ ${S.lp}`);
    if (q.answerType === 'selfCheck' && q.counted !== undefined) P('selfCheck marquée counted');
    if (Boolean(S.nc) !== (q.counted === false)) P(`counted : spec ${S.nc ? 'false' : 'défaut'}, feuille ${q.counted}`);
    if (q.step !== String(Number(key.split(':q')[1])).padStart(2, '0')) P(`étape ${q.step}`);

    /* clé */
    let j; try { j = judge(S); } catch (err) { P(err.message); continue; }
    if (q.answerType === 'rational') {
      if (!/^\d+(\.\d+)?$/.test(String(q.expectedAnswer))) P(`clé « ${q.expectedAnswer} » (décimal positif exact, point décimal)`);
      if (j.answer.value !== String(q.expectedAnswer)) P(`l'oracle trouve ${j.answer.value}, la feuille ${q.expectedAnswer}`);
    } else if (q.answerType === 'choice') {
      const mark = q.choices.find((c) => c.isCorrect)?.id;
      if (j.answer.choiceId !== mark) P(`l'oracle juge ${j.answer.choiceId}, la feuille marque ${mark}`);
      if (q.choices.filter((c) => c.isCorrect).length !== 1) P('plusieurs options marquées justes');
    } else if (q.answerType !== 'selfCheck') P(`type de réponse ${q.answerType}`);

    /* signatures numériques */
    const want = sigsOf(S).map(([v, id]) => `${v}|${MISC(id)}`).sort();
    const have = (q.misconceptionSignatures ?? []).map((x) => `${D(dq(x.value))}|${x.id}`).sort();
    if (JSON.stringify(want) !== JSON.stringify(have)) P(`signatures ${have.join(' ; ')} ≠ attendues ${want.join(' ; ')}`);
    for (const x of q.misconceptionSignatures ?? []) { const v = dq(String(x.value)); if (j.answer && v.eq(dq(j.answer.value))) P('une signature est la bonne réponse'); }
    if (want.length) { const vs = want.map((w) => w.split('|')[0]); if (new Set([...vs, j.answer.value]).size !== vs.length + 1) P('deux signatures (ou une signature et la clé) ont la même valeur'); }

    /* lecture du texte : chaque $…$ est lisible, sans intermédiaire négatif ; les égalités du corrigé sont vraies */
    const checkIsland = (raw, where, ctx) => {
      const asc0 = fromTex(raw);
      if (/\\/.test(asc0)) { P(`${where} : LaTeX hors lecteur « ${raw} »`); return null; }
      if (asc0 === '' || /^[A-Za-z]$/.test(asc0)) return null;
      if (ctx === 'free' && !/\d/.test(asc0)) return null; // formes génériques des indices : « ax », « a + x »
      const asc = asc0.replace(/^[A-Z]=(?=.)/, '');
      const parts = asc.split('=');
      let vals;
      try { vals = parts.map((p) => A(p, p.includes('?') ? { q: dq(String(j.root ? D(j.root) : 0)) } : {})); } catch (err) { P(`${where} : « ${raw} » ${err.message}`); return asc; }
      if (parts.length > 1) {
        if (ctx === 'solution' || ctx === 'fact') { if (!vals.every((v) => sameAf(v, vals[0]))) P(`${where} : égalité fausse dans « ${raw} »`); }
        else if (asc.includes('?')) { if (compact(asc) !== compact(S.eq ?? '')) P(`${where} : « ${raw} » ≠ l'égalité à compléter de la spec`); }
        else if (S.t === 'yn') { if (compact(asc) !== compact(claimOf(S).claim)) P(`${where} : « ${raw} » ≠ la mise en égalité de la spec`); }
        else if (!vals.every((v) => sameAf(v, vals[0]))) P(`${where} : fait donné faux « ${raw} »`);
      }
      return asc;
    };
    const stmtIslands = islands(q.statement).map((x) => checkIsland(x, 'énoncé', 'statement')).filter(Boolean).map((x) => x.replace(/\s+/g, ''));
    for (const [i, t] of [...(q.hints ?? []).map((h) => h.content), q.feedback?.correct, q.feedback?.incorrect, q.answerFormat].entries()) for (const x of islands(t)) checkIsland(x, `texte ${i}`, 'free');
    for (const l of [...(q.solution?.lines ?? []), q.solution?.result ? `$${q.solution.result}$` : '']) for (const x of islands(l)) checkIsland(x, 'corrigé', 'solution');
    for (const x of islands(sh.statement.content)) checkIsland(x, 'chapeau de la feuille', 'fact');

    /* l'expression de la spec est bien dans l'énoncé (ou, pour une histoire, ses nombres le sont) */
    const shown = (ascii) => stmtIslands.some((x) => x === compact(ascii));
    const textNums = new Set([...NUMS(sheetText), ...(prior[sid] ?? [])]);
    const numbersShown = (c) => { for (const n of numsOf(c)) if (!textNums.has(n) && !['10', '100', '1000', '2', '1', '0'].includes(n)) P(`le nombre ${n} de « ${c} » n'est pas dans la feuille ni une clé précédente`); };
    switch (S.t) {
      case 'val': case 'lval': case 'name': case 'digits': case 'cmp':
        if (S.story) numbersShown(S.c); else if (!shown(S.c) && !(S.alt ?? []).some(shown)) P(`l'expression « ${S.c} » n'est pas dans l'énoncé (relu : ${stmtIslands.join(' ; ')})`);
        break;
      case 'dist': if (!shown(`${S.k}*(${S.a}${S.op}${S.b})`) && !S.story) P('k(a ± b) absent de l\'énoncé'); if (S.story) numbersShown(`${S.k}*(${S.a}${S.op}${S.b})`); break;
      case 'blank': if (!shown(S.eq)) P(`l'égalité « ${S.eq} » n'est pas dans l'énoncé`); break;
      case 'exp': case 'lexp': case 'fac1': if (!shown(builders(S).show)) P(`l'expression de départ « ${builders(S).show} » n'est pas dans l'énoncé`); break;
      case 'yn': { const c = claimOf(S); if (!shown(c.claim)) P(`la mise en égalité « ${c.claim} » n'est pas dans l'énoncé`); break; }
      case 'prop': if (!shown(`${S.k}*(${S.a}${S.op}${S.b})=${S.k}*${S.a}${S.op}${S.k}*${S.b}`) && !shown(`${S.k}*${S.a}${S.op}${S.k}*${S.b}=${S.k}*(${S.a}${S.op}${S.b})`)) P('l\'égalité de la propriété est absente de l\'énoncé'); break;
      default: break;
    }
    // comparaison flottante indépendante de la clé
    if ((S.t === 'val' || S.t === 'lval') && j.answer) { const f = float(S.c, S.x); const v = Number(j.answer.value); if (Math.abs(f - v) > 1e-9 * Math.max(1, Math.abs(v))) P(`flottant ${f} ≠ clé ${v}`); }
    if (S.t === 'dist') { const f = float(`${S.k}*(${S.a}${S.op}${S.b})`); if (Math.abs(f - Number(j.answer.value)) > 1e-9 * Math.max(1, f)) P('flottant ≠ clé (dist)'); }
    if (S.t === 'blank') { const [l, r] = S.eq.split('='); const rt = Number(j.answer.value); const q0 = (s) => float(s.replace(/\?/g, `(${rt})`)); if (Math.abs(q0(l) - q0(r)) > 1e-9) P('flottant : le « ? » trouvé ne vérifie pas l\'égalité'); }

    /* QCM : options construites ici, comparées à celles de la feuille, balises exactes */
    if (q.answerType === 'choice') {
      if (S.t === 'yn' || S.t === 'cmp') {
        if (q.choices.length !== 2) P('un oui/non a deux options');
        S.order.forEach((w, i) => { const want = w === 'yes' ? 'نعم' : 'لا'; if (q.choices[i]?.content !== want) P(`option ${i + 1} : « ${q.choices[i]?.content} » ≠ « ${want} »`); });
        q.choices.forEach((c, i) => {
          const isYes = S.order[i] === 'yes';
          if (S.t === 'yn' && !j.truth && isYes && c.misconceptionId !== MISC(S.rhs)) P(`« نعم » à une égalité fausse doit porter ${MISC(S.rhs)}`);
          if (!(S.t === 'yn' && !j.truth && isYes) && c.misconceptionId) P('balise sur une option qui ne reproduit aucune lecture nommée');
        });
        if (S.t === 'yn' && !j.truth && !NAMED.has(S.rhs)) P('une égalité fausse doit reproduire une lecture nommée');
      } else {
        const o = optionsOf(S);
        if (q.choices.length !== o.length) P(`${q.choices.length} options pour ${o.length}`);
        o.forEach((x, i) => {
          const c = q.choices[i]; if (!c) return;
          if (c.id !== 'ABCDEF'[i]) P(`identifiant d'option ${c.id}`);
          if (c.isCorrect !== x.ok) P(`option ${c.id} : jugée ${x.ok ? 'juste' : 'fausse'} par l'oracle, marquée ${c.isCorrect}`);
          if (x.ascii !== undefined) {
            const isl = islands(c.content);
            if (isl.length !== 1 || fromTex(isl[0]) !== compact(x.ascii)) P(`option ${c.id} : « ${c.content} » ≠ « ${x.ascii} »`);
            else checkIsland(isl[0], `option ${c.id}`, 'free');
            if (!x.ok && !NAMED.has(x.tag)) P(`option ${c.id} : lecture ${x.tag} inconnue`);
            if (!x.ok && c.misconceptionId !== MISC(x.tag)) P(`option ${c.id} : balise ${c.misconceptionId} ≠ ${MISC(x.tag)}`);
            if (x.ok && c.misconceptionId) P(`option ${c.id} : l'option juste est balisée`);
          } else {
            const nm = x.name; if (c.content !== nm) P(`option ${c.id} : « ${c.content} » ≠ « ${nm} »`);
            if (S.t === 'name') {
              if (x.ok && c.misconceptionId) P('option juste balisée');
              if (!x.ok) { const t = (c.misconceptionId ?? '').replace('MISC-WASF-', ''); if (x.tagSet.length === 0 ? Boolean(c.misconceptionId) : !x.tagSet.includes(t)) P(`option ${c.id} : balise ${c.misconceptionId ?? 'aucune'} ≠ ${x.tagSet.join('/') || 'aucune'}`); }
            } else if (c.misconceptionId) P('une option de propriété ne porte pas de balise');
          }
        });
        if (S.t === 'name' && /MISC-WASF/.test(JSON.stringify(q.choices))) { /* ids de la leçon précédente : déjà dans misconceptions.json */ }
      }
    } else if (q.choices) P('choix sur une question non-QCM');
    prior[sid] = [...(prior[sid] ?? []), ...(j.answer?.value ? [j.answer.value] : [])];
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
  const seenEl = new Set(); const seenPart = new Set();
  for (const ex of files) {
    const s = ex.metadata.source; const spec = PROV[ex.id];
    if (!spec) { problems.push(`${ex.id} : provenance absente de la spec`); continue; }
    const all = [ex.metadata.title, ...(ex.metadata.tags ?? []), ex.statement.content];
    for (const t of all) { if (t && FORBIDDEN.test(t)) problems.push(`${ex.id} : texte interdit dans « ${String(t).slice(0, 60)} »`); if (t && MONEY.test(String(t).replace(/\$[^$]*\$/g, ''))) problems.push(`${ex.id} : somme d'argent hors $…$`); }
    if (spec.t === 'tt') {
      if (s.type !== 'term_exam' || s.grade !== '2am' || s.semester !== 1 || s.file !== spec.file || s.exercise !== spec.ex) problems.push(`${ex.id} : source term_exam ≠ ${spec.file} ex ${spec.ex}`);
      if (!(READ[spec.file] ?? []).includes(spec.ex)) problems.push(`${ex.id} : sujet ${spec.file} ex ${spec.ex} non lu pour cette banque`);
      const pk = `${spec.file}:${spec.ex}:${spec.part}`; if (seenPart.has(pk)) problems.push(`${ex.id} : la partie ${pk} est déjà citée`); seenPart.add(pk);
      if (ex.metadata.exam.badge !== BADGE || ex.metadata.exam.kind !== 'modelled') problems.push(`${ex.id} : badge / kind`);
    } else if (spec.t === 'mod') {
      if (s.type !== 'platform_addition' || s.reason !== 'term_exam_modelled' || s.modelledOn !== '2am-s1') problems.push(`${ex.id} : provenance modelled mal formée`);
      if (ex.metadata.exam.badge !== BADGE || ex.metadata.exam.kind !== 'modelled') problems.push(`${ex.id} : badge / kind`);
    } else {
      if (s.type !== 'textbook' || s.elementId !== spec.el || !ADAPTED.has(s.elementId)) problems.push(`${ex.id} : élément ${s.elementId} ≠ ${spec.el}`);
      if (seenEl.has(s.elementId)) problems.push(`${ex.id} : élément ${s.elementId} cité deux fois`); seenEl.add(s.elementId);
      if (ex.metadata.exam.kind !== 'adapted' || ex.metadata.exam.badge !== null) problems.push(`${ex.id} : adapted sans badge`);
    }
    if (ex.metadata.exam.kind === 'official' || ex.metadata.exam.kind === 'excerpt') problems.push(`${ex.id} : jamais officiel en 2AM`);
  }
  if (seenEl.size !== ADAPTED.size) problems.push(`éléments adaptés cités : ${[...seenEl].join(',')}`);
  return problems;
}
const NAMED = new Set(['FIRSTONLY', 'SIGNCHANGE', 'ADDK', 'FACTORMULT', 'FACTORWRONG', 'NOTATION']);
