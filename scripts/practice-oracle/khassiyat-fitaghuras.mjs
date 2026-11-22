// Oracle du banc « khassiyat-fitaghuras » (خاصية فيثاغورس, 3AM, 2026-10-20) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, et jamais tirée de packages/core/arithmetic/pythagoras.js
// (le laboratoire) :
//  - un triangle rectangle est décrit par les DONNÉES de l'énoncé : le sommet de l'angle droit et les longueurs connues
//    (recopiées ici en dur, puis retrouvées dans le texte de l'exercice : une donnée absente de l'énoncé fait échouer
//    l'oracle). C'est l'ORACLE qui décide quel côté est l'hypoténuse (le côté qui ne passe pas par le sommet de l'angle
//    droit) et donc s'il faut ajouter ou soustraire les carrés ;
//  - les décimaux sont des rationnels exacts (BigInt, `q` de helpers.mjs) ; une racine est exacte quand le radicande est le
//    carré d'un décimal, sinon elle est arrondie AU PLUS PROCHE (demi vers le haut) à la précision demandée, par une racine
//    entière BigInt — jamais Math.sqrt ;
//  - « le triangle est-il rectangle ? » : l'oracle compare le carré du PLUS LONG côté (qu'il trouve lui-même) à la somme
//    des carrés des deux autres ;
//  - un QCM n'a qu'un seul choix juste, trouvé en confrontant chaque option (retapée ici sous forme de données) au calcul.
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { readFileSync, readdirSync } from 'node:fs';
import { R, C, q } from './helpers.mjs';

const ROOT = new URL('../../content/practice/3am/khassiyat-fitaghuras/', import.meta.url);
const exText = (L, n) => readFileSync(new URL(`level-${L}/ex-3am-khassiyat-fitaghuras-l${L}-${String(n).padStart(3, '0')}.json`, ROOT), 'utf8');

/* ── nombres exacts ─────────────────────────────────────────────────────── */
const Q = (v) => q(v);
const isqrt = (n) => { if (n < 0n) throw new Error('isqrt<0'); if (n < 2n) return n; let x = BigInt(Math.floor(Math.sqrt(Number(n)))); while (x * x > n) x -= 1n; while ((x + 1n) * (x + 1n) <= n) x += 1n; return x; };
/** rationnel exact → écriture décimale « 4.58 » (refuse un décimal illimité) */
function dec(v) {
  const x = Q(v); let n = x.n; const d = x.d; const neg = n < 0n; if (neg) n = -n;
  let k = 0; let p = 1n; while ((n * p) % d !== 0n) { k += 1; p *= 10n; if (k > 12) throw new Error(`décimal illimité ${x}`); }
  const s = String((n * p) / d).padStart(k + 1, '0');
  return `${neg ? '-' : ''}${k ? `${s.slice(0, -k)}.${s.slice(-k)}` : s}`;
}
/** √x exacte si x est le carré d'un rationnel, sinon null */
function sqrtExact(v) { const x = Q(v); const a = isqrt(x.n); const b = isqrt(x.d); return a * a === x.n && b * b === x.d ? Q(`${a}/${b}`) : null; }
/** √x arrondie au plus proche à p décimales (demi vers le haut) */
function sqrtRound(v, p) {
  const x = Q(v); const t = 10n ** BigInt(2 * p);
  const r = isqrt((x.n * t) / x.d); // ⌊√x · 10^p⌋
  const up = (2n * r + 1n) * (2n * r + 1n) * x.d <= 4n * x.n * t; // √x·10^p ≥ r + ½ ?
  return Q(`${up ? r + 1n : r}/${10n ** BigInt(p)}`);
}
/** rationnel arrondi au plus proche à p décimales */
function roundQ(v, p) { const x = Q(v).mul(10 ** p); let f = x.n / x.d; if (x.n < 0n && f * x.d !== x.n) f -= 1n; const frac = x.sub(Q(String(f))); if (frac.mul(2).sub(1).n >= 0n) f += 1n; return Q(`${f}/${10n ** BigInt(p)}`); }
const sq = (v) => Q(v).mul(Q(v));
const eq = (a, b) => Q(a).sub(Q(b)).isZero();

