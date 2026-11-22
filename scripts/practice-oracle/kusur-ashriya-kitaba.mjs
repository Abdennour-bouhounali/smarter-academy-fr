// Oracle du banc « kusur-ashriya-kitaba » (الكسور العشرية والكتابة العشرية, 1AM, 2026-10-15) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الأول », « … الثاني » pour la feuille calquée sur 1am-s2-64). Fusionné dans
// scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, à partir des nombres de l'énoncé, avec une arithmétique décimale EXACTE en BigInt
// (fractions réduites n/d) écrite dans ce fichier : jamais lue dans `expectedAnswer`, jamais tirée de packages/core
// ni de packages/core/arithmetic/decimals.js (le laboratoire). Un nombre décimal est lu comme chaîne (« 31,25 »),
// jamais comme flottant.
//
// Outils : `val` (évaluateur d'expressions + − * / ( ) sur des décimaux, résultat rationnel exact), `dec` (écriture
// décimale exacte à virgule, refusée si le rationnel n'est pas décimal), `intOf` (entier exigé), `numer(x, D)` (le numérateur
// de x sur D, entier exigé), `denOf(x, N)` (le dénominateur de x = N/…), `digitAt(x, p)` (le chiffre du rang 10^p),
// `count(x, u)` (le nombre d'unités 10^-u contenues entièrement dans x), `places(s)` (les chiffres après la virgule du TEXTE),
// `pow10(p)`, `remOf(a, b)`, `placed(chiffres, c, u)` (la virgule qui met le chiffre c au rang des 10^-u), `eq / lt / gt`
// (comparaison exacte), `pick` (QCM : une seule option vraie, sinon erreur), `yn` (A = صحيح, B = خطأ).
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { R, C } from './helpers.mjs';

