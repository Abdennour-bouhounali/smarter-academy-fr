// Oracle du banc « ibara-harfiya-intaj » (إنتاج عبارة حرفية واستعمالها, 2AM unité 4, leçon 1, 2026-10-29) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الثاني / الثالث »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Tout est RECALCULÉ ICI, avec des outils écrits dans ce fichier (aucun import de packages/core) :
//  - rationnels EXACTS en BigInt (classe Q), polynômes à plusieurs lettres à coefficients rationnels (classe Poly : égalité de deux
//    écritures = égalité des formes normales), un parseur ASCII (nombres décimaux, lettres n x y a b c, + - * / ^ ( ) et frac(a,b)),
//    un évaluateur qui REFUSE tout intermédiaire négatif (le 2AM d'avant l'unité 3 n'a pas les relatifs : owner Q10) ;
//  - SPEC (ci-dessous) ne contient QUE des expressions ASCII et des paramètres de recette : jamais une réponse. Pour chaque question
//    l'oracle recalcule la clé (val : valeur exacte ; ex / simp : l'option dont le polynôme égale la vérité construite ici ; same /
//    cmp : oui / non par comparaison exacte), puis REFAIT chaque distracteur à partir de la recette de son erreur nommée
//    (RECIPES : PERCELL (k+c)n · NOFIRST kn · POWER x^k · ADDFOR k+x · PRODSQUARE (kx)² · SQUARE2 2x · ADDPOWERS (a+b)x² ·
//    MULTCOEF abx · ZEROSKIP · BRACKET (parenthèses perdues) · JUXTA « 5n » lu 512) : chaque option marquée est EXACTEMENT sa
//    lecture et FAUSSE, une option sans balise est fausse et ne reproduit AUCUNE lecture nommée, une seule option est vraie ;
//  - audit(bank) RELIT le LaTeX de chaque énoncé, option, indice, corrigé (lecteur tex2ascii) : l'expression de la spec est bien
//    dans l'énoncé, les valeurs données y sont, chaque chaîne « a = b = c » du corrigé est égale (comme polynômes), aucun
//    intermédiaire négatif, lettres seulement n x y a b c, aucune mention du manuel, argent en `$…$ DA`, mots interdits ;
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
  zero() { return this.n === 0n; }
}
const ZERO = new Q(0n); const ONE = new Q(1n);
const dq = (s) => { const m = /^(\d+)(?:\.(\d+))?$/.exec(String(s).trim()); if (!m) throw new Error(`nombre illisible : ${s}`); const f = m[2] ?? ''; return new Q(BigInt(m[1] + f), 10n ** BigInt(f.length)); };
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
  const t = s.match(/\d+(?:\.\d+)?|frac|[a-z]|[()+\-*/^,]/g) ?? [];
  if (t.join('') !== s.replace(/\s+/g, '')) throw new Error(`caractères illisibles dans « ${s} »`);
  let i = 0;
  const atom = () => {
    const v = t[i++];
    if (v === '(') { const e = expr(); if (t[i++] !== ')') throw new Error(`« ) » attendu dans « ${s} »`); return e; }
    if (v === 'frac') { if (t[i++] !== '(') throw new Error('frac('); const a = expr(); if (t[i++] !== ',') throw new Error('frac,'); const b = expr(); if (t[i++] !== ')') throw new Error('frac)'); return { k: 'f', a, b }; }
    if (v !== undefined && /^\d/.test(v)) return { k: 'n', v: dq(v), s: v };
    if (v !== undefined && /^[a-z]$/.test(v)) return { k: 'v', n: v };
    throw new Error(`facteur attendu dans « ${s} »`);
  };
  const pw = () => { const b = atom(); if (t[i] === '^') { i++; const e = Number(t[i++]); if (!Number.isInteger(e) || e < 1 || e > 12) throw new Error('exposant'); return { k: 'p', b, e }; } return b; };
  const term = () => { let l = pw(); while (t[i] === '*' || t[i] === '/') { const o = t[i++]; l = { k: 'b', o, l, r: pw() }; } return l; };
  const expr = () => { let l = term(); while (t[i] === '+' || t[i] === '-') { const o = t[i++]; l = { k: 'b', o, l, r: term() }; } return l; };
  const root = expr(); if (i !== t.length) throw new Error(`reste dans « ${s} »`);
  return root;
}
/* évaluation exacte avec lettres → rationnels ; refuse un intermédiaire négatif ; mode = lecture fautive (JUXTA, ADDFOR, SQUARE2, PRODSQUARE) */
function evalTree(n, env, mode = null) {
  switch (n.k) {
    case 'n': return n.v;
    case 'v': { if (!(n.n in env)) throw new Error(`lettre ${n.n} sans valeur`); return env[n.n]; }
    case 'f': return evalTree(n.a, env, mode).div(evalTree(n.b, env, mode));
    case 'p': {
      if (mode === 'SQUARE2' && n.b.k === 'v' && n.e === 2) return new Q(2n).mul(evalTree(n.b, env, mode));
      const b = evalTree(n.b, env, mode); let r = ONE; for (let j = 0; j < n.e; j++) r = r.mul(b); return r;
    }
    default: {
      if (n.o === '*' && n.l.k === 'n' && n.r.k === 'v') {
        if (mode === 'JUXTA') return dq(n.l.s + D(evalTree(n.r, env, mode)));
        if (mode === 'ADDFOR') return evalTree(n.l, env, mode).add(evalTree(n.r, env, mode));
      }
      if (mode === 'PRODSQUARE' && n.o === '*' && n.l.k === 'n' && n.r.k === 'p' && n.r.b.k === 'v' && n.r.e === 2) { const q = evalTree(n.l, env, mode).mul(evalTree(n.r.b, env, mode)); return q.mul(q); }
      const l = evalTree(n.l, env, mode); const r = evalTree(n.r, env, mode);
      if (n.o === '+') return l.add(r);
      if (n.o === '-') { const o = l.sub(r); if (!mode && o.n < 0n) throw new Error('intermédiaire négatif'); return o; }
      if (n.o === '*') return l.mul(r);
      return l.div(r);
    }
  }
}
const envQ = (e) => Object.fromEntries(Object.entries(e ?? {}).map(([k, v]) => [k, dq(String(v))]));
const val = (s, env, mode) => evalTree(parse(s), envQ(env), mode);

/* ── polynômes à plusieurs lettres ── */
class Poly {
  constructor(m = new Map()) { this.m = new Map([...m].filter(([, c]) => !c.zero())); }
  static c(q) { return new Poly(new Map([['', q]])); }
  static v(l) { return new Poly(new Map([[`${l}^1`, ONE]])); }
  add(o) { const m = new Map(this.m); for (const [k, c] of o.m) m.set(k, (m.get(k) ?? ZERO).add(c)); return new Poly(m); }
  neg() { return new Poly(new Map([...this.m].map(([k, c]) => [k, c.mul(new Q(-1n))]))); }
  sub(o) { return this.add(o.neg()); }
  mul(o) {
    const m = new Map();
    for (const [k1, c1] of this.m) for (const [k2, c2] of o.m) {
      const e = {}; for (const part of [k1, k2]) for (const tk of part ? part.split('*') : []) { const [l, p] = tk.split('^'); e[l] = (e[l] ?? 0) + Number(p); }
      const key = Object.keys(e).sort().map((l) => `${l}^${e[l]}`).join('*');
      m.set(key, (m.get(key) ?? ZERO).add(c1.mul(c2)));
    }
    return new Poly(m);
  }
  constant() { return this.m.size === 0 ? ZERO : (this.m.size === 1 && this.m.has('') ? this.m.get('') : null); }
  eq(o) { const a = this.sub(o); return a.m.size === 0; }
}
function polyOf(n) {
  switch (n.k) {
    case 'n': return Poly.c(n.v);
    case 'v': return Poly.v(n.n);
    case 'f': { const d = polyOf(n.b).constant(); if (d === null || d.zero()) throw new Error('division par un non-constant'); return polyOf(n.a).mul(Poly.c(ONE.div(d))); }
    case 'p': { let r = Poly.c(ONE); const b = polyOf(n.b); for (let j = 0; j < n.e; j++) r = r.mul(b); return r; }
    default: {
      const l = polyOf(n.l); const r = polyOf(n.r);
      if (n.o === '+') return l.add(r); if (n.o === '-') return l.sub(r); if (n.o === '*') return l.mul(r);
      const d = r.constant(); if (d === null || d.zero()) throw new Error('division par un non-constant'); return l.mul(Poly.c(ONE.div(d)));
    }
  }
}
const P = (s) => polyOf(parse(s));
const scale = (k, p) => Poly.c(dq(String(k))).mul(p);