/* ── triangles ──────────────────────────────────────────────────────────── */
const norm = (s) => [...s].sort().join('');
/** un triangle rectangle : sommet de l'angle droit + longueurs connues ; `where` = [niveau, n°] pour vérifier l'énoncé */
function T(right, sides, where) {
  const text = where ? exText(...where) : null;
  for (const v of Object.values(sides)) {
    if (!text) break;
    const shown = String(v).replace('.', '{,}');
    const plain = String(v).replace('.', ',');
    if (!text.includes(shown) && !text.includes(plain)) throw new Error(`donnée ${v} absente de l'énoncé l${where[0]}-${where[1]}`);
  }
  const map = new Map(Object.entries(sides).map(([k, v]) => [norm(k), Q(v)]));
  return { right, map };
}
const isHyp = (t, name) => !name.includes(t.right);
/** carré du côté `name`, calculé par la propriété de Pythagore (l'oracle choisit + ou −) */
function sqSide(t, name) {
  const k = norm(name);
  if (t.map.has(k)) return t.map.get(k).mul(t.map.get(k));
  const known = [...t.map.entries()];
  if (known.length !== 2) throw new Error('il faut deux côtés connus');
  if (isHyp(t, name)) return known.reduce((s, [, v]) => s.add(v.mul(v)), Q(0));
  const hyp = known.find(([kk]) => !kk.includes(t.right));
  const leg = known.find(([kk]) => kk.includes(t.right));
  if (!hyp || !leg) throw new Error(`côté ${name} : il faut l'hypoténuse et l'autre côté de l'angle droit`);
  return hyp[1].mul(hyp[1]).sub(leg[1].mul(leg[1]));
}
const exact = (t, name) => { const r = sqrtExact(sqSide(t, name)); if (!r) throw new Error(`${name} n'est pas exact`); return r; };
const rounded = (t, name, p) => sqrtRound(sqSide(t, name), p);
const RE = (t, name) => R(dec(exact(t, name)));
const RR = (t, name, p) => R(dec(rounded(t, name, p)));
const RS = (t, name) => R(dec(sqSide(t, name)));

/* ── « le triangle est-il rectangle ? » (trois côtés donnés) ───────────── */
function triple(sides) {
  const e = Object.entries(sides).map(([k, v]) => [k, Q(v)]).sort((a, b) => (a[1].sub(b[1]).n < 0n ? -1 : 1));
  const [[, a], [, b], [L, c]] = e;
  return { longest: L, longSq: c.mul(c), sumSq: a.mul(a).add(b.mul(b)), right: c.mul(c).sub(a.mul(a).add(b.mul(b))).isZero() };
}

/* ── QCM ─────────────────────────────────────────────────────────────── */
const letter = (i) => C('ABCDEF'[i]);
const pick = (flags) => { const hits = flags.map((f, i) => (f ? i : -1)).filter((i) => i >= 0); if (hits.length !== 1) throw new Error(`QCM : ${hits.length} options justes`); return letter(hits[0]); };
/** une égalité est vraie si c'est Pythagore : ['sq', lhs, [a, b]] (lhs² = a² + b²), ['sqdiff', lhs, [h, a]] (lhs² = h² − a²), ['len', …] jamais */
function eqTrue(t, [kind, lhs, rhs]) {
  if (kind === 'sq') return isHyp(t, lhs) && rhs.every((s) => !isHyp(t, s)) && norm(rhs[0]) !== norm(rhs[1]);
  if (kind === 'sqdiff') return !isHyp(t, lhs) && isHyp(t, rhs[0]) && !isHyp(t, rhs[1]) && norm(rhs[1]) !== norm(lhs);
  return false; // somme ou différence de longueurs : jamais Pythagore
}
const pickEq = (t, opts) => pick(opts.map((o) => eqTrue(t, o)));
/** valeur exacte : options ['root', n] (√n) ou ['num', n] ; vraie si son carré vaut le carré du côté */
const pickVal = (s2, opts) => pick(opts.map(([k, v]) => (k === 'root' ? eq(v, s2) : eq(sq(v), s2))));
/** décision « rectangle ? » : options 'right' | 'notright' | 'undecidable' */
const pickNature = (sides, opts) => { const r = triple(sides).right; return pick(opts.map((o) => (o === 'notright' ? !r : o === 'right' ? r : false))); };
const pickHyp = (t, names) => pick(names.map((n) => isHyp(t, n)));
const pickLongest = (sides, names) => pick(names.map((n) => n === triple(sides).longest));
const cmp = (a, b) => Q(a).sub(Q(b)).n; // signe

