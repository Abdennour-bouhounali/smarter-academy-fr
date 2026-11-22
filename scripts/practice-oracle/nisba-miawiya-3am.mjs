// Oracle du banc « nisba-miawiya-3am » (النسبة المئوية, 3AM, 2026-10-21) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الثالث »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec un calcul écrit dans ce fichier (rationnels
// EXACTS en BigInt), indépendant de packages/core. Les nombres de l'énoncé sont retapés en littéraux décimaux :
//  - PCT_OF(x,t) = x·t/100 ; RATE(a,b) = le t tel que a/b = t/100 ; WHOLE(p,t) = le tout dont t % vaut p ;
//  - INC / DEC : x·(1 ± t/100) ; BASE_INC / BASE_DEC : le prix de départ d'un prix déjà augmenté / baissé ;
//  - CHAIN(x,[t1,t2…]) : variations successives (chaque taux sur le résultat précédent) ; TOTAL : le taux global ;
//  - RND(x,d) : arrondi HALF-UP exact à d décimales (jamais d'arrondi intermédiaire) ;
//  - COEF(t) = 1 + t/100 : le coefficient d'une variation de t % (t signé) ;
//  - les QCM sont jugés option par option : chaque option est une affirmation évaluée par un calcul (booléen) et
//    PICK exige qu'une seule soit vraie. Les questions selfCheck (« برّر ») n'ont pas de clé.
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
  neg() { return new Q(-this.n, this.d); }
  abs() { return this.n < 0n ? this.neg() : this; }
  /** Écriture décimale exacte si elle existe (dénominateur 2^a·5^b), sinon la fraction. */
  toString() {
    if (this.d === 1n) return String(this.n);
    let d = this.d;
    for (const p of [2n, 5n]) while (d % p === 0n) d /= p;
    if (d !== 1n) return `${this.n}/${this.d}`;
    let scale = 1n; let places = 0;
    while ((this.n * scale) % this.d !== 0n) { scale *= 10n; places++; }
    const v = (this.n * scale) / this.d; const neg = v < 0n; const s = (neg ? -v : v).toString().padStart(places + 1, '0');
    return `${neg ? '-' : ''}${s.slice(0, s.length - places)}.${s.slice(s.length - places)}`;
  }
}
const ONE = new Q(1n); const HUNDRED = new Q(100n);
const q = (v) => {
  if (v instanceof Q) return v;
  const s = String(v); const neg = s.startsWith('-'); const [i, f = ''] = s.replace('-', '').split('.');
  const r = new Q(BigInt(i + f), 10n ** BigInt(f.length)); return neg ? r.neg() : r;
};

