// Oracle du banc « adad-natiq » (العدد الناطق, 3AM unité 2, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec des rationnels EXACTS en BigInt (pgcd propre) écrits dans
// ce fichier, indépendants de packages/core ; les nombres de l'énoncé sont retapés en littéraux (« -9/12 », « 2.4 ») :
//  - ADD / SUB / MUL / DIV : l'expression de l'énoncé (un rationnel est toujours normalisé : dénominateur > 0, réduit) ;
//    A(x) = la clé « constructed » en écriture normalisée ;
//  - EQ / LT / GT / BETWEEN / SORTED / MIN / MAX / ABS / COUNTDISTINCT : prédicats et choix ; un QCM est jugé option par option :
//    chaque option est une AFFIRMATION évaluée par un calcul (booléen), PICK exige qu'UNE seule soit vraie (donc tout distracteur
//    est FAUX), PICKS rend l'ensemble des options vraies (QCM à plusieurs bonnes réponses) ;
//  - ISDEC : « est-il décimal ? » par le test 2^i·5^j du dénominateur réduit ; ISRAT / ISINT / ISNAT : l'appartenance ;
//    APPROXDOWN(x, k) : la valeur approchée PAR DÉFAUT (vers −∞) à 10^−k, recalculée par division entière ;
//  - audit(bank) : RE-LIT l'énoncé et les options (LaTeX) avec son propre analyseur d'expressions : toute « écriture avec un
//    dénominateur positif » (« بمقام موجب وعلى أبسط شكل ») est normalisée et doit valoir la clé ; tout « بمقام N : ما بسط … »
//    est recalculé ; toute chaîne « a < b < c » ou « a = b » d'une option est évaluée ; « بين أيّ عددين صحيحين متتاليين » et
//    « ما إشارة » et « هل … عشري » sont rejugés ; chaque QCM a la bonne option marquée et une seule (QCM simple) ; les clés sont
//    réduites ; chaque distracteur COMPTÉ porte un MISC-NATIQ-* ; chaque signature est fausse.
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
  eq(o) { return this.n === o.n && this.d === o.d; }
  lt(o) { return this.n * o.d < o.n * this.d; }
  sign() { return this.n > 0n ? 1 : this.n < 0n ? -1 : 0; }
  abs() { return new Q(this.n < 0n ? -this.n : this.n, this.d); }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
/** « 3/4 », « -12 », « 7 », « 2.4 », « -3.6 » → Q (littéral exact, jamais de flottant). */
const q = (v) => {
  if (v instanceof Q) return v;
  const s = String(v).trim().replace(',', '.');
  if (s.includes('/')) { const [a, b] = s.split('/'); return q(a).div(q(b)); }
  if (s.includes('.')) {
    const neg = s.startsWith('-'); const [i, f] = s.replace('-', '').split('.');
    const r = new Q(BigInt(i + f), 10n ** BigInt(f.length)); return neg ? new Q(-r.n, r.d) : r;
  }
  return new Q(BigInt(s));
};
const ADD = (a, b) => q(a).add(q(b));
const SUB = (a, b) => q(a).sub(q(b));
const MUL = (a, b) => q(a).mul(q(b));
const DIV = (a, b) => q(a).div(q(b));
const EQ = (a, b) => q(a).eq(q(b));
const LT = (a, b) => q(a).lt(q(b));
const GT = (a, b) => q(b).lt(q(a));
const NOT = (b) => !b;
const ALL = (list) => list.every(Boolean);
const ABS = (a) => q(a).abs();
const MIN = (list) => list.map(q).reduce((m, x) => (x.lt(m) ? x : m));
const MAX = (list) => list.map(q).reduce((m, x) => (m.lt(x) ? x : m));
const SORTED = (list) => { const l = list.map(q); return l.every((x, i) => i === 0 || l[i - 1].lt(x)); };
const BETWEEN = (x, lo, hi) => q(lo).lt(q(x)) && q(x).lt(q(hi));
const SIGN = (x, s) => q(x).sign() === s;
const COUNTDISTINCT = (list) => new Q(BigInt(new Set(list.map((x) => q(x).toString())).size));
/** Le dénominateur réduit n'a que les facteurs 2 et 5 : test 2^i·5^j. */
const ISDEC = (x) => { let d = q(x).d; while (d % 2n === 0n) d /= 2n; while (d % 5n === 0n) d /= 5n; return d === 1n; };
const ISRAT = (x) => q(x).d >= 1n;            // a/b avec b ≠ 0 (q() lève sinon)
const ISINT = (x) => q(x).d === 1n;
const ISNAT = (x) => q(x).d === 1n && q(x).n >= 0n;
/** Valeur approchée PAR DÉFAUT à 10^-k (le plus grand multiple de 10^-k qui ne dépasse pas x). */
const APPROXDOWN = (x, k) => {
  const v = q(x); const p = 10n ** BigInt(k);
  let fl = (v.n * p) / v.d;                     // division entière : tronque vers 0
  if (v.n * p < 0n && (v.n * p) % v.d !== 0n) fl -= 1n;   // vers −∞
  return new Q(fl, p);
};
/** Une clé « constructed » : la chaîne exacte du résultat. */
const A = (x) => R(q(x).toString());
const PICK = (flags) => {
  const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`QCM : ${hits.length} options justes`);
  return C('ABCDEF'[hits[0]]);
};
const PICKS = (flags) => ({ choiceIds: flags.map((f, k) => (f ? 'ABCDEF'[k] : null)).filter(Boolean) });

/* ── Analyseur LaTeX de l'audit (indépendant du reste) ─────────────────── */
/** Valeur d'une expression LaTeX : « -\dfrac{7}{8} », « \dfrac{-7{,}2}{4{,}5} », « (-52)\div(-16) », « 5-\dfrac{3}{4} »… */
function evalExpr(src) {
  let s = src.replace(/\\left|\\right/g, '').replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  for (let guard = 0; guard < 8 && /\\dfrac/.test(s); guard++) s = s.replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))');
  if (!/^[0-9+\-*/().]+$/.test(s)) throw new Error(`expression illisible : ${src}`);
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return new Q(0n).sub(atom()); }
    if (s[i] === '+') { i++; return atom(); }
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`parenthèse : ${src}`); i++; return v; }
    let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
    if (j === i) throw new Error(`nombre attendu : ${src}`);
    const v = q(s.slice(i, j)); i = j; return v;
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const r = atom(); v = op === '*' ? v.mul(r) : v.div(r); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const r = prod(); v = op === '+' ? v.add(r) : v.sub(r); } return v; };
  const out = sum();
  if (i !== s.length) throw new Error(`expression illisible : ${src}`);
  return out;
}
/** Valeur d'une île, ou null si ce n'est pas une expression numérique (une lettre qui nomme un nombre de l'énoncé). */
const safeEval = (s) => { try { return hasLetters(s) ? null : evalExpr(s); } catch (err) { return null; } };
const islands = (s) => [...String(s).matchAll(/\$([^$]+)\$/g)].map((x) => x[1]);
const stripName = (s) => s.replace(/^\s*[A-Za-z]\s*=\s*/, '');
const hasLetters = (s) => /[a-zA-Z]/.test(s.replace(/\\dfrac|\\times|\\div|\\left|\\right|\\ldots|\\mathrm\{[^}]*\}|\\text\{[^}]*\}|\\circ|\\approx|\\le/g, ''));
/** Une chaîne « E1 rel E2 rel E3 » (rel ∈ < > =) est-elle vraie ? null si elle n'est pas lisible. */
function chainTrue(latex) {
  if (hasLetters(latex)) return null;
  const parts = latex.split(/(<|>|=)/).map((x) => x.trim()).filter((x) => x !== '');
  if (parts.length < 3 || parts.length % 2 === 0) return null;
  for (let k = 0; k + 2 < parts.length; k += 2) {
    const l = evalExpr(parts[k]), r = evalExpr(parts[k + 2]), op = parts[k + 1];
    const ok = op === '<' ? l.lt(r) : op === '>' ? r.lt(l) : l.eq(r);
    if (!ok) return false;
  }
  return true;
}
const MISC = /^MISC-NATIQ-(DROPSIGN|TWONEG|NEGPLACE|NEGORDER|WRITINGS|NOTANUMBER|NEGNOTDEC|INVERT|DECIMAL|APPROX)$/;

