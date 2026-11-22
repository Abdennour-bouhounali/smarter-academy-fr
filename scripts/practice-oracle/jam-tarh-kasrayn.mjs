// Oracle du banc « jam-tarh-kasrayn » (جمع وطرح كسرين, 3AM unité 2, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول / الثاني / الثالث »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec un calcul écrit dans ce fichier (rationnels EXACTS
// en BigInt, ppcm et réduction propres), indépendant de packages/core ; les nombres de l'énoncé sont retapés en littéraux
// (« 3/4 », « 120 ») :
//  - ADD / SUB / MUL / DIV : l'expression de l'énoncé, terme à terme (un résultat est toujours réduit) ;
//  - LCM : le plus petit multiple commun ; audit() recalcule en plus le MINIMUM par force brute (aucun entier plus petit
//    n'est divisible par tous les dénominateurs) pour chaque « ما أصغر مقام مشترك » dont les fractions sont dans l'énoncé ;
//  - EQ / LT / NOT / AND, MAX / MIN : prédicats et choix ; un QCM est jugé option par option : chaque option est une
//    AFFIRMATION évaluée par un calcul (booléen), PICK exige qu'une seule soit vraie (donc toute distraction est FAUSSE) ;
//    PICKS rend l'ensemble des options vraies (QCM à deux bonnes réponses, `self-3`) ;
//  - audit(bank) : RE-LIT l'énoncé et les options (LaTeX) avec son propre analyseur : tout « احسب $expression$ » est évalué
//    et doit valoir la clé ; toute option « expression = expression » ou « < / > » est évaluée, exactement UNE option doit
//    être vraie (QCM simple) et être celle que le contenu marque correcte, ou chaque option d'un QCM multiple doit être
//    jugée comme marquée ; les clés sont réduites ; chaque distracteur COMPTÉ porte un MISC-JAMTARH-* ; chaque signature
//    est fausse. Les questions selfCheck n'ont pas de clé.
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
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
/** « 3/4 », « -12 », « 7 » → Q (littéral exact, pas de flottant). */
const q = (v) => {
  if (v instanceof Q) return v;
  const s = String(v).trim();
  if (s.includes('/')) { const [a, b] = s.split('/'); return q(a).div(q(b)); }
  return new Q(BigInt(s));
};
const ADD = (a, b) => q(a).add(q(b));
const SUB = (a, b) => q(a).sub(q(b));
const MUL = (a, b) => q(a).mul(q(b));
const DIV = (a, b) => q(a).div(q(b));
const EQ = (a, b) => q(a).eq(q(b));
const LT = (a, b) => q(a).lt(q(b));
const NOT = (b) => !b;
/** Plus petit multiple commun strictement positif de deux entiers. */
const LCM = (a, b) => { const x = q(a).n, y = q(b).n; return new Q((x / gcd(x, y)) * y); };
const MAX = (list) => list.map(q).reduce((m, x) => (m.lt(x) ? x : m));
const MIN = (list) => list.map(q).reduce((m, x) => (x.lt(m) ? x : m));
/** Une clé « constructed » : la chaîne exacte du résultat. */
const A = (x) => R(q(x).toString());
const PICK = (flags) => {
  const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`QCM : ${hits.length} options justes`);
  return C('ABCDEF'[hits[0]]);
};
const PICKS = (flags) => ({ choiceIds: flags.map((f, k) => (f ? 'ABCDEF'[k] : null)).filter(Boolean) });

