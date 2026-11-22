// Oracle du banc « jam-tarh-kusur » (جمع وطرح كسرين, 2AM unité 2, 2026-10-29) — feuilles d'examen « على منوال اختبار الفصل الأول ».
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI à partir des nombres de l'énoncé retapés en littéraux (« 3/8 », « -1/4 », « 4.5/7 »),
// avec une arithmétique de RATIONNELS EXACTS en BigInt écrite dans ce fichier (réduction et ppcm propres) : aucun import de
// packages/core, aucune lecture de `expectedAnswer`. Outils :
//  - S(...termes) : la somme signée, réduite (« 3/8 », « +1/4 », « -1/6 », « 2 ») ; NUM / FAC : le nouveau numérateur / le
//    facteur quand une fraction est réécrite sur un mutiple de son dénominateur (refuse un dénominateur qui n'est pas un multiple) ;
//  - RED : le résultat avant réduction (somme des numérateurs sur le plus petit dénominateur commun) est-il réductible ? ;
//  - LCMD : le plus petit multiple commun des dénominateurs, par FORCE BRUTE ; EQV / GE / GT : comparaisons exactes ;
//  - DEF / EXC : valeur approchée par défaut / par excès à 10^-k par une division longue chiffre par chiffre ; OVER : la valeur
//    écrite sur un dénominateur D (entier ou décimal exact) ; FLOORQ : la partie entière ; BR : l'encadrement à 10^-k (STRICT) ;
//  - AMT : fraction × total (étapes `counted: false` seulement) ; PICKV / MULTI : QCM jugés option par option (une seule option
//    juste pour PICKV) ; YN : A = نعم, B = لا.
//  - audit(bank) : RE-LIT le LaTeX de chaque énoncé / option / ligne de corrigé : AUCUNE opération du banc ne porte sur deux
//    dénominateurs dont l'un ne divise pas l'autre (cas de 3AM : jamais), chaque « احسب » est réévalué et doit valoir la clé,
//    les clés sont réduites, chaque signature est fausse et son erreur nommée (ACROSS, NOSCALE, DENSUM, NATURAL) est recalculée.
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
/** « 4.5 » → 45/10 ; « 3/8 » ; « -1/4 » ; « 4.5/7 ». */
const decQ = (s) => { const neg = s.startsWith('-'); const [i, f = ''] = s.replace('-', '').split('.'); const q = new Q(BigInt(i + f), 10n ** BigInt(f.length)); return neg ? new Q(-q.n, q.d) : q; };
const q = (v) => {
  if (v instanceof Q) return v;
  const s = String(v).trim().replace(/^\+/, '');
  if (!s.includes('/')) return decQ(s);
  const k = s.lastIndexOf('/'); const a = decQ(s.slice(0, k)), b = decQ(s.slice(k + 1));
  return new Q(a.n * b.d, a.d * b.n);
};
const sum = (terms) => terms.reduce((a, t) => a.add(q(t)), new Q(0n));
const S = (...terms) => sum(terms).toString();
const dens = (terms) => terms.filter((t) => String(t).includes('/')).map((t) => BigInt(String(t).slice(String(t).lastIndexOf('/') + 1)));
const bruteLcm = (ds) => { for (let m = 1n; ; m++) if (ds.every((d) => m % d === 0n)) return m; };
const NUM = (t, D) => { const d = BigInt(String(t).slice(String(t).lastIndexOf('/') + 1)); if (BigInt(D) % d !== 0n) throw new Error(`${D} n'est pas un multiple de ${d}`); return String(BigInt(String(t).slice(0, String(t).lastIndexOf('/'))) * (BigInt(D) / d)); };
const FAC = (t, D) => { const d = BigInt(String(t).slice(String(t).lastIndexOf('/') + 1)); if (BigInt(D) % d !== 0n) throw new Error(`${D} n'est pas un multiple de ${d}`); return String(BigInt(D) / d); };
const RED = (...terms) => { const D = bruteLcm(dens(terms)); let N = 0n; for (const t of terms) { const v = q(t); if (D % v.d !== 0n) throw new Error('dénominateur'); N += v.n * (D / v.d); } return gcd(N, D) > 1n; };
const EQV = (a, b) => q(a).eq(q(b));
const GE = (a, b) => !q(a).lt(q(b));
const LCMD = (...fr) => String(bruteLcm(fr.map((t) => BigInt(String(t).slice(String(t).lastIndexOf('/') + 1)))));
/** Division longue de la valeur v (≥ 0) : partie entière puis k chiffres ; rend { int, digits, rest }. */
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
/** v × D, exact (entier ou décimal) ; refuse un résultat qui n'est pas décimal fini. */
const OVER = (v, D) => { const x = q(v).mul(new Q(BigInt(D))); let k = 0; while ((x.n * 10n ** BigInt(k)) % x.d !== 0n) { k++; if (k > 12) throw new Error('non décimal'); } const val = (x.n * 10n ** BigInt(k)) / x.d; const s = val.toString().padStart(k + 1, '0'); return join(s.slice(0, s.length - k), k ? s.slice(-k) : ''); };
const FLOORQ = (v) => String(longDiv(v, 0).int);
const AMT = (total, f) => { const x = q(total).mul(q(f)); if (x.d !== 1n) throw new Error('montant non entier'); return String(x.n); };
const keyOf = (flags, what) => { const hits = flags.map((f, i) => (f ? i : -1)).filter((i) => i >= 0); if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`); return C('ABCDEF'[hits[0]]); };
const PICKV = (v, opts) => keyOf(opts.map((o) => EQV(o, v)), `PICKV ${v}`);
const exprOf = (str) => sum([...String(str).matchAll(/([+-]?)([\d./]+)/g)].map((m) => `${m[1]}${m[2]}`));
const MULTI = (v, opts) => ({ choiceIds: opts.map((o, i) => (exprOf(o).eq(q(v)) ? 'ABCDEF'[i] : null)).filter(Boolean) });
const BR = (v, k, opts) => keyOf(opts.map(([lo, hi]) => q(hi).sub(q(lo)).eq(new Q(1n, 10n ** BigInt(k))) && q(lo).lt(q(v)) && q(v).lt(q(hi))), `BR ${v}`);
const YN = (t) => C(t ? 'A' : 'B');

const L = 'ex-2am-jam-tarh-kusur';
const K = (lvl, n, qid) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${qid}`;

export const ORACLE = {
  [K(1, 1, 'q1')]: R(S("11/18", "+7/6")),
  [K(1, 1, 'q2')]: R(S("7/12", "+3/4")),
  [K(1, 1, 'q3')]: R(S("17/20", "-3/5")),
  [K(1, 2, 'q1')]: R(S("9/8", "+7/8")),
  [K(1, 2, 'q2')]: R(S("21/10", "-4/5")),
  [K(1, 2, 'q3')]: R(S("5/9", "+4/9", "+1/9")),
  [K(1, 3, 'q1')]: R(S("3/7", "+2/7")),
  [K(1, 3, 'q2')]: R(S("9/11", "-4/11")),
  [K(1, 3, 'q3')]: R(S("5/9", "+8/9")),
  [K(1, 3, 'q4')]: R(S("13/15", "-7/15")),
  [K(1, 4, 'q1')]: R(OVER(S("4.5/7", "+2.3/7"), 7)),
  [K(1, 4, 'q2')]: R(S("4.5/7", "+2.3/7")),
  [K(1, 4, 'q3')]: R(OVER(S("5.4/6", "-2.4/6"), 6)),
  [K(1, 4, 'q4')]: R(S("5.4/6", "-2.4/6")),
  [K(1, 4, 'q5')]: R(S("7.2/9", "+1.8/9")),
  [K(1, 5, 'q1')]: R(FAC("5/6", 18)),
  [K(1, 5, 'q2')]: R(NUM("5/6", 18)),
  [K(1, 5, 'q3')]: R(S("5/6", "+7/18")),
  [K(1, 6, 'q1')]: R(S("5/6", "-1/3")),
  [K(1, 6, 'q2')]: R(S("13/20", "-1/4")),
  [K(1, 6, 'q3')]: R(S("17/18", "-4/9")),
  [K(1, 7, 'q1')]: PICKV(S("3/8", "+1/4"), ["5/8","1/3","1/2"]),
  [K(1, 7, 'q2')]: PICKV(S("7/10", "-2/5"), ["1/3","3/10","1/2"]),
  [K(1, 7, 'q3')]: PICKV(S("5/12", "+1/6"), ["1/3","1/2","7/12"]),
  [K(1, 8, 'q1')]: R(S("2/9", "+4/9")),
  [K(1, 8, 'q2')]: R(S("4/9", "-2/9")),
  [K(1, 9, 'q1')]: R(S("2/5", "+3/10")),
  [K(1, 9, 'q2')]: R(S("5/9", "+7/18")),
  [K(1, 9, 'q3')]: R(S("3/16", "+1/4")),
  [K(1, 10, 'q1')]: R(S("9/14", "-2/7")),
  [K(1, 10, 'q2')]: R(S("3/4", "-5/12")),
  [K(1, 10, 'q3')]: R(S("11/15", "-1/3")),
  [K(2, 1, 'q1')]: R(S("5/9", "+7/18")),
  [K(2, 1, 'q2')]: R(S("9/14", "+3/7")),
  [K(2, 1, 'q3')]: R(S("55/12", "-7/12")),
  [K(2, 2, 'q1')]: R(S("5/12", "+1/4")),
  [K(2, 2, 'q3')]: YN(RED("5/12", "+1/4")),
  [K(2, 3, 'q1')]: R(S("9/20", "+3/5")),
  [K(2, 3, 'q2')]: YN(RED("9/20", "+3/5")),
  [K(2, 4, 'q1')]: R(S("1/2", "+1/8")),
  [K(2, 4, 'q2')]: R(S("1/2", "+3/4")),
  [K(2, 4, 'q3')]: R(S("3/8", "+1/8")),
  [K(2, 4, 'q4')]: R(S("3/8", "+3/4")),
  [K(2, 5, 'q1')]: R(S("3/4", "-1/8")),
  [K(2, 5, 'q2')]: R(S("3/4", "-1/2")),
  [K(2, 5, 'q3')]: R(S("7/8", "-1/8")),
  [K(2, 5, 'q4')]: R(S("7/8", "-1/2")),
  [K(2, 6, 'q1')]: YN(EQV("5/15", S("2/5", "+3/10"))),
  [K(2, 6, 'q2')]: R(S("2/5", "+3/10")),
  [K(2, 7, 'q1')]: PICKV(LCMD("3/4", "5/12"), ["4","16","12"]),
  [K(2, 7, 'q2')]: R(S("3/4", "+5/12")),
  [K(2, 8, 'q1')]: R(S("7/15", "+8/15")),
  [K(2, 8, 'q2')]: R(S("11/18", "+1/18")),
  [K(2, 8, 'q3')]: R(S("5/6", "+1/12")),
  [K(2, 8, 'q4')]: YN(RED("5/6", "+1/12")),
  [K(2, 9, 'q1')]: MULTI(S("9/4", "+3/12"), ["27/12+3/12","12/16","5/2","30/24"]),
  [K(2, 9, 'q2')]: R(S("9/4", "+3/12")),
  [K(2, 10, 'q1')]: R(S("3/4", "+5/8")),
  [K(2, 10, 'q2')]: R(S("3/4", "-5/8")),
  [K(3, 1, 'q1')]: R(S("13/9", "+5/9")),
  [K(3, 1, 'q2')]: R(S("17/12", "-5/6")),
  [K(3, 1, 'q3')]: R(S("3/5", "+7/20", "-1/10")),
  [K(3, 2, 'q1')]: R(S("5/6", "+5/12")),
  [K(3, 2, 'q2')]: R(S("5/6", "-5/12")),
  [K(3, 2, 'q3')]: R(S("5/6", "+5/12", "+5/12")),
  [K(3, 3, 'q1')]: R(S("1/2", "+1/4", "+1/8")),
  [K(3, 3, 'q2')]: R(S("2/3", "+1/6", "+1/12")),
  [K(3, 3, 'q3')]: R(S("11/12", "-1/6", "-1/12")),
  [K(3, 4, 'q1')]: R(S("2", "+5/6")),
  [K(3, 4, 'q2')]: R(S("3", "-3/8")),
  [K(3, 4, 'q3')]: R(S("11/4", "-2")),
  [K(3, 4, 'q4')]: R(S("9/5", "+1")),
  [K(3, 5, 'q1')]: PICKV(S("4", "+1/3"), ["5/3","13/3","4/3"]),
  [K(3, 5, 'q2')]: PICKV(S("7/2", "-1"), ["3","3/2","5/2"]),
  [K(3, 5, 'q3')]: PICKV(S("1", "+7/12"), ["19/12","2/3","7/12"]),
  [K(3, 6, 'q1')]: R(S("1/2", "+1/4")),
  [K(3, 6, 'q2')]: R(S("1/4", "+1/8")),
  [K(3, 6, 'q3')]: R(S("1/8", "+1/16")),
  [K(3, 6, 'q4')]: R(S("3/4", "+3/8")),
  [K(3, 6, 'q5')]: R(S("3/8", "+3/16")),
  [K(3, 6, 'q6')]: R(S("9/8", "+9/16")),
  [K(3, 7, 'q1')]: R(S("1/3", "+1/6")),
  [K(3, 7, 'q2')]: R(S("1/6", "+1/12")),
  [K(3, 7, 'q3')]: R(S("1/12", "+1/24")),
  [K(3, 7, 'q4')]: R(S("1/2", "+1/4")),
  [K(3, 7, 'q5')]: R(S("1/4", "+1/8")),
  [K(3, 7, 'q6')]: R(S("3/4", "+3/8")),
  [K(3, 8, 'q1')]: R(S("3/8", "+1/4")),
  [K(3, 8, 'q2')]: R(S("1", "-3/8", "-1/4")),
  [K(3, 8, 'q3')]: R(S("3/8", "+1/4", "+3/8")),
  [K(3, 9, 'q1')]: R(S("2", "+3/8", "+1", "+1/4")),
  [K(3, 9, 'q2')]: R(S("5", "-29/8")),
  [K(3, 10, 'q1')]: R(S("7/15", "+2/5")),
  [K(3, 10, 'q2')]: R(S("7/4", "-5/12")),
  [K(3, 10, 'q3')]: R(S("1/2", "+3/8", "+1/16")),
  [K(4, 1, 'q1')]: R(S("1/3", "+1/6")),
  [K(4, 1, 'q2')]: R(DEF(S("1/3", "+1/6"), 1)),
  [K(4, 1, 'q3')]: YN(EQV("0.5", S("1/3", "+1/6"))),
  [K(4, 2, 'q1')]: R(S("3/8", "+1/4")),
  [K(4, 2, 'q2')]: R(DEF(S("3/8", "+1/4"), 3)),
  [K(4, 2, 'q3')]: YN(EQV("0.62", S("3/8", "+1/4"))),
  [K(4, 3, 'q1')]: R(S("7/12", "+1/4")),
  [K(4, 3, 'q2')]: R(DEF(S("7/12", "+1/4"), 2)),
  [K(4, 3, 'q3')]: R(EXC(S("7/12", "+1/4"), 2)),
  [K(4, 4, 'q1')]: R(S("5/6", "+1/3")),
  [K(4, 4, 'q2')]: R(DEF(S("5/6", "+1/3"), 2)),
  [K(4, 4, 'q3')]: BR(S("5/6", "+1/3"), 2, [["1.16","1.17"],["1.17","1.18"],["1.15","1.16"],["1.66","1.67"]]),
  [K(4, 5, 'q1')]: R(S("3", "-7/12")),
  [K(4, 5, 'q2')]: R(DEF(S("3", "-7/12"), 2)),
  [K(4, 5, 'q3')]: R(EXC(S("3", "-7/12"), 2)),
  [K(4, 6, 'q1')]: R(S("9/10", "-1/5")),
  [K(4, 6, 'q2')]: R(DEF(S("9/10", "-1/5"), 1)),
  [K(4, 6, 'q3')]: R(OVER(S("9/10", "-1/5"), 100)),
  [K(4, 7, 'q1')]: R(S("11/12", "-1/6")),
  [K(4, 7, 'q2')]: R(DEF(S("11/12", "-1/6"), 2)),
  [K(4, 7, 'q3')]: R(OVER(S("11/12", "-1/6"), 100)),
  [K(4, 8, 'q1')]: R(S("4/9", "+5/18")),
  [K(4, 8, 'q2')]: R(DEF(S("4/9", "+5/18"), 2)),
  [K(4, 8, 'q3')]: R(EXC(S("4/9", "+5/18"), 2)),
  [K(4, 9, 'q1')]: R(S("1/2", "+1/4", "+1/8")),
  [K(4, 9, 'q2')]: R(DEF(S("1/2", "+1/4", "+1/8"), 3)),
  [K(4, 9, 'q3')]: BR(S("1/2", "+1/4", "+1/8"), 1, [["0.8","0.9"],["0.9","1"],["0.7","0.8"],["0.6","0.7"]]),
  [K(4, 10, 'q1')]: R(S("2", "+1/3")),
  [K(4, 10, 'q2')]: R(DEF(S("2", "+1/3"), 2)),
  [K(4, 10, 'q3')]: YN(EQV("2.33", S("2", "+1/3"))),
  [K(5, 1, 'q1')]: R(S("2/5", "+7/20")),
  [K(5, 1, 'q2')]: R(S("1", "-2/5", "-7/20")),
  [K(5, 1, 'q3')]: R(AMT("24000", "1/4")),
  [K(5, 1, 'q4')]: YN(GE("6000", "7000")),
  [K(5, 2, 'q1')]: R(S("5/12", "+7/24", "+1/6")),
  [K(5, 2, 'q2')]: R(S("1", "-5/12", "-7/24", "-1/6")),
  [K(5, 2, 'q3')]: R(AMT("216000", "7/24")),
  [K(5, 2, 'q4')]: R(AMT("216000", "1/8")),
  [K(5, 3, 'q1')]: R(S("6/20", "+3/10", "+1/5")),
  [K(5, 3, 'q2')]: R(S("1", "-6/20", "-3/10", "-1/5")),
  [K(5, 3, 'q3')]: R(NUM("1/5", 20)),
  [K(5, 3, 'q4')]: R(AMT("18000", "1/5")),
  [K(5, 4, 'q1')]: R(S("3/10", "+1/5", "+1/10")),
  [K(5, 4, 'q2')]: R(S("1", "-3/10", "-1/5", "-1/10")),
  [K(5, 4, 'q3')]: R(AMT("50000", "2/5")),
  [K(5, 5, 'q1')]: R(S("1/4", "+3/8")),
  [K(5, 5, 'q2')]: R(S("1", "-1/4", "-3/8")),
  [K(5, 5, 'q3')]: R(S("3/8", "+1/8")),
  [K(5, 5, 'q4')]: R(NUM("1/2", 16)),
  [K(5, 6, 'q1')]: R(S("1/6", "+5/12", "+1/12")),
  [K(5, 6, 'q2')]: R(S("1", "-1/6", "-5/12", "-1/12")),
  [K(5, 6, 'q3')]: R(NUM("1/3", 12)),
  [K(5, 7, 'q1')]: R(S("7/20", "+2/5")),
  [K(5, 7, 'q2')]: R(S("1", "-7/20", "-2/5")),
  [K(5, 7, 'q3')]: R(AMT("480", "1/4")),
  [K(5, 8, 'q1')]: R(S("2", "+3/8", "+1", "+1/4")),
  [K(5, 8, 'q2')]: R(FLOORQ(S("2", "+3/8", "+1", "+1/4"))),
  [K(5, 8, 'q3')]: R(S("5", "-29/8")),
  [K(5, 9, 'q1')]: R(S("3/8", "+1/4")),
  [K(5, 9, 'q2')]: R(S("1", "-3/8", "-1/4")),
  [K(5, 9, 'q3')]: YN(GE("5/8", "3/8")),
  [K(5, 10, 'q1')]: R(S("1/3", "+1/6")),
  [K(5, 10, 'q2')]: R(S("1", "-1/3", "-1/6")),
  [K(5, 10, 'q3')]: R(AMT("1200", "1/3")),
};

/* ── Audit du banc (appelé par practice-answer-oracle.test.mjs) : liste des problèmes (vide = conforme) ─────────────── */
const MISC_OK = /^MISC-JAMKASR-(ACROSS|NOSCALE|DENSUM|PART|NATURAL)$/;
const islands = (s) => [...String(s ?? '').matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const FR = /\\dfrac\{([0-9{},]+)\}\{([0-9]+)\}/g;
/** Valeur d'une expression « 3 + \dfrac{5}{6} - … » (littéraux seulement : naturels, décimaux, \dfrac) ; null si illisible. */
function evalLatex(expr) {
  let t = expr.replace(/^\s*[A-Za-z](\s*[+-]\s*[A-Za-z])?\s*=\s*/, '').replace(/\\left|\\right/g, '');
  t = t.replace(FR, (_, a, b) => `(${a.replace('{,}', '.')}/${b})`).replace(/\s+/g, '');
  if (!/^[0-9.()/+-]+$/.test(t)) return null;
  let i = 0;
  const atom = () => {
    if (t[i] === '(') { i++; const a = readNum(); i++; /* '/' */ const b = readNum(); i++; /* ')' */ return a.mul(new Q(b.d, b.n)); }
    return readNum();
  };
  const readNum = () => { let j = i; while (j < t.length && /[0-9.]/.test(t[j])) j++; const v = decQ(t.slice(i, j)); i = j; return v; };
  let acc = atom();
  while (i < t.length) { const op = t[i++]; const r = atom(); acc = op === '+' ? acc.add(r) : acc.sub(r); }
  return acc;
}
const related = (a, b) => a % b === 0n || b % a === 0n;
/** Dans un segment « sans = < > » qui contient + ou − : les dénominateurs de \dfrac sont deux à deux liés par divisibilité. */
function scopeProblems(latex) {
  const out = [];
  for (const seg of latex.split(/=|<|>|\\neq|\\le|\\ge/)) {
    if (!/[+-]/.test(seg.replace(/\\dfrac\{[^}]*\}\{[^}]*\}/g, 'X'))) continue;
    const ds = [...seg.matchAll(FR)].map((m) => BigInt(m[2]));
    for (const a of ds) for (const b of ds) if (!related(a, b)) out.push(`dénominateurs ${a} et ${b} : cas de 3AM dans « ${latex} »`);
  }
  return out;
}
export function audit(bank) {
  const problems = [];
  for (const { key, q: qu } of bank) {
    const texts = [qu.statement, qu.feedback?.correct, qu.feedback?.incorrect, ...(qu.solution?.lines ?? []), ...(qu.choices ?? []).map((c) => c.content), ...(qu.hints ?? []).map((h) => h.content)];
    for (const tx of texts) for (const isl of islands(tx)) for (const p of scopeProblems(isl)) problems.push(`${key} : ${p}`);
    const isl0 = islands(qu.statement);
    const withOp = isl0.find((x) => /[+-]/.test(x.replace(/\\dfrac\{[^}]*\}\{[^}]*\}/g, 'X')) && !/[a-z]/.test(x.replace(/\\dfrac|\\times|\\div|\\left|\\right|\\ldots/g, '').replace(/^\s*[A-Za-z](\s*[+-]\s*[A-Za-z])?\s*=\s*/, '')));
    const value = withOp ? evalLatex(withOp) : null;
    if (qu.answerType === 'rational') {
      const e = String(qu.expectedAnswer);
      if (/\//.test(e)) {
        const [a, b] = e.split('/'); if (gcd(BigInt(a), BigInt(b)) !== 1n) problems.push(`${key} : la clé ${e} n'est pas réduite`);
      }
      if (/^(احسب|تحقّق : احسب)/.test(qu.statement) && value && !value.eq(q(e))) problems.push(`${key} : l'expression « ${withOp} » vaut ${value} et non la clé ${e}`);
      for (const s of qu.misconceptionSignatures ?? []) {
        if (!MISC_OK.test(s.id)) problems.push(`${key} : signature ${s.id} hors MISC-JAMKASR-*`);
        if (q(s.value).eq(q(e))) problems.push(`${key} : la signature ${s.id} (${s.value}) est la bonne réponse`);
        // recalcul de l'erreur nommée sur les termes imprimés dans l'énoncé
        if (value && /^(احسب)/.test(qu.statement)) {
          const body = withOp.replace(/^\s*[A-Za-z](\s*[+-]\s*[A-Za-z])?\s*=\s*/, '');
          const parts = [...body.matchAll(/([+-]?)\s*(?:\\dfrac\{([0-9{},]+)\}\{([0-9]+)\}|([0-9]+))/g)].map((m) => ({ s: m[1] === '-' ? -1n : 1n, n: m[2] ? decQ(m[2].replace('{,}', '.')) : decQ(m[4]), d: m[3] ? BigInt(m[3]) : null }));
          const fr = parts.filter((p) => p.d !== null), nat = parts.filter((p) => p.d === null);
          let exp = null;
          if (s.id.endsWith('ACROSS') || s.id.endsWith('DENSUM')) exp = new Q(fr.reduce((a, p) => a + p.s * p.n.n, 0n), fr.reduce((a, p) => a + p.d, 0n));
          if (s.id.endsWith('NOSCALE')) exp = new Q(fr.reduce((a, p) => a + p.s * p.n.n, 0n), fr.reduce((m, p) => (p.d > m ? p.d : m), 0n));
          if (s.id.endsWith('NATURAL') && fr.length === 1 && nat.length === 1) { const f = fr[0], n = nat[0]; const first = body.trim().startsWith('\\dfrac'); const sg = parts[1].s; exp = new Q(first ? f.n.n + sg * n.n.n : n.n.n + sg * f.n.n, f.d); }
          if (exp && !exp.eq(q(s.value))) problems.push(`${key} : la signature ${s.id} vaut ${s.value}, l'erreur ${s.id.split('-').pop()} donne ${exp}`);
        }
      }
    } else if (qu.answerType === 'choice' || qu.answerType === 'multiChoice') {
      const good = qu.choices.filter((c) => c.isCorrect);
      if (qu.answerType === 'choice' && good.length !== 1) problems.push(`${key} : ${good.length} options justes`);
      if (value && /^(ما ناتج|ما قيمة|العدد)/.test(qu.statement) || (value && qu.answerType === 'choice' && /^ما/.test(qu.statement) && qu.choices.every((c) => islands(c.content).length === 1 && evalLatex(islands(c.content)[0]) !== null && !/</.test(c.content)))) {
        for (const c of qu.choices) { const iv = islands(c.content); if (iv.length !== 1) continue; const v = evalLatex(iv[0]); if (v === null) continue; if (v.eq(value) !== c.isCorrect) problems.push(`${key} : l'option ${c.id} (${iv[0]}) ${v.eq(value) ? 'vaut' : 'ne vaut pas'} ${value} mais isCorrect = ${c.isCorrect}`); }
      }
      for (const c of qu.choices) if (c.isCorrect && c.misconceptionId) problems.push(`${key} : option juste ${c.id} porte une misconception`);
    }
  }
  return problems;
}
