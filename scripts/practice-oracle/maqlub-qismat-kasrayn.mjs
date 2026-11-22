// Oracle du banc « maqlub-qismat-kasrayn » (مقلوب عدد وقسمة كسرين, 3AM unité 2, 2026-10-25) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec un calcul écrit dans ce fichier (rationnels EXACTS
// en BigInt), indépendant de packages/core ; les nombres de l'énoncé sont retapés en littéraux (« 3/4 », « 0,8 », « 12 ») :
//  - DIV(a,b) = a ÷ b, INV(x) = 1/x : INV REFUSE 0 et VÉRIFIE x·(1/x) = 1 (tout réciproque de la banque passe par là) ;
//  - NEG, ADD, SUB, MUL, PW (puissance entière), RND(x,d) (arrondi HALF-UP exact à d décimales), FLOOR ;
//  - EQ / LT / NOT / AND : prédicats ; un QCM est jugé option par option : chaque option est une AFFIRMATION évaluée par un
//    calcul (booléen), PICK exige qu'une seule soit vraie (donc toute distraction est FAUSSE) ;
//  - audit(bank) : les clés « irréductibles » sont réduites, chaque QCM a une seule bonne option et ses distracteurs portent
//    une misconception MISC-MAQLUB-*, chaque signature de misconception est fausse. Les questions selfCheck n'ont pas de clé.
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
const ONE = new Q(1n);
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
const NEG = (a) => new Q(0n).sub(q(a));
/** Le mathématique : 0 n'a pas de réciproque ; et x · INV(x) = 1 est VÉRIFIÉ. */
const INV = (a) => {
  const x = q(a);
  if (x.n === 0n) throw new Error('0 n\'a pas de réciproque');
  const y = ONE.div(x);
  if (!x.mul(y).eq(ONE)) throw new Error(`${x} × ${y} ≠ 1`);
  return y;
};
const EQ = (a, b) => q(a).eq(q(b));
const LT = (a, b) => q(a).lt(q(b));
const NOT = (b) => !b;
const AND = (a, b) => a && b;
const PW = (a, n) => { let r = ONE; for (let i = 0; i < n; i++) r = r.mul(q(a)); return r; };
const FLOOR = (a) => { const x = q(a); let f = x.n / x.d; if (x.n < 0n && x.n % x.d !== 0n) f -= 1n; return new Q(f); };
/** Arrondi HALF-UP exact à d décimales (x ≥ 0). */
const RND = (a, d) => {
  const m = 10n ** BigInt(d); const v = q(a).mul(new Q(m)); const fl = v.n / v.d;
  const up = v.sub(new Q(fl)).mul(new Q(2n));
  return new Q(up.n >= up.d ? fl + 1n : fl, m);
};
/** Une clé « constructed » : la chaîne exacte du résultat. */
const A = (x) => R(q(x).toString());
const PICK = (flags) => {
  const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`QCM : ${hits.length} options justes`);
  return C('ABCDEF'[hits[0]]);
};

/** Audit de la banque (appelé par practice-answer-oracle.test.mjs) : liste des problèmes (vide = conforme). */
export function audit(bank) {
  const problems = [];
  const MISC = /^MISC-MAQLUB-[A-Z]+$/;
  for (const { key, q: qu } of bank) {
    if (qu.answerType === 'rational') {
      const e = String(qu.expectedAnswer);
      const m = /^(-?\d+)(?:\/(\d+))?$/.exec(e);
      if (!m) { problems.push(`${key} : clé non fractionnaire « ${e} » (les clés sont des littéraux exacts p/q)`); continue; }
      if (m[2] !== undefined && gcd(BigInt(m[1]), BigInt(m[2])) !== 1n) problems.push(`${key} : la clé ${e} n'est pas réduite`);
      if (qu.evaluationPolicy?.requiredForm === 'irreducible' && m[2] !== undefined && BigInt(m[2]) === 1n) problems.push(`${key} : clé « /1 »`);
      for (const s of qu.misconceptionSignatures ?? []) {
        if (!MISC.test(s.id)) problems.push(`${key} : signature ${s.id} hors MISC-MAQLUB-*`);
        if (q(s.value).eq(q(e))) problems.push(`${key} : la signature ${s.id} (${s.value}) est la bonne réponse`);
      }
    } else if (qu.answerType === 'choice') {
      const good = qu.choices.filter((c) => c.isCorrect);
      if (good.length !== 1) problems.push(`${key} : ${good.length} bonnes options`);
      // Un pas de décision « counted: false » (conclusion d'une situation) n'a pas de misconception : son distracteur est une conclusion fausse.
      for (const c of qu.choices.filter((x) => !x.isCorrect && qu.counted !== false)) {
        if (!c.misconceptionId || !MISC.test(c.misconceptionId)) problems.push(`${key} : le distracteur ${c.id} ne porte pas de MISC-MAQLUB-*`);
      }
    }
  }
  return problems;
}