/* ── Analyseur LaTeX de l'audit (indépendant du reste) ─────────────────── */
const FRAC = String.raw`\\dfrac\{(\d+)\}\{(\d+)\}`;
/** Valeur d'une expression : « 6 \times 15 », « 3 - \dfrac{5}{9} », « -\dfrac{1}{9} », « \dfrac{5}{6} \div 2 ». */
function evalExpr(s) {
  const t = s.replace(new RegExp(FRAC, 'g'), (_, a, b) => `(${a}/${b})`).replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  if (!/^[0-9+\-*/()]+$/.test(t)) throw new Error(`expression illisible : ${s}`);
  let i = 0;
  const atom = () => {
    if (t[i] === '-') { i++; const v = atom(); return new Q(0n).sub(v); }
    if (t[i] === '(') { i++; const v = sum(); i++; return v; }
    let j = i; while (j < t.length && /\d/.test(t[j])) j++;
    const v = new Q(BigInt(t.slice(i, j))); i = j; return v;
  };
  const prod = () => { let v = atom(); while (t[i] === '*' || t[i] === '/') { const op = t[i++]; const r = atom(); v = op === '*' ? v.mul(r) : v.div(r); } return v; };
  const sum = () => { let v = prod(); while (t[i] === '+' || t[i] === '-') { const op = t[i++]; const r = prod(); v = op === '+' ? v.add(r) : v.sub(r); } return v; };
  const out = sum();
  if (i !== t.length) throw new Error(`expression illisible : ${s}`);
  return out;
}
/** Une chaîne « E1 rel E2 » (rel ∈ < > =) est-elle vraie ? */
function chainTrue(latex) {
  const parts = latex.split(/(<|>|=)/).map((x) => x.trim()).filter((x) => x !== '');
  if (parts.length < 3 || parts.length % 2 === 0) throw new Error(`chaîne illisible : ${latex}`);
  for (let k = 0; k + 2 < parts.length; k += 2) {
    const l = evalExpr(parts[k]), r = evalExpr(parts[k + 2]), op = parts[k + 1];
    const ok = op === '<' ? l.lt(r) : op === '>' ? r.lt(l) : l.eq(r);
    if (!ok) return false;
  }
  return true;
}
const islands = (s) => [...s.matchAll(/\$([^$]+)\$/g)].map((x) => x[1]);
/** L'option est-elle une affirmation « expression rel expression » que l'audit sait juger ? null sinon. */
function judgeOption(content) {
  const isl = islands(content);
  if (isl.length !== 1 || !/(<|>|=)/.test(isl[0]) || /[a-zA-Z]/.test(isl[0].replace(/\\dfrac|\\times|\\div/g, ''))) return null;
  return chainTrue(isl[0]);
}
const lcmList = (list) => list.reduce((m, x) => (m / gcd(m, x)) * x, 1n);
/** Le plus petit multiple commun, PAR FORCE BRUTE : le premier entier > 0 divisible par tous les dénominateurs. */
const bruteLcm = (list) => { for (let m = 1n; ; m++) if (list.every((d) => m % d === 0n)) return m; };

/** Audit de la banque (appelé par practice-answer-oracle.test.mjs) : liste des problèmes (vide = conforme). */
export function audit(bank) {
  const problems = [];
  const MISC = /^MISC-JAMTARH-(ACROSS|NOSCALE|BIGGER|SUMDEN|PRODUCTONLY|INTEGER|RESULTCHANGES)$/;
  for (const { key, q: qu } of bank) {
    if (qu.answerType === 'rational') {
      const e = String(qu.expectedAnswer);
      const m = /^(-?\d+)(?:\/(\d+))?$/.exec(e);
      if (!m) { problems.push(`${key} : clé non fractionnaire « ${e} » (les clés sont des littéraux exacts p/q)`); continue; }
      if (m[2] !== undefined && gcd(BigInt(m[1]), BigInt(m[2])) !== 1n) problems.push(`${key} : la clé ${e} n'est pas réduite`);
      if (qu.evaluationPolicy?.requiredForm === 'irreducible' && m[2] !== undefined && BigInt(m[2]) === 1n) problems.push(`${key} : clé « /1 »`);
      for (const s of qu.misconceptionSignatures ?? []) {
        if (!MISC.test(s.id)) problems.push(`${key} : signature ${s.id} hors MISC-JAMTARH-*`);
        if (q(s.value).eq(q(e))) problems.push(`${key} : la signature ${s.id} (${s.value}) est la bonne réponse`);
      }
      // « احسب $expression$ » : la clé est la valeur de l'expression imprimée dans l'énoncé.
      if (/^احسب/.test(qu.statement)) {
        const first = islands(qu.statement)[0];
        const expr = first === undefined ? '' : first.replace(/^\s*[A-Za-z]\s*=\s*/, '');
        if (expr && /(\\dfrac|\\times|\\div|[+-])/.test(expr) && !/[a-zA-Z]/.test(expr.replace(/\\dfrac|\\times|\\div|\\left|\\right/g, '').replace(/\\text\{[^}]*\}/g, ''))) {
          try { if (!evalExpr(expr.replace(/\\left|\\right/g, '')).eq(q(e))) problems.push(`${key} : l'expression « ${expr} » ne vaut pas la clé ${e}`); } catch (err) { problems.push(`${key} : ${err.message}`); }
        }
      }
      // « ما أصغر مقام مشترك » : minimum recalculé par force brute à partir des fractions de l'énoncé.
      if (/^ما أصغر مقام مشترك/.test(qu.statement)) {
        const dens = [...qu.statement.matchAll(new RegExp(FRAC, 'g'))].map((x) => BigInt(x[2]));
        if (dens.length >= 2) {
          if (bruteLcm(dens) !== q(e).n) problems.push(`${key} : le plus petit multiple commun de ${dens.join(', ')} est ${bruteLcm(dens)}, la clé dit ${e}`);
          if (lcmList(dens) !== bruteLcm(dens)) problems.push(`${key} : ppcm incohérent`);
          for (const s of qu.misconceptionSignatures ?? []) {
            const v = q(s.value).n;
            if (v === bruteLcm(dens) || (s.id === 'MISC-JAMTARH-BIGGER' && dens.every((d) => v % d === 0n))) problems.push(`${key} : le distracteur ${s.value} est un plus petit multiple commun`);
          }
        }
      }
    } else if (qu.answerType === 'choice' || qu.answerType === 'multiChoice') {
      const good = qu.choices.filter((c) => c.isCorrect);
      if (qu.answerType === 'choice' && good.length !== 1) problems.push(`${key} : ${good.length} bonnes options`);
      if (qu.answerType === 'multiChoice' && good.length < 1) problems.push(`${key} : aucune bonne option`);
      // Un pas « counted: false » (décision, comparaison d'une autre leçon) n'a pas de misconception : son distracteur est une conclusion fausse.
      for (const c of qu.choices.filter((x) => !x.isCorrect && qu.counted !== false)) {
        if (!c.misconceptionId || !MISC.test(c.misconceptionId)) problems.push(`${key} : le distracteur ${c.id} ne porte pas de MISC-JAMTARH-*`);
      }
      // « ما أصغر مقام مشترك للمقامات a و b و c » : la bonne option est le ppcm, aucune autre n'est un plus petit multiple commun.
      if (/أصغر مقام مشترك للمقامات/.test(qu.statement)) {
        const nums = islands(qu.statement).map((x) => BigInt(x));
        const want = bruteLcm(nums);
        qu.choices.forEach((c) => { const v = BigInt(islands(c.content)[0]); if ((v === want) !== c.isCorrect) problems.push(`${key} : l'option ${c.id} (${v}) ${v === want ? 'est' : "n'est pas"} le plus petit multiple commun ${want}`); });
      }
      let judged;
      try { judged = qu.choices.map((c) => judgeOption(c.content)); } catch (err) { problems.push(`${key} : ${err.message}`); continue; }
      if (judged.every((j) => j !== null)) {
        const truths = judged.filter(Boolean).length;
        if (qu.answerType === 'choice' && truths !== 1) problems.push(`${key} : ${truths} options vraies à la relecture du contenu`);
        qu.choices.forEach((c, k) => { if (judged[k] !== c.isCorrect) problems.push(`${key} : l'option ${c.id} est ${judged[k] ? 'vraie' : 'fausse'} mais marquée ${c.isCorrect ? 'correcte' : 'incorrecte'}`); });
      }
    }
  }
  return problems;
}

