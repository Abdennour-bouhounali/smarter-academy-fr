// Oracle du banc « ikhtizal-kitaba-kasriya » (الكتابات الكسرية لحاصل قسمة واختزال كسر, 1AM, 2026-10-14) — feuilles d'examen
// de فصل (« على منوال اختبار الفصل الثاني », et « … الثالث » pour les feuilles calquées sur 1am-s3-37/39/43/47).
// Chaque clé est RECALCULÉE ICI avec des fractions exactes en BigInt (produit en croix et pgcd d'Euclide), jamais lue
// dans `expectedAnswer`, jamais décidée par une règle de divisibilité. Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Outils : `fr`/`frD` (fraction exacte d'entiers ou d'une écriture décimale « 2,45 »), `eqf` (a/b = c/d ⇔ a·d = b·c),
// `miss` (le terme manquant de a/b = c/d, par produit en croix — doit être entier), `simp` (forme irréductible par le pgcd),
// `decOf` (écriture décimale exacte, refusée si le dénominateur réduit a un facteur autre que 2 et 5), `isDecFrac`,
// `num` (numérateur de x sur un dénominateur donné), `odd` / `pickEq` / `pickDec` / `commonDiv` / `biggest` (QCM : la
// seule option juste, sinon erreur), `yn` (A = صحيح / نعم, B = خطأ / لا). Les étapes `counted: false` d'autres leçons
// (somme, différence, quotient euclidien, fraction d'un nombre) sont recalculées de même.
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { R, C } from './helpers.mjs';

export const g = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const B = (v) => BigInt(v);
/** Fraction exacte réduite { n, d } (d > 0). */
export const fr = (n, d = 1) => {
  n = B(n); d = B(d);
  if (d === 0n) throw new Error('dénominateur nul');
  if (d < 0n) { n = -n; d = -d; }
  const k = g(n, d) || 1n;
  return { n: n / k, d: d / k };
};
/** Écriture décimale « 12,5 » → fraction exacte. */
export const frD = (s) => {
  const [i, f = ''] = String(s).replace('.', ',').split(',');
  return fr(B(i + f), 10n ** B(f.length));
};
const add = (x, y) => fr(x.n * y.d + y.n * x.d, x.d * y.d);
const sub = (x, y) => fr(x.n * y.d - y.n * x.d, x.d * y.d);
export const mul = (x, y) => fr(x.n * y.n, x.d * y.d);
const div = (x, y) => fr(x.n * y.d, x.d * y.n);
/** Égalité par produit en croix. */
export const eqF = (x, y) => x.n * y.d === y.n * x.d;
const eqf = (a, b, c, d) => B(a) * B(d) === B(b) * B(c);
const gt = (a, b, c, d) => B(a) * B(d) > B(c) * B(b);
const key = (x) => R(x.d === 1n ? `${x.n}` : `${x.n}/${x.d}`);
const int = (x, what) => { if (x.d !== 1n) throw new Error(`${what}: ${x.n}/${x.d} n'est pas entier`); return R(`${x.n}`); };
const yn = (t) => C(t ? 'A' : 'B');
const only = (hits, what) => {
  if (hits.length !== 1) throw new Error(`${what}: ${hits.length} options justes`);
  return C('ABCD'[hits[0]]);
};
const dv = (n, d) => B(n) % B(d) === 0n;

