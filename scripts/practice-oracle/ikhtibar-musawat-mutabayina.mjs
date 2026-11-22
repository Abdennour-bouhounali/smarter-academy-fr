// Oracle du banc « ikhtibar-musawat-mutabayina » (اختبار صحة مساواة أو متباينة, 2AM unité 4, leçon 3, 2026-10-29) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الثاني / الثالث »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Tout est RECALCULÉ ICI, avec des outils écrits dans ce fichier (aucun import de packages/core) :
//  - rationnels EXACTS en BigInt (classe Q, valeurs signées), un parseur ASCII (nombres décimaux, UNE lettre minuscule parmi x y n,
//    + - * / ^ ( ), moins unaire entre parenthèses, produit implicite quand le texte vient du LaTeX) ;
//  - SPEC (ci-dessous) ne contient QUE des relations / expressions ASCII, des valeurs données et des recettes : jamais une réponse.
//    Pour chaque question l'oracle recalcule la clé :
//      · « هل … صحيحة ؟ » : les deux membres sont évalués avec les valeurs données et comparés par l'opérateur de la relation ;
//      · « احسب قيمة » : évaluation exacte ; chaque signature = la recette de son erreur nommée, refaite ici et ≠ de la clé
//        (JUXTA : « 5x » pour x = 3 lu « 53 » ; SIGNSUB : x² pour x < 0 lu −(|x|²) ; SWAP : les valeurs de deux lettres échangées) ;
//      · « une seule valeur / un seul couple » et « quelles valeurs » : chaque candidat est testé, un seul choix vrai ; chaque
//        distracteur balisé est refait depuis son erreur (ONESIDE : le membre de droite lu comme son terme constant ; BOUNDARY : < lu ≤ ;
//        STRICT : ≤ lu < ; SWAP : couple inversé) et FAUX, chaque distracteur non balisé est un autre ensemble que la clé ;
//      · deux expressions : égales pour TOUTE valeur (identité polynomiale vérifiée sur 12 points, degré ≤ 2) ou non ; chaque
//        contre-exemple proposé ré-évalué (une seule valeur sépare les deux expressions, au moins une les confond) ;
//        l'affirmation « égales car égales pour x = v » est vérifiée (égales en v, non identiques) ;
//        la distributivité : une seule option est identiquement égale ;
//      · les cas d'une situation (le camion passe-t-il ?) : chaque cas testé, l'ensemble des cas qui passent recalculé ;
//  - audit(bank) relit le LaTeX de chaque énoncé / option / corrigé (tex2ascii) : la relation retapée est dans l'énoncé de la
//    question (ou de la feuille pour les cas), les valeurs données y sont, les deux membres chiffrés du corrigé valent ceux de l'oracle,
//    aucun chiffre ni lettre latine hors d'un îlot `$…$` (argent `$…$ DA`, unité `\,\mathrm{u}`), aucune mention du manuel, aucun
//    mot interdit, ni « معادلة » ni « حلّ » (cette leçon ne résout rien) ;
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
  cmp(o) { const x = this.n * o.d - o.n * this.d; return x < 0n ? -1 : x > 0n ? 1 : 0; }
  eq(o) { return this.cmp(o) === 0; }
}
const ZERO = new Q(0n);
const dq = (s) => { const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(String(s).trim()); if (!m) throw new Error(`nombre illisible : ${s}`); const f = m[3] ?? ''; const v = new Q(BigInt(m[2] + f), 10n ** BigInt(f.length)); return m[1] ? new Q(-v.n, v.d) : v; };
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

/* ── parseur ASCII → arbre (produit implicite, moins unaire) ── */
function parse(s) {
  const raw = s.match(/\d+(?:\.\d+)?|[a-z]|[()+\-*/^]/g) ?? [];
  if (raw.join('') !== s.replace(/\s+/g, '')) throw new Error(`caractères illisibles dans « ${s} »`);
  const t = [];
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i - 1]; const b = raw[i];
    const aVal = a !== undefined && (/^[\da-z]/.test(a) || a === ')'); const bVal = /^[a-z(]/.test(b) || (/^\d/.test(b) && a !== undefined && (/^[a-z]/.test(a) || a === ')'));
    if (aVal && bVal) t.push('*');
    t.push(b);
  }
  let i = 0;
  const atom = () => {
    const v = t[i++];
    if (v === '(') { const e = expr(); if (t[i++] !== ')') throw new Error(`« ) » attendu dans « ${s} »`); return e; }
    if (v === '-') return { k: 'neg', e: atom() };
    if (v !== undefined && /^\d/.test(v)) return { k: 'n', v: dq(v) };
    if (v !== undefined && /^[a-z]$/.test(v)) return { k: 'v', n: v };
    throw new Error(`facteur attendu dans « ${s} »`);
  };
  const pw = () => { const b = atom(); if (t[i] === '^') { i++; const e = atom(); return { k: '^', b, e }; } return b; };
  const term = () => { let l = pw(); while (t[i] === '*' || t[i] === '/') { const o = t[i++]; l = { k: 'b', o, l, r: pw() }; } return l; };
  const expr = () => { let l = term(); while (t[i] === '+' || t[i] === '-') { const o = t[i++]; l = { k: 'b', o, l, r: term() }; } return l; };
  const root = expr(); if (i !== t.length) throw new Error(`reste dans « ${s} »`);
  return root;
}
/** évaluation exacte ; `mode` = null | 'juxta' | 'signsub' (les deux lectures fautives nommées). */
function ev(n, env, mode = null) {
  if (n.k === 'n') return n.v;
  if (n.k === 'v') { if (!(n.n in env)) throw new Error(`lettre ${n.n} sans valeur`); return env[n.n]; }
  if (n.k === 'neg') return ZERO.sub(ev(n.e, env, mode));
  if (n.k === '^') {
    const e = ev(n.e, env, mode); if (e.d !== 1n || e.n < 0n || e.n > 6n) throw new Error('exposant');
    const b = ev(n.b, env, mode); let r = new Q(1n); for (let j = 0n; j < e.n; j++) r = r.mul(b);
    if (mode === 'signsub' && n.b.k === 'v' && b.n < 0n) return new Q(r.n < 0n ? r.n : -r.n, r.d);
    return r;
  }
  if (n.o === '*' && mode === 'juxta' && n.l.k === 'n' && n.r.k === 'v') {
    const a = ev(n.l, env, mode); const b = env[n.r.n];
    if (a.d === 1n && b.d === 1n && b.n >= 0n) return new Q(BigInt(`${a.n}${b.n}`));
  }
  const l = ev(n.l, env, mode); const r = ev(n.r, env, mode);
  if (n.o === '+') return l.add(r);
  if (n.o === '-') return l.sub(r);
  if (n.o === '*') return l.mul(r);
  return l.div(r);
}
const envQ = (e) => Object.fromEntries(Object.entries(e ?? {}).map(([k, v]) => [k, dq(String(v))]));
const val = (s, env, mode) => ev(parse(s), envQ(env), mode);
const letters = (n, acc = new Set()) => { if (n.k === 'v') acc.add(n.n); else if (n.k === 'neg') letters(n.e, acc); else if (n.k === '^') letters(n.b, acc); else if (n.k === 'b') { letters(n.l, acc); letters(n.r, acc); } return acc; };