/** Audit de la banque (appelé par practice-answer-oracle.test.mjs) : liste des problèmes (vide = conforme). */
export function audit(bank) {
  const problems = [];
  for (const { key, q: qu } of bank) {
    const st = qu.statement;
    const isl = islands(st);
    if (qu.answerType === 'rational') {
      const e = String(qu.expectedAnswer);
      const m = /^(-?\d+)(?:\/(\d+))?$|^(-?\d+\.\d+)$/.exec(e);
      if (!m) { problems.push(`${key} : clé illisible « ${e} »`); continue; }
      if (m[2] !== undefined) {
        if (gcd(BigInt(m[1]), BigInt(m[2])) !== 1n) problems.push(`${key} : la clé ${e} n'est pas réduite`);
        if (BigInt(m[2]) <= 1n) problems.push(`${key} : clé « /1 » ou dénominateur non positif`);
      }
      for (const s of qu.misconceptionSignatures ?? []) {
        if (!MISC.test(s.id)) problems.push(`${key} : signature ${s.id} hors MISC-NATIQ-*`);
        if (q(s.value).eq(q(e))) problems.push(`${key} : la signature ${s.id} (${s.value}) est la bonne réponse`);
      }
      // « اكتب … بمقام موجب وعلى أبسط شكل » : la clé est la forme normalisée de l'écriture imprimée dans l'énoncé.
      if (/بمقام موجب/.test(st) && /أبسط شكل/.test(st) && isl.length >= 1) {
        const expr = stripName(isl[0]);
        try {
          const v = evalExpr(expr);
          if (!v.eq(q(e))) problems.push(`${key} : l'écriture « ${expr} » vaut ${v}, la clé dit ${e}`);
        } catch (err) { /* écriture non évaluable (récit) : couverte par l'oracle de la clé */ }
      }
      // « بمقام N : ما بسط … » et « اكتب … على الشكل \dfrac{x}{N} » : la clé est la valeur × N.
      const target = [...isl].reverse().find((x) => /\\dfrac\{[xy]\}\{\d+\}/.test(x));
      if (target && !/=\s*\\dfrac\{[xy]\}/.test(isl[0]) ) {
        const N = BigInt(/\\dfrac\{[xy]\}\{(\d+)\}/.exec(target)[1]);
        try { const v = evalExpr(stripName(isl[0])); if (!v.mul(new Q(N)).eq(q(e))) problems.push(`${key} : ${isl[0]} × ${N} vaut ${v.mul(new Q(N))}, la clé dit ${e}`); } catch (err) { /* hors forme */ }
      }
      // « \dfrac{a}{b} = \dfrac{x}{N} » (bras gauche et droit dans la même île).
      const eqx = isl.find((x) => /=\s*\\dfrac\{x\}\{\d+\}\s*$/.test(x));
      if (eqx) {
        const [lhs, rhs] = eqx.split('=');
        const N = BigInt(/\\dfrac\{x\}\{(\d+)\}/.exec(rhs)[1]);
        try { const v = evalExpr(lhs); if (!v.mul(new Q(N)).eq(q(e))) problems.push(`${key} : ${lhs} × ${N} vaut ${v.mul(new Q(N))}, la clé dit ${e}`); } catch (err) { problems.push(`${key} : ${err.message}`); }
      }
    } else if (qu.answerType === 'choice' || qu.answerType === 'multiChoice') {
      const good = qu.choices.filter((c) => c.isCorrect);
      if (qu.answerType === 'choice' && good.length !== 1) problems.push(`${key} : ${good.length} bonnes options`);
      if (qu.answerType === 'multiChoice' && good.length < 1) problems.push(`${key} : aucune bonne option`);
      for (const c of qu.choices.filter((x) => !x.isCorrect && qu.counted !== false)) {
        if (!c.misconceptionId || !MISC.test(c.misconceptionId)) problems.push(`${key} : le distracteur ${c.id} ne porte pas de MISC-NATIQ-*`);
      }
      const mark = (verdicts, what) => {
        qu.choices.forEach((c, k) => { if (verdicts[k] !== null && verdicts[k] !== c.isCorrect) problems.push(`${key} : (${what}) l'option ${c.id} est ${verdicts[k] ? 'vraie' : 'fausse'} à la relecture mais marquée ${c.isCorrect ? 'correcte' : 'incorrecte'}`); });
      };
      // 1. options = chaînes numériques « a < b < c », « a = b » : jugées une à une.
      try {
        const judged = qu.choices.map((c) => { const o = islands(c.content); return o.length === 1 && /(<|>|=)/.test(o[0]) ? chainTrue(o[0]) : null; });
        if (judged.every((j) => j !== null)) {
          mark(judged, 'chaîne');
          if (qu.answerType === 'choice' && judged.filter(Boolean).length !== 1) problems.push(`${key} : ${judged.filter(Boolean).length} options vraies à la relecture`);
        }
        // 2. « بين أيّ عددين صحيحين متتاليين يقع العدد X ؟ » : options « lo و hi ».
        if (/بين أيّ عددين صحيحين متتاليين يقع/.test(st) && isl.length >= 1 && qu.choices.every((c) => islands(c.content).length === 2)) {
          const x = safeEval(isl[0]);
          if (x) mark(qu.choices.map((c) => { const [lo, hi] = islands(c.content).map((t) => evalExpr(t)); return hi.eq(lo.add(new Q(1n))) && lo.lt(x) && x.lt(hi); }), 'intervalle');
        }
        // 3. « ما إشارة العدد X ؟ » : موجب / سالب.
        if (/ما إشارة العدد/.test(st) && isl.length >= 1) {
          const x = safeEval(isl[0]);
          if (x) mark(qu.choices.map((c) => (/^موجب$/.test(c.content) ? x.sign() > 0 : /^سالب$/.test(c.content) ? x.sign() < 0 : null)), 'signe');
        }
        // 4. « هل العدد X عشري ؟ » : نعم / لا par le test 2^i·5^j.
        if (/^هل العدد \$.+\$ عشري/.test(st) && isl.length >= 1) {
          const x = safeEval(isl[0]);
          if (x) { const dec = ISDEC(x); mark(qu.choices.map((c) => (/^نعم/.test(c.content) ? dec : /^لا/.test(c.content) ? !dec : null)), 'décimal'); }
        }
      } catch (err) { problems.push(`${key} : ${err.message}`); }
    }
  }
  return problems;
}