const B = (v) => BigInt(v);
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const Q = (n, d = 1n) => { n = B(n); d = B(d); if (d === 0n) throw new Error('division par zéro'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const qadd = (x, y) => Q(x.n * y.d + y.n * x.d, x.d * y.d);
const qsub = (x, y) => Q(x.n * y.d - y.n * x.d, x.d * y.d);
const qmul = (x, y) => Q(x.n * y.n, x.d * y.d);
const qdiv = (x, y) => Q(x.n * y.d, x.d * y.n);
const qcmp = (x, y) => { const l = x.n * y.d; const r = y.n * x.d; return l < r ? -1 : l > r ? 1 : 0; };
/** « 31,25 » ou « 31.25 » → rationnel exact. */
const lit = (s) => { const [i, f = ''] = s.replace(',', '.').split('.'); return Q(B(i + f), 10n ** B(f.length)); };

/** Évaluateur : jetons puis algorithme à pile (priorités * / avant + -), parenthèses, moins unaire. */
export function val(expr) {
  const toks = String(expr).replace(/\s+/g, '').match(/\d+(?:[.,]\d+)?|[()+\-*/]/g);
  if (!toks || toks.join('') !== String(expr).replace(/\s+/g, '')) throw new Error(`expression illisible : ${expr}`);
  const out = []; const ops = []; const prec = { '+': 1, '-': 1, '*': 2, '/': 2, neg: 3 };
  let prev = null;
  for (const t of toks) {
    if (/^\d/.test(t)) { out.push(lit(t)); prev = 'n'; continue; }
    if (t === '(') { ops.push(t); prev = '('; continue; }
    if (t === ')') { while (ops.length && ops.at(-1) !== '(') out.push(ops.pop()); ops.pop(); prev = 'n'; continue; }
    const op = t === '-' && (prev === null || prev === '(' || prev === 'o') ? 'neg' : t;
    while (ops.length && ops.at(-1) !== '(' && prec[ops.at(-1)] >= prec[op] && op !== 'neg') out.push(ops.pop());
    ops.push(op); prev = 'o';
  }
  while (ops.length) out.push(ops.pop());
  const st = [];
  for (const t of out) {
    if (typeof t !== 'string') { st.push(t); continue; }
    if (t === 'neg') { const a = st.pop(); st.push(Q(-a.n, a.d)); continue; }
    const b = st.pop(); const a = st.pop();
    st.push(t === '+' ? qadd(a, b) : t === '-' ? qsub(a, b) : t === '*' ? qmul(a, b) : qdiv(a, b));
  }
  if (st.length !== 1) throw new Error(`expression mal formée : ${expr}`);
  return st[0];
}
const decText = (x) => {
  let d = x.d; for (const p of [2n, 5n]) while (d % p === 0n) d /= p;
  if (d !== 1n) throw new Error(`${x.n}/${x.d} n'est pas un nombre décimal`);
  let k = 0n; while ((10n ** k) % x.d !== 0n) k++;
  const neg = x.n < 0n; const N = (neg ? -x.n : x.n) * (10n ** k / x.d);
  if (k === 0n) return `${neg ? '-' : ''}${N}`;
  const s = `${N}`.padStart(Number(k) + 1, '0');
  return `${neg ? '-' : ''}${s.slice(0, -Number(k))},${s.slice(-Number(k))}`;
};
const dec = (expr) => R(decText(val(expr)));
const intOf = (expr) => { const x = val(expr); if (x.d !== 1n) throw new Error(`${expr} = ${x.n}/${x.d} n'est pas entier`); return R(`${x.n}`); };
const numer = (x, D) => intOf(`(${x})*${D}`);
const denOf = (x, N) => { const q = qdiv(Q(B(N)), val(x)); if (q.d !== 1n) throw new Error(`denOf ${x}`); return R(`${q.n}`); };
const floorQ = (x) => { const q = x.n / x.d; return x.n % x.d !== 0n && x.n < 0n ? q - 1n : q; };
const digitAt = (x, p) => {
  const scaled = qmul(val(x), Q(10n ** B(p < 0 ? -p : 0), 10n ** B(p > 0 ? p : 0)));
  const f = floorQ(scaled); return R(`${((f % 10n) + 10n) % 10n}`);
};
const count = (x, u) => R(`${floorQ(qmul(val(x), Q(10n ** B(u))))}`);
const places = (s) => R(`${(String(s).split(',')[1] ?? '').length}`);
const pow10 = (p) => R(decText(p >= 0 ? Q(10n ** B(p)) : Q(1n, 10n ** B(-p))));
const remOf = (a, b) => R(`${B(a) % B(b)}`);
/** La virgule qui met le chiffre c au rang 10^-u : on la place nous-mêmes dans la chaîne de chiffres, puis on relit la valeur. */
const placed = (digits, c, u) => {
  const idx = [...digits].map((ch, i) => (ch === String(c) ? i : -1)).filter((i) => i >= 0);
  if (idx.length !== 1) throw new Error('chiffre non unique');
  const cut = idx[0] - u + 1;
  const text = `${digits.slice(0, cut)},${digits.slice(cut)}`;
  // contrôle : le chiffre c est bien au rang u après la virgule
  if (text.split(',')[1][u - 1] !== String(c)) throw new Error('placed');
  return R(text);
};
const eq = (a, b) => qcmp(val(a), val(b)) === 0;
const lt = (a, b) => qcmp(val(a), val(b)) < 0;
const gt = (a, b) => qcmp(val(a), val(b)) > 0;
const yn = (t) => C(t ? 'A' : 'B');
const pick = (claims) => {
  const hits = claims.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) throw new Error(`QCM : ${hits.length} options justes (${claims.join(',')})`);
  return C('ABCDEF'[hits[0]]);
};

const L = 'ex-1am-kusur-ashriya-kitaba';
const K = (lvl, n, qid) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${qid}`;

export const ORACLE = {
  [K(1, 1, 'q1')]: intOf('7*100/10'),
  [K(1, 1, 'q2')]: digitAt('58/100', -1),
  [K(1, 1, 'q3')]: digitAt('417/100', 0),
  [K(1, 1, 'q4')]: intOf('2*1000/10'),
  [K(1, 2, 'q1')]: numer('4,8', 10),
  [K(1, 2, 'q2')]: dec('637/100'),
  [K(1, 2, 'q3')]: dec('36/0.36'),
  [K(1, 2, 'q4')]: dec('25/0.025'),
  [K(1, 3, 'q1')]: dec('9+4/10'),
  [K(1, 3, 'q2')]: dec('14+7/1000'),
  [K(1, 3, 'q3')]: dec('30+6/100'),
  [K(1, 3, 'q4')]: dec('7+3/100+5/1000'),
  [K(1, 4, 'q1')]: numer('27,38', 100),
  [K(1, 4, 'q2')]: numer('5,904', 1000),
  [K(1, 4, 'q3')]: numer('0,06', 100),
  [K(1, 4, 'q4')]: numer('8,05', 100),
  [K(1, 5, 'q1')]: dec('53/10'),
  [K(1, 5, 'q2')]: dec('417/100'),
  [K(1, 5, 'q3')]: dec('6039/1000'),
  [K(1, 5, 'q4')]: dec('9/100'),
  [K(1, 6, 'q1')]: dec('5,08*0.1'),
  [K(1, 6, 'q2')]: dec('3*0.01'),
  [K(1, 6, 'q3')]: pick([eq('12*100','0,12'), eq('12/100','0,12'), eq('12/0,01','0,12')]),
  [K(1, 6, 'q4')]: pick([eq('100*1000','0,1'), eq('100/1000','0,1'), eq('100/0,001','0,1')]),
  [K(1, 7, 'q1')]: dec('6,3*100'),
  [K(1, 7, 'q2')]: dec('0,045*1000'),
  [K(1, 7, 'q3')]: dec('5,2/10'),
  [K(1, 7, 'q4')]: dec('470/1000'),
  [K(1, 8, 'q1')]: intOf('3*10+4'),
  [K(1, 8, 'q2')]: intOf('6*10+0'),
  [K(1, 8, 'q3')]: intOf('60*10/100'),
  [K(1, 8, 'q4')]: digitAt('134/100', -1),
  [K(1, 9, 'q1')]: yn(eq('0,05','5/10')),
  [K(1, 9, 'q2')]: yn(eq('2,50','2,5')),
  [K(1, 9, 'q3')]: yn(eq('35,2','352/1000')),
  [K(1, 9, 'q4')]: yn(eq('0,7','10/7')),
  [K(1, 10, 'q1')]: remOf(59, 10),
  [K(1, 10, 'q2')]: remOf(317, 100),
  [K(1, 10, 'q3')]: remOf(4006, 1000),
  [K(1, 10, 'q4')]: remOf(1205, 1000),
  [K(2, 1, 'q1')]: intOf('2*10+5'),
  [K(2, 1, 'q2')]: intOf('25*1000/100'),
  [K(2, 1, 'q3')]: yn(eq('1','10/10') && eq('10/10','100/100')),
  [K(2, 2, 'q1')]: pick([eq('07,5','7,5'), eq('07,5','75'), eq('07,5','0,75'), eq('07,5','70,5')]),
  [K(2, 2, 'q2')]: pick([eq('340,40','34,04'), eq('340,40','3404'), eq('340,40','340,4'), eq('340,40','340,04')]),
  [K(2, 2, 'q3')]: pick([eq('34,090','34,9'), eq('34,090','34,09'), eq('34,090','3,409'), eq('34,090','340,9')]),
  [K(2, 3, 'q1')]: digitAt('23,42', 1),
  [K(2, 3, 'q2')]: digitAt('809,54', -1),
  [K(2, 3, 'q3')]: digitAt('76,023', -3),
  [K(2, 4, 'q1')]: pick([eq('5/100','0,05'), eq('5/10','0,05'), eq('5*0,1','0,05'), eq('5*100','0,05')]),
  [K(2, 4, 'q2')]: pick([eq('164503/1000','16,4503'), eq('164503/10000','16,4503'), eq('164503*10000','16,4503'), eq('164503/100','16,4503')]),
  [K(2, 4, 'q3')]: dec('15487/154.87'),
  [K(2, 5, 'q1')]: numer('18,06', 100),
  [K(2, 5, 'q2')]: denOf('7,939', 7939),
  [K(2, 5, 'q3')]: places('4,25'),
  [K(2, 6, 'q1')]: dec('12+0,07'),
  [K(2, 6, 'q2')]: dec('4+7*100+2*1000+3/10'),
  [K(2, 6, 'q3')]: dec('1+4*10+5*1000+7*0.1+2*0.001'),
  [K(2, 7, 'q1')]: dec('31,4*100'),
  [K(2, 7, 'q2')]: dec('4,25*10'),
  [K(2, 7, 'q3')]: dec('0,073*1000'),
  [K(2, 7, 'q4')]: dec('93,6/100'),
  [K(2, 8, 'q1')]: intOf('4*1000/10'),
  [K(2, 8, 'q2')]: digitAt('205/100', -1),
  [K(2, 8, 'q3')]: yn(eq('7/100','70/1000')),
  [K(2, 9, 'q1')]: count('109,83', 1),
  [K(2, 9, 'q2')]: placed('31795', 9, 2),
  [K(2, 9, 'q3')]: count('27,406', 2),
  [K(2, 10, 'q1')]: dec('4,183/418.3'),
  [K(2, 10, 'q2')]: dec('5207/100'),
  [K(2, 10, 'q3')]: dec('9*0.1'),
  [K(2, 10, 'q4')]: dec('640/0.64'),
  [K(3, 1, 'q1')]: dec('3086/100'),
  [K(3, 1, 'q2')]: pick([eq('5*100+6*10+2+4/10+5/1000','562,405'), eq('5*100+6*10+2+4/10+5/100','562,405'), eq('5*100+6*10+2+405/10','562,405'), eq('562+0,4+0,5','562,405')]),
  [K(3, 1, 'q3')]: dec('9+35/10'),
  [K(3, 1, 'q4')]: count('562,405', 3),
  [K(3, 2, 'q1')]: dec('6*100+2*10+5*0.01'),
  [K(3, 2, 'q2')]: dec('6*100+2*10+5'),
  [K(3, 2, 'q3')]: dec('6*100+2+5*0.1'),
  [K(3, 2, 'q4')]: intOf('(6*100+2*10+5*0,01)*100'),
  [K(3, 3, 'q1')]: numer('58,214', 1000),
  [K(3, 3, 'q2')]: dec('1837/100'),
  [K(3, 3, 'q3')]: dec('24+3/10+6/100'),
  [K(3, 3, 'q4')]: intOf('(7+5/10+2/1000)*1000'),
  [K(3, 4, 'q1')]: digitAt('3472,58', 1),
  [K(3, 4, 'q2')]: pick([digitAt('3472,58/10000', -3).value === '7', digitAt('3472,58/1000', -3).value === '7', digitAt('3472,58*10000', -3).value === '7', digitAt('3472,58/100', -3).value === '7']),
  [K(3, 4, 'q3')]: dec('3472,58/10000'),
  [K(3, 4, 'q4')]: dec('86,4/1000'),
  [K(3, 5, 'q1')]: count('304,56', 1),
  [K(3, 5, 'q2')]: placed('48206', 2, 2),
  [K(3, 5, 'q3')]: placed('90375', 7, 1),
  [K(3, 5, 'q4')]: count('15,208', 2),
  [K(3, 6, 'q1')]: numer('3/10+5/100', 100),
  [K(3, 6, 'q2')]: numer('7/10+2/1000', 1000),
  [K(3, 6, 'q3')]: numer('4/100+6/1000', 1000),
  [K(3, 6, 'q4')]: dec('3/10+5/100'),
  [K(3, 6, 'q5')]: dec('38+7/100'),
  [K(3, 7, 'q1')]: dec('418,26*100'),
  [K(3, 7, 'q2')]: dec('7204/1000'),
  [K(3, 7, 'q3')]: dec('35.2/3.52'),
  [K(3, 7, 'q4')]: dec('0,584/0.01'),
  [K(3, 7, 'q5')]: pow10(2),
  [K(3, 7, 'q6')]: dec('63+2/10+8/100+4/1000'),
  [K(3, 8, 'q1')]: numer('6,03', 100),
  [K(3, 8, 'q2')]: dec('4821/1000'),
  [K(3, 8, 'q3')]: numer('0,097', 1000),
  [K(3, 8, 'q4')]: dec('305/10'),
  [K(3, 8, 'q5')]: dec('81260/812.6'),
  [K(3, 8, 'q6')]: dec('356,5/0.01'),
  [K(3, 8, 'q7')]: pick([eq('4106,7*0,001','4,1067'), eq('4106,7/0,001','4,1067'), eq('4106,7*1000','4,1067')]),
  [K(3, 9, 'q1')]: numer('62,708', 1000),
  [K(3, 9, 'q2')]: numer('0,4', 10),
  [K(3, 9, 'q3')]: intOf('31*100'),
  [K(3, 9, 'q4')]: denOf('9,35', 935),
  [K(3, 10, 'q1')]: dec('0,073*100'),
  [K(3, 10, 'q2')]: dec('6,28*1000'),
  [K(3, 10, 'q3')]: dec('0,5/100'),
  [K(3, 10, 'q4')]: dec('18/10000'),
  [K(4, 1, 'q1')]: dec('4075/100'),
  [K(4, 1, 'q2')]: pick([lt('5,08','5,8'), gt('5,08','5,8'), eq('5,08','5,8')]),
  [K(4, 1, 'q3')]: pick([lt('0,630','0,63'), gt('0,630','0,63'), eq('0,630','0,63')]),
  [K(4, 1, 'q4')]: pick([lt('12+7/10','12,07'), gt('12+7/10','12,07'), eq('12+7/10','12,07')]),
  [K(4, 1, 'q5')]: digitAt('906,284', -3),
  [K(4, 2, 'q1')]: yn(digitAt('15,03', -1).value === '3'),
  [K(4, 2, 'q2')]: yn(eq('6*3,2','19,4')),
  [K(4, 2, 'q3')]: yn(eq('6,48*10','64,8')),
  [K(4, 2, 'q4')]: yn(eq('27,5','275/10')),
  [K(4, 3, 'q1')]: dec('7*100+4*10+6*0.01'),
  [K(4, 3, 'q2')]: dec('7*100+4+6*0.1'),
  [K(4, 3, 'q3')]: pick([lt('7*100+4*10+6','7*100+4*10+6*0,01') && lt('7*100+4*10+6*0,01','7*100+4+6*0,1'), lt('7*100+4*10+6*0,01','7*100+4+6*0,1') && lt('7*100+4+6*0,1','7*100+4*10+6'), lt('7*100+4+6*0,1','7*100+4*10+6*0,01') && lt('7*100+4*10+6*0,01','7*100+4*10+6'), lt('7*100+4+6*0,1','7*100+4*10+6') && lt('7*100+4*10+6','7*100+4*10+6*0,01')]),
  [K(4, 3, 'q4')]: intOf('(7*100+4*10+6*0,01)*100'),
  [K(4, 4, 'q1')]: dec('52,7*0.1'),
  [K(4, 4, 'q2')]: dec('250/2.5'),
  [K(4, 4, 'q3')]: dec('7260/72.6'),
  [K(4, 4, 'q4')]: pick([lt('9,4','9,39'), gt('9,4','9,39'), eq('9,4','9,39')]),
  [K(4, 4, 'q5')]: pick([lt('0,075','0,75'), gt('0,075','0,75'), eq('0,075','0,75')]),
  [K(4, 5, 'q1')]: dec('7,31*10'),
  [K(4, 5, 'q2')]: dec('264*0.01'),
  [K(4, 5, 'q3')]: dec('5,3/0.053'),
  [K(4, 5, 'q4')]: pick([lt('0,67','6,07') && lt('6,07','6,7') && lt('6,7','7,6'), lt('7,6','6,7') && lt('6,7','6,07') && lt('6,07','0,67'), lt('6,07','0,67') && lt('0,67','6,7') && lt('6,7','7,6'), lt('0,67','6,07') && lt('6,07','7,6') && lt('7,6','6,7')]),
  [K(4, 6, 'q1')]: pick([lt('3+5/100','3,005'), gt('3+5/100','3,005'), eq('3+5/100','3,005')]),
  [K(4, 6, 'q2')]: pick([lt('0,981','0,9810'), gt('0,981','0,9810'), eq('0,981','0,9810')]),
  [K(4, 6, 'q3')]: dec('52,3/0.01'),
  [K(4, 6, 'q4')]: pick([lt('52,3/0,01','5,23'), gt('52,3/0,01','5,23'), eq('52,3/0,01','5,23')]),
  [K(4, 6, 'q5')]: dec('57,65*0.1'),
  [K(4, 6, 'q6')]: pick([lt('57,65*0,1','7,565'), gt('57,65*0,1','7,565'), eq('57,65*0,1','7,565')]),
  [K(4, 7, 'q1')]: numer('37,52', 100),
  [K(4, 7, 'q2')]: digitAt('37,52', -2),
  [K(4, 7, 'q3')]: dec('8,35*100'),
  [K(4, 7, 'q4')]: dec('624/1000'),
  [K(4, 7, 'q5')]: dec('432,97*0.001'),
  [K(4, 7, 'q6')]: dec('872,9/0.01'),
  [K(4, 7, 'q7')]: pick([gt('13+6/100','13+6/10+9/1000') && gt('13+6/10+9/1000','13,63') && gt('13,63','1369/100'), gt('13,63','1369/100') && gt('1369/100','13+6/10+9/1000') && gt('13+6/10+9/1000','13+6/100'), gt('1369/100','13,63') && gt('13,63','13+6/100') && gt('13+6/100','13+6/10+9/1000'), gt('1369/100','13,63') && gt('13,63','13+6/10+9/1000') && gt('13+6/10+9/1000','13+6/100')]),
  [K(4, 8, 'q1')]: dec('12,5*100'),
  [K(4, 8, 'q2')]: dec('86,5/10'),
  [K(4, 8, 'q3')]: dec('2475/100'),
  [K(4, 8, 'q4')]: dec('1250+86,5'),
  [K(4, 9, 'q1')]: dec('4,25*1000'),
  [K(4, 9, 'q2')]: dec('4250/100'),
  [K(4, 9, 'q3')]: numer('42,5', 10),
  [K(4, 9, 'q4')]: dec('3*18,5'),
  [K(4, 10, 'q1')]: dec('4250/1000'),
  [K(4, 10, 'q2')]: dec('6,3*1000'),
  [K(4, 10, 'q3')]: dec('45/100'),
  [K(4, 10, 'q4')]: dec('2,5+0,85'),
  [K(5, 1, 'q1')]: dec('12,5*100'),
  [K(5, 1, 'q2')]: dec('85,5*10'),
  [K(5, 1, 'q3')]: dec('1875/100'),
  [K(5, 1, 'q4')]: dec('1250+855+18,75'),
  [K(5, 1, 'q5')]: dec('2500-2123,75'),
  [K(5, 1, 'q6')]: dec('3,25*100'),
  [K(5, 2, 'q1')]: dec('2,75*100'),
  [K(5, 2, 'q2')]: dec('36,5/10'),
  [K(5, 2, 'q3')]: dec('3275/1000'),
  [K(5, 2, 'q4')]: dec('275+36,5'),
  [K(5, 2, 'q5')]: dec('800-311,5'),
  [K(5, 2, 'q6')]: dec('2,75*1000'),
  [K(5, 3, 'q1')]: dec('4,8*100'),
  [K(5, 3, 'q2')]: dec('95/1000'),
  [K(5, 3, 'q3')]: dec('20+5/10+2/100'),
  [K(5, 3, 'q4')]: dec('480+20,52'),
  [K(5, 3, 'q5')]: dec('650-500,52'),
  [K(5, 3, 'q6')]: dec('1,35*100'),
  [K(5, 4, 'q1')]: dec('6,75*10'),
  [K(5, 4, 'q2')]: dec('6,75*100'),
  [K(5, 4, 'q3')]: numer('67,5', 10),
  [K(5, 4, 'q4')]: dec('675+120,5'),
  [K(5, 4, 'q5')]: dec('1000-795,5'),
  [K(5, 4, 'q6')]: dec('0,25*1000'),
  [K(5, 5, 'q1')]: dec('0,85*1000'),
  [K(5, 5, 'q2')]: dec('460/100'),
  [K(5, 5, 'q3')]: dec('5*0.01+3+8*0.1'),
  [K(5, 5, 'q4')]: dec('850+460'),
  [K(5, 5, 'q5')]: dec('1500-1310'),
  [K(5, 5, 'q6')]: dec('0,85*100'),
  [K(5, 6, 'q1')]: dec('0,35*100'),
  [K(5, 6, 'q2')]: dec('1,2*1000'),
  [K(5, 6, 'q3')]: dec('5075/100'),
  [K(5, 6, 'q4')]: dec('35+1200+50,75'),
  [K(5, 6, 'q5')]: dec('1500-1285,75'),
  [K(5, 6, 'q6')]: dec('4250/100'),
  [K(5, 7, 'q1')]: dec('12,5*1000'),
  [K(5, 7, 'q2')]: dec('8250/1000'),
  [K(5, 7, 'q3')]: numer('8,25', 100),
  [K(5, 7, 'q4')]: dec('12,5+8,25'),
  [K(5, 7, 'q5')]: dec('25-20,75'),
  [K(5, 7, 'q6')]: dec('4,25*1000'),
  [K(5, 8, 'q1')]: dec('7,5*100'),
  [K(5, 8, 'q2')]: dec('3600/100'),
  [K(5, 8, 'q3')]: dec('7305/100'),
  [K(5, 8, 'q4')]: dec('750+73,05'),
  [K(5, 8, 'q5')]: dec('1000-823,05'),
  [K(5, 8, 'q6')]: dec('7,5*10'),
  [K(5, 9, 'q1')]: dec('23,95*100'),
  [K(5, 9, 'q2')]: dec('175,5/10'),
  [K(5, 9, 'q3')]: count('23,95', 2),
  [K(5, 9, 'q4')]: dec('2395+17,55'),
  [K(5, 9, 'q5')]: dec('3000-2412,55'),
  [K(5, 9, 'q6')]: dec('23,95*0.1'),
  [K(5, 10, 'q1')]: dec('1,5*100'),
  [K(5, 10, 'q2')]: dec('2750/1000'),
  [K(5, 10, 'q3')]: dec('15+3/10+5/100'),
  [K(5, 10, 'q4')]: dec('150+15,35'),
  [K(5, 10, 'q5')]: dec('200-165,35'),
  [K(5, 10, 'q6')]: dec('2,75*10'),
};