/* ── relations ── */
const RELS = ['<=', '>=', '<', '>', '='];
function relOf(s) { const m = /^(.*?)(<=|>=|<|>|=)(.*)$/.exec(s); if (!m) throw new Error(`pas une relation : ${s}`); return { L: m[1], rel: m[2], R: m[3] }; }
const cmpOp = (op, a, b) => { const c = a.cmp(b); return { '=': c === 0, '<': c < 0, '<=': c <= 0, '>': c > 0, '>=': c >= 0 }[op]; };
const holds = (rel, env, op) => { const { L, rel: r, R: Rr } = relOf(rel); return cmpOp(op ?? r, val(L, env), val(Rr, env)); };
const relaxed = { '<': '<=', '>': '>=', '<=': '<', '>=': '>' };
/** même fonction sur une grille : deux expressions sont « égales pour toute valeur » (identités de degré ≤ 2 : 12 points suffisent). */
const GRID = ['0', '1', '2', '3', '4', '5', '6', '7', '0.5', '10', '-1', '-3'];
const sameFn = (a, b, lt = 'x') => GRID.every((g) => val(a, { [lt]: g }).eq(val(b, { [lt]: g })));
/** mêmes expressions à plusieurs lettres : toutes les combinaisons d'une petite grille. */
const sameFnMulti = (a, b) => {
  const lt = [...new Set([...letters(parse(a)), ...letters(parse(b))])]; const vs = ['0', '1', '2', '3', '5', '-2']; let ok = true;
  const rec = (i, e) => { if (!ok) return; if (i === lt.length) { if (!val(a, e).eq(val(b, e))) ok = false; return; } for (const v of vs) rec(i + 1, { ...e, [lt[i]]: v }); };
  rec(0, {}); return ok;
};
const sameRel = (A, B) => {
  const a = relOf(A); const b = relOf(B); if (a.rel !== b.rel) return false;
  const lt = [...new Set([...letters(parse(a.L)), ...letters(parse(a.R)), ...letters(parse(b.L)), ...letters(parse(b.R))])];
  const pts = []; const vs = ['0', '1', '2', '3', '5', '-2'];
  const rec = (i, e) => { if (i === lt.length) { pts.push(e); return; } for (const v of vs) rec(i + 1, { ...e, [lt[i]]: v }); };
  rec(0, {});
  return pts.every((p) => val(a.L, p).sub(val(a.R, p)).eq(val(b.L, p).sub(val(b.R, p))));
};
const zeroEnv = (rel) => { const { L, R: Rr } = relOf(rel); return Object.fromEntries([...letters(parse(L)), ...letters(parse(Rr))].map((k) => [k, '0'])); };