/* ── recettes : les lectures nommées, reconstruites ici ── */
const WORDS_AR = { next: 'الذي يلي', prev: 'الذي يسبق', half: 'نصف', third: 'ثلث', quarter: 'ربع', double: 'ضعف', triple: 'ثلاثة أمثال', square: 'مربّع', cube: 'مكعّب' };
const WORD_OK = { next: (L) => `${L}+1`, prev: (L) => `${L}-1`, half: (L) => `frac(${L},2)`, third: (L) => `frac(${L},3)`, quarter: (L) => `frac(${L},4)`, double: (L) => `2*${L}`, triple: (L) => `3*${L}`, square: (L) => `${L}^2`, cube: (L) => `${L}^3` };
/** programme : vérité par opérations sur le polynôme (aucune chaîne), lecture sans parenthèses par la grammaire des priorités. */
function progOK(steps, L) {
  let p = Poly.v(L);
  for (const [op, k] of steps) { const c = Poly.c(dq(String(k))); p = op === '+' ? p.add(c) : op === '*' ? p.mul(c) : p.mul(Poly.c(ONE.div(dq(String(k))))); }
  return p;
}
function progFlat(steps, L) {
  let s = L;
  for (const [op, k] of steps) s = op === '+' ? `${s}+${k}` : op === '*' ? `${k}*${s}` : `${s}/${k}`;
  return P(s);
}
const sumOf = (xs) => xs.map(P).reduce((a, b) => a.add(b), Poly.c(ZERO));
const RECIPES = {
  free: ({ a }) => ({ OK: P(a) }),
  word: ({ w, L }) => ({ OK: P(WORD_OK[w](L)), ...(w === 'double' ? { POWER: P(`${L}^2`), ADDFOR: P(`${L}+2`) } : {}), ...(w === 'triple' ? { POWER: P(`${L}^3`), ADDFOR: P(`${L}+3`) } : {}), ...(w === 'square' ? { SQUARE2: P(`2*${L}`) } : {}) }),
  mul: ({ k, L }) => ({ OK: scale(k, Poly.v(L)), POWER: (() => { let r = Poly.c(ONE); for (let j = 0; j < k; j++) r = r.mul(Poly.v(L)); return r; })(), ADDFOR: Poly.v(L).add(Poly.c(dq(String(k)))) }),
  lin: ({ k, c, L }) => { const x = Poly.v(L); const kc = Poly.c(dq(String(c))); return { OK: scale(k, x).add(kc), PERCELL: scale(k + c, x), NOFIRST: scale(k, x), ADDFOR: Poly.c(dq(String(k))).add(x).add(kc), BRACKET: scale(k, x.add(kc)) }; },
  lin2: ({ k1, a, k2, b }) => ({ OK: scale(k1, Poly.v(a)).add(scale(k2, Poly.v(b))), ADDFOR: Poly.c(dq(String(k1))).add(Poly.v(a)).add(Poly.c(dq(String(k2)))).add(Poly.v(b)) }),
  sq: ({ k, L }) => { const x = Poly.v(L); return { OK: scale(k, x.mul(x)), SQUARE2: scale(2 * k, x), ...(k > 1 ? { PRODSQUARE: scale(k, x).mul(scale(k, x)) } : {}) }; },
  sqc: ({ L, c }) => { const x = Poly.v(L); const kc = Poly.c(dq(String(c))); return { OK: x.mul(x).add(kc), SQUARE2: scale(2, x).add(kc) }; },
  sqlin: ({ L, k }) => { const x = Poly.v(L); return { OK: x.mul(x).add(scale(k, x)), ADDPOWERS: scale(1 + k, x.mul(x)), SQUARE2: scale(2, x).add(scale(k, x)) }; },
  cc: ({ L }) => { const x = Poly.v(L); return { OK: scale(2, x).add(x.mul(x)), ADDPOWERS: scale(3, x.mul(x)) }; },
  cube: ({ L }) => { const x = Poly.v(L); return { OK: x.mul(x).mul(x), SQUARE2: scale(3, x) }; },
  like: ({ a, b, L, c }) => { const x = Poly.v(L); const kc = c ? Poly.c(dq(String(c))) : Poly.c(ZERO); return { OK: scale(a + b, x).add(kc), ADDPOWERS: scale(a + b, x.mul(x)).add(kc), MULTCOEF: scale(a * b, x).add(kc) }; },
  zero: ({ a, L, M, c }) => { const x = Poly.v(L); const kc = c ? Poly.c(dq(String(c))) : Poly.c(ZERO); return { OK: scale(a, x).add(kc), ZEROSKIP: scale(a, x).add(Poly.v(M)).add(kc) }; },
  geo: ({ sides, shared, forgot }) => { const s = sumOf(sides); return { OK: s, ...(shared ? { PERCELL: s.add(P(shared)) } : {}), ...(forgot ? { NOFIRST: s.sub(P(forgot)) } : {}) }; },
  prog: ({ steps, L }) => ({ OK: progOK(steps, L), BRACKET: progFlat(steps, L) }),
};
/** « parenthèses perdues » d'une écriture : frac(X,Y) → X/Y et plus aucune parenthèse (la lecture BRACKET d'une comparaison oui/non). */
const flatRead = (a) => P(a.replace(/frac\(([^,]*),([^)]*)\)/g, '$1/$2').replace(/[()]/g, ''));

/* ── lecture du LaTeX ── */
const islands = (text) => String(text ?? '').split('$').filter((_, i) => i % 2 === 1);
function texToAscii(raw) {
  let s = raw;
  s = s.replace(/\\ ?\\mathrm\{[A-Za-z]+\}(\^\{\d\})?/g, '').replace(/\\mathrm\{[A-Za-z]+\}(\^\{\d\})?/g, '');
  s = s.replace(/\\,|\\?;|\\ |~/g, '').replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\\div/g, '/');
  let prev; do { prev = s; s = s.replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, '@($1,$2)'); } while (s !== prev);
  s = s.replace(/\^\{(\d+)\}/g, '^$1').replace(/\s+/g, '');
  s = s.replace(/(\d|[a-z]|\))(?=[a-z(@])/g, '$1*').replace(/@\(/g, 'frac(');
  return s;
}
const compact = (a) => a.replace(/\s+/g, '');
const stripLabel = (a) => a.replace(/^[A-Za-z]+=(?=.)/, '');
const numbersOf = (text) => new Set((String(text).replace(/\{,\}/g, '.').match(/\d+(?:\.\d+)?/g) ?? []));

