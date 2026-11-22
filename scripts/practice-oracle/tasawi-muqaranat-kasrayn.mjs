// Oracle du banc « tasawi-muqaranat-kasrayn » (تساوي كسرين ومقارنتهما, 3AM unité 2, 2026-10-26) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول / الثالث »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec un calcul écrit dans ce fichier (rationnels EXACTS
// en BigInt), indépendant de packages/core ; les nombres de l'énoncé sont retapés en littéraux (« 3/4 », « 120 ») :
//  - EQ / LT / NOT / AND : prédicats ; l'égalité de deux fractions et leur comparaison passent par les PRODUITS EN CROIX
//    (a·d contre b·c), jamais par une valeur approchée ; un QCM est jugé option par option : chaque option est une
//    AFFIRMATION évaluée par un calcul (booléen), PICK exige qu'une seule soit vraie (donc toute distraction est FAUSSE) ;
//  - ASC / DESC : une chaîne de fractions est strictement croissante / décroissante (chaque option d'un classement est jugée) ;
//  - un terme manquant est DIV(MUL(..),..) sur la diagonale juste ; LCM, MAX, MIN, CNT, ALONE, LAST (chiffre des unités) ;
//  - audit(bank) : RE-LIT le contenu des QCM (LaTeX) avec son propre analyseur : toute option « fraction ? fraction », toute
//    chaîne de classement et tout « نعم / لا ، لأنّ … » est évaluée, et exactement UNE option doit être vraie et être celle
//    que le contenu marque correcte ; les clés rationnelles sont réduites ; chaque distracteur compté porte MISC-TASAWI-*.
//    Les questions selfCheck n'ont pas de clé.
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
/** « 3/4 », « 0,8 », « -12 », « 7 » → Q (littéral exact, pas de flottant). */
const q = (v) => {
  if (v instanceof Q) return v;
  const s = String(v).trim().replace(',', '.');
  if (s.includes('/')) { const [a, b] = s.split('/'); return q(a).div(q(b)); }
  const neg = s.startsWith('-'); const [i, f = ''] = s.replace('-', '').split('.');
  const r = new Q(BigInt(i + f), 10n ** BigInt(f.length)); return neg ? new Q(-r.n, r.d) : r;
};
const ADD = (a, b) => q(a).add(q(b));
const SUB = (a, b) => q(a).sub(q(b));
const MUL = (a, b) => q(a).mul(q(b));
const DIV = (a, b) => q(a).div(q(b));
const EQ = (a, b) => q(a).eq(q(b));
const LT = (a, b) => q(a).lt(q(b));
const NOT = (b) => !b;
const AND = (a, b) => a && b;
/** Compte les affirmations vraies (un entier exact). */
const CNT = (...bs) => new Q(BigInt(bs.filter(Boolean).length));
/** Le seul élément de la liste qui n'est égal à aucun autre. */
const ALONE = (list) => {
  const hits = list.filter((x, i) => list.every((y, j) => i === j || !EQ(x, y)));
  if (hits.length !== 1) throw new Error(`ALONE : ${hits.length} candidats`);
  return q(hits[0]);
};
const LCM = (a, b) => { const x = q(a).n, y = q(b).n; return new Q((x / gcd(x, y)) * y); };
const MAX = (list) => list.map(q).reduce((m, x) => (m.lt(x) ? x : m));
const MIN = (list) => list.map(q).reduce((m, x) => (x.lt(m) ? x : m));
/** Chiffre des unités d'un entier positif. */
const LAST = (a) => new Q(q(a).n % 10n);
const ASC = (...l) => l.every((x, i) => i === 0 || LT(l[i - 1], x));
const DESC = (...l) => l.every((x, i) => i === 0 || LT(x, l[i - 1]));
/** Une clé « constructed » : la chaîne exacte du résultat. */
const A = (x) => R(q(x).toString());
const PICK = (flags) => {
  const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`QCM : ${hits.length} options justes`);
  return C('ABCDEF'[hits[0]]);
};

