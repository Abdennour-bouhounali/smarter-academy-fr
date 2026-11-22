// Oracle du banc « jida-kasrayn » (جداء كسرين, 2AM unité 2, 2026-10-29) — feuilles d'examen « على منوال اختبار الفصل … ».
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI à partir des nombres de l'énoncé retapés en littéraux (« 3/8 », « 2.8 », « 720000 »), avec une
// arithmétique de RATIONNELS EXACTS en BigInt écrite dans ce fichier : aucun import de packages/core, aucune lecture de
// `expectedAnswer`. Outils :
//  - P(...facteurs) : le produit exact ; S(...termes) : la somme signée (« +3/10 », « -1/4 ») ; « a/b de x » = P("a/b","x") ;
//    « a/b du reste » = P("b'", S("1","-a/b")) — chaque réponse « du reste » est recalculée depuis les fractions de l'énoncé ;
//    aires, volumes, montants en DA : produits de littéraux ;
//  - YN / GE / GT / EQV : décisions (A = نعم, B = لا) ; PICK / MULTI : QCM jugés option par option (une seule juste pour PICK) ;
//    CMP : A « > », B « < », C « = » ; MAXI : la plus grande valeur (unique) ; INTR : le produit « dont le résultat diffère » ;
//    FINDX : l'entier x unique qui vérifie la relation ; DEF / EXC / BR : valeur approchée par défaut / par excès / encadrement
//    strict à 10^-k par une division longue chiffre par chiffre ;
//  - SPECS + audit(bank) : chaque signature MISC-JIDAKASR-* (SUMACROSS, DENSUM, CROSS, BOTHMUL, FLIP, HALFWAY, OFWHOLE,
//    OFSPENT) est RECALCULÉE depuis les opérandes et doit être FAUSSE ; chaque option de QCM porte la valeur de l'erreur qu'elle
//    nomme ; les nombres imprimés dans les énoncés par défaut sont relus et comparés aux opérandes ; aucune somme de deux
//    dénominateurs dont l'un ne divise pas l'autre (cas de 3AM) ; aucun « ÷ fraction », aucun pourcentage, aucun négatif.
import { R, C } from './helpers.mjs';