export const ORACLE = {
  // ex-3am-maqlub-qismat-kasrayn-l1-001
  'ex-3am-maqlub-qismat-kasrayn-l1-001:q1': A(SUB(MUL('7','3'),'6')),
  'ex-3am-maqlub-qismat-kasrayn-l1-001:q2': A(SUB(MUL('4','5'),MUL('2','5'))),
  'ex-3am-maqlub-qismat-kasrayn-l1-001:q3': A(INV(DIV('15','10'))),
  'ex-3am-maqlub-qismat-kasrayn-l1-001:q4': A(NEG(DIV('15','10'))),
  // ex-3am-maqlub-qismat-kasrayn-l1-002
  'ex-3am-maqlub-qismat-kasrayn-l1-002:q1': A(MUL('0,8','2,5')),
  'ex-3am-maqlub-qismat-kasrayn-l1-002:q2': A(ADD('1,2','0,3')),
  'ex-3am-maqlub-qismat-kasrayn-l1-002:q3': A(INV('2')),
  'ex-3am-maqlub-qismat-kasrayn-l1-002:q4': A(INV('1,5')),
  'ex-3am-maqlub-qismat-kasrayn-l1-002:q5': A(DIV('2','1,5')),
  'ex-3am-maqlub-qismat-kasrayn-l1-002:q6': A(RND(DIV('2','1,5'),2)),
  // ex-3am-maqlub-qismat-kasrayn-l1-003
  'ex-3am-maqlub-qismat-kasrayn-l1-003:q1': A(INV('4')),
  'ex-3am-maqlub-qismat-kasrayn-l1-003:q2': A(INV('9')),
  'ex-3am-maqlub-qismat-kasrayn-l1-003:q3': A(INV('25')),
  'ex-3am-maqlub-qismat-kasrayn-l1-003:q4': A(INV('100')),
  // ex-3am-maqlub-qismat-kasrayn-l1-004
  'ex-3am-maqlub-qismat-kasrayn-l1-004:q1': A(INV('0,5')),
  'ex-3am-maqlub-qismat-kasrayn-l1-004:q2': A(INV('0,25')),
  'ex-3am-maqlub-qismat-kasrayn-l1-004:q3': A(INV('0,04')),
  'ex-3am-maqlub-qismat-kasrayn-l1-004:q4': A(INV('1,25')),
  // ex-3am-maqlub-qismat-kasrayn-l1-005
  'ex-3am-maqlub-qismat-kasrayn-l1-005:q1': A(INV('2/7')),
  'ex-3am-maqlub-qismat-kasrayn-l1-005:q2': A(INV('5/3')),
  'ex-3am-maqlub-qismat-kasrayn-l1-005:q3': A(INV('9/10')),
  'ex-3am-maqlub-qismat-kasrayn-l1-005:q4': A(INV('12/5')),
  // ex-3am-maqlub-qismat-kasrayn-l1-006
  'ex-3am-maqlub-qismat-kasrayn-l1-006:q1': A(INV('12')),
  'ex-3am-maqlub-qismat-kasrayn-l1-006:q2': A(INV('0,6')),
  'ex-3am-maqlub-qismat-kasrayn-l1-006:q3': A(INV('0,016')),
  'ex-3am-maqlub-qismat-kasrayn-l1-006:q4': A(INV('3/11')),
  // ex-3am-maqlub-qismat-kasrayn-l1-007
  'ex-3am-maqlub-qismat-kasrayn-l1-007:q1': A(INV('4')),
  'ex-3am-maqlub-qismat-kasrayn-l1-007:q2': A(INV('0,5')),
  'ex-3am-maqlub-qismat-kasrayn-l1-007:q3': A(INV('5/3')),
  'ex-3am-maqlub-qismat-kasrayn-l1-007:q4': A(INV('11/8')),
  // ex-3am-maqlub-qismat-kasrayn-l1-008
  'ex-3am-maqlub-qismat-kasrayn-l1-008:q1': A(DIV('4','2/3')),
  'ex-3am-maqlub-qismat-kasrayn-l1-008:q2': A(DIV('6','3/5')),
  'ex-3am-maqlub-qismat-kasrayn-l1-008:q3': A(DIV('9','3/4')),
  'ex-3am-maqlub-qismat-kasrayn-l1-008:q4': A(DIV('10','5/6')),
  // ex-3am-maqlub-qismat-kasrayn-l1-009
  'ex-3am-maqlub-qismat-kasrayn-l1-009:q1': A(DIV('3/4','2')),
  'ex-3am-maqlub-qismat-kasrayn-l1-009:q2': A(DIV('5/6','10')),
  'ex-3am-maqlub-qismat-kasrayn-l1-009:q3': A(DIV('8/9','4')),
  'ex-3am-maqlub-qismat-kasrayn-l1-009:q4': A(DIV('15/7','5')),
  // ex-3am-maqlub-qismat-kasrayn-l1-010
  'ex-3am-maqlub-qismat-kasrayn-l1-010:q1': A(DIV('16/15','4')),
  'ex-3am-maqlub-qismat-kasrayn-l1-010:q2': A(DIV('6','9/10')),
  'ex-3am-maqlub-qismat-kasrayn-l1-010:q3': A(DIV('26/15','13/10')),
  'ex-3am-maqlub-qismat-kasrayn-l1-010:q4': A(DIV('35/6','7')),
  // ex-3am-maqlub-qismat-kasrayn-l2-001
  'ex-3am-maqlub-qismat-kasrayn-l2-001:q1': A(ADD(MUL('2,5','4'),'2')),
  'ex-3am-maqlub-qismat-kasrayn-l2-001:q2': A(SUB(DIV('18','3'),'2')),
  'ex-3am-maqlub-qismat-kasrayn-l2-001:q3': A(DIV('12','4')),
  'ex-3am-maqlub-qismat-kasrayn-l2-001:q4': A(NEG(DIV('12','4'))),
  'ex-3am-maqlub-qismat-kasrayn-l2-001:q5': A(INV(DIV('12','4'))),
  // ex-3am-maqlub-qismat-kasrayn-l2-002
  'ex-3am-maqlub-qismat-kasrayn-l2-002:q1': PICK([EQ(MUL('0,33','3'),'1'), NOT(EQ(MUL('0,33','3'),'1'))]),
  'ex-3am-maqlub-qismat-kasrayn-l2-002:q2': A(MUL('0,33','3')),
  'ex-3am-maqlub-qismat-kasrayn-l2-002:q3': A(INV('3')),
  // ex-3am-maqlub-qismat-kasrayn-l2-003
  'ex-3am-maqlub-qismat-kasrayn-l2-003:q1': PICK([EQ(MUL('1','0'),'1'), EQ(MUL('0','0'),'1'), AND(NOT(EQ(MUL('1','0'),'1')),NOT(EQ(MUL('0','0'),'1')))]),
  'ex-3am-maqlub-qismat-kasrayn-l2-003:q3': A(INV('1/4')),
  'ex-3am-maqlub-qismat-kasrayn-l2-003:q4': A(INV(INV('7'))),
  // ex-3am-maqlub-qismat-kasrayn-l2-004
  'ex-3am-maqlub-qismat-kasrayn-l2-004:q1': A(DIV('6','3/4')),
  'ex-3am-maqlub-qismat-kasrayn-l2-004:q2': PICK([LT('6',DIV('6','3/4')), LT(DIV('6','3/4'),'6'), EQ(DIV('6','3/4'),'6')]),
  'ex-3am-maqlub-qismat-kasrayn-l2-004:q4': A(DIV('5/2','0,5')),
  // ex-3am-maqlub-qismat-kasrayn-l2-005
  'ex-3am-maqlub-qismat-kasrayn-l2-005:q1': PICK([EQ(MUL('3/4','4/3'),'1'), EQ(MUL('3/4','-3/4'),'1'), EQ(MUL('3/4','1/3'),'1')]),
  'ex-3am-maqlub-qismat-kasrayn-l2-005:q2': PICK([EQ(MUL('0,2','5'),'1'), EQ(MUL('0,2','-0,2'),'1')]),
  'ex-3am-maqlub-qismat-kasrayn-l2-005:q3': A(INV('7/9')),
  'ex-3am-maqlub-qismat-kasrayn-l2-005:q4': A(INV('2,5')),
  // ex-3am-maqlub-qismat-kasrayn-l2-006
  'ex-3am-maqlub-qismat-kasrayn-l2-006:q1': PICK([EQ(DIV('5/6','10/9'),MUL('5/6','9/10')), EQ(DIV('5/6','10/9'),MUL('5/6','10/9')), EQ(DIV('5/6','10/9'),MUL('6/5','10/9')), EQ(DIV('5/6','10/9'),MUL('6/5','9/10'))]),
  'ex-3am-maqlub-qismat-kasrayn-l2-006:q2': A(DIV('5/6','10/9')),
  'ex-3am-maqlub-qismat-kasrayn-l2-006:q3': A(DIV('9/10','3/5')),
  // ex-3am-maqlub-qismat-kasrayn-l2-007
  'ex-3am-maqlub-qismat-kasrayn-l2-007:q1': PICK([EQ(DIV('2/5','8'),MUL('2/5','1/8')), EQ(DIV('2/5','8'),MUL('2/5','8')), EQ(DIV('2/5','8'),MUL('5/2','1/8')), EQ(DIV('2/5','8'),MUL('5/2','8'))]),
  'ex-3am-maqlub-qismat-kasrayn-l2-007:q2': A(DIV('2/5','8')),
  'ex-3am-maqlub-qismat-kasrayn-l2-007:q3': A(DIV('3/7','6')),
  'ex-3am-maqlub-qismat-kasrayn-l2-007:q4': A(DIV('9/4','12')),
  // ex-3am-maqlub-qismat-kasrayn-l2-008
  'ex-3am-maqlub-qismat-kasrayn-l2-008:q1': PICK([EQ(MUL('7/19','19/7'),'1'), EQ(MUL('7/19','-7/19'),'1'), EQ(MUL('7/19','1/7'),'1')]),
  'ex-3am-maqlub-qismat-kasrayn-l2-008:q2': A(MUL('7/19','19/7')),
  'ex-3am-maqlub-qismat-kasrayn-l2-008:q3': A(INV('8/5')),
  'ex-3am-maqlub-qismat-kasrayn-l2-008:q4': A(INV('2,5')),
  // ex-3am-maqlub-qismat-kasrayn-l2-009
  'ex-3am-maqlub-qismat-kasrayn-l2-009:q1': PICK([EQ(DIV('7/6','14/9'),'3/4'), EQ(DIV('7/6','14/9'),'49/27'), EQ(DIV('7/6','14/9'),'4/3'), EQ(DIV('7/6','14/9'),'27/49')]),
  'ex-3am-maqlub-qismat-kasrayn-l2-009:q2': PICK([EQ(DIV('5/9','10/3'),'1/6'), EQ(DIV('5/9','10/3'),'50/27'), EQ(DIV('5/9','10/3'),'6'), EQ(DIV('5/9','10/3'),'27/50')]),
  // ex-3am-maqlub-qismat-kasrayn-l2-010
  'ex-3am-maqlub-qismat-kasrayn-l2-010:q1': PICK([EQ(DIV('5/8','2'),'5/16'), EQ(MUL('5/8','2'),'5/16'), EQ(DIV('8/5','2'),'5/16')]),
  'ex-3am-maqlub-qismat-kasrayn-l2-010:q2': PICK([EQ(DIV('7/9','2'),'7/18'), EQ(MUL('7/9','2'),'7/18'), EQ(DIV('9/7','2'),'7/18')]),
  'ex-3am-maqlub-qismat-kasrayn-l2-010:q3': A(DIV('5/4','5/16')),
  // ex-3am-maqlub-qismat-kasrayn-l3-001
  'ex-3am-maqlub-qismat-kasrayn-l3-001:q1': A(ADD('1/4',MUL('1/2','3/5'))),
  'ex-3am-maqlub-qismat-kasrayn-l3-001:q2': A(SUB('1/4','1/10')),
  'ex-3am-maqlub-qismat-kasrayn-l3-001:q3': A(DIV('9/10','3/20')),
  // ex-3am-maqlub-qismat-kasrayn-l3-002
  'ex-3am-maqlub-qismat-kasrayn-l3-002:q1': A(ADD('5/8','3/4')),
  'ex-3am-maqlub-qismat-kasrayn-l3-002:q2': A(MUL('1/2',SUB('9/5','7/5'))),
  'ex-3am-maqlub-qismat-kasrayn-l3-002:q3': A(ADD('1/2','1/3')),
  'ex-3am-maqlub-qismat-kasrayn-l3-002:q4': A(DIV('15/4','5/6')),
  'ex-3am-maqlub-qismat-kasrayn-l3-002:q5': A(DIV('9/2','3')),
  // ex-3am-maqlub-qismat-kasrayn-l3-003
  'ex-3am-maqlub-qismat-kasrayn-l3-003:q1': A(ADD('2/5',MUL('3/4','2/3'))),
  'ex-3am-maqlub-qismat-kasrayn-l3-003:q2': A(DIV('3','1,5')),
  'ex-3am-maqlub-qismat-kasrayn-l3-003:q3': A(DIV('2','4/5')),
  'ex-3am-maqlub-qismat-kasrayn-l3-003:q4': A(ADD('7',DIV(DIV('3','1,5'),'4/5'))),
  'ex-3am-maqlub-qismat-kasrayn-l3-003:q5': A(DIV('3/5','9/10')),
  // ex-3am-maqlub-qismat-kasrayn-l3-004
  'ex-3am-maqlub-qismat-kasrayn-l3-004:q1': A(DIV('14/15','7/10')),
  'ex-3am-maqlub-qismat-kasrayn-l3-004:q2': A(DIV('3/8','1/2')),
  'ex-3am-maqlub-qismat-kasrayn-l3-004:q3': A(DIV('9','3/8')),
  'ex-3am-maqlub-qismat-kasrayn-l3-004:q4': A(MUL(DIV('14/15','7/10'),DIV('3/8','1/2'))),
  // ex-3am-maqlub-qismat-kasrayn-l3-005
  'ex-3am-maqlub-qismat-kasrayn-l3-005:q1': A(DIV('21/10','14/15')),
  'ex-3am-maqlub-qismat-kasrayn-l3-005:q2': A(DIV('16/27','8/9')),
  'ex-3am-maqlub-qismat-kasrayn-l3-005:q3': A(DIV('35/12','25/18')),
  'ex-3am-maqlub-qismat-kasrayn-l3-005:q4': A(INV(DIV('35/12','25/18'))),
  // ex-3am-maqlub-qismat-kasrayn-l3-006
  'ex-3am-maqlub-qismat-kasrayn-l3-006:q1': A(DIV('12','4/5')),
  'ex-3am-maqlub-qismat-kasrayn-l3-006:q2': A(DIV('7/9','14')),
  'ex-3am-maqlub-qismat-kasrayn-l3-006:q3': A(MUL(DIV('12','4/5'),DIV('7/9','14'))),
  'ex-3am-maqlub-qismat-kasrayn-l3-006:q4': A(DIV('1/18','15')),
  // ex-3am-maqlub-qismat-kasrayn-l3-007
  'ex-3am-maqlub-qismat-kasrayn-l3-007:q1': A(DIV('2/3','8/9')),
  'ex-3am-maqlub-qismat-kasrayn-l3-007:q2': A(DIV('4/5','6')),
  'ex-3am-maqlub-qismat-kasrayn-l3-007:q3': A(DIV('9','3/4')),
  'ex-3am-maqlub-qismat-kasrayn-l3-007:q4': A(INV('3/4')),
  // ex-3am-maqlub-qismat-kasrayn-l3-008
  'ex-3am-maqlub-qismat-kasrayn-l3-008:q1': A(DIV('4,5','0,15')),
  'ex-3am-maqlub-qismat-kasrayn-l3-008:q2': A(DIV('3/4','0,25')),
  'ex-3am-maqlub-qismat-kasrayn-l3-008:q3': A(DIV('2,4','3/5')),
  'ex-3am-maqlub-qismat-kasrayn-l3-008:q4': A(DIV('30','3')),
  // ex-3am-maqlub-qismat-kasrayn-l3-009
  'ex-3am-maqlub-qismat-kasrayn-l3-009:q1': A(DIV('35/18','25/12')),
  'ex-3am-maqlub-qismat-kasrayn-l3-009:q2': A(DIV('22/15','33/10')),
  'ex-3am-maqlub-qismat-kasrayn-l3-009:q3': A(DIV('16/21','8/7')),
  'ex-3am-maqlub-qismat-kasrayn-l3-009:q4': A(DIV('51/14','17/28')),
  // ex-3am-maqlub-qismat-kasrayn-l3-010
  'ex-3am-maqlub-qismat-kasrayn-l3-010:q1': A(MUL('27/20','16/9')),
  'ex-3am-maqlub-qismat-kasrayn-l3-010:q2': A(MUL('14/15','25/21')),
  'ex-3am-maqlub-qismat-kasrayn-l3-010:q3': A(DIV('27/20','9/16')),
  'ex-3am-maqlub-qismat-kasrayn-l3-010:q4': A(DIV('14/15','21/25')),
  // ex-3am-maqlub-qismat-kasrayn-l4-001
  'ex-3am-maqlub-qismat-kasrayn-l4-001:q1': A(MUL(SUB('1/3','1/6'),'5')),
  'ex-3am-maqlub-qismat-kasrayn-l4-001:q2': A(DIV('4/3','2/9')),
  'ex-3am-maqlub-qismat-kasrayn-l4-001:q3': A(ADD('1/2',DIV('4/3','2/9'))),
  'ex-3am-maqlub-qismat-kasrayn-l4-001:q4': A(DIV('13/2','3')),
  'ex-3am-maqlub-qismat-kasrayn-l4-001:q5': A(DIV('13/6','5/6')),
  // ex-3am-maqlub-qismat-kasrayn-l4-002
  'ex-3am-maqlub-qismat-kasrayn-l4-002:q1': A(SUB('3','4/14')),
  'ex-3am-maqlub-qismat-kasrayn-l4-002:q2': A(DIV('4/5','2/3')),
  'ex-3am-maqlub-qismat-kasrayn-l4-002:q3': A(ADD('5/9',MUL('1/6','2/3'))),
  'ex-3am-maqlub-qismat-kasrayn-l4-002:q4': A(DIV('2/3','3/4')),
  // ex-3am-maqlub-qismat-kasrayn-l4-003
  'ex-3am-maqlub-qismat-kasrayn-l4-003:q1': A(DIV('-48','-6')),
  'ex-3am-maqlub-qismat-kasrayn-l4-003:q2': A(DIV('-30','5')),
  'ex-3am-maqlub-qismat-kasrayn-l4-003:q3': A(DIV('8','4/5')),
  'ex-3am-maqlub-qismat-kasrayn-l4-003:q4': A(INV('10')),
  // ex-3am-maqlub-qismat-kasrayn-l4-004
  'ex-3am-maqlub-qismat-kasrayn-l4-004:q1': A(ADD('1/4','1/6')),
  'ex-3am-maqlub-qismat-kasrayn-l4-004:q2': A(SUB('2/3','1/6')),
  'ex-3am-maqlub-qismat-kasrayn-l4-004:q3': A(INV(ADD('1/4','1/6'))),
  'ex-3am-maqlub-qismat-kasrayn-l4-004:q4': A(INV(SUB('2/3','1/6'))),
  // ex-3am-maqlub-qismat-kasrayn-l4-005
  'ex-3am-maqlub-qismat-kasrayn-l4-005:q1': A(DIV('2/3','4/5')),
  'ex-3am-maqlub-qismat-kasrayn-l4-005:q2': A(ADD('5/6',DIV('2/3','4/5'))),
  'ex-3am-maqlub-qismat-kasrayn-l4-005:q3': A(DIV('3/2','6')),
  'ex-3am-maqlub-qismat-kasrayn-l4-005:q4': A(SUB('7/4',DIV('3/2','6'))),
  // ex-3am-maqlub-qismat-kasrayn-l4-006
  'ex-3am-maqlub-qismat-kasrayn-l4-006:q1': A(ADD('1/3','1/4')),
  'ex-3am-maqlub-qismat-kasrayn-l4-006:q2': A(DIV('5/6','7/12')),
  'ex-3am-maqlub-qismat-kasrayn-l4-006:q3': A(SUB('2','1/2')),
  'ex-3am-maqlub-qismat-kasrayn-l4-006:q4': A(DIV('7/2','3/2')),
  // ex-3am-maqlub-qismat-kasrayn-l4-007
  'ex-3am-maqlub-qismat-kasrayn-l4-007:q1': A(PW('2/3',2)),
  'ex-3am-maqlub-qismat-kasrayn-l4-007:q2': A(PW('4/3',2)),
  'ex-3am-maqlub-qismat-kasrayn-l4-007:q3': A(INV(PW('2/3',2))),
  'ex-3am-maqlub-qismat-kasrayn-l4-007:q4': A(DIV('4/9','16/9')),
  // ex-3am-maqlub-qismat-kasrayn-l4-008
  'ex-3am-maqlub-qismat-kasrayn-l4-008:q1': A(ADD('3/4','5/6')),
  'ex-3am-maqlub-qismat-kasrayn-l4-008:q2': A(DIV('19/12','2')),
  'ex-3am-maqlub-qismat-kasrayn-l4-008:q3': A(ADD('2/3','1/2')),
  'ex-3am-maqlub-qismat-kasrayn-l4-008:q4': A(DIV('7/6','2')),
  // ex-3am-maqlub-qismat-kasrayn-l4-009
  'ex-3am-maqlub-qismat-kasrayn-l4-009:q1': A(DIV('35/12','5/3')),
  'ex-3am-maqlub-qismat-kasrayn-l4-009:q2': A(MUL('2',ADD('5/3','7/4'))),
  'ex-3am-maqlub-qismat-kasrayn-l4-009:q3': A(DIV('35/12','7/12')),
  // ex-3am-maqlub-qismat-kasrayn-l4-010
  'ex-3am-maqlub-qismat-kasrayn-l4-010:q1': A(DIV('-7','14')),
  'ex-3am-maqlub-qismat-kasrayn-l4-010:q2': A(DIV('-5/6','-10/9')),
  'ex-3am-maqlub-qismat-kasrayn-l4-010:q3': A(DIV('5/6','10/9')),
  // ex-3am-maqlub-qismat-kasrayn-l5-001
  'ex-3am-maqlub-qismat-kasrayn-l5-001:q1': A(SUB('1','1/5')),
  'ex-3am-maqlub-qismat-kasrayn-l5-001:q2': A(MUL('5/8',SUB('1','1/5'))),
  'ex-3am-maqlub-qismat-kasrayn-l5-001:q3': A(SUB(SUB('1','1/5'),MUL('5/8',SUB('1','1/5')))),
  'ex-3am-maqlub-qismat-kasrayn-l5-001:q4': A(DIV('18000','3/10')),
  'ex-3am-maqlub-qismat-kasrayn-l5-001:q5': A(DIV('18000','2400')),
  'ex-3am-maqlub-qismat-kasrayn-l5-001:q6': PICK([NOT(LT(DIV('18000','2400'),'8')), LT(DIV('18000','2400'),'8')]),
  // ex-3am-maqlub-qismat-kasrayn-l5-002
  'ex-3am-maqlub-qismat-kasrayn-l5-002:q1': A(DIV('33/2','3/4')),
  'ex-3am-maqlub-qismat-kasrayn-l5-002:q2': A(DIV('33/2','5/8')),
  'ex-3am-maqlub-qismat-kasrayn-l5-002:q3': A(FLOOR(DIV('33/2','5/8'))),
  'ex-3am-maqlub-qismat-kasrayn-l5-002:q4': A(SUB(DIV('33','2'),MUL('26','5/8'))),
  'ex-3am-maqlub-qismat-kasrayn-l5-002:q5': PICK([EQ(MUL(FLOOR(DIV('33/2','3/4')),'3/4'),'33/2'), EQ(MUL(FLOOR(DIV('33/2','5/8')),'5/8'),'33/2'), AND(EQ(MUL(FLOOR(DIV('33/2','3/4')),'3/4'),'33/2'),EQ(MUL(FLOOR(DIV('33/2','5/8')),'5/8'),'33/2'))]),
  // ex-3am-maqlub-qismat-kasrayn-l5-003
  'ex-3am-maqlub-qismat-kasrayn-l5-003:q1': A(DIV('480','3/4')),
  'ex-3am-maqlub-qismat-kasrayn-l5-003:q2': A(DIV('450','5/8')),
  'ex-3am-maqlub-qismat-kasrayn-l5-003:q3': A(DIV('15/2','3/4')),
  'ex-3am-maqlub-qismat-kasrayn-l5-003:q4': A(DIV('15/2','5/8')),
  'ex-3am-maqlub-qismat-kasrayn-l5-003:q5': PICK([LT(MUL(DIV('15/2','3/4'),'480'),MUL(DIV('15/2','5/8'),'450')), LT(MUL(DIV('15/2','5/8'),'450'),MUL(DIV('15/2','3/4'),'480')), EQ(MUL(DIV('15/2','3/4'),'480'),MUL(DIV('15/2','5/8'),'450'))]),
  // ex-3am-maqlub-qismat-kasrayn-l5-004
  'ex-3am-maqlub-qismat-kasrayn-l5-004:q1': A(MUL('7/9','3/4')),
  'ex-3am-maqlub-qismat-kasrayn-l5-004:q2': A(DIV('14','7/12')),
  'ex-3am-maqlub-qismat-kasrayn-l5-004:q3': A(SUB('24','14')),
  'ex-3am-maqlub-qismat-kasrayn-l5-004:q4': A(DIV('2800','14')),
  'ex-3am-maqlub-qismat-kasrayn-l5-004:q5': PICK([NOT(LT('2800',MUL('12','250'))), LT('2800',MUL('12','250'))]),
  // ex-3am-maqlub-qismat-kasrayn-l5-005
  'ex-3am-maqlub-qismat-kasrayn-l5-005:q1': A(DIV('36','48')),
  'ex-3am-maqlub-qismat-kasrayn-l5-005:q2': A(DIV('15','3/4')),
  'ex-3am-maqlub-qismat-kasrayn-l5-005:q3': A(INV(DIV('36','48'))),
  'ex-3am-maqlub-qismat-kasrayn-l5-005:q4': A(DIV('40','24')),
  'ex-3am-maqlub-qismat-kasrayn-l5-005:q5': A(DIV('10','5/3')),
  'ex-3am-maqlub-qismat-kasrayn-l5-005:q6': PICK([LT(DIV('10','5/3'),DIV('10','3/4')), LT(DIV('10','3/4'),DIV('10','5/3')), EQ(DIV('10','3/4'),DIV('10','5/3'))]),
  // ex-3am-maqlub-qismat-kasrayn-l5-006
  'ex-3am-maqlub-qismat-kasrayn-l5-006:q1': A(DIV('35/6','7/4')),
  'ex-3am-maqlub-qismat-kasrayn-l5-006:q2': A(INV('5/12')),
  'ex-3am-maqlub-qismat-kasrayn-l5-006:q3': A(DIV('35/6','5/12')),
  'ex-3am-maqlub-qismat-kasrayn-l5-006:q4': A(MUL('14','350')),
  'ex-3am-maqlub-qismat-kasrayn-l5-006:q5': PICK([NOT(LT('4500',MUL('14','350'))), LT('4500',MUL('14','350'))]),
  // ex-3am-maqlub-qismat-kasrayn-l5-007
  'ex-3am-maqlub-qismat-kasrayn-l5-007:q1': A(DIV('21/4','3')),
  'ex-3am-maqlub-qismat-kasrayn-l5-007:q2': A(DIV('7/4','7/8')),
  'ex-3am-maqlub-qismat-kasrayn-l5-007:q3': A(DIV('420','7/8')),
  'ex-3am-maqlub-qismat-kasrayn-l5-007:q4': A(DIV('700','3/2')),
  'ex-3am-maqlub-qismat-kasrayn-l5-007:q5': PICK([LT(DIV('700','3/2'),DIV('420','7/8')), LT(DIV('420','7/8'),DIV('700','3/2')), EQ(DIV('420','7/8'),DIV('700','3/2'))]),
  // ex-3am-maqlub-qismat-kasrayn-l5-008
  'ex-3am-maqlub-qismat-kasrayn-l5-008:q1': A(DIV('9/2','3/8')),
  'ex-3am-maqlub-qismat-kasrayn-l5-008:q2': A(DIV('9/2','12')),
  'ex-3am-maqlub-qismat-kasrayn-l5-008:q3': A(DIV('9/2','15')),
  'ex-3am-maqlub-qismat-kasrayn-l5-008:q4': A(SUB(MUL('15','3/8'),'9/2')),
  'ex-3am-maqlub-qismat-kasrayn-l5-008:q5': PICK([NOT(LT(DIV('9/2','3/8'),'15')), LT(DIV('9/2','3/8'),'15')]),
  // ex-3am-maqlub-qismat-kasrayn-l5-009
  'ex-3am-maqlub-qismat-kasrayn-l5-009:q1': A(DIV('360','3/4')),
  'ex-3am-maqlub-qismat-kasrayn-l5-009:q2': A(MUL('480','5/2')),
  'ex-3am-maqlub-qismat-kasrayn-l5-009:q3': A(DIV('1800','480')),
  'ex-3am-maqlub-qismat-kasrayn-l5-009:q4': A(DIV('650','5/4')),
  'ex-3am-maqlub-qismat-kasrayn-l5-009:q5': PICK([LT('480','520'), LT('520','480'), EQ('480','520')]),
  // ex-3am-maqlub-qismat-kasrayn-l5-010
  'ex-3am-maqlub-qismat-kasrayn-l5-010:q1': A(DIV('9/10','3/10')),
  'ex-3am-maqlub-qismat-kasrayn-l5-010:q2': A(DIV('9/10','1/5')),
  'ex-3am-maqlub-qismat-kasrayn-l5-010:q3': A(ADD('3/10','1/5')),
  'ex-3am-maqlub-qismat-kasrayn-l5-010:q4': A(DIV('9/10','1/2')),
  'ex-3am-maqlub-qismat-kasrayn-l5-010:q5': PICK([LT(DIV('9/10','1/2'),'2'), NOT(LT(DIV('9/10','1/2'),'2'))]),
};