/* ── Analyseur LaTeX de l'audit (indépendant du reste) ─────────────────── */
const FRAC = String.raw`\\dfrac\{(\d+)\}\{(\d+)\}`;
/** Valeur d'une expression entière / fractionnaire : « 6 \times 15 », « 9 - 6 », « \dfrac{3}{2} », « 12 ». */
function evalExpr(s) {
  const t = s.replace(new RegExp(FRAC, 'g'), (_, a, b) => `(${a}/${b})`).replace(/\\times/g, '*').replace(/\s+/g, '');
  if (!/^[0-9+\-*/()]+$/.test(t)) throw new Error(`expression illisible : ${s}`);
  // descente récursive : somme > produit/quotient > atome (exact, BigInt)
  let i = 0;
  const atom = () => {
    if (t[i] === '(') { i++; const v = sum(); i++; return v; }
    let j = i; while (j < t.length && /\d/.test(t[j])) j++;
    const v = new Q(BigInt(t.slice(i, j))); i = j; return v;
  };
  const prod = () => { let v = atom(); while (t[i] === '*' || t[i] === '/') { const op = t[i++]; const r = atom(); v = op === '*' ? v.mul(r) : v.div(r); } return v; };
  const sum = () => { let v = prod(); while (t[i] === '+' || t[i] === '-') { const op = t[i++]; const r = prod(); v = op === '+' ? v.add(r) : v.sub(r); } return v; };
  return sum();
}
/** Une chaîne « E1 rel E2 rel E3 » (rel ∈ < > = \neq) est-elle vraie ? */
function chainTrue(latex) {
  const parts = latex.split(/(\\neq|<|>|=)/).map((x) => x.trim()).filter((x) => x !== '');
  if (parts.length < 3 || parts.length % 2 === 0) throw new Error(`chaîne illisible : ${latex}`);
  for (let k = 0; k + 2 < parts.length + 0; k += 2) {
    const l = evalExpr(parts[k]), r = evalExpr(parts[k + 2]), op = parts[k + 1];
    const ok = op === '<' ? l.lt(r) : op === '>' ? r.lt(l) : op === '=' ? l.eq(r) : !l.eq(r);
    if (!ok) return false;
  }
  return true;
}
const islands = (s) => [...s.matchAll(/\$([^$]+)\$/g)].map((x) => x[1]);
/** L'option est-elle une affirmation que l'audit sait juger ? null sinon. */
function judgeOption(content, statement) {
  const m = /^\s*(نعم|لا)\s*،\s*لأنّ\s*(.*)$/.exec(content);
  if (!m) {
    const isl = islands(content);
    if (isl.length !== 1 || !/\\dfrac|\d/.test(isl[0]) || !/(<|>|=)/.test(isl[0]) || /[a-zA-Z]/.test(isl[0].replace(/\\dfrac|\\times|\\neq/g, ''))) return null;
    return chainTrue(isl[0]);
  }
  const eqIsland = islands(statement).find((x) => new RegExp(`^${FRAC}=${FRAC}$`).test(x.replace(/\s+/g, '')));
  if (!eqIsland) return null;
  const f = [...eqIsland.matchAll(new RegExp(FRAC, 'g'))].map((x) => [BigInt(x[1]), BigInt(x[2])]);
  const truth = f[0][0] * f[1][1] === f[0][1] * f[1][0];
  const verdict = m[1] === 'نعم';
  const clauses = islands(m[2]);
  if (!clauses.length) return verdict === truth; // « لأنّ الكسرين متقاربان » : seul le verdict compte
  return verdict === truth && clauses.every(chainTrue);
}

/** Audit de la banque (appelé par practice-answer-oracle.test.mjs) : liste des problèmes (vide = conforme). */
export function audit(bank) {
  const problems = [];
  const MISC = /^MISC-TASAWI-[A-Z]+$/;
  for (const { key, q: qu } of bank) {
    if (qu.answerType === 'rational') {
      const e = String(qu.expectedAnswer);
      const m = /^(-?\d+)(?:\/(\d+))?$/.exec(e);
      if (!m) { problems.push(`${key} : clé non fractionnaire « ${e} » (les clés sont des littéraux exacts p/q)`); continue; }
      if (m[2] !== undefined && gcd(BigInt(m[1]), BigInt(m[2])) !== 1n) problems.push(`${key} : la clé ${e} n'est pas réduite`);
      if (qu.evaluationPolicy?.requiredForm === 'irreducible' && m[2] !== undefined && BigInt(m[2]) === 1n) problems.push(`${key} : clé « /1 »`);
      for (const s of qu.misconceptionSignatures ?? []) {
        if (!MISC.test(s.id)) problems.push(`${key} : signature ${s.id} hors MISC-TASAWI-*`);
        if (q(s.value).eq(q(e))) problems.push(`${key} : la signature ${s.id} (${s.value}) est la bonne réponse`);
      }
    } else if (qu.answerType === 'choice') {
      const good = qu.choices.filter((c) => c.isCorrect);
      if (good.length !== 1) problems.push(`${key} : ${good.length} bonnes options`);
      // Un pas de décision « counted: false » (conclusion d'une situation) n'a pas de misconception : son distracteur est une conclusion fausse.
      for (const c of qu.choices.filter((x) => !x.isCorrect && qu.counted !== false)) {
        if (!c.misconceptionId || !MISC.test(c.misconceptionId)) problems.push(`${key} : le distracteur ${c.id} ne porte pas de MISC-TASAWI-*`);
      }
      // Relecture du contenu : si TOUTES les options sont des affirmations lisibles, une seule est vraie et c'est la marquée.
      let judged;
      try { judged = qu.choices.map((c) => judgeOption(c.content, qu.statement)); } catch (err) { problems.push(`${key} : ${err.message}`); continue; }
      if (judged.every((j) => j !== null)) {
        const truths = judged.filter(Boolean).length;
        if (truths !== 1) problems.push(`${key} : ${truths} options vraies à la relecture du contenu`);
        qu.choices.forEach((c, k) => { if (judged[k] !== c.isCorrect) problems.push(`${key} : l'option ${c.id} est ${judged[k] ? 'vraie' : 'fausse'} mais marquée ${c.isCorrect ? 'correcte' : 'incorrecte'}`); });
      }
    }
  }
  return problems;
}

