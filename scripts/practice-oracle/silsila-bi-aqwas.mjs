// Oracle du banc « silsila-bi-aqwas » (سلسلة عمليات تتضمّن أقواسا, 2AM unité 1, leçon 2, 2026-10-29) — feuilles d'examen de
// فصل (« على منوال اختبار الفصل الأول »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec un évaluateur écrit dans ce fichier — rationnels EXACTS en
// BigInt, parseur de ( ) [ ] et de barres de fraction — indépendant de packages/core (chainOps.js). Les expressions sont retapées
// en littéraux ASCII (« 40 - [15 - (2 + 4)] », « * » = ×, « / » = ÷, « {N|D} » = barre de fraction) dans SPEC ; audit() RELIT
// ensuite le LaTeX des feuilles (\dfrac, \times, \div, {,}) avec son propre lecteur et exige qu'il donne la même expression :
//  - E(expr) : la valeur (parenthèses d'abord, puis × ÷ avant + −, de gauche à droite) ; en mode strict REFUSE tout intermédiaire
//    négatif (la leçon n'en a pas : les relatifs sont l'unité 3) et toute division par zéro ;
//  - lectures fautives nommées, par réécriture de la chaîne puis ré-évaluation : IGNORED (tous les crochets lus comme décor),
//    DROPOUTER (le crochet extérieur seul est ignoré, l'intérieur calculé), BARSPLIT (la barre ne divise que le dernier terme) ;
//  - un crochet est « inutile » s'il laisse la valeur inchangée pour 40 jeux de valeurs tirés au hasard (jamais par coïncidence
//    sur les nombres de la feuille) ; « nécessaire » s'il la change ;
//  - chaque QCM est jugé option par option (valeur, chaîne, touches, placement de crochets, crochets inutiles, oui/non) :
//    UNE seule option est vraie, c'est celle qui est marquée juste, et chaque distracteur est la lecture que sa misconception nomme ;
//  - touches de calculatrice : DROPBR = la bonne séquence privée d'au moins une paire de crochets ; MISPLACED = mêmes nombres et
//    mêmes opérations, crochets ailleurs, autre valeur ;
//  - audit(bank) relit aussi tout le texte : aucun intermédiaire négatif, chaque chaîne d'égalités « a = b = c » égale, la
//    convention [ ( ) ] (le crochet extérieur est un [ ]), aucune multiplication implicite aux niveaux 1–3, aucune mention du
//    manuel, la provenance (50 feuilles, 5 × 10, 3/5/2 · 2/5/3 · 4/4/2 · 2/7/1 · 2/7/1 sujets lus / modelled / adapted).
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

/* ── rationnels exacts ───────────────────────────────────────────────── */
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
  eq(o) { return this.n === o.n && this.d === o.d; }
  neg() { return this.n < 0n; }
  lt(o) { return this.n * o.d < o.n * this.d; }
}
const dq = (s) => {
  const m = /^(\d+)(?:\.(\d+))?$/.exec(String(s).trim());
  if (!m) throw new Error(`nombre illisible : ${s}`);
  const f = m[2] ?? '';
  return new Q(BigInt(m[1] + f), 10n ** BigInt(f.length));
};
/** Écriture décimale exacte (erreur si le rationnel n'est pas un décimal fini). */
const D = (x) => {
  for (let k = 0n; k <= 9n; k++) {
    const p = 10n ** k;
    if (p % x.d === 0n) {
      const N = x.n * (p / x.d);
      const s = (N < 0n ? -N : N).toString().padStart(Number(k) + 1, '0');
      const int = s.slice(0, s.length - Number(k));
      const frac = s.slice(s.length - Number(k)).replace(/0+$/, '');
      return `${N < 0n ? '-' : ''}${int}${frac ? `.${frac}` : ''}`;
    }
  }
  throw new Error(`${x.n}/${x.d} n'est pas un décimal`);
};
const isDec = (x) => { try { D(x); return true; } catch { return false; } };