const ADD_ = (a, b) => q(a).add(q(b));
const SUB_ = (a, b) => q(a).sub(q(b));
const MUL_ = (a, b) => q(a).mul(q(b));
const DIV_ = (a, b) => q(a).div(q(b));
const ABS_ = (a) => q(a).abs();
const EQ = (a, b) => q(a).eq(q(b));
const LT = (a, b) => q(a).lt(q(b));
const LE = (a, b) => !q(b).lt(q(a));
const COEF = (t) => ONE.add(q(t).div(HUNDRED));
const PCT_OF = (x, t) => q(x).mul(q(t)).div(HUNDRED);
const RATE = (a, b) => q(a).mul(HUNDRED).div(q(b));
const WHOLE = (p, t) => q(p).mul(HUNDRED).div(q(t));
const INC = (x, t) => q(x).mul(COEF(t));
const DEC = (x, t) => q(x).mul(COEF(q(t).neg()));
const BASE_INC = (n, t) => q(n).div(COEF(t));
const CHAIN = (x, ts) => ts.reduce((acc, t) => acc.mul(COEF(t)), q(x));
const TOTAL = (ts) => CHAIN(ONE, ts).sub(ONE).mul(HUNDRED);
/** Arrondi HALF-UP exact à d décimales (x ≥ 0). */
const RND = (x, d) => {
  const m = 10n ** BigInt(d); const v = q(x).mul(new Q(m)); const fl = v.n / v.d;
  const up = v.sub(new Q(fl)).mul(new Q(2n)); // ≥ 1 ⇔ reste ≥ 1/2
  return new Q(up.n >= up.d ? fl + 1n : fl, m);
};
const A = (x) => R(x.toString());
const only = (flags, what) => { const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0); if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`); return C('ABCDEF'[hits[0]]); };
/** QCM : la seule option vraie (les drapeaux sont CALCULÉS par l'appelant, option par option, dans l'ordre affiché). */
const PICK = (flags) => only(flags, 'QCM');

export const ORACLE = {
  // ex-3am-nisba-miawiya-3am-l1-001
  'ex-3am-nisba-miawiya-3am-l1-001:q1': A(PCT_OF('4500','10')),
  'ex-3am-nisba-miawiya-3am-l1-001:q2': A(PCT_OF('360','25')),
  'ex-3am-nisba-miawiya-3am-l1-001:q3': A(PCT_OF('84','50')),
  'ex-3am-nisba-miawiya-3am-l1-001:q4': A(PCT_OF('85','20')),
  // ex-3am-nisba-miawiya-3am-l1-002
  'ex-3am-nisba-miawiya-3am-l1-002:q1': A(PCT_OF('640','5')),
  'ex-3am-nisba-miawiya-3am-l1-002:q2': A(PCT_OF('480','12.5')),
  'ex-3am-nisba-miawiya-3am-l1-002:q3': A(PCT_OF('3200','2.5')),
  'ex-3am-nisba-miawiya-3am-l1-002:q4': A(PCT_OF('90','15')),
  // ex-3am-nisba-miawiya-3am-l1-003
  'ex-3am-nisba-miawiya-3am-l1-003:q1': PICK([EQ('0.01',DIV_('35','100')), EQ('35',DIV_('35','100')), EQ('0.35',DIV_('35','100'))]),
  'ex-3am-nisba-miawiya-3am-l1-003:q2': PICK([EQ('0.5',DIV_('5','100')), EQ('0.05',DIV_('5','100')), EQ('5',DIV_('5','100'))]),
  'ex-3am-nisba-miawiya-3am-l1-003:q3': PICK([EQ('1.25',DIV_('12.5','100')), EQ('12.5',DIV_('12.5','100')), EQ('0.125',DIV_('12.5','100'))]),
  'ex-3am-nisba-miawiya-3am-l1-003:q4': PICK([EQ(ADD_('80','15'),PCT_OF('80','15')), EQ(MUL_('80','0.15'),PCT_OF('80','15')), EQ(MUL_('80','15'),PCT_OF('80','15'))]),
  // ex-3am-nisba-miawiya-3am-l1-004
  'ex-3am-nisba-miawiya-3am-l1-004:q1': A(PCT_OF('1200','25')),
  'ex-3am-nisba-miawiya-3am-l1-004:q2': A(PCT_OF('1200','75')),
  'ex-3am-nisba-miawiya-3am-l1-004:q3': A(PCT_OF('1200','10')),
  'ex-3am-nisba-miawiya-3am-l1-004:q4': A(PCT_OF('1200','35')),
  // ex-3am-nisba-miawiya-3am-l1-005
  'ex-3am-nisba-miawiya-3am-l1-005:q1': A(RATE('12','30')),
  'ex-3am-nisba-miawiya-3am-l1-005:q2': A(RATE('9','25')),
  'ex-3am-nisba-miawiya-3am-l1-005:q3': A(RATE('3','8')),
  'ex-3am-nisba-miawiya-3am-l1-005:q4': A(RATE('45','60')),
  // ex-3am-nisba-miawiya-3am-l1-006
  'ex-3am-nisba-miawiya-3am-l1-006:q1': PICK([EQ(DIV_('32','8'),DIV_('8','32')), EQ(DIV_('8','32'),DIV_('8','32')), EQ(DIV_('8','100'),DIV_('8','32'))]),
  'ex-3am-nisba-miawiya-3am-l1-006:q2': A(RATE('8','32')),
  'ex-3am-nisba-miawiya-3am-l1-006:q3': A(RATE(SUB_('32','8'),'32')),
  'ex-3am-nisba-miawiya-3am-l1-006:q4': A(RATE('12','48')),
  // ex-3am-nisba-miawiya-3am-l1-007
  'ex-3am-nisba-miawiya-3am-l1-007:q1': A(WHOLE('6','15')),
  'ex-3am-nisba-miawiya-3am-l1-007:q2': A(WHOLE('90','30')),
  'ex-3am-nisba-miawiya-3am-l1-007:q3': A(WHOLE('360','8')),
  'ex-3am-nisba-miawiya-3am-l1-007:q4': A(WHOLE('84','60')),
  // ex-3am-nisba-miawiya-3am-l1-008
  'ex-3am-nisba-miawiya-3am-l1-008:q1': A(INC('2000','10')),
  'ex-3am-nisba-miawiya-3am-l1-008:q2': A(INC('3500','15')),
  'ex-3am-nisba-miawiya-3am-l1-008:q3': A(INC('12000','7')),
  'ex-3am-nisba-miawiya-3am-l1-008:q4': A(INC('800','2.5')),
  // ex-3am-nisba-miawiya-3am-l1-009
  'ex-3am-nisba-miawiya-3am-l1-009:q1': PICK([EQ('0.15',COEF('15')), EQ('1.15',COEF('15')), EQ('15',COEF('15'))]),
  'ex-3am-nisba-miawiya-3am-l1-009:q2': PICK([EQ('0.2',COEF('-20')), EQ('1.2',COEF('-20')), EQ('0.8',COEF('-20'))]),
  'ex-3am-nisba-miawiya-3am-l1-009:q3': PICK([EQ('1.07',COEF('7')), EQ('1.7',COEF('7')), EQ('0.07',COEF('7'))]),
  'ex-3am-nisba-miawiya-3am-l1-009:q4': PICK([EQ('0.5',COEF('-5')), EQ('0.95',COEF('-5')), EQ('1.05',COEF('-5'))]),
  // ex-3am-nisba-miawiya-3am-l1-010
  'ex-3am-nisba-miawiya-3am-l1-010:q1': A(DEC('5000','20')),
  'ex-3am-nisba-miawiya-3am-l1-010:q2': A(DEC('3600','10')),
  'ex-3am-nisba-miawiya-3am-l1-010:q3': A(DEC('24000','35')),
  'ex-3am-nisba-miawiya-3am-l1-010:q4': A(DEC('1250','12')),
  // ex-3am-nisba-miawiya-3am-l2-001
  'ex-3am-nisba-miawiya-3am-l2-001:q1': A(PCT_OF('12000','19')),
  'ex-3am-nisba-miawiya-3am-l2-001:q2': A(INC('12000','19')),
  'ex-3am-nisba-miawiya-3am-l2-001:q3': PICK([EQ('0.19',COEF('19')), EQ('1.9',COEF('19')), EQ('1.19',COEF('19'))]),
  // ex-3am-nisba-miawiya-3am-l2-002
  'ex-3am-nisba-miawiya-3am-l2-002:q1': A(DEC('7800','30')),
  'ex-3am-nisba-miawiya-3am-l2-002:q2': A(PCT_OF('7800','30')),
  'ex-3am-nisba-miawiya-3am-l2-002:q3': PICK([(EQ(SUB_('7800','30'),DEC('7800','30'))), !(EQ(SUB_('7800','30'),DEC('7800','30')))]),
  // ex-3am-nisba-miawiya-3am-l2-003
  'ex-3am-nisba-miawiya-3am-l2-003:q1': A(RATE('18','24')),
  'ex-3am-nisba-miawiya-3am-l2-003:q2': A(RATE('6','24')),
  'ex-3am-nisba-miawiya-3am-l2-003:q3': PICK([(EQ(ADD_(RATE('18','24'),RATE('6','24')),'100')), !(EQ(ADD_(RATE('18','24'),RATE('6','24')),'100'))]),
  // ex-3am-nisba-miawiya-3am-l2-004
  'ex-3am-nisba-miawiya-3am-l2-004:q1': A(PCT_OF('5000','40')),
  'ex-3am-nisba-miawiya-3am-l2-004:q2': A(RATE('1800','5000')),
  'ex-3am-nisba-miawiya-3am-l2-004:q3': A(WHOLE('1200','30')),
  // ex-3am-nisba-miawiya-3am-l2-005
  'ex-3am-nisba-miawiya-3am-l2-005:q1': A(INC('12500','2')),
  'ex-3am-nisba-miawiya-3am-l2-005:q2': A(PCT_OF('12500','2')),
  'ex-3am-nisba-miawiya-3am-l2-005:q3': PICK([(EQ('2',PCT_OF('12500','2'))), !(EQ('2',PCT_OF('12500','2')))]),
  // ex-3am-nisba-miawiya-3am-l2-006
  'ex-3am-nisba-miawiya-3am-l2-006:q1': A(SUB_('1725','1500')),
  'ex-3am-nisba-miawiya-3am-l2-006:q2': A(ABS_(RATE(SUB_('1725','1500'),'1500'))),
  'ex-3am-nisba-miawiya-3am-l2-006:q3': PICK([EQ(RATE('225','1725'),RATE('225','1500')), EQ(RATE('225','1500'),RATE('225','1500')), EQ(RATE('1500','225'),RATE('225','1500'))]),
  // ex-3am-nisba-miawiya-3am-l2-007
  'ex-3am-nisba-miawiya-3am-l2-007:q1': A(PCT_OF('800','62.5')),
  'ex-3am-nisba-miawiya-3am-l2-007:q2': A(PCT_OF('800','12.5')),
  'ex-3am-nisba-miawiya-3am-l2-007:q3': A(RATE('120','800')),
  // ex-3am-nisba-miawiya-3am-l2-008
  'ex-3am-nisba-miawiya-3am-l2-008:q1': A(DEC('12000','15')),
  'ex-3am-nisba-miawiya-3am-l2-008:q2': A(DEC('9000','5')),
  'ex-3am-nisba-miawiya-3am-l2-008:q3': PICK([LT(DEC('12000','15'),DEC('9000','5')), LT(DEC('9000','5'),DEC('12000','15'))]),
  // ex-3am-nisba-miawiya-3am-l2-009
  'ex-3am-nisba-miawiya-3am-l2-009:q1': A(WHOLE('30','40')),
  'ex-3am-nisba-miawiya-3am-l2-009:q2': A(PCT_OF('75','60')),
  'ex-3am-nisba-miawiya-3am-l2-009:q3': PICK([EQ(MUL_('30','0.4'),WHOLE('30','40')), EQ(DIV_('30','0.4'),WHOLE('30','40')), EQ(MUL_('30','1.4'),WHOLE('30','40'))]),
  // ex-3am-nisba-miawiya-3am-l2-010
  'ex-3am-nisba-miawiya-3am-l2-010:q1': A(ABS_(RATE(SUB_('2160','2000'),'2000'))),
  'ex-3am-nisba-miawiya-3am-l2-010:q2': PICK([EQ('0.08',COEF('8')), EQ('1.08',COEF('8')), EQ('1.8',COEF('8'))]),
  'ex-3am-nisba-miawiya-3am-l2-010:q3': A(INC('3500','8')),
  // ex-3am-nisba-miawiya-3am-l3-001
  'ex-3am-nisba-miawiya-3am-l3-001:q1': A(CHAIN('36000',['40'])),
  'ex-3am-nisba-miawiya-3am-l3-001:q2': A(CHAIN('36000',['40','-15'])),
  'ex-3am-nisba-miawiya-3am-l3-001:q3': PICK([LT('36000',CHAIN('36000',['40','-15'])), EQ(CHAIN('36000',['40','-15']),'36000')]),
  'ex-3am-nisba-miawiya-3am-l3-001:q4': A(ABS_(TOTAL(['40','-15']))),
  // ex-3am-nisba-miawiya-3am-l3-002
  'ex-3am-nisba-miawiya-3am-l3-002:q1': A(CHAIN('18000',['20'])),
  'ex-3am-nisba-miawiya-3am-l3-002:q2': A(CHAIN('18000',['20','-10'])),
  'ex-3am-nisba-miawiya-3am-l3-002:q3': A(SUB_('19440','18000')),
  'ex-3am-nisba-miawiya-3am-l3-002:q4': PICK([LT('18000',CHAIN('18000',['20','-10'])), EQ(CHAIN('18000',['20','-10']),'18000')]),
  // ex-3am-nisba-miawiya-3am-l3-003
  'ex-3am-nisba-miawiya-3am-l3-003:q1': A(SUB_('26500','23000')),
  'ex-3am-nisba-miawiya-3am-l3-003:q2': A(RND(ABS_(RATE(SUB_('26500','23000'),'23000')),0)),
  'ex-3am-nisba-miawiya-3am-l3-003:q3': A(INC('23000','20')),
  // ex-3am-nisba-miawiya-3am-l3-004
  'ex-3am-nisba-miawiya-3am-l3-004:q1': A(PCT_OF('40','25')),
  'ex-3am-nisba-miawiya-3am-l3-004:q2': A(PCT_OF('60','45')),
  'ex-3am-nisba-miawiya-3am-l3-004:q3': A(RATE('37','100')),
  'ex-3am-nisba-miawiya-3am-l3-004:q4': PICK([(EQ(DIV_(ADD_('25','45'),'2'),RATE(ADD_('10','27'),ADD_('40','60')))), !(EQ(DIV_(ADD_('25','45'),'2'),RATE(ADD_('10','27'),ADD_('40','60'))))]),
  // ex-3am-nisba-miawiya-3am-l3-005
  'ex-3am-nisba-miawiya-3am-l3-005:q1': A(PCT_OF('150','40')),
  'ex-3am-nisba-miawiya-3am-l3-005:q2': A(PCT_OF('350','20')),
  'ex-3am-nisba-miawiya-3am-l3-005:q3': A(RATE('130','500')),
  'ex-3am-nisba-miawiya-3am-l3-005:q4': PICK([(EQ(DIV_(ADD_('40','20'),'2'),RATE(ADD_('60','70'),'500'))), !(EQ(DIV_(ADD_('40','20'),'2'),RATE(ADD_('60','70'),'500')))]),
  // ex-3am-nisba-miawiya-3am-l3-006
  'ex-3am-nisba-miawiya-3am-l3-006:q1': A(SUB_('4800','4080')),
  'ex-3am-nisba-miawiya-3am-l3-006:q2': A(ABS_(RATE(SUB_('4080','4800'),'4800'))),
  'ex-3am-nisba-miawiya-3am-l3-006:q3': A(ABS_(RATE(SUB_('3424','3200'),'3200'))),
  'ex-3am-nisba-miawiya-3am-l3-006:q4': PICK([EQ('0.85',COEF('-15')), EQ('0.15',COEF('-15')), EQ('1.15',COEF('-15'))]),
  // ex-3am-nisba-miawiya-3am-l3-007
  'ex-3am-nisba-miawiya-3am-l3-007:q1': A(BASE_INC('4440','20')),
  'ex-3am-nisba-miawiya-3am-l3-007:q2': A(DEC('4440','20')),
  'ex-3am-nisba-miawiya-3am-l3-007:q3': PICK([(EQ(DEC('4440','20'),'3700')), !(EQ(DEC('4440','20'),'3700'))]),
  'ex-3am-nisba-miawiya-3am-l3-007:q4': A(SUB_('3700','3552')),
  // ex-3am-nisba-miawiya-3am-l3-008
  'ex-3am-nisba-miawiya-3am-l3-008:q1': A(CHAIN('15000',['-20'])),
  'ex-3am-nisba-miawiya-3am-l3-008:q2': A(CHAIN('15000',['-20','-10'])),
  'ex-3am-nisba-miawiya-3am-l3-008:q3': A(ABS_(TOTAL(['-20','-10']))),
  'ex-3am-nisba-miawiya-3am-l3-008:q4': PICK([(EQ(CHAIN('15000',['-20','-10']),CHAIN('15000',['-10','-20']))), !(EQ(CHAIN('15000',['-20','-10']),CHAIN('15000',['-10','-20'])))]),
  // ex-3am-nisba-miawiya-3am-l3-009
  'ex-3am-nisba-miawiya-3am-l3-009:q1': A(PCT_OF('25','40')),
  'ex-3am-nisba-miawiya-3am-l3-009:q2': A(SUB_('25','3')),
  'ex-3am-nisba-miawiya-3am-l3-009:q3': A(RND(RATE('7','22'),1)),
  'ex-3am-nisba-miawiya-3am-l3-009:q4': PICK([(EQ('37',RND(RATE('7','22'),1))), !(EQ('37',RND(RATE('7','22'),1)))]),
  // ex-3am-nisba-miawiya-3am-l3-010
  'ex-3am-nisba-miawiya-3am-l3-010:q1': A(INC('240','7.5')),
  'ex-3am-nisba-miawiya-3am-l3-010:q2': A(SUB_('258','240')),
  'ex-3am-nisba-miawiya-3am-l3-010:q3': A(BASE_INC('301','7.5')),
  'ex-3am-nisba-miawiya-3am-l3-010:q4': PICK([EQ('1.75',COEF('7.5')), EQ('1.075',COEF('7.5')), EQ('0.075',COEF('7.5'))]),
  // ex-3am-nisba-miawiya-3am-l4-001
  'ex-3am-nisba-miawiya-3am-l4-001:q1': A(DIV_(SUB_(MUL_('11','2'),MUL_('4','1')),MUL_('4','3'))),
  'ex-3am-nisba-miawiya-3am-l4-001:q2': A(SUB_('36800','32000')),
  'ex-3am-nisba-miawiya-3am-l4-001:q3': A(ABS_(RATE(SUB_('36800','32000'),'32000'))),
  'ex-3am-nisba-miawiya-3am-l4-001:q4': A(INC('32000','25')),
  // ex-3am-nisba-miawiya-3am-l4-002
  'ex-3am-nisba-miawiya-3am-l4-002:q1': A(DIV_('11250','1.25')),
  'ex-3am-nisba-miawiya-3am-l4-002:q2': A(CHAIN('9000',['25','-10'])),
  'ex-3am-nisba-miawiya-3am-l4-002:q3': A(ABS_(TOTAL(['25','-10']))),
  'ex-3am-nisba-miawiya-3am-l4-002:q4': PICK([LT('9000',CHAIN('9000',['25','-10'])), EQ(CHAIN('9000',['25','-10']),'9000')]),
  // ex-3am-nisba-miawiya-3am-l4-003
  'ex-3am-nisba-miawiya-3am-l4-003:q1': A(DIV_(SUB_('52','12'),'4')),
  'ex-3am-nisba-miawiya-3am-l4-003:q2': A(MUL_('10',ADD_('10','6'))),
  'ex-3am-nisba-miawiya-3am-l4-003:q3': A(PCT_OF('160','35')),
  'ex-3am-nisba-miawiya-3am-l4-003:q4': A(RATE('24','160')),
  // ex-3am-nisba-miawiya-3am-l4-004
  'ex-3am-nisba-miawiya-3am-l4-004:q1': A(ADD_(ADD_('4','10'),ADD_('18','8'))),
  'ex-3am-nisba-miawiya-3am-l4-004:q2': A(RATE('10','40')),
  'ex-3am-nisba-miawiya-3am-l4-004:q3': A(RATE('18','40')),
  'ex-3am-nisba-miawiya-3am-l4-004:q4': PICK([(EQ(ADD_(ADD_(RATE('4','40'),RATE('10','40')),ADD_(RATE('18','40'),RATE('8','40'))),'100')), !(EQ(ADD_(ADD_(RATE('4','40'),RATE('10','40')),ADD_(RATE('18','40'),RATE('8','40'))),'100'))]),
  // ex-3am-nisba-miawiya-3am-l4-005
  'ex-3am-nisba-miawiya-3am-l4-005:q1': A(MUL_(DIV_('3','5'),'240')),
  'ex-3am-nisba-miawiya-3am-l4-005:q2': A(RATE('144','240')),
  'ex-3am-nisba-miawiya-3am-l4-005:q3': A(RATE('30','240')),
  'ex-3am-nisba-miawiya-3am-l4-005:q4': A(PCT_OF('240','12.5')),
  // ex-3am-nisba-miawiya-3am-l4-006
  'ex-3am-nisba-miawiya-3am-l4-006:q1': A(DIV_('6900','1.15')),
  'ex-3am-nisba-miawiya-3am-l4-006:q2': A(INC('6000','15')),
  'ex-3am-nisba-miawiya-3am-l4-006:q3': A(BASE_INC('6900','15')),
  'ex-3am-nisba-miawiya-3am-l4-006:q4': PICK([(LT('6900',INC('6200','15'))), !(LT('6900',INC('6200','15')))]),
  // ex-3am-nisba-miawiya-3am-l4-007
  'ex-3am-nisba-miawiya-3am-l4-007:q1': A(MUL_(MUL_('2','1.5'),'1')),
  'ex-3am-nisba-miawiya-3am-l4-007:q2': A(MUL_('3','1000')),
  'ex-3am-nisba-miawiya-3am-l4-007:q3': A(PCT_OF('3000','65')),
  'ex-3am-nisba-miawiya-3am-l4-007:q4': A(RATE('2250','3000')),
  // ex-3am-nisba-miawiya-3am-l4-008
  'ex-3am-nisba-miawiya-3am-l4-008:q1': A(DIV_(ADD_(ADD_('12','9'),ADD_('14','11')),'4')),
  'ex-3am-nisba-miawiya-3am-l4-008:q2': A(ABS_(RATE(SUB_('13.8','11.5'),'11.5'))),
  'ex-3am-nisba-miawiya-3am-l4-008:q3': A(INC('13.8','10')),
  'ex-3am-nisba-miawiya-3am-l4-008:q4': PICK([(EQ('2.3',ABS_(RATE(SUB_('13.8','11.5'),'11.5')))), !(EQ('2.3',ABS_(RATE(SUB_('13.8','11.5'),'11.5'))))]),
  // ex-3am-nisba-miawiya-3am-l4-009
  'ex-3am-nisba-miawiya-3am-l4-009:q1': A(SUB_('180','135')),
  'ex-3am-nisba-miawiya-3am-l4-009:q2': A(ABS_(RATE(SUB_('135','180'),'180'))),
  'ex-3am-nisba-miawiya-3am-l4-009:q3': A(MUL_(MUL_('45','6'),'30')),
  'ex-3am-nisba-miawiya-3am-l4-009:q4': PICK([EQ('0.25',COEF('-25')), EQ('0.75',COEF('-25')), EQ('1.25',COEF('-25'))]),
  // ex-3am-nisba-miawiya-3am-l4-010
  'ex-3am-nisba-miawiya-3am-l4-010:q1': A(PCT_OF('20','90')),
  'ex-3am-nisba-miawiya-3am-l4-010:q2': A(PCT_OF('30','70')),
  'ex-3am-nisba-miawiya-3am-l4-010:q3': A(ADD_('20','30')),
  'ex-3am-nisba-miawiya-3am-l4-010:q4': A(RATE('39','50')),
  'ex-3am-nisba-miawiya-3am-l4-010:q5': PICK([(EQ('80',RATE(ADD_(PCT_OF('20','90'),PCT_OF('30','70')),'50'))), !(EQ('80',RATE(ADD_(PCT_OF('20','90'),PCT_OF('30','70')),'50')))]),
  // ex-3am-nisba-miawiya-3am-l5-001
  'ex-3am-nisba-miawiya-3am-l5-001:q1': A(DIV_('240','8')),
  'ex-3am-nisba-miawiya-3am-l5-001:q2': A(MUL_('3','30')),
  'ex-3am-nisba-miawiya-3am-l5-001:q3': A(PCT_OF('1600','25')),
  'ex-3am-nisba-miawiya-3am-l5-001:q4': A(PCT_OF('1600','35')),
  'ex-3am-nisba-miawiya-3am-l5-001:q5': A(RATE('192','1600')),
  'ex-3am-nisba-miawiya-3am-l5-001:q6': PICK([(LE('20',RATE(PCT_OF('1600','25'),'1600'))), !(LE('20',RATE(PCT_OF('1600','25'),'1600')))]),
  // ex-3am-nisba-miawiya-3am-l5-002
  'ex-3am-nisba-miawiya-3am-l5-002:q1': A(DIV_('90','6')),
  'ex-3am-nisba-miawiya-3am-l5-002:q2': A(MUL_('2','15')),
  'ex-3am-nisba-miawiya-3am-l5-002:q3': A(MUL_('15','30')),
  'ex-3am-nisba-miawiya-3am-l5-002:q4': A(PCT_OF('450','35')),
  'ex-3am-nisba-miawiya-3am-l5-002:q5': A(MUL_(PCT_OF('450','35'),'200')),
  'ex-3am-nisba-miawiya-3am-l5-002:q6': A(DEC('31500','10')),
  'ex-3am-nisba-miawiya-3am-l5-002:q7': PICK([(LE(DEC('31500','10'),'30000')), !(LE(DEC('31500','10'),'30000'))]),
  // ex-3am-nisba-miawiya-3am-l5-003
  'ex-3am-nisba-miawiya-3am-l5-003:q1': A(CHAIN('12000',['-25'])),
  'ex-3am-nisba-miawiya-3am-l5-003:q2': A(CHAIN('12000',['-25','19'])),
  'ex-3am-nisba-miawiya-3am-l5-003:q3': A(ABS_(TOTAL(['-25','19']))),
  'ex-3am-nisba-miawiya-3am-l5-003:q4': PICK([(LE(CHAIN('12000',['-25','19']),'10500')), !(LE(CHAIN('12000',['-25','19']),'10500'))]),
  'ex-3am-nisba-miawiya-3am-l5-003:q5': A(SUB_('10710','10500')),
  // ex-3am-nisba-miawiya-3am-l5-004
  'ex-3am-nisba-miawiya-3am-l5-004:q1': A(PCT_OF('480','35')),
  'ex-3am-nisba-miawiya-3am-l5-004:q2': A(PCT_OF('168','25')),
  'ex-3am-nisba-miawiya-3am-l5-004:q3': A(RATE('42','480')),
  'ex-3am-nisba-miawiya-3am-l5-004:q4': A(INC('168','25')),
  'ex-3am-nisba-miawiya-3am-l5-004:q5': PICK([(LE(INC('168','25'),'200')), !(LE(INC('168','25'),'200'))]),
  'ex-3am-nisba-miawiya-3am-l5-004:q6': A(SUB_('210','200')),
  // ex-3am-nisba-miawiya-3am-l5-005
  'ex-3am-nisba-miawiya-3am-l5-005:q1': A(DEC('6400','12.5')),
  'ex-3am-nisba-miawiya-3am-l5-005:q2': A(PCT_OF('6400','12.5')),
  'ex-3am-nisba-miawiya-3am-l5-005:q3': A(INC('5600','10')),
  'ex-3am-nisba-miawiya-3am-l5-005:q4': A(ABS_(TOTAL(['-12.5','10']))),
  'ex-3am-nisba-miawiya-3am-l5-005:q5': PICK([(LT(CHAIN('6400',['-12.5','10']),'6400')), !(LT(CHAIN('6400',['-12.5','10']),'6400'))]),
  // ex-3am-nisba-miawiya-3am-l5-006
  'ex-3am-nisba-miawiya-3am-l5-006:q1': A(MUL_(DIV_('1','8'),'2400')),
  'ex-3am-nisba-miawiya-3am-l5-006:q2': A(MUL_(DIV_('1','2'),'2400')),
  'ex-3am-nisba-miawiya-3am-l5-006:q3': A(SUB_(SUB_('2400','300'),'1200')),
  'ex-3am-nisba-miawiya-3am-l5-006:q4': A(RATE('900','2400')),
  'ex-3am-nisba-miawiya-3am-l5-006:q5': A(INC('2400','25')),
  'ex-3am-nisba-miawiya-3am-l5-006:q6': PICK([(LE(INC('2400','25'),'3000')), !(LE(INC('2400','25'),'3000'))]),
  // ex-3am-nisba-miawiya-3am-l5-007
  'ex-3am-nisba-miawiya-3am-l5-007:q1': A(INC('8000','20')),
  'ex-3am-nisba-miawiya-3am-l5-007:q2': A(CHAIN('8000',['20','-10'])),
  'ex-3am-nisba-miawiya-3am-l5-007:q3': A(SUB_('8640','8000')),
  'ex-3am-nisba-miawiya-3am-l5-007:q4': A(ABS_(RATE(SUB_('8640','8000'),'8000'))),
  'ex-3am-nisba-miawiya-3am-l5-007:q5': A(MUL_('640','25')),
  'ex-3am-nisba-miawiya-3am-l5-007:q6': PICK([(LE('15000',MUL_(SUB_(CHAIN('8000',['20','-10']),'8000'),'25'))), !(LE('15000',MUL_(SUB_(CHAIN('8000',['20','-10']),'8000'),'25')))]),
  // ex-3am-nisba-miawiya-3am-l5-008
  'ex-3am-nisba-miawiya-3am-l5-008:q1': A(RATE('180000','250000')),
  'ex-3am-nisba-miawiya-3am-l5-008:q2': A(SUB_('250000','180000')),
  'ex-3am-nisba-miawiya-3am-l5-008:q3': A(PCT_OF('180000','15')),
  'ex-3am-nisba-miawiya-3am-l5-008:q4': A(RATE('207000','250000')),
  'ex-3am-nisba-miawiya-3am-l5-008:q5': PICK([(LE('250000',ADD_('180000',PCT_OF('180000','15')))), !(LE('250000',ADD_('180000',PCT_OF('180000','15'))))]),
  // ex-3am-nisba-miawiya-3am-l5-009
  'ex-3am-nisba-miawiya-3am-l5-009:q1': A(CHAIN('8000',['5'])),
  'ex-3am-nisba-miawiya-3am-l5-009:q2': A(CHAIN('8000',['5','5'])),
  'ex-3am-nisba-miawiya-3am-l5-009:q3': A(ABS_(TOTAL(['5','5']))),
  'ex-3am-nisba-miawiya-3am-l5-009:q4': PICK([(LE(CHAIN('8000',['5','5']),'9000')), !(LE(CHAIN('8000',['5','5']),'9000'))]),
  'ex-3am-nisba-miawiya-3am-l5-009:q5': PICK([(LE(CHAIN('8000',['5','5','5']),'9000')), !(LE(CHAIN('8000',['5','5','5']),'9000'))]),
  // ex-3am-nisba-miawiya-3am-l5-010
  'ex-3am-nisba-miawiya-3am-l5-010:q1': A(WHOLE('360','15')),
  'ex-3am-nisba-miawiya-3am-l5-010:q2': A(PCT_OF('2400','35')),
  'ex-3am-nisba-miawiya-3am-l5-010:q3': A(DEC('30','10')),
  'ex-3am-nisba-miawiya-3am-l5-010:q4': A(MUL_('2400',DEC('30','10'))),
  'ex-3am-nisba-miawiya-3am-l5-010:q5': PICK([(LE('60000',MUL_('2400',DEC('30','10')))), !(LE('60000',MUL_('2400',DEC('30','10'))))]),
};