export const ORACLE = {
  // ex-3am-jam-tarh-kasrayn-l1-001
  'ex-3am-jam-tarh-kasrayn-l1-001:q1': A(ADD('3/8','7/6')),
  'ex-3am-jam-tarh-kasrayn-l1-001:q2': A(SUB('7/4','5/6')),
  'ex-3am-jam-tarh-kasrayn-l1-001:q3': A(ADD('3/4','1/2')),
  'ex-3am-jam-tarh-kasrayn-l1-001:q4': A(DIV('5/2',ADD('3/4','1/2'))),
  // ex-3am-jam-tarh-kasrayn-l1-002
  'ex-3am-jam-tarh-kasrayn-l1-002:q1': A(MUL('3/4','2/3')),
  'ex-3am-jam-tarh-kasrayn-l1-002:q2': A(ADD('5/6',MUL('3/4','2/3'))),
  'ex-3am-jam-tarh-kasrayn-l1-002:q3': A(SUB('7','5/8')),
  // ex-3am-jam-tarh-kasrayn-l1-003
  'ex-3am-jam-tarh-kasrayn-l1-003:q1': A(SUB('5/6','1/3')),
  'ex-3am-jam-tarh-kasrayn-l1-003:q2': A(DIV(SUB('5/6','1/3'),'7/12')),
  'ex-3am-jam-tarh-kasrayn-l1-003:q3': A(ADD('3/10','7/15')),
  // ex-3am-jam-tarh-kasrayn-l1-004
  'ex-3am-jam-tarh-kasrayn-l1-004:q1': A(ADD('5/9','1/6')),
  'ex-3am-jam-tarh-kasrayn-l1-004:q2': A(SUB('11/12','3/8')),
  'ex-3am-jam-tarh-kasrayn-l1-004:q3': A(ADD('7/10','4/15')),
  // ex-3am-jam-tarh-kasrayn-l1-005
  'ex-3am-jam-tarh-kasrayn-l1-005:q1': PICK([EQ(LCM('9','6'),'18'), EQ(LCM('9','6'),'54'), EQ(LCM('9','6'),'15'), EQ(LCM('9','6'),'9')]),
  'ex-3am-jam-tarh-kasrayn-l1-005:q2': A(DIV(MUL('4','18'),'9')),
  'ex-3am-jam-tarh-kasrayn-l1-005:q3': A(DIV(MUL('5','18'),'6')),
  'ex-3am-jam-tarh-kasrayn-l1-005:q4': A(ADD('4/9','5/6')),
  // ex-3am-jam-tarh-kasrayn-l1-006
  'ex-3am-jam-tarh-kasrayn-l1-006:q1': A(SUB('5','3/7')),
  'ex-3am-jam-tarh-kasrayn-l1-006:q2': A(ADD('2','4/9')),
  'ex-3am-jam-tarh-kasrayn-l1-006:q3': A(SUB('6','11/4')),
  // ex-3am-jam-tarh-kasrayn-l1-007
  'ex-3am-jam-tarh-kasrayn-l1-007:q1': A(ADD('3/8','1/6')),
  'ex-3am-jam-tarh-kasrayn-l1-007:q2': A(SUB('3/8','1/6')),
  'ex-3am-jam-tarh-kasrayn-l1-007:q3': A(SUB('1','13/24')),
  // ex-3am-jam-tarh-kasrayn-l1-008
  'ex-3am-jam-tarh-kasrayn-l1-008:q1': A(SUB('8/9','5/12')),
  'ex-3am-jam-tarh-kasrayn-l1-008:q2': A(SUB('13/15','7/10')),
  'ex-3am-jam-tarh-kasrayn-l1-008:q3': A(SUB('5/4','7/6')),
  // ex-3am-jam-tarh-kasrayn-l1-009
  'ex-3am-jam-tarh-kasrayn-l1-009:q1': A(ADD('1/8','1/10')),
  'ex-3am-jam-tarh-kasrayn-l1-009:q2': A(ADD('8/55','7/44')),
  'ex-3am-jam-tarh-kasrayn-l1-009:q3': A(ADD('3/5','2/15')),
  'ex-3am-jam-tarh-kasrayn-l1-009:q4': A(ADD(ADD(ADD('1/2','1/3'),'1/4'),'1/5')),
  // ex-3am-jam-tarh-kasrayn-l1-010
  'ex-3am-jam-tarh-kasrayn-l1-010:q1': PICK([EQ(ADD('5/18','1/12'),'6/18'), EQ(ADD('5/18','1/12'),'13/36'), EQ(ADD('5/18','1/12'),'6/30')]),
  'ex-3am-jam-tarh-kasrayn-l1-010:q2': A(LCM('18','12')),
  'ex-3am-jam-tarh-kasrayn-l1-010:q3': A(SUB('11/18','1/12')),
  // ex-3am-jam-tarh-kasrayn-l2-001
  'ex-3am-jam-tarh-kasrayn-l2-001:q1': A(ADD(ADD('5/12','7/6'),'9/4')),
  'ex-3am-jam-tarh-kasrayn-l2-001:q3': A(SUB('5/6','8/15')),
  // ex-3am-jam-tarh-kasrayn-l2-002
  'ex-3am-jam-tarh-kasrayn-l2-002:q1': A(ADD('5/6','1/4')),
  'ex-3am-jam-tarh-kasrayn-l2-002:q2': A(DIV('1','13/12')),
  // ex-3am-jam-tarh-kasrayn-l2-003
  'ex-3am-jam-tarh-kasrayn-l2-003:q1': PICK([EQ(LCM('15','10'),'30'), EQ(LCM('15','10'),'150'), EQ(LCM('15','10'),'25'), EQ(LCM('15','10'),'15')]),
  'ex-3am-jam-tarh-kasrayn-l2-003:q2': A(ADD('7/15','3/10')),
  // ex-3am-jam-tarh-kasrayn-l2-004
  'ex-3am-jam-tarh-kasrayn-l2-004:q1': A(DIV(ADD('60','56'),'96')),
  'ex-3am-jam-tarh-kasrayn-l2-004:q2': A(DIV(ADD('15','14'),'24')),
  'ex-3am-jam-tarh-kasrayn-l2-004:q3': PICK([NOT(EQ(DIV(ADD('60','56'),'96'),DIV(ADD('15','14'),'24'))), EQ(DIV(ADD('60','56'),'96'),DIV(ADD('15','14'),'24'))]),
  // ex-3am-jam-tarh-kasrayn-l2-005
  'ex-3am-jam-tarh-kasrayn-l2-005:q1': A(ADD('11/18','5/12')),
  'ex-3am-jam-tarh-kasrayn-l2-005:q3': A(ADD('9/14','3/10')),
  // ex-3am-jam-tarh-kasrayn-l2-006
  'ex-3am-jam-tarh-kasrayn-l2-006:q1': PICK([EQ(SUB('4','5/9'),'31/9'), EQ(SUB('4','5/9'),'-1/9'), EQ(SUB('4','5/9'),'1/8')]),
  'ex-3am-jam-tarh-kasrayn-l2-006:q3': A(SUB('3','7/12')),
  // ex-3am-jam-tarh-kasrayn-l2-007
  'ex-3am-jam-tarh-kasrayn-l2-007:q1': PICK([EQ(LCM(LCM('3','4'),'6'),'12'), EQ(LCM(LCM('3','4'),'6'),'72'), EQ(LCM(LCM('3','4'),'6'),'13'), EQ(LCM(LCM('3','4'),'6'),'6')]),
  'ex-3am-jam-tarh-kasrayn-l2-007:q2': A(ADD(ADD('2/3','3/4'),'5/6')),
  // ex-3am-jam-tarh-kasrayn-l2-008
  'ex-3am-jam-tarh-kasrayn-l2-008:q1': A(ADD('3/4','2/5')),
  'ex-3am-jam-tarh-kasrayn-l2-008:q2': PICK([LT('1',ADD('3/4','2/5')), LT(ADD('3/4','2/5'),'1')]),
  // ex-3am-jam-tarh-kasrayn-l2-009
  'ex-3am-jam-tarh-kasrayn-l2-009:q1': PICKS([EQ(ADD('5/24','1/2'),'17/24'), EQ(SUB('15/8','7/6'),'17/24'), EQ(ADD('10/12','7/12'),'17/24')]),
  'ex-3am-jam-tarh-kasrayn-l2-009:q3': A(ADD('9/16','5/12')),
  // ex-3am-jam-tarh-kasrayn-l2-010
  'ex-3am-jam-tarh-kasrayn-l2-010:q1': A(LCM('15','18')),
  'ex-3am-jam-tarh-kasrayn-l2-010:q2': A(DIV(MUL('4','90'),'15')),
  'ex-3am-jam-tarh-kasrayn-l2-010:q3': A(LCM('8','7')),
  'ex-3am-jam-tarh-kasrayn-l2-010:q4': A(LCM('14','12')),
  // ex-3am-jam-tarh-kasrayn-l3-001
  'ex-3am-jam-tarh-kasrayn-l3-001:q1': A(MUL('2/3','5/6')),
  'ex-3am-jam-tarh-kasrayn-l3-001:q2': A(SUB('3/4',MUL('2/3','5/6'))),
  'ex-3am-jam-tarh-kasrayn-l3-001:q3': A(SUB('1/2','1/12')),
  'ex-3am-jam-tarh-kasrayn-l3-001:q4': A(DIV('5/6',SUB('1/2','1/12'))),
  'ex-3am-jam-tarh-kasrayn-l3-001:q5': A(SUB(ADD('7/10','2/15'),'1/6')),
  // ex-3am-jam-tarh-kasrayn-l3-002
  'ex-3am-jam-tarh-kasrayn-l3-002:q1': A(SUB('7/3','6/5')),
  'ex-3am-jam-tarh-kasrayn-l3-002:q2': A(SUB('7/4','4/3')),
  'ex-3am-jam-tarh-kasrayn-l3-002:q3': A(DIV('5/6','10/3')),
  'ex-3am-jam-tarh-kasrayn-l3-002:q4': A(ADD('17/15','5/12')),
  // ex-3am-jam-tarh-kasrayn-l3-003
  'ex-3am-jam-tarh-kasrayn-l3-003:q1': A(DIV('5/6','5/4')),
  'ex-3am-jam-tarh-kasrayn-l3-003:q2': A(ADD('1/3',DIV('5/6','5/4'))),
  'ex-3am-jam-tarh-kasrayn-l3-003:q3': A(ADD('1','3/8')),
  // ex-3am-jam-tarh-kasrayn-l3-004
  'ex-3am-jam-tarh-kasrayn-l3-004:q1': A(SUB(ADD('4','3/5'),'7/10')),
  'ex-3am-jam-tarh-kasrayn-l3-004:q2': A(SUB(ADD('5/6','1/4'),'2/3')),
  'ex-3am-jam-tarh-kasrayn-l3-004:q3': A(SUB(SUB('2','3/8'),'1/6')),
  // ex-3am-jam-tarh-kasrayn-l3-005
  'ex-3am-jam-tarh-kasrayn-l3-005:q1': A(ADD(ADD('1/2','1/4'),'1/5')),
  'ex-3am-jam-tarh-kasrayn-l3-005:q2': A(SUB('29/30','19/20')),
  'ex-3am-jam-tarh-kasrayn-l3-005:q3': A(DIV('1',SUB('29/30',ADD(ADD('1/2','1/4'),'1/5')))),
  // ex-3am-jam-tarh-kasrayn-l3-006
  'ex-3am-jam-tarh-kasrayn-l3-006:q1': A(ADD('2/7','1/3')),
  'ex-3am-jam-tarh-kasrayn-l3-006:q2': A(SUB('1','13/21')),
  // ex-3am-jam-tarh-kasrayn-l3-007
  'ex-3am-jam-tarh-kasrayn-l3-007:q1': PICK([EQ(ADD(ADD('1/3','1/4'),'1/6'),'3/4'), EQ(ADD(ADD('1/3','1/4'),'1/6'),'3/13'), EQ(ADD(ADD('1/3','1/4'),'1/6'),'3/12')]),
  'ex-3am-jam-tarh-kasrayn-l3-007:q2': A(DIV('1',SUB('7/12','1/3'))),
  'ex-3am-jam-tarh-kasrayn-l3-007:q3': A(ADD(ADD('1/3','1/4'),'1/5')),
  // ex-3am-jam-tarh-kasrayn-l3-008
  'ex-3am-jam-tarh-kasrayn-l3-008:q1': A(SUB('5/6','1/4')),
  'ex-3am-jam-tarh-kasrayn-l3-008:q2': A(SUB('2/3','3/8')),
  'ex-3am-jam-tarh-kasrayn-l3-008:q3': A(SUB(SUB('5/6','1/4'),SUB('2/3','3/8'))),
  // ex-3am-jam-tarh-kasrayn-l3-009
  'ex-3am-jam-tarh-kasrayn-l3-009:q1': A(SUB('8/5','2/7')),
  'ex-3am-jam-tarh-kasrayn-l3-009:q2': A(SUB(ADD('3','1/4'),'3/8')),
  'ex-3am-jam-tarh-kasrayn-l3-009:q3': A(SUB(ADD('5/8','7/24'),'1/6')),
  'ex-3am-jam-tarh-kasrayn-l3-009:q4': A(SUB(SUB('4/3','2/15'),SUB('3/4','1/8'))),
  // ex-3am-jam-tarh-kasrayn-l3-010
  'ex-3am-jam-tarh-kasrayn-l3-010:q1': A(ADD('1/3','1/15')),
  'ex-3am-jam-tarh-kasrayn-l3-010:q2': A(ADD('1/4','1/28')),
  'ex-3am-jam-tarh-kasrayn-l3-010:q3': A(ADD(ADD('1/8','1/52'),'1/104')),
  'ex-3am-jam-tarh-kasrayn-l3-010:q4': A(DIV('1',SUB('2/15','1/10'))),
  'ex-3am-jam-tarh-kasrayn-l3-010:q5': A(DIV('1',SUB(SUB('2/17','1/51'),'1/68'))),
  // ex-3am-jam-tarh-kasrayn-l4-001
  'ex-3am-jam-tarh-kasrayn-l4-001:q1': A(SUB('3','6/21')),
  'ex-3am-jam-tarh-kasrayn-l4-001:q2': A(MUL('1/5','5/6')),
  'ex-3am-jam-tarh-kasrayn-l4-001:q3': A(ADD('7/10','1/6')),
  'ex-3am-jam-tarh-kasrayn-l4-001:q4': A(DIV('13/15','4/3')),
  // ex-3am-jam-tarh-kasrayn-l4-002
  'ex-3am-jam-tarh-kasrayn-l4-002:q1': A(SUB('3/4','1/6')),
  'ex-3am-jam-tarh-kasrayn-l4-002:q2': A(MUL(SUB('3/4','1/6'),'3')),
  'ex-3am-jam-tarh-kasrayn-l4-002:q3': A(DIV('2/3','1/4')),
  'ex-3am-jam-tarh-kasrayn-l4-002:q4': A(ADD('5/6','8/3')),
  'ex-3am-jam-tarh-kasrayn-l4-002:q5': A(DIV(DIV('7/2','5'),'7/4')),
  // ex-3am-jam-tarh-kasrayn-l4-003
  'ex-3am-jam-tarh-kasrayn-l4-003:q1': A(ADD('2/5','3/8')),
  'ex-3am-jam-tarh-kasrayn-l4-003:q2': PICK([LT('3/4',ADD('2/5','3/8')), LT(ADD('2/5','3/8'),'3/4'), EQ(ADD('2/5','3/8'),'3/4')]),
  // ex-3am-jam-tarh-kasrayn-l4-004
  'ex-3am-jam-tarh-kasrayn-l4-004:q1': A(ADD('3/4','1/6')),
  'ex-3am-jam-tarh-kasrayn-l4-004:q2': A(DIV('11/12','5/6')),
  'ex-3am-jam-tarh-kasrayn-l4-004:q3': PICK([LT('1','11/10'), LT('11/10','1'), EQ('11/10','1')]),
  // ex-3am-jam-tarh-kasrayn-l4-005
  'ex-3am-jam-tarh-kasrayn-l4-005:q1': A(ADD('1/2','1/3')),
  'ex-3am-jam-tarh-kasrayn-l4-005:q2': A(DIV('1','5/6')),
  'ex-3am-jam-tarh-kasrayn-l4-005:q3': A(ADD('6/5','5/6')),
  // ex-3am-jam-tarh-kasrayn-l4-006
  'ex-3am-jam-tarh-kasrayn-l4-006:q1': A(SUB('5/6','3/10')),
  'ex-3am-jam-tarh-kasrayn-l4-006:q2': PICK([LT('1/2',SUB('5/6','3/10')), LT(SUB('5/6','3/10'),'1/2'), EQ(SUB('5/6','3/10'),'1/2')]),
  // ex-3am-jam-tarh-kasrayn-l4-007
  'ex-3am-jam-tarh-kasrayn-l4-007:q1': A(ADD('1/3','1/4')),
  'ex-3am-jam-tarh-kasrayn-l4-007:q2': A(DIV('7/12','2')),
  'ex-3am-jam-tarh-kasrayn-l4-007:q3': PICK([LT('7/24','1/3'), LT('1/3','7/24'), EQ('7/24','1/3')]),
  // ex-3am-jam-tarh-kasrayn-l4-008
  'ex-3am-jam-tarh-kasrayn-l4-008:q1': A(ADD('1/2','1/5')),
  'ex-3am-jam-tarh-kasrayn-l4-008:q2': A(DIV('4/5','7/10')),
  'ex-3am-jam-tarh-kasrayn-l4-008:q3': A(ADD('8/7','1/2')),
  // ex-3am-jam-tarh-kasrayn-l4-009
  'ex-3am-jam-tarh-kasrayn-l4-009:q1': PICK([EQ(ADD('3/4','1/6'),'22/24'), EQ(ADD('3/4','1/6'),'4/10'), EQ(ADD('3/4','1/6'),'4/24')]),
  'ex-3am-jam-tarh-kasrayn-l4-009:q2': A(MUL(ADD('3/4','1/6'),'12')),
  'ex-3am-jam-tarh-kasrayn-l4-009:q3': PICK([LT('5/6',ADD('3/4','1/6')), LT(ADD('3/4','1/6'),'5/6'), EQ(ADD('3/4','1/6'),'5/6')]),
  // ex-3am-jam-tarh-kasrayn-l4-010
  'ex-3am-jam-tarh-kasrayn-l4-010:q1': A(ADD('1/3','1/6')),
  'ex-3am-jam-tarh-kasrayn-l4-010:q2': A(DIV('1',ADD('1/3','1/6'))),
  // ex-3am-jam-tarh-kasrayn-l5-001
  'ex-3am-jam-tarh-kasrayn-l5-001:q1': A(ADD(ADD('5/12','1/4'),'1/3')),
  'ex-3am-jam-tarh-kasrayn-l5-001:q2': PICK([EQ(ADD(ADD('5/12','1/4'),'1/3'),'1'), NOT(EQ(ADD(ADD('5/12','1/4'),'1/3'),'1'))]),
  'ex-3am-jam-tarh-kasrayn-l5-001:q3': PICK([EQ(MAX(['5/12','1/4','1/3']),'5/12'), EQ(MAX(['5/12','1/4','1/3']),'1/4'), EQ(MAX(['5/12','1/4','1/3']),'1/3')]),
  'ex-3am-jam-tarh-kasrayn-l5-001:q4': A(ADD('5/12','1/3')),
  'ex-3am-jam-tarh-kasrayn-l5-001:q5': A(MUL('1/4','1200')),
  // ex-3am-jam-tarh-kasrayn-l5-002
  'ex-3am-jam-tarh-kasrayn-l5-002:q1': A(ADD(ADD('3/5','1/10'),'1/4')),
  'ex-3am-jam-tarh-kasrayn-l5-002:q2': PICK([EQ(ADD(ADD('3/5','1/10'),'1/4'),'1'), NOT(EQ(ADD(ADD('3/5','1/10'),'1/4'),'1'))]),
  'ex-3am-jam-tarh-kasrayn-l5-002:q3': A(SUB('1','19/20')),
  'ex-3am-jam-tarh-kasrayn-l5-002:q4': PICK([EQ(MAX(['3/5','1/10','1/4']),'3/5'), EQ(MAX(['3/5','1/10','1/4']),'1/10'), EQ(MAX(['3/5','1/10','1/4']),'1/4')]),
  'ex-3am-jam-tarh-kasrayn-l5-002:q5': A(MUL('3/5','400')),
  // ex-3am-jam-tarh-kasrayn-l5-003
  'ex-3am-jam-tarh-kasrayn-l5-003:q1': A(MUL('3','1/6')),
  'ex-3am-jam-tarh-kasrayn-l5-003:q2': PICK([EQ(MIN(['1/4','1/6','1/2']),'1/4'), EQ(MIN(['1/4','1/6','1/2']),'1/6'), EQ(MIN(['1/4','1/6','1/2']),'1/2')]),
  'ex-3am-jam-tarh-kasrayn-l5-003:q3': A(ADD(ADD('1/4','1/6'),'1/2')),
  'ex-3am-jam-tarh-kasrayn-l5-003:q4': A(SUB('1','11/12')),
  'ex-3am-jam-tarh-kasrayn-l5-003:q5': A(MUL('1/12','60000')),
  // ex-3am-jam-tarh-kasrayn-l5-004
  'ex-3am-jam-tarh-kasrayn-l5-004:q1': A(MUL('3/4',SUB('1','2/5'))),
  'ex-3am-jam-tarh-kasrayn-l5-004:q2': A(ADD('2/5','9/20')),
  'ex-3am-jam-tarh-kasrayn-l5-004:q3': A(SUB('1','17/20')),
  'ex-3am-jam-tarh-kasrayn-l5-004:q4': A(DIV('18','3/20')),
  // ex-3am-jam-tarh-kasrayn-l5-005
  'ex-3am-jam-tarh-kasrayn-l5-005:q1': A(ADD(ADD('1/4','1/3'),'1/5')),
  'ex-3am-jam-tarh-kasrayn-l5-005:q2': A(SUB('1','47/60')),
  'ex-3am-jam-tarh-kasrayn-l5-005:q3': PICK([NOT(LT('1/5',SUB('1','47/60'))), NOT(NOT(LT('1/5',SUB('1','47/60'))))]),
  'ex-3am-jam-tarh-kasrayn-l5-005:q4': A(SUB('13/60','1/5')),
  'ex-3am-jam-tarh-kasrayn-l5-005:q5': PICK([EQ(MAX(['1/4','1/3','1/5']),'1/4'), EQ(MAX(['1/4','1/3','1/5']),'1/3'), EQ(MAX(['1/4','1/3','1/5']),'1/5')]),
  // ex-3am-jam-tarh-kasrayn-l5-006
  'ex-3am-jam-tarh-kasrayn-l5-006:q1': A(ADD('3/4','2/3')),
  'ex-3am-jam-tarh-kasrayn-l5-006:q2': PICK([NOT(LT('3/2',ADD('3/4','2/3'))), NOT(NOT(LT('3/2',ADD('3/4','2/3'))))]),
  'ex-3am-jam-tarh-kasrayn-l5-006:q3': A(SUB('3/2','17/12')),
  // ex-3am-jam-tarh-kasrayn-l5-007
  'ex-3am-jam-tarh-kasrayn-l5-007:q1': A(ADD(ADD('5/6','3/10'),'7/15')),
  'ex-3am-jam-tarh-kasrayn-l5-007:q2': A(SUB('2','8/5')),
  'ex-3am-jam-tarh-kasrayn-l5-007:q3': PICK([EQ(MAX(['5/6','3/10','7/15']),'5/6'), EQ(MAX(['5/6','3/10','7/15']),'3/10'), EQ(MAX(['5/6','3/10','7/15']),'7/15')]),
  // ex-3am-jam-tarh-kasrayn-l5-008
  'ex-3am-jam-tarh-kasrayn-l5-008:q1': A(ADD(ADD('3/8','1/6'),'5/12')),
  'ex-3am-jam-tarh-kasrayn-l5-008:q2': PICK([EQ(ADD(ADD('3/8','1/6'),'5/12'),'1'), NOT(EQ(ADD(ADD('3/8','1/6'),'5/12'),'1'))]),
  'ex-3am-jam-tarh-kasrayn-l5-008:q3': A(SUB('1','23/24')),
  'ex-3am-jam-tarh-kasrayn-l5-008:q4': A(MUL('1/24','480')),
  // ex-3am-jam-tarh-kasrayn-l5-009
  'ex-3am-jam-tarh-kasrayn-l5-009:q1': A(ADD(ADD('2/9','1/6'),'5/18')),
  'ex-3am-jam-tarh-kasrayn-l5-009:q2': A(SUB('1','2/3')),
  'ex-3am-jam-tarh-kasrayn-l5-009:q3': PICK([EQ(MAX(['2/9','1/6','5/18']),'2/9'), EQ(MAX(['2/9','1/6','5/18']),'1/6'), EQ(MAX(['2/9','1/6','5/18']),'5/18')]),
  // ex-3am-jam-tarh-kasrayn-l5-010
  'ex-3am-jam-tarh-kasrayn-l5-010:q1': A(ADD('3/8','2/5')),
  'ex-3am-jam-tarh-kasrayn-l5-010:q2': A(ADD(ADD('3/8','2/5'),'1/8')),
  'ex-3am-jam-tarh-kasrayn-l5-010:q3': A(SUB('1','9/10')),
  'ex-3am-jam-tarh-kasrayn-l5-010:q4': A(MUL('1/10','15000')),
};