/* ── SPEC : ce que la feuille demande, jamais une réponse ── */
const SPEC = {
  "ex-2am-ikhtibar-musawat-mutabayina-l1-001:q1": {"t":"verdict","rel":"4*x-3=5*x-4","env":{"x":1},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-001:q2": {"t":"verdict","rel":"4*x-3=5*x-4","env":{"x":3},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-001:q3": {"t":"verdict","rel":"3*x+4<25","env":{"x":7},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-002:q1": {"t":"verdict","rel":"7-2*x=9-3*x","env":{"x":2},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-002:q2": {"t":"verdict","rel":"7-2*x=9-3*x","env":{"x":1.5},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-002:q3": {"t":"eval","e":"9-3*x","env":{"x":1.5},"sigs":[],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-003:q1": {"t":"verdict","rel":"x+6=2*x+4","env":{"x":0},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-003:q2": {"t":"verdict","rel":"x+6=2*x+4","env":{"x":2},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-003:q3": {"t":"verdict","rel":"x+6=2*x+4","env":{"x":0.5},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-003:q4": {"t":"pick","rel":"x+6=2*x+4","opts":[{"id":"A","env":{"x":0},"tag":null},{"id":"B","env":{"x":2},"tag":null},{"id":"C","env":{"x":0.5},"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-004:q1": {"t":"verdict","rel":"3*(x+2)=(x+22)/2","env":{"x":2},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-004:q2": {"t":"verdict","rel":"3*(x+2)=(x+22)/2","env":{"x":4},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-004:q3": {"t":"eval","e":"(x+22)/2","env":{"x":6},"sigs":[],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-005:q1": {"t":"verdict","rel":"(3*x)/4+2=11","env":{"x":0},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-005:q2": {"t":"verdict","rel":"(3*x)/4+2=11","env":{"x":12},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-005:q3": {"t":"verdict","rel":"(3*x)/4+2=11","env":{"x":8},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-006:q1": {"t":"verdict","rel":"6*x+4=9*x-5","env":{"x":3},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-006:q2": {"t":"verdict","rel":"6*x+4=9*x-5","env":{"x":2},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-006:q3": {"t":"eval","e":"5*x+2","env":{"x":3},"sigs":["JUXTA"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-007:q1": {"t":"verdict","rel":"2*x+3=x+9","env":{"x":3},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-007:q2": {"t":"verdict","rel":"2*x+3=x+9","env":{"x":6},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-007:q3": {"t":"pick","rel":"2*x+3=x+9","opts":[{"id":"A","env":{"x":1},"tag":null},{"id":"B","env":{"x":3},"tag":"ONESIDE"},{"id":"C","env":{"x":6},"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-008:q1": {"t":"verdict","rel":"0.5*x+3=2*x-1.5","env":{"x":3},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-008:q2": {"t":"verdict","rel":"0.5*x+3=2*x-1.5","env":{"x":2},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-008:q3": {"t":"eval","e":"2*x-1.5","env":{"x":3},"sigs":["JUXTA"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-009:q1": {"t":"eval","e":"35+3*x","env":{"x":8},"sigs":["JUXTA"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-009:q2": {"t":"eval","e":"8*x-5","env":{"x":8},"sigs":["JUXTA"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-009:q3": {"t":"verdict","rel":"35+3*x=8*x-5","env":{"x":8},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-010:q1": {"t":"verdict","rel":"3+5*x=8*x","env":{"x":1},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-010:q2": {"t":"verdict","rel":"3+5*x=8*x","env":{"x":2},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-010:q3": {"t":"ident","a":"3+5*x","b":"8*x","letter":"x","order":["no","yes"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-001:q1": {"t":"verdict","rel":"3*x-5=4*x-9","env":{"x":4},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-001:q2": {"t":"verdict","rel":"4*y-6<=18-2*y","env":{"y":4},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-001:q3": {"t":"verdict","rel":"4*y-6<=18-2*y","env":{"y":5},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-002:q1": {"t":"verdict","rel":"6*x+2=7*x-3","env":{"x":5},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-002:q2": {"t":"verdict","rel":"20-3*y<8","env":{"y":5.5},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-002:q3": {"t":"which","rel":"20-3*y<8","letter":"y","cands":[3,4,5,6],"opts":[{"id":"A","set":[4,5,6],"tag":"BOUNDARY"},{"id":"B","set":[5],"tag":null},{"id":"C","set":[6],"tag":null},{"id":"D","set":[5,6],"tag":null}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-003:q1": {"t":"verdict","rel":"7-y>5*y-11","env":{"y":2.5},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-003:q2": {"t":"verdict","rel":"7-y>5*y-11","env":{"y":3},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-003:q3": {"t":"eval","e":"5*y-11","env":{"y":3},"sigs":["JUXTA"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-004:q1": {"t":"verdict","rel":"4*x+3<27","env":{"x":5},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-004:q2": {"t":"verdict","rel":"4*x+3<27","env":{"x":6},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-004:q3": {"t":"which","rel":"4*x+3<27","letter":"x","cands":[4,5,6,7],"opts":[{"id":"A","set":[4,5],"tag":null},{"id":"B","set":[4,5,6],"tag":"BOUNDARY"},{"id":"C","set":[4],"tag":null},{"id":"D","set":[5],"tag":null}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-005:q1": {"t":"verdict","rel":"5*x-2>=18","env":{"x":4},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-005:q2": {"t":"which","rel":"5*x-2>=18","letter":"x","cands":[3,4,5,6],"opts":[{"id":"A","set":[5,6],"tag":"STRICT"},{"id":"B","set":[4,5,6],"tag":null},{"id":"C","set":[4,5],"tag":null},{"id":"D","set":[3],"tag":null}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-005:q3": {"t":"eval","e":"5*x-2","env":{"x":4},"sigs":["JUXTA"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-006:q1": {"t":"verdict","rel":"2*x+7<=3*x+1","env":{"x":6},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-006:q2": {"t":"verdict","rel":"2*x+7<=3*x+1","env":{"x":5},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-006:q3": {"t":"which","rel":"2*x+7<=3*x+1","letter":"x","cands":[4,5,6,7],"opts":[{"id":"A","set":[7],"tag":"STRICT"},{"id":"B","set":[6],"tag":null},{"id":"C","set":[6,7],"tag":null},{"id":"D","set":[4,5],"tag":null}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-007:q1": {"t":"verdict","rel":"9-x<3*x-7","env":{"x":4},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-007:q2": {"t":"which","rel":"9-x<3*x-7","letter":"x","cands":[2,3,4,5],"opts":[{"id":"A","set":[4,5],"tag":"BOUNDARY"},{"id":"B","set":[],"tag":null},{"id":"C","set":[2,3,4],"tag":null},{"id":"D","set":[5],"tag":null}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-007:q3": {"t":"count","rel":"9-x<3*x-7","cands":[{"x":2},{"x":3},{"x":4},{"x":5}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-008:q1": {"t":"pick","rel":"6*x+4=2*x+16","opts":[{"id":"A","env":{"x":2},"tag":"ONESIDE"},{"id":"B","env":{"x":3},"tag":null},{"id":"C","env":{"x":5},"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-008:q2": {"t":"verdict","rel":"6*x+4=2*x+16","env":{"x":5},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-008:q3": {"t":"eval","e":"2*x+16","env":{"x":3},"sigs":[],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-009:q1": {"t":"pick","rel":"31=8*x+7","opts":[{"id":"A","env":{"x":2},"tag":null},{"id":"B","env":{"x":2.5},"tag":null},{"id":"C","env":{"x":3},"tag":null},{"id":"D","env":{"x":3.5},"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-009:q2": {"t":"verdict","rel":"31=8*x+7","env":{"x":2.5},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-009:q3": {"t":"eval","e":"8*x+7","env":{"x":3.5},"sigs":[],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-010:q1": {"t":"pick","rel":"4*x+18=7*x","opts":[{"id":"A","env":{"x":6},"tag":null},{"id":"B","env":{"x":4},"tag":null},{"id":"C","env":{"x":8},"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-010:q2": {"t":"verdict","rel":"4*x+18=7*x","env":{"x":8},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-010:q3": {"t":"eval","e":"7*x","env":{"x":8},"sigs":["JUXTA"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-001:q1": {"t":"verdict","rel":"3*x=4*y-5","env":{"x":5,"y":5},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-001:q2": {"t":"verdict","rel":"6+2*y>5*x-3","env":{"x":3,"y":2},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-001:q3": {"t":"eval","e":"2*x+y","env":{"x":4,"y":3},"sigs":["SWAP"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-002:q1": {"t":"verdict","rel":"2*x+3*y=17","env":{"x":4,"y":3},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-002:q2": {"t":"verdict","rel":"2*x+3*y=17","env":{"x":3,"y":4},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-002:q3": {"t":"eval","e":"5*x-2*y","env":{"x":6,"y":4},"sigs":["SWAP"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-003:q1": {"t":"eval","e":"2*x+9","env":{"x":-3},"sigs":[],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-003:q2": {"t":"eval","e":"x^2+4","env":{"x":-3},"sigs":["SIGNSUB"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-003:q3": {"t":"verdict","rel":"x^2=3*x+18","env":{"x":-3},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-004:q1": {"t":"verdict","rel":"3*x+2*y=x-4","env":{"x":-3,"y":1},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-004:q2": {"t":"verdict","rel":"3*x+2*y=x-4","env":{"x":3,"y":-1},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-004:q3": {"t":"eval","e":"3*x+2*y","env":{"x":-3,"y":1},"sigs":["SWAP"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-005:q1": {"t":"eval","e":"4*x+5","env":{"x":-2},"sigs":[],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-005:q2": {"t":"eval","e":"2*x+1","env":{"x":-2},"sigs":[],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-005:q3": {"t":"verdict","rel":"4*x+5=2*x+1","env":{"x":-2},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-005:q4": {"t":"verdict","rel":"4*x+5=2*x+1","env":{"x":2},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-006:q1": {"t":"verdict","rel":"2*x-1<x+3","env":{"x":-4},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-006:q2": {"t":"verdict","rel":"2*x-1<x+3","env":{"x":4},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-006:q3": {"t":"which","rel":"2*x-1<x+3","letter":"x","cands":[-4,0,3,4,6],"opts":[{"id":"A","set":[-4,0,3,4],"tag":"BOUNDARY"},{"id":"B","set":[-4,0,3],"tag":null},{"id":"C","set":[-4,0],"tag":null},{"id":"D","set":[0,3],"tag":null}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-007:q1": {"t":"verdict","rel":"x^2<=2*x+3","env":{"x":-1},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-007:q2": {"t":"verdict","rel":"x^2<=2*x+3","env":{"x":4},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-007:q3": {"t":"which","rel":"x^2<=2*x+3","letter":"x","cands":[-2,-1,0,3,4],"opts":[{"id":"A","set":[0],"tag":"STRICT"},{"id":"B","set":[-1,0],"tag":null},{"id":"C","set":[-1,0,3],"tag":null},{"id":"D","set":[0,3],"tag":null}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-008:q1": {"t":"verdict","rel":"x+2*y=8","env":{"x":2,"y":3},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-008:q2": {"t":"verdict","rel":"x+2*y=8","env":{"x":3,"y":3},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-008:q3": {"t":"count","rel":"x+2*y=8","cands":[{"x":2,"y":3},{"x":4,"y":2},{"x":3,"y":3},{"x":8,"y":0},{"x":1,"y":4}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-009:q1": {"t":"verdict","rel":"2*x-y<=5","env":{"x":3,"y":1},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-009:q2": {"t":"verdict","rel":"2*x-y<=5","env":{"x":4,"y":-2},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-009:q3": {"t":"verdict","rel":"2*x-y<=5","env":{"x":-1,"y":-3},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-010:q1": {"t":"verdict","rel":"3+x=2*x+0.5","env":{"x":1},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-010:q2": {"t":"verdict","rel":"4+4*x=4*(x+1)","env":{"x":1},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-010:q3": {"t":"verdict","rel":"4+4*x=4*(x+1)","env":{"x":4},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-010:q4": {"t":"ident","a":"4+4*x","b":"4*(x+1)","letter":"x","order":["no","yes"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-001:q1": {"t":"ident","a":"x+x","b":"2*x","letter":"x","order":["yes","no"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-001:q2": {"t":"ident","a":"x+x","b":"x^2","letter":"x","order":["no","yes"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-001:q3": {"t":"counter","a":"x+x","b":"x^2","letter":"x","opts":[{"id":"A","v":3},{"id":"B","v":0},{"id":"C","v":2}],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-002:q1": {"t":"claim","a":"x^2+4","b":"5*x","letter":"x","v":1,"order":["yes","no"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-002:q2": {"t":"counter","a":"x^2+4","b":"5*x","letter":"x","opts":[{"id":"A","v":1},{"id":"B","v":0},{"id":"C","v":4}],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-002:q3": {"t":"ident","a":"x^2+4","b":"5*x","letter":"x","order":["no","yes"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-003:q1": {"t":"ident","a":"3*x+x","b":"4*x","letter":"x","order":["yes","no"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-003:q2": {"t":"concept","opts":[{"id":"A","ok":false,"tag":"MANYEX"},{"id":"B","ok":false,"tag":"ONEVALUE"},{"id":"C","ok":true,"tag":null}],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-003:q3": {"t":"counter","a":"3*x+x","b":"3*x^2","letter":"x","opts":[{"id":"A","v":0},{"id":"B","v":1}],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-004:q1": {"t":"distrib","a":"4*(x+5)","letter":"x","opts":[{"id":"A","e":"4*x+5"},{"id":"B","e":"x+20"},{"id":"C","e":"4*x+20"}],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-004:q2": {"t":"ident","a":"4*(x+5)","b":"4*x+20","letter":"x","order":["no","yes"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-004:q3": {"t":"ident","a":"4*(x+5)","b":"4*x+5","letter":"x","order":["yes","no"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-005:q1": {"t":"distrib","a":"3*(2*x-1)","letter":"x","opts":[{"id":"A","e":"6*x-3"},{"id":"B","e":"6*x-1"},{"id":"C","e":"5*x-3"}],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-005:q2": {"t":"ident","a":"3*(2*x-1)","b":"6*x-3","letter":"x","order":["no","yes"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-005:q3": {"t":"ident","a":"3*(2*x-1)","b":"6*x-1","letter":"x","order":["yes","no"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-006:q1": {"t":"claim","a":"2*x+3","b":"3*x","letter":"x","v":3,"order":["no","yes"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-006:q2": {"t":"ident","a":"2*x+3","b":"3*x","letter":"x","order":["yes","no"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-006:q3": {"t":"counter","a":"x^2+6","b":"5*x","letter":"x","opts":[{"id":"A","v":2},{"id":"B","v":0},{"id":"C","v":3}],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-007:q1": {"t":"ident","a":"5*(x+2)+5","b":"5*(x+3)","letter":"x","order":["no","yes"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-007:q2": {"t":"ident","a":"5*(x+2)+5","b":"5*(x+3)+5","letter":"x","order":["yes","no"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-007:q3": {"t":"verdict","rel":"5*(x+2)+5=5*(x+3)","env":{"x":4},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-008:q1": {"t":"ident","a":"x*(x+2)","b":"x^2+2*x","letter":"x","order":["yes","no"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-008:q2": {"t":"ident","a":"x*(x+2)","b":"x^2+2","letter":"x","order":["no","yes"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-008:q3": {"t":"verdict","rel":"x*(x+2)=x^2+2","env":{"x":1},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-008:q4": {"t":"counter","a":"x*(x+2)","b":"x^2+2","letter":"x","opts":[{"id":"A","v":2},{"id":"B","v":1}],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-009:q1": {"t":"claim","a":"n+n","b":"n*n","letter":"n","v":2,"order":["no","yes"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-009:q2": {"t":"counter","a":"n+n","b":"n*n","letter":"n","opts":[{"id":"A","v":0},{"id":"B","v":5},{"id":"C","v":2}],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-009:q3": {"t":"ident","a":"n+n","b":"n*n","letter":"n","order":["yes","no"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-010:q1": {"t":"verdict","rel":"3*(x+4)-6=3*(x+2)","env":{"x":1},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-010:q2": {"t":"verdict","rel":"3*(x+4)-6=3*(x+2)","env":{"x":5},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-010:q3": {"t":"ident","a":"3*(x+4)-6","b":"3*(x+2)","letter":"x","order":["no","yes"],"lp":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-001:q1": {"t":"static","opts":[{"id":"A","ok":false,"tag":null},{"id":"B","ok":false,"tag":null},{"id":"C","ok":true,"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-001:q2": {"t":"verdict","rel":"3200+45*x+60*y<6000","env":{"x":20,"y":30},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-001:q3": {"t":"verdict","rel":"3200+45*x+60*y<6000","env":{"x":24,"y":35},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-001:q4": {"t":"cases","rel":"3200+45*x+60*y<6000","cases":[{"x":20,"y":30},{"x":24,"y":35}],"passWhen":"true","opts":[{"id":"A","set":[1],"tag":null},{"id":"B","set":[],"tag":null},{"id":"C","set":[0,1],"tag":null},{"id":"D","set":[0],"tag":null}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-002:q1": {"t":"static","opts":[{"id":"A","ok":false,"tag":null},{"id":"B","ok":true,"tag":null},{"id":"C","ok":false,"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-002:q2": {"t":"verdict","rel":"7*x+480=12*x","env":{"x":80},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-002:q3": {"t":"pick","rel":"7*x+480=12*x","opts":[{"id":"A","env":{"x":80},"tag":null},{"id":"B","env":{"x":120},"tag":null},{"id":"C","env":{"x":96},"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-002:q4": {"t":"eval","e":"7*x+480","env":{"x":96},"sigs":[],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-003:q1": {"t":"static","opts":[{"id":"A","ok":true,"tag":null},{"id":"B","ok":false,"tag":null},{"id":"C","ok":false,"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-003:q2": {"t":"verdict","rel":"3000+45*x>4800","env":{"x":38},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-003:q3": {"t":"verdict","rel":"3000+45*x>4800","env":{"x":42},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-003:q4": {"t":"cases","rel":"3000+45*x>4800","cases":[{"x":38},{"x":42}],"passWhen":"false","opts":[{"id":"A","set":[1],"tag":null},{"id":"B","set":[0],"tag":null},{"id":"C","set":[],"tag":null},{"id":"D","set":[0,1],"tag":null}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-004:q1": {"t":"static","opts":[{"id":"A","ok":false,"tag":null},{"id":"B","ok":false,"tag":null},{"id":"C","ok":true,"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-004:q2": {"t":"verdict","rel":"2800+35*x+55*y<=4900","env":{"x":27,"y":21},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-004:q3": {"t":"verdict","rel":"2800+35*x+55*y<=4900","env":{"x":30,"y":20},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-004:q4": {"t":"cases","rel":"2800+35*x+55*y<=4900","cases":[{"x":27,"y":21},{"x":30,"y":20},{"x":25,"y":22}],"passWhen":"true","opts":[{"id":"A","set":[0],"tag":null},{"id":"B","set":[1],"tag":null},{"id":"C","set":[2],"tag":null},{"id":"D","set":[0,2],"tag":null}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-005:q1": {"t":"static","opts":[{"id":"A","ok":false,"tag":null},{"id":"B","ok":true,"tag":null},{"id":"C","ok":false,"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-005:q2": {"t":"verdict","rel":"65*x+35<=480","env":{"x":6},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-005:q3": {"t":"verdict","rel":"65*x+35<=480","env":{"x":7},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-005:q4": {"t":"which","rel":"65*x+35<=480","letter":"x","cands":[5,6,7,8],"opts":[{"id":"A","set":[5],"tag":null},{"id":"B","set":[6],"tag":null},{"id":"C","set":[5,6],"tag":null},{"id":"D","set":[7,8],"tag":null}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-005:q5": {"t":"eval","e":"65*x+35","env":{"x":6},"sigs":[],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-006:q1": {"t":"verdict","rel":"8*x+750=13*x","env":{"x":120},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-006:q2": {"t":"pick","rel":"8*x+750=13*x","opts":[{"id":"A","env":{"x":150},"tag":null},{"id":"B","env":{"x":120},"tag":null},{"id":"C","env":{"x":180},"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-006:q3": {"t":"verdict","rel":"8*x+750=13*x","env":{"x":180},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-006:q4": {"t":"eval","e":"13*x","env":{"x":150},"sigs":[],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-007:q1": {"t":"verdict","rel":"300+40*n=60*n","env":{"n":10},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-007:q2": {"t":"verdict","rel":"300+40*n=60*n","env":{"n":15},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-007:q3": {"t":"pick","rel":"300+40*n=60*n","opts":[{"id":"A","env":{"n":10},"tag":null},{"id":"B","env":{"n":15},"tag":null},{"id":"C","env":{"n":20},"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-007:q4": {"t":"eval","e":"300+40*n","env":{"n":15},"sigs":["JUXTA"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-008:q1": {"t":"static","opts":[{"id":"A","ok":false,"tag":null},{"id":"B","ok":false,"tag":null},{"id":"C","ok":true,"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-008:q2": {"t":"verdict","rel":"3600+45*x+30*y<5250","env":{"x":30,"y":10},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-008:q3": {"t":"verdict","rel":"3600+45*x+30*y<5250","env":{"x":26,"y":15},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-008:q4": {"t":"cases","rel":"3600+45*x+30*y<5250","cases":[{"x":30,"y":10},{"x":26,"y":15},{"x":32,"y":12}],"passWhen":"true","opts":[{"id":"A","set":[0,1],"tag":"BOUNDARY"},{"id":"B","set":[0],"tag":null},{"id":"C","set":[2],"tag":null},{"id":"D","set":[1],"tag":null}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-009:q1": {"t":"verdict","rel":"3*x+2*y=190","env":{"x":30,"y":50},"order":["no","yes"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-009:q2": {"t":"verdict","rel":"3*x+2*y=190","env":{"x":50,"y":30},"order":["yes","no"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-009:q3": {"t":"pick","rel":"3*x+2*y=190","opts":[{"id":"A","env":{"x":50,"y":30},"tag":"SWAP"},{"id":"B","env":{"x":30,"y":50},"tag":null},{"id":"C","env":{"x":40,"y":40},"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-009:q4": {"t":"eval","e":"3*x+2*y","env":{"x":30,"y":50},"sigs":["SWAP"],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-010:q1": {"t":"static","opts":[{"id":"A","ok":false,"tag":null},{"id":"B","ok":false,"tag":null},{"id":"C","ok":true,"tag":null}],"lp":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-010:q2": {"t":"verdict","rel":"3400+120*x+75*y<5800","env":{"x":15,"y":8},"order":["no","yes"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-010:q3": {"t":"verdict","rel":"3400+120*x+75*y<5800","env":{"x":9,"y":16},"order":["yes","no"],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-010:q4": {"t":"cases","rel":"3400+120*x+75*y<5800","cases":[{"x":10,"y":15},{"x":15,"y":8},{"x":9,"y":16}],"passWhen":"true","opts":[{"id":"A","set":[0,1,2],"tag":"BOUNDARY"},{"id":"B","set":[0],"tag":null},{"id":"C","set":[1],"tag":null},{"id":"D","set":[0,2],"tag":null}],"lp":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-010:q5": {"t":"eval","e":"3400+120*x+75*y","env":{"x":10,"y":15},"sigs":["SWAP"],"lp":1}
};
const PROV = {
  "ex-2am-ikhtibar-musawat-mutabayina-l1-001": {"t":"tt","grade":"2am","sem":2,"file":"2am-s2-73","ex":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-002": {"t":"tt","grade":"2am","sem":2,"file":"2am-s2-50","ex":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-003": {"t":"tt","grade":"2am","sem":2,"file":"2am-s2-52","ex":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-004": {"t":"tt","grade":"2am","sem":2,"file":"2am-s2-59","ex":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-005": {"t":"tt","grade":"2am","sem":3,"file":"2am-s3-31","ex":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-006": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-007": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-008": {"t":"mod","sem":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-009": {"t":"ad","el":"ex-27"},
  "ex-2am-ikhtibar-musawat-mutabayina-l1-010": {"t":"ad","el":"now-61"},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-001": {"t":"tt","grade":"2am","sem":3,"file":"2am-s3-39","ex":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-002": {"t":"tt","grade":"2am","sem":3,"file":"2am-s3-41","ex":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-003": {"t":"tt","grade":"2am","sem":3,"file":"2am-s3-44","ex":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-004": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-005": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-006": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-007": {"t":"mod","sem":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-008": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-009": {"t":"ad","el":"ex-31"},
  "ex-2am-ikhtibar-musawat-mutabayina-l2-010": {"t":"ad","el":"self-8"},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-001": {"t":"tt","grade":"2am","sem":2,"file":"2am-s2-75","ex":1},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-002": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-003": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-004": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-005": {"t":"mod","sem":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-006": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-007": {"t":"mod","sem":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-008": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-009": {"t":"mod","sem":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l3-010": {"t":"ad","el":"ex-28"},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-001": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-002": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-003": {"t":"mod","sem":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-004": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-005": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-006": {"t":"mod","sem":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-007": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-008": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-009": {"t":"mod","sem":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l4-010": {"t":"ad","el":"deep-50"},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-001": {"t":"tt","grade":"2am","sem":2,"file":"2am-s2-72","ex":5},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-002": {"t":"tt","grade":"2am","sem":2,"file":"1am-s2-79","ex":5},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-003": {"t":"tt","grade":"2am","sem":2,"file":"2am-s2-75","ex":5},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-004": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-005": {"t":"mod","sem":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-006": {"t":"mod","sem":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-007": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-008": {"t":"mod","sem":2},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-009": {"t":"mod","sem":3},
  "ex-2am-ikhtibar-musawat-mutabayina-l5-010": {"t":"mod","sem":3}
};
const READ = { '2am-s2-73': [2], '2am-s2-50': [2], '2am-s2-52': [1], '2am-s2-59': [2], '2am-s3-31': [1], '2am-s3-39': [2], '2am-s3-41': [1], '2am-s3-44': [1], '2am-s2-75': [1, 5], '2am-s2-72': [5], '1am-s2-79': [5] };
const EXPECTED = { 1: [5, 3, 2], 2: [3, 5, 2], 3: [1, 8, 1], 4: [0, 9, 1], 5: [3, 7, 0] };
const MISC = (t) => `MISC-IKHTIBAR-${t}`;
const LP = (n) => `2am_ikhtibar-musawat-mutabayina_P${n}`;
const BADGE = { 2: 'على منوال اختبار الفصل الثاني', 3: 'على منوال اختبار الفصل الثالث' };
const ALL_TAGS = ['ONESIDE', 'SWAP', 'BOUNDARY', 'STRICT', 'ONEVALUE', 'MANYEX', 'JUXTA', 'SIGNSUB'];
const sheetOf = (key) => key.split(':')[0];
const keyDs = (vs) => vs.map((v) => D(dq(String(v))));
const sameList = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Jugement d'une question : { answer, problems, info } — le « oui / non » de l'ordre donné ; les ensembles ; les cas. */
function judge(S) {
  const problems = []; let answer = null; const info = {};
  const ynAnswer = (yes) => C(S.order.map((w, i) => [w, 'AB'[i]]).find(([w]) => (w === 'yes') === yes)[1]);
  if (S.t === 'verdict') {
    const yes = holds(S.rel, S.env); info.yes = yes; answer = ynAnswer(yes);
    const { L, R: Rr } = relOf(S.rel); info.a = val(L, S.env); info.b = val(Rr, S.env);
  } else if (S.t === 'eval') {
    const key = val(S.e, S.env); info.key = key; answer = R(D(key)); info.sigs = [];
    const keys = Object.keys(S.env);
    for (const tag of S.sigs) {
      let w;
      if (tag === 'JUXTA') w = val(S.e, S.env, 'juxta');
      else if (tag === 'SIGNSUB') { w = val(S.e, S.env, 'signsub'); if (!keys.some((k) => dq(String(S.env[k])).n < 0n)) problems.push('SIGNSUB sans valeur négative'); }
      else if (tag === 'SWAP') { if (keys.length !== 2) problems.push('SWAP demande deux lettres'); w = val(S.e, { ...S.env, [keys[0]]: S.env[keys[1]], [keys[1]]: S.env[keys[0]] }); }
      else { problems.push(`recette ${tag} inexistante`); continue; }
      if (w.eq(key)) problems.push(`signature ${tag} = clé`); else info.sigs.push([D(w), MISC(tag)]);
    }
    const vs = info.sigs.map(([v]) => v); if (new Set([...vs, D(key)]).size !== vs.length + 1) problems.push('deux signatures égales entre elles ou à la clé');
  } else if (S.t === 'pick') {
    const ok = S.opts.filter((o) => holds(S.rel, o.env)); info.opts = [];
    if (ok.length !== 1 || ok[0].tag) problems.push(`${ok.length} options vraies`); else answer = C(ok[0].id);
    const keyEnv = ok[0]?.env; const keys = Object.keys(S.opts[0].env);
    for (const o of S.opts) {
      const isOK = holds(S.rel, o.env);
      if (o.tag === 'ONESIDE') { const { L } = relOf(S.rel); if (isOK || !val(L, o.env).eq(val(relOf(S.rel).R, zeroEnv(S.rel)))) problems.push(`option ${o.id} : ONESIDE n'est pas « membre de gauche = terme constant de droite »`); }
      else if (o.tag === 'SWAP') { if (isOK || keys.length !== 2 || !keyEnv || !dq(String(o.env[keys[0]])).eq(dq(String(keyEnv[keys[1]]))) || !dq(String(o.env[keys[1]])).eq(dq(String(keyEnv[keys[0]])))) problems.push(`option ${o.id} : SWAP n'est pas le couple inversé de la bonne réponse`); }
      else if (o.tag) problems.push(`option ${o.id} : balise ${o.tag} inattendue`);
      info.opts.push({ ...o, isOK });
    }
    if (new Set(S.opts.map((o) => JSON.stringify(Object.values(o.env).map((v) => D(dq(String(v))))))).size !== S.opts.length) problems.push('deux options égales');
  } else if (S.t === 'which') {
    const r = relOf(S.rel).rel;
    const key = S.cands.filter((v) => holds(S.rel, { [S.letter]: v })); const rx = S.cands.filter((v) => holds(S.rel, { [S.letter]: v }, relaxed[r]));
    const kd = keyDs(key); const keyOpts = S.opts.filter((o) => sameList(keyDs(o.set), kd));
    if (keyOpts.length !== 1 || keyOpts[0].tag) problems.push(`${keyOpts.length} options égales à l'ensemble juste`); else answer = C(keyOpts[0].id);
    for (const o of S.opts) {
      if (o.tag === 'BOUNDARY') { if (!(r === '<' || r === '>') || !sameList(keyDs(o.set), keyDs(rx)) || sameList(keyDs(o.set), kd)) problems.push(`option ${o.id} : BOUNDARY n'est pas « < lu ≤ »`); }
      else if (o.tag === 'STRICT') { if (!(r === '<=' || r === '>=') || !sameList(keyDs(o.set), keyDs(rx)) || sameList(keyDs(o.set), kd)) problems.push(`option ${o.id} : STRICT n'est pas « ≤ lu < »`); }
      else if (o.tag) problems.push(`option ${o.id} : balise ${o.tag} inattendue`);
      if (!o.set.every((v) => S.cands.map(String).includes(String(v)))) problems.push(`option ${o.id} : valeur hors des valeurs données`);
    }
    if (new Set(S.opts.map((o) => keyDs(o.set).join('|'))).size !== S.opts.length) problems.push('deux options égales');
    info.key = key;
  } else if (S.t === 'count') {
    const n = S.cands.filter((c) => holds(S.rel, c)).length; info.n = n; answer = R(String(n));
  } else if (S.t === 'ident') {
    const yes = sameFn(S.a, S.b, S.letter); info.yes = yes; answer = ynAnswer(yes);
  } else if (S.t === 'counter') {
    const eq = S.opts.filter((o) => sameFn(S.a, S.b, S.letter) ? false : val(S.a, { [S.letter]: o.v }).eq(val(S.b, { [S.letter]: o.v })));
    const diff = S.opts.filter((o) => !val(S.a, { [S.letter]: o.v }).eq(val(S.b, { [S.letter]: o.v })));
    if (diff.length !== 1) problems.push(`${diff.length} valeurs séparent les deux expressions`); else answer = C(diff[0].id);
    if (eq.length < 1) problems.push('aucune valeur ne confond les deux expressions');
    if (sameFn(S.a, S.b, S.letter)) problems.push('les expressions sont identiques');
  } else if (S.t === 'claim') {
    const a = val(S.a, { [S.letter]: S.v }); const b = val(S.b, { [S.letter]: S.v });
    if (!a.eq(b)) problems.push('les expressions ne coïncident pas en la valeur citée'); if (sameFn(S.a, S.b, S.letter)) problems.push('les expressions sont identiques : l\'affirmation serait juste');
    answer = ynAnswer(false); info.claimYes = 'ONEVALUE';
  } else if (S.t === 'distrib') {
    const ok = S.opts.filter((o) => sameFn(S.a, o.e, S.letter));
    if (ok.length !== 1) problems.push(`${ok.length} options identiques`); else answer = C(ok[0].id);
  } else if (S.t === 'static' || S.t === 'concept') {
    const ok = S.opts.filter((o) => o.ok); if (ok.length !== 1) problems.push('une seule option juste attendue'); else answer = C(ok[0].id);
  } else if (S.t === 'cases') {
    const r = relOf(S.rel).rel; const pass = (c, op) => (S.passWhen === 'true' ? holds(S.rel, c, op) : !holds(S.rel, c, op));
    const key = S.cases.map((c, i) => (pass(c) ? i : -1)).filter((i) => i >= 0); const rx = S.cases.map((c, i) => (pass(c, relaxed[r]) ? i : -1)).filter((i) => i >= 0);
    const keyOpts = S.opts.filter((o) => sameList(o.set, key));
    if (keyOpts.length !== 1 || keyOpts[0].tag) problems.push(`${keyOpts.length} options égales à l'ensemble juste`); else answer = C(keyOpts[0].id);
    for (const o of S.opts) {
      if (o.tag === 'BOUNDARY') { if (S.passWhen !== 'true' || !(r === '<' || r === '>') || !sameList(o.set, rx) || sameList(o.set, key)) problems.push(`option ${o.id} : BOUNDARY n'est pas « < lu ≤ »`); }
      else if (o.tag) problems.push(`option ${o.id} : balise ${o.tag} inattendue`);
    }
    if (new Set(S.opts.map((o) => o.set.join(','))).size !== S.opts.length) problems.push('deux options égales');
    info.key = key;
  } else problems.push(`type ${S.t}`);
  return { answer, problems, info };
}

/* ── ORACLE : la clé de chaque question, calculée ici ── */
export const ORACLE = {};
for (const [key, S] of Object.entries(SPEC)) { const { answer } = judge(S); if (answer) ORACLE[key] = answer; }

/* ── audit ── */
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const AR = '\\u0621-\\u064A';
const FORBIDDEN = new RegExp(`(?<![${AR}])(?:خنزير|خمر|نبيذ|بيرة|كحول|قمار|ميسر|يانصيب|ورق اللعب|أوراق اللعب|نرد|كازينو|ربا|فوائد|رأس السنة|عيد الميلاد|الكتاب|كتاب|الكتاب المدرسي|المنهاج|معادلة|المعادلة|معادلات|حلّ|حل)(?![${AR}])|🐷|ص\\s*\\d|صفحة`);
const islands = (t) => [...String(t ?? '').matchAll(/\$([^$]*)\$/g)].map((m) => m[1]);
const outside = (t) => String(t ?? '').replace(/\$[^$]*\$( DA)?/g, '');
/** LaTeX → ASCII de l'oracle (fractions \dfrac{A}{B} → (A)/(B), \times → *, \le → <=, ^{2} → ^2, {,} → .). */
function texToAscii(t) {
  let s = String(t).replace(/\\,/g, '').replace(/\\ /g, '').replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\\le(?![a-z])/g, '<=').replace(/\\ge(?![a-z])/g, '>=').replace(/\\mathrm\{[^}]*\}/g, '').replace(/\^\{(\d)\}/g, '^$1');
  for (;;) {
    const i = s.search(/\\d?frac\{/); if (i < 0) break;
    const open = s.indexOf('{', i); let depth = 0; let j = open;
    for (; j < s.length; j++) { if (s[j] === '{') depth++; if (s[j] === '}') { depth--; if (depth === 0) break; } }
    const A = s.slice(open + 1, j); const open2 = j + 1; let d2 = 0; let k = open2;
    for (; k < s.length; k++) { if (s[k] === '{') d2++; if (s[k] === '}') { d2--; if (d2 === 0) break; } }
    const B = s.slice(open2 + 1, k); s = `${s.slice(0, i)}(${A})/(${B})${s.slice(k + 1)}`;
  }
  return s.replace(/\s+/g, '');
}
const relIslands = (t) => islands(t).map(texToAscii).filter((a) => RELS.some((r) => a.includes(r)));
const relShown = (rel, text) => relIslands(text).some((a) => { try { return sameRel(a, rel); } catch { return false; } });
const exprShown = (e, text) => islands(text).some((i) => { try { return sameFnMulti(texToAscii(i), e); } catch { return false; } });
const envShown = (env, text) => Object.entries(env).every(([k, v]) => islands(text).some((i) => { try { const m = new RegExp(`^${k}=(.+)$`).exec(texToAscii(i)); return !!m && dq(m[1].replace(/^\((.*)\)$/, '$1')).eq(dq(String(v))); } catch { return false; } }));
const setOfIslands = (t) => islands(t).map((i) => D(dq(texToAscii(i))));

export function audit(bank) {
  const problems = []; const P_ = (key, msg) => problems.push(`${key} : ${msg}`);
  const dir = join(root, 'content/practice/2am/ikhtibar-musawat-mutabayina');
  const sheets = {};
  for (const lv of readdirSync(dir)) for (const f of readdirSync(join(dir, lv))) { const ex = JSON.parse(readFileSync(join(dir, lv, f), 'utf8')); sheets[ex.id] = ex; }
  const miscs = JSON.parse(readFileSync(join(root, 'content/practice/misconceptions.json'), 'utf8'));
  const extraction = JSON.parse(readFileSync(join(root, 'docs/sources/2am/unit4/extraction.json'), 'utf8'));
  const usedTags = new Set(); let firstOfThree = 0; let threeOpt = 0;
  for (const { key, q } of bank) {
    const id = sheetOf(key); const sh = sheets[id]; const S = SPEC[key];
    if (!S) { P_(key, 'aucune spec'); continue; }
    if (!sh) { P_(key, 'feuille introuvable'); continue; }
    let j; try { j = judge(S); } catch (err) { P_(key, `jugement impossible : ${err.message}`); continue; }
    for (const m of j.problems) P_(key, m);
    const qtext = q.statement; const ctx = `${sh.statement.content} ${q.statement}`;
    /* الكفاءة : la règle propre à chaque type */
    const lpWant = ['verdict', 'pick', 'count', 'cases', 'which'].includes(S.t) ? (relOf(S.rel).rel === '=' ? 1 : 3) : ['ident', 'counter', 'claim', 'distrib'].includes(S.t) ? 2 : S.lp;
    if (S.t === 'which' && relOf(S.rel).rel === '=') P_(key, '« quelles valeurs » est réservé aux inégalités');
    if (q.learningPoints?.[0]?.code !== LP(lpWant)) P_(key, `code de la كفاءة ${q.learningPoints?.[0]?.code} ≠ ${LP(lpWant)}`);
    if ((S.t === 'static') !== (q.counted === false)) P_(key, '`counted: false` réservé aux questions de compréhension (ce que représentent les lettres) ; la question sur le mot « mathématique » (concept) est comptée');
    const tagOf = (t) => { if (!ALL_TAGS.includes(t)) P_(key, `balise ${t} inconnue`); usedTags.add(t); if (!miscs[MISC(t)]) P_(key, `${MISC(t)} absent de misconceptions.json`); return MISC(t); };

    if (S.t === 'eval' || S.t === 'count') {
      if (q.answerType !== 'rational') P_(key, 'une valeur est `rational`');
      const want = S.t === 'eval' ? D(j.info.key) : String(j.info.n);
      if (q.expectedAnswer !== want) P_(key, `l'oracle trouve ${want}, la feuille ${q.expectedAnswer}`);
      if (q.solution?.result !== want.replace('.', '{,}')) P_(key, `résultat du corrigé ${q.solution?.result}`);
    } else {
      if (q.answerType !== 'choice') P_(key, 'un QCM est `choice`');
      if (S.t === 'verdict' || S.t === 'ident' || S.t === 'claim') {
        if (q.choices.length !== 2) P_(key, 'oui / non : deux choix');
        for (const w of ['yes', 'no']) { const i = S.order.indexOf(w); const c = q.choices[i]; if (c?.content !== (w === 'yes' ? 'نعم' : 'لا')) P_(key, `ordre des choix ${w}`); }
      }
    }
    if (S.t === 'eval') {
      if (!envShown(S.env, qtext)) P_(key, 'les valeurs données ne sont pas dans l\'énoncé');
      if (!exprShown(S.e, qtext)) P_(key, `l'expression « ${S.e} » n'est pas dans l'énoncé`);
      const have = (q.misconceptionSignatures ?? []).map((x) => `${x.value}|${x.id}`).sort(); const want = j.info.sigs.map(([v, i]) => `${v}|${i}`).sort();
      if (JSON.stringify(have) !== JSON.stringify(want)) P_(key, `signatures ${have.join(' ; ')} ≠ attendues ${want.join(' ; ')}`);
      for (const t of S.sigs) tagOf(t);
      // le corrigé : « expression substituée = valeur » vaut la clé
      const first = islands(q.solution?.lines?.[0] ?? '')[0] ?? ''; const parts = texToAscii(first).split('=');
      try { if (parts.length !== 2 || !ev(parse(parts[0]), {}).eq(j.info.key) || !dq(parts[1]).eq(j.info.key)) P_(key, `le calcul du corrigé « ${first} » ne vaut pas ${D(j.info.key)}`); } catch (err) { P_(key, `calcul du corrigé illisible : ${err.message}`); }
    }
    if (S.t === 'verdict') {
      if (!relShown(S.rel, qtext)) P_(key, `la relation « ${S.rel} » n'est pas dans l'énoncé`);
      if (!envShown(S.env, qtext)) P_(key, 'les valeurs données ne sont pas dans l\'énoncé');
      for (const w of ['yes', 'no']) { const c = q.choices[S.order.indexOf(w)]; if (c?.isCorrect !== (j.info.yes === (w === 'yes'))) P_(key, `choix « ${w} » : isCorrect`); }
      // corrigé : les deux membres chiffrés valent ceux de l'oracle (les membres sans lettre sont écrits en nombre seul)
      const ls = q.solution?.lines ?? [];
      for (const [i, want] of [[0, j.info.a], [1, j.info.b]]) {
        const isl0 = islands(ls[i] ?? '')[0] ?? ''; const a = texToAscii(isl0).split('=');
        try { const got = dq(a[a.length - 1]); if (!got.eq(want)) P_(key, `membre ${i + 1} du corrigé : ${D(got)} ≠ ${D(want)}`); if (a.length === 2 && !ev(parse(a[0]), {}).eq(want)) P_(key, `membre ${i + 1} du corrigé : « ${isl0} » mal calculé`); } catch (err) { P_(key, `membre ${i + 1} du corrigé illisible : ${err.message}`); }
      }
    }
    if (S.t === 'pick') {
      if (!relShown(S.rel, qtext)) P_(key, `la relation « ${S.rel} » n'est pas dans l'énoncé`);
      for (const o of S.opts) {
        const c = q.choices.find((x) => x.id === o.id); if (!c) { P_(key, `choix ${o.id} absent`); continue; }
        if (c.isCorrect !== (j.answer?.choiceId === o.id)) P_(key, `choix ${o.id} : isCorrect ${c.isCorrect}, l'oracle ${j.answer?.choiceId === o.id}`);
        if ((c.misconceptionId ?? undefined) !== (o.tag ? tagOf(o.tag) : undefined)) P_(key, `choix ${o.id} : misconceptionId ${c.misconceptionId} ≠ ${o.tag}`);
        const vs = Object.values(o.env).map((v) => D(dq(String(v))));
        const got = islands(c.content)[0] ? islands(c.content)[0].replace(/[()]/g, '').split(';').map((z) => D(dq(texToAscii(z)))) : [];
        if (!sameList(got, vs)) P_(key, `choix ${o.id} : « ${c.content} » ≠ ${vs.join(';')}`);
      }
      for (const [i, c] of q.choices.entries()) { if (!S.opts.find((o) => o.id === c.id)) P_(key, `choix ${c.id} sans spec`); if (i > 5) P_(key, 'trop de choix'); }
      if (S.opts.length === 3) { threeOpt++; if (q.choices[0].isCorrect) firstOfThree++; }
    }
    if (S.t === 'which') {
      if (!relShown(S.rel, qtext)) P_(key, `la relation « ${S.rel} » n'est pas dans l'énoncé`);
      const given = [...islands(qtext)].map(texToAscii); for (const v of S.cands) if (!given.some((g) => /^-?\d+(\.\d+)?$/.test(g) && dq(g).eq(dq(String(v))))) P_(key, `la valeur ${v} n'est pas dans l'énoncé`);
      for (const o of S.opts) {
        const c = q.choices.find((x) => x.id === o.id); if (!c) { P_(key, `choix ${o.id} absent`); continue; }
        if (c.isCorrect !== (j.answer?.choiceId === o.id)) P_(key, `choix ${o.id} : isCorrect`);
        if ((c.misconceptionId ?? undefined) !== (o.tag ? tagOf(o.tag) : undefined)) P_(key, `choix ${o.id} : misconceptionId ${c.misconceptionId} ≠ ${o.tag}`);
        const shown = setOfIslands(c.content); if (!sameList(shown, keyDs(o.set))) P_(key, `choix ${o.id} : « ${c.content} » ≠ ${keyDs(o.set).join(',')}`);
        if (o.set.length === 0 && !/لا قيمة/.test(c.content)) P_(key, `choix ${o.id} : ensemble vide mal écrit`);
        if (o.set.length === 1 && !/فقط/.test(c.content)) P_(key, `choix ${o.id} : « فقط » attendu`);
      }
      if (S.opts.length === 3) { threeOpt++; if (q.choices[0].isCorrect) firstOfThree++; }
    }
    if (S.t === 'count') {
      if (!relShown(S.rel, qtext)) P_(key, `la relation « ${S.rel} » n'est pas dans l'énoncé`);
      const flat = islands(qtext).flatMap((i) => (i.startsWith('(') ? [texToAscii(i).slice(1, -1).split(';')] : [])).filter((p) => p.every((z) => /^-?\d+(\.\d+)?$/.test(z))).map((p) => p.map((z) => D(dq(z)))); const cs = S.cands.map((c) => Object.values(c).map((v) => D(dq(String(v)))));
      if (Object.keys(S.cands[0]).length === 2) { if (!sameList(flat, cs)) P_(key, 'les couples de l\'énoncé ≠ ceux de la spec'); } else { const given = islands(qtext).map(texToAscii).filter((g) => /^-?\d+(\.\d+)?$/.test(g)).map((g) => D(dq(g))); if (!sameList(given, cs.map((c) => c[0]))) P_(key, 'les valeurs de l\'énoncé ≠ celles de la spec'); }
    }
    if (S.t === 'ident' || S.t === 'counter' || S.t === 'claim' || S.t === 'distrib') {
      if (!exprShown(S.a, qtext)) P_(key, `l'expression « ${S.a} » n'est pas dans l'énoncé`);
      if (S.b && !exprShown(S.b, qtext)) P_(key, `l'expression « ${S.b} » n'est pas dans l'énoncé`);
    }
    if (S.t === 'ident') for (const w of ['yes', 'no']) { const c = q.choices[S.order.indexOf(w)]; if (c?.isCorrect !== (j.info.yes === (w === 'yes'))) P_(key, `choix « ${w} » : isCorrect`); }
    if (S.t === 'claim') {
      if (!envShown({ [S.letter]: S.v }, qtext)) P_(key, 'la valeur citée n\'est pas dans l\'énoncé');
      for (const w of ['yes', 'no']) { const c = q.choices[S.order.indexOf(w)]; if (c?.isCorrect !== (w === 'no')) P_(key, `choix « ${w} » : isCorrect`); if ((c?.misconceptionId ?? undefined) !== (w === 'yes' ? tagOf('ONEVALUE') : undefined)) P_(key, `choix « ${w} » : misconceptionId`); }
    }
    if (S.t === 'counter') {
      for (const o of S.opts) {
        const c = q.choices.find((x) => x.id === o.id); if (!c) { P_(key, `choix ${o.id} absent`); continue; }
        if (c.isCorrect !== (j.answer?.choiceId === o.id)) P_(key, `choix ${o.id} : isCorrect`);
        if (c.misconceptionId) P_(key, `choix ${o.id} : pas de balise attendue`);
        if (!sameList(setOfIslands(c.content), keyDs([o.v]))) P_(key, `choix ${o.id} : « ${c.content} » ≠ ${o.v}`);
      }
    }
    if (S.t === 'distrib') {
      for (const o of S.opts) {
        const c = q.choices.find((x) => x.id === o.id); if (!c) { P_(key, `choix ${o.id} absent`); continue; }
        if (c.isCorrect !== (j.answer?.choiceId === o.id)) P_(key, `choix ${o.id} : isCorrect`);
        try { if (!sameFn(texToAscii(islands(c.content)[0]), o.e, S.letter)) P_(key, `choix ${o.id} : « ${c.content} » ≠ ${o.e}`); } catch { P_(key, `choix ${o.id} illisible`); }
      }
    }
    if (S.t === 'static' || S.t === 'concept') {
      for (const o of S.opts) {
        const c = q.choices.find((x) => x.id === o.id); if (!c) { P_(key, `choix ${o.id} absent`); continue; }
        if (c.isCorrect !== !!o.ok) P_(key, `choix ${o.id} : isCorrect`);
        if ((c.misconceptionId ?? undefined) !== (o.tag ? tagOf(o.tag) : undefined)) P_(key, `choix ${o.id} : misconceptionId`);
      }
    }
    if (S.t === 'cases') {
      if (!relShown(S.rel, ctx)) P_(key, `la relation « ${S.rel} » n'est pas dans l'énoncé`);
      for (const c of S.cases) if (!envShown(c, qtext)) P_(key, `le cas ${JSON.stringify(c)} n'est pas dans l'énoncé`);
      for (const o of S.opts) {
        const c = q.choices.find((x) => x.id === o.id); if (!c) { P_(key, `choix ${o.id} absent`); continue; }
        if (c.isCorrect !== (j.answer?.choiceId === o.id)) P_(key, `choix ${o.id} : isCorrect`);
        if ((c.misconceptionId ?? undefined) !== (o.tag ? tagOf(o.tag) : undefined)) P_(key, `choix ${o.id} : misconceptionId ${c.misconceptionId} ≠ ${o.tag}`);
        const shown = islands(c.content).map(Number).map((n) => n - 1);
        const want = /لا في أيّ/.test(c.content) ? [] : /كلّها|معا/.test(c.content) ? S.cases.map((_, i) => i) : shown;
        if (!sameList(want, o.set)) P_(key, `choix ${o.id} : « ${c.content} » ≠ cas ${o.set.map((i) => i + 1).join(',')}`);
      }
    }
    if (S.t === 'verdict' || S.t === 'pick' || S.t === 'which' || S.t === 'count' || S.t === 'cases') {
      /* chaque relation de la spec porte au plus 2 lettres de {x, y, n} */
      const ls = new Set([...letters(parse(relOf(S.rel).L)), ...letters(parse(relOf(S.rel).R))]); for (const l of ls) if (!'xyn'.includes(l)) P_(key, `lettre ${l}`);
    }
    if ((q.hints ?? []).length !== 3) P_(key, '3 indices attendus');
    /* --- texte : bidi, unités, mots interdits, manuel --- */
    const strings = [['énoncé', q.statement], ['feedback.correct', q.feedback?.correct], ['feedback.incorrect', q.feedback?.incorrect], ...(q.hints ?? []).map((h) => ['indice', h.content]), ...(q.choices ?? []).map((c) => ['choix', c.content]), ...(q.solution?.lines ?? []).map((l) => ['corrigé', l])];
    for (const [w, t] of strings) {
      if (FORBIDDEN.test(String(t))) P_(key, `${w} : texte interdit`);
      const o = outside(t);
      if (/\d/.test(o)) P_(key, `${w} : chiffre hors $…$`);
      if (/[A-Za-z]/.test(o)) P_(key, `${w} : lettre latine hors $…$ (« ${o.trim().slice(0, 40)} »)`);
      if (/[<>=≤≥]/.test(o)) P_(key, `${w} : symbole de relation hors $…$`);
      for (const i of islands(t)) {
        if (/\\mathrm\{[^}]*\}/.test(i) && !/\d\\,\\mathrm/.test(i)) P_(key, `${w} : unité sans « valeur\\,\\mathrm » dans $${i}$`);
        if (/(?:kg|cm|km|dm)/.test(i.replace(/\\mathrm\{[^}]*\}/g, ''))) P_(key, `${w} : unité nue dans $${i}$`);
      }
    }
  }
  if (threeOpt > 0 && firstOfThree > threeOpt * 0.5) P_('banc', `la bonne option est la première dans ${firstOfThree} / ${threeOpt} QCM à trois choix`);
  for (const t of ALL_TAGS) if (!usedTags.has(t) && bank.length > 100) problems.push(`balise ${t} jamais utilisée`);
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
    for (const t of [ex.metadata.title, ...(ex.metadata.tags ?? []), ex.statement.content]) if (t && FORBIDDEN.test(t)) problems.push(`${id} : texte interdit dans « ${String(t).slice(0, 50)} »`);
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
        if (extraction.destinations[pv.el]?.lesson !== 'ikhtibar-musawat-mutabayina') problems.push(`${id} : ${pv.el} n'a pas cette leçon pour destination`);
        if (s.page !== el.page || (s.number ?? null) !== (el.number ?? null) || s.section !== el.section) problems.push(`${id} : page / numéro / section de ${pv.el} ≠ extraction`);
      }
      if (ex.metadata.exam.kind !== 'adapted' || ex.metadata.exam.badge !== null) problems.push(`${id} : adapted sans badge`);
    }
  }
  if (seenEl.size !== 6) problems.push(`éléments adaptés cités : ${[...seenEl].join(',')}`);
  return problems;
}