/* ── parseur ASCII : nombres, + - * /, ( ) [ ], barre {N|D}, @ (inconnue) ── */
const tok = (s) => {
  const t = s.match(/\d+(?:\.\d+)?|[()[\]{}|+\-*/@]/g) ?? [];
  if (t.join('') !== s.replace(/\s+/g, '')) throw new Error(`caractères illisibles dans « ${s} »`);
  return t;
};
export function parse(s) {
  const t = tok(s); let i = 0;
  const peek = () => t[i];
  const eat = (x) => { const v = t[i++]; if (x !== undefined && v !== x) throw new Error(`« ${x} » attendu, « ${v} » trouvé dans « ${s} »`); return v; };
  const factor = () => {
    const v = peek();
    if (v === '(' || v === '[') { eat(); const e = chain(); eat(v === '(' ? ')' : ']'); return { t: 'grp', k: v, e }; }
    if (v === '{') { eat(); const n = chain(); eat('|'); const d = chain(); eat('}'); return { t: 'bar', n, d }; }
    if (v === '@') { eat(); return { t: 'var' }; }
    if (v === undefined || !/^\d/.test(v)) throw new Error(`facteur attendu, « ${v} » trouvé dans « ${s} »`);
    eat(); return { t: 'num', v: dq(v), s: v };
  };
  const chain = () => {
    const o = [factor()], p = [];
    while ('+-*/'.includes(peek() ?? '#')) { p.push(eat()); o.push(factor()); }
    return o.length === 1 ? o[0] : { t: 'chain', o, p };
  };
  const e = chain();
  if (i !== t.length) throw new Error(`reste « ${t.slice(i).join('')} » dans « ${s} »`);
  return e;
}
const op = (a, o, b, strict) => {
  const r = o === '+' ? a.add(b) : o === '-' ? a.sub(b) : o === '*' ? a.mul(b) : a.div(b);
  if (strict && r.neg()) throw new Error('intermédiaire négatif');
  return r;
};
/** Valeur d'un arbre ; `leaf()` remplace chaque nombre (test des crochets inutiles) ; `x` valeur de @. */
function ev(n, strict = true, leaf = null, x = null) {
  switch (n.t) {
    case 'num': return leaf ? leaf() : n.v;
    case 'var': return x;
    case 'grp': return ev(n.e, strict, leaf, x);
    case 'bar': return op(ev(n.n, strict, leaf, x), '/', ev(n.d, strict, leaf, x), strict);
    default: {
      const v = n.o.map((m) => ev(m, strict, leaf, x)), p = [...n.p];
      while (p.length) {
        let i = p.findIndex((c) => c === '*' || c === '/'); if (i < 0) i = 0;
        v.splice(i, 2, op(v[i], p[i], v[i + 1], strict)); p.splice(i, 1);
      }
      return v[0];
    }
  }
}
export const E = (s, strict = true) => ev(parse(s), strict);
const show = (n) => {
  switch (n.t) {
    case 'num': return D(n.v);
    case 'var': return '@';
    case 'grp': return n.k + show(n.e) + (n.k === '(' ? ')' : ']');
    case 'bar': return `{${show(n.n)}|${show(n.d)}}`;
    default: return n.o.map(show).reduce((a, s, i) => (i ? `${a} ${n.p[i - 1]} ${s}` : s), '');
  }
};
const norm = (s) => show(parse(s));
const hasGrp = (n) => (n.t === 'grp') || (n.t === 'bar' && (hasGrp(n.n) || hasGrp(n.d))) || (n.t === 'chain' && n.o.some(hasGrp));
const joinChain = (n, f) => n.o.map(f).reduce((a, s, i) => (i ? `${a} ${n.p[i - 1]} ${s}` : s), '');
const stripS = (n) => (n.t === 'num' ? D(n.v) : n.t === 'grp' ? stripS(n.e) : n.t === 'bar' ? `{${stripS(n.n)}|${stripS(n.d)}}` : joinChain(n, stripS));
const dropOuterS = (n, depth = 0) => {
  if (n.t === 'num') return D(n.v);
  if (n.t === 'grp') { const inner = dropOuterS(n.e, depth + 1); return hasGrp(n.e) && depth === 0 ? inner : n.k + inner + (n.k === '(' ? ')' : ']'); }
  if (n.t === 'bar') return `{${dropOuterS(n.n, 0)}|${dropOuterS(n.d, 0)}}`;
  return joinChain(n, (m) => dropOuterS(m, depth));
};
const barSplitS = (n) => (n.t === 'num' ? D(n.v) : n.t === 'grp' ? n.k + barSplitS(n.e) + (n.k === '(' ? ')' : ']') : n.t === 'bar' ? `${barSplitS(n.n)} / ${barSplitS(n.d)}` : joinChain(n, barSplitS));
const READ = { IGNORED: stripS, DROPOUTER: dropOuterS, BARSPLIT: barSplitS };
/** La valeur d'une lecture fautive nommée, ou null si elle n'est pas un décimal positif. */
function reading(how, e) {
  try { const v = ev(parse(READ[how](parse(e))), false); return v.neg() || !isDec(v) ? null : v; } catch { return null; }
}
/** Jetons « à plat » (nombres et opérations, sans crochets ni barres) : mêmes nombres, mêmes opérations. */
const flatTokens = (s) => (s.match(/\d+(?:\.\d+)?|[+\-*/]/g) ?? []).map((x) => (/\d/.test(x) ? D(dq(x)) : x)).join(' ');
/* ── crochets : paires, retrait, utilité ─────────────────────────────── */
const pairsOf = (s) => { const out = [], st = []; [...s].forEach((c, i) => { if (c === '(' || c === '[') st.push(i); else if (c === ')' || c === ']') out.push([st.pop(), i]); }); return out.sort((a, b) => a[0] - b[0]); };
const removePairs = (s, ks) => { const ps = pairsOf(s); const del = new Set(ks.flatMap((k) => ps[k])); return [...s].filter((_, i) => !del.has(i)).join(''); };
let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };
/** Le crochet k est inutile ssi sa suppression laisse la valeur inchangée pour 40 jeux de valeurs aléatoires ET sur les nombres donnés. */
function pairUseless(s, k) {
  const a = parse(s), b = parse(removePairs(s, [k]));
  for (let t = 0; t < 40; t++) {
    const vs = Array.from({ length: 64 }, () => new Q(BigInt(1 + (rnd() % 9))));
    let i = 0; const va = ev(a, false, () => vs[i++]); i = 0; const vb = ev(b, false, () => vs[i++]);
    if (!va.eq(vb)) return false;
  }
  return ev(a, false).eq(ev(b, false));
}
const allUseless = (s) => pairsOf(s).every((_, k) => pairUseless(s, k));
const someNeeded = (s) => pairsOf(s).some((_, k) => !pairUseless(s, k));
/* ── lecture du LaTeX de la feuille ──────────────────────────────────── */
const islands = (s) => [...String(s ?? '').matchAll(/\$([^$]+)\$/g)].map((x) => x[1]);
/** « \dfrac{N}{D} » → « {N|D} » ; \times → * ; \div → / ; {,} → . ; \square → @. */
function lx2a(l) {
  let s = l.replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\\square/g, '@').replace(/\\[,; ]|\\ /g, ' ').replace(/\\text\{[^}]*\}/g, '');
  const grab = (str, i) => { let d = 0, j = i; for (; j < str.length; j++) { if (str[j] === '{') d++; else if (str[j] === '}') { d--; if (d === 0) break; } } return [str.slice(i + 1, j), j + 1]; };
  for (;;) {
    const k = s.indexOf('\\dfrac'); if (k < 0) break;
    const [n, j1] = grab(s, k + 6); const [d, j2] = grab(s, j1);
    s = `${s.slice(0, k)}{${n}|${d}}${s.slice(j2)}`;
  }
  return s.replace(/\s+/g, ' ').trim();
}
const tryParse = (a) => { try { return parse(a); } catch { return null; } };
/** « A = 24 \times 5 \div 8 - 9 » → chaîne d'égalités [expr, expr, …] (étiquette retirée) ou null. */
function segments(island) {
  if (/\\neq|<|>|\\lt|\\gt|\\ne\b/.test(island)) return null;
  const a = lx2a(island); if (a.includes('@')) return null;
  const parts = a.split('=').map((x) => x.trim()).filter((x) => x.length);
  if (parts.length && /^[A-Za-z]$/.test(parts[0])) parts.shift();
  if (!parts.length) return null;
  return parts.every((p) => tryParse(p)) ? parts : null;
}
const NUMS = (s) => [...String(s).replace(/\{,\}/g, '.').matchAll(/\d+(?:\.\d+)?/g)].map((m) => D(dq(m[0])));
const letterOf = (flags, what) => {
  const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`);
  return 'ABCDEF'[hits[0]];
};
const MISC = { IGNORED: 'MISC-AQWAS-IGNORED', DROPOUTER: 'MISC-AQWAS-DROPOUTER', BARSPLIT: 'MISC-AQWAS-BARSPLIT', DROPBR: 'MISC-AQWAS-CALCNOBRACKET',
  USELESS: 'MISC-AQWAS-ALLUSELESS', NEEDED: 'MISC-AQWAS-ALLNEEDED', MISPLACED: 'MISC-AQWAS-MISPLACED', IMPLICITX: 'MISC-AQWAS-IMPLICITX' };
const KNOWN = new Set(Object.values(MISC));

/* ── jugement d'une question (clé + options) ─────────────────────────── */
/** Renvoie { answer: R(..)|C(..), flags: [vrai?, …] pour un QCM }. */
function judge(sp) {
  switch (sp.k) {
    case 'val': case 'story': return { answer: R(D(E(sp.e))) };
    case 'ceil': { const v = E(sp.e); const q = v.n / v.d; return { answer: R(String(v.n % v.d === 0n ? q : q + 1n)) }; }
    case 'missing': {
      const f = (x) => ev(parse(sp.tmpl.replace('_', '@')), false, null, x);
      const f0 = f(new Q(0n)), f1 = f(new Q(1n));
      const x = dq(sp.target).sub(f0).div(f1.sub(f0));
      if (!f(x).eq(dq(sp.target)) || x.neg()) throw new Error(`□ : ${sp.tmpl} = ${sp.target} sans solution décimale positive`);
      return { answer: R(D(x)) };
    }
    case 'implicit': { const t = E(`${sp.a} * (${sp.e})`); const fl = sp.opts.map(([v]) => dq(v).eq(t)); return { answer: C(letterOf(fl, `${sp.a}(${sp.e})`)), flags: fl }; }
    case 'self': return { answer: null };
    case 'valpick': { const t = E(sp.e); const fl = sp.opts.map(([v]) => dq(v).eq(t)); return { answer: C(letterOf(fl, `valeurs de ${sp.e}`)), flags: fl }; }
    case 'chain': { const t = E(sp.truth, false); const fl = sp.opts.map(([a]) => E(a, false).eq(t)); return { answer: C(letterOf(fl, `chaînes de ${sp.truth}`)), flags: fl }; }
    case 'keys': { const t = E(sp.truth); const fl = sp.opts.map(([a]) => E(a, false).eq(t)); return { answer: C(letterOf(fl, `touches de ${sp.truth}`)), flags: fl }; }
    case 'place': { const fl = sp.opts.map(([a]) => E(a, false).eq(dq(sp.target))); return { answer: C(letterOf(fl, `crochets de ${sp.flat}`)), flags: fl }; }
    case 'useless': { const fl = sp.opts.map(([a]) => (sp.ask === 'useless' ? allUseless(a) : someNeeded(a))); return { answer: C(letterOf(fl, 'crochets inutiles')), flags: fl }; }
    case 'yn': {
      const c = sp.claim; let truth;
      if (c[0] === 'needed') truth = !pairUseless(c[1], c[2]);
      else if (c[0] === 'eq') truth = E(c[1], false).eq(E(c[2], false));
      else { const a = E(c[1], false), b = E(c[3], false); truth = c[2] === '<' ? a.lt(b) : c[2] === '>' ? b.lt(a) : c[2] === '>=' ? !a.lt(b) : !b.lt(a); }
      const fl = [truth, !truth];
      return { answer: C(truth ? 'A' : 'B'), flags: fl };
    }
    default: throw new Error(`genre inconnu ${sp.k}`);
  }
}

/* ── Les spécifications retapées (une par question ; relues et recalculées par judge() et audit()) ───────── */
const SPEC = {
  // ex-2am-silsila-bi-aqwas-l1-001
  "ex-2am-silsila-bi-aqwas-l1-001:q1": {"k": "val", "e": "4 * (3 + 18 / 6) - 5", "sigs": [["10", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-001:q2": {"k": "val", "e": "1.5 * (2.4 + 7.6) / 5", "sigs": [["5.12", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-001:q3": {"k": "val", "e": "34 - 3 * (14 - 2 * 4)", "sigs": []},
  // ex-2am-silsila-bi-aqwas-l1-002
  "ex-2am-silsila-bi-aqwas-l1-002:q1": {"k": "val", "e": "5 * (8 + 4) / 2 - 10", "sigs": [["32", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-002:q2": {"k": "val", "e": "3 * (2 * 6 - 15 / 3)", "sigs": [["31", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-002:q3": {"k": "val", "e": "(5 + 4 * 4) / 3 + 7", "sigs": []},
  // ex-2am-silsila-bi-aqwas-l1-003
  "ex-2am-silsila-bi-aqwas-l1-003:q1": {"k": "val", "e": "36 / (2 + 4) + 7", "sigs": [["29", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-003:q2": {"k": "val", "e": "(14 - 6) * 3 - 9", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l1-003:q3": {"k": "val", "e": "60 - (24 / 4 * 5) + 8", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l1-003:q4": {"k": "yn", "claim": ["needed", "60 - (24 / 4 * 5) + 8", 0], "opts": [["yes", "NEEDED"], ["no", null]]},
  // ex-2am-silsila-bi-aqwas-l1-004
  "ex-2am-silsila-bi-aqwas-l1-004:q1": {"k": "val", "e": "85 - (17 + 28)", "sigs": [["96", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-004:q2": {"k": "val", "e": "7.5 * (2 + 3.2)", "sigs": [["18.2", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-004:q3": {"k": "val", "e": "120 / (4 * 5) + 3.5", "sigs": [["153.5", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  // ex-2am-silsila-bi-aqwas-l1-005
  "ex-2am-silsila-bi-aqwas-l1-005:q1": {"k": "valpick", "e": "100 - (36 + 4 * 7) / 8", "opts": [["92", null], ["67.5", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-005:q2": {"k": "val", "e": "90 - (15 + 3 * 5)", "sigs": [["90", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-005:q3": {"k": "val", "e": "(9.6 - 4.8) * 5 + 2", "sigs": []},
  // ex-2am-silsila-bi-aqwas-l1-006
  "ex-2am-silsila-bi-aqwas-l1-006:q1": {"k": "val", "e": "45 - 15 / 3", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l1-006:q2": {"k": "val", "e": "(45 - 15) / 3", "sigs": [["40", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-006:q3": {"k": "yn", "claim": ["needed", "(45 - 15) / 3", 0], "opts": [["yes", null], ["no", "USELESS"]]},
  // ex-2am-silsila-bi-aqwas-l1-007
  "ex-2am-silsila-bi-aqwas-l1-007:q1": {"k": "val", "e": "(8.5 - 3.5) * 2.4", "sigs": [["0.1", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-007:q2": {"k": "val", "e": "5 - 0.5 * (4 + 2.4)", "sigs": [["5.4", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-007:q3": {"k": "val", "e": "7.2 / (0.4 + 0.8) - 1.5", "sigs": [["17.3", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  // ex-2am-silsila-bi-aqwas-l1-008
  "ex-2am-silsila-bi-aqwas-l1-008:q1": {"k": "val", "e": "120 - (45 - 25)", "sigs": [["50", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-008:q2": {"k": "val", "e": "96 / (8 + 4)", "sigs": [["16", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-008:q3": {"k": "val", "e": "(23 + 7) * (11 - 8)", "sigs": [["92", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  // ex-2am-silsila-bi-aqwas-l1-009
  "ex-2am-silsila-bi-aqwas-l1-009:q1": {"k": "val", "e": "75 - (9 + 6) * 4", "sigs": [["90", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-009:q2": {"k": "val", "e": "(18 + 24) / 6 + 5", "sigs": [["27", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-009:q3": {"k": "val", "e": "5 * (6.2 * 12 - 8.5)", "sigs": [["363.5", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-009:q4": {"k": "val", "e": "24 / (4 * 1.5 + 6 / 3)", "sigs": [["11", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  // ex-2am-silsila-bi-aqwas-l1-010
  "ex-2am-silsila-bi-aqwas-l1-010:q1": {"k": "val", "e": "31 - 4 * (15 - 9)", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l1-010:q2": {"k": "val", "e": "10 * (6.3 + 8.7)", "sigs": [["71.7", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-010:q3": {"k": "val", "e": "58 - (14 + 72 / 8)", "sigs": [["53", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l1-010:q4": {"k": "val", "e": "3 * (12 * 5 - 4)", "sigs": [["176", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  // ex-2am-silsila-bi-aqwas-l2-001
  "ex-2am-silsila-bi-aqwas-l2-001:q1": {"k": "val", "e": "18 + 4 * (3 + 2.5)", "sigs": [["32.5", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l2-001:q2": {"k": "keys", "truth": "{6 * 5 + 18|12 - 4}", "opts": [["(6 * 5 + 18) / (12 - 4)", null], ["(6 * 5 + 18) / 12 - 4", "DROPBR"], ["6 * 5 + 18 / 12 - 4", "DROPBR"], ["6 * 5 + 18 / (12 - 4)", "DROPBR"]]},
  "ex-2am-silsila-bi-aqwas-l2-001:q3": {"k": "val", "e": "{6 * 5 + 18|12 - 4}", "sigs": [["27.5", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  // ex-2am-silsila-bi-aqwas-l2-002
  "ex-2am-silsila-bi-aqwas-l2-002:q1": {"k": "chain", "truth": "(75 - 6 * 2) / 9", "opts": [["75 - 6 * 2 / 9", "IGNORED"], ["(75 - 6) * 2 / 9", "MISPLACED"], ["(75 - 6 * 2) / 9", null]]},
  "ex-2am-silsila-bi-aqwas-l2-002:q2": {"k": "story", "e": "(75 - 6 * 2) / 9", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l2-002:q3": {"k": "story", "e": "(75 - 6 * 2) / 7", "sigs": []},
  // ex-2am-silsila-bi-aqwas-l2-003
  "ex-2am-silsila-bi-aqwas-l2-003:q1": {"k": "place", "flat": "8 + 5 * 6", "target": "78", "opts": [["8 + (5 * 6)", "USELESS"], ["(8 + 5) * 6", null]]},
  "ex-2am-silsila-bi-aqwas-l2-003:q2": {"k": "place", "flat": "40 - 12 / 4", "target": "7", "opts": [["40 - (12 / 4)", "USELESS"], ["(40 - 12) / 4", null]]},
  "ex-2am-silsila-bi-aqwas-l2-003:q3": {"k": "place", "flat": "3 * 9 - 4 + 2", "target": "21", "opts": [["3 * (9 - 4) + 2", "MISPLACED"], ["3 * 9 - (4 + 2)", null], ["(3 * 9 - 4) + 2", "USELESS"]]},
  // ex-2am-silsila-bi-aqwas-l2-004
  "ex-2am-silsila-bi-aqwas-l2-004:q1": {"k": "useless", "ask": "useless", "opts": [["30 + (12 / 4)", null], ["(30 - 12) / 3", "USELESS"], ["30 - (12 - 4)", "USELESS"]]},
  "ex-2am-silsila-bi-aqwas-l2-004:q2": {"k": "useless", "ask": "needed", "opts": [["9 + (6 * 4)", "NEEDED"], ["(9 + 6) * 4", null], ["(9 * 6) - 4", "NEEDED"]]},
  "ex-2am-silsila-bi-aqwas-l2-004:q3": {"k": "val", "e": "15 + (4 * 6) - 9", "sigs": []},
  // ex-2am-silsila-bi-aqwas-l2-005
  "ex-2am-silsila-bi-aqwas-l2-005:q1": {"k": "val", "e": "84 + 36 / 12", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l2-005:q2": {"k": "keys", "truth": "{84 + 36|12}", "opts": [["84 + 36 / 12", "DROPBR"], ["(84 + 36 / 12)", "MISPLACED"], ["(84 + 36) / 12", null]]},
  "ex-2am-silsila-bi-aqwas-l2-005:q3": {"k": "self", "facts": [["84 + 36 / 12", "87"], ["(84 + 36) / 12", "10"]]},
  // ex-2am-silsila-bi-aqwas-l2-006
  "ex-2am-silsila-bi-aqwas-l2-006:q1": {"k": "valpick", "e": "26 + (18 - 6) * 3", "opts": [["62", null], ["26", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l2-006:q2": {"k": "self", "facts": [["26 + (18 - 6) * 3", "62"], ["26 + 18 - 6 * 3", "26"]]},
  // ex-2am-silsila-bi-aqwas-l2-007
  "ex-2am-silsila-bi-aqwas-l2-007:q1": {"k": "yn", "claim": ["eq", "(30 - 12) + 5", "30 - (12 + 5)"], "opts": [["yes", "USELESS"], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l2-007:q2": {"k": "yn", "claim": ["eq", "(9 + 4) + 6", "9 + (4 + 6)"], "opts": [["yes", null], ["no", "NEEDED"]]},
  "ex-2am-silsila-bi-aqwas-l2-007:q3": {"k": "self", "facts": [["(30 - 12) + 5", "23"], ["30 - (12 + 5)", "13"], ["(9 + 4) + 6", "19"], ["9 + (4 + 6)", "19"]]},
  // ex-2am-silsila-bi-aqwas-l2-008
  "ex-2am-silsila-bi-aqwas-l2-008:q1": {"k": "place", "flat": "7 * 8 - 5", "target": "21", "opts": [["7 * (8 - 5)", null], ["(7 * 8) - 5", "USELESS"]]},
  "ex-2am-silsila-bi-aqwas-l2-008:q2": {"k": "place", "flat": "6 + 3 * 4", "target": "36", "opts": [["6 + (3 * 4)", "USELESS"], ["(6 + 3) * 4", null]]},
  "ex-2am-silsila-bi-aqwas-l2-008:q3": {"k": "place", "flat": "5 * 3 + 2 * 4", "target": "100", "opts": [["5 * (3 + 2) * 4", null], ["5 * (3 + 2 * 4)", "MISPLACED"], ["(5 * 3 + 2) * 4", "MISPLACED"]]},
  "ex-2am-silsila-bi-aqwas-l2-008:q4": {"k": "place", "flat": "15 - 8 + 2", "target": "5", "opts": [["15 - (8 + 2)", null], ["(15 - 8) + 2", "USELESS"]]},
  // ex-2am-silsila-bi-aqwas-l2-009
  "ex-2am-silsila-bi-aqwas-l2-009:q1": {"k": "val", "e": "{36 + 9|5}", "sigs": [["37.8", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  "ex-2am-silsila-bi-aqwas-l2-009:q2": {"k": "val", "e": "36 + 9 / 5", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l2-009:q3": {"k": "self", "facts": [["36 + 9 / 5", "37.8"]]},
  "ex-2am-silsila-bi-aqwas-l2-009:q4": {"k": "keys", "truth": "{36 + 9|5}", "opts": [["36 + 9 / 5", "DROPBR"], ["36 + (9 / 5)", "MISPLACED"], ["(36 + 9) / 5", null]]},
  // ex-2am-silsila-bi-aqwas-l2-010
  "ex-2am-silsila-bi-aqwas-l2-010:q1": {"k": "yn", "claim": ["needed", "40 - (5 * 6)", 0], "opts": [["yes", "NEEDED"], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l2-010:q2": {"k": "val", "e": "40 - (5 * 6)", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l2-010:q3": {"k": "yn", "claim": ["needed", "(18 + 7) * 2", 0], "opts": [["yes", null], ["no", "USELESS"]]},
  "ex-2am-silsila-bi-aqwas-l2-010:q4": {"k": "val", "e": "(18 + 7) * 2", "sigs": [["32", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l2-010:q5": {"k": "yn", "claim": ["needed", "6 * (9 / 3)", 0], "opts": [["yes", "NEEDED"], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l2-010:q6": {"k": "val", "e": "6 * (9 / 3)", "sigs": []},
  // ex-2am-silsila-bi-aqwas-l3-001
  "ex-2am-silsila-bi-aqwas-l3-001:q1": {"k": "val", "e": "15 * 4 + 9 - 56 / 7", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l3-001:q2": {"k": "val", "e": "85 - [18 + (30 - 4 * 5) / 2] + 6", "sigs": [["93", "MISC-AQWAS-IGNORED", "IGNORED"], ["78", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  "ex-2am-silsila-bi-aqwas-l3-001:q3": {"k": "yn", "claim": ["needed", "85 - [18 + (30 - 4 * 5) / 2] + 6", 0], "opts": [["yes", null], ["no", "USELESS"]]},
  // ex-2am-silsila-bi-aqwas-l3-002
  "ex-2am-silsila-bi-aqwas-l3-002:q1": {"k": "val", "e": "400 - [(12 + 8) * 3 - 15]", "sigs": [["397", "MISC-AQWAS-IGNORED", "IGNORED"], ["325", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  "ex-2am-silsila-bi-aqwas-l3-002:q2": {"k": "val", "e": "{20 - 1.5 * 4 + 6|12 / 4 + 5}", "sigs": [["19.125", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  "ex-2am-silsila-bi-aqwas-l3-002:q3": {"k": "keys", "truth": "{20 - 1.5 * 4 + 6|12 / 4 + 5}", "opts": [["(20 - 1.5 * 4 + 6) / (12 / 4 + 5)", null], ["20 - 1.5 * 4 + 6 / (12 / 4 + 5)", "DROPBR"], ["(20 - 1.5 * 4 + 6) / 12 / 4 + 5", "DROPBR"], ["20 - 1.5 * 4 + 6 / 12 / 4 + 5", "DROPBR"]]},
  // ex-2am-silsila-bi-aqwas-l3-003
  "ex-2am-silsila-bi-aqwas-l3-003:q1": {"k": "val", "e": "8 * 12 + 7 - 24 / 0.5", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l3-003:q2": {"k": "val", "e": "140 - 3 * [50 - (6 * 7 - 2)]", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l3-003:q3": {"k": "val", "e": "72 - 2 * [30 - (4 + 5) * 2]", "sigs": [["18", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  // ex-2am-silsila-bi-aqwas-l3-004
  "ex-2am-silsila-bi-aqwas-l3-004:q1": {"k": "val", "e": "9 + [(10 - 4) * 6] / 4 - 5", "sigs": [["8", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l3-004:q2": {"k": "yn", "claim": ["needed", "9 + [(10 - 4) * 6] / 4 - 5", 0], "opts": [["yes", "NEEDED"], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l3-004:q3": {"k": "val", "e": "50 - [(8 + 4) * 3] / 4 + 6", "sigs": [["51", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  // ex-2am-silsila-bi-aqwas-l3-005
  "ex-2am-silsila-bi-aqwas-l3-005:q1": {"k": "val", "e": "{42 + 18|3 * 4}", "sigs": [["66", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  "ex-2am-silsila-bi-aqwas-l3-005:q2": {"k": "val", "e": "{100 - 4 * 7|15 - 3}", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l3-005:q3": {"k": "val", "e": "{3.2 + 0.8|5 - 4.5}", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l3-005:q4": {"k": "val", "e": "17 - {6 * 4|2 + 6}", "sigs": [["11", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  // ex-2am-silsila-bi-aqwas-l3-006
  "ex-2am-silsila-bi-aqwas-l3-006:q1": {"k": "val", "e": "[16 - (3 + 4)] * 5", "sigs": [["33", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l3-006:q2": {"k": "val", "e": "2 * [30 - (9 + 3) * 2]", "sigs": [["57", "MISC-AQWAS-IGNORED", "IGNORED"], ["36", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  "ex-2am-silsila-bi-aqwas-l3-006:q3": {"k": "val", "e": "100 - [25 + (18 - 6) * 3]", "sigs": [["75", "MISC-AQWAS-IGNORED", "IGNORED"], ["111", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  "ex-2am-silsila-bi-aqwas-l3-006:q4": {"k": "val", "e": "[12 + (45 - 15) / 6] / 2", "sigs": [["55.75", "MISC-AQWAS-IGNORED", "IGNORED"], ["14.5", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  // ex-2am-silsila-bi-aqwas-l3-007
  "ex-2am-silsila-bi-aqwas-l3-007:q1": {"k": "keys", "truth": "{15 + 9|4 * 2}", "opts": [["(15 + 9) / 4 * 2", "DROPBR"], ["(15 + 9) / (4 * 2)", null], ["15 + 9 / 4 * 2", "DROPBR"], ["15 + 9 / (4 * 2)", "DROPBR"]]},
  "ex-2am-silsila-bi-aqwas-l3-007:q2": {"k": "keys", "truth": "5 + {9 + 7|2 + 6}", "opts": [["5 + 9 + 7 / (2 + 6)", "DROPBR"], ["5 + 9 + 7 / 2 + 6", "DROPBR"], ["5 + (9 + 7) / (2 + 6)", null], ["5 + (9 + 7) / 2 + 6", "DROPBR"]]},
  "ex-2am-silsila-bi-aqwas-l3-007:q3": {"k": "keys", "truth": "{80|4 + 6} - 3", "opts": [["80 / (4 + 6) - 3", null], ["80 / 4 + 6 - 3", "DROPBR"]]},
  "ex-2am-silsila-bi-aqwas-l3-007:q4": {"k": "val", "e": "5 + 9 * 4 / 2 + 6", "sigs": []},
  // ex-2am-silsila-bi-aqwas-l3-008
  "ex-2am-silsila-bi-aqwas-l3-008:q1": {"k": "val", "e": "[4.8 + (7.5 - 2.5) * 1.2] / 0.6 - 2", "sigs": [["5.3", "MISC-AQWAS-IGNORED", "IGNORED"], ["12.8", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  "ex-2am-silsila-bi-aqwas-l3-008:q2": {"k": "val", "e": "{12.6 - 4.2|1.5 * 2.8}", "sigs": [["4.76", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  "ex-2am-silsila-bi-aqwas-l3-008:q3": {"k": "keys", "truth": "{12.6 - 4.2|1.5 * 2.8}", "opts": [["12.6 - 4.2 / 1.5 * 2.8", "DROPBR"], ["(12.6 - 4.2) / 1.5 * 2.8", "DROPBR"], ["12.6 - 4.2 / (1.5 * 2.8)", "DROPBR"], ["(12.6 - 4.2) / (1.5 * 2.8)", null]]},
  "ex-2am-silsila-bi-aqwas-l3-008:q4": {"k": "val", "e": "3 * [20 - (9.5 + 4.5) / 2]", "sigs": [["52.75", "MISC-AQWAS-IGNORED", "IGNORED"], ["53", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  // ex-2am-silsila-bi-aqwas-l3-009
  "ex-2am-silsila-bi-aqwas-l3-009:q1": {"k": "val", "e": "{18|4 + 5}", "sigs": [["9.5", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  "ex-2am-silsila-bi-aqwas-l3-009:q2": {"k": "val", "e": "30 - {48|5 * 3 + 1} + 4", "sigs": [["6.2", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  "ex-2am-silsila-bi-aqwas-l3-009:q3": {"k": "val", "e": "[19 - (8 + 5)] * 3", "sigs": [["26", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l3-009:q4": {"k": "val", "e": "36 / [(3 + 1) * 3]", "sigs": [["15", "MISC-AQWAS-IGNORED", "IGNORED"], ["27", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  // ex-2am-silsila-bi-aqwas-l3-010
  "ex-2am-silsila-bi-aqwas-l3-010:q1": {"k": "keys", "truth": "35 + {18.4|8} - 2.5", "opts": [["(35 + 18.4) / 8 - 2.5", "MISPLACED"], ["35 + 18.4 / (8 - 2.5)", "MISPLACED"], ["35 + 18.4 / 8 - 2.5", null]]},
  "ex-2am-silsila-bi-aqwas-l3-010:q2": {"k": "keys", "truth": "{35 + 18.4|8} - 2.5", "opts": [["35 + 18.4 / 8 - 2.5", "DROPBR"], ["(35 + 18.4) / (8 - 2.5)", "MISPLACED"], ["(35 + 18.4) / 8 - 2.5", null], ["35 + (18.4 / 8) - 2.5", "MISPLACED"]]},
  "ex-2am-silsila-bi-aqwas-l3-010:q3": {"k": "keys", "truth": "35 + {18.4 - 2.4|8}", "opts": [["35 + (18.4 - 2.4) / 8", null], ["(35 + 18.4 - 2.4) / 8", "MISPLACED"], ["35 + 18.4 - 2.4 / 8", "DROPBR"]]},
  "ex-2am-silsila-bi-aqwas-l3-010:q4": {"k": "val", "e": "{35 + 18.4|8} - 2.5", "sigs": [["34.8", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  // ex-2am-silsila-bi-aqwas-l4-001
  "ex-2am-silsila-bi-aqwas-l4-001:q1": {"k": "val", "e": "3 + 6 * 2.5", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-001:q2": {"k": "val", "e": "1 + 2 * 4", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-001:q3": {"k": "val", "e": "45 - {3 + 6 * 2.5|1 + 2 * 4}", "sigs": [["65", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  "ex-2am-silsila-bi-aqwas-l4-001:q4": {"k": "keys", "truth": "45 - {3 + 6 * 2.5|1 + 2 * 4}", "opts": [["45 - (3 + 6 * 2.5) / 1 + 2 * 4", "DROPBR"], ["45 - 3 + 6 * 2.5 / 1 + 2 * 4", "DROPBR"], ["45 - (3 + 6 * 2.5) / (1 + 2 * 4)", null], ["45 - 3 + 6 * 2.5 / (1 + 2 * 4)", "DROPBR"]]},
  // ex-2am-silsila-bi-aqwas-l4-002
  "ex-2am-silsila-bi-aqwas-l4-002:q1": {"k": "val", "e": "30 - [(14 - 9) * 4]", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-002:q2": {"k": "yn", "claim": ["needed", "30 - [(14 - 9) * 4]", 0], "opts": [["yes", "NEEDED"], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l4-002:q3": {"k": "val", "e": "[(14 - 9) * 4] / 5 + 6", "sigs": [["12.8", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  // ex-2am-silsila-bi-aqwas-l4-003
  "ex-2am-silsila-bi-aqwas-l4-003:q1": {"k": "val", "e": "7.2 / 0.6", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-003:q2": {"k": "val", "e": "12 + 3 * 1.5", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-003:q3": {"k": "val", "e": "(7.2 / 0.6 + 3 * 1.5) * 4 - 10", "sigs": [["20", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l4-003:q4": {"k": "yn", "claim": ["needed", "(7.2 / 0.6 + 3 * 1.5) * 4 - 10", 0], "opts": [["yes", null], ["no", "USELESS"]]},
  // ex-2am-silsila-bi-aqwas-l4-004
  "ex-2am-silsila-bi-aqwas-l4-004:q1": {"k": "val", "e": "4.8 / 0.4", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-004:q2": {"k": "val", "e": "95 - [(4.8 / 0.4 + 5) * 2]", "sigs": [["93", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l4-004:q3": {"k": "yn", "claim": ["needed", "95 - [(4.8 / 0.4 + 5) * 2]", 0], "opts": [["yes", "NEEDED"], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l4-004:q4": {"k": "val", "e": "[(9.6 / 1.2 - 3) * 5] / 2", "sigs": [["0.5", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  // ex-2am-silsila-bi-aqwas-l4-005
  "ex-2am-silsila-bi-aqwas-l4-005:q1": {"k": "val", "e": "7.5 * 4 + 6", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-005:q2": {"k": "val", "e": "1.2 * 5", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-005:q3": {"k": "val", "e": "{7.5 * 4 + 6|1.2 * 5}", "sigs": [["55", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  "ex-2am-silsila-bi-aqwas-l4-005:q4": {"k": "keys", "truth": "{7.5 * 4 + 6|1.2 * 5}", "opts": [["(7.5 * 4 + 6) / 1.2 * 5", "DROPBR"], ["7.5 * 4 + 6 / 1.2 * 5", "DROPBR"], ["7.5 * 4 + 6 / (1.2 * 5)", "DROPBR"], ["(7.5 * 4 + 6) / (1.2 * 5)", null]]},
  // ex-2am-silsila-bi-aqwas-l4-006
  "ex-2am-silsila-bi-aqwas-l4-006:q1": {"k": "val", "e": "2 * 10.5", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-006:q2": {"k": "val", "e": "13 + 8.5 + 21", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-006:q3": {"k": "story", "e": "(13 + 8.5 + 2 * 10.5) / 4", "sigs": [["26.75", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l4-006:q4": {"k": "yn", "claim": ["cmp", "(13 + 8.5 + 2 * 10.5) / 4", ">=", "10"], "opts": [["yes", null], ["no", null]]},
  // ex-2am-silsila-bi-aqwas-l4-007
  "ex-2am-silsila-bi-aqwas-l4-007:q1": {"k": "val", "e": "8.4 / 0.7", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-007:q2": {"k": "valpick", "e": "60 - [(5.4 + 2.6) * 3 - 8.4 / 0.7]", "opts": [["50.4", "IGNORED"], ["48", null], ["24", "DROPOUTER"]]},
  "ex-2am-silsila-bi-aqwas-l4-007:q3": {"k": "val", "e": "60 - [(5.4 + 2.6) * 3 - 8.4 / 0.7]", "sigs": [["50.4", "MISC-AQWAS-IGNORED", "IGNORED"], ["24", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  // ex-2am-silsila-bi-aqwas-l4-008
  "ex-2am-silsila-bi-aqwas-l4-008:q1": {"k": "val", "e": "9.6 / 1.2 + 4", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-008:q2": {"k": "val", "e": "3 * 1.5 - 0.5", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-008:q3": {"k": "val", "e": "{9.6 / 1.2 + 4|3 * 1.5 - 0.5}", "sigs": [["9.5", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  "ex-2am-silsila-bi-aqwas-l4-008:q4": {"k": "keys", "truth": "{9.6 / 1.2 + 4|3 * 1.5 - 0.5}", "opts": [["(9.6 / 1.2 + 4) / 3 * 1.5 - 0.5", "DROPBR"], ["(9.6 / 1.2 + 4) / (3 * 1.5 - 0.5)", null], ["9.6 / 1.2 + 4 / 3 * 1.5 - 0.5", "DROPBR"], ["9.6 / 1.2 + 4 / (3 * 1.5 - 0.5)", "DROPBR"]]},
  "ex-2am-silsila-bi-aqwas-l4-008:q5": {"k": "implicit", "a": "4", "e": "6 + 3", "opts": [["36", null], ["49", "JOIN"], ["13", "PLUS"]]},
  // ex-2am-silsila-bi-aqwas-l4-009
  "ex-2am-silsila-bi-aqwas-l4-009:q1": {"k": "val", "e": "4 * 12.5 + 2 * 15", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l4-009:q2": {"k": "story", "e": "[300 - (4 * 12.5 + 2 * 15)] / 4", "sigs": [["257.5", "MISC-AQWAS-IGNORED", "IGNORED"], ["280", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  "ex-2am-silsila-bi-aqwas-l4-009:q3": {"k": "yn", "claim": ["cmp", "[300 - (4 * 12.5 + 2 * 15)] / 4", ">", "50"], "opts": [["yes", null], ["no", null]]},
  // ex-2am-silsila-bi-aqwas-l4-010
  "ex-2am-silsila-bi-aqwas-l4-010:q1": {"k": "val", "e": "[36 + 4 * (19 - 2 * 7)] / 2", "sigs": [["105", "MISC-AQWAS-IGNORED", "IGNORED"], ["46", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  "ex-2am-silsila-bi-aqwas-l4-010:q2": {"k": "val", "e": "3 * [(28 - 17.4) * 2 + 9.8]", "sigs": [["59", "MISC-AQWAS-IGNORED", "IGNORED"], ["73.4", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  "ex-2am-silsila-bi-aqwas-l4-010:q3": {"k": "val", "e": "(16.5 - 7.9) * [40 - (14.2 + 18.3)]", "sigs": [["311.5", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  // ex-2am-silsila-bi-aqwas-l5-001
  "ex-2am-silsila-bi-aqwas-l5-001:q1": {"k": "val", "e": "2 * [9 - (7 - 2 * 2)]", "sigs": [["7", "MISC-AQWAS-IGNORED", "IGNORED"], ["15", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  "ex-2am-silsila-bi-aqwas-l5-001:q2": {"k": "val", "e": "(16 - 9) * 2 - (11 - 7)", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l5-001:q3": {"k": "val", "e": "{6|11 - 5} + 3 * 2", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l5-001:q4": {"k": "yn", "claim": ["cmp", "{6|11 - 5} + 3 * 2", ">=", "10"], "opts": [["yes", null], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l5-001:q5": {"k": "self", "facts": [["2 * 9 - 7 - 2 * 2", "7"], ["2 * [9 - (7 - 2 * 2)]", "12"]]},
  // ex-2am-silsila-bi-aqwas-l5-002
  "ex-2am-silsila-bi-aqwas-l5-002:q1": {"k": "chain", "truth": "(84 - 5 * 4) / 8", "opts": [["(84 - 5 * 4) / 8", null], ["84 - 5 * 4 / 8", "IGNORED"], ["(84 - 5) * 4 / 8", "MISPLACED"]]},
  "ex-2am-silsila-bi-aqwas-l5-002:q2": {"k": "story", "e": "(84 - 5 * 4) / 8", "sigs": [["81.5", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-002:q3": {"k": "story", "e": "(84 - 5 * 4) / 4", "sigs": [["79", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-002:q4": {"k": "yn", "claim": ["cmp", "(84 - 5 * 4) / 8", ">=", "8"], "opts": [["yes", null], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l5-002:q5": {"k": "self", "facts": [["84 - 5 * 4 / 8", "81.5"], ["(84 - 5 * 4) / 8", "8"]]},
  // ex-2am-silsila-bi-aqwas-l5-003
  "ex-2am-silsila-bi-aqwas-l5-003:q1": {"k": "chain", "truth": "(4500 + 1500) / 40", "opts": [["4500 + 1500 / 40", "IGNORED"], ["(4500 + 1500 / 40)", "MISPLACED"], ["(4500 + 1500) / 40", null]]},
  "ex-2am-silsila-bi-aqwas-l5-003:q2": {"k": "story", "e": "(4500 + 1500) / 40", "sigs": [["4537.5", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-003:q3": {"k": "story", "e": "(4500 + 1500) / 48", "sigs": [["4531.25", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-003:q4": {"k": "yn", "claim": ["cmp", "(4500 + 1500) / 48", "<", "150"], "opts": [["yes", null], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l5-003:q5": {"k": "self", "facts": [["4500 + 1500 / 40", "4537.5"], ["(4500 + 1500) / 40", "150"]]},
  // ex-2am-silsila-bi-aqwas-l5-004
  "ex-2am-silsila-bi-aqwas-l5-004:q1": {"k": "chain", "truth": "(12 * 20 + 8 * 25) / 4", "opts": [["(12 * 20 + 8 * 25) / 4", null], ["(12 * 20 + 8) * 25 / 4", "MISPLACED"], ["12 * 20 + 8 * 25 / 4", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-004:q2": {"k": "story", "e": "(12 * 20 + 8 * 25) / 4", "sigs": [["290", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-004:q3": {"k": "story", "e": "(12 * 20 + 8 * 25) / 5", "sigs": [["280", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-004:q4": {"k": "yn", "claim": ["cmp", "(12 * 20 + 8 * 25) / 5", ">=", "100"], "opts": [["yes", null], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l5-004:q5": {"k": "self", "facts": [["12 * 20 + 8 * 25 / 4", "290"], ["(12 * 20 + 8 * 25) / 4", "110"]]},
  // ex-2am-silsila-bi-aqwas-l5-005
  "ex-2am-silsila-bi-aqwas-l5-005:q1": {"k": "chain", "truth": "[9 * 14 - (3 * 6 + 12)] / 4", "opts": [["9 * 14 - (3 * 6 + 12) / 4", "DROPOUTER"], ["9 * 14 - 3 * 6 + 12 / 4", "IGNORED"], ["[9 * 14 - (3 * 6 + 12)] / 4", null]]},
  "ex-2am-silsila-bi-aqwas-l5-005:q2": {"k": "story", "e": "[9 * 14 - (3 * 6 + 12)] / 4", "sigs": [["111", "MISC-AQWAS-IGNORED", "IGNORED"], ["118.5", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  "ex-2am-silsila-bi-aqwas-l5-005:q3": {"k": "story", "e": "9 * 14 - (3 * 6 + 12)", "sigs": [["120", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-005:q4": {"k": "yn", "claim": ["cmp", "[9 * 14 - (3 * 6 + 12)] / 4", ">=", "20"], "opts": [["yes", null], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l5-005:q5": {"k": "self", "facts": [["9 * 14 - (3 * 6 + 12) / 4", "118.5"], ["[9 * 14 - (3 * 6 + 12)] / 4", "24"]]},
  // ex-2am-silsila-bi-aqwas-l5-006
  "ex-2am-silsila-bi-aqwas-l5-006:q1": {"k": "chain", "truth": "[500 - (3 * 45 + 25)] / 5", "opts": [["[500 - (3 * 45 + 25)] / 5", null], ["500 - (3 * 45 + 25) / 5", "DROPOUTER"], ["500 - 3 * 45 + 25 / 5", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-006:q2": {"k": "story", "e": "[500 - (3 * 45 + 25)] / 5", "sigs": [["370", "MISC-AQWAS-IGNORED", "IGNORED"], ["468", "MISC-AQWAS-DROPOUTER", "DROPOUTER"]]},
  "ex-2am-silsila-bi-aqwas-l5-006:q3": {"k": "story", "e": "500 - (3 * 45 + 25)", "sigs": [["390", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-006:q4": {"k": "yn", "claim": ["cmp", "[500 - (3 * 45 + 25)] / 5", ">=", "70"], "opts": [["yes", null], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l5-006:q5": {"k": "self", "facts": [["500 - (3 * 45 + 25) / 5", "468"], ["[500 - (3 * 45 + 25)] / 5", "68"]]},
  // ex-2am-silsila-bi-aqwas-l5-007
  "ex-2am-silsila-bi-aqwas-l5-007:q1": {"k": "chain", "truth": "(3 * 400 + 600) / 8", "opts": [["3 * (400 + 600) / 8", "MISPLACED"], ["(3 * 400 + 600) / 8", null], ["3 * 400 + 600 / 8", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-007:q2": {"k": "story", "e": "{3 * 400 + 600|8}", "sigs": [["1275", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  "ex-2am-silsila-bi-aqwas-l5-007:q3": {"k": "story", "e": "{3 * 400 + 600|12}", "sigs": [["1250", "MISC-AQWAS-BARSPLIT", "BARSPLIT"]]},
  "ex-2am-silsila-bi-aqwas-l5-007:q4": {"k": "yn", "claim": ["cmp", "{3 * 400 + 600|12}", "<", "160"], "opts": [["yes", null], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l5-007:q5": {"k": "self", "facts": [["3 * 400 + 600 / 8", "1275"], ["(3 * 400 + 600) / 8", "225"]]},
  // ex-2am-silsila-bi-aqwas-l5-008
  "ex-2am-silsila-bi-aqwas-l5-008:q1": {"k": "chain", "truth": "(12 * 2.5 + 6) / 4", "opts": [["(12 * 2.5 + 6) / 4", null], ["12 * 2.5 + 6 / 4", "IGNORED"], ["12 * (2.5 + 6) / 4", "MISPLACED"]]},
  "ex-2am-silsila-bi-aqwas-l5-008:q2": {"k": "story", "e": "(12 * 2.5 + 6) / 4", "sigs": [["31.5", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-008:q3": {"k": "story", "e": "(12 * 2.5 + 6) / 3", "sigs": [["32", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-008:q4": {"k": "yn", "claim": ["cmp", "(12 * 2.5 + 6) / 3", ">", "10"], "opts": [["yes", null], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l5-008:q5": {"k": "self", "facts": [["12 * 2.5 + 6 / 4", "31.5"], ["(12 * 2.5 + 6) / 4", "9"]]},
  // ex-2am-silsila-bi-aqwas-l5-009
  "ex-2am-silsila-bi-aqwas-l5-009:q1": {"k": "chain", "truth": "(5 * 2.4 + 3.6) / 2", "opts": [["(5 * 2.4 + 3.6) / 2", null], ["5 * 2.4 + 3.6 / 2", "IGNORED"], ["5 * (2.4 + 3.6) / 2", "MISPLACED"]]},
  "ex-2am-silsila-bi-aqwas-l5-009:q2": {"k": "story", "e": "(5 * 2.4 + 3.6) / 2", "sigs": [["13.8", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-009:q3": {"k": "story", "e": "5 * 2.4 + 3.6", "sigs": []},
  "ex-2am-silsila-bi-aqwas-l5-009:q4": {"k": "yn", "claim": ["cmp", "(5 * 2.4 + 3.6) / 2", ">", "8"], "opts": [["yes", null], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l5-009:q5": {"k": "self", "facts": [["5 * 2.4 + 3.6 / 2", "13.8"], ["(5 * 2.4 + 3.6) / 2", "7.8"]]},
  // ex-2am-silsila-bi-aqwas-l5-010
  "ex-2am-silsila-bi-aqwas-l5-010:q1": {"k": "chain", "truth": "(15 + 131) / 8", "opts": [["(15 + 131) / 8", null], ["15 + 131 / 8", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-010:q2": {"k": "story", "e": "(15 + 131) / 8", "sigs": [["31.375", "MISC-AQWAS-IGNORED", "IGNORED"]]},
  "ex-2am-silsila-bi-aqwas-l5-010:q3": {"k": "ceil", "e": "(15 + 131) / 8"},
  "ex-2am-silsila-bi-aqwas-l5-010:q4": {"k": "yn", "claim": ["cmp", "18", ">=", "(15 + 131) / 8"], "opts": [["yes", null], ["no", null]]},
  "ex-2am-silsila-bi-aqwas-l5-010:q5": {"k": "self", "facts": [["15 + 131 / 8", "31.375"], ["(15 + 131) / 8", "18.25"]]},
};

/** Les réponses justes (indépendantes du contenu), clé `<feuille>:<question>` ; les selfCheck n'ont pas de clé. */
export const ORACLE = {};
for (const [k, sp] of Object.entries(SPEC)) { const j = judge(sp); if (j.answer) ORACLE[k] = j.answer; }

/* ── Audit : relecture du contenu ───────────────────────────────────── */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/2am/silsila-bi-aqwas');
const FORBIDDEN = /الكتاب|خنزير|قمار|نرد|ورق اللعب|خمر|ربا |فائدة|يانصيب/;
const TERM_SOURCES = new Set(['2am-s1-87:1', '2am-s1-81:1', '2am-s1-88:1', '2am-s1-70:1', '2am-s1-77:1', '2am-s1-91:1', '2am-s1-68:1', '2am-s1-79:2', '2am-s1-84:1', '2am-s1-78:1', '2am-s1-75:1']);
const PROVENANCE = { 1: [3, 5, 2], 2: [2, 5, 3], 3: [4, 4, 2], 4: [2, 7, 1], 5: [2, 7, 1] }; // term_exam / modelled / adapted

/** La convention [ ( ) ] : un crochet qui en contient un autre est un [ ], un crochet sans autre est un ( ). */
function conventionOk(n) {
  if (n.t === 'grp') { const nested = hasGrp(n.e); if (nested !== (n.k === '[')) return false; return conventionOk(n.e); }
  if (n.t === 'bar') return conventionOk(n.n) && conventionOk(n.d);
  if (n.t === 'chain') return n.o.every(conventionOk);
  return true;
}

export function audit(bank) {
  const problems = [];
  const sheets = {};
  try { for (const lv of readdirSync(ROOT)) for (const f of readdirSync(join(ROOT, lv))) { const d = JSON.parse(readFileSync(join(ROOT, lv, f), 'utf8')); sheets[d.id] = d; } } catch { /* banque absente */ }
  const sheetText = (sid) => { const s = sheets[sid]; return [s.statement.content, ...s.questions.map((x) => x.statement), ...s.questions.flatMap((x) => (x.choices ?? []).map((c) => c.content))].join(' '); };

  for (const { key, q } of bank) {
    const sp = SPEC[key];
    if (!sp) { problems.push(`${key} : aucune spec d'oracle`); continue; }
    const [sid] = key.split(':'); const sh = sheets[sid]; const level = sh?.level ?? 0;
    const skipEq = sp.k === 'place' || sp.k === 'missing' || (sp.k === 'yn' && sp.claim[0] === 'eq');
    const texts = [q.statement, q.answerFormat, ...(q.hints ?? []).map((h) => h.content), q.feedback?.correct, q.feedback?.incorrect, ...(q.solution?.lines ?? []), q.solution?.result, ...(q.choices ?? []).map((c) => c.content)];
    for (const t of texts) {
      if (!t) continue;
      if (FORBIDDEN.test(t)) problems.push(`${key} : texte interdit dans « ${t} »`);
      for (const isl of islands(t)) {
        if (level <= 3 && /[0-9}\])]\s*[([]/.test(isl.replace(/\{,\}/g, ','))) problems.push(`${key} : multiplication implicite dans « ${isl} »`);
        const seg = segments(isl);
        if (!seg) continue;
        const asts = seg.map(parse);
        for (const a of asts) if (!conventionOk(a)) problems.push(`${key} : convention [ ( ) ] non respectée dans « ${isl} »`);
        try {
          const vals = asts.map((a) => ev(a, true));
          if (!skipEq || t !== q.statement) if (vals.some((v) => !v.eq(vals[0]))) problems.push(`${key} : égalités fausses dans « ${isl} »`);
        } catch (err) { problems.push(`${key} : ${err.message} dans « ${isl} »`); }
      }
    }
    const sigsBank = (q.misconceptionSignatures ?? []).map((s) => `${D(dq(s.value))}|${s.id}`).sort();
    // ── rationnels : lecture de l'énoncé et signatures
    if (sp.k === 'val' || sp.k === 'story') {
      const want = (sp.sigs ?? []).map(([v, id]) => `${v}|${id}`).sort();
      if (JSON.stringify(sigsBank) !== JSON.stringify(want)) problems.push(`${key} : signatures ${sigsBank.join(' ; ')} ≠ attendues ${want.join(' ; ')}`);
      for (const [v, id, how] of sp.sigs ?? []) {
        const r = reading(how, sp.e);
        if (!r || D(r) !== v) problems.push(`${key} : la lecture ${how} de « ${sp.e} » ne vaut pas ${v}`);
        if (id !== MISC[how]) problems.push(`${key} : ${how} devrait porter ${MISC[how]}`);
        if (dq(v).eq(E(sp.e))) problems.push(`${key} : la signature ${id} est la bonne réponse`);
      }
      if (sp.k === 'val') {
        const isl = islands(q.statement)[0]; const seg = isl && segments(isl);
        if (!seg || norm(seg[0]) !== norm(sp.e)) problems.push(`${key} : l'énoncé relu « ${isl} » n'est pas « ${sp.e} »`);
      } else {
        const have = new Set(NUMS(sheetText(sid)));
        for (const nb of NUMS(sp.e)) if (!have.has(nb)) problems.push(`${key} : le nombre ${nb} de « ${sp.e} » n'est pas dans la feuille`);
      }
    } else if (q.misconceptionSignatures?.length) problems.push(`${key} : signatures sur une question de genre ${sp.k}`);
    if (q.answerType === 'rational' && !/^\d+(\.\d+)?$/.test(String(q.expectedAnswer))) problems.push(`${key} : clé « ${q.expectedAnswer} » (décimal positif exact attendu, point décimal)`);
    // ── QCM
    if (q.answerType === 'choice') {
      const j = judge(sp);
      const letters = q.choices.map((c) => c.id);
      if (j.answer.choiceId !== letters[q.choices.findIndex((c) => c.isCorrect)]) problems.push(`${key} : l'oracle juge ${j.answer.choiceId}, la feuille marque ${q.choices.find((c) => c.isCorrect)?.id}`);
      if (q.choices.filter((c) => c.isCorrect).length !== 1) problems.push(`${key} : plusieurs options marquées justes`);
      const cmp = sp.k === 'yn' && sp.claim[0] === 'cmp';
      for (const c of q.choices) {
        if (c.isCorrect) continue;
        if (!cmp && (!c.misconceptionId || !KNOWN.has(c.misconceptionId))) problems.push(`${key} : le distracteur ${c.id} ne porte pas de MISC-AQWAS-*`);
      }
      const opt = (k) => q.choices[k];
      const isl0 = (c) => islands(c.content)[0] ?? '';
      if (sp.k === 'valpick') {
        sp.opts.forEach(([v, how], k) => {
          const lit = NUMS(isl0(opt(k)))[0];
          if (lit !== v) problems.push(`${key} : l'option ${opt(k).id} relue « ${lit} » ≠ « ${v} »`);
          if (how) { const r = reading(how, sp.e); if (!r || D(r) !== v) problems.push(`${key} : la lecture ${how} de « ${sp.e} » ne vaut pas ${v}`); if (opt(k).misconceptionId !== MISC[how]) problems.push(`${key} : ${opt(k).id} devrait porter ${MISC[how]}`); }
        });
        const isl = islands(sh.statement.content)[0]; const seg = isl && segments(isl);
        if (!seg || norm(seg[0]) !== norm(sp.e)) problems.push(`${key} : l'énoncé de la feuille relu « ${isl} » n'est pas « ${sp.e} »`);
        const stNums = NUMS(sh.statement.content);
        for (const [v] of sp.opts) if (!stNums.includes(v)) problems.push(`${key} : la valeur ${v} n'est pas citée dans l'énoncé`);
      }
      if (['chain', 'keys', 'place', 'useless'].includes(sp.k)) {
        const correctIdx = j.flags.findIndex(Boolean);
        sp.opts.forEach(([a, how], k) => {
          const raw = lx2a(isl0(opt(k))).replace(/\s*=\s*$/, '');
          if (tryParse(raw) === null || norm(raw) !== norm(a)) problems.push(`${key} : l'option ${opt(k).id} relue « ${raw} » ≠ « ${a} »`);
          if (how) {
            if (opt(k).misconceptionId !== MISC[how]) problems.push(`${key} : ${opt(k).id} devrait porter ${MISC[how]}`);
            const right = sp.opts[correctIdx][0];
            if (sp.k === 'chain') {
              if (how === 'IGNORED' && norm(stripS(parse(sp.truth))) !== norm(a)) problems.push(`${key} : « ${a} » n'est pas la lecture IGNORED de « ${sp.truth} »`);
              if (how === 'DROPOUTER' && norm(dropOuterS(parse(sp.truth))) !== norm(a)) problems.push(`${key} : « ${a} » n'est pas la lecture DROPOUTER de « ${sp.truth} »`);
              if (how === 'MISPLACED' && (flatTokens(a) !== flatTokens(sp.truth) || pairsOf(a).length === 0)) problems.push(`${key} : « ${a} » n'a pas les mêmes nombres et opérations que « ${sp.truth} »`);
            }
            if (sp.k === 'keys') {
              if (how === 'DROPBR') {
                const ps = pairsOf(right); let ok = false;
                for (let m = 1; m < (1 << ps.length); m++) { const ks = ps.map((_, i) => i).filter((i) => (m >> i) & 1); if (norm(removePairs(right, ks)) === norm(a)) ok = true; }
                if (!ok) problems.push(`${key} : « ${a} » n'est pas « ${right} » privée de crochets`);
              }
              if (how === 'MISPLACED' && flatTokens(a) !== flatTokens(right)) problems.push(`${key} : « ${a} » n'a pas les mêmes nombres et opérations que « ${right} »`);
            }
            if (sp.k === 'place') {
              if (flatTokens(a) !== flatTokens(sp.flat)) problems.push(`${key} : « ${a} » n'est pas « ${sp.flat} » avec des crochets`);
              if (how === 'USELESS' && !(allUseless(a) && E(a, false).eq(E(sp.flat, false)))) problems.push(`${key} : les crochets de « ${a} » ne sont pas tous inutiles`);
              if (how === 'MISPLACED' && !someNeeded(a)) problems.push(`${key} : « ${a} » n'a aucun crochet nécessaire`);
            }
            if (sp.k === 'useless') {
              if (how === 'USELESS' && !someNeeded(a)) problems.push(`${key} : « ${a} » n'a aucun crochet nécessaire (ALLUSELESS)`);
              if (how === 'NEEDED' && !allUseless(a)) problems.push(`${key} : « ${a} » a un crochet nécessaire (ALLNEEDED)`);
            }
          }
        });
        if (sp.k === 'place') {
          const isl = islands(q.statement)[0]; const a = isl && lx2a(isl); const parts = a?.split('=').map((x) => x.trim());
          if (!parts || parts.length !== 2 || norm(parts[0]) !== norm(sp.flat) || D(dq(parts[1])) !== sp.target) problems.push(`${key} : l'énoncé relu « ${isl} » n'est pas « ${sp.flat} = ${sp.target} »`);
        }
        if (sp.k === 'keys') {
          const stmt = sheetText(sid) + ' ' + q.statement; const nb = NUMS(sp.truth);
          for (const n of nb) if (!NUMS(stmt).includes(n)) problems.push(`${key} : le nombre ${n} de « ${sp.truth} » n'est pas dans la feuille`);
        }
      }
      if (sp.k === 'implicit') {
        const isl = islands(q.statement)[0] ?? ''; const m = /^(\d+)\((.*)\)$/.exec(isl.replace(/\{,\}/g, '.').replace(/\s+/g, ' ').trim());
        if (!m || m[1] !== sp.a || lx2a(m[2]) !== sp.e) problems.push(`${key} : l'énoncé relu « ${isl} » n'est pas « ${sp.a}(${sp.e}) »`);
        const first = /^\d+(?:\.\d+)?/.exec(sp.e)[0]; const rest = sp.e.slice(first.length);
        sp.opts.forEach(([v, how], k) => {
          if (NUMS(isl0(opt(k)))[0] !== v) problems.push(`${key} : l'option ${opt(k).id} ≠ ${v}`);
          if (how) {
            const w = how === 'JOIN' ? E(`${sp.a}${first}${rest}`) : E(`${sp.a} + (${sp.e})`);
            if (D(w) !== v) problems.push(`${key} : la lecture ${how} de ${sp.a}(${sp.e}) ne vaut pas ${v}`);
            if (opt(k).misconceptionId !== MISC.IMPLICITX) problems.push(`${key} : ${opt(k).id} devrait porter IMPLICITX`);
          }
        });
        if (level <= 3) problems.push(`${key} : multiplication implicite au niveau ${level}`);
      }
      if (sp.k === 'yn') {
        const c = sp.claim;
        if (c[0] === 'needed') {
          const ok = islands(q.statement).some((i) => { const s = segments(i); return s && norm(s[0]) === norm(c[1]); });
          if (!ok) problems.push(`${key} : l'énoncé ne contient pas l'expression « ${c[1]} »`);
          if (c[2] >= pairsOf(c[1]).length) problems.push(`${key} : le crochet ${c[2]} n'existe pas`);
          const truth = j.flags[0]; const wrongC = q.choices[truth ? 1 : 0]; const want = truth ? MISC.USELESS : MISC.NEEDED;
          if (wrongC.misconceptionId !== want) problems.push(`${key} : le distracteur devrait porter ${want}`);
        } else if (c[0] === 'eq') {
          const isl = islands(q.statement)[0]; const a = isl && lx2a(isl); const parts = a?.split('=').map((x) => x.trim());
          if (!parts || parts.length !== 2 || norm(parts[0]) !== norm(c[1]) || norm(parts[1]) !== norm(c[2])) problems.push(`${key} : l'énoncé relu « ${isl} » n'est pas « ${c[1]} = ${c[2]} »`);
          const truth = j.flags[0]; const wrongC = q.choices[truth ? 1 : 0]; const want = truth ? MISC.NEEDED : MISC.USELESS;
          if (wrongC.misconceptionId !== want) problems.push(`${key} : le distracteur devrait porter ${want}`);
        } else {
          const have = new Set(NUMS(sheetText(sid)));
          for (const nb of [...NUMS(c[1]), ...NUMS(c[3])]) if (!have.has(nb)) problems.push(`${key} : le nombre ${nb} de la comparaison n'est pas dans la feuille`);
        }
      }
    }
    if (sp.k === 'missing') {
      const isl = islands(q.statement)[0]; const a = isl && lx2a(isl); const k = a?.lastIndexOf('=');
      const left = a?.slice(0, k).trim(); const right = a?.slice(k + 1).trim();
      if (!left || norm(left) !== norm(sp.tmpl.replace('_', '@')) || D(dq(right)) !== sp.target) problems.push(`${key} : l'énoncé relu « ${isl} » n'est pas « ${sp.tmpl} = ${sp.target} »`);
    }
    if (sp.k === 'self') {
      const lines = (q.solution?.lines ?? []).join(' ').replace(/\{,\}/g, '.');
      for (const [a, v] of sp.facts) {
        if (!E(a, false).eq(dq(v))) problems.push(`${key} : « ${a} » ne vaut pas ${v}`);
        if (!NUMS(lines).includes(D(dq(v)))) problems.push(`${key} : le corrigé ne cite pas ${v}`);
      }
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
  for (const ex of files) {
    const s = ex.metadata.source;
    const all = [ex.metadata.title, ...(ex.metadata.tags ?? []), ex.statement.content];
    for (const t of all) if (t && FORBIDDEN.test(t)) problems.push(`${ex.id} : texte interdit dans « ${String(t).slice(0, 60)} »`);
    for (const t of all) for (const isl of islands(t)) {
      if (ex.level <= 3 && /[0-9}\])]\s*[([]/.test(isl.replace(/\{,\}/g, ','))) problems.push(`${ex.id} : multiplication implicite dans « ${isl} »`);
      const seg = segments(isl); if (seg) for (const a of seg.map(parse)) if (!conventionOk(a)) problems.push(`${ex.id} : convention [ ( ) ] dans « ${isl} »`);
    }
    if (s.type === 'term_exam' && !TERM_SOURCES.has(`${s.file}:${s.exercise}`)) problems.push(`${ex.id} : sujet ${s.file} ex ${s.exercise} non lu pour cette banque`);
    if (ex.metadata.exam.kind === 'official' || ex.metadata.exam.kind === 'excerpt') problems.push(`${ex.id} : jamais officiel en 2AM`);
    for (const q of ex.questions) if (q.answerType === 'selfCheck' && q.counted !== undefined) problems.push(`${ex.id}:${q.id} : selfCheck marquée counted`);
  }
  return problems;
}
