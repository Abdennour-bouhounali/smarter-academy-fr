// Oracle du banc « kasr-hasil-qisma » (الكسر: نسبة وحاصل قسمة وقيم مقرّبة, 2AM, 2026-10-28) — feuilles d'examen
// « على منوال اختبار الفصل الأول ». Chaque réponse est RECALCULÉE ici à partir des nombres de l'énoncé, avec la
// DIVISION LONGUE chiffre par chiffre de cet oracle (BigInt : on compte combien de fois le diviseur entre dans le reste,
// puis on abaisse un zéro), jamais lue dans `expectedAnswer` ni obtenue par la division entière du banc.
// Un décimal est un entier mis à l'échelle (13,05 = 1305 / 10²) ; jamais de flottant.
//
// Outils : `expand` (a ÷ b : chiffres de la partie entière et de k décimales + reste) ; `defVal` / `excVal`
// (valeur approchée à 10^-k par défaut / par excès : l'excès est le défaut + 1 unité de la rangée, et seulement si
// la division ne s'arrête pas avant) ; `exactQuot` (a ÷ b quand la division s'arrête, sinon erreur) ; `pow10Of`
// (puissance de 10 qui rend le DIVISEUR naturel) ; `numerOf` (le numérateur après cette multiplication) ;
// `brKey` (QCM de حصر « lo < a/b < hi » : il faut hi = lo + 10^-k ET b·lo < a < b·hi, STRICT) ;
// `qEqKey` (l'écriture x/y vaut a/b) ; `pairKey` (la fraction x/y est exactement [n, d]) ; `eqSym` (« = » ou « ≠ ») ;
// `sameVal` (n/d = v exactement ?) ; `decimalKey` (la fraction a une écriture décimale finie : ses seuls facteurs
// premiers du dénominateur réduit sont 2 et 5, trouvés par division successive).
// Les QCM sont écrits dans l'ordre de la feuille ; نعم / لا : A = نعم, B = لا. Les questions selfCheck n'ont pas de clé.
import { R, C } from './helpers.mjs';

