// Oracle du banc « hasil-qisma-kasr » (حاصل القسمة والكسر, 1AM, 2026-10-15) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الثاني », et « … الثالث » pour les feuilles calquées sur 1am-s3-37).
// Chaque clé est RECALCULÉE ICI avec des fractions exactes en BigInt, à partir des nombres de l'énoncé, jamais lue dans
// `expectedAnswer` : le quotient a/b est le NOMBRE qui, multiplié par b, donne a (b × x = a, vérifié par produit en croix),
// l'écriture décimale n'existe que si le dénominateur réduit n'a que les facteurs 2 et 5 (décidé en divisant, pas par une règle
// apprise), les valeurs approchées par défaut / par excès viennent du plancher / plafond de a·10^k / b.
//
// Outils : `ev` (une expression « 45/6*6 », « 5/(5/6) », « 7*5.42 » → fraction exacte, évaluée par pile — shunting-yard),
// `evDec` (son écriture décimale exacte, refusée si elle ne finit pas), `ap` (valeur approchée à 10^-k par défaut 'd' ou excès
// 'e'), `rnd` (arrondi à 10^-k, demi vers le haut), `qe` / `re` (quotient et reste euclidiens), `yn` (A = صحيح / نعم, B = خطأ / لا)
// avec `isDec`, `eq`, `gt`, `dvs` (les prédicats), `pickX` (le seul choix dont la valeur v vérifie « X*8=11 »), `pickPair`
// (« إذا ضُرب في b أعطى a »), `pickND` (le seul choix [n, d] qui vérifie un prédicat sur ses termes), `pickB` (le seul choix
// vrai d'une liste de booléens calculés). Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { R, C } from './helpers.mjs';