export const ORACLE = {
  // ex-3am-adad-natiq-l1-001
  'ex-3am-adad-natiq-l1-001:q1': A(DIV('10','-25')),
  'ex-3am-adad-natiq-l1-001:q2': A(DIV('-30','-18')),
  'ex-3am-adad-natiq-l1-001:q3': A(DIV('-36','15')),
  'ex-3am-adad-natiq-l1-001:q4': A(DIV('21','-24')),
  // ex-3am-adad-natiq-l1-002
  'ex-3am-adad-natiq-l1-002:q1': PICK([SIGN(DIV('-14','-35'),1),SIGN(DIV('-14','-35'),-1)]),
  'ex-3am-adad-natiq-l1-002:q2': PICK([SIGN(DIV('28','-36'),1),SIGN(DIV('28','-36'),-1)]),
  'ex-3am-adad-natiq-l1-002:q3': PICK([SIGN(DIV('-48','18'),1),SIGN(DIV('-48','18'),-1)]),
  'ex-3am-adad-natiq-l1-002:q4': A(DIV('28','-36')),
  // ex-3am-adad-natiq-l1-003
  'ex-3am-adad-natiq-l1-003:q1': PICK([ISRAT(DIV('-5','7')),NOT(ISRAT(DIV('-5','7'))),NOT(ISRAT(DIV('-5','7')))]),
  'ex-3am-adad-natiq-l1-003:q2': PICK([ISRAT('-4'),NOT(ISRAT('-4')),NOT(ISRAT('-4'))]),
  'ex-3am-adad-natiq-l1-003:q3': PICK([ISRAT('0.35'),NOT(ISRAT('0.35')),NOT(ISRAT('0.35'))]),
  'ex-3am-adad-natiq-l1-003:q4': PICK([ISRAT(DIV('8','15')),NOT(ISRAT(DIV('8','15'))),NOT(ISRAT(DIV('8','15')))]),
  // ex-3am-adad-natiq-l1-004
  'ex-3am-adad-natiq-l1-004:q1': PICK([ISDEC(DIV('-13','25')),NOT(ISDEC(DIV('-13','25')))]),
  'ex-3am-adad-natiq-l1-004:q2': PICK([ISRAT(DIV('-13','25')),NOT(ISRAT(DIV('-13','25')))]),
  'ex-3am-adad-natiq-l1-004:q3': PICK([ISDEC(DIV('6','15')),NOT(ISDEC(DIV('6','15')))]),
  'ex-3am-adad-natiq-l1-004:q4': PICK([ISRAT(DIV('6','15')),NOT(ISRAT(DIV('6','15')))]),
  'ex-3am-adad-natiq-l1-004:q5': PICK([ISDEC(DIV('7','18')),NOT(ISDEC(DIV('7','18')))]),
  'ex-3am-adad-natiq-l1-004:q6': PICK([ISRAT(DIV('7','18')),NOT(ISRAT(DIV('7','18')))]),
  // ex-3am-adad-natiq-l1-005
  'ex-3am-adad-natiq-l1-005:q1': PICKS([EQ(DIV('12','-20'),DIV('-12','20')),EQ('-3/5',DIV('-12','20')),EQ(DIV('3','-5'),DIV('-12','20')),EQ(DIV('3','5'),DIV('-12','20')),EQ(DIV('-20','12'),DIV('-12','20')),EQ(DIV('-12','-20'),DIV('-12','20'))]),
  'ex-3am-adad-natiq-l1-005:q2': A(MUL(DIV('-12','20'),'5')),
  'ex-3am-adad-natiq-l1-005:q3': PICK([true,false,false]),
  // ex-3am-adad-natiq-l1-006
  'ex-3am-adad-natiq-l1-006:q1': A(DIV('2.4','-6')),
  'ex-3am-adad-natiq-l1-006:q2': A(DIV('-4.5','-7.5')),
  'ex-3am-adad-natiq-l1-006:q3': A('-1.25'),
  'ex-3am-adad-natiq-l1-006:q4': A(DIV('3.6','-0.8')),
  // ex-3am-adad-natiq-l1-007
  'ex-3am-adad-natiq-l1-007:q1': A(MUL('-6','4')),
  'ex-3am-adad-natiq-l1-007:q2': A(MUL('2.8','5')),
  'ex-3am-adad-natiq-l1-007:q3': PICKS([ISNAT(DIV('12','-4')),ISINT(DIV('12','-4')),ISDEC(DIV('12','-4')),ISRAT(DIV('12','-4')),NOT(ISRAT(DIV('12','-4')))]),
  // ex-3am-adad-natiq-l1-008
  'ex-3am-adad-natiq-l1-008:q1': PICK([BETWEEN(DIV('-23','9'),'-3','-2'),BETWEEN(DIV('-23','9'),'-2','-1'),BETWEEN(DIV('-23','9'),'2','3')]),
  'ex-3am-adad-natiq-l1-008:q2': PICK([BETWEEN(DIV('-31','9'),'-4','-3'),BETWEEN(DIV('-31','9'),'-3','-2'),BETWEEN(DIV('-31','9'),'3','4')]),
  'ex-3am-adad-natiq-l1-008:q3': PICK([BETWEEN(DIV('-10','7'),'-2','-1'),BETWEEN(DIV('-10','7'),'-1','0'),BETWEEN(DIV('-10','7'),'1','2')]),
  'ex-3am-adad-natiq-l1-008:q4': A('-3'),
  // ex-3am-adad-natiq-l1-009
  'ex-3am-adad-natiq-l1-009:q1': PICKS([SIGN(DIV('-9','-15'),-1),SIGN(DIV('-6.4','5'),-1),SIGN(DIV('3','-7'),-1),SIGN(DIV('-1.8','-4.5'),-1),SIGN(DIV('12','-0.5'),-1)]),
  'ex-3am-adad-natiq-l1-009:q2': PICK([SIGN(DIV('2.4','-1.05'),1),SIGN(DIV('2.4','-1.05'),-1)]),
  'ex-3am-adad-natiq-l1-009:q3': A(DIV('-1.8','-4.5')),
  // ex-3am-adad-natiq-l1-010
  'ex-3am-adad-natiq-l1-010:q1': PICK([EQ('3.615',APPROXDOWN(DIV('47','13'),3)),EQ('3.616',APPROXDOWN(DIV('47','13'),3)),EQ('3.6153',APPROXDOWN(DIV('47','13'),3))]),
  'ex-3am-adad-natiq-l1-010:q2': A(APPROXDOWN(DIV('29','7'),2)),
  'ex-3am-adad-natiq-l1-010:q3': PICK([ALL([ISRAT(DIV('47','13')),NOT(ISDEC(DIV('47','13')))]),ALL([ISRAT(DIV('47','13')),ISDEC(DIV('47','13'))]),NOT(ISRAT(DIV('47','13')))]),
  // ex-3am-adad-natiq-l2-001
  'ex-3am-adad-natiq-l2-001:q1': A(SUB(DIV('-5','8'),DIV('1','4'))),
  'ex-3am-adad-natiq-l2-001:q2': A(SUB(DIV('-5','9'),DIV('1','18'))),
  'ex-3am-adad-natiq-l2-001:q3': A(MUL(SUB(DIV('-5','8'),DIV('1','4')),'72')),
  'ex-3am-adad-natiq-l2-001:q4': A(MUL(SUB(DIV('-5','9'),DIV('1','18')),'72')),
  'ex-3am-adad-natiq-l2-001:q5': PICK([LT(SUB(DIV('-5','8'),DIV('1','4')),SUB(DIV('-5','9'),DIV('1','18'))),LT(SUB(DIV('-5','9'),DIV('1','18')),SUB(DIV('-5','8'),DIV('1','4'))),EQ(SUB(DIV('-5','8'),DIV('1','4')),SUB(DIV('-5','9'),DIV('1','18')))]),
  // ex-3am-adad-natiq-l2-002
  'ex-3am-adad-natiq-l2-002:q1': A(MUL(DIV('-8','9'),'36')),
  'ex-3am-adad-natiq-l2-002:q2': A(MUL(DIV('-11','12'),'36')),
  'ex-3am-adad-natiq-l2-002:q3': PICK([LT(DIV('-11','12'),DIV('-8','9')),LT(DIV('-8','9'),DIV('-11','12')),EQ(DIV('-8','9'),DIV('-11','12'))]),
  // ex-3am-adad-natiq-l2-003
  'ex-3am-adad-natiq-l2-003:q1': PICK([SIGN(DIV('-16','-28'),-1),SIGN(DIV('-16','-28'),1)]),
  'ex-3am-adad-natiq-l2-003:q3': A(DIV('-16','-28')),
  'ex-3am-adad-natiq-l2-003:q4': PICK([LT(DIV('16','-28'),DIV('-16','-28')),LT(DIV('-16','-28'),DIV('16','-28')),EQ(DIV('-16','-28'),DIV('16','-28'))]),
  // ex-3am-adad-natiq-l2-004
  'ex-3am-adad-natiq-l2-004:q1': A(DIV('-24','42')),
  'ex-3am-adad-natiq-l2-004:q2': A(DIV('20','-35')),
  'ex-3am-adad-natiq-l2-004:q3': PICK([EQ(DIV('-24','42'),DIV('20','-35')),NOT(EQ(DIV('-24','42'),DIV('20','-35'))),NOT(EQ(DIV('-24','42'),DIV('20','-35')))]),
  // ex-3am-adad-natiq-l2-005
  'ex-3am-adad-natiq-l2-005:q1': A(MUL(DIV('-7','9'),'18')),
  'ex-3am-adad-natiq-l2-005:q2': A(MUL(DIV('-4','9'),'18')),
  'ex-3am-adad-natiq-l2-005:q3': PICK([BETWEEN(DIV('-5','9'),DIV('-7','9'),DIV('-4','9')),BETWEEN(DIV('-8','9'),DIV('-7','9'),DIV('-4','9')),BETWEEN(DIV('5','9'),DIV('-7','9'),DIV('-4','9')),BETWEEN(DIV('-10','9'),DIV('-7','9'),DIV('-4','9'))]),
  // ex-3am-adad-natiq-l2-006
  'ex-3am-adad-natiq-l2-006:q1': A(MUL(DIV('-5','7'),'63')),
  'ex-3am-adad-natiq-l2-006:q2': A(MUL(DIV('-5','9'),'63')),
  'ex-3am-adad-natiq-l2-006:q3': PICK([LT(DIV('-5','9'),DIV('-5','7')),LT(DIV('-5','7'),DIV('-5','9')),EQ(DIV('-5','7'),DIV('-5','9'))]),
  // ex-3am-adad-natiq-l2-007
  'ex-3am-adad-natiq-l2-007:q1': PICK([EQ(DIV('-7.2','4.5'),DIV('4.2','-3.5')),LT(DIV('-7.2','4.5'),DIV('4.2','-3.5')),LT(DIV('4.2','-3.5'),DIV('-7.2','4.5'))]),
  'ex-3am-adad-natiq-l2-007:q2': A(DIV('-7.2','4.5')),
  'ex-3am-adad-natiq-l2-007:q3': A(DIV('4.2','-3.5')),
  // ex-3am-adad-natiq-l2-008
  'ex-3am-adad-natiq-l2-008:q1': PICKS([LT(DIV('-7','9'),DIV('-5','9')),LT(DIV('-5','9'),DIV('-2','9')),LT(DIV('-5','11'),DIV('-5','9')),LT(DIV('-5','9'),DIV('-5','7'))]),
  'ex-3am-adad-natiq-l2-008:q2': A(MUL(DIV('-5','9'),'99')),
  // ex-3am-adad-natiq-l2-009
  'ex-3am-adad-natiq-l2-009:q1': A(APPROXDOWN(DIV('7','13'),3)),
  'ex-3am-adad-natiq-l2-009:q2': A(APPROXDOWN(DIV('9','17'),3)),
  'ex-3am-adad-natiq-l2-009:q3': PICK([LT(DIV('-7','13'),DIV('-9','17')),LT(DIV('-9','17'),DIV('-7','13')),EQ(DIV('-7','13'),DIV('-9','17'))]),
  // ex-3am-adad-natiq-l2-010
  'ex-3am-adad-natiq-l2-010:q1': A(APPROXDOWN(DIV('25','7'),1)),
  'ex-3am-adad-natiq-l2-010:q2': A(APPROXDOWN(DIV('-25','7'),1)),
  'ex-3am-adad-natiq-l2-010:q3': PICK([BETWEEN(DIV('-25','7'),'-4','-3'),BETWEEN(DIV('-25','7'),'-3','-2'),BETWEEN(DIV('-25','7'),'3','4')]),
  'ex-3am-adad-natiq-l2-010:q4': PICK([ALL([ISRAT(DIV('-25','7')),NOT(ISDEC(DIV('-25','7')))]),ALL([ISRAT(DIV('-25','7')),ISDEC(DIV('-25','7'))]),NOT(ISRAT(DIV('-25','7')))]),
  // ex-3am-adad-natiq-l3-001
  'ex-3am-adad-natiq-l3-001:q1': A(DIV('15','-9')),
  'ex-3am-adad-natiq-l3-001:q2': A(DIV('-20','-12')),
  'ex-3am-adad-natiq-l3-001:q3': A(DIV('-8','6')),
  'ex-3am-adad-natiq-l3-001:q4': PICK([SORTED([DIV('15','-9'),DIV('-8','6'),DIV('-20','-12')]),SORTED([DIV('-8','6'),DIV('15','-9'),DIV('-20','-12')]),SORTED([DIV('15','-9'),DIV('-20','-12'),DIV('-8','6')])]),
  'ex-3am-adad-natiq-l3-001:q5': PICK([BETWEEN(DIV('15','-9'),'-2','-1'),BETWEEN(DIV('15','-9'),'-1','0'),BETWEEN(DIV('15','-9'),'1','2')]),
  // ex-3am-adad-natiq-l3-002
  'ex-3am-adad-natiq-l3-002:q1': A('-7/5'),
  'ex-3am-adad-natiq-l3-002:q2': A('3/5'),
  'ex-3am-adad-natiq-l3-002:q3': A('-1/5'),
  'ex-3am-adad-natiq-l3-002:q4': PICK([LT('-1/5','-7/5'),LT('-7/5','-1/5'),EQ('-7/5','-1/5')]),
  // ex-3am-adad-natiq-l3-003
  'ex-3am-adad-natiq-l3-003:q1': PICK([EQ('-5/4',DIV('10','-8')),EQ('-1/4',DIV('10','-8')),EQ('1/4',DIV('10','-8')),EQ('5/4',DIV('10','-8'))]),
  'ex-3am-adad-natiq-l3-003:q2': PICK([EQ('-5/4',DIV('-3','12')),EQ('-1/4',DIV('-3','12')),EQ('1/4',DIV('-3','12')),EQ('5/4',DIV('-3','12'))]),
  'ex-3am-adad-natiq-l3-003:q3': PICK([EQ('-5/4',DIV('5','20')),EQ('-1/4',DIV('5','20')),EQ('1/4',DIV('5','20')),EQ('5/4',DIV('5','20'))]),
  'ex-3am-adad-natiq-l3-003:q4': PICK([SORTED(['-5/4','-1/4','1/4','5/4']),SORTED(['5/4','1/4','-1/4','-5/4']),SORTED(['-1/4','1/4','-5/4','5/4'])]),
  // ex-3am-adad-natiq-l3-004
  'ex-3am-adad-natiq-l3-004:q1': A(MUL(DIV('-4','3'),'12')),
  'ex-3am-adad-natiq-l3-004:q2': A(MUL(DIV('-7','6'),'12')),
  'ex-3am-adad-natiq-l3-004:q3': PICK([SORTED([DIV('-4','3'),DIV('-7','6'),'-1',DIV('1','2'),DIV('5','4')]),SORTED([DIV('5','4'),DIV('1','2'),'-1',DIV('-7','6'),DIV('-4','3')]),SORTED([DIV('-7','6'),DIV('-4','3'),'-1',DIV('1','2'),DIV('5','4')])]),
  'ex-3am-adad-natiq-l3-004:q4': PICK([EQ(DIV('-4','3'),MIN([DIV('-7','6'),DIV('5','4'),DIV('-4','3'),DIV('1','2'),'-1'])),EQ(DIV('-7','6'),MIN([DIV('-7','6'),DIV('5','4'),DIV('-4','3'),DIV('1','2'),'-1'])),EQ('-1',MIN([DIV('-7','6'),DIV('5','4'),DIV('-4','3'),DIV('1','2'),'-1']))]),
  // ex-3am-adad-natiq-l3-005
  'ex-3am-adad-natiq-l3-005:q1': A('5'),
  'ex-3am-adad-natiq-l3-005:q2': A(SUB(MUL(DIV('31','6'),'6'),'30')),
  'ex-3am-adad-natiq-l3-005:q3': A('5'),
  'ex-3am-adad-natiq-l3-005:q4': A(SUB(MUL(DIV('38','7'),'7'),'35')),
  'ex-3am-adad-natiq-l3-005:q5': PICK([BETWEEN(DIV('38','7'),'5','6'),BETWEEN(DIV('38','7'),'4','5'),BETWEEN(DIV('38','7'),'6','7')]),
  // ex-3am-adad-natiq-l3-006
  'ex-3am-adad-natiq-l3-006:q1': A('3'),
  'ex-3am-adad-natiq-l3-006:q2': A('2'),
  'ex-3am-adad-natiq-l3-006:q3': PICKS([EQ(ADD('-3',DIV('5','8')),DIV('-19','8')),EQ(ADD('-2',DIV('-3','8')),DIV('-19','8')),EQ(ADD('-2',DIV('3','8')),DIV('-19','8')),EQ(ADD('-3',DIV('-5','8')),DIV('-19','8'))]),
  'ex-3am-adad-natiq-l3-006:q4': PICK([BETWEEN(DIV('-19','8'),'-3','-2'),BETWEEN(DIV('-19','8'),'-2','-1'),BETWEEN(DIV('-19','8'),'2','3')]),
  // ex-3am-adad-natiq-l3-007
  'ex-3am-adad-natiq-l3-007:q1': PICK([SIGN(DIV('-2.8','-8'),1),SIGN(DIV('-2.8','-8'),-1)]),
  'ex-3am-adad-natiq-l3-007:q2': A(DIV('-2.8','-8')),
  'ex-3am-adad-natiq-l3-007:q3': PICK([ISDEC(DIV('-2.8','-8')),NOT(ISDEC(DIV('-2.8','-8')))]),
  'ex-3am-adad-natiq-l3-007:q4': A(DIV('-2.8','-8')),
  // ex-3am-adad-natiq-l3-008
  'ex-3am-adad-natiq-l3-008:q1': A('-13/10'),
  'ex-3am-adad-natiq-l3-008:q2': A('7/10'),
  'ex-3am-adad-natiq-l3-008:q3': A('-3/10'),
  'ex-3am-adad-natiq-l3-008:q4': PICK([SORTED(['-13/10','-3/10','7/10']),SORTED(['-3/10','-13/10','7/10']),SORTED(['7/10','-3/10','-13/10'])]),
  // ex-3am-adad-natiq-l3-009
  'ex-3am-adad-natiq-l3-009:q1': A(MUL(DIV('-7','8'),'40')),
  'ex-3am-adad-natiq-l3-009:q2': A(MUL(DIV('7','10'),'40')),
  'ex-3am-adad-natiq-l3-009:q3': A(MUL(DIV('-4','5'),'40')),
  'ex-3am-adad-natiq-l3-009:q4': PICK([SORTED([DIV('-7','8'),DIV('-4','5'),'-0.5',DIV('2','5'),DIV('7','10')]),SORTED([DIV('7','10'),DIV('2','5'),'-0.5',DIV('-4','5'),DIV('-7','8')]),SORTED([DIV('-4','5'),DIV('-7','8'),'-0.5',DIV('2','5'),DIV('7','10')])]),
  'ex-3am-adad-natiq-l3-009:q5': PICK([EQ(DIV('7','10'),MAX([DIV('-7','8'),DIV('-4','5'),'-0.5',DIV('2','5'),DIV('7','10')])),EQ(DIV('2','5'),MAX([DIV('-7','8'),DIV('-4','5'),'-0.5',DIV('2','5'),DIV('7','10')])),EQ('-0.5',MAX([DIV('-7','8'),DIV('-4','5'),'-0.5',DIV('2','5'),DIV('7','10')]))]),
  // ex-3am-adad-natiq-l3-010
  'ex-3am-adad-natiq-l3-010:q1': A(MUL(DIV('-4','5'),'10')),
  'ex-3am-adad-natiq-l3-010:q2': A(MUL(DIV('-3','5'),'10')),
  'ex-3am-adad-natiq-l3-010:q3': PICK([BETWEEN(DIV('-7','10'),DIV('-4','5'),DIV('-3','5')),BETWEEN(DIV('-9','10'),DIV('-4','5'),DIV('-3','5')),BETWEEN(DIV('7','10'),DIV('-4','5'),DIV('-3','5')),BETWEEN(DIV('-1','2'),DIV('-4','5'),DIV('-3','5'))]),
  // ex-3am-adad-natiq-l4-001
  'ex-3am-adad-natiq-l4-001:q1': A(ADD(DIV('5','12'),DIV(DIV('6','25'),DIV('4','5')))),
  'ex-3am-adad-natiq-l4-001:q2': A(MUL(SUB(DIV('5','8'),'2'),DIV('-4','11'))),
  'ex-3am-adad-natiq-l4-001:q3': A(MUL('-20',SUB(DIV('1','4'),DIV('7','10')))),
  'ex-3am-adad-natiq-l4-001:q5': A(ADD(DIV('-7','9'),DIV(DIV('4','5'),DIV('12','-5')))),
  'ex-3am-adad-natiq-l4-001:q6': PICK([ALL([ISRAT(ADD(DIV('-7','9'),DIV(DIV('4','5'),DIV('12','-5')))),NOT(ISINT(ADD(DIV('-7','9'),DIV(DIV('4','5'),DIV('12','-5')))))]),ISINT(ADD(DIV('-7','9'),DIV(DIV('4','5'),DIV('12','-5')))),NOT(ISRAT(ADD(DIV('-7','9'),DIV(DIV('4','5'),DIV('12','-5')))))]),
  'ex-3am-adad-natiq-l4-001:q8': PICK([LT(ADD(DIV('-7','9'),DIV(DIV('4','5'),DIV('12','-5'))),'-1'),NOT(LT(ADD(DIV('-7','9'),DIV(DIV('4','5'),DIV('12','-5'))),'-1'))]),
  // ex-3am-adad-natiq-l4-002
  'ex-3am-adad-natiq-l4-002:q1': A(DIV('-10','25')),
  'ex-3am-adad-natiq-l4-002:q2': A(DIV('14','-35')),
  'ex-3am-adad-natiq-l4-002:q3': A(MUL(DIV('-10','25'),'15')),
  'ex-3am-adad-natiq-l4-002:q4': PICK([EQ(DIV('-10','25'),DIV('14','-35')),NOT(EQ(DIV('-10','25'),DIV('14','-35')))]),
  // ex-3am-adad-natiq-l4-003
  'ex-3am-adad-natiq-l4-003:q1': A(ADD(DIV('-3','5'),DIV('3','10'))),
  'ex-3am-adad-natiq-l4-003:q2': A(MUL(ADD(DIV('-3','5'),DIV('3','10')),'20')),
  'ex-3am-adad-natiq-l4-003:q3': A(MUL(DIV('-1','4'),'20')),
  'ex-3am-adad-natiq-l4-003:q4': PICK([LT(ADD(DIV('-3','5'),DIV('3','10')),DIV('-1','4')),LT(DIV('-1','4'),ADD(DIV('-3','5'),DIV('3','10'))),EQ(ADD(DIV('-3','5'),DIV('3','10')),DIV('-1','4'))]),
  'ex-3am-adad-natiq-l4-003:q5': PICK([ALL([ISDEC(ADD(DIV('-3','5'),DIV('3','10'))),ISRAT(ADD(DIV('-3','5'),DIV('3','10')))]),ALL([NOT(ISDEC(ADD(DIV('-3','5'),DIV('3','10')))),ISRAT(ADD(DIV('-3','5'),DIV('3','10')))]),NOT(ISRAT(ADD(DIV('-3','5'),DIV('3','10'))))]),
  // ex-3am-adad-natiq-l4-004
  'ex-3am-adad-natiq-l4-004:q1': A(DIV('-52','-16')),
  'ex-3am-adad-natiq-l4-004:q2': PICK([BETWEEN(DIV('-52','-16'),'3','4'),BETWEEN(DIV('-52','-16'),'-4','-3'),BETWEEN(DIV('-52','-16'),'4','5')]),
  'ex-3am-adad-natiq-l4-004:q3': PICK([ISDEC(DIV('-52','-16')),NOT(ISDEC(DIV('-52','-16')))]),
  'ex-3am-adad-natiq-l4-004:q4': A(DIV('-52','-16')),
  // ex-3am-adad-natiq-l4-005
  'ex-3am-adad-natiq-l4-005:q1': A(DIV('1',DIV('-3','8'))),
  'ex-3am-adad-natiq-l4-005:q2': PICK([LT(DIV('1',DIV('-3','8')),DIV('-3','8')),LT(DIV('-3','8'),DIV('1',DIV('-3','8'))),EQ(DIV('1',DIV('-3','8')),DIV('-3','8'))]),
  'ex-3am-adad-natiq-l4-005:q3': PICK([BETWEEN(DIV('1',DIV('-3','8')),'-3','-2'),BETWEEN(DIV('1',DIV('-3','8')),'-2','-1'),BETWEEN(DIV('1',DIV('-3','8')),'2','3')]),
  // ex-3am-adad-natiq-l4-006
  'ex-3am-adad-natiq-l4-006:q1': A(MUL(DIV('-7','9'),'99')),
  'ex-3am-adad-natiq-l4-006:q2': A(MUL(DIV('-8','11'),'99')),
  'ex-3am-adad-natiq-l4-006:q3': PICK([LT(DIV('-7','9'),DIV('-8','11')),LT(DIV('-8','11'),DIV('-7','9')),EQ(DIV('-7','9'),DIV('-8','11'))]),
  // ex-3am-adad-natiq-l4-007
  'ex-3am-adad-natiq-l4-007:q1': A(ADD(DIV('-3','5'),DIV('-1','10'))),
  'ex-3am-adad-natiq-l4-007:q2': A(DIV(ADD(DIV('-3','5'),DIV('-1','10')),'2')),
  'ex-3am-adad-natiq-l4-007:q3': PICK([BETWEEN(DIV(ADD(DIV('-3','5'),DIV('-1','10')),'2'),DIV('-3','5'),DIV('-1','10')),LT(DIV(ADD(DIV('-3','5'),DIV('-1','10')),'2'),DIV('-3','5')),LT(DIV('-1','10'),DIV(ADD(DIV('-3','5'),DIV('-1','10')),'2'))]),
  'ex-3am-adad-natiq-l4-007:q4': A(DIV(ADD(DIV('-3','5'),DIV('-1','10')),'2')),
  // ex-3am-adad-natiq-l4-008
  'ex-3am-adad-natiq-l4-008:q1': A('-10'),
  'ex-3am-adad-natiq-l4-008:q2': A(DIV('-10','8')),
  'ex-3am-adad-natiq-l4-008:q3': PICK([LT(DIV('-10','8'),'-1'),LT('-1',DIV('-10','8')),EQ(DIV('-10','8'),'-1')]),
  'ex-3am-adad-natiq-l4-008:q4': PICK([BETWEEN(DIV('-10','8'),'-2','-1'),BETWEEN(DIV('-10','8'),'-1','0'),BETWEEN(DIV('-10','8'),'1','2')]),
  // ex-3am-adad-natiq-l4-009
  'ex-3am-adad-natiq-l4-009:q1': A(DIV('-13','8')),
  'ex-3am-adad-natiq-l4-009:q2': A(DIV('10','-6')),
  'ex-3am-adad-natiq-l4-009:q3': A(DIV('-17','-12')),
  'ex-3am-adad-natiq-l4-009:q4': PICK([SORTED([DIV('10','-6'),DIV('-13','8'),DIV('-17','-12')]),SORTED([DIV('-13','8'),DIV('10','-6'),DIV('-17','-12')]),SORTED([DIV('-17','-12'),DIV('-13','8'),DIV('10','-6')])]),
  // ex-3am-adad-natiq-l4-010
  'ex-3am-adad-natiq-l4-010:q1': A(DIV('-6','15')),
  'ex-3am-adad-natiq-l4-010:q2': A(MUL(DIV('-6','15'),'20')),
  'ex-3am-adad-natiq-l4-010:q3': A(MUL(DIV('-6','15'),'40')),
  'ex-3am-adad-natiq-l4-010:q4': PICK([LT(DIV('-6','15'),DIV('-3','8')),LT(DIV('-3','8'),DIV('-6','15')),EQ(DIV('-6','15'),DIV('-3','8'))]),
  // ex-3am-adad-natiq-l5-001
  'ex-3am-adad-natiq-l5-001:q1': A(DIV('-9','5')),
  'ex-3am-adad-natiq-l5-001:q2': A(DIV('-7','6')),
  'ex-3am-adad-natiq-l5-001:q3': A(DIV('-5','4')),
  'ex-3am-adad-natiq-l5-001:q4': PICK([SORTED([DIV('-9','5'),DIV('-5','4'),DIV('-7','6')]),SORTED([DIV('-7','6'),DIV('-5','4'),DIV('-9','5')]),SORTED([DIV('-5','4'),DIV('-7','6'),DIV('-9','5')])]),
  'ex-3am-adad-natiq-l5-001:q5': PICK([EQ(DIV('-9','5'),MIN([DIV('-9','5'),DIV('-7','6'),DIV('-5','4')])),EQ(DIV('-7','6'),MIN([DIV('-9','5'),DIV('-7','6'),DIV('-5','4')])),EQ(DIV('-5','4'),MIN([DIV('-9','5'),DIV('-7','6'),DIV('-5','4')]))]),
  'ex-3am-adad-natiq-l5-001:q6': PICKS([ISDEC(DIV('-9','5')),ISDEC(DIV('-5','4')),ISDEC(DIV('-7','6'))]),
  // ex-3am-adad-natiq-l5-002
  'ex-3am-adad-natiq-l5-002:q1': A(DIV('-17','6')),
  'ex-3am-adad-natiq-l5-002:q2': A(DIV('-13','5')),
  'ex-3am-adad-natiq-l5-002:q3': PICK([LT(DIV('-17','6'),DIV('-13','5')),LT(DIV('-13','5'),DIV('-17','6')),EQ(DIV('-17','6'),DIV('-13','5'))]),
  'ex-3am-adad-natiq-l5-002:q4': PICK([LT(DIV('-17','6'),DIV('-13','5')),LT(DIV('-13','5'),DIV('-17','6'))]),
  'ex-3am-adad-natiq-l5-002:q5': PICK([BETWEEN(DIV('-17','6'),'-3','-2'),BETWEEN(DIV('-17','6'),'-2','-1'),BETWEEN(DIV('-17','6'),'2','3')]),
  'ex-3am-adad-natiq-l5-002:q6': A(APPROXDOWN(DIV('-17','6'),2)),
  // ex-3am-adad-natiq-l5-003
  'ex-3am-adad-natiq-l5-003:q1': A(DIV('-11','6')),
  'ex-3am-adad-natiq-l5-003:q2': A(DIV('8','5')),
  'ex-3am-adad-natiq-l5-003:q3': PICK([GT(ABS(DIV('-11','6')),ABS(DIV('8','5'))),GT(ABS(DIV('8','5')),ABS(DIV('-11','6')))]),
  'ex-3am-adad-natiq-l5-003:q4': PICK([SORTED([DIV('-11','6'),DIV('-9','5'),'0',DIV('8','5')]),SORTED([DIV('-9','5'),DIV('-11','6'),'0',DIV('8','5')]),SORTED([DIV('8','5'),'0',DIV('-9','5'),DIV('-11','6')])]),
  'ex-3am-adad-natiq-l5-003:q5': PICK([ISDEC(DIV('8','5')),NOT(ISDEC(DIV('8','5')))]),
  // ex-3am-adad-natiq-l5-004
  'ex-3am-adad-natiq-l5-004:q1': A(DIV('-20','16')),
  'ex-3am-adad-natiq-l5-004:q2': A(DIV('-10','-8')),
  'ex-3am-adad-natiq-l5-004:q3': PICKS([EQ(DIV('35','-28'),DIV('-20','16')),EQ(DIV('-10','-8'),DIV('-20','16')),EQ(DIV('15','12'),DIV('-20','16'))]),
  'ex-3am-adad-natiq-l5-004:q4': PICK([BETWEEN(DIV('-20','16'),'-2','-1'),BETWEEN(DIV('-20','16'),'-1','0'),BETWEEN(DIV('-20','16'),'1','2')]),
  'ex-3am-adad-natiq-l5-004:q5': PICK([EQ(COUNTDISTINCT([DIV('-20','16'),DIV('35','-28'),DIV('-10','-8'),DIV('15','12')]),'2'),EQ(COUNTDISTINCT([DIV('-20','16'),DIV('35','-28'),DIV('-10','-8'),DIV('15','12')]),'4'),EQ(COUNTDISTINCT([DIV('-20','16'),DIV('35','-28'),DIV('-10','-8'),DIV('15','12')]),'3')]),
  // ex-3am-adad-natiq-l5-005
  'ex-3am-adad-natiq-l5-005:q1': A(DIV('-900','7')),
  'ex-3am-adad-natiq-l5-005:q2': A(DIV('625','4')),
  'ex-3am-adad-natiq-l5-005:q3': PICK([BETWEEN(DIV('-900','7'),'-129','-128'),BETWEEN(DIV('-900','7'),'-128','-127'),BETWEEN(DIV('-900','7'),'128','129')]),
  'ex-3am-adad-natiq-l5-005:q4': PICK([LT(ABS(DIV('-900','7')),ABS(DIV('625','4'))),LT(ABS(DIV('625','4')),ABS(DIV('-900','7')))]),
  'ex-3am-adad-natiq-l5-005:q5': PICK([ISDEC(DIV('625','4')),NOT(ISDEC(DIV('625','4')))]),
  'ex-3am-adad-natiq-l5-005:q6': PICK([ISRAT(DIV('-900','7')),NOT(ISRAT(DIV('-900','7'))),NOT(ISRAT(DIV('-900','7')))]),
  // ex-3am-adad-natiq-l5-006
  'ex-3am-adad-natiq-l5-006:q1': A(DIV('-13','4')),
  'ex-3am-adad-natiq-l5-006:q2': A(DIV('-16','5')),
  'ex-3am-adad-natiq-l5-006:q3': A(DIV('-19','6')),
  'ex-3am-adad-natiq-l5-006:q4': PICK([SORTED([DIV('-13','4'),DIV('-16','5'),DIV('-19','6')]),SORTED([DIV('-19','6'),DIV('-16','5'),DIV('-13','4')]),SORTED([DIV('-16','5'),DIV('-13','4'),DIV('-19','6')])]),
  'ex-3am-adad-natiq-l5-006:q5': PICK([EQ(DIV('-13','4'),MIN([DIV('-13','4'),DIV('-16','5'),DIV('-19','6')])),EQ(DIV('-16','5'),MIN([DIV('-13','4'),DIV('-16','5'),DIV('-19','6')])),EQ(DIV('-19','6'),MIN([DIV('-13','4'),DIV('-16','5'),DIV('-19','6')]))]),
  'ex-3am-adad-natiq-l5-006:q6': PICKS([ISDEC(DIV('-13','4')),ISDEC(DIV('-16','5')),ISDEC(DIV('-19','6'))]),
  // ex-3am-adad-natiq-l5-007
  'ex-3am-adad-natiq-l5-007:q1': A('-9/5'),
  'ex-3am-adad-natiq-l5-007:q2': A('-4/5'),
  'ex-3am-adad-natiq-l5-007:q3': PICK([SORTED(['-9/5','-4/5','-2/5','3/5']),SORTED(['3/5','-2/5','-4/5','-9/5']),SORTED(['-4/5','-9/5','-2/5','3/5'])]),
  'ex-3am-adad-natiq-l5-007:q4': PICK([EQ('-9/5',MIN(['-9/5','-4/5','3/5','-2/5'])),EQ('-4/5',MIN(['-9/5','-4/5','3/5','-2/5'])),EQ('3/5',MIN(['-9/5','-4/5','3/5','-2/5']))]),
  'ex-3am-adad-natiq-l5-007:q5': PICK([ISRAT('-2/5'),NOT(ISRAT('-2/5'))]),
  // ex-3am-adad-natiq-l5-008
  'ex-3am-adad-natiq-l5-008:q1': A(DIV('-11','3')),
  'ex-3am-adad-natiq-l5-008:q2': A(DIV('-7','2')),
  'ex-3am-adad-natiq-l5-008:q3': A(DIV('-18','5')),
  'ex-3am-adad-natiq-l5-008:q4': PICK([SORTED([DIV('-11','3'),DIV('-18','5'),DIV('-7','2')]),SORTED([DIV('-7','2'),DIV('-18','5'),DIV('-11','3')]),SORTED([DIV('-18','5'),DIV('-11','3'),DIV('-7','2')])]),
  'ex-3am-adad-natiq-l5-008:q5': PICK([EQ(DIV('-11','3'),MIN([DIV('-11','3'),DIV('-7','2'),DIV('-18','5')])),EQ(DIV('-7','2'),MIN([DIV('-11','3'),DIV('-7','2'),DIV('-18','5')])),EQ(DIV('-18','5'),MIN([DIV('-11','3'),DIV('-7','2'),DIV('-18','5')]))]),
  'ex-3am-adad-natiq-l5-008:q6': PICK([BETWEEN(DIV('-11','3'),'-4','-3'),BETWEEN(DIV('-11','3'),'-3','-2'),BETWEEN(DIV('-11','3'),'3','4')]),
  // ex-3am-adad-natiq-l5-009
  'ex-3am-adad-natiq-l5-009:q1': A(DIV('-11','8')),
  'ex-3am-adad-natiq-l5-009:q2': A(DIV('-13','7')),
  'ex-3am-adad-natiq-l5-009:q3': A(DIV('9','5')),
  'ex-3am-adad-natiq-l5-009:q4': PICK([SORTED([DIV('-13','7'),DIV('-11','8'),DIV('9','5')]),SORTED([DIV('-11','8'),DIV('-13','7'),DIV('9','5')]),SORTED([DIV('9','5'),DIV('-11','8'),DIV('-13','7')])]),
  'ex-3am-adad-natiq-l5-009:q5': PICK([SIGN(DIV('9','5'),1),SIGN(DIV('-11','8'),1),SIGN(DIV('-13','7'),1)]),
  'ex-3am-adad-natiq-l5-009:q6': PICK([ISDEC(DIV('-11','8')),NOT(ISDEC(DIV('-11','8')))]),
  // ex-3am-adad-natiq-l5-010
  'ex-3am-adad-natiq-l5-010:q1': A(DIV('-10','6')),
  'ex-3am-adad-natiq-l5-010:q2': A(DIV('8','-24')),
  'ex-3am-adad-natiq-l5-010:q3': A(DIV('-16','-12')),
  'ex-3am-adad-natiq-l5-010:q4': PICK([EQ('-5/3',DIV('-16','-12')),EQ('-1/3',DIV('-16','-12')),EQ('4/3',DIV('-16','-12')),EQ('5/3',DIV('-16','-12'))]),
  'ex-3am-adad-natiq-l5-010:q5': PICK([EQ('-5/3',DIV('8','-24')),EQ('-1/3',DIV('8','-24')),EQ('4/3',DIV('8','-24')),EQ('5/3',DIV('8','-24'))]),
  'ex-3am-adad-natiq-l5-010:q6': PICK([SORTED([DIV('-10','6'),DIV('8','-24'),DIV('-16','-12'),DIV('35','21')]),SORTED([DIV('8','-24'),DIV('-10','6'),DIV('-16','-12'),DIV('35','21')]),SORTED([DIV('35','21'),DIV('-16','-12'),DIV('8','-24'),DIV('-10','6')])]),
};