export const ORACLE = {
  // ex-3am-tasawi-muqaranat-kasrayn-l1-001
  'ex-3am-tasawi-muqaranat-kasrayn-l1-001:q1': PICK([LT('0',SUB('3/2','4/3')), LT(SUB('3/2','4/3'),'0'), EQ(SUB('3/2','4/3'),'0')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-001:q3': A(DIV(MUL('3','6'),'2')),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-001:q4': A(DIV(MUL('4','6'),'3')),
  // ex-3am-tasawi-muqaranat-kasrayn-l1-002
  'ex-3am-tasawi-muqaranat-kasrayn-l1-002:q1': PICK([AND(NOT(EQ(MUL('6','15'),MUL('9','10'))),NOT(EQ('6','10'))), AND(EQ(MUL('6','15'),MUL('9','10')),EQ(MUL('6','15'),MUL('9','10'))), AND(NOT(EQ(MUL('6','15'),MUL('9','10'))),NOT(EQ(SUB('15','9'),SUB('10','6'))))]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-002:q2': PICK([AND(EQ(MUL('4','20'),MUL('7','12')),EQ('12',MUL('4','3'))), AND(EQ(MUL('4','20'),MUL('7','12')),true), AND(NOT(EQ(MUL('4','20'),MUL('7','12'))),NOT(EQ(MUL('4','20'),MUL('7','12'))))]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-002:q3': PICK([AND(EQ(MUL('8','9'),MUL('12','6')),EQ(MUL('8','9'),MUL('12','6'))), AND(NOT(EQ(MUL('8','9'),MUL('12','6'))),NOT(EQ('8','6'))), AND(NOT(EQ(MUL('8','9'),MUL('12','6'))),NOT(EQ(SUB('9','12'),SUB('6','8'))))]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-002:q4': A(CNT(EQ(MUL('6','15'),MUL('9','10')),EQ(MUL('4','20'),MUL('7','12')),EQ(MUL('8','9'),MUL('12','6')))),
  // ex-3am-tasawi-muqaranat-kasrayn-l1-003
  'ex-3am-tasawi-muqaranat-kasrayn-l1-003:q1': A(CNT(EQ('3/2','14/16'),EQ('3/2','5/4'),EQ('3/2','7/8'),EQ('3/2','21/14'),EQ('3/2','30/20'))),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-003:q2': A(CNT(EQ('7/8','14/16'),EQ('7/8','3/2'),EQ('7/8','5/4'),EQ('7/8','21/14'),EQ('7/8','30/20'))),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-003:q3': A(ALONE(['14/16','3/2','5/4','7/8','21/14','30/20'])),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-003:q4': PICK([AND(NOT(EQ(MUL('14','8'),MUL('16','7'))),NOT(EQ('14','7'))), AND(EQ(MUL('14','8'),MUL('16','7')),EQ(MUL('14','8'),MUL('16','7'))), AND(NOT(EQ(MUL('14','8'),MUL('16','7'))),NOT(EQ(SUB('8','16'),SUB('7','14'))))]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-003:q5': PICK([AND(EQ(MUL('5','20'),MUL('4','30')),EQ('30',MUL('5','6'))), AND(EQ(MUL('5','20'),MUL('4','30')),true), AND(NOT(EQ(MUL('5','20'),MUL('4','30'))),NOT(EQ(MUL('5','20'),MUL('4','30'))))]),
  // ex-3am-tasawi-muqaranat-kasrayn-l1-004
  'ex-3am-tasawi-muqaranat-kasrayn-l1-004:q1': PICK([LT('7/10','5/7'), LT('5/7','7/10'), EQ('5/7','7/10')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-004:q2': PICK([EQ('4/7','5/8'), LT('4/7','5/8')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-004:q3': PICK([EQ('11/15','3/4'), LT('3/4','11/15'), LT('11/15','3/4')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-004:q4': PICK([EQ('9/10','8/9'), LT('8/9','9/10')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l1-005
  'ex-3am-tasawi-muqaranat-kasrayn-l1-005:q1': PICK([AND(EQ(MUL('7','19'),MUL('19','21')),EQ('21',MUL('7','3'))), AND(NOT(EQ(MUL('7','19'),MUL('19','21'))),NOT(EQ(MUL('7','19'),MUL('19','21')))), AND(EQ(MUL('7','19'),MUL('19','21')),true)]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-005:q2': PICK([AND(NOT(EQ(MUL('3','40'),MUL('8','15'))),NOT(EQ('3','15'))), AND(NOT(EQ(MUL('3','40'),MUL('8','15'))),NOT(EQ(SUB('40','8'),SUB('15','3')))), AND(EQ(MUL('3','40'),MUL('8','15')),EQ(MUL('3','40'),MUL('8','15')))]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-005:q3': PICK([AND(NOT(EQ(MUL('5','25'),MUL('9','14'))),NOT(EQ(MUL('5','25'),MUL('9','14')))), AND(EQ(MUL('5','25'),MUL('9','14')),true)]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-005:q4': A(DIV(MUL('5','21'),'15')),
  // ex-3am-tasawi-muqaranat-kasrayn-l1-006
  'ex-3am-tasawi-muqaranat-kasrayn-l1-006:q1': A(DIV(MUL('3','12'),'4')),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-006:q2': A(DIV(MUL('7','20'),'5')),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-006:q3': A(DIV(MUL('10','9'),'15')),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-006:q4': A(DIV(MUL('3','20'),'12')),
  // ex-3am-tasawi-muqaranat-kasrayn-l1-007
  'ex-3am-tasawi-muqaranat-kasrayn-l1-007:q1': A(MUL('12','35')),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-007:q2': A(MUL('28','15')),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-007:q3': PICK([AND(NOT(EQ(MUL('12','35'),MUL('28','15'))),NOT(EQ('12','15'))), AND(EQ(MUL('12','35'),MUL('28','15')),EQ(MUL('12','35'),MUL('28','15'))), AND(NOT(EQ(MUL('12','35'),MUL('28','15'))),NOT(EQ(SUB('35','28'),SUB('15','12'))))]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-007:q4': A(DIV(MUL('12','7'),'28')),
  // ex-3am-tasawi-muqaranat-kasrayn-l1-008
  'ex-3am-tasawi-muqaranat-kasrayn-l1-008:q1': A(DIV('24','36')),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-008:q2': A(DIV('150','210')),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-008:q3': A(DIV('48','36')),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-008:q4': A(MUL('24','3')),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-008:q5': A(MUL('36','2')),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-008:q6': PICK([AND(NOT(EQ(MUL('24','3'),MUL('36','2'))),NOT(EQ('24','2'))), AND(NOT(EQ(MUL('24','3'),MUL('36','2'))),NOT(EQ(SUB('3','36'),SUB('2','24')))), AND(EQ(MUL('24','3'),MUL('36','2')),EQ(MUL('24','3'),MUL('36','2')))]),
  // ex-3am-tasawi-muqaranat-kasrayn-l1-009
  'ex-3am-tasawi-muqaranat-kasrayn-l1-009:q1': PICK([LT('5/6','5/8'), LT('5/8','5/6')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-009:q2': PICK([LT('7/12','3/4'), LT('3/4','7/12')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-009:q3': PICK([LT('2/5','3/10'), LT('3/10','2/5')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-009:q4': PICK([LT('7/9','5/6'), EQ('7/9','5/6'), LT('5/6','7/9')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l1-010
  'ex-3am-tasawi-muqaranat-kasrayn-l1-010:q1': PICK([EQ('12/18','14/20'), EQ('12/18','2/3'), EQ('12/18','6/18')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-010:q2': PICK([EQ('15/20','17/22'), EQ('15/20','15/10'), EQ('15/20','3/4')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-010:q3': A(DIV(MUL('15','8'),'20')),
  'ex-3am-tasawi-muqaranat-kasrayn-l1-010:q4': A(DIV(MUL('24','15'),'18')),
  // ex-3am-tasawi-muqaranat-kasrayn-l2-001
  'ex-3am-tasawi-muqaranat-kasrayn-l2-001:q1': PICK([LT('57/40','3/2'), EQ('57/40','3/2'), LT('3/2','57/40')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-001:q3': A(DIV(MUL('57','120'),'40')),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-001:q4': A(DIV(MUL('3','120'),'2')),
  // ex-3am-tasawi-muqaranat-kasrayn-l2-002
  'ex-3am-tasawi-muqaranat-kasrayn-l2-002:q1': PICK([LT('5/7','7/9'), EQ('7/9','5/7')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-002:q3': PICK([EQ('11/18','7/12'), LT('7/12','11/18')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-002:q4': A(DIV(MUL('7','36'),'12')),
  // ex-3am-tasawi-muqaranat-kasrayn-l2-003
  'ex-3am-tasawi-muqaranat-kasrayn-l2-003:q1': PICK([AND(NOT(EQ(MUL('5','8'),MUL('6','7'))),NOT(EQ(MUL('5','8'),MUL('6','7')))), AND(EQ(MUL('5','8'),MUL('6','7')),EQ(SUB('6','5'),SUB('8','7'))), AND(EQ(MUL('5','8'),MUL('6','7')),true)]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-003:q3': PICK([EQ('5/6','7/8'), LT('5/6','7/8')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-003:q4': A(SUB(MUL('6','7'),MUL('5','8'))),
  // ex-3am-tasawi-muqaranat-kasrayn-l2-004
  'ex-3am-tasawi-muqaranat-kasrayn-l2-004:q1': PICK([AND(EQ(MUL('3','6'),MUL('4','5')),EQ(SUB('4','3'),SUB('6','5'))), AND(EQ(MUL('3','6'),MUL('4','5')),true), AND(NOT(EQ(MUL('3','6'),MUL('4','5'))),NOT(EQ(MUL('3','6'),MUL('4','5'))))]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-004:q3': PICK([AND(EQ(MUL('10','21'),MUL('15','14')),EQ(MUL('10','21'),MUL('15','14'))), AND(NOT(EQ(MUL('10','21'),MUL('15','14'))),NOT(EQ('10','14'))), AND(NOT(EQ(MUL('10','21'),MUL('15','14'))),NOT(EQ(SUB('21','15'),SUB('14','10'))))]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-004:q4': PICK([EQ('7/10','3/4'), LT('7/10','3/4'), LT('3/4','7/10')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l2-005
  'ex-3am-tasawi-muqaranat-kasrayn-l2-005:q1': PICK([LT('23/24','23/25'), EQ('23/24','23/25'), LT('23/25','23/24')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-005:q2': PICK([LT('13/16','15/14'), LT('15/14','13/16')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-005:q3': PICK([EQ('33/34','35/36'), LT('33/34','35/36')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l2-006
  'ex-3am-tasawi-muqaranat-kasrayn-l2-006:q1': A(LAST(MUL('123456789','98765432'))),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-006:q2': A(LAST(MUL('987654321','12345679'))),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-006:q3': PICK([EQ(MUL('123456789','98765432'),MUL('987654321','12345679')), EQ(MUL('123456789','98765432'),MUL('987654321','12345679')), NOT(EQ(MUL('123456789','98765432'),MUL('987654321','12345679')))]),
  // ex-3am-tasawi-muqaranat-kasrayn-l2-007
  'ex-3am-tasawi-muqaranat-kasrayn-l2-007:q1': A(DIV(MUL('7','30'),'10')),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-007:q2': A(DIV(MUL('11','30'),'15')),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-007:q3': PICK([EQ('7/10','11/15'), LT('7/10','11/15')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-007:q4': A(LCM('10','15')),
  // ex-3am-tasawi-muqaranat-kasrayn-l2-008
  'ex-3am-tasawi-muqaranat-kasrayn-l2-008:q1': PICK([AND(EQ(MUL('8','10'),MUL('9','9')),EQ(SUB('9','8'),SUB('10','9'))), AND(NOT(EQ(MUL('8','10'),MUL('9','9'))),NOT(EQ(MUL('8','10'),MUL('9','9')))), AND(EQ(MUL('8','10'),MUL('9','9')),true)]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-008:q2': PICK([EQ('8/9','9/10'), LT('8/9','9/10')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-008:q4': A(DIV(MUL('8','27'),'9')),
  // ex-3am-tasawi-muqaranat-kasrayn-l2-009
  'ex-3am-tasawi-muqaranat-kasrayn-l2-009:q1': PICK([LT('13/21','13/20'), LT('13/20','13/21'), EQ('13/20','13/21')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-009:q2': PICK([LT('125/97','61/340'), LT('61/340','125/97')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-009:q3': PICK([EQ('11/6','9/4'), LT('9/4','11/6'), LT('11/6','9/4')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l2-010
  'ex-3am-tasawi-muqaranat-kasrayn-l2-010:q1': PICK([LT('4/9','5/11'), LT('3/5','7/12'), EQ('5/8','7/11')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-010:q3': PICK([LT('5/8','9/14'), EQ('9/14','5/8')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l2-010:q4': A(DIV(MUL('9','42'),'14')),
  // ex-3am-tasawi-muqaranat-kasrayn-l3-001
  'ex-3am-tasawi-muqaranat-kasrayn-l3-001:q1': A(DIV(MUL('5','12'),'3')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-001:q2': A(DIV(MUL('7','12'),'4')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-001:q3': A(DIV(MUL('11','12'),'6')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-001:q4': PICK([ASC('3/2','5/3','7/4','11/6','19/12'), ASC('3/2','19/12','5/3','7/4','11/6')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l3-002
  'ex-3am-tasawi-muqaranat-kasrayn-l3-002:q1': A(DIV(MUL('5','120'),'8')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-002:q2': A(DIV(MUL('11','120'),'24')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-002:q3': A(DIV(MUL('7','120'),'20')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-002:q4': PICK([DESC('4/5','2/3','5/8','11/24','7/20'), DESC('11/24','7/20','5/8','4/5','2/3')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l3-003
  'ex-3am-tasawi-muqaranat-kasrayn-l3-003:q1': A(DIV(MUL('3','24'),'8')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-003:q2': A(DIV(MUL('7','24'),'12')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-003:q3': PICK([ASC('2/3','3/8','5/6','7/12'), ASC('3/8','7/12','2/3','5/6'), ASC('2/3','5/6','3/8','7/12')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-003:q4': A(MAX(['5/6','3/8','2/3','7/12'])),
  // ex-3am-tasawi-muqaranat-kasrayn-l3-004
  'ex-3am-tasawi-muqaranat-kasrayn-l3-004:q1': A(LCM(LCM('3','8'),'12')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-004:q2': PICK([ASC('7/12','5/8','2/3'), ASC('2/3','5/8','7/12')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-004:q3': PICK([LT('5/8','2/3'), EQ('5/8','2/3'), LT('2/3','5/8')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-004:q4': A(DIV(MUL('7','48'),'12')),
  // ex-3am-tasawi-muqaranat-kasrayn-l3-005
  'ex-3am-tasawi-muqaranat-kasrayn-l3-005:q1': A(DIV(MUL('4','15'),'6')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-005:q2': A(DIV(MUL('7','36'),'21')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-005:q3': A(DIV(MUL('24','15'),'18')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-005:q4': A(DIV(MUL('8','35'),'20')),
  // ex-3am-tasawi-muqaranat-kasrayn-l3-006
  'ex-3am-tasawi-muqaranat-kasrayn-l3-006:q1': PICK([LT('99/100','100/101'), EQ('99/100','100/101')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-006:q2': PICK([LT('17/12','19/20'), LT('19/20','17/12')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-006:q3': PICK([LT('11/14','11/13'), EQ('11/14','11/13'), LT('11/13','11/14')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-006:q4': PICK([LT('7/8','13/20'), LT('13/20','7/8')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l3-007
  'ex-3am-tasawi-muqaranat-kasrayn-l3-007:q1': PICK([ASC('5/8','7/10','3/4'), ASC('3/4','5/8','7/10')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-007:q2': A(MAX(['7/10','3/4','5/8'])),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-007:q3': A(DIV(MUL('7','40'),'10')),
  // ex-3am-tasawi-muqaranat-kasrayn-l3-008
  'ex-3am-tasawi-muqaranat-kasrayn-l3-008:q1': PICK([DESC('7/12','5/8','3/5','2/3'), DESC('2/3','5/8','3/5','7/12')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-008:q2': A(DIV(MUL('3','60'),'5')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-008:q3': A(DIV(MUL('7','60'),'12')),
  // ex-3am-tasawi-muqaranat-kasrayn-l3-009
  'ex-3am-tasawi-muqaranat-kasrayn-l3-009:q1': A(DIV(MUL('3','20'),'12')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-009:q2': A(DIV(MUL('20','18'),'24')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-009:q3': A(DIV(MUL('7','45'),'35')),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-009:q4': PICK([LT('5/9','9/16'), EQ('9/16','5/9')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l3-010
  'ex-3am-tasawi-muqaranat-kasrayn-l3-010:q1': PICK([LT('53/27','53/29'), EQ('53/27','53/29'), LT('53/29','53/27')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-010:q2': PICK([LT('402/401','401/400'), EQ('402/401','401/400'), LT('401/400','402/401')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l3-010:q3': PICK([LT('517/498','622/713'), LT('622/713','517/498')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l4-001
  'ex-3am-tasawi-muqaranat-kasrayn-l4-001:q1': A(DIV('12','4/5')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-001:q2': PICK([LT('15','31/2'), EQ('15','31/2')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-001:q3': A(DIV(MUL('15','2'),'1')),
  // ex-3am-tasawi-muqaranat-kasrayn-l4-002
  'ex-3am-tasawi-muqaranat-kasrayn-l4-002:q1': A(DIV('3/4','5/6')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-002:q2': PICK([EQ('9/10','7/8'), LT('7/8','9/10')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-002:q3': A(DIV(MUL('9','40'),'10')),
  // ex-3am-tasawi-muqaranat-kasrayn-l4-003
  'ex-3am-tasawi-muqaranat-kasrayn-l4-003:q1': A(DIV('5/6','2/3')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-003:q2': A(DIV('7/8','3/4')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-003:q3': PICK([LT('5/4','7/6'), LT('7/6','5/4'), EQ('5/4','7/6')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l4-004
  'ex-3am-tasawi-muqaranat-kasrayn-l4-004:q1': A(DIV('7/9','8/9')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-004:q2': PICK([LT('1','7/8'), LT('7/8','1')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-004:q3': A(DIV('11/6','5/3')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-004:q4': PICK([LT('1','11/10'), EQ('11/10','1')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l4-005
  'ex-3am-tasawi-muqaranat-kasrayn-l4-005:q1': A(DIV('1','2/7')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-005:q2': PICK([LT('7/2','7/3'), LT('7/3','7/2')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l4-006
  'ex-3am-tasawi-muqaranat-kasrayn-l4-006:q1': A(DIV('3/5','9/10')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-006:q2': A(DIV(MUL('2','21'),'3')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-006:q3': PICK([AND(NOT(EQ(MUL('2','21'),MUL('3','14'))),NOT(EQ('2','14'))), AND(NOT(EQ(MUL('2','21'),MUL('3','14'))),NOT(EQ(SUB('21','3'),SUB('14','2')))), AND(EQ(MUL('2','21'),MUL('3','14')),EQ(MUL('2','21'),MUL('3','14')))]),
  // ex-3am-tasawi-muqaranat-kasrayn-l4-007
  'ex-3am-tasawi-muqaranat-kasrayn-l4-007:q1': A(DIV('2/3','1/4')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-007:q2': A(DIV('5/6','1/3')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-007:q3': PICK([EQ('8/3','5/2'), LT('5/2','8/3')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-007:q4': A(DIV(MUL('8','6'),'3')),
  // ex-3am-tasawi-muqaranat-kasrayn-l4-008
  'ex-3am-tasawi-muqaranat-kasrayn-l4-008:q1': A(DIV('5/6','5/12')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-008:q2': PICK([LT('2','13/6'), EQ('2','13/6')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-008:q3': A(DIV(MUL('2','6'),'1')),
  // ex-3am-tasawi-muqaranat-kasrayn-l4-009
  'ex-3am-tasawi-muqaranat-kasrayn-l4-009:q1': A(DIV('8/9','2/3')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-009:q2': PICK([LT('4/3','8/9'), LT('8/9','4/3')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-009:q3': PICK([LT('4/3','3/2'), EQ('4/3','3/2'), LT('3/2','4/3')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l4-010
  'ex-3am-tasawi-muqaranat-kasrayn-l4-010:q1': A(DIV('2/5','4/15')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-010:q2': A(DIV('7/8','3/5')),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-010:q3': PICK([LT('3/2','35/24'), LT('35/24','3/2'), EQ('3/2','35/24')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l4-010:q4': A(DIV(MUL('3','24'),'2')),
  // ex-3am-tasawi-muqaranat-kasrayn-l5-001
  'ex-3am-tasawi-muqaranat-kasrayn-l5-001:q1': A(DIV(MUL('3','24'),'8')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-001:q2': A(DIV(MUL('1','24'),'3')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-001:q3': PICK([ASC('5/24','1/3','3/8'), ASC('1/3','3/8','5/24')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-001:q4': A(MAX(['3/8','1/3','5/24'])),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-001:q5': PICK([LT(ADD(ADD('3/8','1/3'),'5/24'),'1'), EQ(ADD(ADD('3/8','1/3'),'5/24'),'1'), EQ(ADD(ADD('3/8','1/3'),'5/24'),'1')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l5-002
  'ex-3am-tasawi-muqaranat-kasrayn-l5-002:q1': A(DIV(MUL('2','120'),'5')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-002:q2': A(DIV(MUL('1','120'),'6')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-002:q3': A(DIV(MUL('3','120'),'8')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-002:q4': A(MAX(['2/5','1/6','3/8'])),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-002:q5': PICK([ASC('1/6','2/5','3/8'), ASC('1/6','3/8','2/5'), ASC('2/5','1/6','3/8')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-002:q6': PICK([EQ(ADD(ADD('2/5','1/6'),'3/8'),'1'), LT(ADD(ADD('2/5','1/6'),'3/8'),'1')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l5-003
  'ex-3am-tasawi-muqaranat-kasrayn-l5-003:q1': A(MUL('2','1/6')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-003:q2': PICK([ASC('1/6','1/4','1/3'), ASC('1/3','1/4','1/6')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-003:q3': A(MIN(['1/4','1/6','1/3'])),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-003:q4': A(SUB('1',ADD(ADD('1/4','1/6'),'1/3'))),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-003:q5': A(MUL('1/4','240000')),
  // ex-3am-tasawi-muqaranat-kasrayn-l5-004
  'ex-3am-tasawi-muqaranat-kasrayn-l5-004:q1': PICK([ASC('4/7','5/9','6/11'), ASC('6/11','5/9','4/7')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-004:q2': A(MIN(['4/7','5/9','6/11'])),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-004:q3': A(DIV(MUL('6','66'),'11')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-004:q4': PICK([AND(LT(SUB('5/9','1/2'),SUB('6/11','1/2')),LT(SUB('5/9','1/2'),SUB('4/7','1/2'))), AND(LT(SUB('4/7','1/2'),SUB('6/11','1/2')),LT(SUB('4/7','1/2'),SUB('5/9','1/2'))), AND(LT(SUB('6/11','1/2'),SUB('5/9','1/2')),LT(SUB('6/11','1/2'),SUB('4/7','1/2')))]),
  // ex-3am-tasawi-muqaranat-kasrayn-l5-005
  'ex-3am-tasawi-muqaranat-kasrayn-l5-005:q1': A(DIV(MUL('7','40'),'20')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-005:q2': A(DIV(MUL('3','40'),'8')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-005:q3': A(DIV(MUL('1','40'),'5')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-005:q4': PICK([ASC('1/5','3/8','7/20'), ASC('1/5','7/20','3/8')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-005:q5': A(MAX(['7/20','3/8','1/5'])),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-005:q6': PICK([LT(ADD(ADD('7/20','3/8'),'1/5'),'1'), EQ(ADD(ADD('7/20','3/8'),'1/5'),'1')]),
  // ex-3am-tasawi-muqaranat-kasrayn-l5-006
  'ex-3am-tasawi-muqaranat-kasrayn-l5-006:q1': PICK([EQ('7/8','9/10'), LT('7/8','9/10')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-006:q2': PICK([LT('11/13','7/8'), EQ('11/13','7/8'), LT('7/8','11/13')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-006:q3': PICK([ASC('7/8','9/10','11/13'), ASC('11/13','7/8','9/10')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-006:q4': A(MAX(['7/8','9/10','11/13'])),
  // ex-3am-tasawi-muqaranat-kasrayn-l5-007
  'ex-3am-tasawi-muqaranat-kasrayn-l5-007:q1': PICK([AND(NOT(EQ(MUL('7','9'),MUL('12','5'))),NOT(EQ(MUL('7','9'),MUL('12','5')))), AND(EQ(MUL('7','9'),MUL('12','5')),true)]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-007:q2': PICK([EQ('7/12','5/9'), LT('5/9','7/12')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-007:q3': A(DIV(MUL('7','24'),'12')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-007:q4': A(DIV(MUL('7','18'),'12')),
  // ex-3am-tasawi-muqaranat-kasrayn-l5-008
  'ex-3am-tasawi-muqaranat-kasrayn-l5-008:q1': PICK([ASC('5/7','8/11','7/9'), ASC('5/7','7/9','8/11')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-008:q2': A(MAX(['5/7','8/11','7/9'])),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-008:q3': PICK([EQ('7/9','3/4'), LT('3/4','7/9')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-008:q4': A(DIV(MUL('5','63'),'7')),
  // ex-3am-tasawi-muqaranat-kasrayn-l5-009
  'ex-3am-tasawi-muqaranat-kasrayn-l5-009:q1': PICK([ASC('4/15','2/7','3/10'), ASC('2/7','3/10','4/15')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-009:q2': PICK([LT('2/7','4/15'), LT('4/15','2/7'), EQ('2/7','4/15')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-009:q3': A(DIV('450','3/10')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-009:q4': A(MUL('4/15','1500')),
  // ex-3am-tasawi-muqaranat-kasrayn-l5-010
  'ex-3am-tasawi-muqaranat-kasrayn-l5-010:q1': A(DIV(MUL('5','36'),'9')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-010:q2': A(DIV(MUL('7','36'),'12')),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-010:q3': PICK([LT('5/9','7/12'), EQ('5/9','7/12')]),
  'ex-3am-tasawi-muqaranat-kasrayn-l5-010:q4': PICK([LT('5/9','7/12'), LT('7/12','5/9'), EQ('5/9','7/12')]),
};