const B = (v) => BigInt(v);
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const mk = (n, d = 1n) => {
  n = B(n); d = B(d);
  if (d === 0n) throw new Error('dénominateur nul');
  if (d < 0n) { n = -n; d = -d; }
  const k = gcd(n, d) || 1n;
  return { n: n / k, d: d / k };
};
const lit = (s) => { const [i, f = ''] = s.replace(',', '.').split('.'); return mk(B(i + f), 10n ** B(f.length)); };
const OPS = { '+': [1, (x, y) => mk(x.n * y.d + y.n * x.d, x.d * y.d)], '-': [1, (x, y) => mk(x.n * y.d - y.n * x.d, x.d * y.d)], '*': [2, (x, y) => mk(x.n * y.n, x.d * y.d)], '/': [2, (x, y) => mk(x.n * y.d, x.d * y.n)] };
/** Expression arithmétique → fraction exacte (shunting-yard, nombres décimaux acceptés). */
const fev = (expr) => {
  const toks = String(expr).replace(/\s+/g, '').match(/\d+(?:[.,]\d+)?|[-+*/()]/g);
  if (!toks || toks.join('') !== String(expr).replace(/\s+/g, '')) throw new Error(`expression illisible : ${expr}`);
  const out = []; const ops = [];
  const apply = () => { const o = ops.pop(); const y = out.pop(); const x = out.pop(); out.push(OPS[o][1](x, y)); };
  for (const t of toks) {
    if (/^\d/.test(t)) out.push(lit(t));
    else if (t === '(') ops.push(t);
    else if (t === ')') { while (ops.at(-1) !== '(') apply(); ops.pop(); }
    else { while (ops.length && ops.at(-1) !== '(' && OPS[ops.at(-1)][0] >= OPS[t][0]) apply(); ops.push(t); }
  }
  while (ops.length) apply();
  if (out.length !== 1) throw new Error(`expression : ${expr}`);
  return out[0];
};
const key = (x) => R(x.d === 1n ? `${x.n}` : `${x.n}/${x.d}`);
/** La clé rationnelle (valeur exacte réduite) d'une expression. */
export const ev = (expr) => key(fev(expr));
const same = (x, y) => x.n * y.d === y.n * x.d;
/** Écriture décimale finie ? (le dénominateur réduit ne contient que 2 et 5) */
export const isDec = (expr) => { let q = fev(expr).d; for (const p of [2n, 5n]) while (q % p === 0n) q /= p; return q === 1n; };
const decOf = (x) => {
  let k = 0n; while ((10n ** k) % x.d !== 0n) { k++; if (k > 40n) throw new Error('pas décimal'); }
  const N = x.n * (10n ** k / x.d);
  if (k === 0n) return `${N}`;
  const s = `${N}`.padStart(Number(k) + 1, '0');
  return `${s.slice(0, -Number(k))},${s.slice(-Number(k))}`;
};
export const evDec = (expr) => { const x = fev(expr); if (!isDec(expr)) throw new Error(`${expr} n'est pas décimal`); return R(decOf(x)); };
/** Valeur approchée à 10^-k : 'd' par défaut (plancher), 'e' par excès (plafond). */
export const ap = (expr, k, dir) => {
  const x = fev(expr); const P = 10n ** B(k);
  const num = x.n * P; let q = num / x.d;
  if (dir === 'e' && q * x.d !== num) q += 1n;
  if (dir !== 'e' && dir !== 'd') throw new Error('dir');
  const s = `${q}`.padStart(k + 1, '0');
  return R(`${s.slice(0, -k)},${s.slice(-k)}`);
};
/** Arrondi à 10^-k (demi vers le haut). */
export const rnd = (expr, k) => {
  const x = fev(expr); const P = 10n ** B(k);
  const q = (2n * x.n * P + x.d) / (2n * x.d);
  if (k === 0) return R(`${q}`);
  return R(`${q / P},${`${q % P}`.padStart(k, '0')}`);
};
export const qe = (a, b) => R(`${B(a) / B(b)}`);
export const re = (a, b) => R(`${B(a) % B(b)}`);
export const eq = (a, b) => same(fev(a), fev(b));
export const gt = (a, b) => { const x = fev(a), y = fev(b); return x.n * y.d > y.n * x.d; };
export const dvs = (a, b) => B(a) % B(b) === 0n;
const yn = (t) => C(t ? 'A' : 'B');
const only = (hits, what) => {
  if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`);
  return C('ABCD'[hits[0]]);
};
/** Le seul v tel que « lhs = rhs » avec X := v (ex. « X*8=11 »). */
const pickX = (eqn, vals) => {
  const [l, r] = eqn.split('=');
  return only(vals.map((v, i) => (eq(l.replace(/X/g, `(${v})`), r) ? i : -1)).filter((i) => i >= 0), `pickX ${eqn}`);
};
/** Option [b, a] : « إذا ضُرب في b أعطى a » — la seule dont (x)·b = a. */
const pickPair = (x, opts) => only(opts.map(([b, a], i) => (eq(`(${x})*${b}`, `${a}`) ? i : -1)).filter((i) => i >= 0), `pickPair ${x}`);
const pickND = (pred, opts) => only(opts.map(([n, d], i) => (pred(n, d) ? i : -1)).filter((i) => i >= 0), 'pickND');
const pickB = (flags) => only(flags.map((b, i) => (b ? i : -1)).filter((i) => i >= 0), 'pickB');

const L = 'ex-1am-hasil-qisma-kasr';
const K = (lvl, n, qid) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${qid}`;

export const ORACLE = {
  // l1-001 — الكسر المناسب
  [K(1, 1, 'q1')]: pickX('X=5/12', ['5.12', '5/12', '12/5']),
  [K(1, 1, 'q2')]: pickX('X*7=12', ['7/12', '5', '12/7']),
  [K(1, 1, 'q3')]: pickX('X=9/4', ['9/4', '4/9', '9.4']),
  // l1-002 — اكتب العدد الناقص على شكل كسر
  [K(1, 2, 'q1')]: ev('8/5'),
  [K(1, 2, 'q2')]: ev('4/11'),
  [K(1, 2, 'q3')]: ev('1/7'),
  [K(1, 2, 'q4')]: ev('13/9'),
  // l1-003 — أتمّم المساويات
  [K(1, 3, 'q1')]: ev('14/9'),
  [K(1, 3, 'q2')]: ev('3/7*7'),
  [K(1, 3, 'q3')]: ev('5/12'),
  [K(1, 3, 'q4')]: ev('6/6'),
  // l1-004 — الجزء الملوّن
  [K(1, 4, 'q1')]: ev('7/12'),
  [K(1, 4, 'q2')]: ev('5/12'),
  [K(1, 4, 'q3')]: pickX('X=7/12', ['7/12', '12/7', '7/5']),
  // l1-005 — تقاسم الخبزات
  [K(1, 5, 'q1')]: ev('3/4'),
  [K(1, 5, 'q2')]: ev('2/5'),
  [K(1, 5, 'q3')]: ev('7/9'),
  [K(1, 5, 'q4')]: pickX('X=5/6', ['6/5', '5.6', '5/6']),
  // l1-006 — صحيح أو خطأ : حاصل القسمة عدد عشري
  [K(1, 6, 'q1')]: yn(isDec('7/4')),
  [K(1, 6, 'q2')]: yn(isDec('10/3')),
  [K(1, 6, 'q3')]: yn(eq('9/12', '12/9')),
  [K(1, 6, 'q4')]: yn(isDec('5/8')),
  // l1-007 — العدد الناقص على شكل كسر
  [K(1, 7, 'q1')]: ev('5/6'),
  [K(1, 7, 'q2')]: ev('3/8'),
  [K(1, 7, 'q3')]: ev('2/13'),
  // l1-008 — ما الذي يساويه الكسر ؟
  [K(1, 8, 'q1')]: pickX('X=13/6', ['6/13', '13.6', '2.16', '13/6']),
  [K(1, 8, 'q2')]: pickX('X=4/9', ['4/9', '9/4', '4.9']),
  [K(1, 8, 'q3')]: pickPair('8/3', [[3, 5], [3, 8], [8, 3]]),
  // l1-009 — هل هو ثلث ؟
  [K(1, 9, 'q1')]: yn(eq('1.5*1/(3*2)', '1/3')),
  [K(1, 9, 'q2')]: ev('1.5*1/(3*2)'),
  // l1-010 — صحيح أو خطأ في نادي الرياضيات
  [K(1, 10, 'q1')]: yn(eq('4/9*9', '4')),
  [K(1, 10, 'q2')]: yn(eq('4/9*4', '9')),
  [K(1, 10, 'q3')]: yn(eq('7/3', '7.3')),
  [K(1, 10, 'q4')]: yn(eq('5/8*8', '5')),
  // l2-001 — تقاسم الأرغفة
  [K(2, 1, 'q1')]: ev('4/7'),
  [K(2, 1, 'q2')]: ev('4/7*7'),
  // l2-002 — انقل وأتمم
  [K(2, 2, 'q1')]: ev('19/4*4'),
  [K(2, 2, 'q2')]: ev('4/7'),
  [K(2, 2, 'q3')]: ev('5'),
  // l2-003 — انقل وأتمم ثم احكم
  [K(2, 3, 'q1')]: ev('90/28'),
  [K(2, 3, 'q2')]: ev('31'),
  [K(2, 3, 'q3')]: yn(isDec('90/28')),
  // l2-004 — أكمل بما يناسب
  [K(2, 4, 'q1')]: ev('35/0.35'),
  [K(2, 4, 'q2')]: evDec('12/1200'),
  [K(2, 4, 'q3')]: ev('45/4.5'),
  // l2-005 — صحيح أو خطأ مع التبرير
  [K(2, 5, 'q1')]: yn(isDec('14/6')),
  [K(2, 5, 'q3')]: yn(isDec('15/4')),
  // l2-006 — من الكسر إلى العدد العشري
  [K(2, 6, 'q1')]: ev('9/4'),
  [K(2, 6, 'q2')]: evDec('9/4'),
  // l2-007 — الجزء الملوّن ثم العدد العشري
  [K(2, 7, 'q1')]: pickX('X=13/20', ['20/13', '13/20', '13/7']),
  [K(2, 7, 'q2')]: evDec('13/20'),
  [K(2, 7, 'q3')]: yn(eq('13/20', '3/4')),
  // l2-008 — مجموع الحصص
  [K(2, 8, 'q1')]: ev('5/7'),
  [K(2, 8, 'q2')]: ev('5/7*7'),
  // l2-009 — قماش وأمتار
  [K(2, 9, 'q1')]: yn(isDec('18/4')),
  [K(2, 9, 'q2')]: yn(isDec('18/7')),
  // l2-010 — العدد الناقص في كل حالة
  [K(2, 10, 'q1')]: ev('3/4'),
  [K(2, 10, 'q2')]: ev('6/5'),
  [K(2, 10, 'q3')]: evDec('0.8/8'),
  [K(2, 10, 'q4')]: ev('7/15*3'),
  [K(2, 10, 'q5')]: ev('4'),
  // l3-001 — صحيح أو خطأ مع التصحيح
  [K(3, 1, 'q1')]: yn(isDec('3/8')),
  [K(3, 1, 'q2')]: yn(isDec('5/6')),
  [K(3, 1, 'q3')]: yn(eq('9/4', '4/9')),
  [K(3, 1, 'q4')]: yn(eq('7/3', '2.33')),
  // l3-002 — انقل وأتمم
  [K(3, 2, 'q1')]: ev('23/5*5'),
  [K(3, 2, 'q2')]: ev('5/9'),
  [K(3, 2, 'q3')]: ev('11'),
  // l3-003 — انقل وأتمم
  [K(3, 3, 'q1')]: ev('105/42'),
  [K(3, 3, 'q2')]: ev('18'),
  [K(3, 3, 'q3')]: evDec('105/42'),
  // l3-004 — أكمل بما يناسب
  [K(3, 4, 'q1')]: ev('6/0.6'),
  [K(3, 4, 'q2')]: evDec('9/900'),
  [K(3, 4, 'q3')]: ev('125/0.125'),
  [K(3, 4, 'q4')]: evDec('7/8'),
  // l3-005 — أصحيح هذا أم خطأ ؟
  [K(3, 5, 'q1')]: yn(isDec('36/8')),
  [K(3, 5, 'q2')]: yn(isDec('25/6')),
  [K(3, 5, 'q3')]: yn(isDec('27/5')),
  [K(3, 5, 'q4')]: yn(isDec('17/12')),
  // l3-006 — توزيع أكياس الدقيق
  [K(3, 6, 'q1')]: ev('7/4'),
  [K(3, 6, 'q2')]: evDec('7/4'),
  [K(3, 6, 'q3')]: yn(isDec('7/3')),
  [K(3, 6, 'q4')]: ap('7/3', 1, 'd'),
  // l3-007 — قطع الشريط
  [K(3, 7, 'q1')]: ev('5/6'),
  [K(3, 7, 'q2')]: ev('5/6*6'),
  [K(3, 7, 'q3')]: ev('5/(5/6)'),
  // l3-008 — الجزء الملوّن وقيمته المقرّبة
  [K(3, 8, 'q1')]: ev('7/12'),
  [K(3, 8, 'q2')]: yn(isDec('7/12')),
  [K(3, 8, 'q3')]: ap('7/12', 2, 'd'),
  [K(3, 8, 'q4')]: ap('7/12', 2, 'e'),
  // l3-009 — اذكر الكسر المناسب
  [K(3, 9, 'q1')]: pickX('X*8=11', ['12/5', '3/4', '11/8', '8/11']),
  [K(3, 9, 'q2')]: pickX('X=12/5', ['5/12', '11/8', '9/9', '12/5']),
  [K(3, 9, 'q3')]: pickX('X=0.75', ['3/4', '5/12', '11/8', '8/11']),
  [K(3, 9, 'q4')]: pickX('X=1', ['12/5', '9/9', '11/8', '3/4']),
  [K(3, 9, 'q5')]: pickND((n) => n === 5, [[8, 11], [3, 4], [5, 12], [12, 5]]),
  [K(3, 9, 'q6')]: pickND((n, d) => d === 11, [[11, 8], [9, 9], [3, 4], [8, 11]]),
  // l3-010 — القيم المقرّبة لحاصل القسمة
  [K(3, 10, 'q1')]: ev('17/6'),
  [K(3, 10, 'q2')]: ap('17/6', 1, 'd'),
  [K(3, 10, 'q3')]: ap('17/6', 1, 'e'),
  [K(3, 10, 'q4')]: ap('17/6', 2, 'd'),
  [K(3, 10, 'q5')]: yn(eq('17/6', '2.83')),
  // l4-001 — العدد الناقص ثم الاختزال
  [K(4, 1, 'q1')]: ev('9/12'),
  [K(4, 1, 'q2')]: ev('7/10'),
  [K(4, 1, 'q3')]: ev('9/12'),
  [K(4, 1, 'q4')]: evDec('9/12'),
  // l4-002 — العدد الناقص وكسر من مبلغ
  [K(4, 2, 'q1')]: ev('29/6*6'),
  [K(4, 2, 'q2')]: ev('3/8'),
  [K(4, 2, 'q3')]: ev('4000*3/8'),
  // l4-003 — العدد الناقص والقيمة المقرّبة
  [K(4, 3, 'q1')]: ev('100/36'),
  [K(4, 3, 'q2')]: ev('20'),
  [K(4, 3, 'q3')]: ev('100/36'),
  [K(4, 3, 'q4')]: ap('100/36', 1, 'd'),
  // l4-004 — تقاسم مبلغ وحاصل القسمة
  [K(4, 4, 'q1')]: ev('8000*3/5'),
  [K(4, 4, 'q2')]: ev('8000*1/4'),
  [K(4, 4, 'q3')]: ev('8000-8000*3/5-8000/4'),
  [K(4, 4, 'q4')]: yn(isDec('30/8')),
  [K(4, 4, 'q5')]: yn(isDec('14/3')),
  // l4-005 — من العشري إلى الكسري والعكس
  [K(4, 5, 'q1')]: ev('27/10'),
  [K(4, 5, 'q2')]: evDec('876/1000'),
  [K(4, 5, 'q3')]: ev('18/0.18'),
  [K(4, 5, 'q4')]: evDec('14/1400'),
  // l4-006 — القيم المقرّبة والمدوّر
  [K(4, 6, 'q1')]: ev('13/6'),
  [K(4, 6, 'q2')]: ap('13/6', 1, 'd'),
  [K(4, 6, 'q3')]: ap('13/6', 1, 'e'),
  [K(4, 6, 'q4')]: rnd('13/6', 0),
  // l4-007 — توزيع الكتب على المكتبات
  [K(4, 7, 'q1')]: yn(dvs(215, 4)),
  [K(4, 7, 'q2')]: ev('215/4'),
  [K(4, 7, 'q3')]: evDec('215/4'),
  [K(4, 7, 'q4')]: yn(eq('215/4', '53')),
  // l4-008 — القسمة الإقليدية وحاصل القسمة
  [K(4, 8, 'q1')]: qe(47, 6),
  [K(4, 8, 'q2')]: re(47, 6),
  [K(4, 8, 'q3')]: ev('47/6'),
  [K(4, 8, 'q4')]: yn(eq('47/6', '7')),
  // l4-009 — هدية المعلّمة
  [K(4, 9, 'q1')]: ev('3500/3'),
  [K(4, 9, 'q2')]: yn(isDec('3500/3')),
  [K(4, 9, 'q3')]: ap('3500/3', 1, 'e'),
  [K(4, 9, 'q4')]: ev('3500/4'),
  // l4-010 — حديقة المدرسة
  [K(4, 10, 'q1')]: ev('5/9'),
  [K(4, 10, 'q2')]: yn(eq('5/9', '1/2')),
  [K(4, 10, 'q3')]: yn(isDec('5/9')),
  [K(4, 10, 'q4')]: ev('360*5/9'),
  // l5-001 — هدية عيد الأمهات
  [K(5, 1, 'q1')]: ev('2750/4'),
  [K(5, 1, 'q2')]: evDec('2750/4'),
  [K(5, 1, 'q3')]: ev('2750/4*4'),
  [K(5, 1, 'q4')]: ev('2750/3'),
  [K(5, 1, 'q5')]: yn(isDec('2750/3')),
  [K(5, 1, 'q6')]: ap('2750/3', 1, 'e'),
  [K(5, 1, 'q7')]: pickB([isDec('2750/4'), isDec('2750/3')]),
  // l5-002 — تقسيم قطعة أرض
  [K(5, 2, 'q1')]: ev('7/3'),
  [K(5, 2, 'q2')]: ev('7/3*3'),
  [K(5, 2, 'q3')]: ap('7/3', 1, 'd'),
  [K(5, 2, 'q4')]: ap('7/3', 1, 'e'),
  [K(5, 2, 'q5')]: ev('12000*7/3'),
  [K(5, 2, 'q6')]: pickX('X*3=7', ['2.3', '7/3', '2.33']),
  // l5-003 — مشروع التشجير
  [K(5, 3, 'q1')]: ev('45/6'),
  [K(5, 3, 'q2')]: evDec('45/6'),
  [K(5, 3, 'q3')]: ev('45/6*6'),
  [K(5, 3, 'q4')]: ev('45/7'),
  [K(5, 3, 'q5')]: ap('45/7', 2, 'd'),
  [K(5, 3, 'q6')]: ap('45/7', 2, 'e'),
  [K(5, 3, 'q7')]: pickB([isDec('45/6'), isDec('45/7')]),
  // l5-004 — تقاسم المبلغ بين ثلاثة أولاد
  [K(5, 4, 'q1')]: ev('7000/3'),
  [K(5, 4, 'q2')]: yn(isDec('7000/3')),
  [K(5, 4, 'q3')]: ap('7000/3', 1, 'e'),
  [K(5, 4, 'q4')]: ev('7000/3*3'),
  [K(5, 4, 'q5')]: yn(dvs(7002, 3)),
  [K(5, 4, 'q6')]: ev('7002/3'),
  // l5-005 — تعبئة قوارير الحليب
  [K(5, 5, 'q1')]: ev('5/6'),
  [K(5, 5, 'q2')]: ev('5/6*6'),
  [K(5, 5, 'q3')]: ev('5/6'),
  [K(5, 5, 'q4')]: yn(isDec('5/6')),
  [K(5, 5, 'q5')]: ap('5/6', 2, 'd'),
  [K(5, 5, 'q6')]: ap('5/6', 2, 'e'),
  [K(5, 5, 'q7')]: yn(eq('5/6', '0.83')),
  // l5-006 — لوحة الفسيفساء
  [K(5, 6, 'q1')]: ev('5/12'),
  [K(5, 6, 'q2')]: yn(isDec('5/12')),
  [K(5, 6, 'q3')]: ap('5/12', 2, 'd'),
  [K(5, 6, 'q4')]: ev('9/16'),
  [K(5, 6, 'q5')]: evDec('9/16'),
  [K(5, 6, 'q6')]: pickB([gt('9/16', '5/12'), gt('5/12', '9/16')]),
  // l5-007 — أنابيب الاختبار
  [K(5, 7, 'q1')]: ev('3/4'),
  [K(5, 7, 'q2')]: ev('2/3'),
  [K(5, 7, 'q3')]: ev('6/6'),
  [K(5, 7, 'q4')]: evDec('3/4'),
  [K(5, 7, 'q5')]: evDec('5/8'),
  [K(5, 7, 'q6')]: ap('2/3', 2, 'd'),
  [K(5, 7, 'q7')]: pickB([!isDec('2/3'), !isDec('6/6'), !isDec('5/8'), !isDec('3/4')]),
  // l5-008 — التحقّق من قسمة
  [K(5, 8, 'q1')]: ev('7*5.42'),
  [K(5, 8, 'q2')]: yn(eq('7*5.42', '38')),
  [K(5, 8, 'q3')]: ev('38/7'),
  [K(5, 8, 'q4')]: ev('38/7*7'),
  [K(5, 8, 'q5')]: ap('38/7', 2, 'd'),
  [K(5, 8, 'q6')]: ap('38/7', 2, 'e'),
  // l5-009 — مخبزة الحيّ
  [K(5, 9, 'q1')]: ev('9/8'),
  [K(5, 9, 'q2')]: evDec('9/8'),
  [K(5, 9, 'q3')]: ev('9/7'),
  [K(5, 9, 'q4')]: yn(isDec('9/7')),
  [K(5, 9, 'q5')]: ap('9/7', 2, 'd'),
  [K(5, 9, 'q6')]: ap('9/7', 2, 'e'),
  [K(5, 9, 'q7')]: pickB([isDec('9/8'), isDec('9/7')]),
  // l5-010 — حبل الفرق الرياضية
  [K(5, 10, 'q1')]: ev('11/6'),
  [K(5, 10, 'q2')]: ev('11/6*6'),
  [K(5, 10, 'q3')]: yn(isDec('11/6')),
  [K(5, 10, 'q4')]: ap('11/6', 1, 'd'),
  [K(5, 10, 'q5')]: ev('11/4'),
  [K(5, 10, 'q6')]: evDec('11/4'),
  [K(5, 10, 'q7')]: pickB([isDec('11/6'), isDec('11/4')]),
};