const L = 'ex-3am-khassiyat-fitaghuras';
const K = (lvl, n, qq) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${qq}`;

/* ── données des exercices ──────────────────────────────────────────── */
const t1_1 = T('L', {}); // KLM rectangle en L, sans longueurs
const t1_2 = T('A', { AB: '4.5', AC: '6' }, [1, 2]);
const t1_3 = T('E', { DF: '6.5', DE: '2.5' }, [1, 3]);
const t1_4 = T('F', { FG: '1.2', EF: '3.5' }, [1, 4]);
const t1_5 = T('M', { MN: '2', MP: '5' }, [1, 5]);
const s1_6 = { RS: '4.5', ST: '6', RT: '7.6' };
const t1_7 = T('A', { AB: '9', AC: '40' }, [1, 7]);
const t1_8 = T('B', { AB: '2.1', BC: '2' }, [1, 8]);
const t1_9 = T('P', { PM: '1.6', PN: '3' }, [1, 9]);
const t1_10 = T('W', { TF: '4.5', WF: '1.2' }, [1, 10]);

const t2_1 = T('A', { AB: '1.8', BC: '8.2' }, [2, 1]);
const t2_2 = T('Q', { PQ: '12', PR: '13' }, [2, 2]);
const HJ = Q('4.8').div(2);
const t2_3 = T('H', { KJ: '4', HJ: dec(HJ) }, [2, 3]);
const s2_4 = { XY: '6.5', YZ: '4.2', XZ: '7.8' };
const t2_5 = T('B', { AB: '88', BC: '49.5' }, [2, 5]);
const t2_6 = T('F', { EF: '5', FG: '5' }, [2, 6]);
const s2_7 = { AB: '6', AC: '8', BC: '10.2' };
const t2_8 = T('H', { AB: '5', AH: '4.8' }, [2, 8]);
const t2_9 = T('N', { MN: '4.5', MP: '5.3' }, [2, 9]);
const t2_10 = T('H', { AB: '6', BH: dec(Q(6).div(2)) }, [2, 10]);

const t3_1a = T('A', { AC: '2.4', AD: '1.8' }, [3, 1]);
const t3_1b = T('A', { BC: '5.1', AC: '2.4' }, [3, 1]);
const t3_2 = T('P', { PK: '2.1', PT: '2.8' }, [3, 2]);
const s3_2 = { EF: '2', FG: '2.9', EG: '3.4' };
const t3_3 = T('B', { AB: '7.2', BC: '5.4' }, [3, 3]);
const t3_4a = T('C', { AC: '1.6', BC: '6.3' }, [3, 4]);
const t3_4b = T('D', { DE: '2', EF: '4' }, [3, 4]);
const s3_5 = { UV: '5.2', VW: '3.9', UW: '6.6' };
const t3_6 = T('O', { OA: '2.8', OB: '2.1' }, [3, 6]);
const t3_7 = T('H', { SR: '5.5', RH: dec(Q(6).div(2)) }, [3, 7]);
const t3_8a = T('B', { AB: '1.2', BC: '1.6' }, [3, 8]);
const t3_9 = T('A', { AB: '3', AC: '4.5' }, [3, 9]);
const s3_10 = { KL: '2.5', LM: '6', KM: '6.4' };

const t4_1a = T('M', { AB: '6.8', AM: '3.2' }, [4, 1]);
const t4_1b = T('B', { OB: dec(Q('6.8').div(2)), BH: '4.4' }, [4, 1]);
const t4_2 = T('M', { AB: '8.5', BM: '4' }, [4, 2]);
const t4_3 = T('B', { OH: '6', OB: dec(Q('7.2').div(2)) }, [4, 3]);
const t4_4 = T('I', { IA: dec(Q('6.4').div(2)), IM: '2.4' }, [4, 4]);
const t4_5 = T('B', { AB: '9.6', BC: '2.8' }, [4, 5]);
const t4_6 = T('T', { OP: '6.5', OT: '2.5' }, [4, 6]);
const t4_7 = T('A', { AB: '2.8', AC: '4.5' }, [4, 7]);
const t4_8 = T('A', { AB: '1200', AC: '1600' }); // énoncé en écriture 1,2 × 10³ et 1,6 × 10³ : vérifié à part
const s4_9 = { AB: '7', AC: '4.2', BC: '5.8' };
const t4_10 = T('S', { ST: '2.4', SP: '1.6' }, [4, 10]);

const t5_1a = T('B', { AB: '32', BC: '24' }, [5, 1]);
const s5_1 = { EF: '2', FG: '1.5', EG: '2.6' };
const t5_1b = T('F', { EG: '2.6', EF: '2' }, [5, 1]);
const t5_2 = T('A', { AB: '60', AC: '45' }, [5, 2]);
const t5_3a = T('P', { AP: '120', PB: '90' }, [5, 3]);
const t5_3b = T('K', { BK: '100', KC: '75' }, [5, 3]);
const t5_3c = T('H', { CH: '55', HE: '40' }, [5, 3]);
const t5_4a = T('A', { AB: '240', AC: '180' }, [5, 4]);
const AE54 = Q(240).mul(3); const AD54 = Q(180).mul(AE54).div(240); // tranche de Thalès (proportionnalité), hors leçon
const t5_4b = T('A', { AD: dec(AD54), AE: dec(AE54) }, [5, 4]);
const t5_5 = T('Z', { AZ: '1.8', ZC: '1.8' }, [5, 5]);
const t5_6 = T('A', { AE: '18', AG: '24' }, [5, 6]);
const t5_7 = T('A', { AE: '16', AG: '12' }, [5, 7]);
const t5_8a = T('B', { AB: '2.8', BC: '0.96' }, [5, 8]);
const t5_8b = T('B', { AB: '2.8', BD: '2.1' }, [5, 8]);
const s5_9 = { KL: '45', LM: '60', KM: '76' };
const t5_9 = T('L', { KL: '45', LM: '60' }, [5, 9]);
const t5_10a = T('H', { SP: '2.6', PH: dec(Q('3.2').div(2)) }, [5, 10]);
const t5_10b = T('B', { AB: '4', BC: '3.2' }, [5, 10]);

// 4-008 : l'énoncé écrit 1,2 × 10³ et 1,6 × 10³
if (!exText(4, 8).includes('1{,}2 \\\\times 10^3') || !exText(4, 8).includes('1{,}6 \\\\times 10^3')) throw new Error('l4-008 : données');

const tri = (sides) => triple(sides);
const sqRound = (v, p) => R(dec(sqrtRound(v, p)));

export const ORACLE = {
  /* ── Niveau 1 ── */
  [K(1, 1, 'q1')]: pickHyp(t1_1, ['KL', 'KM', 'LM']),
  [K(1, 1, 'q2')]: pickEq(t1_1, [['sq', 'KL', ['KM', 'LM']], ['len', 'KM', ['KL', 'LM']], ['sq', 'KM', ['KL', 'LM']]]),
  [K(1, 2, 'q1')]: RS(t1_2, 'BC'),
  [K(1, 2, 'q2')]: RE(t1_2, 'BC'),
  [K(1, 3, 'q1')]: RS(t1_3, 'EF'),
  [K(1, 3, 'q2')]: RE(t1_3, 'EF'),
  [K(1, 4, 'q1')]: RE(t1_4, 'EG'),
  [K(1, 5, 'q1')]: pickVal(sqSide(t1_5, 'NP'), [['num', '29'], ['root', '29'], ['root', '21'], ['num', '7']]),
  [K(1, 5, 'q2')]: RR(t1_5, 'NP', 2),
  [K(1, 6, 'q1')]: R(dec(tri(s1_6).longSq)),
  [K(1, 6, 'q2')]: R(dec(tri(s1_6).sumSq)),
  [K(1, 6, 'q3')]: pickNature(s1_6, ['right', 'notright', 'undecidable']),
  [K(1, 7, 'q1')]: R(dec(sq(9).add(sq(40)))), // la chaîne 9 x² + 40 x²
  [K(1, 7, 'q2')]: RE(t1_7, 'BC'),
  [K(1, 8, 'q1')]: pickEq(t1_8, [['len', 'AC', ['AB', 'BC']], ['sq', 'AC', ['AB', 'BC']], ['sq', 'BC', ['AC', 'AB']]]),
  [K(1, 8, 'q2')]: RE(t1_8, 'AC'),
  [K(1, 9, 'q1')]: pickEq(t1_9, [['sq', 'PM', ['MN', 'PN']], ['sq', 'PN', ['PM', 'MN']], ['sq', 'MN', ['PM', 'PN']]]),
  [K(1, 9, 'q2')]: RE(t1_9, 'MN'),
  [K(1, 10, 'q1')]: pickEq(t1_10, [['sq', 'TW', ['TF', 'WF']], ['sqdiff', 'TW', ['TF', 'WF']], ['len', 'TW', ['TF', 'WF']]]),
  [K(1, 10, 'q2')]: RR(t1_10, 'TW', 2),

  /* ── Niveau 2 ── */
  [K(2, 1, 'q1')]: RS(t2_1, 'AC'),
  [K(2, 1, 'q2')]: RE(t2_1, 'AC'),
  // le calcul de Karim pose QR comme hypoténuse : juste seulement si [QR] est l'hypoténuse
  [K(2, 2, 'q1')]: pick([isHyp(t2_2, 'QR'), isHyp(t2_2, 'PR') && !isHyp(t2_2, 'QR'), false]),
  [K(2, 2, 'q2')]: RE(t2_2, 'QR'),
  [K(2, 3, 'q1')]: R(dec(HJ)),
  [K(2, 3, 'q3')]: RE(t2_3, 'KH'),
  [K(2, 3, 'q4')]: R(dec(Q('4.8').mul(exact(t2_3, 'KH')).div(2))),
  [K(2, 4, 'q1')]: R(dec(tri(s2_4).longSq)),
  [K(2, 4, 'q2')]: R(dec(tri(s2_4).sumSq)),
  [K(2, 4, 'q3')]: pickNature(s2_4, ['right', 'notright', 'undecidable']),
  [K(2, 5, 'q1')]: RS(t2_5, 'AC'),
  [K(2, 5, 'q2')]: RR(t2_5, 'AC', 0),
  [K(2, 6, 'q1')]: RS(t2_6, 'EG'),
  [K(2, 6, 'q2')]: pickVal(sqSide(t2_6, 'EG'), [['num', '50'], ['num', '10'], ['root', '50']]),
  [K(2, 6, 'q3')]: RR(t2_6, 'EG', 1),
  [K(2, 7, 'q1')]: R(dec(tri(s2_7).longSq)),
  [K(2, 7, 'q2')]: R(dec(tri(s2_7).sumSq)),
  [K(2, 7, 'q3')]: pickNature(s2_7, ['right', 'notright', 'right']),
  [K(2, 8, 'q1')]: RS(t2_8, 'BH'),
  [K(2, 8, 'q2')]: RE(t2_8, 'BH'),
  // √(MP² − MN²) : un côté de l'angle droit, donc NP (pas son carré, pas l'hypoténuse MP)
  [K(2, 9, 'q1')]: pick(['NP²', 'NP', 'MP'].map((o) => o === (isHyp(t2_9, 'MP') && !isHyp(t2_9, 'NP') ? 'NP' : '?'))),
  [K(2, 9, 'q2')]: RE(t2_9, 'NP'),
  [K(2, 10, 'q1')]: R(dec(Q(6).div(2))),
  [K(2, 10, 'q2')]: pickVal(sqSide(t2_10, 'AH'), [['num', '3'], ['root', '45'], ['root', '27'], ['num', '27']]),
  [K(2, 10, 'q3')]: RR(t2_10, 'AH', 1),

  /* ── Niveau 3 ── */
  [K(3, 1, 'q1')]: RE(t3_1a, 'CD'),
  [K(3, 1, 'q2')]: RE(t3_1b, 'AB'),
  [K(3, 1, 'q3')]: R(dec(exact(t3_1b, 'AB').add(Q('1.8')))),
  [K(3, 1, 'q4')]: R(dec(tri({ BC: '5.1', CD: dec(exact(t3_1a, 'CD')), BD: dec(exact(t3_1b, 'AB').add(Q('1.8'))) }).longSq)),
  [K(3, 1, 'q5')]: R(dec(tri({ BC: '5.1', CD: dec(exact(t3_1a, 'CD')), BD: dec(exact(t3_1b, 'AB').add(Q('1.8'))) }).sumSq)),
  [K(3, 1, 'q6')]: pickNature({ BC: '5.1', CD: dec(exact(t3_1a, 'CD')), BD: dec(exact(t3_1b, 'AB').add(Q('1.8'))) }, ['right', 'notright', 'undecidable']),
  [K(3, 2, 'q1')]: RE(t3_2, 'KT'),
  [K(3, 2, 'q2')]: R(dec(exact(t3_2, 'KT').add(Q('2.1')))),
  [K(3, 2, 'q3')]: R(dec(tri(s3_2).longSq)),
  [K(3, 2, 'q4')]: R(dec(tri(s3_2).sumSq)),
  [K(3, 2, 'q5')]: pickNature(s3_2, ['right', 'notright', 'right']),
  [K(3, 3, 'q1')]: RE(t3_3, 'AC'),
  [K(3, 3, 'q2')]: R(dec(Q('7.2').add(Q('5.4')))),
  [K(3, 3, 'q3')]: R(dec(Q('7.2').add(Q('5.4')).sub(exact(t3_3, 'AC')))),
  [K(3, 4, 'q1')]: RE(t3_4a, 'AB'),
  [K(3, 4, 'q2')]: RS(t3_4b, 'DF'),
  [K(3, 4, 'q3')]: pickVal(sqSide(t3_4b, 'DF'), [['num', '12'], ['root', '20'], ['root', '12'], ['num', '2']]),
  [K(3, 4, 'q4')]: RR(t3_4b, 'DF', 2),
  [K(3, 5, 'q1')]: pickLongest(s3_5, ['UV', 'UW', 'VW']),
  [K(3, 5, 'q2')]: R(dec(tri(s3_5).longSq)),
  [K(3, 5, 'q3')]: R(dec(tri(s3_5).sumSq)),
  [K(3, 5, 'q4')]: pickNature(s3_5, ['right', 'notright', 'undecidable']),
  [K(3, 6, 'q2')]: RE(t3_6, 'AB'),
  [K(3, 6, 'q3')]: R(dec(exact(t3_6, 'AB').mul(4))),
  [K(3, 7, 'q1')]: R(dec(Q(6).div(2))),
  [K(3, 7, 'q2')]: pickVal(sqSide(t3_7, 'SH'), [['root', '39.25'], ['num', '21.25'], ['root', '21.25'], ['num', '2.5']]),
  [K(3, 7, 'q3')]: RR(t3_7, 'SH', 2),
  // aire = 6 × √21,25 / 2 = √(9 × 21,25) : arrondie à 0,01 sans arrondi intermédiaire
  [K(3, 7, 'q4')]: sqRound(Q(9).mul(sqSide(t3_7, 'SH')), 2),
  [K(3, 8, 'q1')]: RE(t3_8a, 'AC'),
  [K(3, 8, 'q2')]: pickEq(T('C', {}), [['sq', 'CD', ['AD', 'AC']], ['sq', 'AD', ['AC', 'CD']], ['len', 'AD', ['AC', 'CD']]]),
  [K(3, 8, 'q3')]: RE(T('C', { AC: dec(exact(t3_8a, 'AC')), CD: '2.1' }, [3, 8]), 'AD'),
  [K(3, 9, 'q1')]: RS(t3_9, 'BC'),
  [K(3, 9, 'q2')]: RR(t3_9, 'BC', 1),
  // périmètre = 7,5 + √29,25 arrondi à 0,01 : encadrement BigInt de √29,25 à 10⁻⁶ puis arrondi (aucun arrondi intermédiaire)
  [K(3, 9, 'q3')]: R(dec(perimRound(Q('7.5'), sqSide(t3_9, 'BC'), 1, 2))),
  [K(3, 10, 'q1')]: pickLongest(s3_10, ['LM', 'KM', 'KL']),
  [K(3, 10, 'q2')]: R(dec(tri(s3_10).longSq)),
  [K(3, 10, 'q3')]: R(dec(tri(s3_10).sumSq)),
  [K(3, 10, 'q4')]: pickNature(s3_10, ['right', 'right', 'notright']),

  /* ── Niveau 4 ── */
  [K(4, 1, 'q2')]: RE(t4_1a, 'MB'),
  [K(4, 1, 'q4')]: RR(t4_1b, 'OH', 1),
  // [AB] diamètre, M sur le cercle : rectangle en M (propriété du cercle, hors leçon)
  [K(4, 2, 'q1')]: pick(['A', 'M', 'isoM'].map((o) => o === 'M')),
  [K(4, 2, 'q2')]: RE(t4_2, 'AM'),
  [K(4, 2, 'q3')]: R(dec(Q('8.5').div(2))),
  [K(4, 3, 'q2')]: RE(t4_3, 'BH'),
  [K(4, 3, 'q3')]: R(dec(Q(6).div(2))), // médiane relative à l'hypoténuse [OH]
  [K(4, 4, 'q1')]: R(dec(Q('6.4').div(2))),
  [K(4, 4, 'q3')]: RE(t4_4, 'AM'),
  [K(4, 4, 'q4')]: RE(t4_4, 'AM'), // M sur la médiatrice : MB = MA
  [K(4, 4, 'q5')]: R(dec(Q('6.4').mul(Q('2.4')).div(2))),
  [K(4, 5, 'q1')]: RE(t4_5, 'AC'),
  [K(4, 5, 'q3')]: R(dec(exact(t4_5, 'AC').div(2))),
  // le couvercle (diamètre 9,9) couvre les coins ssi 9,9 ≥ AC
  [K(4, 5, 'q4')]: (() => { const covers = cmp('9.9', exact(t4_5, 'AC')) >= 0n; return pick([covers, !covers && eq(exact(t4_5, 'AC'), 10), covers]); })(),
  [K(4, 6, 'q2')]: RE(t4_6, 'PT'),
  [K(4, 6, 'q3')]: R(dec(Q('2.5').add(exact(t4_6, 'PT')).add(Q('6.5')))),
  [K(4, 7, 'q1')]: pickEq(t4_7, [['sq', 'BC', ['AB', 'AC']], ['len', 'BC', ['AB', 'AC']], ['sq', 'AC', ['BC', 'AB']]]),
  [K(4, 7, 'q2')]: RE(t4_7, 'BC'),
  [K(4, 7, 'q3')]: R(dec(exact(t4_7, 'BC').div(2))),
  [K(4, 8, 'q1')]: RS(t4_8, 'BC'),
  [K(4, 8, 'q2')]: RE(t4_8, 'BC'),
  [K(4, 8, 'q3')]: R(dec(Q(1200).add(Q(1600)).sub(exact(t4_8, 'BC')))),
  [K(4, 9, 'q1')]: R(dec(tri(s4_9).longSq)),
  [K(4, 9, 'q2')]: R(dec(tri(s4_9).sumSq)),
  [K(4, 9, 'q3')]: pickNature(s4_9, ['right', 'notright', 'undecidable']),
  [K(4, 10, 'q1')]: RS(t4_10, 'TP'),
  [K(4, 10, 'q2')]: RR(t4_10, 'TP', 2),
  [K(4, 10, 'q3')]: sqRound(Q(16).mul(sqSide(t4_10, 'TP')), 2), // 4 × √8,32 = √(16 × 8,32)
  // la bobine de 11,5 m suffit ssi 16 × TP² ≤ 11,5²
  [K(4, 10, 'q4')]: (() => { const enough = cmp(Q(16).mul(sqSide(t4_10, 'TP')), sq('11.5')) <= 0n; return pick([enough, !enough, enough]); })(),

  /* ── Niveau 5 ── */
  [K(5, 1, 'q1')]: RE(t5_1a, 'AC'),
  [K(5, 1, 'q2')]: R(dec(tri(s5_1).longSq)),
  [K(5, 1, 'q3')]: R(dec(tri(s5_1).sumSq)),
  [K(5, 1, 'q4')]: pickNature(s5_1, ['right', 'right', 'notright']),
  [K(5, 1, 'q6')]: RR(t5_1b, 'FG', 1),
  // éloigner le piquet ssi la distance « droite » dépasse 1,5 m
  [K(5, 1, 'q7')]: (() => { const farther = cmp(sqSide(t5_1b, 'FG'), sq('1.5')) > 0n; return pick([!farther, farther, false]); })(),
  [K(5, 2, 'q1')]: pickEq(t5_2, [['len', 'BC', ['AB', 'AC']], ['sq', 'AB', ['BC', 'AC']], ['sq', 'BC', ['AB', 'AC']]]),
  [K(5, 2, 'q2')]: RE(t5_2, 'BC'),
  [K(5, 2, 'q3')]: R(dec(Q(60).mul(45).div(2))),
  [K(5, 2, 'q5')]: R(dec(exact(t5_2, 'BC').div(2))),
  [K(5, 2, 'q6')]: R(dec(exact(t5_2, 'BC').div(2).mul(1200))),
  [K(5, 2, 'q7')]: (() => { const rest = exact(t5_2, 'BC').div(2).mul(1200).sub(42000); return pick([rest.n >= 0n && eq(rest, 3000), rest.n < 0n, rest.n < 0n]); })(),
  [K(5, 3, 'q1')]: RE(t5_3a, 'AB'),
  [K(5, 3, 'q2')]: RE(t5_3b, 'BC'),
  [K(5, 3, 'q3')]: pickVal(sqSide(t5_3c, 'CE'), [['num', '95'], ['root', '4625'], ['root', '1425'], ['num', '4625']]),
  [K(5, 3, 'q4')]: RR(t5_3c, 'CE', 1),
  [K(5, 3, 'q5')]: R(dec(perimRound(exact(t5_3a, 'AB').add(exact(t5_3b, 'BC')), sqSide(t5_3c, 'CE'), 1, 1))),
  // plus de 3,5 m = 350 cm ?
  [K(5, 3, 'q6')]: (() => { const total = perimRound(exact(t5_3a, 'AB').add(exact(t5_3b, 'BC')), sqSide(t5_3c, 'CE'), 1, 2); const more = cmp(total, 350) > 0n; return pick([more, !more && eq(roundQ(total, 0), 343), more]); })(),
  [K(5, 4, 'q1')]: RE(t5_4a, 'BC'),
  [K(5, 4, 'q3')]: R(dec(AD54.sub(180))),
  [K(5, 4, 'q4')]: RE(t5_4b, 'DE'),
  [K(5, 4, 'q5')]: R(dec(Q(240).add(exact(t5_4a, 'BC')).add(AD54.sub(180)).add(exact(t5_4b, 'DE')))),
  [K(5, 4, 'q6')]: (() => { const total = Q(240).add(exact(t5_4a, 'BC')).add(AD54.sub(180)).add(exact(t5_4b, 'DE')); const two = eq(total, 2000); return pick([two, !two && eq(total, 1800), two]); })(),
  [K(5, 5, 'q2')]: RS(t5_5, 'AC'),
  [K(5, 5, 'q3')]: pickVal(sqSide(t5_5, 'AC'), [['num', '6.48'], ['root', '6.48'], ['num', '3.6']]),
  [K(5, 5, 'q4')]: RR(t5_5, 'AC', 2),
  [K(5, 5, 'q5')]: R(dec(perimRound(Q(7), sqSide(t5_5, 'AC'), 2, 1))),
  // 12 m de garde-corps suffisent ssi 2√6,48 + 7 ≤ 12, i.e. 4 × 6,48 ≤ 25
  [K(5, 5, 'q6')]: (() => { const enough = cmp(Q(4).mul(sqSide(t5_5, 'AC')), sq(Q(12).sub(7))) <= 0n; return pick([enough, !enough, enough]); })(),
  [K(5, 6, 'q1')]: RS(t5_6, 'EG'),
  [K(5, 6, 'q2')]: RE(t5_6, 'EG'),
  [K(5, 6, 'q3')]: R(dec(exact(t5_6, 'EG').add(52))),
  [K(5, 6, 'q4')]: R(dec(exact(t5_6, 'EG').add(52).mul(750))),
  [K(5, 6, 'q5')]: (() => { const miss = exact(t5_6, 'EG').add(52).mul(750).sub(60000); return pick([false, miss.n > 0n && eq(miss, 1500), miss.n <= 0n]); })(),
  [K(5, 7, 'q1')]: RS(t5_7, 'EG'),
  [K(5, 7, 'q2')]: RE(t5_7, 'EG'),
  [K(5, 7, 'q3')]: R(dec(Q(64).mul(12).sub(Q(16).mul(12).div(2)))),
  [K(5, 7, 'q4')]: R(dec(Q(64).sub(16).add(64).mul(12).div(2))),
  [K(5, 7, 'q5')]: R(dec(exact(t5_7, 'EG').mul(4500))),
  [K(5, 7, 'q6')]: (() => { const cost = Q(64).mul(12).sub(Q(16).mul(12).div(2)).mul(120); const enough = cmp(cost, 80000) <= 0n; return pick([enough, !enough && eq(cost, 80640), enough]); })(),
  [K(5, 8, 'q1')]: RS(t5_8a, 'AC'),
  [K(5, 8, 'q2')]: RE(t5_8a, 'AC'),
  // la plus courte échelle ≥ AC parmi 2,75 / 3,10 / 3,80
  [K(5, 8, 'q3')]: (() => { const ac = exact(t5_8a, 'AC'); const ok = ['2.75', '3.1', '3.8'].filter((x) => cmp(x, ac) >= 0n); const best = ok.sort((a, b) => Number(cmp(a, b)))[0]; return pick(['2.75', '3.1', '3.8'].map((x) => x === best)); })(),
  [K(5, 8, 'q4')]: RE(t5_8b, 'AD'),
  [K(5, 8, 'q5')]: R(dec(exact(t5_8b, 'AD').add(Q('0.3')).mul(2).mul(45))),
  [K(5, 8, 'q6')]: (() => { const rest = Q(350).sub(exact(t5_8b, 'AD').add(Q('0.3')).mul(2).mul(45)); return pick([rest.n >= 0n && eq(rest, 8), rest.n < 0n, rest.n < 0n]); })(),
  [K(5, 9, 'q1')]: R(dec(tri(s5_9).longSq)),
  [K(5, 9, 'q2')]: R(dec(tri(s5_9).sumSq)),
  [K(5, 9, 'q3')]: pickNature(s5_9, ['right', 'right', 'notright']),
  [K(5, 9, 'q5')]: RE(t5_9, 'KM'),
  [K(5, 9, 'q6')]: R(dec(Q(76).sub(exact(t5_9, 'KM')))),
  [K(5, 9, 'q7')]: pickNature(s5_9, ['right', 'notright', 'right']),
  [K(5, 10, 'q1')]: R(dec(Q('3.2').div(2))),
  [K(5, 10, 'q2')]: pickVal(sqSide(t5_10a, 'SH'), [['num', '4.2'], ['root', '9.32'], ['root', '4.2'], ['num', '1']]),
  [K(5, 10, 'q3')]: RR(t5_10a, 'SH', 2),
  // debout ssi SH ≥ 1,9 (SH² ≥ 1,9²)
  [K(5, 10, 'q4')]: (() => { const stands = cmp(sqSide(t5_10a, 'SH'), sq('1.9')) >= 0n; return pick([stands && eq(sqrtRound(sqSide(t5_10a, 'SH'), 2), '2.05'), false, !stands]); })(),
  [K(5, 10, 'q5')]: RR(t5_10b, 'AC', 2),
  // la canne de 5,1 m tient sur la diagonale ssi 5,1² ≤ AC²
  [K(5, 10, 'q6')]: (() => { const fits = cmp(sq('5.1'), sqSide(t5_10b, 'AC')) <= 0n; return pick([!fits, fits, !fits]); })(),
};

/**
 * k·√s + a arrondi à p décimales SANS arrondi intermédiaire : √s est encadrée à 10⁻⁽ᵖ⁺⁶⁾ près par des racines entières
 * BigInt ; les deux bornes doivent donner le même arrondi (sinon l'oracle refuse de trancher).
 */
function perimRound(a, s, k, p) {
  const e = p + 6;
  const lo = sqrtFloor(s, e); const hi = lo.add(Q(`1/${10n ** BigInt(e)}`));
  const r1 = roundQ(Q(a).add(lo.mul(k)), p); const r2 = roundQ(Q(a).add(hi.mul(k)), p);
  if (!r1.sub(r2).isZero()) throw new Error('arrondi indécidable');
  return r1;
}
function sqrtFloor(v, p) { const x = Q(v); const t = 10n ** BigInt(2 * p); return Q(`${isqrt((x.n * t) / x.d)}/${10n ** BigInt(p)}`); }

// garde-fou : chaque fichier du banc a au moins une entrée (un exercice ajouté sans oracle se voit aussi dans le test)
for (const lvl of [1, 2, 3, 4, 5]) {
  for (const f of readdirSync(new URL(`level-${lvl}/`, ROOT))) {
    const id = f.replace('.json', '');
    if (!Object.keys(ORACLE).some((k) => k.startsWith(`${id}:`))) throw new Error(`aucune entrée d'oracle pour ${id}`);
  }
}