/* ── les jugements ── */
const SPEC = {
  "ex-2am-ibara-harfiya-intaj-l1-001:q1": {"t":"ex","rk":"word","rp":{"w":"next","L":"n"},"opts":[{"id":"A","a":"n-1","tag":null,"ok":false},{"id":"B","a":"2*n","tag":null,"ok":false},{"id":"C","a":"n+1","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l1-001:q2": {"t":"ex","rk":"word","rp":{"w":"triple","L":"n"},"opts":[{"id":"A","a":"3*n","tag":null,"ok":true},{"id":"B","a":"n+3","tag":"ADDFOR","ok":false},{"id":"C","a":"n^3","tag":"POWER","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l1-001:q3": {"t":"ex","rk":"word","rp":{"w":"square","L":"n"},"opts":[{"id":"A","a":"2*n","tag":"SQUARE2","ok":false},{"id":"B","a":"n^2","tag":null,"ok":true},{"id":"C","a":"n+2","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l1-001:q4": {"t":"val","e":"n^2","env":{"n":7},"sigs":["SQUARE2"]},
  "ex-2am-ibara-harfiya-intaj-l1-002:q1": {"t":"ex","rk":"mul","rp":{"k":8,"L":"n"},"opts":[{"id":"A","a":"8*n","tag":null,"ok":true},{"id":"B","a":"n+8","tag":"ADDFOR","ok":false},{"id":"C","a":"n^8","tag":"POWER","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l1-002:q2": {"t":"val","e":"8*n","env":{"n":12},"sigs":["JUXTA","ADDFOR"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-002:q3": {"t":"val","e":"8*n","env":{"n":25},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-003:q1": {"t":"ex","rk":"lin","rp":{"k":4,"c":1,"L":"n"},"opts":[{"id":"A","a":"5*n","tag":"PERCELL","ok":false},{"id":"B","a":"4*n+1","tag":null,"ok":true},{"id":"C","a":"4*n","tag":"NOFIRST","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l1-003:q2": {"t":"val","e":"4*n+1","env":{"n":15},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-003:q3": {"t":"val","e":"4*n+1","env":{"n":30},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-004:q1": {"t":"ex","rk":"lin","rp":{"k":40,"c":150,"L":"x"},"opts":[{"id":"A","a":"190*x","tag":"PERCELL","ok":false},{"id":"B","a":"40*x","tag":"NOFIRST","ok":false},{"id":"C","a":"40*x+150","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l1-004:q2": {"t":"val","e":"40*x+150","env":{"x":6},"sigs":["JUXTA","ADDFOR"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-004:q3": {"t":"val","e":"40*x+150","env":{"x":0},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-005:q1": {"t":"ex","rk":"prog","rp":{"steps":[["+",5],["*",2]],"L":"n"},"opts":[{"id":"A","a":"2*(n+5)","tag":null,"ok":true},{"id":"B","a":"2*n+5","tag":"BRACKET","ok":false},{"id":"C","a":"n+10","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l1-005:q2": {"t":"val","e":"2*(n+5)","env":{"n":7},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-005:q3": {"t":"val","e":"2*(n+5)","env":{"n":0},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-006:q1": {"t":"ex","rk":"mul","rp":{"k":4,"L":"x"},"opts":[{"id":"A","a":"x^4","tag":"POWER","ok":false},{"id":"B","a":"4*x","tag":null,"ok":true},{"id":"C","a":"x+4","tag":"ADDFOR","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l1-006:q2": {"t":"val","e":"4*x","env":{"x":13},"sigs":["JUXTA","ADDFOR"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-006:q3": {"t":"val","e":"x^2","env":{"x":13},"sigs":["SQUARE2"]},
  "ex-2am-ibara-harfiya-intaj-l1-007:q1": {"t":"ex","rk":"word","rp":{"w":"half","L":"n"},"opts":[{"id":"A","a":"2*n","tag":null,"ok":false},{"id":"B","a":"n-2","tag":null,"ok":false},{"id":"C","a":"frac(n,2)","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l1-007:q2": {"t":"val","e":"frac(n,2)","env":{"n":30},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-007:q3": {"t":"val","e":"frac(n,2)","env":{"n":26},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-008:q1": {"t":"ex","rk":"free","rp":{"a":"x+7","L":"x"},"opts":[{"id":"A","a":"x+7","tag":null,"ok":true},{"id":"B","a":"7*x","tag":null,"ok":false},{"id":"C","a":"x-7","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l1-008:q2": {"t":"val","e":"x+7","env":{"x":5},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-008:q3": {"t":"ex","rk":"geo","rp":{"sides":["x","x+7","x","x+7"],"forgot":"x+7","L":"x"},"opts":[{"id":"A","a":"3*x+7","tag":"NOFIRST","ok":false},{"id":"B","a":"4*x+7","tag":null,"ok":false},{"id":"C","a":"4*x+14","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l1-009:q1": {"t":"ex","rk":"lin2","rp":{"k1":35,"a":"a","k2":20,"b":"b","L":"a"},"opts":[{"id":"A","a":"35+a+20+b","tag":"ADDFOR","ok":false},{"id":"B","a":"35*a+20*b","tag":null,"ok":true},{"id":"C","a":"55*a*b","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l1-009:q2": {"t":"val","e":"35*a+20*b","env":{"a":2,"b":3},"sigs":["JUXTA","ADDFOR"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-009:q3": {"t":"val","e":"35*a+20*b","env":{"a":4,"b":0},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l1-010:q1": {"t":"ex","rk":"lin","rp":{"k":7,"c":2,"L":"n"},"opts":[{"id":"A","a":"7+n+2","tag":"ADDFOR","ok":false},{"id":"B","a":"7*(n+2)","tag":"BRACKET","ok":false},{"id":"C","a":"7*n+2","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l1-010:q2": {"t":"val","e":"7*n+2","env":{"n":10},"sigs":["JUXTA","ADDFOR"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l2-001:q1": {"t":"val","e":"4*x+7","env":{"x":0}},
  "ex-2am-ibara-harfiya-intaj-l2-001:q2": {"t":"val","e":"4*x+7","env":{"x":3}},
  "ex-2am-ibara-harfiya-intaj-l2-001:q3": {"t":"val","e":"4*x+7","env":{"x":10},"sigs":["JUXTA"]},
  "ex-2am-ibara-harfiya-intaj-l2-001:q4": {"t":"val","e":"4*x+7","env":{"x":2.5}},
  "ex-2am-ibara-harfiya-intaj-l2-002:q1": {"t":"val","e":"2*a+3*b+1","env":{"a":4,"b":5},"sigs":["JUXTA","ADDFOR"]},
  "ex-2am-ibara-harfiya-intaj-l2-002:q2": {"t":"val","e":"2*a+3*b+1","env":{"a":10,"b":0}},
  "ex-2am-ibara-harfiya-intaj-l2-002:q3": {"t":"val","e":"2*a+3*b+1","env":{"a":6,"b":7},"sigs":["JUXTA"]},
  "ex-2am-ibara-harfiya-intaj-l2-003:q1": {"t":"val","e":"8*x+6","env":{"x":2.5}},
  "ex-2am-ibara-harfiya-intaj-l2-003:q2": {"t":"val","e":"8*x+6","env":{"x":0.5}},
  "ex-2am-ibara-harfiya-intaj-l2-003:q3": {"t":"val","e":"8*x+6","env":{"x":1.25}},
  "ex-2am-ibara-harfiya-intaj-l2-004:q1": {"t":"val","e":"35*x+300","env":{"x":4},"sigs":["JUXTA"],"story":true},
  "ex-2am-ibara-harfiya-intaj-l2-004:q2": {"t":"val","e":"35*x+300","env":{"x":10},"sigs":["JUXTA"],"story":true},
  "ex-2am-ibara-harfiya-intaj-l2-004:q3": {"t":"val","e":"35*x+300","env":{"x":20},"sigs":["ADDFOR"],"story":true},
  "ex-2am-ibara-harfiya-intaj-l2-005:q1": {"t":"val","e":"x^2+3","env":{"x":2}},
  "ex-2am-ibara-harfiya-intaj-l2-005:q2": {"t":"val","e":"x^2+3","env":{"x":5},"sigs":["SQUARE2"]},
  "ex-2am-ibara-harfiya-intaj-l2-005:q3": {"t":"val","e":"x^2+3","env":{"x":9},"sigs":["SQUARE2"]},
  "ex-2am-ibara-harfiya-intaj-l2-006:q1": {"t":"val","e":"2*x^2","env":{"x":3},"sigs":["PRODSQUARE","SQUARE2"]},
  "ex-2am-ibara-harfiya-intaj-l2-006:q2": {"t":"val","e":"2*x^2","env":{"x":4},"sigs":["PRODSQUARE","SQUARE2"]},
  "ex-2am-ibara-harfiya-intaj-l2-006:q3": {"t":"val","e":"3*x^2+1","env":{"x":2},"sigs":["PRODSQUARE"]},
  "ex-2am-ibara-harfiya-intaj-l2-007:q1": {"t":"simp","rk":"free","rp":{"a":"a","L":"a"},"show":"1*a","opts":[{"id":"A","a":"a","tag":null,"ok":true},{"id":"B","a":"1+a","tag":null,"ok":false},{"id":"C","a":"0","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l2-007:q2": {"t":"simp","rk":"zero","rp":{"a":5,"L":"a","M":"b"},"show":"5*a+0*b","opts":[{"id":"A","a":"5*a+b","tag":"ZEROSKIP","ok":false},{"id":"B","a":"5*a","tag":null,"ok":true},{"id":"C","a":"5*a*b","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l2-007:q3": {"t":"simp","rk":"free","rp":{"a":"3*a*b","L":"a"},"show":"3*a*b","opts":[{"id":"A","a":"3*a+b","tag":null,"ok":false},{"id":"B","a":"a^3*b","tag":null,"ok":false},{"id":"C","a":"3*a*b","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l2-007:q4": {"t":"val","e":"3*a*b","env":{"a":2,"b":5},"sigs":["JUXTA","ADDFOR"]},
  "ex-2am-ibara-harfiya-intaj-l2-008:q1": {"t":"simp","rk":"sq","rp":{"k":2,"L":"a"},"show":"2*a*a","opts":[{"id":"A","a":"(2*a)^2","tag":"PRODSQUARE","ok":false},{"id":"B","a":"2*a^2","tag":null,"ok":true},{"id":"C","a":"4*a","tag":"SQUARE2","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l2-008:q2": {"t":"simp","rk":"cube","rp":{"L":"a"},"show":"a*a*a","opts":[{"id":"A","a":"3*a","tag":"SQUARE2","ok":false},{"id":"B","a":"a^2","tag":null,"ok":false},{"id":"C","a":"a^3","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l2-008:q3": {"t":"val","e":"2*a^2","env":{"a":5},"sigs":["PRODSQUARE","SQUARE2"]},
  "ex-2am-ibara-harfiya-intaj-l2-009:q1": {"t":"simp","rk":"zero","rp":{"a":3,"L":"a","M":"b","c":4},"show":"2*a+0*b+4+a","opts":[{"id":"A","a":"3*a+b+4","tag":"ZEROSKIP","ok":false},{"id":"B","a":"7*a","tag":null,"ok":false},{"id":"C","a":"3*a+4","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l2-009:q2": {"t":"simp","rk":"cc","rp":{"L":"c"},"show":"c+c*c+c","opts":[{"id":"A","a":"2*c+c^2","tag":null,"ok":true},{"id":"B","a":"3*c^2","tag":"ADDPOWERS","ok":false},{"id":"C","a":"3*c","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l2-009:q3": {"t":"val","e":"3*a+4","env":{"a":5},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l2-010:q1": {"t":"simp","rk":"like","rp":{"a":38,"b":62,"L":"x"},"show":"38*x+62*x","opts":[{"id":"A","a":"100*x","tag":null,"ok":true},{"id":"B","a":"100*x^2","tag":"ADDPOWERS","ok":false},{"id":"C","a":"2356*x","tag":"MULTCOEF","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l2-010:q2": {"t":"val","e":"38*x+62*x","env":{"x":2.5},"sigs":["JUXTA"]},
  "ex-2am-ibara-harfiya-intaj-l2-010:q3": {"t":"val","e":"38*x+62*x","env":{"x":7}},
  "ex-2am-ibara-harfiya-intaj-l3-001:q1": {"t":"ex","rk":"geo","rp":{"sides":["x+4","x+3","x+3","x+4","10"],"shared":"10","forgot":"10","L":"x"},"opts":[{"id":"A","a":"4*x+34","tag":"PERCELL","ok":false},{"id":"B","a":"4*x+24","tag":null,"ok":true},{"id":"C","a":"4*x+14","tag":"NOFIRST","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l3-001:q2": {"t":"val","e":"4*x+24","env":{"x":8},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-001:q3": {"t":"ex","rk":"like","rp":{"a":10,"b":5,"L":"x","c":40},"opts":[{"id":"A","a":"15*x+40","tag":null,"ok":true},{"id":"B","a":"15*x^2+40","tag":"ADDPOWERS","ok":false},{"id":"C","a":"50*x+40","tag":"MULTCOEF","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l3-001:q4": {"t":"val","e":"15*x+40","env":{"x":8},"from":"q3"},
  "ex-2am-ibara-harfiya-intaj-l3-002:q1": {"t":"ex","rk":"mul","rp":{"k":4,"L":"x"},"der":[4],"opts":[{"id":"A","a":"x+4","tag":"ADDFOR","ok":false},{"id":"B","a":"x^4","tag":"POWER","ok":false},{"id":"C","a":"4*x","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l3-002:q2": {"t":"ex","rk":"like","rp":{"a":12,"b":4,"L":"x","c":16},"opts":[{"id":"A","a":"16*x+16","tag":null,"ok":true},{"id":"B","a":"16*x^2+16","tag":"ADDPOWERS","ok":false},{"id":"C","a":"48*x+16","tag":"MULTCOEF","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l3-002:q3": {"t":"val","e":"16*x+16","env":{"x":10},"from":"q2"},
  "ex-2am-ibara-harfiya-intaj-l3-003:q1": {"t":"ex","rk":"lin","rp":{"k":6,"c":2,"L":"n"},"opts":[{"id":"A","a":"6*n+2","tag":null,"ok":true},{"id":"B","a":"8*n","tag":"PERCELL","ok":false},{"id":"C","a":"6*n","tag":"NOFIRST","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l3-003:q2": {"t":"val","e":"6*n+2","env":{"n":12},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-003:q3": {"t":"val","e":"6*n+2","env":{"n":40},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-004:q1": {"t":"ex","rk":"lin","rp":{"k":8,"c":3,"L":"n"},"opts":[{"id":"A","a":"11*n","tag":"PERCELL","ok":false},{"id":"B","a":"8*n+3","tag":null,"ok":true},{"id":"C","a":"8*n","tag":"NOFIRST","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l3-004:q2": {"t":"val","e":"8*n+3","env":{"n":9},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-004:q3": {"t":"val","e":"8*n+3","env":{"n":30},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-005:q1": {"t":"ex","rk":"lin","rp":{"k":3,"c":1,"L":"n"},"opts":[{"id":"A","a":"4*n","tag":"PERCELL","ok":false},{"id":"B","a":"3*n","tag":"NOFIRST","ok":false},{"id":"C","a":"3*n+1","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l3-005:q2": {"t":"val","e":"3*n+1","env":{"n":20},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-005:q3": {"t":"val","e":"3*n+1","env":{"n":100},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-006:q1": {"t":"ex","rk":"geo","rp":{"sides":["x+6","4","x+6","4"],"forgot":"4","L":"x"},"opts":[{"id":"A","a":"2*x+20","tag":null,"ok":true},{"id":"B","a":"2*x+16","tag":"NOFIRST","ok":false},{"id":"C","a":"x+14","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l3-006:q2": {"t":"val","e":"2*x+20","env":{"x":9},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-006:q3": {"t":"val","e":"2*x+20","env":{"x":14},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-007:q1": {"t":"ex","rk":"sq","rp":{"k":1,"L":"x"},"opts":[{"id":"A","a":"2*x","tag":"SQUARE2","ok":false},{"id":"B","a":"x^2","tag":null,"ok":true},{"id":"C","a":"4*x","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l3-007:q2": {"t":"ex","rk":"mul","rp":{"k":4,"L":"x"},"opts":[{"id":"A","a":"x^4","tag":"POWER","ok":false},{"id":"B","a":"x+4","tag":"ADDFOR","ok":false},{"id":"C","a":"4*x","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l3-007:q3": {"t":"val","e":"x^2","env":{"x":11},"sigs":["SQUARE2"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-007:q4": {"t":"val","e":"4*x","env":{"x":11},"sigs":["JUXTA"],"from":"q2"},
  "ex-2am-ibara-harfiya-intaj-l3-008:q1": {"t":"ex","rk":"mul","rp":{"k":9,"L":"x"},"opts":[{"id":"A","a":"x+9","tag":"ADDFOR","ok":false},{"id":"B","a":"x^9","tag":"POWER","ok":false},{"id":"C","a":"9*x","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l3-008:q2": {"t":"val","e":"9*x","env":{"x":14},"sigs":["JUXTA","ADDFOR"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-008:q3": {"t":"val","e":"9*x","env":{"x":5.5},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-009:q1": {"t":"ex","rk":"lin","rp":{"k":2,"c":1,"L":"n"},"opts":[{"id":"A","a":"2*n+1","tag":null,"ok":true},{"id":"B","a":"3*n","tag":"PERCELL","ok":false},{"id":"C","a":"2*n","tag":"NOFIRST","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l3-009:q2": {"t":"val","e":"2*n+1","env":{"n":10},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-009:q3": {"t":"val","e":"2*n+1","env":{"n":120},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-010:q1": {"t":"ex","rk":"geo","rp":{"sides":["x","x","7"],"forgot":"x","L":"x"},"opts":[{"id":"A","a":"x+7","tag":"NOFIRST","ok":false},{"id":"B","a":"2*x+7","tag":null,"ok":true},{"id":"C","a":"3*x+7","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l3-010:q2": {"t":"val","e":"2*x+7","env":{"x":9},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l3-010:q3": {"t":"val","e":"2*x+7","env":{"x":12.5},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-001:q1": {"t":"ex","rk":"geo","rp":{"sides":["6","6","b+2","2*b+3"],"shared":"6","forgot":"6","L":"b"},"opts":[{"id":"A","a":"3*b+23","tag":"PERCELL","ok":false},{"id":"B","a":"3*b+11","tag":"NOFIRST","ok":false},{"id":"C","a":"3*b+17","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l4-001:q2": {"t":"val","e":"3*b+17","env":{"b":4},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-001:q3": {"t":"val","e":"3*b+17","env":{"b":10},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-002:q1": {"t":"ex","rk":"prog","rp":{"steps":[["*",4],["+",6],["/",2]],"L":"n"},"opts":[{"id":"A","a":"frac(4*n+6,2)","tag":null,"ok":true},{"id":"B","a":"4*n+6/2","tag":"BRACKET","ok":false},{"id":"C","a":"4*(n+6)/2","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l4-002:q2": {"t":"val","e":"frac(4*n+6,2)","env":{"n":7},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-002:q3": {"t":"same","a":"frac(4*n+6,2)","b":"2*n+3","env":{"n":7},"order":["yes","no"]},
  "ex-2am-ibara-harfiya-intaj-l4-002:q4": {"t":"same","a":"frac(4*n+6,2)","b":"4*n+3","env":{"n":7},"order":["no","yes"],"tagNo":"BRACKET"},
  "ex-2am-ibara-harfiya-intaj-l4-003:q1": {"t":"ex","rk":"prog","rp":{"steps":[["*",2],["+",3],["*",5]],"L":"n"},"opts":[{"id":"A","a":"5*2*n+3","tag":"BRACKET","ok":false},{"id":"B","a":"5*(2*n+3)","tag":null,"ok":true},{"id":"C","a":"2*n+15","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l4-003:q2": {"t":"val","e":"5*(2*n+3)","env":{"n":4},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-003:q3": {"t":"val","e":"5*(2*n+3)","env":{"n":10},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-003:q4": {"t":"same","a":"5*(2*n+3)","b":"10*n+15","env":{"n":4},"order":["yes","no"]},
  "ex-2am-ibara-harfiya-intaj-l4-004:q1": {"t":"ex","rk":"sqc","rp":{"L":"n","c":4},"opts":[{"id":"A","a":"2*n+4","tag":"SQUARE2","ok":false},{"id":"B","a":"(n+4)^2","tag":null,"ok":false},{"id":"C","a":"n^2+4","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l4-004:q2": {"t":"val","e":"n^2+4","env":{"n":6},"sigs":["SQUARE2"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-004:q3": {"t":"val","e":"n^2+4","env":{"n":9},"sigs":["SQUARE2"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-005:q1": {"t":"val","e":"2*(n+1)","env":{"n":8}},
  "ex-2am-ibara-harfiya-intaj-l4-005:q2": {"t":"same","a":"2*(n+1)","b":"2*n+2","env":{"n":5},"order":["yes","no"]},
  "ex-2am-ibara-harfiya-intaj-l4-005:q3": {"t":"same","a":"2*(n+1)","b":"2*n+1","env":{"n":5},"order":["no","yes"],"tagNo":"BRACKET"},
  "ex-2am-ibara-harfiya-intaj-l4-005:q4": {"t":"same","a":"2*(n+1)","b":"n+2","env":{"n":3},"order":["yes","no"]},
  "ex-2am-ibara-harfiya-intaj-l4-006:q1": {"t":"ex","rk":"prog","rp":{"steps":[["*",5],["+",3],["*",2]],"L":"n"},"opts":[{"id":"A","a":"2*5*n+3","tag":"BRACKET","ok":false},{"id":"B","a":"2*(5*n+3)","tag":null,"ok":true},{"id":"C","a":"5*n+6","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l4-006:q2": {"t":"val","e":"2*(5*n+3)","env":{"n":3},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-006:q3": {"t":"val","e":"2*(5*n+3)","env":{"n":7},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-006:q4": {"t":"same","a":"2*(5*n+3)","b":"10*n+6","env":{"n":3},"order":["no","yes"]},
  "ex-2am-ibara-harfiya-intaj-l4-007:q1": {"t":"ex","rk":"prog","rp":{"steps":[["*",4],["+",8],["/",4]],"L":"n"},"opts":[{"id":"A","a":"4*n+8/4","tag":"BRACKET","ok":false},{"id":"B","a":"n+8","tag":null,"ok":false},{"id":"C","a":"frac(4*n+8,4)","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l4-007:q2": {"t":"val","e":"frac(4*n+8,4)","env":{"n":3},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-007:q3": {"t":"val","e":"frac(4*n+8,4)","env":{"n":10},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-007:q4": {"t":"same","a":"frac(4*n+8,4)","b":"n+2","env":{"n":10},"order":["yes","no"]},
  "ex-2am-ibara-harfiya-intaj-l4-008:q1": {"t":"ex","rk":"lin2","rp":{"k1":3,"a":"a","k2":2,"b":"b","L":"a"},"opts":[{"id":"A","a":"3*a+2*b","tag":null,"ok":true},{"id":"B","a":"3+a+2+b","tag":"ADDFOR","ok":false},{"id":"C","a":"5*a*b","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l4-008:q2": {"t":"val","e":"3*a+2*b","env":{"a":5,"b":4},"sigs":["JUXTA","ADDFOR"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-008:q3": {"t":"val","e":"3*a+2*b","env":{"a":10,"b":0},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-009:q1": {"t":"ex","rk":"sqlin","rp":{"L":"x","k":3},"opts":[{"id":"A","a":"4*x^2","tag":"ADDPOWERS","ok":false},{"id":"B","a":"x^2+3*x","tag":null,"ok":true},{"id":"C","a":"2*x+3*x","tag":"SQUARE2","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l4-009:q2": {"t":"val","e":"x^2+3*x","env":{"x":4},"sigs":["SQUARE2","JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-009:q3": {"t":"val","e":"x^2+3*x","env":{"x":10},"sigs":["SQUARE2"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-010:q1": {"t":"ex","rk":"prog","rp":{"steps":[["+",3],["/",2]],"L":"n"},"opts":[{"id":"A","a":"n+3/2","tag":"BRACKET","ok":false},{"id":"B","a":"n+6","tag":null,"ok":false},{"id":"C","a":"frac(n+3,2)","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l4-010:q2": {"t":"val","e":"frac(n+3,2)","env":{"n":5},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-010:q3": {"t":"val","e":"frac(n+3,2)","env":{"n":9},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l4-010:q4": {"t":"val","e":"frac(n+3,2)","env":{"n":1},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-001:q1": {"t":"val","e":"frac(24*10,2)","env":{},"story":true},
  "ex-2am-ibara-harfiya-intaj-l5-001:q2": {"t":"ex","rk":"lin","rp":{"k":80,"c":120,"L":"x"},"der":[120],"opts":[{"id":"A","a":"200*x","tag":"PERCELL","ok":false},{"id":"B","a":"80*x+120","tag":null,"ok":true},{"id":"C","a":"80*x","tag":"NOFIRST","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l5-001:q3": {"t":"val","e":"80*x+120","env":{"x":25},"sigs":["JUXTA"],"from":"q2"},
  "ex-2am-ibara-harfiya-intaj-l5-001:q4": {"t":"cmp","a":"80*x+120","b":"2200","env":{"x":25},"op":"<","order":["yes","no"],"from":"q2"},
  "ex-2am-ibara-harfiya-intaj-l5-002:q1": {"t":"val","e":"frac(20*15,2)","env":{},"story":true},
  "ex-2am-ibara-harfiya-intaj-l5-002:q2": {"t":"ex","rk":"like","rp":{"a":40,"b":30,"L":"x","c":150},"der":[150],"opts":[{"id":"A","a":"70*x^2+150","tag":"ADDPOWERS","ok":false},{"id":"B","a":"1200*x+150","tag":"MULTCOEF","ok":false},{"id":"C","a":"70*x+150","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l5-002:q3": {"t":"val","e":"70*x+150","env":{"x":30},"sigs":["JUXTA"],"from":"q2"},
  "ex-2am-ibara-harfiya-intaj-l5-002:q4": {"t":"cmp","a":"70*x+150","b":"2300","env":{"x":30},"op":">","order":["no","yes"],"from":"q2"},
  "ex-2am-ibara-harfiya-intaj-l5-003:q1": {"t":"ex","rk":"geo","rp":{"sides":["x","30","2*x","30","x","x","x"],"shared":"x","forgot":"30","L":"x"},"opts":[{"id":"A","a":"7*x+60","tag":"PERCELL","ok":false},{"id":"B","a":"6*x+30","tag":"NOFIRST","ok":false},{"id":"C","a":"6*x+60","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l5-003:q2": {"t":"val","e":"6*x+60","env":{"x":12},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-003:q3": {"t":"ex","rk":"sqlin","rp":{"L":"x","k":60},"opts":[{"id":"A","a":"61*x^2","tag":"ADDPOWERS","ok":false},{"id":"B","a":"x^2+60*x","tag":null,"ok":true},{"id":"C","a":"2*x+60*x","tag":"SQUARE2","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l5-003:q4": {"t":"val","e":"x^2+60*x","env":{"x":12},"sigs":["SQUARE2"],"from":"q3"},
  "ex-2am-ibara-harfiya-intaj-l5-004:q1": {"t":"ex","rk":"like","rp":{"a":6,"b":4,"L":"x","c":12},"opts":[{"id":"A","a":"10*x+12","tag":null,"ok":true},{"id":"B","a":"10*x^2+12","tag":"ADDPOWERS","ok":false},{"id":"C","a":"24*x+12","tag":"MULTCOEF","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l5-004:q2": {"t":"val","e":"10*x+12","env":{"x":5},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-004:q3": {"t":"val","e":"800*(10*x+12)","env":{"x":5},"from":"q1","mult":800},
  "ex-2am-ibara-harfiya-intaj-l5-004:q4": {"t":"cmp","a":"800*(10*x+12)","b":"50000","env":{"x":5},"op":"<=","order":["no","yes"],"from":"q1","mult":800},
  "ex-2am-ibara-harfiya-intaj-l5-005:q1": {"t":"ex","rk":"geo","rp":{"sides":["x+8","12","x+8","12"],"forgot":"12","L":"x"},"opts":[{"id":"A","a":"2*x+28","tag":"NOFIRST","ok":false},{"id":"B","a":"2*x+40","tag":null,"ok":true},{"id":"C","a":"x+20","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l5-005:q2": {"t":"val","e":"2*x+40","env":{"x":15},"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-005:q3": {"t":"val","e":"150*(2*x+40)","env":{"x":15},"sigs":["JUXTA"],"from":"q1","mult":150},
  "ex-2am-ibara-harfiya-intaj-l5-005:q4": {"t":"cmp","a":"150*(2*x+40)","b":"10000","env":{"x":15},"op":"<=","order":["yes","no"],"from":"q1","mult":150},
  "ex-2am-ibara-harfiya-intaj-l5-006:q1": {"t":"ex","rk":"lin","rp":{"k":8,"c":48,"L":"x"},"opts":[{"id":"A","a":"56*x","tag":"PERCELL","ok":false},{"id":"B","a":"8*x","tag":"NOFIRST","ok":false},{"id":"C","a":"8*x+48","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l5-006:q2": {"t":"val","e":"8*x+48","env":{"x":9},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-006:q3": {"t":"val","e":"8*x+48","env":{"x":14},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-006:q4": {"t":"cmp","a":"8*x+48","b":"100","env":{"x":9},"op":">=","order":["no","yes"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-007:q1": {"t":"ex","rk":"lin","rp":{"k":40,"c":150,"L":"x"},"opts":[{"id":"A","a":"40*x+150","tag":null,"ok":true},{"id":"B","a":"190*x","tag":"PERCELL","ok":false},{"id":"C","a":"40*x","tag":"NOFIRST","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l5-007:q2": {"t":"ex","rk":"lin","rp":{"k":50,"c":60,"L":"x"},"opts":[{"id":"A","a":"110*x","tag":"PERCELL","ok":false},{"id":"B","a":"50*x+60","tag":null,"ok":true},{"id":"C","a":"50*x","tag":"NOFIRST","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l5-007:q3": {"t":"val","e":"40*x+150","env":{"x":5},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-007:q4": {"t":"val","e":"50*x+60","env":{"x":5},"sigs":["JUXTA"],"from":"q2"},
  "ex-2am-ibara-harfiya-intaj-l5-007:q5": {"t":"cmp","a":"40*x+150","b":"50*x+60","env":{"x":5},"op":"<","order":["no","yes"]},
  "ex-2am-ibara-harfiya-intaj-l5-008:q1": {"t":"ex","rk":"lin","rp":{"k":5,"c":1,"L":"n"},"opts":[{"id":"A","a":"6*n","tag":"PERCELL","ok":false},{"id":"B","a":"5*n+1","tag":null,"ok":true},{"id":"C","a":"5*n","tag":"NOFIRST","ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l5-008:q2": {"t":"val","e":"5*n+1","env":{"n":18},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-008:q3": {"t":"val","e":"5*n+1","env":{"n":36},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-008:q4": {"t":"cmp","a":"5*n+1","b":"180","env":{"n":36},"op":"<=","order":["no","yes"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-009:q1": {"t":"ex","rk":"lin","rp":{"k":12,"c":5,"L":"x"},"opts":[{"id":"A","a":"17*x","tag":"PERCELL","ok":false},{"id":"B","a":"12*x","tag":"NOFIRST","ok":false},{"id":"C","a":"12*x+5","tag":null,"ok":true}]},
  "ex-2am-ibara-harfiya-intaj-l5-009:q2": {"t":"val","e":"12*x+5","env":{"x":8},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-009:q3": {"t":"val","e":"10*(12*x+5)","env":{"x":8},"from":"q1","mult":10},
  "ex-2am-ibara-harfiya-intaj-l5-009:q4": {"t":"cmp","a":"10*(12*x+5)","b":"1000","env":{"x":8},"op":"<","order":["yes","no"],"from":"q1","mult":10},
  "ex-2am-ibara-harfiya-intaj-l5-010:q1": {"t":"ex","rk":"lin2","rp":{"k1":45,"a":"a","k2":30,"b":"b","L":"a"},"opts":[{"id":"A","a":"45*a+30*b","tag":null,"ok":true},{"id":"B","a":"45+a+30+b","tag":"ADDFOR","ok":false},{"id":"C","a":"75*a*b","tag":null,"ok":false}]},
  "ex-2am-ibara-harfiya-intaj-l5-010:q2": {"t":"val","e":"45*a+30*b","env":{"a":8,"b":10},"sigs":["JUXTA","ADDFOR"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-010:q3": {"t":"cmp","a":"45*a+30*b","b":"700","env":{"a":8,"b":10},"op":"<=","order":["yes","no"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-010:q4": {"t":"val","e":"45*a+30*b","env":{"a":10,"b":12},"sigs":["JUXTA"],"from":"q1"},
  "ex-2am-ibara-harfiya-intaj-l5-010:q5": {"t":"cmp","a":"45*a+30*b","b":"700","env":{"a":10,"b":12},"op":"<=","order":["yes","no"],"from":"q1"},
};
const PROV = {
  "ex-2am-ibara-harfiya-intaj-l1-001": {"t":"ad","el":"ex-1"},
  "ex-2am-ibara-harfiya-intaj-l1-002": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l1-003": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l1-004": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l1-005": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l1-006": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l1-007": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l1-008": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l1-009": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l1-010": {"t":"ad","el":"self-3"},
  "ex-2am-ibara-harfiya-intaj-l2-001": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l2-002": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l2-003": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l2-004": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l2-005": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l2-006": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l2-007": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l2-008": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l2-009": {"t":"ad","el":"ex-21"},
  "ex-2am-ibara-harfiya-intaj-l2-010": {"t":"ad","el":"self-7"},
  "ex-2am-ibara-harfiya-intaj-l3-001": {"t":"tt","file":"2am-s3-39","ex":4,"part":"situation","sem":3},
  "ex-2am-ibara-harfiya-intaj-l3-002": {"t":"tt","file":"2am-s2-69","ex":4,"part":"situation","sem":2},
  "ex-2am-ibara-harfiya-intaj-l3-003": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l3-004": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l3-005": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l3-006": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l3-007": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l3-008": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l3-009": {"t":"ad","el":"deep-47"},
  "ex-2am-ibara-harfiya-intaj-l3-010": {"t":"ad","el":"ex-9"},
  "ex-2am-ibara-harfiya-intaj-l4-001": {"t":"tt","file":"2am-s2-72","ex":5,"part":"part2","sem":2},
  "ex-2am-ibara-harfiya-intaj-l4-002": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l4-003": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l4-004": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l4-005": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l4-006": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l4-007": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l4-008": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l4-009": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l4-010": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l5-001": {"t":"tt","file":"2am-s2-50","ex":5,"part":"part3","sem":2},
  "ex-2am-ibara-harfiya-intaj-l5-002": {"t":"tt","file":"2am-s2-73","ex":5,"part":"part2","sem":2},
  "ex-2am-ibara-harfiya-intaj-l5-003": {"t":"tt","file":"2am-s3-37","ex":5,"part":"part1","sem":3},
  "ex-2am-ibara-harfiya-intaj-l5-004": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l5-005": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l5-006": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l5-007": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l5-008": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l5-009": {"t":"mod","sem":2},
  "ex-2am-ibara-harfiya-intaj-l5-010": {"t":"mod","sem":2},
};
const READ = { '2am-s2-50': [5], '2am-s2-73': [5], '2am-s2-72': [5], '2am-s2-69': [4], '2am-s3-39': [4], '2am-s3-37': [5] };
const EXPECTED = { 1: [0, 8, 2], 2: [0, 8, 2], 3: [2, 6, 2], 4: [1, 9, 0], 5: [3, 7, 0] };
const ADAPTED = new Set(['ex-1', 'self-3', 'ex-21', 'self-7', 'deep-47', 'ex-9']);
const MISC = (t) => `MISC-IBARA2-${t}`;
const LP = (n) => `2am_ibara-harfiya-intaj_P${n}`;
const BADGE = { 2: 'على منوال اختبار الفصل الثاني', 3: 'على منوال اختبار الفصل الثالث' };

/** La vérité (polynôme) d'une spec ex / simp, et ses lectures nommées. */
function recipeOf(S) { const r = RECIPES[S.rk]; if (!r) throw new Error(`recette inconnue ${S.rk}`); return r(S.rp); }

/** Jugement d'une question : { answer, problems } — answer = R(valeur) ou C(id). */
function judge(S, ctx) {
  const problems = []; let answer = null; let info = {};
  if (S.t === 'val') {
    const key = val(S.e, S.env); const key2 = polyOf(parse(S.e));
    answer = R(D(key)); info.key = key;
    // contrôle croisé : la valeur du polynôme en l'environnement égale la clé
    let acc = ZERO; const env = envQ(S.env);
    for (const [mk, c] of key2.m) { let t = c; for (const tk of mk ? mk.split('*') : []) { const [l, e] = tk.split('^'); for (let j = 0; j < Number(e); j++) t = t.mul(env[l]); } acc = acc.add(t); }
    if (!acc.eq(key)) problems.push('valeur par évaluation directe ≠ valeur par polynôme');
    info.sigs = (S.sigs ?? []).map((tag) => [D(val(S.e, S.env, tag)), MISC(tag)]);
    if (S.from) {
      const src = ctx.truthOf(S.from); const want = scale(S.mult ?? 1, src);
      if (!key2.eq(want)) problems.push(`l'expression ${S.e} n'est pas la vérité de ${S.from}${S.mult ? ` × ${S.mult}` : ''}`);
    }
  } else if (S.t === 'ex' || S.t === 'simp') {
    const rec = recipeOf(S); const truth = rec.OK; info.rec = rec;
    const opts = S.opts.map((o) => ({ ...o, poly: P(o.a) }));
    info.opts = opts.map((o) => {
      const isOK = o.poly.eq(truth); const pbl = [];
      if (o.tag) { if (!rec[o.tag]) pbl.push(`recette ${o.tag} inexistante pour ${S.rk}`); else if (!o.poly.eq(rec[o.tag])) pbl.push(`option ${o.id} « ${o.a} » ≠ lecture ${o.tag}`); if (isOK) pbl.push(`option ${o.id} balisée ${o.tag} mais VRAIE`); }
      else if (!isOK) for (const [t, p] of Object.entries(rec)) if (t !== 'OK' && p.eq(o.poly)) pbl.push(`option ${o.id} sans balise reproduit la lecture ${t}`);
      return { ...o, isOK, pbl };
    });
    for (const o of info.opts) problems.push(...o.pbl);
    const ok = info.opts.filter((o) => o.isOK);
    if (ok.length !== 1) problems.push(`${ok.length} options vraies`);
    else answer = C(ok[0].id);
    if (S.t === 'simp' && !truth.eq(P(S.show))) problems.push(`l'expression « ${S.show} » n'égale pas la forme simplifiée`);
    if (S.t === 'ex' && S.rk === 'word') { /* la phrase est vérifiée sur l'énoncé */ }
  } else if (S.t === 'same') {
    const a = val(S.a, S.env); const b = val(S.b, S.env); const yes = a.eq(b);
    answer = C(S.order.map((w, i) => [w, 'AB'[i]]).find(([w]) => (w === 'yes') === yes)[1]);
    info.yes = yes;
    if (S.tagNo && !yes && !flatRead(S.a).eq(P(S.b))) problems.push(`la lecture ${S.tagNo} de « ${S.a} » n'est pas « ${S.b} »`);
    if (S.tagNo && yes) problems.push('tagNo sur une égalité vraie');
  } else if (S.t === 'cmp') {
    const a = val(S.a, S.env); const b = val(S.b, S.env);
    const yes = { '<': a.n * b.d < b.n * a.d, '<=': a.n * b.d <= b.n * a.d, '>': a.n * b.d > b.n * a.d, '>=': a.n * b.d >= b.n * a.d }[S.op];
    answer = C(S.order.map((w, i) => [w, 'AB'[i]]).find(([w]) => (w === 'yes') === yes)[1]); info.yes = yes;
    const pa = P(S.a);
    if (S.from) { if (!pa.eq(scale(S.mult ?? 1, ctx.truthOf(S.from)))) problems.push(`« ${S.a} » n'est pas la vérité de ${S.from}${S.mult ? ` × ${S.mult}` : ''}`); }
    else if (pa.constant() === null && !ctx.anyTruth(pa)) problems.push(`« ${S.a} » ne correspond à aucune expression produite plus haut`);
    const pb = P(S.b); if (pb.constant() === null && !ctx.anyTruth(pb)) problems.push(`« ${S.b} » ne correspond à aucune expression produite plus haut`);
  } else if (S.t !== 'self') problems.push(`type ${S.t}`);
  return { answer, problems, info };
}

/* ── ORACLE : la clé de chaque question, calculée ici ── */
const sheetOf = (key) => key.split(':')[0];
const truthPoly = (specs, id, qid) => { const S = specs[`${id}:${qid}`]; if (!S || (S.t !== 'ex' && S.t !== 'simp')) throw new Error(`${id}:${qid} n'est pas une question de production`); return recipeOf(S).OK; };
const ctxFor = (specs, id) => ({
  truthOf: (qid) => truthPoly(specs, id, qid),
  anyTruth: (poly) => Object.entries(specs).some(([k, S]) => k.startsWith(`${id}:`) && (S.t === 'ex' || S.t === 'simp') && recipeOf(S).OK.eq(poly)),
});
export const ORACLE = {};
for (const [key, S] of Object.entries(SPEC)) {
  if (S.t === 'self') continue;
  const { answer } = judge(S, ctxFor(SPEC, sheetOf(key)));
  if (answer) ORACLE[key] = answer;
}

/* ── audit ── */
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const AR = '\\u0621-\\u064A';
const FORBIDDEN = new RegExp(`(?<![${AR}])(?:خنزير|خمر|نبيذ|بيرة|كحول|قمار|ميسر|يانصيب|ورق اللعب|أوراق اللعب|نرد|كازينو|ربا|فوائد|رأس السنة|عيد الميلاد|الكتاب|الكتاب المدرسي)(?![${AR}])|🐷|ص\\s*\\d+\\s*من`);
const VOCAB = new Set(['n', 'x', 'y', 'a', 'b', 'c']);
export function audit(bank) {
  const problems = []; const P_ = (key, msg) => problems.push(`${key} : ${msg}`);
  const dir = join(root, 'content/practice/2am/ibara-harfiya-intaj');
  const sheets = {};
  for (const lv of readdirSync(dir)) for (const f of readdirSync(join(dir, lv))) { const ex = JSON.parse(readFileSync(join(dir, lv, f), 'utf8')); sheets[ex.id] = ex; }
  const miscs = JSON.parse(readFileSync(join(root, 'content/practice/misconceptions.json'), 'utf8'));
  const extraction = JSON.parse(readFileSync(join(root, 'docs/sources/2am/unit4/extraction.json'), 'utf8'));
  const sheetText = {};
  for (const [id, sh] of Object.entries(sheets)) {
    sheetText[id] = [sh.statement.content, JSON.stringify((sh.statement.figure?.segments ?? []).map((s) => s.label ?? '')), ...sh.questions.map((q) => q.statement), ...sh.questions.flatMap((q) => (q.choices ?? []).map((c) => c.content))].join(' ');
  }
  for (const { key, q } of bank) {
    const id = sheetOf(key); const sh = sheets[id]; const S = SPEC[key];
    if (!S) { P_(key, 'aucune spec'); continue; }
    if (!sh) { P_(key, 'feuille introuvable'); continue; }
    let j; try { j = judge(S, ctxFor(SPEC, id)); } catch (err) { P_(key, `jugement impossible : ${err.message}`); continue; }
    for (const m of j.problems) P_(key, m);
    const qtext = [sh.statement.content, q.statement].join(' ');
    const iraw = islands(qtext).map((x) => compact(texToAscii(x)));
    const isl = iraw.map((x) => stripLabel(x));
    const shown = (ascii) => isl.includes(compact(ascii)) || iraw.includes(compact(ascii));
    if (q.learningPoints?.[0]?.code !== LP(1) && q.learningPoints?.[0]?.code !== LP(2) && q.learningPoints?.[0]?.code !== LP(3)) P_(key, 'code de la كفاءة');

    /* --- la clé et les signatures --- */
    if (S.t === 'val') {
      if (q.answerType !== 'rational') P_(key, 'une valeur est `rational`');
      if (q.expectedAnswer !== D(j.info.key)) P_(key, `l'oracle trouve ${D(j.info.key)}, la feuille ${q.expectedAnswer}`);
      if (!shown(S.e)) P_(key, `l'expression « ${S.e} » n'est pas dans l'énoncé (relu : ${isl.join(' ; ')})`);
      for (const [l, v] of Object.entries(S.env)) if (!shown(`${l}=${v}`)) P_(key, `la valeur ${l} = ${v} n'est pas dans l'énoncé`);
      const have = (q.misconceptionSignatures ?? []).map((x) => `${x.value}|${x.id}`).sort(); const want = j.info.sigs.map(([v, i]) => `${v}|${i}`).sort();
      if (JSON.stringify(have) !== JSON.stringify(want)) P_(key, `signatures ${have.join(' ; ')} ≠ attendues ${want.join(' ; ')}`);
      if (new Set([...want.map((w) => w.split('|')[0]), D(j.info.key)]).size !== want.length + 1) P_(key, 'une signature égale la clé ou une autre signature');
      if (q.solution?.result !== D(j.info.key).replace('.', '{,}')) P_(key, `résultat du corrigé ${q.solution?.result}`);
    } else if (S.t === 'ex' || S.t === 'simp') {
      if (q.answerType !== 'choice') P_(key, 'un QCM est `choice`');
      if (q.choices.length !== S.opts.length) P_(key, 'nombre d\'options');
      S.opts.forEach((o, i) => {
        const c = q.choices[i]; if (!c) return;
        if (c.id !== 'ABCD'[i]) P_(key, `identifiant ${c.id}`);
        const il = islands(c.content);
        if (il.length !== 1 || texToAscii(il[0]) !== o.a) P_(key, `option ${c.id} : « ${c.content} » ≠ « ${o.a} »`);
        const ok = j.info.opts[i].isOK;
        if (c.isCorrect !== ok) P_(key, `option ${c.id} : jugée ${ok ? 'vraie' : 'fausse'}, marquée ${c.isCorrect}`);
        if ((c.misconceptionId ?? null) !== (o.tag ? MISC(o.tag) : null)) P_(key, `option ${c.id} : balise ${c.misconceptionId ?? 'aucune'} ≠ ${o.tag ? MISC(o.tag) : 'aucune'}`);
        if (ok && S.t === 'simp' && /\\times/.test(c.content)) P_(key, 'la forme simplifiée garde un signe ×');
      });
      if (S.t === 'simp' && S.show && !shown(S.show) && !isl.includes(compact(S.show))) {
        // l'expression à simplifier est dans l'énoncé (avec ou sans « E = »)
        if (!isl.some((x) => x === compact(S.show))) P_(key, `l'expression à simplifier « ${S.show} » n'est pas dans l'énoncé`);
      }
      if (S.rk === 'word') { const ar = WORDS_AR[S.rp.w].replace(/\s+/g, ' '); if (!q.statement.replace(/\s+/g, ' ').includes(ar)) P_(key, `la phrase « ${ar} » n'est pas dans l'énoncé`); }
      else {
        const txt = numbersOf(sheetText[id]); const der = new Set((S.der ?? []).map(String));
        const lits = []; const walk = (v) => { if (typeof v === 'number') lits.push(String(v)); else if (typeof v === 'string') lits.push(...(v.match(/\d+(?:\.\d+)?/g) ?? [])); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (k !== 'L' && k !== 'w') walk(x); }; walk(S.rp);
        for (const n of lits) if (!['0', '1'].includes(n) && !txt.has(n) && !der.has(n)) P_(key, `le nombre ${n} de la recette n'est pas dans la feuille`);
      }
    } else if (S.t === 'same' || S.t === 'cmp') {
      if (q.answerType !== 'choice' || q.choices.length !== 2) P_(key, 'un oui / non a deux options');
      S.order.forEach((w, i) => {
        const c = q.choices[i]; const want = w === 'yes' ? 'نعم' : 'لا';
        if (c?.content !== want) P_(key, `option ${i + 1} : « ${c?.content} » ≠ « ${want} »`);
        if (c && c.isCorrect !== ((w === 'yes') === j.info.yes)) P_(key, `option ${c.id} : marquée ${c.isCorrect}`);
        const tagged = S.t === 'same' && S.tagNo && w === 'yes' && !j.info.yes;
        if ((c?.misconceptionId ?? null) !== (tagged ? MISC(S.tagNo) : null)) P_(key, `option ${c?.id} : balise ${c?.misconceptionId ?? 'aucune'}`);
      });
      if (S.t === 'same') { if (!shown(S.a) || !shown(S.b)) P_(key, 'les deux écritures ne sont pas dans l\'énoncé'); for (const [l, v] of Object.entries(S.env)) if (!shown(`${l}=${v}`)) P_(key, `la valeur ${l} = ${v} n'est pas dans l'énoncé`); }
      else { for (const [l, v] of Object.entries(S.env)) if (!shown(`${l}=${v}`) && !numbersOf(sheetText[id]).has(String(v))) P_(key, `la valeur ${l} = ${v} n'est pas dans la feuille`); if (P(S.b).constant() !== null && !numbersOf(sheetText[id]).has(S.b)) P_(key, `le seuil ${S.b} n'est pas dans la feuille`); }
    } else if (q.answerType !== 'selfCheck') P_(key, `type ${q.answerType}`);

    /* --- lecture de tout le texte de la question --- */
    const texts = [['énoncé', q.statement], ['format', q.answerFormat], ...(q.hints ?? []).map((h, i) => [`indice ${i + 1}`, h.content]), ['juste', q.feedback?.correct], ['faux', q.feedback?.incorrect], ...(q.solution?.lines ?? []).map((l, i) => [`corrigé ${i + 1}`, l]), ...(q.solution?.result ? [['résultat', `$${q.solution.result}$`]] : [])];
    for (const [w, t] of texts) {
      if (FORBIDDEN.test(String(t))) P_(key, `${w} : texte interdit`);
      if (/\d\s*DA|\d+\s*(?:m|cm|km)\b/.test(String(t ?? '').replace(/\$[^$]*\$/g, ''))) P_(key, `${w} : nombre avec unité hors $…$`);
      for (const raw of islands(t)) {
        let asc; try { asc = texToAscii(raw); } catch { P_(key, `${w} : LaTeX illisible « ${raw} »`); continue; }
        if (/\\/.test(asc)) { P_(key, `${w} : LaTeX hors lecteur « ${raw} »`); continue; }
        if (asc === '' || /^[A-Z]+$/.test(asc)) continue;
        const letters = (asc.replace(/frac/g, '').match(/[a-z]/g) ?? []).filter((l) => !VOCAB.has(l)); if (letters.length) P_(key, `${w} : lettre hors du vocabulaire « ${raw} »`);
        const a2 = stripLabel(asc); const parts = a2.split('=');
        if (parts.length === 2 && /^[a-z]$/.test(parts[0]) && /^\d+(\.\d+)?$/.test(parts[1])) continue; // « x = 5 »
        let polys; try { polys = parts.map((p) => P(p)); } catch (err) { P_(key, `${w} : « ${raw} » ${err.message}`); continue; }
        if (parts.length > 1 && !polys.every((p) => p.eq(polys[0]))) P_(key, `${w} : égalité fausse dans « ${raw} »`);
        for (const p of parts) { if (/[a-z]/.test(p.replace(/frac/g, ''))) continue; try { evalTree(parse(p), {}); } catch (err) { P_(key, `${w} : « ${raw} » ${err.message}`); } }
      }
    }
    for (const x of q.misconceptionSignatures ?? []) if (!(x.id in miscs)) P_(key, `${x.id} absent de misconceptions.json`);
    for (const c of q.choices ?? []) if (c.misconceptionId && !(c.misconceptionId in miscs)) P_(key, `${c.misconceptionId} absent de misconceptions.json`);
    if (S.t === 'val' && S.story !== true && q.counted === false) { /* étape hors leçon déclarée : permis */ }
  }

  /* --- niveau fichier : 50 feuilles, provenance --- */
  const files = Object.values(sheets);
  if (files.length !== 50) problems.push(`la banque compte ${files.length} feuilles au lieu de 50`);
  for (let lv = 1; lv <= 5; lv++) {
    const L = files.filter((x) => x.level === lv);
    if (L.length !== 10) problems.push(`niveau ${lv} : ${L.length} feuilles au lieu de 10`);
    const got = [L.filter((x) => x.metadata.source.type === 'term_exam').length, L.filter((x) => x.metadata.source.type === 'platform_addition').length, L.filter((x) => x.metadata.source.type === 'textbook').length];
    if (JSON.stringify(got) !== JSON.stringify(EXPECTED[lv])) problems.push(`niveau ${lv} : provenance ${got.join('/')} au lieu de ${EXPECTED[lv].join('/')}`);
  }
  const seenEl = new Set(); const seenPart = new Set();
  const els = Object.fromEntries(extraction.elements.map((e) => [e.id, e]));
  for (const ex of files) {
    const s = ex.metadata.source; const spec = PROV[ex.id];
    if (!spec) { problems.push(`${ex.id} : provenance absente de la spec`); continue; }
    for (const t of [ex.metadata.title, ...(ex.metadata.tags ?? []), ex.statement.content]) if (t && FORBIDDEN.test(t)) problems.push(`${ex.id} : texte interdit dans « ${String(t).slice(0, 50)} »`);
    if (/\d\s*DA/.test(ex.statement.content.replace(/\$[^$]*\$/g, ''))) problems.push(`${ex.id} : somme d'argent hors $…$`);
    if (spec.t === 'tt') {
      const sem = Number(/-s(\d)-/.exec(spec.file)[1]);
      if (s.type !== 'term_exam' || s.grade !== '2am' || s.semester !== sem || s.file !== spec.file || s.exercise !== spec.ex) problems.push(`${ex.id} : source term_exam ≠ ${spec.file} ex ${spec.ex}`);
      if (!(READ[spec.file] ?? []).includes(spec.ex)) problems.push(`${ex.id} : sujet ${spec.file} ex ${spec.ex} non lu pour cette banque`);
      const pk = `${spec.file}:${spec.ex}:${spec.part}`; if (seenPart.has(pk)) problems.push(`${ex.id} : la partie ${pk} est déjà citée`); seenPart.add(pk);
      if (ex.metadata.exam.badge !== BADGE[sem] || ex.metadata.exam.kind !== 'modelled') problems.push(`${ex.id} : badge / kind`);
    } else if (spec.t === 'mod') {
      if (s.type !== 'platform_addition' || s.reason !== 'term_exam_modelled' || s.modelledOn !== `2am-s${spec.sem}`) problems.push(`${ex.id} : provenance modelled mal formée`);
      if (ex.metadata.exam.badge !== BADGE[spec.sem] || ex.metadata.exam.kind !== 'modelled') problems.push(`${ex.id} : badge / kind`);
    } else {
      const el = els[spec.el];
      if (s.type !== 'textbook' || s.elementId !== spec.el || !ADAPTED.has(s.elementId)) problems.push(`${ex.id} : élément ${s.elementId} ≠ ${spec.el}`);
      if (!el) problems.push(`${ex.id} : élément ${spec.el} absent de l'extraction`);
      else {
        if (extraction.destinations[spec.el]?.lesson !== 'ibara-harfiya-intaj') problems.push(`${ex.id} : ${spec.el} n'a pas cette leçon pour destination`);
        if (!el.verified) problems.push(`${ex.id} : ${spec.el} non vérifié`);
        if (s.page !== el.page || s.number !== el.number || s.section !== el.section) problems.push(`${ex.id} : page / numéro / section de ${spec.el} ≠ extraction`);
      }
      if (seenEl.has(s.elementId)) problems.push(`${ex.id} : élément ${s.elementId} cité deux fois`); seenEl.add(s.elementId);
      if (ex.metadata.exam.kind !== 'adapted' || ex.metadata.exam.badge !== null) problems.push(`${ex.id} : adapted sans badge`);
    }
  }
  if (seenEl.size !== ADAPTED.size) problems.push(`éléments adaptés cités : ${[...seenEl].join(',')}`);
  return problems;
}