const P10 = (k) => 10n ** BigInt(k);
/** « 13.05 » → { N: 1305n, k: 2 } (les virgules sont acceptées). */
const sc = (v) => { const s = String(v).replace(',', '.'); const [i, f = ''] = s.split('.'); return { N: BigInt(i + f), k: f.length }; };
/** a ÷ b = n / d avec n et d entiers (a = A/10^ka, b = B/10^kb ⇒ a/b = A·10^kb / (B·10^ka)). */
const nd = (a, b) => { const A = sc(a), B = sc(b); return { n: A.N * P10(B.k), d: B.N * P10(A.k) }; };
const gcdB = (x, y) => { while (y) [x, y] = [y, x % y]; return x; };
/** Division longue : partie entière (soustractions par blocs de d·10^j), puis k chiffres décimaux (reste × 10, on compte les soustractions). */
function expand(a, b, k) {
  const { n, d } = nd(a, b);
  if (d <= 0n || n < 0n) throw new Error(`division ${a} ÷ ${b} hors du programme`);
  let rest = n; let int = 0n; let block = 1n;
  while (d * block * 10n <= rest) block *= 10n;
  for (; block >= 1n; block /= 10n) while (rest >= d * block) { rest -= d * block; int += block; }
  let digits = '';
  for (let i = 0; i < k; i++) { rest *= 10n; let c = 0; while (rest >= d) { rest -= d; c++; } digits += String(c); }
  return { int, digits, rest };
}
/** « 7 » + « 05 » → '7.05' (zéros finaux retirés). */
const joinDec = (int, digits) => { const s = digits.replace(/0+$/, ''); return s ? `${int}.${s}` : String(int); };
const defVal = (a, b, k) => { const { int, digits } = expand(a, b, k); return joinDec(int, digits); };
const excVal = (a, b, k) => {
  const { int, digits, rest } = expand(a, b, k);
  if (rest === 0n) throw new Error(`${a}/${b} s'arrête à ${k} décimales : pas de valeur par excès distincte`);
  const N = BigInt(int.toString() + digits) + 1n; const s = N.toString().padStart(k + 1, '0');
  return joinDec(s.slice(0, s.length - k), k ? s.slice(-k) : '');
};
const exactQuot = (a, b) => {
  for (let k = 0; k <= 9; k++) { const { int, digits, rest } = expand(a, b, k); if (rest === 0n) return joinDec(int, digits); }
  throw new Error(`${a} ÷ ${b} ne s'arrête pas`);
};
const pow10Of = (b) => String(10n ** BigInt(sc(b).k));
const numerOf = (a, b) => { const A = sc(a); const k2 = A.k - sc(b).k; if (k2 <= 0) return String(A.N * P10(-k2)); const t = A.N.toString().padStart(k2 + 1, '0'); return joinDec(t.slice(0, -k2), t.slice(-k2)); };
const yn = (t) => C(t ? 'A' : 'B');
const LETTERS = 'ABCD';
const keyOf = (opts, test, what) => {
  const hits = opts.map((o, i) => (test(o) ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) throw new Error(`${what}: ${hits.length} options justes`);
  return C(LETTERS[hits[0]]);
};
/** Options [lo, hi] « lo < a/b < hi » à la rangée 10^-k : la seule vraie (hi = lo + 10^-k et b·lo < a < b·hi, STRICT). */
const brKey = (a, b, k, opts) => keyOf(opts, ([lo, hi]) => {
  const L = sc(lo), H = sc(hi), B = sc(b), A = sc(a);
  const kk = Math.max(L.k, H.k, k);
  const l = L.N * P10(kk - L.k), h = H.N * P10(kk - H.k);
  if (h - l !== P10(kk - k)) return false;
  // b·lo < a < b·hi, tout mis à la même échelle (kk + B.k)
  const s = kk + B.k; const al = A.N * P10(s - A.k);
  return B.N * l < al && al < B.N * h;
}, `brKey ${a}÷${b}@${k}`);
/** x/y = a/b exactement ? (produits en croix sur des entiers mis à l'échelle). */
const ratioEq = (x, y, a, b) => { const X = nd(x, y), Y = nd(a, b); return X.n * Y.d === Y.n * X.d; };
const isNat = (v) => sc(v).k === 0 || /^[0-9]+([.,]0+)?$/.test(String(v));
const qEqKey = (a, b, opts, denNatural) => keyOf(opts, ([x, y]) => ratioEq(x, y, a, b) && (!denNatural || isNat(y)), `qEqKey ${a}/${b}`);
const pairKey = ([n, d], opts) => keyOf(opts, ([x, y]) => ratioEq(x, '1', n, '1') && ratioEq(y, '1', d, '1'), `pairKey ${n}/${d}`);
const sameVal = (n, d, v) => ratioEq(n, d, v, '1');
const eqSym = (n, d, v) => C(sameVal(n, d, v) ? 'A' : 'B');
/** Le dénominateur réduit n'a que les facteurs 2 et 5 (division successive). */
const decimalKey = (opts) => keyOf(opts, ([n, d]) => {
  let D = BigInt(d) / gcdB(BigInt(n), BigInt(d));
  while (D % 2n === 0n) D /= 2n; while (D % 5n === 0n) D /= 5n;
  return D === 1n;
}, 'decimalKey');
/** b·lo < a < b·hi, STRICT. */
const inside = (a, b, lo, hi) => {
  const A = sc(a), B = sc(b), Lo = sc(lo), Hi = sc(hi);
  const k = Math.max(Lo.k, Hi.k); const s = k + B.k; const al = A.N * P10(s - A.k);
  return B.N * Lo.N * P10(k - Lo.k) < al && al < B.N * Hi.N * P10(k - Hi.k);
};
/** Classe d'un quotient n ÷ d : 'nat' (naturel), 'dec' (décimal non naturel), 'non' (division sans fin). */
const classOf = (n, d) => {
  const X = nd(n, d); let D = X.d / gcdB(X.n, X.d); const nat = D === 1n;
  while (D % 2n === 0n) D /= 2n; while (D % 5n === 0n) D /= 5n;
  return nat ? 'nat' : D === 1n ? 'dec' : 'non';
};
const classKey = (n, d, opts) => keyOf(opts, (c) => c === classOf(n, d), `classKey ${n}/${d}`);
/** « n/d » réduite en chaîne (pour les réponses en fraction). */
const ratioStr = (n, d) => { const g = gcdB(BigInt(n), BigInt(d)); return `${BigInt(n) / g}/${BigInt(d) / g}`; };
/** Nombre de récipients pour TOUT verser : le défaut à l'unité + 1 quand la division ne tombe pas juste. */
const needKey = (a, b, opts) => { const { int, rest } = expand(a, b, 0); const need = rest === 0n ? int : int + 1n; return keyOf(opts, ([x]) => BigInt(x) === need, `needKey ${a}/${b}`); };
/** c ≥ a/b (la contenance c suffit à la part a/b) : c·b ≥ a. */
const enough = (a, b, c) => { const A = sc(a), B = sc(b), Cc = sc(c); const s = B.k + Cc.k; return Cc.N * B.N * P10(Math.max(A.k, s) - s) >= A.N * P10(Math.max(A.k, s) - A.k); };
/** v < a/b ⇔ v·b < a. */
const lessQ = (v, a, b) => { const V = sc(v), B = sc(b), A = sc(a); const s = V.k + B.k; const m = Math.max(s, A.k); return V.N * B.N * P10(m - s) < A.N * P10(m - A.k); };
/** Options [v] : celle où lo < v < a/b. */
const betweenKey = (lo, a, b, opts) => keyOf(opts, ([v]) => lt(lo, v) && lessQ(v, a, b), `betweenKey ${lo}`);
/** Options [x] : le nombre de pièces ENTIÈRES = défaut à l'unité de a/b. */
const floorKey = (a, b, opts) => keyOf(opts, ([x]) => BigInt(x) === expand(a, b, 0).int, `floorKey ${a}/${b}`);
/** Options ['1'] / ['2'] : le nombre de rangées nécessaires (b1 ou b2) le plus petit. */
const needOf = (a, b) => { const { int, rest } = expand(a, b, 0); return rest === 0n ? int : int + 1n; };
const fewerKey = (a, b1, b2, opts) => keyOf(opts, ([x]) => (needOf(a, b2) < needOf(a, b1) ? x === '2' : x === '1'), `fewerKey ${a}`);
/** Options [x, y] (ou [x] avec y = 1) : celle qui vaut a/b. */
const valEq = (a, b, opts) => keyOf(opts.map((o) => (o === null ? ['0', '0'] : o)), ([x, y]) => y !== '0' && ratioEq(x, y, a, b), `valEq ${a}/${b}`);
const lt = (x, y) => { const X = sc(x), Y = sc(y); const k = Math.max(X.k, Y.k); return X.N * P10(k - X.k) < Y.N * P10(k - Y.k); };

const L = 'ex-2am-kasr-hasil-qisma';
const K = (lvl, n, qid) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${qid}`;

export const ORACLE = {
  [K(1, 1, 'q1')]: R(pow10Of("0.8")),
  [K(1, 1, 'q2')]: R(numerOf("13.05", "0.8")),
  [K(1, 1, 'q3')]: R(exactQuot("13.05", "0.8")),
  [K(1, 2, 'q1')]: qEqKey('1.34', '0.19', [["134","0.19"],["1.34","19"],["134","19"],["13.4","19"]], true),
  [K(1, 2, 'q2')]: R(defVal("1.34", "0.19", 2)),
  [K(1, 2, 'q3')]: R(excVal("1.34", "0.19", 2)),
  [K(1, 3, 'q1')]: pairKey(['9', '35'], [["35","9"],["9","26"],["26","35"],["9","35"]]),
  [K(1, 3, 'q2')]: R('35'),
  [K(1, 3, 'q3')]: pairKey(['4.5', '1.5'], [["1.5","4.5"],["4.5","1.5"],["4.5","6"],["6","4.5"]]),
  [K(1, 4, 'q1')]: eqSym('5', '4', '1.25'),
  [K(1, 4, 'q2')]: eqSym('2', '3', '0.67'),
  [K(1, 4, 'q3')]: eqSym('9', '8', '1.125'),
  [K(1, 4, 'q4')]: eqSym('4', '11', '0.36'),
  [K(1, 5, 'q1')]: R(pow10Of("0.45")),
  [K(1, 5, 'q2')]: R(numerOf("5.4", "0.45")),
  [K(1, 5, 'q3')]: qEqKey('5.4', '0.45', [["54","45"],["5.4","45"],["5400","45"],["540","45"]], true),
  [K(1, 6, 'q1')]: R(pow10Of("1.6")),
  [K(1, 6, 'q2')]: R(numerOf("48", "1.6")),
  [K(1, 6, 'q3')]: R(exactQuot("48", "1.6")),
  [K(1, 7, 'q1')]: R(exactQuot("5.5", "2.5")),
  [K(1, 7, 'q2')]: R(exactQuot("6.3", "0.7")),
  [K(1, 7, 'q3')]: R(exactQuot("2.4", "0.06")),
  [K(1, 8, 'q1')]: R(defVal("17", "6", 1)),
  [K(1, 8, 'q2')]: R(excVal("17", "6", 1)),
  [K(1, 8, 'q3')]: brKey("17", "6", 1, [["2.9","3"],["2.5","2.6"],["2.8","2.9"],["2.7","2.8"]]),
  [K(1, 9, 'q1')]: R(defVal("16", "9", 2)),
  [K(1, 9, 'q2')]: R(excVal("16", "9", 2)),
  [K(1, 9, 'q3')]: yn(sameVal('16', '9', '1.78')),
  [K(1, 10, 'q1')]: decimalKey([["7","6"],["11","3"],["5","9"],["13","8"]]),
  [K(1, 10, 'q2')]: R(exactQuot("13", "8")),
  [K(1, 10, 'q3')]: qEqKey('11', '3', [["3.66","1"],["11","3"],["3.7","1"],["3.67","1"]], false),
  [K(2, 1, 'q1')]: qEqKey('29.9', '10.6', [["299","10.6"],["29.9","106"],["299","106"],["2990","106"]], true),
  [K(2, 1, 'q2')]: R(defVal("29.9", "10.6", 3)),
  [K(2, 1, 'q3')]: R(excVal("29.9", "10.6", 1)),
  [K(2, 1, 'q4')]: R(excVal("29.9", "10.6", 3)),
  [K(2, 1, 'q5')]: brKey("29.9", "10.6", 0, [["3","4"],["1","2"],["2","3"],["4","5"]]),
  [K(2, 2, 'q1')]: R(defVal("25", "3", 1)),
  [K(2, 2, 'q2')]: R(excVal("25", "3", 1)),
  [K(2, 3, 'q1')]: R(defVal("23", "6", 2)),
  [K(2, 3, 'q2')]: R(excVal("23", "6", 2)),
  [K(2, 3, 'q3')]: yn(sameVal('23', '6', '3.84')),
  [K(2, 4, 'q1')]: yn(sameVal('8', '3', '2.67')),
  [K(2, 4, 'q2')]: yn(inside("8", "3", "2.66", "2.67")),
  [K(2, 5, 'q1')]: R(pow10Of("0.7")),
  [K(2, 5, 'q2')]: R(defVal("5.2", "0.7", 1)),
  [K(2, 5, 'q3')]: brKey("5.2", "0.7", 2, [["7.42","7.43"],["7.43","7.44"],["7.41","7.42"],["7.44","7.45"]]),
  [K(2, 6, 'q1')]: brKey("13", "7", 2, [["1.86","1.87"],["1.84","1.85"],["1.87","1.88"],["1.85","1.86"]]),
  [K(2, 6, 'q2')]: R(defVal("13", "7", 2)),
  [K(2, 7, 'q1')]: classKey('24', '6', ["dec","non","nat"]),
  [K(2, 7, 'q2')]: classKey('19', '8', ["dec","nat","non"]),
  [K(2, 7, 'q3')]: classKey('19', '6', ["nat","non","dec"]),
  [K(2, 8, 'q1')]: R(exactQuot('3', '4')),
  [K(2, 8, 'q2')]: R(exactQuot('9', '5')),
  [K(2, 8, 'q3')]: R(exactQuot('11', '4')),
  [K(2, 8, 'q4')]: R(exactQuot('7', '8')),
  [K(2, 9, 'q1')]: pairKey(['14', '40'], [["40","14"],["26","40"],["14","40"],["14","26"]]),
  [K(2, 9, 'q2')]: R(exactQuot('14', '40')),
  [K(2, 9, 'q3')]: R(exactQuot('9', '40')),
  [K(2, 10, 'q1')]: R(pow10Of("0.16")),
  [K(2, 10, 'q2')]: R(numerOf("9.6", "0.16")),
  [K(2, 10, 'q3')]: R(exactQuot("9.6", "0.16")),
  [K(3, 1, 'q1')]: R(defVal("68.9", "1.2", 2)),
  [K(3, 1, 'q2')]: R(defVal("68.9", "1.2", 0)),
  [K(3, 1, 'q3')]: R(excVal("68.9", "1.2", 0)),
  [K(3, 1, 'q4')]: R(defVal("68.9", "1.2", 1)),
  [K(3, 1, 'q5')]: R(excVal("68.9", "1.2", 1)),
  [K(3, 1, 'q6')]: brKey("68.9", "1.2", 1, [["57.4","57.5"],["57.5","57.6"],["57.3","57.4"],["57.6","57.7"]]),
  [K(3, 2, 'q1')]: R(numerOf("8.35", "0.8")),
  [K(3, 2, 'q2')]: R(exactQuot("8.35", "0.8")),
  [K(3, 2, 'q3')]: R(defVal("8.35", "0.8", 1)),
  [K(3, 2, 'q4')]: R(excVal("8.35", "0.8", 1)),
  [K(3, 2, 'q5')]: brKey("8.35", "0.8", 1, [["10.4","10.5"],["10.5","10.6"],["10.3","10.4"],["10.6","10.7"]]),
  [K(3, 3, 'q1')]: R(defVal("52.3", "1.3", 2)),
  [K(3, 3, 'q2')]: R(defVal("52.3", "1.3", 0)),
  [K(3, 3, 'q3')]: R(excVal("52.3", "1.3", 0)),
  [K(3, 3, 'q4')]: R(defVal("52.3", "1.3", 2)),
  [K(3, 3, 'q5')]: R(excVal("52.3", "1.3", 2)),
  [K(3, 3, 'q6')]: brKey("52.3", "1.3", 0, [["41","42"],["39","40"],["40","41"],["42","43"]]),
  [K(3, 4, 'q1')]: R(defVal("28.4", "0.6", 2)),
  [K(3, 4, 'q2')]: R(excVal("28.4", "0.6", 0)),
  [K(3, 4, 'q3')]: R(defVal("28.4", "0.6", 0)),
  [K(3, 4, 'q4')]: R(defVal("28.4", "0.6", 1)),
  [K(3, 4, 'q5')]: R(excVal("28.4", "0.6", 1)),
  [K(3, 4, 'q6')]: brKey("28.4", "0.6", 0, [["48","49"],["46","47"],["49","50"],["47","48"]]),
  [K(3, 5, 'q1')]: R(exactQuot("441.6", "2.3")),
  [K(3, 5, 'q2')]: R(exactQuot("44.16", "0.23")),
  [K(3, 5, 'q3')]: R(exactQuot("4416", "0.23")),
  [K(3, 5, 'q4')]: R(exactQuot("44.16", "2.3")),
  [K(3, 6, 'q1')]: R(ratioStr(5, 12)),
  [K(3, 6, 'q2')]: R(ratioStr(5, 12 - 5)),
  [K(3, 6, 'q3')]: R(ratioStr(12, 12 - 5)),
  [K(3, 7, 'q1')]: R(pow10Of("0.7")),
  [K(3, 7, 'q2')]: R(defVal("9.4", "0.7", 1)),
  [K(3, 7, 'q3')]: R(excVal("9.4", "0.7", 1)),
  [K(3, 7, 'q4')]: R(defVal("9.4", "0.7", 2)),
  [K(3, 7, 'q5')]: R(excVal("9.4", "0.7", 2)),
  [K(3, 8, 'q1')]: brKey("31", "7", 1, [["4.5","4.6"],["4.3","4.4"],["4.4","4.5"],["4.6","4.7"]]),
  [K(3, 8, 'q2')]: brKey("31", "7", 2, [["4.43","4.44"],["4.41","4.42"],["4.44","4.45"],["4.42","4.43"]]),
  [K(3, 9, 'q1')]: pairKey(['7', '9'], [["9","7"],["2","9"],["7","2"],["7","9"]]),
  [K(3, 9, 'q2')]: R(defVal("7", "9", 2)),
  [K(3, 9, 'q3')]: yn(sameVal('7', '9', '0.77')),
  [K(3, 10, 'q1')]: qEqKey('2.5', '0.6', [["2.5","6"],["25","6"],["25","60"],["250","6"]], true),
  [K(3, 10, 'q2')]: R(defVal("2.5", "0.6", 2)),
  [K(3, 10, 'q3')]: R(excVal("2.5", "0.6", 2)),
  [K(4, 1, 'q1')]: R(String(expand('263', '14', 0).int)),
  [K(4, 1, 'q2')]: R(String(expand('263', '14', 0).rest)),
  [K(4, 1, 'q3')]: R(defVal("263", "14", 3)),
  [K(4, 1, 'q4')]: R(defVal("263", "14", 1)),
  [K(4, 1, 'q5')]: R(excVal("263", "14", 1)),
  [K(4, 1, 'q6')]: R(defVal("263", "14", 2)),
  [K(4, 1, 'q7')]: R(excVal("263", "14", 2)),
  [K(4, 2, 'q1')]: R(String(expand('92', '13', 0).int)),
  [K(4, 2, 'q2')]: R(String(expand('92', '13', 0).rest)),
  [K(4, 2, 'q3')]: R(defVal("92", "13", 3)),
  [K(4, 2, 'q4')]: R(excVal("92", "13", 3)),
  [K(4, 2, 'q5')]: brKey("92", "13", 3, [["7.077","7.078"],["7.076","7.077"],["7.075","7.076"],["7.078","7.079"]]),
  [K(4, 3, 'q1')]: R(String(expand('347', '12', 0).int)),
  [K(4, 3, 'q2')]: R(String(expand('347', '12', 0).rest)),
  [K(4, 3, 'q3')]: R(defVal("347", "12", 3)),
  [K(4, 3, 'q4')]: R(defVal("347", "12", 1)),
  [K(4, 3, 'q5')]: R(excVal("347", "12", 1)),
  [K(4, 3, 'q6')]: yn(sameVal('347', '12', '28.92')),
  [K(4, 4, 'q1')]: R(pow10Of("0.9")),
  [K(4, 4, 'q2')]: R(String(expand('173', '9', 0).int)),
  [K(4, 4, 'q3')]: R(String(expand('173', '9', 0).rest)),
  [K(4, 4, 'q4')]: R(defVal("17.3", "0.9", 2)),
  [K(4, 4, 'q5')]: R(excVal("17.3", "0.9", 2)),
  [K(4, 5, 'q1')]: R(pow10Of("0.9")),
  [K(4, 5, 'q2')]: R(String(expand('2500', '9', 0).int)),
  [K(4, 5, 'q3')]: R(defVal("250", "0.9", 1)),
  [K(4, 5, 'q4')]: R(excVal("250", "0.9", 1)),
  [K(4, 5, 'q5')]: needKey('250', '0.9', [["278"],["277"],["279"],["250"]]),
  [K(4, 6, 'q1')]: R(pow10Of("0.9")),
  [K(4, 6, 'q2')]: R(defVal("7", "0.9", 1)),
  [K(4, 6, 'q3')]: R(excVal("7", "0.9", 1)),
  [K(4, 6, 'q4')]: yn(inside('7', '0.9', '7.7', '7.8')),
  [K(4, 7, 'q1')]: pairKey(['13', '30'], [["30","13"],["13","17"],["13","30"],["17","30"]]),
  [K(4, 7, 'q2')]: R(defVal("13", "30", 2)),
  [K(4, 7, 'q3')]: R(excVal("13", "30", 2)),
  [K(4, 7, 'q4')]: brKey("13", "30", 3, [["0.434","0.435"],["0.433","0.434"],["0.432","0.433"],["0.435","0.436"]]),
  [K(4, 8, 'q1')]: R(String(expand('237', '7', 0).int)),
  [K(4, 8, 'q2')]: R(defVal("23.7", "7", 3)),
  [K(4, 8, 'q3')]: R(defVal("23.7", "7", 2)),
  [K(4, 8, 'q4')]: R(excVal("23.7", "7", 2)),
  [K(4, 9, 'q1')]: yn(inside("19", "6", "3.16", "3.17")),
  [K(4, 9, 'q2')]: yn(inside("19", "6", "3.17", "3.18")),
  [K(4, 9, 'q3')]: yn(inside("19", "6", "3.1", "3.2")),
  [K(4, 10, 'q1')]: R(pow10Of("0.7")),
  [K(4, 10, 'q2')]: R(defVal("0.2", "0.7", 3)),
  [K(4, 10, 'q3')]: R(excVal("0.2", "0.7", 3)),
  [K(4, 10, 'q4')]: brKey("0.2", "0.7", 2, [["0.29","0.3"],["0.28","0.29"],["0.27","0.28"],["0.3","0.31"]]),
  [K(5, 1, 'q1')]: R(exactQuot("27.34", "4")),
  [K(5, 1, 'q2')]: R(defVal("27.34", "4", 0)),
  [K(5, 1, 'q3')]: R(excVal("27.34", "4", 0)),
  [K(5, 1, 'q4')]: R(defVal("27.34", "4", 2)),
  [K(5, 1, 'q5')]: R(excVal("27.34", "4", 2)),
  [K(5, 1, 'q6')]: needKey('27.34', '4', [["6"],["27"],["7"],["8"]]),
  [K(5, 1, 'q7')]: yn(7 * 3500 <= 25000),
  [K(5, 2, 'q1')]: R(defVal("45", "7", 2)),
  [K(5, 2, 'q2')]: R(excVal("45", "7", 2)),
  [K(5, 2, 'q3')]: yn(enough('45', '7', '6.4')),
  [K(5, 2, 'q4')]: R(excVal("45", "7", 1)),
  [K(5, 3, 'q1')]: R(pow10Of("2.2")),
  [K(5, 3, 'q2')]: R(defVal("40", "2.2", 1)),
  [K(5, 3, 'q3')]: R(excVal("40", "2.2", 1)),
  [K(5, 3, 'q4')]: yn(sameVal('40', '2.2', '18.2')),
  [K(5, 3, 'q5')]: yn(inside("40", "2.2", "18.1", "18.2")),
  [K(5, 4, 'q1')]: R(pow10Of("0.7")),
  [K(5, 4, 'q2')]: R(String(expand('6000', '7', 0).int)),
  [K(5, 4, 'q3')]: R(defVal("600", "0.7", 1)),
  [K(5, 4, 'q4')]: R(excVal("600", "0.7", 1)),
  [K(5, 4, 'q5')]: needKey('600', '0.7', [["858"],["857"],["859"],["600"]]),
  [K(5, 5, 'q1')]: pairKey(['11', '18'], [["18","11"],["11","18"],["11","7"],["7","18"]]),
  [K(5, 5, 'q2')]: R(defVal("11", "18", 2)),
  [K(5, 5, 'q3')]: R(excVal("11", "18", 2)),
  [K(5, 5, 'q4')]: yn(sameVal('11', '18', '0.61')),
  [K(5, 6, 'q1')]: R(pow10Of("0.45")),
  [K(5, 6, 'q2')]: R(numerOf("11.6", "0.45")),
  [K(5, 6, 'q3')]: R(defVal("11.6", "0.45", 1)),
  [K(5, 6, 'q4')]: R(excVal("11.6", "0.45", 1)),
  [K(5, 6, 'q5')]: floorKey('11.6', '0.45', [["26"],["30"],["25"],["24"]]),
  [K(5, 6, 'q6')]: yn(30 * 45 <= 1160),
  [K(5, 7, 'q1')]: R(pow10Of("0.35")),
  [K(5, 7, 'q2')]: R(defVal("7.2", "0.35", 2)),
  [K(5, 7, 'q3')]: R(excVal("7.2", "0.35", 2)),
  [K(5, 7, 'q4')]: needKey('7.2', '0.35', [["20"],["22"],["21"],["72"]]),
  [K(5, 8, 'q1')]: R(defVal("250", "0.7", 1)),
  [K(5, 8, 'q2')]: R(defVal("250", "0.9", 1)),
  [K(5, 8, 'q3')]: needKey('250', '0.7', [["357"],["359"],["358"],["250"]]),
  [K(5, 8, 'q4')]: needKey('250', '0.9', [["277"],["279"],["250"],["278"]]),
  [K(5, 8, 'q5')]: fewerKey('250', '0.7', '0.9', [["1"],["2"]]),
  [K(5, 9, 'q1')]: valEq('400', '9', [["9","400"],["400","9"],null,null]),
  [K(5, 9, 'q2')]: R(defVal("400", "9", 2)),
  [K(5, 9, 'q3')]: R(excVal("400", "9", 2)),
  [K(5, 9, 'q4')]: yn(classOf('400', '9') !== 'non'),
  [K(5, 9, 'q5')]: R(exactQuot('5', '16')),
  [K(5, 10, 'q1')]: R(defVal("8", "3", 3)),
  [K(5, 10, 'q2')]: R(excVal("8", "3", 3)),
  [K(5, 10, 'q3')]: yn(lessQ('2.666', '8', '3')),
  [K(5, 10, 'q4')]: betweenKey('2.66', '8', '3', [["2.667"],["2.659"],["2.665"],["2.67"]]),
};