/** a/b = c/d, un terme `null` : le terme manquant par produit en croix (entier positif exigé). */
const miss = (a, b, c, d) => {
  const t = [a, b, c, d];
  if (t.filter((v) => v === null).length !== 1) throw new Error('miss: un seul terme manquant');
  const [A, Bb, Cc, D] = t.map((v) => (v === null ? null : B(v)));
  const x = a === null ? fr(Bb * Cc, D) : b === null ? fr(A * D, Cc) : c === null ? fr(A * D, Bb) : fr(Bb * Cc, A);
  if (x.n <= 0n) throw new Error('miss: terme non positif');
  return int(x, `miss(${t})`);
};
/** Forme irréductible : division par le pgcd, puis vérification que les termes sont premiers entre eux. */
const simp = (n, d) => {
  const x = fr(n, d);
  if (g(x.n, x.d) !== 1n) throw new Error('simp');
  return key(x);
};
const simpD = (s) => key(frD(s));
const simpQ = (s, t) => key(div(frD(s), frD(t)));
/** Une fraction réduite a-t-elle une écriture décimale finie (dénominateur 2^a·5^b) ? */
const isDecFrac = (n, d) => {
  let q = fr(n, d).d;
  for (const p of [2n, 5n]) while (q % p === 0n) q /= p;
  return q === 1n;
};
const decStr = (x) => {
  if (!isDecFrac(x.n, x.d)) throw new Error(`${x.n}/${x.d} n'est pas un nombre décimal`);
  let k = 0n; while ((10n ** k) % x.d !== 0n) k++;
  const N = x.n * (10n ** k / x.d);
  if (k === 0n) return `${N}`;
  const s = `${N}`.padStart(Number(k) + 1, '0');
  return `${s.slice(0, -Number(k))},${s.slice(-Number(k))}`;
};
const decOf = (n, d) => R(decStr(fr(n, d)));
const decQ = (s, t) => R(decStr(div(frD(s), frD(t))));
/** x = …/P : le numérateur (entier exigé). */
const num = (s, P) => int(mul(frD(s), fr(P)), `num ${s}/${P}`);
/** (s/t) = …/D : le numérateur ; et (s/t) = N/… : le dénominateur. */
const numOf = (s, t, D) => int(mul(div(frD(s), frD(t)), fr(D)), `numOf ${s}/${t}`);
const denOf = (s, N) => int(div(fr(N), frD(s)), `denOf ${s}`);
const denOfQ = (s, t, N) => int(div(fr(N), div(frD(s), frD(t))), `denOfQ ${s}/${t}`);
const eqDF = (s, a, b) => eqF(frD(s), fr(a, b));
/** n/d = (p×k)/(q×k) : k, le même pour les deux termes. */
const factor = (n, d, p, q) => {
  if (!dv(n, p) || !dv(d, q) || B(n) / B(p) !== B(d) / B(q)) throw new Error('factor');
  return R(`${B(n) / B(p)}`);
};
const commonK = factor;
const quot = (a, b) => { if (!dv(a, b)) throw new Error(`quot ${a}/${b}`); return R(`${B(a) / B(b)}`); };
const quotE = (a, b) => R(`${B(a) / B(b)}`);
const remOf = (a, b) => R(`${B(a) % B(b)}`);
const quotD = (s, t) => int(div(frD(s), frD(t)), `quotD ${s}/${t}`);
const sumD = (s, t) => R(decStr(add(frD(s), frD(t))));
const diffD = (s, t) => R(decStr(sub(frD(s), frD(t))));
const mulD = (s, k) => R(decStr(mul(frD(s), fr(k))));
const divD = (s, k) => R(decStr(div(frD(s), fr(k))));
const sumF = (a, b, c, d) => key(add(fr(a, b), fr(c, d)));
const diffF = (a, b, c, d) => key(sub(fr(a, b), fr(c, d)));
/** (a/b) de N, entier exigé (« أخذ كسر من عدد », étapes counted:false). */
const mulF = (N, a, b) => int(mul(fr(N), fr(a, b)), `mulF ${N}`);
const restF = (parts) => key(parts.reduce((acc, [a, b]) => sub(acc, fr(a, b)), fr(1)));
/** Les entiers n ∈ [lo, hi] qui divisent `x` existent-ils (91 : 7) ? */
const hasDivisor = (x, lo, hi) => { for (let k = lo; k <= hi; k++) if (dv(x, k)) return true; return false; };
/** Le plus grand chiffre c tel que `tpl` (□ = c) soit divisible par d (étape counted:false). */
const digitMax = (tpl, d) => {
  const ok = []; for (let c = 0; c <= 9; c++) if (dv(tpl.replace('□', String(c)), d)) ok.push(c);
  if (!ok.length) throw new Error('digitMax'); return R(`${Math.max(...ok)}`);
};
/** A = 5Δ2□ divisible par d1 et d2 : tous les nombres (integerSet). */
const allA = (d1, d2) => {
  const s = [];
  for (let h = 0; h <= 9; h++) for (let u = 0; u <= 9; u++) { const A = 5020 + 100 * h + u; if (dv(A, d1) && dv(A, d2)) s.push(A); }
  return R(s.join(', '));
};
/** QCM : l'option (fraction) égale à n/d. */
const pickEq = (n, d, opts) => only(opts.map(([a, b], i) => (eqf(n, d, a, b) ? i : -1)).filter((i) => i >= 0), `pickEq ${n}/${d}`);
const pickDec = (s, opts) => only(opts.map(([a, b], i) => (eqF(frD(s), fr(a, b)) ? i : -1)).filter((i) => i >= 0), `pickDec ${s}`);
/** QCM « le kasr intrus » : l'option dont la valeur n'est partagée par aucune autre fraction de la liste complète. */
const odd = (all, opts) => only(opts.map(([a, b], i) => (all.filter(([c, d]) => eqf(a, b, c, d)).length === 1 ? i : -1)).filter((i) => i >= 0), 'odd');
/** QCM : la seule option qui divise les deux termes. */
const commonDiv = (n, d, opts) => only(opts.map((k, i) => (dv(n, k) && dv(d, k) ? i : -1)).filter((i) => i >= 0), `commonDiv ${n}/${d}`);
/** Lettre de la plus grande fraction (comparaison par produit en croix ; unique exigé). */
const biggest = (opts) => {
  const best = opts.filter(([a, b]) => opts.every(([c, d]) => !gt(c, d, a, b)));
  if (best.length !== 1) throw new Error('biggest');
  return 'ABCD'[opts.indexOf(best[0])];
};