const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
class Q {
  constructor(n, d = 1n) { n = BigInt(n); d = BigInt(d); if (d === 0n) throw new Error('division par zéro'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); this.n = n / g; this.d = d / g; }
  add(o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Q(this.n * o.n, this.d * o.d); }
  eq(o) { return this.n === o.n && this.d === o.d; }
  lt(o) { return this.n * o.d < o.n * this.d; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}
/** « 4.5 » → 45/10 ; « 3/8 » ; « 2.5/7 ». */
const decQ = (s) => { const neg = s.startsWith('-'); const [i, f = ''] = s.replace('-', '').split('.'); const q = new Q(BigInt(i + f), 10n ** BigInt(f.length)); return neg ? new Q(-q.n, q.d) : q; };
const q = (v) => {
  if (v instanceof Q) return v;
  const s = String(v).trim().replace(/^\+/, '');
  if (!s.includes('/')) return decQ(s);
  const k = s.lastIndexOf('/'); const a = decQ(s.slice(0, k)), b = decQ(s.slice(k + 1));
  return new Q(a.n * b.d, a.d * b.n);
};
const P = (...fs) => fs.reduce((a, f) => a.mul(q(f)), new Q(1n)).toString();
const S = (...terms) => terms.reduce((a, t) => a.add(q(t)), new Q(0n)).toString();
const EQV = (a, b) => q(a).eq(q(b));
const GE = (a, b) => !q(a).lt(q(b));
const GT = (a, b) => q(b).lt(q(a));
const YN = (t) => C(t ? 'A' : 'B');
const keyOf = (flags, what) => { const hits = flags.map((f, i) => (f ? i : -1)).filter((i) => i >= 0); if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`); return C('ABCDEF'[hits[0]]); };
const PICK = (v, opts) => keyOf(opts.map((o) => EQV(o, v)), `PICK ${v}`);
const MULTI = (v, opts) => ({ choiceIds: opts.map((o, i) => (EQV(o, v) ? 'ABCDEF'[i] : null)).filter(Boolean) });
const CMP = (l, r) => C(GT(l, r) ? 'A' : (q(l).lt(q(r)) ? 'B' : 'C'));
const MAXI = (vals) => { const best = vals.reduce((bi, v, i) => (GT(v, vals[bi]) ? i : bi), 0); if (vals.some((v, i) => i !== best && !q(v).lt(q(vals[best])))) throw new Error('maximum non unique'); return C('ABCDEF'[best]); };
const INTR = (lists) => { const vals = lists.map((fl) => P(...fl)); const odd = vals.map((v, i) => i).filter((i) => vals.filter((w) => w === vals[i]).length === 1); if (odd.length !== 1) throw new Error('un seul intrus attendu'); return C('ABCDEF'[odd[0]]); };
const FINDX = (pred) => { const hits = []; for (let x = 0; x <= 2000; x++) if (pred(String(x))) hits.push(x); if (hits.length !== 1) throw new Error(`FINDX : ${hits.length} solutions`); return String(hits[0]); };
const longDiv = (v, k) => {
  const x = q(v); let rest = x.n; const d = x.d; let int = 0n;
  while (rest >= d) { rest -= d; int += 1n; }
  let digits = '';
  for (let i = 0; i < k; i++) { rest *= 10n; let c = 0; while (rest >= d) { rest -= d; c++; } digits += String(c); }
  return { int, digits, rest };
};
const join = (int, digits) => { const s = digits.replace(/0+$/, ''); return s ? `${int}.${s}` : String(int); };
const DEF = (v, k) => { const { int, digits } = longDiv(v, k); return join(int, digits); };
const EXC = (v, k) => {
  const { int, digits, rest } = longDiv(v, k);
  if (rest === 0n) throw new Error(`${v} s'arrête à ${k} décimales : pas de valeur par excès distincte`);
  const N = BigInt(int.toString() + digits) + 1n; const s = N.toString().padStart(k + 1, '0'); return join(s.slice(0, s.length - k), k ? s.slice(-k) : '');
};
const BR = (v, k, opts) => keyOf(opts.map(([lo, hi]) => q(hi).sub(q(lo)).eq(new Q(1n, 10n ** BigInt(k))) && q(lo).lt(q(v)) && q(v).lt(q(hi))), `BR ${v}`);

const L = 'ex-2am-jida-kasrayn';
const K = (lvl, n, qid) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${qid}`;

export const ORACLE = {
  [K(1, 1, 'q1')]: R(P("5/6","3/10")),
  [K(1, 1, 'q2')]: R(P("14/5","15/7")),
  [K(1, 1, 'q3')]: R(P("7/4","2/5")),
  [K(1, 1, 'q4')]: R(S(P("7/4","2/5"),"+3/10")),
  [K(1, 2, 'q1')]: R(P("5/6","3/10")),
  [K(1, 2, 'q2')]: R(S("9/4",P("5/6","3/10"))),
  [K(1, 3, 'q1')]: PICK(P("3/5","2/9"), ["5/14", "3/7", "27/10", "2/15"]),
  [K(1, 3, 'q2')]: PICK(P("4","3/10"), ["7/10", "6/5", "3/10"]),
  [K(1, 3, 'q3')]: PICK(P("3/4","24"), ["21", "18", "32", "6"]),
  [K(1, 4, 'q1')]: R(P("3/4","8/9")),
  [K(1, 4, 'q2')]: R(P("5/6","9/10")),
  [K(1, 4, 'q3')]: R(P("4/15","25/8")),
  [K(1, 5, 'q1')]: R(P("6","5/9")),
  [K(1, 5, 'q2')]: R(P("8","7/12")),
  [K(1, 5, 'q3')]: R(P("5","3/5")),
  [K(1, 6, 'q1')]: R(P("14/5","5/7")),
  [K(1, 6, 'q2')]: R(P("2/5","3/8")),
  [K(1, 6, 'q3')]: R(P("5/2","4/15")),
  [K(1, 7, 'q1')]: R(P("3/5","7/2")),
  [K(1, 7, 'q2')]: R(P("11/4","5/3")),
  [K(1, 7, 'q3')]: R(P("1/6","35/4")),
  [K(1, 8, 'q1')]: MULTI(P("5/9","2/7"), ["10/63", "35/18", "5/8", "10/63"]),
  [K(1, 9, 'q1')]: PICK(P("4/7","7/3"), ["14/5", "12/49", "4/3", "11/10"]),
  [K(1, 10, 'q1')]: R(FINDX(x => EQV(P("3/5",x+"/7"),"12/35"))),
  [K(1, 10, 'q2')]: R(FINDX(x => EQV(P(x+"/9","3/4"),"1/6"))),
  [K(1, 10, 'q3')]: R(FINDX(x => EQV(P("5/8",x+"/3"),"5/6"))),
  [K(2, 1, 'q1')]: R(S("1","-5/12","-1/3")),
  [K(2, 1, 'q2')]: R(P("5/12","720000")),
  [K(2, 1, 'q3')]: R(P("1/3","720000")),
  [K(2, 1, 'q4')]: R(P("1/4","720000")),
  [K(2, 1, 'q5')]: R(P("180000","1/12000")),
  [K(2, 2, 'q1')]: R(P("5/8","72")),
  [K(2, 2, 'q2')]: R(S("72","-"+P("5/8","72"))),
  [K(2, 2, 'q3')]: YN(GE(P("5/8","72"),"40")),
  [K(2, 3, 'q1')]: R(P("3/8","1200")),
  [K(2, 3, 'q2')]: R(S("1","-3/8")),
  [K(2, 3, 'q3')]: R(P("5/8","1200")),
  [K(2, 4, 'q1')]: R(P("5/8","24")),
  [K(2, 4, 'q2')]: R(P("4/5","15")),
  [K(2, 4, 'q3')]: R(S(P("5/8","24"),"+"+P("4/5","15"))),
  [K(2, 5, 'q1')]: R(P("3/7","63")),
  [K(2, 5, 'q2')]: R(P("3/7","56")),
  [K(2, 5, 'q3')]: R(S(P("3/7","63"),"-"+P("3/7","56"))),
  [K(2, 5, 'q4')]: YN(GT(P("3/7","56"),"25")),
  [K(2, 6, 'q1')]: R(P("1/8","840")),
  [K(2, 6, 'q2')]: R(P("3/7","840")),
  [K(2, 6, 'q3')]: R(S("840","-"+P("1/8","840"),"-"+P("3/7","840"))),
  [K(2, 6, 'q4')]: YN(GT("360","375")),
  [K(2, 7, 'q1')]: YN(EQV(P("3/5","45"),"75")),
  [K(2, 7, 'q2')]: YN(EQV(P("5/6","48"),"8")),
  [K(2, 7, 'q3')]: YN(GT(P("3/4","60"),P("2/3","60"))),
  [K(2, 8, 'q1')]: R(P("4/9","4500")),
  [K(2, 8, 'q2')]: R(S("4500","-"+P("4/9","4500"))),
  [K(2, 9, 'q1')]: R(P("1/3","9/14")),
  [K(2, 9, 'q2')]: R(P("1/4","8/15")),
  [K(2, 9, 'q3')]: R(P("3/4","4/9")),
  [K(2, 10, 'q1')]: MULTI(P("3/8","48"), ["387/8", "18", "128", "6", "18"]),
  [K(2, 10, 'q2')]: R(P("3/8","48")),
  [K(2, 10, 'q3')]: R(P("5/6","72")),
  [K(3, 1, 'q1')]: R(P("2/3","5/3")),
  [K(3, 1, 'q2')]: R(S("7/9",P("2/3","5/3"))),
  [K(3, 1, 'q3')]: R(S("3/8","+9/4")),
  [K(3, 1, 'q4')]: R(P(S("3/8","+9/4"),"4/7")),
  [K(3, 2, 'q1')]: CMP("5/6", "7/12"),
  [K(3, 2, 'q2')]: R(P("5/6","7/12")),
  [K(3, 2, 'q3')]: R(S("5/6","+7/12")),
  [K(3, 2, 'q4')]: R(S("5/6","-7/12")),
  [K(3, 2, 'q5')]: R(P(S("5/6","+7/12"),S("5/6","-7/12"))),
  [K(3, 3, 'q1')]: R(P("480","1/48")),
  [K(3, 3, 'q2')]: R(P("5/6","480")),
  [K(3, 3, 'q3')]: R(P("1/6","480")),
  [K(3, 4, 'q1')]: R(P("2/3","9/4","5/6")),
  [K(3, 4, 'q2')]: R(P("7/5","10/21","3/2")),
  [K(3, 4, 'q3')]: R(P("3/8","4/9","6/5")),
  [K(3, 5, 'q1')]: INTR([["5/2","4/5","3/2"],["2/3","9/4","1/2"],["9/4","2/3","2"],["7/8","16/7","3/2"]]),
  [K(3, 5, 'q2')]: R(P("5/2","4/5","3/2")),
  [K(3, 6, 'q1')]: R(P("9/2","4/3")),
  [K(3, 6, 'q2')]: R(P("2/3","2/3")),
  [K(3, 6, 'q3')]: R(P("3/2","4/3","5/2")),
  [K(3, 7, 'q1')]: R(S("1","-3/4")),
  [K(3, 7, 'q2')]: R(P("5/6",S("1","-3/4"))),
  [K(3, 7, 'q3')]: R(P(S("1","-3/4"),S("1","-5/6"))),
  [K(3, 8, 'q1')]: R(P("3/5","5/8")),
  [K(3, 8, 'q2')]: R(P("3/5","120")),
  [K(3, 8, 'q3')]: R(P("5/8","80")),
  [K(3, 8, 'q4')]: R(P("3/8","9600")),
  [K(3, 9, 'q1')]: R(P("2/3","9","5/6")),
  [K(3, 9, 'q2')]: R(P("4","5/8","2/3")),
  [K(3, 9, 'q3')]: R(P("7/10","5","4/7")),
  [K(3, 10, 'q1')]: YN(EQV(P("3/4","2/5"),"6/9")),
  [K(3, 10, 'q2')]: YN(EQV(P("3/4","2/5"),"15/8")),
  [K(3, 10, 'q3')]: R(P("3/4","2/5")),
  [K(4, 1, 'q1')]: R(S("2/3","+1/6")),
  [K(4, 1, 'q2')]: R(P(S("2/3","+1/6"),"3/10")),
  [K(4, 1, 'q3')]: R(DEF("1/4", 2)),
  [K(4, 2, 'q1')]: R(S("7/10","-1/5")),
  [K(4, 2, 'q2')]: R(P("5/4",S("7/10","-1/5"))),
  [K(4, 2, 'q3')]: R(DEF("5/8", 3)),
  [K(4, 3, 'q1')]: R(P("3/7","5/4")),
  [K(4, 3, 'q2')]: R(DEF("15/28", 2)),
  [K(4, 3, 'q3')]: R(EXC("15/28", 2)),
  [K(4, 3, 'q4')]: BR("15/28", 2, [["0.52", "0.53"], ["0.53", "0.54"], ["0.54", "0.55"], ["0.55", "0.56"]]),
  [K(4, 4, 'q1')]: R(P("5/6","7/3")),
  [K(4, 4, 'q2')]: R(DEF("35/18", 2)),
  [K(4, 4, 'q3')]: BR("35/18", 0, [["0", "1"], ["1", "2"], ["2", "3"], ["3", "4"]]),
  [K(4, 5, 'q1')]: R(P("7/4","9/5")),
  [K(4, 5, 'q2')]: R(DEF("63/20", 1)),
  [K(4, 5, 'q3')]: R(EXC("63/20", 1)),
  [K(4, 6, 'q1')]: R(P("3/4","2/3")),
  [K(4, 6, 'q2')]: CMP(P("3/4","2/3"), "2/5"),
  [K(4, 6, 'q3')]: CMP(P("5/6","3/5"), "1/2"),
  [K(4, 7, 'q1')]: R(P("3/8","480")),
  [K(4, 7, 'q2')]: R(P("1/4","480")),
  [K(4, 7, 'q3')]: R(S("3/8","+1/4")),
  [K(4, 7, 'q4')]: R(S("480","-"+P("3/8","480"),"-"+P("1/4","480"))),
  [K(4, 8, 'q1')]: R(P("12/5","3/8")),
  [K(4, 8, 'q2')]: R(DEF("9/10", 1)),
  [K(4, 8, 'q3')]: YN(EQV(P("3/8","2.4"),"0.9")),
  [K(4, 8, 'q4')]: R(P("3/2","4/9")),
  [K(4, 9, 'q1')]: R(S("1","-1/4")),
  [K(4, 9, 'q2')]: R(P("1/3",S("1","-1/4"))),
  [K(4, 9, 'q3')]: R(S("1/4","+"+P("1/3",S("1","-1/4")))),
  [K(4, 9, 'q4')]: R(P("1/2","960")),
  [K(4, 10, 'q1')]: R(P("3/4","2/9")),
  [K(4, 10, 'q2')]: R(S(P("3/4","2/9"),"+1/3")),
  [K(4, 10, 'q3')]: YN(EQV(S(P("3/4","2/9"),"+1/3"),"0.5")),
  [K(5, 1, 'q1')]: R(S("1","-1/4","-5/12")),
  [K(5, 1, 'q2')]: R(P("1/4","36000")),
  [K(5, 1, 'q3')]: R(P("5/12","36000")),
  [K(5, 1, 'q4')]: R(P("1/3","36000")),
  [K(5, 1, 'q5')]: YN(GE("12000","13500")),
  [K(5, 2, 'q1')]: R(P("500","300")),
  [K(5, 2, 'q2')]: R(P("1/4","150000")),
  [K(5, 2, 'q3')]: R(S("1","-1/4","-1/8")),
  [K(5, 2, 'q4')]: R(P("4/5",S("1","-3/8"))),
  [K(5, 2, 'q5')]: R(P("1/2","150000")),
  [K(5, 2, 'q6')]: MAXI(["1/2","1/4","1/8"]),
  [K(5, 3, 'q1')]: MAXI(["3/8","1/4","1/8"]),
  [K(5, 3, 'q2')]: R(S("3/8","+1/4","+1/8")),
  [K(5, 3, 'q3')]: R(S("1","-3/4")),
  [K(5, 3, 'q4')]: R(P("160","90")),
  [K(5, 3, 'q5')]: R(P("3/4","14400")),
  [K(5, 3, 'q6')]: R(P("1/4","14400")),
  [K(5, 4, 'q1')]: R(P("2/3",S("1","-1/4"))),
  [K(5, 4, 'q2')]: R(P("1/2","480")),
  [K(5, 4, 'q3')]: R(P(S("1","-1/4"),S("1","-2/3"))),
  [K(5, 4, 'q4')]: R(P("1/4","480")),
  [K(5, 5, 'q1')]: R(P("2/5","4500")),
  [K(5, 5, 'q2')]: R(P("3/4","2800")),
  [K(5, 5, 'q3')]: MAXI([P("2/5","4500"),P("3/4","2800")]),
  [K(5, 5, 'q4')]: R(S("2800","-"+P("3/4","2800"))),
  [K(5, 6, 'q1')]: R(P("5/8","16")),
  [K(5, 6, 'q2')]: R(S("16","-"+P("5/8","16"))),
  [K(5, 6, 'q3')]: R(P("2/3","6")),
  [K(5, 6, 'q4')]: R(S("6","-"+P("2/3","6"))),
  [K(5, 6, 'q5')]: YN(GE("2","3")),
  [K(5, 7, 'q1')]: R(P("2/5","1500")),
  [K(5, 7, 'q2')]: R(P("1/3",S("1","-2/5"))),
  [K(5, 7, 'q3')]: R(P("1/5","1500")),
  [K(5, 7, 'q4')]: R(S("1500","-"+P("2/5","1500"),"-"+P("1/5","1500"))),
  [K(5, 8, 'q1')]: R(S("1","-5/8","-1/4")),
  [K(5, 8, 'q2')]: R(P("5/8","840000")),
  [K(5, 8, 'q3')]: R(P("1/4","840000")),
  [K(5, 8, 'q4')]: R(P("1/8","840000")),
  [K(5, 8, 'q5')]: YN(EQV(P("1/4","840000"),P("2","1/8","840000"))),
  [K(5, 9, 'q1')]: R(P("3/8","24")),
  [K(5, 9, 'q2')]: R(S("24","-"+P("3/8","24"))),
  [K(5, 9, 'q3')]: R(P("4/5","15")),
  [K(5, 9, 'q4')]: R(S("15","-"+P("4/5","15"))),
  [K(5, 9, 'q5')]: YN(GE("3","3")),
  [K(5, 10, 'q1')]: R(P("1/4","360")),
  [K(5, 10, 'q2')]: R(P("2/3",S("1","-1/4"))),
  [K(5, 10, 'q3')]: R(P("1/2","360")),
  [K(5, 10, 'q4')]: R(S("360","-"+P("1/4","360"),"-"+P("1/2","360"))),
  [K(5, 10, 'q5')]: YN(GE("5",P("90","1/15"))),
};

/** Opérandes de chaque question dont une signature / option nomme une erreur (relus par audit). */
const SPECS = {
  [K(1, 1, 'q1')]: {"kind": "prod", "a": "5", "b": "6", "c": "3", "d": "10"},
  [K(1, 1, 'q2')]: {"kind": "prod", "a": "14", "b": "5", "c": "15", "d": "7"},
  [K(1, 1, 'q3')]: {"kind": "prod", "a": "7", "b": "4", "c": "2", "d": "5"},
  [K(1, 2, 'q1')]: {"kind": "prod", "a": "5", "b": "6", "c": "3", "d": "10"},
  [K(1, 3, 'q1')]: {"kind": "opt", "base": {"kind": "prod", "a": "3", "b": "5", "c": "2", "d": "9"}, "opts": [{"v": "5/14", "misc": "SUMACROSS"}, {"v": "3/7", "misc": "DENSUM"}, {"v": "27/10", "misc": "CROSS"}, {"v": "2/15", "misc": null}], "multi": false},
  [K(1, 3, 'q2')]: {"kind": "opt", "base": {"kind": "nprod", "n": "4", "a": "3", "b": "10"}, "opts": [{"v": "7/10", "misc": null}, {"v": "6/5", "misc": null}, {"v": "3/10", "misc": "BOTHMUL"}], "multi": false},
  [K(1, 3, 'q3')]: {"kind": "opt", "base": {"kind": "of", "a": "3", "b": "4", "x": "24"}, "opts": [{"v": "21", "misc": null}, {"v": "18", "misc": null}, {"v": "32", "misc": "FLIP"}, {"v": "6", "misc": "HALFWAY"}], "multi": false},
  [K(1, 4, 'q1')]: {"kind": "prod", "a": "3", "b": "4", "c": "8", "d": "9"},
  [K(1, 4, 'q2')]: {"kind": "prod", "a": "5", "b": "6", "c": "9", "d": "10"},
  [K(1, 4, 'q3')]: {"kind": "prod", "a": "4", "b": "15", "c": "25", "d": "8"},
  [K(1, 5, 'q1')]: {"kind": "nprod", "n": "6", "a": "5", "b": "9"},
  [K(1, 5, 'q2')]: {"kind": "nprod", "n": "8", "a": "7", "b": "12"},
  [K(1, 5, 'q3')]: {"kind": "nprod", "n": "5", "a": "3", "b": "5"},
  [K(1, 6, 'q1')]: {"kind": "nprod", "n": "14/5", "a": "5", "b": "7"},
  [K(1, 6, 'q2')]: {"kind": "nprod", "n": "2/5", "a": "3", "b": "8"},
  [K(1, 6, 'q3')]: {"kind": "nprod", "n": "5/2", "a": "4", "b": "15"},
  [K(1, 7, 'q1')]: {"kind": "prod", "a": "3", "b": "5", "c": "7", "d": "2"},
  [K(1, 7, 'q2')]: {"kind": "prod", "a": "11", "b": "4", "c": "5", "d": "3"},
  [K(1, 7, 'q3')]: {"kind": "prod", "a": "1", "b": "6", "c": "35", "d": "4"},
  [K(1, 8, 'q1')]: {"kind": "opt", "base": {"kind": "prod", "a": "5", "b": "9", "c": "2", "d": "7"}, "opts": [{"v": "10/63", "misc": null}, {"v": "35/18", "misc": "CROSS"}, {"v": "5/8", "misc": "DENSUM"}, {"v": "10/63", "misc": null}], "multi": true},
  [K(1, 9, 'q1')]: {"kind": "opt", "base": {"kind": "prod", "a": "4", "b": "7", "c": "7", "d": "3"}, "opts": [{"v": "14/5", "misc": "DENSUM"}, {"v": "12/49", "misc": "CROSS"}, {"v": "4/3", "misc": null}, {"v": "11/10", "misc": "SUMACROSS"}], "multi": false},
  [K(2, 1, 'q2')]: {"kind": "of", "a": "5", "b": "12", "x": "720000"},
  [K(2, 1, 'q3')]: {"kind": "of", "a": "1", "b": "3", "x": "720000"},
  [K(2, 1, 'q4')]: {"kind": "of", "a": "1", "b": "4", "x": "720000"},
  [K(2, 2, 'q1')]: {"kind": "of", "a": "5", "b": "8", "x": "72"},
  [K(2, 3, 'q1')]: {"kind": "of", "a": "3", "b": "8", "x": "1200"},
  [K(2, 3, 'q3')]: {"kind": "of", "a": "5", "b": "8", "x": "1200"},
  [K(2, 4, 'q1')]: {"kind": "of", "a": "5", "b": "8", "x": "24"},
  [K(2, 4, 'q2')]: {"kind": "of", "a": "4", "b": "5", "x": "15"},
  [K(2, 5, 'q1')]: {"kind": "of", "a": "3", "b": "7", "x": "63"},
  [K(2, 5, 'q2')]: {"kind": "of", "a": "3", "b": "7", "x": "56"},
  [K(2, 6, 'q1')]: {"kind": "of", "a": "1", "b": "8", "x": "840"},
  [K(2, 6, 'q2')]: {"kind": "of", "a": "3", "b": "7", "x": "840"},
  [K(2, 7, 'q1')]: {"kind": "ynmisc", "base": {"kind": "of", "a": "3", "b": "5", "x": "45"}, "claim": "75", "misc": "FLIP", "truth": false},
  [K(2, 7, 'q2')]: {"kind": "ynmisc", "base": {"kind": "of", "a": "5", "b": "6", "x": "48"}, "claim": "8", "misc": "HALFWAY", "truth": false},
  [K(2, 8, 'q1')]: {"kind": "of", "a": "4", "b": "9", "x": "4500"},
  [K(2, 9, 'q1')]: {"kind": "prod", "a": "1", "b": "3", "c": "9", "d": "14"},
  [K(2, 9, 'q2')]: {"kind": "prod", "a": "1", "b": "4", "c": "8", "d": "15"},
  [K(2, 9, 'q3')]: {"kind": "prod", "a": "3", "b": "4", "c": "4", "d": "9"},
  [K(2, 10, 'q1')]: {"kind": "opt", "base": {"kind": "of", "a": "3", "b": "8", "x": "48"}, "opts": [{"v": "387/8", "misc": null}, {"v": "18", "misc": null}, {"v": "128", "misc": "FLIP"}, {"v": "6", "misc": "HALFWAY"}, {"v": "18", "misc": null}], "multi": true},
  [K(2, 10, 'q2')]: {"kind": "of", "a": "3", "b": "8", "x": "48"},
  [K(2, 10, 'q3')]: {"kind": "of", "a": "5", "b": "6", "x": "72"},
  [K(3, 1, 'q1')]: {"kind": "prod", "a": "2", "b": "3", "c": "5", "d": "3"},
  [K(3, 1, 'q4')]: {"kind": "prod", "a": "21", "b": "8", "c": "4", "d": "7"},
  [K(3, 2, 'q2')]: {"kind": "prod", "a": "5", "b": "6", "c": "7", "d": "12"},
  [K(3, 2, 'q5')]: {"kind": "prod", "a": "17", "b": "12", "c": "1", "d": "4"},
  [K(3, 3, 'q2')]: {"kind": "of", "a": "5", "b": "6", "x": "480"},
  [K(3, 3, 'q3')]: {"kind": "of", "a": "1", "b": "6", "x": "480"},
  [K(3, 5, 'q1')]: {"kind": "intr", "lists": [["5/2", "4/5", "3/2"], ["2/3", "9/4", "1/2"], ["9/4", "2/3", "2"], ["7/8", "16/7", "3/2"]]},
  [K(3, 6, 'q1')]: {"kind": "prod", "a": "9", "b": "2", "c": "4", "d": "3"},
  [K(3, 6, 'q2')]: {"kind": "prod", "a": "2", "b": "3", "c": "2", "d": "3"},
  [K(3, 7, 'q2')]: {"kind": "rem", "f1": "3/4", "f2": "5/6"},
  [K(3, 7, 'q3')]: {"kind": "remleft", "f1": "3/4", "f2": "5/6"},
  [K(3, 8, 'q1')]: {"kind": "prod", "a": "3", "b": "5", "c": "5", "d": "8"},
  [K(3, 8, 'q2')]: {"kind": "of", "a": "3", "b": "5", "x": "120"},
  [K(3, 8, 'q3')]: {"kind": "of", "a": "5", "b": "8", "x": "80"},
  [K(3, 8, 'q4')]: {"kind": "of", "a": "3", "b": "8", "x": "9600"},
  [K(3, 10, 'q1')]: {"kind": "ynmisc", "base": {"kind": "prod", "a": "3", "b": "4", "c": "2", "d": "5"}, "claim": "6/9", "misc": "DENSUM", "truth": false},
  [K(3, 10, 'q2')]: {"kind": "ynmisc", "base": {"kind": "prod", "a": "3", "b": "4", "c": "2", "d": "5"}, "claim": "15/8", "misc": "CROSS", "truth": false},
  [K(3, 10, 'q3')]: {"kind": "prod", "a": "3", "b": "4", "c": "2", "d": "5"},
  [K(4, 1, 'q2')]: {"kind": "prod", "a": "5", "b": "6", "c": "3", "d": "10"},
  [K(4, 2, 'q2')]: {"kind": "prod", "a": "5", "b": "4", "c": "1", "d": "2"},
  [K(4, 3, 'q1')]: {"kind": "prod", "a": "3", "b": "7", "c": "5", "d": "4"},
  [K(4, 4, 'q1')]: {"kind": "prod", "a": "5", "b": "6", "c": "7", "d": "3"},
  [K(4, 5, 'q1')]: {"kind": "prod", "a": "7", "b": "4", "c": "9", "d": "5"},
  [K(4, 6, 'q1')]: {"kind": "prod", "a": "3", "b": "4", "c": "2", "d": "3"},
  [K(4, 7, 'q1')]: {"kind": "of", "a": "3", "b": "8", "x": "480"},
  [K(4, 7, 'q2')]: {"kind": "of", "a": "1", "b": "4", "x": "480"},
  [K(4, 8, 'q1')]: {"kind": "nprod", "n": "12/5", "a": "3", "b": "8"},
  [K(4, 8, 'q4')]: {"kind": "nprod", "n": "3/2", "a": "4", "b": "9"},
  [K(4, 9, 'q2')]: {"kind": "rem", "f1": "1/4", "f2": "1/3"},
  [K(4, 9, 'q4')]: {"kind": "of", "a": "1", "b": "2", "x": "960"},
  [K(4, 10, 'q1')]: {"kind": "prod", "a": "3", "b": "4", "c": "2", "d": "9"},
  [K(5, 1, 'q2')]: {"kind": "of", "a": "1", "b": "4", "x": "36000"},
  [K(5, 1, 'q3')]: {"kind": "of", "a": "5", "b": "12", "x": "36000"},
  [K(5, 1, 'q4')]: {"kind": "of", "a": "1", "b": "3", "x": "36000"},
  [K(5, 2, 'q2')]: {"kind": "of", "a": "1", "b": "4", "x": "150000"},
  [K(5, 2, 'q4')]: {"kind": "rem", "f1": "3/8", "f2": "4/5"},
  [K(5, 2, 'q5')]: {"kind": "of", "a": "1", "b": "2", "x": "150000"},
  [K(5, 3, 'q5')]: {"kind": "of", "a": "3", "b": "4", "x": "14400"},
  [K(5, 3, 'q6')]: {"kind": "of", "a": "1", "b": "4", "x": "14400"},
  [K(5, 4, 'q1')]: {"kind": "rem", "f1": "1/4", "f2": "2/3"},
  [K(5, 4, 'q2')]: {"kind": "of", "a": "1", "b": "2", "x": "480"},
  [K(5, 4, 'q3')]: {"kind": "remleft", "f1": "1/4", "f2": "2/3"},
  [K(5, 4, 'q4')]: {"kind": "of", "a": "1", "b": "4", "x": "480"},
  [K(5, 5, 'q1')]: {"kind": "of", "a": "2", "b": "5", "x": "4500"},
  [K(5, 5, 'q2')]: {"kind": "of", "a": "3", "b": "4", "x": "2800"},
  [K(5, 6, 'q1')]: {"kind": "of", "a": "5", "b": "8", "x": "16"},
  [K(5, 6, 'q3')]: {"kind": "of", "a": "2", "b": "3", "x": "6"},
  [K(5, 7, 'q1')]: {"kind": "of", "a": "2", "b": "5", "x": "1500"},
  [K(5, 7, 'q2')]: {"kind": "rem", "f1": "2/5", "f2": "1/3"},
  [K(5, 7, 'q3')]: {"kind": "of", "a": "1", "b": "5", "x": "1500"},
  [K(5, 8, 'q2')]: {"kind": "of", "a": "5", "b": "8", "x": "840000"},
  [K(5, 8, 'q3')]: {"kind": "of", "a": "1", "b": "4", "x": "840000"},
  [K(5, 8, 'q4')]: {"kind": "of", "a": "1", "b": "8", "x": "840000"},
  [K(5, 9, 'q1')]: {"kind": "of", "a": "3", "b": "8", "x": "24"},
  [K(5, 9, 'q3')]: {"kind": "of", "a": "4", "b": "5", "x": "15"},
  [K(5, 10, 'q1')]: {"kind": "of", "a": "1", "b": "4", "x": "360"},
  [K(5, 10, 'q2')]: {"kind": "rem", "f1": "1/4", "f2": "2/3"},
  [K(5, 10, 'q3')]: {"kind": "of", "a": "1", "b": "2", "x": "360"},
};

/* ── Audit du banc (appelé par practice-answer-oracle.test.mjs) : liste des problèmes (vide = conforme) ─────────────── */
const MISC_OK = /^MISC-JIDAKASR-(SUMACROSS|DENSUM|CROSS|BOTHMUL|FLIP|HALFWAY|OFWHOLE|OFSPENT)$/;
const ONE = new Q(1n);
/** La valeur que donne l'erreur nommée, recalculée depuis les opérandes du spec. */
function errVal(sp, id) {
  const m = id.replace('MISC-JIDAKASR-', '');
  if (sp.kind === 'prod') {
    const [a, b, c, d] = [sp.a, sp.b, sp.c, sp.d].map(q);
    if (m === 'SUMACROSS') return a.add(c).mul(new Q(b.add(d).d, b.add(d).n));
    if (m === 'DENSUM') return a.mul(c).mul(new Q(b.add(d).d, b.add(d).n));
    if (m === 'CROSS') return a.mul(d).mul(new Q(b.mul(c).d, b.mul(c).n));
  }
  if (sp.kind === 'nprod' && m === 'BOTHMUL') { const n = q(sp.n); return n.mul(q(sp.a)).mul(new Q(n.mul(q(sp.b)).d, n.mul(q(sp.b)).n)); }
  if (sp.kind === 'of') {
    const [a, b, x] = [sp.a, sp.b, sp.x].map(q);
    if (m === 'FLIP') return x.mul(b).mul(new Q(a.d, a.n));
    if (m === 'HALFWAY') return x.mul(new Q(b.d, b.n));
  }
  if (sp.kind === 'rem') { const [f1, f2] = [sp.f1, sp.f2].map(q); if (m === 'OFWHOLE') return f2; if (m === 'OFSPENT') return f1.mul(f2); }
  if (sp.kind === 'remleft' && m === 'OFWHOLE') return ONE.sub(q(sp.f1)).sub(q(sp.f2));
  return null;
}
function trueVal(sp) {
  if (sp.kind === 'prod') return q(sp.a).mul(q(sp.c)).mul(new Q(q(sp.b).mul(q(sp.d)).d, q(sp.b).mul(q(sp.d)).n));
  if (sp.kind === 'nprod') return q(sp.n).mul(q(sp.a)).mul(new Q(q(sp.b).d, q(sp.b).n));
  if (sp.kind === 'of') return q(sp.x).mul(q(sp.a)).mul(new Q(q(sp.b).d, q(sp.b).n));
  if (sp.kind === 'rem') return q(sp.f2).mul(ONE.sub(q(sp.f1)));
  if (sp.kind === 'remleft') return ONE.sub(q(sp.f1)).mul(ONE.sub(q(sp.f2)));
  return null;
}
const islands = (s) => [...String(s ?? '').matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const FR = /\\dfrac\{([0-9{},]+)\}\{([0-9]+)\}/g;
const numTxt = (s) => s.replace('{,}', '.');
const related = (a, b) => a % b === 0n || b % a === 0n;
/** Un segment « sans = < > » qui additionne ou soustrait des fractions SANS produit : dénominateurs deux à deux liés par divisibilité. */
function scopeProblems(latex) {
  const out = [];
  for (const seg of latex.split(/=|<|>|\\neq|\\le|\\ge|\\geq|\\leq/)) {
    if (/\\times|\\div/.test(seg)) continue;
    if (!/[+-]/.test(seg.replace(/\\dfrac\{[^}]*\}\{[^}]*\}/g, 'X'))) continue;
    const ds = [...seg.matchAll(FR)].map((m) => BigInt(m[2]));
    for (const a of ds) for (const b of ds) if (!related(a, b)) out.push(`dénominateurs ${a} et ${b} : cas de 3AM dans « ${latex} »`);
  }
  return out;
}
/** Valeur d'un contenu d'option simple : « \dfrac{2 \times 5}{9 \times 7} », « \dfrac{12}{40} », « 15 », « a \times \dfrac{}{} \times b » ; null si autre. */
function optValue(content) {
  const m = /^\$([^$]+)\$$/.exec(content.trim()); if (!m) return null;
  const t = m[1].trim();
  const prodOf = (s) => { let acc = ONE; for (const tok of s.split('\\times').map((x) => x.trim())) { const f = /^\\dfrac\{([^}]*)\}\{([^}]*)\}$/.exec(tok); if (f) { const a = prodOf(f[1]), b = prodOf(f[2]); acc = acc.mul(a).mul(new Q(b.d, b.n)); } else if (/^[0-9{},]+$/.test(tok)) acc = acc.mul(decQ(numTxt(tok))); else return null; if (acc === null) return null; } return acc; };
  try { return prodOf(t); } catch { return null; }
}
export function audit(bank) {
  const problems = [];
  for (const { key, q: qu } of bank) {
    const texts = [qu.statement, qu.feedback?.correct, qu.feedback?.incorrect, ...(qu.solution?.lines ?? []), ...(qu.choices ?? []).map((c) => c.content), ...(qu.hints ?? []).map((h) => h.content)];
    for (const tx of texts) {
      if (/فوائد|فائدة|(^|[\s«])ربا([\s».]|$)|خنزير|قمار|(^|\s)نرد(\s|$)/.test(String(tx))) problems.push(`${key} : mot interdit dans « ${tx} »`);
      if (/%|\\%|بالمئة|نسبة مئوية/.test(String(tx))) problems.push(`${key} : pourcentage hors périmètre (2AM nisba-miawiya) dans « ${tx} »`);
      for (const isl of islands(tx)) {
        for (const p of scopeProblems(isl)) problems.push(`${key} : ${p}`);
        if (/\\div\s*\\dfrac|\\div\s*\\left/.test(isl)) problems.push(`${key} : division par une fraction (3AM) dans « ${isl} »`);
      }
    }
    const sp = SPECS[key];
    if (qu.answerType === 'rational') {
      const e = String(qu.expectedAnswer);
      if (qu.evaluationPolicy?.requiredForm === 'irreducible' && /\//.test(e)) { const [a, b] = e.split('/'); if (gcd(BigInt(a), BigInt(b)) !== 1n) problems.push(`${key} : la clé ${e} n'est pas réduite`); }
      const seen = new Set();
      for (const s of qu.misconceptionSignatures ?? []) {
        if (!MISC_OK.test(s.id)) problems.push(`${key} : signature ${s.id} hors MISC-JIDAKASR-*`);
        if (q(s.value).eq(q(e))) problems.push(`${key} : la signature ${s.id} (${s.value}) est la bonne réponse`);
        if (seen.has(String(q(s.value)))) problems.push(`${key} : deux signatures de même valeur ${s.value}`);
        seen.add(String(q(s.value)));
        if (!sp) { problems.push(`${key} : signature ${s.id} sans spec d'opérandes`); continue; }
        const ev = errVal(sp, s.id);
        if (ev === null) problems.push(`${key} : l'erreur ${s.id} n'existe pas pour une question « ${sp.kind} »`);
        else if (!ev.eq(q(s.value))) problems.push(`${key} : la signature ${s.id} vaut ${s.value}, l'erreur donne ${ev}`);
      }
      if (sp && trueVal(sp) && !trueVal(sp).eq(q(e))) problems.push(`${key} : la clé ${e} n'est pas ${trueVal(sp)} (spec ${sp.kind})`);
      if (sp && ['prod', 'nprod', 'of'].includes(sp.kind) && /^احسب \$/.test(qu.statement)) {
        const st = islands(qu.statement)[0].replace(/^\s*[A-Za-z]\s*=\s*/, '').replace(/\{,\}/g, '.');
        const nums = [...st.matchAll(/\\dfrac\{([0-9.]+)\}\{([0-9.]+)\}|([0-9.]+)/g)].map((m) => (m[1] ? `${m[1]}/${m[2]}` : m[3]));
        const want = sp.kind === 'prod' ? [`${sp.a}/${sp.b}`, `${sp.c}/${sp.d}`] : null;
        if (want && nums.length === 2 && /\\times/.test(st) && st.split('\\times').length === 2 && JSON.stringify(nums) !== JSON.stringify(want.map((w) => w))) problems.push(`${key} : l'énoncé imprime ${nums.join(' × ')} mais le spec vaut ${want.join(' × ')}`);
        if (sp.kind === 'nprod' && /\\times/.test(st) && st.split('\\times').length === 2) { const got = new Set(nums.map((n) => String(q(n)))); if (!(got.has(String(q(sp.n))) && got.has(String(q(`${sp.a}/${sp.b}`))))) problems.push(`${key} : l'énoncé « ${st} » ne retape pas ${sp.n} et ${sp.a}/${sp.b}`); }
      }
    } else if (qu.answerType === 'choice' || qu.answerType === 'multiChoice') {
      const good = qu.choices.filter((c) => c.isCorrect);
      if (qu.answerType === 'choice' && good.length !== 1) problems.push(`${key} : ${good.length} options justes`);
      if (qu.answerType === 'multiChoice' && good.length < 2) problems.push(`${key} : un multiChoice veut au moins 2 options justes`);
      for (const c of qu.choices) if (c.isCorrect && c.misconceptionId) problems.push(`${key} : option juste ${c.id} porte une misconception`);
      for (const c of qu.choices) if (c.misconceptionId && !MISC_OK.test(c.misconceptionId)) problems.push(`${key} : option ${c.id} hors MISC-JIDAKASR-*`);
      if (sp?.kind === 'opt') {
        const tv = trueVal(sp.base);
        if (qu.choices.length !== sp.opts.length) problems.push(`${key} : ${qu.choices.length} options pour ${sp.opts.length} dans le spec`);
        sp.opts.forEach((o, i) => {
          const c = qu.choices[i]; if (!c) return;
          const isTrue = q(o.v).eq(tv);
          if (c.isCorrect !== isTrue) problems.push(`${key} : l'option ${c.id} (${o.v}) ${isTrue ? 'vaut' : 'ne vaut pas'} ${tv} mais isCorrect = ${c.isCorrect}`);
          const want = o.misc ? `MISC-JIDAKASR-${o.misc}` : undefined;
          if (c.misconceptionId !== want) problems.push(`${key} : l'option ${c.id} porte ${c.misconceptionId} au lieu de ${want}`);
          if (o.misc) { const ev = errVal(sp.base, o.misc); if (!ev || !ev.eq(q(o.v))) problems.push(`${key} : l'option ${c.id} (${o.v}) n'est pas la valeur de l'erreur ${o.misc} (${ev})`); }
          const shown = optValue(c.content); if (shown && !shown.eq(q(o.v))) problems.push(`${key} : l'option ${c.id} imprime ${c.content} = ${shown}, le spec dit ${o.v}`);
        });
      }
      if (sp?.kind === 'ynmisc') {
        const ev = errVal(sp.base, sp.misc); const tv = trueVal(sp.base);
        if (!ev || !ev.eq(q(sp.claim))) problems.push(`${key} : l'affirmation ${sp.claim} n'est pas la valeur de l'erreur ${sp.misc} (${ev})`);
        if (q(sp.claim).eq(tv)) problems.push(`${key} : l'affirmation ${sp.claim} est vraie`);
        const a = qu.choices.find((c) => c.id === 'A'); if (a.misconceptionId !== `MISC-JIDAKASR-${sp.misc}`) problems.push(`${key} : « نعم » devrait porter ${sp.misc}`);
      }
      if (sp?.kind === 'intr') {
        const vals = sp.lists.map((fl) => fl.reduce((a, f) => a.mul(q(f)), ONE));
        sp.lists.forEach((fl, i) => {
          const c = qu.choices[i]; const shown = optValue(c.content);
          if (!shown || !shown.eq(vals[i])) problems.push(`${key} : l'option ${c.id} imprime ${c.content} mais le spec vaut ${vals[i]}`);
          const odd = vals.filter((w) => w.eq(vals[i])).length === 1;
          if (c.isCorrect !== odd) problems.push(`${key} : l'option ${c.id} (${vals[i]}) ${odd ? 'est' : "n'est pas"} l'intruse mais isCorrect = ${c.isCorrect}`);
        });
      }
    }
  }
  return problems;
}