const L = 'ex-1am-ikhtizal-kitaba-kasriya';
const K = (lvl, n, qid) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${qid}`;

export const ORACLE = {
  // l1-001 — إتمام كتابات كسرية متساوية
  [K(1, 1, 'q1')]: miss(18, 32, null, 16),
  [K(1, 1, 'q2')]: miss(28, 20, 7, null),
  [K(1, 1, 'q3')]: miss(3, 8, 24, null),
  [K(1, 1, 'q4')]: miss(3, 7, null, 35),
  // l1-002 — على منوال اختبار الفصل الثاني — من العشري إلى الكسري والعكس
  [K(1, 2, 'q1')]: num('2,7', 10),
  [K(1, 2, 'q2')]: num('0,45', 100),
  [K(1, 2, 'q3')]: decOf(347, 1000),
  [K(1, 2, 'q4')]: decOf(5208, 100),
  // l1-003 — اختزال إلى أبسط شكل
  [K(1, 3, 'q1')]: simp(35, 25),
  [K(1, 3, 'q2')]: simp(63, 36),
  [K(1, 3, 'q3')]: simp(36, 28),
  [K(1, 3, 'q4')]: simp(75, 45),
  // l1-004 — على منوال اختبار الفصل الثاني — نفس الكسر بحدّين أكبر
  [K(1, 4, 'q1')]: miss(2, 3, null, 12),
  [K(1, 4, 'q2')]: miss(5, 4, 35, null),
  [K(1, 4, 'q3')]: miss(7, 9, null, 45),
  [K(1, 4, 'q4')]: miss(null, 6, 20, 24),
  // l1-005 — عدد عشري على شكل كسر أبسط
  [K(1, 5, 'q1')]: simpD('3,6'),
  [K(1, 5, 'q2')]: simpD('0,20'),
  [K(1, 5, 'q3')]: simpD('1,5'),
  [K(1, 5, 'q4')]: simpD('0,8'),
  // l1-006 — ما الذي يساوي 12/16؟
  [K(1, 6, 'q1')]: yn(eqDF('0,75', 12, 16)),
  [K(1, 6, 'q2')]: yn(eqf(12, 16, 24, 28)),
  [K(1, 6, 'q3')]: yn(eqf(12, 16, 6, 8)),
  [K(1, 6, 'q4')]: simp(12, 16),
  // l1-007 — من يساوي 4/5؟
  [K(1, 7, 'q1')]: yn(eqf(12, 20, 4, 5)),
  [K(1, 7, 'q2')]: yn(eqDF('0,8', 4, 5)),
  [K(1, 7, 'q3')]: yn(eqDF('4,5', 4, 5)),
  [K(1, 7, 'q4')]: yn(eqDF('1,25', 4, 5)),
  // l1-008 — أنقل وأتمم ثم اختزل
  [K(1, 8, 'q1')]: miss(24, 56, 3, null),
  [K(1, 8, 'q2')]: miss(25, 45, 5, null),
  [K(1, 8, 'q3')]: simp(32, 56),
  [K(1, 8, 'q4')]: simp(44, 33),
  [K(1, 8, 'q5')]: simp(21, 14),
  // l1-009 — أين أضع الفاصلة؟
  [K(1, 9, 'q1')]: decOf(235017, 1000),
  [K(1, 9, 'q2')]: decOf(235017, 100),
  [K(1, 9, 'q3')]: decOf(235017, 10000),
  // l1-010 — على منوال اختبار الفصل الثاني — صحيح أم خطأ؟
  [K(1, 10, 'q1')]: yn(eqDF('3,5', 3, 5)),
  [K(1, 10, 'q2')]: yn(eqDF('0,6', 3, 5)),
  [K(1, 10, 'q3')]: yn(eqf(3, 5, 4, 6)),
  [K(1, 10, 'q4')]: yn(eqf(3, 5, 9, 15)),
  // l2-001 — ثلاثة مستطيلات متماثلة
  [K(2, 1, 'q1')]: miss(3, 5, null, 10),
  [K(2, 1, 'q2')]: miss(3, 5, null, 20),
  [K(2, 1, 'q3')]: factor(12, 20, 3, 5),
  // l2-002 — الكسر الدخيل
  [K(2, 2, 'q1')]: simp(24, 40),
  [K(2, 2, 'q2')]: odd([[6, 10], [9, 15], [24, 40], [12, 20], [27, 35]], [[9, 15], [27, 35], [24, 40], [12, 20]]),
  // l2-003 — قاسم مشترك لا تكشفه القواعد
  [K(2, 3, 'q1')]: quot(414, 18),
  [K(2, 3, 'q2')]: quot(391, 17),
  // l2-004 — من على صواب: سامي أم فاطمة؟
  [K(2, 4, 'q1')]: C(hasDivisor(91, 2, 10) ? 'B' : 'A'),
  [K(2, 4, 'q2')]: quot(91, 7),
  [K(2, 4, 'q3')]: simp(91, 119),
  // l2-005 — على منوال اختبار الفصل الثاني — إلى كسر عشري دون قسمة
  [K(2, 5, 'q1')]: miss(7, 4, null, 100),
  [K(2, 5, 'q2')]: decOf(7, 4),
  [K(2, 5, 'q3')]: miss(3, 25, null, 100),
  [K(2, 5, 'q4')]: decOf(3, 25),
  [K(2, 5, 'q5')]: yn(isDecFrac(2, 3), 'نعم'),
  // l2-006 — حاصل قسمة عددين عشريين
  [K(2, 6, 'q1')]: numOf('2,1', '3,5', 35),
  [K(2, 6, 'q2')]: simp(21, 35),
  [K(2, 6, 'q3')]: miss(3, 5, null, 10),
  [K(2, 6, 'q4')]: decQ('2,1', '3,5'),
  // l2-007 — حواصل قسمة على شكل كسور
  [K(2, 7, 'q1')]: numOf('6,5', '2,5', 25),
  [K(2, 7, 'q2')]: simp(65, 25),
  [K(2, 7, 'q3')]: simpQ('5,6', '1,2'),
  [K(2, 7, 'q4')]: simpQ('3,2', '0,1'),
  // l2-008 — كتابات كسرية للعدد 0,6
  [K(2, 8, 'q1')]: num('0,6', 10),
  [K(2, 8, 'q2')]: numOf('0,6', '1', 5),
  [K(2, 8, 'q3')]: numOf('0,6', '1', 15),
  [K(2, 8, 'q4')]: denOf('0,6', 18),
  // l2-009 — اختزال كتابة كسرية خطوة بخطوة
  [K(2, 9, 'q1')]: commonDiv(54, 378, [7, 9, 4]),
  [K(2, 9, 'q2')]: miss(54, 378, 6, null),
  [K(2, 9, 'q3')]: simp(54, 378),
  // l2-010 — الكسر 44/24
  [K(2, 10, 'q1')]: miss(44, 24, 11, null),
  [K(2, 10, 'q2')]: yn(eqf(44, 24, 22, 12)),
  [K(2, 10, 'q3')]: yn(eqf(44, 24, 4, 2)),
  [K(2, 10, 'q4')]: simp(44, 24),
  // l3-001 — على منوال اختبار الفصل الثالث — إتمام واختزال
  [K(3, 1, 'q1')]: miss(15, 24, null, 8),
  [K(3, 1, 'q2')]: miss(7, 9, 42, null),
  [K(3, 1, 'q3')]: simp(30, 42),
  [K(3, 1, 'q4')]: simp(48, 72),
  // l3-002 — على منوال اختبار الفصل الثالث — ضع مكان النقط العدد المناسب
  [K(3, 2, 'q1')]: miss(21, 14, null, 2),
  [K(3, 2, 'q2')]: miss(5, null, 1, 2),
  [K(3, 2, 'q3')]: miss(75, 100, null, 4),
  [K(3, 2, 'q4')]: decOf(75, 100),
  // l3-003 — على منوال اختبار الفصل الثالث — لماذا تتساوى الكتابتان؟
  [K(3, 3, 'q1')]: denOfQ('4,8', '0,6', 48),
  [K(3, 3, 'q2')]: simpQ('4,8', '0,6'),
  [K(3, 3, 'q4')]: simp(370, 25),
  // l3-004 — على منوال اختبار الفصل الثالث — اختزل الكسور التالية
  [K(3, 4, 'q1')]: simp(200, 500),
  [K(3, 4, 'q2')]: simp(306, 30),
  [K(3, 4, 'q3')]: simp(91, 56),
  [K(3, 4, 'q4')]: simp(65, 35),
  // l3-005 — على منوال اختبار الفصل الثاني — صحيح أو خطأ مع التصحيح
  [K(3, 5, 'q1')]: yn(eqf(3, 4, 27, 36)),
  [K(3, 5, 'q2')]: yn(eqf(5, 6, 35, 48)),
  [K(3, 5, 'q3')]: miss(5, 6, 35, null),
  [K(3, 5, 'q4')]: yn(eqDF('0,7', 7, 100)),
  [K(3, 5, 'q5')]: num('0,7', 100),
  [K(3, 5, 'q6')]: yn(g(51n, 68n) === 1n),
  [K(3, 5, 'q7')]: simp(51, 68),
  // l3-006 — على منوال اختبار الفصل الثاني — أكمل ثم احسب واختزل
  [K(3, 6, 'q1')]: miss(3, 4, null, 100),
  [K(3, 6, 'q2')]: miss(15, 10, null, 100),
  [K(3, 6, 'q3')]: sumF(12, 100, 150, 100),
  [K(3, 6, 'q4')]: simp(162, 100),
  [K(3, 6, 'q5')]: decOf(162, 100),
  // l3-007 — على منوال اختبار الفصل الثاني — أحواض الحديقة
  [K(3, 7, 'q1')]: simp(27, 45),
  [K(3, 7, 'q2')]: pickEq(27, 45, [[25, 43], [9, 15], [27, 9]]),
  [K(3, 7, 'q3')]: miss(3, 5, null, 10),
  [K(3, 7, 'q4')]: decOf(27, 45),
  // l3-008 — على منوال اختبار الفصل الثاني — كسر عشري وكتابة عشرية
  [K(3, 8, 'q1')]: num('4,03', 100),
  [K(3, 8, 'q2')]: decOf(59, 1000),
  [K(3, 8, 'q3')]: simpD('12,5'),
  [K(3, 8, 'q4')]: pickDec('12,5', [[125, 100], [125, 10], [12, 5]]),
  // l3-009 — الاختزال بقواعد قابلية القسمة
  [K(3, 9, 'q1')]: miss(198, 495, 22, null),
  [K(3, 9, 'q2')]: simp(198, 495),
  [K(3, 9, 'q3')]: simp(135, 105),
  [K(3, 9, 'q4')]: simp(84, 63),
  // l3-010 — على منوال اختبار الفصل الثاني — كسر لا يشبه إخوته
  [K(3, 10, 'q1')]: simp(14, 21),
  [K(3, 10, 'q2')]: odd([[14, 21], [10, 15], [22, 33], [18, 24]], [[10, 15], [22, 33], [18, 24]]),
  [K(3, 10, 'q3')]: simp(18, 24),
  // l4-001 — على منوال اختبار الفصل الثاني — قابلية القسمة ثم الاختزال
  [K(4, 1, 'q1')]: yn(dv(2475, 9)),
  [K(4, 1, 'q2')]: yn(dv(3150, 4)),
  [K(4, 1, 'q3')]: miss(2475, 3150, 275, null),
  [K(4, 1, 'q4')]: simp(2475, 3150),
  // l4-002 — على منوال اختبار الفصل الثاني — كسر تخفي القواعد قاسمه
  [K(4, 2, 'q1')]: quot(391, 17),
  [K(4, 2, 'q2')]: remOf(437, 23),
  [K(4, 2, 'q3')]: yn(g(391n, 437n) === 1n),
  [K(4, 2, 'q4')]: simp(391, 437),
  // l4-003 — على منوال اختبار الفصل الثاني — احسب ثم اختزل
  [K(4, 3, 'q1')]: miss(37, 10, null, 100),
  [K(4, 3, 'q2')]: diffF(370, 100, 310, 100),
  [K(4, 3, 'q3')]: simp(60, 100),
  [K(4, 3, 'q4')]: decOf(60, 100),
  // l4-004 — على منوال اختبار الفصل الثاني — رقم مجهول ثم كسر
  [K(4, 4, 'q1')]: digitMax('7□2', 3),
  [K(4, 4, 'q2')]: miss(792, 1080, 88, null),
  [K(4, 4, 'q3')]: simp(792, 1080),
  [K(4, 4, 'q4')]: yn(isDecFrac(11, 15)),
  // l4-005 — على منوال اختبار الفصل الثالث — المجهولان ثم الكسر
  [K(4, 5, 'q1')]: diffD('75', '45'),
  [K(4, 5, 'q2')]: sumD('9,5', '2,5'),
  [K(4, 5, 'q3')]: simp(30, 12),
  [K(4, 5, 'q4')]: decOf(30, 12),
  // l4-006 — على منوال اختبار الفصل الثاني — حملة تنظيف الحيّ
  [K(4, 6, 'q1')]: simp(24, 36),
  [K(4, 6, 'q2')]: simp(30, 45),
  [K(4, 6, 'q3')]: C(eqf(24, 36, 30, 45) ? 'A' : '?'),
  [K(4, 6, 'q4')]: sumD('24', '30'),
  [K(4, 6, 'q5')]: simp(24 + 30, 36 + 45),
  // l4-007 — العدد 5Δ2□
  [K(4, 7, 'q1')]: allA(5, 9),
  [K(4, 7, 'q2')]: simp(5220, 5625),
  [K(4, 7, 'q3')]: miss(116, 125, null, 1000),
  [K(4, 7, 'q4')]: decOf(5220, 5625),
  // l4-008 — على منوال اختبار الفصل الثاني — صحيح أو خطأ: قواعد واختزال
  [K(4, 8, 'q1')]: yn(dv(126, 9)),
  [K(4, 8, 'q2')]: yn(dv(198, 4)),
  [K(4, 8, 'q3')]: yn(eqf(126, 198, 14, 22)),
  [K(4, 8, 'q4')]: simp(126, 198),
  // l4-009 — على منوال اختبار الفصل الثاني — كسور عشرية وضرب في 100
  [K(4, 9, 'q1')]: num('3,08', 100),
  [K(4, 9, 'q2')]: simp(308, 100),
  [K(4, 9, 'q3')]: decOf(4107, 1000),
  [K(4, 9, 'q4')]: quotD('35', '0,35'),
  // l4-010 — على منوال اختبار الفصل الثاني — مدّة حصّة الرياضة
  [K(4, 10, 'q1')]: quotE(135, 60),
  [K(4, 10, 'q2')]: simp(135, 60),
  [K(4, 10, 'q3')]: miss(9, 4, null, 100),
  [K(4, 10, 'q4')]: decOf(135, 60),
  // l5-001 — على منوال اختبار الفصل الثاني — هدية الجدّة
  [K(5, 1, 'q1')]: simp(6, 10),
  [K(5, 1, 'q2')]: simp(15, 25),
  [K(5, 1, 'q3')]: C(eqf(6, 10, 15, 25) ? 'B' : '?'),
  [K(5, 1, 'q4')]: decOf(15, 25),
  [K(5, 1, 'q5')]: mulF(450, 6, 10),
  [K(5, 1, 'q6')]: mulF(600, 15, 25),
  [K(5, 1, 'q7')]: diffD(650, 270 + 360),
  // l5-002 — هدية الجدّ لفاطمة
  [K(5, 2, 'q1')]: miss(28, 63, 4, null),
  [K(5, 2, 'q2')]: simp(28, 63),
  [K(5, 2, 'q3')]: C(eqf(4, 9, 28, 63) ? 'C' : '?'),
  [K(5, 2, 'q4')]: mulF(4500, 4, 9),
  [K(5, 2, 'q5')]: simp(500, 2000),
  [K(5, 2, 'q6')]: miss(1, 4, null, 100),
  [K(5, 2, 'q7')]: decOf(500, 2000),
  [K(5, 2, 'q8')]: yn(isDecFrac(4, 9)),
  // l5-003 — على منوال اختبار الفصل الثاني — تمويل الرحلة المدرسية
  [K(5, 3, 'q1')]: simp(8, 20),
  [K(5, 3, 'q2')]: simp(12, 40),
  [K(5, 3, 'q3')]: miss(2, 5, null, 10),
  [K(5, 3, 'q4')]: C(gt(8, 20, 12, 40) ? 'A' : '?'),
  [K(5, 3, 'q5')]: decOf(12, 40),
  [K(5, 3, 'q6')]: mulF(500, 8, 20),
  [K(5, 3, 'q7')]: mulF(800, 12, 40),
  [K(5, 3, 'q8')]: diffD(200 + 240, 420),
  // l5-004 — على منوال اختبار الفصل الثاني — عصير الإفطار الجماعي
  [K(5, 4, 'q1')]: miss(3, 4, null, 100),
  [K(5, 4, 'q2')]: decOf(3, 4),
  [K(5, 4, 'q3')]: miss(7, 20, null, 100),
  [K(5, 4, 'q4')]: decOf(7, 20),
  [K(5, 4, 'q5')]: simpD('1,5'),
  [K(5, 4, 'q6')]: mulD('0,75', 2),
  [K(5, 4, 'q7')]: C(eqF(mul(fr(3, 4), fr(2, 1)), fr(3, 2)) ? 'A' : '?'),
  // l5-005 — على منوال اختبار الفصل الثاني — جائزة التشجيع
  [K(5, 5, 'q1')]: simp(18, 24),
  [K(5, 5, 'q2')]: simp(27, 36),
  [K(5, 5, 'q3')]: simp(21, 30),
  [K(5, 5, 'q4')]: decOf(18, 24),
  [K(5, 5, 'q5')]: decOf(21, 30),
  [K(5, 5, 'q6')]: C(eqf(18, 24, 27, 36) && gt(18, 24, 21, 30) ? 'B' : '?'),
  // l5-006 — على منوال اختبار الفصل الثاني — شريط مكتبة القسم
  [K(5, 6, 'q1')]: simp(9, 24),
  [K(5, 6, 'q2')]: simp(6, 24),
  [K(5, 6, 'q3')]: miss(3, 8, null, 1000),
  [K(5, 6, 'q4')]: decOf(9, 24),
  [K(5, 6, 'q5')]: divD('2,4', 24),
  [K(5, 6, 'q6')]: mulD('0,1', 9),
  [K(5, 6, 'q7')]: C(eqF(mul(frD('2,4'), fr(9, 24)), frD('3,8')) ? 'A' : 'B'),
  // l5-007 — مثلّثان في مربّعين
  [K(5, 7, 'q1')]: simp(5, 16),
  [K(5, 7, 'q2')]: simp(6, 16),
  [K(5, 7, 'q3')]: miss(5, 16, null, 10000),
  [K(5, 7, 'q4')]: decOf(5, 16),
  [K(5, 7, 'q5')]: decOf(6, 16),
  [K(5, 7, 'q6')]: C(gt(6, 16, 5, 16) ? 'B' : 'A'),
  // l5-008 — الآلة الحاسبة تختزل
  [K(5, 8, 'q1')]: quot(52, 4),
  [K(5, 8, 'q2')]: commonK(52, 65, 4, 5),
  [K(5, 8, 'q3')]: quot(1921, 17),
  [K(5, 8, 'q5')]: decOf(52, 65),
  [K(5, 8, 'q6')]: yn(isDecFrac(1921, 791)),
  [K(5, 8, 'q7')]: simp(285, 684),
  // l5-009 — على منوال اختبار الفصل الثاني — رفّا القصص في المكتبة
  [K(5, 9, 'q1')]: simp(84, 126),
  [K(5, 9, 'q2')]: simp(45, 75),
  [K(5, 9, 'q3')]: miss(2, 3, null, 15),
  [K(5, 9, 'q4')]: miss(3, 5, null, 15),
  [K(5, 9, 'q5')]: C(gt(84, 126, 45, 75) ? 'A' : 'B'),
  [K(5, 9, 'q6')]: yn(isDecFrac(84, 126)),
  // l5-010 — على منوال اختبار الفصل الثاني — ترميم بيت العائلة
  [K(5, 10, 'q1')]: simp(12, 27),
  [K(5, 10, 'q2')]: simp(2, 18),
  [K(5, 10, 'q3')]: simp(10, 45),
  [K(5, 10, 'q4')]: C(biggest([[10, 45], [12, 27], [2, 18]])),
  [K(5, 10, 'q5')]: mulF(810000, 12, 27),
  [K(5, 10, 'q6')]: mulF(810000, 10, 45),
  [K(5, 10, 'q7')]: restF([[12, 27], [2, 18], [10, 45]]),
};
